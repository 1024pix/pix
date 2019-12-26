import { module, test } from 'qunit';
import { click, currentURL, fillIn, visit } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { authenticateSession } from 'ember-simple-auth/test-support';
import { createUserWithMembership } from '../helpers/test-init';

import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { setFlatpickrDate } from 'ember-flatpickr/test-support/helpers';

module('Acceptance | Session creation', function(hooks) {

  setupApplicationTest(hooks);
  setupMirage(hooks);

  test('it should not be accessible by an unauthenticated user', async function(assert) {
    // when
    await visit('/sessions/creation');

    // then
    assert.equal(currentURL(), '/connexion');
  });

  module('when the user is authenticated', (hooks) => {
    let user;

    hooks.beforeEach(async () => {
      user = createUserWithMembership();

      await authenticateSession({
        user_id: user.id,
        access_token: 'aaa.' + btoa(`{"user_id":${user.id},"source":"pix","iat":1545321469,"exp":4702193958}`) + '.bbb',
        expires_in: 3600,
        token_type: 'Bearer token type',
      });
    });

    test('it should create a session and redirect to session details', async function(assert) {
      // given
      const sessionDate = '2029-12-25';
      const sesionFormattedTime = '02/02/2019 13:45';
      const sessionTime = new Date(sesionFormattedTime);

      await visit('/sessions/creation');
      await fillIn('#session-address', 'My address');
      await fillIn('#session-room', 'My room');
      await fillIn('#session-examiner', 'My examiner');
      await fillIn('#session-description', 'My description');
      await setFlatpickrDate('#session-date', sessionDate);
      await setFlatpickrDate('#session-time', sessionTime);

      // when
      await click('button[type="submit"]');

      // then
      const session = server.db.sessions[0];
      assert.equal(session.address, 'My address');
      assert.equal(session.room, 'My room');
      assert.equal(session.examiner, 'My examiner');
      assert.equal(session.description, 'My description');
      assert.equal(session.date, sessionDate);
      assert.equal(session.time, '13:45');
      assert.equal(currentURL(), `/sessions/${session.id}`);
    });

    test('it should go back to sessions list on cancel', async function(assert) {
      // given
      await visit('/sessions/creation');

      // when
      await click('.button--no-color');

      // then
      assert.equal(currentURL(), '/sessions/liste');
    });
  });
});
