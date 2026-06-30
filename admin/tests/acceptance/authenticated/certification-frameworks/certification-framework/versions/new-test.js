import { visit, within } from '@1024pix/ember-testing-library';
import { click, currentURL } from '@ember/test-helpers';
import { t } from 'ember-intl/test-support';
import { setupApplicationTest } from 'ember-qunit';
import { Response } from 'miragejs';
import { authenticateAdminMemberWithRole } from 'pix-admin/tests/helpers/test-init';
import { setupMirage } from 'pix-admin/tests/test-support/setup-mirage';
import { module, test } from 'qunit';

module('Acceptance | Certification Framework | item | Framework | new', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  let coreFrameworkHistory, droitFrameworkHistory;
  hooks.beforeEach(function () {
    coreFrameworkHistory = server.create('framework-history', {
      history: [
        {
          id: 13,
          startDate: new Date('2023-10-10'),
          expirationDate: null,
          assessmentDuration: 90,
          maximumAssessmentLength: 32,
          status: 'active',
        },
        {
          id: 14,
          startDate: null,
          expirationDate: null,
          assessmentDuration: 90,
          maximumAssessmentLength: 32,
          status: 'draft',
        },
      ],
    });
    droitFrameworkHistory = server.create('framework-history', {
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

    server.create('certification-framework', { id: 'DROIT', name: 'DROIT' });
    server.create('certification-framework', { id: 'Pix', name: 'CORE' });

    server.create('certification-version', {
      id: 12,
      startDate: new Date(),
      scope: 'DROIT',
      expirationDate: null,
      areas,
    });
    server.create('certification-version', {
      id: 13,
      startDate: new Date(),
      scope: 'CORE',
      expirationDate: null,
      areas: areas2,
    });
    server.create('certification-version', {
      id: 14,
      startDate: null,
      scope: 'CORE',
      expirationDate: null,
      areas: areas2,
    });
  });

  module('when admin member has role "SUPER ADMIN"', function () {
    test('should display a breadcrum with the correct scope', async function (assert) {
      await authenticateAdminMemberWithRole({ isSuperAdmin: true })(server);
      // when
      const screen = await visit(`/certification-frameworks/CORE/versions/new?activeVersionId=13`);

      const nav = screen.getAllByRole('navigation')[1];
      // then
      assert.ok(within(nav).getByRole('link', { name: t('components.certification-frameworks.title') }));
      assert.ok(within(nav).getByRole('link', { name: 'CORE' }));
      assert.ok(within(nav).getByText(t('components.certification-frameworks.certification-framework.versions.title')));
    });

    module('when there is already a draftVersion in scope', function () {
      test('stays on the page with a notification error', async function (assert) {
        // given
        server.get('admin/certification-frameworks/:scope/framework-history', () => {
          return coreFrameworkHistory;
        });
        server.post('/admin/certification-versions', function () {
          return new Response(
            400,
            {},
            {
              errors: [
                {
                  status: '400',
                  detail: "Il est interdit de créer une nouvelle version lorsqu'il y en a déjà une en cours d'édition",
                },
              ],
            },
          );
        });
        await authenticateAdminMemberWithRole({ isSuperAdmin: true })(server);

        // when
        const screen = await visit(`/certification-frameworks/CORE/versions/new?activeVersionId=13`);
        await click(screen.getByRole('button', { name: 'Créer la nouvelle version du référentiel de certification' }));

        // then
        assert.strictEqual(currentURL(), '/certification-frameworks/CORE/versions/new?activeVersionId=13');
        assert
          .dom(
            screen.getByText(
              "Il est interdit de créer une nouvelle version lorsqu'il y en a déjà une en cours d'édition",
            ),
          )
          .exists();
      });
    });

    module('when the is no draft version in scope', function () {
      test('should redirect to the version edit page', async function (assert) {
        server.get('admin/certification-frameworks/:scope/framework-history', () => {
          return droitFrameworkHistory;
        });
        server.post('/admin/certification-versions', function (schema) {
          droitFrameworkHistory.update({
            history: [
              ...droitFrameworkHistory.history,
              {
                id: 77,
                startDate: null,
                expirationDate: null,
                assessmentDuration: 10,
                maximumAssessmentLength: 30,
                status: 'draft',
              },
            ],
          });
          return schema.create('certification-version', {
            id: 77,
            startDate: null,
            expirationDate: null,
            assessmentDuration: 10,
            maximumAssessmentLength: 30,
            status: 'draft',
          });
        });
        await authenticateAdminMemberWithRole({ isSuperAdmin: true })(server);

        const screen = await visit(`/certification-frameworks/DROIT/versions/new?activeVersionId=12`);
        await click(screen.getByRole('button', { name: 'Créer la nouvelle version du référentiel de certification' }));

        assert.strictEqual(currentURL(), '/certification-frameworks/DROIT/versions/77/edit');
        assert.dom(screen.getByText('form'));

        await click(screen.getByRole('link', { name: 'DROIT' }));
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
