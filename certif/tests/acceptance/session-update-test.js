import { module, test } from 'qunit';
import { click, currentURL, fillIn, visit } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { authenticateSession } from 'ember-simple-auth/test-support';
import { createUserWithMembership } from '../helpers/test-init';

import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Acceptance | Session Update', function(hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async () => {
    const user = createUserWithMembership();
    await authenticateSession({ user_id: user.id });
  });

  test('it should allow to update a session and redirect to the session #1 details', async function(assert) {
    // given
    const session = server.create('session', { id: 1, date: '12/10/2010', time: '13:00' });
    const newRoom = 'New room';
    const newExaminer = 'New examiner';

    await visit(`/sessions/${session.id}/modification`);
    await fillIn('#session-room', newRoom);
    await fillIn('#session-examiner', newExaminer);

    // when
    await click('button[type="submit"]');

    // then
    assert.equal(server.db.sessions.find(1).room, newRoom);
    assert.equal(server.db.sessions.find(1).examiner, newExaminer);
    assert.equal(currentURL(), `/sessions/${session.id}`);
  });

  test('it should not update a session when cancel button is clicked and redirect to the session #1 details', async function(assert) {
    // given
    const session = server.create('session', { id: 1, room: 'current room', examiner: 'current examiner', date: '12/10/2010', time: '13:00' });
    const newRoom = 'New room';
    const newExaminer = 'New examiner';

    await visit(`/sessions/${session.id}/modification`);
    await fillIn('#session-room', newRoom);
    await fillIn('#session-examiner', newExaminer);

    // when
    await click('button[data-action="cancel"]');

    // then
    assert.equal(server.db.sessions.find(1).room, 'current room');
    assert.equal(server.db.sessions.find(1).examiner, 'current examiner');
    assert.equal(currentURL(), `/sessions/${session.id}`);
  });
});
