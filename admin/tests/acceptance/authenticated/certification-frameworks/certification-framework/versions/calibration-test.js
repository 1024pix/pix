import { clickByName, visit } from '@1024pix/ember-testing-library';
import { currentURL, settled } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { authenticateAdminMemberWithRole } from 'pix-admin/tests/helpers/test-init';
import { setupMirage } from 'pix-admin/tests/test-support/setup-mirage';
import { module, test } from 'qunit';

module('Acceptance | Certification Framework | item | Framework | calibration', function (hooks) {
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
    module('when trying to load calibration for a non-draft version', function () {
      test('redirects to versions list', async function (assert) {
        await authenticateAdminMemberWithRole({ isSuperAdmin: true })(server);

        await visit(`/certification-frameworks/CORE/versions/13/calibration`);
        assert.strictEqual(currentURL(), '/certification-frameworks/CORE');

        await visit(`/certification-frameworks/CORE/versions/15/calibration`);
        assert.strictEqual(currentURL(), '/certification-frameworks/CORE');
      });
    });

    module('when loading a report for a version', function (hooks) {
      const generatedAt = new Date('2026-08-08T14:00:00Z');
      hooks.beforeEach(async function () {
        server.get('/admin/certification-versions/:id/latest-calibration-report', (schema) => {
          return schema.create('calibration-report', {
            id: 999,
            calibrationId: 1,
            generatedAt,
            reportLines: [
              {
                additionalContent: null,
                alertLevel: null,
                content: 15,
                label: 'CALIBRATED_CHALLENGE_COUNT',
              },
              {
                additionalContent: 'tubeA',
                alertLevel: 'LOW',
                content: 1,
                label: 'TUBE_ONLY_IN_VERSION_COUNT',
              },
              {
                additionalContent: "La calibration a été démarrée depuis plus d'1 an",
                alertLevel: 'HIGH',
                content: new Date('2021-01-01'),
                label: 'CALIBRATION_STARTED_AT',
              },
              {
                additionalContent: null,
                alertLevel: null,
                content: 'CORE',
                label: 'CALIBRATION_SCOPE',
              },
              {
                additionalContent: null,
                alertLevel: null,
                content: 'VALIDATED',
                label: 'CALIBRATION_STATUS',
              },
            ],
          });
        });
        await authenticateAdminMemberWithRole({ isSuperAdmin: true })(server);
      });

      test('displays the report without any user action', async function (assert) {
        const screen = await visit(`/certification-frameworks/CORE/versions/14/calibration`);

        await settled();
        const displayedGeneratedAt = generatedAt.toLocaleString('fr-FR', {
          year: 'numeric',
          month: 'numeric',
          day: 'numeric',
          hour: 'numeric',
          minute: 'numeric',
          second: 'numeric',
        });
        assert.dom(screen.getByText(`Rapport de la calibration d'ID 1 générée le ${displayedGeneratedAt}`)).exists();
      });

      test('saves the calibrationId when the user validates the report', async function (assert) {
        const patchedAttributes = [];
        server.patch('/admin/certification-versions/:id', (schema, request) => {
          const certificationVersion = schema.certificationVersions.find(request.params.id);
          const params = JSON.parse(request.requestBody);
          patchedAttributes.push(params.data.attributes);
          return certificationVersion.update(params.data.attributes);
        });

        const screen = await visit(`/certification-frameworks/CORE/versions/14/calibration`);
        await clickByName("Enregistrer l'ID 1 de calibration");

        await settled();

        assert.strictEqual(patchedAttributes.length, 1);
        assert.strictEqual(patchedAttributes[0]['external-calibration-id'], 1);
        assert.dom(screen.getByText("L'ID de calibration a été enregistré.")).exists();
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
});
