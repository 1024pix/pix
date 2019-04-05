# Responsabilités

## CSS

Dans une recherche de réutilisabilité des classes css, il faut dans __l'idéal__ que :
* Le bloc comporte le __style__.
* L’élément comporte le __positionnement__.
* Le modifier modifie de façon **mineure** certaines descriptions de style du bloc.
* Une modification majeure marque le __besoin de créer une nouvelle classe__ / un nouvel “objet” css

Ces "_règles_" ne vont pas forcément s'appliquer sur des composants uniques.

### Imbrication en poupées russes

Privilégier le plus possible la création de classes filles __visuellement plus petites__ que leur classe parente, à l'image des poupées russes.

### Regroupements des génériques

Rassembler les couleurs dans un seul et même fichier `.scss` (`palette.scss` ou `colors.scss`)

### Séparation des responsabilités

Séparer le style du positionnement. On peut par exemple utiliser `@mixin`.
L'idée est de dissocier facilement et _a minima_ le style du positionnement pour pouvoir éventuellement réutiliser le style ailleurs. Même si c'est préférable, il ne s'agit pas forcément de séparer les classes au moment du processing.

```scss
// BAD
.hexagon-score-content__pix-score {
  position: absolute;
  width: 100%;
  top: 40px;
  color: $black;
  font-family: $font-open-sans;
  font-size: 4.6rem;
}

// GOOD
@mixin hexagon-score-pix-score {
  color: $black;
  font-family: $font-open-sans;
  font-size: 4.6rem;
}

.hexagon-score-content__pix-score {
  @include hexagon-score-pix-score;
  position: absolute;
  width: 100%;
  top: 40px;
}

```
