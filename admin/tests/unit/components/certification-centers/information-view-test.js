import { setupTest } from 'ember-qunit';
import ENV from 'pix-admin/config/environment';
import { module, test } from 'qunit';

import createGlimmerComponent from '../../../helpers/create-glimmer-component';

module('Unit | Component | certification-centers/information-view', function (hooks) {
  setupTest(hooks);

  module('#availableHabilitations', function () {
    test('it should return a sorted list of available habilitations', async function (assert) {
      // given
      const component = createGlimmerComponent('component:certification-centers/information-view', {
        availableHabilitations: [{ id: 321 }, { id: 21 }, { id: 1 }],
        certificationCenter: { id: 1 },
      });

      // when & then
      assert.strictEqual(component.availableHabilitations.length, 3);
      assert.strictEqual(component.availableHabilitations[0].id, 1);
      assert.strictEqual(component.availableHabilitations[2].id, 321);
    });
  });

  module('#externalURL', function () {
    test('it should generate link based on environment and object', async function (assert) {
      // given
      const component = createGlimmerComponent('component:certification-centers/information-view', {
        availableHabilitations: [],
        certificationCenter: {},
      });
      ENV.APP.CERTIFICATION_CENTER_DASHBOARD_URL = 'https://superdashboard?id=';
      component.args = { certificationCenter: { id: 7 } };

      // when & then
      assert.strictEqual(component.externalURL, 'https://superdashboard?id=7');
    });
  });
});
