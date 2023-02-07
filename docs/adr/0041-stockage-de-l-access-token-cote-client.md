# Stockage de l'access token côté client

Date : 2023-01-26

## État

Confirmé

## Contexte

Dans le cadre de l'augmentation globale de la sécurité, nous avons cherché à améliorer la sécurité du stockage de l'access token conformément aux bonnes pratiques en remplaçant l'usage du [localStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage) par l'utilisation d'un [cookie](https://developer.mozilla.org/en-US/docs/Web/API/Document/cookie) (voir lien : https://dev.to/rdegges/please-stop-using-local-storage-1i04).

Par défaut, EmberSimpleAuth utilise le localStorage pour gérer la session de l'utilisateur via la classe [AdaptiveStore](https://ember-simple-auth.com/api/classes/AdaptiveStore.html).

Nous utilisons le flow OAuth2 (custom) pour l'authentification des utilisateurs. Ce flow nous permet de définir des endpoints différents de ceux par défaut fournis par ESA (Ember Simple Auth). La subtilité sur PixApp, c'est que nous devons également gérer les connexions via le GAR. 

Il existe une liaison assez forte entre le stockage de la session et le flow d'authentification utilisé.

L'authenticator utilise les informations stockées dans la session pour gérer le rafraichissement
de l'access token avant expiration (expires_in, refresh_token).

## Solution : Cookie

**Description :**

Configurer EmberSimpleAuth pour utiliser un cookie à la place du localStorage qui est le stockage par défaut.

**Avantage(s) :**

- Stockage de l'access token dans un cookie sécurisé (httpOnly, isSecure), donc non visible par du code JavaScript
- Le navigateur gère automatiquement l'envoi des cookies dans chacune des requêtes
- Le back sera la seule entité à pouvoir utiliser les informations du cookie

**Inconvénient(s) :**

- Incompatibilité entre l'utilisation des cookies et du flow OAuth2 par le fonctionnement d'EmberSimpleAuth. Ce qui nous pousserait à ne plus utiliser le flow OAuth2 (voir lien : https://github.com/mainmatter/ember-simple-auth/issues/1907).
- Tout l'objet de session EmberSimpleAuth sera ajouté sur toutes les requêtes

## Décision

Aucune solution n'a été trouvée qui éviterait le changement du flow d'authentification actuellement utilisé (OAuth2 custom) tout en gardant EmberSimpleAuth qui automatise pour nous toute la gestion des refresh tokens.
Aussi nous gardons pour l'instant la solution actuelle, c'est-à-dire l'utilisation du localStorage.
Une potentielle solution à plus long terme serait de faire une contribution à EmberSimpleAuth faisant l'utilisation de cookie pour le stockage de l'access token, mais il faudrait déjà réaliser ce développement puis qu'il soit accepté ce qui n'a rien de certain.

Nous avons choisi d'entériner cette non décision par une ADR pour sauvegarder le fruit de nos réflexions au cas où, à l'avenir, d'autres développeurs considérait la possibilité d'utiliser un cookie plutôt que le localStorage pour stocker le token d'accès.
