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
import { Response } from 'miragejs';

module('Acceptance | authenticated | team', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks);

  module('when user is admin', function () {
    test('displays navbar with "members" and "invitations" links and an invite a member button', async function (assert) {
      // given
      const certificationPointOfContact = createCertificationPointOfContactWithTermsOfServiceAccepted(
        undefined,
        'Centre de certification du pix',
        false,
        'ADMIN',
      );

      server.create('member', { firstName: 'Lili', lastName: 'Dupont', isReferer: false });
      server.create('member', { firstName: 'Lee', lastName: 'Tige', isReferer: false });
      await authenticateSession(certificationPointOfContact.id);

      // when
      const screen = await visitScreen('/equipe');

      // then
      assert.dom(screen.getByRole('cell', { name: 'Lili' })).exists();
      assert.dom(screen.getByRole('cell', { name: 'Dupont' })).exists();
      assert.dom(screen.getByRole('cell', { name: 'Lee' })).exists();
      assert.dom(screen.getByRole('cell', { name: 'Tige' })).exists();

      assert.dom(screen.getByRole('link', { name: 'Membres (2)' })).exists();
      assert.dom(screen.getByRole('link', { name: 'Invitations (-)' })).exists();

      assert.dom(screen.getByText(this.intl.t('pages.team.invite-button'))).exists();
    });

    module('when user clicks on invitations link', function () {
      test('displays invitations list', async function (assert) {
        // given
        const certificationPointOfContact = createCertificationPointOfContactWithTermsOfServiceAccepted(
          undefined,
          'Centre de certification du pix',
          false,
          'ADMIN',
        );

        server.create('member', { firstName: 'Lili', lastName: 'Dupont', isReferer: false });
        server.create('member', { firstName: 'Lee', lastName: 'Tige', isReferer: false });

        server.create('certification-center-invitation', {
          certificationCenterId: 1,
          email: 'camile.onette@example.net',
          updatedAt: new Date('2023-09-20'),
        });

        server.create('certification-center-invitation', {
          certificationCenterId: 1,
          email: 'camile.onette@example.net',
          updatedAt: new Date('2023-09-19'),
        });

        await authenticateSession(certificationPointOfContact.id);

        // when
        const screen = await visitScreen('/equipe');

        await click(
          screen.getByRole('link', {
            name: 'Invitations (2)',
          }),
        );
        // then
        assert.strictEqual(currentURL(), '/equipe/invitations');
        assert.strictEqual(screen.getAllByLabelText('Invitations en attente').length, 2);
      });
    });
  });

  module('when user is member', function () {
    module('when visiting "/equipe/" URL', function () {
      test('redirects to "/equipe/membres" URL', async function (assert) {
        // given
        const certificationPointOfContact = createCertificationPointOfContactWithTermsOfServiceAccepted();
        await authenticateSession(certificationPointOfContact.id);

        // when
        await visitScreen('/equipe');

        // then
        assert.strictEqual(currentURL(), '/equipe/membres');
      });
    });

    module('when visiting "/equipe/invitations" as an unauthorized user', function () {
      test('redirects to "/equipe/membres" URL', async function (assert) {
        // given
        const certificationPointOfContact = createCertificationPointOfContactWithTermsOfServiceAccepted();
        await authenticateSession(certificationPointOfContact.id);

        // when
        await visitScreen('/equipe/invitations');

        // then
        assert.strictEqual(currentURL(), '/equipe/membres');
      });
    });

    module('when visiting "/equipe/inviter" as an unauthorized user', function () {
      test('redirects to "/equipe/membres" URL', async function (assert) {
        // given
        const certificationPointOfContact = createCertificationPointOfContactWithTermsOfServiceAccepted();
        await authenticateSession(certificationPointOfContact.id);

        // when
        await visitScreen('/equipe/inviter');

        // then
        assert.strictEqual(currentURL(), '/equipe/membres');
      });
    });

    test('display only member list on the page', async function (assert) {
      // given
      const certificationPointOfContact = createCertificationPointOfContactWithTermsOfServiceAccepted();

      server.create('member', { firstName: 'Lili', lastName: 'Dupont', isReferer: false });
      await authenticateSession(certificationPointOfContact.id);

      // when
      const screen = await visitScreen('/equipe');

      // then
      assert.dom(screen.getByRole('cell', { name: 'Lili' })).exists();
      assert.dom(screen.getByRole('cell', { name: 'Dupont' })).exists();
      assert.dom(screen.queryByRole('link', { name: 'Membres (1)' })).doesNotExist();
      assert.dom(screen.queryByRole('link', { name: 'Invitations (-)' })).doesNotExist();
    });

    module('when user go to members list', function () {
      module('when certification center has "CLEA" habilitation', function () {
        module('when there is at least one member', function () {
          module('when there is no referer', function () {
            test('it should be possible to see the "no referer" section', async function (assert) {
              // given
              const certificationPointOfContact = createCertificationPointOfContactWithTermsOfServiceAccepted();
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
                  }),
                )
                .exists();
            });

            test('it should be possible to select a referer', async function (assert) {
              // given
              const certificationPointOfContact = createCertificationPointOfContactWithTermsOfServiceAccepted();
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
                screen.getByRole('button', {
                  name: this.intl.t('pages.team.no-referer-section.select-referer-button'),
                }),
              );
              await screen.findByRole('dialog');
              await click(screen.getByLabelText(this.intl.t('pages.team.select-referer-modal.label')));
              await click(
                await screen.findByRole('option', {
                  name: 'Lili Dupont',
                }),
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
                  }),
                );
                await screen.findByRole('dialog');

                // then
                assert.dom(screen.getByRole('button', { name: 'Valider la sélection de référent' })).isDisabled();
              });

              module('when referer registration failed', function () {
                test('it should return error message', async function (assert) {
                  // given
                  await _createAndAuthenticateMember();
                  const screen = await visitScreen('/equipe');
                  this.server.post('certif/certification-centers/:id/update-referer', () => {
                    return new Response(500, {}, { errors: [{ status: '500' }] });
                  });

                  await click(screen.getByRole('button', { name: 'Désigner un référent' }));
                  await screen.findByRole('dialog');
                  await click(screen.getByLabelText('Sélectionner le référent Pix'));
                  await click(
                    await screen.findByRole('option', {
                      name: 'Lili Dupont',
                    }),
                  );

                  // when
                  await click(screen.getByRole('button', { name: 'Valider la sélection de référent' }));

                  // then
                  assert
                    .dom(
                      screen.getByText(
                        'Une erreur interne est survenue, nos équipes sont en train de résoudre le problème. Veuillez réessayer ultérieurement.',
                      ),
                    )
                    .exists();
                });
              });
            });
          });

          module('when there is a referer', function () {
            test('does not display the button to change the referer', async function (assert) {
              // given
              const certificationPointOfContact = createCertificationPointOfContactWithTermsOfServiceAccepted(
                undefined,
                'CCNG',
                false,
                'MEMBER',
              );
              server.create('member', { firstName: 'Jamal', lastName: 'Opié', isReferer: true });
              server.create('member', { firstName: 'Jean', lastName: 'Ticipe', isReferer: false });
              server.create('allowed-certification-center-access', { id: 1, habilitations: [{ key: 'CLEA' }] });
              await authenticateSession(certificationPointOfContact.id);

              // when
              const screen = await visitScreen('/equipe');

              // then
              assert
                .dom(screen.queryByRole('button', { name: this.intl.t('pages.team.update-referer-button') }))
                .doesNotExist();
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
        assert.strictEqual(currentURL(), '/equipe/membres');
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

    async function _createAndAuthenticateMember() {
      const certificationPointOfContact = createCertificationPointOfContactWithTermsOfServiceAccepted();
      server.create('member', { firstName: 'Lili', lastName: 'Dupont', isReferer: false });
      server.create('allowed-certification-center-access', { id: 1, habilitations: [{ key: 'CLEA' }] });
      await authenticateSession(certificationPointOfContact.id);
    }
  });
});
