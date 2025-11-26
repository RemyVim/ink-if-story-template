// ink-functions.js
// Utility functions for Ink stories - string and math operations
// These must be declared with EXTERNAL in your .ink file before use

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
  }

  /**
   * String manipulation functions
   */
  static bindStringFunctions(story) {
    story.BindExternalFunction("UPPERCASE", (str) => String(str).toUpperCase());
    story.BindExternalFunction("LOWERCASE", (str) => String(str).toLowerCase());
    story.BindExternalFunction(
      "CAPITALIZE",
      (str) => String(str).charAt(0).toUpperCase() + String(str).slice(1),
    );
    story.BindExternalFunction("TRIM", (str) => String(str).trim());
    story.BindExternalFunction("LENGTH", (str) => String(str).length);
    story.BindExternalFunction("CONTAINS", (str, search) =>
      String(str).includes(String(search)),
    );
    story.BindExternalFunction("STARTS_WITH", (str, search) =>
      String(str).startsWith(String(search)),
    );
    story.BindExternalFunction("ENDS_WITH", (str, search) =>
      String(str).endsWith(String(search)),
    );
    story.BindExternalFunction("REPLACE", (str, search, replacement) =>
      String(str).replace(String(search), String(replacement)),
    );
    story.BindExternalFunction("REPLACE_ALL", (str, search, replacement) =>
      String(str).replaceAll(String(search), String(replacement)),
    );
  }

  /**
   * Math utility functions
   *
   * NOTE: Ink has these built-in, so we don't duplicate them:
   * - MIN(a, b), MAX(a, b)
   * - FLOOR(x), CEILING(x), INT(x), FLOAT(x), POW(x,y)
   * - RANDOM(min, max), SEED_RANDOM(x)
   * - Basic operators: +, -, *, /, % (mod)
   */
  static bindMathFunctions(story) {
    story.BindExternalFunction("ROUND", (value) => Math.round(value));
    story.BindExternalFunction("CLAMP", (value, min, max) =>
      Math.min(Math.max(value, min), max),
    );
    story.BindExternalFunction("ABS", (value) => Math.abs(value));
    story.BindExternalFunction("PERCENT", (value, total) =>
      total === 0 ? 0 : Math.round((value / total) * 100),
    );
  }

  /**
   * Fairmath utility functions (ChoiceScript-style)
   *
   * FAIRADD: Gains diminish as you approach 100
   * Example: FAIRADD(50, 20) = 50 + (50 * 0.20) = 60
   * Example: FAIRADD(80, 20) = 80 + (20 * 0.20) = 84
   *
   * FAIRSUB: Losses diminish as you approach 0
   * Example: FAIRSUB(50, 20) = 50 - (50 * 0.20) = 40
   * Example: FAIRSUB(20, 20) = 20 - (20 * 0.20) = 16
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
   * Time and date functions
   */
  static bindTimeFunctions(story) {
    // NOW() - Returns current Unix timestamp in seconds
    story.BindExternalFunction("NOW", () => Math.floor(Date.now() / 1000));

    // SECONDS_SINCE(start) - Raw seconds elapsed since timestamp
    story.BindExternalFunction(
      "SECONDS_SINCE",
      (start) => Math.floor(Date.now() / 1000) - start,
    );

    // MINUTES_SINCE(start) - Minutes elapsed (useful for gameplay checks)
    story.BindExternalFunction("MINUTES_SINCE", (start) =>
      Math.floor((Date.now() / 1000 - start) / 60),
    );

    // TIME_SINCE(start) - Human-readable elapsed time
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

    // FORMAT_DATE(timestamp, locale) - Returns "November 26, 2025"
    story.BindExternalFunction("FORMAT_DATE", (timestamp, locale) => {
      const date = new Date(timestamp * 1000);
      const options = {
        year: "numeric",
        month: "long",
        day: "numeric",
      };
      try {
        return date.toLocaleDateString(locale || "en-US", options);
      } catch (e) {
        console.warn(`Invalid locale "${locale}", falling back to en-US`);
        return date.toLocaleDateString("en-US", options);
      }
    });

    // FORMAT_TIME(timestamp, locale) - Returns "3:45 PM"
    story.BindExternalFunction("FORMAT_TIME", (timestamp, locale) => {
      const date = new Date(timestamp * 1000);
      const options = {
        hour: "numeric",
        minute: "2-digit",
      };
      try {
        return date.toLocaleTimeString(locale || "en-US", options);
      } catch (e) {
        console.warn(`Invalid locale "${locale}", falling back to en-US`);
        return date.toLocaleTimeString("en-US", options);
      }
    });

    // FORMAT_DATETIME(timestamp, locale) - Returns "November 26, 2025 at 3:45 PM"
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
      } catch (e) {
        console.warn(`Invalid locale "${locale}", falling back to en-US`);
        return date.toLocaleString("en-US", options);
      }
    });

    // OFFSET_DATE(timestamp, years, months, days, hours, minutes)
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
      },
    );
  }
}
