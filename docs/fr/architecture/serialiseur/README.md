# Sérialiseur

Un sérialiseur traduit entre les objets du domaine et un format d'échange, dans les deux sens. Il vit
dans `infrastructure/serializers/`, exports CSV compris.

Cette page est la **référence** : les règles, les cas permis, les tests et la checklist. Dans le même
dossier :

- [`explication.md`](explication.md) : pourquoi ces règles, ce qu'elles rapportent, la théorie et
  l'histoire des décisions ;
- [`outillage.md`](outillage.md) : mettre en place les vérifications automatiques ;
- [`ecarts.md`](ecarts.md) : où le code s'écarte de la théorie, et ce qui est décidé.

Les règles de cette page s'appliquent à tout sérialiseur, JSON:API comme CSV. La ligne
**Vérification** de chaque invariant dit par quel moyen la règle se vérifie. Ce qui est en place dans
la CI est dans [`outillage.md`](outillage.md).

## Sommaire

[Rôle](#rôle) · [Invariants](#invariants) · [Exceptions légitimes](#exceptions-légitimes) ·
[Exemple complet](#exemple-complet) · [Tests attendus](#tests-attendus) ·
[Checklist de revue](#checklist-de-revue) · [Sources](#sources)

| # | Invariant | Vérification |
| --- | --- | --- |
| [**M1**](#m1-aucune-logique-dans-le-sens-sortant) | aucune logique dans le sens sortant | règle ESLint, simple |
| [**M2**](#m2-nexpose-que-des-champs-présents-sur-lobjet-reçu) | n'expose que des champs présents sur l'objet reçu | typage |
| [**M3**](#m3-le-format-de-réponse-est-un-contrat-externe) | le format de réponse est un contrat externe | aucun moyen dans ce dépôt, revue |
| [**M4**](#m4-un-sérialiseur-par-ressource-exposée) | un sérialiseur par ressource exposée | script |
| [**M5**](#m5-la-désérialisation-ne-laisse-pas-entrer-la-forme-du-transport) | la désérialisation ne laisse pas entrer la forme du transport | revue, puis typage |

Hors numérotation :

- la table des trois niveaux de changement, qui dit ce qu'un outil peut attraper dans `M3`, est dans
  [`outillage.md`](outillage.md#la-piste-qui-changerait-m3) ;
- le cas de la clé de présentation, qui se compose dans le sérialiseur, est dans
  `../objet-valeur/README.md`.

---

## Rôle

Un sérialiseur traduit entre les objets du domaine et un format d'échange. Il le fait **dans les
deux sens** : il met en forme une réponse, et il désérialise une charge utile entrante.

Les deux sens n'ont pas les mêmes invariants.

**Vers l'extérieur**, le sérialiseur est déclaratif : une liste de champs, éventuellement des
relations incluses. Il ne calcule pas, ne filtre pas selon une condition métier, ne décide pas. C'est
`M1`.

Un **export CSV** est aussi un sérialiseur : il met en forme vers un autre format d'échange. `M1`
s'y applique comme à JSON:API.

**Vers le domaine**, le sérialiseur traduit : il renomme, il convertit un type, il construit des
objets du domaine. Ces opérations sont sa raison d'être, et elles sont autorisées. Dans ce sens, il lui
est interdit de laisser entrer la forme du transport. C'est `M5`.

Termes employés dans cette page :

- **Forme du transport** : la structure du format d'échange, comme `json.data.attributes` en
  JSON:API.
- **Nommage du transport** : la traduction d'un nom du domaine en nom du format, comme un nom
  d'attribut en type JSON:API.

### Ce que le sérialiseur n'est pas

Table de décision. Si le code correspond à une ligne, ce n'est pas un sérialiseur.

| Le code… | Va dans | Référence |
| --- | --- | --- |
| calcule une valeur absente de l'objet reçu | le usecase, ou un read-model | `../usecase/README.md`, `../read-model/README.md` |
| filtre selon une condition métier | le domaine : Entity, Value Object, Aggregate Root | `../entite/README.md`, `../objet-valeur/README.md`, `../racine-agregat/README.md` |
| choisit une forme de réponse selon les droits de l'appelant | le usecase, qui ne renvoie que ce qui est autorisé | `../usecase/README.md` |
| met en forme pour un autre Bounded Context | `application/api/` et son DTO de contrat | `../api-interne/README.md` |
| assemble une forme pour une lecture | un read-model, construit par un repository | `../read-model/README.md` |

---

## Invariants

### M1. Aucune logique dans le sens sortant

**Énoncé.** Pas de condition, pas de calcul, pas de décision **dans la sérialisation**. Le sérialiseur
met en forme ce qu'il reçoit.

Cet invariant ne porte pas sur la désérialisation, dont la traduction est le rôle. Voir `M5`.

```js
// fautif — une règle métier choisit ce que la réponse contient
transform(record) {
  record.badges = record.badges.filter((badge) => badge.isCertifiable);
  return record;
},
attributes: ['name', 'badges'],

// conforme, forme corrigée — le usecase ne renvoie que les badges certifiables
attributes: ['name', 'badges'],
```

**Code.** Fautif : [`target-profile-for-admin-serializer.js`](https://github.com/1024pix/pix/blob/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/prescription/target-profile/infrastructure/serializers/jsonapi/target-profile-for-admin-serializer.js#L8-L12). La forme corrigée est hypothétique.

**Ce qui casse.** Une règle écrite ici est invisible depuis le domaine. Elle est facile à écrire ici,
et personne ne l'y cherche. Une fuite y coûte donc plus cher qu'ailleurs.

**Ce qui reste autorisé** : les valeurs par défaut et l'accès optionnel, comme `x ?? null` ou `x?.y`.
Ce sont des protections de forme, pas des décisions.

**Le nommage du transport** reste aussi autorisé. C'est le rôle du sérialiseur, et il prend souvent la
forme de conditions :

```js
// conforme — des conditions, mais sur le nom du type de la réponse
typeForAttribute(attribute) {
  if (attribute === 'userSavedTutorial') return 'user-saved-tutorial';
  if (attribute === 'tutorialEvaluation') return 'tutorial-evaluation';
  return attribute;
},
```

**Code.** [`tutorial-serializer.js`](https://github.com/1024pix/pix/blob/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/devcomp/infrastructure/serializers/jsonapi/tutorial-serializer.js#L25-L29).

```js
// conforme à M1 comme à M5 — une fonction utilitaire du fichier, appelée par la désérialisation :
// elle prend une valeur, pas l'objet
function _cleanValue(value) {
  if (value) {
    return value.replaceAll('\u0000', '');
  }
  return '';
}
```

**Code.** [`answer-serializer.js`](https://github.com/1024pix/pix/blob/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/evaluation/infrastructure/serializers/jsonapi/answer-serializer.js#L55-L60), appelée ligne 45.

La frontière est nette. Si l'expression **choisit entre deux formes de réponse**, c'est une décision.
Si elle protège d'une valeur absente, nomme un type ou nettoie une chaîne, ce n'en est pas une.

Cette frontière vaut aussi entre fichiers. Deux sérialiseurs pour la même ressource selon l'appelant
sont la même violation à une autre échelle. C'est au usecase de ne renvoyer que ce qui est autorisé.

**Vérification.** Une règle ESLint en deux motifs : une structure conditionnelle sur l'objet
sérialisé, puis un appel de méthode sur cet objet. Les conditions sur un paramètre de `serialize` se
vérifient en revue. Voir
[`outillage.md`](outillage.md#m1--la-règle-qui-compte-ici-et-sa-réserve).

### M2. N'expose que des champs présents sur l'objet reçu

**Énoncé.** Le sérialiseur déclare des champs, il ne les fabrique pas. Si un champ à exposer n'existe
pas sur l'objet, c'est au usecase ou au read-model de le fournir.

```js
// fautif — le champ est fabriqué ici, par une méthode métier de l'objet reçu
isAccessBlockedCollege: access.isAccessBlockedCollege(),

// conforme, forme corrigée — le read-model reçu porte le champ, déjà calculé
attributes: ['isAccessBlockedCollege']
```

**Code.** Fautif : [`certification-point-of-contact.serializer.js`](https://github.com/1024pix/pix/blob/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/deprecated/infrastructure/serializers/jsonapi/certification-point-of-contact.serializer.js#L68). La forme corrigée est hypothétique.

Composer une valeur à partir de champs reçus n'est pas fabriquer un champ. Un libellé ou une clé de
présentation se composent ici : voir les [exceptions légitimes](#exceptions-légitimes).

**Ce qui casse.** Un champ déclaré mais absent de l'objet sort à `null`, et le front l'interprète
comme une donnée absente, alors qu'elle n'a jamais été chargée. Rien ne le signale : ni la
compilation, ni les tests du sérialiseur, qui passent avec un objet de test complet. Un champ fabriqué
par une méthode métier place un calcul métier dans la mise en forme, invisible depuis le domaine comme
sous `M1`.

**Vérification.** Le typage de la liste des champs contre l'objet reçu. Voir
[`outillage.md`](outillage.md#vérifier-par-le-typage).

### M3. Le format de réponse est un contrat externe

**Énoncé.** Le format produit est consommé par des applications front, parfois par des tiers. Il obéit
donc aux règles d'un format publié :

- un ajout se fait sans casser l'existant ;
- un renommage ne se fait pas à la légère ;
- un retrait se coordonne.

**Le changement de sens** d'un champ existant recouvre deux cas :

- changer l'ensemble des valeurs possibles d'un champ, c'est-à-dire ajouter ou retirer un état, est
  un changement de forme ;
- redéfinir ce qu'une valeur inchangée signifie est un changement de sens.

Une valeur existante ne change jamais de signification : un nouveau sens prend une nouvelle valeur.

**Ce qui casse.** Casser le format casse les applications front, chez d'autres équipes, à
l'exécution. Le changement de sens ne se signale nulle part : ni la compilation, ni les tests, ni les
consommateurs, jusqu'à ce qu'un comportement devienne faux quelque part.

**Vérification.** Aucun moyen dans ce dépôt, parce que les consommateurs sont hors du dépôt. Le
changement de sens se vérifie en revue. Voir [`outillage.md`](outillage.md#m3--pas-mécanisable-et-par-quoi-ça-changerait).

### M4. Un sérialiseur par ressource exposée

**Énoncé.** Un fichier par ressource, nommé d'après elle.

**Ce qui casse.** Rien à l'exécution. C'est un invariant d'hygiène : il rend le fichier trouvable. Il
rend aussi visible la violation décrite sous `M1` : deux sérialiseurs pour une même ressource se voient
quand la convention est d'en avoir un.

**Vérification.** Un script de nommage et d'unicité. Voir [`outillage.md`](outillage.md#vérifications).

### M5. La désérialisation ne laisse pas entrer la forme du transport

**Énoncé.** Une fonction de désérialisation rend des objets du domaine, ou un objet d'entrée aux clés
du domaine. Elle ne rend jamais la structure du format d'échange.

```js
// conforme — la désérialisation rend un objet du domaine
const deserialize = async function (payload) {
  const deserializedData = await new Deserializer({ keyForAttribute: 'camelCase' }).deserialize(payload);
  return new CombinedCourseBlueprintForUpdate(deserializedData);
};
```

**Code.** [`combined-course-blueprint-for-update-serializer.js`](https://github.com/1024pix/pix/blob/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/quest/infrastructure/serializers/combined-course-blueprint-for-update-serializer.js#L7-L12).

```js
// fautif — la forme du transport continue vers le domaine, augmentée d'un champ calculé
const deserialize = function (payload) {
  return new Deserializer({
    keyForAttribute: 'camelCase',
    transform(deserializedTraining) {
      …
      const { days, hours, minutes } = duration;
      return { ...deserializedTraining, objectives, duration: `${days}d${hours}h${minutes}m` };
    },
  }).deserialize(payload);
};
```

**Code.** [`training-serializer.js`](https://github.com/1024pix/pix/blob/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/devcomp/infrastructure/serializers/jsonapi/training-serializer.js#L134-L153), simplifié.

Dans le second cas, le `...` est le signe du défaut : tout ce que le format contenait continue, et un
champ de plus s'ajoute. Personne ne sait plus quelles clés arrivent dans le usecase.

**Ce qui est sa raison d'être, donc autorisé sans réserve** :

- renommer un champ ;
- convertir un type ;
- construire un objet du domaine ;
- se garder d'une relation absente.

C'est de la traduction. Une garde `if (relationships && relationships.tags)` est correcte ici, alors
que la même forme serait fautive dans une sérialisation.

**Ce qui reste interdit** : décider. Une condition qui choisit entre deux formes de sortie selon une
propriété métier est une règle. Elle appartient au domaine, comme dans le sens sortant.

**Ce qui n'est pas son travail** : valider. La forme des entrées se déclare sur la route : c'est `R1`
de `../route/README.md`. Un sérialiseur qui vérifie qu'un champ est présent double une garantie qui
existe déjà. Il la double mal, sans message utilisateur et sans documentation générée.

**Ce qui casse.** La forme JSON:API entre dans le domaine, et un changement de format d'échange
remonte jusqu'aux modèles. C'est la même mécanique que `I1` de `../repository/README.md`, vue depuis
l'autre porte d'entrée.

**Vérification.** La revue, puis le typage du retour de la désérialisation. Voir
[`outillage.md`](outillage.md#m5--pourquoi-la-revue-et-pas-une-règle).

---

## Exceptions légitimes

Une exception ne vaut que pour l'invariant de sa ligne. Elle n'excuse rien d'autre.

| Invariant | Cas | Statut |
| --- | --- | --- |
| **M1** | `x ?? null` ou `x?.y` pour se protéger d'une valeur absente | **autorisé** : protection de forme |
| **M1** | Aplatir une structure imbriquée | **autorisé** |
| **M1** | Déclarer des relations incluses | **autorisé** : c'est de la mise en forme |
| **M1** | Renommer un champ pour le vocabulaire du format | **autorisé**, et c'est un bon usage de la couche |
| **M1** | Une enveloppe de pagination autour des objets sérialisés | **autorisé** |
| **M1** | Une condition qui choisit entre deux formes de réponse | **pas une exception** : c'est `M1` violé, voir `X1` de [`ecarts.md`](ecarts.md) |
| **M1** | Un export CSV qui filtre ou choisit ses données selon une règle métier | **pas une exception** : c'est `M1` violé, voir `X5` de [`ecarts.md`](ecarts.md) |
| **M1** | Deux sérialiseurs pour la même ressource selon l'appelant | **pas une exception** : c'est `M1` à l'échelle du fichier |
| **M2** | Composer un libellé à partir de plusieurs champs reçus | **autorisé** : mise en forme sans décision |
| **M2** | Composer une clé de présentation à partir de champs reçus | **autorisé** : c'est ici qu'elle se compose. Voir `V2` de `../objet-valeur/README.md` et `X5` de `../objet-valeur/ecarts.md` |
| **M2** | Un sérialiseur qui reçoit un read-model plutôt qu'une Entity | **autorisé**, et préférable. Voir `X4` de [`ecarts.md`](ecarts.md) |
| **M2** | Un champ calculé depuis une méthode métier de l'objet | **pas une exception** : c'est `M2` violé, voir `X2` de [`ecarts.md`](ecarts.md) |
| **M5** | Un `if` sur une relation absente dans une désérialisation | **autorisé** : c'est de la traduction. La même forme serait fautive dans une sérialisation |
| **M5** | Un `parseInt` ou un renommage de clé dans une désérialisation | **autorisé** : c'est la raison d'être du sens entrant |
| **M5** | Une désérialisation qui vérifie la présence d'un champ | **pas une exception** : la forme des entrées se déclare sur la route, `R1` de `../route/README.md` |

---

## Exemple complet

Une désérialisation tirée du code : le fichier et son test.

```js
import { CombinedCourseBlueprintForUpdate } from '../../domain/models/combined-course-blueprints/value-objects/CombinedCourseBlueprintForUpdate.js';

const { Deserializer } = jsonapiSerializer;

const deserialize = async function (payload) {
  const deserializedData = await new Deserializer({
    keyForAttribute: 'camelCase',
  }).deserialize(payload);
  return new CombinedCourseBlueprintForUpdate(deserializedData);   // un objet du domaine : M5
};

export const combinedCourseBlueprintForUpdateSerializer = { deserialize };
```

```js
// le test — unitaire pur, aucune doublure
it('#deserialize', async function () {
  const payload = {
    data: {
      attributes: {
        name: 'Mon épure',
        internalName: 'Une épure pour tel niveau',
        'prescriber-description': 'PrescriberDescription',
        /* … */
      },
      relationships: { /* … */ },
    },
  };

  const deserialized = await combinedCourseBlueprintForUpdateSerializer.deserialize(payload);

  expect(deserialized).to.be.instanceOf(CombinedCourseBlueprintForUpdate);
  expect(deserialized).deep.equal({
    name: 'Mon épure',
    internalName: 'Une épure pour tel niveau',
    prescriberDescription: 'PrescriberDescription',
    /* … */
  });
});
```

**Code.** Le sérialiseur : [`combined-course-blueprint-for-update-serializer.js`](https://github.com/1024pix/pix/blob/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/quest/infrastructure/serializers/combined-course-blueprint-for-update-serializer.js#L3-L14). Le test : [`combined-course-blueprint-for-update-serializer_test.js`](https://github.com/1024pix/pix/blob/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/tests/quest/unit/infrastructure/serializers/combined-course-blueprint-for-update-serializer_test.js#L7-L49), simplifié.

Ce test ne couvre que le cas nominal. Les [tests attendus](#tests-attendus) demandent aussi le cas de
la relation absente.

---

## Tests attendus

| Objet | Type de test | Ce qu'on vérifie |
| --- | --- | --- |
| Sérialisation | **unitaire pur** : aucune doublure, aucun serveur | la forme produite, champ par champ |
| Désérialisation | **unitaire pur** | l'objet du domaine produit, et le cas de la relation absente |

Deux indices de diagnostic, avec leurs limites :

- Un test de sérialiseur qui a besoin d'une **fixture métier** ou d'une **doublure** signale que `M1`
  ou `M2` est violé. Limite : un sérialiseur de collection paginée demande un objet d'entrée un peu
  construit, sans rien décider.
- Le test couvre les **valeurs absentes**, pas seulement le cas nominal. C'est là que se révèle un
  champ que l'objet reçu ne portait pas. Un test écrit avec un objet complet passe alors que `M2` est
  violé, et c'est ce défaut que le test doit attraper.

---

## Checklist de revue

Ordonnée par ROI décroissant. Le statut de chaque ligne vient du moyen de vérification décrit dans
[`outillage.md`](outillage.md) :

- `[auto]` : la ligne disparaît dès que la règle existe ;
- `[partiel]` : la ligne reste, réduite à ce que la règle ne couvre pas ;
- `[humain]` : la ligne reste en entier.

```
[ ] [partiel] M1  Aucune condition dans la sérialisation — ni if, ni ternaire, ni &&, ni switch ; la règle ne voit que l'objet sérialisé
[ ] [partiel] M1  Aucun appel de méthode métier sur l'objet sérialisé
[ ] [humain]  M1  Un seul sérialiseur pour cette ressource, quel que soit l'appelant
[ ] [humain]  M3  Aucune valeur existante ne change de signification : un nouveau sens prend une nouvelle valeur
[ ] [humain]  M2  Tous les champs déclarés existent sur l'objet reçu
[ ] [humain]  M5  La désérialisation rend des objets du domaine, jamais json.data.attributes
[ ] [humain]  M5  Elle traduit sans décider : aucune condition sur une propriété métier
[ ] [humain]  M5  Elle ne valide pas : la forme des entrées est déclarée sur la route
[ ] [auto]    M4  Un fichier par ressource exposée, nommé d'après elle
[ ] [auto]    Un fichier de test existe, et son nom correspond à celui du sérialiseur
[ ] [humain]  Test unitaire pur, couvrant les valeurs absentes et pas seulement le cas nominal
```

À terme, neuf lignes restent : deux `[partiel]` et sept `[humain]`. Le typage en retire deux de plus,
`M2` et la première ligne de `M5` : voir [`outillage.md`](outillage.md#vérifier-par-le-typage).

---

## Sources

L'argumentation et la bibliographie sont dans [`explication.md`](explication.md#sources) et
`../references-ddd.md`. Les ADR sont dans `docs/adr/`.

| Invariant | Origine |
| --- | --- |
| La couche, **M1** aucune logique, **M4** un sérialiseur par ressource | Martin, *Clean Architecture*, ch. « Presenters and Humble Objects » |
| **M1** appliqué aux exports CSV | décision d'équipe |
| **M2** uniquement des champs présents | aucune source : déduction de `M1`. La clé de présentation composée ici est une décision d'équipe |
| **M3** format stable | Evans, *DDD*, Published Language. Aucun ADR, par décision : voir [`explication.md`](explication.md#la-stabilité-du-format-sans-adr) |
| **M5** la désérialisation ne laisse rien entrer | déduction de `I1` de `../repository/README.md`. Le rôle dans les deux sens vient de `docs/fr/Anatomy.md` |
