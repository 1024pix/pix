import { module, test } from 'qunit';
import { visit, currentURL } from '@ember/test-helpers';
import { fillByLabel, clickByName, visit as visitScreen } from '@1024pix/ember-testing-library';
import { setupApplicationTest } from 'ember-qunit';
import { createAuthenticateSession } from 'pix-admin/tests/helpers/test-init';

import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Acceptance | authenticated/sessions/session/informations', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  module('When user is not logged in', function () {
    test('it should not be accessible by an unauthenticated user', async function (assert) {
      // when
      await visit('/sessions/1');

      // then
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line qunit/no-assert-equal
      assert.equal(currentURL(), '/login');
    });
  });

  module('When user is logged in', function (hooks) {
    hooks.beforeEach(async function () {
      // given
      const { id: userId } = server.create('user');
      await createAuthenticateSession({ userId });
      server.create('session', { id: '1' });
    });

    test('visiting /sessions/1', async function (assert) {
      // when
      await visit('/sessions/1');

      // then
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line qunit/no-assert-equal
      assert.equal(currentURL(), '/sessions/1');
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
        const screen = await visitScreen('/sessions/3');

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
            const screen = await visitScreen('/sessions/6');
            await clickByName('Supprimer');
            await clickByName('Confirmer');

            // then
            assert
              .dom(screen.queryByText("Le surveillant prétend qu'une météorite est tombée sur le centre."))
              .doesNotExist();
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
              500
            );

            // when
            const screen = await visitScreen('/sessions/6');
            await clickByName('Supprimer');
            await clickByName('Confirmer');

            // then
            assert.dom(screen.getByText("Le surveillant prétend qu'une météorite est tombée sur le centre.")).exists();
            assert.dom(screen.getByText('Une erreur est survenue pendant la suppression du commentaire.')).exists();
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
          const screen = await visitScreen('/sessions/4');
          await fillByLabel(
            'Texte du commentaire',
            "Le surveillant prétend qu'une météorite est tombée sur le centre."
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
            422
          );

          // when
          const screen = await visitScreen('/sessions/5');
          await fillByLabel(
            'Texte du commentaire',
            "Le surveillant prétend qu'une météorite est tombée sur le centre."
          );
          await clickByName('Enregistrer');

          // then
          assert.dom(screen.getByText("Une erreur est survenue pendant l'enregistrement du commentaire.")).exists();
        });
      });
    });
  });
});
