import { module, test } from 'qunit';
import { click, currentURL, fillIn, visit } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { authenticateSession } from 'ember-simple-auth/test-support';
import { createUserWithMembershipAndTermsOfServiceAccepted } from '../helpers/test-init';

import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Acceptance | Session Update', function(hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async () => {
    const user = createUserWithMembershipAndTermsOfServiceAccepted();

    await authenticateSession({
      user_id: user.id,
      access_token: 'aaa.' + btoa(`{"user_id":${user.id},"source":"pix","iat":1545321469,"exp":4702193958}`) + '.bbb',
      expires_in: 3600,
      token_type: 'Bearer token type',
    });
  });

  test('it should fill the updating form with the current values of the session', async function(assert) {
    // given
    const session = server.create('session');

    // when
    await visit(`/sessions/${session.id}/modification`);

    // then
    assert.dom('#session-room').hasValue(session.room);
    assert.dom('#session-examiner').hasValue(session.examiner);
    assert.dom('#session-address').hasValue(session.address);
    assert.dom('#session-description').hasValue(session.description);
    assert.dom('#session-date').hasValue(session.date);
    assert.dom('#session-time').hasValue(session.time);
  });

  test('it should allow to update a session and redirect to the session details', async function(assert) {
    // given
    const session = server.create('session', { room: 'beforeRoom', examiner: 'beforeExaminer' });
    const newRoom = 'New room';
    const newExaminer = 'New examiner';

    await visit(`/sessions/${session.id}/modification`);
    await fillIn('#session-room', newRoom);
    await fillIn('#session-examiner', newExaminer);

    // when
    await click('[data-test-id="session-form__submit-button"]');

    // then
    session.reload();
    assert.equal(session.room, newRoom);
    assert.equal(session.examiner, newExaminer);
    assert.equal(currentURL(), `/sessions/${session.id}`);
  });

  test('it should not update a session when cancel button is clicked and redirect to the session #1 details', async function(assert) {
    // given
    const session = server.create('session', { room: 'beforeRoom', examiner: 'beforeExaminer' });
    const newRoom = 'New room';
    const newExaminer = 'New examiner';

    await visit(`/sessions/${session.id}/modification`);
    await fillIn('#session-room', newRoom);
    await fillIn('#session-examiner', newExaminer);

    // when
    await click('[data-test-id="session-form__cancel-button"]');

    // then
    session.reload();
    assert.equal(session.room, 'beforeRoom');
    assert.equal(session.examiner, 'beforeExaminer');
    assert.equal(currentURL(), `/sessions/${session.id}`);
  });
});
