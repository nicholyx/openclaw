import { describe, expect, it } from "vitest";
import { resolveConversationIdFromTargets } from "./conversation-id.js";

describe("resolveConversationIdFromTargets", () => {
  it("prefers explicit thread id when present", () => {
    const resolved = resolveConversationIdFromTargets({
      threadId: "123456789",
      targets: ["channel:987654321"],
    });
    expect(resolved).toBe("123456789");
  });

  it("extracts channel ids from channel: targets", () => {
    const resolved = resolveConversationIdFromTargets({
      targets: ["channel:987654321"],
    });
    expect(resolved).toBe("987654321");
  });

  it("extracts room ids from room: targets", () => {
    const resolved = resolveConversationIdFromTargets({
      targets: ["room:!room:example"],
    });
    expect(resolved).toBe("!room:example");
  });

  it("extracts room ids from matrix-scoped room targets", () => {
    const resolved = resolveConversationIdFromTargets({
      targets: ["matrix:room:!room:example"],
    });
    expect(resolved).toBe("!room:example");
  });

  it("extracts ids from Discord channel mentions", () => {
    const resolved = resolveConversationIdFromTargets({
      targets: ["<#1475250310120214812>"],
    });
    expect(resolved).toBe("1475250310120214812");
  });

  it("accepts raw numeric ids", () => {
    const resolved = resolveConversationIdFromTargets({
      targets: ["1475250310120214812"],
    });
    expect(resolved).toBe("1475250310120214812");
  });

  it("returns undefined for non-channel targets", () => {
    const resolved = resolveConversationIdFromTargets({
      targets: ["user:alice", "general"],
    });
    expect(resolved).toBeUndefined();
  });
});
