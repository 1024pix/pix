import { module, test } from 'qunit';
import { visit, currentURL } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { createAuthenticateSession } from 'pix-admin/tests/helpers/test-init';
import clickByLabel from '../../../../helpers/extended-ember-test-helpers/click-by-label';
import fillInByLabel from '../../../../helpers/extended-ember-test-helpers/fill-in-by-label';

import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Acceptance | authenticated/sessions/session/informations', function(hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  module('When user is not logged in', function() {

    test('it should not be accessible by an unauthenticated user', async function(assert) {
      // when
      await visit('/sessions/1');

      // then
      assert.equal(currentURL(), '/login');
    });
  });

  module('When user is logged in', function(hooks) {

    hooks.beforeEach(async function() {
      // given
      const { id: userId } = server.create('user');
      await createAuthenticateSession({ userId });
      server.create('session', { id: '1' });
    });

    test('visiting /sessions/1', async function(assert) {
      // when
      await visit('/sessions/1');

      // then
      assert.equal(currentURL(), '/sessions/1');
    });

    module('When session has a jury comment', function() {
      test('it should display a jury comment for session', async function(assert) {
        // given
        const author = server.create('user', {
          firstName: 'Jernau',
          lastName: 'Gurgeh',
          fullName: 'Jernau Gurgeh',
        });
        server.create('session', {
          id: '3',
          juryComment: 'Le surveillant prétend qu\'une météorite est tombée sur le centre.',
          juryCommentedAt: new Date('2012-12-21T00:12:21Z'),
          juryCommentAuthor: author,
        });

        // when
        await visit('/sessions/3');

        // then
        assert.contains('Commentaire de l\'équipe Certification');
      });

      module('When the comment is deleted', function() {
        module('When server successfully deletes the comment', function() {
          test('it should have removed the comment', async function(assert) {
            // given
            const author = server.create('user', {
              firstName: 'Jernau',
              lastName: 'Gurgeh',
              fullName: 'Jernau Gurgeh',
            });
            server.create('session', {
              id: '6',
              juryComment: 'Le surveillant prétend qu\'une météorite est tombée sur le centre.',
              juryCommentedAt: new Date('2012-12-21T00:12:21Z'),
              juryCommentAuthor: author,
            });

            // when
            await visit('/sessions/6');
            await clickByLabel('Supprimer');
            await clickByLabel('Confirmer');

            // then
            assert.notContains('Le surveillant prétend qu\'une météorite est tombée sur le centre.');
          });
        });
      });
    });

    module('When a new comment is submitted', function() {
      module('When server successfully saves the comment', function() {
        test('it should display the new comment', async function(assert) {
          // given
          server.create('session', { id: '4', juryComment: null, juryCommentedAt: null, juryCommentAuthor: null });

          // when
          await visit('/sessions/4');
          await fillInByLabel('Texte du commentaire', 'Le surveillant prétend qu\'une météorite est tombée sur le centre.');
          await clickByLabel('Enregistrer');

          // then
          assert.contains('Le surveillant prétend qu\'une météorite est tombée sur le centre.');
        });
      });

      module('When server respond with an error', function() {
        test('it should display an error notification', async function(assert) {
          // given
          server.create('session', { id: '5', juryComment: null, juryCommentedAt: null, juryCommentAuthor: null });
          this.server.put('/admin/sessions/5/comment', () => ({
            errors: [{ detail: 'Votre commentaire n\'interesse personne.' }],
          }), 422);

          // when
          await visit('/sessions/5');
          await fillInByLabel('Texte du commentaire', 'Le surveillant prétend qu\'une météorite est tombée sur le centre.');
          await clickByLabel('Enregistrer');

          // then
          assert.contains('Une erreur est survenue pendant l\'enregistrement du commentaire.');
        });
      });
    });
  });
});
