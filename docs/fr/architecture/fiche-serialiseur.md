# Fiche — Sérialiseur

Fiche générique. Elle décrit l'état cible, où tout est en TypeScript.

Le gabarit commun, l'état du chantier et l'ordre de relecture sont dans `corpus-index.md`. L'écart avec
le code réel est mesuré dans les rapports de divergence, un par contexte. Ce qui empêche aujourd'hui le
typage de s'appliquer est dans `migration-typescript.md`.

> **À instruire**
>
> - `M3` n'a **aujourd'hui** aucun moyen de vérification, parce que ses consommateurs sont hors du
>   dépôt. Cette limite tient à l'outillage actuel, pas à la nature de l'invariant. Une piste
>   identifiée la lève en grande partie : voir le § 7 et `migration-typescript.md`. Le changement de
>   **sens** d'un champ reste hors de portée.
> - Ce que font les applications front du contrat **n'est pas le sujet de ce corpus**, qui porte sur
>   `api/`. Le sujet est de ne pas casser le format publié.
> - Les faux positifs du § 6 ne sont pas mesurés. Le second motif de la règle de `M1`
>   demande de distinguer un accesseur d'une méthode métier, ce qui n'est pas décidable au nom seul.

## Sommaire

[1. Rôle](#1-rôle) · [2. Invariants](#2-invariants) ·
[3. Exceptions légitimes](#3-exceptions-légitimes) · [4. ROI des invariants](#4-roi-des-invariants) ·
[5. Écarts avec la théorie](#5-écarts-avec-la-théorie) ·
[6. Vérification déterministe](#6-vérification-déterministe) · [7. Le type](#7-le-type) ·
[8. Tests attendus](#8-tests-attendus) · [9. Checklist de revue](#9-checklist-de-revue) ·
[10. Sources](#10-sources)

**Invariants** — classés par ROI, comme au § 4.

| # | Invariant | ROI | Vérification |
| --- | --- | --- | --- |
| [**M1**](#m1-aucune-logique-dans-le-sens-sortant) | aucune logique dans le sens sortant | **forte** | règle ESLint, simple |
| [**M3**](#m3-le-format-de-réponse-est-un-contrat-externe) | le format de réponse est un contrat externe | **forte** | aucun moyen aujourd'hui — piste au § 7 |
| [**M2**](#m2-nexpose-que-des-champs-présents-sur-lobjet-reçu) | n'expose que des champs présents sur l'objet reçu | moyenne | typage, après migration |
| [**M5**](#m5-la-désérialisation-ne-laisse-pas-entrer-la-forme-du-transport) | la désérialisation ne laisse pas entrer la forme du transport | moyenne | revue |
| [**M4**](#m4-un-sérialiseur-par-ressource-exposée) | un sérialiseur par ressource exposée | hygiène | script |

**Écarts** — triés par verdict, comme au § 5.

| # | Écart | Verdict |
| --- | --- | --- |
| [**X1**](#x1-une-condition-choisit-entre-deux-formes-de-réponse) | une condition choisit entre deux formes de réponse | **à corriger** |
| [**X2**](#x2-le-sérialiseur-fabrique-un-champ-absent-de-lobjet-reçu) | le sérialiseur fabrique un champ absent de l'objet reçu | **à corriger** |
| [**X3**](#x3-un-champ-est-retiré-renommé-ou-change-de-sens-sans-coordination) | un champ est retiré, renommé, ou change de sens sans coordination | **à corriger** |
| [**X5**](#x5-un-export-csv-porte-des-règles-métier) | un export CSV porte des règles métier | **à corriger** |
| [**X4**](#x4-le-sérialiseur-reçoit-un-modèle-du-domaine-plutôt-quun-read-model) | le sérialiseur reçoit un modèle du domaine plutôt qu'un read-model | à surveiller |

Hors numérotation : la [table des trois niveaux de changement](#la-piste-qui-changerait-m3) du § 7,
qui dit ce qu'un outil peut attraper dans `M3`. Le
[cas de la clé de présentation](fiche-objet-valeur.md#le-cas-de-la-clé-de-présentation), qui se
compose dans le sérialiseur, est dans `fiche-objet-valeur.md`.

---

## 1. Rôle

Un sérialiseur traduit entre les objets du domaine et le format d'échange HTTP. Il le fait **dans les
deux sens** : il met en forme une réponse, et il désérialise une charge utile entrante. C'est le rôle
que lui donne `docs/fr/Anatomy.md`.

Les deux sens n'ont pas les mêmes invariants.

**Vers l'extérieur**, le sérialiseur est **déclaratif** : une liste de champs, éventuellement des
relations incluses. Il ne calcule pas, ne filtre pas selon une condition métier, ne décide pas. C'est
`M1`.

Un **export CSV** est aussi un sérialiseur : il met en forme vers un autre format d'échange. `M1`
s'y applique comme à JSON:API.

**Vers le domaine**, le sérialiseur **traduit** : il renomme, il convertit un type, il construit des
objets du domaine. Ces opérations sont sa raison d'être, et elles sont autorisées. Dans ce sens, il lui
est interdit de laisser entrer la forme du transport. C'est `M5`.

C'est un *presenter* au sens de Martin. Comme le contrôleur, c'est un *humble object* : assez simple
pour que son test soit trivial.

### Ce qu'un sérialiseur n'est pas

Table de décision. Si le code correspond à une ligne, ce n'est pas un sérialiseur.

| Le code… | Va dans | Fiche |
| --- | --- | --- |
| calcule une valeur absente de l'objet reçu | le usecase, ou un read-model | `fiche-usecase.md`, `fiche-read-model.md` |
| filtre selon une condition métier | le domaine — Entity, Value Object, Aggregate Root | `fiche-entite.md`, `fiche-objet-valeur.md`, `fiche-racine-agregat.md` |
| choisit une forme de réponse selon les droits de l'appelant | le usecase, qui ne renvoie que ce qui est autorisé | `fiche-usecase.md` |
| met en forme pour un autre Bounded Context | `application/api/` et son DTO de contrat | `fiche-api-interne.md` |
| assemble une forme pour une lecture | un read-model, construit par un repository | `fiche-read-model.md` |

---

## 2. Invariants

### M1. Aucune logique dans le sens sortant

**Énoncé.** Pas de condition, pas de calcul, pas de décision **dans la sérialisation**. Le sérialiseur
met en forme ce qu'il reçoit.

Cet invariant ne porte **pas** sur la désérialisation, dont la traduction est le rôle. Voir `M5`.

```js
// fautif — une règle métier choisit ce que la réponse contient
transform(record) {
  record.badges = record.badges.filter((badge) => badge.isCertifiable);
  return record;
},
attributes: ['name', 'badges'],

// conforme — le usecase ne renvoie que les badges certifiables
attributes: ['name', 'badges'],
```

**Ce qui casse.** Une règle écrite ici est **invisible depuis le domaine**. Elle est facile à écrire
ici, et personne ne l'y cherche. Une fuite y coûte donc plus cher qu'ailleurs.

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
}

// conforme à M1 comme à M5 — une fonction utilitaire du fichier, appelée par la désérialisation :
// elle prend une valeur, pas l'objet
function _cleanValue(value) {
  if (value) return value.replaceAll('\u0000', '');
  return '';
}
```

La frontière est nette. Si l'expression **choisit entre deux formes de réponse**, c'est une décision.
Si elle protège d'une valeur absente, nomme un type ou nettoie une chaîne, ce n'en est pas une. La
règle du § 6 porte cette distinction : voir la réserve qui y est faite.

Cette frontière vaut aussi entre fichiers. Deux sérialiseurs pour la même ressource selon l'appelant
sont la même violation à une autre échelle. C'est au usecase de ne renvoyer que ce qui est autorisé.

### M2. N'expose que des champs présents sur l'objet reçu

**Énoncé.** Le sérialiseur déclare des champs, il ne les fabrique pas. Si un champ à exposer n'existe
pas sur l'objet, c'est au usecase ou au read-model de le fournir.

```js
// fautif — le champ est fabriqué ici, par une méthode métier de l'objet reçu
isAccessBlockedCollege: access.isAccessBlockedCollege(),

// conforme — le read-model reçu porte le champ, déjà calculé
attributes: ['isAccessBlockedCollege']
```

Composer une valeur à partir de champs reçus n'est pas fabriquer un champ. Un libellé ou une clé de
présentation se composent ici : voir le § 3.

**Ce qui casse.** Un champ déclaré mais absent de l'objet sort systématiquement à `null`, et personne
ne sait pourquoi. Le front
l'interprète comme une donnée absente, alors qu'elle n'a jamais été chargée. Rien ne le signale : ni
la compilation, ni les tests du sérialiseur, qui passent avec un objet de test complet. Quand le champ
est fabriqué par une méthode métier, comme dans l'exemple fautif, un calcul métier vit dans la mise en
forme, invisible depuis le domaine comme sous `M1`.

### M3. Le format de réponse est un contrat externe

**Énoncé.** Le format produit est consommé par des applications front, parfois par des tiers. Il obéit
donc aux règles d'un format publié :

- un ajout se fait sans casser l'existant ;
- un renommage ne se fait pas à la légère ;
- un retrait se coordonne.

**Ce qui casse.** Casser le format casse les applications front, chez d'autres équipes, à l'exécution.
C'est la seule couche du dépôt dont les consommateurs sont partiellement inconnus.

C'est le pendant externe de `P6` de `fiche-api-interne.md`. Une différence impose plus de prudence :
les consommateurs d'une API interne sont connaissables, puisque ce sont les contextes qui déclarent en
dépendre. Ceux d'une API HTTP le sont moins.

**Le pire cas n'est ni l'ajout ni le retrait, c'est le changement de sens** d'un champ existant. Rien
ne le signale : ni la compilation, ni les tests, ni les consommateurs, jusqu'à ce qu'un comportement
devienne faux quelque part.

Le changement de sens recouvre deux cas :

- **Changer l'ensemble des valeurs possibles** d'un champ, c'est-à-dire ajouter ou retirer un état,
  est un changement de forme. Un outil peut donc le rattraper.
- **Redéfinir ce qu'une valeur inchangée signifie** n'est rattrapable par aucun outil, présent ou
  futur.

Voir le § 7.

### M4. Un sérialiseur par ressource exposée

**Énoncé.** Un fichier par ressource, nommé d'après elle.

**Ce qui casse.** Rien à l'exécution. C'est un invariant d'hygiène : il rend le fichier trouvable. Il
rend aussi visible la violation décrite sous `M1` : deux sérialiseurs pour une même ressource se voient
quand la convention est d'en avoir un.

### M5. La désérialisation ne laisse pas entrer la forme du transport

**Énoncé.** Une fonction de désérialisation rend des objets du domaine, ou un objet d'entrée aux clés
du domaine. Elle ne rend jamais la structure du format d'échange.

```js
// conforme — la désérialisation rend un objet du domaine
const deserialize = async function (payload) {
  const deserializedData = await new Deserializer({ keyForAttribute: 'camelCase' }).deserialize(payload);
  return new CombinedCourseBlueprintForUpdate(deserializedData);
};

// fautif — la forme du transport continue vers le domaine, augmentée d'un champ calculé
const deserialize = async function (payload) {
  const deserializedTraining = await new Deserializer({ … }).deserialize(payload);
  const { days, hours, minutes } = deserializedTraining.duration;
  return { ...deserializedTraining, duration: `${days}d${hours}h${minutes}m` };
};
```

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
de `fiche-route.md`. Un sérialiseur qui vérifie qu'un champ est présent double une garantie qui existe
déjà. Il la double mal, sans message utilisateur et sans documentation générée.

**Ce qui casse.** La forme JSON:API entre dans le domaine, et un changement de format d'échange
remonte jusqu'aux modèles. C'est la même mécanique que `I1` de `repository/README.md`, vue depuis
l'autre porte d'entrée.

---

## 3. Exceptions légitimes

Une exception ne vaut que pour l'invariant qu'elle nomme. Elle n'excuse rien d'autre.

| Cas | Statut |
| --- | --- |
| `x ?? null` ou `x?.y` pour se protéger d'une valeur absente | **autorisé** — protection de forme. `M1` |
| Composer un libellé à partir de plusieurs champs reçus | **autorisé** — mise en forme sans décision |
| Composer une clé de présentation à partir de champs reçus | **autorisé** — c'est ici qu'elle se compose. Voir `V2` et `X5` de `fiche-objet-valeur.md` |
| Aplatir une structure imbriquée | **autorisé** |
| Déclarer des relations incluses | **autorisé** — c'est de la mise en forme |
| Renommer un champ pour le vocabulaire du format | **autorisé**, et c'est un bon usage de la couche |
| Une enveloppe de pagination autour des objets sérialisés | **autorisé** |
| Un sérialiseur qui reçoit un read-model plutôt qu'une Entity | **autorisé**, et préférable. Voir `X4` |
| Une condition qui choisit entre deux formes de réponse | **pas une exception** — c'est `M1` violé, donc `X1` |
| Un champ calculé depuis une méthode métier de l'objet | **pas une exception** — c'est `M2` violé, donc `X2` |
| Un export CSV qui filtre ou choisit ses données selon une règle métier | **pas une exception** : c'est `M1` violé, donc `X5` |
| Deux sérialiseurs pour la même ressource selon l'appelant | **pas une exception** — c'est `M1` à l'échelle du fichier |
| Un `if` sur une relation absente dans une **désérialisation** | **autorisé** — c'est de la traduction, `M5`. La même forme serait fautive dans une sérialisation |
| Un `parseInt` ou un renommage de clé dans une désérialisation | **autorisé** — c'est la raison d'être du sens entrant |
| Une désérialisation qui vérifie la présence d'un champ | **pas une exception** — la forme des entrées se déclare sur la route, `R1` |

---

## 4. ROI des invariants

| Invariant | Rentabilité | Ce qu'on gagne |
| --- | --- | --- |
| **M1** aucune logique | **forte** | Une règle écrite ici serait invisible depuis le domaine et réécrite ailleurs. Une fuite coûte plus cher à cet endroit qu'ailleurs |
| **M3** format stable | **forte** | Les applications front continuent de fonctionner. C'est la seule couche dont les consommateurs sont partiellement inconnus |
| **M2** uniquement des champs présents | moyenne | Un champ manquant devient une erreur visible au lieu d'un `null` que le front interprète comme une donnée absente |
| **M5** la désérialisation ne laisse rien entrer | moyenne | La forme du format d'échange s'arrête à la frontière. Un changement de JSON:API ne remonte pas jusqu'aux modèles |
| **M4** un sérialiseur par ressource | hygiène | Aucun gain mesurable. Rend le fichier trouvable, et rend visible la violation de `M1` entre fichiers |

Les deux invariants en rentabilité forte ont des vérifiabilités opposées. `M1` se lit dans le fichier
et se contrôle par une règle simple. `M3` n'a **aucun moyen aujourd'hui**, parce que ses consommateurs
sont hors du dépôt.

Cette asymétrie n'est pas définitive. Un paquet de types partagé entre l'API et les applications front
rendrait `M3` vérifiable par le compilateur pour les retraits et les renommages : voir le § 7. Il ne
resterait alors hors de portée que le changement de sens d'un champ.

### Ce que ça n'apporte pas

Rien ici ne dit si le format exposé est **bien conçu** : granularité, nommage des champs, relations
incluses ou non. Un sérialiseur irréprochable peut produire une réponse pénible à consommer.

---

## 5. Écarts avec la théorie

| Écart | Nature | Coût payé | Bénéfice obtenu | Verdict |
| --- | --- | --- | --- | --- |
| **X1** Une condition choisit entre deux formes de réponse | dérive | La règle est invisible depuis le domaine, à l'endroit où personne ne la cherche | Le besoin est satisfait sans toucher au usecase ni au domaine | **À corriger** |
| **X2** Le sérialiseur fabrique un champ absent de l'objet reçu | dérive | Un champ sort à `null` sans cause visible, ou un calcul métier vit dans la mise en forme | Pas de read-model ni de usecase à modifier | **À corriger** |
| **X3** Un champ est retiré, renommé, ou change de sens sans coordination | dérive | Des applications front cassent à l'exécution, chez d'autres équipes. Le changement de sens ne se signale nulle part | Le format suit le vocabulaire interne sans dette de compatibilité | **À corriger** |
| **X5** Un export CSV porte des règles métier | dérive | La règle vit dans la mise en forme, où personne ne la cherche, et un service du domaine est appelé depuis l'infrastructure | L'export se construit en un seul fichier | **À corriger** |
| **X4** Le sérialiseur reçoit un modèle du domaine plutôt qu'un read-model | convention assumée | Le format de sortie est couplé à la forme du modèle : renommer un champ du modèle le retire de la réponse, sans erreur | Réel — pas de read-model à écrire pour chaque écran, et le modèle est déjà là | *À surveiller* |

### X1. Une condition choisit entre deux formes de réponse

**Ce que dit la théorie.** Le *presenter* est dépourvu de logique. Son test reste ainsi trivial, et la
décision vit là où un lecteur la cherche.

**Exemple concret.**

```js
const serialize = function ({ targetProfile, filter }) {
  if (filter?.badges === 'certifiable') {
    return new Serializer('target-profile', {
      transform(record) {
        record.badges = record.badges.filter((badge) => badge.isCertifiable);
        return record;
      },
      attributes: ['name', 'badges'],
      …
    }).serialize(targetProfile);
  }

  return new Serializer('target-profile', { attributes: ['name', 'internalName', …, 'badges', …], … })
    .serialize(targetProfile);
};
```

Deux formes de réponse selon le filtre de la requête. Le choix des badges exposés est une règle
métier, prise dans la mise en forme. La règle du § 6 ne voit pas cette forme : la condition porte sur
un paramètre de `serialize`, pas sur l'objet sérialisé.

Le volume de cet écart n'est pas connu. Le verdict reste *à corriger*, parce qu'une seule occurrence
coûte cher.

**Correction.** Mesurer d'abord le volume avec la règle du § 6, avant d'ouvrir un chantier. Les
conditions sur un paramètre de `serialize` lui échappent et se relèvent en revue. Puis faire
renvoyer par le usecase **uniquement ce qui est à exposer**, et sérialiser sans condition. Quand la
forme dépend des droits de l'appelant, le usecase ne renvoie que ce qui est autorisé. Si les deux
formes sont vraiment deux ressources, ce sont deux points d'entrée, chacun avec ses droits déclarés
sur la route : `R2` de `fiche-route.md`.

La correction n'est pas mécanique. Il faut décider laquelle des deux lectures est la bonne, et cette
décision remonte souvent jusqu'au découpage de l'API.

### X2. Le sérialiseur fabrique un champ absent de l'objet reçu

**Ce que dit la théorie.** Même chapitre : le *presenter* met en forme, il ne produit pas de donnée.

**Exemple concret.**

```js
isAccessBlockedCollege: access.isAccessBlockedCollege(),
isAccessBlockedLycee: access.isAccessBlockedLycee(),
isAccessBlockedAEFE: access.isAccessBlockedAEFE(),
isAccessBlockedAgri: access.isAccessBlockedAgri(),
```

L'appel passe pour de la mise en forme parce qu'il ressemble à un accesseur. C'est pourtant une
méthode métier de l'objet reçu, appelée dans le sérialiseur.

**Correction.** Le champ vient du usecase ou du read-model, qui le porte déjà calculé. Le sérialiseur
retombe à une liste de noms.

Le déplacement est mécanique quand le calcul est pur. Il ne l'est pas quand il faut décider si le
champ appartient au read-model, donc à la présentation, ou au domaine. C'est le discriminant du § 1
de `fiche-objet-valeur.md`. Le critère est celui de `RM1` de `fiche-read-model.md` : ce calcul
décide-t-il quelque chose ?

### X3. Un champ est retiré, renommé, ou change de sens sans coordination

**Ce que dit la théorie.** Evans traite le sujet sous *Published Language* : un format publié se
versionne ou s'étend, il ne se casse pas. Un consommateur hors du système ne change pas la règle. Il
en augmente la portée.

**Exemple concret.** Hypothétique : le cas grave n'a pas d'exemple visible dans le code, et c'est ce
qui le rend grave. Un champ `status` dont une valeur inchangée change de sens produit un diff d'une
ligne et casse un affichage ailleurs.

**Correction.** Aucune correction rétroactive n'est possible. Aucune procédure de coordination entre
équipes n'est retenue, parce que ce qui se passe côté front n'est pas le sujet de ce corpus.

Côté API, la règle tient en une phrase, plus étroite qu'elle ne paraît : **ne jamais redéfinir ce
qu'une valeur existante signifie**, et en ajouter une nouvelle à la place. C'est la seule partie de
l'écart qu'aucun outil ne rattrapera, donc la seule tenue à la main.

Le reste de l'écart a une piste mécanique : retrait de champ, renommage, ajout ou retrait d'une valeur
possible. Un paquet de types **et de constantes** partagé avec les fronts, une fois ceux-ci en
TypeScript, en fait des erreurs de compilation. Voir le § 7. Un outil est préféré à une procédure,
parce qu'une procédure s'oublie.

Par décision, aucun ADR ne porte de procédure de coordination. Deux tiers de l'écart attendent le bon outil, et
le tiers restant relève de la règle du sens.

### X5. Un export CSV porte des règles métier

**Ce que dit la théorie.** Comme pour `X1` : le *presenter* est dépourvu de logique, quel que soit
le format qu'il produit.

**Exemple concret.** L'export CSV des résultats d'une campagne d'évaluation choisit lui-même les
acquis de chaque participant, selon l'état de la participation. Pour une participation en cours, il
appelle un service du domaine.

```js
// prescription/campaign/infrastructure/serializers/csv/campaign-assessment-export.js — extrait
if (campaignParticipationInfo.isShared) {
  const sharedResultInfo = sharedKnowledgeElementsByUserIdAndCompetenceId.find(…);
  participantKnowledgeElementsByCompetenceId = this.learningContent.getKnowledgeElementsGroupedByCompetence(
    sharedResultInfo.knowledgeElements,
  );
} else if (campaignParticipationInfo.isCompleted === false) {
  const othersResultInfo = startedKnowledgeElementsByUserIdAndCompetenceId.find(…);
  const filteredKnowledgeElements = improvementService.filterKnowledgeElements({
    knowledgeElements: othersResultInfo.knowledgeElements,
    isFromCampaign: true,
    isImproving: true,
    createdAt: campaignParticipationInfo.createdAt,
  });
  …
}
```

Quels acquis comptent pour un participant est une règle métier. Ici, elle est dans l'infrastructure.
Un écran qui affiche les mêmes résultats doit la réécrire, et rien ne garantit que les deux versions
restent identiques.

**Correction.** Faire calculer par le usecase, ou par un read-model, les acquis retenus pour chaque
participant. L'export ne fait plus que les mettre en colonnes. La correction n'est pas mécanique : il
faut déplacer la règle sans changer son résultat, donc la couvrir d'abord par un test.

### X4. Le sérialiseur reçoit un modèle du domaine plutôt qu'un read-model

**Ce que dit la théorie.** Le format de sortie et le modèle du domaine évoluent pour des raisons
différentes. Les coupler fait dépendre l'un de l'autre.

**Exemple concret.**

```js
// le sérialiseur déclare des champs du modèle du domaine lui-même
attributes: ['name', 'code', 'description', 'illustration']   // ce sont des champs de l'Entity CombinedCourse
```

Le sérialiseur reçoit `CombinedCourseDetails`, un Aggregate qui étend `CombinedCourse`. Renommer un
champ de `CombinedCourse` pour un besoin interne retire l'attribut de la réponse, sans erreur.

**Correction.** Aucune correction systématique. Le bénéfice de la convention est réel : écrire un
read-model pour chaque écran a un coût, et le modèle est déjà disponible.

Un read-model est dû dès que le format de sortie et le modèle **divergent** : un champ exposé qui
n'existe pas sur le modèle, ou un champ du modèle qu'il faut masquer. Le premier symptôme est
habituellement `X2`.

**Révision.** Un incident où un changement interne du domaine a modifié une réponse d'API sans que
personne l'ait voulu change ce verdict.

---

## 6. Vérification déterministe

Il n'existe aucun plugin ESLint maison. Toute règle sur mesure suppose d'abord de créer cette
infrastructure.

| Invariant | Moyen | Coût | Faux positifs |
| --- | --- | --- | --- |
| **M1** aucune condition | règle ESLint : structure conditionnelle **sur l'objet sérialisé**, hors `??`, `?.`, hors fonction de désérialisation, hors fonction de nommage du transport et hors fonction utilitaire qui prend une valeur | ~40 lignes | **à mesurer** — voir la réserve ci-dessous |
| **M1** aucune méthode métier | même règle : appel de méthode sur l'objet sérialisé | ~10 lignes de plus | **à mesurer** |
| **M4** un fichier par ressource | script `tests/tooling/` : nommage et unicité | ~15 lignes | aucun |
| **M2** champs présents | typage, après migration du read-model reçu | — | aucun — voir § 7 |
| **M5** la désérialisation ne laisse rien entrer | revue ; typage après migration — voir § 7 | — | — |
| **M3** format stable | aucun moyen aujourd'hui. Piste : un paquet de types partagé avec les fronts — voir § 7 | — | — |

### M1 — la règle qui compte ici, et sa réserve

Un sérialiseur est déclaratif, donc une structure conditionnelle y est un signal. Ce signal est moins
fiable qu'il n'y paraît : une condition y est souvent légitime, comme le montrent les formes autorisées
sous `M1`. Une règle qui signale « toute condition dans un fichier de sérialiseur » produit donc
surtout du bruit.

**Quatre exclusions** sont posées d'emblée, pour éviter ce bruit :

- L'opérateur de coalescence `??` et l'accès optionnel `?.`. Ce sont des protections de forme,
  présentes dans presque tous les sérialiseurs.
- Le corps des fonctions de désérialisation. Une désérialisation contient légitimement des `if`, des
  conversions et des constructions d'objets : c'est `M5`.
- Les fonctions de nommage du transport, comme celle qui traduit un nom d'attribut en type JSON:API.
  Ce sont des conditions sur une chaîne de format, pas sur l'objet du domaine.
- Les fonctions utilitaires qui prennent une valeur, et non l'objet sérialisé, comme le nettoyage
  d'une chaîne.

La règle couvre aussi les exports CSV de `infrastructure/serializers/csv/`. Voir `X5`.

Après ces quatre exclusions, la règle signale les `if`, les ternaires, les `&&` en position de valeur
et les `switch` **qui portent sur l'objet sérialisé ou une de ses propriétés**. C'est ce dernier point
qui porte l'essentiel du coût de la règle, et qui la rend défendable. La question posée n'est plus
« y a-t-il une condition » mais « la mise en forme dépend-elle de ce qu'elle met en forme ».

Le second motif, un appel de méthode sur l'objet sérialisé, attrape `X2` en même temps. Il attrape
aussi un filtrage de l'objet reçu, comme le fautif de `M1`. Il demande de
distinguer un accesseur d'une méthode métier, ce qui n'est pas décidable au nom seul. Il s'écrit après
le premier, et se mesure avant de devenir bloquant.

### M5 — pourquoi la revue, et pas une règle

Distinguer une traduction d'une décision demande de savoir ce qui est métier. Le motif fautif le plus
grossier, rendre `json.data.attributes` tel quel, est détectable. C'est aussi probablement le plus
rare.

Ce qui rendrait `M5` structurel est le typage. Une fonction de désérialisation dont le type de retour
est celui d'un objet du domaine ne peut pas rendre la forme du transport. Voir § 7.

### M3 — pas mécanisable aujourd'hui, et par quoi ça changerait

`M3` demande de savoir ce que les consommateurs lisent. Aucune règle de lint ne l'apprendra depuis ce
dépôt. C'est le seul invariant du corpus dont la vérification vit hors du dépôt.

**Ce qui lèverait la limite** : un paquet de types partagé entre l'API et les applications front, une
fois celles-ci en TypeScript. Le compilateur du front refuserait alors un champ retiré ou renommé, et
la vérification cesserait d'être une affaire de coordination. Le détail est au § 7.

**Ce qui resterait hors de portée**, même avec ce paquet : le changement de **sens** d'un champ. Un
`status` dont les valeurs changent de signification garde son type. C'est la part de `M3` qui reste en
revue dans tous les cas, et c'est la plus dangereuse.

### Ordre de mise en œuvre

Cet ordre suit le ROI du § 4, sauf pour les étapes qui attendent un préalable : une mesure pour
`M1` méthodes, la migration des read-models pour `M2`.

1. **M1 conditions** : la règle simple, avec ses quatre exclusions, dont celle des désérialisations.
2. **M4** : script de nommage et d'unicité.
3. **M1 méthodes** : après mesure.
4. **M2** : par le typage, une fois les read-models migrés.

### Codemods

Sans objet. Aucun invariant ne se corrige par une transformation :

- `M1` demande de décider où déplacer la règle qui a fui ;
- `M2` demande de décider si le champ appartient au read-model ou au domaine ;
- `M3` demande de coordonner ;
- `M5` demande de distinguer une traduction d'une décision.

---

## 7. Le type

La liste des champs exposés se type contre l'objet reçu, ce qui rend **`M2` structurel** : déclarer un
champ qui n'existe pas sur l'objet ne compile plus.

```ts
type SerializableFields<T> = readonly (keyof T)[];

const attributes: SerializableFields<CalibrationScoringConfiguration> = [
  'calibrationId',
  'globalScoringConfiguration',
  'competencesScoringConfiguration',
];
```

Le gain est direct et ne dépend pas de la migration du reste : il suffit que le **read-model reçu**
soit typé. Le sérialiseur est donc un candidat plus précoce que le contrôleur ou la route, à condition
que les read-models soient migrés d'abord.

**`M5` devient structurel aussi.** Une fonction de désérialisation dont le type de retour est celui
d'un objet du domaine ne peut plus rendre la forme du transport : le compilateur refuse
`json.data.attributes`.

Le typage n'apporte pas `M1` et `M3` **dans ce dépôt seul**. Une condition reste possible dans un
fichier typé. La stabilité du contrat n'est pas vérifiable tant que le type ne franchit pas la
frontière.

### La piste qui changerait `M3`

Ember prend en charge TypeScript. Le jour où les applications front y passent, **un paquet de types
partagé entre l'API et les fronts** peut porter la forme de retour des sérialiseurs.

Retirer ou renommer un champ devient alors une **erreur de compilation chez le consommateur**. `M3`
cesse d'être une procédure de coordination et devient une contrainte mécanique, ce qu'aucune autre
approche ne permet.

**Le paquet peut aussi porter les constantes.** Les chaînes qui portent du sens deviennent des types
partagés, au lieu d'être recopiées de chaque côté :

- les valeurs possibles d'un `status` ;
- les codes d'erreur ;
- les énumérations du contrat.

Ajouter ou retirer une valeur possible devient à son tour une erreur de compilation. Les constantes
partagées retirent aussi un défaut qui existe **dès aujourd'hui** : la duplication des littéraux entre
l'API et les fronts.

Ce qui reste alors hors de portée est bien plus étroit que ce que `M3` couvre. Des trois niveaux,
seul le dernier résiste :

| Le changement | Attrapé par |
| --- | --- |
| Un champ est retiré ou renommé | le type partagé |
| Une valeur possible est ajoutée ou retirée | les constantes partagées |
| Une valeur inchangée change de **signification** | rien, jamais |

Le troisième cas est le résidu irréductible : `terminé` reste la chaîne `'terminé'`, son type ne bouge
pas, et pourtant elle ne veut plus dire la même chose. C'est la seule part de `M3` qui restera en revue
humaine, quel que soit l'outillage.

**Coût.** Le paquet devient lui-même un contrat versionné, à publier et à faire évoluer.

Cette piste n'est pas une décision de ce corpus, parce que le passage des fronts à TypeScript ne
relève pas de `api/`. Elle est consignée dans `migration-typescript.md`.

Les contraintes de syntaxe imposées par la configuration sont dans `migration-typescript.md`.

---

## 8. Tests attendus

| Objet | Type de test | Ce qu'on vérifie |
| --- | --- | --- |
| Sérialisation | **unitaire pur** — aucune doublure, aucun serveur | la forme produite, champ par champ |
| Désérialisation | **unitaire pur** | l'objet du domaine produit, et le cas de la relation absente |

L'existence du fichier de test se vérifie en comparant les noms. Moyens et limites dans
`repository/outillage.md`.

Deux indices de diagnostic, avec leurs limites :

- Un test de sérialiseur qui a besoin d'une **fixture métier** ou d'une **doublure** signale que `M1`
  ou `M2` est violé. Limite : un sérialiseur de collection paginée demande un objet d'entrée un peu
  construit, sans rien décider.
- Le test doit couvrir les **valeurs absentes**, pas seulement le cas nominal. C'est là que se révèle
  un champ que l'objet reçu ne portait pas. Un test écrit avec un objet complet passe alors que `M2`
  est violé, et c'est ce défaut que le test doit attraper.

---

## 9. Checklist de revue

Ordonnée par ROI décroissant, comme au § 4.

Chaque ligne porte son statut au regard du § 6 :

- Une ligne `[auto]` disparaît dès que la règle correspondante existe.
- Une ligne `[partiel]` reste, réduite à ce que la règle ne couvre pas.
- Une ligne `[humain]` reste en entier : aucun moyen déterministe n'est connu.

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

À terme, il reste neuf lignes : deux `[partiel]` et sept `[humain]`. Deux d'entre elles sortent par le
**typage** et non par une règle de lint : `M2`, et la première ligne de `M5`, puisqu'un type de retour
du domaine interdit de rendre la forme du transport.

Il reste alors sept lignes :

- `M1` conditions, pour les conditions sur un paramètre de `serialize` ;
- `M1` méthodes, en partie ;
- l'unicité du sérialiseur par ressource ;
- `M3` dans sa part irréductible ;
- les deux lignes de `M5` qui portent sur une décision : traduire n'est pas décider, et valider n'est
  pas son travail ;
- le test unitaire pur.

---

## 10. Sources

Bibliographie et liens dans `references-ddd.md`. Sources primaires des conventions Pix : les ADR de
`docs/adr/`.

| Invariant | Source | Où vérifier |
| --- | --- | --- |
| La couche, **M1** et **M4** | Martin, *Clean Architecture*, ch. « Presenters and Humble Objects » — le *presenter* est dépourvu de logique pour que son test soit trivial | le livre de 2017 ; billet gratuit de 2012 |
| **M2** uniquement des champs présents | **aucune source** — déduction de `M1` | — |
| **M5** la désérialisation ne laisse rien entrer | **déduction** de `I1` de `repository/README.md`, vu depuis l'autre porte d'entrée. Le rôle dans les deux sens est documenté : `docs/fr/Anatomy.md` décrit les sérialiseurs comme des « Convertisseurs de données Domain objects ←→ HTTP request objects » | `docs/fr/Anatomy.md` |
| **M3** format stable | Evans, *DDD*, ch. « Maintaining Model Integrity » — **Published Language**, appliqué ici à l'extérieur du système plutôt qu'entre contextes | *DDD Reference*, PDF gratuit |
| La stabilité du format des réponses HTTP | **aucun ADR**, par décision : deux tiers de l'écart se règlent par un outil à venir plutôt que par une procédure. Voir `X3` au § 5 | — |

**Deux invariants sur cinq n'ont aucune source directe** : `M2` et `M5`, tous deux des déductions. Le
reste repose sur un chapitre de Martin et un chapitre d'Evans.

`M3` est le seul invariant du corpus qui porte sur un contrat dont les consommateurs sont **hors du
dépôt**. C'est aussi le seul dont la vérification ne peut pas vivre ici aujourd'hui. Un paquet de types
partagé avec les fronts la ramènerait pour l'essentiel : voir § 7.
