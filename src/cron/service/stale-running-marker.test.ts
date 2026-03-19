import { describe, expect, it, vi } from "vitest";
import type { CronJob, CronJobState, CronPayload } from "../types.js";
import { recomputeNextRunsForMaintenance } from "./jobs.js";
import type { CronServiceState } from "./state.js";
import { DEFAULT_JOB_TIMEOUT_MS, AGENT_TURN_SAFETY_TIMEOUT_MS } from "./timeout-policy.js";

/**
 * Tests for issue #50280: Cron manual run stuck after job timeout — stale runningAtMs not cleared
 *
 * When a cron job times out, the stale runningAtMs marker should be cleared
 * so that subsequent manual runs can proceed.
 */
describe("stale runningAtMs marker cleanup", () => {
  const createMockState = (jobs: CronJob[]): CronServiceState => {
    return {
      store: { version: 1, jobs },
      timer: null,
      running: false,
      deps: {
        nowMs: () => Date.now(),
        log: {
          info: vi.fn(),
          warn: vi.fn(),
          error: vi.fn(),
          debug: vi.fn(),
        } as unknown as CronServiceState["deps"]["log"],
        cronEnabled: true,
        defaultAgentId: "test-agent",
      },
    } as unknown as CronServiceState;
  };

  const createJob = (
    state: Partial<CronJobState> = {},
    payload: Partial<CronPayload> = {},
  ): CronJob => {
    return {
      id: "test-job",
      name: "Test Job",
      enabled: true,
      createdAtMs: Date.now() - 60_000,
      updatedAtMs: Date.now() - 60_000,
      agentId: "test-agent",
      schedule: { kind: "every", everyMs: 60_000 },
      sessionTarget: "main",
      wakeMode: "next-heartbeat",
      payload: { kind: "systemEvent", text: "test", ...payload },
      state: {
        nextRunAtMs: Date.now(),
        ...state,
      },
    } as CronJob;
  };

  describe("recomputeNextRunsForMaintenance", () => {
    it("should clear stale runningAtMs marker when elapsed time exceeds job timeout", () => {
      const now = Date.now();
      // Create a job with a stale runningAtMs marker that is older than the default timeout
      const staleRunningAtMs = now - DEFAULT_JOB_TIMEOUT_MS - 60_000; // 1 minute over timeout
      const job = createJob({
        runningAtMs: staleRunningAtMs,
        nextRunAtMs: now - 30_000, // past due
      });

      const state = createMockState([job]);

      // Run maintenance recompute
      const changed = recomputeNextRunsForMaintenance(state, { nowMs: now });

      // The stale runningAtMs should be cleared
      expect(job.state.runningAtMs).toBeUndefined();
      expect(changed).toBe(true);
    });

    it("should not clear runningAtMs marker when still within timeout period", () => {
      const now = Date.now();
      // Create a job with a runningAtMs marker that is still within the timeout period
      const recentRunningAtMs = now - 60_000; // 1 minute ago, well within 10 minute timeout
      const job = createJob({
        runningAtMs: recentRunningAtMs,
        nextRunAtMs: now + 60_000, // future
      });

      const state = createMockState([job]);

      // Run maintenance recompute
      recomputeNextRunsForMaintenance(state, { nowMs: now });

      // The runningAtMs should NOT be cleared (job is still legitimately running)
      expect(job.state.runningAtMs).toBe(recentRunningAtMs);
    });

    it("should clear stale runningAtMs marker for agentTurn jobs with custom timeout", () => {
      const now = Date.now();
      const customTimeoutMs = 5 * 60_000; // 5 minutes
      // Create an agentTurn job with custom timeout that has a stale marker
      const staleRunningAtMs = now - customTimeoutMs - 60_000; // 1 minute over custom timeout
      const job: CronJob = {
        ...createJob({
          runningAtMs: staleRunningAtMs,
          nextRunAtMs: now - 30_000,
        }),
        payload: {
          kind: "agentTurn",
          message: "test",
          timeoutSeconds: customTimeoutMs / 1000,
        },
      };

      const state = createMockState([job]);

      // Run maintenance recompute
      const changed = recomputeNextRunsForMaintenance(state, { nowMs: now });

      // The stale runningAtMs should be cleared
      expect(job.state.runningAtMs).toBeUndefined();
      expect(changed).toBe(true);
    });

    it("should use AGENT_TURN_SAFETY_TIMEOUT_MS for agentTurn jobs without explicit timeout", () => {
      const now = Date.now();
      // Create an agentTurn job without explicit timeout
      // AGENT_TURN_SAFETY_TIMEOUT_MS is 60 minutes
      const staleRunningAtMs = now - AGENT_TURN_SAFETY_TIMEOUT_MS - 60_000; // 1 minute over safety timeout
      const job: CronJob = {
        ...createJob({
          runningAtMs: staleRunningAtMs,
          nextRunAtMs: now - 30_000,
        }),
        payload: {
          kind: "agentTurn",
          message: "test",
          // No explicit timeoutSeconds
        },
      };

      const state = createMockState([job]);

      // Run maintenance recompute
      const changed = recomputeNextRunsForMaintenance(state, { nowMs: now });

      // The stale runningAtMs should be cleared
      expect(job.state.runningAtMs).toBeUndefined();
      expect(changed).toBe(true);
    });

    it("should not clear runningAtMs for agentTurn jobs still within AGENT_TURN_SAFETY_TIMEOUT_MS", () => {
      const now = Date.now();
      // Create an agentTurn job that has been running for 30 minutes (within 60 minute safety timeout)
      const recentRunningAtMs = now - 30 * 60_000;
      const job: CronJob = {
        ...createJob({
          runningAtMs: recentRunningAtMs,
          nextRunAtMs: now + 60_000,
        }),
        payload: {
          kind: "agentTurn",
          message: "test",
        },
      };

      const state = createMockState([job]);

      // Run maintenance recompute
      recomputeNextRunsForMaintenance(state, { nowMs: now });

      // The runningAtMs should NOT be cleared (job is still legitimately running)
      expect(job.state.runningAtMs).toBe(recentRunningAtMs);
    });
  });
});
