import { module, test } from 'qunit';
import { currentURL } from '@ember/test-helpers';
import { visit } from '@1024pix/ember-testing-library';
import { setupApplicationTest } from 'ember-qunit';
import { clickByName } from '@1024pix/ember-testing-library';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { authenticateAdminMemberWithRole } from '../../../../helpers/test-init';

module('Acceptance | authenticated/sessions/list/to be published', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  const SESSIONS_TO_BE_PUBLISHED_LIST_PAGE = '/sessions/list/to-be-published';

  module('When user is not logged in', function () {
    test('it should not be accessible by an unauthenticated user', async function (assert) {
      // when
      await visit(SESSIONS_TO_BE_PUBLISHED_LIST_PAGE);

      // then
      assert.strictEqual(currentURL(), '/login');
    });
  });

  module('When user is logged in', function () {
    test('visiting /sessions/list/to-be-published', async function (assert) {
      // given
      await authenticateAdminMemberWithRole({ isSuperAdmin: true })(server);

      // when
      await visit(SESSIONS_TO_BE_PUBLISHED_LIST_PAGE);

      // then
      assert.strictEqual(currentURL(), SESSIONS_TO_BE_PUBLISHED_LIST_PAGE);
    });

    test('it should display sessions to publish informations', async function (assert) {
      assert.expect(7);
      // given
      await authenticateAdminMemberWithRole({ isSuperAdmin: true })(server);
      const finalizedAt = new Date('2021-02-01T03:00:00Z');
      server.create('to-be-published-session', {
        id: '1',
        certificationCenterName: 'Centre SCO des Anne-Étoiles',
        finalizedAt,
        sessionDate: '2021-01-01',
        sessionTime: '17:00:00',
      });
      server.create('to-be-published-session', {
        id: '2',
        certificationCenterName: 'Centre SUP et rieur',
        finalizedAt,
        sessionDate: '2022-10-03',
        sessionTime: '11:10:00',
      });

      // when
      const screen = await visit(SESSIONS_TO_BE_PUBLISHED_LIST_PAGE);

      // then
      _assertSessionInformationsAreDisplayed(assert, screen);
      _assertPublishAllSessionsButtonDisplayed(assert, screen);
    });

    test('it should publish a session', async function (assert) {
      assert.expect(2);
      // given
      await authenticateAdminMemberWithRole({ isSuperAdmin: true })(server);
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
      const screen = await visit(SESSIONS_TO_BE_PUBLISHED_LIST_PAGE);
      await clickByName('Publier la session numéro 2');

      // when
      await clickByName('Confirmer');

      // then
      _assertFirstSessionIsDisplayed(assert, screen);
      _assertSecondSessionIsNotDisplayed(assert, screen);
    });

    module('publish a batch of sessions button', function () {
      test('it should be hidden if current user is Metier', async function (assert) {
        // given
        await authenticateAdminMemberWithRole({ isMetier: true })(server);

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
        const screen = await visit(SESSIONS_TO_BE_PUBLISHED_LIST_PAGE);

        // then
        assert.dom(screen.queryByText('Publier toutes les sessions')).doesNotExist();
      });

      test('it should be clickable if current user is Certif', async function (assert) {
        assert.expect(3);
        // given
        await authenticateAdminMemberWithRole({ isCertif: true })(server);
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

        const screen = await visit(SESSIONS_TO_BE_PUBLISHED_LIST_PAGE);
        await clickByName('Publier toutes les sessions');

        // when
        await clickByName('Confirmer');

        // then
        _assertPublishAllSessionsButtonHidden(assert, screen);
        _assertNoSessionInList(assert, screen);
        _assertConfirmModalIsClosed(assert, screen);
      });
    });
  });
});

function _assertPublishAllSessionsButtonDisplayed(assert, screen) {
  assert.dom(screen.getByText('Publier toutes les sessions')).exists();
}

function _assertSessionInformationsAreDisplayed(assert, screen) {
  assert.dom(screen.getByText('Centre SCO des Anne-Étoiles')).exists();
  assert.dom(screen.getByText('Centre SUP et rieur')).exists();
  assert.dom(screen.getByText('1')).exists();
  assert.dom(screen.getByText('2')).exists();
  assert.dom(screen.getByText('01/01/2021 à 17:00:00')).exists();
  assert.dom(screen.getByText('03/10/2022 à 11:10:00')).exists();
}

function _assertFirstSessionIsDisplayed(assert, screen) {
  assert.dom(screen.getByText('Centre SCO des Anne-Étoiles')).exists();
}

function _assertSecondSessionIsNotDisplayed(assert, screen) {
  assert.dom(screen.queryByRole('heading', { name: 'Centre SUP et rieur' })).doesNotExist();
}

function _assertPublishAllSessionsButtonHidden(assert, screen) {
  assert.dom(screen.queryByRole('button', { name: 'Publier toutes les sessions' })).doesNotExist();
}

function _assertNoSessionInList(assert, screen) {
  assert.dom(screen.getByText('Aucun résultat')).exists();
}

function _assertConfirmModalIsClosed(assert, screen) {
  assert.dom(screen.queryByRole('heading', { name: 'Merci de confirmer' })).doesNotExist();
}
