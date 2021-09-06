import { module, test } from 'qunit';
import { visit, currentURL } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { createAuthenticateSession } from 'pix-admin/tests/helpers/test-init';

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

    module('When session has a no jury comment', function() {
      test('it should not display a jury comment for session', async function(assert) {
        // given
        server.create('session', {
          id: '2',
          juryComment: null,
          juryCommentedAt: null,
          juryCommentAuthor: null,
        });

        // when
        await visit('/sessions/2');

        // then
        assert.notContains('Commentaire de l\'équipe Certification');
      });
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
    });
  });
});
