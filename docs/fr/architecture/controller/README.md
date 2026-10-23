# Contrôleur

Un contrôleur reçoit une requête HTTP, appelle un [usecase](../usecase/README.md), et renvoie le
résultat en réponse. Il fait trois choses, dans cet ordre : extraire les données de la requête,
appeler le usecase, rendre la réponse. Par exemple, le contrôleur de `POST /api/admin/organizations`
lit le formulaire de création d'une organisation et appelle le usecase `createOrganization`. Les
contrôleurs se rangent dans `application/`, à côté de leur [route](../route/README.md). Le contrôleur
est l'[adapter](../adapter/README.md) HTTP, en entrée.

## Les règles

Chaque règle est détaillée plus bas, dans la [référence des règles](#référence-des-règles).

| # | Règle | En pratique |
| --- | --- | --- |
| [C1](#c1-un-seul-usecase-par-point-dentrée) | Un seul usecase par point d'entrée | un seul `await usecases.…` par fonction |
| [C2](#c2-aucune-décision) | Aucune décision | pas de règle métier, pas de `.code(4xx)`, pas de transaction ; une erreur du domaine remonte au mappeur d'erreurs |
| [C3](#c3-les-dépendances-arrivent-en-paramètre) | Les dépendances arrivent en paramètre | usecases et sérialiseurs arrivent en troisième paramètre, passés par `handlerWithDependencies` sur la route |
| [C4](#c4-aucun-accès-direct-aux-données) | Aucun accès direct aux données | ni repository, ni API interne, ni usecase d'un autre contexte |
| [C5](#c5-un-contrôleur-par-ressource-une-fonction-par-action) | Un contrôleur par ressource, une fonction par action | `organization.admin.controller.ts` exporte `organizationAdminController = { create, archive }` |

## Exemple complet

Le contrôleur des organisations dans Pix Admin. Chaque fonction reçoit la requête et `h`, la boîte à
outils de hapi (le framework HTTP de l'API) qui construit la réponse. `create` lit l'utilisateur
connecté : il devient le `createdBy` de l'organisation, car Pix garde qui a créé chaque organisation
([`OrganizationForAdmin.js`](https://github.com/1024pix/pix/blob/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/organizational-entities/domain/models/OrganizationForAdmin.js#L76)).
Exemple inventé, d'après
[`organization.admin.controller.js`](https://github.com/1024pix/pix/blob/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/organizational-entities/application/organization/organization.admin.controller.js#L83-L91)
(`create`, et `archiveOrganization` [plus haut](https://github.com/1024pix/pix/blob/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/organizational-entities/application/organization/organization.admin.controller.js#L40-L45))
et
[`handlerWithDependencies.js`](https://github.com/1024pix/pix/blob/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/devcomp/infrastructure/utils/handlerWithDependencies.js#L7-L19).

```ts
// organizational-entities/application/organization/organization.admin.controller.ts
// C5 : un fichier pour la ressource organization
import type { Request, ResponseToolkit } from '@hapi/hapi';
import type { OrganizationId, UserId } from '../../../shared/domain/Id.js';
import type { ControllerDependencies } from '../../infrastructure/utils/handlerWithDependencies.js';

// C3 : usecases et sérialiseur arrivent en troisième paramètre
const create = async function (
  request: Request,
  h: ResponseToolkit,
  { usecases, organizationSerializer }: ControllerDependencies,
) {
  // extraire : la forme du payload est déjà validée par la route
  const createdBy = request.auth.credentials.userId as UserId;
  const organization = organizationSerializer.deserialize(request.payload, { createdBy });

  // C1 : un seul usecase ; C4 : un usecase du contexte, pas un repository
  const createdOrganization = await usecases.createOrganization({ organization });

  // C2 : 201, toujours le même code pour une création ; une erreur du domaine remonte au mappeur
  return h.response(organizationSerializer.serialize(createdOrganization)).created();
};

const archive = async function (
  request: Request,
  h: ResponseToolkit,
  { usecases, organizationSerializer }: ControllerDependencies,
) {
  const organizationId = request.params.organizationId as OrganizationId;
  const userId = request.auth.credentials.userId as UserId;

  const archivedOrganization = await usecases.archiveOrganization({ organizationId, userId });

  return h.response(organizationSerializer.serialize(archivedOrganization));
};

// C5 : une fonction par action, regroupées dans un objet exporté
export const organizationAdminController = { create, archive };
```

L'enveloppe passe les dépendances au contrôleur. Elle vit dans le contexte, et chaque route du
contexte s'en sert :

```ts
// organizational-entities/infrastructure/utils/handlerWithDependencies.ts — C3
import type { Request, ResponseObject, ResponseToolkit } from '@hapi/hapi';
import { usecases } from '../../domain/usecases/index.js';
import { organizationSerializer } from '../serializers/jsonapi/organization-serializer.js';

const dependencies = {
  usecases, // C4 : les usecases de ce contexte, et eux seuls
  organizationSerializer,
};

export type ControllerDependencies = typeof dependencies;

type Handler = (request: Request, h: ResponseToolkit, dependencies: ControllerDependencies) => Promise<ResponseObject>;

export const handlerWithDependencies = (handler: Handler) => (request: Request, h: ResponseToolkit) =>
  handler(request, h, dependencies);
```

```ts
// organizational-entities/application/organization/organization.admin.route.ts
{
  method: 'POST',
  path: '/api/admin/organizations',
  config: {
    pre: [{ method: securityPreHandlers.checkAdminMemberHasRoleSuperAdmin, assign: 'hasAuthorizationToAccessAdminScope' }],
    validate: { payload: … }, // la forme du payload, validée par Joi
    handler: handlerWithDependencies(organizationAdminController.create), // C3 : la route pose l'enveloppe
    tags: ['api', 'admin', 'organizations'],
  },
},
```

## Comment tester

On teste un contrôleur avec un test unitaire. Le usecase et le sérialiseur sont des stubs, passés en
troisième argument. Le test couvre :

- le bon usecase, appelé avec les bons paramètres. Exemple :
  `creates the organization with the connected user as creator` ;
- la réponse : le résultat sérialisé, avec le code de succès. Exemple :
  `returns the serialized organization with a 201 status`.

Rien d'autre. Les codes d'erreur et les droits d'accès se testent sur la route, avec un test
d'acceptance. Un test de contrôleur qui a besoin de données du métier, comme une vraie organisation,
est un signe que le contrôleur décide quelque chose (C1 ou C2).

Le test de l'[exemple complet](#exemple-complet). `hFake` est la fausse boîte à outils `h` de hapi,
partagée par les tests de Pix : `created()` y met le code à 201.

```ts
// tests/organizational-entities/unit/application/organization/organization.admin.controller_test.ts
import type { Request } from '@hapi/hapi';
import { expect } from 'chai';
import sinon from 'sinon';

import { organizationAdminController } from '../../../../../src/organizational-entities/application/organization/organization.admin.controller.js';
import type { ControllerDependencies } from '../../../../../src/organizational-entities/infrastructure/utils/handlerWithDependencies.js';
import type { UserId } from '../../../../../src/shared/domain/Id.js';
import { hFake } from '../../../../tooling/mocks/hapi.mock.js';

describe('Unit | Organizational Entities | Application | Controller | Admin | organization', function () {
  describe('#create', function () {
    const createdBy = 2 as UserId;
    const payload = { data: { attributes: { name: 'Lycée Victor Hugo', type: 'SCO' } } };
    // as unknown as : le test ne remplit que les champs que le contrôleur lit
    const request = { auth: { credentials: { userId: createdBy } }, payload } as unknown as Request;

    const newOrganization = Symbol('new organization');
    const createdOrganization = Symbol('created organization');
    const serializedOrganization = Symbol('serialized organization');

    const buildDependencies = () => {
      const usecases = { createOrganization: sinon.stub() };
      usecases.createOrganization.withArgs({ organization: newOrganization }).resolves(createdOrganization);
      const organizationSerializer = { deserialize: sinon.stub(), serialize: sinon.stub() };
      organizationSerializer.deserialize.withArgs(payload, { createdBy }).returns(newOrganization);
      organizationSerializer.serialize.withArgs(createdOrganization).returns(serializedOrganization);
      return { usecases, organizationSerializer } as unknown as ControllerDependencies;
    };

    it('creates the organization with the connected user as creator', async function () {
      const dependencies = buildDependencies();

      await organizationAdminController.create(request, hFake, dependencies);

      expect(dependencies.usecases.createOrganization).to.have.been.calledOnceWithExactly({
        organization: newOrganization,
      });
    });

    it('returns the serialized organization with a 201 status', async function () {
      const response = await organizationAdminController.create(request, hFake, buildDependencies());

      expect(response.source).to.equal(serializedOrganization);
      expect(response.statusCode).to.equal(201);
    });
  });
});
```

## Checklist de revue de code

```
Fait-il une seule chose ?
[ ] C1  Un seul usecase appelé
[ ] C2  Aucune règle métier, aucun code d'erreur choisi ici, aucune transaction ouverte
[ ] C2  Ni validation de forme ni contrôle des droits : c'est la route

D'où viennent ses dépendances ?
[ ] C3  Usecases et sérialiseurs reçus en troisième paramètre ; handlerWithDependencies pour un contrôleur neuf
[ ] C4  Aucun repository, aucune API interne, aucun usecase d'un autre contexte

Le retrouve-t-on ?
[ ] C5  Fichier nommé avec la ressource ; une fonction par action ; un objet exporté

Tests
[ ] Un test unitaire, usecase et sérialiseur passés en troisième argument
[ ] Aucune donnée du métier dans le test
```

## Référence des règles

### C1. Un seul usecase par point d'entrée

**La règle.** Une fonction de contrôleur appelle un usecase, et un seul. Si une action a besoin de
plusieurs étapes, c'est une seule intention du métier : elle a son propre usecase, avec un nom.

**Bon exemple.**

```ts
const createdOrganization = await usecases.createOrganization({ organization });
```

**Mauvais exemple.**

```ts
const createdOrganization = await usecases.createOrganization({ organization });
// un second usecase : « créer puis activer l'import des élèves » n'a ni nom ni test
await usecases.enableOrganizationFeature({
  organizationId: createdOrganization.id,
  featureName: 'LEARNER_IMPORT',
  params: null,
});
```

**Ce que ça apporte.** Chaque intention a un nom, un fichier et son test d'intégration. On la trouve
en cherchant son nom dans `domain/usecases/`.

**Sans cette règle.** L'enchaînement n'est vérifié que par le test d'acceptance de la route. Et la
création d'organisations par import CSV, qui passe par une autre route, n'active pas
`LEARNER_IMPORT` : la même création donne deux organisations différentes selon l'écran.

**Exceptions.** Un usecase d'écriture suivi d'un usecase de lecture, pour construire la réponse, se
juge en revue. Souvent, c'est le signe que le premier usecase ne renvoie pas ce que la réponse demande.
Ici, `createOrganization` renvoie l'organisation créée : une lecture de plus n'a pas lieu d'être.

### C2. Aucune décision

**La règle.** Le contrôleur ne décide rien :

- pas de règle métier ;
- pas de code d'erreur choisi ici : l'erreur du domaine remonte, et le mappeur d'erreurs du contexte
  la traduit. Le mappeur d'erreurs est une liste, dans `application/`, qui associe chaque erreur du
  domaine à une erreur HTTP ;
- pas de transaction : elle appartient au usecase ;
- pas de transformation au-delà de l'extraction.

Le code de succès ne dépend que de l'action : 201 pour une création, 204 sans contenu, 200 sinon.

**Bon exemple.**

```ts
const createdOrganization = await usecases.createOrganization({ organization });
return h.response(organizationSerializer.serialize(createdOrganization)).created();
```

Si l'organisation mère choisie n'appartient à aucun réseau, le usecase `createOrganization` lève une
`ParentOrganizationNotInNetworkError`
([`create-organization.js`](https://github.com/1024pix/pix/blob/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/organizational-entities/domain/usecases/create-organization.js#L16-L22)).
Le contrôleur la laisse remonter, et le mappeur d'erreurs la traduit en 422. Le 422 dit que la
requête a la bonne forme mais que le métier refuse son contenu. Le 400 reste pour une forme fausse,
rejetée par la validation Joi de la route. D'après [la traduction de
`ParentOrganizationNotInNetworkError`](https://github.com/1024pix/pix/blob/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/organizational-entities/application/http-error-mapper-configuration.js#L77-L80).

```ts
// organizational-entities/application/http-error-mapper-configuration.ts — le mappeur d'erreurs
{
  name: ParentOrganizationNotInNetworkError.name,
  httpErrorFn: (error) => new UnprocessableEntityError(error.message, error.code, error.meta),
},
```

**Mauvais exemple.**

```ts
try {
  const organization = organizationSerializer.deserialize(request.payload, { createdBy });
  const createdOrganization = await usecases.createOrganization({ organization });
  return h.response(organizationSerializer.serialize(createdOrganization)).created();
} catch (error) {
  if (error instanceof ParentOrganizationNotInNetworkError) {
    return h.response().code(400); // le contrôleur choisit le code d'erreur
  }
  throw error;
}
```

**Ce que ça apporte.** Une erreur du domaine donne toujours la même réponse, quelle que soit la route.
Le contrôleur reste assez court pour que son test se réduise à « le bon usecase, la bonne réponse ».

**Sans cette règle.** La même erreur donne deux réponses. À la création d'une organisation, le
contrôleur renvoie un 400 sans `code` ni `meta`. À l'import CSV, qui lève la même erreur et la laisse
remonter, le mappeur renvoie un 422 avec le code `PARENT_ORGANIZATION_NOT_IN_NETWORK`. Un client qui
lit le `code` pour afficher le bon message ne le trouve pas à la création.

**À savoir.**

- Ouvrir une transaction autour de l'appel est une décision. C'est le usecase qui l'ouvre
  ([U7 de la fiche usecase](../usecase/README.md#u7-le-périmètre-transactionnel-est-explicite)).
- Certaines choses ont leur place ailleurs que dans le contrôleur :
  - la forme du payload : la validation Joi de la route ;
  - les droits d'accès : un pre-handler sur la route ;
  - la traduction de l'objet en JSON:API : le [sérialiseur](../serializer/README.md) ;
  - une donnée exposée à un autre contexte : l'[API interne](../internal-api/README.md).

**Exceptions.**

- Un `if` sur la présence d'un paramètre optionnel est de l'extraction.
- Un fichier ou un flux renvoyé avec ses en-têtes, comme un modèle CSV, est permis.

### C3. Les dépendances arrivent en paramètre

**La règle.** Les usecases et les sérialiseurs arrivent en troisième paramètre du contrôleur. Aucun
n'est importé puis appelé directement. La forme par défaut, pour tout contrôleur neuf : la route pose
l'enveloppe `handlerWithDependencies`, qui passe au contrôleur un objet avec ses usecases et ses
sérialiseurs. Une seconde forme est admise, décrite dans les exceptions.

**Bon exemple.**

```ts
// la route
handler: handlerWithDependencies(organizationAdminController.create),

// le contrôleur
const create = async function (
  request: Request,
  h: ResponseToolkit,
  { usecases, organizationSerializer }: ControllerDependencies,
) {
  …
};
```

**Mauvais exemple.**

```ts
import { usecases } from '../../domain/usecases/index.js';
import { organizationSerializer } from '../../infrastructure/serializers/jsonapi/organization-serializer.js';

const create = async function (request: Request, h: ResponseToolkit) {
  …
  const createdOrganization = await usecases.createOrganization({ organization }); // importé
  return h.response(organizationSerializer.serialize(createdOrganization)).created(); // importé
};
```

**Ce que ça apporte.** Le test passe ses stubs en troisième argument, sans toucher aux modules. Le
type `ControllerDependencies` dit ce que le contrôleur utilise, et le compilateur refuse un usecase
qui n'existe pas.

**Sans cette règle.** Avec les modules ES, le test ne peut pas remplacer un import. Il ne peut que
remplacer, une par une, les méthodes de l'objet importé. Le test qui oublie
`sinon.stub(organizationSerializer, 'serialize')` exécute le vrai sérialiseur, et casse dès que le
format JSON:API d'une organisation change, alors que le contrôleur n'a pas changé. Avec le troisième
paramètre, une dépendance oubliée vaut `undefined`, et le test échoue tout de suite.

**À savoir.** L'enveloppe est la seule forme qui fournit aussi les usecases. C'est pour ça qu'elle
est la forme par défaut.

**Exceptions.** La seconde forme admise : les usecases du contexte sont importés, et le sérialiseur
arrive par la valeur par défaut du troisième paramètre.

```ts
import { usecases } from '../../domain/usecases/index.js';

const create = async function (request: Request, h: ResponseToolkit, dependencies = { organizationSerializer }) {
  …
  const createdOrganization = await usecases.createOrganization({ organization });
  return h.response(dependencies.organizationSerializer.serialize(createdOrganization)).created();
};
```

Le test remplace alors la méthode sur l'objet `usecases` importé :
`sinon.stub(usecases, 'createOrganization')`.

### C4. Aucun accès direct aux données

**La règle.** Le contrôleur ne connaît que les usecases de son contexte. Il n'appelle ni repository, ni
client de stockage, ni [API interne](../internal-api/README.md), ni usecase d'un autre contexte. Pour
une donnée d'un autre contexte, c'est le usecase qui la demande, par un
[repository](../repository/README.md) qui appelle l'API interne de ce contexte.

**Bon exemple.**

```ts
const createdOrganization = await usecases.createOrganization({ organization });
```

**Mauvais exemple.**

```ts
import { organizationRepository } from '../../infrastructure/repositories/index.js';

// le contrôleur enregistre lui-même, sans passer par le usecase
const createdOrganization = await organizationRepository.add({ organization });
```

**Ce que ça apporte.** Toute création d'organisation passe par `createOrganization`. Une règle ajoutée
dans ce usecase vaut pour toutes les routes qui créent une organisation.

**Sans cette règle.** Pix donne un code d'accès à chaque école créée, de type `SCO-1D`
([`create-organization.js`](https://github.com/1024pix/pix/blob/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/organizational-entities/domain/usecases/create-organization.js#L49-L54)).
`createOrganization` génère ce code. Le contrôleur qui appelle le repository ne le génère pas :
l'école créée par cette route n'a pas de code d'accès.

**À savoir.** La règle vaut aussi pour la lecture. Une lecture « juste pour afficher » passe par un
usecase, qui peut renvoyer un [read-model](../read-model/README.md).

### C5. Un contrôleur par ressource, une fonction par action

**La règle.** Le fichier porte le nom de la ressource. Chaque fonction porte le nom de son action. Les
fonctions sont regroupées dans un objet exporté, et la route référence une fonction de cet objet.

**Bon exemple.**

```ts
// organization.admin.controller.ts
export const organizationAdminController = { create, archive };

// la route
handler: handlerWithDependencies(organizationAdminController.create),
```

**Mauvais exemple.**

```ts
// create-organization-controller.ts : un fichier pour une action, une fonction exportée seule
export async function createOrganizationHandler(request: Request, h: ResponseToolkit, dependencies: ControllerDependencies) {
  …
}
```

**Ce que ça apporte.** Toutes les actions sur les organisations sont dans un seul fichier, qu'on trouve
en cherchant le nom de la ressource. Dans la route, `organizationAdminController.create` dit la
ressource et l'action.

**Sans cette règle.** Les actions sur les organisations se dispersent dans des fichiers aux noms
variés. Pour savoir ce que fait `POST /api/admin/organizations`, il faut suivre l'import de la route
jusqu'à un fichier qu'on ne pouvait pas deviner.
