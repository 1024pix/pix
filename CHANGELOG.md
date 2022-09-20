# Pix Changelog

## v3.256.0 (19/09/2022)


### :rocket: Amélioration
- [#4927](https://github.com/1024pix/pix/pull/4927) [FEATURE] Supprimer les filtres sur la pages des tutoriels enregistrés (PIX-5684).
- [#4926](https://github.com/1024pix/pix/pull/4926) [FEATURE] Ajout du FT pour la récupération des résultats CleA par les CDC habilités (PIX-5373).
- [#4904](https://github.com/1024pix/pix/pull/4904) [FEATURE] Ajouter un champ de recherche par nom ou prénom à la liste des candidats dans l'espace surveillant (PIX-5452)

### :building_construction: Tech
- [#4849](https://github.com/1024pix/pix/pull/4849) [TECH] Retrait des warnings liés à l'usage déprécié de process.exit() dans les scripts (PIX-5585)
- [#4937](https://github.com/1024pix/pix/pull/4937) [TECH] Monté de versions mineurs de PixOrga (PIX-5522)
- [#4909](https://github.com/1024pix/pix/pull/4909) [TECH] Modifier la gestion du code HTTP 401 sur Pix App (PIX-5661)
- [#4919](https://github.com/1024pix/pix/pull/4919) [TECH] Renommer UserTutorial en UserSavedTutorial (PIX-5363)
- [#4898](https://github.com/1024pix/pix/pull/4898) [TECH] Ajouter de nouvelles pages dans les tests axes automatisés.

### :bug: Correction
- [#4932](https://github.com/1024pix/pix/pull/4932) [BUGFIX] Des thématiques en dehors du profil-cible sont comprises dans le payload de lecture du profil-cible sur PixAdmin (PIX-5708)
- [#4929](https://github.com/1024pix/pix/pull/4929) [BUGFIX] Supprimer l'appel au helper text-with-multiple-lang dans la page d'affichage des résultats (PIX-5703).
- [#4924](https://github.com/1024pix/pix/pull/4924) [BUGFIX] Afficher la méthode de connexion CNAV dans la modale de suppression sur Pix Admin (PIX-5670).

## v3.255.0 (15/09/2022)


### :rocket: Amélioration
- [#4908](https://github.com/1024pix/pix/pull/4908) [FEATURE] Proposer les épreuves du référentiel Pix+ en début de test de certification (PIX-5448)
- [#4914](https://github.com/1024pix/pix/pull/4914) [FEATURE] Simplifier l'import de candidats avec un code postal / code Insee commençant par un 0 (PIX-5305)
- [#4873](https://github.com/1024pix/pix/pull/4873) [FEATURE] Affichage de la certificabilité dans l'onglet participant de Pix Orga (PIX-5557)
- [#4700](https://github.com/1024pix/pix/pull/4700) [FEATURE] Pouvoir mettre plusieurs langues dans le bandeau de communication (PIX-5395).
- [#4902](https://github.com/1024pix/pix/pull/4902) [FEATURE] Ajouter un titre invisible pour les domaines dans l'affichage des compétences (PIX-5608).
- [#4875](https://github.com/1024pix/pix/pull/4875) [FEATURE] Ajouter le nombre de participants/étudiants/élèves dans le titre de la page (PIX-5568).

### :building_construction: Tech
- [#4865](https://github.com/1024pix/pix/pull/4865) [TECH] Suppression de TargetProfileWithLearningContent (PIX-5615)
- [#4869](https://github.com/1024pix/pix/pull/4869) [TECH] Supprimer bootstrap de admin (PIX-5614 )
- [#4922](https://github.com/1024pix/pix/pull/4922) [TECH] Corriger les tests du organization places lot repository (Pix 5681).
- [#4920](https://github.com/1024pix/pix/pull/4920) [TECH] Il manque un test pour la méthode update du campaign repository (Pix 5679).
- [#4921](https://github.com/1024pix/pix/pull/4921) [TECH] Corriger les tests sur la distance d'édition (Pix 5680)
- [#4911](https://github.com/1024pix/pix/pull/4911) [TECH] Ajouter des cas d'utilisation pour le script d'ajout de skillId aux userSavedTutorials (PIX-5665) 

### :bug: Correction
- [#4910](https://github.com/1024pix/pix/pull/4910) [BUGFIX] Corrige la redirection lorsqu'une certification a été terminé par le superviseur (PIX-5666)
- [#4913](https://github.com/1024pix/pix/pull/4913) [BUGFIX] Prévenir l'épuisement de mémoire à l'import d'un fichier SIECLE xml mal formé

### :coffee: Autre
- [#4915](https://github.com/1024pix/pix/pull/4915) [CLEANUP] Abaisse le niveau du log lorsque le rate limit est atteint

## v3.254.0 (13/09/2022)


### :rocket: Amélioration
- [#4891](https://github.com/1024pix/pix/pull/4891) [FEATURE] Enregistrer les certifications qui ont été générées dans un fichier d'export CPF (PIX-5624).
- [#4906](https://github.com/1024pix/pix/pull/4906) [FEATURE] Afficher le label plutôt que la valeur pour les formations (PIX-5597)
- [#4893](https://github.com/1024pix/pix/pull/4893) [FEATURE] Retourner les souscriptions aux certifications complémentaires si le centre de certification est habilité (PIX-5602)
- [#4895](https://github.com/1024pix/pix/pull/4895) [FEATURE] Améliorer l'accessibilité de l'affichage des tutoriels (PIX-5610).
- [#4886](https://github.com/1024pix/pix/pull/4886) [FEATURE] Ajouter la possibilité de supprimer la méthode d'authentification CNAV (PIX-5633)

### :building_construction: Tech
- [#4903](https://github.com/1024pix/pix/pull/4903) [TECH] Rendre les tests de sélection des épreuves de certification complémentaire plus robustes (PIX-5652).
- [#4866](https://github.com/1024pix/pix/pull/4866) [TECH] Refactorer le scoring des certifications complémentaires  Cléa (PIX-5574)

## v3.253.0 (09/09/2022)


### :rocket: Amélioration
- [#4897](https://github.com/1024pix/pix/pull/4897) [FEATURE] Ré-ordonner les champs d'édition d'une organisation (PIX-5648)

### :building_construction: Tech
- [#4894](https://github.com/1024pix/pix/pull/4894) [TECH] Améliorer le message d'information dans le script de remplissage de la colonne `skillId` de la table `user-saved-tutorials` (PIX-5651)

### :bug: Correction
- [#4899](https://github.com/1024pix/pix/pull/4899) [BUGFIX] Ne pas afficher la "pop-up connecte toi au GAR" si l'utilisateur est déjà connecté (PIX-5649)

## v3.252.0 (08/09/2022)


### :bug: Correction
- [#4892](https://github.com/1024pix/pix/pull/4892) [BUGFIX] Réparer la connexion GAR (PIX-5646)

## v3.251.0 (08/09/2022)


### :rocket: Amélioration
- [#4890](https://github.com/1024pix/pix/pull/4890) [FEATURE] Remonter les compétences Pix+ en plus des compétences Pix. (PIX-5647).
- [#4882](https://github.com/1024pix/pix/pull/4882) [FEATURE] Ajouter l'ID d'assessment dans les résultats d'assessment flash (PIX-5628)
- [#4883](https://github.com/1024pix/pix/pull/4883) [FEATURE] Filtrer les tutoriels par compétences dans Pix App (PIX-5607).
- [#4856](https://github.com/1024pix/pix/pull/4856) [FEATURE] Ajouter le filtre par certificabilité sur la liste des participants (Pix-5482)
- [#4858](https://github.com/1024pix/pix/pull/4858) [FEATURE] Modifier une organisation pour la lier à un SSO (PIX-5575)
- [#4853](https://github.com/1024pix/pix/pull/4853) [FEATURE] Afficher la date de certificabilité dans la liste des élèves (PIX-5484).
- [#4863](https://github.com/1024pix/pix/pull/4863) [FEATURE] Afficher une sidebar pour filtrer les tutoriels par compétences (PIX-5606).

### :building_construction: Tech
- [#4888](https://github.com/1024pix/pix/pull/4888) [TECH] Refactorer le script permettant de remplir la colonne `skillId` de la table `user-saved-tutorials` (PIX-5642).
- [#4781](https://github.com/1024pix/pix/pull/4781) [TECH] Disposer d'un environnement local sans dépendances logicielles
- [#4880](https://github.com/1024pix/pix/pull/4880) [TECH] Ajout d'un script de changement de méthode d'assessment pour les campagnes FLASH (PIX-5627).

### :bug: Correction
- [#4879](https://github.com/1024pix/pix/pull/4879) [BUGFIX] Remettre les icônes supprimées par erreur (PIX-5623)

## v3.250.0 (07/09/2022)


### :rocket: Amélioration
- [#4878](https://github.com/1024pix/pix/pull/4878) [FEATURE] Ne pas prendre en compte les certifications pour lesquels le sexe du candidat n'est pas renseigné (PIX-5621)
- [#4870](https://github.com/1024pix/pix/pull/4870) [FEATURE] Remplacer la transition de tickets Jira des GitHub Action à une App côté Jira
- [#4851](https://github.com/1024pix/pix/pull/4851) [FEATURE] Enregistrer le badge éligible de la certification complémentaire lors du début de parcours (PIX-5577)
- [#4852](https://github.com/1024pix/pix/pull/4852) [FEATURE] Suppression de la sous-catégorie C3 de l'ajout de signalement. (PIX-5578).
- [#4874](https://github.com/1024pix/pix/pull/4874) [FEATURE] Afficher un message d'erreur plus approprié quand il y a un conflit de compte (PIX-4991).
- [#4876](https://github.com/1024pix/pix/pull/4876) [FEATURE] Implémenter la version définitive de la traduction des compétences Pix en compétences DigComp (PIX-5600)

### :building_construction: Tech
- [#4868](https://github.com/1024pix/pix/pull/4868) [TECH] Ajouter des rôles d'administration aux créateurs des organisations dans les seeds
- [#4737](https://github.com/1024pix/pix/pull/4737) [TECH] Retirer le composant ModelsTable de la page sessions/<id>/certifications (PIX-5461)
- [#4877](https://github.com/1024pix/pix/pull/4877) [TECH] Nettoyage du test de la version d'Hapi
- [#4867](https://github.com/1024pix/pix/pull/4867) [TECH] Supprimer du code qui gère un cas qui n'arrivera jamais.

### :bug: Correction
- [#4871](https://github.com/1024pix/pix/pull/4871) [BUGFIX] Ajout de scopes manquants pour pole emploi(PIX-5616)

### :coffee: Autre
- [#4884](https://github.com/1024pix/pix/pull/4884) [DOC] Mise à jour de la doc
- [#4872](https://github.com/1024pix/pix/pull/4872) [CLEANUP] Met à jour l'action commune d'automerge

## v3.249.0 (05/09/2022)


### :rocket: Amélioration
- [#4861](https://github.com/1024pix/pix/pull/4861) [FEATURE] Ajouter la traduction anglaise pour l'aide sur l'utilisation d'un code parcours (PIX-5581)
- [#4864](https://github.com/1024pix/pix/pull/4864) [FEATURE] Changer la traduction pour "Afficher une alternative textuelle" (PIX-5596).
- [#4860](https://github.com/1024pix/pix/pull/4860) [FEATURE][ADMIN] Afficher la date de création d'une organisation (PIX-5601)
- [#4862](https://github.com/1024pix/pix/pull/4862) [FEATURE] Ramener les domaines et compétences dans les pages tutos sur Pix App (PIX-5605).
- [#4844](https://github.com/1024pix/pix/pull/4844) [FEATURE] Réconcilier un utilisateur externe avec son compte Pix (PIX-5345).
- [#4848](https://github.com/1024pix/pix/pull/4848) [FEATURE] Si l'organisation est rattachée au GAR, pousser l'élève à se connecter via son Mediacentre (PIX-5140)
- [#4840](https://github.com/1024pix/pix/pull/4840) [FEATURE] Améliore l'accessiblité de la tooltip du score Pix sur Pix App (PIX-5428)

### :building_construction: Tech
- [#4784](https://github.com/1024pix/pix/pull/4784) [TECH] Script pour convertir les profil-cibles existants dans le nouveau format. Conversion acquis vers sujets cappés par niveau (PIX-5502)
- [#4843](https://github.com/1024pix/pix/pull/4843) [TECH] Améliorer le message d'erreur lorsqu'on tente de créer un RT avec un acquis inconnu du profil cible (PIX-5579)
- [#4817](https://github.com/1024pix/pix/pull/4817) [TECH] Utiliser la valeur de difficulté de l'acquis donnée par l'API LCMS (PIX-5531)

### :bug: Correction
- [#4857](https://github.com/1024pix/pix/pull/4857) [BUGFIX][ADMIN] Corriger l'affichage de l'identifiant du créateur de l'organisation (PIX-5586)
- [#4850](https://github.com/1024pix/pix/pull/4850) [BUGFIX] Mettre à jour les packages font awesome (Pix-5558)
- [#4855](https://github.com/1024pix/pix/pull/4855) [BUGFIX] Ne pas remonter l'erreur de Pole Emploi au renvoie des informations de l'utilisateur (PIX_5599).

## v3.248.0 (01/09/2022)


### :rocket: Amélioration
- [#4846](https://github.com/1024pix/pix/pull/4846) [FEATURE] Afficher le SSO d'une organisation sur la page de détail d'une organisation sur Pix Admin(PIX-5571)
- [#4795](https://github.com/1024pix/pix/pull/4795) [FEATURE] Permettre la suppression d'un lot de place (PIX-5346)
- [#4842](https://github.com/1024pix/pix/pull/4842) [FEATURE] Sortir les filtres des étudiants du tableau (PIX-5536).
- [#4814](https://github.com/1024pix/pix/pull/4814) [FEATURE] Ajout du lien menant au détail de ma participation même si celle ci est désactivée par l'organisateur (PIX-5519)
- [#4820](https://github.com/1024pix/pix/pull/4820) [FEATURE] Déplacer les filtres de la page élèves dans un bandeau dédié (PIX-5535)
- [#4832](https://github.com/1024pix/pix/pull/4832) [FEATURE] Ajout d'un tooltip sur l'en-tête de la colonne certificabilité dans le tableau sur la page des élèves (PIX-5476)
- [#4813](https://github.com/1024pix/pix/pull/4813) [FEATURE] Affichage de la certificabilité dans l'onglet élèves de Pix Orga (PIX-5481).
- [#4839](https://github.com/1024pix/pix/pull/4839) [FEATURE] Pouvoir identifier les organisations qui utilisent le GAR (PIX-5139)

### :building_construction: Tech
- [#4666](https://github.com/1024pix/pix/pull/4666) [TECH] Se déconnecter de redis avant d'arrêter le serveur
- [#4740](https://github.com/1024pix/pix/pull/4740) [TECH] Supprimer la dépendance ember-route-action-helper (PIX-5471).
- [#4838](https://github.com/1024pix/pix/pull/4838) [TECH] Utiliser le service oidc providers pour afficher les méthodes de connexion OIDC (PIX-5537)
- [#4835](https://github.com/1024pix/pix/pull/4835) [TECH] Refactorer le scoring des certifications complémentaires hors CléA (PIX-5517)

## v3.247.0 (30/08/2022)


### :rocket: Amélioration
- [#4801](https://github.com/1024pix/pix/pull/4801) [FEATURE] Afficher les informations sur la page de réconciliation - Pix App (PIX-5506).
- [#4807](https://github.com/1024pix/pix/pull/4807) [FEATURE] Gérer un accès à durée spécifique, étendue et limitée, pour les comptes anonymes (en accès simplifié) (PIX-4633)
- [#4837](https://github.com/1024pix/pix/pull/4837) [FEATURE] Ajout d'un point (PIX-5552)
- [#4824](https://github.com/1024pix/pix/pull/4824) [FEATURE] Retourner le contexte du tutoriel dans la page `/mes-tutos/enregistres` (PIX-5545).
- [#4752](https://github.com/1024pix/pix/pull/4752) [FEATURE] Notifier par email de la génération des fichiers CPF (PIX-5398).

### :building_construction: Tech
- [#4836](https://github.com/1024pix/pix/pull/4836) [TECH] Si on ne trouve pas un utilisateur, renvoyer une erreur générique (PIX-5538)
- [#4815](https://github.com/1024pix/pix/pull/4815) [TECH] Refacto l'architecture des routes authentifiées et non authentifiées sur Pix App (PIX-5528)
- [#4823](https://github.com/1024pix/pix/pull/4823) [TECH] Ajouter un test manquant sur l'enregistrement d'un tutoriel (PIX-5550).
- [#4829](https://github.com/1024pix/pix/pull/4829) [TECH] Migrer de Bookshelf vers knex le repository des paliers (PIX-5549)
- [#4821](https://github.com/1024pix/pix/pull/4821) [TECH] Mettre à jour Cypress en 8.7.0 (PIX-5541).
- [#4803](https://github.com/1024pix/pix/pull/4803) [TECH] Refacto autour du profil cible dans PixAdmin (PIX-5532)

### :bug: Correction
- [#4828](https://github.com/1024pix/pix/pull/4828) [BUGFIX] Ne pas afficher les boutons d'actions des tutoriels lorsque l'utilisateur n'est pas connecté (PIX-5547).

### :coffee: Autre
- [#4834](https://github.com/1024pix/pix/pull/4834) [CLEANUP] Nettoie les applications gravitee

## v3.246.0 (25/08/2022)


### :rocket: Amélioration
- [#4819](https://github.com/1024pix/pix/pull/4819) [FEATURE] Améliorer l'accessibilité de nos menus (PIX-5527)
- [#4809](https://github.com/1024pix/pix/pull/4809) [FEATURE] Assouplir l'import des candidats sur les villes de naissance à arrondissements (PIX-5304)
- [#4792](https://github.com/1024pix/pix/pull/4792) [FEATURE] création du script d'archivage de campagne en masse (PIX-5489).

### :building_construction: Tech
- [#4818](https://github.com/1024pix/pix/pull/4818) [TECH] Refactorer le usecase de récupération des inscriptions au certifications complémentaires d'un candidat (PIX-5514).
- [#4816](https://github.com/1024pix/pix/pull/4816) [TECH] Documenter le choix de l'image de base Docker.
- [#4683](https://github.com/1024pix/pix/pull/4683) [TECH] Prévenir les faux négatifs dans les tests.
- [#4812](https://github.com/1024pix/pix/pull/4812) [TECH] Refactorer la sélection des épreuves pour les certifications complémentaires (PIX-5513).
- [#4806](https://github.com/1024pix/pix/pull/4806) [TECH] Script pour remplir la colonne `isCertifiable` pour toutes les participations déjà partagées (PIX-5479).
- [#4764](https://github.com/1024pix/pix/pull/4764) [TECH] Corriger l'installation des domaines locaux.
- [#4783](https://github.com/1024pix/pix/pull/4783) [TECH] Centraliser les valeurs des partenaires (PIX-5497).
- [#4769](https://github.com/1024pix/pix/pull/4769) [TECH] Mise à jours mineurs des packages sur mon-pix.

### :bug: Correction
- [#4796](https://github.com/1024pix/pix/pull/4796) [BUGFIX] Corriger l'affichage de la liste des niveaux jury sélectionnables dans la page de détail d'une certification Pix+ Édu (PIX-5505)

### :coffee: Autre
- [#4808](https://github.com/1024pix/pix/pull/4808) Ajout d'un message informatif sur la suppression des participations dans l'onglet d'un utilisateur (PIX-5453)

## v3.245.0 (23/08/2022)


### :rocket: Amélioration
- [#4804](https://github.com/1024pix/pix/pull/4804) [FEATURE] Permettre l'import de candidats avec un nom de commune contenant Saint/Sainte (PIX-5303)

### :building_construction: Tech
- [#4805](https://github.com/1024pix/pix/pull/4805) [TECH] Remplissage de la nouvelle colonne `isCertifiable` au partage de profil (PIX-5478).
- [#4766](https://github.com/1024pix/pix/pull/4766) [TECH] Notifier par Slack d'une erreur de build sur dev

### :bug: Correction
- [#4810](https://github.com/1024pix/pix/pull/4810) [BUGFIX] Corriger l'édition d'une organisation sur Pix Admin (PIX-5520).
- [#4762](https://github.com/1024pix/pix/pull/4762) [BUGFIX] Lancer l'acquisition de badge dans la même transaction que la complétion d'assessment (PIX-5477)

## v3.244.0 (22/08/2022)


### :rocket: Amélioration
- [#4793](https://github.com/1024pix/pix/pull/4793) [FEATURE] Accéder à la page de réconciliation depuis la nouvelle double mire oidc sur Pix App (PIX-5486).
- [#4697](https://github.com/1024pix/pix/pull/4697) [FEATURE] Améliorations pages de maintenance Pix App
- [#4756](https://github.com/1024pix/pix/pull/4756) [FEATURE] Créer la nouvelle route de pré-réconciliation pour la nouvelle pérennité des comptes (PIX-5050).
- [#4775](https://github.com/1024pix/pix/pull/4775) [FEATURE] Rendre la page de résultat d'une campagne accessible.

### :building_construction: Tech
- [#4790](https://github.com/1024pix/pix/pull/4790) [TECH] Ne plus utiliser la route /students dans Pix Orga (Pix-5501).
- [#4767](https://github.com/1024pix/pix/pull/4767) [TECH] Mettre à jour ember-simple-auth en 3.1.0 dans Pix App (PIX-5071).
- [#4787](https://github.com/1024pix/pix/pull/4787) [TECH] Ajout d'un test sur le message de log du plugin Pino (PIX-5504)
- [#4788](https://github.com/1024pix/pix/pull/4788) [TECH] Ne plus utiliser de routes dépréciées sur les prescrits dans Pix Certif (Pix-5499).
- [#4690](https://github.com/1024pix/pix/pull/4690) [TECH] S'assurer qu'un nouvel arrivant puisse installer un environnement local rapidement (PIX-5394).
- [#4791](https://github.com/1024pix/pix/pull/4791) [TECH] Remplacer les modèles d'affichage de profil-cible existant par des modèles réduits type "summary" dans PixAdmin (PIX-5503)
- [#4800](https://github.com/1024pix/pix/pull/4800) [TECH] Supprimer bookshelf du repository organisation (PIX-5510).
- [#4799](https://github.com/1024pix/pix/pull/4799) [TECH] Supprimer bookshelf du TagRepository (PIX-5509).
- [#4798](https://github.com/1024pix/pix/pull/4798) [TECH] Corriger les import de KNEX (PIX-5508).
- [#4797](https://github.com/1024pix/pix/pull/4797) [TECH] Supprimer le model PixAdminRole ORM (PIX-5507).
- [#4785](https://github.com/1024pix/pix/pull/4785) [TECH] Ne plus utiliser de routes dépréciées sur les prescrits dans Pix Admin (Pix-5498).

### :bug: Correction
- [#4782](https://github.com/1024pix/pix/pull/4782) [BUGFIX] Retirer la taille défini du formulaire de saisie d'un code de campagne (PIX-5472)

## v3.243.0 (17/08/2022)


### :rocket: Amélioration
- [#4779](https://github.com/1024pix/pix/pull/4779) [FEATURE] Mettre le archivedBy à null lors du désarchivage (PIX-5490)
- [#4773](https://github.com/1024pix/pix/pull/4773) [FEATURE] Ajouter l'id de l'utilisateur qui a archivé la campagne en BDD (PIX-5491)
- [#4712](https://github.com/1024pix/pix/pull/4712) [FEATURE] Ajouter un visuel au tableau de participants quand celui-ci est vide (PIX-5121).
- [#4749](https://github.com/1024pix/pix/pull/4749) [FEATURE] Afficher les formations dans Pix App en fin de parcours (PIX-5466).
- [#4772](https://github.com/1024pix/pix/pull/4772) [FEATURE] Ne prends plus en compte les places supprimées (PIX-5344)
- [#4774](https://github.com/1024pix/pix/pull/4774) [FEATURE] N'afficher que le résultat de la certif Pix+ Edu correspondant au volet Pix (PIX-5425)

### :building_construction: Tech
- [#4778](https://github.com/1024pix/pix/pull/4778) [TECH] Corriger le design de la section "Certification Pix+ Edu" dans Pix Admin (PIX-5366)
- [#4755](https://github.com/1024pix/pix/pull/4755) [TECH] Ajout de la colonne 'label' à la table complementary-certification-badges

## v3.242.0 (16/08/2022)


### :rocket: Amélioration
- [#4771](https://github.com/1024pix/pix/pull/4771) [FEATURE] Uniformiser la bannière d'incitation à créer des campagnes pour les Organisations SCO (PIX-5469)
- [#4761](https://github.com/1024pix/pix/pull/4761) [FEATURE] Uniformiser le bandeau d'informations de rentrée 2022 des organisations SCO avec import (PIX-5468) 
- [#4758](https://github.com/1024pix/pix/pull/4758) [FEATURE] Création d'un script pour l'ajout des lots de places déjà existants pour une organisation à partir d'un fichier (PIX-5066).
- [#4721](https://github.com/1024pix/pix/pull/4721) [FEATURE] Pouvoir charger un fichier JSON de profil cible dans PixAdmin (PIX-5438)
- [#4731](https://github.com/1024pix/pix/pull/4731) [FEATURE] Enlever les espaces en trop quand on crée un profil cible(PIX-5405)
- [#4735](https://github.com/1024pix/pix/pull/4735) [FEATURE] Ajout des informations de route sur les requêtes SQL

### :building_construction: Tech
- [#4763](https://github.com/1024pix/pix/pull/4763) [TECH] Ajouter la colonne archivedBy à la table des campagnes  (PIX-5488)
- [#4770](https://github.com/1024pix/pix/pull/4770) [TECH] Mettre à jour Cypress en 7.7.0 (PIX-5495).
- [#4768](https://github.com/1024pix/pix/pull/4768) [TECH] Résoudre un test flaky.
- [#4750](https://github.com/1024pix/pix/pull/4750) [TECH] Ne plus utiliser de routes dépréciées sur les prescrits dans Pix App (Pix-5463).
- [#4759](https://github.com/1024pix/pix/pull/4759) [TECH] Empêcher la présence non intentionelle de fichiers vides.
- [#4747](https://github.com/1024pix/pix/pull/4747) [TECH] Mutualiser les controllers des routes oidc (PIX-5459).

### :bug: Correction
- [#4765](https://github.com/1024pix/pix/pull/4765) [BUGFIX] Le mode édition ne se fermait pas lorsque l'utilisateur sortait de la page de détails de profil cible sur PixAdmin (PIX-5493)
- [#4741](https://github.com/1024pix/pix/pull/4741) [BUGFIX] Corrige le log des routes et des métriques

### :coffee: Autre
- [#4754](https://github.com/1024pix/pix/pull/4754) [CLEANUP] Supprime les scripts non utilisés de migration de int a bigint de la table answers

## v3.241.0 (08/08/2022)


### :rocket: Amélioration
- [#4739](https://github.com/1024pix/pix/pull/4739) [FEATURE] Ajouter la colonne "imageUrl" à la table "complementary-certification-badges" (PIX-5208)
- [#4743](https://github.com/1024pix/pix/pull/4743) [FEATURE] Utiliser le composant PixCheckbox dans Pix App (PIX-5460).
- [#4748](https://github.com/1024pix/pix/pull/4748) [FEATURE] Rapporter les formations dans Pix App (PIX-5465).
- [#4744](https://github.com/1024pix/pix/pull/4744) [FEATURE] Ramener les formations liées à une campagne participation (PIX-5458).
- [#4708](https://github.com/1024pix/pix/pull/4708) [FEATURE] Migrer l'identifiant de la table answers en Bigint pour les environnements hors production et datawarehouse.
- [#4703](https://github.com/1024pix/pix/pull/4703) [FEATURE] Affiche un message d'erreur aux utilisateurs lorsque le rate limit est déclenché
- [#4742](https://github.com/1024pix/pix/pull/4742) [FEATURE] Ne pas prendre en compte l'adresse e-mail lors de l'exécution du script OGA (PIX-5434).
- [#4705](https://github.com/1024pix/pix/pull/4705) [FEATURE] Affiche le nombre de places actives d'une organisation (PIX-55343)
- [#4730](https://github.com/1024pix/pix/pull/4730) [FEATURE] Afficher la nouvelle double mire lors d'une connexion via un partenaire oidc (PIX-4988).
- [#4734](https://github.com/1024pix/pix/pull/4734) [FEATURE] Permettre à un administrateur d'annuler une invitation à rejoindre une organisation (PIX-4692)

### :building_construction: Tech
- [#4726](https://github.com/1024pix/pix/pull/4726) [TECH] Ajouter les colonnes label et key aux certifications complémentaires (PIX-5329)
- [#4729](https://github.com/1024pix/pix/pull/4729) [TECH] Division de la route /organizations/id/students en /organizations/id/sco-participants et /organizations/id/sup-participants (PIX-5439).
- [#4751](https://github.com/1024pix/pix/pull/4751) [TECH] Stocker les informations de l'utilisateur reçu par le partenaire dans redis (PIX-5404)
- [#4736](https://github.com/1024pix/pix/pull/4736) [TECH] Rendre le badge certifiable Cléa iso aux autres badges (PIX-5420)
- [#4746](https://github.com/1024pix/pix/pull/4746) [TECH] Mise à jour GitHub Action notify-team-on-config-file-change
- [#4745](https://github.com/1024pix/pix/pull/4745) [TECH] Utilise l'`automerge` 1024pix
- [#4738](https://github.com/1024pix/pix/pull/4738) [TECH] Ne plus utiliser de routes dépréciées sur les prescrits dans Pix Orga (Pix-5462).
- [#4594](https://github.com/1024pix/pix/pull/4594) [TECH] Générer des données de certification avec un CLI (PIX-5255)
- [#4691](https://github.com/1024pix/pix/pull/4691) [TECH] Suppression de ember-cli-google-fonts sur Pix-Certif
- [#4716](https://github.com/1024pix/pix/pull/4716) [TECH] Ne pas lancer une requête par lettre tapée dans les champs de recherche de Pix Orga (Pix-5377).

### :bug: Correction
- [#4723](https://github.com/1024pix/pix/pull/4723) [BUGFIX] Autoriser les champs vide lors de la modification d'une campagne (PIX-5406)

## v3.240.0 (03/08/2022)


### :rocket: Amélioration
- [#4728](https://github.com/1024pix/pix/pull/4728) [FEATURE] Ramener les formations du cache dans l'API (PIX-5419).
- [#4727](https://github.com/1024pix/pix/pull/4727) [FEATURE] Mutualiser les use cases d'authentification des partenaires (PIX-5445).
- [#4719](https://github.com/1024pix/pix/pull/4719) [FEATURE]  Ne pas autoriser de modifier manuellement une resolution automatique (PIX-5368 )

### :building_construction: Tech
- [#4718](https://github.com/1024pix/pix/pull/4718) [TECH] Réparer le lancement des tests de l'algo avec des KE (PIX-5435).
- [#4722](https://github.com/1024pix/pix/pull/4722) [TECH] Ajout de tests e2e sur l'accessibilité (PIX-5442).
- [#4720](https://github.com/1024pix/pix/pull/4720) [TECH] Mettre à jour Cypress de la version 5.6.0 à la version 6.8.0 (PIX-5431).

## v3.239.0 (01/08/2022)


### :rocket: Amélioration
- [#4674](https://github.com/1024pix/pix/pull/4674) [FEATURE] Utiliser une tâche planifiée pour automatiser l'envoi des exports CPF sur l'espace de stockage OVH (PIX-5327)
- [#4715](https://github.com/1024pix/pix/pull/4715) [FEATURE] Ajouter une tooltip sur la date de la dernière participation de l’onglet Étudiants (PIX-5174).

### :building_construction: Tech
- [#4709](https://github.com/1024pix/pix/pull/4709) [TECH] Appeler l'endpoint userinfo lorsqu'une information est manquante dans le token du partenaire (PIX-5393).
- [#4685](https://github.com/1024pix/pix/pull/4685) [TECH] Utiliser le niveau du badge en BDD afin de déterminer le badge à certifier (PIX-5206).

### :bug: Correction
- [#4717](https://github.com/1024pix/pix/pull/4717) [BUGFIX] Rediriger l'utilisateur a la page de login quand le service de partenaire n'est pas reconnu.

## v3.238.0 (28/07/2022)


### :rocket: Amélioration
- [#4707](https://github.com/1024pix/pix/pull/4707) [FEATURE] Filtrer les participants par nom et prénom (PIX-5122).
- [#4668](https://github.com/1024pix/pix/pull/4668) [FEATURE] Ne permettre le passage de Pix+Edu que si le candidat est inscrit (PIX-5240)

### :building_construction: Tech
- [#4692](https://github.com/1024pix/pix/pull/4692) [TECH] Utiliser le nouveau service d'authentification OIDC pour la CNAV et Pôle Emploi (PIX-5388).
- [#4669](https://github.com/1024pix/pix/pull/4669) [TECH] Mutualiser le code OIDC sur Pix App (PIX-5355).
- [#4713](https://github.com/1024pix/pix/pull/4713) [TECH] Ajoute les complementary-certification-badges manquant des seeds (PIX-5430)
- [#4710](https://github.com/1024pix/pix/pull/4710) [TECH] Mutualiser la déserialisation des payload avec un middleware (PIX-5415).

## v3.237.0 (27/07/2022)


### :rocket: Amélioration
- [#4704](https://github.com/1024pix/pix/pull/4704) [FEATURE] Envoyer le contexte du tutorial lors de l'enregistrement de ce dernier (PIX-5339).
- [#4682](https://github.com/1024pix/pix/pull/4682) [FEATURE] Extraire le composant action chip (PIX-4827)
- [#4689](https://github.com/1024pix/pix/pull/4689) [FEATURE] Pix admin - Page détail d'un nouveau PC : reprendre les CTA (PIX-5313)
- [#4681](https://github.com/1024pix/pix/pull/4681) [FEATURE] Ne plus centrer la PixBanner de comm' sur Orga (PIX-5390)
- [#4680](https://github.com/1024pix/pix/pull/4680) [FEATURE] Ne plus centrer la `PixBanner` de comm' sur Certif (PIX-5391)
- [#4679](https://github.com/1024pix/pix/pull/4679) [FEATURE] Ajouter des roles WAI-ARIA structurant la page (PIX-5364)
- [#4688](https://github.com/1024pix/pix/pull/4688) [FEATURE] Pix admin - Profil cible : Retirer la description du sujet dans l'affichage de ce dernier (PIX-5312)

### :building_construction: Tech
- [#4711](https://github.com/1024pix/pix/pull/4711) [TECH] Supprimer l'idToken dans redis après utilisation (PIX-4950).
- [#4575](https://github.com/1024pix/pix/pull/4575) [TECH] Générer l'url de déconnexion de Pôle Emploi depuis l'API (PIX-4950)

### :bug: Correction
- [#4702](https://github.com/1024pix/pix/pull/4702) [BUGFIX] Passer l'adresse e-mail en minuscule lors de l'ajout de membre à une organisation dans Pix Admin (PIX-1772).

## v3.236.0 (26/07/2022)


### :rocket: Amélioration
- [#4684](https://github.com/1024pix/pix/pull/4684) [FEATURE] Ajouter une tooltip avec les informations de la dernière participation (PIX-5138)
- [#4615](https://github.com/1024pix/pix/pull/4615) [FEATURE] Déconnecter un agent Pix qui a été désactivé sur Pix Admin (PIX-5279).
- [#4657](https://github.com/1024pix/pix/pull/4657) [FEATURE] Ajout d'un id sur le message d'erreur sur la page de connexion de Pix App (PIX-5357)
- [#4494](https://github.com/1024pix/pix/pull/4494) [FEATURE] Permettre l'ajout d'un lots de places d'une organisation (Pix-4776).

### :building_construction: Tech
- [#4698](https://github.com/1024pix/pix/pull/4698) [TECH] Clean : retirer les params inutiles
- [#4699](https://github.com/1024pix/pix/pull/4699) [TECH] Ne plus récupérer de propriété id ignorée dans les tests
- [#4676](https://github.com/1024pix/pix/pull/4676) [TECH] Déprécier les routes schooling-registration-dependent-users (PIX-5381).
- [#4687](https://github.com/1024pix/pix/pull/4687) [TECH] Ajout d'un feature toggle pour la réconciliation de compte SSO sur Pix App (PIX-5351).
- [#4694](https://github.com/1024pix/pix/pull/4694) [TECH] Mettre à jour le serveur redis de test de 5.0.7 à 6.2.7
- [#4675](https://github.com/1024pix/pix/pull/4675) [TECH] Corriger les sinon.stub().withArgs() qui ne fonctionnent pas

### :bug: Correction
- [#4677](https://github.com/1024pix/pix/pull/4677) [BUGFIX] Ne pas mettre à jour le rôle d'un agent Pix si aucun nouveau rôle n'est choisi (PIX-5387).

## v3.235.0 (21/07/2022)


### :rocket: Amélioration
- [#4678](https://github.com/1024pix/pix/pull/4678) [FEATURE] Mettre à jour le message de fin de campagne (PIX-5320)
- [#4672](https://github.com/1024pix/pix/pull/4672) [FEATURE] Afficher des onglets dans la page utilisateurs de Pix Admin (PIX-5378).
- [#4664](https://github.com/1024pix/pix/pull/4664) [FEATURE] Utilise la `PixBanner` pour le bandeau de communication sur Pix App (PIX-5361)
- [#4671](https://github.com/1024pix/pix/pull/4671) [FEATURE] Permettre la suppression d'une participation pour un prescrit depuis la page utilisateurs de Pix Admin (PIX-5369).

### :building_construction: Tech
- [#4670](https://github.com/1024pix/pix/pull/4670) [TECH] Supprimer un fichier de données de test non utilisé.

### :bug: Correction
- [#4673](https://github.com/1024pix/pix/pull/4673) [BUGFIX] Suppression temporaire du test d'acceptance du script de migration BIGINT

## v3.234.0 (20/07/2022)


### :rocket: Amélioration
- [#4654](https://github.com/1024pix/pix/pull/4654) [FEATURE] Afficher les candidat inscrits lors de la suppression d'une session (PIX-5337)
- [#4663](https://github.com/1024pix/pix/pull/4663) [FEATURE] Restreindre l'accès aux campagnes de l'organisation CNAV sur Pix App(PIX-5114).
- [#4665](https://github.com/1024pix/pix/pull/4665) [FEATURE] Ajouter la colonne 'Dernière participation' au tableau des Participants(PIX-5124)
- [#4667](https://github.com/1024pix/pix/pull/4667) [FEATURE] Afficher la liste des participations aux campagne pour un utilisateur dans Pix Admin (PIX-5365).
- [#4629](https://github.com/1024pix/pix/pull/4629) [FEATURE] Envoyer le fichier d'export des certification pour le CPF sur un espace de stockage OVH (PIX-5309)

### :building_construction: Tech
- [#4658](https://github.com/1024pix/pix/pull/4658) [TECH] Supprimer le feature toggle de la suppression des champs libres (PIX-5333)
- [#4653](https://github.com/1024pix/pix/pull/4653) [TECH] Déprécier les routes schooling-registration-user-associations (PIX-5340).
- [#4656](https://github.com/1024pix/pix/pull/4656) [TECH] Rétablir la preview des challenges focus en local (PIX-5353).
- [#3839](https://github.com/1024pix/pix/pull/3839) [TECH] Migrer la colonne answers.id de INTEGER en BIG INTEGER avec downtime.
- [#4659](https://github.com/1024pix/pix/pull/4659) [TECH] Prévenir une résolution de nom réseau dans les tests unitaires.
- [#4607](https://github.com/1024pix/pix/pull/4607) [TECH] Renommer www en index.js

## v3.233.0 (18/07/2022)


### :rocket: Amélioration
- [#4652](https://github.com/1024pix/pix/pull/4652) [FEATURE] Ramener le contexte des tutoriels lorsqu'ils sont présentés dans la page de détail d'une compétence (PIX-5338).
- [#4661](https://github.com/1024pix/pix/pull/4661) [FEATURE] Mise à jour du niveau d'accessibilité de Pix-Certif (PIX-5356).
- [#4634](https://github.com/1024pix/pix/pull/4634) [FEATURE] Ajouter une condition dans la réconciliation automatique lors de l'import SIECLE (PIX-4594).
- [#4620](https://github.com/1024pix/pix/pull/4620) [FEATURE] A11Y - Ajouter une description aux tableaux complexes (PIX-3920)
- [#4650](https://github.com/1024pix/pix/pull/4650) [FEATURE] Tracer la résolution automatique sur les signalements (PIX-5258)
- [#4639](https://github.com/1024pix/pix/pull/4639) [FEATURE] Nouvel affichage page détails d'un profil cible (PIX-5311)
- [#4643](https://github.com/1024pix/pix/pull/4643) [FEATURE] Affichage de la date de dernière participation dans l'onglet étudiants (PIX-5173). 
- [#4649](https://github.com/1024pix/pix/pull/4649) [FEATURE] Afficher le nombre de participations dans l'onglet "Participants"(PIX-5123)
- [#4570](https://github.com/1024pix/pix/pull/4570) [FEATURE]  Rajouter un filtre pour chercher par nom et prénom sur la liste des participations de la page résultats (PIX-5060).
- [#4628](https://github.com/1024pix/pix/pull/4628) [FEATURE] Gérer plus de cas dans le script de reprise des `skillId` dans la table `user-saved-tutorials` (PIX-4680). 

### :building_construction: Tech
- [#4662](https://github.com/1024pix/pix/pull/4662) [TECH] Corrige le format du fichier package-lock.json
- [#4655](https://github.com/1024pix/pix/pull/4655) [TECH] Intégrer le composant PixMessage dans Pix-App (PIX-5322)
- [#4637](https://github.com/1024pix/pix/pull/4637) [TECH] Recalculer l'acquisitions des badges grâce à un script (PIX-5310).
- [#4608](https://github.com/1024pix/pix/pull/4608) [TECH] Empêcher le chevauchement :horse: des seeds et des données de test automatiques.
- [#4593](https://github.com/1024pix/pix/pull/4593) [TECH] Déplacer le ticket Jira en review seulement si la PR n'est pas en draft (PIX-5253).
- [#4582](https://github.com/1024pix/pix/pull/4582) [TECH] Utiliser l'attribut responseTime au lieu de duration dans les métriques remontés à Datadog.
- [#4586](https://github.com/1024pix/pix/pull/4586) [TECH][ADMIN]Ajouter un service pour intercepter et notifier des erreurs de requêtes api (PIX-5244)
- [#4589](https://github.com/1024pix/pix/pull/4589) [TECH] Télécharger le dernier backup terminé dans le script de restauration de BDD.
- [#4647](https://github.com/1024pix/pix/pull/4647) [TECH] Ajouter la colonne "level" à la table complementary-certification-badges (PIX-5203)
- [#4651](https://github.com/1024pix/pix/pull/4651) [TECH] Monter la version des BDD de tests de 13.3 à 13.7

## v3.232.0 (12/07/2022)


### :rocket: Amélioration
- [#4567](https://github.com/1024pix/pix/pull/4567) [FEATURE] Générer un token lors du changement de mot de passe temporaire (PIX-5202)
- [#4642](https://github.com/1024pix/pix/pull/4642) [FEATURE] Modifier le libellé d'un signalement de sous-catégorie E11 (PIX-5290)
- [#4621](https://github.com/1024pix/pix/pull/4621) [FEATURE] Revenir sur la page d'origine de la liste des sessions (PIX-5259).
- [#4646](https://github.com/1024pix/pix/pull/4646) [FEATURE] Ramener le contexte des tutoriels lorsqu'ils sont présentés au moment de la correction (PIX-5326).
- [#4584](https://github.com/1024pix/pix/pull/4584) [FEATURE] Affichage du petit "i" sur la date de dernière participation dans l'onglet élèves (PIX-5171).

### :building_construction: Tech
- [#4626](https://github.com/1024pix/pix/pull/4626) [TECH] Intégrer les couleurs du design system via Pix-UI pour Pix Orga( PIX-5154 ).
- [#4627](https://github.com/1024pix/pix/pull/4627) [TECH] Suppression de mentions aux schooling-registrations dans l'API (PIX-5314).
- [#4632](https://github.com/1024pix/pix/pull/4632) [TECH] Intégrer les couleurs du design system via Pix-UI pour Pix Certif (PIX-5155)

### :bug: Correction
- [#4648](https://github.com/1024pix/pix/pull/4648) [BUGFIX] Après être réconcilié on ne peut pas accéder a une autre campagne SCO de la même organisation (PIX-5328). 
- [#4645](https://github.com/1024pix/pix/pull/4645) [BUGFIX] Suppression de la section "Autres certif comp" sur un certificat avec un commentaire (PIX-5274).
- [#4644](https://github.com/1024pix/pix/pull/4644) [BUGFIX] Complète le `title` des liens des consignes d'épreuves (PIX-5324)
- [#4633](https://github.com/1024pix/pix/pull/4633) [BUGFIX] Afficher le résultat d'une campagne inactive seulement pour les participations partagées (PIX-5296)
- [#4638](https://github.com/1024pix/pix/pull/4638) [BUGFIX] Améliorer le message indiquant la présence d'une alternative textuelle sur les illustrations dans une épreuve sur Pix App (PIX-5271)
- [#4640](https://github.com/1024pix/pix/pull/4640) [BUGFIX] Changer la couleur du texte de la bannière d'alerte sur Pix App (PIX-5231)
- [#4631](https://github.com/1024pix/pix/pull/4631) [BUGFIX] Permettre la suppression de session lorsqu'un surveillant a rejoint l'espace surveillant (PIX-5280)

### :coffee: Autre
- [#4503](https://github.com/1024pix/pix/pull/4503) [ADMIN] Supprimer les références à Bootstrap dans la page Informations des certifications (PIX-5070)
- [#4641](https://github.com/1024pix/pix/pull/4641) [A11Y] Ajouter une description au tableau d'analyse pour les lecteurs d'écrans(PIX-4252)
- [#4587](https://github.com/1024pix/pix/pull/4587) [API]Utiliser une variable d'évènement pour définir le nombre de connexion à la BDD de PgBoss (PIX-5250).

## v3.231.0 (08/07/2022)


### :rocket: Amélioration
- [#4541](https://github.com/1024pix/pix/pull/4541) [FEATURE] Ajout de la page participants sur PixOrga (PIX-5120).
- [#4630](https://github.com/1024pix/pix/pull/4630) [FEATURE] Ajouter le bouton de filtre sur Pix App (PIX-4930)
- [#4624](https://github.com/1024pix/pix/pull/4624) [FEATURE] Supprimer la catégorie "A2 - Autres" dans la modale de signalements  (PIX-5282)
- [#4604](https://github.com/1024pix/pix/pull/4604) [FEATURE] Ajouter un endpoint permettant de télécharger un export XML pour le CPF (PIX-5260)

### :building_construction: Tech
- [#4614](https://github.com/1024pix/pix/pull/4614) [TECH] Eviter les injections implicites dans les routes de Pix App (PIX-5270).
- [#4617](https://github.com/1024pix/pix/pull/4617) [TECH] Utiliser la bonne route avec les bons droits d'accès pour la dissociation des schoolings registrations (PIX-5217)
- [#4625](https://github.com/1024pix/pix/pull/4625) [TECH] Remplacer moment par dayjs dans Pix Admin (PIX-5297)

### :bug: Correction
- [#4619](https://github.com/1024pix/pix/pull/4619) [BUGFIX] Uniformisation du wording sur la modale de mise à jour de résolution (PIX-5276).

## v3.230.0 (06/07/2022)


### :rocket: Amélioration
- [#4616](https://github.com/1024pix/pix/pull/4616) [FEATURE] Rajouter le contexte pour les tutoriels (PIX-4649).
- [#4618](https://github.com/1024pix/pix/pull/4618) [FEATURE] App - Allonge le cache pour les polices de Pix UI

### :building_construction: Tech
- [#4557](https://github.com/1024pix/pix/pull/4557) [TECH] Intégrer les couleurs du design system via Pix-UI pour Pix App ( PIX-4826 )
- [#4605](https://github.com/1024pix/pix/pull/4605) [TECH] Supprimer le gabarit de profil cible (PIX-5246)
- [#4597](https://github.com/1024pix/pix/pull/4597) [TECH] Ajouter le système de traduction dans pix certif (PIX-5205)
- [#4588](https://github.com/1024pix/pix/pull/4588) [TECH] Attendre la fin des requêtes http à la réception de signal d'arrêt sur l'API.

### :bug: Correction
- [#4623](https://github.com/1024pix/pix/pull/4623) [BUGFIX] Corriger la checkbox seulement sur la page d'inscription (PIX-5294)

## v3.229.0 (05/07/2022)


### :rocket: Amélioration
- [#4598](https://github.com/1024pix/pix/pull/4598) [FEATURE] Modifier les signalements (PIX-5192).
- [#4609](https://github.com/1024pix/pix/pull/4609) [FEATURE] Afficher les informations d'un profil utilisateur dans Pix Admin (PIX-5268)
- [#4602](https://github.com/1024pix/pix/pull/4602) [FEATURE] Traduire les compétences sur le certificat/certificat partagé en EN (PIX-5231)

### :building_construction: Tech
- [#4611](https://github.com/1024pix/pix/pull/4611) [TECH] Tutos v2.1 - Ajoute le feature toggle pour la sidebar de filtres (PIX-4916)
- [#4481](https://github.com/1024pix/pix/pull/4481) [TECH] Renommer les préhandlers des membres Pix Admin (user -> adminMember) 
- [#4536](https://github.com/1024pix/pix/pull/4536) [TECH] Utiliser Ember Testing Library dans l'application Certif
- [#4571](https://github.com/1024pix/pix/pull/4571) [TECH] Utiliser les fontes de Pix-Ui sur Pix App (PIX-5128)
- [#4065](https://github.com/1024pix/pix/pull/4065) [TECH] Remonter toutes les violations de lint.

### :bug: Correction
- [#4610](https://github.com/1024pix/pix/pull/4610) [BUGFIX] Corriger le design de la checkbox sur la page d'inscription de Pix App (PIX-5241)
- [#4542](https://github.com/1024pix/pix/pull/4542) [BUGFIX] Corrige le down de la migration 20220510124351_create-target-profile-template-table.js
- [#4613](https://github.com/1024pix/pix/pull/4613) [BUGFIX] Ajoute un point manquant dans le texte de la page de maintenance planifiée
- [#4612](https://github.com/1024pix/pix/pull/4612) [BUGFIX] Restaurer les informations des requêtes dans l'API
- [#4596](https://github.com/1024pix/pix/pull/4596) [BUGFIX] Rendre ses couleurs au certificat/certificat partagé (PIX-5230)

## v3.228.0 (01/07/2022)


### :rocket: Amélioration
- [#4600](https://github.com/1024pix/pix/pull/4600) [FEATURE] Ramener le profil utilisateur dans Pix Admin - Partie 1 (PIX-5130).
- [#4549](https://github.com/1024pix/pix/pull/4549) [FEATURE] Les agents PIX désactivés ne peuvent plus accéder à Pix Admin (PIX-5189) 

### :building_construction: Tech
- [#4601](https://github.com/1024pix/pix/pull/4601) [TECH] Permettre l'utilisation npm@^8.3.1
- [#4599](https://github.com/1024pix/pix/pull/4599) [TECH] Arrêter gracieusement les exécutions.
- [#4551](https://github.com/1024pix/pix/pull/4551) [TECH] Remplacer l'utilisation du tag POLE EMPLOI par l'identity provider for campaigns (PIX-5113)
- [#4581](https://github.com/1024pix/pix/pull/4581) [TECH] Mettre à jour pix-ui en v14.7.0 pour Admin

### :bug: Correction
- [#4603](https://github.com/1024pix/pix/pull/4603) [BUGFIX] Erreur de fichier de config babel manquant lors du lint de l'API en local
- [#4595](https://github.com/1024pix/pix/pull/4595) [BUGFIX] Rendre le bouton "J'envoie mes résultats" lisible par les lecteurs d'écran (PIX-5251)

## v3.227.0 (30/06/2022)


### :rocket: Amélioration
- [#4583](https://github.com/1024pix/pix/pull/4583) [FEATURE] Ajouter un bouton raccourcis pour le dashboard metabase (PIX-3861)
- [#4566](https://github.com/1024pix/pix/pull/4566) [FEATURE] ETQ Pix Certif user, JV pouvoir supprimer une session (PIX-5150)
- [#4547](https://github.com/1024pix/pix/pull/4547) [FEATURE] Intégrer la sélection de sujets dans la création de profil cible (PIX-5012)
- [#4579](https://github.com/1024pix/pix/pull/4579) [FEATURE] Affichage du nombre de participations dans l'onglet étudiants (PIX-5172).
- [#4577](https://github.com/1024pix/pix/pull/4577) [FEATURE] Affichage de la date de dernière participation dans l'onglet élèves (PIX-5170).
- [#4560](https://github.com/1024pix/pix/pull/4560) [FEATURE] Retirer son évaluation d'un tutoriel (PIX-4725).
- [#4511](https://github.com/1024pix/pix/pull/4511) [FEATURE] Permettre de désactiver l'accès à Pix Admin (PIX-4195) 

### :building_construction: Tech
- [#4585](https://github.com/1024pix/pix/pull/4585) [TECH] Linter les fonctionnalités de NodeJs dans l'API.
- [#4550](https://github.com/1024pix/pix/pull/4550) [TECH] Glimmerizer les dernières routes de Pix APP.

## v3.226.0 (28/06/2022)


### :rocket: Amélioration
- [#4576](https://github.com/1024pix/pix/pull/4576) [FEATURE] Affichage du nombre de participations dans l'onglet élèves (PIX-5169).
- [#4416](https://github.com/1024pix/pix/pull/4416) [FEATURE] Limiter les requêtes par utilisateur sur /api/token

### :building_construction: Tech
- [#4572](https://github.com/1024pix/pix/pull/4572) [TECH] Renommer "schooling-registrations" dans les paramètres & certaines routes (PIX-5218).
- [#4574](https://github.com/1024pix/pix/pull/4574) [TECH] Lire les variables d'environnement à un seul endroit.
- [#4548](https://github.com/1024pix/pix/pull/4548) [TECH] Mentionner les configurations de développement les plus utiles.
- [#4343](https://github.com/1024pix/pix/pull/4343) [TECH] Calculer les résultats d'une participation à une campagne de manière asynchrone avec PgBoss (PIX-4520).
- [#4522](https://github.com/1024pix/pix/pull/4522) [TECH] Créer un nouvelle méthode pour le scénario de changement de mot de passe sur Pix App (PIX-4977).
- [#4167](https://github.com/1024pix/pix/pull/4167) [TECH] API : Logguer en pretty-print 👩‍💻 si la sortie standard est envoyée vers un terminal
- [#4564](https://github.com/1024pix/pix/pull/4564) [TECH] Met à jour knex en 2.1.0 (PIX-5209)
- [#4558](https://github.com/1024pix/pix/pull/4558) [TECH] Mise à jour des dépendances de l'API (PIX-5212)

### :bug: Correction
- [#4556](https://github.com/1024pix/pix/pull/4556) [BUGFIX] Supprimer le flickering en arrivant sur certaines pages de Pix App (PIX-4684).
- [#4573](https://github.com/1024pix/pix/pull/4573) [BUGFIX] L'API ne se déploie plus à cause d'une vérification de version Hapi en échec (PIX-5219)

## v3.225.0 (23/06/2022)


### :rocket: Amélioration
- [#4554](https://github.com/1024pix/pix/pull/4554) [FEATURE] Ignorer les INEs vides quand on vérifie si plusieurs utilisateurs sont associés au même compte (PIX-5072).
- [#4559](https://github.com/1024pix/pix/pull/4559) [FEATURE] Améliorer l'info pour les sessions déjà finalisées sur la page de détails (PIX-5182)
- [#4552](https://github.com/1024pix/pix/pull/4552) [FEATURE] Afficher une phrase avec le niveau final obtenu à la certification Pix sur le certificat/certificat partagé et attestation (PIX-5136)

### :building_construction: Tech
- [#4519](https://github.com/1024pix/pix/pull/4519) [TECH] Mettre à jour les dépendances certif (PIX-5107)
- [#4502](https://github.com/1024pix/pix/pull/4502) [TECH] Assurer l'homogénéité de l'inflection dans les noms de table en BDD (PIX-5069).

## v3.224.0 (22/06/2022)


### :rocket: Amélioration
- [#4553](https://github.com/1024pix/pix/pull/4553) [FEATURE] Mettre à jour le nom de l'étape des signalements dans la finalisation de session (PIX-5186)
- [#4545](https://github.com/1024pix/pix/pull/4545) [FEATURE] Ne pas mentionner la valeur professionnalisante de la certification Pix par France Compétences dans les attestations téléchargées depuis le domaine .org (PIX-5162).
- [#4546](https://github.com/1024pix/pix/pull/4546) [FEATURE] Ajout de la colonne 'identityProviderForCampaigns' dans la table 'organizations' (PIX-5111)

### :building_construction: Tech
- [#4497](https://github.com/1024pix/pix/pull/4497) [TECH] Mutualiser le code des interconnexions openid (PIX-5078)
- [#4521](https://github.com/1024pix/pix/pull/4521) [TECH] Supprimer des exemples de configuration de debug front
- [#4538](https://github.com/1024pix/pix/pull/4538) [TECH] Renommer expiredDate en expirationDate dans la table organization-places (PIX-5065).
- [#4525](https://github.com/1024pix/pix/pull/4525) [TECH] Renommer les ultimes mentions dans l'API de schooling-registrations (sauf les routes) (PIX-5152).

### :bug: Correction
- [#4555](https://github.com/1024pix/pix/pull/4555) [BUGFIX] Garder le champ vide quand l'information de dernière connexion n'est pas disponible (PIX-5193).
- [#4532](https://github.com/1024pix/pix/pull/4532) [BUGFIX] Admin: Tooltips de la navbar cachées par les infos de la certification
- [#4540](https://github.com/1024pix/pix/pull/4540) [BUGFIX] Supprimer l'erreur `TransitionAborted` lors du passage du didacticiel (PIX-5167).
- [#4543](https://github.com/1024pix/pix/pull/4543) [BUGFIX] Ne pas afficher le nouveau membre dans la liste si une erreur survient (PIX-5183)

## v3.223.0 (20/06/2022)


### :rocket: Amélioration
- [#4537](https://github.com/1024pix/pix/pull/4537) [FEATURE] Retirer le bandeau de renseignement du mail de destinataire de la certification
- [#4474](https://github.com/1024pix/pix/pull/4474) [FEATURE] Permettre de donner l'accès à l'application Pix Admin à un nouvel employé Pix (PIX-4004)
- [#4529](https://github.com/1024pix/pix/pull/4529) [FEATURE] Affichage d'une explication pour les catégories C7 et C8 sur la page de finalisation de session
- [#4528](https://github.com/1024pix/pix/pull/4528) [FEATURE] Mettre à jour le titre de la section avec les signalements individuels sur la page de finalisation de session (PIX-5148)
- [#4530](https://github.com/1024pix/pix/pull/4530) [FEATURE] Augmenter la taille des macarons dans les certificats et certificats partagés (PIX-5126).
- [#4524](https://github.com/1024pix/pix/pull/4524) [FEATURE] Fusionner les stratégies de résolution des signalements E1 et E2 (PIX-5115).
- [#4534](https://github.com/1024pix/pix/pull/4534) [FEATURE] Ajouter un commentaire jury dans le csv des résultats pour les certifications rejetées automatiquement(PIX-5116)

### :building_construction: Tech
- [#4523](https://github.com/1024pix/pix/pull/4523) [TECH] Préciser la cause de la certification en erreur lorsque l'utilisateur n'a pas répondu à toutes les questions (PIX-5084)

### :bug: Correction
- [#4539](https://github.com/1024pix/pix/pull/4539) [BUGFIX] Afficher les dates formattées que si elles existent dans Pix Admin (PIX-5141).
- [#4533](https://github.com/1024pix/pix/pull/4533) [BUGFIX] Les message de format de code de vérification de l'attestation sont incohérents (PIX-5161).
- [#4535](https://github.com/1024pix/pix/pull/4535) [BUGFIX] Remettre l'image quand il n'y a pas de campagne(PIX-5135)

## v3.222.0 (16/06/2022)


### :rocket: Amélioration
- [#4520](https://github.com/1024pix/pix/pull/4520) [FEATURE] Mettre à jour les attestations de certification suite au renouvellement France Compétences (PIX-5093)
- [#4508](https://github.com/1024pix/pix/pull/4508) [FEATURE] Ajouter un bouton d'export JSON sur la page de détail d'un PC (PIX-5082)
- [#4518](https://github.com/1024pix/pix/pull/4518) [FEATURE] Afficher les infos complémentaires de la session dans PixAdmin (PIX-4952)
- [#4517](https://github.com/1024pix/pix/pull/4517) [FEATURE] MAJ des certificat et certificat partagé suite au renouvellement France Compétences (PIX-5091)

### :building_construction: Tech
- [#4527](https://github.com/1024pix/pix/pull/4527) [TECH] Amélioration des consignes des QCU et QCM (PIX-5151).

### :bug: Correction
- [#4531](https://github.com/1024pix/pix/pull/4531) [BUGFIX] Formattage des dates différents sur certains environnements

### :coffee: Autre
- [#4526](https://github.com/1024pix/pix/pull/4526) [A11Y] Ajout de traductions pour les recommandations (PIX-5049).

## v3.221.0 (15/06/2022)


### :rocket: Amélioration
- [#4496](https://github.com/1024pix/pix/pull/4496) [FEATURE] Remplacer le commentaire global de session par une liste de choix (PIX-4951).
- [#4516](https://github.com/1024pix/pix/pull/4516) [FEATURE] Gérer dynamiquement l'affichage des date de reprise de certification pour le sco dans Pix-certif (PIX-5088)
- [#4515](https://github.com/1024pix/pix/pull/4515) [FEATURE] Afficher plus d'informations sur les utilisateurs dans Pix Admin (PIX-1389)
- [#4512](https://github.com/1024pix/pix/pull/4512) [FEATURE] Empêcher les utilisateurs ayant le rôle métier d'accéder aux pages certifications sur Pix Admin (PIX-5062).
- [#4514](https://github.com/1024pix/pix/pull/4514) [FEATURE] Afficher le nom du créateur de l'organisation dans Pix Admin (PIX-3099)

### :building_construction: Tech
- [#4483](https://github.com/1024pix/pix/pull/4483) [TECH][ADR] Nommer les contraintes dans la BDD en cas de conflit (PIX-5048)
- [#4394](https://github.com/1024pix/pix/pull/4394) [TECH] Ajout de méthodes dans les seeds pour rendre un utilisateur certifiable sans avoir à importer des données réelles 
- [#4210](https://github.com/1024pix/pix/pull/4210) [TECH] Ajout d'un Redis pour les tests dans la CI.
- [#4427](https://github.com/1024pix/pix/pull/4427) [TECH] Utilisation des Design Tokens Pix UI dans tous les fronts Pix (PIX-4936)

## v3.220.0 (13/06/2022)


### :rocket: Amélioration
- [#4510](https://github.com/1024pix/pix/pull/4510) [FEATURE] Améliorer le message de la page j'ai un code (Pix-4976)
- [#4509](https://github.com/1024pix/pix/pull/4509) [FEATURE] Mise à jour des templates de l'attestation de certification Pix (PIX-4968)
- [#4498](https://github.com/1024pix/pix/pull/4498) [FEATURE] Mettre à jour le design de la pop-up de confirmation de finalisation de session (PIX-5042)
- [#4506](https://github.com/1024pix/pix/pull/4506) [FEATURE] Mettre à jour le wording du texte explicatif lorsque le signalement C1 est sélectionné (PIX-4946).
- [#4499](https://github.com/1024pix/pix/pull/4499) [FEATURE] Harmoniser le fonctionnement des champs de recherche dans Pix Orga (PIX-5057).

### :building_construction: Tech
- [#4490](https://github.com/1024pix/pix/pull/4490) [TECH] Supprimer le repository Pole Emploi tokens (PIX-4935).

### :bug: Correction
- [#4513](https://github.com/1024pix/pix/pull/4513) [BUGFIX] Corriger l'export des résultats de certification pour les noms de classe ayant des caractères spéciaux (PIX-5079).
- [#4500](https://github.com/1024pix/pix/pull/4500) [BUGFIX] Corriger le scoring des certifications Pix+ Édu lors d'une neutralisation (PIX-5068)

## v3.219.0 (10/06/2022)


### :rocket: Amélioration
- [#4495](https://github.com/1024pix/pix/pull/4495) [FEATURE] Distinguer les Profils Cibles avec gabarit dans l'écran de détail
- [#4487](https://github.com/1024pix/pix/pull/4487) [FEATURE] Afficher le niveau Pix des certifications complémentaire Pix+ Édu de 1er degré dans l'export csv des résultats (PIX-5043)
- [#4493](https://github.com/1024pix/pix/pull/4493) [FEATURE] Supprimer l'étape 2 lors de finalisation d'une session (PIX-4953)

### :building_construction: Tech
- [#4507](https://github.com/1024pix/pix/pull/4507) [TECH] Mettre en cohérence la seed de candidat SCO certifié (PIX-5080).
- [#4501](https://github.com/1024pix/pix/pull/4501) [TECH] Corriger la version de l'API.

### :bug: Correction
- [#4491](https://github.com/1024pix/pix/pull/4491) [BUGFIX] Rendre les signalements E11 et E12 impactant (PIX-5054).

## v3.218.0 (08/06/2022)


### :rocket: Amélioration
- [#4489](https://github.com/1024pix/pix/pull/4489) [FEATURE] Afficher la méthode de connexion CNAV sur la page de détail d'un utilisateur sur Pix Admin (PIX-5022).
- [#4482](https://github.com/1024pix/pix/pull/4482) [FEATURE] Afficher un lien pour transmettre le PV de fraude lors de la finalisation de session (PIX-4943)
- [#4455](https://github.com/1024pix/pix/pull/4455) [FEATURE] Retirer l'accès à la page "Profils cibles" de Pix Admin uniquement au rôle "CERTIF" (PIX-4668)

### :building_construction: Tech
- [#4486](https://github.com/1024pix/pix/pull/4486) [TECH] Afficher une page d'erreur lorsque un identity provider externe nous renvoie une erreur (PIX-5017).

### :coffee: Autre
- [#4492](https://github.com/1024pix/pix/pull/4492) [DOCS] Corriger le test de la connexion BDD dans l'installation

## v3.217.0 (07/06/2022)


### :rocket: Amélioration
- [#4468](https://github.com/1024pix/pix/pull/4468) [FEATURE] Empêcher un candidat de continuer sa certification si la session est finalisée (PIX-4815)
- [#4457](https://github.com/1024pix/pix/pull/4457) [FEATURE] Création d'un gabarit avec sujets/niveaux lors de celle d'un profil cible (PIX-4927).
- [#4480](https://github.com/1024pix/pix/pull/4480) [FEATURE] Améliorer la consistance des seeds (PIX-5046)
- [#4484](https://github.com/1024pix/pix/pull/4484) [FEATURE] Supprimer les refresh tokens d'un utilisateur quand il est anonymisé (PIX-1990).
- [#4460](https://github.com/1024pix/pix/pull/4460) [FEATURE] Utiliser le package ember-testing-library dans Pix App (PIX-4983).

### :building_construction: Tech
- [#4479](https://github.com/1024pix/pix/pull/4479) [TECH] Ajout d'une route pour récupérer un gabarit de profil cible (PIX-5025).
- [#4471](https://github.com/1024pix/pix/pull/4471) [TECH] Mieux cibler les erreurs lors de la réinitialisation du mot de passe sur Pix App (PIX-5016)

### :bug: Correction
- [#4488](https://github.com/1024pix/pix/pull/4488) [BUGFIX] Corriger l'acronyme CNAV en majuscules sur Pix App (PIX-5023).
- [#4459](https://github.com/1024pix/pix/pull/4459) [BUGFIX] Remettre le style du message d'erreur de connexion en session de certification. (PIX-4984)
- [#4476](https://github.com/1024pix/pix/pull/4476) [BUGFIX] Corriger l'affichage multiple des certifications complémentaires dans la liste des certifications d'une session (PIX-5040).
- [#4477](https://github.com/1024pix/pix/pull/4477) [BUGFIX] Rajout du nom complet de la compétence sur la bannière de l'assessment (PIX-5027).

### :coffee: Autre
- [#4485](https://github.com/1024pix/pix/pull/4485) [A11Y] Rendre la boulette de pertinence de la phrase explicative non lisible pour les lecteurs d'écran(PIX-4247)

## v3.216.0 (02/06/2022)


### :rocket: Amélioration
- [#4467](https://github.com/1024pix/pix/pull/4467) [FEATURE] Ajoute un filtre sur le nom et prénom dans l'onglet Activité d'une campagne (PIX-4580)
- [#4432](https://github.com/1024pix/pix/pull/4432) [FEATURE] Restreindre l'accès aux actions liées aux certifications (PIX-4667)

## v3.215.0 (01/06/2022)


### :rocket: Amélioration
- [#4470](https://github.com/1024pix/pix/pull/4470) [FEATURE] Passer les sessions ayant des certifications non terminées scorées automatiquement en publiable lors de la finalisation (PIX-4848)
- [#4475](https://github.com/1024pix/pix/pull/4475) [FEATURE] Mettre à jour le lien de certification (PIX-5033).
- [#4478](https://github.com/1024pix/pix/pull/4478) [FEATURE] Afficher les sous catégories E10-E11-E12 dans Pix-Admin (PIX-4914)
- [#4472](https://github.com/1024pix/pix/pull/4472) [FEATURE] Neutraliser automatiquement les signalements des sous-catégories E11 et E12 (PIX-4913)

### :bug: Correction
- [#4465](https://github.com/1024pix/pix/pull/4465) [BUGFIX] Corriger la position du macaron Pix+ Droit dans l'attestation de certification (PIX-4834).

### :coffee: Autre
- [#4462](https://github.com/1024pix/pix/pull/4462) FEATURE Ajouter les sous categories E11 et E12 (PIX-4912)

## v3.214.0 (01/06/2022)


### :rocket: Amélioration
- [#4464](https://github.com/1024pix/pix/pull/4464) [FEATURE] Ajout d'un bouton pour vider les champs de recherche d'utilisateurs dans Pix Admin (PIX-4862).
- [#4463](https://github.com/1024pix/pix/pull/4463) [FEATURE] Créer un script qui crée les comptes des participants au concours de la mairie de Paris (PIX-4962).

### :building_construction: Tech
- [#4420](https://github.com/1024pix/pix/pull/4420) [TECH] Corriger le nom de l'index knowledge-elements_assessmentId_idx qui ne respecte pas la convention de nommage knex.

### :coffee: Autre
- [#4466](https://github.com/1024pix/pix/pull/4466) [ADMIN] Nettoyer le CSS de la page informations de la session (PIX-5015)
- [#4469](https://github.com/1024pix/pix/pull/4469) [A11Y] Ajouter le rôle img aux boulettes de pertinence dans l'onglet Analyse (PIX-4246)

## v3.213.0 (30/05/2022)


### :rocket: Amélioration
- [#4461](https://github.com/1024pix/pix/pull/4461) [FEATURE] Filtrer les certifications sélectionnable pour le volet jury coté admin (PIX-4978)
- [#4440](https://github.com/1024pix/pix/pull/4440) [FEATURE] Prévenir l'ajout individuel de candidat une fois la session finalisée (PIX-4959).
- [#4458](https://github.com/1024pix/pix/pull/4458) [FEATURE] Permettre de rechercher par identifiant dans la liste des utilisateurs sur Pix Admin (PIX-396).
- [#4454](https://github.com/1024pix/pix/pull/4454) [FEATURE] Ajouter un message d'information pour le champ "Email du destinataire" dans la modale d'ajout d'un candidat (PIX-4910).
- [#4456](https://github.com/1024pix/pix/pull/4456) [FEATURE] Modifier le design du bouton d'ajout d'un signalement (PIX-4911).
- [#4442](https://github.com/1024pix/pix/pull/4442) [FEATURE] Permettre de renseigner le volet jury dans admin (PIX-4509)

### :building_construction: Tech
- [#4348](https://github.com/1024pix/pix/pull/4348) [TECH] Nettoyage de toutes les variables, constantes, méthodes, routes du terme `schooling-registrations` (PIX-4741).
- [#4446](https://github.com/1024pix/pix/pull/4446) [TECH] Documenter le helper de pourcentage certif.
- [#4449](https://github.com/1024pix/pix/pull/4449) [TECH] Vérifier les autorisations au niveau des pre-handler (PIX-4969).

### :bug: Correction
- [#4453](https://github.com/1024pix/pix/pull/4453) [BUGFIX] Recharger l'utilisateur après le partage d'une campagne afin de ne plus garder dans les données de la dernière campagne non partagé  (PIX-4923)

## v3.212.0 (25/05/2022)


### :rocket: Amélioration
- [#4447](https://github.com/1024pix/pix/pull/4447) [FEATURE] Séparer les certifications complémentaires Pix+ Édu de 1er et 2nd degré (PIX-4769).

### :building_construction: Tech
- [#4452](https://github.com/1024pix/pix/pull/4452) [TECH] Ajout d'un usecase pour la création d'un gabarit d'un profile cible (PIX-4926).
- [#4410](https://github.com/1024pix/pix/pull/4410) [TECH] Améliorer la page des CGU de Pôle Emploi sur Pix App (PIX-4917).
- [#4438](https://github.com/1024pix/pix/pull/4438) [TECH] Obtenir des détails sur l'erreur lors de la réinitialisation du mot de passe sur Pix App (PIX-4957).
- [#4451](https://github.com/1024pix/pix/pull/4451) [TECH] Affiche les certifications complementaires dans la page des certifs d'une session (PIX-4769)
- [#4146](https://github.com/1024pix/pix/pull/4146) [TECH] Ajouter une contrainte en BDD pour rendre le champ organizationLearnerId dans campaign-participations non nullable (PIX-4136).

## v3.211.0 (23/05/2022)


### :rocket: Amélioration
- [#4423](https://github.com/1024pix/pix/pull/4423) [FEATURE] Restreindre les actions de la page "Utilisateurs" dans Pix Admin aux rôles "SUPER_ADMIN" et "SUPPORT" (PIX-4191)
- [#4434](https://github.com/1024pix/pix/pull/4434) [FEATURE] Inciter le candidat à contacter le surveillant pour rejoindre une session (PIX-4880).
- [#4408](https://github.com/1024pix/pix/pull/4408) [FEATURE] Restreindre l'accès des actions liés aux sessions de certification (PIX-4666)
- [#4413](https://github.com/1024pix/pix/pull/4413) [FEATURE] Ajout d'un bouton pour accéder à la sélection des sujets (PIX-4763).
- [#4404](https://github.com/1024pix/pix/pull/4404) [FEATURE] Préciser le texte de la sous-catégorie de signalement E3 dans la page de finalisation de session (PIX-4907)
- [#4425](https://github.com/1024pix/pix/pull/4425) [FEATURE] Restreindre l'accès aux actions de la page Organisation de Pix Admin aux Certif (PIX-4190).
- [#4428](https://github.com/1024pix/pix/pull/4428) [FEATURE] Ajouter un lien vers "Mes certifications" dans la page d'accès à une session de certification (PIX-4881).
- [#4441](https://github.com/1024pix/pix/pull/4441) [FEATURE] Déplacement du bouton de fermeture du menu burger sur mobile/tablette (PIX-4958).

### :building_construction: Tech
- [#4418](https://github.com/1024pix/pix/pull/4418) [TECH] Création du service d'authentification Pôle Emploi dans l'API (PIX-4920).
- [#4443](https://github.com/1024pix/pix/pull/4443) [TECH] Repository permettant de créer un gabarit et un profil cible (PIX-4925)
- [#4448](https://github.com/1024pix/pix/pull/4448) [TECH] Renommage des contraintes en base faisant mention des "schooling registrations" (PIX-4492).
- [#4445](https://github.com/1024pix/pix/pull/4445) [TECH] Rajouter bootstrap suite au remove de celui ci (PIX-4964)
- [#4411](https://github.com/1024pix/pix/pull/4411) [TECH] Améliorer les notifications d'erreur sur la création de profil cible
- [#4426](https://github.com/1024pix/pix/pull/4426) [TECH] Retirer bootstrap de Pix Admin (Pix-4937)

### :bug: Correction
- [#4433](https://github.com/1024pix/pix/pull/4433) [BUGFIX] Corriger un problème d'arrondi lors de l'affichage des paliers (PIX-4861)
- [#4430](https://github.com/1024pix/pix/pull/4430) [BUGFIX] Calculer correctement les Pix quand un acquis a été passé dans 2 compétences différentes (PIX-4938).
- [#4437](https://github.com/1024pix/pix/pull/4437) [BUGFIX] Centrer le niveau sur la notification de changement de niveau (PIX-4783).

### :coffee: Autre
- [#4439](https://github.com/1024pix/pix/pull/4439) [A11Y] Ajouter un alt au résultat par palier(Pix-4846)

## v3.210.0 (13/05/2022)


### :rocket: Amélioration
- [#4389](https://github.com/1024pix/pix/pull/4389) [FEATURE] Voir le détail des niveaux obtenus aux différents volets d'une certif Pix+ Edu (PIX-4626)
- [#4417](https://github.com/1024pix/pix/pull/4417) [FEATURE] Enlever les espaces en début et fin de classe et groupe lors des import de fichier prescrits (Pix-4629).
- [#4407](https://github.com/1024pix/pix/pull/4407) [FEATURE] Permettre à un utilisateur venant de la CNAV de se connecter à Pix App (PIX-4184).

### :building_construction: Tech
- [#4436](https://github.com/1024pix/pix/pull/4436) [TECH] Empêcher la création automatique d'une traduction vide (PIX-4956).

## v3.209.0 (12/05/2022)


### :rocket: Amélioration
- [#4318](https://github.com/1024pix/pix/pull/4318) [FEATURE] Supprimer une participation depuis Pix Orga quand on est un admin ou propriétaire de la campagne (Pix-4578)
- [#4424](https://github.com/1024pix/pix/pull/4424) [FEATURE] Modification des titres de boutons d'action des cartes tutos (PIX-4921).
- [#4414](https://github.com/1024pix/pix/pull/4414) [FEATURE] Modifier le message d'erreur affiché lorsqu'un élève tente de rentrer en session avec le mauvais compte (PIX-4879).

### :building_construction: Tech
- [#4137](https://github.com/1024pix/pix/pull/4137) [TECH] Migrer la colonne Answer.id de INTEGER en BIG INTEGER (Partie 6)
- [#4135](https://github.com/1024pix/pix/pull/4135) [TECH] Migrer la colonne Answer.id de INTEGER en BIG INTEGER (Partie 5)
- [#4134](https://github.com/1024pix/pix/pull/4134) [TECH] Migrer la colonne Answer.id de INTEGER en BIG INTEGER (Partie 4)

### :bug: Correction
- [#4431](https://github.com/1024pix/pix/pull/4431) [BUGFIX] Il n'y a plus d'image par défaut pour les profils cible (PIX-4940).
- [#4415](https://github.com/1024pix/pix/pull/4415) [BUGFIX] Réparer les filtres sur la page liste des membres d'une organisation(PIX-4849) 
- [#4419](https://github.com/1024pix/pix/pull/4419) [BUGFIX] Corriger le bouton d'assignation à une session
- [#4421](https://github.com/1024pix/pix/pull/4421) [BUGFIX] Afficher correctement les acquis dans les résultats thématiques (PIX-4932).
- [#4381](https://github.com/1024pix/pix/pull/4381) [BUGFIX] Corriger le script de rattachement de profils cibles (PIX-4866)

### :coffee: Autre
- [#4422](https://github.com/1024pix/pix/pull/4422) [DOC] Correction du format de la variable d'environnement ADDITIONAL_NGINX_LOGS dans la documentation

## v3.208.0 (10/05/2022)


### :rocket: Amélioration
- [#4403](https://github.com/1024pix/pix/pull/4403) [FEATURE] Téléchargement du JSON du profil cible à partir d'une sélection de sujets (PIX-4888)
- [#4396](https://github.com/1024pix/pix/pull/4396) [FEATURE] Changer le message d'erreur de connexion en session de certification. (PIX-4878)
- [#4406](https://github.com/1024pix/pix/pull/4406) [FEATURE] Restreindre l'accès à la page "Équipe" de Pix Admin uniquement au rôle "SUPER_ADMIN" (PIX-4850)
- [#4405](https://github.com/1024pix/pix/pull/4405) [FEATURE] Restreindre l'accès à la page Outils de Pix Admin uniquement aux Super Admin (PIX-4189)
- [#4341](https://github.com/1024pix/pix/pull/4341) [FEATURE] Ajouter dans Pix Admin la liste des places détenu par les organisations (PIX-4775) 

### :building_construction: Tech
- [#4399](https://github.com/1024pix/pix/pull/4399) [TECH] Suppression de l'attribut `campaignParticipation` dans le modèle `Assessment` (PIX-4898).
- [#4409](https://github.com/1024pix/pix/pull/4409) [TECH] Supprimer l'erreur UserAccountNotFoundForPoleEmploiError inutilisée (PIX-4915).
- [#4130](https://github.com/1024pix/pix/pull/4130) [TECH] Migrer la colonne Answer.id de INTEGER en BIG INTEGER (Partie 3)

## v3.207.0 (06/05/2022)


### :rocket: Amélioration
- [#4387](https://github.com/1024pix/pix/pull/4387) [FEATURE] Rendre configurable les critères d'obtention de la certification CléA Numérique (PIX-4832).
- [#4401](https://github.com/1024pix/pix/pull/4401) [FEATURE] Récupération du niveau des acquis (PIX-4889)
- [#4402](https://github.com/1024pix/pix/pull/4402) [FEATURE] Contrôler le type d'identifiant de session pour la supervision (PIX-4904).

### :building_construction: Tech
- [#4296](https://github.com/1024pix/pix/pull/4296) [TECH] Supprimer des indexs non utilisés en production.
- [#4397](https://github.com/1024pix/pix/pull/4397) [TECH] Préparer Pix Admin à la restriction des accès pour certains rôles à certaines pages (PIX-4885)

### :bug: Correction
- [#4386](https://github.com/1024pix/pix/pull/4386) [BUGFIX] Corriger le message d'erreur listant les ids des orgas en doublon dans le script OGA(PIX-4864)

## v3.206.0 (04/05/2022)


### :rocket: Amélioration
- [#4398](https://github.com/1024pix/pix/pull/4398) [FEATURE] Tous les membres avec un rôle peuvent accéder à Pix Admin (PIX-4005) 

### :building_construction: Tech
- [#4356](https://github.com/1024pix/pix/pull/4356) [TECH] Ajout d'informations configurables dans les logs des frontaux
- [#4395](https://github.com/1024pix/pix/pull/4395) [TECH] Supprimer la méthode non utilisée `getPixScoreByCompetence`. 

### :bug: Correction
- [#4400](https://github.com/1024pix/pix/pull/4400) [BUGFIX] Corriger l'affichage de la réponse à une épreuve dans la page de détail d'une certification dans Pix Admin (PIX-4897)

## v3.205.0 (04/05/2022)


### :rocket: Amélioration
- [#4392](https://github.com/1024pix/pix/pull/4392) [FEATURE] Récupérer les acquis depuis des sujets (PIX-4762).
- [#4331](https://github.com/1024pix/pix/pull/4331) [FEATURE] Création du composant choice-chip (Pix-4734) 
- [#4353](https://github.com/1024pix/pix/pull/4353) [FEATURE] Enregistrer le niveau obtenu au volet jury (PIX-4512)
- [#4363](https://github.com/1024pix/pix/pull/4363) [FEATURE] Modifier les règles de scoring de la certification complementaire CléA numérique (PIX-4831)
- [#4360](https://github.com/1024pix/pix/pull/4360) [FEATURE] Permettre le changement de rôle dans Pix Admin pour les Super Admin (PIX-4664)
- [#4374](https://github.com/1024pix/pix/pull/4374) [FEATURE] Ajout d'un title aux nouvelles cartes de tutos (PIX-4836).

### :building_construction: Tech
- [#4390](https://github.com/1024pix/pix/pull/4390) [TECH] Supprimer le service mail-generator ajouté pour les épreuves QMAIL. 
- [#4393](https://github.com/1024pix/pix/pull/4393) [TECH] Effectuer la montée de version de @fortawesome/free-solid-svg-icons (PIX-4816).
- [#4376](https://github.com/1024pix/pix/pull/4376) [TECH] Nettoyage des tests de Pix Admin avec Testing Library (the end.) (PIX-4782). 
- [#4385](https://github.com/1024pix/pix/pull/4385) [TECH] Supprimer le code en relation avec les tutoriels v1 (PIX-4845).
- [#4388](https://github.com/1024pix/pix/pull/4388) [TECH] Suppression des changements des v1 et v2 du changelog
- [#4379](https://github.com/1024pix/pix/pull/4379) [TECH] Réparer le lancement des test de l'algo. 

### :bug: Correction
- [#4383](https://github.com/1024pix/pix/pull/4383) [BUGFIX] Permettre de commencer une campagne si la participation du prescrit est supprimée (PIX-4875).
- [#4384](https://github.com/1024pix/pix/pull/4384) [BUGFIX] Corriger l'erreur sur la pagination des tutoriels enregistrés (PIX-4842).
- [#4382](https://github.com/1024pix/pix/pull/4382) [BUGFIX] Renommer la méthode Build en Get pour le scoring Cléa (PIX-4874)

### :coffee: Autre
- [#4391](https://github.com/1024pix/pix/pull/4391) FEATURE] Permettre la sélection de sujets pour un profile cible dans pix-admin (PIX-4579)

## v3.204.0 (29/04/2022)


### :rocket: Amélioration
- [#4378](https://github.com/1024pix/pix/pull/4378) [FEATURE] Remplacement de l'image codée sur la page de tutos vide par un PNG (PIX-4841).
- [#4369](https://github.com/1024pix/pix/pull/4369) [FEATURE]  Afficher les macarons Pix+Édu 1er degré dans le certificat pdf (PIX-4767).
- [#4377](https://github.com/1024pix/pix/pull/4377) [FEATURE] Renommer le nom des labels des champs adresse email (PIX-4856).
- [#4366](https://github.com/1024pix/pix/pull/4366) [FEATURE] Utiliser le vocabulaire métier "Inscrire un candidat" (PIX-4835).
- [#4308](https://github.com/1024pix/pix/pull/4308) [FEATURE] Afficher un message d'erreur si un prescrit à déjà une participation à une campagne (PIX-4674).

### :building_construction: Tech
- [#4362](https://github.com/1024pix/pix/pull/4362) [TECH] Supprimer le usecase get-pix-framework au profit de get-framework-areas
- [#4373](https://github.com/1024pix/pix/pull/4373) [TECH] Harmoniser le texte du formulaire de connexion sur Pix Admin (PIX-4852).
- [#4367](https://github.com/1024pix/pix/pull/4367) [TECH] Suppression de la variable d'environnement FT_NEW_TUTORIALS_PAGE de l'api (PIX-4838).

### :bug: Correction
- [#4355](https://github.com/1024pix/pix/pull/4355) [BUGFIX] ajouter une marge au bloque d'information dans la page de création de campagne (PIX-4812)
- [#4375](https://github.com/1024pix/pix/pull/4375) [BUGFIX] Traduire les intitulés sur la présélection de profil cible (PIX-4855)

## v3.203.0 (27/04/2022)


### :rocket: Amélioration
- [#4359](https://github.com/1024pix/pix/pull/4359) [FEATURE] Supprimer le feature toggle des tutos v2 (PIX-4817). 

### :bug: Correction
- [#4365](https://github.com/1024pix/pix/pull/4365) [BUGFIX] Uniformiser la taille du contenu de la page "Mes Certifications" sur Pix App (PIX-4825).

### :coffee: Autre
- [#4370](https://github.com/1024pix/pix/pull/4370) [CLEANUP] Mise à jour de l'auto merge

## v3.202.0 (26/04/2022)


### :rocket: Amélioration
- [#4354](https://github.com/1024pix/pix/pull/4354) [FEATURE] Ajouter un script permettant de lancer l'auto jury pour une session (PIX-4819).
- [#4339](https://github.com/1024pix/pix/pull/4339) [FEATURE] Empêcher la tentative de création de candidat pendant un appel API (PIX-4804).
- [#4345](https://github.com/1024pix/pix/pull/4345) [FEATURE] Ajouter la page "Équipe" dans Pix Admin qui liste les membres Pix Admin existants (PIX-4003)

### :building_construction: Tech
- [#4213](https://github.com/1024pix/pix/pull/4213) [TECH] Créer des routes pour permettre la sélection d'un profil sur Pix-admin (PIX-4544).

## v3.201.0 (25/04/2022)


### :rocket: Amélioration
- [#4357](https://github.com/1024pix/pix/pull/4357) [FEATURE] Modifier "Ajouter des candidats" en "Inscrire des candidats" dans Pix Certif (PIX-3007).
- [#4352](https://github.com/1024pix/pix/pull/4352) [FEATURE] Désactiver le bouton quand on sauvegarde un tuto (PIX-4824).
- [#4297](https://github.com/1024pix/pix/pull/4297) [FEATURE] Amélioration du style des boutons des nouvelles cartes tutos (PIX-4724).

### :building_construction: Tech
- [#4358](https://github.com/1024pix/pix/pull/4358) [TECH] Réparation d'un test flaky sur le test auto du script de création de badge-criteria à partir d'un fichier JSON (PIX-4828)
- [#4338](https://github.com/1024pix/pix/pull/4338) [TECH]  Utiliser des vectoriels pour l'affichage des macarons de certification complementaire dans les pdf (PIX-4798)

## v3.200.0 (21/04/2022)


### :rocket: Amélioration
- [#4347](https://github.com/1024pix/pix/pull/4347) [FEATURE] Gere la certification complementaire CleA V3 (PIX-4788)
- [#4344](https://github.com/1024pix/pix/pull/4344) [FEATURE] Voir l'id d'un membre et le détail si l'on clique dessus (PIX-4781)
- [#4346](https://github.com/1024pix/pix/pull/4346) [FEATURE] Mettre le focus automatiquement sur le champ texte de résolution de signalement lorsqu'on ouvre la pop-up de résolution sur PixAdmin (PIX-4786)

### :building_construction: Tech
- [#4320](https://github.com/1024pix/pix/pull/4320) [TECH] Ajout des migrations pour l'ajout de rôles dans Pix Admin (PIX-4566)
- [#4351](https://github.com/1024pix/pix/pull/4351) [TECH] Améliorer le message d'erreur du script OGA lorsque l'organisation existe déjà (PIX-4823)
- [#4335](https://github.com/1024pix/pix/pull/4335) [TECH] Mettre le path de l'url d'authentification de Pole Emploi dans la variable d'environnement (PIX-4792)
- [#4314](https://github.com/1024pix/pix/pull/4314) [TECH] Gerer les volets Pix Edu en BDD via la colonne source (PIX-4746)

## v3.199.0 (19/04/2022)


### :rocket: Amélioration
- [#4342](https://github.com/1024pix/pix/pull/4342) [FEATURE] Harmoniser les messages d'erreur lors de la création d'une session (PIX-4809).
- [#4340](https://github.com/1024pix/pix/pull/4340) [FEATURE] Ajout des nouvelles cartes tutos sur les pages checkpoint (PIX-4601).

### :building_construction: Tech
- [#4336](https://github.com/1024pix/pix/pull/4336) [TECH] Retirer les tests de bout en bout sur PixCertif (PIX-4796)

### :bug: Correction
- [#4330](https://github.com/1024pix/pix/pull/4330) [BUGFIX] Ne pas afficher le message d'alerte de sortie de focus lorsque l'user reprend un nouvel assessment (PIX-4787).
- [#4337](https://github.com/1024pix/pix/pull/4337) [BUGFIX] Un utilisateur pouvait voir plusieurs fois la même habilitation à cocher lors d'une inscription de candidat en certification (PIX-4797)

## v3.198.0 (15/04/2022)


### :rocket: Amélioration
- [#4328](https://github.com/1024pix/pix/pull/4328) [FEATURE] Afficher les macarons Pix+ Édu de 1er degré dans le certificat et certificat partagé dans Pix App (PIX-4768).
- [#4319](https://github.com/1024pix/pix/pull/4319) [FEATURE] Enregistrer le prénom et nom reçu du GAR lors du rajout de la connexion GAR à un utilisateur existant (PIX-4770)

### :building_construction: Tech
- [#4334](https://github.com/1024pix/pix/pull/4334) [TECH] Mise à jour de Pix UI dans Pix Orga (PIX-4791).
- [#4311](https://github.com/1024pix/pix/pull/4311) [TECH] Renommer les "pe" en "pole-emploi"
- [#4300](https://github.com/1024pix/pix/pull/4300) [TECH] Stocker le taux de repro d'un parcours de certification (PIX-4757)
- [#4312](https://github.com/1024pix/pix/pull/4312) [TECH] Supprimer le support des clés sans préfixe dans redis (PIX-4693)

### :bug: Correction
- [#4332](https://github.com/1024pix/pix/pull/4332) [BUGFIX] Copier les skill-sets pour les utiliser dans un autre badge dans le script de création de badge-criteria (PIX-4789).
- [#4323](https://github.com/1024pix/pix/pull/4323) [BUGFIX] Fixer la valeur de `updatedAt` des invitations quand on archive une organisation (PIX-4780).

### :coffee: Autre
- [#4317](https://github.com/1024pix/pix/pull/4317) [A11Y] Ajouter un texte aux boutons de retour sur Pix Certif (PIX-4773).

## v3.197.0 (13/04/2022)


### :rocket: Amélioration
- [#4322](https://github.com/1024pix/pix/pull/4322) [FEATURE] Afficher un message spécifique dans PixOrga lorsque l'utilisateur se rend sur l'onglet Certifications et que l'établissement n'a pas encore importé d'élèves (PIX-2294)
- [#4291](https://github.com/1024pix/pix/pull/4291) [FEATURE] Enregistrer ou mettre à jour le prénom et nom reçu du GAR lors de la connexion (PIX-4656)
- [#4321](https://github.com/1024pix/pix/pull/4321) [FEATURE] Création de plusieurs lots d'acquis via un script pour le badge Cléa (PIX-4749).
- [#4310](https://github.com/1024pix/pix/pull/4310) [FEATURE] Proposer des épreuves et scorer une certification Pix+ Édu de 1er degré (PIX-4754).
- [#4302](https://github.com/1024pix/pix/pull/4302) [FEATURE] Mettre à jour les images des badges pour Pix+ Édu 2nd degré dans le certificat pdf (PIX-4743)
- [#4313](https://github.com/1024pix/pix/pull/4313) [FEATURE] Ajout d'un texte RGPD dans la liste des participations d'une campagne dans pix admin (PIX-4651).
- [#4307](https://github.com/1024pix/pix/pull/4307) [FEATURE] Afficher les informations du compte utilisateur dans le tableau des participations d'une campagne de Pix Admin (PIX-4752).

### :building_construction: Tech
- [#4325](https://github.com/1024pix/pix/pull/4325) [TECH] Fixer la vulnérabilité critique de la dépendance minimist
- [#4306](https://github.com/1024pix/pix/pull/4301) [TECH] Renommage des schooling-registrations en `organization-learners` dans les modèles du domaine (PIX-4687).

## v3.196.1 (12/04/2022)


### :bug: Correction
- [#4327](https://github.com/1024pix/pix/pull/4327) [HOTFIX] Correction du nom d'index de Knowledge-elements (PIX-4784)

## v3.196.0 (12/04/2022)


### :rocket: Amélioration
- [#4290](https://github.com/1024pix/pix/pull/4290) [FEATURE] Ne pas afficher les pages Analyses/Résultats d'une participation supprimée (Pix-4689)
- [#4305](https://github.com/1024pix/pix/pull/4305) [FEATURE] Afficher la certificabilité d'un candidat pour une certification Pix+ Édu de 1er degré (PIX-4750).
- [#4299](https://github.com/1024pix/pix/pull/4299) [FEATURE] Empêcher la suppression des cartes sur la page recommandés (PIX-4736).
- [#4295](https://github.com/1024pix/pix/pull/4295) [FEATURE] Utiliser la nouvelle card des tutoriels pour le détails des compétences (PIX-4600).
- [#4288](https://github.com/1024pix/pix/pull/4288) [FEATURE] Amélioration du design des cartes de tutos (PIX-4337).

### :building_construction: Tech
- [#4303](https://github.com/1024pix/pix/pull/4303) [TECH] Limiter les watchers nodemon (PIX-4745)
- [#4267](https://github.com/1024pix/pix/pull/4267) [TECH] Stocker le clientId du parcours Pôle Emploi uniquement dans l'API (PIX-4682).
- [#4306](https://github.com/1024pix/pix/pull/4306) [TECH] Disposer d'un mot de passe par défaut sur les données de seed.
- [#4251](https://github.com/1024pix/pix/pull/4251) [TECH] Tracer la cause de l'erreur si la création d'un candidat échoue (PIX-4663).
- [#4298](https://github.com/1024pix/pix/pull/4298) [TECH] Remplacer la dépendance `ember-sinon` par `sinon`.
- [#4259](https://github.com/1024pix/pix/pull/4259) [TECH] Nettoyage des tests de Pix Admin avec Testing Library (partie 2) (PIX-4672).
- [#4285](https://github.com/1024pix/pix/pull/4285) [TECH] supprimer le toggle FT_CERTIFICATION_BILLING (PIX-4521)
- [#4294](https://github.com/1024pix/pix/pull/4294) [TECH] Ajouter un index manquant sur la table knowledge-elements concernant la colonne "assessmentid".

### :bug: Correction
- [#4304](https://github.com/1024pix/pix/pull/4304) [BUGFIX] Pagination des tutoriels : Gérer la suppression d'une page
- [#4284](https://github.com/1024pix/pix/pull/4284) [BUGFIX] Un membre d’espace Pix Certif ne voit pas la liste de ses candidats en prescription de certification SCO (PIX-4316)
- [#4293](https://github.com/1024pix/pix/pull/4293) [BUGFIX] Considérer les réponses comme "focusedout" si il y a eu un évènement "focusedout" (PIX-4723)

## v3.195.0 (07/04/2022)


### :rocket: Amélioration
- [#4292](https://github.com/1024pix/pix/pull/4292) [FEATURE] Monter la version de Pix-ui pour utiliser les modifications de Pix-pagination (PIX-4721).
- [#4273](https://github.com/1024pix/pix/pull/4273) [FEATURE] Enregistrement de tuto sur les cards V2 (PIX-4598)
- [#4277](https://github.com/1024pix/pix/pull/4277) [FEATURE] Afficher les participations supprimées dans la liste des participations d'une campagne Pix Admin (Pix 4576).
- [#4201](https://github.com/1024pix/pix/pull/4201) [FEATURE] Ne pas pouvoir partager son profil si une participation a été supprimée (PIX-4443).
- [#4276](https://github.com/1024pix/pix/pull/4276) [FEATURE] Afficher une seule fois un message d'avertissement lorsque plusieurs épreuves focus se suivent (PIX-4617)

### :building_construction: Tech
- [#4257](https://github.com/1024pix/pix/pull/4257) [TECH] Ajouter un lien entre partnerCertification et complementaryCertificationCourse (PIX-4652)
- [#4280](https://github.com/1024pix/pix/pull/4280) [TECH] Mettre fin aux connexions existantes lors de la suppression du schéma de BDD (PIX-4714)
- [#4282](https://github.com/1024pix/pix/pull/4282) [TECH] Enlever le "s" de "pole-emplois"
- [#4287](https://github.com/1024pix/pix/pull/4287) [TECH] Ajoute des détails dans les logs des focusOut (PIX-4722)
- [#4263](https://github.com/1024pix/pix/pull/4263) [TECH] Monter de versions des packages de Mon Pix. 

## v3.194.0 (05/04/2022)


### :rocket: Amélioration
- [#4283](https://github.com/1024pix/pix/pull/4283) [FEATURE] Mise à jour du texte de la bannière SCO dans PixCertif (PIX-4690)
- [#4248](https://github.com/1024pix/pix/pull/4248) [FEATURE] Faire apparaitre les signalements de focus out sur la page de détails d'une certification sur Pix Admin (PIX-4405).
- [#4245](https://github.com/1024pix/pix/pull/4245) [FEATURE] Création de prescrits pour les anciennes participations des utilisateurs dissociés(PIX-4484)
- [#4272](https://github.com/1024pix/pix/pull/4272) [FEATURE] Ne pas afficher les participations supprimées dans les résultats de campagnes (PIX-4575).

### :building_construction: Tech
- [#4270](https://github.com/1024pix/pix/pull/4270) [TECH] Renommage des database-builders et attributs de ceux-ci pour les appeler `organization-learners` (PIX-4610).
- [#4197](https://github.com/1024pix/pix/pull/4197) [TECH] Nettoyage des erreurs sur les fonctions vides.
- [#4278](https://github.com/1024pix/pix/pull/4278) [TECH] Conditionner l'execution des jobs JIRA à la présence de la variable JIRA_URL
- [#4268](https://github.com/1024pix/pix/pull/4268) [TECH] Unifier la création des read-models TutorialForUser.

### :bug: Correction
- [#4275](https://github.com/1024pix/pix/pull/4275) [BUGFIX] Permettre la réconciliation si l'INE est vide (PIX-4685).

## v3.193.2 (04/04/2022)


### :bug: Correction
- [#4281](https://github.com/1024pix/pix/pull/4281) [TECH] Ajouter le support d'Internet Explorer dans Pix App, Pix Orga, Pix Certif et Pix Admin (PIX-4719)

## v3.193.1 (04/04/2022)


### :rocket: Amélioration
- [#4244](https://github.com/1024pix/pix/pull/4244) [FEATURE] Voir un écran intermédiaire avant de débuter une épreuve focus, le retour (Pix-4623)

### :bug: Correction
- [#4239](https://github.com/1024pix/pix/pull/4239) [BUGFIX] Mise à jour ou non du lastQuestionState de l'assessment en fonction du challengeId (PIX-4628).
- [#4235](https://github.com/1024pix/pix/pull/4235) [BUGFIX] Ne pas enregistrer des réponses focusedOut sur des épreuves non focused (PIX-4627)

## v3.193.0 (04/04/2022)


### :rocket: Amélioration
- [#4265](https://github.com/1024pix/pix/pull/4265) [FEATURE] Modifier l'ordre d'affichage des signalements sur la page de finalisation de session (PIX-4676)
- [#4255](https://github.com/1024pix/pix/pull/4255) [FEATURE] Permettre l'évaluation d'un tutoriel (V2) (PIX-4599).

### :building_construction: Tech
- [#4236](https://github.com/1024pix/pix/pull/4236) [TECH] Ne pas logguer les usernames lors de la création d'un compte via la réconciliation (PIX-4630)
- [#4240](https://github.com/1024pix/pix/pull/4240) [TECH] Créer des ségrégations pour les usages de redis (PIX-4635)
- [#4274](https://github.com/1024pix/pix/pull/4274) [TECH] Supprimer la route inutilisée qui met à jour l'adresse e-mail sans validation sur Pix App (PIX-4686).
- [#4254](https://github.com/1024pix/pix/pull/4254) [TECH] Supprimer le feature toggle FT_VALIDATE_EMAIL (PIX-3532)

## v3.192.0 (31/03/2022)


### :rocket: Amélioration
- [#4252](https://github.com/1024pix/pix/pull/4252) [FEATURE] Ajouter une sous-catégorie de signalement spécifique aux épreuves focus dans Pix Certif (PIX-4609)
- [#4229](https://github.com/1024pix/pix/pull/4229) [FEATURE] Enregistrer le prénom et nom reçu du GAR lors de l'inscription à Pix App (PIX-4518).
- [#4246](https://github.com/1024pix/pix/pull/4246) [FEATURE] Ne pas compter les participations supprimées dans les chiffres d'une campagne dans PixAdmin (PIX-4595).
- [#4243](https://github.com/1024pix/pix/pull/4243) [FEATURE] Retirer les participations supprimées d'une campagne lors de l'export CSV (PIX-4574).

### :building_construction: Tech
- [#4260](https://github.com/1024pix/pix/pull/4260) [TECH] Retirer le support d'Internet Explorer dans Pix App, Pix Orga, Pix Certif et Pix Admin (PIX-4678)
- [#4266](https://github.com/1024pix/pix/pull/4266) [TECH] Amélioration des traductions UK de la page tutos recommandés.
- [#4261](https://github.com/1024pix/pix/pull/4261) [TECH] Supprimer les styles customs sur les boutons "Recommandés"&"Enregistrés" (Pix-4653)
- [#4264](https://github.com/1024pix/pix/pull/4264) [TECH] Suppression du style du composant de pagination sur mon-pix.
- [#4262](https://github.com/1024pix/pix/pull/4262) [TECH] Résoudre les tests flakys sur Pix Admin.

### :bug: Correction
- [#4258](https://github.com/1024pix/pix/pull/4258) [BUGFIX] Alignement des containers de pix-app (PIX-4679).
- [#4253](https://github.com/1024pix/pix/pull/4253) [BUGFIX] L'import CSV d'élèves prend trop de temps pour s'executer (PIX-4603).
- [#4256](https://github.com/1024pix/pix/pull/4256) [BUGFIX] Suppression d'une bannière non nécessaire en mobile sur le dashboard (PIX-4675).

### :coffee: Autre
- [#4249](https://github.com/1024pix/pix/pull/4249) [BUG] Corrige un test instable sur le modèle SharedProfileForCampaign.

## v3.191.0 (28/03/2022)


### :rocket: Amélioration
- [#4218](https://github.com/1024pix/pix/pull/4218) [FEATURE] Ajout d'un script permettant de remplir la colonne skillId dans la table `user-saved-tutorials` (PIX-4383).
- [#4226](https://github.com/1024pix/pix/pull/4226) [FEATURE] Mettre à jour les catégories de signalements lors de la finalisation (PIX-4608).
- [#4242](https://github.com/1024pix/pix/pull/4242) [FEATURE] Valider ou neutraliser automatiquement une réponse à une question focus si un signalement existe (PIX-4403)
- [#4227](https://github.com/1024pix/pix/pull/4227) [FEATURE] Clarifier la formulation lors de la finalisation de session (PIX-4546).
- [#4241](https://github.com/1024pix/pix/pull/4241) [FEATURE] Cacher le bandeau d'envoi de profil si la campagne est archivée (PIX-4596).
- [#4219](https://github.com/1024pix/pix/pull/4219) [FEATURE] Empêcher la réconciliation de deux personnes différentes sur un même compte (PIX-1398).
- [#4216](https://github.com/1024pix/pix/pull/4216) [FEATURE] Ne plus afficher les participations supprimées dans l'onglet activités dans PixOrga (PIX-4573).
- [#4225](https://github.com/1024pix/pix/pull/4225) [FEATURE] Ne pas pouvoir repasser une collecte de profil à envoi multiple supprimé (PIX-4444)
- [#4224](https://github.com/1024pix/pix/pull/4224) [FEATURE] N'afficher que les certifications complementaires passées par le candidat (PIX-4510)
- [#4228](https://github.com/1024pix/pix/pull/4228) [FEATURE] Ajoute une tooltip d'info tarification pour la modal d'ajout de candidat (PIX-4605)

### :building_construction: Tech
- [#4127](https://github.com/1024pix/pix/pull/4127) [TECH] Migrer la colonne Answer.id de INTEGER en BIG INTEGER (Partie 2)
- [#4247](https://github.com/1024pix/pix/pull/4247) [TECH] Utiliser PixPagination sur les tutos v2 (PIX-4613)
- [#4232](https://github.com/1024pix/pix/pull/4232) [TECH] Monter pix-ui en v13 sur mon-pix (PIX-4615)
- [#4108](https://github.com/1024pix/pix/pull/4108) [TECH] Migrer la colonne Answer.id de INTEGER en BIG INTEGER (Partie 1)
- [#4238](https://github.com/1024pix/pix/pull/4238) [TECH] Refacto du usecase send-sco-invitation (PIX-4632).

## v3.190.0 (24/03/2022)


### :rocket: Amélioration
- [#4162](https://github.com/1024pix/pix/pull/4162) [FEATURE] Résoudre manuellement un signalement - Admin (PIX-4466).
- [#4215](https://github.com/1024pix/pix/pull/4215) [FEATURE] Ajouter le nom du user sur la landing page(PIX-4431)
- [#4223](https://github.com/1024pix/pix/pull/4223) [FEATURE] Ne plus prendre en compte les participations supprimées dans le rapport d'analyse d'une campagne (PIX-4577)

### :bug: Correction
- [#4234](https://github.com/1024pix/pix/pull/4234) [BUGFIX] Permettre l'affichage des classes/groupes d'une campagne même s'il y en a certain(e)s à null (PIX-4618).

## v3.189.0 (23/03/2022)

### :rocket: Amélioration
- [#4527](https://github.com/1024pix/pix/pull/4527) [FEATURE] Empêcher l'activation/récupération d'une organisation SCO si celle-ci est archivée sur Pix Orga (PIX-4527).
- [#4217](https://github.com/1024pix/pix/pull/4217) [FEATURE] Mettre à jour le wording en cas de défocus en certif (PIX-4558)

### :building_construction: Tech
- [#4220](https://github.com/1024pix/pix/pull/4220) [TECH] Monter pix-ui en v11 sur mon-pix (PIX-4614)
- [#4207](https://github.com/1024pix/pix/pull/4207) [TECH] Nettoyage du dossier Mirage dans mon-pix.
- [#4222](https://github.com/1024pix/pix/pull/4222) [TECH] Monter de version de Pix-UI dans Pix Admin (Pix-4604).

### :bug: Correction
- [#4214](https://github.com/1024pix/pix/pull/4214) [BUGFIX] Ne pas afficher l'attestation des certifications annulées  (PIX-4563).
- [#4195](https://github.com/1024pix/pix/pull/4195) [BUGFIX] Les signalements à ne pas résoudre sont affichés en haut de la liste dans Pix Admin (PIX-4495).

## v3.188.1 (22/03/2022)

### :bug: Correction
- [#4230](https://github.com/1024pix/pix/pull/4230) [BUGFIX] Suppression de l'écran intermédiaire avant de débuter une épreuve focus (PIX-4402)

## v3.187.0 (21/03/2022)

### :rocket: Amélioration
- [#4199](https://github.com/1024pix/pix/pull/4199) [FEATURE] Voir un écran intermédiaire avant de débuter une épreuve focus (PIX-4402)
- [#4211](https://github.com/1024pix/pix/pull/4211) [FEATURE] Augmentation de l'espace entre le score max et l'icone dans l'hexagone de score (PIX-4565).
- [#4182](https://github.com/1024pix/pix/pull/4182) [FEATURE] Ajout de la vue de la page de création de profil cible sur Pix Admin (PIX-4543)

### :building_construction: Tech
- [#4208](https://github.com/1024pix/pix/pull/4208) [TECH] Supprimer le `user` du modèle `CampaignParticipation`.
- [#4152](https://github.com/1024pix/pix/pull/4152) [TECH] Renommer la table schooling-registrations par organization-learners (PIX-4137).
- [#4133](https://github.com/1024pix/pix/pull/4133) [TECH] Supprimer la prévention des attaques par réponse utilisateur trop longue. 
- [#4206](https://github.com/1024pix/pix/pull/4206) [TECH] Eviter le crash de container lorsqu'on récupère les profiles cibles.
- [#4209](https://github.com/1024pix/pix/pull/4209) [TECH] Supprimer le modèle/repo OrganizationToArchive
- [#4204](https://github.com/1024pix/pix/pull/4204) [TECH] Suppression du toggle des certification complémentaires (PIX-4542)
- [#4193](https://github.com/1024pix/pix/pull/4193) [TECH] Supprimer la dépendance ember-simple-auth-oidc (PIX-4204)

### :coffee: Autre
- [#4163](https://github.com/1024pix/pix/pull/4163) [CLEAN] Nettoyage des tests de Pix Admin avec Testing Library.

## v3.186.0 (16/03/2022)


### :rocket: Amélioration
- [#4202](https://github.com/1024pix/pix/pull/4202) [FEATURE] Recommander des tutoriels de la même langue que celle de l'utilisateur (PIX-4552).
- [#4185](https://github.com/1024pix/pix/pull/4185) [FEATURE] Ajout de la possibilité de basculer une campagne en envoi multiple dans PixAdmin (PIX-4421).
- [#4198](https://github.com/1024pix/pix/pull/4198) [FEATURE] Ajout de la pagination pour les tutoriels enregistrés (PIX-4545)
- [#4188](https://github.com/1024pix/pix/pull/4188) [FEATURE] Permettre d'archiver une organisation sur Pix Admin (PIX-3817).

### :building_construction: Tech
- [#4203](https://github.com/1024pix/pix/pull/4203) [TECH] Supprime le dossier components dans le dossier templates de mon-pix (PIX-4559).
- [#3813](https://github.com/1024pix/pix/pull/3813) [TECH] Importer des données d'une BDD ponctuellement.

## v3.185.0 (15/03/2022)


### :rocket: Amélioration
- [#4196](https://github.com/1024pix/pix/pull/4196) [FEATURE] Ajout du visuel de la page vide de tutoriels recommandés (PIX-4338).
- [#4183](https://github.com/1024pix/pix/pull/4183) [FEATURE] Ajout de la pagination sur l'onglet Mes Tutos Recommandés (PIX-4294)
- [#4191](https://github.com/1024pix/pix/pull/4191) [FEATURE] Ne prend plus en compte les parcours supprimés dans le bandeau de reprise (PIX-4439).
- [#4187](https://github.com/1024pix/pix/pull/4187) [FEATURE] Ne pas pouvoir repasser son parcours si la participation a été supprimée (PIX-4442).

### :building_construction: Tech
- [#4200](https://github.com/1024pix/pix/pull/4200) [TECH] Ajout d'une page de maintenance spécifique pour les opérations planifiées
- [#4175](https://github.com/1024pix/pix/pull/4175) [TECH] Monter de version les packages de l'API.
- [#4091](https://github.com/1024pix/pix/pull/4091) [TECH] Eviter les conversions inutiles XML/texte dans l'export des candidats (PIX-4378).

## v3.184.0 (14/03/2022)


### :rocket: Amélioration
- [#4171](https://github.com/1024pix/pix/pull/4171) [FEATURE] Refactore le bandeau de reprise de collecte de reprise et le menu "Mes parcours" (PIX-4437)

### :bug: Correction
- [#4192](https://github.com/1024pix/pix/pull/4192) [BUGFIX] Corriger le téléchargement d'une attestation de certification pour un candidat possèdant un badge Pix+ Édu définitif (PIX-4553).
- [#4189](https://github.com/1024pix/pix/pull/4189) [BUGFIX] Suppression d'un glitch au survol d'une carte de compétence (PIX-4550).

### :coffee: Autre
- [#4174](https://github.com/1024pix/pix/pull/4174) [API] Supprimer les `userId` des schooling-registrations crééent automatiquement  (PIX-4503)

## v3.183.0 (11/03/2022)


### :rocket: Amélioration
- [#4178](https://github.com/1024pix/pix/pull/4178) [FEATURE] Bloquer le rattachement de membres et l'invitation de nouveaux membres (Pix-4282).
- [#4179](https://github.com/1024pix/pix/pull/4179) [FEATURE] Modifier l'id externe d'une participation depuis Pix Admin(Pix-4430)

### :bug: Correction
- [#4186](https://github.com/1024pix/pix/pull/4186) [BUGFIX] Les badges de tous les utilisateurs apparaissent sur les certificats (PIX-4548)

## v3.182.0 (10/03/2022)


### :rocket: Amélioration
- [#4168](https://github.com/1024pix/pix/pull/4168) [FEATURE] Afficher le niveau définitif d'une certification Pix+Edu (PIX-4494).
- [#4184](https://github.com/1024pix/pix/pull/4184) [FEATURE] Empêcher l'envoi des résultats d'une campagne d'évaluation si la participation est supprimée (PIX-4441).

### :bug: Correction
- [#4180](https://github.com/1024pix/pix/pull/4180) [BUGFIX] Erreur 500 lorsqu'on retente une compétence (PIX-4526)

### :coffee: Autre
- [#4164](https://github.com/1024pix/pix/pull/4164) [CLEAN] Nettoyage des return manquants coté API.

## v3.181.0 (10/03/2022)


### :rocket: Amélioration
- [#4170](https://github.com/1024pix/pix/pull/4170) [FEATURE] Afficher une carte au statut INACTIF si mon parcours est supprimé par le prescripteur ou si la campange est archivée (PIX-4438).
- [#4173](https://github.com/1024pix/pix/pull/4173) [FEATURE] Permettre d'archiver toutes les campagnes en archivant une organisation sur Pix Admin (PIX-4280).
- [#4177](https://github.com/1024pix/pix/pull/4177) [FEATURE] Désactiver tous les membres actifs lors de l'archivage d'une organisation  (PIX-3818).
- [#4155](https://github.com/1024pix/pix/pull/4155) [FEATURE] Mettre le taux de repro de Pix+Edu à 70% (PIX-4483).

### :building_construction: Tech
- [#4181](https://github.com/1024pix/pix/pull/4181) [TECH] Configure le proxy API pour limiter le temps d'indispo sur certif, orga, admin
- [#4176](https://github.com/1024pix/pix/pull/4176) [TECH] Utiliser la nouvelle version LTS de node 16.14.

### :coffee: Autre
- [#3859](https://github.com/1024pix/pix/pull/3859) [ADR] Utiliser PgBoss pour lancer des taches asynchrones (PIX-3141).

## v3.180.0 (07/03/2022)


### :rocket: Amélioration
- [#4169](https://github.com/1024pix/pix/pull/4169) [FEATURE] Annule toutes les invitations en attente en archivant une organisation (PIX-4281). 
- [#4088](https://github.com/1024pix/pix/pull/4088) [FEATURE] Afficher des statistiques de participations à une campagne dans le détail d'une campagne dans Pix Admin(PIX-4362).
- [#4157](https://github.com/1024pix/pix/pull/4157) [FEATURE] Voir si une organisation est archivée et qui a fait l'action d'archivage dans Pix Admin (PIX-4186).

### :building_construction: Tech
- [#4172](https://github.com/1024pix/pix/pull/4172) [TECH] Refacto mettre à jour la date de modification dès qu'on annule une invitation
- [#4159](https://github.com/1024pix/pix/pull/4159) [TECH] Utiliser la bonne erreur dans les tests de l'use-case add-tutorial-evaluation. 
- [#4160](https://github.com/1024pix/pix/pull/4160) [TECH] Ajouter les informations de suppression sur une participation à une campagne (PIX-4435)

### :bug: Correction
- [#4166](https://github.com/1024pix/pix/pull/4166) [BUGFIX] L'inscription de candidats est rejetée sur un centre SCO qui ne gère pas de liste d'élèves parce que la facturation n'est pas renseignée (PIX-4500).
- [#4165](https://github.com/1024pix/pix/pull/4165) [BUGFIX] Enlever le message du focus apparaissant sur certains challenges libres (PIX-4471)
- [#4156](https://github.com/1024pix/pix/pull/4156) [BUGFIX] Pouvoir revoir le détail des tutos enregistrés sur la route v2

## v3.179.0 (03/03/2022)


### :rocket: Amélioration
- [#4141](https://github.com/1024pix/pix/pull/4141) [FEATURE] Utiliser seulement les données du prescrit côté Pix Orga (PIX-4387).

### :building_construction: Tech
- [#4080](https://github.com/1024pix/pix/pull/4080) [TECH] Refacto du accept organization invitation
- [#4114](https://github.com/1024pix/pix/pull/4114) [TECH] Suppression du wrapper sur le `visit` de ember/test-helpers.
- [#4147](https://github.com/1024pix/pix/pull/4147) [TECH] Ajout du `skillId` dans la table `user-saved-tutorials` (PIX-4335)

### :bug: Correction
- [#4104](https://github.com/1024pix/pix/pull/4104) [BUGFIX] [A11Y] Permettre l'affichage des modales de Pix Certif avec le CSS désactivé (PIX-3910)

## v3.178.0 (01/03/2022)


### :rocket: Amélioration
- [#4148](https://github.com/1024pix/pix/pull/4148) [FEATURE] Voir la tarification et le code de prépaiement sur la page de détails d'un candidat (PIX-4199)
- [#4145](https://github.com/1024pix/pix/pull/4145) [FEATURE] Pouvoir indiquer la tarification de la part Pix d'un candidat dans la modal d'ajout (PIX-4198).

### :bug: Correction
- [#4151](https://github.com/1024pix/pix/pull/4151) [BUGFIX] Mettre le créateur de la campagne en propriétaire par défaut sur Pix Orga (PIX-4478).

### :coffee: Autre
- [#4153](https://github.com/1024pix/pix/pull/4153)  [BUGFIX] Update ODS billing tooltip (PIX-4411)

## v3.177.0 (01/03/2022)


### :rocket: Amélioration
- [#4149](https://github.com/1024pix/pix/pull/4149) [FEATURE] Permettre d'identifier une organisation comme archivé (PIX-3816)
- [#4136](https://github.com/1024pix/pix/pull/4136) [FEATURE] Lister les tutos recommandés et enregistrés (PIX-4382)

### :building_construction: Tech
- [#4142](https://github.com/1024pix/pix/pull/4142) [TECH] Corriger les erreurs pole emploi suite à la mise en place du refresh token (PIX-4259)
- [#4150](https://github.com/1024pix/pix/pull/4150) [TECH] Supprimer la colonne canCollectProfiles de la BDD (PIX-4364)
- [#4097](https://github.com/1024pix/pix/pull/4097) [TECH] Configure le proxy API pour limiter le temps d'indispo

## v3.176.1 (25/02/2022)


### :bug: Correction
- [#4143](https://github.com/1024pix/pix/pull/4143) [BUGFIX] Filtrer les tutoriels inexistants sur la page des tuto

## v3.176.0 (25/02/2022)


### :rocket: Amélioration
- [#4120](https://github.com/1024pix/pix/pull/4120) [FEATURE] Déplacer une méthode d'authentification Pole Emploi (ou Gar) d'un utilisateur à un autre (PIX-4175)
- [#4131](https://github.com/1024pix/pix/pull/4131) [FEATURE] Permettre de marquer un profil cible comme étant "Parcours Accès Simplifié" sur Pix Admin (PIX-4042).
- [#4128](https://github.com/1024pix/pix/pull/4128) [FEATURE] Résoudre manuellement un signalement - API (PIX-4412).
- [#4126](https://github.com/1024pix/pix/pull/4126) [FEATURE] Affichage des participations à une campagne dans Pix Admin (PIX-4429).

### :building_construction: Tech
- [#4140](https://github.com/1024pix/pix/pull/4140) [TECH] Corriger les logs infinis lorsqu'on lance les tests unitaire en watch

### :bug: Correction
- [#4139](https://github.com/1024pix/pix/pull/4139) [BUGFIX] Corriger l'ODS d'import des candidats qui ne s'ouvre pas avec Excel (PIX-4467)

## v3.175.0 (24/02/2022)


### :rocket: Amélioration
- [#4129](https://github.com/1024pix/pix/pull/4129) [FEATURE] Tutos v2 enregistrés vide (PIX-4297)
- [#4122](https://github.com/1024pix/pix/pull/4122) [FEATURE] Permettre de rattacher à nouveau un membre Pix Certif qui a été désactivé par le passé (PIX-4013).
- [#4121](https://github.com/1024pix/pix/pull/4121) [FEATURE] Mettre à jour le composant pour choisir un propriétaire de campagne (PIX-4410)
- [#4093](https://github.com/1024pix/pix/pull/4093) [FEATURE] Pouvoir sélectionner une thématique entièrement (PIX-3955)

### :building_construction: Tech
- [#4138](https://github.com/1024pix/pix/pull/4138) [TECH] Monter la version de Pix-UI sur Pix Admin (PIX-4464)
- [#4132](https://github.com/1024pix/pix/pull/4132) [TECH] Ajout de deux modèles UserTutorial et UserTutorialWithTutorial sur l'api
- [#4119](https://github.com/1024pix/pix/pull/4119) [TECH]  Supprimer l’utilisation, l’affichage et la modification de canCollectProfiles pour les orga dans Pix Admin (PIX-4363).
- [#4022](https://github.com/1024pix/pix/pull/4022) [TECH] Simplifie la manière dont les organizations sont rattachés aux profils cibles (PIX-4406).
- [#4125](https://github.com/1024pix/pix/pull/4125) [TECH] Augmente le nombre de passes de bcrypt de 5 à 10

### :bug: Correction
- [#4124](https://github.com/1024pix/pix/pull/4124) [BUGFIX] Corriger les messages d'erreur lors de l'accès à l'espace surveillant (PIX-4381).

### :coffee: Autre
- [#4103](https://github.com/1024pix/pix/pull/4103) [ADR] Ajout d'un ADR sur la suppression une propriété de type texte

## v3.174.0 (22/02/2022)


### :rocket: Enhancement
- [#4110](https://github.com/1024pix/pix/pull/4110) [FEATURE] Pouvoir visualiser la "Tarification part Pix" dans la liste des candidats (PIX-4194)

### :building_construction: Tech
- [#4111](https://github.com/1024pix/pix/pull/4111) [TECH] Ne pas limiter la liste des membres d'une orga à 500 lors de la création et modification d'une campagne (PIX-4303)

### :bug: Bug fix
- [#4123](https://github.com/1024pix/pix/pull/4123) [BUGFIX] Corrige la création du modèle Challenge lorsque le skill associé n'existe pas

## v3.173.0 (21/02/2022)


### :rocket: Enhancement
- [#4086](https://github.com/1024pix/pix/pull/4086) [FEATURE] Création d'un script de rattachement des catégories aux profils cibles (PIX-4357)
- [#4116](https://github.com/1024pix/pix/pull/4116) [FEATURE] Ajout de la traduction du message de présence non signalée en session de certification (PIX-3964)
- [#4109](https://github.com/1024pix/pix/pull/4109) [FEATURE] Importer les candidats de certification avec les informations de tarification (PIX-4325).
- [#4117](https://github.com/1024pix/pix/pull/4117) [FEATURE] Trier les certifications par le plus grand nombre de signalements impactant non résolus dans Pix Admin (PIX-4407).
- [#4118](https://github.com/1024pix/pix/pull/4118) [FEATURE] Changer le logo de la République française (PIX-4332).
- [#4107](https://github.com/1024pix/pix/pull/4107) [FEATURE] Ajout d'un minimum d'un critère rempli pour la création d'un RT (PIX-4393).
- [#4112](https://github.com/1024pix/pix/pull/4112) [FEATURE] Ajout du switch entre les onglets “Recommandés” et “Enregistrés” sur la page tutos V2 (PIX-4340).
- [#4094](https://github.com/1024pix/pix/pull/4094) [FEATURE] Création de prescrit via un script pour toutes les anciennes participations de campagne (PIX-4135).

### :building_construction: Tech
- [#4084](https://github.com/1024pix/pix/pull/4084) [TECH] Bump pix UI sur Certif (PIX-4355)
- [#4115](https://github.com/1024pix/pix/pull/4115) [TECH] Permettre à certif-success de passer son cléA (PIX-4413)

### :coffee: Various
- [#4040](https://github.com/1024pix/pix/pull/4040) [CLEANUP] Associe une épreuve a un seul acquis
- [#4113](https://github.com/1024pix/pix/pull/4113) [TRANSLATION] Change a translation on certification joiner (PIX-4409)

## v3.172.0 (18/02/2022)


### :rocket: Enhancement
- [#4090](https://github.com/1024pix/pix/pull/4090) [FEATURE] Permettre de déplacer une méthode de connexion GAR d'un user à un autre (PIX-4043)
- [#4050](https://github.com/1024pix/pix/pull/4050) [FEATURE] Rajouter le bouton "Effacer les filtres" sur la liste des campagnes (PIX-4070) 

## v3.171.0 (17/02/2022)


### :rocket: Enhancement
- [#4098](https://github.com/1024pix/pix/pull/4098) [FEATURE] Ouverture de la collecte de profils pour toutes les organisations (PIX-4360).
- [#4078](https://github.com/1024pix/pix/pull/4078) [FEATURE] Ajout pop-in de confirmation lorsqu'un surveillant quitte la surveillance d'une session (PIX-3801)
- [#4092](https://github.com/1024pix/pix/pull/4092) [FEATURE] MAJ du code d'accès à une session pour respecter les bonnes pratiques (PIX-4380)
- [#4106](https://github.com/1024pix/pix/pull/4106) [FEATURE] Possibilité de créer un RT avec un seuil d'une valeur de 0. (PIX-4392).
- [#4087](https://github.com/1024pix/pix/pull/4087) [FEATURE] Changer le nom des catégories pour les profils cibles (PIX-4365)
- [#4057](https://github.com/1024pix/pix/pull/4057) [FEATURE] Aider l'utilisateur lors de la saisie du code de pré-paiement (PIX-4329).

### :bug: Bug fix
- [#4096](https://github.com/1024pix/pix/pull/4096) [BUGFIX] Améliorer l'affichage des textes longs dans le kit surveillant (PIX-4388).
- [#4085](https://github.com/1024pix/pix/pull/4085) [BUGFIX] Cacher la colonne écran de fin de test dans la feuille d'émargement quand le centre de certification à accès à l'espace surveillant (PIX-4376).
- [#4095](https://github.com/1024pix/pix/pull/4095) [BUGFIX] Neutraliser les questions auxquelles les candidats n'ont pas pu répondre à cause d'une régression - v3 (PIX-4389).
- [#4089](https://github.com/1024pix/pix/pull/4089) [BUGFIX] Neutraliser les questions auxquelles les candidats n'ont pas pu répondre à cause d'une régression - v2 (PIX-4368). 

### :coffee: Various
- [#4102](https://github.com/1024pix/pix/pull/4102) [CLEANUP] Corrige le nom d'un fichier d'une ADR
- [#4100](https://github.com/1024pix/pix/pull/4100) [CLEANUP] Nettoyage du fichier scalingo.json

## v3.170.0 (15/02/2022)


### :rocket: Enhancement
- [#4061](https://github.com/1024pix/pix/pull/4061) [FEATURE] Suppression d'un RT non assigné dans Pix-Admin (PIX-4288).
- [#4062](https://github.com/1024pix/pix/pull/4062) [FEATURE] Nouveau design des cards de tutos (PIX-4299)
- [#4079](https://github.com/1024pix/pix/pull/4079) [FEATURE] Screen readers: prévenir des embed/texte alternatif (PIX-3917)
- [#4064](https://github.com/1024pix/pix/pull/4064) [FEATURE] Modifier le titre du fichier d'extraction de sujets sélectionnés (PIX-4170)

### :building_construction: Tech
- [#4077](https://github.com/1024pix/pix/pull/4077) [TECH] Ajout d'un script pour connaitre l'éligibilité CléA pour une session (PIX-4369)

## v3.169.0 (14/02/2022)


### :rocket: Enhancement
- [#4069](https://github.com/1024pix/pix/pull/4069) [FEATURE] Ne pas afficher les informations relatives aux cases de fin de test dans Pix Admin pour une session effectuée avec l'espace surveillant (PIX-4224).
- [#4070](https://github.com/1024pix/pix/pull/4070) [FEATURE] Créer un prescrit à la volée s'il n'y en a pas déjà un lors du démarrage d'une participation à une campagne (PIX-4116).

### :bug: Bug fix
- [#4081](https://github.com/1024pix/pix/pull/4081) [BUGFIX] Neutraliser les questions auxquelles les candidats n'ont pas pu répondre à cause d'une régression (PIX-4368).
- [#4083](https://github.com/1024pix/pix/pull/4083) [BUGFIX] Réparer le design de la page de connexion à l'espace surveillant lors de l'apparition d'un message d'erreur (PIX-4323).
- [#4076](https://github.com/1024pix/pix/pull/4076) [BUGFIX] : correction de la lecture des réponses du checkpoint (PIX-3918)
- [#4072](https://github.com/1024pix/pix/pull/4072) [BUGFIX] Permettre l'affichage sur deux lignes des libellés de sessions trop long dans le kit surveillant (PIX-4351)
- [#4059](https://github.com/1024pix/pix/pull/4059) [BUGFIX] Identifier les images décoratives de manière à les considérer en tant que tel (PIX-3905)

## v3.168.0 (11/02/2022)


### :rocket: Enhancement
- [#4068](https://github.com/1024pix/pix/pull/4068) [FEATURE] MAJ signalements page de finalisation : suppression C5  (PIX-4350)
- [#4063](https://github.com/1024pix/pix/pull/4063) [FEATURE] Afficher un loader lorsque on clique sur le bouton Créer une campagne (PIX-4304). 
- [#4066](https://github.com/1024pix/pix/pull/4066) [FEATURE] Mettre à jour la durée de conservation des documents sur la page de finalisation d'une session (PIX-4356)

### :bug: Bug fix
- [#4075](https://github.com/1024pix/pix/pull/4075) [BUGFIX] Sauvegarder l'identifiant externe du participant au démarrage de campagne (PIX-4366).

## v3.167.0 (10/02/2022)


### :rocket: Enhancement
- [#4071](https://github.com/1024pix/pix/pull/4071) [FEATURE] Mettre à jour le footer d'accessibilité de Pix Orga en "partiellement conforme" (PIX-4344).
- [#4043](https://github.com/1024pix/pix/pull/4043) [FEATURE] Empêcher les membres de PixOrga d'archiver ou de désarchiver une campagne s'ils n'en sont pas propriétaires (PIX-4318)

### :building_construction: Tech
- [#4073](https://github.com/1024pix/pix/pull/4073) [TECH] Permettre la gestion de la longueur max des réponses via variable d'env
- [#4044](https://github.com/1024pix/pix/pull/4044) [TECH] Amélioration des seeds pour la prescription (PIX-4327).

## v3.166.0 (10/02/2022)


### :rocket: Enhancement
- [#4049](https://github.com/1024pix/pix/pull/4049) [FEATURE] Afficher le propriétaire d'une campagne sur Pix Admin (PIX-4326).
- [#4055](https://github.com/1024pix/pix/pull/4055) [FEATURE] Affichage liste tutos (items V1) (PIX-4339)
- [#4051](https://github.com/1024pix/pix/pull/4051) [FEATURE] Permettre à l'équipe contenu d'utiliser la class sr-only dans les épreuves (PIX-4333).
- [#4039](https://github.com/1024pix/pix/pull/4039) [FEATURE] Ajouter la tarification de la part Pix dans le template des candidats (PIX-4324). 
- [#4041](https://github.com/1024pix/pix/pull/4041) [FEATURE] Afficher les cases de fin de test lors d'une finalisation de session qui n'a pas été effectuée avec l'espace surveillant (PIX-4223).
- [#4032](https://github.com/1024pix/pix/pull/4032) [FEATURE] Empêcher les membres de Pix Orga de modifier une campagne s'ils n'en sont pas propriétaires (PIX-4077)
- [#4045](https://github.com/1024pix/pix/pull/4045) [FEATURE] Permettre de désactiver pour tous la visualisation des acquis dans l'export CSV de campagnes via un script (PIX-4106).
- [#4026](https://github.com/1024pix/pix/pull/4026) [FEATURE] Ajouter le lien vers la politique de confidentialité sur la double mire inscription/connexion sur Pix Orga (PIX-4162)
- [#4038](https://github.com/1024pix/pix/pull/4038) [FEATURE] Ajouter un accordéon sur la sélection des sujets (PIX-4169)
- [#4042](https://github.com/1024pix/pix/pull/4042) [FEATURE] Ajoute les boutons de filtres sur le header des tutoriels v2 (PIX-4296)

### :building_construction: Tech
- [#4048](https://github.com/1024pix/pix/pull/4048) [TECH] Afficher les logs de test si besoin dans les IDE (PIX-4334)
- [#4056](https://github.com/1024pix/pix/pull/4056) [TECH] Génère le fichier cron.json conditionnellement au moment du build 
- [#4054](https://github.com/1024pix/pix/pull/4054) [TECH] Supprimer les étapes de checkout inutiles dans les GitHub actions. 
- [#3969](https://github.com/1024pix/pix/pull/3969) [TECH] Refacto du usecase start-campaign-participation (PIX-4157)

### :bug: Bug fix
- [#4047](https://github.com/1024pix/pix/pull/4047) [BUGFIX] sauvegarder une description à la création d'un profile cible (PIX-4285)
- [#4058](https://github.com/1024pix/pix/pull/4058) [BUGFIX] Afficher le niveau de conformité a11y dans le footer de mon-pix (PIX-4347)
- [#3992](https://github.com/1024pix/pix/pull/3992) [BUGFIX] Corriger la longueur des champs input quand les contenus sont trop longs (PIX-4261)

### :coffee: Various
- [#4060](https://github.com/1024pix/pix/pull/4060) [DOCS] Corrige un lien du CONTRIBUTING pour accéder au CHANGELOG

## v3.165.0 (08/02/2022)


### :rocket: Enhancement
- [#4017](https://github.com/1024pix/pix/pull/4017) [FEATURE] Enregistrer l'évolution du score FLASH en base (PIX-4306)
- [#4028](https://github.com/1024pix/pix/pull/4028) [FEATURE] Ajout du header pour la nouvelle page de tutoriels (PIX-4292).
- [#4008](https://github.com/1024pix/pix/pull/4008) [FEATURE] Ajouter une croix pour supprimer le contenu de l'input des profiles cibles (PIX-4165)
- [#4011](https://github.com/1024pix/pix/pull/4011) [FEATURE] Afficher un bouton de téléchargement du kit surveillant (PIX-4284).
- [#4029](https://github.com/1024pix/pix/pull/4029) [FEATURE] Pouvoir activer/désactiver l'accès à l'espace surveillant depuis Pix Admin (PIX-4305).

### :building_construction: Tech
- [#4010](https://github.com/1024pix/pix/pull/4010) [TECH] Utilise le cron scalingo pour raffraichir le référentiel tout les jours
- [#4021](https://github.com/1024pix/pix/pull/4021) [TECH] Permettre de tout logguer en local lors des tests si besoin.
- [#4023](https://github.com/1024pix/pix/pull/4023) [TECH] Suppression d'une fonctionnalité cachée : la dissociation depuis Pix Orga (PIX-4311).
- [#3949](https://github.com/1024pix/pix/pull/3949) [TECH] Prévenir les attaques par réponse utilisateur trop longue.
- [#3983](https://github.com/1024pix/pix/pull/3983) [TECH] Améliorer la cohérence des fichiers YAML.

### :bug: Bug fix
- [#4035](https://github.com/1024pix/pix/pull/4035) [BUGFIX] Corriger le problème de cochage/décochage de la présence d'un candidat dans l'espace surveillant (PIX-4317).
- [#3953](https://github.com/1024pix/pix/pull/3953) [BUGFIX] Correction de l’erreur 400 lors de l’envoi d'une chaîne de caractère vide dans le formulaire de modification d'une campagne (PIX-4127).

### :coffee: Various
- [#4037](https://github.com/1024pix/pix/pull/4037) [CLEANUP] Supprime des méthodes non utilisés dans Challenge

## v3.164.0 (03/02/2022)


### :rocket: Enhancement
- [#4009](https://github.com/1024pix/pix/pull/4009) [FEATURE] À la sortie de la campagne, afficher le nombre de Pix (PIX-3787)
- [#3987](https://github.com/1024pix/pix/pull/3987) [FEATURE] Créer la route de téléchargement du kit surveillant (PIX-4172)
- [#4006](https://github.com/1024pix/pix/pull/4006) [FEATURE] Centrer l'encart d'erreur et modifier le message de test (PIX-4291)

### :building_construction: Tech
- [#4015](https://github.com/1024pix/pix/pull/4015) [TECH] Mettre à jour le logger API pino vers 7.6.5.
- [#4016](https://github.com/1024pix/pix/pull/4016) [TECH] Suppression de la route dépréciée GET /assessments (PIX-4307).
- [#4018](https://github.com/1024pix/pix/pull/4018) [TECH] Remplace un paramétrage VSCode deprecated par le nouveau
- [#4020](https://github.com/1024pix/pix/pull/4020) [TECH] Ne pas afficher la liste des routes lors du démarrage de l'API.
- [#3982](https://github.com/1024pix/pix/pull/3982) [TECH] Permettre de linter avant chaque commit en local, si besoin.
- [#4000](https://github.com/1024pix/pix/pull/4000) [TECH] Ajout d'un script pour ajouter des membres à une organisation en env de développement (PIX-4275)
- [#3977](https://github.com/1024pix/pix/pull/3977) [TECH] Refactorings préalables à la certification FLASH
- [#4007](https://github.com/1024pix/pix/pull/4007) [TECH] Ajout d'un feature toggle pour l'affichage de la nouvelle page de tutoriels sur mon-pix (PIX-4287).

### :bug: Bug fix
- [#4027](https://github.com/1024pix/pix/pull/4027) [BUGFIX] Une devDepency est référencée sur les environnements hors développement.
- [#3995](https://github.com/1024pix/pix/pull/3995) [BUGFIX] Correction graphiques sur les selects et multi-selects de Pix Orga (PIX-4236)
- [#4012](https://github.com/1024pix/pix/pull/4012) [BUGFIX] Affiche le titre du parcours dans le détail d'une campagne (PIX-4256).
- [#3985](https://github.com/1024pix/pix/pull/3985) [BUGFIX] Correction de l'affichage du statut responsive d'un tube (PIX-4267)

## v3.163.0 (01/02/2022)


### :rocket: Enhancement
- [#3996](https://github.com/1024pix/pix/pull/3996) [FEATURE] Ajout du champ Propriétaire lors de la création d'une campagne (PIX-4073).
- [#3975](https://github.com/1024pix/pix/pull/3975) [FEATURE] Renommer les labels "Créée par" en "Propriétaire" sur Pix Orga (PIX-4148).
- [#3994](https://github.com/1024pix/pix/pull/3994) [FEATURE] Permettre de modifier le propriétaire à la modification d'une campagne sur Pix Orga (PIX-4072).
- [#3989](https://github.com/1024pix/pix/pull/3989) [FEATURE] Afficher une page d'erreur lorsque le surveillant n'a pas accès à la session (PIX-4264)
- [#3980](https://github.com/1024pix/pix/pull/3980) [FEATURE] Afficher le compte connecté et pouvoir en changer dans l'espace surveillant (PIX-3728)
- [#3963](https://github.com/1024pix/pix/pull/3963) [FEATURE] Afficher le niveau estimé sur l'écran de fin de campagne FLASH (PIX-3786)
- [#3958](https://github.com/1024pix/pix/pull/3958) [FEATURE] Edition du message d'un palier dans Pix-Admin (PIX-3959).

### :building_construction: Tech
- [#4002](https://github.com/1024pix/pix/pull/4002) [TECH] Activer l'espace surveillant sur une propriété BDD du centre de certification (PIX-4229).
- [#4003](https://github.com/1024pix/pix/pull/4003) [TECH] Toujours afficher les certifications incomplètes (PIX-4161).

### :coffee: Various
- [#4005](https://github.com/1024pix/pix/pull/4005) [DOC] Mise à jour des tags de titre de PR

## v3.162.0 (31/01/2022)


### :rocket: Enhancement
- [#3991](https://github.com/1024pix/pix/pull/3991) [FEATURE] Permettre d'activer la facturation des certifications via FT (PIX-4262).
- [#3984](https://github.com/1024pix/pix/pull/3984) [FEATURE] Envoyer une erreur quand un candidat tente de reprendre son test sans autorisation (PIX-3875)
- [#3981](https://github.com/1024pix/pix/pull/3981) [FEATURE] Eviter d'avoir plusieurs épreuves du même tube pour une compétence en certification (PIX-4178).
- [#3976](https://github.com/1024pix/pix/pull/3976) [FEATURE] Retire la case de fin de test sur les fiches d'émargement (pix-3746)

### :building_construction: Tech
- [#4001](https://github.com/1024pix/pix/pull/4001) [TECH] Corriger la connexion avec une auto completion du formulaire de connexion (PIX-4283)
- [#3998](https://github.com/1024pix/pix/pull/3998) [TECH] Corriger le flaky test sur Pix Certif

### :coffee: Various
- [#3988](https://github.com/1024pix/pix/pull/3988) [STYLE] Suppression de l'icone de tuto dans la fenêtre de comparaison de résultats (PIX-4266).
- [#3993](https://github.com/1024pix/pix/pull/3993) [A11Y] Utiliser la même couleur pour le status des participations dans le tableau que celle utilisé sur le graphique des status dans Pix Orga (PIX-4205)

## v3.161.0 (28/01/2022)


### :rocket: Enhancement
- [#3986](https://github.com/1024pix/pix/pull/3986) [FEATURE] Afficher le nombre de sujets sélectionnés dans le bouton de téléchargement (PIX-4167)
- [#3974](https://github.com/1024pix/pix/pull/3974) [FEATURE] Ignorer les écrans de FDT non renseignés dans les critères des sessions "à traiter" (PIX-4171)

### :building_construction: Tech
- [#3965](https://github.com/1024pix/pix/pull/3965) [TECH] Nettoyage de la duplication de `campaignId` et `campaign` dans `campaign-participations`.
- [#3979](https://github.com/1024pix/pix/pull/3979) [TECH] Mettre à jour Pix-UI sur Pix Orga

### :bug: Bug fix
- [#3978](https://github.com/1024pix/pix/pull/3978) [BUGFIX] Empêcher l'envoi des résultats de campagne ET dans le même temps de retenter (Pix-4238).

## v3.160.0 (26/01/2022)


### :rocket: Enhancement
- [#3962](https://github.com/1024pix/pix/pull/3962) [FEATURE] Récupérer la liste des membres d'une organisation dans la création et la modification d'une campagne sur Pix Orga (PIX-4147).
- [#3972](https://github.com/1024pix/pix/pull/3972) [FEATURE] Ajouter l'information responsive sur les sujets de la page de sélection de sujets (PIX-4083)
- [#3921](https://github.com/1024pix/pix/pull/3921) [FEATURE] Ajout des onglets de 'Mes campagnes' et 'Toutes les campagnes' sur Pix Orga (PIX-4087)

### :building_construction: Tech
- [#3944](https://github.com/1024pix/pix/pull/3944) [TECH] Empêcher l'accès aux routes API de l'espace surveillant pour un utilisateur non autorisé (PIX-3731)

### :bug: Bug fix
- [#3973](https://github.com/1024pix/pix/pull/3973) [BUGFIX] Empêcher le téléchargement quand le bouton est désactivé sur la page de sélection de sujets.

### :coffee: Various
- [#3956](https://github.com/1024pix/pix/pull/3956) [A11Y] Suppression d'une partie du texte des aria-label dans les QROC (PIX-4174).

## v3.159.0 (25/01/2022)


### :rocket: Enhancement
- [#3928](https://github.com/1024pix/pix/pull/3928) [FEATURE] Mettre à jour les libellés et macarons des badges Pix+ Édu (PIX-4117).
- [#3954](https://github.com/1024pix/pix/pull/3954) [FEATURE] Améliorer l'affichage des colonnes des tableaux sur Pix Orga (PIX-4149).
- [#3968](https://github.com/1024pix/pix/pull/3968) [FEATURE] Déplacer le bouton "Télécharger la sélection des sujets" à droite (PIX-4168).
- [#3955](https://github.com/1024pix/pix/pull/3955) [FEATURE] Afficher les acquis dans les export CSV en fonction du flag showSkills (PIX-4105)
- [#3952](https://github.com/1024pix/pix/pull/3952) [FEATURE]  Créer des codes INSEE génériques pour Paris, Lyon et Marseille (PIX-4159)

### :bug: Bug fix
- [#3957](https://github.com/1024pix/pix/pull/3957) [BUGFIX] Ne pas afficher les résultats/attestations des élèves désactivés dans Pix Orga (PIX-4176)

## v3.158.1 (20/01/2022)


### :bug: Bug fix
- [#3966](https://github.com/1024pix/pix/pull/3966) [BUGFIX] Afficher qu'une seule fois un même tag dans le formulaire de création de campagne (PIX-4187)

## v3.158.0 (20/01/2022)


### :rocket: Enhancement
- [#3961](https://github.com/1024pix/pix/pull/3961) [FEATURE] Script pour corriger les infos persos des d'étudiants d'une université  (PIX-4160)
- [#3964](https://github.com/1024pix/pix/pull/3964) [FEATURE] Réduire la durée de l'access token (PIX-4166).
- [#3950](https://github.com/1024pix/pix/pull/3950) [FEATURE] Rafraîchir l'affichage de l'espace surveillant périodiquement (PIX-3660).
- [#3930](https://github.com/1024pix/pix/pull/3930) [FEATURE] Permettre de filtrer les profils cibles avec les tags Catégories (PIX-3764).

### :building_construction: Tech
- [#3959](https://github.com/1024pix/pix/pull/3959) [TECH] Prévenir les tests Qunit exclusifs (.only). 
- [#3960](https://github.com/1024pix/pix/pull/3960) [TECH] Détecter et interdire les eslint-disable inutiles

## v3.157.0 (19/01/2022)


### :rocket: Enhancement
- [#3951](https://github.com/1024pix/pix/pull/3951) [FEATURE] Suppression de la barre de progression dans les campagnes FLASH (PIX-3934).
- [#3939](https://github.com/1024pix/pix/pull/3939) [FEATURE] Améliorer la gestion de l'affichage du message spécifique aux badges Pix+ Édu dans le certificat pdf (PIX-4139).
- [#3948](https://github.com/1024pix/pix/pull/3948) [FEATURE] Afficher le statut des certifications Pix+ Édu dans la page de détail d'une certification dans Pix Admin (PIX-3993).
- [#3942](https://github.com/1024pix/pix/pull/3942) [FEATURE] Afficher le nom du propriétaire dans la page de détail d'une campagne sur Pix Orga (PIX-4074).
- [#3865](https://github.com/1024pix/pix/pull/3865) [FEATURE] Ajouter le refresh token (PIX-4017).

## v3.156.0 (17/01/2022)


### :rocket: Enhancement
- [#3945](https://github.com/1024pix/pix/pull/3945) [FEATURE] Supprimer la case de fin de test pour les sessions dont le centre est autorisé (PIX-4141)
- [#3933](https://github.com/1024pix/pix/pull/3933) [FEATURE] Pouvoir éditer le flag "Affichage acquis dans l'export résultats" d'une orga dans Pix Admin (PIX-4103).
- [#3943](https://github.com/1024pix/pix/pull/3943) [FEATURE] Ajout de champs éditables supplémentaires sur les RT dans Pix-Admin (PIX-4129).
- [#3947](https://github.com/1024pix/pix/pull/3947) [FEATURE] Permettre l'ajout de l'url de documentation dans le script de création d'organisations PRO (PIX-4118).
- [#3932](https://github.com/1024pix/pix/pull/3932) [FEATURE] Enregistre le prescrit dans la participation lors de la création de la participation (PIX-4114)

### :coffee: Various
- [#3934](https://github.com/1024pix/pix/pull/3934) [CLEANUP] Mise à jour des états possible "validé" des épreuves (PIX-4126)

## v3.155.0 (17/01/2022)


### :rocket: Enhancement
- [#3937](https://github.com/1024pix/pix/pull/3937) [FEATURE] Changement de la consigne des QCM (PIX-4131).
- [#3931](https://github.com/1024pix/pix/pull/3931) [FEATURE] Afficher la colonne "Écran de fin de test vu" sur la page de finalisation de session si le centre de certification n'utilise pas le portail surveillant (PIX-3748)
- [#3875](https://github.com/1024pix/pix/pull/3875) [FEATURE] Ne donner accès à l'espace surveillant qu'à certains centres de certification (PIX-3770).
- [#3925](https://github.com/1024pix/pix/pull/3925) [FEATURE][A11Y] Amélioration de l'accessibilité de la navigation sur Pix Orga (PIX-3892).

### :building_construction: Tech
- [#3946](https://github.com/1024pix/pix/pull/3946) [TECH] Mise à jour des channels de notification Slack 
- [#3922](https://github.com/1024pix/pix/pull/3922) [TECH] Création d'une brique Accès V2 au flux de campagne et annihilation du start-or-resume (Pix-4054).
- [#3935](https://github.com/1024pix/pix/pull/3935) [TECH] Formater le code de pix-certif avec Prettier.
- [#3940](https://github.com/1024pix/pix/pull/3940) [TECH] Suppression d'une méthode non utilisée

## v3.154.0 (13/01/2022)


### :rocket: Enhancement
- [#3909](https://github.com/1024pix/pix/pull/3909) [FEATURE][A11Y] Indiquer que la saisie des champs est obligatoire sur Pix Orga (PIX-3891).
- [#3936](https://github.com/1024pix/pix/pull/3936) [FEATURE] Autorise l'utilisation d'un wildcard dans les URLs autorisées a avoir un embed (PIX-4132)
- [#3898](https://github.com/1024pix/pix/pull/3898) [FEATURE] Mise à jour des RT dans Pix-Admin (PIX-3960).
- [#3915](https://github.com/1024pix/pix/pull/3915) [FEATURE] Afficher le message de certification terminée par le surveillant sur la page de fin de test (PIX-4110)
- [#3920](https://github.com/1024pix/pix/pull/3920) [FEATURE] Afficher les certifications Pix+ Édu dans le tableau listant les certifications dans Pix Admin (PIX-3992).
- [#3929](https://github.com/1024pix/pix/pull/3929) [FEATURE] Ajouter les traductions manquantes à la nouvelle page de fin de test (PIX-4121)

### :building_construction: Tech
- [#3938](https://github.com/1024pix/pix/pull/3938) [TECH] Retour du thème par défaut pour le template de pull request.
- [#3923](https://github.com/1024pix/pix/pull/3923) [TECH] Suppression de paramètres inutilisés
- [#3904](https://github.com/1024pix/pix/pull/3904) [TECH] Campagne FLASH1234 sans profile cible (PIX-3823)

### :bug: Bug fix
- [#3927](https://github.com/1024pix/pix/pull/3927) [BUGFIX] Affiche le message d'erreur lorsqu'une campagne n'a pas de profil cible (PIX-4091).

### :coffee: Various
- [#3919](https://github.com/1024pix/pix/pull/3919) [A11Y] Ajouter un role "columnheader" a tous les tableaux dans Pix Orga (Pix-4115)

## v3.153.0 (11/01/2022)


### :rocket: Enhancement
- [#3885](https://github.com/1024pix/pix/pull/3885) [FEATURE] Ajout des Thématiques, Compétences et Domaines dans la sélection des sujets (PIX-3948)
- [#3917](https://github.com/1024pix/pix/pull/3917) [FEATURE]  Afficher le flag permettant d'afficher ou non les acquis dans l'export de résultats d'une campagne (Pix 4104). 
- [#3914](https://github.com/1024pix/pix/pull/3914) [FEATURE] Afficher les résultats de la certification Pix+ Edu dans le csv des résultats (PIX-4080).

### :building_construction: Tech
- [#3912](https://github.com/1024pix/pix/pull/3912) [TECH] Algo flash : Réutiliser le niveau estimé enregistré pour trouver le prochain challenge

### :bug: Bug fix
- [#3926](https://github.com/1024pix/pix/pull/3926) [BUGFIX] Ne pas valider les mime types sur les imports de fichiers SIECLE (PIX-4111)

### :coffee: Various
- [#3911](https://github.com/1024pix/pix/pull/3911)  [TECH] Supprimer la gestion de la documentation en fonction des tags dans PixOrga (PIX-3976).
- [#3916](https://github.com/1024pix/pix/pull/3916) [DOC] Expliciter la structure d'un ADR.

## v3.152.0 (07/01/2022)


### :rocket: Enhancement
- [#3888](https://github.com/1024pix/pix/pull/3888) [FEATURE] Modifier la page de fin de test de certification (PIX-4069)
- [#3836](https://github.com/1024pix/pix/pull/3836) [FEATURE] Vérifier que les acquis sont valides lors de la création d'un badge (PIX-4023)

### :building_construction: Tech
- [#3901](https://github.com/1024pix/pix/pull/3901) [TECH] Factoriser la création des images de badge
- [#3907](https://github.com/1024pix/pix/pull/3907) [TECH] Assurer que l'utilisateur créateur de la campagne est bien renseigné.
- [#3902](https://github.com/1024pix/pix/pull/3902) [TECH] Disposer du résultat des tests de charge dans Datadog.
- [#3848](https://github.com/1024pix/pix/pull/3848) [TECH] Générer des tests conformes aux conventions avec le CLI Ember.

### :bug: Bug fix
- [#3918](https://github.com/1024pix/pix/pull/3918) [BUGFIX] Accepter les fichiers SIECLE csv avec le mime type `text/plain` (PIX-4111)
- [#3897](https://github.com/1024pix/pix/pull/3897) [BUGFIX] Corriger les repositories effectuant des opérations hors transaction à tort

### :coffee: Various
- [#3913](https://github.com/1024pix/pix/pull/3913) [A11Y] Changer la couleur du graphique ayant un contraste insuffisant pour l'accessibilité (PIX-4052)

## v3.151.0 (06/01/2022)


### :rocket: Enhancement
- [#3867](https://github.com/1024pix/pix/pull/3867) [FEATURE] Algo flash : Enregistrer le niveau estimé et le taux d'erreur (PIX-4039)
- [#3906](https://github.com/1024pix/pix/pull/3906) [FEATURE] Supprime le feature toggle du Net Promoter Score (PIX-4096)
- [#3910](https://github.com/1024pix/pix/pull/3910) [FEATURE] Enlever le dégradé du menu dans pix Orga (PIX-4053).
- [#3903](https://github.com/1024pix/pix/pull/3903) [FEATURE] Ajout de l'url de documentation lors de la création d'une orga (Pix-3975).
- [#3900](https://github.com/1024pix/pix/pull/3900) [FEATURE] Permettre de choisir un catégorie pour un profile cible lors de sa création (PIX-3872).

### :bug: Bug fix
- [#3905](https://github.com/1024pix/pix/pull/3905) [BUGFIX] Corriger le test flaky sur l'api remontant les données de resultat d'une campagne (PIX-4102)

### :coffee: Various
- [#3892](https://github.com/1024pix/pix/pull/3892) [A11Y] Ajouter des formes dans les repartitions du graphique camembert sur la page Activité de Pix Orga (PIX-3893)
- [#3881](https://github.com/1024pix/pix/pull/3881) [A11Y] Ajout d'instructions pour les QCU et QCM (PIX-3916).
- [#3226](https://github.com/1024pix/pix/pull/3226) [DOC] Choisir une nouvelle librairie de gestion du temps.

## v3.150.0 (05/01/2022)


### :rocket: Enhancement
- [#3895](https://github.com/1024pix/pix/pull/3895) [FEATURE] Ajouter la date de validation des cgu lors de la création de compte pix  (PIX-1763)
- [#3880](https://github.com/1024pix/pix/pull/3880) [FEATURE] Permettre d'ajouter une méthode de connexion avec adresse e-mail à un utilisateur sur Pix Admin (PIX-3775).

### :building_construction: Tech
- [#3893](https://github.com/1024pix/pix/pull/3893) [TECH] Faire échouer la CI sur le set recommended de eslint-mocha sur l'API.

### :bug: Bug fix
- [#3899](https://github.com/1024pix/pix/pull/3899) [BUGFIX] [A11Y] Ajouter un titre au champ de filtrage sur la page d'ajout d'élèves à une session de certification (PIX-3906)

## v3.149.0 (04/01/2022)


### :rocket: Enhancement
- [#3896](https://github.com/1024pix/pix/pull/3896) [FEATURE] Supprime le commentaire spécifique aux organisations SCO (PIX-3871)
- [#3879](https://github.com/1024pix/pix/pull/3879) [FEATURE] Afficher l'éligibilité d'un candidat aux certifications Pix+ Édu (PIX-3995).
- [#3872](https://github.com/1024pix/pix/pull/3872) [FEATURE]  Afficher le macaron Pix+ Édu sur le certificat partagé (PIX-4066).
- [#3890](https://github.com/1024pix/pix/pull/3890) [FEATURE] Afficher le nom et prénom du propriétaire d'une campagne dans la liste de campagnes (PIX-3984)

### :building_construction: Tech
- [#3861](https://github.com/1024pix/pix/pull/3861) [TECH] Eviter les faux négatifs dus aux séquences de seeds (PIX-4065).

### :bug: Bug fix
- [#3874](https://github.com/1024pix/pix/pull/3874) [BUGFIX] Bug d'affichage de l'onglet "Détails" et "Neutralisation" (PIX-4078)
- [#3780](https://github.com/1024pix/pix/pull/3780) [BUGFIX] Interdire l'import des fichiers SIECLE avec un mime-type non autorisé.
- [#3891](https://github.com/1024pix/pix/pull/3891) [BUGFIX] Retourner sur la page paramètres après avoir créé une campagne (Pix-4089).

### :coffee: Various
- [#3889](https://github.com/1024pix/pix/pull/3889) [A11Y] Rendre la navigation au niveau de la campagne accessible lors d'une zoom 200% en mode texte sur Firefox (PIX-3895)

## v3.148.0 (30/12/2021)


### :rocket: Enhancement
- [#3886](https://github.com/1024pix/pix/pull/3886) [FEATURE] Ajouter la possibilité de modifier la catégorie d'un profile cible dans Pix Admin(PIX-3759)
- [#3858](https://github.com/1024pix/pix/pull/3858) [FEATURE]  Créer un 'propriétaire' pour une campagne (PIX-3982)

### :coffee: Various
- [#3887](https://github.com/1024pix/pix/pull/3887) [TECH Ajouter la règle de lint  mocha/no-exclusive-tests (PIX-4085).

## v3.147.0 (29/12/2021)


### :rocket: Enhancement
- [#3884](https://github.com/1024pix/pix/pull/3884) [FEATURE] Créer un script pour migrer les URL de documentations (PIX-3974).
- [#3882](https://github.com/1024pix/pix/pull/3882) [FEATURE] Changer les dates d'ouverture des certifications dans la bannière d'informations pour les SCO (PIX-4081)
- [#3873](https://github.com/1024pix/pix/pull/3873) [FEATURE] Ajouter la catégorie d'un profil cible dans PixAdmin (PIX-3756).

### :coffee: Various
- [#3877](https://github.com/1024pix/pix/pull/3877) [ORGA] Rendre non lisible les liens des tutoriels via lecteur d'écran lorsque le menu déroulant n'est pas afficher (PIX-3897)

## v3.146.0 (27/12/2021)


### :rocket: Enhancement
- [#3856](https://github.com/1024pix/pix/pull/3856) [FEATURE] Téléchargement des sujets sélectionnés dans la page sur Pix Orga (PIX-3954)
- [#3869](https://github.com/1024pix/pix/pull/3869) [FEATURE] Afficher le badge Pix+ Édu dans l'attestation PDF pour un candidat ayant obtenu sa certification (PIX-3998).
- [#3847](https://github.com/1024pix/pix/pull/3847) [FEATURE] Permettre de scorer une certification Pix+ Édu (PIX-3991).
- [#3870](https://github.com/1024pix/pix/pull/3870) [FEATURE] Ajout de la description du profile cible lors de la création de celui ci (PIX-4032)
- [#3868](https://github.com/1024pix/pix/pull/3868) [FEATURE] Supprimer l'icone du type de résultat lors de l'affichage des informations sur le profile cible(PIX-4068).

### :building_construction: Tech
- [#3871](https://github.com/1024pix/pix/pull/3871) [TECH] Étendre la conf eslint des migrations de DB à partir de celle de l'API

### :bug: Bug fix
- [#3878](https://github.com/1024pix/pix/pull/3878) [BUGFIX] Passer le certificationCourseId au lieu de l'assessmentId pour la page de fin de test (PIX-4075)
- [#3828](https://github.com/1024pix/pix/pull/3828) [BUGFIX] Ne plus avoir de bug quand l'utilisateur a deux competence-eval(PIX-3944).

### :coffee: Various
- [#3876](https://github.com/1024pix/pix/pull/3876) [ORGA] Changer le texte de selectionner de la pagination afin qu'il soit plus explicite (PIX-3898)

## v3.145.0 (23/12/2021)


### :rocket: Enhancement
- [#3864](https://github.com/1024pix/pix/pull/3864) [FEATURE] Afficher le macaron Pix+ Édu dans le certificat pour un candidat ayant validé sa certification Pix+ Édu (PIX-3996).
- [#3854](https://github.com/1024pix/pix/pull/3854) [FEATURE] Ameliorer le rendu des certifications complementaires (PIX-3867)
- [#3855](https://github.com/1024pix/pix/pull/3855) [FEATURE] Bloquer le passage du test pour le candidat dont le test a été terminé par le Surveillant (PIX-4047)

### :building_construction: Tech
- [#3833](https://github.com/1024pix/pix/pull/3833) [TECH] Refacto du test du usecase retrieve-last-or-create-certification-course (PIX-4031)

### :bug: Bug fix
- [#3866](https://github.com/1024pix/pix/pull/3866) [BUGFIX] Modifier le endpoint pour terminer un test de certification depuis l'espace surveillant (PIX-4062)

## v3.144.0 (22/12/2021)


### :rocket: Enhancement
- [#3840](https://github.com/1024pix/pix/pull/3840) [FEATURE] Déplacer les filtres de la page de campagne sur Pix Orga (PIX-3983).
- [#3853](https://github.com/1024pix/pix/pull/3853) [FEATURE] Algo Flash : Calculer le taux d'erreur (PIX-3789)
- [#3862](https://github.com/1024pix/pix/pull/3862) [FEATURE] Remettre la poubelle du bouton "Effacer les filtres" (PIX-4051).
- [#3851](https://github.com/1024pix/pix/pull/3851) [FEATURE] Renommer les libellés des badges Pix+ Édu afin de correspondre aux noms définitifs (PIX-4057).

### :building_construction: Tech
- [#3860](https://github.com/1024pix/pix/pull/3860) [TECH] Utiliser un ID de compétence spécifique au profil utilisateur dans les tests de charge.

### :coffee: Various
- [#3863](https://github.com/1024pix/pix/pull/3863) [FEAT] Changement d'url pour le listing des bagdes (PIX-3790).

## v3.143.0 (21/12/2021)


### :rocket: Enhancement
- [#3857](https://github.com/1024pix/pix/pull/3857) [FEATURE] Afficher le NPS après l'envoi des résultats d'une campagne (PIX-4061).
- [#3824](https://github.com/1024pix/pix/pull/3824) [FEATURE] Terminer un test de certification depuis le portail surveillant partie 1(Pix-4055)
- [#3849](https://github.com/1024pix/pix/pull/3849) [FEATURE] Permettre d'ajouter un tag sur Pix Admin (PIX-4044)
- [#3837](https://github.com/1024pix/pix/pull/3837) [FEATURE] Afficher dans l'espace surveillant quand un candidat a terminé son test (PIX-3659)
- [#3835](https://github.com/1024pix/pix/pull/3835) [FEATURE]Ajout d'un lien vers la politique de confidentialité de pix sur la page d'inscription Pole Emploi(PIX-4028)

### :building_construction: Tech
- [#3850](https://github.com/1024pix/pix/pull/3850) [TECH] Reporter le hotfix dans le CHANGELOG

### :bug: Bug fix
- [#3852](https://github.com/1024pix/pix/pull/3852) [BUGFIX] Corriger l'espace entre un bouton radio  & le label pour choisir le type de fichier à télécharger (PIX-4034)

## v3.142.0 (20/12/2021)

### :rocket: Enhancement
- [#3842](https://github.com/1024pix/pix/pull/3842) [FEATURE] Permettre de rechercher dans la liste des profils cibles lors de la création d'une campagne (Pix-3762).
- [#3838](https://github.com/1024pix/pix/pull/3838) [FEATURE] Dissocier un étudiant dans Pix Admin (PIX-4033).
- [#3831](https://github.com/1024pix/pix/pull/3831) [FEATURE] Modifier l'url de documentation dans le détail d'une orga sur pix admin (Pix-3973).
- [#3834](https://github.com/1024pix/pix/pull/3834) [FEATURE] Ajouter les épreuves Pix+ Édu lors du choix des épreuves d'une certification pour un utilisateur ayant obtenu un badge (PIX-3990).
- [#3821](https://github.com/1024pix/pix/pull/3821) [FEATURE] Afficher dans Pix App les certification complémentaires que va passer un candidat (PIX-3688).
- [#3773](https://github.com/1024pix/pix/pull/3773) [FEATURE] Afficher une description du profil cible dans la page paramètres d'une campagne d'évaluation (PIX-3765).
- [#3832](https://github.com/1024pix/pix/pull/3832) [FEATURE] Ajout d'une colonne formNPSUrl pour un lien dynamique dans Pix App (PIX-4019).

### :building_construction: Tech
- [#3846](https://github.com/1024pix/pix/pull/3846) [TECH] Utilisation des paramètres longs des commandes `artillery`
- [#3843](https://github.com/1024pix/pix/pull/3843) [TECH] Corriger l'URL cible de l'API dans la documentation des tests de charge.
- [#3827](https://github.com/1024pix/pix/pull/3827)[TECH] Uniformiser les pictos des réponses entre page checkpoint et pop-in réponse (PIX-450).

### :bug: Bug fix
- [#3845](https://github.com/1024pix/pix/pull/3845) [BUGFIX] Retourner sur la liste des campagnes lorsque l'on clique sur annuler lors de la création d'une campagne (PIX-4045)



## v3.141.1 (17/12/2021)


### :building_construction: Tech
- [#3844](https://github.com/1024pix/pix/pull/3844) Revert de "[TECH] Création d'une brique Accès au flux de campagne et annihilation du `start-or-resume` (PIX-3185)."

## v3.141.0 (16/12/2021)


### :rocket: Enhancement
- [#3826](https://github.com/1024pix/pix/pull/3826) [FEATURE] Ajout d'un script pour supprimer les méthodes de connexion des utilisateurs anonymisés (PIX-3459).
- [#3814](https://github.com/1024pix/pix/pull/3814) [FEATURE] Afficher la liste des membres sur Pix Certif (PIX-418).
- [#3830](https://github.com/1024pix/pix/pull/3830) [FEATURE] Afficher le mot de passe surveillant sur la page de session de Pix Certif (PIX-3730)
- [#3829](https://github.com/1024pix/pix/pull/3829) [FEATURE] Ajout de la case à cocher de sélection de sujets (PIX-3953)

### :building_construction: Tech
- [#3794](https://github.com/1024pix/pix/pull/3794) [TECH] Création d'une brique Accès au flux de campagne et annihilation du `start-or-resume` (PIX-3185).

## v3.140.0 (14/12/2021)


### :rocket: Enhancement
- [#3822](https://github.com/1024pix/pix/pull/3822) [FEATURE] Permettre aux utilisateurs ayant un rôle "membre" sur Pix Orga d'accéder à la liste des membres de l'organisation (PIX-531).
- [#3800](https://github.com/1024pix/pix/pull/3800) [FEATURE] Baser le scoring sur les participations des certifications complémentaires (PIX-3941).
- [#3801](https://github.com/1024pix/pix/pull/3801) [FEATURE] Afficher les sujets sur la page de selection des profils cibles dans Pix Orga (PIX-3949).
- [#3782](https://github.com/1024pix/pix/pull/3782) [FEATURE] Améliorer la sélection de profil cible lors de la création d'une campagne d'évaluation (PIX-3761).

### :coffee: Various
- [#3815](https://github.com/1024pix/pix/pull/3815) [DOCUMENTATION] Prévenir les erreurs de linter sous Windows.

## v3.139.0 (13/12/2021)


### :rocket: Enhancement
- [#3825](https://github.com/1024pix/pix/pull/3825) [FEATURE] Design du block Net Promoter Score sur la page de fin de campagne (PIX-4007)
- [#3820](https://github.com/1024pix/pix/pull/3820) [FEATURE] Afficher le bloc NPS seulement pour certaines organisations (PIX-3968)

### :bug: Bug fix
- [#3819](https://github.com/1024pix/pix/pull/3819) [BUGFIX] Les tests du pre-handler checkUserHasRolePixMaster sont fragiles.
- [#3823](https://github.com/1024pix/pix/pull/3823) [BUGFIX] Permettre la récupération de compte avec un INE en minuscule (PIX-3997).

## v3.138.0 (10/12/2021)


### :rocket: Enhancement
- [#3812](https://github.com/1024pix/pix/pull/3812) [FEATURE] Permettre à un surveillant d'autoriser un·e candidat·e à reprendre son test - back (PIX-3966)
- [#3806](https://github.com/1024pix/pix/pull/3806) [FEATURE]: Ajout d'un feature toggle pour le Net Promoter Score dans Pix App (PIX-3969 PIX-3967)
- [#3761](https://github.com/1024pix/pix/pull/3761) [FEATURE] Badge: Ajouter un critère sur un ensemble d'acquis (frontend)
- [#3805](https://github.com/1024pix/pix/pull/3805) [FEATURE] Améliorer l'accessibilité des tableaux sur la page de finalisation de session (PIX-3903)

### :building_construction: Tech
- [#3816](https://github.com/1024pix/pix/pull/3816) [TECH]  Supprimer les occurences d'accreditations de certification (PIX-3743)
- [#3818](https://github.com/1024pix/pix/pull/3818) [TECH] Utiliser ember-testing-library dans les tests de Pix Orga (PIX-4002).

### :bug: Bug fix
- [#3811](https://github.com/1024pix/pix/pull/3811) [BUGFIX] Forcer la taille maximale du formulaire de connexion de Pix Certif (PIX-3986).
- [#3809](https://github.com/1024pix/pix/pull/3809) [BUGFIX] Liens vers le support Pix (PIX-3981)

## v3.137.0 (08/12/2021)


### :rocket: Enhancement
- [#3810](https://github.com/1024pix/pix/pull/3810) [FEATURE] Afficher l'url de la documentation d'une organisation quand elle en a une (PIX-3972).
- [#3799](https://github.com/1024pix/pix/pull/3799) [FEATURE]  Ajouter un commentaire interne lors de la création d'un profil cible sur pix Admin(PIX-3873)
- [#3798](https://github.com/1024pix/pix/pull/3798) [FEATURE] Ajouter une explication pour chaque type de campagne (PIX-3870)
- [#3807](https://github.com/1024pix/pix/pull/3807) [FEATURE] Ajout d'une URL de documentation dans les détails d'une organisation (PIX-3971).
- [#3792](https://github.com/1024pix/pix/pull/3792) [FEATURE] Bloquer les certif complementaires si le candidat n'est pas inscrit (PIX-3684)
- [#3795](https://github.com/1024pix/pix/pull/3795) [FEATURE] Notifier que le rôle du membre à été modifié à l'utilisateur sur Pix Orga (PIX-3951).

### :building_construction: Tech
- [#3722](https://github.com/1024pix/pix/pull/3722) [TECH][CLEAN] Corriger plusieurs tests contenant la règle mocha/no-setup-in-describe (PIX-3827).
- [#3802](https://github.com/1024pix/pix/pull/3802) [TECH] Prévenir les usages involontaires de console dans pix-certif.

### :bug: Bug fix
- [#3808](https://github.com/1024pix/pix/pull/3808) [BUGFIX] Utiliser un `alt` vide par défaut pour les illustrations d'épreuves (PIX-3987)
- [#3796](https://github.com/1024pix/pix/pull/3796) [BUGFIX] Remettre la bonne image pour les focus dans le didacticiel (PIX-3904).

## v3.136.0 (03/12/2021)


### :rocket: Enhancement
- [#3785](https://github.com/1024pix/pix/pull/3785) [FEATURE] Permettre à un candidat de reprendre son test - Front (PIX-3962)
- [#3797](https://github.com/1024pix/pix/pull/3797) [FEATURE] Permettre aux utilisateurs Pix Admin de couper l'accès d'un utilisateur à Pix Certif (PIX-3563).

## v3.135.0 (03/12/2021)


### :rocket: Enhancement
- [#3793](https://github.com/1024pix/pix/pull/3793) [FEATURE] Enregistrer la date de validation des CGUs dans Pix Certif (PIX-3717).
- [#3791](https://github.com/1024pix/pix/pull/3791) [FEATURE] Ajout d'une page de sélection des sujets dans pix-orga (PIX-3734).
- [#3789](https://github.com/1024pix/pix/pull/3789) [FEATURE] Inscrire des candidats en certification complémentaire depuis l'import ODS (PIX-3876).
- [#3790](https://github.com/1024pix/pix/pull/3790) [FEATURE] Mettre à jour le message d'erreur de session non-accessible (PIX-3902)
- [#3788](https://github.com/1024pix/pix/pull/3788) [FEATURE] Enregistrer la date de validation des CGUs dans Pix Orga (PIX-3718).

### :bug: Bug fix
- [#3786](https://github.com/1024pix/pix/pull/3786) [BUGFIX] Corriger l'affichage de la page de login à Pix Certif (PIX-3952).

## v3.134.0 (01/12/2021)


### :rocket: Enhancement
- [#3784](https://github.com/1024pix/pix/pull/3784) [FEATURE] Ne pas permettre à un utilisateur de se connecter à PixCertif si ses accès ont été désactivés (PIX-3562).
- [#3775](https://github.com/1024pix/pix/pull/3775) [FEATURE] Sauvegarder le démarrage des certifications complémentaires(PIX-3689)

### :building_construction: Tech
- [#3770](https://github.com/1024pix/pix/pull/3770) [TECH] Empêcher la suppression de BDD sur Scalingo

### :coffee: Various
- [#3772](https://github.com/1024pix/pix/pull/3772) [A11Y] Amélioration du chronomètre sur l'écran de présentation (PIX-3922).
- [#3778](https://github.com/1024pix/pix/pull/3778) [A11Y] Suppression de phrases pour lecteurs d'écrans entravant l'UX (PIX-3914).

## v3.133.0 (30/11/2021)


### :rocket: Enhancement
- [#3779](https://github.com/1024pix/pix/pull/3779) [FEATURE] Permettre d'anonymiser un utilisateur peu importe sa méthode de connexion sur Pix Admin (PIX-3773).
- [#3767](https://github.com/1024pix/pix/pull/3767) [FEATURE] Ajuster la taille des colonnes d'IDs sur Pix Admin (PIX-3603).
- [#3771](https://github.com/1024pix/pix/pull/3771) [FEATURE] Rattacher un membre au centre de certification correspondant lorsqu'il accepte l'invitation à rejoindre une organisation (PIX-3852).

### :building_construction: Tech
- [#3787](https://github.com/1024pix/pix/pull/3787) [TECH] Corriger les valeurs de l'autocomplete dans le formulaire de création de compte sur Pix Orga (PIX-3896).
- [#3777](https://github.com/1024pix/pix/pull/3777) [TECH] Déprécier la route GET /assessments (PIX-3939).
- [#3781](https://github.com/1024pix/pix/pull/3781) [TECH] Améliorer l'accessibilité de la navigation sur Pix Orga (PIX-3894).

## v3.132.0 (26/11/2021)


### :rocket: Enhancement
- [#3764](https://github.com/1024pix/pix/pull/3764) [FEATURE] Passer en "résolu" les signalements des anciennes sessions (PIX-2641).
- [#3776](https://github.com/1024pix/pix/pull/3776) [FEATURE] Empêcher la sélection d'épreuves portant sur des acquis de même nom lors du choix des épreuves d'un test de certification (PIX-3935).
- [#3768](https://github.com/1024pix/pix/pull/3768) [FEATURE] Désactive les boutons quand les champs sont vide lors du rattachement des organisations (PIX-3771).

### :building_construction: Tech
- [#3762](https://github.com/1024pix/pix/pull/3762) [TECH] Amélioration des transitions dans le flux d'accès campagne (PIX-3888).
- [#3769](https://github.com/1024pix/pix/pull/3769) [TECH] Remplacer ember-cli-chai par chai sur Mon-Pix (PIX-3937).
- [#3724](https://github.com/1024pix/pix/pull/3724) [TECH] Linter en local uniquement les fichiers modifiés (PIX-3936).

### :bug: Bug fix
- [#3763](https://github.com/1024pix/pix/pull/3763) [BUGFIX] Remettre le chargement entre les pages du flux d'accès campagne (PIX-3889).

## v3.131.0 (25/11/2021)


### :rocket: Enhancement
- [#3731](https://github.com/1024pix/pix/pull/3731) [FEATURE] Permettre l'annulation d'une invitation envoyée par l'admin d'une organisation sur Pix Orga (PIX-399).
- [#3746](https://github.com/1024pix/pix/pull/3746) [FEATURE] Badge: Ajouter un critère sur un ensemble d'acquis (backend)
- [#3760](https://github.com/1024pix/pix/pull/3760) [FEATURE] Modifier un commentaire interne depuis Pix Admin (Pix-3869)
- [#3759](https://github.com/1024pix/pix/pull/3759) [FEATURE] Embed + focus = :heavy_check_mark:  (PIX-3041)

### :building_construction: Tech
- [#3755](https://github.com/1024pix/pix/pull/3755) [TECH] Refactoring algo flash pour lisibilité

### :bug: Bug fix
- [#3765](https://github.com/1024pix/pix/pull/3765) [BUGFIX] Vérifier l'existence du contexte async local storage avant de tracer les métriques.

### :coffee: Various
- [#3766](https://github.com/1024pix/pix/pull/3766) [FEAT] Ajout d'une colonne 'Lacune' dans le tableau d'affichage des RT (PIX-3574).

## v3.130.0 (23/11/2021)


### :rocket: Enhancement
- [#3753](https://github.com/1024pix/pix/pull/3753) [FEATURE] Afficher les certifications complémentaires des candidats inscrits lors du téléchargement de l'ods (PIX-3687).
- [#3757](https://github.com/1024pix/pix/pull/3757) [FEATURE] Afficher le commentaire interne pour le profil cible dans Pix Admin (PIX-3868)
- [#3744](https://github.com/1024pix/pix/pull/3744) [FEATURE] Rattacher le premier membre d'une organisation SCO au centre de certification correspondant sur Pix Admin (PIX-3795).
- [#3750](https://github.com/1024pix/pix/pull/3750) [FEATURE] Ne pas poser des épreuves déjà passées dans l'algo Flash (PIX-3784).

### :building_construction: Tech
- [#3754](https://github.com/1024pix/pix/pull/3754) [TECH] S'assurer que l'algo flash reproduit bien les choix attendus (PIX-3874).
- [#3756](https://github.com/1024pix/pix/pull/3756) [TECH] Retourner une erreur du domaine quand une participation à la campagne existe déjà.
- [#3721](https://github.com/1024pix/pix/pull/3721) [TECH] Paralléliser le lint.
- [#3758](https://github.com/1024pix/pix/pull/3758) [TECH] Empêcher la double participation quand la campagne n'est pas multiple (PIX-3883).

### :bug: Bug fix
- [#3752](https://github.com/1024pix/pix/pull/3752) [BUGFIX] Ne PAS afficher le champ "Certifications complémentaires" pour un centre non habilité (PIX-3855)

### :coffee: Various
- [#3751](https://github.com/1024pix/pix/pull/3751) [FEAT] Limiter le nombre de questions dans un assessment flash (PIX-3785).

## v3.129.0 (18/11/2021)


### :rocket: Enhancement
- [#3729](https://github.com/1024pix/pix/pull/3729) [FEATURE] Modifier la description d'un profil cible depuis Pix Admin (PIX-3763)
- [#3736](https://github.com/1024pix/pix/pull/3736) [FEATURE] Bloquer l'accès à une session pour un candidat qui a déjà accédé à la session (PIX-3846)
- [#3737](https://github.com/1024pix/pix/pull/3737) [FEATURE]  Ajoute le user agent a la table feedbacks (PIX-3831)
- [#3732](https://github.com/1024pix/pix/pull/3732) [FEATURE] Afficher les candidats ayant démarré leur test dans l'espace surveillant (PIX-3657)

### :building_construction: Tech
- [#3723](https://github.com/1024pix/pix/pull/3723) [TECH] Synchroniser le workflow Jira avec celui des PR Github (PIX-3828).
- [#3728](https://github.com/1024pix/pix/pull/3728) [TECH] Ajouter updatedAt dans la table certification-centers (PIX-3680).
- [#3743](https://github.com/1024pix/pix/pull/3743) [TECH] Supprimer le logging des query params lors des logs de requêtes Knex.
- [#3742](https://github.com/1024pix/pix/pull/3742) [TECH] Enrichir la documentation des variables d'environnement du monitoring.

### :bug: Bug fix
- [#3749](https://github.com/1024pix/pix/pull/3749) [BUGFIX] Supprimer les souscriptions aux certifications complémentaires (PIX-3856).
- [#3740](https://github.com/1024pix/pix/pull/3740) [BUGFIX] Vérifier que l'utilisateur est membre de l'organisation afin de pouvoir filtrer sur les groupes (PIX-3832)
- [#3748](https://github.com/1024pix/pix/pull/3748) [BUGFIX] Réparer la page pour rejoindre une organisation (PIX-3860)
- [#3739](https://github.com/1024pix/pix/pull/3739) [BUGFIX] Corriger les URL vers le support dans les emails transactionnels (PIX-3851).
- [#3741](https://github.com/1024pix/pix/pull/3741) [BUGFIX] Le path de la route n'est plus journalisé.

## v3.128.0 (16/11/2021)


### :rocket: Enhancement
- [#3718](https://github.com/1024pix/pix/pull/3718) [FEATURE] Modification de l'enregistrement de l'image d'un RT dans Pix-Admin (PIX-3481).
- [#3727](https://github.com/1024pix/pix/pull/3727) [FEATURE] Restreindre l'accès à une session aux candidats autorisés (PIX-3655)
- [#3726](https://github.com/1024pix/pix/pull/3726) [FEATURE] Ajouter une description aux profils cible et l'afficher dans pix admin(PIX-3758) 
- [#3715](https://github.com/1024pix/pix/pull/3715) [FEATURE] Proposer plusieurs épreuves à la suite pour une campagne Flash (PIX-3783).

### :building_construction: Tech
- [#3735](https://github.com/1024pix/pix/pull/3735) [TECH] Journaliser  la version de l'application.
- [#3720](https://github.com/1024pix/pix/pull/3720) [TECH] Simplifier le workflow d'automerge (PIX-3825)

### :bug: Bug fix
- [#3738](https://github.com/1024pix/pix/pull/3738) [BUGFIX] Permettre l'envoi des résultats malgré une double participation non voulue à une campagne (PIX-3850).
- [#3745](https://github.com/1024pix/pix/pull/3745) [BUGFIX] Cacher les certifications complémentaires si le FT est désactivé (PIX-3854).
- [#3734](https://github.com/1024pix/pix/pull/3734) [BUGFIX] La clé requête est dupliquée dans les logs.

## v3.127.0 (15/11/2021)


### :rocket: Enhancement
- [#3709](https://github.com/1024pix/pix/pull/3709) [FEATURE] Afficher les certifications complémentaires auxquelles sont inscrits les candidats dans Pix Certif (PIX-3686)
- [#3717](https://github.com/1024pix/pix/pull/3717) [FEATURE] Ne pas sauvegarder les KE lors de campagnes Flash (PIX-2781).
- [#3716](https://github.com/1024pix/pix/pull/3716) [FEATURE] Avoir uniquement les épreuves dans la locale de l'utilisateur pour l'algo Flash (PIX-3782).
- [#3706](https://github.com/1024pix/pix/pull/3706) [FEATURE]  Modifier la présence des candidats en session de certif (PIX-3811)

### :building_construction: Tech
- [#3719](https://github.com/1024pix/pix/pull/3719) [TECH] Supprimer le pre handler checkUserIsAdminInOrganizationOrHasRolePixMaster plus utilisé (PIX-3820).
- [#3712](https://github.com/1024pix/pix/pull/3712) [TECH] Séparer les usecases d'invitation à une orga pour un admin Pix et un admin Orga
- [#3699](https://github.com/1024pix/pix/pull/3699) [TECH] Expliciter la journalisation des métriques OPS.
- [#3708](https://github.com/1024pix/pix/pull/3708) [TECH] Exécuter le lint des fichiers YAML dans les applications.

### :bug: Bug fix
- [#3710](https://github.com/1024pix/pix/pull/3710) [BUGFIX][ORGA] Correctly display create or modify campaign button (pix-3792)
- [#3701](https://github.com/1024pix/pix/pull/3701) [BUGFIX] Eviter les doublons quand on re-invite un membre sur Pix Admin (PIX-3802).

### :coffee: Various
- [#3725](https://github.com/1024pix/pix/pull/3725) [BUFGIX] Ne pas donner l'accès à Pix Certif à un administrateur dont l'organisation n'a pas d'UAI (PIX-3793).

## v3.126.0 (09/11/2021)


### :rocket: Enhancement
- [#3713](https://github.com/1024pix/pix/pull/3713) [FEATURE] Sauvegarder les certifications complémentaires auxquelles un candidat est inscrit (PIX-3681).
- [#3703](https://github.com/1024pix/pix/pull/3703) [FEATURE] Afficher la présence des candidats en session de certification (PIX-3654)
- [#3704](https://github.com/1024pix/pix/pull/3704) [FEATURE] Mises à jour d'affiche mineur sur certif (PIX-3780)
- [#3692](https://github.com/1024pix/pix/pull/3692) [FEATURE] Limiter la taille de saisie d'un texte de présentation pour une campagne d'évaluation (PIX-3736)
- [#3693](https://github.com/1024pix/pix/pull/3693) [FEATURE] Ajout de tooltip et traduction pour expliquer une campagne de collect de profiles envoi multiple dans l'onglet paramètres (Pix 3676). 
- [#3695](https://github.com/1024pix/pix/pull/3695) [FEATURE] Amélioration du design des liens dans les champs réponses des écrans intermédiaires (PIX-3779).

### :building_construction: Tech
- [#3707](https://github.com/1024pix/pix/pull/3707) [TECH] Supprimer la gestion du nom de champ et debounced des templates des filtres des tableaux (PIX-3710).
- [#3698](https://github.com/1024pix/pix/pull/3698) [TECH] Encapsuler la logique de create-campaign dans un model (PIX-3741).
- [#3714](https://github.com/1024pix/pix/pull/3714) [TECH] Forcer l'ordre de la requête pour éviter les flaky tests (PIX-3822).
- [#3700](https://github.com/1024pix/pix/pull/3700) [TECH] Harmoniser l'auto-correction des sources.
- [#3705](https://github.com/1024pix/pix/pull/3705) [TECH] Ajout du thème Noël pour le template de pull request.
- [#3684](https://github.com/1024pix/pix/pull/3684) [TECH] Bloquer le merge pour les commits de fixup
- [#3674](https://github.com/1024pix/pix/pull/3674) [TECH] Ajouter le métrique duration dans le monitoring des appels externe en error.

### :bug: Bug fix
- [#3711](https://github.com/1024pix/pix/pull/3711) [BUGFIX] Upgrade pix-ui to fix select element on firefox

## v3.125.0 (08/11/2021)


### :rocket: Enhancement
- [#3689](https://github.com/1024pix/pix/pull/3689) [FEATURE] Ajout du taux de réussite d'un résultat thématique sur Pix-Admin (PIX-3507).

### :building_construction: Tech
- [#3675](https://github.com/1024pix/pix/pull/3675) [TECH] Sortir la brique prescrit pour décommissionner `start-or-resume` (PIX-3184).
- [#3671](https://github.com/1024pix/pix/pull/3671) [TECH] Linter les fichiers YAML.
- [#3690](https://github.com/1024pix/pix/pull/3690) [TECH] Faciliter la lecture des logs API par des humains.
- [#3694](https://github.com/1024pix/pix/pull/3694) [TECH] Prévenir l'utilisation de `console` dans l'API.

### :bug: Bug fix
- [#3702](https://github.com/1024pix/pix/pull/3702) [BUGFIX] Empêcher le débordement de l'en-tête de colonne "Temps majoré" (PIX-3804). 
- [#3697](https://github.com/1024pix/pix/pull/3697) [BUGFIX] Afficher le détail d'un profil cible sur Pix Admin (PIX-3807).

## v3.124.1 (05/11/2021)


### :bug: Bug fix
- [#3696](https://github.com/1024pix/pix/pull/3696) [BUGFIX]  Cacher les certifications complémentaires dans la modale d'inscription d'un candidat si le FT n'est pas activé (PIX-3803).

## v3.124.0 (05/11/2021)


### :rocket: Enhancement
- [#3685](https://github.com/1024pix/pix/pull/3685) [FEATURE] Afficher un message d'erreur pour les invitations d'organisation annulées (PIX-1316)
- [#3668](https://github.com/1024pix/pix/pull/3668) [FEATURE] Optimiser la page des utilisateurs dans Pix Admin qui déclenche des requêtes couteuses à chaque chargement et à chaque recherche (PIX-3667).
- [#3683](https://github.com/1024pix/pix/pull/3683) [FEATURE] Afficher les certifications complémentaires dans la modale d'inscription d'un candidat à une session de certification (PIX-3685)
- [#3691](https://github.com/1024pix/pix/pull/3691) [FEATURE] Permettre à un surveillant de quitter la session qu'il surveille (PIX-3752).

### :building_construction: Tech
- [#3686](https://github.com/1024pix/pix/pull/3686) [TECH] Réorganisation des composants dans l'application Admin.

## v3.123.0 (04/11/2021)


### :rocket: Enhancement
- [#3651](https://github.com/1024pix/pix/pull/3651) [FEATURE] Afficher les invitations de membre en attente d'une organisation sur Pix Admin (PIX-397).
- [#3649](https://github.com/1024pix/pix/pull/3649) [FEATURE] Pouvoir avoir la première question lors d'une campagne FLASH (PIX-2780).

### :building_construction: Tech
- [#3664](https://github.com/1024pix/pix/pull/3664) [TECH] Utiliser ember-testing-library dans les tests de Pix Orga
- [#3622](https://github.com/1024pix/pix/pull/3622) [TECH] Utiliser la librairie 1024pix/ember-testing-library dans les tests Pix Admin.

### :bug: Bug fix
- [#3687](https://github.com/1024pix/pix/pull/3687) [BUGFIX] Corriger l'affichage de la liste déroulante des sous-catégories de signalements (PIX-3735)
- [#3682](https://github.com/1024pix/pix/pull/3682) [BUGFIX] Afficher les habilitations disponibles dans un ordre constant (PIX-3778).

## v3.122.0 (03/11/2021)


### :rocket: Enhancement
- [#3677](https://github.com/1024pix/pix/pull/3677) [FEATURE] Autoriser l'accès à l'espace surveillant après entrée d'un numéro de session et mot de passe valide (PIX-3729).
- [#3653](https://github.com/1024pix/pix/pull/3653) [FEATURE] Permettre la création de campagne de collecte à envoi multiple (PIX-3674).
- [#3666](https://github.com/1024pix/pix/pull/3666) [FEATURE] Compléter le wording pour les établissements qui se connecte sur Pix Orga (PIX-3695).
- [#3659](https://github.com/1024pix/pix/pull/3659) [FEATURE] Affiche les ids des profils cibles dupliqués lors du rattachement à une organisation (PIX-3468).
- [#3679](https://github.com/1024pix/pix/pull/3679) [FEATURE] Assurer le type d'un centre de certification (PIX-3777).

### :bug: Bug fix
- [#3680](https://github.com/1024pix/pix/pull/3680) [BUGFIX] Mettre à jour le menu après la déconnexion via la page de lancement d'une campagne (PIX-3722)
- [#3681](https://github.com/1024pix/pix/pull/3681) [BUGFIX] Use https instead of git protocol for pix-ui dependency
- [#3669](https://github.com/1024pix/pix/pull/3669) [BUGFIX] Fermer la tooltip dès que l'utilisateur clique dessus (PIX-3708).

### :coffee: Various
- [#3660](https://github.com/1024pix/pix/pull/3660)  [FEATURE] Afficher dans l'onglet paramètre si l'envoi multiple pour une campagne de collecte de profils est activé ( PIX-3677).

## v3.121.0 (02/11/2021)


### :rocket: Enhancement
- [#3676](https://github.com/1024pix/pix/pull/3676) [FEATURE] Empêcher la connexion à Pix Certif en tant que surveilant si le FT n'est pas activé (PIX-3769).
- [#3658](https://github.com/1024pix/pix/pull/3658) [FEATURE] Afficher les infos de session et les candidats dans l'espace surveillant (PIX-3726)
- [#3618](https://github.com/1024pix/pix/pull/3618) [FEATURE] Permettre de choisir le rôle du membre lors de l'envoi de l'invitation sur Pix Admin (PIX-3494).

### :building_construction: Tech
- [#3667](https://github.com/1024pix/pix/pull/3667) [TECH] Mettre à jour les paquets de l'API.
- [#3657](https://github.com/1024pix/pix/pull/3657) [TECH] Renommer les tables et modèles liés aux habilitations (PIX-3673).
- [#3661](https://github.com/1024pix/pix/pull/3661) [TECH] Echouer le check de l'automerge si la PR a les labels "i18n needed" ou "blocked".
- [#3672](https://github.com/1024pix/pix/pull/3672) [TECH] Mettre en avant la configuration de la CI.

### :bug: Bug fix
- [#3678](https://github.com/1024pix/pix/pull/3678) [BUGFIX] Mettre à jour la version d'hapi utilisée
- [#3673](https://github.com/1024pix/pix/pull/3673) [BUGFIX]: Ajouter un loader pour le chargement du dashboard utilisateur
- [#3670](https://github.com/1024pix/pix/pull/3670) [BUGFIX] Ne plus voir les pointillés quand on revient en arrière après une focus (PIX-3720).
- [#3654](https://github.com/1024pix/pix/pull/3654) [BUGFIX] Harmoniser les champs des formulaires dans Pix Certif (PIX-3724)

## v3.120.0 (28/10/2021)


### :rocket: Enhancement
- [#3633](https://github.com/1024pix/pix/pull/3633) [FEATURE] Amélioration de la tooltip des questions focus (PIX-3670).

### :building_construction: Tech
- [#3663](https://github.com/1024pix/pix/pull/3663) [TECH] Utiliser ember-testing-library dans les tests de Pix Certif

### :coffee: Various
- [#3662](https://github.com/1024pix/pix/pull/3662) [DESIGN] Corriger la hauteur du contenu dans Pix App
- [#3652](https://github.com/1024pix/pix/pull/3652) [DOC] Ajouter la connexion à certification en tant que surveillant.

## v3.119.0 (27/10/2021)


### :rocket: Enhancement
- [#3650](https://github.com/1024pix/pix/pull/3650) [FEATURE] Renvoyer depuis l'API les infos de la session et la liste des candidats à afficher dans l'espace surveillant (PIX-3653).
- [#3641](https://github.com/1024pix/pix/pull/3641) [FEATURE] Ignorer les espaces lors d'un changement d'email et amélioration de design (PIX-3691)

### :building_construction: Tech
- [#3665](https://github.com/1024pix/pix/pull/3665) [TECH] Rendre les tests E2E plus résilients.
- [#3613](https://github.com/1024pix/pix/pull/3613) [TECH] Renommer badge-partner-competence en skillset (PIX-2708).
- [#3648](https://github.com/1024pix/pix/pull/3648) [TECH] Arbitrer de la couverture de test.

### :bug: Bug fix
- [#3632](https://github.com/1024pix/pix/pull/3632) [BUGFIX] La barre de progression n'était pas à jour lors de la reprise d'une campagne (PIX-3518).

## v3.118.0 (25/10/2021)


### :rocket: Enhancement
- [#3647](https://github.com/1024pix/pix/pull/3647) [FEATURE] Rediriger vers la page de détails après la création d'un centre de certif dans Pix Admin (PIX-3696)
- [#3645](https://github.com/1024pix/pix/pull/3645) [FEATURE] Ajouter le type de la campagne dans l'onglet paramètres (PIX-3676)
- [#3628](https://github.com/1024pix/pix/pull/3628) [FEATURE] Ajout d'un script de comparaison du nombre de pix avec la dernière release (PIX-3547).
- [#3620](https://github.com/1024pix/pix/pull/3620) [FEATURE] Permettre de sélectionner plusieurs groupes pour filtrer les étudiant (PIX-3610).
- [#3637](https://github.com/1024pix/pix/pull/3637) [FEATURE] Ajout du filtre "Groupe" dans la page d'activité d'une campagne (PIX-3542)
- [#3634](https://github.com/1024pix/pix/pull/3634) [FEATURE] Générer le mot de passe surveillant lors de la création de la session (PIX-3650).
- [#3636](https://github.com/1024pix/pix/pull/3636) [FEATURE] Ajouter un filtrer sur les groupes pour les résultats de campagnes d'évaluation (Pix-3544).
- [#3571](https://github.com/1024pix/pix/pull/3571) [FEATURE] Filtrer par le "Groupe" dans la page résultat d'une campagne de collecte (PIX-3543).

### :building_construction: Tech
- [#3646](https://github.com/1024pix/pix/pull/3646) [TECH] Suppression du formattage d'email dans les questions. 
- [#3643](https://github.com/1024pix/pix/pull/3643) [TECH] Permettre l'activation de la souscription de la certification complémentaire à chaud (PIX-3678).
- [#3640](https://github.com/1024pix/pix/pull/3640) [TECH] Mettre à jour la version de la GitHub Action "Notify team on config file change"

### :bug: Bug fix
- [#3635](https://github.com/1024pix/pix/pull/3635) [BUGFIX] Correction de l'affichage des dropdown dans les épreuves avec champs select (PIX-3705).
- [#3644](https://github.com/1024pix/pix/pull/3644) [BUGFIX] Suppression de l'event de focusOut quand une question a déjà été répondue. 
- [#3639](https://github.com/1024pix/pix/pull/3639) [BUGFIX] Harmoniser les footers d'accessibilité dans Pix Certif (PIX-3692)

### :coffee: Various
- [#3642](https://github.com/1024pix/pix/pull/3642) [FIX] Supprimer la phrase "un seul envoi possible" lors de l'envoi de profil (PIX-3675)

## v3.117.0 (22/10/2021)


### :rocket: Enhancement
- [#3630](https://github.com/1024pix/pix/pull/3630) [FEATURE] Retirer le délai pour envoyer sa collecte de profil lorsqu'une campagne autorise le renvoi (PIX-3672)
- [#3629](https://github.com/1024pix/pix/pull/3629) [FEATURE] Redirige vers la page des paramètres de la campagne quand elle est modifiée. (PIX-3516)
- [#3614](https://github.com/1024pix/pix/pull/3614) [FEATURE] Permettre d'ajouter une adresse e-mail à un utilisateur possédant un username sur Pix Admin (PIX-2558).
- [#3626](https://github.com/1024pix/pix/pull/3626) [FEATURE] Rediriger les utilisateurs non-membres d'un centre de certification vers le portail surveillant depuis la page de connexion de Pix Certif (PIX-3625).
- [#3623](https://github.com/1024pix/pix/pull/3623) [FEATURE] Pouvoir accéder à la page de connexion de l'espace surveillant (PIX-3555)

### :building_construction: Tech
- [#3627](https://github.com/1024pix/pix/pull/3627) [TECH] Utiliser le status de la table campaign-participations au lieu de la jointure assessment pour la page Activité sur Pix Orga (PIX-3666)

### :bug: Bug fix
- [#3615](https://github.com/1024pix/pix/pull/3615) [BUGFIX] Conservation statut focusedOutOfWindow si retour en arrière (PIX-3640).

## v3.116.0 (20/10/2021)


### :rocket: Enhancement
- [#3591](undefined) [FEATURE] Mettre à jour le PixInputCode et corrections de style de Mon Compte sur Pix App (PIX-3605).
- [#3619](undefined) [FEATURE] Sauvegarde de la date d'acceptation des CGU lors de la récupération de compte (PIX-3648)
- [#3625](undefined) [FEATURE] Indiquer le dernier élément avant de perdre le focus (PIX-3597).
- [#3612](undefined) [FEATURE] Filtrer les classes par un multi-select dans la liste des élèves (PIX-3612)
- [#3568](undefined) [FEATURE] Assister la modification d'un centre de certification (PIX-3577)

### :building_construction: Tech
- [#3631](undefined) [TECH] Utiliser PixButtonLink sur la page de checkpoint
- [#3621](undefined) [TECH] Utiliser le status de la table campaign-participations au lieu de la jointure assessment pour la page d'accueil de Pix App (PIX-3664).
- [#3603](undefined) [TECH] Refactorer des tests pour corriger la règle de lint "no-setup-in-describe"
- [#3606](undefined) [TECH] Sortir la brique entrée de la campagne pour décommissionner `start-or-resume` (PIX-3182).

## v3.115.0 (19/10/2021)

- [#3582](https://github.com/1024pix/pix/pull/3582) [FEATURE] Inviter un membre à une organisation PRO avec un rôle défini dans le fichier de création des organisations PRO (PIX-3493).
- [#3610](https://github.com/1024pix/pix/pull/3610) [FEATURE] Modification des tooltips sur les différents types de questions (PIX-3639).
- [#3617](https://github.com/1024pix/pix/pull/3617) [FEATURE] Accéder au Portail surveillant en étant connecté à pix-certif (PIX-3624)
- [#3595](https://github.com/1024pix/pix/pull/3595) [FEATURE] Bloquer l'obtention d'une certification complémentaire lorsque la session a été passée dans un centre de certification non habilité (PIX-3525).
- [#3601](https://github.com/1024pix/pix/pull/3601) [BUGFIX] à l'import, ne pas réconcilier les nouveaux élèves qui sont liés par ailleurs au même compte utilisateur (PIX-3643).
- [#3597](https://github.com/1024pix/pix/pull/3597) [TECH] Améliorer l'accessibilité des tooltips dans Pix Certif (PIX-3170)
- [#3584](https://github.com/1024pix/pix/pull/3584) [TECH] Supprimer la colonne isShared (PIX-3146).
- [#3599](https://github.com/1024pix/pix/pull/3599) [TECH] Refacto du filtre des classes dans l'onglet activité et résultats de Pix Orga (PIX-3618)
- [#3624](https://github.com/1024pix/pix/pull/3624) Revert "[TECH] Utiliser le token de github pour sécuriser l'auto merge."
- [#3616](https://github.com/1024pix/pix/pull/3616) [CLEANUP] Rendre le tri des skills par difficulté plus clair dans le choix des épreuves de certif

## v3.114.0 (15/10/2021)

- [#3607](https://github.com/1024pix/pix/pull/3607) [FEATURE] Ajouter la bannière d'information dans Pix Certif (PIX-3559).
- [#3608](https://github.com/1024pix/pix/pull/3608) [FEATURE] Mise en place du feature toggle pour le RIP FDT (PIX-3554)
- [#3598](https://github.com/1024pix/pix/pull/3598) [FEATURE] Afficher un message de confirmation quand une invitation est envoyée sur Pix Orga (PIX-731).
- [#3605](https://github.com/1024pix/pix/pull/3605) [FEATURE] Supprimer le Feature toggle FT_IS_DOWNLOAD_CERTIFICATION_ATTESTATION_BY_DIVISION_ENABLED (PIX-3602)
- [#3602](https://github.com/1024pix/pix/pull/3602) [BUGFIX] Le commentaire global de session affiché est celui de la session vue précédemment (PIX-3644)
- [#3611](https://github.com/1024pix/pix/pull/3611) [BUGFIX] Corriger l'édition d'une certification dans Pix Admin (PIX-3638)
- [#3593](https://github.com/1024pix/pix/pull/3593) [BUGFIX] Corriger le fichier de test mail-service dans l'API (PIX-3630).
- [#3446](https://github.com/1024pix/pix/pull/3446) [TECH] Utiliser le token de github pour sécuriser l'auto merge.
- [#3609](https://github.com/1024pix/pix/pull/3609) [TECH] Ajouter Eslint Prettier dans Mon Pix (PIX-3645).
- [#3585](https://github.com/1024pix/pix/pull/3585) [TECH] Utiliser DOM Testing library dans les tests Pix Certif
- [#3589](https://github.com/1024pix/pix/pull/3589) [TECH] Supprimer le isShared du buildCampaignParticipation. (PIX-3498)

## v3.113.0 (14/10/2021)

- [#3572](https://github.com/1024pix/pix/pull/3572) [FEATURE] Ajouter le nombre de résultats dans la pagination de tableau Pix Orga (PIX-3538)
- [#3578](https://github.com/1024pix/pix/pull/3578) [FEATURE] Pouvoir ajouter une habilitation à un CDC lors de sa création (PIX-3524)
- [#3596](https://github.com/1024pix/pix/pull/3596) [FEATURE] Retourner sur la liste des invitations après avoir invité un membre (PIX-3526)
- [#3580](https://github.com/1024pix/pix/pull/3580) [FEATURE] Afficher les méthodes de connexion de l'utilisateur dans Mon Compte sur Pix App (PIX-3514).
- [#3561](https://github.com/1024pix/pix/pull/3561) [FEATURE] Créer un badge depuis Pix Admin (PIX-3505).
- [#3588](https://github.com/1024pix/pix/pull/3588) [FEATURE] Ajout d'un pied de page (footer) dans Pix Certif (PIX-3548)
- [#3592](https://github.com/1024pix/pix/pull/3592) [BUGFIX] Suppression de l'activation de sortie de question sur les champs `select` dans Firefox (PIX-3598).
- [#3579](https://github.com/1024pix/pix/pull/3579) [BUGFIX] Correction de l'affichage de l'épreuve focus à la reprise d'un parcours (PIX-3585).
- [#3545](https://github.com/1024pix/pix/pull/3545) [TECH] Monter les BDD de développement en version majeure 13.3 depuis la 12.7.
- [#3586](https://github.com/1024pix/pix/pull/3586) [TECH] Sortir la brique "page de présentation" du `start-or-resume` (PIX-3183).
- [#3594](https://github.com/1024pix/pix/pull/3594) [TECH] Ajout du thème Halloween pour le template de pull request.
- [#3562](https://github.com/1024pix/pix/pull/3562) [TECH] Utiliser DOM Testing library dans les tests Pix Orga
- [#3587](https://github.com/1024pix/pix/pull/3587) [CLEAN] Nettoyer les fichiers helper de build des AuthenticationMethods (PIX-3606)
- [#3581](https://github.com/1024pix/pix/pull/3581) [CLEANUP] Rendre un peu similaire les deux fonctions de choix d'épreuves de certif

## v3.112.0 (12/10/2021)

- [#3560](https://github.com/1024pix/pix/pull/3560) [FEATURE] Afficher la classe des élèves sur la feuille d'émargement (PIX-3492)
- [#3539](https://github.com/1024pix/pix/pull/3539) [FEATURE] Envoyer le code de vérification une fois le champ de code rempli pour le changement d'adresse e-mail sur Pix App (PIX-3534).
- [#3583](https://github.com/1024pix/pix/pull/3583) [BUGFIX] On ne peut pas filtrer par classe et statut en même temps (PIX-3601).
- [#3569](https://github.com/1024pix/pix/pull/3569) [BUGFIX] Mettre à jour la date de dernière modif quand la demande de récupération est mise à jour (PIX-3489)
- [#3576](https://github.com/1024pix/pix/pull/3576) [BUGFIX] Réparer le script d'installation suite à la mise à jour du nom des conteneurs docker.
- [#3574](https://github.com/1024pix/pix/pull/3574) [BUGFIX] Corriger le label du bouton pour éditer une organisation sur Pix Admin (PIX-3454).
- [#3577](https://github.com/1024pix/pix/pull/3577) [TECH] Corriger l'erreur flaky sur la gestion des erreurs du fichier SIECLE

## v3.111.0 (08/10/2021)

- [#3558](https://github.com/1024pix/pix/pull/3558) [FEATURE] Toujours afficher la page de présentation au début de la campagne (Pix-3180).
- [#3551](https://github.com/1024pix/pix/pull/3551) [FEATURE] Pouvoir identifier les certif démarrées scorées/annulées automatiquement (PIX-2988)
- [#3554](https://github.com/1024pix/pix/pull/3554) [FEATURE] Permettre le ré-envoie de code de vérification lors d'un changement d'email (PIX-3497)
- [#3559](https://github.com/1024pix/pix/pull/3559) [FEATURE] Exporter les résultats d'une campagne d'évaluation SUP avec le groupe (PIX-3541).
- [#3573](https://github.com/1024pix/pix/pull/3573) [BUGFIX] Changer la redirection de fin de parcours statique vers la page d'inscription de prod (PIX-3595).
- [#3567](https://github.com/1024pix/pix/pull/3567) [BUGFIX] Bloquer la publication d'une session de certification "aborted" (PIX-3573).
- [#3538](https://github.com/1024pix/pix/pull/3538) [TECH] Formater le code de API avec Prettier.
- [#3566](https://github.com/1024pix/pix/pull/3566) [TECH] Monter de version ember-source sur Pix Admin
- [#3565](https://github.com/1024pix/pix/pull/3565) [TECH] Monter de version d'ember-source sur Pix Orga
- [#3532](https://github.com/1024pix/pix/pull/3532) [TECH] Remplacer masteryPercentage par masteryRate (PIX-3496)

## v3.110.0 (06/10/2021)

- [#3509](https://github.com/1024pix/pix/pull/3509) [FEATURE] Mettre à jour les informations d'un centre de certifications depuis Pix Admin (PIX-3478) 
- [#3552](https://github.com/1024pix/pix/pull/3552) [FEATURE] Modifier le message d'erreur pour les imports SCO (PIX-3515)
- [#3549](https://github.com/1024pix/pix/pull/3549) [FEATURE] Ajout d'un filtre sur la colonne "groupe" sur la page "Étudiants". (PIX-3537)
- [#3553](https://github.com/1024pix/pix/pull/3553) [FEATURE]  Ajout de la colonne groupe dans le fichier d'export CSV au sein d'une campaign de collecte de profil  (Pix-3540).
- [#3563](https://github.com/1024pix/pix/pull/3563) [BUGFIX] Corriger le type de l'appel PUT /{id}/email/verification-code, coté Pix App (PIX-3576).
- [#3540](https://github.com/1024pix/pix/pull/3540) [BUGFIX] Afficher les détails d'un badge dans pix-admin (PIX-3505).
- [#3557](https://github.com/1024pix/pix/pull/3557) [TECH] Ajouter Prettier sur Mon-Pix (PIX-3572).
- [#3227](https://github.com/1024pix/pix/pull/3227) [TECH] Suppression de classes CSS non utilisées dans Pix-App.
- [#3556](https://github.com/1024pix/pix/pull/3556) [TECH] Ajouter stylelint à Pix Admin (PIX-3570).
- [#3547](https://github.com/1024pix/pix/pull/3547) [CLEANUP] Choix des épreuves de certification : clarifie la sélection des épreuves déjà répondues

## v3.109.0 (04/10/2021)

- [#3530](https://github.com/1024pix/pix/pull/3530) [FEATURE] Enregistrer la nouvelle adresse e-mail lorsque l'utilisateur entre le code de vérification - API (PIX-3448).
- [#3526](https://github.com/1024pix/pix/pull/3526) [FEATURE] Enregistrer la dernière date de connexion dans le cas du GAR ou de Pôle Emploi (PIX-3510).
- [#3533](https://github.com/1024pix/pix/pull/3533) [FEATURE] Arrondir à l'entier supérieur la règle de scoring globale d'une certification (PIX-3527).
- [#3546](https://github.com/1024pix/pix/pull/3546) [BUGFIX] Corriger l'affichage du centre de certification courant dans Pix Certif (PIX-3560).
- [#3496](https://github.com/1024pix/pix/pull/3496) [TECH] Séparer les différentes logiques d'accès à une campagne (PIX-3181)
- [#3550](https://github.com/1024pix/pix/pull/3550) Revert "[RELEASE] A minor is being released to 3.109.0."
- [#3548](https://github.com/1024pix/pix/pull/3548) [DOC] Expliciter la configuration de PoleEmploi.
- [#3534](https://github.com/1024pix/pix/pull/3534) [ADMIN] Ne plus bloquer l'enregistrement d'une liste d'organisations si certains sont déjà rattachées à un profil cible (PIX-3456)

## v3.108.0 (01/10/2021)

- [#3535](https://github.com/1024pix/pix/pull/3535) [FEATURE] Cacher les élèves désactivés de la liste des élèves pouvant être inscrits à une session de certification (PIX-3163).
- [#3543](https://github.com/1024pix/pix/pull/3543) [FEATURE] Ajoute la colonne "groupe" sur la page "Étudiants" pour les orgas SUP isManagingStudent. (PIX-3536)
- [#3522](https://github.com/1024pix/pix/pull/3522) [FEATURE] Réutiliser le champ résultat pour les exports CSV des deux campagnes (PIX-3066).
- [#3528](https://github.com/1024pix/pix/pull/3528) [FEATURE] Ajoute le filtre sur la colonne statuts dans l'onglet activité (PIX-2667)
- [#3527](https://github.com/1024pix/pix/pull/3527) [FEATURE] Bloquer l'accès à Pix certif pour les CDC SCO AGRI et AEFE (PIX-3511)
- [#3536](https://github.com/1024pix/pix/pull/3536) [TECH] Formater le code de pix-admin avec Prettier.
- [#3537](https://github.com/1024pix/pix/pull/3537) [TECH] Mise à jour d'ember-template-lint dans Pix Orga.
- [#3513](https://github.com/1024pix/pix/pull/3513)  [FEATURE] Scoring des certifications démarrées (PIX-2982)

## v3.107.0 (30/09/2021)

- [#3542](https://github.com/1024pix/pix/pull/3542) [BUGFIX] Correction de tests qui tombent en erreur le 12 et le 30 du mois.
- [#3541](https://github.com/1024pix/pix/pull/3541) Revert "[TECH] Mettre à jour Ember Simple Auth en 4.0.0 sur Pix App."

## v3.106.0 (28/09/2021)

- [#3502](https://github.com/1024pix/pix/pull/3502) [FEATURE] Permettre la suppression du commentaire jury d'une session (PIX-3150)
- [#3484](https://github.com/1024pix/pix/pull/3484) [FEATURE] Pouvoir passer un assessment FLASH (PIX-2779).
- [#3505](https://github.com/1024pix/pix/pull/3505) [FEATURE] Page de vérification de code pour un changement d'adresse e-mail (PIX-2892).
- [#3520](https://github.com/1024pix/pix/pull/3520) [FEATURE] Permettre la création de résultat thématique depuis Pix Admin 1/2 (PIX-3480).
- [#3525](https://github.com/1024pix/pix/pull/3525) [BUGFIX] Améliorer le style de la tooltip d'explication du score Pix (PIX-3482).
- [#3518](https://github.com/1024pix/pix/pull/3518) [BUGFIX] Retirer la vérification de la ville de naissance lors de l'ajout d'un candidat SCO à une session de certification (PIX-3500)
- [#3519](https://github.com/1024pix/pix/pull/3519) [BUGFIX] Gérer un cas d'erreur lors d'un accès à une campagne SCO sur Pix App (PIX-3191).
- [#3531](https://github.com/1024pix/pix/pull/3531) [TECH] Refacto des méthodes de connexion de PixApp (PIX-3503).
- [#3524](https://github.com/1024pix/pix/pull/3524) [TECH] Mettre à jour Ember Simple Auth en 4.0.0 sur Pix App.
- [#3239](https://github.com/1024pix/pix/pull/3239) [TECH] Nommer les conteneurs Docker locaux.
- [#3494](https://github.com/1024pix/pix/pull/3494) [TECH] Formatage des fichiers de pix-orga avec Prettier.
- [#3516](https://github.com/1024pix/pix/pull/3516) [TECH] Remplace le userId par me dans l'url certification-point-of-contacts (pix-3495)

## v3.105.0 (24/09/2021)

- [#3508](https://github.com/1024pix/pix/pull/3508) [FEATURE] Afficher le statut d'un profil cible dans la liste des profils cibles dans Pix Admin (Pix-3475).
- [#3428](https://github.com/1024pix/pix/pull/3428) [FEATURE] Pouvoir désannuler une certification sur PixAdmin (PIX-3132)
- [#3487](https://github.com/1024pix/pix/pull/3487) [FEATURE] Ne plus utiliser la colonne `isShared` des campagne participations (PIX-3144)
- [#3504](https://github.com/1024pix/pix/pull/3504) [FEATURE] Ajouter une liste des badges non acquis à ceux acquis en fin de campagne (PIX-2678).
- [#3521](https://github.com/1024pix/pix/pull/3521) [BUGFIX] Le reload de la page ne doit pas faire oublié qu'on a défocus (PIX-3506).
- [#3523](https://github.com/1024pix/pix/pull/3523) [TECH] Ajout du support pour le plugin Matomo Session Recordings
- [#3489](https://github.com/1024pix/pix/pull/3489) [TECH] Refactoring de addOrUpdateOrganizationSchoolingRegistrations pour utiliser upsert (PIX-3450).
- [#3512](https://github.com/1024pix/pix/pull/3512) [TECH] Ajouter une Github action qui notifie les équipes sur Slack lorsque le fichier de config est modifié.
- [#3514](https://github.com/1024pix/pix/pull/3514) [TECH] Savoir si la personne a bien répondu mais est quand même sortie (PIX-3079).

## v3.104.0 (21/09/2021)

- [#3517](https://github.com/1024pix/pix/pull/3517) [BUGFIX] Sauvegarde l'état de la question focus seulement en cas de sortie de la fenêtre

## v3.103.0 (21/09/2021)

- [#3459](https://github.com/1024pix/pix/pull/3459) [FEATURE] Ajouter/modifier le commentaire jury d'une session dans Pix Admin (PIX-3131)
- [#3515](https://github.com/1024pix/pix/pull/3515) [FEATURE] Changement de titre de page pour les épreuves focus (PIX-3484).
- [#3510](https://github.com/1024pix/pix/pull/3510) [FEATURE] Ajout d'un pied de page (footer) dans Pix Orga (PIX-3487).

## v3.102.0 (20/09/2021)

- [#3469](https://github.com/1024pix/pix/pull/3469) [FEATURE] Blocage des espaces Pix Certif pour les établissements scolaires / Rentrée 2021-2022 (PIX-3162)
- [#3501](https://github.com/1024pix/pix/pull/3501) [FEATURE] Simplifier la visibilité de l'épreuve et des tooltips (PIX-3483).
- [#3476](https://github.com/1024pix/pix/pull/3476) [FEATURE] Ajout de l'infobulle sur les épreuves non-focus (PIX-2882).
- [#3495](https://github.com/1024pix/pix/pull/3495) [FEATURE] Envoyer un code de vérification par mail lors d'un changement d'adresse e-mail (PIX-3453).
- [#3482](https://github.com/1024pix/pix/pull/3482) [FEATURE] Envoyer un code de vérification par mail lors d'un changement d'adresse e-mail - API (PIX-2945).
- [#3498](https://github.com/1024pix/pix/pull/3498) [BUGFIX] Correction des notifications d'import SUP (PIX-3455)
- [#3404](https://github.com/1024pix/pix/pull/3404) [BUGFIX] Vérification du timeout et du unfocus en cas de rechargement.
- [#3511](https://github.com/1024pix/pix/pull/3511) [BUGFIX] Problème de contraste sur le bouton de texte alternatif d'une épreuve (PIX-3490).
- [#3491](https://github.com/1024pix/pix/pull/3491) [BUGFIX] Supprimer le double appel à getNextChallenge (PIX-2760).
- [#3492](https://github.com/1024pix/pix/pull/3492) [TECH] Suppression des parseInt autour de request.auth.credentials.userId
- [#3488](https://github.com/1024pix/pix/pull/3488) [TECH]  Refacto des requetes avec JSON_AGG (PIX-3452)
- [#3499](https://github.com/1024pix/pix/pull/3499) [CLEANUP] Uniformiser les url des badges (PIX-3479). 

## v3.101.0 (16/09/2021)

- [#3480](https://github.com/1024pix/pix/pull/3480) [FEATURE] Distinguer les Schooling registration désactivées sur PixAdmin en utilisant la colonne 'isDisabled' (PIX-3098).
- [#3448](https://github.com/1024pix/pix/pull/3448) [FEATURE] Justifier un abandon de session depuis Pix Certif (PIX-3133)
- [#3474](https://github.com/1024pix/pix/pull/3474) [FEATURE] Créer une route permettant de lister les habilitations et mettre à jour l'affichage des habilitations d'un centre de certification dans Pix Admin (PIX-3174).
- [#3367](https://github.com/1024pix/pix/pull/3367) [FEATURE] Mettre à jour les PixButton dans Pix App (PIX-3012).
- [#3490](https://github.com/1024pix/pix/pull/3490) [BUGFIX] Force une valeur pour eviter un flaky test (PIX-3471)
- [#3470](https://github.com/1024pix/pix/pull/3470) [BUGFIX] Lors de l'import siecle si une archive zip contient plusieurs fichiers il y a une erreur (PIX-3177).
- [#3483](https://github.com/1024pix/pix/pull/3483) [BUGFIX] Ne pas afficher le warning d'écran de fin test si pas de certification terminée (PIX-3449)
- [#3486](https://github.com/1024pix/pix/pull/3486) [TECH] Logger le dispatch de Domain Events (PIX-3175)
- [#3485](https://github.com/1024pix/pix/pull/3485) [TECH] Supprimer la gestion des erreurs sur les doublons d'INE dans la base de données (Pix-3189).
- [#3481](https://github.com/1024pix/pix/pull/3481) [TECH] Migration des status de campagne participations (PIX-3000)
- [#3460](https://github.com/1024pix/pix/pull/3460) [TECH] Associer un statut à un participation de campagne à la création et finalisation (PIX-3138)
- [#3493](https://github.com/1024pix/pix/pull/3493) [CLEAN]  Corrige des typos

## v3.100.0 (13/09/2021)

- [#3479](https://github.com/1024pix/pix/pull/3479) [BUGFIX] Pouvoir ajouter un élève qui est lié à un compte déjà lié à un élève de mon établissement (PIX-3447)
- [#3478](https://github.com/1024pix/pix/pull/3478) [BUGFIX] La notification de passage de niveau doit cacher le bouton Quitter (PIX-3176).
- [#3473](https://github.com/1024pix/pix/pull/3473) [TECH] Monter de version caniuse-lite
- [#3477](https://github.com/1024pix/pix/pull/3477) [INFRA] Ajouter des helpers de tests getByLabel et queryByLabel à Pix Admin

## v3.99.0 (10/09/2021)

- [#3468](https://github.com/1024pix/pix/pull/3468) [FEATURE] Indiquer à l'utilisateur qu'il est sorti d'une épreuve Focus en certification (PIX-3075).
- [#3472](https://github.com/1024pix/pix/pull/3472) [FEATURE] Minimiser le nombre d'appels lors de la recherche dans les composants Pix Admin (PIX-3116).
- [#3463](https://github.com/1024pix/pix/pull/3463) [FEATURE] Marquer la participation "STARTED" au moment du "retenter". (PIX-3155)
- [#3453](https://github.com/1024pix/pix/pull/3453) [FEATURE][A11Y] Utiliser des balises HTML sémantiques dans la page "Analyse" de Pix Orga (PIX-3058).
- [#3455](https://github.com/1024pix/pix/pull/3455) [FEATURE][A11Y] Utiliser des balises HTML sémantiques dans la page "Résultats" et "Résultat individuel" de Pix Orga (PIX-3057).
- [#3457](https://github.com/1024pix/pix/pull/3457) [FEATURE] Changer le status de la participation au partage (PIX-3139)
- [#3430](https://github.com/1024pix/pix/pull/3430) [FEATURE] Pouvoir voir les habilitations des centres de certification aux certifications complémentaires sur leur page de détails dans PixAdmin (PIX-3128)
- [#3475](https://github.com/1024pix/pix/pull/3475) [BUGFIX] Le bloc d'alerte de sorti d'épreuve focus ne doit pas bloquer l'utilisation de certains boutons (PIX-3179).
- [#3466](https://github.com/1024pix/pix/pull/3466) [BUGFIX] Ne plus avoir l'écran grisé sur des épreuves focus (PIX-3167).
- [#3467](https://github.com/1024pix/pix/pull/3467) [BUGFIX] L'affichage du code d'une campagne se fait sur deux lignes (PIX-2858).
- [#3458](https://github.com/1024pix/pix/pull/3458) [TECH] Mesurer les temps de réponses API des appels externes à Pix via un métrique duration (PIX-3171).
- [#3456](https://github.com/1024pix/pix/pull/3456) [TECH] Corréler et enrichir la sortie de log Hapi d'un appel API avec des métriques concernant les queries Knex associées (PIX-3168).
- [#3443](https://github.com/1024pix/pix/pull/3443) [TECH] Réutiliser le champ résultat pour la page "résultats" sur Pix App(PIX-3123)
- [#3471](https://github.com/1024pix/pix/pull/3471) [TECH] Création d'un utilitaire générateur de code aléatoire numérique (PIX-3122).
- [#3465](https://github.com/1024pix/pix/pull/3465) [TECH] Ajour des variables CSS de Pix-ui (PIX-3186)
- [#3447](https://github.com/1024pix/pix/pull/3447) [TECH] Identifier rapidement les problèmes de nos utilisateurs via Datadog en cherchant via leur identifiant toute requête les concernant (PIX-3153).

## v3.98.0 (07/09/2021)

- [#3462](https://github.com/1024pix/pix/pull/3462) [FEATURE] Modification du fichier d'import Fregata (PIX-3140)

## v3.97.0 (07/09/2021)

- [#3444](https://github.com/1024pix/pix/pull/3444) [FEATURE] Les épreuves focus sont échouées en certification en cas de perte du focus (PIX-3147).
- [#3432](https://github.com/1024pix/pix/pull/3432) [FEATURE] Création du formulaire pour la validation de l'adresse e-mail sur Pix App (PIX-3120).
- [#3452](https://github.com/1024pix/pix/pull/3452) [FEATURE] Supprimer l'affichage de html/css dans les instructions en checkpoint (PIX-2792).
- [#3454](https://github.com/1024pix/pix/pull/3454) [FEATURE] Réutiliser le champ résultat pour la page "profil déjà envoyé" sur Pix App (PIX-3124).
- [#3427](https://github.com/1024pix/pix/pull/3427) [FEATURE] Afficher le commentaire jury d'une session dans Pix Admin (PIX-3130)
- [#3450](https://github.com/1024pix/pix/pull/3450) [FEATURE] Nouveau message de sortie d'épreuve focus pour la certification (PIX-3069).
- [#3451](https://github.com/1024pix/pix/pull/3451) [FEATURE] Modification des messages sur les épreuves focus (PIX-3148).
- [#3442](https://github.com/1024pix/pix/pull/3442) [TECH] Ajouter une colonne de statut sur la table "compaign-participations" (PIX-2998).
- [#3449](https://github.com/1024pix/pix/pull/3449) [TECH] Suppression de la route GET `/campaigns/id/assessment-participations` qui est dépréciée (PIX-3161).
- [#3405](https://github.com/1024pix/pix/pull/3405) [FEAT] Suppression du champ grisé après la fin du temps imparti sur une question timée.

## v3.96.0 (03/09/2021)

- [#3445](https://github.com/1024pix/pix/pull/3445) [FEATURE] Ajouter un titre de page spécifique pour les épreuves focus (PIX-3149). 
- [#3424](https://github.com/1024pix/pix/pull/3424) [FEATURE] Sauvegarder la dernière date de connexion dans la table users (PIX-2736).
- [#3370](https://github.com/1024pix/pix/pull/3370) [FEATURE] Afficher un graphique de répartition par résultat pour les campagnes sans palier (PIX-2894).
- [#3425](https://github.com/1024pix/pix/pull/3425) [FEATURE] Afficher le message d'alerte des focus via le clavier (PIX-3074).
- [#3436](https://github.com/1024pix/pix/pull/3436) [BUGFIX] Créer la base de données lors de la configuration du repo.
- [#3438](https://github.com/1024pix/pix/pull/3438) [BUGFIX] Corriger la méthode app.services.url.homeUrl dans Pix Orga (PIX-3134).
- [#3416](https://github.com/1024pix/pix/pull/3416) [BUGFIX] Rediriger vers l'organisation rejointe au moment d'accepter l'invitation (PIX-3109).
- [#3365](https://github.com/1024pix/pix/pull/3365) [TECH] Migrer la colonne knowledge_elements.id de INTEGER en BIG INTEGER (partie 3).
- [#3433](https://github.com/1024pix/pix/pull/3433) [TECH] Améliorer l'accessibilité de la navigation et des tooltip dans Pix Orga (PIX-2955)
- [#3380](https://github.com/1024pix/pix/pull/3380) [TECH] Remplacer les plugins good, good-console, good-squeeze qui ont été dépréciées par hapi-pino (Pix-3051).
- [#3435](https://github.com/1024pix/pix/pull/3435) [TECH] Encapsuler les requêtes BDD dans une transaction lors du partage d'une participation (PIX-3093).
- [#3408](https://github.com/1024pix/pix/pull/3408) [TECH] Création du scénario Inscription et page Profil dans Pix Load-Testing (PIX-3114).
- [#3441](https://github.com/1024pix/pix/pull/3441) [A11Y] Utiliser des balises HTML sémantiques dans la page "Activité" de Pix Orga (PIX-3056).
- [#3440](https://github.com/1024pix/pix/pull/3440) [A11Y] Amélioration de l'accessibilité de la tooltip des épreuves "focus" (PIX-3073).

## v3.95.0 (02/09/2021)

- [#3419](https://github.com/1024pix/pix/pull/3419) [FEATURE] Ne récupérer que la dernière participation d'une campagne pour chaque utilisateur dans l'onglet analyse (partie compétences) (PIX-2966).
- [#3426](https://github.com/1024pix/pix/pull/3426) [FEATURE] Ajout du endpoint pour l'abandon d'une certification (pix-3063)
- [#3361](https://github.com/1024pix/pix/pull/3361) [FEATURE] Création d'un champ `assessmentMethod` dans les campagnes 'flash' (PIX-2778).
- [#3406](https://github.com/1024pix/pix/pull/3406) [FEATURE] Ajout de la règle de scoring global lors du scoring d'une certification (PIX-3045)
- [#3439](https://github.com/1024pix/pix/pull/3439) [BUGFIX] Eviter les dépassements mémoire lors de finalisation de session avec beaucoup de candidats (PIX-3136)
- [#3431](https://github.com/1024pix/pix/pull/3431) [BUGFIX] Le titre de la page d'épreuve n'était pas mise à jour en cas de timeout.
- [#3420](https://github.com/1024pix/pix/pull/3420) [BUGFIX] Les certifications complémentaires ne sont pas affichées comme "Annulées" lorsque la certification Pix est annulée (PIX-3117)
- [#3429](https://github.com/1024pix/pix/pull/3429) [TECH] Expliciter la configuration de NODE_ENV.
- [#3423](https://github.com/1024pix/pix/pull/3423) [TECH] Activer à chaud la validation de l'adresse e-mail sur Pix App (PIX-3121).
- [#3422](https://github.com/1024pix/pix/pull/3422) [TECH] Importer les variables CSS de pix-ui dans admin
- [#3398](https://github.com/1024pix/pix/pull/3398) [TECH] Ne sélectionner que les derniers résultats d'un prescrit à une campagne dans l'export d'une collecte de profils (PIX-2968).
- [#3412](https://github.com/1024pix/pix/pull/3412) [TECH] Supprimer le feature toggle pour les données CPF (pix-3105)
- [#3418](https://github.com/1024pix/pix/pull/3418) [A11Y] Donner plus de sémantique à la page paramètre de la campage (PIX-3055)
- [#3397](https://github.com/1024pix/pix/pull/3397) [INFRA] Aligner Pix Certif avec les composants Pix UI (PIX-3013)
- [#3421](https://github.com/1024pix/pix/pull/3421) [CLEANUP] Refonte UX de l'affichage des signalement dans Pix Admin (PIX-3088)

## v3.94.0 (31/08/2021)

- [#3414](https://github.com/1024pix/pix/pull/3414) [FEATURE] Mettre à jour la bannière des parcours de rentrée SCO pour la rentrée 2021 (PIX-3101).
- [#3415](https://github.com/1024pix/pix/pull/3415) [FEATURE] Mise à jour du bandeau d'import SCO pour la rentrée 2021 (PIX-3100).
- [#3409](https://github.com/1024pix/pix/pull/3409) [BUGFIX] Corriger le message d'erreur lorsque l'adresse e-mail existe déjà sur Pix App (PIX-3111).
- [#3407](https://github.com/1024pix/pix/pull/3407) [BUGFIX] Corriger la redirection du lien pour créer un Profil Cible (PIX-3115).
- [#3349](https://github.com/1024pix/pix/pull/3349) [TECH] Remplacer Bookshelf par Knex dans l'authentication-method-repository (PIX-3042)
- [#3417](https://github.com/1024pix/pix/pull/3417) [TECH] Remplacement des modules de log `good` et associés par les versions à jour sous `@hapi`
- [#3410](https://github.com/1024pix/pix/pull/3410) [TECH] Supprimer les indexes de la table account-recovery-demands (PIX-2983).
- [#3411](https://github.com/1024pix/pix/pull/3411) [TECH] Supprimer le feature toggle IsScoAccountRecoveryEnabled (PIX-3059).
- [#3399](https://github.com/1024pix/pix/pull/3399) [TECH] Réutiliser le champ résultat pour la page "mes parcours" (PIX-3085)

## v3.93.0 (30/08/2021)

- [#3396](https://github.com/1024pix/pix/pull/3396) [FEATURE] Afficher la dernière participation dans l'export d'une campagne de collecte(PIX-2967)
- [#3402](https://github.com/1024pix/pix/pull/3402) [FEATURE] Changer le message de la bannière des organisations SCO concernant les dates de certification possibles (PIX-3096)
- [#3381](https://github.com/1024pix/pix/pull/3381) [FEATURE] Ajout d'une section pour les certifications non terminées d'une session à finaliser (PIX-3062)
- [#3403](https://github.com/1024pix/pix/pull/3403) [BUGFIX] Pouvoir importer des fichiers d'import élèves SCO sans qu'ils soient automatiquement désactivés (PIX-3110).
- [#3400](https://github.com/1024pix/pix/pull/3400) [BUGFIX] Il est impossible d'éditer les informations d'un candidat né à l'étranger sur PixAdmin (PIX-3104)
- [#3379](https://github.com/1024pix/pix/pull/3379) [CLEANUP] Refactoring autour du CertificationResult (PIX-3108)

## v3.92.0 (27/08/2021)

- [#3395](https://github.com/1024pix/pix/pull/3395) [FEATURE] Retire l'annulation automatique de certifications non terminées (PIX-3095)
- [#3391](https://github.com/1024pix/pix/pull/3391) [FEATURE] N'utiliser que la dernière participation d'une campagne pour chaque utilisateur dans l'onglet analyse(PIX-2964).
- [#3342](https://github.com/1024pix/pix/pull/3342) [FEATURE] Utiliser les composants Pix-UI dans PixAdmin (PIX-3011).
- [#3401](https://github.com/1024pix/pix/pull/3401) [BUGFIX] Changer la couleur d'un lien d'aide pour qu'il soit plus accessible.
- [#3387](https://github.com/1024pix/pix/pull/3387) [BUGFIX] Réparer l'affichage de la liste déroulante de sélection d'une sous catégorie pour un signalement "E1-E9 Problème technique sur une question" (PIX-3084).
- [#3364](https://github.com/1024pix/pix/pull/3364) [TECH] Migrer la colonne knowledge_elements.id de INTEGER en BIG INTEGER (partie 2).
- [#3394](https://github.com/1024pix/pix/pull/3394) [TECH] Optimiser le temps de réponse de l'api /campaign-participations pour la campagne Pôle Emploi (PIX-3091).
- [#3393](https://github.com/1024pix/pix/pull/3393) [TECH] Réutiliser le champ résultat pour le détail du profil d'un participant dans une campagne de collecte de profils(PIX-3083)
- [#3392](https://github.com/1024pix/pix/pull/3392) [TECH] Gérer le logging des métriques knex queries lors des exécutions via des scripts SQL (PIX-3090).
- [#3390](https://github.com/1024pix/pix/pull/3390) [TECH] Mise à jour du scénario "Inscription et positionnement" dans Pix Load-Testing (PIX-3082).
- [#3383](https://github.com/1024pix/pix/pull/3383) [TECH] Utilisation de la colonne "masteryPercentage" pour la liste des résultats d'une campagne d'évaluation (PIX-2897)
- [#3388](https://github.com/1024pix/pix/pull/3388) [TECH] Réutiliser le champ résultat pour une campagne de collecte de profils dans l'onglet 'Résultat' (PIX-3064).
- [#3384](https://github.com/1024pix/pix/pull/3384) [TECH] Ajouter des tests pour la partie logique de l'application Pix Load-Testing (PIX-3080).
- [#3369](https://github.com/1024pix/pix/pull/3369) [CLEAN] Remplacement des boutons du challenge en PixButton (PIX-1210).

## v3.91.0 (24/08/2021)

- [#3354](https://github.com/1024pix/pix/pull/3354) [FEATURE] Nouveau panneau dans le didacticiel (PIX-2898).
- [#3377](https://github.com/1024pix/pix/pull/3377) [FEATURE] Utiliser la valeur du résultat stocké en BDD du participant dans la page détail (PIX-2996)
- [#3386](https://github.com/1024pix/pix/pull/3386) [FEATURE] Résolution automatique des signalement concernant les épreuves chronométrées et temps majoré (PIX-3002)
- [#3371](https://github.com/1024pix/pix/pull/3371) [FEATURE] Suppression de l'overlay et des alertes sur les épreuves focus déjà répondues (PIX-3005).
- [#3366](https://github.com/1024pix/pix/pull/3366) [FEATURE] Récupérer si besoin l'identifiant externe de la participation précédente pour les campagnes à envois multiples (PIX-2675).
- [#3373](https://github.com/1024pix/pix/pull/3373) [FEATURE][A11Y] Avoir une sémantique html correcte sur la page "Liste des campagnes" (PIX-3054).
- [#3374](https://github.com/1024pix/pix/pull/3374) [BUGFIX]  Afficher un encart "en attente de résultats" dans l'onglet analyse individuelle quand la personne n'a pas encore partagé ses résultats (PIX-3067).
- [#3378](https://github.com/1024pix/pix/pull/3378) [TECH] Supprime les setups de test dans le describe (pix-3378)
- [#3375](https://github.com/1024pix/pix/pull/3375) [TECH] Ajout du statut de l'assessment au certificationReport (PIX-3061)
- [#3385](https://github.com/1024pix/pix/pull/3385) [TECH] Rendre configurable la liste d'origines des embed autorisés
- [#3202](https://github.com/1024pix/pix/pull/3202) [TECH] Mettre à jour les paquets de Pix App (PIX-2836).

## v3.90.0 (23/08/2021)

- [#3359](https://github.com/1024pix/pix/pull/3359) [FEATURE] Annuler une certification si taux de réponse < 33% (PIX-3046)
- [#3346](https://github.com/1024pix/pix/pull/3346) [FEATURE] Ne pas afficher l'encart "Repasser" lorsque l'élève/étudiant est désactivé (PIX-2991).
- [#3363](https://github.com/1024pix/pix/pull/3363) [BUGFIX] Corriger le scenario actuel de tests de charge (PIX-3048).
- [#3376](https://github.com/1024pix/pix/pull/3376) [TECH] Mettre l'annulation via taux de réponse sous toggle (PIX-3077)
- [#3352](https://github.com/1024pix/pix/pull/3352) [TECH] Monitorer les queries Knex avec l'id de corrélation de Hapi JS, un compteur par appel API et une durée d'exécution (PIX-3044).
- [#3372](https://github.com/1024pix/pix/pull/3372) [TECH] Exécuter les tests de charge à partir de Scalingo (PIX-3053).
- [#3368](https://github.com/1024pix/pix/pull/3368) [TECH] Ajout du feature toggle pour la gestion des certifications non complétées (PIX-3060)
- [#3345](https://github.com/1024pix/pix/pull/3345) [TECH] Aligner Pix Orga avec les composants Pix UI
- [#3357](https://github.com/1024pix/pix/pull/3357) [TECH] Migrer la colonne knowledge_elements.id de INTEGER en BIG INTEGER (partie 1).
- [#3360](https://github.com/1024pix/pix/pull/3360) [TECH] Utiliser la version de node applicatif au lieu de la version de node embarquée par Cypress dans les tests E2E (PIX-3050).
- [#3362](https://github.com/1024pix/pix/pull/3362) [CLEAN] Ne pas remonter les answers en doublon (PIX-2801).
- [#3355](https://github.com/1024pix/pix/pull/3355) [CLEAN] Utiliser le numéro d'épreuve pour la barre de progression (PIX-3049).

## v3.89.0 (19/08/2021)

- [#3347](https://github.com/1024pix/pix/pull/3347) [FEATURE] Mettre les focus sur les autres type d'épreuves (PIX-2876).
- [#3300](https://github.com/1024pix/pix/pull/3300) [BUGFIX] Ne pas utiliser les traitements t1,t2,t3 pour les menu déroulants (PIX-2926).
- [#3310](https://github.com/1024pix/pix/pull/3310) [TECH] Utiliser les règles de lint mocha recommandées pour nos tests API (PIX-2974).

## v3.88.0 (19/08/2021)

- [#3348](https://github.com/1024pix/pix/pull/3348) [FEATURE] Permettre le filtre par classe sur la liste des élèves SCO (PIX-2026).
- [#3329](https://github.com/1024pix/pix/pull/3329) [FEATURE] Ajout d'une colonne filtrable "Identifiant externe" dans la liste de "Toutes les sessions" dans Pix Admin (PIX-2647)
- [#3333](https://github.com/1024pix/pix/pull/3333) [FEATURE] Ajout scroll sur la modale d'édition de candidat sur Pix-Admin (PIX-2980)
- [#3340](https://github.com/1024pix/pix/pull/3340) [FEATURE] Afficher la classe dans la liste des élèves SCO (PIX-2949).
- [#3337](https://github.com/1024pix/pix/pull/3337) [FEATURE] Rendre impossible la réconciliation SUP lorsque l'étudiant est désactivé (PIX-2864).
- [#3332](https://github.com/1024pix/pix/pull/3332) [FEATURE] Ne pas afficher de conseils/tooltips pour les épreuves hors focus (PIX-2899).
- [#3351](https://github.com/1024pix/pix/pull/3351) [BUGFIX] Garder les caractères spéciaux des noms/prénoms dans l'attestation de résultat (PIX-2992)
- [#3341](https://github.com/1024pix/pix/pull/3341) [BUGFIX] Corriger la version anglaise du message d'erreur d'expiration d'authentication (PIX-2990).
- [#3339](https://github.com/1024pix/pix/pull/3339) [BUGFIX] Eviter qu'un même assessment possède deux réponses pour une même épreuve (PIX-2761).
- [#3350](https://github.com/1024pix/pix/pull/3350) [BUGFIX] Mettre à jour le scénario des tests de charge pour une exécution locale (PIX-3043).
- [#3353](https://github.com/1024pix/pix/pull/3353) [TECH] Merger les services de scoring de certification (PIX-3047).
- [#3153](https://github.com/1024pix/pix/pull/3153) [TECH] Ajouter des helpers custom Chai pour tester à la fois les types et les contenus des objets en un appel (PIX-2768)
- [#3336](https://github.com/1024pix/pix/pull/3336) [TECH] Mettre en cohérence l'URL du support 
- [#3331](https://github.com/1024pix/pix/pull/3331) [SCRIPT] Ajouter la colonne "createdBy" dans le script de création des organisations PRO (PIX-3009).

## v3.87.0 (17/08/2021)

- [#3334](https://github.com/1024pix/pix/pull/3334) [FEATURE] Supprimer le modèle d'import et l'explication des imports pour les orga AGRI SCO (PIX-2952).
- [#3304](https://github.com/1024pix/pix/pull/3304) [FEATURE] Rendre la certification CléA fonctionnelle avec le nouveau RT prévu pour la rentrée (PIX-2956)
- [#3324](https://github.com/1024pix/pix/pull/3324) [FEATURE] Rattacher les organisations d'un profil cible existant depuis Pix Admin (PIX-2976).
- [#3326](https://github.com/1024pix/pix/pull/3326) [FEATURE] Adapter les courbes des participations pour qu'elles aillent jusqu'à la date de fin (PIX-2978)
- [#3328](https://github.com/1024pix/pix/pull/3328) [FEATURE] Modifications du nom de fichier du PDF des attestations de certif (PIX-3003)
- [#3325](https://github.com/1024pix/pix/pull/3325) [FEATURE] Voir le commentaire du jury sur une certif dans le fichier des résultats (PIX-996)
- [#3323](https://github.com/1024pix/pix/pull/3323) [FEATURE] Ne plus gérer spécifiquement le statut AP lors de l'import d'une liste d'élève (PIX-2951)
- [#3327](https://github.com/1024pix/pix/pull/3327) [BUGFIX] Empêcher l'erreur 500 quand la clé des jetons Pôle-emploi expire (PIX-2990).
- [#3335](https://github.com/1024pix/pix/pull/3335) [TECH] Mettre à jour les dépendances des tests de charge (PIX-3037).
- [#3330](https://github.com/1024pix/pix/pull/3330) [TECH] Retirer la génération lazy de code de vérification lors de la récupération du certificat utilisateur (PIX-3008)
- [#3301](https://github.com/1024pix/pix/pull/3301) [TECH] Créer un script pour calculer les résultats des participations (PIX-2896).
- [#3315](https://github.com/1024pix/pix/pull/3315) [TECH] Grouper les composants d'affichage spécifique dans Pix Orga (PIX-2993)
- [#3210](https://github.com/1024pix/pix/pull/3210) [DOC] Formater les templates Ember (hbs).

## v3.86.0 (13/08/2021)

- [#3319](https://github.com/1024pix/pix/pull/3319) [FEATURE] Retravailler le visuel du message quand on sort d'une épreuve focus (PIX-2875).
- [#3320](https://github.com/1024pix/pix/pull/3320) [FEATURE] Retravailler le visuel de message de sortie de panneau d'épreuve focus (PIX-2871).
- [#3308](https://github.com/1024pix/pix/pull/3308) [FEATURE] Permettre de remplacer tous les étudiants inscrits pour une organisation SUP (PIX-2948).
- [#3274](https://github.com/1024pix/pix/pull/3274) [FEATURE] Affichage de l'infobulle des épreuves focus au survol (PIX-2909).
- [#3312](https://github.com/1024pix/pix/pull/3312) [FEATURE] Enregistrer l'identifiant du Pix Master lors de la création d'une organisation dans Pix Admin (PIX-2725).
- [#3322](https://github.com/1024pix/pix/pull/3322) [TECH] Faire un quick start et mettre à jour la doc de test-algo.
- [#3317](https://github.com/1024pix/pix/pull/3317) [TECH] Supression du resultCompetenceTree service partie 2 (PIX-2972)
- [#3313](https://github.com/1024pix/pix/pull/3313) [TECH] Supression du resultCompetenceTree service partie 1 (PIX-2971)
- [#3318](https://github.com/1024pix/pix/pull/3318) [TECH] Prévenir les traces incomplètes sur l'utilisateur de récupération de compte SCO  (PIX-2986).
- [#3305](https://github.com/1024pix/pix/pull/3305) [TECH] Sortir TimedChallengeInstructions de tous les types de challenges.

## v3.85.0 (12/08/2021)

- [#3299](https://github.com/1024pix/pix/pull/3299) [FEATURE] Calcul des résultats d'une participation au partage (PIX-2895)
- [#3282](https://github.com/1024pix/pix/pull/3282) [FEATURE] Permettre de modifier une campagne depuis Pix Admin (PIX-2885)
- [#3303](https://github.com/1024pix/pix/pull/3303) [FEATURE] Brancher le bouton de téléchargement des attestations de certification sur Pix Orga (PIX-2941)
- [#3321](https://github.com/1024pix/pix/pull/3321) [BUGFIX] Correction de tests flaky et bugs sur la navbar Pix Orga
- [#3314](https://github.com/1024pix/pix/pull/3314) [TECH] Modifier le composant de détail d'une campagne dans Pix Orga (PIX-2984)
- [#3296](https://github.com/1024pix/pix/pull/3296) [TECH] Permettre de pouvoir visualiser les résultats d'Algolix (PIX-2072). 
- [#3309](https://github.com/1024pix/pix/pull/3309) [TECH] Prévenir les traces incomplètes de récupération de compte SCO (PIX-2973).
- [#3307](https://github.com/1024pix/pix/pull/3307) [TECH] Modifier les composants de la liste des campagnes de profils dans Pix Orga (PIX-2969)
- [#3306](https://github.com/1024pix/pix/pull/3306) [TECH] Modifier les composants du header de la page de campagne dans Pix Orga (PIX-2965)

## v3.84.0 (10/08/2021)

- [#3290](https://github.com/1024pix/pix/pull/3290) [FEATURE] Créer la route de récupération des attestations par classe (PIX-2940)
- [#3297](https://github.com/1024pix/pix/pull/3297) [FEATURE] Afficher qu'un compte existe deja lorsque l'adresse e-mail est deja utilise (PIX-2914).
- [#3294](https://github.com/1024pix/pix/pull/3294) [FEATURE] Réactiver les schooling registration disabled à l'import SUP (PIX-2856)
- [#3291](https://github.com/1024pix/pix/pull/3291) [FEATURE] Ajout des options de sélections sur les épreuves QROC (PIX-2924).
- [#3288](https://github.com/1024pix/pix/pull/3288) [FEATURE] Permettre de sortir dans un fichier csv les résultats d'algolix (PIX-2070). 
- [#3246](https://github.com/1024pix/pix/pull/3246) [FEATURE] Générer les codes de verification à la création de certification et ajout d'un script en production pour rétro-générer des codes de vérification (PIX-2918)
- [#3302](https://github.com/1024pix/pix/pull/3302) [BUGFIX] Connecter l'utilisateur à la fin du processus de récupération compte SCO (PIX-2954).
- [#3298](https://github.com/1024pix/pix/pull/3298) [BUGFIX] Corriger l'affichage de la date d'achèvement d'une certification dans Pix Admin (PIX-147).
- [#3295](https://github.com/1024pix/pix/pull/3295) [BUGFIX] Désactiver le bouton "Je me connecte" après avoir cliqué dessus durant la récupération compte SCO (PIX-2950).
- [#3283](https://github.com/1024pix/pix/pull/3283) [TECH] Rendre Pix Orga un minimum responsive (PIX-2943)
- [#3255](https://github.com/1024pix/pix/pull/3255) [DOC] Expliciter la création des instances de la BDD locale.
- [#3276](https://github.com/1024pix/pix/pull/3276) [DOC] Expliciter la configuration du cache. 

## v3.83.0 (06/08/2021)

- [#3293](https://github.com/1024pix/pix/pull/3293) [FEATURE] Déplacer le filtre "Afficher uniquement mes sessions" de l'onglet "Toutes les sessions" vers l'onglet "Sessions à traiter" dans Pix Admin (PIX-2360).
- [#3267](https://github.com/1024pix/pix/pull/3267) [FEATURE] Ne plus afficher l'infobulle si l'utilisateur l'a déjà vue (PIX-2878).
- [#3280](https://github.com/1024pix/pix/pull/3280) [FEATURE] Demander à l'utilisateur de valider les CGU pour récupérer compte SCO (PIX-2916).
- [#3285](https://github.com/1024pix/pix/pull/3285) [FEATURE] Demander a l'utilisateur d'attester sur l'honneur d'appartenance du compte (PIX-2787).
- [#3292](https://github.com/1024pix/pix/pull/3292) [BUGFIX] Désactiver le bouton "C'est parti" après avoir cliqué dessus durant la récupération compte SCO (PIX-2917).
- [#3286](https://github.com/1024pix/pix/pull/3286) [BUGFIX] Réinitialiser le champ ville lorsque l'on veut modifier un candidat dans Pix Admin dont l'inscription a été effectué par code Insee (PIX-2937).

## v3.82.0 (05/08/2021)

- [#3284](https://github.com/1024pix/pix/pull/3284) [FEATURE] Ajout de la carte du palier moyen d'une campagne d'évaluation (PIX-2890)
- [#3278](https://github.com/1024pix/pix/pull/3278) [FEATURE] Ajouter une page d'import des étudiants pour les organisations SUP (Pix-2874).
- [#3277](https://github.com/1024pix/pix/pull/3277) [FEATURE] Empêcher un élève de se réconcilier si sa schooling registration a été désactivée (PIX-2863)
- [#3281](https://github.com/1024pix/pix/pull/3281) [FEATURE] Ne plus proposer la première ligne du select sur les épreuves à menu déroulant (PIX-2925).
- [#3254](https://github.com/1024pix/pix/pull/3254) [FEATURE] Un utilisateur désactivé ne peut rejoindre une campagne (PIX-2862)
- [#3289](https://github.com/1024pix/pix/pull/3289) [BUGFIX] Changer certaines phrases du parcours de la sortie SCO (PIX-2821).
- [#3287](https://github.com/1024pix/pix/pull/3287) [BUGFIX] Changer le message d'assistance sur la page d'erreur de la sortie SCO (PIX-2935).
- [#3270](https://github.com/1024pix/pix/pull/3270) [BUGFIX] Le lien "Continuez votre expérience sur Pix" à la fin d'une campagne ne redirige plus vers la page d'accueil  (PIX-2915).
- [#3279](https://github.com/1024pix/pix/pull/3279) [BUGFIX] Enregistrer la ville fournie lors de l'inscription d'un candidat avec un code postal de lieu de naissance (PIX-2933).
- [#3252](https://github.com/1024pix/pix/pull/3252) [TECH] Améliorer le service de génération des attestations de certification PDF pour qu'il puisse prendre en entrée plusieurs attestations (PIX-2893)
- [#3275](https://github.com/1024pix/pix/pull/3275) [TECH] Ajout d'une méthode pour récupérer toutes les informations nécessaires à la création d'attestations de certification pour une classe SCO (PIX-2904)

## v3.81.0 (04/08/2021)

- [#3269](https://github.com/1024pix/pix/pull/3269) [FEATURE] Améliorer l'affichage des erreurs lors de la récupération de compte suite à la sortie SCO (PIX-2851)
- [#3273](https://github.com/1024pix/pix/pull/3273) [FEATURE] Ajouter un lien permettant d'accéder au détail d'un utilisateur depuis la page de détail d'une certification dans Pix Admin (PIX-2920).
- [#3151](https://github.com/1024pix/pix/pull/3151) [FEATURE] Choix de réponse avec un menu déroulant dans une épreuve (PIX-2262).
- [#3266](https://github.com/1024pix/pix/pull/3266) [FEATURE] Permettre l'édition de données CPF dans la modale d'édition des informations Candidat dans PixAdmin (PIX-2840)
- [#3256](https://github.com/1024pix/pix/pull/3256) [FEATURE] Ajout d'une tooltip à l'arrivée d'une épreuve focus (PIX-2870).
- [#3262](https://github.com/1024pix/pix/pull/3262) [BUGFIX] Sur la page de fin de campagne, afficher uniquement les badges gagnés durant celle-ci (PIX-2705)
- [#3245](https://github.com/1024pix/pix/pull/3245) [DOC] Expliciter la configuration BDD.
- [#3222](https://github.com/1024pix/pix/pull/3222)  [FEATURE] Ajout des 2 cartes sur les résultats dans l'onglet résultats sur Pix Orga (PIX-2825).
- [#3272](https://github.com/1024pix/pix/pull/3272) [CLEAN] Refacto du proposal as blocks.

## v3.80.0 (02/08/2021)

- [#3257](https://github.com/1024pix/pix/pull/3257) [FEATURE][A11Y] Permettre la navigation au clavier dans la liste des sessions (PIX-2691)
- [#3263](https://github.com/1024pix/pix/pull/3263) [FEATURE] Ne permettre qu'une seule récupération de compte SCO - API (PIX-2911).
- [#3261](https://github.com/1024pix/pix/pull/3261) [FEATURE] Mettre en page la récupération d'un compte SCO (PIX-2903).
- [#3187](https://github.com/1024pix/pix/pull/3187) [FEATURE] Ajout du filtre classe sur la page Activité pour les organisations SCO (PIX-2670).
- [#3265](https://github.com/1024pix/pix/pull/3265) [TECH] Modifier les composants génériques d'UI dans Pix Orga (PIX-2913)
- [#3259](https://github.com/1024pix/pix/pull/3259) [TECH] Modifier les composants de participation à une campagne de profil dans Pix Orga (PIX-2910)
- [#3258](https://github.com/1024pix/pix/pull/3258) [TECH] Modifier les composants de participation à une campagne d'eval dans Pix Orga (PIX-2908)
- [#3204](https://github.com/1024pix/pix/pull/3204) [CLEANUP] Utilise le nom de domaine images.pix.fr

## v3.79.0 (30/07/2021)

- [#3216](https://github.com/1024pix/pix/pull/3216) [FEATURE] Choisir un mot de passe lors de la récupération d'un compte SCO (PIX-2740). 
- [#3243](https://github.com/1024pix/pix/pull/3243) [FEATURE] Afficher les schooling registrations actives dans la liste des élèves (PIX-2859)
- [#3242](https://github.com/1024pix/pix/pull/3242) [FEATURE] Désactiver les schooling registrations à l'import des élèves (SCO) (PIX-2854)
- [#3241](https://github.com/1024pix/pix/pull/3241) [FEATURE] Permettre d'accéder à la page "Résultats d'un participant à une campagne de collecte de profils" au clavier(PIX-2635)
- [#3244](https://github.com/1024pix/pix/pull/3244) [FEATURE] Permettre accéder à la page "Résultats d'un participant à une campagne d'évaluation" au clavier (PIX-2634)
- [#3250](https://github.com/1024pix/pix/pull/3250) [FEATURE] Mettre à jour le libellé du destinataire des résultats dans le tableau des candidats inscrits à une session de certification (PIX-2901).
- [#3247](https://github.com/1024pix/pix/pull/3247) [FEATURE] Déplacer l'édition des informations Candidat dans une modale dédiée dans PixAdmin (PIX-2839)
- [#3251](https://github.com/1024pix/pix/pull/3251) [TECH] Modifier l'organisation des composants d'authentification dans Pix Orga (PIX-2902)
- [#3248](https://github.com/1024pix/pix/pull/3248) [TECH] Réorganisation des composants relatifs à la finalisation de session sur PixCertif (PIX-2900)

## v3.78.0 (28/07/2021)

- [#3230](https://github.com/1024pix/pix/pull/3230) [FEATURE] Accepter une correspondance approximative sur un utilisateur lors de la sortie SCO (PIX-2758).
- [#3240](https://github.com/1024pix/pix/pull/3240) [FEATURE] Supprimer l'écran intermédiaire des épreuves focus (PIX-2889).
- [#3139](https://github.com/1024pix/pix/pull/3139) [FEATURE] Ajout de nouveaux marqueurs visuels aux challenges : épreuve focus (PIX-2755).
- [#3233](https://github.com/1024pix/pix/pull/3233) [FEATURE] Permettre de lancer plusieurs utilisateurs en même temps sur Algolix (PIX-2069).
- [#3213](https://github.com/1024pix/pix/pull/3213) [FEATURE] Afficher les informations CPF dans PixAdmin (PIX-2838)
- [#3238](https://github.com/1024pix/pix/pull/3238) [FEATURE] Etre plus tolérant sur la vérification des noms / prénoms dans le formulaire d'entrée en certification sur PixApp (PIX-2630)
- [#3237](https://github.com/1024pix/pix/pull/3237) [FEATURE] Afficher la réponse apportée par le candidat dans l'encart d'épreuve sur la page de détails d'une certification dans PixAdmin (PIX-2887)
- [#3235](https://github.com/1024pix/pix/pull/3235) [BUGFIX]Changer le wording et la couleurs des tags dans la liste des participants dans la page Activité(PIX-2872)
- [#3236](https://github.com/1024pix/pix/pull/3236) [TECH] Refacto autour du certification-result-service (PIX-2886)
- [#3179](https://github.com/1024pix/pix/pull/3179) [TECH] Modifier l'organisation des composants d'élèves dans Pix Orga (PIX-2881)
- [#3214](https://github.com/1024pix/pix/pull/3214) [INFRA] Ajouter des helpers de tests getByLabel et queryByLabel

## v3.77.0 (26/07/2021)

- [#3219](https://github.com/1024pix/pix/pull/3219) [FEATURE] Afficher un message générique quand aucun participant n'a rejoint la campagne (PIX-2671).
- [#3234](https://github.com/1024pix/pix/pull/3234) [FEATURE] Affichage de l'onglet "Activité" pour les campagnes de collecte de profils (PIX-2772).
- [#3217](https://github.com/1024pix/pix/pull/3217) [FEATURE] Séparer l'édition des informations candidat du reste sur la page dans PixAdmin (PIX-2837)
- [#3218](https://github.com/1024pix/pix/pull/3218) [FEATURE] Pour les campagne de collecte de profils, toujours afficher la date de création et le nom de la personne qui a créé la campagne (Pix-2822)
- [#3150](https://github.com/1024pix/pix/pull/3150) [FEATURE] Ajouter l'onglet activité sur la page des campagnes d'évaluation (PIX-2664).
- [#3224](https://github.com/1024pix/pix/pull/3224) [TECH] Suppression de routes dépréciées et/ou inutilisées.
- [#3232](https://github.com/1024pix/pix/pull/3232) [TECH] Supprimer la table "autojury-script-audit" (PIX-2744).
- [#3229](https://github.com/1024pix/pix/pull/3229) [CLEANUP] Téléchargement des attestations : refactoring préparatoire à la génération de n attestations dans le même fichier (PIX-2868)

## v3.76.0 (22/07/2021)

- [#3203](https://github.com/1024pix/pix/pull/3203) [FEATURE] Ajout du paramètre enErreur pour la récupération des résultats à la campagne Pôle emploi (PIX-2684).
- [#3201](https://github.com/1024pix/pix/pull/3201) [FEATURE] Empêcher l'usurpation d'identité lors de la récupération de compte SCO (PIX-2811).
- [#3185](https://github.com/1024pix/pix/pull/3185) [FEATURE] Avoir une image par défaut sur les paliers (PIX-2769).
- [#3195](https://github.com/1024pix/pix/pull/3195) [FEATURE] Rendre le délai d'expiration de la demande de récupération SCO paramétrable (PIX-2827).
- [#3212](https://github.com/1024pix/pix/pull/3212) [FEATURE] Téléchargement des attestations par classe : mise en place du feature toggle (PIX-2842)
- [#3209](https://github.com/1024pix/pix/pull/3209) [FEATURE] Mise à jour de l'import de candidat à une session de certification (PIX-2719)
- [#3228](https://github.com/1024pix/pix/pull/3228) [BUGFIX] Isoler la création de données de tests pour que les données n'altèrent pas d'autres tests (PIX-2867).
- [#3220](https://github.com/1024pix/pix/pull/3220) [BUGFIX] Changer le wording de la tooltip pour la carte total participant de l'onglet activité (PIX-2850)
- [#3225](https://github.com/1024pix/pix/pull/3225) [BUGFIX] Corriger le script d'import des villes (PIX-2857).
- [#3211](https://github.com/1024pix/pix/pull/3211) [BUGFIX] Corriger certaines régressions suite au développement CPF (PIX-2628).
- [#3200](https://github.com/1024pix/pix/pull/3200) [BUGFIX] Permettre l'envoi du formulaire d'ajout de candidat sous IE (PIX-2834)
- [#3221](https://github.com/1024pix/pix/pull/3221) [TECH] Améliorer la traduction de "délai d'expiration".
- [#3208](https://github.com/1024pix/pix/pull/3208) [TECH] Ameliorer l'affichage d'erreur sur le scoring (PIX-2808)
- [#3205](https://github.com/1024pix/pix/pull/3205) [CLEANUP] Lancer eslint sur high-level-tests/{test-algo,e2e}

## v3.75.0 (19/07/2021)

- [#3188](https://github.com/1024pix/pix/pull/3188) [FEATURE] Afficher la date de création et le créateur pour une campagne d'évaluation (PIX-2741).
- [#3193](https://github.com/1024pix/pix/pull/3193) [FEATURE] Ajouter dans la liste des paliers la présence du titre et de la description du prescripteur (PIX-2831).
- [#3196](https://github.com/1024pix/pix/pull/3196) [BUGFIX] Permettre la sauvegarde d'un assessment result annulé (PIX-2835)
- [#3194](https://github.com/1024pix/pix/pull/3194) [BUGFIX] Importer un fichier ods d'import avec des candidats ajoutés manuellement ne fonctionne pas (PIX-2830)
- [#3197](https://github.com/1024pix/pix/pull/3197) [TECH] Arrêter d'utiliser l'Orm-model Bookshelf Answer (PIX-2833)
- [#3189](https://github.com/1024pix/pix/pull/3189) [TECH] Utiliser la version mineure 12.7 de BDD PostgreSQL .
- [#3199](https://github.com/1024pix/pix/pull/3199) [TECH] Déplace le fichier SECURITY.md a la racine
- [#3183](https://github.com/1024pix/pix/pull/3183) [TECH] Utiliser la version 14.17.0 de Node au lieu de 14.16.0. 

## v3.74.0 (16/07/2021)

- [#3180](https://github.com/1024pix/pix/pull/3180) [FEATURE] Vérification des informations de naissance lors de l'ajout d'un candidat à une session de certification (PIX-2715)
- [#3176](https://github.com/1024pix/pix/pull/3176) [FEATURE] Vérifier la demande de récupération de compte - Sortie SCO (PIX-2774).
- [#3178](https://github.com/1024pix/pix/pull/3178) [FEATURE] Afficher des tirets sur les champs vides de la modale d'affichage des détails d'un candidat (PIX-2757)
- [#3191](https://github.com/1024pix/pix/pull/3191) [BUGFIX] La liste des pays retournée par l'API était incomplète et côté Front certains pays étaient dans le désordre (PIX-2824)
- [#3190](https://github.com/1024pix/pix/pull/3190) [BUGFIX] Certains pays sont importés deux fois lors de l'import CPF des pays depuis le fichier INSEE (PIX-2823)
- [#3186](https://github.com/1024pix/pix/pull/3186) [BUGFIX] Permettre l'envoi du formulaire d'ajout de candidat sous Firefox (PIX-2818)
- [#3182](https://github.com/1024pix/pix/pull/3182) [BUGFIX] Aligner le bouton d'envoi des résultats avec le contenu de la page (PIX-2804)
- [#3184](https://github.com/1024pix/pix/pull/3184) [BUGFIX] Sélectionner la France par défaut lors de l'ajout d'un candidat (PIX-2817)
- [#3181](https://github.com/1024pix/pix/pull/3181) [BUGFIX] Gérer le cas de deux QROCM-dep pour une seule compétence (PIX-2793)
- [#3192](https://github.com/1024pix/pix/pull/3192) [TECH] Garantir l'unicité de la temporaryKey dans la récupération de compte SCO.
- [#3162](https://github.com/1024pix/pix/pull/3162) [BUGFIX/CLEANUP] Restreindre la modification du CertificationCourse aux seuls : nom, prénom et date/lieu de naissance (PIX-2702)

## v3.73.0 (13/07/2021)

- [#3175](https://github.com/1024pix/pix/pull/3175) [FEATURE] Envoyer un mail pour la récupération de compte - Sortie SCO (PIX-2735). 
- [#3172](https://github.com/1024pix/pix/pull/3172) [FEATURE] Création d'un curseur et ajout de celui-ci dans la réponse lors des envois des résultats P-E (PIX-2743)
- [#3160](https://github.com/1024pix/pix/pull/3160) [FEATURE] Ajouter une modale d'inscription d'un nouveau candidat (PIX-2713)
- [#3167](https://github.com/1024pix/pix/pull/3167) [FEATURE] Mettre en page la récupération d'un compte SCO (PIX-2773).
- [#3148](https://github.com/1024pix/pix/pull/3148) [BUGFIX] Ne pas sauvegarder deux fois un même badge pour un même user dans une campagne (PIX-2704).
- [#3161](https://github.com/1024pix/pix/pull/3161) [TECH] Ajout du linter de tests qunit sur certif
- [#3168](https://github.com/1024pix/pix/pull/3168) [TECH] Gère la redéfinition de l'extension de knex QueryBuilder pour les tests en mode watch
- [#3157](https://github.com/1024pix/pix/pull/3157) [TECH] Supprimer les mixins d'Ember-simple-auth 3.1.0 dans Pix Orga (PIX-2767).
- [#3154](https://github.com/1024pix/pix/pull/3154) [TECH] Ne pas filtrer le html contenu dans la consigne d'une épreuve lors de son affichage lors du checkpoint.
- [#3174](https://github.com/1024pix/pix/pull/3174) [TECH] Ajouter les top level domains .fr et .org aux domaines locaux
- [#2726](https://github.com/1024pix/pix/pull/2726) [TECH] Automatiser la création des domaines locaux pour le développement
- [#3177](https://github.com/1024pix/pix/pull/3177) [SECU] Ajout de fichier SECURITY.md 
- [#3158](https://github.com/1024pix/pix/pull/3158)  [TECH] Ajout du linter de tests qunit sur admin
- [#3145](https://github.com/1024pix/pix/pull/3145) [DOC] Proposition d'ADR pour remplacer l'usage de l'ORM BookshelfJS en faveur du query-builder KnexJS

## v3.72.0 (07/07/2021)

- [#3164](https://github.com/1024pix/pix/pull/3164) [FEATURE] Modifier les valeurs possibles pour la colonne "Code sexe*" de l'import Fregata (PIX-2699).
- [#3171](https://github.com/1024pix/pix/pull/3171) [FEATURE] Créer la table account-recovery-demands (PIX-2777).
- [#3159](https://github.com/1024pix/pix/pull/3159) [FEATURE] Améliorer l'accessibilité des libellés du menu de Pix Certif (PIX-2690)
- [#3155](https://github.com/1024pix/pix/pull/3155) [FEATURE] Ajouter l'étape de la récupération de l'e-mail dans le parcours de récupération de compte (PIX-2738).
- [#3127](https://github.com/1024pix/pix/pull/3127) [FEATURE] Valider les données de pays et villes saisis lors de l'inscription d'un candidat à une session de certification (PIX-2657).
- [#3146](https://github.com/1024pix/pix/pull/3146) [TECH] Contrôler INE et INA dans l'API lors de la récupération SCO.
- [#3169](https://github.com/1024pix/pix/pull/3169) [TECH] Modifier l'organisation des composants d'équipe dans Pix Orga (PIX-2776)
- [#3156](https://github.com/1024pix/pix/pull/3156) [TECH] Modifier l'organisation des composants de campagne dans Pix Orga (PIX-2775)
- [#3165](https://github.com/1024pix/pix/pull/3165) [TECH] Autorise les champs t1, t2, t3 status a être des boolean
- [#3149](https://github.com/1024pix/pix/pull/3149) [TECH] Surcharger Ember simple auth session dans Pix-Admin (PIX-2766).
- [#3163](https://github.com/1024pix/pix/pull/3163) [CLEANUP] Corriger les typos dans sample.env

## v3.71.0 (02/07/2021)

- [#3142](https://github.com/1024pix/pix/pull/3142) [FEATURE] Simplifier la liste des candidats (PIX-2714)
- [#3152](https://github.com/1024pix/pix/pull/3152) [FEATURE] Ajouter l'étape de confirmation dans la récupération de compte (PIX-2732).
- [#3110](https://github.com/1024pix/pix/pull/3110) [FEATURE] Création de la liste des participants dans l'onglet activité (PIX-2665)
- [#3144](https://github.com/1024pix/pix/pull/3144) [FEATURE] Ajout de l'étape de conflit lors de la récupération de compte à la sortie du SCO (PIX-2730).
- [#3130](https://github.com/1024pix/pix/pull/3130) [FEATURE][A11Y] Rendre accessible la liste des campagnes sur Pix Orga (PIX-2633)
- [#3137](https://github.com/1024pix/pix/pull/3137) [FEATURE] Détail des campagnes dans Pix Admin (PIX-2643)
- [#3141](https://github.com/1024pix/pix/pull/3141) [FEATURE] Modifier le texte des cgu dans la page d'inscription sur Pix App (PIX-2753).
- [#3138](https://github.com/1024pix/pix/pull/3138) [BUGFIX] Le compteur "Nombre de certifications non terminées" sur la page d'information d'une session est incorrect sur PixAdmin (PIX-2723)
- [#3133](https://github.com/1024pix/pix/pull/3133) [TECH] Permettre a PE de récupérer les résultats(PIX-2682)
- [#3109](https://github.com/1024pix/pix/pull/3109) [TECH] Remplacer BookshelfJS par le query-builder KnexJS dans le answer-repository (PIX-2742)
- [#3143](https://github.com/1024pix/pix/pull/3143) [TECH] Ajout du linter de tests qunit sur orga
- [#3140](https://github.com/1024pix/pix/pull/3140) [TECH] Supprimer les mixins d'Ember-simple-auth 3.1.0 dans Pix Certif (PIX-2759).

## v3.70.0 (28/06/2021)

- [#3128](https://github.com/1024pix/pix/pull/3128) [FEATURE] Récupérer son compte lors de la sortie du SCO - Partie 1 (PIX-2750).
- [#3136](https://github.com/1024pix/pix/pull/3136) [FEATURE] Ajouter la route pour récupérer les pays et leur code INSEE associé (PIX-2756)
- [#3135](https://github.com/1024pix/pix/pull/3135) [FEATURE] Affichage d'indicateurs montrant le nombre de participants total et le nombre de résultats reçus dans la page Activité de Pix Orga (Pix-2668).
- [#3123](https://github.com/1024pix/pix/pull/3123) [FEATURE] Activer inconditionnellement la connexion PE (PIX-2752).
- [#3126](https://github.com/1024pix/pix/pull/3126) [FEATURE] Ajouter des retours sur nos test d'algo (PIX-2065).
- [#3111](https://github.com/1024pix/pix/pull/3111) [FEATURE] Ajout du graphe d'activité des participants (PIX-2666)
- [#3119](https://github.com/1024pix/pix/pull/3119) [FEATURE] Modifier bouton vert de l'écran intermédiaire (PIX-2701).
- [#3125](https://github.com/1024pix/pix/pull/3125) [BUGFIX] Corriger les soucis d'affichage des boutons dans Pix App suite à une montée de version de Pix-UI
- [#3118](https://github.com/1024pix/pix/pull/3118) [BUGFIX] Redirection en début de parcours lorsque j'essaie d'accéder à la page de résultats sans avoir de participation(Pix-2739).
- [#3113](https://github.com/1024pix/pix/pull/3113) [TECH] Bump ember-simple-auth de 3.0.1 à 3.1.0 dans Pix Admin (PIX-2450).
- [#3112](https://github.com/1024pix/pix/pull/3112) [CLEAN] N'utiliser que deux critères de Badges au lieu de trois critères (PIX-2707).

## v3.69.0 (24/06/2021)

- [#3117](https://github.com/1024pix/pix/pull/3117) [FEATURE] Gérer les épreuves "Focus" (PIX-2617).
- [#3134](https://github.com/1024pix/pix/pull/3134) [FEATURE] Améliorations CléA mineures
- [#3101](https://github.com/1024pix/pix/pull/3101) [FEATURE]  Ajouter une modale de détails à la liste des candidats d'une session de certification (PIX-2712)
- [#3102](https://github.com/1024pix/pix/pull/3102) [FEATURE] Ajout de scripts d'import des villes et pays depuis des csv (PIX-2722)
- [#3121](https://github.com/1024pix/pix/pull/3121) [BUGFIX] Une erreur lors du re-scoring d'une certification après une finalisation de session pouvait ne pas être pris en compte dans l'évaluation de la session comme étant directement publiable ou pas (PIX-2751)
- [#3124](https://github.com/1024pix/pix/pull/3124) [TECH] Exposer les domaines Pix-app sur les PR/RA.
- [#3122](https://github.com/1024pix/pix/pull/3122) [TECH] Supprimer le cache d'authentification plus utilisé (PIX-2733).

## v3.68.0 (18/06/2021)

- [#3116](https://github.com/1024pix/pix/pull/3116) [FEATURE] Ajouter le premier formulaire pour la sortie du SCO (PIX-2562).
- [#3120](https://github.com/1024pix/pix/pull/3120) [BUGFIX] Le commentaire global n'était pas pris en compte lorsqu'on calculait si une session finalisée était publiable immédiatement (PIX-2749).
- [#3104](https://github.com/1024pix/pix/pull/3104) [BUGFIX] Mise à jour de traductions anglaises.

## v3.67.0 (18/06/2021)

- [#3099](https://github.com/1024pix/pix/pull/3099) [FEATURE] Rattraper la prise en compte auto des signalements de certif sur les session finalisées (PIX-2591)

## v3.66.0 (17/06/2021)

- [#3107](https://github.com/1024pix/pix/pull/3107) [FEATURE] Recuperation des niveaux de compétence -1 (PIX-2737)
- [#3106](https://github.com/1024pix/pix/pull/3106) [FEATURE] Ajout des tooltips et traduction sur le graphique des statuts (PIX-2728)
- [#3105](https://github.com/1024pix/pix/pull/3105) [FEATURE] Afficher les fichiers microsoft en premier dans les épreuves (PIX-2729).
- [#3115](https://github.com/1024pix/pix/pull/3115) [BUGFIX] La colonne "Ecran de fin de test" a été retirée par erreur de la feuille d'émargement (PIX-2747)

## v3.65.0 (16/06/2021)

- [#3089](https://github.com/1024pix/pix/pull/3089) [FEATURE] Documenter le endpoint de récupération des résultats Pôle emploi (PIX-2681).
- [#3092](https://github.com/1024pix/pix/pull/3092) [FEATURE] Reporter les informations CPF dans le certification-course du candidat lors du démarrage de son test de certification (PIX-2716)
- [#3098](https://github.com/1024pix/pix/pull/3098) [FEATURE] Ajustement du scoring CléA numérique (PIX-2724)
- [#3103](https://github.com/1024pix/pix/pull/3103) [FEATURE] Ajout de liens vers la preview et les informations d'une épreuve sur la page de détails d'une certification dans PixAdmin (PIX-2727)
- [#3083](https://github.com/1024pix/pix/pull/3083) [FEATURE] Reporter les informations CPF lors de l'inscription de candidats de certification dans le cadre de la prescription de certification SCO (PIX-2695)
- [#3091](https://github.com/1024pix/pix/pull/3091) [BUGFIX] Corriger le dysfonctionnement de la page login de Pix Admin (PIX-2133).
- [#3100](https://github.com/1024pix/pix/pull/3100) [BUGFIX] Suppression de la barre de défilement horizontal sur la page compétences (PIX-2726).
- [#3040](https://github.com/1024pix/pix/pull/3040) [TECH] Contrôler les requêtes entrantes uniquement dans le routeur.
- [#3108](https://github.com/1024pix/pix/pull/3108) [TECH] Documenter la configuration Sentry.

## v3.64.0 (14/06/2021)

- [#3094](https://github.com/1024pix/pix/pull/3094) [FEATURE] Afficher les fichiers microsoft en premier dans les épreuves (PIX-2612).
- [#3097](https://github.com/1024pix/pix/pull/3097) [FEATURE] Simplification de la feuille d'émargement (PIX-2656)
- [#3088](https://github.com/1024pix/pix/pull/3088) [FEATURE] Détecter lorsque l'utilisateur perd le focus de l'onglet actif (PIX-2616).
- [#3079](https://github.com/1024pix/pix/pull/3079) [FEATURE] Afficher toujours les pages en français sur orga.pix.fr (PIX-2560).
- [#3093](https://github.com/1024pix/pix/pull/3093) [FEATURE] Prise en compte auto des signalements sur les fichiers qui ne s'ouvrent pas (PIX-2590)
- [#3067](https://github.com/1024pix/pix/pull/3067) [FEATURE] Afficher une fin de parcours personnalisé à la fin d'une campagne à accès simplifié (PIX-2613).
- [#3081](https://github.com/1024pix/pix/pull/3081) [FEATURE] Proposer un nouveau template de liste de candidats pour l'import qui contient les données pour le CPF (PIX-2654)
- [#2994](https://github.com/1024pix/pix/pull/2994) [FEATURE] Affichage du macaron d'obtention de la certification Pix+ Droit sur l'attestation PDF (PIX-2527)
- [#3074](https://github.com/1024pix/pix/pull/3074) [FEATURE] Auto neutraliser les questions portant sur les images ou simulateurs (PIX-2589).
- [#3095](https://github.com/1024pix/pix/pull/3095) [BUGFIX] Permettre la mise à jour du logo d'une organisation (PIX-2711).
- [#3096](https://github.com/1024pix/pix/pull/3096) [BUGFIX] Le critère "SomePartnerCompetences" pouvait ne pas prendre toutes les compétences (PIX-2720).
- [#3054](https://github.com/1024pix/pix/pull/3054) [BUGFIX] Stocker les données d'authentification PE temporairement (PIX-2607).
- [#2852](https://github.com/1024pix/pix/pull/2852) [TECH] Détecter via un script les classes css non utiles dans une app.
- [#3084](https://github.com/1024pix/pix/pull/3084) [CLEAN] Lever une erreur lorsque la réponse donnée contient une clé inexistante (PIX-2424).

## v3.63.0 (10/06/2021)

- [#3064](https://github.com/1024pix/pix/pull/3064) [FEATURE] Ajout du graphique de participants par statut (PIX-2662)
- [#3086](https://github.com/1024pix/pix/pull/3086) [FEATURE] Ajout d'un lien vers la politique de confidentialité dans la page d'inscription sur Pix App (PIX-2694).
- [#3068](https://github.com/1024pix/pix/pull/3068) [BUGFIX] Corriger l'affichage du détail d'une certification après sa modification (PIX-2661)
- [#3087](https://github.com/1024pix/pix/pull/3087) [TECH] Forcer les tests unitaire HTTP à signaler leur échec.

## v3.62.1 (09/06/2021)

- [#3085](https://github.com/1024pix/pix/pull/3085) [TECH] Fix test requiring role pixMaster
- [#2965](https://github.com/1024pix/pix/pull/2965) [TECH] Ajouter des détails dans les logs d'erreur du controller SAML.
- [#3047](https://github.com/1024pix/pix/pull/3047) [TECH] Mettre à jour les dépendances présentant un risque pour la sécurité

## v3.62.0 (09/06/2021)

- [#3077](https://github.com/1024pix/pix/pull/3077) [FEATURE] Générer un jeton d'accès pour l'application Pôle Emploi afin de consommer l'API Pix (Pix-2679).
- [#3078](https://github.com/1024pix/pix/pull/3078) [FEATURE] Permettre de choisir la langue d'envoie des invitation par email sur Pix Admin (PIX-2559).
- [#3073](https://github.com/1024pix/pix/pull/3073) [FEATURE] Ajout des titres à toutes les pages de Pix Certif (PIX-2650)
- [#3076](https://github.com/1024pix/pix/pull/3076) [FEATURE] Afficher la date de création et le nom du créateur d'une campagne dans le détail d'une campagne (PIX-2672)
- [#3075](https://github.com/1024pix/pix/pull/3075) [FEATURE] Renommer l'onglet Détails en Paramètres et le placer à droite dans le nav menu d'une campagne (PIX-2673).
- [#3060](https://github.com/1024pix/pix/pull/3060) [TECH] Séparer les routes commune d'Orga et Admin sur les memberships (PIX-2533).
- [#3082](https://github.com/1024pix/pix/pull/3082) [TECH] Ajout d'un index dans la table "certification-candidates" pour améliorer les performances d'affichage de la liste de candidats en prescription de certification SCO (PIX-2698)
- [#3052](https://github.com/1024pix/pix/pull/3052) [TECH] Supprimer les beforeEach des test unitaires des routes (PIX-2645).
- [#3069](https://github.com/1024pix/pix/pull/3069) [TECH] Afficher qu'un exemplaire d'un RT (PIX-2658)
- [#3080](https://github.com/1024pix/pix/pull/3080) [CLEANUP]  Suppression des toggles : recalcule des score dans l'onglet "détail" de Pix-Admin & téléchargement des résultats de certif dans Pix-Orga (PIX-2588)
- [#3063](https://github.com/1024pix/pix/pull/3063) [INFRA] Corriger des erreurs dans les seeds

## v3.61.0 (07/06/2021)

- [#3070](https://github.com/1024pix/pix/pull/3070) [FEATURE] Création d'un composant de carte d'indicateur dans Pix Orga (Pix-2663).
- [#3057](https://github.com/1024pix/pix/pull/3057) [FEATURE] Afficher la certificabilité de l'utilisateur sur les certifications complémentaires sur la page d'entrée en certification dans la bannière (PIX-2587)
- [#3044](https://github.com/1024pix/pix/pull/3044) [FEATURE] Permettre de récupérer la solution du challenge en cours depuis le bouton magique (PIX-2618).
- [#3031](https://github.com/1024pix/pix/pull/3031) [FEATURE] Ajouter et supprimer un tag à une organisation sur Pix Admin (PIX-2601)
- [#3006](https://github.com/1024pix/pix/pull/3006) [FEATURE] Autoneutraliser les questions avec signalements sans vérification préalable nécessaire (PIX-2575)
- [#3021](https://github.com/1024pix/pix/pull/3021) [FEATURE] Enlever l'assessmentId de l'url des parcours (PIX-2518).
- [#3058](https://github.com/1024pix/pix/pull/3058) [BUGFIX] Corriger le calcul du taux de repro (PIX-2651)
- [#3066](https://github.com/1024pix/pix/pull/3066) [BUGFIX] Afficher correctement le texte personnalisable d'une organisation à la fin d'un parcours prescrit (PIX-2676).
- [#3061](https://github.com/1024pix/pix/pull/3061) [BUGFIX] Inverser le nom et prénom en anglais dans la liste des participants (PIX-2652).
- [#3072](https://github.com/1024pix/pix/pull/3072) [TECH] Changer la manière d'afficher les RT dans l'export CSV d'une Campagne d’évaluation dans Pix Orga (PIX-2625)
- [#3062](https://github.com/1024pix/pix/pull/3062) [TECH] Changer la manière d'afficher les RT dans la liste des participants dans Pix Orga (PIX-2624)
- [#3059](https://github.com/1024pix/pix/pull/3059) Optimisation livret scolaire (PIX-2659)

## v3.60.0 (02/06/2021)

- [#3020](https://github.com/1024pix/pix/pull/3020) [FEATURE] Ne plus afficher les recID des challenges dans l'URL des assessments (PIX-327).
- [#3050](https://github.com/1024pix/pix/pull/3050) [FEATURE] Ajouter sur le détail d'une session un lien vers le centre de certification associé (PIX-2644)
- [#3024](https://github.com/1024pix/pix/pull/3024) [FEATURE] Déclencher le re-scoring des certifications complémentaires lorsque la certification Pix est rescorée (PIX-2451)
- [#3035](https://github.com/1024pix/pix/pull/3035) [FEATURE] Afficher la liste des sessions de façon paginée sur PixCertif (PIX-2631)
- [#3049](https://github.com/1024pix/pix/pull/3049) [FEATURE] Importer l'information sur le sexe lors de l'import CSV (PIX-2638)
- [#3053](https://github.com/1024pix/pix/pull/3053) [BUGFIX] Corriger le problème d'affichage du filtre de classes lorsqu'il n'y en a aucune (PIX-2605).
- [#3027](https://github.com/1024pix/pix/pull/3027) [BUGFIX] Ne pas empêcher l'export des résultats même en cas de champs manquant (PIX-2512)
- [#3045](https://github.com/1024pix/pix/pull/3045) [BUGFIX] Correction de référentiel en français alors que la langue est configurée comme l'anglais (PIX-2609).
- [#3036](https://github.com/1024pix/pix/pull/3036) [TECH] Prévenir les faux positifs liés à la BDD dans les tests.
- [#3051](https://github.com/1024pix/pix/pull/3051) [TECH] Mise à jour des dépendances de l'API
- [#3046](https://github.com/1024pix/pix/pull/3046) [TECH] Afficher les RT dans le détail d'un participant,  à partir de l'id de la campaignParticipation (PIX-2623)
- [#3055](https://github.com/1024pix/pix/pull/3055) [CLEAN] Supprime le champ non utilisé `skills` des objets `challenge` du référentiel.

## v3.59.0 (31/05/2021)

- [#3037](https://github.com/1024pix/pix/pull/3037) [FEATURE] Améliorer l'accessibilité de la bannière d'info de Pix Certif (PIX-2632)
- [#3043](https://github.com/1024pix/pix/pull/3043) [FEATURE] Importer l'information sur le sexe lors de l'import SIECLE (PIX-2637)
- [#3033](https://github.com/1024pix/pix/pull/3033) [FEATURE] Marquer des signalements comme étant "résolus" (PIX-2620)
- [#3032](https://github.com/1024pix/pix/pull/3032) [FEATURE] Renommer le libellé "Profils Reçus" pour les campagnes d'évaluation en "Résultats reçus" (PIX-2603).
- [#3025](https://github.com/1024pix/pix/pull/3025) [FEATURE] Permettre l'affichage d'une bannière d'informations sur Pix Orga en cas de problème sur la production (Pix-2430)
- [#3030](https://github.com/1024pix/pix/pull/3030) [FEATURE] Dans Pix Admin, permettre d'ouvrir les pages de détail d'une organisation et d'un centre de certification, dans un nouvel onglet (PIX-2570).
- [#2944](https://github.com/1024pix/pix/pull/2944) [FEATURE] Changer le texte de la bannière pour les orga SCO sur Pix Orga (PIX-2545)
- [#3029](https://github.com/1024pix/pix/pull/3029) [FEATURE] Empêcher l'accès à une session de certification déjà finalisée (PIX-2584)
- [#3041](https://github.com/1024pix/pix/pull/3041) [BUGFIX] Ajouter l'id de l'organisation dans le titre de certaines pages de Pix Admin (PIX-2627).
- [#2987](https://github.com/1024pix/pix/pull/2987) [BUGFIX] Corriger l'erreur "TransitionAborted" lors du clic sur "Retenter" une compétence.
- [#3039](https://github.com/1024pix/pix/pull/3039) [BUGFIX] Ne pas afficher de tooltip vide sur le graphique de répartition des participants par paliers lorsqu'il n'y a ni titre ni description pour le prescripteur (PIX-2629).
- [#3007](https://github.com/1024pix/pix/pull/3007) [BUGFIX] Afficher correctement le message d'erreur lors de la modification d'un identifiant déjà existant dans Pix Admin (PIX-2470).
- [#3034](https://github.com/1024pix/pix/pull/3034) [TECH] Contrôler le retour de /userinfo sur PoleEmploi (PIX-2639).
- [#3002](https://github.com/1024pix/pix/pull/3002) [TECH] Nettoyer les tests unitaires des routes
- [#3038](https://github.com/1024pix/pix/pull/3038) [TECH] Supprimer des TODO.
- [#2945](https://github.com/1024pix/pix/pull/2945) [TECH] Ajoute des logs de debug sur http agent

## v3.58.0 (25/05/2021)

- [#3026](https://github.com/1024pix/pix/pull/3026) [FEATURE] Filtrer les épreuves de certif selon la langue de l'utilisateur (PIX-2557).
- [#2959](https://github.com/1024pix/pix/pull/2959) [FEATURE] Ajout des titres à toutes les pages de Pix Orga (Pix-2504).
- [#3015](https://github.com/1024pix/pix/pull/3015) [FEATURE] Annuler une certification (PIX-2572)
- [#3010](https://github.com/1024pix/pix/pull/3010) [FEATURE] Afficher les tags sur l'onglet organisation dans Pix Admin (PIX-1332).
- [#3008](https://github.com/1024pix/pix/pull/3008) [FEATURE] Ajout des titres des pages de Pix Admin (PIX-2181)
- [#2989](https://github.com/1024pix/pix/pull/2989) [FEATURE] Afficher le graphique de répartition des participants par paliers (PIX-2549)
- [#3016](https://github.com/1024pix/pix/pull/3016) [FEATURE] Ajout de la traduction anglaise du bouton repasser une campagne (PIX-2598)
- [#3005](https://github.com/1024pix/pix/pull/3005) [TECH] Suppression du composant qroc-proposal (PIX-2448).
- [#2984](https://github.com/1024pix/pix/pull/2984) [TECH] Prévenir les dépendances incorrectes.
- [#3018](https://github.com/1024pix/pix/pull/3018) [TECH] Retourner un code HTTP 422 lorsque le YAML n'est pas valide
- [#3017](https://github.com/1024pix/pix/pull/3017) [TECH] Expliciter les modèles Bookshelf.
- [#3023](https://github.com/1024pix/pix/pull/3023) [CLEAN] Filtrer les réponses à enregistrer (PIX-2610).
- [#3019](https://github.com/1024pix/pix/pull/3019) [SCRIPT] Ecriture d'un script pour annuler massivement des certifications (PIX-2583)

## v3.57.0 (19/05/2021)

- [#2990](https://github.com/1024pix/pix/pull/2990) [FEATURE] Ajout d'un wording pour l'étudiant dans la page de réconciliation SUP (PIX-2547).
- [#3013](https://github.com/1024pix/pix/pull/3013) [FEATURE] Correctif graphique de la progress bar dans l'onglet Résultats par compétence (PIX-2553).
- [#3012](https://github.com/1024pix/pix/pull/3012) [BUGFIX] Le taux de repro est incorrect après une neutralisation sur la page de détails d'une certification dans PixAdmin (PIX-2599)
- [#2995](https://github.com/1024pix/pix/pull/2995) [BUGFIX] Rendre la finalisation de session idempotente (PIX-2580)
- [#3011](https://github.com/1024pix/pix/pull/3011) [BUGFIX] Homogéneiser des incohérences de clé json pour les ids de compétence lors de la modification jury (PIX-2594)
- [#2975](https://github.com/1024pix/pix/pull/2975) [BUGFIX] Correction de l'erreur Ember "Cannot read property 'targetName' of undefined"
- [#2998](https://github.com/1024pix/pix/pull/2998) [BUGFIX] Ajouter la méthode de connexion au GAR même quand l'utilisateur doit changer son mot de passe (PIX-2345).
- [#3001](https://github.com/1024pix/pix/pull/3001) [TECH] Déplacer la vérification du paramètre state dans l'API lors des requêtes Pole Emploi (PIX-2597).
- [#3014](https://github.com/1024pix/pix/pull/3014) [TECH] Supprimer la colonne color des BadgePartnerCompetences (PIX-2523).
- [#3009](https://github.com/1024pix/pix/pull/3009) [FIX] Afficher un message lorsque l'external id dépasse la limité autorisé (PIX-2505)
- [#2997](https://github.com/1024pix/pix/pull/2997) [INFRA] Loguer les traces d'erreurs dont le code est 500 ou plus en dev

## v3.56.0 (12/05/2021)

- [#3004](https://github.com/1024pix/pix/pull/3004) [HOTFIX] Merge du hotfix v3.54.1

## v3.55.0 (12/05/2021)

- [#2950](https://github.com/1024pix/pix/pull/2950) [FEATURE] Afficher les CGUs suivant la langue de l'utilisateur dans Pix Orga (PIX-2354).
- [#2988](https://github.com/1024pix/pix/pull/2988) [FEATURE] Ré-afficher les colonnes supprimées suite à l'ajout de l'index en base de donnée (PIX-2552)
- [#2992](https://github.com/1024pix/pix/pull/2992) [FEATURE] Inverser les listes de session à publier et à traiter dans ADMIN (PIX-2433)
- [#2955](https://github.com/1024pix/pix/pull/2955) [FEATURE] Afficher le block "repasser" pour une campagne de collecte de profils à envois multiples (PIX-2537).
- [#2985](https://github.com/1024pix/pix/pull/2985) [FEATURE] Améliorer l'accessibilité de l'infobulle sur le nombre de pix total
- [#2996](https://github.com/1024pix/pix/pull/2996) [BUGFIX] Les macarons de certifications complémentaires ne s'affichaient que si le candidat avait obtenu son CléA dans le certificat partagé par code (PIX-2582)
- [#3000](https://github.com/1024pix/pix/pull/3000) [TECH] Corrige un test flacky en supprimant du code (ce n'est pas ce que vous croyez)
## v3.54.1 (12/05/2021)

- [#3003](https://github.com/1024pix/pix/pull/3003) [HOTFIX] Sécuriser la route GET /api/organizations/{id}/campaigns (PIX-2492)

## v3.54.0 (11/05/2021)

- [#2971](https://github.com/1024pix/pix/pull/2971) [FEATURE] Passer les sessions assignées comme sessions "à traiter" (PIX-2571)
- [#2972](https://github.com/1024pix/pix/pull/2972) [FEATURE] Affichage des macarons Pix+Droit sur le certificat utilisateur sur PixApp (PIX-2369)
- [#2974](https://github.com/1024pix/pix/pull/2974) [FEATURE] Graphe de répartition des participants par palier (PIX-2550)
- [#2973](https://github.com/1024pix/pix/pull/2973) [FEATURE] Affichage des macarons Pix+Droit sur le certificat partagé de l'utilisateur (PIX-2370)
- [#2943](https://github.com/1024pix/pix/pull/2943) [FEATURE] Vérifier les diplômes et régimes dans l'import SUP (PIX-2416)
- [#2926](https://github.com/1024pix/pix/pull/2926) [FEATURE] Afficher le statut Annulé dans le fichier des résultats de certification (PIX-2404)
- [#2948](https://github.com/1024pix/pix/pull/2948) [FEATURE] Crée une release du référentiel et rafraîchit le cache dans l'admin (PIX-2453)
- [#2954](https://github.com/1024pix/pix/pull/2954) [FEATURE] Ajout de sous-catégories de support pour les embed (PIX-2436).
- [#2952](https://github.com/1024pix/pix/pull/2952) [FEATURE] Ajouter le statut Annulé dans Pix Admin (PIX-2402)
- [#2964](https://github.com/1024pix/pix/pull/2964) [BUGFIX] Restaurer les catégories de signalements E6 et E7 (PIX-2556)
- [#2961](https://github.com/1024pix/pix/pull/2961) [BUGFIX] Lors d'un rescoring manuel sur PixAdmin, les competence-marks n'étaient pas enregistrées correctement (PIX-2566)
- [#2983](https://github.com/1024pix/pix/pull/2983) [TECH] Mets à jour handlebars vers 4.7.7
- [#2982](https://github.com/1024pix/pix/pull/2982) [TECH] Supprimer le package inutilisé dezalgo.
- [#2956](https://github.com/1024pix/pix/pull/2956) [TECH] Pouvoir spécifier des KE dans les tests d'algo
- [#2967](https://github.com/1024pix/pix/pull/2967) [CLEAN] Nettoie le CHANGELOG des entrées créées par erreur lors d'essais avec pix-bot.

## v3.53.0 (06/05/2021)

- [#2963](https://github.com/1024pix/pix/pull/2963) [TECH] Empêcher les rôles dupliqués.
- [#2939](https://github.com/1024pix/pix/pull/2939) [TECH] Refacto technique préalable avant affichage des macarons sur le certificat utilisateur (PIX-2543)
- [#2962](https://github.com/1024pix/pix/pull/2962) [TECH] Supprimer le rôle jamais utilisé PIX-READER.
- [#2960](https://github.com/1024pix/pix/pull/2960) [CLEAN] Mise à jour du changelog du hotfix 3.52.1

## v3.52.1 (05/05/2021)
- [#2958](https://github.com/1024pix/pix/pull/2958) [BUGFIX] Ne pas lancer d'erreur lors d'un payload avec plus de meta que prévu par notre validation (PIX-2555).

## v3.52.0 (03/05/2021)

- [#2910](https://github.com/1024pix/pix/pull/2910) [FEATURE] Afficher les certification annulées (PIX-2403)
- [#2936](https://github.com/1024pix/pix/pull/2936) [FEATURE] Empêcher la mise à jour de "LastQuestionDate" quand l'assessment est terminé (PIX-2524).
- [#2924](https://github.com/1024pix/pix/pull/2924) [FEATURE] Suppression de la notion de surnuméraire de l'API (PIX-2414)
- [#2937](https://github.com/1024pix/pix/pull/2937) [BUGFIX] Corriger la suppression d'un membre sur Pix Orga (Pix-2541).
- [#2934](https://github.com/1024pix/pix/pull/2934) [BUGFIX] Un candidat inscrit à une session de certification ne pouvait la rejoindre si, à l'inscription, un espace au début ou à la fin est présent dans son nom ou son prénom (PIX-2382)
- [#2931](https://github.com/1024pix/pix/pull/2931) [BUGFIX] Ne pas valider de badge quand ce dernier n'a pas de critère (PIX-2538).
- [#2918](https://github.com/1024pix/pix/pull/2918) [CLEAN] Linter automatiquement les fichiers json de traduction (PIX-2525).

## v3.51.0 (30/04/2021)

- [#2932](https://github.com/1024pix/pix/pull/2932) [FEATURE] Pouvoir repasser un parcours seulement après 4 jours (PIX-2465).
- [#2913](https://github.com/1024pix/pix/pull/2913) [FEATURE] Afficher les mentions concernant les certifications complémentaires Pix+ Droit sur la page de détails d'une certification dans PixAdmin (PIX-2374)
- [#2872](https://github.com/1024pix/pix/pull/2872) [FEATURE] Donner accès à Pix Certif à l'administrateur SCO lors de la modification du rôle dans PixOrga (PIX-2454).
- [#2909](https://github.com/1024pix/pix/pull/2909) [FEATURE] Modifier les catégories de signalement (PIX-2484).
- [#2914](https://github.com/1024pix/pix/pull/2914) [FEATURE] Afficher les groupes d'acquis nécessaires pour obtenir un résultat thématique dans l'admin (PIX-2364)
- [#2873](https://github.com/1024pix/pix/pull/2873) [FEATURE] Afficher toutes les campagnes d'une organisation dans Pix Admin (PIX-2251).
- [#2933](https://github.com/1024pix/pix/pull/2933) [BUGFIX] Corrige l'entrée des dates de naissance pour l'ajout des candidats de certif (PIX-2526)
- [#2925](https://github.com/1024pix/pix/pull/2925) [BUGFIX] Valider le payload sur POST /api/users (PIX-2514).
- [#2871](https://github.com/1024pix/pix/pull/2871) [BUGFIX] Gérer les erreurs produites lors d'un appel POST /api/pole-emploi/token (PIX-2490).
- [#2915](https://github.com/1024pix/pix/pull/2915) [BUGFIX] Ne change pas le focus de la modal a chaque rendu (PIX-2521)
- [#2891](https://github.com/1024pix/pix/pull/2891) [TECH] Généraliser l'encapsulation des appels http sortant de l'API.
- [#2917](https://github.com/1024pix/pix/pull/2917) [TECH] Homogénéisation du nommage des fichiers de tests entre les dossiers
- [#2912](https://github.com/1024pix/pix/pull/2912) [API] Récupérer la derniere certif non annulée pour le livret-scolaire (pix-2520)

## v3.50.0 (28/04/2021)

- [#2893](https://github.com/1024pix/pix/pull/2893) [FEATURE] Simplifier le formulaire de réconciliation SUP (PIX-2415)
- [#2899](https://github.com/1024pix/pix/pull/2899) [FEATURE] Permettre de recommencer un parcours dont les résultats ont été partagés (Pix-2464)
- [#2916](https://github.com/1024pix/pix/pull/2916) [TECH] Ne pas remonter d'erreur lorsqu'aucun ticket Jira ne correspond à la PR.
- [#2854](https://github.com/1024pix/pix/pull/2854) [TECH] Lancer les tests end to end en 1 commande

## v3.49.0 (27/04/2021)

- [#2892](https://github.com/1024pix/pix/pull/2892) [FEATURE] Affichage des certifications complémentaires dans la liste des certifications sur PixAdmin (PIX-2373)
- [#2904](https://github.com/1024pix/pix/pull/2904) [FEATURE] Changer la page de maintenance (PIX-2515).
- [#2905](https://github.com/1024pix/pix/pull/2905) [BUGFIX] Suppression du join sur les campagnes participation
- [#2903](https://github.com/1024pix/pix/pull/2903) [BUGFIX] Supprimer le compteur de participations sur la page d'accueil de Pix Orga
- [#2908](https://github.com/1024pix/pix/pull/2908) [TECH] Ajouter un index sur campaignID dans la table campaign-participations.
- [#2812](https://github.com/1024pix/pix/pull/2812) [TECH] Montée de version des dépendances de Pix Certif (PIX-XXX).
- [#2868](https://github.com/1024pix/pix/pull/2868) [TECH] Expliciter la stratégie de test du routeur dans les tests API.
- [#2907](https://github.com/1024pix/pix/pull/2907) Mise à jour du changelog des hotfixes
- [#2890](https://github.com/1024pix/pix/pull/2890) [REFACTO] Calculer le résultat d'un résultat thématique en dehors d'une campagne (PIX-2488).
- [#2878](https://github.com/1024pix/pix/pull/2878) [DOC] Expliciter la description des pull requests.

## v3.48.0 (23/04/2021)

- [#2901](https://github.com/1024pix/pix/pull/2901) [FEATURE] Ajout de l'info de neutralisation dans l'affichage du détail d'une certification dans Pix Admin (PIX-2380)
- [#2900](https://github.com/1024pix/pix/pull/2900) [FEATURE] Ajout d'un bouton pour Dé-neutraliser une épreuve neutralisée sur PixAdmin (PIX-2509)
- [#2883](https://github.com/1024pix/pix/pull/2883) [FEATURE] Autoriser l'envoi multiple pour une campagne de collecte de profils (Pix-2466).
- [#2885](https://github.com/1024pix/pix/pull/2885) [FEATURE] Ajouter les mentions concernant les certifications Pix+ Droit dans les csv de résultats de certification (PIX-2443)
- [#2874](https://github.com/1024pix/pix/pull/2874) [FEATURE] Neutralisation d'épreuves depuis Pix-Admin (Pix-2359)
- [#2894](https://github.com/1024pix/pix/pull/2894) [FEATURE] Afficher les tags de chaque organisation sur Pix Admin (PIX-197).
- [#2881](https://github.com/1024pix/pix/pull/2881) [FEATURE] Ajout la possibilité  de filtrer une liste d’étudiants  SUP par numéro étudiant (PIX-2417).
- [#2898](https://github.com/1024pix/pix/pull/2898) [BUGFIX] L'affichage du score dans la page de détails d'une certification sur PixAdmin pouvait être erroné (PIX-2507)
- [#2888](https://github.com/1024pix/pix/pull/2888) [ADMIN] Supprimer les boutons “Récupérer le fichier avant jury” et “Exporter les résultats” de la page session dans Pix Admin (PIX-2495)

## v3.47.2 (26/04/2021)

- [#2905](https://github.com/1024pix/pix/pull/2905) [BUGFIX] Suppression du join sur les campagnes participation.

## v3.47.1 (26/04/2021)

- [#2904](https://github.com/1024pix/pix/pull/2904) [FEATURE] Changer la page de maintenance (PIX-2515).
- [#2903](https://github.com/1024pix/pix/pull/2903) [BUGFIX] Supprimer le compteur de participations sur la page d'accueil de Pix Orga.

## v3.47.0 (22/04/2021)

- [#2887](https://github.com/1024pix/pix/pull/2887) [FEATURE] Toujours renvoyer un niveau de competence positif pour le livret scolaire
- [#2837](https://github.com/1024pix/pix/pull/2837) [FEATURE] Ajouter un statut Annulé aux certifications
- [#2889](https://github.com/1024pix/pix/pull/2889) [FEATURE] Modifier la bannière Pix certif pour la reprogrammation de sessions du SCO (PIX-2500)
- [#2864](https://github.com/1024pix/pix/pull/2864) [FEATURE] Traduction anglaises depuis PO Editor - Avril 2021.
- [#2886](https://github.com/1024pix/pix/pull/2886) [BUGFIX] Gérer les QROCM avec des clés d'input à une lettre (PIX-2502).
- [#2877](https://github.com/1024pix/pix/pull/2877) [BUGFIX] Correction des conditions d'affichage du bandeau sur l'adresse email du destinataire des résultats (PIX-2491)
- [#2884](https://github.com/1024pix/pix/pull/2884) [TECH] Renommage de certains modèles et cas d'utilisation liés au scoring de certification de façon plus explicite (PIX-2499)
- [#2846](https://github.com/1024pix/pix/pull/2846) [DOC] Proposition d'ADR pour séparer Domain Transactions et Domain Events

## v3.46.0 (21/04/2021)

- [#2870](https://github.com/1024pix/pix/pull/2870) [FEATURE] Correction de l'affichage dans le burger menu sur Pix App (PIX-2469).
- [#2819](https://github.com/1024pix/pix/pull/2819) [FEATURE] Mise en place du calcul d'obtention des certifications Pix+ à l'issue d'un test de certification (PIX-2371)
- [#2867](https://github.com/1024pix/pix/pull/2867) [FEATURE] Résilience Pôle emploi - Ajout d'un script de création a posteriori des pole-emploi-sendings (Pix-2483).
- [#2862](https://github.com/1024pix/pix/pull/2862) [FEATURE] Afficher la dernière participation à la campagne dans le cas d'une campagne à envois multiples (Pix-2463).
- [#2882](https://github.com/1024pix/pix/pull/2882) [BUGFIX] Valider le paramètre filter[id] de la route GET /api/organizations (PIX-2497).
- [#2879](https://github.com/1024pix/pix/pull/2879) [BUGFIX] Calcul du résultat de certification : compter le nombre d'épreuves proposées (PIX-2493)
- [#2876](https://github.com/1024pix/pix/pull/2876) [BUGFIX] Serialise tout les badgeParnerCompetences dans le critère lorsque son scope est EveryPartnerCompetence
- [#2875](https://github.com/1024pix/pix/pull/2875) [BUGFIX][i18n] Modification du terme "En attente" afin de le rendre plus compréhensible par le prescripteur (Pix-2486)
- [#2863](https://github.com/1024pix/pix/pull/2863) [TECH] Retenir pour la certification de quel badge certifiable une épreuve est choisie lors du choix des épreuves de la création du test de certification (PIX-2485)
- [#2861](https://github.com/1024pix/pix/pull/2861) [TECH] Introduire un modèle dédié à la réinitialisation de mot de passe (PIX-2274).
- [#2636](https://github.com/1024pix/pix/pull/2636) [CLEANUP] Glimmerizer les FormTextfields (PIX-2272).

## v3.45.0 (19/04/2021)

- [#2830](https://github.com/1024pix/pix/pull/2830) [FEATURE] L'arrondi à l'entier supérieur n'est pas correct pour filtrer les participants dans pixOrga (PIX-2456).
- [#2856](https://github.com/1024pix/pix/pull/2856) [FEATURE] Affichage d'un sous menu dans la page Mon compte (PIX-2055).
- [#2841](https://github.com/1024pix/pix/pull/2841) [FEATURE] Ajout de la section "Compétences à retenter" sur le TDB (PIX-2263).
- [#2840](https://github.com/1024pix/pix/pull/2840) [FEATURE] Ajouter les params externalId et masteryPercentage à l'url donnée par une orga (PIX-2440).
- [#2860](https://github.com/1024pix/pix/pull/2860) [FEATURE] Ajouter une documentation pour orga.pix.org (PIX-2477).
- [#2857](https://github.com/1024pix/pix/pull/2857) [FEATURE] Générer les identifiants via les informations de l'élève présent en base sur la double mire Pix App (PIX-1785).
- [#2869](https://github.com/1024pix/pix/pull/2869) [BUGFIX] Corrige la récupération des badges
- [#2866](https://github.com/1024pix/pix/pull/2866) [BUGFIX] Correctif d'alignement entre le bouton radio et la phrase dans les QCM (PIX-2427).
- [#2843](https://github.com/1024pix/pix/pull/2843) [TECH] Améliorer l'authentification dans l'API (PIX-2475).
- [#2817](https://github.com/1024pix/pix/pull/2817) [CLEANUP] Refacto du proposal as block pour mieux afficher les blocs avec du markdown (PIX-2438).
- [#2865](https://github.com/1024pix/pix/pull/2865) [SR] Supprimer les .get et .set dans les tests unitaires des models de Pix-App.

## v3.44.0 (15/04/2021)

- [#2842](https://github.com/1024pix/pix/pull/2842) [FEATURE] Affiche les badgePartnerCompetences dans les critéres du badge
- [#2820](https://github.com/1024pix/pix/pull/2820) [FEATURE] Afficher la liste des épreuves posées en certif sur l'onglet "Neutralisation" (PIX-2358)
- [#2844](https://github.com/1024pix/pix/pull/2844) [FEATURE] Affichage d'une documentation dans PIX ORGA pour les organisations ayant comme type SUP (PIX-2462).
- [#2834](https://github.com/1024pix/pix/pull/2834) [FEATURE] Ajout de nouveaux champs à la bdd pour permettre des participations multiples à la même campagne (PIX-2445).
- [#2831](https://github.com/1024pix/pix/pull/2831) [FEATURE] Création de la page de plan de site (PIX-1958).
- [#2811](https://github.com/1024pix/pix/pull/2811) [FEATURE]  Automatisation ajustement jury (PIX-2113)
- [#2826](https://github.com/1024pix/pix/pull/2826) [FEATURE] Création de liens d'évitements (PIX-1862).
- [#2853](https://github.com/1024pix/pix/pull/2853) [TECH] Améliorer les index sur les requêtes par email sur password-reset-demands et users (PIX-2474).
- [#2851](https://github.com/1024pix/pix/pull/2851) [TECH] Rendre l'email à utiliser pour les notifications JIRA explicite (PIX-2472).
- [#2813](https://github.com/1024pix/pix/pull/2813) [TECH] Montée de version des dépendances de Pix Orga (PIX-2468)
- [#2835](https://github.com/1024pix/pix/pull/2835) [A11Y] Corrections d'accessibilité sur la page de connexion et d'inscription (PIX-2461).
- [#2796](https://github.com/1024pix/pix/pull/2796) [CLEANUP] Glimmerizer SignupForm (PIX-2452).

## v3.43.0 (13/04/2021)

- [#2836](https://github.com/1024pix/pix/pull/2836) [FEATURE] Affiche les critères d'un résultat thématique dans Pix Admin.
- [#2833](https://github.com/1024pix/pix/pull/2833) [FEATURE] À la fin de l'url donnée par l'organisation, ajouter le seuil du palier atteint par le participant (Pix-2329)
- [#2824](https://github.com/1024pix/pix/pull/2824) [FEATURE] Autoriser l'affichage du MarkDown sur le message de description en fin de parcours (PIX-2331).
- [#2829](https://github.com/1024pix/pix/pull/2829) [FEATURE] Permettre la modification de l'identifiant d'un utilisateur dans Pix Admin (PIX-2102). 
- [#2827](https://github.com/1024pix/pix/pull/2827) [FEATURE] Corriger l'affichage mobile de la page "Mon Compte" sur Pix App (PIX-2319).
- [#2822](https://github.com/1024pix/pix/pull/2822) [FEATURE] Affichage de l'information certifiable sur les badges dans l'admin
- [#2807](https://github.com/1024pix/pix/pull/2807) [FEATURE] Supprimer une méthode de connexion d'un utilisateur dans Pix Admin (PIX-2103).
- [#2838](https://github.com/1024pix/pix/pull/2838) [BUGFIX] Amélioration des erreurs lors d'un appel Pôle emploi avec Axios (PIX-2460).
- [#2715](https://github.com/1024pix/pix/pull/2715) [TECH] Créer un repository pour l'affichage des résultats à une campagne d'évaluation d'un participant (PIX-2390).
- [#2839](https://github.com/1024pix/pix/pull/2839) Mise à jour de wording
- [#2828](https://github.com/1024pix/pix/pull/2828) [INFRA] Renommage de deux méthodes statiques pour les faire ressembler aux autres
- [#2801](https://github.com/1024pix/pix/pull/2801) [CLEANUP] Refacto du certification-result PART-1 (PIX-2348)

## v3.42.0 (09/04/2021)

- [#2806](https://github.com/1024pix/pix/pull/2806) [FEATURE] Restreindre l'accès d'un utilisateur anonyme lors d'une campagne à accès simplifiée (Pix-2363).
- [#2821](https://github.com/1024pix/pix/pull/2821) [FEATURE] Afficher le bouton personnalisé dans la page de fin de parcours (Pix-2327)
- [#2799](https://github.com/1024pix/pix/pull/2799) [FEATURE] renvoyer la derniere certification pour le livret scolaire (pix-2421)
- [#2823](https://github.com/1024pix/pix/pull/2823) [BUGFIX] Affichage de la bonne identité dans le détail d'un participant à une campagne de collecte de profils (PIX-2427).

## v3.41.1 (08/04/2021)

- [#2825](https://github.com/1024pix/pix/pull/2825) [BUGFIX] Le mésusage de la DomainTransaction provoque des deadlocks dans le flux de complétion d'asssessment (PIX-2457)

## v3.41.0 (07/04/2021)

- [#2788](https://github.com/1024pix/pix/pull/2788) [FEATURE] Afficher les méthodes de connexion d'un utilisateur sur Pix Admin (PIX-2425).
- [#2814](https://github.com/1024pix/pix/pull/2814) [FEATURE] Ajout d'une page de détails des résultats thématique dans l'admin (PIX-2446)
- [#2792](https://github.com/1024pix/pix/pull/2792) [FEATURE] Permettre de dissocier un utilisateur d'une seule inscription scolaire dans Pix Admin (PIX-2356).
- [#2805](https://github.com/1024pix/pix/pull/2805) [FEATURE] Monter la limite du numéro d'épreuve de 48 à 64 lors de la finalisation de session pour inclure les épreuves Pix+ Droit (PIX-2368)
- [#2804](https://github.com/1024pix/pix/pull/2804) [FEATURE] Changement de la pagination à 25 par défaut au lieu de 10 dans la liste des participants sur Pix Orga (PIX-2428).
- [#2808](https://github.com/1024pix/pix/pull/2808) [FEATURE] Changement de wording dans la page de l'envoi des résultats d'une campagne archivée sur Mon-Pix (2429).
- [#2789](https://github.com/1024pix/pix/pull/2789) [FEATURE] Traduction de phrases oubliées sur Pix Orga (Pix-2426).
- [#2730](https://github.com/1024pix/pix/pull/2730) [FEATURE] Ajouter les épreuves Pix+ Droit lors du choix des épreuves à l'élaboration d'un test de certif (PIX-2259)
- [#2784](https://github.com/1024pix/pix/pull/2784) [FEATURE] Changer la puce de couleur par une barre de couleur pour les compétences (PIX-2337)
- [#2816](https://github.com/1024pix/pix/pull/2816) [BUGFIX] Restoration de l'icône svg icon-reload.svg.
- [#2769](https://github.com/1024pix/pix/pull/2769) [BUGFIX] Empecher l'embed de dépasser de l'iframe
- [#2800](https://github.com/1024pix/pix/pull/2800) [TECH] Montée de version des dépendances de Pix Admin (PR-XXX).
- [#2693](https://github.com/1024pix/pix/pull/2693) [TECH] Refacto de la gestion des token via Hapi (PIX-2408).
- [#2797](https://github.com/1024pix/pix/pull/2797) [TECH] Parser les date only (comme les date d'anniversaire) en heure locale sans offset.
- [#2775](https://github.com/1024pix/pix/pull/2775) [TECH] Prévenir les injections SQL dans l'API.
- [#2809](https://github.com/1024pix/pix/pull/2809) [TECH] Supprimer <°)))><
- [#2781](https://github.com/1024pix/pix/pull/2781) [TECH] Empêcher le re-scoring lors de la récupération des détails de certification sur Admin (PIX-2419)
- [#2815](https://github.com/1024pix/pix/pull/2815) [APP] Afficher le message d'une organisation à la fin d'un parcours (PIX-2328)
- [#2783](https://github.com/1024pix/pix/pull/2783) [APP] Utilisation du composant `PixProgressGauge` dans Pix App et Pix Orga (Pix-2333) 
- [#2802](https://github.com/1024pix/pix/pull/2802) [INFRA] Uniformise un champs de message d'erreur dans un log
- [#2790](https://github.com/1024pix/pix/pull/2790) chore(deps): bump y18n from 4.0.0 to 4.0.1 in /mon-pix

## v3.40.0 (01/04/2021)

- [#2791](https://github.com/1024pix/pix/pull/2791) [FEATURE] Amélioration de l'a11y sur la page de présentation de campagne (PIX-1879).
- [#2780](https://github.com/1024pix/pix/pull/2780) [FEATURE][i18n] Ajout de l'internationalisation dans le modèle d'import SCO AGRI CFA (PIX-2310).
- [#2798](https://github.com/1024pix/pix/pull/2798) [BUGFIX] Ajout de tag autorisé dans le markdown to html.
- [#2795](https://github.com/1024pix/pix/pull/2795) [TECH] Mise à jour des dépendances Ember de pix-admin 3.23.1 --> 3.25.3
- [#2785](https://github.com/1024pix/pix/pull/2785) [TECH] Retirer faker de l'API (PIX-2166)
- [#2794](https://github.com/1024pix/pix/pull/2794) <°)))><

## v3.39.0 (31/03/2021)

- [#2748](https://github.com/1024pix/pix/pull/2748) [FEATURE] Script de création d'organisations PRO en masse depuis un fichier CSV (PIX-2278).
- [#2778](https://github.com/1024pix/pix/pull/2778) [FEATURE] Gérer le focus des PixModal lors de l'entrée et la sortie (PIX-1870).
- [#2758](https://github.com/1024pix/pix/pull/2758) [FEATURE] Traduire en anglais la double mire dans Pix Orga (PIX-2227).
- [#2766](https://github.com/1024pix/pix/pull/2766) [FEATURE] Ajouter l'id de campaign-participation au modèle badge-acquisition (PIX-2287).
- [#2771](https://github.com/1024pix/pix/pull/2771) [FEATURE] Mettre une favicon unique pour chaque plateforme Pix (PIX-2330).
- [#2724](https://github.com/1024pix/pix/pull/2724) [TECH] Ajout de test d'accessibilité dans nos tests E2E.
- [#2774](https://github.com/1024pix/pix/pull/2774) [TECH] Retirer la configuration Bookshelf qui servait de rétrocompatibilité sur le comportement par défaut de fetch() (PIX-2420)
- [#2773](https://github.com/1024pix/pix/pull/2773) [DOCS] Proposition de bonnes pratiques autour du testing de textes traduits sur les applications front Ember (PIX-2418)
- [#2786](https://github.com/1024pix/pix/pull/2786) Bump y18n from 4.0.0 to 4.0.1 in /api

## v3.38.0 (29/03/2021)

- [#2779](https://github.com/1024pix/pix/pull/2779) [FEATURE] Ajouter un lien vers la FAQ "Comment se certifier" sur le bandeau "Bravo vous êtes certifiable" (PIX-2400)
- [#2749](https://github.com/1024pix/pix/pull/2749) [FEATURE] Ajout d'un bouton vers "Tous mes parcours" depuis la page du tableau de bord de Pix App (PIX-2335).
- [#2759](https://github.com/1024pix/pix/pull/2759) [FEATURE] Ajout du markdown sur le champ réponses des QROCm (PIX-2292).
- [#2776](https://github.com/1024pix/pix/pull/2776) [FEATURE] Changer le titre de la page quand l'épreuve timée est terminée (PIX-2283).
- [#2768](https://github.com/1024pix/pix/pull/2768) [TECH] Ajout de champs pour la personnalisation de la page de fin de parcours (PIX-2326)
- [#2782](https://github.com/1024pix/pix/pull/2782) [CLEANUP] Suppression du domain event ChallengeRequested (PIX-2410)
- [#2770](https://github.com/1024pix/pix/pull/2770) [FEAT] Ajout d'avertissements sur la modale de remise à zéro (PIX-2365).

## v3.37.0 (29/03/2021)

- [#2777](https://github.com/1024pix/pix/pull/2777) [FEATURE] A11Y- Ajout d'un aria-label hidden pour ne pas tenter de lire le svg du cercle (PIX-1883).
- [#2765](https://github.com/1024pix/pix/pull/2765) [FEATURE] Ajout de sous-catégories de signalements pour les liens (PIX-1640).
- [#2755](https://github.com/1024pix/pix/pull/2755) [FEATURE] Ajout du markdown sur le champ réponses des QROC (PIX-2291).
- [#2761](https://github.com/1024pix/pix/pull/2761) [FEATURE] Masquer le lien de récupération d'espace Orga sur la page de connexion Pix Orga pour pix.org (PIX-2398).
- [#2744](https://github.com/1024pix/pix/pull/2744) [FEATURE] Permettre dans pix Admin de marquer comme obsolète un profil cible (Pix-2309).
- [#2736](https://github.com/1024pix/pix/pull/2736) [FEATURE] Traduction des erreurs de l'import XML SIECLE (Pix-2313).
- [#2754](https://github.com/1024pix/pix/pull/2754) [BUGFIX] Permettre aux étudiants faisant partie d'une orga SCO non isManagingStudents d'entrer en certif (PIX-2388)
- [#2752](https://github.com/1024pix/pix/pull/2752) [BUGFIX] Mettre le score à 0 pour un certificat validé non publié (PIX-2396)
- [#2739](https://github.com/1024pix/pix/pull/2739) [TECH] Réparer la configuration de débogage VSCode.

## v3.36.0 (25/03/2021)

- [#2767](https://github.com/1024pix/pix/pull/2767) [BUGFIX] Modifier la sauvegarde du temps sur l'assessment.
- [#2760](https://github.com/1024pix/pix/pull/2760) [BUGFIX] Mauvaise classe dans l'export des résultats d'une campagne de collecte de profils (PIX-2366)
- [#2763](https://github.com/1024pix/pix/pull/2763) [BUGFIX] Garder la langue quand je suis connecté en simplifié/anonyme.
- [#2756](https://github.com/1024pix/pix/pull/2756) [TECH] Traduction du mot d'aide/erreur lors de la mauvaise saisie du numéro de session lors de l'accès à la certification sur PixApp (PIX-2394)
- [#2753](https://github.com/1024pix/pix/pull/2753) [TECH] Ajout de traductions sur la page "Certifications" dans Pix-Orga (PIX-2391)
- [#2740](https://github.com/1024pix/pix/pull/2740) [TECH] Mise à jour de la DB browserlist pour toutes les applications front (PIX-2383)
- [#2709](https://github.com/1024pix/pix/pull/2709) [CLEANUP] Refactoring du scoring en vue de la neutralisation d'épreuve (Pix-2377)

## v3.35.0 (23/03/2021)

- [#2738](https://github.com/1024pix/pix/pull/2738) [FEATURE] Traduire en anglais la page "Mon équipe / Invitations" dans Pix Orga (PIX-2225).
- [#2721](https://github.com/1024pix/pix/pull/2721) [FEATURE] Modifier les champs prescriberTitle et prescriberDescription d'un palier(PIX-2314)
- [#2743](https://github.com/1024pix/pix/pull/2743) [FEATURE] Traduction de la modal de gestion du compte d'un élève dans Pix Orga (PIX-2226).
- [#2705](https://github.com/1024pix/pix/pull/2705) [FEATURE] Sauvegarder le temps passé sur une épreuve (PIX-2260).
- [#2703](https://github.com/1024pix/pix/pull/2703) [FEATURE] Afficher la nouvelle solution d'une épreuve si présente dans Airtable (PIX-2265).
- [#2712](https://github.com/1024pix/pix/pull/2712) [FEATURE][i18n] Ajout de l'internationalisation dans le modèle d'import SUP (PIX-2309).
- [#2704](https://github.com/1024pix/pix/pull/2704) [FEATURE] Traduire en anglais la page de connexion de Pix Orga (PIX-2221).
- [#2751](https://github.com/1024pix/pix/pull/2751) [BUGFIX] Envoyer une réponse sur une épreuve en preview
- [#2750](https://github.com/1024pix/pix/pull/2750) [TECH] Mettre à jour notre addon ember-cli-matomo-tag-manager
- [#2514](https://github.com/1024pix/pix/pull/2514) [TECH]  Utiliser les snapshots pour calculer les resultats d'une participation à une campagne d'évaluation afin de les afficher au participant (PIX-2121).
- [#2650](https://github.com/1024pix/pix/pull/2650) [DOC] ADR sur le choix de Gravitee comme API management de Pix.

## v3.34.0 (22/03/2021)

- [#2735](https://github.com/1024pix/pix/pull/2735) [FEATURE] Validation du champ "Numéro de session" sur la page "Rejoindre une session" (PIX-2379)
- [#2716](https://github.com/1024pix/pix/pull/2716) [FEATURE] PixScore = 0 pour certificats Livret-scolaire non validés (PIX-2362)
- [#2719](https://github.com/1024pix/pix/pull/2719) [FEATURE] Afficher le status du CléA dans le fichier des résultats de certification (PIX-2339)
- [#2731](https://github.com/1024pix/pix/pull/2731) [FEATURE] Ajout d'un onglet Neutralisation dans le détail d'une certification sur Pix Admin (PIX-2357)
- [#2679](https://github.com/1024pix/pix/pull/2679) [FEATURE] Notifier l'utilisateur de son changement d'email (PIX-2088).
- [#2711](https://github.com/1024pix/pix/pull/2711) [FEATURE] Traduction des sujets d'e-mails et correction de l'url du support (PIX-2321). 
- [#2729](https://github.com/1024pix/pix/pull/2729) [FEATURE] Changer le wording sur la page Certification dans Pix Orga (PIX-2378)
- [#2734](https://github.com/1024pix/pix/pull/2734) [BUGFIX] Corriger l'erreur renvoyée lors d'un changement de mot de passe pour un utilisateur sans adresse e-mail (PIX-2367). 
- [#2746](https://github.com/1024pix/pix/pull/2746) [BUGFIX] Pouvoir désactiver l'envoi d'e-mails. 
- [#2741](https://github.com/1024pix/pix/pull/2741) [TECH] Mise à jour des dépendances de pix-api.
- [#2727](https://github.com/1024pix/pix/pull/2727) [TECH] Remplacer IE9 par IE11 comme navigateur le plus "vieux" à supporter sur mon-pix (PIX-2375)
- [#2745](https://github.com/1024pix/pix/pull/2745) [CLEANUP] Supprimer G-Recaptcha (PIX-2384).
- [#2657](https://github.com/1024pix/pix/pull/2657) [CLEANUP] Glimmerizer les composant login-form et register-form (PIX-2322).

## v3.33.0 (18/03/2021)

- [#2720](https://github.com/1024pix/pix/pull/2720) [FEATURE] Afficher le nombre de sessions à traiter dans le libellé de l'onglet (PIX-2298)
- [#2722](https://github.com/1024pix/pix/pull/2722) [FEATURE] Ouvrir le lien de la documentation vers un nouvel onglet (PIX-2338)
- [#2717](https://github.com/1024pix/pix/pull/2717) [FEATURE] Ajout du Markdown dans le champ réponses des QCM (PIX-2290).
- [#2702](https://github.com/1024pix/pix/pull/2702) [FEATURE] Traduire en anglais la page "Mon Equipe" et la modale de suppression dans Pix Orga (PIX-2222).
- [#2706](https://github.com/1024pix/pix/pull/2706) [BUGFIX] Mettre le markdown sur la bonne réponse des QCU (PIX-2350).
- [#2707](https://github.com/1024pix/pix/pull/2707) [TECH] Envoi les résultats de test des tests e2e
- [#2601](https://github.com/1024pix/pix/pull/2601) [TECH] Récupération de la dernière release du référentiel chaque jour.
- [#2681](https://github.com/1024pix/pix/pull/2681) [TECH] Supprimer la détection de lien invalides dans la CI.
- [#2725](https://github.com/1024pix/pix/pull/2725) [CLEANUP] Déplacer le composant feedback dans le composant global des challenges (PIX-2372).
- [#2699](https://github.com/1024pix/pix/pull/2699) [FIX] Le bouton "Annuler" doit rediriger vers la page de présentation de la campagne (PIX-2336)
- [#2701](https://github.com/1024pix/pix/pull/2701) [ADMIN] Organiser les compétences par rapport à leur index (Pix-2341)
- [#2718](https://github.com/1024pix/pix/pull/2718) [CERTIF] Changer le contenu du bandeau sur l'ajout de candidats (PIX-2352)
- [#2713](https://github.com/1024pix/pix/pull/2713) [CLEANUP] Suppression de la colonne elapsedTime de la table answers (PIX-2361).

## v3.32.0 (16/03/2021)

- [#2676](https://github.com/1024pix/pix/pull/2676) [FEATURE] Transfert du bandeau d'envoi de résultats de collecte de profil de la page compétences vers le TDB (PIX-2276).
- [#2710](https://github.com/1024pix/pix/pull/2710) [FEATURE] Ne plus filtrer par défaut la liste de "Toutes les sessions" (PIX-2300)
- [#2714](https://github.com/1024pix/pix/pull/2714) [FEATURE] Modifier l'ordre des onglets sur la page "Sessions de certifications" (PIX-2302)
- [#2690](https://github.com/1024pix/pix/pull/2690) [FEATURE] Afficher la personne assignée à la session dans la liste des sessions à traiter (Pix-2299)
- [#2685](https://github.com/1024pix/pix/pull/2685) [FEATURE][i18n] Traduction des en-têtes csv et du contenu pour les résultats d'une campagne (PIX-2206)
- [#2708](https://github.com/1024pix/pix/pull/2708) [FEATURE] Afficher un lien de documentation spécifique pour la médiation numérique (PIX-2355).
- [#2700](https://github.com/1024pix/pix/pull/2700) [FEATURE] Ajout d'un lien vers une documentation au sujet des résultats de certification (PIX-2338)
- [#2684](https://github.com/1024pix/pix/pull/2684) [FEATURE] Création de paliers depuis l'admin (PIX-1968)
- [#2688](https://github.com/1024pix/pix/pull/2688) [FEATURE] Traduire les erreurs à l'import des CSV des élèves/étudiants (PIX-2312)
- [#2682](https://github.com/1024pix/pix/pull/2682) [FEATURE] Publier des sessions en masse (PIX-2041)
- [#2694](https://github.com/1024pix/pix/pull/2694) [FEATURE] Afficher la titre et la description prescripteur d'un palier dans le détail d'un participant d'une campagne d'évaluation de Pix Orga (PIX-2316).
- [#2683](https://github.com/1024pix/pix/pull/2683) [BUGFIX] Supprime une faille d'injection SQL 
- [#2692](https://github.com/1024pix/pix/pull/2692) [BUGFIX] Ne pas afficher les campagnes pour Novice dans les TDB et pages parcours (PIX-2320).

## v3.31.0 (11/03/2021)

- [#2647](https://github.com/1024pix/pix/pull/2647) [FEATURE] Ajout d'un nouveau critère pour la création des RT (PIX-2258).
- [#2691](https://github.com/1024pix/pix/pull/2691) [FEATURE] Trier la liste des classes sur la page "Certifications" (PIX-2324)
- [#2660](https://github.com/1024pix/pix/pull/2660) [FEATURE] Traduire dans l'API la demande de réinitialisation du mot de passe d'un utilisateur (PIX-2214).
- [#2669](https://github.com/1024pix/pix/pull/2669) [FEATURE] Permettre la suppression d'un membre depuis Pix Orga (PIX-404).
- [#2687](https://github.com/1024pix/pix/pull/2687) [FEATURE] Afficher la titre et la description prescripteur d'un palier dans la liste des participants d'une campagne d'évaluation de Pix Orga (PIX-2315).
- [#2667](https://github.com/1024pix/pix/pull/2667) [FEATURE] Traduction des bannières d'information de Pix Orga (PIX-2253).
- [#2689](https://github.com/1024pix/pix/pull/2689) [BUGFIX] Réparer l'export des résultats pour les utilisateurs anonymes (PIX-2346).
- [#2695](https://github.com/1024pix/pix/pull/2695) [TECH] Stocke les résultats des tests dans circleci
- [#2696](https://github.com/1024pix/pix/pull/2696) [TECH] Tri les paliers par ordre de seuil
- [#2666](https://github.com/1024pix/pix/pull/2666) [TECH] Ajout d'un helper front pour pouvoir avoir un choix de langue dans un bloc de text (PIX-2318).
- [#2571](https://github.com/1024pix/pix/pull/2571) [CLEAN] Suppression des images dans APP non utilisées.

## v3.30.0 (11/03/2021)

- [#2651](https://github.com/1024pix/pix/pull/2651) [FEATURE][i18n] Contextualisation des en-têtes sur l'export de résultats pour une campagne de collecte de profils (Pix-2205).
- [#2678](https://github.com/1024pix/pix/pull/2678) [FEATURE] Rechercher une classe lors du téléchargement des résultats de certif (PIX-2306)
- [#2624](https://github.com/1024pix/pix/pull/2624) [FEATURE] Ajout des traductions pour la page des élèves (SCO) (PIX-2252)
- [#2670](https://github.com/1024pix/pix/pull/2670) [BUGFIX] Les Résultats Thématiques sont illisibles sous IE (PIX-2303).
- [#2686](https://github.com/1024pix/pix/pull/2686) [BUGFIX] Soucis visuel sur les checkbox (PIX-2325).

## v3.29.0 (10/03/2021)

- [#2674](https://github.com/1024pix/pix/pull/2674) [FEATURE] Traduire en anglais la page Inviter un membre dans Pix Orga (PIX-2220).
- [#2673](https://github.com/1024pix/pix/pull/2673) [FEATURE] Ne pas montrer de bannière sur la page "Certifications" sur PixOrga (PIX-2296) 
- [#2648](https://github.com/1024pix/pix/pull/2648) [FEATURE] Pouvoir mettre du markdown sur les QCU (PIX-2289).
- [#2656](https://github.com/1024pix/pix/pull/2656) [FEATURE] Ajout des traductions pour la page de modification du numéro étudiant (SUP) (PIX-2255).
- [#2665](https://github.com/1024pix/pix/pull/2665) [FEATURE] Change wording for certification page labels (pix-2295)
- [#2671](https://github.com/1024pix/pix/pull/2671) [BUGFIX] Affichage du burger menu cassé.
- [#2662](https://github.com/1024pix/pix/pull/2662) [BUGFIX] La tooltip "Copier" dans la page détail d'une campagne n'avait pas de traduction (PIX-2305)
- [#2680](https://github.com/1024pix/pix/pull/2680) [TECH] Trier les résultats par compétence dans les résultats envoyés pour le livret scolaire.
- [#2677](https://github.com/1024pix/pix/pull/2677) [TECH] Mise a jour de Node 14.15.0 vers 14.16.0.
- [#2664](https://github.com/1024pix/pix/pull/2664) [TECH] Pouvoir changer le comportement de l'utilisateur dans les tests d'algo (PIX-2063).
- [#2658](https://github.com/1024pix/pix/pull/2658) [TECH] Transférer la traduction de l'email de création de compte dans l'API (PIX-2213).
- [#2629](https://github.com/1024pix/pix/pull/2629) [TECH] Bump du package.json de l'api
- [#2426](https://github.com/1024pix/pix/pull/2426) [TECH] Affiche le profil de positionnement et les acquis évalués en certification pour un test de certif sur PixAdmin (PIX-2185)
- [#2655](https://github.com/1024pix/pix/pull/2655) [TECH] Refactorer les tests d'invitation aux organisations (PIX-2297).
- [#2668](https://github.com/1024pix/pix/pull/2668) [FIX] Ignorer les liens pole emploi connect dans le Doc Link Checker
- [#2653](https://github.com/1024pix/pix/pull/2653) [DOC] ADR sur la gestion des images dans Pix App.
- [#2659](https://github.com/1024pix/pix/pull/2659) [CLEANUP] Supprimer les exceptions du template-lintrc de Pix App (PIX-2304).
- [#2639](https://github.com/1024pix/pix/pull/2639) [CLEAN] Renommer PublishableSessions en ToBePublishedSessions
- [#2663](https://github.com/1024pix/pix/pull/2663) [INFRA] Ajout d'un status de réussite ou d'échec à la méthode d'envoi d'email

## v3.28.0 (04/03/2021)

- [#2631](https://github.com/1024pix/pix/pull/2631) [FEATURE] Ajout des traductions pour la page des étudiants (SUP) (PIX-2254).
- [#2628](https://github.com/1024pix/pix/pull/2628) [FEATURE] Afficher les paliers liés à un profil cible (PIX-2224).
- [#2642](https://github.com/1024pix/pix/pull/2642) [FEATURE] Ajouter la traduction des messages d'erreurs lors de la création d'une campagne. (PIX-2198)
- [#2634](https://github.com/1024pix/pix/pull/2634) [FEATURE] Rendre l'image des scorecard accessible (PIX-1849).
- [#2640](https://github.com/1024pix/pix/pull/2640) [FEATURE] Retirer les succès pour les utilisateurs anonymes (PIX-2275).
- [#2646](https://github.com/1024pix/pix/pull/2646) [FEATURE] Ajouter la date de création des profils cibles dans Pix Admin(PIX-2248)
- [#2649](https://github.com/1024pix/pix/pull/2649) [FEATURE] Dans la page Mon compte de Pix App (.org), mettre le label "Langages" au singulier (PIX-2282).
- [#2626](https://github.com/1024pix/pix/pull/2626) [FEATURE] Traduire dans l'API l'invitation à rejoindre Pix Orga (PIX-2212).
- [#2616](https://github.com/1024pix/pix/pull/2616) [FEATURE] Dans Pix App, ajouter "Mon compte" dans le menu utilisateur (PIX-2106).
- [#2661](https://github.com/1024pix/pix/pull/2661) [BUGFIX] Empêcher le téléchargement de résultats non publiés sur orga  (PIX-2293)
- [#2654](https://github.com/1024pix/pix/pull/2654) [TECH] Réactiver le linter pour Pix Admin
- [#2652](https://github.com/1024pix/pix/pull/2652) [TECH] Suppression des espaces inutiles dans les fichiers servers.conf. 
- [#2645](https://github.com/1024pix/pix/pull/2645) [TECH][API] Ajout d'un module i18n dans l'API pour dynamiser les traductions (Pix-2285)
- [#2643](https://github.com/1024pix/pix/pull/2643) [TECH] Mise à jour du paquet de SendInBlue de la 7.2.4 pour 8.2.0.
- [#2627](https://github.com/1024pix/pix/pull/2627) [TECH] Bumper les paquets Cypress et load-testing.
- [#2641](https://github.com/1024pix/pix/pull/2641) [CLEANUP] refacto récupération de la liste des classes sco (PIX-2280)

## v3.27.0 (01/03/2021)

- [#2638](https://github.com/1024pix/pix/pull/2638) [FEATURE] Affichage de la liste des sessions à traiter dans pix-admin (PIX-2040)
- [#2622](https://github.com/1024pix/pix/pull/2622) [FEATURE] Traduire la page de participant d'une collecte de profils (PIX-2203).
- [#2617](https://github.com/1024pix/pix/pull/2617) [FEATURE] Ajout du filtre sur les classes pour pouvoir récupérer les résultats de certification par classe sur PixOrga (PIX-2195)
- [#2633](https://github.com/1024pix/pix/pull/2633) [FEATURE] Préparation à l'affichage des sessions à traiter (PIX-2040)
- [#2637](https://github.com/1024pix/pix/pull/2637) [BUGFIX] Le mauvais nombre de paliers est affiché sur les cartes de participations (PIX-2277).
- [#2630](https://github.com/1024pix/pix/pull/2630) [BUGFIX] Affichage de l'instruction avec des liens (PIX-2267).
- [#2615](https://github.com/1024pix/pix/pull/2615) [BUGFIX] Corriger le changement de mot de passe à usage unique pour un élève qui tente de se réconcilier (PIX-2196).
- [#2632](https://github.com/1024pix/pix/pull/2632) [TECH] Améliorer l'accessibilité du tableaux de résultats par compétences en campagne (PIX-1885).
- [#2623](https://github.com/1024pix/pix/pull/2623) [TECH] Proposition : supprimer MailJet 💣 📨 
- [#2635](https://github.com/1024pix/pix/pull/2635) [TECH] Mise à jour des dépendances du module racine.
- [#2625](https://github.com/1024pix/pix/pull/2625) [CLEAN] Suppression de la bannière de niveau 6 (PIX-2234).

## v3.26.0 (26/02/2021)

- [#2621](https://github.com/1024pix/pix/pull/2621) [FEATURE] Endpoint de téléchargement des résultats de certification SCO par classe depuis pix-orga (PIX-2193)
- [#2597](https://github.com/1024pix/pix/pull/2597) [FEATURE] Ajouter les liens CGU et Protection des données dans le footer de Pix App (PIX-2125).
- [#2602](https://github.com/1024pix/pix/pull/2602) [FEATURE] Traduction de la page de la liste des participants d’une campagne de collecte de profils (PIX-2200).
- [#2600](https://github.com/1024pix/pix/pull/2600) [FEATURE] Traduction de la page de résultats collectifs d’une campagne d'évaluation (PIX-2145).
- [#2589](https://github.com/1024pix/pix/pull/2589) [FEATURE] Traduction de la page de la liste des participants d'une campagne d'évaluation(PIX-2158).
- [#2619](https://github.com/1024pix/pix/pull/2619) [TECH] Ajouter prescriberTitle et prescriberDescription en base de données(PIX-2167)
- [#2605](https://github.com/1024pix/pix/pull/2605) [TECH] Ecriture d'un script à exécuter en local pour créer en masse des certifications dans une organisation (PIX-2194)
- [#2618](https://github.com/1024pix/pix/pull/2618) [TECH] Retrait du feature toggle d'activation de la catégorisation des signalements (PIX-1999)
- [#2614](https://github.com/1024pix/pix/pull/2614) [TECH] Retrait du feature toggle pour la prescription de certif SCO (PIX-1599)
- [#2612](https://github.com/1024pix/pix/pull/2612) Corrige le tri des competences pour le livret scolaire

## v3.25.0 (25/02/2021)

- [#2610](https://github.com/1024pix/pix/pull/2610) [FEATURE] Ajout de la traduction pour la tooltip des crédits (PIX-2197)
- [#2613](https://github.com/1024pix/pix/pull/2613) [FEATURE] Traduire la page de modification pour les campagnes d'évaluation et de collecte de profils (PIX-2204) 
- [#2598](https://github.com/1024pix/pix/pull/2598) [FEATURE] Ajout d'un nouvel onglet "Certifications" dans le menu de PixOrga (pix-2190)
- [#2607](https://github.com/1024pix/pix/pull/2607) [FEATURE] Afficher la bannière de création de campagne pour les organismes SCO Agriculture (PIX-2219)
- [#2608](https://github.com/1024pix/pix/pull/2608) [BUGFIX] Eviter de voir l'écran de warning après une épreuve timée (PIX-2176).
- [#2592](https://github.com/1024pix/pix/pull/2592) [TECH] Ne pas jeter d'erreur s'il n'y a pas de solution à une clé de réponse donnée
- [#2566](https://github.com/1024pix/pix/pull/2566) [TECH] Suppression du timer en doublon
- [#2593](https://github.com/1024pix/pix/pull/2593) [CLEANUP] Bumper ember-keyboard et glimmerizer les composants associés (PIX-2211).

## v3.24.0 (23/02/2021)

- [#2603](https://github.com/1024pix/pix/pull/2603) [FEATURE] Ne pas afficher "Envoyé le" lorsque que la campagne n'est pas partagé ( PIX-2149)
- [#2583](https://github.com/1024pix/pix/pull/2583) [FEATURE] Suppression du feature toggle "Accueil & Mes parcours" et suppression du bandeau de reprise de campagne d'évaluation (PIX-2150).
- [#2584](https://github.com/1024pix/pix/pull/2584) [FEATURE] Traduction de la page d'analyse d'une campagne d'évaluation dans Pix Orga (PIX-2147).
- [#2575](https://github.com/1024pix/pix/pull/2575) [FEATURE] Ajouter les paliers sur les carte archivées et Terminées (Pix-2006)
- [#2578](https://github.com/1024pix/pix/pull/2578) [FEATURE] Traduction de la page de résultats individuels d'une campagne d'évaluation (PIX-2148).
- [#2595](https://github.com/1024pix/pix/pull/2595) [FEATURE] Permettre à un utilisateur connecté à app.pix.org de changer sa langue sur la page "Mon compte" (PIX-1176).
- [#2599](https://github.com/1024pix/pix/pull/2599) [TECH] Pouvoir tester l'algo sur un profil cible (PIX-2062).
- [#2609](https://github.com/1024pix/pix/pull/2609) [BUG] Correction d'un flaky test dans CampaignController (PIX-2223)

## v3.23.0 (22/02/2021)

- [#2568](https://github.com/1024pix/pix/pull/2568) [FEATURE] Rattacher un utilisateur à un centre de certification dans Pix Admin (PIX-503).
- [#2581](https://github.com/1024pix/pix/pull/2581) [FEATURE] Créer la route de récupération des résultats de certif pour orga (PIX-2191)
- [#2577](https://github.com/1024pix/pix/pull/2577) [FEATURE] ABCDiag - Ne pas afficher la landing page pour les campagnes “ForAbsoluteNovice” (PIX-2129).
- [#2579](https://github.com/1024pix/pix/pull/2579) [FEATURE] Désactiver la saisie automatique des champs dans le formulaire de changement d'e-mail de Pix App (PIX-2189).
- [#2358](https://github.com/1024pix/pix/pull/2358) [FEATURE] Sécuriser l'API pour le livret scolaire (PIX-1937).
- [#2590](https://github.com/1024pix/pix/pull/2590) [FEATURE] Trier la liste des sessions sans problème par date de finalisation ascendante dans PixAdmin (PIX-2207)
- [#2582](https://github.com/1024pix/pix/pull/2582) [BUGFIX] Corrige la publication de sessions sans certifications
- [#2594](https://github.com/1024pix/pix/pull/2594) [TECH] Supprimer des tests inutiles.
- [#2588](https://github.com/1024pix/pix/pull/2588) [TECH] Améliorer l'orthographe pour prévenir les bugs.
- [#2552](https://github.com/1024pix/pix/pull/2552) [TECH] Rafraîchir le cache en ligne de commande.
- [#2389](https://github.com/1024pix/pix/pull/2389) [CLEANUP] Glimmerizer des composants Pix APP (PIX-2186).

## v3.22.0 (19/02/2021)

- [#2586](https://github.com/1024pix/pix/pull/2586) [FEATURE] Marquer le signalement 'Problème technique' en tant que signalement impactant (PIX-2058)
- [#2574](https://github.com/1024pix/pix/pull/2574) [FEATURE] Ne pas afficher le lien de partage pour les campagnes pour débutant (PIX-2131).
- [#2570](https://github.com/1024pix/pix/pull/2570) [FEATURE] Déconnecter un utilisateur anonyme lorsqu'il accède à une campagne à accès simplifié (PIX-2097).
- [#2560](https://github.com/1024pix/pix/pull/2560) [FEATURE] Traduction de la page de détails d'une campagne (PIX-2144).
- [#2580](https://github.com/1024pix/pix/pull/2580) [BUGFIX] Affichage du nom de la compétence dans les notifications de gain de niveau (PIX-2172).
- [#2569](https://github.com/1024pix/pix/pull/2569) [BUGFIX] Pôle-emploi - Corriger la gestion du refus d'un demandeur d'emploi, interdisant PIX d'utiliser ses données (PIX-2165).
- [#2573](https://github.com/1024pix/pix/pull/2573) [BUGFIX] Dans Pix Orga, interdire l'accès à la page de détail d'une campagne, à un utilisateur qui n'est pas membre de organisation liée (PIX-2183).
- [#2585](https://github.com/1024pix/pix/pull/2585) [TECH] Correction dans le nom des onglets des fichiers ODS de PixCertif (PIX-2075)
- [#2587](https://github.com/1024pix/pix/pull/2587) [TECH] Ignorer l'indisponibilité temporaire de martinfowler.com.
- [#2550](https://github.com/1024pix/pix/pull/2550) [TECH] Empêcher le démarrage de l'API si la configuration est incorrecte.
- [#2576](https://github.com/1024pix/pix/pull/2576) [TECH] Ajouter le feature toggle sur la récupération des résultats de certif SCO sur Pix Orga (pix-2180)
- [#2572](https://github.com/1024pix/pix/pull/2572) [A11Y] Ajouter une exception à la règle no-duplicate-landmark-elements du linter (PIX-2187).

## v3.21.0 (17/02/2021)

- [#2558](https://github.com/1024pix/pix/pull/2558) [FEATURE] Traduction de la page de création de campagne (PIX-2143).
- [#2522](https://github.com/1024pix/pix/pull/2522) [FEATURE] Voir le nombre de participants et supprimer les filtres dans la bannière de filtres (PIX-2056).
- [#2539](https://github.com/1024pix/pix/pull/2539) [FEATURE] Ajouter la saisie du mot de passe pour le changement d'adresse e-mail sur Pix App (PIX-1745).
- [#2557](https://github.com/1024pix/pix/pull/2557) [FEATURE] Traduction de la liste des campagnes dans Pix Orga (PIX-2142).
- [#2554](https://github.com/1024pix/pix/pull/2554) [FEATURE] Affichage des sujets et tutos en anglais lorsque la langue saisie est "en" dans l'analyse individuelle d'une campagne d'évaluation (PIX-2101).
- [#2562](https://github.com/1024pix/pix/pull/2562) [FEATURE] Ne pas afficher le didacticiel pour une campagne simplifiée pour des novices (PIX-2130).
- [#2527](https://github.com/1024pix/pix/pull/2527) [FEATURE] Afficher la liste des sessions à publier (PIX-2095)
- [#2567](https://github.com/1024pix/pix/pull/2567) [BUGFIX] Corriger un problème d'affichage des tables dans Pix Admin (PIX-2179)
- [#2533](https://github.com/1024pix/pix/pull/2533) [TECH] Mettre le composant PixIconButton partout dans PixOrga (PIX-2138).
- [#2565](https://github.com/1024pix/pix/pull/2565) [TECH] Ajuster l'appel au linter stylelint.
- [#2553](https://github.com/1024pix/pix/pull/2553) [TECH] Corriger le flaky test sur PUT /api/schooling-registration-user-associations/possibilities de l'API (PIX-2157).
- [#2547](https://github.com/1024pix/pix/pull/2547) [A11Y] Suppression de tag 'alt' inutile (PIX-1895).
- [#2561](https://github.com/1024pix/pix/pull/2561) [API] Corriger le flaky test du script create-certification-center-memberships-from-organization-admins_test.js (PIX-2169).

## v3.20.0 (16/02/2021)

- [#2556](https://github.com/1024pix/pix/pull/2556) [FEATURE] Ajouter un lien à la bannière du TDB (PIX-2123).
- [#2515](https://github.com/1024pix/pix/pull/2515) [FEATURE] Demander 2 fois la saisie de l’adresse e-mail pour la modifier dans la page "Mon compte" sur Pix App (PIX-2082).
- [#2536](https://github.com/1024pix/pix/pull/2536) [FEATURE] Affichage des sujets et tutos en anglais lorsque la langue saisie est "en" dans l'analyse globale d'une campagne d'évaluation (PIX-2100).
- [#2543](https://github.com/1024pix/pix/pull/2543) [FEATURE] Je veux des alt corrects pour les logo Pix qui me renvoie sur l'accueil (PIX-1837).
- [#2564](https://github.com/1024pix/pix/pull/2564) [BUGFIX] Bloquer les réponses après lorsque le délais de réponse est dépassé (PIX-2171).
- [#2563](https://github.com/1024pix/pix/pull/2563) [BUGFIX] Pouvoir envoyer une réponse vide quand le temps est passé (PIX-2170).
- [#2544](https://github.com/1024pix/pix/pull/2544) [BUGFIX] Avoir une erreur 400 quand le format de réponse n'est pas le bon (PIX-2116).
- [#2545](https://github.com/1024pix/pix/pull/2545) [BUGFIX] Gérer le retour à la ligne de l'icone nouvel onglet (PIX-2152).
- [#2548](https://github.com/1024pix/pix/pull/2548) [TECH] Améliorer l'a11y de la page checkpoint (PIX-1863).
- [#2546](https://github.com/1024pix/pix/pull/2546) [CLEANUP] Suppression du toggle d'envoi automatique des resultats (PIX-2153)
- [#2555](https://github.com/1024pix/pix/pull/2555) [ORGA] Ajout de la langue anglaise sur le menu gauche, ainsi que la déconnexion (PIX-2160)

## v3.19.0 (15/02/2021)

- [#2542](https://github.com/1024pix/pix/pull/2542) [FEATURE] Amélioration de l'a11y sur la page d'accès aux campagnes (PIX-1873).
- [#2540](https://github.com/1024pix/pix/pull/2540) [FEATURE] Affichage des compétences en anglais lorsque la langue saisie est "en" dans les résultats individuels d'une campagne de collecte de profils (PIX-2114).
- [#2551](https://github.com/1024pix/pix/pull/2551) [BUGFIX] Utiliser replace au lieu de replaceAll (PIX-2155).
- [#2549](https://github.com/1024pix/pix/pull/2549) [BUGFIX] Une erreur floue s'affiche lorsqu'on publie une session sur PixAdmin (PIX-2154)

## v3.18.0 (12/02/2021)

- [#2541](https://github.com/1024pix/pix/pull/2541) [FEATURE] Changement de la couleur de la bannière (PIX-2033).
- [#2531](https://github.com/1024pix/pix/pull/2531) [FEATURE] Afficher un lien de téléchargement des résultats d'une session dans Pix Admin (PIX-2042)
- [#2498](https://github.com/1024pix/pix/pull/2498) [FEATURE] Ajout du Pix-score sur le tableau de bord (PIX-1660).
- [#2506](https://github.com/1024pix/pix/pull/2506) [FEATURE] Ajout des cartes archivés dans la page 'mes-parcours' (Pix-2005)
- [#2537](https://github.com/1024pix/pix/pull/2537) [BUGFIX] Corriger la marge dans les cartes de parcours (PIX-2006).
- [#2534](https://github.com/1024pix/pix/pull/2534) [BUGFIX] Eviter l'échec du hook des seeds dans les RAs en évitant d'ouvrir plusieurs connexions à la BDD (PIX-2139)
- [#2538](https://github.com/1024pix/pix/pull/2538) [TECH] Récupérer toutes les épreuves posées par l'algo et y répondre juste (PIX-2061).
- [#2530](https://github.com/1024pix/pix/pull/2530) [TECH] Corriger et refactorer les seeds (PIX-2137).
- [#2532](https://github.com/1024pix/pix/pull/2532) [TECH] Rendre les tests de target-profile-repository déterministes.
- [#2529](https://github.com/1024pix/pix/pull/2529) [TECH] Ajouter un titre sur les liens externes dans les consignes (PIX-2124).

## v3.17.0 (10/02/2021)

- [#2508](https://github.com/1024pix/pix/pull/2508) [FEATURE] Amélioration de la phrase sur le consentement dans la landing page pour un parcours (PIX-2109).
- [#2521](https://github.com/1024pix/pix/pull/2521) [FEATURE]Affichage des compétences en anglais lorsque la langue saisie est "en" dans les résultats individuels d'une campagne d'évaluation (PIX-2099).
- [#2511](https://github.com/1024pix/pix/pull/2511) [FEATURE] Permettre au script de création de membres de centre de certification d'ajouter de nouveaux membres (PIX-1948).
- [#2519](https://github.com/1024pix/pix/pull/2519) [FEATURE] Bloquer l'import des candidats pour tous les formats d'ODS sauf la liste des candidats (PIX-2074) 
- [#2520](https://github.com/1024pix/pix/pull/2520) [FEATURE] Ne plus afficher l'état d'avancement lorsque le participant a partagé ses résultats (PIX-2127).
- [#2501](https://github.com/1024pix/pix/pull/2501) [FEATURE] Changer le contenu de la tooltip dans le modèle de liste des candidats (PIX-2085)
- [#2526](https://github.com/1024pix/pix/pull/2526) [BUGFIX] Corriger la taille de l'abeille sur la page de partage de profil (PIX-2115)
- [#2517](https://github.com/1024pix/pix/pull/2517) [TECH] Supprimer la route dépréciée users /{id}/certification-center-memberships. 

## v3.16.0 (08/02/2021)

- [#2507](https://github.com/1024pix/pix/pull/2507) [FEATURE] Afficher la liste des membres d'un centre de certification dans Pix Admin (PIX-504).
- [#2495](https://github.com/1024pix/pix/pull/2495) [FEATURE] Afficher un message quand le tableau de bord est vide (PIX-2081).
- [#2505](https://github.com/1024pix/pix/pull/2505) [FEATURE] Affichage des compétences en anglais lorsque la langue saisie est "en" dans l'onglet des résultats collectifs (PIX-2098).
- [#2499](https://github.com/1024pix/pix/pull/2499) [FEATURE] Obtenir la liste des sessions "sans problème" (PIX-2095)
- [#2496](https://github.com/1024pix/pix/pull/2496) [FEATURE] Ajouter un bandeau Pix Certif pour la fonctionnalité d'envoi automatique des résultats (PIX-2087)
- [#2518](https://github.com/1024pix/pix/pull/2518) [TECH] Empêcher le rechargement infini des tests dans Pix Admin
- [#2512](https://github.com/1024pix/pix/pull/2512) [TECH] Génération des snapshots KE pour les données de seeds (dév/local/RA) (PIX-2119)

## v3.15.0 (04/02/2021)

- [#2503](https://github.com/1024pix/pix/pull/2503) [BUGFIX] Le script dév/local de génération de campagnes avec participants ne fonctionne plus (PIX-2108)
- [#2502](https://github.com/1024pix/pix/pull/2502) [BUGFIX] Les filtres sur les paliers dans la liste des participants d'une campagne sur PixOrga ne fonctionnent pas correctement (PIX-2107)

## v3.14.0 (03/02/2021)

- [#2486](https://github.com/1024pix/pix/pull/2486) [FEATURE] Ajout de "Mes parcours" dans le menu de Pix App (PIX-2004)
- [#2477](https://github.com/1024pix/pix/pull/2477) [FEATURE] Ajout du résultat dans les cartes terminées des tableaux de bord (PIX-2049)
- [#2488](https://github.com/1024pix/pix/pull/2488) [FEATURE] Changer l'entrée de menu "Profil" en "Compétences" (PIX-2080).
- [#2476](https://github.com/1024pix/pix/pull/2476) [FEATURE] Permettre aux utilisateurs de modifier leur adresse e-mail (PIX-2045).
- [#2481](https://github.com/1024pix/pix/pull/2481) [FEATURE] Améliorations de la page de finalisation de session (PIX-1996)
- [#2492](https://github.com/1024pix/pix/pull/2492) [FEATURE] Affichage des résultats thématiques dans les résultats individuels d'une campagne d'évaluation (PIX-2054).
- [#2463](https://github.com/1024pix/pix/pull/2463) [FEATURE] Filtrer les participations aux campagnes d'évaluation par paliers (PIX-1676).
- [#2491](https://github.com/1024pix/pix/pull/2491) [FEATURE] Affichage des paliers dans les résultats individuels d'une campagne d'évaluation (PIX-2053).
- [#2489](https://github.com/1024pix/pix/pull/2489) [BUGFIX] Pouvoir se réconcilier après avoir eu une erreur et corrigé ses infos lors de la réconciliation SCO.
- [#2464](https://github.com/1024pix/pix/pull/2464) [TECH] Valider les identifiants dans l'API.
- [#2450](https://github.com/1024pix/pix/pull/2450) [TECH] Prévenir l'introduction de liens non joignables dans la documentation.
- [#2447](https://github.com/1024pix/pix/pull/2447) [DOC] ADR - Caractère obligatoire ou optionnel du use-case.

## v3.13.0 (02/02/2021)

- [#2487](https://github.com/1024pix/pix/pull/2487) [FEATURE] Passage du header, footer et TDB en 1280px (PIX-1994). 
- [#2485](https://github.com/1024pix/pix/pull/2485) [FEATURE] Préparer l'affichage de la liste des sessions publiables (a.k.a "Sans problèmes") (PIX-2094)
- [#2483](https://github.com/1024pix/pix/pull/2483) [FEATURE] Redirige vers le dashboard quand la feature est activée (PIX-1751).
- [#2482](https://github.com/1024pix/pix/pull/2482) [FEATURE] Rediriger vers la page par défaut de Pix App lorsqu'un utilisateur saisis /mes-parcours dans l'url et n'a pas de parcours (PIX-2007).
- [#2494](https://github.com/1024pix/pix/pull/2494) [BUGFIX] Fix les notifications lors de la publication de session dans pix-certif (PIX-2096)
- [#2442](https://github.com/1024pix/pix/pull/2442) [BUGFIX] Empêcher les suggestions de navigateurs sur les champs de saisie (1834)
- [#2490](https://github.com/1024pix/pix/pull/2490) [TECH] Installer la même version de node en local que dans la CI.
- [#2493](https://github.com/1024pix/pix/pull/2493) [TECH] Update Hapi dependencies after Joi upgrade
- [#2472](https://github.com/1024pix/pix/pull/2472) [TECH] Supprimer les colonnes inutilisées dans users (PIX-1711 PIX-1833).
- [#2484](https://github.com/1024pix/pix/pull/2484) [TEST] Création de la brique de test de l'algo (PIX-2060).

## v3.12.0 (01/02/2021)

- [#2439](https://github.com/1024pix/pix/pull/2439) [FEATURE] Enregistrer la date de l'envoi des résultats lors de l'envoi automatique (PIX-1339)
- [#2475](https://github.com/1024pix/pix/pull/2475) [TECH] Mise à jour Ember de pix-certif de la version 3.22 à 3.23
- [#2423](https://github.com/1024pix/pix/pull/2423) [CLEANUP] Séparer la logique de génération de csv du usecase lors de l'import du template de liste de candidats

## v3.11.0 (01/02/2021)

- [#2455](https://github.com/1024pix/pix/pull/2455) [FEATURE] Séparer la liste des membres et des invitations dans deux onglets distincts sur Pix Orga (PIX-1150).
- [#2462](https://github.com/1024pix/pix/pull/2462) [FEATURE] Cacher le bouton "Quitter" pendant un parcours aux utilisateur anonymes sur Pix App (PIX-2046).
- [#2480](https://github.com/1024pix/pix/pull/2480) [BUGFIX] Le script de calcul des acquis validés pour des participations aux parcours dépasse en mémoire lorsque la campagne a trop de participants (PIX-2079).
- [#2474](https://github.com/1024pix/pix/pull/2474) [TECH] Mise à jour Ember pour pix-admin de 3.22 à 3.23
- [#2473](https://github.com/1024pix/pix/pull/2473) [TECH] Mise à jour Ember pour Pix-App de la version 3.22 à 3.23

## v3.10.0 (29/01/2021)

- [#2471](https://github.com/1024pix/pix/pull/2471) [BUGFIX] Ajouter une validation pour les filtres passés à l'API (Pix-2068).
- [#2469](https://github.com/1024pix/pix/pull/2469) [BUGFIX] Upgrade Ember from 3.22.0 to 3.23.0 (PIX-2067).
- [#2470](https://github.com/1024pix/pix/pull/2470) [BUGFIX] L'erreur n'est pas remontée à l'utilisateur lorsque ce dernier importe un fichier CSV d'étudiants comportant une erreur dans la colonne Adresse e-mail dans PixOrga (PIX-2057)
- [#2449](https://github.com/1024pix/pix/pull/2449) [BUGFIX] Éviter de créer deux assessments lors d'un retenter (PIX-2048).
- [#2461](https://github.com/1024pix/pix/pull/2461) [TECH] Création d'un script de calcul du résultats pour toutes les participations de campagne d'évaluation (PIX-1993).
- [#2396](https://github.com/1024pix/pix/pull/2396) [TECH] Mise à jour de la description du repository.
- [#2353](https://github.com/1024pix/pix/pull/2353) [TECH] Mettre à jour la BDD de la version 12.4 à la version 12.5.
- [#2405](https://github.com/1024pix/pix/pull/2405) [DOC] Ajout de l'ADR sur la spécification de la version de NodeJS.

## v3.9.0 (28/01/2021)

- [#2446](https://github.com/1024pix/pix/pull/2446) [FEATURE] Masquer les élèves des années précédentes dans Pix Certif (PIX-2022)
- [#2459](https://github.com/1024pix/pix/pull/2459) [FEATURE] Afficher la première lettre du prénom et nom de l'utilisateur en majuscule sur le profil dans Pix Orga/App/Certif (PIX-329).
- [#2434](https://github.com/1024pix/pix/pull/2434) [FEATURE] Afficher le descriptif d'un sujet sur Pix Orga au sein de l'onglet analyse lorsque je le déplie (PIX-1997).
- [#2445](https://github.com/1024pix/pix/pull/2445) [FEATURE] Ajout des cartes terminées dans mes parcours (PIX-2003)
- [#2451](https://github.com/1024pix/pix/pull/2451) [FEATURE] Afficher la page de detail d'un centre de certification dans Pix Admin (PIX-500).
- [#2468](https://github.com/1024pix/pix/pull/2468) [BUGFIX] Corriger l'apparition furtive de la page d'erreur suite à l'acceptation des CGU Pôle Emploi (PIX-2036).
- [#2453](https://github.com/1024pix/pix/pull/2453) [BUGFIX] Récupérer correctement l'erreur provenant de l'API (Sentry)
- [#2465](https://github.com/1024pix/pix/pull/2465) [BUGFIX] Eviter les erreurs de casse sur les e-mails (PIX-2052).
- [#2410](https://github.com/1024pix/pix/pull/2410) [TECH] Création d'helpers de tests front respectueux de l'a11y sur PixOrga (PIX-2008)
- [#2448](https://github.com/1024pix/pix/pull/2448) [TECH] Utiliser Pix Tooltip dans Pix Orga (Pix-2000).

## v3.8.1 (27/01/2021)

- [#2452](https://github.com/1024pix/pix/pull/2452) [BUGFIX] Corriger une faute la bannière SCO de Pix Certif (PIX-2030)
- [#2428](https://github.com/1024pix/pix/pull/2428) [TECH] Remplacer le package déprécié @hapi/joi par joi.
- [#2435](https://github.com/1024pix/pix/pull/2435) [TECH] Calculer le nombre d'acquis obtenus lors du partage des résultats d'une campagne (Pix-1989).
- [#2458](https://github.com/1024pix/pix/pull/2458) [Certif] Réparer le lien pour le lien de téléchargement du PV d'incident (PIX-2051)

## v3.8.0 (26/01/2021)

- [#2436](https://github.com/1024pix/pix/pull/2436) [FEATURE] Permettre à un utilisateur de passer un parcours Accès Simplifié sans inscription sur Pix App (PIX-1040).
- [#2416](https://github.com/1024pix/pix/pull/2416) [FEATURE] Ajout du filtre sur les résultats thématiques pour les participations (PIX-1678)
- [#2440](https://github.com/1024pix/pix/pull/2440) [FEATURE] Afficher mes parcours à envoyer et en cours dans la page Mes parcours (PIX-2002)
- [#2427](https://github.com/1024pix/pix/pull/2427) [FEATURE] Dans Pix App, déconnecter un utilisateur après qu'il a envoyé ses résultats d'un parcours simplifié (PIX-2011).
- [#2441](https://github.com/1024pix/pix/pull/2441) [BUGFIX] Erreur lors de la sauvegarde d'une réponse avec null à la fin (PIX-2015).
- [#2432](https://github.com/1024pix/pix/pull/2432) [BUGFIX] Vérifier l'existence de l'objet fileType avant d'en extraire son contenu (PIX-2017).
- [#2431](https://github.com/1024pix/pix/pull/2431) [CLEANUP] Afficher les nouvelles dépréciations sur PixAPP comme des erreurs (PIX-2029).

## v3.7.0 (22/01/2021)

- [#2399](https://github.com/1024pix/pix/pull/2399) [FEATURE] Encart présentation de la page d'accueil (PIX-1656)
- [#2420](https://github.com/1024pix/pix/pull/2420) [FEATURE] Ajout de la page socle "Mes parcours" (PIX-2001).
- [#2415](https://github.com/1024pix/pix/pull/2415) [FEATURE] Ajouter les liens de téléchargements des résultats de certification aux mails (PIX-1998)
- [#2438](https://github.com/1024pix/pix/pull/2438) [BUGFIX] Correctif pour les Embed Auto (PIX-2038).
- [#2437](https://github.com/1024pix/pix/pull/2437) [BUGFIX] Le tooltip est mal positionné et n'est pas lisible sur Pix Orga (PIX-2009)
- [#2425](https://github.com/1024pix/pix/pull/2425) [BUGFIX] Pouvoir changer d'avis sur la saisie ou non de l'organisation de référence lors de la création d'un profil cible dans Pix Admin (PIX-2021).
- [#2429](https://github.com/1024pix/pix/pull/2429) [TECH] Amélioration du script de génération de participants de campagne

## v3.6.0 (21/01/2021)

- [#2413](https://github.com/1024pix/pix/pull/2413) [FEATURE] Choisir l'acquis à jouer dans les acquis qui possèdent une épreuve locale (PIX-1987).
- [#2417](https://github.com/1024pix/pix/pull/2417) [FEATURE] Pouvoir effectuer l'action "Mot de passe oublié" après la génération d'un mot de passe temporaire (PIX-1645).
- [#2419](https://github.com/1024pix/pix/pull/2419) [FEATURE] Préparer la génération du fichier des résultats de certif agrégés par destinataire (PIX-973)
- [#2403](https://github.com/1024pix/pix/pull/2403) [FEATURE] Créer le bloc "Reprendre une compétence" (PIX-1654).
- [#2421](https://github.com/1024pix/pix/pull/2421) [BUGFIX] Arrêter d'intercepter des messages d'autres origines (PIX-2010).
- [#2424](https://github.com/1024pix/pix/pull/2424) [BUGFIX] Corriger une variable indéfinie dans le service d'envoi de mail

## v3.5.0 (20/01/2021)

- [#2409](https://github.com/1024pix/pix/pull/2409) [FEATURE] Rediriger l'utilisateur vers la page des CGU Pôle Emploi sur Pix App(PIX-1695).
- [#2388](https://github.com/1024pix/pix/pull/2388) [FEATURE] Création d'un profil cible avec ses acquis dans PixAdmin (Pix-1757)
- [#2402](https://github.com/1024pix/pix/pull/2402) [FEATURE] Améliorations mineures de Pix Admin (PIX-1986)
- [#2404](https://github.com/1024pix/pix/pull/2404) [FEATURE] Afficher les competences et tubes par acquis dans Pix Admin (PIX-1991).
- [#2418](https://github.com/1024pix/pix/pull/2418) [BUGFIX] Revert de l'option timezone du format-date dans le certificat
- [#2414](https://github.com/1024pix/pix/pull/2414) [BUGFIX] Corrige l'affichage de la colonne "créé le" dans la liste des campagnes de Pix Orga (PIX-2014).
- [#2377](https://github.com/1024pix/pix/pull/2377) [CLEANUP] Suppression des attributs non utilisés members et memberships du modèle Organization côté API (PIX-1977)

## v3.4.0 (19/01/2021)

- [#2412](https://github.com/1024pix/pix/pull/2412) [FEATURE] Amélioration du wording des catégories de signalement (PIX-1995)
- [#2394](https://github.com/1024pix/pix/pull/2394) [FEATURE] Affichage des compétences recommandées dans le tableau de bord (PIX-1653).
- [#2392](https://github.com/1024pix/pix/pull/2392) [FEATURE] Changement de style pour le menu (PIX-1655).
- [#2386](https://github.com/1024pix/pix/pull/2386) [FEATURE] Mettre le filtre classe recherchable pour les campagnes (PIX-1981)
- [#2400](https://github.com/1024pix/pix/pull/2400) [FEATURE] Remonter l'information qu'une campagne est à accès simplifié (PIX-1135).
- [#2401](https://github.com/1024pix/pix/pull/2401) [FEATURE] Enlever le chevron dans Pix Orga au sein de l'onglet analyse quand il n'y a pas de tutoriels (PIX-1811).
- [#2390](https://github.com/1024pix/pix/pull/2390) [FEATURE] Améliorer le wording de la page de finalisation d'une session (PIX-1985)
- [#2398](https://github.com/1024pix/pix/pull/2398) [FEATURE] Pré remplissage de la liste des candidats à une session de certification (PIX-1597)
- [#2384](https://github.com/1024pix/pix/pull/2384) [BUGFIX] Rendre l'affichage de la date de naissance du certificat insensible aux fuseaux horaires (PIX-1824)
- [#2408](https://github.com/1024pix/pix/pull/2408) [BUG] Correction de flacky test sur les campaign report repository (PIX-1988)
- [#2373](https://github.com/1024pix/pix/pull/2373) [CLEANUP] Retrait de la route API dépreciée qui permettant de récupérer les competence-evaluations d'un assessment (PIX-1975)

## v3.3.0 (18/01/2021)

- [#2379](https://github.com/1024pix/pix/pull/2379) [FEATURE] Permettre de filtrer par classe les profils dans les resultats du campagne de collecte de profils (PIX-1681).
- [#2380](https://github.com/1024pix/pix/pull/2380) [FEATURE] Ajouter une colonne qui affiche le nombre de tutoriels par sujet dans l'onglet analyse de Pix Orga (PIX-1955).
- [#2397](https://github.com/1024pix/pix/pull/2397) [BUGFIX] Corriger certains bugs lors du changement de centre de certification dans Pix Certif (PIX-1980).
- [#2352](https://github.com/1024pix/pix/pull/2352) [TECH] Faire émerger un nouveau read-model CampaignReport (PIX-1770).
- [#2360](https://github.com/1024pix/pix/pull/2360) [TECH] Aligner la version de node local-CI-PAAS.
- [#2393](https://github.com/1024pix/pix/pull/2393) [TECH] Mise à jour de axios de 0.21.0 vers 0.21.1.
- [#2385](https://github.com/1024pix/pix/pull/2385) [TECH] Corriger les tests instables de l'import SIECLE (PIX-1732).
- [#2406](https://github.com/1024pix/pix/pull/2406) [FIX] Corrige la fuite mémoire au niveau de la validation XML SAML
- [#2407](https://github.com/1024pix/pix/pull/2407) [FIX] Réintroduit le logging système sur l'API
- [#2395](https://github.com/1024pix/pix/pull/2395) [FIX] Corrige le rattachement d'un profil cible à une ou plusieurs organisations

## v3.2.0 (14/01/2021)

- [#2391](https://github.com/1024pix/pix/pull/2391) [FEATURE] Mise à jour de la bannière de campagnes dans Pix Orga (PIX-1776).
- [#2383](https://github.com/1024pix/pix/pull/2383) [FEATURE] Créer un menu de navigation pour Pix Certif (PIX-1979)
- [#2344](https://github.com/1024pix/pix/pull/2344) [FEATURE] Amélioration du script de création des memberships des centres de certification (PIX-1942).
- [#2367](https://github.com/1024pix/pix/pull/2367) [FEATURE] Affiche les clés de lecture associées aux profils cible dans l'admin (PIX-1966).
- [#2371](https://github.com/1024pix/pix/pull/2371) [FEATURE] Déplacer le bouton Pôle Emploi dans la page de connexion Pix App (PIX-1946).
- [#2387](https://github.com/1024pix/pix/pull/2387) [BUGFIX] Les résultats d'une campagne participation s'affichent pas de temps en temps (PIX-1984).
- [#2372](https://github.com/1024pix/pix/pull/2372) [TECH] Renomme le champ organizationId en ownerOrganizationId dans la table target profiles
- [#2296](https://github.com/1024pix/pix/pull/2296) [TECH] Mise à jour de samlify 2.4.0 à 2.7.6.
- [#2382](https://github.com/1024pix/pix/pull/2382) [CLEANUP] Enlever les décorateurs @classic des routes de Pix App (PIX-1983).
- [#2375](https://github.com/1024pix/pix/pull/2375) [DOC] Documentation de l'usage des `hasMany` dans Ember.

## v3.1.0 (13/01/2021)

- [#2366](https://github.com/1024pix/pix/pull/2366) [FEATURE] Conditionner la création d'un compte PE à la validation des CGU (PIX-1956)
- [#2376](https://github.com/1024pix/pix/pull/2376) [FEATURE] Afficher une documentation spécifique pour les missions laïques françaises (ou MLF) (PIX-1976).
- [#2378](https://github.com/1024pix/pix/pull/2378) [FEATURE] Voir le nombre de "signalements impactants" dans la liste des certification dans Pix Admin (PIX-1519)
- [#2369](https://github.com/1024pix/pix/pull/2369) [FEATURE] Modifier le niveau max atteignable et le nombre de pix max atteignable sur pix-admin (PIX-1810).
- [#2365](https://github.com/1024pix/pix/pull/2365) [FEATURE] Afficher le détail des signalements dans Pix Admin (PIX-1522)
- [#2381](https://github.com/1024pix/pix/pull/2381) [TECH] Mise à jour du script de création des campagnes de collecte de profils (PIX-1978).
- [#2370](https://github.com/1024pix/pix/pull/2370) [TECH] Supprime la relation hasMany organization sur les target profile

## v3.0.0 (11/01/2021)

- [TECH] Montée de version majeure des applications métier motivée par le remplacement d'Airtable par Pix LCMS API

## v2.* et v1.*

Après la v3.204.0 nous avons retiré de notre changelog les versions < v3.0.0.

L'accès à ces changements restent disponibles [dans notre historique Git](https://github.com/1024pix/pix/blob/v3.204.0/CHANGELOG.md).
