import { module, test } from 'qunit';
import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';
import { click } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import sinon from 'sinon';
import EmberObject from '@ember/object';
import { render as renderScreen } from '@1024pix/ember-testing-library';

module('Integration | Component | certification-candidate-details-modal', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('it shows candidate details with complementary certification', async function (assert) {
    // given
    const store = this.owner.lookup('service:store');
    const candidate = store.createRecord('certification-candidate', {
      firstName: 'Jean-Paul',
      lastName: 'Candidat',
      birthCity: 'Eu',
      birthCountry: 'France',
      email: 'jeanpauldeu@pix.fr',
      resultRecipientEmail: 'suric@animal.fr',
      externalId: '12345',
      birthdate: '2000-12-25',
      extraTimePercentage: 0.1,
      birthInseeCode: 76255,
      birthPostalCode: 76260,
      sex: 'F',
      complementaryCertifications: [
        {
          id: 1,
          label: 'Pix+Edu',
        },
        {
          id: 2,
          label: 'Pix+Droit',
        },
      ],
    });

    const closeModalStub = sinon.stub();
    this.set('closeModal', closeModalStub);
    this.set('candidate', candidate);
    this.set('displayComplementaryCertification', true);

    // when
    const screen = await renderScreen(hbs`
      <CertificationCandidateDetailsModal
        @closeModal={{this.closeModal}}
        @candidate={{this.candidate}}
        @displayComplementaryCertification={{this.displayComplementaryCertification}}
      />
    `);

    // then
    assert.dom(screen.getByText('Détail du candidat')).exists();
    assert.dom(screen.getByText('Jean-Paul')).exists();
    assert.dom(screen.getByText('Candidat')).exists();
    assert.dom(screen.getByText('Eu')).exists();
    assert.dom(screen.getByText('76260')).exists();
    assert.dom(screen.getByText('76255')).exists();
    assert.dom(screen.getByText('Femme')).exists();
    assert.dom(screen.getByText('France')).exists();
    assert.dom(screen.getByText('jeanpauldeu@pix.fr')).exists();
    assert.dom(screen.getByText('suric@animal.fr')).exists();
    assert.dom(screen.getByText('12345')).exists();
    assert.dom(screen.getByText('25/12/2000')).exists();
    assert.dom(screen.getByText('10 %')).exists();
    assert.dom(screen.getByText('Pix+Edu, Pix+Droit')).exists();
  });

  module('when candidate has missing data', () => {
    test('it displays a dash', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const candidate = store.createRecord('certification-candidate', {
        firstName: undefined,
        lastName: undefined,
        birthCountry: undefined,
        birthdate: undefined,
        sex: undefined,
        email: undefined,
        resultRecipientEmail: undefined,
        externalId: undefined,
        extraTimePercentage: undefined,
        complementaryCertifications: [],
      });

      const closeModalStub = sinon.stub();
      this.set('closeModal', closeModalStub);
      this.set('candidate', candidate);
      this.set('displayComplementaryCertification', true);

      // when
      const screen = await renderScreen(hbs`
        <CertificationCandidateDetailsModal
          @closeModal={{this.closeModal}}
          @candidate={{this.candidate}}
          @displayComplementaryCertification={{this.displayComplementaryCertification}}
        />
      `);

      // then
      assert.strictEqual(screen.getAllByText('-').length, 13);
    });
  });

  module('when @shouldDisplayPaymentOptions is true', function () {
    test('it shows candidate details with payement options', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const candidate = store.createRecord('certification-candidate', {
        firstName: 'Jean-Paul',
        lastName: 'Candidat',
        birthCity: 'Eu',
        birthCountry: 'France',
        email: 'jeanpauldeu@pix.fr',
        resultRecipientEmail: 'suric@animal.fr',
        externalId: '12345',
        birthdate: '2000-12-25',
        extraTimePercentage: 0.1,
        birthInseeCode: 76255,
        birthPostalCode: 76260,
        sex: 'F',
        complementaryCertifications: [],
        billingMode: 'Prépayée',
        prepaymentCode: 'prep123',
      });

      const closeModalStub = sinon.stub();
      this.set('closeModal', closeModalStub);
      this.set('candidate', candidate);
      this.set('displayComplementaryCertification', false);
      this.set('shouldDisplayPaymentOptions', true);

      // when
      const screen = await renderScreen(hbs`
      <CertificationCandidateDetailsModal
        @closeModal={{this.closeModal}}
        @candidate={{this.candidate}}
        @displayComplementaryCertification={{this.displayComplementaryCertification}}
        @shouldDisplayPaymentOptions={{this.shouldDisplayPaymentOptions}}
      />
    `);

      // then
      assert.dom(screen.getByText('Détail du candidat')).exists();
      assert.dom(screen.getByText('Jean-Paul')).exists();
      assert.dom(screen.getByText('Candidat')).exists();
      assert.dom(screen.getByText('Eu')).exists();
      assert.dom(screen.getByText('76260')).exists();
      assert.dom(screen.getByText('76255')).exists();
      assert.dom(screen.getByText('Femme')).exists();
      assert.dom(screen.getByText('France')).exists();
      assert.dom(screen.getByText('jeanpauldeu@pix.fr')).exists();
      assert.dom(screen.getByText('suric@animal.fr')).exists();
      assert.dom(screen.getByText('12345')).exists();
      assert.dom(screen.getByText('25/12/2000')).exists();
      assert.dom(screen.getByText('10 %')).exists();
      assert.dom(screen.getByText('Prépayée')).exists();
      assert.dom(screen.getByText('prep123')).exists();
    });
  });

  module('when @shouldDisplayPaymentOptions is false', function () {
    test('it shows candidate details without payement options', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const candidate = store.createRecord('certification-candidate', {
        firstName: 'Jean-Paul',
        lastName: 'Candidat',
        birthCity: 'Eu',
        birthCountry: 'France',
        email: 'jeanpauldeu@pix.fr',
        resultRecipientEmail: 'suric@animal.fr',
        externalId: '12345',
        birthdate: '2000-12-25',
        extraTimePercentage: 0.1,
        birthInseeCode: 76255,
        birthPostalCode: 76260,
        sex: 'F',
        complementaryCertifications: [],
        billingMode: 'Prépayée',
        prepaymentCode: 'prep123',
      });

      const closeModalStub = sinon.stub();
      this.set('closeModal', closeModalStub);
      this.set('candidate', candidate);
      this.set('displayComplementaryCertification', false);
      this.set('shouldDisplayPaymentOptions', false);

      // when
      const screen = await renderScreen(hbs`
      <CertificationCandidateDetailsModal
        @closeModal={{this.closeModal}}
        @candidate={{this.candidate}}
        @displayComplementaryCertification={{this.displayComplementaryCertification}}
        @shouldDisplayPaymentOptions={{this.shouldDisplayPaymentOptions}}
      />
    `);

      // then
      assert.dom(screen.getByText('Détail du candidat')).exists();
      assert.dom(screen.getByText('Jean-Paul')).exists();
      assert.dom(screen.getByText('Candidat')).exists();
      assert.dom(screen.getByText('Eu')).exists();
      assert.dom(screen.getByText('76260')).exists();
      assert.dom(screen.getByText('76255')).exists();
      assert.dom(screen.getByText('Femme')).exists();
      assert.dom(screen.getByText('France')).exists();
      assert.dom(screen.getByText('jeanpauldeu@pix.fr')).exists();
      assert.dom(screen.getByText('suric@animal.fr')).exists();
      assert.dom(screen.getByText('12345')).exists();
      assert.dom(screen.getByText('25/12/2000')).exists();
      assert.dom(screen.getByText('10 %')).exists();
      assert.dom(screen.queryByText('Prépayée')).doesNotExist();
      assert.dom(screen.queryByText('prep123')).doesNotExist();
    });
  });

  module('when top close button is clicked', () => {
    test('it closes candidate details modal', async function (assert) {
      // given
      const candidate = EmberObject.create({});
      const closeModalStub = sinon.stub();
      this.set('closeModal', closeModalStub);
      this.set('candidate', candidate);

      // when
      const screen = await renderScreen(hbs`
        <CertificationCandidateDetailsModal
          @showModal={{true}}
          @closeModal={{this.closeModal}}
          @candidate={{this.candidate}}
        />
      `);

      await click(screen.getByRole('button', { name: 'Fermer la fenêtre de détail du candidat' }));

      // then
      sinon.assert.calledOnce(closeModalStub);
      assert.ok(true);
    });
  });

  module('when bottom close button is clicked', () => {
    test('it also closes candidate details modal', async function (assert) {
      // given
      const candidate = EmberObject.create({});
      const closeModalStub = sinon.stub();
      this.set('closeModal', closeModalStub);
      this.set('candidate', candidate);

      // when
      const screen = await renderScreen(hbs`
        <CertificationCandidateDetailsModal
          @showModal={{true}}
          @closeModal={{this.closeModal}}
          @candidate={{this.candidate}}
        />
      `);
      await click(screen.getByRole('button', { name: 'Fermer la fenêtre de détail du candidat' }));

      // then
      sinon.assert.calledOnce(closeModalStub);
      assert.ok(true);
    });
  });
});
