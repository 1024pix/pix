# Pix Changelog

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
