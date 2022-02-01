import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import createGlimmerComponent from '../../../helpers/create-glimmer-component';

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
      const cleaHabilitation = { name: 'Pix+clea' };

      component.form.habilitations = [];

      // when
      component.updateGrantedHabilitation(cleaHabilitation);

      // then
      assert.true(component.form.habilitations.includes(cleaHabilitation));
    });

    test('it should remove the habilitation from the certification center', function (assert) {
      // given
      const pixSurfHabilitation = { name: 'Pix+Surf' };

      component.form.habilitations = [pixSurfHabilitation];

      // when
      component.updateGrantedHabilitation(pixSurfHabilitation);

      // then
      assert.false(component.form.habilitations.includes(pixSurfHabilitation));
    });
  });
});
