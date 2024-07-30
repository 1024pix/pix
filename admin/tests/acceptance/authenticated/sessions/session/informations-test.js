import {
  clickByName,
  fillByLabel,
  getByTextWithHtml,
  visit,
  waitForElementToBeRemoved,
  within,
} from '@1024pix/ember-testing-library';
import { currentURL } from '@ember/test-helpers';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupApplicationTest } from 'ember-qunit';
import { module, test } from 'qunit';

import { authenticateAdminMemberWithRole } from '../../../../helpers/test-init';
import { waitForDialogClose } from '../../../../helpers/wait-for';

module('Acceptance | authenticated/sessions/session/informations', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  module('When user is not logged in', function () {
    test('it should not be accessible by an unauthenticated user', async function (assert) {
      // when
      await visit('/sessions/1');

      // then
      assert.strictEqual(currentURL(), '/login');
    });
  });

  module('When user is logged in', function (hooks) {
    let connectedUser;
    hooks.beforeEach(async function () {
      // given
      connectedUser = await authenticateAdminMemberWithRole({ isSuperAdmin: true })(server);
      server.create('session', { id: '1' });
    });

    test('visiting /sessions/1', async function (assert) {
      // when
      await visit('/sessions/1');

      // then
      assert.strictEqual(currentURL(), '/sessions/1');
    });

    module('When session is finalized', function () {
      module('When unfinalize button is clicked', function () {
        test('it should unfinalize the session', async function (assert) {
          // given
          server.create('session', {
            id: '3',
            finalizedAt: new Date('2023-01-31'),
            examinerGlobalComment: 'Vraiment, super session!',
            status: 'finalized',
          });
          const screen = await visit('/sessions/3');

          // when
          await clickByName('Définaliser la session');
          const modal = await screen.findByRole('dialog');
          await within(modal).queryByRole('button', { name: 'Confirmer' }).click();
          await waitForDialogClose();

          // then
          assert.dom(screen.queryByText('Date de finalisation :')).doesNotExist();
          assert.dom(screen.queryByRole('button', { name: 'Définaliser la session' })).doesNotExist();
        });
      });

      module('When session is published', function () {
        test('it should hide unfinalize button', async function (assert) {
          // given
          server.create('session', {
            id: '3',
            finalizedAt: null,
            examinerGlobalComment: 'Vraiment, super session!',
            status: 'processed',
          });

          // when
          const screen = await visit('/sessions/3');

          // then
          assert.dom(screen.queryByRole('button', { name: 'Définaliser la session' })).doesNotExist();
        });
      });

      module('When session has a global comment', function () {
        test('it should display the global comment section', async function (assert) {
          // given
          server.create('session', {
            id: '3',
            finalizedAt: new Date(),
            examinerGlobalComment: 'Vraiment, super session!',
          });

          // when
          const screen = await visit('/sessions/3');

          // then
          assert.dom(screen.getByText('Commentaire global :')).exists();
          assert.dom(screen.getByText('Vraiment, super session!')).exists();
        });
      });

      module('When session has no global comment', function () {
        test('it should not display the global comment section', async function (assert) {
          // given
          server.create('session', {
            id: '3',
            finalizedAt: new Date(),
            examinerGlobalComment: '',
          });

          // when
          const screen = await visit('/sessions/3');

          // then
          assert.dom(screen.queryByText('Commentaire global :')).doesNotExist();
        });
      });

      module('When session has complementary information', function () {
        test('it should display the complementary information section', async function (assert) {
          // given
          server.create('session', {
            id: '3',
            finalizedAt: new Date(),
            hasIncident: true,
            hasJoiningIssue: true,
          });

          // when
          const screen = await visit('/sessions/3');

          // then
          assert.dom(screen.getByText('Informations complémentaires :')).exists();
        });

        module('When session has a sessionJoiningIssue', function () {
          test('it should display the incident text', async function (assert) {
            // given
            server.create('session', {
              id: '3',
              finalizedAt: new Date(),
              hasIncident: false,
              hasJoiningIssue: true,
            });

            // when
            const screen = await visit('/sessions/3');

            // then
            assert
              .dom(
                screen.getByText(
                  "Un ou plusieurs candidats étaient présents en session de certification mais n'ont pas pu rejoindre la session.",
                ),
              )
              .exists();
          });
        });

        module('When session has incident', function () {
          test('it should display the incident text', async function (assert) {
            // given
            server.create('session', {
              id: '3',
              finalizedAt: new Date(),
              hasIncident: true,
              hasJoiningIssue: false,
            });

            // when
            const screen = await visit('/sessions/3');

            // then
            assert
              .dom(
                screen.getByText(
                  'Malgré un incident survenu pendant la session, les candidats ont pu terminer leur test de certification. Un temps supplémentaire a été accordé à un ou plusieurs candidats.',
                ),
              )
              .exists();
          });
        });
      });

      module('When session has no complementary information', function () {
        test('it should not display the complementary information section', async function (assert) {
          // given
          server.create('session', {
            id: '3',
            finalizedAt: new Date(),
            hasIncident: false,
            hasJoiningIssue: false,
          });

          // when
          const screen = await visit('/sessions/3');

          // then
          assert.dom(screen.queryByText('Informations complémentaires :')).doesNotExist();
        });
      });
    });

    test('should assign the session to the connected user', async function (assert) {
      // given
      server.create('session', {
        id: '3',
        finalizedAt: new Date('2023-01-31'),
        status: 'finalized',
      });
      const screen = await visit('/sessions/3');
      // when
      await clickByName("M'assigner la session");

      // then
      assert.dom(screen.queryByText(`${connectedUser.firstName} ${connectedUser.lastName}`)).exists();
    });

    module('When the session is already assigned to another user', function () {
      test('should display a modal before assigning the session to the connected user', async function (assert) {
        // given
        const previouslyAssignedUser = server.create('user', { firstName: 'Helmut', lastName: 'Fritz' });
        server.create('session', {
          id: '3',
          finalizedAt: new Date('2023-01-31'),
          status: 'finalized',
          assignedCertificationOfficer: previouslyAssignedUser,
        });
        const screen = await visit('/sessions/3');

        assert.dom(screen.queryByText('Helmut Fritz')).exists();

        // when
        await clickByName("M'assigner la session");
        const modal = await screen.findByRole('dialog');
        assert
          .dom(
            getByTextWithHtml(
              `L'utilisateur Helmut Fritz s'est déjà assigné cette session.<br>Voulez-vous vous quand même vous assigner cette session ?`,
            ),
          )
          .exists();
        await within(modal).queryByRole('button', { name: 'Confirmer' }).click();
        await waitForDialogClose();

        // then
        assert.dom(screen.queryByText('Helmut Fritz')).doesNotExist();
        assert.dom(screen.queryByText(`${connectedUser.firstName} ${connectedUser.lastName}`)).exists();
      });
    });

    module('When session has a jury comment', function () {
      test('it should display a jury comment for session', async function (assert) {
        // given
        const author = server.create('user', {
          firstName: 'Jernau',
          lastName: 'Gurgeh',
          fullName: 'Jernau Gurgeh',
        });
        server.create('session', {
          id: '3',
          juryComment: "Le surveillant prétend qu'une météorite est tombée sur le centre.",
          juryCommentedAt: new Date('2012-12-21T00:12:21Z'),
          juryCommentAuthor: author,
        });

        // when
        const screen = await visit('/sessions/3');

        // then
        assert.dom(screen.getByText("Commentaire de l'équipe Certification")).exists();
      });

      module('When the comment is deleted', function () {
        module('When server successfully deletes the comment', function () {
          test('it should have removed the comment', async function (assert) {
            // given
            const author = server.create('user', {
              firstName: 'Jernau',
              lastName: 'Gurgeh',
              fullName: 'Jernau Gurgeh',
            });
            server.create('session', {
              id: '6',
              juryComment: "Le surveillant prétend qu'une météorite est tombée sur le centre.",
              juryCommentedAt: new Date('2012-12-21T00:12:21Z'),
              juryCommentAuthor: author,
            });

            // when
            const screen = await visit('/sessions/6');

            await clickByName('Supprimer');

            await screen.findByRole('dialog');

            await clickByName('Confirmer');

            // then
            await waitForElementToBeRemoved(() =>
              screen.queryByText("Le surveillant prétend qu'une météorite est tombée sur le centre."),
            );
            assert.ok(true);
          });
        });

        module('When server fails to delete the comment', function () {
          test('it should notify user that delete has failed', async function (assert) {
            // given
            const author = server.create('user', {
              firstName: 'Jernau',
              lastName: 'Gurgeh',
              fullName: 'Jernau Gurgeh',
            });
            server.create('session', {
              id: '6',
              juryComment: "Le surveillant prétend qu'une météorite est tombée sur le centre.",
              juryCommentedAt: new Date('2012-12-21T00:12:21Z'),
              juryCommentAuthor: author,
            });
            this.server.delete(
              '/admin/sessions/6/comment',
              () => ({
                errors: [{ detail: "Votre commentaire n'interesse personne." }],
              }),
              500,
            );

            // when
            const screen = await visit('/sessions/6');
            await clickByName('Supprimer');

            await screen.findByRole('dialog');

            await clickByName('Confirmer');
            // then
            assert
              .dom(await screen.findByText('Une erreur est survenue pendant la suppression du commentaire.'))
              .exists();
            assert.dom(screen.getByText("Le surveillant prétend qu'une météorite est tombée sur le centre.")).exists();
          });
        });
      });
    });

    module('When a new comment is submitted', function () {
      module('When server successfully saves the comment', function () {
        test('it should display the new comment', async function (assert) {
          // given
          server.create('session', { id: '4', juryComment: null, juryCommentedAt: null, juryCommentAuthor: null });

          // when
          const screen = await visit('/sessions/4');
          await fillByLabel(
            'Texte du commentaire',
            "Le surveillant prétend qu'une météorite est tombée sur le centre.",
          );
          await clickByName('Enregistrer');

          // then
          assert.dom(screen.getByText("Le surveillant prétend qu'une météorite est tombée sur le centre.")).exists();
        });
      });

      module('When server respond with an error', function () {
        test('it should notify user that save has failed', async function (assert) {
          // given
          server.create('session', { id: '5', juryComment: null, juryCommentedAt: null, juryCommentAuthor: null });
          this.server.put(
            '/admin/sessions/5/comment',
            () => ({
              errors: [{ detail: "Votre commentaire n'interesse personne." }],
            }),
            422,
          );

          // when
          const screen = await visit('/sessions/5');
          await fillByLabel(
            'Texte du commentaire',
            "Le surveillant prétend qu'une météorite est tombée sur le centre.",
          );
          await clickByName('Enregistrer');

          // then
          assert
            .dom(await screen.findByText("Une erreur est survenue pendant l'enregistrement du commentaire."))
            .exists();
        });
      });
    });
  });
});
