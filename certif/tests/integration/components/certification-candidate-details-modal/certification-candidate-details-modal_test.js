import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import sinon from 'sinon';
import EmberObject from '@ember/object';
import clickByLabel from '../../../helpers/extended-ember-test-helpers/click-by-label';

module('Integration | Component | certification-candidate-details-modal', function(hooks) {
  setupRenderingTest(hooks);

  test('it shows candidate details', async function(assert) {
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
      extraTimePercentage: 10,
      birthInseeCode: 76255,
      birthPostalCode: 76260,
      sex: 'F',
    });

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
    assert.contains('10');
  });

  module('when candidate has missing data', () => {
    test('it displays a dash', async function(assert) {
      // given
      const store = this.owner.lookup('service:store');
      const candidate = store.createRecord('certification-candidate', {
        firstName: 'Jean-Paul',
        lastName: 'Candidat',
        birthCountry: 'France',
        email: 'jeanpauldeu@pix.fr',
        resultRecipientEmail: 'suric@animal.fr',
        externalId: '12345',
        birthdate: '2000-12-25',
        extraTimePercentage: 10,
        sex: 'F',
      });

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

      // then
      assert.dom('[data-test-id="birth-postal-code-row"]').hasText('-');
      assert.dom('[data-test-id="birth-insee-code-row"]').hasText('-');
      assert.dom('[data-test-id="birth-city-row"]').hasText('-');
    });
  });

  module('when top close button is clicked', () => {
    test('it closes candidate details modal', async function(assert) {
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
    test('it also closes candidate details modal', async function(assert) {
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
      await clickByLabel('Fermer');

      // then
      sinon.assert.calledOnce(closeModalStub);
      assert.ok(true);
    });
  });
});
