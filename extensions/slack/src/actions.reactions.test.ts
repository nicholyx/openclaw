import type { WebClient } from "@slack/web-api";
import { describe, expect, it, vi } from "vitest";
import { reactSlackMessage, removeSlackReaction } from "./actions.js";

function createClient() {
  return {
    reactions: {
      add: vi.fn(async () => ({})),
      remove: vi.fn(async () => ({})),
    },
  } as unknown as WebClient & {
    reactions: {
      add: ReturnType<typeof vi.fn>;
      remove: ReturnType<typeof vi.fn>;
    };
  };
}

function createSlackApiError(errorCode: string): Error {
  const error = new Error(`Slack API error: ${errorCode}`);
  (error as any).data = { error: errorCode };
  return error;
}

describe("reactSlackMessage", () => {
  it("adds a reaction to a message", async () => {
    const client = createClient();

    await reactSlackMessage("C1", "123.456", "thumbsup", { client, token: "xoxb-test" });

    expect(client.reactions.add).toHaveBeenCalledWith({
      channel: "C1",
      timestamp: "123.456",
      name: "thumbsup",
    });
  });

  it("normalizes emoji with colons", async () => {
    const client = createClient();

    await reactSlackMessage("C1", "123.456", ":thumbsup:", { client, token: "xoxb-test" });

    expect(client.reactions.add).toHaveBeenCalledWith({
      channel: "C1",
      timestamp: "123.456",
      name: "thumbsup",
    });
  });

  it("silently ignores already_reacted error", async () => {
    const client = createClient();
    client.reactions.add.mockRejectedValueOnce(createSlackApiError("already_reacted"));

    // Should not throw
    await expect(
      reactSlackMessage("C1", "123.456", "thumbsup", { client, token: "xoxb-test" }),
    ).resolves.toBeUndefined();

    expect(client.reactions.add).toHaveBeenCalled();
  });

  it("throws other errors", async () => {
    const client = createClient();
    const otherError = createSlackApiError("invalid_emoji");
    client.reactions.add.mockRejectedValueOnce(otherError);

    await expect(
      reactSlackMessage("C1", "123.456", "invalid", { client, token: "xoxb-test" }),
    ).rejects.toThrow("Slack API error: invalid_emoji");
  });
});

describe("removeSlackReaction", () => {
  it("removes a reaction from a message", async () => {
    const client = createClient();

    await removeSlackReaction("C1", "123.456", "thumbsup", { client, token: "xoxb-test" });

    expect(client.reactions.remove).toHaveBeenCalledWith({
      channel: "C1",
      timestamp: "123.456",
      name: "thumbsup",
    });
  });

  it("normalizes emoji with colons", async () => {
    const client = createClient();

    await removeSlackReaction("C1", "123.456", ":thumbsup:", { client, token: "xoxb-test" });

    expect(client.reactions.remove).toHaveBeenCalledWith({
      channel: "C1",
      timestamp: "123.456",
      name: "thumbsup",
    });
  });

  it("silently ignores no_reaction error", async () => {
    const client = createClient();
    client.reactions.remove.mockRejectedValueOnce(createSlackApiError("no_reaction"));

    // Should not throw
    await expect(
      removeSlackReaction("C1", "123.456", "thumbsup", { client, token: "xoxb-test" }),
    ).resolves.toBeUndefined();

    expect(client.reactions.remove).toHaveBeenCalled();
  });

  it("throws other errors", async () => {
    const client = createClient();
    const otherError = createSlackApiError("no_item");
    client.reactions.remove.mockRejectedValueOnce(otherError);

    await expect(
      removeSlackReaction("C1", "123.456", "thumbsup", { client, token: "xoxb-test" }),
    ).rejects.toThrow("Slack API error: no_item");
  });
});
