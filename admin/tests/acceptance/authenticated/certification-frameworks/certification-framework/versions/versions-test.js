import { visit } from '@1024pix/ember-testing-library';
import { currentURL } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { authenticateAdminMemberWithRole } from 'pix-admin/tests/helpers/test-init';
import { setupMirage } from 'pix-admin/tests/test-support/setup-mirage';
import { module, test } from 'qunit';

module('Acceptance | Certification Frameworks | certification-frameworks | versions', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(function () {
    server.create('framework-history', {
      history: [
        {
          id: 12,
          startDate: new Date('2023-10-10'),
          expirationDate: null,
          assessmentDuration: 90,
          maximumAssessmentLength: 32,
          status: 'active',
        },
      ],
    });

    server.create('certification-framework', { id: 'DROIT', name: 'DROIT' });
    server.create('certification-version', {
      id: 12,
      startDate: new Date('2023-10-10'),
      expirationDate: null,
      scope: 'DROIT',
      areas: [],
      status: 'active',
    });
  });

  module('when admin member has role "SUPER ADMIN"', function () {
    test('the user should be redirected to framework history list', async function (assert) {
      await authenticateAdminMemberWithRole({ isSuperAdmin: true })(server);
      await visit(`/certification-frameworks/DROIT/versions`);
      assert.strictEqual(currentURL(), '/certification-frameworks/DROIT');
    });
  });
});
