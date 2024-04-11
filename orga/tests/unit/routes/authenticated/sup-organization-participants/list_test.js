import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Unit | Route | authenticated/sup-organization-participants/list', function (hooks) {
  setupTest(hooks);
  let route;
  let store;
  const importDetailSymbol = Symbol('organization-import-detail');
  const supOrganizationParticipantSymbol = Symbol('sup-organization-participant');
  const searchSymbol = Symbol('search');
  const studentNumberSymbol = Symbol('studentNumber');
  const groupsSymbol = Symbol('groups');
  const certificabilitySymbol = Symbol('certificability');
  const pageNumberSymbol = Symbol('pageNumber');
  const pageSizeSymbol = Symbol('pageSize');
  const participationCountSymbol = Symbol('participationCountOrder');
  const lastnameSortSymbol = Symbol('lastnameSort');

  hooks.beforeEach(function () {
    route = this.owner.lookup('route:authenticated/sup-organization-participants/list');
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
      .withArgs('sup-organization-participant', {
        filter: {
          organizationId: route.currentUser.organization.id,
          search: searchSymbol,
          studentNumber: studentNumberSymbol,
          groups: groupsSymbol,
          certificability: certificabilitySymbol,
        },
        sort: {
          participationCount: participationCountSymbol,
          lastnameSort: lastnameSortSymbol,
        },
        page: {
          number: pageNumberSymbol,
          size: pageSizeSymbol,
        },
      })
      .resolves(supOrganizationParticipantSymbol);
  });

  test('should return models', async function (assert) {
    // given
    const params = {
      search: searchSymbol,
      studentNumber: studentNumberSymbol,
      groups: groupsSymbol,
      certificability: certificabilitySymbol,
      pageNumber: pageNumberSymbol,
      pageSize: pageSizeSymbol,
      participationCountOrder: participationCountSymbol,
      lastnameSort: lastnameSortSymbol,
    };

    // when
    const { participants, importDetail } = await route.model(params);

    // then
    assert.strictEqual(importDetail, importDetailSymbol);
    assert.strictEqual(participants, supOrganizationParticipantSymbol);
  });
});
