# PIX Changelog
  
## 4.0.0 (19/01/0217)

- [#232](https://github.com/sgmap/pix/pull/232) [FEATURE] Afficher une page avec un message d'avertissement lorsque la prochaine épreuve est timée.
- [#240](https://github.com/sgmap/pix/pull/240) [FEATURE] Ajout de la page de présentation du projet.
- [#239](https://github.com/sgmap/pix/pull/239) [INFRA] Développement et déploiement du CLI d'administration de l'infra.

## 3.1.1 (12/01/2017)

- [#238](https://github.com/sgmap/pix/pull/238) [DOC] Formatage du fichier CHANGELOG

## 3.1.0 (12/01/2017)

- [#236](https://github.com/sgmap/pix/pull/236) [BUGFIX] La validation de certaines épreuves QROCM-dep est fausse
- [#230](https://github.com/sgmap/pix/pull/230) [DOC] Mise-à-jour du fichier README.md pour l'API et ajout d'une tâche NPM 'help'
- [#228](https://github.com/sgmap/pix/pull/228) [FEATURE] Afficher un message d'avertissement (contre le support incomplet du media mobile) pour les usagers sur smartphone
- [#226](https://github.com/sgmap/pix/pull/226) [FEATURE] Afficher un compteur de temps pour les épreuves chronométrées
- [#221](https://github.com/sgmap/pix/pull/221) [FEATURE] Pouvoir télécharger un fichier au format souhaité  review asked

## 3.0.0 (03/01/2017)

- [#214](https://github.com/sgmap/pix/pull/214) [FEATURE] Affichage du libellé "Correction automatique en cours de développement ;)" dans l'écran de fin d'un test 
- [#213](https://github.com/sgmap/pix/pull/213) [FEATURE] Validation d'une épreuve d'un test adaptatif 
- [#208](https://github.com/sgmap/pix/pull/208) [FEATURE] Ajout de la validation automatique des questions de type QROCm-depsco 
- [#219](https://github.com/sgmap/pix/pull/219) [DOC] Mise à jour de la procédure d'installation dans le README

## 2.1.1 (07/12/2016)

- [#196](https://github.com/sgmap/pix/pull/196) [INFRA] Correction du script de livraison release-publish.

## 2.1.0 (07/12/2016)

- [#193](https://github.com/sgmap/pix/pull/193) [CLEANUP] Ajout de tests unitaires et d'intégration pour le composant qcu-proposals
- [#187](https://github.com/sgmap/pix/pull/187) [FEATURE] Gestion du bouton back.
- [#187](https://github.com/sgmap/pix/pull/187) [BUGFIX] Diverses corrections de bugs dans l'écran de fin de test : réponses en doublons, points de suspensions dans les intitulés, validation des QCM fausse.
- [#185](https://github.com/sgmap/pix/pull/185) [INFRA] Montée de version d'Ember ~2.8.0 à ~2.10.0.

## 2.0.0 (30/11/2016)

- [#160](https://github.com/sgmap/pix/pull/160) [FEATURE] Suppression du tracking Google Analytics.
- [#181](https://github.com/sgmap/pix/pull/181) [INFRA] Mise en place de npm-run-all pour faciliter et accélérer le développement.
- [#285](https://github.com/sgmap/pix/pull/285) [CLEANUP] Suppression de tout code lié à la session.
- [#177](https://github.com/sgmap/pix/pull/177) [CLEANUP] Remise en route du linter.
- [#175](https://github.com/sgmap/pix/pull/175) [CLEANUP] Montée de version des dépendances.
- [#174](https://github.com/sgmap/pix/pull/174) [CLEANUP] Refactoring du composant challenge-item.
- [#173](https://github.com/sgmap/pix/pull/173) [INFRA] Réactivation et consolidation de la couverture de code du projet.
- [#172](https://github.com/sgmap/pix/pull/172) [CLEANUP] suppression du cache pour le contrôleur "GET /courses" dans l'API.
- [#171](https://github.com/sgmap/pix/pull/171) [INFRA] Changement de la configuration de l'intégration continue CircleCI.

## 1.2.1 (24/11/2016)

- [#165](https://github.com/sgmap/pix/pull/165) [BUGFIX] Correction de la souscription en tant que beta-testeur.

## 1.2.0 (24/11/2016)

- [#272](https://github.com/sgmap/pix/pull/272) [BUGFIX] Gestion du Responsive Web Design.
- [#164](https://github.com/sgmap/pix/pull/164) [DOC] Ajout du fichier CHANGELOG pour suivre les évolutions de la plateforme.

## 1.1.0 (23/11/2016)

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
