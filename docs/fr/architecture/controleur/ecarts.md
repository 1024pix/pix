# Contrôleur — écarts

Suivi : où le code des contrôleurs s'écarte de la théorie, et ce qui est décidé. **État au
2026-09-24.** Ce fichier décrit le code, il se périme. Les règles sont dans [`README.md`](README.md),
la théorie dans [`explication.md`](explication.md#la-théorie-des-écarts).

## Grille de verdict

- La nature d'un écart est *convention assumée*, *dérive* ou *vestige*.
- **À corriger** : le coût dépasse le bénéfice, ou le bénéfice s'obtient autrement. *À surveiller* : un coût et un bénéfice réels, sous
  condition. *Rien à faire* : aucun coût réel.
- Un bénéfice de performance invoqué sans mesure compte pour nul.

| Écart | Nature | Coût payé | Bénéfice obtenu | Verdict |
| --- | --- | --- | --- | --- |
| **X1** Deux usecases sont appelés à la suite | dérive | Une intention composée existe sans nom, donc introuvable, et vérifiée seulement en acceptance | Pas de fichier de plus à écrire, et la séquence se lit d'une traite | **À corriger** |
| **X2** Un code d'erreur est choisi dans le contrôleur | dérive | Le même cas produit deux réponses selon le point d'entrée, et le front perd le code d'erreur exploitable | Le statut est décidé au plus près de la réponse, sans passer par le domaine | **À corriger** |
| **X3** Un accès direct au repository, ou au domaine d'un voisin | dérive | Les règles du domaine sont contournées, et une frontière de contexte est franchie hors contrat | La lecture est immédiate, sans usecase ni API interne à écrire | **À corriger** |
| **X4** Les usecases sont importés sans injection | vestige | Les usecases n'apparaissent pas dans la signature : le test remplace les méthodes de l'objet `usecases` importé | Faible : aucune enveloppe à poser sur la route | **À corriger** |

L'écart « le contrôle des droits est écrit dans le contrôleur » n'est pas dans ce fichier : il est
sous `X1` de `../route/ecarts.md`, avec sa correction et sa vérification.

---

### X1. Deux usecases sont appelés à la suite

**Exemple concret.**

```js
const create = async function (request, h, { usecases, passageSerializer }) {
  const {
    'module-id': moduleId,
    'module-version': moduleVersion,
    'occurred-at': occurredAt,
    'sequence-number': sequenceNumber,
  } = request.payload.data.attributes;
  const userId = extractUserIdFromRequest(request);
  const passage = await usecases.createPassage({ moduleId, userId });

  const passageStartedData = {
    contentHash: moduleVersion,
    occurredAt: new Date(occurredAt),
    passageId: passage.id,
    sequenceNumber,
    type: 'PASSAGE_STARTED',
  };

  await usecases.recordPassageEvents({ events: [passageStartedData] });

  const serializedPassage = passageSerializer.serialize(passage);
  return h.response(serializedPassage).created();
};
```

**Code.** [`passage-controller.js`](https://github.com/1024pix/pix/blob/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/devcomp/application/passages/passage-controller.js#L4-L29), simplifié.

Le signal : deux `await usecases.` dans la même fonction.

**Verdict.** À corriger. Le seul bénéfice est un fichier de moins à écrire. Le coût est une
intention sans nom, vérifiée seulement en acceptance. C'est une violation de `C1` de
[`README.md`](README.md#c1-un-seul-usecase-par-point-dentrée).

**Correction.** Nommer l'intention composée et la déplacer dans `domain/usecases/`. Le contrôleur
retrouve un seul appel.

Ce qui rend la correction non mécanique : il faut trouver le nom, et décider si la séquence est bien
une intention unique du point de vue métier. Si elle ne l'est pas, c'est le découpage de l'API qu'il
faut revoir, pas le contrôleur.

Le cas « écriture puis lecture » est à traiter à part : voir le faux ami de `C1`.

### X2. Un code d'erreur est choisi dans le contrôleur

**Exemple concret.**

```js
const replication = replicationRepository.getByName(replicationName);

if (!replication) {
  return h.response().code(404);
}
```

**Code.** [`replications-controller.js`](https://github.com/1024pix/pix/blob/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/maddo/application/replications-controller.js#L16-L20). Le `getByName` qui renvoie `undefined` : [`replication-repository.js`](https://github.com/1024pix/pix/blob/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/maddo/infrastructure/repositories/replication-repository.js#L248-L250).

L'extrait a trois défauts :

- la décision de statut est prise ici ;
- le contrôleur lit un repository, ce que `C4` exclut ;
- `replicationRepository.getByName` renvoie `undefined`, alors que selon `I3` de
  `../repository/README.md` un `get*` lève.

**Verdict.** À corriger. Le seul bénéfice est un statut décidé au plus près de la réponse. Le coût
est une réponse sans code d'erreur exploitable par le front, qui diffère selon le point d'entrée.
C'est une violation de `C2` de [`README.md`](README.md#c2-aucune-décision).

**Correction.** Faire lever le domaine, et laisser le mappeur d'erreurs traduire. Le contrôleur perd
sa condition.

Ce qui rend la correction non mécanique : il faut choisir l'erreur de domaine à lever. Ce choix
détermine le code HTTP **et** le code d'erreur exploitable par le front. C'est la même décision que
celle de `I4` de `../repository/README.md`.

### X3. Un accès direct au repository, ou au domaine d'un voisin

**Exemple concret.**

```js
// un repository lu directement
import { chatRepository } from '../infrastructure/repositories/index.js';

// le domaine d'un voisin importé
import { usecases as questUsecases } from '../../../quest/domain/usecases/index.js';
```

**Code.** Le repository : [`llm-preview-controller.js`](https://github.com/1024pix/pix/blob/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/llm/application/llm-preview-controller.js#L7). Le domaine voisin : [`assessment-controller.js`](https://github.com/1024pix/pix/blob/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/evaluation/application/assessments/assessment-controller.js#L6).

**Verdict.** À corriger. Le seul bénéfice est une lecture immédiate, sans usecase ni API interne à
écrire. Le coût est un contournement des règles du domaine, et une frontière de contexte franchie
hors contrat. C'est une violation de `C4` de [`README.md`](README.md#c4-aucun-accès-direct-aux-données).

**Correction.** Le premier cas est mécanique : écrire le usecase qui manque. C'est souvent une
délégation d'une ligne, ce que l'ADR 20 admet (voir `X5` de `../usecase/ecarts.md`).

Le second cas est moins mécanique. Il faut vérifier que le contexte voisin expose la capacité par son
API interne, et l'y ajouter sinon. Voir `../api-interne/README.md`.

Les deux cas se vérifient par configuration seule. Ils sont donc faciles à empêcher pour l'avenir,
même si le rattrapage prend du temps : voir [`outillage.md`](outillage.md#c4--règles-de-chemin).

### X4. Les usecases sont importés sans injection

**Exemple concret.**

```js
// fautif — les usecases sont importés : le test doit remplacer les méthodes de l'objet importé
import { usecases } from '../../domain/usecases/index.js';

// conforme — les usecases arrivent en paramètre, par une enveloppe posée sur la route
handler: handlerWithDependencies(passageController.create),
```

**Code.** Fautif : [`module-controller.js`](https://github.com/1024pix/pix/blob/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/devcomp/application/modules/module-controller.js#L2). Conforme : [`passage-route.js`](https://github.com/1024pix/pix/blob/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/devcomp/application/passages/passage-route.js#L17), et l'enveloppe [`handlerWithDependencies.js`](https://github.com/1024pix/pix/blob/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/devcomp/infrastructure/utils/handlerWithDependencies.js#L7-L19).

La forme conforme existe déjà : un contexte l'emploie, avec une enveloppe qui passe au contrôleur un
objet `dependencies` contenant les usecases et les sérialiseurs.

**Verdict.** À corriger. L'équipe a décidé que l'exception de l'ADR 46 est un vestige : la cible est
l'injection des usecases dans le contrôleur. Le bénéfice de la forme actuelle est faible, et le coût
est un contrôleur dont la signature ne dit pas ce qu'il appelle. L'histoire de la décision est dans
[`explication.md`](explication.md#linjection-des-usecases).

Le coût de la forme actuelle est limité : les tests unitaires de contrôleur remplacent les méthodes
de l'objet `usecases` importé, et la logique est ailleurs. C'est ce qui rend la correction
progressive plutôt qu'urgente.

**Correction.** Faire recevoir au contrôleur ses usecases en paramètre, par la même enveloppe que le
contexte qui le fait déjà. Une démarche d'injection transverse est en cours dans l'équipe staff : elle
fixe la forme définitive. Un contrôleur neuf suit la forme déjà en place.
