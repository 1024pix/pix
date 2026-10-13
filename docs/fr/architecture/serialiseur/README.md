# Sérialiseur

Un sérialiseur traduit entre les objets du domaine et un format d'échange, dans les deux sens. En
sortie, il met une organisation au format JSON:API pour Pix Admin. En entrée, il transforme le JSON
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
| [M5](#m5-la-désérialisation-ne-laisse-pas-entrer-la-forme-du-transport) | La désérialisation ne laisse pas entrer la forme du transport | `deserialize()` rend un objet du domaine, sans vérifier la forme du payload |

## Exemple complet

Le sérialiseur de l'organisation, pour `POST /api/admin/organizations`. Le contrôleur lui demande de
désérialiser le payload en `Organization<null>`, puis de sérialiser l'organisation créée. Exemple
inventé, d'après
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
    // M1 : on recopie des champs, sans condition ni calcul
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
        enabledAt: feature.enabledAt,
      })),
    }),
    // M2 : chaque champ existe sur Organization ; M3 : ces noms forment le contrat avec Pix Admin
    attributes: ['name', 'type', 'isManagingStudents', 'createdBy', 'archivedAt', 'features'],
    features: { ref: 'id', included: true, attributes: ['featureName', 'enabledAt'] },
  }).serialize(organization);

// M5 : rend un objet du domaine ; les règles du métier restent dans Organization.create
const deserialize = (
  payload: OrganizationPayload,
  { createdBy, now }: { createdBy: UserId; now: Date },
): Organization<null> => {
  const { name, type } = payload.data.attributes;
  return Organization.create({ name, type, createdBy, now });
};

export const organizationSerializer = { serialize, deserialize };
```

## Comment tester

Un sérialiseur se teste avec un test unitaire, sans stub, mock ni spy. Le test couvre :

- la sortie, champ par champ. Exemple : `serializes the organization with its features` ;
- une valeur absente, pas seulement l'objet complet. C'est là qu'on voit un champ que l'objet ne porte
  pas. Exemple : `serializes an organization that is not archived` ;
- la clé construite pour le front. Exemple :
  `gives each feature a key made of the organization id and the feature name` ;
- l'objet du domaine rendu par la désérialisation. Exemple :
  `deserializes the payload into a new organization` ;
- une valeur refusée par le domaine : l'erreur vient de `Organization.create`, pas du sérialiseur.
  Exemple : `lets the domain refuse an empty name`.

Le test de l'[exemple complet](#exemple-complet) :

```ts
// tests/organizational-entities/unit/infrastructure/serializers/jsonapi/organization-serializer_test.ts
describe('Unit | Organizational Entities | Infrastructure | Serializers | JSON:API | organization', function () {
  const now = new Date('2026-01-02');

  const buildOrganization = (props: Partial<OrganizationProps<OrganizationId>> = {}) =>
    new Organization({
      id: 1 as OrganizationId,
      name: 'Lycée Victor Hugo',
      type: 'SCO',
      createdBy: 2 as UserId,
      isManagingStudents: false,
      createdAt: new Date('2026-01-01'),
      updatedAt: new Date('2026-01-01'),
      archivedAt: null,
      features: [],
      ...props,
    });

  const learnerImport = new OrganizationFeature({ featureName: 'LEARNER_IMPORT', params: null, enabledAt: now });

  describe('#serialize', function () {
    it('serializes the organization with its features', function () {
      const organization = buildOrganization({ archivedAt: now, features: [learnerImport] });

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
            'archived-at': now,
          },
          relationships: {
            features: { data: [{ type: 'features', id: '1_LEARNER_IMPORT' }] },
          },
        },
        included: [
          {
            type: 'features',
            id: '1_LEARNER_IMPORT',
            attributes: { 'feature-name': 'LEARNER_IMPORT', 'enabled-at': now },
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
    const buildPayload = (attributes: Partial<OrganizationPayload['data']['attributes']> = {}) => ({
      data: { type: 'organizations' as const, attributes: { name: 'Lycée Victor Hugo', type: 'SCO' as const, ...attributes } },
    });

    it('deserializes the payload into a new organization', function () {
      const organization = organizationSerializer.deserialize(buildPayload(), { createdBy: 2 as UserId, now });

      expect(organization).to.be.instanceOf(Organization);
      expect(organization.id).to.be.null;
      expect(organization.name).to.equal('Lycée Victor Hugo');
      expect(organization.createdBy).to.equal(2);
      expect(organization.createdAt).to.deep.equal(now);
    });

    it('lets the domain refuse an empty name', function () {
      expect(() => organizationSerializer.deserialize(buildPayload({ name: ' ' }), { createdBy: 2 as UserId, now })).to.throw(
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
[ ] M5  Aucune vérification de forme ni règle métier : la forme est validée par la route, les règles par le domaine

Tests
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
transform: (organization: Organization) => ({
  id: organization.id,
  name: organization.name,
  type: organization.type,
  isManagingStudents: organization.isManagingStudents,
  …
}),
```

**Mauvais exemple.**

```ts
transform: (organization: Organization) => ({
  …
  // une règle du métier, recalculée dans la mise en forme
  isRestricted:
    organization.isManagingStudents ||
    organization.features.some((feature) => feature.featureName === 'LEARNER_IMPORT'),
}),
```

**Ce que ça apporte.** Une règle du métier se trouve dans le domaine, et nulle part ailleurs. Le
test du sérialiseur n'a besoin que d'une organisation, sans scénario métier.

**Sans cette règle.** `isRestricted` est aussi calculé par organizational-entities pour l'[API
interne](../api-interne/README.md). Le jour où la règle change, on modifie le domaine. Le sérialiseur
garde l'ancienne version, et Pix Admin affiche une organisation « restreinte » que les autres
contextes ne voient pas comme telle.

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
attributes: ['name', 'type', 'isManagingStudents', 'createdBy', 'archivedAt', 'features'],
```

**Mauvais exemple.**

```ts
// Organization ne porte que createdBy : creatorFullName sort toujours à null
attributes: ['name', 'type', 'isManagingStudents', 'createdBy', 'creatorFullName', 'archivedAt', 'features'],
```

**Ce que ça apporte.** Ce que la réponse contient se lit sur l'objet reçu. Un champ manquant se voit
à la relecture, et à la compilation quand la liste est typée contre l'objet.

**Sans cette règle.** `creatorFullName` sort à `null` pour toutes les organisations. Pix Admin
affiche un créateur vide, alors que la donnée n'a jamais été chargée. Le test du sérialiseur
passe, parce qu'il construit un objet de test qui porte le champ.

**À savoir.** Une valeur absente se teste à part. Un test écrit seulement avec un objet complet ne
voit pas un champ que l'objet réel ne porte pas.

**Exceptions.**

- Une clé pour le cache du front se construit dans le sérialiseur, à partir de champs reçus.
  `OrganizationFeature` n'a pas d'id, et le front en demande un pour chaque ressource incluse :
  `${organization.id}_${feature.featureName}`. Le domaine ne connaît pas cette clé, et la réponse de
  l'API garde les mêmes champs. Si le front renvoie la clé au serveur, elle devient un Value Object :
  voir V2 de la fiche [Value Object](../objet-valeur/README.md).
- Composer un libellé à partir de plusieurs champs reçus est permis. Ce n'est pas un champ fabriqué.
- Recevoir un read-model plutôt qu'une [Entity](../entite/README.md) est permis. C'est même la façon
  d'exposer un champ que l'Entity ne porte pas.

### M3. Le format de réponse est un contrat externe

**La règle.** La réponse est lue par des applications front, parfois par des tiers. On peut ajouter
un champ ou une valeur. On ne retire ni ne renomme un champ sans accord avec ceux qui le lisent. Et
une valeur existante ne change jamais de sens : un nouveau sens prend une nouvelle valeur.

**Bon exemple.**

```ts
type: organization.type, // 'SCO', 'SUP', 'PRO', 'SCO-1D' gardent toujours leur sens
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

**À savoir.** Le changement de sens est le cas le plus dangereux, parce qu'il ne laisse aucune trace
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
`Organization.create`. Elle ne décide rien et ne valide pas la forme du payload : la forme est validée
par la [route](../route/README.md), et les règles du métier par le domaine.

**Bon exemple.**

```ts
const deserialize = (
  payload: OrganizationPayload,
  { createdBy, now }: { createdBy: UserId; now: Date },
): Organization<null> => {
  const { name, type } = payload.data.attributes;
  return Organization.create({ name, type, createdBy, now });
};
```

**Mauvais exemple.**

```ts
const deserialize = (payload, { createdBy }) => {
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
