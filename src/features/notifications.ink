=== notifications_demo ===

This template also supports notifications.

You can trigger a notification with these custom Ink tags:

> `\# ACHIEVEMENT: You did it!`
> `\# NOTIFICATION: Something happened.`
> `\# ERROR: What just happened?`

A notification is automatically displayed when the player interacts with the save system. Notifications are also displayed if the template encounters an error.

+ [Trigger a notification]
  # NOTIFICATION: Something happened.
  -> notifications_demo
+ [Trigger an achievement notification]
  # ACHIEVEMENT: You did it!
  -> notifications_demo
+ [Trigger an error notification]
  # ERROR: What just happened?
  -> notifications_demo
+ [Back to feature menu] -> feature_menu
