import { module, test } from 'qunit';
import { visit, currentURL } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { createAuthenticateSession } from 'pix-admin/tests/helpers/test-init';

import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Acceptance | authenticated/sessions/list/with required action', function(hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  module('When user is not logged in', function() {

    test('it should not be accessible by an unauthenticated user', async function(assert) {
      // when
      await visit('/sessions/list/with-required-action');

      // then
      assert.equal(currentURL(), '/login');
    });
  });

  module('When user is logged in', function(hooks) {

    hooks.beforeEach(async () => {
      // given
      await createAuthenticateSession({ userId: 1 });
    });

    test('visiting /sessions/list/with-required-action', async function(assert) {
      // when
      await visit('/sessions/list/with-required-action');

      // then
      assert.equal(currentURL(), '/sessions/list/with-required-action');
    });

    test('it should display sessions with required action informations', async function(assert) {
      // given
      const sessionDate = '2021-01-01';
      const sessionTime = '17:00:00';
      const finalizedAt = new Date('2021-02-01T03:00:00Z');
      server.create('with-required-action-session', {
        id: '1',
        certificationCenterName: 'Centre SCO des Anne-Étoiles',
        finalizedAt,
        sessionDate,
        sessionTime,
        assignedCertificationOfficerName: 'Officer1',
      });
      server.create('with-required-action-session', {
        id: '2',
        certificationCenterName: 'Centre SUP et rieur',
        finalizedAt,
        sessionDate,
        sessionTime,
        assignedCertificationOfficerName: 'Officer2',
      });

      // when
      await visit('/sessions/list/with-required-action');

      // then
      _assertSession1InformationsAreDisplayed(assert);
      _assertSession2InformationsAreDisplayed(assert);
    });
  });
});

function _assertSession1InformationsAreDisplayed(assert) {
  assert.contains('Centre SCO des Anne-Étoiles');
  assert.contains('1');
  assert.contains('01/01/2021 à 17:00:00');
  assert.contains('Officer1');
}

function _assertSession2InformationsAreDisplayed(assert) {
  assert.contains('Centre SUP et rieur');
  assert.contains('2');
  assert.contains('01/02/2021');
  assert.contains('Officer2');
}
