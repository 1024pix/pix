# Route

Une route dit comment on appelle l'API en HTTP : l'adresse et la méthode, la forme des entrées, qui a
le droit d'appeler, quel contrôleur répond, et la documentation. Elle déclare tout cela et ne fait rien
d'autre. Par exemple, `POST /api/admin/organizations` crée une organisation depuis Pix Admin. Les
routes se rangent dans `application/`, dans un fichier `*.route`. La route branche le contrôleur,
l'[adapter](../adapter/README.md) HTTP, sur le serveur.

Deux outils reviennent dans toute la fiche. Joi est la bibliothèque qui décrit la forme attendue d'une
valeur, sous forme de schéma. Un pre-handler est une fonction que le framework (hapi) appelle avant le
contrôleur, et qui peut arrêter la requête.

## Les règles

Chaque règle est détaillée plus bas, dans la [référence des règles](#référence-des-règles).

| # | Règle | En pratique |
| --- | --- | --- |
| [R1](#r1-la-route-valide-la-forme-des-entrées) | La route valide la forme des entrées | un schéma Joi dans `validate` pour les paramètres, la chaîne de requête et le corps ; une règle du métier reste dans le domaine |
| [R2](#r2-contrôles-daccès-en-pre-handler) | Contrôles d'accès en pre-handler | chaque route déclare un pre-handler de sécurité dans `pre`, ou `auth: false` si elle est publique |
| [R3](#r3-la-route-est-documentée) | La route est documentée | `notes` et `tags` sur chaque route |
| [R4](#r4-aucune-logique-dans-la-route) | Aucune logique dans la route | aucune fonction écrite dans l'objet de la route : `handler: handlerWithDependencies(organizationAdminController.create)` |
| [R5](#r5-une-adresse-et-une-méthode-un-gestionnaire) | Une adresse et une méthode, un gestionnaire | deux comportements, deux routes, chacune avec ses droits |

## Exemple complet

Les routes qui créent des organisations dans Pix Admin. La première crée une organisation, la seconde
en crée plusieurs depuis un fichier CSV. Le [contrôleur](../controller/README.md) `create` reçoit la
requête et appelle le [usecase](../usecase/README.md) `createOrganization`. `handlerWithDependencies`
est l'enveloppe qui passe au contrôleur ses dépendances (règle
[C3](../controller/README.md#c3-les-dépendances-arrivent-en-paramètre) de la fiche contrôleur).
Exemple inventé, d'après le test
[`organization.admin.route.test.js`](https://github.com/1024pix/pix/blob/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/tests/organizational-entities/acceptance/application/organization/organization.admin.route.test.js#L424-L622)
et l'utilitaire
[`hasAtLeastOneAccessOf`](https://github.com/1024pix/pix/blob/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/shared/application/security-pre-handlers.js#L440-L446).

```ts
// organizational-entities/application/organization/organization.admin.route.ts
import type { Server } from '@hapi/hapi';
import Joi from 'joi';

import { securityPreHandlers } from '../../../shared/application/security-pre-handlers.js';
import { MAX_FILE_SIZE_UPLOAD } from '../../../shared/constants.js';
import { handlerWithDependencies } from '../../infrastructure/utils/handlerWithDependencies.js';
import { organizationAdminController } from './organization.admin.controller.js';

const register = async function (server: Server) {
  server.route([
    // R5 : une route pour créer une organisation
    {
      method: 'POST',
      path: '/api/admin/organizations',
      config: {
        pre: [
          {
            // R2 : seuls ces trois rôles de Pix Admin passent
            // R4 : on passe la fonction renvoyée par l'utilitaire, sans l'envelopper
            method: securityPreHandlers.hasAtLeastOneAccessOf([
              securityPreHandlers.checkAdminMemberHasRoleSuperAdmin,
              securityPreHandlers.checkAdminMemberHasRoleSupport,
              securityPreHandlers.checkAdminMemberHasRoleMetier,
            ]),
            assign: 'hasAuthorizationToAccessAdminScope',
          },
        ],
        // R1 : la forme du corps ; la liste des types d'organisation est vérifiée dans le domaine
        validate: {
          payload: Joi.object({
            data: Joi.object({
              type: Joi.string().required(),
              attributes: Joi.object({
                name: Joi.string().required(),
                type: Joi.string().required(),
                'administration-team-id': Joi.number().integer().required(),
                'country-code': Joi.number().integer().required(),
                'organization-learner-type-id': Joi.number().integer().required(),
              }).required(),
            }).required(),
          }),
        },
        // R4 : la fonction du contrôleur, passée telle quelle à l'enveloppe
        handler: handlerWithDependencies(organizationAdminController.create),
        // R3 : la description et les étiquettes
        notes: [
          "- **Cette route est restreinte aux membres de Pix Admin qui ont le rôle SUPER_ADMIN, SUPPORT ou METIER**\n" +
            '- Elle permet de créer une nouvelle organisation',
        ],
        tags: ['api', 'admin', 'organizations'],
      },
    },
    // R5 : une autre route pour créer en masse, avec ses propres droits
    {
      method: 'POST',
      path: '/api/admin/organizations/import-csv',
      config: {
        pre: [
          {
            method: securityPreHandlers.checkAdminMemberHasRoleSuperAdmin, // R2 : SUPER_ADMIN seulement
            assign: 'hasAuthorizationToAccessAdminScope',
          },
        ],
        payload: { maxBytes: MAX_FILE_SIZE_UPLOAD, output: 'file' }, // R1 : la taille du fichier est une forme
        handler: handlerWithDependencies(organizationAdminController.createInBatch),
        notes: [
          "- **Cette route est restreinte aux membres de Pix Admin qui ont le rôle SUPER_ADMIN**\n" +
            '- Elle permet de créer de nouvelles organisations en masse',
        ],
        tags: ['api', 'admin', 'organizations'],
      },
    },
  ]);
};

export const organizationAdminRoute = { name: 'organizational-entities/organization-admin-api', register };
```

## Comment tester

Une route se teste avec un test d'acceptance : le test appelle le vrai serveur, avec une vraie base de
données. Le test couvre :

- l'appel autorisé : la bonne réponse, pour un rôle qui a le droit. Exemple :
  `creates the organization for an admin member with role SUPPORT` ;
- le refus, pour chaque cas qui n'a pas le droit. C'est ce test qui prouve que le pre-handler est là :
  un test qui ne vérifie que l'appel autorisé passe aussi sans pre-handler. Exemples :
  `refuses an admin member with role CERTIF`, `refuses a user who is not an admin member` ;
- une entrée de mauvaise forme : la réponse 400. Exemple : `refuses a payload without name`.

Un type d'organisation inconnu ne se teste pas ici. Il a la bonne forme, et c'est le domaine qui le
refuse : ses tests le couvrent.

Pas de test unitaire : une route n'a pas de logique à tester. Si un test unitaire de route a du sens,
c'est que la route contient de la logique, et elle ne respecte pas R4.

Une route publique, déclarée par `auth: false`, n'a pas de refus à tester.

Le test de l'[exemple complet](#exemple-complet) :

```ts
// tests/organizational-entities/acceptance/application/organization/organization.admin.route_test.ts
import { expect } from 'chai';

import { PIX_ADMIN } from '../../../../../src/shared/constants.js';
import { databaseBuilder } from '../../../../tooling/databases.js';
import { getServer } from '../../../../tooling/server/shared-server.js';
import { generateAuthenticatedUserRequestHeaders } from '../../../../tooling/test-utils/http-server.js';

const { ROLES } = PIX_ADMIN;

describe('Acceptance | Organizational Entities | Application | Route | Admin | Organization', function () {
  describe('POST /api/admin/organizations', function () {
    const validAttributes = {
      name: 'Cabinet Martin',
      type: 'PRO',
      'administration-team-id': 1234,
      'country-code': 99100,
      'organization-learner-type-id': 123,
    };

    const buildPayload = (attributes: Record<string, unknown> = validAttributes) => ({
      data: { type: 'organizations', attributes },
    });

    const createOrganization = async (userId: number, payload = buildPayload()) => {
      const server = await getServer();
      return server.inject({
        method: 'POST',
        url: '/api/admin/organizations',
        payload,
        headers: generateAuthenticatedUserRequestHeaders({ userId }),
      });
    };

    it('creates the organization for an admin member with role SUPPORT', async function () {
      const userId = databaseBuilder.factory.buildUser.withRole({ role: ROLES.SUPPORT }).id;
      databaseBuilder.factory.buildAdministrationTeam({ id: 1234 });
      databaseBuilder.factory.buildCertificationCpfCountry({ code: 99100, commonName: 'France', originalName: 'France' });
      databaseBuilder.factory.buildOrganizationLearnerType({ id: 123 });
      await databaseBuilder.commit();

      const response = await createOrganization(userId);

      const body = JSON.parse(response.payload);
      expect(response.statusCode).to.equal(201);
      expect(body.data.attributes.name).to.equal('Cabinet Martin');
      expect(body.data.attributes['created-by']).to.equal(userId);
    });

    it('refuses an admin member with role CERTIF', async function () {
      const userId = databaseBuilder.factory.buildUser.withRole({ role: ROLES.CERTIF }).id;
      await databaseBuilder.commit();

      const response = await createOrganization(userId);

      expect(response.statusCode).to.equal(403);
    });

    it('refuses a user who is not an admin member', async function () {
      const userId = databaseBuilder.factory.buildUser().id;
      await databaseBuilder.commit();

      const response = await createOrganization(userId);

      expect(response.statusCode).to.equal(403);
    });

    it('refuses a payload without name', async function () {
      const userId = databaseBuilder.factory.buildUser.withRole({ role: ROLES.SUPPORT }).id;
      await databaseBuilder.commit();

      const { name, ...attributesWithoutName } = validAttributes;
      const response = await createOrganization(userId, buildPayload(attributesWithoutName));

      expect(response.statusCode).to.equal(400);
    });
  });
});
```

## Checklist de revue de code

```
Qui peut appeler la route ?
[ ] R2  Un pre-handler de sécurité dans pre, ou auth: false pour une route publique
[ ] R2  Aucun contrôle de droit dans le contrôleur
[ ] R2  Si la route n'a ni pre-handler ni auth: false, tout utilisateur connecté y a droit, et c'est voulu

Qu'accepte-t-elle ?
[ ] R1  Les paramètres, la chaîne de requête et le corps ont un schéma dans validate
[ ] R1  Aucun schéma ne copie une règle du métier

Fait-elle autre chose que déclarer ?
[ ] R4  Aucune fonction écrite dans l'objet de la route, sauf un failAction
[ ] R5  Un seul gestionnaire, qui ne choisit pas entre deux comportements

Est-elle documentée ?
[ ] R3  notes et tags présents

Est-elle testée ?
[ ] R2  Un test d'acceptance du refus, pour un utilisateur connecté qui n'a pas le droit
[ ] R1  Un test d'acceptance d'une entrée de mauvaise forme
```

## Référence des règles

### R1. La route valide la forme des entrées

**La règle.** La route déclare la forme de ses entrées dans `validate` : les paramètres de l'adresse, la
chaîne de requête et le corps. Le framework refuse une entrée de mauvaise forme avec une réponse 400,
avant d'appeler le contrôleur. Une règle du métier ne va pas dans ce schéma : elle reste dans le
domaine.

**Bon exemple.**

```ts
// organization.admin.route.ts, route POST /api/admin/organizations
validate: {
  payload: Joi.object({
    data: Joi.object({
      type: Joi.string().required(),
      attributes: Joi.object({
        name: Joi.string().required(),
        type: Joi.string().required(),
        'administration-team-id': Joi.number().integer().required(),
        'country-code': Joi.number().integer().required(),
        'organization-learner-type-id': Joi.number().integer().required(),
      }).required(),
    }).required(),
  }),
},
```

Le schéma dit que le nom et le type sont des chaînes, que l'équipe, le pays et le public prescrit
sont donnés par des nombres entiers, et que tous sont présents. Le corps suit le format JSON:API : les champs sont rangés dans
`data.attributes`.

La liste des types d'organisation est une règle du métier, et le schéma ne la recopie pas. À la
création, le domaine refuse un type hors de `SCO`, `SUP`, `PRO` et `SCO-1D`
([`organization-creation-validator.js`](https://github.com/1024pix/pix/blob/bd5b0b8966196f553e9f62ece6031ca6e8435ca3/api/src/organizational-entities/domain/validators/organization-creation-validator.js#L12-L15)).

**Mauvais exemple.**

```ts
// organization.admin.route.ts : la liste des types est recopiée sur la route, et SCO-1D a été oublié
type: Joi.string().valid('SCO', 'SUP', 'PRO').required(),
```

```ts
// organization.admin.controller.ts : la forme est vérifiée à la main
const create = async function (
  request: Request,
  h: ResponseToolkit,
  { usecases, organizationSerializer }: ControllerDependencies,
) {
  if (!request.payload.data?.attributes?.name) {
    return h.response().code(400);
  }
  …
};
```

**Ce que ça apporte.** Le contrôleur et le [sérialiseur](../serializer/README.md) reçoivent toujours
un corps qui a la bonne forme. Et le schéma documente aussi la route : on lit ce qu'elle attend sans
ouvrir le contrôleur.

**Sans cette règle.** Sans schéma, un corps sans `attributes` arrive jusqu'au sérialiseur, qui plante :
l'appelant reçoit une erreur 500 au lieu d'une 400. Si la liste des types est recopiée sur la route, la
route refuse un type que le domaine accepte, comme `SCO-1D`. Et si une règle n'existe que sur la
route, un script qui appelle le même usecase ne passe pas par elle : il crée une organisation que la
route aurait refusée.

**À savoir.**

- Pour savoir si une contrainte est une forme ou une règle, on se pose la question : « dit-elle ce
  qu'est la valeur, ou ce qu'elle a le droit d'être pour le métier ? ». « Le nom est une chaîne » est
  une forme. « Le type est SCO, SUP, PRO ou SCO-1D » est une règle. De même, « le code pays est un
  nombre entier » est une forme, et « le code pays est compris entre 99000 et 99999 » est une règle.
- Un identifiant dans l'adresse utilise le type partagé `identifiersType` (dans
  `shared/domain/types/identifiers-type.js`), plutôt qu'un schéma écrit à chaque route. Un identifiant de mauvaise forme donne alors partout la même erreur :

  ```ts
  path: '/api/admin/organizations/{organizationId}/archive',
  …
  validate: {
    params: Joi.object({ organizationId: identifiersType.organizationId }),
  },
  ```

**Exceptions.** Une taille maximale du corps, comme `payload: { maxBytes: MAX_FILE_SIZE_UPLOAD }`, est
une forme. Elle se déclare aussi sur la route.

### R2. Contrôles d'accès en pre-handler

**La règle.** Qui a le droit d'appeler la route se déclare dans `pre`, par un pre-handler de sécurité.
Le contrôle n'est jamais écrit dans le contrôleur. Une route publique se déclare avec `auth: false`, et
cette déclaration suffit.

**Bon exemple.**

```ts
// organization.admin.route.ts, route POST /api/admin/organizations
pre: [
  {
    method: securityPreHandlers.hasAtLeastOneAccessOf([
      securityPreHandlers.checkAdminMemberHasRoleSuperAdmin,
      securityPreHandlers.checkAdminMemberHasRoleSupport,
      securityPreHandlers.checkAdminMemberHasRoleMetier,
    ]),
    assign: 'hasAuthorizationToAccessAdminScope',
  },
],
```

La route dit, à elle seule, qui peut créer une organisation.

**Mauvais exemple.**

```ts
// organization.admin.controller.ts : le droit est vérifié à la main
const create = async function (
  request: Request,
  h: ResponseToolkit,
  { usecases, organizationSerializer, adminMemberRepository }: ControllerDependencies,
) {
  const { userId } = request.auth.credentials;
  const adminMember = await adminMemberRepository.get({ userId });
  if (!['SUPER_ADMIN', 'SUPPORT', 'METIER'].includes(adminMember?.role)) {
    throw new ForbiddenAccess();
  }
  …
};
```

**Ce que ça apporte.** Le fichier de route dit qui a le droit d'appeler chaque route, sauf quand le
droit dépend d'une donnée que le pre-handler ne peut pas charger (voir « À savoir »). Une route sans
contrôle se voit aussi : elle n'a ni `pre` ni `auth: false`.

**Sans cette règle.** Un contrôleur oublie le contrôle, et rien ne le montre dans la route. Tout
utilisateur connecté, par exemple un enseignant de Pix Orga, peut alors créer une organisation.

**À savoir.**

- Un pre-handler de sécurité reçoit `(request, h)`. Il renvoie `h.response(true)` si l'utilisateur a
  le droit, sinon une réponse 403 avec `.takeover()`, qui arrête la requête.
- `assign` range la réponse du pre-handler dans `request.pre`, sous le nom donné. Le contrôle ne dépend
  pas de ce nom.
- Pour accepter plusieurs rôles, la route utilise `hasAtLeastOneAccessOf`. Pour les exiger tous, elle
  utilise `validateAllAccess`. La combinaison ne s'écrit pas à la main.
- Si le droit dépend d'une donnée à charger, par exemple « l'utilisateur est membre de cette
  organisation », le pre-handler charge cette donnée. S'il ne peut pas, le contrôle va dans le
  usecase, et jamais dans le contrôleur.
- Une route sans `pre` et sans `auth: false` accepte tout utilisateur connecté. C'est souvent voulu,
  mais la route ne permet pas de le distinguer d'un oubli. Le relecteur pose la question.

**Exceptions.**

- Une route publique déclare `auth: false`, sans pre-handler.
- Une route où la connexion est facultative déclare sa stratégie d'authentification dans `auth`.

### R3. La route est documentée

**La règle.** Chaque route déclare `notes`, une description en Markdown, et `tags`, ses étiquettes. La
documentation de l'API est générée à partir de ces deux champs. La description dit qui a le droit
d'appeler la route et ce qu'elle fait.

**Bon exemple.**

```ts
// organization.admin.route.ts, route POST /api/admin/organizations
notes: [
  "- **Cette route est restreinte aux membres de Pix Admin qui ont le rôle SUPER_ADMIN, SUPPORT ou METIER**\n" +
    '- Elle permet de créer une nouvelle organisation',
],
tags: ['api', 'admin', 'organizations'],
```

**Mauvais exemple.**

```ts
{
  method: 'POST',
  path: '/api/admin/organizations',
  config: {
    pre: [ … ],
    validate: { … },
    handler: handlerWithDependencies(organizationAdminController.create),
    // ni notes ni tags
  },
}
```

**Ce que ça apporte.** La documentation générée liste la route, avec ses droits et son rôle. Un
développeur du front sait quels rôles peuvent l'appeler sans lire le code de l'API.

**Sans cette règle.** La route n'apparaît pas dans la documentation générée, et rien ne signale
qu'elle manque.

### R4. Aucune logique dans la route

**La règle.** La route référence des fonctions, elle n'en écrit pas. Le gestionnaire est la fonction du
contrôleur, passée telle quelle à `handlerWithDependencies`. Un pre-handler est la fonction de sécurité,
ou celle que renvoie `hasAtLeastOneAccessOf`. Ces deux utilitaires renvoient une fonction, et la route
passe cette fonction sans l'envelopper.

**Bon exemple.**

```ts
// organization.admin.route.ts, route POST /api/admin/organizations
method: securityPreHandlers.hasAtLeastOneAccessOf([ … ]),
…
handler: handlerWithDependencies(organizationAdminController.create),
```

**Mauvais exemple.**

```ts
// une enveloppe qui n'ajoute rien
method: (request, h) => securityPreHandlers.hasAtLeastOneAccessOf([ … ])(request, h),
…
handler: (request, h) => handlerWithDependencies(organizationAdminController.create)(request, h),
```

```ts
// une enveloppe qui contient de la logique
handler: async (request, h) => {
  request.payload.data.attributes.name = request.payload.data.attributes.name.trim();
  return handlerWithDependencies(organizationAdminController.create)(request, h);
},
```

**Ce que ça apporte.** La logique est dans le contrôleur et dans le domaine, là où les tests unitaires
l'atteignent. En revue, une fonction écrite dans une route se repère tout de suite, parce qu'il n'y en
a aucune autre.

**Sans cette règle.** Une enveloppe vide ne change rien à la requête. Mais quand les routes en sont
pleines, l'enveloppe qui modifie le nom ne surprend plus personne en revue. Le nom est alors modifié
sans test unitaire, et la lecture du contrôleur ne le montre pas.

**Exceptions.** `failAction` traite l'échec d'une validation, et le framework impose de le déclarer
sur la route. Il est permis s'il ne fait que renvoyer l'erreur :

```ts
failAction: (request, h) => {
  return sendJsonApiError(new PayloadTooLargeError('An error occurred, payload is too large'), h);
},
```

### R5. Une adresse et une méthode, un gestionnaire

**La règle.** Chaque route a un seul gestionnaire, qui ne choisit pas entre deux comportements. Deux
comportements différents sont deux routes, chacune avec sa validation, ses droits et sa documentation.
R4 interdit d'écrire ce choix dans la route. R5 l'interdit aussi quand il est caché dans le contrôleur.

**Bon exemple.**

```ts
// organization.admin.route.ts
{
  method: 'POST',
  path: '/api/admin/organizations',
  config: {
    pre: [ … ], // SUPER_ADMIN, SUPPORT ou METIER
    …
    handler: handlerWithDependencies(organizationAdminController.create),
    …
  },
},
{
  method: 'POST',
  path: '/api/admin/organizations/import-csv',
  config: {
    pre: [ … ], // SUPER_ADMIN seulement
    …
    handler: handlerWithDependencies(organizationAdminController.createInBatch),
    …
  },
},
```

**Mauvais exemple.**

```ts
// organization.admin.route.ts : une seule route pour les deux comportements
{
  method: 'POST',
  path: '/api/admin/organizations',
  config: {
    pre: [ … ], // SUPER_ADMIN, SUPPORT ou METIER
    …
    handler: handlerWithDependencies(organizationAdminController.createOneOrMany),
    …
  },
},
```

```ts
// organization.admin.controller.ts : le type du contenu choisit le comportement
const createOneOrMany = async function (request: Request, h: ResponseToolkit, dependencies: ControllerDependencies) {
  if (request.mime === 'text/csv') return createInBatch(request, h, dependencies);
  return create(request, h, dependencies);
};
```

**Ce que ça apporte.** Une route a un seul jeu de droits, une seule forme d'entrée et une seule
description. On les lit dans la route, sans suivre de condition.

**Sans cette règle.** La création en masse hérite des droits de la création d'une organisation. Un
membre qui a le rôle SUPPORT crée des centaines d'organisations depuis un fichier CSV, alors que seul
SUPER_ADMIN y a droit.
