import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import createGlimmerComponent from '../../../helpers/create-glimmer-component';
import sinon from 'sinon';

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

  module('#updateGrantedHabilitation', function () {
    test('it should add the habilitation to the certification center', function (assert) {
      // given
      const habilitation = store.createRecord('complementary-certification', { key: 'E', label: 'Pix+Surf' });

      component.form.habilitations = [];

      // when
      component.updateGrantedHabilitation(habilitation);

      // then
      assert.true(component.form.habilitations.includes(habilitation));
    });

    test('it should remove the habilitation from the certification center', function (assert) {
      // given
      const habilitation = store.createRecord('complementary-certification', { key: 'E', label: 'Pix+Surf' });

      component.form.habilitations = [habilitation];

      // when
      component.updateGrantedHabilitation(habilitation);

      // then
      assert.false(component.form.habilitations.includes(habilitation));
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

  module('#updateCertificationCenter', function () {
    test('it should update the certification center data', async function (assert) {
      // given
      component.form.name = '67W';
      component.form.type = 'My Type';
      component.form.dataProtectionOfficerFirstName = 'Justin';
      component.form.dataProtectionOfficerLastName = 'Ptipeu';
      component.form.dataProtectionOfficerEmail = 'justin.ptipeu@example.net';
      component.form.isV3Pilot = true;

      // when
      await component.updateCertificationCenter({ preventDefault: sinon.stub() });

      // then
      assert.strictEqual(component.args.certificationCenter.name, '67W');
      assert.strictEqual(component.args.certificationCenter.dataProtectionOfficerFirstName, 'Justin');
      assert.strictEqual(component.args.certificationCenter.dataProtectionOfficerLastName, 'Ptipeu');
      assert.strictEqual(component.args.certificationCenter.dataProtectionOfficerEmail, 'justin.ptipeu@example.net');
      assert.true(component.args.certificationCenter.isV3Pilot);
    });
  });
});
