import { module, test } from 'qunit';
import { click, currentURL, fillIn } from '@ember/test-helpers';
import { visit } from '@1024pix/ember-testing-library';
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
      assert.strictEqual(currentURL(), '/espace-ferme');
    });
  });

  test('it should fill the updating form with the current values of the session', async function (assert) {
    // given
    const session = server.create('session', { time: '14:00:00', date: '2020-01-01' });

    // when
    const screen = await visit(`/sessions/${session.id}/modification`);

    // then
    assert.dom(screen.getByRole('textbox', { name: 'Nom de la salle' })).hasValue(session.room);
    assert.dom(screen.getByRole('textbox', { name: 'Surveillant(s)' })).hasValue(session.examiner);
    assert.dom(screen.getByRole('textbox', { name: 'Nom du site' })).hasValue(session.address);
    assert.dom(screen.getByRole('textbox', { name: 'Observations' })).hasValue(session.description);
    assert.dom(screen.getByText('Heure de début (heure locale)')).exists();
    assert.dom(screen.getByText('Date de début')).exists();
    assert.dom('#session-date').hasValue('2020-01-01');
    assert.dom('#session-time').hasValue('14:00');
  });

  test('it should allow to update a session and redirect to the session details', async function (assert) {
    // given
    const session = server.create('session', {
      room: 'beforeRoom',
      examiner: 'beforeExaminer',
      date: '2023-12-12',
      time: '10:12',
    });
    const newRoom = 'New room';
    const newExaminer = 'New examiner';

    const screen = await visit(`/sessions/${session.id}/modification`);
    await fillIn(screen.getByRole('textbox', { name: 'Nom de la salle' }), newRoom);
    await fillIn(screen.getByRole('textbox', { name: 'Surveillant(s)' }), newExaminer);

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
    const session = server.create('session', { room: 'beforeRoom', examiner: 'beforeExaminer' });
    const newRoom = 'New room';
    const newExaminer = 'New examiner';

    const screen = await visit(`/sessions/${session.id}/modification`);
    await fillIn(screen.getByRole('textbox', { name: 'Nom de la salle' }), newRoom);
    await fillIn(screen.getByRole('textbox', { name: 'Surveillant(s)' }), newExaminer);

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
