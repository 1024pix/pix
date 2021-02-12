import { module, test } from 'qunit';
import { visit, currentURL, click } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { createAuthenticateSession } from 'pix-admin/tests/helpers/test-init';

import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Acceptance | authenticated/sessions/list/to be published', function(hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  module('When user is not logged in', function() {

    test('it should not be accessible by an unauthenticated user', async function(assert) {
      // when
      await visit('/sessions/list/to-be-published');

      // then
      assert.equal(currentURL(), '/login');
    });
  });

  module('When user is logged in', function(hooks) {

    hooks.beforeEach(async () => {
      // given
      await createAuthenticateSession({ userId: 1 });
    });

    test('visiting /sessions/list/to-be-published', async function(assert) {
      // when
      await visit('/sessions/list/to-be-published');

      // then
      assert.equal(currentURL(), '/sessions/list/to-be-published');
    });

    test('it should display sessions to publish informations', async function(assert) {
      // given
      const sessionDate = new Date('2021-01-01');
      const sessionTime = '17:00:00';
      const finalizedAt = new Date('2021-02-01T03:00:00Z');
      server.create('publishable-session', {
        id: '1',
        certificationCenterName: 'Centre SCO des Anne-Étoiles',
        finalizedAt,
        sessionDate,
        sessionTime,
      });
      server.create('publishable-session', {
        id: '2',
        certificationCenterName: 'Centre SUP et rieur',
        finalizedAt,
        sessionDate,
        sessionTime,
      });

      // when
      await visit('/sessions/list/to-be-published');

      // then
      assert.contains('Centre SCO des Anne-Étoiles');
      assert.contains('Centre SUP et rieur');
      assert.contains('1');
      assert.contains('2');
      assert.contains('01/01/2021 à 17:00:00');
      assert.contains('01/02/2021');
    });

    test('it should publish a session', async function(assert) {
      // given
      const sessionDate = new Date('2021-01-01');
      const sessionTime = '17:00:00';
      const finalizedAt = new Date('2021-02-01T03:00:00Z');
      server.create('publishable-session', {
        id: '1',
        certificationCenterName: 'Centre SCO des Anne-Étoiles',
        finalizedAt,
        sessionDate,
        sessionTime,
      });
      server.create('publishable-session', {
        id: '2',
        certificationCenterName: 'Centre SUP et rieur',
        finalizedAt,
        sessionDate,
        sessionTime,
      });
      await visit('/sessions/list/to-be-published');
      await click('[aria-label="Publier la session numéro 2"]');

      // when
      await click('.btn-primary');

      // then
      assert.contains('1');
      assert.notContains('2');
    });
  });
});
