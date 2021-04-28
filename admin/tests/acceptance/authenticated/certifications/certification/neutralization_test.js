import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import { visit } from '@ember/test-helpers';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import clickByLabel from '../../../../helpers/extended-ember-test-helpers/click-by-label';

import { createAuthenticateSession } from 'pix-admin/tests/helpers/test-init';

module('Acceptance | Route | routes/authenticated/certifications/certification | neutralization', function(hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  hooks.beforeEach(async function() {
    const user = server.create('user');
    await createAuthenticateSession({ userId: user.id });
  });

  module('when there is no challenge for this certification', function() {

    test('it renders "Aucune épreuve posée"', async function(assert) {
      // given
      this.server.create('feature-toggle', { isNeutralizationAutoEnabled: true });
      const certificationId = this.server.create('certification').id;
      this.server.create('certification-detail', {
        id: certificationId,
        competencesWithMark: [],
        status: 'started',
        listChallengesAndAnswers: [],
      });

      // when
      await visit(`/certifications/${certificationId}/neutralization`);

      // then
      assert.contains('Aucune épreuve posée.');
    });
  });

  module('when there are challenges for this certification', function() {

    module('it renders a challenge list', function() {

      test('it renders as many rows as there are challenges', async function(assert) {
        // given
        const listChallengesAndAnswers = [{
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
        }];

        const competencesWithMark = [
          {
            'area_code': '1',
            'index': '1.1',
          },
          {
            'area_code': '1',
            'index': '1.2',
          },
        ];

        this.server.create('feature-toggle', { isNeutralizationAutoEnabled: true });
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
        assert.contains('recCGEqqWBQnzD3NZ');
        assert.contains('recABCEdeef1234');
      });

      test('it renders the challenge info', async function(assert) {
        // given
        const listChallengesAndAnswers = [{
          result: 'ok',
          value: 'Dummy value',
          challengeId: 'recCGEqqWBQnzD3NZ',
          competence: '1.1',
          skill: '',
        }];

        this.server.create('feature-toggle', { isNeutralizationAutoEnabled: true });
        const certificationId = this.server.create('certification').id;
        this.server.create('certification-detail', {
          id: certificationId,
          competencesWithMark: [],
          status: 'started',
          listChallengesAndAnswers,
        });

        // when
        await visit(`/certifications/${certificationId}/neutralization`);

        // then
        assert.contains('1');
        assert.contains('recCGEqqWBQnzD3NZ');
      });

      test('it renders a "Neutraliser" button when challenge is not neutralized', async function(assert) {
        // given
        const listChallengesAndAnswers = [{
          result: 'ok',
          value: 'Dummy value',
          challengeId: 'recCGEqqWBQnzD3NZ',
          competence: '1.1',
          skill: '',
          isNeutralized: false,
        }];

        this.server.create('feature-toggle', { isNeutralizationAutoEnabled: true });
        const certificationId = this.server.create('certification').id;
        this.server.create('certification-detail', {
          id: certificationId,
          competencesWithMark: [],
          status: 'started',
          listChallengesAndAnswers,
        });

        // when
        await visit(`/certifications/${certificationId}/neutralization`);

        // then
        assert.contains('Neutraliser');
      });

      test('it renders a "Dé-neutraliser" button when challenge is neutralized', async function(assert) {
        // given
        const listChallengesAndAnswers = [{
          result: 'ok',
          value: 'Dummy value',
          challengeId: 'recCGEqqWBQnzD3NZ',
          competence: '1.1',
          skill: '',
          isNeutralized: true,
        }];

        this.server.create('feature-toggle', { isNeutralizationAutoEnabled: true });
        const certificationId = this.server.create('certification').id;
        this.server.create('certification-detail', {
          id: certificationId,
          competencesWithMark: [],
          status: 'started',
          listChallengesAndAnswers,
        });

        // when
        await visit(`/certifications/${certificationId}/neutralization`);

        // then
        assert.contains('Dé-neutraliser');
      });

      test('it toggles the "Dé-neutraliser" button into a "Neutraliser" button when deneutralizing a neutralized challenge', async function(assert) {
        // given
        const listChallengesAndAnswers = [{
          result: 'ok',
          value: 'Dummy value',
          challengeId: 'recCGEqqWBQnzD3NZ',
          competence: '1.1',
          skill: '',
          isNeutralized: true,
        }];

        this.server.create('feature-toggle', { isNeutralizationAutoEnabled: true });
        const certificationId = this.server.create('certification').id;
        this.server.create('certification-detail', {
          id: certificationId,
          competencesWithMark: [],
          status: 'started',
          listChallengesAndAnswers,
        });
        await visit(`/certifications/${certificationId}/neutralization`);

        // when
        await clickByLabel('Dé-neutraliser');

        // then
        assert.contains('Neutraliser');
      });

      test('it toggles the "Neutraliser" button into a "Dé-neutraliser" button when neutralizing a deneutralized challenge', async function(assert) {
        // given
        const listChallengesAndAnswers = [{
          result: 'ok',
          value: 'Dummy value',
          challengeId: 'recCGEqqWBQnzD3NZ',
          competence: '1.1',
          skill: '',
          isNeutralized: false,
        }];

        this.server.create('feature-toggle', { isNeutralizationAutoEnabled: true });
        const certificationId = this.server.create('certification').id;
        this.server.create('certification-detail', {
          id: certificationId,
          competencesWithMark: [],
          status: 'started',
          listChallengesAndAnswers,
        });
        await visit(`/certifications/${certificationId}/neutralization`);

        // when
        await clickByLabel('Neutraliser');

        // then
        assert.contains('Dé-neutraliser');
      });
    });

    test('it sort challenges by order property', async function(assert) {
      // given
      const listChallengesAndAnswers = [{
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
      }];

      const competencesWithMark = [
        {
          'area_code': '1',
          'index': '1.1',
        },
        {
          'area_code': '1',
          'index': '1.2',
        },
      ];

      this.server.create('feature-toggle', { isNeutralizationAutoEnabled: true });
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
      assert.equal(firstRowContent, 'recCGEqqWBQnzD3NZ');
      assert.equal(secondRowContent, 'recABCEdeef1234');
      assert.equal(thirdRowContent, 'recZXYW4321');
    });
  });
});
