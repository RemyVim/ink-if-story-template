---
layout: default
title: Devlog
description: >-
  Development notes, design decisions, and behind-the-scenes thoughts on
  building the Ink Story Template.
---
# Devlog

Occasional notes on building this template—design decisions, accessibility rabbit holes, and other things I learned along the way.

---

{% assign devlog_pages = site.pages | where_exp: "page", "page.path contains 'devlog/'" | where_exp: "page", "page.path != 'devlog.md'" | sort: "date" | reverse %}
{% for post in devlog_pages %}

### [{{ post.title }}]({{ post.url | relative_url }})

<time class="devlog-date" datetime="{{ post.date | date_to_xmlschema }}">{{ post.date | date: "%B %d, %Y" }}</time>

{{ post.description }}

{% unless forloop.last %}---{% endunless %}
{% endfor %}
