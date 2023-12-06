# Pix Changelog

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
