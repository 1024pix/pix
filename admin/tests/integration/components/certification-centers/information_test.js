import { module, test } from 'qunit';
import { render as renderScreen } from '@1024pix/ember-testing-library';
import { setupRenderingTest } from 'ember-qunit';
import { fillIn, render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import EmberObject from '@ember/object';
import ArrayProxy from '@ember/array/proxy';
import clickByLabel from '../../../helpers/extended-ember-test-helpers/click-by-label';
import fillInByLabel from '../../../helpers/extended-ember-test-helpers/fill-in-by-label';
import repeat from 'lodash/repeat';
import sinon from 'sinon';

function _createEmberDataHabilitations() {
  return ArrayProxy.create({
    content: [EmberObject.create({ id: 0, name: 'Pix+Droit' }), EmberObject.create({ id: 1, name: 'Cléa' })],
  });
}

module('Integration | Component | certification-centers/information', function (hooks) {
  setupRenderingTest(hooks);

  test('it should display label and values in read mode', async function (assert) {
    // given
    const availableHabilitations = _createEmberDataHabilitations();
    this.availableHabilitations = availableHabilitations;

    const certificationCenter = EmberObject.create({
      name: 'Centre SCO',
      type: 'SCO',
      externalId: 'AX129',
      habilitations: [availableHabilitations.firstObject],
    });
    this.certificationCenter = certificationCenter;

    // when
    const screen = await renderScreen(
      hbs`<CertificationCenters::Information
      @availableHabilitations={{this.availableHabilitations}}
      @certificationCenter={{this.certificationCenter}} />`
    );

    // then
    assert.contains('Type');
    assert.contains('Identifiant externe');
    assert.contains('Centre SCO');
    assert.contains('SCO');
    assert.contains('AX129');
    assert.dom(screen.getByLabelText('Habilité pour Pix+Droit')).exists();
    assert.dom(screen.getByLabelText('Non-habilité pour Cléa')).exists();
  });

  test('it enters edition mode when click on Edit button', async function (assert) {
    // given
    const certificationCenter = EmberObject.create({
      name: 'Centre SCO',
      type: 'SCO',
      externalId: 'AX129',
    });
    this.set('certificationCenter', certificationCenter);
    this.set('isEditMode', false);

    // when
    await render(
      hbs`<CertificationCenters::Information @certificationCenter={{this.certificationCenter}} @isEditMode={{this.isEditMode}} />`
    );
    await clickByLabel('Editer');

    // then
    assert.contains('Annuler');
    assert.contains('Enregistrer');
    assert.contains('Nom du centre');
  });

  test('it exits edition mode when click on Save button', async function (assert) {
    // given
    const certificationCenter = EmberObject.create({
      name: 'Centre SCO',
      type: 'SCO',
      externalId: 'AX129',
    });
    this.set('certificationCenter', certificationCenter);
    this.updateCertificationCenter = sinon.stub();

    // when
    await render(
      hbs`<CertificationCenters::Information
        @certificationCenter={{this.certificationCenter}}
        @updateCertificationCenter={{this.updateCertificationCenter}}
 />`
    );
    await clickByLabel('Editer');
    await clickByLabel('Enregistrer');

    // then
    assert.contains('Editer');
    assert.notContains('Annuler');
    assert.notContains('Enregistrer');
    assert.notContains('Nom du centre');
  });

  test('it exits edition mode when click on Cancel button', async function (assert) {
    // given
    const certificationCenter = EmberObject.create({
      name: 'Centre SCO',
      type: 'SCO',
      externalId: 'AX129',
    });
    this.set('certificationCenter', certificationCenter);

    // when
    await render(hbs`<CertificationCenters::Information @certificationCenter={{this.certificationCenter}} />`);
    await clickByLabel('Editer');

    await clickByLabel('Annuler');

    // then
    assert.contains('Editer');
    assert.notContains('Annuler');
    assert.notContains('Enregistrer');
    assert.notContains('Nom du centre');
  });

  test('it renders the certification center information component in edit mode', async function (assert) {
    // given
    const availableHabilitations = _createEmberDataHabilitations();
    this.availableHabilitations = availableHabilitations;

    const certificationCenter = EmberObject.create({
      name: 'Centre SCO',
      type: 'SCO',
      externalId: 'AX129',
      habilitations: [availableHabilitations.firstObject],
    });
    this.set('certificationCenter', certificationCenter);

    // when
    const screen = await renderScreen(
      hbs`<CertificationCenters::Information @availableHabilitations={{this.availableHabilitations}} @certificationCenter={{this.certificationCenter}} />`
    );
    await clickByLabel('Editer');

    // then
    assert.dom(screen.getByRole('heading', { name: 'Modifier un centre de certification' })).exists();
    assert.dom('input#name').hasValue('Centre SCO');
    assert.dom('select#certification-center-type').hasValue('SCO');
    assert.dom('input#external-id').hasValue('AX129');
    assert.dom(screen.getByLabelText('Pix+Droit')).isChecked();
    assert.dom(screen.getByLabelText('Cléa')).isNotChecked();
  });

  test('it rejects invalid output on name', async function (assert) {
    // given
    const certificationCenter = EmberObject.create({
      name: 'Centre SCO',
      type: 'SCO',
      externalId: 'AX129',
    });
    this.set('certificationCenter', certificationCenter);

    // when
    await render(hbs`<CertificationCenters::Information @certificationCenter={{this.certificationCenter}} />`);

    await clickByLabel('Editer');
    await fillIn('#name', repeat('a', 256));

    // then
    assert.contains('La longueur du nom ne doit pas excéder 255 caractères');
  });

  test('it should reject empty name', async function (assert) {
    // given
    const certificationCenter = EmberObject.create({
      name: 'Centre SCO',
      type: 'SCO',
      externalId: 'AX129',
    });
    this.set('certificationCenter', certificationCenter);

    // when
    await render(hbs`<CertificationCenters::Information @certificationCenter={{this.certificationCenter}} />`);

    await clickByLabel('Editer');
    await fillIn('#name', '');

    // then
    assert.contains('Le nom ne peut pas être vide');
  });

  test('it rejects invalid output on externalId', async function (assert) {
    // given
    const certificationCenter = EmberObject.create({
      name: 'Centre SCO',
      type: 'SCO',
      externalId: 'AX129',
    });
    this.set('certificationCenter', certificationCenter);

    // when
    await render(hbs`<CertificationCenters::Information @certificationCenter={{this.certificationCenter}} />`);

    await clickByLabel('Editer');
    await fillIn('#external-id', repeat('a', 256));

    // then
    assert.contains("La longueur de l'identifiant externe ne doit pas excéder 255 caractères");
  });

  test('it should call updateCertificationCenter with certification center data on save', async function (assert) {
    // given
    const availableHabilitations = _createEmberDataHabilitations();
    this.availableHabilitations = availableHabilitations;
    const certificationCenter = EmberObject.create({
      name: 'Centre SCO',
      type: 'SCO',
      externalId: 'AX129',
      habilitations: [],
    });

    this.set('certificationCenter', certificationCenter);
    this.updateCertificationCenter = sinon.stub();
    await renderScreen(
      hbs`<CertificationCenters::Information
        @availableHabilitations={{this.availableHabilitations}}
        @updateCertificationCenter={{this.updateCertificationCenter}}
        @certificationCenter={{this.certificationCenter}} />`
    );

    await clickByLabel('Editer');
    await fillInByLabel('Nom du centre', 'Centre SUP');
    await fillInByLabel('Type', 'SUP');
    await fillInByLabel('Identifiant externe', 'externalId');
    await clickByLabel('Pix+Droit');

    // when
    await clickByLabel('Enregistrer');

    // then
    sinon.assert.calledWithExactly(this.updateCertificationCenter, {
      habilitations: [availableHabilitations.firstObject],
      externalId: 'externalId',
      name: 'Centre SUP',
      type: 'SUP',
    });
    assert.ok(true);
  });

  test('it should not call updateCertificationCenter and discard user input on cancel', async function (assert) {
    // given
    const availableHabilitations = _createEmberDataHabilitations();
    this.availableHabilitations = availableHabilitations;
    const certificationCenter = EmberObject.create({
      name: 'Centre SCO',
      type: 'SCO',
      externalId: 'AX129',
      habilitations: [availableHabilitations.firstObject],
    });
    this.set('certificationCenter', certificationCenter);
    this.updateCertificationCenter = sinon.stub();

    // when
    const screen = await renderScreen(
      hbs`<CertificationCenters::Information
        @certificationCenter={{this.certificationCenter}}
        @availableHabilitations={{this.availableHabilitations}}
        @updateCertificationCenter={{this.updateCertificationCenter}} />`
    );

    await clickByLabel('Editer');
    await fillIn('#name', 'Centre SUP');
    await fillIn('#certification-center-type', 'SUP');
    await fillIn('#external-id', 'externalId');
    await clickByLabel('Cléa');
    await clickByLabel('Annuler');

    // then
    sinon.assert.notCalled(this.updateCertificationCenter);
    assert.contains('Centre SCO');
    assert.contains('SCO');
    assert.contains('AX129');
    assert.dom(screen.getByLabelText('Habilité pour Pix+Droit')).exists();
    assert.dom(screen.getByLabelText('Non-habilité pour Cléa')).exists();
  });
});
