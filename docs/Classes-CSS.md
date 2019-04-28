# Classes CSS

## Création de classes CSS

La création de classes CSS peut se faire dans le `.hbs` ou dans le `.js`, en fonction du besoin.

### Dans le `.js`

> Lorsque la classe css n'a pas de besoin de propriétés particulières, il suffit de la déclarer dans le `.js`.

```javascript
export default Component.extend({
  classNames: ['hexagon-score'], // qui va rajouter cette class à la div créée par Ember pour injecter le component
});
```

```html
<div class="hexagon-score__content">
  <div class="hexagon-score-content__title">PIX</div>
  <div class="hexagon-score-content__pix-score">{{score}}</div>
  <div class="hexagon-score-content__pix-total">1024</div>
</div>
```
Au niveau de la structure `html`, la div apparaitra sous la forme suivante :
```html
<div class="ember-view" id="ember123">
  <div class="hexagon-score__content">
    <div class="hexagon-score-content__title">PIX</div>
    <div class="hexagon-score-content__pix-score">{{score}}</div>
    <div class="hexagon-score-content__pix-total">1024</div>
  </div>
</div>
```

### Dans le `.hbs`

> Lorsque la classe css a besoin de propriétés particulières, il suffit de la déclarer dans le `.hbs`. Au niveau de la structure `html`, le structure sera identique au `.hbs`.

```javascript
export default Component.extend({
  // component stuff
});
```
```html
<div class="hexagon-score">
  <div class="hexagon-score__content">
    <div class="hexagon-score-content__title">PIX</div>
    <div class="hexagon-score-content__pix-score">{{score}}</div>
    <div class="hexagon-score-content__pix-total">1024</div>
  </div>
</div>
```

## Responsabilités 

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
