import { TagRegistry, StoryFeatures } from "../src/js/tag-registry.js";

describe("TagRegistry", () => {
  describe("Constants", () => {
    test("TAG_PHASE has expected values", () => {
      expect(TagRegistry.TAG_PHASE.GLOBAL).toBe("global");
      expect(TagRegistry.TAG_PHASE.DISCOVERY).toBe("discovery");
      expect(TagRegistry.TAG_PHASE.CONTENT).toBe("content");
      expect(TagRegistry.TAG_PHASE.EFFECT).toBe("effect");
    });

    test("TAG_VALUE has expected values", () => {
      expect(TagRegistry.TAG_VALUE.REQUIRED).toBe("required");
      expect(TagRegistry.TAG_VALUE.OPTIONAL).toBe("optional");
      expect(TagRegistry.TAG_VALUE.NONE).toBe("none");
    });

    test("all TAGS have required properties", () => {
      for (const def of Object.values(TagRegistry.TAGS)) {
        expect(def.names).toBeDefined();
        expect(Array.isArray(def.names)).toBe(true);
        expect(def.names.length).toBeGreaterThan(0);
        expect(def.phase).toBeDefined();
        expect(def.value).toBeDefined();
        expect(def.description).toBeDefined();
      }
    });

    test("TAG_LOOKUP contains all aliases", () => {
      for (const [key, def] of Object.entries(TagRegistry.TAGS)) {
        for (const alias of def.names) {
          expect(TagRegistry.TAG_LOOKUP[alias.toUpperCase()]).toBe(key);
        }
      }
    });
  });

  describe("splitPropertyTag", () => {
    test("splits tag with value", () => {
      const result = TagRegistry.splitPropertyTag("IMAGE: hero.png");
      expect(result).toEqual({
        property: "IMAGE",
        val: "hero.png",
      });
    });

    test("trims whitespace from property and value", () => {
      const result = TagRegistry.splitPropertyTag("  IMAGE  :   hero.png   ");
      expect(result).toEqual({
        property: "IMAGE",
        val: "hero.png",
      });
    });

    test("returns null for tag without colon", () => {
      const result = TagRegistry.splitPropertyTag("CLEAR");
      expect(result).toBeNull();
    });

    test("returns null for empty string", () => {
      expect(TagRegistry.splitPropertyTag("")).toBeNull();
    });

    test("returns null for null input", () => {
      expect(TagRegistry.splitPropertyTag(null)).toBeNull();
    });

    test("handles multiple colons (splits on first only)", () => {
      const result = TagRegistry.splitPropertyTag("IMAGE: hero.png : alt text");
      expect(result).toEqual({
        property: "IMAGE",
        val: "hero.png : alt text",
      });
    });

    test("handles colon with empty value", () => {
      const result = TagRegistry.splitPropertyTag("IMAGE:");
      expect(result).toEqual({
        property: "IMAGE",
        val: "",
      });
    });

    test("handles double colon", () => {
      const result = TagRegistry.splitPropertyTag("IMAGE::");
      expect(result).toEqual({
        property: "IMAGE",
        val: ":",
      });
    });

    test("handles colon only", () => {
      const result = TagRegistry.splitPropertyTag(":");
      expect(result).toEqual({
        property: "",
        val: "",
      });
    });

    test("handles colon at start", () => {
      const result = TagRegistry.splitPropertyTag(":value");
      expect(result).toEqual({
        property: "",
        val: "value",
      });
    });

    test("returns null for undefined input", () => {
      expect(TagRegistry.splitPropertyTag(undefined)).toBeNull();
    });

    test("returns null for number input", () => {
      expect(TagRegistry.splitPropertyTag(123)).toBeNull();
    });

    test("returns null for object input", () => {
      expect(TagRegistry.splitPropertyTag({ prop: "val" })).toBeNull();
    });

    // Whitespace-only
    test("returns null for whitespace-only string", () => {
      expect(TagRegistry.splitPropertyTag("   ")).toBeNull();
    });
  });

  describe("isKnownTag", () => {
    test("recognizes IMAGE tag", () => {
      expect(TagRegistry.isKnownTag("IMAGE")).toBe(true);
    });

    test("recognizes tag aliases (case-insensitive)", () => {
      expect(TagRegistry.isKnownTag("image")).toBe(true);
      expect(TagRegistry.isKnownTag("Image")).toBe(true);
      expect(TagRegistry.isKnownTag("img")).toBe(true);
      expect(TagRegistry.isKnownTag("PIC")).toBe(true);
      expect(TagRegistry.isKnownTag("picture")).toBe(true);
    });

    test("returns false for unknown tags", () => {
      expect(TagRegistry.isKnownTag("FOOBAR")).toBe(false);
      expect(TagRegistry.isKnownTag("INVALID")).toBe(false);
    });

    test("returns false for null input", () => {
      expect(TagRegistry.isKnownTag(null)).toBe(false);
    });

    test("returns false for undefined input", () => {
      expect(TagRegistry.isKnownTag(undefined)).toBe(false);
    });

    test("returns false for empty string", () => {
      expect(TagRegistry.isKnownTag("")).toBe(false);
    });

    test("returns false for whitespace-padded tag", () => {
      expect(TagRegistry.isKnownTag(" IMAGE ")).toBe(false);
    });
  });

  describe("getTagDef", () => {
    test("returns tag definition for known tag", () => {
      const def = TagRegistry.getTagDef("IMAGE");
      expect(def).not.toBeNull();
      expect(def.names).toContain("IMAGE");
      expect(def.value).toBe("required");
    });

    test("returns same definition for aliases", () => {
      const def1 = TagRegistry.getTagDef("IMAGE");
      const def2 = TagRegistry.getTagDef("IMG");
      const def3 = TagRegistry.getTagDef("pic");
      expect(def1).toBe(def2);
      expect(def2).toBe(def3);
    });

    test("returns null for unknown tag", () => {
      expect(TagRegistry.getTagDef("FOOBAR")).toBeNull();
    });

    test("handles null input", () => {
      expect(TagRegistry.getTagDef(null)).toBeNull();
    });

    test("handles undefined input", () => {
      expect(TagRegistry.getTagDef(undefined)).toBeNull();
    });

    test("handles empty string", () => {
      expect(TagRegistry.getTagDef("")).toBeNull();
    });

    test("does not trim whitespace", () => {
      expect(TagRegistry.getTagDef(" IMAGE ")).toBeNull();
    });
  });

  describe("validateTagValue", () => {
    test("valid when required-value tag has value", () => {
      const def = TagRegistry.getTagDef("IMAGE");
      const result = TagRegistry.validateTagValue(def, "hero.png");
      expect(result.valid).toBe(true);
      expect(result.error).toBeNull();
    });

    test("invalid when required-value tag missing value", () => {
      const def = TagRegistry.getTagDef("IMAGE");
      const result = TagRegistry.validateTagValue(def, "");
      expect(result.valid).toBe(false);
      expect(result.error).toContain("requires a value");
    });

    test("valid when none-value tag has no value", () => {
      const def = TagRegistry.getTagDef("CLEAR");
      const result = TagRegistry.validateTagValue(def, "");
      expect(result.valid).toBe(true);
    });

    test("invalid when none-value tag has value", () => {
      const def = TagRegistry.getTagDef("CLEAR");
      const result = TagRegistry.validateTagValue(def, "something");
      expect(result.valid).toBe(false);
      expect(result.error).toContain("should not have a value");
    });

    test("valid when optional-value tag has value", () => {
      const def = TagRegistry.getTagDef("SPECIAL_PAGE");
      const result = TagRegistry.validateTagValue(def, "About");
      expect(result.valid).toBe(true);
      expect(result.error).toBeNull();
    });

    test("valid when optional-value tag has no value", () => {
      const def = TagRegistry.getTagDef("SPECIAL_PAGE");
      const result = TagRegistry.validateTagValue(def, "");
      expect(result.valid).toBe(true);
      expect(result.error).toBeNull();
    });

    test("valid when tagDef is null", () => {
      const result = TagRegistry.validateTagValue(null, "anything");
      expect(result.valid).toBe(true);
      expect(result.error).toBeNull();
    });

    test("treats whitespace-only as empty value", () => {
      const def = TagRegistry.getTagDef("IMAGE");
      const result = TagRegistry.validateTagValue(def, "   ");
      expect(result.valid).toBe(false);
      expect(result.error).toContain("requires a value");
    });

    test("whitespace-only is valid for none-value tag", () => {
      const def = TagRegistry.getTagDef("CLEAR");
      const result = TagRegistry.validateTagValue(def, "   ");
      expect(result.valid).toBe(true);
    });

    test("handles null tagValue", () => {
      const def = TagRegistry.getTagDef("IMAGE");
      const result = TagRegistry.validateTagValue(def, null);
      expect(result.valid).toBe(false);
      expect(result.error).toContain("requires a value");
    });

    test("handles undefined tagValue", () => {
      const def = TagRegistry.getTagDef("IMAGE");
      const result = TagRegistry.validateTagValue(def, undefined);
      expect(result.valid).toBe(false);
      expect(result.error).toContain("requires a value");
    });
  });

  describe("parseTag", () => {
    test("parses tag with value", () => {
      const result = TagRegistry.parseTag("IMAGE: hero.png");
      expect(result.tagDef).not.toBeNull();
      expect(result.tagDef).toBe(TagRegistry.TAGS.IMAGE);
      expect(result.tagValue).toBe("hero.png");
      expect(result.invalid).toBe(false);
    });

    test("parses tag without value", () => {
      const result = TagRegistry.parseTag("CLEAR");
      expect(result.tagDef).not.toBeNull();
      expect(result.tagDef).toBe(TagRegistry.TAGS.CLEAR);
      expect(result.tagValue).toBe("");
      expect(result.invalid).toBe(false);
    });

    test("returns invalid for required tag missing value", () => {
      const result = TagRegistry.parseTag("IMAGE:");
      expect(result.tagDef).not.toBeNull();
      expect(result.tagDef).toBe(TagRegistry.TAGS.IMAGE);
      expect(result.invalid).toBe(true);
      expect(result.error).toContain("requires a value");
    });

    test("handles unknown tag gracefully", () => {
      const result = TagRegistry.parseTag("FOO: bar");
      expect(result.tagDef).toBeNull();
      expect(result.invalid).toBe(false);
    });

    test("handles empty string input", () => {
      const result = TagRegistry.parseTag("");
      expect(result.tagDef).toBeNull();
      expect(result.invalid).toBe(false);
    });

    test("handles null input", () => {
      const result = TagRegistry.parseTag(null);
      expect(result.tagDef).toBeNull();
      expect(result.tagValue).toBe("");
    });

    test("parses tag case-insensitively", () => {
      const result = TagRegistry.parseTag("image: hero.png");
      expect(result.tagDef).toBe(TagRegistry.TAGS.IMAGE);
      expect(result.tagValue).toBe("hero.png");
      expect(result.invalid).toBe(false);
    });

    test("parses tag aliases", () => {
      const result = TagRegistry.parseTag("IMG: hero.png");
      expect(result.tagDef).toBe(TagRegistry.TAGS.IMAGE);
      expect(result.tagValue).toBe("hero.png");
    });

    test("returns invalid when none-value tag has value", () => {
      const result = TagRegistry.parseTag("CLEAR: something");
      expect(result.tagDef).toBe(TagRegistry.TAGS.CLEAR);
      expect(result.invalid).toBe(true);
      expect(result.error).toContain("should not have a value");
    });

    test("parses optional-value tag without value", () => {
      const result = TagRegistry.parseTag("SPECIAL_PAGE");
      expect(result.tagDef).toBe(TagRegistry.TAGS.SPECIAL_PAGE);
      expect(result.tagValue).toBe("");
      expect(result.invalid).toBe(false);
    });

    test("parses optional-value tag with value", () => {
      const result = TagRegistry.parseTag("SPECIAL_PAGE: About");
      expect(result.tagDef).toBe(TagRegistry.TAGS.SPECIAL_PAGE);
      expect(result.tagValue).toBe("About");
      expect(result.invalid).toBe(false);
    });

    test("trims whitespace from tag and value", () => {
      const result = TagRegistry.parseTag("  IMAGE  :   hero.png   ");
      expect(result.tagDef).toBe(TagRegistry.TAGS.IMAGE);
      expect(result.tagValue).toBe("hero.png");
    });

    test("preserves colons in value", () => {
      const result = TagRegistry.parseTag("IMAGE: https://example.com/img.png");
      expect(result.tagValue).toBe("https://example.com/img.png");
    });

    test("handles undefined input", () => {
      const result = TagRegistry.parseTag(undefined);
      expect(result.tagDef).toBeNull();
      expect(result.tagValue).toBe("");
    });

    test("handles number input", () => {
      const result = TagRegistry.parseTag(123);
      expect(result.tagDef).toBeNull();
      expect(result.tagValue).toBe("");
    });

    test("handles object input", () => {
      const result = TagRegistry.parseTag({ tag: "IMAGE" });
      expect(result.tagDef).toBeNull();
      expect(result.tagValue).toBe("");
    });
  });

  describe("getTagsByPhase", () => {
    test("returns global phase tags", () => {
      const tags = TagRegistry.getTagsByPhase("global");
      expect(tags).toContain("THEME");
      expect(tags).toContain("AUTHOR");
      expect(tags).not.toContain("IMAGE"); // IMAGE is content phase
    });

    test("returns discovery phase tags", () => {
      const tags = TagRegistry.getTagsByPhase("discovery");
      expect(tags).toContain("SPECIAL_PAGE");
      expect(tags).not.toContain("THEME"); // THEME is global phase
    });

    test("returns content phase tags", () => {
      const tags = TagRegistry.getTagsByPhase("content");
      expect(tags).toContain("IMAGE");
      expect(tags).toContain("STATBAR");
      expect(tags).not.toContain("CLEAR"); // CLEAR is effect phase
    });

    test("returns effect phase tags", () => {
      const tags = TagRegistry.getTagsByPhase("effect");
      expect(tags).toContain("CLEAR");
      expect(tags).toContain("AUDIO");
      expect(tags).not.toContain("IMAGE"); // IMAGE is content phase
    });

    test("returns empty array for invalid phase", () => {
      const tags = TagRegistry.getTagsByPhase("INVALID");
      expect(tags).toEqual([]);
    });

    test("handles null input", () => {
      const tags = TagRegistry.getTagsByPhase(null);
      expect(tags).toEqual([]);
    });
  });

  describe("hasSpecialPageTag", () => {
    test("returns true when SPECIAL_PAGE tag present", () => {
      expect(TagRegistry.hasSpecialPageTag(["SPECIAL_PAGE"])).toBe(true);
      expect(TagRegistry.hasSpecialPageTag(["SPECIAL_PAGE: About"])).toBe(true);
      expect(TagRegistry.hasSpecialPageTag(["SPECIAL_PAGE", "About"])).toBe(
        true
      );
      expect(TagRegistry.hasSpecialPageTag(["About", "SPECIAL_PAGE"])).toBe(
        true
      );
    });

    test("handles aliases for SPECIAL_PAGE tag", () => {
      expect(TagRegistry.hasSpecialPageTag(["Special_page"])).toBe(true);
      expect(TagRegistry.hasSpecialPageTag(["PAGE"])).toBe(true);
      expect(TagRegistry.hasSpecialPageTag(["PAGE: About"])).toBe(true);
    });

    test("returns false when no SPECIAL_PAGE tag", () => {
      expect(TagRegistry.hasSpecialPageTag(["IMAGE: test.png"])).toBe(false);
      expect(TagRegistry.hasSpecialPageTag(["", ""])).toBe(false);
    });

    test("returns false for empty array", () => {
      expect(TagRegistry.hasSpecialPageTag([])).toBe(false);
    });

    test("returns false for non-array input", () => {
      expect(TagRegistry.hasSpecialPageTag(null)).toBe(false);
      expect(TagRegistry.hasSpecialPageTag("SPECIAL_PAGE")).toBe(false);
    });

    test("handles undefined input", () => {
      expect(TagRegistry.hasSpecialPageTag(undefined)).toBe(false);
    });

    test("handles array with null elements", () => {
      expect(TagRegistry.hasSpecialPageTag([null, "SPECIAL_PAGE"])).toBe(true);
      expect(TagRegistry.hasSpecialPageTag([null, null])).toBe(false);
    });

    test("handles array with non-string elements", () => {
      expect(TagRegistry.hasSpecialPageTag([123, "SPECIAL_PAGE"])).toBe(true);
      expect(TagRegistry.hasSpecialPageTag([123, { tag: "PAGE" }])).toBe(false);
    });
  });

  describe("isRegisteredToneTag", () => {
    beforeEach(() => {
      TagRegistry.clearTones();
      TagRegistry.registerTone("flirty", "🔥");
      TagRegistry.registerTone("angry", "😠");
      TagRegistry.registerTone("Sarcastic", "🙄");
    });

    afterEach(() => {
      TagRegistry.clearTones();
    });

    test("returns true for registered tone (exact case)", () => {
      expect(TagRegistry.isRegisteredToneTag("flirty")).toBe(true);
    });

    test("returns true for registered tone (case-insensitive)", () => {
      expect(TagRegistry.isRegisteredToneTag("FLIRTY")).toBe(true);
      expect(TagRegistry.isRegisteredToneTag("Flirty")).toBe(true);
      expect(TagRegistry.isRegisteredToneTag("sarcastic")).toBe(true);
    });

    test("returns false for unregistered tone", () => {
      expect(TagRegistry.isRegisteredToneTag("happy")).toBe(false);
      expect(TagRegistry.isRegisteredToneTag("unknown")).toBe(false);
    });

    test("returns false for regular tag", () => {
      expect(TagRegistry.isRegisteredToneTag("TITLE")).toBe(false);
      expect(TagRegistry.isRegisteredToneTag("IMAGE")).toBe(false);
    });

    test("returns false when no tones registered", () => {
      TagRegistry.clearTones();
      expect(TagRegistry.isRegisteredToneTag("flirty")).toBe(false);
    });

    test("returns false for invalid input", () => {
      expect(TagRegistry.isRegisteredToneTag(null)).toBe(false);
      expect(TagRegistry.isRegisteredToneTag("")).toBe(false);
    });
  });

  describe("registerTone and getToneIcon", () => {
    beforeEach(() => {
      TagRegistry.clearTones();
    });

    afterEach(() => {
      TagRegistry.clearTones();
    });

    test("registerTone adds tone to registry", () => {
      TagRegistry.registerTone("happy", "😊");
      expect(TagRegistry.isRegisteredToneTag("happy")).toBe(true);
    });

    test("registerTone normalizes label to lowercase", () => {
      TagRegistry.registerTone("EXCITED", "🎉");
      expect(TagRegistry.isRegisteredToneTag("excited")).toBe(true);
      expect(TagRegistry.getToneIcon("excited")).toBe("🎉");
    });

    test("getToneIcon returns icon for registered tone", () => {
      TagRegistry.registerTone("sad", "😢");
      expect(TagRegistry.getToneIcon("sad")).toBe("😢");
    });

    test("getToneIcon is case-insensitive", () => {
      TagRegistry.registerTone("angry", "😠");
      expect(TagRegistry.getToneIcon("ANGRY")).toBe("😠");
    });

    test("getToneIcon returns null for unregistered tone", () => {
      expect(TagRegistry.getToneIcon("unknown")).toBe(null);
    });

    test("clearTones removes all tones", () => {
      TagRegistry.registerTone("test", "🧪");
      expect(TagRegistry.isRegisteredToneTag("test")).toBe(true);
      TagRegistry.clearTones();
      expect(TagRegistry.isRegisteredToneTag("test")).toBe(false);
    });
  });

  describe("StoryFeatures", () => {
    describe("scan", () => {
      test("detects AUDIO tag usage", () => {
        StoryFeatures.scan({ text: "^AUDIO: sound.mp3" });
        expect(StoryFeatures.hasAudio).toBe(true);
      });

      test("detects AUDIOLOOP tag usage", () => {
        StoryFeatures.scan({ text: "^AUDIOLOOP: music.mp3" });
        expect(StoryFeatures.hasAudio).toBe(true);
      });

      test("detects audio aliases (SFX, MUSIC, BGM)", () => {
        expect(StoryFeatures.scan({ text: "^SFX: beep.mp3" }).hasAudio).toBe(
          true
        );
        expect(StoryFeatures.scan({ text: "^MUSIC: bg.mp3" }).hasAudio).toBe(
          true
        );
        expect(StoryFeatures.scan({ text: "^BGM: theme.mp3" }).hasAudio).toBe(
          true
        );
      });

      test("detects audio in realistic story.json structure", () => {
        const content = [
          { text: "Hello" },
          { tags: ["^AUDIO: beep.mp3"] },
          { choices: [] },
        ];
        expect(StoryFeatures.scan(content).hasAudio).toBe(true);
      });

      test("returns false when no audio tags present", () => {
        expect(StoryFeatures.scan({ text: "^IMAGE: hero.png" }).hasAudio).toBe(
          false
        );
        expect(StoryFeatures.scan({ text: "Some text" }).hasAudio).toBe(false);
      });

      test("handles nested content structure", () => {
        const content = {
          pages: [{ tags: ["^AUDIO: sound.mp3"] }],
        };
        StoryFeatures.scan(content);
        expect(StoryFeatures.hasAudio).toBe(true);
      });

      test("returns this for chaining", () => {
        const result = StoryFeatures.scan({});
        expect(result).toBe(StoryFeatures);
      });
    });
  });
});
