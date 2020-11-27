# 17. Choisir le sélecteur pour les tests front-end

Date : 13/10/2021

## État

Proposé

## Contexte

Sur les tests front-end, nous avons besoin de sélectionner certains éléments pour :
- effectuer des actions dessus (clic de bouton, remplissage de champ)
- vérifier leur présence ou leur absence

Suite à un échange sur une PR, il semble que la meilleur façon de faire 
[ne soit pas partagée](https://github.com/1024pix/pix/pull/2183#issuecomment-734674614)

Selon le type de sélecteur utilisé, les événements suivants peuvent faire échouer les tests :
- un élément est déplacé
- la classe CSS ou l'identifiant d'un élément change
- le texte affiché à l'écran par la balise change
Souhaitons-nous que les tests passent ou échouent dans chacune de ces situations ?

### Solutions

#### Rechercher dans ce que voit l'utilisateur

L'utilisateur ne peut voir et interagir qu'avec un nombre limité d'éléments : bouton, lien, champ de saisie, etc. Il ne
peut pas en percevoir d'autres comme les classes CSS. Si l'on base nos tests uniquement sur ces éléments visibles, on 
s'assure de présenter toujours la même interface à l'utilisateur, tout en gardant la liberté d'en modifier 
l'implémentation.

On peut sélectionner des éléments en recherchant : 
- le texte affiché à l'écran ou lu par synthétiseur vocal
- le rôle joué par chaque composant (bouton, lien, champ de saisie…)

Les tests passent si :
- la balise est déplacée
- la classe CSS ou l'identifiant de l'élément change

Les tests échouent si :
- le texte affiché à l'écran par la balise change.

##### Avec nos helpers maisons ...bylabel

Une première tentative d'implémentation de ce principe a été faite sur certaines apps avec les helpers maisons 
`clickByLabel` et `findByLabel` (ainsi que sur Certif et Admin, `getByLabel` et `queryByLabel`).

Avantages :
- Cette implémentation a le mérite d'exister et d'être déjà largement utilisée dans les tests

Inconvénients :
- L'interprétation de ce qu'est un label est très large et amène parfois à des surprises

##### Avec la testing-library

#### Rechercher dans les détails d'implémentation

Le langage de balisage HTML est composé d'une structure hierarchique de conteurs graphiques. Il est donc possible de
rechercher un élément sans aucune ambiguité avec son identifiant unique (attribut `id`) ou par une autre de ses 
propriétés (classes CSS). Par contre, il existe des modifications d'implémentation qui apparaissent identiques à 
l'utilisateur, mais qui font échouer les tests.

Une des raffinements de cette technique est de séparer l'identifiant de l'élément lors des tests par un attribut dédié
comme`data-test` ou `data-test-id`.

Les tests passent si :
- la balise est déplacée
- l'utilisateur choisit une autre langue
- le texte affiché à l'écran par la balise change.

Les tests échouent si :
- le détail d'implémentation utilisé par le selecteur change

#### Rechercher dans des attributs ajoutés pour les tests

- utiliser un sélecteur sur attribut `data-test`

Avantages :
- Il est toujours possible d'écrire le test

Iconvénients
- Cela implique d'ajouter du code qui n'est utile que pour les tests


#### data-test
Il existe deux variantes d'écriture :
* sans valeur : `<button data-test-foo-button>Like</button>`
* avec valeur :`<button data-test=foo-button>Like</button>`

Nommage : ajouter un attribut `data-test-<ENTITE>` sans valeur
````html
<article>
  <h1 data-test-post-title data-test-resource-id={{post.id}}>{{post.title}}</h1>
  <p>{{post.body}}</p>
  <button data-test-like-button>Like</button>
</article>
````
Assertion : rechercher un attribut `data-test-<ENTITE>` sans valeur
```` javascript
assert.dom('[data-test-post-title]').hasText('Ember is great!');
await click('[data-test-like-button]');
````
Le plugin [ember-test-selectors](https://github.com/simplabs/ember-test-selectors) permet de supprimer les sélecteurs au build.

## Décision

On décide d'identifier les éléments du point de vue de l'utilisateur en particulier en utilisant la solution testing-library.


## Conséquences

Développement d'un wrapper pour faire le lien entre testing-library et ember.
