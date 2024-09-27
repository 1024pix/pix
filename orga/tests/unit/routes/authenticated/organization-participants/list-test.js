import { setupTest } from 'ember-qunit';
import extraFilterSerializer from 'pix-orga/utils/extra-filter-serializer.js';
import paramsValidator from 'pix-orga/utils/params-validator.js';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Unit | Route | authenticated/organization-participants/list', function (hooks) {
  setupTest(hooks);
  let route;
  let store;
  const organizationParticipantSymbol = Symbol('organization-participant');
  const fullNameSymbol = Symbol('fullName');
  const certificabilitySymbol = [Symbol('certificability')];
  const extraFiltersSymbol = Symbol('extraFilters');
  const decodedExtraFiltersSymbol = Symbol('decodedExtraFilters');
  const encodedExtraFiltersSymbol = Symbol('encodedExtraFilters');
  const participationCountOrderSymbol = Symbol('participationCountOrder');
  const latestParticipationOrderSymbol = Symbol('latestParticipationOrder');
  const lastnameSortSymbol = Symbol('lastnameSort');
  const pageNumberSymbol = Symbol('pageNumber');
  const pageSizeSymbol = Symbol('pageSize');

  const params = {
    fullName: fullNameSymbol,
    certificability: certificabilitySymbol,
    extraFilters: extraFiltersSymbol,
    participationCountOrder: participationCountOrderSymbol,
    latestParticipationOrder: latestParticipationOrderSymbol,
    lastnameSort: lastnameSortSymbol,
    pageNumber: pageNumberSymbol,
    pageSize: pageSizeSymbol,
  };
  hooks.afterEach(function () {
    sinon.restore();
  });
  hooks.beforeEach(function () {
    route = this.owner.lookup('route:authenticated/organization-participants/list');
    store = this.owner.lookup('service:store');
    route.currentUser = { organization: { id: Symbol('organization-id') } };
    sinon
      .stub(extraFilterSerializer, 'decodeExtraFilters')
      .withArgs(extraFiltersSymbol)
      .returns(decodedExtraFiltersSymbol);
    sinon.stub(paramsValidator, 'validateCertificabilityParams').withArgs(params).returns(params);

    sinon
      .stub(store, 'query')
      .withArgs('organization-participant', {
        filter: {
          organizationId: route.currentUser.organization.id,
          fullName: fullNameSymbol,
          certificability: certificabilitySymbol,
          extra: decodedExtraFiltersSymbol,
        },
        sort: {
          participationCount: participationCountOrderSymbol,
          latestParticipationOrder: latestParticipationOrderSymbol,
          lastnameSort: lastnameSortSymbol,
        },
        page: {
          number: pageNumberSymbol,
          size: pageSizeSymbol,
        },
      })
      .resolves(organizationParticipantSymbol);
  });

  test('should return participant model', async function (assert) {
    // when
    const participants = await route.model(params);

    // then
    assert.strictEqual(participants, organizationParticipantSymbol);
  });

  test('should resetController on exiting', function (assert) {
    sinon.stub(extraFilterSerializer, 'encodeExtraFilters').withArgs({}).returns(encodedExtraFiltersSymbol);
    // given
    const controllerSpy = {};
    // when
    route.resetController(controllerSpy, true);
    // then
    assert.deepEqual(controllerSpy, {
      pageNumber: 1,
      pageSize: 50,
      fullName: null,
      certificability: [],
      extraFilters: encodedExtraFiltersSymbol,
      participationCountOrder: null,
      latestParticipationOrder: null,
      lastnameSort: 'asc',
    });
  });
});
