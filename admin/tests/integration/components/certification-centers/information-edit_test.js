import { module, test } from 'qunit';
import { render, fillByLabel } from '@1024pix/ember-testing-library';
import { setupRenderingTest } from 'ember-qunit';
import { hbs } from 'ember-cli-htmlbars';
import EmberObject from '@ember/object';
import sinon from 'sinon';
import { click } from '@ember/test-helpers';

module('Integration | Component | certification-centers/information-edit', function (hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function () {
    const certificationCenter = EmberObject.create('certification-center', {
      name: 'Centre SCO',
      type: 'SCO',
      externalId: 'AX129',
      isSupervisorAccessEnabled: false,
    });

    this.set('certificationCenter', certificationCenter);
    this.toggleEditModeStub = sinon.stub();
    this.onSubmit = sinon.stub();
  });

  module('certification center edit form validation', function () {
    test("it should show an error message if certification center's name is empty", async function (assert) {
      // given
      const screen = await render(
        hbs`<CertificationCenters::InformationEdit @certificationCenter={{this.certificationCenter}} />`
      );

      // when
      await fillByLabel('Nom du centre', '');

      // then
      assert.dom(screen.getByText('Le nom ne peut pas être vide')).exists();
    });

    test("it should show an error message if certification center's name is longer than 255 characters", async function (assert) {
      // given
      const screen = await render(
        hbs`<CertificationCenters::InformationEdit @certificationCenter={{this.certificationCenter}} />`
      );

      // when
      await fillByLabel('Nom du centre', 'a'.repeat(256));

      // then
      assert.dom(screen.getByText('La longueur du nom ne doit pas excéder 255 caractères')).exists();
    });

    test("it should show an error message if certification center's type is empty", async function (assert) {
      // given
      const screen = await render(
        hbs`<CertificationCenters::InformationEdit @certificationCenter={{this.certificationCenter}} />`
      );

      // when
      await fillByLabel('Type', '');

      // then
      assert.dom(screen.getByText('Le type ne peut pas être vide')).exists();
    });

    test("it should show an error message if certification center's externalId is longer than 255 characters", async function (assert) {
      // given
      const screen = await render(
        hbs`<CertificationCenters::InformationEdit @certificationCenter={{this.certificationCenter}} />`
      );

      // when
      await fillByLabel('Identifiant externe', 'a'.repeat(256));

      // then
      assert.dom(screen.getByText("La longueur de l'identifiant externe ne doit pas excéder 255 caractères")).exists();
    });
  });

  module('certification center edit form actions', function () {
    module('#cancel', function () {
      test('it should cancel the edition', async function (assert) {
        // given
        const screen = await render(
          hbs`<CertificationCenters::InformationEdit
          @certificationCenter={{this.certificationCenter}}
          @toggleEditMode={{this.toggleEditModeStub}}
          />`
        );

        // when
        await click(screen.getByRole('button', { name: 'Annuler' }));

        // then
        sinon.assert.calledOnce(this.toggleEditModeStub);
        assert.ok(true);
      });
    });

    module('#save', function () {
      test('it should save the certification center data', async function (assert) {
        // given
        const screen = await render(
          hbs`<CertificationCenters::InformationEdit
          @certificationCenter={{this.certificationCenter}}
          @toggleEditMode={{this.toggleEditModeStub}}
          @onSubmit={{this.onSubmit}}
          />`
        );

        // when
        await click(screen.getByRole('button', { name: 'Enregistrer' }));

        // then
        sinon.assert.calledOnce(this.onSubmit);
        assert.ok(true);
      });
    });
  });
});
