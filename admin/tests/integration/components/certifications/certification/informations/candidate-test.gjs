import { clickByName, fillByLabel, render, within } from '@1024pix/ember-testing-library';
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
      birthdate: new Date(),
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

    const firstNameInfo = screen.getByText('Prénom :');
    assert.dom(firstNameInfo).exists();
    assert.dom(within(firstNameInfo.parentNode).getByText(certification.firstName)).exists();

    const lastNameInfo = screen.getByText('Nom de famille :');
    assert.dom(lastNameInfo).exists();
    assert.dom(within(lastNameInfo.parentNode).getByText(certification.lastName)).exists();

    const birthdateInfo = screen.getByText('Date de naissance :');
    assert.dom(birthdateInfo).exists();
    assert.dom(within(birthdateInfo.parentNode).getByText(intl.formatDate(certification.birthdate))).exists();

    const sexInfo = screen.getByText('Sexe :');
    assert.dom(sexInfo).exists();
    assert.dom(within(sexInfo.parentNode).getByText(certification.sex)).exists();

    const birthplaceInfo = screen.getByText('Commune de naissance :');
    assert.dom(birthplaceInfo).exists();
    assert.dom(within(birthplaceInfo.parentNode).getByText(certification.birthplace)).exists();

    const birthPostalCodeInfo = screen.getByText('Code postal de naissance :');
    assert.dom(birthPostalCodeInfo).exists();
    assert.dom(within(birthPostalCodeInfo.parentNode).getByText(certification.birthPostalCode)).exists();

    const birthInseeCodeInfo = screen.getByText('Code INSEE de naissance :');
    assert.dom(birthInseeCodeInfo).exists();
    assert.dom(within(birthInseeCodeInfo.parentNode).getByText(certification.birthInseeCode)).exists();

    const birthCountryInfo = screen.getByText('Pays de naissance :');
    assert.dom(birthCountryInfo).exists();
    assert.dom(within(birthCountryInfo.parentNode).getByText(certification.birthCountry)).exists();
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
        id: 1,
        firstName: 'Jane',
        lastName: 'Doe',
        birthdate: new Date(),
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

      const lastNameInfo = screen.getByText('Nom de famille :');
      assert.dom(within(lastNameInfo.parentNode).getByText('Another name')).exists();
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
