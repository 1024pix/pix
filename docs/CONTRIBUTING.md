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

## Node.js

On ne commit le `package-lock.json` qu'en cas de modification du `package.json`

## Flags du code à l'état de l'art

Dans le code Pix, les bouts de code exemplaires, qui illustrent l’état de l’art actuel pour nous, sont signalés par le commentaire `// @exemplary`.

Objectifs :

- faciliter l’accès à l’information (`Ctrl-Shift-F` ou `grep` permet de lister ces bouts de code),
- accélérer les choix d’implém,
- et fluidifier la montée en compétence des nouveaux

Pour mettre à jour ces flags, nous soumettons une PR qui suit la même validation que pour la mise à jour du `CONTRIBUTING.md`.
