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
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line qunit/no-assert-equal
      assert.equal(this.certificationCenter.type, 'SCO');
    });
  });

  module('#updateGrantedHabilitation', function () {
    test('should add habilitation to certification center on checked checkbox', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const habilitation1 = store.createRecord('habilitation', { name: 'habilitation 1' });
      const habilitation2 = store.createRecord('habilitation', { name: 'habilitation 2' });
      this.certificationCenter = store.createRecord('certification-center');
      this.habilitations = EmberArray([habilitation1, habilitation2]);
      this.stub = () => {};

      await render(
        hbs`<CertificationCenters::Form @certificationCenter={{this.certificationCenter}} @habilitations={{this.habilitations}} @onSubmit={{this.stub}} @onCancel={{this.stub}} />`
      );

      // when
      await clickByLabel('habilitation 2');

      // then
      assert.ok(this.certificationCenter.habilitations.includes(habilitation2));
    });

    test('should remove habilitation to certification center on unchecked checkbox', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const habilitation1 = store.createRecord('habilitation', { name: 'habilitation 1' });
      const habilitation2 = store.createRecord('habilitation', { name: 'habilitation 2' });
      this.certificationCenter = store.createRecord('certification-center', {
        habilitations: [habilitation2],
      });
      this.habilitations = EmberArray([habilitation1, habilitation2]);
      this.stub = () => {};

      await render(
        hbs`<CertificationCenters::Form @certificationCenter={{this.certificationCenter}} @habilitations={{this.habilitations}} @onSubmit={{this.stub}} @onCancel={{this.stub}} />`
      );

      // when
      await clickByLabel('habilitation 2');

      // then
      assert.notOk(this.certificationCenter.habilitations.includes(habilitation2));
    });
  });
});
