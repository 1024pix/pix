import { visit } from '@1024pix/ember-testing-library';
import { click, currentURL, fillIn, triggerEvent } from '@ember/test-helpers';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { setFlatpickrDate } from 'ember-flatpickr/test-support/helpers';
import { setupIntl, t } from 'ember-intl/test-support';
import { setupApplicationTest } from 'ember-qunit';
import { module, test } from 'qunit';

import { authenticateSession } from '../helpers/test-init';

module('Acceptance | Session creation', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks);

  test('it should not be accessible by an unauthenticated user', async function (assert) {
    // when
    await visit('/sessions/creation');

    // then
    assert.strictEqual(currentURL(), '/connexion');
  });

  module('when the user is authenticated', (hooks) => {
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
        allowedCertificationCenterAccess.update({ isAccessBlockedCollege: true });

        // when
        await visit('/sessions/creation');

        // then
        assert.strictEqual(currentURL(), '/espace-ferme');
      });
    });

    module('when user focus out required inputs without completing it', function () {
      test('should display error messages', async function (assert) {
        // given
        const screen = await visit('/sessions/creation');

        // when
        await fillIn(
          screen.getByRole('textbox', {
            name: `${t('common.forms.required')} ${t('common.forms.session-labels.center-name')}`,
          }),
          '',
        );
        await fillIn(
          screen.getByRole('textbox', {
            name: `${t('common.forms.required')} ${t('common.forms.session-labels.room-name')}`,
          }),
          '',
        );

        const examinerInput = screen.getByRole('textbox', {
          name: `${t('common.forms.required')} ${t('common.forms.session-labels.invigilator')}`,
        });
        await fillIn(examinerInput, '');
        await triggerEvent(examinerInput, 'focusout');

        // then
        assert.dom(screen.getByText(t('pages.sessions.new.errors.SESSION_ADDRESS_REQUIRED'))).exists();
        assert.dom(screen.getByText(t('pages.sessions.new.errors.SESSION_ROOM_REQUIRED'))).exists();
        assert.dom(screen.getByText(t('pages.sessions.new.errors.SESSION_EXAMINER_REQUIRED'))).exists();
      });
    });

    test('it should create a session and redirect to session details', async function (assert) {
      // given
      const sessionDate = '2029-12-25';
      const sessionTime = '13:45';

      const screen = await visit('/sessions/creation');
      assert.dom(screen.getByRole('heading', { name: t('pages.sessions.new.title') })).exists();
      assert
        .dom(screen.getByRole('textbox', { name: t('common.forms.session-labels.observations') }))
        .hasAttribute('maxLength', '350');
      assert
        .dom(screen.getByRole('button', { name: t('pages.sessions.new.actions.cancel-extra-information') }))
        .exists();

      await fillIn(
        screen.getByRole('textbox', {
          name: `${t('common.forms.required')} ${t('common.forms.session-labels.center-name')}`,
        }),
        'My address',
      );
      await fillIn(
        screen.getByRole('textbox', {
          name: `${t('common.forms.required')} ${t('common.forms.session-labels.room-name')}`,
        }),
        'My room',
      );
      await fillIn(
        screen.getByRole('textbox', {
          name: `${t('common.forms.required')} ${t('common.forms.session-labels.invigilator')}`,
        }),
        'My examiner',
      );
      await fillIn(
        screen.getByRole('textbox', { name: t('common.forms.session-labels.observations') }),
        'My description',
      );
      await setFlatpickrDate('#session-date', sessionDate);
      await setFlatpickrDate(
        screen.getByRole('textbox', { name: t('common.forms.session-labels.time-start') }),
        sessionTime,
      );
      await click(screen.getByRole('button', { name: t('pages.sessions.new.actions.create-session') }));

      // then
      const session = server.schema.sessionEnrolments.findBy({ date: sessionDate });
      assert.strictEqual(session.address, 'My address');
      assert.strictEqual(session.room, 'My room');
      assert.strictEqual(session.examiner, 'My examiner');
      assert.strictEqual(session.description, 'My description');
      assert.strictEqual(session.date, sessionDate);
      assert.strictEqual(session.time, '13:45');
      assert.strictEqual(currentURL(), `/sessions/${session.id}`);
    });

    test('it should go back to sessions list on cancel without creating any sessions', async function (assert) {
      // given
      const previousSessionsCount = server.schema.sessionEnrolments.all().length;
      const screen = await visit('/sessions/creation');

      // when
      await click(screen.getByRole('button', { name: t('pages.sessions.new.actions.cancel-extra-information') }));

      // then
      const actualSessionsCount = server.schema.sessionEnrolments.all().length;
      assert.strictEqual(currentURL(), '/sessions/liste');
      assert.strictEqual(previousSessionsCount, actualSessionsCount);
    });
  });
});
