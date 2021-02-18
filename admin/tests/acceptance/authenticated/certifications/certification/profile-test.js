import { module, test } from 'qunit';
import { visit, currentURL } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { createAuthenticateSession } from 'pix-admin/tests/helpers/test-init';

import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Acceptance | authenticated/certifications/certification/profile', function(hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  module('When user is not logged in', function() {

    test('it should not be accessible by an unauthenticated user', async function(assert) {
      // given
      const certification = this.server.create('certification');

      // when
      await visit(`/certifications/${certification.id}/profile`);

      // then
      assert.equal(currentURL(), '/login');
    });
  });

  module('When user is logged in', function(hooks) {

    hooks.beforeEach(async () => {
      await createAuthenticateSession({ userId: 1 });
    });

    test('it should display certification id', async function(assert) {
      // given
      const certification = this.server.create('certification');
      this.server.create('certified-profile', { id: certification.id });

      // when
      await visit(`/certifications/${certification.id}/profile`);

      // then
      assert.contains(certification.id);
    });
  });
});
