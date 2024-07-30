import { visit } from '@1024pix/ember-testing-library';
import { currentURL } from '@ember/test-helpers';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupApplicationTest } from 'ember-qunit';
import { module, test } from 'qunit';

import { authenticateAdminMemberWithRole } from '../../../../helpers/test-init';

module('Acceptance | authenticated/certifications/certification/profile', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  module('When user is not logged in', function () {
    test('it should not be accessible by an unauthenticated user', async function (assert) {
      // given
      const certification = this.server.create('certification');

      // when
      await visit(`/certifications/${certification.id}/profile`);

      // then
      assert.strictEqual(currentURL(), '/login');
    });
  });

  module('When user is logged in', function (hooks) {
    hooks.beforeEach(async () => {
      await authenticateAdminMemberWithRole({ isSuperAdmin: true })(server);
    });

    test('it should display certification id', async function (assert) {
      // given
      this.server.create('certification', { id: 123 });
      const certifiedArea = this.server.create('certified-area', {
        id: 'idArea1',
        name: 'area1',
      });
      const certifiedCompetence = this.server.create('certified-competence', {
        id: 'idCompetence1',
        name: 'competence1',
        areaId: 'idArea1',
      });
      const certifiedTube = this.server.create('certified-tube', {
        id: 'idTube1',
        name: 'tube1',
        competenceId: 'idCompetence1',
      });
      const certifiedSkillInCertificationTest = this.server.create('certified-skill', {
        id: 'idSkill1',
        name: 'skill1',
        tubeId: 'idTube1',
        hasBeenAskedInCertif: true,
      });
      this.server.create('certified-profile', {
        id: 123,
        userId: 456,
        certifiedAreas: [certifiedArea],
        certifiedCompetences: [certifiedCompetence],
        certifiedTubes: [certifiedTube],
        certifiedSkills: [certifiedSkillInCertificationTest],
      });

      // when
      const screen = await visit('/certifications/123/profile');

      // then
      assert.dom(screen.getByText('ID du compte Pix du candidat: 456')).exists();
      assert.dom(screen.getByText('ID de la certification du candidat: 123')).exists();
      assert.dom(screen.getByText('area1')).exists();
      assert.dom(screen.getByText('competence1')).exists();
      assert.dom(screen.getByText('tube1')).exists();
    });
  });
});
