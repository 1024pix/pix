# Contribuer à Pix

#### Table des matières

- [Notre utilisation de Git](#notre-utilisation-de-git)
- [Guide de style JavaScript](#guide-de-style-javascript)


## Notre utilisation de Git

### Branche `dev`

⚠️ On ne merge jamais `dev` dans une autre branche ⚠️

### Nommage

Tests, commits, branches : en anglais

Description des Pull Requests : en français

### Nommage des commits

Exemples :

```
[po-31] Enlarge text width on details page

[pf-509] Check email domain before submitting address to Mailjet

[BSR] Add markdown templating for custom landing page text display

[BUGFIX] Problème de style sous IE (PF-440).
```

### Node.js

On ne commit le `package-lock.json` qu'en cas de modification du `package.json`

## Guide de style JavaScript

### Nommage

Les noms de classes prennent une majuscule au début, les noms de modules et de variables prennent une minuscule au début.

Exemples :

```
const userRepository = ...

class User {
  ...
```
