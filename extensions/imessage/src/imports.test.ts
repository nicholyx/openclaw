import { describe, expect, it } from "vitest";

describe("iMessage imports", () => {
  it("runtime-api exports resolveOutboundSendDep and OutboundSendDeps", async () => {
    // This test verifies that runtime-api.ts exports the required functions
    // that channel.runtime.ts needs to import
    const runtimeApi = await import("../runtime-api.js");

    // Should export resolveOutboundSendDep function
    expect(typeof runtimeApi.resolveOutboundSendDep).toBe("function");

    // Should export OutboundSendDeps type (verified by TypeScript)
    expect(runtimeApi.resolveOutboundSendDep).toBeDefined();
  });

  it("channel.runtime can import from relative path", async () => {
    // This test verifies that channel.runtime.ts can successfully import
    // resolveOutboundSendDep from the relative path ../runtime-api.js
    // instead of from openclaw/plugin-sdk/channel-runtime
    const channelRuntime = await import("./channel.runtime.js");

    // The module should load successfully without throwing
    // "Cannot find package 'openclaw'" error
    expect(channelRuntime).toBeDefined();

    // Should export the functions that use resolveOutboundSendDep
    expect(typeof channelRuntime.sendIMessageOutbound).toBe("function");
    expect(typeof channelRuntime.notifyIMessageApproval).toBe("function");
  });

  it("channel.ts (main plugin entry) can import from relative path", async () => {
    // This test verifies that the main plugin entry point channel.ts
    // can be imported without "Cannot find package 'openclaw'" error
    const channel = await import("./channel.js");

    // The module should load successfully
    expect(channel).toBeDefined();

    // Should export the main plugin
    expect(channel.imessagePlugin).toBeDefined();
  });

  it("outbound-adapter can import from relative path", async () => {
    // This test verifies that outbound-adapter.ts can successfully import
    // resolveOutboundSendDep from the relative path ../runtime-api.js
    const outboundAdapter = await import("./outbound-adapter.js");

    // The module should load successfully
    expect(outboundAdapter).toBeDefined();

    // Should export the outbound adapter
    expect(outboundAdapter.imessageOutbound).toBeDefined();
  });
});
