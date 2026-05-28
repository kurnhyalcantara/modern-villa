# Internationalization (i18n) System

## Overview

The application must support dynamic multi-language internationalization (i18n).

Language switching must be available from the top-right navbar using country flags and language labels.

The translation system MUST NOT use hardcoded frontend translation objects.

All language terms and translations must be dynamically loaded from the database.

---

# Core Requirements

## Features

- Dynamic language switching
- Country flag selector in navbar
- Persist selected language
- Dynamic translation loading
- SEO-friendly localized routes
- Fallback language support

---

# Supported Architecture

## Frontend

- next-intl OR custom i18n provider
- Zustand for language state
- Server-side translation loading

## Backend

- Database-driven translations
- Translation API endpoints
- Cached translation queries

---

# UI Requirements

## Navbar Language Switcher

Position:

- Top-right navbar

Features:

- Country flag icon
- Language label
- Dropdown selector
- Smooth transition animation

Example:

- 🇺🇸 English
- 🇮🇩 Bahasa Indonesia
- 🇯🇵 Japanese

---

# Database Design

## Languages Table

```sql
languages
```

Columns:

- id
- code
- name
- native_name
- flag_icon
- is_default
- is_active
- created_at

Example Data:

| code | name       | native_name      |
| ---- | ---------- | ---------------- |
| en   | English    | English          |
| id   | Indonesian | Bahasa Indonesia |
| jp   | Japanese   | 日本語           |

---

## Translation Keys Table

```sql
translation_keys
```

Columns:

- id
- key
- description
- created_at

Example:

- navbar.home
- navbar.booking
- homepage.hero_title

---

## Translation Values Table

```sql
translation_values
```

Columns:

- id
- language_id
- translation_key_id
- value
- created_at

---

# Translation System Rules

## Rules

- Frontend must never hardcode translations
- All translations must come from database/API
- Missing translations must fallback to default language
- Translation queries should be cached
- Translation loading should support SSR

---

# API Requirements

## Endpoints

### Get Active Languages

```http
GET /api/languages
```

### Get Translation Dictionary

```http
GET /api/translations?lang=en
```

---

# Frontend Requirements

## Translation Hook

Example:

```ts
const t = useTranslation();

t('navbar.home');
```

---

# State Management

Store:

- selected language
- active translations
- loading state

Use Zustand store.

---

# Persistence

Selected language should persist using:

- cookies
  OR
- localStorage

Preferred:

- cookies for SSR compatibility

---

# SEO Requirements

## Localized Routes

Example:

```bash
/en
/id
/jp
```

Examples:

- /en/villas
- /id/villas

---

# Performance Requirements

- Cache translations
- Lazy load translation dictionaries
- Avoid loading unused languages
- SSR-compatible translation loading

---

# Admin Requirements

Admin panel must support:

- Create new language
- Enable/disable language
- Manage translation keys
- Manage translation values
- Translation search/filter
- Missing translation detection

---

# Strict Rules

- Do not hardcode UI text in components
- All labels must use translation keys
- All validation messages must support i18n
- Translation keys must use dot notation
- Translation loading must support SSR and client-side rendering

---

# Recommended Folder Structure

```bash
src/
├── i18n/
├── locales/
├── providers/
├── hooks/
│   └── use-translation.ts
├── store/
│   └── language-store.ts
```

---

# Recommended Translation Key Naming

Examples:

```text
navbar.home
navbar.booking
homepage.hero.title
homepage.hero.subtitle
booking.confirmation.title
dashboard.wallet.balance
```

Avoid:

- homeTitle
- navbarHome
- bookingText1

Use structured dot notation only.
