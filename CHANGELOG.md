# Pix Changelog

## 1.31.0 (05/12/2017)

[#610](https://github.com/sgmap/pix/pulls/610) [FEATURE] Calculer le score d'une certification (US-886). 
[#605](https://github.com/sgmap/pix/pulls/605) [FEATURE] Création d'un burger menu (US-692).
[#608](https://github.com/sgmap/pix/pulls/608) [TECH] Correction du déploiement de preview (US-977). 
[#617](https://github.com/sgmap/pix/pulls/617) [BUGFIX] Redirection vers la page de résultats à la fin d'une preview de challenge et plus sur la page de fin de certification (US-945). 
[#616](https://github.com/sgmap/pix/pulls/616) [BUGFIX] Correction du calcul de score (US-994).

## 1.30.0 (04/12/2017)

- [#611](https://github.com/sgmap/pix/pulls/611) [BUGFIX] resolution du bug qui ne lançait pas le test de certification si aucun challenge n'est associé à un skill déjà validé (US-980).
- [#612](https://github.com/sgmap/pix/pulls/612) [FEATURE] Mettre le Prénom avant le Nom à l'inscription (US-715).
- [#603](https://github.com/sgmap/pix/pulls/603) [FEATURE] Répondre à des questions d'un test de certification (US-890).
- [#613](https://github.com/sgmap/pix/pulls/613) [BUGFIX] Fix affichage des boutons "replay"/"seconde chance" des tests de positionnement (US-965).
- [#608](https://github.com/sgmap/pix/pulls/608) [TECH] Correction du déploiement de preview (US-977).
- [#597](https://github.com/sgmap/pix/pulls/597) [FEATURE] Ajouter un loader quand une question est passée/validée et modifier le "Je passe" (US-898).

## 1.29.2 (01/12/2017)

- [#591](https://github.com/sgmap/pix/pulls/591) [TECH] Utilisation de vues privées au niveau des Epreuves (dans Airtable) afin de sécuriser (stabiliser) la plateforme (US-892).
- [#602](https://github.com/sgmap/pix/pulls/602) [BUGFIX] Correction d'une modale grise (US-921).
- [#606](https://github.com/sgmap/pix/pulls/606) [CLEANUP] Ajout d'une règle sur le nombre de traitemetns maximum sur une fonction (US-971).

## 1.29.1 (29/11/2017)
- [#609](https://github.com/sgmap/pix/pull/609) [HOTFIX] Réduction du nombre de connexions maximum à la base de données (US-978).

## 1.29.0 (27/11/2017)
- [#588](https://github.com/sgmap/pix/pull/588) [FEATURE] Création du test de certification depuis le front (US-870).
- [#596](https://github.com/sgmap/pix/pull/596) [FEATURE] Ajouter des favicons pour Pix (US-953).
- [#589](https://github.com/sgmap/pix/pull/589) [FEATURE] Création d'un page statique pour les résultats d'une évaluation de type certification (US-893).
- [#601](https://github.com/sgmap/pix/pull/601) [FEATURE] Désactiver les couleurs dans les logs de l'API en production (US-954). 
- [#19](https://github.com/pix-fr/infra/pull/19) [FEATURE] Accroissement du nombre d'instance d'API par server.
- [#599](https://github.com/sgmap/pix/pull/599) [TECH] Mise en place de métric sur les temps de réponse API (US-955).
- [#595](https://github.com/sgmap/pix/pull/595) [HOTFIX] Correction du scroll vers le profil lorsque l'utilisateur clic sur le bouton "choisir un test" depuis sa page de profil (US-951).
- [#604](https://github.com/sgmap/pix/pull/604) [BUGFIX] On ne doit pas proposer d'épreuves non publiées lors du calcul d'un certification profile (US-959).
- [#598](https://github.com/sgmap/pix/pull/598) [BUGFIX] Fix connection pour les producteurs d'épreuves (US-949).
- [#20](https://github.com/pix-fr/infra/pull/20) [BUGIFX] Création de l'utilisateur deploy correctement sur la production (US-956).
- [#592](https://github.com/sgmap/pix/pull/592) [CLEANUP] Prise en compte des fichiers package-lock.json.
- [#593](https://github.com/sgmap/pix/pull/593) [CLEANUP] Uniformisation de l'appel à LoDash dans l'API.
- [#594](https://github.com/sgmap/pix/pull/594) [CLEANUP] Ajout d'une propriété calculée fullName au model User.

## 1.28.0 (17/11/2017)
- [#586](https//github.com/sgmap/pix/pull/586) [FEATURE] Ajout du calcul du taux de bonne réponse pour une évaluation (US-885).
- [#579](https//github.com/sgmap/pix/pull/579) [FEATURE] Choix des épreuves pour la certification du profil (US-881).
- [#584](https//github.com/sgmap/pix/pull/584) [FEATURE] Retirer la dépendance epimetheus et avoir nos propres métriques techniques (US-829).
- [#581](https//github.com/sgmap/pix/pull/581) [FEATURE] Bouton seconde chance pour que l'utilisateur repasse la compétence (US-863).
- [#582](https//github.com/sgmap/pix/pull/582) [FEATURE] Ajout d'un panneau pour les tutoriels à venir sur la fenêtre de comparaison (US-525).
- [#578](https//github.com/sgmap/pix/pull/578) [FEATURE] Mise à jour des logos des ministères de l'éducation (Sup & SCO) (US-822).
- [#574](https//github.com/sgmap/pix/pull/574) [FEATURE] Possibilité de reprendre un test déjà commencé depuis la page du profil (US-565).
- [#575](https//github.com/sgmap/pix/pull/575) [FEATURE] Classer les acquis par odre de difficulté décroissante lors de la récupération pour un utilisateur donné - (US-880).
- [#590](https//github.com/sgmap/pix/pull/590) [BUGFIX] Correction d'une typo sur le nombre de compétences (US-948).
- [#585](https//github.com/sgmap/pix/pull/585) [BUGFIX] Correction affichage du score sur la page de résultat (US-924).
- [#583](https//github.com/sgmap/pix/pull/583) [BUGFIX] Correction problème de CSV avec compétence inexistante (US-916).
- [#580](https//github.com/sgmap/pix/pull/580) [BUGFIX] Correction du loader qui disparaît de façon impromptue au démarrage d'un test de positionnement (US-917).
- [#577](https//github.com/sgmap/pix/pull/577) [CLEANUP] Modification des dates de fin d'inscriptions pour les etablissements (US-865).
- [#563](https//github.com/sgmap/pix/pull/563) [CLEANUP] Nettoyage de code côté front (US-867).

## 1.27.0 (03/11/2017)
- [#562](https//github.com/sgmap/pix/pull/562) [FEATURE] Persistence des acquis validés et invalidés (US-819).
- [#573](https//github.com/sgmap/pix/pull/573) [FEATURE] ETQ Consommateur de l'API, JV connaître tous les Acquis validés par Compétence (US-879).
- [#545](https//github.com/sgmap/pix/pull/545) [FEATURE] La première question d'un test adaptatif est de niveau 2 et non timée (US-806).

## 1.26.0 (26/10/2017)
- [#565](https//github.com/sgmap/pix/pull/565) [FEATURE] Téléchargement d'un fichier .csv contenant les profils partagés (US-596).
- [#570](https//github.com/sgmap/pix/pull/570) [BUGFIX] Correction du JSON.parse pour la création du CSV des profils partagés  (US-596).
- [#569](https//github.com/sgmap/pix/pull/569) [BUGFIX] Correction de l'URL vers la modification de mail (US-895).
- [#568](https//github.com/sgmap/pix/pull/568) [BUGFIX] Correction du style pour le bouton "Annuler" de la modale de partage de son profil (US-896).
- [#571](https//github.com/sgmap/pix/pull/) [BUGFIX] Corrige un test rouge sur dev.
- [#572](https//github.com/sgmap/pix/pull/572) [CLEANUP] Suppression de tests fragiles.

## 1.25.2 (24/10/2017)

- [#567](https//github.com/sgmap/pix/pull/567) [REVERT] Retour en arrière sur "Changer la méthode de récupération de la base url d'origine (US-895)."

## 1.25.1 (24/10/2017)

 - [#567](https//github.com/sgmap/pix/pull/567) [BUGFIX] Changer la méthode de récupération de la base url d'origine (US-895).
 - [#568](https//github.com/sgmap/pix/pull/568) [BUGFIX] Correction du style pour le bouton "Annuler" de la modale de partage de son profil (US-896).

## 1.25.0 (24/10/2017)

 - [#548](https//github.com/sgmap/pix/pull/548) [FEATURE] Le changement du mot de passe par un utilisateur depuis un lien temporaire (US-738).
 - [#550](https//github.com/sgmap/pix/pull/550) [FEATURE] Creation de la page 'mot de passe oublié' (US-763).
 - [#553](https//github.com/sgmap/pix/pull/553) [FEATURE] Pouvoir saisir son numéro d'étudiant ainsi qu'un code campagne dans le cas d'un partage de profil pour un établissement de type SUP (US-712).
 - [#557](https//github.com/sgmap/pix/pull/557) [TECH] Montée de version d'Ember de 2.15 à 2.16 (US-891).
 - [#558](https//github.com/sgmap/pix/pull/558) [CLEANUP] Mise à jour du logo du CNED (US-838).
 - [#561](https//github.com/sgmap/pix/pull/561) [CLEANUP] Remaniement de la route courses/create-assessment (US-866).

## 1.24.0 (10/10/2017)

 - [#541](https//github.com/sgmap/pix/pull/541)[FEATURE] Possibilité d'enregistrer une demande de réinitialisation du mot de passe (US-798)
 - [#549](https//github.com/sgmap/pix/pull/549)[FEATURE] Ajouter une route attrape-tout pour rediriger les 404 vers l'accueil (US-818).
 - [#543](https//github.com/sgmap/pix/pull/543)[FEATURE] Dans un test adaptatif, deux challenges chronométrés ne se suivent jamais (US-673)
 - [#547](https//github.com/sgmap/pix/pull/547)[FEATURE] Prise en compte de ${EMAIL} dans la consigne d'une épreuve (US-809).
 - [#539](https//github.com/sgmap/pix/pull/539)[FEATURE] Vérification d'accès sur une évaluation (US-779)
 - [#544](https//github.com/sgmap/pix/pull/544)[FEATURE] Les tests adaptatifs sont rafraîchis automatiquement (US-804)
 - [#533](https//github.com/sgmap/pix/pull/533)[BUGFIX] Fixer le niveau maximal atteignable au cours d'une évaluation à 5 (US-783).
 - [#546](https//github.com/sgmap/pix/pull/546)[BUGFIX] La liste des profils partagés doit s'actualisée à chaque chargement de la page /board (US-754).
 - [#552](https//github.com/sgmap/pix/pull/552)[CLEANUP] Nettoyage de Ember Mirage.
 - [#551](https//github.com/sgmap/pix/pull/551)[CLEANUP] Mise à jour des dépendances.
 - [#540](https//github.com/sgmap/pix/pull/540)[CLEANUP] Suppression de Bower et autres dépendances inutiles en vue de pouvoir intégrer Ember Fastboot.

## 1.23.0 (15/09/2017)

- [#528](https://github.com/sgmap/pix/pull/528) [FEATURE] Ajout d'une API pour récupérer les feedbacks (avec possibilité de préciser une date de début et de fin) (US-752) (part. 1/2).
- [#538](https://github.com/sgmap/pix/pull/538) [FEATURE] Ajout d'une API pour récupérer les feedbacks (avec possibilité de préciser une date de début et de fin) (US-752) (part. 2/2).
- [#518](https://github.com/sgmap/pix/pull/518) [FEATURE] Nouvelle bannière d'accueil sur la page de profil d'un utilisateur connecté (US-193).
- [#527](https://github.com/sgmap/pix/pull/527) [FEATURE] Amélioration menu utilisateur loggué (US-699).
- [#535](https://github.com/sgmap/pix/pull/515) [BUGFIX] Chaque saisie de valeur dans l'un des champs de réponse d'un QROCm provoque une erreur (US-787).
- [#537](https://github.com/sgmap/pix/pull/537) [BUGFIX] Correction de l'affichage du profil dans le cas où l'usager a plusieurs évaluations portant sur un même test et qui ne sont pas complètes (US-776).
- [#534](https://github.com/sgmap/pix/pull/534) [BUGFIX] Correction du placement du text du loader à la création d'une évaluation (US-764).
- [#525](https://github.com/sgmap/pix/pull/525) [TECH] Amélioration de l'intégration de Sentry.io (US-755).
- [#532](https://github.com/sgmap/pix/pull/532) [TECH] Fix script de déploiement cassé dans le cas de mise en prod (US-794).

## 1.22.0 (13/09/2017)

- [#512](https://github.com/sgmap/pix/pull/512) [FEATURE] Récupérer les instantanées de profil de mon organisation (US-594).
- [#531](https://github.com/sgmap/pix/pull/531) [BUGFIX] La réponse de l'utilisateur s'affiche correctement dans la modale de comparaison des réponses dans Firefox (US-765).
- [#526](https://github.com/sgmap/pix/pull/526) [BUGFIX] Corrections des Conditions Générales d'Utilisation (US-717).
- [#522](https://github.com/sgmap/pix/pull/522) [BUGFIX] ETQ utilisateur connecté, je veux être déconnecté si mes informations ne sont plus valides (US-753).
- [#520](https://github.com/sgmap/pix/pull/520) [BUGFIX] Scrolling initial pour les nouvelles pages du site (US-751).
- [#524](https://github.com/sgmap/pix/pull/524) [TECH] Passage à CircleCI 2.0 avec Workflow (US-758).
- [#530](https://github.com/sgmap/pix/pull/530) [TECH] Réparation du déploiement en continu sur CircleCI 2.0 (US-772).
- [#511](https://github.com/sgmap/pix/pull/511) [TECH] Montée de version de Ember de 2.14.2 vers 2.15.0 (US-740).

## 1.21.0 (05/09/2017)

- [#506](https://github.com/sgmap/pix/pull/506) [FEATURE] Éclaircissement de la couleur de la barre de niveau d'une compétence du profil (US-680).
- [#510](https://github.com/sgmap/pix/pull/510) [FEATURE] Ajouter un loader mouf-mouf au démarrage d'un test (US-698 & US-601).
- [#502](https://github.com/sgmap/pix/pull/502) [FEATURE] Intégrer la nouvelle règle de calcul des pix au scoring (US-671 & US-672 & US-482).
- [#505](https://github.com/sgmap/pix/pull/505) [FEATURE] Ajout de la page "Mentions légales" (US-380).
- [#516](https://github.com/sgmap/pix/pull/526) [FEATURE] Ajout de la page CGU (US-379).
- [#508](https://github.com/sgmap/pix/pull/508) [FEATURE] Récupérer depuis l'API les profile partagés avec une organisation donnée (US-734).
- [#497](https://github.com/sgmap/pix/pull/497) [FEATURE] Ajouter un bouton "je m'inscris" sur la page d'accueil pour un utilisateur non connecté (et cacher les défix Pix de la semaine) (US-678).
- [#499](https://github.com/sgmap/pix/pull/499) [FEATURE] Ajout des liens "se connecter" et "s'inscrire" dans le header, pour un utilisateur non-connecté (US-677).
- [#517](https://github.com/sgmap/pix/pull/517) [FEATURE] Ajout d'un loader au chargement de la page /compte (US-744).
- [#515](https://github.com/sgmap/pix/pull/515) [BUGFIX] Ajout d'une clé au fichier sample.env
- [#513](https://github.com/sgmap/pix/pull/513) [BUGFIX] Amélioration de la gestion du cache des repositories par compétence.

## 1.20.0 (01/09/2017)

- [#509](https://github.com/sgmap/pix/pull/509) [FEATURE] Ajouter les endpoints /metrics et /errors/500 à l'API (US-723).
- [#503](https://github.com/sgmap/pix/pull/503) [FEATURE] Accepter les caractères spéciaux dans le mot de passe (US-663).
- [#501](https://github.com/sgmap/pix/pull/501) [FEATURE] Le bouton 'Mon compte' redirige vers la home logguée (US-679).
- [#504](https://github.com/sgmap/pix/pull/504) [BUGFIX] Forcer le rechargement du profil à chaque fois qu'on accède à la page /compte (US-700).

## 1.19.0 (30/08/2017)

- [#494](https://github.com/sgmap/pix/pull/494) [FEATURE] ETQ Utilisateur non connecté, je dois être redirigé vers /connexion depuis le board ou le compte (US-628).
- [#465](https://github.com/sgmap/pix/pull/465) [FEATURE] Amélioration de la gestion des tests adaptatifs (US-604).
- [#491](https://github.com/sgmap/pix/pull/491) [FEATURE] ETQ utilisateur connecté, je veux être redirigé vers mon espace depuis la home (US-606).
- [#492](https://github.com/sgmap/pix/pull/492) [FEATURE] Pouvoir partager un Instantané de mon Profil à une Organisation (front) (US-618).
- [#489](https://github.com/sgmap/pix/pull/489) [FEATURE] création d'un instantané du profil de compétence (Api) (US-641).
- [#488](https://github.com/sgmap/pix/pull/488) [TECH] Ajout d'une ressource /api/healthcheck/db pour vérifier la connexion à la base de données (US-655).
- [#496](https://github.com/sgmap/pix/pull/496) [TECH] Mises à jour des dépendances (front & back) (US-487).
- [#498](https://github.com/sgmap/pix/pull/498) [CLEANUP] Changement de texte du lien pour revenir à l'accueil (US-683).

## 1.18.0 (22/08/2017)

- [#483](https://github.com/sgmap/pix/pull/483) [FEATURE] Création de la modale de partage d'un profil (US-592).
- [#485](https://github.com/sgmap/pix/pull/485) [FEATURE] Redirection automatiquement à la connexion vers /board ou /compte en fonction du type de compte (US-590).
- [#487](https://github.com/sgmap/pix/pull/487) [TECH] Mise à jour du script de déploiement pour effectuer une montée de version automatique (US-638).

## 1.17.0 (16/08/2017)

- [#482](https://github.com/sgmap/pix/pull/482) [FEATURE] Afficher un bandeau d'engagement pour les sup et sco (US-617).
- [#480](https://github.com/sgmap/pix/pull/480) [FEATURE] Accès à la page de suivi des profiles pour un prescripteur (US-591).
- [#486](https://github.com/sgmap/pix/pull/486) [TECH] Mise à jour de la configuration des logs (US-647).

## 1.16.0 (07/08/2017)

- [#475](https://github.com/sgmap/pix/pull/475) [FEATURE] Création de la page engagement pour les établissement scolaire et supérieur (US-573).
- [#481](https://github.com/sgmap/pix/pull/481) [FEATURE] Redirection automatique vers sa page de profile lorsqu'un utilisateur fini de créer son compte (US-577).
- [#473](https://github.com/sgmap/pix/pull/473) [FEATURE] Affichage d'un menu pour un utilisateur loggué avec bouton déconnexion (US-214).
- [#477](https://github.com/sgmap/pix/pull/477) [FEATURE] ETQ Utilisateur de l'API, je veux pouvoir créer une organisation (US-614).
- [#479](https://github.com/sgmap/pix/pull/479) [FEATURE] Un code unique à 6 charactères doit être généré par organisation (US-615).

## 1.15.1 (27/07/2017)

- [#478](https://github.com/sgmap/pix/pull/478) [BUGFIX] Mon niveau à l'issue d'un test sans aucun acquis recensé doit être 0 (US-635).

## 1.15.0 (21/07/2017)

- [#467](https://github.com/sgmap/pix/pull/467) [FEATURE] L'utilisateur connecté peut voir son niveau sur chacune des compétences dans sa page connecté (US-623).
- [#471](https://github.com/sgmap/pix/pull/471) [FEATURE] Démarrer un test de positionnement depuis la barre de competence sur la page profil (US-564).
- [#468](https://github.com/sgmap/pix/pull/468) [FEATURE] En tant qu'utilisateur loggué, JV voir mon score PIX (US-624).
- [#462](https://github.com/sgmap/pix/pull/462) [FEATURE] Apparition du formulaire de signalement l'écran, lorsqu'on clique sur le lien de signalement d'une épreuve (US-502).
- [#461](https://github.com/sgmap/pix/pull/461) [TECH] En tant que réplicateur, je veux disposer d'un environnement dédié (US-456).
- [#464](https://github.com/sgmap/pix/pull/464) [TECH] Mise en place d'une persistance des logs d'erreur coté API (US-613).
- [#463](https://github.com/sgmap/pix/pull/463) [TECH] Migration de Sinon.js de 1.17.1 à 2.3.7 (US-609).

## 1.14.0 (10/07/2017)

- [#457](https://github.com/sgmap/pix/pull/457) [FEATURE] Ajout du score et du niveau par compétences sur le profil utilisateur côté API (US-574).
- [#436](https://github.com/sgmap/pix/pull/436) [FEATURE] Récupération du niveau par compétence pour un utilisateur via une api sécurisée (US-527).
- [#458](https://github.com/sgmap/pix/pull/458) [FEATURE] Affichage du nombre total de Pix pour un utilisateur depuis l'API (US-526).
- [#456](https://github.com/sgmap/pix/pull/456) [BUGFIX] Désactivation de l'accélération GPU pour les tests sous Chrome.
- [#453](https://github.com/sgmap/pix/pull/453) [CLEANUP] Ajout de règles de linting et fix des fichiers ne les respectant pas.
- [#454](https://github.com/sgmap/pix/pull/454) [CLEANUP] Correction des erreurs 404 qui apparaissent lors des tests.
- [#455](https://github.com/sgmap/pix/pull/455) [CLEANUP] Correction des fenêtres modales laissées ouvertes à la fin des tests.
- [#450](https://github.com/sgmap/pix/pull/450) [CLEANUP] Mise à jour Ember-Data vers la version 2.13.
- [#449](https://github.com/sgmap/pix/pull/449) [CLEANUP] Correction de la logique des tests d'acceptance.
- [#448](https://github.com/sgmap/pix/pull/448) [CLEANUP] Sauvegarde des answers modifiées avec PATCH.

## 1.13.0 (26/06/2017)

- [#439](https://github.com/sgmap/pix/pull/439) [FEATURE] Mise en place d'une page de connexion au compte (US-213).
- [#447](https://github.com/sgmap/pix/pull/447) [BUGFIX] Correction d'un problème d'affichage des boutons QCM sous IE11 (US-561).
- [#445](https://github.com/sgmap/pix/pull/445) [BUGFIX] Correction d'un problème de calcul d'acquis (US-570).

## 1.12.0 (21/06/2017)

- [#422](https://github.com/sgmap/pix/pull/422) [FEATURE] Limitation sur la création d'un compte utilisateur (pour les robots) avec un captcha.
- [#430](https://github.com/sgmap/pix/pull/430) [FEATURE] Amélioration de l'ergonomie du bouton "Valider" d'une épreuve (US-438).
- [#413](https://github.com/sgmap/pix/pull/413) [FEATURE] Affichage d'un smiley et d'un message d'encouragement lorsque l'utilisateur n'a obtenu ni trophé, ni point pix, à la fin d'un test d'adaptatif (US-344).
- [#433](https://github.com/sgmap/pix/pull/433) [FEATURE] Amélioration de l'ergonomie de la gestion d'erreur du formulaire d'inscription (US-496).
- [#440](https://github.com/sgmap/pix/pull/440) [FEATURE] Affiche le logo de PIX pendant le chargement initial
- [#438](https://github.com/sgmap/pix/pull/438) [INFRA] Améliorer la façon de charger les scénarios pour les tests adaptatifs dans les Review Apps
- [#444](https://github.com/sgmap/pix/pull/444) [CLEANUP] Result-item: remove tooltip delay
- [#443](https://github.com/sgmap/pix/pull/443) [CLEANUP] Acceptance tests: before → beforeEach
- [#441](https://github.com/sgmap/pix/pull/441) [CLEANUP] Mise à jour de ember-collapsible-panel
- [#428](https://github.com/sgmap/pix/pull/428) [CLEANUP] Remplacement des mixins value-as-array-of-boolean par des utils
- [#427](https://github.com/sgmap/pix/pull/427) [CLEANUP] Suppression de l'initializer ajax-interceptor
- [#431](https://github.com/sgmap/pix/pull/431) [CLEANUP] Extraction des images SVG dans le code (part 2).

## 1.11.1 (26/05/2017)

- [#423](https://github.com/sgmap/pix/pull/423) [HOTFIX] Correction de la régression suite à l'extraction des images SVG.

## 1.11.0 (26/05/2017)

- [#402](https://github.com/sgmap/pix/pull/402) [FEATURE] Navigation au clavier sur la page de résultats (US-415).
- [#398](https://github.com/sgmap/pix/pull/398) [FEATURE] Ajout de la navigation au clavier au sein et entre les épreuves d'un test (US-446).
- [#404](https://github.com/sgmap/pix/pull/404) [FEATURE] Un betatesteur inscrit vient enrichir aléatoirement l'un des 3 lots de betatesteurs (US-441).
- [#365](https://github.com/sgmap/pix/pull/365) [FEATURE] Écran de création d'un compte utilisateur (US-194).
- [#409](https://github.com/sgmap/pix/pull/409) [FEATURE] Affichage d'un smiley et d'un message d'encouragement lorsque l'utilisateur n'a obtenu ni trophé, ni point pix, à la fin d'un test d'adaptatif
- [#425](https://github.com/sgmap/pix/pull/425) [PERFS] Réduit la taille des images de la page d’accueil.
- [#429](https://github.com/sgmap/pix/pull/429) [BUGFIX] Correction des erreurs de typo de la page "Compétences" (US-500).
- [#418](https://github.com/sgmap/pix/pull/418) [INFRA] Mise à jour de dépendances côté front.
- [#416](https://github.com/sgmap/pix/pull/416) [INFRA] Amélioration de la prise en compte du Markdown dans Ember.
- [#423](https://github.com/sgmap/pix/pull/423) [CLEANUP] Remplacer les images SVG inlinées par des vraies fichiers images
- [#424](https://github.com/sgmap/pix/pull/424) [CLEANUP] Corrige des dépréciations dans les tests.
- [#421](https://github.com/sgmap/pix/pull/421) [CLEANUP] Rend l’appli plus proche du template par défaut
- [#420](https://github.com/sgmap/pix/pull/420) [CLEANUP] Montée de version de dépendances front-end (dont ember-cli).
- [#419](https://github.com/sgmap/pix/pull/419) [CLEANUP] Remplacer les challenge/mixins par des utils.
- [#415](https://github.com/sgmap/pix/pull/415) [CLEANUP] Ajouter un référentiel de point de rupture pour le CSS dans un fichier et l'utiliser dans tous le projet.
- [#417](https://github.com/sgmap/pix/pull/417) [CLEANUP] Déclaration de "jsyaml" en tant que variable globale dans ESLint côté front.
- [#414](https://github.com/sgmap/pix/pull/414) [CLEANUP] Epurer la palette de couleur.
- [#410](https://github.com/sgmap/pix/pull/410) [CLEANUP] Rajoute des règles ESLint.

## 1.10.0 (12/05/2017)

- [#396](https://github.com/sgmap/pix/pull/396) [FEATURE] Affichage du trophée gagné dans le cas d'un test adaptatif (US-472)
- [#397](https://github.com/sgmap/pix/pull/397) [#405](https://github.com/sgmap/pix/pull/405) [FEATURE] Améliorer l'ergonomie de l'éditeur d'épreuve pour configurer les traitements de la validation automatique (US-409).
- [#403](https://github.com/sgmap/pix/pull/403) [BUGFIX] Le scroll se remet en haut lorsque l'on change de page (US-403)
- [#401](https://github.com/sgmap/pix/pull/401) [BUGFIX] Possibilité de signaler une épreuve depuis l'épreuve en question (US-483)

## 1.9.0 (02/05/2017)

- [#393](https://github.com/sgmap/pix/pull/393) [FEATURE] Rendre possible la navigation au clavier sur la page d’accueil (US-445).
- [#389](https://github.com/sgmap/pix/pull/389) [FEATURE] Envoi d’un email d’inscription après la création d’un compte (US-448).
- [#383](https://github.com/sgmap/pix/pull/383) [FEATURE] Affichage du formulaire de feedback en mode ouvert dans la modale de correction (US-433).
- [#392](https://github.com/sgmap/pix/pull/392) [BUGFIX] Bugfix de responsive web design sur petits écrans (US-471)
- [#391](https://github.com/sgmap/pix/pull/391) [BUGFIX] Fix d’un problème d’affichage d’un titre trop long (US-467).
- [#387](https://github.com/sgmap/pix/pull/387) [INFRA] Ajout d’une configuration Istanbul pour exclure les migrations (US-464).
- [#386](https://github.com/sgmap/pix/pull/386) [INFRA] ETQ utilisateur de l’API, je souhaite pouvoir créer un compte via l’API (US-429).
- [#395](https://github.com/sgmap/pix/pull/395) [CLEANUP] Extraction de variables pour les “graisses” de police (font-weight).
- [#390](https://github.com/sgmap/pix/pull/390) [CLEANUP] Prépare le passage à Ember 2.12
- [#385](https://github.com/sgmap/pix/pull/385) [CLEANUP] Déplacement de la logique d’affichage pour décider quel composant challenge-item-* afficher depuis le modèle “challenge” vers la route “assessments/get-challenge”.

## 1.8.1 (26/04/2017)

- [#388](https://github.com/sgmap/pix/pull/388) [BUGFIX] Problème d'affichage de la modale de correction pour un QROCm-ind.

## 1.8.0 (25/04/2017)

- [#381](https://github.com/sgmap/pix/pull/381) [FEATURE] Le logo PIX est accessible (US-444).
- [#379](https://github.com/sgmap/pix/pull/379) [FEATURE] Signaler une épreuve directement depuis l'épreuve en question (US-394).
- [#380](https://github.com/sgmap/pix/pull/380) [BUGFIX] Correction de l'endpoint GET /api/assessment/ID pour les assessments preview.
- [#382](https://github.com/sgmap/pix/pull/382) [INFRA] Correction du dernier avertissement dans les tests : "unsafe CSS bindings ».
- [#378](https://github.com/sgmap/pix/pull/378) [INFRA] Mise à jour du script pour gèrer les problèmes de conflit avec master + MAJ de dev sur Master.

## 1.7.0 (19/04/2017)

- [#283](https://github.com/sgmap/pix/pull/283) [FEATURE] Ajout des acquis aux épreuves pour calculer le niveau de l’apprenant (US-360).
- [#373](https://github.com/sgmap/pix/pull/373) [BUGFIX] Affichage de l’avertissement ‘epreuve timée’ lorsque deux challenges du même type se suivent (US-424)
- [#376](https://github.com/sgmap/pix/pull/376) [CLEANUP] Amélioration de l’image de présentation sur la page d’accueil (US-417).
- [#372](https://github.com/sgmap/pix/pull/372) [CLEANUP] Importation des followers dans base de données de production et suppression de scripts d’import (US-449).

## 1.6.3 (19/04/2017)

- [#375](https://github.com/sgmap/pix/pull/375) [INFRA] On expose un nouvel endpoint avec les infos api sur /api (US-453).
- [#370](https://github.com/sgmap/pix/pull/370) [CLEANUP] Suppression des positional params.

## 1.6.2 (19/04/2017)

- [#430](https://github.com/sgmap/pix/pull/430) [INFRA] Réparation du script de livraison.

## 1.6.1 (14/04/2017)

- [#357](https://github.com/sgmap/pix/pull/357) [FEATURE] Sauvegarde du temps écoulé pour chaque épreuve.
- [#342](https://github.com/sgmap/pix/pull/342) [FEATURE] Affichage de la zone de correction pour les challenges QROCM-ind (US-385).
- [#368](https://github.com/sgmap/pix/pull/368) [BUGFIX] Enlever le séparateur de la zone de réponse pour les QROCM (US-369).
- [#366](https://github.com/sgmap/pix/pull/366) [INFRA] Correction d'avertissements dans les tests : "unsafe CSS bindings".
- [#364](https://github.com/sgmap/pix/pull/364) [INFRA] Extraction des identifiants Airtable dans des variables d'environnement (US-430).
- [#362](https://github.com/sgmap/pix/pull/362) [INFRA] Stoppe Pretender explicitement à la fin de chaque test.
- [#361](https://github.com/sgmap/pix/pull/361) [CLEANUP] Dé-duplication de la validation d'e-mail.
- [#360](https://github.com/sgmap/pix/pull/360) [CLEANUP] Meilleure gestion des conditions de tests liées à l'environnement (issue #335).

## 1.6.0 (31/03/2017)

- [#355](https://github.com/sgmap/pix/pull/355) [FEATURE] Email de bienvenue aux followers (US-367).
- [#352](https://github.com/sgmap/pix/pull/352) [BUGFIX] La première pièce à télécharger doit être coché par défaut (US-421).

## 1.5.1 (24/03/2017)

- [#345](https://github.com/sgmap/pix/pull/345) [FEATURE] Afficher les défis Pix de la semaine sur la page d'accueil (US-396).
- [#346](https://github.com/sgmap/pix/pull/346) [FEATURE] Afficher la comparaison des résultats pour un QCU (US-321).
- [#350](https://github.com/sgmap/pix/pull/350) [FEATURE] Ajout de la page de présentation du "référentiel de compétences" (US-375).
- [#347](https://github.com/sgmap/pix/pull/347) [BUGFIX] Correction du débordement de la page d'accueil pour les résolutions d'écran entre 992px et 1200px (US-411).
- [#351](https://github.com/sgmap/pix/pull/351) [BUGFIX] Afficher un champ texte vide lorsque l'utilisateur passe la question.
- [#349](https://github.com/sgmap/pix/pull/349) [BUGFIX] Affichage des réponses sur QROC (US-401).
- [#348](https://github.com/sgmap/pix/pull/348) [CLEANUP] Petit nettoyage de printemps du CSS (US-414).

## 1.5.0 (17/03/2017)

- [#333](https://github.com/sgmap/pix/pull/333) [FEATURE] Nouveau design de la page index (US-337).
- [#326](https://github.com/sgmap/pix/pull/326) [BUGFIX] Suppression du loader disgracieux (US-390)
- [#331](https://github.com/sgmap/pix/pull/331) [CLEANUP] Refactoring de la revalidation des réponses dans le back (US-400).
- [#332](https://github.com/sgmap/pix/pull/332) [CLEANUP] Refactoring de qcm-comparison en composant
- [#327](https://github.com/sgmap/pix/pull/327) [CLEANUP] Refactoring de la suite de tests front (US-395).
- [#344](https://github.com/sgmap/pix/pull/344) [CLEANUP] Refactoring de l'intégration de Airtable.
- [#341](https://github.com/sgmap/pix/pull/341) [CLEANUP] Ajout de tests sur la correction de bug (progress bar)

## 1.4.4 (07/03/2017)

- [#293](https://github.com/sgmap/pix/pull/293) [FEATURE] L'écran de fin de test affichant les épreuves dans le bon ordre (US-341).
- [#320](https://github.com/sgmap/pix/pull/320) [FEATURE] Rendre (dés-)activable les pré-traitements des réponses/solutions (US-330).
- [#329](https://github.com/sgmap/pix/pull/329) [BUGFIX] Correction d'une régression suite à un mauvais merge.
- [#328](https://github.com/sgmap/pix/pull/328) [BUGFIX] Corrections du bug concernant les réponses dont la valeur dépasse 255 caractères (US-397).

## 1.4.3 (02/03/2017)

- [#323](https://github.com/sgmap/pix/pull/323) [INFRA] Mise à jour du script de déploiement et du CHANGELOG.

## 1.4.2 (02/03/2017)

- [#298](https://github.com/sgmap/pix/pull/298) [FEATURE] Prise en comtpe du degré de tolérance sur les QROC(m)(ind)(dep) (US-218).
- [#317](https://github.com/sgmap/pix/pull/317) [FEATURE] Pouvoir prévisualer (en tant que PixMaster) un test comprenant un seul challenge (US-386).
- [#315](https://github.com/sgmap/pix/pull/315) [FEATURE] Comparer les réponses utilisateurs et bonnes réponses pour des QROC (US-323).
- [#314](https://github.com/sgmap/pix/pull/314) [BUGFIX] Prise en compte du gras dans l'énoncé d'une épreuve (US-388).
- [#319](https://github.com/sgmap/pix/pull/319) [BUGFIX] Support des anciennes URLs de création de test (US-392).
- [#304](https://github.com/sgmap/pix/pull/304) [INFRA] Mise-à-jour des dépendances (désormais pseudo-fixées).
- [#316](https://github.com/sgmap/pix/pull/316) [CLEANUP] Refactoring et nettoyage du composant "warning-page" (US-370).

## 1.4.1 (23/02/2017)

- [#309](https://github.com/sgmap/pix/pull/309) [BUGFIX] Correction d'un bug sur la progressbar

## 1.4.0 (22/02/2017)

- [#278](https://github.com/sgmap/pix/pull/278) [FEATURE] Ajout de la possibilité pour un usager de signaler une épreuve.
- [#269](https://github.com/sgmap/pix/pull/269) [FEATURE] Ajout de la fonctionnalité de revalidation de toutes les réponses pour une épreuve donnée.
- [#285](https://github.com/sgmap/pix/pull/285) [FEATURE] Nouveau design des radiobuttons et checkboxes.
- [#301](https://github.com/sgmap/pix/pull/301) [FEATURE] Augmentation de la taille de l'énoncé et des réponses d'une épreuve.
- [#286](https://github.com/sgmap/pix/pull/286) [FEATURE] Ajout d'une espace insécable sur le texte de la page d'accueil.
- [#281](https://github.com/sgmap/pix/pull/281) [FEATURE] Ajout d'une route pour rafraîchir le cache d'une solution pour un challenge donné.
- [#297](https://github.com/sgmap/pix/pull/297) [BUGFIX] Correction d'une régression dans l'ordre de traitement des solutions pour un test adaptatif.
- [#284](https://github.com/sgmap/pix/pull/284) [BUGFIX] Correction de bugs mineurs liés au RWD.
- [#292](https://github.com/sgmap/pix/pull/292) [CLEANUP] Remplacement de PostCSS par Sass.
- [#305](https://github.com/sgmap/pix/pull/305) [CLEANUP] Modification de la gestion des numéros de versions.
- [#288](https://github.com/sgmap/pix/pull/288) [CLEANUP] Nettoyage de la page d'accueil et découpage en composants.
- [#282](https://github.com/sgmap/pix/pull/282) [CLEANUP] Nettoyage de tests front-end.
- [#277](https://github.com/sgmap/pix/pull/277) [CLEANUP] Amélioration et nettoyage de l'outillage de tests côté API.
- [#271](https://github.com/sgmap/pix/pull/271) [CLEANUP] Nettoyage du controller & repository pour les réponses (answer-*).

## 1.3.1 (05/02/2017)

- [#265](https://github.com/sgmap/pix/pull/265) [BUGFIX] Correction de la sauvegarde des réponses front (US-355).
- [#263](https://github.com/sgmap/pix/pull/263) [BUGFIX] Correction de l'ordre d'affichage des pièces jointes téléchargeables (tel que saisi par les contributeurs plutôt que par ordre chronologique) (US-354).
- [#256](https://github.com/sgmap/pix/pull/256) [BUGFIX] Correction du bug lié au Copier-Coller depuis un document excel.
- [#251](https://github.com/sgmap/pix/pull/251) [BUGFIX] Correction d'un bug dans la validation automatique des épreuves de type QROCm-ind.
- [#250](https://github.com/sgmap/pix/pull/250) [BUGFIX] Correction de la commande `db:backup` du PIX-CLI
- [#247](https://github.com/sgmap/pix/pull/247) [BUGFIX] Amélioration du rendu de la page de présentation du projet pour mobiles.
- [#245](https://github.com/sgmap/pix/pull/245) [BUGFIX] Prise en compte des nombres pour les epreuves de type QROCM-dep.
- [#255](https://github.com/sgmap/pix/pull/255) [FEATURE] Revoir les réponses comparées aux bonnes réponses dans un QCM (US-309)
- [#249](https://github.com/sgmap/pix/pull/249) [FEATURE] Ajout d'un lien vers la page projet (Menu et zone valeurs pix).
- [#271](https://github.com/sgmap/pix/pull/271) [CLEANUP] Nettoyage du controller & repository pour les réponses (answer-*).
- [#258](https://github.com/sgmap/pix/pull/258) [CLEANUP] Nettoyage de fichiers CSS et refactoring de tests.
- [#257](https://github.com/sgmap/pix/pull/257) [INFRA] Montée de version de Ember (2.10.0 -> 2.11.0).
- [#252](https://github.com/sgmap/pix/pull/252) [INFRA] Ajout d'un script de backup des tables AirTable.
- [#246](https://github.com/sgmap/pix/pull/246) [INFRA] Ajout d'un script pour automatiser le déploiement du PIX-CLI.

## 1.3.0 (19/01/0217)

- [#232](https://github.com/sgmap/pix/pull/232) [FEATURE] Afficher une page avec un message d'avertissement lorsque la prochaine épreuve est timée.
- [#240](https://github.com/sgmap/pix/pull/240) [FEATURE] Ajout de la page de présentation du projet.
- [#239](https://github.com/sgmap/pix/pull/239) [INFRA] Développement et déploiement du CLI d'administration de l'infra.

## 1.2.2 (12/01/2017)

- [#238](https://github.com/sgmap/pix/pull/238) [DOC] Formatage du fichier CHANGELOG

## 1.2.1 (12/01/2017)

- [#236](https://github.com/sgmap/pix/pull/236) [BUGFIX] La validation de certaines épreuves QROCM-dep est fausse
- [#230](https://github.com/sgmap/pix/pull/230) [DOC] Mise-à-jour du fichier README.md pour l'API et ajout d'une tâche NPM 'help'
- [#228](https://github.com/sgmap/pix/pull/228) [FEATURE] Afficher un message d'avertissement (contre le support incomplet du media mobile) pour les usagers sur smartphone
- [#226](https://github.com/sgmap/pix/pull/226) [FEATURE] Afficher un compteur de temps pour les épreuves chronométrées
- [#221](https://github.com/sgmap/pix/pull/221) [FEATURE] Pouvoir télécharger un fichier au format souhaité  review asked

## 1.2.0 (03/01/2017)

- [#214](https://github.com/sgmap/pix/pull/214) [FEATURE] Affichage du libellé "Correction automatique en cours de développement ;)" dans l'écran de fin d'un test
- [#213](https://github.com/sgmap/pix/pull/213) [FEATURE] Validation d'une épreuve d'un test adaptatif
- [#208](https://github.com/sgmap/pix/pull/208) [FEATURE] Ajout de la validation automatique des questions de type QROCm-depsco
- [#219](https://github.com/sgmap/pix/pull/219) [DOC] Mise à jour de la procédure d'installation dans le README

## 1.1.2 (07/12/2016)

- [#196](https://github.com/sgmap/pix/pull/196) [INFRA] Correction du script de livraison release-publish.

## 1.1.1 (07/12/2016)

- [#193](https://github.com/sgmap/pix/pull/193) [CLEANUP] Ajout de tests unitaires et d'intégration pour le composant qcu-proposals
- [#187](https://github.com/sgmap/pix/pull/187) [FEATURE] Gestion du bouton back.
- [#187](https://github.com/sgmap/pix/pull/187) [BUGFIX] Diverses corrections de bugs dans l'écran de fin de test : réponses en doublons, points de suspensions dans les intitulés, validation des QCM fausse.
- [#185](https://github.com/sgmap/pix/pull/185) [INFRA] Montée de version d'Ember ~2.8.0 à ~2.10.0.

## 1.1.0 (30/11/2016)

- [#160](https://github.com/sgmap/pix/pull/160) [FEATURE] Suppression du tracking Google Analytics.
- [#181](https://github.com/sgmap/pix/pull/181) [INFRA] Mise en place de npm-run-all pour faciliter et accélérer le développement.
- [#285](https://github.com/sgmap/pix/pull/285) [CLEANUP] Suppression de tout code lié à la session.
- [#177](https://github.com/sgmap/pix/pull/177) [CLEANUP] Remise en route du linter.
- [#175](https://github.com/sgmap/pix/pull/175) [CLEANUP] Montée de version des dépendances.
- [#174](https://github.com/sgmap/pix/pull/174) [CLEANUP] Refactoring du composant challenge-item.
- [#173](https://github.com/sgmap/pix/pull/173) [INFRA] Réactivation et consolidation de la couverture de code du projet.
- [#172](https://github.com/sgmap/pix/pull/172) [CLEANUP] suppression du cache pour le contrôleur "GET /courses" dans l'API.
- [#171](https://github.com/sgmap/pix/pull/171) [INFRA] Changement de la configuration de l'intégration continue CircleCI.

## 1.0.3 (24/11/2016)

- [#165](https://github.com/sgmap/pix/pull/165) [BUGFIX] Correction de la souscription en tant que beta-testeur.

## 1.0.2 (24/11/2016)

- [#272](https://github.com/sgmap/pix/pull/272) [BUGFIX] Gestion du Responsive Web Design.
- [#164](https://github.com/sgmap/pix/pull/164) [DOC] Ajout du fichier CHANGELOG pour suivre les évolutions de la plateforme.

## 1.0.1 (23/11/2016)

- [#158](https://github.com/sgmap/pix/pull/158) [BUGFIX] Modification du mail Formspree pour contourner momentanément la limite de 1000 bêta-souscripteurs / mois.
- [#156](https://github.com/sgmap/pix/pull/156) [FEATURE] Remplacement du mot "digital" par "numérique".
- [#153](https://github.com/sgmap/pix/pull/153) [CLEANUP] Ajout de tests pour PIX-API.
- [#154](https://github.com/sgmap/pix/pull/154) [CLEANUP] Remaniement des tests d'acceptance pour PIX-Live.

## 1.0.0 (15/11/2016)

- [FEATURE] Afficher la page d'accueil.
- [FEATURE] Afficher la liste des tests (max 4 tests) depuis la page d'accueil.
- [FEATURE] Souscrire en tant que bêta-testeur via une adresse email.
- [FEATURE] Démarrer une évaluation pour un tests donné.
- [FEATURE] Afficher une épreuve (titre, consigne, propositions de réponses).
- [FEATURE] Répondre à une épreuve (QCU, QCM, QROC, QROCm).
- [FEATURE] Afficher la page de fin d'un test avec le récapitulatif des questions / réponses.
