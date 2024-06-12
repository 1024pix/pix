import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

import createGlimmerComponent from '../../../helpers/create-glimmer-component';

module('Unit | Component | certification-centers/information-edit', function (hooks) {
  setupTest(hooks);

  let component, store;

  hooks.beforeEach(function () {
    store = this.owner.lookup('service:store');
    component = createGlimmerComponent('component:certification-centers/information-edit', {
      availableHabilitations: [],
      certificationCenter: store.createRecord('certification-center'),
      onSubmit: sinon.stub(),
      toggleEditMode: sinon.stub(),
    });
  });

  module('#updateIsV3Pilot', function () {
    test('should add isV3Pilot to certification center on checked checkbox', async function (assert) {
      // given
      component.form.isV3Pilot = false;

      // when
      component.updateIsV3Pilot({ target: { checked: true } });

      // then
      assert.true(component.form.isV3Pilot);
    });

    test('should remove isV3Pilot to certification center on unchecked checkbox', async function (assert) {
      // given
      component.form.isV3Pilot = true;

      // when
      component.updateIsV3Pilot({ target: { checked: false } });

      // then
      assert.false(component.form.isV3Pilot);
    });
  });

  module('#availableHabilitations', function () {
    test('it should return a sorted list of available habilitations', async function (assert) {
      // given
      const component = createGlimmerComponent('component:certification-centers/information-edit', {
        availableHabilitations: [{ id: 321 }, { id: 21 }, { id: 1 }],
        certificationCenter: {
          id: 1,
          getProperties: sinon.stub().returns({}),
          habilitations: [],
        },
        onSubmit: sinon.stub(),
      });

      // when & then
      assert.strictEqual(component.availableHabilitations.length, 3);
      assert.strictEqual(component.availableHabilitations[0].id, 1);
      assert.strictEqual(component.availableHabilitations[2].id, 321);
    });
  });

  module('#selectCertificationCenterType', function () {
    test('it should update the certification center type', function (assert) {
      // given & when
      component.selectCertificationCenterType('My Super Duper Type');

      // then
      assert.strictEqual(component.form.type, 'My Super Duper Type');
    });
  });
});
