---
name: trello-api
description: >
  Official agent documentation for the Trello REST API (v1). Covers authentication,
  boards, cards, lists, members, organizations, enterprises, actions, checklists,
  notifications, webhooks (including HMAC validation), search, labels, custom fields,
  tokens, and plugins. Use when building Trello integrations, automations, or any
  code that calls https://api.trello.com/1/.
indexed-skill: tier 2
api-version: "v1"
---

# Trello REST API

Agent reference for the Trello REST API v1 — 187 endpoints across 18 resource groups.
Load only the section you need.

<!-- INDEX
@sections/auth.md | auth | API key, token, key, authentication, rate limits, pagination, fields, filter, limit
@sections/boards.md | boards | boards, boardId, idBoard, boardStars, prefs, permissionLevel, boardPlugins
@sections/lists.md | lists | lists, idList, closed, archiveAllCards, moveAllCards, idListSource
@sections/cards.md | cards | cards, idCard, idList, attachments, checklists, stickers, comments, cover, due
@sections/checklists.md | checklists | checklists, checkItems, idChecklist, idCheckItem, idChecklistSource
@sections/members.md | members | members, idMember, username, avatarSource, boardBackgrounds, savedSearches
@sections/actions.md | actions | actions, idAction, reactions, reactionsSummary, memberCreator
@sections/organizations.md | organizations | organizations, idOrganization, displayName, orgInviteRestrict, exports
@sections/enterprises.md | enterprises | enterprises, idEnterprise, licensed, deactivated, claimableOrganizations
@sections/notifications.md | notifications | notifications, idNotification, unread, read_filter, memberCreator
@sections/webhooks.md | webhooks | webhooks, callbackURL, idModel, HMAC, webhook events, payload, signature
@sections/search.md | search | search, query, modelTypes, boards_limit, cards_limit, members_limit, partial
@sections/metadata.md | metadata | labels, customFields, idCustomField, customFieldOption, batch, emoji
@sections/tokens-plugins.md | tokens-plugins | tokens, idPlugin, plugin listing, compliance, memberPrivacy
-->
