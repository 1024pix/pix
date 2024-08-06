import { render } from '@1024pix/ember-testing-library';
import EmberObject from '@ember/object';
import { click } from '@ember/test-helpers';
import CertificationCandidateDetailsModal from 'pix-certif/components/certification-candidate-details-modal';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

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
      complementaryCertification: {
        id: 1,
      },
    });

    const currentAllowedCertificationCenterAccess = store.createRecord('allowed-certification-center-access', {
      habilitations: [{ id: 1, label: 'Pix+Edu' }],
    });

    const closeModalStub = sinon.stub();

    // when
    const screen = await render(
      <template>
        <CertificationCandidateDetailsModal
          @closeModal={{closeModalStub}}
          @showModal={{true}}
          @candidate={{candidate}}
          @displayComplementaryCertification={{true}}
          @complementaryCertifications={{currentAllowedCertificationCenterAccess.habilitations}}
        />
      </template>,
    );

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
    assert.dom(screen.getByText('Pix+Edu')).exists();
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
        complementaryCertification: null,
      });

      const closeModalStub = sinon.stub();

      // when
      const screen = await render(
        <template>
          <CertificationCandidateDetailsModal
            @closeModal={{closeModalStub}}
            @showModal={{true}}
            @candidate={{candidate}}
            @displayComplementaryCertification={{true}}
          />
        </template>,
      );

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
        complementaryCertification: null,
        billingMode: 'PREPAID',
        prepaymentCode: 'prep123',
      });

      const closeModalStub = sinon.stub();

      // when
      const screen = await render(
        <template>
          <CertificationCandidateDetailsModal
            @closeModal={{closeModalStub}}
            @candidate={{candidate}}
            @displayComplementaryCertification={{false}}
            @shouldDisplayPaymentOptions={{true}}
          />
        </template>,
      );

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
        complementaryCertification: null,
        billingMode: 'PREPAID',
        prepaymentCode: 'prep123',
      });

      const closeModalStub = sinon.stub();

      // when
      const screen = await render(
        <template>
          <CertificationCandidateDetailsModal
            @closeModal={{closeModalStub}}
            @candidate={{candidate}}
            @displayComplementaryCertification={{false}}
            @shouldDisplayPaymentOptions={{false}}
          />
        </template>,
      );

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

      // when
      const screen = await render(
        <template>
          <CertificationCandidateDetailsModal
            @showModal={{true}}
            @closeModal={{closeModalStub}}
            @candidate={{candidate}}
          />
        </template>,
      );

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

      // when
      const screen = await render(
        <template>
          <CertificationCandidateDetailsModal
            @showModal={{true}}
            @closeModal={{closeModalStub}}
            @candidate={{candidate}}
          />
        </template>,
      );
      await click(screen.getByRole('button', { name: 'Fermer la fenêtre de détail du candidat' }));

      // then
      sinon.assert.calledOnce(closeModalStub);
      assert.ok(true);
    });
  });
});
