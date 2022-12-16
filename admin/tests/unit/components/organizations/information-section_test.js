import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import createGlimmerComponent from '../../../helpers/create-glimmer-component';
import ENV from 'pix-admin/config/environment';

module('Unit | Component | organizations/information-section', function (hooks) {
  setupTest(hooks);

  test('it should generate link based on environment and object', async function (assert) {
    // given
    const component = createGlimmerComponent('component:organizations/information-section-view');
    ENV.APP.ORGANIZATION_DASHBOARD_URL = 'https://metabase.pix.fr/dashboard/137/?id=';
    component.args = { organization: { id: 1 } };

    // when & then
    assert.strictEqual(component.externalURL, 'https://metabase.pix.fr/dashboard/137/?id=1');
  });
});
