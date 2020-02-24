import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | routes/authenticated/organizations | list-items', function(hooks) {

  setupRenderingTest(hooks);

  test('it should display organization list', async function(assert) {
    // given
    const organizations = [
      { id: 1, name: 'École ACME', type: 'SCO', code: 'ORGA1' },
      { id: 2, name: 'Université BROS', type: 'SUP', code: 'ORGA2' },
      { id: 3, name: 'Entreprise KSSOS', type: 'PRO', code: 'ORGA3' },
    ];
    organizations.meta = {
      rowCount: 3
    };
    const triggerFiltering = function() {};
    const goToOrganizationPage = function() {};

    this.set('organizations', organizations);
    this.set('triggerFiltering', triggerFiltering);
    this.set('goToOrganizationPage', goToOrganizationPage);

    // when
    await render(hbs`{{routes/authenticated/organizations/list-items organizations=organizations triggerFiltering=triggerFiltering goToOrganizationPage=goToOrganizationPage}}`);

    // then
    assert.dom('table tbody tr:first-child td:first-child').hasText('École ACME');
    assert.dom('table tbody tr:first-child td:nth-child(2)').hasText('SCO');
    assert.dom('table tbody tr:first-child td:nth-child(3)').hasText('ORGA1');
    assert.dom('table tbody tr').exists({ count: 3 });
  });
});
