# Accessibilité

## Vérifier l'accessibilité d'un site

Plusieurs solutions (complémentaires) :

- **Aller sur https://validator.w3.org/** (y coller l'url du site à tester).

- **Installer l'extension de navigateur "[Wave](https://wave.webaim.org/extension/)"** 
    - Cliquer sur l'icône de l'extension pour vérifier s'il y a des erreurs en naviguant sur le site.

- **Installer l'extension de navigateur "[Web Developper](https://addons.mozilla.org/fr/firefox/addon/web-developer/)"** (de préférence avec Firefox)
    - Aller dans `Informations > View Document Outline` pour vérifier la hierarchie des titres:
      - Cela devrait correspondre à l'ordre d'importance des informations de la page
      - Les numero de balises doivent se suivre :
       `<h1><h2>` ✅
       `<h1><h3>` 🚨

- **Zoomer beaucoup (ctrl +)** et vérifier si les éléments ne se supperposent pas. Le zoom doit être un zoom du texte, disponible sous Firefox (via le menu affichage > zoom > zoom de texte seulement).
    - Si certains éléments textes débordent (textes qui se superposent, texte qui sort d'un bouton), il faudra surement éviter les hauteurs fixes ;
    - Pour ce qui concerne le texte, les pixels sont à bannir ! Préférez les unités relatives (rem, ...). 
Attention, cela ne fonctionne pas toujours de mettre des unités relatives pour les marges, la hauteur, ... 

- **Enlever les éléments graphiques** et vérifier si les on garde toujours l'information (par exemple en désactivant le css voire le js d'un site). Sur Firefox : `Menu Affichage/style de la page/aucun style`


## La sémantique des balises

Attention à la sémantique (le sens, la signification) des balises ! Cela est très important notamment pour les lecteurs d'écran de site web pour les personnes aveugles. Exemple : 
- `<button>` = une action dans le site lui même
- `<a>` = un lien, une redirection vers une autre page ou autre site

### Utilisation des balises <h*>

Peu importe l'apparence des h*, les personnes qui voient les titres comprennent. En revanche les personnes qui naviguent avec le clavier au __voiceOver__ ont besoin que le html soit explicite le plus possible pour que leur outil sache les lire correctement.

Concrètement, ce n'est pas une mauvaise pratique d'avoir un h1 visuellement plus petit/moins contrasté/etc. qu'un h2. On peut par exemple avoir une publicité, qui sera marquée par le titre h1 "Publicité", mais qui visuellement sera tout petit. L'important est de conserver une __structure html en cascade__ pour le voiceOver (et le référencement web).

**Au moins un h1 est nécessaire sur chaque page** : ce sera le titre de la page. Exemple pour la page d'accueil du site service-public : "service-public particuliers : connaître vos droits effectuer vos demandes". C'est important de mettre le nom du site global pour avoir du contexte.
De plus, ce h1 doit **contenir la même chose que le titre de la page**.

On peut mettre une image dans un titre (exemple : _image avec `alt=« Pix »`_ Connectez-vous)

### Utilisation des balises <div>

Dans l'idéal les balises `div` ne servent que pour des éléments décoratifs. Le reste doit avoir une balise spécifique.

### Plus d'informations

Voir le [site du w3c pour la liste des balises](https://www.w3schools.com/TAGS/default.ASP).


## Quand mettre un alt sur une image ?
Il faut **TOUJOURS** mettre un alt sur une balise `<img>`. 

A noter cependant qu'il faut mettre l'alt vide si l'image est "décorative" (c'est à dire qu'elle peut être enlevée sans perdre d'informations, par exemple une image de fond). Pour savoir si une image est utile, se poser la question : "**si on enlève l’image, est-ce qu’il nous manque un information ?**"
 
Pour les autres images, jouant le rôle de boutons ou de lien etc., le contenu de l'alt est primordial. Par exemple, on préférera les formulations : 
- "Retour vers l'accueil de Pix" plutôt que "Logo de Pix", pour expliquer ce que fait le bouton avec l'image du logo de Pix dans le footer.
- "Nous suivre sur facebook" plutôt que "Lien vers notre page Facebook" (parce que l'information "lien" est déjà contenu dans la balise elle même).
- "Soutenu par le ministère de ..." plutôt que "Logo du ministère de ..."

## Unités CSS

Pour les textes, les pixels sont à bannir ! Il faut privilégier les unités relatives.
Utilisation des __rem__ pour les fonts: size, lettering, letter-spaces.  
Utilisation des __px__ pour le positionnement: padding, border, margin.

```scss
.my-class {
  size: 1.3rem;
  padding: 10px 12px;
}
```

## Naviguation
Normalement toute page est accessible via :
- Barre de recherche
- Barre de navigation
- Plan de site

SAUF tunnel d’achat, etc…

## Graphiques
- Vérifier les contraste de couleurs
- Les couleurs qui portent à confusion ne doivent pas être côte à côte (on peut tester cela en convertissant l'écran en noir et blanc)
- Mettre des frontières/bordures épaisses
- Légende en dehors du graphique et complète (pas d'ellipse : ...)
- Pas d’affichage au survol
- Préférer une construction graphique avec une alternative textuelle : 
    - tableau portant les données dépliées dans un accordéon en dessous du graphique
    - données en `table`, transformées visuellement en graphique : les lecteurs d'écran sauront lire correctement un tableau
