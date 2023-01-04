# Contribuer à Pix

L'organisation GitHub [1024pix](https://github.com/1024pix) héberge le code utilisé dans le projet [Pix](https://pix.fr)
. Les dépots GitHub de l'organisation sont en évolution rapide et développés par plusieurs équipes dédiées chez Pix. Le
dépot GitHub [1024pix/pix](https://github.com/1024pix/pix) est la source canonique de nos équipes. Les développements
que nous réalisons sont exclusivement dédiés a l'amélioration de la platforme [Pix](https://pix.fr) et nous ne
travaillons pas a l'heure actuelle a une version générique utilisable par toute et tous pour d'autres usages.

Cela signifie que nous ne pouvons pas promettre que les contributions externes seront sur un pied d'égalité avec les
contributions internes. Les revues de code prennent du temps, et le travail nécessaire à Pix est prioritaire. Nous ne
pouvons pas non plus promettre que nous accepterons toutes les contributions de fonctionnalités. Même si le code est
déjà écrit, les revues et la maintenance ont un coût. Au sein de Pix, nous disposons d'une équipe de gestion des
produits qui évalue soigneusement les fonctionnalités que nous devons proposer ou non, et de nombreuses idées générées
en interne ne sont finalement pas retenues.

Pour toute contribution, il est essentiel de respecter *a minima* les points suivants.

## Règles de bonnes conduites pour déclarer les problèmes

Utilisez toujours [https://github.com/1024pix/pix/issues](https://github.com/1024pix/pix/issues) pour déclarer des
problèmes.

## Règles de bonnes conduites pour ouvrir une pull request

### Format

Le format à respecter est le suivant : `[<TAG>] <DESCRIPTION> (<PROJET_REF-<US_ID>).`, ex : "[FEATURE] Création de
compte (US-987)."

### TAG

Nom | Usage
--- | ---
FEATURE | PR relative à une story
BUGFIX | PR relative à une correction d'un bug
TECH | PR relative à du code technique / d'infra

Ce tag nous permet de générer automatiquement un fichier [CHANGELOG.md](./CHANGELOG.md) regroupant les modifications
d'une version à l'autre. Il est possible d'utiliser d'autres tags mais le CHANGELOG les regroupera comme des
modifications "Autres".

Le titre de la PR originel (et donc son tag) reste dans tous les cas affiché dans chaque ligne du CHANGELOG.

### DESCRIPTION

La description de l'US doit être en français, car il s'agit d'un produit francophone.
Par ailleurs, on souhaite que le CHANGELOG puisse être compris par des intervenants non techniques, par exemple des
utilisateurs.

On suit la convention que la description doit marcher comme une fin de phrase
à `Une fois mergée, cette _pull request_ permettra de …`.

// BAD
// Serialise tout les badgeParnerCompetences
// Proposition d'ADR pour séparer Domain Transactions et Domain Events

// GOOD
// Sérialiser tout les badgeParnerCompetences
// Proposer un ADR pour séparer Domain Transactions et Domain Events

### `PROJET_REF`

`PROJET_REF` correspond à l'abréviation du projet logiciel dans notre gestionnaire de tickets.

### `US_ID`

`US_ID` correspond à l'identifiant unique de la story dans le Product Backlog, généré et géré par notre gestionnaire de
tickets.

## Installation de l'environnement de développement local

Voir [INSTALLATION](INSTALLATION.md)

## Conventions de nommage

### Applications

Le nom des applications respecte le modèle suivant <Pix [activity_shortname]>
Ex : "Pix App", "Pix Admin", "Pix Orga", "Pix API", "Pix Certif"

### Commits

Les messages de commit doivent être rédigés en anglais (décision d'équipe du 27/04/2017).

50 caractères au maximum pour respecter les conventions de l’écosystème notamment GitHub.

Majuscule et verbe d’action pour être en harmonie avec les conventions de Git.

Si le message n'est pas 100 % autoportant, on peut ajouter une description (après une ligne vide) qui explique la
motivation du commit.

On suit la convention que le sujet doit marcher comme une fin de phrase à `If applied, this commit will… `.

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

### Branches

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

## Autres

### Branche `dev`

⚠️ On ne merge jamais `dev` dans une autre branche ⚠️

### Node.js

On ne commit le `package-lock.json` qu'en cas de modification du `package.json`
