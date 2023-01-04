# 16. Modification du stockage en cache du référentiel de contenu

Date : 2020-12-02

## État

Accepted

## Contexte

Suite à l‘utilisation d‘une route unique pour récupérer le référentiel de contenu dans la [Pull Request 2224](https://github.com/1024pix/pix/pull/2224), il n‘est plus nécessaire de stocker 1 clé par type d‘objet dans le cache.

## Décision

Afin de simplifier l‘usage, une clé unique `LearningContent` est utilisée pour stocker le référentiel dans le cache.

## Liens

- [ADR de la mise en place du cache](0005-ajout-d-un-cache-memoire-distribute-pour-le-contenu-pedagogique.md)
- [Création du endpoint `GET /current-content` sur Pix LCMS] (https://github.com/1024pix/pix-editor/pull/67)
