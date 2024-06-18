import { visit } from '@1024pix/ember-testing-library';
import { click, currentURL, fillIn, triggerEvent } from '@ember/test-helpers';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { t } from 'ember-intl/test-support';
import { setupApplicationTest } from 'ember-qunit';
import { module, test } from 'qunit';

import { authenticateSession } from '../helpers/test-init';

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
      const session = server.create('session-enrolment', {
        certificationCenterId: allowedCertificationCenterAccess.id,
      });
      server.create('session-management', {
        id: session.id,
      });

      allowedCertificationCenterAccess.update({ isAccessBlockedCollege: true });

      // when
      await visit(`/sessions/${session.id}/modification`);

      // then
      assert.strictEqual(currentURL(), '/espace-ferme');
    });
  });

  module('when user focus out required inputs without completing it', function () {
    test('should display error messages', async function (assert) {
      // given
      const session = server.create('session-enrolment', { time: '14:00:00', date: '2020-01-01' });
      server.create('session-management', {
        id: session.id,
      });
      const screen = await visit(`/sessions/${session.id}/modification`);

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

  module('when user tries to confirm form without filling mandatory fields', function () {
    test('should display error notification', async function (assert) {
      // given
      const session = server.create('session-enrolment', {
        address: ' ',
        room: 'Salle 3',
        time: '14:00:00',
        date: '2020-01-01',
        examiner: 'George',
      });
      server.create('session-management', {
        id: session.id,
      });
      const screen = await visit(`/sessions/${session.id}/modification`);

      // when
      await click(screen.getByRole('button', { name: 'Modifier la session' }));

      // then
      assert.dom(screen.getByText(t('common.form-errors.fill-mandatory-fields'))).exists();
    });
  });

  test('it should fill the updating form with the current values of the session', async function (assert) {
    // given
    const session = server.create('session-enrolment', { time: '14:00:00', date: '2020-01-01' });
    server.create('session-management', {
      id: session.id,
    });

    // when
    const screen = await visit(`/sessions/${session.id}/modification`);

    // then
    assert.dom(screen.getByRole('textbox', { name: 'Obligatoire Nom de la salle' })).hasValue(session.room);
    assert.dom(screen.getByRole('textbox', { name: 'Obligatoire Surveillant(s)' })).hasValue(session.examiner);
    assert.dom(screen.getByRole('textbox', { name: 'Obligatoire Nom du site' })).hasValue(session.address);
    assert.dom(screen.getByRole('textbox', { name: 'Observations' })).hasValue(session.description);
    assert.dom(screen.getByRole('textbox', { name: 'Heure de début (heure locale)' })).hasValue('14:00');
    assert.dom(screen.getByText('Date de début')).exists();
    assert.dom('#session-time').hasValue('14:00');
  });

  test('it should allow to update a session and redirect to the session details', async function (assert) {
    // given
    const session = server.create('session-enrolment', {
      room: 'beforeRoom',
      examiner: 'beforeExaminer',
      date: '2023-12-12',
      time: '10:12',
    });
    server.create('session-management', {
      id: session.id,
    });
    const newRoom = 'New room';
    const newExaminer = 'New examiner';

    const screen = await visit(`/sessions/${session.id}/modification`);
    await fillIn(screen.getByRole('textbox', { name: 'Obligatoire Nom de la salle' }), newRoom);
    await fillIn(screen.getByRole('textbox', { name: 'Obligatoire Surveillant(s)' }), newExaminer);

    // when
    await click(screen.getByRole('button', { name: 'Modifier la session' }));

    // then
    session.reload();
    assert.strictEqual(session.room, newRoom);
    assert.strictEqual(session.examiner, newExaminer);
    assert.strictEqual(currentURL(), `/sessions/${session.id}`);
  });

  test('it should not update a session when cancel button is clicked and redirect to the session #1 details', async function (assert) {
    // given
    const session = server.create('session-enrolment', { room: 'beforeRoom', examiner: 'beforeExaminer' });
    server.create('session-management', {
      id: session.id,
    });
    const newRoom = 'New room';
    const newExaminer = 'New examiner';

    const screen = await visit(`/sessions/${session.id}/modification`);
    await fillIn(screen.getByRole('textbox', { name: 'Obligatoire Nom de la salle' }), newRoom);
    await fillIn(screen.getByRole('textbox', { name: 'Obligatoire Surveillant(s)' }), newExaminer);

    // when
    await click(
      screen.getByRole('button', {
        name: 'Annuler la modification de la session et retourner vers la page précédente',
      }),
    );

    // then
    session.reload();
    assert.strictEqual(session.room, 'beforeRoom');
    assert.strictEqual(session.examiner, 'beforeExaminer');
    assert.strictEqual(currentURL(), `/sessions/${session.id}`);
  });
});
