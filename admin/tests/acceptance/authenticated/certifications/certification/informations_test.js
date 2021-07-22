import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import { visit } from '@ember/test-helpers';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

import { createAuthenticateSession } from 'pix-admin/tests/helpers/test-init';
import clickByLabel from '../../../../helpers/extended-ember-test-helpers/click-by-label';

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

  test('it displays candidate informations', async function(assert) {
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

  module('when candidate information edit button is clicked', function() {
    test('it displays candidate informations form', async function(assert) {
      // when
      await visit(`/certifications/${certification.id}`);
      await clickByLabel('Modifier les informations du candidat');

      // then
      assert.dom('#certification-firstName').hasValue('Bora Horza');
      assert.dom('#certification-lastName').hasValue('Gobuchul');
      assert.dom('.ember-flatpickr-input').hasValue('1987-07-24');
      assert.dom('#certification-birthPlace').hasValue('Sorpen');
      assert.dom('[aria-label="Annuler la modification des informations du candidat"]').exists();
      assert.dom('[aria-label="Enregistrer les informations du candidat"]').exists();
    });

    test('it disables candidate results edit button', async function(assert) {
      // when
      await visit(`/certifications/${certification.id}`);
      await clickByLabel('Modifier les informations du candidat');

      // then
      assert.dom('[aria-label="Modifier les résultats du candidat"]').isDisabled();
    });
  });

  module('when candidate information form cancel button is clicked', function() {
    test('it hides candidate informations form', async function(assert) {
      // when
      await visit(`/certifications/${certification.id}`);
      await clickByLabel('Modifier les informations du candidat');
      await clickByLabel('Annuler la modification des informations du candidat');

      // then
      assert.dom('#certification-firstName').doesNotExist();
    });

    test('it re-enables candidate results edit button', async function(assert) {
      // when
      await visit(`/certifications/${certification.id}`);
      await clickByLabel('Modifier les informations du candidat');
      await clickByLabel('Annuler la modification des informations du candidat');

      // then
      assert.dom('[aria-label="Modifier les résultats du candidat"]').exists().isEnabled();
    });
  });

  module('when candidate information form is submitted', function() {
    test('it also hides candidate informations form', async function(assert) {
      // when
      await visit(`/certifications/${certification.id}`);
      await clickByLabel('Modifier les informations du candidat');
      await clickByLabel('Enregistrer les informations du candidat');

      // then
      assert.dom('#certification-firstName').doesNotExist();
    });

    test('it also re-enables candidate results edit button', async function(assert) {
      // when
      await visit(`/certifications/${certification.id}`);
      await clickByLabel('Modifier les informations du candidat');
      await clickByLabel('Annuler la modification des informations du candidat');

      // then
      assert.dom('[aria-label="Modifier les résultats du candidat"]').exists().isEnabled();
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
