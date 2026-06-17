# Pix Changelog

# [5.432.0](https://github.com/1024pix/pix/compare/v5.431.0...v5.432.0) (2026-06-16)

### :building_construction: Tech

- [#16507](https://github.com/1024pix/pix/pull/16507) Ajout d'un script pour faire la resynchronisation des dates de session avec leur première certification (PIX-23164) 

### :arrow_up: Montée de version

- [#16513](https://github.com/1024pix/pix/pull/16513) Update dependency axios to v1.17.0 (api) 
- [#16514](https://github.com/1024pix/pix/pull/16514) Update dependency oxfmt to ^0.53.0 (api) 
- [#16515](https://github.com/1024pix/pix/pull/16515) Update dependency pdfkit to ^0.19.0 (api) 
- [#16516](https://github.com/1024pix/pix/pull/16516) Update dependency undici to v8.4.0 (api)

# [5.431.0](https://github.com/1024pix/pix/compare/v5.430.0...v5.431.0) (2026-06-15)

### :rocket: Amélioration

- [#16499](https://github.com/1024pix/pix/pull/16499) Ajouter les nouvelles données dans la création d'un contenu formatif (PIX-23020) 
- [#16479](https://github.com/1024pix/pix/pull/16479) Créer une route qui remonte un centre de certif associé à une organisation (PIX-22628) 
- [#16492](https://github.com/1024pix/pix/pull/16492) Envoyer une propriété feature sur les campagnes de type moteur de reco (PIX-23083) 
- [#16493](https://github.com/1024pix/pix/pull/16493) Exclure les parcours combinés de la requête sur les quêtes dans le completeAssessment() (PIX-23095) 
- [#16508](https://github.com/1024pix/pix/pull/16508) MDX-121 RepondreMail_IND Corrections suite à la relecture finale 
- [#16449](https://github.com/1024pix/pix/pull/16449) MDX-140 RAG première inte 
- [#16504](https://github.com/1024pix/pix/pull/16504) Récupérer les nouvelles infos des contenus formatifs (PIX-23020) 
- [#16501](https://github.com/1024pix/pix/pull/16501) Supprime la table organization_learner_passage_participations (PIX-22558) 
- [#16491](https://github.com/1024pix/pix/pull/16491) Update IAGenBiais_IND.json - image pas dans dossier draft 

### :bug: Correction

- [#16500](https://github.com/1024pix/pix/pull/16500) Ne pas détacher tous les blueprints d'une organisation quand on en détache une (PIX-23122) 
- [#16497](https://github.com/1024pix/pix/pull/16497) problème de responsive sur l'icône des items des parcours combinés (PIX-22903) 

### :building_construction: Tech

- [#16452](https://github.com/1024pix/pix/pull/16452)  Ne plus lire depuis la table certification-subscriptions dans le contexte de session-for-supervising (PIX-22974) 
- [#16484](https://github.com/1024pix/pix/pull/16484) Créer des dossiers pour différencier les types d'objet du domaine au sein du BC quest (PIX-23148) 
- [#16488](https://github.com/1024pix/pix/pull/16488) Mettre en place le FT isSessionLogoutEnabled (PIX-23084) 
- [#16502](https://github.com/1024pix/pix/pull/16502) Supprime un script à usage unique 

### :arrow_up: Montée de version

- [#16511](https://github.com/1024pix/pix/pull/16511) Update pix-ui to v60.15.0 (orga)

# [5.430.0](https://github.com/1024pix/pix/compare/v5.429.0...v5.430.0) (2026-06-12)

### :rocket: Amélioration

- [#16482](https://github.com/1024pix/pix/pull/16482) Accepter les CGU Pix App avec le nouveau modèle (PIX-21743)  
- [#16406](https://github.com/1024pix/pix/pull/16406) Créer le composant modal du catalogue (panneau droit de détails d'un parcours) (PIX-22675) 
- [#16472](https://github.com/1024pix/pix/pull/16472) MDX-43 Intégration relectures édito + marine + conseils novice 
- [#16398](https://github.com/1024pix/pix/pull/16398) Modifier l'appel api/users/me pour qu'il fonctionne avec le nouveau modèle (PIX-22584) 
- [#16496](https://github.com/1024pix/pix/pull/16496) Modifs relecture MGO visio NOV 
- [#16392](https://github.com/1024pix/pix/pull/16392) Rendre l’expiration des tokens obligatoire et améliorer les méthodes restore des authenticators des applications Front (PIX-22655) 

### :bug: Correction

- [#16489](https://github.com/1024pix/pix/pull/16489) Corriger le compteur de candidats de l'espace surveillant (PIX-23040). 
- [#16481](https://github.com/1024pix/pix/pull/16481) Faire apparaître le nom de la certification et la durée correcte sur les écrans d'entrée en certif (PIX-23111) 
- [#16487](https://github.com/1024pix/pix/pull/16487) Message d'erreur erroné lors d'une tentative d'accès à une session déjà finalisée (PIX-23027) 

### :building_construction: Tech

- [#16494](https://github.com/1024pix/pix/pull/16494) Préparer le GitHub Actions pour la merge queue 
- [#16485](https://github.com/1024pix/pix/pull/16485) Refactoring variés dans le bounded-context d'inscription (PIX-23069)

# [5.429.0](https://github.com/1024pix/pix/compare/v5.428.0...v5.429.0) (2026-06-11)

### :rocket: Amélioration

- [#16475](https://github.com/1024pix/pix/pull/16475) Ajouter le tracking sur les accordéons de la modale (PIX-23074) 
- [#16469](https://github.com/1024pix/pix/pull/16469) MDX-121 RepondreMail_IND Corrections suite à la relecture édito et experts 
- [#16466](https://github.com/1024pix/pix/pull/16466) MDX-232 MoteurRech_NOV2 Corrections suite à la relecture édito 
- [#16473](https://github.com/1024pix/pix/pull/16473) MDX-32 modification illu accroche NR_Datacenter_NOV 

### :bug: Correction

- [#16467](https://github.com/1024pix/pix/pull/16467) Partager les resultats de toutes les quêtes obtenues (PIX-23051) 

### :building_construction: Tech

- [#16405](https://github.com/1024pix/pix/pull/16405) Déplace des models du scope quest dans un sous-dossier quest 
- [#16409](https://github.com/1024pix/pix/pull/16409) Déplacer ObfuscationService dans le contexte IAM 
- [#16478](https://github.com/1024pix/pix/pull/16478) Enlève des variables d'environnement plus utiles de la config front de Pix App (PIX-22942) 
- [#16476](https://github.com/1024pix/pix/pull/16476) Rend silencieuses les dépréciations ember de Pix Orga.

# [5.428.0](https://github.com/1024pix/pix/compare/v5.427.0...v5.428.0) (2026-06-10)

# [5.427.0](https://github.com/1024pix/pix/compare/v5.426.0...v5.427.0) (2026-06-09)

### :rocket: Amélioration

- [#16465](https://github.com/1024pix/pix/pull/16465) Affiche le lien de questionnaire en fin de parcours selon l'url défini pour le schéma de parcours (PIX-22937) 
- [#16442](https://github.com/1024pix/pix/pull/16442) Ajouter un prehandler permettant de vérifiant l'appartenance d'un blueprint à une organisation (PIX-23017) 
- [#16448](https://github.com/1024pix/pix/pull/16448) retours eval modulix miseenformetxt nov 
- [#16462](https://github.com/1024pix/pix/pull/16462) Tracker le clic sur la card de CF sur la page de résultats (PIX-22947) 
- [#16421](https://github.com/1024pix/pix/pull/16421) Uniformiser le design de la sélection de sujets dans Pix Admin 
- [#16459](https://github.com/1024pix/pix/pull/16459) Update IAGenFonction_Ava.json - ajout picto 

### :building_construction: Tech

- [#16464](https://github.com/1024pix/pix/pull/16464) Ajouter des seeds pour lier un centre de certification à une organisation (PIX-22627) 
- [#16446](https://github.com/1024pix/pix/pull/16446) Ajouter le certificationCenterId dans fct_structures (PIX-22683) 
- [#16445](https://github.com/1024pix/pix/pull/16445) Ajouter un index sur userId dans la table 'certification-center-memberships' (PIX-23044) 
- [#16461](https://github.com/1024pix/pix/pull/16461) Prendre des snapshots sur toutes les assertions dont la valeur dépend de la release choisie pour les tests E2E de la recette-certif 
- [#16460](https://github.com/1024pix/pix/pull/16460) Suppression de code non utilisé 

### :arrow_up: Montée de version

- [#16458](https://github.com/1024pix/pix/pull/16458) Update dependency pdfjs-dist to v6 (api) 
- [#16453](https://github.com/1024pix/pix/pull/16453) Update pix-ui to ^60.14.0 (admin) 
- [#16454](https://github.com/1024pix/pix/pull/16454) Update pix-ui to ^60.14.0 (certif) 
- [#16455](https://github.com/1024pix/pix/pull/16455) Update pix-ui to ^60.14.0 (junior) 
- [#16456](https://github.com/1024pix/pix/pull/16456) Update pix-ui to ^60.14.0 (mon-pix) 
- [#16457](https://github.com/1024pix/pix/pull/16457) Update pix-ui to v60.14.0 (orga)

# [5.426.0](https://github.com/1024pix/pix/compare/v5.425.0...v5.426.0) (2026-06-08)

### :rocket: Amélioration

- [#16417](https://github.com/1024pix/pix/pull/16417) Ajouter un fallback vers la langue quand le tuto dans la locale n'existe pas (PIX-23001). 
- [#16423](https://github.com/1024pix/pix/pull/16423) Ignore les doublons dans l'import générique (PIX-21914) 
- [#16441](https://github.com/1024pix/pix/pull/16441) Rend certaines colonnes de la table profile-rewards non nullable 

### :bug: Correction

- [#16447](https://github.com/1024pix/pix/pull/16447) Ajoute des rewardId manquants dans les tests 

### :building_construction: Tech

- [#16439](https://github.com/1024pix/pix/pull/16439) :broom: Suppression d'un modèle dupliqué `ComplementaryCertification` (PIX-23042) 
- [#16418](https://github.com/1024pix/pix/pull/16418) Déplacer les pre-handlers de shared dans quest 
- [#16356](https://github.com/1024pix/pix/pull/16356) Ne plus lire depuis la table certification-subscriptions (PIX-22955) 
- [#16444](https://github.com/1024pix/pix/pull/16444) Supprimer l'ancienne route :slug de récupération des modules (PIX-23005)(PIX-20391) 

### :arrow_up: Montée de version

- [#16434](https://github.com/1024pix/pix/pull/16434) Update dependency npm-run-all2 to v9 (dossier racine)

# [5.425.0](https://github.com/1024pix/pix/compare/v5.424.0...v5.425.0) (2026-06-05)

### :rocket: Amélioration

- [#16420](https://github.com/1024pix/pix/pull/16420) Afficher le nombre de participants par année dans l'onglet statistiques d'une orga (PIX-22756) 
- [#16414](https://github.com/1024pix/pix/pull/16414) Permettre aux admins d'éditer certaines données d'un schéma de parcours combiné (PIX-22989) 

### :bug: Correction

- [#16431](https://github.com/1024pix/pix/pull/16431) Ne pas créer de récompense pour le passage d'un parcours combiné dont la quest n'a pas de récompense (PIX-23038) 

### :arrow_up: Montée de version

- [#16430](https://github.com/1024pix/pix/pull/16430) Update dependency html-validate to v11 (api) 
- [#16432](https://github.com/1024pix/pix/pull/16432) Update dependency npm-run-all2 to v9 (admin) 
- [#16433](https://github.com/1024pix/pix/pull/16433) Update dependency npm-run-all2 to v9 (api) 
- [#16435](https://github.com/1024pix/pix/pull/16435) Update dependency npm-run-all2 to v9 (e2e) 
- [#16436](https://github.com/1024pix/pix/pull/16436) Update dependency npm-run-all2 to v9 (junior) 
- [#16437](https://github.com/1024pix/pix/pull/16437) Update dependency npm-run-all2 to v9 (mon-pix) 
- [#16438](https://github.com/1024pix/pix/pull/16438) Update dependency npm-run-all2 to v9 (orga) 
- [#16425](https://github.com/1024pix/pix/pull/16425) Update pix-ui to ^60.13.1 (admin) 
- [#16429](https://github.com/1024pix/pix/pull/16429) Update pix-ui to v60.13.1 (orga)

# [5.424.0](https://github.com/1024pix/pix/compare/v5.423.0...v5.424.0) (2026-06-05)

### :rocket: Amélioration

- [#16411](https://github.com/1024pix/pix/pull/16411) 21_RepondreMail_NOV modifications après relecture ortho-typo 
- [#16407](https://github.com/1024pix/pix/pull/16407) Ajoute le champ message dans les badges dans maddo (PIX-22992) 
- [#16412](https://github.com/1024pix/pix/pull/16412) Ajouter le nombre de participants par année à l'api interne de stats d'une orga (PIX-22994) 
- [#16408](https://github.com/1024pix/pix/pull/16408) Ajouter le tag du niveau dans la page de certificat Pix+  (PIX-23007). 
- [#16382](https://github.com/1024pix/pix/pull/16382) Ajouter une API pour enregistrer l'avis d'un utilisateur sur une recommandation de CF (PIX-22946)(PIX-22933) 
- [#16403](https://github.com/1024pix/pix/pull/16403) Cacher le bouton de création de version (PIX-22993) 
- [#16374](https://github.com/1024pix/pix/pull/16374) IA-droitAuteur-post-relectures 
- [#16313](https://github.com/1024pix/pix/pull/16313) MDX-138 IAGenPrompt_AVA retours PYO 
- [#16351](https://github.com/1024pix/pix/pull/16351) MDX-142 IA_Infox_IND Corrections Lexix 
- [#16318](https://github.com/1024pix/pix/pull/16318) MDX-232 MoteurRech_NOV2 Corrections suite à la relecture équipe 
- [#16413](https://github.com/1024pix/pix/pull/16413) MDX-32 amelioration du novice dans NR_Datacenter_NOV 
- [#16375](https://github.com/1024pix/pix/pull/16375) MDX-57 retours experts NR_Evaluation_IND 
- [#16415](https://github.com/1024pix/pix/pull/16415) Tmp eval ava coquilles 
- [#16419](https://github.com/1024pix/pix/pull/16419) Tmp retours ia gen biais ava last pyo 
- [#16424](https://github.com/1024pix/pix/pull/16424) Vérifier que les ids des organisations sont bien des nombres avant l'insertion en BDD (PIX-23023) 

### :building_construction: Tech

- [#16397](https://github.com/1024pix/pix/pull/16397) :broom: Réduction de l'utilisation de la librairie Lodash 
- [#16422](https://github.com/1024pix/pix/pull/16422) Déplacer des pre-handlers de shared dans school 
- [#16399](https://github.com/1024pix/pix/pull/16399) Déplacer UserService dans le contexte IAM 
- [#16416](https://github.com/1024pix/pix/pull/16416) Faire jouer les tests E2E sur une release qui ne va pas être archivée dans quelques mois 
- [#16388](https://github.com/1024pix/pix/pull/16388) Migrer la vue Preview vers la nouvelle route API (PIX-22401) 
- [#16082](https://github.com/1024pix/pix/pull/16082) Supprimer l’anonymousUserTokenRepository qui est inutile (PIX-23004) 
- [#16410](https://github.com/1024pix/pix/pull/16410) Supprimer la dépendance au context IAM dans organization-entities 

### :arrow_up: Montée de version

- [#16426](https://github.com/1024pix/pix/pull/16426) Update pix-ui to ^60.13.1 (certif) 
- [#16427](https://github.com/1024pix/pix/pull/16427) Update pix-ui to ^60.13.1 (junior) 
- [#16428](https://github.com/1024pix/pix/pull/16428) Update pix-ui to ^60.13.1 (mon-pix)

# [5.423.0](https://github.com/1024pix/pix/compare/v5.422.0...v5.423.0) (2026-06-04)

### :rocket: Amélioration

- [#16400](https://github.com/1024pix/pix/pull/16400) improve Dutch translations 
- [#16371](https://github.com/1024pix/pix/pull/16371) Maddo - Permettre d'ordonner les participations d'une autre manière (PIX-22906) 

### :bug: Correction

- [#16401](https://github.com/1024pix/pix/pull/16401) Ne plus supprimer les fichiers d'import en cas d'échec pour permettre les retry 
- [#16402](https://github.com/1024pix/pix/pull/16402) Supporte les participations anonymisées (PIX-22905) 

### :building_construction: Tech

- [#16359](https://github.com/1024pix/pix/pull/16359) Supprimer le FT addEmailConnectionMethodEnabled (PIX-22578) 
- [#16404](https://github.com/1024pix/pix/pull/16404) Supprimer le repository assessment de certif (PIX-23006).

# [5.422.0](https://github.com/1024pix/pix/compare/v5.421.0...v5.422.0) (2026-06-03)

### :rocket: Amélioration

- [#16385](https://github.com/1024pix/pix/pull/16385) Afficher le feedback dans la modale d'un contenu formatif (PIX-22948). 
- [#16390](https://github.com/1024pix/pix/pull/16390) Afficher les statistiques d'une orga sur Pix Admin (PIX-22896) 
- [#16319](https://github.com/1024pix/pix/pull/16319) Ajoute un bouton pour supprimer la campagne (PIX-22901) 
- [#16350](https://github.com/1024pix/pix/pull/16350) Créer une route pour remonter les statistiques d'une organisation (PIX-22895) 
- [#16364](https://github.com/1024pix/pix/pull/16364) Modifier les badges sur les affichages certificats pour avoir le même que sur le certificat PDF (PIX-22883) 
- [#16355](https://github.com/1024pix/pix/pull/16355) retours experts sur les modules RangerFichier_NOV et Visio_NOV 
- [#16303](https://github.com/1024pix/pix/pull/16303) Tmp eval ava relecturesinterne 

### :building_construction: Tech

- [#16330](https://github.com/1024pix/pix/pull/16330) Ajouter script migration filterable string->list (PIX-22837) 
- [#16393](https://github.com/1024pix/pix/pull/16393) Déplacer certains fichiers de IAM vers Shared 

### :coffee: Autre

- [#16396](https://github.com/1024pix/pix/pull/16396) high level API Description

# [5.421.0](https://github.com/1024pix/pix/compare/v5.420.0...v5.421.0) (2026-06-02)

### :rocket: Amélioration

- [#16326](https://github.com/1024pix/pix/pull/16326) Ajouter une route permettant de récupérer un détail de profil cible (PIX-22674) 
- [#16347](https://github.com/1024pix/pix/pull/16347) Update IAGenFonction_Ava.json - modif découverte 3 

### :bug: Correction

- [#16391](https://github.com/1024pix/pix/pull/16391) Corriger le crash de l'import SIECLE sur les gros fichiers 

### :arrow_up: Montée de version

- [#16387](https://github.com/1024pix/pix/pull/16387) Update dependency ember-cli to v7 (junior) 
- [#16389](https://github.com/1024pix/pix/pull/16389) Update dependency ember-cli to v7 (mon-pix) 
- [#16394](https://github.com/1024pix/pix/pull/16394) Update dependency ember-cli to v7 (orga)

# [5.420.0](https://github.com/1024pix/pix/compare/v5.419.0...v5.420.0) (2026-06-02)

### :rocket: Amélioration

- [#16325](https://github.com/1024pix/pix/pull/16325) Affichage d'une modale pour les détails d'un contenu formatif recommandé (PIX-22730). 
- [#16367](https://github.com/1024pix/pix/pull/16367) Ajout d'une pré-sélection de sujets lorsque l'on créé une nouvelle version de certification (PIX-22874) 
- [#16354](https://github.com/1024pix/pix/pull/16354) Ajoute un encart sur les attestations sur la page de présentation du parcours combiné (PIX-22747) 
- [#16361](https://github.com/1024pix/pix/pull/16361) Ajouter la colonne isRelevant dans la table user-recommended-trainings (PIX-22944) 
- [#16362](https://github.com/1024pix/pix/pull/16362) Module GestionMPD_IND modifs POI et contenu 
- [#16384](https://github.com/1024pix/pix/pull/16384) Permet aux admins d'ajouter un lien de questionnaire à la création d'un blueprint (PIX-22939) 
- [#16360](https://github.com/1024pix/pix/pull/16360) Rendre l'externalId optionnel lors de la création d'organisations en masse (PIX-22931) 

### :bug: Correction

- [#16365](https://github.com/1024pix/pix/pull/16365) Ne pas renvoyer d'id de profil cible à la place d'id de blueprint quand on crée un parcours combiné sur PixOrga (PIX-22960) 

### :building_construction: Tech

- [#16344](https://github.com/1024pix/pix/pull/16344) Ne plus utiliser la table certification-subscriptions dans les services et usecases (PIX-22920) 
- [#16323](https://github.com/1024pix/pix/pull/16323) Supprimer la route /modules/slug côté Pix App (PIX-22305) 

### :arrow_up: Montée de version

- [#16366](https://github.com/1024pix/pix/pull/16366) Update dependency @1024pix/pix-ui to ^60.12.0 (certif) 
- [#16368](https://github.com/1024pix/pix/pull/16368) Update dependency @1024pix/pix-ui to ^60.12.0 (junior) 
- [#16369](https://github.com/1024pix/pix/pull/16369) Update dependency @1024pix/pix-ui to ^60.12.0 (mon-pix) 
- [#16370](https://github.com/1024pix/pix/pull/16370) Update dependency @1024pix/pix-ui to v60.12.0 (orga) 
- [#16372](https://github.com/1024pix/pix/pull/16372) Update dependency @datadog/datadog-api-client to v1.58.0 (api) 
- [#16379](https://github.com/1024pix/pix/pull/16379) Update dependency ember-cli to v7 (admin) 
- [#16381](https://github.com/1024pix/pix/pull/16381) Update dependency ember-cli to v7 (certif) 
- [#16373](https://github.com/1024pix/pix/pull/16373) Update dependency oxfmt to ^0.51.0 (api) 
- [#16380](https://github.com/1024pix/pix/pull/16380) Update dependency oxfmt to ^0.52.0 (api) 
- [#16376](https://github.com/1024pix/pix/pull/16376) Update dependency undici to v8.3.0 (api) 
- [#16377](https://github.com/1024pix/pix/pull/16377) Update dependency webpack to v5.107.2 (junior)

# [5.419.0](https://github.com/1024pix/pix/compare/v5.418.0...v5.419.0) (2026-06-01)

### :rocket: Amélioration

- [#16320](https://github.com/1024pix/pix/pull/16320) Créer une api interne pour remonter les stats de participation d'une organisation (PIX-22894) 
- [#16314](https://github.com/1024pix/pix/pull/16314) Lire les données des CGU avec ou sans la nouvelle api (PIX-22580) 
- [#16358](https://github.com/1024pix/pix/pull/16358) Modification de l'affichage des boutons d'actions de certification (PIX-22922). 

### :bug: Correction

- [#16349](https://github.com/1024pix/pix/pull/16349) Retourner null quand il n'y a plus d'épreuve disponible dans une activité 

### :building_construction: Tech

- [#16210](https://github.com/1024pix/pix/pull/16210) Dans OidcAuthenticationService gérer le cas de l’initialisation initializeClientConfig échouée (TypeError: "config" must be an instance of Configuration) + améliorer les logs OIDC (PIX-22662) 
- [#16322](https://github.com/1024pix/pix/pull/16322) Déplacer AggregateImportError dans le contexte prescription 
- [#16352](https://github.com/1024pix/pix/pull/16352) Déplacer LearningContentConversionService dans prescription/shared 
- [#16327](https://github.com/1024pix/pix/pull/16327) Déplacer user-login repository dans le contexte IAM 
- [#16357](https://github.com/1024pix/pix/pull/16357) Migration pour ajouter le liens des questionnaires aux blueprints (PIX-22938) 

### :arrow_up: Montée de version

- [#16311](https://github.com/1024pix/pix/pull/16311) Update dependency @1024pix/pix-ui to ^60.11.0 (certif) 
- [#16363](https://github.com/1024pix/pix/pull/16363) Update dependency @1024pix/pix-ui to ^60.12.0 (admin)

# [5.418.0](https://github.com/1024pix/pix/compare/v5.417.0...v5.418.0) (2026-05-29)

### :rocket: Amélioration

- [#16329](https://github.com/1024pix/pix/pull/16329) MDX-119 Visio_IND Corrections suite à la relecture experts 
- [#16331](https://github.com/1024pix/pix/pull/16331) MDX-142 IA_Infox_IND Corrections 
- [#16346](https://github.com/1024pix/pix/pull/16346) modif suite relectures experts RangerFichiersIND 
- [#16345](https://github.com/1024pix/pix/pull/16345) Ne pas afficher la vocalisation par défaut hors certif (PIX-22890). 
- [#16332](https://github.com/1024pix/pix/pull/16332) Suppression du stepper sur le certificat Pix+ Edu avec niveau (PIX-22888). 

### :bug: Correction

- [#16334](https://github.com/1024pix/pix/pull/16334) Réparer le titre de la modale de détail d'une version de certification (PIX-22916) 

### :building_construction: Tech

- [#16343](https://github.com/1024pix/pix/pull/16343) Ajouter les dépendances via API dans le linter de dependances 
- [#16340](https://github.com/1024pix/pix/pull/16340) Compléter les tests E2E des certifications Pix+ pour tester la page de détails d'un certificat et son PDF 
- [#16337](https://github.com/1024pix/pix/pull/16337) Configurer les dépendances actuelles dans dependency-cruiser 
- [#16321](https://github.com/1024pix/pix/pull/16321) Déplace les modèles liés aux Combined Courses et Combined Course Participations dans des répertoires dédiés. 
- [#16338](https://github.com/1024pix/pix/pull/16338) Gestion des version DRAFT dans findActiveByScope 
- [#16298](https://github.com/1024pix/pix/pull/16298) Renommer la clé de traduction obsolète "complementary-certification' dans Pix Admin (PIX-22698) 
- [#16342](https://github.com/1024pix/pix/pull/16342) Supprime le script check-api-dependency.

# [5.417.0](https://github.com/1024pix/pix/compare/v5.416.0...v5.417.0) (2026-05-28)

### :rocket: Amélioration

- [#16317](https://github.com/1024pix/pix/pull/16317) Ne pas autoriser l'ajout de la feature Attestation Management sans paramètres (PIX-22821). 

### :building_construction: Tech

- [#16333](https://github.com/1024pix/pix/pull/16333) Fix la fonction routeDomainToOwnerTeam

# [5.416.0](https://github.com/1024pix/pix/compare/v5.415.0...v5.416.0) (2026-05-28)

### :rocket: Amélioration

- [#16300](https://github.com/1024pix/pix/pull/16300) Renvoyer la description sur la route de récupération de CF (PIX-22853) 
- [#16305](https://github.com/1024pix/pix/pull/16305) Update IAGenBiais_AVA.json - Modif titre + descriptif 

### :building_construction: Tech

- [#16310](https://github.com/1024pix/pix/pull/16310) Changement d'emplacement de la route de création d'une version de certification (pix-22897) 
- [#16324](https://github.com/1024pix/pix/pull/16324) Déplacer les serializers de CSV dans leurs contextes 
- [#16306](https://github.com/1024pix/pix/pull/16306) Déplacer metrics.js dans shared 
- [#16316](https://github.com/1024pix/pix/pull/16316) Extrait la logique de parsing du model OrganizationFeature 
- [#16328](https://github.com/1024pix/pix/pull/16328) Génération des règles dependency cruiser 
- [#16315](https://github.com/1024pix/pix/pull/16315) Revoir les dépendances admin-member de shared

# [5.415.0](https://github.com/1024pix/pix/compare/v5.414.0...v5.415.0) (2026-05-27)

### :rocket: Amélioration

- [#16288](https://github.com/1024pix/pix/pull/16288) Activer la locale « es » sur Pix Orga (PIX-22847) 
- [#16312](https://github.com/1024pix/pix/pull/16312) Autoriser France Travail à voir le questionnaire de fin de parcours combiné dans tous les cas 
- [#16302](https://github.com/1024pix/pix/pull/16302) datacenter-ava-final 
- [#15963](https://github.com/1024pix/pix/pull/15963) Fixer définitivement la date de démarrage de la session selon la date de démarrage du premier test de certification (PIX-22408) 
- [#16176](https://github.com/1024pix/pix/pull/16176) MADDO - enrichir les données des participations (PIX-22452). 
- [#16099](https://github.com/1024pix/pix/pull/16099) Utiliser le code au lieu du slug comme ID de la ressource oidc-providers (PIX-22099) 

### :building_construction: Tech

- [#16301](https://github.com/1024pix/pix/pull/16301) ajoute l'équipe responsable du code dans les logs 
- [#16308](https://github.com/1024pix/pix/pull/16308) Déplacement de la récupération des donnée du composant vers la route parente (pix-22889) 
- [#16281](https://github.com/1024pix/pix/pull/16281) Déplacer le user-serializer dans le context IAM 
- [#16309](https://github.com/1024pix/pix/pull/16309) Permettre de correctement fermer Maddo lorsqu'on fait Ctrl+C dans le terminal 
- [#16139](https://github.com/1024pix/pix/pull/16139) Suppression cache frameworks + contextualisation 

### :arrow_up: Montée de version

- [#16267](https://github.com/1024pix/pix/pull/16267) Update dependency @1024pix/pix-ui to ^60.11.0 (admin) 
- [#16307](https://github.com/1024pix/pix/pull/16307) Update dependency axios to v1.16.1 (api)

# [5.414.0](https://github.com/1024pix/pix/compare/v5.413.0...v5.414.0) (2026-05-26)

### :rocket: Amélioration

- [#16248](https://github.com/1024pix/pix/pull/16248) MDX-34, retours Jennifer 
- [#16218](https://github.com/1024pix/pix/pull/16218) Nouveau module Miseenformetxt2_NOV 

### :bug: Correction

- [#16299](https://github.com/1024pix/pix/pull/16299) Mauvais lien pour le questionnaire France Travail (PIX-22876) 

### :building_construction: Tech

- [#16293](https://github.com/1024pix/pix/pull/16293) Améliore les tests du composant markdown-to-html 
- [#16292](https://github.com/1024pix/pix/pull/16292) Traiter les retours partenaire sur la traduction 'es' (PIX-22869) 
- [#16244](https://github.com/1024pix/pix/pull/16244) Utilise les ids directement dans la création de schéma de parcours combinés. 

### :coffee: Autre

- [#16296](https://github.com/1024pix/pix/pull/16296) Corrige des accents absents sur Édu

# [5.413.0](https://github.com/1024pix/pix/compare/v5.412.0...v5.413.0) (2026-05-25)

### :rocket: Amélioration

- [#16280](https://github.com/1024pix/pix/pull/16280) Ajouter la colonne description à la table trainings (PIX-22852) 
- [#16277](https://github.com/1024pix/pix/pull/16277) Contextualiser les informations de certificats provenant du back (PIX-22375). 
- [#16290](https://github.com/1024pix/pix/pull/16290) dernieres modifs virus nov 
- [#16286](https://github.com/1024pix/pix/pull/16286) FRI modifs module phishing ind avant panel 
- [#16289](https://github.com/1024pix/pix/pull/16289) Module Phishing_NOV modif sur une consigne 
- [#16276](https://github.com/1024pix/pix/pull/16276) Visualiser le détail d'une certification d'un candidat (PIX-22536). 

### :building_construction: Tech

- [#16285](https://github.com/1024pix/pix/pull/16285) :package: Force la mise à jour de Braces en version 3.0.3 minimum 
- [#16282](https://github.com/1024pix/pix/pull/16282) Corriger les bugs d'affichage des dates sur PixAdmin (PIX-22828)#16269 
- [#16103](https://github.com/1024pix/pix/pull/16103) Limite les appels concurrentiels au endpoint de calcul de prochaine épreuve en certification via un mutex Redis (pix-22855) 

### :coffee: Autre

# [5.412.0](https://github.com/1024pix/pix/compare/v5.411.0...v5.412.0) (2026-05-22)

### :rocket: Amélioration

- [#16266](https://github.com/1024pix/pix/pull/16266) Ajoute la possibilité d'utiliser du markdown dans les descriptions des parcours combinés (Pix-22820) 
- [#16215](https://github.com/1024pix/pix/pull/16215) Appliquer le nouveau design des cartes de contenu formatifs en fin de parcours sur Pix App (PIX-22716). 
- [#16283](https://github.com/1024pix/pix/pull/16283) dernières modifs module cadre IA avant prod 
- [#16258](https://github.com/1024pix/pix/pull/16258) Laisser la modale d'édition de version ouverte après modification (PIX-22826). 
- [#16251](https://github.com/1024pix/pix/pull/16251) MDX-119 Visio_IND Corrections diverses 
- [#16219](https://github.com/1024pix/pix/pull/16219) Permettre la sélection du niveau d'un sujet dans le sélecteur de sujets de Pix Orga (PIX-22330) 
- [#16232](https://github.com/1024pix/pix/pull/16232) Rendre le bouton "supprimer une version" fonctionnel (PIX-22696) 
- [#16287](https://github.com/1024pix/pix/pull/16287) surequipement-relecture-finale 

### :building_construction: Tech

- [#16241](https://github.com/1024pix/pix/pull/16241) :package: Mise à jour des paquet pour `mon-pix` 
- [#16273](https://github.com/1024pix/pix/pull/16273) Corriger le titre du module Vous avez reçu un mail 
- [#16262](https://github.com/1024pix/pix/pull/16262) Création de seeds pour une organisation SCO-1D avec import générique (PIX-22788) 
- [#16278](https://github.com/1024pix/pix/pull/16278) Dépendances circulaires dans shared 
- [#16272](https://github.com/1024pix/pix/pull/16272) Déplace le mapping des erreurs Acquisition dans son contexte. 
- [#16229](https://github.com/1024pix/pix/pull/16229) Refactoriser la logique de reconciliation d'import (PIX-22412) 
- [#16274](https://github.com/1024pix/pix/pull/16274) Simplifier le mapping de error-manager dans shared 
- [#16275](https://github.com/1024pix/pix/pull/16275) Suppression d'un controller certif non utilisé  
- [#16279](https://github.com/1024pix/pix/pull/16279) Traiter les retours partenaire sur la traduction 'it' (PIX-22851) 

### :arrow_up: Montée de version

- [#16284](https://github.com/1024pix/pix/pull/16284) Mettre à jour le package @1024pix/epreuves-components. 
- [#16268](https://github.com/1024pix/pix/pull/16268) Update dependency @1024pix/pix-ui to ^60.11.0 (mon-pix) 
- [#16225](https://github.com/1024pix/pix/pull/16225) Update dependency sinon to v22 (mon-pix)

# [5.411.0](https://github.com/1024pix/pix/compare/v5.410.0...v5.411.0) (2026-05-21)

### :rocket: Amélioration

- [#16254](https://github.com/1024pix/pix/pull/16254) : Dernières modifs Phishing nov avant mise en prod 
- [#16261](https://github.com/1024pix/pix/pull/16261) Contenus formatifs - Ajouter le format “Service externe” (PIX-22791) 
- [#16256](https://github.com/1024pix/pix/pull/16256) Dernieres modifs CYAntivirusIND avant mise en prod 
- [#16260](https://github.com/1024pix/pix/pull/16260) dernières modifs Phishing AVA avant mise en prod 
- [#16237](https://github.com/1024pix/pix/pull/16237) urabilite-ava-relecture-finale 

### :bug: Correction

- [#16257](https://github.com/1024pix/pix/pull/16257) Remplacer l'apostrophe dans le tag “L’info en +” (PIX-22790) 

### :building_construction: Tech

- [#16148](https://github.com/1024pix/pix/pull/16148) :card_file_box:  Ajoute une table de stockage d'évènement de certification (PIX-22787) 
- [#16246](https://github.com/1024pix/pix/pull/16246) Ajout d'une commande pour start l'environnement local de certif 
- [#16233](https://github.com/1024pix/pix/pull/16233) Corrige le rechargement des fichiers de traduction avec Vite sur Orga (PIX-22745) 
- [#16271](https://github.com/1024pix/pix/pull/16271) Déplace le mapping des erreurs evaluation dans son contexte. 
- [#16264](https://github.com/1024pix/pix/pull/16264) Déplacer le mapping des erreurs LLM dans son contexte 
- [#16255](https://github.com/1024pix/pix/pull/16255) Déplacer les erreurs certification définies dans shared 
- [#16263](https://github.com/1024pix/pix/pull/16263) Déplacer les erreurs prescription définies dans shared 
- [#16265](https://github.com/1024pix/pix/pull/16265) Réparer un test flaky sur la mise à jour du logo d'une organisation (PIX-22794) 

### :coffee: Autre

- [#16245](https://github.com/1024pix/pix/pull/16245) Docs in english

# [5.410.0](https://github.com/1024pix/pix/compare/v5.409.0...v5.410.0) (2026-05-20)

### :rocket: Amélioration

- [#16231](https://github.com/1024pix/pix/pull/16231) Créer un nouveau module IAInfox_IND 
- [#16154](https://github.com/1024pix/pix/pull/16154) Eval_IND retour edito MDX-57 
- [#16236](https://github.com/1024pix/pix/pull/16236) Importer les traductions italiennes de Pix App (PIX-22764) 
- [#16240](https://github.com/1024pix/pix/pull/16240) MDX-104 NR_Evaluation_NOV Fix mauvais grain  
- [#16227](https://github.com/1024pix/pix/pull/16227) Mise à jour des commentaires d'une version (PIX-22697). 
- [#16164](https://github.com/1024pix/pix/pull/16164) Script de migration des données CGU de Pix App vers le nouveau modèle (PIX-22574) 

### :bug: Correction

- [#16230](https://github.com/1024pix/pix/pull/16230) - Répare le rattachement d'une attestation aux parcours combinés dans PixAdmin (PIX-22779) 
- [#16252](https://github.com/1024pix/pix/pull/16252) Changement d'une clé de traduction (PIX-22782) 

### :building_construction: Tech

- [#16083](https://github.com/1024pix/pix/pull/16083) Créer des modèles de Challenge dédiés pour un challenge qui doit être joué 
- [#16223](https://github.com/1024pix/pix/pull/16223) Logger les userid dans les connexions réussies (PIX-22741) 
- [#16243](https://github.com/1024pix/pix/pull/16243) Revoir la gestion et le mapping des erreurs dans HAPI 
- [#16253](https://github.com/1024pix/pix/pull/16253) Suppression de restes de language inclusif (PIX-22798). 

### :coffee: Autre

- [#16250](https://github.com/1024pix/pix/pull/16250) Ne plus inviter à exécuter "npm run dev" pour démarrer toutes les applications à la fois à la racine du monorepo

# [5.409.0](https://github.com/1024pix/pix/compare/v5.408.1...v5.409.0) (2026-05-19)

### :rocket: Amélioration

- [#16216](https://github.com/1024pix/pix/pull/16216) Afficher le badge Pix+ v3 dans l'écran de vérification de certificat (PIX-22746). 

### :building_construction: Tech

- [#16197](https://github.com/1024pix/pix/pull/16197) Corriger les tests de recette certif E2E 

### :arrow_up: Montée de version

- [#16235](https://github.com/1024pix/pix/pull/16235) Update dependency @playwright/test to v1.60.0 (e2e-playwright) 
- [#16238](https://github.com/1024pix/pix/pull/16238) Update dependency oxfmt to ^0.49.0 (api) 
- [#16226](https://github.com/1024pix/pix/pull/16226) Update dependency sinon to v22 (orga) 
- [#16228](https://github.com/1024pix/pix/pull/16228) Update dependency undici to v8 (api)

## [5.408.1](https://github.com/1024pix/pix/compare/v5.408.0...v5.408.1) (2026-05-18)

### :bug: Correction

- [#16211](https://github.com/1024pix/pix/pull/16211) Corrige l'erreur sur la route `/api/junior/activity-answer` (PIX-22740) 

### :building_construction: Tech

- [#16204](https://github.com/1024pix/pix/pull/16204) :package: Mise à jours des paquets de PixJunior 
- [#16207](https://github.com/1024pix/pix/pull/16207) Renommer les usecases et repositories d'import de participants (PIX-22738) 

### :arrow_up: Montée de version

- [#16206](https://github.com/1024pix/pix/pull/16206) Update dependency sinon to v22 (api) 
- [#16222](https://github.com/1024pix/pix/pull/16222) Update dependency sinon to v22 (certif) 
- [#16224](https://github.com/1024pix/pix/pull/16224) Update dependency sinon to v22 (junior) 
- [#16221](https://github.com/1024pix/pix/pull/16221) Update dependency undici to v7.25.0 (api)

# [5.408.0](https://github.com/1024pix/pix/compare/v5.407.0...v5.408.0) (2026-05-14)

### :rocket: Amélioration

- [#16209](https://github.com/1024pix/pix/pull/16209) Accéder aux nouvelles données des contenus formatif dans la page de fin de parcours (PIX-22715). 
- [#16133](https://github.com/1024pix/pix/pull/16133) Générer le certificat Pix+ v3 (PIX-22537). 
- [#16178](https://github.com/1024pix/pix/pull/16178) laisse le filtrer division visible sur la page attestation (PIX-22076)  
- [#16214](https://github.com/1024pix/pix/pull/16214) NR_Eval_NOV intégration du module 

### :building_construction: Tech

- [#16118](https://github.com/1024pix/pix/pull/16118) Afficher le titre des grains dans la preview d'un module (PIX-22652) 
- [#16212](https://github.com/1024pix/pix/pull/16212) Déplacer des endpoints d'assessment dans les bounded-contexts correspondants 
- [#16112](https://github.com/1024pix/pix/pull/16112) Limiter les problèmes de mises à jour des paquets lors du démarrage de certains jobs CircleCI 
- [#16208](https://github.com/1024pix/pix/pull/16208) Mettre à jour le package epreuves component. 
- [#16213](https://github.com/1024pix/pix/pull/16213) Renommer les classes CSS du composant InaccessibleContent

# [5.407.0](https://github.com/1024pix/pix/compare/v5.406.0...v5.407.0) (2026-05-13)

### :rocket: Amélioration

- [#16201](https://github.com/1024pix/pix/pull/16201) #MDX-43 Ajout QCU découverte 2 
- [#16195](https://github.com/1024pix/pix/pull/16195) Ajout de nouvelles colonnes dans la table trainings pour la recommandation de contenus formatifs (PIX-22714). 
- [#16110](https://github.com/1024pix/pix/pull/16110) Fermer le menu utilisateur au clic souris (PIX-22649). 
- [#16160](https://github.com/1024pix/pix/pull/16160) Importer les traductions allemande et espagnole (PIX-22665-import-translations) 
- [#16146](https://github.com/1024pix/pix/pull/16146) MDX-32 Datacenter_NOV retours edito 
- [#16135](https://github.com/1024pix/pix/pull/16135) MDX-43 intégrations post relectures 
- [#16200](https://github.com/1024pix/pix/pull/16200) Permet la désactivation des Parcours Combiné via un Feature Toggle (PIX-22658). 
- [#16172](https://github.com/1024pix/pix/pull/16172) Suppression des colonnes 'completedAt' et 'endedAt' de la table 'certification-courses' (PIX-22328) 

### :bug: Correction

- [#16173](https://github.com/1024pix/pix/pull/16173) Corriger le flaky sur la réconciliation des apprenants lors d'un import SCO (PIX-22719) 
- [#16169](https://github.com/1024pix/pix/pull/16169) ne pas échouer quand un badge n'est pas valide (PIX-17427) 

### :building_construction: Tech

- [#16196](https://github.com/1024pix/pix/pull/16196) :package: Mise à jour des bibliothèques autour d'Ember (pix-22734) 
- [#16199](https://github.com/1024pix/pix/pull/16199) :recycle: Fais en sorte que la `startDate` de la version soit optionnelle 
- [#16203](https://github.com/1024pix/pix/pull/16203) Améliorer les logs des requêtes vers l'API LLM (PIX-22739) 
- [#16202](https://github.com/1024pix/pix/pull/16202) Désactive temporairement les tests de la recette certif 
- [#16096](https://github.com/1024pix/pix/pull/16096) Diminution du nombre de tests E2E tout en gardant la couverture(PIX-22657) 
- [#16184](https://github.com/1024pix/pix/pull/16184) Fusionne les tests du ErrorManager et simplifie le mapping d'erreurs 
- [#16170](https://github.com/1024pix/pix/pull/16170) Modification de la table `certification_versions` (PIX-22695). 
- [#16165](https://github.com/1024pix/pix/pull/16165) Refactorer les jobs d'import et de validation des apprenants (PIX-22711) 

### :arrow_up: Montée de version

- [#16183](https://github.com/1024pix/pix/pull/16183) Update dependency eslint-plugin-n to v18 (orga) 
- [#16192](https://github.com/1024pix/pix/pull/16192) Update dependency oxfmt to ^0.48.0 (api) 
- [#16205](https://github.com/1024pix/pix/pull/16205) Update dependency sinon to v22 (admin) 

### :coffee: Autre

# [5.406.0](https://github.com/1024pix/pix/compare/v5.405.0...v5.406.0) (2026-05-12)

### :rocket: Amélioration

- [#16094](https://github.com/1024pix/pix/pull/16094) Afficher les images des badges Pix+ (PIX-22622). 
- [#16106](https://github.com/1024pix/pix/pull/16106) Améliorer la page de fin de résultat sur le moteur de recommandation (PIX-22437) (PIX-22125) 
- [#16151](https://github.com/1024pix/pix/pull/16151) ia-droit-auteur-v3 
- [#16163](https://github.com/1024pix/pix/pull/16163) Lien de questionnaire spécifique à France Travail (PIX-22701) 
- [#16153](https://github.com/1024pix/pix/pull/16153) Refonte de l'écran de détail d'un référentiel de certification donné (PIX-21194) 
- [#16156](https://github.com/1024pix/pix/pull/16156) Suppression des onglets dans la page de résultats de campagne avec recommandation (PIX-22668). 
- [#16168](https://github.com/1024pix/pix/pull/16168) Update IADefinition_IND.json 

### :bug: Correction

- [#16091](https://github.com/1024pix/pix/pull/16091) Ajouter un message d'erreur dédié (PIX-21376) 
- [#16140](https://github.com/1024pix/pix/pull/16140) Corriger l'erreur 500 lors de l'acceptation simultanée d'une invitation d'organisation (PIX-21467). 
- [#16134](https://github.com/1024pix/pix/pull/16134) Empêcher de supprimer un tube lié à un badge lors de la modification d'un profil cible (PIX-17442) 

### :building_construction: Tech

- [#16171](https://github.com/1024pix/pix/pull/16171) :package: force la mise à jour (et la version minimum) du paquet `@xmldom/xmldom` 
- [#16136](https://github.com/1024pix/pix/pull/16136) :package: Mise à jour de la bibliothèque hapi/hapi  
- [#16119](https://github.com/1024pix/pix/pull/16119) :recycle: Réduit l'utilisation de `lodash` (pix-22710) 
- [#16122](https://github.com/1024pix/pix/pull/16122) Ajoute une API interne pour récupérer les participations d'une liste de learners (PIX-22585) 
- [#16147](https://github.com/1024pix/pix/pull/16147) Réorganiser les sérialiseurs CSV d'import d'apprenants (PIX-22670) 

### :arrow_up: Montée de version

- [#16104](https://github.com/1024pix/pix/pull/16104) Update dependency eslint-plugin-ember to v13 (mon-pix) 
- [#16174](https://github.com/1024pix/pix/pull/16174) Update dependency eslint-plugin-n to v18 (admin) 
- [#16175](https://github.com/1024pix/pix/pull/16175) Update dependency eslint-plugin-n to v18 (api) 
- [#16177](https://github.com/1024pix/pix/pull/16177) Update dependency eslint-plugin-n to v18 (audit-logger) 
- [#16179](https://github.com/1024pix/pix/pull/16179) Update dependency eslint-plugin-n to v18 (certif) 
- [#16180](https://github.com/1024pix/pix/pull/16180) Update dependency eslint-plugin-n to v18 (dossier racine) 
- [#16181](https://github.com/1024pix/pix/pull/16181) Update dependency eslint-plugin-n to v18 (junior) 
- [#16182](https://github.com/1024pix/pix/pull/16182) Update dependency eslint-plugin-n to v18 (mon-pix) 
- [#16166](https://github.com/1024pix/pix/pull/16166) Update dependency redis to v7.2.14 
- [#16167](https://github.com/1024pix/pix/pull/16167) Update mcr.microsoft.com/playwright Docker tag to v1.59.1 (.circleci) 

### :coffee: Autre

# [5.405.0](https://github.com/1024pix/pix/compare/v5.404.0...v5.405.0) (2026-05-11)

### :rocket: Amélioration

- [#16071](https://github.com/1024pix/pix/pull/16071) Ajouter les filtres nom, domaines, compétences (pix-22347)  

### :building_construction: Tech

- [#16137](https://github.com/1024pix/pix/pull/16137) :package: mise à jour de la bibiliothèque `xmldom` 
- [#16124](https://github.com/1024pix/pix/pull/16124) Ajoute une API interne pour récupérer les informations des learners à partir d'une liste d'ids (PIX-22586) 
- [#16158](https://github.com/1024pix/pix/pull/16158) Corrige la configuration des tests ember sur orga 
- [#16157](https://github.com/1024pix/pix/pull/16157) Corriger la lenteur des tests unitaires 

### :arrow_up: Montée de version

- [#16149](https://github.com/1024pix/pix/pull/16149) Update dependency @rollup/plugin-babel to v7 (orga) 
- [#16161](https://github.com/1024pix/pix/pull/16161) Update dependency axios to v1.16.0 (api) 
- [#16150](https://github.com/1024pix/pix/pull/16150) Update dependency babel-plugin-ember-template-compilation to v4 (orga) 
- [#16162](https://github.com/1024pix/pix/pull/16162) Update dependency vite to v8 (orga) 
- [#16159](https://github.com/1024pix/pix/pull/16159) Update slackapi/slack-github-action action to v3.0.3 (workflows)

# [5.404.0](https://github.com/1024pix/pix/compare/v5.403.0...v5.404.0) (2026-05-08)

### :rocket: Amélioration

- [#16145](https://github.com/1024pix/pix/pull/16145) : retrait Stepper notification Antivirus IND 
- [#16109](https://github.com/1024pix/pix/pull/16109) Ajouter le feature toggle newPixAppLegalDocumentsVersioning (PIX-21742) 
- [#16126](https://github.com/1024pix/pix/pull/16126) Intégrer des corrections suite aux relectures 
- [#16142](https://github.com/1024pix/pix/pull/16142) MDX-138 Prompt_ava modif avant relecture PYO 
- [#16127](https://github.com/1024pix/pix/pull/16127) Remonter la récompense liée à la participation à un parcours combiné (PIX-21721). 
- [#16152](https://github.com/1024pix/pix/pull/16152) Update NR_Evaluation_AVA.json 

### :building_construction: Tech

- [#16155](https://github.com/1024pix/pix/pull/16155) Ajout de log pour les jobs et workers 
- [#16108](https://github.com/1024pix/pix/pull/16108) Ajoute une API interne pour récupérer les learners d'un utilisateur (PIX-22576) 
- [#16107](https://github.com/1024pix/pix/pull/16107) Ajoute une API interne pour récupérer les participations d'un utilisateur (PIX-22575) 
- [#16144](https://github.com/1024pix/pix/pull/16144) Corrige les traductions nl élèves (PIX-22659) 
- [#15941](https://github.com/1024pix/pix/pull/15941) Passer pixOrga sous vite (PIX-22391) 
- [#16138](https://github.com/1024pix/pix/pull/16138) Supprime les scripts pg-boss désormais inutiles.

# [5.403.0](https://github.com/1024pix/pix/compare/v5.402.0...v5.403.0) (2026-05-07)

### :rocket: Amélioration

- [#16065](https://github.com/1024pix/pix/pull/16065) Ajouter une page "intercalaire" listant les versions d'un réf de certif (PIX-21480) 
- [#16120](https://github.com/1024pix/pix/pull/16120) Corrections diverses MoteurRech_Info NOV_1 
- [#15628](https://github.com/1024pix/pix/pull/15628) Création d'un job de suppression des conversations avec le LLM âgées de plus de N jours (PIX-21105) 
- [#16141](https://github.com/1024pix/pix/pull/16141) FRI MoteurRechInfo_NOV1 modif decouverte 1 
- [#16073](https://github.com/1024pix/pix/pull/16073) Supprimer physiquement les invitations en BDD lors de l'archivage de centre de certification (PIX-22087) 

### :building_construction: Tech

- [#16123](https://github.com/1024pix/pix/pull/16123) :broom: Supprime l'utilisation de `certificationCourse.endedAt` (PIX-22462) 
- [#16125](https://github.com/1024pix/pix/pull/16125) Corriger le test e2e flaky de gestion des élèves SCO (PIX-22391) 
- [#16132](https://github.com/1024pix/pix/pull/16132) Mise à jour du package epreuve componente vers la version v4.5.0  
- [#16097](https://github.com/1024pix/pix/pull/16097) Refactoriser l'envoi d'invitation à rejoindre une organisation sur Pix Admin (PIX-21415) 
- [#16128](https://github.com/1024pix/pix/pull/16128) Suppression de la fallback de locale pour le get-next (PIX-22666). 
- [#16088](https://github.com/1024pix/pix/pull/16088) Supprimer le lien erroné memberships du sérialiseur non-admin des organisations (PIX-22626)

# [5.402.0](https://github.com/1024pix/pix/compare/v5.401.2...v5.402.0) (2026-05-06)

### :rocket: Amélioration

- [#16100](https://github.com/1024pix/pix/pull/16100) ia-droit-auteur-v2 
- [#16098](https://github.com/1024pix/pix/pull/16098) MDX-232 Moteur_rech_info_nov2 modification avant envoi rele… 

### :bug: Correction

- [#16093](https://github.com/1024pix/pix/pull/16093) Afficher l'erreur dédiée si un utilisateur ajoute un email déjà existant (PIX-22271) 
- [#16116](https://github.com/1024pix/pix/pull/16116) Déclencher les migrations pgboss 
- [#16121](https://github.com/1024pix/pix/pull/16121) Ignorer un test flaky de high-level-tests/e2e-playwright/tests/pix-orga/sco-students-management.test.ts 

### :arrow_up: Montée de version

- [#16101](https://github.com/1024pix/pix/pull/16101) Update dependency eslint-plugin-ember to v13 (certif) 
- [#16111](https://github.com/1024pix/pix/pull/16111) Update dependency tracked-toolbox to v3 (mon-pix)

## [5.401.2](https://github.com/1024pix/pix/compare/v5.401.1...v5.401.2) (2026-05-05)

### :bug: Correction

- [#16114](https://github.com/1024pix/pix/pull/16114) Script de migration pgboss v9 vers v12

## [5.401.1](https://github.com/1024pix/pix/compare/v5.401.0...v5.401.1) (2026-05-05)

### :building_construction: Tech

- [#15803](https://github.com/1024pix/pix/pull/15803) Met à jour pgboss en v12

# [5.401.0](https://github.com/1024pix/pix/compare/v5.400.0...v5.401.0) (2026-05-05)

### :rocket: Amélioration

- [#16055](https://github.com/1024pix/pix/pull/16055) Afficher l'onglet Réseau d'une organisation pour tous les rôles (pix-22550) 
- [#15983](https://github.com/1024pix/pix/pull/15983) Ajout du sélecteur de langue sur pix.org en entrée de certification (PIX-22425). 
- [#16084](https://github.com/1024pix/pix/pull/16084) Enlever la mention bêta sur les contenus formatifs de type Modules (PIX-22533) 
- [#16095](https://github.com/1024pix/pix/pull/16095) Lier les compétences et domaines dans le retour de la route /courses (PIX-22635) 
- [#16081](https://github.com/1024pix/pix/pull/16081) MDX-57 retrait POI 
- [#16032](https://github.com/1024pix/pix/pull/16032) module Visio_NOV retours relectures eval pedago edito  
- [#16066](https://github.com/1024pix/pix/pull/16066) obsolescence-schema-definitif 

### :building_construction: Tech

- [#16016](https://github.com/1024pix/pix/pull/16016) :package: Mise à jour de la bibliothèque `sheetjs` en version 0.20.3 
- [#16067](https://github.com/1024pix/pix/pull/16067) Ajouter un tests e2e qui couvre le cas de la dissociation d'un learner lors de l'import SIECLE/FREGATA (PIX-22596). 
- [#16060](https://github.com/1024pix/pix/pull/16060) Deplacer le contexte des "stages" dans le scope prescription 
- [#16075](https://github.com/1024pix/pix/pull/16075) Supprimer le lien erroné certificationCenterMemberships du sérialiseur non-admin (PIX-22599) 

### :arrow_up: Montée de version

- [#16079](https://github.com/1024pix/pix/pull/16079) Update dependency @1024pix/pix-ui to ^60.10.1 (certif) 
- [#16080](https://github.com/1024pix/pix/pull/16080) Update dependency @1024pix/pix-ui to ^60.10.1 (junior) 
- [#16086](https://github.com/1024pix/pix/pull/16086) Update dependency @1024pix/pix-ui to ^60.10.1 (mon-pix) 
- [#16090](https://github.com/1024pix/pix/pull/16090) Update dependency @datadog/datadog-api-client to v1.57.0 (api) 
- [#16026](https://github.com/1024pix/pix/pull/16026) Update dependency axios to v1.15.1 (api) 
- [#16087](https://github.com/1024pix/pix/pull/16087) Update dependency axios to v1.15.2 (api) 
- [#16102](https://github.com/1024pix/pix/pull/16102) Update dependency eslint-plugin-ember to v13 (junior) 
- [#16105](https://github.com/1024pix/pix/pull/16105) Update dependency eslint-plugin-ember to v13 (orga) 
- [#16092](https://github.com/1024pix/pix/pull/16092) Update dependency oxfmt to ^0.47.0 (api) 
- [#16089](https://github.com/1024pix/pix/pull/16089) Update slackapi/slack-github-action action to v3.0.2 (workflows)

# [5.400.0](https://github.com/1024pix/pix/compare/v5.399.0...v5.400.0) (2026-05-04)

### :rocket: Amélioration

- [#16049](https://github.com/1024pix/pix/pull/16049) Ajoute le nombre de question, la durée et le statut à la route d'historique des versions de référentiel (PIX-21479) 
- [#16056](https://github.com/1024pix/pix/pull/16056) MDX-232 #11_Moteur_Rechinfo_NOV_2 premiere integration 
- [#15898](https://github.com/1024pix/pix/pull/15898) Relectures module NR_Durabilité_NOV 
- [#16074](https://github.com/1024pix/pix/pull/16074) Update NR_Datacenter_AVA.json  

### :bug: Correction

- [#16076](https://github.com/1024pix/pix/pull/16076) Action test-modulix-content : cassée depuis l’ajout de tests (PIX-22605) 

### :building_construction: Tech

- [#16070](https://github.com/1024pix/pix/pull/16070) Ajoute un rapport de tests au job de test d'audit logger de la CI. 

### :arrow_up: Montée de version

- [#16033](https://github.com/1024pix/pix/pull/16033) Update dependency @1024pix/pix-ui to ^60.10.0 (certif) 
- [#16077](https://github.com/1024pix/pix/pull/16077) Update dependency @1024pix/pix-ui to ^60.10.1 (admin) 
- [#16078](https://github.com/1024pix/pix/pull/16078) Update dependency @1024pix/pix-ui to v60.10.1 (orga) 
- [#16068](https://github.com/1024pix/pix/pull/16068) Update Node.js to v24.15.0

# [5.399.0](https://github.com/1024pix/pix/compare/v5.398.0...v5.399.0) (2026-04-30)

### :rocket: Amélioration

- [#16062](https://github.com/1024pix/pix/pull/16062) Créer la logique pour lire les modules stockés dans learningContent (PIX-22552)(PIX-22265) 

### :bug: Correction

- [#16061](https://github.com/1024pix/pix/pull/16061) Corrige un problème de redirection sur la modal du GAR après avoir saisi un code (PIX-22467) 
- [#16064](https://github.com/1024pix/pix/pull/16064) Éviter d'avoir une erreur 500 lors d'un import de candidats vide (PIX-22590). 
- [#16059](https://github.com/1024pix/pix/pull/16059) Réinitialisation des références de feature toggles 
- [#16069](https://github.com/1024pix/pix/pull/16069) Safari >=26.4 : Problème si 2 épreuves successives de même type (PIX-22597) 

### :arrow_up: Montée de version

- [#16054](https://github.com/1024pix/pix/pull/16054) Update dependency eslint-plugin-ember to v13 (admin)

# [5.398.0](https://github.com/1024pix/pix/compare/v5.397.0...v5.398.0) (2026-04-29)

### :rocket: Amélioration

- [#16058](https://github.com/1024pix/pix/pull/16058) modif feedback poi trouver-mdp-rs 
- [#16057](https://github.com/1024pix/pix/pull/16057) Relecture finale GestionMDP_NOV 

### :bug: Correction

- [#16063](https://github.com/1024pix/pix/pull/16063) Réparer l'affichage de la page de détail d'un centre de certif (PIX-22593) 

### :building_construction: Tech

- [#16044](https://github.com/1024pix/pix/pull/16044) Ajouter un test e2e de non-régression pour la réconciliation SCO (PIX-22411)

# [5.397.0](https://github.com/1024pix/pix/compare/v5.396.0...v5.397.0) (2026-04-29)

### :rocket: Amélioration

- [#16051](https://github.com/1024pix/pix/pull/16051) : modifs 1er relecture JRO Antivirus IND 
- [#16046](https://github.com/1024pix/pix/pull/16046) Afficher le nombre de campagnes sur l'onglet dans la page de détail d'une organisation (PIX-21446) 
- [#16040](https://github.com/1024pix/pix/pull/16040) Ajouter une navigation par type d'object du catalogue (PIX-22346) 
- [#16010](https://github.com/1024pix/pix/pull/16010) Donner accès aux autres rôles à la liste des réseaux (PIX-22120) 
- [#16048](https://github.com/1024pix/pix/pull/16048) Mettre à jour les liens du centre d'aide dans Pix Orga (PIX-22529) 
- [#16042](https://github.com/1024pix/pix/pull/16042) Prendre en compte les modules en provenance de la release LCMS (PIX-22267) 
- [#16052](https://github.com/1024pix/pix/pull/16052) relecture finale mdp_nov 
- [#16030](https://github.com/1024pix/pix/pull/16030) Visio_IND Intégrer des retours suite aux relectures éval et édito 
- [#16037](https://github.com/1024pix/pix/pull/16037) Voir le nombre d'invitations en attente sur la page de détail d'un centre de certification (PIX-21450) 

### :bug: Correction

- [#16043](https://github.com/1024pix/pix/pull/16043) Gérer l'erreur 500 à la création d'un parcours combiné sans blueprint (PIX-22481) 
- [#16039](https://github.com/1024pix/pix/pull/16039) Sélectionner uniquement les orgas actives d'un centre de certif (PIX-22543). 

### :building_construction: Tech

- [#16047](https://github.com/1024pix/pix/pull/16047) Fix du test flaky pour la selection d'attestations (PIX-22470) 
- [#16050](https://github.com/1024pix/pix/pull/16050) Lire les paliers acquis depuis la base de données (PIX-22419) 
- [#16045](https://github.com/1024pix/pix/pull/16045) Supprime le critère SkillProfile qui n'est plus utilisé en production (PIX-22553) 

### :arrow_up: Montée de version

- [#16041](https://github.com/1024pix/pix/pull/16041) Update dependency @1024pix/pix-ui to ^60.10.0 (mon-pix) 
- [#16053](https://github.com/1024pix/pix/pull/16053) Update dependency oxfmt to ^0.46.0 (api)

# [5.396.0](https://github.com/1024pix/pix/compare/v5.395.0...v5.396.0) (2026-04-28)

### :rocket: Amélioration

- [#15964](https://github.com/1024pix/pix/pull/15964) Ajouter des logs sur l'ajout d'une adresse e-mail à un compte SSO (PIX-21989). 
- [#15980](https://github.com/1024pix/pix/pull/15980) Ajouter la page catalogue (PIX-22345) 
- [#15987](https://github.com/1024pix/pix/pull/15987) Ajouter les tubes aux collectes de profil dans l'API MADDO (PIX-22460) 
- [#16034](https://github.com/1024pix/pix/pull/16034) Inté transfert v2 MEFT1 
- [#15991](https://github.com/1024pix/pix/pull/15991) Modifications design suite à la review d'Epix d'ajout d'e-mail (PIX-22466). 
- [#15961](https://github.com/1024pix/pix/pull/15961) Module MFA_IND aligner les qrocm 

### :building_construction: Tech

- [#16036](https://github.com/1024pix/pix/pull/16036) Corriger le lint des composants gjs sur les applications front 
- [#16024](https://github.com/1024pix/pix/pull/16024) Retirer du code mort ou très peu utilisé dans le fichier shared/infra/repo/challenge-repository.js 

### :arrow_up: Montée de version

- [#16031](https://github.com/1024pix/pix/pull/16031) Update dependency @1024pix/pix-ui to ^60.10.0 (admin) 
- [#16035](https://github.com/1024pix/pix/pull/16035) Update dependency @1024pix/pix-ui to ^60.10.0 (junior) 
- [#16027](https://github.com/1024pix/pix/pull/16027) Update dependency ember-eslint-parser to ^0.10.0 (certif) 
- [#16028](https://github.com/1024pix/pix/pull/16028) Update dependency ember-eslint-parser to ^0.10.0 (junior)

# [5.395.0](https://github.com/1024pix/pix/compare/v5.394.0...v5.395.0) (2026-04-27)

### :rocket: Amélioration

- [#15990](https://github.com/1024pix/pix/pull/15990) Ajouter des filtres dans la liste des sessions sur PixCertif (PIX-22516). 
- [#15986](https://github.com/1024pix/pix/pull/15986) Autoriser la publication de toutes les certifications (PIX-22286) 
- [#16022](https://github.com/1024pix/pix/pull/16022) modifs relecture interne MiseEnFormeTexte_Nov_1 
- [#16023](https://github.com/1024pix/pix/pull/16023) relecture finale Virus_Nov 

### :building_construction: Tech

- [#16020](https://github.com/1024pix/pix/pull/16020) Ajouter la table Modules (PIX-22531) 
- [#16021](https://github.com/1024pix/pix/pull/16021) Ajouter le feature toggle isFetchingModulesFromLearningContentEnabled (PIX-22266) 
- [#16018](https://github.com/1024pix/pix/pull/16018) Améliorer les performances du test InMemoryKeyValueStorage 
- [#16025](https://github.com/1024pix/pix/pull/16025) Corrige le contenu d'un snapshot de csv de résultats sur un test E2E de la recette-certif 
- [#15875](https://github.com/1024pix/pix/pull/15875) Créer des modèles d'épreuve dédiés pour le bounded-context contenant le code du get-next-challenge pour les campagnes et les évaluations de compétence 
- [#15989](https://github.com/1024pix/pix/pull/15989) Rendre cohérent la traduction anglaise de Pix App (PIX-22522) 

### :coffee: Autre

- [#16029](https://github.com/1024pix/pix/pull/16029) Correction de la licence incluse dans  audit-logger

# [5.394.0](https://github.com/1024pix/pix/compare/v5.393.0...v5.394.0) (2026-04-24)

### :rocket: Amélioration

- [#15981](https://github.com/1024pix/pix/pull/15981) Ajouter la pagination sur la liste de réseaux dans pix-admin (PIX-21967) 
- [#15966](https://github.com/1024pix/pix/pull/15966) Ajustement de la page vérificateur Pix+ Pro Santé/Droit en mode MVP (PIX-22294) 
- [#16017](https://github.com/1024pix/pix/pull/16017) FRI 11_MoteurRechInfo_NOV1 v0 
- [#15935](https://github.com/1024pix/pix/pull/15935) Module RangerFichier_Nov test avec embeds OsPix 

### :building_construction: Tech

- [#16008](https://github.com/1024pix/pix/pull/16008) :broom: Supprime (encore) le répertoire load-testing  
- [#16001](https://github.com/1024pix/pix/pull/16001) :broom: Supprime le repertoire `load-testing` qui n'est plus utilisé 
- [#16002](https://github.com/1024pix/pix/pull/16002) :broom: Supprime le répertoire inutilisé `docker/` 
- [#15998](https://github.com/1024pix/pix/pull/15998) :package: Fixe la version minimum de la bibliothèque `protobufs` 
- [#15993](https://github.com/1024pix/pix/pull/15993) :recycle: Réduit l'utilisation de LODASH 
- [#15999](https://github.com/1024pix/pix/pull/15999) Améliorer la DX des IDE avec les jsconfig.json 
- [#16000](https://github.com/1024pix/pix/pull/16000) Corriger les warnings du lint sur les composants gjs côté Pix App 
- [#15960](https://github.com/1024pix/pix/pull/15960) Refactore les builders pour construire le contenu à partir d'un blueprint (PIX-22473) 

### :arrow_up: Montée de version

- [#16011](https://github.com/1024pix/pix/pull/16011) Update dependency @1024pix/pix-ui to ^60.9.0 (admin) 
- [#16012](https://github.com/1024pix/pix/pull/16012) Update dependency @1024pix/pix-ui to ^60.9.0 (certif) 
- [#16013](https://github.com/1024pix/pix/pull/16013) Update dependency @1024pix/pix-ui to ^60.9.0 (junior) 
- [#16014](https://github.com/1024pix/pix/pull/16014) Update dependency @1024pix/pix-ui to ^60.9.0 (mon-pix) 
- [#16015](https://github.com/1024pix/pix/pull/16015) Update dependency @1024pix/pix-ui to ^60.9.0 (orga) 
- [#16009](https://github.com/1024pix/pix/pull/16009) Update dependency @datadog/datadog-api-client to v1.56.0 (api) 

### :coffee: Autre

- [#16019](https://github.com/1024pix/pix/pull/16019) Update IADefinition_IND.json - correction coquille

# [5.393.0](https://github.com/1024pix/pix/compare/v5.392.1...v5.393.0) (2026-04-23)

### :rocket: Amélioration

- [#15893](https://github.com/1024pix/pix/pull/15893) Créer la page de résultat pour le moteur de recommandation (Pix 22214) 
- [#15949](https://github.com/1024pix/pix/pull/15949) Scinder en 2 la colonne "Résultats" des .csv des résultats de certif (PIX-22429). 

### :bug: Correction

- [#15982](https://github.com/1024pix/pix/pull/15982) Éviter les problèmes de fuseau horaire sur PixAdmin (PIX-22515). 

### :building_construction: Tech

- [#15959](https://github.com/1024pix/pix/pull/15959) :broom: Suppression de l'utilisation de l'attribut `completedAt` de `CertificationCourse` 
- [#15984](https://github.com/1024pix/pix/pull/15984) Ajoute le requestId aux logs SQL. 
- [#16004](https://github.com/1024pix/pix/pull/16004) Mise à jour de epreuve component. 
- [#15927](https://github.com/1024pix/pix/pull/15927) Nettoyer les utilisations de Accept-Language qui ne sont plus utiles (PIX-22456) 

### :arrow_up: Montée de version

- [#16003](https://github.com/1024pix/pix/pull/16003) Update dependency @1024pix/epreuves-components to ^4.4.0 (api) 
- [#15992](https://github.com/1024pix/pix/pull/15992) Update dependency @1024pix/pix-ui to ^60.8.0 (admin) 
- [#15994](https://github.com/1024pix/pix/pull/15994) Update dependency @1024pix/pix-ui to ^60.8.0 (certif) 
- [#15995](https://github.com/1024pix/pix/pull/15995) Update dependency @1024pix/pix-ui to ^60.8.0 (junior) 
- [#15996](https://github.com/1024pix/pix/pull/15996) Update dependency @1024pix/pix-ui to ^60.8.0 (mon-pix) 
- [#15997](https://github.com/1024pix/pix/pull/15997) Update dependency @1024pix/pix-ui to ^60.8.0 (orga) 
- [#15985](https://github.com/1024pix/pix/pull/15985) Update dependency webpack to v5.106.2 (junior)

## [5.392.1](https://github.com/1024pix/pix/compare/v5.392.0...v5.392.1) (2026-04-22)

### :building_construction: Tech

- [#15900](https://github.com/1024pix/pix/pull/15900) Mettre en place une redirection pour des campagnes France Travail (PIX-22413)

# [5.392.0](https://github.com/1024pix/pix/compare/v5.391.0...v5.392.0) (2026-04-22)

### :rocket: Amélioration

- [#15953](https://github.com/1024pix/pix/pull/15953) Autoriser le rôle métier à accéder à l'onglet Réseau d'une organisation (PIX-22118) 
- [#15978](https://github.com/1024pix/pix/pull/15978) datacenter-modif-QCU 
- [#15967](https://github.com/1024pix/pix/pull/15967) Empêcher la création de session en doublon (PIX-12384). 
- [#15977](https://github.com/1024pix/pix/pull/15977) improve Dutch translations 
- [#15971](https://github.com/1024pix/pix/pull/15971) Modifier les URLs des fichiers de rapport de fraude (PIX-22291). 
- [#15972](https://github.com/1024pix/pix/pull/15972) modifs relecture marine + alt text repondremail_nov 
- [#15970](https://github.com/1024pix/pix/pull/15970) modifs relectures finales Module Antivirus 

### :bug: Correction

- [#15962](https://github.com/1024pix/pix/pull/15962) Préserver le sélecteur de pays de naissance lors de l'édition d'un candidat de certif (PIX-22469). 
- [#15979](https://github.com/1024pix/pix/pull/15979) S'assurer de terminer le stream LLM une seule fois 

### :building_construction: Tech

- [#15936](https://github.com/1024pix/pix/pull/15936) :recycle: Réduit l'utilisation de `lodash` dans le contexte de la certification 
- [#15965](https://github.com/1024pix/pix/pull/15965) Ne plus importer certains utilitaires depuis test-helper.js (part 5) 
- [#15973](https://github.com/1024pix/pix/pull/15973) Ne plus importer certains utilitaires depuis test-helper.js (part 6) 

### :arrow_up: Montée de version

- [#15976](https://github.com/1024pix/pix/pull/15976) Update nginx Docker tag to v1.30.0 
- [#15975](https://github.com/1024pix/pix/pull/15975) Update Node.js to v24.15.0

# [5.391.0](https://github.com/1024pix/pix/compare/v5.390.1...v5.391.0) (2026-04-21)

### :rocket: Amélioration

- [#15907](https://github.com/1024pix/pix/pull/15907) Ajouter la route qui récupère les informations du catalogue sur PixOrga (PIX-22207). 
- [#15942](https://github.com/1024pix/pix/pull/15942) Modifier la formulation d'organisation parente (PIX-22430) 
- [#15888](https://github.com/1024pix/pix/pull/15888) Module MFA_IND changement exos et images definitives 
- [#15915](https://github.com/1024pix/pix/pull/15915) Supprimer la colonne parentOrganizationId du CSV de modification d'organisations en masse (PIX-22386) 
- [#15902](https://github.com/1024pix/pix/pull/15902) Utiliser le système des réseaux dans la création d'organisations en masse (PIX-22116) 

### :bug: Correction

- [#15914](https://github.com/1024pix/pix/pull/15914) Ne pas mettre à jour le createdAt lors de la mise à jour des DPO (PIX-22393) 
- [#15954](https://github.com/1024pix/pix/pull/15954) Réparer du style dans le composant DescriptionList de PixAdmin  

### :building_construction: Tech

- [#15923](https://github.com/1024pix/pix/pull/15923) Ajout d'un test E2E pour l'inscription SCO en certif (PIX-22370). 
- [#15940](https://github.com/1024pix/pix/pull/15940) Ne plus importer certains utilitaires depuis test-helper.js (part 2) 
- [#15950](https://github.com/1024pix/pix/pull/15950) Ne plus importer certains utilitaires depuis test-helper.js (part 3) 
- [#15952](https://github.com/1024pix/pix/pull/15952) Ne plus importer certains utilitaires depuis test-helper.js (part 4) 

### :arrow_up: Montée de version

- [#15945](https://github.com/1024pix/pix/pull/15945) Update dependency @1024pix/pix-ui to ^60.6.0 (certif) 
- [#15951](https://github.com/1024pix/pix/pull/15951) Update dependency @1024pix/pix-ui to ^60.7.0 (admin) 
- [#15955](https://github.com/1024pix/pix/pull/15955) Update dependency @1024pix/pix-ui to ^60.7.0 (certif) 
- [#15956](https://github.com/1024pix/pix/pull/15956) Update dependency @1024pix/pix-ui to ^60.7.0 (junior) 
- [#15957](https://github.com/1024pix/pix/pull/15957) Update dependency @1024pix/pix-ui to ^60.7.0 (orga) 
- [#15958](https://github.com/1024pix/pix/pull/15958) Update dependency oxfmt to ^0.45.0 (api)

## [5.390.1](https://github.com/1024pix/pix/compare/v5.390.0...v5.390.1) (2026-04-20)

### :bug: Correction

- [#15947](https://github.com/1024pix/pix/pull/15947) Initialise le JobClient dans un script qui utilise un job pgboss (PIX-22454) 

### :arrow_up: Montée de version

- [#15948](https://github.com/1024pix/pix/pull/15948) Update dependency @1024pix/pix-ui to ^60.7.0 (mon-pix)

# [5.390.0](https://github.com/1024pix/pix/compare/v5.389.0...v5.390.0) (2026-04-20)

### :rocket: Amélioration

- [#15339](https://github.com/1024pix/pix/pull/15339) Add github action to upload SBOMs to Deptrack 
- [#15924](https://github.com/1024pix/pix/pull/15924) Ajout du label au formulaire de création d'attestation (PIX-22301) 
- [#15847](https://github.com/1024pix/pix/pull/15847) Ajouter le tag "Points clés" au début de tous les grains short lesson (PIX-22250) 
- [#15908](https://github.com/1024pix/pix/pull/15908) Ajouter les étapes EDU et l'hexagone dans le certificat Pix plus (PIX-22137). 
- [#15786](https://github.com/1024pix/pix/pull/15786) Ajouter une méthode de connexion par email après avoir validé le code soumis par l'utilisateur 
- [#15873](https://github.com/1024pix/pix/pull/15873) Changer la durée de validité du code de vérification d'e-mail (PIX-22065). 
- [#15872](https://github.com/1024pix/pix/pull/15872) expose la date de dernière réponse à l'application front `PixAdmin` (pix-22326) 
- [#15930](https://github.com/1024pix/pix/pull/15930) MDX-138 IAGenPrompt_AVA retours relecture 
- [#15880](https://github.com/1024pix/pix/pull/15880) Modifs config pixwriter 
- [#15812](https://github.com/1024pix/pix/pull/15812) Module GestionMDP_NOV integration embed 
- [#15929](https://github.com/1024pix/pix/pull/15929) Rendre obligatoire le questId sur combined-course-blueprints (PIX-21724) 
- [#15729](https://github.com/1024pix/pix/pull/15729) surequipement-ajout-image 
- [#15856](https://github.com/1024pix/pix/pull/15856) Update IADefinition_IND.json - Relecture JRO 
- [#15894](https://github.com/1024pix/pix/pull/15894) Update IAGenFonction_Ava.json - relecture Marine 
- [#15842](https://github.com/1024pix/pix/pull/15842) Update NR_Datacenter_AVA.json Ajout illustrations 

### :bug: Correction

- [#15932](https://github.com/1024pix/pix/pull/15932) Ajoute des traductions manquantes des Pix + EDU sur la page vérificateur 
- [#15906](https://github.com/1024pix/pix/pull/15906) Corriger la validation des éléments Text 

### :building_construction: Tech

- [#15918](https://github.com/1024pix/pix/pull/15918) Ajouter un script pour rattraper pour ajouter le commentaire aux certifications scorées Pix+Edu non admissibles (PIX-22377). 
- [#15899](https://github.com/1024pix/pix/pull/15899) Ajouter un test end to end sur la réactivation d'un prescrit après un import (PIX-22409). 
- [#15887](https://github.com/1024pix/pix/pull/15887) Autoriser une chaîne vide sur un champ uri (PIX-22390)  
- [#15921](https://github.com/1024pix/pix/pull/15921) Baisser le nombre de tentatives de réexécution du job de scoring en cas d'échec 
- [#15920](https://github.com/1024pix/pix/pull/15920) Mettre à jour les infos des dépôts Ubuntu avant d'installer les navigateurs pour les tests fronts 
- [#15937](https://github.com/1024pix/pix/pull/15937) Ne plus importer certains utilitaires depuis test-helper.js 
- [#15931](https://github.com/1024pix/pix/pull/15931) Rendre la colonne label de la table attestations non nullable (PIX-22297) 
- [#15934](https://github.com/1024pix/pix/pull/15934) Revoir le composant DescriptionList de PixAdmin (PIX-22455). 
- [#15912](https://github.com/1024pix/pix/pull/15912) Supprimer ember-dayjs (PIX-22432) 
- [#15928](https://github.com/1024pix/pix/pull/15928) Supprimer les traductions inutilisées sur PixOrga et sur PixAdmin (PIX-22282) 
- [#15933](https://github.com/1024pix/pix/pull/15933) Utiliser le databaseBuilder au lieu du mockLearningContent 

### :arrow_up: Montée de version

- [#15944](https://github.com/1024pix/pix/pull/15944) Update dependency @1024pix/pix-ui to ^60.6.0 (admin) 
- [#15946](https://github.com/1024pix/pix/pull/15946) Update dependency @1024pix/pix-ui to ^60.6.0 (mon-pix) 
- [#15938](https://github.com/1024pix/pix/pull/15938) Update dependency @ember/render-modifiers to v4 (junior) 
- [#15919](https://github.com/1024pix/pix/pull/15919) Update dependency webpack to v5.106.1 (junior) 

### :coffee: Autre

- [#15850](https://github.com/1024pix/pix/pull/15850) Créer le fichier CLAUDE.md du bounded context DevComp (PIX-22364)

# [5.389.0](https://github.com/1024pix/pix/compare/v5.388.0...v5.389.0) (2026-04-17)

### :rocket: Amélioration

- [#15808](https://github.com/1024pix/pix/pull/15808) Afficher les labels d'attestation dans les fronts de Pix Admin et Pix Orga (PIX-22281) 
- [#15828](https://github.com/1024pix/pix/pull/15828) Ajouter le centre d'aide dans la sidebar de Pix Orga (PIX-22329) 
- [#15868](https://github.com/1024pix/pix/pull/15868) Ajouter un com auto aux candidats non-admissibles à Pix+ Edu (PIX-22340). 
- [#15841](https://github.com/1024pix/pix/pull/15841) Filtrer sur l'identifiant externe sur les participations d'une campagne dans PixOrga (PIX-20537). 
- [#15909](https://github.com/1024pix/pix/pull/15909) Intégrer des retours suite aux relectures RepondreMail_IND 
- [#15816](https://github.com/1024pix/pix/pull/15816) MDX-18 iagenethique_ind correction coquilles 
- [#15896](https://github.com/1024pix/pix/pull/15896) Supprimer le logo République Française sur Pix App (PIX-22339) 

### :bug: Correction

- [#15904](https://github.com/1024pix/pix/pull/15904) Corriger le calcul de la durée en millisecondes du CpfExportBuilderJobController 

### :building_construction: Tech

- [#15897](https://github.com/1024pix/pix/pull/15897) Corrige les ralentissements de la CI en utilisant une image dispo sur le Dockerhub prête pour Playwright 
- [#15891](https://github.com/1024pix/pix/pull/15891) supprimer le paquet ember-cli-notifications (PIX-22394) 
- [#15901](https://github.com/1024pix/pix/pull/15901) Utilisation du hook `activate()` plutôt que d'utiliser le `constructor()` 

### :arrow_up: Montée de version

- [#15895](https://github.com/1024pix/pix/pull/15895) Update dependency @1024pix/pix-ui to ^60.5.0 (admin) 
- [#15903](https://github.com/1024pix/pix/pull/15903) Update dependency @1024pix/pix-ui to ^60.5.0 (certif) 
- [#15905](https://github.com/1024pix/pix/pull/15905) Update dependency @1024pix/pix-ui to ^60.5.0 (junior) 
- [#15910](https://github.com/1024pix/pix/pull/15910) Update dependency @1024pix/pix-ui to ^60.5.0 (mon-pix) 
- [#15911](https://github.com/1024pix/pix/pull/15911) Update dependency @1024pix/pix-ui to ^60.5.0 (orga) 
- [#15889](https://github.com/1024pix/pix/pull/15889) Update dependency axios to v1.15.0 (api) 
- [#15913](https://github.com/1024pix/pix/pull/15913) Update dependency ember-cli to ~6.12.0 (admin)

# [5.388.0](https://github.com/1024pix/pix/compare/v5.387.0...v5.388.0) (2026-04-16)

### :rocket: Amélioration

- [#15834](https://github.com/1024pix/pix/pull/15834) Ajouter un tag Tête de réseau sur la page de détail d'une organisation (PIX-22320) 
- [#15848](https://github.com/1024pix/pix/pull/15848) integration POI decouverte 3 VIRUS_NOV 
- [#15870](https://github.com/1024pix/pix/pull/15870) rangerfichiers ind ajout config+validation 
- [#15845](https://github.com/1024pix/pix/pull/15845) Supprimer toutes les invitations d'une organisation à l'archivage (PIX-22086) 

### :bug: Correction

- [#15885](https://github.com/1024pix/pix/pull/15885) Corriger l'initialisation des buckets S3 dans l'image docker 

### :building_construction: Tech

- [#15851](https://github.com/1024pix/pix/pull/15851) Ajouter des logs de timing aux erreurs OIDC (PIX-22335) 
- [#15879](https://github.com/1024pix/pix/pull/15879) Déplacer ou supprimer les derniers helpers de test-helper.js 
- [#15869](https://github.com/1024pix/pix/pull/15869) Extraire et isoler les mocks de test-helpers.js 
- [#15838](https://github.com/1024pix/pix/pull/15838) Mise à disposition d'une API interne dans le bounded context "certification/configuration" pour permettre la récupération des versions de référentiels de certification  
- [#15884](https://github.com/1024pix/pix/pull/15884) Préparer une publication minimale de tous les Pix+ (PIX-22376) 
- [#15860](https://github.com/1024pix/pix/pull/15860) remplace la dépendance ember-cli-mirage par miragejs (PIX-22369) 
- [#15876](https://github.com/1024pix/pix/pull/15876) Répare la configuration eslint sur les fichiers gjs de Pix Orga. 
- [#15882](https://github.com/1024pix/pix/pull/15882) Réparer les versions de certifs dans les seeds (PIX-22389). 
- [#15874](https://github.com/1024pix/pix/pull/15874) S'assurer que les envois répétés de signaux de fermeture d'API ne déclenchent pas plusieurs fois les opérations d'extinction 
- [#15785](https://github.com/1024pix/pix/pull/15785) Supprimer la colonne content de la table des schémas de parcours (PIX-22213) 
- [#15852](https://github.com/1024pix/pix/pull/15852) Supprimer RSVP de PixOrga (PIX-22372). 

### :arrow_up: Montée de version

- [#15877](https://github.com/1024pix/pix/pull/15877) Update adobe/s3mock Docker tag to v5 (.circleci) 
- [#15878](https://github.com/1024pix/pix/pull/15878) Update adobe/s3mock Docker tag to v5 (docker) 
- [#15881](https://github.com/1024pix/pix/pull/15881) Update adobe/s3mock Docker tag to v5 (dossier racine) 
- [#15886](https://github.com/1024pix/pix/pull/15886) Update dependency webpack to v5.106.0 (junior)

# [5.387.0](https://github.com/1024pix/pix/compare/v5.386.0...v5.387.0) (2026-04-15)

### :rocket: Amélioration

- [#15798](https://github.com/1024pix/pix/pull/15798) Ajouter une route pour récupérer les données des filtres pour une organisations sur leur prescrits (PIX-22226). 
- [#15745](https://github.com/1024pix/pix/pull/15745) Modifier la page de vérification du code reçu par e-mail (PIX-21986). 
- [#15829](https://github.com/1024pix/pix/pull/15829) Modifs Visio_IND suite à faisabilité POI 

### :bug: Correction

- [#15864](https://github.com/1024pix/pix/pull/15864) Renommer la clé de la feature du moteur de reco (PIX-22363) 

### :building_construction: Tech

- [#15763](https://github.com/1024pix/pix/pull/15763) :package: :lock: Force la version de `flatted` pour des raisons de sécurité. 
- [#15788](https://github.com/1024pix/pix/pull/15788) :recycle: Réduit l'utilisation de `lodash` 
- [#15833](https://github.com/1024pix/pix/pull/15833) Ajouter un script pour rétroremplir la colonne "lastAnswerAt" de la table "certification-courses" (PIX-22325) 
- [#15840](https://github.com/1024pix/pix/pull/15840) Éviter de faire des tests d'integ en unitaire sur PixCertif (PIX-22348). 
- [#15844](https://github.com/1024pix/pix/pull/15844) Isoler et regrouper des helpers de test-helper.js 
- [#15826](https://github.com/1024pix/pix/pull/15826) Refacto pour utiliser plus efficacement le "versionId" présent au niveau du "certification-course" dans le code du bounded context "certification/evaluation" 
- [#15849](https://github.com/1024pix/pix/pull/15849) Remplir la colonne lastAnswerAt lors du seeding de la BDD (PIX-22362). 
- [#15853](https://github.com/1024pix/pix/pull/15853) Supprimer des paquets inutilisé de PixCertif (PIX-22365). 

### :arrow_up: Montée de version

- [#15854](https://github.com/1024pix/pix/pull/15854) Update adobe/s3mock Docker tag to v4.12.3 (.circleci) 
- [#15855](https://github.com/1024pix/pix/pull/15855) Update adobe/s3mock Docker tag to v4.12.3 (docker) 
- [#15858](https://github.com/1024pix/pix/pull/15858) Update adobe/s3mock Docker tag to v4.12.4 (.circleci) 
- [#15859](https://github.com/1024pix/pix/pull/15859) Update adobe/s3mock Docker tag to v4.12.4 (docker) 
- [#15861](https://github.com/1024pix/pix/pull/15861) Update adobe/s3mock Docker tag to v4.12.4 (dossier racine) 
- [#15830](https://github.com/1024pix/pix/pull/15830) Update dependency @1024pix/pix-ui to ^60.4.0 (orga) 
- [#15846](https://github.com/1024pix/pix/pull/15846) Update dependency @1024pix/pix-ui to ^60.4.1 (admin) 
- [#15862](https://github.com/1024pix/pix/pull/15862) Update dependency @1024pix/pix-ui to ^60.4.1 (certif) 
- [#15863](https://github.com/1024pix/pix/pull/15863) Update dependency @1024pix/pix-ui to ^60.4.1 (junior) 
- [#15865](https://github.com/1024pix/pix/pull/15865) Update dependency @1024pix/pix-ui to ^60.4.1 (mon-pix) 
- [#15866](https://github.com/1024pix/pix/pull/15866) Update dependency @1024pix/pix-ui to ^60.4.1 (orga) 
- [#15832](https://github.com/1024pix/pix/pull/15832) Update dependency ember-file-upload to v10 (certif) 
- [#15871](https://github.com/1024pix/pix/pull/15871) Update dependency oxfmt to ^0.44.0 (api) 
- [#15867](https://github.com/1024pix/pix/pull/15867) Update nginx Docker tag to v1.29.8

# [5.386.0](https://github.com/1024pix/pix/compare/v5.385.0...v5.386.0) (2026-04-14)

### :rocket: Amélioration

- [#15806](https://github.com/1024pix/pix/pull/15806) Améliorer la sécurité de la gestion des OIDC Providers (PIX-22322) 
- [#15813](https://github.com/1024pix/pix/pull/15813) Autoriser la création d'une organisation fille à partir d'une organisation fille (PIX-22047) 
- [#15800](https://github.com/1024pix/pix/pull/15800) Créer un script pour activer la feature pour une liste de campagnes (PIX-22217) 
- [#15752](https://github.com/1024pix/pix/pull/15752) Modif module Antivirus suite relecture exp 
- [#15721](https://github.com/1024pix/pix/pull/15721) Module RangerFichier_NOV modifs relectures Eval et team modulix 
- [#15801](https://github.com/1024pix/pix/pull/15801) Permettre un fallback au niveau des épreuves  (PIX-22277). 
- [#15822](https://github.com/1024pix/pix/pull/15822) Remplir la colonne "lastAnswerAt" de la table "certification-courses" à chaque réponse apportée par le candidat 
- [#15793](https://github.com/1024pix/pix/pull/15793) Rendre le contenu de l'e-mail de vérification de changement d’e-mail générique (PIX-21991) 

### :bug: Correction

- [#15770](https://github.com/1024pix/pix/pull/15770) Corriger les décalages entre les blocages effectifs de comptes et les informations affichées aux utilisateurs (PIX-18309) 

### :building_construction: Tech

- [#15821](https://github.com/1024pix/pix/pull/15821) Déplacer le code spécifique au fait d'apporter une réponse à une épreuve de certification dans le bounded context "certification/evaluation" 
- [#15823](https://github.com/1024pix/pix/pull/15823) Extraire la lecture de fichiers utilisés dans les tests de test-helper.js 
- [#15839](https://github.com/1024pix/pix/pull/15839) Modifier le lien de la documentation de certification sur la banner warning (PIX-22349). 
- [#15831](https://github.com/1024pix/pix/pull/15831) Supprimer ember-cli-clipboard de pix-orga (PIX-22352). 

### :arrow_up: Montée de version

- [#15820](https://github.com/1024pix/pix/pull/15820) Update dependency @1024pix/pix-ui to ^60.4.0 (certif) 
- [#15825](https://github.com/1024pix/pix/pull/15825) Update dependency @1024pix/pix-ui to ^60.4.0 (junior) 
- [#15827](https://github.com/1024pix/pix/pull/15827) Update dependency @1024pix/pix-ui to ^60.4.0 (mon-pix) 
- [#15757](https://github.com/1024pix/pix/pull/15757) Update dependency @glimmer/component to v2 (certif)

# [5.385.0](https://github.com/1024pix/pix/compare/v5.384.0...v5.385.0) (2026-04-13)

### :rocket: Amélioration

- [#15775](https://github.com/1024pix/pix/pull/15775) Ajouter la feature "recommendation-engine" pour les campagnes (PIX-22148)(PIX-22219) 
- [#15817](https://github.com/1024pix/pix/pull/15817) IA-droit-auteur-nouvelles-activites 
- [#15805](https://github.com/1024pix/pix/pull/15805) Permettre à l'équipe métier de re-scorer une certification tant qu'elle n'est ni publiée ni dans une session non finalisée (PIX-22292) 
- [#15725](https://github.com/1024pix/pix/pull/15725) Pouvoir donner une valeur au résultat du volet Externe pour les certifications Pix+ EDU (PIX-21820) 
- [#15804](https://github.com/1024pix/pix/pull/15804) Relier les structures à la création d'organisation fille (PIX-22316) 
- [#15810](https://github.com/1024pix/pix/pull/15810) Supprimer "points clés" des tags d'un text-element (pix-22247) 

### :building_construction: Tech

- [#15814](https://github.com/1024pix/pix/pull/15814) Ajoute une API interne pour corriger une réponse apportée par un utilisateur 
- [#15811](https://github.com/1024pix/pix/pull/15811) Ajouter la colonne lastAnswerAt à la table certification-courses (PIX-22323). 
- [#15809](https://github.com/1024pix/pix/pull/15809) Extraire les chai-custom-helpers de test-helper 
- [#15819](https://github.com/1024pix/pix/pull/15819) Remplacer des test-helpers par des database-builder 

### :arrow_up: Montée de version

- [#15797](https://github.com/1024pix/pix/pull/15797) Update dependency @1024pix/pix-ui to ^60.3.0 (junior) 
- [#15815](https://github.com/1024pix/pix/pull/15815) Update dependency @1024pix/pix-ui to ^60.3.0 (mon-pix) 
- [#15818](https://github.com/1024pix/pix/pull/15818) Update dependency @1024pix/pix-ui to ^60.4.0 (admin)

# [5.384.0](https://github.com/1024pix/pix/compare/v5.383.0...v5.384.0) (2026-04-10)

### :rocket: Amélioration

- [#15787](https://github.com/1024pix/pix/pull/15787) Ajoute une colonne "label" à la table attestations et la remplit (PIX-22280) 
- [#15799](https://github.com/1024pix/pix/pull/15799) Cocher automatiquement le blocage lorsqu'on coche la gestion des places (PIX-22163) 
- [#15792](https://github.com/1024pix/pix/pull/15792) Récupération des informations de l'organisation parente via le reseau (PIX-22115) 

### :building_construction: Tech

- [#15794](https://github.com/1024pix/pix/pull/15794) Ne plus remonter de 500 lors d'une réponse à un assessment sur une participation supprimée (PIX-22314).

# [5.383.0](https://github.com/1024pix/pix/compare/v5.382.0...v5.383.0) (2026-04-10)

### :rocket: Amélioration

- [#15738](https://github.com/1024pix/pix/pull/15738) Ajouter la table organization_learner_filters (PIX-22220). 
- [#15655](https://github.com/1024pix/pix/pull/15655) Ajouter un composant pour permettre à un utilisateur d'ajouter à son compte une connexion par email (PIX-21985) 
- [#15796](https://github.com/1024pix/pix/pull/15796) Autoriser le scoring des certification Pix + Droit et Pro santé (PIX-22315) 
- [#15652](https://github.com/1024pix/pix/pull/15652) Créer un script pour migrer les données des apprenants avec imports dans attributes (Pix-22015). 
- [#15744](https://github.com/1024pix/pix/pull/15744) Insérer les configuration de filtres de l'organisation à l'insertion des learners en BDD (Pix-22222). 
- [#15780](https://github.com/1024pix/pix/pull/15780) Récupération des organisations de niveau N-1 d'une organisation parent (PIX-22043) 
- [#15760](https://github.com/1024pix/pix/pull/15760) Supprimer l'onglet Organisations filles sur la page d'une organisation 

### :building_construction: Tech

- [#15795](https://github.com/1024pix/pix/pull/15795) Ajouter un petit temps de pause entre chaque certification traitée dans le script de rescoring 
- [#15791](https://github.com/1024pix/pix/pull/15791) Corriger le chargement des seeds 
- [#15789](https://github.com/1024pix/pix/pull/15789) Suppression d'un script obsolète 
- [#15807](https://github.com/1024pix/pix/pull/15807) Utilise un exécuteur sans infra pour les tests unitaires de la CI. 

### :arrow_up: Montée de version

- [#15781](https://github.com/1024pix/pix/pull/15781) Update dependency @1024pix/pix-ui to ^60.3.0 (certif)

# [5.382.0](https://github.com/1024pix/pix/compare/v5.381.0...v5.382.0) (2026-04-09)

### :rocket: Amélioration

- [#15782](https://github.com/1024pix/pix/pull/15782) Ajutement de la longueur des input phrase (PIX-22051) 
- [#15756](https://github.com/1024pix/pix/pull/15756) Renommer "langues localisées" en "locales" (PIX-22184) 
- [#15777](https://github.com/1024pix/pix/pull/15777) RepondreMail_NOV Retours experts 
- [#15784](https://github.com/1024pix/pix/pull/15784) WIP MiseEnFormeTxt_NOV 

### :bug: Correction

- [#15783](https://github.com/1024pix/pix/pull/15783) Corrige la mise à jour de campagnes dans le cadre des Parcours Apprenants (PIX-22033). 
- [#15790](https://github.com/1024pix/pix/pull/15790) S'assurer qu'un score de 0 a bien pour conséquence une certification rejetée pour cause de score trop bas 

### :building_construction: Tech

- [#15765](https://github.com/1024pix/pix/pull/15765) Crée une nouvelle méthode sur CombinedCourseDetails pour éviter d'appeler deux fois les requêtes du CombinedCourseDetailsService 
- [#15762](https://github.com/1024pix/pix/pull/15762) Désactiver les post-install npm

# [5.381.0](https://github.com/1024pix/pix/compare/v5.380.0...v5.381.0) (2026-04-08)

### :rocket: Amélioration

- [#15768](https://github.com/1024pix/pix/pull/15768) Ajout du champ application_name dans le knexfile (PIX-22248) 

### :bug: Correction

- [#15779](https://github.com/1024pix/pix/pull/15779) Corriger l'affichage de la liste des participants pour les organisations non SUP/SCO (PIX-22275). 

### :arrow_up: Montée de version

- [#15778](https://github.com/1024pix/pix/pull/15778) Update dependency @1024pix/pix-ui to ^60.3.0 (admin)

# [5.380.0](https://github.com/1024pix/pix/compare/v5.379.0...v5.380.0) (2026-04-08)

### :rocket: Amélioration

- [#15746](https://github.com/1024pix/pix/pull/15746) Afficher le résultat d'un volet jury externe dans PixAdmin (PIX-22240) 
- [#14328](https://github.com/1024pix/pix/pull/14328) Ajout de la lecture du postMessage des embed coté junior(PIX-19497) 
- [#15638](https://github.com/1024pix/pix/pull/15638) Custom 5 modules - Ajouts title, instruction, functional instruction 
- [#15774](https://github.com/1024pix/pix/pull/15774) datacenter-coquille 
- [#15766](https://github.com/1024pix/pix/pull/15766) durabilite-ava-corrections-post-relecture 
- [#15764](https://github.com/1024pix/pix/pull/15764) Feature toggles : Lecture synchrone et observabilité 
- [#14935](https://github.com/1024pix/pix/pull/14935) intégration NR_Evaluation_AVA base 
- [#15767](https://github.com/1024pix/pix/pull/15767) MDX-16 Modification media 
- [#15739](https://github.com/1024pix/pix/pull/15739) Supprimer le logo national des emails FR (PIX-22197) 

### :bug: Correction

- [#15769](https://github.com/1024pix/pix/pull/15769) Réparer les timezones de 2 dates de PixCertif (PIX-22272). 

### :building_construction: Tech

- [#15758](https://github.com/1024pix/pix/pull/15758) :lock: Forcer la montée de version de `handlebars` 
- [#15771](https://github.com/1024pix/pix/pull/15771) Ajoute le domaine de la route dans les logs SQL. 
- [#15761](https://github.com/1024pix/pix/pull/15761) Corriger l'utilisation du logger dans le code de PgBoss 
- [#15734](https://github.com/1024pix/pix/pull/15734) Réecrire des tests de usecases en unitaire vers un test integration (PIX-22242). 
- [#15754](https://github.com/1024pix/pix/pull/15754) Utilise la quête du blueprint plutôt que son attribut `content` (PIX-22204). 
- [#15609](https://github.com/1024pix/pix/pull/15609) Utiliser le SDK PgBoss au lieu de Knex 

### :arrow_up: Montée de version

- [#15772](https://github.com/1024pix/pix/pull/15772) Update dependency ember-source to ~6.12.0 (admin) 
- [#15773](https://github.com/1024pix/pix/pull/15773) Update dependency ember-source to ~6.12.0 (junior)

# [5.379.0](https://github.com/1024pix/pix/compare/v5.378.0...v5.379.0) (2026-04-07)

### :rocket: Amélioration

- [#15675](https://github.com/1024pix/pix/pull/15675) créa d'un module MFA_Nov B 
- [#15743](https://github.com/1024pix/pix/pull/15743) Trier par nom de famille au lieu du prénom en premier dans la page attestations (PIX-22243). 

### :building_construction: Tech

- [#15601](https://github.com/1024pix/pix/pull/15601) Learning content : Suppression de l’ancienne mise en cache 
- [#15755](https://github.com/1024pix/pix/pull/15755) Modifier la façon d'envoyer les credentials dans l'action create-jira-version.yaml 

### :arrow_up: Montée de version

- [#15747](https://github.com/1024pix/pix/pull/15747) Update dependency axios to v1.14.0 (api) 
- [#15748](https://github.com/1024pix/pix/pull/15748) Update dependency eslint-plugin-unicorn to v64 (api) 
- [#15749](https://github.com/1024pix/pix/pull/15749) Update dependency eslint-plugin-unicorn to v64 (audit-logger) 
- [#15750](https://github.com/1024pix/pix/pull/15750) Update dependency eslint-plugin-unicorn to v64 (certif) 
- [#15751](https://github.com/1024pix/pix/pull/15751) Update dependency eslint-plugin-unicorn to v64 (dossier racine) 
- [#15753](https://github.com/1024pix/pix/pull/15753) Update dependency oxfmt to ^0.43.0 (api)

# [5.378.0](https://github.com/1024pix/pix/compare/v5.377.1...v5.378.0) (2026-04-06)

### :rocket: Amélioration

- [#15742](https://github.com/1024pix/pix/pull/15742) : inté embed ref dans RangerFichiersIND 
- [#15674](https://github.com/1024pix/pix/pull/15674) FRI decoupe module phishing IND partie 1 

### :bug: Correction

- [#15741](https://github.com/1024pix/pix/pull/15741) Éviter la double mise en cache de certaines épreuves (PIX-22238) 

### :building_construction: Tech

- [#15716](https://github.com/1024pix/pix/pull/15716) replace ember-dayjs with ember-intl (PIX-22241).

## [5.377.1](https://github.com/1024pix/pix/compare/v5.377.0...v5.377.1) (2026-04-03)

### :building_construction: Tech

- [#15740](https://github.com/1024pix/pix/pull/15740) :card_file_box: Ajoute une colonne `eduV3ExternalJuryResult` à la table `assessment-results` (PIX-22236) 
- [#15735](https://github.com/1024pix/pix/pull/15735) Mise à jour du script de remplissage des nouvelles colonnes de la table "assessment-results" pour gérer le cas des premières certifications V3 non gérées (PIX-22205)

# [5.377.0](https://github.com/1024pix/pix/compare/v5.376.0...v5.377.0) (2026-04-03)

### :rocket: Amélioration

- [#15722](https://github.com/1024pix/pix/pull/15722) Afficher les boutons d'action sur l'onglet Réseau d'une organisation (PIX-22135) 
- [#15718](https://github.com/1024pix/pix/pull/15718) Ajouter un glossaire pour les modules (PIX-21997). 
- [#15727](https://github.com/1024pix/pix/pull/15727) Visio_IND Corrections 

### :bug: Correction

- [#15646](https://github.com/1024pix/pix/pull/15646) Certaines methodes de connexion SSO non visibles dans Pix Admin (PIX-22071) 
- [#15717](https://github.com/1024pix/pix/pull/15717) En Mode Preview, l'instruction des Stepper horizontaux ne s'affiche pas (PIX-22188) 
- [#15728](https://github.com/1024pix/pix/pull/15728) Éviter les problématiques de timezone des dates de PixCertif (PIX-22206). 

### :building_construction: Tech

- [#15705](https://github.com/1024pix/pix/pull/15705) Ajouter une migration sur la colonne campaignParticipationId de la table user-recommended-trainings (PIX-22166) 
- [#15736](https://github.com/1024pix/pix/pull/15736) Rendre la colonne content de combined_course_blueprints nullable (PIX-22212) 

### :arrow_up: Montée de version

- [#15737](https://github.com/1024pix/pix/pull/15737) Update dependency file-type to v22 (api) 
- [#15732](https://github.com/1024pix/pix/pull/15732) Update dependency oxfmt to ^0.42.0 (api) 
- [#15730](https://github.com/1024pix/pix/pull/15730) Update nginx Docker tag to v1.29.7 
- [#15731](https://github.com/1024pix/pix/pull/15731) Update node

# [5.376.0](https://github.com/1024pix/pix/compare/v5.375.0...v5.376.0) (2026-04-02)

### :rocket: Amélioration

- [#15719](https://github.com/1024pix/pix/pull/15719) Ajoute la sélection d'une attestation dans un modèle de Parcours Combiné (PIX-22159). 
- [#15672](https://github.com/1024pix/pix/pull/15672) MDX-138 IAGenPrompt_AVA modification D1 
- [#15724](https://github.com/1024pix/pix/pull/15724) modifs rangerfichiers ind relecture eval,  ia-nr, ajout config 
- [#15713](https://github.com/1024pix/pix/pull/15713) Prometheus : Activer la collecte des metrics par défaut 
- [#15720](https://github.com/1024pix/pix/pull/15720) Récuperer les épreuves pour le fallback de locale (PIX-22176) 
- [#15682](https://github.com/1024pix/pix/pull/15682) Update IAGenFonction_Ava.json 
- [#15714](https://github.com/1024pix/pix/pull/15714) Visio_IND Corrections Relecture interne 

### :building_construction: Tech

- [#15611](https://github.com/1024pix/pix/pull/15611) Accéder facilement à un grain spécifique d'un module (PIX-21992) 
- [#15723](https://github.com/1024pix/pix/pull/15723) Figer la version de la librairie "axios" dans l'API 
- [#15708](https://github.com/1024pix/pix/pull/15708) Rendre la colonne maxReachableLevelOnCertificationDate de la table certification-courses nullable (PIX-22169)  
- [#15709](https://github.com/1024pix/pix/pull/15709) Retirer maxReachableLevelOnCertificationDate du code des certifications V3 (PIX-22170)

# [5.375.0](https://github.com/1024pix/pix/compare/v5.374.0...v5.375.0) (2026-04-01)

### :rocket: Amélioration

- [#15702](https://github.com/1024pix/pix/pull/15702) Améliorer le formulaire de création de campagne pour les parcours apprenants (PIX-22160) 
- [#15704](https://github.com/1024pix/pix/pull/15704) Anonymiser les attributs d'un prescrit lors de son anonymisation (PIX-22012)

# [5.374.0](https://github.com/1024pix/pix/compare/v5.373.1...v5.374.0) (2026-04-01)

### :rocket: Amélioration

- [#15642](https://github.com/1024pix/pix/pull/15642) "Ajouter une adresse e-mail" aux méthodes de connexion pour les utilisateurs uniquement SSO (PIX-21984). 
- [#15692](https://github.com/1024pix/pix/pull/15692) crea-nouveau-module-iagen-ethiquedata 
- [#15700](https://github.com/1024pix/pix/pull/15700) Exclure certaines organisations du questionnaire de satisfaction Combinix 
- [#15676](https://github.com/1024pix/pix/pull/15676) MAJ du rattachement d'organisations à un réseau (PIX-22100). 
- [#15368](https://github.com/1024pix/pix/pull/15368) MDX-16 Retours qualité 
- [#15647](https://github.com/1024pix/pix/pull/15647) Update IADefinition_IND.json - modif coquilles 
- [#15712](https://github.com/1024pix/pix/pull/15712) Update IAGenImpact_AVA.json retours PYO 

### :bug: Correction

- [#15710](https://github.com/1024pix/pix/pull/15710) Ajuster les marges pour les listes des grains recap (PIX-22180) 
- [#15707](https://github.com/1024pix/pix/pull/15707) Éviter de spam la soumission du form de réconciliation (PIX-22172). 
- [#15703](https://github.com/1024pix/pix/pull/15703) Éviter les soumissions multiples dans le form d'entrée en session (PIX-22165). 
- [#15706](https://github.com/1024pix/pix/pull/15706) Supprime une clause distinct très coûteuse en CPU lors de la récupération de contenus recommandés  

### :building_construction: Tech

- [#15691](https://github.com/1024pix/pix/pull/15691) Correction d'un test e2e flaky côté modulix-a11y (PIX-22147) 
- [#15669](https://github.com/1024pix/pix/pull/15669) Utiliser la quête du schéma pour créer un parcours combiné (PIX-22054)

## [5.373.1](https://github.com/1024pix/pix/compare/v5.373.0...v5.373.1) (2026-03-31)

### :building_construction: Tech

- [#15690](https://github.com/1024pix/pix/pull/15690) Retirer le feature toggle "enableTransactionForGetNext" qui permettait d'exécuter le code de "getNextChallenge" dans une transaction BDD

# [5.373.0](https://github.com/1024pix/pix/compare/v5.372.0...v5.373.0) (2026-03-31)

### :rocket: Amélioration

- [#15695](https://github.com/1024pix/pix/pull/15695) Désactiver la locale es sur Pix Orga temporairement (PIX-22121) 
- [#15677](https://github.com/1024pix/pix/pull/15677) Mise à jour du feedback du robot lors de la réalisation d'un challenge (PIX-22053) 
- [#15697](https://github.com/1024pix/pix/pull/15697) Ne pas donner la maille atteinte pour une certif v3 rejetée (PIX-22156). 
- [#15699](https://github.com/1024pix/pix/pull/15699) RepondreMail_IND Corrections Relecture interne 

### :bug: Correction

- [#15694](https://github.com/1024pix/pix/pull/15694) Ne pas remonter les participations d'un parcours supprimé dans les statistiques du parcours (PIX-22139) 
- [#15693](https://github.com/1024pix/pix/pull/15693) Répare un bug sur la réconciliation des organisations à import générique lors de l'accès à un parcours combiné (PIX-22143) 

### :building_construction: Tech

- [#15689](https://github.com/1024pix/pix/pull/15689) Corriger le test e2e flaky sur la gestion des étudiants SUP (PIX-22145) 
- [#15698](https://github.com/1024pix/pix/pull/15698) Déplacer le modèle Frameworks dans le contexte partagé de certification 
- [#15696](https://github.com/1024pix/pix/pull/15696) Retiret le tiret noir au milieu de l'hexagone affiché sur la page des certificats pour les certifications PixPlus (PIX-22157) 
- [#15684](https://github.com/1024pix/pix/pull/15684) Supprime la route dépréciée pour récupérer la liste des certificats d'un utilisateur (PIX-22059)

# [5.372.0](https://github.com/1024pix/pix/compare/v5.371.0...v5.372.0) (2026-03-30)

### :rocket: Amélioration

- [#15637](https://github.com/1024pix/pix/pull/15637) Afficher les tags dans les modules (PIX-22062) (PIX-21920). 
- [#15680](https://github.com/1024pix/pix/pull/15680) Afficher un nouvel onglet Réseau sur la page d'une organisation (PIX-22042) 
- [#15687](https://github.com/1024pix/pix/pull/15687) Ajout POI Combinaisons + gras feedback 
- [#15567](https://github.com/1024pix/pix/pull/15567) Ajoute la prise en compte de pix plus dans l'export CSV de résultat (PIX-21819) 
- [#15559](https://github.com/1024pix/pix/pull/15559) Ajouter la creation d'email lors de la generation de code de verification (PIX-21982) 
- [#15636](https://github.com/1024pix/pix/pull/15636) Ajuster les marges des listes pour les modules (PIX-22070) 
- [#15671](https://github.com/1024pix/pix/pull/15671) Faire fonctionner ChatPix dans les steppers modulix (PIX-22026) 
- [#15639](https://github.com/1024pix/pix/pull/15639) MAJ de la `fct_structure` lors de la création d'un réseau (PIX-22067) 
- [#15630](https://github.com/1024pix/pix/pull/15630) Modification MVP de l'affichage de la page vérificateur sur Pix App (PIX-22074) 
- [#15678](https://github.com/1024pix/pix/pull/15678) Ouvre la publication des certifications de type Pix+ Édu (PIX-21555) 
- [#15626](https://github.com/1024pix/pix/pull/15626) Permettre le tri par classe pour les imports génériques (PIX-22011) 
- [#15654](https://github.com/1024pix/pix/pull/15654) Retirer le bouton de détachement d'organisation fille (PIX-22114) 
- [#15688](https://github.com/1024pix/pix/pull/15688) Ultime relecture MFA NOV 

### :bug: Correction

- [#15673](https://github.com/1024pix/pix/pull/15673) Modifier l'illustration clé pour les grains short-lesson (PIX-22108) 

### :building_construction: Tech

- [#15656](https://github.com/1024pix/pix/pull/15656) Ajouter des seeds pour avoir des réseaux sur plusieurs niveaux (PIX-22041) 
- [#15683](https://github.com/1024pix/pix/pull/15683) Corriger les tests de téléchargement de résultats CSV sur les E2E de certification 
- [#15643](https://github.com/1024pix/pix/pull/15643) Mutualiser le système PubSub du Learning Content 
- [#15598](https://github.com/1024pix/pix/pull/15598) Permettre l'ajout d'informations supplémentaires de corrélation

# [5.371.0](https://github.com/1024pix/pix/compare/v5.370.0...v5.371.0) (2026-03-27)

### :rocket: Amélioration

- [#15670](https://github.com/1024pix/pix/pull/15670) modif-finales-ortho-typo-datacenter-ind

# [5.370.0](https://github.com/1024pix/pix/compare/v5.369.0...v5.370.0) (2026-03-27)

### :rocket: Amélioration

- [#15564](https://github.com/1024pix/pix/pull/15564) Ajouter l'information "canAddEmailConnectionMethod" dans la route /me (PIX-21983) 
- [#15625](https://github.com/1024pix/pix/pull/15625) Ajouter les conditions de validations supplémentaire pour les Import à format (PIX-22009). 
- [#15653](https://github.com/1024pix/pix/pull/15653) CYPhishing_IND Modifs lecons suite modifs design 
- [#15631](https://github.com/1024pix/pix/pull/15631) MDX-32, inte médias NRDatacenter_NOV 
- [#15649](https://github.com/1024pix/pix/pull/15649) modifs repondremail non relecture eval, ia-nr, faisabilité 
- [#15640](https://github.com/1024pix/pix/pull/15640) Rejeter une certification v3 qui n'atteint pas la maille minimum  (PIX-22084). 

### :bug: Correction

- [#15650](https://github.com/1024pix/pix/pull/15650) N'affiche pas les parcours apprenants supprimés dans Pix-Orga et leurs participations dans PixApp. 

### :building_construction: Tech

- [#15658](https://github.com/1024pix/pix/pull/15658) Ajout d'un script pour redéclencher le scoring d'une liste de certifications 
- [#15645](https://github.com/1024pix/pix/pull/15645) Enlever le FT multipleLocalesForTrainingsEnabled de l'API (PIX-22002)(PIX-21691) 
- [#15633](https://github.com/1024pix/pix/pull/15633) migrer les tests d'intégration d'orga  en gjs 

### :arrow_up: Montée de version

- [#15659](https://github.com/1024pix/pix/pull/15659) Update adobe/s3mock Docker tag to v4.12.2 (.circleci) 
- [#15660](https://github.com/1024pix/pix/pull/15660) Update adobe/s3mock Docker tag to v4.12.2 (docker) 
- [#15661](https://github.com/1024pix/pix/pull/15661) Update adobe/s3mock Docker tag to v4.12.2 (dossier racine) 
- [#15663](https://github.com/1024pix/pix/pull/15663) Update dependency ember-eslint-parser to ^0.9.0 (certif) 
- [#15664](https://github.com/1024pix/pix/pull/15664) Update dependency ember-eslint-parser to ^0.9.0 (junior) 
- [#15665](https://github.com/1024pix/pix/pull/15665) Update dependency ember-eslint-parser to ^0.9.0 (mon-pix) 
- [#15666](https://github.com/1024pix/pix/pull/15666) Update dependency ember-eslint-parser to ^0.9.0 (orga) 
- [#15618](https://github.com/1024pix/pix/pull/15618) Update dependency joi to v18 (api) 
- [#15667](https://github.com/1024pix/pix/pull/15667) Update dependency knip to v6 (api) 

### :coffee: Autre

# [5.369.0](https://github.com/1024pix/pix/compare/v5.368.0...v5.369.0) (2026-03-26)

### :rocket: Amélioration

- [#15641](https://github.com/1024pix/pix/pull/15641) Ajout d'un mode readOnly pour les webcomponents de junior (pix-22080) 
- [#15627](https://github.com/1024pix/pix/pull/15627) Ajout du paramètre tag dans les éléments text des modules (PIX-22061). 
- [#15605](https://github.com/1024pix/pix/pull/15605) Création d'une structure lors de la création d'une organisation (PIX-22037). 
- [#15622](https://github.com/1024pix/pix/pull/15622) Enlever l'utilisation de locale et du FT multipleLocalesForTrainingsEnabled dans Admin et PixApp (PIX-22063) 
- [#15634](https://github.com/1024pix/pix/pull/15634) Masquage du bouton de création d'organisation fille (PIX-22040). 
- [#15587](https://github.com/1024pix/pix/pull/15587) Tmp iagenimpac ava new 
- [#15604](https://github.com/1024pix/pix/pull/15604) Update RepondreMail_IND 

### :building_construction: Tech

- [#15623](https://github.com/1024pix/pix/pull/15623) :recycle:Remplace l'utilisation de `lodash` par du JavaScript à la vanille 
- [#15635](https://github.com/1024pix/pix/pull/15635) Ajouter un script pour créer des structures (PIX-22038) 
- [#15620](https://github.com/1024pix/pix/pull/15620) Mise à jour des builders des réseaux, structures, organisations (PIX-22039) 
- [#15617](https://github.com/1024pix/pix/pull/15617) Réduit l'utilisation de Lodash dans le code de certif

# [5.368.0](https://github.com/1024pix/pix/compare/v5.367.0...v5.368.0) (2026-03-25)

### :rocket: Amélioration

- [#15624](https://github.com/1024pix/pix/pull/15624) Ajout médias définitifs CY_MFA_NOV 
- [#15606](https://github.com/1024pix/pix/pull/15606) Ajouter un placeholder dans la liste des formats d'import (PIX-21925) 
- [#15621](https://github.com/1024pix/pix/pull/15621) MDX-18 GenEthique_IND 

### :rewind: Retour en arrière

- [#15607](https://github.com/1024pix/pix/pull/15607) Revert "[TECH] Set saml config"

### :building_construction: Tech

- [#15596](https://github.com/1024pix/pix/pull/15596) Réduire la durée de la transaction dans le endpoint POST /api/answers pour la positionner seulement autour de l'insertion en BDD de la réponse et des KE

# [5.367.0](https://github.com/1024pix/pix/compare/v5.366.0...v5.367.0) (2026-03-24)

### :rocket: Amélioration

- [#15599](https://github.com/1024pix/pix/pull/15599) Afficher un message lorsqu'un contenu est manquant dans les modules (PIX-21813). 
- [#15588](https://github.com/1024pix/pix/pull/15588) Ajout du lien vers le centre d'aide dans le footer de PixOrga (pix-22031) 
- [#15553](https://github.com/1024pix/pix/pull/15553) Gérer les attestations depuis la section features des organisations (PIX-21765) 
- [#15556](https://github.com/1024pix/pix/pull/15556) Mettre à jour le design de la liste des certifications d'un utilisateur (PIX-21928). 
- [#15584](https://github.com/1024pix/pix/pull/15584) module GestionMDP_NOV ajout embed mdp-oublie et correction coquille 
- [#15583](https://github.com/1024pix/pix/pull/15583) Module Phishing_IND modification short video 
- [#15533](https://github.com/1024pix/pix/pull/15533) Pouvoir modifier le nom d'un réseau (PIX-21949) 
- [#15501](https://github.com/1024pix/pix/pull/15501) Redesign du grain de type leçon courte (PIX-21919) 
- [#15603](https://github.com/1024pix/pix/pull/15603) Suivre l'utilisation de la remise à zéro et de l'amélioration des compétences (PIX-21882) 
- [#15544](https://github.com/1024pix/pix/pull/15544) Supprimer l'utilisation de la propriété locale dans le code et la table training en DB (PIX-21791)(PIX-21792) 
- [#15514](https://github.com/1024pix/pix/pull/15514) Update IADefinition_IND.json 
- [#15602](https://github.com/1024pix/pix/pull/15602) Update Visio_IND 

### :bug: Correction

- [#15600](https://github.com/1024pix/pix/pull/15600) Classer les réseaux dans le bon ordre après une création (PIX-22050) 
- [#15597](https://github.com/1024pix/pix/pull/15597) Répare la pagination sur les participations aux parcours combinés (PIX-22034) 
- [#15585](https://github.com/1024pix/pix/pull/15585) Réparer la mise à jour du logo d'une organisation (PIX-21772) 

### :rewind: Retour en arrière

- [#15610](https://github.com/1024pix/pix/pull/15610) Revert "[BUMP] Lock file maintenance (e2e)"

### :building_construction: Tech

- [#15612](https://github.com/1024pix/pix/pull/15612) Lancer les tests e2e cypress lorsque le dossier a été modifié (PIX-FIX). 

### :arrow_up: Montée de version

- [#15575](https://github.com/1024pix/pix/pull/15575) Lock file maintenance (e2e) 
- [#15608](https://github.com/1024pix/pix/pull/15608) Update dependency ember-eslint-parser to ^0.8.0 (certif) 
- [#15613](https://github.com/1024pix/pix/pull/15613) Update dependency ember-eslint-parser to ^0.8.0 (junior) 
- [#15614](https://github.com/1024pix/pix/pull/15614) Update dependency ember-eslint-parser to ^0.8.0 (mon-pix) 
- [#15615](https://github.com/1024pix/pix/pull/15615) Update dependency ember-eslint-parser to ^0.8.0 (orga) 
- [#15616](https://github.com/1024pix/pix/pull/15616) Update dependency oxfmt to ^0.41.0 (api) 
- [#15619](https://github.com/1024pix/pix/pull/15619) Update slackapi/slack-github-action action to v3 (workflows)

# [5.366.0](https://github.com/1024pix/pix/compare/v5.365.0...v5.366.0) (2026-03-23)

### :rocket: Amélioration

- [#15548](https://github.com/1024pix/pix/pull/15548) Ajout d'un formulaire de création d'attestation sur Pix Admin (PIX-21596) 
- [#15577](https://github.com/1024pix/pix/pull/15577) ajout-images 
- [#15592](https://github.com/1024pix/pix/pull/15592) Ajuster le style de la page d'une organisation (PIX-21873) 
- [#15589](https://github.com/1024pix/pix/pull/15589) MDX-138 IAGenPrompt_AVA modification contexte 
- [#15522](https://github.com/1024pix/pix/pull/15522) MDX-57 retours elise NR_Evaluation_IND 
- [#15590](https://github.com/1024pix/pix/pull/15590) Modifs Visio_NOV relectures interne equipe socle 
- [#15586](https://github.com/1024pix/pix/pull/15586) Rediriger vers la page de détails d'un réseau après sa création (PIX-22029). 

### :bug: Correction

- [#15593](https://github.com/1024pix/pix/pull/15593) Les tests E2E de la recette de certification sont rouges car pix-admin est lancé avant d'être installé 

### :building_construction: Tech

- [#15581](https://github.com/1024pix/pix/pull/15581) :package: Mise à jour de paquets pour pix Orga 
- [#15582](https://github.com/1024pix/pix/pull/15582) Corriger un flaky sur PixApp (PIX-YAPA2). 
- [#15580](https://github.com/1024pix/pix/pull/15580) Corriger un test Flaky sur PixAdmin rendant la CI instable (PIX-YAPA). 
- [#15421](https://github.com/1024pix/pix/pull/15421) Permettre de n'executer que le code modifié lors de la validation de la PR (PIX-21907). 
- [#15594](https://github.com/1024pix/pix/pull/15594) Résolution de test flaky sur le test d'intégration du "combined-course-blueprint-repository.js" 
- [#15595](https://github.com/1024pix/pix/pull/15595) Utiliser des identifiants dans le cache de résultats du learning content 

### :coffee: Autre

- [#15591](https://github.com/1024pix/pix/pull/15591) creation Visio-IND

# [5.365.0](https://github.com/1024pix/pix/compare/v5.364.0...v5.365.0) (2026-03-20)

### :rocket: Amélioration

- [#15561](https://github.com/1024pix/pix/pull/15561) Ajouter la feature COVER_RATE dans le formulaire admin (PIX-21765) 
- [#15532](https://github.com/1024pix/pix/pull/15532) Ajouter le paramètre instruction pour les stepper horizontaux (PIX-21921). 

### :bug: Correction

- [#15578](https://github.com/1024pix/pix/pull/15578) Réparer la page de détail des parcours combinés dans Pix Orga 

### :building_construction: Tech

- [#15549](https://github.com/1024pix/pix/pull/15549) Exclure les participations supprimées du script d'attribution des rewards (PIX-22007). 
- [#15555](https://github.com/1024pix/pix/pull/15555) Supprimer les scripts liés à la prescription qui ne sont plus utilisé (Pix-16355). 

### :arrow_up: Montée de version

- [#15576](https://github.com/1024pix/pix/pull/15576) Lock file maintenance (orga)

# [5.364.0](https://github.com/1024pix/pix/compare/v5.363.0...v5.364.0) (2026-03-20)

### :rocket: Amélioration

- [#15566](https://github.com/1024pix/pix/pull/15566) Modif IA cadre enseignants - relecture FTO 

### :building_construction: Tech

- [#15554](https://github.com/1024pix/pix/pull/15554) Répare les seeds des parcours combinés suite aux travaux de DevComp sur les contenus formatifs multilocales (PIX-21980) 

### :arrow_up: Montée de version

- [#15570](https://github.com/1024pix/pix/pull/15570) Lock file maintenance (junior)

# [5.363.0](https://github.com/1024pix/pix/compare/v5.362.0...v5.363.0) (2026-03-20)

### :rocket: Amélioration

- [#15525](https://github.com/1024pix/pix/pull/15525) Remonter le référentiel Pix par défaut dans la sélection de sujet (PIX-21935) 

### :rewind: Retour en arrière

- [#15573](https://github.com/1024pix/pix/pull/15573) Revert "[TECH] Utiliser le SDK PgBoss au lieu de Knex"

### :building_construction: Tech

- [#15534](https://github.com/1024pix/pix/pull/15534) Afficher les éléments ids d'un module lors de l'arrivée sur la preview (PIX-21990) 
- [#15509](https://github.com/1024pix/pix/pull/15509) Ajouter des certifs v2 dans les seeds (PIX-21944). 
- [#15530](https://github.com/1024pix/pix/pull/15530) Suppression des warnings lors du lint dans Admin. 

### :arrow_up: Montée de version

- [#15568](https://github.com/1024pix/pix/pull/15568) Lock file maintenance (audit-logger) 
- [#15572](https://github.com/1024pix/pix/pull/15572) Lock file maintenance (certif) 
- [#15569](https://github.com/1024pix/pix/pull/15569) Lock file maintenance (dossier racine) 
- [#15571](https://github.com/1024pix/pix/pull/15571) Lock file maintenance (load-testing)

# [5.362.0](https://github.com/1024pix/pix/compare/v5.361.0...v5.362.0) (2026-03-20)

### :rocket: Amélioration

- [#15512](https://github.com/1024pix/pix/pull/15512) Affichage du réseau dans le détail d'une organisation (PIX-21341). 
- [#15528](https://github.com/1024pix/pix/pull/15528) Améliorer le formulaire des fonctionnalités dans Pix Admin (PIX-21977) 
- [#15550](https://github.com/1024pix/pix/pull/15550) CYPhishing_AVA modif adresse audio 
- [#15517](https://github.com/1024pix/pix/pull/15517) Recherche des réseaux par nom (PIX-21953). 

### :building_construction: Tech

- [#15545](https://github.com/1024pix/pix/pull/15545) :recycle: Remplace l'utilisation de `lodash.isNill`par `== null` 
- [#15482](https://github.com/1024pix/pix/pull/15482) :recycle: Remplace les appels à la fonction `trim` de `lodash` pour la fonction native dans pixAdmin 
- [#15565](https://github.com/1024pix/pix/pull/15565) Set saml config
- [#15451](https://github.com/1024pix/pix/pull/15451) Utiliser le SDK PgBoss au lieu de Knex 

### :arrow_up: Montée de version

- [#15540](https://github.com/1024pix/pix/pull/15540) Update dependency eslint to v10 (e2e) 
- [#15541](https://github.com/1024pix/pix/pull/15541) Update dependency eslint to v10 (load-testing) 
- [#15546](https://github.com/1024pix/pix/pull/15546) Update dependency eslint-plugin-chai-expect to v4 (api) 
- [#15547](https://github.com/1024pix/pix/pull/15547) Update dependency eslint-plugin-chai-expect to v4 (audit-logger) 
- [#15551](https://github.com/1024pix/pix/pull/15551) Update dependency eslint-plugin-chai-expect to v4 (certif) 
- [#15552](https://github.com/1024pix/pix/pull/15552) Update dependency eslint-plugin-chai-expect to v4 (dossier racine) 
- [#15538](https://github.com/1024pix/pix/pull/15538) Update dependency oxfmt to ^0.39.0 (api) 
- [#15557](https://github.com/1024pix/pix/pull/15557) Update dependency oxfmt to ^0.40.0 (api) 
- [#15562](https://github.com/1024pix/pix/pull/15562) Update dependency stylelint-order to v8 (junior) 
- [#15563](https://github.com/1024pix/pix/pull/15563) Update dependency stylelint-order to v8 (mon-pix)

# [5.361.0](https://github.com/1024pix/pix/compare/v5.360.0...v5.361.0) (2026-03-19)

### :rocket: Amélioration

- [#15527](https://github.com/1024pix/pix/pull/15527) Ajouter la date d'archivage des campagnes dans l'api Maddo (PIX-21881) 
- [#15529](https://github.com/1024pix/pix/pull/15529) Ajouter le feature toggle addEmailConnectionMethodEnabled (PIX-21978) 
- [#15502](https://github.com/1024pix/pix/pull/15502) MDX-138 IAGenPrompt_AVA correctifs ortho/typo 
- [#15531](https://github.com/1024pix/pix/pull/15531) Modifs relecture - RangerFichiersNov 

### :bug: Correction

- [#15487](https://github.com/1024pix/pix/pull/15487) Flaky sur organizations target profiles dans Admin 

### :building_construction: Tech

- [#15526](https://github.com/1024pix/pix/pull/15526) Suppression du script locales (PIX-21942). 

### :arrow_up: Montée de version

- [#15539](https://github.com/1024pix/pix/pull/15539) @1024pix/epreuves-components 4.1.0

# [5.360.0](https://github.com/1024pix/pix/compare/v5.359.0...v5.360.0) (2026-03-18)

### :rocket: Amélioration

- [#15510](https://github.com/1024pix/pix/pull/15510) ajout mention cybermalveillance + picto Antivirus_Ind 
- [#15523](https://github.com/1024pix/pix/pull/15523) Amélioration de diverses traductions NL de Pix App 
- [#15518](https://github.com/1024pix/pix/pull/15518) datacenter-IND-ajout-images 
- [#15511](https://github.com/1024pix/pix/pull/15511) Update NR_Datacenter_AVA.json 

### :bug: Correction

- [#15496](https://github.com/1024pix/pix/pull/15496) Filtrer les tubes sans nom dans le sélecteur de sujets (PIX-21916) 

### :building_construction: Tech

- [#15516](https://github.com/1024pix/pix/pull/15516) :recycle: Reusine le script de remplissage de l'attribut `subscription` des `certification-candidates` pour les souscriptions multiple 
- [#15524](https://github.com/1024pix/pix/pull/15524) Ajouter des logs en cas d'erreurs lors de la création d'un Passage event (PIX-21972) 
- [#15515](https://github.com/1024pix/pix/pull/15515) Corriger la dropdown des élèves dans Orga 
- [#15504](https://github.com/1024pix/pix/pull/15504) Remplissage de la nouvelle colonne "framework" : au moment de la création du test de certification, ainsi que rétro-remplissage par script (PIX-21938) 
- [#15513](https://github.com/1024pix/pix/pull/15513) Utiliser le batchUpdate pour supprimer les campaigns (PIX-21948) 
- [#15507](https://github.com/1024pix/pix/pull/15507) Utiliser le batchUpdate pour supprimer les learners (Pix-21891) 

### :arrow_up: Montée de version

- [#15519](https://github.com/1024pix/pix/pull/15519) Update dependency oxfmt to ^0.37.0 (api)

# [5.359.0](https://github.com/1024pix/pix/compare/v5.358.0...v5.359.0) (2026-03-17)

### :rocket: Amélioration

- [#15500](https://github.com/1024pix/pix/pull/15500) :sparkles: Renseigne la colonne `subscription` dans la table `certification-candidates` (PIX-21917) 
- [#15425](https://github.com/1024pix/pix/pull/15425) Modifier le message d'erreur pour les utilisateurs sco lorsque le compte est bloqué définitivement (PIX-21822) 
- [#15448](https://github.com/1024pix/pix/pull/15448) Permettre de choisir plusieurs langues dans la page de création d'un CF sur Admin (PIX-21786) 

### :building_construction: Tech

- [#15494](https://github.com/1024pix/pix/pull/15494) :package: Mise à jour des lib HAPI et JOI 
- [#15503](https://github.com/1024pix/pix/pull/15503) Ajout d'une colonne "framework" dans la table "certification-courses" pour savoir rapidement quelle certification a été passée (PIX-21937) 
- [#15485](https://github.com/1024pix/pix/pull/15485) Eviter des appels N+1 lors de l'archivage d'une organisation (PIX-21889). 
- [#15481](https://github.com/1024pix/pix/pull/15481) Réécrire l'url en cas d'accès à un module avec un slug personnalisé (PIX-21904)

# [5.358.0](https://github.com/1024pix/pix/compare/v5.357.0...v5.358.0) (2026-03-16)

### :rocket: Amélioration

- [#15490](https://github.com/1024pix/pix/pull/15490) Afficher le détail d'un réseau sur Pix Admin (PIX-21338) 
- [#15472](https://github.com/1024pix/pix/pull/15472) Afficher le nombre de membres d'une équipe d'un centre de certif (PIX-21448). 
- [#15405](https://github.com/1024pix/pix/pull/15405) Ajout POI et embed definitifs sur module Phishing_IND 
- [#15499](https://github.com/1024pix/pix/pull/15499) Ajouter le tracking du téléchargement de la sélection de sujets (PIX-21829) 
- [#15455](https://github.com/1024pix/pix/pull/15455) Débloquer un élève depuis Pix Orga (PIX-21567). 
- [#15422](https://github.com/1024pix/pix/pull/15422) Gérer l'activation de l'import générique pour une orga depuis pix admin (PIX-21784) 
- [#15428](https://github.com/1024pix/pix/pull/15428) MDX-138 IAGenPrompt_AVA passage de chatpix en prod 

### :building_construction: Tech

- [#15437](https://github.com/1024pix/pix/pull/15437) Mettre à jour les récupérations d'un contenu formatif à partir d'une locale (PIX-21789) 
- [#15483](https://github.com/1024pix/pix/pull/15483) Permettre une modification des rewards en batchUpdate (PIX-21890)

# [5.357.0](https://github.com/1024pix/pix/compare/v5.356.0...v5.357.0) (2026-03-16)

### :rocket: Amélioration

- [#15467](https://github.com/1024pix/pix/pull/15467) Ajouter une nouvelle route pour récupérer le détail d'un réseau (PIX-21337)

# [5.356.0](https://github.com/1024pix/pix/compare/v5.355.0...v5.356.0) (2026-03-16)

### :rocket: Amélioration

- [#15445](https://github.com/1024pix/pix/pull/15445) Affichage des réseaux dans Pix-Admin (PIX-21300). 
- [#15484](https://github.com/1024pix/pix/pull/15484) Ajout d'un lien vers le parcours sur l'écran des parcours combinés dans PixOrga (PIX-21252) 
- [#15474](https://github.com/1024pix/pix/pull/15474) Cadre IA nouveau défi 
- [#15489](https://github.com/1024pix/pix/pull/15489) modifs videos images virus nov 
- [#15457](https://github.com/1024pix/pix/pull/15457) Remonter les informations du réseau dans les détails d'une organisation (PIX-21339). 
- [#15430](https://github.com/1024pix/pix/pull/15430) Scripte le rattachement de quêtes aux schémas de parcours combinés (PIX-21894) 

### :bug: Correction

- [#15488](https://github.com/1024pix/pix/pull/15488) Éviter de provoquer des erreurs lors de la collecte de métriques du LearningContentRepository 
- [#15493](https://github.com/1024pix/pix/pull/15493) Ne pas utiliser le bucket dans la route `/statuses` (PIX-21915) 
- [#15464](https://github.com/1024pix/pix/pull/15464) Répare le script de suppression des parcours combinés (PIX-21908) 

### :building_construction: Tech

- [#15415](https://github.com/1024pix/pix/pull/15415) :package: Mise à jour de dépendance Certif 
- [#15486](https://github.com/1024pix/pix/pull/15486) Correction de faux positifs dans les tests. 
- [#15452](https://github.com/1024pix/pix/pull/15452) Simplifier encore la sortie des scripts pour les variables d’environnement du GAR (PIX-21897) 
- [#15384](https://github.com/1024pix/pix/pull/15384) Supprime l'ancienne route de selection des sujets (PIX-21793) 
- [#15470](https://github.com/1024pix/pix/pull/15470) Supprime un script obsolète de calcul des capacités des candidats Pix + (PIX-21884) 
- [#15471](https://github.com/1024pix/pix/pull/15471) Supprimer les campaignParticipationId des assessments en batchUpdate (PIX-21888). 

### :arrow_up: Montée de version

- [#15479](https://github.com/1024pix/pix/pull/15479) Lock file maintenance (audit-logger) 
- [#15480](https://github.com/1024pix/pix/pull/15480) Lock file maintenance (dossier racine) 
- [#15465](https://github.com/1024pix/pix/pull/15465) Update dependency @1024pix/pix-ui to ^60.2.0 (orga) 
- [#15491](https://github.com/1024pix/pix/pull/15491) Update dependency @datadog/datadog-api-client to v1.53.0 (api) 
- [#15478](https://github.com/1024pix/pix/pull/15478) Update dependency @getbrevo/brevo to v5 (api) 
- [#15466](https://github.com/1024pix/pix/pull/15466) Update dependency ember-eslint-parser to ^0.7.0 (admin) 
- [#15473](https://github.com/1024pix/pix/pull/15473) Update dependency ember-eslint-parser to ^0.7.0 (certif) 
- [#15475](https://github.com/1024pix/pix/pull/15475) Update dependency ember-eslint-parser to ^0.7.0 (junior) 
- [#15476](https://github.com/1024pix/pix/pull/15476) Update dependency ember-eslint-parser to ^0.7.0 (mon-pix) 
- [#15477](https://github.com/1024pix/pix/pull/15477) Update dependency ember-eslint-parser to ^0.7.0 (orga) 
- [#15492](https://github.com/1024pix/pix/pull/15492) Update dependency oxfmt to ^0.36.0 (api) 
- [#15495](https://github.com/1024pix/pix/pull/15495) Update node

# [5.355.0](https://github.com/1024pix/pix/compare/v5.354.0...v5.355.0) (2026-03-13)

### :rocket: Amélioration

- [#15443](https://github.com/1024pix/pix/pull/15443) Afficher les champs de personnalisation de fin de campagne pour le mode interro (PIX-19653) 
- [#15424](https://github.com/1024pix/pix/pull/15424) Afficher les locales dans la page de détails d'un contenu formatif (PIX-21785). 
- [#15444](https://github.com/1024pix/pix/pull/15444) Ajouter un bouton de création de réseau sur Pix-Admin (PIX-21305) 
- [#15416](https://github.com/1024pix/pix/pull/15416) Ajouter un script pour copier le contenu de la colonne locale -> locales (PIX-21775) 
- [#15377](https://github.com/1024pix/pix/pull/15377) Créer une route de déblocage d'un élève par un membre de son organisation (PIX-21566). 
- [#15456](https://github.com/1024pix/pix/pull/15456) CYMFA_IND micro modif pour validation 
- [#15411](https://github.com/1024pix/pix/pull/15411) Débloquer aussi les comptes élèves lors de la réinitialisation des mots de passe (PIX-21844) 
- [#15463](https://github.com/1024pix/pix/pull/15463) modifs relecture interne RangerFichiersIND 
- [#15440](https://github.com/1024pix/pix/pull/15440) Module Ia enseignants - medias et relecture 
- [#15369](https://github.com/1024pix/pix/pull/15369) Renseigne la référence à la version et au candidat lié au parcours de certification (PIX-21826) 
- [#15429](https://github.com/1024pix/pix/pull/15429) Trier les attestations PDF par nom de famille et prénom (PIX-21887) 
- [#15410](https://github.com/1024pix/pix/pull/15410) Utiliser la table des annonces pour afficher la bannière SCO (PIX-21861) 
- [#15420](https://github.com/1024pix/pix/pull/15420) Voir l'entrée "réseaux" dans la navbar pix-admin (PIX-21299) 

### :building_construction: Tech

- [#15375](https://github.com/1024pix/pix/pull/15375) Ajoute un script permettant de retro-remplir les nouvelles colonnes des certifications et des candidats (PIX-21825) 
- [#15458](https://github.com/1024pix/pix/pull/15458) Amélioration des metrics du learning content 
- [#15427](https://github.com/1024pix/pix/pull/15427) Améliorer l'accessibilité de l'élément custom (PIX-21794) 
- [#15413](https://github.com/1024pix/pix/pull/15413) Mettre en import absolu les imports relatifs de l'environment 

### :arrow_up: Montée de version

- [#15469](https://github.com/1024pix/pix/pull/15469) Lock file maintenance (api) 
- [#15438](https://github.com/1024pix/pix/pull/15438) Update dependency @1024pix/epreuves-components to ^4.0.2 (mon-pix) 
- [#15439](https://github.com/1024pix/pix/pull/15439) Update dependency @1024pix/eslint-plugin to ^2.1.19 (api) 
- [#15441](https://github.com/1024pix/pix/pull/15441) Update dependency @1024pix/eslint-plugin to ^2.1.19 (audit-logger) 
- [#15442](https://github.com/1024pix/pix/pull/15442) Update dependency @1024pix/eslint-plugin to ^2.1.19 (certif) 
- [#15446](https://github.com/1024pix/pix/pull/15446) Update dependency @1024pix/eslint-plugin to ^2.1.19 (dossier racine) 
- [#15447](https://github.com/1024pix/pix/pull/15447) Update dependency @1024pix/eslint-plugin to ^2.1.19 (e2e-playwright) 
- [#15449](https://github.com/1024pix/pix/pull/15449) Update dependency @1024pix/eslint-plugin to ^2.1.19 (junior) 
- [#15450](https://github.com/1024pix/pix/pull/15450) Update dependency @1024pix/eslint-plugin to ^2.1.19 (mon-pix) 
- [#15453](https://github.com/1024pix/pix/pull/15453) Update dependency @1024pix/eslint-plugin to ^2.1.19 (orga) 
- [#15459](https://github.com/1024pix/pix/pull/15459) Update dependency @1024pix/pix-ui to ^60.2.0 (admin) 
- [#15460](https://github.com/1024pix/pix/pull/15460) Update dependency @1024pix/pix-ui to ^60.2.0 (certif) 
- [#15461](https://github.com/1024pix/pix/pull/15461) Update dependency @1024pix/pix-ui to ^60.2.0 (junior) 
- [#15462](https://github.com/1024pix/pix/pull/15462) Update dependency @1024pix/pix-ui to ^60.2.0 (mon-pix) 
- [#15454](https://github.com/1024pix/pix/pull/15454) Update dependency webpack to v5.105.4 (junior)

# [5.354.0](https://github.com/1024pix/pix/compare/v5.353.0...v5.354.0) (2026-03-12)

### :rocket: Amélioration

- [#15423](https://github.com/1024pix/pix/pull/15423) : modif article CY_Phishing avancé 
- [#15397](https://github.com/1024pix/pix/pull/15397) Créer un nouveau réseau via Pix-Admin (PIX-21296). 

### :arrow_up: Montée de version

- [#15435](https://github.com/1024pix/pix/pull/15435) Update dependency @1024pix/epreuves-components to ^4.0.2 (api) 
- [#15436](https://github.com/1024pix/pix/pull/15436) Update dependency @1024pix/epreuves-components to ^4.0.2 (junior) 
- [#15249](https://github.com/1024pix/pix/pull/15249) Update dependency @ember/optional-features to v3 (admin) 
- [#15432](https://github.com/1024pix/pix/pull/15432) Update dependency ember-data to ~5.8.0 (admin) 
- [#15433](https://github.com/1024pix/pix/pull/15433) Update dependency ember-data to ~5.8.0 (junior)

# [5.353.0](https://github.com/1024pix/pix/compare/v5.352.0...v5.353.0) (2026-03-11)

### :rocket: Amélioration

- [#15398](https://github.com/1024pix/pix/pull/15398) Ajouter une route pour récupérer la liste des réseaux (PIX-21298) 
- [#15385](https://github.com/1024pix/pix/pull/15385) MDX-18 IAGenEthique_NOV correction coquille transfert 

### :building_construction: Tech

- [#15409](https://github.com/1024pix/pix/pull/15409) Crée une Quest lors de la création d'un CombinedCourseBlueprint (PIX-21837). 
- [#15408](https://github.com/1024pix/pix/pull/15408) Rendre le Mutex via Redis plus générique et plus robuste

# [5.352.0](https://github.com/1024pix/pix/compare/v5.351.0...v5.352.0) (2026-03-11)

### :rocket: Amélioration

- [#15393](https://github.com/1024pix/pix/pull/15393) Ajout phrase cybermalveillance sur modules GestionMPD_IND et MDP_NOV 
- [#15394](https://github.com/1024pix/pix/pull/15394) Gérer le contenu de la bannière SCO depuis Pix Admin (PIX-21847) 
- [#15406](https://github.com/1024pix/pix/pull/15406) Renommer le wording du tag A verrouiler sur PixOrga dans les parcours combiné (PXI-20844). 

### :building_construction: Tech

- [#15404](https://github.com/1024pix/pix/pull/15404) Optimiser la récupération des knowledge elements pour la route CSV (PIX-21673) 
- [#15417](https://github.com/1024pix/pix/pull/15417) Télécharger toutes les attestations dans un seul PDF (PIX-21846) 

### :arrow_up: Montée de version

- [#15419](https://github.com/1024pix/pix/pull/15419) Update dependency @1024pix/pix-ui to ^60.1.0 (admin) 
- [#15285](https://github.com/1024pix/pix/pull/15285) Update dependency @1024pix/pix-ui to v60 (orga)

# [5.351.0](https://github.com/1024pix/pix/compare/v5.350.0...v5.351.0) (2026-03-10)

### :rocket: Amélioration

- [#15356](https://github.com/1024pix/pix/pull/15356) Ajouter la colonne "locales" à la table trainings (PIX-21774) 
- [#15383](https://github.com/1024pix/pix/pull/15383) Ajouter le nom des référentiels dans la page de sélection de sujet (PIX-21790) 
- [#15359](https://github.com/1024pix/pix/pull/15359) Bloquer l'accès à une campagne archivée (PIX-21652) 
- [#15376](https://github.com/1024pix/pix/pull/15376) Créer une route pour récupérer les frameworks d'une organisation (PIX-21788) 
- [#15382](https://github.com/1024pix/pix/pull/15382) MDX-138 IAGenPrompt_AVA premiere inte 
- [#15392](https://github.com/1024pix/pix/pull/15392) relectures-expert 
- [#15334](https://github.com/1024pix/pix/pull/15334) Rend l'item courant d'un parcours apprenant plus visible (PIX-21784). 
- [#15380](https://github.com/1024pix/pix/pull/15380) Réparation et amélioration du simulateur de scoring Pix transverse  (PIX-21851) 

### :bug: Correction

- [#15395](https://github.com/1024pix/pix/pull/15395) Corriger la déconnexion SSO OIDC (PIX-21854) 

### :building_construction: Tech

- [#15402](https://github.com/1024pix/pix/pull/15402) :package: Mise à jour des libs autour d'`eslint` 
- [#15399](https://github.com/1024pix/pix/pull/15399) Ajout de nouvelles colonnes avec une méthode "zero-downtime" pour les tables "certification-courses" et "certification-candidates" (PIX-21858) 
- [#15315](https://github.com/1024pix/pix/pull/15315) Harmoniser la sélection de réponses en ne choisissant que la plus ancienne pour une même épreuve dans un même assessment 
- [#15134](https://github.com/1024pix/pix/pull/15134) Refacto du code de get-next-challenge dans un seul usecase 
- [#15396](https://github.com/1024pix/pix/pull/15396) Réparer le test E2E de recette-certif portant sur l'import ODS

# [5.350.0](https://github.com/1024pix/pix/compare/v5.349.1...v5.350.0) (2026-03-09)

### :rocket: Amélioration

- [#15314](https://github.com/1024pix/pix/pull/15314) Update IAGenFonction_Ava.json 
- [#15349](https://github.com/1024pix/pix/pull/15349) Update IAGenPrompt_IND.json 

### :building_construction: Tech

- [#15371](https://github.com/1024pix/pix/pull/15371) Ajouter les snapshots E2E certif edu manquants 

### :arrow_up: Montée de version

- [#15391](https://github.com/1024pix/pix/pull/15391) Lock file maintenance (junior) 
- [#15374](https://github.com/1024pix/pix/pull/15374) Update dependency @1024pix/eslint-plugin to ^2.1.19 (admin) 
- [#15386](https://github.com/1024pix/pix/pull/15386) Update dependency @1024pix/pix-ui to ^60.0.3 (junior) 
- [#15387](https://github.com/1024pix/pix/pull/15387) Update dependency webpack to v5.105.3 (junior)

## [5.349.1](https://github.com/1024pix/pix/compare/v5.349.0...v5.349.1) (2026-03-06)

### :rewind: Retour en arrière

- [#15381](https://github.com/1024pix/pix/pull/15381) Revert "[FEATURE] Ajoute l'identifiant de version et de candidate au parcours de certification (PIX-21824)"

# [5.349.0](https://github.com/1024pix/pix/compare/v5.348.0...v5.349.0) (2026-03-06)

### :rocket: Amélioration

- [#15363](https://github.com/1024pix/pix/pull/15363) Ajoute l'identifiant de version et de candidate au parcours de certification (PIX-21824) 
- [#15344](https://github.com/1024pix/pix/pull/15344) creation RepondreMail-IND 
- [#15348](https://github.com/1024pix/pix/pull/15348) MDX-57 retours eval ind 
- [#15362](https://github.com/1024pix/pix/pull/15362) retour-experts 
- [#15211](https://github.com/1024pix/pix/pull/15211) retours edito modules 1e marche 
- [#15340](https://github.com/1024pix/pix/pull/15340) Update IAGenFonction_NOV.json 

### :bug: Correction

- [#15373](https://github.com/1024pix/pix/pull/15373) Les QCM n'affichent plus les status success/error lorsqu'on envoie sa réponse (PIX-21806). 

### :building_construction: Tech

- [#15308](https://github.com/1024pix/pix/pull/15308)  Ajout d'un script pour générer demo-epreuve-components (PIX-21769) 
- [#15372](https://github.com/1024pix/pix/pull/15372) Éviter un test d'intégration certif flaky 
- [#15364](https://github.com/1024pix/pix/pull/15364) Réduire le volume de donnée récupéré pour générer les attestations (Pix-21758). 

### :arrow_up: Montée de version

- [#15331](https://github.com/1024pix/pix/pull/15331) Update dependency @1024pix/pix-ui to ^60.0.3 (certif)

# [5.348.0](https://github.com/1024pix/pix/compare/v5.347.0...v5.348.0) (2026-03-06)

### :rocket: Amélioration

- [#15365](https://github.com/1024pix/pix/pull/15365) Ajout de la route de création d'un réseau (PIX-21295). 

### :building_construction: Tech

- [#15361](https://github.com/1024pix/pix/pull/15361) :recycle: Réduit l'utilisation de `Lodash` - suppression de `_.compact` 
- [#15342](https://github.com/1024pix/pix/pull/15342) Gérer les URLs dans le service dédié (PIX-21807). 
- [#15354](https://github.com/1024pix/pix/pull/15354) Vérifier l'unicité des shortIds lors des tests des modules (PIX21816) 

### :arrow_up: Montée de version

- [#15367](https://github.com/1024pix/pix/pull/15367) Met à jour les dépendances `stylelint-css-config` (ADMIN).

# [5.347.0](https://github.com/1024pix/pix/compare/v5.346.0...v5.347.0) (2026-03-05)

### :rocket: Amélioration

- [#15190](https://github.com/1024pix/pix/pull/15190) MDX-32 relecture MGO et intégration média 
- [#15337](https://github.com/1024pix/pix/pull/15337) MDX-34 NR_Durabilite_IND retours experts et inte medias 
- [#15330](https://github.com/1024pix/pix/pull/15330) modif-post-relecture-Alice 
- [#15358](https://github.com/1024pix/pix/pull/15358) modifs relecture interne antivirus v2 
- [#15355](https://github.com/1024pix/pix/pull/15355) modifs repondremail nov 
- [#15313](https://github.com/1024pix/pix/pull/15313) Permettre le scoring de certifs Pix+ Edu (PIX-21565). 

### :bug: Correction

- [#15353](https://github.com/1024pix/pix/pull/15353) Permettre le lancement d'un Parcours Combiné pour un utilisateur non connecté (PIX-21802). 

### :building_construction: Tech

- [#15341](https://github.com/1024pix/pix/pull/15341) Ajoute une stratégie d'authentification de routes API qui permet un usage non authentifié tout en validant l'authentification si elle est fournie. 
- [#15280](https://github.com/1024pix/pix/pull/15280) Ecrire un script pour remplir les trois nouvelles colonnes "capacity", "meshIndex" et "versionId" de la table "assessment-results" 
- [#15294](https://github.com/1024pix/pix/pull/15294) Envoie les jobs asynchrones après le succès de la transaction 
- [#15319](https://github.com/1024pix/pix/pull/15319) Retirer la colonne ownerOrganizationId sur la table des profils cibles (PIX-21605).

# [5.346.0](https://github.com/1024pix/pix/compare/v5.345.0...v5.346.0) (2026-03-04)

### :rocket: Amélioration

- [#15311](https://github.com/1024pix/pix/pull/15311) Ajouter les instructions à un element custom interactif dans les modules (PIX-21662)(PIX-21643) 
- [#15259](https://github.com/1024pix/pix/pull/15259) MDX-18 Integration retours edito 
- [#15352](https://github.com/1024pix/pix/pull/15352) modifs CYPhishing_AVA suite relecture edito 

### :bug: Correction

- [#15345](https://github.com/1024pix/pix/pull/15345) Ajouter --env-file-if-exists=.env manquant pour exécution locale du script npm start:job 
- [#15343](https://github.com/1024pix/pix/pull/15343) Corriger la fermeture impossible de la modale de rest de password en masse (PIX-21486). 

### :building_construction: Tech

- [#15327](https://github.com/1024pix/pix/pull/15327) Création des tables `networks`, `structures` et `fct_structures`  (PIX-21291). 
- [#14861](https://github.com/1024pix/pix/pull/14861) Supprimer toutes les références au statut TO_SHARE des participations de campagne (PIX-21135)

# [5.345.0](https://github.com/1024pix/pix/compare/v5.344.0...v5.345.0) (2026-03-03)

### :rocket: Amélioration

- [#15306](https://github.com/1024pix/pix/pull/15306) : Coquilles IA enseignants 
- [#15324](https://github.com/1024pix/pix/pull/15324) : travail sur description poi non créés - RangerfichiersNOV 
- [#15309](https://github.com/1024pix/pix/pull/15309) Afficher qu'il n'y a pas d'invitations en cours (PIX-20524) 
- [#15322](https://github.com/1024pix/pix/pull/15322) Ajout de description dans le schéma Joi de custom-element (PIX-21762) 
- [#15328](https://github.com/1024pix/pix/pull/15328) Ajouter le feature toggle multipleLocalesForTrainingsEnabled (PIX-21773). 
- [#15271](https://github.com/1024pix/pix/pull/15271) datacenter-mini-modif 
- [#15269](https://github.com/1024pix/pix/pull/15269) Ne pas afficher la page d'analyse pour une participation en cours (PIX-21468) 
- [#15130](https://github.com/1024pix/pix/pull/15130) Révoquer les tokens des utilisateurs OIDC lors de la déconnexion (PIX-20688). 
- [#15335](https://github.com/1024pix/pix/pull/15335) travail sur description poi non créés - RangerFichiersIND 
- [#15325](https://github.com/1024pix/pix/pull/15325) Update IADefinition_IND.json 
- [#15323](https://github.com/1024pix/pix/pull/15323) Utiliser un wording cohérent dans la création de parcours combiné (PIX-20325). 

### :building_construction: Tech

- [#15320](https://github.com/1024pix/pix/pull/15320) Mettre à jour la stack des RA et la version de l'addon PG 
- [#15338](https://github.com/1024pix/pix/pull/15338) Mettre à jour le plan de l'addon redis en starter-256 
- [#15318](https://github.com/1024pix/pix/pull/15318) Mutualisation de la logique de vérification d'infos pour une organisation (PIX-20805). 
- [#15326](https://github.com/1024pix/pix/pull/15326) Réparer les seeds certif 
- [#15305](https://github.com/1024pix/pix/pull/15305) Supprimer le paramètre variant tile pour les PixCheckbox de Pix Admin 

### :arrow_up: Montée de version

- [#15321](https://github.com/1024pix/pix/pull/15321) Update dependency @1024pix/pix-ui to ^60.0.3 (admin)

# [5.344.0](https://github.com/1024pix/pix/compare/v5.343.1...v5.344.0) (2026-03-02)

### :rocket: Amélioration

- [#15303](https://github.com/1024pix/pix/pull/15303) Afficher le nb d'orgas qui ont été archivés (PIX-21350) 
- [#15227](https://github.com/1024pix/pix/pull/15227) Ajouter la locale de-AT sur Pix App et Pix Orga (pix-21668) 
- [#15307](https://github.com/1024pix/pix/pull/15307) Retravailler le design du header de la page d'une organisation (PIX-21349) 
- [#15291](https://github.com/1024pix/pix/pull/15291) Supprimer le wording bêta des campagne de type exam (PIX-21659) 

### :bug: Correction

- [#15274](https://github.com/1024pix/pix/pull/15274) Ajouter le feature toggle disabledLocalesInFrontend dans toutes les applications front 

### :building_construction: Tech

- [#15312](https://github.com/1024pix/pix/pull/15312) Amélioration de la performance sur le choix de prochaine épreuve en certification. Éviter de récupérer toute la ressource "certficationCourse" et ses dépendances, inutiles pour le calcul 
- [#15277](https://github.com/1024pix/pix/pull/15277) Fix admin flaky (PIX-21772) 

### :arrow_up: Montée de version

- [#15317](https://github.com/1024pix/pix/pull/15317) Update dependency oxfmt to ^0.34.0 (api)

## [5.343.1](https://github.com/1024pix/pix/compare/v5.343.0...v5.343.1) (2026-02-27)

### :building_construction: Tech

- [#15301](https://github.com/1024pix/pix/pull/15301) Amélioration du nombre de requêtes généré par le usecase process-auto-jury (PIX-21763)

# [5.343.0](https://github.com/1024pix/pix/compare/v5.342.0...v5.343.0) (2026-02-27)

### :rocket: Amélioration

- [#15275](https://github.com/1024pix/pix/pull/15275) Ajouter les nouvelles propriétés pour la consigne des POI côté API (PIX-21661) 
- [#15251](https://github.com/1024pix/pix/pull/15251) Créa V2 module Antitivrus 
- [#15292](https://github.com/1024pix/pix/pull/15292) Ne pas calculer les levelup en mode exam (PIX-21731) 

### :bug: Correction

- [#15304](https://github.com/1024pix/pix/pull/15304) Le scoring ne marche pas quand le candidat a un score de 0 pix (PIX-21760) 

### :building_construction: Tech

- [#15298](https://github.com/1024pix/pix/pull/15298) :broom: Réduit l'utilisation de LODASH ... 
- [#15201](https://github.com/1024pix/pix/pull/15201) Réduit le nombre d'appels SQL généré par le endpoint de finalisation de session - sur la première étape de finalisation (PIX-21693)

# [5.342.0](https://github.com/1024pix/pix/compare/v5.341.0...v5.342.0) (2026-02-27)

### :rocket: Amélioration

- [#15302](https://github.com/1024pix/pix/pull/15302) ajout d'un timeout pour le client pushgateway 
- [#15299](https://github.com/1024pix/pix/pull/15299) modifs relecture interne repondremail nov 
- [#15289](https://github.com/1024pix/pix/pull/15289) Rajouter un wording avant de démarrer une campagne exam (PIX-21707) 
- [#15279](https://github.com/1024pix/pix/pull/15279) Récompense l'utilisateur en fin de parcours combiné (PIX-21720). 
- [#15260](https://github.com/1024pix/pix/pull/15260) Sauvegarder la capacité, l'index de maille et l'id de version lors du scoring (PIX-21698). 

### :bug: Correction

- [#15293](https://github.com/1024pix/pix/pull/15293) Corrige un bug empêchant de créer des parcours combiné avec deux campagnes depuis PixOrga (PIX-21738). 
- [#15290](https://github.com/1024pix/pix/pull/15290) Ne pas arrêter le polling vers le endpoint de supervision de session sur l'espace surveillant lorsque il y a des erreurs sur les appels (PIX-21732) 

### :building_construction: Tech

- [#15296](https://github.com/1024pix/pix/pull/15296) Ajout id d'organisation dans le titre de l'onglet (PIX-21517) 
- [#15185](https://github.com/1024pix/pix/pull/15185) Ajoute des handlers de succès dans la DomainTransaction. 
- [#15228](https://github.com/1024pix/pix/pull/15228) Ajouter une méthode dans le knex-utils pour faire du "batch update" 
- [#15288](https://github.com/1024pix/pix/pull/15288) Avoir la possibilité de désactiver le parsing des types JSON et JSONB dans knex via un flag dans la knex config 
- [#15300](https://github.com/1024pix/pix/pull/15300) Limiter la flakyness des tests de certif E2E 
- [#15268](https://github.com/1024pix/pix/pull/15268) Limiter le nombre de requêtes lors de la modification en masse d'organisation (PIX-201703) 
- [#15204](https://github.com/1024pix/pix/pull/15204) Mettre à jour (déplacer, séparer, corriger) le script api/scripts/make-saml-env.js (PIX-21688) 
- [#15261](https://github.com/1024pix/pix/pull/15261) Réduit le nombre de requêtes SQL généré par les repositories du scope "Certification" (PIX-21725) 

### :arrow_up: Montée de version

- [#15286](https://github.com/1024pix/pix/pull/15286) Update dependency eslint-plugin-cypress to v6 (e2e) 
- [#15297](https://github.com/1024pix/pix/pull/15297) Update dependency oxfmt to ^0.33.0 (api)

# [5.341.0](https://github.com/1024pix/pix/compare/v5.340.0...v5.341.0) (2026-02-26)

### :rocket: Amélioration

- [#15257](https://github.com/1024pix/pix/pull/15257) Interdire l'import de fichier siecle xml avec des caractère non ASCII (PIX-21704) 
- [#15273](https://github.com/1024pix/pix/pull/15273) Tmp iagenfonction ava modif 

### :bug: Correction

- [#15241](https://github.com/1024pix/pix/pull/15241) Corriger la mise à jour de la durée des contenus formatifs dans Pix Admin (PIX-21473) 

### :building_construction: Tech

- [#15255](https://github.com/1024pix/pix/pull/15255) Ajout de l'error.code et error.message dans un log (PIX-21715) 
- [#15244](https://github.com/1024pix/pix/pull/15244) Ajouter une contrainte not-null sur le champ organizationLearnerTypeId de la table organizations (PIX-21334) 
- [#15172](https://github.com/1024pix/pix/pull/15172) Améliorer les performances de la page des parcours apprenants sur PixOrga (PIX-21487) 
- [#15256](https://github.com/1024pix/pix/pull/15256) Factoriser du code de l’oidcAuthenticationServiceRegistry (PIX-21712) 
- [#15272](https://github.com/1024pix/pix/pull/15272) Permettre l'ajout d'une info bulle aux champs de Modulix Editor via la description JOI (PIX-21636). 

### :arrow_up: Montée de version

- [#15283](https://github.com/1024pix/pix/pull/15283) Update dependency @1024pix/pix-ui to v60 (certif) 
- [#15284](https://github.com/1024pix/pix/pull/15284) Update dependency @1024pix/pix-ui to v60 (junior) 
- [#15223](https://github.com/1024pix/pix/pull/15223) Update dependency @getbrevo/brevo to v4 (api)

# [5.340.0](https://github.com/1024pix/pix/compare/v5.339.0...v5.340.0) (2026-02-25)

### :rocket: Amélioration

- [#15258](https://github.com/1024pix/pix/pull/15258) Autoriser des custom-draft stockés dans pix-epreuves-externe (PIX-21705) 

### :bug: Correction

- [#15278](https://github.com/1024pix/pix/pull/15278) Ne pas parser les données de type JSON et JSONB en provenance de datawarehouse

# [5.339.0](https://github.com/1024pix/pix/compare/v5.338.1...v5.339.0) (2026-02-25)

### :rocket: Amélioration

- [#15145](https://github.com/1024pix/pix/pull/15145) Afficher la progression globale en mode exam (PIX-20931) 
- [#15203](https://github.com/1024pix/pix/pull/15203) Ajoute une colonne questId sur combined course blueprint  
- [#15175](https://github.com/1024pix/pix/pull/15175) Empêcher l'accès aux parcours combinés supprimés (PIX-21506) 
- [#15015](https://github.com/1024pix/pix/pull/15015) Images définitives dans le module gestionMDP_NOV 
- [#15226](https://github.com/1024pix/pix/pull/15226) Tracker les clics sur les boutons de campagne depuis un parcours apprenant (PIX-21663) 

### :bug: Correction

- [#15270](https://github.com/1024pix/pix/pull/15270) Ajouter une valeur fallback pour maxReachableLevel de parcoursup 
- [#15229](https://github.com/1024pix/pix/pull/15229) Mettre à jour les liens et l'icône du bandeau SCO (PIX-21630) 

### :building_construction: Tech

- [#15210](https://github.com/1024pix/pix/pull/15210) :broom: Supprime le sous domaine de Certification Complémentaire 
- [#15240](https://github.com/1024pix/pix/pull/15240) Ajout de colonnes dans la table "assessment-results" pour permettre le stockage du scoring des pix plus et faciliter son interprétation (PIX-21697) 
- [#15238](https://github.com/1024pix/pix/pull/15238) Retirer toutes mentions de ownerOrganizationId (PIX-21604) 
- [#15239](https://github.com/1024pix/pix/pull/15239) Suppression du script modify-type-label-passage-event-qab-card-retried (PIX-21638). 

### :arrow_up: Montée de version

- [#15243](https://github.com/1024pix/pix/pull/15243) Update dependency @1024pix/pix-ui to v60 (admin) 
- [#15248](https://github.com/1024pix/pix/pull/15248) Update dependency @datadog/datadog-api-client to v1.52.0 (api) 
- [#15250](https://github.com/1024pix/pix/pull/15250) Update dependency @ember/optional-features to v3 (certif) 
- [#15245](https://github.com/1024pix/pix/pull/15245) Update dependency @ember/optional-features to v3 (junior) 
- [#15246](https://github.com/1024pix/pix/pull/15246) Update dependency @ember/optional-features to v3 (mon-pix) 
- [#15247](https://github.com/1024pix/pix/pull/15247) Update dependency @ember/optional-features to v3 (orga) 
- [#15262](https://github.com/1024pix/pix/pull/15262) Update dependency ember-cli to ~6.11.0 (admin) 
- [#15263](https://github.com/1024pix/pix/pull/15263) Update dependency ember-exam to v10.1.0 (certif) 
- [#15264](https://github.com/1024pix/pix/pull/15264) Update dependency ember-exam to v10.1.0 (junior) 
- [#15265](https://github.com/1024pix/pix/pull/15265) Update dependency ember-exam to v10.1.0 (orga) 
- [#15266](https://github.com/1024pix/pix/pull/15266) Update dependency ember-source to ~6.11.0 (admin) 
- [#15267](https://github.com/1024pix/pix/pull/15267) Update dependency ember-source to ~6.11.0 (junior)

## [5.338.1](https://github.com/1024pix/pix/compare/v5.338.0...v5.338.1) (2026-02-24)

### :bug: Correction

- [#15242](https://github.com/1024pix/pix/pull/15242) Ne pas échouer si la valeur de scoring_configuration est nulle

# [5.338.0](https://github.com/1024pix/pix/compare/v5.337.0...v5.338.0) (2026-02-24)

### :rocket: Amélioration

- [#15194](https://github.com/1024pix/pix/pull/15194) Ajouter la locale "es" sur Pix Orga et dans le locale switcher de Pix App (PIX-21667) 
- [#15195](https://github.com/1024pix/pix/pull/15195) Creation module Visio_NOV 
- [#15200](https://github.com/1024pix/pix/pull/15200) intégration poi mdp nov 
- [#15198](https://github.com/1024pix/pix/pull/15198) MDX-17 Biais_AVA integration retours relecture 
- [#15193](https://github.com/1024pix/pix/pull/15193) modif-relecture-experts 
- [#15208](https://github.com/1024pix/pix/pull/15208) Ne plus mettre zéro crédit par défault lors de la création en masse d'organisations (PIX-21580) 
- [#15184](https://github.com/1024pix/pix/pull/15184) Scripte une modification de nom de parcours combinés (PIX-21504) 

### :building_construction: Tech

- [#15205](https://github.com/1024pix/pix/pull/15205) :broom: Supprimer un serializer qui n'est plus utilisé 
- [#15207](https://github.com/1024pix/pix/pull/15207) Ajout de tests e2e dans la recette certif autour de l'inscription de candidats 
- [#15209](https://github.com/1024pix/pix/pull/15209) Ajouter un fichier .csv manquant pour un test e2e de recette certif 
- [#14908](https://github.com/1024pix/pix/pull/14908) Clarification des variables d'environnement utilisées dans le contexte `llm` (PIX-21177) 
- [#15191](https://github.com/1024pix/pix/pull/15191) Rendre modulaire les différents aspects du scoring (PIX-21671) 

### :arrow_up: Montée de version

- [#15206](https://github.com/1024pix/pix/pull/15206) Update dependency @1024pix/eslint-plugin to ^2.1.18 (admin) 
- [#15212](https://github.com/1024pix/pix/pull/15212) Update dependency @1024pix/eslint-plugin to ^2.1.18 (api) 
- [#15213](https://github.com/1024pix/pix/pull/15213) Update dependency @1024pix/eslint-plugin to ^2.1.18 (audit-logger) 
- [#15214](https://github.com/1024pix/pix/pull/15214) Update dependency @1024pix/eslint-plugin to ^2.1.18 (certif) 
- [#15215](https://github.com/1024pix/pix/pull/15215) Update dependency @1024pix/eslint-plugin to ^2.1.18 (dossier racine) 
- [#15217](https://github.com/1024pix/pix/pull/15217) Update dependency @1024pix/eslint-plugin to ^2.1.18 (junior) 
- [#15218](https://github.com/1024pix/pix/pull/15218) Update dependency @1024pix/eslint-plugin to ^2.1.18 (mon-pix) 
- [#15219](https://github.com/1024pix/pix/pull/15219) Update dependency @1024pix/eslint-plugin to ^2.1.18 (orga) 
- [#15109](https://github.com/1024pix/pix/pull/15109) Update dependency @1024pix/pix-ui to ^58.4.11 (admin) 
- [#15220](https://github.com/1024pix/pix/pull/15220) Update dependency @1024pix/pix-ui to ^58.4.11 (certif) 
- [#15221](https://github.com/1024pix/pix/pull/15221) Update dependency @1024pix/pix-ui to ^58.4.11 (mon-pix) 
- [#15235](https://github.com/1024pix/pix/pull/15235) Update dependency @1024pix/pix-ui to v59 (certif) 
- [#15236](https://github.com/1024pix/pix/pull/15236) Update dependency @1024pix/pix-ui to v59 (junior) 
- [#15231](https://github.com/1024pix/pix/pull/15231) Update dependency eslint-plugin-unicorn to v63 (api) 
- [#15232](https://github.com/1024pix/pix/pull/15232) Update dependency eslint-plugin-unicorn to v63 (audit-logger) 
- [#15233](https://github.com/1024pix/pix/pull/15233) Update dependency eslint-plugin-unicorn to v63 (certif) 
- [#15234](https://github.com/1024pix/pix/pull/15234) Update dependency eslint-plugin-unicorn to v63 (dossier racine) 
- [#15230](https://github.com/1024pix/pix/pull/15230) Update dependency webpack to v5.105.2 (junior) 
- [#15222](https://github.com/1024pix/pix/pull/15222) Update nginx Docker tag to v1.29.5

# [5.337.0](https://github.com/1024pix/pix/compare/v5.336.0...v5.337.0) (2026-02-23)

### :rocket: Amélioration

- [#15146](https://github.com/1024pix/pix/pull/15146) Ajouter l'italien sur Pix App et Pix Orga (PIX-21502) 
- [#15197](https://github.com/1024pix/pix/pull/15197) modifs relecture experts 
- [#15177](https://github.com/1024pix/pix/pull/15177) Rendre le champ organizationLearnerTypeId obligatoire pour la création et MAJ d'organisations (PIX-21332). 
- [#15189](https://github.com/1024pix/pix/pull/15189) Tmp datacenterava - suppr une partie texte à trou 
- [#15187](https://github.com/1024pix/pix/pull/15187) Update IAGenFonction_Ava.json - coquilles 

### :building_construction: Tech

- [#15142](https://github.com/1024pix/pix/pull/15142) Ajouter la propriété headerTemplate lors de la génération du schéma JSON des modules (PIX-21544) 
- [#15196](https://github.com/1024pix/pix/pull/15196) Ajouter minimumAnswersRequiredToValidateACertification dans les seeds certif (PIX-21685). 
- [#14912](https://github.com/1024pix/pix/pull/14912) Historisation du paramètre minimumAnswersRequiredToValidateACertification dans la version de certification (PIX-21280) 
- [#15169](https://github.com/1024pix/pix/pull/15169) Mettre à jour le script api qui remonte les infos modules pour pix-db-replication (PIX-21624) 
- [#15202](https://github.com/1024pix/pix/pull/15202) Permettre un lancement parallélisé + hot reload sur les tests playwright de certification 
- [#15186](https://github.com/1024pix/pix/pull/15186) Retire les pdf d'attestations de la base de code 
- [#15188](https://github.com/1024pix/pix/pull/15188) Suppression du bounded context déprécié "scoring" (PIX-21670) 
- [#15013](https://github.com/1024pix/pix/pull/15013) Versionner la notion de "Niveau maximal atteignable" (PIX-21351) 

### :arrow_up: Montée de version

- [#15192](https://github.com/1024pix/pix/pull/15192) Monté de version d'épreuves-components en v2.9.0

# [5.336.0](https://github.com/1024pix/pix/compare/v5.335.0...v5.336.0) (2026-02-20)

### :rocket: Amélioration

- [#15117](https://github.com/1024pix/pix/pull/15117) : MDX43 - NR_Durabilité_NOV - intégration pour relecture 
- [#15168](https://github.com/1024pix/pix/pull/15168) Ajouter la possibilité d'exporter le PDF d'un PC dans Admin (PIX-21627) 
- [#15174](https://github.com/1024pix/pix/pull/15174) MDX-56 Surequipement, correction ortho-typo 
- [#15176](https://github.com/1024pix/pix/pull/15176) modifs IA-enseignants relecture FRI 
- [#15151](https://github.com/1024pix/pix/pull/15151) Permettre l'affichage des réponses courtes en cas de QCU et QCM sur Pix App (PIX-21288). 
- [#15164](https://github.com/1024pix/pix/pull/15164) Tmp retours genfonction ava 
- [#15170](https://github.com/1024pix/pix/pull/15170) Update NR_Datacenter_AVA.json 

### :bug: Correction

- [#15159](https://github.com/1024pix/pix/pull/15159) Ne pas afficher l'indicateur de focus sur le stepper lorsqu'il n'est pas le premier composant d'un grain (PIX-21232) 

### :building_construction: Tech

- [#15166](https://github.com/1024pix/pix/pull/15166) Ajout le domaine des routes dans les logs 
- [#15161](https://github.com/1024pix/pix/pull/15161) Ajouter un script pour rattacher les ownerOrganizationId au profile cible dans la table dédié (PIX-21603). 
- [#15162](https://github.com/1024pix/pix/pull/15162) Améliorer le script de traduction des fichiers de langues 
- [#15178](https://github.com/1024pix/pix/pull/15178) Réduire le nombre de requêtes SQL générées lors de l'inscription de plusieurs candidats d'un coup (PIX-21620) 
- [#15167](https://github.com/1024pix/pix/pull/15167) Utilise les modèles d'attestation depuis le bucket S3 (PIX-21597).

# [5.335.0](https://github.com/1024pix/pix/compare/v5.334.1...v5.335.0) (2026-02-19)

### :rocket: Amélioration

- [#15173](https://github.com/1024pix/pix/pull/15173) Ajout POI def module CYPhishingAVA 
- [#15158](https://github.com/1024pix/pix/pull/15158) intégration v0 repondremail nov 
- [#15163](https://github.com/1024pix/pix/pull/15163) Pouvoir renseigner le public prescrit lors de la création d'organisation en masse (PIX-21331) 
- [#15165](https://github.com/1024pix/pix/pull/15165) Retours experts CY_MFA_IND 
- [#15121](https://github.com/1024pix/pix/pull/15121) surequipement-modif-relectures 

### :bug: Correction

- [#15157](https://github.com/1024pix/pix/pull/15157)  Réalignement de l'image des carte de mission avant lancement d'une mission (PIX-21602) 
- [#15153](https://github.com/1024pix/pix/pull/15153) Éviter à un candidat en certif de finir dans un état invalide (PIX-21579) 

### :building_construction: Tech

- [#15099](https://github.com/1024pix/pix/pull/15099) :broom: Réduit l'utilisation de la  librairie `lodash` 
- [#15154](https://github.com/1024pix/pix/pull/15154) Utiliser DomainTransaction dans les repo de Shared

## [5.334.1](https://github.com/1024pix/pix/compare/v5.334.0...v5.334.1) (2026-02-18)

### :bug: Correction

- [#15160](https://github.com/1024pix/pix/pull/15160) Ajout d'une condition supplémentaire sur l'upsert de organization_learner_participations 

### :building_construction: Tech

- [#15150](https://github.com/1024pix/pix/pull/15150) Utiliser les domaines transaction dans les repo Team

# [5.334.0](https://github.com/1024pix/pix/compare/v5.333.0...v5.334.0) (2026-02-18)

### :rocket: Amélioration

- [#15123](https://github.com/1024pix/pix/pull/15123) MDX-18 modification transfert 
- [#15152](https://github.com/1024pix/pix/pull/15152) modifs rangerfichiers ind 
- [#15136](https://github.com/1024pix/pix/pull/15136) Permettre l'affichage des réponses courtes en cas de QCU déclaratif ou découverte sur Pix App (PIX-21287). 
- [#15120](https://github.com/1024pix/pix/pull/15120) WIP module IA enseignants 

### :building_construction: Tech

- [#15040](https://github.com/1024pix/pix/pull/15040)  Generaliser le code specifique pour les certifs complementaires autour des candidats de certification (Pix-11341) 
- [#15149](https://github.com/1024pix/pix/pull/15149) Ajoute un script de copie des templates d'attestation vers un bucket S3. 
- [#15143](https://github.com/1024pix/pix/pull/15143) Améliore le lint de Pix Admin. 
- [#15155](https://github.com/1024pix/pix/pull/15155) Ignorer le contenu des modules dans le check de format API (PIX-21599) 
- [#15147](https://github.com/1024pix/pix/pull/15147) Uniformise les tâches CI de lint des fronts. 
- [#15144](https://github.com/1024pix/pix/pull/15144) Utiliser les domaines transaction dans les repo certification 

### :arrow_up: Montée de version

- [#15148](https://github.com/1024pix/pix/pull/15148) Monté de version de epreuve-components en  v2.8.1

# [5.333.0](https://github.com/1024pix/pix/compare/v5.332.0...v5.333.0) (2026-02-17)

### :rocket: Amélioration

- [#15114](https://github.com/1024pix/pix/pull/15114) Afficher l'id des éléments sur la preview d'un module (PIX-21512). 
- [#15138](https://github.com/1024pix/pix/pull/15138) Afficher la progression pour les campagnes de type exam (PIX-21457) 
- [#15137](https://github.com/1024pix/pix/pull/15137) Afficher la progression sur les exports des campagnes de type EXAM (PIX-21458). 
- [#15131](https://github.com/1024pix/pix/pull/15131) Ajout de l'organizationTypeLearnerId lors de la création d'une organisation (PIX-21329). 
- [#15139](https://github.com/1024pix/pix/pull/15139) Ajout du choix obligatoire de public prescrit dans la création d'organisation (PIX-21330). 
- [#15039](https://github.com/1024pix/pix/pull/15039) Create IAGenFonction_Ava.json 
- [#15128](https://github.com/1024pix/pix/pull/15128) Mettre à jour les évènements QAB_CARD_RETRIED de la table passage-events (PIX-21427) 
- [#15127](https://github.com/1024pix/pix/pull/15127) Permettre de supprimer et anonymiser les participations d'un prescrit sur un parcours combiné précis (PIX-21505) 
- [#15065](https://github.com/1024pix/pix/pull/15065) Pouvoir supprimer un parcours combiné et anonymiser ses participations (PIX-21503) 

### :bug: Correction

- [#15079](https://github.com/1024pix/pix/pull/15079) Corriger l'alignement du texte de la consigne sur un QCM (PIX-21401). 
- [#15141](https://github.com/1024pix/pix/pull/15141) Mise à jour des seeds de création d'organisation. 

### :building_construction: Tech

- [#15135](https://github.com/1024pix/pix/pull/15135) :truck: Déplace le modèle `ComplementaryCertification` dans le contexte de configuration 
- [#15125](https://github.com/1024pix/pix/pull/15125) Ajout de test de non regression pour les QCU et QCM image pour Pix Junior (PIX-21540) 
- [#15140](https://github.com/1024pix/pix/pull/15140) Augmente les capacités de l'exécuteur `admin_lint` pour éviter les problèmes mémoire lors de la CI. 
- [#15100](https://github.com/1024pix/pix/pull/15100) Exposer le JSON Schema des modules sur une route API (PIX-21470) 
- [#15133](https://github.com/1024pix/pix/pull/15133) Refactor la durée d'un certif course dans PixAdmin 
- [#15059](https://github.com/1024pix/pix/pull/15059) Suppression des Promise All dans le contexte evaluation (PIX-21452). 
- [#15108](https://github.com/1024pix/pix/pull/15108) Supprimer la route getAnalysis qui n'est plus utilisée en production (Pix-21492).

# [5.332.0](https://github.com/1024pix/pix/compare/v5.331.0...v5.332.0) (2026-02-16)

### :rocket: Amélioration

- [#15122](https://github.com/1024pix/pix/pull/15122) Ajouter une mention mettant en avant la découverte des parcours IA pour le SCO (Pix-21459). 
- [#15126](https://github.com/1024pix/pix/pull/15126) Mettre à jour les liens anglais de doc dans PixCertif (PIX-21509). 
- [#15124](https://github.com/1024pix/pix/pull/15124) Pouvoir modifier le public prescrit d'une organisation lors de la modification en masse (PIX-21327) 
- [#15088](https://github.com/1024pix/pix/pull/15088) Update NR_Datacenter_AVA.json 

### :bug: Correction

- [#15129](https://github.com/1024pix/pix/pull/15129) Ne pas afficher le blur sur une question focus déjà répondue (PIX-18636). 

### :building_construction: Tech

- [#15075](https://github.com/1024pix/pix/pull/15075) :recycle: Remplace l'utilisation de la fonction `cloneDeep` de la librairie ` lodash` 
- [#14983](https://github.com/1024pix/pix/pull/14983) Ajout de tests autos pédagogiques pour mieux comprendre la gestion de la stack trace dans un contexte de promesses 
- [#15118](https://github.com/1024pix/pix/pull/15118) Autoriser la création de profil cible sans organization de reférence (PIX-21525). 
- [#15113](https://github.com/1024pix/pix/pull/15113) Gérer l'utilisation du if/then/otherwise de Joi dans le script to conversion vers json-schema (PIX-21466) 
- [#15031](https://github.com/1024pix/pix/pull/15031) Supprime un index inutile dans la table "certification-center-memberships" sur la colonne "updatedByUserId" 

### :coffee: Autre

- [#15119](https://github.com/1024pix/pix/pull/15119) Mettre à jour les traductions NL (PIX-21508)

# [5.331.0](https://github.com/1024pix/pix/compare/v5.330.0...v5.331.0) (2026-02-13)

### :rocket: Amélioration

- [#15105](https://github.com/1024pix/pix/pull/15105) Déplacer le bouton Réessayer à droite pour les embed (PIX-21429) 

### :bug: Correction

- [#15115](https://github.com/1024pix/pix/pull/15115) Logger et ne plus cacher les erreurs liés au manque d'épreuve de get-next-challenge de certif (PIX-21514).

# [5.330.0](https://github.com/1024pix/pix/compare/v5.329.1...v5.330.0) (2026-02-13)

### :rocket: Amélioration

- [#15089](https://github.com/1024pix/pix/pull/15089) Les textes à trous configurées en inline appliquent le paramètre aux balises autour (PIX-21476). 
- [#15091](https://github.com/1024pix/pix/pull/15091) Mise à jour du public prescrit d'une organisation (PIX-21314). 
- [#15112](https://github.com/1024pix/pix/pull/15112) Pouvoir modifier le public prescrit d'une organisation (PIX-21248) 
- [#15076](https://github.com/1024pix/pix/pull/15076) Rendre la propriété hasShortProposals obligatoire 

### :bug: Correction

- [#15116](https://github.com/1024pix/pix/pull/15116) Correction d'une régression sur les `qcu_image` et `qcm_image` de Pix Junior (PIX-21518) 

### :building_construction: Tech

- [#15041](https://github.com/1024pix/pix/pull/15041) Script de traduction des fichiers de langue via une API de traducteur (PIX-21224) 
- [#15074](https://github.com/1024pix/pix/pull/15074) Utiliser l'attribut isFullWidth dans les pages de création et modification d'orga (PIX-21491) 

### :arrow_up: Montée de version

- [#15106](https://github.com/1024pix/pix/pull/15106) Mise à jour de @1024pix/epreuves-components à 2.8.0 
- [#15110](https://github.com/1024pix/pix/pull/15110) Update dependency @1024pix/pix-ui to ^58.4.11 (junior) 
- [#15111](https://github.com/1024pix/pix/pull/15111) Update dependency @1024pix/pix-ui to ^58.4.11 (orga)

## [5.329.1](https://github.com/1024pix/pix/compare/v5.329.0...v5.329.1) (2026-02-12)

### :bug: Correction

- [#15010](https://github.com/1024pix/pix/pull/15010) Corriger l’affichage des SSO dans certaines conditions (.org, visible false) (PIX-21414) 
- [#15107](https://github.com/1024pix/pix/pull/15107) Corriger la possibilité de reprendre une compétence evaluation (PIX-21501). 

### :building_construction: Tech

- [#15103](https://github.com/1024pix/pix/pull/15103) Réparer un flaky sur Pix Admin

# [5.329.0](https://github.com/1024pix/pix/compare/v5.328.0...v5.329.0) (2026-02-12)

### :rocket: Amélioration

- [#15090](https://github.com/1024pix/pix/pull/15090) Alerter l'utilisateur qui supprime un profil cible attaché à un parcours combiné (PIX-21472). 
- [#15092](https://github.com/1024pix/pix/pull/15092) modifs virus nov relecture marine 
- [#15061](https://github.com/1024pix/pix/pull/15061) Remplir les champs de la page de création d'un contenu formatif lorsqu'il concerne un module sur Pix Admin (PIX-21237) 

### :bug: Correction

- [#15036](https://github.com/1024pix/pix/pull/15036) Corriger la progression dans le téléchargement des csv sur PixOrga (PIX-21433). 

### :building_construction: Tech

- [#15030](https://github.com/1024pix/pix/pull/15030) Supprime un index inutile dans la table "certification-centers" sur la colonne "archivedBy" 
- [#15032](https://github.com/1024pix/pix/pull/15032) Supprime un index inutile dans la table "sessions" sur la colonne "accessCode" 

### :arrow_up: Montée de version

- [#15093](https://github.com/1024pix/pix/pull/15093) Update dependency ember-cli to ~6.10.0 (admin) 
- [#15096](https://github.com/1024pix/pix/pull/15096) Update dependency nodemailer to v8 (api) 
- [#15094](https://github.com/1024pix/pix/pull/15094) Update dependency oxfmt to ^0.28.0 (api) 
- [#15097](https://github.com/1024pix/pix/pull/15097) Update dependency p-queue to v9 (certif) 
- [#15101](https://github.com/1024pix/pix/pull/15101) Update dependency p-queue to v9 (mon-pix) 
- [#15102](https://github.com/1024pix/pix/pull/15102) Update dependency p-queue to v9 (orga) 
- [#15077](https://github.com/1024pix/pix/pull/15077) Update dependency stylelint to v17 (admin) 
- [#15098](https://github.com/1024pix/pix/pull/15098) Update dependency vitest to v4 (audit-logger) 
- [#15095](https://github.com/1024pix/pix/pull/15095) Update dependency webpack to v5.105.0 (junior)

# [5.328.0](https://github.com/1024pix/pix/compare/v5.327.0...v5.328.0) (2026-02-11)

### :rocket: Amélioration

- [#15016](https://github.com/1024pix/pix/pull/15016) ajout IMG définitives CYMDPNOV 
- [#15023](https://github.com/1024pix/pix/pull/15023) Permettre de créer une nouvelle version de tout type de référentiel de certif (PIX-21027). 

### :bug: Correction

- [#15066](https://github.com/1024pix/pix/pull/15066) (Problèmes de la production) Corrections dans le scope Accès de la transactions d’un usecase read-only et de Promise.all (PIX-21455) 
- [#15086](https://github.com/1024pix/pix/pull/15086) Désactive le calcul de `isPartOfCombinedCourse`qui prend beaucoup de ressources. 
- [#15024](https://github.com/1024pix/pix/pull/15024) les textes des feedbacks sans balises <p> ne se colorent pas (PIX-21417). 
- [#15083](https://github.com/1024pix/pix/pull/15083) MDX-112 IAPrompt_NOV : remplacement de l'image du POI par une plus lisible 

### :building_construction: Tech

- [#15053](https://github.com/1024pix/pix/pull/15053) Améliore l'usage du pool de connexions à la BDD via un refacto sur le usecase d'inscription de candidats de certification dans le SCO  
- [#15085](https://github.com/1024pix/pix/pull/15085) Pousser l'erreur dans un objet pour être identifier dans le logger.

# [5.327.0](https://github.com/1024pix/pix/compare/v5.326.0...v5.327.0) (2026-02-11)

### :rocket: Amélioration

- [#15052](https://github.com/1024pix/pix/pull/15052) Ajoute deux colonnes dans la BDD pour la suppression - anonymisation des parcours combinés (PIX-21453) 
- [#14956](https://github.com/1024pix/pix/pull/14956) MDX-32 retour experts NR_Datacenter_NOV 
- [#14998](https://github.com/1024pix/pix/pull/14998) MDX-57 modification avant relectures NR_Evaluation_IND 

### :bug: Correction

- [#15067](https://github.com/1024pix/pix/pull/15067) Garder une connexion knex pour sauvegarder l'état de l'import 

### :building_construction: Tech

- [#14911](https://github.com/1024pix/pix/pull/14911) Ajout de la colonne minimumAnswersRequiredToValidateACertification dans la table certification_versions (PIX-21280) 
- [#14995](https://github.com/1024pix/pix/pull/14995) Ajouter des index sur les tables Passages et PassageEvents (PIX-21364) 
- [#14734](https://github.com/1024pix/pix/pull/14734) Remplace `prettier` par `oxfmt` pour le formattage des fichiers de l'API. 
- [#15060](https://github.com/1024pix/pix/pull/15060) Retire un service peu utile dans le scope /quest 

### :arrow_up: Montée de version

- [#15078](https://github.com/1024pix/pix/pull/15078) Lock file maintenance (audit-logger) 
- [#15070](https://github.com/1024pix/pix/pull/15070) Lock file maintenance (certif) 
- [#15080](https://github.com/1024pix/pix/pull/15080) Lock file maintenance (junior) 
- [#15081](https://github.com/1024pix/pix/pull/15081) Lock file maintenance (mon-pix) 
- [#15082](https://github.com/1024pix/pix/pull/15082) Lock file maintenance (orga)

# [5.326.0](https://github.com/1024pix/pix/compare/v5.325.0...v5.326.0) (2026-02-10)

### :rocket: Amélioration

- [#15001](https://github.com/1024pix/pix/pull/15001) Afficher le nombre d'invitations dans la page d'une organisation (PIX-20832) 
- [#14933](https://github.com/1024pix/pix/pull/14933) Ajouter la propriété hasShortProposals dans le schéma des QCU, QCM et QCU Découverte et QCU Déclaratif (PIX-21284) 
- [#15038](https://github.com/1024pix/pix/pull/15038) Créer une route pour faire remonter la liste de public préscrit (PIX-21247) 
- [#14896](https://github.com/1024pix/pix/pull/14896) Donner la possibilité aux prescripteurs de déployer un parcours combiné dans leur organisation (PIX-21179) 
- [#14979](https://github.com/1024pix/pix/pull/14979) Enregistrer un passage-event quand on clique sur Réessayer ou Réinitialiser (PIX-21197) 
- [#15034](https://github.com/1024pix/pix/pull/15034) Remonter le type de prescrit dans le détail d'une organisation (PIX-21244). 
- [#14947](https://github.com/1024pix/pix/pull/14947) Update NR_Datacenter_AVA.json 

### :bug: Correction

- [#15033](https://github.com/1024pix/pix/pull/15033) Corriger l'affichage de la progression dans PixOrga sur la page Assessement Result (PIX-21430). 
- [#15008](https://github.com/1024pix/pix/pull/15008) Corriger la jauge de progression dans le cadre d'un participation à un campagne (PIX-21388). 
- [#14685](https://github.com/1024pix/pix/pull/14685) Empêcher le scoring des certifications PixPlus (PIX-21041) 
- [#15029](https://github.com/1024pix/pix/pull/15029) Empêcher les bugs de récupération de missions lorsqu'il existe plusieurs assessments commencés pour une même mission 
- [#15035](https://github.com/1024pix/pix/pull/15035) Utiliser la DomainConnection dans tous les repositories `shared`, `school` et `maddo`. 

### :building_construction: Tech

- [#15012](https://github.com/1024pix/pix/pull/15012) Ajout d'une colonne contenant la configuration de scoring sur les tables permettant la remontée Parcoursup du Datamart (PIX-21422) 
- [#14943](https://github.com/1024pix/pix/pull/14943) Ajout de tests Playwright liés au passage du CléA Numérique (PIX-21353) 
- [#14993](https://github.com/1024pix/pix/pull/14993) Correction de balises HTML dans les modules pour les textes à trous (PIX-21233). 
- [#15037](https://github.com/1024pix/pix/pull/15037) Dans les tests E2E, génère la calibration des épreuves pour le passage en certif dans le setup 
- [#15028](https://github.com/1024pix/pix/pull/15028) Utilise la connexion ouverte pour transaction, le cas échéant, dans les repositories des Bounded Contexts de certification 
- [#15018](https://github.com/1024pix/pix/pull/15018) Utiliser la DomainTransaction dans les repositories du domaine Acquisition (PIX-21420). 
- [#15022](https://github.com/1024pix/pix/pull/15022) Utiliser la DomainTransaction dans les repository des Bounded Context Accès (PIX-21408). 

### :arrow_up: Montée de version

- [#15068](https://github.com/1024pix/pix/pull/15068) Lock file maintenance (api) 
- [#15045](https://github.com/1024pix/pix/pull/15045) Lock file maintenance (api) 
- [#15069](https://github.com/1024pix/pix/pull/15069) Lock file maintenance (audit-logger) 
- [#15046](https://github.com/1024pix/pix/pull/15046) Lock file maintenance (audit-logger) 
- [#15054](https://github.com/1024pix/pix/pull/15054) Lock file maintenance (certif) 
- [#15047](https://github.com/1024pix/pix/pull/15047) Lock file maintenance (certif) 
- [#15048](https://github.com/1024pix/pix/pull/15048) Lock file maintenance (dossier racine) 
- [#15071](https://github.com/1024pix/pix/pull/15071) Lock file maintenance (junior) 
- [#15064](https://github.com/1024pix/pix/pull/15064) Lock file maintenance (junior) 
- [#15055](https://github.com/1024pix/pix/pull/15055) Lock file maintenance (junior) 
- [#15056](https://github.com/1024pix/pix/pull/15056) Lock file maintenance (load-testing) 
- [#15072](https://github.com/1024pix/pix/pull/15072) Lock file maintenance (mon-pix) 
- [#15062](https://github.com/1024pix/pix/pull/15062) Lock file maintenance (mon-pix) 
- [#15057](https://github.com/1024pix/pix/pull/15057) Lock file maintenance (mon-pix) 
- [#15073](https://github.com/1024pix/pix/pull/15073) Lock file maintenance (orga) 
- [#15063](https://github.com/1024pix/pix/pull/15063) Lock file maintenance (orga) 
- [#15058](https://github.com/1024pix/pix/pull/15058) Lock file maintenance (orga) 
- [#15004](https://github.com/1024pix/pix/pull/15004) Mise à jour de @1024pix/epreuves-components à 2.7.0 
- [#15005](https://github.com/1024pix/pix/pull/15005) Update dependency @1024pix/pix-ui to ^58.4.9 (admin) 
- [#15002](https://github.com/1024pix/pix/pull/15002) Update dependency @1024pix/pix-ui to ^58.4.9 (certif) 
- [#15042](https://github.com/1024pix/pix/pull/15042) Update dependency @1024pix/pix-ui to ^58.4.9 (junior) 
- [#15043](https://github.com/1024pix/pix/pull/15043) Update dependency @1024pix/pix-ui to ^58.4.9 (mon-pix) 
- [#15044](https://github.com/1024pix/pix/pull/15044) Update dependency @1024pix/pix-ui to ^58.4.9 (orga)

# [5.325.0](https://github.com/1024pix/pix/compare/v5.324.0...v5.325.0) (2026-02-07)

### :rocket: Amélioration

- [#14989](https://github.com/1024pix/pix/pull/14989) Ajouter des seeds pour les organization learner types (PIX-21243) 
- [#14975](https://github.com/1024pix/pix/pull/14975) Changer des textes et labels de bouton sur la mire de connexion Pix Orga (PIX-20585). 

### :bug: Correction

- [#15021](https://github.com/1024pix/pix/pull/15021) Autoriser momentanément la désynchro des passages et des organization-learner-participations 

### :building_construction: Tech

- [#15026](https://github.com/1024pix/pix/pull/15026) Appliquer les modifications des hotfixes 5.317.x sur dev 
- [#15020](https://github.com/1024pix/pix/pull/15020) Mise en place de timeouts divers, à la fois niveau serveur et niveau client BDD, afin de ne pas laisser de l'activité orpheline dans le cas où le client a fermé la connexion 
- [#15017](https://github.com/1024pix/pix/pull/15017) Utiliser la DomainTransaction partout dans quests 
- [#15019](https://github.com/1024pix/pix/pull/15019) Utiliser les DomainTransaction dans les repository de devcomp (PIX-21418)

# [5.324.0](https://github.com/1024pix/pix/compare/v5.323.0...v5.324.0) (2026-02-06)

### :rocket: Amélioration

- [#14961](https://github.com/1024pix/pix/pull/14961) Afficher la nouvelle page d'analyse pour l'analyse d'une participation (PIX-2086) 
- [#14992](https://github.com/1024pix/pix/pull/14992) ajout élément audio dans module CYPhishingAVA 
- [#14966](https://github.com/1024pix/pix/pull/14966) Création d'un onglet de détails sur la page d'une organisation (PIX-21196). 
- [#14907](https://github.com/1024pix/pix/pull/14907) Pouvoir désactiver certaines locales dans les applications Frontend (PIX-19702) 

### :bug: Correction

- [#14942](https://github.com/1024pix/pix/pull/14942) Réparer l'affichage du compteur de nombre de lettres dans le signalement (PIX-21245) 

### :building_construction: Tech

- [#15000](https://github.com/1024pix/pix/pull/15000) Corrige l'épuisement du pool dans le endpoint GET /assessments/{id} et dans l'util "fetchPage" pour récupérer des résultats paginés 
- [#15007](https://github.com/1024pix/pix/pull/15007) Mettre un FT pour activer ou désactiver la transaction autour du usecase de get next challenge 
- [#14999](https://github.com/1024pix/pix/pull/14999) Supprimer l'usage du promise.all dans le scope prescription (PIX-21410) 
- [#14994](https://github.com/1024pix/pix/pull/14994) Utiliser la DomainTransaction dans les repository des Bounded Context Prescription (PIX-21411). 

### :arrow_up: Montée de version

- [#14991](https://github.com/1024pix/pix/pull/14991) Update dependency @1024pix/pix-ui to ^58.4.7 (admin) 
- [#14996](https://github.com/1024pix/pix/pull/14996) Update dependency @1024pix/pix-ui to ^58.4.8 (admin) 
- [#14997](https://github.com/1024pix/pix/pull/14997) Update dependency @1024pix/pix-ui to ^58.4.8 (certif) 
- [#14884](https://github.com/1024pix/pix/pull/14884) Update dependency babel-plugin-ember-template-compilation to v4 (junior)

# [5.323.0](https://github.com/1024pix/pix/compare/v5.322.1...v5.323.0) (2026-02-05)

### :rocket: Amélioration

- [#14986](https://github.com/1024pix/pix/pull/14986) 1ère intégration ranger fichiers ind 
- [#14978](https://github.com/1024pix/pix/pull/14978) modif virus nov retours experts 
- [#14972](https://github.com/1024pix/pix/pull/14972) MVO-coquille-IAGen-Fonc-IND 
- [#14969](https://github.com/1024pix/pix/pull/14969) Ne pas réconcilier un candidat Pix+ sur pix.org (PIX-21361). 
- [#14970](https://github.com/1024pix/pix/pull/14970) WIP module RangerFichiers NOV 

### :bug: Correction

- [#14976](https://github.com/1024pix/pix/pull/14976) Corriger le fonctionnement des filtres générique dans le cas ou l'API ne retourne aucun résultats (PIX-21392). 
- [#14981](https://github.com/1024pix/pix/pull/14981) Corriger une typo sur la banner IA (PIX-21400). 
- [#14980](https://github.com/1024pix/pix/pull/14980) Permettre le rescoring lorsqu'une certification est terminée mais n'a pas d'assessment-result (PIX-21391) 
- [#14987](https://github.com/1024pix/pix/pull/14987) Réparer les seeds certif 

### :building_construction: Tech

- [#14932](https://github.com/1024pix/pix/pull/14932) Ajout de tests E2E sur un des cas d'anonymisation (PIX-21269) 
- [#14988](https://github.com/1024pix/pix/pull/14988) Ajoute l'équipe Data dans le fichier `codeowner` pour leur signaler les changements de base de données 
- [#14985](https://github.com/1024pix/pix/pull/14985) Remplace le groupBy de lodash par le Object.groupBy() natif de JS 
- [#14984](https://github.com/1024pix/pix/pull/14984) Remplacer le hack JSON.parse(JSON.stringify()) par la fonction native structuredClone pour dupliquer un objet 
- [#14962](https://github.com/1024pix/pix/pull/14962) Retirer les équipes qui n'existent plus des code-owners (PIX-21374) 

### :arrow_up: Montée de version

- [#14973](https://github.com/1024pix/pix/pull/14973) Update dependency @1024pix/pix-ui to ^58.4.7 (mon-pix)

## [5.322.1](https://github.com/1024pix/pix/compare/v5.322.0...v5.322.1) (2026-02-04)

### :building_construction: Tech

- [#14977](https://github.com/1024pix/pix/pull/14977) Assurer l'usage d'une seule connexion à la base de données lors de l'usage de la route POST /api/answers.

# [5.322.0](https://github.com/1024pix/pix/compare/v5.321.0...v5.322.0) (2026-02-04)

### :rocket: Amélioration

- [#14958](https://github.com/1024pix/pix/pull/14958) : Modifs module phishing_ind decouverte 2 suite au point avec produit 
- [#14951](https://github.com/1024pix/pix/pull/14951) Affichage du nombre de membres actifs dans la page d'une orga (PIX-20831). 
- [#14952](https://github.com/1024pix/pix/pull/14952) Afficher le nombre de profils cibles sur la page de détail d'une organisation (PIX-20833) 
- [#14927](https://github.com/1024pix/pix/pull/14927) Créer la table "organization_learner_types" (PIX-21213) 
- [#14955](https://github.com/1024pix/pix/pull/14955) MDX-12 Biais avancés, retours avant relecture 
- [#14959](https://github.com/1024pix/pix/pull/14959) MDX-57 changement shortid NR_Evaluation_IND 
- [#14950](https://github.com/1024pix/pix/pull/14950) Rétropédalage 🚴 → contour POI non interactif sans bordure (PIX-21089) 

### :bug: Correction

- [#14954](https://github.com/1024pix/pix/pull/14954) Afficher les données qui proviennent rééllement de la base de donnée (PIX-21368). 
- [#14963](https://github.com/1024pix/pix/pull/14963) Exclure les apprenants desactivé sur la page des activités d'une organisation (PIX-21377). 
- [#14968](https://github.com/1024pix/pix/pull/14968) Supprimer l'effet de clignotement du feedback sur les QCM (PIX-21365) 
- [#14964](https://github.com/1024pix/pix/pull/14964) Utiliser le bon id pour lancer la suppression d'une participation (PIX-21384). 

### :building_construction: Tech

- [#14931](https://github.com/1024pix/pix/pull/14931) Relier la table "organization_learner_type" à la table "organizations" (PIX-21215)  
- [#14974](https://github.com/1024pix/pix/pull/14974) Revert openid client retrier 

### :arrow_up: Montée de version

- [#14971](https://github.com/1024pix/pix/pull/14971) Update dependency @1024pix/pix-ui to ^58.4.6 (mon-pix)

# [5.321.0](https://github.com/1024pix/pix/compare/v5.320.0...v5.321.0) (2026-02-03)

### :rocket: Amélioration

- [#14948](https://github.com/1024pix/pix/pull/14948) Ajouter l'attestation mairie de Paris (PIX-21239)" 
- [#14902](https://github.com/1024pix/pix/pull/14902) Ne pas afficher le formulaire d'inscription si l'utilisateur se connecte sans invitation (PIX-21275) 

### :bug: Correction

- [#14953](https://github.com/1024pix/pix/pull/14953) Fix d'un flaky sur les profils cibles côté Admin 

### :building_construction: Tech

- [#14915](https://github.com/1024pix/pix/pull/14915) Ajout de tests E2E pour couvrir les cas de scoring et rescoring sur de la certification coeur (PIX-21352) 
- [#14949](https://github.com/1024pix/pix/pull/14949) Ajouter une barre de progression dans le script de migration des statuts des participations (PIX-21362) 
- [#14957](https://github.com/1024pix/pix/pull/14957) Ajouter une condition sur l'organisation dans la récupération des parcours combiné (PIX-21369). 
- [#14928](https://github.com/1024pix/pix/pull/14928) Suppression de la table certification-configurations (PIX-19680) 
- [#14960](https://github.com/1024pix/pix/pull/14960) Supprime la condition peu performante sur hasAssessmentParticipations (PIX-21367)

# [5.320.0](https://github.com/1024pix/pix/compare/v5.319.0...v5.320.0) (2026-02-02)

### :rocket: Amélioration

- [#14944](https://github.com/1024pix/pix/pull/14944) Ajouter une Banner pour la campagne IA sur PixOrga (PIX-21344). 
- [#14897](https://github.com/1024pix/pix/pull/14897) IAGenBiais_AVA retours JTE 
- [#14812](https://github.com/1024pix/pix/pull/14812) MDX-57 changement découverte 3 NR_Evaluation_IND 
- [#14934](https://github.com/1024pix/pix/pull/14934) Modification design des feedbacks dans les modules sur Pix App (PIX-21136). 
- [#14930](https://github.com/1024pix/pix/pull/14930) Permettre de voir les apprenants qui n'ont pas encore participé à une campagne en filtrant la liste (PIX-17952) 

### :building_construction: Tech

- [#14926](https://github.com/1024pix/pix/pull/14926)  Retirer les derniers usages de la table certification-configurations (PIX-21326) 
- [#14945](https://github.com/1024pix/pix/pull/14945) supprime la sortie de log dans les tests

# [5.319.0](https://github.com/1024pix/pix/compare/v5.318.0...v5.319.0) (2026-02-02)

### :rocket: Amélioration

- [#14936](https://github.com/1024pix/pix/pull/14936) Amélioration de la gestion d'erreur du formulaire de création de lots de places (PIX-21301). 
- [#14914](https://github.com/1024pix/pix/pull/14914) Augmenter le nombre de retry de 4 à 10 pour les appels réseau en échec de openid-client  (PIX-21302) 
- [#14924](https://github.com/1024pix/pix/pull/14924) IAGenImpact_NOV, modification consigne 
- [#14937](https://github.com/1024pix/pix/pull/14937) mdx-18 Passage au chatpix en prod 
- [#14938](https://github.com/1024pix/pix/pull/14938) Modifier le lien de la banner de certifications (PIX-20819). 

### :building_construction: Tech

- [#14893](https://github.com/1024pix/pix/pull/14893) Ajouter un test e2e Playwright pour a11y de Modulix (PIX-20984) 
- [#14904](https://github.com/1024pix/pix/pull/14904) Ajouter une fixture Playwright pour mettre en place un candidat, inscrit en session de certification, qui passe son test 
- [#14922](https://github.com/1024pix/pix/pull/14922) Modifier le script de suppression d' apprenant pour qu'il soit RGPD compliant (PIX-21324). 
- [#14913](https://github.com/1024pix/pix/pull/14913) Placer la sélection sur le premier élément en erreur dans le formulaire de création d'organisation (PIX-21007) 
- [#14939](https://github.com/1024pix/pix/pull/14939) Résoudre le problème des tests en timeout qui font échouer la CI

# [5.318.0](https://github.com/1024pix/pix/compare/v5.317.1...v5.318.0) (2026-01-30)

### :rocket: Amélioration

- [#14798](https://github.com/1024pix/pix/pull/14798) Ajouter / supprimer une juridiction d'une application cliente (PIX-20818) 
- [#14921](https://github.com/1024pix/pix/pull/14921) Centrer les légendes des éléments images (PIX-21199) 
- [#14906](https://github.com/1024pix/pix/pull/14906) Modifier le wording des champs pour le QROCM (PIX-21200) 

### :bug: Correction

- [#14919](https://github.com/1024pix/pix/pull/14919) Changement de condition pour déclarer reuseExistingApps 

### :building_construction: Tech

- [#14923](https://github.com/1024pix/pix/pull/14923) Mise à jour de liens cassés sur Pix Certif (PIX-21279) 
- [#14900](https://github.com/1024pix/pix/pull/14900) Supprimer le code permettant la désactivation de l'anonymisation (PIX-21282).

## [5.317.1](https://github.com/1024pix/pix/compare/v5.317.0...v5.317.1) (2026-01-29)

### :building_construction: Tech

- [#14920](https://github.com/1024pix/pix/pull/14920) Remettre certaines dependences de l'API

# [5.317.0](https://github.com/1024pix/pix/compare/v5.316.0...v5.317.0) (2026-01-29)

### :rocket: Amélioration

- [#14916](https://github.com/1024pix/pix/pull/14916) MFA_IND_Traitements_Relectures_Internes 
- [#14875](https://github.com/1024pix/pix/pull/14875) Rendre obligatoire le nombre de places pour la création de lots (PIX-21188). 
- [#14901](https://github.com/1024pix/pix/pull/14901) Update NR_Datacenter_AVA.json 

### :bug: Correction

- [#14895](https://github.com/1024pix/pix/pull/14895) Solutions interprétées en markdown à tort (PIX-21172) 

### :building_construction: Tech

- [#14871](https://github.com/1024pix/pix/pull/14871) Ajouter un pre handler sur la route de modification des numéros étudiants (PIX-19093). 
- [#14917](https://github.com/1024pix/pix/pull/14917) Désactive rewardUser au niveau de la réponse à une question 
- [#14903](https://github.com/1024pix/pix/pull/14903) Suppression du script de modification du domaines des badges complémentaires (PIX-21256) 
- [#14873](https://github.com/1024pix/pix/pull/14873) Supprime le controller de la section organisations de la page d'un profil cible. 
- [#14889](https://github.com/1024pix/pix/pull/14889) Utiliser des fichiers .gjs pour le templates sur PixJunior (PIX-21262). 

### :arrow_up: Montée de version

- [#14909](https://github.com/1024pix/pix/pull/14909) Update dependency @1024pix/pix-ui to v57 (certif) 
- [#14910](https://github.com/1024pix/pix/pull/14910) Update dependency @1024pix/pix-ui to v58 (certif)

# [5.316.0](https://github.com/1024pix/pix/compare/v5.315.0...v5.316.0) (2026-01-28)

### :rocket: Amélioration

- [#14876](https://github.com/1024pix/pix/pull/14876) Ajoute les ids des pré-requis de parcours combinés (PIX-21131) 

### :rewind: Retour en arrière

- [#14905](https://github.com/1024pix/pix/pull/14905) Revert "[TECH] Utiliser Pgboss pour insérer les jobs plutôt que knex"

### :building_construction: Tech

- [#14891](https://github.com/1024pix/pix/pull/14891) Remplacer les hbs par du gjs sur PixCertif  (PIX-21261).

# [5.315.0](https://github.com/1024pix/pix/compare/v5.314.1...v5.315.0) (2026-01-28)

### :rocket: Amélioration

- [#14869](https://github.com/1024pix/pix/pull/14869) Afficher un message d'erreur quand l'utilisateur n'a pas de droits Pix Orga (PIX-20977) 
- [#14899](https://github.com/1024pix/pix/pull/14899) ajout illu draft MFA NOV 
- [#14880](https://github.com/1024pix/pix/pull/14880) Ajout images definitives sur module CY_Phishing_IND 
- [#14874](https://github.com/1024pix/pix/pull/14874) Gérer le reset du formulaire selon s'il a pu être transmis ou non à l'API (PIX-21010) 

### :bug: Correction

- [#14892](https://github.com/1024pix/pix/pull/14892) Réparer des tests flakys 

### :building_construction: Tech

- [#14898](https://github.com/1024pix/pix/pull/14898) Permettre de lancer Playwright localement en réutilisant les applis front déjà lancées

## [5.314.1](https://github.com/1024pix/pix/compare/v5.314.0...v5.314.1) (2026-01-27)

### :bug: Correction

- [#14849](https://github.com/1024pix/pix/pull/14849) MDX-170 Comment -> comment + « Faire le pont » 

### :building_construction: Tech

- [#14894](https://github.com/1024pix/pix/pull/14894) :recycle: Créé un index dans la table quests que s'il n'existe pas déjà 

### :arrow_up: Montée de version

- [#14886](https://github.com/1024pix/pix/pull/14886) Update dependency @1024pix/pix-ui to ^58.4.2 (admin) 
- [#14887](https://github.com/1024pix/pix/pull/14887) Update dependency @1024pix/pix-ui to ^58.4.2 (mon-pix) 
- [#14882](https://github.com/1024pix/pix/pull/14882) Update dependency @1024pix/pix-ui to v58 (junior) 
- [#14883](https://github.com/1024pix/pix/pull/14883) Update dependency @1024pix/pix-ui to v58 (orga)

# [5.314.0](https://github.com/1024pix/pix/compare/v5.313.0...v5.314.0) (2026-01-27)

### :rocket: Amélioration

- [#14852](https://github.com/1024pix/pix/pull/14852) Message d’erreur de validation spécifique pour certains embeds (PIX-21154) 
- [#14877](https://github.com/1024pix/pix/pull/14877) Modifs de relecture édito finale sur le module Souris1 

### :bug: Correction

- [#14842](https://github.com/1024pix/pix/pull/14842) MDX-166 d'1m60 + d'1m57 + 'c' en gras 

### :building_construction: Tech

- [#14881](https://github.com/1024pix/pix/pull/14881) :card_file_box: Ajoute un index sur la colonne `rewardId` dans la table `quests` 
- [#14879](https://github.com/1024pix/pix/pull/14879) Suppression du feature toggle isModuleSelectionForTrainingEnabled (PIX-20922)

# [5.313.0](https://github.com/1024pix/pix/compare/v5.312.0...v5.313.0) (2026-01-27)

### :rocket: Amélioration

- [#14847](https://github.com/1024pix/pix/pull/14847) Empêcher l'archivage d'une organisation avec un/des lots de places actifs ou à venir (PIX-20906). 
- [#14867](https://github.com/1024pix/pix/pull/14867) MDX-17 Biais_AVA integration retours relecture 
- [#14769](https://github.com/1024pix/pix/pull/14769) Tmp modif iabotaniste panelint 
- [#14865](https://github.com/1024pix/pix/pull/14865) Update NR_Datacenter_AVA.json - Relectures Nico + équipe cyber 

### :building_construction: Tech

- [#14870](https://github.com/1024pix/pix/pull/14870) Ajout de nouveaux tests Playwright pour la recette certif concernant le déclenchement des scorings (PIX-21242) 
- [#14878](https://github.com/1024pix/pix/pull/14878) Correction d' un test E2E pour la recette de certification 
- [#14872](https://github.com/1024pix/pix/pull/14872) Corriger l'appel au logger (PIX-21421) 
- [#14866](https://github.com/1024pix/pix/pull/14866) Corriger les warnings de résolution de dépendances de PixJunior 

### :arrow_up: Montée de version

- [#14822](https://github.com/1024pix/pix/pull/14822) Update dependency @1024pix/pix-ui to v58 (admin) 
- [#14834](https://github.com/1024pix/pix/pull/14834) Update dependency @1024pix/pix-ui to v58 (mon-pix)

# [5.312.0](https://github.com/1024pix/pix/compare/v5.311.0...v5.312.0) (2026-01-26)

### :rocket: Amélioration

- [#14862](https://github.com/1024pix/pix/pull/14862) Ajouter une metrique plausible pour la transcription d'un élement audio (PIX-21114) 
- [#14864](https://github.com/1024pix/pix/pull/14864) Améliorer le diagnostique et les actions liés aux client_applications 
- [#14773](https://github.com/1024pix/pix/pull/14773) Empêcher la possibilité d'ajouter un lot de places si la fonctionnalité "places" n'est pas activée sur une orga (PIX-20907) 
- [#14793](https://github.com/1024pix/pix/pull/14793) Faire du retry des appels réseau en échec de openid-client (PIX-20978) 
- [#14868](https://github.com/1024pix/pix/pull/14868) Modifs qualité clavier2 
- [#14821](https://github.com/1024pix/pix/pull/14821) Permettre de faire évoluer le fichier d'import des apprenants en conservant l'historique (PIX-20989). 
- [#14808](https://github.com/1024pix/pix/pull/14808) Rendre le champ date d'expiration obligatoire dans les lots de places (PIX-20905). 
- [#14856](https://github.com/1024pix/pix/pull/14856) Update IAGenBiais_IND.json 

### :building_construction: Tech

- [#14860](https://github.com/1024pix/pix/pull/14860) Ajout d'un raccourci pour installer facilement le package pix-epreuves-components là où c'est nécessaire 
- [#14851](https://github.com/1024pix/pix/pull/14851) Ajouter les traces d'apprentissages sur l'élément audio (PIX-21112) 
- [#14857](https://github.com/1024pix/pix/pull/14857) Ajouter un script pour calculer les capacités des certifications Pix+ v3 (PIX-21162). 
- [#14858](https://github.com/1024pix/pix/pull/14858) Corriger les warnings de résolution de dépendances de PixCertif 
- [#14839](https://github.com/1024pix/pix/pull/14839) Créer un script pour modifier le statut des participations de campagne à partager (PIX-21134) 
- [#14863](https://github.com/1024pix/pix/pull/14863) Retirer la présence de la notion de "superviseur" partout dans le code de certification (PIX-21211) 
- [#14859](https://github.com/1024pix/pix/pull/14859) Utiliser des sous requêtes plutôt que des résultats de requêtes précedente (PIX-21212). 
- [#14771](https://github.com/1024pix/pix/pull/14771) Utiliser Pgboss pour insérer les jobs plutôt que knex

# [5.311.0](https://github.com/1024pix/pix/compare/v5.310.0...v5.311.0) (2026-01-23)

### :rocket: Amélioration

- [#14843](https://github.com/1024pix/pix/pull/14843) MDX-11 IAGenImpact_NOV intégration retours JRO 
- [#14759](https://github.com/1024pix/pix/pull/14759) Modifs qualite module souris1 
- [#14853](https://github.com/1024pix/pix/pull/14853) Modifs qualité souris2 
- [#14785](https://github.com/1024pix/pix/pull/14785) Remonter le pourcentage d'acquisition des badges des participations aux campagnes sur Maddo (PIX-20799) 

### :building_construction: Tech

- [#14855](https://github.com/1024pix/pix/pull/14855) Corriger les seeds lors du deploiement de la RA API 
- [#14848](https://github.com/1024pix/pix/pull/14848) Corriger les warnings de résolution de dépendances de PixApp 
- [#14835](https://github.com/1024pix/pix/pull/14835) Corriger les warnings de résolution de dépendances de PixOrga

# [5.310.0](https://github.com/1024pix/pix/compare/v5.309.0...v5.310.0) (2026-01-22)

### :rocket: Amélioration

- [#14813](https://github.com/1024pix/pix/pull/14813) Ajout de l'élément Audio pour Modulix coté front (PIX-21110) 
- [#14707](https://github.com/1024pix/pix/pull/14707) Ajuster les tailles de textes et les marges sur les modules (PIX-21076) 
- [#14807](https://github.com/1024pix/pix/pull/14807) Le champ transcription de short-video devient facultatif (PIX-21139) 
- [#14818](https://github.com/1024pix/pix/pull/14818) MDX-11 #IAGen_Impact_NOV Changer "finlandais" en "suédois" dans qcu-stepper découverte 
- [#14824](https://github.com/1024pix/pix/pull/14824) MDX-13 IADefinition_NOV intégration relecture JRO 
- [#14696](https://github.com/1024pix/pix/pull/14696) MDX-18 modifications suite panels 
- [#14846](https://github.com/1024pix/pix/pull/14846) MDX-32 modification NR_Datacenter_NOV changement de virgule 
- [#14838](https://github.com/1024pix/pix/pull/14838) Module CY MFA NOV - relectures 1 
- [#14816](https://github.com/1024pix/pix/pull/14816) Supprimer les valeurs par défaut pour les inputs et les selects des QROCM (PIX-21150) 
- [#14836](https://github.com/1024pix/pix/pull/14836) Tmp iagenpromtind relecture jro 
- [#14811](https://github.com/1024pix/pix/pull/14811) Tmp suppr modules alt newconfig 
- [#14841](https://github.com/1024pix/pix/pull/14841) Update description IAGenBiais_IND.json 
- [#14840](https://github.com/1024pix/pix/pull/14840) Update IAGenFonction_NOV.json 
- [#14810](https://github.com/1024pix/pix/pull/14810) Update IAGenFonction_NOV.json - bandeau beta off 
- [#14844](https://github.com/1024pix/pix/pull/14844) Update IAGenPrompt_IND.json - coquille 

### :bug: Correction

- [#14845](https://github.com/1024pix/pix/pull/14845) MDX-164 ia gen prompt nov retours jro 
- [#14837](https://github.com/1024pix/pix/pull/14837) MDX-167 #IAInfox_NOV Retours JRO 

### :building_construction: Tech

- [#14748](https://github.com/1024pix/pix/pull/14748) Déplace la logique de filtres de la page organisations des profil cibles vers le composant 
- [#14817](https://github.com/1024pix/pix/pull/14817) Éviter de les rééssais de toute la suite de test de l'API en cas d'erreur 
- [#14823](https://github.com/1024pix/pix/pull/14823) Mettre à jour les snapshots des tests E2E suite aux changements effectués sur Nina 
- [#14794](https://github.com/1024pix/pix/pull/14794) Review App pour tester la création en masse de parcours combiné (PIX-21093). 
- [#14765](https://github.com/1024pix/pix/pull/14765) Séparer la gestion des autorisations de celle de l'authentification (PIX-21128) 

### :arrow_up: Montée de version

- [#14820](https://github.com/1024pix/pix/pull/14820) @1024pix/epreuves-components 2.6.0 
- [#14826](https://github.com/1024pix/pix/pull/14826) Lock file maintenance (api) 
- [#14827](https://github.com/1024pix/pix/pull/14827) Lock file maintenance (audit-logger) 
- [#14819](https://github.com/1024pix/pix/pull/14819) Update dependency @1024pix/pix-ui to ^57.3.0 (admin) 

### :coffee: Autre

# [5.309.0](https://github.com/1024pix/pix/compare/v5.308.1...v5.309.0) (2026-01-21)

### :rocket: Amélioration

- [#14784](https://github.com/1024pix/pix/pull/14784) Créer un élément Audio pour Modulix dans l'API (PIX-20534) 
- [#14764](https://github.com/1024pix/pix/pull/14764) MDX-32 modification consigne datacenter_nov 
- [#14809](https://github.com/1024pix/pix/pull/14809) Update IAGenBiais_NOV.json - bandeau beta off 

### :building_construction: Tech

- [#14701](https://github.com/1024pix/pix/pull/14701) Ajout de tests Playwright non intégrés dans la pipeline CI/CD pour de la recette certification (PIX-21047) 
- [#14814](https://github.com/1024pix/pix/pull/14814) Ajouter du log sur le script des anonymisation des participations supprimées (PIX-21167). 
- [#14772](https://github.com/1024pix/pix/pull/14772) Ne pas avoir des équipes en charge en double dans les seeds (PIX-20803) 
- [#14770](https://github.com/1024pix/pix/pull/14770) Supprimer la variable d'env LATEST_CERTIFICATION_CALIBRATION_DATE (PIX-20642). 

### :arrow_up: Montée de version

- [#14795](https://github.com/1024pix/pix/pull/14795) Update dependency @1024pix/pix-ui to v57 (admin)

## [5.308.1](https://github.com/1024pix/pix/compare/v5.308.0...v5.308.1) (2026-01-20)

### :bug: Correction

- [#14806](https://github.com/1024pix/pix/pull/14806) Impossible de retenter une compétence (PIX-21157)

# [5.308.0](https://github.com/1024pix/pix/compare/v5.307.0...v5.308.0) (2026-01-20)

### :rocket: Amélioration

- [#14767](https://github.com/1024pix/pix/pull/14767) Editer l'ordre des types de grain dans le schema d'un module (PIX-21069) 
- [#14700](https://github.com/1024pix/pix/pull/14700) MDX-57 integration NR_Evaluation_IND 
- [#14723](https://github.com/1024pix/pix/pull/14723) Supprimer les mécaniques d'envoi sur le front (PIX-20951)  
- [#14791](https://github.com/1024pix/pix/pull/14791) Update IAGenPrompt_IND.json 

### :bug: Correction

- [#14790](https://github.com/1024pix/pix/pull/14790) Metrics learning content : Incrémenter le compteur de lecture type "find" 

### :building_construction: Tech

- [#14762](https://github.com/1024pix/pix/pull/14762) Autoriser le champs ownerOrganizationId à devenir nullable (PIX-21130). 
- [#14783](https://github.com/1024pix/pix/pull/14783) Mise à jour de ember-testing-library 
- [#14766](https://github.com/1024pix/pix/pull/14766) Supprimer le feature toggle isModulixIssueReportDisplayed (PIX-21067) 

### :arrow_up: Montée de version

- [#14805](https://github.com/1024pix/pix/pull/14805) Lock file maintenance (dossier racine) 
- [#14801](https://github.com/1024pix/pix/pull/14801) Lock file maintenance (e2e-playwright) 
- [#14797](https://github.com/1024pix/pix/pull/14797) Lock file maintenance (load-testing) 
- [#14774](https://github.com/1024pix/pix/pull/14774) Update dependency @1024pix/eslint-plugin to ^2.1.17 (admin) 
- [#14775](https://github.com/1024pix/pix/pull/14775) Update dependency @1024pix/eslint-plugin to ^2.1.17 (api) 
- [#14776](https://github.com/1024pix/pix/pull/14776) Update dependency @1024pix/eslint-plugin to ^2.1.17 (audit-logger) 
- [#14777](https://github.com/1024pix/pix/pull/14777) Update dependency @1024pix/eslint-plugin to ^2.1.17 (certif) 
- [#14778](https://github.com/1024pix/pix/pull/14778) Update dependency @1024pix/eslint-plugin to ^2.1.17 (dossier racine) 
- [#14779](https://github.com/1024pix/pix/pull/14779) Update dependency @1024pix/eslint-plugin to ^2.1.17 (e2e-playwright) 
- [#14780](https://github.com/1024pix/pix/pull/14780) Update dependency @1024pix/eslint-plugin to ^2.1.17 (junior) 
- [#14781](https://github.com/1024pix/pix/pull/14781) Update dependency @1024pix/eslint-plugin to ^2.1.17 (mon-pix) 
- [#14782](https://github.com/1024pix/pix/pull/14782) Update dependency @1024pix/eslint-plugin to ^2.1.17 (orga) 
- [#14737](https://github.com/1024pix/pix/pull/14737) Update dependency @1024pix/pix-ui to v56 (certif) 
- [#14786](https://github.com/1024pix/pix/pull/14786) Update dependency globals to v17 (admin) 
- [#14787](https://github.com/1024pix/pix/pull/14787) Update dependency globals to v17 (audit-logger) 
- [#14788](https://github.com/1024pix/pix/pull/14788) Update dependency globals to v17 (certif) 
- [#14789](https://github.com/1024pix/pix/pull/14789) Update dependency globals to v17 (e2e-playwright) 
- [#14802](https://github.com/1024pix/pix/pull/14802) Update dependency globals to v17 (junior) 
- [#14803](https://github.com/1024pix/pix/pull/14803) Update dependency globals to v17 (mon-pix) 
- [#14804](https://github.com/1024pix/pix/pull/14804) Update dependency globals to v17 (orga)

# [5.307.0](https://github.com/1024pix/pix/compare/v5.306.0...v5.307.0) (2026-01-19)

### :rocket: Amélioration

- [#14761](https://github.com/1024pix/pix/pull/14761) coquilles-transcript-IAGen_Fonction_IND 
- [#14739](https://github.com/1024pix/pix/pull/14739) CY_GestionMDP_NOV Modifs suite à relecture finale Marine 
- [#14757](https://github.com/1024pix/pix/pull/14757) mdx-11 retrait bandeau beta 
- [#14730](https://github.com/1024pix/pix/pull/14730) Modification de la page d'inscription via SSO (PIX-21012) 
- [#14747](https://github.com/1024pix/pix/pull/14747) modifs-relecture-datacenter-ind 
- [#14742](https://github.com/1024pix/pix/pull/14742) Recevoir les réponses vides des embeds (PIX-21115) 
- [#14744](https://github.com/1024pix/pix/pull/14744) Renommer la fonctionnalité "Afficher la page places" (PIX-20908) 
- [#14756](https://github.com/1024pix/pix/pull/14756) retrait-bandeau-beta-IA-Definition_NOV 
- [#14758](https://github.com/1024pix/pix/pull/14758) retrait-bandeau-deepfake 
- [#14755](https://github.com/1024pix/pix/pull/14755) surequipement-v2 
- [#14753](https://github.com/1024pix/pix/pull/14753) Update IAGenPrompt_IND.json 
- [#14763](https://github.com/1024pix/pix/pull/14763) Update IAGenPrompt_NOV.json - nouvelle config 

### :bug: Correction

- [#14760](https://github.com/1024pix/pix/pull/14760) Corriger les liens cassés vers le doc "Interprétation des résultats" (PIX-21129). 
- [#14743](https://github.com/1024pix/pix/pull/14743) Réparer les QROCM des modules qui renseignent du valeur par défaut (PIX-21079). 

### :building_construction: Tech

- [#14684](https://github.com/1024pix/pix/pull/14684) Ajout de metrics pour le cache LCMS (PIX-21118) 
- [#14740](https://github.com/1024pix/pix/pull/14740) Création d'un script pour la modification des urls des badges de complémentaire pour qu'ils pointent sur assets (PIX-21109). 
- [#14725](https://github.com/1024pix/pix/pull/14725) Créer test e2e d'accessibilité d'un module, avec playwright (PIX-20984) 
- [#14741](https://github.com/1024pix/pix/pull/14741) Rechercher un centre de certif sans tenir compte des accents ET des caractères spéciaux (PIX-20416) 
- [#14745](https://github.com/1024pix/pix/pull/14745) Réparer la fin d'exécution de redis au refresh cache 
- [#14768](https://github.com/1024pix/pix/pull/14768) Revert Créer test e2e d'accessibilité d'un module, avec playwright (PIX-20984)

# [5.306.0](https://github.com/1024pix/pix/compare/v5.305.0...v5.306.0) (2026-01-16)

### :rocket: Amélioration

- [#14698](https://github.com/1024pix/pix/pull/14698) Affichage des infos de places dans Pix-Admin (PIX-21033). 
- [#14715](https://github.com/1024pix/pix/pull/14715) ajout-media-durabilite-ava 
- [#14735](https://github.com/1024pix/pix/pull/14735) Détacher une organization d'un schéma de parcours combiné (PIX-21094) 
- [#14754](https://github.com/1024pix/pix/pull/14754) IAGen_fonc_IND_modifs_relecture 
- [#14714](https://github.com/1024pix/pix/pull/14714) MDX-32 modification Decouverte 2 NR_Datacenter_NOV 
- [#14726](https://github.com/1024pix/pix/pull/14726) retours jennifer relecture 1 
- [#14749](https://github.com/1024pix/pix/pull/14749) Tmp datacenter ava ajout 

### :bug: Correction

- [#14751](https://github.com/1024pix/pix/pull/14751) Erreur 500 au (re)démarrage d’une compétence (PIX-21127) 

### :building_construction: Tech

- [#14729](https://github.com/1024pix/pix/pull/14729) Ajouter le champ `requestId` dans la table `chat_messages` (PIX-20362) 
- [#14750](https://github.com/1024pix/pix/pull/14750) Améliorer l'autocomplétion des usecases 
- [#14738](https://github.com/1024pix/pix/pull/14738) Masquer certains modules qui ont le même titre (PIX-21113) 
- [#14711](https://github.com/1024pix/pix/pull/14711) Mettre à jour PixOrga pour utiliser le PixSegmentControl (PIX-21103). 
- [#14732](https://github.com/1024pix/pix/pull/14732) Nettoyer la config eslint de l'API 
- [#14746](https://github.com/1024pix/pix/pull/14746) Permettre la consultation des profils cibles quand Maddo n'est pas en route. 

### :coffee: Autre

- [#14708](https://github.com/1024pix/pix/pull/14708) Modifier le style du bloc d'invitation (PIX-21013)

# [5.305.0](https://github.com/1024pix/pix/compare/v5.304.0...v5.305.0) (2026-01-15)

### :rocket: Amélioration

- [#14731](https://github.com/1024pix/pix/pull/14731) : Coquille Module CY MDP_Nov 
- [#14733](https://github.com/1024pix/pix/pull/14733) : Module GestionMDP IND retrait img iencli 
- [#14693](https://github.com/1024pix/pix/pull/14693) Afficher la liste des organisations pour lesquelles un schéma de parcours combiné est à disposition (PIX-20996) 
- [#14336](https://github.com/1024pix/pix/pull/14336) Create #NR_Datacenter_AVA 
- [#14688](https://github.com/1024pix/pix/pull/14688) Récupérer les statistiques de places côté Admin (PIX-21032). 

### :bug: Correction

- [#14520](https://github.com/1024pix/pix/pull/14520) Autoriser le rôle métier à accéder à la page de détails d'une certification (PIX-20949). 
- [#14727](https://github.com/1024pix/pix/pull/14727) La rétrocompatibilité de la migration du statut endedBySupervisor vers endedByInvigilator n'était pas complète (PIX-21096) 

### :building_construction: Tech

- [#14717](https://github.com/1024pix/pix/pull/14717) Ajouter les codeowners pour les dossiers de seeds 
- [#14716](https://github.com/1024pix/pix/pull/14716) Corriger le filtre équipe dans la liste des orga d'un profil cible (PIX-21082) 
- [#14676](https://github.com/1024pix/pix/pull/14676) Gérer les invitations Pix Orga via un service (PIX-21065) 
- [#14702](https://github.com/1024pix/pix/pull/14702) Partager automatiquement les résultats de campagne à la fin de l'évaluation (PIX-20952) 
- [#14720](https://github.com/1024pix/pix/pull/14720) Remplacer depcheck par knip  
- [#14724](https://github.com/1024pix/pix/pull/14724) Revoir l'utilisation de schemalint dans la CI 

### :arrow_up: Montée de version

- [#14721](https://github.com/1024pix/pix/pull/14721) Update dependency ember-source to ~6.10.0 (admin) 
- [#14736](https://github.com/1024pix/pix/pull/14736) Update dependency ember-source to ~6.10.0 (junior)

# [5.304.0](https://github.com/1024pix/pix/compare/v5.303.0...v5.304.0) (2026-01-14)

### :rocket: Amélioration

- [#14722](https://github.com/1024pix/pix/pull/14722) Ajouter des ids de profils cibles dans le tableau du script de rattrapage (PIX-21091) 
- [#14674](https://github.com/1024pix/pix/pull/14674) Create IAGenPrompt_IND_altconfig.json pour tester nouvelles configs et activité de transfert 
- [#14682](https://github.com/1024pix/pix/pull/14682) modif-IAGenFonction_IND 

### :bug: Correction

- [#14719](https://github.com/1024pix/pix/pull/14719) Les vidéos courtes ne se lancent pas en preview 🔮 (PIX-20985) 

### :building_construction: Tech

- [#14709](https://github.com/1024pix/pix/pull/14709) Mettre à jour les seeds des contenus formatifs (PIX-21051). 
- [#14705](https://github.com/1024pix/pix/pull/14705) Mise à jour du wording du bandeau d'information d'envoi automatique des résultats (PIX-20964) 
- [#14704](https://github.com/1024pix/pix/pull/14704) Modifier le domaine de Pix Assets Manager dans les liens sur Pix Admin (PIX-21053). 

### :arrow_up: Montée de version

- [#14710](https://github.com/1024pix/pix/pull/14710) Update dependency @1024pix/pix-ui to ^56.1.0 (admin) 
- [#14712](https://github.com/1024pix/pix/pull/14712) Update dependency @1024pix/pix-ui to ^56.1.0 (orga) 
- [#14706](https://github.com/1024pix/pix/pull/14706) Update dependency @1024pix/pix-ui to v56 (mon-pix) 
- [#14652](https://github.com/1024pix/pix/pull/14652) Update dependency ember-intl to v8 (mon-pix)

# [5.303.0](https://github.com/1024pix/pix/compare/v5.302.0...v5.303.0) (2026-01-13)

### :rocket: Amélioration

- [#14699](https://github.com/1024pix/pix/pull/14699) Retours panels internes IA botaniste 
- [#14697](https://github.com/1024pix/pix/pull/14697) Update IAGenPrompt_NOV_altconfig.json 

### :bug: Correction

- [#14703](https://github.com/1024pix/pix/pull/14703) La mauvaise clé de cache est utilisée dans une des méthodes pour récupérer des épreuves depuis le cache mémoire 

### :building_construction: Tech

- [#14687](https://github.com/1024pix/pix/pull/14687) Afficher le nombre total d'orgas créées en masse (PIX-7425) 

### :arrow_up: Montée de version

- [#14692](https://github.com/1024pix/pix/pull/14692) Update dependency @1024pix/pix-ui to v56 (admin)

# [5.302.0](https://github.com/1024pix/pix/compare/v5.301.1...v5.302.0) (2026-01-13)

### :rocket: Amélioration

- [#14505](https://github.com/1024pix/pix/pull/14505) Ajouter un script pour rattraper les participations supprimées avant l'activation de l'anonymization (Pix-20885). 
- [#14691](https://github.com/1024pix/pix/pull/14691) Permettre de sélectionner un module lors de la création/mise à jour d'un contenu formatif (PIX-20921) 
- [#14690](https://github.com/1024pix/pix/pull/14690) Récupérer uniquement les metadatas des modules publics (PIX-21029). 
- [#14675](https://github.com/1024pix/pix/pull/14675) Script de rattachement des profile rewards non partagées aux organisations (PIX-21016) 

### :building_construction: Tech

- [#14689](https://github.com/1024pix/pix/pull/14689) Ajout de logs de debug pour le usecase reward user (PIX-21004)

## [5.301.1](https://github.com/1024pix/pix/compare/v5.301.0...v5.301.1) (2026-01-12)

### :building_construction: Tech

- [#14694](https://github.com/1024pix/pix/pull/14694) Supprimer l'envoi des participations terminées pour France Travail (Ne pas merger avant d'avoir prévenu France Travail) (PIX-20950) 
- [#14683](https://github.com/1024pix/pix/pull/14683) Supprimer la table certification-data-active-calibrated-challenges (PIX-20641).

# [5.301.0](https://github.com/1024pix/pix/compare/v5.300.0...v5.301.0) (2026-01-12)

### :rocket: Amélioration

- [#14666](https://github.com/1024pix/pix/pull/14666) MDX-32 modification Decouverte 2 NR_Datacenter_NOV 
- [#14667](https://github.com/1024pix/pix/pull/14667) Supprimer l'avatar sur la page de confirmation d'association de SSO (PIX-21014) 

### :building_construction: Tech

- [#14663](https://github.com/1024pix/pix/pull/14663) Modifier la page de details pour s'aligner avec la nouvelle maquette (PIX-20802) 

### :coffee: Autre

- [#14647](https://github.com/1024pix/pix/pull/14647) Modifier le libellé et la mise en page autour des méthodes de connexion SSO à la connexion et à l'invitation (PIX-21009)

# [5.300.0](https://github.com/1024pix/pix/compare/v5.299.0...v5.300.0) (2026-01-12)

### :rocket: Amélioration

- [#14660](https://github.com/1024pix/pix/pull/14660) Ajouter un attribut de visibilité pour les modules (PIX-21022). 
- [#14671](https://github.com/1024pix/pix/pull/14671) IAGenBiais_IND IsBeta false 
- [#14681](https://github.com/1024pix/pix/pull/14681) MDX-18 Integration du POI et correction typo 
- [#14686](https://github.com/1024pix/pix/pull/14686) MDX-18 modification consigne 
- [#14680](https://github.com/1024pix/pix/pull/14680) Modif Module CY_GestionMDP_IND 
- [#14673](https://github.com/1024pix/pix/pull/14673) Module CY_MFA_IND ajout phrase transition défi 
- [#14659](https://github.com/1024pix/pix/pull/14659) Permuter les écrans d'inscription et d'association quand on rejoint une orga par SSO (PIX-21011) 
- [#14668](https://github.com/1024pix/pix/pull/14668) Version alternative de IAGenPrompt_NOV.json pour tester nouvelle config 
- [#14679](https://github.com/1024pix/pix/pull/14679) WIP IA vous avez dit IA correction plante et flip cards 
- [#14612](https://github.com/1024pix/pix/pull/14612) WIP Module MFA NOV 

### :building_construction: Tech

- [#14547](https://github.com/1024pix/pix/pull/14547) :recycle: Rendre possible la migration de donnée des status d'`Assessment` (Pix-20965) 
- [#14640](https://github.com/1024pix/pix/pull/14640) Ajouter des log debug dans les models des Requirement des quêtes (PIX-21043). 
- [#14678](https://github.com/1024pix/pix/pull/14678) Mettre à jour les PixSelect suite à l'évolution du DS (PIX-21044). 
- [#14528](https://github.com/1024pix/pix/pull/14528) Supprimer des tests de controllers inutiles et rangement (PIX-20961) 

### :arrow_up: Montée de version

- [#14672](https://github.com/1024pix/pix/pull/14672) Replace dependency @tsconfig/node22 with @tsconfig/node24 (audit-logger) 
- [#14677](https://github.com/1024pix/pix/pull/14677) Update dependency es-module-lexer to v2 (api)

# [5.299.0](https://github.com/1024pix/pix/compare/v5.298.0...v5.299.0) (2026-01-09)

### :rocket: Amélioration

- [#14645](https://github.com/1024pix/pix/pull/14645) Afficher le détail du référentiel coeur/transverse (PIX-20903). 
- [#14651](https://github.com/1024pix/pix/pull/14651) Ajoute une page de détails pour les schémas de parcours combiné (PIX-20995) 
- [#14665](https://github.com/1024pix/pix/pull/14665) Ajouter une bordure aux POI non interactifs dans les modules (PIX-20761). 
- [#14657](https://github.com/1024pix/pix/pull/14657) Construire le lien pour les détails d'un contenu formatif modulix sur Pix Admin (PIX-21019). 
- [#14669](https://github.com/1024pix/pix/pull/14669) creation-module-surequipement 
- [#14658](https://github.com/1024pix/pix/pull/14658) Recherche d'un nom d'orga malgré l'utilisation de caractères spéciaux (PIX-20770). 
- [#14622](https://github.com/1024pix/pix/pull/14622) Update IADefinition_IND.json 
- [#14641](https://github.com/1024pix/pix/pull/14641) WIP creation module durabilite nov 

### :bug: Correction

- [#14568](https://github.com/1024pix/pix/pull/14568) Faire que les fichiers de traduction correspondant à une locale composée (xxx-YYY) soient utilisés (PIX-20242) 

### :building_construction: Tech

- [#14662](https://github.com/1024pix/pix/pull/14662) Préfixer les routes des schémas de parcours combinés par /admin (PIX) 
- [#14661](https://github.com/1024pix/pix/pull/14661) Tentative de stabiliser le test E2E portant sur le passage d'un test de certification 

### :arrow_up: Montée de version

- [#14655](https://github.com/1024pix/pix/pull/14655) Lock file maintenance (admin) 
- [#14656](https://github.com/1024pix/pix/pull/14656) Lock file maintenance (api) 
- [#14458](https://github.com/1024pix/pix/pull/14458) Replace dependency @tsconfig/node20 with @tsconfig/node22 (audit-logger) 
- [#14607](https://github.com/1024pix/pix/pull/14607) Update dependency ember-intl to v8 (certif) 
- [#14653](https://github.com/1024pix/pix/pull/14653) Update dependency ember-intl to v8 (orga) 
- [#14650](https://github.com/1024pix/pix/pull/14650) Update nginx Docker tag to v1.29.4 
- [#14670](https://github.com/1024pix/pix/pull/14670) Upgrade @1024pix/epreuves-components to 2.5.1

# [5.298.0](https://github.com/1024pix/pix/compare/v5.297.0...v5.298.0) (2026-01-08)

### :rocket: Amélioration

- [#14646](https://github.com/1024pix/pix/pull/14646) Créer la route permettant de récupérer la liste des modules pour Pix Admin (PIX-20919). 
- [#14598](https://github.com/1024pix/pix/pull/14598) Créer le compte et connecter l'utilisateur via SSO Pix Orga (PIX-20666) 
- [#14629](https://github.com/1024pix/pix/pull/14629) Filtrer les sessions avec certifications Pix+ terminées de la liste des sessions à publier (PIX-21006) 
- [#14625](https://github.com/1024pix/pix/pull/14625) MDX-32 Retours editos NR-Datacenter-NOV 
- [#14537](https://github.com/1024pix/pix/pull/14537) Mettre en place une validation plus spécifique sur le formulaire de création d'organisation (PIX-20697) 
- [#14502](https://github.com/1024pix/pix/pull/14502) Module Phishing_NOV ajout POI 

### :building_construction: Tech

- [#14554](https://github.com/1024pix/pix/pull/14554) Ajout de JSDoc dans le `certification-candidate-repository` 
- [#14648](https://github.com/1024pix/pix/pull/14648) Suppression du script UpdateModulixTrainingsLink (PIX-21028). 

### :coffee: Autre

# [5.297.0](https://github.com/1024pix/pix/compare/v5.296.0...v5.297.0) (2026-01-07)

### :rocket: Amélioration

- [#14638](https://github.com/1024pix/pix/pull/14638) Ajout d'un filtre sur les centres archivés dans pix-admin (PIX-20021). 
- [#14639](https://github.com/1024pix/pix/pull/14639) Faire le lien entre un schéma de parcours et un parcours combiné (PIX-20993). 
- [#14620](https://github.com/1024pix/pix/pull/14620) Pré-remplissage de champs lors de la création d'une organisation fille (PIX-20729). 

### :rewind: Retour en arrière

- [#14644](https://github.com/1024pix/pix/pull/14644) Revert "[TECH] Amélioration de PGBoss (reprise de la PR 11308)."

### :building_construction: Tech

- [#14628](https://github.com/1024pix/pix/pull/14628) Ajouter la table combined_course_blueprint_shares (PIX-20994) 
- [#14633](https://github.com/1024pix/pix/pull/14633) Refonte graphique de la page de modification d'une organisation (PIX-20731) 
- [#14637](https://github.com/1024pix/pix/pull/14637) Renommer le script d'attestation et mettre à jour les profils cibles (PIX-21015)

# [5.296.0](https://github.com/1024pix/pix/compare/v5.295.0...v5.296.0) (2026-01-07)

### :rocket: Amélioration

- [#14624](https://github.com/1024pix/pix/pull/14624) Après envoi du signalement, afficher un message de confirmation (PIX-20913) 

### :rewind: Retour en arrière

- [#14636](https://github.com/1024pix/pix/pull/14636) Revert "[TECH] Supprimer l'envoi des participations terminées pour France Travail (Ne pas merger avant d'avoir prévenu France Travail) (PIX-20950)"

### :building_construction: Tech

- [#14635](https://github.com/1024pix/pix/pull/14635) Déplacer le mapping de statut TO_SHARE vers la couche de sérialisation (PIX-21015)

# [5.295.0](https://github.com/1024pix/pix/compare/v5.294.0...v5.295.0) (2026-01-07)

### :rocket: Amélioration

- [#14626](https://github.com/1024pix/pix/pull/14626) Masquer le champ Lien si le champ Format d'un contenu formatif n'est pas renseigné sur Pix Admin (PIX-20918). 
- [#14630](https://github.com/1024pix/pix/pull/14630) Modifs module CYAntivirus IND 
- [#14632](https://github.com/1024pix/pix/pull/14632) Modulix CY_MFA_IND remplacement par POI 
- [#14608](https://github.com/1024pix/pix/pull/14608) Valider l'existence des items de schéma de parcours combiné au moment de leur ajout (PIX-20891) 
- [#14456](https://github.com/1024pix/pix/pull/14456) WIP IA vous avez dit IA spot image cliquable et distracteurs 

### :bug: Correction

- [#14606](https://github.com/1024pix/pix/pull/14606) Les cartes de formation se chevauchent dans pix app (PIX-20712). 

### :building_construction: Tech

- [#14609](https://github.com/1024pix/pix/pull/14609) Afficher le nom de l'orga mère sur le formulaire sans utiliser les queryParams (PIX-20728) 
- [#14611](https://github.com/1024pix/pix/pull/14611) Améliorer les perfs de l'api récupérant une liste de modules par son shortId (PIX-20982) 
- [#14518](https://github.com/1024pix/pix/pull/14518) Rendre required l'ensemble des attributs de FlashAssessmentAlgorithmConfiguration (PIX-20955) 
- [#14553](https://github.com/1024pix/pix/pull/14553) Supprimer le feature toggle de partage automatique (PIX-20962) 

### :arrow_up: Montée de version

- [#14621](https://github.com/1024pix/pix/pull/14621) Update dependency ember-intl to v8 (junior)

# [5.294.0](https://github.com/1024pix/pix/compare/v5.293.0...v5.294.0) (2026-01-06)

### :rocket: Amélioration

- [#14614](https://github.com/1024pix/pix/pull/14614) Ajouter un feature toggle isModuleSelectionForTrainingEnabled (PIX-20920) 
- [#14497](https://github.com/1024pix/pix/pull/14497) Ajouter un script pour mettre en conformité les anciennes données supprimées des learners (PIX-20887). 

### :bug: Correction

- [#14623](https://github.com/1024pix/pix/pull/14623) Evite les crashs du client ioredis en revenant à la version 5.8.0. 

### :building_construction: Tech

- [#14605](https://github.com/1024pix/pix/pull/14605) Améliorer les performances des apis de recommandation de modules (PIX-20875) 

### :arrow_up: Montée de version

- [#14615](https://github.com/1024pix/pix/pull/14615) Update dependency @1024pix/pix-ui to ^55.34.0 (admin) 
- [#14616](https://github.com/1024pix/pix/pull/14616) Update dependency @1024pix/pix-ui to ^55.34.0 (certif) 
- [#14617](https://github.com/1024pix/pix/pull/14617) Update dependency @1024pix/pix-ui to ^55.34.0 (junior) 
- [#14618](https://github.com/1024pix/pix/pull/14618) Update dependency @1024pix/pix-ui to ^55.34.0 (mon-pix) 
- [#14619](https://github.com/1024pix/pix/pull/14619) Update dependency @1024pix/pix-ui to ^55.34.0 (orga) 
- [#14577](https://github.com/1024pix/pix/pull/14577) Update dependency eslint-plugin-unicorn to v62 (certif)

# [5.293.0](https://github.com/1024pix/pix/compare/v5.292.0...v5.293.0) (2026-01-06)

### :rocket: Amélioration

- [#14495](https://github.com/1024pix/pix/pull/14495) Ajouter un script pour rattrapper les campagnes supprimés des organizations non archivés après une date données (Pix-20884). 

### :building_construction: Tech

- [#14515](https://github.com/1024pix/pix/pull/14515) Supprimer l'envoi des participations terminées pour France Travail (Ne pas merger avant d'avoir prévenu France Travail) (PIX-20950)

# [5.292.0](https://github.com/1024pix/pix/compare/v5.291.1...v5.292.0) (2026-01-06)

### :rocket: Amélioration

- [#14601](https://github.com/1024pix/pix/pull/14601) Accéder rapidement au profil cible ou module depuis les tags du schéma d'un parcours combiné (PIX-20868). 
- [#14610](https://github.com/1024pix/pix/pull/14610) Améliorations page vidéo Youtube (PIX-20983) 
- [#14447](https://github.com/1024pix/pix/pull/14447) Créer un script pour rattrapper l'archivage des anciennes organisations avant la suppression automatique des campagnes / participations etc.... (PIX-17863). 
- [#14501](https://github.com/1024pix/pix/pull/14501) Permettre de retenter les acquis préalablement échoué au démarrage d'une campagne (PIX-20839). 
- [#14492](https://github.com/1024pix/pix/pull/14492) Tmp modif descriptions Module "J'améliore mes prompts" et "Les biais" 
- [#14451](https://github.com/1024pix/pix/pull/14451) WIP Deepfake - Nouvel exemple activite 4 et amelioration defi 

### :building_construction: Tech

- [#14516](https://github.com/1024pix/pix/pull/14516) :recycle: Utilise les status de l'`Assessment` uniquement (pix-20953) 
- [#14602](https://github.com/1024pix/pix/pull/14602) Afficher les logs des appels mirage durant les tests dans la console sur PixAdmin 
- [#11431](https://github.com/1024pix/pix/pull/11431) Amélioration de PGBoss (reprise de la PR 11308). 
- [#14552](https://github.com/1024pix/pix/pull/14552) Utiliser une nouvelle API pour récupérer l'historique d'un référentiel de certif (PIX-20959) 

### :arrow_up: Montée de version

- [#14604](https://github.com/1024pix/pix/pull/14604) MàJ de @1024pix/epreuves-components en 2.4.7

## [5.291.1](https://github.com/1024pix/pix/compare/v5.291.0...v5.291.1) (2026-01-05)

### :building_construction: Tech

- [#14600](https://github.com/1024pix/pix/pull/14600) Corriger les erreurs de type d'audit logger 

### :arrow_up: Montée de version

- [#14593](https://github.com/1024pix/pix/pull/14593) Lock file maintenance (api)

# [5.291.0](https://github.com/1024pix/pix/compare/v5.290.3...v5.291.0) (2026-01-05)

### :rocket: Amélioration

- [#14524](https://github.com/1024pix/pix/pull/14524) modif-relecture-jennifer 
- [#14543](https://github.com/1024pix/pix/pull/14543) Permet de supprimer un élément du schéma de parcours (PIX-20862). 
- [#14478](https://github.com/1024pix/pix/pull/14478) Qualité Module clavier 2 

### :building_construction: Tech

- [#14538](https://github.com/1024pix/pix/pull/14538) Ajouter des informations de monitoring supplémentaires sur les appels de l’openIdClient (PIX-20681) 
- [#14512](https://github.com/1024pix/pix/pull/14512) Corriger et améliorer les seeds de l’équipe Accès (PIX-20946) 
- [#14513](https://github.com/1024pix/pix/pull/14513) Déplacer le message destiné aux chefs d'établissement du composant vers le template login (PIX-20894) 
- [#14571](https://github.com/1024pix/pix/pull/14571) Modifier encore quelques points sur les seeds de l’équipe Accès (PIX-20968) 
- [#14599](https://github.com/1024pix/pix/pull/14599) Utiliser les shortIds dans les seeds de parcours combinés (pix-20969) 

### :arrow_up: Montée de version

- [#14592](https://github.com/1024pix/pix/pull/14592) Lock file maintenance (admin) 
- [#14594](https://github.com/1024pix/pix/pull/14594) Lock file maintenance (audit-logger) 
- [#14595](https://github.com/1024pix/pix/pull/14595) Lock file maintenance (certif) 
- [#14596](https://github.com/1024pix/pix/pull/14596) Lock file maintenance (dossier racine) 
- [#14597](https://github.com/1024pix/pix/pull/14597) Lock file maintenance (e2e-playwright) 
- [#14583](https://github.com/1024pix/pix/pull/14583) Lock file maintenance (junior) 
- [#14584](https://github.com/1024pix/pix/pull/14584) Lock file maintenance (load-testing) 
- [#14585](https://github.com/1024pix/pix/pull/14585) Lock file maintenance (mon-pix) 
- [#14586](https://github.com/1024pix/pix/pull/14586) Lock file maintenance (orga) 
- [#14557](https://github.com/1024pix/pix/pull/14557) Update dependency @1024pix/pix-ui to ^55.33.0 (orga) 
- [#14569](https://github.com/1024pix/pix/pull/14569) Update dependency @1024pix/pix-ui to ^55.33.1 (admin) 
- [#14570](https://github.com/1024pix/pix/pull/14570) Update dependency @1024pix/pix-ui to ^55.33.1 (certif) 
- [#14572](https://github.com/1024pix/pix/pull/14572) Update dependency @1024pix/pix-ui to ^55.33.1 (junior) 
- [#14573](https://github.com/1024pix/pix/pull/14573) Update dependency @1024pix/pix-ui to ^55.33.1 (mon-pix) 
- [#14579](https://github.com/1024pix/pix/pull/14579) Update dependency @1024pix/pix-ui to ^55.33.1 (orga) 
- [#14560](https://github.com/1024pix/pix/pull/14560) Update dependency @eslint/compat to v2 (audit-logger) 
- [#14561](https://github.com/1024pix/pix/pull/14561) Update dependency @eslint/compat to v2 (dossier racine) 
- [#14562](https://github.com/1024pix/pix/pull/14562) Update dependency @formatjs/intl to v4 (certif) 
- [#14563](https://github.com/1024pix/pix/pull/14563) Update dependency @formatjs/intl to v4 (mon-pix) 
- [#14564](https://github.com/1024pix/pix/pull/14564) Update dependency ember-cli-deprecation-workflow to v4 (certif) 
- [#14565](https://github.com/1024pix/pix/pull/14565) Update dependency ember-cli-deprecation-workflow to v4 (mon-pix) 
- [#14566](https://github.com/1024pix/pix/pull/14566) Update dependency ember-cli-htmlbars to v7 (certif) 
- [#14567](https://github.com/1024pix/pix/pull/14567) Update dependency ember-cli-htmlbars to v7 (junior) 
- [#14591](https://github.com/1024pix/pix/pull/14591) Update dependency ember-cli-htmlbars to v7 (mon-pix) 
- [#14587](https://github.com/1024pix/pix/pull/14587) Update dependency ember-cli-htmlbars to v7 (orga) 
- [#14575](https://github.com/1024pix/pix/pull/14575) Update dependency eslint-plugin-unicorn to v62 (api) 
- [#14576](https://github.com/1024pix/pix/pull/14576) Update dependency eslint-plugin-unicorn to v62 (audit-logger) 
- [#14578](https://github.com/1024pix/pix/pull/14578) Update dependency eslint-plugin-unicorn to v62 (dossier racine) 
- [#14580](https://github.com/1024pix/pix/pull/14580) Update dependency html-validate to v10 (api) 
- [#14581](https://github.com/1024pix/pix/pull/14581) Update dependency joi to v18 (audit-logger) 
- [#14588](https://github.com/1024pix/pix/pull/14588) Update dependency pino to v10 (api) 
- [#14589](https://github.com/1024pix/pix/pull/14589) Update dependency pino to v10 (audit-logger) 
- [#14559](https://github.com/1024pix/pix/pull/14559) Update dependency webpack to v5.104.1 (junior) 
- [#14590](https://github.com/1024pix/pix/pull/14590) Update dependency xmlbuilder2 to v4 (api)

## [5.290.3](https://github.com/1024pix/pix/compare/v5.290.2...v5.290.3) (2026-01-01)

### :building_construction: Tech

- [#14539](https://github.com/1024pix/pix/pull/14539) :broom: Suppression d'une fonction inutilisé dans le `assessement-repository` (PIX-20963) 
- [#14510](https://github.com/1024pix/pix/pull/14510) :recycle: Utilise le terme `invigilator` plutôt que `supervisor` dans les traduction (Pix-20947) 
- [#14546](https://github.com/1024pix/pix/pull/14546) Migrer les routes d'Admin "complementary-certifications" (PIX-20958). 

### :arrow_up: Montée de version

- [#14541](https://github.com/1024pix/pix/pull/14541) Update dependency @1024pix/eslint-plugin to ^2.1.15 (admin) 
- [#14542](https://github.com/1024pix/pix/pull/14542) Update dependency @1024pix/eslint-plugin to ^2.1.15 (api) 
- [#14544](https://github.com/1024pix/pix/pull/14544) Update dependency @1024pix/eslint-plugin to ^2.1.15 (audit-logger) 
- [#14545](https://github.com/1024pix/pix/pull/14545) Update dependency @1024pix/eslint-plugin to ^2.1.15 (certif) 
- [#14548](https://github.com/1024pix/pix/pull/14548) Update dependency @1024pix/eslint-plugin to ^2.1.15 (dossier racine) 
- [#14549](https://github.com/1024pix/pix/pull/14549) Update dependency @1024pix/eslint-plugin to ^2.1.15 (e2e-playwright) 
- [#14550](https://github.com/1024pix/pix/pull/14550) Update dependency @1024pix/eslint-plugin to ^2.1.15 (junior) 
- [#14551](https://github.com/1024pix/pix/pull/14551) Update dependency @1024pix/eslint-plugin to ^2.1.15 (mon-pix) 
- [#14555](https://github.com/1024pix/pix/pull/14555) Update dependency @1024pix/eslint-plugin to ^2.1.15 (orga) 
- [#14535](https://github.com/1024pix/pix/pull/14535) Update dependency @1024pix/pix-ui to ^55.33.0 (certif) 
- [#14556](https://github.com/1024pix/pix/pull/14556) Update dependency @1024pix/pix-ui to ^55.33.0 (mon-pix) 
- [#14558](https://github.com/1024pix/pix/pull/14558) Update dependency ember-cli to ~6.9.0 (admin)

## [5.290.2](https://github.com/1024pix/pix/compare/v5.290.1...v5.290.2) (2025-12-31)

### :building_construction: Tech

- [#14507](https://github.com/1024pix/pix/pull/14507) Corriger des tests flaky de userReconciliationService (PIX-20945) 
- [#14526](https://github.com/1024pix/pix/pull/14526) Corriger un problème de reload dans les tests front sur Pix Admin sous Firefox 
- [#14527](https://github.com/1024pix/pix/pull/14527) Migrer le singleton oidcAuthenticationServiceRegistry de api/lib/domain/usecases/index.js  vers src/ (PIX-20960) 
- [#14540](https://github.com/1024pix/pix/pull/14540) Remplacement de `Object` par `object` dans la JSDoc du domaine certification 
- [#14525](https://github.com/1024pix/pix/pull/14525) Supprime la dépendance à `ember-fetch` dans Pix Junior. 
- [#14522](https://github.com/1024pix/pix/pull/14522) Utiliser une nouvelle API pour récupérer la version active d'un référentiel de certif (PIX-20954). 
- [#14517](https://github.com/1024pix/pix/pull/14517) Utiliser uniquement la valeur dans config.v3certification de maxReachableLevel dans le scope certif (PIX-20956) 

### :arrow_up: Montée de version

- [#14303](https://github.com/1024pix/pix/pull/14303) Update actions/checkout action to v6 (workflows) 
- [#14532](https://github.com/1024pix/pix/pull/14532) Update adobe/s3mock Docker tag to v4.11.0 (.circleci) 
- [#14533](https://github.com/1024pix/pix/pull/14533) Update adobe/s3mock Docker tag to v4.11.0 (docker) 
- [#14534](https://github.com/1024pix/pix/pull/14534) Update adobe/s3mock Docker tag to v4.11.0 (dossier racine) 
- [#14531](https://github.com/1024pix/pix/pull/14531) Update dependency @1024pix/pix-ui to ^55.33.0 (admin) 
- [#14536](https://github.com/1024pix/pix/pull/14536) Update dependency @1024pix/pix-ui to ^55.33.0 (junior) 
- [#14509](https://github.com/1024pix/pix/pull/14509) Update dependency ember-exam to v10.0.1 (certif) 
- [#14529](https://github.com/1024pix/pix/pull/14529) Update dependency ember-exam to v10.0.1 (junior) 
- [#14530](https://github.com/1024pix/pix/pull/14530) Update dependency ember-exam to v10.0.1 (orga)

## [5.290.1](https://github.com/1024pix/pix/compare/v5.290.0...v5.290.1) (2025-12-30)

### :bug: Correction

- [#14523](https://github.com/1024pix/pix/pull/14523) Corriger le fichier CHANGELOG.md 

### :building_construction: Tech

- [#14511](https://github.com/1024pix/pix/pull/14511) Ajout et MAJ de JSDoc dans les repositories du sous contexte `enrolment` (PIX-20948).

# [5.290.0](https://github.com/1024pix/pix/compare/v5.289.0...v5.290.0) (2025-12-30)

### :rocket: Amélioration

- [#14514](https://github.com/1024pix/pix/pull/14514) Utiliser des shorts ids au lieu des ids de modules pour créer un schéma de parcours combiné (PIX-20863) 

### :bug: Correction

- [#14519](https://github.com/1024pix/pix/pull/14519) Corrige l'identifiant du créateur des campagnes dans le csv exporté depuis les schémas de parcours. 

### :building_construction: Tech

- [#14482](https://github.com/1024pix/pix/pull/14482) Créer des blueprints à partir des combined_courses déjà existants et les rattacher (PIX-20848) 
- [#14521](https://github.com/1024pix/pix/pull/14521) Supprime les tests (flacky) e2e d'accessibilité de modulix. 
- [#14506](https://github.com/1024pix/pix/pull/14506) Utiliser la clé de complémentaire dans la route de récupération des profils-cibles (PIX-20856).

# [5.289.0](https://github.com/1024pix/pix/compare/v5.288.0...v5.289.0) (2025-12-29)

### :rocket: Amélioration

- [#14503](https://github.com/1024pix/pix/pull/14503) Afficher différentes catégories de signalement selon l'élément dans un module (PIX-20830).
- [#14474](https://github.com/1024pix/pix/pull/14474) Ajout des identifiants SSO dans l'API MADDO (PIX-20797)                               
- [#14504](https://github.com/1024pix/pix/pull/14504) Ajouter le signalement pour la modalité Custom (PIX-20886)                                
- [#14488](https://github.com/1024pix/pix/pull/14488) defaultProbabilityToPickChallenge - Versioner la probabilité par défaut de sélection des challenges (PIX-20658)

### :building_construction: Tech

- [#14439](https://github.com/1024pix/pix/pull/14439) :recycle: Renomme l'attribut `supervisor-password` pour utiliser le terme `invigilator` (PIX-20790)
- [#14508](https://github.com/1024pix/pix/pull/14508) Remplacer le paquet glob par le builtin fs.glob

# [5.288.0](https://github.com/1024pix/pix/compare/v5.287.0...v5.288.0) (2025-12-24)

### :rocket: Amélioration

- [#14465](https://github.com/1024pix/pix/pull/14465) Ajouter la page de création de compte lors d'une connexion SSO (PIX-20540)
- [#14499](https://github.com/1024pix/pix/pull/14499) Creation module cy_mfa_ind
- [#14481](https://github.com/1024pix/pix/pull/14481) Permettre d'envoyer un signalement dans les modules sur Pix App (PIX-20994). 

### :bug: Correction

- [#14500](https://github.com/1024pix/pix/pull/14500) Mise à jour des URLs de documentation (PIX-20923).

### :building_construction: Tech

- [#14494](https://github.com/1024pix/pix/pull/14494) Ajout et MAJ de JSDoc dans le sous-domaine configuration (certif) (PIX-20912).

# [5.287.0](https://github.com/1024pix/pix/compare/v5.286.0...v5.287.0) (2025-12-23)

### :rocket: Amélioration

- [#14486](https://github.com/1024pix/pix/pull/14486) Afficher la liste complète des référentiels de certification dans Admin (PIX-20837).
- [#14496](https://github.com/1024pix/pix/pull/14496) Afficher le compteur de certifs d'un utilisateur sur Admin (PIX-20910).
- [#14491](https://github.com/1024pix/pix/pull/14491) Supprimer le titre redondant "Analyse de résultats" dans l'onglet analyse d'une campagne (PIX-20853)

### :building_construction: Tech

- [#14397](https://github.com/1024pix/pix/pull/14397) Enlever de config.js le v3Certification.numberOfChallengesPerCourse (PIX-20656)
- [#14338](https://github.com/1024pix/pix/pull/14338) Mettre à jour la page de blocage par le WAF (#14338)
- [#14479](https://github.com/1024pix/pix/pull/14479) Refactoriser la manière de remplir le formulaire de création d'orga (PIX-20854) 

### :arrow_up: Montée de version

- [#14498](https://github.com/1024pix/pix/pull/14498) Upgrade @1024pix/epreuves-components to 2.4.6

# [5.286.0](https://github.com/1024pix/pix/compare/v5.285.0...v5.286.0) (2025-12-22)

### :rocket: Amélioration

- [#14428](https://github.com/1024pix/pix/pull/14428) Améliorer l'affichage dans Pix Admin (suite) (PIX-20879).
- [#14472](https://github.com/1024pix/pix/pull/14472) Corriger quelques textes et titres dans le formulaire de création d'orga (PIX-20840)
- [#14489](https://github.com/1024pix/pix/pull/14489) Iframe de visionnage de tuto Youtube (PIX-20897)
- [#14427](https://github.com/1024pix/pix/pull/14427) MDX-17 Biais_AVA integration retours relecture
- [#14445](https://github.com/1024pix/pix/pull/14445) MDX-32 Integration retours NR_Datacenter_NOV
- [#14493](https://github.com/1024pix/pix/pull/14493) Mettre à jour les traductions néerlandaises du mot "Attestation" (PIX-18677)
- [#14480](https://github.com/1024pix/pix/pull/14480) modifis relecture interne antivirus ind
- [#14487](https://github.com/1024pix/pix/pull/14487) modifs gestionmdp nov relecture experts
- [#14483](https://github.com/1024pix/pix/pull/14483) modifs virus nov
- [#14394](https://github.com/1024pix/pix/pull/14394) Permettre à un utilisateur invité de se connecter par un SSO (pix-20665)
- [#14490](https://github.com/1024pix/pix/pull/14490) Valider l'existence du profil cible au moment de la création de schéma parcours combiné (PIX-20811)

### :bug: Correction

- [#14485](https://github.com/1024pix/pix/pull/14485) Les badges ne peuvent plus être mis à jour (PIX-20881).

### :building_construction: Tech

- [#14460](https://github.com/1024pix/pix/pull/14460) :truck: Déplace les derniers cas d'utilisation du contexte `complementary-certification`
- [#14402](https://github.com/1024pix/pix/pull/14402) Remplacer le lecteur video utilisé dans les modules(PIX-20531).
- [#14425](https://github.com/1024pix/pix/pull/14425) Séparer les insertions des Ke et des KeSnapshot du repository knowledgeElementRepository (PIX-20855).

### :arrow_up: Montée de version

- [#14484](https://github.com/1024pix/pix/pull/14484) Upgrade @1024pix/epreuves-components to 2.4.1

# [5.285.0](https://github.com/1024pix/pix/compare/v5.284.0...v5.285.0) (2025-12-19)

### :rocket: Amélioration

- [#14466](https://github.com/1024pix/pix/pull/14466) Ajouter des boutons de signalement pour les embed et QAB dans Pix App (PIX-20792).
- [#14476](https://github.com/1024pix/pix/pull/14476) Ajouter un lien vers le schema de parcours combiné pour un parcours combiné (PIX-20849)"
- [#14455](https://github.com/1024pix/pix/pull/14455) Ajouter une route récupérant la liste des référentiels de certif (PIX-20771).
- [#14473](https://github.com/1024pix/pix/pull/14473) Gérer la couleur du bouton de signalement en cas de hover/focus (PIX-20828).
- [#14459](https://github.com/1024pix/pix/pull/14459) Modification IAGenImpact_NOV pour internationalisation
- [#14477](https://github.com/1024pix/pix/pull/14477) modifications-post-relectures

### :bug: Correction

- [#14475](https://github.com/1024pix/pix/pull/14475) Message d'erreur incorrecte quand l'accès à Pix Orga n'est pas autorisé (PIX-20846)

### :building_construction: Tech

- [#14471](https://github.com/1024pix/pix/pull/14471) Correction des routes Mirage /token dans Pix Certif et Pix Orga, et ajout de tests d’erreur au login de Pix Orga
- [#14437](https://github.com/1024pix/pix/pull/14437) Harmoniser les champs vides des organisations en base (PIX-20776)
- [#14436](https://github.com/1024pix/pix/pull/14436) Supprimer le statut TO_SHARE des cartes de parcours (PIX-20709)

### :arrow_up: Montée de version

- [#14468](https://github.com/1024pix/pix/pull/14468) Mise à jour de epreuves-components en 2.3.0

# [5.284.0](https://github.com/1024pix/pix/compare/v5.283.0...v5.284.0) (2025-12-18)

### :rocket: Amélioration

- [#14448](https://github.com/1024pix/pix/pull/14448) Afficher une modale lorsque l'utilisateur clique sur un bouton de signalement dans les modules (PIX-20493). 
- [#14446](https://github.com/1024pix/pix/pull/14446) Créer des schéma de parcours combiné (PIX-20734)
- [#14408](https://github.com/1024pix/pix/pull/14408) defaultCandidateCapacity - Versioner la capacité par défaut d'un candidat (PIX-20659)
- [#14467](https://github.com/1024pix/pix/pull/14467) FRI Update CYVirus_NOV suite relecture interne
- [#14464](https://github.com/1024pix/pix/pull/14464) Modif Clavier 1 suite comité qualité
- [#14430](https://github.com/1024pix/pix/pull/14430) Vider le champ mot de passe du formulaire de connexion SCO suite à une erreur (PIX-20773).

### :bug: Correction

- [#14461](https://github.com/1024pix/pix/pull/14461) Empêcher de multiples soumissions du form d'édition de session (PIX-20827). 

### :building_construction: Tech

- [#14463](https://github.com/1024pix/pix/pull/14463) Améliorer les performances des API internes des modules (PIX-20687) 
- [#14469](https://github.com/1024pix/pix/pull/14469) Augmenter la taille du conteneur du job de lint de mon-pix
- [#14470](https://github.com/1024pix/pix/pull/14470) Augmenter le nombre d'auto-reruns sur les tests d'acceptance
- [#14462](https://github.com/1024pix/pix/pull/14462) Nettoyage de code non utilisé dans Pix Admin
- [#14453](https://github.com/1024pix/pix/pull/14453) Retirer les références à organization_learner_passage_participations (PIX-20812) 

# [5.283.0](https://github.com/1024pix/pix/compare/v5.282.0...v5.283.0) (2025-12-17)

### :rocket: Amélioration

- [#14431](https://github.com/1024pix/pix/pull/14431) WIP module cyber antivirus ind
- [#14426](https://github.com/1024pix/pix/pull/14426) MDX-9 IAGenFonction_NOV, correction coquille POI 
- [#14422](https://github.com/1024pix/pix/pull/14422) Renommer et traduire les champs du formulaire de création d'organisation (PIX-20698) 

### :bug: Correction

- [#14443](https://github.com/1024pix/pix/pull/14443) Impossible de modifier un utilisateur dans Pix Admin (PIX-20796) 
- [#14372](https://github.com/1024pix/pix/pull/14372) Rajout de l'éligibilité dans l'historique du candidat (PIX-20622).
- [#14450](https://github.com/1024pix/pix/pull/14450) Supprimer la valeur par défaut de INFORMATION_BANNER_POLLING_TIME dans le scope 'test' (PIX-20809)

### :building_construction: Tech

- [#14435](https://github.com/1024pix/pix/pull/14435) :recycle: Renomme le constructeur `buildSupervisorAccess` pour utiliser le terme `invigilator` (pix-20789)
- [#14414](https://github.com/1024pix/pix/pull/14414) Renommer le modèle Frameworks en Scopes (PIX-20774).
- [#14403](https://github.com/1024pix/pix/pull/14403) Retirer des champs de la table quête (PIX-20736) 
- [#14434](https://github.com/1024pix/pix/pull/14434) Supprimer les décorateurs computed dans Pix Admin 

### :arrow_up: Montée de version

- [#14128](https://github.com/1024pix/pix/pull/14128) Update node to v24 (major)

# [5.282.0](https://github.com/1024pix/pix/compare/v5.281.0...v5.282.0) (2025-12-16)

### :rocket: Amélioration

- [#14423](https://github.com/1024pix/pix/pull/14423) Ajout solution Prompt-ind 
- [#14432](https://github.com/1024pix/pix/pull/14432) Creation module-datacenter-ind 
- [#14441](https://github.com/1024pix/pix/pull/14441) CY_phishing_AVA ajout mention cybermalveillance 
- [#14444](https://github.com/1024pix/pix/pull/14444) CY_Phishing_AVA cybermalveillance+ saut 
- [#14438](https://github.com/1024pix/pix/pull/14438) CY_phishing_NOV ajout mention cybermalveillance 
- [#14399](https://github.com/1024pix/pix/pull/14399) Revoir le style global du formulaire de création d'organisation (PIX-20699) 

### :bug: Correction

- [#14449](https://github.com/1024pix/pix/pull/14449) Mise à jour des URLs de documentation (PIX-20807). 

### :building_construction: Tech

- [#14433](https://github.com/1024pix/pix/pull/14433) Ajout de JSDoc dans le scoring-v3.js (PIX-20787). 
- [#14398](https://github.com/1024pix/pix/pull/14398) Supprimer ember-api-actions de Pix Orga (PIX-20768) 

### :coffee: Autre

- [#14442](https://github.com/1024pix/pix/pull/14442) CY_Phishing_IND retours apres validation

# [5.281.0](https://github.com/1024pix/pix/compare/v5.280.0...v5.281.0) (2025-12-15)

### :rocket: Amélioration

- [#14424](https://github.com/1024pix/pix/pull/14424) Ajout solution - prompt nov 
- [#14401](https://github.com/1024pix/pix/pull/14401) Ajouter une page de listing des schémas de parcours combinés dans Admin (PIX-20726)  
- [#14421](https://github.com/1024pix/pix/pull/14421) Renommer une colonne dans la table combined_course_blueprints (PIX-20736) 
- [#14406](https://github.com/1024pix/pix/pull/14406) Supprimer la table target-profile-training-organizations (PIX-20746) 
- [#14415](https://github.com/1024pix/pix/pull/14415) WIP mon premier prompt nouvelle image cliquable ancienne config LLM et coquilles 

### :building_construction: Tech

- [#14411](https://github.com/1024pix/pix/pull/14411) :recycle: Renommer la table `supervisor-accesses` pour utiliser le terme `invigilator` 
- [#14420](https://github.com/1024pix/pix/pull/14420) Corrige le test e2e d'import generique (PIX-20775) 
- [#14391](https://github.com/1024pix/pix/pull/14391) En 'test', s'assurer que les variables d'env sont définies et écrasent celles définies localement (PIX-20566) 
- [#14429](https://github.com/1024pix/pix/pull/14429) Enlever les inserts dans les champs quest qui ne seront plus utilisés au moment de la création des parcours combinés (PIX-20781) 
- [#14405](https://github.com/1024pix/pix/pull/14405) Harmoniser provinceCode vide (PIX-20749) 
- [#14417](https://github.com/1024pix/pix/pull/14417) Remettre en place l’action "Check node version availability on Scalingo" 
- [#14380](https://github.com/1024pix/pix/pull/14380) Scinder la récupération de la donnée du parcours et son instanciation du parcours (PIX-20759). 

### :coffee: Autre

- [#14418](https://github.com/1024pix/pix/pull/14418) MDX-9 IAGenFonction_NOV, modification QROCM

# [5.280.0](https://github.com/1024pix/pix/compare/v5.279.0...v5.280.0) (2025-12-12)

### :rocket: Amélioration

- [#14386](https://github.com/1024pix/pix/pull/14386) Affichage d'une bannière d'information de partage des résultats sur le checkpoint final d'une campagne (PIX-19651) 
- [#14413](https://github.com/1024pix/pix/pull/14413) GestionMDP_NOV Retours eval et teamIANR 
- [#14404](https://github.com/1024pix/pix/pull/14404) Retirer le code permettant de retenter une campagne (Pix-20708). 
- [#14393](https://github.com/1024pix/pix/pull/14393) Revoir la page de design de configuration d'association de compte (PIX-20755) 
- [#14317](https://github.com/1024pix/pix/pull/14317) Suivi utilisation de l'oralisation en certification Pix (PIX-20378). 
- [#14321](https://github.com/1024pix/pix/pull/14321) WIP mon premier prompt - chatpix nlle config recette 

### :bug: Correction

- [#14416](https://github.com/1024pix/pix/pull/14416) Commenter le test flaky en attendant (PIX-XXX) 

### :building_construction: Tech

- [#14400](https://github.com/1024pix/pix/pull/14400) Appliquer des correctifs sur la gestions des images des badges (PIX-20733). 
- [#14412](https://github.com/1024pix/pix/pull/14412) Bump ember-intl v8 sur Pix Admin 
- [#14407](https://github.com/1024pix/pix/pull/14407) Masquer le statut TO_SHARE en Admin et convertir en STARTED (PIX-20707) 
- [#14382](https://github.com/1024pix/pix/pull/14382) Remplacer ember-cp-validation par Joi dans Pix Admin 
- [#14410](https://github.com/1024pix/pix/pull/14410) Supprime la table `combined_course_participations` (PIX-20375). 
- [#14388](https://github.com/1024pix/pix/pull/14388) Test e2e import génerique (PIX-20083)

# [5.279.0](https://github.com/1024pix/pix/compare/v5.278.0...v5.279.0) (2025-12-11)

### :rocket: Amélioration

- [#14353](https://github.com/1024pix/pix/pull/14353) Ajouter la confirmation d'association d'une connexion SSO à un compte utilisateur (PIX-20664) 
- [#14377](https://github.com/1024pix/pix/pull/14377) Ajouter les boutons de signalement dans les feedbacks et POI des modules (PIX-20492). 
- [#14392](https://github.com/1024pix/pix/pull/14392) Améliorer le rendu des images transparentes dans des grains avec un fond (PIX-20640) 
- [#14390](https://github.com/1024pix/pix/pull/14390) Enregistrer les signalements en base (PIX-2049) 
- [#14352](https://github.com/1024pix/pix/pull/14352) FRONT Filtrer les organisations sur l'équipe en charge (PIX-20692) 
- [#14384](https://github.com/1024pix/pix/pull/14384) MDX-17 Biais_AVA integration retours relecture 
- [#14389](https://github.com/1024pix/pix/pull/14389) Supprimer le champ Crédits dans le formulaire de création d'orga (PIX-29696) 

### :building_construction: Tech

- [#14313](https://github.com/1024pix/pix/pull/14313) :recycle: Renomme l'URL `end-assessment-by-supervisor` pour utiliser le terme `invigilator` (pix-20625) 
- [#14395](https://github.com/1024pix/pix/pull/14395) Corriger la manière dont on génére les seeds  (PIX-20758) 
- [#14331](https://github.com/1024pix/pix/pull/14331) Enlever de config.js le v3Certification.challengesBetweenSameCompetence (PIX-20657) 
- [#14383](https://github.com/1024pix/pix/pull/14383) Suppression de code temporaire de rétrocompatibilité de ChatPix (PIX-20571)

# [5.278.0](https://github.com/1024pix/pix/compare/v5.277.0...v5.278.0) (2025-12-10)

### :rocket: Amélioration

- [#14376](https://github.com/1024pix/pix/pull/14376) Ajouter les champs "Identifiant externe" et "Département" au formulaire de création d'orga (PIX-20695) 
- [#14375](https://github.com/1024pix/pix/pull/14375) Assigner le status STARTED aux participations de collectes de profiles à leurs créations (PIX-20706) 
- [#14274](https://github.com/1024pix/pix/pull/14274) Migrer le scoring V3 sur les referentiels de certifications (PIX-19935). 
- [#14385](https://github.com/1024pix/pix/pull/14385) Module Cyber Virus Novice modif 
- [#14363](https://github.com/1024pix/pix/pull/14363) Rendre insensible aux accents le filtre d'une organisation par le nom (PIX-20165) 
- [#14360](https://github.com/1024pix/pix/pull/14360) Update IAGenPrompt_IND.json - modifs Bon usages 

### :bug: Correction

- [#14365](https://github.com/1024pix/pix/pull/14365)  Gérer les erreurs non-prévues (c’est à dire non-JSON:API) dans le parcours d'authentification OIDC (PIX-20710) 
- [#14381](https://github.com/1024pix/pix/pull/14381) Afficher clairement le référentiel d'un candidat d'une session (PIX-20741). 

### :building_construction: Tech

- [#14366](https://github.com/1024pix/pix/pull/14366) :recycle: Met à jour le candidat dans une transaction (pix-20719) 
- [#14379](https://github.com/1024pix/pix/pull/14379) Passage aux template de routes GJS sur Pix Admin 
- [#14348](https://github.com/1024pix/pix/pull/14348) Permettre au métier d'entrer une URL complète d'image dans le formulaire de création de badge sur Pix Admin (PIX-20588) 
- [#14374](https://github.com/1024pix/pix/pull/14374) Réessayer les requêtes vers l'API LLM si elle répond par une erreur 502 (PIX-20714) 
- [#14347](https://github.com/1024pix/pix/pull/14347) Suppression de la feature des organisations rattachées au profil cible via les contenus formatif (PIX-20672). 

### :arrow_up: Montée de version

- [#14371](https://github.com/1024pix/pix/pull/14371) Update dependency ember-source to ~6.9.0 (junior)

# [5.277.0](https://github.com/1024pix/pix/compare/v5.276.0...v5.277.0) (2025-12-09)

### :rocket: Amélioration

- [#14357](https://github.com/1024pix/pix/pull/14357) Ajout d'une modal pour éviter le détachement accidentel d'un profil cible de ses contenus formatifs s'il est lié à un parcours combiné (PIX-20512) 
- [#14373](https://github.com/1024pix/pix/pull/14373) Ajouter une table pour les schémas de parcours combinés (PIX-20727) 
- [#14351](https://github.com/1024pix/pix/pull/14351) BACK Filtrer les organisations sur l'équipe en charge (PIX-20691) 
- [#14346](https://github.com/1024pix/pix/pull/14346) Éviter d'avoir l'auto-complétion Google Pay sur le form de certif (PIX-20635). 
- [#14369](https://github.com/1024pix/pix/pull/14369) Modifs2 experts mdp nov 
- [#14362](https://github.com/1024pix/pix/pull/14362) Persister le centre choisi dans PixCertif (PIX-20705). 

### :bug: Correction

- [#14359](https://github.com/1024pix/pix/pull/14359) Les bordures des cartes de formation ne sont pas très clean sur Pix App (PIX-20618) 

### :building_construction: Tech

- [#14368](https://github.com/1024pix/pix/pull/14368) Bump des dépendances Pix Admin 
- [#14378](https://github.com/1024pix/pix/pull/14378) Retirer l'usage d'une table qui n'est plus alimenté (PIX-20738). 
- [#14370](https://github.com/1024pix/pix/pull/14370) Simplifier la déclaration de Parcours dans les tests (PIX-20725).

# [5.276.0](https://github.com/1024pix/pix/compare/v5.275.0...v5.276.0) (2025-12-08)

### :rocket: Amélioration

- [#14339](https://github.com/1024pix/pix/pull/14339) Cacher les code campagnes lorsqu'elle proviennent d'un parcours combiné dans admin (PIX-20503) 
- [#14367](https://github.com/1024pix/pix/pull/14367) Modifs experts mdp nov 
- [#14356](https://github.com/1024pix/pix/pull/14356) Update IAGenBiais_IND.json 
- [#14354](https://github.com/1024pix/pix/pull/14354) Update IAGenPrompt_IND.json (retours Maeva) 

### :building_construction: Tech

- [#13849](https://github.com/1024pix/pix/pull/13849) Activer par défaut certains feature toggles (PIX-20686). 
- [#14314](https://github.com/1024pix/pix/pull/14314) Ajouter dans les seeds l'initialisation des valeurs de la table certification_sco_blocked_access_dates 
- [#14361](https://github.com/1024pix/pix/pull/14361) Completer les acquisitions de paliers et les snapshots dans les seeds des parcours combines (PIX-20711)  
- [#14355](https://github.com/1024pix/pix/pull/14355) Être plus restrictif sur l'import des campagnes en masse (Pix-20653). 

### :coffee: Autre

# [5.275.0](https://github.com/1024pix/pix/compare/v5.274.0...v5.275.0) (2025-12-05)

### :rocket: Amélioration

- [#14343](https://github.com/1024pix/pix/pull/14343) Ajouter les détails des étapes et statuts de participations aux parcours combinés (PIX-20527) 
- [#14325](https://github.com/1024pix/pix/pull/14325) Améliorer l'affichage des informations sur Pix Admin (PIX-20649). 
- [#14330](https://github.com/1024pix/pix/pull/14330) Enlever "tmp" dans les slug des modules (PIX-20663) 
- [#14349](https://github.com/1024pix/pix/pull/14349) modifs retours équipe IA gestionmdp nov 

### :building_construction: Tech

- [#14341](https://github.com/1024pix/pix/pull/14341) Configurer typescript-eslint sur l'audit-logger 
- [#14334](https://github.com/1024pix/pix/pull/14334) Créer la table module_issue_reports (PIX-20490) 
- [#14335](https://github.com/1024pix/pix/pull/14335) Supprimer le FT usePixOrgaNewAuthDesign (PIX-20675) 

### :coffee: Autre

- [#14247](https://github.com/1024pix/pix/pull/14247) Inscription via SSO - association d'un compte existant (PIX-20539) 
- [#14345](https://github.com/1024pix/pix/pull/14345) Modifs module CY_Phishing_NOV apres DoD

# [5.274.0](https://github.com/1024pix/pix/compare/v5.273.0...v5.274.0) (2025-12-04)

### :rocket: Amélioration

- [#14220](https://github.com/1024pix/pix/pull/14220) Ajouter la sélection de SSO sur Pix Orga (PIX-20323) 
- [#14329](https://github.com/1024pix/pix/pull/14329) Ajouter un feature toggle isModulixIssueReportDisplayed (PIX-20489)  
- [#14324](https://github.com/1024pix/pix/pull/14324) Améliorer le créateur de parcours combiné sur Admin (PIX-20654). 
- [#14333](https://github.com/1024pix/pix/pull/14333) FRI Traitement relectures Update CYPhishing_AVA 
- [#14315](https://github.com/1024pix/pix/pull/14315) MDX-32, modification NRDatacenter_NOV avant relecture 
- [#14327](https://github.com/1024pix/pix/pull/14327) MDX-34 NR_Durabilite_IND retours edito 
- [#14340](https://github.com/1024pix/pix/pull/14340) Mettre à jour le bandeau sco avec l'url de la nouvelle doc (PIX-20650) 
- [#14344](https://github.com/1024pix/pix/pull/14344) Modifs module GestionMDP_IND suite relecture JRO 
- [#14332](https://github.com/1024pix/pix/pull/14332) modifs virus nov 
- [#14279](https://github.com/1024pix/pix/pull/14279) Récupération des détails d'une participation d'un parcours combiné (PIX-20526) 
- [#14318](https://github.com/1024pix/pix/pull/14318) Rediriger vers la page de l'orga mère lors de l'annulation de la création d'une orga fille sur Pix Admin (PIX-20560) 

### :building_construction: Tech

- [#14308](https://github.com/1024pix/pix/pull/14308) :recycle: Renomme ce qui tourne autour du kit de supervision pour utiliser le terme `invigilator` (pix-20619) 
- [#14301](https://github.com/1024pix/pix/pull/14301) Améliorer l'idendification des éléments dans generateItems (PIX-19095). 
- [#14326](https://github.com/1024pix/pix/pull/14326) Completer les données de test de parcours combinés (PIX-20613) 
- [#14278](https://github.com/1024pix/pix/pull/14278) Corriger les erreurs de la console de tests Pix Admin 
- [#14337](https://github.com/1024pix/pix/pull/14337) Supprimer le script ModifyBadgeAndTrainingLogoUrlsDomain (PIX-20470). 

### :arrow_up: Montée de version

- [#14307](https://github.com/1024pix/pix/pull/14307) Update dependency @eslint/compat to v2 (api)

# [5.273.0](https://github.com/1024pix/pix/compare/v5.272.0...v5.273.0) (2025-12-03)

### :rocket: Amélioration

- [#14319](https://github.com/1024pix/pix/pull/14319) Ajouter la locale es-419 dans le locale switcher (pix-20627) 
- [#14322](https://github.com/1024pix/pix/pull/14322) Modifier les urls des modules dans la table trainings (PIX-20389) 
- [#14155](https://github.com/1024pix/pix/pull/14155) Supprimer la colonne nb_user de la table organizations_cover_rates (PIX-20110) 
- [#14135](https://github.com/1024pix/pix/pull/14135) Tmp botaniste retours ig 
- [#14298](https://github.com/1024pix/pix/pull/14298) Update IAGenPrompt_IND.json

# [5.272.0](https://github.com/1024pix/pix/compare/v5.271.0...v5.272.0) (2025-12-02)

### :rocket: Amélioration

- [#14304](https://github.com/1024pix/pix/pull/14304) création module cyber virus nov 
- [#14269](https://github.com/1024pix/pix/pull/14269) Déplacer l'historique des profils cibles sous les versions de référentiel de certification pour les Pix+ (PIX-20545) 
- [#14302](https://github.com/1024pix/pix/pull/14302) IAgenLimite_NOV update retours de panels 
- [#14277](https://github.com/1024pix/pix/pull/14277) MDX-32 Integration NR_Datacenter_NOV 
- [#14213](https://github.com/1024pix/pix/pull/14213) Utilisation dans Pix Certif de la table de config des dates de réouverture des espaces Pix Certif SCO (PIX-20405) 

### :bug: Correction

- [#14310](https://github.com/1024pix/pix/pull/14310) La redirection des anciens urls de module en /passage ne fonctionne pas (PIX-20620) 
- [#14312](https://github.com/1024pix/pix/pull/14312) Les liens vers des tutos Youtube ne fonctionnent pas (PIX-20617) 
- [#14286](https://github.com/1024pix/pix/pull/14286) Les mêmes acquis ont été proposés 2 fois au cours d'une même certification Pix transverse (PIX-20605). 

### :building_construction: Tech

- [#14311](https://github.com/1024pix/pix/pull/14311) Ajouter une contrainte not-nullable sur le champ CountryCode de la table organizations (PIX-20348) 
- [#14309](https://github.com/1024pix/pix/pull/14309) Mettre à jour  epreuves component en version 2.2.2. 
- [#14261](https://github.com/1024pix/pix/pull/14261) Permettre au métier d'entrer une URL complète de logo dans le formulaire du contenu formatif sur Pix Admin (PIX-20548). 
- [#14297](https://github.com/1024pix/pix/pull/14297) Remplacer les usages de streams Nodejs par des streams Web dans le Bounded Context LLM (PIX-20422) 

### :arrow_up: Montée de version

- [#14294](https://github.com/1024pix/pix/pull/14294) Update dependency webpack to v5.103.0 (junior)

# [5.271.0](https://github.com/1024pix/pix/compare/v5.270.0...v5.271.0) (2025-12-01)

### :rocket: Amélioration

- [#14253](https://github.com/1024pix/pix/pull/14253) Ajuster le temps d'apparition du bouton suivant dans un stepper horizontal (PIX-20521) 
- [#14295](https://github.com/1024pix/pix/pull/14295) Créer en masse des organisations en leurs spécifiant leurs pays (PIX-20344) 
- [#14296](https://github.com/1024pix/pix/pull/14296) IAGenImpact, correction coquilles 
- [#14305](https://github.com/1024pix/pix/pull/14305) IaInfox_NOV retours de panel 
- [#14255](https://github.com/1024pix/pix/pull/14255) modification images - module IA vous avez dit IA 
- [#14260](https://github.com/1024pix/pix/pull/14260) Modifs mon premier prompt (activite 1 2 et recap) 
- [#14306](https://github.com/1024pix/pix/pull/14306) Update IagenBiais_NOV retours de panel 
- [#14262](https://github.com/1024pix/pix/pull/14262) Utiliser  `oganizationLearnerId` au lieu du `userId` pour récupérer les données d'un parcours prescrit (Pix-20576). 
- [#14154](https://github.com/1024pix/pix/pull/14154) Utiliser la nouvelle colonne passage_count pour le calcul du taux de couverture 

### :bug: Correction

- [#14292](https://github.com/1024pix/pix/pull/14292) ne pas remonter tout les learners d'une orga lors de la suppression de learner (PIX-20609)" 

### :building_construction: Tech

- [#14249](https://github.com/1024pix/pix/pull/14249) :recycle: Renomme les constantes appelées `supervisor` pour utiliser `invigilator` (PIX-20573) 
- [#14300](https://github.com/1024pix/pix/pull/14300) Ajouter le shortId dans le script listant les modules pour la réplication BDD (PIX-20468). 
- [#14287](https://github.com/1024pix/pix/pull/14287) mettre à jour  epreuve-component 
- [#14271](https://github.com/1024pix/pix/pull/14271) Réaliser un script pour changer le domaine des urls de badges et de logos en BDD (PIX-20463). 

### :arrow_up: Montée de version

- [#14288](https://github.com/1024pix/pix/pull/14288) Update dependency @1024pix/epreuves-components to ^2.2.1 (junior) 
- [#14289](https://github.com/1024pix/pix/pull/14289) Update dependency @1024pix/epreuves-components to ^2.2.1 (mon-pix) 
- [#14290](https://github.com/1024pix/pix/pull/14290) Update dependency @1024pix/pix-ui to ^55.32.2 (junior) 
- [#14291](https://github.com/1024pix/pix/pull/14291) Update dependency @1024pix/pix-ui to ^55.32.2 (orga) 
- [#14257](https://github.com/1024pix/pix/pull/14257) Update nginx Docker tag to v1.29.3

# [5.270.0](https://github.com/1024pix/pix/compare/v5.269.0...v5.270.0) (2025-11-28)

### :rocket: Amélioration

- [#14264](https://github.com/1024pix/pix/pull/14264) Modifier en masse les pays des organisations (PIX-20343) 

### :arrow_up: Montée de version

- [#14285](https://github.com/1024pix/pix/pull/14285) Update dependency @1024pix/epreuves-components to ^2.2.0 (junior)

# [5.269.0](https://github.com/1024pix/pix/compare/v5.268.0...v5.269.0) (2025-11-28)

### :rocket: Amélioration

- [#14197](https://github.com/1024pix/pix/pull/14197) IAGenEthique_NOV integration images 
- [#14265](https://github.com/1024pix/pix/pull/14265) Permettre de sélectionner un pays lors de la création d'orga (PIX-20298) 
- [#14258](https://github.com/1024pix/pix/pull/14258) Renvoyer le shortId sur les apis internes recommended-modules-api (PIX-20387) 

### :rewind: Retour en arrière

- [#14282](https://github.com/1024pix/pix/pull/14282) Revert "[TECH] Utilisation d'un `CalibratedChallenge` dans la récupération d'un challenge (PIX-17946)."

### :building_construction: Tech

- [#14272](https://github.com/1024pix/pix/pull/14272) Supprimer ember-cli-clipboard de PixAdmin 

### :arrow_up: Montée de version

- [#14219](https://github.com/1024pix/pix/pull/14219) Update adobe/s3mock Docker tag to v4.10.0 (.circleci) 
- [#14276](https://github.com/1024pix/pix/pull/14276) Update adobe/s3mock Docker tag to v4.10.0 (docker) 
- [#14280](https://github.com/1024pix/pix/pull/14280) Update adobe/s3mock Docker tag to v4.10.0 (dossier racine) 
- [#14061](https://github.com/1024pix/pix/pull/14061) Update dependency @1024pix/ember-testing-library to ^3.0.25 (mon-pix) 
- [#14281](https://github.com/1024pix/pix/pull/14281) Update dependency @1024pix/pix-ui to ^55.32.2 (admin) 
- [#14283](https://github.com/1024pix/pix/pull/14283) Update dependency @1024pix/pix-ui to ^55.32.2 (certif)

# [5.268.0](https://github.com/1024pix/pix/compare/v5.267.0...v5.268.0) (2025-11-27)

### :rocket: Amélioration

- [#14238](https://github.com/1024pix/pix/pull/14238) Ajouter le nouveau format /modules/:shortId/:slug (PIX-20385) 
- [#14245](https://github.com/1024pix/pix/pull/14245) Ajouter les paliers et résultats thématiques aux participations MADDO (PIX-19098) 
- [#14166](https://github.com/1024pix/pix/pull/14166) Création de l'interface utilisateur de config des dates de réouverture des espaces Pix Certif SCO (PIX-20404) 
- [#14246](https://github.com/1024pix/pix/pull/14246) Prendre en compte le pays (via son code INSEE) lors de la création d'une organisation (PIX-20297) 

### :bug: Correction

- [#14273](https://github.com/1024pix/pix/pull/14273) Garder la configuration des attestations lors de la mise à jour d'une Organisation (PIX-20591). 

### :building_construction: Tech

- [#14275](https://github.com/1024pix/pix/pull/14275) Supprimer le script d'ajout des shortId aux modules (PIX-20475) 
- [#14259](https://github.com/1024pix/pix/pull/14259) Utiliser les nouvelles URLs de modules dans les contenus formatifs des seeds (PIX-20388)

# [5.267.0](https://github.com/1024pix/pix/compare/v5.266.0...v5.267.0) (2025-11-27)

### :rocket: Amélioration

- [#14268](https://github.com/1024pix/pix/pull/14268) Afficher deux nouvelles colonnes dans le tableau d'historique de versions (PIX-20546) 
- [#14256](https://github.com/1024pix/pix/pull/14256) Ajouter un encart d'info pour l'email de convocation (PIX-6278). 
- [#14251](https://github.com/1024pix/pix/pull/14251) Mentionner l'oralisation dans la modale d'édition du candidat (PIX-20572). 
- [#14263](https://github.com/1024pix/pix/pull/14263) Mise à jour des liens comparia MDX-45 
- [#14270](https://github.com/1024pix/pix/pull/14270) Modifications IAGenBiaisAva MDX-17 

### :bug: Correction

- [#14254](https://github.com/1024pix/pix/pull/14254) Erreur de transaction sur la neutralisation / deneutralisation (PIX-20543). 

### :building_construction: Tech

- [#14248](https://github.com/1024pix/pix/pull/14248) Simplifier les entités `Chat` et `Message` (PIX-20440)

# [5.266.0](https://github.com/1024pix/pix/compare/v5.265.0...v5.266.0) (2025-11-26)

### :rocket: Amélioration

- [#14131](https://github.com/1024pix/pix/pull/14131) Création de l'API de config des dates de réouverture des espaces Pix Certif SCO (PIX-20547) 
- [#14252](https://github.com/1024pix/pix/pull/14252) CY_gestionMDP_IND retours 
- [#14239](https://github.com/1024pix/pix/pull/14239) Permettre de filtrer les participations aux parcours combinés sur les divisions / groups de l'organisation (Pix-20128). 
- [#14243](https://github.com/1024pix/pix/pull/14243) Permettre de sélectionner un pays lors de la modification d'une orga (PIX-20295) 

### :bug: Correction

- [#14242](https://github.com/1024pix/pix/pull/14242) Corriger l'erreur de typographie sur la page de chargement des contenu formatifs (PIX-20555). 
- [#14244](https://github.com/1024pix/pix/pull/14244) Les images vectorielles doivent prendre toute la place du conteneur dans les modules (PIX-20554) 

### :building_construction: Tech

- [#14198](https://github.com/1024pix/pix/pull/14198) :recycle: Utilise le terme `invigilator` plutôt que `supervisor` dans le repo `supervisor-access-repository` (PIX-20481) 
- [#14225](https://github.com/1024pix/pix/pull/14225) Mise à jour epreuves-components 
- [#14240](https://github.com/1024pix/pix/pull/14240) Suppression de bouts de code obsolètes dans les mécanismes d’authentification (PIX-20549) 
- [#14200](https://github.com/1024pix/pix/pull/14200) Utilisation d'un `CalibratedChallenge` dans la récupération d'un challenge (PIX-17946). 

### :arrow_up: Montée de version

- [#14241](https://github.com/1024pix/pix/pull/14241) Update dependency @1024pix/pix-ui to ^55.32.2 (mon-pix)

# [5.265.0](https://github.com/1024pix/pix/compare/v5.264.0...v5.265.0) (2025-11-25)

### :rocket: Amélioration

- [#14185](https://github.com/1024pix/pix/pull/14185)  Ajouter un validateur pour le modèle CombinedCourseTemplate (PIX-20014) 
- [#14237](https://github.com/1024pix/pix/pull/14237) ajout POI dans mdoule CY-gestionMDP-ind 
- [#14231](https://github.com/1024pix/pix/pull/14231) Ajouter de la validation sur l'import de feature dans PixAdmin (Pix-20523). 
- [#14230](https://github.com/1024pix/pix/pull/14230) Correction "serveurs" 
- [#14222](https://github.com/1024pix/pix/pull/14222) Déplacer le détail d'une certification dans la partie Sessions (PIX-20509). 
- [#14175](https://github.com/1024pix/pix/pull/14175) Enregistrer le connectionMethodCode comme IdentityProvider quand un utilisateur se connecte (PIX-20399) 
- [#14228](https://github.com/1024pix/pix/pull/14228) Permettre de vider le champs "crédits" d'une orga sur Pix Admin (PIX-20453) 

### :bug: Correction

- [#14184](https://github.com/1024pix/pix/pull/14184) Corriger affichage barre de navigation en Mobile et avec bannière (PIX-20469) 

### :building_construction: Tech

- [#14207](https://github.com/1024pix/pix/pull/14207) :recycle: Renomme le cas d'utilsation `end-assessment-by-supervisor` pour utiliser `invigilator` (PIX-20507) 
- [#14236](https://github.com/1024pix/pix/pull/14236) Linter tous les fichiers de traduction de Pix Certif

# [5.264.0](https://github.com/1024pix/pix/compare/v5.263.0...v5.264.0) (2025-11-24)

### :rocket: Amélioration

- [#14235](https://github.com/1024pix/pix/pull/14235) : créa module CY_gestionMDP_IND 
- [#14193](https://github.com/1024pix/pix/pull/14193) Ajouter la route GET /api/modules/v2/shortId (PIX-20384) 
- [#14226](https://github.com/1024pix/pix/pull/14226) Créer une table de configuration des dates de réouverture en BDD (PIX-20403) 
- [#14229](https://github.com/1024pix/pix/pull/14229) modif relecture eval 
- [#14221](https://github.com/1024pix/pix/pull/14221) Modulix Biais ind - modif image graphique Biographie femmes wiki 
- [#14232](https://github.com/1024pix/pix/pull/14232) NRDurabilite_IND retours team CYB 

### :bug: Correction

- [#14227](https://github.com/1024pix/pix/pull/14227) Les images plus petites que la largeur d'un module sont agrandies (PIX-20515) 
- [#14233](https://github.com/1024pix/pix/pull/14233) Linter tous les fichiers de traduction de Pix App 

### :building_construction: Tech

- [#14182](https://github.com/1024pix/pix/pull/14182) :truck: Déplace la dernière route à propos de profils cible dans le cadre de configuration des certifications complémentaires (pix-20495) 
- [#14216](https://github.com/1024pix/pix/pull/14216) Modifier le domaine des contenus des modules (PIX-20514). 
- [#14208](https://github.com/1024pix/pix/pull/14208) Modifier le domaine des illustrations des cartes de formation sur Pix App (PIX-20461). 
- [#14223](https://github.com/1024pix/pix/pull/14223) Renommage d'éléments relatifs aux référentiels de certification (PIX-20501) 
- [#14211](https://github.com/1024pix/pix/pull/14211) Retourner le shortId dans l'api interne getModuleStatuses dans l'API (PIX-20386). 

### :arrow_up: Montée de version

- [#14234](https://github.com/1024pix/pix/pull/14234) Update dependency redis to v7.2.11

# [5.263.0](https://github.com/1024pix/pix/compare/v5.262.0...v5.263.0) (2025-11-21)

### :rocket: Amélioration

- [#14202](https://github.com/1024pix/pix/pull/14202) Ajout des traductions manquantes pour les attestations (PIX-20478) 
- [#14164](https://github.com/1024pix/pix/pull/14164) Améliorer la gestion des erreurs API de l'auth PixOrga (PIX-20393) 
- [#14203](https://github.com/1024pix/pix/pull/14203) Améliorer le style du bouton d'oralisation des épreuves (PIX-20473). 
- [#14209](https://github.com/1024pix/pix/pull/14209) Supporter les url relative de fin de campagne (PIX-19548) 

### :bug: Correction

- [#14196](https://github.com/1024pix/pix/pull/14196)  Affichage buggé sur les solutions à afficher.  (PIX-20480) 
- [#14205](https://github.com/1024pix/pix/pull/14205) Afficher le titre du palier atteint sur la page de résultat d'une campagne (PIX-19855). 
- [#14204](https://github.com/1024pix/pix/pull/14204) Erreur Ember à l'affichage d'une page user dans PixAdmin (PIX-19901) 

### :building_construction: Tech

- [#14201](https://github.com/1024pix/pix/pull/14201) :recycle: Renomme supervisor dans `session-supervisor-authorization.js` par invigilator (PIX-20483)  
- [#14194](https://github.com/1024pix/pix/pull/14194) Modifier le domaine des seeds (PIX-20462). 
- [#14176](https://github.com/1024pix/pix/pull/14176) Simplifier les fonctions de récupération des parcours combinés (PIX-20442) 

### :arrow_up: Montée de version

- [#14157](https://github.com/1024pix/pix/pull/14157) Update dependency @1024pix/oppsy to ^1.0.2 (api) 
- [#14212](https://github.com/1024pix/pix/pull/14212) Update dependency @1024pix/pix-ui to ^55.31.2 (admin) 
- [#14214](https://github.com/1024pix/pix/pull/14214) Update dependency @1024pix/pix-ui to ^55.31.2 (certif) 
- [#14215](https://github.com/1024pix/pix/pull/14215) Update dependency @1024pix/pix-ui to ^55.31.2 (junior) 
- [#14217](https://github.com/1024pix/pix/pull/14217) Update dependency @1024pix/pix-ui to ^55.31.2 (mon-pix) 
- [#14218](https://github.com/1024pix/pix/pull/14218) Update dependency @1024pix/pix-ui to ^55.31.2 (orga)

# [5.262.0](https://github.com/1024pix/pix/compare/v5.261.0...v5.262.0) (2025-11-20)

### :rocket: Amélioration

- [#14188](https://github.com/1024pix/pix/pull/14188) Permettre au prescripteur de voir une liste de suivi en fonction de l'attestation séléctionné (Pix-20240). 
- [#14192](https://github.com/1024pix/pix/pull/14192) Permettre de connaitre l'état de la fonctionnalité `CAMPAIGN_WITHOUT_USER_PROFILE` sur une organisation dans PixAdmin (PIX-20476).

# [5.261.0](https://github.com/1024pix/pix/compare/v5.260.0...v5.261.0) (2025-11-20)

### :rocket: Amélioration

- [#14186](https://github.com/1024pix/pix/pull/14186) Enregistrer le code pays lors de la modification d'une orga (PIX-20294) 
- [#14138](https://github.com/1024pix/pix/pull/14138) Repliquer la nouvelle colonne passage_count de la table organizations_cover_rates (PIX-20110) 

### :bug: Correction

- [#14199](https://github.com/1024pix/pix/pull/14199) Appeler le job pour synchroniser les passages lorsque le userId n'est pas null (PIX-20482). 

### :building_construction: Tech

- [#14183](https://github.com/1024pix/pix/pull/14183) Afficher un message d'erreur plus explicite pour un utilisateur ayant un problème d'accès à une campagne (Pix-20052). 
- [#14195](https://github.com/1024pix/pix/pull/14195) Éviter les warnings "mixed-decls" de Sass 

### :coffee: Autre

# [5.260.0](https://github.com/1024pix/pix/compare/v5.259.0...v5.260.0) (2025-11-19)

### :rocket: Amélioration

- [#14189](https://github.com/1024pix/pix/pull/14189) : Modifs module GestionMDP_Nov 
- [#14174](https://github.com/1024pix/pix/pull/14174) Ajouter un champ shortId aux modules (PIX-20382) 
- [#13980](https://github.com/1024pix/pix/pull/13980) IaGenEthique_NOV retour Jennifer, Nicolas et PYO 
- [#14145](https://github.com/1024pix/pix/pull/14145) Integration NR_Durabilite_IND 
- [#14190](https://github.com/1024pix/pix/pull/14190) modifs module MDP Nov suite relectures 

### :building_construction: Tech

- [#14179](https://github.com/1024pix/pix/pull/14179) :truck: Supprime l'API interne du cas d'utilisation `getById` d'une certification complémentaire (pix-20480) 
- [#14181](https://github.com/1024pix/pix/pull/14181) Modifier l'url listant les logos des contenu formatif sur Pix Admin (PIX-20455).

# [5.259.0](https://github.com/1024pix/pix/compare/v5.258.0...v5.259.0) (2025-11-18)

### :rocket: Amélioration

- [#14177](https://github.com/1024pix/pix/pull/14177) Ajuster la couleur du texte des boutons disabled dans la barre de navigation de modulix (PIX-20450) 
- [#14097](https://github.com/1024pix/pix/pull/14097) création IAGenBIAIS_AVA.json 
- [#14180](https://github.com/1024pix/pix/pull/14180) IaGenImpact retours IGESR 
- [#14152](https://github.com/1024pix/pix/pull/14152) Mettre à jour les parcours combiné une fois un module terminé (PIX-19693) 
- [#14143](https://github.com/1024pix/pix/pull/14143) Page de détails d'une participation à un parcours (PIX-20270) 
- [#14065](https://github.com/1024pix/pix/pull/14065) Redirige l'utilisateur vers le lien configuré sur la campagne quand il quitte l'évaluation (PIX-20226) 
- [#14134](https://github.com/1024pix/pix/pull/14134) Utilisations des configurations de score de `certification_versions` (PIX-20368). 

### :bug: Correction

- [#14178](https://github.com/1024pix/pix/pull/14178) Donner les bons liens anglais de documentation (PIX-20441). 

### :building_construction: Tech

- [#14161](https://github.com/1024pix/pix/pull/14161) :broom: Réduit la « densité informationnelle » (PIX-5750) 
- [#14170](https://github.com/1024pix/pix/pull/14170) Supprimer la méthode "getByLabel" de complementaryCertificationRepository (PIX-18053). 

### :coffee: Autre

# [5.258.0](https://github.com/1024pix/pix/compare/v5.257.0...v5.258.0) (2025-11-17)

### :rocket: Amélioration

- [#14148](https://github.com/1024pix/pix/pull/14148) :lipstick: Expliciter le traitement immédiat des signalements par le surveillant dans l'ES (PIX-16647) 
- [#14153](https://github.com/1024pix/pix/pull/14153) Afficher la classe ou le groupe des participations aux parcours combinés (PIX-19969) 
- [#14168](https://github.com/1024pix/pix/pull/14168) Afficher le besoin d'a11y dans la modale de détail d'un candidat (PIX-13681). 
- [#14141](https://github.com/1024pix/pix/pull/14141) Ajouter l'oralisation dans les épreuves de certif (PIX-20377). 
- [#14169](https://github.com/1024pix/pix/pull/14169) Ajouter un feature toggle areModuleShortIdUrlsEnabled (PIX-20381) 
- [#14151](https://github.com/1024pix/pix/pull/14151) Amélioration du responsive sur l'écran de présentation du parcours combiné (PIX-20327) 
- [#14046](https://github.com/1024pix/pix/pull/14046) Filtrer les OIDC providers filtrés par app sur Pix App et Pix Admin (PIX-19809) 
- [#14165](https://github.com/1024pix/pix/pull/14165) modif relecture gestionmdp nov 
- [#14129](https://github.com/1024pix/pix/pull/14129) Permettre au support de supprimer les prescrit lié aux utilisateurs (Pix-20225) 

### :bug: Correction

- [#14156](https://github.com/1024pix/pix/pull/14156) Corriger le focusAndScroll en Mobile (PIX-20402) 
- [#14159](https://github.com/1024pix/pix/pull/14159) Corriger le problème du formulaire de récupération d'espace Pix Orga lorsqu’il est soumis par clavier (PIX-20420) 

### :building_construction: Tech

- [#14160](https://github.com/1024pix/pix/pull/14160) Activer usePixOrgaNewAuthDesign sur les review apps 
- [#14167](https://github.com/1024pix/pix/pull/14167) Optimiser le téléchargement des exports de campagnes Evaluation / Exam (PIX-20438). 
- [#14173](https://github.com/1024pix/pix/pull/14173) Rendre facile l’utilisation des variables d’environnement DOMAIN_PIX*** (DOMAIN_PIX_CERTIF, etc.) rapport aux tests 
- [#14163](https://github.com/1024pix/pix/pull/14163) Supprimer le feature toggle isModulixNavEnabled (PIX-20352)(PIX-20034) 

### :coffee: Autre

# [5.257.0](https://github.com/1024pix/pix/compare/v5.256.0...v5.257.0) (2025-11-14)

### :rocket: Amélioration

- [#14146](https://github.com/1024pix/pix/pull/14146) Afficher le nombre de centres de certification dans l'onglet de navigation (PIX-20004) 
- [#14125](https://github.com/1024pix/pix/pull/14125) Afficher le pays dans la page de détail d'une organisation (PIX-20137) 
- [#14137](https://github.com/1024pix/pix/pull/14137) Ajouter un job lorsqu'un module est terminé (pix-19076) 
- [#14147](https://github.com/1024pix/pix/pull/14147) Ajouter une contrainte d'unicité sur module pour la table organization-learner-participation (pix-20406) 
- [#14122](https://github.com/1024pix/pix/pull/14122) Appeler /oidc/identity-providers pour récupérer les OIDC providers sur Pix Orga (PIX-20322) 
- [#14124](https://github.com/1024pix/pix/pull/14124) Cacher l'édition d'un candidat si le scope n'est pas accessible (PIX-20360). 
- [#14118](https://github.com/1024pix/pix/pull/14118) Remonter coté back le nom du pays dans la route de détail d'une orga (PIx-20136) 
- [#14121](https://github.com/1024pix/pix/pull/14121) Supprimer la jauge de progression (PIX-20107) 
- [#14140](https://github.com/1024pix/pix/pull/14140) Traiter les retours design sur la barre de navigation des modules (PIX-20375) 
- [#14162](https://github.com/1024pix/pix/pull/14162) Update CYPhishing_IND.json 

### :bug: Correction

- [#14142](https://github.com/1024pix/pix/pull/14142) Permettre le téléchargement de résultat d'une collecte de profil lorsqu'un utilisateur a demandé à anonymiser son compte (PIX-20401). 
- [#14149](https://github.com/1024pix/pix/pull/14149) Stepper horizontal - Ne pas afficher le bouton "Suivant" dans les steps précédentes (PIX-19973) 

### :building_construction: Tech

- [#14120](https://github.com/1024pix/pix/pull/14120) Nettoyage de trois colonnes deprecated dans certification-frameworks-challenges (PIX-20131). 

### :arrow_up: Montée de version

- [#14088](https://github.com/1024pix/pix/pull/14088) Update dependency eslint-plugin-unicorn to v61 (dossier racine)

# [5.256.0](https://github.com/1024pix/pix/compare/v5.255.0...v5.256.0) (2025-11-13)

### :rocket: Amélioration

- [#14136](https://github.com/1024pix/pix/pull/14136) Ajouter une nouvelle colonne passage_count à la table organizations_cover_rates (PIX-20110) 
- [#14144](https://github.com/1024pix/pix/pull/14144) création module gestion mdp nov 
- [#14102](https://github.com/1024pix/pix/pull/14102) Créer un nouveau formulaire d'inscription (PIX-19803) 
- [#14139](https://github.com/1024pix/pix/pull/14139) CY_phishing_AVA changement URL audio 
- [#14115](https://github.com/1024pix/pix/pull/14115) Envoyer les évènements Plausible dans l'élément ShortVideo (PIX-20365) 

### :bug: Correction

- [#14133](https://github.com/1024pix/pix/pull/14133) Afficher que l'on est dans la parties campagne lorsque l'on visite le parcours apparenant (PIX-20269). 

### :building_construction: Tech

- [#14119](https://github.com/1024pix/pix/pull/14119) Ajout d'un index pour chercher les challenges de certification (PIX-20244). 
- [#14123](https://github.com/1024pix/pix/pull/14123) Supprimer les tests unitaires des composants modules et Training card (PIX-20311)

# [5.255.0](https://github.com/1024pix/pix/compare/v5.254.0...v5.255.0) (2025-11-12)

### :rocket: Amélioration

- [#14130](https://github.com/1024pix/pix/pull/14130) Create tmp-anatomie-message-arnaque.json 
- [#14132](https://github.com/1024pix/pix/pull/14132) modifs-relecture-cyber 

### :building_construction: Tech

- [#14126](https://github.com/1024pix/pix/pull/14126) Remplacer dayjs/ember-dayjs par ember-intl sur Pix Admin

# [5.254.0](https://github.com/1024pix/pix/compare/v5.253.1...v5.254.0) (2025-11-11)

### :rocket: Amélioration

- [#14056](https://github.com/1024pix/pix/pull/14056) Ajout des paliers sur la page de diagnostic Combinix (PIX-20274) 
- [#14095](https://github.com/1024pix/pix/pull/14095) Renforcer l'accessibilité sur la navigation (PIX-20265). 

### :building_construction: Tech

- [#14091](https://github.com/1024pix/pix/pull/14091) Remplacer ember-cli-mirage par miragejs sur Pix Admin

## [5.253.1](https://github.com/1024pix/pix/compare/v5.253.0...v5.253.1) (2025-11-10)

### :building_construction: Tech

- [#14101](https://github.com/1024pix/pix/pull/14101) Mise à jour des dépendances de Pix Admin

# [5.253.0](https://github.com/1024pix/pix/compare/v5.252.0...v5.253.0) (2025-11-07)

### :rocket: Amélioration

- [#13891](https://github.com/1024pix/pix/pull/13891) Bloquer l'accès au portail surveillant pour les centres SCO pendant leur fermeture annuelle (PIX-19390) 
- [#14111](https://github.com/1024pix/pix/pull/14111) Images carrousel svg vers png 
- [#14066](https://github.com/1024pix/pix/pull/14066) Mettre à jour la conf de Pix coeur via Admin (PIX-20189). 
- [#14116](https://github.com/1024pix/pix/pull/14116) Modification des durées de certification Pix+ Pro Santé et Pix+ Droit (PIX-20358) 
- [#14092](https://github.com/1024pix/pix/pull/14092) Passer par les versions de certifications pour le scoring des certifs V3 (PIX-20275). 
- [#14110](https://github.com/1024pix/pix/pull/14110) Renseigner les champs `challengeId`, `assessmentId`, `moduleId` et `passageId` dans la table `chats` (PIX-20357) 

### :building_construction: Tech

- [#14059](https://github.com/1024pix/pix/pull/14059) :truck: Déplace des tests dans le contexte `school` 
- [#14114](https://github.com/1024pix/pix/pull/14114) Autoriser les utm dans l'url à l'atterrissage sur les lien de campagne direct (PIX-20366). 
- [#14053](https://github.com/1024pix/pix/pull/14053) Creation de referentiel de certification dans les seeds (PIX-20099).

# [5.252.0](https://github.com/1024pix/pix/compare/v5.251.0...v5.252.0) (2025-11-07)

### :rocket: Amélioration

- [#14035](https://github.com/1024pix/pix/pull/14035) #IAGenFonction_IND - Retours IG  + vers version light 
- [#14090](https://github.com/1024pix/pix/pull/14090) Ajouter le nouvel élement short video au front (PIX-20278) 
- [#14112](https://github.com/1024pix/pix/pull/14112) changement format récap Module phishing nov 
- [#14107](https://github.com/1024pix/pix/pull/14107) Enregistrer les traces d'apprentissage pour l'élément ShortVideo (PIX-20287) 
- [#14113](https://github.com/1024pix/pix/pull/14113) IAGenImpact_NOV média carrousel 
- [#14106](https://github.com/1024pix/pix/pull/14106) modif moduyle MDP nov suite relecture Franck 
- [#14069](https://github.com/1024pix/pix/pull/14069) Modifications suite retour edito 
- [#14109](https://github.com/1024pix/pix/pull/14109) Modifs module Phishing AVA 
- [#14100](https://github.com/1024pix/pix/pull/14100) Pouvoir supprimer les filtres sur la page de recherche d'organisations (PIX-20025) 
- [#14105](https://github.com/1024pix/pix/pull/14105) Premiere version du module produit par canope 

### :bug: Correction

- [#14094](https://github.com/1024pix/pix/pull/14094) Affichage Pix Admin : récupérer les challenges avec la locale et non la langue (PIX-20333). 

### :building_construction: Tech

- [#14070](https://github.com/1024pix/pix/pull/14070) :truck: Déplace une série de tests unitaires du répertoire générique vers le répertoire du contexte `devcomp` 
- [#14103](https://github.com/1024pix/pix/pull/14103) Ajouter une fonction pour lister, au bon format, les modules (slug et id) pour Metabase (PIX-20356) 
- [#14099](https://github.com/1024pix/pix/pull/14099) Déplacer la route country dans le contexte shared 

### :arrow_up: Montée de version

- [#14104](https://github.com/1024pix/pix/pull/14104) Update dependency @1024pix/pix-ui to ^55.31.1 (mon-pix)

# [5.251.0](https://github.com/1024pix/pix/compare/v5.250.0...v5.251.0) (2025-11-06)

### :rocket: Amélioration

- [#14050](https://github.com/1024pix/pix/pull/14050) Ajouter la pagination aux parcours combinés (PIX-19815) 

### :building_construction: Tech

- [#14098](https://github.com/1024pix/pix/pull/14098) Ne plus utiliser l'historySize de la configuration LLM (PIX-20338) 
- [#14089](https://github.com/1024pix/pix/pull/14089) Refactorise les seeds de parcours combinés avec des fixtures (PIX-19815)

# [5.250.0](https://github.com/1024pix/pix/compare/v5.249.0...v5.250.0) (2025-11-06)

### :rocket: Amélioration

- [#14067](https://github.com/1024pix/pix/pull/14067) Ajouter la possibilité de télécharger des templates de csv sur PixAdmin (PIX-20330) 
- [#14083](https://github.com/1024pix/pix/pull/14083) IAGenImpact_NOV changement media 
- [#14080](https://github.com/1024pix/pix/pull/14080) Permettre d'identifier des campagnes / module / parcours dans plausible (PIX-20318) 

### :bug: Correction

- [#14096](https://github.com/1024pix/pix/pull/14096) Réparer le generateItems (PIX-20336) 

### :building_construction: Tech

- [#14093](https://github.com/1024pix/pix/pull/14093) Mettre à jour epreuve component 

### :arrow_up: Montée de version

- [#14086](https://github.com/1024pix/pix/pull/14086) Update dependency @1024pix/pix-ui to ^55.31.0 (orga) 
- [#14087](https://github.com/1024pix/pix/pull/14087) Update dependency @types/node to v24 (e2e-playwright)

# [5.249.0](https://github.com/1024pix/pix/compare/v5.248.0...v5.249.0) (2025-11-05)

### :rocket: Amélioration

- [#14071](https://github.com/1024pix/pix/pull/14071) ajout imgs définitives module CY_Phishing_Nov 
- [#14043](https://github.com/1024pix/pix/pull/14043) Ajouter des PixMetrics à chaque clic sur un bouton de la navigation (PIX-20106). 
- [#14063](https://github.com/1024pix/pix/pull/14063) Ajouter une colonne "countryCode" sur la table organizations (PIX-20134) 
- [#14044](https://github.com/1024pix/pix/pull/14044) Conditionner l'affichage de la colonne Campagnes et Modules d'un parcours combiné (PIX-20112)  
- [#14051](https://github.com/1024pix/pix/pull/14051) Créer une nouvelle modalité Vidéo Courte (PIX-20277) 
- [#14079](https://github.com/1024pix/pix/pull/14079) modifs module CY_phishing_AVA suite relectures 
- [#14052](https://github.com/1024pix/pix/pull/14052) Permettre de se déplacer sur une section au clic sur les boutons de la nav (PIX-20268). 

### :bug: Correction

- [#14062](https://github.com/1024pix/pix/pull/14062) Récupérer l'URL localisée du lien "Comment se certifier ?"  (PIX-20304). 

### :building_construction: Tech

- [#13850](https://github.com/1024pix/pix/pull/13850) Suppression du système de blocage général d'accès à Pix Certif  (PIX-19951) 

### :arrow_up: Montée de version

- [#14072](https://github.com/1024pix/pix/pull/14072) Update dependency @1024pix/ember-testing-library to ^3.0.25 (orga) 
- [#14073](https://github.com/1024pix/pix/pull/14073) Update dependency @1024pix/eslint-plugin to ^2.1.14 (api) 
- [#14074](https://github.com/1024pix/pix/pull/14074) Update dependency @1024pix/eslint-plugin to ^2.1.14 (audit-logger) 
- [#14075](https://github.com/1024pix/pix/pull/14075) Update dependency @1024pix/eslint-plugin to ^2.1.14 (certif) 
- [#14076](https://github.com/1024pix/pix/pull/14076) Update dependency @1024pix/eslint-plugin to ^2.1.14 (dossier racine) 
- [#14077](https://github.com/1024pix/pix/pull/14077) Update dependency @1024pix/eslint-plugin to ^2.1.14 (e2e-playwright) 
- [#14078](https://github.com/1024pix/pix/pull/14078) Update dependency @1024pix/eslint-plugin to ^2.1.14 (junior) 
- [#14081](https://github.com/1024pix/pix/pull/14081) Update dependency @1024pix/eslint-plugin to ^2.1.14 (mon-pix) 
- [#14082](https://github.com/1024pix/pix/pull/14082) Update dependency @1024pix/eslint-plugin to ^2.1.14 (orga) 
- [#14027](https://github.com/1024pix/pix/pull/14027) Update dependency @1024pix/pix-ui to ^55.31.0 (admin) 
- [#14084](https://github.com/1024pix/pix/pull/14084) Update dependency @1024pix/pix-ui to ^55.31.0 (certif) 
- [#14085](https://github.com/1024pix/pix/pull/14085) Update dependency @1024pix/pix-ui to ^55.31.0 (junior)

# [5.248.0](https://github.com/1024pix/pix/compare/v5.247.0...v5.248.0) (2025-11-04)

### :rocket: Amélioration

- [#14040](https://github.com/1024pix/pix/pull/14040) Afficher un bouton de création d'orga fille depuis la page d'une orga mère (PIX-20049) 
- [#14038](https://github.com/1024pix/pix/pull/14038) Ajout des tooltips sur les boutons de la nouvelle navigation (PIX-20146). 
- [#14055](https://github.com/1024pix/pix/pull/14055) Ajouter l'id de l'orga mère lors de la création en masse (PIX-20063) 
- [#14048](https://github.com/1024pix/pix/pull/14048) Empêcher le scoring et la publication d'une certification Pix+ (PIX-20152). 
- [#14049](https://github.com/1024pix/pix/pull/14049) Rendre plus robuste la récupération des métadonnées des images (PIX-20227) 

### :building_construction: Tech

- [#14020](https://github.com/1024pix/pix/pull/14020) :truck: Déplace la route `attach target profile` dans le contexte de `certification/configuration` (PIX-20299) 
- [#14054](https://github.com/1024pix/pix/pull/14054) :truck: Déplace le test unitaire de `FinalizedSession` dans le contexte `certification/session-management` (PIX-20300) 
- [#14030](https://github.com/1024pix/pix/pull/14030) Utiliser des methodes du model pour fournir les champs à mettre à jour sur les parcours combiné (PIX-20261). 

### :arrow_up: Montée de version

- [#14057](https://github.com/1024pix/pix/pull/14057) Update dependency @1024pix/ember-testing-library to ^3.0.25 (admin) 
- [#14058](https://github.com/1024pix/pix/pull/14058) Update dependency @1024pix/ember-testing-library to ^3.0.25 (certif) 
- [#14060](https://github.com/1024pix/pix/pull/14060) Update dependency @1024pix/ember-testing-library to ^3.0.25 (junior)

# [5.247.0](https://github.com/1024pix/pix/compare/v5.246.0...v5.247.0) (2025-11-03)

### :rocket: Amélioration

- [#14041](https://github.com/1024pix/pix/pull/14041) Afficher le score de la campagne dans la page présentation du parcours (PIX-20060). 
- [#14031](https://github.com/1024pix/pix/pull/14031) Ajouter une page de loader apres un diagnostic (PIX-18349)  
- [#14009](https://github.com/1024pix/pix/pull/14009) WIP IAinfox_NOV-versionlight 

### :building_construction: Tech

- [#14045](https://github.com/1024pix/pix/pull/14045) Corriger un test flaky sur le détachement d'orga fille (PIX-20271) 
- [#14047](https://github.com/1024pix/pix/pull/14047) Permettre au bouton continuer sur la page des modules de rediriger vers l'application en utilisant le router interne (PIX-20273). 
- [#14039](https://github.com/1024pix/pix/pull/14039) Retirer la quote lors de la génération du JSON lorsque l'on utilise l'id du profile cible (PIX-20013).

# [5.246.0](https://github.com/1024pix/pix/compare/v5.245.0...v5.246.0) (2025-10-31)

### :rocket: Amélioration

- [#14025](https://github.com/1024pix/pix/pull/14025) Gestion de la progression sur la nouvelle navigation coté module (PIX-20105). 
- [#13963](https://github.com/1024pix/pix/pull/13963) IAGenImpact_NOV modification suite panel + retours IG 
- [#14036](https://github.com/1024pix/pix/pull/14036) Modification d'un lien URL afin qu'il pointe vers le contenu en NL (PIX-20178) 
- [#13936](https://github.com/1024pix/pix/pull/13936) Tmp retours ig module biais ind 
- [#14021](https://github.com/1024pix/pix/pull/14021) Trier la liste des parcours apprenants par date de création (PIX-20015) 
- [#14037](https://github.com/1024pix/pix/pull/14037) Update IADefinition_NOV : retours IG + version light 
- [#14026](https://github.com/1024pix/pix/pull/14026) WIP Module premier prompt nouvelle version 

### :building_construction: Tech

- [#14042](https://github.com/1024pix/pix/pull/14042) Mise à jour majeure de epreuves-components 
- [#13983](https://github.com/1024pix/pix/pull/13983) Supprimer derniers usages des colonnes obsoletes dans certification-frameworks-challenges (PIX-20113). 

### :coffee: Autre

- [#13908](https://github.com/1024pix/pix/pull/13908) Création d'un ADR sur l'usage des langues dans les documentations de nos bases de données (PIX-20050)

# [5.245.0](https://github.com/1024pix/pix/compare/v5.244.0...v5.245.0) (2025-10-31)

### :rocket: Amélioration

- [#14029](https://github.com/1024pix/pix/pull/14029) #IAGenPrompt_IND - J'améliore mes prompts - Retours des IG et passage en version light 
- [#14000](https://github.com/1024pix/pix/pull/14000) Configurer les OIDC providers par application (PIX-19806) 
- [#14034](https://github.com/1024pix/pix/pull/14034) Créer des variables d'env pour gérer les délais pour apparition feedback (PIX-20001) 
- [#14033](https://github.com/1024pix/pix/pull/14033) Fixer la navigation des modules en haut de l'écran en format mobile (PIX-20167) 
- [#13948](https://github.com/1024pix/pix/pull/13948) IAGenBiais_NOV modification suite panel + retours IG 
- [#13924](https://github.com/1024pix/pix/pull/13924) IAGenFonctionnement_NOV modification mineures 
- [#14007](https://github.com/1024pix/pix/pull/14007) Intégrer le formulaire de connexion suite à une invitation (PIX-19802) 
- [#14022](https://github.com/1024pix/pix/pull/14022) Redirige l'utilisateur vers le parcours combiné quand il clique sur Quitter dans un module (PIX-20184) 
- [#13973](https://github.com/1024pix/pix/pull/13973) Utiliser les données  de `organization_learner_participations`  dans l'utilisation des participations aux parcours combinés (Pix-19890)

# [5.244.0](https://github.com/1024pix/pix/compare/v5.243.0...v5.244.0) (2025-10-30)

### :rocket: Amélioration

- [#14019](https://github.com/1024pix/pix/pull/14019) Afficher si une organisation a le blocage auto en cas de dépassement de places (PIX-20072) 
- [#13986](https://github.com/1024pix/pix/pull/13986) Filtrer les participations d'un parcours apprenants (PIX-19632) 
- [#14032](https://github.com/1024pix/pix/pull/14032) WIP module Mot de passe Novice 

### :arrow_up: Montée de version

- [#13972](https://github.com/1024pix/pix/pull/13972) Update dependency @1024pix/pix-ui to ^55.31.0 (mon-pix)

# [5.243.0](https://github.com/1024pix/pix/compare/v5.242.1...v5.243.0) (2025-10-29)

### :rocket: Amélioration

- [#13991](https://github.com/1024pix/pix/pull/13991) Ajouter un bouton "Détacher" dans la liste des filles d'une organisation mère (PIX-17882) 
- [#13970](https://github.com/1024pix/pix/pull/13970) Ajouter une navigation dans les modules sur Pix App (PIX-20104). 
- [#13984](https://github.com/1024pix/pix/pull/13984) Correction des traductions NL (PIX-20032) 
- [#13947](https://github.com/1024pix/pix/pull/13947) Corriger la récupération du nombre d'épreuves d'une certification (PIX-19977). 
- [#14018](https://github.com/1024pix/pix/pull/14018) Modifs module phishing nov suite relcture edito 

### :bug: Correction

- [#14002](https://github.com/1024pix/pix/pull/14002) Recourir aux courses de complémentaires au lieu des souscriptions dans `evaluation` (PIX-20144). 

### :building_construction: Tech

- [#14008](https://github.com/1024pix/pix/pull/14008) Suppression de scripts non utilisés côté Certification (PIX-20155).

## [5.242.1](https://github.com/1024pix/pix/compare/v5.242.0...v5.242.1) (2025-10-29)

### :bug: Correction

- [#14015](https://github.com/1024pix/pix/pull/14015) Permettre de répondre à nouveau à un QROCM validé sans réponse 

### :building_construction: Tech

- [#14017](https://github.com/1024pix/pix/pull/14017) Ajouter des logs dans le scripts sur le rééquilibrage des passages dans la table génrique des participations. 
- [#13996](https://github.com/1024pix/pix/pull/13996) Enlever les anciens fichiers json présents du gitignore   
- [#14001](https://github.com/1024pix/pix/pull/14001) Supprimer les scripts obsolètes du scope prescription .

# [5.242.0](https://github.com/1024pix/pix/compare/v5.241.0...v5.242.0) (2025-10-28)

### :rocket: Amélioration

- [#13974](https://github.com/1024pix/pix/pull/13974) Adapter les scripts extract CSV pour prendre en compte ce nouveau type de grain (PIX-20117) 
- [#13956](https://github.com/1024pix/pix/pull/13956) Afficher le nom de l'orga mère sur le formulaire de création d'organisation (PIX-20048) 
- [#14003](https://github.com/1024pix/pix/pull/14003) Ajouter un tooltip pour les colonnes module et campagnes (PIX-19970) 
- [#13990](https://github.com/1024pix/pix/pull/13990) WIP module CY_Phishing_AVA 
- [#13987](https://github.com/1024pix/pix/pull/13987) WIP module Cyber_Phishing_AVA 

### :bug: Correction

- [#13967](https://github.com/1024pix/pix/pull/13967) Afficher les boutons d'accès aux campagnes associé à un parcours combiné (PIX-20118) 

### :building_construction: Tech

- [#13981](https://github.com/1024pix/pix/pull/13981) Déplacer le usecase getCertificationCourse (PIX-20139). 
- [#13997](https://github.com/1024pix/pix/pull/13997) Exclure les `organization_learners` qui n'ont pas de userId rattaché "dissocier" (PIX-20058). 
- [#14016](https://github.com/1024pix/pix/pull/14016) Mettre à jour la table oidc-providers pour gérer de manière générique sur quel TLD un SSO doit être disponible (PIX-20160) 
- [#13977](https://github.com/1024pix/pix/pull/13977) Script de suppression des challenges des certifications Pix+ (PIX-20093). 
- [#13982](https://github.com/1024pix/pix/pull/13982) Suppression de scripts temporaires du contexte IAM 
- [#14004](https://github.com/1024pix/pix/pull/14004) Supprimer des contraintes sur les challenges de framework de certif  pour pouvoir decommissioner le code relie (PIX-20148). 

### :arrow_up: Montée de version

- [#13988](https://github.com/1024pix/pix/pull/13988) Update dependency @1024pix/ember-testing-library to ^3.0.24 (admin) 
- [#13989](https://github.com/1024pix/pix/pull/13989) Update dependency @1024pix/ember-testing-library to ^3.0.24 (certif) 
- [#13992](https://github.com/1024pix/pix/pull/13992) Update dependency @1024pix/ember-testing-library to ^3.0.24 (junior) 
- [#13994](https://github.com/1024pix/pix/pull/13994) Update dependency @1024pix/ember-testing-library to ^3.0.24 (mon-pix) 
- [#13995](https://github.com/1024pix/pix/pull/13995) Update dependency @1024pix/ember-testing-library to ^3.0.24 (orga) 
- [#13998](https://github.com/1024pix/pix/pull/13998) Update dependency @1024pix/eslint-plugin to ^2.1.13 (api) 
- [#13999](https://github.com/1024pix/pix/pull/13999) Update dependency @1024pix/eslint-plugin to ^2.1.13 (audit-logger) 
- [#14005](https://github.com/1024pix/pix/pull/14005) Update dependency @1024pix/eslint-plugin to ^2.1.13 (certif) 
- [#14006](https://github.com/1024pix/pix/pull/14006) Update dependency @1024pix/eslint-plugin to ^2.1.13 (dossier racine) 
- [#14010](https://github.com/1024pix/pix/pull/14010) Update dependency @1024pix/eslint-plugin to ^2.1.13 (e2e-playwright) 
- [#14011](https://github.com/1024pix/pix/pull/14011) Update dependency @1024pix/eslint-plugin to ^2.1.13 (junior) 
- [#14012](https://github.com/1024pix/pix/pull/14012) Update dependency @1024pix/eslint-plugin to ^2.1.13 (mon-pix) 
- [#14013](https://github.com/1024pix/pix/pull/14013) Update dependency @1024pix/eslint-plugin to ^2.1.13 (orga) 
- [#13979](https://github.com/1024pix/pix/pull/13979) Update dependency eslint-plugin-unicorn to v61 (certif)

# [5.241.0](https://github.com/1024pix/pix/compare/v5.240.0...v5.241.0) (2025-10-24)

### :rocket: Amélioration

- [#13901](https://github.com/1024pix/pix/pull/13901) Afficher la progression des campagnes et modules sur les participations (PIX-19630) 
- [#13960](https://github.com/1024pix/pix/pull/13960) Cache le bouton "Quitter" sur la page de récap d'un module si une url de redirection est passée (PIX-20109) 
- [#13842](https://github.com/1024pix/pix/pull/13842) Dupliquer la donnée de la table combined course participations vers organization learner participations (PIX-19913) 
- [#13952](https://github.com/1024pix/pix/pull/13952) Enregistrer l'id de l'orga parente, lors de la création d'une orga fille (PIX-20023) 
- [#13893](https://github.com/1024pix/pix/pull/13893) Intégrer le formulaire de connexion dans le nouveau layout (PIX-19801) 
- [#13946](https://github.com/1024pix/pix/pull/13946) Pix Admins : migrer la gestion de complementaire en millesime (PIX-20029) 

### :building_construction: Tech

- [#13961](https://github.com/1024pix/pix/pull/13961) Créer le feature toogle pour la nouvelle nav modulix (PIX-20101) 
- [#13976](https://github.com/1024pix/pix/pull/13976) Mettre à jour la table oidc-providers pour gérer du SSO pour chaque application de manière générique (PIX-20119) 
- [#13955](https://github.com/1024pix/pix/pull/13955) Récupérer Ember Inspector sur Pix App.  
- [#13959](https://github.com/1024pix/pix/pull/13959) Unification des methodes de récupération des challenges de certification (PIX-19933). 

### :arrow_up: Montée de version

- [#13949](https://github.com/1024pix/pix/pull/13949) Update actions/setup-node action to v6 (workflows) 
- [#13968](https://github.com/1024pix/pix/pull/13968) Update dependency @1024pix/pix-ui to ^55.30.0 (admin) 
- [#13969](https://github.com/1024pix/pix/pull/13969) Update dependency @1024pix/pix-ui to ^55.30.0 (certif) 
- [#13971](https://github.com/1024pix/pix/pull/13971) Update dependency @1024pix/pix-ui to ^55.30.0 (junior) 
- [#13978](https://github.com/1024pix/pix/pull/13978) Update dependency @1024pix/pix-ui to ^55.30.0 (orga) 
- [#13942](https://github.com/1024pix/pix/pull/13942) Update dependency ember-source to ~6.8.0 (junior) 
- [#13966](https://github.com/1024pix/pix/pull/13966) Update dependency eslint-plugin-unicorn to v61 (audit-logger)

# [5.240.0](https://github.com/1024pix/pix/compare/v5.239.0...v5.240.0) (2025-10-23)

### :rocket: Amélioration

- [#13922](https://github.com/1024pix/pix/pull/13922) Afficher les locales dans le locale switcher sur Certif, Orga et Admin (PIX-19701) 
- [#13958](https://github.com/1024pix/pix/pull/13958) Déplace le bouton de fin de campagne personnalisé (PIX-19976) 
- [#13953](https://github.com/1024pix/pix/pull/13953) Masquer es et es-419 dans le locale switcher (PIX-20087) 
- [#13951](https://github.com/1024pix/pix/pull/13951) Migrer les leçons `lesson` des modules multi sections en leçons courte `short-lesson` (PIX-20068)(PIX-20042). 
- [#13962](https://github.com/1024pix/pix/pull/13962) Suppression de la normalisation des props optionnelles des POI (PIX-20108) 

### :building_construction: Tech

- [#13941](https://github.com/1024pix/pix/pull/13941) :wastebasket: Supprime des utilisation de `hasComplementaryReferential` devenu inutile (PIX-20074) 
- [#13964](https://github.com/1024pix/pix/pull/13964) Mettre à jour la dépendance webcomponent 
- [#13957](https://github.com/1024pix/pix/pull/13957) Récupérer Ember Inspector sur Pix Orga.  
- [#13954](https://github.com/1024pix/pix/pull/13954) Remplir la colonne referenceId quand on insère et on met à jour des participations de type combined-course ou passages (PIX-20059)

# [5.239.0](https://github.com/1024pix/pix/compare/v5.238.0...v5.239.0) (2025-10-22)

### :rocket: Amélioration

- [#13934](https://github.com/1024pix/pix/pull/13934) API - Ajouter le type de grain "leçon courte"(PIX-20065) 
- [#13935](https://github.com/1024pix/pix/pull/13935) Autoriser le nouveau type de grain `short-lesson` sur Pix App (PIX-20066)  
- [#13931](https://github.com/1024pix/pix/pull/13931) Créer une route pour détacher une orga fille de son parent (PIX-19983) 
- [#13950](https://github.com/1024pix/pix/pull/13950) WIP nouveau module Phishing avancé 

### :bug: Correction

- [#13923](https://github.com/1024pix/pix/pull/13923) Gérer le usecase handle-badge-acquisition quand le campaign Id n'existe pas (PIX-20053) 

### :building_construction: Tech

- [#13926](https://github.com/1024pix/pix/pull/13926) Ajouter une colonne `referenceId` dans la table `organization_learner_participations` (PIX-20058). 
- [#13945](https://github.com/1024pix/pix/pull/13945) Récupérer Ember Inspector sur Pix Admin.

# [5.238.0](https://github.com/1024pix/pix/compare/v5.237.0...v5.238.0) (2025-10-21)

### :rocket: Amélioration

- [#13848](https://github.com/1024pix/pix/pull/13848) Ajout d'un paramètre versionId pour la recherche de challenges de complémentaires (PIX-19957). 

### :bug: Correction

- [#13903](https://github.com/1024pix/pix/pull/13903) Empêcher l'erreur sur la recherche par ID de centre de certification (PIX-19394) 
- [#13944](https://github.com/1024pix/pix/pull/13944) Réparer l'import fwb / import générique (PIX-20075) 

### :arrow_up: Montée de version

- [#13937](https://github.com/1024pix/pix/pull/13937) Update dependency @1024pix/pix-ui to ^55.29.5 (certif) 
- [#13938](https://github.com/1024pix/pix/pull/13938) Update dependency @1024pix/pix-ui to ^55.29.5 (junior) 
- [#13939](https://github.com/1024pix/pix/pull/13939) Update dependency @1024pix/pix-ui to ^55.29.5 (mon-pix) 
- [#13940](https://github.com/1024pix/pix/pull/13940) Update dependency @1024pix/pix-ui to ^55.29.5 (orga) 
- [#13943](https://github.com/1024pix/pix/pull/13943) Update dependency webpack to v5.102.1 (junior)

# [5.237.0](https://github.com/1024pix/pix/compare/v5.236.0...v5.237.0) (2025-10-21)

### :rocket: Amélioration

- [#13907](https://github.com/1024pix/pix/pull/13907) Afficher le nombre d'organisations filles rattachées à l'orga parente (PIX-18893) 
- [#13844](https://github.com/1024pix/pix/pull/13844) Afficher les locales dans le locale switcher sur Pix App (PIX-19700). 
- [#13904](https://github.com/1024pix/pix/pull/13904) ajout des images dans la découverte 2 
- [#13884](https://github.com/1024pix/pix/pull/13884) Ajouter des étapes aux parcours combinés (PIX-19798) 
- [#13887](https://github.com/1024pix/pix/pull/13887) Ajouter un délai sur le bouton "Suivant" du stepper horizontal (2nd round) (PIX-20007) 
- [#13663](https://github.com/1024pix/pix/pull/13663) Autoriser la suppression de trigger sur les contenus formatifs (PIX-19692). 
- [#13925](https://github.com/1024pix/pix/pull/13925) Prendre en compte les retours à la ligne à l'affichage d'une "bonne réponse à afficher" (PIX-19931) 

### :building_construction: Tech

- [#13917](https://github.com/1024pix/pix/pull/13917) :broom: Supprime des fichiers inutilisés 
- [#13920](https://github.com/1024pix/pix/pull/13920) :truck: Déplace le modèle `AdminMember` dans le contest `src/team` 
- [#13899](https://github.com/1024pix/pix/pull/13899) :truck: Déplace le modèle `ComplementaryCertificatrionBadgeForAdmin` vers le contexte partagé de `Certification` 
- [#13898](https://github.com/1024pix/pix/pull/13898) :truck: Déplace le modèle `Course` vers le context `src/evaluation` 

### :arrow_up: Montée de version

- [#13921](https://github.com/1024pix/pix/pull/13921) Update adobe/s3mock Docker tag to v4.9.1 (dossier racine) 
- [#13927](https://github.com/1024pix/pix/pull/13927) Update dependency @1024pix/ember-testing-library to ^3.0.21 (admin) 
- [#13928](https://github.com/1024pix/pix/pull/13928) Update dependency @1024pix/ember-testing-library to ^3.0.21 (certif) 
- [#13929](https://github.com/1024pix/pix/pull/13929) Update dependency @1024pix/ember-testing-library to ^3.0.21 (junior) 
- [#13930](https://github.com/1024pix/pix/pull/13930) Update dependency @1024pix/ember-testing-library to ^3.0.21 (mon-pix) 
- [#13932](https://github.com/1024pix/pix/pull/13932) Update dependency @1024pix/ember-testing-library to ^3.0.21 (orga) 
- [#13933](https://github.com/1024pix/pix/pull/13933) Update dependency @1024pix/pix-ui to ^55.29.5 (admin) 
- [#13915](https://github.com/1024pix/pix/pull/13915) Update nginx Docker tag to v1.29.2

# [5.236.0](https://github.com/1024pix/pix/compare/v5.235.0...v5.236.0) (2025-10-20)

### :rocket: Amélioration

- [#13819](https://github.com/1024pix/pix/pull/13819) Créer des organization_learner_participations au démarrage d'un Parcours Combiné (PIX-19889). 

### :bug: Correction

- [#13919](https://github.com/1024pix/pix/pull/13919) Intercepter la contrainte d'unicité sur la création de participations lié à un même learner (PIX-20047). 

### :building_construction: Tech

- [#13889](https://github.com/1024pix/pix/pull/13889) Migration de la table Organizations pour que le nouveau champ soit obligatoire (PIX-19606)

# [5.235.0](https://github.com/1024pix/pix/compare/v5.234.0...v5.235.0) (2025-10-17)

### :rocket: Amélioration

- [#13875](https://github.com/1024pix/pix/pull/13875) Cacher les campagnes qui appartiennent à un parcours combinés (pix-19834) 

### :bug: Correction

- [#13902](https://github.com/1024pix/pix/pull/13902) Faire en sorte que la hauteur d'une step s'adapte à son contenu (PIX-19897) 

### :building_construction: Tech

- [#13895](https://github.com/1024pix/pix/pull/13895) :truck: Déplace le modèle `ComplementaryCertificationHabilitation` vers le contexte `organizationnal-entities`  
- [#13897](https://github.com/1024pix/pix/pull/13897) :truck: Déplace le modèle `UserOrgaSettings` vers le contexte `team` 
- [#13839](https://github.com/1024pix/pix/pull/13839) Remplace l'utilisation de `hasComplementaryReferential` par la clef de complémentaire dans le service de score v2 (Pix-19964) 

### :arrow_up: Montée de version

- [#13883](https://github.com/1024pix/pix/pull/13883) Update dependency @1024pix/eslint-plugin to ^2.1.12 (mon-pix) 
- [#13906](https://github.com/1024pix/pix/pull/13906) Update dependency @1024pix/eslint-plugin to ^2.1.12 (orga) 
- [#13905](https://github.com/1024pix/pix/pull/13905) Update dependency @1024pix/pix-ui to ^55.29.2 (admin) 
- [#13910](https://github.com/1024pix/pix/pull/13910) Update dependency @1024pix/pix-ui to ^55.29.2 (certif) 
- [#13911](https://github.com/1024pix/pix/pull/13911) Update dependency @1024pix/pix-ui to ^55.29.2 (junior) 
- [#13912](https://github.com/1024pix/pix/pull/13912) Update dependency @1024pix/pix-ui to ^55.29.2 (mon-pix) 
- [#13913](https://github.com/1024pix/pix/pull/13913) Update dependency @1024pix/pix-ui to ^55.29.2 (orga)

# [5.234.0](https://github.com/1024pix/pix/compare/v5.233.0...v5.234.0) (2025-10-15)

### :rocket: Amélioration

- [#13840](https://github.com/1024pix/pix/pull/13840) Utiliser la table certification_versions pour la sélection des challenges (PIX-19930). 
- [#13890](https://github.com/1024pix/pix/pull/13890) WIP IAgenpromptnov-version2 

### :bug: Correction

- [#13892](https://github.com/1024pix/pix/pull/13892) Corriger une clé de traduction erronée (PIX-20018). 

### :building_construction: Tech

- [#13894](https://github.com/1024pix/pix/pull/13894) Ajouter un domain-builder pour le modèle Version (PIX-20024). 
- [#13876](https://github.com/1024pix/pix/pull/13876) Modifier l'url pour enregistrer le logo d'un contenu formatif sur Admin (PIX-20002). 
- [#13888](https://github.com/1024pix/pix/pull/13888) Utiliser le helper de redimensionnement d'image dans le composant flashcards-card (PIX-19922)

# [5.233.0](https://github.com/1024pix/pix/compare/v5.232.0...v5.233.0) (2025-10-14)

### :rocket: Amélioration

- [#13879](https://github.com/1024pix/pix/pull/13879) Ajouter le script pour lister les modules et leur id dans l'API (PIX-19881) 
- [#13881](https://github.com/1024pix/pix/pull/13881) corrections module phishingnov suite validation 
- [#13886](https://github.com/1024pix/pix/pull/13886) Modifs description module phishing nov 

### :rewind: Retour en arrière

- [#13885](https://github.com/1024pix/pix/pull/13885) Revert "[FEATURE] Ajouter un délai sur le bouton "Suivant" du stepper horizontal (PIX-19424)."

### :building_construction: Tech

- [#13857](https://github.com/1024pix/pix/pull/13857) Ajouter une équipe en charge par défaut dans les seeds d'organisation (PIX-19846) 
- [#13822](https://github.com/1024pix/pix/pull/13822) Supprimer lodash de pixOrga (PIX-19941) 
- [#13872](https://github.com/1024pix/pix/pull/13872) Utiliser le helper de redimensionnement d'image dans le composant qab-card et dans le composant image (PIX-19993) 

### :arrow_up: Montée de version

- [#13871](https://github.com/1024pix/pix/pull/13871) Update dependency @1024pix/ember-testing-library to ^3.0.20 (certif) 
- [#13880](https://github.com/1024pix/pix/pull/13880) Update dependency @1024pix/ember-testing-library to ^3.0.20 (mon-pix) 
- [#13882](https://github.com/1024pix/pix/pull/13882) Update dependency @1024pix/eslint-plugin to ^2.1.12 (junior)

# [5.232.0](https://github.com/1024pix/pix/compare/v5.231.0...v5.232.0) (2025-10-13)

### :rocket: Amélioration

- [#13833](https://github.com/1024pix/pix/pull/13833) Ajouter un délai sur le bouton "Suivant" du stepper horizontal (PIX-19424). 
- [#13855](https://github.com/1024pix/pix/pull/13855) Update IADefinition_IND.json 

### :bug: Correction

- [#13873](https://github.com/1024pix/pix/pull/13873) Ajouter le scope dans la cacheKey du référentiel (PIX-19990). 
- [#13867](https://github.com/1024pix/pix/pull/13867) Modifier le lien d'accès aux badges sur Pix Admin (PIX-19984). 

### :arrow_up: Montée de version

- [#13878](https://github.com/1024pix/pix/pull/13878) Update dependency @1024pix/pix-ui to ^55.29.1 (admin)

# [5.231.0](https://github.com/1024pix/pix/compare/v5.230.0...v5.231.0) (2025-10-13)

### :rocket: Amélioration

- [#13866](https://github.com/1024pix/pix/pull/13866) corrections avant validation module 

### :arrow_up: Montée de version

- [#13868](https://github.com/1024pix/pix/pull/13868) Update dependency @1024pix/ember-testing-library to ^3.0.20 (admin) 
- [#13870](https://github.com/1024pix/pix/pull/13870) Update dependency @1024pix/ember-testing-library to ^3.0.20 (junior) 
- [#13869](https://github.com/1024pix/pix/pull/13869) Update dependency @1024pix/ember-testing-library to ^3.0.20 (orga) 
- [#13806](https://github.com/1024pix/pix/pull/13806) Update dependency @1024pix/eslint-plugin to ^2.1.12 (e2e-playwright) 

### :coffee: Autre

- [#13834](https://github.com/1024pix/pix/pull/13834) Ajouter le nouveau layout pour les pages d'authentification (PIX-19797)

# [5.230.0](https://github.com/1024pix/pix/compare/v5.229.0...v5.230.0) (2025-10-13)

### :rocket: Amélioration

- [#13858](https://github.com/1024pix/pix/pull/13858) Afficher le nom de l'équipe en charge sur la liste des organisations (PIX-19768) 
- [#13859](https://github.com/1024pix/pix/pull/13859) correction contenu 
- [#13856](https://github.com/1024pix/pix/pull/13856) Correction coquille 
- [#13739](https://github.com/1024pix/pix/pull/13739) Module Deepfake - correction coquille 
- [#13860](https://github.com/1024pix/pix/pull/13860) Module IA Biais IND alt modifs 
- [#13853](https://github.com/1024pix/pix/pull/13853) Supprimer le tag Découverte dans les modules (PIX-19958). 

### :bug: Correction

- [#13863](https://github.com/1024pix/pix/pull/13863) Recuperer a nouveau la cle de complementaire dans le get-next-challenge (PIX-19982). 

### :building_construction: Tech

- [#13836](https://github.com/1024pix/pix/pull/13836) Créer un utilitaire pour redimensionner les images (PIX-19942) 
- [#13864](https://github.com/1024pix/pix/pull/13864) Source correctement le fichier `.env` lors du lancement des scripts de test de l'API. 
- [#13862](https://github.com/1024pix/pix/pull/13862) Supprimer les dernières traces du FT useLocale

# [5.229.0](https://github.com/1024pix/pix/compare/v5.228.0...v5.229.0) (2025-10-10)

### :rocket: Amélioration

- [#13824](https://github.com/1024pix/pix/pull/13824) Ajouter la pagination dans la liste des participations (PIX-19631) 
- [#13816](https://github.com/1024pix/pix/pull/13816) Ajouter le caractère obligatoire du champ "Équipe en charge" lors de la modification d'une orga (PIX-19677) 
- [#13841](https://github.com/1024pix/pix/pull/13841) Ajouter une colonne jsonb dans la table `organization_learner_participations` (PIX-19966). 
- [#13830](https://github.com/1024pix/pix/pull/13830) QAB front - placer les attributs width/height (PIX-19848) 
- [#13847](https://github.com/1024pix/pix/pull/13847) Retour validation IAGenEthique-NOV 
- [#13851](https://github.com/1024pix/pix/pull/13851) WIP modif module phishing_nov suite relectures 

### :bug: Correction

- [#13843](https://github.com/1024pix/pix/pull/13843) : La barre de navigation d'un Module n'est plus sticky en haut (PIX-19967) 
- [#13854](https://github.com/1024pix/pix/pull/13854) Corriger le script toggles côté API 

### :building_construction: Tech

- [#13835](https://github.com/1024pix/pix/pull/13835) Mettre à jour le fichier CODEOWNERS pour prendre en compte la nouvelle team-acquisition 

### :arrow_up: Montée de version

- [#13837](https://github.com/1024pix/pix/pull/13837) Update dependency @1024pix/pix-ui to 55.29.1 

### :coffee: Autre

- [#13825](https://github.com/1024pix/pix/pull/13825) Normaliser le nommage dans le code concernant l’inscription et la connexion (PIX-19658)

# [5.228.0](https://github.com/1024pix/pix/compare/v5.227.0...v5.228.0) (2025-10-09)

### :rocket: Amélioration

- [#13811](https://github.com/1024pix/pix/pull/13811) Afficher la liste des parcours apprenants (PIX-19814) 
- [#13813](https://github.com/1024pix/pix/pull/13813) Afficher les boutons des campagnes sur la page de parcours combinés (PIX-19799) 
- [#13798](https://github.com/1024pix/pix/pull/13798) création IAGenEthique_NOV.json 
- [#13812](https://github.com/1024pix/pix/pull/13812) Enregistrer l'équipe en charge lors de la création d'organisations en masse (PIX-19600) 
- [#13827](https://github.com/1024pix/pix/pull/13827) fix typo IAGenFonction 
- [#13831](https://github.com/1024pix/pix/pull/13831) Version alternative module IA Biais IND 

### :bug: Correction

- [#13826](https://github.com/1024pix/pix/pull/13826) Corriger le fond violet sur la page de récap (PIX-19912) 

### :building_construction: Tech

- [#13832](https://github.com/1024pix/pix/pull/13832) Ne pas rendre l'id de l'équipe en charge obligatoire lors de l'update en masse (PIX-19925) 
- [#13777](https://github.com/1024pix/pix/pull/13777) Seeds : ajouter des versions CORE pour la table certification_versions (PIX-19847). 
- [#13828](https://github.com/1024pix/pix/pull/13828) Vérifier que l'équipe en charge existe bien avant de créer l'organisation (PIX-19904)

# [5.227.0](https://github.com/1024pix/pix/compare/v5.226.0...v5.227.0) (2025-10-08)

### :rocket: Amélioration

- [#13748](https://github.com/1024pix/pix/pull/13748) Afficher les durées des certifications Pix+ sur les écrans d'entrée (PIX-19589) 
- [#13801](https://github.com/1024pix/pix/pull/13801) Animation et couleurs des feedbacks (PIX-19327). 
- [#13821](https://github.com/1024pix/pix/pull/13821) correction erreur contenu 
- [#13803](https://github.com/1024pix/pix/pull/13803) QAB : fixer la hauteur des images et temps de transition des cartes (PIX-19618) 

### :bug: Correction

- [#13820](https://github.com/1024pix/pix/pull/13820) Correction de la durée de la certification Pix+ Édu - espace surveillant (PIX-19903) 
- [#13829](https://github.com/1024pix/pix/pull/13829) Corriger la validation des réponses d'un QCM dans un stepper (PIX-19921) 
- [#13787](https://github.com/1024pix/pix/pull/13787) Ne pas afficher le message informatif du repasser quand on ne peut pas repasser (PIX-19852) 

### :building_construction: Tech

- [#13818](https://github.com/1024pix/pix/pull/13818) Supprime la dépendance dotenv. 

### :coffee: Autre

# [5.226.0](https://github.com/1024pix/pix/compare/v5.225.0...v5.226.0) (2025-10-07)

### :rocket: Amélioration

- [#13815](https://github.com/1024pix/pix/pull/13815) Ajouter deux colonnes à la table combined_course_participations : combinedCourseId et organizationLearnerParticipationId 
- [#13807](https://github.com/1024pix/pix/pull/13807) Ajouter les feedbacks pour les QCU déclaratif en mode preview (PIX-19892). 
- [#13786](https://github.com/1024pix/pix/pull/13786) Ajouter les feedbacks pour les QCU discovery en mode preview (PIX-19859) 
- [#13788](https://github.com/1024pix/pix/pull/13788) Ajouter un feature toggle pour le nouveau design des pages d'authentification de Pix Orga (PIX-19794) 
- [#13785](https://github.com/1024pix/pix/pull/13785) Empêcher le layout shift sur les images des flashcards (PIX-19842). 
- [#13784](https://github.com/1024pix/pix/pull/13784) Enregistrer l'équipe en charge lors de la modification d'organisations en masse (PIX-19602) 
- [#13767](https://github.com/1024pix/pix/pull/13767) Enregistrer la nouvelle équipe en charge lors de la modification d'une organisation (PIX-19599) 
- [#13782](https://github.com/1024pix/pix/pull/13782) Intégrations retours IAGENfonction_IND 
- [#13799](https://github.com/1024pix/pix/pull/13799) modifs module cyphishing1 suite changement pattern 
- [#13793](https://github.com/1024pix/pix/pull/13793) Remonter les métadonnées des images présentes dans les QAB (PIX-19683). 
- [#13783](https://github.com/1024pix/pix/pull/13783) Utiliser les données de la table `combined_courses` au lieu de quests (Pix-19851). 

### :bug: Correction

- [#13814](https://github.com/1024pix/pix/pull/13814) Ne sélectionner que des challenges calibrés dans une certification Pix+ (PIX-19895). 
- [#13800](https://github.com/1024pix/pix/pull/13800) Sélectionner uniquement les challenges validés durant une certif Pix+ (PIX-19883). 
- [#13817](https://github.com/1024pix/pix/pull/13817) Un logger.error() se déclenche en fin de stream même lorsque tout s'est bien passé 

### :building_construction: Tech

- [#13766](https://github.com/1024pix/pix/pull/13766) :truck: Déplace le répository `complementaryCertificationRepository` vers le  contexte `certification/configuration/` (PIX-19836) 
- [#13810](https://github.com/1024pix/pix/pull/13810) Logger le prompt en cas d'erreur LLM. 

### :arrow_up: Montée de version

- [#13805](https://github.com/1024pix/pix/pull/13805) Update dependency @1024pix/eslint-plugin to ^2.1.12 (dossier racine)

# [5.225.0](https://github.com/1024pix/pix/compare/v5.224.0...v5.225.0) (2025-10-06)

### :rocket: Amélioration

- [#13738](https://github.com/1024pix/pix/pull/13738) : S'assurer que le bouton "passer" devient "continuer" après l'apparition des feedbacks pour les QCM (PIX-19425) 
- [#13759](https://github.com/1024pix/pix/pull/13759) Afficher les statistiques de participation d'un parcours combiné (PIX-19634) 
- [#13773](https://github.com/1024pix/pix/pull/13773) Ajouter les parcours apprenants au chargement de PixOrga (pix-19813) 
- [#13726](https://github.com/1024pix/pix/pull/13726) IAgenbiais_IND coquille 
- [#13781](https://github.com/1024pix/pix/pull/13781) Intégration retours IAGENFonction_NOV 
- [#13765](https://github.com/1024pix/pix/pull/13765) Récupérer les parcours combinés d'une organisation (PIX-19800) 
- [#13780](https://github.com/1024pix/pix/pull/13780) Renseigner la table combined_courses (PIX-19865). 

### :bug: Correction

- [#13776](https://github.com/1024pix/pix/pull/13776) Empêcher d'envoyer un email à un destinaire des résultats si le candidat n'a pas de certif-course (PIX-19805). 
- [#13750](https://github.com/1024pix/pix/pull/13750) Gérer le cas où le token de réinitialisation du mot de passe a expiré (PIX-19474). 
- [#13796](https://github.com/1024pix/pix/pull/13796) Réparer la création d'orga dans les seeds certif 

### :building_construction: Tech

- [#13762](https://github.com/1024pix/pix/pull/13762) Ajoute un service pour mutualiser la logique de calcul des parcours combiné (PIX-19812) 
- [#13770](https://github.com/1024pix/pix/pull/13770) Gestion du caractère obligatoire du champ administration-team à la création unitaire (PIX-19808) 
- [#13775](https://github.com/1024pix/pix/pull/13775) Migrer les confs de PixCoeur dans la table certification_versions (PIX-19830). 
- [#13779](https://github.com/1024pix/pix/pull/13779) Passer l'id de corrélation de requête à ChatPix pour faciliter le regroupement des logs et le débuggage sur Datadog 
- [#13795](https://github.com/1024pix/pix/pull/13795) Supprimer les erreurs de connexion à Redis pour Maddo 

### :arrow_up: Montée de version

- [#13761](https://github.com/1024pix/pix/pull/13761) Update dependency @1024pix/ember-testing-library to ^3.0.18 (orga) 
- [#13789](https://github.com/1024pix/pix/pull/13789) Update dependency @1024pix/ember-testing-library to ^3.0.19 (admin) 
- [#13790](https://github.com/1024pix/pix/pull/13790) Update dependency @1024pix/ember-testing-library to ^3.0.19 (certif) 
- [#13791](https://github.com/1024pix/pix/pull/13791) Update dependency @1024pix/ember-testing-library to ^3.0.19 (junior) 
- [#13792](https://github.com/1024pix/pix/pull/13792) Update dependency @1024pix/ember-testing-library to ^3.0.19 (mon-pix) 
- [#13794](https://github.com/1024pix/pix/pull/13794) Update dependency @1024pix/ember-testing-library to ^3.0.19 (orga) 
- [#13797](https://github.com/1024pix/pix/pull/13797) Update dependency @1024pix/eslint-plugin to ^2.1.12 (api) 
- [#13802](https://github.com/1024pix/pix/pull/13802) Update dependency @1024pix/eslint-plugin to ^2.1.12 (audit-logger) 
- [#13804](https://github.com/1024pix/pix/pull/13804) Update dependency @1024pix/eslint-plugin to ^2.1.12 (certif)

# [5.224.0](https://github.com/1024pix/pix/compare/v5.223.0...v5.224.0) (2025-10-03)

### :rocket: Amélioration

- [#13769](https://github.com/1024pix/pix/pull/13769) :sparkles: Création d'un script pour l'import de la calibration ayant l'ID 1 (pix-19827) 
- [#13727](https://github.com/1024pix/pix/pull/13727) Afficher le champ "Équipe en charge" dans le formulaire d'édition d'une organisation (PIX-19598) 
- [#13772](https://github.com/1024pix/pix/pull/13772) Ajouter une table `combined_courses` pour isoler les données n'appartenant pas aux quêtes (Pix-19763). 
- [#13771](https://github.com/1024pix/pix/pull/13771) Rendre plus robuste les API LLM demandant un chatId en entrée (PIX-19841) 
- [#13736](https://github.com/1024pix/pix/pull/13736) Renvoyer les width/height des images dans les flashcards (PIX-19682) 
- [#13763](https://github.com/1024pix/pix/pull/13763) WIP créa du module Cyber Phishing NOV  

### :bug: Correction

- [#13774](https://github.com/1024pix/pix/pull/13774) Corriger le bug d'affichage de la flashcard lorsqu'elle co-existe avec un stepper horizontal (PIX-19845) 
- [#13778](https://github.com/1024pix/pix/pull/13778) Les logs issus de child loggers ne portent pas les données de corrélation telles que le user_id ou le request_id 
- [#13768](https://github.com/1024pix/pix/pull/13768) Ne pas vider le cache redis s'il n'est pas démarré après chaque test (PIX-19840) 
- [#13747](https://github.com/1024pix/pix/pull/13747) Permettre au rôle CERTIF d'archiver un centre de certif (PIX-19773) 

### :building_construction: Tech

- [#13751](https://github.com/1024pix/pix/pull/13751) Ajouter une transaction lors de l'archivage d'organisation (PIX-19756) 
- [#13715](https://github.com/1024pix/pix/pull/13715) Inverser la manière dont on récupère les module recommandé (Pix-19284).

# [5.223.0](https://github.com/1024pix/pix/compare/v5.222.0...v5.223.0) (2025-10-02)

### :rocket: Amélioration

- [#13749](https://github.com/1024pix/pix/pull/13749) Copie des données de certification-configurations vers certification_versions (PIX-19671). 
- [#13729](https://github.com/1024pix/pix/pull/13729) Remplir la table `organization_learner_participations` lors du passage de module (PIX-19738). 
- [#13746](https://github.com/1024pix/pix/pull/13746) Sécuriser le prompting en évitant les prompts concurrents sur la même conversation (PIX-19772) 

### :bug: Correction

- [#13760](https://github.com/1024pix/pix/pull/13760) Ajouter la locale es-419 manquante dans Pix API CHALLENGE_LOCALES (PIX-19820) 
- [#13752](https://github.com/1024pix/pix/pull/13752) Retourner une erreur dans le getProgression lorsque l'assessment ne contient plus de campaignParticipationId (PIX-19817). 

### :building_construction: Tech

- [#13753](https://github.com/1024pix/pix/pull/13753) Cesser d'essayer de lire des chats depuis Redis 
- [#13669](https://github.com/1024pix/pix/pull/13669) Supprimer le feature toggle useCookieLocaleInApi (PIX-19338) 

### :arrow_up: Montée de version

- [#13745](https://github.com/1024pix/pix/pull/13745) Update dependency @1024pix/ember-testing-library to ^3.0.18 (mon-pix) 
- [#13754](https://github.com/1024pix/pix/pull/13754) Update dependency @1024pix/pix-ui to ^55.29.0 (admin) 
- [#13755](https://github.com/1024pix/pix/pull/13755) Update dependency @1024pix/pix-ui to ^55.29.0 (certif) 
- [#13756](https://github.com/1024pix/pix/pull/13756) Update dependency @1024pix/pix-ui to ^55.29.0 (junior) 
- [#13757](https://github.com/1024pix/pix/pull/13757) Update dependency @1024pix/pix-ui to ^55.29.0 (mon-pix) 
- [#13758](https://github.com/1024pix/pix/pull/13758) Update dependency @1024pix/pix-ui to ^55.29.0 (orga)

# [5.222.0](https://github.com/1024pix/pix/compare/v5.221.0...v5.222.0) (2025-10-01)

### :rocket: Amélioration

- [#13708](https://github.com/1024pix/pix/pull/13708) Adapter l'heure de fin théorique des certification aux Pix plus (PIX-19086) 

### :bug: Correction

- [#13724](https://github.com/1024pix/pix/pull/13724) Éviter les problèmes de timezone dans la page de restriction d'accès de PixCertif (PIX-19747). 
- [#13728](https://github.com/1024pix/pix/pull/13728) Permettre l'authentification par SSO aux utilisateurs sortant d'un parcours Modulix (PIX-19665) 

### :building_construction: Tech

- [#13719](https://github.com/1024pix/pix/pull/13719) Stocke les messages des épreuves LLM dans PG (PIX-19689). 

### :arrow_up: Montée de version

- [#13734](https://github.com/1024pix/pix/pull/13734) Update adobe/s3mock Docker tag to v4.9.1 (.circleci) 
- [#13735](https://github.com/1024pix/pix/pull/13735) Update adobe/s3mock Docker tag to v4.9.1 (docker) 
- [#13740](https://github.com/1024pix/pix/pull/13740) Update dependency @1024pix/ember-testing-library to ^3.0.18 (admin) 
- [#13741](https://github.com/1024pix/pix/pull/13741) Update dependency @1024pix/ember-testing-library to ^3.0.18 (certif) 
- [#13744](https://github.com/1024pix/pix/pull/13744) Update dependency @1024pix/ember-testing-library to ^3.0.18 (junior)

# [5.221.0](https://github.com/1024pix/pix/compare/v5.220.0...v5.221.0) (2025-09-30)

### :rocket: Amélioration

- [#13703](https://github.com/1024pix/pix/pull/13703) Afficher le champ "Equipe en charge" dans la page de détail d'une organisation (PIX-19509) 
- [#13723](https://github.com/1024pix/pix/pull/13723) Afficher les participations aux parcours combinés dans PixOrga (pix-19704) 
- [#13697](https://github.com/1024pix/pix/pull/13697) Ajouter une route pour récupérer les participations à un parcours combiné (PIX-19703) 
- [#13709](https://github.com/1024pix/pix/pull/13709) modification images 
- [#13725](https://github.com/1024pix/pix/pull/13725) Modifications suite retours PYO IAGENBiais_IND 
- [#13704](https://github.com/1024pix/pix/pull/13704) Parler de "référentiel de certification" à la place de "référentiel cadre"(PIX-19555). 

### :bug: Correction

- [#13720](https://github.com/1024pix/pix/pull/13720) Corriger le fond des svg de succès/erreur sur les QAB et les bords de l'image de la flashcard (PIX-19742). 
- [#13695](https://github.com/1024pix/pix/pull/13695) Permettre la remise à zéro même en ayant tout bon (PIX-19695) 
- [#13721](https://github.com/1024pix/pix/pull/13721) Retourner un tableau vide au lieu de null lors de la récupération de campagnes (PIX-19743) 
- [#13730](https://github.com/1024pix/pix/pull/13730) Retourner une erreur lorsque la campagne est supprimée lors de l'appel à POST /answers (PIX-19750). 

### :building_construction: Tech

- [#13589](https://github.com/1024pix/pix/pull/13589) :truck:  Déplace le modèle `CertificationCenterMemberShip` dans le contexte `team` (PIX-19615) 
- [#13674](https://github.com/1024pix/pix/pull/13674) Ajout des traductions anglaises pour les URLs des fiches d'incident (PIX-19664) 
- [#13722](https://github.com/1024pix/pix/pull/13722) Suppression de scripts et variable d'environnement non utlisés (PIX-19745). 
- [#13481](https://github.com/1024pix/pix/pull/13481) Supprimer des informations périmées du guide d'installation 

### :arrow_up: Montée de version

- [#13731](https://github.com/1024pix/pix/pull/13731) Update dependency @1024pix/pix-ui to ^55.28.4 (junior) 
- [#13732](https://github.com/1024pix/pix/pull/13732) Update dependency @1024pix/pix-ui to ^55.28.4 (mon-pix) 
- [#13733](https://github.com/1024pix/pix/pull/13733) Update dependency @1024pix/pix-ui to ^55.28.4 (orga) 
- [#13685](https://github.com/1024pix/pix/pull/13685) Update dependency eslint-plugin-unicorn to v60 (certif)

# [5.220.0](https://github.com/1024pix/pix/compare/v5.219.0...v5.220.0) (2025-09-29)

### :rocket: Amélioration

- [#13701](https://github.com/1024pix/pix/pull/13701) Ajouter deux tables pour relier les participations à des parcours combinés aux organization learners (PIX-19676) 
- [#13705](https://github.com/1024pix/pix/pull/13705) Désactiver les propositions lors de la vérification des réponses des QROCM (PIX-19374) 
- [#13675](https://github.com/1024pix/pix/pull/13675) Enlever le fond violet en début de module (PIX-19679) 
- [#13689](https://github.com/1024pix/pix/pull/13689) Enregistrer l'équipe en charge lors de la création d'une nouvelle organisation (PIX-19506) 
- [#13702](https://github.com/1024pix/pix/pull/13702) Permettre de visualiser les feedbacks lors de la preview (PIX-12252) 
- [#13706](https://github.com/1024pix/pix/pull/13706) Placer les attributs width/height des images matricielles si elles sont disponibles (PIX-19681) 
- [#13698](https://github.com/1024pix/pix/pull/13698) Transmettre un event d'erreur durant le stream d'une réponse LLM si celle-ci contient une erreur (PIX-19697) 
- [#13707](https://github.com/1024pix/pix/pull/13707) Update IAGenBiais_IND.json 

### :bug: Correction

- [#13672](https://github.com/1024pix/pix/pull/13672) Rendre les dates de naissance de l'ES insensibles à la timezone (PIX-19499). 

### :building_construction: Tech

- [#13686](https://github.com/1024pix/pix/pull/13686) Initiation de la notion de millesime (PIX-19670). 

### :arrow_up: Montée de version

- [#13710](https://github.com/1024pix/pix/pull/13710) Update dependency @1024pix/ember-testing-library to ^3.0.16 (admin) 
- [#13711](https://github.com/1024pix/pix/pull/13711) Update dependency @1024pix/ember-testing-library to ^3.0.16 (certif) 
- [#13712](https://github.com/1024pix/pix/pull/13712) Update dependency @1024pix/ember-testing-library to ^3.0.16 (junior) 
- [#13713](https://github.com/1024pix/pix/pull/13713) Update dependency @1024pix/ember-testing-library to ^3.0.16 (mon-pix) 
- [#13714](https://github.com/1024pix/pix/pull/13714) Update dependency @1024pix/ember-testing-library to ^3.0.16 (orga) 
- [#13716](https://github.com/1024pix/pix/pull/13716) Update dependency @1024pix/pix-ui to ^55.28.4 (admin) 
- [#13717](https://github.com/1024pix/pix/pull/13717) Update dependency @1024pix/pix-ui to ^55.28.4 (certif) 
- [#13690](https://github.com/1024pix/pix/pull/13690) Update dependency eslint-plugin-unicorn to v60 (dossier racine) 
- [#13692](https://github.com/1024pix/pix/pull/13692) Update dependency eslint-plugin-unicorn to v61 (api)

# [5.219.0](https://github.com/1024pix/pix/compare/v5.218.0...v5.219.0) (2025-09-26)

### :rocket: Amélioration

- [#13676](https://github.com/1024pix/pix/pull/13676)  Afficher un parcours combiné dans PixOrga (PIX-19620) 
- [#13620](https://github.com/1024pix/pix/pull/13620) Afficher les noms de certification dans les instructions (PIX-19588) 
- [#13688](https://github.com/1024pix/pix/pull/13688) Ajouter les migrations des tables chats et chat-messages (PIX-19689) 
- [#13671](https://github.com/1024pix/pix/pull/13671) Ajouter un route pour afficher le détail d'un parcours combiné (PIX-19672) 
- [#13693](https://github.com/1024pix/pix/pull/13693) Ajouter un texte d'incitation à repasser les modules des parcours combinés (PIX-19023) 
- [#13696](https://github.com/1024pix/pix/pull/13696) Modifier l'illustration de fin de module sur Pix App (PIX-19617). 
- [#13609](https://github.com/1024pix/pix/pull/13609) Vérifier côté client le QROCM (PIX-19337) 

### :bug: Correction

- [#13691](https://github.com/1024pix/pix/pull/13691) Afficher le lien "Mes parcours" lorsque l'on a une participation a un parcours combiné (PIX-19593). 

### :building_construction: Tech

- [#13581](https://github.com/1024pix/pix/pull/13581) :recycle: Simplifie le mécanisme de vérification d'accès d'un utilisateur à un centre de certification (PIX-19614) 
- [#13682](https://github.com/1024pix/pix/pull/13682) Activer l'auto retry sur les tests de l'api d'integration 
- [#13694](https://github.com/1024pix/pix/pull/13694) Corrige un test flaky 
- [#13683](https://github.com/1024pix/pix/pull/13683) Renommer les fichiers des modules IA (PIX-19698) 
- [#13656](https://github.com/1024pix/pix/pull/13656) Utiliser des champs de date natifs dans les forms PixCertif (PIX-17969). 

### :arrow_up: Montée de version

- [#13699](https://github.com/1024pix/pix/pull/13699) Lock file maintenance (api) 
- [#13679](https://github.com/1024pix/pix/pull/13679) Update dependency ember-truth-helpers to v5 (mon-pix) 
- [#13684](https://github.com/1024pix/pix/pull/13684) Update dependency eslint-plugin-unicorn to v60 (audit-logger)

# [5.218.0](https://github.com/1024pix/pix/compare/v5.217.0...v5.218.0) (2025-09-25)

### :rocket: Amélioration

- [#13652](https://github.com/1024pix/pix/pull/13652) À la connexion, protéger les OIDC Providers contre les multiples appels (PIX-18388) 
- [#13650](https://github.com/1024pix/pix/pull/13650) Ajouter la locale es-419 à Pix API (PIX-19591) 
- [#13574](https://github.com/1024pix/pix/pull/13574) Ajouter un sélecteur d'équipe à la création d'une organisation (PIX-19505). 
- [#13469](https://github.com/1024pix/pix/pull/13469) Bloquer l'accès à Pix Certif sur une période donnée (PIX-19092). 
- [#13665](https://github.com/1024pix/pix/pull/13665) Design combinix (PIX-19597) 
- [#13673](https://github.com/1024pix/pix/pull/13673) Empêcher le layout shift sur les images vectorielles de Modulix (PIX-19650) 
- [#13664](https://github.com/1024pix/pix/pull/13664) Mettre à jour l'appel à l'API prompt (PIX-19663) 

### :bug: Correction

- [#13661](https://github.com/1024pix/pix/pull/13661) Coquille dans la modale de validation d'activation de fonctionnalité sur admin (PIX-19660) 

### :building_construction: Tech

- [#13653](https://github.com/1024pix/pix/pull/13653) Mettre à jour les service url-base et locale dans les fronts (PIX-19641) 
- [#13657](https://github.com/1024pix/pix/pull/13657) Supprimer le script OGA api/scripts/create-organizations-with-tags-and-target-profiles.js (PIX-19607) 

### :arrow_up: Montée de version

- [#13666](https://github.com/1024pix/pix/pull/13666) Update dependency ember-exam to v10 (certif) 
- [#13667](https://github.com/1024pix/pix/pull/13667) Update dependency ember-exam to v10 (junior) 
- [#13668](https://github.com/1024pix/pix/pull/13668) Update dependency ember-exam to v10 (mon-pix) 
- [#13677](https://github.com/1024pix/pix/pull/13677) Update dependency ember-truth-helpers to v5 (admin) 
- [#13678](https://github.com/1024pix/pix/pull/13678) Update dependency ember-truth-helpers to v5 (certif) 
- [#13680](https://github.com/1024pix/pix/pull/13680) Update dependency ember-truth-helpers to v5 (orga) 
- [#13681](https://github.com/1024pix/pix/pull/13681) Update dependency eslint-plugin-unicorn to v60 (api)

# [5.217.0](https://github.com/1024pix/pix/compare/v5.216.0...v5.217.0) (2025-09-24)

### :rocket: Amélioration

- [#13638](https://github.com/1024pix/pix/pull/13638) - Ajout du bouton Répondre au questionnaire sur les parcours combinés (PIX-19609) 
- [#13651](https://github.com/1024pix/pix/pull/13651) Afficher tout le contenu d'un stepper horizontal en preview sur Pix App (PIX-19372). 
- [#13643](https://github.com/1024pix/pix/pull/13643) Modification feedback tom cruise 
- [#13641](https://github.com/1024pix/pix/pull/13641) Retirer les variables des évènements Plausible 

### :bug: Correction

- [#13602](https://github.com/1024pix/pix/pull/13602) Traductions défectueuses suite à l'extraction de la méthode translate de i18n (PIX-19565) 

### :building_construction: Tech

- [#13655](https://github.com/1024pix/pix/pull/13655) Ajouter un éditeur de parcours combiné 

### :arrow_up: Montée de version

- [#13640](https://github.com/1024pix/pix/pull/13640) Update dependency @1024pix/pix-ui to ^55.28.0 (junior) 
- [#13648](https://github.com/1024pix/pix/pull/13648) Update dependency @types/bcrypt to v6 (audit-logger) 
- [#13654](https://github.com/1024pix/pix/pull/13654) Update dependency chai to v6 (api) 
- [#13658](https://github.com/1024pix/pix/pull/13658) Update dependency chai to v6 (load-testing) 
- [#13662](https://github.com/1024pix/pix/pull/13662) Update dependency ember-exam to v10 (admin) 
- [#13529](https://github.com/1024pix/pix/pull/13529) Update dependency ember-source to ~6.7.0 (junior)

# [5.216.0](https://github.com/1024pix/pix/compare/v5.215.0...v5.216.0) (2025-09-23)

### :rocket: Amélioration

- [#13642](https://github.com/1024pix/pix/pull/13642) Ajouter la locale es-419 à Pix App (PIX-19592) 
- [#13644](https://github.com/1024pix/pix/pull/13644) Créer script d'export CSV des sections de module (PIX-19605) 
- [#13625](https://github.com/1024pix/pix/pull/13625) Mise à jour du wording dans le bloc "Formation" des parcours combinés 
- [#13626](https://github.com/1024pix/pix/pull/13626) Nous avons besoin de savoir si une configuration LLM possède des conditions de victoire. (PIX- 19601) 
- [#13614](https://github.com/1024pix/pix/pull/13614) Remonter le nom du parcours combiné sur la page d'une campagne (PIX-19317) 

### :building_construction: Tech

- [#13569](https://github.com/1024pix/pix/pull/13569) :card_file_box:  Suppression de la colonne `hasComplementaryReferential` de la table `complementary-certifications` (Pix-19530) 
- [#13635](https://github.com/1024pix/pix/pull/13635) Corriger deux tests flaky sur le campaign participation overviews (PIX-XXXX). 
- [#13649](https://github.com/1024pix/pix/pull/13649) Rapatrier la logic dans le usecase et non dans le repository d'eligibilité (Pix-19633). 
- [#13628](https://github.com/1024pix/pix/pull/13628) Traduire les textes français dans le ficher de traduction anglais (PIX-19608) 

### :arrow_up: Montée de version

- [#13647](https://github.com/1024pix/pix/pull/13647) Update actions/setup-node action to v5 (workflows) 
- [#13636](https://github.com/1024pix/pix/pull/13636) Update dependency @1024pix/ember-testing-library to ^3.0.15 (orga) 
- [#13637](https://github.com/1024pix/pix/pull/13637) Update dependency @1024pix/pix-ui to ^55.28.0 (admin) 
- [#13639](https://github.com/1024pix/pix/pull/13639) Update dependency @1024pix/pix-ui to ^55.28.0 (certif) 
- [#13645](https://github.com/1024pix/pix/pull/13645) Update dependency @1024pix/pix-ui to ^55.28.0 (mon-pix) 
- [#13646](https://github.com/1024pix/pix/pull/13646) Update dependency @1024pix/pix-ui to ^55.28.0 (orga)

# [5.215.0](https://github.com/1024pix/pix/compare/v5.214.0...v5.215.0) (2025-09-22)

### :rocket: Amélioration

- [#13630](https://github.com/1024pix/pix/pull/13630) Cacher le code campagne lorsqu'elles sont liées à un parcours combiné (PIX-19611).

# [5.214.0](https://github.com/1024pix/pix/compare/v5.213.0...v5.214.0) (2025-09-22)

### :rocket: Amélioration

- [#13601](https://github.com/1024pix/pix/pull/13601) Autoriser tous les utilisateurs connectés n'appartenant pas à une orga à import, à accéder aux parcours combinés (PIX-19228) 
- [#13622](https://github.com/1024pix/pix/pull/13622) Copier l'event EXPAND_CLOSED du service metrics vers un passageEvent (PIX-18372) 
- [#13619](https://github.com/1024pix/pix/pull/13619) Copier l'event EXPAND_OPENED en passageEvent (PIX-18371). 
- [#13567](https://github.com/1024pix/pix/pull/13567) Créer une route pour récupérer toutes les équipes d'administration (PIX-19495) 
- [#13586](https://github.com/1024pix/pix/pull/13586) Empêcher de supprimer une participation à une campagne dans une quête depuis PixAdmin (pix-19496) 
- [#13623](https://github.com/1024pix/pix/pull/13623) Modification feedback 
- [#13624](https://github.com/1024pix/pix/pull/13624) Rajout d'un mot manquant iagenfonction-nov 

### :bug: Correction

- [#13607](https://github.com/1024pix/pix/pull/13607) Correction de l'export CSV avec gestion des locales (PIX-19551) 
- [#13606](https://github.com/1024pix/pix/pull/13606) Corriger les marges sur les pages de PixApp (PIX-19568). 
- [#13629](https://github.com/1024pix/pix/pull/13629) Supprimer l'appel dupliqué à buildParenthoodQuest dans build-quests.js 

### :building_construction: Tech

- [#13627](https://github.com/1024pix/pix/pull/13627) Renommer checkDomainIsValid en assertEmailDomainHasMx pour indiquer clairement ce qui est fait 

### :arrow_up: Montée de version

- [#13507](https://github.com/1024pix/pix/pull/13507) Update adobe/s3mock Docker tag to v4.8.0 (docker) 
- [#13528](https://github.com/1024pix/pix/pull/13528) Update adobe/s3mock Docker tag to v4.8.0 (dossier racine) 
- [#13631](https://github.com/1024pix/pix/pull/13631) Update dependency @1024pix/ember-testing-library to ^3.0.15 (admin) 
- [#13632](https://github.com/1024pix/pix/pull/13632) Update dependency @1024pix/ember-testing-library to ^3.0.15 (certif) 
- [#13633](https://github.com/1024pix/pix/pull/13633) Update dependency @1024pix/ember-testing-library to ^3.0.15 (junior) 
- [#13634](https://github.com/1024pix/pix/pull/13634) Update dependency @1024pix/ember-testing-library to ^3.0.15 (mon-pix) 

### :coffee: Autre

# [5.213.0](https://github.com/1024pix/pix/compare/v5.212.0...v5.213.0) (2025-09-19)

### :rocket: Amélioration

- [#13615](https://github.com/1024pix/pix/pull/13615) Ajout de l'illustration MINARM et amélioration des cartes d'attestation (PIX-19580) 
- [#13616](https://github.com/1024pix/pix/pull/13616) Biais ind - derniers retours 
- [#13621](https://github.com/1024pix/pix/pull/13621) Changement feedback découverte 1 
- [#13596](https://github.com/1024pix/pix/pull/13596) IAGenFonctionnement NOV correction coquille et média 
- [#13613](https://github.com/1024pix/pix/pull/13613) Intégration retours typo IAGENFonct Nov 
- [#13584](https://github.com/1024pix/pix/pull/13584) Migrer l'event FILE_DOWNLOADED du service metrics vers un passageEvent (PIX-18370) 
- [#13610](https://github.com/1024pix/pix/pull/13610) Modification leçon 1 deepfake 
- [#13612](https://github.com/1024pix/pix/pull/13612) modifs IAGenFonction_IND section4 section5 
- [#13617](https://github.com/1024pix/pix/pull/13617) Module prompt independant dernière modif 
- [#13608](https://github.com/1024pix/pix/pull/13608) Update module biais indépendant images 

### :bug: Correction

- [#13611](https://github.com/1024pix/pix/pull/13611) Correction clé de traduction manquante sur la cartes de la page Mes Parcours (PIX-19582) 
- [#13597](https://github.com/1024pix/pix/pull/13597) Retours design Combinix (PIX-19559) 

### :building_construction: Tech

- [#13570](https://github.com/1024pix/pix/pull/13570) :recycle: Arrête d'utiliser l'attribut `hasComplementaryReferential` pour définir une certification CLEA (pix-19159) 
- [#13591](https://github.com/1024pix/pix/pull/13591) Ajouter des constantes pour les types d'item des parcours combinés et pour les urls des assets (PIX-19550) 

### :coffee: Autre

- [#13580](https://github.com/1024pix/pix/pull/13580) Modifs IAGenFonction_IND

# [5.212.0](https://github.com/1024pix/pix/compare/v5.211.0...v5.212.0) (2025-09-18)

### :rocket: Amélioration

- [#13599](https://github.com/1024pix/pix/pull/13599) Ajouter un champ `instruction` au custom elements (PIX-18990) 
- [#13522](https://github.com/1024pix/pix/pull/13522) Désactiver les boutons en fonctions du statut de la certification (PIX-17763) 
- [#13595](https://github.com/1024pix/pix/pull/13595) IA Hallu - remplacement img par custom LLM-messages 
- [#13587](https://github.com/1024pix/pix/pull/13587) Migrer l'évènement VIDEO_PLAYED du service metrics vers un passageEvent (PIX-18369) 
- [#13604](https://github.com/1024pix/pix/pull/13604) Modif leçons retours PYO Les biais intermédiaires 
- [#13545](https://github.com/1024pix/pix/pull/13545) Modif suite panel interne ia dit ia  
- [#13550](https://github.com/1024pix/pix/pull/13550) Modification suite panel interne deepfakes 
- [#13590](https://github.com/1024pix/pix/pull/13590) Modifier le contenu de la bannière sur Pix App (PIX-19554). 
- [#13598](https://github.com/1024pix/pix/pull/13598) Réactiver le tracking des events modulix/contenu formatif/tuto sur Pix App (PIX-18995). 
- [#13603](https://github.com/1024pix/pix/pull/13603) Tmp prompt ind retour panels 
- [#13605](https://github.com/1024pix/pix/pull/13605) update titre du module deepfake 

### :building_construction: Tech

- [#13594](https://github.com/1024pix/pix/pull/13594) Ajouter des candidats aux certifications des seeds (PIX-18448). 
- [#13588](https://github.com/1024pix/pix/pull/13588) Renommer la table "pix-teams" en "administration-teams" (PIX-19553) 

### :arrow_up: Montée de version

- [#13592](https://github.com/1024pix/pix/pull/13592) Mise à jour de @1024pix/epreuves-components 
- [#13600](https://github.com/1024pix/pix/pull/13600) Mise à jour du package epreuves-components

# [5.211.0](https://github.com/1024pix/pix/compare/v5.210.0...v5.211.0) (2025-09-17)

### :rocket: Amélioration

- [#13593](https://github.com/1024pix/pix/pull/13593) Module IA conso POI capacity-calculation et quelques modifs

# [5.210.0](https://github.com/1024pix/pix/compare/v5.209.0...v5.210.0) (2025-09-17)

### :rocket: Amélioration

- [#13575](https://github.com/1024pix/pix/pull/13575) Ajouter une carte pour reprendre un parcours combiné dans "Mes parcours" (PIX-19479) 
- [#13578](https://github.com/1024pix/pix/pull/13578) Copier l'event VIDEO_TRANSCRIPTION_OPENED du service metrics vers un passageEvent (PIX-18368) 
- [#13582](https://github.com/1024pix/pix/pull/13582) Modification suite panel interne IAGenFonction NOV 
- [#13456](https://github.com/1024pix/pix/pull/13456) Module biais indé - Scenario 1 (taboule + image) 
- [#13579](https://github.com/1024pix/pix/pull/13579) Rendre visible le bouton continuer dans les Parcours Combiné de type campagne (PIX-19537). 

### :bug: Correction

- [#13562](https://github.com/1024pix/pix/pull/13562) Rectifier l'affichage d'infos de complémentaire en fonction des rôles (PIX-19514). 
- [#13585](https://github.com/1024pix/pix/pull/13585) Utiliser le title de la campagne au lieu du nom utiliser pour PixOrga (PIX-19549).

# [5.209.0](https://github.com/1024pix/pix/compare/v5.208.0...v5.209.0) (2025-09-16)

### :rocket: Amélioration

- [#13561](https://github.com/1024pix/pix/pull/13561) Ajout des attestations Pix+Edu (PIX-19512) 
- [#13517](https://github.com/1024pix/pix/pull/13517) Ajouter une indication de progression au stepper horizontal (PIX-19432) 
- [#13571](https://github.com/1024pix/pix/pull/13571) Améliorer la gestion de la locale lors de l'initialisation des applications (PIX-19511) 
- [#13573](https://github.com/1024pix/pix/pull/13573) Copier l'event IMAGE_ALTERNATIVE_TEXT_OPENED du service metrics vers un passageEvent (PIX-18367) 
- [#13577](https://github.com/1024pix/pix/pull/13577) Supprimer la description d'un module sur Pix App (PIX-19538).

# [5.208.0](https://github.com/1024pix/pix/compare/v5.207.0...v5.208.0) (2025-09-16)

### :rocket: Amélioration

- [#13531](https://github.com/1024pix/pix/pull/13531) Ajouter les pre handler sur les deux routes de suppression de campagnes PixOrga et PixAdmin (PIX-19321). 
- [#13558](https://github.com/1024pix/pix/pull/13558) Renvoyer les `width`/`height` et type des éléments images si elles sont disponibles (PIX-19461) 
- [#13568](https://github.com/1024pix/pix/pull/13568) Supprimer le lien questionnaire de fin de module (PIX-19510) 

### :building_construction: Tech

- [#13564](https://github.com/1024pix/pix/pull/13564) :card_file_box: Autorise la valeur `null` pour la colonne `hasComplementaryReferential` de la table `complementary-certifications` (PIX-19527) 
- [#13549](https://github.com/1024pix/pix/pull/13549) Ajout I18N MINARM (PIX-XXX) 
- [#13560](https://github.com/1024pix/pix/pull/13560) Corriger le style de la page des Parcours Combiné sur PixApp (PIX-19521). 
- [#13576](https://github.com/1024pix/pix/pull/13576) epreuves-components: update du package 

### :coffee: Autre

- [#13572](https://github.com/1024pix/pix/pull/13572) Changement de slug pour expé

# [5.207.0](https://github.com/1024pix/pix/compare/v5.206.0...v5.207.0) (2025-09-15)

### :rocket: Amélioration

- [#13548](https://github.com/1024pix/pix/pull/13548) Afficher l'historique des versions du référentiel d'une complémentaire (PIX-18347). 
- [#13553](https://github.com/1024pix/pix/pull/13553) Ajouter le statut dans l'event QABCardAnsweredEvent (PIX-18918) 
- [#13563](https://github.com/1024pix/pix/pull/13563) Améliorer la position de l'illustration dans les détails du module (PIX-19520) 
- [#13565](https://github.com/1024pix/pix/pull/13565) Autoriser l'ajout d'une description et d'une illustration dans la création de Parcours Combiné (PIX-19525). 
- [#13556](https://github.com/1024pix/pix/pull/13556) Ne pas remonter les campagnes liées à des parcours combinés sur la page d'accueil et mes-parcours (PIX-19478). 

### :bug: Correction

- [#13566](https://github.com/1024pix/pix/pull/13566) Corriger une coquille dans la consigne du QCU découverte (PIX-19526) 
- [#13552](https://github.com/1024pix/pix/pull/13552) Réparer la page d'analyse de résultat d'une campagne (PIX-19515). 

### :building_construction: Tech

- [#13559](https://github.com/1024pix/pix/pull/13559) Ajouter la relation pixTeamId dans la table organizations (PIX-19513) 

### :arrow_up: Montée de version

- [#13539](https://github.com/1024pix/pix/pull/13539) Mise à jour de @1024pix/epreuves-components

# [5.206.0](https://github.com/1024pix/pix/compare/v5.205.1...v5.206.0) (2025-09-15)

### :rocket: Amélioration

- [#13541](https://github.com/1024pix/pix/pull/13541) Affichage des icônes de modules dans les parcours combinés (PIX-19414) 
- [#13532](https://github.com/1024pix/pix/pull/13532) Afficher un message de remerciement neutre en fin de parcours (PIX-19172) 
- [#13557](https://github.com/1024pix/pix/pull/13557) Ajout d'un lien de sortie sur les parcours combinés (PIX-19504) 
- [#13540](https://github.com/1024pix/pix/pull/13540) Ajouter une illustration et une description aux parcours combinés (PIX-19016) 
- [#13534](https://github.com/1024pix/pix/pull/13534) Autoriser la création de campagnes de parcours combinés sur des profils cibles non rattachés (PIX-19490). 
- [#13554](https://github.com/1024pix/pix/pull/13554) Créer la table pix-teams (PIX-19494) 
- [#13546](https://github.com/1024pix/pix/pull/13546) Module IA Hallucinations - suite panel Contenu 
- [#13547](https://github.com/1024pix/pix/pull/13547) Module les ia consomment modifs qcu et poi 
- [#13533](https://github.com/1024pix/pix/pull/13533) Récupération de l'historique des référentiels de certification d'une complémentaire (PIX-18345). 
- [#13530](https://github.com/1024pix/pix/pull/13530) Retirer la possibilité de supprimer une participation d'un campagne lié à un Parcours combiné (PIX-19322). 
- [#13537](https://github.com/1024pix/pix/pull/13537) Revoir les typo des modules (PIX-19502) 
- [#13544](https://github.com/1024pix/pix/pull/13544) Supprimer les bannières rendues inutiles par la nouvelle gestion des locales (PIX-19500) 
- [#13555](https://github.com/1024pix/pix/pull/13555) Tmp modif prompt ind 
- [#13535](https://github.com/1024pix/pix/pull/13535) Vérifier côté client le QCM (PIX-19335)

## [5.205.1](https://github.com/1024pix/pix/compare/v5.205.0...v5.205.1) (2025-09-12)

### :building_construction: Tech

- [#13482](https://github.com/1024pix/pix/pull/13482) Supprimer le feature toggle Use Locale dans les applications front (PIX-19273).

# [5.205.0](https://github.com/1024pix/pix/compare/v5.204.0...v5.205.0) (2025-09-12)

### :rocket: Amélioration

- [#13538](https://github.com/1024pix/pix/pull/13538) Afficher le bon titre pour l'attestation pour le ministère des armées (PIX-19503) 
- [#13525](https://github.com/1024pix/pix/pull/13525) Extraire les boutons d'action des grains de la carte (PIX-19491) 
- [#13536](https://github.com/1024pix/pix/pull/13536) Module alternatif deepfakes 
- [#13526](https://github.com/1024pix/pix/pull/13526) Module IA Hallu : correction coquille titre 
- [#13498](https://github.com/1024pix/pix/pull/13498) Passage du vouvoiement au tutoiement sur certains textes espagnols (PIX-19458) 

### :building_construction: Tech

- [#13516](https://github.com/1024pix/pix/pull/13516) Modifier le libellé des locales des invitations aux organisations dans pix-admin (PIX-16379) 
- [#13460](https://github.com/1024pix/pix/pull/13460) Utiliser deux routes pour séparer sujets/compétences dans les visualisation Plausible (PIX-16891). 

### :coffee: Autre

- [#13489](https://github.com/1024pix/pix/pull/13489) Modifier la génération des liens de l’urlService pour utiliser un queryParam locale à la place de queryParam lang  (PIX-19304)

# [5.204.0](https://github.com/1024pix/pix/compare/v5.203.0...v5.204.0) (2025-09-11)

### :rocket: Amélioration

- [#13486](https://github.com/1024pix/pix/pull/13486) Ajouter la date de création dans la page d'information de session admin (PIX-19282) 
- [#13510](https://github.com/1024pix/pix/pull/13510) Ajouter le template d'attestation MINARM (PIX-19463) 
- [#13512](https://github.com/1024pix/pix/pull/13512) Bloquer l'accès à la page paramètre de PixOrga d'une campagne appartenant à un Parcours Combiné (PIX-19314). 
- [#13515](https://github.com/1024pix/pix/pull/13515) Bloquer la suppression d'une campagne appartenant à un parcours combiné pour les prescripteurs (PIX-19352) 
- [#13511](https://github.com/1024pix/pix/pull/13511) Cacher le code campagne lorsque celle ci est intégré à un parcours combiné (PIX-19312). 
- [#13475](https://github.com/1024pix/pix/pull/13475) Changement de couleur des cartes mission pour le domaine 5 (PIX-19431) 
- [#13520](https://github.com/1024pix/pix/pull/13520) Changement de wording stepper vertical (PIX-19435) (PIX-19472) 
- [#13518](https://github.com/1024pix/pix/pull/13518) Empêcher de supprimer les quêtes dont l'id correspond à un parcours combiné (PIX-19017) 
- [#13527](https://github.com/1024pix/pix/pull/13527) Empêcher la création d'une campagne avec un code qui existe déjà sur un parcours combiné (PIX-19467) 
- [#13521](https://github.com/1024pix/pix/pull/13521) Faire en sorte que la preview soit ISO design (PIX-19473) 
- [#13499](https://github.com/1024pix/pix/pull/13499) Redirection de l'utilisateur s'il tape un code de parcours combiné après /campagnes dans l'URL (PIX-18781) 

### :bug: Correction

- [#13519](https://github.com/1024pix/pix/pull/13519) Afficher le message correspondant au statut UPLOADING dans la bannière d'import des prescrits 
- [#13513](https://github.com/1024pix/pix/pull/13513) L'état du bouton de réponse des QAB n'est pas réinitialisé (PIX-19466) 

### :building_construction: Tech

- [#13509](https://github.com/1024pix/pix/pull/13509) Modifier le libellé des locales des invitations aux centres de certification dans pix-admin (PIX-19344) 

### :arrow_up: Montée de version

- [#13506](https://github.com/1024pix/pix/pull/13506) Update adobe/s3mock Docker tag to v4.8.0 (.circleci) 
- [#13497](https://github.com/1024pix/pix/pull/13497) Update dependency @1024pix/pix-ui to ^55.26.12 (admin)

# [5.203.0](https://github.com/1024pix/pix/compare/v5.202.0...v5.203.0) (2025-09-10)

### :rocket: Amélioration

- [#13478](https://github.com/1024pix/pix/pull/13478) Ajouter la durée estimée d'un module au sein d'un parcours combiné (PIX-19027) 
- [#13492](https://github.com/1024pix/pix/pull/13492) Référencer les niveaux par énumération (PIX-19246) 

### :bug: Correction

- [#13406](https://github.com/1024pix/pix/pull/13406) Rejet d'une certification avec un score de 0 (PIX-17345) 

### :building_construction: Tech

- [#13514](https://github.com/1024pix/pix/pull/13514) Corriger l'usage de dates fixe dans le temps pour le test des organisation places lots (PIX-19468).

# [5.202.0](https://github.com/1024pix/pix/compare/v5.201.0...v5.202.0) (2025-09-09)

### :rocket: Amélioration

- [#13494](https://github.com/1024pix/pix/pull/13494) Ajouter l'animation au défilement des étapes (PIX-19286) 
- [#13386](https://github.com/1024pix/pix/pull/13386) Ajouter un pre-handler pour limiter l'accès des campagne de parcours combiné (PIX-19315). 
- [#13470](https://github.com/1024pix/pix/pull/13470) Améliorer accessibilité du Stepper et de la Step (PIX-19415) 
- [#13485](https://github.com/1024pix/pix/pull/13485) Enlever le fond de couleur sur les grains "défi" (PIX-19043) 
- [#13468](https://github.com/1024pix/pix/pull/13468) Passer les grains de démo de composants en type discovery (PIX-19427) 
- [#13484](https://github.com/1024pix/pix/pull/13484) Revoir la typo des titres de grain (leçon...) (PIX-19434) 
- [#13508](https://github.com/1024pix/pix/pull/13508) Supprimer la mention des 4 jours avant de repasser dans PixOrga (PIX-19464) 
- [#13495](https://github.com/1024pix/pix/pull/13495) Supprimer le statut "TO_SHARE" de PixOrga (PIX-19288) 
- [#13503](https://github.com/1024pix/pix/pull/13503) Tmp update module ia supervise 

### :arrow_up: Montée de version

- [#13487](https://github.com/1024pix/pix/pull/13487) Update dependency @1024pix/eslint-plugin to ^2.1.11 (dossier racine) 
- [#13488](https://github.com/1024pix/pix/pull/13488) Update dependency @1024pix/eslint-plugin to ^2.1.11 (e2e-playwright) 
- [#13490](https://github.com/1024pix/pix/pull/13490) Update dependency @1024pix/eslint-plugin to ^2.1.11 (junior) 
- [#13491](https://github.com/1024pix/pix/pull/13491) Update dependency @1024pix/eslint-plugin to ^2.1.11 (mon-pix) 
- [#13496](https://github.com/1024pix/pix/pull/13496) Update dependency @1024pix/eslint-plugin to ^2.1.11 (orga) 
- [#13501](https://github.com/1024pix/pix/pull/13501) Update dependency @1024pix/pix-ui to ^55.26.12 (certif) 
- [#13502](https://github.com/1024pix/pix/pull/13502) Update dependency @1024pix/pix-ui to ^55.26.12 (junior) 
- [#13504](https://github.com/1024pix/pix/pull/13504) Update dependency @1024pix/pix-ui to ^55.26.12 (mon-pix) 
- [#13505](https://github.com/1024pix/pix/pull/13505) Update dependency @1024pix/pix-ui to ^55.26.12 (orga)

# [5.201.0](https://github.com/1024pix/pix/compare/v5.200.0...v5.201.0) (2025-09-08)

### :rocket: Amélioration

- [#13458](https://github.com/1024pix/pix/pull/13458) Afficher un indicateur "Vous en êtes là" sur un item de parcours combiné (PIX-19018) 
- [#13467](https://github.com/1024pix/pix/pull/13467) Ajout module IA discute sections 
- [#13403](https://github.com/1024pix/pix/pull/13403) Corriger les problèmes remontés suite à la MEP de la page d'accueil (PIX-19401) 
- [#13441](https://github.com/1024pix/pix/pull/13441) Gérer le bouton suivant dans le stepper horizontal (PIX-19388) 

### :bug: Correction

- [#13397](https://github.com/1024pix/pix/pull/13397) Afficher la modale de confirmation en néerlandais si l'invitation à une organisation est en néerlandais (PIX-19395) 
- [#13396](https://github.com/1024pix/pix/pull/13396) Renvoyer l'invitation à une organisation dans la langue de l'invitation initiale depuis pix-orga (PIX-19392) 
- [#13443](https://github.com/1024pix/pix/pull/13443) Résolution du problème pour l'affichage des cartes mission (PIX-19413) 

### :building_construction: Tech

- [#13483](https://github.com/1024pix/pix/pull/13483) Mettre à jour les tests Playwright pour prendre en compte la nouvelle page d'accueil (PIX-19417) 
- [#13360](https://github.com/1024pix/pix/pull/13360) Remplacer la challenge locale par la user locale quand nécessaire (PIX-19136) 
- [#13430](https://github.com/1024pix/pix/pull/13430) Utiliser le champ isDisabled de PixIconButton sur les contrôles du stepper (PIX-19399) 

### :arrow_up: Montée de version

- [#13471](https://github.com/1024pix/pix/pull/13471) Update dependency @1024pix/ember-testing-library to ^3.0.13 (admin) 
- [#13472](https://github.com/1024pix/pix/pull/13472) Update dependency @1024pix/ember-testing-library to ^3.0.13 (certif) 
- [#13473](https://github.com/1024pix/pix/pull/13473) Update dependency @1024pix/ember-testing-library to ^3.0.13 (junior) 
- [#13474](https://github.com/1024pix/pix/pull/13474) Update dependency @1024pix/ember-testing-library to ^3.0.13 (mon-pix) 
- [#13476](https://github.com/1024pix/pix/pull/13476) Update dependency @1024pix/ember-testing-library to ^3.0.13 (orga) 
- [#13477](https://github.com/1024pix/pix/pull/13477) Update dependency @1024pix/eslint-plugin to ^2.1.11 (api) 
- [#13479](https://github.com/1024pix/pix/pull/13479) Update dependency @1024pix/eslint-plugin to ^2.1.11 (audit-logger) 
- [#13480](https://github.com/1024pix/pix/pull/13480) Update dependency @1024pix/eslint-plugin to ^2.1.11 (certif) 
- [#13389](https://github.com/1024pix/pix/pull/13389) Update dependency @getbrevo/brevo to v3 (api) 
- [#13451](https://github.com/1024pix/pix/pull/13451) Update dependency @sentry/ember to v10 (mon-pix)

# [5.200.0](https://github.com/1024pix/pix/compare/v5.199.0...v5.200.0) (2025-09-05)

### :rocket: Amélioration

- [#13429](https://github.com/1024pix/pix/pull/13429) Afficher les cadenas sur les items bloqués sur un parcours combiné (PIX-19020) 
- [#13372](https://github.com/1024pix/pix/pull/13372) Ajout du bouton "Reprendre mon parcours" sur les parcours combinés (PIX-19017) 
- [#13453](https://github.com/1024pix/pix/pull/13453) Modifications du module biais-inde suite à validation 
- [#13285](https://github.com/1024pix/pix/pull/13285) Modifs module ia-apprend-discussion-intermediaire 
- [#13450](https://github.com/1024pix/pix/pull/13450) Module Deepfakes - ajout sections et pix-articles 
- [#13455](https://github.com/1024pix/pix/pull/13455) Module IA hallu - ajout de sections et modifs mineures 
- [#13444](https://github.com/1024pix/pix/pull/13444) Module PPN CP- sections et retours ministère 
- [#13447](https://github.com/1024pix/pix/pull/13447) Module PPN JV - modifs de qcu découverte 

### :bug: Correction

- [#13431](https://github.com/1024pix/pix/pull/13431) Attendre l'instanciation du LearningContentRepository pour les certifs Pix+ (PIX-19410). 
- [#13445](https://github.com/1024pix/pix/pull/13445) Suppression de la propriété `has-complementary-referential` dans l'update d'une certif. complémentaire (PIX-19411). 

### :building_construction: Tech

- [#13385](https://github.com/1024pix/pix/pull/13385) Supprimer les anciennes tables de configurations de certification (PIX-19068) 

### :arrow_up: Montée de version

- [#13463](https://github.com/1024pix/pix/pull/13463) Update dependency @1024pix/ember-testing-library to ^3.0.9 (certif) 
- [#13464](https://github.com/1024pix/pix/pull/13464) Update dependency @1024pix/ember-testing-library to ^3.0.9 (junior) 
- [#13465](https://github.com/1024pix/pix/pull/13465) Update dependency @1024pix/ember-testing-library to ^3.0.9 (mon-pix) 
- [#13466](https://github.com/1024pix/pix/pull/13466) Update dependency @1024pix/ember-testing-library to ^3.0.9 (orga) 
- [#13446](https://github.com/1024pix/pix/pull/13446) Update dependency @1024pix/epreuves-components to ^1.2.1 (api) 
- [#13448](https://github.com/1024pix/pix/pull/13448) Update dependency @1024pix/epreuves-components to ^1.2.1 (junior) 
- [#13449](https://github.com/1024pix/pix/pull/13449) Update dependency @1024pix/epreuves-components to ^1.2.1 (mon-pix) 
- [#13439](https://github.com/1024pix/pix/pull/13439) Update dependency @1024pix/pix-ui to ^55.26.5 (orga)

# [5.199.0](https://github.com/1024pix/pix/compare/v5.198.0...v5.199.0) (2025-09-04)

### :rocket: Amélioration

- [#13393](https://github.com/1024pix/pix/pull/13393) Afficher le titre du Combinix 

### :bug: Correction

- [#13428](https://github.com/1024pix/pix/pull/13428) Corriger les tests flaky (PIX-19407) 

### :building_construction: Tech

- [#13287](https://github.com/1024pix/pix/pull/13287)  Utilise la base de donnée de l'API plutôt que le datamart pour les calibrations archivées (PIX-19164) 
- [#13338](https://github.com/1024pix/pix/pull/13338) Ajoute script pour importer les challenges calibrés (PIX-19279) 

### :arrow_up: Montée de version

- [#13417](https://github.com/1024pix/pix/pull/13417) Update dependency @1024pix/ember-testing-library to ^3.0.8 (admin) 
- [#13418](https://github.com/1024pix/pix/pull/13418) Update dependency @1024pix/ember-testing-library to ^3.0.8 (certif) 
- [#13419](https://github.com/1024pix/pix/pull/13419) Update dependency @1024pix/ember-testing-library to ^3.0.8 (junior) 
- [#13420](https://github.com/1024pix/pix/pull/13420) Update dependency @1024pix/ember-testing-library to ^3.0.8 (mon-pix) 
- [#13421](https://github.com/1024pix/pix/pull/13421) Update dependency @1024pix/ember-testing-library to ^3.0.8 (orga) 
- [#13398](https://github.com/1024pix/pix/pull/13398) Update dependency @1024pix/eslint-plugin to ^2.1.10 (api) 
- [#13411](https://github.com/1024pix/pix/pull/13411) Update dependency @1024pix/eslint-plugin to ^2.1.10 (audit-logger) 
- [#13412](https://github.com/1024pix/pix/pull/13412) Update dependency @1024pix/eslint-plugin to ^2.1.10 (certif) 
- [#13399](https://github.com/1024pix/pix/pull/13399) Update dependency @1024pix/eslint-plugin to ^2.1.10 (dossier racine) 
- [#13413](https://github.com/1024pix/pix/pull/13413) Update dependency @1024pix/eslint-plugin to ^2.1.10 (e2e-playwright) 
- [#13414](https://github.com/1024pix/pix/pull/13414) Update dependency @1024pix/eslint-plugin to ^2.1.10 (junior) 
- [#13415](https://github.com/1024pix/pix/pull/13415) Update dependency @1024pix/eslint-plugin to ^2.1.10 (mon-pix) 
- [#13416](https://github.com/1024pix/pix/pull/13416) Update dependency @1024pix/eslint-plugin to ^2.1.10 (orga) 
- [#13401](https://github.com/1024pix/pix/pull/13401) Update dependency @1024pix/pix-ui to ^55.25.14 (mon-pix) 
- [#13402](https://github.com/1024pix/pix/pull/13402) Update dependency @1024pix/pix-ui to ^55.25.15 (mon-pix) 
- [#13422](https://github.com/1024pix/pix/pull/13422) Update dependency @1024pix/pix-ui to ^55.26.2 (admin) 
- [#13423](https://github.com/1024pix/pix/pull/13423) Update dependency @1024pix/pix-ui to ^55.26.2 (junior) 
- [#13424](https://github.com/1024pix/pix/pull/13424) Update dependency @1024pix/pix-ui to ^55.26.2 (orga) 
- [#13425](https://github.com/1024pix/pix/pull/13425) Update dependency @1024pix/pix-ui to ^55.26.3 (admin) 
- [#13426](https://github.com/1024pix/pix/pull/13426) Update dependency @1024pix/pix-ui to ^55.26.3 (junior) 
- [#13427](https://github.com/1024pix/pix/pull/13427) Update dependency @1024pix/pix-ui to ^55.26.3 (orga) 
- [#13434](https://github.com/1024pix/pix/pull/13434) Update dependency @1024pix/pix-ui to ^55.26.5 (admin) 
- [#13436](https://github.com/1024pix/pix/pull/13436) Update dependency @1024pix/pix-ui to ^55.26.5 (certif) 
- [#13438](https://github.com/1024pix/pix/pull/13438) Update dependency @1024pix/pix-ui to ^55.26.5 (junior) 
- [#13435](https://github.com/1024pix/pix/pull/13435) Update dependency @1024pix/pix-ui to ^55.26.5 (mon-pix) 
- [#13407](https://github.com/1024pix/pix/pull/13407) Update dependency @1024pix/stylelint-config to ^5.1.37 (admin) 
- [#13408](https://github.com/1024pix/pix/pull/13408) Update dependency @1024pix/stylelint-config to ^5.1.37 (certif) 
- [#13409](https://github.com/1024pix/pix/pull/13409) Update dependency @1024pix/stylelint-config to ^5.1.37 (junior) 
- [#13400](https://github.com/1024pix/pix/pull/13400) Update dependency @1024pix/stylelint-config to ^5.1.37 (mon-pix) 
- [#13410](https://github.com/1024pix/pix/pull/13410) Update dependency @1024pix/stylelint-config to ^5.1.37 (orga) 
- [#13366](https://github.com/1024pix/pix/pull/13366) Update dependency @faker-js/faker to v10 (api)

# [5.198.0](https://github.com/1024pix/pix/compare/v5.197.0...v5.198.0) (2025-09-03)

### :rocket: Amélioration

- [#13373](https://github.com/1024pix/pix/pull/13373) Désactiver les propositions des QCM lors de la vérification des réponses (PIX-18932) 

### :bug: Correction

- [#13392](https://github.com/1024pix/pix/pull/13392) Réparer l'affichage du pendant des places disponibles lors d'un changement d'organisation (PIX-19380) 

### :building_construction: Tech

- [#13390](https://github.com/1024pix/pix/pull/13390) Corrige le mapping de la colonne PIX_PLUS_EDU_CPE dans l'import ODS candidats (PIX-19377)

# [5.197.0](https://github.com/1024pix/pix/compare/v5.196.0...v5.197.0) (2025-09-03)

### :rocket: Amélioration

- [#13364](https://github.com/1024pix/pix/pull/13364) Abaisser les niveaux de titre des modules (PIX-19233) 
- [#13308](https://github.com/1024pix/pix/pull/13308) Afficher la page d'accueil de Pix Orga par défaut (PIX-18958) 
- [#13352](https://github.com/1024pix/pix/pull/13352) Ajouter les contrôles précédent/suivant au stepper horizontal (PIX-19293) 
- [#13387](https://github.com/1024pix/pix/pull/13387) Module PPN ENT - Ajout sections et modifs ministère 
- [#13388](https://github.com/1024pix/pix/pull/13388) Module PPN JV - ajout sections et modifs ministère 
- [#13381](https://github.com/1024pix/pix/pull/13381) Permettre de définir la taille des colonnes de tableau dans les modules (PIX-19381) 

### :bug: Correction

- [#13384](https://github.com/1024pix/pix/pull/13384) Dans le QCU déclaratif, aligner les phrases longues à gauche (PIX-19371) 
- [#13369](https://github.com/1024pix/pix/pull/13369) Recharger les statistiques de participation de la page d'accueil (PIX-19350) 

### :building_construction: Tech

- [#13379](https://github.com/1024pix/pix/pull/13379) Améliorer les espacements entre les élements du composant PageTitle (PIX-19386). 
- [#13347](https://github.com/1024pix/pix/pull/13347) Gestion des locales dans les emails (partie 3) (PIX-19267) 
- [#13382](https://github.com/1024pix/pix/pull/13382) Upgrade du package pour ajouter nouveau POI calcul-impact 

### :arrow_up: Montée de version

- [#13391](https://github.com/1024pix/pix/pull/13391) Lock file maintenance (orga) 
- [#13380](https://github.com/1024pix/pix/pull/13380) Update dependency @faker-js/faker to v10 (orga)

# [5.196.0](https://github.com/1024pix/pix/compare/v5.195.0...v5.196.0) (2025-09-02)

### :rocket: Amélioration

- [#13356](https://github.com/1024pix/pix/pull/13356) Ajouter une api pour les parcours combinés (PIX-19311) 
- [#13370](https://github.com/1024pix/pix/pull/13370) Module IA vous avez dit IA : Ajout des sections et du POI  cursor 
- [#13374](https://github.com/1024pix/pix/pull/13374) Rendre le parser CSV résistant aussi aux espaces dans les en-têtes (PIX-19357) 

### :bug: Correction

- [#13349](https://github.com/1024pix/pix/pull/13349) Rattrapage des lieux de naissance absents des certificats PDF pour certains candidats inscrits par INSEE code (PIX-19191) 

### :building_construction: Tech

- [#13315](https://github.com/1024pix/pix/pull/13315) Ajouter de la gestion d'erreur si le lien d'un contenu formatif "modulix" recommandé ne passe pas la regex 
- [#13183](https://github.com/1024pix/pix/pull/13183) Chercher l'algo de déroulé dans la nouvelle table de configurations des certifications (PIX-19066). 
- [#13367](https://github.com/1024pix/pix/pull/13367) Corriger une erreur d'accessibilité Cypress 
- [#13371](https://github.com/1024pix/pix/pull/13371) Mise à jour du package epreuves-components 
- [#13341](https://github.com/1024pix/pix/pull/13341) Suppression de la table `certification-data-calibrations` (PIX-19296). 

### :arrow_up: Montée de version

- [#13375](https://github.com/1024pix/pix/pull/13375) Update dependency @1024pix/epreuves-components to ^1.1.0 (api) 
- [#13376](https://github.com/1024pix/pix/pull/13376) Update dependency @1024pix/epreuves-components to ^1.1.0 (junior) 
- [#13377](https://github.com/1024pix/pix/pull/13377) Update dependency @1024pix/epreuves-components to ^1.1.0 (mon-pix) 
- [#13365](https://github.com/1024pix/pix/pull/13365) Update dependency @badeball/cypress-cucumber-preprocessor to v23 (e2e) 
- [#13378](https://github.com/1024pix/pix/pull/13378) Update dependency @faker-js/faker to v10 (load-testing) 
- [#13361](https://github.com/1024pix/pix/pull/13361) Update dependency iconv-lite to ^0.7.0 (api) 
- [#13359](https://github.com/1024pix/pix/pull/13359) Update dependency webpack to v5.101.3 (junior)

# [5.195.0](https://github.com/1024pix/pix/compare/v5.194.0...v5.195.0) (2025-09-01)

### :rocket: Amélioration

- [#13332](https://github.com/1024pix/pix/pull/13332) Ajout POI module Romain 
- [#13342](https://github.com/1024pix/pix/pull/13342) Ajouter des indicateurs pour suivre les clics sur la nouvelle page d'accueil (PIX-19007) 
- [#13351](https://github.com/1024pix/pix/pull/13351) Animation des feedbacks (PIX-19326) 
- [#13335](https://github.com/1024pix/pix/pull/13335) Gestion de la locale dans les emails d'accès (PIX-19266). 
- [#13350](https://github.com/1024pix/pix/pull/13350) Modification module hallu  
- [#13343](https://github.com/1024pix/pix/pull/13343) Permettre enregistrement des réponses aux embed LLM autovalidés (PIX-19285) 
- [#13314](https://github.com/1024pix/pix/pull/13314) retours et modifs - Module biais independant 
- [#13345](https://github.com/1024pix/pix/pull/13345) Stepper horizontal ajouter un `aria-hidden="true"` sur les étapes cachés et une bordure sur les contrôles (PIX-19295) 
- [#13340](https://github.com/1024pix/pix/pull/13340) update module ia botaniste 

### :building_construction: Tech

- [#13317](https://github.com/1024pix/pix/pull/13317) :truck: Déplace le modèle `CompetenceResults` dans le contexte `prescription/campaign-participation` 
- [#13302](https://github.com/1024pix/pix/pull/13302) Ajouter de la validation au model back Combined Course 
- [#13310](https://github.com/1024pix/pix/pull/13310) Séparer les responsabilités du token service (partie 4) 

### :arrow_up: Montée de version

- [#13273](https://github.com/1024pix/pix/pull/13273) Update actions/checkout action to v5 (workflows) 
- [#13353](https://github.com/1024pix/pix/pull/13353) Update dependency @1024pix/stylelint-config to ^5.1.35 (admin) 
- [#13354](https://github.com/1024pix/pix/pull/13354) Update dependency @1024pix/stylelint-config to ^5.1.35 (certif) 
- [#13355](https://github.com/1024pix/pix/pull/13355) Update dependency @1024pix/stylelint-config to ^5.1.35 (junior) 
- [#13357](https://github.com/1024pix/pix/pull/13357) Update dependency @1024pix/stylelint-config to ^5.1.35 (mon-pix) 
- [#13358](https://github.com/1024pix/pix/pull/13358) Update dependency @1024pix/stylelint-config to ^5.1.35 (orga) 
- [#13224](https://github.com/1024pix/pix/pull/13224) Update dependency ember-source to ~6.6.0 (junior)

# [5.194.0](https://github.com/1024pix/pix/compare/v5.193.0...v5.194.0) (2025-08-29)

### :rocket: Amélioration

- [#13336](https://github.com/1024pix/pix/pull/13336) Afficher le numéro d'étape courante dans le Stepper horizontal (PIX-19287) 
- [#13339](https://github.com/1024pix/pix/pull/13339) Ajout du POI pix-article 
- [#13325](https://github.com/1024pix/pix/pull/13325) Ajouter le mode horizontal du stepper (PIX-19272) 
- [#13298](https://github.com/1024pix/pix/pull/13298) Envoyer les solutions et les feedbacks des QCM à la récupération des données du module (PIX-19240) 
- [#13327](https://github.com/1024pix/pix/pull/13327) Mettre a jour les traductions (PIX-19281) 
- [#13344](https://github.com/1024pix/pix/pull/13344) Modifier les trads du bloc pour gérer la session pix1D sur la page d'accueil (PIX-19294) 
- [#13328](https://github.com/1024pix/pix/pull/13328) Ne pas afficher le filtre sur les classes dans la page attestations si les participants n'ont pas de classe (PIX-19168) 

### :bug: Correction

- [#13334](https://github.com/1024pix/pix/pull/13334) ajouter un param par défault pour trackEvent 
- [#13309](https://github.com/1024pix/pix/pull/13309) Corriger l'affichage des places disponible sur la navigation de PixOrga (PIX-19261) 
- [#13346](https://github.com/1024pix/pix/pull/13346) Gerer l'erreur dans le cas ou un link de training est absolu (PIX-19308) 

### :building_construction: Tech

- [#13323](https://github.com/1024pix/pix/pull/13323)  rendre le nom de l'évènement obligatoire dans la fonction trackEvent de pixMetrics (PIX-19276) 
- [#13331](https://github.com/1024pix/pix/pull/13331) Suppression des imports de 'translations' dans l'API 
- [#13329](https://github.com/1024pix/pix/pull/13329) Utiliser getI18n dans les emails (PIX-18984) 
- [#13324](https://github.com/1024pix/pix/pull/13324) Utiliser la variable d'env `ANALYTICS_ENABLED` (PIX-19277)

# [5.193.0](https://github.com/1024pix/pix/compare/v5.192.0...v5.193.0) (2025-08-28)

### :rocket: Amélioration

- [#13330](https://github.com/1024pix/pix/pull/13330) Affiche un bloc de formation dans les parcours combiné quand il y a une campagne de diagnostique (PIX-18909) 
- [#13321](https://github.com/1024pix/pix/pull/13321) Ajout d’un test d’autovalidation dans le module demo-llm 
- [#13307](https://github.com/1024pix/pix/pull/13307) Ajouter des champs à l'API Maddo (PIX-19247). 
- [#13319](https://github.com/1024pix/pix/pull/13319) Ajouter les titres de section dans le passage de module (PIX-19231) 
- [#13316](https://github.com/1024pix/pix/pull/13316) Améliorer le wording EN sur la page statistiques, analyse de campagne (PIX-18975) 
- [#13288](https://github.com/1024pix/pix/pull/13288) Écrire la locale dans users.locale, à la connexion d'un utilisateur (PIX-19079) 
- [#13326](https://github.com/1024pix/pix/pull/13326) Update controle-parental.json 

### :bug: Correction

- [#13313](https://github.com/1024pix/pix/pull/13313) Corriger l'affichage sur la page de changement d'email (PIX-14089) 
- [#13318](https://github.com/1024pix/pix/pull/13318) Corriger UrlBaseService.pixAppForgottenPasswordUrl (PIX-19264) 
- [#13312](https://github.com/1024pix/pix/pull/13312) Empêcher l'accès au language switch depuis le compte sur domaine fr (PIX-7933) 

### :building_construction: Tech

- [#13233](https://github.com/1024pix/pix/pull/13233) :card_file_box: Ajoute une structure de donnée  pour accueillir les anciennes calibrations 
- [#13322](https://github.com/1024pix/pix/pull/13322) Récupérer les challenges actifs pour la création des référentiels cadres (PIX -19274) 
- [#13264](https://github.com/1024pix/pix/pull/13264) Suppression du scoring (completed) et du getNextChallenge en V2 (PIX-19199). 
- [#13311](https://github.com/1024pix/pix/pull/13311) Supprimer decodeIfValid du token-service

# [5.192.0](https://github.com/1024pix/pix/compare/v5.191.0...v5.192.0) (2025-08-27)

### :rocket: Amélioration

- [#13271](https://github.com/1024pix/pix/pull/13271) Afficher les statistiques de participations sur la page d'accueil de PixOrga (PIX-18959) 
- [#13300](https://github.com/1024pix/pix/pull/13300) Cacher les contenus recommandés à l'issue d'une campagne dans le cadre d'un parcours combiné 
- [#13301](https://github.com/1024pix/pix/pull/13301) Cacher les sections Profils cibles actuels et Badges d'une complémentaire dans Pix Admin (PIX-19089) 
- [#13260](https://github.com/1024pix/pix/pull/13260) Écrire la locale dans users.locale quand on modifie users.lang (PIX-18932) 
- [#13304](https://github.com/1024pix/pix/pull/13304) Module biais independant - v2 après point d'etape 

### :bug: Correction

- [#13279](https://github.com/1024pix/pix/pull/13279) Corriger le toggle "Cacher les organisations archivées" sur PixAdmin dans les profils cible (PIX-19182). 
- [#13305](https://github.com/1024pix/pix/pull/13305) Corriger les problèmes d'affichage sur la double mire Pix Certif (PIX-16112) 

### :building_construction: Tech

- [#13294](https://github.com/1024pix/pix/pull/13294) :truck: Déplace deux modèles en lecture seul vers le contexte partagé de la certification 
- [#13290](https://github.com/1024pix/pix/pull/13290) :truck: Déplace le modèle en lecture seul `CampaignParticipationOverview` vers un contexte de la prescription 
- [#13303](https://github.com/1024pix/pix/pull/13303) Séparer les responsabilités du token service (partie 3) (PIX-19242)

# [5.191.0](https://github.com/1024pix/pix/compare/v5.190.0...v5.191.0) (2025-08-26)

### :rocket: Amélioration

- [#13266](https://github.com/1024pix/pix/pull/13266) Affichage du statut terminé sur les éléments d'un parcours combiné (PIX-19077) 
- [#13281](https://github.com/1024pix/pix/pull/13281) Afficher dans PixOrga les organization-learners associés à des utilisateurs anonymisés (PIX-19192) 
- [#13297](https://github.com/1024pix/pix/pull/13297) Ajouter les titres de section dans la preview (PIX-19230) 
- [#13299](https://github.com/1024pix/pix/pull/13299) remplacer le wording anonymised par un tiret (PIX-19198) 

### :bug: Correction

- [#13270](https://github.com/1024pix/pix/pull/13270) Réparer la pagination de la page attestation (PIX-19193). 

### :building_construction: Tech

- [#13291](https://github.com/1024pix/pix/pull/13291) :truck: Déplace le modèle `CertifiableBadgeAcquisition` vers un contexte de certification 
- [#13296](https://github.com/1024pix/pix/pull/13296) :truck: Déplace le modèle `CertificationResult` vers le contexte `certification/results` 
- [#13289](https://github.com/1024pix/pix/pull/13289) :truck: Déplace le modèle en lecture seule `SharedProfileForCampaign` vers un contexte de la prescription 
- [#13295](https://github.com/1024pix/pix/pull/13295) Améliorer la performance de la requête qui remonte les targetProfiles à disposition d'une organisation 
- [#13292](https://github.com/1024pix/pix/pull/13292) Quitter le redis uniquement quand il existe 
- [#13284](https://github.com/1024pix/pix/pull/13284) Séparer les responsabilités du token service (partie 2) (PIX-19217) 
- [#13278](https://github.com/1024pix/pix/pull/13278) Utilisation d'URL relatives pour la redirection post-campagne (PIX-19131)

# [5.190.0](https://github.com/1024pix/pix/compare/v5.189.0...v5.190.0) (2025-08-25)

### :rocket: Amélioration

- [#13238](https://github.com/1024pix/pix/pull/13238) Afficher la certification passée par le candidat sur Pix Admin (PIX-19090). 
- [#13263](https://github.com/1024pix/pix/pull/13263) Cacher l'onglet Référentiel Cadre pour CléA sur Pix Admin (PIX-19144) 
- [#13248](https://github.com/1024pix/pix/pull/13248) Create tmp-ia-bias-ind.json 
- [#13276](https://github.com/1024pix/pix/pull/13276) Envoyer la solution et les feedbacks des QCU à la récupération des données du module (PIX-19220) 
- [#13280](https://github.com/1024pix/pix/pull/13280) Vérifier le QCU des modules côté client (PIX-19219) 

### :bug: Correction

- [#13269](https://github.com/1024pix/pix/pull/13269) Résoudre le crash API lors de l'activation de la feature Import avec Suppression de Learner (PIX-17414). 

### :building_construction: Tech

- [#13267](https://github.com/1024pix/pix/pull/13267) :truck: Déplace des tests dans leurs contextes spécifiques. 
- [#13277](https://github.com/1024pix/pix/pull/13277) Ajout de log de debug pour les erreurs d'api (PIX-18983) 
- [#13245](https://github.com/1024pix/pix/pull/13245) Ajout de seed pour avoir un centre de certification SUP avec habilitations à des Pix+ (PIX-19096). 
- [#13262](https://github.com/1024pix/pix/pull/13262) Ajouter les builders manquants pour ComplementaryCertification (PIX-19213) 
- [#13255](https://github.com/1024pix/pix/pull/13255) Séparer les responsabilités du token service (partie 1) (PIX-19215)

# [5.189.0](https://github.com/1024pix/pix/compare/v5.188.0...v5.189.0) (2025-08-22)

### :rocket: Amélioration

- [#13241](https://github.com/1024pix/pix/pull/13241) Ajouter des vérifications sur les routes des parcours combinés (PIX-19104) 
- [#13215](https://github.com/1024pix/pix/pull/13215) Ajouter la statistique des participations partagées les 30 derniers jours (PIX-18956) 
- [#13261](https://github.com/1024pix/pix/pull/13261) Créer un helper pour les tests de rôles sur les endpoints (PIX-19205) 
- [#13197](https://github.com/1024pix/pix/pull/13197) Permettre de créer des parcours combinés depuis PixAdmin (PIX-18162) 
- [#13247](https://github.com/1024pix/pix/pull/13247) Récupérer la locale depuis le cookie sous FT (PIX-18980) 
- [#13253](https://github.com/1024pix/pix/pull/13253) Renommer les fichiers index.js de route (PIX-19201) 

### :bug: Correction

- [#13254](https://github.com/1024pix/pix/pull/13254) Récupérer les épreuves fr-FR à la création d'un référentiel cadre (PIX-19208). 
- [#13257](https://github.com/1024pix/pix/pull/13257) Réparer la validation de mot de passe lors de création de compte sco (PIX-19209) 
- [#13258](https://github.com/1024pix/pix/pull/13258) Utiliser les challenges des référentiels cadres en cas de simulation de complémentaire (PIX-19189). 

### :building_construction: Tech

- [#12926](https://github.com/1024pix/pix/pull/12926) :broom: Nettoyage de plusieurs imports 
- [#13268](https://github.com/1024pix/pix/pull/13268) Mettre à jour les versions de postgresql et redis des review apps 
- [#13237](https://github.com/1024pix/pix/pull/13237) Renommer extractLocaleFromRequest en getChallengeLocale 

### :arrow_up: Montée de version

- [#13275](https://github.com/1024pix/pix/pull/13275) Lock file maintenance (orga) 
- [#13252](https://github.com/1024pix/pix/pull/13252) Update dependency @1024pix/pix-ui to ^55.25.3 (orga) 
- [#13225](https://github.com/1024pix/pix/pull/13225) Update dependency webpack to v5.101.0 (junior) 
- [#13272](https://github.com/1024pix/pix/pull/13272) Update dependency webpack to v5.101.2 (junior) 
- [#13235](https://github.com/1024pix/pix/pull/13235) Update nginx Docker tag to v1.29.1

# [5.188.0](https://github.com/1024pix/pix/compare/v5.187.0...v5.188.0) (2025-08-21)

### :rocket: Amélioration

- [#13186](https://github.com/1024pix/pix/pull/13186) Ajouter des liens à la page d'accueil de Pix Orga (PIX-18949) 
- [#13243](https://github.com/1024pix/pix/pull/13243) Ajouter le nouveau POI complete-phrase à modulix (relatif à pix-18766 | pix epreuves) 
- [#13244](https://github.com/1024pix/pix/pull/13244) Ajouter un endpoint pour récupérer les profils cibles filtrés par orga (PIX-19100) 
- [#13228](https://github.com/1024pix/pix/pull/13228) WIP module apprentissage supervise avec carousel 

### :bug: Correction

- [#13231](https://github.com/1024pix/pix/pull/13231) Les props des custom elements ne sont pas normalisés sur la page de prévisualisation de module (PIX-19169) 
- [#13239](https://github.com/1024pix/pix/pull/13239) Récupérer la dernière version d'un référentiel cadre de façon asynchrone (PIX-19187). 

### :building_construction: Tech

- [#13246](https://github.com/1024pix/pix/pull/13246) monté de version du package webcomponent 
- [#13227](https://github.com/1024pix/pix/pull/13227) Revoir les tests d'intégration du locale-switcher (PIX-19152) 

### :arrow_up: Montée de version

- [#13249](https://github.com/1024pix/pix/pull/13249) Update dependency @1024pix/pix-ui to ^55.25.3 (admin) 
- [#13250](https://github.com/1024pix/pix/pull/13250) Update dependency @1024pix/pix-ui to ^55.25.3 (junior) 
- [#13251](https://github.com/1024pix/pix/pull/13251) Update dependency @1024pix/pix-ui to ^55.25.3 (mon-pix)

# [5.187.0](https://github.com/1024pix/pix/compare/v5.186.0...v5.187.0) (2025-08-20)

### :rocket: Amélioration

- [#13232](https://github.com/1024pix/pix/pull/13232) Afficher la locale utilisée pour l'envoi des invitations à rejoindre un centre de certif dans pix-admin (PIX-17508) 
- [#13229](https://github.com/1024pix/pix/pull/13229) Afficher le nombre d'organisations enfant dans le titre de l'onglet (PIX-17881) 
- [#13236](https://github.com/1024pix/pix/pull/13236) Pouvoir passer une URL relative pour la redirection en fin de module (PIX-19130) 
- [#13206](https://github.com/1024pix/pix/pull/13206) Récupérer la ville de naissance à partir du code INSEE à l'ajout d'un candidat à une session SCO (PIX-18170). 
- [#13151](https://github.com/1024pix/pix/pull/13151) Récupérer le bon référentiel cadre lors de la sélection de l'épreuve (PIX-17885). 
- [#13214](https://github.com/1024pix/pix/pull/13214) retours JRO - les-ia-generatives-consomment 

### :bug: Correction

- [#13234](https://github.com/1024pix/pix/pull/13234) Réparer l'affichage du bandeau de langue non supportée  (PIX-19174) 

### :building_construction: Tech

- [#13230](https://github.com/1024pix/pix/pull/13230) :bug: Ne pas bloquer si un `recipientEmail` n'est pas associé au candidat 
- [#13170](https://github.com/1024pix/pix/pull/13170) Ne plus injecter request.i18n (PIX-18782) 
- [#13205](https://github.com/1024pix/pix/pull/13205) Simplifier l'affichage de la bannière d'éligibilité sur Pix App (PIX-19145) 

### :arrow_up: Montée de version

- [#13217](https://github.com/1024pix/pix/pull/13217) Update dependency @1024pix/pix-ui to ^55.25.2 (admin)

# [5.186.0](https://github.com/1024pix/pix/compare/v5.185.0...v5.186.0) (2025-08-19)

### :rocket: Amélioration

- [#13181](https://github.com/1024pix/pix/pull/13181) Afficher un message d'erreur à l'utilisateur sur la page du code candidat lorsque le centre n'a plus l'habilitation (PIX-19113). 
- [#13191](https://github.com/1024pix/pix/pull/13191) Ajouter l'import JSON pour la création d'un référentiel cadre (PIX-19143). 
- [#13207](https://github.com/1024pix/pix/pull/13207) Permettre la création de plusieurs campagne via la campaignAPI du contexte Prescription (PIX-19158). 
- [#13185](https://github.com/1024pix/pix/pull/13185) Suppression du message de perte d'éligibilité hors CléA sur l'espace surveillant (PIX-18854). 

### :bug: Correction

- [#13226](https://github.com/1024pix/pix/pull/13226) Afficher correctement la liste des participants (PIX-19165). 
- [#13210](https://github.com/1024pix/pix/pull/13210) Corriger la gestion des tags d'orga dans PixAdmin (PIX-19161) 
- [#13213](https://github.com/1024pix/pix/pull/13213) Permettre de retourner un masteryPercentage sans arrondi pour des calculs complexe (PIX-17143). 

### :building_construction: Tech

- [#13026](https://github.com/1024pix/pix/pull/13026) :card_file_box: Ajoute une contrainte d'unicité dans la table `certif-frameworks-challenges` (pix-18680) 
- [#13044](https://github.com/1024pix/pix/pull/13044) :truck: Déplace le modèle `ReproducibilityRate` vers le contexte de Certification 
- [#13200](https://github.com/1024pix/pix/pull/13200) Ajout de la nouvelle version patchée de epreuves-components 

### :arrow_up: Montée de version

- [#13201](https://github.com/1024pix/pix/pull/13201) Lock file maintenance (orga) 
- [#13221](https://github.com/1024pix/pix/pull/13221) Update adobe/s3mock Docker tag to v4.7.0 (.circleci) 
- [#13222](https://github.com/1024pix/pix/pull/13222) Update adobe/s3mock Docker tag to v4.7.0 (docker) 
- [#13223](https://github.com/1024pix/pix/pull/13223) Update adobe/s3mock Docker tag to v4.7.0 (dossier racine) 
- [#13202](https://github.com/1024pix/pix/pull/13202) Update dependency @1024pix/eslint-plugin to ^2.1.8 (api) 
- [#13203](https://github.com/1024pix/pix/pull/13203) Update dependency @1024pix/eslint-plugin to ^2.1.8 (audit-logger) 
- [#13208](https://github.com/1024pix/pix/pull/13208) Update dependency @1024pix/eslint-plugin to ^2.1.8 (certif) 
- [#13209](https://github.com/1024pix/pix/pull/13209) Update dependency @1024pix/eslint-plugin to ^2.1.8 (dossier racine) 
- [#13211](https://github.com/1024pix/pix/pull/13211) Update dependency @1024pix/eslint-plugin to ^2.1.8 (e2e-playwright) 
- [#13212](https://github.com/1024pix/pix/pull/13212) Update dependency @1024pix/eslint-plugin to ^2.1.8 (junior) 
- [#13216](https://github.com/1024pix/pix/pull/13216) Update dependency @1024pix/eslint-plugin to ^2.1.8 (mon-pix) 
- [#12987](https://github.com/1024pix/pix/pull/12987) Update dependency @1024pix/pix-ui to ^55.25.1 (admin) 
- [#12991](https://github.com/1024pix/pix/pull/12991) Update dependency @1024pix/pix-ui to ^55.25.1 (junior) 
- [#13073](https://github.com/1024pix/pix/pull/13073) Update dependency @1024pix/pix-ui to ^55.25.1 (mon-pix) 
- [#13219](https://github.com/1024pix/pix/pull/13219) Update dependency @1024pix/pix-ui to ^55.25.2 (junior) 
- [#13220](https://github.com/1024pix/pix/pull/13220) Update dependency @1024pix/pix-ui to ^55.25.2 (mon-pix) 
- [#13199](https://github.com/1024pix/pix/pull/13199) Update dependency @1024pix/pix-ui to ^55.25.2 (orga) 
- [#12937](https://github.com/1024pix/pix/pull/12937) Update Node.js to v22.17.1

# [5.185.0](https://github.com/1024pix/pix/compare/v5.184.0...v5.185.0) (2025-08-18)

### :rocket: Amélioration

- [#13196](https://github.com/1024pix/pix/pull/13196) Envoyer les sections de module au client (PIX-19149) 
- [#13182](https://github.com/1024pix/pix/pull/13182) Supprimer l'ancien feedback utilisateur lors de la certification sur Pix App (PIX-19133). 

### :bug: Correction

- [#13198](https://github.com/1024pix/pix/pull/13198) Ne pas afficher les boutons d'action lors de la prévisualisation de module existant (PIX-19127) 

### :building_construction: Tech

- [#13178](https://github.com/1024pix/pix/pull/13178) Ajouter un test e2e pour un parcours combiné (PIX-19121) 
- [#13194](https://github.com/1024pix/pix/pull/13194) Corriger le test flaky affichant le moment ou l'utilisateur peut repasser son parcours (PIX-19150). 

### :arrow_up: Montée de version

- [#13193](https://github.com/1024pix/pix/pull/13193) Update dependency @1024pix/epreuves-components to 0.9.5

# [5.184.0](https://github.com/1024pix/pix/compare/v5.183.0...v5.184.0) (2025-08-14)

### :rocket: Amélioration

- [#13192](https://github.com/1024pix/pix/pull/13192) Corriger la prévisualisation de modules (PIX-19148) 
- [#13190](https://github.com/1024pix/pix/pull/13190) Tmp update prompt intermediaire 

### :building_construction: Tech

- [#13179](https://github.com/1024pix/pix/pull/13179) Supprimer l’utilitaire PixWindow des front et utiliser l'utilitaire Location (PIX-19109)

# [5.183.0](https://github.com/1024pix/pix/compare/v5.182.0...v5.183.0) (2025-08-14)

### :rocket: Amélioration

- [#13180](https://github.com/1024pix/pix/pull/13180) Ajout d'un niveau "section" dans les contenus des modules (PIX-18992) 
- [#13174](https://github.com/1024pix/pix/pull/13174) Ajout d'une route pour obtenir des statistiques de participation (PIX-18955) 
- [#13172](https://github.com/1024pix/pix/pull/13172) Ajouter les bannières des typologies SCO / SCO-1D dans la page de presentation de l'organisation (PIX-18950). 
- [#13173](https://github.com/1024pix/pix/pull/13173) Empêcher l'accès à une certification (complémentaire ou double) si le centre n'a plus l'habilitation (PIX-19111). 
- [#13152](https://github.com/1024pix/pix/pull/13152) Permettre l'inscription d'une liste de candidats Pix+ via l'import d'une liste de candidats dans une session (.ods) (PIX-18595) 
- [#13155](https://github.com/1024pix/pix/pull/13155) Script de reprise des locales des utilisateurs (PIX-18985) 
- [#12901](https://github.com/1024pix/pix/pull/12901) Suppression de isCancelled pour CPF et LSU/LSL (PIX-16048). 

### :bug: Correction

- [#13187](https://github.com/1024pix/pix/pull/13187) Eviter les timeouts lors des épreuves de prompt avec le LLM en relayant les pings émis depuis l'API poc-llm (PIX-19139) 

### :building_construction: Tech

- [#13177](https://github.com/1024pix/pix/pull/13177) Migrer le scoring vers la nouvelle table de config flash (PIX-19067). 
- [#13150](https://github.com/1024pix/pix/pull/13150) Suppression de la colonne isCancelled dans la table "certification-courses" (PIX-16049). 
- [#13184](https://github.com/1024pix/pix/pull/13184) Supprimer l'usage de shared/models/index.js 
- [#13165](https://github.com/1024pix/pix/pull/13165) Utiliser l'url-service dans l'API (PIX-18981) 

### :arrow_up: Montée de version

- [#13189](https://github.com/1024pix/pix/pull/13189) Lock file maintenance (orga) 
- [#13188](https://github.com/1024pix/pix/pull/13188) Update dependency @1024pix/eslint-plugin to ^2.1.8 (orga)

# [5.182.0](https://github.com/1024pix/pix/compare/v5.181.0...v5.182.0) (2025-08-13)

### :rocket: Amélioration

- [#13156](https://github.com/1024pix/pix/pull/13156) Ajouter le support de l'événement `STEPPER_NEXT_STEP` (PIX-18365) 
- [#13137](https://github.com/1024pix/pix/pull/13137) Create tmp-def-ia-supervise.json 
- [#13159](https://github.com/1024pix/pix/pull/13159) Informer l'utilisateur qu'il a terminé son parcours combiné (PIX-18129) 
- [#13171](https://github.com/1024pix/pix/pull/13171) Permettre de prévisualiser un module existant (PIX-19112) 

### :bug: Correction

- [#13169](https://github.com/1024pix/pix/pull/13169) Corriger la restriction du dépassement de place lors du changement d'organisation (PIX-18991). 

### :building_construction: Tech

- [#13176](https://github.com/1024pix/pix/pull/13176) Repasser les imports dynamiques en imports statiques 
- [#13175](https://github.com/1024pix/pix/pull/13175) Valeurs par défaut des features toggle en RA et tests

# [5.181.0](https://github.com/1024pix/pix/compare/v5.180.0...v5.181.0) (2025-08-12)

### :rocket: Amélioration

- [#13158](https://github.com/1024pix/pix/pull/13158) Afficher la liste des organisations rattachées au profil cible (PIX-18867) 
- [#13121](https://github.com/1024pix/pix/pull/13121) Ajout d'une modale pour changer le nom des participants sur PixOrga (PIX-18971) 
- [#13168](https://github.com/1024pix/pix/pull/13168) Ajouter des méthodes pour récupérer les profils cibles filtré par orga (PIX-19108) 
- [#13117](https://github.com/1024pix/pix/pull/13117) Ajouter une page d'accueil sur Pix Orga (PIX-18948). 
- [#13163](https://github.com/1024pix/pix/pull/13163) Aligner le bouton "Passer l'activité" à gauche (PIX-19103) 
- [#13133](https://github.com/1024pix/pix/pull/13133) Changer l'algo de détection de local avec cookie dans PixCertif (PIX-18979)  
- [#13167](https://github.com/1024pix/pix/pull/13167) Ne plus vérifier le badge en cas de passage d'une certification complémentaire seul (PIX-19099). 
- [#13157](https://github.com/1024pix/pix/pull/13157) Passer l'url du combinix en cours lors du clic sur un item de type module (PIX-19061) 
- [#13139](https://github.com/1024pix/pix/pull/13139) Permettre l'inscription d'une liste de candidats Pix+ dans plusieurs sessions via la gestion massive des sessions (.csv) (PIX-18596) 
- [#13149](https://github.com/1024pix/pix/pull/13149) Renvoyer les informations de consommation de tokens après chaque message dans le cadre d'un simulateur LLM en preview (PIX-19082) 

### :bug: Correction

- [#13164](https://github.com/1024pix/pix/pull/13164) Renommer le bouton "commencer" affiché au début d'une épreuve timée (PIX-19105) 

### :building_construction: Tech

- [#13161](https://github.com/1024pix/pix/pull/13161) Algo de selection de challenge au format jsonb  (PIX-19083). 
- [#13160](https://github.com/1024pix/pix/pull/13160) Isoler la gestion des URLs Pix dans l'API 
- [#13147](https://github.com/1024pix/pix/pull/13147) Seeds pour peupler la nouvelle table de configurations certif (PIX-19072). 
- [#13105](https://github.com/1024pix/pix/pull/13105) Supprimer isCancelled dans le scoring (PIX-19002).

# [5.180.0](https://github.com/1024pix/pix/compare/v5.179.0...v5.180.0) (2025-08-11)

### :rocket: Amélioration

- [#13083](https://github.com/1024pix/pix/pull/13083) Supprimer isCancelled des routes d'annulation et de désannulation d'une certification (PIX-18855). 

### :building_construction: Tech

- [#13138](https://github.com/1024pix/pix/pull/13138) Copier la configuration des tables de config certif vers la nouvelle table (PIX-19064). 
- [#13148](https://github.com/1024pix/pix/pull/13148) Enregistrer l'assessmentId ou le passageId dans le Chat LLM persisté (PIX-19063) 
- [#13126](https://github.com/1024pix/pix/pull/13126) Inclure les données de surcharge de prompt de modération et de validation en preview lors des échanges avec POC-LLM (PIX-19040) 
- [#13019](https://github.com/1024pix/pix/pull/13019) Utiliser la clé de certif complémentaire au moment de l'ajout d'un candidat à une session (PIX-18902).

# [5.179.0](https://github.com/1024pix/pix/compare/v5.178.0...v5.179.0) (2025-08-08)

### :rocket: Amélioration

- [#13153](https://github.com/1024pix/pix/pull/13153) ajout du component pix-carousel dans module PPN JV + qcu-discovery dans PPN JV et PPNCP 
- [#13104](https://github.com/1024pix/pix/pull/13104) Changer l'algo de détection de local avec cookie dans PixAdmin (PIX-18977) 
- [#13119](https://github.com/1024pix/pix/pull/13119) Changer l'algo de détection de local avec cookie dans PixOrga (PIX-18978) 
- [#13145](https://github.com/1024pix/pix/pull/13145) Créer deux modules de démo quasiment vide à des fins de tests (PIX-19080) 
- [#13146](https://github.com/1024pix/pix/pull/13146) Modifs sur le module IA Deepfakes 
- [#13136](https://github.com/1024pix/pix/pull/13136) Revue design boutons action QAB (PIX-19065) 
- [#13131](https://github.com/1024pix/pix/pull/13131) Suppression de la vérification de certificat valide et badges lors de la réconciliation (PIX-19045). 
- [#13088](https://github.com/1024pix/pix/pull/13088) Suppression du bandeau hors CleA avant entrée en certification (PIX-18926). 
- [#13140](https://github.com/1024pix/pix/pull/13140) Suppression du feature-toggle  shouldDisplayNewAnalysisPage (PIX-17682) 

### :bug: Correction

- [#13098](https://github.com/1024pix/pix/pull/13098) Ignorer la case des emails des destinataires de résultats (PIX-12345) 
- [#13154](https://github.com/1024pix/pix/pull/13154) Réparer le démarrage de l'API Maddo (PIX-19085).

# [5.178.0](https://github.com/1024pix/pix/compare/v5.177.0...v5.178.0) (2025-08-08)

### :rocket: Amélioration

- [#13127](https://github.com/1024pix/pix/pull/13127) Ajouter la possibilité de passer une url de redirection en fin de modulix (PIX-19046) 
- [#13141](https://github.com/1024pix/pix/pull/13141) Ajouter les dates de création et mise à jour des lignes dans la table "combined_course_participations" (PIX-19073) 
- [#13125](https://github.com/1024pix/pix/pull/13125) Ajouter un bouton de réinitialisation de custom element (PIX-18931) 
- [#13130](https://github.com/1024pix/pix/pull/13130) Ajouter un feature toggle pour pouvoir filtrer la recommandation de contenu formatif par organisations (PIX-19057) 
- [#13129](https://github.com/1024pix/pix/pull/13129) Modif module Les IA ça consomme 
- [#13120](https://github.com/1024pix/pix/pull/13120) Permettre l'utilisation de `pix-cursor` et `llm-messages` dans les modules (PIX-18962) 

### :bug: Correction

- [#13128](https://github.com/1024pix/pix/pull/13128) Afficher la page d'analyse correctement même lorsqu'il n'y a pas de participation (PIX-19047). 
- [#13144](https://github.com/1024pix/pix/pull/13144) Invitation Centre de Certif: si un utilisateur a une invitation en attente, le code n'est pas envoyé dans l'URL (PIX-18961) 
- [#13132](https://github.com/1024pix/pix/pull/13132) Ne pas afficher la page des CGU pour les utilisateurs non connectés (PIX-19062) 

### :building_construction: Tech

- [#13135](https://github.com/1024pix/pix/pull/13135) Migrer la route possibilities vers son Bounded Context (PIX-16334) 
- [#13134](https://github.com/1024pix/pix/pull/13134) Preparer la future structure pour stocker les configuration de l'algo flash de certif (PIX-19042). 
- [#13143](https://github.com/1024pix/pix/pull/13143) Remplacer les feature toggles liés aux locales 
- [#13108](https://github.com/1024pix/pix/pull/13108) Supprimer isCancelled sur la publication d'une session et l'obtention des résultats via CSV (PIX-19003). 
- [#13101](https://github.com/1024pix/pix/pull/13101) Supprimer isCancelled sur les attestations et certificats Pix (PIX-18997). 
- [#13142](https://github.com/1024pix/pix/pull/13142) Supprimer les anciennes erreurs de locales sur PixApp 

### :coffee: Autre

- [#13053](https://github.com/1024pix/pix/pull/13053) Compléter et rendre plus pratique la validation des locales (PIX-18904)

# [5.177.0](https://github.com/1024pix/pix/compare/v5.176.0...v5.177.0) (2025-08-07)

### :rocket: Amélioration

- [#13097](https://github.com/1024pix/pix/pull/13097) Ajout d'une route pour changer le nom des participants (PIX-18970) 
- [#13099](https://github.com/1024pix/pix/pull/13099) Créer la table target-profile-training-organizations (PIX-18864) 
- [#13116](https://github.com/1024pix/pix/pull/13116) Mettre à jour les seeds côté Devcomp (PIX-19011) 
- [#13122](https://github.com/1024pix/pix/pull/13122) Modif module IA Hallucinations suite évolutions 
- [#13111](https://github.com/1024pix/pix/pull/13111) modifcations module IA vous avez dit IA ? suite évolutions 
- [#13118](https://github.com/1024pix/pix/pull/13118) modifs module IA deepfakes suite retours FTO 
- [#13110](https://github.com/1024pix/pix/pull/13110) Rediriger l'utilisateur à la page de parcours combiné lors de la fin de la campagne de diagnostique (PIX-18124) 
- [#13103](https://github.com/1024pix/pix/pull/13103) Suppression de isCancelled dans le check de vérification en entrée de certification (PIX-16048). 

### :bug: Correction

- [#13115](https://github.com/1024pix/pix/pull/13115) Permettre d'ignorer les valeurs par défaut de `modulix-editor` dans les arguments de POIs (PIX-18994) 

### :building_construction: Tech

- [#13075](https://github.com/1024pix/pix/pull/13075) placer le contexte prescription se trouvant dans src/shared dans src/prescription (PIX-15344) 
- [#13123](https://github.com/1024pix/pix/pull/13123) Suppression de warnings liés à l'ODS dans les fichiers de tests (PIX-18986). 
- [#13084](https://github.com/1024pix/pix/pull/13084) Supprimer isCancelled sur les pages de détail d'une certification/session sur Pix Admin (PIX-18974). 
- [#13113](https://github.com/1024pix/pix/pull/13113) Supprimer le feature toggle d'inscription d'un utilisateur après parcours anonyme (PIX-18027)

# [5.176.0](https://github.com/1024pix/pix/compare/v5.175.0...v5.176.0) (2025-08-06)

### :rocket: Amélioration

- [#13102](https://github.com/1024pix/pix/pull/13102) Afficher la bordure des Custom element seulement si ils sont interactifs (PIX-18999) 
- [#13107](https://github.com/1024pix/pix/pull/13107) Modifications module IA Deepfakes suite évolutions 
- [#13095](https://github.com/1024pix/pix/pull/13095) Permettre de visualiser les différent éléments Modulix (PIX-18993) 

### :building_construction: Tech

- [#13093](https://github.com/1024pix/pix/pull/13093) Supprimer l'ancienne route d'analyse des campagnes (PIX-17681).

# [5.175.0](https://github.com/1024pix/pix/compare/v5.174.0...v5.175.0) (2025-08-05)

### :rocket: Amélioration

- [#13061](https://github.com/1024pix/pix/pull/13061) Changer l'algo de détection de local  avec cookie dans PixApp (PIX-18780) 
- [#13094](https://github.com/1024pix/pix/pull/13094) Ne pas afficher les modules non recommandés par les diagnostiques dans un parcours combiné (PIX-18125) 
- [#13090](https://github.com/1024pix/pix/pull/13090) Permettre l'utilisation de `pix-carousel` dans les modules (PIX-18963) 

### :bug: Correction

- [#13071](https://github.com/1024pix/pix/pull/13071) Réparer l'affichage d'analyse d'une campagne lorsqu'il y a beaucoup de participations (PIX-18957).   
- [#13100](https://github.com/1024pix/pix/pull/13100) X-Forwarded-Host sans modification pour les RA 

### :building_construction: Tech

- [#13086](https://github.com/1024pix/pix/pull/13086) Supprimer l'ancienne page d'analyse de Pix Orga (PIX-17680).

# [5.174.0](https://github.com/1024pix/pix/compare/v5.173.0...v5.174.0) (2025-08-04)

### :rocket: Amélioration

- [#13078](https://github.com/1024pix/pix/pull/13078) Ajouter une api interne pour récuperer les orga learners et ses participations depuis un orga Id et user Id (PIX-18922) 
- [#12983](https://github.com/1024pix/pix/pull/12983) Suppression de l'éligibilité en dehors de CleA (PIX-18853). 
- [#13080](https://github.com/1024pix/pix/pull/13080) V2 module ENT nouveau pattern 

### :bug: Correction

- [#13066](https://github.com/1024pix/pix/pull/13066) Récupérer les infos du badge certifiant et non certifié sur la page d'éligibilité (PIX-18953). 

### :building_construction: Tech

- [#13040](https://github.com/1024pix/pix/pull/13040) :truck: Déplace le modèle `AnswerCollectionForScoring` vers le contexte `src/certification/shared/` 
- [#13047](https://github.com/1024pix/pix/pull/13047) :wastebasket: Supprime le fichier temporaire `EmailAttempt` 

### :arrow_up: Montée de version

- [#13092](https://github.com/1024pix/pix/pull/13092) Lock file maintenance (orga) 

### :coffee: Autre

- [#13085](https://github.com/1024pix/pix/pull/13085) Isoler et factoriser les locales (PIX-18903)

# [5.173.0](https://github.com/1024pix/pix/compare/v5.172.0...v5.173.0) (2025-08-01)

### :rocket: Amélioration

- [#13082](https://github.com/1024pix/pix/pull/13082) Interdire les `iframe` dans les contenus de Modules (PIX-18969)

# [5.172.0](https://github.com/1024pix/pix/compare/v5.171.0...v5.172.0) (2025-08-01)

### :rocket: Amélioration

- [#13065](https://github.com/1024pix/pix/pull/13065) Afficher le feedback sur un élément QAB (PIX-18946) 
- [#13074](https://github.com/1024pix/pix/pull/13074) Créer une api interne pour récupérer les modules recommandés depuis une liste d'id de profil cible (PIX-18923) 
- [#13076](https://github.com/1024pix/pix/pull/13076) Mettre à jour le feedback du schéma QAB (PIX-18964) (PIX-18900) 
- [#13070](https://github.com/1024pix/pix/pull/13070) Migrer les POIC d'iframe/embed vers l'élément `custom-draft` 
- [#13079](https://github.com/1024pix/pix/pull/13079) Modifier le texte de la carte de score (PIX-18967) (PIX-18900) 

### :bug: Correction

- [#13054](https://github.com/1024pix/pix/pull/13054) Corriger l'affichage du pourcentage de réussite en fin de campagnes (PIX-18929). 

### :building_construction: Tech

- [#13041](https://github.com/1024pix/pix/pull/13041) :wastebasket: Supprime des modèles inutilisées 
- [#13069](https://github.com/1024pix/pix/pull/13069) Supprimer le script qui fait du monitoring sur la migration API

# [5.171.0](https://github.com/1024pix/pix/compare/v5.170.0...v5.171.0) (2025-07-31)

### :rocket: Amélioration

- [#13068](https://github.com/1024pix/pix/pull/13068) Ajout vidéo maison "Bravo" dans le module souris-1 
- [#13062](https://github.com/1024pix/pix/pull/13062) Ajouter un champ feedback à l'élément QAB (PIX-18945) 
- [#13059](https://github.com/1024pix/pix/pull/13059) Changer la manière de calculer l'avancement d'un module pour un utilisateur (PIX-18938) 
- [#13064](https://github.com/1024pix/pix/pull/13064) Créer le type d'élément `custom-draft` (PIX-18815) 
- [#13058](https://github.com/1024pix/pix/pull/13058) Créer une api interne pour récupérer les modules recommandés lors de participations à des campagnes (PIX-18924) 
- [#13050](https://github.com/1024pix/pix/pull/13050) Module apprentissage IA intermediaire s31 
- [#13046](https://github.com/1024pix/pix/pull/13046) Persister et transmettre les informations de consommation de tokens vers la preview pour les épreuves avec prompt LLM (PIX-18928) 
- [#13067](https://github.com/1024pix/pix/pull/13067) Relayer l'info de modération d'un message adressé au LLM au front, et persister l'info dans le Chat (PIX-18943) 
- [#13056](https://github.com/1024pix/pix/pull/13056) Revue wording modules apprenants (PIX-18873) 

### :bug: Correction

- [#13057](https://github.com/1024pix/pix/pull/13057)  Corriger le fait qu'on ne peut plus passer à la carte suivante sur les Flashcards (PIX-18939 
- [#13037](https://github.com/1024pix/pix/pull/13037) Afficher correctement le référentiel dans le sélecteur de sujets sur Pix Orga (PIX-17183). 

### :building_construction: Tech

- [#13063](https://github.com/1024pix/pix/pull/13063) Corriger le double déploiement des frontends à la création de RA

# [5.170.0](https://github.com/1024pix/pix/compare/v5.169.0...v5.170.0) (2025-07-30)

### :rocket: Amélioration

- [#13043](https://github.com/1024pix/pix/pull/13043) : Modifs mineures sur module Deepfakes suite 1ers tests et retours 
- [#13023](https://github.com/1024pix/pix/pull/13023) Enlever le runtime NodeJS des containers front 
- [#13027](https://github.com/1024pix/pix/pull/13027) Intégrer le QCU découverte (PIX-18829) (PIX-18879) 
- [#13033](https://github.com/1024pix/pix/pull/13033) Retirer le champ `state` du feedback du QCU déclaratif (PIX-18440) 
- [#13051](https://github.com/1024pix/pix/pull/13051) Utilisation du `aria-disabled` plutôt que du `disabled` sur les proposal-buttons 
- [#13032](https://github.com/1024pix/pix/pull/13032) V2 Module contrôle parental 

### :bug: Correction

- [#13013](https://github.com/1024pix/pix/pull/13013) Corriger l'activation de la feature d'import lorsque l'organisation n'a pas de prescrits (PIX-17766). 
- [#13052](https://github.com/1024pix/pix/pull/13052) Corriger les fichiers de config Scalingo pour les RAs front 
- [#13049](https://github.com/1024pix/pix/pull/13049) faire remonter les paramètres de la feature d'attestation au front (PIX-18921) 

### :building_construction: Tech

- [#13036](https://github.com/1024pix/pix/pull/13036) :loud_sound: Changement du niveau de log pour réduire le bruit pour l'équipe Captains ! 
- [#13021](https://github.com/1024pix/pix/pull/13021) :truck: Déplace des fonctions utilitaires dans leurs contexte `certification/evaluation/` 
- [#13029](https://github.com/1024pix/pix/pull/13029) :truck: Déplace le modèle partagé `CertifiableProfileForLearningContent` vers le contexte  spécifique `src/certification/evaluation/` 
- [#13025](https://github.com/1024pix/pix/pull/13025) Améliorer la répartition des shards pour le job playwright des tests end-to-end pour ne pas exécuter plusieurs fois certains tests  
- [#12982](https://github.com/1024pix/pix/pull/12982) Isoler la logique des URL dans les fronts (PIX-18876) 
- [#13045](https://github.com/1024pix/pix/pull/13045) Isoler la logique du LocaleSwitcher dans PixOrga/PixCertif (PIX-18920) 
- [#13018](https://github.com/1024pix/pix/pull/13018) Isoler le LocaleSwitcher dans Pix App (PIX-18910) 
- [#13024](https://github.com/1024pix/pix/pull/13024) Relayer les informations de contexte depuis la configuration poc-llm vers le front (PIX-18912) 
- [#12997](https://github.com/1024pix/pix/pull/12997) Suppression du contexte flash-certification (PIX-18917). 
- [#13031](https://github.com/1024pix/pix/pull/13031) Supprimer les fichiers de génération d'éléments

# [5.169.0](https://github.com/1024pix/pix/compare/v5.168.0...v5.169.0) (2025-07-29)

### :rocket: Amélioration

- [#13000](https://github.com/1024pix/pix/pull/13000) Afficher les modules sur la page d'un parcours combiné (PIX-18847) 
- [#13012](https://github.com/1024pix/pix/pull/13012) Ajouter l'élément QCU découverte (PIX-18877) 
- [#13016](https://github.com/1024pix/pix/pull/13016) Ajouter l'événénement QCUDiscoveryAnswered (PIX-18880) 
- [#12908](https://github.com/1024pix/pix/pull/12908) Ajuster le CTA "Passer l'activité" (PIX-18797) 
- [#13014](https://github.com/1024pix/pix/pull/13014) Empêche le démarrage des activités d'un parcours combiné sur l'utilisateur n'a pas démarré (PIX-18905) 
- [#13002](https://github.com/1024pix/pix/pull/13002) Mettre à jour les scripts d'extraction CSV des modules (PIX-18892) 
- [#13007](https://github.com/1024pix/pix/pull/13007) Relayer l'information de réalisation des conditions de victoires, lors d'une épreuve de prompt LLM, au front (PIX-18886) 

### :bug: Correction

- [#12998](https://github.com/1024pix/pix/pull/12998) Afficher correctement les cartes récapitulatives des campagnes sur PixApp (PIX-17246). 
- [#13030](https://github.com/1024pix/pix/pull/13030) Corriger la gestion d'erreur dans deux usecases combinix (PIX-18838) 
- [#12947](https://github.com/1024pix/pix/pull/12947) Les seeds SCO n'etaient pas lie a une organization gerant des etudiants (PIX-18640). 

### :building_construction: Tech

- [#13022](https://github.com/1024pix/pix/pull/13022)  Montée de version pix-ui v55.25.1 sur PixOrga (PIX-18915) 

### :coffee: Autre

- [#12968](https://github.com/1024pix/pix/pull/12968) Isoler la logique des locales des fronts dans le service "locale" (PIX-18833) 
- [#12959](https://github.com/1024pix/pix/pull/12959) Isoler la logique des locales du front dans le service "locale"

# [5.168.0](https://github.com/1024pix/pix/compare/v5.167.0...v5.168.0) (2025-07-28)

### :rocket: Amélioration

- [#12974](https://github.com/1024pix/pix/pull/12974) Afficher la campagne de diagnostique sur la page d'un parcours combiné (PIX-18847) 
- [#12966](https://github.com/1024pix/pix/pull/12966) Afficher quelle Attestation est activé dans PixAdmin (PIX-18856). 
- [#13009](https://github.com/1024pix/pix/pull/13009) Ajout des fichiers de config Scalingo pour les RAs front 
- [#12984](https://github.com/1024pix/pix/pull/12984) Ajouter un contrôle sur les modules concernant l'hébergement des assets utilisés (PIX-18846) (PIX-18790) 
- [#12938](https://github.com/1024pix/pix/pull/12938) Scorer une certification via une calibration du datamart (PIX-18809). 
- [#12990](https://github.com/1024pix/pix/pull/12990) Update module tmp-ia-hallu suite à la validation Contenu 

### :bug: Correction

- [#13001](https://github.com/1024pix/pix/pull/13001) Afficher seulement les apprenants ayant un vrai compte dans la liste des attestations sur PixOrga (PIX-18860). 

### :building_construction: Tech

- [#12977](https://github.com/1024pix/pix/pull/12977) :truck: Déplace `CertifiedProfile` vers `src/certification/results/` 
- [#12975](https://github.com/1024pix/pix/pull/12975) :truck: Déplace `StudentForEnrolment` vers  `src/certification/enrolment/` 
- [#12973](https://github.com/1024pix/pix/pull/12973) :truck: Déplace une suite d'utilitaire numérique vers le contexte qui l'utilise : la gestion de session de certification 
- [#12989](https://github.com/1024pix/pix/pull/12989) Corriger les verifications des routes du certificat (PIX-18175). 
- [#12993](https://github.com/1024pix/pix/pull/12993) Suppression du feature toggle isV3CertificationPageEnabled (PIX-). 
- [#12978](https://github.com/1024pix/pix/pull/12978) utiliser le service pixMetrics (pix-18875)

# [5.167.0](https://github.com/1024pix/pix/compare/v5.166.0...v5.167.0) (2025-07-25)

### :rocket: Amélioration

- [#12967](https://github.com/1024pix/pix/pull/12967) : WIP module IA hallucinations avant validation 
- [#12866](https://github.com/1024pix/pix/pull/12866) Ajouter des événements Plausible lors de l'enrichissement d'un utilisateur anonyme (PIX-18522). 
- [#12911](https://github.com/1024pix/pix/pull/12911) Ajouter des titres aux grains Leçon et Récap (PIX-18813) 
- [#12936](https://github.com/1024pix/pix/pull/12936) Enrichir la validation des critères des quêtes pour ne plus insérer de mauvaise configuration en BDD (PIX-18836) 
- [#12905](https://github.com/1024pix/pix/pull/12905) Lors d'une conversation avec LLM, ajouter à l'événement de réception de pièce jointe une information pour indiquer si la pièce jointe est celle attendue ou pas (PIX-18806) 
- [#12962](https://github.com/1024pix/pix/pull/12962) Migrer tous les assets des modules vers assets.pix.org (PIX-18845) 

### :bug: Correction

- [#12960](https://github.com/1024pix/pix/pull/12960) Amélioration du rapport d'erreur de l'import des whitelist (PIX-18827) 

### :building_construction: Tech

- [#12963](https://github.com/1024pix/pix/pull/12963) :truck: Déplace `certificationChallengeRepository` vers un contexte de certification 
- [#12979](https://github.com/1024pix/pix/pull/12979) :truck: Déplace `CertificationPointOfContact` vers `/src/identity-access-management/` 
- [#12925](https://github.com/1024pix/pix/pull/12925) :truck: Déplace le modèle `OrganizationMemberIdentity` vers le contexte `src/team/` 
- [#12976](https://github.com/1024pix/pix/pull/12976) :truck: Déplace le modèle en lecture seul `StudentInformationForAccountRecovery` vers `src/identity-access-management/` 
- [#12969](https://github.com/1024pix/pix/pull/12969) :truck: Déplace le modèle en lecture seule `CampaignReport` vers le contexte `/src/prescription/campaign/` 
- [#12981](https://github.com/1024pix/pix/pull/12981) Créer les sample.env manquants pour les fronts 
- [#12954](https://github.com/1024pix/pix/pull/12954) Isoler la logique des URL des fronts (PIX-18811) 
- [#12980](https://github.com/1024pix/pix/pull/12980) Nettoyage variables d’env matomo 
- [#12970](https://github.com/1024pix/pix/pull/12970) Réorganiser le post-deployment de MaDDo 

### :coffee: Autre

- [#12933](https://github.com/1024pix/pix/pull/12933) Isoler la logique des locales des fronts dans le service "locale" (PIX-18810)

# [5.166.0](https://github.com/1024pix/pix/compare/v5.165.0...v5.166.0) (2025-07-24)

### :rocket: Amélioration

- [#12939](https://github.com/1024pix/pix/pull/12939) : revue classification des grains Module deepfakes 
- [#12859](https://github.com/1024pix/pix/pull/12859) : WIP Créa du module IA : Elles hallucinent, ces IA ! 
- [#12887](https://github.com/1024pix/pix/pull/12887) Afficher le référentiel cadre actuel d'une complémentaire (PIX-18346). 
- [#12790](https://github.com/1024pix/pix/pull/12790) Amélioration module tmp-ia-fonctionnement-debut (édito + ajout conv en web component) 
- [#12946](https://github.com/1024pix/pix/pull/12946) Améliorer le contenu des bandeaux lorsque l'organisation n'a plus de places (PIX-18837) 
- [#12943](https://github.com/1024pix/pix/pull/12943) Automatiquement fermer les PRs en draft sans activité depuis +30 jours 
- [#12941](https://github.com/1024pix/pix/pull/12941) Corriger les styles du QAB 
- [#12907](https://github.com/1024pix/pix/pull/12907) Modifs mineures sur le module IA vous avez dit IA 
- [#12906](https://github.com/1024pix/pix/pull/12906) Module apprentissage IA intermediaire s30 
- [#12955](https://github.com/1024pix/pix/pull/12955) V2 module Jeux vidéo pour coller au nouveau pattern 

### :bug: Correction

- [#12953](https://github.com/1024pix/pix/pull/12953) Redirige l'utilisateur connecté sur la page de réconciliation lorsqu'il accède à un parcours combiné (PIX-18835). 

### :building_construction: Tech

- [#12942](https://github.com/1024pix/pix/pull/12942) :sparkles: Réplication des données de calibrations du `datawharehouse` vers le `datamart` (PIX-18842) 
- [#12945](https://github.com/1024pix/pix/pull/12945) Renommer la table quest_participations et ajouter les contraintes nécessaires (PIX-18841)

# [5.165.0](https://github.com/1024pix/pix/compare/v5.164.0...v5.165.0) (2025-07-23)

### :rocket: Amélioration

- [#12873](https://github.com/1024pix/pix/pull/12873) afficher quand l'utilisateur pourra repasser la campagne (PIX-18513) 
- [#12825](https://github.com/1024pix/pix/pull/12825) Afficher une catégorie de temps estimé de passage d'un profil cible dans PixAdmin (Pix-18697). 
- [#12915](https://github.com/1024pix/pix/pull/12915) Corriger couleur légende et pointillés autour des POI (PIX-18818) 
- [#12860](https://github.com/1024pix/pix/pull/12860) Démarrer un parcours combiné (PIX-18121). 
- [#12921](https://github.com/1024pix/pix/pull/12921) Enlever le cache de la version des modules   (PIX-18716) 
- [#12879](https://github.com/1024pix/pix/pull/12879) Journal d'évènements d'un candidat en certification (PIX-18826). 
- [#12918](https://github.com/1024pix/pix/pull/12918) Mettre à jour le label du bouton Vérifier sur les modules (PIX-18814) 

### :bug: Correction

- [#12912](https://github.com/1024pix/pix/pull/12912) afficher la pagination avec la bonne locale dans orga (Pix-18678) 

### :building_construction: Tech

- [#12944](https://github.com/1024pix/pix/pull/12944) Ajout de données nécessaires dans les seeds pour pouvoir prévisualiser en local/RA le LLM 
- [#12940](https://github.com/1024pix/pix/pull/12940) Rendre silencieux les avertissements de deprecation de Pix App. 

### :arrow_up: Montée de version

- [#12916](https://github.com/1024pix/pix/pull/12916) Update dependency @1024pix/eslint-plugin to ^2.1.7 (certif) 
- [#12917](https://github.com/1024pix/pix/pull/12917) Update dependency @1024pix/eslint-plugin to ^2.1.7 (dossier racine) 
- [#12919](https://github.com/1024pix/pix/pull/12919) Update dependency @1024pix/eslint-plugin to ^2.1.7 (e2e-playwright) 
- [#12920](https://github.com/1024pix/pix/pull/12920) Update dependency @1024pix/eslint-plugin to ^2.1.7 (junior) 
- [#12923](https://github.com/1024pix/pix/pull/12923) Update dependency @1024pix/eslint-plugin to ^2.1.7 (mon-pix) 
- [#12924](https://github.com/1024pix/pix/pull/12924) Update dependency @1024pix/eslint-plugin to ^2.1.7 (orga) 
- [#12928](https://github.com/1024pix/pix/pull/12928) Update dependency @1024pix/stylelint-config to ^5.1.34 (junior) 
- [#12929](https://github.com/1024pix/pix/pull/12929) Update dependency @1024pix/stylelint-config to ^5.1.34 (mon-pix) 
- [#12931](https://github.com/1024pix/pix/pull/12931) Update dependency @1024pix/stylelint-config to ^5.1.34 (orga) 
- [#12932](https://github.com/1024pix/pix/pull/12932) Update dependency webpack to v5.100.2 (junior) 

### :coffee: Autre

- [#12896](https://github.com/1024pix/pix/pull/12896) Isoler la logique des locales des fronts dans le service "locale" (PIX-18785)

# [5.164.0](https://github.com/1024pix/pix/compare/v5.163.0...v5.164.0) (2025-07-22)

### :rocket: Amélioration

- [#12902](https://github.com/1024pix/pix/pull/12902) : Modifs mineures sur module IA Deepfakes 
- [#12807](https://github.com/1024pix/pix/pull/12807) Afficher les tags Découverte et Activité (PIX-18657) 
- [#12897](https://github.com/1024pix/pix/pull/12897) Choix de la bonne calibration en fonction de la date du certification-course (PIX-18770) 
- [#12881](https://github.com/1024pix/pix/pull/12881) Indiquer à l'utilisateur qu'il peut retenter une campagne (PIX-18519) 
- [#12858](https://github.com/1024pix/pix/pull/12858) Modifier affichage des éléments interactifs (PIX-18690)(PIX-18652) 

### :bug: Correction

- [#12900](https://github.com/1024pix/pix/pull/12900) Réparer les attestations qui nécessitent que la participation soit terminée (PIX-18803). 

### :building_construction: Tech

- [#12857](https://github.com/1024pix/pix/pull/12857) :truck: Déplace le `OrganizationLearnerPasswordResetDTO` vers son contexte (`src/prescription/organization-learner/`) 
- [#12889](https://github.com/1024pix/pix/pull/12889) :truck: Déplace le modèle `CertifiedScore` vers le contexte `src/certification/evaluation/` 

### :arrow_up: Montée de version

- [#12913](https://github.com/1024pix/pix/pull/12913) Update dependency @1024pix/eslint-plugin to ^2.1.7 (api) 
- [#12914](https://github.com/1024pix/pix/pull/12914) Update dependency @1024pix/eslint-plugin to ^2.1.7 (audit-logger) 
- [#12894](https://github.com/1024pix/pix/pull/12894) Update dependency @1024pix/pix-ui to ^55.25.0 (junior) 
- [#12871](https://github.com/1024pix/pix/pull/12871) Update dependency @1024pix/pix-ui to ^55.25.0 (orga) 
- [#12909](https://github.com/1024pix/pix/pull/12909) Update dependency @1024pix/stylelint-config to ^5.1.34 (admin) 
- [#12910](https://github.com/1024pix/pix/pull/12910) Update dependency @1024pix/stylelint-config to ^5.1.34 (certif) 

### :coffee: Autre

- [#12574](https://github.com/1024pix/pix/pull/12574) Consolidation de la documentation concernant l’architecture, notamment sur les nommage des tables en BDD

# [5.163.0](https://github.com/1024pix/pix/compare/v5.162.0...v5.163.0) (2025-07-21)

### :rocket: Amélioration

- [#12741](https://github.com/1024pix/pix/pull/12741) Vérifier que l'utilisateur a le droit d'accéder au parcours combiné (PIX-18514) 

### :building_construction: Tech

- [#12861](https://github.com/1024pix/pix/pull/12861) :truck: Déplace `CertifiedLevel.js` vers le contexte `src/certification/evaluation/` 
- [#12886](https://github.com/1024pix/pix/pull/12886) Déplacer les vidéos de modules vers des domaines Pix (PIX-18778) 
- [#12888](https://github.com/1024pix/pix/pull/12888) PixAdmin - retour design du styles des attributs de la page orga 
- [#12853](https://github.com/1024pix/pix/pull/12853) Utilisation de EventLoggingJob pour toutes les logs d'audit (PIX-15684) 

### :arrow_up: Montée de version

- [#12893](https://github.com/1024pix/pix/pull/12893) Update dependency @1024pix/pix-ui to ^55.25.0 (certif) 
- [#12899](https://github.com/1024pix/pix/pull/12899) Update dependency @1024pix/pix-ui to ^55.25.0 (mon-pix) 
- [#12898](https://github.com/1024pix/pix/pull/12898) Update dependency webpack to v5.100.1 (junior) 
- [#12863](https://github.com/1024pix/pix/pull/12863) Update slackapi/slack-github-action action to v2.1.1 (workflows)

# [5.162.0](https://github.com/1024pix/pix/compare/v5.161.0...v5.162.0) (2025-07-18)

### :rocket: Amélioration

- [#12882](https://github.com/1024pix/pix/pull/12882) Ajout d’un module de demo des composants Pix Épreuves (PIX-18777) 
- [#12891](https://github.com/1024pix/pix/pull/12891) Ajout des feature flags useLocale et useOnlyHapiI18n (PIX-18779) 

### :bug: Correction

- [#12895](https://github.com/1024pix/pix/pull/12895) Enlever le whereILike du getByCode de campaign

# [5.161.0](https://github.com/1024pix/pix/compare/v5.160.0...v5.161.0) (2025-07-18)

### :rocket: Amélioration

- [#12868](https://github.com/1024pix/pix/pull/12868) Corrections Module IA dit IA suite relecture harmonisation 
- [#12847](https://github.com/1024pix/pix/pull/12847) Écran de preview du LLM (PIX-18711) 
- [#12856](https://github.com/1024pix/pix/pull/12856) Redesign de la page de fin de passage de modulix (PIX-18634) 

### :bug: Correction

- [#12869](https://github.com/1024pix/pix/pull/12869) Autoriser le lowercase sur le code des campagnes  
- [#12872](https://github.com/1024pix/pix/pull/12872) Retrouver les challenges d'une certification complémentaire pour une simulation dédiée (PIX-18776). 
- [#12883](https://github.com/1024pix/pix/pull/12883) Utiliser les url complètes pour le suivi plausible (PIX-18165) 

### :building_construction: Tech

- [#12855](https://github.com/1024pix/pix/pull/12855) :card_file_box: Modifie des colonnes de `complementary-certifications` pour les rendre `nullable` 
- [#12767](https://github.com/1024pix/pix/pull/12767) :truck: Déplace le modèle `UserIdentity` vers `src/prescription/campaign-participation/` 
- [#12876](https://github.com/1024pix/pix/pull/12876) Désactiver le message de promo de dotenv 
- [#12884](https://github.com/1024pix/pix/pull/12884) Désactiver le message de promo de dotenv part 2 
- [#12862](https://github.com/1024pix/pix/pull/12862) Gérer les erreurs sur la route /api/oidc/identity-providers (PIX-18280) 
- [#12877](https://github.com/1024pix/pix/pull/12877) Mettre à jour des dépendances Audit Logger. 
- [#12878](https://github.com/1024pix/pix/pull/12878) Mettre à jour des dépendances Pix Admin 
- [#12874](https://github.com/1024pix/pix/pull/12874) PixAdmin - DescriptionList pour les attributs d'un user 
- [#12880](https://github.com/1024pix/pix/pull/12880) Recalculer quelle va être la prochaine épreuve à chaque appel, permet de changer d'épreuve en cas de changement de langue de l'utilisateur par exemple (PIX-18416) 
- [#12657](https://github.com/1024pix/pix/pull/12657) Seeds double certification CLEA V3 (PIX-18352). 

### :arrow_up: Montée de version

- [#12875](https://github.com/1024pix/pix/pull/12875) MàJ des composants pix-epreuves 
- [#12890](https://github.com/1024pix/pix/pull/12890) Update dependency @1024pix/epreuves-components to ^0.7.0 (junior) 
- [#12892](https://github.com/1024pix/pix/pull/12892) Update dependency @1024pix/pix-ui to ^55.25.0 (admin)

# [5.160.0](https://github.com/1024pix/pix/compare/v5.159.0...v5.160.0) (2025-07-17)

### :rocket: Amélioration

- [#12785](https://github.com/1024pix/pix/pull/12785) : Module controle parental QCU final --> QCU déclaratif 
- [#12824](https://github.com/1024pix/pix/pull/12824) Afficher les certifications passées par un utilisateur sur PixAdmin (PIX-18691). 
- [#12759](https://github.com/1024pix/pix/pull/12759) Créer une API interne permettant de récupérer le statut des modules pour un utlisateur (PIX-18342) 
- [#12848](https://github.com/1024pix/pix/pull/12848) Désactiver l'envoi automatique pour certaines organizations (PIX-18714). 
- [#12533](https://github.com/1024pix/pix/pull/12533) Injection d'une calibration dans le référentiel cadre (PIX-18032). 
- [#12850](https://github.com/1024pix/pix/pull/12850) Module apprentissage IA intermediaire s29 
- [#12843](https://github.com/1024pix/pix/pull/12843) Permettre de re-scorer une certification dans Pix Admin (PIX-18192). 
- [#12840](https://github.com/1024pix/pix/pull/12840) Route de prompt de conversation LLM de preview (PIX-18699) 

### :building_construction: Tech

- [#12849](https://github.com/1024pix/pix/pull/12849) :broom: Nettoyage d'un modèle dupliqué 
- [#12854](https://github.com/1024pix/pix/pull/12854) :sparkles: Ajout de la clef de complémentaire `EDU_CPE` (PIX-18722) 
- [#12844](https://github.com/1024pix/pix/pull/12844) Rendre l'utilitaire "fetchPage" du knex-utils "transaction compliant" 

### :arrow_up: Montée de version

- [#12845](https://github.com/1024pix/pix/pull/12845) Lock file maintenance (api) 
- [#12864](https://github.com/1024pix/pix/pull/12864) Update dependency @1024pix/pix-ui to ^55.24.0 (admin) 
- [#12865](https://github.com/1024pix/pix/pull/12865) Update dependency @1024pix/pix-ui to ^55.24.0 (certif) 
- [#12867](https://github.com/1024pix/pix/pull/12867) Update dependency @1024pix/pix-ui to ^55.24.0 (junior) 
- [#12870](https://github.com/1024pix/pix/pull/12870) Update dependency @1024pix/pix-ui to ^55.24.0 (mon-pix) 
- [#12851](https://github.com/1024pix/pix/pull/12851) Update dependency webpack to v5.100.0 (junior)

# [5.159.0](https://github.com/1024pix/pix/compare/v5.158.1...v5.159.0) (2025-07-16)

### :rocket: Amélioration

- [#12842](https://github.com/1024pix/pix/pull/12842) Ajustements sur la page de fin de parcours autonome (PIX-18613). 
- [#12837](https://github.com/1024pix/pix/pull/12837) ia-mon-premier-promptV5.json 
- [#12799](https://github.com/1024pix/pix/pull/12799) Lister les participants avec leur status d'obtention d'une attestation sur Pix Orga (PIX-18562). 
- [#12815](https://github.com/1024pix/pix/pull/12815) Modifier les CTA Passer et Vérifier (PIX-18683) 
- [#12784](https://github.com/1024pix/pix/pull/12784) Module apprentissage IA intermediaire s28 
- [#12818](https://github.com/1024pix/pix/pull/12818) Route de lecture de conversation de LLM de preview (PIX-18693) 

### :bug: Correction

- [#12836](https://github.com/1024pix/pix/pull/12836) Correction de l'affichage des badges d'orga "parent" /"enfant" (PIX-17879) 
- [#12841](https://github.com/1024pix/pix/pull/12841) Corriger la sérialisation d'un assessment issu d'une campagne qui n'est pas de type assessment  
- [#12834](https://github.com/1024pix/pix/pull/12834) Rediriger vers la campagne autonome apres login (PIX-18614) 

### :building_construction: Tech

- [#12839](https://github.com/1024pix/pix/pull/12839) :truck: Déplace un modèle en lecture seul vers son contexte métier 
- [#12838](https://github.com/1024pix/pix/pull/12838) Un peu de style dans la page organization de PixAdmin 

### :arrow_up: Montée de version

- [#12833](https://github.com/1024pix/pix/pull/12833) Update Node.js to v22.17.0

## [5.158.1](https://github.com/1024pix/pix/compare/v5.158.0...v5.158.1) (2025-07-15)

### :building_construction: Tech

- [#12835](https://github.com/1024pix/pix/pull/12835) Corriger le test e2e flaky sur les résultats de campagne 

### :arrow_up: Montée de version

- [#12829](https://github.com/1024pix/pix/pull/12829) Update adobe/s3mock Docker tag to v4.6.0 (.circleci) 
- [#12830](https://github.com/1024pix/pix/pull/12830) Update adobe/s3mock Docker tag to v4.6.0 (docker) 
- [#12831](https://github.com/1024pix/pix/pull/12831) Update adobe/s3mock Docker tag to v4.6.0 (dossier racine)

# [5.158.0](https://github.com/1024pix/pix/compare/v5.157.0...v5.158.0) (2025-07-14)

### :rocket: Amélioration

- [#12821](https://github.com/1024pix/pix/pull/12821) Création de la table quest_participations 
- [#12802](https://github.com/1024pix/pix/pull/12802) Masquer la valeur des « claims to store » dans la double mire SSO (PIX-18536) 

### :building_construction: Tech

- [#12822](https://github.com/1024pix/pix/pull/12822) :recycle: ajoute les secondes dans la version générée par le script de migration des challenges de référentiel de certification complémentaire (PIX-18694) 
- [#12826](https://github.com/1024pix/pix/pull/12826) Migrer les tests e2E de campagnes vers playwright 
- [#12817](https://github.com/1024pix/pix/pull/12817) Refactor des tests e2e playwright pour centraliser la lecture / écriture du fichier de référence. 
- [#12823](https://github.com/1024pix/pix/pull/12823) Uniformiser les noms des méthodes et variables liées à la limite de places des orgas (PIX-18698). 

### :arrow_up: Montée de version

- [#12827](https://github.com/1024pix/pix/pull/12827) Lock file maintenance (api) 
- [#12828](https://github.com/1024pix/pix/pull/12828) Lock file maintenance (audit-logger)

# [5.157.0](https://github.com/1024pix/pix/compare/v5.156.0...v5.157.0) (2025-07-11)

### :rocket: Amélioration

- [#12792](https://github.com/1024pix/pix/pull/12792) Ajout de nouveaux custom elements dans le schéma des modules (PIX-18530) 
- [#12801](https://github.com/1024pix/pix/pull/12801) Bloquer les actions d'orga si la limite des places est atteinte (PIX-18669). 
- [#12798](https://github.com/1024pix/pix/pull/12798) Construit une version à partir de la date a la création du référentiel cadre  (pix-18668) 
- [#12584](https://github.com/1024pix/pix/pull/12584) Création module les-ia-consomment 
- [#12810](https://github.com/1024pix/pix/pull/12810) Route de création de conversation LLM de preview (PIX-18670) 
- [#12816](https://github.com/1024pix/pix/pull/12816) Supprimer le message 'message de votre organisation' sur la page de fin de parcours  (PIX-18676). 
- [#12719](https://github.com/1024pix/pix/pull/12719) WIP mon-premier-prompt-V3 

### :building_construction: Tech

- [#12819](https://github.com/1024pix/pix/pull/12819) Migrer des tests d'import sup et sco vers playwright 
- [#12800](https://github.com/1024pix/pix/pull/12800) Parallelisation dans playwright 
- [#12789](https://github.com/1024pix/pix/pull/12789) Renvoyer au front des read models par type d'assessment 
- [#12820](https://github.com/1024pix/pix/pull/12820) Supprimer le endpoint GET /api/assessments/{id}/next

# [5.156.0](https://github.com/1024pix/pix/compare/v5.155.0...v5.156.0) (2025-07-10)

### :rocket: Amélioration

- [#12814](https://github.com/1024pix/pix/pull/12814) Enlever titres Fiche Recap et A Retenir (PIX-18679) 

### :bug: Correction

- [#12796](https://github.com/1024pix/pix/pull/12796) Supprimer la redirection infini lors d'une fin de campagne (PIX-18666). 

### :building_construction: Tech

- [#12803](https://github.com/1024pix/pix/pull/12803) :art: Ajoute une fonction `getNextId()`  au `datamartBuffer` 
- [#12804](https://github.com/1024pix/pix/pull/12804) :card_file_box: Ajout le préfixe `data_` oublié à deux tables du `datamart` 
- [#12765](https://github.com/1024pix/pix/pull/12765) :truck: Déplace la route `get course` vers `src/evaluation/` 
- [#12806](https://github.com/1024pix/pix/pull/12806) :truck: Déplace le modèle en lecture seul `CleaCertifiedCandidate` vers le context `src/certification/results/` 
- [#12805](https://github.com/1024pix/pix/pull/12805) :truck: Déplace le modèle en lecture seul `CpfCertificationResult` vers le contexte `/src/certification/session-management` 
- [#12795](https://github.com/1024pix/pix/pull/12795) Dernier fichier certif de lib a src 

### :arrow_up: Montée de version

- [#12786](https://github.com/1024pix/pix/pull/12786) Update adobe/s3mock Docker tag to v4.5.1 (.circleci) 
- [#12808](https://github.com/1024pix/pix/pull/12808) Update adobe/s3mock Docker tag to v4.5.1 (docker) 
- [#12809](https://github.com/1024pix/pix/pull/12809) Update adobe/s3mock Docker tag to v4.5.1 (dossier racine) 
- [#12811](https://github.com/1024pix/pix/pull/12811) Update dependency @1024pix/epreuves-components to ^0.6.0 (junior) 
- [#12812](https://github.com/1024pix/pix/pull/12812) Update dependency @1024pix/epreuves-components to ^0.6.0 (mon-pix) 
- [#12781](https://github.com/1024pix/pix/pull/12781) Update nginx Docker tag to v1.29.0 
- [#12758](https://github.com/1024pix/pix/pull/12758) Update Node.js to v22.17.0

# [5.155.0](https://github.com/1024pix/pix/compare/v5.154.0...v5.155.0) (2025-07-09)

### :rocket: Amélioration

- [#12748](https://github.com/1024pix/pix/pull/12748) Ajouter les pre handler sur les routes nécessaire dans PixOrga (PIX-18602). 

### :bug: Correction

- [#12787](https://github.com/1024pix/pix/pull/12787) Modulix - QAB affichage KO (PIX-18510) 

### :building_construction: Tech

- [#12797](https://github.com/1024pix/pix/pull/12797) :hammer: Ajoute une colonne version au `certification-frameworks-challenge` (pix-18665) 
- [#12794](https://github.com/1024pix/pix/pull/12794) désactivation du proxy buffering 
- [#12793](https://github.com/1024pix/pix/pull/12793) Supprime l'appel à GET /assessments/:id/next après le checkpoint.

# [5.154.0](https://github.com/1024pix/pix/compare/v5.153.0...v5.154.0) (2025-07-09)

### :rocket: Amélioration

- [#12776](https://github.com/1024pix/pix/pull/12776) :lipstick: Masque la bannière annonçant les périodes de certifiation pour les centres de certification scolaires (PIX-18639) 
- [#12782](https://github.com/1024pix/pix/pull/12782) Afficher une bannière sur Pix Orga lorsque le nombre de places limite est atteint (PIX-18633). 
- [#12773](https://github.com/1024pix/pix/pull/12773) Créer une table 'target_profiles_course_duration' et lui ajouter sa réplication maddo (PIX-18632). 
- [#12777](https://github.com/1024pix/pix/pull/12777) Déclencher l'envoi automatique lorsque la participation a été créé après une date (PIX-18631). 
- [#12764](https://github.com/1024pix/pix/pull/12764) Modification du nom de la claim Numen (chiffré) (PIX-18557) 
- [#12779](https://github.com/1024pix/pix/pull/12779) N'avoir qu'un seul logger afin d'être sur d'avoir les correlationId lorsque nécessaire (PIX-18554). 
- [#12791](https://github.com/1024pix/pix/pull/12791) Ne pas bloquer les places d'une orga si la feature n'est pas active (PIX-18656). 

### :bug: Correction

- [#12783](https://github.com/1024pix/pix/pull/12783) :lipstick: Masquer les chiffres dans le Pix Gauge sur la page certificat sur Pix App (PIX-18626) 
- [#12707](https://github.com/1024pix/pix/pull/12707) Rendre l'identifiant plus visible dans la double mire d'authentification SCO (PIX-18455) 
- [#12706](https://github.com/1024pix/pix/pull/12706) Rendre transactionnel le scoring V3 (PIX-18354). 

### :building_construction: Tech

- [#12742](https://github.com/1024pix/pix/pull/12742) Activation de Playwright dans le flux de CI + ajout de test pour la non régression sur tous les types d'évaluation 
- [#12788](https://github.com/1024pix/pix/pull/12788) N'appelle pas GET /attestation-details en double.

# [5.153.0](https://github.com/1024pix/pix/compare/v5.152.0...v5.153.0) (2025-07-08)

### :rocket: Amélioration

- [#12778](https://github.com/1024pix/pix/pull/12778) Ajout d'une colonnne "name" sur la table quests 
- [#12754](https://github.com/1024pix/pix/pull/12754) Mob design quickwin sur les modules (PIX-18619) 
- [#12722](https://github.com/1024pix/pix/pull/12722) Redirige l'utilisateur sur la page de parcours combiné lorsqu'il saisi un code (PIX-18472) 

### :bug: Correction

- [#12739](https://github.com/1024pix/pix/pull/12739) Ne pas prendre en compte l'envoie de la PJ dans le compte du pormpt limite lorsqu'il est accompagné d'un message (PIX-18500) 
- [#12780](https://github.com/1024pix/pix/pull/12780) Rediriger vers la prochaine épreuve quand on essaie d'accéder à une épreuve loin dans le futur. 

### :building_construction: Tech

- [#12766](https://github.com/1024pix/pix/pull/12766) :truck: Déplace le modèle `UserOrganizationForAdmin` vers `src/team/` 
- [#12774](https://github.com/1024pix/pix/pull/12774) Renomme le usecase `getNextChallenge` en `updateAssessmentWithNextChallenge` pour refléter son nouveau comportement.

# [5.152.0](https://github.com/1024pix/pix/compare/v5.151.0...v5.152.0) (2025-07-07)

### :rocket: Amélioration

- [#12756](https://github.com/1024pix/pix/pull/12756) Modification du texte de presentation du mode interro (PIX-18621) 

### :building_construction: Tech

- [#12763](https://github.com/1024pix/pix/pull/12763) Corriger les tests flaky du LSU/LSL (PIX-18508). 
- [#12711](https://github.com/1024pix/pix/pull/12711) Eviter le double appel à /api/assessments/:id/next 

### :arrow_up: Montée de version

- [#12768](https://github.com/1024pix/pix/pull/12768) Update dependency dotenv to v17 (api) 
- [#12769](https://github.com/1024pix/pix/pull/12769) Update dependency dotenv to v17 (audit-logger) 
- [#12770](https://github.com/1024pix/pix/pull/12770) Update dependency dotenv to v17 (e2e-playwright) 
- [#12771](https://github.com/1024pix/pix/pull/12771) Update dependency dotenv to v17 (junior) 
- [#12772](https://github.com/1024pix/pix/pull/12772) Update dependency dotenv to v17 (mon-pix)

# [5.151.0](https://github.com/1024pix/pix/compare/v5.150.0...v5.151.0) (2025-07-04)

### :rocket: Amélioration

- [#12721](https://github.com/1024pix/pix/pull/12721) Ajouter la possibilité de bloquer une organisation qui n'a plus de place dispo (PIX-18548). 

### :building_construction: Tech

- [#12755](https://github.com/1024pix/pix/pull/12755) Afficher en console les erreurs d'API identifiées par leur request-id (PIX-18618).

# [5.150.0](https://github.com/1024pix/pix/compare/v5.149.0...v5.150.0) (2025-07-04)

### :rocket: Amélioration

- [#12751](https://github.com/1024pix/pix/pull/12751) : Modifs Module IA, vous avez dit IA ? suite retours PYO 
- [#12700](https://github.com/1024pix/pix/pull/12700) Ajouter dans les erreurs du domain et http un id technique pour tracer les erreurs plus facilement (PIX-18521). 

### :bug: Correction

- [#12752](https://github.com/1024pix/pix/pull/12752) Répare l'accès aux campagnes qui ont isSimplifiedAccess et isForAbsoluteNovice à true 

### :building_construction: Tech

- [#12736](https://github.com/1024pix/pix/pull/12736) Mise à jour des dépendances PixAdmin 
- [#12737](https://github.com/1024pix/pix/pull/12737) Récupérer Ember Inspector sur Pix Admin (PIX-18558). 
- [#12740](https://github.com/1024pix/pix/pull/12740) Renommer les colonnes alpha et delta dans la table certification-frameworks-challenges (PIX-18509). 

### :arrow_up: Montée de version

- [#12750](https://github.com/1024pix/pix/pull/12750) Update adobe/s3mock Docker tag to v4.5.0 (.circleci) 
- [#12753](https://github.com/1024pix/pix/pull/12753) Update adobe/s3mock Docker tag to v4.5.0 (docker) 
- [#12757](https://github.com/1024pix/pix/pull/12757) Update adobe/s3mock Docker tag to v4.5.0 (dossier racine) 
- [#12732](https://github.com/1024pix/pix/pull/12732) Update dependency @1024pix/pix-ui to ^55.23.1 (orga)

# [5.149.0](https://github.com/1024pix/pix/compare/v5.148.1...v5.149.0) (2025-07-03)

### :rocket: Amélioration

- [#12716](https://github.com/1024pix/pix/pull/12716) Afficher la date et l'heure de l'envoie des résultats de campagne (PIX-18081) 
- [#12710](https://github.com/1024pix/pix/pull/12710) Créer un seed de quête avec un code et un organizationId (PIX-18474) 

### :bug: Correction

- [#12746](https://github.com/1024pix/pix/pull/12746) Corriger le type du champ alt des images dans le schéma du QAB (PIX-18592) 

### :building_construction: Tech

- [#12715](https://github.com/1024pix/pix/pull/12715) :card_file_box: Modification du type du champ `calibration_id` pour qu'il corresponde à celui de la table `calibrations` (PIX-18533) 

### :arrow_up: Montée de version

- [#12731](https://github.com/1024pix/pix/pull/12731) Update dependency @1024pix/pix-ui to ^55.23.1 (mon-pix) 
- [#12744](https://github.com/1024pix/pix/pull/12744) Update dependency @1024pix/stylelint-config to ^5.1.33 (certif) 
- [#12745](https://github.com/1024pix/pix/pull/12745) Update dependency @1024pix/stylelint-config to ^5.1.33 (junior) 
- [#12747](https://github.com/1024pix/pix/pull/12747) Update dependency @1024pix/stylelint-config to ^5.1.33 (mon-pix) 
- [#12749](https://github.com/1024pix/pix/pull/12749) Update dependency @1024pix/stylelint-config to ^5.1.33 (orga)

## [5.148.1](https://github.com/1024pix/pix/compare/v5.148.0...v5.148.1) (2025-07-02)

### :bug: Correction

- [#12735](https://github.com/1024pix/pix/pull/12735) Corriger l'inscription au CLEA sur Pix Certif (PIX-18560). 

### :building_construction: Tech

- [#12643](https://github.com/1024pix/pix/pull/12643) PixAdmin - migrer les tests de composants de unitaire à integration (P2)

# [5.148.0](https://github.com/1024pix/pix/compare/v5.147.0...v5.148.0) (2025-07-02)

### :rocket: Amélioration

- [#12717](https://github.com/1024pix/pix/pull/12717) : Ajout images sur asset Module IA vous avez dit IA ? 
- [#12720](https://github.com/1024pix/pix/pull/12720) Déplacer le curseur sur l'étape en cours dans le didacticiel et rendre la navigation dans les étapes plus agréable au lecteur d'écran (PIX-18545) 
- [#12712](https://github.com/1024pix/pix/pull/12712) Indiquer à l'utilisateur que ses résultats seront transmis automatiquement à la fin de son parcours (PIX-18482) 
- [#12702](https://github.com/1024pix/pix/pull/12702) Ne pas afficher les méthodes de connexion SSO si l'utilisateur est anonyme (PIX-18505) 

### :bug: Correction

- [#12694](https://github.com/1024pix/pix/pull/12694) Corriger la largeur des colonnes en cas de mots longs sur Pix Certif (PIX-18501). 

### :building_construction: Tech

- [#12718](https://github.com/1024pix/pix/pull/12718) Réparer l'accès aux fichiers par Ember Inspector sur mon-pix 
- [#12606](https://github.com/1024pix/pix/pull/12606) Supprimer la propriété "isComplementaryAlone" (PIX-18103). 
- [#12518](https://github.com/1024pix/pix/pull/12518) Supprimer le feature toggle setupEchoSystemBeforeStart 

### :arrow_up: Montée de version

- [#12723](https://github.com/1024pix/pix/pull/12723) Update dependency @1024pix/eslint-plugin to ^2.1.6 (api) 
- [#12724](https://github.com/1024pix/pix/pull/12724) Update dependency @1024pix/eslint-plugin to ^2.1.6 (audit-logger) 
- [#12725](https://github.com/1024pix/pix/pull/12725) Update dependency @1024pix/eslint-plugin to ^2.1.6 (certif) 
- [#12726](https://github.com/1024pix/pix/pull/12726) Update dependency @1024pix/eslint-plugin to ^2.1.6 (dossier racine) 
- [#12727](https://github.com/1024pix/pix/pull/12727) Update dependency @1024pix/eslint-plugin to ^2.1.6 (e2e-playwright) 
- [#12728](https://github.com/1024pix/pix/pull/12728) Update dependency @1024pix/eslint-plugin to ^2.1.6 (junior) 
- [#12729](https://github.com/1024pix/pix/pull/12729) Update dependency @1024pix/eslint-plugin to ^2.1.6 (mon-pix) 
- [#12730](https://github.com/1024pix/pix/pull/12730) Update dependency @1024pix/eslint-plugin to ^2.1.6 (orga) 
- [#12687](https://github.com/1024pix/pix/pull/12687) Update dependency @1024pix/pix-ui to ^55.23.1 (admin) 
- [#12688](https://github.com/1024pix/pix/pull/12688) Update dependency @1024pix/pix-ui to ^55.23.1 (certif) 
- [#12698](https://github.com/1024pix/pix/pull/12698) Update dependency @1024pix/pix-ui to ^55.23.1 (junior)

# [5.147.0](https://github.com/1024pix/pix/compare/v5.146.0...v5.147.0) (2025-07-01)

### :rocket: Amélioration

- [#12699](https://github.com/1024pix/pix/pull/12699) : modif url vidéo Einstein dans module ia-deepfakes 
- [#12630](https://github.com/1024pix/pix/pull/12630) Ajouter le contexte de la pièce jointe correspondante lors d'une conversation avec LLM si l'utilisateur transmet la bonne pièce jointe (PIX-18334) 
- [#12690](https://github.com/1024pix/pix/pull/12690) Migration BDD ajouter une colonne "code" et une colonne "organizationId" à la table "quests" (PIX-18466) 

### :bug: Correction

- [#12703](https://github.com/1024pix/pix/pull/12703) Corriger le numéro de version dans le workflow de release 

### :building_construction: Tech

- [#12678](https://github.com/1024pix/pix/pull/12678) Ajoute la notion de "VerifiedCode" pour pouvoir distinguer les campagnes des parcours combinés. 
- [#12701](https://github.com/1024pix/pix/pull/12701) Permettre de spécifier quelle release récupérer côté PixApi lorsqu'un ID de release est renseigné dans une variable d'env 
- [#12705](https://github.com/1024pix/pix/pull/12705) Récupérer la réponse à une épreuve uniquement lorsqu'on affiche une épreuve déjà répondue 

### :arrow_up: Montée de version

- [#12714](https://github.com/1024pix/pix/pull/12714) MàJ de @1024pix/epreuves-components

# [5.146.0](https://github.com/1024pix/pix/compare/v5.145.0...v5.146.0) (2025-06-30)

### :rocket: Amélioration

- [#12697](https://github.com/1024pix/pix/pull/12697) Ajouter un minimum de CSS aux tableaux HTML insérés dans les WYSIWYG pour les rendre lisible (PIX-18502) 
- [#12648](https://github.com/1024pix/pix/pull/12648) Migrer les événements ANSWERED en Passage Events (PIX-18444) 
- [#12696](https://github.com/1024pix/pix/pull/12696) modif post valid 27/06/25 module IA vous avez dit IA 
- [#12693](https://github.com/1024pix/pix/pull/12693) Permettre à un utilisateur anonyme d'être redirigé vers son dashboard après inscription (PIX-18445) 
- [#12642](https://github.com/1024pix/pix/pull/12642) Rediriger un utilisateur anonyme vers le formulaire d'inscription après sa campagne (PIX-18026) 
- [#12686](https://github.com/1024pix/pix/pull/12686) Rendre les claims additionels optionels (PIX-18457) 

### :bug: Correction

- [#12689](https://github.com/1024pix/pix/pull/12689) afficher la popup des formations, la première fois qu'on affiche les résultats de participation. (PIX-18498) 

### :building_construction: Tech

- [#12692](https://github.com/1024pix/pix/pull/12692) :truck: Déplacer un serializer vers le contexte `team` 
- [#12633](https://github.com/1024pix/pix/pull/12633) Retirer la mention d'équipe dans le message Slack 
- [#12695](https://github.com/1024pix/pix/pull/12695) Retirer les configs poleEmploi du fichier ENV (PIX-18503). 
- [#12613](https://github.com/1024pix/pix/pull/12613) Separer le rescoring de certification pour simplifier le bugfix a venir (PIX-18353). 
- [#12671](https://github.com/1024pix/pix/pull/12671) Suppression de la colonne `scope` et ré-ajout de `calibration_id` dans `active_calibrated_challenges` 

### :arrow_up: Montée de version

- [#12685](https://github.com/1024pix/pix/pull/12685) Update dependency yargs to v18 (api)

# [5.145.0](https://github.com/1024pix/pix/compare/v5.144.0...v5.145.0) (2025-06-27)

### :rocket: Amélioration

- [#12662](https://github.com/1024pix/pix/pull/12662) Ajouter un feature flag pour l'envoi de résultats automatique (PIX-18452). 
- [#12622](https://github.com/1024pix/pix/pull/12622) Migrer l'événement GRAIN_SKIPPED en traces d'apprentissage (PIX-18364) 
- [#12668](https://github.com/1024pix/pix/pull/12668) Partager automatiquement les résultats de campagne (PIX-18454) 
- [#12624](https://github.com/1024pix/pix/pull/12624) Supprimer l'appel au service metrics lorsqu'une flashcard a été répondu (PIX-18366) 
- [#12674](https://github.com/1024pix/pix/pull/12674) Supprimer l'envoi automatique des résultats vers France Travail (PIX-18459). 

### :bug: Correction

- [#12644](https://github.com/1024pix/pix/pull/12644) Eviter de pouvoir cliquer deux fois sur le même bouton (PIX-18213) 
- [#12675](https://github.com/1024pix/pix/pull/12675) Réparer la position des boutons d'action liés au candidat dans l'espace de certif (PIX-18458). 

### :building_construction: Tech

- [#12655](https://github.com/1024pix/pix/pull/12655) Création de la table `calibrations` dans le datamart. (PIX-18447). 
- [#12517](https://github.com/1024pix/pix/pull/12517) Extraction des données de l'organisation à rejoindre en tant que prescrit 
- [#12646](https://github.com/1024pix/pix/pull/12646) Ne plus remonter les anciens feature toggles dans le front 
- [#12637](https://github.com/1024pix/pix/pull/12637) PixAdmin - migrer les tests de composants de unitaire à integration 
- [#12645](https://github.com/1024pix/pix/pull/12645) Suppression de la colonne `calibration_id` de la table `active_calibrated_challenges` du datamart (PIX-18446). 

### :arrow_up: Montée de version

- [#12572](https://github.com/1024pix/pix/pull/12572) Update dependency eslint-plugin-mocha to v11 (api) 
- [#12660](https://github.com/1024pix/pix/pull/12660) Update dependency eslint-plugin-unicorn to v59 (dossier racine) 
- [#12661](https://github.com/1024pix/pix/pull/12661) Update dependency file-type to v21 (api) 
- [#12663](https://github.com/1024pix/pix/pull/12663) Update dependency nodemailer to v7 (api) 
- [#12664](https://github.com/1024pix/pix/pull/12664) Update dependency npm-run-all2 to v8 (api) 
- [#12665](https://github.com/1024pix/pix/pull/12665) Update dependency npm-run-all2 to v8 (dossier racine) 
- [#12666](https://github.com/1024pix/pix/pull/12666) Update dependency npm-run-all2 to v8 (e2e) 
- [#12669](https://github.com/1024pix/pix/pull/12669) Update dependency npm-run-all2 to v8 (junior) 
- [#12670](https://github.com/1024pix/pix/pull/12670) Update dependency npm-run-all2 to v8 (mon-pix) 
- [#12672](https://github.com/1024pix/pix/pull/12672) Update dependency npm-run-all2 to v8 (orga) 
- [#12673](https://github.com/1024pix/pix/pull/12673) Update dependency sinon to v21 (api) 
- [#12676](https://github.com/1024pix/pix/pull/12676) Update dependency sinon to v21 (certif) 
- [#12677](https://github.com/1024pix/pix/pull/12677) Update dependency sinon to v21 (junior) 
- [#12679](https://github.com/1024pix/pix/pull/12679) Update dependency sinon to v21 (load-testing) 
- [#12680](https://github.com/1024pix/pix/pull/12680) Update dependency sinon to v21 (mon-pix) 
- [#12681](https://github.com/1024pix/pix/pull/12681) Update dependency sinon to v21 (orga) 
- [#12682](https://github.com/1024pix/pix/pull/12682) Update dependency stylelint-order to v7 (junior) 
- [#12684](https://github.com/1024pix/pix/pull/12684) Update dependency stylelint-order to v7 (mon-pix)

# [5.144.0](https://github.com/1024pix/pix/compare/v5.143.0...v5.144.0) (2025-06-26)

### :rocket: Amélioration

- [#12647](https://github.com/1024pix/pix/pull/12647) : modifs sur le module Deepfakes pour deuxième vague de panels 
- [#12629](https://github.com/1024pix/pix/pull/12629) Ajouter une route récupérant le référentiel cadre en cours d'une complémentaire (PIX-18344). 
- [#12545](https://github.com/1024pix/pix/pull/12545) Modifications suite panels et retours prompt-intermediaire 
- [#12596](https://github.com/1024pix/pix/pull/12596) WIP Créa module débbutant IA, vous avez dit IA ? 

### :bug: Correction

- [#12641](https://github.com/1024pix/pix/pull/12641) Ne pas faire crasher l'api si l'id de la campagne n'existe pas (PIX-18062) 

### :building_construction: Tech

- [#12634](https://github.com/1024pix/pix/pull/12634) :card_file_box: Ajoute la colonne `calibrationId` dans la table `certification-frameworks-challenges` (PIX-18435) 

### :arrow_up: Montée de version

- [#12616](https://github.com/1024pix/pix/pull/12616) Lock file maintenance (mon-pix) 
- [#12649](https://github.com/1024pix/pix/pull/12649) Update dependency @1024pix/pix-ui to ^55.23.0 (admin) 
- [#12650](https://github.com/1024pix/pix/pull/12650) Update dependency @1024pix/pix-ui to ^55.23.0 (certif) 
- [#12651](https://github.com/1024pix/pix/pull/12651) Update dependency @1024pix/pix-ui to ^55.23.0 (junior) 
- [#12652](https://github.com/1024pix/pix/pull/12652) Update dependency @1024pix/pix-ui to ^55.23.0 (mon-pix) 
- [#12653](https://github.com/1024pix/pix/pull/12653) Update dependency @1024pix/pix-ui to ^55.23.0 (orga) 
- [#12573](https://github.com/1024pix/pix/pull/12573) Update dependency eslint-plugin-mocha to v11 (audit-logger) 
- [#12654](https://github.com/1024pix/pix/pull/12654) Update dependency eslint-plugin-mocha to v11 (certif) 
- [#12656](https://github.com/1024pix/pix/pull/12656) Update dependency eslint-plugin-mocha to v11 (dossier racine) 
- [#12658](https://github.com/1024pix/pix/pull/12658) Update dependency eslint-plugin-unicorn to v59 (api) 
- [#12659](https://github.com/1024pix/pix/pull/12659) Update dependency eslint-plugin-unicorn to v59 (audit-logger)

# [5.143.0](https://github.com/1024pix/pix/compare/v5.142.0...v5.143.0) (2025-06-25)

### :rocket: Amélioration

- [#12604](https://github.com/1024pix/pix/pull/12604) Afficher une modale avant de quitter la page de fin de parcours (PIX-18023) 
- [#12625](https://github.com/1024pix/pix/pull/12625) Ajouter un filtre sur l'api maddo pour remonter les dernières participations mise à jour (PIX-18288) 
- [#12626](https://github.com/1024pix/pix/pull/12626) ajouter une route PATCH users/{id} pour enrichir un utilisateur anonyme avec des données d'authentification (Pix-18022) 
- [#12639](https://github.com/1024pix/pix/pull/12639) Détacher les profile-rewards de l'organisation lors de la supression de learner (PIX-18113). 
- [#12640](https://github.com/1024pix/pix/pull/12640) Lister par défaut les feature-toggles.  
- [#12619](https://github.com/1024pix/pix/pull/12619) Repenser l'affichage des niveaux sur la page d'analyse de Pix Orga (PIX-18337) 
- [#12635](https://github.com/1024pix/pix/pull/12635) v2 du module tmp-ia-fonctionnement-debut pour revue PYO 

### :bug: Correction

- [#12632](https://github.com/1024pix/pix/pull/12632) Corriger une typo dans le message de MER 
- [#12528](https://github.com/1024pix/pix/pull/12528) Mettre à jour les informations d'une invitation à rejoindre une organisation lors d'un renvoie avec de nouveaux paramètres (PIX-18065) 
- [#12621](https://github.com/1024pix/pix/pull/12621) Réparer l'affichage du nombre de tentatives de connexions restantes (PIX-18405) 

### :building_construction: Tech

- [#12627](https://github.com/1024pix/pix/pull/12627) Bump audit-logger dependencies 
- [#12568](https://github.com/1024pix/pix/pull/12568) Montée de version EmberJS pour PixAdmin 

### :coffee: Autre

- [#12638](https://github.com/1024pix/pix/pull/12638) Corriger l'exemple de titre de PR

# [5.142.0](https://github.com/1024pix/pix/compare/v5.141.0...v5.142.0) (2025-06-24)

### :rocket: Amélioration

- [#12581](https://github.com/1024pix/pix/pull/12581) anonymiser les campagnes et les prescrits à l'archivage d'une orga (PIX-18150) 
- [#12620](https://github.com/1024pix/pix/pull/12620) Migrer l'événement GRAIN_CONTINUED en traces d'apprentissage (PIX-18363) 
- [#12611](https://github.com/1024pix/pix/pull/12611) Permettre de placer des embeds dans un stepper (PIX-18198) 

### :bug: Correction

- [#12623](https://github.com/1024pix/pix/pull/12623) Afficher le compteur de participants (PIX-17755) 

### :building_construction: Tech

- [#12607](https://github.com/1024pix/pix/pull/12607) :broom: Nettoyage du fichier index des usescases de `lib/` 
- [#12597](https://github.com/1024pix/pix/pull/12597) Suppression de l'event dispatcher 
- [#12608](https://github.com/1024pix/pix/pull/12608) Tenir compte des informations de pièce jointe, dans le cas où une configuration en gère une, lors du démarrage d'une conversation avec LLM (PIX-18332) 

### :arrow_up: Montée de version

- [#12617](https://github.com/1024pix/pix/pull/12617) Lock file maintenance (orga)

# [5.141.0](https://github.com/1024pix/pix/compare/v5.140.0...v5.141.0) (2025-06-23)

### :rocket: Amélioration

- [#12601](https://github.com/1024pix/pix/pull/12601) Déplacer les images hébergées en dehors de Pix vers assets.pix.org (PIX-18374) 
- [#12588](https://github.com/1024pix/pix/pull/12588) Reconfigurer le front pour afficher les nouvelles pages de la certification complémentaire sur Admin (PIX-18189). 
- [#12594](https://github.com/1024pix/pix/pull/12594) Supporter plus d'options de configuration d'embed par le message init dans un module (PIX-18197) 

### :bug: Correction

- [#12612](https://github.com/1024pix/pix/pull/12612) Afficher les bonnes urls dans la documentation OpenAPI (PIX-18396) 
- [#12609](https://github.com/1024pix/pix/pull/12609) Pouvoir cliquer sur le bouton télécharger des attestations même si le dropdown est ouvert (PIX-17864) 
- [#12610](https://github.com/1024pix/pix/pull/12610) Transférer les réponses LLM en ArrayBuffer pour Safari (PIX-18391) 

### :building_construction: Tech

- [#12603](https://github.com/1024pix/pix/pull/12603) :truck: Déplace `stage-collection-repository` vers `src/prescription/` 
- [#12579](https://github.com/1024pix/pix/pull/12579) :truck: Déplace le `ComplementaryCertificationCourseResultRepository` vers `src/certification/`  
- [#12602](https://github.com/1024pix/pix/pull/12602) :truck: Déplace le repository Learning Content utilisé par prescription vers `/src/prescription` 

### :arrow_up: Montée de version

- [#12614](https://github.com/1024pix/pix/pull/12614) Lock file maintenance (api) 
- [#12590](https://github.com/1024pix/pix/pull/12590) Update nginx Docker tag to v1.28.0

# [5.140.0](https://github.com/1024pix/pix/compare/v5.139.0...v5.140.0) (2025-06-20)

### :rocket: Amélioration

- [#12595](https://github.com/1024pix/pix/pull/12595) Anonymiser les pix label lors la suppresion d'une campagne (PIX-18286) 

### :building_construction: Tech

- [#12600](https://github.com/1024pix/pix/pull/12600) Ajout d'un log en cas de différence entre le sub récupéré et le précédent (externalIdentifier) (PIX-18360) 
- [#12605](https://github.com/1024pix/pix/pull/12605) Corriger le message slack 
- [#12592](https://github.com/1024pix/pix/pull/12592) Suppression de la complementaryCertificationId au profit de complementaryCertificationKey dans la table certification-frameworks-challenges

# [5.139.0](https://github.com/1024pix/pix/compare/v5.138.0...v5.139.0) (2025-06-20)

### :rocket: Amélioration

- [#12598](https://github.com/1024pix/pix/pull/12598) Traiter les retours design sur l'élément QAB (PIX-18160) 

### :bug: Correction

- [#12586](https://github.com/1024pix/pix/pull/12586) Réparer la récupération des données de campagnes volumineuses (PIX-18335) 
- [#12589](https://github.com/1024pix/pix/pull/12589) Restreindre les URLs d’API disponibles pour les Embeds (PIX-18327) 

### :building_construction: Tech

- [#12591](https://github.com/1024pix/pix/pull/12591) Mettre à jour le message Slack pour indiquer seulement que la mise en recette est lancée 
- [#12355](https://github.com/1024pix/pix/pull/12355) Passage de l'event de scoring de l'event dispatcher vers un usecase (PIX-17807). 
- [#12548](https://github.com/1024pix/pix/pull/12548) Simplification des seeds Certification (PIX-17640).

# [5.138.0](https://github.com/1024pix/pix/compare/v5.137.0...v5.138.0) (2025-06-19)

### :rocket: Amélioration

- [#12546](https://github.com/1024pix/pix/pull/12546) Ajout du formulaire de création de référentiel cadre (PIX-18188). 
- [#12580](https://github.com/1024pix/pix/pull/12580) Ajouter l'animation des cartes vers la droite lorsque la réponse est incorrecte pour les QAB (PIX-18117) 
- [#12582](https://github.com/1024pix/pix/pull/12582) Masquer le sélecteur de niveau lors de la création du référentiel cadre d'un Pix+ sur Admin (PIX-18189). 

### :bug: Correction

- [#12583](https://github.com/1024pix/pix/pull/12583) Corriger le lien 123formbuilder de la page de récap (PIX-18328) 

### :building_construction: Tech

- [#12593](https://github.com/1024pix/pix/pull/12593) Rend disponible les routes LSU/LSL via maddo. 
- [#12543](https://github.com/1024pix/pix/pull/12543) Unification de la date de création des challenges d'un référentiel cadre (PIX-18284). 

### :arrow_up: Montée de version

- [#12585](https://github.com/1024pix/pix/pull/12585) Update dependency @1024pix/epreuves-components to ^0.4.2 (junior) 
- [#12587](https://github.com/1024pix/pix/pull/12587) Update dependency @1024pix/epreuves-components to ^0.4.2 (mon-pix)

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
