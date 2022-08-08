import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import createGlimmerComponent from '../../../helpers/create-glimmer-component';
import ENV from 'pix-admin/config/environment';

module('Unit | Component | certification-center informations', function (hooks) {
  setupTest(hooks);

  let component;

  hooks.beforeEach(function () {
    component = createGlimmerComponent('component:certification-centers/information', {
      availableHabilitations: [],
      certificationCenter: {},
      updateCertificationCenter: () => {},
    });
  });

  module('#updateGrantedHabilitation', function () {
    test('it should add the habilitation to the certification center', function (assert) {
      // given
      const habilitation = { key: 'E', label: 'Pix+Surf' };

      component.form.habilitations = [];

      // when
      component.updateGrantedHabilitation(habilitation);

      // then
      assert.true(component.form.habilitations.includes(habilitation));
    });

    test('it should remove the habilitation from the certification center', function (assert) {
      // given
      const habilitation = { key: 'E', label: 'Pix+Surf' };

      component.form.habilitations = [habilitation];

      // when
      component.updateGrantedHabilitation(habilitation);

      // then
      assert.false(component.form.habilitations.includes(habilitation));
    });
  });

  test('it should generate link based on environment and object', async function (assert) {
    // given
    ENV.APP.CERTIFICATION_CENTER_DASHBOARD_URL = 'https://superdashboard?id=';
    component.args = { certificationCenter: { id: 7 } };

    // when & then
    assert.strictEqual(component.externalURL, 'https://superdashboard?id=7');
  });
});
