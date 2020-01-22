# 5. Calcul des pix

Date : 2020-01-22

## État

Draft

## Contexte

Le référentiel des Acquis et Compétences est actuellement stocké et géré dans Airtable.  

À chaque Acquis est associé une valeur en `pix`.  Cette valeur est la résultante d'un calcul expliqué dans la [documentation](../Calcul-Airtable.md). 

Dans le cadre de Pix+, des Acquis hors Compétences numériques sont ajoutés. Ces Acquis ne doivent pas influencer le nombre de `pix` gagné par l'utilisateur.  
 
## Décision

Le calcul pourrait être déplacée dans le datasource côté `API`, ce qui aurait pour conséquences de documenter et sécuriser le calcul via des tests unitaires.  
Toutefois, il est décidé que l'effort que cela représente versus les gains apportés est trop important.  
Nous décidons donc de faire évoluer le calcul dans Airtable.

## Conséquences

La formule de calcul ainsi que la documentation sont mises à jour.

### Architecture

D'un point de vue architecture logicielle, aucune évolution n'est nécessaire.
