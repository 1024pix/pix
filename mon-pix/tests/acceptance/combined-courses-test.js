import { visit } from '@1024pix/ember-testing-library';
import { currentURL } from '@ember/test-helpers';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupApplicationTest } from 'ember-qunit';
import { module, test } from 'qunit';

import { authenticate } from '../helpers/authentication';
import setupIntl from '../helpers/setup-intl';

module('Acceptance | CombinedCourses', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks);
  let prescritUser;

  hooks.beforeEach(async function () {
    server.create('combined-course', {
      code: 'COMBINIX1',
      organizationId: 1,
      items: [],
    });
    server.create('verified-code', { id: 'COMBINIX1', type: 'combined-course' });
    prescritUser = server.create('user', 'withEmail', {
      pixAppTermsOfServiceStatus: 'accepted',
    });
    await authenticate(prescritUser);
  });

  test('it redirects to combined course presentation page', async function (assert) {
    // when
    await visit('/parcours/COMBINIX1');

    // then
    assert.strictEqual(currentURL(), '/parcours/COMBINIX1');
  });

  test('it redirects to combined course disabled feature page', async function (assert) {
    server.create('feature-toggle', {
      id: 0,
      areCombinedCoursesEnabled: false,
    });

    // when
    await visit('/parcours/COMBINIX1');

    // then
    assert.strictEqual(currentURL(), '/parcours/erreur');
  });
});
