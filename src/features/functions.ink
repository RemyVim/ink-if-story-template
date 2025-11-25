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
