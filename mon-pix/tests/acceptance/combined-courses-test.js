import { visit } from '@1024pix/ember-testing-library';
import { currentURL } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'mon-pix/tests/test-support/setup-mirage';
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
    assert.strictEqual(currentURL(), '/parcours/COMBINIX1/sommaire');
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

  module('Tunnel', function () {
    module('when combined course has an item left to complete', function () {
      test('it displays the tunnel page', async function (assert) {
        // given
        const item = server.create('combined-course-item', {
          title: 'Mon module',
          reference: 'mon-module',
          type: 'module',
          shortId: 'm4tth74s',
          isCompleted: false,
        });
        server.create('combined-course', {
          code: 'COMBINIX2',
          organizationId: 1,
          items: [item],
        });
        server.create('verified-code', { id: 'COMBINIX2', type: 'combined-course' });

        // when
        await visit('/parcours/COMBINIX2/checkpoint');

        // then
        assert.strictEqual(currentURL(), '/parcours/COMBINIX2/checkpoint');
      });
    });

    module('when combined course is completed', function () {
      test('it redirects to combined course presentation page', async function (assert) {
        // given
        const completedItem = server.create('combined-course-item', {
          title: 'Diagnostique',
          reference: 'ABCDIAG',
          type: 'campaign',
          isCompleted: true,
        });
        server.create('combined-course', {
          code: 'COMBINIX3',
          organizationId: 1,
          items: [completedItem],
        });
        server.create('verified-code', { id: 'COMBINIX3', type: 'combined-course' });

        // when
        await visit('/parcours/COMBINIX3/checkpoint');

        // then
        assert.strictEqual(currentURL(), '/parcours/COMBINIX3/sommaire');
      });
    });
  });
});
