import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import { visit } from '@1024pix/ember-testing-library';

import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { authenticateAdminMemberWithRole } from '../../../../helpers/test-init';

module('Acceptance | authenticated/certifications/certification/details', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  module('when user does not have access to certification action scope', function () {
    test('it does not render save button', async function (assert) {
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
