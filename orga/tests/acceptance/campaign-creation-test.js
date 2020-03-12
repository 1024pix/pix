import { module, test } from 'qunit';
import { click, currentURL, fillIn, visit } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { authenticateSession } from 'ember-simple-auth/test-support';
import { createUserWithMembershipAndTermsOfServiceAccepted } from '../helpers/test-init';

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

  module('when the user is authenticated', (hooks) => {

    let availableTargetProfiles;
    let user;

    hooks.beforeEach(async function() {
      user = createUserWithMembershipAndTermsOfServiceAccepted();
      availableTargetProfiles = server.createList('target-profile', 2);
      await authenticateSession({
        user_id: user.id,
        access_token: 'aaa.' + btoa(`{"user_id":${user.id},"source":"pix","iat":1545321469,"exp":4702193958}`) + '.bbb',
        expires_in: 3600,
        token_type: 'Bearer token type',
      });
    });

    hooks.afterEach(function() {
      const notificationMessagesService = this.owner.lookup('service:notifications');
      notificationMessagesService.clearAll();
    });

    test('it should be accessible for an authenticated user', async function(assert) {
      // when
      await visit('/campagnes/creation');

      // then
      assert.equal(currentURL(), '/campagnes/creation');
      assert.dom('.page__title').hasText('Création d\'une campagne');
    });

    test('it should not display gdpr footnote', async function(assert) {
      // when
      await visit('/campagnes/creation');

      // then
      assert.dom('.new-item-form__gdpr-information').isNotVisible();
    });

    test('it should display gdpr footnote', async function(assert) {
      // when
      await visit('/campagnes/creation');
      await click('#askLabelIdPix');

      // then
      assert.dom('.new-item-form__gdpr-information').isVisible();
      assert.dom('.new-item-form__gdpr-information').hasText(
        '* En vertu de la loi Informatique et libertés, et en tant que responsable de traitement, soyez attentifs à ne pas demander de donnée particulièrement identifiante ou signifiante si ce n’est pas absolument indispensable. Le numéro de sécurité sociale (NIR) est à proscrire ainsi que toute donnée sensible.'
      );
    });

    test('it should allow to create a campaign and redirect to the newly created campaign', async function(assert) {
      // given
      const expectedTargetProfileId = availableTargetProfiles[1].id;

      await visit('/campagnes/creation');
      await fillIn('#campaign-target-profile', expectedTargetProfileId);
      await fillIn('#campaign-name', 'Ma Campagne');
      await click('#askLabelIdPix');
      await fillIn('#id-pix-label', 'Mail Pro');
      await fillIn('#campaign-title', 'Savoir rechercher');
      await fillIn('#custom-landing-page-text', 'Texte personnalisé');

      // when
      await click('button[type="submit"]');

      // then
      assert.equal(server.db.campaigns[0].name, 'Ma Campagne');
      assert.equal(server.db.campaigns[0].title, 'Savoir rechercher');
      assert.equal(server.db.campaigns[0].targetProfileId, expectedTargetProfileId);
      assert.equal(server.db.campaigns[0].customLandingPageText, 'Texte personnalisé');
      assert.equal(currentURL(), '/campagnes/1');
    });

    test('it should display a list of target profiles', async function(assert) {
      // given
      const nbTargetProfiles = availableTargetProfiles.length;

      // when
      await visit('/campagnes/creation');

      // then
      assert.dom('select#campaign-target-profile').exists();
      assert.dom('select[id=campaign-target-profile] option:not(:disabled)').exists({ count: nbTargetProfiles });
      assert.dom(`select[id=campaign-target-profile] option[value="${availableTargetProfiles.get(0).id}"]`).hasText(availableTargetProfiles.get(0).name);
      assert.dom(`select[id=campaign-target-profile] option[value="${availableTargetProfiles.get(1).id}"]`).hasText(availableTargetProfiles.get(1).name);
    });

    test('it should display error on global form when error 500 is returned from backend', async function(assert) {
      // given
      server.post('/campaigns', {}, 500);
      await visit('/campagnes/creation');

      // when
      await click('button[type="submit"]');

      // then
      assert.equal(currentURL(), '/campagnes/creation');
      assert.dom('[data-test-notification-message="error"]').exists();
      assert.dom('[data-test-notification-message="error"]').hasText('Quelque chose s\'est mal passé. Veuillez réessayer.');
    });
  });
});
