# Spellingcategorieën app

- Audience: children in groep 4 (about 7–8 years old), used in class, mostly on tablets. All app text is in Dutch, simple and friendly.
- Follow the **Staal** method: its category names and numbers (see `js/categorieen.js`). Start at groep 4 but also cover the categories of groep 5–8, organised by groep, so a child can work ahead.
- Plain HTML/CSS/JavaScript with no build step and no dependencies, so it runs directly on GitHub Pages and can be edited from a phone.
- Design for touch: big buttons, large text, no hover-only interactions.
- Mascot: Eva Eekhoorn (🐿️), a girl squirrel with a female voice; if the chosen voice is male she is called Erik Eekhoorn (see `naam()` in js/app.js). She talks to the child in short, encouraging sentences.
- When changing CSS/JS, bump the `?v=` number on the links in index.html so browsers don't mix old and new files.
