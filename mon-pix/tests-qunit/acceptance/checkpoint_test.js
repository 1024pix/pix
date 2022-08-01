import { find, findAll, visit } from '@ember/test-helpers';
import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { authenticateByEmail } from '../helpers/authentication';

module('Acceptance | Checkpoint', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  let assessment;

  hooks.beforeEach(function () {
    assessment = server.create('assessment', 'ofCompetenceEvaluationType');
  });

  module('With answers', function (hooks) {
    const NB_ANSWERS = 3;

    hooks.beforeEach(function () {
      for (let i = 0; i < NB_ANSWERS; ++i) {
        const challenge = server.create('challenge', 'forCompetenceEvaluation');
        server.create('answer', {
          value: 'SomeAnswer',
          result: 'ko',
          challenge,
          assessment,
        });
      }
    });

    test('should display questions and links to solutions', async function (assert) {
      // when
      await visit(`/assessments/${assessment.id}/checkpoint`);

      // then
      assert.dom(find('.checkpoint-progression-gauge-wrapper')).exists();
      assert.dom(find('.assessment-results__list')).exists();
      assert.equal(findAll('.result-item').length, NB_ANSWERS);
      assert.dom(find('.checkpoint__continue').textContent).hasText('Continuer');
      assert.dom(find('.checkpoint-no-answer')).doesNotExist();
    });
  });

  module('Without answers', function () {
    test('should display a message indicating that there is no answers to provide', async function (assert) {
      // when
      await visit(`/assessments/${assessment.id}/checkpoint?finalCheckpoint=true`);

      // then
      assert.dom(find('.checkpoint-progression-gauge-wrapper')).doesNotExist();
      assert.dom(find('.assessment-results__list')).doesNotExist();
      assert.dom(find('.checkpoint-no-answer')).exists();

      assert.dom(find('.checkpoint__continue')).exists();
      assert.dom(find('.checkpoint__continue').textContent).hasText('Voir mes résultats');
      assert
        .dom(find('.checkpoint-no-answer__info').textContent)
        .hasText(
          'Vous avez déjà répondu à ces questions lors de vos tests précédents : vous pouvez directement accéder à vos résultats.\n\nVous souhaitez améliorer votre score ? En cliquant sur  “Voir mes résultats”, vous aurez la possibilité de retenter le parcours.'
        );
    });
  });

  module('When user is anonymous', function () {
    test('should not display home link', async function (assert) {
      //given
      const user = server.create('user', 'withEmail', {
        isAnonymous: true,
      });
      await authenticateByEmail(user);

      // when
      await visit(`/assessments/${assessment.id}/checkpoint?finalCheckpoint=true`);

      // then
      assert.dom(find('.assessment-banner__home-link')).doesNotExist();
    });
  });
});
