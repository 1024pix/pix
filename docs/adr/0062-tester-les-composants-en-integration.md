# 62. Tester les composants en intégration

Date : 2025-11-04

## État

En cours

## Contexte

Dans nos applications front (Mon-Pix, Orga, Certif, Admin), des composants sont parfois testés unitairement. Plusieurs raisons nous portent à préférer désormais des tests réalisés en intégration pour ces composants : 
 - Une meilleure couverture fonctionnelle, en testant le composant dans son contexte d'utilisation réel.
 - Débloquer la montée de version vers Glimmer v2, bloquée actuellement sur Mon-Pix. 
 - Suivre les recommandations d'Ember en matière de tests de composants.
 - Avoir une architecture en diamant qui favorise les tests d'intégration et est réputée plus adaptée aux architectures DDD.

## Solution
- Migrer les tests unitaires de composants existants vers des tests d'intégration.
- Pour les nouveaux composants, écrire directement des tests d'intégration.
