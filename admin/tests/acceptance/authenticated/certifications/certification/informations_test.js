import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import { visit } from '@ember/test-helpers';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { setFlatpickrDate } from 'ember-flatpickr/test-support/helpers';
import { createAuthenticateSession } from 'pix-admin/tests/helpers/test-init';
import clickByLabel from '../../../../helpers/extended-ember-test-helpers/click-by-label';
import fillInByLabel from '../../../../helpers/extended-ember-test-helpers/fill-in-by-label';

module('Acceptance | Route | routes/authenticated/certifications/certification | informations', function(hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  let certification;

  hooks.beforeEach(async function() {
    const user = server.create('user');
    await createAuthenticateSession({ userId: user.id });
    certification = this.server.create('certification', {
      firstName: 'Bora Horza',
      lastName: 'Gobuchul',
      birthdate: '1987-07-24',
      birthplace: 'Sorpen',
      competencesWithMark: [],
      listChallengesAndAnswers: [],
    });
  });

  test('it displays candidate information', async function(assert) {
    // when
    await visit(`/certifications/${certification.id}`);

    // then
    assert.contains('Bora Horza');
    assert.contains('Gobuchul');
    assert.contains('24/07/1987');
    assert.contains('Sorpen');
    assert.dom('[aria-label="Modifier les informations du candidat"]').exists().isEnabled();
    assert.dom('[aria-label="Modifier les résultats du candidat"]').exists().isEnabled();
  });

  module('when candidate information form is submitted', function() {

    test('it closes the modal when candidate info are successfully saved', async function(assert) {
      // given
      await visit(`/certifications/${certification.id}`);
      await clickByLabel('Modifier');
      await fillInByLabel('Nom de famille', 'Tic');
      await fillInByLabel('Prénom', 'Toc');
      setFlatpickrDate('#birthdate', new Date('2012-12-12'));
      await fillInByLabel('Commune de naissance', 'Pôle nord');

      // when
      await clickByLabel('Enregistrer');

      // then
      assert.notContains('Editer les informations du candidat');
    });

    test('it should display a success notification when data is valid', async function(assert) {
      // given
      await visit(`/certifications/${certification.id}`);
      await clickByLabel('Modifier');
      await fillInByLabel('Nom de famille', 'Tic');
      await fillInByLabel('Prénom', 'Toc');
      setFlatpickrDate('#birthdate', new Date('2012-12-12'));
      await fillInByLabel('Commune de naissance', 'Pôle nord');

      // when
      await clickByLabel('Enregistrer');

      // then
      assert.contains('Les informations du candidat ont bien été enregistrées.');
    });

    test('it should display an error notification when data is invalid', async function(assert) {
      // given
      this.server.patch('/certification-courses/:id', () => ({
        'errors': [{ 'detail': 'Candidate\'s first name must not be blank or empty' }],
      }), 422);
      await visit(`/certifications/${certification.id}`);
      await clickByLabel('Modifier');
      await fillInByLabel('Nom de famille', 'Tic');
      await fillInByLabel('Prénom', 'Toc');
      setFlatpickrDate('#birthdate', new Date('2012-12-12'));
      await fillInByLabel('Commune de naissance', 'Pôle nord');

      // when
      await clickByLabel('Enregistrer');

      // then
      assert.contains('Editer les informations du candidat');
      assert.contains('Candidate\'s first name must not be blank or empty');
    });

    test('it should update candidat information', async function(assert) {
      await visit(`/certifications/${certification.id}`);
      await clickByLabel('Modifier');
      await fillInByLabel('Nom de famille', 'Tic');
      await fillInByLabel('Prénom', 'Toc');
      setFlatpickrDate('#birthdate', new Date('2012-12-12'));
      await fillInByLabel('Commune de naissance', 'Pôle nord');

      // when
      await clickByLabel('Enregistrer');

      // then
      assert.contains('Tic');
      assert.contains('Toc');
      assert.contains('12/12/2012');
      assert.contains('Pôle nord');
    });

    test('it should not update candidate info on save failure', async function(assert) {
      // given
      this.server.patch('/certification-courses/:id', () => ({
        'errors': [{ 'detail': 'Candidate\'s first name must not be blank or empty' }],
      }), 422);
      await visit(`/certifications/${certification.id}`);
      await clickByLabel('Modifier');
      await fillInByLabel('Nom de famille', 'Tic');
      await fillInByLabel('Prénom', 'Toc');
      setFlatpickrDate('#birthdate', new Date('2012-12-12'));
      await fillInByLabel('Commune de naissance', 'Pôle nord');
      await clickByLabel('Enregistrer');

      // when
      await clickByLabel('Annuler');

      // then
      assert.contains('Bora Horza');
      assert.contains('Gobuchul');
      assert.contains('24/07/1987');
      assert.contains('Sorpen');
    });
  });

  module('when candidate results edit button is clicked', function() {
    test('it disables candidate informations edit button', async function(assert) {
      // when
      await visit(`/certifications/${certification.id}`);
      await clickByLabel('Modifier les résultats du candidat');

      // then
      assert.dom('[aria-label="Modifier les informations du candidat"]').isDisabled();
    });
  });

  module('when candidate results form cancel button is clicked', function() {
    test('it re-enables candidate informations edit button', async function(assert) {
      // when
      await visit(`/certifications/${certification.id}`);
      await clickByLabel('Modifier les résultats du candidat');
      await clickByLabel('Annuler la modification des résultats du candidat');

      // then
      assert.dom('[aria-label="Modifier les informations du candidat"]').exists().isEnabled();
    });
  });

  module('when candidate results form is submitted', function() {
    test('it also re-enables candidate informations edit button', async function(assert) {
      // when
      await visit(`/certifications/${certification.id}`);
      await clickByLabel('Modifier les résultats du candidat');
      await clickByLabel('Annuler la modification des résultats du candidat');

      // then
      assert.dom('[aria-label="Modifier les informations du candidat"]').exists().isEnabled();
    });
  });
});
