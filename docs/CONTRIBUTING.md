# Contribuer à Pix

Pour toute contribution, il est essentiel de respecter *a minima* les points suivants. Pour aller plus loin, vous pouvez parcourir les différents fichiers présentés dans le [README.md](./README.md)

## Branche `dev`

⚠️ On ne merge jamais `dev` dans une autre branche ⚠️

## Conventions de nommage

Tests, commits, branches : en anglais

Description des Pull Requests : en français

## Conventions de nommage des commits

Exemples :

```
[po-31] Enlarge text width on details page

[pf-509] Check email domain before submitting address to Mailjet

[BSR] Add markdown templating for custom landing page text display

[BUGFIX] Problème de style sous IE (PF-440).
```

Pour aller plus loin : 
- [Commit messages guide](https://github.com/RomuloOliveira/commit-messages-guide/blob/master/README.md)
- [Git SCM commit guidelines](https://git-scm.com/book/en/v2/Distributed-Git-Contributing-to-a-Project#_commit_guidelines)

## Node.js

On ne commit le `package-lock.json` qu'en cas de modification du `package.json`
