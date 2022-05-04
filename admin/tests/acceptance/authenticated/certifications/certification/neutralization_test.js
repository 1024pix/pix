import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { clickByName, visit } from '@1024pix/ember-testing-library';
import { authenticateAdminMemberWithRole } from '../../../../helpers/test-init';

module('Acceptance | Route | routes/authenticated/certifications/certification | neutralization', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function () {
    await authenticateAdminMemberWithRole({ role: 'SUPER_ADMIN' })(server);
  });

  module('when there is no challenge for this certification', function () {
    test('it renders "Aucune épreuve posée"', async function (assert) {
      // given
      const certificationId = this.server.create('certification').id;
      this.server.create('certification-detail', {
        id: certificationId,
        competencesWithMark: [],
        status: 'started',
        listChallengesAndAnswers: [],
      });

      // when
      const screen = await visit(`/certifications/${certificationId}/neutralization`);

      // then
      assert.dom(screen.getByText('Aucune épreuve posée.')).exists();
    });
  });

  module('when there are challenges for this certification', function () {
    module('it renders a challenge list', function () {
      test('it renders as many rows as there are challenges', async function (assert) {
        // given
        const listChallengesAndAnswers = [
          {
            result: 'ok',
            value: 'Dummy value',
            challengeId: 'recCGEqqWBQnzD3NZ',
            competence: '1.1',
            skill: '',
          },
          {
            result: 'ok',
            value: 'Dummy value',
            challengeId: 'recABCEdeef1234',
            competence: '1.2',
            skill: '',
          },
        ];

        const competencesWithMark = [
          {
            area_code: '1',
            index: '1.1',
          },
          {
            area_code: '1',
            index: '1.2',
          },
        ];

        const certificationId = this.server.create('certification').id;
        this.server.create('certification-detail', {
          id: certificationId,
          competencesWithMark,
          status: 'started',
          listChallengesAndAnswers,
        });

        // when
        const screen = await visit(`/certifications/${certificationId}/neutralization`);

        // then
        assert.dom(screen.getByText('recCGEqqWBQnzD3NZ')).exists();
        assert.dom(screen.getByText('recABCEdeef1234')).exists();
      });

      test('it renders the challenge info', async function (assert) {
        // given
        const listChallengesAndAnswers = [
          {
            result: 'ok',
            value: 'Dummy value',
            challengeId: 'recCGEqqWBQnzD3NZ',
            competence: '1.1',
            skill: '',
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
        const screen = await visit(`/certifications/${certificationId}/neutralization`);

        // then
        assert.dom(screen.getByText('1')).exists();
        assert.dom(screen.getByText('recCGEqqWBQnzD3NZ')).exists();
      });

      test('it renders a "Neutraliser" button when challenge is not neutralized', async function (assert) {
        // given
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
        const screen = await visit(`/certifications/${certificationId}/neutralization`);

        // then
        assert.dom(screen.getByRole('button', { name: 'Neutraliser' })).exists();
      });

      test('it renders a "Dé-neutraliser" button when challenge is neutralized', async function (assert) {
        // given
        const listChallengesAndAnswers = [
          {
            result: 'ok',
            value: 'Dummy value',
            challengeId: 'recCGEqqWBQnzD3NZ',
            competence: '1.1',
            skill: '',
            isNeutralized: true,
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
        const screen = await visit(`/certifications/${certificationId}/neutralization`);

        // then
        assert.dom(screen.getByRole('button', { name: 'Dé-neutraliser' })).exists();
      });

      test('it toggles the "Dé-neutraliser" button into a "Neutraliser" button when deneutralizing a neutralized challenge', async function (assert) {
        // given
        const listChallengesAndAnswers = [
          {
            result: 'ok',
            value: 'Dummy value',
            challengeId: 'recCGEqqWBQnzD3NZ',
            competence: '1.1',
            skill: '',
            isNeutralized: true,
          },
        ];

        const certificationId = this.server.create('certification').id;
        this.server.create('certification-detail', {
          id: certificationId,
          competencesWithMark: [],
          status: 'started',
          listChallengesAndAnswers,
        });
        const screen = await visit(`/certifications/${certificationId}/neutralization`);

        // when
        await clickByName('Dé-neutraliser');

        // then
        assert.dom(screen.getByRole('button', { name: 'Neutraliser' })).exists();
      });

      test('it toggles the "Neutraliser" button into a "Dé-neutraliser" button when neutralizing a deneutralized challenge', async function (assert) {
        // given
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
        const screen = await visit(`/certifications/${certificationId}/neutralization`);

        // when
        await clickByName('Neutraliser');

        // then
        assert.dom(screen.getByRole('button', { name: 'Dé-neutraliser' })).exists();
      });
    });

    test('it sort challenges by order property', async function (assert) {
      // given
      const listChallengesAndAnswers = [
        {
          result: 'ok',
          value: 'Dummy value',
          challengeId: 'recCGEqqWBQnzD3NZ',
          competence: '1.1',
          skill: '',
        },
        {
          result: 'ok',
          value: 'Dummy value',
          challengeId: 'recABCEdeef1234',
          competence: '1.2',
          skill: '',
        },
        {
          result: 'ok',
          value: 'Dummy value',
          challengeId: 'recZXYW4321',
          competence: '1.1',
          skill: '',
        },
      ];

      const competencesWithMark = [
        {
          area_code: '1',
          index: '1.1',
        },
        {
          area_code: '1',
          index: '1.2',
        },
      ];

      const certificationId = this.server.create('certification').id;
      this.server.create('certification-detail', {
        id: certificationId,
        competencesWithMark,
        status: 'started',
        listChallengesAndAnswers,
      });

      // when
      await visit(`/certifications/${certificationId}/neutralization`);

      // then
      const firstRowContent = document.querySelector('tr:nth-child(1) td:nth-child(2)').innerText;
      const secondRowContent = document.querySelector('tr:nth-child(2) td:nth-child(2)').innerText;
      const thirdRowContent = document.querySelector('tr:nth-child(3) td:nth-child(2)').innerText;
      assert.strictEqual(firstRowContent, 'recCGEqqWBQnzD3NZ');
      assert.strictEqual(secondRowContent, 'recABCEdeef1234');
      assert.strictEqual(thirdRowContent, 'recZXYW4321');
    });
  });
});
