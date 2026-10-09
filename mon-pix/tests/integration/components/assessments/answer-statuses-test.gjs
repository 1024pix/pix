import { render } from '@1024pix/ember-testing-library';
import EmberObject from '@ember/object';
import { t } from 'ember-intl/test-support';
import AnswerStatuses from 'mon-pix/components/assessments/answer-statuses';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | Assessments | answer-statuses', function (hooks) {
  setupIntlRenderingTest(hooks);

  hooks.beforeEach(function () {
    this.owner.lookup('service:router');
  });

  module('when answers should be displayed', function () {
    test('should display the answers header', async function (assert) {
      // given
      const answers = [];

      // when
      const screen = await render(
        <template>
          <AnswerStatuses
            @shouldDisplayAnswers={{true}}
            @answers={{answers}}
            @assessmentId={{1}}
            @nextPageButtonText="Continuer"
          />
        </template>,
      );

      // then
      assert.dom(screen.getByRole('heading', { name: t('pages.checkpoint.answers.header'), level: 2 })).exists();
      assert
        .dom(screen.queryByText(t('pages.checkpoint.answers.already-finished.explanation.sentence1')))
        .doesNotExist();
      assert
        .dom(screen.queryByText(t('pages.checkpoint.answers.already-finished.explanation.sentence2')))
        .doesNotExist();
    });

    test('should display a result item per answer', async function (assert) {
      // given
      const answers = [
        EmberObject.create({
          id: 'answer-1',
          result: 'ok',
          challenge: EmberObject.create({ type: 'QCM', instruction: 'Première question' }),
        }),
        EmberObject.create({
          id: 'answer-2',
          result: 'ko',
          challenge: EmberObject.create({ type: 'QROC', instruction: 'Deuxième question' }),
        }),
      ];

      // when
      const screen = await render(
        <template>
          <AnswerStatuses
            @shouldDisplayAnswers={{true}}
            @answers={{answers}}
            @assessmentId={{1}}
            @nextPageButtonText="Continuer"
          />
        </template>,
      );

      // then
      const titles = screen.getAllByRole('heading', { level: 3 });
      assert.strictEqual(titles.length, 2);
      assert.dom(titles[0]).includesText('Question 1');
      assert.dom(titles[1]).includesText('Question 2');
      assert.dom(screen.getByText('Première question')).exists();
      assert.dom(screen.getByText('Deuxième question')).exists();
      assert.strictEqual(
        screen.getAllByRole('button', { name: t('pages.result-item.actions.see-answers-and-tutorials.label') }).length,
        2,
      );
    });

    test('should call openAnswerDetails with the clicked answer', async function (assert) {
      // given
      const answer = EmberObject.create({
        id: 'answer-1',
        result: 'ok',
        challenge: EmberObject.create({ type: 'QCM', instruction: 'Première question' }),
      });
      const answers = [answer];
      let openedAnswer = null;
      const openAnswerDetails = (clickedAnswer) => {
        openedAnswer = clickedAnswer;
      };

      const screen = await render(
        <template>
          <AnswerStatuses
            @shouldDisplayAnswers={{true}}
            @answers={{answers}}
            @openAnswerDetails={{openAnswerDetails}}
            @assessmentId={{1}}
            @nextPageButtonText="Continuer"
          />
        </template>,
      );

      // when
      await screen
        .getByRole('button', { name: t('pages.result-item.actions.see-answers-and-tutorials.label') })
        .click();

      // then
      assert.strictEqual(openedAnswer, answer);
    });
  });

  module('when answers should not be displayed', function () {
    test('should display the already finished message instead of the answers', async function (assert) {
      // given
      const answers = [
        EmberObject.create({
          id: 'answer-1',
          result: 'ok',
          challenge: EmberObject.create({ type: 'QCM', instruction: 'Première question' }),
        }),
      ];

      // when
      const screen = await render(
        <template>
          <AnswerStatuses
            @shouldDisplayAnswers={{false}}
            @answers={{answers}}
            @assessmentId={{1}}
            @nextPageButtonText="Voir mes résultats"
          />
        </template>,
      );

      // then
      assert
        .dom(screen.getByRole('heading', { name: t('pages.checkpoint.answers.already-finished.info'), level: 2 }))
        .exists();
      assert.dom(screen.queryByText(t('pages.checkpoint.answers.already-finished.explanation.sentence1'))).exists();
      assert.dom(screen.queryByText(t('pages.checkpoint.answers.already-finished.explanation.sentence2'))).exists();
      assert.dom(screen.queryByText('Première question')).doesNotExist();
    });
  });

  test('should display the continue link to resume the assessment', async function (assert) {
    // given
    const answers = [];

    // when
    const screen = await render(
      <template>
        <AnswerStatuses
          @shouldDisplayAnswers={{true}}
          @answers={{answers}}
          @assessmentId={{1}}
          @nextPageButtonText="Voir mes résultats"
        />
      </template>,
    );

    // then
    assert
      .dom(screen.getByRole('link', { name: 'Voir mes résultats' }))
      .hasAttribute('href', '/assessments/1/resume?hasSeenCheckpoint=true');
  });
});
