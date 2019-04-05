# Ember views

La création de classes CSS peut se faire dans le `.hbs` ou dans le `.js`, en fonction du besoin.

## Dans le `.js`

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

## Dans le `.hbs`

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