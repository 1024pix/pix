import { clickByName, visit } from '@1024pix/ember-testing-library';
import { currentURL } from '@ember/test-helpers';
import { t } from 'ember-intl/test-support';
import { setupApplicationTest } from 'ember-qunit';
import { authenticateAdminMemberWithRole } from 'pix-admin/tests/helpers/test-init';
import { setupMirage } from 'pix-admin/tests/test-support/setup-mirage';
import { module, test } from 'qunit';

module('Acceptance | Certification Frameworks | certification-frameworks | versions', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    await authenticateAdminMemberWithRole({ isSuperAdmin: true })(server);

    const draftVersionSummary = server.create('certification-version-summary', {
      id: 42,
      status: 'draft',
      startDate: null,
      assessmentDuration: 90,
      maximumAssessmentLength: 32,
    });
    server.create('certification-framework', {
      id: 'DROIT',
      versionSummaries: [draftVersionSummary],
    });
  });

  module('when admin member has role "SUPER ADMIN"', function () {
    test('the user should be redirected to framework history list', async function (assert) {
      await visit(`/certification-frameworks/DROIT/versions`);
      assert.strictEqual(currentURL(), '/certification-frameworks/DROIT');
    });
  });

  module('stepper', function () {
    test('shows step 1 as current on the new route', async function (assert) {
      await visit('/certification-frameworks/DROIT/versions/new');

      assert
        .dom('[aria-current="step"]')
        .containsText(t('components.certification-frameworks.certification-framework.versions.stepper.step-1'));
    });

    test('shows step 2 as current on the edit route', async function (assert) {
      await visit('/certification-frameworks/DROIT/versions/42/edit');

      assert
        .dom('[aria-current="step"]')
        .containsText(t('components.certification-frameworks.certification-framework.versions.stepper.step-2'));
    });

    test('shows step 3 as current on the calibration route', async function (assert) {
      await visit('/certification-frameworks/DROIT/versions/42/calibration');

      assert
        .dom('[aria-current="step"]')
        .containsText(t('components.certification-frameworks.certification-framework.versions.stepper.step-3'));
    });

    test('shows step 4 as current on the scoring route', async function (assert) {
      server.schema.certificationVersions.find(42).update({ externalCalibrationId: 1 });
      server.create('calibration-scoring-configuration', {
        id: '1',
        calibrationId: 1,
        globalScoringConfiguration: [{ bounds: { min: -4.67, max: -1.4 }, meshLevel: 0 }],
      });

      await visit('/certification-frameworks/DROIT/versions/42/scoring');

      assert
        .dom('[aria-current="step"]')
        .containsText(t('components.certification-frameworks.certification-framework.versions.stepper.step-4'));
    });
  });

  module('navigation', function () {
    test('step 1 is not navigable', async function (assert) {
      const screen = await visit('/certification-frameworks/DROIT/versions/42/calibration');

      assert
        .dom(
          screen.queryByRole('button', {
            name: t('components.certification-frameworks.certification-framework.versions.stepper.step-1'),
          }),
        )
        .doesNotExist();
    });

    test('clicking a navigable step navigates to the corresponding route', async function (assert) {
      await visit('/certification-frameworks/DROIT/versions/42/calibration');

      await clickByName(t('components.certification-frameworks.certification-framework.versions.stepper.step-2'));

      assert.ok(currentURL().endsWith('/42/edit'));
    });
  });
});
