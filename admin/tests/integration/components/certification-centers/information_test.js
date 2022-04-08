import { module, test } from 'qunit';
import { render, fillByLabel, clickByName } from '@1024pix/ember-testing-library';
import { setupRenderingTest } from 'ember-qunit';
import { fillIn } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import EmberObject from '@ember/object';
import ArrayProxy from '@ember/array/proxy';
import repeat from 'lodash/repeat';
import sinon from 'sinon';

function _createEmberDataHabilitations(store) {
  return ArrayProxy.create({
    content: [
      store.createRecord('habilitation', { id: 0, name: 'Pix+Droit' }),
      store.createRecord('habilitation', { id: 1, name: 'Cléa' }),
    ],
  });
}

module('Integration | Component | certification-centers/information', function (hooks) {
  setupRenderingTest(hooks);

  test('it should display label and values in read mode', async function (assert) {
    // given
    const store = this.owner.lookup('service:store');
    const availableHabilitations = _createEmberDataHabilitations(store);
    this.availableHabilitations = availableHabilitations;

    const certificationCenter = store.createRecord('certification-center', {
      name: 'Centre SCO',
      type: 'SCO',
      externalId: 'AX129',
      isSupervisorAccessEnabled: false,
      habilitations: [availableHabilitations.firstObject],
    });
    this.certificationCenter = certificationCenter;

    // when
    const screen = await render(
      hbs`<CertificationCenters::Information
      @availableHabilitations={{this.availableHabilitations}}
      @certificationCenter={{this.certificationCenter}} />`
    );

    // then
    assert.dom(screen.getByText('Type :')).exists();
    assert.dom(screen.getByText('Identifiant externe :')).exists();
    assert.dom(screen.getByText('Centre SCO')).exists();
    assert.dom(screen.getByText('AX129')).exists();
    assert.strictEqual(screen.getByLabelText('Espace surveillant').textContent, 'non');
    assert.dom(screen.getByLabelText('Habilité pour Pix+Droit')).exists();
    assert.dom(screen.getByLabelText('Non-habilité pour Cléa')).exists();
  });

  test('it enters edition mode when click on Edit button', async function (assert) {
    // given
    const store = this.owner.lookup('service:store');
    const certificationCenter = store.createRecord('certification-center', {
      name: 'Centre SCO',
      type: 'SCO',
      externalId: 'AX129',
      isSupervisorAccessEnabled: false,
    });
    this.set('certificationCenter', certificationCenter);
    this.set('isEditMode', false);

    // when
    const screen = await render(
      hbs`<CertificationCenters::Information @certificationCenter={{this.certificationCenter}} @isEditMode={{this.isEditMode}} />`
    );
    await clickByName('Editer');

    // then
    assert.dom(screen.getByRole('button', { name: 'Annuler' })).exists();
    assert.dom(screen.getByRole('button', { name: 'Enregistrer' })).exists();
    assert.dom(screen.getByText('Nom du centre')).exists();
  });

  test('it exits edition mode when click on Save button', async function (assert) {
    // given
    const store = this.owner.lookup('service:store');
    const certificationCenter = store.createRecord('certification-center', {
      name: 'Centre SCO',
      type: 'SCO',
      externalId: 'AX129',
      isSupervisorAccessEnabled: false,
    });
    this.set('certificationCenter', certificationCenter);
    this.updateCertificationCenter = sinon.stub();

    // when
    const screen = await render(
      hbs`<CertificationCenters::Information
        @certificationCenter={{this.certificationCenter}}
        @updateCertificationCenter={{this.updateCertificationCenter}}
 />`
    );
    await clickByName('Editer');
    await clickByName('Enregistrer');

    // then
    assert.dom(screen.getByText('Editer les informations')).exists();
    assert.dom(screen.queryByText('Annuler')).doesNotExist();
    assert.dom(screen.queryByText('Enregistrer')).doesNotExist();
    assert.dom(screen.queryByText('Nom du centre')).doesNotExist();
  });

  test('it exits edition mode when click on Cancel button', async function (assert) {
    // given
    const store = this.owner.lookup('service:store');
    const certificationCenter = store.createRecord('certification-center', {
      name: 'Centre SCO',
      type: 'SCO',
      externalId: 'AX129',
      isSupervisorAccessEnabled: false,
    });
    this.set('certificationCenter', certificationCenter);

    // when
    const screen = await render(
      hbs`<CertificationCenters::Information @certificationCenter={{this.certificationCenter}} />`
    );
    await clickByName('Editer');

    await clickByName('Annuler');

    // then
    assert.dom(screen.getByText('Editer les informations')).exists();
    assert.dom(screen.queryByText('Annuler')).doesNotExist();
    assert.dom(screen.queryByText('Enregistrer')).doesNotExist();
    assert.dom(screen.queryByText('Nom du centre')).doesNotExist();
  });

  test('it renders the certification center information component in edit mode', async function (assert) {
    // given
    const store = this.owner.lookup('service:store');
    const availableHabilitations = _createEmberDataHabilitations(store);
    this.availableHabilitations = availableHabilitations;

    const certificationCenter = store.createRecord('certification-center', {
      name: 'Centre SCO',
      type: 'SCO',
      externalId: 'AX129',
      isSupervisorAccessEnabled: false,
      habilitations: [availableHabilitations.firstObject],
    });
    this.set('certificationCenter', certificationCenter);

    // when
    const screen = await render(
      hbs`<CertificationCenters::Information @availableHabilitations={{this.availableHabilitations}} @certificationCenter={{this.certificationCenter}} />`
    );
    await clickByName('Editer');

    // then
    assert.dom(screen.getByRole('heading', { name: 'Modifier un centre de certification' })).exists();
    assert.dom('input#name').hasValue('Centre SCO');
    assert.dom('select#certification-center-type').hasValue('SCO');
    assert.dom('input#external-id').hasValue('AX129');
    assert.dom(screen.getByLabelText('Espace surveillant')).isNotChecked();
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
    const screen = await render(
      hbs`<CertificationCenters::Information @certificationCenter={{this.certificationCenter}} />`
    );

    await clickByName('Editer');
    await fillIn('#name', repeat('a', 256));

    // then
    assert.dom(screen.getByText('La longueur du nom ne doit pas excéder 255 caractères')).exists();
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
    const screen = await render(
      hbs`<CertificationCenters::Information @certificationCenter={{this.certificationCenter}} />`
    );

    await clickByName('Editer');
    await fillIn('#name', '');

    // then
    assert.dom(screen.getByText('Le nom ne peut pas être vide')).exists();
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
    const screen = await render(
      hbs`<CertificationCenters::Information @certificationCenter={{this.certificationCenter}} />`
    );

    await clickByName('Editer');
    await fillIn('#external-id', repeat('a', 256));

    // then
    assert.dom(screen.getByText("La longueur de l'identifiant externe ne doit pas excéder 255 caractères")).exists();
  });

  test('it should call updateCertificationCenter with certification center data on save', async function (assert) {
    // given
    const store = this.owner.lookup('service:store');
    const availableHabilitations = _createEmberDataHabilitations(store);
    this.availableHabilitations = availableHabilitations;
    const certificationCenter = store.createRecord('certification-center', {
      name: 'Centre SCO',
      type: 'SCO',
      externalId: 'AX129',
      habilitations: [],
      isSupervisorAccessEnabled: false,
    });

    this.set('certificationCenter', certificationCenter);
    this.updateCertificationCenter = sinon.stub();
    await render(
      hbs`<CertificationCenters::Information
        @availableHabilitations={{this.availableHabilitations}}
        @updateCertificationCenter={{this.updateCertificationCenter}}
        @certificationCenter={{this.certificationCenter}} />`
    );

    await clickByName('Editer');
    await fillByLabel('Nom du centre', 'Centre SUP');
    await fillByLabel('Type', 'SUP');
    await fillByLabel('Identifiant externe', 'externalId');
    await clickByName('Espace surveillant');
    await clickByName('Pix+Droit');

    // when
    await clickByName('Enregistrer');

    // then
    sinon.assert.calledWithExactly(this.updateCertificationCenter, {
      habilitations: [availableHabilitations.firstObject],
      externalId: 'externalId',
      name: 'Centre SUP',
      type: 'SUP',
      isSupervisorAccessEnabled: true,
    });
    assert.ok(true);
  });

  test('it should not call updateCertificationCenter and discard user input on cancel', async function (assert) {
    // given
    const store = this.owner.lookup('service:store');
    const availableHabilitations = _createEmberDataHabilitations(store);
    this.availableHabilitations = availableHabilitations;
    const certificationCenter = store.createRecord('certification-center', {
      name: 'Centre SCO',
      type: 'SCO',
      externalId: 'AX129',
      habilitations: [availableHabilitations.firstObject],
      isSupervisorAccessEnabled: true,
    });
    this.set('certificationCenter', certificationCenter);
    this.updateCertificationCenter = sinon.stub();

    // when
    const screen = await render(
      hbs`<CertificationCenters::Information
        @certificationCenter={{this.certificationCenter}}
        @availableHabilitations={{this.availableHabilitations}}
        @updateCertificationCenter={{this.updateCertificationCenter}} />`
    );

    await clickByName('Editer');
    await fillIn('#name', 'Centre SUP');
    await fillIn('#certification-center-type', 'SUP');
    await fillIn('#external-id', 'externalId');
    await clickByName('Espace surveillant');
    await clickByName('Cléa');
    await clickByName('Annuler');

    // then
    sinon.assert.notCalled(this.updateCertificationCenter);
    assert.dom(screen.getByText('Centre SCO')).exists();
    assert.dom(screen.getByText('AX129')).exists();
    assert.strictEqual(screen.getByLabelText('Espace surveillant').textContent, 'oui');
    assert.dom(screen.getByLabelText('Habilité pour Pix+Droit')).exists();
    assert.dom(screen.getByLabelText('Non-habilité pour Cléa')).exists();
  });
});
