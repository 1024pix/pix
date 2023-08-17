import { visit } from '@1024pix/ember-testing-library';
import { click, currentURL } from '@ember/test-helpers';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupApplicationTest } from 'ember-qunit';
import { createAuthenticateSession } from 'pix-admin/tests/helpers/test-init';
import { module, test } from 'qunit';

module('Acceptance | authenticated/sessions/list/with required action', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  module('When user is not logged in', function () {
    test('it should not be accessible by an unauthenticated user', async function (assert) {
      // when
      await visit('/sessions/list/with-required-action');

      // then
      assert.strictEqual(currentURL(), '/login');
    });
  });

  module('When user is logged in', function (hooks) {
    hooks.beforeEach(async () => {
      // given
      const {
        id: userId,
        firstName,
        lastName,
      } = server.create('user', { firstName: 'John', lastName: 'Doe', fullName: 'John Doe' });

      server.create('admin-member', {
        userId,
        firstName,
        lastName,
        isSuperAdmin: true,
      });
      await createAuthenticateSession({ userId });
    });

    test('visiting /sessions/list/with-required-action', async function (assert) {
      // when
      await visit('/sessions/list/with-required-action');

      // then
      assert.strictEqual(currentURL(), '/sessions/list/with-required-action');
    });

    test('it should set sessions menubar item active', async function (assert) {
      // when
      const screen = await visit('/sessions/list/with-required-action');

      // then
      assert.dom(screen.getByRole('link', { name: 'Sessions de certifications' })).hasClass('active');
    });

    module('when clicking on the sessions to be treated tab', function () {
      test('it should only display V2 sessions with required action informations', async function (assert) {
        assert.expect(12);
        // given
        const finalizedAt = new Date('2021-02-01T03:00:00Z');
        server.create('with-required-action-session', {
          id: '1',
          certificationCenterName: 'Centre SCO des Anne-Étoiles',
          finalizedAt,
          sessionDate: '2021-01-01',
          sessionTime: '17:00:00',
          assignedCertificationOfficerName: 'Officer1',
          version: 2,
        });
        server.create('with-required-action-session', {
          id: '2',
          certificationCenterName: 'Centre SUP et rieur',
          finalizedAt,
          sessionDate: '2022-07-12',
          sessionTime: '10:10:00',
          assignedCertificationOfficerName: 'Officer2',
          version: 2,
        });
        server.create('with-required-action-session', {
          id: '3',
          certificationCenterName: 'Centre V3',
          finalizedAt,
          sessionDate: '2022-02-17',
          sessionTime: '11:10:00',
          assignedCertificationOfficerName: 'Officer3',
          version: 3,
        });

        // when
        const screen = await visit('/sessions/list/with-required-action?version=2');

        // then
        _assertSession1InformationsAreDisplayed(assert, screen);
        _assertSession2InformationsAreDisplayed(assert, screen);
        _assertSession3InformationsAreNotDisplayed(assert, screen);
      });
    });

    module('when clicking on the next gen sessions to be treated tab', function () {
      test('it should only display V3 sessions with required action informations', async function (assert) {
        assert.expect(8);
        // given
        const finalizedAt = new Date('2021-02-01T03:00:00Z');
        server.create('with-required-action-session', {
          id: '1',
          certificationCenterName: 'Centre SCO des Anne-Étoiles',
          finalizedAt,
          sessionDate: '2021-01-01',
          sessionTime: '17:00:00',
          assignedCertificationOfficerName: 'Officer1',
          version: 2,
        });
        server.create('with-required-action-session', {
          id: '2',
          certificationCenterName: 'Centre SUP et rieur',
          finalizedAt,
          sessionDate: '2022-07-12',
          sessionTime: '10:10:00',
          assignedCertificationOfficerName: 'Officer2',
          version: 2,
        });
        server.create('with-required-action-session', {
          id: '3',
          certificationCenterName: 'Centre V3',
          finalizedAt,
          sessionDate: '2022-02-17',
          sessionTime: '11:10:00',
          assignedCertificationOfficerName: 'Officer3',
          version: 3,
        });

        // when
        const screen = await visit('/sessions/list/with-required-action?version=3');

        // then
        _assertSession3InformationsAreDisplayed(assert, screen);
        _assertSessions1andSession2InformationsAreNotDisplayed(assert, screen);
      });
    });

    module('When clicking on the display only my sessions button', function () {
      test('it should filter the sessions', async function (assert) {
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
          assignedCertificationOfficerName: 'John Doe',
          version: 2,
        });
        server.create('with-required-action-session', {
          id: '2',
          certificationCenterName: 'Centre SCO des Anne-Étoiles',
          finalizedAt,
          sessionDate,
          sessionTime,
          assignedCertificationOfficerName: 'Officer2',
          version: 2,
        });
        const screen = await visit('/sessions/list/with-required-action');

        // when
        await click('.x-toggle-btn');

        // then
        assert.dom('table tbody tr').exists({ count: 1 });
        assert.dom(screen.getByText('Centre SCO des Anne-Étoiles')).exists();
        assert.dom(screen.getByText('1')).exists();
        assert.dom(screen.getByText('01/01/2021 à 17:00:00')).exists();
        assert.dom(screen.getByText('John Doe')).exists();
      });
    });
  });
});

function _assertSession1InformationsAreDisplayed(assert, screen) {
  assert.dom(screen.getByText('Centre SCO des Anne-Étoiles')).exists();
  assert.dom(screen.getByText('1')).exists();
  assert.dom(screen.getByText('01/01/2021 à 17:00:00')).exists();
  assert.dom(screen.getByText('Officer1')).exists();
}

function _assertSession2InformationsAreDisplayed(assert, screen) {
  assert.dom(screen.getByText('Centre SUP et rieur')).exists();
  assert.dom(screen.getByText('2')).exists();
  assert.dom(screen.getByText('12/07/2022 à 10:10:00')).exists();
  assert.dom(screen.getByText('Officer2')).exists();
}

function _assertSession3InformationsAreNotDisplayed(assert, screen) {
  assert.dom(screen.queryByText('Centre V3')).doesNotExist();
  assert.dom(screen.queryByText('3')).doesNotExist();
  assert.dom(screen.queryByText('17/02/2022 à 11:10:00')).doesNotExist();
  assert.dom(screen.queryByText('Officer3')).doesNotExist();
}

function _assertSession3InformationsAreDisplayed(assert, screen) {
  assert.dom(screen.getByText('Centre V3')).exists();
  assert.dom(screen.getByText('3')).exists();
  assert.dom(screen.getByText('17/02/2022 à 11:10:00')).exists();
  assert.dom(screen.getByText('Officer3')).exists();
}

function _assertSessions1andSession2InformationsAreNotDisplayed(assert, screen) {
  assert.dom(screen.queryByText('Centre SCO des Anne-Étoiles')).doesNotExist();
  assert.dom(screen.queryByText('Officer1')).doesNotExist();
  assert.dom(screen.queryByText('Centre SUP et rieur')).doesNotExist();
  assert.dom(screen.queryByText('Officer2')).doesNotExist();
}
