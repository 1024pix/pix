import { render } from '@ember/test-helpers';
import ListItems from 'pix-admin/components/organizations/list-items';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../../../../helpers/setup-intl-rendering';

module('Integration | Component | routes/authenticated/organizations | list-items', function (hooks) {
  setupIntlRenderingTest(hooks);

  hooks.beforeEach(async function () {
    const currentUser = this.owner.lookup('service:currentUser');
    currentUser.adminMember = { isSuperAdmin: true };
  });

  const triggerFiltering = function () {};

  test('it should display header with id, name, type and externalId', async function (assert) {
    // when
    await render(<template><ListItems @triggerFiltering={{triggerFiltering}} /></template>);

    // then
    assert.dom('table thead tr:first-child th:first-child').hasText('ID');
    assert.dom('table thead tr:first-child th:nth-child(2)').hasText('Nom');
    assert.dom('table thead tr:first-child th:nth-child(3)').hasText('Type');
    assert.dom('table thead tr:first-child th:nth-child(4)').hasText('Identifiant externe');
  });

  test('if should display search inputs', async function (assert) {
    // when
    await render(<template><ListItems @triggerFiltering={{triggerFiltering}} /></template>);

    // then
    assert.dom('table thead tr:nth-child(2) input#id').exists();
    assert.dom('table thead tr:nth-child(2) input#name').exists();
    assert.dom('table thead tr:nth-child(2) input#type').exists();
    assert.dom('table thead tr:nth-child(2) input#externalId').exists();
  });

  test('it should display organization list', async function (assert) {
    // given
    const externalId = '1234567A';
    const organizations = [
      { id: 1, name: 'École ACME', type: 'SCO', externalId },
      { id: 2, name: 'Université BROS', type: 'SUP', externalId },
      { id: 3, name: 'Entreprise KSSOS', type: 'PRO', externalId },
    ];
    organizations.meta = {
      rowCount: 3,
    };

    // when
    await render(
      <template><ListItems @organizations={{organizations}} @triggerFiltering={{triggerFiltering}} /></template>,
    );

    // then
    assert.dom('table tbody tr:first-child td:first-child').hasText('1');
    assert.dom('table tbody tr:first-child td:nth-child(2)').hasText('École ACME');
    assert.dom('table tbody tr:first-child td:nth-child(3)').hasText('SCO');
    assert.dom('table tbody tr:first-child td:nth-child(4)').hasText(externalId);
    assert.dom('table tbody tr').exists({ count: 3 });
  });
});
