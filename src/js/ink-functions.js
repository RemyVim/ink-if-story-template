/**
 * Provides external functions that extend Ink's built-in capabilities.
 * Includes string manipulation, math utilities, fairmath operations, and time formatting.
 * All methods are static - call InkFunctions.bindAll(story) to register all functions.
 */
class InkFunctions {
  /**
   * Bind all utility functions to an ink story
   * @param {Story} story - The inkjs Story instance
   */
  static bindAll(story) {
    this.bindStringFunctions(story);
    this.bindMathFunctions(story);
    this.bindFairMathFunctions(story);
    this.bindTimeFunctions(story);
    this.bindDebugFunctions(story);
  }

  /**
   * Binds string manipulation functions to the story.
   * Functions: UPPERCASE, LOWERCASE, CAPITALIZE, TRIM, LENGTH,
   * CONTAINS, STARTS_WITH, ENDS_WITH, REPLACE, REPLACE_ALL
   * @param {Story} story - The inkjs Story instance
   * @private
   */
  static bindStringFunctions(story) {
    story.BindExternalFunction("UPPERCASE", (str) => String(str).toUpperCase());
    story.BindExternalFunction("LOWERCASE", (str) => String(str).toLowerCase());
    story.BindExternalFunction(
      "CAPITALIZE",
      (str) => String(str).charAt(0).toUpperCase() + String(str).slice(1)
    );
    story.BindExternalFunction("TRIM", (str) => String(str).trim());
    story.BindExternalFunction("LENGTH", (str) => String(str).length);
    story.BindExternalFunction("CONTAINS", (str, search) =>
      String(str).includes(String(search))
    );
    story.BindExternalFunction("STARTS_WITH", (str, search) =>
      String(str).startsWith(String(search))
    );
    story.BindExternalFunction("ENDS_WITH", (str, search) =>
      String(str).endsWith(String(search))
    );
    story.BindExternalFunction("REPLACE", (str, search, replacement) =>
      String(str).replace(String(search), String(replacement))
    );
    story.BindExternalFunction("REPLACE_ALL", (str, search, replacement) =>
      String(str).replaceAll(String(search), String(replacement))
    );
  }

  /**
   * Binds math utility functions to the story.
   * Functions: ROUND, CLAMP, ABS, PERCENT
   *
   * Note: Ink has these built-in, so we don't duplicate them:
   * MIN, MAX, FLOOR, CEILING, INT, FLOAT, POW, RANDOM, SEED_RANDOM
   * @param {Story} story - The inkjs Story instance
   * @private
   */
  static bindMathFunctions(story) {
    story.BindExternalFunction("ROUND", (value) => Math.round(value));
    story.BindExternalFunction("CLAMP", (value, min, max) =>
      Math.min(Math.max(value, min), max)
    );
    story.BindExternalFunction("ABS", (value) => Math.abs(value));
    story.BindExternalFunction("PERCENT", (value, total) =>
      total === 0 ? 0 : Math.round((value / total) * 100)
    );
  }

  /**
   * Binds fairmath functions for balanced stat progression.
   * FAIRADD increases stats with diminishing returns near 100.
   * FAIRSUB decreases stats with diminishing returns near 0.
   * Useful for RPG-style stats that shouldn't easily hit extremes.
   * @param {Story} story - The inkjs Story instance
   * @private
   */
  static bindFairMathFunctions(story) {
    story.BindExternalFunction("FAIRADD", (stat, percent) => {
      const result = stat + (100 - stat) * (percent / 100);
      return Math.round(Math.min(100, Math.max(0, result)));
    });

    story.BindExternalFunction("FAIRSUB", (stat, percent) => {
      const result = stat - stat * (percent / 100);
      return Math.round(Math.min(100, Math.max(0, result)));
    });
  }

  /**
   * Binds time and date formatting functions to the story.
   * Functions: NOW, TIME_AGO, FORMAT_DATE, FORMAT_TIME, FORMAT_DATETIME, OFFSET_DATE
   * All timestamps are Unix timestamps (seconds since epoch).
   * Formatting functions support locale strings (e.g., "en-US", "fr-FR").
   * @param {Story} story - The inkjs Story instance
   * @private
   */
  static bindTimeFunctions(story) {
    story.BindExternalFunction("NOW", () => Math.floor(Date.now() / 1000));

    story.BindExternalFunction(
      "SECONDS_SINCE",
      (start) => Math.floor(Date.now() / 1000) - start
    );

    story.BindExternalFunction("MINUTES_SINCE", (start) =>
      Math.floor((Date.now() / 1000 - start) / 60)
    );

    story.BindExternalFunction("TIME_SINCE", (start) => {
      const seconds = Math.floor(Date.now() / 1000) - start;

      if (seconds < 60) {
        return seconds === 1 ? "1 second" : `${seconds} seconds`;
      }

      const minutes = Math.floor(seconds / 60);
      if (minutes < 60) {
        return minutes === 1 ? "1 minute" : `${minutes} minutes`;
      }

      const hours = Math.floor(minutes / 60);
      if (hours < 24) {
        return hours === 1 ? "1 hour" : `${hours} hours`;
      }

      const days = Math.floor(hours / 24);
      return days === 1 ? "1 day" : `${days} days`;
    });

    story.BindExternalFunction("FORMAT_DATE", (timestamp, locale) => {
      const date = new Date(timestamp * 1000);
      const options = {
        year: "numeric",
        month: "long",
        day: "numeric",
      };
      try {
        return date.toLocaleDateString(locale || "en-US", options);
      } catch {
        console.warn(`Invalid locale "${locale}", falling back to en-US`);
        return date.toLocaleDateString("en-US", options);
      }
    });

    story.BindExternalFunction("FORMAT_TIME", (timestamp, locale) => {
      const date = new Date(timestamp * 1000);
      const options = {
        hour: "numeric",
        minute: "2-digit",
      };
      try {
        return date.toLocaleTimeString(locale || "en-US", options);
      } catch {
        console.warn(`Invalid locale "${locale}", falling back to en-US`);
        return date.toLocaleTimeString("en-US", options);
      }
    });

    story.BindExternalFunction("FORMAT_DATETIME", (timestamp, locale) => {
      const date = new Date(timestamp * 1000);
      const options = {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      };
      try {
        return date.toLocaleString(locale || "en-US", options);
      } catch {
        console.warn(`Invalid locale "${locale}", falling back to en-US`);
        return date.toLocaleString("en-US", options);
      }
    });

    story.BindExternalFunction(
      "OFFSET_DATE",
      (timestamp, years, months, days, hours, minutes) => {
        const date = new Date(timestamp * 1000);
        date.setFullYear(date.getFullYear() + years);
        date.setMonth(date.getMonth() + months);
        date.setDate(date.getDate() + days);
        date.setHours(date.getHours() + hours);
        date.setMinutes(date.getMinutes() + minutes);
        return Math.floor(date.getTime() / 1000);
      }
    );
  }

  /**
   * Binds debug utility functions to the story.
   * Functions: DEBUG_LOG, DEBUG_WARNING
   * These only output to browser console, useful for authors debugging their stories.
   * @param {Story} story - The inkjs Story instance
   * @private
   */
  static bindDebugFunctions(story) {
    story.BindExternalFunction("DEBUG_LOG", (message) => {
      console.log(`[INK DEBUG] ${message}`);
      return 0; // Ink external functions must return a value
    });

    story.BindExternalFunction("DEBUG_WARN", (message) => {
      console.warn(`[INK WARNING] ${message}`);
      return 0;
    });
  }
}

export { InkFunctions };
