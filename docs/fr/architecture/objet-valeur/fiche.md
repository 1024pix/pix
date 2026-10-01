# Value Object

Un Value Object est un objet du domaine défini par ses valeurs, sans identité. Deux instances aux mêmes
valeurs sont interchangeables. Il vit dans `domain/models/`.

Les règles détaillées et leurs exceptions sont dans [`README.md`](README.md).

## Value Object ou read-model ?

Une question tranche : **une règle du domaine lit-elle cet objet pour décider ?**

- Oui : c'est un Value Object, et toutes les règles ci-dessous s'appliquent. Une seule règle qui le
  lit suffit, même s'il est aussi sérialisé.
- Non, il sert seulement à afficher ou à sérialiser : c'est un [read-model](../read-model/README.md).
  V1, V2, V4, V6 et V7 s'appliquent aussi à lui. Un nom en `…ForAdmin`, `…Details` ou `…ListItem` en
  est presque toujours un.

## Les règles

| # | Règle | En pratique |
| --- | --- | --- |
| [V1](README.md#v1-immuable-après-construction) | Immuable | champs privés `#`, aucun mutateur |
| [V2](README.md#v2-aucune-identité-égalité-par-valeur) | Aucune identité | pas d'`id` propre ; porter l'`id` d'autre chose, comme un `userId`, est permis ; une clé pour le front se compose dans le sérialiseur |
| [V3](README.md#v3-validation-à-la-construction) | Valide dès la construction | le constructeur lève une `DomainError` sur une valeur invalide |
| [V4](README.md#v4-aucune-io-aucune-dépendance-à-linfrastructure) | Aucune I/O | aucun import d'infrastructure, ni horloge, ni aléatoire, ni configuration |
| [V5](README.md#v5-porte-le-comportement-lié-à-ses-données) | Porte ses règles | la logique sur ses données est une méthode de l'objet |
| [V6](README.md#v6-aucun-cycle-de-vie-propre) | Aucune persistance propre | ni repository ni table : il se persiste avec ce qui le contient |
| [V7](README.md#v7-exposition-en-lecture-seule-collections-comprises) | Lecture seule, collections comprises | un accesseur rend une copie : `[...this.#items]`, jamais `this.#items` |
| [V8](README.md#v8-un-type-par-intention) | Un type par intention | un concept reçu sous deux formes a deux types : `…ForCreation` pour la forme d'avant insertion |

## Exemple complet

Version corrigée de [`AnswerStatus.js`](https://github.com/1024pix/pix/blob/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/shared/domain/models/AnswerStatus.js#L10-L85).

```js
import { DomainError } from '../errors.js';

const statuses = {
  OK: 'ok',
  KO: 'ko',
  SKIPPED: 'aband',
  TIMEDOUT: 'timedout',
  FOCUSEDOUT: 'focusedOut',
  UNIMPLEMENTED: 'unimplemented',
};

class AnswerStatus {
  #status; // V1 : privé

  constructor({ status } = {}) {
    // V3 : une valeur invalide ne s'instancie pas
    if (!Object.values(statuses).includes(status)) {
      throw new DomainError(`Invalid answer status: ${status}`);
    }
    this.#status = status;
  }

  get status() {
    return this.#status;
  }

  // V5 : les règles sur la donnée sont des méthodes de l'objet
  isFailed() {
    return this.#status !== statuses.OK;
  }

  isOK() {
    return this.#status === statuses.OK;
  }

  // isKO, isSKIPPED, isTIMEDOUT, isFOCUSEDOUT, isUNIMPLEMENTED : même forme

  // constructeurs nommés
  static get OK() {
    return new AnswerStatus({ status: statuses.OK });
  }

  static get KO() {
    return new AnswerStatus({ status: statuses.KO });
  }

  // SKIPPED, TIMEDOUT, FOCUSEDOUT, UNIMPLEMENTED : même forme

  static from(other) {
    if (other instanceof AnswerStatus) {
      return other;
    }
    return new AnswerStatus({ status: other }); // validé par le constructeur
  }
}

AnswerStatus.statuses = statuses;

export { AnswerStatus };
```

Le test est unitaire, sans double. Il couvre le comportement, la validation et l'immuabilité :

```js
describe('Unit | Domain | Models | AnswerStatus', function () {
  it('is OK for AnswerStatus.OK only', function () {
    expect(AnswerStatus.OK.isOK()).to.be.true;
    expect(AnswerStatus.KO.isOK()).to.be.false;
  });

  it('throws a DomainError when the status is unknown', function () {
    expect(() => new AnswerStatus({ status: 'unknown' })).to.throw(DomainError);
  });

  it('cannot be reassigned', function () {
    const answerStatus = AnswerStatus.OK;

    // un accesseur sans mutateur lève une TypeError en mode strict, celui des modules ES
    expect(() => {
      answerStatus.status = AnswerStatus.statuses.KO;
    }).to.throw(TypeError);
  });
});
```
