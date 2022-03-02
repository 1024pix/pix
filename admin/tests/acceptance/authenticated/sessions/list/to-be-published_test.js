import { module, test } from 'qunit';
import { visit, currentURL, click } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { createAuthenticateSession } from 'pix-admin/tests/helpers/test-init';
import { clickByName } from '@1024pix/ember-testing-library';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Acceptance | authenticated/sessions/list/to be published', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  const SESSIONS_TO_BE_PUBLISHED_LIST_PAGE = '/sessions/list/to-be-published';

  module('When user is not logged in', function () {
    test('it should not be accessible by an unauthenticated user', async function (assert) {
      // when
      await visit(SESSIONS_TO_BE_PUBLISHED_LIST_PAGE);

      // then
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line qunit/no-assert-equal
      assert.equal(currentURL(), '/login');
    });
  });

  module('When user is logged in', function (hooks) {
    hooks.beforeEach(async function () {
      // given
      const { id: userId } = server.create('user');
      await createAuthenticateSession({ userId });
    });

    test('visiting /sessions/list/to-be-published', async function (assert) {
      // when
      await visit(SESSIONS_TO_BE_PUBLISHED_LIST_PAGE);

      // then
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line qunit/no-assert-equal
      assert.equal(currentURL(), SESSIONS_TO_BE_PUBLISHED_LIST_PAGE);
    });

    test('it should display sessions to publish informations', async function (assert) {
      assert.expect(7);
      // given
      const sessionDate = '2021-01-01';
      const sessionTime = '17:00:00';
      const finalizedAt = new Date('2021-02-01T03:00:00Z');
      server.create('to-be-published-session', {
        id: '1',
        certificationCenterName: 'Centre SCO des Anne-Étoiles',
        finalizedAt,
        sessionDate,
        sessionTime,
      });
      server.create('to-be-published-session', {
        id: '2',
        certificationCenterName: 'Centre SUP et rieur',
        finalizedAt,
        sessionDate,
        sessionTime,
      });

      // when
      await visit(SESSIONS_TO_BE_PUBLISHED_LIST_PAGE);

      // then

      _assertSessionInformationsAreDisplayed(assert);
      _assertPublishAllSessionsButtonDisplayed(assert);
    });

    test('it should publish a session', async function (assert) {
      assert.expect(2);
      // given
      const sessionDate = '2021-01-01';
      const sessionTime = '17:00:00';
      const finalizedAt = new Date('2021-02-01T03:00:00Z');
      server.create('to-be-published-session', {
        id: '1',
        certificationCenterName: 'Centre SCO des Anne-Étoiles',
        finalizedAt,
        sessionDate,
        sessionTime,
      });
      server.create('to-be-published-session', {
        id: '2',
        certificationCenterName: 'Centre SUP et rieur',
        finalizedAt,
        sessionDate,
        sessionTime,
      });
      await visit(SESSIONS_TO_BE_PUBLISHED_LIST_PAGE);
      await click('[aria-label="Publier la session numéro 2"]');

      // when
      await click('.modal-footer .btn-primary');

      // then
      _assertFirstSessionIsDisplayed(assert);
      _assertSecondSessionIsNotDisplayed(assert);
    });

    test('it should publish a batch of sessions', async function (assert) {
      assert.expect(3);
      // given
      const sessionDate = '2021-01-01';
      const sessionTime = '17:00:00';
      const finalizedAt = new Date('2021-02-01T03:00:00Z');
      server.create('to-be-published-session', {
        id: '1',
        certificationCenterName: 'Centre SCO des Anne-Étoiles',
        finalizedAt,
        sessionDate,
        sessionTime,
      });
      server.create('to-be-published-session', {
        id: '2',
        certificationCenterName: 'Centre SUP et rieur',
        finalizedAt,
        sessionDate,
        sessionTime,
      });

      await visit(SESSIONS_TO_BE_PUBLISHED_LIST_PAGE);
      await clickByName('Publier toutes les sessions');

      // when
      await click('.modal-footer .btn-primary');

      // then
      _assertPublishAllSessionsButtonHidden(assert);
      _assertNoSessionInList(assert);
      _assertConfirmModalIsClosed(assert);
    });
  });
});

function _assertPublishAllSessionsButtonDisplayed(assert) {
  assert.contains('Publier toutes les sessions');
}

function _assertSessionInformationsAreDisplayed(assert) {
  assert.contains('Centre SCO des Anne-Étoiles');
  assert.contains('Centre SUP et rieur');
  assert.contains('1');
  assert.contains('2');
  assert.contains('01/01/2021 à 17:00:00');
  assert.contains('01/02/2021');
}

function _assertFirstSessionIsDisplayed(assert) {
  assert.contains('Centre SCO des Anne-Étoiles');
}

function _assertSecondSessionIsNotDisplayed(assert) {
  assert.notContains('Centre SUP et rieur');
}

function _assertPublishAllSessionsButtonHidden(assert) {
  assert.notContains('Publier toutes les sessions');
}

function _assertNoSessionInList(assert) {
  assert.contains('Aucun résultat');
}

function _assertConfirmModalIsClosed(assert) {
  assert.notContains('Merci de confirmer');
}
