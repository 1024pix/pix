import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import sinon from 'sinon';
import clickByLabel from '../../../helpers/extended-ember-test-helpers/click-by-label';
import fillInByLabel from '../../../helpers/extended-ember-test-helpers/fill-in-by-label';

module('Integration | Component | new-certification-candidate-modal', function(hooks) {
  setupRenderingTest(hooks);

  test('it shows candidate form', async function(assert) {
    // given
    const closeModalStub = sinon.stub();
    const updateCandidateStub = sinon.stub();
    const updateCandidateWithEventStub = sinon.stub();
    this.set('closeModal', closeModalStub);
    this.set('updateCandidateStub', updateCandidateStub);
    this.set('updateCandidateWithEventStub', updateCandidateWithEventStub);
    this.set('countries', []);
    this.set('candidateData', [{
      firstName: '', lastName: '', birthdate: '', birthCity: '',
      birthCountry: '', email: '', externalId: '', resultRecipientEmail: '',
      birthPostalCode: '', birthInseeCode: '', sex: '', extraTimePercentage: '',
    }]);

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

    // then
    assert.dom('#last-name').exists();
    assert.dom('#last-name').isFocused();
    assert.dom('#first-name').exists();
    assert.dom('#male').exists();
    assert.dom('#female').exists();
    assert.dom('#birthdate').exists();
    assert.dom('#birth-country').exists();
    assert.dom('#insee-code-choice').exists();
    assert.dom('#postal-code-choice').exists();
    assert.dom('#birth-insee-code').exists();
    assert.dom('#external-id').exists();
    assert.dom('#extra-time-percentage').exists();
    assert.dom('#result-recipient-email').exists();
    assert.dom('#email').exists();
  });

  test('it shows a countries list with France selected as default', async function(assert) {
    // given
    const closeModalStub = sinon.stub();
    const updateCandidateStub = sinon.stub();
    const updateCandidateWithEventStub = sinon.stub();
    this.set('closeModal', closeModalStub);
    this.set('updateCandidateStub', updateCandidateStub);
    this.set('updateCandidateWithEventStub', updateCandidateWithEventStub);
    this.set('candidateData', [{
      firstName: '', lastName: '', birthdate: '', birthCity: '',
      birthCountry: '', email: '', externalId: '', resultRecipientEmail: '',
      birthPostalCode: '', birthInseeCode: '', sex: '', extraTimePercentage: '',
    }]);
    this.set('countries', [
      { id: 1, code: '99123', name: 'Syldavie' },
      { id: 2, code: '99100', name: 'France' },
      { id: 3, code: '99345', name: 'Botswana' },
    ]);

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

    // then
    assert.dom('#birth-country').exists();
    assert.dom('#birth-country').includesText('Syldavie');
    assert.dom('#birth-country').includesText('Botswana');
    assert.dom('#birth-country').hasValue('99100');
  });

  module('when close button cross icon is clicked', () => {
    test('it closes candidate details modal', async function(assert) {
      const closeModalStub = sinon.stub();
      const updateCandidateStub = sinon.stub();
      const updateCandidateWithEventStub = sinon.stub();
      this.set('closeModal', closeModalStub);
      this.set('updateCandidateStub', updateCandidateStub);
      this.set('updateCandidateWithEventStub', updateCandidateWithEventStub);
      this.set('countries', []);
      this.set('candidateData', {
        firstName: '', lastName: '', birthdate: '', birthCity: '',
        birthCountry: '', email: '', externalId: '', resultRecipientEmail: '',
        birthPostalCode: '', birthInseeCode: '', sex: '', extraTimePercentage: '',
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

      await clickByLabel('Fermer la fenêtre d\'ajout d\'un candidat');

      // then
      sinon.assert.calledOnce(closeModalStub);
      assert.ok(true);
    });
  });

  module('when close bottom button is clicked', () => {
    test('it closes candidate details modal ', async function(assert) {
      const closeModalStub = sinon.stub();
      const updateCandidateStub = sinon.stub();
      const updateCandidateWithEventStub = sinon.stub();
      this.set('closeModal', closeModalStub);
      this.set('updateCandidateStub', updateCandidateStub);
      this.set('updateCandidateWithEventStub', updateCandidateWithEventStub);
      this.set('countries', []);
      this.set('candidateData', {
        firstName: '', lastName: '', birthdate: '', birthCity: '',
        birthCountry: '', email: '', externalId: '', resultRecipientEmail: '',
        birthPostalCode: '', birthInseeCode: '', sex: '', extraTimePercentage: '',
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
    test('it shows city field and hides insee code and postal code fields', async function(assert) {
      const closeModalStub = sinon.stub();
      const updateCandidateFromValueStub = sinon.stub();
      const updateCandidateFromEventStub = sinon.stub();
      this.set('closeModal', closeModalStub);
      this.set('updateCandidateFromValueStub', updateCandidateFromValueStub);
      this.set('updateCandidateFromEventStub', updateCandidateFromEventStub);
      this.set('countries', [{ code: '99123', name: 'Borduristan' }]);
      this.set('candidateData', {
        firstName: '', lastName: '', birthdate: '', birthCity: '',
        birthCountry: '', email: '', externalId: '', resultRecipientEmail: '',
        birthPostalCode: '', birthInseeCode: '', sex: '', extraTimePercentage: '',
      });

      // when
      await render(hbs`
        <NewCertificationCandidateModal
          @closeModal={{this.closeModal}}
          @countries={{this.countries}}
          @updateCandidateData={{this.updateCandidateFromEventStub}}
          @updateCandidateDataFromValue={{this.updateCandidateFromValueStub}}
          @candidateData={{this.candidateData}}
        />
      `);

      await fillInByLabel('Pays de naissance', '99123');

      // then
      assert.dom('#birth-insee-code').isNotVisible();
      assert.dom('#birth-postal-code').isNotVisible();
      assert.dom('#birth-city').isVisible();
    });
  });

  module('when the insee code option is selected', () => {
    test('it shows insee code field and hides postal code and city fields', async function(assert) {
      const closeModalStub = sinon.stub();
      const updateCandidateFromValueStub = sinon.stub();
      const updateCandidateFromEventStub = sinon.stub();
      this.set('closeModal', closeModalStub);
      this.set('updateCandidateFromValueStub', updateCandidateFromValueStub);
      this.set('updateCandidateFromEventStub', updateCandidateFromEventStub);
      this.set('countries', [{ code: '99123', name: 'Borduristan' }]);
      this.set('candidateData', {
        firstName: '', lastName: '', birthdate: '', birthCity: '',
        birthCountry: '', email: '', externalId: '', resultRecipientEmail: '',
        birthPostalCode: '', birthInseeCode: '', sex: '', extraTimePercentage: '',
      });

      // when
      await render(hbs`
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
      assert.dom('#birth-insee-code').isVisible();
      assert.dom('#birth-postal-code').isNotVisible();
      assert.dom('#birth-city').isNotVisible();
    });
  });

  module('when the postal code option is selected', () => {
    test('it shows postal code and city fields and hides insee code field', async function(assert) {
      const closeModalStub = sinon.stub();
      const updateCandidateFromValueStub = sinon.stub();
      const updateCandidateFromEventStub = sinon.stub();
      this.set('closeModal', closeModalStub);
      this.set('updateCandidateFromValueStub', updateCandidateFromValueStub);
      this.set('updateCandidateFromEventStub', updateCandidateFromEventStub);
      this.set('countries', [{ code: '99123', name: 'Borduristan' }]);
      this.set('candidateData', {
        firstName: '', lastName: '', birthdate: '', birthCity: '',
        birthCountry: '', email: '', externalId: '', resultRecipientEmail: '',
        birthPostalCode: '', birthInseeCode: '', sex: '', extraTimePercentage: '',
      });

      // when
      await render(hbs`
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
      assert.dom('#birth-insee-code').isNotVisible();
      assert.dom('#birth-postal-code').isVisible();
      assert.dom('#birth-city').isVisible();
    });
  });

  module('when the form is filled', () => {
    test('it should submit a student', async function(assert) {
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
        firstName: '', lastName: '', birthdate: '', birthCity: '',
        birthCountry: '', email: '', externalId: '', resultRecipientEmail: '',
        birthPostalCode: '', birthInseeCode: '', sex: '', extraTimePercentage: '',
      });
      this.set('countries', [{ code: '99100', name: 'FRANCE' }]);

      // when
      await render(hbs`
        <NewCertificationCandidateModal
          @closeModal={{this.closeModal}}
          @countries={{this.countries}}
          @updateCandidateData={{this.updateCandidateFromEventStub}}
          @updateCandidateDataFromValue={{this.updateCandidateFromValueStub}}
          @candidateData={{this.candidateData}}
          @saveCandidate={{this.saveCandidate}}
          />
      `);

      await fillInByLabel('Prénom', 'Guybrush');
      await fillInByLabel('Nom de famille', 'Threepwood');
      await fillInByLabel('Date de naissance', '28/04/2019');
      await clickByLabel('Homme');
      await fillInByLabel('Pays de naissance', 99100);
      await clickByLabel('Code INSEE');
      await fillInByLabel('Identifiant externe', '44AA3355');
      await fillInByLabel('Code INSEE de naissance', '75100');
      await fillInByLabel('Temps majoré (%)', '20');
      await fillInByLabel('E-mail du destinataire des résultats', 'guybrush.threepwood@example.net');
      await fillInByLabel('E-mail de convocation', 'roooooar@example.net');

      await clickByLabel('Ajouter le candidat');

      // then
      assert.equal(updateCandidateFromValueStub.callCount, 7);
      assert.equal(updateCandidateFromEventStub.callCount, 8);
      sinon.assert.calledOnce(saveCandidateStub);
    });
  });
});
