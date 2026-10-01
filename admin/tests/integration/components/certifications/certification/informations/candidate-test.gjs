import { clickByName, fillByLabel, render } from '@1024pix/ember-testing-library';
import Service from '@ember/service';
import { fireEvent } from '@testing-library/dom';
import { setupIntl } from 'ember-intl/test-support';
import { setupRenderingTest } from 'ember-qunit';
import CertificationInformationCandidate from 'pix-admin/components/certifications/certification/informations/candidate';
import { module, test } from 'qunit';
import sinon from 'sinon';

import { waitForDialogClose } from '../../../../../helpers/wait-for';

module('Integration | Component | Certifications | Certification | Information | Candidate', function (hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks, 'fr');

  let store;
  let intl;

  hooks.beforeEach(function () {
    store = this.owner.lookup('service:store');
    intl = this.owner.lookup('service:intl');
    sinon.stub(store, 'findAll').withArgs('country').resolves([]);
  });

  test('should display certification candidate informations', async function (assert) {
    // given
    const certification = store.createRecord('certification', {
      firstName: 'Jane',
      lastName: 'Doe',
      birthdate: '2000-12-15',
      sex: 'F',
      birthplace: 'Paris',
      birthPostalCode: '75001',
      birthInseeCode: '75001',
      birthCountry: 'France',
    });

    // when
    const screen = await render(
      <template><CertificationInformationCandidate @certification={{certification}} /></template>,
    );

    // then
    assert.dom(screen.getByRole('heading', { name: 'Candidat' })).exists();

    const termsList = screen.getAllByRole('term');
    const definitionsList = screen.getAllByRole('definition');

    assert.strictEqual(termsList[0].textContent.trim(), 'Prénom');
    assert.strictEqual(definitionsList[0].textContent.trim(), certification.firstName);

    assert.strictEqual(termsList[1].textContent.trim(), 'Nom de famille');
    assert.strictEqual(definitionsList[1].textContent.trim(), certification.lastName);

    assert.strictEqual(termsList[2].textContent.trim(), 'Date de naissance');
    assert.strictEqual(definitionsList[2].textContent.trim(), intl.formatDate(certification.birthdate));

    assert.strictEqual(termsList[3].textContent.trim(), 'Sexe');
    assert.strictEqual(definitionsList[3].textContent.trim(), certification.sex);

    assert.strictEqual(termsList[4].textContent.trim(), 'Commune de naissance');
    assert.strictEqual(definitionsList[4].textContent.trim(), certification.birthplace);

    assert.strictEqual(termsList[5].textContent.trim(), 'Code postal de naissance');
    assert.strictEqual(definitionsList[5].textContent.trim(), certification.birthPostalCode);

    assert.strictEqual(termsList[6].textContent.trim(), 'Code INSEE de naissance');
    assert.strictEqual(definitionsList[6].textContent.trim(), certification.birthInseeCode);

    assert.strictEqual(termsList[7].textContent.trim(), 'Pays de naissance');
    assert.strictEqual(definitionsList[7].textContent.trim(), certification.birthCountry);
  });

  module('edit candidate info', function (hooks) {
    let screen, errorNotificationStub, successNotificationStub;

    hooks.beforeEach(async function () {
      // given
      successNotificationStub = sinon.stub();
      errorNotificationStub = sinon.stub();
      class NotificationsStub extends Service {
        sendSuccessNotification = successNotificationStub;
        sendErrorNotification = errorNotificationStub;
      }
      this.owner.register('service:pixToast', NotificationsStub);

      const certification = store.createRecord('certification', {
        id: '1',
        firstName: 'Jane',
        lastName: 'Doe',
        birthdate: '2000-12-15',
        sex: 'F',
        birthplace: 'Paris',
        birthPostalCode: '75001',
        birthInseeCode: '75001',
        birthCountry: 'France',
      });

      // when
      screen = await render(
        <template><CertificationInformationCandidate @certification={{certification}} /></template>,
      );
    });

    test('should be possible to edit the candidate through a modal', async function (assert) {
      // given
      const currentCertification = store.peekRecord('certification', 1);
      currentCertification.save = sinon.stub().resolves();

      // when
      await fireEvent.click(screen.getByRole('button', { name: 'Modifier les informations du candidat' }));

      await screen.findByRole('dialog');

      // then
      assert.dom(screen.getByRole('heading', { name: 'Modifier les informations du candidat' })).exists();
      await fillByLabel('Nom de famille', 'Another name');

      await clickByName('Enregistrer');
      await waitForDialogClose();

      sinon.assert.calledWith(currentCertification.save, {
        adapterOptions: { updateJuryComment: false },
      });
      sinon.assert.calledWith(successNotificationStub, {
        message: 'Les informations du candidat ont bien été enregistrées.',
      });

      assert.dom(screen.queryByRole('button', { name: 'Enregistrer' })).doesNotExist();

      const termsList = screen.getAllByRole('term');
      const definitionsList = screen.getAllByRole('definition');
      assert.strictEqual(termsList[1].textContent.trim(), 'Nom de famille');
      assert.strictEqual(definitionsList[1].textContent.trim(), 'Another name');
    });

    test('on error, should display an error notification', async function (assert) {
      // given
      const currentCertification = store.peekRecord('certification', 1);
      currentCertification.save = sinon.stub().rejects();

      // when
      await fireEvent.click(screen.getByRole('button', { name: 'Modifier les informations du candidat' }));

      await screen.findByRole('dialog');

      // then
      assert.dom(screen.getByRole('heading', { name: 'Modifier les informations du candidat' })).exists();
      await fillByLabel('Nom de famille', 'Another name');

      await clickByName('Enregistrer');

      assert.ok(errorNotificationStub.calledOnce);
    });
  });
});
