import { visit as visitScreen } from '@1024pix/ember-testing-library';
import { click, fillIn } from '@ember/test-helpers';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { setupApplicationTest } from 'ember-qunit';
import { module, test } from 'qunit';

import { authenticateSession } from '../helpers/test-init';

module('Acceptance | Session Add Candidate', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  module('When certification center is both pix/pix+ split and V3 pilot', function () {
    module('when a candidate with a complementary certification has just been added', function () {
      test('it should be possible to add another candidate with a complementary certification', async function (assert) {
        // given
        const allowedCertificationCenterAccess = server.create('allowed-certification-center-access', {
          type: 'PRO',
          habilitations: [
            { id: '1', label: 'Certif complémentaire 2', key: 'COMP_2', hasComplementaryReferential: true },
          ],
          isComplementaryAlonePilot: true,
        });

        const certificationPointOfContact = server.create('certification-point-of-contact', {
          firstName: 'Eddy',
          lastName: 'Taurial',
          allowedCertificationCenterAccesses: [allowedCertificationCenterAccess],
          pixCertifTermsOfServiceAccepted: true,
        });

        const session = server.create('session-enrolment', {
          certificationCenterId: allowedCertificationCenterAccess.id,
        });

        server.create('session-management', {
          id: session.id,
        });

        server.createList('country', 1);

        await authenticateSession(certificationPointOfContact.id);
        const screen = await visitScreen(`/sessions/${session.id}/candidats`);

        await _addCandidateWithComplementaryCertification({ screen, firstName: 'first' });

        // when
        await _addCandidateWithComplementaryCertification({ screen, firstName: 'second' });

        // then
        assert.dom(screen.getByText('second')).exists();
      });
    });
  });
});

async function _addCandidateWithComplementaryCertification({ screen, firstName }) {
  await click(screen.getByRole('button', { name: 'Inscrire un candidat' }));
  await fillIn(screen.getByLabelText('* Nom de naissance'), 'candidate');
  await fillIn(screen.getByLabelText('* Prénom'), firstName);
  await click(screen.getByLabelText('Femme'));
  await fillIn(screen.getByLabelText('* Date de naissance'), '01/01/2000');
  await click(screen.getByLabelText('* Pays de naissance'));
  await click(screen.getByText('Portugal'));
  await fillIn(screen.getByLabelText('* Commune de naissance'), 'Paris');
  await click(screen.getByLabelText('Certif complémentaire 2'));
  await click(screen.getByLabelText('La certification Pix et Pix+'));
  await click(screen.getByRole('button', { name: 'Inscrire le candidat' }));
}
