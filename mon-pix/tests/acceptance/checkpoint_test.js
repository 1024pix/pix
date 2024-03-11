import { visit } from '@1024pix/ember-testing-library';
// eslint-disable-next-line no-restricted-imports
import { find } from '@ember/test-helpers';
import { setupMirage } from 'ember-cli-mirage/test-support';
import { setupApplicationTest } from 'ember-qunit';
import { module, test } from 'qunit';

import { authenticate } from '../helpers/authentication';

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
      assert.strictEqual(find('.checkpoint__progression-gauge progress').textContent.trim(), '100%');
      assert.dom('.assessment-results__list').exists();
      assert.dom('.result-item').exists({ count: NB_ANSWERS });
      assert.strictEqual(find('.checkpoint__continue').textContent.trim(), 'Continuer');
      assert.dom('.checkpoint-no-answer').doesNotExist();
    });
  });

  module('Without answers', function () {
    test('should display a message indicating that there is no answers to provide', async function (assert) {
      // when
      await visit(`/assessments/${assessment.id}/checkpoint?finalCheckpoint=true`);

      // then
      assert.dom('.checkpoint__progression-gauge').doesNotExist();
      assert.dom('.assessment-results__list').doesNotExist();
      assert.dom('.checkpoint-no-answer').exists();

      assert.dom('.checkpoint__continue').exists();
      assert.ok(find('.checkpoint__continue').textContent.includes('Voir mes résultats'));
      assert.ok(
        find('.checkpoint-no-answer__info').textContent.includes(
          'Vous avez déjà répondu à ces questions lors de vos tests précédents : vous pouvez directement accéder à vos résultats.\n\nVous souhaitez améliorer votre score ? En cliquant sur  “Voir mes résultats”, vous aurez la possibilité de retenter le parcours.',
        ),
      );
    });
  });

  module('When user is anonymous', function () {
    test('should not display home link', async function (assert) {
      //given
      const user = server.create('user', 'withEmail', {
        isAnonymous: true,
      });
      await authenticate(user);

      // when
      await visit(`/assessments/${assessment.id}/checkpoint?finalCheckpoint=true`);

      // then
      assert.dom('.assessment-banner__home-link').doesNotExist();
    });
  });
});
