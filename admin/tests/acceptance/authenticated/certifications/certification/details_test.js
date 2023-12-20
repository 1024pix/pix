import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import { visit } from '@1024pix/ember-testing-library';

import { setupMirage } from 'ember-cli-mirage/test-support';
import { authenticateAdminMemberWithRole } from '../../../../helpers/test-init';

module('Acceptance | authenticated/certifications/certification/details', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  module('when certification is V2', function () {
    test('renders the V2 details page', async function (assert) {
      // given
      await authenticateAdminMemberWithRole({ isSuperAdmin: true })(server);
      const listChallengesAndAnswers = [
        {
          result: 'ok',
          value: 'Dummy value',
          challengeId: 'recCGEqqWBQnzD3NZ',
          competence: '1.1',
          skill: '',
          isNeutralized: false,
        },
      ];
      const certificationId = this.server.create('certification', { id: 1 }).id;
      this.server.create('certification-detail', {
        id: certificationId,
        competencesWithMark: [],
        status: 'started',
        listChallengesAndAnswers,
        version: 2,
      });

      // when
      const screen = await visit(`/certifications/${certificationId}/details`);

      // then
      assert.dom(screen.getByText('Statut :')).exists();
      assert.dom(screen.getByText('Créé le :')).exists();
      assert.dom(screen.getByText('Terminée le :')).exists();
      assert.dom(screen.getByText('Score :')).exists();
      assert.dom(screen.getByText('Taux de reproductibilité :')).exists();
    });
  });

  module('when certification is V3', function () {
    test('renders the V3 details page', async function (assert) {
      // given
      await authenticateAdminMemberWithRole({ isSuperAdmin: true })(server);
      const certificationId = this.server.create('certification', { id: 2, version: 3 }).id;
      this.server.create('v3-certification-course-details-for-administration', {
        id: certificationId,
        certificationChallengesForAdministration: [],
      });

      // when
      const screen = await visit(`/certifications/${certificationId}/details`);

      // then
      assert.dom(screen.getByRole('heading', { name: 'Informations complémentaires', level: 2 })).exists();
    });
  });

  module('when user does not have access to certification action scope', function () {
    test('does not render save button', async function (assert) {
      // given
      await authenticateAdminMemberWithRole({ isMetier: true })(server);
      const listChallengesAndAnswers = [
        {
          result: 'ok',
          value: 'Dummy value',
          challengeId: 'recCGEqqWBQnzD3NZ',
          competence: '1.1',
          skill: '',
          isNeutralized: false,
        },
      ];
      const certificationId = this.server.create('certification').id;
      this.server.create('certification-detail', {
        id: certificationId,
        competencesWithMark: [],
        status: 'started',
        listChallengesAndAnswers,
      });

      // when
      const screen = await visit(`/certifications/${certificationId}/details`);

      // then
      assert.dom(screen.queryByText('Enregistrer')).doesNotExist();
    });
  });
});
