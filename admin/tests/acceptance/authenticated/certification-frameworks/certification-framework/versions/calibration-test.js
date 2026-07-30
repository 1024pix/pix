import { clickByName, visit } from '@1024pix/ember-testing-library';
import { currentURL } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { authenticateAdminMemberWithRole } from 'pix-admin/tests/helpers/test-init';
import { setupMirage } from 'pix-admin/tests/test-support/setup-mirage';
import { module, test } from 'qunit';

module('Acceptance | Certification Framework | item | Framework | edit', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(function () {
    const versionSummaries = [];
    versionSummaries.push(
      server.create('certification-version-summary', {
        id: 13,
        scope: 'CORE',
        startDate: new Date('2023-10-10'),
        expirationDate: null,
        assessmentDuration: 90,
        maximumAssessmentLength: 32,
        status: 'active',
      }),
    );
    versionSummaries.push(
      server.create('certification-version-summary', {
        id: 14,
        scope: 'CORE',
        startDate: null,
        expirationDate: null,
        assessmentDuration: 66,
        maximumAssessmentLength: 67,
        status: 'draft',
      }),
    );
    versionSummaries.push(
      server.create('certification-version-summary', {
        id: 15,
        scope: 'CORE',
        startDate: new Date('2020-01-01'),
        expirationDate: new Date('2021-01-01'),
        assessmentDuration: 90,
        maximumAssessmentLength: 32,
        status: 'archived',
      }),
    );
    server.create('certification-framework', { id: 'CORE', versionSummaries });
  });

  module('when admin member has role "SUPER ADMIN"', function () {
    module('when trying to calibrate a non-draft version', function () {
      test('redirects to versions list', async function (assert) {
        await authenticateAdminMemberWithRole({ isSuperAdmin: true })(server);

        await visit(`/certification-frameworks/CORE/versions/13/calibration`);
        assert.strictEqual(currentURL(), '/certification-frameworks/CORE');

        await visit(`/certification-frameworks/CORE/versions/15/calibration`);
        assert.strictEqual(currentURL(), '/certification-frameworks/CORE');
      });
    });

    module('when trying to click on cancel button', function () {
      test('redirects to certification-framework page', async function (assert) {
        await authenticateAdminMemberWithRole({ isSuperAdmin: true })(server);

        await visit(`/certification-frameworks/CORE/versions/14/edit`);
        await clickByName('Annuler');
        assert.strictEqual(currentURL(), '/certification-frameworks/CORE');
      });
    });
  });

  module('when admin member doesn\'t have the role "SUPER ADMIN"', function () {
    test('should be redirected to the framework-history list ', async function (assert) {
      await authenticateAdminMemberWithRole({ isSuperAdmin: false })(server);
      await visit(`/certification-frameworks/CORE/versions/14/calibration`);
      assert.strictEqual(currentURL(), '/certification-frameworks/CORE');
    });
  });
});
