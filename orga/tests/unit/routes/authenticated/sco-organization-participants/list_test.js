import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Unit | Route | authenticated/sco-organization-participants/list', function (hooks) {
  setupTest(hooks);
  let route;
  let store;
  const importDetailSymbol = Symbol('organization-import-detail');
  const scoOrganizationParticipantSymbol = Symbol('sco-organization-participant');
  const searchSymbol = Symbol('search');
  const divisionsSymbol = Symbol('divisions');
  const connectionTypesSymbol = Symbol('connectionTypes');
  const certificabilitySymbol = Symbol('certificability');
  const pageNumberSymbol = Symbol('pageNumber');
  const pageSizeSymbol = Symbol('pageSize');
  const participationCountOrderSymbol = Symbol('participationCountOrder');
  const lastnameSortSymbol = Symbol('lastnameSort');
  const divisionSortSymbol = Symbol('divisionSort');

  hooks.beforeEach(function () {
    route = this.owner.lookup('route:authenticated/sco-organization-participants/list');
    store = this.owner.lookup('service:store');
    route.currentUser = { shouldAccessImportPage: true, organization: { id: Symbol('organization-id') } };
    sinon
      .stub(store, 'queryRecord')
      .withArgs('organization-import-detail', {
        organizationId: route.currentUser.organization.id,
      })
      .resolves(importDetailSymbol);

    sinon
      .stub(store, 'query')
      .withArgs('sco-organization-participant', {
        filter: {
          organizationId: route.currentUser.organization.id,
          search: searchSymbol,
          divisions: divisionsSymbol,
          connectionTypes: connectionTypesSymbol,
          certificability: certificabilitySymbol,
        },
        sort: {
          participationCount: participationCountOrderSymbol,
          lastnameSort: lastnameSortSymbol,
          divisionSort: divisionSortSymbol,
        },
        page: {
          number: pageNumberSymbol,
          size: pageSizeSymbol,
        },
      })
      .resolves(scoOrganizationParticipantSymbol);
  });

  test('should return models', async function (assert) {
    // given
    const params = {
      search: searchSymbol,
      divisions: divisionsSymbol,
      connectionTypes: connectionTypesSymbol,
      certificability: certificabilitySymbol,
      pageNumber: pageNumberSymbol,
      pageSize: pageSizeSymbol,
      participationCountOrder: participationCountOrderSymbol,
      lastnameSort: lastnameSortSymbol,
      divisionSort: divisionSortSymbol,
    };

    // when
    const { participants, importDetail } = await route.model(params);

    // then
    assert.strictEqual(importDetail, importDetailSymbol);
    assert.strictEqual(participants, scoOrganizationParticipantSymbol);
  });
});
