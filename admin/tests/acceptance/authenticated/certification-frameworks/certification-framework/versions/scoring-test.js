import { clickByName, visit } from '@1024pix/ember-testing-library';
import { currentURL } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { authenticateAdminMemberWithRole } from 'pix-admin/tests/helpers/test-init';
import { setupMirage } from 'pix-admin/tests/test-support/setup-mirage';
import { module, test } from 'qunit';

import { t } from '../../../../../helpers/setup-intl-rendering';

module('Acceptance | Certification Framework | item | Framework | scoring', function (hooks) {
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
    server.create('certification-version', {
      id: 13,
      status: 'active',
      globalScoringConfiguration: [{ bounds: { min: -4, max: 2 }, meshLevel: 0 }],
    });
    server.create('certification-version', {
      id: 14,
      status: 'draft',
      externalCalibrationId: 1,
      globalScoringConfiguration: [{ bounds: { min: 1, max: 8 }, meshLevel: 0 }],
    });
    server.create('calibration-scoring-configuration', {
      id: '1',
      calibrationId: 1,
      globalScoringConfiguration: [
        { bounds: { min: -4.67, max: -1.4 }, meshLevel: 0 },
        { bounds: { min: -1.4, max: 0.6 }, meshLevel: 1 },
      ],
    });
  });

  module('when admin member has role "SUPER ADMIN"', function () {
    module('when trying to load scoring for a non-draft version', function () {
      test('redirects to versions list', async function (assert) {
        await authenticateAdminMemberWithRole({ isSuperAdmin: true })(server);

        await visit(`/certification-frameworks/CORE/versions/13/scoring`);
        assert.strictEqual(currentURL(), '/certification-frameworks/CORE');

        await visit(`/certification-frameworks/CORE/versions/15/scoring`);
        assert.strictEqual(currentURL(), '/certification-frameworks/CORE');
      });
    });

    module('when visiting the scoring page for a draft version', function () {
      test('displays the scoring form', async function (assert) {
        await authenticateAdminMemberWithRole({ isSuperAdmin: true })(server);

        const screen = await visit(`/certification-frameworks/CORE/versions/14/scoring`);
        assert
          .dom(
            screen.getByText(t('components.certification-frameworks.certification-framework.versions.scoring.title')),
          )
          .exists();
      });
    });

    module('when the draft version has no calibration attached', function () {
      test('redirects to the framework page', async function (assert) {
        server.db.certificationVersions.update('14', { externalCalibrationId: null });
        await authenticateAdminMemberWithRole({ isSuperAdmin: true })(server);

        await visit(`/certification-frameworks/CORE/versions/14/scoring`);

        assert.strictEqual(currentURL(), '/certification-frameworks/CORE');
      });
    });

    module('when the attached calibration carries a scoring configuration', function () {
      test('keeps the configuration already saved on the draft version', async function (assert) {
        await authenticateAdminMemberWithRole({ isSuperAdmin: true })(server);

        const screen = await visit(`/certification-frameworks/CORE/versions/14/scoring`);

        assert.dom(screen.getByDisplayValue('8')).exists();
        assert.dom(screen.queryByDisplayValue('-4.67')).doesNotExist();
      });

      module('when the draft version has no configuration saved yet', function (hooks) {
        hooks.beforeEach(function () {
          server.db.certificationVersions.update('14', { globalScoringConfiguration: [] });
        });

        test('fills the form with the calibration values on page load', async function (assert) {
          await authenticateAdminMemberWithRole({ isSuperAdmin: true })(server);

          const screen = await visit(`/certification-frameworks/CORE/versions/14/scoring`);

          assert.dom(screen.getByDisplayValue('-4.67')).exists();
          assert.dom(screen.getByDisplayValue('0.6')).exists();
        });

        test('fills the form even when the version is already in the store', async function (assert) {
          await authenticateAdminMemberWithRole({ isSuperAdmin: true })(server);

          // the edit page loads the very same record, so reaching scoring from there hits the store cache
          await visit(`/certification-frameworks/CORE/versions/14/edit`);
          const screen = await visit(`/certification-frameworks/CORE/versions/14/scoring`);

          assert.dom(screen.getByDisplayValue('-4.67')).exists();
          assert.dom(screen.getByDisplayValue('0.6')).exists();
        });

        test('persists the calibration bounds when submitting without editing them', async function (assert) {
          let patchedAttributes;
          server.patch('/admin/certification-versions/:id', (schema, request) => {
            patchedAttributes = JSON.parse(request.requestBody).data.attributes;
            return schema.certificationVersions.find(request.params.id);
          });
          await authenticateAdminMemberWithRole({ isSuperAdmin: true })(server);

          await visit(`/certification-frameworks/CORE/versions/14/scoring`);
          await clickByName(
            t('components.certification-frameworks.certification-framework.versions.scoring.capacity-submit-button'),
          );

          assert.deepEqual(patchedAttributes['global-scoring-configuration'], [
            { bounds: { min: -4.67, max: -1.4 }, meshLevel: 0 },
            { bounds: { min: -1.4, max: 0.6 }, meshLevel: 1 },
          ]);
        });
      });
    });

    module('when the attached calibration has no scoring configuration yet', function (hooks) {
      hooks.beforeEach(function () {
        server.db.calibrationScoringConfigurations.update('1', { globalScoringConfiguration: [] });
      });

      test('redirects to the framework page', async function (assert) {
        await authenticateAdminMemberWithRole({ isSuperAdmin: true })(server);

        await visit(`/certification-frameworks/CORE/versions/14/scoring`);

        assert.strictEqual(currentURL(), '/certification-frameworks/CORE');
      });
    });

    module('when clicking on cancel button', function () {
      test('redirects to certification-framework page', async function (assert) {
        await authenticateAdminMemberWithRole({ isSuperAdmin: true })(server);

        await visit(`/certification-frameworks/CORE/versions/14/scoring`);
        await clickByName('Annuler');
        assert.strictEqual(currentURL(), '/certification-frameworks/CORE');
      });
    });
  });

  module('when admin member doesn\'t have the role "SUPER ADMIN"', function () {
    test('should be redirected to the framework page', async function (assert) {
      await authenticateAdminMemberWithRole({ isSuperAdmin: false })(server);
      await visit(`/certification-frameworks/CORE/versions/14/scoring`);
      assert.strictEqual(currentURL(), '/certification-frameworks/CORE');
    });
  });
});
