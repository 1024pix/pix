import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { find } from '@ember/test-helpers';
import { clickByName, render, selectByLabelAndOption } from '@1024pix/ember-testing-library';
import hbs from 'htmlbars-inline-precompile';
import EmberObject from '@ember/object';
import { A as EmberArray } from '@ember/array';

module('Integration | Component | certification-centers/form', function (hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function () {
    this.onSubmit = () => {};
    this.onCancel = () => {};
    this.certificationCenter = EmberObject.create({ isSupervisorAccessEnabled: true });
  });

  test('it renders the new certification center form component', async function (assert) {
    // when
    const screen = await render(
      hbs`<CertificationCenters::Form @certificationCenter={{this.certificationCenter}} @onSubmit={{this.onSubmit}} @onCancel={{this.onCancel}} />`
    );

    // then
    assert.dom(screen.getByText('Nom du centre')).exists();
    assert.dom(screen.getByText("Type d'établissement")).exists();
    assert.dom(screen.getByText('Identifiant externe')).exists();
    assert.true(find('#supervisor-portal').checked);
    assert.dom(screen.getByRole('button', { name: 'Annuler' })).exists();
    assert.dom(screen.getByText('Ajouter')).exists();
  });

  module('#selectCertificationCenterType', function () {
    test('should update attribute certificationCenter.type', async function (assert) {
      // given
      await render(
        hbs`<CertificationCenters::Form @certificationCenter={{this.certificationCenter}} @onSubmit={{this.onSubmit}} @onCancel={{this.onCancel}} />`
      );

      // when
      await selectByLabelAndOption("Type d'établissement", 'SCO');

      // then
      assert.strictEqual(this.certificationCenter.type, 'SCO');
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
      await clickByName('habilitation 2');

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
      await clickByName('habilitation 2');

      // then
      assert.notOk(this.certificationCenter.habilitations.includes(habilitation2));
    });
  });
});
