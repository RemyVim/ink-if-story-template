=== functions ===

: Functions

Ink offers a few built-in functions. This template extends that and adds a few more useful ones for string manipulation and math.

-> menu_functions

= menu_functions

+ [See string functions]
  -> string_functions
+ [See math functions]
  -> math_functions
+ [See fairmath functions]
  -> fairmath_functions
+ [See time functions]
  -> time_functions
+ [Return to feature menu] 
  -> feature_menu

= string_functions
: String Functions

Add these `EXTERNAL` delarations to your main .ink file. You only need to add them once in your story to be able to use them anywhere. You can also pick and choose which ones to include.

`EXTERNAL UPPERCASE(string)`
`EXTERNAL LOWERCASE(string)`
`EXTERNAL CAPITALIZE(string)`
`EXTERNAL TRIM(string)`
`EXTERNAL LENGTH(string)`
`EXTERNAL CONTAINS(string, search)`
`EXTERNAL STARTS_WITH(string, search)`
`EXTERNAL ENDS_WITH(string, search)`
`EXTERNAL REPLACE(string, search, replacement)`
`EXTERNAL REPLACE_ALL(string, search, replacement)`

Then you can use these functions in your Ink story.

:: String Function Examples

`VAR player_name = " john doe "`
`VAR cleaned_name = ""`
`~ cleaned_name = TRIM(player_name)`

VAR player_name = " john doe "
VAR cleaned_name = ""
~ cleaned_name = TRIM(player_name)

`Player name: "\{player_name\}"`
Player name: "{player_name}"

`Cleaned name: "\{cleaned_name\}"`
Cleaned name: "{cleaned_name}"

`Hello, \{CAPITALIZE(cleaned_name)\}!`
Hello, {CAPITALIZE(cleaned_name)}!

`Your name has \{LENGTH(cleaned_name)\} characters.`
Your name has {LENGTH(cleaned_name)} characters.

`In uppercase: \{UPPERCASE(cleaned_name)\}`
In uppercase: {UPPERCASE(cleaned_name)}

`In lowercase: \{LOWERCASE(cleaned_name)\}`
In lowercase: {LOWERCASE(cleaned_name)}

`\{CONTAINS(cleaned_name, "doe"): You're a Doe!\}`
{CONTAINS(cleaned_name, "doe"): You're a Doe!}

`\{STARTS_WITH(cleaned_name, "john"): Your name starts with John.\}`
{STARTS_WITH(cleaned_name, "john"): Your name starts with John.}

`\{ENDS_WITH(cleaned_name, "doe"): Your name ends with Doe.\}`
{ENDS_WITH(cleaned_name, "doe"): Your name ends with Doe.}


`VAR greeting = "Hello World"`
VAR greeting = "Hello World"

`Greeting: \{greeting\}`
Greeting: {greeting}

`With replacement: \{REPLACE(greeting, "World", "Ink")\}`
With replacement: {REPLACE(greeting, "World", "Ink")}


`VAR repeated = "la la la"`
VAR repeated = "la la la"

`Repeated: \{repeated\}`
Repeated: {repeated}

`Replace all: \{REPLACE_ALL(repeated, "la", "to")\}`
Replace all: {REPLACE_ALL(repeated, "la", "to")}

-> menu_functions

= math_functions
: Math Functions

Add these external functions to your main .ink file. You only need to add them once in your story to be able to use them anywhere. You can also pick and choose which ones to include.
Math functions:
`EXTERNAL ROUND(value)`
`EXTERNAL CLAMP(value, min, max)`
`EXTERNAL ABS(value)`
`EXTERNAL PERCENT(value, total)`

:: Math Function Examples

`VAR health = 150`
`VAR max_health = 100`

VAR health = 150
VAR max_health = 100

`Clamped health: \{CLAMP(health, 0, max_health)\} (was \{health\})`
Clamped health: {CLAMP(health, 0, max_health)} (was {health})

`Rounded: \{ROUND(7.6)\}`
Rounded: {ROUND(7.6)}

`Absolute damage: \{ABS(-25)\}`
Absolute damage: {ABS(-25)}

`Progress: \{PERCENT(75, 200)\}%%
Progress: {PERCENT(75, 200)}%

[---]
For reference, the following functions are already built-in to Ink:

> `RANDOM(min, max)`: Random integer (inclusive)
> `FLOOR(x)`: Round down
> `CEILING(x)`: Round up
> `INT(x)`: Truncate to integer
> `FLOAT(x)`: Convert to decimal
> `POW(x, y)`: x to the power of y
> `MIN(a, b)`: Smaller of two values
> `MAX(a, b)`: Larger of two values

[---]

-> menu_functions

= fairmath_functions
: Fairmath Functions 

Fairmath (of ChoiceScript fame) makes stats harder to change the closer they get to 0 or 100. Gains shrink as you approach the cap, losses shrink as you approach zero. Results are automatically kept between 0 and 100. This keeps stats in interesting ranges and prevents runaway values.

And you can now use fairmath directly in your Ink story!

To do so, add these external functions to your main .ink file. You only need to add them once in your story to be able to use them anywhere. You can also pick and choose which ones to include.

Fairmath functions:
`EXTERNAL FAIRADD(stat, percent)`
`EXTERNAL FAIRSUB(stat, percent)`

:: Fairmath Function Examples

-> fairmath_example

= fairmath_example
Reputation stat is currently {reputation}.

+ [Reset to 50]
  :: Fairmath Function Examples
  ~ reputation = 50
  -> fairmath_example
+ [Add 10]
  :: Fairmath Function Examples
  `~ reputation = FAIRADD(reputation, 10)`
  ~ reputation = FAIRADD(reputation, 10)
  -> fairmath_example
+ [Add 20]
  :: Fairmath Function Examples
  `~ reputation = FAIRADD(reputation, 20)`
  ~ reputation = FAIRADD(reputation, 20)
  -> fairmath_example
+ [Add 50]
  :: Fairmath Function Examples
  `~ reputation = FAIRADD(reputation, 50)`
  ~ reputation = FAIRADD(reputation, 50)
  -> fairmath_example
+ [Remove 10]
  :: Fairmath Function Examples
  `~ reputation = FAIRSUB(reputation, 10)`
  ~ reputation = FAIRSUB(reputation, 10)
  -> fairmath_example
+ [Remove 20]
  :: Fairmath Function Examples
  `~ reputation = FAIRSUB(reputation, 20)`
  ~ reputation = FAIRSUB(reputation, 20)
  -> fairmath_example
+ [Remove 50]
  :: Fairmath Function Examples
  `~ reputation = FAIRSUB(reputation, 50)`
  ~ reputation = FAIRSUB(reputation, 50)
  -> fairmath_example
+ [Return to functions menu] 
  -> functions

= time_functions
: Time Functions

These functions give your Ink story real-world time awareness. Perfect for session tracking, real-time games, or narratives where you really want to make it feel like everything is happening in real time.

Add these external declarations to your main .ink file:

`EXTERNAL NOW()`
`EXTERNAL SECONDS_SINCE(start)`
`EXTERNAL MINUTES_SINCE(start)`
`EXTERNAL TIME_SINCE(start)`
`EXTERNAL FORMAT_DATE(timestamp, locale)`
`EXTERNAL FORMAT_TIME(timestamp, locale)`
`EXTERNAL FORMAT_DATETIME(timestamp, locale)`
`EXTERNAL OFFSET_DATE(timestamp, years, months, days, hours, minutes)`

:: Getting the Current Time

`VAR session_start = 0`
`~ session_start = NOW()`

(I called this at demo start!)

The current timestamp is {session_start}. That's a Unix timestamp (seconds since January 1, 1970).

:: Formatting Dates and Times

`VAR locale = "en-US"`
VAR locale = "en-US"

`Today is \{FORMAT_DATE(NOW(), locale)\}.`
Today is {FORMAT_DATE(NOW(), locale)}.

`The time is \{FORMAT_TIME(NOW(), locale)\}.`
The time is {FORMAT_TIME(NOW(), locale)}.

`Full: \{FORMAT_DATETIME(NOW(), locale)\}`
Full: {FORMAT_DATETIME(NOW(), locale)}

:: Using Different Locales

The locale parameter determines how to display the date and time. You can find a list of locales at [simplelocalize.io](simplelocalize.io/data/locales/).

`French: \{FORMAT_DATETIME(NOW(), "fr-FR")\}`
French: {FORMAT_DATETIME(NOW(), "fr-FR")}

`Russian: \{FORMAT_DATETIME(NOW(), "ru-RU")\}`
Russian: {FORMAT_DATETIME(NOW(), "ru-RU")}

`Japanese: \{FORMAT_DATETIME(NOW(), "ja-JP")\}`
Japanese: {FORMAT_DATETIME(NOW(), "ja-JP")}

`Egyptian: \{FORMAT_DATETIME(NOW(), "ar-EG")\}`
Egyptian: {FORMAT_DATETIME(NOW(), "ar-EG")}

`Hindi: \{FORMAT_DATETIME(NOW(), "hi-IN")\}`
Hindi: {FORMAT_DATETIME(NOW(), "hi-IN")}

If you enter an invalid locale it defaults to `en-US` and throws a warning in the browser's console:

`Invalid locale: \{FORMAT_DATETIME(NOW(), "tada")\}`
Invalid locale: {FORMAT_DATETIME(NOW(), "tada")}

:: Date Math with OFFSET_DATE

Use `OFFSET_DATE` to create timestamps in the past or future. Parameters are: timestamp, years, months, days, hours, minutes.

`VAR five_years_ago = 0`
`~ five_years_ago = OFFSET_DATE(NOW(), -5, 0, 0, 0, 0)`
`The incident happened on \{FORMAT_DATE(five_years_ago, "en-US")\}.`

VAR five_years_ago = 0
~ five_years_ago = OFFSET_DATE(NOW(), -5, 0, 0, 0, 0)
The incident happened on {FORMAT_DATE(five_years_ago, "en-US")}.

`VAR next_week = 0`
`~ next_week = OFFSET_DATE(NOW(), 0, 0, 7, 0, 0)`
`See you on \{FORMAT_DATE(next_week, "en-US")\}!`

VAR next_week = 0
~ next_week = OFFSET_DATE(NOW(), 0, 0, 7, 0, 0)
See you on {FORMAT_DATE(next_week, "en-US")}!

:: Tracking Elapsed Time

`You've been exploring this demo for \{TIME_SINCE(session_start)\}.`
You've been exploring this demo for {TIME_SINCE(session_start)}.

For gameplay checks, use the numeric timestamp versions:

`\{SECONDS_SINCE(session_start)\} seconds have passed.`
{SECONDS_SINCE(session_start)} seconds have passed.

`\{MINUTES_SINCE(session_start)\} minutes have passed.`
{MINUTES_SINCE(session_start)} minutes have passed.

-> menu_functions
