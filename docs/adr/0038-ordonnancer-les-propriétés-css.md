# 38. Ordonnancer les propriétés css

Date : 2022-10-26

## État

En étude

## Contexte

Suite à une mise-en-jambe sur le sujet sur l'organisation du css chez pix ([MEJ en question](https://docs.google.com/presentation/d/12BBnK8huQ1NsTcUpdgXt1SH0jRFCerMvl5ifZXTvjmU/edit?usp=sharing)) il y a eu des questionnements sur l'ordre dans lequel on range les propriétés CSS.
En effet aujourd'hui nous n'avons aucune convention chez Pix à propos de l'ordre dans lequel nous écrivons les propriétés CSS.

Ici nous souhaitons répondre à deux questions :
- Quand j'écris mes propriétés css, comment je les ordonne ?
- Quand je recherche une propriété css où et comment la trouver ?

### Solution n°1 : Ne pas ordonner

**Description**
On laisse comme c'est actuellement.


**Avantage(s):**
Cela ne coûte rien !


**Inconvénient(s):**
Voir le contexte de l'ADR.


### Solution n°1 : Ordonner dans l'ordre alphabétique

**Description**
Ordonner dans l'ordre alphabétique.

**Avantage(s):**
Simple à ranger quand on arrive chez PIX, pas de question à se poser et simple à rechercher.


**Inconvénient(s):**
Si nous travaillons par fonctionnalités il est plus difficile de se concentrer sur ces dernières uniquement.

Exemple si nous souhaitons faire des changements uniquement sur la typographie :

Ordre alphabétique :
```scss
.style_active{
  color: $blue; // typographie
  display: flex;
  font-size: 2rem; // typographie
  height: 25rem;
  line-height: 2rem; // typographie
  max-width: 100%;
  text-align: center; // typographie
}
```

Ordre logique :
```scss
.style_active{
  // positionnement
  display: flex; 
  height: 25rem;
  max-width: 100%;

  //typographie
  color: $blue; 
  font-size: 2rem; 
  line-height: 2rem; 
  text-align: center; 
}
```

si nous souhaitons modifier uniquement la typographie d'un élément, nous sommes obligés de naviguer dans l'ensemble de la déclaration car les propriétés liées à cette dernière ne sont pas groupées. En effet, elles ne commencent pas toutes par la même lettre ni le même mot. Aucune règle de nommage n'indique le rôle de la propriété (exemple : 'color' agit uniquement sur la typographie bien qu'il ne se nomme pas 'font-color').

### Solution n°2 : Ordonner dans l'ordre logique

**Description**
Ordonner dans l'ordre logique.

Exemple :
1. Positionnement (position, z-index, inset, …)
2. Box-model (display, width, height, margin, padding, …)
3. Typographie (font-family, font-size, line-height, color, …)
4. Visuel (background, border, opacity, box-shadow, …)
5. Autres (animation, transition, …)

**Avantage(s):**
Voir exemple de la solution 1.

Si nous souhaitons modifier uniquement la typographie d'un élément, toutes les propriétés sont regroupés au même endroit.

Également, cela nous permet d'éviter de créer de la dette technique. Si jamais nous modifions la typographie, nous savons directement quelles propriétés seront impactées, encore utilisées ou à contrario deviendront inutiles.

**Inconvénient(s):**
Cela pose de nouvelles questions notamment sur la profondeur à laquelle on souhaite appliquer cet ordre logique.
Cet ordre créé des groupes, ces derniers, comment nous les ordonnons ?


## Décision


## Conséquences

