import { clickByName, visit, within } from '@1024pix/ember-testing-library';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'pix-admin/tests/test-support/setup-mirage';
import { module, test } from 'qunit';

import setupIntl from '../../../../helpers/setup-intl';
import { authenticateAdminMemberWithRole } from '../../../../helpers/test-init';

module('Acceptance | Route | routes/authenticated/sessions/certification | neutralization', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks);

  module('when there is no challenge for this certification', function () {
    test('it renders "Aucune épreuve posée"', async function (assert) {
      // given
      await authenticateAdminMemberWithRole({ isSuperAdmin: true })(server);
      const certificationId = this.server.create('certification').id;
      this.server.create('certification-detail', {
        id: certificationId,
        competencesWithMark: [],
        status: 'started',
        listChallengesAndAnswers: [],
      });

      // when
      const screen = await visit(`/sessions/certification/${certificationId}/neutralization`);

      // then
      assert.dom(screen.getByText('Aucune épreuve posée.')).exists();
    });
  });

  module('when there are challenges for this certification', function () {
    module('it renders a challenge list', function () {
      test('it renders as many rows as there are challenges', async function (assert) {
        // given
        await authenticateAdminMemberWithRole({ isSuperAdmin: true })(server);
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
        const screen = await visit(`/sessions/certification/${certificationId}/neutralization`);

        // then
        assert.dom(screen.getByText('recCGEqqWBQnzD3NZ')).exists();
        assert.dom(screen.getByText('recABCEdeef1234')).exists();
      });

      test('it renders the challenge info', async function (assert) {
        // given
        await authenticateAdminMemberWithRole({ isSuperAdmin: true })(server);
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
        const screen = await visit(`/sessions/certification/${certificationId}/neutralization`);

        // then
        assert.dom(screen.getByText('1')).exists();
        assert.dom(screen.getByText('recCGEqqWBQnzD3NZ')).exists();
      });

      module('when user has access to certification action scope', function () {
        module('when challenge is not neutralized', function () {
          test('it renders a "Neutraliser" button', async function (assert) {
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

            const certificationId = this.server.create('certification').id;
            this.server.create('certification-detail', {
              id: certificationId,
              competencesWithMark: [],
              status: 'started',
              listChallengesAndAnswers,
            });

            // when
            const screen = await visit(`/sessions/certification/${certificationId}/neutralization`);

            // then
            assert.dom(screen.getByRole('button', { name: 'Neutraliser' })).exists();
          });
        });

        module('when challenge is neutralized', function () {
          test('it renders a "Dé-neutraliser" button', async function (assert) {
            // given
            await authenticateAdminMemberWithRole({ isSuperAdmin: true })(server);
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
            const screen = await visit(`/sessions/certification/${certificationId}/neutralization`);

            // then
            assert.dom(screen.getByRole('button', { name: 'Dé-neutraliser' })).exists();
          });
        });

        module('when deneutralizing a neutralized challenge', function () {
          test('it toggles the "Dé-neutraliser" button into a "Neutraliser" button', async function (assert) {
            // given
            await authenticateAdminMemberWithRole({ isSuperAdmin: true })(server);
            const listChallengesAndAnswers = [
              {
                result: 'ok',
                value: 'Dummy value',
                challengeId: 'recCGEqqWBQnzD3NZ',
                competence: '1.1',
                skill: '',
                isNeutralized: true,
              },
              {
                result: 'ok',
                value: 'Dummy value',
                challengeId: 'recABCDEF123456',
                competence: '1.2',
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
            const screen = await visit(`/sessions/certification/${certificationId}/neutralization`);

            // when
            await clickByName('Dé-neutraliser');

            // then
            assert.dom(await screen.queryByRole('button', { name: 'Dé-neutraliser' })).doesNotExist();
            assert.strictEqual((await screen.findAllByRole('button', { name: 'Neutraliser' })).length, 2);
          });
        });

        module('when neutralizing a deneutralized challenge', function () {
          test('it toggles the "Neutraliser" button into a "Dé-neutraliser" button', async function (assert) {
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
              {
                result: 'ok',
                value: 'Dummy value',
                challengeId: 'recABCDEF123456',
                competence: '1.2',
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
            const screen = await visit(`/sessions/certification/${certificationId}/neutralization`);

            // when
            await clickByName('Neutraliser');

            // then
            assert.dom(await screen.queryByRole('button', { name: 'Neutraliser' })).doesNotExist();
            assert.strictEqual((await screen.findAllByRole('button', { name: 'Dé-neutraliser' })).length, 2);
          });
        });
      });

      module('when user does not have access to certification action scope', function () {
        test('it does not render action column', async function (assert) {
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
          const screen = await visit(`/sessions/certification/${certificationId}/neutralization`);

          // then
          assert.dom(screen.queryByText('Action')).doesNotExist();
          assert.dom(screen.queryByText('Neutraliser')).doesNotExist();
        });
      });
    });

    test('it sort challenges by order property', async function (assert) {
      // given
      await authenticateAdminMemberWithRole({ isSuperAdmin: true })(server);
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
      const session = this.server.create('session', { id: 1 });
      const certificationId = this.server.create('certification', { sessionId: session.id }).id;
      this.server.create('certification-detail', {
        id: certificationId,
        competencesWithMark,
        status: 'started',
        listChallengesAndAnswers,
      });

      // when
      const screen = await visit(`/sessions/certification/${certificationId}/neutralization`);

      // then
      const [, row1, row2, row3] = screen.getAllByRole('row');
      assert.dom(within(row1).getByText('recCGEqqWBQnzD3NZ')).exists();
      assert.dom(within(row2).getByText('recABCEdeef1234')).exists();
      assert.dom(within(row3).getByText('recZXYW4321')).exists();
    });
  });
});
