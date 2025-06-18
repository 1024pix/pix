# Pix Changelog

# [5.137.0](https://github.com/1024pix/pix/compare/v5.136.1...v5.137.0) (2025-06-18)

### :rocket: Amélioration

- [#12499](https://github.com/1024pix/pix/pull/12499) Ajouter un bouton d'inscription à la fin d'un parcours anonyme (PIX-18016) 
- [#12465](https://github.com/1024pix/pix/pull/12465) Enlever les titres de grain de l'interface de Modulix (PIX-17911) 
- [#12562](https://github.com/1024pix/pix/pull/12562) Enregistrer les traces d'apprentissages pour les Questions A/B (QAB) (PIX-18001) 
- [#12550](https://github.com/1024pix/pix/pull/12550) Générer un token de vérification pour les utilisateurs anonymes (PIX-18021) 
- [#12541](https://github.com/1024pix/pix/pull/12541) Remplir l'onglet profil cible dans la page des complémentaires sur Pix Admin (PIX-18187). 
- [#12558](https://github.com/1024pix/pix/pull/12558) Retourner les participations de campagnes par page (PIX-18218). 

### :bug: Correction

- [#12578](https://github.com/1024pix/pix/pull/12578) Corriger des clés de traduction du bouton "s'inscrire" en nl, es, en (PIX-18326) 

### :building_construction: Tech

- [#12529](https://github.com/1024pix/pix/pull/12529) :truck: Déplace la route `generate username with temporary password` vers `src/prescription/` (pix-17853) 
- [#12544](https://github.com/1024pix/pix/pull/12544) Ajout d'une section "Process de traduction" sur la documentation 
- [#12536](https://github.com/1024pix/pix/pull/12536) Supprimer le feature toggle isNewAccountRecoveryEnabled (PIX-17518) 

### :arrow_up: Montée de version

- [#12576](https://github.com/1024pix/pix/pull/12576) Update nginx Docker tag to v1.27.5

## [5.136.1](https://github.com/1024pix/pix/compare/v5.136.0...v5.136.1) (2025-06-17)

### :bug: Correction

- [#12571](https://github.com/1024pix/pix/pull/12571) Corriger les niveaux des tags dans la page analyse et statistiques (PIX-18322) 

### :building_construction: Tech

- [#12534](https://github.com/1024pix/pix/pull/12534) Création de la table des challenges calibrés dans le datamart (PIX-18232). 
- [#12570](https://github.com/1024pix/pix/pull/12570) Supprimer l’utilisation du WebComponent cartes-a-retourner 

### :arrow_up: Montée de version

- [#12561](https://github.com/1024pix/pix/pull/12561) Update adobe/s3mock Docker tag to v4 (.circleci) 
- [#12563](https://github.com/1024pix/pix/pull/12563) Update adobe/s3mock Docker tag to v4 (docker) 
- [#12564](https://github.com/1024pix/pix/pull/12564) Update adobe/s3mock Docker tag to v4 (dossier racine) 
- [#12414](https://github.com/1024pix/pix/pull/12414) Update dependency @1024pix/pix-ui to ^55.21.1 (admin) 
- [#12565](https://github.com/1024pix/pix/pull/12565) Update dependency babel-plugin-ember-template-compilation to v3 (junior) 
- [#12557](https://github.com/1024pix/pix/pull/12557) Update dependency bcrypt to v6 (api) 
- [#12567](https://github.com/1024pix/pix/pull/12567) Update dependency ember-cp-validations to v7 (admin) 
- [#12569](https://github.com/1024pix/pix/pull/12569) Update dependency eslint-plugin-cypress to v5 (e2e)

# [5.136.0](https://github.com/1024pix/pix/compare/v5.135.0...v5.136.0) (2025-06-17)

### :rocket: Amélioration

- [#12514](https://github.com/1024pix/pix/pull/12514) Ajouter la suppression de participations / assessment / badge / trainings lors de la suppression d'un import SUP (PIX-18074) 
- [#12513](https://github.com/1024pix/pix/pull/12513) Faire disparaître les élements du toaster automatiquement lors du changement de page sur Pix Admin (PIX-18169). 
- [#12387](https://github.com/1024pix/pix/pull/12387) Nouveaux messages d'erreur lors d'une tentative de connexion (PIX-17949) 
- [#12554](https://github.com/1024pix/pix/pull/12554) Support des web-components Vue >=3.5.15 (PIX-18219) 

### :bug: Correction

- [#12547](https://github.com/1024pix/pix/pull/12547) Éviter d'appeller le LLM en mode preview (PIX-18295) 

### :building_construction: Tech

- [#12555](https://github.com/1024pix/pix/pull/12555) Suppression d'un script inutilisé. 
- [#12542](https://github.com/1024pix/pix/pull/12542) Suppression du service Campaign Media Compliance (PIX-18206). 

### :arrow_up: Montée de version

- [#12551](https://github.com/1024pix/pix/pull/12551) Update dependency @1024pix/epreuves-components to ^0.4.0 (junior) 
- [#12552](https://github.com/1024pix/pix/pull/12552) Update dependency @1024pix/epreuves-components to ^0.4.0 (mon-pix) 
- [#12553](https://github.com/1024pix/pix/pull/12553) Update dependency ember-source to ~6.5.0 (junior) 
- [#12539](https://github.com/1024pix/pix/pull/12539) Update slackapi/slack-github-action action to v2.1.0 (workflows)

# [5.135.0](https://github.com/1024pix/pix/compare/v5.134.0...v5.135.0) (2025-06-16)

### :rocket: Amélioration

- [#12535](https://github.com/1024pix/pix/pull/12535) Ajouter l'élément Custom message-conversation à la validation Joi (PIX-18220) 
- [#12527](https://github.com/1024pix/pix/pull/12527) Communication avec l’embed pix-llm dans une épreuve (PIX-18172) 
- [#12507](https://github.com/1024pix/pix/pull/12507) Création d'un script pour calculer la dette liée aux médias Modulix (PIX-18177) 
- [#12530](https://github.com/1024pix/pix/pull/12530) Créer la page Référentiel cadre sur Pix Admin (PIX-18186). 
- [#12532](https://github.com/1024pix/pix/pull/12532) Echanger le nom et le prénom du user dans le nom de l'attestation (PIX-17951) 
- [#12516](https://github.com/1024pix/pix/pull/12516) Gérer le bouton "Continuer" pour les modalités QAB, QCU déclarative et flashcards (PIX-18067) 
- [#12356](https://github.com/1024pix/pix/pull/12356) Pouvoir vérifier depuis Pix Admin si un utilisateur est en capacité de valider une quête (PIX-18008) 

### :bug: Correction

- [#12540](https://github.com/1024pix/pix/pull/12540) Corriger les liens de fiches récap des modules premieres-marches 
- [#12524](https://github.com/1024pix/pix/pull/12524) Problème d'affichage sur l'écran de réponse QROCM (PIX-18176) 

### :building_construction: Tech

- [#12509](https://github.com/1024pix/pix/pull/12509) :truck: Déplace la route `Campaign-participation` vers `src/devcomp/` 
- [#11800](https://github.com/1024pix/pix/pull/11800) Correction des deprecations EmberJs sur Pix Admin 
- [#12522](https://github.com/1024pix/pix/pull/12522) Retirer le feature toggle showNewResultPage 
- [#12519](https://github.com/1024pix/pix/pull/12519) Supprimer le campaignCode dans l'appel à la route /api/organization-learners (PIX-18191) 

### :arrow_up: Montée de version

- [#12537](https://github.com/1024pix/pix/pull/12537) Update dependency @1024pix/epreuves-components to ^0.3.1 (junior) 
- [#12531](https://github.com/1024pix/pix/pull/12531) Update dependency @1024pix/epreuves-components to ^0.3.1 (mon-pix) 
- [#12492](https://github.com/1024pix/pix/pull/12492) Update dependency postgres to v16.9 
- [#12446](https://github.com/1024pix/pix/pull/12446) Update dependency redis to v7.2.9

# [5.134.0](https://github.com/1024pix/pix/compare/v5.133.0...v5.134.0) (2025-06-13)

### :rocket: Amélioration

- [#12525](https://github.com/1024pix/pix/pull/12525) Créer routes pour l'intégration du LLM dans le contexte de l'évaluation (PIX-18171) 

### :bug: Correction

- [#12469](https://github.com/1024pix/pix/pull/12469) Récupération des erreurs lors de l'exécution du script fix-validated-live-alerts (PIX-18107). 

### :rewind: Retour en arrière

- [#12526](https://github.com/1024pix/pix/pull/12526) Revert "[BUMP] Update dependency @1024pix/epreuves-components to ^0.3.0 (mon-pix)"

### :building_construction: Tech

- [#12498](https://github.com/1024pix/pix/pull/12498) :hammer: Création d'un référentiel cadre à partir d'un profil cible (PIX-18131) 
- [#12506](https://github.com/1024pix/pix/pull/12506) :truck: Déplace `target-profile-training-repository` vers `src/devcomp/` 
- [#12510](https://github.com/1024pix/pix/pull/12510) Ajouter la permission pour le contenu dans le workflow qui ferme les PRs inactive depuis un mois 
- [#12502](https://github.com/1024pix/pix/pull/12502) Déplace l'information `associationDone` dans l'access-storage (PIX-18167). 
- [#12421](https://github.com/1024pix/pix/pull/12421) Enlever les sources junior du container RA front 
- [#12484](https://github.com/1024pix/pix/pull/12484) Supprimer le feature-toggle isV3CertificationAttestationEnabled (PIX-17340). 

### :arrow_up: Montée de version

- [#12520](https://github.com/1024pix/pix/pull/12520) Update dependency @1024pix/epreuves-components to ^0.3.0 (mon-pix)

# [5.133.0](https://github.com/1024pix/pix/compare/v5.132.0...v5.133.0) (2025-06-12)

### :rocket: Amélioration

- [#12504](https://github.com/1024pix/pix/pull/12504) Détacher les campaignParticipation supprimés des assessments et des badges non certifiants (PIX-18164). 
- [#12501](https://github.com/1024pix/pix/pull/12501) Enlever un mot d'une description (PIX-18168) 

### :bug: Correction

- [#12503](https://github.com/1024pix/pix/pull/12503) Modification CHANGELOG (PIX-18161). 

### :building_construction: Tech

- [#12463](https://github.com/1024pix/pix/pull/12463) :truck: Déplace `PrescriberRoleReporitory` vers `src/shared/` 
- [#12424](https://github.com/1024pix/pix/pull/12424) Bump Audit-logger dependencies 
- [#12508](https://github.com/1024pix/pix/pull/12508) Corriger le workflow pour fermer les PRs inactive depuis un mois 
- [#12462](https://github.com/1024pix/pix/pull/12462) Déplace le flag hasUserSeenJoinPage dans un storage spécifique à la logique d'accès (PIX-18100) 
- [#12505](https://github.com/1024pix/pix/pull/12505) Passer les feature toggles de metric à des variables d'environnement classique 
- [#12479](https://github.com/1024pix/pix/pull/12479) Suppression de plusieurs script Certif plus utilisés (PIX-16999).

## v5.132.0 (11/06/2025)


### :rocket: Amélioration
- [#12431](https://github.com/1024pix/pix/pull/12431) [FEATURE] Couper le lien entre user-recommended-training et la participation lors de la suppression de celle-ci (PIX-18049).

### :building_construction: Tech
- [#12483](https://github.com/1024pix/pix/pull/12483) [TECH] Ajouter un test d'intégration pour le usecase updateUserForAccountRecovery.
- [#12493](https://github.com/1024pix/pix/pull/12493) [TECH] Renomme une chaine de caractère dans un test.
- [#12494](https://github.com/1024pix/pix/pull/12494) [TECH] Corriger le test flaky sur le filter utilisateur dans PixAdmin (PIX-18163).
- [#12445](https://github.com/1024pix/pix/pull/12445) [TECH] Eviter d'appeler le endpoint GET /api/answers?assessmentId="assessmentId" pour gérer des affichages concernant le numéro d'épreuve courant côté PixApp.
- [#12495](https://github.com/1024pix/pix/pull/12495) [TECH] Supprimer la méthode lock du RedisClient.

### :bug: Correction

- [#12503](https://github.com/1024pix/pix/pull/12503) [BUGFIX]  Commit cc99f99cb82860928355efcac4a3012629b2f769

# [5.131.0](https://github.com/1024pix/pix/compare/v5.130.0...v5.131.0) (2025-06-11)

### :rocket: Amélioration

- [#12447](https://github.com/1024pix/pix/pull/12447) Améliorer les transitions entre les cartes de la modalité Question A/B (QAB) (PIX-18069) 
- [#12428](https://github.com/1024pix/pix/pull/12428) Anonymiser le prescrit quand on anonymise un utilisateur (PIX-17850). 
- [#12426](https://github.com/1024pix/pix/pull/12426) Modifier les wordings de la page d'analyse de résultats de campagne (PIX-17836). 
- [#12472](https://github.com/1024pix/pix/pull/12472) Ne plus parler de session de version dans admin (PIX-18109). 
- [#12449](https://github.com/1024pix/pix/pull/12449) Remplacer le campaignCode par un organizationId et redirectionUrl dans le usecase createAndReconcileUserToOrganizationLearner (PIX-18094) 

### :bug: Correction

- [#12458](https://github.com/1024pix/pix/pull/12458) Afficher 1 ligne par participation supprimé sur la page Participants dans PixAdmin (PIX-18080). 
- [#12491](https://github.com/1024pix/pix/pull/12491) Traduction manquante sur Mes attestations (PIX-18156) 

### :arrow_up: Montée de version

- [#12482](https://github.com/1024pix/pix/pull/12482) Update dependency ember-source to ~6.4.0 (junior)

## v5.130.0 (10/06/2025)


### :rocket: Amélioration
- [#12362](https://github.com/1024pix/pix/pull/12362) [FEATURE] WIP module mon premier prompt.
- [#12394](https://github.com/1024pix/pix/pull/12394) [FEATURE] WIP Create prompt-intermediaire.json.
- [#12297](https://github.com/1024pix/pix/pull/12297) [FEATURE] WIP Création d'un module sur les Deepfakes.
- [#12486](https://github.com/1024pix/pix/pull/12486) [FEATURE] Dernières corrections modules tmp-ia-fonctionnement-debut.json.

# [5.129.0](https://github.com/1024pix/pix/compare/v5.128.0...v5.129.0) (2025-06-10)

### :rocket: Amélioration

- [#12456](https://github.com/1024pix/pix/pull/12456) Ajouter l'historisation des actions lors de la suppression de prescrits (PIX-17974). 
- [#12464](https://github.com/1024pix/pix/pull/12464) Ajouter un feature toggle pour conserver ses pix après avoir participé à une campagne et s'être créé un compte (PIX-18015) 
- [#12442](https://github.com/1024pix/pix/pull/12442) Amélioration de la page de fin de certif sur Pix App (17963). 
- [#12388](https://github.com/1024pix/pix/pull/12388) WIP module IAG fonctionnement novice tmp-ia-fonctionnement-debut 

### :bug: Correction

- [#12461](https://github.com/1024pix/pix/pull/12461) Utiliser les knowledge element snapshot pour l'affichage des résultats individuel d'un prescrit dans PixOrga (PIX-17964). 

### :building_construction: Tech

- [#12454](https://github.com/1024pix/pix/pull/12454) :truck: Déplace le repository à propos des badges de certification vers `src/certification/shared/` 
- [#12444](https://github.com/1024pix/pix/pull/12444) :truck: Renomme les clefs de traduction d'attestation de certification (PIX-18093) 
- [#12467](https://github.com/1024pix/pix/pull/12467) :wastebasket: nettoyage des fichiers index du répertoire `lib/` 
- [#12485](https://github.com/1024pix/pix/pull/12485) Corriger la trad nl (PIX-18126) 
- [#12351](https://github.com/1024pix/pix/pull/12351) Refacto des attestations V2 (PIX-17940). 
- [#12430](https://github.com/1024pix/pix/pull/12430) Rendre le processus de connexion depuis un mediacentre agnostique des campagnes (PIX-18087) 
- [#12448](https://github.com/1024pix/pix/pull/12448) Supprimer le model API SessionVersion (PIX-18095).

# [5.128.0](https://github.com/1024pix/pix/compare/v5.127.0...v5.128.0) (2025-06-09)

### :rocket: Amélioration

- [#12451](https://github.com/1024pix/pix/pull/12451) Ajouter l'audit logger dans la suppression d'une participation d'une campagne (Pix-17975). 
- [#12429](https://github.com/1024pix/pix/pull/12429) Edition du fond pour le QCU déclaratif (PIX-17906) 
- [#12476](https://github.com/1024pix/pix/pull/12476) Modulix - remplacer le questionnaire en fin de module (PIX-18061) 
- [#12441](https://github.com/1024pix/pix/pull/12441) Revoir le comportement de la barre de progression du module (PIX-18090) 

### :building_construction: Tech

- [#12440](https://github.com/1024pix/pix/pull/12440)  :truck: Déplace la route `batch usename password generate` vers `src/prescription/organization-learner` (Pix-17851) 
- [#12450](https://github.com/1024pix/pix/pull/12450) :truck: Déplace la route de mise à jour de mot de passe pour l'organisationLearner (pix-17852) 
- [#12453](https://github.com/1024pix/pix/pull/12453) :truck: Déplace les routes de `framework` vers `src/learning-content/` 
- [#12439](https://github.com/1024pix/pix/pull/12439) Ne plus avoir de code spécifique v3 dans le usecase verify-candidate-identity (PIX-18091). 
- [#12434](https://github.com/1024pix/pix/pull/12434) Rendre la date de finalisation de session dépendante de la BDD (PIX-17939). 
- [#12473](https://github.com/1024pix/pix/pull/12473) Utiliser une boucle for pour exécuter du code asynchrone (PIX-18810) 

### :arrow_up: Montée de version

- [#12466](https://github.com/1024pix/pix/pull/12466) Update dependency @1024pix/pix-ui to ^55.21.0 (certif) 
- [#12468](https://github.com/1024pix/pix/pull/12468) Update dependency @1024pix/pix-ui to ^55.21.0 (junior) 
- [#12470](https://github.com/1024pix/pix/pull/12470) Update dependency @1024pix/pix-ui to ^55.21.0 (mon-pix) 
- [#12471](https://github.com/1024pix/pix/pull/12471) Update dependency @1024pix/pix-ui to ^55.21.0 (orga) 
- [#12477](https://github.com/1024pix/pix/pull/12477) Update dependency @1024pix/pix-ui to ^55.21.1 (certif) 
- [#12478](https://github.com/1024pix/pix/pull/12478) Update dependency @1024pix/pix-ui to ^55.21.1 (junior) 
- [#12480](https://github.com/1024pix/pix/pull/12480) Update dependency @1024pix/pix-ui to ^55.21.1 (mon-pix) 
- [#12481](https://github.com/1024pix/pix/pull/12481) Update dependency @1024pix/pix-ui to ^55.21.1 (orga) 
- [#12293](https://github.com/1024pix/pix/pull/12293) Update node

# [5.127.0](https://github.com/1024pix/pix/compare/v5.126.1...v5.127.0) (2025-06-06)

### :rocket: Amélioration

- [#12396](https://github.com/1024pix/pix/pull/12396) Arrêter d'utiliser le campaignCode sur les routes liées au model ScoOrganizationLearner de mon-pix (Pix-18050) 
- [#12452](https://github.com/1024pix/pix/pull/12452) Permettre la création d'un `client-application` sans juridiction via le script dédié. 
- [#12340](https://github.com/1024pix/pix/pull/12340) Utiliser le webcomponent `message-conversation` à la place de la vidéo (PIX-17921) 

### :bug: Correction

- [#12425](https://github.com/1024pix/pix/pull/12425) Ajustements graphiques et textuels pour la sortie du sco (PIX-18044) 
- [#12460](https://github.com/1024pix/pix/pull/12460) Corriger l'affichage du progress bar sur PixOrga (PIX-17762). 

### :building_construction: Tech

- [#12459](https://github.com/1024pix/pix/pull/12459) Mise à jour des dépendances PixAdmin (build and intl) 
- [#12419](https://github.com/1024pix/pix/pull/12419) Supprimer la version de session dans le usecase retrieve-last-or-create-certification-course (PIX-18075).

## [5.126.1](https://github.com/1024pix/pix/compare/v5.126.0...v5.126.1) (2025-06-05)

### :building_construction: Tech

- [#12443](https://github.com/1024pix/pix/pull/12443) :truck: Renomme le script de génération de certificats par id de session (pix-18092)

# [5.126.0](https://github.com/1024pix/pix/compare/v5.125.0...v5.126.0) (2025-06-04)

### :rocket: Amélioration

- [#12416](https://github.com/1024pix/pix/pull/12416) Remplacer Matomo par Plausible (PIX-18037). 

### :arrow_up: Montée de version

- [#12437](https://github.com/1024pix/pix/pull/12437) Update dependency @1024pix/epreuves-components to ^0.2.1 (junior) 
- [#12438](https://github.com/1024pix/pix/pull/12438) Update dependency @1024pix/epreuves-components to ^0.2.1 (mon-pix) 
- [#12432](https://github.com/1024pix/pix/pull/12432) Update dependency @1024pix/stylelint-config to ^5.1.32 (certif) 
- [#12433](https://github.com/1024pix/pix/pull/12433) Update dependency @1024pix/stylelint-config to ^5.1.32 (junior) 
- [#12435](https://github.com/1024pix/pix/pull/12435) Update dependency @1024pix/stylelint-config to ^5.1.32 (mon-pix) 
- [#12436](https://github.com/1024pix/pix/pull/12436) Update dependency @1024pix/stylelint-config to ^5.1.32 (orga)

# [5.125.0](https://github.com/1024pix/pix/compare/v5.124.0...v5.125.0) (2025-06-03)

### :rocket: Amélioration

- [#12403](https://github.com/1024pix/pix/pull/12403) Détacher les assessments quand on supprime une participation (PIX-18047). 
- [#12415](https://github.com/1024pix/pix/pull/12415) Gérer la modalité Question A/B (QAB) dans le front (PIX-18000) 
- [#12375](https://github.com/1024pix/pix/pull/12375) Sur le domaine pix.org mettre "en" comme fallback de locale sur tous les frontaux (PIX-17758) 
- [#12371](https://github.com/1024pix/pix/pull/12371) Vocaliser le changement d'étape sur un module (PIX-17934) (PIX-17910) 

### :bug: Correction

- [#12413](https://github.com/1024pix/pix/pull/12413) Actualiser les informations d'une invitation à rejoindre un centre de certification lorsqu'on réinvite un utilisateur (PIX-18064) 
- [#12408](https://github.com/1024pix/pix/pull/12408) Corrections graphiques sur le formulaire d'inscription / connexion d'une campagne SCO (PIX-17926) 

### :building_construction: Tech

- [#12392](https://github.com/1024pix/pix/pull/12392) :truck: Renomme le cas d'utilisation `findCertificationAttestationForDivision` sans le terme `attestation` (pix-18052) 
- [#12380](https://github.com/1024pix/pix/pull/12380) :truck: Renommer le cas d'utilisation `get-certification-attestations-for-session` pour enlever `attestations` (PIX-18028) 
- [#12418](https://github.com/1024pix/pix/pull/12418) Bump des dépendances de linters et formatters Pix Admin 
- [#12423](https://github.com/1024pix/pix/pull/12423) Mise à jour de dépendances Pix Admin 
- [#12404](https://github.com/1024pix/pix/pull/12404) Remplacer certaines dependances de Pix Admin 
- [#12420](https://github.com/1024pix/pix/pull/12420) Retirer des commentaires de linter pour retirer les erreurs (PIX-18077).

# [5.124.0](https://github.com/1024pix/pix/compare/v5.123.0...v5.124.0) (2025-06-02)

### :rocket: Amélioration

- [#12398](https://github.com/1024pix/pix/pull/12398) Afficher la complémentaire dans le PDF du certificat en cas de passage de la double certification en V3 (PIX-17891).  
- [#12361](https://github.com/1024pix/pix/pull/12361) Ajout d'un endpoint pour poursuivre une conversation avec le LLM (PIX-17904) 
- [#12417](https://github.com/1024pix/pix/pull/12417) Ajout d’un module de démonstration de ChatPix (PIX-17786) 
- [#12406](https://github.com/1024pix/pix/pull/12406) Modifier le texte de la modale de suppression de participation dans PixAdmin (PIX-18058) 

### :building_construction: Tech

- [#12302](https://github.com/1024pix/pix/pull/12302) :truck: Déplace la route et le cas d'utilisation `ScoOrganizationLearnerAccountRecovery` 
- [#12378](https://github.com/1024pix/pix/pull/12378) :truck: Retire l'utilisation du mot `attestation` du cas d'utilisation de récupération d'un certificat (PIX-18024) 
- [#12391](https://github.com/1024pix/pix/pull/12391) :truck: Utilise le terme `certificat` plutôt que `attestation` dans une erreur (PIX-18051)

# [5.123.0](https://github.com/1024pix/pix/compare/v5.122.0...v5.123.0) (2025-05-30)

### :rocket: Amélioration

- [#12400](https://github.com/1024pix/pix/pull/12400) Permettre de créer un référentiel cadre (PIX-18046).

# [5.122.0](https://github.com/1024pix/pix/compare/v5.121.0...v5.122.0) (2025-05-29)

### :rocket: Amélioration

- [#12384](https://github.com/1024pix/pix/pull/12384) Afficher CLEA dans le certificat V3 sur Pix App (PIX-17892). 
- [#12385](https://github.com/1024pix/pix/pull/12385) Anonymiser les données d'un participant à la suppression de celui-ci (PIX-17488). 

### :building_construction: Tech

- [#12407](https://github.com/1024pix/pix/pull/12407) Augmenter le timeout sur des tests de generation PDF 
- [#12401](https://github.com/1024pix/pix/pull/12401) Modifier la table certification-frameworks-challenges (PIX-18054). 
- [#12393](https://github.com/1024pix/pix/pull/12393) Ne pas declencher la CI à chaque ajout/suppression de label 
- [#12220](https://github.com/1024pix/pix/pull/12220) Retirer phrase du dépôt 
- [#12395](https://github.com/1024pix/pix/pull/12395) Vide la table `organizations_cover_rates` après chaque test. 

### :arrow_up: Montée de version

- [#12397](https://github.com/1024pix/pix/pull/12397) Update dependency @1024pix/eslint-plugin to ^2.1.5 (api) 
- [#12399](https://github.com/1024pix/pix/pull/12399) Update dependency @1024pix/eslint-plugin to ^2.1.5 (audit-logger) 
- [#12402](https://github.com/1024pix/pix/pull/12402) Update dependency @1024pix/eslint-plugin to ^2.1.5 (certif) 
- [#12405](https://github.com/1024pix/pix/pull/12405) Update dependency @1024pix/eslint-plugin to ^2.1.5 (dossier racine) 
- [#12409](https://github.com/1024pix/pix/pull/12409) Update dependency @1024pix/eslint-plugin to ^2.1.5 (e2e-playwright) 
- [#12410](https://github.com/1024pix/pix/pull/12410) Update dependency @1024pix/eslint-plugin to ^2.1.5 (junior) 
- [#12411](https://github.com/1024pix/pix/pull/12411) Update dependency @1024pix/eslint-plugin to ^2.1.5 (mon-pix) 
- [#12412](https://github.com/1024pix/pix/pull/12412) Update dependency @1024pix/eslint-plugin to ^2.1.5 (orga) 
- [#12267](https://github.com/1024pix/pix/pull/12267) Update dependency webpack to v5.99.9 (junior)

# [5.121.0](https://github.com/1024pix/pix/compare/v5.120.0...v5.121.0) (2025-05-28)

### :rocket: Amélioration

- [#12291](https://github.com/1024pix/pix/pull/12291) Inviter les utilisateurs d'un SSO sup à récupérer leur ancien compte sco  (PIX-17510) 

### :bug: Correction

- [#12370](https://github.com/1024pix/pix/pull/12370) Récompense de quête non partagée avec l'organisation (PIX-17944) 

### :building_construction: Tech

- [#12390](https://github.com/1024pix/pix/pull/12390) Correction du flaky sur la route Saml POST (PIX-18045) 
- [#12383](https://github.com/1024pix/pix/pull/12383) E2E flakies: s'assurer que le serveur X11 est démarré sur la CI

# [5.120.0](https://github.com/1024pix/pix/compare/v5.119.0...v5.120.0) (2025-05-27)

### :rocket: Amélioration

- [#12367](https://github.com/1024pix/pix/pull/12367) Afficher l'analyse des resultats par competence. (PIX-17675) 
- [#12344](https://github.com/1024pix/pix/pull/12344) Ajouter la possibilité de désactiver l'authentification par mot de passe sur Pix admin (PIX-17820) 
- [#12374](https://github.com/1024pix/pix/pull/12374) Communication entre Pix App et l’embed pix-llm (PIX-17788) 
- [#12373](https://github.com/1024pix/pix/pull/12373) Créer le nouvel élément Question A/B (QAB) dans l'API (PIX-17831) 
- [#12382](https://github.com/1024pix/pix/pull/12382) Supprimer les stepsLabels et avoir toutes les jauges sur 8 niveaux (PIX-18033) 

### :bug: Correction

- [#12348](https://github.com/1024pix/pix/pull/12348) Corriger le champ "Adresse email" du formulaire de sortie du sco (PIX-17516) 

### :building_construction: Tech

- [#12372](https://github.com/1024pix/pix/pull/12372) Correction test flaky certif (PIX-17996). 
- [#12377](https://github.com/1024pix/pix/pull/12377) Exposer la doc de l’API MaDDo sur /documentation/maddo 
- [#12381](https://github.com/1024pix/pix/pull/12381) Flaky sur le repo campaign participation 
- [#12369](https://github.com/1024pix/pix/pull/12369) Nettoyage de dépendances et packages.json de PixAdmin 
- [#12253](https://github.com/1024pix/pix/pull/12253) Passer le feature toggle du bouton de vocalisation au nouveau système 
- [#12366](https://github.com/1024pix/pix/pull/12366) Préparer l'anonymisation complète des organisations learners (PIX-17849).  
- [#12326](https://github.com/1024pix/pix/pull/12326) Retirer l'ancienne navbar de Pix app (PIX-17994). 
- [#12357](https://github.com/1024pix/pix/pull/12357) Seeds PRO pour certif (PIX-17295).

# [5.119.0](https://github.com/1024pix/pix/compare/v5.118.0...v5.119.0) (2025-05-26)

### :rocket: Amélioration

- [#12345](https://github.com/1024pix/pix/pull/12345) Création d'un endpoint côté API pour démarrer une conversation avec le LLM dans le cadre d'une épreuve avec un embed de prompt LLM (PIX-17903) 
- [#12321](https://github.com/1024pix/pix/pull/12321) Enregistrer createdBy à la création d’un Centre de certification (PIX-16186) 
- [#12352](https://github.com/1024pix/pix/pull/12352) Exécution du simulateur de déroulé sur des certifications complémentaires (PIX-17936). 
- [#12360](https://github.com/1024pix/pix/pull/12360) Modifier les valeurs pour l'affichage des niveaux dans les tags (PIX-17967) 

### :building_construction: Tech

- [#12283](https://github.com/1024pix/pix/pull/12283) Améliore la partie SQL de la vérification du code de certification (Pix-17791) 
- [#12335](https://github.com/1024pix/pix/pull/12335) Créer un script de suppression des méthodes de connexion pour les anciens utilisateurs scolaires (PIX-17515). 
- [#12358](https://github.com/1024pix/pix/pull/12358) Récupérer la configuration de l'algo v3 dans la BDD (PIX-17937). 
- [#12339](https://github.com/1024pix/pix/pull/12339) Remplacer des helpers dans admin par du code natif

# [5.118.0](https://github.com/1024pix/pix/compare/v5.117.0...v5.118.0) (2025-05-23)

### :rocket: Amélioration

- [#12353](https://github.com/1024pix/pix/pull/12353) Afficher les POIC dans Modulix (PIX-17941) 
- [#12232](https://github.com/1024pix/pix/pull/12232) Rendre générique le/les SSO utilisé(s) pour l'accès à Pix Admin (pouvoir utiliser ProConnect) (PIX-17895) 
- [#12350](https://github.com/1024pix/pix/pull/12350) Supprimer la sidebar (PIX-17935) 
- [#12347](https://github.com/1024pix/pix/pull/12347) Vider le champ mot de passe de la mire de connexion Pix App en cas d'erreur (PIX-17928) 

### :building_construction: Tech

- [#12114](https://github.com/1024pix/pix/pull/12114) :truck: Déplace le cas d'utilisation `completeAssessment` vers le répertoire `src/evaluation/` 
- [#12115](https://github.com/1024pix/pix/pull/12115) :truck: Déplace le cas d'utilisation `getCorrectionForAnswer` vers `src/evaluation/` 
- [#12215](https://github.com/1024pix/pix/pull/12215) Ajouter un workflow pour gérer les vieilles pull requests 
- [#12280](https://github.com/1024pix/pix/pull/12280) Améliorer des requêtes SQL des live-alerts (PIX-17318). 
- [#12359](https://github.com/1024pix/pix/pull/12359) Remplacer ember-flatpickr par un input date natif dans PixAdmin 
- [#12363](https://github.com/1024pix/pix/pull/12363) Supprimer la seed SSO OIDC PixAdmin 

### :arrow_up: Montée de version

- [#12364](https://github.com/1024pix/pix/pull/12364) Update dependency @1024pix/pix-ui to ^55.19.2 (mon-pix)

# [5.117.0](https://github.com/1024pix/pix/compare/v5.116.0...v5.117.0) (2025-05-22)

### :rocket: Amélioration

- [#12294](https://github.com/1024pix/pix/pull/12294) Ajouter le PixFilterBanner sur la page Utilisateur dans PixAdmin (PIX-17287) 

### :building_construction: Tech

- [#12108](https://github.com/1024pix/pix/pull/12108) :truck: Déplace le cas d'utilisation `create preview assessment` vers le repertoire `src/shared/` 
- [#12342](https://github.com/1024pix/pix/pull/12342) Corrige le lockfile pour qu'il soit cohérent avec le fichier package.json 
- [#12354](https://github.com/1024pix/pix/pull/12354) Revenir à la version 55.18.1 de `pix-ui` sur `mon-pix` et `junior` 
- [#12336](https://github.com/1024pix/pix/pull/12336) Suppression de dépendances non utilisées dans App/Admin/Junior

# [5.116.0](https://github.com/1024pix/pix/compare/v5.115.0...v5.116.0) (2025-05-21)

### :rocket: Amélioration

- [#12325](https://github.com/1024pix/pix/pull/12325) Ajoute la colonne "Type de campagne" dans la création de campagnes en masse (PIX-17859) 
- [#12277](https://github.com/1024pix/pix/pull/12277) Appliquer le nouveau design de la liste des certifications sur Pix App (PIX-17664). 
- [#12349](https://github.com/1024pix/pix/pull/12349) Créer la table des référentiels cadres (PIX-17884). 

### :bug: Correction

- [#12331](https://github.com/1024pix/pix/pull/12331) Corriger l'import des modifiers provenant de PixUI (PIX-17922) 
- [#12346](https://github.com/1024pix/pix/pull/12346) Corriger l'interpolation des variables dans la github action de création de version jira 
- [#12317](https://github.com/1024pix/pix/pull/12317) Pix Junior - Bouton hors du cadre des cartes de mission (PIX-17854) 

### :building_construction: Tech

- [#12343](https://github.com/1024pix/pix/pull/12343) Corriger une injection de dépendances dans les tests qui était mal réalisée 
- [#12254](https://github.com/1024pix/pix/pull/12254) Migrer le suivi matomo vers plausible sur mon-pix 
- [#12334](https://github.com/1024pix/pix/pull/12334) Modifier le token github utilisé par le workflow de release 
- [#12333](https://github.com/1024pix/pix/pull/12333) Suppression de Husky et Lint-staged 
- [#12332](https://github.com/1024pix/pix/pull/12332) Suppression des blueprints custom EmberJS 
- [#12296](https://github.com/1024pix/pix/pull/12296) Supprimer le script pour archiver en masse des centres de certification (PIX-17843) 

### :arrow_up: Montée de version

- [#12327](https://github.com/1024pix/pix/pull/12327) Update dependency @1024pix/pix-ui to ^55.18.2 (admin) 
- [#12328](https://github.com/1024pix/pix/pull/12328) Update dependency @1024pix/pix-ui to ^55.18.2 (certif) 
- [#12329](https://github.com/1024pix/pix/pull/12329) Update dependency @1024pix/pix-ui to ^55.18.2 (junior) 
- [#12330](https://github.com/1024pix/pix/pull/12330) Update dependency @1024pix/pix-ui to ^55.18.2 (mon-pix) 
- [#12337](https://github.com/1024pix/pix/pull/12337) Update dependency @1024pix/pix-ui to ^55.19.0 (admin) 
- [#12338](https://github.com/1024pix/pix/pull/12338) Update dependency @1024pix/pix-ui to ^55.19.0 (orga)

# [5.115.0](https://github.com/1024pix/pix/compare/v5.114.0...v5.115.0) (2025-05-20)

### :rocket: Amélioration

- [#12308](https://github.com/1024pix/pix/pull/12308) Ajout du QCU déclaratif côté Front (PIX-17684) 
- [#12319](https://github.com/1024pix/pix/pull/12319) Ajouter une colone createdBy à la table certification-centers (PIX-17899) 
- [#12286](https://github.com/1024pix/pix/pull/12286) Anonymiser les badges lors de la suppression des participations (PIX-17712) 
- [#12303](https://github.com/1024pix/pix/pull/12303) Empêcher Ember de gérer les erreurs 403 de type HTML dans PixApp (PIX-17835). 
- [#12304](https://github.com/1024pix/pix/pull/12304) Mettre à jour et generaliser updatedAt à l'anonymisation (PIX-17867) 
- [#12282](https://github.com/1024pix/pix/pull/12282) Modifier l'affichage de la dernière page de récupération de compte (PIX-17505) 
- [#12312](https://github.com/1024pix/pix/pull/12312) Modulix - QROCM : corriger choix input pour autoriser Number (PIX-17424) 
- [#12313](https://github.com/1024pix/pix/pull/12313) Permettre d'anonymiser au grain d'une campagne lors de la suppression de celle-ci (PIX-17847) 
- [#12305](https://github.com/1024pix/pix/pull/12305) Utilise le composant CoverRateGauge dans la table d'analyse des resultats par sujets / compétences (PIX-17857) 

### :bug: Correction

- [#12324](https://github.com/1024pix/pix/pull/12324) Afficher les CF dans "Mes formations" quand l'envoi des résultats est désactivé (PIX-17581) 
- [#12320](https://github.com/1024pix/pix/pull/12320) Changer le déclencheur de l'action 
- [#12323](https://github.com/1024pix/pix/pull/12323) Corriger la mention du groupe dans le message slack envoyé par le workflow de release. 
- [#12318](https://github.com/1024pix/pix/pull/12318) Mauvais wording lors du signalement d'une épreuve avec pièce jointe (PIX-17677) 

### :building_construction: Tech

- [#12311](https://github.com/1024pix/pix/pull/12311) Mise à jour de librairies sur Pix-Certif. 
- [#12284](https://github.com/1024pix/pix/pull/12284) Nettoyage de code inutil suite et fin de (PIX-17709) 
- [#12316](https://github.com/1024pix/pix/pull/12316) Remplacer inject par service de l'import @ember/service 
- [#12322](https://github.com/1024pix/pix/pull/12322) Remplacer l'utilisation du slug d'un module par l'id (PIX-17701)

# [5.114.0](https://github.com/1024pix/pix/compare/v5.113.0...v5.114.0) (2025-05-19)

### :rocket: Amélioration

- [#12265](https://github.com/1024pix/pix/pull/12265) Ajouter une action "Archiver en masse des organisations" dans Pix Admin (PIX-17151) 
- [#12310](https://github.com/1024pix/pix/pull/12310) Améliorer le design des modules (PIX-17833) 
- [#12257](https://github.com/1024pix/pix/pull/12257) Faire usage du mot attestation pour les certificats V2 sur Pix App (PIX-17507). 

### :building_construction: Tech

- [#12300](https://github.com/1024pix/pix/pull/12300) :wastebasket: Suppression de la construction du graphique Sankey pour le suivi de migration des bounded context 
- [#12299](https://github.com/1024pix/pix/pull/12299) :wastebasket: Supprime un controller inutilisé 
- [#12314](https://github.com/1024pix/pix/pull/12314) Correction de deprecation SCSS dans Pix Orga 
- [#12301](https://github.com/1024pix/pix/pull/12301) Correction des flakies causés par Chrome Headless 
- [#12298](https://github.com/1024pix/pix/pull/12298) Mise à jour des packages sur PixOrga (PIX-17866)

## v5.113.0 (16/05/2025)


### :rocket: Amélioration
- [#12285](https://github.com/1024pix/pix/pull/12285) [FEATURE] Supprimer les méthode d'authentifications GAR et nom d'utilisateur lors de la sortie du sco (PIX-17509).
- [#12288](https://github.com/1024pix/pix/pull/12288) [FEATURE] Streamer/Batch les lignes CSV du script d'anonymisation (PIX-17830).

### :building_construction: Tech
- [#12307](https://github.com/1024pix/pix/pull/12307) [TECH] Séparer 2 commandes dans la github action de création de version jira.
- [#12268](https://github.com/1024pix/pix/pull/12268) [TECH] Migration DDD : migration de api/lib/infrastructure/authentication.js vers src/ (PIX-17797).
- [#12295](https://github.com/1024pix/pix/pull/12295) [TECH] Retirer le script de rattrapage de donnée sur l'anonymisation (PIX-17841).

### :arrow_up: Montée de version
- [#12309](https://github.com/1024pix/pix/pull/12309) [BUMP] Update dependency @1024pix/pix-ui to ^55.18.2 (orga).

## v5.112.0 (16/05/2025)


### :rocket: Amélioration
- [#12269](https://github.com/1024pix/pix/pull/12269) [FEATURE] Permettre la suppression d'une campaign-participation avec anonymisation (Pix-17709).

### :building_construction: Tech
- [#12292](https://github.com/1024pix/pix/pull/12292) [TECH] Automatiser la création de version Jira à la création d’un nouveau tag .

### :bug: Correction
- [#12272](https://github.com/1024pix/pix/pull/12272) [BUGFIX] Corrige un bug qui permettait la prise en compte de participations à des campagnes d'autres organisations dans les quêtes (PIX-17783).

## v5.111.0 (15/05/2025)


### :rocket: Amélioration
- [#12290](https://github.com/1024pix/pix/pull/12290) [FEATURE] Modifier le message de la notification Slack post release.
- [#12278](https://github.com/1024pix/pix/pull/12278) [FEATURE] Ajouter le type d'élément custom dans le get-element-csv (PIX-17426).
- [#12249](https://github.com/1024pix/pix/pull/12249) [FEATURE] Traiter les événements "PASSAGE_TERMINATED" comme les autres enregistrements de traces d'apprentissage (PIX-17663)(PIX-16729).
- [#12276](https://github.com/1024pix/pix/pull/12276) [FEATURE] Support nouveau type d'element `qcu-declarative`(PIX-17683).

### :building_construction: Tech
- [#12214](https://github.com/1024pix/pix/pull/12214) [TECH] Vraie simulation de certification V3 dans les seeds.
- [#12211](https://github.com/1024pix/pix/pull/12211) [TECH] Utiliser Stages acquisitions dans la page des Résultats d'une campagne de type ASSESSMENT (Pix-17297).
- [#12262](https://github.com/1024pix/pix/pull/12262) [TECH] Supprimer le feature-toggle ADJUST_CERTIFICATION_ACCESSIBILITY (PIX-17723).

### :bug: Correction
- [#12289](https://github.com/1024pix/pix/pull/12289) [BUGFIX] Encoder les apostrophes dans les PDF v3 (PIX-17829).

## v5.110.0 (14/05/2025)


### :rocket: Amélioration
- [#12271](https://github.com/1024pix/pix/pull/12271) [FEATURE] Aligner les columns de tableaux dans la page d'analyse de résultats (PIX-17803).
- [#12248](https://github.com/1024pix/pix/pull/12248) [FEATURE] Envoyer une notification Slack suite à une release.
- [#12270](https://github.com/1024pix/pix/pull/12270) [FEATURE] Afficher les titres des grains dans la navbar (PIX-17587).

### :building_construction: Tech
- [#12241](https://github.com/1024pix/pix/pull/12241) [TECH] optimisation d'une requête certif.
- [#12258](https://github.com/1024pix/pix/pull/12258) [TECH] Déplacer le feature toggle Companion dans le front mon-pix (PIX-17805).

### :bug: Correction
- [#12260](https://github.com/1024pix/pix/pull/12260) [BUGFIX] Corriger le script de rattrapage de données sur la suppression des dates (PIX-17731).
- [#12279](https://github.com/1024pix/pix/pull/12279) [BUGFIX] Ajout d'un await manquant dans un test sur la page du taux de couverture (PIX-17811).
- [#12263](https://github.com/1024pix/pix/pull/12263) [BUGFIX] Retirer la contrainte qui veut qu'une organisation fille ait le même type que l'organisation mère (PIX-17775).

### :coffee: Autre
- [#12275](https://github.com/1024pix/pix/pull/12275) Revert "[FEATURE] Afficher les titres des grains dans la navbar (PIX-17587)" (PIX-17587).

## v5.109.0 (13/05/2025)


### :rocket: Amélioration
- [#12252](https://github.com/1024pix/pix/pull/12252) [FEATURE] Affichage du positionnement global sur la nouvelle page d'analyse de campagne (PIX-17026).
- [#12264](https://github.com/1024pix/pix/pull/12264) [FEATURE] Ajout d'un boolean pour activer/désactiver la nouvelle suppression (PIX-17706).
- [#12244](https://github.com/1024pix/pix/pull/12244) [FEATURE] : Envoyer tous les passage events de type FLASHCARDS au service passage-events (PIX-17779).
- [#12226](https://github.com/1024pix/pix/pull/12226) [FEATURE] Alignement du footer sur le contenu (pix-17757).
- [#12225](https://github.com/1024pix/pix/pull/12225) [FEATURE] Changement logo marianne (PIX-17399).

### :building_construction: Tech
- [#12242](https://github.com/1024pix/pix/pull/12242) [TECH] Optimisation de requête.
- [#12238](https://github.com/1024pix/pix/pull/12238) [TECH] Ajout du juryId sur la route de rescoring (PIX-17781).

### :arrow_up: Montée de version
- [#12266](https://github.com/1024pix/pix/pull/12266) [BUMP] Update dependency @1024pix/stylelint-config to ^5.1.31 (orga).
- [#12261](https://github.com/1024pix/pix/pull/12261) [BUMP] Update dependency @1024pix/stylelint-config to ^5.1.31 (mon-pix).
- [#12259](https://github.com/1024pix/pix/pull/12259) [BUMP] Update dependency @1024pix/stylelint-config to ^5.1.31 (junior).
- [#12256](https://github.com/1024pix/pix/pull/12256) [BUMP] Update dependency @1024pix/stylelint-config to ^5.1.31 (certif).
- [#12255](https://github.com/1024pix/pix/pull/12255) [BUMP] Update dependency @1024pix/stylelint-config to ^5.1.31 (admin).

## v5.108.0 (12/05/2025)


### :rocket: Amélioration
- [#12247](https://github.com/1024pix/pix/pull/12247) [FEATURE] Réinitialiser le numéro de séquence lors du démarrage d'un passage dans Pix App (PIX-17710).

### :building_construction: Tech
- [#12027](https://github.com/1024pix/pix/pull/12027) [TECH] Supprimer le code du feature toggle isPixAdminNewSidebarEnabled (PIX-17458).
- [#12203](https://github.com/1024pix/pix/pull/12203) [TECH] Déplacer les Banner Alert dans le PixAppLayout de PixApp (PIX-17724).

### :bug: Correction
- [#12222](https://github.com/1024pix/pix/pull/12222) [BUGFIX] Ne pas interrompre le script d'envoi d'invitations en masse à rejoindre une organisation (PIX-16645).
- [#12224](https://github.com/1024pix/pix/pull/12224) [BUGFIX] Corriger le calcul de résultat d'une étape partiellement atteinte (PIX-17751).
- [#12213](https://github.com/1024pix/pix/pull/12213) [BUGFIX] Ne plus retourner d'erreur BDD lors d'une violation de contrainte sur un double insertion de feature sur un learner (PIX-17734).

## v5.107.0 (09/05/2025)


### :rocket: Amélioration
- [#12245](https://github.com/1024pix/pix/pull/12245) [FEATURE] Élargir les contraintes de UserAnonymizedEventLoggingJob pour pouvoir traiter tous les événements  (PIX-17789).
- [#12246](https://github.com/1024pix/pix/pull/12246) [FEATURE] Supprimer les contraintes non génériques dans AuditLogger (PIX-17790).
- [#12218](https://github.com/1024pix/pix/pull/12218) [FEATURE] Récupérer les informations nécessaires à l'affichage dynamique de la récupération de compte (PIX-17504).
- [#12243](https://github.com/1024pix/pix/pull/12243) [FEATURE] Supprimer les contraintes non génériques dans la table audit-log (PIX-17737).
- [#12188](https://github.com/1024pix/pix/pull/12188) [FEATURE] Afficher la nouvelle page d'analyse de résultat.
- [#12076](https://github.com/1024pix/pix/pull/12076) [FEATURE] Création module au-dela-des-mots-de-passe (débutant).
- [#12184](https://github.com/1024pix/pix/pull/12184) [FEATURE] Amélioration des certificats V2 sur Pix App (PIX-17632).
- [#12227](https://github.com/1024pix/pix/pull/12227) [FEATURE] Créer un service pour enregistrer une séquence d'événements dans un passage (PIX-16955).

### :building_construction: Tech
- [#12234](https://github.com/1024pix/pix/pull/12234) [TECH] Ajoute la gestion des juridictions dans le script de gestion des applications clientes.
- [#12239](https://github.com/1024pix/pix/pull/12239) [TECH] Corriger le flaky sur la route passage de Pix App (PIX-17784).
- [#12240](https://github.com/1024pix/pix/pull/12240) [TECH] Améliorer les models swagger de Maddo.
- [#12230](https://github.com/1024pix/pix/pull/12230) [TECH] Migrer le feature toggle de basculement synchrone/asynchrone des quêtes vers le nouveaux système (PIX-17761).
- [#12228](https://github.com/1024pix/pix/pull/12228) [TECH] Migrer le feature toggle de l'activation des quêtes vers le nouveaux système (PIX-17760).

### :bug: Correction
- [#12208](https://github.com/1024pix/pix/pull/12208) [BUGFIX] Les "embed" des modules n'acceptent pas le copier-coller (PIX-17602).

## v5.106.0 (07/05/2025)


### :rocket: Amélioration
- [#12159](https://github.com/1024pix/pix/pull/12159) [FEATURE] Appeler la route d'archivage des centres de certification en lot depuis Pix Admin (PIX-17628).
- [#12217](https://github.com/1024pix/pix/pull/12217) [FEATURE] Assurer cohérence du sequenceNumber dans les events enregistrés (PIX-17708).
- [#12202](https://github.com/1024pix/pix/pull/12202) [FEATURE] Ajout d'une route de rescoring de certification (PIX-17625).

### :building_construction: Tech
- [#12110](https://github.com/1024pix/pix/pull/12110) [TECH] :truck: Déplace le cas d'utilisation `find competence evaluations by assessment` vers le répertoire `src/shared/`.
- [#12231](https://github.com/1024pix/pix/pull/12231) [TECH] Renommage de CertificationRescoredByScript.
- [#12172](https://github.com/1024pix/pix/pull/12172) [TECH] Passage au format GJS sur PixApp.
- [#12219](https://github.com/1024pix/pix/pull/12219) [TECH] Suppression de la colonne isV3Pilot en BDD (PIX-17580).

### :bug: Correction
- [#12212](https://github.com/1024pix/pix/pull/12212) [BUGFIX] Supprimer les date de legal-document-version-user-acceptances lorsqu'on anonymise un utilisateur (PIX-17730).

### :arrow_up: Montée de version
- [#12237](https://github.com/1024pix/pix/pull/12237) [BUMP] Update Node.js to v22.15.0.

## v5.105.0 (06/05/2025)


### :rocket: Amélioration
- [#12137](https://github.com/1024pix/pix/pull/12137) [FEATURE] Améliorer l'UX de l'écran de connexion à l'espace surveillant (PIX-17460).
- [#12183](https://github.com/1024pix/pix/pull/12183) [FEATURE] Retirer le feature toggle `isResultsSharedModalEnabled` (PIX-17336).

### :building_construction: Tech
- [#12216](https://github.com/1024pix/pix/pull/12216) [TECH] Remplacer l'API Data par l'usage du datamart (PIX-17718).
- [#12161](https://github.com/1024pix/pix/pull/12161) [TECH]  utiliser des modèles intermédiaires pour la calcul du taux de couverture par tube et par comptétence (PIX-17700).

### :bug: Correction
- [#12223](https://github.com/1024pix/pix/pull/12223) [BUGFIX] Positionner le résultat global à partiellement atteint quand au moins une étape est réussie.

## v5.104.0 (05/05/2025)


### :building_construction: Tech
- [#12135](https://github.com/1024pix/pix/pull/12135) [TECH] :recycle: Renomme les fichiers utilitaires PDF de l'infrastructure certification en certificat (pix-17607).
- [#12109](https://github.com/1024pix/pix/pull/12109) [TECH] :truck: Déplace le cas d'utilisation `getAssessment` vers `src/evaluation/`.

## v5.103.0 (05/05/2025)


### :rocket: Amélioration
- [#12205](https://github.com/1024pix/pix/pull/12205) [FEATURE] Replication de data_pro_campaigns_kpi_aggregated vers organizations_cover_rates (PIX-17716).
- [#12198](https://github.com/1024pix/pix/pull/12198) [FEATURE] Ajouter un feature toggle pour la nouvelle récupération de compte (PIX-17503).

### :building_construction: Tech
- [#12209](https://github.com/1024pix/pix/pull/12209) [TECH] Ne pas configurer les jobs PgBoss si PGBOSS_CONNECTION_POOL_MAX_SIZE=0 (PIX-17727).
- [#12206](https://github.com/1024pix/pix/pull/12206) [TECH] Migrer le feature toggle pour les missions expérimentales de Junior vers le nouveaux système.
- [#12210](https://github.com/1024pix/pix/pull/12210) [TECH] Ajoute un index sur la table organizations (colonne parentOrganizationId).
- [#12207](https://github.com/1024pix/pix/pull/12207) [TECH] Ajout d'un index sur mission-assessments.organizationLearnerId.

### :bug: Correction
- [#12204](https://github.com/1024pix/pix/pull/12204) [BUGFIX] Retirer le scroll horizontal sur la page j'ai un code de PixAPP (PIX-17705).
- [#12197](https://github.com/1024pix/pix/pull/12197) [BUGFIX] Retirer un texte inutile dans la boîte de dialog d'archivage d'un centre de certification (PIX-17686).

## v5.102.0 (02/05/2025)


### :rocket: Amélioration
- [#11905](https://github.com/1024pix/pix/pull/11905) [FEATURE] Rendre le processus d'authentifcation OIDC plus résistant aux retours arrière (PIX-13945).
- [#12200](https://github.com/1024pix/pix/pull/12200) [FEATURE] Assurer la cohérence des évènements avec les données en base (PIX-17416).
- [#12124](https://github.com/1024pix/pix/pull/12124) [FEATURE] Créer une route d'archivage des centres de certification en masse (PIX-17597).
- [#12146](https://github.com/1024pix/pix/pull/12146) [FEATURE] Ajout d'options de début et de fin pour le script de rattrapage de partage d'attestations 6e (PIX-17584).

### :building_construction: Tech
- [#12201](https://github.com/1024pix/pix/pull/12201) [TECH] Création d'une table dans le datamart permettant de servir les taux de couverture par organisation via Maddo (PIX-17715).
- [#12187](https://github.com/1024pix/pix/pull/12187) [TECH] Seeds certif: améliorer l'utilitaire de passage de certif (PIX-17665).
- [#12168](https://github.com/1024pix/pix/pull/12168) [TECH] Enlever les "transitionTexts" des modules et des passages côté app (PIX-17571) (PIX-17453).
- [#12190](https://github.com/1024pix/pix/pull/12190) [TECH] Enregistrer les champs supplémentaires envoyés depuis Pix APP lors de la création d'un passage-event (PIX-17551).
- [#12191](https://github.com/1024pix/pix/pull/12191) [TECH] Investiguer un flaky sur Saml POST /api/token-from-external-user (PIX-17670).

### :bug: Correction
- [#12199](https://github.com/1024pix/pix/pull/12199) [BUGFIX] Utiliser l'action de release de la branche main.

## v5.101.0 (30/04/2025)


### :rocket: Amélioration
- [#12163](https://github.com/1024pix/pix/pull/12163) [FEATURE] Ajouter un workflow de release.
- [#12174](https://github.com/1024pix/pix/pull/12174) [FEATURE] Empêcher l'accès à l'espace surveillant d'un centre de certification archivé (PIX-16805).
- [#12182](https://github.com/1024pix/pix/pull/12182) [FEATURE] Ajout de la pagination et de la traduction au endpoint `/api/organizations/{organizationId}/campaigns` (PIX-17662).
- [#12139](https://github.com/1024pix/pix/pull/12139) [FEATURE] Ajouter le taux de couverture aux participations de campagne dans l'API pour les partenaires (PIX-17280).

### :building_construction: Tech
- [#12140](https://github.com/1024pix/pix/pull/12140) [TECH] Ne pas lancer la CI lorsque une PR est encore au stade de développement.
- [#12193](https://github.com/1024pix/pix/pull/12193) [TECH] Ajouter de la validation sur la route POST passage-events (PIX-17591).
- [#12157](https://github.com/1024pix/pix/pull/12157) [TECH] Créer un script permanent pour anonymiser des utilisateurs en masse (PIX-17552).
- [#12042](https://github.com/1024pix/pix/pull/12042) [TECH] :wastebasket: Supprime le cas d'usage `get-last-challenge-id` et la route qui l'appel.

### :bug: Correction
- [#12143](https://github.com/1024pix/pix/pull/12143) [BUGFIX] Appeler la traduction du formulaire correctement (PIX-17614).

### :arrow_up: Montée de version
- [#12195](https://github.com/1024pix/pix/pull/12195) [BUMP] Update dependency pdfkit to ^0.17.0 (api).
- [#12189](https://github.com/1024pix/pix/pull/12189) [BUMP] Update dependency @1024pix/pix-ui to ^55.16.6 (junior).
- [#12192](https://github.com/1024pix/pix/pull/12192) [BUMP] Update dependency @1024pix/pix-ui to ^55.16.6 (mon-pix).
- [#12186](https://github.com/1024pix/pix/pull/12186) [BUMP] Update dependency @1024pix/pix-ui to ^55.16.6 (admin).
- [#12185](https://github.com/1024pix/pix/pull/12185) [BUMP] Update dependency @1024pix/stylelint-config to ^5.1.30 (orga).
- [#12181](https://github.com/1024pix/pix/pull/12181) [BUMP] Update dependency @1024pix/stylelint-config to ^5.1.30 (mon-pix).
- [#12180](https://github.com/1024pix/pix/pull/12180) [BUMP] Update dependency @1024pix/stylelint-config to ^5.1.30 (junior).
- [#12178](https://github.com/1024pix/pix/pull/12178) [BUMP] Update dependency @1024pix/stylelint-config to ^5.1.30 (admin).
- [#12179](https://github.com/1024pix/pix/pull/12179) [BUMP] Update dependency @1024pix/stylelint-config to ^5.1.30 (certif).
- [#12177](https://github.com/1024pix/pix/pull/12177) [BUMP] Update dependency @1024pix/pix-ui to ^55.16.6 (orga).
- [#12175](https://github.com/1024pix/pix/pull/12175) [BUMP] Update dependency @1024pix/eslint-plugin to ^2.1.3 (mon-pix).

## v5.100.0 (29/04/2025)


### :rocket: Amélioration
- [#12158](https://github.com/1024pix/pix/pull/12158) [FEATURE] Arrêter de supporter les textes de transitions (API) (PIX-17570).
- [#12160](https://github.com/1024pix/pix/pull/12160) [FEATURE] Enregistrer l'événement STARTED sur le usecase record-passage-events (PIX-17620).

### :building_construction: Tech
- [#12154](https://github.com/1024pix/pix/pull/12154) [TECH] Mise à jours de dépendances sur PixOrga (PIX-17623).
- [#12152](https://github.com/1024pix/pix/pull/12152) [TECH] Utiliser les paliers acquis pour afficher les statistiques de répartition par palier sur la page d'analyse (PIX-17629).
- [#12165](https://github.com/1024pix/pix/pull/12165) [TECH] Appeler le usecase record-passage-events dans le controller create-passage (PIX-17657).
- [#12164](https://github.com/1024pix/pix/pull/12164) [TECH] add index on tables.
- [#12125](https://github.com/1024pix/pix/pull/12125) [TECH] Ajouter le cas d'une certification v3 obtenue dans les seeds certif (PIX-17600).
- [#12127](https://github.com/1024pix/pix/pull/12127) [TECH] Migrer la route /api/sco-organization-learners/dependent dans organization-learner (PIX-16332).
- [#12153](https://github.com/1024pix/pix/pull/12153) [TECH] Migrer les textes de transition des modules (PIX-17563).
- [#12111](https://github.com/1024pix/pix/pull/12111) [TECH] Correction d'un test non fiable sur l'import de profil cible.
- [#12145](https://github.com/1024pix/pix/pull/12145) [TECH] Suppression de la table Maddo inutilisée campaign_participation_tube_reached_levels.

### :bug: Correction
- [#12144](https://github.com/1024pix/pix/pull/12144) [BUGFIX] Récupérer uniquement les habilitations propres à un centre (PIX-17618).

### :arrow_up: Montée de version
- [#12170](https://github.com/1024pix/pix/pull/12170) [BUMP] Update dependency @1024pix/eslint-plugin to ^2.1.3 (dossier racine).
- [#12173](https://github.com/1024pix/pix/pull/12173) [BUMP] Update dependency @1024pix/eslint-plugin to ^2.1.3 (junior).
- [#12171](https://github.com/1024pix/pix/pull/12171) [BUMP] Update dependency @1024pix/eslint-plugin to ^2.1.3 (e2e-playwright).
- [#12167](https://github.com/1024pix/pix/pull/12167) [BUMP] Update dependency @1024pix/eslint-plugin to ^2.1.3 (audit-logger).
- [#12169](https://github.com/1024pix/pix/pull/12169) [BUMP] Update dependency @1024pix/eslint-plugin to ^2.1.3 (certif).
- [#12142](https://github.com/1024pix/pix/pull/12142) [BUMP] Update dependency @1024pix/eslint-plugin to ^2.1.2 (junior).
- [#12166](https://github.com/1024pix/pix/pull/12166) [BUMP] Update dependency @1024pix/eslint-plugin to ^2.1.3 (api).
- [#12150](https://github.com/1024pix/pix/pull/12150) [BUMP] Update dependency webpack to v5.99.6 (junior).

## v5.99.0 (28/04/2025)


### :rocket: Amélioration
- [#12138](https://github.com/1024pix/pix/pull/12138) [FEATURE] Finaliser la conception de la page de certificat candidat sur Pix App (PIX-17481).
- [#12130](https://github.com/1024pix/pix/pull/12130) [FEATURE] Créer le composant pour télécharger le PDF du certificat sur Pix App (PIX-17594).
- [#12123](https://github.com/1024pix/pix/pull/12123) [FEATURE] Enregistrer les événements `PASSAGE_TERMINATED` sur le usecase `record-passage-events` (PIX-17599).

### :building_construction: Tech
- [#12134](https://github.com/1024pix/pix/pull/12134) [TECH] Remplacer les "inject as service" pour appeler directement service (PIX-17624).

### :bug: Correction
- [#12132](https://github.com/1024pix/pix/pull/12132) [BUGFIX] Vérifier l'existence du learner avant de créer une mission.

### :arrow_up: Montée de version
- [#12149](https://github.com/1024pix/pix/pull/12149) [BUMP] Update dependency @1024pix/pix-ui to ^55.16.6 (certif).
- [#12148](https://github.com/1024pix/pix/pull/12148) [BUMP] Update dependency @1024pix/eslint-plugin to ^2.1.2 (orga).
- [#12147](https://github.com/1024pix/pix/pull/12147) [BUMP] Update dependency @1024pix/eslint-plugin to ^2.1.2 (mon-pix).
- [#12131](https://github.com/1024pix/pix/pull/12131) [BUMP] Update dependency @1024pix/eslint-plugin to ^2.1.2 (dossier racine).

## v5.98.0 (25/04/2025)


### :rocket: Amélioration
- [#12133](https://github.com/1024pix/pix/pull/12133) [FEATURE] Modification Modules 1e marche.
- [#12095](https://github.com/1024pix/pix/pull/12095) [FEATURE] Ajout animation fondu à l'apparition des grains (PIX-17567).
- [#12136](https://github.com/1024pix/pix/pull/12136) [FEATURE] Mettre à jour les traductions ES sur page début de parcours (PIX-17610).
- [#12023](https://github.com/1024pix/pix/pull/12023) [FEATURE] Proposer une api interne pour récupérer les campagnes participations (PIX-17350).
- [#12129](https://github.com/1024pix/pix/pull/12129) [FEATURE] Correction de 2 feedback grains vrai-faux.
- [#12100](https://github.com/1024pix/pix/pull/12100) [FEATURE] Retirer la colonne userId de stage-acquisitions (Pix-17332).
- [#12121](https://github.com/1024pix/pix/pull/12121) [FEATURE] Créer la nouvelle page du certificat coté candidat sur Pix App (PIX-17595).
- [#12091](https://github.com/1024pix/pix/pull/12091) [FEATURE] Cacher le grain transition de la navbar (PIX-17473).

### :building_construction: Tech
- [#12113](https://github.com/1024pix/pix/pull/12113) [TECH] :truck: Déplace le cas d'utilisation `findTargetProfileSummariesForTraining` vers `src/devcomp/`.
- [#12112](https://github.com/1024pix/pix/pull/12112) [TECH] migrer les tests e2e d'orga vers Playwright (PIX-17586).
- [#12107](https://github.com/1024pix/pix/pull/12107) [TECH] :truck: Déplace la route `user trainings` vers le contexte `/src/devcomp`.
- [#12120](https://github.com/1024pix/pix/pull/12120) [TECH] Correction du script de suppression de réponses superflues (PIX-17257).

### :bug: Correction
- [#12122](https://github.com/1024pix/pix/pull/12122) [BUGFIX] Utiliser le variant orga sur les PixBlock (PIX-17283).

### :arrow_up: Montée de version
- [#12141](https://github.com/1024pix/pix/pull/12141) [BUMP] Update dependency @1024pix/eslint-plugin to ^2.1.2 (e2e-playwright).
- [#12128](https://github.com/1024pix/pix/pull/12128) [BUMP] Update dependency @1024pix/eslint-plugin to ^2.1.2 (certif).
- [#12085](https://github.com/1024pix/pix/pull/12085) [BUMP] Update dependency @1024pix/eslint-plugin to ^2.1.2 (api).
- [#12126](https://github.com/1024pix/pix/pull/12126) [BUMP] Update dependency @1024pix/eslint-plugin to ^2.1.2 (audit-logger).
- [#12025](https://github.com/1024pix/pix/pull/12025) [BUMP] Update dependency @1024pix/pix-ui to ^55.16.1 (certif).

## v5.97.0 (24/04/2025)


### :rocket: Amélioration
- [#12105](https://github.com/1024pix/pix/pull/12105) [FEATURE] Corriger la phrase sur la date de dernière connexion lorsqu'il n'y en a pas (PIX-17562).
- [#12104](https://github.com/1024pix/pix/pull/12104) [FEATURE] Gestion des compétences et du niveau global du Certificat v3 en cas de score en dessous de 64 pix (PIX-17541).
- [#12103](https://github.com/1024pix/pix/pull/12103) [FEATURE] Ajouter plus l'info sur l'import sur la page élèves/étudiants (PIX-16950).
- [#12098](https://github.com/1024pix/pix/pull/12098) [FEATURE] Retirer l'insertion des userId dans stage-acquisitions (Pix-17572).
- [#12102](https://github.com/1024pix/pix/pull/12102) [FEATURE] Améliorer le design des modules.

### :building_construction: Tech
- [#12099](https://github.com/1024pix/pix/pull/12099) [TECH] Migrer la route POST /api/admin/organizations/import-csv (PIX-17560).
- [#12118](https://github.com/1024pix/pix/pull/12118) [TECH] Ajouter une validation JOI à la route POST /api/assessments.
- [#12117](https://github.com/1024pix/pix/pull/12117) [TECH] Supprimer des vieux scripts.

### :bug: Correction
- [#12116](https://github.com/1024pix/pix/pull/12116) [BUGFIX] Retourner les compétences traduites dans les nouveaux certificats v3 (PIX-17592).
- [#12106](https://github.com/1024pix/pix/pull/12106) [BUGFIX] Ne pas ajouter un membre avec le rôle admin à un centre de certif archivé s'il est ajouté à une orga de type sco (PIX-16804).

## v5.96.0 (23/04/2025)


### :rocket: Amélioration
- [#12080](https://github.com/1024pix/pix/pull/12080) [FEATURE] Empecher un utilisateur ayant participé à une campagne de supprimer son compte en autonomie (PIX-17441).
- [#12079](https://github.com/1024pix/pix/pull/12079) [FEATURE] Ajouter l’action d’archivage d’un CDC dans Pix Admin (PIX-16750).

## v5.95.0 (22/04/2025)


### :rocket: Amélioration
- [#12089](https://github.com/1024pix/pix/pull/12089) [FEATURE] Utiliser la campaignParticipationId pour récupérer les paliers atteint lors d'une campagne (Pix-17331).
- [#12090](https://github.com/1024pix/pix/pull/12090) [FEATURE] Ajout des derniers éléments pour le certificat V3 complet sur Pix App (PIX-17575).
- [#12097](https://github.com/1024pix/pix/pull/12097) [FEATURE] Épurer certains fonds de grains (PIX-17568).
- [#12088](https://github.com/1024pix/pix/pull/12088) [FEATURE] Afficher la jauge pour le certificat V3 sur Pix App (PIX-17545).
- [#12096](https://github.com/1024pix/pix/pull/12096) [FEATURE] Retirer les tags sur les cartes grains (PIX-17569).
- [#12093](https://github.com/1024pix/pix/pull/12093) [FEATURE] Affinage navbar Modulix (PIX-17565).
- [#12092](https://github.com/1024pix/pix/pull/12092) [FEATURE] Elargir la largeur max du module (desktop) et la taille de l'image (PIX-17564).
- [#12083](https://github.com/1024pix/pix/pull/12083) [FEATURE] Afficher les informations du niveau global sur le certificat V3 sur Pix App (PIX-17532).

### :building_construction: Tech
- [#11475](https://github.com/1024pix/pix/pull/11475) [TECH] Faire évoluer le script de configuration.
- [#12101](https://github.com/1024pix/pix/pull/12101) [TECH] Améliorer la page de chargement d'entrée en certification (PIX-17556).

## v5.94.0 (18/04/2025)


### :rocket: Amélioration
- [#12094](https://github.com/1024pix/pix/pull/12094) [FEATURE] Mise en retrait du bouton Réessayer de Modulix (PIX-17566).
- [#12081](https://github.com/1024pix/pix/pull/12081) [FEATURE] Renvoyer le certificat V3 pour un utilisateur connecté (PIX-17478).
- [#12087](https://github.com/1024pix/pix/pull/12087) [FEATURE] Script de reprise de données d'acceptation de CGU pour les utilisateurs anonymisés (PIX-17272) .
- [#12071](https://github.com/1024pix/pix/pull/12071) [FEATURE] Afficher le détail des compétences d'un certificat en ligne (PIX-17476).

### :building_construction: Tech
- [#12072](https://github.com/1024pix/pix/pull/12072) [TECH] Ajouter un script pour archiver en masse des centres de certification (PIX-16851).
- [#12057](https://github.com/1024pix/pix/pull/12057) [TECH] Migrer la route GET /api/admin/organizations/{organizationId}/children (PIX-17498).
- [#12067](https://github.com/1024pix/pix/pull/12067) [TECH] Utiliser une transaction pour la fonction d'acceptation des termes d'utilisations de certif (PIX-15374).
- [#12082](https://github.com/1024pix/pix/pull/12082) [TECH] Rendre la colonne userId nullable dans la table badge-acquisitions (PIX-16569).

### :bug: Correction
- [#12047](https://github.com/1024pix/pix/pull/12047) [BUGFIX] Prendre en compte les legal-document-version-user-acceptances dans le use-case d'anonymisation d'un utilisateur (PIX-17271).

## v5.93.0 (17/04/2025)


### :rocket: Amélioration
- [#12066](https://github.com/1024pix/pix/pull/12066) [FEATURE] Ajouter un sequenceNumber dans les `passage-events`(PIX-17490).
- [#12070](https://github.com/1024pix/pix/pull/12070) [FEATURE] Retourner le taux de couverture dans le retour du détails des organisations (PIX-17511).
- [#12069](https://github.com/1024pix/pix/pull/12069) [FEATURE] Créer un premier composant pour afficher les informations du candidat sur la page de certificat V3 (PIX-17519).
- [#12062](https://github.com/1024pix/pix/pull/12062) [FEATURE] Permettre l'affichage des compétences sur le certificat V3 en ligne (partagé) sur Pix App (PIX-17476).

### :building_construction: Tech
- [#12050](https://github.com/1024pix/pix/pull/12050) [TECH] Migrer le feature toggle de suppression de compte vers le nouveau système (PIX-17483).

### :bug: Correction
- [#12077](https://github.com/1024pix/pix/pull/12077) [BUGFIX] Passer les tubes à null pour récupérer les collectes de profil via Campaign-Api.js (PIX-17531).
- [#12019](https://github.com/1024pix/pix/pull/12019) [BUGFIX] Rajouter les labels sur la nav de Pix admin (PIX-17448).
- [#12065](https://github.com/1024pix/pix/pull/12065) [BUGFIX] Corriger le script de clean des snapshots (PIX-17471).
- [#12073](https://github.com/1024pix/pix/pull/12073) [BUGFIX] Ne pas afficher le bouton envoyé ses résultats lorsque la campagne est desactivé (PIX-17521).

### :arrow_up: Montée de version
- [#12058](https://github.com/1024pix/pix/pull/12058) [BUMP] Update dependency ember-simple-auth to v8 (orga).

## v5.92.0 (16/04/2025)


### :rocket: Amélioration
- [#12068](https://github.com/1024pix/pix/pull/12068) [FEATURE] Exposer un learnerId unique par clientId (PIX-17513).
- [#12014](https://github.com/1024pix/pix/pull/12014) [FEATURE] Créer l'API interne pour mettre à disposition les données des participations par campagne (PIX-17351).
- [#11973](https://github.com/1024pix/pix/pull/11973) [FEATURE] Créer la route POST /api/admin/certification-centers/{id}/archive.

### :building_construction: Tech
- [#12061](https://github.com/1024pix/pix/pull/12061) [TECH] copie les snapshot de datawarehouse vers production (PIX-17499).

### :bug: Correction
- [#12064](https://github.com/1024pix/pix/pull/12064) [BUGFIX] Corriger le nombre de contenus formatifs affiché dans la modal de fin de parcours (PIX-17512).

## v5.91.0 (15/04/2025)


### :rocket: Amélioration
- [#12055](https://github.com/1024pix/pix/pull/12055) [FEATURE] Ajouter la colonne sequenceNumber dans passage-events (PIX-17500).
- [#12002](https://github.com/1024pix/pix/pull/12002) [FEATURE] Donner accès aux compétences du candidat sur le modèle du certificat V3 (PIX-17338).
- [#11976](https://github.com/1024pix/pix/pull/11976) [FEATURE] Afficher dans Pix-Admin si un CDC est archivé et qui a fait l'action (PIX-17367).
- [#12035](https://github.com/1024pix/pix/pull/12035) [FEATURE] Support du type de grain "transition" (PIX-17472).
- [#12033](https://github.com/1024pix/pix/pull/12033) [FEATURE] Réferencer l'id du module plutôt que son slug (PIX-17403).

### :building_construction: Tech
- [#11993](https://github.com/1024pix/pix/pull/11993) [TECH] Migrer la route /api/sco-organization-learners/external dans src>prescription>organization-learner (pix-16333).
- [#12031](https://github.com/1024pix/pix/pull/12031) [TECH] Renommer l'objet du domaine  v3 certification attestation (PIX-17464).
- [#12054](https://github.com/1024pix/pix/pull/12054) [TECH] Déplacer le check de l'utilisateur téléchargeant le PDF de certificat dans le controller (PIX-17501).
- [#11692](https://github.com/1024pix/pix/pull/11692) [TECH] inclus les banner dans le layout de AppLayout (PIX-17484).
- [#12038](https://github.com/1024pix/pix/pull/12038) [TECH] Supprimer la dépendance à `ember-fetch` dans Pix Certif.
- [#12032](https://github.com/1024pix/pix/pull/12032) [TECH] Ajouter une colonne "id" à la table legal-document-version-user-acceptances (PIX-17466).
- [#12012](https://github.com/1024pix/pix/pull/12012) [TECH] Prévenir les incompréhensions due aux expirations de jobs.  .
- [#12015](https://github.com/1024pix/pix/pull/12015) [TECH]  Renommer et regrouper les routes et controlleurs d'attestation pour évoquer un certificat (Pix-17439).

### :bug: Correction
- [#12017](https://github.com/1024pix/pix/pull/12017) [BUGFIX] Ne plus faire apparaître le menu lorsqu'un candidat entre en certification sur Pix App (PIX-17425).

### :arrow_up: Montée de version
- [#12048](https://github.com/1024pix/pix/pull/12048) [BUMP] Update dependency @1024pix/pix-ui to ^55.15.0 (admin).
- [#12053](https://github.com/1024pix/pix/pull/12053) [BUMP] Update dependency ember-simple-auth to v8 (mon-pix).
- [#12056](https://github.com/1024pix/pix/pull/12056) [BUMP] Update dependency webpack to v5.99.0 (junior).
- [#12051](https://github.com/1024pix/pix/pull/12051) [BUMP] Update dependency ember-simple-auth to v8 (admin).
- [#12052](https://github.com/1024pix/pix/pull/12052) [BUMP] Update dependency ember-simple-auth to v8 (certif).
- [#12049](https://github.com/1024pix/pix/pull/12049) [BUMP] Update dependency @1024pix/pix-ui to ^55.15.0 (orga).
- [#11966](https://github.com/1024pix/pix/pull/11966) [BUMP] Update dependency @1024pix/pix-ui to ^55.14.0 (admin).
- [#12046](https://github.com/1024pix/pix/pull/12046) [BUMP] Update dependency @1024pix/pix-ui to ^55.15.0 (mon-pix).
- [#12045](https://github.com/1024pix/pix/pull/12045) [BUMP] Update dependency @1024pix/pix-ui to ^55.15.0 (junior).
- [#12044](https://github.com/1024pix/pix/pull/12044) [BUMP] Update dependency @1024pix/pix-ui to ^55.14.0 (junior).
- [#12043](https://github.com/1024pix/pix/pull/12043) [BUMP] Update dependency @1024pix/stylelint-config to ^5.1.29 (orga).
- [#12041](https://github.com/1024pix/pix/pull/12041) [BUMP] Update dependency @1024pix/stylelint-config to ^5.1.29 (mon-pix).
- [#12040](https://github.com/1024pix/pix/pull/12040) [BUMP] Update dependency @1024pix/stylelint-config to ^5.1.29 (junior).

### :coffee: Autre
- [#12036](https://github.com/1024pix/pix/pull/12036) Ajouter un endpoint pour enregistrer les évènements des passages (PIX-16954).

## v5.90.0 (14/04/2025)


### :building_construction: Tech
- [#12018](https://github.com/1024pix/pix/pull/12018) [TECH] Supprimer la dépendance à `ember-fetch` dans Pix Admin.
- [#12029](https://github.com/1024pix/pix/pull/12029) [TECH] Utiliser une 401 plutôt qu'une 403 en cas d'erreur de mot de passe dans la page de connexion à l'espace surveillant (PIX-17461).

### :bug: Correction
- [#12009](https://github.com/1024pix/pix/pull/12009) [BUGFIX] Corriger des erreurs suite à la montée de version Pix UI sur Pix Certif (PIX-17429).

### :arrow_up: Montée de version
- [#12039](https://github.com/1024pix/pix/pull/12039) [BUMP] Update dependency @1024pix/stylelint-config to ^5.1.29 (certif).
- [#12037](https://github.com/1024pix/pix/pull/12037) [BUMP] Update dependency @1024pix/stylelint-config to ^5.1.29 (admin).

## v5.89.0 (11/04/2025)


### :rocket: Amélioration
- [#12013](https://github.com/1024pix/pix/pull/12013) [FEATURE] Ne récupérer que les certifs v3 lors du téléchargement des certifs d'une classe (PIX-17435).
- [#12022](https://github.com/1024pix/pix/pull/12022) [FEATURE] Améliorer la vitesse des réplications (PIX-17456).

### :building_construction: Tech
- [#12021](https://github.com/1024pix/pix/pull/12021) [TECH] Suppression des tables parcoursup historiques non utilisées (PIX-17324).
- [#12008](https://github.com/1024pix/pix/pull/12008) [TECH] Ajout de métriques sur le pool de connexion pour toutes les connexions de base de données.
- [#12020](https://github.com/1024pix/pix/pull/12020) [TECH] Suppression des réplications sur les tables historiques de parcoursup (PIX-17319).

### :bug: Correction
- [#12024](https://github.com/1024pix/pix/pull/12024) [BUGFIX] :bug: Révision de la requête SQL pour la récupération de certificat pour le LSU/LSL (PIX-17408).
- [#12026](https://github.com/1024pix/pix/pull/12026) [BUGFIX] Problème SEO sur le projet junior (pix-17392).

### :arrow_up: Montée de version
- [#12028](https://github.com/1024pix/pix/pull/12028) [BUMP] Update dependency @1024pix/pix-ui to ^55.14.0 (orga).
- [#11967](https://github.com/1024pix/pix/pull/11967) [BUMP] Update dependency @1024pix/pix-ui to ^55.12.0 (mon-pix).

## v5.88.0 (10/04/2025)


### :rocket: Amélioration
- [#11987](https://github.com/1024pix/pix/pull/11987) [FEATURE] Assurer l'intégrité des données enregistrées côté Model (PIX-17157).
- [#12001](https://github.com/1024pix/pix/pull/12001) [FEATURE] Renommage du bouton de téléchargement de certificat (PIX-17421).
- [#11952](https://github.com/1024pix/pix/pull/11952) [FEATURE] MaDDo Parcoursup - Utiliser les tables génériques de résultats de certif (PIX-17323).
- [#11954](https://github.com/1024pix/pix/pull/11954) [FEATURE] MaDDo - Suppression de la mise à dispo parcoursup depuis l'API Pix (PIX-17326).
- [#11983](https://github.com/1024pix/pix/pull/11983) [FEATURE] Ajouter un script de normalisation suite au passage de la limite de blocage de 50 à 30 (PIX-16105).

### :building_construction: Tech
- [#12006](https://github.com/1024pix/pix/pull/12006) [TECH] Corriger un test flaky sur le repository campaign-participation (PIX-17428).

### :bug: Correction
- [#12016](https://github.com/1024pix/pix/pull/12016) [BUGFIX] Rajouter les attributs manquant sur la navbar de Pix orga (PIX-17440).

## v5.87.0 (10/04/2025)


### :rocket: Amélioration
- [#12007](https://github.com/1024pix/pix/pull/12007) [FEATURE] Ajouter ModuleId dans le script get-proposals-csv (PIX-17406).
- [#11948](https://github.com/1024pix/pix/pull/11948) [FEATURE] ajoute la route pour récupérer les niveaux par sujet et competence (Pix-17023).

### :building_construction: Tech
- [#12011](https://github.com/1024pix/pix/pull/12011) [TECH] Supprimer le FT showNewCampaignPresentationPage (PIX-17434).
- [#12010](https://github.com/1024pix/pix/pull/12010) [TECH] Ajouter le dossier oublié des scripts de devcomp aux review automatiques (PIX-17430).
- [#11970](https://github.com/1024pix/pix/pull/11970) [TECH] Supprimer les colones userId et snappedAt de knowledge-element-snapshots (PIX-17212).
- [#11998](https://github.com/1024pix/pix/pull/11998) [TECH] Supprimer la dépendance à `ember-fetch` dans Pix App.

### :bug: Correction
- [#12005](https://github.com/1024pix/pix/pull/12005) [BUGFIX] Corriger la scrollbar sur le composant transitoire (PIX-17402).

## v5.86.0 (09/04/2025)


### :rocket: Amélioration
- [#12000](https://github.com/1024pix/pix/pull/12000) [FEATURE] Ajouter le champ moduleId dans get-elements-csv (PIX-17405).
- [#11980](https://github.com/1024pix/pix/pull/11980) [FEATURE] Déplacer le simulateur de scoring certif dans les outils (PIX-17393).
- [#11977](https://github.com/1024pix/pix/pull/11977) [FEATURE] Ajouter le champ moduleId au script get-modules-csv (PIX-17219).
- [#11982](https://github.com/1024pix/pix/pull/11982) [FEATURE] Corrections design sur la page d'affichage du Certificat Pix (PIX-17056).

### :building_construction: Tech
- [#11890](https://github.com/1024pix/pix/pull/11890) [TECH] Réduit la violation de contexte restreint entre évaluation et devcomp.
- [#11959](https://github.com/1024pix/pix/pull/11959) [TECH] Migrer la route GET /api/admin/organizations (PIX-17348).

### :bug: Correction
- [#12003](https://github.com/1024pix/pix/pull/12003) [BUGFIX] Augmentation du délai maximum du job de réplication (MADDO). .
- [#11991](https://github.com/1024pix/pix/pull/11991) [BUGFIX] Couper les cellules avec des mots trop longs dans la liste des sessions certif (PIX-17378).
- [#11994](https://github.com/1024pix/pix/pull/11994) [BUGFIX] Ajouter la dependance manquante codeGenerator dans les injections de dépendances pour les usecases (PIX-17417).

## v5.85.0 (08/04/2025)


### :rocket: Amélioration
- [#11974](https://github.com/1024pix/pix/pull/11974) [FEATURE] Suppression du détail sur les raisons d'un échec d'authentification.
- [#11986](https://github.com/1024pix/pix/pull/11986) [FEATURE] Modifier le wording du lien pour interpréter les résultats de la certification sur Pix App (PIX-17380).
- [#11971](https://github.com/1024pix/pix/pull/11971) [FEATURE] Créer la nouvelle page de certification (vide) sur Pix App (PIX-17337).

### :building_construction: Tech
- [#11984](https://github.com/1024pix/pix/pull/11984) [TECH] Passer les fichiers templates au format GJS sur PixOrga.
- [#11988](https://github.com/1024pix/pix/pull/11988) [TECH] Supprimer la mention attestation dans le nom du PDF de la certification (PIX-17409).
- [#11969](https://github.com/1024pix/pix/pull/11969) [TECH] Supprimer/déplacer des fichiers oubliés lors des migrations (PIX-17395).
- [#11972](https://github.com/1024pix/pix/pull/11972) [TECH] Modifier le lien de documentation dans l'espace surveillant sur Pix Certif (PIX-17385).
- [#11965](https://github.com/1024pix/pix/pull/11965) [TECH] arrêter d'utiliser les champs userId / snappedAt (Pix-17286).

### :bug: Correction
- [#11995](https://github.com/1024pix/pix/pull/11995) [BUGFIX] Corriger l'affichage des modales sur Pix Certif.

### :arrow_up: Montée de version
- [#11992](https://github.com/1024pix/pix/pull/11992) [BUMP] Update dependency @1024pix/pix-ui to ^55.13.0 (certif).
- [#11955](https://github.com/1024pix/pix/pull/11955) [BUMP] Update dependency @1024pix/pix-ui to ^55.12.1 (certif).

## v5.84.0 (08/04/2025)


### :rocket: Amélioration
- [#11978](https://github.com/1024pix/pix/pull/11978) [FEATURE] Modifier le score maximal atteignable sur le nouveau certificat V3 (PIX-17394).
- [#11960](https://github.com/1024pix/pix/pull/11960) [FEATURE] Ajustements de la traduction en NL pour Accès (PIX-17357).

### :building_construction: Tech
- [#11981](https://github.com/1024pix/pix/pull/11981) [TECH] Met à jour Ember en 6.3.0 sur PixOrga.
- [#11975](https://github.com/1024pix/pix/pull/11975) [TECH] Ne plus demander de reviews de devcomp à la modification du référentiel (PIX-17006).
- [#11979](https://github.com/1024pix/pix/pull/11979) [TECH] Corrige un test sur PixOrga qui casse en local et pas sur la CI.

### :bug: Correction
- [#11985](https://github.com/1024pix/pix/pull/11985) [BUGFIX] Augmentation du délai maximum du job de réplication (MADDO).

## v5.83.0 (07/04/2025)


### :rocket: Amélioration
- [#11963](https://github.com/1024pix/pix/pull/11963) [FEATURE] Créer le FT pour le nouveau certificat en ligne V3 (PIX-17328).

### :building_construction: Tech
- [#11826](https://github.com/1024pix/pix/pull/11826) [TECH] :broom: Supprimer l'utilisation de la colonne `emitter` (PIX-16124).
- [#11964](https://github.com/1024pix/pix/pull/11964) [TECH]  ajoute une contrainte d'unicité pour `campaignParticipationId` sur `knowledge-element-snapshot` (pix-17358).
- [#11913](https://github.com/1024pix/pix/pull/11913) [TECH] :recycle: Execute le rescoring par script en synchrone (PIX-17242).

### :bug: Correction
- [#11894](https://github.com/1024pix/pix/pull/11894) [BUGFIX] Quelques menues corrections suite au recettage des nouveaux gabarits (PIX-17255).
- [#11630](https://github.com/1024pix/pix/pull/11630) [BUGFIX] Mettre à jour et rajouter les attributs nécessaire sur la navbar de Pix app (PIX-16773).

## v5.82.0 (04/04/2025)


### :rocket: Amélioration
- [#11934](https://github.com/1024pix/pix/pull/11934) [FEATURE] Autoriser un participant avec une participation précédente supprimée à re-participer (PIX-15809).
- [#11935](https://github.com/1024pix/pix/pull/11935) [FEATURE] Ne pas afficher l'heure sur les dates de dernier accès dans PIX Admin (PIX-17281).

### :bug: Correction
- [#11802](https://github.com/1024pix/pix/pull/11802) [BUGFIX] Pix Junior - Affichage des puces sur la liste des objectifs d'une mission (PIX-16943).
- [#11957](https://github.com/1024pix/pix/pull/11957) [BUGFIX] Réparer les réplications parcoursup.

## v5.81.0 (04/04/2025)


### :building_construction: Tech
- [#11931](https://github.com/1024pix/pix/pull/11931) [TECH] Suppression de isV3Pilot (PIX-16602).

### :arrow_up: Montée de version
- [#11968](https://github.com/1024pix/pix/pull/11968) [BUMP] Update dependency @1024pix/pix-ui to ^55.12.0 (orga).
- [#11956](https://github.com/1024pix/pix/pull/11956) [BUMP] Update dependency @1024pix/pix-ui to ^55.12.0 (junior).

## v5.80.0 (03/04/2025)


### :rocket: Amélioration
- [#11861](https://github.com/1024pix/pix/pull/11861) [FEATURE] Modifier l'interface de la double mire SSO pour inclure toutes les données récupérées des utilisateurs (PIX-16303).

### :building_construction: Tech
- [#11936](https://github.com/1024pix/pix/pull/11936) [TECH] Créer une migration pour supprimer la contrainte userId et snappedAt dans la table knowledge-element-snapshots et rendre ces 2 colones nullables (PIX-17211).
- [#11953](https://github.com/1024pix/pix/pull/11953) [TECH] Migrer les feature toggles des layouts vers le nouveau système (PIX-17339).
- [#11900](https://github.com/1024pix/pix/pull/11900) [TECH] :truck: Déplacement du `preHandler`  `CampaignAuthorization` vers `src/shared/`.

### :bug: Correction
- [#11958](https://github.com/1024pix/pix/pull/11958) [BUGFIX] Corriger la sélection de question lorsqu'une alerte est levée (PIX-17349).

### :arrow_up: Montée de version
- [#11943](https://github.com/1024pix/pix/pull/11943) [BUMP] Update dependency @1024pix/pix-ui to ^55.11.0 (mon-pix).
- [#11949](https://github.com/1024pix/pix/pull/11949) [BUMP] Update dependency @1024pix/pix-ui to ^55.11.1 (admin).

## v5.79.0 (03/04/2025)


### :rocket: Amélioration
- [#11937](https://github.com/1024pix/pix/pull/11937) [FEATURE] Améliorer Design et traductions page de début / fin de parcours(PIX-17263)(PIX-17288).

### :building_construction: Tech
- [#11921](https://github.com/1024pix/pix/pull/11921) [TECH] Corrige les tests n'utilisant pas correctement l'assert throw.

### :bug: Correction
- [#11915](https://github.com/1024pix/pix/pull/11915) [BUGFIX] Réparer les tables des listes de sessions (PIX-17279).

### :arrow_up: Montée de version
- [#11947](https://github.com/1024pix/pix/pull/11947) [BUMP] Update dependency sinon to v20 (orga).

### :coffee: Autre
- [#11938](https://github.com/1024pix/pix/pull/11938) FEATURE - modif clavier 1 & 2 : ajout des fiches de revisions .

## v5.78.0 (03/04/2025)


### :rocket: Amélioration
- [#11916](https://github.com/1024pix/pix/pull/11916) [FEATURE] Splitter le diagnostic et le constat d'un feedback (PIX-16579).
- [#11866](https://github.com/1024pix/pix/pull/11866) [FEATURE] Revoir le design de la page d'erreur (PIX-17054).
- [#11914](https://github.com/1024pix/pix/pull/11914) [FEATURE] Ajustements des marges et couleurs de fond après la mise à jour de la nav du Pix -Admin (PIX-17276).
- [#11928](https://github.com/1024pix/pix/pull/11928) [FEATURE] Ajouter les attributs d'archivage d'un centre de certification (PIX-16748).

### :building_construction: Tech
- [#11945](https://github.com/1024pix/pix/pull/11945) [TECH] Ajouter les routes parcoursup dans l'API Maddo (PIX-17321).

### :bug: Correction
- [#11939](https://github.com/1024pix/pix/pull/11939) [BUGFIX] MaDDo - Ne pas échouer la réplication si une nouvelle colonne est ajoutée dans la table source.
- [#11876](https://github.com/1024pix/pix/pull/11876) [BUGFIX] Ajout d'un script pour finaliser des sessions pas entièrement finalisées (PIX-16785).

### :arrow_up: Montée de version
- [#11946](https://github.com/1024pix/pix/pull/11946) [BUMP] Update dependency sinon to v20 (mon-pix).
- [#11944](https://github.com/1024pix/pix/pull/11944) [BUMP] Update dependency @1024pix/pix-ui to ^55.11.0 (orga).
- [#11942](https://github.com/1024pix/pix/pull/11942) [BUMP] Update dependency @1024pix/pix-ui to ^55.11.0 (junior).
- [#11941](https://github.com/1024pix/pix/pull/11941) [BUMP] Update dependency @1024pix/pix-ui to ^55.11.0 (certif).
- [#11940](https://github.com/1024pix/pix/pull/11940) [BUMP] Update dependency @1024pix/pix-ui to ^55.11.0 (admin).
- [#11932](https://github.com/1024pix/pix/pull/11932) [BUMP] Update dependency @1024pix/pix-ui to ^55.10.0 (junior).
- [#11933](https://github.com/1024pix/pix/pull/11933) [BUMP] Update dependency @1024pix/pix-ui to ^55.10.0 (mon-pix).

## v5.77.0 (02/04/2025)


### :rocket: Amélioration
- [#11879](https://github.com/1024pix/pix/pull/11879) [FEATURE] Ajoute la validation sur le système de quêtes (PIX-17236).
- [#11851](https://github.com/1024pix/pix/pull/11851) [FEATURE] [Pix Admin] Si la date de dernière connexion est vide afficher le message « Non connecté depuis 03/2025 » + renommer l’onglet « Méthodes de connexion » (PIX-17109).
- [#11858](https://github.com/1024pix/pix/pull/11858) [FEATURE] Ne pas télécharger dans le zip des attestations les utilisateurs anonymisé ou anonyme (PIX-17222).
- [#11880](https://github.com/1024pix/pix/pull/11880) [FEATURE] Afficher une page Attestations sur PixApp (Pix-17225).
- [#11911](https://github.com/1024pix/pix/pull/11911) [FEATURE] Améliorer le style de la page de vérification de certif (PIX-17278).
- [#11803](https://github.com/1024pix/pix/pull/11803) [FEATURE] Pix Junior - Limitation de la largeur du contenu affiché sur grand écran (PIX-16978).

### :building_construction: Tech
- [#11902](https://github.com/1024pix/pix/pull/11902) [TECH] Tests e2e de gestion des élèves sco avec Playwright.
- [#11922](https://github.com/1024pix/pix/pull/11922) [TECH] Créer un feature toggle pour la nouvelle page d'analyse de campagne (PIX-17025).
- [#11906](https://github.com/1024pix/pix/pull/11906) [TECH] Ajouter des élèves pour les seeds de Certif (cas sco managing student) (PIX-17252).
- [#11843](https://github.com/1024pix/pix/pull/11843) [TECH] Eviter de re-déclencher les calculs pour déterminer la prochaine épreuve dans assessments/:id/next si la dernière épreuve proposée n'a pas encore été répondue.

### :bug: Correction
- [#11855](https://github.com/1024pix/pix/pull/11855) [BUGFIX] La tooltip au niveau du parcours dans les paramètres de campagne n'affiche pas les bonnes informations (PIX-17032).

### :arrow_up: Montée de version
- [#11930](https://github.com/1024pix/pix/pull/11930) [BUMP] Update dependency @1024pix/pix-ui to ^55.10.0 (certif).
- [#11929](https://github.com/1024pix/pix/pull/11929) [BUMP] Update dependency @1024pix/pix-ui to ^55.10.0 (admin).
- [#11923](https://github.com/1024pix/pix/pull/11923) [BUMP] Update dependency sinon to v20 (certif).
- [#11925](https://github.com/1024pix/pix/pull/11925) [BUMP] Update dependency sinon to v20 (load-testing).
- [#11924](https://github.com/1024pix/pix/pull/11924) [BUMP] Update dependency sinon to v20 (junior).
- [#11918](https://github.com/1024pix/pix/pull/11918) [BUMP] Update dependency sinon to v20 (admin).
- [#11919](https://github.com/1024pix/pix/pull/11919) [BUMP] Update dependency sinon to v20 (api).

## v5.76.0 (01/04/2025)


### :rocket: Amélioration
- [#11891](https://github.com/1024pix/pix/pull/11891) [FEATURE] Autoriser les applications clientes à demander plusieurs scopes dans un même token (PIX-17247).
- [#11884](https://github.com/1024pix/pix/pull/11884) [FEATURE] Afficher la modale avec les contenus formatifs après avoir envoyé les résultats avec le bouton dans le hero (PIX-17235).
- [#11819](https://github.com/1024pix/pix/pull/11819) [FEATURE] Ajouter un critère dans les quêtes pour vérifier qu'une chaîne est incluse dans une autre chaîne, insensible à la casse (PIX-17178).
- [#11910](https://github.com/1024pix/pix/pull/11910) [FEATURE] Borner le script de rattrapage des live alert par date (PIX-17051).
- [#11899](https://github.com/1024pix/pix/pull/11899) [FEATURE] Documenter les routes de mise à disposition de données (PIX-17258).

### :building_construction: Tech
- [#11907](https://github.com/1024pix/pix/pull/11907) [TECH] Migrer la route  PATCH /api/organizations/{id}/resend-invitation vers /src (PIX-17259).
- [#11859](https://github.com/1024pix/pix/pull/11859) [TECH] :truck: Déplace le cas d'usage `find-tutorial` vers `src/`.
- [#11896](https://github.com/1024pix/pix/pull/11896) [TECH] Supprimer la propriété "hasSeenEndTestScreen" de l'API (PIX-17031).

### :arrow_up: Montée de version
- [#11909](https://github.com/1024pix/pix/pull/11909) [BUMP] Update dependency eslint-plugin-unicorn to v58 (certif).
- [#11908](https://github.com/1024pix/pix/pull/11908) [BUMP] Update dependency eslint-plugin-unicorn to v58 (api).

### :coffee: Autre
- [#11872](https://github.com/1024pix/pix/pull/11872) Revert "Revert "[TECH] Retirer le script de suppression en masse d'organisations (PIX-16269)"".
- [#11447](https://github.com/1024pix/pix/pull/11447) [DOC] ADR sur le stockage et la production de données destinées à la mise à disposition.

## v5.75.0 (31/03/2025)


### :rocket: Amélioration
- [#11885](https://github.com/1024pix/pix/pull/11885) [FEATURE] Ne pas afficher d'information lié au niveau global sur le certificat V3 pour un score inférieur à 64pix (PIX-17181).

### :arrow_up: Montée de version
- [#11904](https://github.com/1024pix/pix/pull/11904) [BUMP] Update dependency @1024pix/pix-ui to ^55.9.0 (orga).
- [#11898](https://github.com/1024pix/pix/pull/11898) [BUMP] Update dependency @1024pix/pix-ui to ^55.9.0 (admin).
- [#11881](https://github.com/1024pix/pix/pull/11881) [BUMP] Mise à jour des dépendances de audit logger.

## v5.74.0 (28/03/2025)


### :rocket: Amélioration
- [#11834](https://github.com/1024pix/pix/pull/11834) [FEATURE] Utiliser le composant PixBreadcrumb sur Pix Admin (PIX-17197).
- [#11895](https://github.com/1024pix/pix/pull/11895) [FEATURE] Appliquer le variant 'admin' à la navigation PixAdmin (PIX-17224).
- [#11827](https://github.com/1024pix/pix/pull/11827) [FEATURE] Relier le composant transitoire à la page de fin de parcours et à la modal du tab "Formation"(PIX-17016).
- [#11844](https://github.com/1024pix/pix/pull/11844) [FEATURE] Remplacer "Résultat thématique" par "Badge" (PIX-17152).
- [#11835](https://github.com/1024pix/pix/pull/11835) [FEATURE] Corrections PixApp page mes parcours (PIX-17182).
- [#11867](https://github.com/1024pix/pix/pull/11867) [FEATURE] Ajout de PixTabs dans Pix Orga (PIX-17199).
- [#11865](https://github.com/1024pix/pix/pull/11865) [FEATURE] Ajout de PixTabs dans Pix Certif (PIX-17198). .
- [#11868](https://github.com/1024pix/pix/pull/11868) [FEATURE] Ajout d'une route de mise à disposition pour les résultats de campagne.
- [#11883](https://github.com/1024pix/pix/pull/11883) [FEATURE] Autoriser une limite de date sur le script de récupération des décalages de live alerts (PIX-17051).
- [#11702](https://github.com/1024pix/pix/pull/11702) [FEATURE] Fournir une interface haut niveau pour aider à l'élaboration de quêtes (PIX-17115).
- [#11783](https://github.com/1024pix/pix/pull/11783) [FEATURE] Ajouter le résumé et la description du niveau global sur le certificat V3 (PIX-17106).
- [#11812](https://github.com/1024pix/pix/pull/11812) [FEATURE] Pix Table sur Pix Admin : les derniers tableaux (PIX-17162).
- [#11860](https://github.com/1024pix/pix/pull/11860) [FEATURE] Maddo - Récupération des campagnes d'une organisation (PIX-17223).
- [#11804](https://github.com/1024pix/pix/pull/11804) [FEATURE] Pix Table sur Pix Admin : Profil Cibles / Contenus formatifs (PIX-17155).
- [#11548](https://github.com/1024pix/pix/pull/11548) [FEATURE] Actualiser les fichiers de traduction dans toutes les apps.

### :building_construction: Tech
- [#11892](https://github.com/1024pix/pix/pull/11892) [TECH] add an index on Complementary-certification-courses.
- [#11874](https://github.com/1024pix/pix/pull/11874) [TECH] :card_file_box: Supprime la contrainte « not null » de la colonne `emitter` de la table `assessement-results` (PIX-17237).
- [#11814](https://github.com/1024pix/pix/pull/11814) [TECH] Créer un script pour importer la date de dernière connexion (lastLoggedAt) (PIX-10728).
- [#11857](https://github.com/1024pix/pix/pull/11857) [TECH] déplace la table `campaign-participation-tube-reached-levels` dans le datamart (pix-17221).
- [#11833](https://github.com/1024pix/pix/pull/11833) [TECH] Migrer la route GET /api/organizations/{id}/member-identities dans /src/team (PIX-17185).
- [#11864](https://github.com/1024pix/pix/pull/11864) [TECH] Migrer la route /api/token-from-external-user dans le context IAM (PIX-13122).
- [#11853](https://github.com/1024pix/pix/pull/11853) [TECH] Seeds : ajouter un cas de certification sco simple (PIX-17209).
- [#11845](https://github.com/1024pix/pix/pull/11845) [TECH] Réécrire les tests unitaires du usecase authenticateUser en tests d'intégration (PIX-16757).
- [#11838](https://github.com/1024pix/pix/pull/11838) [TECH] Rendre le usecase 'get-next-challenge', pour choisir la prochaine épreuve, transactionnel.

### :bug: Correction
- [#11889](https://github.com/1024pix/pix/pull/11889) [BUGFIX] Définir une largeur max pour le global container (PIX-17251).
- [#11886](https://github.com/1024pix/pix/pull/11886) [BUGFIX] Utiliser les bonnes category dans les seeds des profils cibles (PIX-17239).
- [#11584](https://github.com/1024pix/pix/pull/11584) [BUGFIX] Supprimer l'overflow mis par défaut sur les table dans PixOrga.
- [#11846](https://github.com/1024pix/pix/pull/11846) [BUGFIX] Normaliser les noms de fichier PDF des attestations (PIX-17206).
- [#11852](https://github.com/1024pix/pix/pull/11852) [BUGFIX] Encoder l'adresse email présente dans l'URL (PIX-17205).

### :arrow_up: Montée de version
- [#11903](https://github.com/1024pix/pix/pull/11903) [BUMP] Update dependency @1024pix/pix-ui to ^55.9.0 (mon-pix).
- [#11901](https://github.com/1024pix/pix/pull/11901) [BUMP] Update dependency @1024pix/pix-ui to ^55.9.0 (junior).
- [#11897](https://github.com/1024pix/pix/pull/11897) [BUMP] Update dependency @1024pix/pix-ui to ^55.9.0 (certif).
- [#11873](https://github.com/1024pix/pix/pull/11873) [BUMP] Update dependency @1024pix/pix-ui to ^55.8.0 (admin).
- [#11893](https://github.com/1024pix/pix/pull/11893) [BUMP] Update dependency @1024pix/pix-ui to ^55.8.0 (orga).
- [#11882](https://github.com/1024pix/pix/pull/11882) [BUMP] Update dependency @1024pix/pix-ui to ^55.8.0 (mon-pix).
- [#11875](https://github.com/1024pix/pix/pull/11875) [BUMP] Mise à jour de toutes les dépendances de la racine du monorepo.
- [#11878](https://github.com/1024pix/pix/pull/11878) [BUMP] Update dependency @1024pix/pix-ui to ^55.8.0 (junior).
- [#11877](https://github.com/1024pix/pix/pull/11877) [BUMP] Update dependency @1024pix/pix-ui to ^55.8.0 (certif).
- [#11863](https://github.com/1024pix/pix/pull/11863) [BUMP] Update dependency @1024pix/pix-ui to ^55.7.0 (certif).
- [#11871](https://github.com/1024pix/pix/pull/11871) [BUMP] Update dependency @1024pix/pix-ui to ^55.7.0 (orga).
- [#11870](https://github.com/1024pix/pix/pull/11870) [BUMP] Update dependency @1024pix/pix-ui to ^55.7.0 (mon-pix).
- [#11869](https://github.com/1024pix/pix/pull/11869) [BUMP] Update dependency @1024pix/pix-ui to ^55.7.0 (junior).
- [#11862](https://github.com/1024pix/pix/pull/11862) [BUMP] Update dependency @1024pix/pix-ui to ^55.7.0 (admin).

## v5.73.0 (26/03/2025)


### :rocket: Amélioration
- [#11828](https://github.com/1024pix/pix/pull/11828) [FEATURE] Ajout de PixTabs dans Pix Admin (PIX-17194).
- [#11842](https://github.com/1024pix/pix/pull/11842) [FEATURE] S'assurer que les images de Modules de prod respectent les contraintes tech (PIX-17215).
- [#11700](https://github.com/1024pix/pix/pull/11700) [FEATURE] Permettre de placer des custom elements dans les contenus Modulix (PIX-17186).
- [#11822](https://github.com/1024pix/pix/pull/11822) [FEATURE] supprime la propriété `answerId` des snapshots (Pix-17187).
- [#11779](https://github.com/1024pix/pix/pull/11779) [FEATURE] MaDDo - Ajout d'une route listant les organisations autorisées pour un client.
- [#11815](https://github.com/1024pix/pix/pull/11815) [FEATURE] [Pix Admin] Afficher la date de dernier accès aux orgas & centres de certification sur la fiche utilisateur (PIX-17074 ).
- [#11839](https://github.com/1024pix/pix/pull/11839) [FEATURE] Ajoute des boutons pour télécharger les templates des fichiers d'import CSV sur Admin.

### :building_construction: Tech
- [#11807](https://github.com/1024pix/pix/pull/11807) [TECH] Déplacer le challenge-picker spécifique à la certif (PIX-13739).
- [#11818](https://github.com/1024pix/pix/pull/11818) [TECH] utilise un verrou pour protéger l'accès à une participation avant de la partagée (PIX-17156).
- [#11817](https://github.com/1024pix/pix/pull/11817) [TECH] Ajout de transactions aux usecases de publication de sessions (PIX-17161).
- [#11848](https://github.com/1024pix/pix/pull/11848) [TECH] Utiliser la version de production de PG sur les RA.
- [#11849](https://github.com/1024pix/pix/pull/11849) [TECH] Optimiser la CI et les RA de l'audit logger.
- [#11836](https://github.com/1024pix/pix/pull/11836) [TECH] Migration des test e2e Pix Orga en Playwright.

### :bug: Correction
- [#11856](https://github.com/1024pix/pix/pull/11856) [BUGFIX] Eviter les doublons de competences dans la reponse Parcoursup  (PIX-17218).

### :arrow_up: Montée de version
- [#11850](https://github.com/1024pix/pix/pull/11850) [BUMP] Update dependency @1024pix/pix-ui to ^55.6.1 (mon-pix).
- [#11854](https://github.com/1024pix/pix/pull/11854) [BUMP] Update dependency @1024pix/pix-ui to ^55.6.1 (orga).
- [#11841](https://github.com/1024pix/pix/pull/11841) [BUMP] Update dependency @1024pix/pix-ui to ^55.6.1 (certif).
- [#11847](https://github.com/1024pix/pix/pull/11847) [BUMP] Update dependency @1024pix/pix-ui to ^55.6.1 (junior).
- [#11840](https://github.com/1024pix/pix/pull/11840) [BUMP] Update dependency @1024pix/pix-ui to ^55.6.1 (admin).

## v5.72.0 (26/03/2025)


### :rocket: Amélioration
- [#11821](https://github.com/1024pix/pix/pull/11821) [FEATURE] Mise en prod PPN3.
- [#11778](https://github.com/1024pix/pix/pull/11778) [FEATURE] Ajouter le PV de fraude sur la page de détails d'une session sur Pix Certif (PIX-17043).
- [#11832](https://github.com/1024pix/pix/pull/11832) [FEATURE] Correction relecture module.
- [#11771](https://github.com/1024pix/pix/pull/11771) [FEATURE] Ajouter la génération des attestations v3 de sessions et classes (PIX-17066).

### :building_construction: Tech
- [#11801](https://github.com/1024pix/pix/pull/11801) [TECH] Migrer la route POST /api/admin/organizations (PIX-17110).
- [#11830](https://github.com/1024pix/pix/pull/11830) [TECH] ajoute la table `campaign-participation-tube-reached-levels` (PIX-17168).
- [#11780](https://github.com/1024pix/pix/pull/11780) [TECH] ajoute un script pour créer les knowledge-element-snapshot perdus (pix-17101).
- [#11813](https://github.com/1024pix/pix/pull/11813) [TECH] Ajouter un sous-composant d'affichage des alertes utilisateur (PIX-16722).
- [#11820](https://github.com/1024pix/pix/pull/11820) [TECH] Remplacer ember-toggle par PixToggleButton.
- [#11629](https://github.com/1024pix/pix/pull/11629) [TECH] Utilisation de Playwright pour les test e2e (expérimentation).

### :bug: Correction
- [#11816](https://github.com/1024pix/pix/pull/11816) [BUGFIX] Enregistrer la route `/api/application/token` sur MaDDo.

### :arrow_up: Montée de version
- [#11831](https://github.com/1024pix/pix/pull/11831) [BUMP] Update Node.js to v22.14.0.
- [#11740](https://github.com/1024pix/pix/pull/11740) [BUMP] Update dependency js-yaml to v4 (mon-pix).
- [#11829](https://github.com/1024pix/pix/pull/11829) [BUMP] Update dependency @1024pix/eslint-plugin to ^2.1.1 (e2e-playwright).

## v5.71.0 (25/03/2025)


### :rocket: Amélioration
- [#11753](https://github.com/1024pix/pix/pull/11753) [FEATURE] Reporter l'email dans la page de réinitialisation du mot de passe (PIX-16730).
- [#11769](https://github.com/1024pix/pix/pull/11769) [FEATURE] Interdire les feedbacks globaux dans les QCU (PIX-17119).
- [#11718](https://github.com/1024pix/pix/pull/11718) [FEATURE] :memo:  Révision du texte à propos de pix companion dans l'espace surveillant (PIX-17042).
- [#11774](https://github.com/1024pix/pix/pull/11774) [FEATURE] Affichage de la dernière connexion par app dans l'onglet "Méthodes de connexion" (PIX-16995).
- [#11600](https://github.com/1024pix/pix/pull/11600) [FEATURE] Améliorer le style de la page de détail de compétence (PIX-16882).
- [#11782](https://github.com/1024pix/pix/pull/11782) [FEATURE] Pix Table sur Pix Admin épisode 9 : Utilisateurs (PIX-17141).

### :building_construction: Tech
- [#11776](https://github.com/1024pix/pix/pull/11776) [TECH] Pix 17139/refactor application transaction.

### :bug: Correction
- [#11806](https://github.com/1024pix/pix/pull/11806) [BUGFIX] La génération d'une attestation PDF, dans le cadre de quête, plante lorsque l'utilisateur a un nom avec des caractères spéciaux (PIX-17128).

### :arrow_up: Montée de version
- [#11825](https://github.com/1024pix/pix/pull/11825) [BUMP] Update dependency @glimmer/component to v2 (junior).
- [#11824](https://github.com/1024pix/pix/pull/11824) [BUMP] Update dependency pdfjs-dist to v5 (api).
- [#11823](https://github.com/1024pix/pix/pull/11823) [BUMP] Update dependency ember-source to ~6.3.0 (junior).
- [#11811](https://github.com/1024pix/pix/pull/11811) [BUMP] Update dependency ember-source to v6 (junior).
- [#11808](https://github.com/1024pix/pix/pull/11808) [BUMP] Remplacement de @1024pix/web-components par @1024pix/epreuves-components.
- [#11739](https://github.com/1024pix/pix/pull/11739) [BUMP] Update dependency html-validate to v9 (PIX-17086).
- [#11809](https://github.com/1024pix/pix/pull/11809) [BUMP] Update dependency @1024pix/pix-ui to ^55.6.0 (certif).

### :coffee: Autre
- [#11625](https://github.com/1024pix/pix/pull/11625) [DOC] Amendement de l'ADR sur les migrations.

## v5.70.0 (24/03/2025)


### :rocket: Amélioration
- [#11770](https://github.com/1024pix/pix/pull/11770) [FEATURE] Ne pas afficher le bloc des attestations si un utilisateur est anonyme (PIX-17118).
- [#11698](https://github.com/1024pix/pix/pull/11698) [FEATURE] Ajout d'une route d'enregistrement automatique de plateforme LTI (PIX-16989).
- [#11546](https://github.com/1024pix/pix/pull/11546) [FEATURE] Script de gestion des applications clientes (PIX-16791).

### :building_construction: Tech
- [#11765](https://github.com/1024pix/pix/pull/11765) [TECH] :truck: Déplace le service d'obscurcissement vers `src/shared`.
- [#11421](https://github.com/1024pix/pix/pull/11421) [TECH] Ajouter un nouveau requirement de type CappedTubes pour pouvoir exprimer une quête à l'aide de sujets cappés en niveau (PIX-16539).
- [#11773](https://github.com/1024pix/pix/pull/11773) [TECH] Ajout de la colonne jurisdiction à la table client_applications (PIX-17137).
- [#11754](https://github.com/1024pix/pix/pull/11754) [TECH] modification des robots.txt pour ne pas indexer les environnements hors prod.
- [#11772](https://github.com/1024pix/pix/pull/11772) [TECH] :hammer: création d'un script pour compléter un `assessment` qui ne l'a pas été... (pix-17108).

### :bug: Correction
- [#11775](https://github.com/1024pix/pix/pull/11775) [BUGFIX] :bug: Corrige le problème de pagination dans la page de liste des sessions de PixAdmin.

### :arrow_up: Montée de version
- [#11798](https://github.com/1024pix/pix/pull/11798) [BUMP] Update dependency @1024pix/pix-ui to ^55.6.0 (mon-pix).
- [#11799](https://github.com/1024pix/pix/pull/11799) [BUMP] Update dependency @1024pix/pix-ui to ^55.6.0 (orga).
- [#11796](https://github.com/1024pix/pix/pull/11796) [BUMP] Update dependency @1024pix/pix-ui to ^55.6.0 (admin).
- [#11797](https://github.com/1024pix/pix/pull/11797) [BUMP] Update dependency @1024pix/pix-ui to ^55.6.0 (junior).
- [#11795](https://github.com/1024pix/pix/pull/11795) [BUMP] Update dependency @1024pix/stylelint-config to ^5.1.28 (orga).
- [#11794](https://github.com/1024pix/pix/pull/11794) [BUMP] Update dependency @1024pix/stylelint-config to ^5.1.28 (mon-pix).
- [#11793](https://github.com/1024pix/pix/pull/11793) [BUMP] Update dependency @1024pix/stylelint-config to ^5.1.28 (junior).
- [#11792](https://github.com/1024pix/pix/pull/11792) [BUMP] Update dependency @1024pix/stylelint-config to ^5.1.28 (certif).
- [#11791](https://github.com/1024pix/pix/pull/11791) [BUMP] Update dependency @1024pix/stylelint-config to ^5.1.28 (admin).
- [#11789](https://github.com/1024pix/pix/pull/11789) [BUMP] Update dependency @1024pix/eslint-plugin to ^2.1.1 (mon-pix).
- [#11790](https://github.com/1024pix/pix/pull/11790) [BUMP] Update dependency @1024pix/eslint-plugin to ^2.1.1 (orga).
- [#11788](https://github.com/1024pix/pix/pull/11788) [BUMP] Update dependency @1024pix/eslint-plugin to ^2.1.1 (junior).
- [#11786](https://github.com/1024pix/pix/pull/11786) [BUMP] Update dependency @1024pix/eslint-plugin to ^2.1.1 (certif).
- [#11787](https://github.com/1024pix/pix/pull/11787) [BUMP] Update dependency @1024pix/eslint-plugin to ^2.1.1 (dossier racine).
- [#11785](https://github.com/1024pix/pix/pull/11785) [BUMP] Update dependency @1024pix/eslint-plugin to ^2.1.1 (audit-logger).
- [#11784](https://github.com/1024pix/pix/pull/11784) [BUMP] Update dependency @1024pix/eslint-plugin to ^2.1.1 (api).

## v5.69.0 (21/03/2025)


### :rocket: Amélioration
- [#11777](https://github.com/1024pix/pix/pull/11777) [FEATURE] Gérer la traduction pour le certificat V3 (PIX-17120).
- [#11767](https://github.com/1024pix/pix/pull/11767) [FEATURE] Générer une première version complète du certificat v3 (PIX-16443).
- [#11766](https://github.com/1024pix/pix/pull/11766) [FEATURE] Créer le composant transitoire entre l'envoi de résultats et la page de fin de parcours (PIX-17015).

### :building_construction: Tech
- [#11760](https://github.com/1024pix/pix/pull/11760) [TECH] optimisations de la CI.
- [#11682](https://github.com/1024pix/pix/pull/11682) [TECH] Script dev pour identifier les violations de dépendances entre les contextes.
- [#11768](https://github.com/1024pix/pix/pull/11768) [TECH] Migrer les feedback générique de QCU vers du spécifique (PIX-17114).

### :bug: Correction
- [#11764](https://github.com/1024pix/pix/pull/11764) [BUGFIX] Réparer un flaky Tubes Selection sur l'admin.
- [#11762](https://github.com/1024pix/pix/pull/11762) [BUGFIX] Ajuster l'affichage de la page de début de campagne (PIX-17090).
- [#11763](https://github.com/1024pix/pix/pull/11763) [BUGFIX] Ne plus retourner de 500 sur le reset d'une compétence avec un assessment de type campagne anonymisé (PIX-17092).

### :arrow_up: Montée de version
- [#11714](https://github.com/1024pix/pix/pull/11714) [BUMP] Update dependency nock to v14 (api).

## v5.68.0 (20/03/2025)


### :rocket: Amélioration
- [#11761](https://github.com/1024pix/pix/pull/11761) [FEATURE] PixTable sur Pix Admin épisode 8 : Organisations (PIX-17091).
- [#11751](https://github.com/1024pix/pix/pull/11751) [FEATURE] Déplacer le champ "Date de dernière connexion" (PIX-16630).
- [#11756](https://github.com/1024pix/pix/pull/11756) [FEATURE] Anonymisation (par généralisation) sur les dernières dates de connexion (PIX-16635).
- [#11736](https://github.com/1024pix/pix/pull/11736) [FEATURE] PixTable sur Pix Admin épisode 7 : Centres de certification (PIX-17063).

### :building_construction: Tech
- [#11757](https://github.com/1024pix/pix/pull/11757) [TECH] :broom: Rapprochement de constantes dans un usecase.
- [#11704](https://github.com/1024pix/pix/pull/11704) [TECH] Suppression du code lié aux campagnes FLASH (PIX-16668).
- [#11676](https://github.com/1024pix/pix/pull/11676) [TECH] Regrouper l'ensemble des actions de finalisation dans une transaction (PIX-17013).
- [#11616](https://github.com/1024pix/pix/pull/11616) [TECH] :broom: :seedling: Nettoyage des seeds de certification (PIX-16430).

### :bug: Correction
- [#11759](https://github.com/1024pix/pix/pull/11759) [BUGFIX] La notification de levelup apparaître parfois lors d'une évaluation de compétence alors que le levelup n'est pas justifié (PIX-17085).

## v5.67.0 (19/03/2025)


### :rocket: Amélioration
- [#11755](https://github.com/1024pix/pix/pull/11755) [FEATURE] Supression des colonnes pixOrgaTermsOfServiceAccepted et lastPixOrgaTermsOfServiceValidatedAt de la table users (PIX-16700).
- [#11737](https://github.com/1024pix/pix/pull/11737) [FEATURE] Supprimer la date de dernière connexion d'une méthode d'authentification après sa réassignation.
- [#11680](https://github.com/1024pix/pix/pull/11680) [FEATURE] Changement de style des bouton de selection d'une classe (PIX-16977).
- [#11679](https://github.com/1024pix/pix/pull/11679) [FEATURE] Pix Junior - Adaptation du style du champ de saisie du code (PIX-16762).
- [#11695](https://github.com/1024pix/pix/pull/11695) [FEATURE] Améliorations visuelles de la page de début de parcours(PIX-16945).
- [#11671](https://github.com/1024pix/pix/pull/11671) [FEATURE] Initialiser la génération de l'attestation V3 avec PDFKit (PIX-17007).
- [#11697](https://github.com/1024pix/pix/pull/11697) [FEATURE] Ajout de la page html d'activité inhabituelle pour Baleen (PIX-16320).
- [#11715](https://github.com/1024pix/pix/pull/11715) [FEATURE] Mise à jour du wording des campagnes de type "EXAM" (Pix-16494).
- [#11703](https://github.com/1024pix/pix/pull/11703) [FEATURE] Nouveau design du layout pour la page Mon Compte (PIX-16928).

### :building_construction: Tech
- [#11752](https://github.com/1024pix/pix/pull/11752) [TECH] Supprimer le logo mis par défaut dans les seeds lors de la création de l'organisation (PIX-17072).
- [#11750](https://github.com/1024pix/pix/pull/11750) [TECH] Correction de flaky sur le test d'acceptance de Account Recovery (PIX-16873).

## v5.66.0 (18/03/2025)


### :rocket: Amélioration
- [#11678](https://github.com/1024pix/pix/pull/11678) [FEATURE] Pix Junior - Ajout d'un lien sur le site Pix depuis la page d'accueil (PIX-16765).
- [#11648](https://github.com/1024pix/pix/pull/11648) [FEATURE] : modification alt text infographie module PPN#2 Controle parental.
- [#11709](https://github.com/1024pix/pix/pull/11709) [FEATURE] afficher sur Pix Admin le dernier accès à un centre de certification (PIX-16634).
- [#11626](https://github.com/1024pix/pix/pull/11626) [FEATURE] PixTable sur Pix Admin épisode 6 (PIX-16988).
- [#11660](https://github.com/1024pix/pix/pull/11660) [FEATURE] Affichage de la date de dernier accès des membres d'une organisation (PIX-16633).

### :bug: Correction
- [#11674](https://github.com/1024pix/pix/pull/11674) [BUGFIX] Corriger un test flaky sur Pix App (PIX-16872).

### :arrow_up: Montée de version
- [#11749](https://github.com/1024pix/pix/pull/11749) [BUMP] Lock file maintenance (dossier racine).
- [#11748](https://github.com/1024pix/pix/pull/11748) [BUMP] Lock file maintenance (audit-logger).
- [#11745](https://github.com/1024pix/pix/pull/11745) [BUMP] Lock file maintenance (load-testing).
- [#11743](https://github.com/1024pix/pix/pull/11743) [BUMP] Update dependency tracked-built-ins to v4 (admin).
- [#11744](https://github.com/1024pix/pix/pull/11744) [BUMP] Update dependency tracked-built-ins to v4 (certif).
- [#11742](https://github.com/1024pix/pix/pull/11742) [BUMP] Update dependency jsdoc-to-markdown to v9 (api).
- [#11741](https://github.com/1024pix/pix/pull/11741) [BUMP] Update dependency js2xmlparser to v5 (load-testing).
- [#11738](https://github.com/1024pix/pix/pull/11738) [BUMP] Update dependency browser-tools to v1.5.3 (.circleci).
- [#11730](https://github.com/1024pix/pix/pull/11730) [BUMP] Update dependency eslint-plugin-unicorn to v57 (certif).
- [#11731](https://github.com/1024pix/pix/pull/11731) [BUMP] Update dependency eslint-plugin-unicorn to v57 (dossier racine).
- [#11734](https://github.com/1024pix/pix/pull/11734) [BUMP] Update dependency globals to v16 (mon-pix).
- [#11729](https://github.com/1024pix/pix/pull/11729) [BUMP] Update dependency eslint-plugin-unicorn to v57 (audit-logger).
- [#11728](https://github.com/1024pix/pix/pull/11728) [BUMP] Update dependency eslint-config-prettier to v10 (mon-pix).
- [#11727](https://github.com/1024pix/pix/pull/11727) [BUMP] Update dependency eslint-config-prettier to v10 (dossier racine).
- [#11725](https://github.com/1024pix/pix/pull/11725) [BUMP] Update dependency eslint-config-prettier to v10 (admin).
- [#11735](https://github.com/1024pix/pix/pull/11735) [BUMP] Update dependency globals to v16 (orga).
- [#11732](https://github.com/1024pix/pix/pull/11732) [BUMP] Update dependency globals to v16 (admin).
- [#11733](https://github.com/1024pix/pix/pull/11733) [BUMP] Update dependency globals to v16 (junior).
- [#11726](https://github.com/1024pix/pix/pull/11726) [BUMP] Update dependency eslint-config-prettier to v10 (audit-logger).
- [#11724](https://github.com/1024pix/pix/pull/11724) [BUMP] Update dependency ember-template-lint to v7 (orga).
- [#11723](https://github.com/1024pix/pix/pull/11723) [BUMP] Update dependency ember-template-lint to v7 (mon-pix).
- [#11722](https://github.com/1024pix/pix/pull/11722) [BUMP] Update dependency ember-template-lint to v7 (junior).
- [#11716](https://github.com/1024pix/pix/pull/11716) [BUMP] Update dependency @1024pix/pix-ui to ^55.5.0 (junior).
- [#11721](https://github.com/1024pix/pix/pull/11721) [BUMP] Update dependency ember-template-lint to v7 (certif).
- [#11707](https://github.com/1024pix/pix/pull/11707) [BUMP] Update dependency ember-page-title to v9 (certif).
- [#11720](https://github.com/1024pix/pix/pull/11720) [BUMP] Update dependency ember-page-title to v9 (orga).
- [#11719](https://github.com/1024pix/pix/pull/11719) [BUMP] Update dependency @1024pix/pix-ui to ^55.5.0 (orga).
- [#11717](https://github.com/1024pix/pix/pull/11717) [BUMP] Update dependency @1024pix/pix-ui to ^55.5.0 (mon-pix).
- [#11696](https://github.com/1024pix/pix/pull/11696) [BUMP] Update dependency @1024pix/pix-ui to v55 (mon-pix).
- [#11693](https://github.com/1024pix/pix/pull/11693) [BUMP] Update dependency @1024pix/pix-ui to v55 (certif).
- [#11711](https://github.com/1024pix/pix/pull/11711) [BUMP] Update dependency @1024pix/pix-ui to ^55.5.0 (admin).
- [#11712](https://github.com/1024pix/pix/pull/11712) [BUMP] Update dependency eslint-plugin-unicorn to v57 (api).
- [#11713](https://github.com/1024pix/pix/pull/11713) [BUMP] Update dependency file-type to v20 (api).

## v5.65.0 (17/03/2025)


### :rocket: Amélioration
- [#11691](https://github.com/1024pix/pix/pull/11691) [FEATURE] Autoriser de repasser une campagne de type EXAM avec un score de  100% (PIX-17029).
- [#11666](https://github.com/1024pix/pix/pull/11666) [FEATURE] Modifier et rendre conditionnel le wording d'information sur le reset/retry en fin de parcours (PIX-16683).
- [#11664](https://github.com/1024pix/pix/pull/11664) [FEATURE] Créer les events liés aux flashcards - (PIX-16953) .
- [#11641](https://github.com/1024pix/pix/pull/11641) [FEATURE] Enregistrer la date de dernière connexion aux orgas & cdc seulement sur les memberships actifs (PIX-16990).

### :building_construction: Tech
- [#11586](https://github.com/1024pix/pix/pull/11586) [TECH] Mise à jour de openid-client en version 6 (PIX-16870).
- [#11667](https://github.com/1024pix/pix/pull/11667) [TECH] utilise le composant PixBlock dans orga (Pix-16886).

### :bug: Correction
- [#11701](https://github.com/1024pix/pix/pull/11701) [BUGFIX]: Réparer Smart Random Simulator (PIX-17038).
- [#11635](https://github.com/1024pix/pix/pull/11635) [BUGFIX]PixAdmin: Autoriser le profil SUPPORT à détacher un profil cible d'une organisation.

### :arrow_up: Montée de version
- [#11710](https://github.com/1024pix/pix/pull/11710) [BUMP] Update dependency ember-page-title to v9 (mon-pix).
- [#11708](https://github.com/1024pix/pix/pull/11708) [BUMP] Update dependency ember-page-title to v9 (junior).
- [#11706](https://github.com/1024pix/pix/pull/11706) [BUMP] Update dependency eslint-config-prettier to v10 (api).
- [#11705](https://github.com/1024pix/pix/pull/11705) [BUMP] Update dependency @sentry/ember to v9 (mon-pix).
- [#11699](https://github.com/1024pix/pix/pull/11699) [BUMP] Update dependency @ember/render-modifiers to v3 (junior).
- [#11688](https://github.com/1024pix/pix/pull/11688) [BUMP] Update dependency cron-parser to v5 (api).

## v5.64.0 (14/03/2025)


### :rocket: Amélioration
- [#11644](https://github.com/1024pix/pix/pull/11644) [FEATURE] Gérer la génération des certificats des sessions V3 (PIX-16444).
- [#11677](https://github.com/1024pix/pix/pull/11677) [FEATURE] Rediriger les campagnes FWB sur le domaine pix.org (PIX-16227) .
- [#11663](https://github.com/1024pix/pix/pull/11663) [FEATURE] : Modifications des alternatives textuelles module PPN#3.
- [#11299](https://github.com/1024pix/pix/pull/11299) [FEATURE] Supprimer l'utilisation des propriétés timer et focus des challenges Pix Junior (PIX-16316).
- [#11672](https://github.com/1024pix/pix/pull/11672) [FEATURE] Ajout d'une description dans les balises meta (PIX-16761).
- [#11673](https://github.com/1024pix/pix/pull/11673) [FEATURE] Corriger des typos au niveau de la création de campagne (PIX-17014).

### :building_construction: Tech
- [#11618](https://github.com/1024pix/pix/pull/11618) [TECH] Upgrade audit-logger dependencies.
- [#11624](https://github.com/1024pix/pix/pull/11624) [TECH] Suppression du feature toggle FT_PIX1D_ENABLED (PIX-16979).

### :bug: Correction
- [#11587](https://github.com/1024pix/pix/pull/11587) [BUGFIX] Correction des compteurs de la page de résumé de session de certification dans pixAdmin (PIX-16764).
- [#11662](https://github.com/1024pix/pix/pull/11662) [BUGFIX] Remplacement des UUIDs dupliqués des contenus de modules (PIX-17009).
- [#11675](https://github.com/1024pix/pix/pull/11675) [BUGFIX] Corriger l'affichage de la certificabilité (PIX-17021).
- [#11670](https://github.com/1024pix/pix/pull/11670) [BUGFIX] Pix Junior - Suppression du scroll excessif des épreuves avec 2 colonnes (PIX-16760).

### :arrow_up: Montée de version
- [#11694](https://github.com/1024pix/pix/pull/11694) [BUMP] Update dependency @1024pix/pix-ui to v55 (junior).
- [#11687](https://github.com/1024pix/pix/pull/11687) [BUMP] Update dependency @1024pix/pix-ui to v55 (admin).
- [#11689](https://github.com/1024pix/pix/pull/11689) [BUMP] Update dependency ember-page-title to v9 (admin).
- [#11690](https://github.com/1024pix/pix/pull/11690) [BUMP] Update dependency ember-template-lint to v7 (admin).
- [#11686](https://github.com/1024pix/pix/pull/11686) [BUMP] Update node.
- [#11685](https://github.com/1024pix/pix/pull/11685) [BUMP] Update dependency ember-exam to v9.1.0 (orga).
- [#11684](https://github.com/1024pix/pix/pull/11684) [BUMP] Update dependency ember-exam to v9.1.0 (junior).
- [#11683](https://github.com/1024pix/pix/pull/11683) [BUMP] Update dependency ember-exam to v9.1.0 (certif).
- [#11681](https://github.com/1024pix/pix/pull/11681) [BUMP] Update dependency @1024pix/pix-ui to ^55.4.0 (orga).
- [#11659](https://github.com/1024pix/pix/pull/11659) [BUMP] Update dependency webpack to v5.98.0 (junior).
- [#11640](https://github.com/1024pix/pix/pull/11640) [BUMP] Update dependency @1024pix/pix-ui to ^54.15.0 (junior).
- [#11338](https://github.com/1024pix/pix/pull/11338) [BUMP] Update dependency eslint to v9 (dossier racine).

## v5.63.0 (13/03/2025)


### :rocket: Amélioration
- [#11665](https://github.com/1024pix/pix/pull/11665) [FEATURE] Utiliser le snapshot pour calculer l'obtention de RTs dans le cadre d'une campagne EXAM (PIX-17003).
- [#11657](https://github.com/1024pix/pix/pull/11657) [FEATURE] Empêcher les campagnes de Type EXAM à pouvoir faire du reset de campagne (Pix-16497).
- [#11581](https://github.com/1024pix/pix/pull/11581) [FEATURE] Ajouter un nom interne pour les profils cibles (PIX-16685).
- [#11627](https://github.com/1024pix/pix/pull/11627) [FEATURE] Remplacement du bloc "Durant ce parcours" de la page de début d'évaluation (PIX-16944).
- [#11633](https://github.com/1024pix/pix/pull/11633) [FEATURE] Changement de taille du logo Pix dans le footer (PIX-16697).
- [#11654](https://github.com/1024pix/pix/pull/11654) [FEATURE] Utilise le snapshot pour calculer les résultats de fin de campagne d'Exam (PIX-17004).
- [#11649](https://github.com/1024pix/pix/pull/11649) [FEATURE] Utilise les snapshots dans les campagnes d'EXAM pour acquérir les paliers (PIX-17002).
- [#11646](https://github.com/1024pix/pix/pull/11646) [FEATURE] Ne pas écraser le snapshot élaboré en cours de participation pour une campagne d'interro lors du partage de résultats (PIX-16777).
- [#11634](https://github.com/1024pix/pix/pull/11634) [FEATURE] Récupère le prochain challenge en fonction du knowledge element snapshot dans les campagnes d'Exam (PIX-16775).
- [#11575](https://github.com/1024pix/pix/pull/11575) [FEATURE] Alimenter un KE snapshot au fur et à mesure des réponses apportées lors d'une campagne d'interro (PIX-16775).
- [#11617](https://github.com/1024pix/pix/pull/11617) [FEATURE] Permettre de télécharger le csv des résultats d'une campagne de type EXAM (PIX-16976).

### :building_construction: Tech
- [#11631](https://github.com/1024pix/pix/pull/11631) [TECH] Migrer la route de suppression d'un membre de centre de CERTIF (PIX-16994).
- [#11653](https://github.com/1024pix/pix/pull/11653) [TECH] Mettre à jour le CHANGELOG avec la version v5.61.1.
- [#11651](https://github.com/1024pix/pix/pull/11651) [TECH] Ne pas pinger `team-devcomp` en cas d'évols du référentiel Modulix (PIX-17006).

### :bug: Correction
- [#11650](https://github.com/1024pix/pix/pull/11650) [BUGFIX] (Correctif sans ilike) Pour les demandes de réinitialisation de mot de passe, rendre la recherche des comptes vraiment insensible à la casse (PIX-17005).

### :arrow_up: Montée de version
- [#11658](https://github.com/1024pix/pix/pull/11658) [BUMP] Update dependency @1024pix/pix-ui to ^55.1.0 (orga).
- [#11652](https://github.com/1024pix/pix/pull/11652) [BUMP] Update dependency @1024pix/pix-ui to v55 (orga).
- [#11647](https://github.com/1024pix/pix/pull/11647) [BUMP] Update dependency globals to v15.15.0 (admin).

### :coffee: Autre
- [#11656](https://github.com/1024pix/pix/pull/11656) Revert "[TECH] Ne pas pinger `team-devcomp` en cas d'évols du référentiel Modulix (PIX-17006)".

## v5.62.0 (12/03/2025)


### :rocket: Amélioration
- [#11507](https://github.com/1024pix/pix/pull/11507) [FEATURE] affiche les participations anonymisées dans mes parcours  (Pix-14458).
- [#11621](https://github.com/1024pix/pix/pull/11621) [FEATURE] Supprime le dégradé en haut de le page de saisie du code (pix-16880).
- [#11639](https://github.com/1024pix/pix/pull/11639) [FEATURE] S'assurer que les UUIDs de modules ne sont pas en doublon dans les PRs de modif de contenu.
- [#11593](https://github.com/1024pix/pix/pull/11593) [FEATURE] Appliquer les modifications de navigation et de gabarit sur la page "Certification" sur App (PIX-16876).
- [#11594](https://github.com/1024pix/pix/pull/11594) [FEATURE] Enregistrer l'accès d'un utilisateur à un centre de certification (PIX-16629).
- [#11619](https://github.com/1024pix/pix/pull/11619) [FEATURE] Exposer les clés publiques des plateformes LTI (PIX-16947).
- [#11609](https://github.com/1024pix/pix/pull/11609) [FEATURE] Retrouver une plateforme LTI grâce à son clientId (PIX-16940).

### :building_construction: Tech
- [#11636](https://github.com/1024pix/pix/pull/11636) [TECH] Utiliser le composant PixTable dans la page des participations d'une campagne sur PixAdmin (PIX-16998).
- [#11598](https://github.com/1024pix/pix/pull/11598) [TECH] Migrer la route POST /api/application/token (PIX-16859).
- [#11632](https://github.com/1024pix/pix/pull/11632) [TECH] Corriger des tests flacky sur le lastAccessedAt d'une organisation (PIX-16991).
- [#11620](https://github.com/1024pix/pix/pull/11620) [TECH] Supprimer le double model Campaign (PIX-16997).

### :arrow_up: Montée de version
- [#11645](https://github.com/1024pix/pix/pull/11645) [BUMP] Update dependency @1024pix/pix-ui to ^54.15.0 (orga).
- [#11638](https://github.com/1024pix/pix/pull/11638) [BUMP] Update dependency @1024pix/pix-ui to ^54.15.0 (admin).
- [#11613](https://github.com/1024pix/pix/pull/11613) [BUMP] Update dependency @1024pix/eslint-plugin to ^2.1.0 (orga).
- [#11368](https://github.com/1024pix/pix/pull/11368) [BUMP] Update dependency eslint to v9 (load-testing).

### :coffee: Autre
- [#11643](https://github.com/1024pix/pix/pull/11643) Revert "[BUGFIX] Pour les demandes de réinitialisation de mot de passe, rendre la recherche des comptes vraiment insensible à la casse (PIX-16896)".

## v5.61.1 (12/03/2025)


### :bug: Correction
- [#11643](https://github.com/1024pix/pix/pull/11643) Revert "[BUGFIX] Pour les demandes de réinitialisation de mot de passe, rendre la recherche des comptes vraiment insensible à la casse (PIX-16896)"

## v5.61.0 (11/03/2025)


### :rocket: Amélioration
- [#11561](https://github.com/1024pix/pix/pull/11561) [FEATURE] Enregistrer l'accès d'un utilisateur à une organisation (PIX-16628).
- [#11551](https://github.com/1024pix/pix/pull/11551) [FEATURE] Avoir l'envoi multiple activé par défaut à la création d'une organisation (PIX-16684).
- [#11565](https://github.com/1024pix/pix/pull/11565) [FEATURE] Améliorer les déclenchements d'action de l'écran d'épreuve (PIX-16784).
- [#11568](https://github.com/1024pix/pix/pull/11568) [FEATURE] Module PPN3 ajout images définitives.
- [#11608](https://github.com/1024pix/pix/pull/11608) [FEATURE] Afficher le type de campagne dans PixAdmin (PIX-16495).
- [#11607](https://github.com/1024pix/pix/pull/11607) [FEATURE] Autoriser l'affichage des campagnes de type EXAM sur le dashboard d'un utilisateur (PIX-16821).
- [#11592](https://github.com/1024pix/pix/pull/11592) [FEATURE] Créer le tag "En attente" lors d'un signalement d'épreuve ou d'extension sur Pix Certif (PIX-16913).

### :building_construction: Tech
- [#11539](https://github.com/1024pix/pix/pull/11539) [TECH] Suppression du FT_USER_TOKEN_AUD_CONFINEMENT_ENABLED et du reste du code legacy sur scope et target (PIX-16531).
- [#11563](https://github.com/1024pix/pix/pull/11563) [TECH] :recycle: Extraction d'un service à partir d'un modèle plus plus de clarté.
- [#11604](https://github.com/1024pix/pix/pull/11604) [TECH] Migrer la route de mise à jour du référent Pix Certif (Pix-16938).
- [#11614](https://github.com/1024pix/pix/pull/11614) [TECH] Créer le FT pour les attestations PDF V3 avec le nouveau système (PIX-16957).

### :bug: Correction
- [#11588](https://github.com/1024pix/pix/pull/11588) [BUGFIX] Utiliser la bonne variante blanche du logo République FR (PIX-16881).
- [#11615](https://github.com/1024pix/pix/pull/11615) [BUGFIX] Corriger un test flaky sur PixAdmin (PIX-16958).
- [#11610](https://github.com/1024pix/pix/pull/11610) [BUGFIX] Pour les demandes de réinitialisation de mot de passe, rendre la recherche des comptes vraiment insensible à la casse (PIX-16896).

### :arrow_up: Montée de version
- [#11623](https://github.com/1024pix/pix/pull/11623) [BUMP] Update dependency @1024pix/pix-ui to ^54.14.1 (orga).
- [#11622](https://github.com/1024pix/pix/pull/11622) [BUMP] Update dependency @1024pix/pix-ui to ^54.14.1 (mon-pix).

## v5.60.0 (10/03/2025)


### :rocket: Amélioration
- [#11590](https://github.com/1024pix/pix/pull/11590) [FEATURE] Afficher le bouton de gestion du signalement en dehors du menu sur Pix Certif (PIX-16884).
- [#11545](https://github.com/1024pix/pix/pull/11545) [FEATURE] Utiliser PixTable dans les tableaux d'équipe et de finalisation sur Pix Certif (PIX-16788).
- [#11605](https://github.com/1024pix/pix/pull/11605) [FEATURE] Màj feedback constat, dont QCM .
- [#11591](https://github.com/1024pix/pix/pull/11591) [FEATURE] Ne pas afficher les indicateurs de progression, level-up et compteur de question en mode interro (PIX-16490).
- [#11595](https://github.com/1024pix/pix/pull/11595) [FEATURE] Cacher la progression dans les campagnes de Type EXAM (Pix-16921).
- [#11583](https://github.com/1024pix/pix/pull/11583) [FEATURE] Supprimer le tag "Autorisé à reprendre" de l'espace surveillant sur Pix Certif (PIX-16875).

### :building_construction: Tech
- [#11574](https://github.com/1024pix/pix/pull/11574) [TECH] Limiter les 500 en cas de mauvais URL et/ou de mauvaise utilisation de l'API (PIX-16830).
- [#11596](https://github.com/1024pix/pix/pull/11596) [TECH] Ajouter le dossier de migrations aux codeowners.
- [#11603](https://github.com/1024pix/pix/pull/11603) [TECH] Séparer la sauvegarde d'une réponse avec la sauvegarde des knowledge-elements correspondants (PIX-16930).
- [#11601](https://github.com/1024pix/pix/pull/11601) [TECH] Création de la table des enregistrements de plateforme LTI.
- [#11468](https://github.com/1024pix/pix/pull/11468) [TECH] Refactorer getPlacementProfileWithSnapshotting et generatePlacementProfile.

### :bug: Correction
- [#11602](https://github.com/1024pix/pix/pull/11602) [BUGFIX] Le `figcaption` des éléments images produisent toujours un espace vide.
- [#11599](https://github.com/1024pix/pix/pull/11599) [BUGFIX] Quand on retente un QCM, les réponses sélectionnées avant ne sont pas prises en compte (PIX-16822).

### :arrow_up: Montée de version
- [#11612](https://github.com/1024pix/pix/pull/11612) [BUMP] Update dependency @1024pix/pix-ui to ^54.14.1 (junior).
- [#11611](https://github.com/1024pix/pix/pull/11611) [BUMP] Update dependency @1024pix/pix-ui to ^54.14.1 (admin).

## v5.59.0 (07/03/2025)


### :rocket: Amélioration
- [#11567](https://github.com/1024pix/pix/pull/11567) [FEATURE] Enregistrer le début d'un passage en tant qu'événement (PIX-16812).
- [#11578](https://github.com/1024pix/pix/pull/11578) [FEATURE] Cacher le bouton "Je retente" lors d'une campagne d'interro (PIX-16496).
- [#11562](https://github.com/1024pix/pix/pull/11562) [FEATURE] Pouvoir visualiser les résultats d'une campagne d'interro côté PixOrga, à la manière d'une campagne d'évaluation pour le moment (PIX-16829).
- [#11569](https://github.com/1024pix/pix/pull/11569) [FEATURE] Utiliser le même style pour l'intitulé Réponse correcte et Réponse incorrecte (PIX-16840).

### :building_construction: Tech
- [#11579](https://github.com/1024pix/pix/pull/11579) [TECH] Améliorer la récupération du timestamp d'une requête (PIX-16871).
- [#11560](https://github.com/1024pix/pix/pull/11560) [TECH] Permettre de hasher le contenu d'un module (PIX-16810).
- [#11582](https://github.com/1024pix/pix/pull/11582) [TECH] Déplacer et factoriser de la logique de calcul de certains attributs de l'assessment dans son modèle (PIX-16885).
- [#11573](https://github.com/1024pix/pix/pull/11573) [TECH] Separer les seeds SCO et GP pour Parcoursup (PIX-16842).
- [#11556](https://github.com/1024pix/pix/pull/11556) [TECH] :broom: Utilisations de valeurs déjà présente dans le code pour le calcul du niveau de maille (PIX-16718).
- [#11572](https://github.com/1024pix/pix/pull/11572) [TECH] Déplacer et factoriser le code dédié au calcul du levelup après avoir répondu positivement à une épreuve (PIX-16847).

### :bug: Correction
- [#11589](https://github.com/1024pix/pix/pull/11589) [BUGFIX]: Afficher correctement les badges sur l'ecran de resultat de Pix orga (PIX-16909).
- [#11580](https://github.com/1024pix/pix/pull/11580) [BUGFIX] Traduire le text du label de l'icone dans le select de création de campagne (PIX-16831).
- [#11577](https://github.com/1024pix/pix/pull/11577) [BUGFIX] Remplacement des UUIDs dupliqués des contenus de modules (PIX-16819).

## v5.58.0 (06/03/2025)


### :rocket: Amélioration
- [#11547](https://github.com/1024pix/pix/pull/11547) [FEATURE] Afficher la date de dernière connexion par rapport à la méthode de connexion utilisée (PIX-16631).
- [#11559](https://github.com/1024pix/pix/pull/11559) [FEATURE] Sauvegarder les événements `PASSAGE_TERMINATED`(PIX-16811).
- [#11552](https://github.com/1024pix/pix/pull/11552) [FEATURE] Enregistrer la date de dernière connexion Pix pour les méthodes de connexion GAR (PIX-16624).
- [#11538](https://github.com/1024pix/pix/pull/11538) [FEATURE] Enregistrer la date de dernière connexion dans Authentication method pour les connexions OIDC (PIX-16742).
- [#11558](https://github.com/1024pix/pix/pull/11558) [FEATURE] Utiliser PixTable dans les tableaux de session et de certification sur Pix Admin (PIX-16809).

### :building_construction: Tech
- [#11509](https://github.com/1024pix/pix/pull/11509) [TECH] Utiliser le PixTable dans tout PixOrga (PIX-15793).

### :arrow_up: Montée de version
- [#11570](https://github.com/1024pix/pix/pull/11570) [BUMP] Update dependency @1024pix/pix-ui to ^54.12.2 (orga).

## v5.57.0 (05/03/2025)


### :rocket: Amélioration
- [#11541](https://github.com/1024pix/pix/pull/11541) [FEATURE] Pouvoir démarrer et achever une participation à une campagne interro - sans les spécificités interros pour le moment (PIX-16779).
- [#11530](https://github.com/1024pix/pix/pull/11530) [FEATURE] Module PPN#2 - derniers changements avant sortie ! .
- [#11557](https://github.com/1024pix/pix/pull/11557) [FEATURE] Initier un data repository pour enregistrer des passages events (PIX-16728).
- [#11523](https://github.com/1024pix/pix/pull/11523) [FEATURE] Les iframes autorisent l'utilisation du presse papier de l'utilisateur (PIX-16746).
- [#11540](https://github.com/1024pix/pix/pull/11540) [FEATURE] Enregistrer la date de dernière connexion Pix par application (PIX-16721).
- [#11502](https://github.com/1024pix/pix/pull/11502) [FEATURE] Utiliser les designs tokens sur Mon Pix (PIX-16698).

### :building_construction: Tech
- [#11566](https://github.com/1024pix/pix/pull/11566) [TECH] Supprimer des logs plus utilisés.
- [#11554](https://github.com/1024pix/pix/pull/11554) [TECH] Migration de la route POST /api/memberships/{id}/disable dans /src/team.
- [#11519](https://github.com/1024pix/pix/pull/11519) [TECH] :truck: Déplace `errors helper` vers `src/prescription/campaign-participation/`.
- [#11544](https://github.com/1024pix/pix/pull/11544) [TECH] Ajouter une contrainte sur la table last-user-application-connections assurant l'unicité du couple userId-application (PIX-16769).
- [#11553](https://github.com/1024pix/pix/pull/11553) [TECH] Créer la table `passage-events` (migration) (PIX-16727).

### :bug: Correction
- [#11564](https://github.com/1024pix/pix/pull/11564) [BUGFIX] Correction du problème de largeur d'encart sur la page de résultats de campagnes sans badges (PIX-16786).
- [#11555](https://github.com/1024pix/pix/pull/11555) [BUGFIX] Corriger le warning `MaxListenersExceededWarning` lors de l'exécution des tests  .

## v5.56.0 (04/03/2025)


### :rocket: Amélioration
- [#11531](https://github.com/1024pix/pix/pull/11531) [FEATURE] Permet au SUPER ADMIN de mettre à jour la colonne params sur les fonctionnalités (PIX-16763).

### :building_construction: Tech
- [#11536](https://github.com/1024pix/pix/pull/11536) [TECH] Mise en place d'`Events` liés au passage de module (PIX-16726).
- [#11550](https://github.com/1024pix/pix/pull/11550) [TECH] Les types de colonnes ne sont pas corrects sur le datamart Parcoursup de dev (PIX-16800).
- [#11521](https://github.com/1024pix/pix/pull/11521) [TECH] Utiliser PixTable sur Pix Certif (PIX-15794).
- [#11524](https://github.com/1024pix/pix/pull/11524) [TECH] Script pour fix les certification-challenge-capacities liés à des live-alerts (PIX-16701).
- [#11513](https://github.com/1024pix/pix/pull/11513) [TECH] Dans Pix API supprimer les notions erronées ou obsolètes de scope et de target utilisées pour la vérification du droit d’accès d’un utilisateur à une application (PIX-15945).
- [#11528](https://github.com/1024pix/pix/pull/11528) [TECH] Migration de la route POST api/membership/me/disable (PIX-16733).

### :bug: Correction
- [#11542](https://github.com/1024pix/pix/pull/11542) [BUGFIX] Empêcher la validation d'un live-alert assigné à une épreuve déjà répondue (PIX-16783).
- [#11549](https://github.com/1024pix/pix/pull/11549) [BUGFIX] Permettre d'afficher les notifications avec le nouveau menu sur Pix Admin.

## v5.55.0 (03/03/2025)


### :rocket: Amélioration
- [#11537](https://github.com/1024pix/pix/pull/11537) [FEATURE] Corriger l'espace entre le menu et l'alert en format mobile (PIX-16665).

### :building_construction: Tech
- [#11529](https://github.com/1024pix/pix/pull/11529) [TECH] Migration de la route GET /api/admin/certification-centers/{certificationCenterId}/certification-center-memberships (PIX-16758).
- [#11527](https://github.com/1024pix/pix/pull/11527) [TECH] Enregistrer l'historique des réplications des données froides (PIX-16710)(PIX-16712).

### :arrow_up: Montée de version
- [#11543](https://github.com/1024pix/pix/pull/11543) [BUMP] Update dependency @1024pix/pix-ui to ^54.12.1 (orga).
- [#11491](https://github.com/1024pix/pix/pull/11491) [BUMP] Update dependency @1024pix/pix-ui to ^54.10.0 (admin).

## v5.54.0 (28/02/2025)


### :rocket: Amélioration
- [#11504](https://github.com/1024pix/pix/pull/11504) [FEATURE] PixAdmin : pouvoir dupliquer les contenus formatifs (PIX-16670)(PIX-16075).
- [#11505](https://github.com/1024pix/pix/pull/11505) [FEATURE] Enregistrer la date de dernière connexion Pix par application pour les méthodes de connexion OIDC (PIX-16623).
- [#11467](https://github.com/1024pix/pix/pull/11467) [FEATURE] Permettre aux prescripteurs de télécharger les attestations lié à la parentalité (PIX-16666).

### :building_construction: Tech
- [#11526](https://github.com/1024pix/pix/pull/11526) [TECH] Migrer la route /api/admin/organizations/{id}/archive (PIX-16755).
- [#11533](https://github.com/1024pix/pix/pull/11533) [TECH] Corriger les warnings lors des tests unitaires.
- [#11532](https://github.com/1024pix/pix/pull/11532) [TECH] Corriger le warning `valid integer` des tests d'intég.

### :arrow_up: Montée de version
- [#11534](https://github.com/1024pix/pix/pull/11534) [BUMP] Update dependency @1024pix/pix-ui to ^54.12.0 (orga).

## v5.53.0 (27/02/2025)


### :rocket: Amélioration
- [#11514](https://github.com/1024pix/pix/pull/11514) [FEATURE] Enregistrer dans Authentication Methods la date de dernière connexion Pix pour les méthodes de connexion Pix (PIX-16620).
- [#11470](https://github.com/1024pix/pix/pull/11470) [FEATURE] Ajouter PixTable dans le tableau rattachant un profil cible à une complémentaire sur Pix Admin (PIX-16681).
- [#11489](https://github.com/1024pix/pix/pull/11489) [FEATURE] Seeds pour Parcoursup (PIX-16690).
- [#11511](https://github.com/1024pix/pix/pull/11511) [FEATURE] Ne pas afficher la progression sur les campagnes de type EXAM (Pix-16493).
- [#11479](https://github.com/1024pix/pix/pull/11479) [FEATURE] Permettre de créer une Campagne de type EXAM (Pix-16488).

### :building_construction: Tech
- [#11517](https://github.com/1024pix/pix/pull/11517) [TECH] Ajout de la connexion à une BDD supplémentaire pour MaDDo .
- [#11516](https://github.com/1024pix/pix/pull/11516) [TECH] :truck: Déplace `http-agent` vers `src/shared/'.
- [#11485](https://github.com/1024pix/pix/pull/11485) [TECH] :truck: Déplace le cas d'usage `updateLastQuestionState` vers `src/`.
- [#11525](https://github.com/1024pix/pix/pull/11525) [TECH] Ajouter un nom d'evenement pour monitorer les challenges mal formatés (PIX-16747).
- [#11512](https://github.com/1024pix/pix/pull/11512) [TECH] Créer le feature toggle pour les attestations PDF V3 (PIX-16441).
- [#11515](https://github.com/1024pix/pix/pull/11515) [TECH] Créer une fonction qui renvoie l'application demandée à partir de l'origin HTTP (PIX-16732).
- [#11483](https://github.com/1024pix/pix/pull/11483) [TECH] :broom: Suppression d'un serializer qui n'est plus utilisé.
- [#11458](https://github.com/1024pix/pix/pull/11458) [TECH] Refacto du usecase "correctAnswerThenUpdateAssessment" (PIX-16737).
- [#11482](https://github.com/1024pix/pix/pull/11482) [TECH] :truck: Déplace le sérializer Student Information For Account Recovery dans `src/`.

### :bug: Correction
- [#11522](https://github.com/1024pix/pix/pull/11522) [BUGFIX] Déplacer les modifiers dans le bon sous ensemble css (PIX-OUPSY).
- [#11508](https://github.com/1024pix/pix/pull/11508) [BUGFIX] Corriger la position et couleur du bouton de copie du nouveau mot de passe (PIX-16475).

## v5.52.0 (26/02/2025)


### :rocket: Amélioration
- [#11506](https://github.com/1024pix/pix/pull/11506) [FEATURE] Traduction en NL et ES de l'e-mail d'alerte si reconnexion après 12 mois.
- [#11488](https://github.com/1024pix/pix/pull/11488) [FEATURE] Ajouter le filtre pour trier les participations par badge non obtenu. (PIX-16351).
- [#11481](https://github.com/1024pix/pix/pull/11481) [FEATURE] Remplacer le PixReturnTo déprécié par le PixButtonLink sur Pix App (PIX-16695).
- [#11484](https://github.com/1024pix/pix/pull/11484) [FEATURE] Utiliser PixCode dans la page de connexion sur Pix Junior (PIX-16536).

### :building_construction: Tech
- [#11501](https://github.com/1024pix/pix/pull/11501) [TECH] Faire fonctionner l'inspecteur Ember avec ember-source 6.1 (PIX-16664).
- [#11480](https://github.com/1024pix/pix/pull/11480) [TECH] Migrer les derniers components orga en .gjs (PIX-16671).
- [#11510](https://github.com/1024pix/pix/pull/11510) [TECH] Pouvoir spécifier les variables d'environnement obligatoires par API.

### :bug: Correction
- [#11476](https://github.com/1024pix/pix/pull/11476) [BUGFIX] Empêcher les questions avec live-alerts validées d'être prises en compte dans le scoring (PIX-16482).

### :arrow_up: Montée de version
- [#11496](https://github.com/1024pix/pix/pull/11496) [BUMP] Update dependency postgres to v16.

## v5.51.0 (25/02/2025)


### :rocket: Amélioration
- [#11477](https://github.com/1024pix/pix/pull/11477) [FEATURE] Remplacer le PixReturnTo déprécié par le PixButtonLink sur Pix Certif (PIX-16687).
- [#11420](https://github.com/1024pix/pix/pull/11420) [FEATURE] Ajouter une validation de l'email dans les liens de l'email d'avertissement de connexion après un an d'inactivité (PIX-16127).
- [#11497](https://github.com/1024pix/pix/pull/11497) [FEATURE] Mettre à disposition un webhook pour repliquer les données entre le datawarehouse et le datamart (PIX-16704).
- [#11460](https://github.com/1024pix/pix/pull/11460) [FEATURE] Créer la table last-user-application-connections (PIX-16618).
- [#11465](https://github.com/1024pix/pix/pull/11465) [FEATURE] Créer un endpoint pour la duplication d'un CF(PIX-16669).

### :building_construction: Tech
- [#11503](https://github.com/1024pix/pix/pull/11503) [TECH] Ne pas remonter d'erreur à l'utilisateur si les quêtes sont en erreurs (PIX-16706).
- [#11495](https://github.com/1024pix/pix/pull/11495) [TECH] Amélioration des performances du database builder.
- [#11498](https://github.com/1024pix/pix/pull/11498) [TECH] Déclenche la CI sur les commits de la branche dev.
- [#11255](https://github.com/1024pix/pix/pull/11255) [TECH] Ajouter un script pour actualiser les fichiers de traductions.
- [#11450](https://github.com/1024pix/pix/pull/11450) [TECH] Mettre à jour la configuration docker pour le local-domains.
- [#11426](https://github.com/1024pix/pix/pull/11426) [TECH] Ajouter un sous-composant d'affichage des infos du candidat d'une certification (PIX-16580).
- [#11347](https://github.com/1024pix/pix/pull/11347) [TECH] Expliciter la définiton des quêtes (PIX-16445).

### :arrow_up: Montée de version
- [#11494](https://github.com/1024pix/pix/pull/11494) [BUMP] Update dependency @1024pix/pix-ui to ^54.10.0 (mon-pix).
- [#11464](https://github.com/1024pix/pix/pull/11464) [BUMP] Update dependency @1024pix/eslint-plugin to ^2.1.0 (mon-pix).
- [#11499](https://github.com/1024pix/pix/pull/11499) [BUMP] Update dependency @1024pix/pix-ui to ^54.10.0 (orga).

### :coffee: Autre
- [#11406](https://github.com/1024pix/pix/pull/11406) [DOC] Documenter le choix de l'architecture pour la mise à disposition des données (PIX-16526).

## v5.50.0 (24/02/2025)


### :rocket: Amélioration
- [#11478](https://github.com/1024pix/pix/pull/11478) [FEATURE] Remplacer le PixReturnTo déprécié par le PixButtonLink sur Pix Orga (PIX-16694).
- [#11486](https://github.com/1024pix/pix/pull/11486) [FEATURE] Renommage du didacticiel de Modulix en bac-a-sable (PIX-16674).
- [#11387](https://github.com/1024pix/pix/pull/11387) [FEATURE] Page résultats de campagne : afficher les badges obtenus sur le total des participations (PIX-16241).
- [#11474](https://github.com/1024pix/pix/pull/11474) [FEATURE] Ajouter une feature qui permet d'avoir une nouvelle typologie de campagne (PIX-16485).
- [#11453](https://github.com/1024pix/pix/pull/11453) [FEATURE] Afficher correctement le nom/prenom sur les attesations PDF sixth_grade / parenthood (Pix-16644).
- [#11452](https://github.com/1024pix/pix/pull/11452) [FEATURE] Ajouter les migrations de lastLoggedAt et lastAccessedAt.

### :building_construction: Tech
- [#11459](https://github.com/1024pix/pix/pull/11459) [TECH] Migrer la route de mise à jour du rôle d'un membre d'un centre de certification.
- [#11469](https://github.com/1024pix/pix/pull/11469) [TECH] Déplacer les assets du Didacticiel Modulix vers `assets.pix.org` (PIX-16677).
- [#11471](https://github.com/1024pix/pix/pull/11471) [TECH] : 🔧 Ajout de la config maintenance plannifiée pour pix-admin .
- [#11472](https://github.com/1024pix/pix/pull/11472) [TECH] Ajoute les infos de badges  imageUrl et altMessage dans le serializer de campagne (pix-16689).

### :bug: Correction
- [#11473](https://github.com/1024pix/pix/pull/11473) [BUGFIX] Correction du layout shift sur la bannière de nouvelle information du dashboard Pix App.

### :arrow_up: Montée de version
- [#11493](https://github.com/1024pix/pix/pull/11493) [BUMP] Update dependency @1024pix/pix-ui to ^54.9.0 (junior).

## v5.49.0 (21/02/2025)


### :rocket: Amélioration
- [#11441](https://github.com/1024pix/pix/pull/11441) [FEATURE] Créer un centre de certification en pilote V3 par défaut (PIX-16601).
- [#11437](https://github.com/1024pix/pix/pull/11437) [FEATURE] Ajouter PixTable dans les tableaux des sessions sur Pix Admin (PIX-16591).
- [#11456](https://github.com/1024pix/pix/pull/11456) [FEATURE] Utiliser les applications clientes en Bdd.

### :building_construction: Tech
- [#11457](https://github.com/1024pix/pix/pull/11457) [TECH] Utiliser la CLI de GitHub pour commenter les pull request de modulix.
- [#11454](https://github.com/1024pix/pix/pull/11454) [TECH] Créer nouvel usecase de duplication d'un CF (PIX-16643).
- [#11416](https://github.com/1024pix/pix/pull/11416) [TECH] Déplacer les services solution dans le scope evaluation (PIX-16574).

### :bug: Correction
- [#11466](https://github.com/1024pix/pix/pull/11466) [BUGFIX] Convertir la valeur de la variable de certificabilitée en booléen (PIX-16515).

### :arrow_up: Montée de version
- [#11463](https://github.com/1024pix/pix/pull/11463) [BUMP] Update dependency @1024pix/eslint-plugin to ^2.1.0 (junior).
- [#11462](https://github.com/1024pix/pix/pull/11462) [BUMP] Update nginx Docker tag to v1.27.4.
- [#11461](https://github.com/1024pix/pix/pull/11461) [BUMP] Update dependency browser-tools to v1.5.2 (.circleci).
- [#11445](https://github.com/1024pix/pix/pull/11445) [BUMP] Update dependency @1024pix/eslint-plugin to ^2.1.0 (api).

## v5.48.0 (20/02/2025)


### :rocket: Amélioration
- [#11417](https://github.com/1024pix/pix/pull/11417) [FEATURE] Affiche tous les badges du PC (Pix-16352).
- [#11448](https://github.com/1024pix/pix/pull/11448) [FEATURE] Ajout du score global dans les resultats Parcoursup (PIX-16548).

### :building_construction: Tech
- [#11301](https://github.com/1024pix/pix/pull/11301) [TECH] Passer à node 22.
- [#11415](https://github.com/1024pix/pix/pull/11415) [TECH] Suppression du FT_NEW_LEGAL_DOCUMENTS_VERSIONING (PIX-15591).

### :bug: Correction
- [#11440](https://github.com/1024pix/pix/pull/11440) [BUGFIX] Corriger une traduction anglaise sur le mail d'invitation à rejoindre un centre de certification (PIX-16587).

## v5.47.0 (19/02/2025)


### :rocket: Amélioration
- [#11449](https://github.com/1024pix/pix/pull/11449) [FEATURE] Forcer une longueur minimum sur la solution des QROCM (PIX-16609).

### :building_construction: Tech
- [#11407](https://github.com/1024pix/pix/pull/11407) [TECH] ajoute un param providedDate au job de calcul de certificabilité (Pix-16544).
- [#11451](https://github.com/1024pix/pix/pull/11451) [TECH] Suppression du message de dépréciation au lancement des tests.
- [#11391](https://github.com/1024pix/pix/pull/11391) [TECH] Script pour relier des réponses en doublon à un autre assessment (PIX-16235).

### :coffee: Autre
- [#11455](https://github.com/1024pix/pix/pull/11455) Revert "[FEATURE] Utiliser les applications clientes en BdD".

## v5.46.0 (19/02/2025)


### :rocket: Amélioration
- [#11434](https://github.com/1024pix/pix/pull/11434) [FEATURE] Migrer les applications en BDD (PIX-16590).

### :building_construction: Tech
- [#11285](https://github.com/1024pix/pix/pull/11285) [TECH] Déplacer la route des contenus formatifs vers le domaine Dev Comp (PIX-16249).
- [#11442](https://github.com/1024pix/pix/pull/11442) [TECH] Déplacer le domaine parcoursup dans certification/results (PIX-16604).
- [#11443](https://github.com/1024pix/pix/pull/11443) [TECH] Suppression du token d’accès aux résultats de campagne (PIX-16610).
- [#11439](https://github.com/1024pix/pix/pull/11439) [TECH] :construction_worker: Ne pas déployer d'addon REDIS ou PG pour les fronts.
- [#11444](https://github.com/1024pix/pix/pull/11444) [TECH] Contextualiser les loggers de Scripts par défaut.
- [#11435](https://github.com/1024pix/pix/pull/11435) [TECH] Eviter de créer des transactions nestées lorsqu'on utilise la fonction `batchInsert` de knex dans le cadre d'une DomainTransaction.
- [#11411](https://github.com/1024pix/pix/pull/11411) [TECH] Ajouter des logs spécifiques pour certains tokens problématiques (audience mismatch, revoked token) (PIX-16551).

### :bug: Correction
- [#11438](https://github.com/1024pix/pix/pull/11438) [BUGFIX] Les appels imbriqués aux méthodes d'exécution de code en transaction de la DomainTransaction n'utilisent pas la même transaction.

### :arrow_up: Montée de version
- [#11432](https://github.com/1024pix/pix/pull/11432) [BUMP] Update Node.js to v20.18.3.

### :coffee: Autre
- [#11436](https://github.com/1024pix/pix/pull/11436) Revert "[TECH] Retirer le script de suppression en masse d'organisations (PIX-16269)".

## v5.45.0 (18/02/2025)


### :rocket: Amélioration
- [#11433](https://github.com/1024pix/pix/pull/11433) [FEATURE] Déplacer get-answerable-elements hors de la liste des scripts extract CSV de Modulix (PIX-16025).
- [#10900](https://github.com/1024pix/pix/pull/10900) [FEATURE] Création du module comment-envoyer-un-mail.
- [#11429](https://github.com/1024pix/pix/pull/11429) [FEATURE] Ajouter PixTable dans les certifications complémentaires sur Pix Admin (PIX-16588).
- [#11101](https://github.com/1024pix/pix/pull/11101) [FEATURE] Create module PPN#3 Jeux vidéo.
- [#11392](https://github.com/1024pix/pix/pull/11392) [FEATURE] ajoute le fitre lacune dans la route `/assessment-results` (pix-16350).
- [#11425](https://github.com/1024pix/pix/pull/11425) [FEATURE] Ajouter l'expand dans le script get-elements.csv (PIX-16133).
- [#10748](https://github.com/1024pix/pix/pull/10748) [FEATURE] Création - Module tri multicritère avancé (MODC-174).
- [#11422](https://github.com/1024pix/pix/pull/11422) [FEATURE] Remise à jour du script `get-modules-csv` (PIX-16132).

### :building_construction: Tech
- [#11414](https://github.com/1024pix/pix/pull/11414) [TECH] Rattrapage des certifications annulées (PIX-16047).
- [#11428](https://github.com/1024pix/pix/pull/11428) [TECH] Réécriture du database builder pour accélérer les seeds.
- [#11427](https://github.com/1024pix/pix/pull/11427) [TECH] Simplifier l'usage de stratégie de connexions au sein de l'API (PIX-16585).
- [#11423](https://github.com/1024pix/pix/pull/11423) [TECH] Migrer la route POST api/admin/memberships/{id}/disable .
- [#11398](https://github.com/1024pix/pix/pull/11398) [TECH] Ajouter un sous-composant d'affichage des actions sur une certification (PIX-16542).

### :bug: Correction
- [#11430](https://github.com/1024pix/pix/pull/11430) [BUGFIX] Augmente la durée maximum du job de calcul de la certificabilité.

## v5.44.0 (17/02/2025)


### :rocket: Amélioration
- [#11354](https://github.com/1024pix/pix/pull/11354) [FEATURE] Création de l’API MADDO (PIX-16420).
- [#11404](https://github.com/1024pix/pix/pull/11404) [FEATURE] Ajouter la nouvelle barre de navigation dans Pix Admin (PIX-16550) .
- [#11408](https://github.com/1024pix/pix/pull/11408) [FEATURE] Ajouter un icône dans la liste des profils cible pour afficher le type d'accès au parcours (PIX-16384).
- [#11413](https://github.com/1024pix/pix/pull/11413) [FEATURE] Ajouter une action Détacher dans la liste des Contenus Formatifs (PIX-16511)(PIX-7393).

### :building_construction: Tech
- [#11424](https://github.com/1024pix/pix/pull/11424) [TECH] Simplifier la création des migrations.
- [#11410](https://github.com/1024pix/pix/pull/11410) [TECH] Ajouter le niveau global dans la documentation Parcoursup (PIX-16471).
- [#11386](https://github.com/1024pix/pix/pull/11386) [TECH] Migrer la route Admin qui liste les adhésions aux centres de certification d'un utilisateur (PIX-16452).

### :arrow_up: Montée de version
- [#11419](https://github.com/1024pix/pix/pull/11419) [BUMP] Update dependency @1024pix/pix-ui to ^54.9.0 (orga).

## v5.43.0 (14/02/2025)


### :rocket: Amélioration
- [#11396](https://github.com/1024pix/pix/pull/11396) [FEATURE] Liste blanche ouverture SCO via BDD (PIX-15544).
- [#11397](https://github.com/1024pix/pix/pull/11397) [FEATURE] Utiliser PixCode dans le code campagne sur PixApp (PIX-16449).
- [#11412](https://github.com/1024pix/pix/pull/11412) [FEATURE] Remplacer skills par competences dans le tableau de la page statistiques (PIX-16411).
- [#11393](https://github.com/1024pix/pix/pull/11393) [FEATURE] Autoriser la suppression de Quetes via PixAdmin (Pix-16533).
- [#11351](https://github.com/1024pix/pix/pull/11351) [FEATURE] Utiliser PixCode dans le code candidat pour l'entrée en certification sur Pix App (PIX-16448).
- [#11342](https://github.com/1024pix/pix/pull/11342) [FEATURE] Envoyer un email d'avertissement si l'utilisateur ne s'est pas connecté depuis 12 mois ou plus (PIX-16126).
- [#11317](https://github.com/1024pix/pix/pull/11317) [FEATURE] Suppression du scope pour les RT utilisateurs (PIX-15926).
- [#10724](https://github.com/1024pix/pix/pull/10724) [FEATURE] création module PPN#2 Controle parental.
- [#11409](https://github.com/1024pix/pix/pull/11409) [FEATURE] Ajouter la durée du code de validation du changement d'email sur Pix-app (PIX-14088).

### :building_construction: Tech
- [#11272](https://github.com/1024pix/pix/pull/11272) [TECH] Uniformise le code des fonctionnalités d'organisation sur PixAdmin (PIX-16319).

## v5.42.0 (13/02/2025)


### :rocket: Amélioration
- [#11405](https://github.com/1024pix/pix/pull/11405) [FEATURE] Ajouter une colone locale dans le tableau des invitations à rejoindre une orga en attente sur Pix admin (Pix-16380).
- [#11403](https://github.com/1024pix/pix/pull/11403) [FEATURE] Ajouter un endpoint pour supprimer la liaison entre un Profil Cible et un Contenu Formatif (PIX-16512).

### :building_construction: Tech
- [#11399](https://github.com/1024pix/pix/pull/11399) [TECH] Améliorer les seeds des SSO (OIDC Providers) (PIX-16538).
- [#11401](https://github.com/1024pix/pix/pull/11401) [TECH] Bump des dépendances Audit Logger mineures et patchs.
- [#11395](https://github.com/1024pix/pix/pull/11395) [TECH] Ajouter un sous-composant d'affichage de l'état d'une certification (PIX-16534).
- [#11400](https://github.com/1024pix/pix/pull/11400) [TECH] Utiliser partout la même logique explicite MissingOrInvalidCredentialsError qui ne fait pas fuiter les informations (PIX-16543).

### :bug: Correction
- [#11394](https://github.com/1024pix/pix/pull/11394) [BUGFIX] Réparer l'apparence de la liste déroulante de SSO pour qu'elle retrouve son style pyjama (PIX-16535).
- [#11385](https://github.com/1024pix/pix/pull/11385) [BUGFIX] Corriger le decalage entre capacities et certification-challenges (PIX-16457).

## v5.41.0 (12/02/2025)


### :rocket: Amélioration
- [#11312](https://github.com/1024pix/pix/pull/11312) [FEATURE] Ajout de metrics sur le filtre RT (PIX-16345).
- [#11231](https://github.com/1024pix/pix/pull/11231) [FEATURE] Créer un script pour supprimer des références dans "snapshot" de la table "knowledge-element-snapshots" (PIX-15756).
- [#11350](https://github.com/1024pix/pix/pull/11350) [FEATURE] Reprise mdl bien-ecrire-son-adresse-mail pour coval 16/10 (MODC-2) (closed PR#10189).

### :building_construction: Tech
- [#11388](https://github.com/1024pix/pix/pull/11388) [TECH] Déprécier l'utilisation du `isCancelled` au profit du statut de l'assessment-result (PIX-16046).
- [#11402](https://github.com/1024pix/pix/pull/11402) [TECH] corrige le test flaky sur admin.
- [#11389](https://github.com/1024pix/pix/pull/11389) [TECH] ♻️ migre le usecase et les repo associé aux badge acquisition (Pix-16518).

### :bug: Correction
- [#11384](https://github.com/1024pix/pix/pull/11384) [BUGFIX] Éviter les corruptions de cache du Learning Content (PIX-16501).
- [#11382](https://github.com/1024pix/pix/pull/11382) [BUGFIX] Ajouter automatiquement un 0 devant le département s'il ne contient que 2 chiffres (PIX-13151).

## v5.40.0 (11/02/2025)


### :rocket: Amélioration
- [#11235](https://github.com/1024pix/pix/pull/11235) [FEATURE] Create Module bases-clavier-ordinateur-2.json (MODC-606).
- [#11062](https://github.com/1024pix/pix/pull/11062) [FEATURE] Create Module bases-clavier-ordinateur-1.json (MODC-204).
- [#11380](https://github.com/1024pix/pix/pull/11380) [FEATURE] Ne pas faire fuiter l'information qu'un compte existe ou non dans la route /api/password-reset-demands  (PIX-16365).
- [#11375](https://github.com/1024pix/pix/pull/11375) [FEATURE]  Ajouter une route pour retourner les badges acquis lors des participations d'une campagne (PIX-16240).

### :building_construction: Tech
- [#11378](https://github.com/1024pix/pix/pull/11378) [TECH] :package: Déplace le repo `badgeForCalculation` vers `src/`.
- [#11339](https://github.com/1024pix/pix/pull/11339) [TECH] ne plus enregistrer les userId / assessmentId dans les snapshot (Pix-16285).
- [#11370](https://github.com/1024pix/pix/pull/11370) [TECH] Déprécier l'utilisation du isCancelled au profit du status du dernier AssessmentResult sur Pix Admin (PIX-16470).
- [#11371](https://github.com/1024pix/pix/pull/11371) [TECH] Afficher un statut annulée en cas de certification avec problème technique et - 20 questions (PIX-16476).

### :bug: Correction
- [#11379](https://github.com/1024pix/pix/pull/11379) [BUGFIX] Corriger le script d'envoi d'invitation à rejoindre une organisation en masse (PIX-16498).
- [#11373](https://github.com/1024pix/pix/pull/11373) [BUGFIX] Tolérance aux doublons dans les réponses sur Pix Junior.

### :coffee: Autre
- [#11163](https://github.com/1024pix/pix/pull/11163) [DOC] Ajout d'un document décrivant les pratiques à suivre concernant les erreurs pour les devs.

## v5.39.0 (10/02/2025)


### :rocket: Amélioration
- [#11383](https://github.com/1024pix/pix/pull/11383) [FEATURE] Rendre le champ titre interne obligatoire (PIX-16461) (PIX-16068).
- [#11363](https://github.com/1024pix/pix/pull/11363) [FEATURE] Filtrer les SSO sur la page de connexion de Pix app (PIX-16391).
- [#11376](https://github.com/1024pix/pix/pull/11376) [FEATURE] Afficher le titre interne comme titre dans la liste des contenus formatifs et la section côté Profil Cible (PIX-16462).
- [#11310](https://github.com/1024pix/pix/pull/11310) [FEATURE] Indiquer si l'utilisateur se connecte via SSO sur Pix admin (PIX-14788).
- [#11344](https://github.com/1024pix/pix/pull/11344) [FEATURE] Evolution de l'import des OIDC pour prendre en compte la variable isVisible (PIX-16390).
- [#11366](https://github.com/1024pix/pix/pull/11366) [FEATURE] Pouvoir créer et modifier des quêtes via PixAdmin (PIX-16388).
- [#11359](https://github.com/1024pix/pix/pull/11359) [FEATURE] Page de fin de module : changer le bouton "revenir aux détails du module"(PIX-16426).

### :building_construction: Tech
- [#11381](https://github.com/1024pix/pix/pull/11381) [TECH] Revert de la PR-11308 sur l'amélioration de PGBoss.
- [#11348](https://github.com/1024pix/pix/pull/11348) [TECH] Stocker la config des features toggles dans Redis.
- [#11374](https://github.com/1024pix/pix/pull/11374) [TECH] Bouger les derniers repositories Learning Content de lib à shared (PIX-16481).
- [#11337](https://github.com/1024pix/pix/pull/11337) [TECH] Récupère le snapshot avec l'id d'une participation à une campagne (pix-15758).
- [#11305](https://github.com/1024pix/pix/pull/11305) [TECH] Migrer la route POST /api/expired-password-updates (PIX-16367).
- [#11357](https://github.com/1024pix/pix/pull/11357) [TECH] Migration de la route POST /api/admin/certification-centers/{certificationCenterId}/certification-center-memberships (PIX-16451).
- [#11365](https://github.com/1024pix/pix/pull/11365) [TECH] Déprécie l'utilisation du `isCancelled` au profit du status du dernier `AssessmentResult`.
- [#11369](https://github.com/1024pix/pix/pull/11369) [TECH] Mettre à jour Pix-UI dans la dernière version sur Pix-Orga (PIX-16473).

### :coffee: Autre
- [#11372](https://github.com/1024pix/pix/pull/11372) [FIX] #16477 Update a nextcloud doc link.
- [#11107](https://github.com/1024pix/pix/pull/11107) [DOC] Ajout d'un document décrivant les pratiques à suivre concernant les traductions pour les devs.

## v5.38.0 (07/02/2025)


### :rocket: Amélioration
- [#11356](https://github.com/1024pix/pix/pull/11356) [FEATURE] Mesurer l'utilisation du bouton "Télécharger" des attestations (PIX-14954).
- [#11340](https://github.com/1024pix/pix/pull/11340) [FEATURE] Accéder à un board metabase sur les PC depuis PixAdmin (PIX-16427).
- [#11335](https://github.com/1024pix/pix/pull/11335) [FEATURE] Ajouter la colone isVisible dans la table oidc-providers (PIX-16077).
- [#11343](https://github.com/1024pix/pix/pull/11343) [FEATURE] Utiliser PixCode dans la vérification des certificats sur Pix App (PIX-16429).
- [#11294](https://github.com/1024pix/pix/pull/11294) [FEATURE] : Ajout videos module souris-2.
- [#11341](https://github.com/1024pix/pix/pull/11341) [FEATURE] Gestion des doublons d'INE dans Parcoursup (PIX-16361).

### :building_construction: Tech
- [#11360](https://github.com/1024pix/pix/pull/11360) [TECH] Utiliser l'`AssessmentResult.status` dans les manipulations de CSV de certification (PIX-16458).
- [#11362](https://github.com/1024pix/pix/pull/11362) [TECH] renome le filtre badge en acquiredThematicResults (Pix-16349).
- [#11358](https://github.com/1024pix/pix/pull/11358) [TECH] Utiliser le status annulée de l'assessment-result pour l'accès aux certifications (PIX-16459).
- [#11308](https://github.com/1024pix/pix/pull/11308) [TECH] Amélioration de l'utilisation de pgBoss.
- [#11355](https://github.com/1024pix/pix/pull/11355) [TECH] :recycle: Utilise le statut d'`assessmentResult` pour l'éligibilité dans le bandeau pixApp et la réconciliation (PIX-16455).
- [#11325](https://github.com/1024pix/pix/pull/11325) [TECH] :recycle: Utilise l'enum de `AssessmentResult.status` plutôt qu'une valeur en dur.

### :arrow_up: Montée de version
- [#11329](https://github.com/1024pix/pix/pull/11329) [BUMP] Update dependency @1024pix/pix-ui to ^54.6.0 (junior).
- [#11333](https://github.com/1024pix/pix/pull/11333) [BUMP] Update dependency @1024pix/pix-ui to ^54.6.0 (mon-pix).

### :coffee: Autre
- [#11367](https://github.com/1024pix/pix/pull/11367) Revert "[TECH] renome le filtre badge en acquiredThematicResults (Pix-16349)".

## v5.37.0 (06/02/2025)


### :rocket: Amélioration
- [#11345](https://github.com/1024pix/pix/pull/11345) [FEATURE] Avoir un champ "Titre interne" lors de l'édition et création d’un CF (PIX-16435).
- [#11328](https://github.com/1024pix/pix/pull/11328) [FEATURE] Passage module chatgpt-vraiment-neutre en tabletSupport=comfortable.
- [#11334](https://github.com/1024pix/pix/pull/11334) [FEATURE] Ajouter le champ titre interne dans la page de détails du CF (PIX-16068).
- [#11289](https://github.com/1024pix/pix/pull/11289) [FEATURE] Ajouter un script pour envoyer des invitations à rejoindre une organisation en masse (PIX-16265).

### :building_construction: Tech
- [#11314](https://github.com/1024pix/pix/pull/11314) [TECH] Migrer la route PATCH patch /api/certification-center-invitations/{certificationCenterInvitationId} (PIX-16392).
- [#11284](https://github.com/1024pix/pix/pull/11284) [TECH] ajoute la méthode findSnapshotByCampaignParticipationId (PIX-16339).

### :arrow_up: Montée de version
- [#11336](https://github.com/1024pix/pix/pull/11336) [BUMP] Update dependency @1024pix/pix-ui to ^54.6.0 (orga).

### :coffee: Autre
- [#11353](https://github.com/1024pix/pix/pull/11353) Revert "[BUMP] Update dependency redis to v7.2.7".

## v5.36.0 (05/02/2025)


### :rocket: Amélioration
- [#11296](https://github.com/1024pix/pix/pull/11296) [FEATURE] Pix Junior - Utiliser les options de validation de challenge provenant de Pix Editor.
- [#11323](https://github.com/1024pix/pix/pull/11323) [FEATURE] [API] Pouvoir enregistrer un titre interne d’un CF (PIX-16218).
- [#11300](https://github.com/1024pix/pix/pull/11300) [FEATURE] Ne pas afficher les boutons d'annulation si la session n'est pas finalisée (PIX-16141).
- [#11306](https://github.com/1024pix/pix/pull/11306) [FEATURE] API-Pouvoir retourner le titre interne d’un CF depuis l’API (PIX-16219).

### :building_construction: Tech
- [#11315](https://github.com/1024pix/pix/pull/11315) [TECH] Migrer la route DELETE /api/admin/certification-center-memberships/{id} (PIX-16387).
- [#11321](https://github.com/1024pix/pix/pull/11321) [TECH] Ajouter une route /api/healthcheck/forwarded-origin (PIX-16368).
- [#11318](https://github.com/1024pix/pix/pull/11318) [TECH] Utilise l'`AssessmentResult` qui a été annulé en plus du statut `isCancelled` pour le repo du LSU/LSL (PIX-16394).
- [#11279](https://github.com/1024pix/pix/pull/11279) [TECH] findSnapshotForUsers appelé directement dans les autres repos (Pix-16338).

### :bug: Correction
- [#11322](https://github.com/1024pix/pix/pull/11322) [BUGFIX] Fix regression de css sur l'introduction (PIX-16413).
- [#11302](https://github.com/1024pix/pix/pull/11302) [BUGFIX] Corriger les informations dans le toaster de désactivation des utilisateurs de Pix admin (PIX-13604).
- [#11307](https://github.com/1024pix/pix/pull/11307) [BUGFIX] Gérer les pages hors connexion dans le nouveau gabarit (PIX-16378).
- [#11290](https://github.com/1024pix/pix/pull/11290) [BUGFIX] Raccrocher les collecte de profile anonymisé avec leur Knowledge-element-snapshots (PIX-16326).

### :arrow_up: Montée de version
- [#11320](https://github.com/1024pix/pix/pull/11320) [BUMP] Update dependency @1024pix/pix-ui to ^54.5.0 (mon-pix) (PIX-16401) (PIX-16284).
- [#11327](https://github.com/1024pix/pix/pull/11327) [BUMP] Update dependency @1024pix/pix-ui to ^54.6.0 (certif).
- [#11326](https://github.com/1024pix/pix/pull/11326) [BUMP] Update dependency @1024pix/pix-ui to ^54.6.0 (admin).
- [#11324](https://github.com/1024pix/pix/pull/11324) [BUMP] Update dependency @1024pix/pix-ui to ^54.5.0 (admin).
- [#11316](https://github.com/1024pix/pix/pull/11316) [BUMP] Update dependency @1024pix/pix-ui to ^54.3.0 (certif).
- [#11309](https://github.com/1024pix/pix/pull/11309) [BUMP] Update dependency @1024pix/pix-ui to ^54.3.0 (admin).

## v5.35.0 (04/02/2025)


### :rocket: Amélioration
- [#11250](https://github.com/1024pix/pix/pull/11250) [FEATURE] Ajout d'un lien vers les explications de résultats sur le Certificat Pix (PIX-16247).
- [#11262](https://github.com/1024pix/pix/pull/11262) [FEATURE] Vérifier l'audience à l'utilisation du Refresh Token (PIX-15949).
- [#11269](https://github.com/1024pix/pix/pull/11269) [FEATURE] Script pour révoquer les accès d'utilisateurs (PIX-15950).

### :building_construction: Tech
- [#11286](https://github.com/1024pix/pix/pull/11286) [TECH] Migration de la route /api/admin/users/{id}/organizations (PIX-16360).
- [#11131](https://github.com/1024pix/pix/pull/11131) [TECH] Créer un nouvel assessment result lorsqu'on annule et désannule une certification sur Pix Admin (PIX-16045).
- [#11303](https://github.com/1024pix/pix/pull/11303) [TECH] Ajouts de logs d’erreurs de lecture du Learning Content (PIX-16374).

### :bug: Correction
- [#11304](https://github.com/1024pix/pix/pull/11304) [BUGFIX] Vérification des CGUs acceptées avant acceptation (PIX-16377).

### :arrow_up: Montée de version
- [#11239](https://github.com/1024pix/pix/pull/11239) [BUMP] Update node.

## v5.34.0 (03/02/2025)


### :rocket: Amélioration
- [#11240](https://github.com/1024pix/pix/pull/11240) [FEATURE]  Ajout d'un écran de feedback intermédiaire à la fin de la mission  (PIX-16279).
- [#11280](https://github.com/1024pix/pix/pull/11280) [FEATURE] Pouvoir ajouter plusieurs orgas enfants en une seule saisie dans Pix-Admin (PIX-10865).
- [#11283](https://github.com/1024pix/pix/pull/11283) [FEATURE] Ajout videos module souris-1.
- [#11270](https://github.com/1024pix/pix/pull/11270) [FEATURE] Créer une fonction de révocation des accès utilisateurs (PIX-15947).
- [#11281](https://github.com/1024pix/pix/pull/11281) [FEATURE] Utiliser le nouveau layout dans PixApp (PIX-16302).
- [#11222](https://github.com/1024pix/pix/pull/11222) [FEATURE] Indiquer si la campagne est compatible mobile et/ou tablette (PIX-16089).
- [#11148](https://github.com/1024pix/pix/pull/11148) [FEATURE] Ports-connexions-essentiels - V2 - dette MVP (MODC-5).
- [#11203](https://github.com/1024pix/pix/pull/11203) [FEATURE] Ajouter un bouton pour renvoyer l'invitation à un centre de certification dans pix admin (PIX-10018).

### :building_construction: Tech
- [#11287](https://github.com/1024pix/pix/pull/11287) [TECH] Ne plus planifier de job unitaire pour chaque calcul de certificabilité.
- [#11259](https://github.com/1024pix/pix/pull/11259) [TECH] Ajout de nouvelles colonnes pour les challenges pix-junior.
- [#11282](https://github.com/1024pix/pix/pull/11282) [TECH] Mauvais competenceId sur certaines competence-marks V3 (PIX-16328).

### :bug: Correction
- [#11297](https://github.com/1024pix/pix/pull/11297) [BUGFIX] Corriger le bug d'affichage de la page de résultat (PIX-16318).
- [#11295](https://github.com/1024pix/pix/pull/11295) [BUGFIX] Fix sur les réponses envoyées en double sur les embeds auto-validés (PIX-16363).
- [#11238](https://github.com/1024pix/pix/pull/11238) [BUGFIX] Problème de retour à la ligne sur les navigateur safari (PIX-16293).
- [#11244](https://github.com/1024pix/pix/pull/11244) [BUGFIX] Fix sur le dépassement d'image/texte dans les cadres Pix Junior (PIX-16296).

### :arrow_up: Montée de version
- [#11291](https://github.com/1024pix/pix/pull/11291) [BUMP] Update dependency @1024pix/pix-ui to ^54.3.0 (junior).
- [#11293](https://github.com/1024pix/pix/pull/11293) [BUMP] Update dependency @1024pix/pix-ui to ^54.3.0 (orga).
- [#11292](https://github.com/1024pix/pix/pull/11292) [BUMP] Update dependency @1024pix/pix-ui to ^54.3.0 (mon-pix).

## v5.33.0 (31/01/2025)


### :rocket: Amélioration
- [#11278](https://github.com/1024pix/pix/pull/11278) [FEATURE] Appliquer un ratio aux embeds GDevelop (PIX-16168).
- [#11258](https://github.com/1024pix/pix/pull/11258) [FEATURE] Create module decouverte-de-l-ent.json.
- [#11271](https://github.com/1024pix/pix/pull/11271) [FEATURE] Ne plus afficher la colonne "memberships.updatedat" dans Pix Admin (PIX-15618).

## v5.32.0 (30/01/2025)


### :building_construction: Tech
- [#11275](https://github.com/1024pix/pix/pull/11275) [TECH] Corriger le test flaky d'une méthode dans le repository target-profiles.
- [#11253](https://github.com/1024pix/pix/pull/11253) [TECH] Migre des composants de PixOrga au format GJS (PIX-16308).

### :bug: Correction
- [#11268](https://github.com/1024pix/pix/pull/11268) [BUGFIX] Récupérer uniquement les compétences sur le référentiel Pix Coeur pour le scoring V3 (PIX-16272).

## v5.31.0 (30/01/2025)


### :rocket: Amélioration
- [#11246](https://github.com/1024pix/pix/pull/11246) [FEATURE] Ajouter un bouton pour renvoyer une invitation à rejoindre une orga sur Pix Admin (PIX-10014).

### :building_construction: Tech
- [#11277](https://github.com/1024pix/pix/pull/11277) [TECH] Ajouter "ORDER BY id" sur une requête dans le script de partage de profil  (PIX-16342).
- [#11273](https://github.com/1024pix/pix/pull/11273) [TECH] Mise à jour de la version des web-components.

## v5.30.0 (30/01/2025)


### :rocket: Amélioration
- [#11184](https://github.com/1024pix/pix/pull/11184) [FEATURE] Permettre la navigation au clavier dans le menu Modulix (PIX-16031).
- [#11266](https://github.com/1024pix/pix/pull/11266) [FEATURE] Afficher dans les détails d'une organisation si la fonctionnalitée Attestations est activée (PIX-15550).
- [#11267](https://github.com/1024pix/pix/pull/11267) [FEATURE] RBE maj du didacticiel Modulix.
- [#11208](https://github.com/1024pix/pix/pull/11208) [FEATURE] Conditionner la validation des AT utilisateurs en comparant l’aud des AT utilisateurs à la forwardedOrigin (PIX-15944).
- [#11256](https://github.com/1024pix/pix/pull/11256) [FEATURE] Changer la valeur par défaut de la limite du blocage définitif d’un compte utilisateur à 30 (PIX-16309).
- [#11229](https://github.com/1024pix/pix/pull/11229) [FEATURE] Ajout d'une contrainte d'unicité sur campaignParticipationId dans les Ke Snapshots (PIX-16258).
- [#10934](https://github.com/1024pix/pix/pull/10934) [FEATURE] Module IA générative intermédiaire MODC-441 .

### :building_construction: Tech
- [#11230](https://github.com/1024pix/pix/pull/11230) [TECH] Changer les headers X-Forwarded-xxx utilisés pour la fonction getForwardedOrigin (PIX-16282).
- [#11206](https://github.com/1024pix/pix/pull/11206) [TECH] CampaignLearningContent hérite de LearningContent (PIX-16195).

### :bug: Correction
- [#11276](https://github.com/1024pix/pix/pull/11276) [BUGFIX] Autoriser les IDs de réponse supérieurs à 2**31-1 (PIX-16337).
- [#11220](https://github.com/1024pix/pix/pull/11220) [BUGFIX] Ordonner les skillName afin de garantir l'ordre des colonnes lors de l'export de résultat (Pix-16196).

## v5.29.0 (29/01/2025)


### :rocket: Amélioration
- [#11245](https://github.com/1024pix/pix/pull/11245) [FEATURE] Supprimer le lien "Qu'est-ce qu'un code parcours et comment l'utiliser ?" (PIX-16248).
- [#11228](https://github.com/1024pix/pix/pull/11228) [FEATURE] Permettre de télécharger le kit dans l'espace surveillant sur Pix Certif (PIX-16250).
- [#11227](https://github.com/1024pix/pix/pull/11227) [FEATURE] Ajouter un affichage dans le cas ou il n'y a pas de données de statistiques Pix Orga (PIX-16229).
- [#11205](https://github.com/1024pix/pix/pull/11205) [FEATURE] Traduction en NL des CGU (PIX-16183).

### :building_construction: Tech
- [#11243](https://github.com/1024pix/pix/pull/11243) [TECH] Met à jour les dépendances sur PixOrga (PIX-16297).
- [#11257](https://github.com/1024pix/pix/pull/11257) [TECH] Suppression endpoint deprecated Parcoursup (PIX-16109).
- [#11248](https://github.com/1024pix/pix/pull/11248) [TECH]  Parcoursup : configuration compatible API manager pour exposer la documentation (PIX-16304).
- [#11249](https://github.com/1024pix/pix/pull/11249) [TECH] Ne plus lancer la CI des PRs au statut draft.

### :arrow_up: Montée de version
- [#11260](https://github.com/1024pix/pix/pull/11260) [BUMP] Update dependency globals to v15.14.0 (admin).
- [#11251](https://github.com/1024pix/pix/pull/11251) [BUMP] Update dependency @1024pix/eslint-plugin to ^2.0.5 (junior).
- [#11254](https://github.com/1024pix/pix/pull/11254) [BUMP] Update dependency @1024pix/eslint-plugin to ^2.0.5 (orga).
- [#11242](https://github.com/1024pix/pix/pull/11242) [BUMP] Update dependency @1024pix/eslint-plugin to ^2.0.5 (api).
- [#11252](https://github.com/1024pix/pix/pull/11252) [BUMP] Update dependency @1024pix/eslint-plugin to ^2.0.5 (mon-pix).
- [#11185](https://github.com/1024pix/pix/pull/11185) [BUMP] Update dependency eslint to v9 (admin).
- [#11174](https://github.com/1024pix/pix/pull/11174) [BUMP] Update dependency @1024pix/pix-ui to v54 (mon-pix).

## v5.28.0 (28/01/2025)


### :rocket: Amélioration
- [#11233](https://github.com/1024pix/pix/pull/11233) [FEATURE] Ajout de puces dynamiques à la page de résultat d'une mission (PIX-16278).
- [#11207](https://github.com/1024pix/pix/pull/11207) [FEATURE] Ajouter la forwarded origin HTTP pour les parcours autonomes anonymes (PIX-16244).
- [#11145](https://github.com/1024pix/pix/pull/11145) [FEATURE] Améliorer la page de détails de résultats thématique (PIX-16154).

### :building_construction: Tech
- [#11189](https://github.com/1024pix/pix/pull/11189) [TECH] Suppression de la mise en cache sur certaines routes pour gérer le cache par Baleen.

### :arrow_up: Montée de version
- [#11216](https://github.com/1024pix/pix/pull/11216) [BUMP] Update dependency eslint to v9 (audit-logger).
- [#11236](https://github.com/1024pix/pix/pull/11236) [BUMP] Update dependency @badeball/cypress-cucumber-preprocessor to v22 (e2e).
- [#11234](https://github.com/1024pix/pix/pull/11234) [BUMP] Update actions/github-script action to v7 (workflows).
- [#11127](https://github.com/1024pix/pix/pull/11127) [BUMP] Update dependency @1024pix/pix-ui to v53 (mon-pix).

## v5.27.0 (27/01/2025)


### :rocket: Amélioration
- [#11201](https://github.com/1024pix/pix/pull/11201) [FEATURE] Ajouter une modale de confirmation des invitations sur Pix Orga (pix-14535).

### :building_construction: Tech
- [#11226](https://github.com/1024pix/pix/pull/11226) [TECH] Retirer le script de suppression en masse d'organisations (PIX-16269).

### :bug: Correction
- [#11232](https://github.com/1024pix/pix/pull/11232) [BUGFIX] Autoriser un temps de réponse plus long pour le ping Companion (PIX-16287).
- [#11225](https://github.com/1024pix/pix/pull/11225) [BUGFIX] Afficher les webcomponent sur 60% de la largeur quand ils sont en colonne.

## v5.26.0 (27/01/2025)


### :rocket: Amélioration
- [#10891](https://github.com/1024pix/pix/pull/10891) [FEATURE] Màj feedback module adresse-ip-publique-et-vous.
- [#11221](https://github.com/1024pix/pix/pull/11221) [FEATURE] Monté de version webPack  (PIX-16263).
- [#10893](https://github.com/1024pix/pix/pull/10893) [FEATURE] Create Module utiliser-souris-ordinateur-2.json (MODC-194).
- [#11223](https://github.com/1024pix/pix/pull/11223) [FEATURE] Montée de version qunit (PIX-16624).
- [#11224](https://github.com/1024pix/pix/pull/11224) [FEATURE] mise à jour tracked-built-ins (PIX-16267).

### :building_construction: Tech
- [#11219](https://github.com/1024pix/pix/pull/11219) [TECH] Mise à jour des dépendances ember optional-features et embroider (PIX-16262).
- [#11217](https://github.com/1024pix/pix/pull/11217) [TECH] Mise à jour des dépendances de lint, prettier et sass (PIX-16261).
- [#11167](https://github.com/1024pix/pix/pull/11167) [TECH] :truck: :broom: Déplacement et nettoyage du contenu du répertoire `lib/domain/events` .

### :bug: Correction
- [#11193](https://github.com/1024pix/pix/pull/11193) [BUGFIX] Pose d'un verrou pour limiter la création de challenge en certification (PIX-16165).

## v5.25.0 (24/01/2025)


### :rocket: Amélioration
- [#11204](https://github.com/1024pix/pix/pull/11204) [FEATURE] Envoi automatique de la réponse pour les embed avec auto-validation (PIX-16156).
- [#11199](https://github.com/1024pix/pix/pull/11199) [FEATURE] Lancer les tests Modulix dans une github action (PIX-16245).
- [#11183](https://github.com/1024pix/pix/pull/11183) [FEATURE] Supprimer les liens d'évitements inutiles dans Modulix (PIX-16030).
- [#11209](https://github.com/1024pix/pix/pull/11209) [FEATURE] Amélioration du feedback  (PIX-16096).
- [#11151](https://github.com/1024pix/pix/pull/11151) [FEATURE] Filtrer les organisations en sélectionnant le type (PIX-16125).

### :building_construction: Tech
- [#11115](https://github.com/1024pix/pix/pull/11115) [TECH] Nouveau système de feature toggles.
- [#11198](https://github.com/1024pix/pix/pull/11198) [TECH] Rendre swagger.json disponible via reverse proxy (PIX-16228).
- [#11215](https://github.com/1024pix/pix/pull/11215) [TECH] Ne pas mettre de valeur par défaut dans les builders du learning content lors de la création de seeds.
- [#11162](https://github.com/1024pix/pix/pull/11162) [TECH] Migrer le usecase de l'envoi de participation completed dans le BC Prescription (Pix-16197).
- [#11146](https://github.com/1024pix/pix/pull/11146) [TECH] Migrer l'email de reset de mot de passe (PIX-16161).
- [#11190](https://github.com/1024pix/pix/pull/11190) [TECH] Renommer le model "OrganizationImport" en "OrganizationImportStatus" (PIX-15824).

### :arrow_up: Montée de version
- [#11213](https://github.com/1024pix/pix/pull/11213) [BUMP] Update dependency @1024pix/pix-ui to ^54.2.0 (orga).
- [#11212](https://github.com/1024pix/pix/pull/11212) [BUMP] Update dependency @1024pix/pix-ui to ^54.2.0 (junior).
- [#11211](https://github.com/1024pix/pix/pull/11211) [BUMP] Update dependency @1024pix/pix-ui to ^54.2.0 (certif).
- [#11210](https://github.com/1024pix/pix/pull/11210) [BUMP] Update dependency @1024pix/pix-ui to ^54.2.0 (admin).
- [#11066](https://github.com/1024pix/pix/pull/11066) [BUMP] Update dependency ember-source to v6 (mon-pix).
- [#11195](https://github.com/1024pix/pix/pull/11195) [BUMP] Update dependency redis to v7.2.7.

## v5.24.0 (23/01/2025)


### :rocket: Amélioration
- [#11191](https://github.com/1024pix/pix/pull/11191) [FEATURE] Ajouter la colonne "internalTitle" dans la table "trainings" (PIX-16222).
- [#11177](https://github.com/1024pix/pix/pull/11177) [FEATURE] Ajouter la forwarded origin HTTP dans les tokens utilisateurs lors du login par SSO GAR (PIX-16204).
- [#10540](https://github.com/1024pix/pix/pull/10540) [FEATURE] Création d'un module Premiere Marche : utiliser-souris-ordinateur (MODC-350).

### :building_construction: Tech
- [#11196](https://github.com/1024pix/pix/pull/11196) [TECH] Corriger la couleurs des bannières sur la page de finalisation sur Pix Certif (PIX-16236).

### :bug: Correction
- [#11200](https://github.com/1024pix/pix/pull/11200) [BUGFIX] Safari ne comprend pas les width:auto  (PIX-16206).
- [#11088](https://github.com/1024pix/pix/pull/11088) [BUGFIX] Changer des messages sur les pages de connexion et réinitialisation (PIX-15996).

### :arrow_up: Montée de version
- [#11182](https://github.com/1024pix/pix/pull/11182) [BUMP] Update dependency ember-test-selectors to v7 (mon-pix).

## v5.23.0 (23/01/2025)


### :rocket: Amélioration
- [#10070](https://github.com/1024pix/pix/pull/10070) [FEATURE] Amélioration continue mdl distinguer-vrai-faux-sur-internet - coval 14/10 (MODC-5).

### :bug: Correction
- [#11187](https://github.com/1024pix/pix/pull/11187) [BUGFIX] Corriger le script de suppression en masse des orgas (PIX-16224).

## v5.22.0 (22/01/2025)


### :rocket: Amélioration
- [#11137](https://github.com/1024pix/pix/pull/11137) [FEATURE] Ajouter la forwarded origin HTTP dans un nouvel attribut aud des AC utilisateurs lors du login (par mot de passe et SSO OIDC) (PIX-15928).
- [#11161](https://github.com/1024pix/pix/pull/11161) [FEATURE] Remplir le mail automatiquement sur la page de réinitialisation du mot de passe si celui-ci a déjà été remplis sur la page de connexion (PIX13572).
- [#11020](https://github.com/1024pix/pix/pull/11020) [FEATURE] Creer un script pour partager les attestations précédemment obtenues (PIX-15888) .
- [#11178](https://github.com/1024pix/pix/pull/11178) [FEATURE] Ajouter la colonne "internalTitle" dans la table "trainings" (PIX-16211).

### :building_construction: Tech
- [#11170](https://github.com/1024pix/pix/pull/11170) [TECH] :truck: Utilise le `DomainTransation` de `src`.

### :bug: Correction
- [#11181](https://github.com/1024pix/pix/pull/11181) [BUGFIX] Pix Junior indisponible sur d'anciennes version de Safari (PIX-16209).
- [#11158](https://github.com/1024pix/pix/pull/11158) [BUGFIX] Permettre de finaliser/publier une session dont une certif ne contient pas de challenge (PIX-16128).
- [#11164](https://github.com/1024pix/pix/pull/11164) [BUGFIX] utiliser le PixSearchInput (Pix-16187).

### :arrow_up: Montée de version
- [#11173](https://github.com/1024pix/pix/pull/11173) [BUMP] Update dependency @1024pix/stylelint-config to ^5.1.27 (orga).

### :coffee: Autre
- [#11192](https://github.com/1024pix/pix/pull/11192) Revert [FEATURE] Prévenir l'utilisateur prescrit sur mobile que son expérience risque d'être dégradée (PIX-16078).
- [#11186](https://github.com/1024pix/pix/pull/11186) Revert "[FEATURE] Ajouter la colonne "internalTitle" dans la table "trainings" (PIX-16211)".

## v5.21.0 (22/01/2025)


### :rocket: Amélioration
- [#11117](https://github.com/1024pix/pix/pull/11117) [FEATURE] Nouvelle disposition des challenges (PIX-15935).
- [#11124](https://github.com/1024pix/pix/pull/11124) [FEATURE] Ajout d'un script pour supprimer des orga, dpo et tags associés (PIX-16091).
- [#11071](https://github.com/1024pix/pix/pull/11071) [FEATURE] Afficher les bannières dynamiquement.

### :building_construction: Tech
- [#11153](https://github.com/1024pix/pix/pull/11153) [TECH] Renommer idPix-Label|Type par externalId-Label|Type (Px-14685).
- [#11143](https://github.com/1024pix/pix/pull/11143) [TECH] Rendre disponible la documentation Open Api via la gateway (PIX-16111).
- [#11157](https://github.com/1024pix/pix/pull/11157) [TECH] Corriger la mention fr d'activation d'espace pix-orga (PIX-16179).

### :bug: Correction
- [#11169](https://github.com/1024pix/pix/pull/11169) [BUGFIX] Corriger l'url des liens vers la prévisualisation d'images (PIX-16100).
- [#11159](https://github.com/1024pix/pix/pull/11159) [BUGFIX] Rendre optionnel l'url d'une image dans une Flashcards (PIX-16150).

### :arrow_up: Montée de version
- [#11067](https://github.com/1024pix/pix/pull/11067) [BUMP] Update dependency ember-template-lint to v6 (mon-pix).
- [#11165](https://github.com/1024pix/pix/pull/11165) [BUMP] Update dependency @1024pix/stylelint-config to ^5.1.27 (admin).
- [#11172](https://github.com/1024pix/pix/pull/11172) [BUMP] Update dependency @1024pix/stylelint-config to ^5.1.27 (mon-pix).
- [#11171](https://github.com/1024pix/pix/pull/11171) [BUMP] Update dependency @1024pix/stylelint-config to ^5.1.27 (junior).
- [#11168](https://github.com/1024pix/pix/pull/11168) [BUMP] Update dependency @1024pix/stylelint-config to ^5.1.27 (certif).
- [#11166](https://github.com/1024pix/pix/pull/11166) [BUMP] Update dependency @1024pix/pix-ui to ^54.1.1 (certif).
- [#11150](https://github.com/1024pix/pix/pull/11150) [BUMP] Update dependency @1024pix/pix-ui to v54 (certif).
- [#11156](https://github.com/1024pix/pix/pull/11156) [BUMP] Update dependency @1024pix/pix-ui to ^54.1.1 (junior).

### :coffee: Autre
- [#10929](https://github.com/1024pix/pix/pull/10929) [DOC] ADR sur les migrations de données    .

## v5.20.0 (20/01/2025)


### :rocket: Amélioration
- [#11139](https://github.com/1024pix/pix/pull/11139) [FEATURE] Prévenir l'utilisateur prescrit sur mobile que son expérience risque d'être dégradée (PIX-16078).
- [#10490](https://github.com/1024pix/pix/pull/10490) [FEATURE] Pouvoir choisir les fronts à déployer en RA.

### :building_construction: Tech
- [#11134](https://github.com/1024pix/pix/pull/11134) [TECH] :wrench: Ajoute une tache `npm` pour executer uniquement les fichiers de test en cours de modification.
- [#11103](https://github.com/1024pix/pix/pull/11103) [TECH] ajoute le campaignParticipationId dans la table knowledge-element-snapshots (PIX-15755).
- [#11142](https://github.com/1024pix/pix/pull/11142) [TECH] Ajout des headers x-forwarded-host et x-forwarded-proto pour getForwardedOrigin de l'API en integration, recette et production.

### :bug: Correction
- [#11140](https://github.com/1024pix/pix/pull/11140) [BUGFIX] Gerer les erreurs en cas de conflit avec la contrainte d'unicité de profile rewards (PIX-16129).
- [#11147](https://github.com/1024pix/pix/pull/11147) [BUGFIX] Le champ `solution` des embeds auto-validés n'apparait pas dans l'interface de Modulix Editor (PIX-16101).
- [#11152](https://github.com/1024pix/pix/pull/11152) [BUGFIX] Corrige le model CampaignManagement (pix-16167).
- [#11138](https://github.com/1024pix/pix/pull/11138) [BUGFIX] Garder toujours le même ordre de colonnes dans le fichier d'export des résultats (PIX-16099).

### :arrow_up: Montée de version
- [#11154](https://github.com/1024pix/pix/pull/11154) [BUMP] Update dependency @1024pix/pix-ui to ^54.1.1 (admin).
- [#11155](https://github.com/1024pix/pix/pull/11155) [BUMP] Update dependency @1024pix/pix-ui to v54 (orga).
- [#11149](https://github.com/1024pix/pix/pull/11149) [BUMP] Update dependency @1024pix/pix-ui to v54 (admin).
- [#11144](https://github.com/1024pix/pix/pull/11144) [BUMP] Update dependency scalingo to ^0.11.0 (api).
- [#11094](https://github.com/1024pix/pix/pull/11094) [BUMP] Update dependency @1024pix/pix-ui to v53 (junior).
- [#11141](https://github.com/1024pix/pix/pull/11141) [BUMP] Update dependency @1024pix/pix-ui to ^53.1.6 (admin).
- [#11090](https://github.com/1024pix/pix/pull/11090) [BUMP] Update dependency @1024pix/pix-ui to v53 (admin).

## v5.19.0 (17/01/2025)


### :rocket: Amélioration
- [#11136](https://github.com/1024pix/pix/pull/11136) [FEATURE] Affichage de l'utilisateur identifié sur toutes les pages pertinentes (PIX-16095).
- [#11129](https://github.com/1024pix/pix/pull/11129) [FEATURE] Prendre en compte la valeur par défaut des proposals "input" dans les QROCm Modulix (PIX-16034).
- [#11132](https://github.com/1024pix/pix/pull/11132) [FEATURE] Ne pas générer les attestations des learners désactivés dans le zip pour les prescripteurs (PIX-16098).
- [#11135](https://github.com/1024pix/pix/pull/11135) [FEATURE] Mise à jour du nom du fichier du module `chatgpt-vraiment-neutre`.
- [#11075](https://github.com/1024pix/pix/pull/11075) [FEATURE] Ajouter des filtres dans la liste des parcours autonomes (PIX-16065).

### :building_construction: Tech
- [#11128](https://github.com/1024pix/pix/pull/11128) [TECH] Utiliser une constante partagée au lieu de recréer TWENTY_MEGABYTES à chaque fois (PIX-15819).
- [#11085](https://github.com/1024pix/pix/pull/11085) [TECH] ♻️  migre le repository target-profile-repository dans le contexte prescription (pix-16073).
- [#11081](https://github.com/1024pix/pix/pull/11081) [TECH] Regrouper les différents model de campagne dans l'API (PIX-15820).
- [#11111](https://github.com/1024pix/pix/pull/11111) [TECH] :truck: Déplace `certifiable-profile-for-learning-content-repository.js` vers `src/`.

### :bug: Correction
- [#11130](https://github.com/1024pix/pix/pull/11130) [BUGFIX] Orga - avoir une option par défaut pour l'external Id dans la création de campagne (PIX-16081).

### :coffee: Autre
- [#11041](https://github.com/1024pix/pix/pull/11041) Pix 15834 display popup for smarphones and vertical tablets.

## v5.18.0 (16/01/2025)


### :rocket: Amélioration
- [#11087](https://github.com/1024pix/pix/pull/11087) [FEATURE] Ajuster la mention "Activez ou récupérer votre espace Pix Orga" car elle crée de la confusion pour nos utilisateurs (PIX-16035).
- [#11125](https://github.com/1024pix/pix/pull/11125) [FEATURE] Ajouter plusieurs paliers d'un seul coup (PIX-15833).
- [#11059](https://github.com/1024pix/pix/pull/11059) [FEATURE] Afficher la légende et la licence d'une image dans un module (PIX-15991).

### :building_construction: Tech
- [#11120](https://github.com/1024pix/pix/pull/11120) [TECH] :broom: Supprime des simulateurs de scoring qui ne sont plus utilisés.
- [#11116](https://github.com/1024pix/pix/pull/11116) [TECH] :truck: Déplace le repository `audit logger` vers `src/`.
- [#11119](https://github.com/1024pix/pix/pull/11119) [TECH] :truck: Déplace l'événement `CertificationScoringCompleted` dans `src/`.
- [#11106](https://github.com/1024pix/pix/pull/11106) [TECH] Migration de la route /api/admin/tags/{id}/recently-used (PIX-16086).
- [#11100](https://github.com/1024pix/pix/pull/11100) [TECH] Migration de la route GET /api/admin/tags (PIX-16084).
- [#11112](https://github.com/1024pix/pix/pull/11112) [TECH] Ajout du prefixe application a Parcoursup (PIX-16090).
- [#11098](https://github.com/1024pix/pix/pull/11098) [TECH] Migration de la route /api/admin/users/{userId}/authentication-methods/{methodId} (PIX-16083).
- [#11110](https://github.com/1024pix/pix/pull/11110) [TECH] :truck: Déplace l'événement `certification jury done` vers `src/`.
- [#11113](https://github.com/1024pix/pix/pull/11113) [TECH] :truck: Déplace `Certification rescored by script event` vers `src/`.

### :bug: Correction
- [#11102](https://github.com/1024pix/pix/pull/11102) [BUGFIX] Corriger les phrases d'acceptation des CGUs partie 2 (PIX-16000).
- [#11121](https://github.com/1024pix/pix/pull/11121) [BUGFIX] Autoriser les certifs terminées par finalisation à être rescorées (PIX-16107).
- [#11099](https://github.com/1024pix/pix/pull/11099) [BUGFIX] Si l'utilisateur a un identifiant renseigné alors le champ "e-mail" ne doit pas être obligatoire dans Pix Admin (PIX-15540).

### :arrow_up: Montée de version
- [#11126](https://github.com/1024pix/pix/pull/11126) [BUMP] Update dependency @1024pix/pix-ui to ^53.1.6 (orga).
- [#11122](https://github.com/1024pix/pix/pull/11122) [BUMP] Update dependency @1024pix/pix-ui to ^53.1.6 (certif).
- [#11091](https://github.com/1024pix/pix/pull/11091) [BUMP] Update dependency @1024pix/pix-ui to v53 (certif).

## v5.17.0 (15/01/2025)


### :rocket: Amélioration
- [#10837](https://github.com/1024pix/pix/pull/10837) [FEATURE] Changement du titre du module IA avancé LLM ChatGPT MODC-176.
- [#11105](https://github.com/1024pix/pix/pull/11105) [FEATURE] Modifier l'appel Pix Admin qui récupère le statut des CGU.
- [#11055](https://github.com/1024pix/pix/pull/11055) [FEATURE] Utiliser PixIcon dans Pix App - Partie 2 (PIX-15468).
- [#11104](https://github.com/1024pix/pix/pull/11104) [FEATURE] Mise en place d’une nouvelle fonction getForwardedOrigin qui récupére l’origin HTTP de l’application (PIX-15925).

### :building_construction: Tech
- [#11095](https://github.com/1024pix/pix/pull/11095) [TECH] Migration de la route /api/admin/users/{id}/add-pix-authentication-method (PIX-16079).
- [#11109](https://github.com/1024pix/pix/pull/11109) [TECH] :truck: déplace le code d'évènement de `certification completed` vers `src/`.
- [#11108](https://github.com/1024pix/pix/pull/11108) [TECH] :truck: déplace le code de gestion d'évènement `Certification Course Rejected`.
- [#11089](https://github.com/1024pix/pix/pull/11089) [TECH] :truck: Déplace le service de CertificationChallenge.
- [#11086](https://github.com/1024pix/pix/pull/11086) [TECH] Mise à jour de PixUI sur PixOrga - Sass .

## v5.16.0 (14/01/2025)


### :rocket: Amélioration
- [#11074](https://github.com/1024pix/pix/pull/11074) [FEATURE] Utiliser PixIcon dans Pix Admin - Partie 2 (PIX-16040).

### :building_construction: Tech
- [#11048](https://github.com/1024pix/pix/pull/11048) [TECH] ♻️ migration du repository `lib/infrastructure/campaign-repository.js` (PIX-16029).

### :bug: Correction
- [#11096](https://github.com/1024pix/pix/pull/11096) [BUGFIX] Corriger l'export des résultats avec présence des acquis (PIX-16080).

### :arrow_up: Montée de version
- [#11092](https://github.com/1024pix/pix/pull/11092) [BUMP] Update dependency ember-source to v6 (certif).

## v5.15.0 (13/01/2025)


### :bug: Correction
- [#11097](https://github.com/1024pix/pix/pull/11097) [BUGFIX] Permettre de créer des organisations en masse (PIX-YOLO).
- [#11084](https://github.com/1024pix/pix/pull/11084) [BUGFIX] Corriger l'affichage de la double mire sur PixOrga (PIX-16070).

### :arrow_up: Montée de version
- [#11093](https://github.com/1024pix/pix/pull/11093) [BUMP] Update dependency @1024pix/pix-ui to ^52.3.5 (certif).

## v5.14.0 (13/01/2025)


### :rocket: Amélioration
- [#11023](https://github.com/1024pix/pix/pull/11023) [FEATURE] Modification des pages de CGU (PIX-15589).
- [#11063](https://github.com/1024pix/pix/pull/11063) [FEATURE] Ajouter un feature toggle pour le confinement des access tokens (PIX-15924).
- [#10897](https://github.com/1024pix/pix/pull/10897) [FEATURE] Prendre en compte flashcards dans les scripts CSV (PIX-15634)(PIX-15857).

### :building_construction: Tech
- [#11012](https://github.com/1024pix/pix/pull/11012) [TECH] Refacto - méthodes dans OrganizationPlacesLotRepository (PIX-15818).
- [#11076](https://github.com/1024pix/pix/pull/11076) [TECH] :truck: Dépalce le sérializer `csv-column` vers `src`.
- [#11033](https://github.com/1024pix/pix/pull/11033) [TECH] :truck: Déplacement de `verify-certification-code-service` vers `src`.
- [#11060](https://github.com/1024pix/pix/pull/11060) [TECH] :truck: Déplace le service d'export pour le CPF vers `src`.
- [#11044](https://github.com/1024pix/pix/pull/11044) [TECH] :truck: Déplacement de deux `knowledge repositories` vers `src`.

### :bug: Correction
- [#11072](https://github.com/1024pix/pix/pull/11072) [BUGFIX] Ajoute la marge entre la PixNotificationAlert et le contenu de la page  (PIX-16050) .
- [#11065](https://github.com/1024pix/pix/pull/11065) [BUGFIX] Sur Pix App .org corriger les liens vers le support qui ne sont pas bons sur les pages de réinitialisation du mot de passe (PIX-16033).
- [#11069](https://github.com/1024pix/pix/pull/11069) [BUGFIX] Changer la phrase d'acceptation des CGUs dans pix-app, orga et certif (PIX-16000).
- [#11056](https://github.com/1024pix/pix/pull/11056) [BUGFIX] Correction de la gestion des erreurs de connexion SSO OIDC (PIX-15621).
- [#11037](https://github.com/1024pix/pix/pull/11037) [BUGFIX] Affiche le logo sur la page des cgu.

### :arrow_up: Montée de version
- [#11078](https://github.com/1024pix/pix/pull/11078) [BUMP] Update dependency @1024pix/pix-ui to ^52.3.3 (certif).
- [#11082](https://github.com/1024pix/pix/pull/11082) [BUMP] Update dependency @1024pix/pix-ui to ^52.3.5 (mon-pix).
- [#11080](https://github.com/1024pix/pix/pull/11080) [BUMP] Update dependency @1024pix/pix-ui to ^52.3.5 (junior).
- [#11079](https://github.com/1024pix/pix/pull/11079) [BUMP] Update dependency @1024pix/pix-ui to ^52.3.5 (admin).
- [#11077](https://github.com/1024pix/pix/pull/11077) [BUMP] Update dependency @1024pix/pix-ui to ^52.3.3 (admin).
- [#11068](https://github.com/1024pix/pix/pull/11068) [BUMP] Update dependency ember-test-selectors to v7 (admin).
- [#11070](https://github.com/1024pix/pix/pull/11070) [BUMP] Lock file maintenance (api).
- [#11049](https://github.com/1024pix/pix/pull/11049) [BUMP] Update dependency ember-resolver to v13 (junior).
- [#11051](https://github.com/1024pix/pix/pull/11051) [BUMP] Update dependency eslint-plugin-cypress to v4 (e2e).
- [#11057](https://github.com/1024pix/pix/pull/11057) [BUMP] Update dependency ember-simple-auth to v7 (mon-pix).
- [#11054](https://github.com/1024pix/pix/pull/11054) [BUMP] Update dependency eslint to v9 (e2e).

## v5.13.0 (10/01/2025)


### :rocket: Amélioration
- [#10980](https://github.com/1024pix/pix/pull/10980) [FEATURE] Réorganiser les fichiers de Modulix dans mon-pix/components (PIX-15127).
- [#11039](https://github.com/1024pix/pix/pull/11039) [FEATURE] Amélioration de la documentation d'API pour Parcoursup et ajout de nouveaux seeds (PIX-16022).
- [#10936](https://github.com/1024pix/pix/pull/10936) [FEATURE] Mettre à jour le champ UpdatedAt quand un membre d'équipe de centre de certification est désactivé (PIX-15548).
- [#10972](https://github.com/1024pix/pix/pull/10972) [FEATURE] Ajouter un on/off sur l'anonymisation lors de la suppression de prescrits (PIX-15880).
- [#10967](https://github.com/1024pix/pix/pull/10967) [FEATURE] Humaniser les seeds Devcomp (PIX-15835).
- [#11022](https://github.com/1024pix/pix/pull/11022) [FEATURE] Ajouter les champs licence et légende pour l'élément Image côté API (PIX-15990).
- [#11019](https://github.com/1024pix/pix/pull/11019) [FEATURE] Utiliser le composant BannerAlert sur la bannière beta des modules (PIX-15861).
- [#10937](https://github.com/1024pix/pix/pull/10937) [FEATURE] Modifier l'appel Pix Orga qui récupère le status des CGU (PIX-15586).

### :building_construction: Tech
- [#11029](https://github.com/1024pix/pix/pull/11029) [TECH] Montée de version PixOrga (PIX-16024).
- [#10917](https://github.com/1024pix/pix/pull/10917) [TECH] Migrer la route de réinitialisation de scorecard (PIX-15881).
- [#11017](https://github.com/1024pix/pix/pull/11017) [TECH] Utilise le `competenceName`, `competenceCode` et `areaName` plutôt qu'un `id` interne (Pix-15962).
- [#10899](https://github.com/1024pix/pix/pull/10899) [TECH] Utiliser le composant PixPagination du Design System (PIX-15862).
- [#10960](https://github.com/1024pix/pix/pull/10960) [TECH] Montée de version PixOrga (PIX-15959).

### :bug: Correction
- [#11035](https://github.com/1024pix/pix/pull/11035) [BUGFIX] Corriger l'affichage pour rejoindre une organisation SCO sur PixOrga (PIX-16020).
- [#11047](https://github.com/1024pix/pix/pull/11047) [BUGFIX] Update membership fields only if membership is not already deactivated (pix-16014).
- [#10974](https://github.com/1024pix/pix/pull/10974) [BUGFIX] Modification du lien "Mot de passe oublié" de l'application www.orga.pix.org (PIX-15940).

### :arrow_up: Montée de version
- [#11058](https://github.com/1024pix/pix/pull/11058) [BUMP] Update dependency @1024pix/pix-ui to ^52.3.2 (junior).
- [#11026](https://github.com/1024pix/pix/pull/11026) [BUMP] Update dependency @1024pix/pix-ui to ^52.3.1 (junior).
- [#11050](https://github.com/1024pix/pix/pull/11050) [BUMP] Update dependency ember-simple-auth to v7 (admin).
- [#11052](https://github.com/1024pix/pix/pull/11052) [BUMP] Update dependency eslint-plugin-n to v17 (certif).
- [#11053](https://github.com/1024pix/pix/pull/11053) [BUMP] Update dependency eslint-plugin-yaml to v1 (load-testing).
- [#11045](https://github.com/1024pix/pix/pull/11045) [BUMP] Update dependency ember-qunit to v9 (mon-pix).
- [#11046](https://github.com/1024pix/pix/pull/11046) [BUMP] Update dependency ember-resolver to v13 (admin).
- [#11040](https://github.com/1024pix/pix/pull/11040) [BUMP] Update dependency ember-qunit to v9 (junior).
- [#11043](https://github.com/1024pix/pix/pull/11043) [BUMP] Update dependency @1024pix/pix-ui to ^52.3.2 (orga).
- [#11030](https://github.com/1024pix/pix/pull/11030) [BUMP] Update dependency @1024pix/pix-ui to ^52.3.1 (orga).
- [#11038](https://github.com/1024pix/pix/pull/11038) [BUMP] Update dependency ember-qunit to v9 (admin).
- [#11036](https://github.com/1024pix/pix/pull/11036) [BUMP] Update dependency @1024pix/pix-ui to ^52.3.2 (mon-pix).
- [#11032](https://github.com/1024pix/pix/pull/11032) [BUMP] Update dependency @1024pix/pix-ui to ^52.3.2 (certif).
- [#11031](https://github.com/1024pix/pix/pull/11031) [BUMP] Update dependency @1024pix/pix-ui to ^52.3.2 (admin).
- [#11028](https://github.com/1024pix/pix/pull/11028) [BUMP] Update dependency @1024pix/pix-ui to ^52.3.1 (mon-pix).
- [#11027](https://github.com/1024pix/pix/pull/11027) [BUMP] Update dependency typescript-eslint to v8 (audit-logger).
- [#11013](https://github.com/1024pix/pix/pull/11013) [BUMP] Update dependency ember-resolver to v13 (certif).
- [#11025](https://github.com/1024pix/pix/pull/11025) [BUMP] Update dependency @1024pix/pix-ui to ^52.3.1 (certif).
- [#11024](https://github.com/1024pix/pix/pull/11024) [BUMP] Update dependency @1024pix/pix-ui to ^52.3.1 (admin).
- [#11010](https://github.com/1024pix/pix/pull/11010) [BUMP] Update dependency ember-cli to v6 (junior).

## v5.12.0 (08/01/2025)


### :building_construction: Tech
- [#10890](https://github.com/1024pix/pix/pull/10890) [TECH] Sortir la logique métier du usecase start-writing-campaign-assessments-results-to-stream.js (PIX-15822).
- [#10984](https://github.com/1024pix/pix/pull/10984) [TECH] :truck: Déplace le `tube-repository` vers `src/shared`.
- [#11002](https://github.com/1024pix/pix/pull/11002) [TECH] :package: Mise à jour de`ember-file-upload` pour pix Admin.
- [#10997](https://github.com/1024pix/pix/pull/10997) [TECH] :package: chore(junior) mise à jour du paquet `ember-cli-mirage` de pix Junior.
- [#10983](https://github.com/1024pix/pix/pull/10983) [TECH] :truck: déplacement du `mailService` vers `src`.
- [#10631](https://github.com/1024pix/pix/pull/10631) [TECH] add direct metrics pushed to datadog.

### :bug: Correction
- [#11018](https://github.com/1024pix/pix/pull/11018) [BUGFIX] Permettre un arrêt graceful  du serveur.
- [#10961](https://github.com/1024pix/pix/pull/10961) [BUGFIX] Placer le curseur de l'utilisateur sur les en-têtes des pages de réinitialisation de mot de passe (PIX-15937).
- [#11016](https://github.com/1024pix/pix/pull/11016) [BUGFIX] Répare Pix Certif suite à la montée de version de `ember-simple-auth` en v7.
- [#10973](https://github.com/1024pix/pix/pull/10973) [BUGFIX] Ré-ajoute la raison d'abandon du candidat (PIX-15969).

### :arrow_up: Montée de version
- [#11011](https://github.com/1024pix/pix/pull/11011) [BUMP] Update dependency ember-cli to v6 (mon-pix).
- [#11015](https://github.com/1024pix/pix/pull/11015) [BUMP] Update dependency sinon to v19 (load-testing).
- [#11014](https://github.com/1024pix/pix/pull/11014) [BUMP] Update dependency mocha to v11 (load-testing).
- [#11008](https://github.com/1024pix/pix/pull/11008) [BUMP] Update dependency ember-simple-auth to v7 (certif).
- [#11007](https://github.com/1024pix/pix/pull/11007) [BUMP] Update dependency ember-cli to v6 (certif).
- [#11006](https://github.com/1024pix/pix/pull/11006) [BUMP] Update dependency ember-cli to v6 (admin).
- [#11004](https://github.com/1024pix/pix/pull/11004) [BUMP] Update dependency artillery-plugin-expect to v2 (load-testing).
- [#11005](https://github.com/1024pix/pix/pull/11005) [BUMP] Update dependency ember-qunit to v9 (certif).
- [#10999](https://github.com/1024pix/pix/pull/10999) [BUMP] Update dependency artillery-plugin-publish-metrics to v2 (load-testing).
- [#11001](https://github.com/1024pix/pix/pull/11001) [BUMP] Update dependency cypress to v13 (e2e).
- [#10998](https://github.com/1024pix/pix/pull/10998) [BUMP] Update dependency artillery to v2 (load-testing).
- [#11000](https://github.com/1024pix/pix/pull/11000) [BUMP] Update dependency chai to v5 (load-testing).
- [#10993](https://github.com/1024pix/pix/pull/10993) [BUMP] Update dependency @formatjs/intl to v3 (mon-pix).
- [#10992](https://github.com/1024pix/pix/pull/10992) [BUMP] Update dependency npm-run-all2 to v7 (orga).
- [#10990](https://github.com/1024pix/pix/pull/10990) [BUMP] Update dependency npm-run-all2 to v7 (junior).
- [#10989](https://github.com/1024pix/pix/pull/10989) [BUMP] Update dependency npm-run-all2 to v7 (e2e).
- [#10991](https://github.com/1024pix/pix/pull/10991) [BUMP] Update dependency npm-run-all2 to v7 (mon-pix).
- [#10324](https://github.com/1024pix/pix/pull/10324) [BUMP] Update dependency sinon to v19 (api).
- [#10988](https://github.com/1024pix/pix/pull/10988) [BUMP] Update dependency npm-run-all2 to v7 (dossier racine).
- [#10986](https://github.com/1024pix/pix/pull/10986) [BUMP] Update dependency @formatjs/intl to v3 (certif).
- [#10987](https://github.com/1024pix/pix/pull/10987) [BUMP] Update dependency npm-run-all2 to v7 (admin).
- [#10985](https://github.com/1024pix/pix/pull/10985) [BUMP] Update dependency @1024pix/pix-ui to ^52.1.0 (orga).

## v5.11.0 (07/01/2025)


### :rocket: Amélioration
- [#10894](https://github.com/1024pix/pix/pull/10894) [FEATURE] Modifier l’API permettant d’accepter les CGU afin de fonctionner avec le nouveau modèle (PIX-15588).
- [#10943](https://github.com/1024pix/pix/pull/10943) [FEATURE] Prendre en compte les nouveaux types de grain dans les scripts CSV (PIX-15860).
- [#10915](https://github.com/1024pix/pix/pull/10915) [FEATURE] Suppression du cadre autour des qcu-image.
- [#10945](https://github.com/1024pix/pix/pull/10945) [FEATURE] déduplique les participations retentée (Pix-15885).

### :building_construction: Tech
- [#10962](https://github.com/1024pix/pix/pull/10962) [TECH] Limiter l'exposition des données persos en paramètre de la route parcoursup (PIX-15952) .
- [#9870](https://github.com/1024pix/pix/pull/9870) [TECH] Ne plus utiliser Sentry sur l'API (PIX-13883).
- [#10958](https://github.com/1024pix/pix/pull/10958) [TECH] Corrige un lien cassé dans la doc  `api-dependencies.md`.
- [#10939](https://github.com/1024pix/pix/pull/10939) [TECH] Mise à jour Pix Certif vers 5.12 (PIX-15896).

### :bug: Correction
- [#10902](https://github.com/1024pix/pix/pull/10902) [BUGFIX] Rendre accessibles les contenus formatifs associés aux campagnes non partageables (PIX-15836).

### :arrow_up: Montée de version
- [#10982](https://github.com/1024pix/pix/pull/10982) [BUMP] Update dependency @1024pix/pix-ui to ^52.1.0 (mon-pix).
- [#10981](https://github.com/1024pix/pix/pull/10981) [BUMP] Update dependency @1024pix/pix-ui to ^52.1.0 (junior).
- [#10979](https://github.com/1024pix/pix/pull/10979) [BUMP] Update dependency pino-pretty to v13 (audit-logger).
- [#10978](https://github.com/1024pix/pix/pull/10978) [BUMP] Update dependency npm-run-all2 to v7 (api).
- [#10977](https://github.com/1024pix/pix/pull/10977) [BUMP] Update dependency mocha to v11 (api).
- [#10976](https://github.com/1024pix/pix/pull/10976) [BUMP] Update dependency @1024pix/pix-ui to ^52.1.0 (certif).
- [#10975](https://github.com/1024pix/pix/pull/10975) [BUMP] Update dependency @1024pix/pix-ui to ^52.1.0 (admin).
- [#10971](https://github.com/1024pix/pix/pull/10971) [BUMP] Update dependency pino-pretty to v13 (api).
- [#10959](https://github.com/1024pix/pix/pull/10959) [BUMP] Update dependency @ember/test-helpers to v4 (mon-pix).
- [#10969](https://github.com/1024pix/pix/pull/10969) [BUMP] Update dependency @faker-js/faker to v9 (orga).
- [#10970](https://github.com/1024pix/pix/pull/10970) [BUMP] Update dependency @formatjs/intl to v3 (admin).
- [#10968](https://github.com/1024pix/pix/pull/10968) [BUMP] Update dependency ember-keyboard to v9 (mon-pix).
- [#10966](https://github.com/1024pix/pix/pull/10966) [BUMP] Update dependency @faker-js/faker to v9 (load-testing).
- [#10965](https://github.com/1024pix/pix/pull/10965) [BUMP] Update dependency @faker-js/faker to v8 (load-testing).
- [#10964](https://github.com/1024pix/pix/pull/10964) [BUMP] Update dependency @faker-js/faker to v7 (load-testing).
- [#10951](https://github.com/1024pix/pix/pull/10951) [BUMP] Update dependency @1024pix/pix-ui to v52 (admin).
- [#10952](https://github.com/1024pix/pix/pull/10952) [BUMP] Update dependency @1024pix/pix-ui to v52 (mon-pix).
- [#10957](https://github.com/1024pix/pix/pull/10957) [BUMP] Update dependency @ember/test-helpers to v4 (admin).
- [#10950](https://github.com/1024pix/pix/pull/10950) [BUMP] Update dependency @1024pix/pix-ui to v51 (admin).
- [#10955](https://github.com/1024pix/pix/pull/10955) [BUMP] Update dependency @ember/test-helpers to v4 (certif).
- [#10953](https://github.com/1024pix/pix/pull/10953) [BUMP] Update dependency @badeball/cypress-cucumber-preprocessor to v21 (e2e).
- [#10948](https://github.com/1024pix/pix/pull/10948) [BUMP] Update dependency @1024pix/stylelint-config to ^5.1.26 (mon-pix).
- [#10949](https://github.com/1024pix/pix/pull/10949) [BUMP] Update dependency @1024pix/stylelint-config to ^5.1.26 (orga).
- [#10946](https://github.com/1024pix/pix/pull/10946) [BUMP] Update dependency @1024pix/stylelint-config to ^5.1.26 (certif).
- [#10916](https://github.com/1024pix/pix/pull/10916) [BUMP] Update CircleCI-Public/trigger-circleci-pipeline-action action to v1.2.0 (workflows).
- [#10947](https://github.com/1024pix/pix/pull/10947) [BUMP] Update dependency @1024pix/stylelint-config to ^5.1.26 (junior).
- [#10925](https://github.com/1024pix/pix/pull/10925) [BUMP] Update dependency @1024pix/pix-ui to v50 (admin).
- [#10944](https://github.com/1024pix/pix/pull/10944) [BUMP] Update dependency @1024pix/stylelint-config to ^5.1.26 (admin).
- [#10941](https://github.com/1024pix/pix/pull/10941) [BUMP] Update dependency @1024pix/eslint-plugin to ^2.0.4 (mon-pix).
- [#10942](https://github.com/1024pix/pix/pull/10942) [BUMP] Update dependency @1024pix/eslint-plugin to ^2.0.4 (orga).
- [#10938](https://github.com/1024pix/pix/pull/10938) [BUMP] Update dependency @1024pix/eslint-plugin to ^2.0.4 (api).
- [#10940](https://github.com/1024pix/pix/pull/10940) [BUMP] Update dependency @1024pix/eslint-plugin to ^2.0.4 (junior).
- [#10923](https://github.com/1024pix/pix/pull/10923) [BUMP] Update dependency @1024pix/eslint-plugin to v2 (mon-pix).
- [#10910](https://github.com/1024pix/pix/pull/10910) [BUMP] Update dependency @1024pix/eslint-plugin to v2 (api).

### :coffee: Autre
- [#10905](https://github.com/1024pix/pix/pull/10905) [DOC] Ajouter des commentaires sur les tables liées au méchanisme de quete (PIX-14816) .

## v5.10.0 (06/01/2025)


### :rocket: Amélioration
- [#10935](https://github.com/1024pix/pix/pull/10935) [FEATURE]  Ajoute une route parcoursup pour la récupération de certification à partir du code de vérification (PIX-15894).
- [#10932](https://github.com/1024pix/pix/pull/10932) [FEATURE] Afficher le nombre de méthodes de connexion actives dans Pix Admin (PIX-14787).
- [#10889](https://github.com/1024pix/pix/pull/10889) [FEATURE] Matomo - Envoyer les events liés à l'utilisation du Expand (toggle) (PIX-15774).
- [#10931](https://github.com/1024pix/pix/pull/10931) [FEATURE] Change l'URL du endpoint Parcoursup vers `/api/parcoursup/certification/search?ine={ine}` (PIX-15913).
- [#10898](https://github.com/1024pix/pix/pull/10898) [FEATURE] Passage > Mettre la Beta Banner au dessus de la navbar (PIX-15698)(PIX-15832).
- [#10930](https://github.com/1024pix/pix/pull/10930) [FEATURE] Ajout du endpoint parcoursup pour récupérer les résultats d'une certification via les données UAI, nom, prénom et date de naissance (PIX-15893).
- [#10807](https://github.com/1024pix/pix/pull/10807) [FEATURE] Utiliser les designs tokens sur Mon Pix (PIX-15177).
- [#10914](https://github.com/1024pix/pix/pull/10914) [FEATURE] Sauvegarder les raisons d'abandons à la finalisation (PIX-15523).

### :building_construction: Tech
- [#10892](https://github.com/1024pix/pix/pull/10892) [TECH] Montée de version PixOrga  (PIX-15856).
- [#10933](https://github.com/1024pix/pix/pull/10933) [TECH] :truck: Déplacement de la route `/api/certification-centers/{certificationCenterId}/divisions` (PIX-15892).
- [#10926](https://github.com/1024pix/pix/pull/10926) [TECH] Mise à jour des dépendances sur Pix Certif (PIX-15884).
- [#10928](https://github.com/1024pix/pix/pull/10928) [TECH] Étoffer la documentation de l'endpoint Parcoursup (PIX-15891).
- [#10927](https://github.com/1024pix/pix/pull/10927) [TECH] Retourner une 204 No Content à l'appel GET /.
- [#10708](https://github.com/1024pix/pix/pull/10708) [TECH] :recycle:  Remaniement du filtre des compétence (récupération d'une PR ÉcriPlus).

### :bug: Correction
- [#10901](https://github.com/1024pix/pix/pull/10901) [BUGFIX] Rajouter la trad title maquante pour les Attestations (PIX-15873).

### :arrow_up: Montée de version
- [#10924](https://github.com/1024pix/pix/pull/10924) [BUMP] Update dependency eslint to v9 (api).
- [#10922](https://github.com/1024pix/pix/pull/10922) [BUMP] Update dependency scalingo to ^0.10.0 (api).
- [#10921](https://github.com/1024pix/pix/pull/10921) [BUMP] Update dependency postgres to v15.10.
- [#10920](https://github.com/1024pix/pix/pull/10920) [BUMP] Update dependency browser-tools to v1.5.0 (.circleci).
- [#10919](https://github.com/1024pix/pix/pull/10919) [BUMP] Update dependency @1024pix/eslint-plugin to ^2.0.3 (orga).
- [#10918](https://github.com/1024pix/pix/pull/10918) [BUMP] Update dependency @1024pix/eslint-plugin to ^2.0.3 (junior).
- [#10883](https://github.com/1024pix/pix/pull/10883) [BUMP] Update dependency @1024pix/pix-ui to ^49.6.0 (admin).
- [#10882](https://github.com/1024pix/pix/pull/10882) [BUMP] Update adobe/s3mock Docker tag to v3.12.0 (dossier racine).
- [#10913](https://github.com/1024pix/pix/pull/10913) [BUMP] Update dependency eslint-plugin-unicorn to v56 (api).

## v5.9.0 (31/12/2024)


### :rocket: Amélioration
- [#10864](https://github.com/1024pix/pix/pull/10864) [FEATURE] Orga - Amélioration du design du menu de navigation (PIX-15769).
- [#10909](https://github.com/1024pix/pix/pull/10909) [FEATURE] Récupération de l'entièreté des données à envoyer à Parcoursup (PIX-15882).
- [#10908](https://github.com/1024pix/pix/pull/10908) [FEATURE] Mise à jour du template français de kit surveillant (PIX-15855).

### :building_construction: Tech
- [#10906](https://github.com/1024pix/pix/pull/10906) [TECH] Rendre le code lié à l'authentification des applications plus clair (PIX-15876).
- [#10904](https://github.com/1024pix/pix/pull/10904) [TECH] :truck: Déplacement de la route de sélection d'étudiants pour la certification.
- [#10907](https://github.com/1024pix/pix/pull/10907) [TECH] Rendre le code lié à l'authentification des users plus clair et corriger un test erroné (PIX-15878).
- [#10859](https://github.com/1024pix/pix/pull/10859) [TECH] Montée de version vers PixUI 52 (PIX-15817).
- [#10870](https://github.com/1024pix/pix/pull/10870) [TECH] Mise à jour de ESLint vers la V9 (PIX-15823).

### :arrow_up: Montée de version
- [#10912](https://github.com/1024pix/pix/pull/10912) [BUMP] Update dependency eslint-plugin-unicorn to v54 (api).
- [#10911](https://github.com/1024pix/pix/pull/10911) [BUMP] Update dependency eslint-plugin-import-x to v4 (api).

## v5.8.0 (26/12/2024)


### :rocket: Amélioration
- [#10896](https://github.com/1024pix/pix/pull/10896) [FEATURE] Connecte un datamart externe pour servir les résultats de certification pour ParcourSup (PIX-15800).
- [#10888](https://github.com/1024pix/pix/pull/10888) [FEATURE] Mise à jour des textes des nouveaux gabarits (PIX-15840).

### :bug: Correction
- [#10903](https://github.com/1024pix/pix/pull/10903) [BUGFIX] Garanti l'ordonnancement des compétences dans l'attestation de certification.

## v5.7.0 (26/12/2024)


### :rocket: Amélioration
- [#10881](https://github.com/1024pix/pix/pull/10881) [FEATURE] :sparkles: Ajoute une stratégie de contrôle plus strict pour l'accès au endpoint Parcoursup (PIX-15801).
- [#10895](https://github.com/1024pix/pix/pull/10895) [FEATURE] Message de warning pour épreuve jouable sans acquis (PIX-15858).
- [#10884](https://github.com/1024pix/pix/pull/10884) [FEATURE] Donner la possibilitée aux organisations sans imports de télécharger des attestations (PIX-15612).
- [#10866](https://github.com/1024pix/pix/pull/10866) [FEATURE] Afficher un élement Expand (PIX-15773).
- [#10868](https://github.com/1024pix/pix/pull/10868) [FEATURE] Permettre de masquer le champ JSON dans la preview modulix (PIX-15830).
- [#10786](https://github.com/1024pix/pix/pull/10786) [FEATURE] Ajout de l'API getLegalDocumentStatusByUserId dans legal-document context (PIX-15581).
- [#10871](https://github.com/1024pix/pix/pull/10871) [FEATURE] affiche aussi les participations à des campagnes de collecte de profil (PIX-15798).
- [#10858](https://github.com/1024pix/pix/pull/10858) [FEATURE] Pouvoir créer un élément Expand dans le contenu d'un Module (PIX-15772).

### :building_construction: Tech
- [#10886](https://github.com/1024pix/pix/pull/10886) [TECH] Ajouter la table ke-snapshots dans la description du template de migration (PIX-15850).
- [#10887](https://github.com/1024pix/pix/pull/10887) [TECH] Migrer PixOrga vers Eslint v9 (PIX-15851).
- [#10841](https://github.com/1024pix/pix/pull/10841) [TECH] Suppression de l'utilisation de la dependency RSVP partout où on peut immédiatement la remplacer par Promise (PIX-15814).
- [#10863](https://github.com/1024pix/pix/pull/10863) [TECH] Mutualiser les heading sur PixOrga (Pix-15826).
- [#10840](https://github.com/1024pix/pix/pull/10840) [TECH] Monter la version d'ember-source orga en V6 (PIX-15770).

### :bug: Correction
- [#10885](https://github.com/1024pix/pix/pull/10885) [BUGFIX] cache le filtre du propriétaire de campagne sur la page mes campagnes (pix-15837).
- [#10875](https://github.com/1024pix/pix/pull/10875) [BUGFIX] Autoriser la suppression / desactivation des apprenants n'ayant pas de studentNumber ou nationalStudeId (PIX-15831).

### :arrow_up: Montée de version
- [#10879](https://github.com/1024pix/pix/pull/10879) [BUMP] Update adobe/s3mock Docker tag to v3.12.0 (.circleci).
- [#10880](https://github.com/1024pix/pix/pull/10880) [BUMP] Update adobe/s3mock Docker tag to v3.12.0 (docker).
- [#10874](https://github.com/1024pix/pix/pull/10874) [BUMP] Update dependency @1024pix/stylelint-config to ^5.1.25 (junior).
- [#10878](https://github.com/1024pix/pix/pull/10878) [BUMP] Update dependency @1024pix/stylelint-config to ^5.1.25 (orga).
- [#10877](https://github.com/1024pix/pix/pull/10877) [BUMP] Update dependency @1024pix/stylelint-config to ^5.1.25 (mon-pix).

### :coffee: Autre
- [#10829](https://github.com/1024pix/pix/pull/10829) [DOC] ADR sur le nouveau système de cache de contenu pédagogique au niveau de l'API Pix (PIX-15472).

## v5.6.0 (20/12/2024)


### :rocket: Amélioration
- [#10828](https://github.com/1024pix/pix/pull/10828) [FEATURE] Optimisation de l'écran de challenge Pix Junior (PIX-15739) .
- [#10860](https://github.com/1024pix/pix/pull/10860) [FEATURE] Ajouter une route API donnant accès au résultat de certif d'un élève (PIX-15799).
- [#10833](https://github.com/1024pix/pix/pull/10833) [FEATURE] Adjust self delete account (PIX-15713).
- [#10852](https://github.com/1024pix/pix/pull/10852) [FEATURE] Traduction en ES & NL de l'e-mail de suppression du compte (PIX-15805).
- [#10814](https://github.com/1024pix/pix/pull/10814) [FEATURE] améliore les messages d'erreur d'import de prescrits.
- [#10844](https://github.com/1024pix/pix/pull/10844) [FEATURE] campaign participation id in ke snapshots (Pix-15753).

### :building_construction: Tech
- [#10869](https://github.com/1024pix/pix/pull/10869) [TECH] :truck: déplace la route « jury certif summary ».

### :bug: Correction
- [#10867](https://github.com/1024pix/pix/pull/10867) [BUGFIX] L'icone en cas de succès d'import a disparu (PIX-15762).
- [#10876](https://github.com/1024pix/pix/pull/10876) [BUGFIX] corriger l'affichage du dashboard en version espagnole.
- [#10861](https://github.com/1024pix/pix/pull/10861) [BUGFIX] Afficher le tableau de la page statistiques même quand le titre du sujet est vide (PIX-15821).

### :arrow_up: Montée de version
- [#10873](https://github.com/1024pix/pix/pull/10873) [BUMP] Update dependency @1024pix/stylelint-config to ^5.1.25 (certif).
- [#10872](https://github.com/1024pix/pix/pull/10872) [BUMP] Update dependency @1024pix/stylelint-config to ^5.1.25 (admin).
- [#10853](https://github.com/1024pix/pix/pull/10853) [BUMP] Update Node.js to v20.18.1.
- [#10865](https://github.com/1024pix/pix/pull/10865) [BUMP] Update dependency @1024pix/pix-ui to ^52.0.3 (orga).
- [#10862](https://github.com/1024pix/pix/pull/10862) [BUMP] Update dependency @1024pix/pix-ui to ^52.0.3 (certif).

## v5.5.0 (19/12/2024)


### :rocket: Amélioration
- [#10831](https://github.com/1024pix/pix/pull/10831) [FEATURE] Ajouter le script pour rattraper les retard d'obtention des attestations (PIX-15510).
- [#10857](https://github.com/1024pix/pix/pull/10857) [FEATURE] Rendre la documentation d’installation de Companion traduisible (PIX-15812).
- [#10848](https://github.com/1024pix/pix/pull/10848) [FEATURE] Modifier le comportement du bouton de rafraîchissement lors d'un signalement (PIX-15726).
- [#10787](https://github.com/1024pix/pix/pull/10787) [FEATURE] Script de migration des données CGUs de Pix Orga vers le nouveau modèle (PIX-15583).
- [#10851](https://github.com/1024pix/pix/pull/10851) [FEATURE] Prendre en compte le feature toggle quest enabled (PIX-15789).
- [#10830](https://github.com/1024pix/pix/pull/10830) [FEATURE] Suivre l'utilisation de la barre de navigation Modulix dans Matomo (PIX-15535)(PIX-14866).

### :building_construction: Tech
- [#10836](https://github.com/1024pix/pix/pull/10836) [TECH] Migration de composants en GJS (PIX-15766).
- [#10855](https://github.com/1024pix/pix/pull/10855) [TECH] Supprimer l'action auto-merge local.

### :bug: Correction
- [#10850](https://github.com/1024pix/pix/pull/10850) [BUGFIX] Ne pas créer plusieurs récompenses de quêtes (PIX-15804).
- [#10843](https://github.com/1024pix/pix/pull/10843) [BUGFIX] Problème d'affichage sur les leçons (PIX-15767).

### :arrow_up: Montée de version
- [#10856](https://github.com/1024pix/pix/pull/10856) [BUMP] Update dependency @1024pix/pix-ui to ^52.0.2 (certif).
- [#10854](https://github.com/1024pix/pix/pull/10854) [BUMP] Update dependency @1024pix/pix-ui to ^51.6.1 (mon-pix).
- [#10777](https://github.com/1024pix/pix/pull/10777) [BUMP] Update nginx Docker tag to v1.27.3.
- [#10701](https://github.com/1024pix/pix/pull/10701) [BUMP] Update Node.js to v20.18.1.
- [#10839](https://github.com/1024pix/pix/pull/10839) [BUMP] Update dependency @1024pix/pix-ui to v52 (certif) (PIX-15776).

## v5.4.0 (18/12/2024)


### :rocket: Amélioration
- [#10845](https://github.com/1024pix/pix/pull/10845) [FEATURE] Ajouter une contrainte d'unicite sur la table profile-rewards (PIX-15781).
- [#10826](https://github.com/1024pix/pix/pull/10826) [FEATURE] Rendre la page attestations visible seulement aux admins de l'organisation (PIX-15611).
- [#10827](https://github.com/1024pix/pix/pull/10827) [FEATURE] Rendre asynchrone l'import à format sur PixOrga (Pix-15437).
- [#10805](https://github.com/1024pix/pix/pull/10805) [FEATURE] Faciliter les changements de noms des fournisseurs d'identité OIDC (pix-15616).
- [#10835](https://github.com/1024pix/pix/pull/10835) [FEATURE] formater les date dans les export de résultats en utilisant le fuseau Europe/Paris (PIX-15742).
- [#10811](https://github.com/1024pix/pix/pull/10811) [FEATURE] Effacer le message d'erreur de saisie de l'externalId lors de la modification du précedent en erreur (PIX-15158).

### :building_construction: Tech
- [#10834](https://github.com/1024pix/pix/pull/10834) [TECH] Migrer en GJS les composants `organization-learners` de pixOrga (Pix 15749).
- [#10842](https://github.com/1024pix/pix/pull/10842) [TECH] Migration de la route `/api/admin/sessions/publish-in-batch` (PIX-15768).
- [#10756](https://github.com/1024pix/pix/pull/10756) [TECH] :truck: Déplacement de la route `session-summaries` vers `src`.
- [#10819](https://github.com/1024pix/pix/pull/10819) [TECH] Utiliser de fausses données pour les test du script get-elements-csv (PIX-15633).

### :bug: Correction
- [#10815](https://github.com/1024pix/pix/pull/10815) [BUGFIX] :recycle: remaniement de la vérification des valeurs contenues dans le fichier CSV d'import de session en masse (PIX-15719).
- [#10820](https://github.com/1024pix/pix/pull/10820) [BUGFIX] Corrige la réactivité des boutons de publication dans Pix Admin (PIX-15736).

### :arrow_up: Montée de version
- [#10783](https://github.com/1024pix/pix/pull/10783) [BUMP] Update dependency @1024pix/pix-ui to v51 (certif).

## v5.3.0 (17/12/2024)


### :rocket: Amélioration
- [#10802](https://github.com/1024pix/pix/pull/10802) [FEATURE] déplace le footer d'orga en base de la page (pix-15615).
- [#10825](https://github.com/1024pix/pix/pull/10825) [FEATURE] Ajouter des descriptions dans la page statistiques (PIX-15457).
- [#10784](https://github.com/1024pix/pix/pull/10784) [FEATURE] Ajout d'un bouton reload pour les embed (PIX-15418).
- [#10808](https://github.com/1024pix/pix/pull/10808) [FEATURE] Ajouter les filtres par domaines sur la page statistiques (PIX-15725).
- [#10822](https://github.com/1024pix/pix/pull/10822) [FEATURE] Mettre à jour le wording du bandeau Pix Certif pour les centres SCO sur Pix Certif (PIX-15652). .
- [#10806](https://github.com/1024pix/pix/pull/10806) [FEATURE] Amélioration de l'affichage de la fiche pédagogique (PIX-15487).
- [#10812](https://github.com/1024pix/pix/pull/10812) [FEATURE] Utiliser des PixIcon au lieu de FaIcon dans la page détails de Modulix (PIX-15729).
- [#10817](https://github.com/1024pix/pix/pull/10817) [FEATURE] Ajouter la date d'extraction à la page statistiques sur Pix Orga (PIX-15458).
- [#10810](https://github.com/1024pix/pix/pull/10810) [FEATURE] Modifier le lien pour l'interprétation des résultats en anglais sur Pix Orga (PIX-15679).

### :building_construction: Tech
- [#10832](https://github.com/1024pix/pix/pull/10832) [TECH] Corrige la conjugaison de "was" en "were" dans le script de configuration.
- [#10813](https://github.com/1024pix/pix/pull/10813) [TECH] Migrer les résultats partagés et complétés à Pôle Emploi vers le contexte Prescription (Pix-15339).
- [#10801](https://github.com/1024pix/pix/pull/10801) [TECH] Retirer complètement le code lié à l'ancien cache référentiel (PIX-15711).
- [#10799](https://github.com/1024pix/pix/pull/10799) [TECH] Migrer la route User Has Seen Challenge Tooltip (PIX-15689).

### :bug: Correction
- [#10824](https://github.com/1024pix/pix/pull/10824) [BUGFIX] Corriger la mention "Terminé" sur la dernière flashcard (PIX-15735).
- [#10818](https://github.com/1024pix/pix/pull/10818) [BUGFIX] Baisser la tailles des colonnes du tableau(PIX-14545).

### :arrow_up: Montée de version
- [#10809](https://github.com/1024pix/pix/pull/10809) [BUMP] Update dependency @1024pix/pix-ui to ^51.6.0 (mon-pix).

## v5.2.0 (13/12/2024)


### :rocket: Amélioration
- [#10798](https://github.com/1024pix/pix/pull/10798) [FEATURE] Montée de version de PixUI vers la 51.2.0 (PIX-15700).
- [#10781](https://github.com/1024pix/pix/pull/10781) [FEATURE] Script d'ajout d'un document legal (PIX-15582).
- [#10794](https://github.com/1024pix/pix/pull/10794) [FEATURE] Ajouter de la pagination sur la page statistiques (PIX-15683).
- [#10803](https://github.com/1024pix/pix/pull/10803) [FEATURE] Afficher dans les exports les dates aux formats UTC afin de faciliter le traitement avec l'heure (PIX-13289).
- [#10790](https://github.com/1024pix/pix/pull/10790) [FEATURE] Changement de style pour la bannière des orga sco-1d (PIX-15672).
- [#10793](https://github.com/1024pix/pix/pull/10793) [FEATURE] Changement de disposition (PIX-15487).
- [#10730](https://github.com/1024pix/pix/pull/10730) [FEATURE] Affiche les participations anonymisées (Pix-15517).
- [#10779](https://github.com/1024pix/pix/pull/10779) [FEATURE] Calculer l'obtention de l'attestation a la fin du parcours (PIX-15498).
- [#10789](https://github.com/1024pix/pix/pull/10789) [FEATURE] Remplacer les icônes stockées par le composant PixIcon (Pix-15454).
- [#10771](https://github.com/1024pix/pix/pull/10771) [FEATURE] Traiter les retours sur la flashcard (PIX-15324).
- [#10751](https://github.com/1024pix/pix/pull/10751) [FEATURE] Afficher les statistiques dans Pix Orga (PIX-15455).
- [#10769](https://github.com/1024pix/pix/pull/10769) [FEATURE] Mettre a jour le logo du ministère sur les attestation de sixième (PIX-15512).

### :building_construction: Tech
- [#10764](https://github.com/1024pix/pix/pull/10764) [TECH] Migrer send-started-participation-results-to-pole-emploi vers le contexte Prescription (PIX-15337).
- [#10776](https://github.com/1024pix/pix/pull/10776) [TECH] Utilisation des session et currentUser service stubs dans Pix App (PIX-15677).
- [#10800](https://github.com/1024pix/pix/pull/10800) [TECH] Améliorer les logs de la route /api/token (PIX-15710).
- [#10804](https://github.com/1024pix/pix/pull/10804) [TECH] Revoir l'injection des dépendances du model User (PIX-15712).
- [#10788](https://github.com/1024pix/pix/pull/10788) [TECH] Migrer les usecases de copie des badges et paliers d'un profil cible (PIX-15675).
- [#10773](https://github.com/1024pix/pix/pull/10773) [TECH] Migrer les participation avec un statut TO_SHARE et une date de participation (PIX-15647).
- [#10778](https://github.com/1024pix/pix/pull/10778) [TECH] Migration de la route de dépublication de session (PIX-15676).
- [#10463](https://github.com/1024pix/pix/pull/10463) [TECH] :truck: déplace la route et les fichiers utilisé pour `user-orga-settings`.
- [#10791](https://github.com/1024pix/pix/pull/10791) [TECH] Appliquer le nouveau shade aux composants PixReturnTo sur Pix App (PIX-15685).
- [#10757](https://github.com/1024pix/pix/pull/10757) [TECH] Utiliser le type error sur les PixNotificationAlert.
- [#10760](https://github.com/1024pix/pix/pull/10760) [TECH] Isoler le contexte du GAR dans le session service via des fonctions dédiés.

### :bug: Correction
- [#10797](https://github.com/1024pix/pix/pull/10797) [BUGFIX] Retirer cette petite étoile dans mon-pix (PIX-15721).
- [#10796](https://github.com/1024pix/pix/pull/10796) [BUGFIX] Se baser sur le status d'une participation et non sur une date de partage pour le `isShared` (Pix-15648).
- [#10795](https://github.com/1024pix/pix/pull/10795) [BUGFIX] Garantir un comportement ISO entre l'ancienne version et la nouvelle version du repository lorsqu'on passe des valeurs invalides en guise de collection (PIX-15696).
- [#10774](https://github.com/1024pix/pix/pull/10774) [BUGFIX] Perte des infos GAR quand la page est rafraichie (PIX-12534).
- [#10775](https://github.com/1024pix/pix/pull/10775) [BUGFIX] Corrige l'affichage du dashboard en anglais.
- [#10759](https://github.com/1024pix/pix/pull/10759) [BUGFIX] Permettre la finalisation des sessions ayant à la fois des certifications complétés et une raison d'abandon (PIX-15524).
- [#10772](https://github.com/1024pix/pix/pull/10772) [BUGFIX] Retirer l'externalId d'une organisation dans le menu lorsque celle ci n'en possède pas (Pix-15658).
- [#10747](https://github.com/1024pix/pix/pull/10747) [BUGFIX] Afficher les données de campagnes supprimées non anonymisé (PIX-15613).
- [#10738](https://github.com/1024pix/pix/pull/10738) [BUGFIX] Ajouter blocage compte utilisateur sur 2 formulaires oubliés provoquant des user-logins.failureCount supérieurs à 50 (PIX-14229).

### :arrow_up: Montée de version
- [#10782](https://github.com/1024pix/pix/pull/10782) [BUMP] Update dependency @1024pix/pix-ui to v51 (mon-pix).
- [#10768](https://github.com/1024pix/pix/pull/10768) [BUMP] Update dependency browser-tools to v1.4.9 (.circleci).

## v5.1.0 (10/12/2024)


### :rocket: Amélioration
- [#10758](https://github.com/1024pix/pix/pull/10758) [FEATURE] Création de l'API  legal documents (PIX-15580).
- [#10709](https://github.com/1024pix/pix/pull/10709) [FEATURE] Modification du background des mires sur Pix Orga et Pix Certif (PIX-15554).
- [#10761](https://github.com/1024pix/pix/pull/10761) [FEATURE] Mise à jour du message en cas d'incident technique non bloquant sur Pix Certif (PIX-15391).
- [#10703](https://github.com/1024pix/pix/pull/10703) [FEATURE] Intégrer le nouveau gabarit de pages de PixApp (PIX-15521).
- [#10755](https://github.com/1024pix/pix/pull/10755) [FEATURE] Permettre de rendre les <ol> sur 2 colonnes (PIX-15592).

### :building_construction: Tech
- [#10767](https://github.com/1024pix/pix/pull/10767) [TECH] Migration des routes de neutralisation et de-neutralisation d'un challenge vers le bounded context évaluation de certification (PIX-15641).
- [#10731](https://github.com/1024pix/pix/pull/10731) [TECH]  Migrer le usecase de calcul de resultat dans le BC Campaign Participations (PIX-15341).

### :bug: Correction
- [#10770](https://github.com/1024pix/pix/pull/10770) [BUGFIX] Mélange des options QCM à tort (PIX-15655).
- [#10763](https://github.com/1024pix/pix/pull/10763) [BUGFIX] Nouveaux repositories learning content : résultats en doublon (PIX-15640).
- [#10762](https://github.com/1024pix/pix/pull/10762) [BUGFIX] Crash du rafraichissement du cache en recette (PIX-15642).

### :arrow_up: Montée de version
- [#10766](https://github.com/1024pix/pix/pull/10766) [BUMP] Update dependency @1024pix/stylelint-config to ^5.1.24 (orga).
- [#10765](https://github.com/1024pix/pix/pull/10765) [BUMP] Update dependency @1024pix/stylelint-config to ^5.1.24 (mon-pix).
- [#10723](https://github.com/1024pix/pix/pull/10723) [BUMP] Update dependency @1024pix/stylelint-config to ^5.1.24 (junior).

### :coffee: Autre
- [#10481](https://github.com/1024pix/pix/pull/10481) [DOC] ADR-57 - Migration des fichiers SCSS dans le dossier des composants.

## v5.0.0 (09/12/2024)


### :rocket: Amélioration
- [#10712](https://github.com/1024pix/pix/pull/10712) [FEATURE] Lire le contenu LCMS depuis PG (PIX-15358).


## Anciennes versions

Nous avons retiré de notre changelog les versions < v5.0.0. Elles sont disponibles en remontant dans l'historique du fichier jusqu'au 8 avril 2025.
