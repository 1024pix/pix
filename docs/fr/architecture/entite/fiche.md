# Entity

Une Entity est un objet du domaine défini par son identité. Ses valeurs peuvent changer : elle reste la
même Entity. Elle vit dans `domain/models/`.

Les règles détaillées et leurs exceptions sont dans [`README.md`](README.md).

## Entity, Value Object ou Aggregate Root ?

- **Deux instances aux mêmes valeurs sont-elles la même chose pour le métier ?** Si oui, c'est un
  [Value Object](../objet-valeur/fiche.md). Deux seuils de 50 % sont le même seuil. Deux organisations
  de même nom restent deux organisations : ce sont des Entities.
- **Le code y accède-t-il directement, sans passer par une autre Entity ?** Si oui, c'est une
  [Aggregate Root](../racine-agregat/README.md). Les règles ci-dessous s'appliquent, plus les siennes. Si non, c'est une Entity interne à un
  Aggregate : elle n'a pas de repository.

## Les règles

| # | Règle | En pratique |
| --- | --- | --- |
| [E1](README.md#e1-lidentité-est-explicite-et-stable) | Identité explicite et stable | un `id` porté par l'objet, qu'aucune méthode ne change |
| [E2](README.md#e2-légalité-se-fonde-sur-lidentité) | Égalité par identité | comparer les `id`, pas les champs |
| [E3](README.md#e3-les-invariants-sont-tenus-à-tout-instant) | Toujours valide | le constructeur et chaque méthode refusent un état invalide |
| [E4](README.md#e4-aucune-io-aucune-dépendance-à-linfrastructure) | Aucune I/O | aucun import d'infrastructure ; `now` ou un générateur arrive en paramètre |
| [E5](README.md#e5-aucune-méthode-au-service-de-la-persistance) | Aucune méthode pour la persistance | pas de `toDTO()` que seul le repository appelle : la traduction est son travail |
| [E6](README.md#e6-aucun-mutateur-nu) | Aucun mutateur nu | un changement d'état nomme son intention : `archive()`, pas `setStatus()` |
| [E7](README.md#e7-les-autres-aggregates-sont-référencés-par-identité) | Autres Aggregates par identité | `organizationId`, pas `organization` ; si une règle a besoin de ses données, la méthode les reçoit en paramètre ; une instance du même Aggregate est permise |
| [E8](README.md#e8-nommage-et-emplacement) | Nommage | un fichier par Entity, en PascalCase, nom du langage métier |

## Exemple complet

Version corrigée de [`Passage.js`](https://github.com/1024pix/pix/blob/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/devcomp/domain/models/Passage.js#L1-L16),
le passage d'un utilisateur dans un module.

```js
import { PassageTerminatedError } from '../errors.js';

class Passage {
  #terminatedAt; // E6 : porte une règle, donc privé

  constructor({ id, moduleId, userId, createdAt, updatedAt, terminatedAt }) {
    this.id = id; // E1
    this.moduleId = moduleId; // E7 : un identifiant, pas l'instance du module
    this.userId = userId;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.#terminatedAt = terminatedAt;
  }

  get terminatedAt() {
    return this.#terminatedAt;
  }

  // E6 : la méthode nomme l'intention ; E4 : la date arrive en paramètre
  terminate({ now }) {
    if (this.#terminatedAt) throw new PassageTerminatedError(); // E3 : refuse la transition invalide
    this.#terminatedAt = now;
  }
}

export { Passage };
```

Le constructeur ne valide rien, faute de règle métier connue sur ces champs. Avec une telle règle,
le constructeur lèverait une erreur du domaine (E3).

Le test est unitaire, sans base ni double. Il vérifie la transition et son refus :

```js
describe('Unit | Devcomp | Domain | Models | Passage', function () {
  describe('#terminate', function () {
    it('terminates the passage at the given date', function () {
      const now = new Date('2024-01-02');
      const passage = new Passage({ id: 1, moduleId: 'module-id', userId: 123 });

      passage.terminate({ now });

      expect(passage.terminatedAt).to.deep.equal(now);
    });

    it('refuses to terminate a passage already terminated', function () {
      const terminatedAt = new Date('2024-01-01');
      const passage = new Passage({ id: 1, moduleId: 'module-id', userId: 123, terminatedAt });

      expect(() => passage.terminate({ now: new Date('2024-01-02') })).to.throw(PassageTerminatedError);
      expect(passage.terminatedAt).to.deep.equal(terminatedAt);
    });
  });
});
```

Le test du refus est celui qui manque le plus souvent. C'est pourtant lui qui prouve que E3 est tenu.
