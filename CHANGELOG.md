# Pix Changelog

## v4.174.0 (01/07/2024)


### :rocket: Amélioration
- [#9277](https://github.com/1024pix/pix/pull/9277) [FEATURE] Permettre la duplication de profils cible dans admin (PIX-12949).
- [#9410](https://github.com/1024pix/pix/pull/9410) [FEATURE] Afficher les résultats dernier passage terminé, et s'il n'y en a pas, alors afficher le statut du passage en cours (Pix-13144).
- [#9358](https://github.com/1024pix/pix/pull/9358) [FEATURE] Ajouter un filtre sur les classes (Pix-11916).
- [#9407](https://github.com/1024pix/pix/pull/9407) [FEATURE] Update le texte informatif sur le repasser/RAZ en fin de parcours .

### :building_construction: Tech
- [#9343](https://github.com/1024pix/pix/pull/9343) [TECH] Déplacer les étapes du tutoriel de campagne dans un composant spécifique (PIX-12447).
- [#9375](https://github.com/1024pix/pix/pull/9375) [TECH] Conversion de la modale d'ajout de candidat dans le format template tag (PIX-13168).
- [#9403](https://github.com/1024pix/pix/pull/9403) [TECH] Retirer les placeholders des champs de connexion sur Pix Admin (PIX-13209).
- [#9391](https://github.com/1024pix/pix/pull/9391) [TECH] Passer la page d'affichage de la liste des sessions en .gjs (PIX-13149).
- [#9396](https://github.com/1024pix/pix/pull/9396) [TECH] Remove now unused scripts (PIX-12979).

### :bug: Correction
- [#9388](https://github.com/1024pix/pix/pull/9388) [BUGFIX] Retourner une erreur lorsqu'on tente de modifier une clé de badge par une clé existante (PIX-13191).
- [#9308](https://github.com/1024pix/pix/pull/9308) [BUGFIX] Correction du script de configuration.

### :arrow_up: Montée de version
- [#9404](https://github.com/1024pix/pix/pull/9404) [BUMP] Update dependency @1024pix/ember-testing-library to ^2.0.4 (certif).
- [#9399](https://github.com/1024pix/pix/pull/9399) [BUMP] Update dependency ember-resolver to v12 (certif).

## v4.173.0 (28/06/2024)


### :rocket: Amélioration
- [#9400](https://github.com/1024pix/pix/pull/9400) [FEATURE] Augmentation de la taille maximale de la payload pour la route /api/audit-log (PIX-13204).
- [#9390](https://github.com/1024pix/pix/pull/9390) [FEATURE] Améliorer l'accéssibilité du Stepper dans Modulix (PIX-12866).

### :building_construction: Tech
- [#9377](https://github.com/1024pix/pix/pull/9377) [TECH] Migrer la route POST /api/revoke vers src/identity-access-management (PIX-13121).
- [#9368](https://github.com/1024pix/pix/pull/9368) [TECH] Migrer la route PATCH /api/users/{id}/has-seen-last-data-protection-policy-information vers src/identity-access-management (PIX-13120).
- [#9364](https://github.com/1024pix/pix/pull/9364) [TECH] Migrer la route PATCH /api/users/{id}/lang/{lang} vers src/identity-access-management (PIX-13119).
- [#9367](https://github.com/1024pix/pix/pull/9367) [TECH] Migrer la route DELETE /api/certification-center-invitations/{certificationCenterInvitationId} vers team (PIX-13160)(PIX-13085).

### :bug: Correction
- [#9387](https://github.com/1024pix/pix/pull/9387) [BUGFIX] Ajouter la notion de pilote à la séparation pix / pix+ dans les accès autorisés d'un centre de certification (PIX-13169).
- [#9394](https://github.com/1024pix/pix/pull/9394) [BUGFIX] Corriger le clignotement sur le bouton `Continuer` des grains (PIX-13097)(PIX-12362).

## v4.172.0 (27/06/2024)


### :rocket: Amélioration
- [#9386](https://github.com/1024pix/pix/pull/9386) [FEATURE] Ajouter les règles de validation du Stepper (PIX-13143).
- [#9380](https://github.com/1024pix/pix/pull/9380) [FEATURE] Ajout de filtre dans organization-learner-api (Pix-13162).
- [#9384](https://github.com/1024pix/pix/pull/9384) [FEATURE] Spanish and Dutch translation from Phrase (PIX-13056).
- [#9379](https://github.com/1024pix/pix/pull/9379) [FEATURE] Enregistrer le click sur le bouton suivant dans un Stepper sur Matomo (PIX-12857).
- [#9363](https://github.com/1024pix/pix/pull/9363) [FEATURE] Appeler l'Audit-logger lors de l'anonymisation GAR (PIX-12807).
- [#9339](https://github.com/1024pix/pix/pull/9339) [FEATURE] CSS review pour les Stepper (PIX-12838).

### :building_construction: Tech
- [#9378](https://github.com/1024pix/pix/pull/9378) [TECH] Corrige un test flaky dans Certif (PIX-13179).
- [#9288](https://github.com/1024pix/pix/pull/9288) [TECH] Corrige le code pour suivre la règle de lint no-builtin-form-components.
- [#9366](https://github.com/1024pix/pix/pull/9366) [TECH] Mutualise les règles métier de la campagne dans l'API (PIX-13154).
- [#9362](https://github.com/1024pix/pix/pull/9362) [TECH] Migrer la route PATCH /api/users/{id}/pix-certif-terms-of-service-acceptance vers src/identity-access-management (PIX-13085).

### :bug: Correction
- [#9382](https://github.com/1024pix/pix/pull/9382) [BUGFIX] Retirer la taille minimum pour le champ idPixLabel (PIX-13178).
- [#9323](https://github.com/1024pix/pix/pull/9323) [BUGFIX] Reparer l'affichage des habilitations des centres (PIX-12909).

### :arrow_up: Montée de version
- [#9372](https://github.com/1024pix/pix/pull/9372) [BUMP] Update dependency @1024pix/eslint-config to ^1.3.5 (junior).
- [#9370](https://github.com/1024pix/pix/pull/9370) [BUMP] Update dependency ember-intl to v7 (junior).
- [#9373](https://github.com/1024pix/pix/pull/9373) [BUMP] Update dependency @1024pix/pix-ui to ^46.11.1 (junior).
- [#9369](https://github.com/1024pix/pix/pull/9369) [BUMP] Update dependency @1024pix/ember-testing-library to v2 (junior).
- [#9371](https://github.com/1024pix/pix/pull/9371) [BUMP] Update dependency ember-resolver to v12 (junior).
- [#9353](https://github.com/1024pix/pix/pull/9353) [BUMP] Update dependency @1024pix/ember-testing-library to v2 (orga).

## v4.171.0 (25/06/2024)


### :rocket: Amélioration
- [#9344](https://github.com/1024pix/pix/pull/9344) [FEATURE] Add API context to get organization membership (PIX-13074).
- [#9332](https://github.com/1024pix/pix/pull/9332) [FEATURE] Créer une navigation et déplacer la config sur la page administration sur Pix Admin (PIX-13066).
- [#9327](https://github.com/1024pix/pix/pull/9327) [FEATURE] Utiliser les tokens de texte sur la page d'erreur surveillant sur Pix Certif (PIX-11587).
- [#9280](https://github.com/1024pix/pix/pull/9280) [FEATURE] Empêche un prescrit de partager une participation à une campagne supprimée (PIX-12691).
- [#9324](https://github.com/1024pix/pix/pull/9324) [FEATURE] Afficher le positionnement de chaque élève sur une mission donnée dans Pix Orga (PIX-11869).
- [#9287](https://github.com/1024pix/pix/pull/9287) [FEATURE] Duplication de la route d'ajout de candidat de certification (PIX-12977).
- [#9329](https://github.com/1024pix/pix/pull/9329) [FEATURE] Anonymize GAR import (PIX-12809).

### :building_construction: Tech
- [#9365](https://github.com/1024pix/pix/pull/9365) [TECH] Mettre à jour des textes de l'écran d'épreuve focus (PIX-12746).
- [#9357](https://github.com/1024pix/pix/pull/9357) [TECH] Migrer la route PATCH /api/users/{id}/pix-orga-terms-of-service-acceptance vers src/identity-access-management (PIX-13084).
- [#9356](https://github.com/1024pix/pix/pull/9356) [TECH] Migrer la route PATCH /api/users/{id}/pix-terms-of-service-acceptance vers src/identity-access-management (PIX-13083).
- [#9355](https://github.com/1024pix/pix/pull/9355) [TECH] Migrer la route GET /api/users/{id}/authentication-methods vers src/identity-access-management (PIX-13082).
- [#9346](https://github.com/1024pix/pix/pull/9346) [TECH] Migrer la route GET /api/users/me vers src/identity-access-management (PIX-12822).
- [#9264](https://github.com/1024pix/pix/pull/9264) [TECH] Améliorer la structure des écrans d'instruction (PIX-12902).

### :bug: Correction
- [#9360](https://github.com/1024pix/pix/pull/9360) [BUGFIX] Force l'encodage UTF-8 pour la maj d'organisations en masse (PIX-13053).
- [#9334](https://github.com/1024pix/pix/pull/9334) [BUGFIX] Corriger les infos renvoyées pour les analyses de campagne (PIX-13021).

### :arrow_up: Montée de version
- [#9313](https://github.com/1024pix/pix/pull/9313) [BUMP] Update dependency @1024pix/ember-testing-library to v2 (certif).
- [#9272](https://github.com/1024pix/pix/pull/9272) [BUMP] Update dependency ember-source to ~5.9.0 (junior).
- [#9351](https://github.com/1024pix/pix/pull/9351) [BUMP] Update dependency ember-cli-app-version to v7 (orga).
- [#9347](https://github.com/1024pix/pix/pull/9347) [BUMP] Update dependency ember-cli-app-version to v7 (admin).
- [#9348](https://github.com/1024pix/pix/pull/9348) [BUMP] Update dependency ember-cli-app-version to v7 (certif).
- [#9349](https://github.com/1024pix/pix/pull/9349) [BUMP] Update dependency ember-cli-app-version to v7 (junior).
- [#9350](https://github.com/1024pix/pix/pull/9350) [BUMP] Update dependency ember-cli-app-version to v7 (mon-pix).
- [#9354](https://github.com/1024pix/pix/pull/9354) [BUMP] Update dependency ember-resolver to v12 (orga).

## v4.170.0 (24/06/2024)


### :rocket: Amélioration
- [#9315](https://github.com/1024pix/pix/pull/9315) [FEATURE] Afficher le statut de la dernière mission pour chaque élève dans Pix Orga (PIX-11200).
- [#9273](https://github.com/1024pix/pix/pull/9273) [FEATURE] Ajouter une route de duplication des profils cibles (PIX-11828).
- [#9145](https://github.com/1024pix/pix/pull/9145) [FEATURE] Rendre inscription CORE optionnel (PIX-12213).
- [#9249](https://github.com/1024pix/pix/pull/9249) [FEATURE] Permettre la reconciliation d'un organization learner en fonction des paramètre de reconcialitaion prédéfini (PIX-12556).
- [#9330](https://github.com/1024pix/pix/pull/9330) [FEATURE] Mettre à jour le lien d'aide des épreuves avec téléchargement (PIX-13078).
- [#9336](https://github.com/1024pix/pix/pull/9336) [FEATURE] Mettre à jour les URLs de la page d'accueil du support utilisateur.

### :building_construction: Tech
- [#9321](https://github.com/1024pix/pix/pull/9321) [TECH] Migrer la route POST /api/account-recovery vers src/identity-access-management (PIX-12740).
- [#9322](https://github.com/1024pix/pix/pull/9322) [TECH] Migrer la route GET /api/account-recovery/{temporaryKey} vers src/identity-access-management (PIX-12525).
- [#9309](https://github.com/1024pix/pix/pull/9309) [TECH] Migrer la route PATCH /api/account-recovery vers src/identity-access-management (PIX-12761).

### :bug: Correction
- [#9341](https://github.com/1024pix/pix/pull/9341) [BUGFIX] Correction du variant pix button des boutons Modifier et Dupliquer une campagne (PIX-13102).
- [#9335](https://github.com/1024pix/pix/pull/9335) [BUGFIX] Correction wording participation supprimée dans PixAdmin (PIX-13081).
- [#9333](https://github.com/1024pix/pix/pull/9333) [BUGFIX] Corriger la création de campagne en masse via PixAdmin (PIX-13071).

## v4.169.0 (20/06/2024)


### :rocket: Amélioration
- [#9325](https://github.com/1024pix/pix/pull/9325) [FEATURE] Gestion des actions du Grain (PIX-12927).
- [#9318](https://github.com/1024pix/pix/pull/9318) [FEATURE] Affiche la date de suppression d'une campagne sur PixAdmin (13054).
- [#9211](https://github.com/1024pix/pix/pull/9211) [FEATURE] Ajouter une route pour anonymiser en masse les données du GAR.
- [#9317](https://github.com/1024pix/pix/pull/9317) [FEATURE] Cache les campagnes supprimées sur PixOrga (PIX-13019).
- [#9190](https://github.com/1024pix/pix/pull/9190) [FEATURE] Permettre la pérénité des `organization-learners` via l'import générique d'un import à l'autre (PIX-12788).
- [#9304](https://github.com/1024pix/pix/pull/9304) [FEATURE][MON-PIX] Afficher une bannière informative lorsque l'adresse e-mail du compte est vérifiée (PIX-11710).

## v4.168.0 (20/06/2024)


### :building_construction: Tech
- [#9312](https://github.com/1024pix/pix/pull/9312) [TECH] Ajout d'un index sur la table `certification-subscriptions` (PIX-13028).

## v4.167.0 (19/06/2024)


### :rocket: Amélioration
- [#9261](https://github.com/1024pix/pix/pull/9261) [FEATURE] Ajouter un script pour récupérer tous les éléments d'un module en CSV (PIX-12952).

### :building_construction: Tech
- [#9319](https://github.com/1024pix/pix/pull/9319) [TECH] Flaky sur database-builder test.
- [#9310](https://github.com/1024pix/pix/pull/9310) [TECH] Ajout de la configuration pour .gjs sur Pix Certif (PIX-13024).
- [#9314](https://github.com/1024pix/pix/pull/9314) [TECH] Supprimer les warnings des dépréciations pour la futur v6.0 de Ember-Data (PIX-13018).
- [#9281](https://github.com/1024pix/pix/pull/9281) [TECH] Migrer la route `/api/admin/target-profiles/{targetProfileId}/organizations` vers son BC (PIX-12970).
- [#9311](https://github.com/1024pix/pix/pull/9311) [TECH] Migrer la route `/api/organization-learners` Vers le BC organization-learner (PIX-13026).

### :bug: Correction
- [#9291](https://github.com/1024pix/pix/pull/9291) [BUGFIX] Modification de la valeur CORE en BDD (PIX-12981).
- [#9306](https://github.com/1024pix/pix/pull/9306) [BUGFIX] Réparer les caractères de balises HTML incorrects (PIX-13036).
- [#9282](https://github.com/1024pix/pix/pull/9282) [BUGFIX][MON-PIX] Prendre en compte le choix de la langue lors de la création d'un compte via un SSO (PIX-12860).

### :arrow_up: Montée de version
- [#9320](https://github.com/1024pix/pix/pull/9320) [BUMP] Update dependency postgres to v15.
- [#9316](https://github.com/1024pix/pix/pull/9316) [BUMP] Update dependency @1024pix/pix-ui to ^46.10.3 (orga).

## v4.166.0 (18/06/2024)


### :rocket: Amélioration
- [#9232](https://github.com/1024pix/pix/pull/9232) [FEATURE] Améliorer l'UX de sélection de sujet d'un profil cible (PIX-11910).

### :building_construction: Tech
- [#9283](https://github.com/1024pix/pix/pull/9283) [TECH] Mettre a jour ember-source en 5.8.0 sur PixAdmin (PIX-12963).

### :bug: Correction
- [#9284](https://github.com/1024pix/pix/pull/9284) [BUGFIX] Adapter la hauteur de l'embed en fonction de la hauteur de l'écran (Pix-12973).

### :arrow_up: Montée de version
- [#8957](https://github.com/1024pix/pix/pull/8957) [BUMP] Update dependency ember-template-lint to v6 (certif) (PIX-12573).

## v4.165.0 (18/06/2024)


### :rocket: Amélioration
- [#9285](https://github.com/1024pix/pix/pull/9285) [FEATURE][ORGA] Ne pas afficher le bouton pour copier le code de campagne pour les organisations rattachées au GAR (PIX-12916).

### :building_construction: Tech
- [#9303](https://github.com/1024pix/pix/pull/9303) [TECH] Suppression d'avertissements liés à des dépréciations à venir d'Ember data.
- [#9270](https://github.com/1024pix/pix/pull/9270) [TECH] Mettre en place la configuration pour faire des composants GJS sur PixAdmin (PIX-12956).

### :bug: Correction
- [#9305](https://github.com/1024pix/pix/pull/9305) [BUGFIX] Corriger l'affichage des places dans le Header Et sur la pages des Places sur PixOrga (PIX-13017).
- [#9286](https://github.com/1024pix/pix/pull/9286) [BUGFIX] Erreur lors du reset de mot de passe (PIX-12935).

### :arrow_up: Montée de version
- [#9301](https://github.com/1024pix/pix/pull/9301) [BUMP] Update dependency @1024pix/pix-ui to ^46.10.2 (orga).
- [#9300](https://github.com/1024pix/pix/pull/9300) [BUMP] Update dependency @1024pix/pix-ui to ^46.10.2 (mon-pix).
- [#9299](https://github.com/1024pix/pix/pull/9299) [BUMP] Update dependency @1024pix/pix-ui to ^46.10.2 (junior).
- [#9298](https://github.com/1024pix/pix/pull/9298) [BUMP] Update dependency @1024pix/pix-ui to ^46.10.2 (admin).
- [#9297](https://github.com/1024pix/pix/pull/9297) [BUMP] Update dependency @1024pix/eslint-config to ^1.3.4 (orga).
- [#9296](https://github.com/1024pix/pix/pull/9296) [BUMP] Update dependency @1024pix/eslint-config to ^1.3.4 (mon-pix).
- [#9295](https://github.com/1024pix/pix/pull/9295) [BUMP] Update dependency @1024pix/eslint-config to ^1.3.4 (load-testing).
- [#9294](https://github.com/1024pix/pix/pull/9294) [BUMP] Update dependency @1024pix/eslint-config to ^1.3.4 (junior).
- [#9293](https://github.com/1024pix/pix/pull/9293) [BUMP] Update dependency @1024pix/eslint-config to ^1.3.4 (dossier racine).
- [#9292](https://github.com/1024pix/pix/pull/9292) [BUMP] Update dependency @1024pix/eslint-config to ^1.3.4 (certif).
- [#9290](https://github.com/1024pix/pix/pull/9290) [BUMP] Update dependency @1024pix/eslint-config to ^1.3.4 (audit-logger).
- [#9289](https://github.com/1024pix/pix/pull/9289) [BUMP] Update dependency @1024pix/eslint-config to ^1.3.4 (admin).

## v4.164.0 (17/06/2024)


### :rocket: Amélioration
- [#9278](https://github.com/1024pix/pix/pull/9278) [FEATURE] Ajouter un cadre autour des média des épreuves (Pix-12894) .
- [#9274](https://github.com/1024pix/pix/pull/9274) [FEATURE] Changement de traduction pour informer de l'activation de session (Pix-12728).
- [#9279](https://github.com/1024pix/pix/pull/9279) [FEATURE] Afficher une étiquette "Version Bêta" sur la page d'accueil de Pix Junior (PIX-12954).
- [#9241](https://github.com/1024pix/pix/pull/9241) [FEATURE] Utiliser la langue de l'épreuve en cas d'absence de langue utilisateur (PIX-12862).
- [#9243](https://github.com/1024pix/pix/pull/9243) [FEATURE] Signaler si la campagne n'existe pas dans le simulateur (PIX-12892).
- [#9233](https://github.com/1024pix/pix/pull/9233) [FEATURE] Affichage du statut de session d'école dans Pix Orga (PIX-12725).

### :building_construction: Tech
- [#9228](https://github.com/1024pix/pix/pull/9228) [TECH] Creer une souscription "Coeur" pour chaque candidat existant (PIX-12526).
- [#9229](https://github.com/1024pix/pix/pull/9229) [TECH] :broom: suppression des fichiers inutilisés.
- [#9235](https://github.com/1024pix/pix/pull/9235) [TECH] Mettre à jour le fichier CODEOWNERS.
- [#9253](https://github.com/1024pix/pix/pull/9253) [TECH] Corriger un test flaky sur PixAdmin (PIX-12942).
- [#9114](https://github.com/1024pix/pix/pull/9114) [TECH] Améliorer l'accessibilité sur l'affichage des compétences (PIX-12360).
- [#9266](https://github.com/1024pix/pix/pull/9266) [TECH] Monter de version ember-data en 5.3.3 sur PixAdmin (PIX-12950).

### :bug: Correction
- [#9267](https://github.com/1024pix/pix/pull/9267) [BUGFIX] Fix transaction et updateAt dans le repo organization-for-admin.
- [#9275](https://github.com/1024pix/pix/pull/9275) [BUGFIX] Corrige un flaky sur l'import d'OIDC provider.
- [#9238](https://github.com/1024pix/pix/pull/9238) [BUGFIX] Afficher une connexion externe par ligne sur l'écran de rattachement d'un compte externe à un compte Pix (PIX-12858).

### :arrow_up: Montée de version
- [#9269](https://github.com/1024pix/pix/pull/9269) [BUMP] Update dependency @1024pix/pix-ui to ^46.9.4 (orga).
- [#9268](https://github.com/1024pix/pix/pull/9268) [BUMP] Update dependency @1024pix/pix-ui to ^46.9.4 (mon-pix).
- [#9265](https://github.com/1024pix/pix/pull/9265) [BUMP] Update dependency @1024pix/pix-ui to ^46.9.4 (junior).

## v4.163.0 (13/06/2024)


### :rocket: Amélioration
- [#9120](https://github.com/1024pix/pix/pull/9120) [FEATURE] Empêche un prescrit de démarrer une participation à une campagne supprimée (PIX-12692).
- [#9247](https://github.com/1024pix/pix/pull/9247) [FEATURE] Afficher un Stepper dans un Grain (PIX-12840).
- [#9227](https://github.com/1024pix/pix/pull/9227) [FEATURE] Afficher la dernière page des écrans d'instructions sur Pix App (PIX-12900).
- [#9122](https://github.com/1024pix/pix/pull/9122) [FEATURE] Accepter un id de campagne dans l'url du simulateur (PIX-12760).
- [#9220](https://github.com/1024pix/pix/pull/9220) [FEATURE] Valider l'e-mail d'un compte utilisateur après réinitialisation du mot de passe (PIX-11122).

### :building_construction: Tech
- [#9218](https://github.com/1024pix/pix/pull/9218) [TECH] migration de la route `/api/campaigns/{id}/analyses`  (Pix-12829).
- [#9214](https://github.com/1024pix/pix/pull/9214) [TECH] Renommage de la table complementary-certification-subscriptions (PIX-12210).
- [#9248](https://github.com/1024pix/pix/pull/9248) [TECH] check autonomous course id presence (PIX-12938).

### :bug: Correction
- [#9255](https://github.com/1024pix/pix/pull/9255) [BUGFIX] Tourner sur les déclinaisons entre 2 passages d'une épreuve.
- [#9250](https://github.com/1024pix/pix/pull/9250) [BUGFIX] Afficher un message d'erreur lorsqu'une donnée n'est pas unique (Pix-12936).
- [#9237](https://github.com/1024pix/pix/pull/9237) [BUGFIX] Améliorer le design (Pix-12910).
- [#9222](https://github.com/1024pix/pix/pull/9222) [BUGFIX] Corriger l'affichage des methodes de connexion dans Mon Compte.

### :arrow_up: Montée de version
- [#9263](https://github.com/1024pix/pix/pull/9263) [BUMP] Update dependency @1024pix/pix-ui to ^46.9.4 (admin).
- [#9262](https://github.com/1024pix/pix/pull/9262) [BUMP] Update dependency @1024pix/eslint-config to ^1.3.3 (orga).
- [#9260](https://github.com/1024pix/pix/pull/9260) [BUMP] Update dependency @1024pix/eslint-config to ^1.3.3 (mon-pix).
- [#9259](https://github.com/1024pix/pix/pull/9259) [BUMP] Update dependency @1024pix/eslint-config to ^1.3.3 (load-testing).
- [#9258](https://github.com/1024pix/pix/pull/9258) [BUMP] Update dependency @1024pix/eslint-config to ^1.3.3 (junior).
- [#9257](https://github.com/1024pix/pix/pull/9257) [BUMP] Update dependency @1024pix/eslint-config to ^1.3.3 (dossier racine).
- [#9256](https://github.com/1024pix/pix/pull/9256) [BUMP] Update dependency @1024pix/eslint-config to ^1.3.3 (certif).
- [#9254](https://github.com/1024pix/pix/pull/9254) [BUMP] Update dependency @1024pix/eslint-config to ^1.3.3 (audit-logger).
- [#9252](https://github.com/1024pix/pix/pull/9252) [BUMP] Update dependency @1024pix/eslint-config to ^1.3.3 (admin).
- [#9207](https://github.com/1024pix/pix/pull/9207) [BUMP] Update dependency @getbrevo/brevo to v2 (api) (PIX-12911).

## v4.162.0 (13/06/2024)


### :rocket: Amélioration
- [#9187](https://github.com/1024pix/pix/pull/9187) [FEATURE] Ajouter le contenu de plusieurs écrans d'instruction sur Pix App (PIX-12841).

### :bug: Correction
- [#9180](https://github.com/1024pix/pix/pull/9180) [BUGFIX] Créer un script afin de recréer des données manquantes sur les états des participations à une campagne définit (PIX-12837).

## v4.161.0 (12/06/2024)


### :rocket: Amélioration
- [#8850](https://github.com/1024pix/pix/pull/8850) [FEATURE] Ajouter la page de modification d'infos et référentiel d'un profil cible (PIX-12442).
- [#9226](https://github.com/1024pix/pix/pull/9226) [FEATURE] Gérer l'affichage du bouton "Suivant" avec des éléments répondables (PIX-12856).
- [#9223](https://github.com/1024pix/pix/pull/9223) [FEATURE] Add a link to smart random simulator (PIX-12889).
- [#9212](https://github.com/1024pix/pix/pull/9212) [FEATURE] Audit logger peut log des events en masse (PIX-12808).

### :building_construction: Tech
- [#9152](https://github.com/1024pix/pix/pull/9152) [TECH] Migrer la route POST /api/password-reset-demands vers src/identity-access-management (PIX-12748).
- [#9245](https://github.com/1024pix/pix/pull/9245) [TECH] ajoute la configuration pour activer les synchros de traduction dans orga (pix-12923).
- [#9234](https://github.com/1024pix/pix/pull/9234) [TECH] MAJ du thème QUnit pour les tests certifs.

### :bug: Correction
- [#9242](https://github.com/1024pix/pix/pull/9242) [BUGFIX] Corriger le tag 'POLE EMPLOI' dans les seeds (PIX-12919).
- [#9194](https://github.com/1024pix/pix/pull/9194) [BUGFIX] Revert la migration des Job/handler PE (PIX-12850).

## v4.160.0 (12/06/2024)


### :rocket: Amélioration
- [#9208](https://github.com/1024pix/pix/pull/9208) [FEATURE] Gestion des erreurs dans mise à jour d'orga par CSV (PIX-12034).
- [#9072](https://github.com/1024pix/pix/pull/9072) [FEATURE] Montée de version ember-data en 5.0 sur PixAdmin (PIX-12557).
- [#9192](https://github.com/1024pix/pix/pull/9192) [FEATURE] Ouverture de session d'école Pix Junior depuis Orga (PIX-12724).
- [#9209](https://github.com/1024pix/pix/pull/9209) [FEATURE] Afficher les étapes de sélection de l'algorithme après que l'évaluation soit terminée (PIX-12763) .
- [#9150](https://github.com/1024pix/pix/pull/9150) [FEATURE] Ne pas afficher le bouton pour copier le code de campagne pour les organisations rattachées au GAR (PIX-5974).
- [#9126](https://github.com/1024pix/pix/pull/9126) [FEATURE] Afficher le nombre max de caractères du champ nom interne d'un parcours autonome (PIX-12778).
- [#9138](https://github.com/1024pix/pix/pull/9138) [FEATURE] Rendre dynamique le carousel des écrans d'instruction pour la certification V3 sur Pix App (PIX-12757).
- [#9060](https://github.com/1024pix/pix/pull/9060) [FEATURE] Découper les feedbacks de constat et de diagnostique - v0 (PIX-9783).
- [#9151](https://github.com/1024pix/pix/pull/9151) [FEATURE] Suppression de l'aléatoire dans le choix de questions pour la dégradation (PIX-12811).
- [#9178](https://github.com/1024pix/pix/pull/9178) [FEATURE] Ajouter le bouton `suivant` dans le stepper (PIX-12839).
- [#9206](https://github.com/1024pix/pix/pull/9206) [FEATURE] Rendre séléctionnable toute la zone de réponse QCU/QCM Modulix (PIX-12851).

### :building_construction: Tech
- [#9158](https://github.com/1024pix/pix/pull/9158) [TECH] Permettre de contextualiser les seeds (PIX-12833).
- [#9221](https://github.com/1024pix/pix/pull/9221) [TECH] Accélerer le `lint` local de l'API.
- [#9217](https://github.com/1024pix/pix/pull/9217) [TECH] déplace les fichiers de `lib/infrastructure/plugins` vers `src/shared`.
- [#9148](https://github.com/1024pix/pix/pull/9148) [TECH] Supprime un workflow github qui ne sert à rien.
- [#9216](https://github.com/1024pix/pix/pull/9216) [TECH] migration du fichier `Tag.js` vers `src/organizational-entities`.
- [#9155](https://github.com/1024pix/pix/pull/9155) [TECH] Ajouter un serveur SMTP pour le développement local.
- [#8212](https://github.com/1024pix/pix/pull/8212) [TECH] Faciliter le build des seeds en base de données avec JSDoc.
- [#9176](https://github.com/1024pix/pix/pull/9176) [TECH] Migrer la route GET /api/organization-invitation vers src/team (pix-12825).
- [#9161](https://github.com/1024pix/pix/pull/9161) [TECH] Migrer la route POST /api/token/anonymous vers src/identity-access-management (PIX-12826).

### :bug: Correction
- [#9230](https://github.com/1024pix/pix/pull/9230) [BUGFIX] Permettre de focus sur les propositions de QCU/QCM/QROCM une fois répondu (PIX-12906).
- [#9219](https://github.com/1024pix/pix/pull/9219) [BUGFIX] Missing EN translation of SSO reconciliation page (PIX-12821).
- [#9213](https://github.com/1024pix/pix/pull/9213) [BUGFIX] Régression sur l'affichage des données DPO (PIX-12868).
- [#9210](https://github.com/1024pix/pix/pull/9210) [BUGFIX] Prendre en compte uniquement les organisations actives lors de la recherche par UAI (PIX-5677).
- [#9186](https://github.com/1024pix/pix/pull/9186) [BUGFIX] Empecher d'accéder à la page mission si l'utilisateur n'appartient pas à une orga SCO-1D (PIX-12853).

### :arrow_up: Montée de version
- [#9224](https://github.com/1024pix/pix/pull/9224) [BUMP] Update dependency @1024pix/pix-ui to ^46.9.3 (mon-pix).
- [#9200](https://github.com/1024pix/pix/pull/9200) [BUMP] Lock file maintenance (mon-pix).
- [#9203](https://github.com/1024pix/pix/pull/9203) [BUMP] Lock file maintenance (e2e).

## v4.159.0 (10/06/2024)


### :rocket: Amélioration
- [#9099](https://github.com/1024pix/pix/pull/9099) [FEATURE] Ajouter le chargement d'une campagne dans le simulateur Smart Random (PIX-12731).
- [#9185](https://github.com/1024pix/pix/pull/9185) [FEATURE] Ouvre Pix Junior depuis Pix Orga dans un nouvel onglet.

### :building_construction: Tech
- [#9127](https://github.com/1024pix/pix/pull/9127) [TECH] Montée de version ember pix-certif (PIX-12776).
- [#9189](https://github.com/1024pix/pix/pull/9189) [TECH] Migrer la route `/api/admin/users/{id}/participations` vers src (Pix-12849).
- [#9160](https://github.com/1024pix/pix/pull/9160) [TECH] Réorganisation des tests de scoring-certification-service.js (PIX-12827).
- [#9159](https://github.com/1024pix/pix/pull/9159) [TECH] Migrer `/api/frameworks/for-target-profile-submission` vers le context target profile (PIX-12832).
- [#9156](https://github.com/1024pix/pix/pull/9156) [TECH] Arrêter d'utiliser les Ember Pods sur Modulix (PIX-12699).
- [#9056](https://github.com/1024pix/pix/pull/9056) [TECH] Migrer supervising vers session-management (PIX-12676).

### :bug: Correction
- [#9181](https://github.com/1024pix/pix/pull/9181) [BUGFIX] Blob rouge de page d'erreur tronqué.
- [#9153](https://github.com/1024pix/pix/pull/9153) [BUGFIX] Corriger l'absence de langue à utiliser pour les épreuves de preview (PIX-12813).
- [#9182](https://github.com/1024pix/pix/pull/9182) [BUGFIX] Ignore la casse du code école dans l'URL d'accès direct (PIX-12852).
- [#9184](https://github.com/1024pix/pix/pull/9184) [BUGFIX] Ajoute le point d'exclamation dans le bouton de démarrage de mission sur Pix Junior.
- [#9179](https://github.com/1024pix/pix/pull/9179) [BUGFIX] Ne pas afficher les boutons de vocalisation si la fonctionnalité a été désactivée sur le navigateur (PIX-12831).

### :arrow_up: Montée de version
- [#9204](https://github.com/1024pix/pix/pull/9204) [BUMP] Lock file maintenance (load-testing).
- [#9202](https://github.com/1024pix/pix/pull/9202) [BUMP] Lock file maintenance (dossier racine).
- [#9201](https://github.com/1024pix/pix/pull/9201) [BUMP] Lock file maintenance (api).
- [#9199](https://github.com/1024pix/pix/pull/9199) [BUMP] Update nginx Docker tag to v1.27.0.
- [#9198](https://github.com/1024pix/pix/pull/9198) [BUMP] Update dependency @1024pix/pix-ui to ^46.9.0 (orga).
- [#9197](https://github.com/1024pix/pix/pull/9197) [BUMP] Update dependency @1024pix/pix-ui to ^46.9.0 (junior).
- [#9177](https://github.com/1024pix/pix/pull/9177) [BUMP] Update adobe/s3mock Docker tag to v3.9.1 (.circleci).
- [#9196](https://github.com/1024pix/pix/pull/9196) [BUMP] Update dependency @1024pix/pix-ui to ^46.9.0 (admin).
- [#9195](https://github.com/1024pix/pix/pull/9195) [BUMP] Update adobe/s3mock Docker tag to v3.9.1 (dossier racine).
- [#9183](https://github.com/1024pix/pix/pull/9183) [BUMP] Update adobe/s3mock Docker tag to v3.9.1 (docker).
- [#9193](https://github.com/1024pix/pix/pull/9193) [BUMP] Update dependency @1024pix/pix-ui to ^46.9.0 (mon-pix).

## v4.158.0 (05/06/2024)


### :rocket: Amélioration
- [#9173](https://github.com/1024pix/pix/pull/9173) [FEATURE] Amélioration wording et logo.
- [#9134](https://github.com/1024pix/pix/pull/9134) [FEATURE] Ajouter un sélecteur de langue sur la double mire OIDC (PIX-12151).

### :building_construction: Tech
- [#9132](https://github.com/1024pix/pix/pull/9132) [TECH] Migrer la route POST /api/organization-invitations/sco vers src/team (pix-12628).
- [#9170](https://github.com/1024pix/pix/pull/9170) [TECH] Ajouter les montées de version Node.js des dockerfiles au groupement Renovate.
- [#9175](https://github.com/1024pix/pix/pull/9175) [TECH] Supprimer Pix UI de la racine du monorepo.

### :bug: Correction
- [#9174](https://github.com/1024pix/pix/pull/9174) [BUGFIX] Ignorer la casse lors de la détermination des noms d'élèves à afficher (PIX-12800).
- [#9125](https://github.com/1024pix/pix/pull/9125) [BUGFIX] Améliorer le design pour les tablettes (Pix-11931).

### :arrow_up: Montée de version
- [#9172](https://github.com/1024pix/pix/pull/9172) [BUMP] Update dependency @1024pix/stylelint-config to ^5.1.15 (orga).
- [#9171](https://github.com/1024pix/pix/pull/9171) [BUMP] Update dependency @1024pix/stylelint-config to ^5.1.15 (mon-pix).
- [#9169](https://github.com/1024pix/pix/pull/9169) [BUMP] Update Node.js to v20.14.0.
- [#9168](https://github.com/1024pix/pix/pull/9168) [BUMP] Update dependency @1024pix/stylelint-config to ^5.1.15 (junior).
- [#9167](https://github.com/1024pix/pix/pull/9167) [BUMP] Update dependency @1024pix/stylelint-config to ^5.1.15 (certif).
- [#9166](https://github.com/1024pix/pix/pull/9166) [BUMP] Update dependency @1024pix/stylelint-config to ^5.1.15 (admin).
- [#9165](https://github.com/1024pix/pix/pull/9165) [BUMP] Update dependency @1024pix/pix-ui to ^46.6.4 (mon-pix).
- [#9154](https://github.com/1024pix/pix/pull/9154) [BUMP] Update dependency @1024pix/pix-ui to ^46.6.4 (dossier racine).
- [#9163](https://github.com/1024pix/pix/pull/9163) [BUMP] Update dependency node to v20.14.0.
- [#9149](https://github.com/1024pix/pix/pull/9149) [BUMP] Update dependency @1024pix/eslint-config to ^1.3.2 (orga).

## v4.157.0 (04/06/2024)


### :rocket: Amélioration
- [#9135](https://github.com/1024pix/pix/pull/9135) [FEATURE] Ajout d'une section étape dans un module (PIX-12790).
- [#9097](https://github.com/1024pix/pix/pull/9097) [FEATURE] Récupération de la version de la session après réconciliation (PIX-11842).
- [#9076](https://github.com/1024pix/pix/pull/9076) [FEATURE] Ajouter l'import générique sur la page des participants d'une Organisation (Pix-12554).

### :building_construction: Tech
- [#9128](https://github.com/1024pix/pix/pull/9128) [TECH] Mise en place des composants `Element` & `Step` (PIX-12622).

### :bug: Correction
- [#9147](https://github.com/1024pix/pix/pull/9147) [BUGFIX] Corriger l'injection de dépendance manquante sur pole emploi notifier (PIX-12812).
- [#9146](https://github.com/1024pix/pix/pull/9146) [BUGFIX] Mettre à jour la colonne `updatedAt` de la table `assessments` lors de la mise à jour d'un assessment (PIX-11293).
- [#9136](https://github.com/1024pix/pix/pull/9136) [BUGFIX] Gérer le cas où le paramètre tubes est vide à la création de déclencheurs de contenus formatifs (PIX-12738).
- [#9133](https://github.com/1024pix/pix/pull/9133) [BUGFIX] Afficher la bonne langue dans le Language Switcher (PIX-10753).

### :arrow_up: Montée de version
- [#9144](https://github.com/1024pix/pix/pull/9144) [BUMP] Update dependency @1024pix/eslint-config to ^1.3.2 (mon-pix).
- [#9143](https://github.com/1024pix/pix/pull/9143) [BUMP] Update dependency @1024pix/eslint-config to ^1.3.2 (load-testing).
- [#9142](https://github.com/1024pix/pix/pull/9142) [BUMP] Update dependency @1024pix/eslint-config to ^1.3.2 (junior).
- [#9141](https://github.com/1024pix/pix/pull/9141) [BUMP] Update dependency @1024pix/eslint-config to ^1.3.2 (dossier racine).
- [#9140](https://github.com/1024pix/pix/pull/9140) [BUMP] Update dependency @1024pix/eslint-config to ^1.3.2 (certif).
- [#9139](https://github.com/1024pix/pix/pull/9139) [BUMP] Update dependency @1024pix/eslint-config to ^1.3.2 (audit-logger).
- [#9137](https://github.com/1024pix/pix/pull/9137) [BUMP] Update dependency @1024pix/eslint-config to ^1.3.2 (admin).
- [#9082](https://github.com/1024pix/pix/pull/9082) [BUMP] Update dependency @1024pix/pix-ui to ^46.6.2 (orga).

## v4.156.0 (03/06/2024)


### :rocket: Amélioration
- [#9081](https://github.com/1024pix/pix/pull/9081) [FEATURE] Permettre la vocalisation des consignes des épreuves (PIX-11050).
- [#9121](https://github.com/1024pix/pix/pull/9121) [FEATURE] Ajouter le suffixe "%" pour les paliers par seuil (PIX-11911).
- [#9118](https://github.com/1024pix/pix/pull/9118) [FEATURE] Ajouter les nouvelles couleurs (Pix-11932).

### :building_construction: Tech
- [#9079](https://github.com/1024pix/pix/pull/9079) [TECH] Migration de prescriber-management de src/shared vers src/team (PIX-12697).
- [#9115](https://github.com/1024pix/pix/pull/9115) [TECH] Migrer la route POST /api/admin/oidc/user/reconcile vers src/identity-access-management (PIX-12661).
- [#9123](https://github.com/1024pix/pix/pull/9123) [TECH] Utiliser notre action de lint des titres de PR .

### :bug: Correction
- [#9124](https://github.com/1024pix/pix/pull/9124) [BUGFIX] Echec du job sendSharedParticipationResults... (Pix-12762).

### :arrow_up: Montée de version
- [#9112](https://github.com/1024pix/pix/pull/9112) [BUMP] Update dependency @sentry/ember to v8 (mon-pix).
- [#9131](https://github.com/1024pix/pix/pull/9131) [BUMP] Update dependency @1024pix/pix-ui to ^46.6.0 (mon-pix).
- [#9129](https://github.com/1024pix/pix/pull/9129) [BUMP] Update dependency @1024pix/pix-ui to ^46.6.0 (mon-pix).

### :coffee: Autre
- [#9130](https://github.com/1024pix/pix/pull/9130) Revert "[BUMP] Update dependency @1024pix/pix-ui to ^46.6.0 (mon-pix)".

## v4.155.0 (31/05/2024)


### :rocket: Amélioration
- [#9075](https://github.com/1024pix/pix/pull/9075) [FEATURE][ADMIN] Permettre la copie de l'adresse e-mail et de l'identifiant via un bouton (PIX-12636).
- [#9113](https://github.com/1024pix/pix/pull/9113) [FEATURE] Ajoute les colonnes deletedBy et deletedAt sur la table campaigns (PIX-12688).

### :building_construction: Tech
- [#9077](https://github.com/1024pix/pix/pull/9077) [TECH] configuration pour le TMS Phrase.
- [#9048](https://github.com/1024pix/pix/pull/9048) [TECH] Deplacer PickChallengeService vers Evaluation (PIX-12657).
- [#9078](https://github.com/1024pix/pix/pull/9078) [TECH] Regrouper la gestion des centres (PIX-12462).
- [#9117](https://github.com/1024pix/pix/pull/9117) [TECH] Migre les composants des pages de campagnes activité et analyse vers GJS (PIX-12755).
- [#9030](https://github.com/1024pix/pix/pull/9030) [TECH] Move smart random services in evaluation context (PIX-12625).

### :bug: Correction
- [#9119](https://github.com/1024pix/pix/pull/9119) [BUGFIX] Rediriger vers la bonne participation depuis l'activité d'une campagne et le détail d'un participant (PIX-12673).
- [#9100](https://github.com/1024pix/pix/pull/9100) [BUGFIX] Ne pas prendre en compte les learner supprimés lors de la réconciliation SUP (PIX-12734).
- [#9116](https://github.com/1024pix/pix/pull/9116) [BUGFIX] Permettre d'inscrire un candidat à Pix Santé via l'ODS (PIX-12718).
- [#9085](https://github.com/1024pix/pix/pull/9085) [BUGFIX] Renseigner le bon emitter lors d'un rescoring de certification v3 (PIX-12520).

## v4.154.0 (30/05/2024)


### :rocket: Amélioration
- [#8842](https://github.com/1024pix/pix/pull/8842) [FEATURE] Permettre la modification des sujets d'un profil cible non relié à une campagne (PIX-12436).

### :building_construction: Tech
- [#9095](https://github.com/1024pix/pix/pull/9095) [TECH] Corrige un test flaky sur le comportement QROCM (PIX-12730).
- [#9104](https://github.com/1024pix/pix/pull/9104) [TECH] Monter la version d'`eslint` minimum du dossier racine.

### :bug: Correction
- [#9091](https://github.com/1024pix/pix/pull/9091) [BUGFIX] Interdire les actions utilisateurs pendant la transition entre épreuves (PIX-12658).
- [#9083](https://github.com/1024pix/pix/pull/9083) [BUGFIX] Numéroter les participations dans le bon ordre dans le selecteur de participation (pix-12713).
- [#9096](https://github.com/1024pix/pix/pull/9096) [BUGFIX] Import en masse de session KO pour l'inscription aux complémentaires (PIX-12718).

### :arrow_up: Montée de version
- [#9111](https://github.com/1024pix/pix/pull/9111) [BUMP] Update dependency pino to v9 (api).
- [#9110](https://github.com/1024pix/pix/pull/9110) [BUMP] Update dependency eslint-plugin-unicorn to v53 (api).
- [#9109](https://github.com/1024pix/pix/pull/9109) [BUMP] Update dependency eslint-plugin-unicorn to v52 (api).
- [#9108](https://github.com/1024pix/pix/pull/9108) [BUMP] Update dependency @1024pix/pix-ui to ^46.5.2 (mon-pix).
- [#9106](https://github.com/1024pix/pix/pull/9106) [BUMP] Update dependency sinon to v18 (certif).
- [#9105](https://github.com/1024pix/pix/pull/9105) [BUMP] Update dependency sinon to v18 (mon-pix).
- [#9103](https://github.com/1024pix/pix/pull/9103) [BUMP] Update dependency sinon to v18 (load-testing).
- [#9102](https://github.com/1024pix/pix/pull/9102) [BUMP] Update dependency sinon to v18 (junior).
- [#9101](https://github.com/1024pix/pix/pull/9101) [BUMP] Update dependency sinon to v18 (admin).

## v4.153.0 (29/05/2024)


### :rocket: Amélioration
- [#9011](https://github.com/1024pix/pix/pull/9011) [FEATURE] déprécie le push de donnés FT (Pix-12561).
- [#8993](https://github.com/1024pix/pix/pull/8993) [FEATURE] Englober les signalements dans la zone de focus (PIX-12025).
- [#9065](https://github.com/1024pix/pix/pull/9065) [FEATURE] Permettre d'extraire les contenus des modules en format "tableur" (PIX-12285).

### :building_construction: Tech
- [#9080](https://github.com/1024pix/pix/pull/9080) [TECH] Ajout d'un feature toggle pour les écrans d'informations de certif V3 (PIX-11844).
- [#8995](https://github.com/1024pix/pix/pull/8995) [TECH] Utiliser le nouveau format de config ESLint sur l'API.
- [#9073](https://github.com/1024pix/pix/pull/9073) [TECH] Migrer la route DELETE /api/admin/certification-centers/{id}/invitations/{certificationCenterInvitationId} (PIX-12623).
- [#9059](https://github.com/1024pix/pix/pull/9059) [TECH] Migrer la route POST /api/oidc/user/reconcile vers src/identity-access-management (PIX-12660).

### :bug: Correction
- [#9074](https://github.com/1024pix/pix/pull/9074) [BUGFIX] Correctif de l'affichage des boutons de challenges.

### :arrow_up: Montée de version
- [#9093](https://github.com/1024pix/pix/pull/9093) [BUMP] Update dependency @1024pix/eslint-plugin to ^1.2.1 (api).
- [#9092](https://github.com/1024pix/pix/pull/9092) [BUMP] Update dependency @1024pix/eslint-config to ^1.3.1 (orga).
- [#9090](https://github.com/1024pix/pix/pull/9090) [BUMP] Update dependency sinon to v18 (api).
- [#9089](https://github.com/1024pix/pix/pull/9089) [BUMP] Update dependency eslint-plugin-n to v17 (orga).
- [#9088](https://github.com/1024pix/pix/pull/9088) [BUMP] Update dependency eslint-plugin-n to v17 (junior).
- [#9087](https://github.com/1024pix/pix/pull/9087) [BUMP] Update dependency @1024pix/eslint-config to ^1.3.1 (mon-pix).
- [#9086](https://github.com/1024pix/pix/pull/9086) [BUMP] Update dependency @1024pix/eslint-config to ^1.3.1 (load-testing).
- [#9071](https://github.com/1024pix/pix/pull/9071) [BUMP] Update dependency @1024pix/eslint-config to ^1.3.1 (junior).

## v4.152.0 (28/05/2024)


### :rocket: Amélioration
- [#8939](https://github.com/1024pix/pix/pull/8939) [FEATURE] Gérer l'inscription à une certification coeur pour un candidat en certif V2 (PIX-12212).

### :building_construction: Tech
- [#9063](https://github.com/1024pix/pix/pull/9063) [TECH] Récupération de la version de certification dans le modèle (PIX-11689).
- [#9057](https://github.com/1024pix/pix/pull/9057) [TECH] Déplacer l'archivage et l'accès simplifié d'un profile cible dans son BC (PIX-12677).

### :bug: Correction
- [#9046](https://github.com/1024pix/pix/pull/9046) [BUGFIX] recharge les places  lorsque le prescrit change d'organisation (PIX-12653).
- [#9064](https://github.com/1024pix/pix/pull/9064) [BUGFIX] Afficher les puces adéquates dans l'instruction d'épreuve (PIX-12578).

### :arrow_up: Montée de version
- [#9070](https://github.com/1024pix/pix/pull/9070) [BUMP] Update dependency @1024pix/eslint-config to ^1.3.1 (dossier racine).
- [#9069](https://github.com/1024pix/pix/pull/9069) [BUMP] Update dependency @1024pix/eslint-config to ^1.3.1 (certif).
- [#9068](https://github.com/1024pix/pix/pull/9068) [BUMP] Update dependency @1024pix/eslint-config to ^1.3.1 (audit-logger).
- [#9067](https://github.com/1024pix/pix/pull/9067) [BUMP] Update dependency @1024pix/eslint-config to ^1.3.1 (api).
- [#9066](https://github.com/1024pix/pix/pull/9066) [BUMP] Update dependency @1024pix/eslint-config to ^1.3.1 (admin).
- [#9029](https://github.com/1024pix/pix/pull/9029) [BUMP] Update dependency @embroider/webpack to v4 (admin).

### :coffee: Autre
- [#9061](https://github.com/1024pix/pix/pull/9061) [FEATURES] Ajout d'un label informatif pour les QCU / QCM (Pix-12592).

## v4.151.0 (27/05/2024)


### :rocket: Amélioration
- [#9010](https://github.com/1024pix/pix/pull/9010) [FEATURE] Ajouter une API interne pour récupérer la liste des features d'une organisation (PIX-12558).
- [#9044](https://github.com/1024pix/pix/pull/9044) [FEATURE][ADMIN] Ajouter une section dans l'onglet Administration pour la modification en masse d'organisations (PIX-12033).
- [#9039](https://github.com/1024pix/pix/pull/9039) [FEATURE][API] Ajouter une nouvelle route pour importer un fichier CSV pour modifier les informations d'une liste d'organisations (PIX-12032).
- [#9050](https://github.com/1024pix/pix/pull/9050) [FEATURE] Vérifier l'accessibilité des pages de Modulix (PIX-12521).
- [#9043](https://github.com/1024pix/pix/pull/9043) [FEATURE] Envoyer le composant stepper vers le client (PIX-12621).

### :building_construction: Tech
- [#9062](https://github.com/1024pix/pix/pull/9062) [TECH] Remettre la version 14.11 de postgres.

### :arrow_up: Montée de version
- [#9040](https://github.com/1024pix/pix/pull/9040) [BUMP] Update dependency @formatjs/intl-locale to v4 (orga).
- [#9054](https://github.com/1024pix/pix/pull/9054) [BUMP] Update dependency eslint-plugin-cypress to v3 (e2e).
- [#9034](https://github.com/1024pix/pix/pull/9034) [BUMP] Update dependency @embroider/webpack to v4 (mon-pix).

## v4.150.0 (27/05/2024)


### :rocket: Amélioration
- [#8998](https://github.com/1024pix/pix/pull/8998) [FEATURE] Afficher un sélecteur de participation (PIX-11643).
- [#9045](https://github.com/1024pix/pix/pull/9045) [FEATURE] Modification du wording de la modale lors du remplacement à l’import SUP (PIX-10092).

### :building_construction: Tech
- [#9035](https://github.com/1024pix/pix/pull/9035) [TECH] Éviter l'existance constante d'une raison d'abandon dans la gestion du scoring V3 (PIX-12629).

### :bug: Correction
- [#9047](https://github.com/1024pix/pix/pull/9047) [BUGFIX] Chercher les certification-challenges par date de création pour le scoring V3 (PIX-12671).
- [#9058](https://github.com/1024pix/pix/pull/9058) [BUGFIX] Corriger l'envoi de signalement depuis la correction d'une épreuve.
- [#9038](https://github.com/1024pix/pix/pull/9038) [BUGFIX] [Admin] Gérer le cas des imports OIDC Providers suivants qui produisent des 500 (PIX-12333).
- [#9049](https://github.com/1024pix/pix/pull/9049) [BUGFIX] Retire l'icône de suppression de signalement effectué en live lors d'une certif V3 (PIX-12655).

### :arrow_up: Montée de version
- [#9053](https://github.com/1024pix/pix/pull/9053) [BUMP] Update dependency npm-run-all2 to v6.2.0 (e2e).
- [#9055](https://github.com/1024pix/pix/pull/9055) [BUMP] Lock file maintenance (orga).

### :coffee: Autre
- [#9041](https://github.com/1024pix/pix/pull/9041) [FEATURES] Avoir uniquement un bouton "Je continue" pour les activités "leçon".

## v4.149.0 (24/05/2024)


### :rocket: Amélioration
- [#8992](https://github.com/1024pix/pix/pull/8992) [FEATURE] Updated translations from Phrase.
- [#9032](https://github.com/1024pix/pix/pull/9032) [FEATURE] Ajouter les modèles liés au Stepper (PIX-12620).
- [#8821](https://github.com/1024pix/pix/pull/8821) [FEATURE] Dégradation du score d'une certification non terminée (PIX-12315).
- [#9007](https://github.com/1024pix/pix/pull/9007) [FEATURE] Ajouter un stepper dans le referentiel de Modulix (PIX-12619).

### :building_construction: Tech
- [#9033](https://github.com/1024pix/pix/pull/9033) [TECH] Passe les composants de cartes et de graphiques au format GJS sur PixOrga (PIX-12647).
- [#9008](https://github.com/1024pix/pix/pull/9008) [TECH] Migrer la route POST /api/oidc/user/check-reconciliation vers src/identity-access-management (PIX-12618).
- [#8913](https://github.com/1024pix/pix/pull/8913) [TECH] Supprimer les constantes spécifiques des fournisseurs d'identité OIDC (PIX-12428).
- [#9006](https://github.com/1024pix/pix/pull/9006) [TECH] Migrer le modèle Organization.js dans src/organizational-entities/ (PIX-12606).

### :bug: Correction
- [#9001](https://github.com/1024pix/pix/pull/9001) [BUGFIX] Unifier les status et score sur la page de détails admin pour les certif v3 (PIX-12061).
- [#9000](https://github.com/1024pix/pix/pull/9000) [BUGFIX] met à jour la date dans la banniere d'info sur orga (Pix-12533).

### :arrow_up: Montée de version
- [#9031](https://github.com/1024pix/pix/pull/9031) [BUMP] Update dependency @embroider/webpack to v4 (certif).
- [#9022](https://github.com/1024pix/pix/pull/9022) [BUMP] Update dependency @1024pix/pix-ui to ^46.4.0 (admin).
- [#9027](https://github.com/1024pix/pix/pull/9027) [BUMP] Lock file maintenance (orga).

## v4.148.0 (23/05/2024)


### :rocket: Amélioration
- [#9005](https://github.com/1024pix/pix/pull/9005) [FEATURE] Passe le défi si un didactiel a été vu dans une des missions (PIX-12593).
- [#9004](https://github.com/1024pix/pix/pull/9004) [FEATURE] Ne pas jouer deux fois le didacticiel (PIX-12571).
- [#8989](https://github.com/1024pix/pix/pull/8989) [FEATURE] Montée de version ember de 4.12 à 5.8.0 (Pix-12432).
- [#8976](https://github.com/1024pix/pix/pull/8976) [FEATURE] Enchainer les activités après le didacticiel (PIX-12566).
- [#8945](https://github.com/1024pix/pix/pull/8945) [FEATURE] Permettre de rattacher un profil cible à une certification complementaire (PIX-12404).

### :building_construction: Tech
- [#8990](https://github.com/1024pix/pix/pull/8990) [TECH] Migrer les routes statistiques d'une campagne par jour / taux de réussite dans son BoundedContext (Pix-12604).
- [#8766](https://github.com/1024pix/pix/pull/8766) [TECH] Mise à jour des contextes certif (PIX-12321).
- [#8937](https://github.com/1024pix/pix/pull/8937) [TECH] Supprimer toutes les références au statut "partially" (PIX-11417).
- [#8926](https://github.com/1024pix/pix/pull/8926) [TECH] Migrer la route POST /api/oidc/token vers src/identity-access-management (PIX-12524).
- [#8967](https://github.com/1024pix/pix/pull/8967) [TECH] Ajouter des configurations pour exécuter les tests sur Webstorm.
- [#8975](https://github.com/1024pix/pix/pull/8975) [TECH] Améliorer l'orchestration du usecase `verifyAndSaveAnswer` (PIX-12456).
- [#8896](https://github.com/1024pix/pix/pull/8896) [TECH] Convertit les composants du dossier banner sur PixOrga au format GJS (PIX-12532).

### :bug: Correction
- [#8835](https://github.com/1024pix/pix/pull/8835) [BUGFIX] Réordonnancement des `fieldset` `legend` de Modulix (PIX-12382).
- [#8971](https://github.com/1024pix/pix/pull/8971) [BUGFIX] Corriger l'affichage des inputs dans la modale de gestion du compte de l'élève sur Pix Orga (PIX-12469).
- [#8954](https://github.com/1024pix/pix/pull/8954) [BUGFIX] Le InMemoryTemporaryStorage ne suit pas la TemporaryStorage API et est utilisé à tort dans les tests d'intégration (PIX-12551).
- [#8962](https://github.com/1024pix/pix/pull/8962) [BUGFIX] Ne plus envoyer de 500 lors d'une recherche par ID invalide sur 2 pages PixAdmin (PIX-12576).

### :arrow_up: Montée de version
- [#9025](https://github.com/1024pix/pix/pull/9025) [BUMP] Update dependency @embroider/webpack to v4 (orga).
- [#9026](https://github.com/1024pix/pix/pull/9026) [BUMP] Update dependency sinon to v18 (orga).
- [#9024](https://github.com/1024pix/pix/pull/9024) [BUMP] Update dependency postgres to v14.12.
- [#9023](https://github.com/1024pix/pix/pull/9023) [BUMP] Update dependency @1024pix/pix-ui to ^46.4.0 (certif).
- [#9021](https://github.com/1024pix/pix/pull/9021) [BUMP] Update dependency @1024pix/eslint-config to ^1.3.0 (orga).
- [#9020](https://github.com/1024pix/pix/pull/9020) [BUMP] Update dependency @1024pix/eslint-config to ^1.3.0 (load-testing).
- [#9019](https://github.com/1024pix/pix/pull/9019) [BUMP] Update dependency @1024pix/eslint-config to ^1.3.0 (junior).
- [#9018](https://github.com/1024pix/pix/pull/9018) [BUMP] Update dependency @1024pix/eslint-config to ^1.3.0 (dossier racine).
- [#9017](https://github.com/1024pix/pix/pull/9017) [BUMP] Update dependency @1024pix/eslint-config to ^1.3.0 (audit-logger).
- [#9015](https://github.com/1024pix/pix/pull/9015) [BUMP] Update dependency @1024pix/eslint-config to ^1.3.0 (api).
- [#9014](https://github.com/1024pix/pix/pull/9014) [BUMP] Update dependency @1024pix/eslint-config to ^1.3.0 (admin).
- [#9013](https://github.com/1024pix/pix/pull/9013) [BUMP] Update adobe/s3mock Docker tag to v3.8.0 (dossier racine).
- [#9012](https://github.com/1024pix/pix/pull/9012) [BUMP] Update adobe/s3mock Docker tag to v3.8.0 (docker).
- [#9009](https://github.com/1024pix/pix/pull/9009) [BUMP] Update adobe/s3mock Docker tag to v3.8.0 (.circleci).
- [#8965](https://github.com/1024pix/pix/pull/8965) [BUMP] Update dependency @1024pix/pix-ui to v46 (junior).
- [#8978](https://github.com/1024pix/pix/pull/8978) [BUMP] Update dependency @1024pix/pix-ui to ^46.3.1 (PIX-12609).
- [#9002](https://github.com/1024pix/pix/pull/9002) [BUMP] Update dependency @1024pix/pix-ui to ^46.4.0 (mon-pix).
- [#9003](https://github.com/1024pix/pix/pull/9003) [BUMP] Update dependency @1024pix/pix-ui to ^46.4.0 (orga).
- [#8973](https://github.com/1024pix/pix/pull/8973) [BUMP] Update dependency @embroider/webpack to v4 (junior).
- [#8999](https://github.com/1024pix/pix/pull/8999) [BUMP] Update dependency eslint-plugin-n to v17 (admin).
- [#8997](https://github.com/1024pix/pix/pull/8997) [BUMP] Update dependency @1024pix/pix-ui to ^46.3.1 (orga).
- [#8996](https://github.com/1024pix/pix/pull/8996) [BUMP] Update dependency @1024pix/pix-ui to ^46.3.1 (mon-pix).
- [#8994](https://github.com/1024pix/pix/pull/8994) [BUMP] Update dependency eslint-plugin-n to v17 (mon-pix).
- [#8991](https://github.com/1024pix/pix/pull/8991) [BUMP] Update Node.js to v20.13.1.
- [#8982](https://github.com/1024pix/pix/pull/8982) [BUMP] Update dependency @1024pix/eslint-config to ^1.3.0 (certif).
- [#8985](https://github.com/1024pix/pix/pull/8985) [BUMP] Update dependency @1024pix/eslint-config to ^1.3.0 (mon-pix).
- [#8987](https://github.com/1024pix/pix/pull/8987) [BUMP] Update dependency @1024pix/pix-ui to ^46.2.2 (mon-pix).
- [#8988](https://github.com/1024pix/pix/pull/8988) [BUMP] Update dependency @1024pix/pix-ui to ^46.2.2 (orga).
- [#8979](https://github.com/1024pix/pix/pull/8979) [BUMP] Update dependency @1024pix/eslint-config to ^1.2.13 (admin).
- [#8984](https://github.com/1024pix/pix/pull/8984) [BUMP] Update dependency @1024pix/eslint-config to ^1.2.13 (load-testing).
- [#8983](https://github.com/1024pix/pix/pull/8983) [BUMP] Update dependency @1024pix/eslint-config to ^1.2.13 (dossier racine).
- [#8981](https://github.com/1024pix/pix/pull/8981) [BUMP] Update dependency @1024pix/eslint-config to ^1.2.13 (audit-logger).
- [#8980](https://github.com/1024pix/pix/pull/8980) [BUMP] Update dependency @1024pix/eslint-config to ^1.2.13 (api).
- [#8986](https://github.com/1024pix/pix/pull/8986) [BUMP] Update dependency @1024pix/eslint-config to ^1.2.13 (orga).
- [#8970](https://github.com/1024pix/pix/pull/8970) [BUMP] Monter Ember.js en version 5 sur Pix App (PIX-12596).

## v4.147.0 (21/05/2024)


### :rocket: Amélioration
- [#8974](https://github.com/1024pix/pix/pull/8974) [FEATURE] Ajout de titre aux pages de junior.
- [#8938](https://github.com/1024pix/pix/pull/8938) [FEATURE] Active l'import élève pour les établissement scolaire du premier degré (PIX-12338).
- [#8966](https://github.com/1024pix/pix/pull/8966) [FEATURE]  Changement de style dans des page resume/result des missions (Pix-12568).
- [#8935](https://github.com/1024pix/pix/pull/8935) [FEATURE] Supprimer la colonne "grainId" de la table "element-answers" (PIX-12459).
- [#8941](https://github.com/1024pix/pix/pull/8941) [FEATURE] Rattrapage de la feature "LEARNER_IMPORT" pour les organisation sco-1d (PIX-12339).

### :building_construction: Tech
- [#8906](https://github.com/1024pix/pix/pull/8906) [TECH] Migrer la route POST /api/oidc/users vers src/identity-access-management (PIX-12503).
- [#8921](https://github.com/1024pix/pix/pull/8921) [TECH] Utiliser le composant Pixtoggle pour filtrer les campagnes que l'on souhaite voir (PIX-10467).

### :bug: Correction
- [#8947](https://github.com/1024pix/pix/pull/8947) [BUGFIX] utilise un nouveau composant pour afficher le markdown (pix-12552).
- [#8958](https://github.com/1024pix/pix/pull/8958) [BUGFIX] Le codeEcole ne s'actualise pas correctement lors des choix d'oragnisations (Pix-12569).

### :arrow_up: Montée de version
- [#8956](https://github.com/1024pix/pix/pull/8956) [BUMP] Update dependency @1024pix/pix-ui to v46 (admin).
- [#8972](https://github.com/1024pix/pix/pull/8972) [BUMP] Update dependency @1024pix/eslint-config to ^1.2.13 (junior).
- [#8969](https://github.com/1024pix/pix/pull/8969) [BUMP] Update dependency @1024pix/pix-ui to ^46.2.0 (orga).
- [#8968](https://github.com/1024pix/pix/pull/8968) [BUMP] Update dependency @1024pix/pix-ui to ^46.2.0 (mon-pix).
- [#8961](https://github.com/1024pix/pix/pull/8961) [BUMP] Update dependency @1024pix/pix-ui to ^46.0.3 (certif).
- [#8960](https://github.com/1024pix/pix/pull/8960) [BUMP] Lock file maintenance (dossier racine).
- [#8936](https://github.com/1024pix/pix/pull/8936) [BUMP] Update dependency @1024pix/pix-ui to v46 (certif) (PIX-12547).
- [#8955](https://github.com/1024pix/pix/pull/8955) [BUMP] Update dependency ember-data to v4.12.8 (certif) (PIX-12572).
- [#8934](https://github.com/1024pix/pix/pull/8934) [BUMP] Update dependency @1024pix/pix-ui to v46 (mon-pix).
- [#8953](https://github.com/1024pix/pix/pull/8953) [BUMP] Update dependency @1024pix/stylelint-config to ^5.1.14 (orga).
- [#8952](https://github.com/1024pix/pix/pull/8952) [BUMP] Update dependency @1024pix/stylelint-config to ^5.1.14 (mon-pix).
- [#8951](https://github.com/1024pix/pix/pull/8951) [BUMP] Update dependency @1024pix/stylelint-config to ^5.1.14 (junior).
- [#8949](https://github.com/1024pix/pix/pull/8949) [BUMP] Update dependency @1024pix/stylelint-config to ^5.1.14 (certif).
- [#8948](https://github.com/1024pix/pix/pull/8948) [BUMP] Update dependency @1024pix/stylelint-config to ^5.1.14 (admin).
- [#8946](https://github.com/1024pix/pix/pull/8946) [BUMP] Update dependency @1024pix/pix-ui to ^46.0.3 (orga).

## v4.146.0 (16/05/2024)


### :rocket: Amélioration
- [#8930](https://github.com/1024pix/pix/pull/8930) [FEATURE] Ajout du support de Typescript sur PixOrga (PIX-12474).

### :building_construction: Tech
- [#8511](https://github.com/1024pix/pix/pull/8511) [TECH] Ajoute un ADR sur la communication entre bounded contexts.
- [#8931](https://github.com/1024pix/pix/pull/8931) [TECH] sépare le usecase de remplacement des learner (Pix-12529).
- [#8918](https://github.com/1024pix/pix/pull/8918) [TECH] découpe le use case d'import de learner sup (Pix-11942).
- [#8827](https://github.com/1024pix/pix/pull/8827) [TECH] Petit refacto du mail-service pour la gestion de la langue (PIX-12193).

### :bug: Correction
- [#8943](https://github.com/1024pix/pix/pull/8943) [BUGFIX] Passer à l'étape suivante même lorsque le didacticiel a été joué (Pix-12548).
- [#8917](https://github.com/1024pix/pix/pull/8917) [BUGFIX] Enchainement effectif des étapes d'une mission (PIX-12489).

### :arrow_up: Montée de version
- [#8927](https://github.com/1024pix/pix/pull/8927) [BUMP] Update dependency node to v20.13.1.
- [#8933](https://github.com/1024pix/pix/pull/8933) [BUMP] Update dependency @1024pix/stylelint-config to ^5.1.13 (orga).
- [#8929](https://github.com/1024pix/pix/pull/8929) [BUMP] Update dependency @1024pix/stylelint-config to ^5.1.13 (mon-pix).
- [#8928](https://github.com/1024pix/pix/pull/8928) [BUMP] Update dependency @1024pix/stylelint-config to ^5.1.13 (junior).
- [#8923](https://github.com/1024pix/pix/pull/8923) [BUMP] Lock file maintenance (mon-pix).
- [#8924](https://github.com/1024pix/pix/pull/8924) [BUMP] Lock file maintenance (api).

### :coffee: Autre
- [#8932](https://github.com/1024pix/pix/pull/8932) [FEATURES] Renommage de pix 1d en Pix Junior dans le front de l'application.

## v4.145.0 (15/05/2024)


### :rocket: Amélioration
- [#8848](https://github.com/1024pix/pix/pull/8848) [FEATURE] Afficher si le centre de certification est pilote certification seule dans Pix Admin (PIX-12441).
- [#8907](https://github.com/1024pix/pix/pull/8907) [FEATURE] Ajouter une nouvelle categorie pour les Profil Cible Pix+ (PIX-12429).
- [#8792](https://github.com/1024pix/pix/pull/8792) [FEATURE] Amélioration de la formule de score pour simulateurs (PIX-12316).
- [#8880](https://github.com/1024pix/pix/pull/8880) [FEATURE] Pix App : Arrêt du support des Elements dans les modules (PIX-12455).
- [#8887](https://github.com/1024pix/pix/pull/8887) [FEATURE] Ajout d'une bannière avec le code Mission dans Pix Orga (Pix-12444).

### :building_construction: Tech
- [#8916](https://github.com/1024pix/pix/pull/8916) [TECH] Corrige la parallélisation des tests front sur la CI.
- [#8914](https://github.com/1024pix/pix/pull/8914) [TECH] Migrer la route /api/campaigns/{id}/divisions dans son Bounded Context (Pix-12517).
- [#8919](https://github.com/1024pix/pix/pull/8919) [TECH] Parallélise l'exécution des tests d'acceptance de l'API sur la CI.
- [#8915](https://github.com/1024pix/pix/pull/8915) [TECH] :recycle: Construit l'URL pour pix junior depuis l'URL courante plutôt qu'une variable .
- [#8845](https://github.com/1024pix/pix/pull/8845) [TECH] Ajouter une valeur par défaut pour LOG_ENABLED.

### :bug: Correction
- [#8909](https://github.com/1024pix/pix/pull/8909) [BUGFIX] Ne plus envoyer le hasComplementaryReferential lors de l'ajout d'un candidat avec certification complémentaire sur Pix Certif (PIX-12491).

### :arrow_up: Montée de version
- [#8925](https://github.com/1024pix/pix/pull/8925) [BUMP] Update Node.js to v20.13.0.
- [#8819](https://github.com/1024pix/pix/pull/8819) [BUMP] Update dependency ember-data to v4.12.7 (certif).
- [#8922](https://github.com/1024pix/pix/pull/8922) [BUMP] Update dependency @1024pix/stylelint-config to ^5.1.13 (certif).
- [#8920](https://github.com/1024pix/pix/pull/8920) [BUMP] Update dependency @1024pix/stylelint-config to ^5.1.13 (admin).
- [#8904](https://github.com/1024pix/pix/pull/8904) [BUMP] Update dependency @1024pix/pix-ui to v46 (orga) (PIX-12492).
- [#8911](https://github.com/1024pix/pix/pull/8911) [BUMP] Update dependency @1024pix/pix-ui to ^45.5.2 (junior).
- [#8912](https://github.com/1024pix/pix/pull/8912) [BUMP] Update dependency @1024pix/pix-ui to ^45.5.2 (orga).
- [#8908](https://github.com/1024pix/pix/pull/8908) [BUMP] Update nginx Docker tag to v1.26.0.

## v4.144.0 (14/05/2024)


### :rocket: Amélioration
- [#8871](https://github.com/1024pix/pix/pull/8871) [FEATURE] Permettre l'activation de fonctionnalité en masse sur les organisations (PIX-12413).
- [#8882](https://github.com/1024pix/pix/pull/8882) [FEATURE] Utiliser l'attribut `isDisabled` des PixCheckbox et PixRadioButton (PIX-12471).

### :building_construction: Tech
- [#8910](https://github.com/1024pix/pix/pull/8910) [TECH] [Admin] Ne pas exécuter un test flaky de "Integration | Component | administration/organizations-import".

### :bug: Correction
- [#8843](https://github.com/1024pix/pix/pull/8843) [BUGFIX] Réparer l'alignement des labels des épreuves (PIX-12438).
- [#8898](https://github.com/1024pix/pix/pull/8898) [BUGFIX] Rendre visible les checkboxs dont le label est masqué sur Pix Certif (PIX-12482).

### :arrow_up: Montée de version
- [#8905](https://github.com/1024pix/pix/pull/8905) [BUMP] Update dependency node to v20.13.0.
- [#8903](https://github.com/1024pix/pix/pull/8903) [BUMP] Update adobe/s3mock Docker tag to v3.7.3 (dossier racine).
- [#8894](https://github.com/1024pix/pix/pull/8894) [BUMP] Update dependency @1024pix/eslint-config to ^1.2.12 (dossier racine).
- [#8901](https://github.com/1024pix/pix/pull/8901) [BUMP] Update dependency @1024pix/pix-ui to ^45.5.2 (admin).
- [#8900](https://github.com/1024pix/pix/pull/8900) [BUMP] Update dependency @1024pix/eslint-config to ^1.2.12 (orga).

## v4.143.0 (13/05/2024)


### :rocket: Amélioration
- [#8670](https://github.com/1024pix/pix/pull/8670) [FEATURE] Afficher les étapes de Smart Random® dans le simulateur (PIX-11562).
- [#8831](https://github.com/1024pix/pix/pull/8831) [FEATURE] Mettre à jour le lien de redirection vers le centre d'aide sur Pix Certif (PIX-12405).
- [#8829](https://github.com/1024pix/pix/pull/8829) [FEATURE] Conditionner l'affichage du bloc en fonction de si la complémentaire sélectionnée possède un référentiel externe (PIX-12215).
- [#8861](https://github.com/1024pix/pix/pull/8861) [FEATURE] Désactiver les champs de réponses et les embed après avoir répondu (Pix-12425).
- [#8837](https://github.com/1024pix/pix/pull/8837) [FEATURE] Arrêt du support des Elements et migration vers Components dans les modules (PIX-12454).

### :building_construction: Tech
- [#8868](https://github.com/1024pix/pix/pull/8868) [TECH] Renomme le répertoire 1d en junior (PIX-12326).
- [#8863](https://github.com/1024pix/pix/pull/8863) [TECH] Migrer la route GET /api/oidc/authorization-url vers src/identity-access-management (PIX-12452).
- [#8864](https://github.com/1024pix/pix/pull/8864) [TECH] Construit l'application 1d dans le répertoire junior.
- [#8859](https://github.com/1024pix/pix/pull/8859) [TECH] Migrer la route GET /api/oidc/redirect-logout-url vers src/identity-access-management (PIX-12450).
- [#8620](https://github.com/1024pix/pix/pull/8620) [TECH] Protège de commit sur la branche dev via Husky.
- [#8858](https://github.com/1024pix/pix/pull/8858) [TECH] Migrer la route GET /api/oidc/identity-providers vers src/identity-access-management (PIX-12446).
- [#8851](https://github.com/1024pix/pix/pull/8851) [TECH] Migrer la route GET /api/admin/oidc/identity-providers vers src/identity-access-management (PIX-12435).
- [#8857](https://github.com/1024pix/pix/pull/8857) [TECH] Montée de version de ember-source et ember-data en 5+ (PIX-12408).
- [#8852](https://github.com/1024pix/pix/pull/8852) [TECH] Renommer la variable emitOpsEventEachSeconds.
- [#8836](https://github.com/1024pix/pix/pull/8836) [TECH] Déplacer la route /api/campaign/{campaignId}/divisions dans son BC (PIX-12423).
- [#8754](https://github.com/1024pix/pix/pull/8754) [TECH] Ajoute la certification complementaire PRO_SANTE (PIX-12284).
- [#8697](https://github.com/1024pix/pix/pull/8697) [TECH] Remise à jour de la config `docker compose`.
- [#8844](https://github.com/1024pix/pix/pull/8844) [TECH] Supprimer les propriétés de configuration des SSO OIDC devenues inutiles (PIX-12439).
- [#8833](https://github.com/1024pix/pix/pull/8833) [TECH] Utiliser le service générique pour les services OIDC non-spécifiques (PIX-10193).

### :bug: Correction
- [#8895](https://github.com/1024pix/pix/pull/8895) [BUGFIX] Le texte alternatif des épreuves ne s'affichait pas si c'était null (PIX-12479).
- [#8849](https://github.com/1024pix/pix/pull/8849) [BUGFIX] Corriger l'alignement de la tooltip des crédits (PIX-12443).

### :arrow_up: Montée de version
- [#8899](https://github.com/1024pix/pix/pull/8899) [BUMP] Update dependency @1024pix/eslint-config to ^1.2.12 (mon-pix).
- [#8897](https://github.com/1024pix/pix/pull/8897) [BUMP] Update dependency @1024pix/eslint-config to ^1.2.12 (load-testing).
- [#8893](https://github.com/1024pix/pix/pull/8893) [BUMP] Update dependency @1024pix/eslint-config to ^1.2.12 (certif).
- [#8889](https://github.com/1024pix/pix/pull/8889) [BUMP] Update dependency @1024pix/eslint-config to ^1.2.12 (api).
- [#8890](https://github.com/1024pix/pix/pull/8890) [BUMP] Update dependency @1024pix/eslint-config to ^1.2.12 (audit-logger).
- [#8883](https://github.com/1024pix/pix/pull/8883) [BUMP] Update adobe/s3mock Docker tag to v3.7.3 (.circleci).
- [#8886](https://github.com/1024pix/pix/pull/8886) [BUMP] Update dependency @1024pix/eslint-config to ^1.2.12 (admin).
- [#8885](https://github.com/1024pix/pix/pull/8885) [BUMP] Update dependency @1024pix/eslint-config to ^1.2.12 (1d).
- [#8884](https://github.com/1024pix/pix/pull/8884) [BUMP] Update adobe/s3mock Docker tag to v3.7.3 (docker).
- [#8879](https://github.com/1024pix/pix/pull/8879) [BUMP] Update adobe/s3mock Docker tag to v3.7.2 (docker).
- [#8878](https://github.com/1024pix/pix/pull/8878) [BUMP] Update adobe/s3mock Docker tag to v3.7.2 (.circleci).
- [#8877](https://github.com/1024pix/pix/pull/8877) [BUMP] Update dependency redis to v7.2.4.
- [#8876](https://github.com/1024pix/pix/pull/8876) [BUMP] Update dependency @1024pix/stylelint-config to ^5.1.12 (orga).
- [#8873](https://github.com/1024pix/pix/pull/8873) [BUMP] Update dependency @1024pix/stylelint-config to ^5.1.12 (admin).
- [#8875](https://github.com/1024pix/pix/pull/8875) [BUMP] Update dependency @1024pix/stylelint-config to ^5.1.12 (mon-pix).
- [#8874](https://github.com/1024pix/pix/pull/8874) [BUMP] Update dependency @1024pix/stylelint-config to ^5.1.12 (certif).
- [#8870](https://github.com/1024pix/pix/pull/8870) [BUMP] Update dependency @1024pix/pix-ui to ^45.5.0 (admin).
- [#8872](https://github.com/1024pix/pix/pull/8872) [BUMP] Update dependency @1024pix/stylelint-config to ^5.1.12 (1d).
- [#8869](https://github.com/1024pix/pix/pull/8869) [BUMP] Update dependency @1024pix/pix-ui to ^45.4.4 (1d).
- [#8867](https://github.com/1024pix/pix/pull/8867) [BUMP] Update dependency @1024pix/eslint-config to ^1.2.11 (orga).
- [#8853](https://github.com/1024pix/pix/pull/8853) [BUMP] Update dependency @1024pix/eslint-config to ^1.2.11 (api).
- [#8866](https://github.com/1024pix/pix/pull/8866) [BUMP] Update dependency @1024pix/eslint-config to ^1.2.11 (mon-pix).
- [#8865](https://github.com/1024pix/pix/pull/8865) [BUMP] Update dependency @1024pix/eslint-config to ^1.2.11 (load-testing).
- [#8856](https://github.com/1024pix/pix/pull/8856) [BUMP] Update dependency @1024pix/eslint-config to ^1.2.11 (dossier racine).
- [#8860](https://github.com/1024pix/pix/pull/8860) [BUMP] Update dependency @1024pix/pix-ui to ^45.4.2 (1d).
- [#8855](https://github.com/1024pix/pix/pull/8855) [BUMP] Update dependency @1024pix/eslint-config to ^1.2.11 (certif).
- [#8854](https://github.com/1024pix/pix/pull/8854) [BUMP] Update dependency @1024pix/eslint-config to ^1.2.11 (audit-logger).
- [#8847](https://github.com/1024pix/pix/pull/8847) [BUMP] Update dependency @1024pix/eslint-config to ^1.2.11 (admin).
- [#8846](https://github.com/1024pix/pix/pull/8846) [BUMP] Update dependency @1024pix/eslint-config to ^1.2.11 (1d).
- [#8839](https://github.com/1024pix/pix/pull/8839) [BUMP] Update dependency @1024pix/pix-ui to ^45.4.1 (admin).
- [#8526](https://github.com/1024pix/pix/pull/8526) [BUMP] Update dependency @1024pix/pix-ui to v45 (1d) (PIX-12415).

### :coffee: Autre
- [#8888](https://github.com/1024pix/pix/pull/8888) [TYPO] Correction d'une petite typo dans la page de création d'une orga.

## v4.142.0 (06/05/2024)


### :rocket: Amélioration
- [#8798](https://github.com/1024pix/pix/pull/8798) [FEATURE] Conditionner l'affichage de la séparation pix/pix+ dans la modale d'ajout de candidat sur Pix Certif (PIX-12214).
- [#8828](https://github.com/1024pix/pix/pull/8828) [FEATURE] ajoute une route pour récupérer les participations d'un prescrit à une campagne (PIX-11638).
- [#8832](https://github.com/1024pix/pix/pull/8832) [FEATURE] Retirer l'enquête Sco dans le bandeau du dashboard (PIX-12345).
- [#8826](https://github.com/1024pix/pix/pull/8826) [FEATURE] Affiche les épreuves contenant des illustrations/embed et un formulaire sur 2 colonnes (PIX-11513).
- [#8823](https://github.com/1024pix/pix/pull/8823) [FEATURE] Supporter l'affichage des `components` (PIX-12364) (PIX-12023).

### :building_construction: Tech
- [#8830](https://github.com/1024pix/pix/pull/8830) [TECH] Ajouter un test manquant sur les custom required claims (PIX-12401).
- [#8834](https://github.com/1024pix/pix/pull/8834) [TECH] Déplacer la route `/api/admin/target-profiles/{id}/detach-organizations` dans son BC (Pix-12422).
- [#8742](https://github.com/1024pix/pix/pull/8742) [TECH] Migrer les erreurs du domaine Evaluation (PIX-12295).
- [#8793](https://github.com/1024pix/pix/pull/8793) [TECH] Monter la version de pix-ui.
- [#8751](https://github.com/1024pix/pix/pull/8751) [TECH] Ajout de la colonne de typage des souscriptions à une certification (PIX-1221).

### :bug: Correction
- [#8807](https://github.com/1024pix/pix/pull/8807) [BUGFIX][MON-PIX] Modifier l'URL du bandeau de politique de protection des données en néerlandais qui s'affiche lorsqu'elle a été modifié (PIX-11707).
- [#8824](https://github.com/1024pix/pix/pull/8824) [BUGFIX] Permettre de contribuer des CFs anglophone (PIX-12348).

### :arrow_up: Montée de version
- [#8840](https://github.com/1024pix/pix/pull/8840) [BUMP] Update dependency @1024pix/pix-ui to ^45.4.1 (certif).
- [#8838](https://github.com/1024pix/pix/pull/8838) [BUMP] Update dependency @1024pix/pix-ui to ^45.4.1 (mon-pix).

### :coffee: Autre
- [#8803](https://github.com/1024pix/pix/pull/8803) [ORGA] Afficher le décompte des places dans le header de l'application (PIX-12246).

## v4.141.0 (02/05/2024)


### :rocket: Amélioration
- [#8822](https://github.com/1024pix/pix/pull/8822) [FEATURE] Corrections de mise en forme et de traductions de "compétences" (PIX-12407).
- [#8756](https://github.com/1024pix/pix/pull/8756) [FEATURE] Masquer les indices dans l'activité finale qroc. Module bien-ecrire-son-adresse-mail (MODC-83).
- [#8796](https://github.com/1024pix/pix/pull/8796) [FEATURE] Ajouter components à notre Module Serializer (PIX-12300).
- [#8789](https://github.com/1024pix/pix/pull/8789) [FEATURE][ADMIN] Ajouter l'espagnol dans la liste des langues disponibles (PIX-12196).

### :building_construction: Tech
- [#8825](https://github.com/1024pix/pix/pull/8825) [TECH] Fusion des domaines UserAccount et Authentication en IdentityAccessManagement (PIX-12399).
- [#8777](https://github.com/1024pix/pix/pull/8777) [TECH] Migrer tous les services OIDC vers src/authentication (PIX-10194).
- [#8811](https://github.com/1024pix/pix/pull/8811) [TECH] migrer la route `/api/admin/target-profiles/{id}/attach-organizations` dans le BC prescription (PIX-12379).
- [#8804](https://github.com/1024pix/pix/pull/8804) [TECH] Corriger l'unicité des requiredClaims (PIX-12368).
- [#8799](https://github.com/1024pix/pix/pull/8799) [TECH] Migrer la liste des campagnes dans PixAdmin dans le Bounded context Prescription  (PIX-12358).
- [#8808](https://github.com/1024pix/pix/pull/8808) [TECH] Migrer `/api/admin/organizations/{id}/attach-target-profiles` dans le BC Prescription (PIX-12369).
- [#8630](https://github.com/1024pix/pix/pull/8630) [TECH] :recycle: Déplacement des fichiers utilitaires pour `ODS` vers `src/shared`.
- [#8761](https://github.com/1024pix/pix/pull/8761) [TECH] Supprimer l'utilisation du custom logoutUrlTemporaryStorage (PIX-12119).
- [#8683](https://github.com/1024pix/pix/pull/8683) [TECH] Utiliser l'API interne pour récupérer les organization-learners (Pix-12134).
- [#8505](https://github.com/1024pix/pix/pull/8505) [TECH] :recycle:  Déplacement du model `Organization` vers `src/shared`.

### :bug: Correction
- [#8755](https://github.com/1024pix/pix/pull/8755) [BUGFIX] Afficher le message d'erreur correct pour un utilisateur qui s'inscrit sur PixOrga avec un email déjà connu (PIX-11342).
- [#8752](https://github.com/1024pix/pix/pull/8752) [BUGFIX] Vérifier la présence d'un doublon de session uniquement dans le centre de certification courant lors de l'import en masse sur Pix Certif (PIX-11930).

### :arrow_up: Montée de version
- [#8818](https://github.com/1024pix/pix/pull/8818) [BUMP] Update dependency @1024pix/stylelint-config to ^5.1.10 (orga).
- [#8817](https://github.com/1024pix/pix/pull/8817) [BUMP] Update dependency @1024pix/stylelint-config to ^5.1.10 (mon-pix).
- [#8816](https://github.com/1024pix/pix/pull/8816) [BUMP] Update dependency @1024pix/stylelint-config to ^5.1.10 (certif).
- [#8815](https://github.com/1024pix/pix/pull/8815) [BUMP] Update dependency @1024pix/stylelint-config to ^5.1.10 (admin).
- [#8814](https://github.com/1024pix/pix/pull/8814) [BUMP] Update dependency @1024pix/stylelint-config to ^5.1.10 (1d).
- [#8812](https://github.com/1024pix/pix/pull/8812) [BUMP] Update dependency @1024pix/eslint-config to ^1.2.10 (mon-pix).
- [#8813](https://github.com/1024pix/pix/pull/8813) [BUMP] Update dependency @1024pix/eslint-config to ^1.2.10 (orga).
- [#8810](https://github.com/1024pix/pix/pull/8810) [BUMP] Update dependency @1024pix/eslint-config to ^1.2.10 (load-testing).
- [#8809](https://github.com/1024pix/pix/pull/8809) [BUMP] Update dependency @1024pix/eslint-config to ^1.2.10 (dossier racine).
- [#8806](https://github.com/1024pix/pix/pull/8806) [BUMP] Update dependency @1024pix/eslint-config to ^1.2.10 (certif).
- [#8805](https://github.com/1024pix/pix/pull/8805) [BUMP] Update dependency @1024pix/eslint-config to ^1.2.10 (audit-logger).
- [#8802](https://github.com/1024pix/pix/pull/8802) [BUMP] Update dependency @1024pix/eslint-config to ^1.2.10 (api).

## v4.140.0 (30/04/2024)


### :rocket: Amélioration
- [#8797](https://github.com/1024pix/pix/pull/8797) [FEATURE]: ajoute une bannière d'alerte en cas de dépassement du nombre de place (PIX-12441).
- [#8791](https://github.com/1024pix/pix/pull/8791) [FEATURE] ajoute un bloc de definition des places (PIX-12245).
- [#8790](https://github.com/1024pix/pix/pull/8790) [FEATURE] Ajouter la notion de component dans nos modèles métiers (PIX-12299).
- [#8758](https://github.com/1024pix/pix/pull/8758) [FEATURE] Traduction des emails et pixApp en espagnol (PIX-12341).
- [#8711](https://github.com/1024pix/pix/pull/8711) [FEATURE] Création de la page de simulation de scoring V3 (PIX-11995).
- [#8784](https://github.com/1024pix/pix/pull/8784) [FEATURE] Ajout d'une transcription. Module principes-fondateurs-wikipedia (MODC-74).
- [#8734](https://github.com/1024pix/pix/pull/8734) [FEATURE] [ADMIN] Ajouter une nouvelle action pour importer une liste de configuration SSO OIDC (PIX-11984).
- [#8738](https://github.com/1024pix/pix/pull/8738) [FEATURE] Bloquer le rattachement de résultat thématique non certifiants à une certification complémentaire lors d'un versionning sur Pix Admin (PIX-12272).
- [#8710](https://github.com/1024pix/pix/pull/8710) [FEATURE] Migrer vers nouveau nom de la table de souscriptions (PIX-12230).
- [#8726](https://github.com/1024pix/pix/pull/8726) [FEATURE] Gérer la langue espagnol lors de l'envoi de certains e-mails (PIX-12194).

### :building_construction: Tech
- [#8795](https://github.com/1024pix/pix/pull/8795) [TECH] :recycle:  déplace `/api/admin/target-profiles/{id}/copy-organizations` dans le bounded context.
- [#8763](https://github.com/1024pix/pix/pull/8763) [TECH] Avoir des recommandations de CFs par défaut dans les seeds DevComp (PIX-12180).
- [#8760](https://github.com/1024pix/pix/pull/8760) [TECH] Ajouter le format Onde (Pix-11618).
- [#8572](https://github.com/1024pix/pix/pull/8572) [TECH] Unifier le fonctionnement des jobs de la CI (PIX-11947).
- [#8785](https://github.com/1024pix/pix/pull/8785) [TECH] Migrer la route campaign collective results vers son Bounded Context (PIX-12332).
- [#8762](https://github.com/1024pix/pix/pull/8762) [TECH] Migrer la route campaign vers son Bounded Context (PIX-12323).
- [#8731](https://github.com/1024pix/pix/pull/8731) [TECH] Remplacer les "contains" dans les tests par des méthodes de testingLibrary (PIX-12268).

### :bug: Correction
- [#8759](https://github.com/1024pix/pix/pull/8759) [BUGFIX] Corriger l'erreur 500 lors du rejet d'une certification pour une certification antérieure aux configuration de scoring.

### :arrow_up: Montée de version
- [#8801](https://github.com/1024pix/pix/pull/8801) [BUMP] Update dependency @1024pix/eslint-config to ^1.2.10 (admin).
- [#8800](https://github.com/1024pix/pix/pull/8800) [BUMP] Update dependency @1024pix/eslint-config to ^1.2.10 (1d).
- [#8794](https://github.com/1024pix/pix/pull/8794) [BUMP] Replace dependency eslint-config-standard-with-typescript with eslint-config-love ^43.1.0 (audit-logger).
- [#8745](https://github.com/1024pix/pix/pull/8745) [BUMP] Update dependency @1024pix/stylelint-config to ^5.1.9 (certif).
- [#8786](https://github.com/1024pix/pix/pull/8786) [BUMP] Update dependency @1024pix/eslint-config to ^1.2.8 (dossier racine).
- [#8787](https://github.com/1024pix/pix/pull/8787) [BUMP] Update dependency @1024pix/eslint-config to ^1.2.8 (load-testing).
- [#8769](https://github.com/1024pix/pix/pull/8769) [BUMP] Update dependency @1024pix/eslint-config to ^1.2.8 (1d).
- [#8783](https://github.com/1024pix/pix/pull/8783) [BUMP] Update dependency @1024pix/eslint-config to ^1.2.8 (orga).
- [#8780](https://github.com/1024pix/pix/pull/8780) [BUMP] Update dependency @1024pix/eslint-config to ^1.2.8 (audit-logger).
- [#8781](https://github.com/1024pix/pix/pull/8781) [BUMP] Update dependency @1024pix/eslint-config to ^1.2.8 (certif).
- [#8782](https://github.com/1024pix/pix/pull/8782) [BUMP] Update dependency @1024pix/eslint-config to ^1.2.8 (mon-pix).
- [#8773](https://github.com/1024pix/pix/pull/8773) [BUMP] Update dependency @1024pix/eslint-config to ^1.2.6 (dossier racine).
- [#8779](https://github.com/1024pix/pix/pull/8779) [BUMP] Update dependency @1024pix/eslint-config to ^1.2.8 (api).
- [#8778](https://github.com/1024pix/pix/pull/8778) [BUMP] Update dependency @1024pix/eslint-config to ^1.2.8 (admin).
- [#8774](https://github.com/1024pix/pix/pull/8774) [BUMP] Update dependency @1024pix/eslint-config to ^1.2.6 (load-testing).
- [#8775](https://github.com/1024pix/pix/pull/8775) [BUMP] Update dependency @1024pix/eslint-config to ^1.2.6 (mon-pix).
- [#8776](https://github.com/1024pix/pix/pull/8776) [BUMP] Update dependency @1024pix/eslint-config to ^1.2.6 (orga).
- [#8772](https://github.com/1024pix/pix/pull/8772) [BUMP] Update dependency @1024pix/eslint-config to ^1.2.6 (certif).
- [#8771](https://github.com/1024pix/pix/pull/8771) [BUMP] Update dependency @1024pix/eslint-config to ^1.2.6 (audit-logger).
- [#8770](https://github.com/1024pix/pix/pull/8770) [BUMP] Update dependency @1024pix/eslint-config to ^1.2.6 (admin).
- [#8767](https://github.com/1024pix/pix/pull/8767) [BUMP] Update dependency @1024pix/eslint-config to ^1.2.6 (api).
- [#8765](https://github.com/1024pix/pix/pull/8765) [BUMP] Update dependency @1024pix/stylelint-config to ^5.1.9 (1d).
- [#8764](https://github.com/1024pix/pix/pull/8764) [BUMP] Update Node.js to v20.12.2.

## v4.139.0 (26/04/2024)


### :rocket: Amélioration
- [#8757](https://github.com/1024pix/pix/pull/8757) [FEATURE] Modifier les trads du titre du bloc d'erreur d'import et ajouter une marge en dessous (PIX-12291).
- [#8739](https://github.com/1024pix/pix/pull/8739) [FEATURE] Ajout des fichiers codeowners de la team Accès .
- [#8531](https://github.com/1024pix/pix/pull/8531) [FEATURE] PIX1D - Utilisation du nouveau robot avec des émotions (PIX-11578).
- [#8741](https://github.com/1024pix/pix/pull/8741) [FEATURE] Ajouter la notion des `components` dans le didacticiel (PIX-12298).
- [#8617](https://github.com/1024pix/pix/pull/8617) [FEATURE][API] Utiliser la base de données pour créer les services de type "OidcAuthentication" (PIX-10192).
- [#8722](https://github.com/1024pix/pix/pull/8722) [FEATURE] Permettre l'import de fichier ONDE (Pix-12248).

### :building_construction: Tech
- [#8735](https://github.com/1024pix/pix/pull/8735) [TECH] Organiser les répertoires des composants de challenge de Pix app (PIX-12283).
- [#8737](https://github.com/1024pix/pix/pull/8737) [TECH] Migrer le serializer de correction vers le dossier Evaluation (PIX-12292).
- [#8733](https://github.com/1024pix/pix/pull/8733) [TECH] créer un composant `ImportCard` dans le quel on peut injecter du contenu (PIX-12267).

### :bug: Correction
- [#8753](https://github.com/1024pix/pix/pull/8753) [BUGFIX] Faire la redirection vers application avant de faire le reload d'un user (pix-12322).
- [#8740](https://github.com/1024pix/pix/pull/8740) [BUGFIX] Petits correctifs graphiques Modulix (PIX-12304).

### :arrow_up: Montée de version
- [#8749](https://github.com/1024pix/pix/pull/8749) [BUMP] Update dependency @1024pix/pix-ui to ^45.1.3 (certif).
- [#8747](https://github.com/1024pix/pix/pull/8747) [BUMP] Update dependency @1024pix/stylelint-config to ^5.1.9 (orga).
- [#8748](https://github.com/1024pix/pix/pull/8748) [BUMP] Update dependency @1024pix/pix-ui to ^45.1.3 (admin).
- [#8750](https://github.com/1024pix/pix/pull/8750) [BUMP] Update dependency @1024pix/pix-ui to ^45.1.3 (orga).
- [#8746](https://github.com/1024pix/pix/pull/8746) [BUMP] Update dependency @1024pix/stylelint-config to ^5.1.9 (mon-pix).
- [#8744](https://github.com/1024pix/pix/pull/8744) [BUMP] Update dependency @1024pix/stylelint-config to ^5.1.9 (admin).
- [#8743](https://github.com/1024pix/pix/pull/8743) [BUMP] Update dependency node to v20.12.2.

### :coffee: Autre
- [#8717](https://github.com/1024pix/pix/pull/8717) [FEATURES]  Ajout de la mécanique d'étape  et de ses successions (PIX-11702).

## v4.138.0 (25/04/2024)


### :rocket: Amélioration
- [#8703](https://github.com/1024pix/pix/pull/8703) [FEATURE] Empêcher le passage d'un centre de certification en V3 s'il est pilote de la feature de Séparation Pix/Pix+ (PIX-12140).
- [#8729](https://github.com/1024pix/pix/pull/8729) [FEATURE][APP] Permettre l'affichage de l'application en espagnol (PIX-12195).
- [#8675](https://github.com/1024pix/pix/pull/8675) [FEATURE] Rend stoppable les jobs de validation et d'import pour SIECLE (PIX-12017).

### :bug: Correction
- [#8730](https://github.com/1024pix/pix/pull/8730) [BUGFIX] Petites corrections pour faire fonctionner l'import ONDE (Pix-12275).
- [#8666](https://github.com/1024pix/pix/pull/8666) [BUGFIX] Empêcher la souscription à une certification complémentaire lors de l'import de masse des sessions lorsque le centre ne possède pas les habilitations nécessaires (PIX-11928).

## v4.137.0 (24/04/2024)


### :rocket: Amélioration
- [#8727](https://github.com/1024pix/pix/pull/8727) [FEATURE] Ajouter des tests e2e sur les pages élèves/étudiants pour vérifier l'affichage en tant que membre (PIX-12270).
- [#8651](https://github.com/1024pix/pix/pull/8651) [FEATURE] Simulateur de score et de capacité de certification V3 (PIX-11993).
- [#8718](https://github.com/1024pix/pix/pull/8718) [FEATURE][API] Ajouter un nouvel endpoint pour importer une liste de configuration SSO OIDC (PIX-11983).
- [#8719](https://github.com/1024pix/pix/pull/8719) [FEATURE] Ajouter des fichiers de traductions pour la langue espagnol sur Pix Api et Pix App (PIX-12189).
- [#8663](https://github.com/1024pix/pix/pull/8663) [FEATURE] Ajouter Pro Santé Connect comme fournisseur d'identité (PIX-12081).
- [#8720](https://github.com/1024pix/pix/pull/8720) [FEATURE] Change l'ordre de la methode find et ajoute l'organizationId sur la méthode get du organizationLearnersRepository (PIX-12255).

### :building_construction: Tech
- [#8728](https://github.com/1024pix/pix/pull/8728) [TECH] Ajouter une fonction pour rafraîchir la vue "view-active-organization-learners" (PIX-12273).
- [#8715](https://github.com/1024pix/pix/pull/8715) [TECH] Les scripts de certification n'attendent pas certaines Promises (PIX-12244).
- [#8721](https://github.com/1024pix/pix/pull/8721) [TECH] Mentionner "Pro" pour la certification complémentaire Pix+ Pro Santé (PIX-12260).
- [#8724](https://github.com/1024pix/pix/pull/8724) [TECH] Modifier le fichier de configuration de Phrase (PIX-12190).
- [#8659](https://github.com/1024pix/pix/pull/8659) [TECH] Mettre à jour les seeds pour l'import ONDE (Pix-12133).
- [#8706](https://github.com/1024pix/pix/pull/8706) [TECH] Déplacer l'archivage des campagnes de PixAdmin dans le BC prescription (Pix-12238).

### :bug: Correction
- [#8723](https://github.com/1024pix/pix/pull/8723) [BUGFIX] Sur Pix Junior, afficher la mission comme terminée quand l'utilisateur l'a déjà terminée (PIX-12276).

## v4.136.0 (22/04/2024)


### :rocket: Amélioration
- [#8708](https://github.com/1024pix/pix/pull/8708) [FEATURE] Générer une prévisualisation des modules pour la contribution (PIX-12132).
- [#8712](https://github.com/1024pix/pix/pull/8712) [FEATURE] Ajouter Pix+ Santé dans les certifications complémentaires possible lors de l'import de candidat via ODS (PIX-12232).
- [#8665](https://github.com/1024pix/pix/pull/8665) [FEATURE] Corrections mineures sur le module adresse-ip-publique-et-vous.
- [#8690](https://github.com/1024pix/pix/pull/8690) [FEATURE] Permettre la modification d'un critère d'obtention de RT sur l'ensemble du PF (PIX-12157).
- [#8705](https://github.com/1024pix/pix/pull/8705) [FEATURE] Ajout du lien vers la page Status dans pixOrga (pix-12226).
- [#8704](https://github.com/1024pix/pix/pull/8704) [FEATURE] Ajouter la mention "PIX" à "J'ai déjà un compte" sur les doubles mires de connexion (PIX-12048).
- [#8702](https://github.com/1024pix/pix/pull/8702) [FEATURE] Renommer les customProperties en additionalRequiredProperties (PIX-12209).

### :building_construction: Tech
- [#8685](https://github.com/1024pix/pix/pull/8685) [TECH] Migrer l'envoi d'invitation dans un centre de certif depuis Pix Admin dans src (PIX-12168).
- [#8707](https://github.com/1024pix/pix/pull/8707) [TECH] Modifier l'export du cryptoService (PIX-12228).
- [#8700](https://github.com/1024pix/pix/pull/8700) [TECH] Fait évoluer l'API interne des prescrits (PIX-12208).

### :bug: Correction
- [#8716](https://github.com/1024pix/pix/pull/8716) [BUGFIX] Pour le déblocage d'un compte utilisateur, gérer le cas d'erreur où le compte n'est pas/plus bloqué (PIX-12247).
- [#8709](https://github.com/1024pix/pix/pull/8709) [BUGFIX] Affichage d'un titre sur le bloc d'erreur d'import (Pix-12079).

### :coffee: Autre
- [#8463](https://github.com/1024pix/pix/pull/8463) [DOCS] Création d'un guide de contribution aux contenus de Modulix (PIX-12075).

## v4.135.0 (19/04/2024)


### :rocket: Amélioration
- [#8698](https://github.com/1024pix/pix/pull/8698) [FEATURE] Retourner une erreur lors de la création d'un passage pour un utilisateur non-existant (PIX-12184).
- [#8596](https://github.com/1024pix/pix/pull/8596) [FEATURE][PIX APP] Appliquer les token font sur les pages du scope Accès (PIX-11285).
- [#8695](https://github.com/1024pix/pix/pull/8695) [FEATURE] Rediriger vers app.pix.org lors d'un test statique (PIX-11941).

### :building_construction: Tech
- [#8689](https://github.com/1024pix/pix/pull/8689) [TECH] Script d'ajout d'un centre de certification V2 en tant que pilote pour le passage d'une certification complémentaire seule (PIX-12049). .
- [#8699](https://github.com/1024pix/pix/pull/8699) [TECH] Migrer le service de scoring (PIX-12207).

### :bug: Correction
- [#8631](https://github.com/1024pix/pix/pull/8631) [BUGFIX] Corrections d'un lien NL menant vers le support (PIX-12062).

## v4.134.0 (18/04/2024)


### :rocket: Amélioration
- [#8668](https://github.com/1024pix/pix/pull/8668) [FEATURE] Interdire l'HTML sur les champs qui ne le permettent pas (PIX-10243) (PIX-10241).
- [#8673](https://github.com/1024pix/pix/pull/8673) [FEATURE] Ne pas retourner d'erreur à l'import de colonnes inconnues (PIX-12139).

### :building_construction: Tech
- [#8696](https://github.com/1024pix/pix/pull/8696) [TECH] Corriger le test flaky sur la vérification du schéma des modules (PIX-12183).
- [#8686](https://github.com/1024pix/pix/pull/8686) [TECH] Migrer le déblocage d'un compte utilisateur dans src (PIX-12167).

### :bug: Correction
- [#8613](https://github.com/1024pix/pix/pull/8613) [BUGFIX] Rétablir la mise en place de acr_values suite à la mise en place de la lib openid-client (PIX-11980).
- [#8684](https://github.com/1024pix/pix/pull/8684) [BUGFIX] Corriger l'affichage de la page étudiant pour les membres (PIX-12169).
- [#8674](https://github.com/1024pix/pix/pull/8674) [BUGFIX] Corriger l'enregistrements des adresses email lors d'un ajout de candidat à une certification sur Pix Certif (PIX-12160).

### :arrow_up: Montée de version
- [#8693](https://github.com/1024pix/pix/pull/8693) [BUMP] Update dependency @1024pix/stylelint-config to ^5.1.8 (orga).
- [#8692](https://github.com/1024pix/pix/pull/8692) [BUMP] Update dependency @1024pix/stylelint-config to ^5.1.8 (mon-pix).
- [#8691](https://github.com/1024pix/pix/pull/8691) [BUMP] Update dependency @1024pix/stylelint-config to ^5.1.8 (certif).
- [#8688](https://github.com/1024pix/pix/pull/8688) [BUMP] Update dependency @1024pix/stylelint-config to ^5.1.8 (admin).
- [#8687](https://github.com/1024pix/pix/pull/8687) [BUMP] Update dependency @1024pix/stylelint-config to ^5.1.8 (1d).
- [#8682](https://github.com/1024pix/pix/pull/8682) [BUMP] Update dependency @1024pix/eslint-config to ^1.2.5 (orga).
- [#8681](https://github.com/1024pix/pix/pull/8681) [BUMP] Update dependency @1024pix/eslint-config to ^1.2.5 (mon-pix).
- [#8679](https://github.com/1024pix/pix/pull/8679) [BUMP] Update dependency @1024pix/eslint-config to ^1.2.5 (load-testing).
- [#8678](https://github.com/1024pix/pix/pull/8678) [BUMP] Update dependency @1024pix/eslint-config to ^1.2.5 (dossier racine).

### :coffee: Autre
- [#8680](https://github.com/1024pix/pix/pull/8680) [FEAT] Ajoute la notion d'étape dans le contenu d'une mission (Pix-11699).
- [#8664](https://github.com/1024pix/pix/pull/8664) [REFACTOR] Migrer l'entité Badge dans le scope evaluation de l'API (PIX-11882).

## v4.133.0 (17/04/2024)


### :rocket: Amélioration
- [#8660](https://github.com/1024pix/pix/pull/8660) [FEATURE] Rend asynchrone la validation du fichier d'import SIECLE (PIX-11939).
- [#8652](https://github.com/1024pix/pix/pull/8652) [FEATURE] Stocker l'information d'un centre de certification comme pilote pour la séparation Pix et Pix+ (PIX-11886).

### :building_construction: Tech
- [#8628](https://github.com/1024pix/pix/pull/8628) [TECH] Déplacement de `code-utils.js` vers `src/shared`.
- [#8636](https://github.com/1024pix/pix/pull/8636) [TECH] Utiliser la classe screen-reader-only de Pix UI sur Pix Admin et Pix Certif (PIX-12036).
- [#8571](https://github.com/1024pix/pix/pull/8571) [TECH] Refactoring du scoring/rescoring des certifications (PIX-11584).

### :bug: Correction
- [#8662](https://github.com/1024pix/pix/pull/8662) [BUGFIX] Réparer les largeurs des champs du formulaire de création de compte sur Pix Certif (PIX-12144).

### :arrow_up: Montée de version
- [#8677](https://github.com/1024pix/pix/pull/8677) [BUMP] Update dependency @1024pix/eslint-config to ^1.2.5 (certif).
- [#8676](https://github.com/1024pix/pix/pull/8676) [BUMP] Update dependency @1024pix/eslint-config to ^1.2.5 (audit-logger).
- [#8672](https://github.com/1024pix/pix/pull/8672) [BUMP] Update dependency @1024pix/eslint-config to ^1.2.5 (api).
- [#8671](https://github.com/1024pix/pix/pull/8671) [BUMP] Update dependency @1024pix/eslint-config to ^1.2.5 (admin).
- [#8669](https://github.com/1024pix/pix/pull/8669) [BUMP] Update dependency @1024pix/eslint-config to ^1.2.5 (1d).
- [#8610](https://github.com/1024pix/pix/pull/8610) [BUMP] Update dependency ember-template-lint to v6 (orga) (PIX-12135).

## v4.132.0 (16/04/2024)


### :rocket: Amélioration
- [#8562](https://github.com/1024pix/pix/pull/8562) [FEATURE] Permettre la modif d'un critère d'obtention d'ensemble de PF d'un RT dans l'API (PIX-11880).
- [#8658](https://github.com/1024pix/pix/pull/8658) [FEATURE] Proposer l'enquête Sco dans le bandeau du dashboard (PIX-12068).
- [#8642](https://github.com/1024pix/pix/pull/8642) [FEATURE] Retirer l'utilisation du terme "Modulix" (PIX-11991).

### :bug: Correction
- [#8667](https://github.com/1024pix/pix/pull/8667) [BUGFIX] Corriger l'affichage de la page élèves pour les membres (PIX-12156).
- [#8645](https://github.com/1024pix/pix/pull/8645) [BUGFIX] Corriger l'appel au usecase d'envoie de notification (PIX-12077).

### :coffee: Autre
- [#8629](https://github.com/1024pix/pix/pull/8629) [REFACTOR] Utilisation des design tokens de typographie sur certif (PIX-11308).

## v4.131.0 (15/04/2024)


### :rocket: Amélioration
- [#8641](https://github.com/1024pix/pix/pull/8641) [FEATURE] Créer le point d'entrée permettant de récupérer la liste des learners de l'import générique (PIX-11617).
- [#8579](https://github.com/1024pix/pix/pull/8579) [FEATURE] Retourner les détails des étapes de Smart Random (PIX-11561).
- [#8654](https://github.com/1024pix/pix/pull/8654) [FEATURE] Ajout video ip publique et modification mineure.
- [#8648](https://github.com/1024pix/pix/pull/8648) [FEATURE] Corriger le wording pour l'affichage du statut de l'import sur la page participant (PIX-12080).

### :building_construction: Tech
- [#8639](https://github.com/1024pix/pix/pull/8639) [TECH] Utiliser le Pix Message pour le bandeau des certifications terminées sur la page de finalisation de session sur Pix Certif (PIX-11829).
- [#8656](https://github.com/1024pix/pix/pull/8656) [TECH] Déplacer les évaluations de tutoriels dans le bounded-context DevComp (PIX-12129).
- [#8655](https://github.com/1024pix/pix/pull/8655) [TECH] Déplacer les tutoriels dans le bounded-context DevComp  (PIX-12123).
- [#8632](https://github.com/1024pix/pix/pull/8632) [TECH] Rend asynchrone l'import des organization learners SIECLE (PIX-11937).
- [#8646](https://github.com/1024pix/pix/pull/8646) [TECH][API] Factorisation du code de stockage des ID Tokens pour 2 services d'authentification de type OIDC (PIX-12069).

### :bug: Correction
- [#8584](https://github.com/1024pix/pix/pull/8584) [BUGFIX] Modifications modules expé : retours Lisa et bascule leçon <> activité.
- [#8653](https://github.com/1024pix/pix/pull/8653) [BUGFIX][API] (PIX-12118).

### :arrow_up: Montée de version
- [#8657](https://github.com/1024pix/pix/pull/8657) [BUMP] Update dependency postgres to v14.11.
- [#8593](https://github.com/1024pix/pix/pull/8593) [BUMP] Update dependency ember-data to v4.12.6 (certif).

### :coffee: Autre
- [#8650](https://github.com/1024pix/pix/pull/8650) [DOC] Corriger le numéro des ADR.

## v4.130.0 (12/04/2024)


### :rocket: Amélioration
- [#8647](https://github.com/1024pix/pix/pull/8647) [FEATURE] Remplacer Choisissez par Sélectionnez dans les instructions des QCU et QCM (PIX-11919).
- [#8635](https://github.com/1024pix/pix/pull/8635) [FEATURE] affiche l'état de l'import sur la page participant (Pix-11671).
- [#8582](https://github.com/1024pix/pix/pull/8582) [FEATURE] Empêcher une valeur nulle ou vide dans la payload de réponse, sauf dans le cas d'un timeout (PIX-11905).
- [#8597](https://github.com/1024pix/pix/pull/8597) [FEATURE] Permettre une liste de tolérances par proposition de QROCM (PIX-10428).

### :building_construction: Tech
- [#8618](https://github.com/1024pix/pix/pull/8618) [TECH] Supprimer la dépendance inutile à `ember-matomo-tag-manager`.
- [#8644](https://github.com/1024pix/pix/pull/8644) [TECH] Passage en entier de l'id de mission en base (PIX-12070).
- [#8612](https://github.com/1024pix/pix/pull/8612) [TECH] Supprimer pixCertificationStatus de certification-courses (PIX-11992).
- [#8627](https://github.com/1024pix/pix/pull/8627) [TECH] Déplacement de `knex-utils` vers `src/shared`.
- [#8643](https://github.com/1024pix/pix/pull/8643) [TECH] Simplifier l'usage des solutions dans les QROCM, QCU et QCM (PIX-11086).
- [#8640](https://github.com/1024pix/pix/pull/8640) [TECH] Utilisation du contenu de mission provenant du référentiel (Pix-11698).
- [#8638](https://github.com/1024pix/pix/pull/8638) [TECH][API] Implémentation à la demande de la configuration des OIDC services (PIX-12039).
- [#8634](https://github.com/1024pix/pix/pull/8634) [TECH] Vérifier la présence des propriétés identifiant un learner (PIX-12009).

### :bug: Correction
- [#8633](https://github.com/1024pix/pix/pull/8633) [BUGFIX] Erreur 502 lors du rattachement d'un nouveau PC à une certification complémentaire (PIX-12044).

### :arrow_up: Montée de version
- [#8481](https://github.com/1024pix/pix/pull/8481) [BUMP] Mettre à jour ember-data en 4.12.5 sur Pix App (PIX-11960).

## v4.129.0 (11/04/2024)


### :rocket: Amélioration
- [#8586](https://github.com/1024pix/pix/pull/8586) [FEATURE] Informer le candidat si sa langue n'est pas disponible en certif V3 (PIX-11280).
- [#8516](https://github.com/1024pix/pix/pull/8516) [FEATURE] Modifs mineures de contenu des modules en production.
- [#8603](https://github.com/1024pix/pix/pull/8603) [FEATURE] ajout du endpoint pour l'import générique `ONDE` (Pix-11612).

### :building_construction: Tech
- [#8567](https://github.com/1024pix/pix/pull/8567) [TECH] Nettoyage des tests Pix Certif avec testing library (PIX-11715).
- [#8583](https://github.com/1024pix/pix/pull/8583) [TECH] Migrer la création d'un compte Pix dans le dossier src (PIX-11940).
- [#8611](https://github.com/1024pix/pix/pull/8611) [TECH] Modifier le design du message d'erreur de la page de connexion à la certif (PIX-11988).
- [#8616](https://github.com/1024pix/pix/pull/8616) [TECH] Rendre la règle de l'unicité obligatoire (Pix-11908).
- [#8624](https://github.com/1024pix/pix/pull/8624) [TECH] Supprimer des fichiers inutilisés sur Pix Certif (PIX-11999).
- [#8621](https://github.com/1024pix/pix/pull/8621) [TECH] Corrige la configuration du linter pour les fichiers GJS (PIX-12008).

### :bug: Correction
- [#8622](https://github.com/1024pix/pix/pull/8622) [BUGFIX] Remettre la capacité dans le rendu des simulateurs de déroulé V3 (PIX-12007).

## v4.128.0 (10/04/2024)


### :rocket: Amélioration
- [#8587](https://github.com/1024pix/pix/pull/8587) [FEATURE] Afficher des QROCM "inline" (PIX-10789).
- [#8294](https://github.com/1024pix/pix/pull/8294) [FEATURE] Message d'inéligibilité à une complémentaire uniquement si une version d'écart (PIX-99866).

### :building_construction: Tech
- [#8625](https://github.com/1024pix/pix/pull/8625) [TECH] Renommer authentication-service-registry→oidc-authentication-service-registry (PIX-12016).
- [#8619](https://github.com/1024pix/pix/pull/8619) [TECH] Ajouter les fichiers à risque que sont *.json et *.csv dans le fichier .gitignore à la racine.
- [#8623](https://github.com/1024pix/pix/pull/8623) [TECH] Activer la règle prefer-node-protocol du plugin eslint unicorn.
- [#8598](https://github.com/1024pix/pix/pull/8598) [TECH] extrait la validation de fichier siecle xml un usecase dédié (Pix-11967).
- [#8595](https://github.com/1024pix/pix/pull/8595) [TECH] Supprime la dev dependence à inquirer (PIX-11971).

### :arrow_up: Montée de version
- [#8626](https://github.com/1024pix/pix/pull/8626) [BUMP] Update dependency eslint-plugin-n to v17 (api).
- [#8609](https://github.com/1024pix/pix/pull/8609) [BUMP] Update dependency @1024pix/stylelint-config to ^5.1.5 (orga).
- [#8608](https://github.com/1024pix/pix/pull/8608) [BUMP] Update dependency @1024pix/stylelint-config to ^5.1.5 (mon-pix).
- [#8607](https://github.com/1024pix/pix/pull/8607) [BUMP] Update dependency @1024pix/stylelint-config to ^5.1.5 (certif).
- [#8606](https://github.com/1024pix/pix/pull/8606) [BUMP] Update dependency @1024pix/stylelint-config to ^5.1.5 (admin).
- [#8605](https://github.com/1024pix/pix/pull/8605) [BUMP] Update dependency @1024pix/stylelint-config to ^5.1.5 (1d).
- [#8600](https://github.com/1024pix/pix/pull/8600) [BUMP] Update dependency ember-template-lint to v6 (1d).

## v4.127.0 (08/04/2024)


### :rocket: Amélioration
- [#8568](https://github.com/1024pix/pix/pull/8568) [FEATURE] Import Générique - Extraire les données d'un fichier ONDE (PIX-11616).
- [#8563](https://github.com/1024pix/pix/pull/8563) [FEATURE] Sauvegarde de la langue du candidat au début d'une certif V3 (PIX-11279).

### :building_construction: Tech
- [#8577](https://github.com/1024pix/pix/pull/8577) [TECH] Migrer l'API d'envoi d'une invitation sur Pix Certif dans src (PIX-11938).
- [#8576](https://github.com/1024pix/pix/pull/8576) [TECH] Extrait le traitement de données de l'import SIECLE dans un usecase (PIX-11945).
- [#8578](https://github.com/1024pix/pix/pull/8578) [TECH] met à jour le plugin update-prettier-plugin-ember-template-tag.

### :arrow_up: Montée de version
- [#8594](https://github.com/1024pix/pix/pull/8594) [BUMP] Update dependency ember-data to v4.12.7 (orga).
- [#8589](https://github.com/1024pix/pix/pull/8589) [BUMP] Update dependency @1024pix/pix-ui to ^45.0.5 (admin).
- [#8591](https://github.com/1024pix/pix/pull/8591) [BUMP] Update dependency @1024pix/pix-ui to ^45.0.5 (orga).
- [#8590](https://github.com/1024pix/pix/pull/8590) [BUMP] Update dependency @1024pix/pix-ui to ^45.0.5 (certif).
- [#8588](https://github.com/1024pix/pix/pull/8588) [BUMP] Update Node.js to v20.12.1.
- [#8585](https://github.com/1024pix/pix/pull/8585) [BUMP] Update dependency @1024pix/pix-ui to ^45.0.4 (orga).

### :coffee: Autre
- [#8527](https://github.com/1024pix/pix/pull/8527) [REFACTOR] Améliorer l'affichage des critères d'obtention d'un résultat thématique (PIX-11870).

## v4.126.0 (04/04/2024)


### :rocket: Amélioration
- [#8574](https://github.com/1024pix/pix/pull/8574) [FEATURE][API] Ajouter le lien support en néerlandais dans les mails (PIX-11704).
- [#8506](https://github.com/1024pix/pix/pull/8506) [FEATURE] Réessayer un élément de type activité (PIX-11700).

### :building_construction: Tech
- [#8570](https://github.com/1024pix/pix/pull/8570) [TECH] Fusionner idTokenLifespanMs et accessTokenLifespanMs (PIX-8704).
- [#8473](https://github.com/1024pix/pix/pull/8473) [TECH] Refactoriser l'algorithme de sélection d'épreuve (PIX-11595).
- [#8485](https://github.com/1024pix/pix/pull/8485) [TECH] Renommer flash estimatedLevel en capacity (PIX-11379).

### :arrow_up: Montée de version
- [#8581](https://github.com/1024pix/pix/pull/8581) [BUMP] Update dependency @1024pix/pix-ui to ^45.0.4 (certif).
- [#8580](https://github.com/1024pix/pix/pull/8580) [BUMP] Update dependency @1024pix/pix-ui to ^45.0.4 (admin).
- [#8537](https://github.com/1024pix/pix/pull/8537) [BUMP] Update dependency @1024pix/pix-ui to v45 (admin) (PIX-11927).

## v4.125.0 (03/04/2024)


### :rocket: Amélioration
- [#8545](https://github.com/1024pix/pix/pull/8545) [FEATURE] Afficher l'état de l'import en cours (PIX-11683).
- [#8529](https://github.com/1024pix/pix/pull/8529) [FEATURE] Afficher un commentaire auto jury lorsqu'un problème technique empêche le bon déroulement de la certification V2 (PIX-10535).
- [#8523](https://github.com/1024pix/pix/pull/8523) [FEATURE] Améliorer la gestion du choix de la langue d'affichage (PIX-11826).
- [#8547](https://github.com/1024pix/pix/pull/8547) [FEATURE] Récupérer le format d'import pour une organisation spécifique (PIX-11613).

### :building_construction: Tech
- [#8566](https://github.com/1024pix/pix/pull/8566) [TECH] Migrer la connexion à Mediacentre du dossier lib vers src (PIX-11875).
- [#8561](https://github.com/1024pix/pix/pull/8561) [TECH] Charger les données de la table oidc-providers avec les seeds (PIX-10032).
- [#8515](https://github.com/1024pix/pix/pull/8515) [TECH] Dans les tests unitaires remplacer le monkey-patching de DomainTransaction.execute par l’utilisation de sinon.
- [#8548](https://github.com/1024pix/pix/pull/8548) [TECH] Deplacer isRelatedToCertification vers le repo approprié (PIX-11920).

### :bug: Correction
- [#8575](https://github.com/1024pix/pix/pull/8575) [BUGFIX] corrige la largeur des champ texte  lors de la creation de campagne (PIX-11904).
- [#8565](https://github.com/1024pix/pix/pull/8565) [BUGFIX][ORGA] Remettre la couleur de fond manquante (PIX-11877).

### :arrow_up: Montée de version
- [#8569](https://github.com/1024pix/pix/pull/8569) [BUMP] Update dependency @1024pix/pix-ui to ^45.0.3 (certif).
- [#8487](https://github.com/1024pix/pix/pull/8487) [BUMP] Update dependency @1024pix/pix-ui to v45 (certif).

### :coffee: Autre
- [#8560](https://github.com/1024pix/pix/pull/8560) [REFACTOR] Migrer badge-criteria-repository dans le scope evaluation (PIX-11894).

## v4.124.0 (02/04/2024)


### :rocket: Amélioration
- [#7406](https://github.com/1024pix/pix/pull/7406) [FEATURE] Ajouter la connexion SSO Google à Pix Admin (PIX-8809).
- [#8546](https://github.com/1024pix/pix/pull/8546) [FEATURE] Créer le repository permettant de sauvegarder les nouveaux format de learner (Pix-11615).
- [#8544](https://github.com/1024pix/pix/pull/8544) [FEATURE]: Retrait du bandeau d'information gestion des accès à Pix Certif pour PRO et SUP (PIX-11857).
- [#8415](https://github.com/1024pix/pix/pull/8415) [FEATURE] Permettre à partir d'un fichier de configuration de parser un CSV (PIX-11614).
- [#8535](https://github.com/1024pix/pix/pull/8535) [FEATURE] désactive les boutons d'import si un import est en cours (PIX-11681).

### :building_construction: Tech
- [#8446](https://github.com/1024pix/pix/pull/8446) [TECH] Migrer l'injection de certification/shared vers certification/course (PIX-1473).
- [#8533](https://github.com/1024pix/pix/pull/8533) [TECH] Créer un script pour charger les données des OIDC Providers (PIX-10033).
- [#8491](https://github.com/1024pix/pix/pull/8491) [TECH] Corriger comportement de screen reader sur l'affichage d'un nouveau grain (PIX-11825).
- [#8514](https://github.com/1024pix/pix/pull/8514) [TECH] Remplacer bookshelf par knex sur le repository user-orga-settings (PIX-11858).
- [#8273](https://github.com/1024pix/pix/pull/8273) [TECH] Mettre à jour ember-data en 4.12.5 sur PixOrga (PIX-11824).

### :bug: Correction
- [#8528](https://github.com/1024pix/pix/pull/8528) [BUGFIX]Corrections de liens menant vers des pages de support NL (PIX-11551).
- [#8541](https://github.com/1024pix/pix/pull/8541) [BUGFIX] Màj tolérance d'un QROC du module bien-ecrire-son-adresse-mail.
- [#8486](https://github.com/1024pix/pix/pull/8486) [BUGFIX] Remplacement émojis boutons et correction erreurs de niveau de section .

### :arrow_up: Montée de version
- [#8559](https://github.com/1024pix/pix/pull/8559) [BUMP] Update dependency @1024pix/pix-ui to ^45.0.3 (orga).
- [#8558](https://github.com/1024pix/pix/pull/8558) [BUMP] Update dependency node to v20.12.0.
- [#8557](https://github.com/1024pix/pix/pull/8557) [BUMP] Update dependency @1024pix/stylelint-config to ^5.1.4 (orga).
- [#8556](https://github.com/1024pix/pix/pull/8556) [BUMP] Update dependency @1024pix/stylelint-config to ^5.1.4 (mon-pix).
- [#8555](https://github.com/1024pix/pix/pull/8555) [BUMP] Update dependency @1024pix/stylelint-config to ^5.1.4 (certif).
- [#8554](https://github.com/1024pix/pix/pull/8554) [BUMP] Update dependency @1024pix/pix-ui to ^45.0.2 (orga).
- [#8553](https://github.com/1024pix/pix/pull/8553) [BUMP] Update dependency @1024pix/stylelint-config to ^5.1.4 (admin).
- [#8552](https://github.com/1024pix/pix/pull/8552) [BUMP] Update dependency @1024pix/stylelint-config to ^5.1.4 (1d).
- [#8551](https://github.com/1024pix/pix/pull/8551) [BUMP] Lock file maintenance (admin).
- [#8550](https://github.com/1024pix/pix/pull/8550) [BUMP] Lock file maintenance (1d).
- [#8539](https://github.com/1024pix/pix/pull/8539) [BUMP] Update dependency pino-pretty to v11 (audit-logger).
- [#8538](https://github.com/1024pix/pix/pull/8538) [BUMP] Update dependency pino-pretty to v11 (api).
- [#8524](https://github.com/1024pix/pix/pull/8524) [BUMP] Update dependency @1024pix/stylelint-config to ^5.1.3 (mon-pix).

## v4.123.0 (28/03/2024)


### :rocket: Amélioration
- [#8509](https://github.com/1024pix/pix/pull/8509) [FEATURE] afficher le détail du dernier import réalisé par une organisation (pix-11684).
- [#8237](https://github.com/1024pix/pix/pull/8237) [FEATURE] Récupérer l'information des langues disponibles pour la certification (pix-11277).
- [#8475](https://github.com/1024pix/pix/pull/8475) [FEATURE] Ajout de l'ID d'answer dans la table `certification-challenge-capacities` (PIX-11688).

### :building_construction: Tech
- [#8532](https://github.com/1024pix/pix/pull/8532) [TECH] Ajouter des fonctions de chiffrement et de déchiffrement symétriques pour stocker les Client Secrets (PIX-11883).
- [#8517](https://github.com/1024pix/pix/pull/8517) [TECH] deplace `campaignManagementController` vers `src/prescription` (PIX-11861).
- [#8480](https://github.com/1024pix/pix/pull/8480) [TECH] Ajout du userId créant une configuration de niveau par compétence (PIX-11721).

### :arrow_up: Montée de version
- [#8536](https://github.com/1024pix/pix/pull/8536) [BUMP] Update Node.js to v20.12.0.
- [#8507](https://github.com/1024pix/pix/pull/8507) [BUMP] Update dependency @1024pix/pix-ui to v45 (orga).

## v4.122.0 (27/03/2024)


### :rocket: Amélioration
- [#8466](https://github.com/1024pix/pix/pull/8466) [FEATURE] ajout du commentaire automatique en cas d'obtention d'une certification complémentaire de niveau inférieur (PIX-10322).
- [#8452](https://github.com/1024pix/pix/pull/8452) [FEATURE] Utiliser les composants Pix UI dans la modale d'ajout de candidat à une session sur Pix Certif (PIX-11588).

### :building_construction: Tech
- [#8494](https://github.com/1024pix/pix/pull/8494) [TECH] Remplacer l'utilisation de la propriété de configuration endSessionUrl (PIX-11821).
- [#8508](https://github.com/1024pix/pix/pull/8508) [TECH] Basculer sur la version publié de eslint-plugin-knex.
- [#8495](https://github.com/1024pix/pix/pull/8495) [TECH] Déplace la configuration du plugin yar dans son propre fichier.
- [#8510](https://github.com/1024pix/pix/pull/8510) [TECH] Ajoute les tests d'acceptance manquant sur les routes liées aux `campaign-participations` (PIX-11742).
- [#8503](https://github.com/1024pix/pix/pull/8503) [TECH] Supprime l'usage de current-lang.
- [#8498](https://github.com/1024pix/pix/pull/8498) [TECH] Utilise la version moderne ES6 de dotenv.
- [#8496](https://github.com/1024pix/pix/pull/8496) [TECH] Notifier les membres de l'équipe accès lors d'une modification d'un des domaines (PIX-11836).

### :bug: Correction
- [#8490](https://github.com/1024pix/pix/pull/8490) [BUGFIX] Réparer la gestion de l'import en masse de sessions avec certification complémentaire sur Pix Certif (PIX-11818).
- [#8464](https://github.com/1024pix/pix/pull/8464) [BUGFIX] Remonter la dernière participation d'un élève à une certification sur le CSV des résultats (PIX-11647).

### :arrow_up: Montée de version
- [#8521](https://github.com/1024pix/pix/pull/8521) [BUMP] Update dependency @1024pix/pix-ui to ^44.3.8 (orga).
- [#8522](https://github.com/1024pix/pix/pull/8522) [BUMP] Update dependency @1024pix/stylelint-config to ^5.1.3 (admin).
- [#8519](https://github.com/1024pix/pix/pull/8519) [BUMP] Update dependency @1024pix/pix-ui to ^44.3.8 (admin).
- [#8520](https://github.com/1024pix/pix/pull/8520) [BUMP] Update dependency @1024pix/pix-ui to ^44.3.8 (certif).
- [#8504](https://github.com/1024pix/pix/pull/8504) [BUMP] Lock file maintenance (orga).
- [#8518](https://github.com/1024pix/pix/pull/8518) [BUMP] Update dependency @1024pix/pix-ui to ^44.3.8 (1d).
- [#8445](https://github.com/1024pix/pix/pull/8445) [BUMP] Update dependency @1024pix/stylelint-config to ^5.1.3 (orga).
- [#8401](https://github.com/1024pix/pix/pull/8401) [BUMP] Update dependency @1024pix/stylelint-config to ^5.1.2 (mon-pix).
- [#8387](https://github.com/1024pix/pix/pull/8387) [BUMP] Update dependency @1024pix/stylelint-config to ^5.1.2 (admin).

## v4.121.0 (26/03/2024)


### :rocket: Amélioration
- [#8363](https://github.com/1024pix/pix/pull/8363) [FEATURE] Ajouter l'info de lien avec un parcours autonome dans le détail d'un profil-cible (PIX-9840).
- [#8467](https://github.com/1024pix/pix/pull/8467) [FEATURE] Afficher Pix Certif et Pix Orga en anglais lorsque la langue de l'utilisateur n'est pas supportée (PIX-11633).
- [#8462](https://github.com/1024pix/pix/pull/8462) [FEATURE] Différencier les grains activité des grain leçon (PIX-10857).
- [#8474](https://github.com/1024pix/pix/pull/8474) [FEATURE] utiliser la table `organization-imports` pour afficher les infos du dernier import (Pix-11670).
- [#8488](https://github.com/1024pix/pix/pull/8488) [FEATURE] Changer le lien 'Importer' dans la bannière de rentrée vers la nouvelle page d'import (PIX-11822).
- [#8484](https://github.com/1024pix/pix/pull/8484) [FEATURE] Ajouter une colonne id sur la table `organization-learner-import-formats` (PIX-11610).

### :building_construction: Tech
- [#8458](https://github.com/1024pix/pix/pull/8458) [TECH] Supprimer la configuration des endpoints trouvés automatiquement par OpenID Configuration (PIX-11106).
- [#8477](https://github.com/1024pix/pix/pull/8477) [TECH] Correction de tests échouant aléatoirement (PIX-11751).

### :bug: Correction
- [#8395](https://github.com/1024pix/pix/pull/8395) [BUGFIX] Éviter les 2 écrans intermédiaires en fin de parcours (PIX-11203).
- [#8457](https://github.com/1024pix/pix/pull/8457) [BUGFIX] Ne pas afficher de grain vide (PIX-11296).
- [#8483](https://github.com/1024pix/pix/pull/8483) [BUGFIX] Inverser les en-têtes de deux colonnes et conditionne un des affichages (PIX-11752).

### :arrow_up: Montée de version
- [#8502](https://github.com/1024pix/pix/pull/8502) [BUMP] Lock file maintenance (audit-logger).
- [#8500](https://github.com/1024pix/pix/pull/8500) [BUMP] Update dependency ember-flatpickr to v8 (admin).
- [#8499](https://github.com/1024pix/pix/pull/8499) [BUMP] Update dependency ember-flatpickr to v8 (certif).
- [#8497](https://github.com/1024pix/pix/pull/8497) [BUMP] Update dependency eslint-plugin-n to v16 (admin).
- [#8493](https://github.com/1024pix/pix/pull/8493) [BUMP] Replace dependency eslint-plugin-node with eslint-plugin-n ^16.0.0 (orga).
- [#8492](https://github.com/1024pix/pix/pull/8492) [BUMP] Lock file maintenance (api).
- [#8489](https://github.com/1024pix/pix/pull/8489) [BUMP] Replace dependency eslint-plugin-node with eslint-plugin-n ^14.0.0 (mon-pix).
- [#8465](https://github.com/1024pix/pix/pull/8465) [BUMP] Replace dependency eslint-plugin-node with eslint-plugin-n ^14.0.0 (admin).

## v4.120.0 (22/03/2024)


### :rocket: Amélioration
- [#8409](https://github.com/1024pix/pix/pull/8409) [FEATURE] Créer une seeds pour l'import ONDE (PIX-11610).

### :building_construction: Tech
- [#8471](https://github.com/1024pix/pix/pull/8471) [TECH] Ne pas linter les fichiers de traductions générés par Phrase (PIX-11733).
- [#8476](https://github.com/1024pix/pix/pull/8476) [TECH] Remplacer les "contains" dans les tests par des méthodes de testingLibrary (PIX-11714).
- [#8231](https://github.com/1024pix/pix/pull/8231) [TECH] Refacto getNextChallengeForCertification (PIX-10870).
- [#8461](https://github.com/1024pix/pix/pull/8461) [TECH] Migrer les routes liés au campaign participation dans leurs Bounded Context (PIX-11678).

### :bug: Correction
- [#8478](https://github.com/1024pix/pix/pull/8478) [BUGFIX] Corriger la gestion d'exception de checkUserBelongsToScoOrganizationAndManagesStudents (PIX-11814).

## v4.119.0 (21/03/2024)


### :rocket: Amélioration
- [#8414](https://github.com/1024pix/pix/pull/8414) [FEATURE] Ajout d'une page pour la création de configurations de score et de niveau par compétence (PIX-11639).
- [#8460](https://github.com/1024pix/pix/pull/8460) [FEATURE][MON-PIX] Supprimer le lien politique de protection des données des élèves dans le footer sur le domaine .org (PIX-11650).
- [#8469](https://github.com/1024pix/pix/pull/8469) [FEATURE] Correctifs traductions NL (PIX-11729).
- [#8451](https://github.com/1024pix/pix/pull/8451) [FEATURE] Rendre l'affichage de certains messages d'erreur plus claire lors de la création en masse d'organisations (PIX-11685).
- [#8427](https://github.com/1024pix/pix/pull/8427) [FEATURE] Afficher un commentaire auto jury en cas de problème technique pour la certification V3 (PIX-10603).

### :building_construction: Tech
- [#8257](https://github.com/1024pix/pix/pull/8257) [TECH] :recycle: Déplace `organization-repository.js` vers `src/shared`.
- [#8447](https://github.com/1024pix/pix/pull/8447) [TECH] Remplacer les notions de `treatment` par `tolerance` (PIX-11679).
- [#8288](https://github.com/1024pix/pix/pull/8288) [TECH] Migrer l'injection de certification/shared vers certification/session (PIX-11470).
- [#8454](https://github.com/1024pix/pix/pull/8454) [TECH] :recycle: Modification de l'appel du token d'authentification pour l'action de « tri » des vieilles branches.
- [#8456](https://github.com/1024pix/pix/pull/8456) [TECH] Supprimer la rétrocompatibilité du champ élément (PIX-11360).
- [#8455](https://github.com/1024pix/pix/pull/8455) [TECH] Déplace la logique validation de code dans le model Campaign (PIX-11691).

### :bug: Correction
- [#8468](https://github.com/1024pix/pix/pull/8468) [BUGFIX] Permettre de mettre à jour les code pays (cpf) via le script (PIX-11727).
- [#8470](https://github.com/1024pix/pix/pull/8470) [BUGFIX] Corrige la validation d'une épreuve en preview en local (PIX-11709).
- [#8440](https://github.com/1024pix/pix/pull/8440) [BUGFIX] Corriger la disponibilité du bouton de publication de session sur Pix Admin (PIX-11481).

### :coffee: Autre
- [#8453](https://github.com/1024pix/pix/pull/8453) [REFACTOR] Fusion des QROC dans les QROCM (PIX-11486).

## v4.118.0 (20/03/2024)


### :rocket: Amélioration
- [#8449](https://github.com/1024pix/pix/pull/8449) [FEATURE] expose l'état du dernier import d'un organization (PIX-11256).
- [#8450](https://github.com/1024pix/pix/pull/8450) [FEATURE] Créer une nouvelle table oidc-providers (PIX-10030).
- [#8324](https://github.com/1024pix/pix/pull/8324) [FEATURE] Créer une interface de test de l'algorithme Smart Random (PIX-11180).
- [#8407](https://github.com/1024pix/pix/pull/8407) [FEATURE] Suppression de la règle de dégradation du score pour une certif V3 (PIX-11606).
- [#8417](https://github.com/1024pix/pix/pull/8417) [FEATURE] Afficher uniquement les missions actives dans Pix 1d et Pix Orga (PIX-11313).
- [#8439](https://github.com/1024pix/pix/pull/8439) [FEATURE] Gere les erreurs liées à la date de naissance dans un fichier SIECLE pour un import SCO (PIX-11661).

### :bug: Correction
- [#8448](https://github.com/1024pix/pix/pull/8448) [BUGFIX] Suppression HTML dans un champ qui ne le supporte pas.
- [#8416](https://github.com/1024pix/pix/pull/8416) [BUGFIX] Corriger des soucis d'accessibilité côté Modulix (PIX-11646).

### :arrow_up: Montée de version
- [#8444](https://github.com/1024pix/pix/pull/8444) [BUMP] Update dependency @1024pix/pix-ui to ^44.3.2 (orga).
- [#8443](https://github.com/1024pix/pix/pull/8443) [BUMP] Update dependency @1024pix/pix-ui to ^44.3.2 (certif).

### :coffee: Autre
- [#8428](https://github.com/1024pix/pix/pull/8428) [DOCS] Corriger les notes de deux routes de SSO : "check reconciliation" et "reconcile".

## v4.117.0 (18/03/2024)


### :rocket: Amélioration
- [#8423](https://github.com/1024pix/pix/pull/8423) [FEATURE] :sparkles: Reprendre l'aventure après une interruption (PIX-11487).
- [#8413](https://github.com/1024pix/pix/pull/8413) [FEATURE] Ajoute le nombre de participations partagées dans les résultats d'une campagne (PIX-11630).
- [#8418](https://github.com/1024pix/pix/pull/8418) [FEATURE][MON-PIX] Modifier les liens du footer pour la langue néerlandaise (PIX-11596).
- [#8419](https://github.com/1024pix/pix/pull/8419) [FEATURE] Ajoute l'information sur la remontée auto dans la page de détail d'une organisation (PIX-9904).
- [#8398](https://github.com/1024pix/pix/pull/8398) [FEATURE] Retourner toutes les erreurs de validité du fichier d'import sup d'un coup  (pix-10956).
- [#8264](https://github.com/1024pix/pix/pull/8264) [FEATURE][ADMIN] Permettre la création d'organisations avec un identifiant externe déjà présent en base de données (PIX-9785).
- [#8410](https://github.com/1024pix/pix/pull/8410) [FEATURE] Prévenir le mauvais formattage de Module.
- [#8351](https://github.com/1024pix/pix/pull/8351) [FEATURE][API] Mettre à jour les liens des emails pour langue Néerlandaise (PIX-11300).
- [#8412](https://github.com/1024pix/pix/pull/8412) [FEATURE] Re-finalisation MVP module distinguer-vrai-faux-sur-internet (post-panel interne).
- [#8390](https://github.com/1024pix/pix/pull/8390) [FEATURE][MON-PIX] Modifier les URLs des CGU et Politique Protection des données pour le Néerlandais (PIX-11620).
- [#8382](https://github.com/1024pix/pix/pull/8382) [FEATURE] Supprimer le pluriel sur la notion d'obtention d'une certification complémentaire sur les attestations PDF (PIX-11468).
- [#8397](https://github.com/1024pix/pix/pull/8397) [FEATURE][ADMIN] Permettre la création d'organisations en masse avec toutes les locales gérées (PIX-11550).

### :building_construction: Tech
- [#8388](https://github.com/1024pix/pix/pull/8388) [TECH] Nettoyer le `solution-service-qrocm-ind` hérité de ./api/lib (PIX-10484).
- [#8434](https://github.com/1024pix/pix/pull/8434) [TECH] Ajouter la colonne attributes à la table organization-learners (Pix-11662).
- [#8421](https://github.com/1024pix/pix/pull/8421) [TECH] Supprimer la route PATCH /api/certification-courses/{certificationCourseId} dépréciée (PIX-11425).
- [#8280](https://github.com/1024pix/pix/pull/8280) [TECH] :recycle: Déplacement des `Datasources` de `LearningContent` vers le répertoire `src/shared`.
- [#8213](https://github.com/1024pix/pix/pull/8213) [TECH] Créer la route de réconciliation pour le SSO Google sur Pix Admin (PIX-1143).
- [#8377](https://github.com/1024pix/pix/pull/8377) [TECH] Remplacer les "contains" dans les tests par des méthodes de testingLibrary (PIX-11602).

### :bug: Correction
- [#8420](https://github.com/1024pix/pix/pull/8420) [BUGFIX] Correction typographique : ajout des espaces fines et espaces mots insécables dans tous les modules.
- [#8404](https://github.com/1024pix/pix/pull/8404) [BUGFIX]: Corriger la validation d'une épreuve en prévisualisation de Pix 1D (pix-11552).

### :arrow_up: Montée de version
- [#8442](https://github.com/1024pix/pix/pull/8442) [BUMP] Update dependency @1024pix/pix-ui to ^44.3.2 (admin).
- [#8441](https://github.com/1024pix/pix/pull/8441) [BUMP] Update dependency @1024pix/pix-ui to ^44.3.2 (1d).
- [#8438](https://github.com/1024pix/pix/pull/8438) [BUMP] Update dependency @1024pix/pix-ui to ^44.3.1 (1d).
- [#8437](https://github.com/1024pix/pix/pull/8437) [BUMP] Update dependency @1024pix/ember-testing-library to ^1.1.0 (orga).
- [#8436](https://github.com/1024pix/pix/pull/8436) [BUMP] Update dependency @1024pix/ember-testing-library to ^1.1.0 (mon-pix).
- [#8435](https://github.com/1024pix/pix/pull/8435) [BUMP] Update dependency @1024pix/ember-testing-library to ^1.1.0 (certif).
- [#8432](https://github.com/1024pix/pix/pull/8432) [BUMP] Update dependency @1024pix/ember-testing-library to ^1.1.0 (admin).
- [#8431](https://github.com/1024pix/pix/pull/8431) [BUMP] Update dependency @1024pix/ember-testing-library to ^1.1.0 (1d).
- [#8430](https://github.com/1024pix/pix/pull/8430) [BUMP] Update dependency @1024pix/stylelint-config to ^5.1.3 (certif).
- [#8429](https://github.com/1024pix/pix/pull/8429) [BUMP] Update dependency @1024pix/stylelint-config to ^5.1.3 (1d).
- [#8426](https://github.com/1024pix/pix/pull/8426) [BUMP] Update dependency @1024pix/pix-ui to ^44.2.10 (certif).
- [#8425](https://github.com/1024pix/pix/pull/8425) [BUMP] Update dependency @1024pix/pix-ui to ^44.2.10 (admin).
- [#8424](https://github.com/1024pix/pix/pull/8424) [BUMP] Update dependency @1024pix/pix-ui to ^44.2.10 (1d).
- [#8422](https://github.com/1024pix/pix/pull/8422) [BUMP] Update adobe/s3mock Docker tag to v3.5.2 (dossier racine).
- [#8362](https://github.com/1024pix/pix/pull/8362) [BUMP] Update dependency @1024pix/stylelint-config to ^5.1.2 (1d).

## v4.116.0 (15/03/2024)


### :rocket: Amélioration
- [#8391](https://github.com/1024pix/pix/pull/8391) [FEATURE] Remonter toutes les erreurs lors d'un import SIECLE (PIX-10955).
- [#8408](https://github.com/1024pix/pix/pull/8408) [FEATURE] Retourner une erreur lorsque les données du référentiel Modulix ne sont pas cohérentes.
- [#8379](https://github.com/1024pix/pix/pull/8379) [FEATURE] Ajout du calcul du niveau par compétence lors du rescoring (PIX-11546).
- [#8329](https://github.com/1024pix/pix/pull/8329) [FEATURE] Récupérer la config de niveau par compétence en fonction de la date du certification-course (PIX-11548).

### :building_construction: Tech
- [#8411](https://github.com/1024pix/pix/pull/8411) [TECH] Migrer l'api pour attacher une organisation fille dans src/organizational-entities (PIX-11632).
- [#8405](https://github.com/1024pix/pix/pull/8405) [TECH] Ajout de la migration pour créer la table  organization-learner-import-formats.
- [#8402](https://github.com/1024pix/pix/pull/8402) [TECH] Ajouter la feature permettant d'importer des participants (PIX-11608).

### :bug: Correction
- [#8406](https://github.com/1024pix/pix/pull/8406) [BUGFIX] Correction d'une référence de grain dans une transition.

### :arrow_up: Montée de version
- [#8400](https://github.com/1024pix/pix/pull/8400) [BUMP] Update dependency @1024pix/stylelint-config to ^5.1.2 (certif).

### :coffee: Autre
- [#8389](https://github.com/1024pix/pix/pull/8389) [REFACTOR] Améliorer le responsive du bloc d'actions des épreuves (PIX-9646).
- [#8392](https://github.com/1024pix/pix/pull/8392) [REFACTOR] Améliorer le contraste du bloc de signalement d'épreuve (PIX-9644).
- [#8355](https://github.com/1024pix/pix/pull/8355) [REFACTOR] Amélioration du lien "détails" d'une carte de compétence (PIX-10556).
- [#8354](https://github.com/1024pix/pix/pull/8354) [REFACTOR] Amélioration du style du lien du bloc de score sur le dashboard (PIX-10555).

## v4.115.0 (14/03/2024)


### :rocket: Amélioration
- [#8361](https://github.com/1024pix/pix/pull/8361) [FEATURE] Afficher la liste des élèves dans le détail d'une mission dans Pix Orga (PIX-11198).
- [#8295](https://github.com/1024pix/pix/pull/8295) [FEATURE] Afficher un commentaire auto jury en cas de réponses insuffisantes pour la certification V2 (PIX-11474).
- [#8269](https://github.com/1024pix/pix/pull/8269) [FEATURE] Afficher un commentaire auto jury en cas de réponses insuffisantes pour la certification V3 (PIX-10530).
- [#8341](https://github.com/1024pix/pix/pull/8341) [FEATURE] Afficher les challenges Pix+ dans la page détail d'une certification (PIX-11585).
- [#8350](https://github.com/1024pix/pix/pull/8350) [FEATURE] Retourner toutes les erreurs d'un import FREGATA (PIX-11114).
- [#8347](https://github.com/1024pix/pix/pull/8347) [FEATURE] Retirer le nom de famille élèves des API non authentifiée (PIX-11320).

### :building_construction: Tech
- [#8394](https://github.com/1024pix/pix/pull/8394) [TECH] Supprime le champ title et description du tube.
- [#8348](https://github.com/1024pix/pix/pull/8348) [TECH] Extract flash-certification cross-injection from shared (PIX-11471).
- [#8393](https://github.com/1024pix/pix/pull/8393) [TECH] Migration de l'oidc-authentication-service dans src (PIX-11623).
- [#8381](https://github.com/1024pix/pix/pull/8381) [TECH] déplace la route `/organization/{id}/groups` dans le  contexte prescription (pix-11607).
- [#8378](https://github.com/1024pix/pix/pull/8378) [TECH] déplace la route `/api/organizations/{id}/sup-organization-learners/{organizationLearnerId}` dans src/prescription (pix-11604).
- [#8370](https://github.com/1024pix/pix/pull/8370) [TECH] Ne plus utiliser la rétrocompatibilité des éléments du grain dans Pix App (PIX-11359).
- [#8372](https://github.com/1024pix/pix/pull/8372) [TECH] Retirer le passage id du payload de /passages/{id}/answers (PIX-11312).
- [#8380](https://github.com/1024pix/pix/pull/8380) [TECH] Migrer l'archivage et le désarchivage d'une campagne depuis Pix Orga dans son Bounded Context (PIX-11605).
- [#8365](https://github.com/1024pix/pix/pull/8365) [TECH]  déplace la route  `csv-template` dans `src/prescription` (PIX-11597).

### :arrow_up: Montée de version
- [#8399](https://github.com/1024pix/pix/pull/8399) [BUMP] Update dependency @1024pix/eslint-config to ^1.2.3 (certif).
- [#8340](https://github.com/1024pix/pix/pull/8340) [BUMP] Update dependency @1024pix/eslint-config to ^1.2.2 (certif).
- [#8386](https://github.com/1024pix/pix/pull/8386) [BUMP] Update dependency @1024pix/pix-ui to ^44.2.8 (orga).
- [#8385](https://github.com/1024pix/pix/pull/8385) [BUMP] Update dependency @1024pix/pix-ui to ^44.2.8 (certif).
- [#8384](https://github.com/1024pix/pix/pull/8384) [BUMP] Update dependency @1024pix/pix-ui to ^44.2.8 (admin).
- [#8383](https://github.com/1024pix/pix/pull/8383) [BUMP] Update dependency @1024pix/pix-ui to ^44.2.8 (1d).
- [#8376](https://github.com/1024pix/pix/pull/8376) [BUMP] Update adobe/s3mock Docker tag to v3.5.2 (docker).

## v4.114.0 (12/03/2024)


### :rocket: Amélioration
- [#8356](https://github.com/1024pix/pix/pull/8356) [FEATURE] Finalisation MVP module mots-de-passe-securises (cf. PR #8349).
- [#8240](https://github.com/1024pix/pix/pull/8240) [FEATURE] Mise à jour du wording pour la page de verification du code de certificat (PIX-11384) .
- [#8360](https://github.com/1024pix/pix/pull/8360) [FEATURE] Ajoute d'`alt` manquants sur Modulix.
- [#8343](https://github.com/1024pix/pix/pull/8343) [FEATURE] Revue de design de Modulix.

### :building_construction: Tech
- [#8277](https://github.com/1024pix/pix/pull/8277) [TECH] Migrer les nouvelles couleurs du design system sur Pix Certif (PIX-11528).

### :arrow_up: Montée de version
- [#8375](https://github.com/1024pix/pix/pull/8375) [BUMP] Update dependency @1024pix/eslint-config to ^1.2.3 (orga).
- [#8374](https://github.com/1024pix/pix/pull/8374) [BUMP] Update dependency @1024pix/eslint-config to ^1.2.3 (mon-pix).
- [#8373](https://github.com/1024pix/pix/pull/8373) [BUMP] Update dependency @1024pix/eslint-config to ^1.2.3 (load-testing).
- [#8371](https://github.com/1024pix/pix/pull/8371) [BUMP] Update dependency @1024pix/eslint-config to ^1.2.3 (dossier racine).
- [#8369](https://github.com/1024pix/pix/pull/8369) [BUMP] Update dependency @1024pix/eslint-config to ^1.2.3 (audit-logger).
- [#8368](https://github.com/1024pix/pix/pull/8368) [BUMP] Update dependency @1024pix/eslint-config to ^1.2.3 (api).
- [#8367](https://github.com/1024pix/pix/pull/8367) [BUMP] Update dependency @1024pix/eslint-config to ^1.2.3 (admin).
- [#8366](https://github.com/1024pix/pix/pull/8366) [BUMP] Update dependency @1024pix/eslint-config to ^1.2.3 (1d).
- [#8364](https://github.com/1024pix/pix/pull/8364) [BUMP] Update adobe/s3mock Docker tag to v3.5.2 (.circleci).
- [#8346](https://github.com/1024pix/pix/pull/8346) [BUMP] Update dependency @1024pix/eslint-config to ^1.2.2 (mon-pix).
- [#8359](https://github.com/1024pix/pix/pull/8359) [BUMP] Update dependency @1024pix/eslint-config to ^1.2.2 (orga).
- [#8358](https://github.com/1024pix/pix/pull/8358) [BUMP] Update dependency @1024pix/pix-ui to ^44.2.7 (orga).
- [#8357](https://github.com/1024pix/pix/pull/8357) [BUMP] Update dependency @1024pix/pix-ui to ^44.2.7 (certif).
- [#8353](https://github.com/1024pix/pix/pull/8353) [BUMP] Update dependency @1024pix/pix-ui to ^44.2.7 (admin).
- [#8352](https://github.com/1024pix/pix/pull/8352) [BUMP] Update dependency @1024pix/pix-ui to ^44.2.7 (1d).
- [#8339](https://github.com/1024pix/pix/pull/8339) [BUMP] Update dependency @1024pix/eslint-config to ^1.2.2 (audit-logger).

## v4.113.0 (11/03/2024)


### :rocket: Amélioration
- [#8337](https://github.com/1024pix/pix/pull/8337) [FEATURE] Déplacer chaque module dans son propre fichier (PIX-10962).
- [#8308](https://github.com/1024pix/pix/pull/8308) [FEATURE] Afficher l'option Nederlands dans le sélecteur de langues (PIX-10685).
- [#8330](https://github.com/1024pix/pix/pull/8330) [FEATURE] Finalisation MVP module distinguer-vrai-faux-sur-internet.
- [#8345](https://github.com/1024pix/pix/pull/8345) [FEATURE] Ajouter les étapes de l'import remplacer un étudiant dans PixOrga (PIX-11348).
- [#8333](https://github.com/1024pix/pix/pull/8333) [FEATURE] Finalisation MVP module ports-connexions-essentiels.
- [#8332](https://github.com/1024pix/pix/pull/8332) [FEATURE] Finalisation MVP module principes-fondateurs-wikipedia.
- [#8331](https://github.com/1024pix/pix/pull/8331) [FEATURE] Ajouter les étapes de l'upload pour l'ajout/modification sur l'import SUP (PIX-11347).
- [#8325](https://github.com/1024pix/pix/pull/8325) [FEATURE] Stocke l'état de l'import FREGATA (PIX-11346) .
- [#8289](https://github.com/1024pix/pix/pull/8289) [FEATURE] Améliorer la page de code d'une organisation (pix-11079).
- [#8328](https://github.com/1024pix/pix/pull/8328) [FEATURE] Finalisation MVP module adresse-ip-publique-et-vous.
- [#8327](https://github.com/1024pix/pix/pull/8327) [FEATURE] Finalisation MVP module adresse-mail.
- [#8326](https://github.com/1024pix/pix/pull/8326) [FEATURE] Finalisation MVP module sources-informations.

### :building_construction: Tech
- [#8179](https://github.com/1024pix/pix/pull/8179) [TECH] Prendre en charge les dépréciations d'ember-data sur Pix App.

### :bug: Correction
- [#8307](https://github.com/1024pix/pix/pull/8307) [BUGFIX] Ajout d'un UUID pour enregistrer  les zip d'import dans des dossiers et sous des noms différents (PIX-11482).

### :arrow_up: Montée de version
- [#8344](https://github.com/1024pix/pix/pull/8344) [BUMP] Update dependency @1024pix/eslint-config to ^1.2.2 (load-testing).
- [#8342](https://github.com/1024pix/pix/pull/8342) [BUMP] Update dependency @1024pix/eslint-config to ^1.2.2 (dossier racine).
- [#8322](https://github.com/1024pix/pix/pull/8322) [BUMP] Update dependency @1024pix/eslint-config to ^1.2.2 (1d).
- [#8338](https://github.com/1024pix/pix/pull/8338) [BUMP] Update dependency @1024pix/pix-ui to ^44.2.4 (orga).
- [#8323](https://github.com/1024pix/pix/pull/8323) [BUMP] Update dependency @1024pix/eslint-config to ^1.2.2 (admin).
- [#8336](https://github.com/1024pix/pix/pull/8336) [BUMP] Update dependency @1024pix/pix-ui to ^44.2.4 (certif).
- [#8335](https://github.com/1024pix/pix/pull/8335) [BUMP] Update dependency @1024pix/pix-ui to ^44.2.4 (admin).
- [#8334](https://github.com/1024pix/pix/pull/8334) [BUMP] Update dependency @1024pix/pix-ui to ^44.2.4 (1d).
- [#8320](https://github.com/1024pix/pix/pull/8320) [BUMP] Update dependency @1024pix/eslint-config to ^1.2.1 (api).

## v4.112.0 (07/03/2024)


### :rocket: Amélioration
- [#8321](https://github.com/1024pix/pix/pull/8321) [FEATURE] Terminer un passage (PIX-11511).
- [#8298](https://github.com/1024pix/pix/pull/8298) [FEATURE] Permettre des sous-titres vidéo vides sur Modulix (PIX-10997).
- [#8242](https://github.com/1024pix/pix/pull/8242) [FEATURE] Affiche les classes ayant déjà commencé la mission (Pix -11201).
- [#8285](https://github.com/1024pix/pix/pull/8285) [FEATURE][ADMIN] Ajouter la gestion de la langue nl et la locale nl-BE sur la page d'un utilisateur (PIX-11537).
- [#8262](https://github.com/1024pix/pix/pull/8262) [FEATURE] Ajout module sources-informations (MODC-15).
- [#8276](https://github.com/1024pix/pix/pull/8276) [FEATURE] Fournir la passageId au formulaire de feedback à la fin d'un Module (PIX-11445) .
- [#8275](https://github.com/1024pix/pix/pull/8275) [FEATURE] [API] Ajouter nl-BE dans SUPPORTED_LOCALES (PIX-11232).
- [#8104](https://github.com/1024pix/pix/pull/8104) [FEATURE] Créer une route pour tester l'algorithme Smart Random (PIX-11177).

### :building_construction: Tech
- [#8312](https://github.com/1024pix/pix/pull/8312) [TECH] Ajoute le tracking d'accès aux Contenus Formatifs dans le code (PIX-11413).
- [#8291](https://github.com/1024pix/pix/pull/8291) [TECH] Ajoute une organisation avec import FREGATA dans les seeds (PIX-11541).
- [#8272](https://github.com/1024pix/pix/pull/8272) [TECH] Mis a jour les test e2e a11y avec les endpoints modulix (PIX-11299).
- [#8270](https://github.com/1024pix/pix/pull/8270) [TECH] Corriger le manque de contraste sur les textes dans certaines pages liées à la certification (PIX-11409).
- [#8287](https://github.com/1024pix/pix/pull/8287) [TECH] extrait la détection de  l'encoding du parser (Pix-11518).
- [#8282](https://github.com/1024pix/pix/pull/8282) [TECH] :recycle: Déplacement de `entity-validator.js` vers `src`.
- [#8281](https://github.com/1024pix/pix/pull/8281) [TECH] :recycle: Déplacement de `query-params-utils.js` vers `src`.
- [#8267](https://github.com/1024pix/pix/pull/8267) [TECH] Déporter l'utilisation du S3 dans le usecase pour le SUP (PIX-11503).
- [#8274](https://github.com/1024pix/pix/pull/8274) [TECH] :recycle: Renvoie l'erreur reçue plutôt qu'une erreur maison générique.
- [#8250](https://github.com/1024pix/pix/pull/8250) [TECH] :recycle: Déplacement du service `code-generator` vers `src`.
- [#8271](https://github.com/1024pix/pix/pull/8271) [TECH] :construction_worker: Détecte les branches suceptible d'être périmées.
- [#8258](https://github.com/1024pix/pix/pull/8258) [TECH] Utiliser la variable recommandée par l'hébergeur pour alimenter le header de version.
- [#8253](https://github.com/1024pix/pix/pull/8253) [TECH] :recycle: Déplace la constante `ORGANIZATION_FEATURE` dans le fichier `src/shared/domain/constants.js`.

### :arrow_up: Montée de version
- [#8318](https://github.com/1024pix/pix/pull/8318) [BUMP] Update dependency @1024pix/pix-ui to ^44.2.2 (certif).
- [#8317](https://github.com/1024pix/pix/pull/8317) [BUMP] Update dependency @1024pix/pix-ui to ^44.2.2 (admin).
- [#8316](https://github.com/1024pix/pix/pull/8316) [BUMP] Update dependency @1024pix/pix-ui to ^44.2.2 (1d).
- [#8315](https://github.com/1024pix/pix/pull/8315) [BUMP] Update dependency @1024pix/eslint-config to ^1.1.2 (orga).
- [#8314](https://github.com/1024pix/pix/pull/8314) [BUMP] Update dependency @1024pix/eslint-config to ^1.1.2 (mon-pix).
- [#8313](https://github.com/1024pix/pix/pull/8313) [BUMP] Update dependency @1024pix/eslint-config to ^1.1.2 (load-testing).
- [#8311](https://github.com/1024pix/pix/pull/8311) [BUMP] Update dependency @1024pix/eslint-config to ^1.1.2 (dossier racine).
- [#8310](https://github.com/1024pix/pix/pull/8310) [BUMP] Update dependency @1024pix/eslint-config to ^1.1.2 (certif).
- [#8306](https://github.com/1024pix/pix/pull/8306) [BUMP] Update dependency @1024pix/eslint-config to ^1.1.2 (audit-logger).
- [#8305](https://github.com/1024pix/pix/pull/8305) [BUMP] Update dependency @1024pix/eslint-config to ^1.1.2 (api).
- [#8303](https://github.com/1024pix/pix/pull/8303) [BUMP] Update dependency @1024pix/eslint-config to ^1.1.2 (1d).
- [#8304](https://github.com/1024pix/pix/pull/8304) [BUMP] Update dependency @1024pix/eslint-config to ^1.1.2 (admin).
- [#8301](https://github.com/1024pix/pix/pull/8301) [BUMP] Update dependency @1024pix/pix-ui to ^44.2.1 (certif).
- [#8302](https://github.com/1024pix/pix/pull/8302) [BUMP] Update dependency @1024pix/pix-ui to ^44.2.1 (orga).
- [#8300](https://github.com/1024pix/pix/pull/8300) [BUMP] Update dependency @1024pix/pix-ui to ^44.2.1 (admin).
- [#8299](https://github.com/1024pix/pix/pull/8299) [BUMP] Update dependency @1024pix/pix-ui to ^44.2.1 (1d).
- [#8297](https://github.com/1024pix/pix/pull/8297) [BUMP] Update dependency @1024pix/pix-ui to ^44.2.0 (orga).
- [#8296](https://github.com/1024pix/pix/pull/8296) [BUMP] Update dependency @1024pix/pix-ui to ^44.2.0 (certif).
- [#8293](https://github.com/1024pix/pix/pull/8293) [BUMP] Update dependency @1024pix/pix-ui to ^44.2.0 (admin).
- [#8292](https://github.com/1024pix/pix/pull/8292) [BUMP] Update dependency @1024pix/pix-ui to ^44.2.0 (1d).
- [#8283](https://github.com/1024pix/pix/pull/8283) [BUMP] Update crazy-matt/manage-stale-branches action to v1.1.0 (workflows).

### :coffee: Autre
- [#8319](https://github.com/1024pix/pix/pull/8319) Updated translations from Phrase.

## v4.111.0 (05/03/2024)


### :rocket: Amélioration
- [#8238](https://github.com/1024pix/pix/pull/8238) [FEATURE] Eviter le CLS dû au chargement de l'illustration d'un Module.
- [#8226](https://github.com/1024pix/pix/pull/8226) [FEATURE] Ajout du nouveau fond d'écran pour les 3 page d'identification (Pix-11077).
- [#8227](https://github.com/1024pix/pix/pull/8227) [FEATURE] Stocke l'état de l'import SIECLE au fur et à mesure des étapes (PIX-11345).
- [#8239](https://github.com/1024pix/pix/pull/8239) [FEATURE] Enlever la barre de navigation sur la page /details de Modulix (PIX-11480).

### :building_construction: Tech
- [#8159](https://github.com/1024pix/pix/pull/8159) [TECH] Ajouter le workflow de prise en charge de dépréciation d'Ember.js sur Pix App .
- [#8236](https://github.com/1024pix/pix/pull/8236) [TECH] :recycle: Déplacement du `logger` dans le répertoire `src`.
- [#8249](https://github.com/1024pix/pix/pull/8249) [TECH] :recycle: déplacement de `area-repository` vers le répertoire `src/shared`.
- [#8254](https://github.com/1024pix/pix/pull/8254) [TECH] :recycle: Déplace `activity-serializer.js` ver `src/school`.

### :bug: Correction
- [#8199](https://github.com/1024pix/pix/pull/8199) [BUGFIX] Activer le scoring pour les certifications v3 terminées par le surveillant (PIX-11421).
- [#8263](https://github.com/1024pix/pix/pull/8263) [BUGFIX] Rétablir la création de RT d'un profil-cible (PIX-11508).

### :arrow_up: Montée de version
- [#8266](https://github.com/1024pix/pix/pull/8266) [BUMP] Update dependency query-string to v9 (admin).
- [#8268](https://github.com/1024pix/pix/pull/8268) [BUMP] Update dependency query-string to v9 (orga).
- [#8265](https://github.com/1024pix/pix/pull/8265) [BUMP] Update dependency @1024pix/pix-ui to ^44.1.0 (certif).
- [#8260](https://github.com/1024pix/pix/pull/8260) [BUMP] Update dependency @1024pix/pix-ui to ^44.1.0 (admin).
- [#8259](https://github.com/1024pix/pix/pull/8259) [BUMP] Update dependency @1024pix/pix-ui to ^44.1.0 (1d).

## v4.110.0 (04/03/2024)


### :rocket: Amélioration
- [#8233](https://github.com/1024pix/pix/pull/8233) [FEATURE] Ajout de commentaire jury automatique en cas d'annulation de certification pour trop de challenges neutralisés pour la V2 (PIX-10532).
- [#8219](https://github.com/1024pix/pix/pull/8219) [FEATURE] Ajout images et derniers grains ports-connexions-essentiels (MODC-11)(MODC-13).
- [#8217](https://github.com/1024pix/pix/pull/8217) [FEATURE] Pouvoir mettre en pause des contenus formatifs sur Pix Admin (PIX-6509).
- [#8228](https://github.com/1024pix/pix/pull/8228) [FEATURE] Revue des clés de trad Modulix.
- [#8230](https://github.com/1024pix/pix/pull/8230) [FEATURE] Màj de contenu après revue Minico - module principes-fondateurs-wikipedia.
- [#8130](https://github.com/1024pix/pix/pull/8130) [FEATURE] Intégration retour A Tricot, module bien-ecrire-son-adresse-mail (MODC-37)(MODC-40).
- [#8115](https://github.com/1024pix/pix/pull/8115) [FEATURE] Enregistrer les capacités d'un candidat tout au long de sa certif v3 (PIX-11262).

### :building_construction: Tech
- [#8190](https://github.com/1024pix/pix/pull/8190) [TECH] Vérifie l'état du parcours avant la demande de correction d'une réponse (PIX-11318).
- [#8234](https://github.com/1024pix/pix/pull/8234) [TECH] Séparation de l'injection du scoring et de shared (PIX-11472).
- [#8203](https://github.com/1024pix/pix/pull/8203) [TECH] Modifier l'expression régulière pour le nettoyage automatique de la base de données de test (PIX-11399).
- [#8222](https://github.com/1024pix/pix/pull/8222) [TECH] Déplacement du service de récupération de texte traduit.
- [#8215](https://github.com/1024pix/pix/pull/8215) [TECH] Renommage de la mise à jour des commentaires de certification sur admin en commentaire jury.

### :bug: Correction
- [#8232](https://github.com/1024pix/pix/pull/8232) [BUGFIX] rafraichit les divisions après un import (PIX-11463).
- [#8151](https://github.com/1024pix/pix/pull/8151) [BUGFIX] Permettre de publier un certification en erreur si elle est annulée  (PIX-11374).
- [#8224](https://github.com/1024pix/pix/pull/8224) [BUGFIX] Remonter le dernier résultat publié d'un élève quand il est bien entré en session (PIX-11398).
- [#8200](https://github.com/1024pix/pix/pull/8200) [BUGFIX] Créer une session de certification sur d'anciens navigateurs (PIX-11269).
- [#8229](https://github.com/1024pix/pix/pull/8229) [BUGFIX] Répare le dégradé de fond sur la page des CGU de PixOrga (PIX-11464).

### :arrow_up: Montée de version
- [#8256](https://github.com/1024pix/pix/pull/8256) [BUMP] Update dependency @1024pix/pix-ui to ^44.1.0 (orga).
- [#8255](https://github.com/1024pix/pix/pull/8255) [BUMP] Update dependency @1024pix/pix-ui to ^44.0.4 (certif).
- [#8252](https://github.com/1024pix/pix/pull/8252) [BUMP] Update dependency @1024pix/pix-ui to ^44.0.4 (admin).
- [#8251](https://github.com/1024pix/pix/pull/8251) [BUMP] Update dependency @1024pix/pix-ui to ^44.0.4 (1d).
- [#8109](https://github.com/1024pix/pix/pull/8109) [BUMP] Update dependency node to v20.11.1.
- [#8248](https://github.com/1024pix/pix/pull/8248) [BUMP] Lock file maintenance (admin).
- [#8247](https://github.com/1024pix/pix/pull/8247) [BUMP] Lock file maintenance (1d).
- [#8246](https://github.com/1024pix/pix/pull/8246) [BUMP] Update dependency @1024pix/pix-ui to ^44.0.3 (orga).
- [#8245](https://github.com/1024pix/pix/pull/8245) [BUMP] Update dependency @1024pix/pix-ui to ^44.0.3 (certif).
- [#8244](https://github.com/1024pix/pix/pull/8244) [BUMP] Update dependency @1024pix/pix-ui to ^44.0.3 (admin).
- [#8243](https://github.com/1024pix/pix/pull/8243) [BUMP] Update dependency @1024pix/pix-ui to ^44.0.3 (1d).
- [#8235](https://github.com/1024pix/pix/pull/8235) [BUMP] Update browser-tools orb to v1.4.8 (.circleci).

## v4.109.0 (29/02/2024)


### :rocket: Amélioration
- [#8196](https://github.com/1024pix/pix/pull/8196) [FEATURE] change le code campagne depuis l'admin (PIX-11401).
- [#8173](https://github.com/1024pix/pix/pull/8173) [FEATURE] Créer la route PATCH /api/admin/certification-courses/{id} (PIX-10820).
- [#8162](https://github.com/1024pix/pix/pull/8162) [FEATURE] Afficher l'adresse où se déroule la session en tant que nom du site sur la page surveillant (PIX-11340).
- [#8168](https://github.com/1024pix/pix/pull/8168) [FEATURE] Améliorer l'affichage des explications pour signaler une question lors d'une certification sur Pix App (PIX-11383).

### :building_construction: Tech
- [#8221](https://github.com/1024pix/pix/pull/8221) [TECH] Ajoute la version de l'application client dans un entête HTTP spécifique (PIX-11356).
- [#8134](https://github.com/1024pix/pix/pull/8134) [TECH] migration du fichier `solution adapter` dans le répertoire `src`.

### :bug: Correction
- [#8223](https://github.com/1024pix/pix/pull/8223) [BUGFIX] supprime le message d'alerte du l'import sup après un import sco (PIX-11440).
- [#8201](https://github.com/1024pix/pix/pull/8201) [BUGFIX] Le calcul automatique de la certificabilité n'était pas utilisé sur la page de détail d'un participant (PIX-11173).
- [#8218](https://github.com/1024pix/pix/pull/8218) [BUGFIX] Récupérer les SSO OIDC dans le formulaire de modification d'une organisation qui ne l'étaient plus (PIX-11450).

### :arrow_up: Montée de version
- [#8220](https://github.com/1024pix/pix/pull/8220) [BUMP] Update dependency schemalint to v2 (api).

## v4.108.0 (28/02/2024)


### :rocket: Amélioration
- [#8216](https://github.com/1024pix/pix/pull/8216) [FEATURE] Ajout de la page mission détail dans Pix orga (PIX-11197).
- [#8146](https://github.com/1024pix/pix/pull/8146) [FEATURE] Ajouter un commentaire automatique pour la fraude candidat lors de la certification (PIX-10531).
- [#8191](https://github.com/1024pix/pix/pull/8191) [FEATURE] Améliorer le design de la liste des classes (Pix-11076).
- [#8170](https://github.com/1024pix/pix/pull/8170) [FEATURE] Supprimer le pluriel dans la section de la certification complémentaire dans l'attestation Pix (PIX-11385).

### :bug: Correction
- [#8214](https://github.com/1024pix/pix/pull/8214) [BUGFIX] Remise en place des propriétés de config.js nécessaires pour les envois de résutats de France Travail.

## v4.107.2 (28/02/2024)


### :bug: Correction
- [#8214](https://github.com/1024pix/pix/pull/8214) [BUGFIX] Remise en place des propriétés de config.js nécessaires pour les envois de résutats de France Travail.

## v4.107.1 (27/02/2024)


### :building_construction: Tech
- [#8161](https://github.com/1024pix/pix/pull/8161) [TECH] Mise à jour des dépendances PixOrga (PIX-11393).
- [#8158](https://github.com/1024pix/pix/pull/8158) [TECH] Séparer le lint du test pour PixAPP (PIX-11392).

### :bug: Correction
- [#8205](https://github.com/1024pix/pix/pull/8205) [BUGFIX] Revert "[BUGFIX] Empêche le job de calcul de résultat de s'effectuer si la participation n'est pas partagée (PIX-11350)".
- [#8133](https://github.com/1024pix/pix/pull/8133) [BUGFIX] Corrige le nettoyage intempestif de caractères lors de la recherche sur PixAdmin (PIX-11386).

## v4.107.0 (27/02/2024)


### :rocket: Amélioration
- [#8172](https://github.com/1024pix/pix/pull/8172) [FEATURE] Améliorer les messages d'erreur lors de la validation des modules (PIX-11303).
- [#8164](https://github.com/1024pix/pix/pull/8164) [FEATURE][API] Supprimer la contrainte sur la locale dans la table users (PIX-11231).

### :building_construction: Tech
- [#8194](https://github.com/1024pix/pix/pull/8194) [TECH] Avoir des erreurs serveurs en anglais (PIX-10792).
- [#8171](https://github.com/1024pix/pix/pull/8171) [TECH] Restreindre l'accès à la dernière activité aux passages de mission en cours (PIX-11319).
- [#8169](https://github.com/1024pix/pix/pull/8169) [TECH][API] Améliorer le passage des détails d'une erreur OIDC vers datadog (PIX-11391).
- [#8136](https://github.com/1024pix/pix/pull/8136) [TECH] Renommer le terme AuthenticationUrl en AuthorizationUrl (PIX-11070).

### :bug: Correction
- [#8180](https://github.com/1024pix/pix/pull/8180) [BUGFIX] Réactivation des stats d'accès aux tutos (PIX-11408).
- [#8166](https://github.com/1024pix/pix/pull/8166) [BUGFIX] Corrige le score par compétences pour les capacités très hautes et très basses (PIX-11395).
- [#8155](https://github.com/1024pix/pix/pull/8155) [BUGFIX] Vide la table job de PGBOSS après chaque test (PIX-11301).
- [#8160](https://github.com/1024pix/pix/pull/8160) [BUGFIX][API] Ajouter l'import manquant des traductions Néerlandaises (PIX-11218).

### :arrow_up: Montée de version
- [#8198](https://github.com/1024pix/pix/pull/8198) [BUMP] Lock file maintenance (certif).
- [#8197](https://github.com/1024pix/pix/pull/8197) [BUMP] Lock file maintenance (1d).
- [#8188](https://github.com/1024pix/pix/pull/8188) [BUMP] Update browser-tools orb to v1.4.7 (.circleci).
- [#8187](https://github.com/1024pix/pix/pull/8187) [BUMP] Update dependency @1024pix/pix-ui to ^44.0.2 (orga).
- [#8186](https://github.com/1024pix/pix/pull/8186) [BUMP] Update dependency @1024pix/pix-ui to ^44.0.2 (certif).
- [#8185](https://github.com/1024pix/pix/pull/8185) [BUMP] Update dependency @1024pix/pix-ui to ^44.0.2 (admin).
- [#8184](https://github.com/1024pix/pix/pull/8184) [BUMP] Lock file maintenance (audit-logger).
- [#8183](https://github.com/1024pix/pix/pull/8183) [BUMP] Update dependency @1024pix/pix-ui to ^44.0.2 (1d).
- [#8182](https://github.com/1024pix/pix/pull/8182) [BUMP] Lock file maintenance (admin).
- [#8181](https://github.com/1024pix/pix/pull/8181) [BUMP] Update dependency @1024pix/pix-ui to ^44.0.1 (1d).
- [#8178](https://github.com/1024pix/pix/pull/8178) [BUMP] Lock file maintenance (orga).
- [#8177](https://github.com/1024pix/pix/pull/8177) [BUMP] Update dependency husky to v9 (dossier racine).
- [#8176](https://github.com/1024pix/pix/pull/8176) [BUMP] Lock file maintenance (mon-pix).
- [#8175](https://github.com/1024pix/pix/pull/8175) [BUMP] Update dependency file-type to v19 (api).
- [#8174](https://github.com/1024pix/pix/pull/8174) [BUMP] Update dependency eslint-plugin-unicorn to v51 (api).
- [#8165](https://github.com/1024pix/pix/pull/8165) [BUMP] Update dependency ember-cli-showdown to v9 (orga).
- [#8163](https://github.com/1024pix/pix/pull/8163) [BUMP] Update dependency ember-cli-showdown to v9 (admin).
- [#8156](https://github.com/1024pix/pix/pull/8156) [BUMP] Update dependency @1024pix/pix-ui to v44 (orga).

### :coffee: Autre
- [#8050](https://github.com/1024pix/pix/pull/8050) [REFACTOR] Améliorer la validation de charge utile de création des RT (PIX-10971).
- [#8139](https://github.com/1024pix/pix/pull/8139) [FEAT] :safety_vest: Enregistre le `next-challenge.id` dans l'`assessment`.

## v4.106.1 (27/02/2024)

### :bug: Correction
- [#8144](https://github.com/1024pix/pix/pull/8144) [BUGFIX] Revert "[BUGFIX] Empêche le job de calcul de résultat de s'effectuer si la participation n'est pas partagée (PIX-11350)."


## v4.106.0 (23/02/2024)


### :rocket: Amélioration
- [#8150](https://github.com/1024pix/pix/pull/8150) [FEATURE] Amélioration du design de la page de la liste élèves (pix-11068).
- [#8118](https://github.com/1024pix/pix/pull/8118) [FEATURE] Ajout et modification de contenu au module "Mots de passe sécurisés".
- [#8140](https://github.com/1024pix/pix/pull/8140) [FEATURE] Enregistrer l'userId dans le passage lorsque c'est possible (PIX-11309).
- [#8114](https://github.com/1024pix/pix/pull/8114) [FEATURE] Afficher les erreurs sur la page d'import des nouveaux participants/élèves/étudiants (PIX-10954).
- [#8117](https://github.com/1024pix/pix/pull/8117) [FEATURE] Stocke l'état des imports (PIX-11344).
- [#8129](https://github.com/1024pix/pix/pull/8129) [FEATURE] Supporter l'ajout de nouveau élements dans l'API sans les prendre en compte directement dans le front (PIX-11297).
- [#8092](https://github.com/1024pix/pix/pull/8092) [FEATURE] Ajout en DB des configurations pour les niveaux par compétences (PIX-11272).
- [#8128](https://github.com/1024pix/pix/pull/8128) [FEATURE] Ajouter un bandeau beta pour expérimentation (PIX-10992).
- [#8119](https://github.com/1024pix/pix/pull/8119) [FEATURE] Créer le type de CF Modulix (PIX-11275) (PIX-11305).
- [#8081](https://github.com/1024pix/pix/pull/8081) [FEATURE] Filtrer les parcours autonomes de la liste des participations de campagnes (PIX-10674).
- [#8113](https://github.com/1024pix/pix/pull/8113) [FEATURE] Ajout d'un schéma dans le module ce-que-revele-ladresse-ip-publique-sur-vous (MODC-18).
- [#8116](https://github.com/1024pix/pix/pull/8116) [FEATURE][ADMIN] Ajouter un formulaire pour rattacher une organisation fille à une organisation mère (PIX-10046).

### :building_construction: Tech
- [#8087](https://github.com/1024pix/pix/pull/8087) [TECH] Mise à jour du fichier sample.env pour la config docker.
- [#8122](https://github.com/1024pix/pix/pull/8122) [TECH] :recycle: déplace les « identifiers types » dans le répertoire `src`.

### :bug: Correction
- [#8120](https://github.com/1024pix/pix/pull/8120) [BUGFIX] Le polyfill randomUUID est absent du packaging (PIX-10976).
- [#8144](https://github.com/1024pix/pix/pull/8144) [BUGFIX] Empêche le job de calcul de résultat de s'effectuer si la participation n'est pas partagée (PIX-11350).
- [#8132](https://github.com/1024pix/pix/pull/8132) [BUGFIX] Bug lors d'un enchainement de 2 QCM  (pix-11357).
- [#8124](https://github.com/1024pix/pix/pull/8124) [BUGFIX] Corrige le lien vers la dernière participation partagée depuis l'activité d'un participant (PIX-11170).
- [#8126](https://github.com/1024pix/pix/pull/8126) [BUGFIX] Revue de l'attribut rel sur les liens de tutos (PIX-11306) (PIX-11307).
- [#8108](https://github.com/1024pix/pix/pull/8108) [BUGFIX] Empêcher de cliquer sur un autre bouton lorsque l'on partage ou tente d'améliorer son résultat sur Pix APP (PIX-11304).
- [#8127](https://github.com/1024pix/pix/pull/8127) [BUGFIX] Correction et amélioration générateurs d'éléments Modulix.
- [#8111](https://github.com/1024pix/pix/pull/8111) [BUGFIX] Afficher les bonnes icônes en version néerlandaise (PIX-11249).
- [#7971](https://github.com/1024pix/pix/pull/7971) [BUGFIX] Absence de message d'erreur lors de la perte de connexion internet dans l'espace surveillant sur Pix Certif (PIX-11017).

### :arrow_up: Montée de version
- [#8149](https://github.com/1024pix/pix/pull/8149) [BUMP] Update dependency @1024pix/pix-ui to v44 (admin).
- [#8154](https://github.com/1024pix/pix/pull/8154) [BUMP] Update nginx Docker tag to v1.25.4.
- [#8152](https://github.com/1024pix/pix/pull/8152) [BUMP] Update dependency @1024pix/pix-ui to v44 (certif).
- [#8148](https://github.com/1024pix/pix/pull/8148) [BUMP] Update dependency @1024pix/pix-ui to v44 (1d).
- [#8143](https://github.com/1024pix/pix/pull/8143) [BUMP] Update dependency @1024pix/pix-ui to ^43.1.0 (admin).
- [#8071](https://github.com/1024pix/pix/pull/8071) [BUMP] Update dependency eslint-plugin-ember to v12 (certif).
- [#8147](https://github.com/1024pix/pix/pull/8147) [BUMP] Update dependency @1024pix/pix-ui to ^43.1.0 (orga).
- [#8145](https://github.com/1024pix/pix/pull/8145) [BUMP] Update dependency @1024pix/pix-ui to ^43.1.0 (certif).
- [#8141](https://github.com/1024pix/pix/pull/8141) [BUMP] Update dependency @1024pix/pix-ui to ^43.1.0 (1d).
- [#8138](https://github.com/1024pix/pix/pull/8138) [BUMP] Update adobe/s3mock Docker tag to v3.4.0 (dossier racine).
- [#8137](https://github.com/1024pix/pix/pull/8137) [BUMP] Update adobe/s3mock Docker tag to v3.4.0 (docker).
- [#7997](https://github.com/1024pix/pix/pull/7997) [BUMP] Update dependency @1024pix/pix-ui to v43 (Pix-11330).
- [#8135](https://github.com/1024pix/pix/pull/8135) [BUMP] Update adobe/s3mock Docker tag to v3.4.0 (.circleci).
- [#8077](https://github.com/1024pix/pix/pull/8077) [BUMP] Update dependency eslint-plugin-ember to v12 (mon-pix).
- [#8056](https://github.com/1024pix/pix/pull/8056) [BUMP] Update dependency eslint-plugin-ember to v12 (admin).

## v4.105.0 (21/02/2024)


### :rocket: Amélioration
- [#8090](https://github.com/1024pix/pix/pull/8090) [FEATURE] Affichage des commentaires auto jury ou commentaires manuels si absents (PIX-10528).
- [#8057](https://github.com/1024pix/pix/pull/8057) [FEATURE] Affichage et vérification des QCM (PIX-11100) (PIX-11024) (PIX-11135).
- [#8075](https://github.com/1024pix/pix/pull/8075) [FEATURE] Résoudre automatiquement les signalements validés par le surveillant (PIX-11207).
- [#8110](https://github.com/1024pix/pix/pull/8110) [FEATURE] Valider l'HTML des champs qui requièrent de l'HTML (PIX-10242).
- [#8101](https://github.com/1024pix/pix/pull/8101) [FEATURE] Afficher les missions  dans Pix orga (Pix-11196).
- [#8028](https://github.com/1024pix/pix/pull/8028) [FEATURE] Utiliser la librairie openid-client (PIX-11130).

### :building_construction: Tech
- [#8066](https://github.com/1024pix/pix/pull/8066) [TECH] Extraction d'une erreur spécifique pour pix 1d : `MissionNotFoundError`.
- [#8095](https://github.com/1024pix/pix/pull/8095) [TECH] Migration de fichiers vers src.
- [#8082](https://github.com/1024pix/pix/pull/8082) [TECH] Extraction d'une erreur spécifique pour pix 1d : `SchoolNotFoundError`.
- [#8064](https://github.com/1024pix/pix/pull/8064) [TECH] extraction d'une erreur spécifique au domaine `school` : `ActivityErrorNotFound`.
- [#8107](https://github.com/1024pix/pix/pull/8107) [TECH] Protéger la route récupérant la liste des fournisseurs d'identité sur Pix Admin (PIX-10706).

### :bug: Correction
- [#8112](https://github.com/1024pix/pix/pull/8112) [BUGFIX] Afficher la dernière participation partagé d'une collecte de profil dans l'onglet Résultat (PIX-11314).
- [#8094](https://github.com/1024pix/pix/pull/8094) [BUGFIX] Mise à jour des seeds pour la configuration de la certif v3 (PIX-11278).
- [#8078](https://github.com/1024pix/pix/pull/8078) [BUGFIX] Supprimer les feedbacks précédents lorsqu'un utilisateur repasse un module (PIX-11175).
- [#8106](https://github.com/1024pix/pix/pull/8106) [BUGFIX] Affichage le pourcentage de réussite qu'une fois sur la page de résultat (PIX-10469).
- [#8083](https://github.com/1024pix/pix/pull/8083) [BUGFIX] Erreur lors du patch d'une thématique dans le cache LCMS de recette (PIX-11260).
- [#8091](https://github.com/1024pix/pix/pull/8091) [BUGFIX] Permettre de renvoyer un fichier PDF / JSON du profil cible ayant des caractères spéciaux (PIX-11265).

### :arrow_up: Montée de version
- [#8105](https://github.com/1024pix/pix/pull/8105) [BUMP] Update Node.js to v20.11.1.

## v4.104.0 (19/02/2024)


### :rocket: Amélioration
- [#8097](https://github.com/1024pix/pix/pull/8097) [FEATURE] Créé des scripts pour générer des élements Modulix (PIX-11270).
- [#8102](https://github.com/1024pix/pix/pull/8102) [FEATURE] Ajout des liens vers image et dernier grain de ports-connexions-essentiels (MODC-11).
- [#7970](https://github.com/1024pix/pix/pull/7970) [FEATURE] Ajouter le paramètre audience aux routes API 'oidc/token' et 'oidc/authentication-url' pour le besoin SSO Google (PIX-10966).
- [#8089](https://github.com/1024pix/pix/pull/8089) [FEATURE] Création du module distinguer-vrai-faux-sur-internet (MODC-26) (PIX-11267).
- [#8093](https://github.com/1024pix/pix/pull/8093) [FEATURE] créer la table organization-imports (PIX-11255).
- [#8085](https://github.com/1024pix/pix/pull/8085) [FEATURE] Ajout des traductions en anglais (PIX-11176).
- [#8023](https://github.com/1024pix/pix/pull/8023) [FEATURE] Afficher la date de fin de certification lorsque le candidat n'a pas répondu à toutes les questions (PIX-11083).
- [#8063](https://github.com/1024pix/pix/pull/8063) [FEATURE] Ajout d'une intro au module adresse IP publique (PIX-11167).
- [#8058](https://github.com/1024pix/pix/pull/8058) [FEATURE] Ajouter la vérification d'un QCM pour modulix (PIX-11134).
- [#7915](https://github.com/1024pix/pix/pull/7915) [FEATURE] Ajouter un label "organisation enfant" sur la page d'une organisation enfant (PIX-10050).

### :building_construction: Tech
- [#8099](https://github.com/1024pix/pix/pull/8099) [TECH] Utiliser les bon paramètres couleurs sur PixAPP (PIX-11286).
- [#8098](https://github.com/1024pix/pix/pull/8098) [TECH] Utiliser les bon arguments de couleurs sur PixAdmin (PIX-11284).
- [#8100](https://github.com/1024pix/pix/pull/8100) [TECH] Utiliser les bon arguments couleurs sur les PixButton dans PixCertif (Pix-11287).
- [#8096](https://github.com/1024pix/pix/pull/8096) [TECH] Utiliser les bon arguments des couleurs sur les PixButton sur  Pix Orga (PIX-11283).
- [#8084](https://github.com/1024pix/pix/pull/8084) [TECH] Permettre de tracer les challenge non trouver en certification (PIX-11261).
- [#8000](https://github.com/1024pix/pix/pull/8000) [TECH] Stocke les fichiers d'import du SUP dans un bucket S3 (PIX-11064).
- [#8080](https://github.com/1024pix/pix/pull/8080) [TECH] Revue Matomo pour Modulix (PIX-11162).
- [#8060](https://github.com/1024pix/pix/pull/8060) [TECH] Mettre à jour ember-data sur PixOrga (PIX-11204).
- [#8079](https://github.com/1024pix/pix/pull/8079) [TECH] Deplacement des versions de navigateurs pour docker (PIX-11235).

### :bug: Correction
- [#8103](https://github.com/1024pix/pix/pull/8103) [BUGFIX] Autoriser le champ participantExternalId à s'afficher sur plusieurs ligne (PIX-11288).
- [#8088](https://github.com/1024pix/pix/pull/8088) [BUGFIX] affiche les dernières participations partagées dans la page résultats (Pix-11171).
- [#8086](https://github.com/1024pix/pix/pull/8086) [BUGFIX] Rendre les placeholders des inputs sur Pix Admin (PIX-11258).
- [#8019](https://github.com/1024pix/pix/pull/8019) [BUGFIX] Modifier les noms des types d'organisation en réseau (PIX-11038).
- [#8073](https://github.com/1024pix/pix/pull/8073) [BUGFIX] Re finalisation session impossible si le test est terminé par la finalisation (PIX-11215).

## v4.103.0 (15/02/2024)


### :rocket: Amélioration
- [#8074](https://github.com/1024pix/pix/pull/8074) [FEATURE] Affichage dynamique des objectifs pour la page de présentation et la page de fin d'une mission(Pix-10278).
- [#7995](https://github.com/1024pix/pix/pull/7995) [FEATURE] Uniformiser les visuels des imports sur Pix Orga (PIX-10936).
- [#7917](https://github.com/1024pix/pix/pull/7917) [FEATURE] Changer Pôle Emploi en France Travail sur les différents écrans du parcours PE (PIX-10516).
- [#8015](https://github.com/1024pix/pix/pull/8015) [FEATURE] Changer le texte présent sous la barre d'avancement des écrans intermédiaires (PIX-10922).

### :building_construction: Tech
- [#8065](https://github.com/1024pix/pix/pull/8065) [TECH] stocke le fichier d'import fregata sur s3 (PIX-11063).
- [#5867](https://github.com/1024pix/pix/pull/5867) [TECH] Introduit la notion d'ApplicationTransaction (PIX-11205).

### :bug: Correction
- [#8076](https://github.com/1024pix/pix/pull/8076) [BUGFIX] Corriges l'affichage des participantExternalId sur les participations dans PixAdmin (PIX-11214).
- [#8047](https://github.com/1024pix/pix/pull/8047) [BUGFIX] Corriger l'affichage de la progression dans l'export des CSV (PIX-11163).
- [#8067](https://github.com/1024pix/pix/pull/8067) [BUGFIX] Afficher correctement le module de didacticiel.
- [#8025](https://github.com/1024pix/pix/pull/8025) [BUGFIX] Réparer les barres de scroll non désirées des épreuves Ember (PIX-11139).

### :arrow_up: Montée de version
- [#8001](https://github.com/1024pix/pix/pull/8001) [BUMP] Update dependency @1024pix/pix-ui to v43 (admin).
- [#8072](https://github.com/1024pix/pix/pull/8072) [BUMP] Lock file maintenance (api).
- [#8070](https://github.com/1024pix/pix/pull/8070) [BUMP] Update adobe/s3mock Docker tag to v3.3.0 (dossier racine).
- [#8069](https://github.com/1024pix/pix/pull/8069) [BUMP] Update adobe/s3mock Docker tag to v3.3.0 (docker).
- [#8068](https://github.com/1024pix/pix/pull/8068) [BUMP] Update adobe/s3mock Docker tag to v3.3.0 (.circleci).
- [#8053](https://github.com/1024pix/pix/pull/8053) [BUMP] Update dependency cypress-visual-regression to v5 (e2e).
- [#8061](https://github.com/1024pix/pix/pull/8061) [BUMP] Met à jour `Ember-flatpickr`.

### :coffee: Autre
- [#7957](https://github.com/1024pix/pix/pull/7957) [FEAT] Afficher la liste des missions trouvé dans le LCMS (PIX-10277).
- [#8035](https://github.com/1024pix/pix/pull/8035) [CLEANUP] Suppression du script compute-lead-times.

## v4.102.0 (13/02/2024)


### :rocket: Amélioration
- [#8033](https://github.com/1024pix/pix/pull/8033) [FEATURE] stocke les fichiers d'import dans s3... le retour (PIX-10927).
- [#7998](https://github.com/1024pix/pix/pull/7998) [FEATURE] Remplacer les chiffres de la barre d'avancement par Question X/Y (PIX-10921).
- [#8026](https://github.com/1024pix/pix/pull/8026) [FEATURE] Création d'un module MVP sur les adresses IP publique.
- [#8017](https://github.com/1024pix/pix/pull/8017) [FEATURE] Ne pas écraser le statut "endedBySupervisor" à la finalisation d'une session (pix-11082).
- [#8021](https://github.com/1024pix/pix/pull/8021) [FEATURE] Ajouter un QCM dans le referenciel Modulix (PIX-11099).
- [#8006](https://github.com/1024pix/pix/pull/8006) [FEATURE] Rediriger vers la page de fin de module (PIX-10471).
- [#7976](https://github.com/1024pix/pix/pull/7976) [FEATURE] Restreindre les informations récupérées pour supprimer un signalement (PIX-11033).

### :building_construction: Tech
- [#8022](https://github.com/1024pix/pix/pull/8022) [TECH] :broom: Réduction du nombre de fichier de configuration à suivre.

### :bug: Correction
- [#8062](https://github.com/1024pix/pix/pull/8062) [BUGFIX] Finalisation session impossible si le test est terminé par le surveillant par le surveillant (PIX-11179).
- [#8020](https://github.com/1024pix/pix/pull/8020) [BUGFIX] Ne retourner que la dernière certification publiée d'un élève dans Pix Orga (PIX-10972).
- [#8059](https://github.com/1024pix/pix/pull/8059) [BUGFIX] Rebascule ember-flatpickr en version 4 sur admin et certif (PIX-11185).
- [#8027](https://github.com/1024pix/pix/pull/8027) [BUGFIX] Téléchargement import en masse KO si pas d'habilitations (PIX-11144).
- [#8039](https://github.com/1024pix/pix/pull/8039) [BUGFIX] Afficher correctement le nombre d'une question lors de la reprise d'une certif v3 (PIX-11150).
- [#8045](https://github.com/1024pix/pix/pull/8045) [BUGFIX] Remise à jour du contenu du didacticiel Modulix (image et vidéo).
- [#8030](https://github.com/1024pix/pix/pull/8030) [BUGFIX] Retirer les balises '<br>' dans le message lorsque l'utilisateur quitte le focus. (PIX-11148).

### :arrow_up: Montée de version
- [#8055](https://github.com/1024pix/pix/pull/8055) [BUMP] Update dependency eslint-plugin-ember to v12 (1d).
- [#8054](https://github.com/1024pix/pix/pull/8054) [BUMP] Update dependency ember-concurrency to v4 (admin).
- [#8052](https://github.com/1024pix/pix/pull/8052) [BUMP] Update dependency ember-cli-showdown to v8 (orga).
- [#8049](https://github.com/1024pix/pix/pull/8049) [BUMP] Update dependency ember-cli-showdown to v8 (admin).
- [#8002](https://github.com/1024pix/pix/pull/8002) [BUMP] Update dependency @1024pix/pix-ui to v43 (certif).
- [#8048](https://github.com/1024pix/pix/pull/8048) [BUMP] Update dependency ember-flatpickr to v7 (certif).
- [#8046](https://github.com/1024pix/pix/pull/8046) [BUMP] Update dependency ember-flatpickr to v7 (admin).
- [#8031](https://github.com/1024pix/pix/pull/8031) [BUMP] Update dependency chai to v5 (api).
- [#8044](https://github.com/1024pix/pix/pull/8044) [BUMP] Update dependency npm-run-all2 to v6 (e2e).
- [#8043](https://github.com/1024pix/pix/pull/8043) [BUMP] Update dependency npm-run-all2 to v6 (orga).
- [#8042](https://github.com/1024pix/pix/pull/8042) [BUMP] Update dependency npm-run-all2 to v6 (mon-pix).
- [#8041](https://github.com/1024pix/pix/pull/8041) [BUMP] Update dependency npm-run-all2 to v6 (dossier racine).
- [#8040](https://github.com/1024pix/pix/pull/8040) [BUMP] Update dependency ember-file-upload to v9 (certif).
- [#8038](https://github.com/1024pix/pix/pull/8038) [BUMP] Update dependency ember-file-upload to v9 (admin).
- [#8037](https://github.com/1024pix/pix/pull/8037) [BUMP] Update dependency ember-exam to v9 (mon-pix).
- [#8036](https://github.com/1024pix/pix/pull/8036) [BUMP] Update dependency ember-exam to v9 (admin).
- [#8034](https://github.com/1024pix/pix/pull/8034) [BUMP] Update dependency npm-run-all2 to v6 (api).
- [#8032](https://github.com/1024pix/pix/pull/8032) [BUMP] Update dependency npm-run-all2 to v6 (admin).
- [#8029](https://github.com/1024pix/pix/pull/8029) [BUMP] Update dependency npm-run-all2 to v6 (1d).

## v4.101.0 (09/02/2024)


### :rocket: Amélioration
- [#7999](https://github.com/1024pix/pix/pull/7999) [FEATURE] Modifier le message de sortie d'épreuve focus lors d'une certification V3 (PIX-11031).

### :building_construction: Tech
- [#8012](https://github.com/1024pix/pix/pull/8012) [TECH] [HOTFIX] Retirer la librairie openid-client.

### :bug: Correction
- [#8024](https://github.com/1024pix/pix/pull/8024) [BUGFIX] Corrige l'export des campagnes de collecte de profils pour utiliser les chunks correctement (PIX-11141).
- [#8004](https://github.com/1024pix/pix/pull/8004) [BUGFIX] Permettre de finaliser une session avec des certifications qui n'ont pas encore de scoring (PIX-11105).
- [#8018](https://github.com/1024pix/pix/pull/8018) [BUGFIX] Permettre l'affichage du nom de campagne sur plusieurs ligne dans la liste sur PixOrga (PIX-11133).
- [#8014](https://github.com/1024pix/pix/pull/8014) [BUGFIX] Retirer les modifications relatives à l'import SIECLE sur S3.
- [#8013](https://github.com/1024pix/pix/pull/8013) [BUGFIX] Revert "[TECH]: Sépare le usecase SIECLE de celui de FREGATA (PIX-11061)".

### :coffee: Autre
- [#7959](https://github.com/1024pix/pix/pull/7959) [FEAT] Ajouter un message d'erreur spécifique lors de la création de parcours autonome non-autorisée (PIX-10994).

## v4.100.2 (08/02/2024)

### :bug: Correction
- [#8014](https://github.com/1024pix/pix/pull/8014) [BUGFIX] Retirer les modifications relatives à l'import SIECLE sur S3.

## v4.100.1 (08/02/2024)

### :bug: Correction
- [#8009](https://github.com/1024pix/pix/pull/8009) [TECH] Retirer la librairie openid-client.

## v4.100.0 (08/02/2024)


### :rocket: Amélioration
- [#7992](https://github.com/1024pix/pix/pull/7992) [FEATURE] Pouvoir utiliser les logiques de `solution-service-qcm` et de `ValidatorQCM` dans notre BC `devcomp`.

### :building_construction: Tech
- [#7978](https://github.com/1024pix/pix/pull/7978) [TECH] Utiliser la librairie openid-client (PIX-10990).

### :bug: Correction
- [#8005](https://github.com/1024pix/pix/pull/8005) [BUGFIX] corrige la suppression de fichier temporaire après un import siecle (PIX-11118).

### :arrow_up: Montée de version
- [#7851](https://github.com/1024pix/pix/pull/7851) [BUMP] Update dependency @1024pix/pix-ui to v42 (admin).
- [#7996](https://github.com/1024pix/pix/pull/7996) [BUMP] Update adobe/s3mock Docker tag to v3.3.0 (dossier racine).
- [#7994](https://github.com/1024pix/pix/pull/7994) [BUMP] Update adobe/s3mock Docker tag to v3.3.0 (docker).

## v4.99.0 (07/02/2024)


### :rocket: Amélioration
- [#7974](https://github.com/1024pix/pix/pull/7974) [FEATURE] Accéder à la page de fin de module via l'URL (PIX-11026).
- [#7979](https://github.com/1024pix/pix/pull/7979) [FEATURE] Ajout d'un module "Mots de passe sécurisés" .

### :building_construction: Tech
- [#7980](https://github.com/1024pix/pix/pull/7980) [TECH]: ajoute les variable d'env du s3 local  pour les tests.
- [#7940](https://github.com/1024pix/pix/pull/7940) [TECH] Stocke les fichiers d'import dans un bucket S3 (PIX-10927).
- [#7968](https://github.com/1024pix/pix/pull/7968) [TECH] Migrer le cycle de vie d'une participation dans son Bounded Context (PIX-11022).

### :bug: Correction
- [#7991](https://github.com/1024pix/pix/pull/7991) [BUGFIX] Corriger l'extraction des résultats d'une collecte de profil en csv(PIX-11096).
- [#7984](https://github.com/1024pix/pix/pull/7984) [BUGFIX] Utiliser les tolérances lors de la vérification des QROCM-ind (PIX-11007).
- [#7953](https://github.com/1024pix/pix/pull/7953) [BUGFIX] Vérifier le remplissage de sujets lors de la création des badges (PIX-10969).
- [#7932](https://github.com/1024pix/pix/pull/7932) [BUGFIX] Ne plus appeler la route API pour récupérer tous les oidc providers juste après la connexion sur Pix Admin (PIX-10964).
- [#7900](https://github.com/1024pix/pix/pull/7900) [BUGFIX] Ne plus écraser les données de l'assessment-result lors de la mise à jour des commentaires d'une certification sur Pix Admin (PIX-10433).

### :arrow_up: Montée de version
- [#7993](https://github.com/1024pix/pix/pull/7993) [BUMP] Update adobe/s3mock Docker tag to v3.3.0 (.circleci).
- [#7990](https://github.com/1024pix/pix/pull/7990) [BUMP] Update dependency npm-run-all2 to v5.0.2 (e2e).
- [#7987](https://github.com/1024pix/pix/pull/7987) [BUMP] Replace dependency npm-run-all with npm-run-all2 ^5.0.0 (mon-pix).
- [#7989](https://github.com/1024pix/pix/pull/7989) [BUMP] Replace dependency npm-run-all with npm-run-all2 ^5.0.0 (orga).
- [#7986](https://github.com/1024pix/pix/pull/7986) [BUMP] Replace dependency npm-run-all with npm-run-all2 ^5.0.0 (dossier racine).
- [#7985](https://github.com/1024pix/pix/pull/7985) [BUMP] Replace dependency npm-run-all with npm-run-all2 ^5.0.0 (api).
- [#7983](https://github.com/1024pix/pix/pull/7983) [BUMP] Replace dependency npm-run-all with npm-run-all2 ^5.0.0 (admin).
- [#7982](https://github.com/1024pix/pix/pull/7982) [BUMP] Replace dependency npm-run-all with npm-run-all2 ^5.0.0 (1d).
- [#7930](https://github.com/1024pix/pix/pull/7930) [BUMP] Replace dependency npm-run-all with npm-run-all2 5.0.0 (e2e).
- [#7954](https://github.com/1024pix/pix/pull/7954) [BUMP] Update dependency nodemailer to v6.9.9 [SECURITY].

## v4.98.0 (06/02/2024)


### :rocket: Amélioration
- [#7939](https://github.com/1024pix/pix/pull/7939) [FEATURE] Ajout d'une modale sur la définalisation de session (PIX-10898).
- [#7942](https://github.com/1024pix/pix/pull/7942) [FEATURE] Ajouter toutes les participations dans l'export des collecte de profils (Pix-10454).
- [#7961](https://github.com/1024pix/pix/pull/7961) [FEATURE] Retirer le code de rapport d'erreur dans la modal de gestion d'alerte en certif (PIX-1943).
- [#7972](https://github.com/1024pix/pix/pull/7972) [FEATURE] Permettre de fournir des alternatives textuelles vides sur Modulix (PIX-10961).
- [#7836](https://github.com/1024pix/pix/pull/7836) [FEATURE] Gérer le niveau -1 pour les certifications complémentaires (PIX-10319).
- [#7949](https://github.com/1024pix/pix/pull/7949) [FEATURE] Accès à la documentation V3 pour les centres de certifications pilotes (PIX-10839).
- [#7955](https://github.com/1024pix/pix/pull/7955) [FEATURE] Création d'un nouveau module (ports de connexion débutant).
- [#7951](https://github.com/1024pix/pix/pull/7951) [FEATURE] Retirer l'icône de suppression d'issue-report pour les live-alerts en certif V3 (PIX-10941).
- [#7960](https://github.com/1024pix/pix/pull/7960) [FEATURE] Utiliser des cookies sécurisés pour stocker le nonce et le state lors de la connexion OIDC (PIX-10988).

### :building_construction: Tech
- [#7947](https://github.com/1024pix/pix/pull/7947) [TECH] Retirer toutes trace de moment dans l'API (PIX-11000).
- [#7977](https://github.com/1024pix/pix/pull/7977) [TECH] Instancier entièrement le Module lors d'une vérification (PIX-11039).
- [#7956](https://github.com/1024pix/pix/pull/7956) [TECH] [PIX-10858] Rajouter un header qui indique la provenance de la requete sur Baleen.
- [#7967](https://github.com/1024pix/pix/pull/7967) [TECH] Retirer Bookshelf de certification-course-repository (PIX-11012).
- [#7962](https://github.com/1024pix/pix/pull/7962) [TECH] Déplacer le read model CertificationIssueReportCategory dans shared (PIX-10772).
- [#7973](https://github.com/1024pix/pix/pull/7973) [TECH] Ajouter un faux fournisseur d'identité pour faciliter les tests (PIX-10989).
- [#7945](https://github.com/1024pix/pix/pull/7945) [TECH] Faire retourner uniquement la correction par la méthode `assess` (PIX-10875) (PIX-10298).
- [#7965](https://github.com/1024pix/pix/pull/7965) [TECH] Mise à jour de l'installation par défaut du projet (PIX-11009).
- [#7866](https://github.com/1024pix/pix/pull/7866) [TECH] :arrow_up: Mettre à jour notre fichier swagger en  v3.0.
- [#7964](https://github.com/1024pix/pix/pull/7964) [TECH] Migration vers la nouvelle méthode d'import JSON (PIX-11011).

### :bug: Correction
- [#7975](https://github.com/1024pix/pix/pull/7975) [BUGFIX] Corrige un crash de l'API lorsque toutes les réponses à une certif v3 sont OK (PIX-11025).
- [#7969](https://github.com/1024pix/pix/pull/7969) [BUGFIX] Retirer le `<p>` par défaut du contenu des `PixModal` (PIX-11006).
- [#7963](https://github.com/1024pix/pix/pull/7963) [BUGFIX] Améliorer les `ariaLabel` Modulix (PIX-11008).

### :arrow_up: Montée de version
- [#7886](https://github.com/1024pix/pix/pull/7886) [BUMP] Update dependency node to v20.11.0.

### :coffee: Autre
- [#7901](https://github.com/1024pix/pix/pull/7901) [REFACTOR] Ajouter la validation de la charge utile de la mise à jour de collection de paliers (PIX-10840).

## v4.97.0 (02/02/2024)


### :rocket: Amélioration
- [#7926](https://github.com/1024pix/pix/pull/7926) [FEATURE] Afficher le score par compétence sur la page de certificat pour la v3 (PIX-10689).
- [#7922](https://github.com/1024pix/pix/pull/7922) [FEATURE] Création en masse d'organisations PIX 1D (PIX-10889).
- [#7952](https://github.com/1024pix/pix/pull/7952) [FEATURE] Permettre à un utilisateur néerlandophone de recevoir des emails dans sa langue (PIX-10796).
- [#7946](https://github.com/1024pix/pix/pull/7946) [FEATURE] màj du contenu du module didacticiel.
- [#7916](https://github.com/1024pix/pix/pull/7916) [FEATURE] Renvoyer une 422 si le curseur du pole emploi sendings n'est pas dans un format JSON valide (PIX-10867).
- [#7944](https://github.com/1024pix/pix/pull/7944) [FEATURE] Retirer les validations et contraintes sur le code d'un fournisseur d'identité (PIX-10980).
- [#7943](https://github.com/1024pix/pix/pull/7943) [FEATURE] Changer la position de la gestion de l'alert dans l'espace surveillant (PIX-10942).
- [#7941](https://github.com/1024pix/pix/pull/7941) [FEATURE] Ouvrir le portail surveillant dans un nouvel onglet (PIX-10973).
- [#7887](https://github.com/1024pix/pix/pull/7887) [FEATURE] Ajout de la page d'accueil des modules (PIX-10470).
- [#7842](https://github.com/1024pix/pix/pull/7842) [FEATURE] Exporter toutes les participations non supprimés dans les exports CSV (PIX-10452).
- [#7885](https://github.com/1024pix/pix/pull/7885) [FEATURE] Renommage commentForJury en commentByJury (PIX-10821).

### :building_construction: Tech
- [#7958](https://github.com/1024pix/pix/pull/7958) [TECH] Ne pas supprimer un organization learner déjà supprimé (PIX-11001).
- [#7948](https://github.com/1024pix/pix/pull/7948) [TECH] Améliore la robustesse du groupBy dans certification-point-of-contact-repository.
- [#7899](https://github.com/1024pix/pix/pull/7899) [TECH] Renommage de l'utilitaire de combinaison des security prehandlers (PIX-10967).

### :bug: Correction
- [#7864](https://github.com/1024pix/pix/pull/7864) [BUGFIX] Corriger l'erreur 500 lors de la récupération d'un profil cible en JSON.
- [#7935](https://github.com/1024pix/pix/pull/7935) [BUGFIX] Prendre en compte le mot remplacé par le dictionnaire d'une tablette/téléphone (Pix-10968).
- [#7936](https://github.com/1024pix/pix/pull/7936) [BUGFIX] Le logo Pix Orga doit rediriger vers la page des missions si l'orga est de type Sco-1D (Pix-10939).

### :coffee: Autre
- [#7929](https://github.com/1024pix/pix/pull/7929) [REFACTOR] Réparer les tests flakys (PIX-10945).
- [#7937](https://github.com/1024pix/pix/pull/7937) Updated translations from Phrase.

## v4.96.0 (30/01/2024)


### :rocket: Amélioration
- [#7931](https://github.com/1024pix/pix/pull/7931) [FEATURE] Mise à jour du contenu du module "Bien écrire son adresse mail".
- [#7920](https://github.com/1024pix/pix/pull/7920) [FEATURE] Afficher le nombre de participations du prescrit à une campagne sur la page d'activité du prescrit (PIX-10451).
- [#7902](https://github.com/1024pix/pix/pull/7902) [FEATURE][CERTIF | ORGA] Utiliser un fichier de langues pour lister les langues disponibles (PIX-10686).
- [#7868](https://github.com/1024pix/pix/pull/7868) [FEATURE] Conditionner l’affichage du bouton de connexion Google dans Pix Admin (PIX-10799).
- [#7912](https://github.com/1024pix/pix/pull/7912) [FEATURE] Cacher le bouton "Passer" une fois cliqué (PIX-10891).
- [#7919](https://github.com/1024pix/pix/pull/7919) [FEATURE] Ajout d'un module "Didacticiel Modulix".

### :building_construction: Tech
- [#7927](https://github.com/1024pix/pix/pull/7927) [TECH] Montée de version de Pix UI en v42.0.4 sur PixApp (PIX-10947).
- [#7906](https://github.com/1024pix/pix/pull/7906) [TECH] déplacement de fichiers autour de `ActivityAnswer` (PIX-10887).
- [#7918](https://github.com/1024pix/pix/pull/7918) [TECH] Prendre en compte les dépréciations d'ember-data (PIX-10903).

### :bug: Correction
- [#7928](https://github.com/1024pix/pix/pull/7928) [BUGFIX] Ajouter une migration pour remplacer les participantExternalId empty par null (PIX-10897).
- [#7924](https://github.com/1024pix/pix/pull/7924) [BUGFIX] Permettre la remise à zero d'une compétence (PIX-10892).
- [#7923](https://github.com/1024pix/pix/pull/7923) [BUGFIX] Corriger le tracking du bouton "Vérifier" sur Modulix (PIX-10938).
- [#7908](https://github.com/1024pix/pix/pull/7908) [BUGFIX] Bloquer le bouton de vérification d'un élément après soumission (PIX-10869).
- [#7921](https://github.com/1024pix/pix/pull/7921) [BUGFIX] Ne pas formater la réponse des QROCM-ind (PIX-10924).

## v4.95.0 (24/01/2024)


### :rocket: Amélioration
- [#7850](https://github.com/1024pix/pix/pull/7850) [FEATURE] Ajouter la traduction néerlandaise sur Pix App (PIX-10687).
- [#7810](https://github.com/1024pix/pix/pull/7810) [FEATURE] Permettre l'import à nouveau sans perdre le récapitulatif des erreurs à corriger sur Pix Certif (PIX-10157).
- [#7911](https://github.com/1024pix/pix/pull/7911) [FEATURE] Correction de quelques coquilles de contenu Modulix.
- [#7905](https://github.com/1024pix/pix/pull/7905) [FEATURE] Affiche le nombre de participation à une campagne (PIX-10446).

### :building_construction: Tech
- [#7895](https://github.com/1024pix/pix/pull/7895) [TECH] Migration des dépendances de getNextChallengeForCertification (pix-10872).
- [#7907](https://github.com/1024pix/pix/pull/7907) [TECH] Déplacement du fichier des sécurity pre handlers (PIX-10890).

### :arrow_up: Montée de version
- [#7848](https://github.com/1024pix/pix/pull/7848) [BUMP] Update dependency @1024pix/pix-ui to v42 (1d).

### :coffee: Autre
- [#7896](https://github.com/1024pix/pix/pull/7896) [REFACTOR] Améliorer des conditions de mise à jour d'un palier (PIX-10844).
- [#7910](https://github.com/1024pix/pix/pull/7910) [TECH ] Audit routes API pour next-gen (pix-10654).
- [#7909](https://github.com/1024pix/pix/pull/7909) Updated translations from Phrase.

## v4.94.0 (23/01/2024)


### :rocket: Amélioration
- [#7893](https://github.com/1024pix/pix/pull/7893) [FEATURE] Utiliser les certification-challenges plutôt que les challenges pour le rescoring (PIX-10751).
- [#7875](https://github.com/1024pix/pix/pull/7875) [FEATURE][ADMIN] Ajouter un label "organisation parente" sur la page d'une organisation parente (PIX-10049).
- [#7869](https://github.com/1024pix/pix/pull/7869) [FEATURE][API] Ajouter un endpoint pour attacher une organisation enfant à une organisation (PIX-10045).
- [#7889](https://github.com/1024pix/pix/pull/7889) [FEATURE] Automatiquement scroller vers le grain suivant (PIX-10072).

### :building_construction: Tech
- [#7876](https://github.com/1024pix/pix/pull/7876) [TECH] Migrate sco import to src (PIX-10757).
- [#7871](https://github.com/1024pix/pix/pull/7871) [TECH] Mutualiser les usages du campaign administration repository (PIX-10808).
- [#7849](https://github.com/1024pix/pix/pull/7849) [TECH] Migration de l'import de session en masse vers src (PIX-10188).
- [#7904](https://github.com/1024pix/pix/pull/7904) [TECH] Améliore la configuration Phrase.

### :bug: Correction
- [#7897](https://github.com/1024pix/pix/pull/7897) [BUGFIX] Corrige le crash de l'affichage des détails d'une certif v3 lorsqu'une réponse est dans certains status (PIX-10876).
- [#7898](https://github.com/1024pix/pix/pull/7898) [BUGFIX] La dernière participation partagée affichée devrait être celle de la campagne en question (PIX-10880).

## v4.93.0 (22/01/2024)


### :rocket: Amélioration
- [#7874](https://github.com/1024pix/pix/pull/7874) [FEATURE] Revue du design de Modulix (PIX-9812).
- [#7894](https://github.com/1024pix/pix/pull/7894) [FEATURE] Accepte externalId comme alias pour participantExternalId (PIX-10819).

### :building_construction: Tech
- [#7787](https://github.com/1024pix/pix/pull/7787) [TECH] Activer la redirection automatique HTTPS sur Caddy (PIX-10578).
- [#7884](https://github.com/1024pix/pix/pull/7884) [TECH] Supprimer les ancienne routes de Verify Answer sur modulix (Pix-10701).

### :bug: Correction
- [#7892](https://github.com/1024pix/pix/pull/7892) [BUGFIX] Adapter les couleurs du graphique des status par jour à celui des status par type (PIX-10864).

## v4.91.0 (19/01/2024)


### :rocket: Amélioration
- [#7890](https://github.com/1024pix/pix/pull/7890) [FEATURE] Ajouter la page mission dans Pix Orga (Pix-10747).
- [#7872](https://github.com/1024pix/pix/pull/7872) [FEATURE] Brancher les passages dans Pix App pour enregistrer les réponses (PIX-10700).
- [#7839](https://github.com/1024pix/pix/pull/7839) [FEATURE] Ajout du bloc "N° de certif" sur l'onglet détail d'une certif v3 (PIX-10287).
- [#7861](https://github.com/1024pix/pix/pull/7861) [FEATURE] Ajout de endpoints de gestion de la configuration de la certif nextgen (PIX-10794).
- [#7879](https://github.com/1024pix/pix/pull/7879) [FEATURE] Rejeter une certif avec moins de V questions annulée pour problème technique (PIX-10752).

### :building_construction: Tech
- [#7882](https://github.com/1024pix/pix/pull/7882) [TECH] Ajouter et utiliser la feature mission management(PIX-10807).
- [#7883](https://github.com/1024pix/pix/pull/7883) [TECH] Vérifier que la version de node est disponible sur Scalingo avant de la mettre à jour.

### :bug: Correction
- [#7888](https://github.com/1024pix/pix/pull/7888) [BUGFIX] Réactive le fonctionnement de l'aléatoire dans la certif v3 (PIX-10852).
- [#7860](https://github.com/1024pix/pix/pull/7860) [BUGFIX] Corriger la page de réinitialisation de mot de passe non accessible sur les vieux navigateurs côté Pix App (PIX-10722).
- [#7841](https://github.com/1024pix/pix/pull/7841) [BUGFIX] Permettre de nouveau l'affichage du message d'erreur en cas de fichier vide pour l'import en masse de sessions sur Pix Certif (PIX-10637).

### :coffee: Autre
- [#7854](https://github.com/1024pix/pix/pull/7854) [FEAT] Remplacer le nom de l'organisation par Pix sur les scorecards de parcours autonomes (PIX-10675).
- [#7857](https://github.com/1024pix/pix/pull/7857) [FIX] Adapter les couleurs des graphiques à celles du design system (PIX-10703).

## v4.90.0 (17/01/2024)


### :bug: Correction
- [#7880](https://github.com/1024pix/pix/pull/7880) [BUGFIX] Revert "[BUMP] Update dependency node to v20.11.0".

## v4.89.0 (17/01/2024)


### :rocket: Amélioration
- [#7853](https://github.com/1024pix/pix/pull/7853) [FEATURE] Création d'un script pour la suppression des données personnelles (PIX-10766).
- [#7833](https://github.com/1024pix/pix/pull/7833) [FEATURE] permet de voir la dernière participation partagée (PIX-10449).

### :building_construction: Tech
- [#7858](https://github.com/1024pix/pix/pull/7858) [TECH] Nettoyer les pre-handlers des routes certification-issue-reports, certification-reports et certification-courses (PIX-10774).
- [#7873](https://github.com/1024pix/pix/pull/7873) [TECH] Corriger le Flaky sur CampaignParticipantActivity (PIX-10810).
- [#7863](https://github.com/1024pix/pix/pull/7863) [TECH] Retire les vérifications métier du campaign-creator-repository (PIX-10802).
- [#7862](https://github.com/1024pix/pix/pull/7862) [TECH] Retire les effets de bords dans le repository Prescriber (PIX-10801).

### :bug: Correction
- [#7870](https://github.com/1024pix/pix/pull/7870) [BUGFIX] [Pix Admin] Corriger et uniformiser la traduction française pour l’action « Modifier » (PIX-10805).

### :arrow_up: Montée de version
- [#7847](https://github.com/1024pix/pix/pull/7847) [BUMP] Update dependency redis to v7.2.3.
- [#7877](https://github.com/1024pix/pix/pull/7877) [BUMP] Update dependency node to v20.11.0.

## v4.88.0 (17/01/2024)


### :rocket: Amélioration
- [#7843](https://github.com/1024pix/pix/pull/7843) [FEATURE] Afficher les boutons de retour à la page précédente plus petit sur Pix Certif (PIX-10152).
- [#7794](https://github.com/1024pix/pix/pull/7794) [FEATURE] Créer et utiliser les design token Pix 1d (Pix-10447).

### :building_construction: Tech
- [GHSA-5gvp-w3xj-52w9](https://github.com/1024pix/pix-ghsa-5gvp-w3xj-52w9/pull/1) [TECH] Protéger la route de récupération des classes depuis pix-certif (PIX-10773)

### :bug: Correction
- [#7859](https://github.com/1024pix/pix/pull/7859) [BUGFIX] Afficher le style pour des liste à puces (PIX-10791).

## v4.87.0 (16/01/2024)


### :rocket: Amélioration
- [#7825](https://github.com/1024pix/pix/pull/7825) [FEATURE] Enregistrer les réponses faites durant un passage de module (PIX-10582).
- [#7856](https://github.com/1024pix/pix/pull/7856) [FEATURE][ADMIN] Afficher la liste des organisations enfants d'une organisation parente (PIX-10048).
- [#7838](https://github.com/1024pix/pix/pull/7838) [FEATURE] Ajout du néerlandais dans les langues disponibles côté API (PIX-10683).
- [#7831](https://github.com/1024pix/pix/pull/7831) [FEATURE][API] Ajouter un endpoint pour récupérer les organisations enfants d'une organisation parente.
- [#7835](https://github.com/1024pix/pix/pull/7835) [FEATURE] Utiliser un fichier de langues pour lister les languages disponibles sur Pix App (PIX-10684).
- [#7832](https://github.com/1024pix/pix/pull/7832) [FEATURE] Ne pas afficher l'icone de réponse si un candidat passe une question dans la page de détails (PIX-10682).
- [#7739](https://github.com/1024pix/pix/pull/7739) [FEATURE] Permettre de définaliser une session depuis Pix Admin (PIX-10316).

### :building_construction: Tech
- [#7820](https://github.com/1024pix/pix/pull/7820) [TECH] Generer des rapports de tests sur les front-ends pour circle-ci (PIX-10673).
- [#7834](https://github.com/1024pix/pix/pull/7834) [TECH] Ajout d'un script pour créer une configuration d'algo de certification V3 (PIX-10713).
- [#7801](https://github.com/1024pix/pix/pull/7801) [TECH] :recycle: migration API LearningContentResourceNotFound (PIX-10619).
- [#7816](https://github.com/1024pix/pix/pull/7816) [TECH] Migrer Challenge vers la nouvelle arbo API (PIX-9930).

### :bug: Correction
- [#7840](https://github.com/1024pix/pix/pull/7840) [BUGFIX] limite l'accès aux résultats tant que le parcours n'est pas terminé (PIX-10705).
- [#7844](https://github.com/1024pix/pix/pull/7844) [BUGFIX] Corriger des typo sur le texte d'informations des campagnes en isForAbsoluteNovice dans PixAdmin (PIX-10738).

### :arrow_up: Montée de version
- [#7753](https://github.com/1024pix/pix/pull/7753) [BUMP] Update dependency eslint-config-standard-with-typescript to v43 (audit-logger).
- [#7708](https://github.com/1024pix/pix/pull/7708) [BUMP] Update dependency eslint-config-standard-with-typescript to v42 (audit-logger).
- [#7706](https://github.com/1024pix/pix/pull/7706) [BUMP] Update dependency eslint-config-standard-with-typescript to v41 (audit-logger).
- [#7846](https://github.com/1024pix/pix/pull/7846) [BUMP] Update dependency postgres to v14.10.
- [#7845](https://github.com/1024pix/pix/pull/7845) [BUMP] Update Node.js to v20.11.0.
- [#7764](https://github.com/1024pix/pix/pull/7764) [BUMP] Update dependency eslint-plugin-unicorn to v50 (api).

### :coffee: Autre
- [#7795](https://github.com/1024pix/pix/pull/7795) [REFACTOR] Améliorer le style de la barre de navigation principale desktop de PixApp (PIX-10557).

## v4.86.0 (11/01/2024)


### :rocket: Amélioration
- [#7817](https://github.com/1024pix/pix/pull/7817) [FEATURE] Ajouter le choix de définir un campagne isForAbsoluteNovice sur PixAdmin (PIX-10511).
- [#7811](https://github.com/1024pix/pix/pull/7811) [FEATURE] Calcul du niveau par compétence pour une certif V3 (PIX-10463).
- [#7830](https://github.com/1024pix/pix/pull/7830) [FEATURE] MAJ du nombre de réponses nécessaires à la validation d'une certification V3 (PIX-10698).
- [#7828](https://github.com/1024pix/pix/pull/7828) [FEATURE] Suppression de la contrainte sur la langue dans la table users (PIX-10681).
- [#7813](https://github.com/1024pix/pix/pull/7813) [FEATURE] Ajout de la propriété isV3Pilot à la création et l'édition d'un centre de certification (PIX-10618).

### :building_construction: Tech
- [#7803](https://github.com/1024pix/pix/pull/7803) [TECH] Fusionner les deux fichiers de tests pour la page de fin de parcours sur Pix-App (PIX-10624).
- [#7824](https://github.com/1024pix/pix/pull/7824) [TECH] Ajout de tests sur la page de détails des certifications d'un utilisateur.
- [#7748](https://github.com/1024pix/pix/pull/7748) [TECH] Remplace bookshelf par knex sur des repositories du scope XP Eval (PIX-10513).
- [#7750](https://github.com/1024pix/pix/pull/7750) [TECH] Remplace bookshelf par knex sur des repositories du scope prescription (PIX-10514).

### :bug: Correction
- [#7837](https://github.com/1024pix/pix/pull/7837) [BUGFIX] Réparation de l'injection de dépendance pour les certifications complémentaires.
- [#7826](https://github.com/1024pix/pix/pull/7826) [BUGFIX] Afficher le nombre de jours d'une formation (PIX-10626).
- [#7827](https://github.com/1024pix/pix/pull/7827) [BUGFIX] Corriger l'affichage du bloc des contenus formatifs en fin de parcours (PIX-10696).

## v4.85.0 (09/01/2024)


### :rocket: Amélioration
- [#7823](https://github.com/1024pix/pix/pull/7823) [FEATURE] Suppression de la bannière sur la certificabilité automatique pour les  SCO AEFE avec la feature activée (PIX-10346).
- [#7781](https://github.com/1024pix/pix/pull/7781) [FEATURE] Afficher un message d'erreur explicite dans la création d'un contenu formatif (PIX-10567).
- [#7806](https://github.com/1024pix/pix/pull/7806) [FEATURE] Ajouter des illustrations et couleurs personalisées pour 3 types de CFs (PIX-10418) (PIX-9959).
- [#7812](https://github.com/1024pix/pix/pull/7812) [FEATURE] Afficher si le centre de certification est pilote V3 (PIX-10617).
- [#7805](https://github.com/1024pix/pix/pull/7805) [FEATURE] Ajout de la colonne parentOrganizationId dans la table organizations (PIX-10044).
- [#7796](https://github.com/1024pix/pix/pull/7796) [FEATURE] Clarifier le message d'erreur lors de l'import en masse des sessions sur Pix Certif (PIX-10154).
- [#7791](https://github.com/1024pix/pix/pull/7791) [FEATURE] Remplacer le script de prod pour échanger de code campagne par une fonctionnalité dans Pix Admin (Pix-7500).
- [#7790](https://github.com/1024pix/pix/pull/7790) [FEATURE] Ne pas afficher le tag de signalement pour la dernière question d'une session non terminée (PIX-10552).
- [#7804](https://github.com/1024pix/pix/pull/7804) [FEATURE] Passer un grain (PIX-10296).

### :building_construction: Tech
- [#7815](https://github.com/1024pix/pix/pull/7815) [TECH] Vérifier le contenu de tous les modules (PIX-10244).
- [#7752](https://github.com/1024pix/pix/pull/7752) [TECH] Remplacer bookshelf par knex sur des repositories du scope Accès (PIX-10522).
- [#7701](https://github.com/1024pix/pix/pull/7701) [TECH] API interne pour le contexte des certifications complémentaires (PIX-10334).
- [#7822](https://github.com/1024pix/pix/pull/7822) [TECH] Changement d'alias du codeowner (PIX-10598).
- [#7814](https://github.com/1024pix/pix/pull/7814) [TECH] Améliorer l'organisation du code de validation des contenus (PIX-10646).
- [#7797](https://github.com/1024pix/pix/pull/7797) [TECH] Fixer les versions de postgres et redis dans le fichier de configuration de Scalingo (PIX-9281).
- [#7818](https://github.com/1024pix/pix/pull/7818) [TECH] Mise en place de codeowners pour le code API de DevComp (PIX-10598).
- [#7689](https://github.com/1024pix/pix/pull/7689) [TECH] Correction de l'affichage des heures des invitations (PIX-10414).
- [#7798](https://github.com/1024pix/pix/pull/7798) [TECH] Retirer le token de la route de telechargement de la feuille d'émargement (PIX-10575).
- [#7799](https://github.com/1024pix/pix/pull/7799) [TECH] Retirer le token de la route de telechargement de la feuille d'import des candidats (PIX-10576).
- [#7800](https://github.com/1024pix/pix/pull/7800) [TECH] Retirer le token de la route de telechargement du kit de surveillant (PIX-10577).
- [#7809](https://github.com/1024pix/pix/pull/7809) [TECH] La locale d'une seed de CF ne fonctionne plus (PIX-10630).
- [#7807](https://github.com/1024pix/pix/pull/7807) [TECH] Configurer Nodemon pour redémarrer quand on édite `module.json` (PIX-10621).

### :bug: Correction
- [#7829](https://github.com/1024pix/pix/pull/7829) [BUGFIX] Ajout d'un return pour enregistrer le model des places dans PixOrga (PIX-10521).
- [#7819](https://github.com/1024pix/pix/pull/7819) [BUGFIX] Éviter une erreur de contrainte BDD lors de l'échange du code campagne (PIX-7500).
- [#7691](https://github.com/1024pix/pix/pull/7691) [BUGFIX] Problème de hover sur le bouton de retour sur Certif. (PIX-10369).

### :coffee: Autre
- [#7821](https://github.com/1024pix/pix/pull/7821) [DOC] Passer le statut de l'ADR 28 en Accepté (PIX-10676).

## v4.84.0 (04/01/2024)


### :rocket: Amélioration
- [#7774](https://github.com/1024pix/pix/pull/7774) [FEATURE] Modification des parcours autonomes (PIX-10518).
- [#7765](https://github.com/1024pix/pix/pull/7765) [FEATURE][CERTIF] Permettre à un administrateur de supprimer un membre de son équipe (PIX-4998).
- [#7772](https://github.com/1024pix/pix/pull/7772) [FEATURE] Créer la page de fin de parcours pour les parcours autonomes sur PIx-App (PIX-9741).
- [#7783](https://github.com/1024pix/pix/pull/7783) [FEATURE] Utiliser un scope lors de la création et vérification des tokens utilisés pour le téléchargement des résultats de certification (PIX-10574).
- [#7788](https://github.com/1024pix/pix/pull/7788) [FEATURE] Enregistrer le passage des utilisateurs sur Modulix (PIX-10581).
- [#7780](https://github.com/1024pix/pix/pull/7780) [FEATURE] Filtrer les profils-cibles de parcours autonomes publics et sans accès simplifié (PIX-10560).
- [#7743](https://github.com/1024pix/pix/pull/7743) [FEATURE] Ajouter les textes de transition (PIX-10297).

### :building_construction: Tech
- [#7786](https://github.com/1024pix/pix/pull/7786) [TECH][APP | CERTIF | ORGA]  Utiliser la nouvelle font du DS pour les titres sur les mires de connexions (PIX-10384).
- [#7785](https://github.com/1024pix/pix/pull/7785) [TECH] Uniformisation des prehandlers (sur la route /api/user-orga-settings/{id}) (PIX-10568).
- [#7782](https://github.com/1024pix/pix/pull/7782) [TECH] Remplacer l'usage de l'accessToken par une validation via pre handler sur la route pour les exports de résultat (Pix-10515).
- [#7769](https://github.com/1024pix/pix/pull/7769) [TECH] Uniformiser le style de pages de formulaire de PixAdmin (PIX-10460).
- [#7641](https://github.com/1024pix/pix/pull/7641) [TECH] Activer le logger par défaut dans les nouveaux environnements (PIX-10289).

### :bug: Correction
- [#7808](https://github.com/1024pix/pix/pull/7808) [BUGFIX] Affichage du niveau par compétence sur le certificat (PIX-10608).
- [#7784](https://github.com/1024pix/pix/pull/7784) [BUGFIX] Ne pas rester coincer sur la page de chargement des places dans le cas d'une erreur API (PIX-10521).
- [#7792](https://github.com/1024pix/pix/pull/7792) [BUGFIX] Les vidéos en webm ne se lisent pas sur Safari mobile (PIX-10584).

## v4.83.0 (03/01/2024)


### :rocket: Amélioration
- [#7778](https://github.com/1024pix/pix/pull/7778) [FEATURE] Déplacer le champ qui comporte le nom du fichier .csv importé sur Pix Certif (PIX-10153).
- [#7775](https://github.com/1024pix/pix/pull/7775) [FEATURE] Changer la couleur du bouton en cas de d'import en masse avec erreur non bloquante (PIX-10156).
- [#7763](https://github.com/1024pix/pix/pull/7763) [FEATURE] Afficher le détail d'un signalement validé lors d'une certification sur Pix Admin (PIX-10313).
- [#7705](https://github.com/1024pix/pix/pull/7705) [FEATURE][CERTIF] Permettre à un administrateur de quitter un centre de certification (PIX-8639).
- [#7776](https://github.com/1024pix/pix/pull/7776) [FEATURE] Changer la couleur du récapitulatif lors de l'import en masse de session sur Pix Certif (PIX-10315).
- [#7773](https://github.com/1024pix/pix/pull/7773) [FEATURE] Ajouter des informations aux étapes "Téléchargement" et "Import" de l'import en masse sur Pix Certif (PIX-10151).
- [#7770](https://github.com/1024pix/pix/pull/7770) [FEATURE] Inverser l'ordre des boutons sur la première étape de l'import en masse de session sur Pix Certif (PIX-10150).
- [#7771](https://github.com/1024pix/pix/pull/7771) [FEATURE] Empêcher le rejet d'une certification si celle-ci est publiée (PIX-10492).
- [#7690](https://github.com/1024pix/pix/pull/7690) [FEATURE] Ajouter dans modulix l'element Video (PIX-10012).
- [#7759](https://github.com/1024pix/pix/pull/7759) [FEATURE] Afficher la réponse donnée par le candidat dans la page de détails d'Admin (PIX-10312).

### :building_construction: Tech
- [#7715](https://github.com/1024pix/pix/pull/7715) [TECH] Prendre en charge les dépréciations d'ember-data (PIX-10439).
- [#7767](https://github.com/1024pix/pix/pull/7767) [TECH] Ajouter une route API pour désactiver un membre depuis Pix Certif (PIX-10547).

### :bug: Correction
- [#7777](https://github.com/1024pix/pix/pull/7777) [BUGFIX] Modifier la couleur des réponses valides d'une correction de QROC (PIX-10558).
- [#7768](https://github.com/1024pix/pix/pull/7768) [BUGFIX] Réparer les liens vers Pix Editor sur la page de détails d'une certification sur Pix Admin (PIX-10526).

## v4.82.0 (28/12/2023)


### :rocket: Amélioration
- [#7730](https://github.com/1024pix/pix/pull/7730) [FEATURE] Ajout de la colonne commentByAutoJury dans la table assessment-results (PIX-10320).
- [#7751](https://github.com/1024pix/pix/pull/7751) [FEATURE] Afficher la liste des parcours autonomes existants dans Admin (PIX-10342).
- [#7741](https://github.com/1024pix/pix/pull/7741) [FEATURE] Afficher les infos des challenges dans la page de détails d'une certif V3 (PIX-10314).

### :building_construction: Tech
- [#7761](https://github.com/1024pix/pix/pull/7761) [TECH] Monter les versions des images postgresql et redis.

### :bug: Correction
- [#7757](https://github.com/1024pix/pix/pull/7757) [BUGFIX] Corriger la validation des CGU lors de l'inscription (PIX-10490).
- [#7760](https://github.com/1024pix/pix/pull/7760) [BUGFIX] Éviter la modification de propriétés de RT non-souhaitées (PIX-10119).
- [#7735](https://github.com/1024pix/pix/pull/7735) [BUGFIX] Modifier la page détails des parcours autonomes sur Pix-Admin (PIX-10475).
- [#7737](https://github.com/1024pix/pix/pull/7737) [BUGFIX] Améliorer l'accessibilité de l'hexagone score sur Pix-App (PIX-9640).

### :arrow_up: Montée de version
- [#7762](https://github.com/1024pix/pix/pull/7762) [BUMP] Lock file maintenance (audit-logger).
- [#7758](https://github.com/1024pix/pix/pull/7758) [BUMP] Update dependency @badeball/cypress-cucumber-preprocessor to v20 (e2e).

## v4.81.0 (26/12/2023)


### :rocket: Amélioration
- [#7688](https://github.com/1024pix/pix/pull/7688) [FEATURE] Vérifier un QROC-M indep (PIX-10390).

### :building_construction: Tech
- [#7749](https://github.com/1024pix/pix/pull/7749) [TECH] Améliorer la liste des candidats d'une session aux membres du centre de certification qui héberge la session (PIX-10512).
- [#7500](https://github.com/1024pix/pix/pull/7500) [TECH] Ajouter le fournisseur d'identité Google pour Pix Admin (PIX-10069).
- [#7747](https://github.com/1024pix/pix/pull/7747) [TECH] Remplace bookshelf par knex sur des repositories du scope certif (PIX-10510).
- [#7734](https://github.com/1024pix/pix/pull/7734) [TECH] déplace getCsvAssmentExport dans son bounded context (pix-10409).

### :bug: Correction
- [#7678](https://github.com/1024pix/pix/pull/7678) [BUGFIX] ajoute le parametre d'url threshold dans le lien personalisé de fin de parcours (PIX-10357).
- [#7656](https://github.com/1024pix/pix/pull/7656) [BUGFIX] Corriger un problème d'affichage du Language Switcher (PIX-9761).

### :arrow_up: Montée de version
- [#7756](https://github.com/1024pix/pix/pull/7756) [BUMP] Lock file maintenance (api).
- [#7755](https://github.com/1024pix/pix/pull/7755) [BUMP] Lock file maintenance (admin).
- [#7754](https://github.com/1024pix/pix/pull/7754) [BUMP] Lock file maintenance (1d).

## v4.80.0 (22/12/2023)


### :rocket: Amélioration
- [#7736](https://github.com/1024pix/pix/pull/7736) [FEATURE] Edit wording in change referer button (Pix 10364).
- [#7692](https://github.com/1024pix/pix/pull/7692) [FEATURE] Retourner une erreur 404 lors de l'enregistrement d'un signalement si la catégorie liée n'existe pas en base de données (PIX-10210).
- [#7711](https://github.com/1024pix/pix/pull/7711) [FEATURE] Voir les informations complémentaires d'une certification sur la page de détails (PIX-10290).
- [#7723](https://github.com/1024pix/pix/pull/7723) [FEATURE] Mise à jour des variables css d'Orga et vérifications suite à la maj de pixUI (PIX-10307).
- [#7718](https://github.com/1024pix/pix/pull/7718) [FEATURE] Rejet d'une certification complémentaire en cas de fraude lors de la certification (PIX-10371).

### :building_construction: Tech
- [#7742](https://github.com/1024pix/pix/pull/7742) [TECH] migre le route d'export csv des résultats d'une campagne de collecte dans son bounded context (pix-10410).
- [#7740](https://github.com/1024pix/pix/pull/7740) [TECH] Ajoute un script qui génère la documentation des APIs de la Prescription. (PIX-10504).
- [#7724](https://github.com/1024pix/pix/pull/7724) [TECH] ajouter un script pour faciliter la mise à jour du googlesheet d'audit (PIX-10445).
- [#7744](https://github.com/1024pix/pix/pull/7744) [TECH] Migrer la route des résultats d'une collecte de profils dans son bounded context (Pix-10411).
- [#7746](https://github.com/1024pix/pix/pull/7746) [TECH] Suppression d'un PixButton avec un paramètre déprécié. (PIX-10369).
- [#7745](https://github.com/1024pix/pix/pull/7745) [TECH] Aligner la version des modules 1d et audit logger.
- [#7732](https://github.com/1024pix/pix/pull/7732) [TECH] Migrer les résultats d'une campagne dans src (Pix-10412).
- [#7399](https://github.com/1024pix/pix/pull/7399) [TECH] le hook de pre-commit lance les commandes de lint depuis les dossiers des applis front.

### :bug: Correction
- [#7733](https://github.com/1024pix/pix/pull/7733) [BUGFIX] Autoriser l'appel au repository sans définir de filtre (PIX-10474).

## v4.79.0 (21/12/2023)


### :rocket: Amélioration
- [#7721](https://github.com/1024pix/pix/pull/7721) [FEATURE] Créer la page de détails pour les parcours autonomes (PIX-10360).
- [#7729](https://github.com/1024pix/pix/pull/7729) [FEATURE] Ajoute une API pour récupérer les détails d'un profil cible à partir de son id (PIX-10137).
- [#7728](https://github.com/1024pix/pix/pull/7728) [FEATURE] Ajouter l'information de campagne à envoi multiple dans la page de détail d'une campagne (PIX-10378).
- [#7710](https://github.com/1024pix/pix/pull/7710) [FEATURE] Ajout de la colonne minimumReproducibilityRateLowerLevel dans complementaryCertification (PIX-10318).
- [#7699](https://github.com/1024pix/pix/pull/7699) [FEATURE] Créer la page d'atterrissage d'un parcours autonome (PIX-9184).
- [#7712](https://github.com/1024pix/pix/pull/7712) [FEATURE] Ajouter les informations isPublic / isSimplifiedAcces sur l'API interne de la liste des profil cibles (PIX-10217).
- [#7719](https://github.com/1024pix/pix/pull/7719) [FEATURE] Ajouter un test d'acceptance pour la route assessment-results (PIX-10444).
- [#7720](https://github.com/1024pix/pix/pull/7720) [FEATURE] Ajoute l'icône de la typologie de campagne sur les pages de détails d'une campagne (PIX-10349).

### :building_construction: Tech
- [#7731](https://github.com/1024pix/pix/pull/7731) [TECH] Retirer le script de migration des acquisitions de badge (PIX-8975).
- [#7673](https://github.com/1024pix/pix/pull/7673) [TECH] Migre les usages de `momentjs`.
- [#7707](https://github.com/1024pix/pix/pull/7707) [TECH] Éviter que le test de la modal remplacer des étudiants soit Flaky sur Pix Orga (PIX-10421).
- [#7709](https://github.com/1024pix/pix/pull/7709) [TECH] Fixer le style sur l'un des sous-titre de la page d'import de masse de sessions (PIX-10434).

### :bug: Correction
- [#7738](https://github.com/1024pix/pix/pull/7738) [BUGFIX] Réparer le support des vieux navigateurs (PIX-10476).

### :arrow_up: Montée de version
- [#7726](https://github.com/1024pix/pix/pull/7726) [BUMP] Update dependency stylelint to v16 (mon-pix).
- [#7727](https://github.com/1024pix/pix/pull/7727) [BUMP] Update dependency stylelint to v16 (orga).
- [#7725](https://github.com/1024pix/pix/pull/7725) [BUMP] Update dependency stylelint to v16 (certif).
- [#7722](https://github.com/1024pix/pix/pull/7722) [BUMP] Update dependency stylelint to v16 (admin).
- [#7714](https://github.com/1024pix/pix/pull/7714) [BUMP] Update dependency stylelint to v16 (1d).

## v4.78.0 (19/12/2023)


### :rocket: Amélioration
- [#7687](https://github.com/1024pix/pix/pull/7687) [FEATURE] Supprimer le bouton d'édition globale des détails d'une certif sur Pix Admin (PIX-10168).
- [#7672](https://github.com/1024pix/pix/pull/7672) [FEATURE] Mise en place du feature toggle pour la certification au niveau n-1 (PIX-10317).
- [#7696](https://github.com/1024pix/pix/pull/7696) [FEATURE] Ajouter un endpoint interne pour mettre à jour une campagne (Pix-10138).
- [#7700](https://github.com/1024pix/pix/pull/7700) [FEATURE] Ajouter l'entrée Places dans le menu (PIX-9724).

### :building_construction: Tech
- [#7681](https://github.com/1024pix/pix/pull/7681) [TECH] Ajout d'un script pour mettre à jour la colonne Authentication Complement (PIX-10101).

### :bug: Correction
- [#7716](https://github.com/1024pix/pix/pull/7716) [BUGFIX] Protege la route de liste des résultats d'une campagne (PIX-10438).

### :arrow_up: Montée de version
- [#7574](https://github.com/1024pix/pix/pull/7574) [BUMP] Update dependency ember-cli-notifications to v9 (certif).
- [#7713](https://github.com/1024pix/pix/pull/7713) [BUMP] Update dependency p-queue to v8 (orga).
- [#7693](https://github.com/1024pix/pix/pull/7693) [BUMP] Update dependency p-queue to v8 (admin).
- [#7695](https://github.com/1024pix/pix/pull/7695) [BUMP] Update dependency p-queue to v8 (mon-pix).
- [#7694](https://github.com/1024pix/pix/pull/7694) [BUMP] Update dependency p-queue to v8 (certif).

### :coffee: Autre
- [#7717](https://github.com/1024pix/pix/pull/7717) [RELEASE] A patch is being released to 4.77.1.

## v4.77.1 (18/12/2023)

### :bug: Correction
- [#7716](https://github.com/1024pix/pix/pull/7716) [BUGFIX] Protege la route de liste des résultats d'une campagne (PIX-10438)


## v4.77.0 (15/12/2023)


### :rocket: Amélioration
- [#7704](https://github.com/1024pix/pix/pull/7704) [FEATURE] Utiliser la bonne couleur de fond dans les tag du Pix Score d'une collecte de profil (PIX-10432).
- [#7702](https://github.com/1024pix/pix/pull/7702) [FEATURE] Modification de la traduction "places" en anglais (PIX-10419).
- [#7703](https://github.com/1024pix/pix/pull/7703) [FEATURE] Modification du texte sur l'activation de la feature places d'une organisation (PIX-10413).
- [#7682](https://github.com/1024pix/pix/pull/7682) [FEATURE] affiches les statistiques de places d'une organisation.
- [#7630](https://github.com/1024pix/pix/pull/7630) [FEATURE] Créer la page d'atterrissage d'un parcours autonome (PIX-9184).
- [#7676](https://github.com/1024pix/pix/pull/7676) [FEATURE] Ajouter une route pour lister les campagnes d'une organisation (PIX-10136).
- [#7655](https://github.com/1024pix/pix/pull/7655) [FEATURE] Migrer les couleurs d'Admin vers le nouveau format (PIX-10358).
- [#7683](https://github.com/1024pix/pix/pull/7683) [FEATURE] Ajouter un bouton de modification pour les commentaires jury d'une certification sur Pix Admin (PIX-10165).
- [#7671](https://github.com/1024pix/pix/pull/7671) [FEATURE] Créer la page de détails pour une certification en V3 sur Pix Admin(PIX-10285).

### :building_construction: Tech
- [#7697](https://github.com/1024pix/pix/pull/7697) [TECH] Ajout de seeds d'une session de certification v3 complétée (PIX-10415).
- [#7698](https://github.com/1024pix/pix/pull/7698) [TECH] Revert "Créer la page d'atterrissage d'un parcours autonome (PIX-9184).".
- [#7659](https://github.com/1024pix/pix/pull/7659) [TECH] Supprime la colonne partnerKey (PIX-10162 ).
- [#7686](https://github.com/1024pix/pix/pull/7686) [TECH] Mettre à jour ember-data en 4.7 sur Pix App (PIX-10420).

### :bug: Correction
- [#7684](https://github.com/1024pix/pix/pull/7684) [BUGFIX] Ne plus remonter une 500 lors du double appel à la création d'une participation (PIX-10374).

### :coffee: Autre
- [#7680](https://github.com/1024pix/pix/pull/7680) [REFACTOR] Amélioration du style des détails de la page d'atterrissage des campagnes (PIX-10376).

## v4.76.0 (14/12/2023)


### :rocket: Amélioration
- [#7580](https://github.com/1024pix/pix/pull/7580) [FEATURE] Accéder à un élément QROC M Indep (PIX-10117).
- [#7639](https://github.com/1024pix/pix/pull/7639) [FEATURE] Modification de la hiérarchie des boutons de création de sessions (PIX-10147).
- [#7666](https://github.com/1024pix/pix/pull/7666) [FEATURE] Supprimer le fil d’Ariane de l'import en masse des sessions sur Pix Certif (PIX-10149). .
- [#7647](https://github.com/1024pix/pix/pull/7647) [FEATURE] Afficher le titre et la date du jour sur la page Places (PIX-9722).

### :building_construction: Tech
- [#7677](https://github.com/1024pix/pix/pull/7677) [TECH] Suppression de l'édition de résultats de la page détails d'Admin (PIX-10361).
- [#7587](https://github.com/1024pix/pix/pull/7587) [TECH] améliore le temps d'exécution de la requête qui affiche les participants d'une orga sup (PIX-10109).
- [#7640](https://github.com/1024pix/pix/pull/7640) [TECH] améliore le temps d'exécution de la requête qui affiche les participants d'une orga SCO (PIX-10110).
- [#7665](https://github.com/1024pix/pix/pull/7665) [TECH] améliore le temps d'exécution de la requête qui affiche les participants d'une orga sans import (PIX-10108).
- [#7663](https://github.com/1024pix/pix/pull/7663) [TECH] Supprimer le paramètre disableEntropyCache des appels a randomUUID.
- [#7664](https://github.com/1024pix/pix/pull/7664) [TECH] Installer toutes les dépendances dans circleci.
- [#7637](https://github.com/1024pix/pix/pull/7637) [TECH] Afficher directement les informations pour l'import de sessions en masse sur Pix Certif (PIX-10148).

### :bug: Correction
- [#7685](https://github.com/1024pix/pix/pull/7685) [BUGFIX] Améliorer les différents états des boutons (PIX-10388).
- [#7679](https://github.com/1024pix/pix/pull/7679) [BUGFIX] Rétablir la possibilité d'annuler la création d'un contenu formatif (PIX-10367).
- [#7670](https://github.com/1024pix/pix/pull/7670) [BUGFIX] Finaliser un parcours lorsqu'un tube de déclencheur de CF n'est plus disponible dans le référentiel (PIX-10347).

### :arrow_up: Montée de version
- [#7662](https://github.com/1024pix/pix/pull/7662) [BUMP] Update vitest monorepo to v1 (audit-logger) (major).

## v4.75.0 (12/12/2023)


### :rocket: Amélioration
- [#7668](https://github.com/1024pix/pix/pull/7668) [FEATURE] Ajoute l'organizationId sur le model Campaign de PixApp (PIX-10345).
- [#7651](https://github.com/1024pix/pix/pull/7651) [FEATURE] Ajouter une icône sur la liste des campagnes (PIX-10310).
- [#7661](https://github.com/1024pix/pix/pull/7661) [FEATURE] Ne pas afficher le bouton de rejet d'une certif pour une certif initialement rejetée sur Pix Admin (PIX-10207).
- [#7660](https://github.com/1024pix/pix/pull/7660) [FEATURE] Renommer le bouton permettant de modifier les infos candidats d'une certification sur Pix Admin (PIX-10164).
- [#7631](https://github.com/1024pix/pix/pull/7631) [FEATURE][CERTIF] Permettre aux administrateurs d'un centre de certification de changer le rôle de ses membres (PIX-5001).
- [#7650](https://github.com/1024pix/pix/pull/7650) [FEATURE] Retirer les variantes de challenges avec des signalements validés (PIX-10171).
- [#7627](https://github.com/1024pix/pix/pull/7627) [FEATURE][CERTIF] Permettre à un administrateur de renvoyer une invitation en attente (PIX-9786).
- [#7643](https://github.com/1024pix/pix/pull/7643) [FEATURE] Fixer le score maximum d'une certification à 896 Pix (PIX-10132).
- [#7652](https://github.com/1024pix/pix/pull/7652) [FEATURE] Pouvoir activer l'affichage des places à une orga depuis PixAdmin (PIX-9725).
- [#7642](https://github.com/1024pix/pix/pull/7642) [FEATURE] MAJ des commentaires auto-jury en certif V3 (PIX-10212).
- [#7541](https://github.com/1024pix/pix/pull/7541) [FEATURE] Expliciter la désignation d'un référent CléA Numérique dans les espaces Pix Certif des CDC habilités (PIX-9882).

### :building_construction: Tech
- [#7628](https://github.com/1024pix/pix/pull/7628) [TECH] Fix la version de  libxmljs2 à 0.32.0 pour rester compatible avec les proc ARM (PIX-10260).
- [#7667](https://github.com/1024pix/pix/pull/7667) [TECH] Impacts suite mise à  jour Pix UI v41.2.0. (PIX-10344).
- [#7638](https://github.com/1024pix/pix/pull/7638) [TECH] Migrer le scope Badge vers la nouvelle arbo API (PIX-9929).
- [#7581](https://github.com/1024pix/pix/pull/7581) [TECH] Ajouter des seeds pour les parcours autonomes (PIX-10234).
- [#7644](https://github.com/1024pix/pix/pull/7644) [TECH] Migrer AssessmentResult vers la nouvelle arbo API (PIX-9927).
- [#7575](https://github.com/1024pix/pix/pull/7575) [TECH] Simplification des definitions JSDoc (PIX-10211).

### :arrow_up: Montée de version
- [#7658](https://github.com/1024pix/pix/pull/7658) [BUMP] Lock file maintenance (admin).
- [#7657](https://github.com/1024pix/pix/pull/7657) [BUMP] Lock file maintenance (1d).
- [#7654](https://github.com/1024pix/pix/pull/7654) [BUMP] Update dependency @1024pix/pix-ui to ^41.2.0 (orga).
- [#7649](https://github.com/1024pix/pix/pull/7649) [BUMP] Update dependency @1024pix/pix-ui to ^41.2.0 (mon-pix).
- [#7648](https://github.com/1024pix/pix/pull/7648) [BUMP] Update dependency @1024pix/pix-ui to ^41.2.0 (certif).
- [#7646](https://github.com/1024pix/pix/pull/7646) [BUMP] Update dependency @1024pix/pix-ui to ^41.2.0 (admin).

## v4.74.0 (08/12/2023)


### :rocket: Amélioration
- [#7517](https://github.com/1024pix/pix/pull/7517) [FEATURE] Ajoute la route pour remonter les stats sur les places d'une organisation (PIX-9719).
- [#7550](https://github.com/1024pix/pix/pull/7550) [FEATURE] Rejeter une certification V2 et V3 sur la page d'infos (PIX-10016).
- [#7522](https://github.com/1024pix/pix/pull/7522) [FEATURE] Ajouter le formulaire de création d'un parcours autonome dans PixAdmin (PIX-9807).

### :bug: Correction
- [#7546](https://github.com/1024pix/pix/pull/7546) [BUGFIX] Harmoniser la taille des boutons sur la création de session en masse et ajout de candidat sur Pix Certif (PIX-10142).

### :arrow_up: Montée de version
- [#7645](https://github.com/1024pix/pix/pull/7645) [BUMP] Update dependency @1024pix/pix-ui to ^41.2.0 (1d).
- [#7635](https://github.com/1024pix/pix/pull/7635) [BUMP] Update dependency @1024pix/pix-ui to ^41.1.2 (mon-pix).

## v4.73.0 (07/12/2023)


### :building_construction: Tech
- [#7622](https://github.com/1024pix/pix/pull/7622) [TECH] Supprimer la clef de traduction current-lang de orga.
- [#7609](https://github.com/1024pix/pix/pull/7609) [TECH] Déplacer la route Mission dans le contexte School (Pix-10253).
- [#7558](https://github.com/1024pix/pix/pull/7558) [TECH] Migrer les routes et controllers d'Answer et Assessment vers la nouvelle arbo API (PIX-9591).
- [#7625](https://github.com/1024pix/pix/pull/7625) [TECH] Supprimer des seeds obsolètes (PIX-10180).
- [#7590](https://github.com/1024pix/pix/pull/7590) [TECH] Migrer get campaign dans son Bounded Context (PIX-10254).

### :bug: Correction
- [#7583](https://github.com/1024pix/pix/pull/7583) [BUGFIX] Cacher le bouton détacher le profil cible pour les organisations qui sont référentes (PIX-10205).

### :arrow_up: Montée de version
- [#7636](https://github.com/1024pix/pix/pull/7636) [BUMP] Update dependency @1024pix/pix-ui to ^41.1.2 (orga).
- [#7634](https://github.com/1024pix/pix/pull/7634) [BUMP] Update dependency @1024pix/pix-ui to ^41.1.2 (certif).
- [#7633](https://github.com/1024pix/pix/pull/7633) [BUMP] Update dependency @1024pix/pix-ui to ^41.1.2 (admin).
- [#7632](https://github.com/1024pix/pix/pull/7632) [BUMP] Update dependency @1024pix/pix-ui to ^41.1.2 (1d).
- [#7559](https://github.com/1024pix/pix/pull/7559) [BUMP] Lock file maintenance (api).

## v4.72.0 (06/12/2023)


### :rocket: Amélioration
- [#7579](https://github.com/1024pix/pix/pull/7579) [FEATURE] Pouvoir configurer le nombre max de challenges capés sur la variation de capacité (PIX-10187).
- [#7488](https://github.com/1024pix/pix/pull/7488) [FEATURE][ADMIN] Pouvoir changer le rôle d'un membre d'un centre de certif depuis la page de l'utilisateur.
- [#7554](https://github.com/1024pix/pix/pull/7554) [FEATURE][CERTIF] Permettre l'annulation d'une invitation par un administrateur (PIX-5002).

### :building_construction: Tech
- [#7623](https://github.com/1024pix/pix/pull/7623) [TECH] Supprimer la clef de traduction current-lang de certif.
- [#7601](https://github.com/1024pix/pix/pull/7601) [TECH] Factoriser les adapter dans Pix Orga afin de n'avoir qu'une mention au deleteParticipant (PIX-10258).
- [#7594](https://github.com/1024pix/pix/pull/7594) [TECH] Retirer l'utilisation du Feature Toggle Suppression d'un participant (PIX-10255).
- [#7624](https://github.com/1024pix/pix/pull/7624) [TECH] Passer le versionning de `@fortawesome/fontawesome-svg-core` en `^`.
- [#7407](https://github.com/1024pix/pix/pull/7407) [TECH] Migrer pix certif sur ember-data 4.12.
- [#7589](https://github.com/1024pix/pix/pull/7589) [TECH] Permet de désactiver le logger en développement.
- [#7588](https://github.com/1024pix/pix/pull/7588) [TECH] Nettoyer le fichier .gitignore.
- [#7585](https://github.com/1024pix/pix/pull/7585) [TECH] Supprimer la clef de traduction current-lang de mon-pix.
- [#7563](https://github.com/1024pix/pix/pull/7563) [TECH] Déplace les fichiers liés à l'`ActivityAnswer` (PIX-10214).
- [#7582](https://github.com/1024pix/pix/pull/7582) [TECH] Simplifier l'injection de dépendances au niveau des controllers dans le contexte de DevComp (PIX-10238). .
- [#7565](https://github.com/1024pix/pix/pull/7565) [TECH] Migration de certification candidate for supervising dans src.
- [#7567](https://github.com/1024pix/pix/pull/7567) [TECH] Ajouter le script de migration supprimant la table autonomous-courses (PIX-10104).

### :arrow_up: Montée de version
- [#7614](https://github.com/1024pix/pix/pull/7614) [BUMP] Update dependency @1024pix/stylelint-config to ^5.0.2 (certif).
- [#7621](https://github.com/1024pix/pix/pull/7621) [BUMP] Update dependency @fortawesome/fontawesome-svg-core to v6.5.0 (orga).
- [#7620](https://github.com/1024pix/pix/pull/7620) [BUMP] Update dependency @fortawesome/fontawesome-svg-core to v6.5.0 (mon-pix).
- [#7619](https://github.com/1024pix/pix/pull/7619) [BUMP] Update dependency @fortawesome/fontawesome-svg-core to v6.5.0 (certif).
- [#7618](https://github.com/1024pix/pix/pull/7618) [BUMP] Update dependency @fortawesome/fontawesome-svg-core to v6.5.0 (1d).
- [#7617](https://github.com/1024pix/pix/pull/7617) [BUMP] Update dependency @1024pix/eslint-config to ^1.1.1 (load-testing).
- [#7616](https://github.com/1024pix/pix/pull/7616) [BUMP] Update dependency @1024pix/stylelint-config to ^5.0.2 (orga).
- [#7615](https://github.com/1024pix/pix/pull/7615) [BUMP] Update dependency @1024pix/stylelint-config to ^5.0.2 (mon-pix).
- [#7613](https://github.com/1024pix/pix/pull/7613) [BUMP] Update dependency @fortawesome/fontawesome-svg-core to v6.5.0 (admin).
- [#7612](https://github.com/1024pix/pix/pull/7612) [BUMP] Update dependency @1024pix/stylelint-config to ^5.0.2 (admin).
- [#7597](https://github.com/1024pix/pix/pull/7597) [BUMP] Update dependency @1024pix/eslint-config to ^1.1.1 (certif).
- [#7611](https://github.com/1024pix/pix/pull/7611) [BUMP] Update dependency @1024pix/stylelint-config to ^5.0.2 (1d).
- [#7603](https://github.com/1024pix/pix/pull/7603) [BUMP] Update dependency @1024pix/pix-ui to ^41.1.1 (1d).
- [#7606](https://github.com/1024pix/pix/pull/7606) [BUMP] Update dependency @1024pix/pix-ui to ^41.1.1 (mon-pix).
- [#7608](https://github.com/1024pix/pix/pull/7608) [BUMP] Update dependency @1024pix/eslint-config to ^1.1.1 (api).
- [#7604](https://github.com/1024pix/pix/pull/7604) [BUMP] Update dependency @1024pix/pix-ui to ^41.1.1 (admin).
- [#7596](https://github.com/1024pix/pix/pull/7596) [BUMP] Update dependency @1024pix/eslint-config to ^1.1.1 (audit-logger).
- [#7607](https://github.com/1024pix/pix/pull/7607) [BUMP] Update dependency @1024pix/pix-ui to ^41.1.1 (orga).
- [#7605](https://github.com/1024pix/pix/pull/7605) [BUMP] Update dependency @1024pix/pix-ui to ^41.1.1 (certif).
- [#7599](https://github.com/1024pix/pix/pull/7599) [BUMP] Update dependency @1024pix/eslint-config to ^1.1.1 (mon-pix).
- [#7600](https://github.com/1024pix/pix/pull/7600) [BUMP] Update dependency @1024pix/eslint-config to ^1.1.1 (orga).
- [#7598](https://github.com/1024pix/pix/pull/7598) [BUMP] Update dependency @1024pix/eslint-config to ^1.1.1 (dossier racine).
- [#7595](https://github.com/1024pix/pix/pull/7595) [BUMP] Update dependency @1024pix/eslint-config to ^1.1.1 (admin).
- [#7591](https://github.com/1024pix/pix/pull/7591) [BUMP] Update dependency @1024pix/ember-matomo-tag-manager to ^2.4.3 (mon-pix).
- [#7592](https://github.com/1024pix/pix/pull/7592) [BUMP] Update dependency @1024pix/eslint-config to ^1.1.1 (1d).

## v4.71.0 (04/12/2023)


### :rocket: Amélioration
- [#7576](https://github.com/1024pix/pix/pull/7576) [FEATURE] Ajouter un tracking sur le click "alternative textuelle" d'un élément Image (PIX-10122).
- [#7577](https://github.com/1024pix/pix/pull/7577) [FEATURE] Permettre au contenu de styliser les listes à puces (PIX-10224).
- [#7547](https://github.com/1024pix/pix/pull/7547) [FEATURE] Pix1D - Activation du bouton de vérification uniquement sur réponse complète.
- [#7540](https://github.com/1024pix/pix/pull/7540) [FEATURE] Afficher une bannière de gestion des rôles sur Pix Certif (PIX-10079).
- [#7557](https://github.com/1024pix/pix/pull/7557) [FEATURE] QCU - Remplacer l'alerte native `required` par une alerte comme sur l'éval (PIX-10027).
- [#7553](https://github.com/1024pix/pix/pull/7553) [FEATURE] Modification de la hiérarchie des boutons de création de sessions (PIX-10146).

### :building_construction: Tech
- [#7549](https://github.com/1024pix/pix/pull/7549) [TECH] Déplacer l'import en masse de sessions dans src (PIX-9878).
- [#7548](https://github.com/1024pix/pix/pull/7548) [TECH] Déplacer les routes d'affichage et de suppression d'un candidat à une session dans src (PIX-9876).
- [#7570](https://github.com/1024pix/pix/pull/7570) [TECH] Corriger le test flaky.
- [#7539](https://github.com/1024pix/pix/pull/7539) [TECH] Corriger les seeds pour la session "started" (PIX-10139).
- [#7552](https://github.com/1024pix/pix/pull/7552) [TECH] Renommage d'un fichier de test avec le suffixe nécessaire.
- [#7526](https://github.com/1024pix/pix/pull/7526) [TECH] Déplacement de la finalisation d'une session dans le dossier src (PIX-10106). .
- [#7536](https://github.com/1024pix/pix/pull/7536) [TECH] Copier le ValidatorQroc dans le bounded context de devcomp (PIX-10025).

### :arrow_up: Montée de version
- [#7525](https://github.com/1024pix/pix/pull/7525) [BUMP] Update dependency eslint-config-standard-with-typescript to v40 (audit-logger).
- [#7572](https://github.com/1024pix/pix/pull/7572) [BUMP] Lock file maintenance (certif+orga).
- [#7571](https://github.com/1024pix/pix/pull/7571) [BUMP] Lock file maintenance (mon-pix).
- [#7569](https://github.com/1024pix/pix/pull/7569) [BUMP] eslint-config to v1.1.1 (audit-logger).
- [#7568](https://github.com/1024pix/pix/pull/7568) [BUMP] Lock file maintenance (admin).
- [#7566](https://github.com/1024pix/pix/pull/7566) [BUMP] Lock file maintenance (1d).
- [#7564](https://github.com/1024pix/pix/pull/7564) [BUMP] Lock file maintenance (dossier racine).
- [#7562](https://github.com/1024pix/pix/pull/7562) [BUMP] Lock file maintenance (dossier racine).
- [#7560](https://github.com/1024pix/pix/pull/7560) [BUMP] Lock file maintenance (certif).
- [#7561](https://github.com/1024pix/pix/pull/7561) [BUMP] Lock file maintenance (orga).
- [#7556](https://github.com/1024pix/pix/pull/7556) [BUMP] Lock file maintenance (mon-pix).
- [#7516](https://github.com/1024pix/pix/pull/7516) [BUMP] Lock file maintenance (admin).
- [#7513](https://github.com/1024pix/pix/pull/7513) [BUMP] Update node.
- [#7555](https://github.com/1024pix/pix/pull/7555) [BUMP] Lock file maintenance (1d).

### :coffee: Autre
- [#7551](https://github.com/1024pix/pix/pull/7551) [DOCS] Améliorer le style du fichier de documentation de contribution.

## v4.70.0 (30/11/2023)


### :rocket: Amélioration
- [#7537](https://github.com/1024pix/pix/pull/7537) [FEATURE] Mettre à jour Pix UI pour utiliser la font Nunito sur Pix Orga (PIX-10135).
- [#7543](https://github.com/1024pix/pix/pull/7543) [FEATURE] Annuler la certification quand il n'y a pas assez de réponse et un problème technique (PIX-9978).
- [#7535](https://github.com/1024pix/pix/pull/7535) [FEATURE] Ajouter 3 nouveaux types de contenus formatif (PIX-10173).
- [#7531](https://github.com/1024pix/pix/pull/7531) [FEATURE] Ajout d'une route récupérant les profils-cibles dédiés aux parcours autonomes (PIX-10113).
- [#7530](https://github.com/1024pix/pix/pull/7530) [FEATURE] Dégrader le score d'une certification avec plus de V questions et SANS problème technique. (PIX-9979).
- [#7528](https://github.com/1024pix/pix/pull/7528) [FEATURE] détache un profil cible target depuis la page organisation (PIX-9983).

### :building_construction: Tech
- [#7544](https://github.com/1024pix/pix/pull/7544) [TECH] Récupérer une organisation grâce au code en tant que queryparams (Pix-10133).
- [#7447](https://github.com/1024pix/pix/pull/7447) [TECH] Refacto des badges des certifications complémentaires (PIX-9862).
- [#7538](https://github.com/1024pix/pix/pull/7538) [TECH] ajoute un paramètre sur le nombre d'élève à créer au script de création d'une école (pix-10097).
- [#7533](https://github.com/1024pix/pix/pull/7533) [TECH] Faire les corrections nécessaires pour enlever les erreurs en console (Pix-9946).
- [#7480](https://github.com/1024pix/pix/pull/7480) [TECH] Déplacer le mapping des erreurs HTTP vers les bounded context (PIX-10080).

### :bug: Correction
- [#7542](https://github.com/1024pix/pix/pull/7542) [BUGFIX] Elargir la période de génération d'une date au hasard pour une factory de mirage dans certif (Pix-10161).

## v4.69.0 (29/11/2023)


### :rocket: Amélioration
- [#7508](https://github.com/1024pix/pix/pull/7508) [FEATURE] Ajouter un élément Image (PIX-9903).
- [#7527](https://github.com/1024pix/pix/pull/7527) [FEATURE] ajouter texte de synthèse du module (PIX-10076).
- [#7518](https://github.com/1024pix/pix/pull/7518) [FEATURE] Sauvegarder le créateur d'une session de certification (PIX-8002).

### :building_construction: Tech
- [#7534](https://github.com/1024pix/pix/pull/7534) [TECH] Migrer le usecase createCampaign & createCampaigns dans leurs bounded Context (PIX-10134).
- [#7532](https://github.com/1024pix/pix/pull/7532) [TECH] Renome des fichiers du domaine « school » qui on été mal nomé (PIX-10131).
- [#6432](https://github.com/1024pix/pix/pull/6432) [TECH] Enlever Faker des applications Front (PIX-8406).
- [#7499](https://github.com/1024pix/pix/pull/7499) [TECH] Retourner tous les fichiers XML en READY_TO_SEND dans le mail CPF à destination du métier (PIX-9102).
- [#7529](https://github.com/1024pix/pix/pull/7529) [TECH] Créer et retourner le champ `isAnswerable` via l'API (PIX-10094).
- [#7507](https://github.com/1024pix/pix/pull/7507) [TECH] Mettre à jour pix-ui pour avoir la modif du composant pix input code (Pix-10074).

### :bug: Correction
- [#7523](https://github.com/1024pix/pix/pull/7523) [BUGFIX] Mettre à jour la contrainte d'unicité pour valider la mise à jour ou la création d'un OrganizationLearner SUP (PIX-10112).

## v4.68.0 (27/11/2023)


### :rocket: Amélioration
- [#7509](https://github.com/1024pix/pix/pull/7509) [FEATURE] Le nombre de pix minimum pour une certification complémentaire est porté par ses badges (PIX-9955).
- [#7476](https://github.com/1024pix/pix/pull/7476) [FEATURE] Afficher uniquement un grain à la fois (PIX-9894).
- [#7511](https://github.com/1024pix/pix/pull/7511) [FEATURE] Rejeter une certification si le candidat n'a pas répondu à assez de questions (PIX-9980).
- [#7492](https://github.com/1024pix/pix/pull/7492) [FEATURE] Pouvoir définir un nombre de pix minimum lors du rattachement d'un profil cible sur Pix Admin (PIX-9951).
- [#7484](https://github.com/1024pix/pix/pull/7484) [FEATURE] Affichage du bloc personnalisé de fin de parcours pour les campagnes isForAbsoluteNovice (PIX-10020).

### :building_construction: Tech
- [#7512](https://github.com/1024pix/pix/pull/7512) [TECH] Migration des routes de modification et suppression de session vers le dossier src (PIX-9877).
- [#7519](https://github.com/1024pix/pix/pull/7519) [TECH] Exposer une API afin de récupérer les informations d'une campagne (Pix-10062).
- [#7520](https://github.com/1024pix/pix/pull/7520) [TECH] Migrer Progression vers la nouvelle arbo API (PIX-9932).
- [#7506](https://github.com/1024pix/pix/pull/7506) [TECH] Finir la migration des contenus formatifs dans devcomp (PIX-10067).

### :bug: Correction
- [#7524](https://github.com/1024pix/pix/pull/7524) [BUGFIX] Modification du format de données de variationPercent en BDD (PIX-10116).

### :coffee: Autre
- [#7514](https://github.com/1024pix/pix/pull/7514) [BUG] Le manque de référent Pix pour CLEA ne doit pas bloquer l'envoi de résultats de certifications (PIX-10013).

## v4.67.0 (23/11/2023)


### :rocket: Amélioration
- [#7418](https://github.com/1024pix/pix/pull/7418) [FEATURE] Permettre la création de parcours autonomes dans l'API (PIX-9806).
- [#7503](https://github.com/1024pix/pix/pull/7503) [FEATURE] Ajoute la feature de gestion des places à la route prescriber (PIX-9718).

### :building_construction: Tech
- [#7510](https://github.com/1024pix/pix/pull/7510) [TECH] Remplace Bookshelf du prescriber repository par knex (PIX-10071).

### :bug: Correction
- [#7515](https://github.com/1024pix/pix/pull/7515) [BUGFIX] Corrige un crash de la certification v3 avec les configurations forcedCompetences et enablePassageByAllCompetences.
- [#7494](https://github.com/1024pix/pix/pull/7494) [BUGFIX] Comportement du scrolling sur la sélection du centre de certif (PIX-9935).
- [#7491](https://github.com/1024pix/pix/pull/7491) [BUGFIX] Corriger les pétouilles du module `bien-ecrire-son-adresse-mail` (PIX-10026).
- [#7477](https://github.com/1024pix/pix/pull/7477) [BUGFIX] Afficher correctement les paliers sur les compétences.

### :coffee: Autre
- [#7490](https://github.com/1024pix/pix/pull/7490) [BUGIFX] Corriger le téléchargement du profil cible lors du téléchargement du PDF (PIX-10009).

## v4.66.0 (23/11/2023)


### :rocket: Amélioration
- [#7496](https://github.com/1024pix/pix/pull/7496) [FEATURE] Sauvegarder la configuration de l'algo de choix des épreuves en BDD. (PIX-9967).
- [#7498](https://github.com/1024pix/pix/pull/7498) [FEATURE] Créer le modèle `QcuForAnswerVerification` (PIX-9858).
- [#7487](https://github.com/1024pix/pix/pull/7487) [FEATURE] Afficher le nombre minimum de Pix dans la page de détails d'une certification sur Pix Admin (PIX-9963).
- [#7486](https://github.com/1024pix/pix/pull/7486) [FEATURE] Enregistrer qui a fait l'action de désactivation d'un membre Pix Certif depuis Pix Admin (PIX-9381).
- [#7485](https://github.com/1024pix/pix/pull/7485) [FEATURE] Ajoute la feature PLACES_MANAGEMENT (PIX-9717).

### :building_construction: Tech
- [#7504](https://github.com/1024pix/pix/pull/7504) [TECH] Amélioration databasebuilder.
- [#7505](https://github.com/1024pix/pix/pull/7505) [TECH] Flaky sur integrate-cpf-processing-receipts_test.js (PIX-10064).

### :bug: Correction
- [#7483](https://github.com/1024pix/pix/pull/7483) [BUGFIX] Empêcher l'ajout de plusieurs adresses emails (destinataire et candidat) dans l'import ods et la modale (PIX-9994).

### :coffee: Autre
- [#7501](https://github.com/1024pix/pix/pull/7501) [CHORE] :art:  Améliorer les pages d'erreur et de not found (Pix-9829).

## v4.65.0 (21/11/2023)


### :rocket: Amélioration
- [#7468](https://github.com/1024pix/pix/pull/7468) [FEATURE] Vérification de la typologie d'épreuve lors d'une alerte en certif V3 (PIX-9945).
- [#7432](https://github.com/1024pix/pix/pull/7432) [FEATURE] afficher la certificabilité depuis les campagnes pour les participants  (PIX-9892).
- [#7439](https://github.com/1024pix/pix/pull/7439) [FEATURE] Intégration des accusés de traitement CPF en masse via API et script (PIX-9835).
- [#7481](https://github.com/1024pix/pix/pull/7481) [FEATURE] PIX1D - Ajout du code de l'organisation côté Admin pour les écoles.
- [#7475](https://github.com/1024pix/pix/pull/7475) [FEATURE] Modifier l'information des candidats présents dans l'espace surveillant sur Pix Certif (PIX-9961).
- [#7392](https://github.com/1024pix/pix/pull/7392) [FEATURE] [API] Stocker des infos de l'utilisateur (claims de userInfo) lors d'une connexion SSO OIDC (PIX-9270).

### :building_construction: Tech
- [#7474](https://github.com/1024pix/pix/pull/7474) [TECH] Migrer les scorecards vers la nouvelle arbo API (PIX-9933).
- [#7497](https://github.com/1024pix/pix/pull/7497) [TECH] Standardisation des config de tests en fonction de la typologie.
- [#7493](https://github.com/1024pix/pix/pull/7493) [TECH] Déplacer les models et repositories associés aux contenus formatifs dans le bounded context Devcomp (PIX-10028).
- [#7489](https://github.com/1024pix/pix/pull/7489) [TECH] Pix1D - Utiliser le modèle "Assessment" du contexte "School".
- [#7478](https://github.com/1024pix/pix/pull/7478) [TECH] api: ajout du seuil en pix dans la table complementary-certification-badges (PIX-9953).
- [#7479](https://github.com/1024pix/pix/pull/7479) [TECH] Ajouter une API interne pour récupérer les profils cibles d'une organisation (PIX-10003).
- [#7445](https://github.com/1024pix/pix/pull/7445) [TECH] JSDoc pour naviguer vers les dépendances injectées automatiquement (PIX-9938).
- [#7473](https://github.com/1024pix/pix/pull/7473) [TECH][DATA] :broom: supprime le script d'analyse des données extraites d'un panel (pix-10005).

### :arrow_up: Montée de version
- [#7224](https://github.com/1024pix/pix/pull/7224) [BUMP] Update dependency ember-cli-mirage to v3 (certif).
- [#7495](https://github.com/1024pix/pix/pull/7495) [BUMP] Lock file maintenance (orga).
- [#7482](https://github.com/1024pix/pix/pull/7482) [BUMP] Lock file maintenance (mon-pix).
- [#7470](https://github.com/1024pix/pix/pull/7470) [BUMP] Update dependency ember-cp-validations to v6 (admin).

## v4.64.0 (17/11/2023)


### :rocket: Amélioration
- [#7457](https://github.com/1024pix/pix/pull/7457) [FEATURE] Autoriser l'edition des informations de candidat sans conditions dans pix admin (PIX-9916).
- [#7472](https://github.com/1024pix/pix/pull/7472) [FEATURE] Remplacer les pop-up par des bulles de messages (Pix-9748).
- [#7443](https://github.com/1024pix/pix/pull/7443) [FEATURE] Gestion des rôles et équipe dans Pix Certif.
- [#7471](https://github.com/1024pix/pix/pull/7471) [FEATURE] Ajouter le tri par date de dernière participation sur les organisations sans import (Pix-9867).
- [#7390](https://github.com/1024pix/pix/pull/7390) [FEATURE] Afficher le feedback global à l'apprenant (PIX-9861) (PIX-9707).
- [#7451](https://github.com/1024pix/pix/pull/7451) [FEATURE] Cacher l'onglet "Neutralisation" pour les certifs v3 dans Pix Admin (PIX-9942).
- [#7466](https://github.com/1024pix/pix/pull/7466) [FEATURE] Plafonner le niveau "Positionné" sur la page de détails d'une certif. (PIX-9177).
- [#7454](https://github.com/1024pix/pix/pull/7454) [FEATURE] Améliorer la sauvegarde en base d'un feedback utilisateur (PIX-8867).
- [#7465](https://github.com/1024pix/pix/pull/7465) [FEATURE] Améliorer le endpoint de validation de réponse (PIX-9974).

### :building_construction: Tech
- [#7395](https://github.com/1024pix/pix/pull/7395) [TECH] Refondre la manière d'exposer les fonctionnalités activées pour les organisations (PIX-9860).
- [#7449](https://github.com/1024pix/pix/pull/7449) [TECH] Refacto de FlashAssessmentAlgorithm (PIX-9949).
- [#7463](https://github.com/1024pix/pix/pull/7463) [TECH] Ajouter un test d'accessibilité sur les modules (PIX-9982).
- [#7444](https://github.com/1024pix/pix/pull/7444) [TECH] Déplacement du téléchargement des attestations de certification dans le dossier src (PIX-9890).
- [#7436](https://github.com/1024pix/pix/pull/7436) [TECH] Migration de l'authentification standard vers src (PIX-9775).
- [#7269](https://github.com/1024pix/pix/pull/7269) [TECH] Utiliser Caddy pour avoir des certificats SSL en local (PIX-9757).
- [#7464](https://github.com/1024pix/pix/pull/7464) [TECH] Enlever le missionId de la table assessment (Pix-9774).
- [#7461](https://github.com/1024pix/pix/pull/7461) [TECH] Supprimer les messages lors des tests d'intégration.
- [#7459](https://github.com/1024pix/pix/pull/7459) [TECH] déplacement de l'`ActivityRepository` vers le domain `School` (pix-9973).

### :bug: Correction
- [#7462](https://github.com/1024pix/pix/pull/7462) [BUGFIX] Corriger la version française de la double mire lors d'une connexion SSO OIDC et permettre son affichage en anglais.
- [#7469](https://github.com/1024pix/pix/pull/7469) [BUGFIX] Retourner les httpErrors dans l'error manager du dossier shared de src (PIX-10002).
- [#7467](https://github.com/1024pix/pix/pull/7467) [BUGFIX] Améliore l'accessibilité du QCU (PIX-9984).
- [#7460](https://github.com/1024pix/pix/pull/7460) [BUGFIX] Isoler les usages de i18n au sein des tests (PIX-9975).

## v4.63.0 (15/11/2023)


### :rocket: Amélioration
- [#7448](https://github.com/1024pix/pix/pull/7448) [FEATURE] Ajouter la 2ème bulle de dialogue (Pix-9747).
- [#7394](https://github.com/1024pix/pix/pull/7394) [FEATURE] Ajout de la double mesure de la capacité dans les simulateurs (pix-9833).

### :building_construction: Tech
- [#7453](https://github.com/1024pix/pix/pull/7453) [TECH] Migration du modèle challenge et challenge-repository de shared certif vers le global (PIX-9966).
- [#7431](https://github.com/1024pix/pix/pull/7431) [TECH] Créer l'API Campagne avec la méthode save (PIX-9906).
- [#7426](https://github.com/1024pix/pix/pull/7426) [TECH] Migration ajout de candidat en session vers src (PIX-9891).
- [#7433](https://github.com/1024pix/pix/pull/7433) [TECH] Refactoring des certifications complementaires partie 1 (PIX-9913).
- [#7435](https://github.com/1024pix/pix/pull/7435) [TECH] Déplacer ce qui touche à la gestion des paliers dans la nouvelle arborescence (PIX-9934).

### :bug: Correction
- [#7452](https://github.com/1024pix/pix/pull/7452) [BUGFIX] Permettre de recharger la page de fin de mission(Pix-9948).
- [#7450](https://github.com/1024pix/pix/pull/7450) [BUGFIX] Corriger les seeds.

## v4.62.0 (14/11/2023)


### :rocket: Amélioration
- [#7403](https://github.com/1024pix/pix/pull/7403) [FEATURE] Permettre la réinitialisation du résultat d'un jury externe de certification complémentaire (PIX-9705).
- [#7402](https://github.com/1024pix/pix/pull/7402) [FEATURE] Ajouter un script pour mettre à jour le rôle de membres de centres de certification (PIX-9826).

### :building_construction: Tech
- [#7396](https://github.com/1024pix/pix/pull/7396) [TECH] Récupère des challenges avec la bonne locale.
- [#7438](https://github.com/1024pix/pix/pull/7438) [TECH] Améliorer le nettoyage des tables après chaque tests d'intégration et d'acceptance.
- [#7437](https://github.com/1024pix/pix/pull/7437) [TECH] Migrer les feedbacks vers la nouvelle arbo API.
- [#7416](https://github.com/1024pix/pix/pull/7416) [TECH] Extraction de fonctions pour les placer dans le domaine « SCHOOL » (PIX-9883).
- [#7417](https://github.com/1024pix/pix/pull/7417) [TECH] Remplacer contains et not Contains par du testing-library dans les tests  Orga (PIX-9885).
- [#7427](https://github.com/1024pix/pix/pull/7427) [TECH] déplacer le code des listes de participants dans le contexte prescription (PIX-9886).
- [#7421](https://github.com/1024pix/pix/pull/7421) [TECH] Ajouter la notion de grain dans le domaine (PIX-9716).
- [#7420](https://github.com/1024pix/pix/pull/7420) [TECH] Déplacement de la fonctionnalité du kit surveillant dans le dossier src (PIX-9461). .

### :arrow_up: Montée de version
- [#7446](https://github.com/1024pix/pix/pull/7446) [BUMP] Lock file maintenance (api).
- [#7441](https://github.com/1024pix/pix/pull/7441) [BUMP] Update dependency libxmljs2 to ^0.33.0 (api).
- [#7440](https://github.com/1024pix/pix/pull/7440) [BUMP] Update dependency axios to v1.6.0 [SECURITY].

## v4.61.0 (09/11/2023)


### :rocket: Amélioration
- [#7425](https://github.com/1024pix/pix/pull/7425) [FEATURE] Ajouter des loaders (Pix-9888).
- [#7419](https://github.com/1024pix/pix/pull/7419) [FEATURE] Empêcher un candidat de répondre en cas d'alerte en cours (PIX-9007).

### :bug: Correction
- [#7375](https://github.com/1024pix/pix/pull/7375) [BUGFIX] Mettre à jour individuellement un palier dans un profil cible (PIX-9837).
- [#7428](https://github.com/1024pix/pix/pull/7428) [BUGFIX] Récupérer que les acquis avec un statut actif ou en construction (Pix-9900).
- [#7391](https://github.com/1024pix/pix/pull/7391) [BUGFIX] Corriger l'affichage systématique de la page Focus lors d'une épreuve de certification sur Pix App (PIX-9702).

### :arrow_up: Montée de version
- [#7429](https://github.com/1024pix/pix/pull/7429) [BUMP] Update dependency @badeball/cypress-cucumber-preprocessor to v19 (e2e).

## v4.60.0 (08/11/2023)


### :rocket: Amélioration
- [#7292](https://github.com/1024pix/pix/pull/7292) [FEATURE] Ne pas afficher le message de perte de certificabilité pour un prescrit déjà certifié sur Pix App. (PIX-9529).
- [#7341](https://github.com/1024pix/pix/pull/7341) [FEATURE] Afficher une mission 'Terminée' lorsque l'élève l'a fait une moins une fois (Pix-9088).
- [#7293](https://github.com/1024pix/pix/pull/7293) [FEATURE][ADMIN] Sélectionner un rôle à l'envoi d'une invitation à rejoindre un Centre de Certification (PIX-9463).
- [#7389](https://github.com/1024pix/pix/pull/7389) [FEATURE] Ne pas envoyer d'email sans lien pour le CPF (PIX-9863).
- [#7342](https://github.com/1024pix/pix/pull/7342) [FEATURE] Gestion de l'accusé de traitement CPF (partie 1) (PIX-9104).
- [#7387](https://github.com/1024pix/pix/pull/7387) [FEATURE] [API] Créer une variable d'environnement pour lister les claims OIDC supplémentaires à sauvegarder (PIX-9379).
- [#7344](https://github.com/1024pix/pix/pull/7344) [FEATURE] Modulix : Gérer la réponse de l'apprenant pour un QCU (PIX-9743).
- [#7380](https://github.com/1024pix/pix/pull/7380) [FEATURE] Sauvegarde du discriminant et de la difficulté en BDD (PIX-9831).
- [#7362](https://github.com/1024pix/pix/pull/7362) [FEATURE] Reprise du test avec une nouvelle question après un signalement validé (PIX-8812).
- [#7326](https://github.com/1024pix/pix/pull/7326) [FEATURE] Ajout du tag marquant une alerte en cours dans l'espace surveillant (PIX-8816).
- [#7377](https://github.com/1024pix/pix/pull/7377) [FEATURE] Limiter la variation du niveau estimé en certif V3 (PIX-9832).

### :building_construction: Tech
- [#7404](https://github.com/1024pix/pix/pull/7404) [TECH] Déplacer get Prescriber dans un bounded context (PIX-9879).
- [#7398](https://github.com/1024pix/pix/pull/7398) [TECH] Corrige des messages de dépréciation relatifs a ember-data sur certif.
- [#7393](https://github.com/1024pix/pix/pull/7393) [TECH] Extrait des méthodes utilitaires pour filtrer les épreuves par locale ou status.
- [#7382](https://github.com/1024pix/pix/pull/7382) [TECH] Migration des fichiers pour les flash campaigns dans la nouvelle arbo (PIX-9856).
- [#7372](https://github.com/1024pix/pix/pull/7372) [TECH] Déplacement de la fonctionnalité de la feuille d'émargement dans le dossier src (PIX-9461).
- [#7384](https://github.com/1024pix/pix/pull/7384) [TECH] Supprimer la méthode `findOperative` du `challengeRepository` qui n'est plus utilisé (PIX-9842).
- [#7388](https://github.com/1024pix/pix/pull/7388) [TECH] Suppression de la documentation sur la variable d'environnement `FT_TRAINING_RECOMMENDATION`.

### :arrow_up: Montée de version
- [#7415](https://github.com/1024pix/pix/pull/7415) [BUMP] Update dependency @1024pix/pix-ui to v41 (orga).
- [#7414](https://github.com/1024pix/pix/pull/7414) [BUMP] Update dependency @1024pix/pix-ui to v41 (mon-pix).
- [#7413](https://github.com/1024pix/pix/pull/7413) [BUMP] Update dependency @1024pix/pix-ui to v41 (certif).
- [#7397](https://github.com/1024pix/pix/pull/7397) [BUMP] Update node.
- [#7412](https://github.com/1024pix/pix/pull/7412) [BUMP] Update dependency @1024pix/ember-testing-library to v1 (orga).
- [#7411](https://github.com/1024pix/pix/pull/7411) [BUMP] Update dependency @1024pix/ember-testing-library to v1 (mon-pix).
- [#7410](https://github.com/1024pix/pix/pull/7410) [BUMP] Update dependency @1024pix/ember-testing-library to v1 (certif).
- [#7409](https://github.com/1024pix/pix/pull/7409) [BUMP] Update dependency @1024pix/ember-testing-library to v1 (admin).
- [#7408](https://github.com/1024pix/pix/pull/7408) [BUMP] Update dependency @1024pix/ember-testing-library to v1 (1d).
- [#7400](https://github.com/1024pix/pix/pull/7400) [BUMP] Update dependency @1024pix/pix-ui to v41 (1d).
- [#7401](https://github.com/1024pix/pix/pull/7401) [BUMP] Update dependency @1024pix/pix-ui to v41 (admin).
- [#7378](https://github.com/1024pix/pix/pull/7378) [BUMP] Update dependency jwt-decode to v4 (mon-pix).
- [#7386](https://github.com/1024pix/pix/pull/7386) [BUMP] Update dependency eslint-plugin-unicorn to v49 (api).

### :coffee: Autre
- [#7322](https://github.com/1024pix/pix/pull/7322) [CLEANUP] Corriger les avertissements de dépréciations d'ember data sur Pix certif#2.

## v4.59.0 (03/11/2023)


### :rocket: Amélioration
- [#7373](https://github.com/1024pix/pix/pull/7373) [FEATURE] Permettre aux Orga de type AEFE de bénéficier du calcul de la certificabilité (Pix-9818).
- [#7383](https://github.com/1024pix/pix/pull/7383) [FEATURE] Retirer la faute dans la clé de trad (PIX-9853).
- [#7374](https://github.com/1024pix/pix/pull/7374) [FEATURE] Supprimer le feature toggle FT_TARGET_PROFILE_VERSIONING (PIX-9024).
- [#7347](https://github.com/1024pix/pix/pull/7347) [FEATURE] Revue des accès pour le versioning des profils cibles sur Pix Admin (PIX-9753).
- [#7381](https://github.com/1024pix/pix/pull/7381) [FEATURE] Corriger la typo dans la modale de suppression (PIX-9853).

## v4.58.0 (03/11/2023)


### :rocket: Amélioration
- [#7376](https://github.com/1024pix/pix/pull/7376) [FEATURE] Création du script pour ajouter la feature à toutes les orgas SCO AEFE (PIX-9819).
- [#7303](https://github.com/1024pix/pix/pull/7303) [FEATURE] Ajouter des metriques sur retenter/remise à zéro d'une campagne (PIX-9730).
- [#7367](https://github.com/1024pix/pix/pull/7367) [FEATURE] Modifier l'affichage du texte de suppression des participants/étudiants (Pix-9211).
- [#7364](https://github.com/1024pix/pix/pull/7364) [FEATURE] Personnaliser la page de fin de parcours lors de création de campagne en masse (PIX-9686).

### :building_construction: Tech
- [#7340](https://github.com/1024pix/pix/pull/7340) [TECH] Empêcher un candidat d'alerter deux fois si une alerte est en cours (PIX-9027).
- [#7332](https://github.com/1024pix/pix/pull/7332) [TECH] - Api arborescence migration - amélioration du graph time series.
- [#7365](https://github.com/1024pix/pix/pull/7365) [TECH] Détruire le pool de connexion PgBoss à la fin de migration de BdD.
- [#7368](https://github.com/1024pix/pix/pull/7368) [TECH] Supprimer la méthode findOperative du challenge repository (PIX-9834).
- [#7366](https://github.com/1024pix/pix/pull/7366) [TECH] Ne plus utiliser le paramètre obsolète `scoring` des épreuves.

### :bug: Correction
- [#7323](https://github.com/1024pix/pix/pull/7323) [BUGFIX] Rendre le champ de la date de naissance obligatoire lors d'un ajout de candidat sur Pix Certif (PIX-9758).

### :arrow_up: Montée de version
- [#7371](https://github.com/1024pix/pix/pull/7371) [BUMP] Update nginx Docker tag to v1.25.3.
- [#7370](https://github.com/1024pix/pix/pull/7370) [BUMP] Lock file maintenance (admin).
- [#7369](https://github.com/1024pix/pix/pull/7369) [BUMP] Lock file maintenance (1d).
- [#7363](https://github.com/1024pix/pix/pull/7363) [BUMP] Update dependency @types/node to v20 (audit-logger).

## v4.57.0 (31/10/2023)


### :rocket: Amélioration
- [#7316](https://github.com/1024pix/pix/pull/7316) [FEATURE] Afficher le QCU dans le liste d'elements d'un module (PIX-9744).
- [#7359](https://github.com/1024pix/pix/pull/7359) [FEATURE] Créer table parcours autonome (PIX-9805).

### :building_construction: Tech
- [#7319](https://github.com/1024pix/pix/pull/7319) [TECH] Migrer competence evaluations vers la nouvelle arborescence (PIX-9755).

### :bug: Correction
- [#7361](https://github.com/1024pix/pix/pull/7361) [BUGFIX] Utiliser le bon argument pour la modal de suppression du SUP (PIX-9814).

### :arrow_up: Montée de version
- [#7357](https://github.com/1024pix/pix/pull/7357) [BUMP] Update actions/setup-node action to v4 (workflows).

## v4.56.0 (30/10/2023)


### :rocket: Amélioration
- [#7327](https://github.com/1024pix/pix/pull/7327) [FEATURE] Ajouter la configuration pour phrase.
- [#7262](https://github.com/1024pix/pix/pull/7262) [FEATURE] Permettre à une organisation SUP avec import de supprimer des prescrits (PIX-9200).
- [#7336](https://github.com/1024pix/pix/pull/7336) [FEATURE] Ajout du kit surveillant pour la certif V3 (pix-8814).
- [#7328](https://github.com/1024pix/pix/pull/7328) [FEATURE] Trier les candidats par statut d'alerte dans l'espace surveillant (PIX-8817).
- [#7337](https://github.com/1024pix/pix/pull/7337) [FEATURE] Suppression des signalements de catégorie E pour la certif V3 (PIX-8773).
- [#7331](https://github.com/1024pix/pix/pull/7331) [FEATURE] MAJ du lien de téléchargement de PV d'incident pour les session V3 (PIX-8814).
- [#7318](https://github.com/1024pix/pix/pull/7318) [FEATURE] Gestion du succès et des erreurs lors de la validation d'un signalement (PIX-9754).

### :building_construction: Tech
- [#7338](https://github.com/1024pix/pix/pull/7338) [TECH] Revert "Mettre la release dans le cache de premier niveau avant de démarrer le serveur.".
- [#7229](https://github.com/1024pix/pix/pull/7229) [TECH] Generer les sourcemaps automatiquement en dev et production.

### :bug: Correction
- [#7355](https://github.com/1024pix/pix/pull/7355) [BUGFIX] Correction des messages d'avertissement relatif a ember-cli-notifications.
- [#7334](https://github.com/1024pix/pix/pull/7334) [BUGFIX] Gérer le cas de la suppression de la méthode de connexion SSO PAYSDELALOIRE (PIX-9612).

### :arrow_up: Montée de version
- [#7352](https://github.com/1024pix/pix/pull/7352) [BUMP] Update dependency sinon to v17 (load-testing).
- [#7354](https://github.com/1024pix/pix/pull/7354) [BUMP] Update dependency sinon to v17 (orga).
- [#7353](https://github.com/1024pix/pix/pull/7353) [BUMP] Update dependency sinon to v17 (mon-pix).
- [#7351](https://github.com/1024pix/pix/pull/7351) [BUMP] Update dependency sinon to v17 (certif).
- [#7350](https://github.com/1024pix/pix/pull/7350) [BUMP] Update dependency sinon to v17 (api).
- [#7348](https://github.com/1024pix/pix/pull/7348) [BUMP] Update dependency sinon to v17 (admin).
- [#7346](https://github.com/1024pix/pix/pull/7346) [BUMP] Update dependency sinon to v17 (1d).
- [#7339](https://github.com/1024pix/pix/pull/7339) [BUMP] Update Node.js to v20.8.1.
- [#7315](https://github.com/1024pix/pix/pull/7315) [BUMP] Update node to v20 (major).

## v4.55.0 (26/10/2023)


### :rocket: Amélioration
- [#7278](https://github.com/1024pix/pix/pull/7278) [FEATURE] Amélioration du système de patch du cache LCMS (PIX-9687).

### :building_construction: Tech
- [#7325](https://github.com/1024pix/pix/pull/7325) [TECH] Améliorer le css des modules (PIX-9751).

### :bug: Correction
- [#7333](https://github.com/1024pix/pix/pull/7333) [BUGFIX] Le bas de l'épreuve est masqué par les boutons d'action.

## v4.54.0 (26/10/2023)


### :rocket: Amélioration
- [#7284](https://github.com/1024pix/pix/pull/7284) [FEATURE] Indiquer le niveau 1 par défaut pour les badges lors du rattachement d'un profil cible sur Pix Admin (PIX-9701).
- [#7275](https://github.com/1024pix/pix/pull/7275) [FEATURE] Bloquer la réutilisation d'un PC qui a déjà été lié à une complémentaire.
- [#7264](https://github.com/1024pix/pix/pull/7264) [FEATURE] Traduire la feuille d'émargement en anglais (PIX-6684).

### :building_construction: Tech
- [#7329](https://github.com/1024pix/pix/pull/7329) [TECH] Script pour générer des élèves et une orga type SCO-1D (Pix-9085).

### :bug: Correction
- [#7321](https://github.com/1024pix/pix/pull/7321) [BUGFIX] Rectifier le style des citations dans la modale de correction (PIX-9272).
- [#7324](https://github.com/1024pix/pix/pull/7324) [BUGFIX][ADMIN] Afficher la date de création d'un compte seulement quand elle est disponible (PIX-9570).

## v4.53.0 (25/10/2023)


### :rocket: Amélioration
- [#7281](https://github.com/1024pix/pix/pull/7281) [FEATURE][CERTIF] Permettre l'envoi d'invitation par un admin (PIX-8562).
- [#7241](https://github.com/1024pix/pix/pull/7241) [FEATURE] Ajout au SSO OIDC de la nouvelle fonctionnalité générique RP-Initiated Logout (PIX-9291).

### :building_construction: Tech
- [#7310](https://github.com/1024pix/pix/pull/7310) [TECH] Ajouter des logs lors de l'échange des tokens Pole Emploi (PIX-9742).

### :bug: Correction
- [#7291](https://github.com/1024pix/pix/pull/7291) [BUGFIX] Corriger la gestion d'erreurs front sur Pix Certif.

### :coffee: Autre
- [#7320](https://github.com/1024pix/pix/pull/7320) [CLEANUP] Corriger les avertissements de dépréciations d'ember data sur Pix certif.
- [#7200](https://github.com/1024pix/pix/pull/7200) [DOC] Ecriture d'une ADR sur le choix d'arborescence pour les applications Front (PIX-9516).

## v4.52.0 (24/10/2023)


### :rocket: Amélioration
- [#7299](https://github.com/1024pix/pix/pull/7299) [FEATURE] Valider l'alerte d'un candidat en certif V3 (PIX-9691).
- [#7019](https://github.com/1024pix/pix/pull/7019) [FEATURE] Mettre à jour la tooltip sur la remontée de la certificabilité pour les organisations SCO avec import (PIX-8874).
- [#7282](https://github.com/1024pix/pix/pull/7282) [FEATURE] Affiche le nom de l'élève sélectionné dans la page des missions (PIX-9087).
- [#7018](https://github.com/1024pix/pix/pull/7018) [FEATURE] Afficher une bannière informant que la certificabilité remonte automatiquement pours les SCO isManagingStudent (PIX-8873).
- [#7052](https://github.com/1024pix/pix/pull/7052) [FEATURE]  Suggérer d'aller sur l'onglet Élèves au lieu de créer une campagne de collecte de profil sur la page de création de campagne (PIX-8875).
- [#7290](https://github.com/1024pix/pix/pull/7290) [FEATURE] Modulix : Accéder à une leçon textuelle (PIX-9674).
- [#7288](https://github.com/1024pix/pix/pull/7288) [FEATURE] Valider l'alerte du candidat en certif v3 (PIX-9690).

### :building_construction: Tech
- [#7183](https://github.com/1024pix/pix/pull/7183) [TECH] Remplacer ember-inputmask par ember-inputmask5.
- [#7305](https://github.com/1024pix/pix/pull/7305) [TECH] Ajout de seeds pour les issue-report-categories (PIX-9738).
- [#7272](https://github.com/1024pix/pix/pull/7272) [TECH] Déclencher des événèments Matomo depuis le code (PIX-9456).
- [#7286](https://github.com/1024pix/pix/pull/7286) [TECH] Ajout d'un "await" manquant lors d'une connexion de type OIDC (PIX-9700).

### :bug: Correction
- [#7289](https://github.com/1024pix/pix/pull/7289) [BUGFIX] [CRON] Figer la date de l'interval pour calculer la certificabilité des apprenants (PIX-9711) .

### :arrow_up: Montée de version
- [#7317](https://github.com/1024pix/pix/pull/7317) [BUMP] Lock file maintenance (audit-logger).
- [#7313](https://github.com/1024pix/pix/pull/7313) [BUMP] Lock file maintenance (certif).
- [#7312](https://github.com/1024pix/pix/pull/7312) [BUMP] Lock file maintenance (orga).
- [#7311](https://github.com/1024pix/pix/pull/7311) [BUMP] Lock file maintenance (admin).
- [#7309](https://github.com/1024pix/pix/pull/7309) [BUMP] Lock file maintenance (mon-pix).
- [#7308](https://github.com/1024pix/pix/pull/7308) [BUMP] Lock file maintenance (api).
- [#7307](https://github.com/1024pix/pix/pull/7307) [BUMP] Update dependency @1024pix/ember-testing-library to ^0.9.0 (orga).
- [#7306](https://github.com/1024pix/pix/pull/7306) [BUMP] Update dependency @1024pix/ember-testing-library to ^0.9.0 (mon-pix).
- [#7304](https://github.com/1024pix/pix/pull/7304) [BUMP] Update dependency @1024pix/ember-testing-library to ^0.9.0 (certif).
- [#7301](https://github.com/1024pix/pix/pull/7301) [BUMP] Update dependency @1024pix/ember-testing-library to ^0.9.0 (admin).
- [#7300](https://github.com/1024pix/pix/pull/7300) [BUMP] Update dependency @1024pix/ember-testing-library to ^0.9.0 (1d).
- [#7302](https://github.com/1024pix/pix/pull/7302) [BUMP] Lock file maintenance (1d).
- [#7298](https://github.com/1024pix/pix/pull/7298) [BUMP] Update dependency qunit-dom to v3 (orga).
- [#7297](https://github.com/1024pix/pix/pull/7297) [BUMP] Update dependency qunit-dom to v3 (mon-pix).
- [#7296](https://github.com/1024pix/pix/pull/7296) [BUMP] Update dependency qunit-dom to v3 (certif).
- [#7294](https://github.com/1024pix/pix/pull/7294) [BUMP] Update dependency lint-staged to v15 (dossier racine).
- [#7267](https://github.com/1024pix/pix/pull/7267) [BUMP] Lock file maintenance (1d).
- [#7295](https://github.com/1024pix/pix/pull/7295) [BUMP] Update dependency qunit-dom to v3 (admin).
- [#7285](https://github.com/1024pix/pix/pull/7285) [BUMP] Update dependency qunit-dom to v3 (1d).

## v4.51.0 (19/10/2023)


### :building_construction: Tech
- [#7287](https://github.com/1024pix/pix/pull/7287) [TECH] Mettre la release dans le cache de premier niveau avant de démarrer le serveur.

## v4.50.0 (19/10/2023)


### :rocket: Amélioration
- [#7274](https://github.com/1024pix/pix/pull/7274) [FEATURE] Ajout de la modal de validation de signalement dans la certification V3 (PIX-9689).
- [#7221](https://github.com/1024pix/pix/pull/7221) [FEATURE] Séparation des données du compte-personnel-formation en base (PIX-9103).
- [#7265](https://github.com/1024pix/pix/pull/7265) [FEATURE] Modification de la redirection une fois le rattachement du nouveau PC réussi (PIX-9568).
- [#7273](https://github.com/1024pix/pix/pull/7273) [FEATURE]  Identifie la classe puis l'élève dans Pix 1D (pix-9086).
- [#7239](https://github.com/1024pix/pix/pull/7239) [FEATURE] Ne pas indiquer de tenter le niveau supérieur lorsque l'utilisateur a atteint le niveau max (PIX-9595).

### :bug: Correction
- [#7248](https://github.com/1024pix/pix/pull/7248) [BUGFIX] Éviter les erreurs 400 en récupérant un module (PIX-9597).

## v4.49.0 (18/10/2023)


### :rocket: Amélioration
- [#7279](https://github.com/1024pix/pix/pull/7279) [FEATURE] Mettre à jour la route de récupération de stages dans orga (Revert)(PIX-8914) ".
- [#7277](https://github.com/1024pix/pix/pull/7277) [FEATURE] Ne pas afficher la date de certificabilitée des prescrits d'une organization avec la feature de remontée auto (PIX-9494).

## v4.48.0 (18/10/2023)


### :building_construction: Tech
- [#7063](https://github.com/1024pix/pix/pull/7063) [TECH] Appeler la route /identity-providers sur Pix Admin uniquement quand nécessaire (PIX-9152).
- [#7266](https://github.com/1024pix/pix/pull/7266) [TECH] Refacto de l'algo de sélection des épreuves (PIX-9667).

### :bug: Correction
- [#7276](https://github.com/1024pix/pix/pull/7276) [BUGFIX] Ordonner les id des apprenants sur la pagination du calcul de la certificabilité (PIX-9698).

### :coffee: Autre
- [#7271](https://github.com/1024pix/pix/pull/7271) [EPIX] Premettre la suppression des étudiants lors de l'import (Pix-9201).

## v4.47.0 (18/10/2023)


### :rocket: Amélioration
- [#7258](https://github.com/1024pix/pix/pull/7258) [FEATURE] Suppression du feature toggle MASSIVE_SESSION_MANAGEMENT (PIX-9630).
- [#7016](https://github.com/1024pix/pix/pull/7016) [FEATURE] Mettre à jour la route de récupération de stages dans orga (PIX-8914) .

### :building_construction: Tech
- [#7208](https://github.com/1024pix/pix/pull/7208) [TECH] Remplacer la lib `eslint-plugin-local-rules` par `@1024pix/eslint-plugin`.

### :bug: Correction
- [#7268](https://github.com/1024pix/pix/pull/7268) [BUGFIX] Restaurer la dépendance buffer nécessaire pour js-yaml.

## v4.46.0 (17/10/2023)


### :rocket: Amélioration
- [#7260](https://github.com/1024pix/pix/pull/7260) [FEATURE] Accéder à une leçon textuelle (PIX-9673).
- [#7002](https://github.com/1024pix/pix/pull/7002) [FEATURE] Afficher les stages en fin de parcours depuis la base de données (PIX-8913).

### :building_construction: Tech
- [#7233](https://github.com/1024pix/pix/pull/7233) [TECH] Ajouter un service d'envoi de mail via SMTP.

### :bug: Correction
- [#7270](https://github.com/1024pix/pix/pull/7270) [BUGFIX] Utiliser la bonne configuration pour la knex transaction du CRON de certificabilitée (PIX-9676).

## v4.45.0 (17/10/2023)


### :rocket: Amélioration
- [#7257](https://github.com/1024pix/pix/pull/7257) [FEATURE] Suppression du bandeau d'information concernant la gestion massive des sessions sur Pix Certif (PIX-9562).
- [#7065](https://github.com/1024pix/pix/pull/7065) [FEATURE] Envoyer un email aux organisations avec une campagne basée sur l’ancien PC (PIX-8932).

### :building_construction: Tech
- [#7261](https://github.com/1024pix/pix/pull/7261) [TECH] Utilisation de stream pour renvoyer la réponse des simulateurs (PIX-9669).
- [#7050](https://github.com/1024pix/pix/pull/7050) [TECH] Récupérer les paliers acquis dans la page "Mes parcours" (PIX-8912).
- [#7256](https://github.com/1024pix/pix/pull/7256) [TECH] Pix1D - Ajout du support d'un fichier .env (PIX-9628).
- [#7247](https://github.com/1024pix/pix/pull/7247) [TECH] Refacto des filtres appliqués sur l'algorithme flash (PIX-9613).
- [#7259](https://github.com/1024pix/pix/pull/7259) [TECH] Amélioration des performances des simulateurs de la certification v3.

### :bug: Correction
- [#7263](https://github.com/1024pix/pix/pull/7263) [BUGFIX] Ne pas afficher les RT qui n'ont pas de badge certifié (PIx-9596).
- [#7246](https://github.com/1024pix/pix/pull/7246) [BUGFIX] Réinitialiser la certificabilité lors de l'anonymisation d'un utilisateur (PIX-9614).

### :arrow_up: Montée de version
- [#7255](https://github.com/1024pix/pix/pull/7255) [BUMP] Update dependency knex to v3 (api).

## v4.44.0 (13/10/2023)


### :rocket: Amélioration
- [#7242](https://github.com/1024pix/pix/pull/7242) [FEATURE] Afficher un module (PIX-9450).
- [#7254](https://github.com/1024pix/pix/pull/7254) [FEATURE] Remettre les boutons d'actions dans une sticky barre en bas de l'écran (Pix-9536).
- [#7235](https://github.com/1024pix/pix/pull/7235) [FEATURE] Générer la feuille d'émargement en PDF pour le SCO sur Pix Certif (PIX-9459).
- [#7245](https://github.com/1024pix/pix/pull/7245) [FEATURE] Améliorer l'affichage des options de l'épreuve validation (Pix-9610).

### :building_construction: Tech
- [#7249](https://github.com/1024pix/pix/pull/7249) [TECH] Ajouter une variable d'env pour gérer les sources possibles pour les embeds (Pix-9615).

### :bug: Correction
- [#7253](https://github.com/1024pix/pix/pull/7253) [BUGFIX] Utiliser la domainTransaction pour l'insertion des jobs du CRON (PIX-9623).
- [#7250](https://github.com/1024pix/pix/pull/7250) [BUGFIX] Admin ne se lance plus (PIX-9624).
- [#7252](https://github.com/1024pix/pix/pull/7252) [BUGFIX] Ajouter une contrainte manquante pour le SSO "Pays de la Loire" dans le schéma de la base de données (PIX-9611).

### :coffee: Autre
- [#7164](https://github.com/1024pix/pix/pull/7164) [DOCS] Mise à jour du Contributing.MD.

## v4.43.0 (12/10/2023)


### :rocket: Amélioration
- [#7216](https://github.com/1024pix/pix/pull/7216) [FEATURE] Possibilité de désactiver le passage par toutes les compétences dans le simulateur (PIX-9466).
- [#7236](https://github.com/1024pix/pix/pull/7236) [FEATURE] Modifier le design du bouton de signalement dans les épreuves (PIX-9583).
- [#7156](https://github.com/1024pix/pix/pull/7156) [FEATURE] Unifier la compatibilité des apps Ember.js avec les différents navigateurs web suivant l'ADR.

### :building_construction: Tech
- [#7240](https://github.com/1024pix/pix/pull/7240) [TECH] Refactoring de l'algo de choix des épreuves next-gen (PIX-9560).
- [#7243](https://github.com/1024pix/pix/pull/7243) [TECH] Déclarer `eslint-plugin-118n-json` dans chaque application qui l'utilise.
- [#7203](https://github.com/1024pix/pix/pull/7203) [TECH] Supprimer les scripts obsolètes (PIX-9229).

### :bug: Correction
- [#7244](https://github.com/1024pix/pix/pull/7244) [BUGFIX] Téléchargement de la feuille d'émargement KO pour CDC non SCO si identifiant local NULL. (PIX-9604).

### :coffee: Autre
- [#7189](https://github.com/1024pix/pix/pull/7189) [REFACTOR] move GetNextChallengeForPix1d to school bounded context (PIX-9496).

## v4.42.0 (11/10/2023)


### :rocket: Amélioration
- [#7237](https://github.com/1024pix/pix/pull/7237) [FEATURE] Ajouter le SSO "Pays de la Loire" en tant que méthode d'authentification dans la base de données (PIX-9581).
- [#7226](https://github.com/1024pix/pix/pull/7226) [FEATURE] 1D - Appliquer le nouveau design à la page de début de mission (PIX-9366).

### :building_construction: Tech
- [#7178](https://github.com/1024pix/pix/pull/7178) [TECH] Déplacer les usecases answers et assessment dans la nouvelle arbo (PIX-9446).
- [#7238](https://github.com/1024pix/pix/pull/7238) [TECH] Ajout explicite de la dépendance `@fortawesome/fontawesome-svg-core`.
- [#7227](https://github.com/1024pix/pix/pull/7227) [TECH] Utiliser un template vide pour la feuille d'émargement (PIX-9540).
- [#7232](https://github.com/1024pix/pix/pull/7232) [TECH] Améliorer la structure pods de Pix1d (PIX-9585).

### :bug: Correction
- [#7190](https://github.com/1024pix/pix/pull/7190) [BUGFIX] Ajuster la taille du select sur les épreuves dans Pix-App (PIX-8539).

## v4.41.1 (11/10/2023)


### :rocket: Amélioration
- [#7228](https://github.com/1024pix/pix/pull/7228) [FEATURE] Rajouter des logs dans les logs des caches.

## v4.41.0 (10/10/2023)


### :rocket: Amélioration
- [#7223](https://github.com/1024pix/pix/pull/7223) [FEATURE] Scoring d'une certif V3 terminée par le surveillant (PIX-9541).
- [#7160](https://github.com/1024pix/pix/pull/7160) [FEATURE] Creation d'une migration pour passer tous les prescrits SUP désactivés à supprimés (PIX-9199).
- [#7184](https://github.com/1024pix/pix/pull/7184) [FEATURE] Transformer la feuille d'émargement en PDF pour le non SCO (PIX-8449).
- [#7194](https://github.com/1024pix/pix/pull/7194) [FEATURE] Appliquer le design sur la page de fin de mission (Pix-9367).
- [#7198](https://github.com/1024pix/pix/pull/7198) [FEATURE] Remplacement du pseudo-aléatoire par de l'aléatoire dans la certif V3 (PIX-9510).
- [#7134](https://github.com/1024pix/pix/pull/7134) [FEATURE] Afficher un message lorsqu'un candidat perd son éligibilité à une certification complémentaire sur Pix App (PIX-9023).
- [#7167](https://github.com/1024pix/pix/pull/7167) [FEATURE] Affichage du challenge avec le nouveau design (PIX-9368).
- [#7146](https://github.com/1024pix/pix/pull/7146) [FEATURE] Ajouter le SSO Pays de la Loire (PIX-9309).

### :building_construction: Tech
- [#7185](https://github.com/1024pix/pix/pull/7185) [TECH] Suppression du fichier humans.txt.
- [#7207](https://github.com/1024pix/pix/pull/7207) [TECH] Corrige les imports ESM pour le CPF.
- [#7206](https://github.com/1024pix/pix/pull/7206) [TECH] Déplacer les tests de la `EntityValidationError` du `error-manager` dans `src` (API).
- [#7205](https://github.com/1024pix/pix/pull/7205) [TECH] Sécuriser le matching de tests (API).

### :bug: Correction
- [#7231](https://github.com/1024pix/pix/pull/7231) [BUGFIX] Corrige mirage en developement sur 1d.
- [#7201](https://github.com/1024pix/pix/pull/7201) [BUGFIX] Correction d'une classe manquante sur le profil utilisateur sur pix-admin (PIX-9511).
- [#7204](https://github.com/1024pix/pix/pull/7204) [BUGFIX] Relancer les tests unitaires.

### :arrow_up: Montée de version
- [#7230](https://github.com/1024pix/pix/pull/7230) [BUMP] Update dependency knex to v3 (audit-logger).
- [#7220](https://github.com/1024pix/pix/pull/7220) [BUMP] Update dependency ember-cli-mirage to v3 (mon-pix).
- [#7225](https://github.com/1024pix/pix/pull/7225) [BUMP] Update dependency ember-cli-mirage to v3 (orga).
- [#7116](https://github.com/1024pix/pix/pull/7116) [BUMP] Update dependency ember-intl to v6 (orga).
- [#7222](https://github.com/1024pix/pix/pull/7222) [BUMP] Update dependency ember-cli-mirage to v3 (1d).
- [#7218](https://github.com/1024pix/pix/pull/7218) [BUMP] Lock file maintenance (dossier racine).
- [#7217](https://github.com/1024pix/pix/pull/7217) [BUMP] Lock file maintenance (1d).
- [#7214](https://github.com/1024pix/pix/pull/7214) [BUMP] Lock file maintenance (admin).
- [#7213](https://github.com/1024pix/pix/pull/7213) [BUMP] Lock file maintenance (audit-logger).
- [#7212](https://github.com/1024pix/pix/pull/7212) [BUMP] Lock file maintenance (orga).
- [#7211](https://github.com/1024pix/pix/pull/7211) [BUMP] Lock file maintenance (certif).
- [#7210](https://github.com/1024pix/pix/pull/7210) [BUMP] Lock file maintenance (mon-pix).
- [#7209](https://github.com/1024pix/pix/pull/7209) [BUMP] Lock file maintenance (api).

### :coffee: Autre
- [#7199](https://github.com/1024pix/pix/pull/7199) [FIX] Pix1D - Afficher les éléments sélectionnés dans les menus déroulants des QROCM.

## v4.40.0 (06/10/2023)


### :rocket: Amélioration
- [#7177](https://github.com/1024pix/pix/pull/7177) [FEATURE] Rendre disponible via l'API les données d'un module (PIX-9449).
- [#7173](https://github.com/1024pix/pix/pull/7173) [FEATURE] [Certif] Afficher le bouton et la page pour envoyer des invitations (PIX-134).

### :building_construction: Tech
- [#7191](https://github.com/1024pix/pix/pull/7191) [TECH] Optimisation de la conversion des challenges en objets du domaine.
- [#7197](https://github.com/1024pix/pix/pull/7197) [TECH] Automatiser l'execution du script de reprise de données des paliers (PIX-9497).
- [#7202](https://github.com/1024pix/pix/pull/7202) [TECH] N'utiliser que le render provenant de @1024pix/ember-testing-library dans les tests (PIX-9521).

## v4.39.0 (03/10/2023)


### :rocket: Amélioration
- [#7195](https://github.com/1024pix/pix/pull/7195) [FEATURE] Mise à jour des seuils des mailles de scoring (PIX-9514).
- [#7163](https://github.com/1024pix/pix/pull/7163) [FEATURE] Configurer les taux de réussite de la certif v3 dans les simulateurs (PIX-9396).
- [#7161](https://github.com/1024pix/pix/pull/7161) [FEATURE] Ajout de la limite de questions par sujet dans le simulateur (PIX-9397).
- [#7124](https://github.com/1024pix/pix/pull/7124) [FEATURE] Afficher la page d'accueil d'une organization (Pix-9084).
- [#7176](https://github.com/1024pix/pix/pull/7176) [FEATURE] Ne pas écraser les données de certificabilité lors d'un import SIECLE (PIX-9378).
- [#7145](https://github.com/1024pix/pix/pull/7145) [FEATURE] Ajout du nombre d'organisations, centres de certif et participations sur la page users de pix-admin .

### :building_construction: Tech
- [#7192](https://github.com/1024pix/pix/pull/7192) [TECH] Retirer l'usage du composant PixDropdown sur PixOrga (PIX-9205).
- [#6331](https://github.com/1024pix/pix/pull/6331) [TECH] Ajoute une règle ESLint pour éviter les `sinon.stub().withArgs` en une ligne.
- [#7186](https://github.com/1024pix/pix/pull/7186) [TECH] Ne pas vérifier la présence du créateur dans l'organisation sur la création de campagnes en masse (PIX-9490).
- [#7188](https://github.com/1024pix/pix/pull/7188) [TECH] Loguer le recId d'un challenge lors d'une erreur au moment de l'évaluation d'une réponse (pix-9495).
- [#7179](https://github.com/1024pix/pix/pull/7179) [TECH] Tracer la récupération de la release LCMS.
- [#7170](https://github.com/1024pix/pix/pull/7170) [TECH] Création d'un nouveau statut "OUTDATED"  pour le cpfImportStatus (PIX-9096).
- [#7140](https://github.com/1024pix/pix/pull/7140) [TECH] Extraire les fonctionalités mail vers src (PIX-9363).
- [#6990](https://github.com/1024pix/pix/pull/6990) [TECH] Mise à jour des dépendences certifs.
- [#7159](https://github.com/1024pix/pix/pull/7159) [TECH] Utiliser uniquement le setupIntl qui provient des helpers (PIX-9392).
- [#7162](https://github.com/1024pix/pix/pull/7162) [TECH] Simplifier le script de lancement des tests de l'API.
- [#7141](https://github.com/1024pix/pix/pull/7141) [TECH] Permettre d'accéder aux sessions créées avec le CLI certif (PIX-9364).
- [#7168](https://github.com/1024pix/pix/pull/7168) [TECH] Eviter de contacter la BDD dans les tests unitaires via lint.
- [#7172](https://github.com/1024pix/pix/pull/7172) [TECH] Eviter d'importer les repositories dans les use-cases via lint.
- [#7093](https://github.com/1024pix/pix/pull/7093) [TECH] Ajoute une option onlyNotComputed sur le CRON du calcul de la certificabilité (PIX-9227).
- [#7157](https://github.com/1024pix/pix/pull/7157) [TECH] Prendre en compte les tests liés aux contextes métier (PIX-9388).

### :bug: Correction
- [#7193](https://github.com/1024pix/pix/pull/7193) [BUGFIX] Borner les niveaux atteignables par le candidat. (PIX-9502).
- [#7171](https://github.com/1024pix/pix/pull/7171) [BUGFIX] Corriger l'affichage de la date de dernier envoi d'invitation à un centre de certification (PIX-9427).
- [#7166](https://github.com/1024pix/pix/pull/7166) [BUGFIX] Nouveau changement de l'url pour la suspicion de fraude (PIX-9435).
- [#7175](https://github.com/1024pix/pix/pull/7175) [BUGFIX] La route GET /api/answers/{id}/correction renvoie une erreur 500 si le challenge n'est pas dans le référentiel.

### :coffee: Autre
- [#7165](https://github.com/1024pix/pix/pull/7165) [TEST] Validation de l'affichage du score de certification v3 dans le profil utilisateur (PIX-9063).
- [#7085](https://github.com/1024pix/pix/pull/7085) [DOCS] Finaliser l'ADR 0040 sur les locales languages qui ne l'était pas encore.

## v4.38.0 (27/09/2023)


### :rocket: Amélioration
- [#7150](https://github.com/1024pix/pix/pull/7150) [FEATURE] Ne pas poser 2 question sur le même sujet dans la certif v3 (PIX-9293).
- [#7073](https://github.com/1024pix/pix/pull/7073) [FEATURE] Afficher les invitations en attente d'une équipe sur Pix Certif (PIX-138).
- [#7144](https://github.com/1024pix/pix/pull/7144) [FEATURE] Suspicion de fraude en anglais (PIX-7766).
- [#7129](https://github.com/1024pix/pix/pull/7129) [FEATURE] Version anglaise du PV d'incident (PIX-6675).
- [#7138](https://github.com/1024pix/pix/pull/7138) [FEATURE] Afficher l'image du badge certifié dans la page de détails d'une certification complémentaire sur Pix Admin (PIX-9148).
- [#7130](https://github.com/1024pix/pix/pull/7130) [FEATURE] Changement du texte et du lien quand un candidat n'a pas pu rejoindre une session (PIX-6678).
- [#7137](https://github.com/1024pix/pix/pull/7137) [FEATURE] Mettre à jour les dates de certification pour les lycées et collèges sur Pix Certif (PIX-9314).
- [#7118](https://github.com/1024pix/pix/pull/7118) [FEATURE] Augmenter le taux de réussite estimé au début de la certif v3.

### :building_construction: Tech
- [#7154](https://github.com/1024pix/pix/pull/7154) [TECH] Favoriser l'utilisation de calledWithExactly au lieu de calledWith.
- [#7071](https://github.com/1024pix/pix/pull/7071) [TECH] Définir une valeur de MAX_REACHABLE_LEVEL pour les tests.
- [#7149](https://github.com/1024pix/pix/pull/7149) [TECH] Mise à jour de @1024pix/stylelint-config en version 5.0.

### :bug: Correction
- [#7136](https://github.com/1024pix/pix/pull/7136) [BUGFIX] Réparer l'affichage du sélecteur de langue sur la page de connexion de Pix Certif (PIX-9350).
- [#7143](https://github.com/1024pix/pix/pull/7143) [BUGFIX] Afficher les styles de liste dans la correction (PIX-9193).

### :arrow_up: Montée de version
- [#7158](https://github.com/1024pix/pix/pull/7158) [BUMP] Update dependency ember-data to ~4.12.0 (1d).
- [#7152](https://github.com/1024pix/pix/pull/7152) [BUMP] Update dependency ember-cli to ~5.3.0 (admin).
- [#7151](https://github.com/1024pix/pix/pull/7151) [BUMP] Update dependency ember-cli to ~5.3.0 (1d).

### :coffee: Autre
- [#7135](https://github.com/1024pix/pix/pull/7135) [HOTFIX] Hotfix v4.36.1.

## v4.37.0 (25/09/2023)


### :rocket: Amélioration
- [#7120](https://github.com/1024pix/pix/pull/7120) [FEATURE] Afficher la nouvelle colonne "rôle" sur le tableau listant les centres de certification d'un utilisateur (PIX-9231). .
- [#7068](https://github.com/1024pix/pix/pull/7068) [FEATURE] Afficher la disponibilité des niveaux pour les acquis dans les sujets sur PixAdmin (PIX-9168).
- [#7114](https://github.com/1024pix/pix/pull/7114) [FEATURE] Espacer les questions de même compétence dans la certif v3 (PIX-9213).
- [#6956](https://github.com/1024pix/pix/pull/6956) [FEATURE] Refus d'un signalement en direct par le surveillant (PIX-8798).
- [#7119](https://github.com/1024pix/pix/pull/7119) [FEATURE] Ajout d'un lien direct vers le badge d'un target profile de complémentaire (PIX-9149).
- [#7123](https://github.com/1024pix/pix/pull/7123) [FEATURE] Ordonner les badges des certifications complementaires par niveaux (PIX-9308).
- [#7055](https://github.com/1024pix/pix/pull/7055) [FEATURE][ADMIN] Permettre la modification du rôle d'un membre d'un centre de certification (PIX-4996).
- [#7117](https://github.com/1024pix/pix/pull/7117) [FEATURE] Modification de design pour le details d'une complementaire (PIX-9146).
- [#7084](https://github.com/1024pix/pix/pull/7084) [FEATURE] Conditionner l'affichage des champs du tableau des RT certifiants selon le volet de la certification complémentaire sur Pix Admin (PIX-9006).

### :building_construction: Tech
- [#7125](https://github.com/1024pix/pix/pull/7125) [TECH] Exclure les learners toujours présent de la liste à désactiver (PIX-9345).
- [#7115](https://github.com/1024pix/pix/pull/7115) [TECH] Migrer les routes SUP Import Replace dans son Bounded Context (PIX-9301).

### :bug: Correction
- [#7133](https://github.com/1024pix/pix/pull/7133) [BUGFIX] Ne plus activer tout les learners lors d'une nouvelle participation à une campagne (PIX-9353).
- [#7099](https://github.com/1024pix/pix/pull/7099) [BUGFIX] ajoute le statut « en construction » au filtre des « skills » pris en compte pour pix1d.
- [#7105](https://github.com/1024pix/pix/pull/7105) [BUGFIX] Corriger l'affichage de l'historique des profils cibles rattachés sur Pix Admin (PIX-9274).

### :arrow_up: Montée de version
- [#7132](https://github.com/1024pix/pix/pull/7132) [BUMP] Update dependency sinon to v16 (orga).
- [#7128](https://github.com/1024pix/pix/pull/7128) [BUMP] Update dependency sinon to v16 (load-testing).
- [#7131](https://github.com/1024pix/pix/pull/7131) [BUMP] Update dependency sinon to v16 (mon-pix).
- [#7126](https://github.com/1024pix/pix/pull/7126) [BUMP] Update dependency sinon to v16 (api).
- [#7127](https://github.com/1024pix/pix/pull/7127) [BUMP] Update dependency sinon to v16 (certif).
- [#7097](https://github.com/1024pix/pix/pull/7097) [BUMP] Update dependency @1024pix/pix-ui to v40 (admin).
- [#7121](https://github.com/1024pix/pix/pull/7121) [BUMP] Update dependency sinon to v16 (1d).
- [#7122](https://github.com/1024pix/pix/pull/7122) [BUMP] Update dependency sinon to v16 (admin).
- [#7113](https://github.com/1024pix/pix/pull/7113) [BUMP] Update dependency ember-intl to v6 (mon-pix).

### :coffee: Autre
- [#6986](https://github.com/1024pix/pix/pull/6986) [ADR] Compatibilité avec les différents navigateurs web (browser support).

## v4.36.1 (22/09/2023)

### :bug: Correction
- [#7133](https://github.com/1024pix/pix/pull/7133) [BUGFIX] Ne plus activer tous les learners lors d'une nouvelle participation à une campagne (PIX-9353).


## v4.36.0 (20/09/2023)


### :rocket: Amélioration
- [#7111](https://github.com/1024pix/pix/pull/7111) [FEATURE] Ajouter un loading state au bouton d'import et informer pour le SCO (PIX-9276).
- [#7088](https://github.com/1024pix/pix/pull/7088) [FEATURE] Pix1D - Appliquer le nouveau design à la pages des missions (PIX-9212).
- [#7090](https://github.com/1024pix/pix/pull/7090) [FEATURE] Ajouter une bordure autour des simulateurs d'épreuve (PIX-9198).

### :building_construction: Tech
- [#7081](https://github.com/1024pix/pix/pull/7081) [TECH] Affiner les modèles métier Module et Grain (PIX-8969).
- [#7078](https://github.com/1024pix/pix/pull/7078) [TECH] Mise à jour des regles d'envoi de champs CPF. (PIX-9176).
- [#7075](https://github.com/1024pix/pix/pull/7075) [TECH] ajoute les learners dans les seeds de devcomp (Pix-9158).

### :bug: Correction
- [#7100](https://github.com/1024pix/pix/pull/7100) [BUGFIX] Eliminer les doublons de recherches de profils cibles attachables (PIX-9165).
- [#7017](https://github.com/1024pix/pix/pull/7017) [BUGFIX] Corriger la position des modules d'explication sur la page de création de campagne dans Pix Orga (Pix-9116).

### :arrow_up: Montée de version
- [#7109](https://github.com/1024pix/pix/pull/7109) [BUMP] Update dependency ember-intl to v6 (certif).
- [#7107](https://github.com/1024pix/pix/pull/7107) [BUMP] Update dependency ember-intl to v6 (admin).
- [#7112](https://github.com/1024pix/pix/pull/7112) [BUMP] Update dependency ember-qunit to v8 (certif).
- [#7101](https://github.com/1024pix/pix/pull/7101) [BUMP] Update dependency @1024pix/pix-ui to v40 (certif).
- [#7110](https://github.com/1024pix/pix/pull/7110) [BUMP] Update dependency ember-qunit to v8 (orga).
- [#7106](https://github.com/1024pix/pix/pull/7106) [BUMP] Update dependency ember-intl to v6 (1d).
- [#7108](https://github.com/1024pix/pix/pull/7108) [BUMP] Update dependency ember-qunit to v8 (admin).
- [#7096](https://github.com/1024pix/pix/pull/7096) [BUMP] Update dependency @1024pix/pix-ui to v40 (1d).
- [#7102](https://github.com/1024pix/pix/pull/7102) [BUMP] Update dependency @1024pix/pix-ui to v40 (mon-pix).
- [#7104](https://github.com/1024pix/pix/pull/7104) [BUMP] Update dependency ember-qunit to v8 (mon-pix).
- [#7103](https://github.com/1024pix/pix/pull/7103) [BUMP] Update dependency ember-qunit to v8 (1d).
- [#7098](https://github.com/1024pix/pix/pull/7098) [BUMP] Update dependency @fortawesome/ember-fontawesome to v2 (orga).
- [#7095](https://github.com/1024pix/pix/pull/7095) [BUMP] Update dependency @fortawesome/ember-fontawesome to v2 (certif).
- [#7094](https://github.com/1024pix/pix/pull/7094) [BUMP] Update dependency @fortawesome/ember-fontawesome to v2 (admin).
- [#7092](https://github.com/1024pix/pix/pull/7092) [BUMP] Update dependency @fortawesome/ember-fontawesome to v2 (1d).
- [#7091](https://github.com/1024pix/pix/pull/7091) [BUMP] Update dependency @fortawesome/ember-fontawesome to v2 (mon-pix).

## v4.35.0 (18/09/2023)


### :rocket: Amélioration
- [#7087](https://github.com/1024pix/pix/pull/7087) [FEATURE] Ajouter une variable au script de mise à jour des acquisitions de paliers (PIX-9125).
- [#7066](https://github.com/1024pix/pix/pull/7066) [FEATURE] Afficher un message dans le champ de recherche des profils cibles attachables lorsqu'il n'y a aucun résultat - Pix Admin (PIX-8948).
- [#7083](https://github.com/1024pix/pix/pull/7083) [FEATURE] Rediriger vers la liste des certifications complémentaire après le rattachement d'un profil cible sur Pix Admin (PIX-9022).
- [#7077](https://github.com/1024pix/pix/pull/7077) [FEATURE] Ajouter une route de monitoring sur Audit-logger (PIX-9129).

### :building_construction: Tech
- [#7072](https://github.com/1024pix/pix/pull/7072) [TECH] Ajouter un test manquant pour le calcul de la certificabilitée auto (PIX-9169).
- [#7046](https://github.com/1024pix/pix/pull/7046) [TECH] Ajoute deux organisations pour Pix 1D  (PIX-9083).
- [#6983](https://github.com/1024pix/pix/pull/6983) [TECH] Supprimer la colonne "lastLoggedAt" de la table "Users" (PIX-9032).
- [#7080](https://github.com/1024pix/pix/pull/7080) [TECH][AUDIT-LOGGER] Régler le problème de lint (PIX-9197).
- [#7079](https://github.com/1024pix/pix/pull/7079) [TECH] Création d'un script pour valider un fichier XML via XSD pour le CPF. (PIX-9095).
- [#7023](https://github.com/1024pix/pix/pull/7023) [TECH] Mettre à jour @1024pix/ember-testing-library en v0.8.1 (PIX-9132).
- [#7048](https://github.com/1024pix/pix/pull/7048) [TECH] Suppression de high-level-tests/test-algo.
- [#6906](https://github.com/1024pix/pix/pull/6906) [TECH] Suppression du code mort autour des acquis de profil cible et suppression de la table "target-profile_skills" (PIX-8134).
- [#6938](https://github.com/1024pix/pix/pull/6938) [TECH] Mettre à jour la dépendance xlsx de 0.19.1 vers 0.19.3.

### :bug: Correction
- [#7089](https://github.com/1024pix/pix/pull/7089) [BUGFIX] Revoir l'affichage des réponses des QROC (PIX-8637).
- [#7064](https://github.com/1024pix/pix/pull/7064) [BUGFIX] Fixer une largeur pour les badges des RT certifiants (PIX-9151).
- [#7076](https://github.com/1024pix/pix/pull/7076) [BUGFIX] [Orga] Corriger la clé de traduction de la notification d'erreur pour l'action « Renvoyer l'invitation » (PIX-9141).
- [#7042](https://github.com/1024pix/pix/pull/7042) [BUGFIX] Fixer la récupération d'infos d'un profil cible détaché puis rattaché à la même certification complémentaire (PIX-9131).

### :arrow_up: Montée de version
- [#7086](https://github.com/1024pix/pix/pull/7086) [BUMP] Lock file maintenance (api).
- [#7074](https://github.com/1024pix/pix/pull/7074) [BUMP] Update browser-tools orb to v1.4.6 (.circleci).
- [#7070](https://github.com/1024pix/pix/pull/7070) [BUMP] Lock file maintenance (dossier racine).
- [#7069](https://github.com/1024pix/pix/pull/7069) [BUMP] Lock file maintenance (1d).

### :coffee: Autre
- [#7067](https://github.com/1024pix/pix/pull/7067) [DOCS] Consigner la décision de ne pas convertir le monorepo aux workspaces.

## v4.34.0 (12/09/2023)


### :rocket: Amélioration
- [#6969](https://github.com/1024pix/pix/pull/6969) [FEATURE] Envoyer les informations de RT certifiants pour attacher un PC à une complémentaire  (PIX-9001).
- [#7000](https://github.com/1024pix/pix/pull/7000) [FEATURE] Ajout du scoring pour les certifications V3 (PIX-9050).
- [#6950](https://github.com/1024pix/pix/pull/6950) [FEATURE] Jouer des épreuves avec des déclinaisons pas encore rencontrées.(Pix-8941).
- [#7024](https://github.com/1024pix/pix/pull/7024) [FEATURE] Afficher la date de certificabilité même si le prescrit SCO est non certifiable (PIX-9128).
- [#7008](https://github.com/1024pix/pix/pull/7008) [FEATURE] Afficher la nouvelle colonne "rôle" sur le tableau listant les membres d'un centre de certification (PIX-4995).
- [#7022](https://github.com/1024pix/pix/pull/7022) [FEATURE] Migration des données users.lastLoggedAt vers user-logins.lastLoggedAt (PIX-9122).
- [#6981](https://github.com/1024pix/pix/pull/6981) [FEATURE] Création de la route pour rattacher un PC à une certification complémentaire. (PIX-8848).
- [#6970](https://github.com/1024pix/pix/pull/6970) [FEATURE] Utiliser l'information de certificabilité la plus récente (PIX-9018).
- [#7015](https://github.com/1024pix/pix/pull/7015) [FEATURE] Ajoute une option pour calculer la certificabilité de tous les prescrits du SCO (PIX-9062).

### :building_construction: Tech
- [#7054](https://github.com/1024pix/pix/pull/7054) [TECH] Corriger un test flacky sur organization learner repository (PIX-9150).
- [#7053](https://github.com/1024pix/pix/pull/7053) [TECH] Utilise une version publiée de ember-cli-notifications pour réparer la CI.
- [#6835](https://github.com/1024pix/pix/pull/6835) [TECH] Supprime le code de l'auto answer.
- [#6978](https://github.com/1024pix/pix/pull/6978) [TECH] Casser les dépendances de librairie entre racine et application.
- [#6976](https://github.com/1024pix/pix/pull/6976) [TECH] Ne pas attendre les lint et test de root pour exécuter les jobs suivants.
- [#6972](https://github.com/1024pix/pix/pull/6972) [TECH] Afficher l'état d'avancement absolu de la migration des usecases.
- [#6966](https://github.com/1024pix/pix/pull/6966) [TECH] Ajout d'un script pour récupérer les difficultés des challenges depuis redis.

### :bug: Correction
- [#7041](https://github.com/1024pix/pix/pull/7041) [BUGFIX] Réparer le cas nominal de la recherche de profils cibles pour une complémentaire (PIX-9130).
- [#7043](https://github.com/1024pix/pix/pull/7043) [BUGFIX] Gérer les erreurs d'emailing qui ne suivent pas le format d'erreur Brevo.
- [#7020](https://github.com/1024pix/pix/pull/7020) [BUGFIX] Pix Admin - Dans la recherche d'utilisateur permettre à nouveau la saisie de texte dans le champ « Adresse e-mail »  (PIX-9112).

### :arrow_up: Montée de version
- [#7061](https://github.com/1024pix/pix/pull/7061) [BUMP] Update dependency @1024pix/ember-testing-library to ^0.8.0 (mon-pix).
- [#7059](https://github.com/1024pix/pix/pull/7059) [BUMP] Lock file maintenance (mon-pix).
- [#7058](https://github.com/1024pix/pix/pull/7058) [BUMP] Lock file maintenance (audit-logger).
- [#7040](https://github.com/1024pix/pix/pull/7040) [BUMP] Lock file maintenance (orga).
- [#7039](https://github.com/1024pix/pix/pull/7039) [BUMP] Update dependency stylelint-config-standard-scss to v11 (certif).
- [#7037](https://github.com/1024pix/pix/pull/7037) [BUMP] Update dependency stylelint-config-standard-scss to v11 (admin).
- [#7036](https://github.com/1024pix/pix/pull/7036) [BUMP] Update dependency stylelint-config-standard-scss to v11 (1d).
- [#7045](https://github.com/1024pix/pix/pull/7045) [BUMP] Lock file maintenance (admin).
- [#7034](https://github.com/1024pix/pix/pull/7034) [BUMP] Update dependency eslint-config-standard-with-typescript to v39 (audit-logger).
- [#7038](https://github.com/1024pix/pix/pull/7038) [BUMP] Lock file maintenance (admin).
- [#7035](https://github.com/1024pix/pix/pull/7035) [BUMP] Lock file maintenance (certif).
- [#7033](https://github.com/1024pix/pix/pull/7033) [BUMP] Update dependency eslint-config-standard-with-typescript to v38 (audit-logger).
- [#7032](https://github.com/1024pix/pix/pull/7032) [BUMP] Update dependency ember-simple-auth to v6 (orga).
- [#7031](https://github.com/1024pix/pix/pull/7031) [BUMP] Update dependency ember-simple-auth to v6 (mon-pix).
- [#7030](https://github.com/1024pix/pix/pull/7030) [BUMP] Update dependency ember-simple-auth to v6 (certif).
- [#7028](https://github.com/1024pix/pix/pull/7028) [BUMP] Lock file maintenance (api).
- [#7029](https://github.com/1024pix/pix/pull/7029) [BUMP] Update dependency ember-simple-auth to v6 (admin).
- [#7027](https://github.com/1024pix/pix/pull/7027) [BUMP] Update browser-tools orb to v1.4.5 (.circleci).
- [#7026](https://github.com/1024pix/pix/pull/7026) [BUMP] Update dependency ember-cli-babel to v8 (orga).
- [#7025](https://github.com/1024pix/pix/pull/7025) [BUMP] Update dependency ember-cli-babel to v8 (mon-pix).
- [#6993](https://github.com/1024pix/pix/pull/6993) [BUMP] Update dependency stylelint-config-standard-scss to v11 (orga).
- [#6948](https://github.com/1024pix/pix/pull/6948) [BUMP] Update dependency ember-cli-babel to v8 (certif).
- [#6992](https://github.com/1024pix/pix/pull/6992) [BUMP] Update dependency stylelint-config-standard-scss to v11 (mon-pix).

### :coffee: Autre
- [#6931](https://github.com/1024pix/pix/pull/6931) [DOCS] Modification d'une mauvaise référence de ticket JIRA.

## v4.33.0 (08/09/2023)


### :rocket: Amélioration
- [#7011](https://github.com/1024pix/pix/pull/7011) [FEATURE] Ajouter la date de certificabilité même si l'apprenant n'est pas certifiable (PIX-9119).
- [#7009](https://github.com/1024pix/pix/pull/7009) [FEATURE] Augmenter le expirein du job qui schedule le calcul de la certificabilité (PIX-9028).
- [#7007](https://github.com/1024pix/pix/pull/7007) [FEATURE] Ajouter l'INE dans les messages d'erreurs lors d'un import SIECLE (PIX-9094).
- [#6979](https://github.com/1024pix/pix/pull/6979) [FEATURE] Appeler la nouvelle méthode "manageEmails" dans les usecases publishSession et publishSessionInBatch (PIX-8215).
- [#6980](https://github.com/1024pix/pix/pull/6980) [FEATURE] Empêcher l'import d'une liste de candidats à une session si doublon sur Pix Certif (PIX-8109).

### :bug: Correction
- [#7010](https://github.com/1024pix/pix/pull/7010) [BUGFIX] Le niveau des sujets disponible pouvaient être incorrect lorsqu'on créé un nouveau profil cible (PIX-9043).
- [#7013](https://github.com/1024pix/pix/pull/7013) [BUGFIX] Récupérer les paliers acquis dans la page "Mes parcours" (PIX-8912).

## v4.32.0 (06/09/2023)


### :rocket: Amélioration
- [#7006](https://github.com/1024pix/pix/pull/7006) [FEATURE] Mettre à jour le wording de la bannière d'information de l'ouverture du niveau 7 (PIX-9092).
- [#6977](https://github.com/1024pix/pix/pull/6977) [FEATURE] Utiliser uniquement la colonne user-logins.lastLoggedAt pour lire et écrire la date de dernière connexion (PIX-9010).
- [#6989](https://github.com/1024pix/pix/pull/6989) [FEATURE] Diminution de la capacité initiale en certif V3 (PIX-9072).
- [#6998](https://github.com/1024pix/pix/pull/6998) [FEATURE] Ajout d'une colonne "role" sur la table certification-center-memberships (PIX-4994).

### :building_construction: Tech
- [#6975](https://github.com/1024pix/pix/pull/6975) [TECH] Obtenir les sourcemaps dans les fronts ember en developpement (PIX-9045).
- [#6883](https://github.com/1024pix/pix/pull/6883) [TECH] Récupérer les paliers acquis dans la page "Mes parcours" (PIX-8912).
- [#7003](https://github.com/1024pix/pix/pull/7003) [TECH] Retirer les mentions à l'attribut "imageUrl" des tests statiques, l'attribut est déprécié (PIX-9079).
- [#6963](https://github.com/1024pix/pix/pull/6963) [TECH] Mutualiser une partie des seeds (Orga/User) (Pix-9020).
- [#6860](https://github.com/1024pix/pix/pull/6860) [TECH] Nettoyage du code relatif aux skill-sets - code mort (PIX-6697).
- [#6964](https://github.com/1024pix/pix/pull/6964) [TECH] Augmentation du timeout du test courant en cas de truncate sur la BDD.

### :bug: Correction
- [#7001](https://github.com/1024pix/pix/pull/7001) [BUGFIX] Exclure les participations qui ne sont pas liés aux participants par le userId (Pix-9068).

### :arrow_up: Montée de version
- [#7004](https://github.com/1024pix/pix/pull/7004) [BUMP] Update dependency ember-cli to ~5.2.0 (admin).
- [#6945](https://github.com/1024pix/pix/pull/6945) [BUMP] Update dependency ember-cli-babel to v8 (1d).
- [#6946](https://github.com/1024pix/pix/pull/6946) [BUMP] Update dependency ember-cli-babel to v8 (admin).
- [#6974](https://github.com/1024pix/pix/pull/6974) [BUMP] Update dependency ember-cli to ~5.2.0 (1d).
- [#6996](https://github.com/1024pix/pix/pull/6996) [BUMP] Update dependency ember-truth-helpers to v4 (orga).
- [#6995](https://github.com/1024pix/pix/pull/6995) [BUMP] Update dependency ember-truth-helpers to v4 (certif).

## v4.31.0 (05/09/2023)


### :rocket: Amélioration
- [#6997](https://github.com/1024pix/pix/pull/6997) [FEATURE] Changer l'url de la bannière de l'ouverture du niveau 7 (PIX-8651).
- [#6987](https://github.com/1024pix/pix/pull/6987) [FEATURE] Mettre à jour le wording du texte descriptif pour les contenus formatifs (PIX-9037).
- [#6988](https://github.com/1024pix/pix/pull/6988) [FEATURE] Ajoute la colonne propriétaire dans la création de campagne en masse (PIX-9069).

### :bug: Correction
- [#6985](https://github.com/1024pix/pix/pull/6985) [BUGFIX] Corriger l'affichage du menu dans Pix Orga (Pix-9066).

### :arrow_up: Montée de version
- [#6999](https://github.com/1024pix/pix/pull/6999) [BUMP] Update actions/checkout action to v4 (workflows).
- [#6994](https://github.com/1024pix/pix/pull/6994) [BUMP] Update dependency ember-truth-helpers to v4 (admin).
- [#6991](https://github.com/1024pix/pix/pull/6991) [BUMP] Update dependency ember-truth-helpers to v4 (mon-pix).

## v4.30.0 (04/09/2023)


### :rocket: Amélioration
- [#6960](https://github.com/1024pix/pix/pull/6960) [FEATURE] Ordonner la liste des certifications complémentaires dans Pix Admin. (PIX-8943).
- [#6968](https://github.com/1024pix/pix/pull/6968) [FEATURE] Afficher de nouvelles informations sur la liste des contenus formatifs (PIX-8342).
- [#6958](https://github.com/1024pix/pix/pull/6958) [FEATURE] Ajouter un script pour synchroniser les données de users.lastLoggedAt et de user-logins.lastLoggedAt (PIX-9009).
- [#6957](https://github.com/1024pix/pix/pull/6957) [FEATURE] Changer la couleur du bouton de connexion de la FWB (PIX-8661).
- [#6952](https://github.com/1024pix/pix/pull/6952) [FEATURE] Ajouter et alimenter une colonne lastLoggedAt dans la table user-logins (PIX-9008).
- [#6918](https://github.com/1024pix/pix/pull/6918) [FEATURE] Créer les seeds pour des campagnes avec paliers (PIX-8906).

### :building_construction: Tech
- [#6959](https://github.com/1024pix/pix/pull/6959) [TECH] Supprime script certif obsolète (PIX-9016).
- [#6971](https://github.com/1024pix/pix/pull/6971) [TECH] Améliorer les performances de la remontée de la certif auto (PIX-9019).
- [#6965](https://github.com/1024pix/pix/pull/6965) [TECH] Remise à "null" les colonnes liées à la certificabilité d'un organization-learner dissocié (PIX-9017).
- [#6967](https://github.com/1024pix/pix/pull/6967) [TECH] Utiliser du clonage superficiel pour la CI.
- [#6947](https://github.com/1024pix/pix/pull/6947) [TECH] Restructuration de l'arborescence du versioning des profils cibles (PIX-8990).
- [#6962](https://github.com/1024pix/pix/pull/6962) [TECH] Paralléliser les lint et test de l'API.
- [#6955](https://github.com/1024pix/pix/pull/6955) [TECH] Suppression de toutes les occurences à Sendinblue.

### :bug: Correction
- [#6954](https://github.com/1024pix/pix/pull/6954) [BUGFIX] Obliger la saisie de nombre sur le champs 'ID' dans la recherche d'utilisateur (PIX-9005).
- [#6953](https://github.com/1024pix/pix/pull/6953) [BUGFIX] Afficher correctement les déclencheurs des CF sur Pix Admin (PIX-9014).

### :arrow_up: Montée de version
- [#6973](https://github.com/1024pix/pix/pull/6973) [BUMP] Update browser-tools orb to v1.4.4 (.circleci).
- [#6937](https://github.com/1024pix/pix/pull/6937) [BUMP] Update Node.js to ^v16.20.2.

## v4.29.0 (29/08/2023)


### :rocket: Amélioration
- [#6940](https://github.com/1024pix/pix/pull/6940) [FEATURE] Autoriser la création de campagne en masse en envoi multiple (Pix-8609).
- [#6900](https://github.com/1024pix/pix/pull/6900) [FEATURE] Enregistrement des signalements d'une session de certification V3 (PIX-8934).
- [#6844](https://github.com/1024pix/pix/pull/6844) [FEATURE] Ajout d'un signalement pour les certifications V3 (PIX-8797).
- [#6928](https://github.com/1024pix/pix/pull/6928) [FEATURE] Ajouter la notion RAZ dans la page de paramètres de campagne.
- [#6891](https://github.com/1024pix/pix/pull/6891) [FEATURE] Pouvoir jouer les bonnes déclinaisons lors d'une activité Pix1D (PIX-7701).

### :building_construction: Tech
- [#6949](https://github.com/1024pix/pix/pull/6949) [TECH] Remplacement de la librairie obsolète `request` par `axios`.
- [#6926](https://github.com/1024pix/pix/pull/6926) [TECH] Sécuriser le model Campaign Participant afin de ne pas autoriser les learner désactivé (PIX-8918).
- [#6943](https://github.com/1024pix/pix/pull/6943) [TECH] Corriger la taille d'image d'affiché sur la contenu formatif (PIX-9000).
- [#6935](https://github.com/1024pix/pix/pull/6935) [TECH] Utiliser la fonction native de génération d'UUID v4.

### :bug: Correction
- [#6905](https://github.com/1024pix/pix/pull/6905) [BUGFIX] Affichage des pages de détail de certif complémentaire une fois le switch Pix+ Edu utilisé.
- [#6942](https://github.com/1024pix/pix/pull/6942) [BUGFIX] Bien prendre en compte les paliers "1er acquis" lors de l'acquisition de fin de campagne.

## v4.28.0 (25/08/2023)


### :rocket: Amélioration
- [#6919](https://github.com/1024pix/pix/pull/6919) [FEATURE] Connecter Pix API à l'application de journalisation (PIX-4833).
- [#6913](https://github.com/1024pix/pix/pull/6913) [FEATURE] Afficher les méthodes d'authentification même si le fournisseur d'identité correspondant est désactivé (PIX-8951).
- [#6893](https://github.com/1024pix/pix/pull/6893) [FEATURE] Afficher les résultats thématiques à hiérarchiser (PIX-8767).
- [#6930](https://github.com/1024pix/pix/pull/6930) [FEATURE] ETQ user Pix Admin, JV rechercher un utilisateur dans la liste par son id (PIX-389).

### :building_construction: Tech
- [#6936](https://github.com/1024pix/pix/pull/6936) [TECH] Mise à jour de l'index de l'ADR 0049-nouvelle-arborescence-api.
- [#6925](https://github.com/1024pix/pix/pull/6925) [TECH] Ajouter le modèle Grain (PIX-8968).
- [#6929](https://github.com/1024pix/pix/pull/6929) [TECH] Ajouter un Profile Cible avec Badges / Paliers pour une campagne dans les seeds (Pix-8963).
- [#6519](https://github.com/1024pix/pix/pull/6519) [TECH] Faciliter le déploiement sur Scalingo.

### :bug: Correction
- [#6934](https://github.com/1024pix/pix/pull/6934) [BUGFIX] Corrige la difficulté des questions qui ne change pas lors d'une certif v3 (PIX-8984).
- [#6897](https://github.com/1024pix/pix/pull/6897) [BUGFIX] Le switcher des profils cibles change d'ordre (PIX-8944).

### :arrow_up: Montée de version
- [#6932](https://github.com/1024pix/pix/pull/6932) [BUMP] Mise à jour de json2csv (api).

### :coffee: Autre
- [#6670](https://github.com/1024pix/pix/pull/6670) [DOC] :memo: Création d'un ADR pour la nouvelle arborescence API.

## v4.27.0 (23/08/2023)


### :rocket: Amélioration
- [#6898](https://github.com/1024pix/pix/pull/6898) [FEATURE] Ajouter un script pour migrer en BDD les acquisitions de palier (PIX-8899).
- [#6912](https://github.com/1024pix/pix/pull/6912) [FEATURE] Ajoute plus d'information sur la remise à zéro du parcours lors de sa creation (PIX-8771).
- [#6911](https://github.com/1024pix/pix/pull/6911) [FEATURE] Seeds pour prescription (PIX-8548).

### :building_construction: Tech
- [#6839](https://github.com/1024pix/pix/pull/6839) [TECH] Mise en place de la nouvelle arborescence API sur la création de session (PIX-8733).
- [#6916](https://github.com/1024pix/pix/pull/6916) [TECH] Remplacer le SDK Sendinblue par le SDK Brevo.

### :bug: Correction
- [#6927](https://github.com/1024pix/pix/pull/6927) [BUGFIX] Problème d'accès à la preview d'épreuves (PIX-8974).

### :arrow_up: Montée de version
- [#6924](https://github.com/1024pix/pix/pull/6924) [BUMP] Update dependency ember-page-title to v8 (1d).
- [#6923](https://github.com/1024pix/pix/pull/6923) [BUMP] Update dependency ember-page-title to v8 (admin).
- [#6921](https://github.com/1024pix/pix/pull/6921) [BUMP] Update dependency ember-page-title to v8 (certif).
- [#6922](https://github.com/1024pix/pix/pull/6922) [BUMP] Update dependency ember-page-title to v8 (orga).
- [#6920](https://github.com/1024pix/pix/pull/6920) [BUMP] Update dependency ember-page-title to v8 (mon-pix).
- [#6885](https://github.com/1024pix/pix/pull/6885) [BUMP] Update node.

### :coffee: Autre
- [#6848](https://github.com/1024pix/pix/pull/6848) [DOCS] Ajoute l'ADR sur le choix technique de positionnement de Modulix.

## v4.26.0 (22/08/2023)


### :rocket: Amélioration
- [#6869](https://github.com/1024pix/pix/pull/6869) [FEATURE] Insérer en base les acquisitions de paliers (PIX-8604).

### :building_construction: Tech
- [#6914](https://github.com/1024pix/pix/pull/6914) [TECH] Ne plus jeter une erreur quand la connexion à Redis est déjà fermée.

### :bug: Correction
- [#6915](https://github.com/1024pix/pix/pull/6915) [BUGFIX] Réduit la taille des variables d'environnement et ignore les prescrits désactivés pour le batch (PIX-8955).

## v4.25.0 (21/08/2023)


### :rocket: Amélioration
- [#6896](https://github.com/1024pix/pix/pull/6896) [FEATURE] Affiche les Contenu Formatifs une fois les résultats envoyés (PIX-8730) .
- [#6856](https://github.com/1024pix/pix/pull/6856) [FEATURE] Prendre en compte le statut du test statique afin de le rendre jouable si actif, ou bien de bloquer son accès si il est inactif (PIX-8683).

### :building_construction: Tech
- [#6902](https://github.com/1024pix/pix/pull/6902) [TECH] Supprimer des méthodes de repositories non utilisées.

### :bug: Correction
- [#6903](https://github.com/1024pix/pix/pull/6903) [BUGFIX] Ajoute de la pagination sur le job de calcul automatique de la certificabilité pour le SCO (PIX-8950).
- [#6899](https://github.com/1024pix/pix/pull/6899) [BUGFIX] La prévisualisation d'épreuve cause le crash du conteneur par épuisement mémoire (Pix-8884).
- [#6850](https://github.com/1024pix/pix/pull/6850) [BUGFIX] afficher seulement les RT acquis et valides dans le bloc skill-review-share (PIX-8682).

### :arrow_up: Montée de version
- [#6910](https://github.com/1024pix/pix/pull/6910) [BUMP] Mise à jour de ember-keyboard .
- [#6908](https://github.com/1024pix/pix/pull/6908) [BUMP] Update dependency lint-staged to v14 (dossier racine).

### :coffee: Autre
- [#6881](https://github.com/1024pix/pix/pull/6881) [FEAT] Validation du nouveau PC à rattacher et son éventuel changement (PIX-8858).

## v4.24.0 (17/08/2023)


### :rocket: Amélioration
- [#6887](https://github.com/1024pix/pix/pull/6887) [FEATURE] Ajouter un script pour reprendre les profils cibles qui n'ont pas d'images (PIX-8904).
- [#6888](https://github.com/1024pix/pix/pull/6888) [FEATURE] Ajoute le batch de nuit qui calcule la certificabilité des prescrits SCO automatiquement (PIX-8896).
- [#6864](https://github.com/1024pix/pix/pull/6864) [FEATURE] Lire l'erreur de soumission d'épreuve à son apparition (PIX-8890).
- [#6865](https://github.com/1024pix/pix/pull/6865) [FEATURE] Activation de la remontée des certifs auto à la création en masse d'organisations (PIX-8794).
- [#6845](https://github.com/1024pix/pix/pull/6845) [FEATURE] Ne pas permettre le reset avant 4j (PIX-8829).
- [#6834](https://github.com/1024pix/pix/pull/6834) [FEATURE] Panneau de signalement pour certifications V3 (PIX-8796).
- [#6843](https://github.com/1024pix/pix/pull/6843) [FEATURE] Mise à jour du texte du bandeau d'import pour la rentrée scolaire (PIX-8878).

### :building_construction: Tech
- [#6890](https://github.com/1024pix/pix/pull/6890) [TECH] Simplifier les campagnes des seeds de l'équipe DevComp (PIX-8938).
- [#6889](https://github.com/1024pix/pix/pull/6889) [TECH] Corriger la taille de le bouton `repasser mon parcours`.
- [#6867](https://github.com/1024pix/pix/pull/6867) [TECH] Supprimer des méthodes de repositories non utilisées.
- [#6866](https://github.com/1024pix/pix/pull/6866) [TECH] Supprimer des serializers non utilisés.

### :bug: Correction
- [#6886](https://github.com/1024pix/pix/pull/6886) [BUGFIX] Pouvoir supprimer une méthode de connexion FWB d'un utilisateur depuis Pix Admin (PIX-8924).
- [#6863](https://github.com/1024pix/pix/pull/6863) [BUGFIX] Ignorer les espaces dans les adresses emails saisies pour l'envoi d'invitation(s) depuis Pix Orga (PIX-7726).

### :arrow_up: Montée de version
- [#6884](https://github.com/1024pix/pix/pull/6884) [BUMP] Lock file maintenance (api).
- [#6882](https://github.com/1024pix/pix/pull/6882) [BUMP] Update nginx Docker tag to v1.25.2.

## v4.23.0 (14/08/2023)


### :rocket: Amélioration
- [#6852](https://github.com/1024pix/pix/pull/6852) [FEATURE] Cacher l'ajout d'un commentaire sur les signalements sur Pix-App (PIX-8860).
- [#6804](https://github.com/1024pix/pix/pull/6804) [FEATURE] Activer ou désactiver la fonctionnalité de remontée de la certificabilité à l'édition de l'organisation (PIX-8795).
- [#6862](https://github.com/1024pix/pix/pull/6862) [FEATURE] Ajouter des logs à l'API de l'application de journalisation (PIX-8853).
- [#6858](https://github.com/1024pix/pix/pull/6858) [FEATURE] Active la remontée de la certificabilité automatique aux organizations SCO qui gère des élèves (PIX-8790).
- [#6853](https://github.com/1024pix/pix/pull/6853) [FEATURE]  Barre de recherche pour rattacher des profils cibles à une complémentaire (PIX-8856).
- [#6816](https://github.com/1024pix/pix/pull/6816) [FEATURE] Mise en place de la V0 de l'oralisation des instructions (PIX-8801).
- [#6854](https://github.com/1024pix/pix/pull/6854) [FEATURE] Amélioration du texte de traduction en anglais (PIX-8876).
- [#6828](https://github.com/1024pix/pix/pull/6828) [FEATURE] Ajouter une tâche asynchrone pour calculer la certificabilité pour un prescrit (PIX-8791).
- [#6849](https://github.com/1024pix/pix/pull/6849) [FEATURE] Sécuriser l'accès à l'API de journalisation (PIX-8836).
- [#6818](https://github.com/1024pix/pix/pull/6818) [FEATURE] Rechercher des target profiles attachables à une certification complémentaire (PIX-8742).
- [#6841](https://github.com/1024pix/pix/pull/6841) [FEATURE] Ajouter l'application de Journalisation dans le monorepo (PIX-8885).

### :building_construction: Tech
- [#6861](https://github.com/1024pix/pix/pull/6861) [TECH] Remets les features dans les seeds (PIX-8915).
- [#6857](https://github.com/1024pix/pix/pull/6857) [TECH] Utiliser les repositories grâce au fichier index.
- [#6855](https://github.com/1024pix/pix/pull/6855) [TECH] Gestion d'une page d'erreur pour 1d (PIX-8805).
- [#6823](https://github.com/1024pix/pix/pull/6823) [TECH] Centralise la logique de mise à jour des organisations depuis PixAdmin (PIX-8837).

### :bug: Correction
- [#6840](https://github.com/1024pix/pix/pull/6840) [BUGFIX] Changement d'avis lors de l'inscription individuelle d'un candidat concernant certif complémentaire (PIX-8880).
- [#6851](https://github.com/1024pix/pix/pull/6851) [BUGFIX] Modifier le texte de la modale de signalement d'épreuve (PIX-8859).

### :arrow_up: Montée de version
- [#6879](https://github.com/1024pix/pix/pull/6879) [BUMP] Lock file maintenance (admin).
- [#6878](https://github.com/1024pix/pix/pull/6878) [BUMP] Lock file maintenance (orga).
- [#6877](https://github.com/1024pix/pix/pull/6877) [BUMP] Lock file maintenance (certif).
- [#6876](https://github.com/1024pix/pix/pull/6876) [BUMP] Lock file maintenance (mon-pix).
- [#6875](https://github.com/1024pix/pix/pull/6875) [BUMP] Update dependency eslint-config-prettier to v9 (orga).
- [#6874](https://github.com/1024pix/pix/pull/6874) [BUMP] Update dependency eslint-config-prettier to v9 (mon-pix).
- [#6873](https://github.com/1024pix/pix/pull/6873) [BUMP] Update dependency eslint-config-prettier to v9 (certif).
- [#6872](https://github.com/1024pix/pix/pull/6872) [BUMP] Update dependency eslint-config-prettier to v9 (api).
- [#6871](https://github.com/1024pix/pix/pull/6871) [BUMP] Update dependency eslint-config-prettier to v9 (admin).
- [#6870](https://github.com/1024pix/pix/pull/6870) [BUMP] Update dependency eslint-config-prettier to v9 (1d).

### :coffee: Autre
- [#6842](https://github.com/1024pix/pix/pull/6842) [CHORE] Mettre a jour les relationship ember (PIX-8804).

## v4.22.0 (08/08/2023)


### :rocket: Amélioration
- [#6820](https://github.com/1024pix/pix/pull/6820) [FEATURE]  Ajouter le bouton pour permettre la remise à zéro des compétences d'une campagne (PIX-8823).
- [#6824](https://github.com/1024pix/pix/pull/6824) [FEATURE] Améliorer l'accessibilité des formulaires sur Pix-App (PIX-8077).
- [#6831](https://github.com/1024pix/pix/pull/6831) [FEATURE] Création d'une migration pour mettre à jour view-active-organization-learner.
- [#6825](https://github.com/1024pix/pix/pull/6825) [FEATURE] Publication en masse des sessions V3 (PIX-8313).
- [#6812](https://github.com/1024pix/pix/pull/6812) [FEATURE] Pouvoir choisir de rechercher sur les orgas archivés ou non dans Pix Admin (PIX-6109).
- [#6822](https://github.com/1024pix/pix/pull/6822) [FEATURE] Afficher un toggle pour accéder aux deux profiles cibles d'une certification complémentaire (PIX-8811).
- [#6742](https://github.com/1024pix/pix/pull/6742) [FEATURE][ORGA] Permettre à un admin d'une organisation de quitter une organisation (PIX-8380).
- [#6821](https://github.com/1024pix/pix/pull/6821) [FEATURE] ETQ utilisateur Pix Orga, JV pouvoir filtrer sur les élèves n'ayant PAS de connexion MEDIACENTRE (PIX-8432).
- [#6787](https://github.com/1024pix/pix/pull/6787) [FEATURE] Afficher la page de rattachement pour un nouveau profil cible à une certification complémentaire (PIX-8739).
- [#6815](https://github.com/1024pix/pix/pull/6815) [FEATURE] Remettre à zéro la participation à une campagne - API (PIX-8669).
- [#6809](https://github.com/1024pix/pix/pull/6809) [FEATURE] Filtrer liste des sessions de certification par version (PIX-8340).
- [#6577](https://github.com/1024pix/pix/pull/6577) [FEATURE] Voir la liste des sessions de certif V3 à traiter (PIX-8335).

### :building_construction: Tech
- [#6251](https://github.com/1024pix/pix/pull/6251) [TECH] Remplacer le modèle bookshelf Feedback par l'utilisation de knex (PIX-8818).
- [#6817](https://github.com/1024pix/pix/pull/6817) [TECH] Implémentation de l'ADR sur les versions de Node.js (#6513).

### :bug: Correction
- [#6838](https://github.com/1024pix/pix/pull/6838) [BUGFIX] Les tests statiques créés via PixEditor ne se lancent pas sur PixApp (PIX-8866).

### :arrow_up: Montée de version
- [#6832](https://github.com/1024pix/pix/pull/6832) [BUMP] Update dependency @1024pix/pix-ui to v39 (mon-pix).
- [#6830](https://github.com/1024pix/pix/pull/6830) [BUMP] Update dependency @1024pix/pix-ui to v39 (certif).
- [#6829](https://github.com/1024pix/pix/pull/6829) [BUMP] Update dependency @1024pix/pix-ui to v39 (1d).
- [#6827](https://github.com/1024pix/pix/pull/6827) [BUMP] Update redis Docker tag to v7.
- [#6826](https://github.com/1024pix/pix/pull/6826) [BUMP] Lock file maintenance (api).

### :coffee: Autre
- [#6513](https://github.com/1024pix/pix/pull/6513) [DOCS] S'assurer d'une version minimale de Node.js.

## v4.21.0 (03/08/2023)


### :rocket: Amélioration
- [#6811](https://github.com/1024pix/pix/pull/6811) [FEATURE] Ajout d'une modale de confirmation de soumission de signalement d'épreuve (PIX-8649).
- [#6774](https://github.com/1024pix/pix/pull/6774) [FEATURE] Détacher les anciens badges certifiables (PIX-8734).
- [#6799](https://github.com/1024pix/pix/pull/6799) [FEATURE] Le champ de description d'un signalement des épreuves n'est plus requis (PIX-7976).

### :building_construction: Tech
- [#6776](https://github.com/1024pix/pix/pull/6776) [TECH] Ajouter des seeds Pix Orga (PIX-8768).
- [#6810](https://github.com/1024pix/pix/pull/6810) [TECH] Corriger les alertes de lint dans le dossier api/ (PIX-8822).
- [#6814](https://github.com/1024pix/pix/pull/6814) [TECH] Remplacer le modèle bookshelf `competenceEvaluation` par l'utilisation de knex.
- [#6813](https://github.com/1024pix/pix/pull/6813) [TECH] Ne plus étendre la config ESLint de la racine du monorepo.
- [#6808](https://github.com/1024pix/pix/pull/6808) [TECH] Suppression des anciennes seeds (PIX-8105).
- [#6807](https://github.com/1024pix/pix/pull/6807) [TECH] PixAdmin : montée de version de pix-ui en 39.0.3 (PIX-8787).
- [#6718](https://github.com/1024pix/pix/pull/6718) [TECH] Prévenir le commit de secrets (PIX-8665).

### :bug: Correction
- [#6819](https://github.com/1024pix/pix/pull/6819) [BUGFIX] Rendre accessible les habilitations d'un centre de certif aux rôles CERTIF (PIX-8830).

### :arrow_up: Montée de version
- [#6806](https://github.com/1024pix/pix/pull/6806) [BUMP] Update dependency ember-resolver to v11 (orga).
- [#6802](https://github.com/1024pix/pix/pull/6802) [BUMP] Update dependency ember-resolver to v11 (admin).
- [#6803](https://github.com/1024pix/pix/pull/6803) [BUMP] Update dependency ember-resolver to v11 (certif).
- [#6805](https://github.com/1024pix/pix/pull/6805) [BUMP] Update dependency ember-resolver to v11 (mon-pix).
- [#6801](https://github.com/1024pix/pix/pull/6801) [BUMP] Update dependency ember-resolver to v11 (1d).

### :coffee: Autre
- [#6798](https://github.com/1024pix/pix/pull/6798) [CLEANUP] Suppression de messages de dépréciations sur les méthodes de routes.
- [#6797](https://github.com/1024pix/pix/pull/6797) [CLEANUP] Corrige des messages de dépréciations sur les fronts sur miragejs.

## v4.20.0 (01/08/2023)


### :rocket: Amélioration
- [#6671](https://github.com/1024pix/pix/pull/6671) [FEATURE] Empêcher la modification de paliers si un profil cible est relié à une campagne (PIX-8644).
- [#6717](https://github.com/1024pix/pix/pull/6717) [FEATURE] Mettre à jour le prénom et le nom reçus du GAR quand le samlID change pour un même user (PIX-4771).

### :building_construction: Tech
- [#6788](https://github.com/1024pix/pix/pull/6788) [TECH] Ajoute la nouvelle feature de remontée de certificabilité auto dans la table features (PIX-8788).
- [#6775](https://github.com/1024pix/pix/pull/6775) [TECH] Inclure les badges dans le profil cible associé pour le versioning (PIX-8772).
- [#6782](https://github.com/1024pix/pix/pull/6782) [TECH] Revue de la fonction shuffle pour 1d (pix-8784).
- [#6785](https://github.com/1024pix/pix/pull/6785) [TECH] Change le repository utilisé pour eslint-plugin-knex.

### :bug: Correction
- [#6795](https://github.com/1024pix/pix/pull/6795) [BUGFIX] Refacto la méthode shuffle pour corriger les tests flaky(PIX-8808).
- [#6764](https://github.com/1024pix/pix/pull/6764) [BUGFIX] Aligner le comportement de la sidebar par rapport au Breadcrumb de la page participant d'une campagne (PIX-8762).

### :arrow_up: Montée de version
- [#6790](https://github.com/1024pix/pix/pull/6790) [BUMP] Mise à jour de Pix UI sur Pix Orga et Pix admin.
- [#6793](https://github.com/1024pix/pix/pull/6793) [BUMP] Lock file maintenance (admin).
- [#6792](https://github.com/1024pix/pix/pull/6792) [BUMP] Lock file maintenance (1d).
- [#6783](https://github.com/1024pix/pix/pull/6783) [BUMP] Update postgres Docker tag to v14.8.

### :coffee: Autre
- [#6794](https://github.com/1024pix/pix/pull/6794) [FEAUTURE] Enlever le bouton 'Je passe' quand l'utilisateur est au niveau didacticiel (Pix-8774).
- [#6784](https://github.com/1024pix/pix/pull/6784) [DOCS] Précise où trouver la version de Node.js.

## v4.19.0 (28/07/2023)


### :rocket: Amélioration
- [#6730](https://github.com/1024pix/pix/pull/6730) [FEATURE] Créer les colonnes detachedAt et createdBy pour la table complementary-certification-badges (PIX-8745).
- [#6675](https://github.com/1024pix/pix/pull/6675) [FEATURE](admin) Empêcher l'ajout, la suppression et la modification de seuil ou niveau d'un palier lorsqu'une campagne est associé au profil cible. (PIX-8646).

### :building_construction: Tech
- [#6781](https://github.com/1024pix/pix/pull/6781) [TECH] Trier les data pour la génération du timeSeries chart des tech-days api arboresence.
- [#6779](https://github.com/1024pix/pix/pull/6779) [TECH] Uniformisation de l'ordonnancement des propriétés CSS.
- [#6777](https://github.com/1024pix/pix/pull/6777) [TECH] Ajout de tests pour le challenge de type embed (PIX-8777).
- [#6780](https://github.com/1024pix/pix/pull/6780) [TECH] Ajouter un test sur le bouton retour (PIX-8776).
- [#6727](https://github.com/1024pix/pix/pull/6727) [TECH] Refactoring des seeds certif (PIX-8547).
- [#6737](https://github.com/1024pix/pix/pull/6737) [TECH] Support d'une date dans le script de vérification d'eligibilité aux certifications (PIX-8746).
- [#6771](https://github.com/1024pix/pix/pull/6771) [TECH] Amélioration de l'affichage de la preview (PIX-8763).

### :bug: Correction
- [#6773](https://github.com/1024pix/pix/pull/6773) [BUGFIX] Corriger l'affichage du lien sur la page de récupération d'accès à Pix Orga (PIX-8782).
- [#6772](https://github.com/1024pix/pix/pull/6772) [BUGFIX] Réparer la selection des niveaux sur les paliers par niveaux.
- [#6768](https://github.com/1024pix/pix/pull/6768) [BUGFIX] Créer les acquis de la campagne au moment de la création en masse (PIX-8735).

### :arrow_up: Montée de version
- [#6769](https://github.com/1024pix/pix/pull/6769) [BUMP] Update redis Docker tag to v6.

## v4.18.0 (27/07/2023)


### :rocket: Amélioration
- [#6692](https://github.com/1024pix/pix/pull/6692) [FEATURE] Afficher l'historique des badges liés à une certification complémentaire sur Pix Admin (PIX-8731).
- [#6708](https://github.com/1024pix/pix/pull/6708) [FEATURE] Ajouter le filtre sur la certificabilité dans la page de résultat d'une collecte de profil dans Pix Orga (PIX-2431).
- [#6710](https://github.com/1024pix/pix/pull/6710) [FEATURE] Modifier le texte légal sur la page de récupération d'accès à Pix Orga (PIX-8559).
- [#6566](https://github.com/1024pix/pix/pull/6566) [FEATURE] EPIX Réinitialisation en masse des mots de passe temporaires des élèves sur Pix Orga (PIX-8678).
- [#6680](https://github.com/1024pix/pix/pull/6680) [FEATURE] Afficher les badges certifiants de la certification complementaire dans Pix Admin (PIX-8679).

### :building_construction: Tech
- [#6694](https://github.com/1024pix/pix/pull/6694) [TECH] Ajout de paramètres pour l'email de résultats de certification (PIX-8611).
- [#6721](https://github.com/1024pix/pix/pull/6721) [TECH] Builder pix-admin avec Embroider.
- [#6702](https://github.com/1024pix/pix/pull/6702) [TECH] Ajouter un test d'acceptance pour fiabiliser la route /api/admin/target-profiles/{id} (PIX-8748).
- [#6752](https://github.com/1024pix/pix/pull/6752) [TECH] Corrige le test du csv parser pour ne plus avoir de warning dans la console (PIX-8761).
- [#6712](https://github.com/1024pix/pix/pull/6712) [TECH] Ajouter un script pour mettre à jour le département d'une liste d'organisations (PIX-6970).
- [#6728](https://github.com/1024pix/pix/pull/6728) [TECH] Ajouter un script pour mettre à jour l'attribut "identityProviderForCampaigns" d'une liste d'organisations (PIX-8433).
- [#6695](https://github.com/1024pix/pix/pull/6695) [TECH] Remplacer le package redis par ioredis.
- [#6747](https://github.com/1024pix/pix/pull/6747) [TECH] Simplifier `cpfCertificationResultRepository.markCertificationToExport`.
- [#6732](https://github.com/1024pix/pix/pull/6732) [TECH] Améliore les cas de test d'acceptance autour de l'affichage des modales (PIX-8756).
- [#6731](https://github.com/1024pix/pix/pull/6731) [TECH] Rollback de Artillery en v1 (stable).
- [#6720](https://github.com/1024pix/pix/pull/6720) [TECH] :sparkles: Détecter les  version de node dans les executors CircleCI.
- [#6709](https://github.com/1024pix/pix/pull/6709) [TECH] Définir les environnements CircleCI en tant qu'executors.
- [#6714](https://github.com/1024pix/pix/pull/6714) [TECH] Ajouter des seeds pour une activité (Pix-8752).
- [#6711](https://github.com/1024pix/pix/pull/6711) [TECH] Organiser les attributs css (PIX-8749).

### :bug: Correction
- [#6715](https://github.com/1024pix/pix/pull/6715) [BUGFIX] Réparer le design de la page de récupération d'accès à Pix Orga (PIX-8315).
- [#6729](https://github.com/1024pix/pix/pull/6729) [BUGFIX] Dans Pix Orga réparer le design cassé de l'affichage de la connexion Médiacentre dans la pop-up du compte de l'élève (PIX-8632).
- [#6725](https://github.com/1024pix/pix/pull/6725) [BUGFIX] Corriger la non-concordance des paramètres d'une traduction d'éligibilité sur Pix App (PIX-8755).
- [#6719](https://github.com/1024pix/pix/pull/6719) [BUGFIX] Corriger la largeur du bouton "Je me connecte" de Pix Certif (PIX-8754).
- [#6713](https://github.com/1024pix/pix/pull/6713) [BUGFIX] Corrige la largeur du bouton "Je me connecte" de Pix Orga(PIX-8750).
- [#6693](https://github.com/1024pix/pix/pull/6693) [BUGFIX] Vérifier si l'épreuve est en autoReply (Pix-8737).

### :arrow_up: Montée de version
- [#6760](https://github.com/1024pix/pix/pull/6760) [BUMP] Update dependency sinon to v15 (test-algo).
- [#6754](https://github.com/1024pix/pix/pull/6754) [BUMP] Update dependency mocha to v10 (test-algo).
- [#6738](https://github.com/1024pix/pix/pull/6738) [BUMP] Lock file maintenance (api).
- [#6665](https://github.com/1024pix/pix/pull/6665) [BUMP] Update dependency ember-cli to v5 (admin).
- [#6686](https://github.com/1024pix/pix/pull/6686) [BUMP] Update dependency ember-cli to v5 (mon-pix).
- [#6700](https://github.com/1024pix/pix/pull/6700) [BUMP] Update dependency ember-cli to v5 (orga).
- [#6667](https://github.com/1024pix/pix/pull/6667) [BUMP] Update dependency ember-cli to v5 (certif).
- [#6664](https://github.com/1024pix/pix/pull/6664) [BUMP] Update dependency ember-cli to v5 (1d).
- [#6698](https://github.com/1024pix/pix/pull/6698) [BUMP] Monte la version minimale de Node.js en v16.17.
- [#6707](https://github.com/1024pix/pix/pull/6707) [BUMP] Lock file maintenance (1d).
- [#6706](https://github.com/1024pix/pix/pull/6706) [BUMP] Lock file maintenance (orga).
- [#6705](https://github.com/1024pix/pix/pull/6705) [BUMP] Lock file maintenance (mon-pix).
- [#6704](https://github.com/1024pix/pix/pull/6704) [BUMP] Lock file maintenance (certif).
- [#6703](https://github.com/1024pix/pix/pull/6703) [BUMP] Update dependency @1024pix/pix-ui to v38.2.0 (admin).
- [#6701](https://github.com/1024pix/pix/pull/6701) [BUMP] Update dependency @1024pix/pix-ui to v38 (certif).
- [#6690](https://github.com/1024pix/pix/pull/6690) [BUMP] Update dependency ember-source to ~4.12.0 (mon-pix).

### :coffee: Autre
- [#6697](https://github.com/1024pix/pix/pull/6697) [CHORE] Améliorer le CSS (PIX-8736).
- [#6699](https://github.com/1024pix/pix/pull/6699) [CLEANUP] Supprime des packages inutilisées.

## v4.17.0 (24/07/2023)


### :rocket: Amélioration
- [#6681](https://github.com/1024pix/pix/pull/6681) [FEATURE] Éviter la présence d'éléments block dans des labels d'épreuve.
- [#6580](https://github.com/1024pix/pix/pull/6580) [FEATURE] Créer la bannière d'information pour l'ouverture du niveau 7 (Pix-8395).
- [#6691](https://github.com/1024pix/pix/pull/6691) [FEATURE] Corrige le campaign tooling et ajoute des seeds pour prescription (PIX-8729).
- [#6678](https://github.com/1024pix/pix/pull/6678) [FEATURE] Ajouter la modalité QCU (Pix-8608).
- [#6677](https://github.com/1024pix/pix/pull/6677) [FEATURE] Ajouter la modalité QCM (Pix-8607).
- [#6669](https://github.com/1024pix/pix/pull/6669) [FEATURE] Ajouter la modalité QROCM dans pix1d (Pix-8606).
- [#6623](https://github.com/1024pix/pix/pull/6623) [FEATURE] Supprimer le feature toggle FT_DIFFERENTIATED_TIME_INVIGILATOR_PORTAL (PIX-7837).
- [#6674](https://github.com/1024pix/pix/pull/6674) [FEATURE] Afficher les informations de la certification complémentaire sur la page de détails sur Pix Admin (PIX-8673).
- [#6653](https://github.com/1024pix/pix/pull/6653) [FEATURE] Création de la page détails d'une certification complémentaire sur Pix Admin (PIX-8577).

### :building_construction: Tech
- [#6536](https://github.com/1024pix/pix/pull/6536) [TECH] Mise à jour des tests basés sur le niveau max (PIX-8269).
- [#6683](https://github.com/1024pix/pix/pull/6683) [TECH] Supprime la dépendance ember-export-application-global.
- [#6672](https://github.com/1024pix/pix/pull/6672) [TECH] Tech days api arborescence monitoring setup.

### :coffee: Autre
- [#6465](https://github.com/1024pix/pix/pull/6465) explore script to analyse panel data.
- [#6688](https://github.com/1024pix/pix/pull/6688) [CLEANUP] Supprime de l'ancienne config sur certif.
- [#6689](https://github.com/1024pix/pix/pull/6689) [BUMP] Update dependency @1024pix/pix-ui to v38 (1d).
- [#6687](https://github.com/1024pix/pix/pull/6687) [BUMP] Update dependency @1024pix/pix-ui to v37 (1d).
- [#6598](https://github.com/1024pix/pix/pull/6598) [BUMP] Update dependency ember-source to ~4.12.0 (certif).
- [#6685](https://github.com/1024pix/pix/pull/6685) [BUMP] Lock file maintenance (1d).
- [#6684](https://github.com/1024pix/pix/pull/6684) [BUMP] Update browser-tools orb to v1.4.3 (.circleci).

## v4.16.0 (20/07/2023)


### :rocket: Amélioration
- [#6658](https://github.com/1024pix/pix/pull/6658) [FEATURE] Ajout de la nouvelle arborescence API.
- [#6613](https://github.com/1024pix/pix/pull/6613) [FEATURE] Corriger le script de mise à jour des url de PixOrga (PIX-8414) .
- [#6666](https://github.com/1024pix/pix/pull/6666) [FEATURE] Configurer la remise à zéro d'un profil cible (PIX-8444).

### :building_construction: Tech
- [#6558](https://github.com/1024pix/pix/pull/6558) [TECH] Mise à jour de Pix-UI sur Orga (Pix-8674).

### :coffee: Autre
- [#6668](https://github.com/1024pix/pix/pull/6668) [BUMP] Lock file maintenance (e2e).
- [#6647](https://github.com/1024pix/pix/pull/6647) [BUMP] Update dependency cypress to v12 (e2e).

## v4.15.0 (19/07/2023)


### :rocket: Amélioration
- [#6420](https://github.com/1024pix/pix/pull/6420) [FEATURE] Ajouter la modalité QROC dans Pix 1d (PIX-8226).
- [#6627](https://github.com/1024pix/pix/pull/6627) [FEATURE] renvoyer l'information de la jointure entre un profile cible et une campagne dans l'API admin (PIX-8645).
- [#6581](https://github.com/1024pix/pix/pull/6581) [FEATURE] Configurer les probabilités de choix d'épreuve dans les simulateurs.
- [#6621](https://github.com/1024pix/pix/pull/6621) [FEATURE] Dupliquer une campagne d'un simple clic (PIX-8635).
- [#6586](https://github.com/1024pix/pix/pull/6586) [FEATURE] Ajoute la création d'une campagne à partir d'une campagne existante (PIX-8622).

### :bug: Correction
- [#6663](https://github.com/1024pix/pix/pull/6663) [BUGFIX] Corriger le bug de sélection de la catégorie (PIX-8680).
- [#6652](https://github.com/1024pix/pix/pull/6652) [BUGFIX] Corriger la création de campagne en masse via l'import de fichier CSV (PIX-8659).

### :coffee: Autre
- [#6649](https://github.com/1024pix/pix/pull/6649) [BUMP] Update dependency @1024pix/pix-ui to v38 (mon-pix).
- [#6651](https://github.com/1024pix/pix/pull/6651) [BUMP] Lock file maintenance (e2e).
- [#6602](https://github.com/1024pix/pix/pull/6602) [BUMP] Lock file maintenance (orga).
- [#6643](https://github.com/1024pix/pix/pull/6643) [BUMP] Update dependency cypress-visual-regression to v3 (e2e).
- [#6648](https://github.com/1024pix/pix/pull/6648) [BUMP] Update browser-tools orb to v1.4.2 (.circleci).
- [#6642](https://github.com/1024pix/pix/pull/6642) [BUMP] Update dependency @badeball/cypress-cucumber-preprocessor to v18 (e2e).
- [#6641](https://github.com/1024pix/pix/pull/6641) [BUMP] Update dependency @badeball/cypress-cucumber-preprocessor to v17 (e2e).
- [#6640](https://github.com/1024pix/pix/pull/6640) [BUMP] Update dependency @badeball/cypress-cucumber-preprocessor to v16 (e2e).
- [#6639](https://github.com/1024pix/pix/pull/6639) [BUMP] Update dependency @badeball/cypress-cucumber-preprocessor to v15 (e2e).
- [#6634](https://github.com/1024pix/pix/pull/6634) [BUMP] Update dependency cypress to v11 (e2e).
- [#6638](https://github.com/1024pix/pix/pull/6638) [BUMP] Update dependency @badeball/cypress-cucumber-preprocessor to v14 (e2e).
- [#6637](https://github.com/1024pix/pix/pull/6637) [BUMP] Update dependency @badeball/cypress-cucumber-preprocessor to v13 (e2e).
- [#6636](https://github.com/1024pix/pix/pull/6636) [BUMP] Update dependency @badeball/cypress-cucumber-preprocessor to v12 (e2e).
- [#6632](https://github.com/1024pix/pix/pull/6632) [BUMP] Update dependency cypress to v10 (e2e).
- [#6630](https://github.com/1024pix/pix/pull/6630) [BUMP] Lock file maintenance (dossier racine).
- [#6626](https://github.com/1024pix/pix/pull/6626) [BUMP] Update dependency @1024pix/pix-ui to v37 (certif).
- [#6624](https://github.com/1024pix/pix/pull/6624) [BUMP] Update dependency @1024pix/pix-ui to v37 (mon-pix).
- [#6617](https://github.com/1024pix/pix/pull/6617) [BUMP] Lock file maintenance (certif).
- [#6620](https://github.com/1024pix/pix/pull/6620) [BUMP] Lock file maintenance (admin).
- [#6619](https://github.com/1024pix/pix/pull/6619) [BUMP] Lock file maintenance (1d).
- [#6618](https://github.com/1024pix/pix/pull/6618) [BUMP] Lock file maintenance (mon-pix).
- [#6616](https://github.com/1024pix/pix/pull/6616) [BUMP] Lock file maintenance (api).
- [#6608](https://github.com/1024pix/pix/pull/6608) [BUMP] Update dependency eslint-plugin-qunit to v8 (admin).
- [#6609](https://github.com/1024pix/pix/pull/6609) [BUMP] Update dependency eslint-plugin-qunit to v8 (orga).

## v4.14.0 (17/07/2023)


### :rocket: Amélioration
- [#6423](https://github.com/1024pix/pix/pull/6423) [FEATURE] Traduire l'attestation de certification (PIX-6691).
- [#6572](https://github.com/1024pix/pix/pull/6572) [FEATURE] Création en masse de campagnes depuis un fichier CSV (PIX-8520).

### :building_construction: Tech
- [#6517](https://github.com/1024pix/pix/pull/6517) [TECH] Verifier les parametre de la route d'ajout de candidat (PIX-8537).
- [#6593](https://github.com/1024pix/pix/pull/6593) [TECH] Spécifie la version spécifique d'ember-source sur admin qui fonctionne.
- [#6596](https://github.com/1024pix/pix/pull/6596) [TECH] Mise à jour de prettier et assimilé a la version 3.
- [#6591](https://github.com/1024pix/pix/pull/6591) [TECH] Spécifie la version spécifique d'ember-data sur orga qui fonctionne.
- [#6592](https://github.com/1024pix/pix/pull/6592) [TECH] Spécifie les versions spécifique de ember-source et d'ember-data sur certif qui fonctionnent.
- [#6582](https://github.com/1024pix/pix/pull/6582) [TECH] Refacto de l'API /habilitations pour les complémentaires (PIX-8631).
- [#6583](https://github.com/1024pix/pix/pull/6583) [TECH] Harmoniser le nommage des Github actions.
- [#6573](https://github.com/1024pix/pix/pull/6573) [TECH] Permettre de bloquer l'accès sur PixAdmin du versioning des profils cibles via Feature Toggle (PIX-8575).

### :bug: Correction
- [#6575](https://github.com/1024pix/pix/pull/6575) [BUGFIX] Corrige les typos dans la modale de confirmation de suppression de participants (PIX-8617).

### :coffee: Autre
- [#6607](https://github.com/1024pix/pix/pull/6607) [BUMP] Update dependency eslint-plugin-qunit to v8 (1d).
- [#6601](https://github.com/1024pix/pix/pull/6601) [BUMP] Update dependency eslint-plugin-qunit to v8 (certif).
- [#6576](https://github.com/1024pix/pix/pull/6576) [FEAT] Création de la page avec la liste de toutes les certifications complémentaires (PIX-8576).
- [#6604](https://github.com/1024pix/pix/pull/6604) [BUMP] Update dependency ember-source to ~4.12.0 (admin).
- [#6557](https://github.com/1024pix/pix/pull/6557) [BUMP] Update Node.js to v16.
- [#6600](https://github.com/1024pix/pix/pull/6600) [BUMP] Update dependency eslint-plugin-qunit to v8 (mon-pix).
- [#6599](https://github.com/1024pix/pix/pull/6599) [BUMP] Update dependency eslint-plugin-unicorn to v48 (api).
- [#6595](https://github.com/1024pix/pix/pull/6595) [BUMP] Update dependency nodemon to v3 (api).
- [#6538](https://github.com/1024pix/pix/pull/6538) [BUMP] Update dependency ember-source to ~4.12.0 (1d).
- [#6589](https://github.com/1024pix/pix/pull/6589) [BUMP] Update dependency ember-cli-showdown to v7 (orga).
- [#6588](https://github.com/1024pix/pix/pull/6588) [BUMP] Update dependency ember-cli-showdown to v7 (admin).
- [#6578](https://github.com/1024pix/pix/pull/6578) [BUMP] Met à jour Pix UI en version 38 dans Pix Admin (PIX-8619).

## v4.13.1 (11/07/2023)


### :rocket: Amélioration
- [#6571](https://github.com/1024pix/pix/pull/6571) [FEATURE] Améliorer le style des embeds (PIX-8112).

## v4.13.0 (11/07/2023)


### :rocket: Amélioration
- [#6559](https://github.com/1024pix/pix/pull/6559) [FEATURE] Création d'un endpoint pour la création de campagnes en masse (PIX-8519).
- [#6425](https://github.com/1024pix/pix/pull/6425) [FEATURE] Vérifier la conformité des adresses e-mail lors de l'ajout d'un candidat sur Pix Certif (PIX-7888).
- [#6506](https://github.com/1024pix/pix/pull/6506) [FEATURE] Affiche la remise à zéro des acquis dans le détail du profil cible dans Pix Admin (PIX-8521).
- [#6409](https://github.com/1024pix/pix/pull/6409) [FEATURE] Pix1D - Passage de mission avec algorithme d'apprentissage (PIX-8382).
- [#6502](https://github.com/1024pix/pix/pull/6502) [FEATURE] Possibilité pour les centres V3 pilotes d'importer en masses des sessions (PIX-8511).
- [#6504](https://github.com/1024pix/pix/pull/6504) [FEATURE] Afficher le nombre de questions passées et total dans le compteur (PIX-8512).
- [#6501](https://github.com/1024pix/pix/pull/6501) [FEATURE] Suppression de l'onglet Profil pour les certifications V3 (PIX-8494).
- [#6508](https://github.com/1024pix/pix/pull/6508) [FEATURE] Afficher la notion de progressivité sur les résultats thématiques certifiants (PIX-8440).

### :building_construction: Tech
- [#6526](https://github.com/1024pix/pix/pull/6526) [TECH] A l'initialisation du databaseBuilder, s'assurer que le vidage de la BDD respecte l'ordre de dépendance des tables (PIX-8544).
- [#6552](https://github.com/1024pix/pix/pull/6552) [TECH] Supprimer la métrique de couverture de code plus disponible.
- [#6543](https://github.com/1024pix/pix/pull/6543) [TECH] Spécifie les versions spécifique de ember-source et d'ember-data sur mon-pix qui fonctionnent.
- [#6507](https://github.com/1024pix/pix/pull/6507) [TECH] Amélioration du code de récupération des éléments de correction d'un QROCm-dep (PIX-8214).
- [#6530](https://github.com/1024pix/pix/pull/6530) [TECH] :wrench: Unifier la version d'image postgres utilisée.
- [#6515](https://github.com/1024pix/pix/pull/6515) [TECH] Mise à jour de stylelint-config-standard-scss en v10.

### :bug: Correction
- [#6553](https://github.com/1024pix/pix/pull/6553) [BUGFIX] Import en masse impossible avec des certifications complémentaires (PIX-8531).
- [#6520](https://github.com/1024pix/pix/pull/6520) [BUGFIX] Jeter une erreur si fichier d'import en masse de session vide (PIX-8543).

### :coffee: Autre
- [#6565](https://github.com/1024pix/pix/pull/6565) [BUMP] Update dependency stylelint to v15.10.1 [SECURITY].
- [#6562](https://github.com/1024pix/pix/pull/6562) [BUMP] Update dependency stylelint to v15.10.1 [SECURITY].
- [#6546](https://github.com/1024pix/pix/pull/6546) [BUMP] Lock file maintenance (mon-pix).
- [#6547](https://github.com/1024pix/pix/pull/6547) [BUMP] Update dependency @1024pix/ember-testing-library to ^0.7.0 (certif).
- [#6544](https://github.com/1024pix/pix/pull/6544) [BUMP] Update dependency @1024pix/ember-testing-library to ^0.7.0 (admin).
- [#6542](https://github.com/1024pix/pix/pull/6542) [BUMP] Update dependency @1024pix/ember-testing-library to ^0.7.0 (orga).
- [#6541](https://github.com/1024pix/pix/pull/6541) [BUMP] Update dependency @1024pix/ember-testing-library to ^0.7.0 (mon-pix).
- [#6540](https://github.com/1024pix/pix/pull/6540) [BUMP] Update dependency xml2js to ^0.6.0 (api).
- [#6539](https://github.com/1024pix/pix/pull/6539) [BUMP] Update dependency scalingo to ^0.8.0 (api).
- [#6537](https://github.com/1024pix/pix/pull/6537) [BUMP] Update dependency @1024pix/ember-testing-library to ^0.7.0 (1d).
- [#6531](https://github.com/1024pix/pix/pull/6531) [BUMP] Update dependency ember-cli to ~4.12.0 (1d).
- [#6532](https://github.com/1024pix/pix/pull/6532) [BUMP] Update dependency ember-cli to ~4.12.0 (admin).

## v4.12.0 (04/07/2023)


### :rocket: Amélioration
- [#6442](https://github.com/1024pix/pix/pull/6442) [FEATURE] api: Modification du mail des résultats de certification (PIX-8239).
- [#6354](https://github.com/1024pix/pix/pull/6354) [FEATURE] Traduction des CSV des résultats de certification (PIX-8085).
- [#6482](https://github.com/1024pix/pix/pull/6482) [FEATURE] ajout d'une colonne à la liste de campagnes pour afficher leurs codes (PIX-8477).
- [#6496](https://github.com/1024pix/pix/pull/6496) [FEATURE] Retourner le nouveau champ areKnowledgeElementsResettable dans l'API.
- [#6477](https://github.com/1024pix/pix/pull/6477) [FEATURE] Empêcher un challenge d'être enregistré deux fois pendant une certif V3 (PIX-8470).

### :building_construction: Tech
- [#6497](https://github.com/1024pix/pix/pull/6497) [TECH] Amélioration et correction des certification complémentaire dans les nouveaux seeds (PIX-8506).
- [#6462](https://github.com/1024pix/pix/pull/6462) [TECH] Nettoyage des erreurs liés à l'ajout d'un candidat à une session de certification (PIX-8445).
- [#6512](https://github.com/1024pix/pix/pull/6512) [TECH] Vérrouiller la version Node de l'API en v16.
- [#6488](https://github.com/1024pix/pix/pull/6488) [TECH] Récupération du dernier challenge vu lors d'une reprise de session (PIX-8258).
- [#6454](https://github.com/1024pix/pix/pull/6454) [TECH] Ajouter des tests au prehandler assessment-authorization (PIX-8022).

### :bug: Correction
- [#6511](https://github.com/1024pix/pix/pull/6511) [BUGFIX] Réparer l'affichage du lien contenu dans le message de blocage de compte sur Pix App, Orga, Certif, Admin (PIX-8501).
- [#6510](https://github.com/1024pix/pix/pull/6510) [BUGFIX] Améliorer le texte sur la double mire SSO (PIX-8529).
- [#6509](https://github.com/1024pix/pix/pull/6509) [BUGFIX] Permettre de revenir dans une organisation PRO après suppression (Pix-8527).
- [#6505](https://github.com/1024pix/pix/pull/6505) [BUGFIX] Ajouter la possibilité de trier la page élèves par Classe (PIX-8479).

### :coffee: Autre
- [#6514](https://github.com/1024pix/pix/pull/6514) [BUG] Retirer la colonne Actions de la liste d'Organisations (PIX-8535).
- [#6292](https://github.com/1024pix/pix/pull/6292) [ADMIN] Permettre de déplacer une méthode de connexion via SSO vers un autre utilisateur (PIX-7738).

## v4.11.0 (29/06/2023)


### :boom: BREAKING CHANGE
- [#6229](https://github.com/1024pix/pix/pull/6229) [BREAKING] Ajouter la fonctionnalité d'activer/désactiver facilement un SSO OIDC (PIX-7749).

### :rocket: Amélioration
- [#6444](https://github.com/1024pix/pix/pull/6444) [FEATURE] Permettre aux organisation type PRO de supprimer des prescrits (PIX-6616).
- [#6483](https://github.com/1024pix/pix/pull/6483) [FEATURE] Ajoute le champ areKnowledgeElementsResettable dans la table target-profiles (PIX-8486).
- [#6491](https://github.com/1024pix/pix/pull/6491) [FEATURE] Ajout du code campagne dans l'export csv des campagnes (PIX-8478).
- [#6461](https://github.com/1024pix/pix/pull/6461) [FEATURE] Afficher la notion de progressivité sur les résultats thématiques en lacunes non certifiants (PIX-8057).
- [#6487](https://github.com/1024pix/pix/pull/6487) [FEATURE] Pix1D - Ajouter un bouton de retour vers l'accueil à la page de fin de mission (Pix-8481).
- [#6457](https://github.com/1024pix/pix/pull/6457) [FEATURE] Enregistrement au fur et à mesure des challenges passés en certif V3 (PIX-8452).
- [#6320](https://github.com/1024pix/pix/pull/6320) [FEATURE] Retravailler l'accessibilité des signalements de problème en épreuve (PIX-7668).
- [#6471](https://github.com/1024pix/pix/pull/6471) [FEATURE] Afficher une bannière annonçant l'ouverture de l'import de session en masse sur Pix Certif (PIX-6964).
- [#6458](https://github.com/1024pix/pix/pull/6458) [FEATURE] Pix1D - Prévenir l'élève s'il n'a pas terminé son activité à la validation (PIX-8281).
- [#6463](https://github.com/1024pix/pix/pull/6463) [FEATURE] Modifier le texte sur la double mire SSO PIX-8407.
- [#6448](https://github.com/1024pix/pix/pull/6448) [FEATURE] Ajouter un aria-label sur les liens d'aide sur les épreuves sur Pix-App (PIX-8076).

### :building_construction: Tech
- [#6411](https://github.com/1024pix/pix/pull/6411) [TECH] Utiliser les nouvelles seeds pour la team xp eval (PIX-8225).
- [#6492](https://github.com/1024pix/pix/pull/6492) [TECH] Partager la configuration ESLint.
- [#6401](https://github.com/1024pix/pix/pull/6401) [TECH] Mettre à jour les seeds de la Team Accès (PIX-8208).
- [#6443](https://github.com/1024pix/pix/pull/6443) [TECH] Créer un jeu de données pour une session demarrée (PIX-8409).
- [#6455](https://github.com/1024pix/pix/pull/6455) [TECH] Uniformisations des règles de lint de traductions.
- [#6464](https://github.com/1024pix/pix/pull/6464) [TECH] Supprimer les faux positifs sur les tests automatisés en utilisant VScode (PIX-8663).

### :bug: Correction
- [#6495](https://github.com/1024pix/pix/pull/6495) [BUGFIX] Rectifier l'alignement des réponses d'un QROCm passé (PIX-8488).
- [#6500](https://github.com/1024pix/pix/pull/6500) [BUGFIX] Ajout de la version de session pour l'import en masse (PIX-8510).
- [#6499](https://github.com/1024pix/pix/pull/6499) [BUGFIX] Suppression d'un objet non existant lors de la génération des nouvelles seeds.
- [#6493](https://github.com/1024pix/pix/pull/6493) [BUGFIX] Trace seulement les vraies erreurs dans l'API (PIX-8484).
- [#6473](https://github.com/1024pix/pix/pull/6473) [BUGFIX] Corrige le script test:api:watch cassé depuis le passage aux modules ESM.

### :coffee: Autre
- [#6494](https://github.com/1024pix/pix/pull/6494) [BUMP] Lock file maintenance (api).
- [#6485](https://github.com/1024pix/pix/pull/6485) [BUMP] Update dependency ember-file-upload to v8 (admin).
- [#6484](https://github.com/1024pix/pix/pull/6484) [BUMP] Update dependency ember-file-upload to v8 (certif).
- [#6479](https://github.com/1024pix/pix/pull/6479) [BUMP] Lock file maintenance (dossier racine).
- [#6478](https://github.com/1024pix/pix/pull/6478) [BUMP] Update dependency mocha to v10 (dossier racine).
- [#6475](https://github.com/1024pix/pix/pull/6475) [BUMP] Update dependency husky to v8 (dossier racine).
- [#6474](https://github.com/1024pix/pix/pull/6474) [BUMP] Update dependency lint-staged to v13 (dossier racine).
- [#6472](https://github.com/1024pix/pix/pull/6472) [BUMP] Update eslint (major).
- [#6469](https://github.com/1024pix/pix/pull/6469) [CLEANUP] Supprime la version en doublon en haut du changelog.

## v4.10.0 (26/06/2023)


### :rocket: Amélioration
- [#6459](https://github.com/1024pix/pix/pull/6459) [FEATURE] Pix1D - customiser la page de fin de mission (PIX-8417).
- [#6449](https://github.com/1024pix/pix/pull/6449) [FEATURE] Terminer la session de certif V3 après un nombre précis de questions (PIX-8436).
- [#6447](https://github.com/1024pix/pix/pull/6447) [FEATURE] Améliorer l'affichage des solutions des QROCm (PIX-6221).
- [#6453](https://github.com/1024pix/pix/pull/6453) [FEATURE] Afficher les résultats thématiques en lacunes lorsqu'ils sont certifiantes ou non (PIX-8438).
- [#6445](https://github.com/1024pix/pix/pull/6445) [FEATURE] Utiliser le nouvel algorithme pour choisir les épreuves lors d'une certif v3 (PIX-8426).
- [#6452](https://github.com/1024pix/pix/pull/6452) [FEATURE] Ajout d'une modale de confirmation quand on détache une orga d'un profil cible (PIX-7030).
- [#6450](https://github.com/1024pix/pix/pull/6450) [FEATURE] Pix1D - Amélioration de la page d'introduction de mission.
- [#6439](https://github.com/1024pix/pix/pull/6439) [FEATURE] Création de la page d'accès aux missions (PIX-8283).
- [#6260](https://github.com/1024pix/pix/pull/6260) [FEATURE] Ajoute le détachement d'un profil cible d'une organisation (PIX-7028).
- [#6413](https://github.com/1024pix/pix/pull/6413) [FEATURE] Identification de la version des certification-courses (PIX-8273).

### :building_construction: Tech
- [#6460](https://github.com/1024pix/pix/pull/6460) [TECH] Nettoyage des fichiers de l'ajout de la modale pour détacher un profil cible (PIX-8450).
- [#6434](https://github.com/1024pix/pix/pull/6434) [TECH] Mise à jour des configurations de vscode.
- [#6441](https://github.com/1024pix/pix/pull/6441) [TECH] Linter les traduction de Pix Admin.
- [#6456](https://github.com/1024pix/pix/pull/6456) [TECH] Utiliser les nouveaux imports de services dans Ember.js.
- [#6436](https://github.com/1024pix/pix/pull/6436) [TECH] Amélioration des tests en utilisant Testing Library (PIX-8412).
- [#6416](https://github.com/1024pix/pix/pull/6416) [TECH] Monter Pix-UI en version 36.0.0 sur PixApp (PIX-8252).
- [#6427](https://github.com/1024pix/pix/pull/6427) [TECH] Ajouter une config pour jouer Pix1d sur safari (PIX-8403).
- [#6446](https://github.com/1024pix/pix/pull/6446) [TECH] Suppression des scripts `dev` des applis fronts.
- [#6433](https://github.com/1024pix/pix/pull/6433) [TECH] Uniformisation des `scripts` des `package.json`.
- [#6407](https://github.com/1024pix/pix/pull/6407) [TECH] Faciliter la création de migrations BDD.
- [#6430](https://github.com/1024pix/pix/pull/6430) [TECH] Refactorer l'utilitaire de barreling.
- [#6440](https://github.com/1024pix/pix/pull/6440) [TECH] Corriger l'import des fichiers d'un dossier sur Windows. .
- [#6429](https://github.com/1024pix/pix/pull/6429) [TECH] Remplacer eslint-plugin-node par son successeur eslint-plugin-n.

### :bug: Correction
- [#6435](https://github.com/1024pix/pix/pull/6435) [BUGFIX] Améliorer le design de l'input sur l'écran de réponse des QROC sur Pix-App (PIX-8316).

### :coffee: Autre
- [#6468](https://github.com/1024pix/pix/pull/6468) [BUMP] Lock file maintenance (api).
- [#6466](https://github.com/1024pix/pix/pull/6466) [BUMP] Update node to v16.20.1.
- [#6467](https://github.com/1024pix/pix/pull/6467) [BUMP] Update dependency hapi-swagger to v17 (api).

## v4.9.0 (21/06/2023)


### :rocket: Amélioration
- [#6384](https://github.com/1024pix/pix/pull/6384) [FEATURE] Afficher les corrections QROCM-dep sous les champs en erreur (PIX-8263).
- [#6385](https://github.com/1024pix/pix/pull/6385) [FEATURE] Traduire les erreurs lors de la création d'un candidat via la modale sur Pix Certif (PIX-8320).

### :building_construction: Tech
- [#6414](https://github.com/1024pix/pix/pull/6414) [TECH] Analyser la progression des migrations lors des MEP (PIX-8336).
- [#6431](https://github.com/1024pix/pix/pull/6431) [TECH] Création des seeds pour la certif next-gen (PIX-8402).
- [#6426](https://github.com/1024pix/pix/pull/6426) [TECH] Importer automatiquement les databases builders.
- [#6428](https://github.com/1024pix/pix/pull/6428) [TECH] Corriger la v4.4.0 dans le CHANGELOG .

### :bug: Correction
- [#6438](https://github.com/1024pix/pix/pull/6438) [BUGFIX] Les signalements ne peuvent plus être ajoutés à la finalisation de la session (PIX-8416).
- [#6437](https://github.com/1024pix/pix/pull/6437) [BUGFIX] Les métriques systèmes ne sont plus tracées (PIX-8411).

## v4.8.0 (20/06/2023)


### :rocket: Amélioration
- [#6388](https://github.com/1024pix/pix/pull/6388) [FEATURE] Renvoyer le pourcentage d'acquisition d'un Résultat Thématique à la fin d'une campagne (PIX-8058).
- [#6408](https://github.com/1024pix/pix/pull/6408) [FEATURE] Identification des sessions NextGen en base de données (pix-8374).
- [#6295](https://github.com/1024pix/pix/pull/6295) [FEATURE] Traduire les erreurs lors de l'import de candidats sur Pix Certif (PIX-7967).

### :building_construction: Tech
- [#6424](https://github.com/1024pix/pix/pull/6424) [TECH] Renuméroter les ADR.
- [#6419](https://github.com/1024pix/pix/pull/6419) [TECH] Mise à jour de Pix-UI en V36 sur pix-certif (PIX-8389).
- [#6415](https://github.com/1024pix/pix/pull/6415) [TECH] Afficher l'avancement des migrations de BDD.

### :bug: Correction
- [#6412](https://github.com/1024pix/pix/pull/6412) [BUGFIX] QCU: Mention "La bonne réponse est : ..." incorrecte (PIX-8385).
- [#6398](https://github.com/1024pix/pix/pull/6398) [BUGFIX] Harmoniser la taille des cartes des contenus formatifs (PIX-8349).

## v4.7.0 (16/06/2023)


### :building_construction: Tech
- [#6406](https://github.com/1024pix/pix/pull/6406) [TECH] Revert partiel de la PR 6346 - Passage de mission linéaire Pix1D (PIX-7693).
- [#6381](https://github.com/1024pix/pix/pull/6381) [TECH] Remplacer le champ isV2Certification par version dans les certification (PIX-8298).
- [#6399](https://github.com/1024pix/pix/pull/6399) [TECH] Refacto de la méthode privée "#" en "_".
- [#6403](https://github.com/1024pix/pix/pull/6403) [TECH] Renommer l'application pix1d en 1d (PIX-8373).

### :bug: Correction
- [#6333](https://github.com/1024pix/pix/pull/6333) [BUGFIX] Corriger les urls de la documentation des Organisations en fonction de certains TAGS (PIX-8271).

## v4.6.0 (15/06/2023)


### :rocket: Amélioration
- [#6396](https://github.com/1024pix/pix/pull/6396) [FEATURE] Ajout du champ challengeId dans la réponse du simulateur d'évaluation.

### :building_construction: Tech
- [#6397](https://github.com/1024pix/pix/pull/6397) [TECH] Utiliser l'attribut embedHeight pour setter la hauteur d'un embed (PIX-8370).

### :bug: Correction
- [#6402](https://github.com/1024pix/pix/pull/6402) [BUGFIX] Le select des QROC n'affiche pas sa valeur courante (PIX-8371).

### :coffee: Autre
- [#6400](https://github.com/1024pix/pix/pull/6400) [BUMP] Mise à jour de @ember/test-helpers et de @ember/qunit sur les applications.

## v4.5.0 (15/06/2023)


### :rocket: Amélioration
- [#6373](https://github.com/1024pix/pix/pull/6373) [FEATURE] Filtrer les épreuves périmées dans les simulateurs (PIX-8328). .
- [#6352](https://github.com/1024pix/pix/pull/6352) [FEATURE] Ajout de la version dans la DB pour les certification-courses (PIX-8299).
- [#6369](https://github.com/1024pix/pix/pull/6369) [FEATURE] Script de rollback de migrations des paliers des PC (PIX-8338).
- [#6266](https://github.com/1024pix/pix/pull/6266) [FEATURE] Empêcher la double soumission des formulaires d'authentification (PIX-8153).
- [#6361](https://github.com/1024pix/pix/pull/6361) [FEATURE] Amélioration du wording lors de la création d'une campagne d'évaluation (PIX-8293).
- [#6346](https://github.com/1024pix/pix/pull/6346) [FEATURE] Pix1D - Passage de mission linéaire.
- [#6348](https://github.com/1024pix/pix/pull/6348) [FEATURE] Améliorer l'accessibilité des images décoratives sur Pix-App (PIX-6815).

### :building_construction: Tech
- [#6367](https://github.com/1024pix/pix/pull/6367) [TECH] Automatiquement importer les usecases pour leur injecter les dépendances.
- [#6391](https://github.com/1024pix/pix/pull/6391) [TECH] Remise de l'ancienne requête de publication de sessions en masse (PIX-8365).
- [#6362](https://github.com/1024pix/pix/pull/6362) [TECH] Mise à jour du changelog après le hotfix 4.2.1.
- [#6366](https://github.com/1024pix/pix/pull/6366) [TECH] Augmenter le temps d'inactivité du browser sur pix-admin.

### :bug: Correction
- [#6378](https://github.com/1024pix/pix/pull/6378) [BUGFIX] Utilise un mot de passe statique dans les tests.
- [#6383](https://github.com/1024pix/pix/pull/6383) [BUGFIX] Informer l'utilisateur de la maintenance sur pix1d (PIX-8336).
- [#6365](https://github.com/1024pix/pix/pull/6365) [BUGFIX] Un test d'acceptance pix-admin échoue aléatoirement (PIX-8341).

### :coffee: Autre
- [#6375](https://github.com/1024pix/pix/pull/6375) [BUMP] Update dependency cypress-axe to ^0.14.0 (e2e).
- [#6374](https://github.com/1024pix/pix/pull/6374) [BUMP] Update nginx Docker tag to v1.25.1.
- [#6372](https://github.com/1024pix/pix/pull/6372) [BUMP] Lock file maintenance (dossier racine).

## v4.4.0 (13/06/2023)



### :rocket: Amélioration
- [#6328](https://github.com/1024pix/pix/pull/6328) [FEATURE] Afficher si l'envoi multiple est dispo dans les paramètres d'une campagne d'évaluation (PIX-8198).

### :building_construction: Tech
- [#6359](https://github.com/1024pix/pix/pull/6359) [TECH] Trier le fichier index des use-cases.

### :bug: Correction
- [#6360](https://github.com/1024pix/pix/pull/6360) [BUGFIX] Corrige les jobs pgboss .

## v4.3.1 (13/06/2023)

### :bug: Correction
- [#6360](https://github.com/1024pix/pix/pull/6360) [BUGFIX] Corrige les jobs pgboss .

## v4.3.0 (13/06/2023)


### :rocket: Amélioration
- [#6306](https://github.com/1024pix/pix/pull/6306) [FEATURE] Design des épreuves avec embed auto dans Pix1D (PIX-8100).
- [#6338](https://github.com/1024pix/pix/pull/6338) [FEATURE] Ajouter un lien de redirection vers le profil cible dans la liste des campagnes d'une organisation sur Pix Admin(PIX-8145).
- [#6308](https://github.com/1024pix/pix/pull/6308) [FEATURE] Filtrer les bonnes réponses utilisateurs des solutions (PIX-8147) .
- [#6344](https://github.com/1024pix/pix/pull/6344) [FEATURE] Ajout de la colonne isV3Pilot dans la table certification-centers (PIX-8249).
- [#6329](https://github.com/1024pix/pix/pull/6329) [FEATURE] Rapatrie le code de hapi-pino dans l'API.
- [#6307](https://github.com/1024pix/pix/pull/6307) [FEATURE] Amélioration et ajout d'une barre de défilement au menu utilisateur sur Pix Certif (PIX-8154).
- [#6300](https://github.com/1024pix/pix/pull/6300) [FEATURE] Script de migration des paliers seuils en niveaux (PIX-8098).
- [#6309](https://github.com/1024pix/pix/pull/6309) [FEATURE] Améliorer l'accessibilité de la modale de solution des QROC/m (PIX-8189).
- [#6243](https://github.com/1024pix/pix/pull/6243) [FEATURE] Empêcher la soumission du formulaire d'inscription de Pix App si des erreurs n'ont pas été corrigées (PIX-7815)

### :building_construction: Tech
- [#6358](https://github.com/1024pix/pix/pull/6358) [TECH] Suppression de déprécations de faker.
- [#6332](https://github.com/1024pix/pix/pull/6332) [TECH] Proposer l'injection de dépendances pour les répositories.
- [#6355](https://github.com/1024pix/pix/pull/6355) [TECH] Harmoniser les imports de `data-fetcher`.
- [#6353](https://github.com/1024pix/pix/pull/6353) [TECH] Supprimer les warnings sinon.stub.
- [#6238](https://github.com/1024pix/pix/pull/6238) [TECH] Renommage de la certification complémentaire PIX+ Droit Avancé (PIX-7911).
- [#6323](https://github.com/1024pix/pix/pull/6323) [TECH] Monter de version Ember 4.12 sur PixOrga (PIX-8264).
- [#6343](https://github.com/1024pix/pix/pull/6343) [TECH] Suppression de dépendances a la racine inutilisés.
- [#6335](https://github.com/1024pix/pix/pull/6335) [TECH] Utiliser toString() au lieu de .string sur les instances SafeString.
- [#6325](https://github.com/1024pix/pix/pull/6325) [TECH] Mise à jour du CHANGELOG (PIX-8243)

### :bug: Correction
- [#6324](https://github.com/1024pix/pix/pull/6324) [BUGFIX] Exiger les données obligatoires sur la route POST /api/certification-courses (PIX-8262).
- [#6334](https://github.com/1024pix/pix/pull/6334) [BUGFIX] La bonne réponse affichée pour un QCM mélangé n'est pas bonne (PIX-8250).
- [#6337](https://github.com/1024pix/pix/pull/6337) [BUGFIX] :ambulance: Hotfix v4.2.1.
- [#6327](https://github.com/1024pix/pix/pull/6327) [BUGFIX] Retourner une erreur dans la méthode getWithComplementaryCertification lorsque le candidat n'existe pas (PIX-8266).
- [#6322](https://github.com/1024pix/pix/pull/6322) [BUGFIX] Permettre à un candidat éligible mais non inscrit à une certif complémentaire de passer la certification (PIX-8257).

### :coffee: Autre
- [#6351](https://github.com/1024pix/pix/pull/6351) [BUMP] Lock file maintenance (api).
- [#6245](https://github.com/1024pix/pix/pull/6245) [BUMP] Update embroider monorepo to v3 (mon-pix) (major).
- [#6339](https://github.com/1024pix/pix/pull/6339) [BUMP] Update dependency axios to v1 (api).
- [#6347](https://github.com/1024pix/pix/pull/6347) [DOC] Corriger les entrées du changelog.
- [#6341](https://github.com/1024pix/pix/pull/6341) [BUMP] Update dependency query-string to v8 (admin).
- [#6340](https://github.com/1024pix/pix/pull/6340) [BUMP] Update dependency @ls-lint/ls-lint to v2 (api).

## v4.2.1 (08/06/2023)

### :bug: Correction
- [#6322](https://github.com/1024pix/pix/pull/6322) [BUGFIX] Permettre à un candidat éligible mais non inscrit à une certif complémentaire de passer la certification (PIX-8257)

## v4.2.0 (06/06/2023)


### :rocket: Amélioration
- [#6294](https://github.com/1024pix/pix/pull/6294) [FEATURE] Pix1D - Ajouter la prévisualisation des challenges (PIX-8048)
- [#6303](https://github.com/1024pix/pix/pull/6303) [FEATURE] Avoir toujours la liste des badges et des logos des éditeurs de CF à jour (PIX-8218).
- [#6242](https://github.com/1024pix/pix/pull/6242) [FEATURE] Création du endpoint pour la suppression de prescrits (PIX-7948)
- [#6277](https://github.com/1024pix/pix/pull/6277) [FEATURE] Utiliser les composants du Design System pour les QROC et QROCm sur Pix-App (PIX-8103)
- [#6293](https://github.com/1024pix/pix/pull/6293) [FEATURE] Batch sur les différents scénarios de simulations (PIX-8197).
- [#6298](https://github.com/1024pix/pix/pull/6298) [FEATURE] Forcer des compétences dans l'algorithme Flash (PIX-8160)
- [#6311](https://github.com/1024pix/pix/pull/6311) [FEATURE] Améliorer l'accessibilité du bouton "Réinitialiser" l'embed sur Pix-App (PIX-8074)

### :building_construction: Tech
- [#6315](https://github.com/1024pix/pix/pull/6315) [TECH] Mise à jour de dépendances vulnérable sur les applications
- [#6301](https://github.com/1024pix/pix/pull/6301) [TECH] Mettre à jour ember-dayjs dans sa dernière version (PIX-8222)
- [#6151](https://github.com/1024pix/pix/pull/6151) [TECH] Documenter le choix de l'injection de dépendances
- [#6304](https://github.com/1024pix/pix/pull/6304) [TECH] Corriger l'alignement des étoiles dans Pix Orga (PIX-7983)

### :bug: Correction
- [#6310](https://github.com/1024pix/pix/pull/6310) [BUGFIX] Changement de wording pour l'affichage des contenus formatifs (PIX-8157).
- [#6313](https://github.com/1024pix/pix/pull/6313) [BUGFIX] Corriger la création de campagne à envoi multiple (PIX-8238)

### :coffee: Autre
- [#6321](https://github.com/1024pix/pix/pull/6321) [BUMP] Update dependency inquirer to v9 (api)
- [#6319](https://github.com/1024pix/pix/pull/6319) [BUMP] Update dependency file-type to v18 (api)
- [#6318](https://github.com/1024pix/pix/pull/6318) [BUMP] Update dependency pino-pretty to v10 (api)
- [#6214](https://github.com/1024pix/pix/pull/6214) [BUMP] Update dependency pg-boss to v9 (api)
- [#6312](https://github.com/1024pix/pix/pull/6312) [BUMP] Mise à jour des dépendances vulnérables sur admin 

## v4.1.3 (08/06/2023)


### :bug: Correction
 - [#6322](https://github.com/1024pix/pix/pull/6322) [BUGFIX] Permettre à un candidat éligible mais non inscrit à une certif complémentaire de passer la certification (PIX-8257)

## v4.1.2 (05/06/2023)


### :bug: Correction
- [#6314](https://github.com/1024pix/pix/pull/6314) [TECH] Gestion de langue manquante sur le kit superviseur (PIX-8243)

## v4.1.1 (01/06/2023)


### :building_construction: Tech
- [#6302](https://github.com/1024pix/pix/pull/6302) [TECH] Revert le ticket Améliorer le style visuel du bloc d'embed d'une épreuve (PIX-8112)

## v4.1.0 (01/06/2023)


### :rocket: Amélioration
- [#6299](https://github.com/1024pix/pix/pull/6299) [FEATURE] Toujours afficher le résultat en pourcentage d'une campagne (PIX-7986)
- [#6272](https://github.com/1024pix/pix/pull/6272) [FEATURE] Améliorer le style visuel du bloc d'embed d'une épreuve (PIX-8112).
- [#6291](https://github.com/1024pix/pix/pull/6291) [FEATURE] Améliorer l'a11y de la page de lancement d'une épreuve chronométrée (PIX-7670).
- [#6297](https://github.com/1024pix/pix/pull/6297) [FEATURE] Creation d'un script pour l'envoi des emails de resultat de certification (PIX-8211)
- [#6276](https://github.com/1024pix/pix/pull/6276) [FEATURE] Arrêter la mission au 1er challenge échoué ou passé (PIX-8181)
- [#6265](https://github.com/1024pix/pix/pull/6265) [FEATURE] Traduire le Kit surveillant en anglais (PIX-6688)
- [#6283](https://github.com/1024pix/pix/pull/6283) [FEATURE] Afficher des corrections claires pour les QROCM-dep (PIX-7866)
- [#6287](https://github.com/1024pix/pix/pull/6287) [FEATURE] Ajout d'une capacité initiale dans les simulateurs d'évaluation (PIX-8159).
- [#6264](https://github.com/1024pix/pix/pull/6264) [FEATURE] Traduction d'éléments encore non traduits sur Pix Certif (PIX-8027).
- [#6263](https://github.com/1024pix/pix/pull/6263) [FEATURE] Reporter le texte des pages SCO de Pix Certif dans des clés de traduction (PIX-8023).
- [#6145](https://github.com/1024pix/pix/pull/6145) [FEATURE] Suppression de l'heure de fin de session de la feuille d'émargement et import de candidat (PIX-7836)
- [#6262](https://github.com/1024pix/pix/pull/6262) [FEATURE] Améliorer le style visuel de la recommendation des contenus formatifs (PIX-7667).
- [#6269](https://github.com/1024pix/pix/pull/6269) [FEATURE] Ajout d'une condition d’arrêt au scénario
- [#6271](https://github.com/1024pix/pix/pull/6271) [FEATURE] Suppression du filtre du status des challenges pour les simulateurs (PIX-8173).
- [#6275](https://github.com/1024pix/pix/pull/6275) [FEATURE] Remplacement de AnswerStatus par la réponse dans les simulateurs (PIX-8179).
- [#6274](https://github.com/1024pix/pix/pull/6274) [FEATURE] Indiquer la réussite/l'échec d'une épreuve Pix1D dans une modale

### :building_construction: Tech
- [#6285](https://github.com/1024pix/pix/pull/6285) [TECH] Mis à jour des instanciations des Chart sur PixOrga (PIX-8186)
- [#6296](https://github.com/1024pix/pix/pull/6296) [TECH] Supprime les dépendances chai-dom et eslint-plugin-mocha de mon-pix
- [#6289](https://github.com/1024pix/pix/pull/6289) [TECH] Remplacement des termes answers/simulationAnswers par answerStatus (pix-8183)
- [#6290](https://github.com/1024pix/pix/pull/6290) [TECH] Mise à jour de ember-fontawesome en version 1.0.0
- [#6282](https://github.com/1024pix/pix/pull/6282) [TECH] Supprime l'orb slack de la configuration de circleci
- [#6273](https://github.com/1024pix/pix/pull/6273) [TECH] Supprime un fichier inutile a la racine
- [#6235](https://github.com/1024pix/pix/pull/6235) [TECH] Persister les données créées par le tooling des seeds à chaque fin d'appel (PIX-8107)
- [#6083](https://github.com/1024pix/pix/pull/6083) [TECH] Migre pix1d sur embroider (PIX-7764)
- [#6279](https://github.com/1024pix/pix/pull/6279) [TECH] Mise à jour de ember-dayjs
- [#6282](https://github.com/1024pix/pix/pull/6282) [TECH] Supprime l'orb slack de la configuration de circleci

### :bug: Correction
- [#6288](https://github.com/1024pix/pix/pull/6288) [BUGFIX] Ajouter le i18n à la méthode publishInBatch (PIX-8187).
- [#6267](https://github.com/1024pix/pix/pull/6267) [BUGFIX] Remettre la génération de villes et de pays dans les seeds (PIX-8162)

### :coffee: Autre
- [#6278](https://github.com/1024pix/pix/pull/6278) [BUMP] Update nginx Docker tag to v1.25.0
- [#6280](https://github.com/1024pix/pix/pull/6280) [BUMP] Update node to v16.20.0
- [#6284](https://github.com/1024pix/pix/pull/6284) [BUMP] Update dependency ember-composable-helpers to v5 (certif)

## v4.0.1 (30/05/2023)

### :bug: Correction
- [#6288](https://github.com/1024pix/pix/pull/6288) [BUGFIX] Ajouter le i18n à la méthode publishInBatch (PIX-8187).

## v4.0.0 (26/05/2023)


### :rocket: Amélioration
- [#6042](https://github.com/1024pix/pix/pull/6042) [FEATURE] Mise en place des passages de mission restreint à l'activité Didacticiel (PIX-7692)
- [#6259](https://github.com/1024pix/pix/pull/6259) [FEATURE] Simulation d'un scénario à partir d'une capacité (PIX-8122).
- [#6256](https://github.com/1024pix/pix/pull/6256) [FEATURE] Génération d'un scénario aléatoire (PIX-8121).
- [#6258](https://github.com/1024pix/pix/pull/6258) [FEATURE] Amélioration du design de l'espace surveillant sur pix Certif (PIX-8125).
- [#6233](https://github.com/1024pix/pix/pull/6233) [FEATURE] Import de CSV pour génération de scénarios déterministes (PIX-8038).
- [#6261](https://github.com/1024pix/pix/pull/6261) [FEATURE] Ajouter la traduction anglaise du mail d'invitation à Pix Certif (PIX-8141).
- [#6218](https://github.com/1024pix/pix/pull/6218) [FEATURE] Elaboration d'un simulateur de scénarios déterministes pour le nouvel algo (PIX-8037).
- [#5661](https://github.com/1024pix/pix/pull/5661) [FEATURE] ETQ Admin Support, télécharger les attestations de certification d'une session (PIX-7132)
- [#6002](https://github.com/1024pix/pix/pull/6002) [FEATURE] Traduire les messages d'erreur de l'API (PIX-6690).
- [#6202](https://github.com/1024pix/pix/pull/6202) [FEATURE] Améliorer le style du bloc de réponse des épreuves Pix-App (PIX-7717)
- [#6211](https://github.com/1024pix/pix/pull/6211) [FEATURE] Renvoyer le détail de validation de QRCOM-dep depuis l'API (PIX-7919)
- [#6232](https://github.com/1024pix/pix/pull/6232) [FEATURE] Ajouter un sélecteur de langue sur la page connexion de Pix Certif domaine international (PIX-5955)

### :building_construction: Tech
- [#6226](https://github.com/1024pix/pix/pull/6226) [TECH] Améliorer les tests sur me "notifier à pole emploi" suite au passage à ESM (PIX-8065)
- [#6257](https://github.com/1024pix/pix/pull/6257) [TECH] Active l'option staticHelpers d'embroider sur mon-pix
- [#6223](https://github.com/1024pix/pix/pull/6223) [TECH] Monter Pix UI en v34.1.0 sur Pix Certif (PIX-7971).
- [#6247](https://github.com/1024pix/pix/pull/6247) [TECH] Supprime la dépendance ember-template-lint a la racine
- [#6102](https://github.com/1024pix/pix/pull/6102) [TECH] Rendre les certifications complémentaires uniques par inscription en certification (PIX-7345).
- [#6240](https://github.com/1024pix/pix/pull/6240) [TECH] Spécifie la version minimale de node 16 sur l'API pour que cela fonctionne
- [#5787](https://github.com/1024pix/pix/pull/5787) [TECH] Utiliser le système de module ESM (PIX-7202)

### :bug: Correction
- [#6241](https://github.com/1024pix/pix/pull/6241) [BUGFIX] Corrige le traitement des taches Pole Emploi (PIX-8079)

### :coffee: Autre
- [#6268](https://github.com/1024pix/pix/pull/6268) [DOC] :memo: Ajout d'un ADR sur la décision de supprimer Gravitee
- [#6255](https://github.com/1024pix/pix/pull/6255) [BUMP] Update dependency @faker-js/faker to v8 (admin)
- [#6254](https://github.com/1024pix/pix/pull/6254) [BUMP] Update dependency @faker-js/faker to v8 (mon-pix)
- [#6253](https://github.com/1024pix/pix/pull/6253) [BUMP] Update dependency @faker-js/faker to v8 (certif)
- [#6191](https://github.com/1024pix/pix/pull/6191) [BUMP] Update dependency ember-template-lint to v5 (mon-pix)
- [#6250](https://github.com/1024pix/pix/pull/6250) [BUMP] Update dependency @faker-js/faker to v8 (orga)
- [#6249](https://github.com/1024pix/pix/pull/6249) [BUMP] Update dependency ember-template-lint to v5 (admin)
- [#6246](https://github.com/1024pix/pix/pull/6246) [BUMP] Update dependency ember-template-lint to v5 (certif)
- [#6244](https://github.com/1024pix/pix/pull/6244) [BUMP] Update embroider monorepo to v3 (certif) (major)
- [#6234](https://github.com/1024pix/pix/pull/6234) [BUMP] Update embroider monorepo to v3 (orga) (major)

## v3.354.0 (22/05/2023)


### :rocket: Amélioration
- [#6221](https://github.com/1024pix/pix/pull/6221) [FEATURE] Traduire la modale de confirmation de finalisation de session sur Pix Certif (PIX-8012).
- [#6196](https://github.com/1024pix/pix/pull/6196) [FEATURE] Traduire le mail des résultats de certification en anglais (PIX-6687).

### :building_construction: Tech
- [#6222](https://github.com/1024pix/pix/pull/6222) [TECH] [Pix Orga] Aligner la double mire sur la maquette et nos standards (PIX-8073)
- [#6230](https://github.com/1024pix/pix/pull/6230) [TECH] Pouvoir switcher entre vieilles et nouvelles seeds grâce à une variable d'environnement (PIX-8104)
- [#6227](https://github.com/1024pix/pix/pull/6227) [TECH] Activer l'option composants statiques d'embroider sur Pix App
- [#6228](https://github.com/1024pix/pix/pull/6228) [TECH] Enrichir les outils "Campagnes" afin de permettre la création à la volée de participants (PIX-7961)

### :bug: Correction
- [#6236](https://github.com/1024pix/pix/pull/6236) [BUGFIX] Affichage de la bonne réponse dans le panneau de correction (PIX-8110)
- [#6231](https://github.com/1024pix/pix/pull/6231) [BUGFIX] Corriger à nouveau la taille du logo Pix sur les pages d'épreuve de Certification (PIX-8033).

## v3.353.0 (17/05/2023)


### :rocket: Amélioration
- [#6224](https://github.com/1024pix/pix/pull/6224) [FEATURE] Extraire la liste des PCs avec paliers par seuil à convertir en niveau depuis le fichier XLS fourni par le PRO (PIX-7860)
- [#6201](https://github.com/1024pix/pix/pull/6201) [FEATURE] Modifier les requêtes en lecture pour utiliser la vue sur les prescrits actifs (PIX-7683)
- [#6198](https://github.com/1024pix/pix/pull/6198) [FEATURE][ADMIN] Permettre la modification de la locale d'un utilisateur (PIX-7358)
- [#6192](https://github.com/1024pix/pix/pull/6192) [FEATURE] Afficher l'heure de fin de session théorique pour le surveillant dans Pix Certif (PIX-7834)
- [#6182](https://github.com/1024pix/pix/pull/6182) [FEATURE] Ajout language switcher sur la double mire de la page d'invitation pour rejoindre certif (PIX-7217)
- [#6210](https://github.com/1024pix/pix/pull/6210) [FEATURE] Améliorer le responsive des résultats des compétences en fin de campagne sur Pix-App (PIX-7972)
- [#6126](https://github.com/1024pix/pix/pull/6126) [FEATURE][ORGA] Ajout du language switcher sur la double mire de connexion/inscription avec invitation (PIX-7743)
- [#6180](https://github.com/1024pix/pix/pull/6180) [FEATURE] Afficher une notification de confirmation lors du changement de langue sur Pix App > Mon compte (PIX-7893).
- [#6188](https://github.com/1024pix/pix/pull/6188) [FEATURE] Ajout d'aléatoire dans le choix des épreuves de l'algorithme flash (PIX-7997).
- [#6189](https://github.com/1024pix/pix/pull/6189) [FEATURE] Empêcher la validation si deux réponses ne sont pas cochés pour les QCM sur Pix-App (PIX-7973)
- [#6197](https://github.com/1024pix/pix/pull/6197) [FEATURE] Amélioration de message de validation de suppression d'une participation (PIX-8049)
- [#6146](https://github.com/1024pix/pix/pull/6146) [FEATURE] Permettre de sélectionner l'envoi multiple pour les campagnes d'évaluation dans pix orga (PIX-7473)
- [#6181](https://github.com/1024pix/pix/pull/6181) [FEATURE] Uniformiser le formulaire de signalement sur Pix-App (PIX-7711)

### :building_construction: Tech
- [#6212](https://github.com/1024pix/pix/pull/6212) [TECH][Pix Orga] Ne pas modifier la langue de l'utilisateur quand le paramètre lang se trouve dans l'url (PIX-8009)
- [#6219](https://github.com/1024pix/pix/pull/6219) [TECH] Fournir des outils génériques et documentés orientés "Profil Utilisateur" (PIX-7960)
- [#6213](https://github.com/1024pix/pix/pull/6213) [TECH] Tracer les événements wip de pg-boss
- [#6172](https://github.com/1024pix/pix/pull/6172) [TECH] Fournir des outils génériques et documentés orientés "sessions de certification" (PIX-7980)
- [#6209](https://github.com/1024pix/pix/pull/6209) [TECH] Met à jour ember-cli-notifications pour corriger les tests dans le navigateur
- [#6179](https://github.com/1024pix/pix/pull/6179) [TECH][MON-PIX] Ne pas modifier la langue de l'utilisateur quand le paramètre lang se trouve dans l'url (PIX-7851)
- [#6208](https://github.com/1024pix/pix/pull/6208) [TECH] Utilise la version v1 de l'action notify-file-change
- [#6178](https://github.com/1024pix/pix/pull/6178) [TECH] Éviter les imports dupliqués sur Pix App (PIX-8018)
- [#6200](https://github.com/1024pix/pix/pull/6200) [TECH] Script pour récupérer des profil cibles / clés de lectures / certifications complémentaires depuis une base existante et transformer en dump pour les seeds (PIX-8059)
- [#6195](https://github.com/1024pix/pix/pull/6195) [TECH] Améliorer les tests sur la vérification d'accès à un assessment.

### :bug: Correction
- [#6220](https://github.com/1024pix/pix/pull/6220) [BUGFIX] Corriger l'affichage de la partie "J'ai déjà un compte" sur la double mire Pix Orga (PIX-8086)
- [#6173](https://github.com/1024pix/pix/pull/6173) [BUGFIX] Affichage du temps majoré dans la liste des candidats de Pix Certif. (PIX-8008)
- [#6199](https://github.com/1024pix/pix/pull/6199) [BUGFIX] Améliorer le responsive du select dans le formulaire de signalement (PIX-8056)
- [#6205](https://github.com/1024pix/pix/pull/6205) [BUGFIX] La notification de changement de configuration ne fonctionne toujours pas
- [#6204](https://github.com/1024pix/pix/pull/6204) [BUGFIX] La notification de changement de configuration ne fonctionne plus
- [#6203](https://github.com/1024pix/pix/pull/6203) [BUGFIX] L'envoi de message échoue car le nom du channel est utilisé à la place de l'identifiant

### :coffee: Autre
- [#6216](https://github.com/1024pix/pix/pull/6216) [BUMP] Update dependency uuid to v9 (test-algo)
- [#6215](https://github.com/1024pix/pix/pull/6215) [BUMP] Update dependency uuid to v9 (api)
- [#6207](https://github.com/1024pix/pix/pull/6207) [BUMP] Update dependency @1024pix/stylelint-config to v3 (admin)
- [#6206](https://github.com/1024pix/pix/pull/6206) [BUMP] Update dependency @1024pix/stylelint-config to v3 (mon-pix)
- [#6186](https://github.com/1024pix/pix/pull/6186) [BUMP] Update dependency stylelint to v15 (orga)
- [#6187](https://github.com/1024pix/pix/pull/6187) [BUMP] Update dependency stylelint to v15 (pix1d)
- [#6185](https://github.com/1024pix/pix/pull/6185) [BUMP] Update dependency stylelint to v15 (certif)

## v3.352.0 (11/05/2023)


### :rocket: Amélioration
- [#6150](https://github.com/1024pix/pix/pull/6150) [FEATURE] Ordre aléatoire pour les propositions de QCU/QCM (PIX-7736)
- [#6160](https://github.com/1024pix/pix/pull/6160) [FEATURE] Amélioration de message de validation de suppression d'une participation (PIX-5625)
- [#6137](https://github.com/1024pix/pix/pull/6137) [FEATURE] Vérification de l'égilibité des candidats à une certif compl. dans l'espace surveillant (PIX-7833).
- [#6177](https://github.com/1024pix/pix/pull/6177) [FEATURE] Suppression de toutes références à Gravitee (PIX-7940)
- [#6096](https://github.com/1024pix/pix/pull/6096) [FEATURE] Afficher un bouton de confirmation de présence dans l'espace surveillant sur Pix Certif (PIX-7832)
- [#6156](https://github.com/1024pix/pix/pull/6156) [FEATURE][MON-PIX] Ajouter le sélecteur de langue sur la page de présentation d'une campagne (PIX-7744)
- [#6154](https://github.com/1024pix/pix/pull/6154) [FEATURE] Désactiver le bouton Effacer les filtres lorsqu'aucun fitre n'est activé (Pix-7970)
- [#6104](https://github.com/1024pix/pix/pull/6104) [FEATURE] Amélioration de la page de détails des profils cibles (PIX-7907)
- [#6078](https://github.com/1024pix/pix/pull/6078) [FEATURE] Améliorer les tests sur Pix App avec Testing Library (part 3) (PIX-7870).

### :building_construction: Tech
- [#6149](https://github.com/1024pix/pix/pull/6149) [TECH] Implementation d'un Domain Model CorrectionBlockQRCOMDep (PIX-8012)
- [#6082](https://github.com/1024pix/pix/pull/6082) [TECH] Supprime la dépendance ember-cli-sri des apps embroider
- [#6157](https://github.com/1024pix/pix/pull/6157) [TECH] Utilise exclusivement l'API history dans les apps Ember
- [#6176](https://github.com/1024pix/pix/pull/6176) [TECH] Utiliser la méthode `visit` d'`ember-testing-library` plutôt que celle de `@ember/test-helpers` (PIX-8017)
- [#6162](https://github.com/1024pix/pix/pull/6162) [TECH] montée de version pix-ui : 34.1.0 (PIX-7899)
- [#6166](https://github.com/1024pix/pix/pull/6166) [TECH] Fournir des outils génériques et documentés orientés "Organisations" et "Centres de certification" (PIX-7995)

### :bug: Correction
- [#6193](https://github.com/1024pix/pix/pull/6193) [BUGFIX] Corrige la media query
- [#6153](https://github.com/1024pix/pix/pull/6153) [BUGFIX] Erreur lors ajout individuel d'un 2ème candidat à une session de certification sur Pix Certif (PIX-7935).

### :coffee: Autre
- [#6131](https://github.com/1024pix/pix/pull/6131) [BUMP] Update dependency stylelint to v15 (mon-pix)
- [#6169](https://github.com/1024pix/pix/pull/6169) [BUMP] Update dependency stylelint to v15 (admin)
- [#6183](https://github.com/1024pix/pix/pull/6183) [BUMP] Update dependency ember-simple-auth to v5 (admin)
- [#6164](https://github.com/1024pix/pix/pull/6164) [BUMP] Update dependency ember-simple-auth to v5 (orga)
- [#6174](https://github.com/1024pix/pix/pull/6174) [BUMP] Update dependency ember-simple-auth to v5 (certif)
- [#6168](https://github.com/1024pix/pix/pull/6168) [BUMP] Update eslint (major)
- [#5995](https://github.com/1024pix/pix/pull/5995) [BUMP] Update dependency ember-simple-auth to v5 (mon-pix)

## v3.351.0 (09/05/2023)


### :rocket: Amélioration
- [#6143](https://github.com/1024pix/pix/pull/6143) [FEATURE] Modifier le tri des participations d'un utilisateur pour les regrouper par code campagne (PIX-5389)
- [#6148](https://github.com/1024pix/pix/pull/6148) [FEATURE] Affiche la date de création des profil cibles dans la liste sur PixAdmin (PIX-7947)
- [#6144](https://github.com/1024pix/pix/pull/6144) [FEATURE] Ajouter le sélecteur de langue sur la page app.pix.org/campagnes (PIX-7216)
- [#6113](https://github.com/1024pix/pix/pull/6113) [FEATURE] Ajouter un sélecteur de langue sur la page connexion de Pix Orga domaine international (PIX-5604)

### :building_construction: Tech
- [#6163](https://github.com/1024pix/pix/pull/6163) [TECH] Utiliser la méthode `render` d'`ember-testing-library` plutôt que celle de `@ember/test-helpers` (PIX-7998)
- [#6165](https://github.com/1024pix/pix/pull/6165) [TECH] Déplacer les données en commun des seeds dans un fichier dédié (PIX-7996)
- [#6161](https://github.com/1024pix/pix/pull/6161) [TECH] Supprime la dépendance ember-collapsible-panel
- [#6117](https://github.com/1024pix/pix/pull/6117) [TECH] Appeler session.setup de ember-simple-auth dans la route de l'application
- [#6159](https://github.com/1024pix/pix/pull/6159) [TECH] Mise à jour de faker en v7
- [#6155](https://github.com/1024pix/pix/pull/6155) [TECH] Compléter et documenter les outils génériques pour la création de contenus formatifs dans les seeds (PIX-7959)
- [#6152](https://github.com/1024pix/pix/pull/6152) [TECH] Compléter et documenter les outils génériques pour la création de campagne dans les seeds (PIX-7959)
- [#6130](https://github.com/1024pix/pix/pull/6130) [TECH] Met à jour vers @faker-js/faker
- [#6147](https://github.com/1024pix/pix/pull/6147) [TECH] Compléter et documenter les outils génériques pour la création de profil cibles et clés de lecture dans les seeds (PIX-7951)
- [#6074](https://github.com/1024pix/pix/pull/6074) [TECH] Uniformiser les vérifications joi pour l'import candidat (PIX-7859)
- [#6127](https://github.com/1024pix/pix/pull/6127) [TECH] Mettre à jour les urls de certaines Orga ayant des tags (PIX-7928)
- [#6136](https://github.com/1024pix/pix/pull/6136) [TECH] Centraliser le code permettant de changer de locales dans localeService (PIX-7922).

### :bug: Correction
- [#6138](https://github.com/1024pix/pix/pull/6138) [BUGFIX] Affichage du temps majoré dans l'Espace Surveillant (PIX-7835)

### :coffee: Autre
- [#6158](https://github.com/1024pix/pix/pull/6158) [BUMP] Update browser-tools orb to v1.4.1 (.circleci)
- [#6142](https://github.com/1024pix/pix/pull/6142) [BUMP] Update nginx Docker tag to v1.24.0

## v3.350.0 (04/05/2023)


### :rocket: Amélioration
- [#6134](https://github.com/1024pix/pix/pull/6134) [FEATURE] Suppression des références Gravitee  (PIX-7909)
- [#6095](https://github.com/1024pix/pix/pull/6095) [FEATURE] Ajouter des liens vers la doc de création de contenu formatif (PIX-7881).
- [#6123](https://github.com/1024pix/pix/pull/6123) [FEATURE] Utiliser les design tokens de typographie pour l'entête des épreuves (PIX-7779)
- [#6120](https://github.com/1024pix/pix/pull/6120) [FEATURE] Ajouter une méthode au solution-service-qrcom-dep pour avoir le résultat complet (PIX-7865)
- [#6105](https://github.com/1024pix/pix/pull/6105) [FEATURE] Trier les profiles cibles dans PixAdmin par status puis par nom (PIX-7913)

### :building_construction: Tech
- [#6084](https://github.com/1024pix/pix/pull/6084) [TECH] Permet de configurer le proxy de l'API des fronts pix vers une release de test  (PIX-7880)
- [#6116](https://github.com/1024pix/pix/pull/6116) [TECH] Tester unitairement le use-case sessions-mass-import
- [#6122](https://github.com/1024pix/pix/pull/6122) [TECH] Ajouter une erreur de lint si `render` ou `find` ne sont pas importés depuis `@1024pix/ember-testing-library` (PIX-7926)
- [#6101](https://github.com/1024pix/pix/pull/6101) [TECH] Mise à jour de la langue utilisateur depuis le controller language (PIX-7871)
- [#6124](https://github.com/1024pix/pix/pull/6124) [TECH] - Mettre en place l'injection de dépendances pour les cas restants
- [#6106](https://github.com/1024pix/pix/pull/6106) [TECH] Renvoyer une erreur 422 au lieu d'une erreur 503 quand l'appel à la route /token de l'idp échoue (PIX-7915) 

### :bug: Correction
- [#6125](https://github.com/1024pix/pix/pull/6125) [BUGFIX] Améliorer la lecture d'écran des boutons d'action d'une épreuve (PIX-7920)
- [#6100](https://github.com/1024pix/pix/pull/6100) [BUGFIX] Empêcher le scrollTop lors de l'utilisation d'un filtre/pagination (PIX-7912)

### :coffee: Autre
- [#6133](https://github.com/1024pix/pix/pull/6133) [BUMP] Update dependency p-queue to v7 (mon-pix)
- [#6132](https://github.com/1024pix/pix/pull/6132) [BUMP] Update dependency p-queue to v7 (certif)
- [#6129](https://github.com/1024pix/pix/pull/6129) [BUMP] Update dependency p-queue to v7 (admin)
- [#6121](https://github.com/1024pix/pix/pull/6121) [BUMP] Update dependency ember-click-outside to v6 (orga)

## v3.349.0 (02/05/2023)


### :rocket: Amélioration
- [#6037](https://github.com/1024pix/pix/pull/6037) [FEATURE] Activer/Désactiver l'envoi multiple pour les campagnes d'évaluation d'une Organization dans Pix Admin (PIX-7476)
- [#6088](https://github.com/1024pix/pix/pull/6088) [FEATURE] Afficher la certif. complémentaire sur l'espace surveillant (PIX-7831).
- [#6062](https://github.com/1024pix/pix/pull/6062) [FEATURE] Ajouter le language switcher sur la page de connexion de Pix App (PIX-7214)

### :building_construction: Tech
- [#6119](https://github.com/1024pix/pix/pull/6119) [TECH] Injection de dépendances dans les models pour préparer la migration ESM
- [#6103](https://github.com/1024pix/pix/pull/6103) [TECH] Renommage de enroll en enrol (PIX-7906).
- [#6109](https://github.com/1024pix/pix/pull/6109) [TECH] Injection de dépendances pour préparer la migration ESM - Suite
- [#6094](https://github.com/1024pix/pix/pull/6094) [TECH] Nettoyage du code inutile lié à l'usage des target-profiles_skills (PIX-6696)
- [#6036](https://github.com/1024pix/pix/pull/6036) [TECH] S'aligner sur les standards utilisés sur Certif dans Pix App, concernant i18N(PIX-7556)
- [#6098](https://github.com/1024pix/pix/pull/6098) [TECH] Injection de dépendances pour préparer la migration ESM
- [#6097](https://github.com/1024pix/pix/pull/6097) [TECH] Injection de dépendances pour préparer la migration ESM
- [#6018](https://github.com/1024pix/pix/pull/6018) [TECH] Ajout du lint sur les fichiers de traduction de Certif (PIX-7807).

### :bug: Correction
- [#6107](https://github.com/1024pix/pix/pull/6107) [BUGFIX] Les menus de navigation sur Admin ne sont pas en surbrillances quand on est dans une sous page (PIX-7914)
- [#6099](https://github.com/1024pix/pix/pull/6099) [BUGFIX] Le rechargement d'un embed n'émet aucun evènement (PIX-7887)
- [#5645](https://github.com/1024pix/pix/pull/5645) [BUGFIX] Écran de fin de campagne flash : crash si épreuves périmées/archivées (PIX-7106)

### :coffee: Autre
- [#6111](https://github.com/1024pix/pix/pull/6111) [BUMP] Update Slashgear/action-check-pr-title action to v4.3.0 (workflows)
- [#6110](https://github.com/1024pix/pix/pull/6110) [BUMP] Update dependency eslint to v8 (mon-pix)
- [#6092](https://github.com/1024pix/pix/pull/6092) [FEAUTRE] Afficher "Terminé" sur une participation partagé pour une campagne archivé (PIX-5626)

## v3.348.0 (27/04/2023)


### :rocket: Amélioration
- [#5858](https://github.com/1024pix/pix/pull/5858) [FEATURE] Import d'une liste de candidats via l'.ods en anglais (PIX-6685)
- [#6091](https://github.com/1024pix/pix/pull/6091) [FEATURE] Monter la version de pixUI en v33.1  sur PixOrga (PIX-7894)
- [#6090](https://github.com/1024pix/pix/pull/6090) [FEATURE] Permettre à l'utilisateur de modifier l'url vers l'image du profil cible (PIX-7863)
- [#5991](https://github.com/1024pix/pix/pull/5991) [FEATURE] Afficher Pix Orga dans la langue de l'utilisateur enregistrée dans son compte (PIX-5766)
- [#6060](https://github.com/1024pix/pix/pull/6060) [FEATURE] Changer la couleur des icônes "?" dans la section avec le graphique “statuts” des participations
- [#6052](https://github.com/1024pix/pix/pull/6052) [FEATURE] Upgrade pixUI version to latest (v32.0.0) on pixAdmin (PIX-7844)
- [#6054](https://github.com/1024pix/pix/pull/6054) [FEATURE] Upgrade pix-ui version to 32.0.0 (PIX-7843)
- [#6075](https://github.com/1024pix/pix/pull/6075) [FEATURE] Afficher l'image du profil cible dans l'encart de détails sur PixAdmin (PIX-7129)

### :building_construction: Tech
- [#6093](https://github.com/1024pix/pix/pull/6093) [TECH] Utiliser le test helper mockLearningContent  à la place de sinon.stub quand c'est nécessaire
- [#6047](https://github.com/1024pix/pix/pull/6047) [TECH] Suppression du feature toggle de la recuperation des resultats pour les centres de certifications habilités (PIX-7828).
- [#6076](https://github.com/1024pix/pix/pull/6076) [TECH] Injecter les dépendances dans le use-case `start-writing-campaign-assessment-results-to-stream` pour préparer la migration ESM
- [#6081](https://github.com/1024pix/pix/pull/6081) [TECH] Mettre en place l'injection de dépendance pour la migration ESM
- [#6079](https://github.com/1024pix/pix/pull/6079) [TECH] Injection de dépendances pour préparer la migration ESM
- [#6080](https://github.com/1024pix/pix/pull/6080) [TECH] Injecter des dépendances pour préparer la migration ESM

### :bug: Correction
- [#6086](https://github.com/1024pix/pix/pull/6086) [BUGFIX] Afficher toutes les compétences lors de la sélection de tubes sur Pix Admin (PIX-7882).
- [#6087](https://github.com/1024pix/pix/pull/6087) [BUGFIX] Changer le wording de la pop up "Quitter" dans une épreuve PixApp (PIX-7839).
- [#6053](https://github.com/1024pix/pix/pull/6053) [BUGFIX] Corriger la width des form-field info sur la page de création de campagne (PIX-7846)
- [#6056](https://github.com/1024pix/pix/pull/6056) [BUGFIX] Retirer le scroll automatique lors de l'utilisation d'un filtre sur Pix Orga (PIX-7850)

## v3.347.0 (25/04/2023)


### :rocket: Amélioration
- [#6026](https://github.com/1024pix/pix/pull/6026) [FEATURE] Ajouter un language switcher sur la page d'inscription de Pix App (PIX-7742)
- [#6025](https://github.com/1024pix/pix/pull/6025) [FEATURE] Empêcher validation et création des sessions en masse pour les centres sco isManagingStudent (PIX-7775)
- [#6041](https://github.com/1024pix/pix/pull/6041) [FEATURE] Empêcher l'import en masse pour un centre SCO isNotManagingStudent utilisant un modèle csv SUP/PRO (PIX-7774)
- [#5975](https://github.com/1024pix/pix/pull/5975) [FEATURE] Permettre au service CPF de renvoyer plusieurs erreurs (PIX-7727)
- [#6057](https://github.com/1024pix/pix/pull/6057) [FEATURE] remplacement du palier 1 par un booléen premier acquis (PIX-7787)
- [#6039](https://github.com/1024pix/pix/pull/6039) [FEATURE] Traduction du date picker de création et de modification de session (PIX-7811).

### :building_construction: Tech
- [#6059](https://github.com/1024pix/pix/pull/6059) [TECH] Assurer la cohérence de données lors de la MAJ d'un déclencheur de contenu formatif (PIX-7852).
- [#6069](https://github.com/1024pix/pix/pull/6069) [TECH] Supprimer les colonnes non utilisées de la table `trainings`(PIX-7857).
- [#6071](https://github.com/1024pix/pix/pull/6071) [TECH] Ajout du feature toggle isDifferentiatedTimeInvigilatorPortalEnabled pour Pix Certif (PIX-7830).
- [#6073](https://github.com/1024pix/pix/pull/6073) [TECH] Corrige un mauvais import dans pix-admin
- [#6072](https://github.com/1024pix/pix/pull/6072) [TECH] Mise à jour de dépendances sur pix-admin
- [#6070](https://github.com/1024pix/pix/pull/6070) [TECH] Supprime popper.js de admin
- [#6058](https://github.com/1024pix/pix/pull/6058) [TECH] Migrer les tests vers ember-cli-htmlbars
- [#6055](https://github.com/1024pix/pix/pull/6055) [TECH] Annule les mises à jour d'ember-cookies
- [#6040](https://github.com/1024pix/pix/pull/6040) [TECH] Afficher un message explicite à l'utilisateur lorsque l'API retourne une erreur sur Pix Certif (PIX-7673).
- [#6015](https://github.com/1024pix/pix/pull/6015) [TECH] Supprimer le FT lié aux recommandations des CF (PIX-7805).
- [#6020](https://github.com/1024pix/pix/pull/6020) [TECH][ADMIN] Montée de version de Pix UI en v31.1.0 (PIX-7784)
- [#6028](https://github.com/1024pix/pix/pull/6028) [TECH] Tester la stack Scalingo 22

### :bug: Correction
- [#6003](https://github.com/1024pix/pix/pull/6003) [BUGFIX] Ne plus appeler le provider de mail lors de l'exécution des tests (PIX-7783)
- [#6077](https://github.com/1024pix/pix/pull/6077) [BUGFIX] Permettre la création de CF (PIX-7869).
- [#6061](https://github.com/1024pix/pix/pull/6061) [BUGFIX] Supprimer la mauvaise vérification d'un doublon de candidat lors d'un import en masse de sessions sur Pix Certif (PIX-7838).
- [#6021](https://github.com/1024pix/pix/pull/6021) [BUGFIX] Pix certif double scrollbar sur la liste des sessions (PIX-7413)

### :coffee: Autre
- [#6050](https://github.com/1024pix/pix/pull/6050) [BUMP] Update dependency ember-cookies to v1 (orga)
- [#6051](https://github.com/1024pix/pix/pull/6051) [BUMP] Update dependency concurrently to v8 (pix1d)

## v3.346.0 (24/04/2023)


### :rocket: Amélioration
- [#6038](https://github.com/1024pix/pix/pull/6038) [FEATURE] Empêcher l'entrée à la tabulation sur l'embed si le simulateur n'est pas lancé sur Pix-App (PIX-7826)
- [#6046](https://github.com/1024pix/pix/pull/6046) [FEATURE] Expliquer l'obtention du palier 1er acquis lors du survol du bouton d'ajout de palier premier acquis (PIX-6517)
- [#6043](https://github.com/1024pix/pix/pull/6043) [FEATURE] Pouvoir ajouter un palier "1er acquis" à la collection des paliers d'un profil cible (PIX-7334)
- [#6029](https://github.com/1024pix/pix/pull/6029) [FEATURE] Harmonisation de la page de création de campagne (PIX-7663)
- [#6022](https://github.com/1024pix/pix/pull/6022) [FEATURE] Création d'une vue pour l'affichage des prescrits actifs (PIX-7682).
- [#6019](https://github.com/1024pix/pix/pull/6019) [FEATURE] Amélioration visuelle des consignes des écrans d'épreuve et de l'espacement en générale sur Pix-App (PIX-7716)
- [#6031](https://github.com/1024pix/pix/pull/6031) [FEATURE] Pouvoir re-choisir son type de palier quand on supprime tous les paliers, le palier zéro en dernier (PIX-7680)
- [#6000](https://github.com/1024pix/pix/pull/6000) [FEATURE] Amélioration A11y du fil d'Ariane d'import massif de sessions (PIX-7350)
- [#6032](https://github.com/1024pix/pix/pull/6032) [FEATURE] align left header info content (PIX-7661)
- [#5998](https://github.com/1024pix/pix/pull/5998) [FEATURE] Modifier l'icône de l'IndicatorCard Profils reçus pour coller à la maquette (PIX-7660)
- [#6023](https://github.com/1024pix/pix/pull/6023) [FEATURE] Agrandissement de la font du composant fil d'ariane (PIX-7659).

### :building_construction: Tech
- [#6045](https://github.com/1024pix/pix/pull/6045) [TECH] Injecter les dépendances dans les use-cases pour préparer la migration ESM (épisode 357)
- [#6044](https://github.com/1024pix/pix/pull/6044) [TECH] Montée de version de Artillery en 2.0.0
- [#5967](https://github.com/1024pix/pix/pull/5967) [TECH] Ajoute un ADR sur la suppression des prescrits avec une vue SQL (PIX-7645)
- [#6010](https://github.com/1024pix/pix/pull/6010) [TECH][ORGA] Montée de version de Pix UI en v31.1.0 (PIX-7781)
- [#6035](https://github.com/1024pix/pix/pull/6035) [TECH] Wrapper les controllers et les constantes du domaine
- [#6034](https://github.com/1024pix/pix/pull/6034) [TECH] Injecter les dépendances pour préparer la migration ESM
- [#6030](https://github.com/1024pix/pix/pull/6030) [TECH] Amélioration du HTML de l'import en masse (PIX-7813).
- [#6024](https://github.com/1024pix/pix/pull/6024) [TECH] Mettre à jour le package. json (PIX-7816)
- [#5938](https://github.com/1024pix/pix/pull/5938) [TECH] Refacto pour persister les paliers en un seul appel sur PixAdmin (PIX-7222)

### :bug: Correction
- [#6033](https://github.com/1024pix/pix/pull/6033) [BUGFIX] Mettre en anglais la traduction anglaise de la légende des filtres sur la liste de campagnes (PIX-7729)
- [#6027](https://github.com/1024pix/pix/pull/6027) [BUGFIX] Correction des marges des pages de checkpoints et résultats (PIX-7818).

### :coffee: Autre
- [#6049](https://github.com/1024pix/pix/pull/6049) [BUMP] Update dependency ember-cookies to v1 (certif)
- [#6048](https://github.com/1024pix/pix/pull/6048) [BUMP] Update dependency ember-cookies to v1 (mon-pix)

## v3.345.0 (20/04/2023)


### :rocket: Amélioration
- [#5948](https://github.com/1024pix/pix/pull/5948) [FEATURE] Afficher Pix Certif dans la langue de l'utilisateur enregistrée dans son compte (PIX-7644)
- [#6013](https://github.com/1024pix/pix/pull/6013) [FEATURE] Ajouter une nouvelle bannière pour la période de certification (PIX-7665).
- [#6011](https://github.com/1024pix/pix/pull/6011) [FEATURE] Amélioration visuelle des boutons d'action des écrans d'épreuve (PIX-7718).
- [#5951](https://github.com/1024pix/pix/pull/5951) [FEATURE] Pix1D - Afficher une épreuve de type embed
- [#6004](https://github.com/1024pix/pix/pull/6004) [FEATURE] Modification du wording des statuts des contenus formatifs (PIX-7785)
- [#6008](https://github.com/1024pix/pix/pull/6008) [FEATURE] Ajouter une boîte de dialogue de confirmation de sortie d'une campagne (PIX-7720).
- [#6001](https://github.com/1024pix/pix/pull/6001) [FEATURE] Imposer la majuscule sur la valeur lors de l'import en masse des sessions sur Pix Certif (PIX-7755).
- [#6005](https://github.com/1024pix/pix/pull/6005) [FEATURE] Traduction de la bannière de communication sur Pix Certif (PIX-6689).
- [#5983](https://github.com/1024pix/pix/pull/5983) [FEATURE] Ajout d'une migration pour creer les colonnes deletedAt & deletedBy sur la table organization-learners (PIX-7681).

### :building_construction: Tech
- [#6012](https://github.com/1024pix/pix/pull/6012) [TECH][CERTIF] Montée de version de Pix UI en v31.1.0 (PIX-7782)
- [#6007](https://github.com/1024pix/pix/pull/6007) [TECH][MON-PIX] Montée de version de Pix UI en v31.1.0 (PIX-7780)
- [#6014](https://github.com/1024pix/pix/pull/6014) [TECH] Aligner la version de Node entre les front (PIX-7803)
- [#6006](https://github.com/1024pix/pix/pull/6006) [TECH] Utiliser les imports miragejs plutôt que ember-cli-mirage

### :bug: Correction
- [#6016](https://github.com/1024pix/pix/pull/6016) [BUGFIX] Corriger l'espacement avant la pagination dans la page "Mes formations" (PIX-7806).

## v3.344.0 (18/04/2023)


### :rocket: Amélioration
- [#6009](https://github.com/1024pix/pix/pull/6009) [FEATURE] Mise à jour des RTs des profils cibles Pix+Edu (PIX-7776)
- [#5986](https://github.com/1024pix/pix/pull/5986) [FEATURE] Montée de version de Pix UI en v31.0.0 sur Pix App (PIX-7748)
- [#5989](https://github.com/1024pix/pix/pull/5989) [FEATURE] Afficher le statut d'un CF sur Pix Admin (PIX-7752).

### :building_construction: Tech
- [#5973](https://github.com/1024pix/pix/pull/5973) [TECH] Traduction de la modale d'ajout de signalement (PIX-6677).
- [#5996](https://github.com/1024pix/pix/pull/5996) [TECH] Mise à jour de eslint-plugin-i18n-json en 4.0.0
- [#5918](https://github.com/1024pix/pix/pull/5918) [TECH] Retrait du code lié à l'ancienne gestion des PCs et de ses clés de lecture sur PixAdmin (PIX-7631)

### :bug: Correction
- [#5990](https://github.com/1024pix/pix/pull/5990) [BUGFIX] Permettre à un centre SCO qui ne gère pas d'élèves à importer en masse des sessions sur Pix Certif (PIX-7709).
- [#5889](https://github.com/1024pix/pix/pull/5889) [BUGFIX] Ajouter les traductions pour les champs en erreur dans les formulaires de création et modification de session (PIX-7157).

### :coffee: Autre
- [#5993](https://github.com/1024pix/pix/pull/5993) [BUMP] Replace dependency babel-eslint with @babel/eslint-parser ^7.11.0 (pix1d)

## v3.343.0 (17/04/2023)


### :rocket: Amélioration
- [#5982](https://github.com/1024pix/pix/pull/5982) [FEATURE] Améliorer le design de l'entête des épreuves sur Pix-App (PIX-7715)
- [#5992](https://github.com/1024pix/pix/pull/5992) [FEATURE] Amélioration de la compréhension des en-têtes du CSV d'import en masse (PIX-6655).
- [#5970](https://github.com/1024pix/pix/pull/5970) [FEATURE] Améliorer les tests de Pix App avec Testing Library (PIX-7712).
- [#5985](https://github.com/1024pix/pix/pull/5985) [FEATURE] Visualiser si un CF est actif ou non depuis la liste des CF d'un PC sur Pix Admin (PIX-7745).
- [#5981](https://github.com/1024pix/pix/pull/5981) [FEATURE] Visualiser si un CF est actif ou non depuis la liste sur Pix Admin (PIX-7741).
- [#5963](https://github.com/1024pix/pix/pull/5963) [FEATURE] Filtrer par id ou titre le tableau des contenus formatifs (PIX-7391).
- [#5931](https://github.com/1024pix/pix/pull/5931) [FEATURE] ajout de caption aux tableaux (PIX-5083)
- [#5944](https://github.com/1024pix/pix/pull/5944) [FEATURE] Pour un user qui se connecte à Pix Orga via invitation, si le cookie de la locale est dispo, alors enregistrer cette locale (PIX-7407)
- [#5972](https://github.com/1024pix/pix/pull/5972) [FEATURE] Traduire la modale de fermeture de l'espace surveillant sur Pix Certif (PIX-7674).
- [#5950](https://github.com/1024pix/pix/pull/5950) [FEATURE] Affichage des contenus formatifs liés à un profil cible sur Pix Admin (PIX-7392).
- [#5965](https://github.com/1024pix/pix/pull/5965) [FEATURE] Améliorer l'a11y du formulaire de signalisation de problème (PIX-5782)
- [#5964](https://github.com/1024pix/pix/pull/5964) [FEATURE] Ajout d'erreurs pour l'import de sessions en masse (PIX-7448)
- [#5946](https://github.com/1024pix/pix/pull/5946) [FEATURE] Ajouter la clé pour Activer l'envoi multiple sur les campagnes d'évaluation d'une organisation (PIX-7464)
- [#5751](https://github.com/1024pix/pix/pull/5751) [FEATURE] Améliorer les tests sur Pix App avec Testing Library (PIX-7131).
- [#5961](https://github.com/1024pix/pix/pull/5961) [FEATURE] Utiliser les nouvelles classes css de Pix UI pour les titres de la page des cgu sur Pix Certif (PIX-7703).

### :building_construction: Tech
- [#5999](https://github.com/1024pix/pix/pull/5999) [TECH] Supprime ember-cli-terser des applications qui utilisent embroider
- [#5988](https://github.com/1024pix/pix/pull/5988) [TECH] Montée de version de Pix UI en v31.0.0 sur Pix-Certif (PIX-7753).
- [#5796](https://github.com/1024pix/pix/pull/5796) [TECH] Migrer mon-pix sur embroider
- [#5984](https://github.com/1024pix/pix/pull/5984) [TECH] Faire de l'injection de dépendance dans les controllers (part-5)
- [#5893](https://github.com/1024pix/pix/pull/5893) [TECH] Migre orga sur embroider
- [#5979](https://github.com/1024pix/pix/pull/5979) [TECH] Faire de l'injection de dépendance dans les controllers (part-4)
- [#5978](https://github.com/1024pix/pix/pull/5978) [TECH] Faire de l'injection de dépendance dans les controllers (part-3)
- [#5974](https://github.com/1024pix/pix/pull/5974) [TECH] Faire de l'injection de dépendance dans les controllers (part-2)
- [#5971](https://github.com/1024pix/pix/pull/5971) [TECH] Faire de l'injection de dépendance dans les controllers (part-1)
- [#5968](https://github.com/1024pix/pix/pull/5968) [TECH] Aligner la signature de `buildLearningContent` avec les vrais clés i18n du référentiel
- [#5901](https://github.com/1024pix/pix/pull/5901) [TECH] Remplacer l'utilisation de bookshelf dans certains repositories
- [#5969](https://github.com/1024pix/pix/pull/5969) [TECH] Le CHANGELOG de la v3.242.0 est erroné (PIX-7730)

### :bug: Correction
- [#5987](https://github.com/1024pix/pix/pull/5987) [BUGFIX] Enlever les noms accessibles sur les résultats par compétences en fin de campagne sur Pix-App (PIX-7267)
- [#5980](https://github.com/1024pix/pix/pull/5980) [BUGFIX] Remplacement de mot dans le nom de ville alternatif (PIX-7734)
- [#5976](https://github.com/1024pix/pix/pull/5976) [BUGFIX] Permettre d'utiliser l'autofill sur les pages d'inscription de Pix App-Certif-Orga (PIX-7685)

### :coffee: Autre
- [#5994](https://github.com/1024pix/pix/pull/5994) [BUMP] Update Node.js to v14.21.3 (e2e)
- [#5791](https://github.com/1024pix/pix/pull/5791) [BUMP] Update dependency knex to 2.4.0 [SECURITY]
- [#5960](https://github.com/1024pix/pix/pull/5960) [BUMP] Update hapijs monorepo (api) (major)

## v3.342.0 (12/04/2023)


### :rocket: Amélioration
- [#5935](https://github.com/1024pix/pix/pull/5935) [FEATURE] Ajouter le logo FWB et lien vers SSO FWB sur la page de app.pix.org/connexion (PIX-7253)
- [#5936](https://github.com/1024pix/pix/pull/5936) [FEATURE] Montée de version pix-ui@v30.0.0 sur Admin (PIX-7642)
- [#5949](https://github.com/1024pix/pix/pull/5949) [FEATURE] Améliorer l'affichage du nom de l'organisation dans le menu sur Pix Orga (PIX-7662)
- [#5959](https://github.com/1024pix/pix/pull/5959) [FEATURE] Améliorer le message d'erreur lorsque le fichier d'import en masse de session est vide sur Pix Certif (PIX-7672).

### :building_construction: Tech
- [#5921](https://github.com/1024pix/pix/pull/5921) [TECH] Permettre la génération d'un grand nombre de fichers CPF (PIX-7580)
- [#5953](https://github.com/1024pix/pix/pull/5953) [BUMP] Update dependency xml2js to 0.5.0 [SECURITY]
- [#5954](https://github.com/1024pix/pix/pull/5954) [BUMP] Update dependency ember-resolver to v10 (admin)
- [#5955](https://github.com/1024pix/pix/pull/5955) [BUMP] Update dependency ember-qunit to v6 (admin)
- [#5956](https://github.com/1024pix/pix/pull/5956) [BUMP] Update dependency ember-keyboard to v8 (certif)
- [#5958](https://github.com/1024pix/pix/pull/5958) [BUMP] Update dependency ember-exam to v8 (admin)
- [#5962](https://github.com/1024pix/pix/pull/5962) [TECH] Remplacement de boom a @hapi/boom

### :bug: Correction
- [#5917](https://github.com/1024pix/pix/pull/5917) [BUGFIX] Corriger l'affichage de la modale d'inscription d'un candidat sur Pix Certif (PIX-7630)
- [#5947](https://github.com/1024pix/pix/pull/5947) [BUGFIX] Ajouter un espacement entre les paragraphes de réponse à une épreuve (PIX-7684)
- [#5952](https://github.com/1024pix/pix/pull/5952) [BUGFIX] Traduire les domaines affichés dans l'écran de fin de parcours (PIX-7704) (PIX-7012)
- [#5957](https://github.com/1024pix/pix/pull/5957) [BUGFIX] Ne pas bloquer l'utilisateur sur le type du fichier dans l'import en masse de sessions sur Pix Certif (PIX-7708)
- [#5966](https://github.com/1024pix/pix/pull/5966) [BUGFIX] Corrige l'envoi des emails

## v3.341.0 (07/04/2023)


### :rocket: Amélioration
- [#5934](https://github.com/1024pix/pix/pull/5934) [FEATURE] Passer la duplication de candidat en erreur non bloquante dans l'import en masse (PIX-7181).
- [#5939](https://github.com/1024pix/pix/pull/5939) [FEATURE] Améliorer les messages d'erreurs de la gestions massive des sessions sur Pix Certif (PIX-7677).
- [#5942](https://github.com/1024pix/pix/pull/5942) [FEATURE] Modification du message par défaut d'un profil cible au palier 0 (PIX-7616)
- [#5883](https://github.com/1024pix/pix/pull/5883) [FEATURE] Mise à jour de pixUI sur pixOrga (PIX-7560)
- [#5923](https://github.com/1024pix/pix/pull/5923) [FEATURE] Afficher les domaines de compétences sur la page de fin de campagne sur Pix-App (PIX-7012)

### :building_construction: Tech
- [#5940](https://github.com/1024pix/pix/pull/5940) [TECH] Bump pix-ui version to 30.0.0 (PIX-7657).
- [#5930](https://github.com/1024pix/pix/pull/5930) [TECH] Ajouter une contrainte en base de données sur la colonne lang de la table users (PIX-7654)

### :bug: Correction
- [#5945](https://github.com/1024pix/pix/pull/5945) [BUGFIX] Réparer quelques régressions dans la mise en page de la page de détail d'un utilisateur (PIX-7671)
- [#5941](https://github.com/1024pix/pix/pull/5941) [BUGFIX] réparer la  width de la sidebar et du main-content
- [#5932](https://github.com/1024pix/pix/pull/5932) [BUGFIX] Corriger l'affichage des étoiles en fin de parcours sur Pix-App (PIX-7652)
- [#5927](https://github.com/1024pix/pix/pull/5927) [BUGFIX] Ne plus appeler le provider de mail lors de l'execution des tests (Pix-7646)

## v3.340.0 (06/04/2023)


### :rocket: Amélioration
- [#5928](https://github.com/1024pix/pix/pull/5928) [FEATURE] Ajouter les tables de gestion des fonctionnalités pour Pix (PIX-7460)
- [#5937](https://github.com/1024pix/pix/pull/5937) [FEATURE] Montée de version pix-ui@v30.0.0 sur Certif (PIX-7640)
- [#5933](https://github.com/1024pix/pix/pull/5933) [FEATURE] Améliorer le message d'erreur lors d'une suppression de colonne du csv d'import en masse sur Pix Certif (PIX-7090).
- [#5914](https://github.com/1024pix/pix/pull/5914) [FEATURE] Pour un user qui se connecte à Pix Certif (rejoindre via invitation), si le cookie de la locale est dispo, alors enregistrer cette locale (PIX-7408)
- [#5929](https://github.com/1024pix/pix/pull/5929) [FEATURE] Mise en place d'un algo de recommandation de contenu formatif (PIX-7506).
- [#5922](https://github.com/1024pix/pix/pull/5922) [FEATURE] Déconnecter la session FWB d'un utilisateur qui se déconnecte de Pix (PIX-7422)
- [#5825](https://github.com/1024pix/pix/pull/5825) [FEATURE] Traduire la modale d'inscription individuelle d'un candidat en anglais sur Pix Certif (PIX-6672)
- [#5926](https://github.com/1024pix/pix/pull/5926) [FEATURE] Ne pas permettre la modification d'une session inexistante lors de l'import en masse de session sur Pix Certif (PIX-7612).
- [#5916](https://github.com/1024pix/pix/pull/5916) [FEATURE] Traduction de la page de finalisation de session sur Pix Certif (PIX-6676).
- [#5904](https://github.com/1024pix/pix/pull/5904) [FEATURE] Afficher les résultats des compétences sous forme d'étoiles sur la page de fin de parcours sur Pix-App (PIX-7557)

### :building_construction: Tech
- [#5925](https://github.com/1024pix/pix/pull/5925) [TECH] Bump pix-ui 29.1.1 (PIX-7641)
- [#5884](https://github.com/1024pix/pix/pull/5884) [TECH] Migre certif sur embroider
- [#5924](https://github.com/1024pix/pix/pull/5924) [TECH] Ajout du .buildpacks manquant pour pix1d
- [#5814](https://github.com/1024pix/pix/pull/5814) [TECH] Création du projet Pix 1D (PIX-7472)

### :bug: Correction
- [#5915](https://github.com/1024pix/pix/pull/5915) [BUGFIX] Corriger le script de génération de campagne avec participation (PIX-7628)

### :coffee: Autre
- [#5920](https://github.com/1024pix/pix/pull/5920) [DOC] :memo: Ajout des entrées manquantes pour la v3.339.0 dans le changelog
- [#5919](https://github.com/1024pix/pix/pull/5919) [BUMP] Lock file maintenance

## v3.339.0 (31/03/2023)


### :rocket: Amélioration
- [#5913](https://github.com/1024pix/pix/pull/5913) [FEATURE] Changer le lien du mot de passe oublié lorsqu'on passe en domaine ORG sur Pix Certif (PIX-7593). 
- [#5908](https://github.com/1024pix/pix/pull/5908) [FEATURE] Utiliser le cookie locale pour transmettre la locale lors de l'inscription (PIX-7564)
- [#5902](https://github.com/1024pix/pix/pull/5902) [FEATURE] Traduire la modale de fin de test dans l'espace surveillant sur Pix Certif (PIX-6681).
- [#5907](https://github.com/1024pix/pix/pull/5907) [FEATURE] Traduire la page des cgu en anglais sur Pix Certif (PIX-6662).
- [#5906](https://github.com/1024pix/pix/pull/5906) [FEATURE] Préparation de la recommandation de contenu formatif - partie 5 (PIX-7591).
- [#5855](https://github.com/1024pix/pix/pull/5855) [FEATURE] Modifier la langue d'un utilisateur depuis Pix-Admin(PIX-5767)

### :building_construction: Tech
- [#5911](https://github.com/1024pix/pix/pull/5911) [TECH] N'avoir que le scroll du navigateur à l'affichage sur Pix Orga (PIX-7618)
- [#5910](https://github.com/1024pix/pix/pull/5910) [TECH] Création d'un feature toggle pour la recommandation des contenus formatifs (PIX-7537)
- [#5912](https://github.com/1024pix/pix/pull/5912) [TECH] Améliorer l'accessibilité de la page des cgu sur Pix Certif (PIX-7621).
- [#5847](https://github.com/1024pix/pix/pull/5847) [TECH] Nettoyage des erreurs d'import de sessions en masse (PIX-7457)
- [#5854](https://github.com/1024pix/pix/pull/5854) [TECH] Normalisation des fichiers de traductions (PIX-7511)
- [#5900](https://github.com/1024pix/pix/pull/5900) [TECH] Optimisation du style de la page "Mes tutos" (PIX-7578).
- [#5894](https://github.com/1024pix/pix/pull/5894) [TECH]Ajout d'un test sur la validation joi de la route GET authentication-url(PIX-7117)
- [#5905](https://github.com/1024pix/pix/pull/5905) [TECH] Supprime les imports de librairie externe dans ember-cli-build
- [#5897](https://github.com/1024pix/pix/pull/5897) [TECH] Met à jour ember-cli-clipboard sur orga
- [#5898](https://github.com/1024pix/pix/pull/5898) [TECH] Nettoyer les tests des erreurs de lint sur les applications front (PIX-7577).

### :bug: Correction
- [#5903](https://github.com/1024pix/pix/pull/5903) [BUGFIX] Gérer le mauvais format d'id de session lors de l'import en masse (PIX-7576)

## v3.338.0 (29/03/2023)


### :rocket: Amélioration
- [#5877](https://github.com/1024pix/pix/pull/5877) [FEATURE] Enregistrer la locale de l'utilisateur à la connexion sur app.pix.fr (PIX-7549)
- [#5853](https://github.com/1024pix/pix/pull/5853) [FEATURE] Pré-remplir le champ d'un QROC (PIX-6411)
- [#5890](https://github.com/1024pix/pix/pull/5890) [FEATURE] Ajout de message d'erreurs lors du db:delete et db:create (PIX-7572)
- [#5863](https://github.com/1024pix/pix/pull/5863) [FEATURE] Retourner le pallier atteint pour chaque compétence en fin de parcours sur Pix-App (PIX-7374)
- [#5882](https://github.com/1024pix/pix/pull/5882) [FEATURE] Afficher un message d'erreur correct pour les erreurs liées à la locale lors de la connexion à Pix App (PIX-7434)
- [#5866](https://github.com/1024pix/pix/pull/5866) [FEATURE] Montée de version de Pix UI en v29.0.0 sur Pix App (PIX-7550)
- [#5868](https://github.com/1024pix/pix/pull/5868) [FEATURE] Ajout d'un fil d'ariane sur la page de détail d'un prescrit (PIX-7301)
- [#5865](https://github.com/1024pix/pix/pull/5865) [FEATURE] Ajouter un exemple de format de code attendu dans l'erreur de la page "J'ai un code" (PIX-7264)
- [#5860](https://github.com/1024pix/pix/pull/5860) [FEATURE] Améliorer le label de la page "J'ai un code" (PIX-7263).
- [#5859](https://github.com/1024pix/pix/pull/5859) [FEATURE] Enregistrer la locale à l'inscription d'un utilisateur via un SSO OIDC  (PIX-7517)
- [#5857](https://github.com/1024pix/pix/pull/5857) [FEATURE] Retirer l'alternative textuelle aux logos des organisations sur la page fin de parcours (PIX-7266)

### :building_construction: Tech
- [#5891](https://github.com/1024pix/pix/pull/5891) [TECH] Mutualiser les composants d'en tête des prescrit (PIX-7573)
- [#5896](https://github.com/1024pix/pix/pull/5896) [TECH] Met à jour @1024pix/ember-testing-library
- [#5864](https://github.com/1024pix/pix/pull/5864) [TECH] Utiliser un read-model pour les contenus formatifs destinés à Pix Admin (PIX-7548). 
- [#5878](https://github.com/1024pix/pix/pull/5878) [TECH] Change les imports de ember-cli-mirage à miragejs
- [#5862](https://github.com/1024pix/pix/pull/5862) [TECH] Optimisation du training-trigger-repository (PIX-7512).

### :bug: Correction
- [#5895](https://github.com/1024pix/pix/pull/5895) [BUGFIX] Eviter les erreurs 500 en cas de mauvais format d'heure et/ou date de session lors de l'import en masse (PIX-7575)
- [#5899](https://github.com/1024pix/pix/pull/5899) [BUGFIX] Mauvais message de palier affiché en fin de parcours (PIX-7581)
- [#5839](https://github.com/1024pix/pix/pull/5839) [BUGFIX] Correction crash dans le script de cache refresh
- [#5840](https://github.com/1024pix/pix/pull/5840) [BUGFIX] Améliorer l'ergonomie de la modale "réponses et tutos" (PIX-7424)

### :coffee: Autre
- [#5886](https://github.com/1024pix/pix/pull/5886) [BUMP] Update dependency ember-flatpickr to v4 (certif)
- [#5885](https://github.com/1024pix/pix/pull/5885) [BUMP] Update dependency ember-flatpickr to v4 (admin)
- [#5881](https://github.com/1024pix/pix/pull/5881) [BUMP] Update dependency ember-cli-app-version to v6 (orga)
- [#5880](https://github.com/1024pix/pix/pull/5880) [BUMP] Update dependency ember-cli-app-version to v6 (certif)
- [#5879](https://github.com/1024pix/pix/pull/5879) [BUMP] Update dependency ember-cli-app-version to v6 (admin)
- [#5876](https://github.com/1024pix/pix/pull/5876) [BUMP] Update dependency sinon to v15 (api)
- [#5875](https://github.com/1024pix/pix/pull/5875) [BUMP] Update dependency sinon to v15 (mon-pix)
- [#5874](https://github.com/1024pix/pix/pull/5874) [BUMP] Update dependency sinon to v15 (certif)
- [#5873](https://github.com/1024pix/pix/pull/5873) [BUMP] Update dependency sinon to v15 (admin)
- [#5871](https://github.com/1024pix/pix/pull/5871) [BUMP] Update dependency webpack to v5.76.0 [SECURITY]
- [#5870](https://github.com/1024pix/pix/pull/5870) [BUMP] Update dependency webpack to v5.76.0 [SECURITY]
- [#5872](https://github.com/1024pix/pix/pull/5872) [BUMP] Update dependency webpack to v5.76.0 [SECURITY]
- [#5869](https://github.com/1024pix/pix/pull/5869) [BUMP] Update dependency webpack to v5.76.0 [SECURITY]

## v3.337.0 (24/03/2023)


### :rocket: Amélioration
- [#5856](https://github.com/1024pix/pix/pull/5856) [FEATURE] Ajout d'un role "alert" quand le code campagne est erroné (PIX-7262)
- [#5861](https://github.com/1024pix/pix/pull/5861) [FEATURE] Modale autorisation à reprendre dans l'ES en anglais (PIX-6680)
- [#5842](https://github.com/1024pix/pix/pull/5842) [FEATURE] Enregistrer la locale de l'utilisateur à la connexion (PIX-7364)
- [#5776](https://github.com/1024pix/pix/pull/5776) [FEATURE] Gérer le premier acquis sur Pix Orga (PIX-7333)
- [#5831](https://github.com/1024pix/pix/pull/5831) [FEATURE] Rendre cliquable le fil d'ariane des contenus formatifs sur Pix-Admin (PIX-7390)
- [#5823](https://github.com/1024pix/pix/pull/5823) [FEATURE] Traduction formulaire connection espace surveillant (PIX-6679)
- [#5851](https://github.com/1024pix/pix/pull/5851) [FEATURE] Préparation de la recommandation de contenu formatif - partie 4 (PIX-7505)
- [#5849](https://github.com/1024pix/pix/pull/5849) [FEATURE] Préparation de la recommandation de contenu formatif - partie 3 (PIX-7504).
- [#5848](https://github.com/1024pix/pix/pull/5848) [FEATURE] Préparation de la recommandation de contenu formatif - partie 2 (PIX-7503).

### :building_construction: Tech
- [#5843](https://github.com/1024pix/pix/pull/5843) [TECH] Mise à jour de ember-cli-clipboard sur certif

### :bug: Correction
- [#5844](https://github.com/1024pix/pix/pull/5844) [BUGFIX] Corrige l'affichage du message de changement de mot de passe sur certif
- [#5850](https://github.com/1024pix/pix/pull/5850) [BUGFIX] Afficher les messages d'erreur des champs pour la création et la modification de session (PIX-7161).

## v3.336.0 (22/03/2023)


### :rocket: Amélioration
- [#5845](https://github.com/1024pix/pix/pull/5845) [FEATURE] Préparation de la recommandation de contenu formatif - partie 1 (PIX-7502).  
- [#5834](https://github.com/1024pix/pix/pull/5834) [FEATURE] Création d'un script pour intervertir deux codes de campagnes (PIX-7445)
- [#5836](https://github.com/1024pix/pix/pull/5836) [FEATURE][ADMIN] Afficher la locale de l'utilisateur sur sa fiche (PIX-7362)
- [#5841](https://github.com/1024pix/pix/pull/5841) [FEATURE] Améliorer le design de la citation dans les consignes d'une épreuves (PIX-7370)
- [#5815](https://github.com/1024pix/pix/pull/5815) [FEATURE] Gérer un message d'erreur spécifique si l'utilisateur rédemarre une certification avec un autre compte (PIX-6874)
- [#5829](https://github.com/1024pix/pix/pull/5829) [FEATURE] Gestion des erreurs non bloquantes (PIX-6962)
- [#5795](https://github.com/1024pix/pix/pull/5795) [FEATURE][MON-PIX] Enregistrer la locale d'un utilisateur depuis le cookie de PixSite lors de son inscription (PIX-7367)
- [#5837](https://github.com/1024pix/pix/pull/5837) [FEATURE] Visualiser le seuil et le nombre de sujets d'un déclencheur de contenu formatif (PIX-7260)
- [#5828](https://github.com/1024pix/pix/pull/5828) [FEATURE] Traduire l'espace surveillant en anglais (PIX-6706).
- [#5832](https://github.com/1024pix/pix/pull/5832) [FEATURE] Rendre les urls des contenus formatifs cliquable sur Pix-Admin (PIX-7389)
- [#5813](https://github.com/1024pix/pix/pull/5813) [FEATURE] Afficher le détail d'un déclencheur de contenu formatif (PIX-7429)
- [#5820](https://github.com/1024pix/pix/pull/5820) [FEATURE] Affichages des erreurs bloquantes lors de l'import de session en masse (PIX-7412)
- [#5818](https://github.com/1024pix/pix/pull/5818) [FEATURE] Améliorer l'accessibilité de la page de détail d'un participant et d'une campagne (PIX-6899)

### :building_construction: Tech
- [#5821](https://github.com/1024pix/pix/pull/5821) [TECH] Supprimer la dépendance `ember-collapsible-panel` (PIX-7469)
- [#5812](https://github.com/1024pix/pix/pull/5812) [TECH] Ajouter un hash du username dans les logs de l'appel à api/token

### :bug: Correction
- [#5822](https://github.com/1024pix/pix/pull/5822) [BUGFIX] Corriger l'affichage du PixSelect dans la page Certifications de Pix Orga (PIX-7478)
- [#5838](https://github.com/1024pix/pix/pull/5838) [BUGFIX] Afficher le déclencheur après sa création (PIX-7501).
- [#5826](https://github.com/1024pix/pix/pull/5826) [BUGFIX] Corrige le message de succès lors de l'import en masse  (PIX-7481)
- [#5830](https://github.com/1024pix/pix/pull/5830) [BUGFIX] Les paginations de Pix App ne sont pas traduites (PIX-7433)
- [#5824](https://github.com/1024pix/pix/pull/5824) [BUGFIX] Corriger le problème d'espacement sur la page de détail d'une compétence sur Pix-App (PIX-7327)

### :coffee: Autre
- [#5782](https://github.com/1024pix/pix/pull/5782) [DOCS] Spécifier la stratégie de gestion des traductions (i18n) et des codes d'erreur (PIX-7410)
- [#5835](https://github.com/1024pix/pix/pull/5835) [BUMP] Replace dependency xmldom with @xmldom/xmldom ^0.7.5 (api)

## v3.335.0 (16/03/2023)


### :rocket: Amélioration
- [#5809](https://github.com/1024pix/pix/pull/5809) [FEATURE] Rendre les participations cliquables sur la page d'un prescrit pour accéder à leurs détails. (PIX-7297)
- [#5817](https://github.com/1024pix/pix/pull/5817) [FEATURE] Traduire la page de modification de session (PIX-6674).
- [#5819](https://github.com/1024pix/pix/pull/5819) [FEATURE] Afficher un message de succes recapitulatif apres l'import en masse (PIX-7365)
- [#5803](https://github.com/1024pix/pix/pull/5803) [FEATURE] Modale détail du candidat en anglais (PIX-6671)
- [#5816](https://github.com/1024pix/pix/pull/5816) [FEATURE] Traduction de la page Equipe de Pix Certif (PIX-6682).
- [#5811](https://github.com/1024pix/pix/pull/5811) [FEATURE] Ajoute un lien vers les détails d'un participant sur les détails d'une participation (PIX-7295)
- [#5802](https://github.com/1024pix/pix/pull/5802) [FEATURE] Déplacer le tag certifiable à côté du nom du prescrit sur la page d'une participation (PIX-7421)
- [#5785](https://github.com/1024pix/pix/pull/5785) [FEATURE] Gestion des erreurs bloquantes sur l'import des sessions en masse (PIX-6963).
- [#5807](https://github.com/1024pix/pix/pull/5807) [FEATURE] Éviter que le footer soit positionné en dehors de l'écran dans les pages avec peu de contenu (PIX-7437)
- [#5805](https://github.com/1024pix/pix/pull/5805) [FEATURE] Conditionner l'affichage des déclencheurs de contenu formatif (PIX-7258)
- [#5799](https://github.com/1024pix/pix/pull/5799) [FEATURE] Améliorer le disclosure du block de signalisation de problème sur Pix-App (PIX-6862)
- [#5794](https://github.com/1024pix/pix/pull/5794) [FEATURE] Récupérer les informations de référentiel des déclencheurs de contenu formatif (PIX-7353)
- [#5798](https://github.com/1024pix/pix/pull/5798) [FEATURE] Mettre le nom du prescrit comme titre sur les détails d'une participation (PIX-7296)

### :building_construction: Tech
- [#5407](https://github.com/1024pix/pix/pull/5407) [TECH] Script de migration automatique des critères de type "SkillSet" des RTs vers des critères "CappedTubes" (PIX-5698)

### :bug: Correction
- [#5810](https://github.com/1024pix/pix/pull/5810) [BUGFIX] Ne pas afficher "Classe/Groupe" si cette info n'est pas présente pour le sco & sup. (PIX-7439)

### :coffee: Autre
- [#5806](https://github.com/1024pix/pix/pull/5806) [CLEANUP] Nettoyage des imports de libs qui viennent avec pix-ui (PIX-7447)

## v3.334.0 (13/03/2023)


### :rocket: Amélioration
- [#5800](https://github.com/1024pix/pix/pull/5800) [FEATURE] Ajout d'un fil d'ariane sur la page de détail d'une campagne (PIX-7300)
- [#5781](https://github.com/1024pix/pix/pull/5781) [FEATURE] Ajout de l'en-tête d'information avec certificabilité pour Orga Sup (PIX-7289)
- [#5780](https://github.com/1024pix/pix/pull/5780) [FEATURE] Ajout de l'en-tête d'information avec certificabilité pour Orga Sco (PIX-7284)

### :building_construction: Tech
- [#5797](https://github.com/1024pix/pix/pull/5797) [TECH] Amélioration de la gestion d'erreur sur la création d'un profil cible avec une organisation inconnue (PIX-7337)

### :bug: Correction
- [#5788](https://github.com/1024pix/pix/pull/5788) [BUGFIX] Meilleure gestion des erreurs à la connexion, sur la double mire SCO (PIX-7046)
- [#5774](https://github.com/1024pix/pix/pull/5774) [BUGFIX][ADMIN] Augmenter la taille maximale du logo des organisations à 2,5Mo (PIX-7326)

### :coffee: Autre
- [#5793](https://github.com/1024pix/pix/pull/5793) [CHORE] Mise à jour de Pix-Ui dans Pix Orga (PIX-7343)

## v3.333.0 (09/03/2023)


### :rocket: Amélioration
- [#5771](https://github.com/1024pix/pix/pull/5771) [FEATURE] Ne pas afficher les boutons d'import en masses des sessions pour les anglophones sur Pix Certif (PIX-7348).
- [#5778](https://github.com/1024pix/pix/pull/5778) [FEATURE][ADMIN] Obtenir la liste des utilisateurs triés par le prénom, nom et id lors d'une recherche (PIX-7136)
- [#5766](https://github.com/1024pix/pix/pull/5766) [FEATURE] Onglet "Candidats" d'une session en anglais (PIX-6670)
- [#5768](https://github.com/1024pix/pix/pull/5768) [FEATURE] Ajoute un fil d'ariane sur les pages de détails d'une participation (PIX-7294)
- [#5387](https://github.com/1024pix/pix/pull/5387) [FEATURE] Migration des profils cibles (PIX-6596)

### :building_construction: Tech
- [#5789](https://github.com/1024pix/pix/pull/5789) [TECH] Préparer l'utilisation unique des exports nommés dans lib - Partie 3 (PIX-7202)
- [#5784](https://github.com/1024pix/pix/pull/5784) [TECH] Préparer l'utilisation unique des exports nommés dans lib - Partie 2 (PIX-7202)
- [#5779](https://github.com/1024pix/pix/pull/5779) [TECH] Ajouter un champ "locale" dans la table "users" (PIX-6905)
- [#5777](https://github.com/1024pix/pix/pull/5777) [TECH] Préparer l'utilisation unique des exports nommés dans lib (PIX-7202)

### :bug: Correction
- [#5765](https://github.com/1024pix/pix/pull/5765) [BUGFIX] Corriger les liens dans le footer et sur la page d'invitation sur Pix Orga (PIX-7178)
- [#5775](https://github.com/1024pix/pix/pull/5775) [BUGFIX] Rendre visible le lien du numéro de session sur Pix Admin (PIX-7133).
- [#5790](https://github.com/1024pix/pix/pull/5790) [BUGFIX] Une erreur est levée lors de l'arrêt de l'api - Partie 2 (PIX-7202)
- [#5783](https://github.com/1024pix/pix/pull/5783) [BUGFIX] Une erreur est levée lors de l'arrêt de l'api (PIX-7202)
- [#5767](https://github.com/1024pix/pix/pull/5767) [BUGFIX] Consultation de Résultat thématique - Problème d'affichage du contenu du tableau
- [#5772](https://github.com/1024pix/pix/pull/5772) [BUGFIX] Convertir le temps majoré en decimal lors de l'import des sessions en masse sur Pix Certif (PIX-7351)

## v3.332.0 (07/03/2023)


### :rocket: Amélioration
- [#5764](https://github.com/1024pix/pix/pull/5764) [FEATURE] Ajout de l'en-tête d'information avec certificabilité pour Orga sans import (PIX-7290)
- [#5755](https://github.com/1024pix/pix/pull/5755) [FEATURE] Afficher un compteur d'erreurs si la validation d'un import en masse de sessions échoue sur Pix Certif (PIX-6959).
- [#5759](https://github.com/1024pix/pix/pull/5759) [FEATURE] Intégrer la gestion du palier 1er Acquis dans l'affichage de PixApp (PIX-7310)
- [#5763](https://github.com/1024pix/pix/pull/5763) [FEATURE]: Ajouter une modale de confirmation de suppression dans le tableau de paliers (PIX-7331)
- [#5762](https://github.com/1024pix/pix/pull/5762) [FEATURE] Ajouter des titres au plan du site sur Pix-App (PIX-6818)

### :building_construction: Tech
- [#5747](https://github.com/1024pix/pix/pull/5747) [TECH] Transformer manuellement les exports CJS hétérogènes dans le cadre de la migration ESM (PIX-7202)

### :bug: Correction
- [#5773](https://github.com/1024pix/pix/pull/5773) [BUGFIX] Améliorer l'affichage des adresses emails des membres des Centres de Certification dans Pix Admin (PIX-7135)
- [#5760](https://github.com/1024pix/pix/pull/5760) [BUGFIX] Corriger le lien d'Accessibilité dans le footer de app.pix.org (PIX-7177)

## v3.331.0 (03/03/2023)


### :rocket: Amélioration
- [#5761](https://github.com/1024pix/pix/pull/5761) [FEATURE][MON-PIX] Modifier le message d'erreur lors d'un refus de partage de données entre Pôle Emploi et Pix (PIX-7335)
- [#5745](https://github.com/1024pix/pix/pull/5745) [FEATURE] Permettre de confirmer la création massive des sessions sur Pix Certif (PIX-7234).
- [#5758](https://github.com/1024pix/pix/pull/5758) [FEATURE] Traduction de la page de détails d'une session sur Pix Certif (PIX-6669).

### :bug: Correction
- [#5757](https://github.com/1024pix/pix/pull/5757) [BUGFIX] Améliorer le message d'erreur lorsqu'un utilisateur tente de rejoindre une organisation via une invitation en se connectant avec une adresse email inconnue sur Pix Orga (PIX-7269)
- [#5756](https://github.com/1024pix/pix/pull/5756) [BUGFIX] Restreindre les droits d'accès de modification des contenus formatifs (PIX-7305).
- [#5733](https://github.com/1024pix/pix/pull/5733) [BUGFIX] N'afficher le lien vers l'import de session en masse que pour les centres qui ne sont pas isScoManagingStudent (PIX-7276).
- [#5734](https://github.com/1024pix/pix/pull/5734) [BUGFIX] Gérer les adresses e-mail invalides lors de l'envoi d'invitations depuis Pix Orga (PIX-7188)

## v3.330.0 (02/03/2023)


### :rocket: Amélioration
- [#5729](https://github.com/1024pix/pix/pull/5729) [FEATURE][MON-PIX] Améliorer l'utilisabilité de la page d'erreur en cas de non-consentement du partage des informations de l'utilisateur entre l'identity provider et Pix (PIX-7248)
- [#5732](https://github.com/1024pix/pix/pull/5732) [FEATURE] Ajout d'un feature toggle pour l'envoi des données à PoleEmploi (PIX-7016).
- [#5748](https://github.com/1024pix/pix/pull/5748) [FEATURE] Ajuster les largeurs de colonnes du tableau de paliers (PIX-7103)
- [#5744](https://github.com/1024pix/pix/pull/5744) [FEATURE] Retourner les déclencheurs liés au contenu formatif demandé (PIX-7256).
- [#5746](https://github.com/1024pix/pix/pull/5746) [FEATURE] Modifier le contenu du message d'erreur authentification non autorisé sur Pix Orga (PIX-7251)
- [#5749](https://github.com/1024pix/pix/pull/5749) [FEATURE] Modifier le contenu du message d'erreur authentification non autorisée sur Pix Certif (PIX-7279)
- [#5743](https://github.com/1024pix/pix/pull/5743) [FEATURE] Affichage du nombre de sessions et de candidats lors de l'import en masse de sessions (PIX-6960).
- [#5737](https://github.com/1024pix/pix/pull/5737) [FEATURE] Renommer le nom des déclencheurs des contenus formatifs (PIX-7277).
- [#5739](https://github.com/1024pix/pix/pull/5739) [FEATURE] Autoriser la suppression de certains paliers (Pix-7172)
- [#5627](https://github.com/1024pix/pix/pull/5627) [FEATURE] Ajout des composants Pix UI dans les pages /connexion et /inscription sur Pix App (PIX-7032).

### :building_construction: Tech
- [#5741](https://github.com/1024pix/pix/pull/5741) [TECH] Retourner des tubes complets lors de la création de déclencheurs de contenu formatif (PIX-7291).
- [#5754](https://github.com/1024pix/pix/pull/5754) [TECH] Rétablir le linter sur les dossier de tests et de scripts

### :bug: Correction
- [#5742](https://github.com/1024pix/pix/pull/5742) [BUGFIX] Fix traductions manquantes sur la page de liste des sessions (PIX-7255)
- [#5750](https://github.com/1024pix/pix/pull/5750) [BUGFIX] Ajouter un margin au bloc des trainings dans la page de fin de parcours (PIX-7306)

### :coffee: Autre
- [#5728](https://github.com/1024pix/pix/pull/5728) [CHORE] Aligner les en-tête et le contenu sur le tableau de la page des prescrits (PIX-7247)
- [#5752](https://github.com/1024pix/pix/pull/5752) [BUMP] Lock file maintenance

## v3.329.0 (27/02/2023)


### :rocket: Amélioration
- [#5721](https://github.com/1024pix/pix/pull/5721) [FEATURE] Validation de l'import du fichier CSV lors de l'import en masse des sessions sur Pix Certif (PIX-6961).
- [#5722](https://github.com/1024pix/pix/pull/5722) [FEATURE] Ajouter un déclencheur à un contenu formatif (PIX-7176).
- [#5720](https://github.com/1024pix/pix/pull/5720) [FEATURE] Améliorer le texte alternatif du logo pour les contenus formatifs sur Pix-App (PIX-6813)

### :bug: Correction
- [#5738](https://github.com/1024pix/pix/pull/5738) [BUGFIX] fix(api): réparer le worker.
- [#5730](https://github.com/1024pix/pix/pull/5730) [BUGFIX] Afficher 1024 comme nombre max de Pix au lieu du max actuel (PIX-7254).

### :coffee: Autre
- [#5735](https://github.com/1024pix/pix/pull/5735) [BUMP] Update Node.js to v16.19.1 (.circleci)
- [#5736](https://github.com/1024pix/pix/pull/5736) [BUMP] Update redis Docker tag to v6.2.10

## v3.328.0 (24/02/2023)


### :rocket: Amélioration
- [#5717](https://github.com/1024pix/pix/pull/5717) [FEATURE] Rendre le champ "IdPixLabel" obligatoire (PIX-4328).
- [#5697](https://github.com/1024pix/pix/pull/5697) [FEATURE] Créer la page "Récapitulatif" pour l'import en masse des sessions sur Pix Certif (PIX-6953).
- [#5713](https://github.com/1024pix/pix/pull/5713) [FEATURE] Internationaliser les actions globales de Certif (PIX-7201)
- [#5716](https://github.com/1024pix/pix/pull/5716) [FEATURE] Internationaliser les urls des mentions légales et d'accessibilité sur Pix Certif (PIX-7209).
- [#5706](https://github.com/1024pix/pix/pull/5706) [FEATURE] Utiliser un counter CSS pour les formulaires de création de Profile cible et de déclencheur de contenu formatif (PIX-7203)
- [#5711](https://github.com/1024pix/pix/pull/5711) [FEATURE] Ajout des RT dans les PE sendings (PIX-7017).

### :building_construction: Tech
- [#5725](https://github.com/1024pix/pix/pull/5725) [TECH] Utiliser des guillemets simples dans nos fichiers SCSS
- [#5726](https://github.com/1024pix/pix/pull/5726) [TECH] Ajouter l'extension de fichier à l'import local dans lib (PIX-7202)
- [#5715](https://github.com/1024pix/pix/pull/5715) [TECH] Préparer la migration de l'API en ESM  (PIX-7202)
- [#5667](https://github.com/1024pix/pix/pull/5667) [TECH] Renvoyer une erreur 422 au lieu d'une erreur 503 quand Pôle Emploi ne renvoie pas correctement les infos d'un utilisateur (PIX-6982)

### :bug: Correction
- [#5727](https://github.com/1024pix/pix/pull/5727) [BUGFIX] Rétablissement de l'espacement des titres sur la double mire (PIX-7134).
- [#5712](https://github.com/1024pix/pix/pull/5712) [BUGFIX] Gerer l'asynchronisme de PGBoss.send (PIX-7230)
- [#5718](https://github.com/1024pix/pix/pull/5718) [BUGFIX] Permettre la modification de contenu formatif (PIX-7275).
- [#5723](https://github.com/1024pix/pix/pull/5723) [BUGFIX] Le logger ne marche pas (PIX-7249)
- [#5719](https://github.com/1024pix/pix/pull/5719) [BUGFIX] Ajout de la dépendance manquante participantResultsSharedRepository

## v3.327.0 (22/02/2023)


### :rocket: Amélioration
- [#5710](https://github.com/1024pix/pix/pull/5710) [FEATURE] Empêcher la modification du palier 0 (PIX-6598)
- [#5703](https://github.com/1024pix/pix/pull/5703) [FEATURE] Passer "Certification complémentaires" au singulier sur Pix Certif (PIX-7033).
- [#5666](https://github.com/1024pix/pix/pull/5666) [FEATURE] Modifier le détail d'un contenu formatif dans Pix Admin (PIX-6321).
- [#5696](https://github.com/1024pix/pix/pull/5696) [FEATURE] Améliorer le visuel du bouton de suppression d'un palier dans pix admin (PIX-7104)
- [#5707](https://github.com/1024pix/pix/pull/5707) [FEATURE] Gérer le fonctionnement du Palier 0 (PIX-6514)
- [#5704](https://github.com/1024pix/pix/pull/5704) [FEATURE] Ajouter des messages d'erreur visuels lors de champs invalides dans l'édition de palier
- [#5652](https://github.com/1024pix/pix/pull/5652) [FEATURE] Traduire la page de liste de sessions de certification (PIX-6666)
- [#5657](https://github.com/1024pix/pix/pull/5657) [FEATURE] Ajout d'un tri sur le tableau de participants par nom (PIX-7007)

### :building_construction: Tech
- [#5444](https://github.com/1024pix/pix/pull/5444) [TECH] Déplace le code de ParticipationResultCalculationJobHandler dans un usecase
- [#5586](https://github.com/1024pix/pix/pull/5586) [TECH] Mise à jour de la documentation d'interconnexion PoleEmploi
- [#5406](https://github.com/1024pix/pix/pull/5406) [TECH] Supprimer le message de déploiement redondant dans Jira
- [#5699](https://github.com/1024pix/pix/pull/5699) [TECH] Active des règles de lint SCSS d'espacement

### :bug: Correction
- [#5700](https://github.com/1024pix/pix/pull/5700) [BUGFIX] Ne pas envoyer l'ancienne valeur lorsque le nouveau palier est en Erreur (Pix-7211)
- [#5698](https://github.com/1024pix/pix/pull/5698) [BUGFIX] Ne pas avoir d'erreur 500 lorsque le nom de salle n'est pas fourni sur la première ligne du CSV (PIX-7212).

### :coffee: Autre
- [#5709](https://github.com/1024pix/pix/pull/5709) [CHORE] Améliorer les instructions pour l'archivage en masse des campages (PIX-7219)
- [#5687](https://github.com/1024pix/pix/pull/5687) [BUMP] Update dependency ember-cli-clipboard to v1 (mon-pix)
- [#5690](https://github.com/1024pix/pix/pull/5690) [BUMP] Update dependency ember-modifier to v4 (mon-pix)
- [#5688](https://github.com/1024pix/pix/pull/5688) [BUMP] Update dependency ember-click-outside to v5 (mon-pix)
- [#5686](https://github.com/1024pix/pix/pull/5686) [BUMP] Update dependency ember-cli-app-version to v6 (mon-pix)
- [#5689](https://github.com/1024pix/pix/pull/5689) [BUMP] Update dependency ember-keyboard to v8 (mon-pix)
- [#5692](https://github.com/1024pix/pix/pull/5692) [BUMP] Update dependency ember-resolver to v10 (mon-pix)

## v3.326.0 (20/02/2023)


### :rocket: Amélioration
- [#5684](https://github.com/1024pix/pix/pull/5684) [FEATURE] Ajout de validation par champ lors de l'ajout de palier (PIX-7100)
- [#5679](https://github.com/1024pix/pix/pull/5679) [FEATURE] Refacto validation de session pour import en masse partie 2 (PIX-7186)
- [#5529](https://github.com/1024pix/pix/pull/5529) [FEATURE] Permettre l'archivage en masse des campagnes côté Pix Admin (Pix-6879)
- [#5669](https://github.com/1024pix/pix/pull/5669) [FEATURE] Permettre la sélection de sujets pour les contenus formatifs sur Pix-Admin (PIX-7166)
- [#5656](https://github.com/1024pix/pix/pull/5656) [FEATURE] Traduire les menus et le layout en anglais (PIX-6668)
- [#5677](https://github.com/1024pix/pix/pull/5677) [FEATURE] Afficher de meilleurs messages d'erreurs lorsque l'utilisateur saisit un nombre décimal en seuil de palier sur PixAdmin (PIX-7077)
- [#5673](https://github.com/1024pix/pix/pull/5673) [FEATURE] Refacto validation de session pour import en masse partie 1 (PIX-7185)
- [#5668](https://github.com/1024pix/pix/pull/5668) [FEATURE] Mettre un message plus explicite sur les champs de titre et description prescripteur lors de la création d'un palier (PIX-6171)

### :building_construction: Tech
- [#5694](https://github.com/1024pix/pix/pull/5694) [TECH] Active la règle de lint SCSS d'ajout d'espace après les `:` sur Pix Orga
- [#5693](https://github.com/1024pix/pix/pull/5693) [TECH] Active la règle de lint SCSS d'intentation sur Pix Orga
- [#5676](https://github.com/1024pix/pix/pull/5676) [TECH] Generer le mot de passe surveillant au plus tôt (PIX-7195)
- [#5670](https://github.com/1024pix/pix/pull/5670) [TECH] Refonte API de la création/mise à jour de paliers + limiter le choix de sélection de niveau d'un palier aux niveaux disponibles (PIX-7099)

### :bug: Correction
- [#5681](https://github.com/1024pix/pix/pull/5681) [BUGFIX] Correction de l'emplacement du total des campagnes (PIX-7145)
- [#5678](https://github.com/1024pix/pix/pull/5678) [BUGFIX] La dropdown de changement d'orga dans PixOrga ne s'affichait pas correctement sur la page de sélection de sujets (PIX-7198)
- [#5665](https://github.com/1024pix/pix/pull/5665) [BUGFIX] Réparation du dropdown de l édition du profil cible (PIX-7127)
- [#5671](https://github.com/1024pix/pix/pull/5671) [BUGFIX] Ajout de l'icône "check" de Font Awesome (PIX-7182)

### :coffee: Autre
- [#5691](https://github.com/1024pix/pix/pull/5691) [BUMP] Update dependency ember-qunit to v6 (mon-pix)
- [#5682](https://github.com/1024pix/pix/pull/5682) [BUMP] Update dependency ember-cli to v4 (mon-pix)
- [#5685](https://github.com/1024pix/pix/pull/5685) [BUMP] Update dependency @1024pix/ember-testing-library to ^0.6.0 (mon-pix)
- [#5636](https://github.com/1024pix/pix/pull/5636) [BUMP] Update dependency minimatch to 3.0.5 [SECURITY]
- [#5648](https://github.com/1024pix/pix/pull/5648) [BUMP] Update redis Docker tag to v5.0.14 (docker)
- [#5634](https://github.com/1024pix/pix/pull/5634) [BUMP] Update dependency jsonwebtoken to 9.0.0 [SECURITY]

## v3.325.0 (16/02/2023)


### :rocket: Amélioration
- [#5653](https://github.com/1024pix/pix/pull/5653) [FEATURE] Rendre composant de sélection de sujets générique sur Pix-Admin (PIX-7025)
- [#5663](https://github.com/1024pix/pix/pull/5663) [FEATURE] Rediriger vers la page de détails après la création d'un contenu formatif (PIX-6956)
- [#5646](https://github.com/1024pix/pix/pull/5646) [FEATURE] Empêcher d'ajouter des candidats à une session déjà démarrée (PIX-7087).

### :building_construction: Tech
- [#5655](https://github.com/1024pix/pix/pull/5655) [TECH] Mise en place de Stylelint sur Pix Orga
- [#5659](https://github.com/1024pix/pix/pull/5659) [TECH] Corriger les derniers warnings ESLint et éviter qu'ils reviennent
- [#5662](https://github.com/1024pix/pix/pull/5662) [TECH] Supprimer le script de création de lien entre les contenus formatifs et les profils cibles (PIX-6760).

### :bug: Correction
- [#5625](https://github.com/1024pix/pix/pull/5625) [BUGFIX][MON-PIX] Éviter la redirection vers la page de connexion d'un utilisateur anonyme déjà authentifié désirant relancer le parcours simplifié  (PIX-7010)
- [#5610](https://github.com/1024pix/pix/pull/5610) [BUGFIX][MON-PIX] Rediriger l'utilisateur vers la page de connexion si un identity provider n'est pas configuré (PIX-6997)

### :coffee: Autre
- [#5649](https://github.com/1024pix/pix/pull/5649) [BUMP] Update redis Docker tag to v6.2.10
- [#5660](https://github.com/1024pix/pix/pull/5660) [DOCS] 📝 Mise à jour de la documentation du hook git

## v3.324.0 (14/02/2023)


### :rocket: Amélioration
- [#5598](https://github.com/1024pix/pix/pull/5598) [FEATURE] Ajout du bouton de création en masse lorsqu'il n'y a pas de sessions (PIX-6848)
- [#5644](https://github.com/1024pix/pix/pull/5644) [FEATURE] Permettre de rattacher une liste de profils cible à un contenu formatif dans Pix Admin (PIX-7072)
- [#5631](https://github.com/1024pix/pix/pull/5631) [FEATURE] Traduire la page de création d'une session (PIX-6667)
- [#5651](https://github.com/1024pix/pix/pull/5651) [FEATURE] Mise en commun des composants de sélection de sujets

### :building_construction: Tech
- [#5584](https://github.com/1024pix/pix/pull/5584) [TECH] Amélioration de la gestion des erreurs lors d'une erreur 500 pendant la réconciliation(PIX-6371)
- [#5654](https://github.com/1024pix/pix/pull/5654) [TECH] Remplace Bookshelf dans le repository pole-emploi-sending-repository
- [#5628](https://github.com/1024pix/pix/pull/5628) [TECH] Rendre le test de la génération de PDF côté API moins fragile (PIX-7070)
- [#5638](https://github.com/1024pix/pix/pull/5638) [TECH][API] Améliorer le code transformant un DTO de type User vers le modèle User du domaine pour Pix Admin (PIX-6943)
- [#5630](https://github.com/1024pix/pix/pull/5630) [TECH] Mise à jour de Pix-Ui sur Pix-Certif vers 26.0.0 (PIX-7029).

### :coffee: Autre
- [#5554](https://github.com/1024pix/pix/pull/5554) [ADR] Suppression logique de données (PIX-6634).

## v3.323.0 (13/02/2023)


### :rocket: Amélioration
- [#5632](https://github.com/1024pix/pix/pull/5632) [FEATURE] Afficher les profils cibles associés à un contenu formatif dans Pix Admin (PIX-7071).
- [#5608](https://github.com/1024pix/pix/pull/5608) [FEATURE] Ajout des instructions et du fil d'Ariane sur la page d'import des sessions (PIX-6949).
- [#5643](https://github.com/1024pix/pix/pull/5643) [FEATURE] Supprimer les colonnes inutiles du tableau de paliers dans pix admin (PIX-7102)
- [#5599](https://github.com/1024pix/pix/pull/5599) [FEATURE] Ajout d'un tri sur le tableau de participants par nombre de participations (PIX-6627)
- [#5618](https://github.com/1024pix/pix/pull/5618) [FEATURE] Mettre à jour le header des certifications complementaires pour l'import ODS (PIX-6577)
- [#5640](https://github.com/1024pix/pix/pull/5640) [FEATURE] Empêcher la programmation de session dans le passé via import en masse (PIX-7086)
- [#5537](https://github.com/1024pix/pix/pull/5537) [FEATURE] Mettre en place la gestion des erreurs à la connexion aussi sur la double mire invitation Pix Orga (PIX-6823)

### :building_construction: Tech
- [#5619](https://github.com/1024pix/pix/pull/5619) [TECH] Supprimer les variables d'environnement non utile dans Pix App (PIX-7034)
- [#5639](https://github.com/1024pix/pix/pull/5639) [TECH] Ajouter un index sur la date de création dans la table pole-emploi-sendings
- [#5231](https://github.com/1024pix/pix/pull/5231) [TECH] Refactorisation du traitement des réponses aux questions
- [#5605](https://github.com/1024pix/pix/pull/5605) [TECH] Supprimer le statut "annulée" des certifications (PIX-7002)
- [#5641](https://github.com/1024pix/pix/pull/5641) [TECH] Améliorations du temps d'exécution des tests E2E sur CircleCI
- [#5611](https://github.com/1024pix/pix/pull/5611) [TECH] Affichage bandeau téléchargement résultats CléA numérique (PIX-6988)

### :bug: Correction
- [#5642](https://github.com/1024pix/pix/pull/5642) [BUGFIX] Résoudre le problème de double scroll dans Pix Admin

### :coffee: Autre
- [#5612](https://github.com/1024pix/pix/pull/5612) [BUFGIX] Renommer userInfoContentContainsMissingFields en userInfoMissingField (PIX-7018)

## v3.322.0 (09/02/2023)


### :rocket: Amélioration
- [#5633](https://github.com/1024pix/pix/pull/5633) [FEATURE] Initie le formulaire de création de déclencheur de Contenu Formatif (PIX-7024)
- [#5616](https://github.com/1024pix/pix/pull/5616) [FEATURE] Ajout du nom du fichier CSV avant import sur la page (PIX-6950).
- [#5614](https://github.com/1024pix/pix/pull/5614) [FEATURE] Mise à jour de Pix UI sur Pix Orga
- [#5590](https://github.com/1024pix/pix/pull/5590) [FEATURE] Affichage des informations d'en-tête d'un élève (PIX-6147)

### :building_construction: Tech
- [#5622](https://github.com/1024pix/pix/pull/5622) [TECH] Ajouter une config pour Renovate (PIX-7043).
- [#5621](https://github.com/1024pix/pix/pull/5621) [TECH] Mettre à jour `ember-cli-mirage` dans Pix Admin (PIX-7042).
- [#5594](https://github.com/1024pix/pix/pull/5594) [TECH] Remplace Bookshelf dans le repository campaign-participation

### :bug: Correction
- [#5617](https://github.com/1024pix/pix/pull/5617) [BUGFIX] Eviter les doublons de candidat lors d'import sessions en masse (PIX-7008)
- [#5629](https://github.com/1024pix/pix/pull/5629) [BUGFIX] Corriger la clé de traduction de l'erreur interne sur plusieurs pages de Pix App (PIX-7067).
- [#5591](https://github.com/1024pix/pix/pull/5591) [BUGFIX] Import candidats avec numéro de session avec informations de session (PIX-6981)

## v3.321.1 (08/02/2023)


### :bug: Correction
- [#5626](https://github.com/1024pix/pix/pull/5626) [BUGFIX] Utiliser les champs provenant du modèle passé en argument pour le pixScore (PIX-7055).

### :coffee: Autre
- [#5558](https://github.com/1024pix/pix/pull/5558) [ADR] Stockage du token d'accès de l'utilisateur côté client (PIX-6923)

## v3.321.0 (07/02/2023)


### :rocket: Amélioration
- [#5623](https://github.com/1024pix/pix/pull/5623) [FEATURE] Retirer le réferentiel 'France' de la liste des référentiels mis à disposition aux utilisateurs de PixOrga pour faire une sélection de sujets (PIX-7045)
- [#5624](https://github.com/1024pix/pix/pull/5624) [FEATURE] Ajout d'une page d'édition de déclencheurs de contenus formatifs dans Pix Admin (PIX-7023)
- [#5620](https://github.com/1024pix/pix/pull/5620) [FEATURE] Modification du design de bouton de création de session (PIX-7031).
- [#5607](https://github.com/1024pix/pix/pull/5607) [FEATURE] Traduire en anglais la page de connexion à Pix Certif (PIX-6661).

### :building_construction: Tech
- [#5602](https://github.com/1024pix/pix/pull/5602) [TECH] Improve CPF batch DX
- [#5615](https://github.com/1024pix/pix/pull/5615) [TECH] Utiliser la version 16.19 Node.js dans les test E2E de la CI
- [#5609](https://github.com/1024pix/pix/pull/5609) [TECH] Ne plus utiliser la variable `MAX_REACHABLE_LEVEL` dans Pix App (PIX-7009).
- [#5604](https://github.com/1024pix/pix/pull/5604) [TECH] Montée de version de Pix-UI dans Pix-App : version 24.2.2 (PIX-7004)
- [#5606](https://github.com/1024pix/pix/pull/5606) [TECH] Améliorer les liens externes de la page "plan du site" sur Pix App (PIX-6819).

### :bug: Correction
- [#5603](https://github.com/1024pix/pix/pull/5603) [BUGFIX] Corriger les URL des CGU et de la Politique de confidentialité sur la page d'inscription de Pix App (PIX-6989)
- [#5613](https://github.com/1024pix/pix/pull/5613) [BUGFIX] Corriger des régressions de style dans Pix App (PIX-7021)
- [#5588](https://github.com/1024pix/pix/pull/5588) [BUGFIX]  Corriger l'affichage du nombre 0 dans la dropdown de palier de type niveau (PIX-6951)
- [#5597](https://github.com/1024pix/pix/pull/5597) [BUGFIX] Cacher correctement le liens d'évitement lorsqu'une bannière de com est active (PIX-7006)

## v3.320.0 (06/02/2023)


### :rocket: Amélioration
- [#5593](https://github.com/1024pix/pix/pull/5593) [FEATURE] Création de la nouvelle page d'import de sessions en masse (PIX-6947).
- [#5568](https://github.com/1024pix/pix/pull/5568) [FEATURE] Permettre de créer des organisations via import CSV depuis Pix Admin (PIX-6839)

## v3.319.0 (03/02/2023)


### :rocket: Amélioration
- [#5601](https://github.com/1024pix/pix/pull/5601) [FEATURE] Améliorer l'export JSON proposé au niveau de la page de sélection des sujets (PIX-6993)
- [#5587](https://github.com/1024pix/pix/pull/5587) [FEATURE] Accès aux onglets "Déclencheurs" et "Profils Cibles" sur le détail de Contenu formatif (PIX-6987).
- [#5595](https://github.com/1024pix/pix/pull/5595) [FEATURE] Ne pas obliger la création de clés de traduction en anglais pour PixAdmin (PIX-7001)
- [#5600](https://github.com/1024pix/pix/pull/5600) [FEATURE] Activer/désactiver le champ `isForAbsoluteNovice` d'une campagne grâce à un script (PIX-6998).
- [#5575](https://github.com/1024pix/pix/pull/5575) [FEATURE] Permettre la sauvegarde d'un déclencheur de contenu formatif (PIX-6884).

### :building_construction: Tech
- [#5596](https://github.com/1024pix/pix/pull/5596) [TECH] Améliorer l'accessibilité de Pix App en déclarant une couleur de police par défaut (PIX-6867).
- [#5423](https://github.com/1024pix/pix/pull/5423) [TECH] Retirer Bookshelf du repository des Sessions
- [#5576](https://github.com/1024pix/pix/pull/5576) [TECH] Mise à jour des packages de Pix Orga (Pix-6966)
- [#5589](https://github.com/1024pix/pix/pull/5589) [TECH] Améliorer la pertinence de l'alternative textuelle de l'image de la Marianne dans le menu de navigation et du pied de page sur Pix App (PIX-6806).
- [#5538](https://github.com/1024pix/pix/pull/5538) [TECH] Supprime la colonne des centres end-test-screen-removal (PIX-6612)
- [#5582](https://github.com/1024pix/pix/pull/5582) [TECH] supprimer du CSS inutile dans PixApp

## v3.318.0 (02/02/2023)


### :rocket: Amélioration
- [#5574](https://github.com/1024pix/pix/pull/5574) [FEATURE] Empêcher l'enregistrement de sessions déjà existantes (PIX-6954).
- [#5430](https://github.com/1024pix/pix/pull/5430) [FEATURE] Ajouter le référentiel Pix+ France à la page de sélection de sujets sur PixOrga (PIX-6032)
- [#5563](https://github.com/1024pix/pix/pull/5563) [FEATURE] Simulateur nouveau scoring : Utiliser les challenges archivés (PIX-6920)

### :building_construction: Tech
- [#5577](https://github.com/1024pix/pix/pull/5577) [TECH] Tracer de manière détaillée l'envoi d'email
- [#5578](https://github.com/1024pix/pix/pull/5578) [TECH] Réduire la largeur de plusieurs colonnes sur la table des élèves sur Pix Orga (PIX-6971).
- [#5592](https://github.com/1024pix/pix/pull/5592) [TECH] Suppression des vieilles versions du changelog
- [#5570](https://github.com/1024pix/pix/pull/5570) [TECH] Affichage des liens sur la page de finalisation de session (PIX-6907)
- [#5585](https://github.com/1024pix/pix/pull/5585) [TECH] Retourner depuis l'API les champs `maxReachableLevel` et `maxReachablePixScore` (PIX-6934).
- [#5581](https://github.com/1024pix/pix/pull/5581) [TECH] Utiliser les mêmes règles de lint CSS dans les front
- [#5579](https://github.com/1024pix/pix/pull/5579) [TECH]  Remplace l'utilisation bookshelf dans le repository campaign
- [#5583](https://github.com/1024pix/pix/pull/5583) [TECH] Améliorer l’accessibilité de la page Connexion sur Pix App (PIX-6788). 

### :bug: Correction
- [#5549](https://github.com/1024pix/pix/pull/5549) [BUGFIX]  La sauvegarde de l'assessement-result directement depuis admin est corrompue (PIX-6895)
- [#5580](https://github.com/1024pix/pix/pull/5580) [BUGFIX] Corriger les tests flakys aléatoires `An error occurred while fetching https://lcms-test.pix.fr/api`

### :coffee: Autre
- [#5431](https://github.com/1024pix/pix/pull/5431) Monter la version de PG de 13 à 14 en local et sur la CI

## v3.317.0 (31/01/2023)


### :rocket: Amélioration
- [#5565](https://github.com/1024pix/pix/pull/5565) [FEATURE] Afficher le score par compétence sur la page de fin de campagne Flash (PIX-6902).
- [#5559](https://github.com/1024pix/pix/pull/5559) [FEATURE] Ajout de candidats à partir d'un id de session dans le csv d'import en masse (PIX-6180).
- [#5548](https://github.com/1024pix/pix/pull/5548) [FEATURE] Création de(s) candidat(s) depuis l'import du fichier csv sessions en masse (PIX-6176)

### :building_construction: Tech
- [#5564](https://github.com/1024pix/pix/pull/5564) [TECH] Amélioration de l’accessibilité sur Pix Orga (PIX-6853).

### :bug: Correction
- [#5573](https://github.com/1024pix/pix/pull/5573) [BUGFIX] Raccourcir le placeholder du champs certificabilité (PIX-6926)
- [#5567](https://github.com/1024pix/pix/pull/5567) [BUGFIX] Réparer les select qui ont été cassés suite à la montée de version de pix ui (PIX-6909)

## v3.316.1 (30/01/2023)


### :bug: Correction
- [#5571](https://github.com/1024pix/pix/pull/5571) [BUGFIX] corriger une régression visuelle des intitulées de réponse dans les QCM et SCU

## v3.316.0 (30/01/2023)


### :rocket: Amélioration
- [#5557](https://github.com/1024pix/pix/pull/5557) [FEATURE] Définir la pagination par défaut des pages à 50 éléments (PIX-6908)
- [#5556](https://github.com/1024pix/pix/pull/5556) [FEATURE] Renvoyer le score Pix par compétence dans la route `assessment-result` (PIX-6901)
- [#5560](https://github.com/1024pix/pix/pull/5560) [FEATURE] Ajouter un titre dans la carte de tutoriel (PIX-6810)
- [#5552](https://github.com/1024pix/pix/pull/5552) [FEATURE] Ajout d'une page de détail de contenu formatif dans Pix Admin (PIX-6733)
- [#5553](https://github.com/1024pix/pix/pull/5553) [FEATURE] Améliorer le contraste du texte au survol du menu utilisateur sur Pix App (PIX-6814).

### :building_construction: Tech
- [#5498](https://github.com/1024pix/pix/pull/5498) [TECH] Implémenter Normalize/Reset CSS dans Pix App (PIX-3026)
- [#5546](https://github.com/1024pix/pix/pull/5546) [TECH] Remplace l'utilisation bookshelf dans le repository organization-learners
- [#5566](https://github.com/1024pix/pix/pull/5566) [TECH] Ajout d'un script pour tester l'eligibilité d'un.e utilisat.eur.rice (PIX-6929)
- [#5555](https://github.com/1024pix/pix/pull/5555) [TECH] Supprimer le script de rattachement des profils cible inutilisé (PIX-5964).

### :bug: Correction
- [#5569](https://github.com/1024pix/pix/pull/5569) [BUGFIX] Corriger l'erreur rendant impossible la lecture des détails utilisateur sur Pix Admin (PIX-6941).
- [#5562](https://github.com/1024pix/pix/pull/5562) [BUGFIX] L'utilisateur ne peut ni créer ni modifier des paliers de type "niveau" dans PixAdmin (PIX-6928)

## v3.315.0 (27/01/2023)


### :rocket: Amélioration
- [#5519](https://github.com/1024pix/pix/pull/5519) [FEATURE][ADMIN] Afficher l'information si le mot de passe est temporaire (PIX-6803)
- [#5551](https://github.com/1024pix/pix/pull/5551) [FEATURE] Séparer les résultats Flash des Participant Results (PIX-6746).
- [#5545](https://github.com/1024pix/pix/pull/5545) [FEATURE] Ajouter le score par compétence dans le simulateur nouveau scoring (PIX-6769)
- [#5534](https://github.com/1024pix/pix/pull/5534) [FEATURE] Permettre d'avoir une surveillant par ligne pour une meme session importée (PIX-6727)
- [#5547](https://github.com/1024pix/pix/pull/5547) [FEATURE] Aligner graphiquement les pages de résultats de collecte d eprofils avec celle des évaluations dans Pix APP (PIX-6165)
- [#5542](https://github.com/1024pix/pix/pull/5542) [FEATURE] Afficher les heures au format 24 au lieu de 12 dans les exports des résultats  (PIX-6898)

### :building_construction: Tech
- [#5543](https://github.com/1024pix/pix/pull/5543) [TECH] La catégorie CONNECTION_OR_END_SCREEN devrait être dépréciée (PIX-6582)
- [#5429](https://github.com/1024pix/pix/pull/5429) [TECH] Retirer la référence circulaire domaine-compétence via l'attribut "area" dans le modèle "Competence" dans l'API (PIX-6665)
- [#5500](https://github.com/1024pix/pix/pull/5500) [TECH] Retirer la desactivation de l'espace surveillant (PIX-6615)

### :bug: Correction
- [#5561](https://github.com/1024pix/pix/pull/5561) [BUGFIX] Réparer le partitionnement des tests PixApp (PIX-6927)

## v3.314.0 (25/01/2023)


### :rocket: Amélioration
- [#5544](https://github.com/1024pix/pix/pull/5544) [FEATURE] Retirer le message d'inscription/connexion lorsque l'utilisateur est connecté sur la page d'envoi de profil sur PixAPP (PIX-6163)

### :building_construction: Tech
- [#5540](https://github.com/1024pix/pix/pull/5540) [TECH] Avoir un nommage cohérent pour le filtre des types de connexion dans l'API (Pix-6712)
- [#5486](https://github.com/1024pix/pix/pull/5486) [TECH] Améliorer l’accessibilité de la page Inscription sur Pix App (PIX-6782).

### :bug: Correction
- [#5550](https://github.com/1024pix/pix/pull/5550) [BUGFIX] Replacer la création des tag dans la page administration géré par les rôles ADMIN (PIX-6900)

## v3.313.0 (25/01/2023)


### :rocket: Amélioration
- [#5530](https://github.com/1024pix/pix/pull/5530) [FEATURE] Ajout d'un champ de filtre pour la liste des tags (PIX-6737)
- [#5539](https://github.com/1024pix/pix/pull/5539) [FEATURE] Permettre d'associer le SSO FWB à une organisation (PIX-6893)
- [#5533](https://github.com/1024pix/pix/pull/5533) [FEATURE] Ajouter un contexte et un jeu de données à la simulation (PIX-6890).
- [#5531](https://github.com/1024pix/pix/pull/5531) [FEATURE] Prise en compte du type de centre dans la génération du csv: Tarification (PIX-6179)
- [#5526](https://github.com/1024pix/pix/pull/5526) [FEATURE] Améliorer la sémantique des listes de cartes de compétence (PIX-6817).

### :building_construction: Tech
- [#5536](https://github.com/1024pix/pix/pull/5536) [TECH] Supprimer les relations inexistantes dans le serializer user.
- [#5532](https://github.com/1024pix/pix/pull/5532) [TECH] Séparer la route tools en deux (PIX-6882)
- [#5525](https://github.com/1024pix/pix/pull/5525) [TECH] Un test unitaire du "mailer" est échec en local (PIX-6883)

### :bug: Correction
- [#5535](https://github.com/1024pix/pix/pull/5535) [BUGFIX] Réparer le champ pour modifier le SSO d'une organisation sur Pix Admin (PIX-6886).
- [#5524](https://github.com/1024pix/pix/pull/5524) [BUGFIX] On ne peut plus choisir la langue du PDF du profil cible sur PixAdmin dans la modale (PIX-6876)

## v3.312.0 (23/01/2023)


### :rocket: Amélioration
- [#5517](https://github.com/1024pix/pix/pull/5517) [FEATURE] Simulateur scoring actuel : Calculer le score par compétence (PIX-6768)
- [#5527](https://github.com/1024pix/pix/pull/5527) [FEATURE] Ajouter un lien sur les Parcours dans l'onglet d'une organisation (PIX-6881)
- [#5515](https://github.com/1024pix/pix/pull/5515) [FEATURE] Simulateur scoring flash : pouvoir choisir la langue des épreuves utilisées (PIX-6856)
- [#5523](https://github.com/1024pix/pix/pull/5523) [FEATURE] Ajouter une route API pour récupérer un contenu formatif à partir de son ID (PIX-6732)
- [#5518](https://github.com/1024pix/pix/pull/5518) [FEATURE] Afficher les statistiques des campagnes dans la page de détail d'un prescrit (PIX-6143)
- [#5508](https://github.com/1024pix/pix/pull/5508) [FEATURE][ADMIN] Proposer les tags récemment utilisés lors de l'ajout d'un tag à une organisation (PIX-6740)
- [#5522](https://github.com/1024pix/pix/pull/5522) [FEATURE] Ajouter les certifs complémentaires habilitées sur le CSV d'import en masse (PIX-6178).
- [#5512](https://github.com/1024pix/pix/pull/5512) [FEATURE] Ajout d'un texte spécifique pour lecteur d'écran sur le bouton de reset des filtres des tutoriels
- [#5493](https://github.com/1024pix/pix/pull/5493) [FEATURE] Permettre de modifier les champs de seuil de pré-requis et d'objectif pour les contenus formatifs (PIX-6730)
- [#5507](https://github.com/1024pix/pix/pull/5507) [FEATURE] Rendre le template de session compatible avec excel (PIX-6658)
- [#5509](https://github.com/1024pix/pix/pull/5509) [FEATURE] Changement du format de date des sessions pour l'import en masse (PIX-6845).

### :building_construction: Tech
- [#5528](https://github.com/1024pix/pix/pull/5528) [TECH] Mise à jour d'Oppsy.
- [#5513](https://github.com/1024pix/pix/pull/5513) [TECH] Harmonise et renforce les règles de lint CSS
- [#5473](https://github.com/1024pix/pix/pull/5473) [TECH] Montée en version Pix UI vers v24.0.1 (PIX-6493)
- [#5502](https://github.com/1024pix/pix/pull/5502) [TECH] Utiliser les champs scorecards venant de l'API dans Pix App (PIX-6831).

### :bug: Correction
- [#5520](https://github.com/1024pix/pix/pull/5520) [BUGFIX] La pages des résultats dans PixOrga ne s'affiche pas (PIX-6847).
- [#5505](https://github.com/1024pix/pix/pull/5505) [BUGFIX] Corriger les seeds : un CDC ne peut pas avoir plusieurs orga SCO rattachées (PIX-6796)
- [#5521](https://github.com/1024pix/pix/pull/5521) [BUGFIX] Retirer une classe non utilisée après un mise à jour de PixUI (PIX-6636).
- [#5504](https://github.com/1024pix/pix/pull/5504) [BUGFIX] Supprimer les divs dans les boutons présents dans la page de détails d'une compétence (PIX-6807).
- [#5516](https://github.com/1024pix/pix/pull/5516) [BUGFIX] Ré-aligner le design Pix Orga suite au Normalize (Pix-6858)

### :coffee: Autre
- [#5341](https://github.com/1024pix/pix/pull/5341) [ADR] Création d'un ADR pour formaliser la logique et la stratégie de gestion des paramètres régionaux et des langues (locales & languages) (PIX-6507)
- [#5514](https://github.com/1024pix/pix/pull/5514) [CHORE] Mise à jour de pix-ui en version 24.0.2 (PIX-6859)

## v3.311.0 (19/01/2023)


### :rocket: Amélioration
- [#5511](https://github.com/1024pix/pix/pull/5511) [FEATURE] Simulateur nouveau scoring : Ajouter un flag permettant le recalcul de la capacité (PIX-6832)
- [#5503](https://github.com/1024pix/pix/pull/5503) [FEATURE] Simulateur de nouveau scoring (PIX-6766)
- [#5338](https://github.com/1024pix/pix/pull/5338) [FEATURE] Nettoyer les tests de Pix App avec testing library (PIX-6382)
- [#5499](https://github.com/1024pix/pix/pull/5499) [FEATURE] Accepter un identifiant de simulation en entrée du simulateur d'ancien score (PIX-6820)
- [#5484](https://github.com/1024pix/pix/pull/5484) [FEATURE] Formater le champs durée d'un contenu formatif dans l'API (PIX-6773)
- [#5438](https://github.com/1024pix/pix/pull/5438) [FEATURE] Validation des candidats des sessions lors de l'import (PIX-6175).
- [#5487](https://github.com/1024pix/pix/pull/5487) [FEATURE] Simuler le score Pix avec l'ancien algorithme (PIX-6763).
- [#5496](https://github.com/1024pix/pix/pull/5496) [FEATURE] Bloquer les imports SIECLE dans Pix Orga si il manque le code de la ville de naissance pour les élèves nés en France (PIX-6795)

### :building_construction: Tech
- [#5492](https://github.com/1024pix/pix/pull/5492) [TECH] Implémenter Normallize/Reset CSS dans  Pix-admin (PIX-3024)
- [#5501](https://github.com/1024pix/pix/pull/5501) [TECH] Prévenir les faux positifs dûs au helper catchErr (PIX-6828)

### :bug: Correction
- [#5510](https://github.com/1024pix/pix/pull/5510) [BUGFIX] Format de la donnée "code sexe" pour import Fregata dans Pix Orga (PIX-6846)
- [#5490](https://github.com/1024pix/pix/pull/5490) [BUGFIX] L'image et le titre de la page parcours ne sont pas centrés (PIX-6777).

### :coffee: Autre
- [#5506](https://github.com/1024pix/pix/pull/5506) [CHORE] Changer le nombre de résultats par défaut pour les organisations pro (PIX-6789)

## v3.310.0 (16/01/2023)


### :rocket: Amélioration
- [#5481](https://github.com/1024pix/pix/pull/5481) [FEATURE] Bloquer les imports SIECLE et Fregata si les données ne sont pas conformes pour le CPF (PIX-6118)
- [#5497](https://github.com/1024pix/pix/pull/5497) [FEATURE] Annuler toutes les invitations à rejoindre une organisation qui sont actuellement en attente et non mis à jour depuis plus d'un an (PIX-6794)
- [#5467](https://github.com/1024pix/pix/pull/5467) [FEATURE] Changer le texte du lien vers le site vitrine depuis App (PIX-6748).
- [#5494](https://github.com/1024pix/pix/pull/5494) [FEATURE][ADMIN] Afficher un message d'information lorsqu'une organisation n'a pas de tags (PIX-6739)

### :building_construction: Tech
- [#5475](https://github.com/1024pix/pix/pull/5475) [TECH] Implémenter le Normalize/Reset dans Pix Orga (Pix-3025)
- [#5363](https://github.com/1024pix/pix/pull/5363) [TECH] Utiliser la table associative des dernier assessment results  pour eviter des requetes complexes (PIX-6537)

## v3.309.0 (13/01/2023)


### :rocket: Amélioration
- [#5433](https://github.com/1024pix/pix/pull/5433) [FEATURE] Informer l'utilisateur que son compte est bloqué de manière uniforme dans Pix Orga, Pix Certif et Pix Admin (PIX-6435)
- [#5495](https://github.com/1024pix/pix/pull/5495) [FEATURE] Créer une route pour l'appel au simulateur de l'algorithme Flash (PIX-6765).
- [#5485](https://github.com/1024pix/pix/pull/5485) [FEATURE][ADMIN] Après création d'une organisation, rediriger l'utilisateur vers l'onglet listant les tags (PIX-6738)

### :bug: Correction
- [#5483](https://github.com/1024pix/pix/pull/5483) [BUGFIX] Redonner un style de puces aux listes des modales "Réponses et tutos" (PIX-6783)

### :coffee: Autre
- [#5489](https://github.com/1024pix/pix/pull/5489) [BUGIFX][ADMIN] Améliorer la gestion des erreurs lors de l'envoi d'une invitation à rejoindre un centre de certification (PIX-6779)

## v3.308.0 (11/01/2023)


### :rocket: Amélioration
- [#5488](https://github.com/1024pix/pix/pull/5488) [FEATURE] Mettre à jour les textes de la page d'accueil d'une campagne pour convenir à tous nos publics (PIX-6786)
- [#5476](https://github.com/1024pix/pix/pull/5476) [FEATURE] Améliorer la validation de données pour la route de création des contenus formatifs (PIX-6753)
- [#5474](https://github.com/1024pix/pix/pull/5474) [FEATURE] Garantir qu'on ne compte pas un acquis plusieurs fois dans le score Pix direct (PIX-6744)
- [#5391](https://github.com/1024pix/pix/pull/5391) [FEATURE] Permettre à un admin de Pix Orga de renvoyer une invitation (PIX-463)

### :building_construction: Tech
- [#5393](https://github.com/1024pix/pix/pull/5393) [TECH] Trier les traductions dans l'API
- [#5471](https://github.com/1024pix/pix/pull/5471) [TECH] Suppression du script de création des contenus formatif (PIX-6759)
- [#5479](https://github.com/1024pix/pix/pull/5479) [TECH] Supprimer la dépendance `@1024pix/ember-testing-library` qui se trouve à la racine (PIX-6778).
- [#5477](https://github.com/1024pix/pix/pull/5477) [TECH] Rendre les PixSelect QROCM compatibles avec l'auto-answer (PIX-6774)

### :bug: Correction
- [#5482](https://github.com/1024pix/pix/pull/5482) [BUGFIX] Aligner les boutons dans la modale de suppression d'un membre sur Pix Orga (PIX-6734).
- [#5480](https://github.com/1024pix/pix/pull/5480) [BUGFIX][ADMIN] Laisser afficher la mention archivée lors de la mise à jour des tags d'une organisation (PIX-6445)

## v3.307.0 (10/01/2023)


### :rocket: Amélioration
- [#5472](https://github.com/1024pix/pix/pull/5472) [FEATURE] Créer une route pour l'appel au simulateur (PIX-6762)
- [#5463](https://github.com/1024pix/pix/pull/5463) [FEATURE] Personnalisation du message de détail de l'activité d'un prescrit sans participations
- [#5408](https://github.com/1024pix/pix/pull/5408) [FEATURE] Créer des contenus formatifs sur Pix Admin (PIX-6320)

### :building_construction: Tech
- [#5449](https://github.com/1024pix/pix/pull/5449) [TECH] Suppression de tests d'acceptance sur la pérennité des comptes dans l'API (PIX-1544).
- [#5468](https://github.com/1024pix/pix/pull/5468) [TECH] Réparer l'usage du CLI des tests de l'algo
- [#5417](https://github.com/1024pix/pix/pull/5417) [TECH] Séparer les phases de test et de lint dans la CI
- [#5470](https://github.com/1024pix/pix/pull/5470) [TECH] Mise à jour du projectId cypress

### :bug: Correction
- [#5466](https://github.com/1024pix/pix/pull/5466) [BUGFIX] L'utilisateur est bloqué définitivement alors qu'il ne devrait pas (PIX-6749)

## v3.306.0 (09/01/2023)


### :rocket: Amélioration
- [#5464](https://github.com/1024pix/pix/pull/5464) [FEATURE] Rendre l'élève cliquable pour accéder a sa page de détail (PIX-6701)
- [#5457](https://github.com/1024pix/pix/pull/5457) [FEATURE] Changement de la date de fin de passage des sessions dans le SCO (PIX-6731).
- [#5448](https://github.com/1024pix/pix/pull/5448) [FEATURE] Paramétrer la date de mise à jour de la politique de confidentialité avec une variable d'environnement (PIX-6597)
- [#5465](https://github.com/1024pix/pix/pull/5465) [FEATURE] Afficher le score Pix calculé à la fin de la campagne flash (PIX-6720)
- [#5458](https://github.com/1024pix/pix/pull/5458) [FEATURE] Flash : Calculer le nombre de Pix obtenus par inférence (PIX-6719)
- [#5356](https://github.com/1024pix/pix/pull/5356) [FEATURE] Afficher le bandeau de la nouvelle politique de confidentialité sur Pix App (PIX-6220).
- [#5462](https://github.com/1024pix/pix/pull/5462) [FEATURE] Afficher le prénom / nom de l'élève dans sa page de détail (PIX-6699)
- [#5439](https://github.com/1024pix/pix/pull/5439) [FEATURE] Afficher le nom du membre qui a fait l'action d'anonymisation sur la page de détail d'un utilisateur dans Pix Admin (PIX-4221).
- [#5456](https://github.com/1024pix/pix/pull/5456) [FEATURE] Rendre l'étudiant cliquable pour accéder a sa page de détail (PIX-6702)
- [#5455](https://github.com/1024pix/pix/pull/5455) [FEATURE] Afficher le prénom / nom de l'étudiant dans sa page de détail (PIX-6700)
- [#5454](https://github.com/1024pix/pix/pull/5454) [FEATURE] Calculer le score Pix total pour des questions flash auxquelles l'utilisateur a répondu (PIX-6717).
- [#5441](https://github.com/1024pix/pix/pull/5441) [FEATURE] Calculer la capacité minimum pour une probabilité donnée (PIX-6713)
- [#5436](https://github.com/1024pix/pix/pull/5436) [FEATURE] Migration de reprise des données des utilisateurs déjà anonymisés (PIX-6630)

### :building_construction: Tech
- [#5428](https://github.com/1024pix/pix/pull/5428) [TECH] Supprimer les règles .editorconfig obsolètes
- [#5390](https://github.com/1024pix/pix/pull/5390) [TECH] Supprimer le template de PR en doublon
- [#5450](https://github.com/1024pix/pix/pull/5450) [TECH] Met à jour les packages vulnérable de l'API
- [#5445](https://github.com/1024pix/pix/pull/5445) [TECH] Linter les titres de PR
- [#5447](https://github.com/1024pix/pix/pull/5447) [TECH] Bloquer la finalisation de la session s'il manque des "abort reasons" (PIX-6722)
- [#5432](https://github.com/1024pix/pix/pull/5432) [TECH] Simplification du modèle CertifiableBadgeAcquisition (PIX-6742)
- [#5397](https://github.com/1024pix/pix/pull/5397) [TECH] Déplacer la logique métier des scorecards dans l'API (PIX-6629)
- [#5459](https://github.com/1024pix/pix/pull/5459) [TECH] Supprimer une notification slack non utilisée.
- [#5453](https://github.com/1024pix/pix/pull/5453) [TECH] Correction d'un test flaky sur l'api
- [#5311](https://github.com/1024pix/pix/pull/5311) [TECH] Ajouter les catégories et sous-catégories de signalements en BDD (PIX-6510)

### :bug: Correction
- [#5452](https://github.com/1024pix/pix/pull/5452) [BUGFIX] Navigation erronée entre les onglets de campagnes et la page de campagne
- [#5460](https://github.com/1024pix/pix/pull/5460) [BUGFIX] Corriger le test en erreur sur get user shared profile (PIX-6708)
- [#5402](https://github.com/1024pix/pix/pull/5402) [BUGFIX] Améliorer la gestion des erreurs lors de l'envoi d'une invitation à rejoindre une organisation (PIX-6420)
- [#5434](https://github.com/1024pix/pix/pull/5434) [BUGFIX] Corriger le design des nouveaux boutons du Design System sur Pix-App (PIX-6576)

### :coffee: Autre
- [#5446](https://github.com/1024pix/pix/pull/5446) [DOC] Mettre les bons numéros pour les ADR existantes.
- [#5440](https://github.com/1024pix/pix/pull/5440)  [TECH] Créer un composant information pour extraire les informations avec un titre et une donnée (PIX-6145).
- [#5443](https://github.com/1024pix/pix/pull/5443) [CLEANUP] Tri les usecases par ordre alphabétique

## v3.305.0 (04/01/2023)


### :rocket: Amélioration
- [#5427](https://github.com/1024pix/pix/pull/5427) [FEATURE] Changer le select de la méthode de connexion pour un multi select orga sco (PIX-6626)
- [#5424](https://github.com/1024pix/pix/pull/5424) [FEATURE] Rendre le participant cliquable pour accéder a sa page de détail (PIX-6066)
- [#5419](https://github.com/1024pix/pix/pull/5419) [FEATURE] Afficher le prénom / nom du participant dans sa page de détail  (PIX-6140).
- [#5420](https://github.com/1024pix/pix/pull/5420) [FEATURE] Identifier l'utilisateur admin qui a anonymisé un utilisateur (PIX-4214)
- [#5418](https://github.com/1024pix/pix/pull/5418) [FEATURE] Gestion des créations et groupage par session  (PIX-6659)
- [#5287](https://github.com/1024pix/pix/pull/5287) [FEATURE] Ajout d'une page de détails d'un prescrit et le tableau de son activité (PIX-6064).
- [#5345](https://github.com/1024pix/pix/pull/5345) [FEATURE] Ajout d'une nouvelle route qui répond toujours OK à la question courante

### :building_construction: Tech
- [#5166](https://github.com/1024pix/pix/pull/5166) [TECH] Supprimer la route inutilisée api/users/id/membership (PIX-815).
- [#5097](https://github.com/1024pix/pix/pull/5097) [TECH] Ne pas attendre la connexion PoleEmploi plus longtemps que ce que Scalingo permet
- [#5396](https://github.com/1024pix/pix/pull/5396) [TECH] Test de reproduction du bug des modales avec input suite montée en version Pix UI (PIX-6492)

### :bug: Correction
- [#5426](https://github.com/1024pix/pix/pull/5426) [BUGFIX] Reprendre le design des tutoriels "Pour en apprendre davantage" sur Pix-App (PIX-6584)
- [#5435](https://github.com/1024pix/pix/pull/5435) [BUGFIX] Corriger l'erreur d'année sur un test CPF (pix-6704)

## v3.304.0 (29/12/2022)


### :rocket: Amélioration
- [#5421](https://github.com/1024pix/pix/pull/5421) [FEATURE] Remplacer la notion d'acquis par la notion de sujets dans la description d'un critère de RT sur PixAdmin (PIX-6545)

### :building_construction: Tech
- [#5098](https://github.com/1024pix/pix/pull/5098) [TECH] Renvoyer plus de détails dans les logs lors d'un appel en erreur sur PoleEmploi lors du parcours
- [#5422](https://github.com/1024pix/pix/pull/5422) [TECH] Ecrire correctement le terme "profil cible" dans les applicatifs / seeds (PIX-6660)
- [#5410](https://github.com/1024pix/pix/pull/5410) [TECH] Remplacer le PixDropdown du choix du propriétaire par le nouveau PixSelect (PIX-6055)

### :bug: Correction
- [#5403](https://github.com/1024pix/pix/pull/5403) [BUGFIX] Clé expirée à tort par `InMemoryTemporaryStorage.update()`
- [#5415](https://github.com/1024pix/pix/pull/5415) [BUGFIX] Afficher la date au format sélectionné sur la page de garde du PDF d'un profil cible (PIX-6377)
- [#5414](https://github.com/1024pix/pix/pull/5414) [BUGFIX] Corriger les propositions de choix de langue lors du téléchargement PDF d'un profil cible (PIX-6376)

### :coffee: Autre
- [#5425](https://github.com/1024pix/pix/pull/5425) [CHORE] Mise a jour de Pix-ui a la version 23.3.0 dans pix orga (PIX-6142).
- [#5416](https://github.com/1024pix/pix/pull/5416) [CHORE] Changer le nombre de résultats par défaut pour les organisations SUP (PIX-6625)
- [#5411](https://github.com/1024pix/pix/pull/5411) [CHORE] Changer le nombre de résultats par défaut pour les organisations SCO (PIX-6624)

## v3.303.0 (27/12/2022)


### :rocket: Amélioration
- [#5354](https://github.com/1024pix/pix/pull/5354) [FEATURE] Création de sessions lors de l'import en masse via CSV (PIX-6174).
- [#5401](https://github.com/1024pix/pix/pull/5401) [FEATURE] Logguer les emails en erreur lors de la publication (PIX-6337)

### :building_construction: Tech
- [#5409](https://github.com/1024pix/pix/pull/5409) [TECH] Suppression tâche inutilisée
- [#5384](https://github.com/1024pix/pix/pull/5384) [TECH] Dissocier les prescriptions d'un étudiant lors de son anonymisation sur Pix Admin (PIX-5441)
- [#5395](https://github.com/1024pix/pix/pull/5395) [TECH] Enlever bookshelf du repository user (PART-1)
- [#5388](https://github.com/1024pix/pix/pull/5388) [TECH] Ne plus ajouter de lien vers la review-app dans la pull-request
- [#5392](https://github.com/1024pix/pix/pull/5392) [TECH] Remplacer moment par dayjs dans les tests de l'API

### :bug: Correction
- [#5385](https://github.com/1024pix/pix/pull/5385) [BUGFIX] Changer la méthode d'import des candidats pour réafficher les messages d'erreur (PIX-6587)
- [#5398](https://github.com/1024pix/pix/pull/5398) [BUGFIX] Corriger l'affichage du PixSelect lors du changement de rôle dans Pix Orga (PIX-6617)

### :coffee: Autre
- [#5342](https://github.com/1024pix/pix/pull/5342) Mettre à disposition un environnement de développement simplifié en utilisant docker-compose

## v3.302.1 (22/12/2022)


### :bug: Correction
- [#5400](https://github.com/1024pix/pix/pull/5400) [BUGFIX] Corriger taille input (PIX-6639)

## v3.302.0 (22/12/2022)


### :rocket: Amélioration
- [#5380](https://github.com/1024pix/pix/pull/5380) [FEATURE] Utiliser le composant PixFilterableAndSearchableSelect pour la création de campagne d'évaluation de participants (PIX-6054)

### :building_construction: Tech
- [#5399](https://github.com/1024pix/pix/pull/5399) [TECH] Modifier le script de mise à jour des certification issue reports (PIX-6635)
- [#5350](https://github.com/1024pix/pix/pull/5350) [TECH] Stocker le lien entre un certif-course et le dernier assessment-result (PIX-6527)
- [#5361](https://github.com/1024pix/pix/pull/5361) [TECH] Exclusion des certifications déjà prises en comptes (PIX-6523)
- [#5300](https://github.com/1024pix/pix/pull/5300) [TECH] Vide les tables après les tests d'integration et acceptance
- [#5382](https://github.com/1024pix/pix/pull/5382) [TECH] Mettre à jour Pix UI de 20.2.4 à 23.1.2 dans Pix App (PIX-6581)
- [#5383](https://github.com/1024pix/pix/pull/5383) [TECH] Créer des données de test pour coder joyeusement la migration des profil cibles depuis des fichiers excel (PIX-6560)
- [#5381](https://github.com/1024pix/pix/pull/5381) [TECH] Utilise ILIKE dans les requêtes SQL plutôt que d'utiliser LOWER(column) LIKE %inputlowercase%

## v3.301.0 (19/12/2022)


### :rocket: Amélioration
- [#5374](https://github.com/1024pix/pix/pull/5374) [FEATURE] Ajout d'une route dans l'API pour créer des contenus formatifs (PIX-6416)
- [#5353](https://github.com/1024pix/pix/pull/5353) [FEATURE] Changer le modèle du kit surveillant pour mettre un fond blanc (PIX-6491)

### :bug: Correction
- [#5379](https://github.com/1024pix/pix/pull/5379) [BUGFIX] Evite de couper le titre de la carte tutos (PIX-6573)
- [#5376](https://github.com/1024pix/pix/pull/5376) [BUGFIX] Cliquer en dehors du menu utilisateur doit le fermer (PIX-6571)

## v3.300.0 (16/12/2022)


### :rocket: Amélioration
- [#5369](https://github.com/1024pix/pix/pull/5369) [FEATURE] Utiliser les informations de l'éditeur de contenus formatifs (PIX-6139)

### :building_construction: Tech
- [#5371](https://github.com/1024pix/pix/pull/5371) [TECH] Aligner les montées de versions npm / node sur le mono repo (PIX-6533)
- [#5365](https://github.com/1024pix/pix/pull/5365) [TECH] Ajouter un categoryId au certification issue report (PIX-6542)

### :bug: Correction
- [#5375](https://github.com/1024pix/pix/pull/5375) [BUGFIX] Corriger l'affichage de tooltip du bouton d'annulation d'une invitation sur Pix Orga (PIX-3912). 
- [#5373](https://github.com/1024pix/pix/pull/5373) [BUGFIX] Corriger la réinitialisation du formulaire et le chargement infini de la création de compte SCO sur pix App (PIX-6107).

## v3.299.0 (15/12/2022)


### :rocket: Amélioration
- [#5358](https://github.com/1024pix/pix/pull/5358) [FEATURE] Sauvegarde des infos de l'éditeur dans la table des contenus formatifs (PIX-6138)
- [#5360](https://github.com/1024pix/pix/pull/5360) [FEATURE] Générer les acquis de campagne à la création de celle-ci en fonction du profil cible choisi (PIX-5582).

### :building_construction: Tech
- [#5357](https://github.com/1024pix/pix/pull/5357) [TECH] Suppression de la route POST api/sessions non utilisée (PIX-6522).
- [#5368](https://github.com/1024pix/pix/pull/5368) [TECH] Déplacer le contenu de la table "target-profiles_skills" vers "campaign_skills" (PIX-5696)
- [#5372](https://github.com/1024pix/pix/pull/5372) [TECH] Vérifier qu'aucun acquis n'est enregistré lors de la création d'une campagne flash (PIX-6547).
- [#5362](https://github.com/1024pix/pix/pull/5362) [TECH] Correction d'un test flaky dans le repo cpf-certification-result.
- [#5325](https://github.com/1024pix/pix/pull/5325) [TECH] Amélioration des tests front-end autour de toutes les fonctionnalités impactées par l'epix sur la redéfinition des profil-cibles (PIX-5975)

### :bug: Correction
- [#5370](https://github.com/1024pix/pix/pull/5370) [BUGFIX] Les acquis de campagne ne sont pas générés pour les campagnes associés à de vieux profil cibles (PIX-6546)

## v3.298.0 (13/12/2022)


### :rocket: Amélioration
- [#5344](https://github.com/1024pix/pix/pull/5344) [FEATURE] Bloquer l’inscription d’un candidat à plusieurs certifications complémentaires (PIX-6274)
- [#5351](https://github.com/1024pix/pix/pull/5351) [FEATURE] Agrandir le champ d'invitation par email dans Pix Orga (PIX-3849)

### :building_construction: Tech
- [#5333](https://github.com/1024pix/pix/pull/5333) [TECH] Mettre à jour Pix-UI dans Pix Orga (Pix-6053)

### :bug: Correction
- [#5359](https://github.com/1024pix/pix/pull/5359) [BUGFIX] Use intl lang instead of prescriber lang (PIX-6524)
- [#5355](https://github.com/1024pix/pix/pull/5355) [BUGFIX] Correction le `box-shadow` de la page de fin de parcours (PIX-5518)

### :coffee: Autre
- [#5329](https://github.com/1024pix/pix/pull/5329) [DOC] Expliciter notre choix de mise à jour de dépendances (PIX-6481).

## v3.297.0 (12/12/2022)


### :rocket: Amélioration
- [#5334](https://github.com/1024pix/pix/pull/5334) [FEATURE] Nommer les groupes de critères d'obtention d'un RT lorsqu'ils portent sur un groupe d'acquis (PIX-6438)
- [#5340](https://github.com/1024pix/pix/pull/5340) [FEATURE] Permettre la saisie des infos DPO à la création d'une organisation (PIX-6236)
- [#5349](https://github.com/1024pix/pix/pull/5349) [FEATURE] Rendre l'accès au compte d'un utilisateur qui a été bloqué définitivement sur Pix Admin (PIX-6388).
- [#5336](https://github.com/1024pix/pix/pull/5336) [FEATURE] Rafraichir la liste des organisations et centres de certifications de l'utilisateur après anonymisation (PIX-6488)
- [#5335](https://github.com/1024pix/pix/pull/5335) [FEATURE] Ajouter le bouton de fermeture de bannière sur Pix Certif (pix-6494)

### :building_construction: Tech
- [#5343](https://github.com/1024pix/pix/pull/5343) [TECH]: Ajouter dans les seeds un user qui est membre de plusieurs organisations de types différents (PIX-6496)

## v3.296.0 (08/12/2022)


### :rocket: Amélioration
- [#5324](https://github.com/1024pix/pix/pull/5324) [FEATURE] Voir les informations d'un compte Pix bloqué sur Pix Admin (PIX-6387).
- [#5319](https://github.com/1024pix/pix/pull/5319) [FEATURE] Renommage Profil Cible en Parcours dans export csv (pix-6058)
- [#5330](https://github.com/1024pix/pix/pull/5330) [FEATURE][ADMIN] Lors de l'anonymisation, désactiver l'utilisateur des centres de certification dont il est membre (PIX-3841)
- [#5293](https://github.com/1024pix/pix/pull/5293) [FEATURE] Afficher "Mes parcours" dans le menu user au lancement d'une campagne (PIX-6327)
- [#5253](https://github.com/1024pix/pix/pull/5253) [FEATURE] Permettre de renseigner le nom et l'email du DPO à la création d'un centre de certif (PIX-6189).
- [#5260](https://github.com/1024pix/pix/pull/5260) [FEATURE][ADMIN] Lors de l'anonymisation, désactiver l'utilisateur des organisations dont il est membre (PIX-155)

### :building_construction: Tech
- [#5332](https://github.com/1024pix/pix/pull/5332) [TECH] Ajouter le support de Firefox 58.
- [#5339](https://github.com/1024pix/pix/pull/5339) [TECH] Trier les propriétés CSS sur Pix App
- [#5326](https://github.com/1024pix/pix/pull/5326) [TECH] Suppression du warning lié à browserslist lors du build des applications Pix (PIX-6475).
- [#5322](https://github.com/1024pix/pix/pull/5322) [TECH] Monter Pix Certif vers Ember 4.0.1 (Pix-6428).
- [#5328](https://github.com/1024pix/pix/pull/5328) [TECH] Améliorer la lisibilité des variables d'environnement liés au blocage de la connexion (PIX-6479)

### :bug: Correction
- [#5347](https://github.com/1024pix/pix/pull/5347) [BUGFIX] Récupérer les details d'une certification dans admin (PIX-6502)

### :coffee: Autre
- [#5331](https://github.com/1024pix/pix/pull/5331) [CLEANUP] Supprime le rate limiter

## v3.295.0 (05/12/2022)


### :rocket: Amélioration
- [#5306](https://github.com/1024pix/pix/pull/5306) [FEATURE] Utiliser un handler pour verifier l'appartenance à un membre du centre de certification lors de la création de session (PIX-6339)
- [#5321](https://github.com/1024pix/pix/pull/5321) [FEATURE] Améliorer l'accessibilité des pages sur Pix-App (PIX-6471)

### :building_construction: Tech
- [#5323](https://github.com/1024pix/pix/pull/5323) [TECH] Supprimer le texte RGPD sur la page inscription sur Pix App (PIX-6243)
- [#5314](https://github.com/1024pix/pix/pull/5314) [TECH] Monter Pix Admin vers Ember 4.0.1 (Pix-6450)
- [#5318](https://github.com/1024pix/pix/pull/5318) [TECH] Améliorer le temps d'exécution des tests sur Pix App (PIX-6468).

### :bug: Correction
- [#5327](https://github.com/1024pix/pix/pull/5327) [BUGFIX] Gérer le cas de RTs définis par des critères de type "tubes cappés" dont les acquis enfants n'existent pas dans le référentiel (PIX-6477)

## Anciennes version

Nous avons retiré de notre changelog les versions < v3.295.0. Elles sont disponibles en remontant dans l'historique du fichier jusqu'au 2 février 2023.
