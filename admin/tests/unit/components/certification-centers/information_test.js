import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import createGlimmerComponent from '../../../helpers/create-glimmer-component';

module('Unit | Component | certification-center informations', function (hooks) {
  setupTest(hooks);

  let component;

  hooks.beforeEach(function () {
    component = createGlimmerComponent('component:certification-centers/information', {
      availableAccreditations: [],
      certificationCenter: {},
      updateCertificationCenter: () => {},
    });
  });

  module('#updateGrantedAccreditation', function () {
    test('it should add the accreditation to the certification center', function (assert) {
      // given
      const cleaAccreditation = { name: 'Pix+clea' };

      component.form.accreditations = [];

      // when
      component.updateGrantedAccreditation(cleaAccreditation);

      // then
      assert.true(component.form.accreditations.includes(cleaAccreditation));
    });

    test('it should remove the accreditation from the certification center', function (assert) {
      // given
      const pixSurfAccreditation = { name: 'Pix+Surf' };

      component.form.accreditations = [pixSurfAccreditation];

      // when
      component.updateGrantedAccreditation(pixSurfAccreditation);

      // then
      assert.false(component.form.accreditations.includes(pixSurfAccreditation));
    });
  });
});
