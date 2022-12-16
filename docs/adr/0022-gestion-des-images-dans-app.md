# 22. Gestion des images dans APP

Date : 2021-03-03

## État

En cours

## Contexte

Le site APP de Pix possède de nombreuses images, logos, illustrations. Ces derniers sont rangés dans `/mon-pix/public/images`.
Ce dossier Images, au fil du temps, a commencé à être en désordre. Il est difficile de voir les images présentes, et de nombreuses images obsolètes sont encore présentes.

## Décisions

Afin d'éviter le désordre et pour retrouver plus facilement des images similaires, la première décision est de créer des sous-dossiers : 
- `/background` : images utilisées en fond de texte, purement décoratives
- `/icons` : les icones, images petites pour donner une information (possiblement remplaçable par FontAwesome)
- `/illustrations` : des images plus grandes pour décorer ou pour donner des informations plus complexes
- `/logos` : les logos de Pix ou de partenaires

Ces sous-dossiers peuvent contenir d'autres sous-dossiers pour des regroupements particuliers : par exemple, un dossier `tutorial` pour toutes les illustrations du didacticiel.

Les SVG doivent aussi suivre ces règles : 
- Avoir un `title` dans le svg : il servira de `title` de l'image et pourra être lu par les lecteurs vocaux.
- Avoir un `desc` dans le svg si ce dernier contient de nombreuses informations : une description textuelle doit être ajoutée
- Utiliser l'outil [svgo](https://github.com/svg/svgo) (avec la commande `svgo image.svg`) pour optimiser le SVG

## Conséquences

- Les nouvelles images seront rangées de manière logique ;
- Cela évitera d'importer des images en doublon et de ne pas utiliser notre bibliothèque d'images existantes ;
- Les SVG seront plus accessibles et plus optimisés.
