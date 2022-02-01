import { module, test } from 'qunit';
import { visit, currentURL } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';

import { createAuthenticateSession } from '../helpers/test-init';

module('Acceptance | routes protection', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  module('When route is /about', function () {
    test('guest users can visit /about', async function (assert) {
      // when
      await visit('/about');

      // then
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line qunit/no-assert-equal
      assert.equal(currentURL(), '/about');
    });
  });

  module('When route is /organizations/new', function () {
    test('guest users are redirected to login page when visiting /organizations/new', async function (assert) {
      // when
      await visit('/organizations/new');

      // then
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line qunit/no-assert-equal
      assert.equal(currentURL(), '/login');
    });

    test('authenticated users can visit /organizations/new', async function (assert) {
      // given
      const user = this.server.create('user');
      await createAuthenticateSession({ userId: user.id });

      // when
      await visit('/organizations/new');

      // then
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line qunit/no-assert-equal
      assert.equal(currentURL(), '/organizations/new');
    });
  });

  module('When route is /organizations/list', function () {
    test('guest users are redirected to login page when visiting /organizations/list', async function (assert) {
      // when
      await visit('/organizations/list');

      // then
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line qunit/no-assert-equal
      assert.equal(currentURL(), '/login');
    });
  });

  module('When route is /certifications/menu', function () {
    test('guest users are redirected to login page when visiting /certifications', async function (assert) {
      // when
      await visit('/certifications');

      // then
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line qunit/no-assert-equal
      assert.equal(currentURL(), '/login');
    });
  });

  module('When route is /certifications/single', function () {
    test('guest users are redirected to login page when visiting /certifications/single', async function (assert) {
      // when
      await visit('/certifications/single');

      // then
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line qunit/no-assert-equal
      assert.equal(currentURL(), '/login');
    });
  });

  module('When route is /sessions', function () {
    test('guest users are redirected to login page when visiting /sessions', async function (assert) {
      // when
      await visit('/sessions');

      // then
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line qunit/no-assert-equal
      assert.equal(currentURL(), '/login');
    });
  });
});
