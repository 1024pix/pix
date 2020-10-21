import { module, test } from 'qunit';
import { click, currentURL, visit } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import {
  createUserWithMembershipAndTermsOfServiceAccepted,
  authenticateSession,
} from '../helpers/test-init';

import config from 'pix-certif/config/environment';

import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Acceptance | Session Details', function(hooks) {
  
  setupApplicationTest(hooks);
  setupMirage(hooks);
  
  hooks.afterEach(function() {
    const notificationMessagesService = this.owner.lookup('service:notifications');
    notificationMessagesService.clearAll();
  });
  
  module('when user is not logged in', function() {
    
    test('it should not be accessible by an unauthenticated user', async function(assert) {
      // given
      const session = server.create('session');

      // when
      await visit(`/sessions/${session.id}`);
      
      // then
      assert.equal(currentURL(), '/connexion');
    });
  });
  
  module('when user is logged in', function(hooks) {

    let user;

    hooks.beforeEach(async () => {
      user = createUserWithMembershipAndTermsOfServiceAccepted();
      await authenticateSession(user.id);
    });
    
    test('it should redirect to session list on click on return button', async function(assert) {
      // given
      const session = server.create('session');
      
      // when
      await visit(`/sessions/${session.id}`);
      await click('.session-details-content__return-button');

      // then
      assert.equal(currentURL(), '/sessions/liste');
    });

    module('when looking at the header', function() {

      test('it should display session details', async function(assert) {
        // given
        const session = server.create('session', {
          date: '2019-02-18',
          time: '14:00',
        });

        // when
        await visit(`/sessions/${session.id}`);

        // then
        assert.dom('.session-details-header__title h1').hasText(`Session ${session.id}`);
        assert.dom('.session-details-container .session-details-row:first-child div:nth-child(2) span').hasText(`${session.address}`);
        assert.dom('.session-details-container .session-details-row:first-child div:nth-child(3) span').hasText(`${session.room}`);
        assert.dom('.session-details-container .session-details-row:first-child div:nth-child(4) span').hasText(`${session.examiner}`);
        assert.dom('.session-details-container .session-details-row:first-child div:nth-child(5) span:first-child').hasText(`${session.accessCode}`);
        assert.dom('.session-details-header-datetime__date .content-text').hasText('lundi 18 févr. 2019');
        assert.dom('.session-details-header-datetime__time .content-text').hasText('14:00');
      });

      module('when FT_IS_RESULT_RECIPIENT_EMAIL_VISIBLE is on', function(hooks) {

        const ft = config.APP.FT_IS_RESULT_RECIPIENT_EMAIL_VISIBLE;

        hooks.before(() => {
          config.APP.FT_IS_RESULT_RECIPIENT_EMAIL_VISIBLE = true;
        });

        hooks.after(() => {
          config.APP.FT_IS_RESULT_RECIPIENT_EMAIL_VISIBLE = ft;
        });

        test('it should show download button when there is one or more candidate', async function(assert) {
          // given
          const sessionWithCandidates = server.create('session');
          server.createList('certification-candidate', 3, { isLinked: true, sessionId: sessionWithCandidates.id });

          // when
          await visit(`/sessions/${sessionWithCandidates.id}`);

          // then
          assert.dom('.session-details-header__title .button').hasText('Télécharger le PV');
        });

        test('it should not show download button where there is no candidate', async function(assert) {
          // given
          const sessionWithoutCandidate = server.create('session');

          // when
          await visit(`/sessions/${sessionWithoutCandidate.id}`);

          // then
          assert.dom('.session-details-header__title .button').doesNotExist();
        });
      });

      module('when FT_IS_RESULT_RECIPIENT_EMAIL_VISIBLE is off', function(hooks) {

        const ft = config.APP.FT_IS_RESULT_RECIPIENT_EMAIL_VISIBLE;

        hooks.before(() => {
          config.APP.FT_IS_RESULT_RECIPIENT_EMAIL_VISIBLE = false;
        });

        hooks.after(() => {
          config.APP.FT_IS_RESULT_RECIPIENT_EMAIL_VISIBLE = ft;
        });

        test('it should not show download button', async function(assert) {
          // given
          const sessionWithCandidates = server.create('session');
          server.createList('certification-candidate', 3, { isLinked: true });

          // when
          await visit(`/sessions/${sessionWithCandidates.id}`);

          // then
          assert.dom('.session-details-header__title .button').doesNotExist();
        });
      });
    });

  });
});
