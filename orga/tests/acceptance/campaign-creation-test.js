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

  module('when the user is authenticated', ({ beforeEach }) => {

    let availableTargetProfiles;
    let user;

    beforeEach(async function() {
      user = createUserWithOrganizationAccess();
      availableTargetProfiles = server.createList('target-profile', 2);
      await authenticateSession({
        user_id: user.id,
      });
    });

    test('it should be accessible for an authenticated user', async function(assert) {
      // when
      await visit('/campagnes/creation');

      // then
      assert.equal(currentURL(), '/campagnes/creation');
      assert.dom('.page__title').hasText('Création d\'une campagne');
    });

    test('it should allow to create a campaign', async function(assert) {
      // given
      const expectedTargetProfileId = availableTargetProfiles[1].id;

      await visit('/campagnes/creation');
      await fillIn('#campaign-target-profile', expectedTargetProfileId);
      await fillIn('#campaign-name', 'Ma Campagne');
      await click('#askLabelIdPix');
      await fillIn('#id-pix-label', 'Mail Pro');

      // when
      await click('.campaign-creation-form__validation-button');

      // then
      assert.equal(server.db.campaigns[0].name, 'Ma Campagne');
      assert.equal(server.db.campaigns[0].targetProfileId, expectedTargetProfileId);
      assert.equal(currentURL(), '/campagnes/liste');
    });

    test('it should display a list of target profiles', async function(assert) {
      // given
      let nbTargetProfiles = availableTargetProfiles.length;

      // when
      await visit('/campagnes/creation');

      // then
      assert.dom('select#campaign-target-profile').exists();
      assert.dom('select[id=campaign-target-profile] option:not(:disabled)').exists({ count: nbTargetProfiles });
      assert.dom(`select[id=campaign-target-profile] option[value="${availableTargetProfiles.get(0).id}"]`).hasText(availableTargetProfiles.get(0).name)
      assert.dom(`select[id=campaign-target-profile] option[value="${availableTargetProfiles.get(1).id}"]`).hasText(availableTargetProfiles.get(1).name)
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
      await visit('/campagnes/creation');

      // when
      await click('.campaign-creation-form__validation-button');

      // then
      assert.equal(currentURL(), '/campagnes/creation');
      assert.dom('.new-campaign-page__error').exists();
      assert.dom('.new-campaign-page__error').hasText('Une erreur est intervenue lors de l\'enregistrement de la campagne');
    });
  });
});
