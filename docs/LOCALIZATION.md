# Axion Science localization

The first-party apps support English (en) and Uzbek (uz).

## Behaviour

- English is the default server-rendered language.
- The language switcher is available in the compact ecosystem bar on every route.
- Public landing pages and shared navigation/footer copy update immediately without a reload.
- The preference is stored in localStorage for the current origin and in the axion-locale cookie for .dirac.space, so it follows the researcher across Science, Math, Notebook and Writer.
- The provider updates the document language (html[lang]) when the preference changes.

## Scope

Public landing pages, shared ecosystem chrome, and the primary researcher-facing routes are localized. This includes the Math laboratory index and report controls, Notebook workspace controls, Writer documents/project/editor chrome, and Science projects, problems, and problem-detail interface labels. Scientific notation, code, file formats, API contracts and researcher-authored content remain unchanged because they are data rather than interface copy.

New workspace controls should use the same LocaleProvider and useLocale() hook. Keep scientific object payloads locale-neutral; only presentation labels should be translated.
