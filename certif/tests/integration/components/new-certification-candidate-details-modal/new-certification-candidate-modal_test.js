import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, fillIn } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import sinon from 'sinon';
import clickByLabel from '../../../helpers/extended-ember-test-helpers/click-by-label';
import { render as renderScreen } from '@1024pix/ember-testing-library';
import Service from '@ember/service';

module('Integration | Component | new-certification-candidate-modal', function (hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(async function () {
    const store = this.owner.lookup('service:store');
    class CurrentUserStub extends Service {
      currentAllowedCertificationCenterAccess = store.createRecord('allowed-certification-center-access', {
        habilitations: [{ name: 'Certif complémentaire 1' }, { name: 'Certif complémentaire 2' }],
      });
    }
    this.owner.register('service:current-user', CurrentUserStub);
  });

  test('it shows candidate form', async function (assert) {
    // given
    const closeModalStub = sinon.stub();
    const updateCandidateStub = sinon.stub();
    const updateCandidateWithEventStub = sinon.stub();
    this.set('closeModal', closeModalStub);
    this.set('updateCandidateStub', updateCandidateStub);
    this.set('updateCandidateWithEventStub', updateCandidateWithEventStub);
    this.set('countries', []);
    this.set('candidateData', [
      {
        firstName: '',
        lastName: '',
        birthdate: '',
        birthCity: '',
        birthCountry: '',
        email: '',
        externalId: '',
        resultRecipientEmail: '',
        birthPostalCode: '',
        birthInseeCode: '',
        sex: '',
        extraTimePercentage: '',
      },
    ]);

    // when
    const screen = await renderScreen(hbs`
      <NewCertificationCandidateModal
        @closeModal={{this.closeModal}}
        @countries={{this.countries}}
        @updateCandidateData={{this.updateCandidateStub}}
        @updateCandidateDataWithEvent={{this.updateCandidateStub}}
        @candidateData={{this.candidateData}}
      />
    `);

    // then
    assert.dom(screen.getByLabelText('* Nom de famille')).exists();
    assert.dom(screen.getByLabelText('* Nom de famille')).isFocused();
    assert.dom(screen.getByLabelText('* Prénom')).exists();
    assert.dom(screen.getByLabelText('Homme')).exists();
    assert.dom(screen.getByLabelText('Femme')).exists();
    assert.dom(screen.getByLabelText('* Date de naissance')).exists();
    assert.dom(screen.getByLabelText('* Pays de naissance')).exists();
    assert.dom(screen.getByLabelText('Code INSEE')).exists();
    assert.dom(screen.getByLabelText('Code postal')).exists();
    assert.dom(screen.getByLabelText('* Code INSEE de naissance')).exists();
    assert.dom(screen.getByLabelText('Identifiant externe')).exists();
    assert.dom(screen.getByLabelText('Temps majoré (%)')).exists();
    assert.dom(screen.getByLabelText('E-mail du destinataire des résultats (formateur, enseignant...)')).exists();
    assert.dom(screen.getByLabelText('E-mail de convocation')).exists();
    assert.dom(screen.getByLabelText('Certif complémentaire 1')).exists();
    assert.dom(screen.getByLabelText('Certif complémentaire 2')).exists();
  });

  module('when shouldDisplayPaymentOptions is true', function () {
    test('it shows candidate form with billing information', async function (assert) {
      // given
      const shouldDisplayPaymentOptions = true;
      const closeModalStub = sinon.stub();
      const updateCandidateStub = sinon.stub();
      const updateCandidateWithEventStub = sinon.stub();
      this.set('shouldDisplayPaymentOptions', shouldDisplayPaymentOptions);
      this.set('closeModal', closeModalStub);
      this.set('updateCandidateStub', updateCandidateStub);
      this.set('updateCandidateWithEventStub', updateCandidateWithEventStub);
      this.set('countries', []);
      this.set('candidateData', [
        {
          firstName: '',
          lastName: '',
          birthdate: '',
          birthCity: '',
          birthCountry: '',
          email: '',
          externalId: '',
          resultRecipientEmail: '',
          birthPostalCode: '',
          birthInseeCode: '',
          sex: '',
          extraTimePercentage: '',
          billingMode: '',
          prepaymentCode: '',
        },
      ]);

      // when
      const screen = await renderScreen(hbs`
        <NewCertificationCandidateModal
          @closeModal={{this.closeModal}}
          @countries={{this.countries}}
          @updateCandidateData={{this.updateCandidateStub}}
          @updateCandidateDataWithEvent={{this.updateCandidateStub}}
          @candidateData={{this.candidateData}}
          @shouldDisplayPaymentOptions={{this.shouldDisplayPaymentOptions}}
        />
      `);

      // then
      assert.dom(screen.getByLabelText('* Nom de famille')).exists();
      assert.dom(screen.getByLabelText('* Nom de famille')).isFocused();
      assert.dom(screen.getByLabelText('* Prénom')).exists();
      assert.dom(screen.getByLabelText('Homme')).exists();
      assert.dom(screen.getByLabelText('Femme')).exists();
      assert.dom(screen.getByLabelText('* Date de naissance')).exists();
      assert.dom(screen.getByLabelText('* Pays de naissance')).exists();
      assert.dom(screen.getByLabelText('Code INSEE')).exists();
      assert.dom(screen.getByLabelText('Code postal')).exists();
      assert.dom(screen.getByLabelText('* Code INSEE de naissance')).exists();
      assert.dom(screen.getByLabelText('Identifiant externe')).exists();
      assert.dom(screen.getByLabelText('Temps majoré (%)')).exists();
      assert.dom(screen.getByLabelText('E-mail du destinataire des résultats (formateur, enseignant...)')).exists();
      assert.dom(screen.getByLabelText('E-mail de convocation')).exists();
      assert.dom(screen.getByLabelText('Certif complémentaire 1')).exists();
      assert.dom(screen.getByLabelText('Certif complémentaire 2')).exists();
      assert.dom(screen.getByLabelText('* Tarification part Pix')).exists();
      assert.dom(screen.getByLabelText('Code de prépaiement')).exists();
      assert.dom(screen.getByLabelText('Information du code de prépaiement')).exists();
    });
  });

  test('it shows a countries list with France selected as default', async function (assert) {
    // given
    const closeModalStub = sinon.stub();
    const updateCandidateStub = sinon.stub();
    const updateCandidateWithEventStub = sinon.stub();
    this.set('closeModal', closeModalStub);
    this.set('updateCandidateStub', updateCandidateStub);
    this.set('updateCandidateWithEventStub', updateCandidateWithEventStub);
    this.set('candidateData', [
      {
        firstName: '',
        lastName: '',
        birthdate: '',
        birthCity: '',
        birthCountry: '',
        email: '',
        externalId: '',
        resultRecipientEmail: '',
        birthPostalCode: '',
        birthInseeCode: '',
        sex: '',
        extraTimePercentage: '',
      },
    ]);
    this.set('countries', [
      { id: 1, code: '99123', name: 'Syldavie' },
      { id: 2, code: '99100', name: 'France' },
      { id: 3, code: '99345', name: 'Botswana' },
    ]);

    // when
    const screen = await renderScreen(hbs`
      <NewCertificationCandidateModal
        @closeModal={{this.closeModal}}
        @countries={{this.countries}}
        @updateCandidateData={{this.updateCandidateStub}}
        @updateCandidateDataWithEvent={{this.updateCandidateStub}}
        @candidateData={{this.candidateData}}
      />
    `);

    // then
    const birthCountryField = screen.getByLabelText('* Pays de naissance');
    assert.dom(birthCountryField).includesText('Syldavie');
    assert.dom(birthCountryField).includesText('Botswana');
    assert.dom(birthCountryField).hasValue('99100');
  });

  module('when close button cross icon is clicked', () => {
    test('it closes candidate details modal', async function (assert) {
      const closeModalStub = sinon.stub();
      const updateCandidateStub = sinon.stub();
      const updateCandidateWithEventStub = sinon.stub();
      this.set('closeModal', closeModalStub);
      this.set('updateCandidateStub', updateCandidateStub);
      this.set('updateCandidateWithEventStub', updateCandidateWithEventStub);
      this.set('countries', []);
      this.set('candidateData', {
        firstName: '',
        lastName: '',
        birthdate: '',
        birthCity: '',
        birthCountry: '',
        email: '',
        externalId: '',
        resultRecipientEmail: '',
        birthPostalCode: '',
        birthInseeCode: '',
        sex: '',
        extraTimePercentage: '',
      });

      // when
      await render(hbs`
        <NewCertificationCandidateModal
          @closeModal={{this.closeModal}}
          @countries={{this.countries}}
          @updateCandidateData={{this.updateCandidateStub}}
          @updateCandidateDataWithEvent={{this.updateCandidateStub}}
          @candidateData={{this.candidateData}}
        />
      `);

      await clickByLabel('Fermer');

      // then
      sinon.assert.calledOnce(closeModalStub);
      assert.ok(true);
    });
  });

  module('when close bottom button is clicked', () => {
    test('it closes candidate details modal ', async function (assert) {
      const closeModalStub = sinon.stub();
      const updateCandidateStub = sinon.stub();
      const updateCandidateWithEventStub = sinon.stub();
      this.set('closeModal', closeModalStub);
      this.set('updateCandidateStub', updateCandidateStub);
      this.set('updateCandidateWithEventStub', updateCandidateWithEventStub);
      this.set('countries', []);
      this.set('candidateData', {
        firstName: '',
        lastName: '',
        birthdate: '',
        birthCity: '',
        birthCountry: '',
        email: '',
        externalId: '',
        resultRecipientEmail: '',
        birthPostalCode: '',
        birthInseeCode: '',
        sex: '',
        extraTimePercentage: '',
      });

      // when
      await render(hbs`
        <NewCertificationCandidateModal
          @closeModal={{this.closeModal}}
          @countries={{this.countries}}
          @updateCandidateData={{this.updateCandidateStub}}
          @updateCandidateDataWithEvent={{this.updateCandidateStub}}
          @candidateData={{this.candidateData}}
        />
      `);

      await clickByLabel('Fermer');

      // then
      sinon.assert.calledOnce(closeModalStub);
      assert.ok(true);
    });
  });

  module('when a foreign country is selected', () => {
    test('it shows city field and hides insee code and postal code fields', async function (assert) {
      const closeModalStub = sinon.stub();
      const updateCandidateFromValueStub = sinon.stub();
      const updateCandidateFromEventStub = sinon.stub();
      this.set('closeModal', closeModalStub);
      this.set('updateCandidateFromValueStub', updateCandidateFromValueStub);
      this.set('updateCandidateFromEventStub', updateCandidateFromEventStub);
      this.set('countries', [{ code: '99123', name: 'Borduristan' }]);
      this.set('candidateData', {
        firstName: '',
        lastName: '',
        birthdate: '',
        birthCity: '',
        birthCountry: '',
        email: '',
        externalId: '',
        resultRecipientEmail: '',
        birthPostalCode: '',
        birthInseeCode: '',
        sex: '',
        extraTimePercentage: '',
      });

      // when
      const screen = await renderScreen(hbs`
        <NewCertificationCandidateModal
          @closeModal={{this.closeModal}}
          @countries={{this.countries}}
          @updateCandidateData={{this.updateCandidateFromEventStub}}
          @updateCandidateDataFromValue={{this.updateCandidateFromValueStub}}
          @candidateData={{this.candidateData}}
        />
      `);

      await fillIn(screen.getByLabelText('* Pays de naissance'), '99123');

      // then
      assert.dom(screen.queryByLabelText('* Code INSEE de naissance')).isNotVisible();
      assert.dom(screen.queryByLabelText('* Code postal de naissance')).isNotVisible();
      assert.dom(screen.getByLabelText('* Commune de naissance')).isVisible();
    });
  });

  module('when the insee code option is selected', () => {
    test('it shows insee code field and hides postal code and city fields', async function (assert) {
      const closeModalStub = sinon.stub();
      const updateCandidateFromValueStub = sinon.stub();
      const updateCandidateFromEventStub = sinon.stub();
      this.set('closeModal', closeModalStub);
      this.set('updateCandidateFromValueStub', updateCandidateFromValueStub);
      this.set('updateCandidateFromEventStub', updateCandidateFromEventStub);
      this.set('countries', [{ code: '99123', name: 'Borduristan' }]);
      this.set('candidateData', {
        firstName: '',
        lastName: '',
        birthdate: '',
        birthCity: '',
        birthCountry: '',
        email: '',
        externalId: '',
        resultRecipientEmail: '',
        birthPostalCode: '',
        birthInseeCode: '',
        sex: '',
        extraTimePercentage: '',
      });

      // when
      const screen = await renderScreen(hbs`
        <NewCertificationCandidateModal
          @closeModal={{this.closeModal}}
          @countries={{this.countries}}
          @updateCandidateData={{this.updateCandidateFromEventStub}}
          @updateCandidateDataFromValue={{this.updateCandidateFromValueStub}}
          @candidateData={{this.candidateData}}
        />
      `);

      await clickByLabel('Code INSEE');

      // then
      assert.dom(screen.getByLabelText('* Code INSEE de naissance')).isVisible();
      assert.dom(screen.queryByLabelText('* Code postal de naissance')).isNotVisible();
      assert.dom(screen.queryByLabelText('* Commune de naissance')).isNotVisible();
    });
  });

  module('when the postal code option is selected', () => {
    test('it shows postal code and city fields and hides insee code field', async function (assert) {
      const closeModalStub = sinon.stub();
      const updateCandidateFromValueStub = sinon.stub();
      const updateCandidateFromEventStub = sinon.stub();
      this.set('closeModal', closeModalStub);
      this.set('updateCandidateFromValueStub', updateCandidateFromValueStub);
      this.set('updateCandidateFromEventStub', updateCandidateFromEventStub);
      this.set('countries', [{ code: '99123', name: 'Borduristan' }]);
      this.set('candidateData', {
        firstName: '',
        lastName: '',
        birthdate: '',
        birthCity: '',
        birthCountry: '',
        email: '',
        externalId: '',
        resultRecipientEmail: '',
        birthPostalCode: '',
        birthInseeCode: '',
        sex: '',
        extraTimePercentage: '',
      });

      // when
      const screen = await renderScreen(hbs`
        <NewCertificationCandidateModal
          @closeModal={{this.closeModal}}
          @countries={{this.countries}}
          @updateCandidateData={{this.updateCandidateFromEventStub}}
          @updateCandidateDataFromValue={{this.updateCandidateFromValueStub}}
          @candidateData={{this.candidateData}}
        />
      `);

      await clickByLabel('Code postal');

      // then
      assert.dom(screen.queryByLabelText('* Code INSEE de naissance')).isNotVisible();
      assert.dom(screen.queryByLabelText('* Code postal de naissance')).isVisible();
      assert.dom(screen.getByLabelText('* Commune de naissance')).isVisible();
    });
  });

  module('when the form is filled', () => {
    test('it should submit a student', async function (assert) {
      const closeModalStub = sinon.stub();
      const updateCandidateFromValueStub = sinon.stub();
      const updateCandidateFromEventStub = sinon.stub();
      const saveCandidateStub = sinon.stub();

      this.set('closeModal', closeModalStub);
      this.set('updateCandidateFromValueStub', updateCandidateFromValueStub);
      this.set('updateCandidateFromEventStub', updateCandidateFromEventStub);
      this.set('countries', [{ code: '99123', name: 'Borduristan' }]);
      this.set('saveCandidate', saveCandidateStub);
      this.set('candidateData', {
        firstName: '',
        lastName: '',
        birthdate: '',
        birthCity: '',
        birthCountry: '',
        email: '',
        externalId: '',
        resultRecipientEmail: '',
        birthPostalCode: '',
        birthInseeCode: '',
        sex: '',
        extraTimePercentage: '',
      });
      this.set('countries', [{ code: '99100', name: 'FRANCE' }]);

      // when
      const screen = await renderScreen(hbs`
        <NewCertificationCandidateModal
          @closeModal={{this.closeModal}}
          @countries={{this.countries}}
          @updateCandidateData={{this.updateCandidateFromEventStub}}
          @updateCandidateDataFromValue={{this.updateCandidateFromValueStub}}
          @candidateData={{this.candidateData}}
          @saveCandidate={{this.saveCandidate}}
          />
      `);

      await fillIn(screen.getByLabelText('* Prénom'), 'Guybrush');
      await fillIn(screen.getByLabelText('* Nom de famille'), 'Threepwood');
      await fillIn(screen.getByLabelText('* Date de naissance'), '28/04/2019');
      await clickByLabel('Homme');
      await fillIn(screen.getByLabelText('* Pays de naissance'), 99100);
      await clickByLabel('Code INSEE');
      await fillIn(screen.getByLabelText('Identifiant externe'), '44AA3355');
      await fillIn(screen.getByLabelText('* Code INSEE de naissance'), '75100');
      await fillIn(screen.getByLabelText('Temps majoré (%)'), '20');
      await fillIn(
        screen.getByLabelText('E-mail du destinataire des résultats (formateur, enseignant...)'),
        'guybrush.threepwood@example.net'
      );
      await fillIn(screen.getByLabelText('E-mail de convocation'), 'roooooar@example.net');

      await clickByLabel('Inscrire le candidat');

      // then
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line qunit/no-assert-equal
      assert.equal(updateCandidateFromValueStub.callCount, 7);
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line qunit/no-assert-equal
      assert.equal(updateCandidateFromEventStub.callCount, 8);
      sinon.assert.calledOnce(saveCandidateStub);
    });
  });
});
