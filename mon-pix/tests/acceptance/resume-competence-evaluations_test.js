import { visit } from '@1024pix/ember-testing-library';
import { click, currentURL, fillIn } from '@ember/test-helpers';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupApplicationTest } from 'ember-qunit';
import { module, test } from 'qunit';

import { authenticate } from '../helpers/authentication';
import setupIntl from '../helpers/setup-intl';

module('Acceptance | Competence Evaluations | Resume Competence Evaluations', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks);
  let user;

  hooks.beforeEach(function () {
    user = server.create('user', 'withEmail');
  });

  module('Resume a competence evaluation', function () {
    module('When user is not logged in', function (hooks) {
      hooks.beforeEach(async function () {
        await visit('/competences/1/evaluer');
      });

      test('should redirect to signin page', async function (assert) {
        assert.strictEqual(currentURL(), '/connexion');
      });

      test('should redirect to assessment after signin', async function (assert) {
        // given
        const screen = await visit('/competences/1/evaluer');

        // when
        await fillIn(screen.getByRole('textbox', { name: 'Adresse e-mail ou identifiant' }), user.email);
        await fillIn(screen.getByLabelText('Mot de passe'), user.password);
        await click(screen.getByRole('button', { name: this.intl.t('pages.sign-in.actions.submit') }));

        assert.ok(currentURL().includes('/assessments'));
      });
    });

    module('When user is logged in', function (hooks) {
      hooks.beforeEach(async function () {
        await authenticate(user);
      });

      module('When competence evaluation exists', function () {
        test('should redirect to assessment', async function (assert) {
          // given & when
          const screen = await visit('/competences/1/evaluer');

          // then
          assert.ok(currentURL().includes('/assessments/'));
          assert.dom(screen.getByRole('banner')).exists();
        });
      });

      module('When competence evaluation does not exist', function () {
        test('should show an error message', async function (assert) {
          // given & when
          try {
            const screen = await visit('/competences/nonExistantCompetenceId/evaluer');

            // then
            assert.dom(screen.getByRole('heading', { name: 'Oups, une erreur est survenue !' })).exists();
          } catch (e) {
            // eslint-disable-next-line no-console
            console.error(e);
          }
        });
      });
    });
  });
});
