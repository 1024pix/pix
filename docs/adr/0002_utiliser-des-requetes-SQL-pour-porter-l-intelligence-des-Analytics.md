# Utiliser des requetes SQL pour porter l'intelligence des Analytics

## État

Accepté

## Contexte

L'épic des Analytics n'a pas besoin d'objet métier pour afficher des données en Front.\
L'ensemble des informations à afficher ce base sur des "calculs simples" (addition/moyenne/regroupement) 
des données déjà existantes.\

## Décision

Nous utiliserons des requêtes SQL / PGSQL pour porter la logique mathématique des Analytics.

## Consequences

\+ meilleur ratio performance/maintainabilité.\
\+ l'ensemble du code peut-être testé.\
\- les requêtes utilisées dans les repository sont plus longues et moins explicite à la lecture.
\- les fichiers des controllers et usecases sont "passe-plat".
