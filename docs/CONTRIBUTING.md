# Contribuer à Pix

Pour toute contribution, il est essentiel de respecter *a minima* les points suivants. Pour aller plus loin, vous pouvez parcourir les différents fichiers présentés dans le [README.md](./README.md)

## Branche `dev`

⚠️ On ne merge jamais `dev` dans une autre branche ⚠️

## Conventions de nommage

### Nommage des commits

Les messages de commit doivent être rédigés en anglais (décision d'équipe du 27/04/2017).

50 char max pour respecter les conventions de l’écosystème notamment GitHub.

Majuscule et verbe d’action pour être en harmonie avec les conventions de Git.

Si le message n'est pas 100 % autoportant, on peut ajouter une description (après une ligne vide) qui explique la motivation du commit.

On suit la convention que le sujet doit marcher comme fin de phrase `If applied, this commit will...`.

> A properly formed Git commit subject line should always be able to complete the following sentence:
>
>     If applied, this commit will _Your subject line here_
>
> For example:
>
>     If applied, this commit will _Refactor subsystem X for readability_
>     If applied, this commit will _Update getting started documentation_
>     If applied, this commit will _Remove deprecated methods_
>     If applied, this commit will _Release version 1.0.0_
>     If applied, this commit will _Merge pull request #123 from user/branch_

Pour aller plus loin :
- [Commit messages guide](https://github.com/RomuloOliveira/commit-messages-guide/blob/master/README.md)
- [Git SCM commit guidelines](https://git-scm.com/book/en/v2/Distributed-Git-Contributing-to-a-Project#_commit_guidelines)
- https://chris.beams.io/posts/git-commit/

### Nommage des branches

Format (\*) | Description | Exemples
--- | --- | ---
`[projet_ref]-[us_id]-[description]` | Branche qui porte sur le développement d'une story | pf-123-create-account
`[projet_ref]-[us_id]-bugfix-[description]` | Branche qui porte sur la correction d'un bug | pf-124-bugfix-timeout-ko
`[projet_ref]-[us_id]-cleanup-[description]` | Branche qui sert à du refactoring | pf-125-cleanup-add-tests
`[projet_ref]-[us_id]-infra-[description]` | Branche contenant du code technico-technique | pf-126-infra-backup-db
`[projet_ref]-[us_id]-doc-[description]` | Branche liée à de la documentation (code ou README) | pf-127-doc-readme-live
`[projet_ref]-[us_id]-hotfix-[description]` | Branche de correction de bugs de production | pf-128-hotfix-regression
`tech-[description]` | Branche  avec changements techniques | tech-upgrade-cicd-script

(\*) : la description est en anglais

### Nommage des Pull Requests

#### Format

Le format à respecter est le suivant : `[<TAG>] <DESCRIPTION> (<PROJET_REF-<US_ID>).`, ex : "[FEATURE] Création de compte (US-987)."

#### TAG

Nom | Usage
--- | ---
FEATURE | PR relative à une story
BUGFIX | PR relative à une correction d'un bug (hors itération)
CLEANUP | PR relative à du refactoring
INFRA | PR relative à du code technique / d'infra
DOC | PR relative à de la documentation

#### DESCRIPTION

La description de l'US doit être en français, car il s'agit d'un produit francophone et qu'on souhaite que les gens, même loin de l'informatique, s'intéressent à notre CHANGELOG.

#### `PROJET_REF`

`PROJET_REF` correspond à l'abréviation du projet logiciel dans notre gestionnaire de tickets.

#### `US_ID`

`US_ID` correspond à l'identifiant unique de la story dans le Product Backlog, généré et géré par notre gestionnaire de tickets.

## Node.js

On ne commit le `package-lock.json` qu'en cas de modification du `package.json`
