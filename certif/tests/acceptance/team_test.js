import { module, test } from 'qunit';
import { currentURL, click } from '@ember/test-helpers';
import { visit as visitScreen } from '@1024pix/ember-testing-library';

import { setupApplicationTest } from 'ember-qunit';
import {
  createCertificationPointOfContactWithTermsOfServiceAccepted,
  authenticateSession,
  createAllowedCertificationCenterAccess,
  createCertificationPointOfContactWithCustomCenters,
} from '../helpers/test-init';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Acceptance | authenticated | team', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  module('when user go to members list', function () {
    module('when FT_CLEA_RESULTS_RETRIEVAL_BY_HABILITATED_CERTIFICATION_CENTERS is enabled', function () {
      module('when there is no referer', function () {
        test('it should be possible to see the "no referer" section', async function (assert) {
          // given
          const certificationPointOfContact = createCertificationPointOfContactWithTermsOfServiceAccepted();
          server.create('featureToggle', { isCleaResultsRetrievalByHabilitatedCertificationCentersEnabled: true });
          server.create('member', { firstName: 'Lili', lastName: 'Dupont', isReferer: false });
          await authenticateSession(certificationPointOfContact.id);

          // when
          const screen = await visitScreen('/equipe');

          // then
          assert.dom(screen.getByText('Aucun référent Pix désigné')).exists();
          assert.dom(screen.getByRole('button', { name: 'Désigner un référent' })).exists();
        });
      });
    });
  });

  test('it should be possible to see members list', async function (assert) {
    // given
    const certificationPointOfContact = createCertificationPointOfContactWithTermsOfServiceAccepted();
    server.create('member', { firstName: 'Lili', lastName: 'Dupont' });
    await authenticateSession(certificationPointOfContact.id);

    // when
    const screen = await visitScreen('/equipe');

    // then
    assert.strictEqual(currentURL(), '/equipe');
    assert.dom(screen.getByRole('cell', { name: 'Lili' })).exists();
    assert.dom(screen.getByRole('cell', { name: 'Dupont' })).exists();
  });

  module('when user switch to see another certification center', function () {
    test('it should be possible to see the other members list', async function (assert) {
      // given
      const certificationCenterName = 'Centre de certif des Anne-atole';
      const otherCertificationCenterName = 'Centre de certif de 7 Anne-néla';
      const certificationPointOfContact = createAllowedCertificationCenterAccess({
        certificationCenterName,
        certificationCenterType: 'SCO',
        isRelatedOrganizationManagingStudents: true,
      });
      const certificationPointOfContact2 = createAllowedCertificationCenterAccess({
        certificationCenterName: otherCertificationCenterName,
        certificationCenterType: 'SCO',
        isRelatedOrganizationManagingStudents: true,
      });
      createCertificationPointOfContactWithCustomCenters({
        pixCertifTermsOfServiceAccepted: true,
        allowedCertificationCenterAccesses: [certificationPointOfContact, certificationPointOfContact2],
      });
      server.create('member', { firstName: 'Lili', lastName: 'Dupont' });
      const memberOfTheFirstCertificationCenter = server.create('member', { firstName: 'Jack', lastName: 'Adit' });
      await authenticateSession(certificationPointOfContact.id);
      const screen = await visitScreen('/equipe');

      // when
      await click(screen.getByText(`${certificationCenterName} (${certificationPointOfContact.externalId})`));
      await click(screen.getByText(`${otherCertificationCenterName}`));
      memberOfTheFirstCertificationCenter.destroy();
      await visitScreen('/equipe');

      // then
      assert.dom(screen.getByRole('cell', { name: 'Lili' })).exists();
      assert.dom(screen.getByRole('cell', { name: 'Dupont' })).exists();
      assert.dom(screen.queryByRole('cell', { name: 'Jack' })).doesNotExist();
      assert.dom(screen.queryByRole('cell', { name: 'Adit' })).doesNotExist();
    });
  });
});
