# Pix Changelog

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
