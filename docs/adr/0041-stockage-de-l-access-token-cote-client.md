# Stockage de l'access token côté client

Date : 2023-01-26

## État

Confirmé

## Contexte

Dans le cadre de l'augmentation globale de la sécurité, nous avons cherché à améliorer la sécurité 
du stockage de l'access token conformément aux bonnes pratiques en remplaçant l'usage du 
localStorage par le cookieStorage (voir lien : https://dev.to/rdegges/please-stop-using-local-storage-1i04).

De base EmberSimpleAuth utilise le localstorage pour gérer la session de l'utilisateur.

Nous utilisons le flow OAuth2 (custom) pour l'authentification des utilisateurs.

Cet authenticator est fortement lié à la gestion de la session par EmberSimpleAuth.

Ce dernier utilise les informations stockées dans la session pour gérer le rafraichissement
de l'access token avant expiration (expires_in, refresh_token)

## Solution : Cookie

**Description :**

Utilisation du store CookieStore de EmberSimpleAuth à la place de AdaptiveStore

**Avantage(s) :**

- Stockage de l'access token dans un cookie sécurisé (httpOnly, isSecure)

**Inconvénient(s) :**

- Quitter le flow OAuth 2 : https://github.com/mainmatter/ember-simple-auth/issues/1907

## Décision

En l'état on garde ce l'on a.
Pas de solutions qui changerait le flow d'authentification OAuth2
