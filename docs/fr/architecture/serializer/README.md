# Sérialiseur

Un sérialiseur traduit entre les objets du domaine et un format d'échange, dans les deux sens. En
sortie, il met une organisation au format JSON:API, le format des réponses que lit Pix Admin. En entrée, il transforme le JSON
reçu en objet du domaine. Un export CSV est aussi un sérialiseur. Les sérialiseurs se rangent dans
`infrastructure/serializers/`.

## Les règles

Chaque règle est détaillée plus bas, dans la [référence des règles](#référence-des-règles).

| # | Règle | En pratique |
| --- | --- | --- |
| [M1](#m1-aucune-logique-dans-le-sens-sortant) | Aucune logique dans le sens sortant | ni condition, ni calcul, ni filtre sur l'objet reçu, exports CSV compris |
| [M2](#m2-nexpose-que-des-champs-présents-sur-lobjet-reçu) | N'expose que des champs présents sur l'objet reçu | chaque champ déclaré existe sur l'objet ; une clé pour le cache du front se compose ici |
| [M3](#m3-le-format-de-réponse-est-un-contrat-externe) | Le format de réponse est un contrat externe | on ajoute un champ sans casser l'existant ; une valeur existante ne change jamais de sens |
| [M4](#m4-un-sérialiseur-par-ressource-exposée) | Un sérialiseur par ressource exposée | un fichier par ressource, nommé d'après elle, quel que soit l'appelant |
| [M5](#m5-la-désérialisation-ne-laisse-pas-entrer-la-forme-du-transport) | La désérialisation ne laisse pas entrer la forme du transport | `deserialize()` rend un objet du domaine, et ne vérifie rien |

## Exemple complet

Le sérialiseur de l'[`Organization`](../aggregate-root/README.md), pour
`POST /api/admin/organizations`. Le [contrôleur](../controller/README.md) lui demande de désérialiser
le payload (le corps de la requête) en `Organization<null>`, une organisation pas encore enregistrée,
sans id. Puis il lui demande de sérialiser l'organisation créée.

À la création, trois couches se partagent le travail. La [route](../route/README.md) vérifie la forme du
payload : `name` et `type` sont des chaînes présentes. Le sérialiseur traduit, sans rien vérifier.
`Organization` vérifie les règles du métier : le nom n'est pas vide, le type est connu.

Exemple inventé, d'après
[`organization-serializer.js`](https://github.com/1024pix/pix/blob/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/organizational-entities/infrastructure/serializers/jsonapi/organization-serializer.js#L8-L73).

```ts
// organizational-entities/infrastructure/serializers/jsonapi/organization-serializer.ts
// M4 : le seul sérialiseur de la ressource organizations
import jsonapiSerializer from 'jsonapi-serializer';

import type { UserId } from '../../../../shared/domain/Id.js';
import { Organization, type OrganizationType } from '../../../domain/models/organization/index.js';

const { Serializer } = jsonapiSerializer;

// M5 : la forme du payload, déjà validée par la route
type OrganizationPayload = {
  data: {
    type: 'organizations';
    attributes: { name: string; type: OrganizationType };
  };
};

const serialize = (organization: Organization) =>
  new Serializer('organizations', {
    // transform prépare chaque objet avant sa mise au format ; M1 : on recopie des champs, sans condition ni calcul
    transform: (organization: Organization) => ({
      id: organization.id,
      name: organization.name,
      type: organization.type, // M3 : 'SCO', 'SUP', 'PRO', 'SCO-1D' gardent toujours leur sens
      isManagingStudents: organization.isManagingStudents,
      createdBy: organization.createdBy,
      archivedAt: organization.archivedAt, // M2 : null quand l'organisation n'est pas archivée
      features: organization.features.map((feature) => ({
        id: `${organization.id}_${feature.featureName}`, // M2 : une clé pour le cache du front, faite de champs reçus
        featureName: feature.featureName,
        params: feature.params,
      })),
    }),
    // M2 : chaque champ existe sur Organization ; M3 : ces noms forment le contrat avec Pix Admin
    attributes: ['name', 'type', 'isManagingStudents', 'createdBy', 'archivedAt', 'features'],
    features: { ref: 'id', included: true, attributes: ['featureName', 'params'] },
  }).serialize(organization);

// M5 : rend un objet du domaine ; les règles du métier restent dans Organization.create
const deserialize = (payload: OrganizationPayload, { createdBy }: { createdBy: UserId }): Organization<null> => {
  const { name, type } = payload.data.attributes;
  return Organization.create({ name, type, createdBy });
};

export const organizationSerializer = { serialize, deserialize };
```

## Comment tester

Un sérialiseur se teste avec un test unitaire, sans stub, mock ni spy. Le test couvre :

- la sortie, champ par champ. Exemple : `serializes the organization with its features` ;
- une valeur absente, pas seulement l'objet complet : le front doit recevoir `null`, pas un champ
  manquant. Exemple : `serializes an organization that is not archived` ;
- la clé construite pour le front. Exemple :
  `gives each feature a key made of the organization id and the feature name` ;
- l'objet du domaine rendu par la désérialisation. Exemple :
  `deserializes the payload into a new organization` ;
- une valeur refusée par le domaine : l'erreur vient de `Organization.create`, pas du sérialiseur.
  Exemple : `lets the domain refuse an empty name`.

Le test de l'[exemple complet](#exemple-complet) :

```ts
// tests/organizational-entities/unit/infrastructure/serializers/jsonapi/organization-serializer_test.ts
import { expect } from 'chai';

import type { OrganizationId, UserId } from '../../../../../../src/shared/domain/Id.js';
import { InvalidOrganizationError } from '../../../../../../src/organizational-entities/domain/errors.js';
import { Organization, type OrganizationProps } from '../../../../../../src/organizational-entities/domain/models/organization/index.js';
import { organizationSerializer } from '../../../../../../src/organizational-entities/infrastructure/serializers/jsonapi/organization-serializer.js';

describe('Unit | Organizational Entities | Infrastructure | Serializers | JSON:API | organization', function () {
  const archivedAt = new Date('2026-01-02');

  const buildOrganization = (props: Partial<OrganizationProps<OrganizationId>> = {}) =>
    new Organization({
      id: 1 as OrganizationId,
      name: 'Lycée Victor Hugo',
      type: 'SCO',
      createdBy: 2 as UserId,
      isManagingStudents: false,
      features: [],
      archivedAt: null,
      ...props,
    });

  const learnerImport = { featureName: 'LEARNER_IMPORT', params: null } as const;

  describe('#serialize', function () {
    it('serializes the organization with its features', function () {
      const organization = buildOrganization({ archivedAt, features: [learnerImport] });

      const json = organizationSerializer.serialize(organization);

      expect(json).to.deep.equal({
        data: {
          type: 'organizations',
          id: '1',
          attributes: {
            name: 'Lycée Victor Hugo',
            type: 'SCO',
            'is-managing-students': false,
            'created-by': 2,
            'archived-at': archivedAt,
          },
          relationships: {
            features: { data: [{ type: 'features', id: '1_LEARNER_IMPORT' }] },
          },
        },
        included: [
          {
            type: 'features',
            id: '1_LEARNER_IMPORT',
            attributes: { 'feature-name': 'LEARNER_IMPORT', params: null },
          },
        ],
      });
    });

    it('serializes an organization that is not archived', function () {
      const json = organizationSerializer.serialize(buildOrganization());

      expect(json.data.attributes['archived-at']).to.be.null;
    });

    it('gives each feature a key made of the organization id and the feature name', function () {
      const json = organizationSerializer.serialize(buildOrganization({ id: 7 as OrganizationId, features: [learnerImport] }));

      expect(json.included[0].id).to.equal('7_LEARNER_IMPORT');
    });
  });

  describe('#deserialize', function () {
    const buildPayload = (name = 'Lycée Victor Hugo') => ({
      data: { type: 'organizations' as const, attributes: { name, type: 'SCO' as const } },
    });

    it('deserializes the payload into a new organization', function () {
      const organization = organizationSerializer.deserialize(buildPayload(), { createdBy: 2 as UserId });

      expect(organization).to.be.instanceOf(Organization);
      expect(organization.id).to.be.null;
      expect(organization.name).to.equal('Lycée Victor Hugo');
      expect(organization.type).to.equal('SCO');
      expect(organization.createdBy).to.equal(2);
    });

    it('lets the domain refuse an empty name', function () {
      // ' ' passe la route, qui vérifie seulement que name est une chaîne
      expect(() => organizationSerializer.deserialize(buildPayload(' '), { createdBy: 2 as UserId })).to.throw(
        InvalidOrganizationError,
      );
    });
  });
});
```

## Checklist de revue de code

```
La sortie décide-t-elle quelque chose ?
[ ] M1  Ni if, ni ternaire, ni filtre, ni méthode métier sur l'objet sérialisé, exports CSV compris
[ ] M2  Chaque champ déclaré existe sur l'objet reçu

Le front peut-il casser ?
[ ] M3  Aucun champ retiré ni renommé sans accord avec les applications front
[ ] M3  Aucune valeur existante ne change de sens : un nouveau sens prend une nouvelle valeur

Où le trouver ?
[ ] M4  Un fichier par ressource, nommé d'après elle ; un seul sérialiseur, quel que soit l'appelant

Que rend la désérialisation ?
[ ] M5  Un objet du domaine, jamais data.attributes ni un {...payload}
[ ] M5  Aucune vérification : la route vérifie la forme, Organization vérifie les règles du métier

Le test couvre-t-il les cas utiles ?
[ ] Un test unitaire, sans stub, mock ni spy
[ ] Une valeur absente est testée, pas seulement l'objet complet
```

## Référence des règles

### M1. Aucune logique dans le sens sortant

**La règle.** En sortie, le sérialiseur met en forme ce qu'il reçoit. Il ne contient ni condition, ni
calcul, ni filtre sur l'objet reçu. Une règle du métier se calcule avant, dans le domaine ou le
[usecase](../usecase/README.md). La règle vaut aussi pour un export CSV.

**Bon exemple.**

```ts
// organizationSerializer.serialize
// transform prépare chaque objet avant sa mise au format ; M1 : on recopie des champs, sans condition ni calcul
transform: (organization: Organization) => ({
  id: organization.id,
  name: organization.name,
  type: organization.type, // M3 : 'SCO', 'SUP', 'PRO', 'SCO-1D' gardent toujours leur sens
  isManagingStudents: organization.isManagingStudents,
  …
}),
```

**Mauvais exemple.**

```ts
// organizationSerializer.serialize
transform: (organization: Organization) => ({
  …
  // une règle du métier, recalculée dans la mise en forme
  isManagingStudents:
    organization.isManagingStudents &&
    !organization.features.some((feature) => feature.featureName === 'LEARNER_IMPORT'),
}),
```

**Ce que ça apporte.** Une règle du métier se trouve dans le domaine, et nulle part ailleurs. Le
test du sérialiseur n'a besoin que d'une organisation, sans scénario métier.

**Sans cette règle.** La règle « une organisation qui importe ses élèves (`LEARNER_IMPORT`) ne gère
pas d'élèves » est déjà dans `Organization`. Le jour où elle change, on modifie `Organization`. Le
sérialiseur garde l'ancienne version, et Pix Admin affiche pour `isManagingStudents` une autre valeur
que celle enregistrée.

**À savoir.**

- Un export CSV suit la même règle. Si l'export ne doit pas contenir les organisations archivées, le
  usecase ne les renvoie pas. L'export n'écrit pas `organizations.filter((organization) =>
  !organization.isArchived)`.
- Une condition sur un paramètre de `serialize()` est la même faute. Deux formes de réponse selon un
  filtre de la requête, c'est une décision prise dans la mise en forme.

**Exceptions.** Ces formes ne décident rien, et sont permises :

- `x ?? null` et `x?.y`, pour une valeur absente ;
- aplatir une structure, renommer un champ pour le format, déclarer des relations incluses ;
- une enveloppe de pagination autour des objets sérialisés ;
- une fonction qui traduit un nom d'attribut en type JSON:API, même avec des `if` : elle porte sur
  un nom, pas sur l'objet.

### M2. N'expose que des champs présents sur l'objet reçu

**La règle.** Le sérialiseur déclare des champs, il ne les fabrique pas. Chaque champ exposé existe
sur l'objet reçu. Si un écran a besoin d'un champ que l'objet ne porte pas, c'est au usecase ou à un
[read-model](../read-model/README.md) de le fournir.

**Bon exemple.**

```ts
// organizationSerializer.serialize
// M2 : chaque champ existe sur Organization ; M3 : ces noms forment le contrat avec Pix Admin
attributes: ['name', 'type', 'isManagingStudents', 'createdBy', 'archivedAt', 'features'],
```

**Mauvais exemple.**

```ts
// Organization ne porte que createdBy : creatorFullName n'est jamais rempli
attributes: ['name', 'type', 'isManagingStudents', 'createdBy', 'creatorFullName', 'archivedAt', 'features'],
```

**Ce que ça apporte.** Ce que la réponse contient se lit sur l'objet reçu. Un champ déclaré que
l'objet ne porte pas se voit à la relecture.

**Sans cette règle.** `creatorFullName` n'est jamais rempli : la réponse ne contient pas
`creator-full-name`. Pix Admin affiche un créateur vide pour toutes les organisations, parce que
personne n'a chargé la donnée. La compilation ne le signale pas, parce que `attributes` est une
liste de chaînes, sans lien avec le type `Organization`.

**Exceptions.**

- Une clé pour le cache du front se construit dans le sérialiseur, à partir de champs reçus. JSON:API
  demande un id pour chaque ressource incluse, et le front range chaque ressource dans son cache par
  cet id. `OrganizationFeature` n'a pas d'id, donc le sérialiseur compose
  `${organization.id}_${feature.featureName}`. Le domaine ne connaît pas cette clé. Si le front renvoie la clé au serveur, elle devient un
  Value Object : voir V2 de la fiche [Value Object](../value-object/README.md).
- Composer un libellé à partir de plusieurs champs reçus est permis. Ce n'est pas un champ fabriqué.
- Recevoir un read-model plutôt qu'une [Entity](../entity/README.md) est permis. C'est même la façon
  d'exposer un champ que l'Entity ne porte pas.

### M3. Le format de réponse est un contrat externe

**La règle.** La réponse est lue par des applications front, parfois par des tiers. On peut ajouter
un champ ou une valeur. On ne retire ni ne renomme un champ sans accord avec ceux qui le lisent. Et
une valeur existante ne change jamais de sens : un nouveau sens prend une nouvelle valeur.

**Bon exemple.**

```ts
// organizationSerializer.serialize
type: organization.type, // M3 : 'SCO', 'SUP', 'PRO', 'SCO-1D' gardent toujours leur sens
```

Les écoles primaires ont leur valeur à elles, `SCO-1D`. `SCO` garde son sens, et le code du front qui
le lit reste juste.

**Mauvais exemple.**

```ts
// renommé pour suivre le code interne : Pix Admin lit toujours is-managing-students
attributes: ['name', 'type', 'managesStudents', 'createdBy', 'archivedAt', 'features'],
```

**Ce que ça apporte.** Une évolution de l'API ne casse pas les applications front des autres équipes.

**Sans cette règle.** Pix Admin lit `is-managing-students`, reçoit `undefined`, et traite chaque
organisation comme si elle ne gérait pas d'élèves. Rien ne le signale côté API : ni la compilation, ni les tests.

**À savoir.** Le changement de sens est le cas le plus difficile à repérer, parce qu'il ne laisse aucune trace
dans le code. Si `SCO` désignait demain aussi les écoles primaires, la chaîne ne changerait pas. Le
front continuerait de l'afficher, avec un sens faux.

### M4. Un sérialiseur par ressource exposée

**La règle.** Une ressource exposée a un seul sérialiseur, dans un fichier nommé d'après elle. Si deux
appelants n'ont pas droit aux mêmes champs, c'est au usecase de ne renvoyer que ce qui est autorisé.

**Bon exemple.**

```
organizational-entities/infrastructure/serializers/jsonapi/organization-serializer.ts
```

**Mauvais exemple.**

```
// trois fichiers produisent la même ressource organizations, un par appelant
organizational-entities/infrastructure/serializers/jsonapi/organization-serializer.ts
organizational-entities/infrastructure/serializers/jsonapi/organization-with-features-serializer.ts
organizational-entities/infrastructure/serializers/jsonapi/organization-for-pix-orga-serializer.ts
```

**Ce que ça apporte.** On trouve le sérialiseur d'une ressource par son nom. Un second sérialiseur
pour la même ressource se voit à la relecture.

**Sans cette règle.** On ajoute `administrationTeamName` dans un des trois fichiers. Pix Admin le
reçoit sur un écran, pas sur l'autre. Selon l'écran ouvert en dernier, le cache du front garde
l'organisation avec ou sans ce champ.

### M5. La désérialisation ne laisse pas entrer la forme du transport

**La règle.** `deserialize()` rend un objet du domaine. Elle ne rend jamais la structure du format,
comme `data.attributes`. Elle traduit : renommer un champ, convertir un type, appeler
`Organization.create`. Elle ne vérifie rien. La route vérifie la forme du payload, et `Organization`
vérifie les règles du métier.

**Bon exemple.**

```ts
// organizationSerializer.deserialize
// M5 : rend un objet du domaine ; les règles du métier restent dans Organization.create
const deserialize = (payload: OrganizationPayload, { createdBy }: { createdBy: UserId }): Organization<null> => {
  const { name, type } = payload.data.attributes;
  return Organization.create({ name, type, createdBy });
};
```

**Mauvais exemple.**

```ts
// organizationSerializer.deserialize
const deserialize = (payload: OrganizationPayload, { createdBy }: { createdBy: UserId }) => {
  if (!payload.data.attributes.name) {
    throw new BadRequestError('name is required'); // la route vérifie déjà la forme
  }
  return { ...payload.data.attributes, createdBy }; // la forme du payload continue vers le usecase
};
```

**Ce que ça apporte.** Le usecase reçoit une `Organization<null>`, déjà vérifiée par le domaine. Un
changement du format JSON:API s'arrête dans le sérialiseur.

**Sans cette règle.** Le front ajoute un attribut `logo-url` au payload. Avec `...`, il arrive dans le
usecase sous ce nom, puis dans la base, sans qu'aucun code du domaine l'ait lu. Et la présence du nom
est vérifiée à la fois par la route et par le sérialiseur. Si la route rend le nom facultatif, le
sérialiseur le refuse encore, et la documentation de la route devient fausse.

**À savoir.** Une garde sur une relation absente, comme `if (relationships?.tags)`, est une
traduction. Elle est permise ici, alors que la même forme serait une faute en sortie.
