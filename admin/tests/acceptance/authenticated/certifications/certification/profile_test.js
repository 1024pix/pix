import { module, test } from 'qunit';
import { visit, currentURL } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { createAuthenticateSession } from 'pix-admin/tests/helpers/test-init';

import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';

module('Acceptance | authenticated/certifications/certification/profile', function(hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  module('When user is not logged in', function() {

    test('it should not be accessible by an unauthenticated user', async function(assert) {
      // given
      const certification = this.server.create('certification');

      // when
      await visit(`/certifications/${certification.id}/profile`);

      // then
      assert.equal(currentURL(), '/login');
    });
  });

  module('When user is logged in', function(hooks) {

    hooks.beforeEach(async () => {
      const { id: userId } = server.create('user');
      await createAuthenticateSession({ userId });
    });

    test('it should display certification id', async function(assert) {
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
      await visit('/certifications/123/profile');

      // then
      assert.contains('ID du compte Pix du candidat: 456');
      assert.contains('ID de la certification du candidat: 123');
      assert.contains('area1');
      assert.contains('competence1');
      assert.contains('tube1');
    });
  });
});
