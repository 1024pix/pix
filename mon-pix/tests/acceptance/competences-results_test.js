import { find, visit } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { authenticate } from '../helpers/authentication';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';

module('Acceptance | competences results', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  let user;
  const competenceId = 10;
  const assessmentId = 10;

  hooks.beforeEach(function () {
    user = server.create('user', 'withEmail');
  });

  module('Authenticated cases as simple user', function (hooks) {
    hooks.beforeEach(async function () {
      await authenticate(user);

      this.server.create('assessment', {
        id: assessmentId,
        type: 'COMPETENCE_EVALUATION',
        state: 'completed',
      });

      // Older competence-evaluation
      const area = this.server.schema.areas.find(3);
      const olderCompetenceScoreCard = this.server.create('scorecard', {
        id: '1_9',
        index: 5.1,
        type: 'COMPETENCE_EVALUATION',
        state: 'completed',
        area,
        earnedPix: 17,
        level: 2,
      });
      const olderCompetence = this.server.create('competence-evaluation', {
        id: 2,
        assessmentId: assessmentId,
        competenceId: 9,
        userId: user.id,
        createdAt: new Date('2020-01-01'),
      });
      olderCompetence.update({ scorecard: olderCompetenceScoreCard });

      this.server.create('competence-evaluation', {
        id: 1,
        assessmentId: assessmentId,
        competenceId: competenceId,
        userId: user.id,
        createdAt: new Date('2020-02-01'),
      });
    });

    test('should display a return link to competences', async function (assert) {
      // when
      await visit(`/competences/${competenceId}/resultats/${assessmentId}`);

      // then
      assert.dom('.pix-return-to').exists();
      assert.strictEqual(find('.pix-return-to').getAttribute('href'), '/competences');
    });

    module('When user obtained 0 pix', function (hooks) {
      hooks.beforeEach(async function () {
        const area = this.server.schema.areas.find(3);

        this.server.create('scorecard', {
          id: '1_10',
          index: 3.3,
          type: 'COMPETENCE_EVALUATION',
          state: 'completed',
          area,
          earnedPix: 0,
          level: 0,
        });
      });

      test('should display the "too bad" banner', async function (assert) {
        // when
        await visit(`/competences/${competenceId}/resultats/${assessmentId}`);

        // then
        assert.dom('.competence-results-panel-header__banner--too-bad').exists();
      });
    });

    module('When user obtained 5 pix (less than level 1)', function (hooks) {
      hooks.beforeEach(async function () {
        const area = this.server.schema.areas.find(3);

        this.server.create('scorecard', {
          id: '1_10',
          index: 3.3,
          type: 'COMPETENCE_EVALUATION',
          state: 'completed',
          area,
          earnedPix: 5,
          level: 0,
        });
      });

      test('should display the "not bad" banner', async function (assert) {
        // when
        await visit(`/competences/${competenceId}/resultats/${assessmentId}`);

        // then
        assert.dom('.competence-results-panel-header__banner--not-bad').exists();
        assert.strictEqual(find('.competence-results-banner-text-results__value').innerText, '5 Pix');
      });
    });

    module('When user obtained 17 pix and level 2', function (hooks) {
      hooks.beforeEach(async function () {
        const area = this.server.schema.areas.find(3);

        this.server.create('scorecard', {
          id: '1_10',
          index: 3.3,
          type: 'COMPETENCE_EVALUATION',
          state: 'completed',
          area,
          earnedPix: 17,
          level: 2,
        });
      });

      test('should display the "congrats" banner', async function (assert) {
        // when
        await visit(`/competences/${competenceId}/resultats/${assessmentId}`);

        // then
        assert.dom('.competence-results-panel-header__banner--congrats').exists();
        assert.strictEqual(
          find('.competence-results-banner-text__results:first-child .competence-results-banner-text-results__value')
            .innerText,
          'Niveau 2'
        );
        assert.strictEqual(
          find('.competence-results-banner-text__results:last-child .competence-results-banner-text-results__value')
            .innerText,
          '17 Pix'
        );
      });
    });
  });
});
