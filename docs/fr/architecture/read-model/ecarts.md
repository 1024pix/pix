# Read-model — écarts

Suivi : où le code des read-models s'écarte de la théorie, et ce qui est décidé. **État au
2026-09-24.** Ce fichier décrit le code, il se périme. Les règles sont dans [`README.md`](README.md),
la théorie dans [`explication.md`](explication.md#la-théorie-des-écarts).

## Grille de verdict

- La nature d'un écart est *convention assumée*, *dérive* ou *vestige*.
- **À corriger** : le coût dépasse le bénéfice, ou le bénéfice s'obtient autrement. *À surveiller* : un coût et un bénéfice réels, sous
  condition. *Rien à faire* : aucun coût réel.
- Un bénéfice de performance invoqué sans mesure compte pour nul.

| Écart | Nature | Coût payé | Bénéfice obtenu | Verdict |
| --- | --- | --- | --- | --- |
| **X1** Un dossier pour trois natures d'objets | dérive | Le classement est invisible : un Value Object mal rangé ne se distingue pas d'un read-model. RM3 ne peut pas devenir bloquant | Aucun | **À corriger** |
| **X2** Le mot `read-model` vient de CQRS | convention assumée | Collision avec un concept distinct : qui connaît CQRS suppose un store séparé et de la cohérence à terme | Le mot est en usage et compris de l'équipe. C'est l'Ubiquitous Language. Renommer toucherait de nombreux fichiers | *À surveiller* |
| **X3** L'objet est immuable alors que rien ne l'exige | convention assumée | Champs privés et accesseurs à écrire pour un objet qui ne fait que sortir | Uniformité avec les Value Objects, et une seule règle de lint pour les deux | *Rien à faire* |

---

### X1. Un dossier pour trois natures d'objets

**Exemple concret.** Le même mot désigne deux choses à deux emplacements :

```
domain/read-models/          → assemblé par une requête, traverse le domaine, sort
application/api/read-models/ → contrat publié vers un autre contexte
```

**Code.** Par exemple [`domain/read-models/`](https://github.com/1024pix/pix/tree/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/organizational-entities/domain/read-models) et [`application/api/read-models/`](https://github.com/1024pix/pix/tree/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/prescription/organization-learner/application/api/read-models).

Sous le premier dossier, deux natures se mélangent. Certains objets sont lus par une règle : ce sont
des Value Objects, qui doivent satisfaire `V3` et `V5` de `../objet-valeur/README.md`. D'autres ne font
que sortir.

**Verdict.** Le classement est tout le bénéfice attendu, et il n'est pas fait. Le coût est payé sans
bénéfice : à corriger. La théorie est dans
[`explication.md`](explication.md#x1-un-dossier-pour-trois-natures-dobjets).

**Correction.** Classer, pas renommer. Le nom du dossier n'y change rien, voir X2.

1. Un objet qu'une règle lit est un **Value Object**. Il va dans `domain/models/` et doit satisfaire
   `V3` et `V5`. C'est le déplacement qui coûte. C'est aussi celui qui rapporte : il révèle lesquels de
   ces objets font du travail de domaine.
2. Un objet assemblé pour sortir reste un **read-model**, dans `domain/read-models/`. Rien à faire.
3. Le contrat publié vers un autre contexte est un **DTO de contrat**. Il relève de
   `../api-interne/README.md`. Le mot `read-model` y est trompeur.

Le classement se fait fichier par fichier, par les quatre tests du discriminant de
`../objet-valeur/README.md`.

Ce que la correction débloque : RM3 par une règle de chemin. La règle **peut déjà s'écrire** : les
deux dossiers sont frères. Mais elle se déclencherait aujourd'hui sur les Value Objects mal rangés. Elle
ne peut donc pas être bloquante avant le classement. Voir
[`outillage.md`](outillage.md#rm3--une-règle-de-chemin).

Migration opportuniste, conforme à l'ADR 20, « Est-il obligatoire d'implémenter un use-case dans
toutes les situations ? », qui ne reprend pas l'existant de façon systématique : le neuf suit le
discriminant, l'existant se classe à sa prochaine modification.

### X2. Le mot `read-model` vient de CQRS

**Exemple concret.** Le malentendu apparaît chez quelqu'un qui connaît CQRS. Le mot lui promet un
store séparé, une projection alimentée par des événements, et de la cohérence à terme. Il n'y a rien
de tout cela ici.

**Verdict.** À surveiller. Le renommage a été écarté, pour deux raisons.

Le mot est celui de l'équipe. L'Ubiquitous Language est la langue de l'équipe, pas celle du livre :
voir [`explication.md`](explication.md#x2-le-mot-read-model-vient-de-cqrs).

Le renommage n'apporte rien à l'outillage. `domain/models/` et `domain/read-models/` sont déjà des
dossiers frères, donc la règle de chemin de RM3 peut déjà s'écrire. Ce qui la bloque, c'est le
classement, pas le nom.

La référence précise ce que le mot désigne et ce qu'il ne désigne pas : voir
[`README.md`](README.md#ce-que-le-mot-désigne-et-ce-quil-ne-désigne-pas).

**Correction.** Aucune sur le mot.

**Révision.** Deux faits changent ce verdict : un malentendu constaté sur pièces, ou l'introduction
réelle d'un read model CQRS. Un read model CQRS et le read-model Pix ne peuvent pas porter le même
nom.

### X3. L'objet est immuable alors que rien ne l'exige

**Exemple concret.** Un read-model écrit comme un Value Object, avec le coût d'écriture que cela
suppose :

```js
class PlacesLot {
  #id;
  #activationDate;

  constructor(params = {}) {
    this.#id = params.id;
    this.count = params.count;                       // public
    this.organizationId = params.organizationId;     // public
    this.#activationDate = params.activationDate;
  }

  get id()             { return this.#id; }
  get activationDate() { return this.#activationDate; }
}
```

**Code.** [`PlacesLot.js`](https://github.com/1024pix/pix/blob/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/organizational-entities/domain/read-models/PlacesLot.js#L21-L46), simplifié : le fichier réel porte quatre champs privés et valide ses paramètres.

Dans cet extrait, la moitié des champs sont privés avec accesseur, l'autre moitié publique. Le coût
d'écriture est payé (six lignes pour deux champs). Le bénéfice n'est pas obtenu : l'objet reste
modifiable par les deux champs restants.

Un objet littéral gelé rendrait le même service à cet endroit précis.

**Verdict.** Rien à faire sur le principe. Le coût est réel mais faible. Le bénéfice est une uniformité
utile : une seule règle de lint couvre `V1` et `V7` pour les deux catégories. Exempter les read-models
demanderait à cette règle de distinguer les deux, ce que X1 rend impossible aujourd'hui. C'est une
convention explicite, pas une lecture de Fowler : il n'exige pas l'immuabilité. La théorie est dans
[`explication.md`](explication.md#x3-lobjet-est-immuable-alors-que-rien-ne-lexige).

**Correction.** Aucune sur le principe. Les deux champs publics de l'exemple, eux, violent `V1` et se
corrigent : X3 ne porte que sur le choix d'écrire un read-model comme un Value Object.
