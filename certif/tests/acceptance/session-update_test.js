import { module, test } from 'qunit';
import { click, currentURL, visit, fillIn } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { authenticateSession } from '../helpers/test-init';

import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Acceptance | Session Update', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  let allowedCertificationCenterAccess;
  let certificationPointOfContact;

  hooks.beforeEach(async function () {
    allowedCertificationCenterAccess = server.create('allowed-certification-center-access', {
      isAccessBlockedCollege: false,
      isAccessBlockedLycee: false,
      isAccessBlockedAEFE: false,
      isAccessBlockedAgri: false,
    });
    certificationPointOfContact = server.create('certification-point-of-contact', {
      firstName: 'Buffy',
      lastName: 'Summers',
      pixCertifTermsOfServiceAccepted: true,
      allowedCertificationCenterAccesses: [allowedCertificationCenterAccess],
    });
    await authenticateSession(certificationPointOfContact.id);
  });

  module('when current certification center is blocked', function () {
    test('should redirect to espace-ferme URL', async function (assert) {
      // given
      const session = server.create('session', { certificationCenterId: allowedCertificationCenterAccess.id });
      allowedCertificationCenterAccess.update({ isAccessBlockedCollege: true });

      // when
      await visit(`/sessions/${session.id}/modification`);

      // then
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line qunit/no-assert-equal
      assert.equal(currentURL(), '/espace-ferme');
    });
  });

  test('it should fill the updating form with the current values of the session', async function (assert) {
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

  test('it should allow to update a session and redirect to the session details', async function (assert) {
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
    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line qunit/no-assert-equal
    assert.equal(session.room, newRoom);
    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line qunit/no-assert-equal
    assert.equal(session.examiner, newExaminer);
    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line qunit/no-assert-equal
    assert.equal(currentURL(), `/sessions/${session.id}`);
  });

  test('it should not update a session when cancel button is clicked and redirect to the session #1 details', async function (assert) {
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
    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line qunit/no-assert-equal
    assert.equal(session.room, 'beforeRoom');
    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line qunit/no-assert-equal
    assert.equal(session.examiner, 'beforeExaminer');
    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line qunit/no-assert-equal
    assert.equal(currentURL(), `/sessions/${session.id}`);
  });
});
