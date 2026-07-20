import { clickByName, visit, within } from '@1024pix/ember-testing-library';
import { click, currentURL } from '@ember/test-helpers';
import { t } from 'ember-intl/test-support';
import { setupApplicationTest } from 'ember-qunit';
import { authenticateAdminMemberWithRole } from 'pix-admin/tests/helpers/test-init';
import { setupMirage } from 'pix-admin/tests/test-support/setup-mirage';
import { module, test } from 'qunit';

module('Acceptance | Certification Framework | item | Framework | new', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(function () {
    const tube = server.create('tube', {
      id: 'tubeId2',
      name: '@tubeName2',
      practicalTitle: 'Tube 2',
      skills: [],
      level: 8,
    });
    const thematics = [server.create('thematic', { id: 'thematicId1', name: 'Thématique 1', tubes: [tube] })];
    const competences = [
      server.create('competence', {
        id: 'competenceId',
        index: '1',
        name: 'Titre competence',
        thematics,
      }),
    ];
    const areas = [
      server.create('area', {
        id: 'areaId',
        title: 'Titre domaine',
        code: 1,
        competences,
        frameworkId: 'Pix+',
      }),
    ];
    const areas2 = [
      server.create('area', {
        id: 'areaId2',
        title: 'Titre domaine',
        code: 2,
        competences,
        frameworkId: 'Pix',
      }),
    ];
    server.create('framework', { id: 'Pix+', name: 'DROIT', areas });
    server.create('framework', { id: 'Pix', name: 'Pix', areas: areas2 });

    const versionSummaryDroit = server.create('certification-version-summary', {
      id: 12,
      startDate: new Date('2023-10-10'),
      expirationDate: null,
      assessmentDuration: 90,
      maximumAssessmentLength: 32,
      status: 'active',
    });
    server.schema.certificationVersions.find(versionSummaryDroit.id).update({ areas });
    server.create('certification-framework', { id: 'DROIT', versionSummaries: [versionSummaryDroit] });
  });

  module('when admin member has role "SUPER ADMIN"', function () {
    module('when the is no draft version in scope', function () {
      test('should redirect to the version edit page', async function (assert) {
        server.post('/admin/certification-versions', function (schema) {
          const newVersionSummary = schema.create('certification-version-summary', {
            id: 77,
            startDate: null,
            expirationDate: null,
            assessmentDuration: 10,
            maximumAssessmentLength: 30,
            status: 'draft',
          });
          const droitFramework = schema.certificationFrameworks.find('DROIT');
          droitFramework.versionSummaries.add(newVersionSummary);
          droitFramework.save();
          return schema.create('certification-version', {
            id: newVersionSummary.id,
            scope: 'DROIT',
            startDate: newVersionSummary.startDate,
            expirationDate: newVersionSummary.expirationDate,
            assessmentDuration: newVersionSummary.assessmentDuration,
            maximumAssessmentLength: newVersionSummary.maximumAssessmentLength,
            status: newVersionSummary.status,
          });
        });
        await authenticateAdminMemberWithRole({ isSuperAdmin: true })(server);

        const screen = await visit(`/certification-frameworks/DROIT`);
        await clickByName('Créer une nouvelle version du référentiel');
        await click(screen.getByRole('button', { name: 'Créer la nouvelle version du référentiel de certification' }));

        assert.strictEqual(currentURL(), '/certification-frameworks/DROIT/versions/77/edit');
        assert.dom(
          screen.getByText(
            t('components.certification-frameworks.certification-framework.versions.page-title', { scope: 'DROIT' }),
          ),
        );

        await clickByName('Annuler');
        assert.strictEqual(currentURL(), '/certification-frameworks/DROIT');
        const [, row1, row2] = await screen.findAllByRole('row');
        assert.dom(within(row1).getByRole('cell', { name: '77' })).exists();
        assert.dom(within(row1).getByRole('cell', { name: "En cours d'édition" })).exists();
        assert.dom(within(row2).getByRole('cell', { name: '12' })).exists();
        assert.dom(within(row2).getByRole('cell', { name: 'Actif' })).exists();
      });
    });
  });

  module('when admin member doesn\'t have the role "SUPER ADMIN"', function () {
    test('should be redirected to the framework-history list ', async function (assert) {
      await authenticateAdminMemberWithRole({ isSuperAdmin: false })(server);
      await visit(`/certification-frameworks/DROIT/versions/new`);
      assert.strictEqual(currentURL(), '/certification-frameworks/DROIT');
    });
  });
});
