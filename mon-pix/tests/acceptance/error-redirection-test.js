import { visit } from '@1024pix/ember-testing-library';
import { currentURL } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'mon-pix/tests/test-support/setup-mirage';
import { module, test } from 'qunit';

import { authenticate } from '../helpers/authentication';

module('Acceptance | Error page', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  let user;

  hooks.beforeEach(function () {
    user = server.create('user', 'withEmail');
  });

  test('should display the error page when the api returned an error which is not 401', async function (assert) {
    // given
    await authenticate(user);
    this.server.get('/certificate-summaries', { errors: [{ code: 500 }] }, 500);

    // when
    await visit('/certifications');

    // then
    assert.strictEqual(currentURL(), '/certifications');
    assert.dom('.error-page').exists();
  });
});
