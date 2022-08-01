import { fillIn, currentURL, find, visit } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { authenticateByEmail } from '../helpers/authentication';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { clickByLabel } from '../helpers/click-by-label';
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
        assert.equal(currentURL(), '/connexion');
      });

      test('should redirect to assessment after signin', async function (assert) {
        // when
        await fillIn('#login', user.email);
        await fillIn('#password', user.password);
        await clickByLabel(this.intl.t('pages.sign-in.actions.submit'));

        assert.dom(currentURL()).hasText('/assessments');
      });
    });

    module('When user is logged in', function (hooks) {
      hooks.beforeEach(async function () {
        await authenticateByEmail(user);
      });

      module('When competence evaluation exists', function (hooks) {
        hooks.beforeEach(async function () {
          await visit('/competences/1/evaluer');
        });

        test('should redirect to assessment', async function (assert) {
          // then
          assert.dom(currentURL()).hasText(/assessments/);
          assert.dom(find('.assessment-banner')).exists();
        });
      });

      module('When competence evaluation does not exist', function (hooks) {
        hooks.beforeEach(async function () {
          await visit('/competences/nonExistantCompetenceId/evaluer');
        });

        test('should show an error message', async function (assert) {
          assert.dom(find('.error-page__main-content')).exists();
        });
      });
    });
  });
});
