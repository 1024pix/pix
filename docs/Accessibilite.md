# Accessibilité

## Unités CSS

Utilisation des __rem__ pour les fonts: size, lettering, letter-spaces.  
Utilisation des __px__ pour le positionnement: padding, border, margin.

```scss
.my-class {
  size: 1.3rem;
  padding: 10px 12px;
}
```

## Utilisation des balises <h*> </h*>

Peu importe l'apparence des h*, les personnes qui voient les titres comprennent. En revanche les personnes qui naviguent avec le clavier au __voiceOver__ ont besoin que le html soit explicite le plus possible pour que leur outil sache les lire correctement.

Concrètement, ce n'est pas une mauvaise pratique d'avoir un h1 visuellement plus petit/moins contrasté/etc. qu'un h2. L'important est de conserver une __structure html en cascade__ pour le voiceOver (et le référencement web).
