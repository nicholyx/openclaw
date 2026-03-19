import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { expandHomePrefix } from "../infra/home-dir.js";

describe("tilde expansion in host tools", () => {
  const tempDir = path.join(os.tmpdir(), "openclaw-tilde-test");

  beforeEach(async () => {
    await fs.mkdir(tempDir, { recursive: true });
  });

  afterEach(async () => {
    await fs.rm(tempDir, { recursive: true });
  });

  describe("expandHomePrefix", () => {
    it("should expand ~ to home directory", () => {
      const result = expandHomePrefix("~/test.txt", { home: "/home/user" });
      expect(result).toBe("/home/user/test.txt");
    });

    it("should expand ~ without trailing path", () => {
      const result = expandHomePrefix("~", { home: "/home/user" });
      expect(result).toBe("/home/user");
    });

    it("should not expand non-tilde paths", () => {
      const result = expandHomePrefix("/absolute/path", { home: "/home/user" });
      expect(result).toBe("/absolute/path");
    });

    it("should handle paths without ~ prefix", () => {
      const result = expandHomePrefix("relative/path", { home: "/home/user" });
      expect(result).toBe("relative/path");
    });

    it("should handle Windows-style home paths with backslash", () => {
      const result = expandHomePrefix("~\\Documents\\file.txt", { home: "C:\\Users\\test" });
      expect(result).toBe("C:\\Users\\test\\Documents\\file.txt");
    });

    it("should handle real home directory expansion", () => {
      const home = os.homedir();
      const result = expandHomePrefix("~/Documents/file.txt");
      expect(result).toBe(path.join(home, "Documents", "file.txt"));
    });

    it("should handle tilde-only path", () => {
      const home = os.homedir();
      const result = expandHomePrefix("~");
      expect(result).toBe(home);
    });

    it("should handle paths with multiple slashes after tilde", () => {
      const result = expandHomePrefix("~///test.txt", { home: "/home/user" });
      // Should normalize multiple slashes
      expect(result).toBe("/home/user///test.txt");
    });
  });

  describe("path resolution demonstration", () => {
    it("demonstrates the problem: path.resolve does not expand ~", () => {
      // This test shows why we need expandHomePrefix
      // path.resolve does NOT expand ~
      const tildePath = "~/test.txt";
      const resolved = path.resolve(tildePath);
      // On Unix, path.resolve prepends cwd and keeps ~ as literal
      // This is the root cause of issue #50227
      expect(resolved).toContain("~");
    });

    it("shows the fix: expandHomePrefix before path.resolve", () => {
      const tildePath = "~/test.txt";
      const expanded = expandHomePrefix(tildePath);
      const resolved = path.resolve(expanded);
      // After expanding, path.resolve works correctly
      expect(resolved).not.toContain("~");
    });
  });
});
