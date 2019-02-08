import { module, test } from 'qunit';
import { click, currentURL, fillIn, visit } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { authenticateSession } from 'ember-simple-auth/test-support';
import { createUserWithMembership } from '../helpers/test-init';

import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Acceptance | Session Update', function(hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach( async () => {
    let user = createUserWithMembership();
    await authenticateSession({ user_id: user.id });
  });

  test('it should allow to update a session and redirect to the sessions list', async function(assert) {
    // given
    let session = server.create('session', { id: 1 });
    let newRoom = "New room";
    let newExaminer = "New examiner";

    await visit(`/sessions/${session.id}/modification`);
    await fillIn('#session-room', newRoom);
    await fillIn('#session-examiner', newExaminer);

    // when
    await click('button[type="submit"]');

    // then
    assert.equal(server.db.sessions.find(1).room, newRoom);
    assert.equal(server.db.sessions.find(1).examiner, newExaminer);
    assert.equal(currentURL(), '/sessions/liste');
  });

  test('it should not update a session when cancel button is clicked and redirect to the sessions list', async function(assert) {
    // given
    let session = server.create('session', { id: 1, room: 'current room', examiner: 'current examiner' });
    let newRoom = "New room";
    let newExaminer = "New examiner";

    await visit(`/sessions/${session.id}/modification`);
    await fillIn('#session-room', newRoom);
    await fillIn('#session-examiner', newExaminer);

    // when
    await click('button[data-action="cancel"]');

    // then
    assert.equal(server.db.sessions.find(1).room, 'current room');
    assert.equal(server.db.sessions.find(1).examiner, 'current examiner');
    assert.equal(currentURL(), '/sessions/liste');
  });
});
