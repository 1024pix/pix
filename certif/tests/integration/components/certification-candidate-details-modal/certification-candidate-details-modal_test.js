import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import sinon from 'sinon';
import EmberObject from '@ember/object';
import clickByLabel from '../../../helpers/extended-ember-test-helpers/click-by-label';
import { render as renderScreen } from '@1024pix/ember-testing-library';

module('Integration | Component | certification-candidate-details-modal', function (hooks) {
  setupRenderingTest(hooks);

  module('when feature toggle FT_IS_COMPLEMENTARY_CERTIFICATION_SUBSCRIPTION_ENABLED is enabled', function () {
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
            name: 'Pix+Edu',
          },
          {
            id: 2,
            name: 'Pix+Droit',
          },
        ],
      });

      const closeModalStub = sinon.stub();
      this.set('closeModal', closeModalStub);
      this.set('candidate', candidate);
      this.set('displayComplementaryCertification', true);

      // when
      await render(hbs`
      <CertificationCandidateDetailsModal
        @closeModal={{this.closeModal}}
        @candidate={{this.candidate}}
        @displayComplementaryCertification={{this.displayComplementaryCertification}}
      />
    `);

      // then
      assert.contains('Détail du candidat');
      assert.contains('Jean-Paul');
      assert.contains('Candidat');
      assert.contains('Eu');
      assert.contains('76260');
      assert.contains('76255');
      assert.contains('Femme');
      assert.contains('France');
      assert.contains('jeanpauldeu@pix.fr');
      assert.contains('suric@animal.fr');
      assert.contains('12345');
      assert.contains('25/12/2000');
      assert.contains('10 %');
      assert.contains('Pix+Edu, Pix+Droit');
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
        await render(hbs`
        <CertificationCandidateDetailsModal
          @closeModal={{this.closeModal}}
          @candidate={{this.candidate}}
          @displayComplementaryCertification={{this.displayComplementaryCertification}}
        />
      `);

        // then
        assert.dom('[data-test-id="birth-postal-code-row"]').hasText('-');
        assert.dom('[data-test-id="birth-insee-code-row"]').hasText('-');
        assert.dom('[data-test-id="birth-city-row"]').hasText('-');
        assert.dom('[data-test-id="result-recipient-email-row"]').hasText('-');
        assert.dom('[data-test-id="email-row"]').hasText('-');
        assert.dom('[data-test-id="external-id-row"]').hasText('-');
        assert.dom('[data-test-id="extra-time-row"]').hasText('-');
        assert.dom('[data-test-id="sex-label-row"]').hasText('-');
        assert.dom('[data-test-id="birth-date-row"]').hasText('-');
        assert.dom('[data-test-id="first-name-row"]').hasText('-');
        assert.dom('[data-test-id="last-name-row"]').hasText('-');
        assert.dom('[data-test-id="birth-country-row"]').hasText('-');
        assert.dom('[data-test-id="complementary-certifications-row"]').hasText('-');
      });
    });
  });

  module('when feature toggle FT_IS_COMPLEMENTARY_CERTIFICATION_SUBSCRIPTION_ENABLED is disabled', function () {
    test('it shows candidate details without complementary certifications', async function (assert) {
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
            name: 'Pix+Edu',
          },
          {
            id: 2,
            name: 'Pix+Droit',
          },
        ],
      });

      const closeModalStub = sinon.stub();
      this.set('closeModal', closeModalStub);
      this.set('candidate', candidate);
      this.set('displayComplementaryCertification', false);

      // when
      await render(hbs`
      <CertificationCandidateDetailsModal
        @closeModal={{this.closeModal}}
        @candidate={{this.candidate}}
        @displayComplementaryCertification={{this.displayComplementaryCertification}}
      />
    `);

      // then
      assert.contains('Détail du candidat');
      assert.contains('Jean-Paul');
      assert.contains('Candidat');
      assert.contains('Eu');
      assert.contains('76260');
      assert.contains('76255');
      assert.contains('Femme');
      assert.contains('France');
      assert.contains('jeanpauldeu@pix.fr');
      assert.contains('suric@animal.fr');
      assert.contains('12345');
      assert.contains('25/12/2000');
      assert.contains('10 %');
      assert.notContains('Pix+Edu, Pix+Droit');
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
      await render(hbs`
        <CertificationCandidateDetailsModal
          @closeModal={{this.closeModal}}
          @candidate={{this.candidate}}
        />
      `);
      await clickByLabel('Fermer la fenêtre de détail du candidat');

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
          @closeModal={{this.closeModal}}
          @candidate={{this.candidate}}
        />
      `);
      await click(screen.getByRole('button', { name: 'Fermer' }));

      // then
      sinon.assert.calledOnce(closeModalStub);
      assert.ok(true);
    });
  });
});
