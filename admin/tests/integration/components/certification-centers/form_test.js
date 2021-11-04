import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, fillIn } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import EmberObject from '@ember/object';
import { A as EmberArray } from '@ember/array';
import clickByLabel from '../../../helpers/extended-ember-test-helpers/click-by-label';

module('Integration | Component | certification-centers/form', function (hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function () {
    this.onSubmit = () => {};
    this.onCancel = () => {};
    this.certificationCenter = EmberObject.create();
  });

  test('it renders the new certification center form component', async function (assert) {
    // when
    await render(
      hbs`<CertificationCenters::Form @certificationCenter={{this.certificationCenter}} @onSubmit={{this.onSubmit}} @onCancel={{this.onCancel}} />`
    );

    // then
    assert.contains('Nom du centre');
    assert.contains("Type d'établissement");
    assert.contains('Identifiant externe');
    assert.contains('Annuler');
    assert.contains('Ajouter');
  });

  module('#selectCertificationCenterType', function () {
    test('should update attribute certificationCenter.type', async function (assert) {
      // given
      await render(
        hbs`<CertificationCenters::Form @certificationCenter={{this.certificationCenter}} @onSubmit={{this.onSubmit}} @onCancel={{this.onCancel}} />`
      );

      // when
      await fillIn('#certificationCenterTypeSelector', 'SCO');

      // then
      assert.equal(this.certificationCenter.type, 'SCO');
    });
  });

  module('#updateGrantedAccreditation', function () {
    test('should add accreditation to certification center on checked checkbox', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const accreditation1 = store.createRecord('accreditation', { name: 'accreditation 1' });
      const accreditation2 = store.createRecord('accreditation', { name: 'accreditation 2' });
      this.certificationCenter = store.createRecord('certification-center');
      this.accreditations = EmberArray([accreditation1, accreditation2]);
      this.stub = () => {};

      await render(
        hbs`<CertificationCenters::Form @certificationCenter={{this.certificationCenter}} @accreditations={{this.accreditations}} @onSubmit={{this.stub}} @onCancel={{this.stub}} />`
      );

      // when
      await clickByLabel('accreditation 2');

      // then
      assert.ok(this.certificationCenter.accreditations.includes(accreditation2));
    });

    test('should remove accreditation to certification center on unchecked checkbox', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const accreditation1 = store.createRecord('accreditation', { name: 'accreditation 1' });
      const accreditation2 = store.createRecord('accreditation', { name: 'accreditation 2' });
      this.certificationCenter = store.createRecord('certification-center', {
        accreditations: [accreditation2],
      });
      this.accreditations = EmberArray([accreditation1, accreditation2]);
      this.stub = () => {};

      await render(
        hbs`<CertificationCenters::Form @certificationCenter={{this.certificationCenter}} @accreditations={{this.accreditations}} @onSubmit={{this.stub}} @onCancel={{this.stub}} />`
      );

      // when
      await clickByLabel('accreditation 2');

      // then
      assert.notOk(this.certificationCenter.accreditations.includes(accreditation2));
    });
  });
});
