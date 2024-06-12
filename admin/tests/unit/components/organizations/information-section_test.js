import { setupTest } from 'ember-qunit';
import ENV from 'pix-admin/config/environment';
import { module, test } from 'qunit';

import createGlimmerComponent from '../../../helpers/create-glimmer-component';

module('Unit | Component | organizations/information-section', function (hooks) {
  setupTest(hooks);

  test('it should generate link based on environment and object', async function (assert) {
    // given
    const component = createGlimmerComponent('component:organizations/information-section-view', {
      organization: { id: 1, tags: [] },
    });
    ENV.APP.ORGANIZATION_DASHBOARD_URL = 'https://metabase.pix.fr/dashboard/137/?id=';

    // when & then
    assert.strictEqual(component.externalURL, 'https://metabase.pix.fr/dashboard/137/?id=1');
  });
});
