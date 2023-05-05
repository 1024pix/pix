# Injecter les dépendances dans l'API

Ce guide a été créé à l'occasion de l'[ADR sur le sujet](./adr/0046-injecter-les-dependances-api.md)
Pour séparer les différentes couches et assurer leur testabilité, les dépendances sont injectées autant que possible.
Dans la majorité des cas, les dépendances sont injectées en tant que paramètres de la fonction appelée.

Suivant la couche, l'injection est :

- automatique, en suivant la signature des paramètres ;
- manuelle.

Il existe deux cas où les dépendances ne sont pas injectées :

- les use-case (couche domaine) ne sont pas injectés dans les controllers (couche applicative);
- les controller (couche applicative) ne sont pas injectés dans les routeurs (couche applicative), car le framework
  HapiJs ne le permet pas.

Vous trouverez ci-dessous des exemples à suivre pour chaque cas.

## Injections des dépendances

### Injection de l'infrastructure (repository, services) dans le use-case (couche domaine)

Le use-case `attachTargetProfilesToOrganization` a comme dépendance le repository `targetProfileShareRepository`.

#### Implémentation

```js
module.exports = async function attachTargetProfilesToOrganization({
                                                                     organizationId,
                                                                     targetProfileIds,
                                                                     targetProfileRepository,
                                                                     targetProfileShareRepository,
                                                                   }) {
```

Déclarer le composant et ses dépendances dans le fichier [répertoire](../../api/lib/domain/usecases/index.js).

Utiliser l'[injection automatique](../../api/lib/infrastructure/utils/dependency-injection.js) des dépendances en
utilisant les paramètres objets JS.

#### Test unitaire

Test de l'appel du repository depuis le use-case.

```js
// given
const targetProfileShareRepository = {
  addTargetProfilesToOrganization: sinon.stub(),
};
targetProfileShareRepository.addTargetProfilesToOrganization.resolves();

// when
await attachTargetProfilesToOrganization({
  organizationId,
  targetProfileIds,
  targetProfileRepository,
  targetProfileShareRepository,
});

// then
expect(targetProfileShareRepository.addTargetProfilesToOrganization).to.have.been.calledWithExactly({
  organizationId,
  targetProfileIdList: uniqTargetProfileIds,
});
```

### Injection des services dans la couche applicative et infrastructure

Le controller `findPaginatedTrainings` a comme dépendance le service `extractParameters`.

#### Implémentation

```js
  async
findPaginatedTrainings(request, h, dependencies = { queryParamsUtils, trainingSummarySerializer })
{
  const { page } = dependencies.queryParamsUtils.extractParameters(request.query);
```

#### Test unitaire

Test de l'appel du service depuis le controller.

```js
// given
const queryParamsUtils = {
  extractParameters: sinon.stub().returns(useCaseParameters),
};

// when
const response = await targetProfileController.findPaginatedTrainings(
  {
    params: {
      id: targetProfileId,
      page: { size: 2, number: 1 },
    },
  },
  hFake,
  { trainingSummarySerializer, queryParamsUtils }
);

// then
expect(queryParamsUtils.extractParameters).to.have.been.calledOnce;
```

## Import des dépendances

### Import du use-case (couche domaine) depuis le controller (couche applicative)

Le use-case `attachTargetProfilesToOrganization` est appelé par le controller `account-recovery-controller`.

#### Implémentation

Importer le use-case depuis le fichier répertoire.
Appeler le use-case sans ses dépendances.

```js
const usecases = require('../../domain/usecases/index.js');

module.exports = {
  async sendEmailForAccountRecovery(request, h) {
    const studentInformation = await studentInformationForAccountRecoverySerializer.deserialize(request.payload);
    await usecases.sendEmailForAccountRecovery({ studentInformation });
```

#### Test unitaire

Test de l'appel du use-case depuis le controller.

```js
// given
sinon.stub(usecases, 'sendEmailForAccountRecovery').resolves();

// when
const response = await accountRecoveryController.sendEmailForAccountRecovery(request, hFake);

// then
expect(usecases.sendEmailForAccountRecovery).calledWith({ studentInformation });
```

### Import du controller depuis le router

Le router `admin-member` appelle le controller `adminMemberController`.
Le serveur http HapiJs ne permettant pas l'injection de dépendances, on exporte le controller dans un wrapper.

#### Implémentation

Controller

```js
const adminMemberController = {
  findAll,
  getCurrentAdminMember,
  updateAdminMember,
  deactivateAdminMember,
  saveAdminMember,
};
export { adminMemberController };
```

Router

```js
  method: 'GET',
  path
:
'/api/admin/admin-members/me',
  config
:
{
  handler: adminMemberController.getCurrentAdminMember,
```

#### Test unitaire

Test de l'appel du controller depuis le router.

```js
// given
sinon.stub(adminMemberController, 'getCurrentAdminMember').returns(adminMember);

// when
const { statusCode } = await httpTestServer.request('GET', '/api/admin/admin-members/me');

// then
expect(adminMemberController.getCurrentAdminMember).to.have.been.called;
```
