import { currentURL, visit } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { authenticateByEmail } from '../helpers/authentication';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';

module('Acceptance | Error page', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  let user;

  hooks.beforeEach(function () {
    user = server.create('user', 'withEmail');
  });

  test('should display the error page when the api returned an error which is not 401', async function (assert) {
    // given
    await authenticateByEmail(user);
    this.server.get('/certifications', { errors: [{ code: 500 }] }, 500);

    // when
    await visit('/mes-certifications');

    // then
    assert.equal(currentURL(), '/mes-certifications');
    assert.dom('.error-page').exists();
  });
});
