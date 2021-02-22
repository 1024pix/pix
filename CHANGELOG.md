# Pix Changelog

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

## v2.246.0 (11/01/2021)

- [#2368](https://github.com/1024pix/pix/pull/2368) [FEATURE] Afficher une documentation spécifique pour les établissements français à l'étranger (ou AEFE) (PIX-1970).

## v2.245.0 (11/01/2021)

- [#2364](https://github.com/1024pix/pix/pull/2364) [FEATURE] voir le nombre de "signalements impactants" sur la page de détails d'une session dans Pix Admin (PIX-1489)
- [#2307](https://github.com/1024pix/pix/pull/2307) [FEATURE] Interroger l'API pour les campaign participation du dashboard (PIX-1816).
- [#2266](https://github.com/1024pix/pix/pull/2266) [CLEANUP] Retirer les "classic" des components sur Mon-Pix.

## v2.244.0 (08/01/2021)

- [#2363](https://github.com/1024pix/pix/pull/2363) [FEATURE] Récuperer les signalements côté pix-admin (PIX-1522)
- [#2349](https://github.com/1024pix/pix/pull/2349) [FEATURE] Permettre le refresh de l'access token avant l'envoi des résultats à Pôle Emploi (PIX-1939).
- [#2336](https://github.com/1024pix/pix/pull/2336) [FEATURE] Permettre à l'utilisateur de changer de centre de certification sur Pix Certif (PIX-1706).
- [#2333](https://github.com/1024pix/pix/pull/2333) [FEATURE] Introduire le multi Accès Pix Certif (PIX-136).
- [#2275](https://github.com/1024pix/pix/pull/2275) [FEATURE] Restreindre l'accès aux parcours Pole Emploi aux utilisateurs possédant un compte Pole Emploi (PIX-1636).
- [#2302](https://github.com/1024pix/pix/pull/2302) [FEATURE] Modifier le nom d'un profil cible dans Pix Admin (PIX-1496).
- [#2351](https://github.com/1024pix/pix/pull/2351) [BUGFIX] Problème d'affichage des réponses des QCU (PIX-1949).
- [#2224](https://github.com/1024pix/pix/pull/2224) [TECH] Utilisation de la route LCMS GET /current-content.
- [#2350](https://github.com/1024pix/pix/pull/2350) [TECH] Ajouter un linter a11y sur les templates Pix App (PIX-1950).
- [#2342](https://github.com/1024pix/pix/pull/2342) Pouvoir filtrer les résultats de campagne d'évaluation par classe pour les organisation SCO qui gèrent des étudiants (PIX-1680).

## v2.243.0 (06/01/2021)

- [#2347](https://github.com/1024pix/pix/pull/2347) [FEATURE]  Télécharger un PV d'incident pour une session de certification (PIX-1535)
- [#2340](https://github.com/1024pix/pix/pull/2340) [FEATURE] Rejeter une recherche sur une organisation si l'identifiant est non numérique (PIX-1936).
- [#2348](https://github.com/1024pix/pix/pull/2348) [FEATURE] Ajout de la catégorie de signalement "Problème technique" (PIX-1943)
- [#2345](https://github.com/1024pix/pix/pull/2345) [FEATURE] Ajout de la catégorie fraude (PIX-1933)
- [#2343](https://github.com/1024pix/pix/pull/2343) [BUGFIX] Ajout de la traduction en EN pour deux labels sur Pix App (PIX-1792).
- [#2321](https://github.com/1024pix/pix/pull/2321) [TECH] Utilisation du nouveau modèle CampaignToJoin côté APP pour modéliser la campagne en cours de participation (PIX-1826)
- [#2346](https://github.com/1024pix/pix/pull/2346) [CLEANUP] Modifications mineures de la catégorisation des signalements (PIX-1829)

## v2.242.0 (05/01/2021)

- [#2332](https://github.com/1024pix/pix/pull/2332) [FEATURE] Suppression du fallback sur le choix de la langue des épreuves (PIX-1778).
- [#2338](https://github.com/1024pix/pix/pull/2338) [BUGFIX] Permettre aux scripts de pouvoir être lancés (PIX-1941).  
- [#2331](https://github.com/1024pix/pix/pull/2331) [BUGFIX] Modification du titre du bouton "Continuer" de la version anglaise afin que l'affichage soit sur une seule ligne (PIX-1934).
- [#2316](https://github.com/1024pix/pix/pull/2316) [TECH] Generer l'API-DOC pour Gravitee (PIX-1822)
- [#2337](https://github.com/1024pix/pix/pull/2337) [TECH] Supprime les déclarations de dégradé inutiles
- [#2335](https://github.com/1024pix/pix/pull/2335) [TECH] Corrige les commentaires dans les tests
- [#2341](https://github.com/1024pix/pix/pull/2341) [CLEANUP] Supprimer le warning d'icône non trouvé sur la page de résultat (PIX-1940).
- [#2339](https://github.com/1024pix/pix/pull/2339) [CLEANUP] Supprimer la dépréciation fa-icon (PIX-1938).

## v2.241.0 (30/12/2020)

- [#2329](https://github.com/1024pix/pix/pull/2329) [FEATURE] Traduction du nom de la compétence sur la notification d'augmentation de niveau (PIX-1784)
- [#2324](https://github.com/1024pix/pix/pull/2324) [FEATURE] Déplacer le nom du centre de certification et ajouter l'UAI dans le header de Pix Certif (PIX-1629).
- [#2330](https://github.com/1024pix/pix/pull/2330) [BUGFIX] Traduire le texte affiché lorsque l’utilisateur n’a pas répondu. (PIX-1830).

## v2.240.0 (29/12/2020)

- [#2327](https://github.com/1024pix/pix/pull/2327) [FEATURE] Modifier le wording de l'étape 2 de la finalisation de session (PIX-1794)
- [#2328](https://github.com/1024pix/pix/pull/2328) [BUGFIX] Le mauvais résultat de fin de compétence s'affiche lorsqu'on termine une évaluation de compétence sur PixApp (PIX-1835)
- [#2318](https://github.com/1024pix/pix/pull/2318) [BUGFIX] Renseigner la bonne traduction sur la page de présentation de la campagne (PIX-1825).

## v2.239.0 (29/12/2020)

- [#2325](https://github.com/1024pix/pix/pull/2325) [FEATURE] Ajout des codes de signalement pour les catégories et sous-catégories (PIX-1819)
- [#2320](https://github.com/1024pix/pix/pull/2320) [FEATURE] Transformer le PV de session en feuille d'émargement (PIX-1536)
- [#2309](https://github.com/1024pix/pix/pull/2309) [BUGFIX] Empêcher la participation à une campagne archivée ou restreinte et à laquelle l'utilisateur n'a pas accès (PIX-1779)
- [#2326](https://github.com/1024pix/pix/pull/2326) [BUGFIX] Le bouton de téléchargement de la feuille d'émargement ne s'affiche pas pour les centres de certification SCO dans le cadre de la prescription de certif SCO (PIX-1831)
- [#2281](https://github.com/1024pix/pix/pull/2281) [BUGFIX] Renforce la contrainte d'accès à la prescription de certif SCO côté PixCertif en limitant l'accès aux centres de certification dont l'organisation soeur est isManagingStudents (PIX-1766)
- [#2282](https://github.com/1024pix/pix/pull/2282) [TECH] Remplacer la route GET /api/competence-evaluations?filter[assessmentId=123] par GET /api/assessments/123/competence-evaluations (PIX-1788)

## v2.238.0 (28/12/2020)

- [#2323](https://github.com/1024pix/pix/pull/2323) [FEATURE] Changer le lien dans dans le bandeau d'informations Pix Certif SCO (PIX-1815)
- [#2317](https://github.com/1024pix/pix/pull/2317) [FEATURE] Ajouter la catégorie "Problème sur une question" dans la fenêtre de catégorisation des signalements sur PixCertif (PIX-1699)
- [#2308](https://github.com/1024pix/pix/pull/2308) [FEATURE] Ajouter l'ID de l'organisation dans les diverses listes d'organisations dans PixAdmin (PIX-1817)
- [#2319](https://github.com/1024pix/pix/pull/2319) [FEAT] Rendre le renseignement du champ Commentaire Global vraiment facultatif dans PixCertif lors de la finalisation de session (PIX-1795)

## v2.237.0 (24/12/2020)

- [#2268](https://github.com/1024pix/pix/pull/2268) [FEATURE] Ajouter "Mes parcours" au dashboard Mon-Pix (PIX-1651).
- [#2279](https://github.com/1024pix/pix/pull/2279) [FEATURE] Exposer une api qui renvoie le résultat des certifications d'une organisation et le référentiel de compétences pour le livret scolaire LSU/LSL (PIX-1727)
- [#2312](https://github.com/1024pix/pix/pull/2312) [BUGFIX] Supprimer la phrase en bas du certificat partageable (PIX-1818).
- [#2310](https://github.com/1024pix/pix/pull/2310) [TECH] Améliorer l'encryption-service.
- [#2311](https://github.com/1024pix/pix/pull/2311) [TECH] Utiliser les règles de lint octane pour le hbs sur Pix App (PIX-1821).
- [#2314](https://github.com/1024pix/pix/pull/2314) [TECH] Réparer les seeds suite à la remodélisation des accès par MDP (PIX-1823)

## v2.236.0 (23/12/2020)

- [#2220](https://github.com/1024pix/pix/pull/2220) [FEATURE] Création de la méthode d'authentification utilisant spécifiquement un mot de passe (PIX-1365).

## v2.235.0 (22/12/2020)

- [#2306](https://github.com/1024pix/pix/pull/2306) [FEATURE] Autoriser la suppression de signalement pendant la finalisation d'une session de certification (PIX-1488)
- [#2304](https://github.com/1024pix/pix/pull/2304) [FEATURE] Afficher la modale listant les signalements existants (PIX-1487)
- [#2293](https://github.com/1024pix/pix/pull/2293) [FEATURE] Créer une campagne de collecte de profil pour une liste d'organisation précise (PIX-1773)
- [#2291](https://github.com/1024pix/pix/pull/2291) [FEATURE] Afficher une annonce pour le lancement du niveau 6 (PIX-1793).
- [#2276](https://github.com/1024pix/pix/pull/2276) [FEATURE] Ouvrir les questions de niveau 6 (PIX-1781).
- [#2300](https://github.com/1024pix/pix/pull/2300) [FEATURE] Ajouter catégorisation dans les signalements quand je finalise une session (PIX-1526).
- [#2278](https://github.com/1024pix/pix/pull/2278) [TECH] Remplacer l'appel à users/me par l'usage d'un nouveau modèle CertificationPointOfContact dans PixCertif (PIX-1782)
- [#2303](https://github.com/1024pix/pix/pull/2303) [CLEANUP] Supprimer les commentaires peu utilisés "// attributes", ...

## v2.234.0 (18/12/2020)

- [#2301](https://github.com/1024pix/pix/pull/2301) [FEATURE] Afficher le nombre correct de signalements d'une certification sur la page de finalisation de session PixCertif (PIX-1813)
- [#2283](https://github.com/1024pix/pix/pull/2283) [BUGFIX] Traduire l'erreur sur le format des dates de naissances en français lors de l'import d'étudiants AGRI (PIX-1765)
- [#2297](https://github.com/1024pix/pix/pull/2297) [BUGFIX] Afficher le certificat quand le code de vérification saisi est correct (PIX-1791).
- [#2289](https://github.com/1024pix/pix/pull/2289) [TECH] Mise à jour de pix-ui sur mon-pix en version 1.3.0
- [#2298](https://github.com/1024pix/pix/pull/2298) [TECH] Le script configure charge les données de tests en bdd
- [#2290](https://github.com/1024pix/pix/pull/2290) [TECH] Ajouter un composant pour chaque catégorie de signalement (PIX-1786)
- [#2299](https://github.com/1024pix/pix/pull/2299) [TECH] Réduit les occurrences de timeout sur les tests du knex-utils
- [#2288](https://github.com/1024pix/pix/pull/2288) [TECH] Faciliter la connexion sur les utilisateurs créées par seeds.
- [#2295](https://github.com/1024pix/pix/pull/2295) [TECH] Suppression de `ember-cli-eslint`

## v2.233.0 (16/12/2020)

- [#2234](https://github.com/1024pix/pix/pull/2234) [FEATURE] Ajouter de nouvelles catégories de signalement en certif (PIX-1744)

## v2.232.0 (15/12/2020)

- [#2287](https://github.com/1024pix/pix/pull/2287) [FEATURE] Ajout de la recherche sur le filtre par classe (PIX-1775)
- [#2286](https://github.com/1024pix/pix/pull/2286) [FEATURE] Permettre le téléchargement du pv de session aux utilisateurs sco  (PIX-1787)
- [#2285](https://github.com/1024pix/pix/pull/2285) [TECH] Supprimer l'avertissement CSS "start value has mixed support".
- [#2280](https://github.com/1024pix/pix/pull/2280) [TECH] Fixer la version de pix-ui dans pix-certif
- [#2273](https://github.com/1024pix/pix/pull/2273) [TECH] Script permettant d'ajouter plusieurs classes d'élèves à un centre de certification

## v2.231.0 (15/12/2020)

- [#2270](https://github.com/1024pix/pix/pull/2270) [FEATURE]  Modification des urls de redirection présents dans les mails (PIX-1761).
- [#2251](https://github.com/1024pix/pix/pull/2251) [FEATURE] Filtrer les élèves par classe pour l'ajout à une session (PIX-1397)
- [#2277](https://github.com/1024pix/pix/pull/2277) [BUGFIX] Corriger le problèmes des bulletins de compétences disparues (PIX-1780).
- [#2274](https://github.com/1024pix/pix/pull/2274) [BUGFIX] Ajouter un  placeholder sur le champ de recherche du créateur des campagnes (PIX-1767).
- [#2272](https://github.com/1024pix/pix/pull/2272) [BUGFIX] Ne plus pouvoir accéder à n'importe quelle campagne si un utilisateur est réconcilié 1 fois (PIX-1692).
- [#2264](https://github.com/1024pix/pix/pull/2264) [TECH] Mise à jour des règles eslint sur pix
- [#2263](https://github.com/1024pix/pix/pull/2263) [CLEANUP] Retirer les "classic" des transform et controller sur Mon-Pix
- [#2262](https://github.com/1024pix/pix/pull/2262) [CLEANUP] Retirer les "classic" des adapters sur Mon-pix.

## v2.230.0 (14/12/2020)

- [#2259](https://github.com/1024pix/pix/pull/2259) [FEATURE] Permettre la connexion à Pole Emploi pour un utilisateur connecté à Pix (PIX-1736).
- [#2267](https://github.com/1024pix/pix/pull/2267) [FEATURE] Ajouter une bannière d'information pour les utilisateurs SCO de Pix Certif (PIX-1742)
- [#2244](https://github.com/1024pix/pix/pull/2244) [FEATURE] Permettre à l'utilisateur de changer son email - API (PIX-1748).
- [#2269](https://github.com/1024pix/pix/pull/2269) [FEATURE] Localiser l’image affichée lorsque l’utilisateur n’a pas enregistré de tutoriel (PIX-1076).
- [#2245](https://github.com/1024pix/pix/pull/2245) [FEATURE] Envoi du parcours commencé à Pôle Emploi et enregistrement de la réponse (PIX-1734).
- [#2246](https://github.com/1024pix/pix/pull/2246) [FEATURE] Envoi du parcours terminé à Pôle Emploi et enregistrement de la réponse (PIX-1735).
- [#2176](https://github.com/1024pix/pix/pull/2176) [FEATURE] Permettre l'upload de fichier ZIP pour l'import d'élèves avec une fichier siècle (Pix-1615).
- [#2242](https://github.com/1024pix/pix/pull/2242) [BUGFIX] Imposer un identifiant valide lors de la création de compte (réconciliation) dans Pix App (PIX-1549). 
- [#2261](https://github.com/1024pix/pix/pull/2261) [BUGFIX] Empêcher l'appel à l'API quand le formulaire est invalide dans Pix App (PIX-215).
- [#2256](https://github.com/1024pix/pix/pull/2256) [TECH] Mise a jour des dependance Pix App
- [#2210](https://github.com/1024pix/pix/pull/2210) [TECH] Enregistrer les signalements surveillant dans la nouvelle table de signalements (PIX-1743)

## v2.229.2 (09/12/2020)

- [#2257](https://github.com/1024pix/pix/pull/2257) [TRANSLATION] Mise à jour des traductions

## v2.229.1 (08/12/2020)

- [#2258](https://github.com/1024pix/pix/pull/2258) [BUGFIX] Désactivation de la fonctionnalité dashboard par défaut (PIX-1759).

## v2.229.0 (08/12/2020)

- [#2240](https://github.com/1024pix/pix/pull/2240) [FEATURE] Ajout de la page dashboard en feature toggle (PIX-1650).
- [#2239](https://github.com/1024pix/pix/pull/2239) [FEATURE] Déplacement du lien "Mes tutos" du menu utilisateur à la barre de navigation principale (PIX-1649).
- [#2238](https://github.com/1024pix/pix/pull/2238) [FEATURE] Faire l'envoi des résultats à Pôle Emploi lors du partage de la participation (PIX-1561).
- [#2232](https://github.com/1024pix/pix/pull/2232) [FEATURE] Enregistrement du succès ou de l'échec de l'envoi des résultats à Pôle Emploi au partage (PIX-1708).
- [#2250](https://github.com/1024pix/pix/pull/2250) [TECH] Ajouter le lien Github de la PR dans le commentaire des liens RA (PIX-1752).
- [#2254](https://github.com/1024pix/pix/pull/2254) [TECH] Corrige l'intégration Jira au merge (PIX-1753)
- [#2253](https://github.com/1024pix/pix/pull/2253) [TECH] Lance le lint des fichiers js sur mon-pix sur la CI.
- [#2252](https://github.com/1024pix/pix/pull/2252) [TECH] Suppression du feature toggle pour améliorer une compétence (PIX-760).
- [#2249](https://github.com/1024pix/pix/pull/2249) [TECH] Supprimer la dépendance sinon du package.json à la racine.
- [#2214](https://github.com/1024pix/pix/pull/2214) [TECH] Mettre à jour ember en 3.22 et les autres paquets sur Pix APP (PIX-1725).
- [#2241](https://github.com/1024pix/pix/pull/2241) [FEATURE ] QCU - Remplacer les chiffres par la réponse textuelle en cas de mauvaise réponse (PIX-1741).

## v2.228.0 (03/12/2020)

- [#2206](https://github.com/1024pix/pix/pull/2206) [FEATURE] Migration de la connexion Pole Emploi dans la table authentication-methods (PIX-1523).
- [#2225](https://github.com/1024pix/pix/pull/2225) [FEATURE] Retourner sur le site pix.org/en-gb quand on se déconnecte de app.pix.org en anglais (PIX-1621).
- [#2228](https://github.com/1024pix/pix/pull/2228) [BUGFIX] Empêcher la création de plusieurs assessments d'improvement simultanés en campagne (PIX-1575)
- [#2207](https://github.com/1024pix/pix/pull/2207) [BUGFIX] Corriger le premier déploiement des review apps.
- [#2233](https://github.com/1024pix/pix/pull/2233) [TECH] Mettre à jour ember-page-title sur Pix APP (PIX-1738)
- [#2229](https://github.com/1024pix/pix/pull/2229) [TECH] Empêcher une erreur interne API lors de la création d'un utilisateur.
- [#2236](https://github.com/1024pix/pix/pull/2236) [TECH] Mettre à jour de eslint-plugin-ember (PIX-1740).
- [#2235](https://github.com/1024pix/pix/pull/2235) [TECH] Nettoyage du package.json de l'API.
- [#2223](https://github.com/1024pix/pix/pull/2223) [TECH] Supprimer le vidage non intentionnel du slugignore API.
- [#1730](https://github.com/1024pix/pix/pull/1730) [DOC] ADR sur la gestion des erreurs dans l'API et IHM.

## v2.227.0 (01/12/2020)

- [#2215](https://github.com/1024pix/pix/pull/2215) [FEATURE] Afficher l'identifiant dans la page "Mon Compte" dans Pix App (PIX-1702).
- [#2222](https://github.com/1024pix/pix/pull/2222) [FEATURE] Ajout de sous-catégories de support pour les fichiers "image" (PIX-1639).
- [#2189](https://github.com/1024pix/pix/pull/2189) [FEATURE] Prise en compte des 0 après virgules et points dans QROC (PIX-1592).
- [#2204](https://github.com/1024pix/pix/pull/2204) [BUGFIX] Ajouter une transaction a la creation de campagne (PIX-1689)
- [#2212](https://github.com/1024pix/pix/pull/2212) [TECH] Serialiser correctement le prescripteur et ses informations (PIX-1724).
- [#2179](https://github.com/1024pix/pix/pull/2179) [TECH] Mise à jour de ember en 3.20 pour Pix App (PIX-1693).

## v2.226.0 (30/11/2020)

- [#2211](https://github.com/1024pix/pix/pull/2211) [BUGFIX] Lever une erreur correctement dans le script de création d'apprentis lorsqu'un ID externe d'organisation est introuvable (PIX-1694).

## v2.225.0 (27/11/2020)

- [#2183](https://github.com/1024pix/pix/pull/2183) [FEATURE] Création de la page Mon Compte dans Pix App (PIX-452).
- [#2145](https://github.com/1024pix/pix/pull/2145) [FEATURE] Ajout de la fonctionnalité "Ajouter un identifiant" pour l'élève disposant d'une adresse e-mail sur pix Orga (PIX-1154).
- [#2190](https://github.com/1024pix/pix/pull/2190) [FEATURE] Bloquer l'accès à PixCertif pour les utilisateurs SCO (PIX-1616)
- [#2208](https://github.com/1024pix/pix/pull/2208) [BUGFIX] Ignorer les doublons de rattachement de profils cible dans le script associé (PIX-1709).
- [#2182](https://github.com/1024pix/pix/pull/2182) [BUGFIX] Gestion de la contrainte d'unicité sur le partage de profils cible en amont afin de ne pas remonter un erreur de BDD (PIX-1608).
- [#2203](https://github.com/1024pix/pix/pull/2203) [TECH] Permettre de créer des JDD en BDD sur la RA sans embarquer les tests en production (PIX-1707).
- [#2195](https://github.com/1024pix/pix/pull/2195) [BSR] Prévenir l'usage non intentionnel de console.log dans les tests API.

## v2.224.0 (26/11/2020)

- [#2125](https://github.com/1024pix/pix/pull/2125) [FEATURE] Migration de la connexion GAR dans la table authentication-methods (PIX-1364).
- [#2193](https://github.com/1024pix/pix/pull/2193) [FEATURE] Afficher le modèle du CSV ainsi que son info bulle seulement pour les organisations SCO AGRI et CFA (Pix-1672) 
- [#2196](https://github.com/1024pix/pix/pull/2196) [BUGFIX] Déplacer les vérifications contionnelles de birthCityCode / birthCity après les éléments required (Pix-1696)
- [#2202](https://github.com/1024pix/pix/pull/2202) [TECH] Ajuster la taille des containers docker sur les différents jobs de la CI (PIX-1703)
- [#2201](https://github.com/1024pix/pix/pull/2201) [TECH] Garantir la qualité du code dans Pix Certif.
- [#2198](https://github.com/1024pix/pix/pull/2198) [TECH] Asynchroniser le lancement des tests e2e sur CircleCI (PIX-1698).
- [#2185](https://github.com/1024pix/pix/pull/2185) [TECH] Amélioration des performances BDD lors de la récupération des listes de campagnes dans PixOrga (PIX-1686)
- [#2200](https://github.com/1024pix/pix/pull/2200) [TECH] Suppression du warning lié à browserslist lors du build de `mon-pix`.
- [#2199](https://github.com/1024pix/pix/pull/2199) [TECH] Déplacer un ticket JIRA quand sa PR est mergée sur dev
- [#2197](https://github.com/1024pix/pix/pull/2197) [TECH] Amélioration des fichiers `.slugignore`

## v2.223.0 (25/11/2020)

- [#2177](https://github.com/1024pix/pix/pull/2177) [FEATURE] Construction du payload PE à la fin d'une campagne (PIX-1626)
- [#2175](https://github.com/1024pix/pix/pull/2175) [FEATURE] Construction du payload PE au démarrage d'une campagne (PIX-1625)
- [#2174](https://github.com/1024pix/pix/pull/2174) [FEATURE] Créer de la pagination sur l'ajout des élèves pour les établissements SCO (Pix-1588)
- [#2184](https://github.com/1024pix/pix/pull/2184) [FEATURE] Affichage des acquis contenus dans un profil cible dans Pix Admin (PIX-1666).
- [#2187](https://github.com/1024pix/pix/pull/2187) [FEATURE] Ajouter une validation de l'INA dans l'import CSV pour les Organisations SCO AGRICULTURE important des apprentis (PIX-1665).
- [#2192](https://github.com/1024pix/pix/pull/2192) [TECH] Re-positionner le job e2e au même niveau que les autres jobs dans la CI
- [#2172](https://github.com/1024pix/pix/pull/2172) [TECH] Supprimer le mot déploiement du CR de CI.
- [#2178](https://github.com/1024pix/pix/pull/2178) [TECH] Mise à jour de ember en 3.19 pour Pix App (PIX-1648).
- [#2120](https://github.com/1024pix/pix/pull/2120) [TECH] Mettre à jour des linters sur Pix App (PIX-1634).
- [#2180](https://github.com/1024pix/pix/pull/2180) [TECH] Enrichissement du modèle TargetProfileWithLearningContent avec Paliers et Badges (PIX-1687)

## v2.222.0 (24/11/2020)

- [#2169](https://github.com/1024pix/pix/pull/2169) [BUGFIX] N'autoriser que les code INSEE pour les birthCountryCode et birthCityCode lors d'un import CSV (Pix-1623).
- [#2181](https://github.com/1024pix/pix/pull/2181) [BUGFIX] Ajout d'une vérification sur l'id de certification sur Pix Admin (PIX-1652)
- [#2149](https://github.com/1024pix/pix/pull/2149) [TECH] Effectuer la montée de version d'Ember (3.21 → 3.22) pour Pix Admin (PIX-1688)
- [#2188](https://github.com/1024pix/pix/pull/2188) [TECH] Mettre à jour le lien Pix cloud vers les documents de Pix Orga. 

## v2.221.0 (20/11/2020)

- [#2162](https://github.com/1024pix/pix/pull/2162) [FEATURE] Supprimer la règle d'appartenance à Pix Orga pour ajouter des élèves à une session dans Pix Certif (PIX-1614)
- [#2171](https://github.com/1024pix/pix/pull/2171) [FEATURE] Utiliser le tag "POLE EMPLOI" pour l'envoi des résultats à Pôle Emploi (PIX-1562).
- [#2161](https://github.com/1024pix/pix/pull/2161) [FEATURE] Ajouter du markdown dans les descriptions de paliers et de badges (PIX-1619).
- [#2154](https://github.com/1024pix/pix/pull/2154) [BUGFIX] Ne pas afficher la page de réconciliation si l'élève est déjà réconcilié (PIX-1064).
- [#2166](https://github.com/1024pix/pix/pull/2166) [BUGFIX] 2ème correction du payload d'envoi des résultats à Pôle Emploi (PIX-1622).
- [#2072](https://github.com/1024pix/pix/pull/2072) [TECH] Amélioration des performances pour l'analyse de campagne (PIX-1598)
- [#2158](https://github.com/1024pix/pix/pull/2158) [TECH] Limiter le temps d'attente au démarrage des tests E2E sur la CI.
- [#2170](https://github.com/1024pix/pix/pull/2170) [INFRA] Faire que le DatabaseBuilder lance une exception quand son commit échoue
- [#2153](https://github.com/1024pix/pix/pull/2153) [TRANSLATION] Mise à jour des traductions Pix
- [#2168](https://github.com/1024pix/pix/pull/2168) [FIX] Correction d'un flacky test sur la création de campagne (PIX-1474)

## v2.220.0 (18/11/2020)

- [#2126](https://github.com/1024pix/pix/pull/2126) [FEATURE] Garder la langue de l'utilisateur quand il la change (PIX-1566).
- [#2160](https://github.com/1024pix/pix/pull/2160) [FEATURE] Amélioration de la gestion d'erreur des imports de fichier SIECLE.
- [#2142](https://github.com/1024pix/pix/pull/2142) [FEATURE] Ajout des évaluations dans le payload Pole Emploi (PIX-1560)
- [#2148](https://github.com/1024pix/pix/pull/2148) [FEATURE] Permettre de rattacher plusieurs organisations à un profil cible (PIX-1495).
- [#2144](https://github.com/1024pix/pix/pull/2144) [FEATURE] Mise à jour du message d'erreur lorsque le QROC contient un nombre. (PIX-1574)
- [#2137](https://github.com/1024pix/pix/pull/2137) [FEATURE] Créer une catégorie "Autre" pour signalement quand on finalise une session (PIX-1470)
- [#2128](https://github.com/1024pix/pix/pull/2128) [FEATURE] Afficher les organisations liées au profil cible (PIX-1494).
- [#2147](https://github.com/1024pix/pix/pull/2147) [FEATURE] Réduire la taille du champ réponse lorsque la réponse attendue est un nombre (PIX-1590).
- [#2146](https://github.com/1024pix/pix/pull/2146) [FEATURE] Modifier les instructions d'aide pour les téléchargements de fichiers (PIX-1591).
- [#2116](https://github.com/1024pix/pix/pull/2116) [FEATURE] Gestion de la mise à jour des Apprentis lors d'un import CSV (PIX-1552)
- [#2113](https://github.com/1024pix/pix/pull/2113) [FEATURE] Vérifier l'accès à la session de certification des élèves (PIX-1540)
- [#2141](https://github.com/1024pix/pix/pull/2141) [FEATURE] Ajout des données individu et campagne pour pole emploi (PIX-1559)
- [#2155](https://github.com/1024pix/pix/pull/2155) [BUGFIX] Rendre déterministes les tests e2e "... restreint en étant connecté via un organisme externe" (PIX-1607).
- [#2134](https://github.com/1024pix/pix/pull/2134) [BUGFIX] Ajout d'une contrainte d'unicité sur le nationalStudentId et le nationalApprenticeId avant l'insertion en base (PIX-1581).
- [#2163](https://github.com/1024pix/pix/pull/2163) [TECH] Mise à jour de la version locale de node avec nvm de 12.18.0 to 14.15.1
- [#2156](https://github.com/1024pix/pix/pull/2156) [TECH] Rendre le rapport de CI plus lisible.
- [#2109](https://github.com/1024pix/pix/pull/2109) [TECH] Générer en masse un fichier SIECLE cohérent (production-like).
- [#2143](https://github.com/1024pix/pix/pull/2143) [TECH] Faciliter le changement de version de node en local.
- [#2110](https://github.com/1024pix/pix/pull/2110) [TECH] Mise à jour de Node version 12.18.0 à 14.15.1
- [#2138](https://github.com/1024pix/pix/pull/2138) [DOC] Utiliser le type de données JSONB en base de données.
- [#2157](https://github.com/1024pix/pix/pull/2157) [CLEANUP] Supprimer les scripts obsolètes à la racine du dépot.

## v2.219.0 (13/11/2020)

- [#2085](https://github.com/1024pix/pix/pull/2085) [FEATURE] Permettre l'accès à Mon-Pix en se connectant avec un compte Pole Emploi (PIX-1418).
- [#2136](https://github.com/1024pix/pix/pull/2136) [BUGFIX] Remplacer studentNumber ou une division à null par une chaîne vide pour permettre le téléchargement des CSV dans Pix Orga (PIX-1586).
- [#2061](https://github.com/1024pix/pix/pull/2061) [TECH] Réduire le pic mémoire lors du parsing des fichiers SIECLE volumineux et optimiser le traitement (Pix-1405)
- [#2118](https://github.com/1024pix/pix/pull/2118) [TECH] Mettre à jour les paquets Mon Pix.
- [#2140](https://github.com/1024pix/pix/pull/2140) [FIX] Correction de l'ordre des colonnes badges et paliers dans l'export CSV (PIX-1587)

## v2.218.0 (12/11/2020)

- [#2132](https://github.com/1024pix/pix/pull/2132) [FEATURE] Ajouter une page de fin aux campagnes de Pix Concours (PIX-1541).
- [#2089](https://github.com/1024pix/pix/pull/2089) [FEATURE] Mise en place du socle permettant le refacto des méthodes de connexion (PIX-1168).
- [#2108](https://github.com/1024pix/pix/pull/2108) [FEATURE] Adapter l'algo des campagnes pour les tests Pix Concours (PIX-1573).
- [#2129](https://github.com/1024pix/pix/pull/2129) [FEATURE] Retirer la barre de progression durant les épreuves Pix-Concours (PIX-1582).
- [#2130](https://github.com/1024pix/pix/pull/2130) [FEATURE] Retirer les liens "Signaler un problème" des différents challenges de Pix-Concours (PIX-1583).
- [#2104](https://github.com/1024pix/pix/pull/2104) [FEATURE] Griser les élèves déjà candidats lors de l'ajout (PIX-1379)
- [#2124](https://github.com/1024pix/pix/pull/2124) [BUGFIX] Retirer les mots Parcours de l'application (PIX-1577)
- [#2133](https://github.com/1024pix/pix/pull/2133) [TECH] Créer un script permettant d'ajouter un nombre important d'élèves (PIX-1572)
- [#2135](https://github.com/1024pix/pix/pull/2135) [TECH] Mise à jour des messages d'erreurs de réconciliation dans Mon-Pix (PIX-1426)
- [#2117](https://github.com/1024pix/pix/pull/2117) [TECH] Suppression du endpoint /api/users/{id}/authentication-methods/saml (PIX-1578).
- [#2127](https://github.com/1024pix/pix/pull/2127) [ORGA] Ajout d'un tooltip pour l'import des orga SCO Agri (PIX-1565)

## v2.217.0 (09/11/2020)

- [#2131](https://github.com/1024pix/pix/pull/2131) [BUGFIX] Utiliser replaceWith au lieu de transitionTo.

## v2.216.0 (09/11/2020)

- [#2121](https://github.com/1024pix/pix/pull/2121) [FEATURE] Modifier le message d'erreur des embed auto
- [#2122](https://github.com/1024pix/pix/pull/2122) [FEATURE] Modification du message lors du timeout d'une épreuve
- [#2111](https://github.com/1024pix/pix/pull/2111) [FEATURE] Ajout d'un message de redirection vers le support pour les téléchargement de fichiers (PIX-1451).
- [#2105](https://github.com/1024pix/pix/pull/2105) [FEATURE]Ajout la classe dans l'export CSV de campagne de collecte de profil pour les organisation SCO (Pix-1548)
- [#2101](https://github.com/1024pix/pix/pull/2101) [FEATURE] Cacher le bas de la page présentation quand on démarre les campagnes Pix Concours (PIX-1563).
- [#2094](https://github.com/1024pix/pix/pull/2094) [FEATURE] Ajouter à nouveau des étudiants pour une session de certification - PART 2 (PIX-1378)
- [#2102](https://github.com/1024pix/pix/pull/2102) [FEATURE] Pix Concours: Cacher le didacticiel (PIX-1516).
- [#2086](https://github.com/1024pix/pix/pull/2086) [FEATURE] Ajouter à nouveau des étudiants pour une session de certification - PART 1 (PIX-1378)
- [#2097](https://github.com/1024pix/pix/pull/2097) [FEATURE] Pix Concours: cacher la notification de gain de niveau
- [#2096](https://github.com/1024pix/pix/pull/2096) [FEATURE] Ne plus afficher les checkpoints sur Pix-Concours (PIX-1515).
- [#2058](https://github.com/1024pix/pix/pull/2058) [FEATURE] Afficher les candidats SCO d'une certification (PIX-1376)
- [#2092](https://github.com/1024pix/pix/pull/2092) [FEATURE] Amélioration du contraste sur la page compétence
- [#2099](https://github.com/1024pix/pix/pull/2099) [BUGFIX] Modification du message d'erreur sur la page de fin de résultats de fin de campagne (PIX-1533).
- [#2107](https://github.com/1024pix/pix/pull/2107) [BUGFIX] S'assurer de faire les vérifications d'assessment sur celui le plus récent d'une participation lors du partage des résultats (PIX-1571)
- [#2074](https://github.com/1024pix/pix/pull/2074) [BUGFIX] Corriger l'erreur sur l'assessmentId lors de  la requête GET /api/campaign-participations (PIX-1472).
- [#2103](https://github.com/1024pix/pix/pull/2103) [TECH] Remplacement de l'apostrophe ’ par l'apostrophe droite ' dans le modèle d'import CSV (PIX-1564)
- [#2112](https://github.com/1024pix/pix/pull/2112) [TECH] Corriger l'url de connexion à lcms dans sample.env
- [#2100](https://github.com/1024pix/pix/pull/2100) [TECH] Correction du lint certif
- [#2071](https://github.com/1024pix/pix/pull/2071) [TECH] Ajouter un script de création en masse des apprentis (Pix-1353).
- [#2062](https://github.com/1024pix/pix/pull/2062) [TECH] Récupérer le référentiel de contenu depuis l'API LCMS.
- [#2075](https://github.com/1024pix/pix/pull/2075) [TECH] Passer par une nouvelle route pour avec le pixScore et les compétences (PIX-1467).
- [#2093](https://github.com/1024pix/pix/pull/2093) [TECH] Rendre le déclenchement du job e2e dépendant du succès des jobs des applications (PIX-1553)
- [#2119](https://github.com/1024pix/pix/pull/2119) [FIX] Corrige le champs date de naissance lors de l'ajout manuel d'un candidat à une session de certification
- [#2115](https://github.com/1024pix/pix/pull/2115) Ajout de la classe dans l'export de csv de campagne d'évaluations pour les organisations SCO (PIX-1294).

## v2.215.0 (02/11/2020)

- [#2079](https://github.com/1024pix/pix/pull/2079) [FEATURE] Création du script d'ajout de tags aux organisations (PIX-1461).
- [#2081](https://github.com/1024pix/pix/pull/2081) [FEATURE] Autoriser l'import d'apprenti pour SCO Agriculture (Pix-1356) 
- [#2084](https://github.com/1024pix/pix/pull/2084) [FEATURE] Améliorations liste des candidats SCO (Pix-1532)
- [#2060](https://github.com/1024pix/pix/pull/2060) [FEATURE] Amélioration de l'affichage des réponses en cas de mauvaise réponse sur les QCU (PIX-1475).
- [#2078](https://github.com/1024pix/pix/pull/2078) [FEATURE][PE] Mise à jour des données mocker pour le partage de résultat de campagne (PIX-1537)
- [#2046](https://github.com/1024pix/pix/pull/2046) [FEATURE] Ajouter des candidats venant du SCO à une session de certif (PIX-1375)
- [#2066](https://github.com/1024pix/pix/pull/2066) [FEATURE] Changement du wording de la banière SCO (remplacement Toussaint par Noël) (PIX-1528).
- [#2083](https://github.com/1024pix/pix/pull/2083) [BUGFIX] Fix pour l'erreur lors de la liaison des target-profile à une organization (PIX-1478).
- [#2088](https://github.com/1024pix/pix/pull/2088) [BUGFIX] Empêcher le job e2e de la CI de crasher par manque de mémoire (PIX-1551)
- [#2077](https://github.com/1024pix/pix/pull/2077) [BUGFIX] Le téléchargement du template CSV SCO agri ne fonctionne pas
- [#2080](https://github.com/1024pix/pix/pull/2080) [TECH] Mise en place d'une contrainte d'unicité pour s'assurer qu'un profil cible n'est rattaché qu'une seule fois à une organisation (PIX-491)
- [#2031](https://github.com/1024pix/pix/pull/2031) [TECH] Remplacer des boutons par des PixButton pour gérer le chargement.
- [#2073](https://github.com/1024pix/pix/pull/2073) [TECH] Retirer les imports globaux de lodash
- [#2056](https://github.com/1024pix/pix/pull/2056) [TECH] Permettre les tests automatisés multi-plateformes (Windows, Linux, MacOSX).
- [#1902](https://github.com/1024pix/pix/pull/1902) [TECH] Montée de version d'Ember (3.18 → 3.21) et des dépendances de Pix Admin.
- [#2001](https://github.com/1024pix/pix/pull/2001) [TECH] Enlever la relation session hasMany certificationCandidates (CERTIF)
- [#1856](https://github.com/1024pix/pix/pull/1856) [TECH] Montée de version d'Ember (3.18 → 3.22) et des dépendances de Pix Orga.
- [#2091](https://github.com/1024pix/pix/pull/2091) [CLEANUP] Suppression du student-serializer qui n'est plus utilisé
- [#2057](https://github.com/1024pix/pix/pull/2057) [CLEANUP]  Refacto des vérifications concernant la pérennité des comptes dans les usecases (PIX-1499).

## v2.214.0 (28/10/2020)

- [#2055](https://github.com/1024pix/pix/pull/2055) [FEATURE] Ajouter le palier dans l'export des résultats d'un campagne d'évaluation (PIX-1458).
- [#2034](https://github.com/1024pix/pix/pull/2034) [FEATURE] Bloquer les boutons quand le temps est écoulé (PIX-1454).
- [#2069](https://github.com/1024pix/pix/pull/2069) [FEATURE] Ne pas afficher le lieu de naissance sur le certificat si il n'est pas disponible (PIX-1531).
- [#2047](https://github.com/1024pix/pix/pull/2047) [FEATURE] Ajout condition isShared pour afficher les badges obtenu (PIX-1490)
- [#2067](https://github.com/1024pix/pix/pull/2067) [FEATURE] Changement de nom de l'identifiant en identifiant externe au sein de la page de création d'une campagne (PIX-1529).
- [#2044](https://github.com/1024pix/pix/pull/2044) [FEATURE] Inclure les résultats thématiques dans l'export des campagnes d'évaluation (PIX-1457).
- [#2068](https://github.com/1024pix/pix/pull/2068) [BUGFIX] Afficher si possible le lieu de naissance sur l'attestation de certification Pix (PIX-1504).
- [#1911](https://github.com/1024pix/pix/pull/1911) [TECH] Améliore la gestion des exceptions dans le database-builder (PIX-1306)
- [#2054](https://github.com/1024pix/pix/pull/2054) [TECH] Refacto de méthodes du répo knowledge-elements utilisant les snapshots KE pour mieux répondre aux besoins (PIX-990-1)
- [#2070](https://github.com/1024pix/pix/pull/2070) [TECH] Préconiser l'utilisation d'un serveur http léger dans les tests.
- [#2065](https://github.com/1024pix/pix/pull/2065) [TECH] Correction d'orthographe sur le terme supernumerary (PIX-1527).
- [#2064](https://github.com/1024pix/pix/pull/2064) [TECH] Correcteur d'erreur d'orthographe sur le terme targetprofile dans le code (PIX-1525)
- [#2050](https://github.com/1024pix/pix/pull/2050) [CLEANUP] Déplacer la mise à jour du userOrgaSettings dans l'API (PIX-1498).
- [#2037](https://github.com/1024pix/pix/pull/2037) [TRANSLATION] Corriger le html dans les fichiers de traduction
- [#1934](https://github.com/1024pix/pix/pull/1934) [CLEANUP] Corriger le contraste de la page profil

## v2.213.0 (27/10/2020)

- [#2042](https://github.com/1024pix/pix/pull/2042) [FEATURE] Ajout des paliers dans la liste des participants (PIX-1449)
- [#2049](https://github.com/1024pix/pix/pull/2049) [FEATURE] Ajouter un tooltip lors du survol des badges dans les résultats participant d'une campagne (PIX-1459).
- [#2045](https://github.com/1024pix/pix/pull/2045) [FEATURE] Cacher les bannières de Pix Orga lorsque l'organisation est SCO AGRICULTURE (PIX-1492).
- [#2043](https://github.com/1024pix/pix/pull/2043) [BUGFIX] Page blanche en fin de campagne (PIX-1272).
- [#1966](https://github.com/1024pix/pix/pull/1966) [TECH] Appliquer la règle de lint héritée de la racine dans /api.
- [#2027](https://github.com/1024pix/pix/pull/2027) [TECH] Montée de version d'Ember (3.21 → 3.22) et des dépendances de Pix Certif.
- [#2053](https://github.com/1024pix/pix/pull/2053) [TECH] Faire en sorte que les tests de l'API retourne une erreur le cas écheant. 
- [#2041](https://github.com/1024pix/pix/pull/2041) [TECH] Ajout de cross-env dans devDependencies pour lancer les tests sur les postes Windows (PIX-1480)
- [#2039](https://github.com/1024pix/pix/pull/2039) [TECH] Inclure le creatorId dans le fichier pour le script create-assessment-campaigns-for-sco.
- [#2038](https://github.com/1024pix/pix/pull/2038) [TECH] Ajout de l'intégration Sentry sur Pix App.
- [#2052](https://github.com/1024pix/pix/pull/2052) [CLEANUP] Supprimer un fichier de seeds inutile (PIX-1497).
- [#2048](https://github.com/1024pix/pix/pull/2048) [BUG] Rediriger vers la page '/' lors d'une déconnexion, sur Pix Admin/Certif/Orga (PIX-1493).
- [#2040](https://github.com/1024pix/pix/pull/2040) [INFRA] Montée de version d'ember-simple-auth sur Pix App (PIX-1476).
- [#1991](https://github.com/1024pix/pix/pull/1991) [DOC] Ajouter les instructions liées au cache pour l'exécution des tests E2E.

## v2.212.0 (22/10/2020)

- [#2024](https://github.com/1024pix/pix/pull/2024) [FEATURE] Afficher la liste des inscriptions d'un élève dans Pix Admin (PIX-1384).
- [#2035](https://github.com/1024pix/pix/pull/2035) [FEATURE] Ajout du prénom et nom du user connecté sur la page saisie code parcours (PIX-1415).
- [#2022](https://github.com/1024pix/pix/pull/2022) [FEATURE] Utiliser les tags pour définir si une organisation est de type "Agriculture" (PIX-1354).
- [#2032](https://github.com/1024pix/pix/pull/2032) [FEATURE] Afficher les résultats thématiques dans la liste des participants (PIX-1442)
- [#2030](https://github.com/1024pix/pix/pull/2030) [FEATURE] Permettre la selection d'élèves comme candidats d'une session (PIX-1374).
- [#2033](https://github.com/1024pix/pix/pull/2033) [FEATURE] Changer le message pour les épreuves à validation auto (PIX-1453).
- [#2023](https://github.com/1024pix/pix/pull/2023) [FEATURE] Autoriser l'import XML SIECLE seulement pour les organisations ayant un UAI concordant (PIX-1293).
- [#1997](https://github.com/1024pix/pix/pull/1997) [FEATURE] Afficher la liste des étudiants SCO pour l'ajout des candidats (PIX-1373)
- [#2036](https://github.com/1024pix/pix/pull/2036) [TRANSLATION] Ajout de traduction

## v2.211.0 (20/10/2020)

- [#2029](https://github.com/1024pix/pix/pull/2029) [FEATURE] Ajouter le type nombre au réponse QROC (PIX-1455).
- [#2015](https://github.com/1024pix/pix/pull/2015) [FEATURE] Ne pas afficher les paliers quand on a obtenu le badge CléA (PIX-1383).
- [#2026](https://github.com/1024pix/pix/pull/2026) [FEATURE] Pouvoir télécharger le modèle csv en tant qu'organisation SCO-AGRICULTURE. (PIX-1357)
- [#2021](https://github.com/1024pix/pix/pull/2021) [FEATURE] Filtrer les sessions par type de centre de certification (PIX-1341)
- [#2014](https://github.com/1024pix/pix/pull/2014) [FEATURE] Logguer en console les résultats mockés d'un participant à une campagne d'évaluation Pôle Emploi (PIX-1393).
- [#1994](https://github.com/1024pix/pix/pull/1994) [FEATURE] Ajout de l'import CSV des élèves pour les orga SCO Agri
- [#1988](https://github.com/1024pix/pix/pull/1988) [FEATURE] Parser un CSV SIECLE et l'importer (PIX-1351)
- [#2011](https://github.com/1024pix/pix/pull/2011) [BUGFIX] Amélioration de la gestion du cache de premier niveau.
- [#2007](https://github.com/1024pix/pix/pull/2007) [BUGFIX] Ajouter une transaction à l'improve d'une CompetenceEval (PIX-1411).
- [#2028](https://github.com/1024pix/pix/pull/2028) [TECH] Enrichir les test helpers de pix certif et async/await des tests d'API
- [#2025](https://github.com/1024pix/pix/pull/2025) [TECH] Montée de version mineure de la BDD 12.3=>12.4.
- [#2010](https://github.com/1024pix/pix/pull/2010) [TECH] Suppression de routes API dépréciées (PIX-1416).
- [#2019](https://github.com/1024pix/pix/pull/2019) [TECH] Nettoyage et mise à jour des données de tests, aussi nommées seeds (PIX-1425).
- [#1955](https://github.com/1024pix/pix/pull/1955) [TECH] Enlever les actions synchrones qui bloquent nodejs
- [#2020](https://github.com/1024pix/pix/pull/2020) [TECH] Refacto du certification result
- [#2009](https://github.com/1024pix/pix/pull/2009) [TECH] Migration de `stats.pix.fr` à `analytics.pix.fr`
- [#2017](https://github.com/1024pix/pix/pull/2017) [BSR] Utiliser que le helper HttpTestServer, pour les tests d'intégration et les tests unitaires, dans l'API (PIX-1423).
- [#2016](https://github.com/1024pix/pix/pull/2016) [REFACTO] Centraliser l'authentification des élèves venant du GAR (PIX-1422).
- [#2018](https://github.com/1024pix/pix/pull/2018) [CLEANUP] Rendre les niveaux d'erreurs de lint explicites.
- [#2004](https://github.com/1024pix/pix/pull/2004) [TRANSLATION] Mise à jour des traductions.

## v2.210.0 (15/10/2020)

- [#1998](https://github.com/1024pix/pix/pull/1998) [FEATURE]Afficher un onglet "Candidats" spécifique SCO sur la page de détails de ma session (PIX-1372)
- [#2013](https://github.com/1024pix/pix/pull/2013) [BUGFIX] Envoyer l'assessmentId lorsqu'on modifie une certification (PIX-1421)

## v2.209.0 (15/10/2020)

- [#2000](https://github.com/1024pix/pix/pull/2000) [FEATURE] Ajouter un message d'avertissement avant de réconcilier un élève (PIX-1391).
- [#2008](https://github.com/1024pix/pix/pull/2008) [FEATURE] Dissocier tous les élèves réconciliés avec un utilisateur dans Pix Admin (PIX-1394).
- [#2005](https://github.com/1024pix/pix/pull/2005)  [BUGFIX] Empêcher une erreur 500 suite à une violation de contrainte lors d'une réconciliation d'un élève (PIX-1367)

## v2.208.0 (13/10/2020)

- [#2003](https://github.com/1024pix/pix/pull/2003) [FEATURE] Ajouter un texte alternatif à l'image d'aide de l'identifiant externe (PIX-1363).
- [#2006](https://github.com/1024pix/pix/pull/2006) [FEATURE] Ajouter une documentation pour les organisation SCO-AGRI (PIX-1335)
- [#1999](https://github.com/1024pix/pix/pull/1999) [FEATURE] Réconcilier un élève avec un match strict, et dans un second temps avec une distance d'édition si pas de match (PIX-1401).
- [#1969](https://github.com/1024pix/pix/pull/1969) [FEATURE] Accessibilité de la page de résultat de campagne (PIX-1183)
- [#1971](https://github.com/1024pix/pix/pull/1971) [FEATURE] Ajout du numéro étudiant dans l'export csv d'une campagne de collecte de profils (PIX-1139).
- [#1989](https://github.com/1024pix/pix/pull/1989) [FEATURE] Editer le champ crédits d'une organisation (PIX-1296).
- [#1996](https://github.com/1024pix/pix/pull/1996) [BUG] Afficher le message d'erreur adéquat lorsque la longueur de l'e-mail est erronée, sur la page d'inscription de Mon-Pix (PIX-1275).

## v2.207.0 (12/10/2020)

- [#1992](https://github.com/1024pix/pix/pull/1992) [FEATURE] Upload un CSV d'élève pour les orga SCO Agri (PIX-1351)
- [#1987](https://github.com/1024pix/pix/pull/1987) [FEATURE] Rendre réutilisable le parser CSV HigherSchoolingRegistrationParser (PIX-1351)
- [#1963](https://github.com/1024pix/pix/pull/1963) [FEATURE] Création du service permettant la génération des résultats de certification (PIX-1359).
- [#1980](https://github.com/1024pix/pix/pull/1980) [FEATURE] Permettre de créer en masse des organisations SCO et leur ajouter le tag AGRI (PIX-1221).
- [#1964](https://github.com/1024pix/pix/pull/1964) [FEATURE] Amélioration de l’accessibilité de la modal Résultats et tutos (PIX-1182).
- [#1967](https://github.com/1024pix/pix/pull/1967) [FEATURE] Création du mail d'envoi des résultats de certif (PIX-978)
- [#1981](https://github.com/1024pix/pix/pull/1981) [FEATURE] Ajout d'une variable d'environnement pour identifier une organization "Agri" (PIX-1350)
- [#1926](https://github.com/1024pix/pix/pull/1926) [FEATURE] Gérer la mise à jour des étudiants surnuméraires des établissements supérieurs avec l'import (PIX-1124).
- [#1993](https://github.com/1024pix/pix/pull/1993) [BUGFIX] Corriger l'affichage des barres situées dans l'onglet analyse et résultats collectifs (PIX-1317)
- [#1974](https://github.com/1024pix/pix/pull/1974) [BUGFIX] Suppression des colonnes d'acquis du CSV de campagne d'évaluation avec la mention NA pour le SCO (PIX-1331).
- [#1944](https://github.com/1024pix/pix/pull/1944) [BUGFIX] Empêche le dépassement mémoire lié à l'affichage des résultats collectifs (+ amélioration des perfs au passage) (PIX-1067)
- [#1990](https://github.com/1024pix/pix/pull/1990) [TECH] Mise en place d'un Feature Toggle pour spécifier quelle organisation est Pôle Emploi (Pix-1392).
- [#1978](https://github.com/1024pix/pix/pull/1978) [TECH] Finalisation de la glimmerization et de l'octanification de Pix Orga (Pix-1386).
- [#1983](https://github.com/1024pix/pix/pull/1983) [TECH] Ajout d'une route pour télécharger les résultats d'une session (PIX-1359)
- [#1979](https://github.com/1024pix/pix/pull/1979) [TECH] Utiliser le nouveau modèle de TargetProfile dans l'analyse de campagne (PIX-1388)
- [#1949](https://github.com/1024pix/pix/pull/1949) [TECH] Ajouter une validation front lors de l'ajout de candidat (CERTIF)
- [#1986](https://github.com/1024pix/pix/pull/1986) [BUG] Amélioration dans Mon-Pix de la gestion des erreurs sur la page Réinitialiser le mot de passe (PIX-1385).
- [#1960](https://github.com/1024pix/pix/pull/1960) [TECH ] Retirer le feature toggle du telechargement de l'attestation
- [#1984](https://github.com/1024pix/pix/pull/1984) [CLEANUP] Retrait de la route API dépréciée POST /api/organizations/{id}/import-students pour l'import SIECLE (PIX-TODO)
- [#1970](https://github.com/1024pix/pix/pull/1970) [BUG] Rediriger les utilisateurs authentifiés depuis le médiacentre vers la page de déconnexion (pix-1284)
- [#1953](https://github.com/1024pix/pix/pull/1953) [DOC] Mise à jour de la documentation des tests de bout-en-bout.

## v2.206.0 (07/10/2020)

- [#1950](https://github.com/1024pix/pix/pull/1950) [FEATURE] Amélioration des choix d'épreuves (PIX-1345).
- [#1976](https://github.com/1024pix/pix/pull/1976) [BUGFIX] Réparation du bouton de téléchargement de pv de session (PIX-1382)
- [#1968](https://github.com/1024pix/pix/pull/1968) [BUGFIX] Ajout d'un await sur la creation de snapshots KE lors du partage de participation
- [#1958](https://github.com/1024pix/pix/pull/1958) [TECH] Rendre les analytics activable via variable d'environnement (PIX-1361)
- [#1948](https://github.com/1024pix/pix/pull/1948) [TECH] Renommer les routes api/jury en api/admin

## v2.205.0 (06/10/2020)

- [#1961](https://github.com/1024pix/pix/pull/1961) [FEATURE] Affichage du détail d'un profil cible dans Pix Admin (PIX-1349).
- [#1956](https://github.com/1024pix/pix/pull/1956) [FEATURE] Masquer les acquis dans l'export CSV d'une organisation SCO (PIX-1104)
- [#1917](https://github.com/1024pix/pix/pull/1917) [FEATURE] Affichage de l'aide pour la saisie de l'identifiant externe (PIX-1295).
- [#1933](https://github.com/1024pix/pix/pull/1933) [FEATURE] Afficher les informations de crédit d'une organisation (PIX-1287)
- [#1935](https://github.com/1024pix/pix/pull/1935) [FEATURE]  Import d'une liste de candidats à une session avec le nouveau modèle (PIX-1336)
- [#1936](https://github.com/1024pix/pix/pull/1936) [FEATURE] Ajout du bouton de téléchargement du PV de session dans le header (PIX-985)
- [#1860](https://github.com/1024pix/pix/pull/1860) [FEATURE] Générer les tests de certif à partir des acquis validés directs (et plus des épreuves bien répondues) (PIX-968)
- [#1959](https://github.com/1024pix/pix/pull/1959) [BUGFIX] Permettre à un nouveau utilisateur connecté depuis le GAR et déjà réconcilié avec un compte avec un mot de passe expiré de rejoindre une campagne (PIX-1321).
- [#1962](https://github.com/1024pix/pix/pull/1962) [BUGFIX] Permettre à la CI de détecter les erreurs de tests. 
- [#1957](https://github.com/1024pix/pix/pull/1957) [BUGFIX] Remettre la pagination à zéro sur la page équipe de Pix Orga (PIX-1281).
- [#1951](https://github.com/1024pix/pix/pull/1951) [BUGFIX] Déplacement d'acquis mal pris en compte dans l'export CSV des campagnes d'évaluation et dans le calcul du résultat individuel (PIX-1346)
- [#1954](https://github.com/1024pix/pix/pull/1954) [TECH] Passage de Cypress à la dernière version (4.6 => 5.3).
- [#1942](https://github.com/1024pix/pix/pull/1942) [TECH] Linter les templates de pix-orga dans la CI.
- [#1952](https://github.com/1024pix/pix/pull/1952) [DOC] Ajout d'une ADR pour le choix d'une solution pour générer du PDF
- [#1941](https://github.com/1024pix/pix/pull/1941) [BSR] Factorisation de la fonction du Server FailAction dans API (PIX-1343).
- [#1895](https://github.com/1024pix/pix/pull/1895) [DOC] Mise à jour du workflow de connexion GAR.

## v2.204.0 (02/10/2020)

- [#1930](https://github.com/1024pix/pix/pull/1930) [FEATURE] Ajout d'un email pour l'envoie des résultats au(x) prescripteur(s) (PIX-974)
- [#1922](https://github.com/1024pix/pix/pull/1922) [FEATURE] Réconcilier un utilisateur venant du GAR dans une nouvelle organisation (PIX-1244).
- [#1923](https://github.com/1024pix/pix/pull/1923) [FEATURE] Affichage de la liste filtrée et paginée des profils cibles dans Pix Admin (PIX-1322).
- [#1945](https://github.com/1024pix/pix/pull/1945) [TECH] Permet de récupérer les éléments dom par une sous chaîne avec la méthode contains.
- [#1946](https://github.com/1024pix/pix/pull/1946) [TECH] Utiliser une version stable de la dépendance jwt-decode.
- [#1939](https://github.com/1024pix/pix/pull/1939) [TECH] Suppression de JQuery dans pix-app
- [#1924](https://github.com/1024pix/pix/pull/1924) [TECH] Utilisation du modèle TargetProfileWithLearningContent dans le calcul des résultats collectifs
- [#1893](https://github.com/1024pix/pix/pull/1893) [CLEANUP] Interdire les textes non traduits dans les templates de pix app

## v2.203.0 (30/09/2020)

- [#1937](https://github.com/1024pix/pix/pull/1937) [FEATURE] Permettre de modifier la gestion d'élèves d'une organisation depuis Pix Admin (PIX-1340).
- [#1938](https://github.com/1024pix/pix/pull/1938) [FEATURE] Suppression du picto dans la modal d'information de connexion du formulaire de réconciliation (PIX-1337).
- [#1932](https://github.com/1024pix/pix/pull/1932) [FEATURE] Permettre de réinviter un membre d'une organisation désactivé (PIX-813).
- [#1914](https://github.com/1024pix/pix/pull/1914) [FEATURE] Rendre la navigation de Pix App accessible (PIX-1131).
- [#1915](https://github.com/1024pix/pix/pull/1915) [FEATURE] Apporter du détail sur l'erreur lors de l'import ODS (PIX-1312)
- [#1921](https://github.com/1024pix/pix/pull/1921) [BUGFIX] La colonne updatedAt de la table schooling-registrations n'est pas mise à jour (PIX-1315)
- [#1897](https://github.com/1024pix/pix/pull/1897) [TECH] Suppression de directives .editorconfig inutiles.
- [#1928](https://github.com/1024pix/pix/pull/1928) [TECH] Permettre aux nouveaux dossiers front d'être lintés par défaut.
- [#1925](https://github.com/1024pix/pix/pull/1925) [TECH] Suppression d'un appel à la base de donnée dans un test unitaire de usecase.
- [#1920](https://github.com/1024pix/pix/pull/1920) [TECH] Sortir de la CI dès qu'une erreur de catégorie de lint est rencontrée.
- [#1910](https://github.com/1024pix/pix/pull/1910) [TECH] Utilisation du modèle TargetProfileWithLearningContent dans le usecase d'export CSV de campagnes d'évaluation (PIX-1301-2)
- [#1919](https://github.com/1024pix/pix/pull/1919) [TECH] Permettre aux nouveaux dossiers sous API d'être lintés par défaut.
- [#1929](https://github.com/1024pix/pix/pull/1929) [CLEANUP] Mise à jour de la couleur verte dans Pix App et Pix Orga (PIX-1335).
- [#1931](https://github.com/1024pix/pix/pull/1931) [FEATURE ] Ajout du statut CléA au fichier avant jury (PIX-1327)
- [#1927](https://github.com/1024pix/pix/pull/1927) [INFRA] Ne pas autoriser les appels à la base de donnée pour les tests unitaires dans la cible `test` de l'API
- [#1918](https://github.com/1024pix/pix/pull/1918)  [FEATURE] Gestion des messages d'erreurs envoyés dans le formulaire d'inscription Mon-pix (PIX-1274)

## v2.202.0 (28/09/2020)

- [#1913](https://github.com/1024pix/pix/pull/1913) [FEATURE] Utiliser PixActionButton de pix-ui
- [#1903](https://github.com/1024pix/pix/pull/1903) [FEATURE] Génération de fichier PDF (PIX-831)
- [#1892](https://github.com/1024pix/pix/pull/1892) [FEATURE] Ajouter la certif CléA sur pix admin (PIX-656)
- [#1891](https://github.com/1024pix/pix/pull/1891) [FEATURE] Ajout d'une couleur pour le status de la certification Cléa (PIX-657)
- [#1894](https://github.com/1024pix/pix/pull/1894) [FEATURE] Changer le nom de l'utilisateur par le nom du candidat en test de certif (PIX-526)
- [#1916](https://github.com/1024pix/pix/pull/1916) [FEATURE] Révision de la bannière d'import du SCO (PIX-1313).
- [#1877](https://github.com/1024pix/pix/pull/1877) [FEATURE] Ajouter un footer sur Pix App (PIX-1156).
- [#1906](https://github.com/1024pix/pix/pull/1906) [FEATURE] Demander à un étudiant de saisir toutes ses informations lors de l'accès à une campagne (PIX-1276).
- [#1767](https://github.com/1024pix/pix/pull/1767) [TECH] Monter les versions des packages de l'API.
- [#1901](https://github.com/1024pix/pix/pull/1901) [TECH] Création d'un modèle TargetProfileWithLearningContent (PIX-1301-1)
- [#1904](https://github.com/1024pix/pix/pull/1904)  [FEATURE] Ajout des informations dynamiques dans le PDF de l'attestation de certification (PIX-1238)

## v2.201.0 (25/09/2020)

- [#1912](https://github.com/1024pix/pix/pull/1912) [FEATURE] Amélioration de l'accessibilité des pages campagne (PIX-1181).
- [#1909](https://github.com/1024pix/pix/pull/1909) [FEATURE] Déconnecter l'utilisateur s'il veut se connecter depuis le GAR (PIX-1291).
- [#1907](https://github.com/1024pix/pix/pull/1907) [TECH] Remplacer les bidouilles mises dans les transform() des JSONAPI serializers par la mise en place de la config nullIfMissing dans les attributs sérialisés (PIX-1304)

## v2.200.0 (23/09/2020)

- [#1908](https://github.com/1024pix/pix/pull/1908) [FEATURE] Ajouter un feature flipping sur le boutton de dissociation des élèves SCO dans PixOrga (PIX-1303)
- [#1905](https://github.com/1024pix/pix/pull/1905) [BUGFIX] Ne plus afficher le message d'erreur précédent si l'utilisateur possède un compte Pix (PIX-1246) 
- [#1656](https://github.com/1024pix/pix/pull/1656) [TECH] Amélioration des perfs autour de l'export CSV pour les campagnes d'évaluation (PIX-989)
- [#1867](https://github.com/1024pix/pix/pull/1867) [TECH] Montée de version d'Ember pour Pix Certif de la 3.18 à 3.21 (PIX-1302)
- [#1900](https://github.com/1024pix/pix/pull/1900) [TECH] Petite optimisation de code pour récupérer la date du KE le plus récent (PIX-1300)

## v2.199.0 (22/09/2020)

- [#1896](https://github.com/1024pix/pix/pull/1896) [BUGFIX] Gérer l'erreur date de naissance obligatoire lors de l'import des élèves d'une organisation SUP (PIX-1257).
- [#1888](https://github.com/1024pix/pix/pull/1888) [BUGFIX] Crash lorsqu'on consulte les résultats de campagne d'un participant qui ne s'est pas positionné sur toutes les compétences (PIX-1282)
- [#1828](https://github.com/1024pix/pix/pull/1828) [TECH] Réorganiser les routes et les composants de Pix Orga.
- [#1885](https://github.com/1024pix/pix/pull/1885) [TECH] Ajouter le dot reporter aux scripts de tests pour Pix Orga, Pix Certif et Pix Admin.
- [#1849](https://github.com/1024pix/pix/pull/1849) [TECH] Conversion de tests unitaires de repositories en tests d'intégration (PIX-1236)

## v2.198.0 (18/09/2020)

- [#1886](https://github.com/1024pix/pix/pull/1886) [FEATURE] Permettre la modification de l'accès ou non à la fonctionnalité de collecte de profils depuis Pix Admin (PIX-1288).
- [#1883](https://github.com/1024pix/pix/pull/1883) [FEATURE] JNVP qu'un élève arrivant depuis le GAR puisse lier son compte GAR à un compte Pix d'un autre élève que celui déjà réconcilié (PIX-1268).
- [#1887](https://github.com/1024pix/pix/pull/1887) [FEATURE] Gérer l'invalidation du jeton d'identification d'un utilisateur externe (PIX-1252).
- [#1862](https://github.com/1024pix/pix/pull/1862) [FEATURE] Ajout d'un bouton pour télécharger l'attestation du certificat Pix (PIX-809)
- [#1857](https://github.com/1024pix/pix/pull/1857) [FEATURE] Modifier le numéro d'un étudiant dans Pix Orga (PIX-1058).
- [#1873](https://github.com/1024pix/pix/pull/1873) [BUGFIX] Optimisations visuelles de la page de fin de campagne (PIX-1247).
- [#1884](https://github.com/1024pix/pix/pull/1884) [BUGFIX] Renommer l'argument pour la traduction pages.profile-already-shared.explanation (PIX-1285).

## v2.197.0 (16/09/2020)

- [#1881](https://github.com/1024pix/pix/pull/1881) [FEATURE] Changement d'une phrase lors de l'envoi des résultats (PIX-1279)
- [#1882](https://github.com/1024pix/pix/pull/1882) [BUGFIX] Décoder correctement un jeton d'identification contenant des caractères accentués pour un élève provenant du GAR (PIX-1269).

## v2.196.0 (15/09/2020)

- [#1871](https://github.com/1024pix/pix/pull/1871) [FEATURE] Redisposer les boutons "c'est parti" et "modifier numéro étudiant"
- [#1879](https://github.com/1024pix/pix/pull/1879) [FEATURE] Afficher le nom et prénom des inscriptions à la place des noms et prénoms des utilisateurs dans le CSV de campagne d'évaluation (PIX-1112).
- [#1826](https://github.com/1024pix/pix/pull/1826) [FEATURE] Affichage des informations de la personne inscrite au lieu des informations du compte utilisateur dans les écrans de Pix Orga des campagnes d'évaluation (PIX-1110).
- [#1880](https://github.com/1024pix/pix/pull/1880) [BUGFIX] Mettre à jour le rôle d'un membre d'une équipe depuis Pix-Orga (pix-1278)
- [#1865](https://github.com/1024pix/pix/pull/1865) [BUGFIX] Ne pas tenter de créer un utilisateur dont le samlId existe déjà en base (PIX-1251).
- [#1878](https://github.com/1024pix/pix/pull/1878) [CLEANUP] Ajout du linter pour vérifier les alt sur les images.

## v2.195.0 (14/09/2020)

- [#1874](https://github.com/1024pix/pix/pull/1874) [FEATURE] Cacher les liens de connexion et d'inscription pour les élèves venant du GAR (PIX-1249).
- [#1858](https://github.com/1024pix/pix/pull/1858) [BUGFIX] Corriger l'affichage du menu de déconnexion et de changement d'organisation dans Pix Orga (PIX-1219).
- [#1876](https://github.com/1024pix/pix/pull/1876) [BUGFIX] Ajout d'une validation JOI sur la longueur des inputs firstName, lastName, email et password d'un utilisateur sur le formulaire d'inscription Pix-app (PIX-1253).
- [#1861](https://github.com/1024pix/pix/pull/1861) [BUGFIX] Ordre d'affichage des blocs sur le certificat (PIX-1250)
- [#1863](https://github.com/1024pix/pix/pull/1863) [TECH] Enlever le toggle sur le partage du code de vérification (PIX-1254)

## v2.194.0 (14/09/2020)

- [#1841](https://github.com/1024pix/pix/pull/1841) [FEATURE] Ajouter la méthode d'authentification GAR à l'utilisateur qui vient de se connecter à Mon-Pix (PIX-1095).
- [#1832](https://github.com/1024pix/pix/pull/1832) [FEATURE] Associer le nouveau samlId de l'élève au compte GAR existant lors de la réconciliation (PIX-1038).
- [#1870](https://github.com/1024pix/pix/pull/1870) [FEATURE] Mise à jour des textes en anglais. 
- [#1855](https://github.com/1024pix/pix/pull/1855) [FEATURE] Amélioration de l'accessibilité de la bannière de reprise de campagne (PIX-1130).
- [#1806](https://github.com/1024pix/pix/pull/1806) [FEATURE] Nouvelles traductions pour la version EN.
- [#1868](https://github.com/1024pix/pix/pull/1868) [TECH] Ajout d'une méthode dans les airtableBuilder pour construire un objet Airtable à partir d'un objet du domain (PIX-1259)
- [#1866](https://github.com/1024pix/pix/pull/1866) [TECH] Ajout d'une règle de lint pour les trailing comma sur les déclarations multilignes (PIX-1256)
- [#1790](https://github.com/1024pix/pix/pull/1790) [TECH] test && commit || revert
- [#1875](https://github.com/1024pix/pix/pull/1875) [INFRA] Ajoute un stub manquant dans un test unitaire (PIX-1224)
- [#1854](https://github.com/1024pix/pix/pull/1854) Update en.json

## v2.193.0 (09/09/2020)

- [#1853](https://github.com/1024pix/pix/pull/1853) [FEATURE]Modifier les liens des documentations sco dans Pix Orga
- [#1859](https://github.com/1024pix/pix/pull/1859) [BUGFIX] Mise à jour de la définition des erreurs S5x et S6x dans l'API et Mon-Pix (PIX-1248).
- [#1852](https://github.com/1024pix/pix/pull/1852) [BUGFIX] Saisie de l'UAI insensible à la casse sur le formulaire d'activation des espaces PixOrga (PIX-1239)

## v2.192.0 (08/09/2020)

- [#1834](https://github.com/1024pix/pix/pull/1834) [FEATURE] Ameliorer l'affichage du certificat sur mobile et tablette [PIX-1184]
- [#1843](https://github.com/1024pix/pix/pull/1843) [FEATURE] Ajouter un titre de section pour les badges (PIX-1205).
- [#1821](https://github.com/1024pix/pix/pull/1821) [FEATURE] Mise à jour des messages d'erreurs R31, R32 et S63 dans Mon-Pix (PIX-1159).
- [#1839](https://github.com/1024pix/pix/pull/1839) [FEATURE] Ajout d'une erreur lors de tentative d'accès à un certificat partageable via url (PIX-1192)
- [#1850](https://github.com/1024pix/pix/pull/1850) [BUGFIX] Parsing de date avec une année sur 2 digits pour l'import CSV SUP
- [#1840](https://github.com/1024pix/pix/pull/1840) [BUGFIX] Input du formulaire de vérification de certification cassé sous IE (PIX-1186)
- [#1851](https://github.com/1024pix/pix/pull/1851) [TECH] Réparation de tests autos flaky liés à la violation de contrainte d'unicité de la key d'un badge (PIX-1243)
- [#1825](https://github.com/1024pix/pix/pull/1825) [TECH] Rajouter les sourcemap sur les front-end en production.
- [#1844](https://github.com/1024pix/pix/pull/1844) [TECH] Enable experimental decorators for vscode in sample config
- [#1831](https://github.com/1024pix/pix/pull/1831) [TECH] Suppression des imports par défault de lodash dans pix-app
- [#1848](https://github.com/1024pix/pix/pull/1848) [CLEANUP] Petit désendettement d'Assessment (PIX-1235)
- [#1846](https://github.com/1024pix/pix/pull/1846) [CLEANUP] Mettre l'affichage du loading directement dans resume (PIX-1127).

## v2.191.0 (07/09/2020)

- [#1845](https://github.com/1024pix/pix/pull/1845) [FEATURE] Amélioration de l'accessibilité de la page profil (PIX-1129).
- [#1842](https://github.com/1024pix/pix/pull/1842) [FEATURE] Gérer différents types d'encodage pour l'import du CSV d'étudiant (PIX-1133)
- [#1814](https://github.com/1024pix/pix/pull/1814) [FEATURE] Ajoute des détails sur les erreurs lors de l'import des étudiants (PIX-1086)
- [#1836](https://github.com/1024pix/pix/pull/1836) [FEATURE] Amélioration de l'accessibilité des pages login/signup (PIX-1180).
- [#1838](https://github.com/1024pix/pix/pull/1838) [FEATURE] Changer le logo de la marianne (PIX-1204)
- [#1847](https://github.com/1024pix/pix/pull/1847) [BUGFIX] Interdire les caractères spéciaux pour le numéro étudiant lors de l'import CSV des étudiants (PIX-1226).

## v2.190.0 (04/09/2020)

- [#1820](https://github.com/1024pix/pix/pull/1820) [FEATURE] Générer les codes de certification à la volée [PIX-1106]
- [#1835](https://github.com/1024pix/pix/pull/1835) [BUGFIX] Je dois pouvoir lancer mon parcours après m'être inscrit depuis la double mire SCO (PIX-1222)
- [#1822](https://github.com/1024pix/pix/pull/1822) [BUGFIX] Ne pas afficher la page /profil suite à l'authentification d'un élève provenant du GAR (PIX-1217).
- [#1827](https://github.com/1024pix/pix/pull/1827) [CLEANUP] Renommer le Label et la Github action pour l'auto-merge.

## v2.189.1 (02/09/2020)

- [#1829](https://github.com/1024pix/pix/pull/1829) [BUGFIX] Nombre de caractères pour le code campagne KO [PIX-1220]

## v2.189.0 (02/09/2020)

- [#1824](https://github.com/1024pix/pix/pull/1824) [FEATURE] Mise à jour des messages contenus dans la modale Dissocier un élève, dans Pix Orga (PIX-1155).
- [#1818](https://github.com/1024pix/pix/pull/1818) [FEATURE] Amélioration de l'accessibilité de la page épreuve (PIX-1152).
- [#1819](https://github.com/1024pix/pix/pull/1819) [FEATURE] Eviter d'induire en erreur nos utilisateurs en affichant des boutons qui ne permettront pas de poursuivre leur parcours (PIX-1164).
- [#1803](https://github.com/1024pix/pix/pull/1803) [FEATURE] Créer le compte utilisateur d'un élève provenant du GAR à la réconciliation (PIX-1119).
- [#1815](https://github.com/1024pix/pix/pull/1815) [FEATURE] Affichage certificat partageable [PIX-787]
- [#1813](https://github.com/1024pix/pix/pull/1813) [FEATURE] Design de la page de vérification du certificat [PIX-1167]
- [#1809](https://github.com/1024pix/pix/pull/1809) [FEATURE] Affichage plus alertant et plus informatif des bannières SCO de Pix Orga.
- [#1810](https://github.com/1024pix/pix/pull/1810) [FEATURE] Autoriser le format de date DD/MM/YY dans le fichier d'import des étudiants du SUP (Pix-1134).
- [#1823](https://github.com/1024pix/pix/pull/1823) [BUGFIX] Permettre à tous les utilisateurs d'accéder au menu de déconnexion (PIX-1163). 
- [#1816](https://github.com/1024pix/pix/pull/1816) [BUGFIX] Scroll automatique sur le formulaire de signalement (PIX-1174)
- [#1812](https://github.com/1024pix/pix/pull/1812) [BUGFIX] L'import d'étudiants via CSV annule la réconciliation si elle existe (PIX-1087)
- [#1811](https://github.com/1024pix/pix/pull/1811) [BUGFIX] Ajouter une validation JOI pour l'identifiant de l'invitation afin de ne pas générer une erreur 500. (PIX-1177)
- [#1817](https://github.com/1024pix/pix/pull/1817) [TECH] Remplacement de tests unitaires de repositories par des tests d'intégration (PIX-1179)
- [#1740](https://github.com/1024pix/pix/pull/1740) [TECH] Ajouter un linter scss à Pix App.
- [#1795](https://github.com/1024pix/pix/pull/1795) Ajouter le numéro étudiant du participant dans les exports CSV de campagne d'évaluation (PIX-1090).

## v2.188.0 (28/08/2020)

- [#1802](https://github.com/1024pix/pix/pull/1802) [FEATURE] En tant qu'étudiant, je veux pouvoir m'auto-inscrire sans numéro étudiant pour accéder à une campagne SUP (PIX-1063).
- [#1791](https://github.com/1024pix/pix/pull/1791) [FEATURE] Ajout du code de vérification dans le certificat (PIX-437)
- [#1798](https://github.com/1024pix/pix/pull/1798) [FEATURE] Remonter le champ affiché à l'utilisateur comme nom de catégorie (PIX-1161).
- [#1784](https://github.com/1024pix/pix/pull/1784) [FEATURE] Déplacer le formulaire de vérification de score sur app (PIX-1109)
- [#1793](https://github.com/1024pix/pix/pull/1793) [FEATURE] Remplir et désactiver les champs nom et prénom de l'utilisateur connecté via le GAR lors de la réconciliation (PIX-1118).
- [#1786](https://github.com/1024pix/pix/pull/1786) [FEATURE] Enlever le PixScore du VerificationCode (PIX-1148)
- [#1808](https://github.com/1024pix/pix/pull/1808) [BUGFIX] Améliorations de design des pages de connexion et de récupération d'espace de Pix Orga (PIX-1116).
- [#1807](https://github.com/1024pix/pix/pull/1807) [BUGFIX] Affichage des étoiles lorsque le texte du palier est trop long (PIX-1165).
- [#1782](https://github.com/1024pix/pix/pull/1782) [TECH] Refacto autour de l'usage de assessmentRepository.get() (PIX-1138)
- [#1804](https://github.com/1024pix/pix/pull/1804) [TECH] Eviter de lever des faux erreurs 500 quand les erreurs du domaines ne sont pas associées à des erreurs HTTP.
- [#1805](https://github.com/1024pix/pix/pull/1805) [A11Y] Afficher une instruction alternative (PIX-1151)

## v2.187.0 (25/08/2020)

- [#1801](https://github.com/1024pix/pix/pull/1801) [FEATURE] Affiche un bandeau indiquant de réaliser les campagnes de pré-rentrée (PIX-1115).
- [#1787](https://github.com/1024pix/pix/pull/1787) [FEATURE] Activer l'ajout d'un moyen de connexion dans tous les cas (PIX-1141).
- [#1799](https://github.com/1024pix/pix/pull/1799) [FEATURE] Ajout d'un script pour créer en masse les campagnes de rentrée du SCO (PIX-1083).
- [#1792](https://github.com/1024pix/pix/pull/1792) [FEATURE] Afficher l'image du palier pour les profils cibles associés (PIX-1053). 
- [#1794](https://github.com/1024pix/pix/pull/1794) [FEATURE] Afficher une bannière invitant les membres d'une organisation SCO à importer des élèves si ce n'est pas fait après une certaine date (PIX-1085)
- [#1797](https://github.com/1024pix/pix/pull/1797) [BUGFIX] Supprimer la validation syntaxique des UAIs lors d'une demande administration SCO (PIX-1162)
- [#1800](https://github.com/1024pix/pix/pull/1800) [CLEANUP] Oubli d'un console.log dans le prescriberRepository

## v2.186.0 (24/08/2020)

- [#1777](https://github.com/1024pix/pix/pull/1777) [FEATURE] Autoriser l'auto-inscription si la réconciliation ne se fait pas avec un numéro étudiant (PIX-1062)
- [#1779](https://github.com/1024pix/pix/pull/1779) [FEATURE] Renvoyer un token contenant les informations permettant de créer l'utilisateur lors d'une requête provenant du GAR (PIX-1117).
- [#1788](https://github.com/1024pix/pix/pull/1788) [FEATURE] Ne pas afficher le lien de récupération sur la page d'acceptation d'une invitation (PIX-1149).
- [#1752](https://github.com/1024pix/pix/pull/1752) [FEATURE] Récupération des données API via le code de vérification (PIX-773)
- [#1771](https://github.com/1024pix/pix/pull/1771) [FEATURE] Empêcher un élève de se réconcilier lors de l'inscription qu'il ait un compte utilisateur au sein du même établissement ou ailleurs (PIX-986).
- [#1789](https://github.com/1024pix/pix/pull/1789) [TECH] Muscler les tests sur la sélection des épreuves de certification
- [#1773](https://github.com/1024pix/pix/pull/1773) [DOC] Ajouter méthode de connexion avec fournisseur d'identité externe.

## v2.185.0 (20/08/2020)

- [#1785](https://github.com/1024pix/pix/pull/1785) [FEATURE] Donner accès à la récupération d'une organisation (PIX-884).
- [#1769](https://github.com/1024pix/pix/pull/1769) [FEATURE] Afficher les erreurs relatives aux comptes multiples dans une modal lors de la réconciliation (PIX-1023).
- [#1772](https://github.com/1024pix/pix/pull/1772) [FEATURE] Afficher les paliers avec le design final (PIX-1052).
- [#1783](https://github.com/1024pix/pix/pull/1783) [BUGFIX] Affichage de "started" au lieu d'"error" dans la liste de certifications sur Pix Admin
- [#1781](https://github.com/1024pix/pix/pull/1781) [BUGFIX] Empêcher de cliquer plusieurs fois sur retenter (PIX-1125).
- [#1775](https://github.com/1024pix/pix/pull/1775) [TECH] Suppression de divers index inutilisés et/ou redondants (PIX-1132)
- [#1776](https://github.com/1024pix/pix/pull/1776) [TECH] Assurer l'intégrité des données de réconciliation.

## v2.184.0 (18/08/2020)

- [#1750](https://github.com/1024pix/pix/pull/1750) [FEATURE] Permettre la création de centre de certification depuis Pix Admin (PIX-501).
- [#1721](https://github.com/1024pix/pix/pull/1721) [FEATURE] Générer le code de vérification du certificat (PIX-772)
- [#1766](https://github.com/1024pix/pix/pull/1766) [FEATURE] Afficher le palier atteint avec des étoiles (PIX-1051).
- [#1774](https://github.com/1024pix/pix/pull/1774) [BUGFIX] Restreindre le choix des épreuves de certifications aux épreuves franco-françaises (fr-fr) (Pix-1123)
- [#1778](https://github.com/1024pix/pix/pull/1778) [TECH] Montée de version de la BDD en 12.3.
- [#1768](https://github.com/1024pix/pix/pull/1768) [TECH] Utiliser les snapshots KE dans l'affichage de la liste des participants des campagnes de collecte de profiles (PIX-1068).

## v2.183.1 (13/08/2020)

- [#1770](https://github.com/1024pix/pix/pull/1770) [BUGFIX] Pouvoir valider une épreuve QCU sous IE (PIX-1120).

## v2.183.0 (12/08/2020)

- [#1731](https://github.com/1024pix/pix/pull/1731) [FEATURE] Réconcilier un étudiant avec son numéro étudiant pour les campagnes SUP (PIX-1061)
- [#1764](https://github.com/1024pix/pix/pull/1764) [FEATURE] Afficher le nom et prénom des inscriptions à la place des noms et prénoms des utilisateurs dans les écrans campagne de collecte de profils de Pix Orga (PIX-1088).
- [#1765](https://github.com/1024pix/pix/pull/1765) [FEATURE] Afficher le nom et prénom des inscriptions à la place des noms et prénoms des utilisateurs dans le CSV de collecte de profils (PIX-1089).
- [#1751](https://github.com/1024pix/pix/pull/1751) [FEATURE] Dans Pix Orga, générer un identifiant avec mot de passe temporaire pour les utilisateurs qui se connectent uniquement avec le GAR (PIX-1005).
- [#1763](https://github.com/1024pix/pix/pull/1763) [FEATURE] Afficher titres et descriptifs du palier atteint (PIX-1050).
- [#1748](https://github.com/1024pix/pix/pull/1748) [FEATURE] Traduire les noms et descriptions des tubes (PIX-794).
- [#1762](https://github.com/1024pix/pix/pull/1762) [BUGFIX] Renommage de `stagesCount` en `stageCount` sur l'application front.
- [#1761](https://github.com/1024pix/pix/pull/1761) [BUGFIX] Stabiliser le bouton de reload des embeds (PIX-1107).
- [#1749](https://github.com/1024pix/pix/pull/1749) [TECH] Utiliser les snapshots KE dans l'affichage de la liste des participants des campagnes d'évaluation (PIX-1066)
- [#1754](https://github.com/1024pix/pix/pull/1754) [TECH] Découpler l'`user-orga-settings` du modèle User.
- [#1694](https://github.com/1024pix/pix/pull/1694) [CLEANUP] Extraction sélection des épreuves de certification (PIX-992)

## v2.182.0 (10/08/2020)

- [#1759](https://github.com/1024pix/pix/pull/1759) [FEATURE] Afficher le nombre de paliers atteints et le nombre de paliers maximum (PIX-1049).
- [#1727](https://github.com/1024pix/pix/pull/1727) [FEATURE] Empêcher un élève de se réconcilier qu'il ait un compte utilisateur au sein du même établissement ou ailleurs (PIX-983).
- [#1747](https://github.com/1024pix/pix/pull/1747) [FEATURE] Traduire la compétence dans l'évaluation (PIX-1075).
- [#1738](https://github.com/1024pix/pix/pull/1738) [FEATURE] Rendre plus explicite le message d'erreur lors d'un échec de réconciliation dans la double mire (PIX-956).
- [#1745](https://github.com/1024pix/pix/pull/1745) [FEATURE] Traduction des indices sur la page correction (PIX-795).
- [#1744](https://github.com/1024pix/pix/pull/1744) [FEATURE] Traduction des informations de l'application (PIX-1098).
- [#1737](https://github.com/1024pix/pix/pull/1737) [FEATURE] Filtrer les épreuves dans la langues sélectionnée (PIX-793)
- [#1728](https://github.com/1024pix/pix/pull/1728) [FEATURE] Traduction restantes des pages de certifications (Pix-1047)
- [#1758](https://github.com/1024pix/pix/pull/1758) [BUGFIX] Supprimer les données lors de la déconnexion de Pix Certif (PIX-993).
- [#1753](https://github.com/1024pix/pix/pull/1753) [BUGFIX] Supprimer les données lors de la déconnexion de Pix Admin (PIX-994).
- [#1757](https://github.com/1024pix/pix/pull/1757) [BUGFIX] Correction de l'affichage du texte de réinitialisation des embed (PIX-1094)
- [#1756](https://github.com/1024pix/pix/pull/1756) [BUGFIX] Le script de Mimigration des snapshots KE essayait de générer des snapshots sur des participations ayant déjà un snapshot (PIX-1105)
- [#1755](https://github.com/1024pix/pix/pull/1755) [TECH] Supprimer le fichier lodash-custom (PIX-1099)
- [#1743](https://github.com/1024pix/pix/pull/1743) [TECH] Glimmerisation des épreuves (PIX-1021).
- [#1741](https://github.com/1024pix/pix/pull/1741) [TECH] Renommage du model student-dependent-users en schooling-registration-dependent-users.
- [#1760](https://github.com/1024pix/pix/pull/1760) [TECH] Ajout d'une règle de linter pour éviter d'importer Lodash complétement.
- [#1746](https://github.com/1024pix/pix/pull/1746) [TECH] Ne pas voir apparaître un log dans la console lors du lancement d'un test d'intégration.

## v2.181.0 (06/08/2020)

- [#1715](https://github.com/1024pix/pix/pull/1715) [FEATURE] Traduction de la page Epreuve (PIX-1046).
- [#1734](https://github.com/1024pix/pix/pull/1734) [FEATURE] Renommer la colonne 'Connecté avec' dans PixOrga > Elèves (PIX-1055).
- [#1736](https://github.com/1024pix/pix/pull/1736) [FEATURE] Ajout des paliers dans les profils cibles d'une campagne (PIX-1048).
- [#1733](https://github.com/1024pix/pix/pull/1733) [FEATURE] Rendre plus explicite le message d'erreur lors d'un échec de réconciliation (PIX-957).
- [#1732](https://github.com/1024pix/pix/pull/1732) [FEATURE] Modifier le script de remplissage des adresses e-mails des établissements SCO afin qu'il n'échoue pas lorsqu'une organisation n'est pas trouvée (PIX-1081).
- [#1722](https://github.com/1024pix/pix/pull/1722) [BUGFIX] Cacher la Warning Page quand la question est déjà répondue (PIX-1036).
- [#1725](https://github.com/1024pix/pix/pull/1725) [BUGFIX] Correction d'affichage de l'ampoule sur la page "Réponses et tutos" (PIX-1074)
- [#1742](https://github.com/1024pix/pix/pull/1742) [TECH] Réduction de la taille du bundle de pix-app
- [#1726](https://github.com/1024pix/pix/pull/1726) [TECH] Ecriture d'un script pour générer les snapshots KE pour des participations partagées (PIX-855)
- [#1711](https://github.com/1024pix/pix/pull/1711) [CLEANUP] Refacto la récupération des réponses sur les QROCM (PIX-650).
- [#1735](https://github.com/1024pix/pix/pull/1735) [CLEANUP] Ajout des colonnes de traduction Airtable manquantes (PIX-1082).
- [#1631](https://github.com/1024pix/pix/pull/1631) [DOC] ADR sur l'organisation des fichiers de traductions

## v2.180.0 (04/08/2020)

- [#1719](https://github.com/1024pix/pix/pull/1719) [FEATURE] Réconcilier automatiquement un élève s'il a déjà été réconcilié dans une autre organisation (PIX-962).
- [#1729](https://github.com/1024pix/pix/pull/1729) [FEATURE] Ajouter le texte légale sur le formulaire de demande d'administration d'organisation SCO (PIX-910).
- [#1724](https://github.com/1024pix/pix/pull/1724) [FEATURE] Afficher plus d'informations sur les tutoriels de l'analyse d'une campagne (PIX-1065).
- [#1705](https://github.com/1024pix/pix/pull/1705) [FEATURE] Filtrer les tutoriaux en fonction de la langue sélectionnée (PIX-792).
- [#1714](https://github.com/1024pix/pix/pull/1714) [BUGFIX] Correction d'affichage de PIX-ORGA sous IE11 (PIX-1029).
- [#1723](https://github.com/1024pix/pix/pull/1723) [BUGFIX] Conjuguer correctement le message d'erreur d'absence de saisie (PIX-1031).
- [#1720](https://github.com/1024pix/pix/pull/1720) [BUGFIX] Des lettres s'effacent toutes seules lorsqu'on écrit dans les champs de recherche sur PixAdmin (PIX-1070)
- [#1718](https://github.com/1024pix/pix/pull/1718) [BUGFIX] Correction du style de titre sur la page Panel (PIX-1037).
- [#1704](https://github.com/1024pix/pix/pull/1704) [TECH] Ajouter le linter de templates Ember sur Pix APP (PIX-1044).
- [#1717](https://github.com/1024pix/pix/pull/1717) [CLEANUP] Retrait de la route dépréciée pour récupérer la liste des participants à une campagne

## v2.179.0 (31/07/2020)

- [#1706](https://github.com/1024pix/pix/pull/1706) [FEATURE] Traduction des pages concernant la réinitialisation de mot de passe (PIX-790).
- [#1691](https://github.com/1024pix/pix/pull/1691) [FEATURE] Mise à jour des inscrits existants lors d'un ré-import (PIX-936)
- [#1679](https://github.com/1024pix/pix/pull/1679) [FEATURE] Créer un knowledge-elements snapshot quand l'utilisateur partage une campagne participation
- [#1703](https://github.com/1024pix/pix/pull/1703) [FEATURE] Traduction des pages et composants de loading (PIX-1042)
- [#1716](https://github.com/1024pix/pix/pull/1716) [BUGFIX] Envoyer les e-mails correspondant à la locale à laquelle ils ont été initié (PIX-1069).
- [#1713](https://github.com/1024pix/pix/pull/1713) [BUGFIX] Corriger l'affichage du 100% en page de résultat (PIX-1056).
- [#1710](https://github.com/1024pix/pix/pull/1710) [BUGFIX] La barre de progression dans Pix Orga n'a pas la bonne proportion (PIX-1033)
- [#1708](https://github.com/1024pix/pix/pull/1708) [BUGFIX] Réduire la taille des noms des compétences dans pix orga à 14px (PIX-1041)
- [#1712](https://github.com/1024pix/pix/pull/1712) [A11Y] Ajouter l'icône "Lien extérieur" sur les tutoriaux (PIX-1035)
- [#1707](https://github.com/1024pix/pix/pull/1707) [CLEANUP] Suppression de deux components non utilisés.
- [#1709](https://github.com/1024pix/pix/pull/1709) [CLEANUP] Résoudre le test non déterministe de `improvement-service`.

## v2.178.0 (29/07/2020)

- [#1702](https://github.com/1024pix/pix/pull/1702) [FEATURE] Traduire la page de profil déjà envoyé (PIX-1043)
- [#1700](https://github.com/1024pix/pix/pull/1700) [FEATURE] Préciser le message d'erreur quand l'épreuve est un QROC avec validation auto (PIX-1034).
- [#1701](https://github.com/1024pix/pix/pull/1701) [FEATURE] Traduire la page de campagne archivée (PIX-1000).
- [#1699](https://github.com/1024pix/pix/pull/1699) [FEATURE] Traduction de la page où l'on demande l'identifiant externe d'une campagne (PIX-806)
- [#1695](https://github.com/1024pix/pix/pull/1695) [FEATURE] Traduire la landing page des campagnes (pix-807)
- [#1692](https://github.com/1024pix/pix/pull/1692) [FEATURE] Traduction de la page de résultat de campagne (pix-805)
- [#1662](https://github.com/1024pix/pix/pull/1662) [FEATURE] Traduire la page de résultat d'une compétence (PIX-801).
- [#1697](https://github.com/1024pix/pix/pull/1697) [FEATURE] Traduire la page de campagne non existante (PIX-1001)
- [#1690](https://github.com/1024pix/pix/pull/1690) [FEATURE] Traduction de la page didacticiel (PIX-802)
- [#1696](https://github.com/1024pix/pix/pull/1696) [FEATURE] Traduction de la page d'envoi de profil (pix-808)
- [#1674](https://github.com/1024pix/pix/pull/1674) [FEATURE] Traduction des signalements (PIX-966)
- [#1658](https://github.com/1024pix/pix/pull/1658) [FEATURE] Traduire la page de checkpoint / résultat d'une épreuve (PIX-783).
- [#1693](https://github.com/1024pix/pix/pull/1693) [CLEANUP] Remettre les titres de page dans les templates (PIX-1032)

## v2.177.0 (28/07/2020)

- [#1664](https://github.com/1024pix/pix/pull/1664) [FEATURE] Générer un identifiant avec mot de passe temporaire pour l'utilisateur qui se connecte uniquement avec le GAR (PIX-953).
- [#1686](https://github.com/1024pix/pix/pull/1686) [FEATURE]Ajout d'une traduction pour la page "j'ai un code" (PIX-803)
- [#1685](https://github.com/1024pix/pix/pull/1685) [BUGFIX] Réparer le dropdown de sélections des organisations (PIX-1022).
- [#1684](https://github.com/1024pix/pix/pull/1684) [BUGFIX] Ajouter un peu d'espace entre le nombre d'acquis et la barre d'évaluation dans Pix Orga (PIX-1018)
- [#1689](https://github.com/1024pix/pix/pull/1689) [TECH] Unifier l'affichage des compétences sur les différents tableau de pix-orga (pix-462)
- [#1619](https://github.com/1024pix/pix/pull/1619) [TECH] Formater les logs NGINX avec key=value
- [#1673](https://github.com/1024pix/pix/pull/1673) [CLEANUP] Faciliter le changement de langue.

## v2.176.0 (27/07/2020)

- [#1672](https://github.com/1024pix/pix/pull/1672) [FEATURE]  Traduction de la page de fin de certification (Pix-798)
- [#1666](https://github.com/1024pix/pix/pull/1666) [FEATURE] Permettre le téléchargement du modèle d'import des étudiants inscrits dans Pix Orga (PIX-935).
- [#1687](https://github.com/1024pix/pix/pull/1687) [BUGFIX] Problème d'affichage du lien des CGU lors de l'inscription (PIX-1028).
- [#1681](https://github.com/1024pix/pix/pull/1681) [BUGFIX] Corriger l'affichage du texte de bouton de validation des épreuves au format mobile (PIX-604)
- [#1678](https://github.com/1024pix/pix/pull/1678) [BUGFIX] Améliorer l'affichage du message d'erreur lors de la réconciliation d'un élève que l'on ne retrouve pas (PIX-1017)
- [#1680](https://github.com/1024pix/pix/pull/1680) [BUGFIX] Résoudre le flaky test de schooling-registrations
- [#1676](https://github.com/1024pix/pix/pull/1676) [BUGFIX] Harmonisation des boutons d'archivage et de modification d'une campagne (PIX-1016)
- [#1675](https://github.com/1024pix/pix/pull/1675) [TECH] Faire apparaître la notion de profil de positionnement (!= profil de certification)

## v2.175.1 (24/07/2020)

- [#1677](https://github.com/1024pix/pix/pull/1677) [BUGFIX] Fix une erreur d'utilisation du service `intl`

## v2.175.0 (24/07/2020)

- [#1663](https://github.com/1024pix/pix/pull/1663) [FEATURE] Traduction de la page Profil (PIX-800).
- [#1660](https://github.com/1024pix/pix/pull/1660) [FEATURE] Traduire la page des tutos (PIX-796).
- [#1638](https://github.com/1024pix/pix/pull/1638) [FEATURE] Permettre d'importer des inscriptions d'étudiants à une organisation SUP en utilisant un CSV (Pix-923).
- [#1646](https://github.com/1024pix/pix/pull/1646) [FEATURE] Réconcilier les élèves automatiquement lors de l'import du fichier SIECLE (PIX-920).
- [#1652](https://github.com/1024pix/pix/pull/1652) [FEATURE] certification avec des competences pix+ (PIX-964)
- [#1643](https://github.com/1024pix/pix/pull/1643) [FEATURE] Migration du lien "retour" sur Pix UI (PIX-960)
- [#1661](https://github.com/1024pix/pix/pull/1661) [FEATURE] Traduire la page "Oups" (PIX-791).
- [#1659](https://github.com/1024pix/pix/pull/1659) [FEATURE] Traduire la page d'une épreuve (PIX-782).
- [#1649](https://github.com/1024pix/pix/pull/1649) [FEATURE] Modification du style du détail des résultats d'un participant à une campagne d'évaluation (PIX-894).
- [#1667](https://github.com/1024pix/pix/pull/1667) [BUGFIX] Problème de taille du champ de sélection du type d'organisation (PIX-914).
- [#1671](https://github.com/1024pix/pix/pull/1671) [TECH] Octanification et Glimmerisation de Pix Orga (PIX-1011).
- [#1669](https://github.com/1024pix/pix/pull/1669) [TECH] Réduction de la taille du bundle de pix-orga
- [#1578](https://github.com/1024pix/pix/pull/1578) [TECH] Manage errors from api (JSONAPI)
- [#1670](https://github.com/1024pix/pix/pull/1670) [CLEANUP] Rétablit des assertions sur le résultat dans quelques tests
- [#1665](https://github.com/1024pix/pix/pull/1665) [INFRA] Ajoute une cible test:api:bail pour avoir du feedback plus rapidement
- [#1668](https://github.com/1024pix/pix/pull/1668) [CLEANUP] Corrige des tests unitaires qui appellent la base de données

## v2.174.0 (21/07/2020)

- [#1655](https://github.com/1024pix/pix/pull/1655) [FEATURE] Mise en place de la création et sauvegarde de Snapshot de knowledge-elements pour l'amélioration des performances de l'export CSV des collectes de profil (PIX-988)
- [#1640](https://github.com/1024pix/pix/pull/1640) [FEATURE] Récupérer les scorecards dans la bonne langue (PIX-665).
- [#1624](https://github.com/1024pix/pix/pull/1624) [FEATURE] Internationalisation du démarrage d'une certification (PIX-799) 
- [#1651](https://github.com/1024pix/pix/pull/1651) [BUGFIX] Affichage du tableau vide sur l'analyse individuelle et non levée d'une erreur (PIX-984).
- [#1653](https://github.com/1024pix/pix/pull/1653) [BUGFIX] Ne pas afficher le timer lorsque l'utilisateur revient sur une question timée (PIX-931)
- [#1648](https://github.com/1024pix/pix/pull/1648) [BUGFIX] Correction du changelog de la v2.173.0.
- [#1654](https://github.com/1024pix/pix/pull/1654) [TECH] Renommage du user-service en certification-profile-service
- [#1650](https://github.com/1024pix/pix/pull/1650) [CLEANUP] Intégrer le setup de l'i18n dans les tests d'integration (PIX-972).
- [#1647](https://github.com/1024pix/pix/pull/1647) [CLEANUP] Uniformisation des fichiers de traduction (PIX-971).

## v2.173.0 (17/07/2020)

- [#1618](https://github.com/1024pix/pix/pull/1618) [FEATURE] Internationalisation de "mes certifications" (PIX-797)
- [#1609](https://github.com/1024pix/pix/pull/1609) [FEATURE] Assurer à l'utilisateur auto-invité un rôle d'administrateur (PIX-845).
- [#1627](https://github.com/1024pix/pix/pull/1627) [FEATURE] Traduire la page détails de compétence (PIX-366).
- [#1633](https://github.com/1024pix/pix/pull/1633) [FEATURE] Afficher la liste des étudiants dans l'enseignement supérieur (PIX-933).
- [#1636](https://github.com/1024pix/pix/pull/1636) [FEATURE] Afficher une icone pour les liens dans les consignes des épreuves (PIX-932).
- [#1630](https://github.com/1024pix/pix/pull/1630) [FEATURE] Permettre d'envoyer une invitation pour rejoindre une organisation SCO en tant qu'administrateur (Pix-882)
- [#1635](https://github.com/1024pix/pix/pull/1635) [BUGFIX] Corriger l'erreur undefined lorsque l'on finit une épreuve contenant un embed
- [#1634](https://github.com/1024pix/pix/pull/1634) [BUGFIX] Corriger le titre et la barre de progression des previews (PIX-943).
- [#1637](https://github.com/1024pix/pix/pull/1637) [TECH] Création d'un script pour générer facilement et massivement des campagnes avec des participations pour test/dév (PIX-965)
- [#1603](https://github.com/1024pix/pix/pull/1603) [TECH] Configurer les fichiers robots.txt des applications Ember pour éviter l'indexation et le crawling par les moteurs de recherches.
- [#1645](https://github.com/1024pix/pix/pull/1645) [CLEANUP] Mettre des valeurs de base aux variables de reset/retry pour les tests.
- [#1641](https://github.com/1024pix/pix/pull/1641) [DOC] Ajout d'un retro-ADR pour expliquer le choix d'Ember
- [#1644](https://github.com/1024pix/pix/pull/1644) [DOC] Suppression de fautes d'orthographe.

## v2.172.0 (15/07/2020)

- [#1587](https://github.com/1024pix/pix/pull/1587) [FEATURE] Remonter les acquis/épreuves archivés lors d'une campagne ou certification (PIX-820)
- [#1628](https://github.com/1024pix/pix/pull/1628) [FEATURE] Ajout de la validation sans saisie de mot réponse pour les épreuves de type QROC autovalidées (PIX-958).
- [#1585](https://github.com/1024pix/pix/pull/1585) [FEATURE] Ne pas autoriser un utilisateur à retenter une compétence quand le niveau maximum de la compétence est atteint (PIX-898).
- [#1617](https://github.com/1024pix/pix/pull/1617) [FEATURE] Utilisation d'un nouveau template e-mail pour rejoindre une Organisation SCO (PIX-883).
- [#1607](https://github.com/1024pix/pix/pull/1607) [BUGFIX] Supprimer les données lors de la déconnexion de Pix-Orga (PIX-954).
- [#1632](https://github.com/1024pix/pix/pull/1632) [BUGFIX] Bannière "Votre profil n'est pas encore certifiable." KO (PIX-963)
- [#1616](https://github.com/1024pix/pix/pull/1616) [BUGFIX] Rendre des tests plus déterministes dans l'API (PIX-959).
- [#1626](https://github.com/1024pix/pix/pull/1626) [TECH] Montée de version de la librarie ember-intl 4.3.1 -> 5.3.1
- [#1590](https://github.com/1024pix/pix/pull/1590) [TECH] Décorréler l'utilisation de isManagingStudents du type d'organisation SCO (PIX-924).
- [#1591](https://github.com/1024pix/pix/pull/1591) [DESIGN SYSTEM] Ajouter PixBlock et PixBackgroundHeader dans Mon-Pix (PIX-921)

## v2.171.0 (08/07/2020)

- [#1621](https://github.com/1024pix/pix/pull/1621) [FEATURE] Ne pas afficher le champ "Réponse" sur la page de résultat pour les challenges QROC sans réponse(PIX-902).
- [#1597](https://github.com/1024pix/pix/pull/1597) [FEATURE] Cacher le champ de réponse si l’épreuve est un embed auto-validé (PIX-900)
- [#1612](https://github.com/1024pix/pix/pull/1612) [BUGFIX] Retour en arrière sur le correctif des liens téléchargeables (`target=_blank`)(PIX-835).
- [#1606](https://github.com/1024pix/pix/pull/1606) [BUGFIX] Fermer la bannière de félicitation pour rejoindre une session (PIX-488)
- [#1608](https://github.com/1024pix/pix/pull/1608) [BUGFIX] Corriger le formulaire d'anonymisation d'utilisateur de Pix Admin (PIX-944).
- [#1623](https://github.com/1024pix/pix/pull/1623) [TECH] Utiliser un token pix-service dédié à la Github Action Auto-merge
- [#1622](https://github.com/1024pix/pix/pull/1622) [TECH] Suppression du déclencheur status pour le workflow automerge
- [#1600](https://github.com/1024pix/pix/pull/1600) [TECH] Ajouter les colonnes SUP à la table schooling-registrations (PIX-925).
- [#1456](https://github.com/1024pix/pix/pull/1456) [TECH] Merge automatique grâce aux Github Actions
- [#1613](https://github.com/1024pix/pix/pull/1613) [TECH] Inclure toute la stack trace asynchrone dans les erreurs Knex
- [#1615](https://github.com/1024pix/pix/pull/1615) [TECH] Augmenter la taille des messages d'erreur dans Sentry
- [#1620](https://github.com/1024pix/pix/pull/1620) [ORGA] Mettre à jour le lien de la documentation pour les organisation de type SCO. (Pix-817)
- [#1611](https://github.com/1024pix/pix/pull/1611) [CLEANUP] Refacto admin save certification (PIX-946)
- [#1604](https://github.com/1024pix/pix/pull/1604) [CLEANUP] Montée de version des linters dans Pix Admin (PIX-926).
- [#1614](https://github.com/1024pix/pix/pull/1614) [CLEANUP] Requête SQL plus cohérente pour les détails d'une session (PIX-877)

## v2.170.0 (06/07/2020)

- [#1596](https://github.com/1024pix/pix/pull/1596) [FEATURE] Mettre à jour les conditions d'utilisation de Pix Orga en incluant le pix.org ( PIX-871 )
- [#1588](https://github.com/1024pix/pix/pull/1588) [FEATURE] Permettre l'édition de l'e-mail d'une organisation dans Pix Admin (PIX-880).
- [#1589](https://github.com/1024pix/pix/pull/1589) [FEATURE] Ajout de la colonne Réponse Automatique (PIX-899).
- [#1598](https://github.com/1024pix/pix/pull/1598) [BUGFIX] Modification des scores dans pixAdmin (PIX-917)
- [#1599](https://github.com/1024pix/pix/pull/1599) [BUGFIX] Il manque des certifs dans le détails d'une session (PIX-877)
- [#1602](https://github.com/1024pix/pix/pull/1602) [BUGFIX] Cache l'action dissocier le compte pour les membres d'une organisation (PIX-941).
- [#1586](https://github.com/1024pix/pix/pull/1586) [BUGFIX] Les certification sans cleaCompetenceMarks ne passent pas en completed (PIX-915)
- [#1594](https://github.com/1024pix/pix/pull/1594) [BUGFIX] Niveau certifié non affiché dans le détail d'une certification (PIX-930)
- [#1593](https://github.com/1024pix/pix/pull/1593) [BUGFIX] Recherche par certification id mort (PIX-922)
- [#1601](https://github.com/1024pix/pix/pull/1601) [TECH] Ajouter le linter pour assurer la glimmerization (PIX-927).
- [#1592](https://github.com/1024pix/pix/pull/1592) [TECH] Mettre à disposition des configurations d'IDE
- [#1595](https://github.com/1024pix/pix/pull/1595) [TECH] Empêcher la création d'appartenance à une organisation si le rôle n'est pas connu.

## v2.169.0 (01/07/2020)

- [#1555](https://github.com/1024pix/pix/pull/1555) [FEATURE] Permettre la désactivation d'un membre depuis Pix Admin (PIX-394).
- [#1580](https://github.com/1024pix/pix/pull/1580) [FEATURE] Savoir à quelle question on se trouve dans le titre de la page (PIX-906).
- [#1582](https://github.com/1024pix/pix/pull/1582) [FEATURE] Permettre l'envoi d'une invitation par une nouvelle page (1ère partie)(PIX-881).
- [#1581](https://github.com/1024pix/pix/pull/1581) [FEATURE] Retenter des acquis de compétence échoués au bout de 4 jours (PIX-758).
- [#1584](https://github.com/1024pix/pix/pull/1584) [FEATURE] Paramétrer l'attribut lang de Pix App (PIX-833).
- [#1577](https://github.com/1024pix/pix/pull/1577) [FEATURE] PART 3 - Nouveau design certificat (PIX-839)
- [#1561](https://github.com/1024pix/pix/pull/1561) [FEATURE] PART 2 - Nouveau design certificat (PIX-838)
- [#1560](https://github.com/1024pix/pix/pull/1560) [BUGFIX] Corrige la numérotation des épreuves de certif dans Pix Admin (PIX-869)
- [#1572](https://github.com/1024pix/pix/pull/1572) [BUGFIX] Correction de l'affichage du macaron Cléa sur la certif (PIX-879)
- [#1583](https://github.com/1024pix/pix/pull/1583) [BUGFIX] Le signalement surveillant était supprimé en enregistrant une certif (PIX-916)

## v2.168.0 (29/06/2020)

- [#1567](https://github.com/1024pix/pix/pull/1567) [FEATURE] Alimenter les adresses e-mail des organisations (PIX-874).
- [#1571](https://github.com/1024pix/pix/pull/1571) [FEATURE] Afficher l'email de l'organisation dans Pix Admin (PIX-844).
- [#1557](https://github.com/1024pix/pix/pull/1557) [FEATURE] Sauvegarder l'identifiant de l'administrateur qui a modifié le lien d'un utilisateur avec une organisation (PIX-859).
- [#1576](https://github.com/1024pix/pix/pull/1576) [BUGFIX] Afficher un message d'erreur dans Pix Orga lorsque l'e-mail d'invitation est incorrect (PIX-471).
- [#1570](https://github.com/1024pix/pix/pull/1570) [BUGFIX] Fix admin certification detail page
- [#1574](https://github.com/1024pix/pix/pull/1574) [BUGFIX] Retirer le message de contexte sur la double mire de Pix Orga (PIX-912).
- [#1562](https://github.com/1024pix/pix/pull/1562) [CLEANUP] Corriger les erreurs signalées dans Pix Admin par le linter (PIX-889).
- [#1575](https://github.com/1024pix/pix/pull/1575) [A11Y] Supprimer target='blank" des fichiers téléchargeables depuis les épreuves (PIX-835).
- [#1573](https://github.com/1024pix/pix/pull/1573) [INFRA] Permettre que les e-mails renvoient vers le bon environnement (PIX-888).

## v2.167.0 (26/06/2020)

- [#1568](https://github.com/1024pix/pix/pull/1568) [FEATURE] Cacher le bouton Retenter quand l'utilisateur a terminé une compétence avec le niveau max (PIX-759).
- [#1565](https://github.com/1024pix/pix/pull/1565) [FEATURE] Ajout d'un email de récupération pour les organisations (PIX-843).
- [#1538](https://github.com/1024pix/pix/pull/1538) [FEATURE] Modification dans le design des badges sur la page de résultat (PIX-778).
- [#1559](https://github.com/1024pix/pix/pull/1559) [FEATURE] Afficher le bouton retenter sur la carte de la competence (PIX-757).
- [#1556](https://github.com/1024pix/pix/pull/1556) [FEATURE] Permettre à un prescripteur d'obtenir un e-mail d'invitation en fonction de sa région (PIX-810).
- [#1551](https://github.com/1024pix/pix/pull/1551) [FEATURE] Ajout de la pagination sur le tableau des élèves (PIX-723)
- [#1566](https://github.com/1024pix/pix/pull/1566) [BUGFIX] Corriger le pourcentage de la barre de progression lorsque la compétence est retentée (PIX-841).
- [#1563](https://github.com/1024pix/pix/pull/1563) [BUGFIX] Rollback Ember lint compatibilité (PIX-890)
- [#1564](https://github.com/1024pix/pix/pull/1564) [BUGFIX] Vérifier qu'un membre désactivé n'accede pas aux routes de campagnes (PIX-857).
- [#1558](https://github.com/1024pix/pix/pull/1558) [BUGFIX] Rediriger le prescrit vers son parcours après inscription (PIX-886).
- [#1548](https://github.com/1024pix/pix/pull/1548) [BUGFIX] Bloquer les double-clics sur l'envoi de signalements (PIX-704).
- [#1528](https://github.com/1024pix/pix/pull/1528) [CLEANUP] Suppression du modèle CampaignAssessment et de son repository (PIX-897)
- [#1569](https://github.com/1024pix/pix/pull/1569) [CLEANUP] Accélère la manière de construire un CertificationProfile (PIX-896)
- [#1553](https://github.com/1024pix/pix/pull/1553) [ORGA] Remonter l'item documentation dans le menu. (PIX-461)
- [#1536](https://github.com/1024pix/pix/pull/1536)  [FEATURE] Afficher un message d'erreur approprié lors de la connexion à Pix App (PIX-367).
- [#1552](https://github.com/1024pix/pix/pull/1552) [CLEANUP] Corriger les erreurs signalées dans Pix Admin, par le linter dans app/templates/authenticated (PIX-878).

## v2.166.0 (23/06/2020)

- [#1509](https://github.com/1024pix/pix/pull/1509) [FEATURE] PART-1 : Nouveau visuel certificat (PIX-597)
- [#1545](https://github.com/1024pix/pix/pull/1545) [FEATURE] Ajouter un nouveau type de signalement (PIX-836).
- [#1537](https://github.com/1024pix/pix/pull/1537) [FEATURE] Filtrer les élèves par type de connexion dans pix-orga (PIX-722)
- [#1530](https://github.com/1024pix/pix/pull/1530) [BUGFIX] Éviter de reposer un challenge auquel on a déjà répondu (PIX-210).
- [#1549](https://github.com/1024pix/pix/pull/1549) [BUGFIX] Gérer les erreurs sur la page de changement de mot de passe (PIX-434).
- [#1554](https://github.com/1024pix/pix/pull/1554) [BUGFIX] Correction d'un test aléatoire sur les filtres des élèves
- [#1506](https://github.com/1024pix/pix/pull/1506) [TECH] Ajouter les configurations d'IDE pour faciliter le déboggage.
- [#1529](https://github.com/1024pix/pix/pull/1529) [CLEANUP] Retrait de l'attribut level (déprécié) du modèle AssessmentResult (PIX-863)
- [#1503](https://github.com/1024pix/pix/pull/1503) [CLEANUP] Renommer SmartPlacement en Campaign (PIX-830).

## v2.165.0 (22/06/2020)

- [#1547](https://github.com/1024pix/pix/pull/1547) [FEATURE] Ajout d'un retour utilisateur lors de la dissociation d'un élève (PIX-865)
- [#1516](https://github.com/1024pix/pix/pull/1516) [FEATURE] Permettre à l'utilisateur de rejoindre son parcours grâce à l'e-mail de création de compte (PIX-429).
- [#1546](https://github.com/1024pix/pix/pull/1546) [FEATURE] Amélioration des formulations lors de la réconciliation (PIX-816).
- [#1525](https://github.com/1024pix/pix/pull/1525) [FEATURE] Dissocier les comptes utilisateurs des élèves depuis Pix ORGA (Pix-718).
- [#1544](https://github.com/1024pix/pix/pull/1544) [BUGFIX] Permettre à un utilisateur connecté d'aller sur la page de changement de mot de passe (PIX-516).
- [#1539](https://github.com/1024pix/pix/pull/1539) [BUGFIX] Erreur lorsqu'on tente de modifier une certification sur PixAdmin (PIX-866)
- [#1543](https://github.com/1024pix/pix/pull/1543) [BUGFIX] Déconnecter un utilisateur qui n'a plus de membership dans Pix Orga (PIX-837).
- [#1540](https://github.com/1024pix/pix/pull/1540) [BUGFIX] Empêcher l'édition des informations d'un utilisateur connecté via le GAR depuis Pix Admin(PIX-861)
- [#1508](https://github.com/1024pix/pix/pull/1508) [TECH] Amélioration de la configuration de Bookshelf
- [#1531](https://github.com/1024pix/pix/pull/1531) [TECH] Montée de la BDD en version 12
- [#1541](https://github.com/1024pix/pix/pull/1541) [CLEANUP] Corriger les erreurs signalées dans Pix Admin, par le ember template linter (PIX-828).
- [#1519](https://github.com/1024pix/pix/pull/1519) [CLEANUP] Simplification et amélioration de l'accès aux campagnes (PIX-847)

## v2.164.0 (18/06/2020)

- [#1526](https://github.com/1024pix/pix/pull/1526) [FEATURE] Ajouter lien sur le tableau de bord d'un utilisateur (PIX-606).
- [#1535](https://github.com/1024pix/pix/pull/1535) [FEATURE] Filtrer les élèves par prénom dans pix-orga (PIX-721).
- [#1534](https://github.com/1024pix/pix/pull/1534) [FEATURE] Afficher l'url d'une campagne dans Pix Orga suivant l'extension sur laquelle on est (fr ou org) (PIX-826).
- [#1532](https://github.com/1024pix/pix/pull/1532) [FEATURE] Ajout d'une colonne de titre pour les badges (PIX-849).
- [#1524](https://github.com/1024pix/pix/pull/1524) [FEATURE] Permettre l'anonymisation d'un utilisateur depuis Pix Admin (PIX-729)
- [#1527](https://github.com/1024pix/pix/pull/1527) [FEATURE] Changement du système de pagination et filtrage des membres d'une organisation dans Pix Admin et Pix Orga (PIX-860).
- [#1520](https://github.com/1024pix/pix/pull/1520) [FEATURE] Filtrer les élèves par nom dans pix-orga (PIX-719).
- [#1513](https://github.com/1024pix/pix/pull/1513) [FEATURE] Afficher les competences avec score et niveau pour un participant (PIX-622)
- [#1521](https://github.com/1024pix/pix/pull/1521) [BUGFIX] Ne pas lever une erreur 500 lors de la recherche d'une session avec un identifiant trop grand.
- [#1533](https://github.com/1024pix/pix/pull/1533) [TECH] Supprimer les tests unitaires Ember redondants
- [#1523](https://github.com/1024pix/pix/pull/1523) [TECH] Assurer que la version de node installée est 12.18.x.
- [#1483](https://github.com/1024pix/pix/pull/1483) [DESIGN-SYSTEM] Ajout de la PixTooltip sur Pix Admin

## v2.163.0 (16/06/2020)

- [#1522](https://github.com/1024pix/pix/pull/1522) [BUGFIX] Mauvais affichage des notifications après la finalisation (PIX-848)
- [#1514](https://github.com/1024pix/pix/pull/1514) [TECH] Correction des tests e2e qui échouent aléatoirement sur la CI.
- [#1517](https://github.com/1024pix/pix/pull/1517) [TECH] Montée de version de Node (12.18.0) et NPM (6.14.4).
- [#1518](https://github.com/1024pix/pix/pull/1518) [TECH] Paralléliser les tests end-to-end sur la CI.
- [#1488](https://github.com/1024pix/pix/pull/1488) [DOC] Mise à jour des bonnes pratiques d'accessibilité
- [#1468](https://github.com/1024pix/pix/pull/1468) [CLEANUP] Ne plus sélectionner les assessment-results automatiquement lorsqu'on sélectionne un assessment depuis la BDD (PIX-775)

## v2.162.0 (15/06/2020)

- [#1445](https://github.com/1024pix/pix/pull/1445) [FEATURE] Afficher l'obtention de la certif cléa sur pix admin (PIX-630)
- [#1496](https://github.com/1024pix/pix/pull/1496) [FEATURE] Ajouter lien vers BI sur le détail d'une organisation (PIX-605).
- [#1507](https://github.com/1024pix/pix/pull/1507) [FEATURE] Ne plus afficher les membres désactivés dans PixOrga et PixAdmin (PIX-409).
- [#1504](https://github.com/1024pix/pix/pull/1504) [FEATURE] Permettre la mise à jour du prénom, nom et l'email d'un utilisateur connecté par email dans Pix Admin (PIX-458).
- [#1510](https://github.com/1024pix/pix/pull/1510) [FEATURE] Changer la source de stockage des images de badges (PIX-777)
- [#1512](https://github.com/1024pix/pix/pull/1512) [BUGFIX] Format de date invalide lors de la création d'un utilisateur SCO (PIX-834).

## v2.161.0 (12/06/2020)

- [#1511](https://github.com/1024pix/pix/pull/1511) [FEATURE] Empêcher la connexion à Pix Orga d'un utilisateur dont le membership a été désactivé (PIX-766).
- [#1497](https://github.com/1024pix/pix/pull/1497) [FEATURE] Ajout des info de certification dans le tableau des participants (PIX-619).
- [#1501](https://github.com/1024pix/pix/pull/1501) [FEATURE] Ajouter un système d'onglets dans le détail d'une organisation dans Pix Admin (PIX-827).
- [#1475](https://github.com/1024pix/pix/pull/1475) [FEATURE] Multi-badge sur une campagne (PIX-660).
- [#1484](https://github.com/1024pix/pix/pull/1484) [FEATURE] Création d'une composant graphique Modal (PIX-717).
- [#1481](https://github.com/1024pix/pix/pull/1481) [FEATURE] Retenter des acquis échoués depuis la page compétence (PIX-756).
- [#1489](https://github.com/1024pix/pix/pull/1489) [BUGFIX] Eviter le crash de container lorsqu'une analyse de campagne se déclenche (PIX-785)
- [#1499](https://github.com/1024pix/pix/pull/1499) [TECH] Suppression de la route dépréciée `/campaigns/id/csvResults` (PIX-832).
- [#1458](https://github.com/1024pix/pix/pull/1458) [TECH] Montée de version des apps Ember de 3.15 à 3.18
- [#1434](https://github.com/1024pix/pix/pull/1434) [TECH] Montée de version de Bookshelf
- [#1505](https://github.com/1024pix/pix/pull/1505) [TECH] Paralléliser les tests end-to-end sur la CI.
- [#1492](https://github.com/1024pix/pix/pull/1492) [TECH] Simplification de la création de badge en BDD (PIX-736).
- [#1486](https://github.com/1024pix/pix/pull/1486) Afficher les informations générales d'un profil partagé pendant une campagne (PIX-626).
- [#1495](https://github.com/1024pix/pix/pull/1495) [CLEANUP] Clarifier la log du script de création des centres de certification.

## v2.160.0 (09/06/2020)

- [#1491](https://github.com/1024pix/pix/pull/1491) [FEATURE] Mettre à jour le nom, identifiant externe et département d'une organisation dans Pix Admin (PIX-456).
- [#1476](https://github.com/1024pix/pix/pull/1476) [FEATURE] Modifier les attributs d'un user dans un contexte d'administration (PIX-734).
- [#1473](https://github.com/1024pix/pix/pull/1473) [FEATURE] Affichage du profil Pix sur la page de profil déjà envoyé (PIX-752)
- [#1474](https://github.com/1024pix/pix/pull/1474) [FEATURE] Ajout d'un composant dropdown dans Pix Orga (PIX-716).
- [#1494](https://github.com/1024pix/pix/pull/1494) [BUGFIX] Corrige une erreur 500 en 404 quand un test de démo n'est pas trouvé
- [#1493](https://github.com/1024pix/pix/pull/1493) [BUGFIX] La flèche de checkpoint doit s'afficher en plus grand (PIX-811).
- [#1490](https://github.com/1024pix/pix/pull/1490) [BUGFIX] Correction d'un test knex-utils aléatoire
- [#1477](https://github.com/1024pix/pix/pull/1477) [BUGFIX]  Amélioration de la validation du formulaire d'inscription dans Pix Orga (PIX-468).
- [#1470](https://github.com/1024pix/pix/pull/1470) [BUGFIX] Réduction de la largeur de certaines colonnes dans le tableau des membres (PIX-459).
- [#1464](https://github.com/1024pix/pix/pull/1464) [TECH] Utiliser un EventDispatcher pour passer les Domain Events aux Event Handlers
- [#1442](https://github.com/1024pix/pix/pull/1442) [TECH] Ecriture d'un script pour élaborer des statistiques sur la qualité des tests de certification (PIX-738)
- [#1485](https://github.com/1024pix/pix/pull/1485)  [FEATURE ] Obtenir la date de délivrance des certifications (PIX-164)
- [#1479](https://github.com/1024pix/pix/pull/1479) [INFRA] Ajouter les dernières variables d'environnement dans le fichier sample.env
- [#1482](https://github.com/1024pix/pix/pull/1482) [CLEANUP] Correction du changelog après une mauvaise manip qui a provoqué la duplication d'une entrée (PIX-774)

## v2.159.0 (03/06/2020)

- [#1465](https://github.com/1024pix/pix/pull/1465) [FEATURE] Afficher la dernière date d'envoi d'une invitation dans Pix Orga (PIX-730).
- [#1471](https://github.com/1024pix/pix/pull/1471) [FEATURE] Permettre à l'utilisateur d'obtenir un e-mail de création de compte en fonction de sa région (PIX-745).
- [#1472](https://github.com/1024pix/pix/pull/1472) [FEATURE] Empêcher le candidat de faire un signalement pendant le test de certification (PIX-578)
- [#1466](https://github.com/1024pix/pix/pull/1466) [FEATURE] Afficher uniquement la date sans la partie "temps" pour les valeurs de date de finalisation, publication et diffusion au prescripteur (PIX-765)
- [#1455](https://github.com/1024pix/pix/pull/1455) [FEATURE] Ajout de la pagination pour les participants au collectes de profils (PIX-621)
- [#1480](https://github.com/1024pix/pix/pull/1480) [BUGFIX] Problème d'affichage de la bannière de reprise de parcours (PIX-770)
- [#1478](https://github.com/1024pix/pix/pull/1478) [BUGFIX] Corrections relatives au changement d'organisation dans Pix Orga (PIX-538).
- [#1467](https://github.com/1024pix/pix/pull/1467) [BUGFIX] Ne prendre en compte que les compétences évaluées en certification lors du scoring de certification CléA (PIX-679)
- [#1469](https://github.com/1024pix/pix/pull/1469) [BUGFIX] Récupérer les derniers knowledge-elements pour un skill avant la date de partage des résultats (PIX-767).
- [#1457](https://github.com/1024pix/pix/pull/1457) [CLEANUP] Change la manière de récupérer les réponses d'un QCM (PIX-768).
- [#1452](https://github.com/1024pix/pix/pull/1452) [CLEANUP] Ajout de tests sur les challenges (PIX-638).
- [#1417](https://github.com/1024pix/pix/pull/1417) [INFRA] Désactivation de la compression des réponses HTTP

## v2.158.0 (29/05/2020)

- [#1462](https://github.com/1024pix/pix/pull/1462) [FEATURE] Permettre à l'utilisateur d'obtenir un e-mail de réinitialisation de mot de passe en fonction de sa région (PIX-746).
- [#1454](https://github.com/1024pix/pix/pull/1454) [FEATURE] Montrer de manière claire que l'utilisateur a déjà envoyé son profil Pix (PIX-610).
- [#1453](https://github.com/1024pix/pix/pull/1453) [FEATURE] Ne pas montrer la page de présentation si l'utilisateur a déjà commencé sa participation (PIX-616).
- [#1461](https://github.com/1024pix/pix/pull/1461) [BUGFIX] Vérifier le seuil des 75% CléA sur le score certifié par compétence (et non positionné) (PIX-680).
- [#1397](https://github.com/1024pix/pix/pull/1397) [TECH] Améliorer l'accès à la liste des participants sur Pix Orga (PIX-608).
- [#1448](https://github.com/1024pix/pix/pull/1448) [CLEANUP] Utilisation d'un read-model dans le service Current-user de Pix Orga (PIX-553).
- [#1418](https://github.com/1024pix/pix/pull/1418) [CLEANUP] Suppression du package "api/lib/interfaces" et de ses modules devenus inutiles.

## v2.157.0 (27/05/2020)

- [#1437](https://github.com/1024pix/pix/pull/1437) [FEATURE] Tracer les modifications des appartenances aux organisations (PF-494).
- [#1447](https://github.com/1024pix/pix/pull/1447) [BUGFIX] Correction du calcul du score en pix (différence entre export du profil et affichage sur le profil) (PIX-739).
- [#1419](https://github.com/1024pix/pix/pull/1419) [CLEANUP] Extraction d'un modèle d'assessment dédié au scoring de certification (PIX-733)

## v2.156.0 (26/05/2020)

- [#1444](https://github.com/1024pix/pix/pull/1444) [FEATURE] Permettre la modification du rôle d'un membership dans Pix Admin (PIX-455).
- [#1449](https://github.com/1024pix/pix/pull/1449) [FEATURE] Voir les campagnes archivées quand plus de campagnes actives (PIX-663)
- [#1430](https://github.com/1024pix/pix/pull/1430) [FEATURE] Ajout du filtre sur la colonne "Qui ?" dans la liste des sessions dans Pix Admin (PA-211)
- [#1428](https://github.com/1024pix/pix/pull/1428) [BUGFIX] Empêcher l'utilisateur de demander plusieurs fois la réinitialisation de son mot de passe (PIX-489).
- [#1451](https://github.com/1024pix/pix/pull/1451) [BUGFIX] Correction de la mise à jour de l'affichage de la liste des participants (PIX-747).
- [#1438](https://github.com/1024pix/pix/pull/1438) [BUGFIX] Affichage correct du label de l'identifiant externe dans Pix Orga (PIX-643).

## v2.155.0 (25/05/2020)

- [#1441](https://github.com/1024pix/pix/pull/1441) [FEATURE] Résultats collectifs prenant en compte les nouvelles compétences de Pix + (PIX-673)
- [#1443](https://github.com/1024pix/pix/pull/1443) [FEATURE] Afficher le bon lien vers les CGU sur .org et .fr (PIX-683).
- [#1402](https://github.com/1024pix/pix/pull/1402) [FEATURE] Industrialiser les critères de badge (PIX-563).
- [#1436](https://github.com/1024pix/pix/pull/1436) [FEATURE] Rediriger sur le site vitrine après déconnexion (PF-682).
- [#1426](https://github.com/1024pix/pix/pull/1426) [FEATURE] Afficher la liste des participants à une collecte de profil dans pix orga (PIX-618)
- [#1440](https://github.com/1024pix/pix/pull/1440) [BUGFIX] L'ordre de tri sur la liste paginée des sessions sur PixAdmin n'est pas déterministe (PIX-728)
- [#1439](https://github.com/1024pix/pix/pull/1439) [BUGFIX] Rétablissement du loader quand on lance une évaluation (PIX-653).
- [#1394](https://github.com/1024pix/pix/pull/1394) [BUGFIX] Stabilisation des perfs pour l'export CSV des campagnes de collecte de profils et d'évaluation (PIX-607).
- [#1433](https://github.com/1024pix/pix/pull/1433) [TECH] Montée de version des dépendances de Pix API
- [#1411](https://github.com/1024pix/pix/pull/1411) [CLEANUP] Extraction d'un JuryCertificationSummary pour plus de clarté concernant le traitement des sessions (PIX-654)

## v2.154.0 (19/05/2020)

- [#1429](https://github.com/1024pix/pix/pull/1429) [FEATURE] Traduire les titres des domaines (PIX-664)
- [#1420](https://github.com/1024pix/pix/pull/1420) [FEATURE] Changer la façon d'accéder à la page de détail d'un utilisateur dans Pix Admin (PIX-677).
- [#1408](https://github.com/1024pix/pix/pull/1408) [FEATURE] Clarifier la page de changement de mot de passe (PIX-554).
- [#1410](https://github.com/1024pix/pix/pull/1410) [FEATURE] Modification du calcul des Pix Globaux (PIX-649)
- [#1396](https://github.com/1024pix/pix/pull/1396) [FEATURE] Voir qui est assigné à une session sur Pix Admin (PIX-588)
- [#1427](https://github.com/1024pix/pix/pull/1427) [BUGFIX] Nom du fichier avant jury sans underscore (PIX-661)
- [#1431](https://github.com/1024pix/pix/pull/1431) [TECH] Ajouter les sourcemaps en développement
- [#1409](https://github.com/1024pix/pix/pull/1409) [TECH] Diviser le flux d'accès aux campagnes (PIX-651).
- [#1393](https://github.com/1024pix/pix/pull/1393) [TECH] Glimmerize challenge-statement (PIX-676).
- [#1377](https://github.com/1024pix/pix/pull/1377) [DOC] Ajouter un standard de test.

## v2.153.0 (15/05/2020)

- [#1403](https://github.com/1024pix/pix/pull/1403) [FEATURE] Valider les QROCM seulement si l'utilisateur a rempli tous les champs réponse (PIX-375).
- [#1424](https://github.com/1024pix/pix/pull/1424) [BUGFIX] Changer la description de la page de connexion de Pix Certif (PIX-678)
- [#1423](https://github.com/1024pix/pix/pull/1423) [BUGFIX] Remettre l'ancien gradient sur la page de connexion sur Pix Orga (PIX-655).
- [#1421](https://github.com/1024pix/pix/pull/1421) [BUGFIX] Corriger l'affichage de la progression sur le didacticiel (PIX-560).
- [#1399](https://github.com/1024pix/pix/pull/1399) [BUGFIX] Limiter les Pix et Levels max sur l'export de collecte de profils (PIX-615).
- [#1412](https://github.com/1024pix/pix/pull/1412) [BUGFIX] Empêcher le chevauchement des boutons sur la page CGU en version mobile (PIX-662)
- [#1415](https://github.com/1024pix/pix/pull/1415) [BUGFIX] Suppression d'un warning ember-data sur les user-orga-settings.
- [#1414](https://github.com/1024pix/pix/pull/1414) [BUGFIX] Suppression de warnings ember-data sur les memberships.
- [#1400](https://github.com/1024pix/pix/pull/1400) [BUGFIX] Validation de la longueur d'un id de session.
- [#1416](https://github.com/1024pix/pix/pull/1416) [TECH] Ajout d'un helper de test contains pour vérifier qu'un texte est présent dans le rendu (PIX-675) .
- [#1413](https://github.com/1024pix/pix/pull/1413) [CLEANUP] Retrait d'une clause SELECT inutile dans le KE repository

## v2.152.0 (13/05/2020)

- [#1398](https://github.com/1024pix/pix/pull/1398) [FEATURE] Améliorer le design de la page de login (PIX-511).
- [#1406](https://github.com/1024pix/pix/pull/1406) [FEATURE] Centrer les messages d'erreur sur la page de connexion de Pix Orga (PIX-652).
- [#1317](https://github.com/1024pix/pix/pull/1317) [FEATURE] Certif clea zone grise (PF-1147)
- [#1372](https://github.com/1024pix/pix/pull/1372) [FEATURE] Ajoute le système d'archivage sur les campagnes de type collecte de profils (PIX-584).
- [#1395](https://github.com/1024pix/pix/pull/1395) [FEATURE][FIX] Utiliser l'élément UL pour la liste à puces dans la double mire de connexion SCO (PIX-647).
- [#1392](https://github.com/1024pix/pix/pull/1392) [FEATURE] Mettre à jour le texte de la page de login de PixOrga et son design (PIX-530).
- [#1374](https://github.com/1024pix/pix/pull/1374) [FEATURE] Supprimer le logo de la Marianne si l'on n'est pas sur ".fr" (PIX-603)
- [#1407](https://github.com/1024pix/pix/pull/1407) [BUGFIX] Correction des couleurs de la navigation.
- [#1401](https://github.com/1024pix/pix/pull/1401) [BUGFIX] Ne pas permettre d'évaluer un tutoriel 2 fois (PIX-648).
- [#1405](https://github.com/1024pix/pix/pull/1405) [BUGFIX] Utiliser le bon dégradé de couleur pour le fond de la bannière de la page évaluation.
- [#1389](https://github.com/1024pix/pix/pull/1389) [BUGFIX] Supprime le bouton "J'ai un code" pour les utilisateurs non connectés (PIX-601).
- [#1387](https://github.com/1024pix/pix/pull/1387) [BUGFIX] Suppression d'un warning ember-data sur les campaignParticipations.
- [#1378](https://github.com/1024pix/pix/pull/1378) [BUGFIX] Ne plus avoir les erreurs de transition dans la console (PIX-632).
- [#1277](https://github.com/1024pix/pix/pull/1277) [TECH] Remplir la colonne associatedSkillId de la table certification-challenges avec l'id de l'acquis approprié (PF-1229)
- [#1404](https://github.com/1024pix/pix/pull/1404) [CLEANUP] Déplacement et renommage du module "security-controller"
- [#1382](https://github.com/1024pix/pix/pull/1382) [INFRA] Amélioration des performances mémoire (et donc vitesse) lors de l'utilisation du knowledge-element-repository (PIX-635).
- [#1292](https://github.com/1024pix/pix/pull/1292)  [DESIGN SYSTEM] Mise a jour des couleurs (PF-1152)

## v2.151.0 (11/05/2020)

- [#1386](https://github.com/1024pix/pix/pull/1386) [FEATURE] Modification du message concernant la réinitialisation d'un mot de passe, sur la double mire de connexion (PIX-556).
- [#1380](https://github.com/1024pix/pix/pull/1380) [FEATURE] Copier/Coller les informations contenues dans la pop-up Gestion du compte de l'élève de PixOrga (PIX-557).
- [#1334](https://github.com/1024pix/pix/pull/1334) [FEATURE] Traduction des pages d'inscription/connexion (PF-1207).
- [#1390](https://github.com/1024pix/pix/pull/1390) [BUGFIX] Rediriger vers la page de campagne après revalidation des CGU (PIX-644).
- [#1384](https://github.com/1024pix/pix/pull/1384) [CLEANUP] Retrait du code lié à la route GET /api/feedbacks, non utilisée (PIX-639)

## v2.150.0 (07/05/2020)

- [#1357](https://github.com/1024pix/pix/pull/1357) [FEATURE]  Ajout de la page /cgu au workflow de connexion (PF-1249).
- [#1379](https://github.com/1024pix/pix/pull/1379) [FEATURE] Pouvoir trier la recommandation dans l'onglet analyse (PIX-585).
- [#1368](https://github.com/1024pix/pix/pull/1368) [FEATURE] Permettre la modification d'une campagne de type collecte de profils (PIX-579).
- [#1376](https://github.com/1024pix/pix/pull/1376) [FEATURE] Enregister l'acceptation des CGU par l'utilisateur (PF-1235)
- [#1388](https://github.com/1024pix/pix/pull/1388) [BUGFIX] Deux épreuves avec des fichiers à télécharger ont les mêmes fichiers (PIX-642).
- [#1385](https://github.com/1024pix/pix/pull/1385) [BUGFIX] Corriger les rem de la communication banner (PIX-646).
- [#1367](https://github.com/1024pix/pix/pull/1367) [TECH] Regrouper les tests des cas d'erreurs des contrôleurs (PIX-599).
- [#1360](https://github.com/1024pix/pix/pull/1360) [INFRA] Possibilité d'ajouter des en-têtes HTTP grâce à des variables d'environnement.
- [#1331](https://github.com/1024pix/pix/pull/1331) [CLEANUP] Convertir les font-size exprimées en px en rem et aligner la valeur du rem de Pix App sur les autres fronts.
- [#1359](https://github.com/1024pix/pix/pull/1359) [INFRA] Corrige le status code HTTP "precondition failed" (421 -> 412)

## v2.149.1 (06/05/2020)

- [#1383](https://github.com/1024pix/pix/pull/1383) [BUGFIX] Problème d'affichage des réponses des QROCM (PIX-636).

## v2.149.0 (06/05/2020)

- [#1293](https://github.com/1024pix/pix/pull/1293) [FEATURE] Evaluer un tutoriel (PF-1095).
- [#1373](https://github.com/1024pix/pix/pull/1373) [FEATURE] Supprime le terme parcours des messages d'erreurs des pages de réconciliation (PIX-582).
- [#1371](https://github.com/1024pix/pix/pull/1371) [FEATURE] Supprime le terme parcours des messages d'erreurs des pages de réconciliation (PIX-582).
- [#1381](https://github.com/1024pix/pix/pull/1381) [BUGFIX] Le résultat de certificat de l'utilisateur ne s'affiche plus (PIX-631)
- [#1369](https://github.com/1024pix/pix/pull/1369) [BUGFIX] Le changement rapide du contenu de plusieurs filtres dans les listes paginées n'est pas bien géré (PIX-598)
- [#1323](https://github.com/1024pix/pix/pull/1323) [CLEANUP] Refacto autour des sessions côté PixAdmin (PIX-589)
- [#1297](https://github.com/1024pix/pix/pull/1297) [INFRA] Ajout d'en-têtes HTTP pour la sécurité
- [#1370](https://github.com/1024pix/pix/pull/1370) [CLEANUP] Suppression de la feature d'analyse de PV de session dans PixAdmin (PIX-600)
- [#1344](https://github.com/1024pix/pix/pull/1344) [BSR] Supprimer les actions dépréciées POST et PATCH sur la route user-orga-settings
- [#1247](https://github.com/1024pix/pix/pull/1247) [DOC] Ajouter des diagrammes de séquence sur la sécurité
- [#1375](https://github.com/1024pix/pix/pull/1375) [CLEANUP] Suppression d'un appel inutile dans la page challenge (PIX-609).

## v2.148.0 (04/05/2020)

- [#1332](https://github.com/1024pix/pix/pull/1332) [FEATURE] Permettre de signaler que les utilisateurs non SCO doivent valider les prochaines CGU (PF-1236).
- [#1337](https://github.com/1024pix/pix/pull/1337) [FEATURE] Ajout d'un filtre sur la colonne "Centre de certification" dans la liste des sessions paginée sur PixAdmin (PA-210)
- [#1366](https://github.com/1024pix/pix/pull/1366) [FEATURE] Mise à jour de l'apparence du bouton "J'ai un code" (PIX-595).
- [#1340](https://github.com/1024pix/pix/pull/1340) [FEATURE] Afficher le profil d'un utilisateur avant qu'il le partage dans une campagne de collecte de profils (PIX-559).
- [#1348](https://github.com/1024pix/pix/pull/1348) [FEATURE] Ajout d'une bannière spécifique à l'envoi de profil (PIX-568).
- [#1351](https://github.com/1024pix/pix/pull/1351) [FEATURE] Ajout d'un lien vers la documentation pour les utilisateurs d'organisations pro (PIX-565).
- [#1356](https://github.com/1024pix/pix/pull/1356) [FEATURE] Changer les messages d'erreur à la saisie de code campagne (PIX-573).
- [#1354](https://github.com/1024pix/pix/pull/1354) [FEATURE] Changer le texte du loader de campagne dans pix-app  (PIX-572)
- [#1308](https://github.com/1024pix/pix/pull/1308) [CLEANUP] Appliquer la règle eslint no-get dans PixApp (PF-1247).
- [#1353](https://github.com/1024pix/pix/pull/1353) [INFRA] Corriger le démarrage des apps pour les tests Cypress en local (PIX-596).

## v2.147.0 (30/04/2020)

- [#1358](https://github.com/1024pix/pix/pull/1358) [FEATURE] Retirer la pagination à 100 sur les participations aux campagnes (PIX-594).
- [#1362](https://github.com/1024pix/pix/pull/1362) [FEATURE] Ajout de la gestion du mot de passe à usage unique sur la double mire (PF-1216).
- [#1347](https://github.com/1024pix/pix/pull/1347) [FEATURE] Création d'une page pour afficher la nouvelle version des cgus Pix. (PF-998)
- [#1346](https://github.com/1024pix/pix/pull/1346) [TECH] Utiliser .integer() sur les validations d'ID (PIX-591).
- [#1355](https://github.com/1024pix/pix/pull/1355) [DOC] Met à jour la description du tag de PR `BUGFIX`

## v2.146.0 (28/04/2020)

- [#1299](https://github.com/1024pix/pix/pull/1299) [FEATURE] Générer un mot de passe à usage unique pour un élève dans Pix Orga (PO-321).
- [#1338](https://github.com/1024pix/pix/pull/1338) [FEATURE] Ajout d'onglets sur la page participant (PIX-569).
- [#1345](https://github.com/1024pix/pix/pull/1345) [FEATURE] Retrait de la colonne "Nombre de certifications publiées" dans la liste des sessions de PixAdmin (PIX-566).
- [#1339](https://github.com/1024pix/pix/pull/1339) [FEATURE] Ajuster la formulation de la page d'identifiant externe (PIX-564).
- [#1350](https://github.com/1024pix/pix/pull/1350) [BUGFIX] Export CSV d'une campagne, ne pas mettre l'id externe quand la campagne n'en a pas (PIX-592).
- [#1341](https://github.com/1024pix/pix/pull/1341) [BUGFIX] Le temps d'attente d'envoi de requêtes mis en place lors de la recherche de campagnes par nom dans PixOrga ne marche plus (PO-440)
- [#1342](https://github.com/1024pix/pix/pull/1342) [BUGFIX] Affichage défectueux lorsqu'on supprime rapidement un filtre sur nom dans la liste des campagnes (PIX-583)
- [#1336](https://github.com/1024pix/pix/pull/1336) [TECH] Eviter les erreurs de contraintes d'unicité.

## v2.145.0 (24/04/2020)

- [#1335](https://github.com/1024pix/pix/pull/1335) [FEATURE] Renommer et déplacer l'entrée vers la page de saisie de code depuis le menu de PIX App (PF-1226).
- [#1333](https://github.com/1024pix/pix/pull/1333) [FEATURE] Changement du wording de la page de saisi de code (PF-1227).
- [#1309](https://github.com/1024pix/pix/pull/1309) [FEATURE] Ajouter des filtres concernant le statut et l'envoi des résultats au prescripteur sur la liste des sessions paginées (PA-205)
- [#1275](https://github.com/1024pix/pix/pull/1275) [FEATURE] Certif clea zone rouge (PF-1147)
- [#1318](https://github.com/1024pix/pix/pull/1318) [FEATURE] Affichage des tutoriels par sujets dans l'analyse de campagne (PO-408).
- [#1313](https://github.com/1024pix/pix/pull/1313) [FEATURE] Affichage d'une bannière pour informer les utilisateurs de problèmes sur la prod (PF-1251)
- [#1324](https://github.com/1024pix/pix/pull/1324) [FEATURE] Ajouter un loader au chargement de l'analyse de campagne (PO-431)
- [#1322](https://github.com/1024pix/pix/pull/1322) [FEATURE] Ajout de la recommandation pour un participant à une campagne (PO-422)
- [#1320](https://github.com/1024pix/pix/pull/1320) [BUGFIX] Le temps d'attente (debounce) avant de lancer une requête de recherche ne marchait pas dans les listes paginées sur PixAdmin (PA-206)
- [#1298](https://github.com/1024pix/pix/pull/1298) [TECH] Simplification de la génération de CSV de campagne d'évaluation (PO-427).

## v2.144.0 (23/04/2020)

- [#1311](https://github.com/1024pix/pix/pull/1311) [BUGFIX] Correction de l'affichage du logo sous IE (PF-1225).
- [#1328](https://github.com/1024pix/pix/pull/1328) [TECH] Éviter de générer des heap dumps lors de l'utilisation de `nodemon`
- [#1326](https://github.com/1024pix/pix/pull/1326) [TECH] Problème de script npm start en développement.
- [#1300](https://github.com/1024pix/pix/pull/1300) [TECH][FIX] Catégoriser les envois d'e-mail en alimentant la propriété TAGS (PF-1242).
- [#1303](https://github.com/1024pix/pix/pull/1303) [TECH] Correction des routes d'API destinées aux diagnostics mémoire
- [#1330](https://github.com/1024pix/pix/pull/1330) Revert "[BUGFIX] Restreindre l'accès au détail d'une campagne dans Pix Orga (PO-357). "
- [#1327](https://github.com/1024pix/pix/pull/1327) [BSR] Remplacer Promise.all par bluebird.mapSeries lors de la génération des résultats de certification d'une session entière (PA-209)
- [#1325](https://github.com/1024pix/pix/pull/1325) [BUG] Propriétés cgus incorrects lors de l'affichage de détail utilisateurs.(PA-208)

## v2.143.0 (21/04/2020)

- [#1319](https://github.com/1024pix/pix/pull/1319) [BUGFIX] Affichage non correct du résumé des résultats collectifs de campagne d'évaluation (PO-432).
- [#1316](https://github.com/1024pix/pix/pull/1316) [TECH] Remplacer les dummy tests unitaires par défaut Ember par de vrais tests (PC-145)

## v2.142.0 (20/04/2020)

- [#1314](https://github.com/1024pix/pix/pull/1314) [FEATURE] afficher l id de certif dans le champ de recherche admin (PA-201)
- [#1294](https://github.com/1024pix/pix/pull/1294) [FEATURE] Ajout d'une entrée Analyse dans la sous navigation du détails d'une campagne (PO-407).
- [#1310](https://github.com/1024pix/pix/pull/1310) [FEATURE] Affichage de la liste des sujets pour un participant à une campagne (PO-421)
- [#1291](https://github.com/1024pix/pix/pull/1291) [FEATURE] Calculer et afficher la recommandation des tubes d'une campagne d'évaluation (PO-380).
- [#1286](https://github.com/1024pix/pix/pull/1286) [FEATURE] Afficher le détail des utilisateurs dans Pix Admin (PA-192).
- [#1312](https://github.com/1024pix/pix/pull/1312) [BUGFIX] Restreindre l'accès au détail d'une campagne dans Pix Orga (PO-357).
- [#1210](https://github.com/1024pix/pix/pull/1210) [TECH] Mise en transaction de la création des éléments nécessaires à un test de certification (CertifCourse, assessment et challenges) (PF-1179)
- [#1279](https://github.com/1024pix/pix/pull/1279) [CLEANUP] Glimmerisation du composant pour gérer les simulateurs embarqués dans les épreuves (PF-1241).

## v2.141.0 (17/04/2020)

- [#1280](https://github.com/1024pix/pix/pull/1280) [FEATURE] Pouvoir s'assigner une session à traiter dans PixAdmin (PA-137)
- [#1199](https://github.com/1024pix/pix/pull/1199) [FEATURE] Permettre l'utilisation d'un mot de passe à usage unique (PF-1027).
- [#1305](https://github.com/1024pix/pix/pull/1305) [FEATURE] Ajout de la date de diffusion au prescripteur dans la liste des sessions sur PixAdmin (PA-189)
- [#1306](https://github.com/1024pix/pix/pull/1306) [FEATURE] Ordonner la liste des sessions paginée dans PixAdmin de sorte à remonter les sessions à traiter en premier par le pôle certification (PA-178)
- [#1304](https://github.com/1024pix/pix/pull/1304) [TECH] Tester la présence d'un ID et pas sa valeur dans le test auto sur les tutos (PF-1244)
- [#1307](https://github.com/1024pix/pix/pull/1307) [TECH] Ajout de tests e2e (PF-1246).

## v2.140.0 (16/04/2020)

- [#1290](https://github.com/1024pix/pix/pull/1290) [FEATURE] Changement des formulations de la landing page des collectes de profils (PF-1222).
- [#1301](https://github.com/1024pix/pix/pull/1301) [FEATURE] Appliquer une recherche stricte sur le filtre de la colonne ID dans la liste des sessions sur PixAdmin (PA-202)
- [#1283](https://github.com/1024pix/pix/pull/1283) [FEATURE] Exporter les résultats de campagne de collecte de profils (PO-393).
- [#1289](https://github.com/1024pix/pix/pull/1289) [FEATURE] Ajout d'informations sur la méthode de calcul des recommandations (PO-405).
- [#1296](https://github.com/1024pix/pix/pull/1296) [BUGFIX] Le menu "Élèves" ne s'affiche pas correctement lorsque l'on change d'organisation (PO-426).
- [#1287](https://github.com/1024pix/pix/pull/1287) [BUGFIX] Campagnes non affichées sur IE (PO-398).
- [#1285](https://github.com/1024pix/pix/pull/1285) [TECH] Ajout de tests de non régression visuelle.
- [#1278](https://github.com/1024pix/pix/pull/1278) [TECH] Retourner une réponse 204 lors de l'appel de rafraichissement du cache

## v2.139.0 (10/04/2020)

- [#1284](https://github.com/1024pix/pix/pull/1284) [FEATURE] Ajout d'un composant pour représenter les différents niveaux de recommandation des sujets (PO-403).
- [#1282](https://github.com/1024pix/pix/pull/1282) [FEATURE] Ajout d'un commentaire en dessous des profils cibles lors de la création d'une campagne (PO-415).
- [#1208](https://github.com/1024pix/pix/pull/1208) [FEATURE]  certif clea zone verte (pf-1146)
- [#1272](https://github.com/1024pix/pix/pull/1272) [BUGFIX] Messages d'erreurs d'authentifications erronés dans pix-certif (PC-143)
- [#1185](https://github.com/1024pix/pix/pull/1185) [CLEANUP] Faire les calculs de score et de niveau à un seul endroit.

## v2.138.0 (09/04/2020)

- [#1268](https://github.com/1024pix/pix/pull/1268) [FEATURE] Pouvoir envoyer son profil Pix au prescripteur de la campagne de type Collecte de profils (PF-1178).
- [#1271](https://github.com/1024pix/pix/pull/1271) [FEATURE] Supprimer un tutoriel de sa liste personnalisée (PF-1180).
- [#1225](https://github.com/1024pix/pix/pull/1225) [FEATURE] Ajout d'une date de publication dans la session (PA-153)
- [#1265](https://github.com/1024pix/pix/pull/1265) [BUGFIX] Ré-afficher les messages d'erreurs renvoyés par l'API (PO-414).
- [#1269](https://github.com/1024pix/pix/pull/1269) [TECH] Supprimer le endpoint DELETE /api/cache
- [#1256](https://github.com/1024pix/pix/pull/1256) [TECH] Ajout de tests E2E Cypress sur PixCertif (PC-142)
- [#1270](https://github.com/1024pix/pix/pull/1270) [TECH] Renommer tubeName de Skill dans api
- [#1237](https://github.com/1024pix/pix/pull/1237) [TECH] Mise en place d'EmberData throttling sur les applications (PF-1197)
- [#1240](https://github.com/1024pix/pix/pull/1240) [CLEANUP] Extraire la logique de scoring de certification dans un Event Handler dédié (PF-1202)
- [#1273](https://github.com/1024pix/pix/pull/1273) [CLEANUP] Ajout de tests end-to-end pour la fonctionnalité de sauvegarde de tutoriels
- [#1233](https://github.com/1024pix/pix/pull/1233) [CLEANUP] Convertir les classes PixApp en syntaxe native (PF-1194).

## v2.137.0 (07/04/2020)

- [#1253](https://github.com/1024pix/pix/pull/1253) [FEATURE] Créer des campagnes de type collecte de profils (PO-392).
- [#1252](https://github.com/1024pix/pix/pull/1252) [FEATURE] Rendre une épreuve multilangue (PF-1196)
- [#1260](https://github.com/1024pix/pix/pull/1260) [FEATURE] MAJ Logo et phrase badge Cléa (PF-1211).
- [#1249](https://github.com/1024pix/pix/pull/1249) [FEATURE] Afficher la liste des tutos sauvegardés sur une page dédiée (PF-1096).
- [#1266](https://github.com/1024pix/pix/pull/1266) [BUGFIX] Correction du design du formulaire de rattachement de profils cibles (PA-200).
- [#1259](https://github.com/1024pix/pix/pull/1259) [BUGFIX] Correction du design du loader dans Pix Orga (PO-413).
- [#1264](https://github.com/1024pix/pix/pull/1264) [BUGFIX] Supprime un logo de badge sur la page de résultat de certification
- [#1243](https://github.com/1024pix/pix/pull/1243) [TECH] Ajout et utilisation d'une route pour récupérer toutes les answers (PF-1195).
- [#1248](https://github.com/1024pix/pix/pull/1248) [TECH] Catégoriser les envois d'e-mail en alimentant la propriété TAGS (PF-1213).
- [#1261](https://github.com/1024pix/pix/pull/1261) [TECH] Suppression du endpoint obsolète /metrics.
- [#1151](https://github.com/1024pix/pix/pull/1151) [TECH] Sauvegarder l'obtention des badges
- [#1232](https://github.com/1024pix/pix/pull/1232) [CLEANUP] Convertir les services PixApp en syntaxe native (PF-1193).
- [#1267](https://github.com/1024pix/pix/pull/1267) BUGFIX - Revert PF-1213 - Réparer l'envoi des mails d'invitation - (PF-1219)
- [#1262](https://github.com/1024pix/pix/pull/1262) [DOC] Corriger la section sur le nommage des commits
- [#1258](https://github.com/1024pix/pix/pull/1258) [DOC] Description de l'anatomie des sources de Pix.

## v2.136.0 (03/04/2020)

- [#1254](https://github.com/1024pix/pix/pull/1254) [FEATURE] Invitation à Pix Orga depuis Pix Admin (PA-96).
- [#1193](https://github.com/1024pix/pix/pull/1193) [FEATURE] Changer l'onglet certifications dans Pix Admin (PA-182)
- [#1235](https://github.com/1024pix/pix/pull/1235) [FEATURE] Affichage des sujets d'un profil cible dans l'analyse d'une campagne (PO-397).
- [#1231](https://github.com/1024pix/pix/pull/1231) [FEATURE] Modifier le design de la modal de changement de mot de passe (PO-382).
- [#1234](https://github.com/1024pix/pix/pull/1234) [BUGFIX] Affichage menu sous IE (PC-140)
- [#1236](https://github.com/1024pix/pix/pull/1236) [TECH] Renommer le type de campagne TEST_GIVEN to ASSESSMENT (PO-399).
- [#1242](https://github.com/1024pix/pix/pull/1242) [DOC] Mise à jour des conventions de nommage des commits et des branches
- [#1250](https://github.com/1024pix/pix/pull/1250) [DESIGN-SYSTEM] Changer les couleurs utilisées dans Pix Orga pour celles du design system (PO-410).

## v2.135.0 (01/04/2020)

- [#1183](https://github.com/1024pix/pix/pull/1183) [FEATURE] Accéder à une campagne Pix Emploi (PF-837)
- [#1238](https://github.com/1024pix/pix/pull/1238) [BUGFIX] [EXPEDITE] Correction de l'affichage des boutons sur la page de détails d'une campagne (PO-402).
- [#1229](https://github.com/1024pix/pix/pull/1229) [BUGFIX] Numéro de session dans la barre de recherche incohérent avec la page affichée (PA-191)
- [#1226](https://github.com/1024pix/pix/pull/1226) [BSR] Script send-invitations-to-sco-organizations - Supprimer les appels HTTP (PF-1192).

## v2.134.0 (30/03/2020)

- [#1215](https://github.com/1024pix/pix/pull/1215) [FEATURE] Pouvoir rattacher des profils cibles à une organisation dans Pix Admin (PA-167).
- [#1217](https://github.com/1024pix/pix/pull/1217) [FEATURE] Cacher les détails pour les campagnes de récupération de profils (PO-391).
- [#1227](https://github.com/1024pix/pix/pull/1227) [BUGFIX] Ne pas afficher une bande blanche en bas des CGUs de PixCertif (PC-80)
- [#1228](https://github.com/1024pix/pix/pull/1228) [BUGFIX] Faire en sorte que le logo de Pix Orga ne soit pas déformé sous IE (PO-289).
- [#1221](https://github.com/1024pix/pix/pull/1221) [BUGFIX] Mauvaise notification d'erreur lors de l'échec de l'ajout unitaire de candidat sur PixCertif (PC-139)
- [#1207](https://github.com/1024pix/pix/pull/1207) [TECH] Renommer la table students (PF-1175).
- [#1230](https://github.com/1024pix/pix/pull/1230) [BUFIX] Problème d'affichage d'une équipe avec beaucoup de membres. (PO-323).
- [#1220](https://github.com/1024pix/pix/pull/1220) [INFRA] Mise à jour des dépendances sur Pix Certif, édition Mars 2020 (PC-138)
- [#1222](https://github.com/1024pix/pix/pull/1222) [INFRA] Réduit le temps de disparition de la notification pendant les tests d'acceptance (PO-396)
- [#1223](https://github.com/1024pix/pix/pull/1223) [CLEANUP] Suppression des scripts de gestion des releases.
- [#1190](https://github.com/1024pix/pix/pull/1190) [CLEANUP] Convertir les composants de Pix App en syntaxe native (PF-1165).
- [#1214](https://github.com/1024pix/pix/pull/1214) [INFRA] Retrait du feature toggle FT_IS_SESSION_FINALIZATION_ACTIVE (PC-137)

## v2.133.0 (26/03/2020)

- [#1166](https://github.com/1024pix/pix/pull/1166) [FEATURE] Ajouter un tutoriel à sa liste (PF-1100).
- [#1216](https://github.com/1024pix/pix/pull/1216) [BUGFIX] Des utilisateurs sont bloqués sur une épreuve. (PF-1187).
- [#1219](https://github.com/1024pix/pix/pull/1219) [TECH] Ajout d'une règle de linter pour éviter les injections SQL

## v2.132.0 (26/03/2020)

- [#1177](https://github.com/1024pix/pix/pull/1177) [FEATURE] Ajout d'un lien vers les informations d'une session depuis la liste des sessions (PA-152)

## v2.131.0 (25/03/2020)

- [#1204](https://github.com/1024pix/pix/pull/1204) [FEATURE] Ajouter une colonne dans la liste des sessions pour indiquer le type du centre de certification associé (PA-175)
- [#1181](https://github.com/1024pix/pix/pull/1181) [BUGFIX] Les certificats dont le test de certif n'était pas fini par le candidat mais examiné et publié par le pôle certif n'était pas visible par le candidat dans son espace de certificats (PF-1118)
- [#1212](https://github.com/1024pix/pix/pull/1212) [TECH] Ajout d'une gestion de droits à la fonctionnalité de campagne de récupération profils (PO-390).
- [#1205](https://github.com/1024pix/pix/pull/1205) [TECH] Ajouter la possibilité d'avoir un type de campagne (PO-389).
- [#1213](https://github.com/1024pix/pix/pull/1213) [CLEANUP] Ajouter les couleurs et les styles de titres du design system à PixApp (PF-1181).

## v2.130.0 (24/03/2020)

- [#1200](https://github.com/1024pix/pix/pull/1200) [FEATURE] Modifier le message d'erreur générique lors d'un import SIECLE en ajoutant un lien vers le formulaire du centre d'aide (PO-388).
- [#1196](https://github.com/1024pix/pix/pull/1196) [FEATURE] Ajouter un bouton de documentation qui pointe vers un lien différent en fonction du type de centre de certification (PC-136)
- [#1197](https://github.com/1024pix/pix/pull/1197) [BUGFIX] La touche "Entrée" n'est pas prise en compte dans les questions à réponses multiples (PF-1176).
- [#1186](https://github.com/1024pix/pix/pull/1186) [BUGFIX] Harmoniser le calcul de pourcentage de progression d'un candidat sur une campagne (PO-325)
- [#1198](https://github.com/1024pix/pix/pull/1198) [BUGFIX] Des utilisateurs avaient un succès pour un niveau pas encore atteint (PF-1171).
- [#1146](https://github.com/1024pix/pix/pull/1146) [TECH] Redescendre l'échappement des formules pour le CSV au niveau de la sérialisation
- [#1191](https://github.com/1024pix/pix/pull/1191) [TECH] Ajoute des scripts npm pour lancer les tests d'intégration ou d'acceptance
- [#1182](https://github.com/1024pix/pix/pull/1182) [TECH] Création d'une route healthcheck/redis pour brancher Datadog et Freshping.
- [#1206](https://github.com/1024pix/pix/pull/1206) [DOC] Ajouter la section de test dans le template de PR.

## v2.129.0 (23/03/2020)

- [#1179](https://github.com/1024pix/pix/pull/1179) [FEATURE] Gérer la localisation des acquis francophone ou franco-français (PF-1035).
- [#1195](https://github.com/1024pix/pix/pull/1195) [BUGFIX]  Publication des certif par session KO dans Pix Admin (pa-184)
- [#1174](https://github.com/1024pix/pix/pull/1174) [BUGFIX] Bloquer l'inscription si le formulaire n'est pas valide (PO-381).
- [#1201](https://github.com/1024pix/pix/pull/1201) [TECH] Ajout de tests E2E sur Pix Orga (PO-383).
- [#1202](https://github.com/1024pix/pix/pull/1202) [CLEANUP] Retrait d'un .only oublié dans les tests PixAdmin (PA-185)
- [#1188](https://github.com/1024pix/pix/pull/1188) [DESIGN-SYSTEM] Uniformisation des couleurs (CERTIF) (PF-1163)

## v2.128.0 (20/03/2020)

- [#1156](https://github.com/1024pix/pix/pull/1156) [FEATURE] Permettre la ré-initialisation de mot de passe des élèves inscrit par mail (PO-339).
- [#1187](https://github.com/1024pix/pix/pull/1187) [FEATURE] Changer la façon de contacter le support de la page d'erreur (PF-1166).
- [#1171](https://github.com/1024pix/pix/pull/1171) [BUGFIX] Permettre la connexion aux utilisateurs dont un des memberships a été supprimé (PO-376).
- [#1178](https://github.com/1024pix/pix/pull/1178) [TECH] Renforcer la contrainte d'unicité entre un assessment et un certification-course dans la table Assessments (PF-1161)
- [#1168](https://github.com/1024pix/pix/pull/1168) [TECH] Ajout d'un composant permettant de représenter le pourcentage de succès (PO-366).
- [#1189](https://github.com/1024pix/pix/pull/1189) [TECH] Exclure la branche master des tests sur la CI.
- [#1194](https://github.com/1024pix/pix/pull/1194) [CLEANUP] Supprimer les méthodes dépréciées fromAttributes (PF-1174)
- [#1176](https://github.com/1024pix/pix/pull/1176) [CLEANUP] Refacto du setup Mirage sur MonPix

## v2.127.0 (18/03/2020)


## v2.126.1 (18/03/2020)

- [#1180](https://github.com/1024pix/pix/pull/1180) [BUGFIX] Intégration de Matomo avec les apps front.
- [#1124](https://github.com/1024pix/pix/pull/1124) [TECH] Montée de version de Pix Admin vers Ember 3.15 / Octane (PA-42).
- [#1184](https://github.com/1024pix/pix/pull/1184) [EXPEDIT] Mauvais affichage des heures sur la liste des sessions (PA-183)

## v2.126.0 (17/03/2020)

- [#1173](https://github.com/1024pix/pix/pull/1173) [FEATURE] Affichage du nombre de crédits octroyés à une organisation dans Pix Admin (PA-173).
- [#1169](https://github.com/1024pix/pix/pull/1169) [FEATURE] Optimisation du logo Pix (PF-1013).
- [#1164](https://github.com/1024pix/pix/pull/1164) [FEATURE] Gérer les critères de badge CLEA (PF-1132).
- [#1141](https://github.com/1024pix/pix/pull/1141) [FEATURE] Simplifier la publication de certification (PA-171)
- [#1136](https://github.com/1024pix/pix/pull/1136) [FEATURE] Lister les sessions sur Pix Admin (PA-151)
- [#1170](https://github.com/1024pix/pix/pull/1170) [FEATURE] Filtrer la liste des organisations par l'identifiant externe (PA-172).
- [#1175](https://github.com/1024pix/pix/pull/1175) [BUGFIX] Corriger la gestion des nombres décimaux en answer (PF-1155).
- [#1172](https://github.com/1024pix/pix/pull/1172) [TECH] Rendre Pix véritablement open-contribution.
- [#1161](https://github.com/1024pix/pix/pull/1161) [TECH] Utiliser le champ certificationCourseId plutôt que courseId du modèle assessment dans un contexte de certification (PF-1150)
- [#1160](https://github.com/1024pix/pix/pull/1160) [TECH] Passage de Pix Orga à Ember Octane (PO-316-2).

## v2.125.0 (12/03/2020)

- [#1158](https://github.com/1024pix/pix/pull/1158) [FEATURE] Lors de l'export des résultats, forcer les compétences à 0 pour les certifs rejected (PA-174)
- [#1163](https://github.com/1024pix/pix/pull/1163) [FEATURE] Affichage de la liste des profils cibles d'une organisation (PA-162).
- [#1155](https://github.com/1024pix/pix/pull/1155) [FEATURE] Ajouter l'identifiant externe dans la liste des organisations (PA-113).
- [#1165](https://github.com/1024pix/pix/pull/1165) [BUGFIX] Autoriser l'affichage des autres membres d'une organisation pour un simple membre (PO-374).
- [#1162](https://github.com/1024pix/pix/pull/1162) [TECH] Retrait de la notion d'adaptatif + du type dans le modèle Course
- [#1167](https://github.com/1024pix/pix/pull/1167) [INFRA] Amélioration de la mise en production
- [#1154](https://github.com/1024pix/pix/pull/1154) [BSR][TECH] Réusinage de quelques scripts api et de quelques fichiers de migrations.

## v2.124.0 (10/03/2020)

- [#1140](https://github.com/1024pix/pix/pull/1140) [FEATURE] Ajout d'un filtre sur la colonne "Créé par" dans la liste des campagnes (PO-330).
- [#1147](https://github.com/1024pix/pix/pull/1147) [FEATURE] Modifier l'entrée de menu de réinitialisation de mot de passe (PO-338).
- [#1115](https://github.com/1024pix/pix/pull/1115) [FEATURE] Afficher les méthodes de connexion des élèves (PO-320)
- [#1114](https://github.com/1024pix/pix/pull/1114) [FEATURE] Ajout de la page mes tutos (PF-1102).
- [#1148](https://github.com/1024pix/pix/pull/1148) [BUGFIX] Pouvoir accepter une invitation à rejoindre Pix Orga lorsqu'on est déjà authentifié (PO-240).
- [#1121](https://github.com/1024pix/pix/pull/1121) [TECH] Démocratisation du code HTTP 404 quand il est impossible de récupérer une ressource : routes answers (PF-1131)
- [#1153](https://github.com/1024pix/pix/pull/1153) [TECH] Suppression de la table Snapshots (PF-1126).
- [#1149](https://github.com/1024pix/pix/pull/1149) [TECH] Refacto des couleurs sur Pix Admin
- [#1152](https://github.com/1024pix/pix/pull/1152) [TECH] Déplacer les critères de badge vers l'API (PF-1149).
- [#1143](https://github.com/1024pix/pix/pull/1143) [TECH] Première étape pour le passage de Pix Orga à Ember Octane (PO-316-1).
- [#1145](https://github.com/1024pix/pix/pull/1145) [TECH] Range le code API qui gère les erreurs HTTP dans le répertoire `application`
- [#1137](https://github.com/1024pix/pix/pull/1137) [TECH] Nettoyage du modèle Course (PF-1137)
- [#1150](https://github.com/1024pix/pix/pull/1150) [DOC] Amélioration du README et des instructions d'installation de la plateforme.

## v2.123.0 (05/03/2020)

- [#1129](https://github.com/1024pix/pix/pull/1129) [FEATURE] Pouvoir changer d'organisation courante dans Pix Orga (PO-237).
- [#1142](https://github.com/1024pix/pix/pull/1142) [FEATURE] Ajouter une colonne credit à la table organizations (PO-300).
- [#1144](https://github.com/1024pix/pix/pull/1144) [BUGFIX] Réinitialiser l'URL des campagnes quand je change d'organisation (PO-361).
- [#1139](https://github.com/1024pix/pix/pull/1139) [BSR] Réusinage des utilitaires pour les fichiers ODS.

## v2.122.0 (03/03/2020)

- [#1131](https://github.com/1024pix/pix/pull/1131) [FEATURE] Pouvoir modifier le nom de la campagne dans PIX Orga (PO-350).
- [#1103](https://github.com/1024pix/pix/pull/1103) [FEATURE] Ajout d'un filtre sur le status lors de l'affichage de la liste des campagnes (PO-314).
- [#1122](https://github.com/1024pix/pix/pull/1122) [FEATURE] Changer le design du bouton "Retour à la liste" sur la page certificat (PF-1051).
- [#1127](https://github.com/1024pix/pix/pull/1127) [BUGFIX] Obliger l'utilisateur à valider les CGU de Pix Certif avant d'accéder au reste de la plateforme (PC-125).
- [#1135](https://github.com/1024pix/pix/pull/1135) [TECH] Retrait de code mort : usecase plus utilisé dans le cadre de la certification sur mon-pix (PF-1136)
- [#1128](https://github.com/1024pix/pix/pull/1128) [TECH] Passage de Pix Orga à Ember 3.13 (PO-353).
- [#1120](https://github.com/1024pix/pix/pull/1120) [TECH] Ajout d'une colonne certificationCourseId dans la table assessments, clé étrangère vers la table certification-courses (PF-1128)
- [#1126](https://github.com/1024pix/pix/pull/1126) [TECH] Augmenter le temps disponible pour les migrations de base de données lors des déploiements
- [#1133](https://github.com/1024pix/pix/pull/1133) [TECH] Enlève only et corrige un fichier de test dans pix admin

## v2.121.0 (28/02/2020)

- [#1130](https://github.com/1024pix/pix/pull/1130) [FEATURE] Gestion des caractères à risque dans l'export des résultats de campagne (PO-351).
- [#1125](https://github.com/1024pix/pix/pull/1125) [FEATURE] Gestion des caractères à risque lors des exports CSV dans Pix Orga - nom des acquis (PO-332).
- [#1071](https://github.com/1024pix/pix/pull/1071) [BUGFIX] L'identifiant ne doit pas se vider après avoir tenté de s'inscrire avec adresse email existante (PF-1074).
- [#1107](https://github.com/1024pix/pix/pull/1107) [TECH] Pix Board - Suppression du code relatif aux code des organizations (PF-876-6).
- [#1106](https://github.com/1024pix/pix/pull/1106) [TECH] Pix Board - Suppression du code relatif au lien user-organization dans l'API (PF-876-5).

## v2.120.0 (27/02/2020)

- [#1098](https://github.com/1024pix/pix/pull/1098) [FEATURE] Garantir la sélection de l'organisation par défaut dans Pix Orga (PO-344).
- [#1123](https://github.com/1024pix/pix/pull/1123) [FEATURE] Améliorer la visibilité du bouton quitter (PF-1014).
- [#1110](https://github.com/1024pix/pix/pull/1110) [FEATURE] Remplacer le terme Parcours par Campagne. (PO-348)
- [#1056](https://github.com/1024pix/pix/pull/1056) [FEATURE] Ajouter la liste des centres de certification à Pix Admin (PA-62).
- [#1073](https://github.com/1024pix/pix/pull/1073) [FEATURE] Tagger les résultats d'une session comme "envoyés au prescripteur" (PA-134)
- [#1119](https://github.com/1024pix/pix/pull/1119) [BUGFIX] Corriger l'affichage des badges (PF-1127).
- [#1096](https://github.com/1024pix/pix/pull/1096) [BUGFIX] Eviter de sauvegarder les réponses sans leurs KE (PF-1116).
- [#1095](https://github.com/1024pix/pix/pull/1095) [BUGFIX] Appliquer la pagination par défaut lorsque la page 0 est demandée (PO-342).
- [#1112](https://github.com/1024pix/pix/pull/1112) [TECH] Gestion des commentaires examinateurs et globaux vides et blancs (PC-130)
- [#1116](https://github.com/1024pix/pix/pull/1116) [TECH] Suppression de solution-serializer
- [#1090](https://github.com/1024pix/pix/pull/1090) [TECH] Pix Board - Suppression du code relatif aux organisations dans Pix App (PF-876-4).
- [#1089](https://github.com/1024pix/pix/pull/1089) [TECH] Pix Board - Suppression du code relatif au endpoint GET /api/organizations/id/snapshots/export (PF-876-3).
- [#1113](https://github.com/1024pix/pix/pull/1113) [TECH] Ajout de 5 comptes utilisateurs dans les seeds qui sont pile poil certifiables (PF-1123)

## v2.119.0 (26/02/2020)

- [#1085](https://github.com/1024pix/pix/pull/1085) [FEATURE] Gestion des caractères à risque lors des exports CSV dans Pix Admin (PA-148).
- [#1101](https://github.com/1024pix/pix/pull/1101) [BUGFIX] Empécher de pouvoir accéder à Pix Orga sans valider les CGU (PO-347).
- [#1087](https://github.com/1024pix/pix/pull/1087) [TECH] Déplacer les badges dans l'API (PF-1099).
- [#1100](https://github.com/1024pix/pix/pull/1100) [BSR] Remplacer l'utilisation de faker email par exampleEmail (PF-1119).

## v2.118.0 (25/02/2020)

- [#1111](https://github.com/1024pix/pix/pull/1111) [FEATURE] Distinguer les compétences non évaluées de celles échouées dans le fichier de résultats pour prescripteur (PA-160).
- [#1069](https://github.com/1024pix/pix/pull/1069) [FEATURE] Prévenir le prescripteur lorsque un INE est présent deux fois dans le fichier SIECLE importé (PO-341).
- [#1102](https://github.com/1024pix/pix/pull/1102) [BUGFIX] Finalisation de session en échec dans un cas particulier (PC-129).

## v2.117.0 (25/02/2020)

- [#1091](https://github.com/1024pix/pix/pull/1091) [FEATURE] Agrandir la zone de click de la carte compétence (PF-1011).
- [#1057](https://github.com/1024pix/pix/pull/1057) [FEATURE] Ajout du téléchargement fichier avant jury sur la page détails de session (PA-122).
- [#1093](https://github.com/1024pix/pix/pull/1093) [FEATURE] Autofocus les premiers champs de formulaire des deux écrans du tunnel de certification dans MonPix (PF-1117).
- [#1088](https://github.com/1024pix/pix/pull/1088) [FEATURE] Mise en place d’un nouveau menu utilisateur (PO-343).
- [#1065](https://github.com/1024pix/pix/pull/1065) [BUGFIX] Correction de régressions visuelles mineures sur Pix App.
- [#1092](https://github.com/1024pix/pix/pull/1092) [BUGFIX] Fix style du titre de la page résultats d'une campagne.
- [#1105](https://github.com/1024pix/pix/pull/1105) [BUGFIX] Les écrans de fin de test issus de l'analyse du PV de session dans PixAdmin ne sont pas pris en compte (PA-158).
- [#1075](https://github.com/1024pix/pix/pull/1075) [TECH] Pix Board - Suppression du code relatif au endpoint GET /api/snapshots (PF-876-2).
- [#1041](https://github.com/1024pix/pix/pull/1041) [TECH] Améliorer les performances de l'affichage des organisations dans Pix Admin.

## v2.116.0 (21/02/2020)

- [#1062](https://github.com/1024pix/pix/pull/1062) [BUGFIX] Ne pas générer d'erreurs 500 lorsque la route /campaign/id est appelée avec un id non valide (PO-251).
- [#1076](https://github.com/1024pix/pix/pull/1076) [TECH] Ajout de la variable d'environnement POSTGRES_HOST_AUTH_METHOD au docker-compose.yml pour réparer postgres (PF-1107).
- [#1072](https://github.com/1024pix/pix/pull/1072) [TECH] Pix Board - Suppression du code relatif à la route front /board (PF-876-1).
- [#1067](https://github.com/1024pix/pix/pull/1067) [TECH] Refacto route mirage (PF-1079).
- [#1077](https://github.com/1024pix/pix/pull/1077) [TECH] Suppression de get-user.
- [#1053](https://github.com/1024pix/pix/pull/1053) [TECH] Arrêter de créer des assessment-results pour autre chose que de la certification (Refacto usecase complete-assessment) (PF-1093)
- [#1083](https://github.com/1024pix/pix/pull/1083) [TECH] Convertir les modèles PixApp en "Native JS".
- [#1082](https://github.com/1024pix/pix/pull/1082) [STYLE] Align pages title styles (PF-1020)

## v2.115.0 (20/02/2020)

- [#1036](https://github.com/1024pix/pix/pull/1036) [FEATURE] ETQ User, je souhaite tester mon pix avec un Airtable de test (isoprod) (PF-1068)
- [#1070](https://github.com/1024pix/pix/pull/1070) [BUGFIX] Les résultat Pix+ ne doivent pas apparaître dans les résultats de certification (PF-1098)
- [#1074](https://github.com/1024pix/pix/pull/1074) [BUGFIX] Réparation de la mise à jour du cache Airtable d'un élément unique
- [#1052](https://github.com/1024pix/pix/pull/1052) [TECH] Nettoyage des index de la base de données (PF-728)
- [#1079](https://github.com/1024pix/pix/pull/1079) [TECH] Pix Orga: Mise à jour de `fsevents` pour supporter Node 12
- [#1080](https://github.com/1024pix/pix/pull/1080) [TECH] Utilisation de mots-clés français dans les tests Cypress
- [#1084](https://github.com/1024pix/pix/pull/1084) [TECH] Se prémunir d'une attaque de type "Airtable formula injection"
- [#1068](https://github.com/1024pix/pix/pull/1068) [BSR] Suppression du dossier Recrutements.

## v2.114.0 (18/02/2020)

- [#1026](https://github.com/1024pix/pix/pull/1026) [FEATURE] Archivage des campagnes (PO-312)
- [#1063](https://github.com/1024pix/pix/pull/1063) [FEATURE] Remplacer les statuts de session "started" en "created" (PC-115)
- [#1066](https://github.com/1024pix/pix/pull/1066) [FEATURE] Ajout date finalisation sur la page de détail d'une session (PA-145)
- [#1046](https://github.com/1024pix/pix/pull/1046) [FEATURE] Ajoute la colonne "Créé par" dans la liste des campagnes (PO-308).
- [#1048](https://github.com/1024pix/pix/pull/1048) [FEATURE] Afficher un message spécifique en cas de refus d'accès (Pix-orga) (Pix-certification) (Pix-admin) (PO-328).
- [#1028](https://github.com/1024pix/pix/pull/1028) [FEATURE] Ajouter la colonne "Créé le" dans la liste des campagnes (PO-307).
- [#1064](https://github.com/1024pix/pix/pull/1064) [BUGFIX] Correction dans Pix Orga du multi click sur le bouton d'invitation (PO-335).
- [#1061](https://github.com/1024pix/pix/pull/1061) [BUGFIX] Bug d'affichage du "Nombre d'écran de FDT non renseignés" quand une seule certif pour une session (PA-147)
- [#1025](https://github.com/1024pix/pix/pull/1025) [TECH] Mise à jour de PixAPP vers Ember v3.15 (PF-1034).
- [#1059](https://github.com/1024pix/pix/pull/1059) [TECH] Mise à jour de hapi.

## v2.113.0 (14/02/2020)

- [#1054](https://github.com/1024pix/pix/pull/1054) [FEATURE] Script pour rattacher les administrateurs des organisations aux centres de certification correspondants (PF-952).
- [#943](https://github.com/1024pix/pix/pull/943) [FEATURE] Ajout du nombre de signalements et d'écrans de fin de test non cochés sur la page de résumé d'une session dans PixAdmin (PA-102)
- [#1049](https://github.com/1024pix/pix/pull/1049) [FEATURE] Mettre à jour les labels pour la finalisation de session (PC-114)
- [#1058](https://github.com/1024pix/pix/pull/1058) [BUGFIX] Fix sumBy when list contain 1 value (pc-117)
- [#1045](https://github.com/1024pix/pix/pull/1045) [BUGFIX] Lors de l'inscription, vérification de la non présence de l'email en base avec insensibilité à la casse (PF-1077).
- [#1035](https://github.com/1024pix/pix/pull/1035) [BUGFIX] Réparer l'affichage des certifications V1 (PA-143)
- [#1044](https://github.com/1024pix/pix/pull/1044) [TECH] Refacto serializers mirage sur mon-pix (PF-1038).
- [#1055](https://github.com/1024pix/pix/pull/1055) [TECH] Résolution du test "flaky" (qui échoue aléatoirement) sur la CI - api

## v2.112.0 (10/02/2020)

- [#1032](https://github.com/1024pix/pix/pull/1032) [FEATURE] Script pour créer des Centres de Certification SCO (PF-949).
- [#992](https://github.com/1024pix/pix/pull/992) [FEATURE] Améliorer le composant de liste des campagnes (PO-306).
- [#1013](https://github.com/1024pix/pix/pull/1013) [FEATURE] Ajouter une date de finalisation lorsqu'un utilisateur PixCertif finalise une session (PC-111)
- [#1039](https://github.com/1024pix/pix/pull/1039) [FEATURE] Afficher si l'organisation SCO gère des élèves (PA-140)
- [#1047](https://github.com/1024pix/pix/pull/1047) [BUGFIX] Réparer le téléchargement des CSV sur Pix Orga (PO-333).
- [#1042](https://github.com/1024pix/pix/pull/1042) [BUGFIX] Changement du fond d'écran de certains formulaires PIX (PF-961)
- [#1037](https://github.com/1024pix/pix/pull/1037) [BUGFIX] La vérification de l'existence d'une invitation n'est plus sensible à la casse pour l'email (PO-329)
- [#1019](https://github.com/1024pix/pix/pull/1019) [TECH] Remise à plat de toutes les seeds de certification (PF-1064)
- [#1033](https://github.com/1024pix/pix/pull/1033) [TECH] Mise à jour de PixAPP vers Ember 3.14 (PF-1070).

## v2.111.0 (05/02/2020)

- [#1031](https://github.com/1024pix/pix/pull/1031) [FEATURE] Remplace le message d'erreur pour les comptes déjà créer (PF-989).
- [#1034](https://github.com/1024pix/pix/pull/1034) [BUGFIX] Gérer les sessions invalidées depuis le GAR (PF-1071).
- [#1023](https://github.com/1024pix/pix/pull/1023) [BUGFIX] Correction de style sur les épreuves avec téléchargement (PF-1048).
- [#1022](https://github.com/1024pix/pix/pull/1022) [BUGFIX] Pouvoir remettre à zéro une compétence après l'avoir terminé (PF-872).
- [#996](https://github.com/1024pix/pix/pull/996) [TECH] Calculer le lead time entre deux tags
- [#999](https://github.com/1024pix/pix/pull/999) [TECH] Mise à jour de PixApp en Ember 3.13 (PF-1053).
- [#1030](https://github.com/1024pix/pix/pull/1030) [TECH] Suppression de la dépendance sib-api-v3-sdk de la racine.
- [#1001](https://github.com/1024pix/pix/pull/1001) [A11Y] Ajouter des labels aux QROCm (PF-957)
- [#1029](https://github.com/1024pix/pix/pull/1029) [EXPEDITE][BUGFIX] Certains PVs de session sont impossibles à importer via PixAdmin (PA-141)

## v2.110.1 (03/02/2020)

- [#1027](https://github.com/1024pix/pix/pull/1027) [BUGFIX] Corriger le design de la double mire de connexion (PF-1069).
- [#1024](https://github.com/1024pix/pix/pull/1024) [BUGFIX] Mise à jour de la commande de création de release sentry-cli.
- [#1011](https://github.com/1024pix/pix/pull/1011) Rendre les validateurs synchrones et s'assurer qu'ils jettent correctement leurs erreurs converties 4xx (PC-110)

## v2.110.0 (31/01/2020)

- [#1018](https://github.com/1024pix/pix/pull/1018) [FEATURE] Ajout d'un bouton pour rafraîchir le cache de données pédagogiques dans Pix Admin (PA-139).
- [#987](https://github.com/1024pix/pix/pull/987) [FEATURE] Changer le mot de passe d'un étudiant connecté via un nom d'utilisateur (PO-322).
- [#1016](https://github.com/1024pix/pix/pull/1016) [BUGFIX] Corrige le sous-titre de la page de finalization (PC-113).
- [#1020](https://github.com/1024pix/pix/pull/1020) [TECH] Générer des liens de reset de mot de passe en https (PF-1065).
- [#959](https://github.com/1024pix/pix/pull/959) [TECH] Supprimer Bootstrap de mon-pix.
- [#1017](https://github.com/1024pix/pix/pull/1017) [BSR] Ajuster le style du bouton réinitialiser des embed (PF-1061).

## v2.109.0 (30/01/2020)

- [#977](https://github.com/1024pix/pix/pull/977) [FEATURE] Supprimer un candidat de la liste des candidats d'une session. (PC-73)
- [#985](https://github.com/1024pix/pix/pull/985) [FEATURE] Afficher une bulle d'information sur les Pix (PF-803).
- [#981](https://github.com/1024pix/pix/pull/981) [FEATURE] Changer de table l'examinerComment et hasSeenEndTestScreen (pa-102)
- [#1015](https://github.com/1024pix/pix/pull/1015) [BUGFIX] Changement de texte pour l'info-bulle des 1024 pix.
- [#1014](https://github.com/1024pix/pix/pull/1014) [BUGFIX] L'initialisation du statut de la session à leur création ne fonctionnait pas (PC-112)
- [#1010](https://github.com/1024pix/pix/pull/1010) [BUGFIX] Requêter le détail d'une compétence avec un mauvais identifiant provoque désormais une erreur 404 plutôt que 500.
- [#1008](https://github.com/1024pix/pix/pull/1008) [BUGFIX] Deux QROCs qui se suivent avec un même input conservent la réponse précédente

## v2.108.0 (28/01/2020)

- [#1002](https://github.com/1024pix/pix/pull/1002) [FEATURE] Afficher un message d'information dans Pix Orga lorsqu'un utilisateur clique sur une invitation déjà acceptée (PO-276)
- [#988](https://github.com/1024pix/pix/pull/988) [FEATURE] Pix+ - Ajout et prise en compte de l'origine (Pix ou hors Pix) des compétences (PF-1047)
- [#984](https://github.com/1024pix/pix/pull/984) [FEATURE] Déplacer les couleurs de domaines dans le référentiel (PF-1046).
- [#979](https://github.com/1024pix/pix/pull/979) [FEATURE] Renommer examinerComment en examinerGlobalComment (PA-102)
- [#1007](https://github.com/1024pix/pix/pull/1007) [BUGFIX] Correction d'une erreur Redis au démarrage de l'API.
- [#1004](https://github.com/1024pix/pix/pull/1004) [BUGFIX] Probleme de validation des QROCM sous IE (PF-1055).
- [#983](https://github.com/1024pix/pix/pull/983) [BUGFIX] Ne pas permettre le click multiple sur les boutons de soumission de formulaire (PF-1043).
- [#1005](https://github.com/1024pix/pix/pull/1005) [TECH] Les tests de MonPix sur CircleCI se déclenchent 3 fois complètement en parallèle
- [#1003](https://github.com/1024pix/pix/pull/1003) [TECH] Amélioration de la gestion des types BIG_INTEGER dans PostgreSQL.
- [#976](https://github.com/1024pix/pix/pull/976) [TECH] Passage de PixCertif vers Ember Octane (3.15)
- [#1000](https://github.com/1024pix/pix/pull/1000) Changer le statut de l'ADR n°6 pour la 1000ème.

## v2.107.0 (23/01/2020)

- [#960](https://github.com/1024pix/pix/pull/960) [FEATURE] Ajouter un candidat à la liste des candidats d'une session (PC-71)
- [#993](https://github.com/1024pix/pix/pull/993) [TECH] Supprimer les logs non utiles
- [#997](https://github.com/1024pix/pix/pull/997) Ajout de Sendinblue en tant que fournisseur d'emailing (PF-972).

## v2.106.0 (23/01/2020)

- [#974](https://github.com/1024pix/pix/pull/974) [FEATURE] Actualiser le design des embed (1/2) (PF-563).
- [#986](https://github.com/1024pix/pix/pull/986) [FEATURE] Placer le focus sur l'input suivante sur la page de démarrage d'une session de certification. (PF-903).
- [#982](https://github.com/1024pix/pix/pull/982) [BUGFIX] Corriger l'affichage d'un bouton de mon-pix sous Safari. (PF-1042)
- [#980](https://github.com/1024pix/pix/pull/980) [TECH] Prise en compte des derniers retours de la PR #913 (prereconciliation) (PF-1038).
- [#970](https://github.com/1024pix/pix/pull/970) [FEATURE] Homogénéiser le comportement de cloture des notifications de succès mobile et desktop (PF-899).

## v2.105.0 (21/01/2020)

- [#966](https://github.com/1024pix/pix/pull/966) [FEATURE] Ajout d'une cellule "N° de session" au PV de session (PC-101).
- [#962](https://github.com/1024pix/pix/pull/962) [FEATURE] Changer le label "commentaire" en "signalement" (PC-102).
- [#975](https://github.com/1024pix/pix/pull/975) [BUGFIX] Design page finalisation session KO (pc-105).
- [#910](https://github.com/1024pix/pix/pull/910) [TECH] utiliser un Airtable minimal pour nos tests e2e (Cypress).
- [#971](https://github.com/1024pix/pix/pull/971) [TECH] Supprime les mises à jour des branches preview et maths.
- [#922](https://github.com/1024pix/pix/pull/922) [PERF] Ajout d'un cache en mémoire et distribué (PF-969).

## v2.104.0 (16/01/2020)

- [#973](https://github.com/1024pix/pix/pull/973) [FEATURE] Créer un compte et l'associer à un élève lors de l'accès à une campagne restreinte (PF-966).

## v2.103.0 (16/01/2020)

- [#961](https://github.com/1024pix/pix/pull/961) [FEATURE] Afficher le nom d'utilisateur dans le menu utilisateur (PF-1022)
- [#967](https://github.com/1024pix/pix/pull/967) [FEATURE] Modification du lien de la page de résultat d'une démo d'évaluation (PF-1031)
- [#936](https://github.com/1024pix/pix/pull/936) [FEATURE] Ré-import du fichier SIECLE (PO-219)
- [#963](https://github.com/1024pix/pix/pull/963) [FEATURE] Amélioration du message de la page d'erreur (PF-1023)
- [#933](https://github.com/1024pix/pix/pull/933) [FEATURE] Indiquer à l'utilisateur qu'il a déjà répondu (PF-749).

## v2.102.0 (13/01/2020)

- [#955](https://github.com/1024pix/pix/pull/955) [TECH] Mettre à jour node en v12.14.1 et npm en v6.13.4 (LTS) (PF-1009).

## v2.101.0 (13/01/2020)

- [#968](https://github.com/1024pix/pix/pull/968) [BUGFIX] Le code d'accès à la session était forcé en majuscules seulement à l'affichage, mais pas lors de l'envoi du formulaire (PF-1032)
- [#964](https://github.com/1024pix/pix/pull/964) [BUGFIX] Echec du déploiement des seeds en RA (PF-1028)
- [#956](https://github.com/1024pix/pix/pull/956) [TECH] Retrait du code lié à la création de session via POSTMAN (PF-1025)
- [#932](https://github.com/1024pix/pix/pull/932) [TECH] Retirer les colonnes users liés à la migration du profile (PF-1010).
- [#944](https://github.com/1024pix/pix/pull/944) [A11Y] Ajouter des titres aux pages (PF-655)
- [#953](https://github.com/1024pix/pix/pull/953) [A11Y] Ajouter des attributs ALT aux images (PF-669).

## v2.100.0 (09/01/2020)

- [#954](https://github.com/1024pix/pix/pull/954) [FEATURE] Afficher une phrase de contexte (SCO) en haut de la double mire de connexion (PF-992).
- [#952](https://github.com/1024pix/pix/pull/952) [FEATURE] Script de migration permettant d'invalider les CGU pour les utilisateurs provenant du GAR (PF-821).
- [#948](https://github.com/1024pix/pix/pull/948) [FEATURE] Non validation des CGU lors de la création d'un utilisateur provenant du GAR (PF-820).
- [#957](https://github.com/1024pix/pix/pull/957) [TECH] Corriger `UserCompetence.hasEnoughChallenges()` (PF-1026).
- [#917](https://github.com/1024pix/pix/pull/917) [TECH] Modifier/simplifier l'usage de userRepository.get() (PF-1008).

## v2.99.0 (09/01/2020)

- [#901](https://github.com/1024pix/pix/pull/901) [FEATURE] Toujours poser la même épreuve au sein d'une évaluation (PF-959).
- [#945](https://github.com/1024pix/pix/pull/945) [FEATURE] Ajouter la colonne "Statut" à la liste des sessions de Certif (PC-96).
- [#947](https://github.com/1024pix/pix/pull/947) [FEATURE] Forcer la mise en majuscule du code d'accès à la session (PF-885)
- [#950](https://github.com/1024pix/pix/pull/950) [BUGFIX] Modifier l'affichage du bouton "Connectez-vous" afin qu'il n'apparaisse pas sur deux lignes (PF-1006)
- [#949](https://github.com/1024pix/pix/pull/949) [BUGFIX] Rendre le champ e-mail obligatoire lors d'une invitation (PO-319).
- [#935](https://github.com/1024pix/pix/pull/935) [BUGFIX] Gestion de deux mêmes types de challenge à la suite (PF-828)
- [#946](https://github.com/1024pix/pix/pull/946) [TECH] Tentative d'amélioration du temps pris par les tests auto API
- [#940](https://github.com/1024pix/pix/pull/940) [TECH] Mise à jour d'Ember vers 3.14 sur PixCertif + dépendances (PC-100)

## v2.98.0 (03/01/2020)

- [#942](https://github.com/1024pix/pix/pull/942) [FEATURE] Cacher le bouton de finalisation de session tant qu'il n'existe pas au moins un candidat lié (PC-97)
- [#912](https://github.com/1024pix/pix/pull/912) [FEATURE] Ajout d'une page de connexion/inscription après avoir renseigné un code parcours (PF-942).
- [#934](https://github.com/1024pix/pix/pull/934) [FEATURE] Pouvoir se connecter avec un identifiant (PF-982).
- [#909](https://github.com/1024pix/pix/pull/909) [FEATURE] Ajout des commentaires de fin de test sur les certification-candidates. (PC-84)
- [#924](https://github.com/1024pix/pix/pull/924) [TECH] Ajouter la preResponse dans HttpTestServer

## v2.97.0 (26/12/2019)

- [#926](https://github.com/1024pix/pix/pull/926) [FEATURE] Ajout noms candidats non réconciliés sur la popup PV session (PA-131)
- [#905](https://github.com/1024pix/pix/pull/905) [FEATURE] Mise à jour du PV de session V1.2 (PC-94)
- [#928](https://github.com/1024pix/pix/pull/928) [FEATURE] Inversion des champs "Nom" et "Prénom" dans page permettant de rejoindre une Orga via invitation (PO-295)
- [#937](https://github.com/1024pix/pix/pull/937) [BUGFIX] Date dépassée dans le test d'acceptance de la création de session
- [#921](https://github.com/1024pix/pix/pull/921) [BUGFIX] Correction de l'erreur 500 quand la date de naissance est hors limite lors de la réconciliation en certification (PF-984)
- [#902](https://github.com/1024pix/pix/pull/902) [TECH] Ajout d'un cache de second niveau au niveau des Datasources.
- [#930](https://github.com/1024pix/pix/pull/930) [TECH] Mise à jour de PixApp en Ember 3.10
- [#916](https://github.com/1024pix/pix/pull/916) [TECH] Utiliser le pré handler d'autorisation de session pour la route PATCH sessions/:id
- [#931](https://github.com/1024pix/pix/pull/931) [TECH] Suppression du code de la modale pour mobile.

## v2.96.0 (20/12/2019)

- [#927](https://github.com/1024pix/pix/pull/927) [FEATURE] Améliorer les performances de l'export CSV (PO-296).
- [#915](https://github.com/1024pix/pix/pull/915) [FEATURE] Mettre en place un système de notifications sur Pix Orga (PO-236).
- [#918](https://github.com/1024pix/pix/pull/918) [FEATURE] Suppression des espaces inutiles (e-mail, prénom et nom) lors des connexion, inscription et changement de mdp (PF-847).
- [#904](https://github.com/1024pix/pix/pull/904) [FEATURE] Contextualiser les cartes de compétences (PF-770).
- [#908](https://github.com/1024pix/pix/pull/908) [FEATURE] Ne pas prendre en compte les caractères en trop lors de la réconciliation (PF-935).
- [#914](https://github.com/1024pix/pix/pull/914) [BUGFIX] Limiter le bug de multiples réponses à un même couple challengeId/assessmentId (PF-964)
- [#898](https://github.com/1024pix/pix/pull/898) [TECH] Préparation à l'ajout d'un cache de second niveau pour les objets Airtable Datasources.

## v2.95.0 (17/12/2019)

- [#885](https://github.com/1024pix/pix/pull/885) [FEATURE] ETQ PixOrga Admin, je veux pouvoir changer le rôle des users de mon équipe (PO-215).
- [#899](https://github.com/1024pix/pix/pull/899) [FEATURE] Permettre aux utilisateurs non connectés via le GAR de saisir leur nom et prénom lors de la réconciliation (PF-886).
- [#919](https://github.com/1024pix/pix/pull/919) [BUGFIX] Enlever le retour à la ligne après les inputs dans la zone de réponse
- [#913](https://github.com/1024pix/pix/pull/913) [BUGFIX] Ne plus afficher d'ancients examinerComment dans le champs de text prévu à cet effet. (PC-93)
- [#911](https://github.com/1024pix/pix/pull/911) [TECH] BSR - Suppression de l'usage déprécié du ChallengeId lors de l'appel à la route /assessments/:id/next.
- [#865](https://github.com/1024pix/pix/pull/865) [TECH] MaJ des dépendances de l'API (PC-89)
- [#896](https://github.com/1024pix/pix/pull/896) [TECH] Ajout d'un prehandler de vérification d'accès à une session (PC-92)

## v2.94.0 (12/12/2019)

- [#903](https://github.com/1024pix/pix/pull/903) [FEATURE] Modification du nom de fichier de résultats de la session dans PixAdmin (PA-130)
- [#819](https://github.com/1024pix/pix/pull/819) [FEATURE] Empêcher les élèves réconciliés d'accéder à une campagne d'une autre organisation (PF-905).
- [#906](https://github.com/1024pix/pix/pull/906) [BUGFIX] Aligner les règles css sur tablettes avec celles sur desktop (PF-978).
- [#897](https://github.com/1024pix/pix/pull/897) [BUGFIX] Empêcher l'erreur d'unicité des CampaignParticipation d'arriver jusqu'en base de données (PO-299).
- [#797](https://github.com/1024pix/pix/pull/797) [TECH] Corrections de design (PF-896).
- [#825](https://github.com/1024pix/pix/pull/825) [TECH] Ajuster le design du menu de mon-pix (PF-925)

## v2.93.0 (09/12/2019)

- [#895](https://github.com/1024pix/pix/pull/895) [FEATURE] Affichage du commentaire global de la session dans la page de détails de session dans PixAdmin (PA-121)
- [#893](https://github.com/1024pix/pix/pull/893) [TECH] Mise à jour de HapiJS et de JoiJS

## v2.92.0 (06/12/2019)

- [#813](https://github.com/1024pix/pix/pull/813) [FEATURE] Afficher les scorecards d'une même compétence sur la même ligne sur mobile (PF-507).
- [#889](https://github.com/1024pix/pix/pull/889) [FEATURE] Retirer le bold des labels des encadrés réponses (PF-963).
- [#820](https://github.com/1024pix/pix/pull/820) [FEATURE] Amélioration des performances de la récupération des résultats collectifs (PO-298).
- [#874](https://github.com/1024pix/pix/pull/874) [FEATURE] Ajouter une étape d'ajout de commentaire global lors de la finalisation de la session (PC-86).
- [#884](https://github.com/1024pix/pix/pull/884) [FEATURE] Ajout des colonnes 'externalId' et 'type' dans la table 'certification-centers' (PF-944).
- [#872](https://github.com/1024pix/pix/pull/872) [FEATURE] Affichage du nombre de certifications non validées sur la page de détails d'une session PixAdmin (PA-126).
- [#888](https://github.com/1024pix/pix/pull/888) [BUGFIX] Corrige le message de profil non certifiable en cas de coupure réseau (PF-962).
- [#854](https://github.com/1024pix/pix/pull/854) [BUGFIX] Les certifications non 'validated' ne remontaient plus dans le fichier pour le jury (PA-125).
- [#890](https://github.com/1024pix/pix/pull/890) [BUGFIX] Le payload contenant les certifications pour PixAdmin pouvait avoir comme id celui de son assessment-result (PA-129).
- [#880](https://github.com/1024pix/pix/pull/880) [BUGFIX] Amélioration du temps de rendu de la liste utilisateurs sur Pix Admin (PA-127).
- [#883](https://github.com/1024pix/pix/pull/883) [BUGFIX] Ne pas prendre en compte les espaces et retour à la ligne inutile (PF-953).
- [#891](https://github.com/1024pix/pix/pull/891) [TECH] Mise en place de choix aléatoire des questions à poser lors d'un test de certification.

## v2.91.1 (03/12/2019)

- [#887](https://github.com/1024pix/pix/pull/887) [FEATURE] Permettre à un élève d'être importé dans plusieurs établissements scolaires (PO-293).

## v2.91.0 (03/12/2019)

- [#869](https://github.com/1024pix/pix/pull/869) [FEATURE] Pouvoir inviter plusieurs utilisateurs en une seule fois (PO-277).
- [#834](https://github.com/1024pix/pix/pull/834) [FEATURE] Rendre le champs QROC configurable (PF-839).
- [#830](https://github.com/1024pix/pix/pull/830) [FEATURE] Gérer la distance d'édition lors de la réconciliation d'un user avec un student (PF-851).
- [#849](https://github.com/1024pix/pix/pull/849) [FEATURE] Ajouter une étape contenant un lien vers le formbuilder lors de la finalisation de la session (PC-85)
- [#873](https://github.com/1024pix/pix/pull/873) [BUGFIX] Rendre l'instruction des challenges non cliquable (PF-956).
- [#862](https://github.com/1024pix/pix/pull/862) [BUGFIX] Vérifier que le code d'accès correspond à la session de certif (PF 931)
- [#877](https://github.com/1024pix/pix/pull/877) [TECH] Corrige un test qui échoue au hasard
- [#876](https://github.com/1024pix/pix/pull/876) [TECH] Suppression des objets Airtable Datasource intermédiaires.
- [#824](https://github.com/1024pix/pix/pull/824) [TECH] Performance de la route next-challenge (PF-732).
- [#882](https://github.com/1024pix/pix/pull/882) [TECH] Ne pas faire les appels vers matomo dans les tests E2E.
- [#864](https://github.com/1024pix/pix/pull/864) [TECH] Supprimer le dossier /plop

## v2.90.0 (28/11/2019)

- [#855](https://github.com/1024pix/pix/pull/855) [FEATURE] Afficher une zone grise à la place de l'image d'un challenge (PF-936).
- [#859](https://github.com/1024pix/pix/pull/859) [FEATURE] Modification vocabulaire sur la page inscription (PF-940).
- [#870](https://github.com/1024pix/pix/pull/870) [BUGFIX] Utiliser overflow-wrap au lieu de word-break.
- [#860](https://github.com/1024pix/pix/pull/860) [BUGFIX] Ajouter des line-break dans la consigne des challenges (PF-939).
- [#863](https://github.com/1024pix/pix/pull/863) [BUGFIX] Eviter les erreurs 500 lors du check de date de naissance quand un candidat essaie de rejoindre une session de certification (PF-941)

## v2.89.0 (27/11/2019)

- [#850](https://github.com/1024pix/pix/pull/850) [FEATURE] Affichage du statut de la session dans PixAdmin (PA-119).
- [#857](https://github.com/1024pix/pix/pull/857) [BUGFIX] Optimisation des appels de récupération des organizations dans les script de déploiement SCO (PO-281).

## v2.88.0 (26/11/2019)

- [#838](https://github.com/1024pix/pix/pull/838) [FEATURE] Dupliquer le bouton d'export des résultats pour les prescripteurs sur la page d'info de session dans Pix Admin (PA-118).
- [#847](https://github.com/1024pix/pix/pull/847) [FEATURE] Interdire l'import de candidats dans PixCertif lorsqu'il existe au moins un lien entre un candidat et un utilisateur Pix (PC-83).
- [#835](https://github.com/1024pix/pix/pull/835) [BUGFIX] Ignorer les espaces autour des noms des candidats de certification.
- [#827](https://github.com/1024pix/pix/pull/827) [BUGFIX] Une sur-erreur survient en cas de problème dans la méthode getCourse().
- [#852](https://github.com/1024pix/pix/pull/852) [TECH] Loguer toutes les erreurs sortant des contrôleurs API.
- [#846](https://github.com/1024pix/pix/pull/846) [A11Y] Ajouter ALT sur les images dans les challenges.

## v2.87.0 (21/11/2019)

- [#848](https://github.com/1024pix/pix/pull/848) [FEATURE] Modification de certains textes dans la page de lancement de test de certification (PF-928).
- [#833](https://github.com/1024pix/pix/pull/833) [FEATURE] Afficher le rôle des membres dans Pix Orga (PO-210).
- [#844](https://github.com/1024pix/pix/pull/844) [BUGFIX] Afficher les prochaines notifications de succès après une fermeture (PF-913).
- [#839](https://github.com/1024pix/pix/pull/839) [BUGFIX] Supprimer les barres de scroll affichées en trop sur Pix Orga (PO-271).
- [#836](https://github.com/1024pix/pix/pull/836) [BUGFIX] L'identifiant externe n'était pas recopié depuis les données candidat vers le certification course à la création de celui ci (PA-120).
- [#821](https://github.com/1024pix/pix/pull/821) [BUGFIX] Le compteur de questions en certification affiche NaN en cas de reprise (PF-909).
- [#742](https://github.com/1024pix/pix/pull/742) [TECH] Rétablir le fonctionnement mode watch des tests auto (PF-924).

## v2.86.0 (18/11/2019)

- [#831](https://github.com/1024pix/pix/pull/831) [FEATURE] Finaliser une session (PC-65).
- [#832](https://github.com/1024pix/pix/pull/832) [FEATURE] Ne pas importer les élèves ayant une date de sortie dans le fichier SIECLE (PO-278).
- [#785](https://github.com/1024pix/pix/pull/785) [A11Y] Page inscription (PF-888).

## v2.85.4 (15/11/2019)

- [#843](https://github.com/1024pix/pix/pull/843) [BUGFIX] Problème d'ajout des commits dans les versions de Sentry.

## v2.85.3 (15/11/2019)

- [#842](https://github.com/1024pix/pix/pull/842) [BUGFIX] Problème d'ajout des commits dans les versions de Sentry.

## v2.85.2 (15/11/2019)

- [#841](https://github.com/1024pix/pix/pull/841) [BUGFIX] Problème du nom de version de sentry.

## v2.85.1 (15/11/2019)

- [#840](https://github.com/1024pix/pix/pull/840) [BUGFIX] Patch sentry-cli releases dans le script de release publish.

## v2.85.0 (15/11/2019)

- [#823](https://github.com/1024pix/pix/pull/823) [FEATURE] Remplacer le rôle OWNER par ADMIN (PA-106).
- [#829](https://github.com/1024pix/pix/pull/829) [BUGFIX] Il arrive que le seeding soit en échec à cause d'une violation de contrainte d'unicité sur les emails de la table users
- [#800](https://github.com/1024pix/pix/pull/800) [TECH] Supprime Husky et le crochet d'avant commit (PF-922)
- [#817](https://github.com/1024pix/pix/pull/817) [TECH] Supprimer un appel superflu sur la récupérations des utilisateurs dans Pix Admin (PA-115).
- [#760](https://github.com/1024pix/pix/pull/760) [TECH] Ajout de tests e2e avec Cypress sur Pix Orga (PO-280)
- [#816](https://github.com/1024pix/pix/pull/816) [TECH] Remplacer les vrais emails générés par de faux en @example.net (PF-919).
- [#811](https://github.com/1024pix/pix/pull/811) [TECH] Amélioration de l'intégration de Sentry dans l'API (PF-921)

## v2.84.0 (13/11/2019)

- [#822](https://github.com/1024pix/pix/pull/822) [FEATURE] Le champ Date de naissance doit tolérer le format apparemment commun 'DD/MM/YYYY (PC-32)
- [#815](https://github.com/1024pix/pix/pull/815) [FEATURE] Ajouter un loader pendant le calcul des résultats collectifs (PO-275).
- [#818](https://github.com/1024pix/pix/pull/818) [FEATURE] Remplacement du mot campagne par parcours dans un message d'erreur (PF-914).
- [#809](https://github.com/1024pix/pix/pull/809) [FEATURE] Choisir une épreuve aléatoirement par acquis puis par challenge (PF-900).
- [#814](https://github.com/1024pix/pix/pull/814) [BUGFIX] Une page oups! s'affichait lorsque l'utilisateur souhaitait voir ses certifications
- [#796](https://github.com/1024pix/pix/pull/796) [TECH] Fermer proprement les connexions à PostgreSQL lors de l'arrêt (PF-923)
- [#747](https://github.com/1024pix/pix/pull/747) [TECH] Normalisation de la manipulation du type DATE (date seule…

## v2.83.0 (07/11/2019)

- [#774](https://github.com/1024pix/pix/pull/774) [FEATURE] Afficher les tutoriels associés à une compétence (PF-587).
- [#808](https://github.com/1024pix/pix/pull/808) [BUGFIX] Ajout d'un état "loading" quand on clique sur le bouton de création de son compte (PF-904).
- [#804](https://github.com/1024pix/pix/pull/804) [TECH] Corriger le test d'acceptance de POST /answers.

## v2.82.0 (05/11/2019)

- [#753](https://github.com/1024pix/pix/pull/753) [FEATURE] Lier un utilisateur participant à une session de certification à un candidat inscrit au préalable à cette même session (PF-383)

## v2.81.0 (04/11/2019)

- [#802](https://github.com/1024pix/pix/pull/802) [FEATURE] Page de reconciliation au lancement d'une campagne (PF-817).
- [#805](https://github.com/1024pix/pix/pull/805) [FEATURE] Script d'ajout de profils cible aux organizations (PF-891).
- [#807](https://github.com/1024pix/pix/pull/807) [FEATURE] Script d'envoie des invitations SCO (PF-862).
- [#810](https://github.com/1024pix/pix/pull/810) [FEATURE] Ajout d'un script déclenchant le déploiement SCO (PF-862-2).
- [#803](https://github.com/1024pix/pix/pull/803) [TECH] Corrige le TU de GET /api/organizations/{id}/invitations.

## v2.80.0 (31/10/2019)

- [#770](https://github.com/1024pix/pix/pull/770) [FEATURE] Script d'import / update des organisations (PF-764).
- [#801](https://github.com/1024pix/pix/pull/801) [BUGFIX] Problème de calcul de passage de niveau pour les succès (PF-897).

## v2.79.0 (31/10/2019)

- [#798](https://github.com/1024pix/pix/pull/798) [FEATURE] Ajout d'un bouton de navigation sur Pix Orga (PO-252).
- [#776](https://github.com/1024pix/pix/pull/776) [FEATURE] Afficher quand on gagne un niveau sur une compétence. (PF-487)

## v2.78.0 (30/10/2019)

- [#794](https://github.com/1024pix/pix/pull/794) [FEATURE] Afficher le code d'accès de session sur 1 seule ligne (PC-89).
- [#792](https://github.com/1024pix/pix/pull/792) [FEATURE] Supprimer l'encadré d'information du nouveau profil (PF-887).
- [#787](https://github.com/1024pix/pix/pull/787) [FEATURE] Afficher une bannière bravo quand l'utilisateur est certifiable (PF-858).
- [#795](https://github.com/1024pix/pix/pull/795) [BUGFIX] User connecté /index redirigé vers /campagnes (PO-264).
- [#793](https://github.com/1024pix/pix/pull/793) [BUGFIX] Cast caractères compliqués de l'export CSV campagnes (PO-266).

## v2.77.0 (29/10/2019)

- [#759](https://github.com/1024pix/pix/pull/759) [FEATURE] Ajout d'une nouvelle mire de connexion et inscription dans Pix Orga pour les utilisateurs invités (PO-19).
- [#784](https://github.com/1024pix/pix/pull/784) [BUGFIX] Télécharger les résultats CSV de grosses campagne (PO-257).

## v2.76.0 (29/10/2019)

- [#791](https://github.com/1024pix/pix/pull/791) [FEATURE] Modifier l'image du badge Pix Emploi (PF-893).
- [#782](https://github.com/1024pix/pix/pull/782) [FEATURE] Ajout d'une bannière pour staging (PF-879).

## v2.75.0 (28/10/2019)

- [#780](https://github.com/1024pix/pix/pull/780) [FEATURE] Ne pas afficher les profils cibles archivés (PO-254).
- [#757](https://github.com/1024pix/pix/pull/757) [FEATURE] Affichage d'un badge pour des profils cibles (PF-779).
- [#790](https://github.com/1024pix/pix/pull/790) [BUGFIX] Correction d'une régression sur IE de la page CGU sur Pix Orga.
- [#788](https://github.com/1024pix/pix/pull/788) [BUGFIX] Supprime le style par défaut sur les chalmps en erreur (PF-812).
- [#786](https://github.com/1024pix/pix/pull/786) [BUGFIX] Ajout d'une police par défaut pour les polices Roboto et Open-Sans sur Pix Orga (PO-258).
- [#781](https://github.com/1024pix/pix/pull/781) [BUGFIX] Correction du style pour la page compétence sous IE (PF-860).
- [#789](https://github.com/1024pix/pix/pull/789) [BIUGFIX] Problème de background sur les pages de connexion et CGU (PO-206).

## v2.74.1 (23/10/2019)

- [#775](https://github.com/1024pix/pix/pull/775) [FEATURE] Annule le téléch. des résultats longs d'une campagne (PO-255).
- [#772](https://github.com/1024pix/pix/pull/772) [BUGFIX] Affiche correctement la progression (PF-873).

## v2.74.0 (18/10/2019)

- [#779](https://github.com/1024pix/pix/pull/779) [FEATURE] Ajouter le details des erreurs sur la page "Oups" (PF-882).
- [#756](https://github.com/1024pix/pix/pull/756) [FEATURE] Lister les invitations sur la page équipe (PO-239).
- [#750](https://github.com/1024pix/pix/pull/750) [FEATURE] Indiquer à l'utilisateur s'il est certifiable (PF-751).
- [#778](https://github.com/1024pix/pix/pull/778) [BUGFIX] Les utilisateurs étaient déconnectés intempestivement (PF-870).
- [#777](https://github.com/1024pix/pix/pull/777) [BUGFIX] Initialiser les UserCompetences sans skills ni challenges.
- [#773](https://github.com/1024pix/pix/pull/773) [TECH] Variabiliser le routage des apps front pour le changement de région Scalingo.
- [#762](https://github.com/1024pix/pix/pull/762) [DOC] Lien vers les teams Pix cassé dans le README du repo Pix.

## v2.73.0 (16/10/2019)

- [#764](https://github.com/1024pix/pix/pull/764) [FEATURE] Envoyer un e-mail pour inviter un utilisateur Pix à rejoindre une organisation (PO-244).
- [#730](https://github.com/1024pix/pix/pull/730) [FEATURE] Nouveau design pour les challenges. (PF-794).
- [#754](https://github.com/1024pix/pix/pull/754) [FEATURE] Limiter la taille des messages de feedbacks (PF-864).
- [#739](https://github.com/1024pix/pix/pull/739) [FEATURE] Modification du design de la page de lancement de test de certification (PF-849).
- [#758](https://github.com/1024pix/pix/pull/758) [FEATURE] Envoyer un e-mail pour inviter un utilisateur Pix à rejoindre une organisation (PO-244).
- [#752](https://github.com/1024pix/pix/pull/752) [BUGFIX] Des réponses trop longues envoyées dans les signalements (PF-865).

## v2.72.0 (11/10/2019)

- [#751](https://github.com/1024pix/pix/pull/751) [FEATURE] Changer un message d'erreur d'import SIECLE (PO-247).
- [#735](https://github.com/1024pix/pix/pull/735) [FEATURE] Restreindre les campagnes aux étudiants d'une organisation (PF-816).
- [#713](https://github.com/1024pix/pix/pull/713) [TECH] S'assurer que les ids sont toujours traités en tant qu'entier.
- [#749](https://github.com/1024pix/pix/pull/749) [TECH] Mise en place d'un tunnel pour démarrer la certification (PF-382).
- [#746](https://github.com/1024pix/pix/pull/746) [TECH] Réduire la taille des données sorties de Airtable (PF-729).
- [#744](https://github.com/1024pix/pix/pull/744) [TECH] Mise à jour des scripts e2e et de la documentation associée.
- [#755](https://github.com/1024pix/pix/pull/755) [DOC] Supprime Test.md et déplace `transitionTo` dans Ember.md.
- [#748](https://github.com/1024pix/pix/pull/748) [BSR] Un fichier de test était vide et donc inutile.

## v2.71.0 (07/10/2019)

- [#733](https://github.com/1024pix/pix/pull/733) [FEATURE] Modifier la version du PV de session (PC-64).
- [#715](https://github.com/1024pix/pix/pull/715) [FEATURE] Création d'une invitation pour rejoindre une Organisation (PO-238).
- [#737](https://github.com/1024pix/pix/pull/737) [TECH] Appliquer le pattern datasource sur course-repository (PF-194).
- [#718](https://github.com/1024pix/pix/pull/718) [TECH] Réduire la taille des données sorties de Airtable (PF-729).
- [#745](https://github.com/1024pix/pix/pull/745) Revert [TECH] Réduire la taille des données sorties de Airtable (PF-729).

## v2.70.0 (03/10/2019)

- [#741](https://github.com/1024pix/pix/pull/741) [BUGFIX] Polir le titre des checkpoints (PF-823).
- [#736](https://github.com/1024pix/pix/pull/736) [BUGFIX] Permettre de nouveau l'export des snapshots - profil v1 (PF-844).
- [#734](https://github.com/1024pix/pix/pull/734) [BUGFIX] Optimise le chargement de la bannière de reprise de campagne (PF-840).
- [#740](https://github.com/1024pix/pix/pull/740) [BUGFIX] Pouvoir passer une démo à nouveau
- [#731](https://github.com/1024pix/pix/pull/731) [BUGFIX] Mise à jour via campagnes des scorecards remises à zéro (PF-841).
- [#732](https://github.com/1024pix/pix/pull/732) [BUGFIX] Corrige une typo dans la vérification cgu de Pix Certif (PC-75)
- [#725](https://github.com/1024pix/pix/pull/725) [TECH] Diviser le PATCH /users/id (PF-831).
- [#738](https://github.com/1024pix/pix/pull/738) [TECH] mon-pix: suppression du composant `course-banner`
- [#728](https://github.com/1024pix/pix/pull/728) [TECH] Harmonisation de l'import du PV de session dans PixAdmin avec l'existant (PA-112)

## v2.69.0 (30/09/2019)

- [#724](https://github.com/1024pix/pix/pull/724) [FEATURE] Mise à jour des organisations en ajoutant un identifiant externe et le département à l'aide d'un script (PF-778).
- [#729](https://github.com/1024pix/pix/pull/729) [FEATURE] Modification du logo dans Pix Orga (PO-245)
- [#723](https://github.com/1024pix/pix/pull/723) [FEATURE] Ajout de la progression par campagne (PF-835).

## v2.68.0 (27/09/2019)

- [#720](https://github.com/1024pix/pix/pull/720) [FEATURE] Import & affichage de candidats à une session de certification (PC-61-2)(PC-49)
- [#727](https://github.com/1024pix/pix/pull/727) [BUGFIX] Dysfonctionnement du nettoyage journalier des caches (PF-836)
- [#726](https://github.com/1024pix/pix/pull/726) [TECH] Retrait de la fonctionnalité plus utilisée d'import CSV dans PixAdmin (PA-111)

## v2.67.0 (24/09/2019)

- [#710](https://github.com/1024pix/pix/pull/710) [FEATURE] Ajout du département (code) aux Organisations et affichage dans Pix Admin (PA-105).
- [#698](https://github.com/1024pix/pix/pull/698) [TECH] Redefinir la relation entre un assessment et une participation (PF-750-1).

## v2.66.1 (23/09/2019)

- [#721](https://github.com/1024pix/pix/pull/721) [BUGFIX] L'assessment considéré par un certification course pouvait ne pas être le même si il en existe plusieurs (PA-110)
- [#722](https://github.com/1024pix/pix/pull/722) [BUGFIX] Correction du champ de saisie du mot de passe à la connexion pour Pix Orga et Pix Certif.
- [#685](https://github.com/1024pix/pix/pull/685) [BUGFIX] Des candidats n'arrivaient pas à voir leurs certifications sur leur compte (dans user > 'Mes certifications') (PF-757)
- [#717](https://github.com/1024pix/pix/pull/717) [BUGFIX] Correction du bug de "page blanche" sur IE11 pour Pix Orga et Pix Certif.
- [#716](https://github.com/1024pix/pix/pull/716) [BUGFIX] Correction de l'apparition de bordures rouges pour les champs de saisie du formulaire de connexion pour Pix Orga et Pix Certif.
- [#712](https://github.com/1024pix/pix/pull/712) [TECH] Montée de version des dépendances du projet Pix Admin.
- [#661](https://github.com/1024pix/pix/pull/661) [TECH] Standardisation du paramétrage de l'API.
- [#709](https://github.com/1024pix/pix/pull/709) [TECH] Montée de version des dépendances du projet Pix Orga.
- [#711](https://github.com/1024pix/pix/pull/711) [TECH] Montée de version des dépendances du projet Pix Certif.
- [#705](https://github.com/1024pix/pix/pull/705) [TECH] Suppression de la route POST /api/authentifications (PF-720).

## v2.66.0 (17/09/2019)

- [#702](https://github.com/1024pix/pix/pull/702) [FEATURE] Accéder à un parcours prescrit avec l'identifiant externe dans l'URL (PF-824).
- [#703](https://github.com/1024pix/pix/pull/703) [BUGFIX]  Corrige l'affichage des certifications d'une session (PA-109)
- [#707](https://github.com/1024pix/pix/pull/707) [TECH] Éviter les plantages de Redis causés par une accumulation de requêtes
- [#701](https://github.com/1024pix/pix/pull/701) [TECH] Refactorisation et nettoyage du code de création d'assessment-results.

## v2.65.0 (16/09/2019)

- [#664](https://github.com/1024pix/pix/pull/664) [FEATURE] Import des élèves via un fichier XML (SIECLE) dans Pix Orga (PO-217).
- [#694](https://github.com/1024pix/pix/pull/694) [TECH] Mise à jour des dépendances de l'API.
- [#692](https://github.com/1024pix/pix/pull/692) [TECH] Changer le type des colonnes de BIGINT à INTEGER.

## v2.64.0 (12/09/2019)

- [#673](https://github.com/1024pix/pix/pull/673) [FEATURE] Rajouter la catégorisation aux signalements envoyés par les users (PF-782).
- [#697](https://github.com/1024pix/pix/pull/697) [FEATURE] Augmenter la liste de membre d'une organisation (PA-108).
- [#677](https://github.com/1024pix/pix/pull/677) [FEATURE] Afficher un warning lorsqu'une modification jury est illégale (PF-811).
- [#699](https://github.com/1024pix/pix/pull/699) [BUGFIX] Activer la pagination sur la page de membre (PA-108).
- [#700](https://github.com/1024pix/pix/pull/700) [BUGFIX] Lancer consécutivement deux campagnes avec demande ID (PF-825).
- [#653](https://github.com/1024pix/pix/pull/653) [TECH] Suppression des positionnements V1 (`PLACEMENT`) côté serveur.
- [#695](https://github.com/1024pix/pix/pull/695) [TECH] Refacto du hook pre-commit.

## v2.63.0 (09/09/2019)

- [#682](https://github.com/1024pix/pix/pull/682) [FEATURE] Offrir une navigation après le partage des résultats d'une campagne (PF-716).
- [#691](https://github.com/1024pix/pix/pull/691) [BUGFIX] Empêcher la création de plus d'un certification-course pour un même utilisateur dans une session (PF-814)
- [#679](https://github.com/1024pix/pix/pull/679) [BUGFIX] Problème de taille des icônes d'œil pour les champs mot de passe.
- [#693](https://github.com/1024pix/pix/pull/693) [BUGFIX] Empêche plusieurs tests API liés à answers d'échouer
- [#690](https://github.com/1024pix/pix/pull/690) [BUGFIX] Une migration de mise à jour de la table answers n'était pas bloquante
- [#619](https://github.com/1024pix/pix/pull/619) [TECH] Définir PostgreSQL comme système de BDD par défaut et unique pour les tests et le développement

## v2.62.0 (03/09/2019)

- [#686](https://github.com/1024pix/pix/pull/686) [BUGFIX] Corrige les seeds du profile de Pix Aile
- [#678](https://github.com/1024pix/pix/pull/678) [BUGFIX] Plusieurs assessments pouvaient être créés au lancement d'une session de certification (PF-747)
- [#684](https://github.com/1024pix/pix/pull/684) [TECH] Suppression des dernières références à coveralls et codeclimate dans le dossier mon-pix.
- [#660](https://github.com/1024pix/pix/pull/660) [TECH] Supprimer les dépendances inutilisées sur mon-pix.
- [#681](https://github.com/1024pix/pix/pull/681) [TECH] Normalisation de la structure des modules usecases
- [#680](https://github.com/1024pix/pix/pull/680) [TECH] Suppression de la classe SmartPlacementAnswer
- [#683](https://github.com/1024pix/pix/pull/683) [DOC] Supprimer la convention @exemplary

## v2.61.0 (28/08/2019)

- [#663](https://github.com/1024pix/pix/pull/663) [FEATURE] Plafonner le score et le niveau lors d'une certification (PF-773).
- [#675](https://github.com/1024pix/pix/pull/675) [FEATURE] Améliorer l'affichage des champs de formulaire (PF-114).
- [#672](https://github.com/1024pix/pix/pull/672) [FEATURE] Afficher une information RGPD lors de la création d'une Campagne avec Identifiant externe (PO-223).
- [#662](https://github.com/1024pix/pix/pull/662) [FEATURE] Modifier le format des mots de passe (PF-748).
- [#652](https://github.com/1024pix/pix/pull/652) [FEATURE] Possibilité d'afficher le mot de passe dans les formulaires (PF-116).
- [#671](https://github.com/1024pix/pix/pull/671) [BUGFIX] Problème quand l'utilisateur appuie sur la touche entrer après avoir rempli un formulaire d'authentification (PF-808).
- [#669](https://github.com/1024pix/pix/pull/669) [BUGFIX] Problème d'affichage de l'oeil lorsque l'utilisateur souhaite continuer d'écrire (PF-807).
- [#659](https://github.com/1024pix/pix/pull/659) [TECH] Refactoring du user-service
- [#665](https://github.com/1024pix/pix/pull/665) [TECH] Rendre l'utilisateur PixAile (seeds) certifiable
- [#656](https://github.com/1024pix/pix/pull/656) [TECH] Génération d'une importante quantité de candidats de certification dans les seeds
- [#654](https://github.com/1024pix/pix/pull/654) [DOC] Ajouter la notion de feature toggle dans la doc de l'API
- [#674](https://github.com/1024pix/pix/pull/674) [DOC] Ajout d'une ADR à propos du choix des langages, frameworks et technologies sur Pix.
- [#667](https://github.com/1024pix/pix/pull/667) [DOC] Ajout de l'ADR documentant le style d'architecture de la plateforme Pix.
- [#666](https://github.com/1024pix/pix/pull/666) [BSR] Le diable est dans les détails…

## v2.60.0 (21/08/2019)

- [#651](https://github.com/1024pix/pix/pull/651) [FEATURE] Empêcher de certifier un profil V1 (PC-67).
- [#630](https://github.com/1024pix/pix/pull/630) [FEATURE] Le membre d'un centre de certification veut pouvoir télécharger un PV de session contenant la liste des candidats inscrits à celle-ci (PC-61-1)
- [#650](https://github.com/1024pix/pix/pull/650) [FEATURE] Mettre à jour le texte sur la page d'inscription (PF-797).
- [#646](https://github.com/1024pix/pix/pull/646) [FEATURE] Obliger le code campagne à s'afficher sur une seule ligne (PO-222).
- [#657](https://github.com/1024pix/pix/pull/657) [BUGFIX] Corrige le format de date du PV de session (PC-70)
- [#655](https://github.com/1024pix/pix/pull/655) [BUGFIX] La page de résultats d'un parcours par compétence n'affiche pas le nombre de Pix.
- [#647](https://github.com/1024pix/pix/pull/647) [BUGFIX] Les liens vers les RAs ne s'affichent plus dans Github & Jira
- [#645](https://github.com/1024pix/pix/pull/645) [TECH] Suppression de V1 dans le back.
- [#648](https://github.com/1024pix/pix/pull/648) [TECH] Suppression de code lié à "isAdaptive".
- [#643](https://github.com/1024pix/pix/pull/643) [TECH] Suppression de V1 dans le front.
- [#640](https://github.com/1024pix/pix/pull/640) [TECH] Réécriture de certaines routes des campagnes.

## v2.59.0 (13/08/2019)

- [#628](https://github.com/1024pix/pix/pull/628) [FEATURE] Ajout du menu de navigation (PF-754).
- [#622](https://github.com/1024pix/pix/pull/622) [FEATURE] Afficher la liste des élèves dans PixOrga (PO-218).
- [#634](https://github.com/1024pix/pix/pull/634) [BUGFIX] Empêcher de poser des questions en trop en certification (PF-781)
- [#639](https://github.com/1024pix/pix/pull/639) [TECH] Associer l'affichage des liens de RA à la création des RA (PF-788)

## v2.58.2 (13/08/2019)

- [#644](https://github.com/1024pix/pix/pull/644) [BUGFIX] Répare les routes de réponses.
- [#642](https://github.com/1024pix/pix/pull/642) [TECH] Mise à jour de Cypress.
- [#638](https://github.com/1024pix/pix/pull/638) [TECH] Mise à jour de ember-mocha dans Pix App.
- (https://github.com/1024pix/pix/security/advisories/GHSA-ppw7-whcc-c7cj) [SECURITY] Sécurité des routes answers.

## v2.58.1 (08/08/2019)

- [#632](https://github.com/1024pix/pix/pull/632) [BUGFIX] Un utilisateur doit pouvoir accéder à son profil Pix via le GAR et ne pas être bloqué (PF-774).

## v2.58.0 (08/08/2019)

- [#641](https://github.com/1024pix/pix/pull/641) [FEATURE] Changement du hover du bouton pour fermer la bandeau d'information nouveau profil (PF-785).
- [#633](https://github.com/1024pix/pix/pull/633) [FEATURE] N'affiche pas les infos de nouveau profil pour les nouveaux utilisateurs. (PF-784)
- [#636](https://github.com/1024pix/pix/pull/636) [TECH] Correction du crash de Chrome 76 sur Mac pendant les tests front.
- [#637](https://github.com/1024pix/pix/pull/637) [TECH] Suppression de la route `/api/users/{id}/skills`

## v2.57.0 (07/08/2019)

- [#615](https://github.com/1024pix/pix/pull/615) [FEATURE] Afficher les bonnes réponses sur le checkpoint pour les questions de type qrocm-dep (PF-161).
- [#631](https://github.com/1024pix/pix/pull/631) [FEATURE] Affiche le didacticiel seulement une fois. (PF-701).
- [#625](https://github.com/1024pix/pix/pull/625) [TECH] Ajout d'un glossaire des variables d'environnement dans la documentation.

## v2.56.1 (31/07/2019)

- [#613](https://github.com/1024pix/pix/pull/613) [FEATURE] Recalculer le score des certifications V2 (PF-646).

## v2.56.0 (31/07/2019)

- [#614](https://github.com/1024pix/pix/pull/614) [FEATURE] Limiter visuellement le nombre de Pix maximum pouvant être gagnés actuellement (PF-767).
- [#624](https://github.com/1024pix/pix/pull/624) [BUGFIX] Problème d'affichage des détails d'une compétence sous IE (PF-775).
- [#531](https://github.com/1024pix/pix/pull/531) [TECH] Migration des données de V1 vers V2.
- [#623](https://github.com/1024pix/pix/pull/623) [TECH] Rendre les identifiants de templates Mailjet configurables.

## v2.55.0 (25/07/2019)

- [#621](https://github.com/1024pix/pix/pull/621) [FEATURE] Ajouter des identifiants externes aux Organisations. (PA-83)
- [#617](https://github.com/1024pix/pix/pull/617) [FEATURE] Uniformiser les styles des bannières et des panels sur Pix App (PF-768).

## v2.54.0 (23/07/2019)

- [#620](https://github.com/1024pix/pix/pull/620) [FEATURE] Optimisation graphique du bandeau de nouveau profil. (PF-772)
- [#609](https://github.com/1024pix/pix/pull/609) [FEATURE] Création de la page /campagnes permettant de rentrer un code Campagne (PF-639).
- [#610](https://github.com/1024pix/pix/pull/610) [FEATURE] Ajout d'un bloc de présentation du profil v2. (PF-745)
- [#611](https://github.com/1024pix/pix/pull/611) [FEATURE] Création des nouveaux comptes en profil v2 (PF-741).
- [#616](https://github.com/1024pix/pix/pull/616) [TECH] Supprimer les fichiers profile-v2 oubliés.
- [#590](https://github.com/1024pix/pix/pull/590) [TECH] Ajout d'une colonne pour savoir si l'utilisateur a été migré ou non.
- [#607](https://github.com/1024pix/pix/pull/607) [TECH] Refactoring du contrôleur de `GET /api/users/me/profile`

## v2.53.0 (15/07/2019)

- [#605](https://github.com/1024pix/pix/pull/605) [FEATURE] Possibilité pour le responsable d'une organisation d'ajouter d'autres membres (PO-80).
- [#602](https://github.com/1024pix/pix/pull/602) [FEATURE] Affichage de la liste des membres dans PIX Orga (PO-99).
- [#598](https://github.com/1024pix/pix/pull/598) [FEATURE] Mise en place de Matomo Tag Manager pour les applications front (PF-615).
- [#604](https://github.com/1024pix/pix/pull/604) [FEATURE] Afficher le code campagne dans Pix Orga (PO-213)
- [#606](https://github.com/1024pix/pix/pull/606) [BUGFIX] PixOrga ne fonctionne plus sous IE11 (PO-221).

## v2.52.1 (10/07/2019)

- [BUGFIX] Empêcher de modifier le mot de passe d’un utilisateur sans token de réinitialisation
- [#559](https://github.com/1024pix/pix/pull/559) [TECH] Supprime la méthode inutile mail-service#sendWelcomeEmail

## v2.52.0 (09/07/2019)

- [#584](https://github.com/1024pix/pix/pull/584) [FEATURE] Assigner le rôle Responsable au premier membre d'une organisation, Membre aux autres. (PA-95).
- [#601](https://github.com/1024pix/pix/pull/601) [BUGFIX] Corrige le démarrage des certifications.
- [#588](https://github.com/1024pix/pix/pull/588) [BUGFIX] Parsing des externalId dans l'export des résultats d'une certif (PA-97).
- [#599](https://github.com/1024pix/pix/pull/599) [BUGFIX] Correction de la faute de frappe du nom de la colonne.
- [#595](https://github.com/1024pix/pix/pull/595) [BUGFIX] Re-ordonne les migrations pour leurs permettre de se jouer.
- [#589](https://github.com/1024pix/pix/pull/589) [BUGFIX] Sortir les résultats collectifs avec les bonnes statistiques (PO-214).
- [#587](https://github.com/1024pix/pix/pull/587) [BUGFIX] La remise à zéro plante lors de la 2e raz (PF-740).
- [#563](https://github.com/1024pix/pix/pull/563) [TECH] Supprime la bascule FT_USE_ONLY_V1_CERTIFICATION.
- [#593](https://github.com/1024pix/pix/pull/593) [TECH] Ajout d'un script pour créer une nouvelle migration.
- [#581](https://github.com/1024pix/pix/pull/581) [TECH] Remaniement des tests d'intégration de user-repository.

## v2.51.1 (03/07/2019)

- [#573](https://github.com/1024pix/pix/pull/573) [BUGFIX] Vider et replier le feedback_panel après avoir envoyé le commentaire (PF-708).
- [#578](https://github.com/1024pix/pix/pull/578) [BUGFIX] Nettoyage des données dans la DB. Puis plus de doublon dans Campaign-participation. (PF-702).
- [#580](https://github.com/1024pix/pix/pull/580) [BUGFIX] Trier les participants par nom puis prénom (PO-207).

## v2.51.0 (28/06/2019)

- [#571](https://github.com/1024pix/pix/pull/571) [FEATURE] Calcul du résultat et affichage de la certification V2. (PA-92).
- [#544](https://github.com/1024pix/pix/pull/544) [FEATURE] Possibilité de remettre à zéro une compétence après 7 jours (PF-579-7).
- [#577](https://github.com/1024pix/pix/pull/577) [BUGFIX] Fix de la disparition de la barre de progression en démo et en certification (PF-630).
- [#583](https://github.com/1024pix/pix/pull/583) [BUGFIX] Erreur lors de la Remise à Zéro impactant plusieurs fois la même campagne (PF-717).
- [#572](https://github.com/1024pix/pix/pull/572) [BUGFIX] Affichage des résultats collectifs sous IE (PO-212).
- [#585](https://github.com/1024pix/pix/pull/585) [TECH] Retirer le bouton pour la remise à zéro.
- [#579](https://github.com/1024pix/pix/pull/579) [TECH] Date de remise à zéro dans les variables d'env.

## v2.50.0 (24/06/2019)

- [#557](https://github.com/1024pix/pix/pull/557) [FEATURE] Affichage de la moyenne des résultats d'une campagne. (PO-197)
- [#560](https://github.com/1024pix/pix/pull/560) [FEATURE] Retouche de la fenêtre pour signaler un problème. (PF-612)
- [#520](https://github.com/1024pix/pix/pull/520) [FEATURE] Import certification report.(PA-93)
- [#565](https://github.com/1024pix/pix/pull/565) [TECH] Ajout du role MEMBER dans Pix Admin/Orga. (PA-95)
- [#564](https://github.com/1024pix/pix/pull/564) [TECH] Permettre de configurer API_HOST sur mon-pix en dev.
- [#554](https://github.com/1024pix/pix/pull/554) [TECH] Ajout d'un test cypress pour preview.
- [#553](https://github.com/1024pix/pix/pull/553) [TECH] Corriger "npm run start:watch" pour de bon.

## v2.49.0 (18/06/2019)

- [#552](https://github.com/1024pix/pix/pull/552) [FEATURE] Ajouter des animations CSS sur competence-card (PF-586).
- [#556](https://github.com/1024pix/pix/pull/556) [TECH] Remaniement des tests d'intégration d'assessment-repository
- [#548](https://github.com/1024pix/pix/pull/548) [TECH] Suppression des usages dépréciés de ember-mocha pour les tests d'intégration.

## v2.48.0 (11/06/2019)

- [#535](https://github.com/1024pix/pix/pull/535) [FEATURE] Afficher le nom de la compétence dans un assessement (PF-578).
- [#547](https://github.com/1024pix/pix/pull/547) [FEATURE] Désactiver l'autocomplétion des QROC et QROCM (PF-627).
- [#545](https://github.com/1024pix/pix/pull/545) [FEATURE] Restart d'un positionnement par compétence + migration (PF-579-5).
- [#549](https://github.com/1024pix/pix/pull/549) [BUGFIX] Ajustements sur le CSS pour imprimer la page de résultats d'une campagne (PF-583).
- [#551](https://github.com/1024pix/pix/pull/551) [BUGFIX] Remise en place des previews.
- [#518](https://github.com/1024pix/pix/pull/518) [TECH] Refacto sur l'assessment coté front.
- [#546](https://github.com/1024pix/pix/pull/546) [FEATURE] Supprimer une phrase sur la page de fin de certification (PF-611).

## v2.47.0 (07/06/2019)

- [#550](https://github.com/1024pix/pix/pull/550) [FEATURE] Afficher la version de la certification dans Pix Admin (PF-577).

## v2.46.0 (06/06/2019)

- [#534](https://github.com/1024pix/pix/pull/534) [FEATURE] Certifier suivant le profil v2 (PF-577).

## v2.45.2 (05/06/2019)

- [#541](https://github.com/1024pix/pix/pull/541) [TECH] Suppression des usages dépréciés de ember-mocha pour les tests unitaires.
- [#508](https://github.com/1024pix/pix/pull/508) [TECH] Montée de version des applications Ember (3.8 → 3.9).
- [#540](https://github.com/1024pix/pix/pull/540) [TECH] Améliore la probabilité de succès des tests end to end
- [#537](https://github.com/1024pix/pix/pull/537) [TECH] Amélioration du database builder et des tests cassants aléatoirement

## v2.45.1 (31/05/2019)

- [#539](https://github.com/1024pix/pix/pull/539) [BUGFIX] Afficher "Reprendre" si la scorecard possède des knowledgeElements (PF-618).

## v2.45.0 (31/05/2019)

- [#530](https://github.com/1024pix/pix/pull/530) [FEATURE] Ajout du délai de 7 jours pour réinitialiser une évaluation de compétence (PF-579-6).
- [#532](https://github.com/1024pix/pix/pull/532) [FEATURE] Passer le recaptcha en feature-flipping côté front (PF-588).
- [#528](https://github.com/1024pix/pix/pull/528) [FEATURE] Cacher "n Pix avant le niveau x" si le parcours est terminé (PF-610).
- [#525](https://github.com/1024pix/pix/pull/525) [FEATURE] Création d'une route pour reset une CompetenceEvaluation (PF-579-4).
- [#527](https://github.com/1024pix/pix/pull/527) [FEATURE] Renommer PIX en Pix (PF-609).
- [#516](https://github.com/1024pix/pix/pull/516) [FEATURE] Ajout d'un champs status aux compétences évaluations (PF-579-3).
- [#529](https://github.com/1024pix/pix/pull/529) [TECH] Suppression de feature-list et de feature-item.
- [#521](https://github.com/1024pix/pix/pull/521) [TECH] Remaniement de la génération du profil de certification v1 (PF-577).
- [#517](https://github.com/1024pix/pix/pull/517) [TECH] Refacto sur l'affichage des réponses et des corrections.

## v2.44.0 (24/05/2019)

- [#523](https://github.com/1024pix/pix/pull/523) [FEATURE] Indication du format de la date de naissance sur le PV de certif (PC-55).
- [#524](https://github.com/1024pix/pix/pull/524) [FEATURE] Changement de wordings sur les pages de résultats de campagnes (PO-208).

## v2.43.0 (23/05/2019)

- [#522](https://github.com/1024pix/pix/pull/522) [FEATURE] Renommer PIX en Pix dans les signalements (PF-608).
- [#511](https://github.com/1024pix/pix/pull/511) [FEATURE] Empêcher les utilisateurs de partager une campagne non terminée (PF-579-2).
- [#494](https://github.com/1024pix/pix/pull/494) [FEATURE] Afficher la moyenne des résultats d'une campagne (PO-199).
- [#515](https://github.com/1024pix/pix/pull/515) [FEATURE] Changement du texte pour les signalements (PF-504).
- [#509](https://github.com/1024pix/pix/pull/509) [FEATURE] Ajout de bannières de résultats sur la page de résultats de parcours par compétence (PF-585).
- [#507](https://github.com/1024pix/pix/pull/507) [TECH] Ajout de scénarios Cypress.
- [#519](https://github.com/1024pix/pix/pull/519) [TECH] Remise en place des Answers dans les seeds.
- [#443](https://github.com/1024pix/pix/pull/443) [TECH] Nettoyage de l'utilisation de users/me.
- [#510](https://github.com/1024pix/pix/pull/510) [TECH] Refactor des usecases `get-scorecard` et `get-user-scorecards`.
- [#512](https://github.com/1024pix/pix/pull/512) [TECH] Renommer SmartPlacementKnowledgeElement en KnowledgeElement.
- [#504](https://github.com/1024pix/pix/pull/504) [TECH] Améliorer le script d'extraction d'answers.
- [#514](https://github.com/1024pix/pix/pull/514) [TECH] Réparer le script `npm run start:watch` de l'API.

## v2.42.0 (16/05/2019)

- [#502](https://github.com/1024pix/pix/pull/502) [FEATURE] Modification du design de scorecard-details (PF-594).
- [#500](https://github.com/1024pix/pix/pull/500) [TECH] Refactoring pour préparer la remise à zéro.

## v2.41.0 (14/05/2019)

- [#501](https://github.com/1024pix/pix/pull/501) [FEATURE] Afficher un lien temporaire d'explications pour Profil v2(PF-589).
- [#488](https://github.com/1024pix/pix/pull/488) [FEATURE] Affiche la scorecard associée à la fin d'un parcours par compétence. (PF-569)
- [#497](https://github.com/1024pix/pix/pull/497) [FEATURE] Modifier le wording de la page d'avertissement du chronomètre. (PF-115)
- [#491](https://github.com/1024pix/pix/pull/491) [FEATURE] Afficher un message lors d'un checkpoint si aucune réponse n'est affichée. (PF-581)
- [#477](https://github.com/1024pix/pix/pull/477) [FEATURE] Afficher par défaut le profil V2 pour certains utilisateurs (PF-556).
- [#503](https://github.com/1024pix/pix/pull/503) [BUGFIX] Correction d'une typo dans la modale de prévention sur support mobile.
- [#499](https://github.com/1024pix/pix/pull/499) [BUGFIX] Unifier l'affichage du cercle de progression d'une compétence (pf-599)
- [#498](https://github.com/1024pix/pix/pull/498) [BUGFIX] Rétablir l'affichage de la barre de progression d'un checkpoint. (PF-597)
- [#486](https://github.com/1024pix/pix/pull/486) [BUGFIX] Corriger la disposition des réponses d'un QCROQM-ind (PF-570).
- [#496](https://github.com/1024pix/pix/pull/496) [BUGFIX] Corriger le problème d'affichage des niveaux sous IE. (PF-595)
- [#492](https://github.com/1024pix/pix/pull/492) [BUGFIX] Corriger l'affichage de certains liens de mon-pix. (PF-590)
- [#478](https://github.com/1024pix/pix/pull/478) [TECH] Mise en place d'outils pour faciliter les tests de charge & perfs.
- [#470](https://github.com/1024pix/pix/pull/470) [TECH] Amélioration du bookshelf-to-domain converter
- [#487](https://github.com/1024pix/pix/pull/487) [TECH] Ajout d'un namespace "/api" dans les resources exposées par l'API ainsi que les adapters des apps front-end (PF-551).

## v2.40.0 (06/05/2019)

- [#484](https://github.com/1024pix/pix/pull/484) [FEATURE] Lier la carte de la compétence à la page de détails de cette compétence (PF-554).
- [#482](https://github.com/1024pix/pix/pull/482) [BUGFIX] Corriger l'alignement des listes à puces pour les phrases trop longues (PF-141)
- [#483](https://github.com/1024pix/pix/pull/483) [TECH] Séparation des scripts sqlite et npm dans le package.json de api
- [#489](https://github.com/1024pix/pix/pull/489) [TECH] Utilisation complète des builders lorsque l'on seed la base de données.
- [#493](https://github.com/1024pix/pix/pull/493) Ajoute un indexe sur la colonne courseId de la table assessments

## v2.39.0 (02/05/2019)

- [#451](https://github.com/1024pix/pix/pull/451) [FEATURE] Lier le profil v1 et le profil v2 grâce à un lien cliquable (PF-558)
- [#448](https://github.com/1024pix/pix/pull/448) [FEATURE] Positionnement sur compétence via un parcours depuis Profil V2 (PF-372)
- [#467](https://github.com/1024pix/pix/pull/467) [FEATURE] Page de detail d'une competence (PF-553)
- [#457](https://github.com/1024pix/pix/pull/457) [BUGFIX] Correction de l'affichage des détails d'une certification pour une réponse "Abandon" (PA-82)
- [#490](https://github.com/1024pix/pix/pull/490) [TECH] Ajoute le premier enregistrement d'architecture (ADR)
- [#449](https://github.com/1024pix/pix/pull/449) [TECH] Redesign du dossier docs et du contributing.md
- [#473](https://github.com/1024pix/pix/pull/473) [TECH] Add state of the art markers in the code
- [#405](https://github.com/1024pix/pix/pull/405) [TECH] Ajout d'un script pour récupérer les answers pour les statistiques
- [#475](https://github.com/1024pix/pix/pull/475) [TECH] Corrige une erreur de linter
- [#471](https://github.com/1024pix/pix/pull/471) [TECH] Suppression d'anciens commentaires
- [#472](https://github.com/1024pix/pix/pull/472) [TECH] Mise à jour du linter avec la règle "space-infix-ops" et lint des projets

## v2.38.0 (16/04/2019)

- [#461](https://github.com/1024pix/pix/pull/461) [FEATURE] Afficher le nombre de participants et de profils reçus dans la liste des campagnes (PO-86)
- [#469](https://github.com/1024pix/pix/pull/469) [BSR] Réécriture du serializer d'assessment.

## v2.37.0 (15/04/2019)

- [#463](https://github.com/1024pix/pix/pull/463) [FEATURE] Ameliorer le style du PV de session (PC-41).

## v2.36.1 (12/04/2019)

- [#468](https://github.com/1024pix/pix/pull/468) [HOTFIX] Correction de la régression de la barre de progression introduite par la PR #438.

## v2.36.0 (12/04/2019)

- [#423](https://github.com/1024pix/pix/pull/423) [FEATURE] Affichage de la progression des participants à une campagne. (PO-196)
- [#456](https://github.com/1024pix/pix/pull/456) [FEATURE] Ajout de la bannière "Reprendre la campagne" sur profilv2 (PF-544)
- [#455](https://github.com/1024pix/pix/pull/455) [FEATURE] Scroll automatiquement en haut de page après une transition. (PF-550)
- [#466](https://github.com/1024pix/pix/pull/466) [BUGFIX] Filtrage des campaign-participation-results par le sharedAt de la campaign-participation.
- [#462](https://github.com/1024pix/pix/pull/462) [BUGFIX] Ajout d'un filtre sur l'accès aux knowledge-elements
- [#446](https://github.com/1024pix/pix/pull/446) [BUGFIX] En tant que user, je veux pouvoir appuyer sur "Entrée" pour valider une réponse d'un parcours (PF-566)
- [#459](https://github.com/1024pix/pix/pull/459) [TECH] Ajout d'un mécanisme pour les épreuves intégrant un simulateur (embed) permettant d'indiquer à l'iframe quand l'utilisateur lance le simulateur.
- [#464](https://github.com/1024pix/pix/pull/464) [TECH] Montée de version de Node 10.15.1 à 10.15.3 (pour correction de la fuite mémoire).
- [#444](https://github.com/1024pix/pix/pull/444) [TECH] Empêcher la redirection vers pix.fr quand on n'est pas en production
- [#452](https://github.com/1024pix/pix/pull/452) [TECH] Ajout d'un fichier de documentation d'une lib sous forme de tests unitaires
- [#450](https://github.com/1024pix/pix/pull/450) [TECH] Envoi d'un CustomEvent au lancement d'un Embed (PF-567)
- [#460](https://github.com/1024pix/pix/pull/460) [TECH] Suppression de delay service et de call-only-once
- [#458](https://github.com/1024pix/pix/pull/458) [BSR] Correction de tests d'intégration sous PG
- [#438](https://github.com/1024pix/pix/pull/438) [BSR] Réécriture du serializer d'assessment.

## v2.35.1 (05/04/2019)

- [#447](https://github.com/1024pix/pix/pull/447) [FEATURE] Renommer les onglets "Paramètres" en "Détails" dans Pix Orga et Pix Certif (PO-202).

## v2.35.0 (05/04/2019)

- [#439](https://github.com/1024pix/pix/pull/439) [FEATURE] Affichage du profilV2 avec les cartes de couleur (PF-522).
- [#419](https://github.com/1024pix/pix/pull/419) [FEATURE] Afficher les niveaux par compétence sur le Profil V2 de l'utilisateur (scorecard) (PF-537).
- [#413](https://github.com/1024pix/pix/pull/413) [TECH] Enrichissement du CONTRIBUTING.md.
- [#253](https://github.com/1024pix/pix/pull/253) [TECH] Ajouter Cypress en CI.

## v2.34.0 (04/04/2019)

- [#445](https://github.com/1024pix/pix/pull/445) [FEATURE] Renommage de surveillant en surveillant(s) (PC-44).
- [#418](https://github.com/1024pix/pix/pull/418) [FEATURE] Calculer le Pix Score global de l'utilisateur à afficher dans le profil v2 (PF-537).
- [#441](https://github.com/1024pix/pix/pull/441) [TECH] Ajout d'une règle de linting forçant l'emploi d'espace entre les mots-clé
- [#440](https://github.com/1024pix/pix/pull/440) [TECH] Spécification de la politique de cache des ressources statiques
- [#442](https://github.com/1024pix/pix/pull/442) [TECH] Mise à jour du client Sentry côté API.
- [#427](https://github.com/1024pix/pix/pull/427) [TECH] Montée de version de Pix App.

## v2.33.2 (02/04/2019)

- [#436](https://github.com/1024pix/pix/pull/436) [BUGFIX] Les tableaux dans les épreuves s'affichent correctement

## v2.33.1 (01/04/2019)

- [#435](https://github.com/1024pix/pix/pull/435) [BUGFIX] Affiche 100% d'avancement quoiqu il arrive sur le dernier checkpoint (PF-542).

## v2.33.0 (29/03/2019)

- [#433](https://github.com/1024pix/pix/pull/433) [FEATURE] Ajout des CGUs sur Pix Certif (PC-11).
- [#430](https://github.com/1024pix/pix/pull/430) [FEATURE] Affichage des résultats de campagne par participant dans Pix Orga (PO-193).
- [#432](https://github.com/1024pix/pix/pull/432) [BUGFIX] Ne pas garder en mémoire les réponses dont l'enregistrement a échoué (PF-555).

## v2.32.0 (28/03/2019)

- [#416](https://github.com/1024pix/pix/pull/416) [FEATURE] Ajout des résultats par compétences au résultat d'un participant (PF-543).
- [#417](https://github.com/1024pix/pix/pull/417) [FEATURE] Téléchargement du PV de session (PC-9).
- [#434](https://github.com/1024pix/pix/pull/434) [BUGFIX] Suppression du namespace /api dans Pix Admin (PA-81).
- [#429](https://github.com/1024pix/pix/pull/429) [BUGFIX] Afficher le bon message coté front quand l'utilisateur n'a pas partagé sa campagne (PF-541).
- [#426](https://github.com/1024pix/pix/pull/426) [BUGFIX] Correction de l'affichage du pourcentage dans le cercle de progression sous IE (PF-552).
- [#431](https://github.com/1024pix/pix/pull/431) [TECH] Faire que les tests unitaires de l'API passent sans base de données.
- [#428](https://github.com/1024pix/pix/pull/428) [TECH] DatabaseBuilder: reverse the deletion order.
- [#408](https://github.com/1024pix/pix/pull/408) [TECH] Montée de version d'Ember et des dépendances pour Pix Admin/Certif/Orga (PF-524).
- [#415](https://github.com/1024pix/pix/pull/415) [TECH] Ne plus recalculer le résultat de l'assessment à chaque appel (PF-549).
- [#424](https://github.com/1024pix/pix/pull/424) [TECH] Ajoute un script Docker-compose.
- [#422](https://github.com/1024pix/pix/pull/422) [TECH] Affichage des résultats détaillés sur la page de fin de parcours (PF-543-2).
- [#420](https://github.com/1024pix/pix/pull/420) [TECH] Faire que les tests unitaires de l'API passent sans base de données.

## v2.31.1 (19/03/2019)

- [#414](https://github.com/1024pix/pix/pull/414) [TECH] Correction du build CircleCI en forçant Chrome 72
- [#401](https://github.com/1024pix/pix/pull/401) [TECH] Refonte du composant "pix-modal" (PF-547).

## v2.31.0 (18/03/2019)

- [#409](https://github.com/1024pix/pix/pull/409) [FEATURE] Affichage du lieu de naissance sur le certificat (PF-230).
- [#403](https://github.com/1024pix/pix/pull/403) [FEATURE] Nouvelle page profil V2 qui présente le score des parcours ciblés (PF-371).
- [#402](https://github.com/1024pix/pix/pull/402) [FEATURE] Ajout d'une page de détails d'un participant à une campagne. (PO-190).
- [#412](https://github.com/1024pix/pix/pull/412) [BUGFIX] Affiche correctement les résultats d'un participant d'une campagne (PO-201).
- [#410](https://github.com/1024pix/pix/pull/410) [TECH] Forcer les seeds à générer des emails non-existants (PF-540).
- [#406](https://github.com/1024pix/pix/pull/406) [TECH] Ne pas créer de date si celle-ci est null en base (PF-538).

## v2.30.0 (14/03/2019)

- [#390](https://github.com/1024pix/pix/pull/390) [FEATURE] Changement de wording sur les pages et email du changement de mot de passe (PF-497)
- [#407](https://github.com/1024pix/pix/pull/407) [BUGFIX] Fix bugs affichage réinitialisation mot de passe sous IE
- [#395](https://github.com/1024pix/pix/pull/395) [BUGFIX] Mise à jour de la barre de progression au bon moment (PF-508).
- [#404](https://github.com/1024pix/pix/pull/404) [TECH] Supprimer ember-table de Pix Certif (PF-534).

## v2.29.1 (07/03/2019)

- [#400](https://github.com/1024pix/pix/pull/400) [BUGFIX] Problème lors des lancements de certifications.

## v2.29.0 (07/03/2019)

- [#379](https://github.com/1024pix/pix/pull/379) [FEATURE] Affichage de la liste paginée des participants à une campagne (PO-177).
- [#399](https://github.com/1024pix/pix/pull/399) [BUGFIX] Corrige la serialization des erreurs.
- [#392](https://github.com/1024pix/pix/pull/392) [TECH] Supprimer le fichier `seed.js` (PF-530).
- [#391](https://github.com/1024pix/pix/pull/391) [TECH] Ajouter des colonnes userId et competenceId à la table Knowledge-elements (PF-521).
- [#388](https://github.com/1024pix/pix/pull/388) [TECH] Remplacement d'une longue chaîne de promesses par async/await (PF-532).
- [#382](https://github.com/1024pix/pix/pull/382) [TECH] Améliorer Answer controller et repository (PF-531).
- [#374](https://github.com/1024pix/pix/pull/374) [TECH] Nettoyage de la gestion d'erreurs coté back (PF-529).

## v2.28.1 (04/03/2019)

- [#389](https://github.com/1024pix/pix/pull/389) [TECH] Mise à jour de Pix admin vers Node 10.15.1.
- [#393](https://github.com/1024pix/pix/pull/393) [BSR] Suppression de l'étape de MEP `release:perform`.

## v2.28.0 (28/02/2019)

- [#385](https://github.com/1024pix/pix/pull/385) [FEATURE] Modifier un message d'erreur et l'affichage d'un libellé dans pix Orga (PO-191).
- [#384](https://github.com/1024pix/pix/pull/384) [FEATURE] Affiche le nombre de participants et les profils reçus sur la page de détails d'une campagne (PO-183).
- [#383](https://github.com/1024pix/pix/pull/383) [TECH] Mise à jour du socle technique (Node/NPM & dépendances API).
- [#375](https://github.com/1024pix/pix/pull/375) [TECH] Optimisation du build Circle CI.
- [#386](https://github.com/1024pix/pix/pull/386) [TECH] Fix the login end to end test.

## v2.27.0 (26/02/2019)

- [#373](https://github.com/1024pix/pix/pull/373) [FEATURE] Ajout d'une page de détails de session (PC-28).

## v2.26.2 (25/02/2019)

- [#380](https://github.com/1024pix/pix/pull/380) [BUGFIX] Créer une session sans ID de centre de certification depuis Pix Admin.
- [#378](https://github.com/1024pix/pix/pull/378) [TECH] Mise à jour du script de préparation de release pour monter aussi la version de PixAdmin.

## v2.26.1 (21/02/2019)

- [#377](https://github.com/1024pix/pix/pull/377) [TECH] Suppression de l'ajout des pix gagnés lors de la migration de la table knowlege-elements.

## v2.26.0 (21/02/2019)

- [#362](https://github.com/1024pix/pix/pull/362) [FEATURE] Changements visuels mineurs (PC-27).
- [#368](https://github.com/1024pix/pix/pull/368) [FEATURE] Ajout du formulaire de modification de session (PC-10).
- [#356](https://github.com/1024pix/pix/pull/356) [FEATURE] Sauvegarder la valeur des Pix quand on répond à une question (PF-495).
- [#359](https://github.com/1024pix/pix/pull/359) [FEATURE] Redirection vers la page d'inscription lorsqu'un utilisateur non authentifié veut commencer une campagne (PF-459).
- [#372](https://github.com/1024pix/pix/pull/372) [TECH] Import des sources de Pix Admin dans le repository.
- [#364](https://github.com/1024pix/pix/pull/364) [TECH] Refacto des transition de reprise des assessments.
- [#370](https://github.com/1024pix/pix/pull/370) [TECH] Déployer une seule application "front" pour les "review apps".
- [#350](https://github.com/1024pix/pix/pull/350) [TECH] Suppression de la table "Skills".
- [#363](https://github.com/1024pix/pix/pull/363) [TECH] Ajouter des tests end-to-end en local avec Cypress (PF-500).
- [#367](https://github.com/1024pix/pix/pull/367) [BSR] Suppression de l'utilisation de controllerReplies pour les codes 200, 201 et 204.
- [#358](https://github.com/1024pix/pix/pull/358) [BSR] Suppression du code obsolète inutile lié à la modalité d'épreuve QMAIL.

## v2.25.0 (14/02/2019)

- [#361](https://github.com/1024pix/pix/pull/361) [FEATURE] Amélioration de la page de création de session (PC-32).
- [#348](https://github.com/1024pix/pix/pull/348) [FEATURE] Nouveau design pour la liste des sessions de certification (PC-12).
- [#345](https://github.com/1024pix/pix/pull/345) [FEATURE] Ajout du formulaire de création de session (PC-6).
- [#353](https://github.com/1024pix/pix/pull/353) [BUGFIX] Bookshelf to Domain converter créé correctement des objets Domain pour les sous-ressources (PF-501).
- [#344](https://github.com/1024pix/pix/pull/344) [BUGFIX] Ajout d'un fichier de chargement avant l'affichage des résultats (PF-493).
- [#357](https://github.com/1024pix/pix/pull/357) [TECH] Ajout de règles dans le fichier contributing.md.
- [#355](https://github.com/1024pix/pix/pull/355) [TECH] Changement de dossier du template de PR.
- [#351](https://github.com/1024pix/pix/pull/351) [TECH] Ajoute une première version de nos standards de code.
- [#324](https://github.com/1024pix/pix/pull/324) [TECH] Add an `emptyAllTables` method for tests.
- [#336](https://github.com/1024pix/pix/pull/336) [BSR] Suppression d'anciennes pages et du menu mobile (PF-335).

## v2.24.0 (06/02/2019)

- [#340](https://github.com/1024pix/pix/pull/340) [FEATURE] Ajout d'une page de détails pour une campagne dans Pix Orga (PO-31).
- [#349](https://github.com/1024pix/pix/pull/349) [BUGFIX] Génération du token des résultats CSV sur la page de détails (PO-187).
- [#352](https://github.com/1024pix/pix/pull/352) [BSR] Remove dead code related to email list management.

## v2.23.1 (05/02/2019)
- [#347](https://github.com/1024pix/pix/pull/347) [BUGFIX] Vérifier le domaine d'une adresse avant de la soumettre à Mailjet (PF-509).
- [#339](https://github.com/1024pix/pix/pull/339) [BUGFIX] Déconnecter l'utilisateur et le rediriger si besoin avant de commencer une campagne (PF-490).
- [#342](https://github.com/1024pix/pix/pull/342) [BUGFIX] Arrêter d'utiliser les colonnes non-renseigné d'AirTable (PF-503).

## v2.23.0 (05/02/2019)

- [#346](https://github.com/1024pix/pix/pull/346) [FEATURE] Les tokens de reset password restent valides même si un nouveau est créé. (PF-505)
- [#332](https://github.com/1024pix/pix/pull/332) [FEATURE] Ajout du nouveau design de la page des résultats intermédiaires lors d'une campagne (PF-485).
- [#341](https://github.com/1024pix/pix/pull/341) [BUGFIX] Les acquis des anciennes campagnes ne remontent pas dans le CSV (PO-186).
- [#343](https://github.com/1024pix/pix/pull/343) [TECH] Correction des stack trace des tests API.

## v2.22.0 (31/01/2019)

- [#329](https://github.com/1024pix/pix/pull/329) [FEATURE] Pouvoir accéder à pix certif en tant que membre de centre de certification (PC-15).
- [#331](https://github.com/1024pix/pix/pull/331) [FEATURE] Permettre à un Pix Master de lister et ajouter des membres à une Organisation dans Pix Admin (PA-52).
- [#335](https://github.com/1024pix/pix/pull/335) [BUGFIX] Problème de style sous IE (PF-440).
- [#337](https://github.com/1024pix/pix/pull/337) [BUGFIX] Correction de la page de résultat de certif sous IE (PF-499).
- [#327](https://github.com/1024pix/pix/pull/327) [TECH] Mutualiser la reprise d'évaluation (PF-496).

## v2.21.0 (29/01/2019)

- [#313](https://github.com/1024pix/pix/pull/313) [FEATURE] Le CSV des résultats de campagnes prends tout en compte (PF-438).
- [#333](https://github.com/1024pix/pix/pull/333) [TECH] Simplifier le process de MEP en utilisant l'api GitHub.
- [#334](https://github.com/1024pix/pix/pull/334) [BSR] Changement de la phrase de fin de campagne et du style (PF-498).

## v2.20.3 (25/01/2019)

- [#310](https://github.com/1024pix/pix/pull/310) [FEATURE] Ajout d'un parser de query params, d'un query builder générique et un domain builder générique (PF-479).
- [#315](https://github.com/1024pix/pix/pull/315) [FEATURE] Retenter une compétence doit créer une nouvelle évaluation sur la compétence (et non en reprendre une ancienne) (PF-484).
- [#322](https://github.com/1024pix/pix/pull/322) [FEATURE] Faire un lien entre les centres de certifications et les utilisateurs (PC-15-3).
- [#320](https://github.com/1024pix/pix/pull/320) [FEATURE] Ajout de l'identifiant du centre de certification dans les session (PC-15-2).
- [#323](https://github.com/1024pix/pix/pull/323) [BUGFIX] Change /api/scripts to avoid side effects in tests.
- [#328](https://github.com/1024pix/pix/pull/328) [TECH] Ne pas répéter le message de déploiement sur les PR.
- [#330](https://github.com/1024pix/pix/pull/330) [BSR] Fix a randomly failing test.

## v2.20.2 (18/01/2019)

- [#311](https://github.com/1024pix/pix/pull/311) [BUGFIX] Une seule évaluation pour une certification (PF-143).
- [#319](https://github.com/1024pix/pix/pull/319) [BUGFIX] Changement de l'état d'une évaluation avant la création des résultats (PF-143).
- [#325](https://github.com/1024pix/pix/pull/325) [BUGFIX] Ajout de test (PF-143).
- [#326](https://github.com/1024pix/pix/pull/326) [BUGFIX] Le niveau affiché à la fin d'un parcours par compétence devrait être plafonné (PF-492).
- [#321](https://github.com/1024pix/pix/pull/321) [TECH] Ajout de l'identifiant du centre de certification dans la session (PC-15-1).

## v2.20.1 (16/01/2019)

- [#318](https://github.com/1024pix/pix/pull/318) [BUGFIX] Correction du partage du profil (cassé en v2.20.0)

# v2.20.0 (15/01/2019)

- [#312](https://github.com/1024pix/pix/pull/312) [FEATURE] Ajouter de la recherche filtrée et paginée des organisations (PA-60).
- [#316](https://github.com/1024pix/pix/pull/316) [TECH] Ne pas planter l'application quand Redis est temporairement déconnecté (PA-60).
- [#314](https://github.com/1024pix/pix/pull/314) [TECH] Mise à jour de sinon.js (API).

## v2.19.0 (10/01/2019)

- [#307](https://github.com/1024pix/pix/pull/307) [TECH] Retirer l'ancien algorithme CAT du système de calcul du score (PF-476).

## v2.18.0 (04/01/2019)

- [#303](https://github.com/1024pix/pix/pull/303) [FEATURE] Lors des certifications, il faut que l'on propose toujours 3 épreuves (PF-254).
- [#305](https://github.com/1024pix/pix/pull/305) [FEATURE] Si l'utilisateur vient du GAR, se rediriger vers une page de déconnexion (PF-465).
- [#309](https://github.com/1024pix/pix/pull/309) [FEATURE] Ne pas afficher le bouton de partage quand la personne vient de l'extérieur (PF-478).

## v2.17.1 (21/12/2018)

- [#308](https://github.com/1024pix/pix/pull/308) [BUGFIX] CSV des snapshots : transformer les données depuis la base de données en espace constant (pf-474)

## v2.17.0 (20/12/2018)

- [#304](https://github.com/1024pix/pix/pull/304) [FEATURE] Affiche au maximum 200 snapshots dans la page board (PF-473).

## v2.16.0 (17/12/2018)

- [#295](https://github.com/1024pix/pix/pull/295) [TECH] Hapi v17 migration (PF-144).

## v2.15.0 (14/12/2018)

- [#296](https://github.com/1024pix/pix/pull/296) [TECH] Ajout de règles côté back-end lors du démarrage d'un positionnement (PF-458).
- [#301](https://github.com/1024pix/pix/pull/301) [TECH] Utilisation des Knowledge-Elements dans l'algo SmartRandom (PF-437).
- [#294](https://github.com/1024pix/pix/pull/294) [BUGFIX] Le CSV des snapshots doit refléter les profils utilisateurs (PF-358).

## v2.14.0 (13/12/2018)

- [#290](https://github.com/1024pix/pix/pull/290) [FEATURE] Affichage de la liste des sessions de certification dans Pix Certif (PC-5).

## v2.13.0 (12/12/2018)

- [#297](https://github.com/1024pix/pix/pull/297) [FEATURE] Suppression du champs email dans les formulaires de feedback. (PF-454)
- [#293](https://github.com/1024pix/pix/pull/293) [BUGFIX] Affiche correctement la progression d'une certification. (PF-457)

## v2.12.0 (07/12/2018)

- [#282](https://github.com/1024pix/pix/pull/282) [FEATURE] Mise à jour de la gestion de la première question posée à l'utilisateur (PF-436).
- [#287](https://github.com/1024pix/pix/pull/287) [FEATURE] Bouton "Retenter" afin de pouvoir relancer un test de positionnement tous les 7 jours (PF-422).
- [#292](https://github.com/1024pix/pix/pull/292) [BUGFIX] Ajout d'authentification en tant qu'admin (PA-66).


## v2.11.0 (30/11/2018)

- [#288](https://github.com/1024pix/pix/pull/288) [FEATURE] Redirection vers la page d'acceuil si l'url n'existe pas. (PO-173)
- [#274](https://github.com/1024pix/pix/pull/274) [FEATURE] Ajout page de modification d'une campagne. (PO-160)
- [#281](https://github.com/1024pix/pix/pull/281) [FEATURE] Recherche d'utilisateurs insensible à la casse. (PA-58)
- [#275](https://github.com/1024pix/pix/pull/275) [BUGFIX] Même si un utilisateur ouvre plusieurs onglets pour se positionner sur une compétence, un seul positionnement est créé. (PF-430).
- [#283](https://github.com/1024pix/pix/pull/283) [BUGFIX] Suppression d'erreur sur get certification sans assessment. (PF-354)
- [#285](https://github.com/1024pix/pix/pull/285) [BUGFIX] Gestion de la recherche de positionnement lorsqu'aucun utilisateur est connecté (PF-430).
- [#286](https://github.com/1024pix/pix/pull/286) [BUGFIX] Rétablir la redirection de /connexion vers /compte pour les utilisateurs déjà authentifiés (PF-456)
- [#279](https://github.com/1024pix/pix/pull/279) [TECH] Mise à jour des liens Matomo (ex-Piwik).
- [#280](https://github.com/1024pix/pix/pull/280) [BSR] Renomage du répertoire générique /factory en domain-builder/

## v2.10.0 (22/11/2018)

- [#243](https://github.com/1024pix/pix/pull/243) [FEATURE] Implémentation de SAML pour le GAR (PF-362).
- [#278](https://github.com/1024pix/pix/pull/278) [FEATURE] Trier les profils cibles par privés/public, puis alphabétique (PO-175).
- [#276](https://github.com/1024pix/pix/pull/276) [TECH] Début de refactoring tests d'acceptance.
- [#277](https://github.com/1024pix/pix/pull/277) [TECH] Génération de logs au format JSON
- [#262](https://github.com/1024pix/pix/pull/262) [TECH] Ajout d'un système de lock afin de limiter les requêtes à Airtable (PF-416).

## v2.9.1 (19/11/2018)

- [#270](https://github.com/1024pix/pix/pull/270) [BUGFIX] La barre de progression se met à jour en même temps que la question (PF-348).
- [#271](https://github.com/1024pix/pix/pull/271) [TECH] BSR: Uniformisation du lancement des applications

## v2.9.0 (16/11/2018)

- [#269](https://github.com/1024pix/pix/pull/269) [FEATURE] Le CSV des résultats de campagne doit être exploitable (PO-166).
- [#268](https://github.com/1024pix/pix/pull/268) [BUGFIX] Ré-initialisation de la page de résultats d'une campagne (pf-449).
- [#273](https://github.com/1024pix/pix/pull/273) [TECH] Amélioration du script récupérant le ChangeLog.

## v2.8.0 (14/11/2018)

- [#264](https://github.com/1024pix/pix/pull/264) [FEATURE] Mise-à-jour de la bannière de reprise pour le cas où l'utilisateur n'a pas partagé ses résultats (PF-405).
- [#266](https://github.com/1024pix/pix/pull/266) [BUGFIX] Affichage de l'en-tête avec le titre (s'il existe) sur les pages de résultats intermédiaires (PF-445).
- [#267](https://github.com/1024pix/pix/pull/267) [BUGFIX] Correction des profils cibles partagés pour la création des campagnes (PO-178).
- [#259](https://github.com/1024pix/pix/pull/259) [BUGFIX] Filtrer les acquis par status (PF-147).


## v2.7.0 (12/11/2018)

- [#263](https://github.com/1024pix/pix/pull/263) [FEATURE] Afficher le logo de l'organisation dans la landing page des campagnes (PF-239).
- [#257](https://github.com/1024pix/pix/pull/257) [FEATURE] Modifications de l'apparence des titres des campagnes (PF-74).
- [#251](https://github.com/1024pix/pix/pull/251) [FEATURE] Ajout d'un texte personnalisé pour la page d'accueil lors de la création de la campagne (PO-24).
- [#261](https://github.com/1024pix/pix/pull/261) [FEATURE] Modification du tutorial avec ajout du bouton Ignorer (PF-443).
- [#255](https://github.com/1024pix/pix/pull/255) [FEATURE] Ajout du didacticiel lorsqu'un utilisateur commence une campagne (PF-71).
- [#256](https://github.com/1024pix/pix/pull/256) [BUGFIX] Affichage correct sous IE de la phrase légale lors de la création de compte (PF-441).
- [#265](https://github.com/1024pix/pix/pull/265) [BUGFIX] Aligner horizontalement les logos sur la page de landing.
- [#258](https://github.com/1024pix/pix/pull/258) [BUGFIX] Correction des seeds pour PG (codes orga trop longs).
- [#254](https://github.com/1024pix/pix/pull/254) [TECH] Renommage du concept métier "OrganizationAccess" en "Membership".
- [#252](https://github.com/1024pix/pix/pull/252) [TECH] Changer Delete Cache/key pour un Patch (PF-417).

## v2.6.0 (30/10/2018)

- [#244](https://github.com/1024pix/pix/pull/244) [FEATURE] Ajout d'un message pour prévenir l'utilisateur que le résultats de ses campagnes ne sont pas inclus dans son profil (PF-400).
- [#225](https://github.com/1024pix/pix/pull/225) [FEATURE] Redirection vers la page de CGU sur Pix Orga (PO-15).
- [#231](https://github.com/1024pix/pix/pull/231) [FEATURE] Ajout d'un titre lors de la création d'une campagne (PO-73).
- [#238](https://github.com/1024pix/pix/pull/238) [FEATURE] Ajout d'un bandeau pour reprendre une campagne (PF-269).
- [#242](https://github.com/1024pix/pix/pull/242) [FEATURE] Ajout de la gestion du logo d'une organisation dans Pix Admin (PA-53).
- [#248](https://github.com/1024pix/pix/pull/248) [FEATURE] Remplacement du logo normal par le logo beta (PO-172).
- [#228](https://github.com/1024pix/pix/pull/228) [BUGFIX] Redirection après reprise des campagnes (PF-399).
- [#240](https://github.com/1024pix/pix/pull/240) [BUGFIX] Les documents 'embed' fonctionnent maintenant sous Internet Explorer (PF-432).
- [#245](https://github.com/1024pix/pix/pull/245) [BUGFIX] Ajout d'une règle CSS pour empêcher le texte du bouton d'export de s'afficher sur 2 lignes (PO-130).
- [#246](https://github.com/1024pix/pix/pull/246) [BUGFIX] Sauvegarde de l'identifiant au lieu du code campagne dans le champ 'participantExternalId'.
- [#247](https://github.com/1024pix/pix/pull/247) [BUGFIX] Ajout de polyfill à ember-cli-babel pour un meilleur support ES6 (PF-433).
- [#220](https://github.com/1024pix/pix/pull/220) [TECH] Ajout d'un style guide pour Pix-Orga (PO-170).
- [#221](https://github.com/1024pix/pix/pull/221) [TECH] Utilisation d'un "subdir buildpack" pour séparer le déploiement des 3 applications.
- [#234](https://github.com/1024pix/pix/pull/234) [TECH] Simplification des requêtes à Airtable (PF-415).
- [#235](https://github.com/1024pix/pix/pull/235) [TECH] Suppression du code lié au Followers.
- [#249](https://github.com/1024pix/pix/pull/249) [TECH] Supprime les messages de log dans la sortie console des tests.

## v2.5.0 (16/10/2018)

- [#226](https://github.com/1024pix/pix/pull/226) [FEATURE] Suppression temporaire des colonnes non renseignées et correction de valeurs inversées par rapport aux colonnes dans le CSV téléchargeable (PO-162).
- [#230](https://github.com/1024pix/pix/pull/230) [FEATURE] Modifier le texte de mise à jour de mot de passe (PF-428).
- [#232](https://github.com/1024pix/pix/pull/232) [FEATURE] Ajout d'un fichier de validation pour l'indexation par Google Search Console (PF-412).
- [#233](https://github.com/1024pix/pix/pull/233) [FEATURE] Micro améliorations UI (PF-257 & PF-286).
- [#218](https://github.com/1024pix/pix/pull/218) [FEATURE] Pouvoir partager un profil cible avec d'autres organisations (PO-161).
- [#229](https://github.com/1024pix/pix/pull/229) [BUGFIX] Quick hotfix, ne pas rediriger vers la page résultats en cas d'erreur d'api (PF-427).
- [#227](https://github.com/1024pix/pix/pull/227) [BUGFIX] Réparation de la ressource POST /api/organizations (PA-49).
- [#219](https://github.com/1024pix/pix/pull/219) [TECH] Création d'une participation à une campagne plutôt qu'un assessment (PF-407).

## v2.4.0 (09/10/2018)

- [#222](https://github.com/1024pix/pix/pull/222) [TECH] Amélioration du modèle de données (PF-339).
- [#223](https://github.com/1024pix/pix/pull/223) [TECH] Amélioration des performances d'accès au référentiel pédagogique (PF-413).
- [#224](https://github.com/1024pix/pix/pull/224) [FEATURE] Ajout d'une page pour les CGU sur Pix Orga (PO-118).
- [#208](https://github.com/1024pix/pix/pull/208) [FEATURE] Ajout du endpoint d'administration "GET /api/users" permettant de lister, filtrer et paginer des utilisateurs (PA-46).

## v2.3.1 (02/10/2018)

- [#213](https://github.com/1024pix/pix/pull/213) [BUGFIX] Correction du bug sur la reprise des certifications (PF-351).

## v2.3.0 (01/10/2018)

- [#206](https://github.com/1024pix/pix/pull/206) [FEATURE] Ajout d'une landing page simple avec un bouton pour commencer son parcours de campagne (PF-390).
- [#215](https://github.com/1024pix/pix/pull/215) [FEATURE] Ajout de la demande d'identifiant extérieur (PF-271).
- [#211](https://github.com/1024pix/pix/pull/211) [FEATURE] Reprise d'une campagne (PF-394).
- [#212](https://github.com/1024pix/pix/pull/212) [FEATURE] Ajout de texte explicatif à la landing page de début de campagne (PF-102).
- [#217](https://github.com/1024pix/pix/pull/217) [BUGFIX] Résolution du bug de redirection après avoir fini une campagne (PF-403).
- [#210](https://github.com/1024pix/pix/pull/210) [TECH] Publication de l'API sur les domaines front pour éviter les requêtes OPTIONS.

## v2.2.0 (25/09/2018)

- [#194](https://github.com/1024pix/pix/pull/194) [FEATURE] Partage des résultats d'un parcours à une organisation (PF-216).
- [#204](https://github.com/1024pix/pix/pull/204) [FEATURE] Ajout d'un bouton et d'une page pour créer une campagne (PO-119).
- [#209](https://github.com/1024pix/pix/pull/209) [BUGFIX] Corrige les previews d'épreuves (PF-396).
- [#205](https://github.com/1024pix/pix/pull/205) [BUGFIX] Les dates de début de parcours dans le CSV doit correspondre à celle enregistré (PF-393).

## v2.1.0 (21/09/2018)

- [#207](https://github.com/1024pix/pix/pull/207) [BUGFIX] Les pop-ups ne s'ouvre plus sur les checkpoints des campagnes (PF-395).
- [#199](https://github.com/1024pix/pix/pull/199) [BUGFIX] Ne tomber sur la page de fin que lorsque nous n'avons plus de question (PF-268).
- [#195](https://github.com/1024pix/pix/pull/195) [TECH] Set scalingo formation for review apps. (PF-352).
- [#197](https://github.com/1024pix/pix/pull/197) [TECH] Mise à jour des frameworks ember et amelioration de la configuration circleCI (PF-359).

## v2.0.0 (14/09/2018)

- [#193](https://github.com/1024pix/pix/pull/193) [FEATURE] Mise à jour du header (PF-344).

## v1.62.0 (12/09/2018)

- [#191](https://github.com/1024pix/pix/pull/191) [FEATURE] Redirection sur pix.fr apres déco et dans les démo (PF-336).
- [#186](https://github.com/1024pix/pix/pull/186) [FEATURE] Tous les liens vers l'espace perso utilisent app.pix.fr (PF-346).
- [#185](https://github.com/1024pix/pix/pull/185) [FEATURE] Suppression des pages de contenus éditoriaux dans app.pix.fr (PF-333).
- [#192](https://github.com/1024pix/pix/pull/192) [BUGFIX] Erreur 500 lorsque les challenges ne sont pas retrouvés dans /details (PF-356).

## v1.61.0 (10/09/2018)

- [#181](https://github.com/1024pix/pix/pull/181) [FEATURE] Rendre accessible l'espace perso pix via l'url app.pix.fr (PF-345).
- [#178](https://github.com/1024pix/pix/pull/178) [FEATURE] Nouveau style pour la page de connexion de Pix-Orga (PO-105).
- [#177](https://github.com/1024pix/pix/pull/177) [FEATURE] Retirer le titre "Parcours e-pro" des campagnes (PF-321).
- [#174](https://github.com/1024pix/pix/pull/174) [FEATURE] Ajout de la demande d'id pix dans la création de la campagne (PO-121).
- [#184](https://github.com/1024pix/pix/pull/184) [BUGFIX] Changer Non Disponible à NA (PO-128).
- [#183](https://github.com/1024pix/pix/pull/183) [BUGFIX] La barre de progression ne doit plus afficher un nombre d'answers trop grand (PF-306).
- [#182](https://github.com/1024pix/pix/pull/182) [TECH] Prise en compte des modifications du référentiel Airtable - part 1Bis / 2 (PF-311).
- [#173](https://github.com/1024pix/pix/pull/173) [TECH] Prise en compte des modifications du référentiel Airtable - part 1 / 2 (PF-311).

## v1.60.0 (30/08/2018)

- [#169](https://github.com/1024pix/pix/pull/169) [FEATURE] Export des résultats en CSV (PO-28).
- [#162](https://github.com/1024pix/pix/pull/162) [FEATURE] Choix d'un profile cible lors de la création d'une campagne (PO-123).
- [#176](https://github.com/1024pix/pix/pull/176) [BUGFIX] Arrondi dans le CSV des résultats de la campagne (PF-340).
- [#175](https://github.com/1024pix/pix/pull/175) [BUGFIX] Afficher les "Pour en apprendre d'avantage" même lorsqu'on a bien répondu (PF-322).
- [#172](https://github.com/1024pix/pix/pull/172) [BUGFIX] Problème de téléchargement du fichier csv des profils partagées sous Firefox (PF-285).
- [#171](https://github.com/1024pix/pix/pull/171) [BUGFIX] Problème d'id dans l'url de la skill-review d'une campagne (PF-332).

## v1.59.0 (22/08/2018)

- [#148](https://github.com/1024pix/pix/pull/148) [FEATURE] Affichage de la liste des campagnes d'une organisation (PO-22).
- [#161](https://github.com/1024pix/pix/pull/161) [FEATURE] Les campagnes utilisent les profil cibles (PO-124).
- [#155](https://github.com/1024pix/pix/pull/155) [FEATURE] Rediriger sur une campagne après inscription (PF-241).
- [#156](https://github.com/1024pix/pix/pull/156) [FEATURE] Faire passer le code Campagne dans l'url de démarrage d'une campagne (PF-294).
- [#165](https://github.com/1024pix/pix/pull/165) [BUGFIX] Réparer les seeds pour les RA (PF-324).
- [#167](https://github.com/1024pix/pix/pull/167) [BUGFIX] Fix script export des snapshots d'organisation (PF-331).
- [#166](https://github.com/1024pix/pix/pull/166) [TECH] Mise à jour du script de notification JIRA quand il n'y a pas de numéro d'US dans le nom de la branche.
- [#170](https://github.com/1024pix/pix/pull/170) [TECH] Création d'un générateur de mock http pour Airtable.
- [#163](https://github.com/1024pix/pix/pull/163) [TECH] Ajout de plop.js et de générateur.
- [#159](https://github.com/1024pix/pix/pull/159) [TECH] Les profils cibles sont désormais en bases de données (PO-101).


## v1.58.1 (03/08/2018)

- \#XXX [BUGFIX] Les questions en QrocMdep s'affichent en "validées" quelque soit la réponse donnée (PF-329).


## v1.58.0 (02/08/2018)

- [#137](https://github.com/1024pix/pix/pull/137) [FEATURE] Sauvegarde des éléments de connaissance sur le profil à chaque sauvegarde de réponses (PF-243).
- [#140](https://github.com/1024pix/pix/pull/140) [FEATURE] Lancer la connexion lors d'un début de campagne (PF-237).
- [#144](https://github.com/1024pix/pix/pull/144) [FEATURE] Ajouter le champ "Publié" pour le résultat d'une certification (PF-300).
- [#146](https://github.com/1024pix/pix/pull/146) [TECH] Passer en monorepo sur scalingo (PF-305).
- [#150](https://github.com/1024pix/pix/pull/150) [TECH] Brancher les review apps sur Scalingo (PF-307).
- [#152](https://github.com/1024pix/pix/pull/152) [TECH] Intégrer la codebase de pix Orga dans le repo (PF-308).
- [#153](https://github.com/1024pix/pix/pull/153) [TECH] Ajout de la page de maintenance (PF-320).

## v1.57.0 (27/07/2018)

- [#108](https://github.com/1024pix/pix/pull/108) [FEATURE] Création d'une campagne (PO-82).
- [#119](https://github.com/1024pix/pix/pull/119) [FEATURE] Ajout des tutoriels “Pour en savoir plus” à la page des résultats (PF-63).
- [#138](https://github.com/1024pix/pix/pull/138) [FEATURE] Afficher le nom de l'organisation courante dans le menu de Pix-Orga (PO-116).
- [#135](https://github.com/1024pix/pix/pull/135) [BUGFIX] Fix certification start (PF-295).
- [#141](https://github.com/1024pix/pix/pull/141) [BUGFIX] Création d'un script pour un recalcul massif des certifications (PF-296).
- [#145](https://github.com/1024pix/pix/pull/145) [BUGFIX] Affichage de la page "Oups" pour les code erreurs API autre que 401 (PF-302).
- [#139](https://github.com/1024pix/pix/pull/139) [TECH] BSR: name usecase and factories functions.
- [#143](https://github.com/1024pix/pix/pull/143) [TECH] Utiliser la convention `(arg) => ...` partout + ajout de la règle eslint.

## v1.56.0 (23/07/2018)

- [#136](https://github.com/1024pix/pix/pull/136) [BUGFIX] Correction de la page "Oups" qui s'affiche en boucle à l'expiration de la session (PF-297).


## v1.55.0 (19/07/2018)

- [#126](https://github.com/1024pix/pix/pull/126) [FEATURE] Mettre les liens en bleu Pix et souligné dans la consigne d'une d'épreuve afin de comprendre qu'il faut cliquer (PF-126).
- [#117](https://github.com/1024pix/pix/pull/117) [FEATURE] Reprise d'une évaluation de type Smart Random (US-93).
- [#129](https://github.com/1024pix/pix/pull/129) [FEATURE] Afficher le % d'avancement du smart placement (PF-78).
- [#132](https://github.com/1024pix/pix/pull/132) [FEATURE] Mise à jour du profil cible pour rendre l'expérience plus rapide pour les panels (PF-293).
- [#133](https://github.com/1024pix/pix/pull/133) [BUGFIX] Correction du bug affichant les compétences du profil plutôt que celui des certifs (PF-282).
- [#131](https://github.com/1024pix/pix/pull/131) [BUGFIX] La route /admin/certifications doit retourner des informations même quand la certif n'est pas terminé (PF-291).
- [#130](https://github.com/1024pix/pix/pull/130) [BUGFIX] Correction du bug des questions en doubles dans le smart-random (PF-287).
- [#124](https://github.com/1024pix/pix/pull/124) [BUGFIX] Bug d'affichage du bouton demo IE (PF-179).
- [#134](https://github.com/1024pix/pix/pull/134) [CLEANUP] Amélioration de la gestion d'erreurs côté front (PF-292).
- [#128](https://github.com/1024pix/pix/pull/128) [CLEANUP] Suppression de la propriété "authenticationRoute" inutile dans les routes Ember.
- [#118](https://github.com/1024pix/pix/pull/118) [CLEANUP] Suppression des sections "partenaires" et "bêta-testeur" sur la page d'accueil (PF-155).
- [#114](https://github.com/1024pix/pix/pull/114) [TECH] Réparer la route /details des certifs (PF-253).

## v1.54.0 (10/07/2018)

- [#116](https://github.com/1024pix/pix/pull/116) [FEATURE] Ajout d'une phrase sous les tuto (PF-281).
- [#120](https://github.com/1024pix/pix/pull/120) [FEATURE] Correction wording sur tutoriels (PF-283).
- [#103](https://github.com/1024pix/pix/pull/103) [FEATURE] Affiche le pourcentage de maitrise du profile cible (PF-94).
- [#111](https://github.com/1024pix/pix/pull/111) [FEATURE] Afficher des tutoriaux sur la page de réponse (PF-62).
- [#113](https://github.com/1024pix/pix/pull/113) [FEATURE] Ajout d'une modale demandant confirmation avant de rejouer une épreuve (PF-40).
- [#121](https://github.com/1024pix/pix/pull/121) [BUGFIX] Respecter la variable DATABASE_CONNECTION_POOL_MAX_SIZE pour le pool PG en staging (PF-284).
- [#123](https://github.com/1024pix/pix/pull/123) [BUGFIX] Corrections du CSS pour les tutos.
- [#112](https://github.com/1024pix/pix/pull/112) [TECH] Faire que le area-repository utilise un data source airtable (PF-191).
- [#110](https://github.com/1024pix/pix/pull/110) [BSR] Suppression d'une vieille route.

## v1.53.0 (29/06/2018)

- [#107](https://github.com/1024pix/pix/pull/107) [FEATURE] Mise à jour des acquis du profil cible pour les panels PIC (PF-105).
- [#106](https://github.com/1024pix/pix/pull/106) [FEATURE] Ajout d'un message d'erreur dans la page de saisie du code accès d'une certification en cas de code vide (PF-19).
- [#99](https://github.com/1024pix/pix/pull/99) [FEATURE] Modification de l'écran de fin de certif (PF-164).
- [#109](https://github.com/1024pix/pix/pull/109) [TECH] Ajout de traces de log dans la sélection du next challenge (PF-267).
- [#105](https://github.com/1024pix/pix/pull/105) [TECH] CI: Correction des tests en préparation d'un passage du PostgreSQL (PF-259).
- [#100](https://github.com/1024pix/pix/pull/100) [TECH] Corrections mineures sur les scripts de déploiement (PF-256).
- [#91](https://github.com/1024pix/pix/pull/91) [BUGFIX] Erreur dans le calcul des certifications (PF-178).

## 1.52.0 (19/06/2018)

- [#85](https://github.com/1024pix/pix/pull/85) [FEATURE] Ajout des niveaux des compétences dans le résultat d'une certif (PF-11).
- [#86](https://github.com/1024pix/pix/pull/86) [FEATURE] Barre de progression dans un test Smart Placement (PF-72).
- [#87](https://github.com/1024pix/pix/pull/87) [FEATURE] Afficher le pixScore et le Commentaire du jury sur la page de résultat de certif (PF-20).
- [#92](https://github.com/1024pix/pix/pull/92) [FEATURE] Creation du endpoint /api/users/{id} avec remontée de la validation des CGU de Pix-Orga (PO-106).
- [#93](https://github.com/1024pix/pix/pull/93) [TECH] Export des profils partagés via un script (PF-235).
- [#98](https://github.com/1024pix/pix/pull/98) [TECH] Suppression du lint avant le git push et création des scripts de tests combinés test:lint (pf-251).
- [#96](https://github.com/1024pix/pix/pull/96) [BUGFIX] Exporte l'heure de rechargement du cache en variable d'environnement (PF-228).
- [#97](https://github.com/1024pix/pix/pull/97) [BUGFIX] Retrofit PF-154 and PF-103 in SmartRandom + BSR (PF-231).

## v1.51.1 (13/06/2018)

- [#95](https://github.com/1024pix/pix/pull/95) [EXPEDIT] Les boutons radio sous IE n'ont pas la valeur de la réponse (pf-242).

## v1.51.0 (08/06/2018)


- [#69](https://github.com/1024pix/pix/pull/69) [FEATURE] Ajout du simulateur embarqué pour les épreuves de type e-preuve (PF-38).
- [#80](https://github.com/1024pix/pix/pull/80) [FEATURE] Implémentation de l'authentification sur pix-orga (api) (PO-18).
- [#90](https://github.com/1024pix/pix/pull/90) [TECH] Ajout d'une fiche de poste (PF-229).
- [#70](https://github.com/1024pix/pix/pull/70) [TECH] Mise en place d'un cache devant Airtable (PI-26).
- [#84](https://github.com/1024pix/pix/pull/84) [TECH] Ajouter les RA en commentaire des issues Jira (PF-222).
- [#88](https://github.com/1024pix/pix/pull/88) [TECH] Mise à jour des routes pour vider le cache (PF-226).
- [#83](https://github.com/1024pix/pix/pull/83) [TECH] Montée de version de Ember.js de 2.18 vers 3.2 (PF-207).
- [#81](https://github.com/1024pix/pix/pull/81) [TECH] Lance le linter avant chaque push (PF-205).
- [#89](https://github.com/1024pix/pix/pull/89) [BUGFIX] Rétrogradation de Ember Data qui introduit une régression à partir de la version 3.1 (PF-207).
- [#82](https://github.com/1024pix/pix/pull/82) [BUGFIX] Les skills doivent être comparés par noms (PF-203).

## v1.50.0 (31/05/2018)

- [#75](https://github.com/1024pix/pix/pull/75) [FEATURE] Ajout d'une page de résultats intermédiaires pour le smart random (PF-59).
- [#65](https://github.com/1024pix/pix/pull/65) [FEATURE] Ajout des tests trans-competence a l'algo SmartRandom (PF-91).
- [#79](https://github.com/1024pix/pix/pull/79) [TECH] Extraction du Object.assign des constructeurs du Domain (Pf-189).
- [#74](https://github.com/1024pix/pix/pull/74) [BUGFIX] L'algorithme de positionnement propose plusieurs déclinaisons du même acquis dans certains cas (PF-154).
- [#76](https://github.com/1024pix/pix/pull/76) [BUGFIX] Correction des bogues sur la gestion de la fin d'un test (PF-170).

## v1.49.3 (25/05/2018)

- [BUGFIX] Add .circle-cache-key to .gitignore.

## v1.49.2 (25/05/2018)

- [BUGFIX] fix circleci cache key.

## v1.49.1 (25/05/2018)

- [BUGFIX] Checkout the right branch on CircleCi.

## v1.49.0 (25/05/2018)

- [#43](https://github.com/1024pix/pix/pull/43) [HOTFIX] Amélioration de la sécurité lors de la création d'un compte utilisateur (PF-103).
- [#61](https://github.com/1024pix/pix/pull/61) [FEATURE] Ajout du commentaire du jury sur la liste des certifications (PF-13).
- [#71](https://github.com/1024pix/pix/pull/71) [FEATURE] Création de la page de détail d'une certification (PF-5).
- [#56](https://github.com/1024pix/pix/pull/56) [FEATURE] Afficher le statut d'une certification (PF-14).
- [#63](https://github.com/1024pix/pix/pull/63) [FEATURE] Ajout d'une URL pour lancer un test de campagne avec l'algo Smart Random (PF-57).
- [#60](https://github.com/1024pix/pix/pull/60) [FEATURE] L'algo doit parcourir les tubes "facile" en priorité (PF-149).
- [#59](https://github.com/1024pix/pix/pull/59) [TECH] Le message de commit sera automatiquement préfixé avec le numero de l‘US de la branche.
- [#73](https://github.com/1024pix/pix/pull/73) [BUGFIX] L'algorithme de positionnement ne filtre pas la première question par acquis prioritaire (PF-176).
- [#58](https://github.com/1024pix/pix/pull/58) [BUGFIX] Gestion des erreurs 500 lors du partage d'un profil de compétence (PF-140).

## v1.48.0 (04/05/2018)

- [#36](https://github.com/1024pix/pix/pull/36) [FEATURE] Affichage d'un indice à la fin du test lorsque l'utilisateur a donné une mauvaise réponse (US-1105).
- [#48](https://github.com/1024pix/pix/pull/48) [FEATURE] Publier une certification (PF-12).
- [#49](https://github.com/1024pix/pix/pull/49) [FEATURE] Ajout et mise à jour des des informations légales (PF-66).
- [#40](https://github.com/1024pix/pix/pull/40) [FEATURE] Mise à jour des entêtes du CSV contenant l'export des résultats de certifications (US-1238).
- [#41](https://github.com/1024pix/pix/pull/41) [FEATURE] Modification de la route GET /organizations pour permettre à un Pix Master de récupérer la liste de toutes les organisations de façon sécurisée (US-1248).
- [#37](https://github.com/1024pix/pix/pull/37) [FEATURE] Afficher la liste des certifications des utilisateurs (US-1134).
- [#53](https://github.com/1024pix/pix/pull/53) [BUGFIX] Résolution du bug sur staging pour récupérer les certifications (US-1134).
- [#54](https://github.com/1024pix/pix/pull/54) [TECH] Ajout d'un jeu d'exemples pour une certification rejeté par l'algo (PF-98).
- [#52](https://github.com/1024pix/pix/pull/52) [TECH] Configuration de Swagger (documentation de l'API).
- [#45](https://github.com/1024pix/pix/pull/45) [TECH] Déploiement automatique de preview et maths avec la PROD (PI-6).
- [#42](https://github.com/1024pix/pix/pull/42) [TECH] BSR des scripts de release et suppression du commit de merge (PI-10).
- [#44](https://github.com/1024pix/pix/pull/44) [TECH] Refactoring de l'endpoint de choix de la prochaine question (PF-100).
- [#46](https://github.com/1024pix/pix/pull/46) [BSR] Pointer l'URL d'intégration vers integration.pix.fr.

## v1.47.0 (17/04/2018)

- [#14](https://github.com/1024pix/pix/pull/14) [FEATURE] Ajout de nouveaux endpoints d'authentification OAuth 2 (US-1205).
- [#23](https://github.com/1024pix/pix/pull/23) [FEATURE] Ajout d'un identifiant externe sur les certifications (US-1190).
- [#1](https://github.com/1024pix/pix/pull/1) [FEATURE] Ajout des infos utilisateurs dans l'endpoint api/admin/certifications/:id (US-1103).
- [#11](https://github.com/1024pix/pix/pull/11) [FEATURE] Génération de CSV de résultats certifications à partir d'un id de session (US-1182).
- [#16](https://github.com/1024pix/pix/pull/16) [FEATURE] Ajout de toutes les informations dans le CSV d'export (US-1181).
- [#25](https://github.com/1024pix/pix/pull/25) [BUGFIX] Script de récupération de seconde chance (US-1228).
- [#33](https://github.com/1024pix/pix/pull/33) [BUGFIX] Script de suppression de compte (US-1233).
- [#30](https://github.com/1024pix/pix/pull/30) [TECH] Jette une erreur métier lorsqu’on charge les détails d'une certification qui n’est pas complétée (US-1230).
- [#20](https://github.com/1024pix/pix/pull/20) [TECH] JV un commentaire Github après un deploy (US-1224).
- [#21](https://github.com/1024pix/pix/pull/21) [CLEANUP] Calcul des marks pour les anciennes certifications (US-1051).
- [#29](https://github.com/1024pix/pix/pull/29) [TECH] Corriger la suite de tests (US-1232).
- [#28](https://github.com/1024pix/pix/pull/28) [TECH] rapport de tests en Piti points (US-1231).
- [#12](https://github.com/1024pix/pix/pull/12) [TECH] Faire pointer le script de generation de changelog vers le repo 1024pix (US-1208).
- [#15](https://github.com/1024pix/pix/pull/15) [TECH] Mise à jour des fingerprints SSH (US-1210).
- [#22](https://github.com/1024pix/pix/pull/22) [TECH] Les métriques de /metrics exposent le path dans les compteurs api_request (US-1202).
- [#17](https://github.com/1024pix/pix/pull/17) [TECH] Corriger le problème de CORS (US-1216).
- [#18](https://github.com/1024pix/pix/pull/18) [TECH] Ne pas pousser sur dokku api-production lors des MEP (US-1201).
- [#6](https://github.com/1024pix/pix/pull/6) [TECH] Modifications pour Scalingo (US-1189).
- [#10](https://github.com/1024pix/pix/pull/10) [TECH]Changer les URL du README pour pointer vers le nouveau repo (US-1110).
- [#13](https://github.com/1024pix/pix/pull/13) [BSR] Supprimer les références vers les vieux repositories (US-1212).

## v1.46.0 (05/04/2018)

- [#699](https://github.com/betagouv/pix/pull/699) [FEATURE] Ajout d'une route pour modifier les résultats d'une certification (US-1088).
- [#2](https://github.com/1024pix/pix/pull/2) [FEATURE] La notation "Partager" en remplacer par "Envoyer" (US-1171).
- [#729](https://github.com/betagouv/pix/pull/729) [BUGFIX] Correction des migrations sur staging (US-1191).
- [#727](https://github.com/betagouv/pix/pull/727) [BUGFIX]Correction de staging (US-1191).
- [#9](https://github.com/1024pix/pix/pull/9) [BUGFIX] Correction des assessments sur staging (US-1194).
- [#5](https://github.com/1024pix/pix/pull/5) [BUGFIX]Correction de staging (US-1191).

## v1.45.0 (30/03/2018)

- [#717](https://github.com/betagouv/pix/pull/717) [FEATURE] Importation des données de certifications à partir d'un csv (US-1052).
- [#719](https://github.com/betagouv/pix/pull/719) [FEATURE] Ajout des infos utilisateurs dans l'endpoint api/admin/certifications/:id (US-1103).
- [#709](https://github.com/betagouv/pix/pull/709) [Bugfix] Ne poste pas de commentaire Trello sur une branche de release (US-1130).
- [#726](https://github.com/betagouv/pix/pull/726) Ajout d'une fiche de poste (US-1188).
- [#724](https://github.com/betagouv/pix/pull/724) Amélioration du style du bouton Se Déconnecter (US-1139).
- [#718](https://github.com/betagouv/pix/pull/718) Correction du bug sur le calcul des résultats de certification (US-1131).
- [#720](https://github.com/betagouv/pix/pull/720) [TECH] Ajout d'un script de suppression d'évaluation (US-1174).
- [#722](https://github.com/betagouv/pix/pull/722) [TECH] Ajout d'index sur les tables (US-1180).


## v1.44.1 (27/03/2018)

- [#710](https://github.com/betagouv/pix/pull/710) [BUGFIX] Correction des erreurs de validation à la création de compte (US-1128).

## v1.44.0 (21/03/2018)

- [#693](https://github.com/betagouv/pix/pull/693) [FEATURE] Sécurisation par défaut des ressources API (US-1094).
- [#715](https://github.com/betagouv/pix/pull/715) [FEATURE] Code départ pour les certifications (US-1117).
- [#708](https://github.com/betagouv/pix/pull/708) [TECH] Mise à jour de la version de momentJS (US-1124).
- [#716](https://github.com/betagouv/pix/pull/716) [BUGFIX] Changement du nom de la table sessions dans la migration (US-1117).
- [#714](https://github.com/betagouv/pix/pull/714) [BUGFIX] Amélioration du message d'erreur en cas de droits manquants (US-1151).
- [#713](https://github.com/betagouv/pix/pull/713) [BUGFIX] Ouverture de la route /api/assessments/{id}/solutions/{answerId} nécessaire pour les tests de démo (US-1150).
- [#705](https://github.com/betagouv/pix/pull/705) [BUGFIX] Réparation du script de suppression des utilisateurs (US-1120).

## v1.43.0 (14/03/2018)

- [#701](https://github.com/betagouv/pix/pull/701) [BUGFIX] Correction du bug de recalcul du résultat d'une certification (US-1101).

## v1.42.0 (08/03/2018)

- [#695](https://github.com/betagouv/pix/pull/695) [FEATURE] Mise à jour des informations utilisateur pour les certifications (US-1029).
- [#702](https://github.com/betagouv/pix/pull/702) [BUGFIX] Correction des anciens assessments avec un pixScore à 0 (US-1115).
- [#700](https://github.com/betagouv/pix/pull/700) [TECH] Renommage des routes d'administration des certifications (US-1116).

## v1.41.0 (06/03/2018)

- [#691](https://github.com/betagouv/pix/pull/691) [FEATURE] Restriction des accès aux informations de l'endpoint API GET api/organizations (US-1091).
- [#696](https://github.com/betagouv/pix/pull/696) [BUGFIX] Correction du bug des résultats pas affichés dans le bon ordre en production (US-1054).
- [#680](https://github.com/betagouv/pix/pull/680) [BUGFIX] Gestion de la casse pour les emails (US-1069).

## v1.40.0 (26/02/2018)

- [#682](https://github.com/betagouv/pix/pull/682) [FEATURE] Récupérer toutes les informations d'un certification (US-1068).
- [#689](https://github.com/betagouv/pix/pull/689) [TECH] Ajout de données pour les review-apps (US-1095).
- [#687](https://github.com/betagouv/pix/pull/687) [FEATURE] Adapter la colonne "Numero Etudiant" en fonction du type de l'organisation prescripteure ("SUP", "SCO", "PRO")  (US-1087).
- [#690](https://github.com/betagouv/pix/pull/690) [CLEANUP] Suppression de l'email dans le jeton d'accès JWT (US-1098).
- [#679](https://github.com/betagouv/pix/pull/679) [BUGFIX] Amélioration du script récupérant les résultats de certification (US-1067).

## v1.39.0 (19/02/2018)

- [#678](https://github.com/betagouv/pix/pull/678) [CLEANUP] Suppression de la table 'scenarios' qui n'était plus utilisée (US-1089).
- [#681](https://github.com/betagouv/pix/pull/681) [FEATURE] Ajouter le code campagne lors du partage d'un profil avec une organisation PRO (US-1085).
- [#686](https://github.com/betagouv/pix/pull/686) [CLEANUP] Suppression de routes et API endpoints obsolètes (US-1090).
- [#688](https://github.com/betagouv/pix/pull/688) [CLEANUP] Suppression des imports de fonctions Mocha inutiles dans les tests de l'API (US-1096).
- [#683](https://github.com/betagouv/pix/pull/683) [CLEANUP] Remise en place de test front skippés (US-1093).
- [#684](https://github.com/betagouv/pix/pull/684) [FEATURE] Changement du texte dans le partage de profil pour les PRO (US-1086).
- [#677](https://github.com/betagouv/pix/pull/677) [FEATURE] Utilisation de la nouvelle table Airtable des acquis (US-1025).
- [#676](https://github.com/betagouv/pix/pull/676) [CLEANUP] Nettoyage de l'algo CAT (US-1074).
- [#673](https://github.com/betagouv/pix/pull/673) [FEATURE] Ajout d'un endpoint de création de session (US-1028).
- [#671](https://github.com/betagouv/pix/pull/671) [FEATURE] Récupérer les date de début et de fin de certification dans le CSV des résultats (US-1027).

## v1.38.0 (07/02/2018)

- [#670](https://github.com/betagouv/pix/pull/670) [FEATURE] Mise à jour du Texte pour l'engagement et à mise à jour logo marianne sur le pied de page (US-1050).
- [#675](https://github.com/betagouv/pix/pull/675) [FEATURE] Certification impossible si le profil n'est pas suffisamment rempli pour être certifié (US-1012).
- [#674](https://github.com/betagouv/pix/pull/674) [BUGFIX] Calcul du score dans le cas où on reprend un test déjà terminé (US-992).
- [#672](https://github.com/betagouv/pix/pull/672) [BUGFIX] Vérification que l'on trouve bien un Test d'après le courseId dans le profil (US-1047).
- [#667](https://github.com/betagouv/pix/pull/667) [BUGFIX] Résolution du bug sur les niveaux des compétences, certifiés sur deux challenges (dont 1 QROCM-dep) uniquement (US-1022).

## 1.37.0 (31/01/2018)

- [#638](https://github.com/betagouv/pix/pull/638) [FEATURE] Afficher une barre de progression sur les pages de test de certification (US-910).
- [#658](https://github.com/betagouv/pix/pull/658) [FEATURE] Affichage des tests réalisés sur le /board au lieu du % (US-946).
- [#668](https://github.com/betagouv/pix/pull/668) [BUGFIX] Correction de la migration sur les colonnes de snapshots (US-1059).
- [#650](https://github.com/betagouv/pix/pull/650) [TECH] Ajout d'un script de déploiement pour l'appli Maths (US-1010).
- [#664](https://github.com/betagouv/pix/pull/664) [TECH] Script pour récupérer un changelog propre (US-1039).
- [#666](https://github.com/betagouv/pix/pull/666) [BSR] Suppression des "défis Pix de la semaine" (US-1043).

## 1.36.0 (22/01/2018)

- [#662](https://github.com/sgmap/pix/pulls/662) [FEATURE] Page de résultats de certification est rendue inaccessible (renvoi vers homepage) (US-998_2).
- [#660](https://github.com/sgmap/pix/pulls/660) [FEATURE] Page de résultats de certification est rendue inaccessible (renvoi vers homepage) (US-998_1).
- [#657](https://github.com/sgmap/pix/pulls/657) [FEATURE] Ajout code campagne partage avec SCO (US-938).
- [#643](https://github.com/sgmap/pix/pulls/643) [FEATURE] Filtrer les assessments récupéré pour la certif d'après la date (US-1021).
- [#641](https://github.com/sgmap/pix/pulls/641) [FEATURE] Enregistrement de la date de fin d'une certification (US-986).
- [#661](https://github.com/sgmap/pix/pulls/661) [TECH] Montée de version de Ember 2.16 à 2.18 (US-1031).
- [#656](https://github.com/sgmap/pix/pulls/656) [TECH] Normalisation des URLs coté API (US-1037).

## 1.35.0 (10/01/2018)

- [#636](https://github.com/sgmap/pix/pulls/636) [FEATURE] Ajout d'un script pour récupérer les résultats de certification (US-1014).
- [#635](https://github.com/sgmap/pix/pulls/635) [FEATURE] Choisir une question aléatoirement (US-311).
- [#631](https://github.com/sgmap/pix/pulls/631) [FEATURE] Ajout du statut de la certification dans l'endpoint /api/certification-courses (US-961)
- [#639](https://github.com/sgmap/pix/pulls/639) [BUGFIX] Retirer le message d'erreur une fois que la question a été validé (US-1008).
- [#637](https://github.com/sgmap/pix/pulls/637) [BUGFIX] Ajout de padding pour affichage headers dans firefox (US-1009).
- [#634](https://github.com/sgmap/pix/pulls/634) [BUGFIX] Correction de l'affichage des réponses sous Firefox 57 (US-1007)
- [#633](https://github.com/sgmap/pix/pulls/633) [BUGFIX] Résolution du problème de surestimation du niveau (US-389).
- [#642](https://github.com/sgmap/pix/pulls/642) [TECH] Suppression du package ./cli (code inutile) (US-1024).

## 1.34.0 (18/12/2017)

- [#630](https://github.com/sgmap/pix/pulls/630) [FEATURE] Au chargement d'un test, le message affiché ne fait pas mention du temps (US-1011)
- [#625](https://github.com/sgmap/pix/pulls/625) [FEATURE] Remonter les profils certifiés (US-950).
- [#629](https://github.com/sgmap/pix/pulls/629) [BUGFIX] Gestion les challenges qui ne sont plus valide (US-982).
- [#622](https://github.com/sgmap/pix/pulls/622) [BUGFIX] Fix challenges with multiple skills (US-999).
- [#619](https://github.com/sgmap/pix/pulls/619) [CLEANUP] Nettoyer les serializers JSON API pour les mettre au (nouveau) standard. (US-996)
- [#628](https://github.com/sgmap/pix/pulls/628) [TECH] Ajout d'un script de suppression d'utilisateurs (US-1006).

## 1.33.0 (12/12/2017)

- [#626](https://github.com/sgmap/pix/pulls/626) [FEATURE] Sécurisation de la création de session de certification (US-1004).
- [#624](https://github.com/sgmap/pix/pulls/624) [FEATURE] Génération d'un code de session unique (US-1005).

## 1.32.1 (08/12/2017)

- [#623](https://github.com/sgmap/pix/pulls/623) [TECH] Renommage de la route de certification (US-1003).

## 1.32.0 (07/12/2017)

- [#620](https://github.com/sgmap/pix/pulls/620) [FEATURE] Création d'une route /test-de-certification/id pour reprendre un test (US-997).
- [#618](https://github.com/sgmap/pix/pulls/618) [FEATURE] Reprise d'une certification qui fonctionne (US-981).
- [#615](https://github.com/sgmap/pix/pulls/615) [FEATURE] Sauvegarde du userId associé au test de certification en base de données (US-960).
- [#612](https://github.com/sgmap/pix/pulls/612) [BUGFIX] Réparation du lancement des tests de positionnement (US-1002).
- [#614](https://github.com/sgmap/pix/pulls/614) [TECH] Diminution du temps de chargement de la première épreuve d'un test de positionnement (US-928).

## 1.31.0 (05/12/2017)

- [#610](https://github.com/sgmap/pix/pulls/610) [FEATURE] Calculer le score d'une certification (US-886).
- [#605](https://github.com/sgmap/pix/pulls/605) [FEATURE] Création d'un burger menu (US-692).
- [#617](https://github.com/sgmap/pix/pulls/617) [BUGFIX] Redirection vers la page de résultats à la fin d'une preview de challenge et plus sur la page de fin de certification (US-945).
- [#616](https://github.com/sgmap/pix/pulls/616) [BUGFIX] Correction du calcul de score (US-994).
- [#608](https://github.com/sgmap/pix/pulls/608) [TECH] Correction du déploiement de preview (US-977).

## 1.30.0 (04/12/2017)

- [#612](https://github.com/sgmap/pix/pulls/612) [FEATURE] Mettre le Prénom avant le Nom à l'inscription (US-715).
- [#603](https://github.com/sgmap/pix/pulls/603) [FEATURE] Répondre à des questions d'un test de certification (US-890).
- [#597](https://github.com/sgmap/pix/pulls/597) [FEATURE] Ajouter un loader quand une question est passée/validée et modifier le "Je passe" (US-898).
- [#613](https://github.com/sgmap/pix/pulls/613) [BUGFIX] Fix affichage des boutons "replay"/"seconde chance" des tests de positionnement (US-965).
- [#611](https://github.com/sgmap/pix/pulls/611) [BUGFIX] resolution du bug qui ne lançait pas le test de certification si aucun challenge n'est associé à un skill déjà validé (US-980).
- [#608](https://github.com/sgmap/pix/pulls/608) [TECH] Correction du déploiement de preview (US-977).

## 1.29.2 (01/12/2017)

- [#602](https://github.com/sgmap/pix/pulls/602) [BUGFIX] Correction d'une modale grise (US-921).
- [#591](https://github.com/sgmap/pix/pulls/591) [TECH] Utilisation de vues privées au niveau des Epreuves (dans Airtable) afin de sécuriser (stabiliser) la plateforme (US-892).
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
- [#154](https://github.com/sgmap/pix/pull/154) [CLEANUP] Remaniement des tests d'acceptance pour PIX-live.

## 1.0.0 (15/11/2016)

- [FEATURE] Afficher la page d'accueil.
- [FEATURE] Afficher la liste des tests (max 4 tests) depuis la page d'accueil.
- [FEATURE] Souscrire en tant que bêta-testeur via une adresse email.
- [FEATURE] Démarrer une évaluation pour un tests donné.
- [FEATURE] Afficher une épreuve (titre, consigne, propositions de réponses).
- [FEATURE] Répondre à une épreuve (QCU, QCM, QROC, QROCm).
- [FEATURE] Afficher la page de fin d'un test avec le récapitulatif des questions / réponses.
