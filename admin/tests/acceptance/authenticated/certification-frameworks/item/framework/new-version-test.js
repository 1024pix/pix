import { visit } from '@1024pix/ember-testing-library';
import { click, currentURL } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { authenticateAdminMemberWithRole } from 'pix-admin/tests/helpers/test-init';
import { setupMirage } from 'pix-admin/tests/test-support/setup-mirage';
import { module, test } from 'qunit';

module('Acceptance | Certification Framework | item | Framework | new-version', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(function () {
    server.create('certification-framework', { id: 'DROIT', name: 'DROIT' });
    server.create('framework', { id: 'Pix', name: 'Pix' });
    server.create('framework-history', { id: 'DROIT' });
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
        frameworkId: 'frameworkId',
      }),
    ];
    server.create('framework', { id: 'frameworkId', name: 'DROIT', areas });

    server.create('certification-version', { id: 12, startDate: new Date(), expirationDate: null, areas });
  });

  module('when admin member has role "SUPER ADMIN"', function () {
    test('should be redirected to the tube selection route with preselected tubes ', async function (assert) {
      // given
      await authenticateAdminMemberWithRole({ isSuperAdmin: true })(server);

      // when
      const screen = await visit(`/certification-frameworks/DROIT/framework/new-version?activeVersionId=12`);

      // then
      assert.strictEqual(
        currentURL(),
        '/certification-frameworks/DROIT/framework/new-version/tubes?activeVersionId=12',
      );

      assert.dom(screen.getByRole('button', { name: 'Référentiels :' })).exists();
      await click(screen.getByRole('button', { name: 'Référentiels :' }));
      assert.dom(await screen.findByRole('checkbox', { name: 'DROIT' })).isChecked();
      assert.dom(screen.getByText('1/1 sujet(s) sélectionné(s)'));
    });

    test('should redirect to the configuration page when click on next', async function (assert) {
      // given
      await authenticateAdminMemberWithRole({ isSuperAdmin: true })(server);

      const screen = await visit(`/certification-frameworks/DROIT/framework/new-version/tubes?activeVersionId=12`);

      await click(screen.getByRole('button', { name: 'Suivant' }));

      assert.dom(await screen.findByText('configuration wow !')).exists();

      // then
      assert.strictEqual(
        currentURL(),
        '/certification-frameworks/DROIT/framework/new-version/13/configuration?activeVersionId=12',
      );
    });
  });

  module('when admin member doesn\'t have the role "SUPER ADMIN"', function () {
    test('should be redirected to the framework-history list ', async function (assert) {
      await authenticateAdminMemberWithRole()(server);
      await visit(`/certification-frameworks/DROIT/framework/new-version?activeVersionId=12`);
      assert.strictEqual(currentURL(), '/certification-frameworks/DROIT/framework');
    });
  });
});
