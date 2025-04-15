import { visit } from '@1024pix/ember-testing-library';
import { click, fillIn } from '@ember/test-helpers';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { setupApplicationTest } from 'ember-qunit';
import { COMPLEMENTARY_KEYS } from 'pix-certif/models/subscription';
import { module, test } from 'qunit';

import { authenticateSession } from '../helpers/test-init';

module('Acceptance | Session Add Candidate', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  const sessionId = 123;
  let allowedCertificationCenterAccess;

  hooks.beforeEach(async function () {
    allowedCertificationCenterAccess = server.create('allowed-certification-center-access', {
      type: 'PRO',
      habilitations: [
        { id: 1, label: 'Certif complémentaire 2', key: 'COMP_2' },
        { id: 2, label: 'CléA Numérique', key: COMPLEMENTARY_KEYS.CLEA },
      ],
      isComplementaryAlonePilot: false,
    });
    const certificationPointOfContact = server.create('certification-point-of-contact', {
      firstName: 'Eddy',
      lastName: 'Taurial',
      allowedCertificationCenterAccesses: [allowedCertificationCenterAccess],
      pixCertifTermsOfServiceAccepted: true,
    });
    server.create('session-enrolment', {
      id: sessionId,
      certificationCenterId: allowedCertificationCenterAccess.id,
    });

    server.create('session-management', {
      id: sessionId,
    });

    server.createList('country', 1);
    await authenticateSession(certificationPointOfContact.id);
  });

  module('before compatibility', function () {
    test('it should add a candidate without any complementary subscription', async function (assert) {
      // given
      const screen = await visit(`/sessions/${sessionId}/candidats`);

      // when
      await click(screen.getByRole('button', { name: 'Inscrire un candidat' }));
      await fillIn(screen.getByLabelText('Nom de naissance *'), 'Quatorze');
      await fillIn(screen.getByLabelText('Prénom *'), 'Louis');
      await click(screen.getByLabelText('Homme'));
      await fillIn(screen.getByLabelText('Date de naissance *'), '01/01/2000');
      await click(screen.getByLabelText('Pays de naissance *'));
      await click(screen.getByText('Portugal'));
      await fillIn(screen.getByLabelText('Commune de naissance *'), 'Paris');
      await click(screen.getByLabelText('Certif complémentaire 2'));
      await click(screen.getByLabelText('Aucune'));
      await click(screen.getByRole('button', { name: 'Inscrire le candidat' }));

      // then
      assert.dom(screen.getByRole('cell', { name: 'Quatorze' })).exists();
      assert.dom(screen.getByRole('cell', { name: 'Louis' })).exists();
      assert.dom(screen.getByRole('cell', { name: '01/01/2000' })).exists();
      assert.dom(screen.getByRole('cell', { name: 'Certification Pix' })).exists();
    });

    test('it should add a candidate with a complementary subscription', async function (assert) {
      // given
      const screen = await visit(`/sessions/${sessionId}/candidats`);

      // when
      await click(screen.getByRole('button', { name: 'Inscrire un candidat' }));
      await fillIn(screen.getByLabelText('Nom de naissance *'), 'Quatorze');
      await fillIn(screen.getByLabelText('Prénom *'), 'Louis');
      await click(screen.getByLabelText('Homme'));
      await fillIn(screen.getByLabelText('Date de naissance *'), '01/01/2000');
      await click(screen.getByLabelText('Pays de naissance *'));
      await click(screen.getByText('Portugal'));
      await fillIn(screen.getByLabelText('Commune de naissance *'), 'Paris');
      await click(screen.getByLabelText('Certif complémentaire 2'));
      await click(screen.getByRole('button', { name: 'Inscrire le candidat' }));

      // then
      assert.dom(screen.getByRole('cell', { name: 'Quatorze' })).exists();
      assert.dom(screen.getByRole('cell', { name: 'Louis' })).exists();
      assert.dom(screen.getByRole('cell', { name: '01/01/2000' })).exists();
      assert.dom(screen.getByRole('cell', { name: 'Certification Pix, Certif complémentaire 2' })).exists();
    });
  });

  module('after compatibility', function (hooks) {
    hooks.beforeEach(function () {
      allowedCertificationCenterAccess.update({
        isComplementaryAlonePilot: true,
      });
    });

    test('it should add a candidate without any complementary subscription', async function (assert) {
      // given
      const screen = await visit(`/sessions/${sessionId}/candidats`);

      // when
      await click(screen.getByRole('button', { name: 'Inscrire un candidat' }));
      await fillIn(screen.getByLabelText('Nom de naissance *'), 'Quatorze');
      await fillIn(screen.getByLabelText('Prénom *'), 'Louis');
      await click(screen.getByLabelText('Homme'));
      await fillIn(screen.getByLabelText('Date de naissance *'), '01/01/2000');
      await click(screen.getByLabelText('Pays de naissance *'));
      await click(screen.getByText('Portugal'));
      await fillIn(screen.getByLabelText('Commune de naissance *'), 'Paris');
      await click(screen.getByLabelText('Certification Pix'));
      await click(screen.getByRole('button', { name: 'Inscrire le candidat' }));

      // then
      assert.dom(screen.getByRole('cell', { name: 'Quatorze' })).exists();
      assert.dom(screen.getByRole('cell', { name: 'Louis' })).exists();
      assert.dom(screen.getByRole('cell', { name: '01/01/2000' })).exists();
      assert.dom(screen.getByRole('cell', { name: 'Certification Pix' })).exists();
    });

    test('it should add a candidate without any complementary subscription when center has no habilitations', async function (assert) {
      // given
      allowedCertificationCenterAccess.update({ habilitations: [] });
      const screen = await visit(`/sessions/${sessionId}/candidats`);

      // when
      await click(screen.getByRole('button', { name: 'Inscrire un candidat' }));
      await fillIn(screen.getByLabelText('Nom de naissance *'), 'Quatorze');
      await fillIn(screen.getByLabelText('Prénom *'), 'Louis');
      await click(screen.getByLabelText('Homme'));
      await fillIn(screen.getByLabelText('Date de naissance *'), '01/01/2000');
      await click(screen.getByLabelText('Pays de naissance *'));
      await click(screen.getByText('Portugal'));
      await fillIn(screen.getByLabelText('Commune de naissance *'), 'Paris');
      await click(screen.getByRole('button', { name: 'Inscrire le candidat' }));

      // then
      assert.dom(screen.getByRole('cell', { name: 'Quatorze' })).exists();
      assert.dom(screen.getByRole('cell', { name: 'Louis' })).exists();
      assert.dom(screen.getByRole('cell', { name: '01/01/2000' })).exists();
      assert.dom(screen.getByRole('cell', { name: 'Certification Pix' })).exists();
    });

    test('it should add a candidate with a CleA dual subscription', async function (assert) {
      // given
      const screen = await visit(`/sessions/${sessionId}/candidats`);

      // when
      await click(screen.getByRole('button', { name: 'Inscrire un candidat' }));
      await fillIn(screen.getByLabelText('Nom de naissance *'), 'Quatorze');
      await fillIn(screen.getByLabelText('Prénom *'), 'Louis');
      await click(screen.getByLabelText('Homme'));
      await fillIn(screen.getByLabelText('Date de naissance *'), '01/01/2000');
      await click(screen.getByLabelText('Pays de naissance *'));
      await click(screen.getByText('Portugal'));
      await fillIn(screen.getByLabelText('Commune de naissance *'), 'Paris');
      await click(screen.getByLabelText('Double Certification Pix-CléA Numérique'));
      await click(screen.getByRole('button', { name: 'Inscrire le candidat' }));

      // then
      assert.dom(screen.getByRole('cell', { name: 'Quatorze' })).exists();
      assert.dom(screen.getByRole('cell', { name: 'Louis' })).exists();
      assert.dom(screen.getByRole('cell', { name: '01/01/2000' })).exists();
      assert.dom(screen.getByRole('cell', { name: 'Double Certification Pix-CléA Numérique' })).exists();
    });

    test('it should add a candidate with a complementary subscription', async function (assert) {
      // given
      const screen = await visit(`/sessions/${sessionId}/candidats`);

      // when
      await click(screen.getByRole('button', { name: 'Inscrire un candidat' }));
      await fillIn(screen.getByLabelText('Nom de naissance *'), 'Quatorze');
      await fillIn(screen.getByLabelText('Prénom *'), 'Louis');
      await click(screen.getByLabelText('Homme'));
      await fillIn(screen.getByLabelText('Date de naissance *'), '01/01/2000');
      await click(screen.getByLabelText('Pays de naissance *'));
      await click(screen.getByText('Portugal'));
      await fillIn(screen.getByLabelText('Commune de naissance *'), 'Paris');
      await click(screen.getByLabelText('Certif complémentaire 2'));
      await click(screen.getByRole('button', { name: 'Inscrire le candidat' }));

      // then
      assert.dom(screen.getByRole('cell', { name: 'Quatorze' })).exists();
      assert.dom(screen.getByRole('cell', { name: 'Louis' })).exists();
      assert.dom(screen.getByRole('cell', { name: '01/01/2000' })).exists();
      assert.dom(screen.getByRole('cell', { name: 'Certif complémentaire 2' })).exists();
    });
  });
});
