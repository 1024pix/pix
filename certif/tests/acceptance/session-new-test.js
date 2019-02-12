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

  module('when the user is authenticated', ({ beforeEach }) => {
    let user;

    beforeEach(async function() {
      user = createUserWithMembership();
      await authenticateSession({
        user_id: user.id,
      });
    });

    test('it should create a session', async function(assert) {
      // given
      let formattedDate = '02/02/2019';
      let date = new Date(formattedDate);
      let formattedDateWithTime = '02/02/2019 13:45';
      let dateWithTime = new Date(formattedDateWithTime);


      await visit('/sessions/creation');
      await fillIn('#session-address', 'My address');
      await fillIn('#session-room', 'My room');
      await fillIn('#session-examiner', 'My examiner');
      await fillIn('#session-description', 'My description');
      await setFlatpickrDate('#session-date', date);
      await setFlatpickrDate('#session-time', dateWithTime);

      // when
      await click('button[type="submit"]');

      // then
      assert.equal(server.db.sessions[0].address, 'My address');
      assert.equal(server.db.sessions[0].room, 'My room');
      assert.equal(server.db.sessions[0].examiner, 'My examiner');
      assert.equal(server.db.sessions[0].description, 'My description');
      assert.equal(server.db.sessions[0].date, formattedDate);
      assert.equal(server.db.sessions[0].time, '13:45');
      assert.equal(currentURL(), '/sessions/liste');
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
