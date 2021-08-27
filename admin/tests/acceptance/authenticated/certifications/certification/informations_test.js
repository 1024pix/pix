import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import { currentURL, click, visit } from '@ember/test-helpers';
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
    this.server.create('user', { id: 888 });

    this.server.create('country', {
      code: '99217',
      name: 'JAPON',
    });

    this.server.create('country', {
      code: '99430',
      name: 'GROENLAND',
    });

    certification = this.server.create('certification', {
      firstName: 'Bora Horza',
      lastName: 'Gobuchul',
      birthdate: '1987-07-24',
      birthplace: 'Sorpen',
      userId: 888,
      sex: 'M',
      birthCountry: 'JAPON',
      birthInseeCode: '99217',
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
    assert.contains('M');
    assert.contains('Sorpen');
    assert.contains('99217');
    assert.contains('JAPON');
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
      await click('#male');
      await fillInByLabel('Pays de naissance', '99430');
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
      await click('#male');
      await fillInByLabel('Pays de naissance', '99430');
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
      await click('#male');
      await fillInByLabel('Pays de naissance', '99430');
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
      await click('#female');
      await fillInByLabel('Pays de naissance', '99430');
      await fillInByLabel('Commune de naissance', 'Pôle nord');

      // when
      await clickByLabel('Enregistrer');

      // then
      assert.contains('Tic');
      assert.contains('Toc');
      assert.contains('12/12/2012');
      assert.contains('F');
      assert.contains('GROENLAND');
      assert.contains('99430');
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
      await click('#male');
      await fillInByLabel('Pays de naissance', '99430');
      await fillInByLabel('Commune de naissance', 'Pôle nord');
      await clickByLabel('Enregistrer');

      // when
      await click('button[data-test-id="close-certification-candidate-edition-modal"]');

      // then
      assert.contains('Bora Horza');
      assert.contains('Gobuchul');
      assert.contains('24/07/1987');
      assert.contains('M');
      assert.contains('Sorpen');
      assert.contains('99217');
      assert.contains('JAPON');
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

  module('when go to user detail button is clicked', function() {

    test('it should redirect to user detail page', async function(assert) {
      // given
      await visit(`/certifications/${certification.id}`);

      // when
      await clickByLabel('Voir les détails de l\'utilisateur');

      // then
      assert.equal(currentURL(), '/users/888');
    });
  });
});
