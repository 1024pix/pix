import { module, test } from 'qunit';
import { click, currentURL } from '@ember/test-helpers';
import { visit as visitScreen } from '@1024pix/ember-testing-library';

import { setupApplicationTest } from 'ember-qunit';
import {
  authenticateSession,
  createAllowedCertificationCenterAccess,
  createCertificationPointOfContactWithCustomCenters,
  createCertificationPointOfContactWithTermsOfServiceAccepted,
} from '../helpers/test-init';
import setupIntl from '../helpers/setup-intl';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { waitForDialogClose } from '../helpers/wait-for';

module('Acceptance | authenticated | team', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks);

  module('when user go to members list', function () {
    module('when FT_CLEA_RESULTS_RETRIEVAL_BY_HABILITATED_CERTIFICATION_CENTERS is enabled', function () {
      module('when certification center has "CLEA" habilitation', function () {
        module('when there is at least one member', function () {
          module('when there is no referer', function () {
            test('it should be possible to see the "no referer" section', async function (assert) {
              // given
              const certificationPointOfContact = createCertificationPointOfContactWithTermsOfServiceAccepted();
              server.create('featureToggle', { isCleaResultsRetrievalByHabilitatedCertificationCentersEnabled: true });
              server.create('member', { firstName: 'Lili', lastName: 'Dupont', isReferer: false });
              server.create('allowed-certification-center-access', { id: 1, habilitations: [{ key: 'CLEA' }] });
              await authenticateSession(certificationPointOfContact.id);

              // when
              const screen = await visitScreen('/equipe');

              // then
              assert.dom(screen.getByText(this.intl.t('pages.team.no-referer-section.title'))).exists();
              assert
                .dom(
                  screen.getByRole('button', {
                    name: this.intl.t('pages.team.no-referer-section.select-referer-button'),
                  })
                )
                .exists();
            });

            test('it should be possible to select a referer', async function (assert) {
              // given
              const certificationPointOfContact = createCertificationPointOfContactWithTermsOfServiceAccepted();
              server.create('featureToggle', { isCleaResultsRetrievalByHabilitatedCertificationCentersEnabled: true });
              server.create('member', {
                id: 102,
                firstName: 'Lili',
                lastName: 'Dupont',
                isReferer: false,
              });
              server.create('allowed-certification-center-access', { id: 1, habilitations: [{ key: 'CLEA' }] });
              await authenticateSession(certificationPointOfContact.id);

              // when
              const screen = await visitScreen('/equipe');

              assert.dom(screen.queryByRole('cell', { name: 'Référent Pix' })).doesNotExist();

              await click(
                screen.getByRole('button', { name: this.intl.t('pages.team.no-referer-section.select-referer-button') })
              );
              await screen.findByRole('dialog');
              await click(screen.getByLabelText(this.intl.t('pages.team.select-referer-modal.label')));
              await click(
                await screen.findByRole('option', {
                  name: 'Lili Dupont',
                })
              );
              await click(screen.getByRole('button', { name: 'Valider la sélection de référent' }));
              await waitForDialogClose();

              // then
              assert
                .dom(screen.queryByRole('dialog', { name: this.intl.t('pages.team.select-referer-modal.title') }))
                .doesNotExist();
              assert.dom(screen.getByRole('cell', { name: this.intl.t('pages.team.pix-referer') })).exists();
            });

            module('when no referer is selected', function () {
              test('it should not be possible to validate', async function (assert) {
                // given
                const certificationPointOfContact = createCertificationPointOfContactWithTermsOfServiceAccepted();
                server.create('featureToggle', {
                  isCleaResultsRetrievalByHabilitatedCertificationCentersEnabled: true,
                });
                server.create('member', {
                  id: 102,
                  firstName: 'Lili',
                  lastName: 'Dupont',
                  isReferer: false,
                });
                server.create('allowed-certification-center-access', { id: 1, habilitations: [{ key: 'CLEA' }] });
                await authenticateSession(certificationPointOfContact.id);

                // when
                const screen = await visitScreen('/equipe');

                await click(
                  screen.getByRole('button', {
                    name: this.intl.t('pages.team.no-referer-section.select-referer-button'),
                  })
                );
                await screen.findByRole('dialog');

                // then
                assert.dom(screen.getByRole('button', { name: 'Valider la sélection de référent' })).isDisabled();
              });
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
  });
});
