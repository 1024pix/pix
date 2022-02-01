# Responsive Design

## Dimensionnement

La largeur doit prendre soit __100%__ soit une __largeur maximale__ fixe définie en px.
```scss
// BAD
.my-class {
  width: 70%;
}

// GOOD 
.my-class {
  width: 100%;
}

// ALSO GOOD 
.my-class {
  max-width: 1200px;
}
```

## Positionnement

Éviter le plus possible les valeurs négatives de margin, padding, etc. et privilégier les positions absolutes

```scss
// BAD
.my-class {
  display: flex;
  margin-top: -9875654px;
}

// GOOD
.my-class {
  position: absolute;
  top: 20px;
  left: 5px;
  right: 24132px;
  bottom: 12345px;
}
```

###### Pros

> CSS plus robuste c'est à dire à quel point mon CSS fait le design attendu lorsque le CSS autour de lui bouge.

###### Cons

> Lisibilité plus faible puisqu'en position absolute, le parent doit être en position relative, etc.
> On modifie plus de classes que besoin.
