import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { visit, screen } from '@1024pix/ember-testing-library';
import { currentURL } from '@ember/test-helpers';
import { authenticateAdminMemberWithRole } from 'pix-admin/tests/helpers/test-init';

module('Acceptance | Trainings | Detail', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  module('When admin member is logged in', function (hooks) {
    hooks.beforeEach(async () => {
      await authenticateAdminMemberWithRole({ isSuperAdmin: true })(server);
    });

    test('it should be accessible for an authenticated user', async function (assert) {
      // given
      const trainingId = 2;

      this.server.create('training', {
        id: 1,
        title: 'Devenir tailleur de citrouille',
        link: 'http://www.example2.net',
        type: 'autoformation',
        duration: '10:00:00',
        locale: 'fr-fr',
        editorName: "Ministère de l'éducation nationale et de la jeunesse",
        editorLogoUrl: 'https://mon-logo.svg',
        prerequisiteThreshold: null,
        goalThreshold: null,
      });
      this.server.create('training', {
        id: 2,
        title: 'Apprendre à piloter des chauves-souris',
        link: 'http://www.example2.net',
        type: 'webinaire',
        duration: '10:00:00',
        locale: 'fr-fr',
        editorName: "Ministère de l'éducation nationale et de la jeunesse",
        editorLogoUrl: 'https://mon-logo.svg',
        prerequisiteThreshold: null,
        goalThreshold: null,
      });

      // when
      await visit(`/trainings/${trainingId}/`);
      // then
      assert.strictEqual(currentURL(), `/trainings/${trainingId}/`);
      assert.dom(screen.getByRole('heading', { name: 'Apprendre à piloter des chauves-souris' })).exists();
    });
  });
});
