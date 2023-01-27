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

Configurer EmberSimpleAuth pour utiliser le CookieStorage à la place du LocalStorage qui est le stockage par défaut.

**Avantage(s) :**

- Stockage de l'access token dans un cookie sécurisé (httpOnly, isSecure), donc non visible par du code JavaScript.
- Le navigateur gère automatiquement l'envoi des cookies dans chacune des requêtes.
- Le back sera la seule entité à pouvoir utiliser les informations du cookie

**Inconvénient(s) :**

- Incompatibilité entre l'utilisation des cookies et du flow OAuth2 par le fonctionnement d'EmberSimpleAuth. Ce qui nous pousserait à ne plus utiliser le flow OAuth2 (voir https://github.com/mainmatter/ember-simple-auth/issues/1907).
- Tout l'objet de session EmberSimpleAuth sera ajouté sur toutes les requêtes

## Décision

En l'état on garde ce l'on a.
Pas de solutions qui changerait le flow d'authentification OAuth2
