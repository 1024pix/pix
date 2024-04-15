# 36. Formater le code

Date : 2022-10-04

## État

Accepté

## Contexte

Le code [https://github.com/Automedon/CodeWars-7-kyu-Soluitions/blob/master/254%20shades%20of%20grey.js](suivant) est du Javascript valide, répond au besoin métier, mais n'est pas satisfaisant.

```js
function shadesOfGrey(n){const shades=[];for(let i=1;i<=Math.min(n,254);i++){const grey=('0'+i.toString(16)).slice(-2);shades.push('#'+grey+grey+grey);}return shades;}
```

Il ne suit aucune règle courante concernant :

- les sauts de lignes;
- la longueur maximale d'une ligne;
- l'indentation dans les structures imbriquées;
- le nombre d'espace entre les mots-clefs, paramètres.

En bref, ce code n'est pas formaté.
Note: après reformatage, seuls des caractères non signifiants pour la machine ont été ajoutés.
Il est donc important d'avoir du code formaté pour améliorer sa lisibilité par le développeur, et donc sa
maintenabilité.

Un formatage partagé entre développeurs et entre équipes est souhaitable pour assurer le "collective code ownership".
De plus, si à la fois le comportement du code et son formatage ont été modifiés, il n'est pas facile de les séparer lors
d'une code review.
Cela "génère du bruit dans la diff".

De plus, il est souhaitable que le formatage soit automatisé pour que chaque développeur ne doive pas mémoriser les
règles.
L'éditeur de code embarque d'ailleurs un formateur par défaut, avec des règles spécifiques.
Reste le problème suivant: comment décider des règles de formatage ?

### Solution n°1 : Les développeurs spécifient des règles

**Description**

Un groupe de développeurs représentatif se réunit et décide des règles souhaitées.
Elle cherche ensuite dans la configuration de l'outil comment implémenter ces règles.

**Avantage(s):**

- les règles sont adaptées aux besoins du projet, si les développeurs les remontent

**Inconvénient(s):**

- difficulté à déterminer ce qu'est un groupe "représentatif" de développeurs
- difficulté à déterminer le degré de précision requis dans les règles
- difficulté à aboutir à une décision commune
- difficulté à déterminer à quel moment ces règles doivent être modifiées

### Solution n°2 : Un groupe extérieur au projet spécifie ces règles

**Description**

Il existe des outils open source proposant un ensemble de règles considérées comme étant une solution raisonnable.
C'est le groupe qui développe cet outil qui décide des règles.
Ces règles ne sont pas/peu configurables.

**Avantage(s):**

- pas de besoin de concertation initiale entre développeurs
- pas de besoin de révision ultérieure des règles

**Inconvénient(s):**

- si les règles ne conviennent pas au développeur, il ne peut rien y changer (frustration)

## Décision

Nous avons choisi la solution n°2, à savoir que les règles sont déterminées par un groupe extérieur.
L'outil décidé est celui le plus utilisé, à savoir prettier.

## Conséquences

Utiliser la librairie `prettier`, configurée avec un fichier `.prettierrc.json` qui détermine:

- taille d'une ligne;
- préférence donnée aux apostrophes simples par rapport aux apostrophes doubles.

Formater la base de code existante avec l'option `--write` de prettier.

Inclure une vérification du formatage dans la CI.
Pour cela, utiliser `eslint` avec le plugin `eslint-plugin-prettier"` et `eslint-config-prettier`.

