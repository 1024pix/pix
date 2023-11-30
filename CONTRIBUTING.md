# Contribuer à Pix

L'organisation GitHub [1024pix](https://github.com/1024pix) héberge le code utilisé dans le projet [Pix](https://pix.fr). Les dépôts GitHub de l'organisation sont en évolution rapide et développés par plusieurs équipes dédiées chez Pix. Le dépôt GitHub [1024pix/pix](https://github.com/1024pix/pix) est la source canonique de nos équipes. Les développements que nous réalisons sont exclusivement dédiés à l'amélioration de la plateforme [Pix](https://pix.fr) et nous ne travaillons pas à l'heure actuelle à une version générique utilisable par toutes et tous pour d'autres usages.

Cela signifie que nous ne pouvons pas promettre que les contributions externes seront sur un pied d'égalité avec les contributions internes. Les revues de code prennent du temps, et le travail nécessaire à Pix est prioritaire. Nous ne pouvons pas non plus promettre que nous accepterons toutes les contributions de fonctionnalités. Même si le code est déjà écrit, les revues et la maintenance ont un coût. Au sein de Pix, nous disposons d'une équipe de gestion des produits qui évalue soigneusement les fonctionnalités que nous devons proposer ou non, et de nombreuses idées générées en interne ne sont finalement pas retenues.

Pour toute contribution, il est essentiel de respecter *à minima* les points suivants.

## Règles de bonnes conduites pour déclarer les problèmes

Utilisez toujours [https://github.com/1024pix/pix/issues](https://github.com/1024pix/pix/issues) pour déclarer des problèmes.

## Règles de bonnes conduites pour ouvrir une pull request

### Format

Le format à respecter est le suivant : `[<TAG>] <DESCRIPTION> (<US_ID>).`, ex : "[FEATURE] Création de compte (PIX-987)."

### TAG

Nom | Usage
--- | ---
FEATURE | PR relative à une story
BUGFIX | PR relative à une correction d'un bug
TECH | PR relative à du code technique / d'infra
BUMP | PR relative à des montées de versions

Ce tag nous permet de générer automatiquement un fichier [CHANGELOG.md](./CHANGELOG.md) regroupant les modifications d'une version à l'autre. Il est possible d'utiliser d'autres tags mais le CHANGELOG les regroupera comme des modifications "Autres".

Notamment, dans Autres, vous pouvez trouver : 

Nom | Usage
--- | ---
DOCS | PR relative à de la documentation
POC | PR relative à des Proofs of concept, ne doit pas être mergé

Le titre de la PR originel (et donc son tag) reste dans tous les cas affiché dans chaque ligne du CHANGELOG.

### DESCRIPTION

La description de l'US doit être en français, car il s'agit d'un produit francophone.
Par ailleurs, on souhaite que le CHANGELOG puisse être compris par des intervenants non techniques, par exemple des utilisateurs.

On suit la convention que la description doit marcher comme une fin de phrase à `Une fois mergée, cette _pull request_ permettra de …`.

#### Mauvais exemples

> [!CAUTION]
> Serialise tout les badgeParnerCompetences
> 
> Proposition d'ADR pour séparer Domain Transactions et Domain Events

#### Bons exemples

> [!TIP]
> Sérialiser tout les badgeParnerCompetences
>
> Proposer un ADR pour séparer Domain Transactions et Domain Events

### `US_ID`

`US_ID` correspond à l'identifiant unique de la story dans le Product Backlog, généré et géré par notre gestionnaire de tickets.
À laisser vide s'il n'y a pas de ticket associé.
Actuellement, le format de cet `US_ID` est `PIX-Number`.

Si la PR est liée à une Issue Github, `US_ID` est alors `ISSUE-#`.

Si la PR n'est reliée à aucun ticket ou aucune issue, alors le format du titre de la PR est `[<TAG>] <DESCRIPTION>.` sans `US_ID`.

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

Si le message n'est pas 100 % autoportant, on peut ajouter une description (après une ligne vide) qui explique la motivation du commit.

On suit la convention que le sujet doit marcher comme une fin de phrase à `If applied, this commit will… `.

L'utilisation des spécifications `Conventional Commits` est recommandée actuellement, mais n'est pas encore généralisée dans tous les commits.

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
- [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/)

### Branches

Format (\*) | Description | Exemples
--- | --- | ---
`[us_id]-[description]` | Branche qui porte sur le développement d'une story | pix-123-create-account
`[us_id]-bugfix-[description]` | Branche qui porte sur la correction d'un bug | pix-124-bugfix-timeout-ko
`[us_id]-cleanup-[description]` | Branche qui sert à du refactoring | pix-125-cleanup-add-tests
`[us_id]-infra-[description]` | Branche contenant du code technico-technique | pix-126-infra-backup-db
`[us_id]-doc-[description]` | Branche liée à de la documentation (code ou README) | pix-127-doc-readme-live
`[us_id]-hotfix-[description]` | Branche de correction de bugs de production | pix-128-hotfix-regression
`tech-[description]` | Branche  avec changements techniques | tech-upgrade-cicd-script
`tech-adr-[description]` | Branche avec l'ajout d'un ADR | tech-adr-browser-supports

(\*) : la description est en anglais

## Règles de validation des pull-request

Pour qu'une pull-request soit accceptée et puisse être mergée, il faut que : 

- tous les checks de la CI soient verts : les applications se sont déployées, les tests sont passés ;
- la description de la PR soit complète : Problème, proposition, remarque, pour tester
- la PR a reçu assez d'*approvals*

Le nombre de validations attendu peut légèrement changer selon les cas :

- De base, il faut que **3 personnes** aient vu le code. Donc pour un contributeur, on demandera 2 *approvals* pour chaque PR.
- Si la PR a été réalisée à plusieurs, il faut au moins 1 *approval* en plus des personnes ayant participé. Si l'équipe n'est pas assez grande : les 2 *approvals* peuvent être donnés par les personnes ayant participé : nous conseillons fortement de ne pas merger directement après le développement et de faire la review de sa propre PR à tête reposée.
- Si la PR concerne plusieurs équipes, il faut alors 1 *approval* par équipe concernée. Cette règle s'ajoute à la règle des 2 *approvals*


## Autres

### Branche `dev`

⚠️ On ne merge jamais `dev` dans une autre branche ⚠️

### Node.js

On ne commit le `package-lock.json` qu'en cas de modification du `package.json`
