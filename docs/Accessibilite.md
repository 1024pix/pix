# Accessibilité

#### Vérifier l'accessibilité d'un site

Plusieurs solutions (complémentaires) :


- **Aller sur https://validator.w3.org/** (y coller l'url du site à tester).

- **Installer l'extension de navigateur "Wave"** (cliquer sur l'icon de l'extension et vérifier s'il y a des erreurs en naviguant sur le site).

- **Installer l'extension de navigateur ["Web Developper"](https://addons.mozilla.org/fr/firefox/addon/web-developer/)** (de préférence avec firefox), aller dans `Informations > View Document Outline` vérifier la hierarchie des titres (cela devrait correspondre à l'ordre d'importance des informations de la page).

- **Zoomer beaucoup (ctrl +)** et vérifier si les éléments ne se supperposent pas. Si certains éléments débordent souvent il faudra surement éviter les hauteurs fixes. Les pixels sont à bannir ! Préférez les unités relatives.

- **Enlever les éléments graphiques** et vérifier si les on garde toujours l'information (par exemple en désactivant le css d'un site).


#### La sémantique des balises

Attention à la sémantique (le sens, la signification) des balises ! Cela est très important notamment pour les lecteurs d'écran de site web pour les personnes aveugles. Exemple : 
- `<button>` = une action dans le site lui même
- `<a>` = un lien, une redirection vers une autre page ou autre site

###### Utilisation des balises <h*>

Peu importe l'apparence des h*, les personnes qui voient les titres comprennent. En revanche les personnes qui naviguent avec le clavier au __voiceOver__ ont besoin que le html soit explicite le plus possible pour que leur outil sache les lire correctement.

Concrètement, ce n'est pas une mauvaise pratique d'avoir un h1 visuellement plus petit/moins contrasté/etc. qu'un h2. L'important est de conserver une __structure html en cascade__ pour le voiceOver (et le référencement web).

###### Utilisation des balises <div>

Dans l'idéal les balises `div` ne servent que pour des éléments décoratifs. Le reste doit avoir une balise spécifique.

###### Plus d'informations

Voir le [site du w3c pour la liste des balises](https://www.w3schools.com/TAGS/default.ASP).


#### Quand mettre un alt sur une image ?
Il faut **TOUJOURS** mettre un alt sur une balise `<img>`. 

A noter cependant qu'il faut mettre l'alt vide si l'image est "décorative" (c'est à dire qu'elle peut être enlevée sans perdre d'informations, par exemple une image de fond)

Pour les autres images, jouant le rôle de boutons ou de lien etc., le contenu de l'alt est primordial. Par exemple, on préférera les formulations : 
- "Retour vers l'accueil de Pix" plutôt que "Logo de Pix", pour expliquer ce que fait le bouton avec l'image du logo de Pix dans le footer.
- "Nous suivre sur facebook" plutôt que "Lien vers notre page Facebook" (parce que l'information "lien" est déjà contenu dans la balise elle même).


## Unités CSS

Rappel : les pixels sont à bannir ! Il faut privilégier les unités relatives.
Utilisation des __rem__ pour les fonts: size, lettering, letter-spaces.  
Utilisation des __px__ pour le positionnement: padding, border, margin.

```scss
.my-class {
  size: 1.3rem;
  padding: 10px 12px;
}
```
