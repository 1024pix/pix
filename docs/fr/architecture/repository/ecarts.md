# Repository — écarts

Suivi : où le code des repositories s'écarte de la théorie, et ce qui est décidé. **État au
2026-09-24.** Ce fichier décrit le code, il se périme. Les règles sont dans [`README.md`](README.md),
la théorie dans [`explication.md`](explication.md#la-théorie-des-écarts).

## Grille de verdict

- La nature d'un écart est *convention assumée*, *dérive* ou *vestige*.
- **À corriger** : un coût payé sans bénéfice. *À surveiller* : un coût et un bénéfice réels, sous
  condition. *Rien à faire* : aucun coût réel.
- Un bénéfice de performance invoqué sans mesure compte pour nul.

| Écart | Nature | Coût payé | Bénéfice obtenu | Verdict |
| --- | --- | --- | --- | --- |
| **X1** Aucun port n'est déclaré | dérive | l'injection et le code de câblage | **nul** : aucun contrat vérifiable | **À corriger** |
| **X2** Méthode de persistance sur le modèle | dérive | différé, à la prochaine migration de schéma | **nul** | **À corriger** |
| **X4** Plusieurs repositories pour un même Aggregate | dérive | quelques fichiers de plus, et A3 de `../racine-agregat/README.md` tombe : compter les repositories ne dit plus rien de la conception | **nul** : le gain de performance est supposé, jamais mesuré | **À corriger** |
| **X7** Des repositories sont câblés hors de l'index | dérive | deux régimes de câblage ; l'index ne liste plus les ports du contexte | quelques lignes d'index en moins | **À corriger** |
| **X3** La connexion à la base ne passe pas par la signature | convention assumée | un usecase ne dit pas, à la lecture, s'il est transactionnel | réel : signatures propres | À surveiller |
| **X6** Le repository couvre aussi l'accès aux contextes voisins | convention assumée | nul | réel : un seul concept, le domaine ignore la source | Rien à faire |

---

### X1. Aucun port n'est déclaré

**Exemple concret.** Le contrat d'un repository est le nom du paramètre que le usecase reçoit.

```js
// le usecase
const getCombinedCourseById = async ({ combinedCourseId, combinedCourseRepository, questRepository }) => {
  const combinedCourse = await combinedCourseRepository.getById({ id: combinedCourseId });
  …
};
```

**Code.** [`get-combined-course-by-id.js`](https://github.com/1024pix/pix/blob/0f2dfa128fb9faed26300f72d808a812c4952158/api/src/quest/domain/usecases/get-combined-course-by-id.js#L3-L5).

Rien ne déclare que `combinedCourseRepository` sait faire `getById`, ni ce que cette fonction rend.
Une faute de frappe dans le nom de la méthode échoue à l'exécution. Un repository qui perd une
fonction ne casse aucune compilation.

**Correction.** Déclarer le port dans `domain/ports/` et annoter le repository contre lui : voir
[`outillage.md`](outillage.md#vérifier-par-le-typage). Uniquement après la migration des modèles en
`.ts`, parce qu'avant, le port ne vérifie rien.

### X2. Méthode de persistance sur le modèle

**Exemple concret.** `Chat` porte `toDTO()` et `fromDTO()`, et le repository est le seul appelant.

```js
// dans domain/models/ — le modèle sait se persister, dans les deux sens
class Chat {
  toDTO() {
    return {
      id: this.id,
      userId: this.userId,
      configuration: this.configuration.toDTO(),        // et toute la frontière suit
      messages: this.messages.map((message) => message.toDTO()),
    };
  }

  static fromDTO(chatDTO) { … }
}

// et dans le repository, qui est le seul appelant
const chatDTO = chat.toDTO();
```

**Code.** [`Chat.js`](https://github.com/1024pix/pix/blob/0f2dfa128fb9faed26300f72d808a812c4952158/api/src/llm/domain/models/Chat.js#L270-L285), simplifié, et `fromDTO` ligne 287. L'appel : [`chat-repository.js`](https://github.com/1024pix/pix/blob/0f2dfa128fb9faed26300f72d808a812c4952158/api/src/llm/infrastructure/repositories/chat-repository.js#L47).

La racine délègue à ses objets internes, qui portent chacun leur `toDTO()`. Déplacer le mapping
suppose donc de déplacer toute la chaîne, pas une seule méthode.

**Correction.** Déplacer la fonction de mapping dans le repository, sous forme de fonction locale. Le
déplacement est mécanique. À vérifier avant : si la forme sérialisée est un format publié, la méthode
reste sur le modèle. Voir `E5` de `../entite/README.md`.

### X3. La connexion à la base ne passe pas par la signature

**Exemple concret.** Le repository récupère sa connexion depuis un contexte implicite.

```js
// forme en vigueur — la connexion n'apparaît pas dans la signature
const getByCode = async ({ code }) => {
  const knexConn = DomainTransaction.getConnection();
  …
};

// forme explicite, prescrite par l'ADR 9 et non retenue
const getByCode = async ({ code, knexConn }) => { … };
```

**Code.** Forme en vigueur : [`combined-course-repository.js`](https://github.com/1024pix/pix/blob/0f2dfa128fb9faed26300f72d808a812c4952158/api/src/quest/infrastructure/repositories/combined-courses/combined-course-repository.js#L7-L8). La forme explicite est hypothétique.

**Verdict.** La forme en vigueur est décidée par l'équipe : c'est I12 de [`README.md`](README.md). Le
coût reste réel, parce qu'un usecase ne dit pas s'il s'exécute dans une transaction. L'écart est donc
à surveiller. L'histoire de la décision est dans
[`explication.md`](explication.md#la-connexion-par-domaintransaction).

**Correction.** Aucune sur la forme. Écrire l'ADR qui acte l'abandon de la forme explicite et son
motif, des signatures propres. Cet ADR reprend la contrepartie : documenter le périmètre
transactionnel quand il n'est pas évident, ce qu'exige `U7` de `../usecase/README.md`.

### X4. Plusieurs repositories pour un même Aggregate

**Exemple concret.** Un repository est créé par besoin de requête, pas par Aggregate.

```
infrastructure/repositories/
  combined-courses/
    combined-course-repository.js                     getById, save
  combined-course-details-repository.js               findByOrganizationId, avec tout ce qu'un écran affiche
  combined-course-participations/
    combined-course-participation-repository.js       une Entity interne à la frontière
    organization-learner-participation-repository.js
  prescription/
    combined-course-participant-repository.js         la même frontière, vue d'un autre besoin
```

**Code.** [Le dossier](https://github.com/1024pix/pix/tree/0f2dfa128fb9faed26300f72d808a812c4952158/api/src/quest/infrastructure/repositories).

Cinq repositories pour un seul Aggregate. `combined-course-details-repository.js` est à la racine du
dossier, les autres dans des sous-dossiers nommés d'après le besoin appelant.

**Verdict.** Le bénéfice invoqué est la performance : chaque requête ne charge que ce dont elle a
besoin. Aucune mesure ne l'établit, donc il compte pour nul. Il peut même être nul en fait : une
Entity chargée plus tôt dans la même requête HTTP est souvent déjà dans le cache de la base.

**Correction.** Un repository par Aggregate. Pour chaque repository supplémentaire :

1. S'il sert une écriture, ou une lecture qui a besoin des invariants, le fusionner dans le
   repository de l'Aggregate.
2. S'il sert une lecture sans invariant, il ne reste séparé que si une mesure montre que charger
   l'Aggregate entier est trop cher. Il renvoie alors un read-model : voir `../read-model/README.md`.

Le mot « Aggregate » ne se pose sur un dossier que si ses repositories suivent ce grain : voir A3 de
`../racine-agregat/README.md`. La théorie est dans
[`explication.md`](explication.md#x4-le-grain-de-chargement).

### X6. Le repository couvre aussi l'accès aux contextes voisins

**Exemple concret.** Deux fichiers du même dossier, deux sources différentes, un seul concept.

```
infrastructure/repositories/
  prescriber-repository.js            → des tables de la base
  privacy-users-api.repository.js     → l'API interne d'un autre Bounded Context
```

**Code.** [Le dossier](https://github.com/1024pix/pix/tree/0f2dfa128fb9faed26300f72d808a812c4952158/api/src/deprecated/infrastructure/repositories).

**Verdict.** La couche ne distingue pas la source, ce qui est la lecture port / adaptateur : voir
[`explication.md`](explication.md#x6-lanticorruption-layer). Aucun coût réel.

**Correction.** Aucune. Ce repository est le seul point d'entrée vers le voisin : le usecase le
reçoit, jamais l'API interne elle-même. Voir `X6` de `../usecase/ecarts.md`.

### X7. Des repositories sont câblés hors de l'index

**Exemple concret.** Deux formes coexistent à côté de l'index des repositories.

- Un contexte n'a pas d'index de repositories : ses usecases importent les repositories directement
  dans leur fichier de câblage.
- Un contexte a un index, mais n'y déclare que les repositories qui reçoivent une dépendance. Les
  autres sont importés ailleurs.

**Code.** Sans index : [`legal-documents/domain/usecases/index.js`](https://github.com/1024pix/pix/blob/0f2dfa128fb9faed26300f72d808a812c4952158/api/src/legal-documents/domain/usecases/index.js#L4-L7). Index partiel : [`school/infrastructure/repositories/index.js`](https://github.com/1024pix/pix/blob/0f2dfa128fb9faed26300f72d808a812c4952158/api/src/school/infrastructure/repositories/index.js#L8-L12), pour huit fichiers dans [le dossier](https://github.com/1024pix/pix/tree/0f2dfa128fb9faed26300f72d808a812c4952158/api/src/school/infrastructure/repositories).

**Verdict.** Le seul bénéfice est quelques lignes d'index en moins. Le coût est un second régime de
câblage, que le lecteur doit reconnaître, et un index qui ne dit plus quels ports le contexte
utilise. L'équipe a décidé d'un seul régime : c'est I6 de [`README.md`](README.md).

**Correction.** Pour chaque contexte, créer l'index s'il manque, y déclarer tous les repositories, et
faire importer l'index par le câblage des usecases. Le changement est mécanique, et le script de I6
dans [`outillage.md`](outillage.md#i6-et-i9--un-script-de-complétude) donne la liste.

