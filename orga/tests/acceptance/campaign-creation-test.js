import { module, test } from 'qunit';
import { click, currentURL, fillIn, visit } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { authenticateSession } from 'ember-simple-auth/test-support';
import { createUserWithOrganizationAccess } from '../helpers/test-init';

import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Acceptance | Campaign Creation', function(hooks) {

  setupApplicationTest(hooks);
  setupMirage(hooks);

  test('it should not be accessible by an unauthenticated user', async function(assert) {
    // when
    await visit('/campagnes/creation');

    // then
    assert.equal(currentURL(), '/connexion');
  });

  test('it should be accessible for an authenticated user', async function(assert) {
    // given
    const user = createUserWithOrganizationAccess();

    await authenticateSession({
      user_id: user.id,
    });

    // when
    await visit('/campagnes/creation');

    // then
    assert.equal(currentURL(), '/campagnes/creation');
    assert.dom('.page__title').hasText('Création d\'une campagne');
  });

  test('it should allow creating a campaign', async function(assert) {
    // given
    const user = createUserWithOrganizationAccess();

    await authenticateSession({
      user_id: user.id,
    });
    await visit('/campagnes/creation');
    await fillIn('#campaign-name', 'Ma Campagne');

    // when
    await click('.campaign-creation-form__validation-button');

    // then
    assert.equal(server.db.campaigns[0].name, 'Ma Campagne');
    assert.equal(currentURL(), '/campagnes/liste');
  });

  test('it should display error on global form when error 500 is returned from backend', async function(assert) {
    // given
    server.post('/campaigns',
      {
        errors: [
          {
            detail: 'Une erreur est intervenue lors de l\'enregistrement de la campagne',
            status: '500',
            title: 'Internal Server Error',
          }
        ]
      }, 500);

    const user = createUserWithOrganizationAccess();
    await authenticateSession({
      user_id: user.id,
    });
    await visit('/campagnes/creation');

    // when
    await click('.campaign-creation-form__validation-button');

    // then
    assert.equal(currentURL(), '/campagnes/creation');
    assert.dom('.new-campaign-page__error').exists();
    assert.dom('.new-campaign-page__error').hasText('Une erreur est intervenue lors de l\'enregistrement de la campagne');
  });
});
