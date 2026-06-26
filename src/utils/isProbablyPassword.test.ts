import { describe, expect, it } from "vitest";
import { isProbablyPassword } from "./isProbablyPassword";

describe("isProbablyPassword", () => {
  describe("returns true", () => {
    it("scores upper + lower + digit (3/4 criteria)", () => {
      expect(isProbablyPassword("HelloWorld1")).toBe(true);
    });

    it("scores upper + lower + special char (3/4 criteria)", () => {
      expect(isProbablyPassword("HelloWorld!")).toBe(true);
    });

    it("scores upper + digit + special char (3/4 criteria)", () => {
      expect(isProbablyPassword("HELLO1!")).toBe(true);
    });

    it("scores lower + digit + special char (3/4 criteria)", () => {
      expect(isProbablyPassword("hello1!")).toBe(true);
    });

    it("scores all 4 criteria", () => {
      expect(isProbablyPassword("Hello1!")).toBe(true);
    });

    it("handles a realistic password string", () => {
      expect(isProbablyPassword("P@ssw0rd123!")).toBe(true);
    });
  });

  describe("returns false", () => {
    it("scores only 2 criteria (upper + lower)", () => {
      expect(isProbablyPassword("HelloWorld")).toBe(false);
    });

    it("scores only 2 criteria (lower + digit)", () => {
      expect(isProbablyPassword("hello123")).toBe(false);
    });

    it("scores only 1 criterion (all lowercase)", () => {
      expect(isProbablyPassword("helloworld")).toBe(false);
    });

    it("scores only 1 criterion (all uppercase)", () => {
      expect(isProbablyPassword("HELLOWORLD")).toBe(false);
    });

    it("scores only 1 criterion (digits only)", () => {
      expect(isProbablyPassword("123456789")).toBe(false);
    });

    it("empty string", () => {
      expect(isProbablyPassword("")).toBe(false);
    });

    it("plain sentence text", () => {
      expect(isProbablyPassword("the quick brown fox")).toBe(false);
    });

    it("natural language sentence with commas and mixed case", () => {
      expect(
        isProbablyPassword("when I get an email, send me a direct message")
      ).toBe(false);
    });

    it("https URL even when it would otherwise score >= 3", () => {
      expect(isProbablyPassword("https://Hello1!example.com")).toBe(false);
    });

    it("http URL without https prefix still evaluated normally", () => {
      // "http://Hello1!" has upper+lower+digit+special → score 4, no https:// prefix
      expect(isProbablyPassword("http://Hello1!")).toBe(true);
    });
  });

  describe("https:// prefix rule", () => {
    it("rejects even a max-score string starting with https://", () => {
      expect(isProbablyPassword("https://P@ssw0rd!")).toBe(false);
    });

    it("accepts a string with https:// embedded but not at the start", () => {
      expect(isProbablyPassword("Pass1!https://")).toBe(true);
    });
  });
});
