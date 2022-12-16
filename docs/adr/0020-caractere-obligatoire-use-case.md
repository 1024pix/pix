# 20. Est-il obligatoire d'implémenter un use-case dans toutes les situations ?

Date : 2020-01-25

## État
Adopté

## Contexte 
Il existe dans le repository des use-case réduits à un appel de dépendance.
```javascript
module.exports = function getTargetProfileDetails({ targetProfileId, targetProfileWithLearningContentRepository }) {
  return targetProfileWithLearningContentRepository.get({ id: targetProfileId });
};
```
Nous avons besoin de savoir s'il faut systématiquement créer un use-case, même s'il ne contient qu'un seul appel à la dépendance injectée.


### Solution n°1 : Ne pas créer systématiquement un use-case par route

Avantages :
- moins verbeux : deux fichiers de moins (implémentation + test)

Inconvénients :
- arbitrage à effectuer à chaque modification de la route : 
  faut-il extraire le code du controller dans un use-case ?

### Solution n°2 : Créer systématiquement un fichier sous le dossier use-case

Avantages :
- pas de réflexion sur la nécessité de créer un use-case 

Inconvénients :
- plus verbeux

## Décision
La solution n°2 est adoptée

## Conséquences
Toutes les routes créées feront appel à un use-case.
Pas de reprise systématique de l'existant.
