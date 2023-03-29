import EmberObject from '@ember/object';
import { module, test } from 'qunit';
import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';
import { find, render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | comparison-window', function (hooks) {
  setupIntlRenderingTest(hooks);

  module('rendering', function (hooks) {
    let answer;
    let challenge;
    let correction;

    hooks.beforeEach(function () {
      answer = EmberObject.create({
        value: '1,2',
        result: 'ko',
        isResultNotOk: true,
      });
      challenge = EmberObject.create({
        instruction: 'This is the instruction',
        proposals:
          '' + '- 1ere possibilite\n ' + '- 2eme possibilite\n ' + '- 3eme possibilite\n' + '- 4eme possibilite',
      });
      correction = EmberObject.create({ solution: '2,3', learningMoreTutorials: [], tutorials: [] });

      this.set('answer', answer);
      answer.set('challenge', challenge);
      answer.set('correction', correction);
      this.set('closeComparisonWindow', () => {});
    });

    test('should display challenge illustration and alt', async function (assert) {
      // given
      challenge.set('illustrationUrl', '/images/pix-logo.svg');
      challenge.set('illustrationAlt', 'texte alternatif');

      // when
      await render(
        hbs`<ComparisonWindow @answer={{this.answer}} @closeComparisonWindow={{this.closeComparisonWindow}} />`
      );

      // then
      assert.ok(find('.challenge-illustration__loaded-image').src.includes(challenge.illustrationUrl));
      assert.strictEqual(find('.challenge-illustration__loaded-image').alt, challenge.illustrationAlt);
    });

    test('should render challenge instruction', async function (assert) {
      // when
      await render(
        hbs`<ComparisonWindow @answer={{this.answer}} @closeComparisonWindow={{this.closeComparisonWindow}} />`
      );

      // then
      assert.dom('.comparison-window-content-body__instruction').exists();
    });

    test('should render a closed feedback panel', async function (assert) {
      //when
      await render(
        hbs`<ComparisonWindow @answer={{this.answer}} @closeComparisonWindow={{this.closeComparisonWindow}} />`
      );

      //then
      assert.dom('.feedback-panel__form').doesNotExist();
    });

    test('should render a tutorial panel with a hint', async function (assert) {
      // given
      answer.set('result', 'ko');
      correction.set('hint', 'Conseil : mangez des épinards.');

      // when
      await render(
        hbs`<ComparisonWindow @answer={{this.answer}} @closeComparisonWindow={{this.closeComparisonWindow}} />`
      );

      // then
      assert.dom('.tutorial-panel__hint-title').hasText('Pour réussir la prochaine fois');
      assert.dom('.tutorial-panel__hint-content').hasText('Conseil : mangez des épinards.');
    });

    test('should render a learningMoreTutorials panel when correction has a list of LearningMoreTutorials elements', async function (assert) {
      // given
      correction.setProperties({
        learningMoreTutorials: [{ titre: 'Ceci est un tuto', duration: '20:00:00', type: 'video' }],
      });

      // when
      await render(
        hbs`<ComparisonWindow @answer={{this.answer}} @closeComparisonWindow={{this.closeComparisonWindow}} />`
      );

      // then
      assert.dom('.learning-more-panel__container').exists();
    });

    module('when the answer is OK', function () {
      test('should neither display “Bientot ici des tutos“ nor hints nor any tutorials', async function (assert) {
        // given
        answer.setProperties({
          result: 'ok',
          isResultNotOk: false,
        });

        // when
        await render(
          hbs`<ComparisonWindow @answer={{this.answer}} @closeComparisonWindow={{this.closeComparisonWindow}} />`
        );

        // then
        assert.dom('.tutorial-panel').doesNotExist();
        assert.dom('.learning-more-panel__container').doesNotExist();
        assert.dom('.comparison-window__default-message-container').doesNotExist();
      });
    });

    module('the correction has no hints nor tutorials at all', function () {
      test('should render “Bientot des tutos”', async function (assert) {
        // given
        correction.setProperties({
          solution: '2,3',
          noHintsNorTutorialsAtAll: true,
        });

        // when
        await render(
          hbs`<ComparisonWindow @answer={{this.answer}} @closeComparisonWindow={{this.closeComparisonWindow}} />`
        );

        // then
        assert.dom('.comparison-windows-content-body-default-message-container__default-message-title').exists();
      });
    });

    module('when the correction has a hint or a tutorial or a learninMoreTutorial', function () {
      test('should not render a hint or a tutorial', async function (assert) {
        // given
        correction.setProperties({
          learningMoreTutorials: [{ titre: 'Ceci est un tuto', duration: '20:00:00', type: 'video' }],
        });

        // when
        await render(
          hbs`<ComparisonWindow @answer={{this.answer}} @closeComparisonWindow={{this.closeComparisonWindow}} />`
        );

        // then
        assert.dom('.tutorial-panel').exists();
        assert.dom('.tutorial-panel__hint-container').doesNotExist();
        assert.dom('.tutorial-panel__tutorial-item').doesNotExist();
      });
    });

    module('solution rendering', function () {
      test('should not render corrected answers when challenge has no type', async function (assert) {
        // when
        await render(
          hbs`<ComparisonWindow @answer={{this.answer}} @closeComparisonWindow={{this.closeComparisonWindow}} />`
        );
        // then
        assert.dom('div[data-test-id="comparison-window__corrected-answers--qroc"]').doesNotExist();
      });

      module('when challenge type is QROC', function () {
        module('and challenge is not autoReply', function () {
          test('should display answers', async function (assert) {
            // given
            challenge = EmberObject.create({ type: 'QROC', autoReply: false });
            answer.set('challenge', challenge);

            // when
            await render(
              hbs`<ComparisonWindow @answer={{this.answer}} @closeComparisonWindow={{this.closeComparisonWindow}} />`
            );

            // then
            assert.dom('div[data-test-id="comparison-window__corrected-answers--qroc"]').exists();
          });
        });

        module('and challenge is autoReply', function () {
          test('should hide answers when correction has no solutionToDisplay', async function (assert) {
            // given
            challenge = EmberObject.create({ type: 'QROC', autoReply: true });
            answer.set('challenge', challenge);

            // when
            await render(
              hbs`<ComparisonWindow @answer={{this.answer}} @closeComparisonWindow={{this.closeComparisonWindow}} />`
            );

            // then
            assert.dom('.correction-qroc-box__answer').doesNotExist();
          });

          test('should display answers when correction has solutionToDisplay', async function (assert) {
            // given
            challenge = EmberObject.create({ type: 'QROC', autoReply: true });
            correction = EmberObject.create({ solution: 'solution', solutionToDisplay: 'solutionToDisplay' });
            answer.set('challenge', challenge);
            answer.set('correction', correction);

            // when
            await render(
              hbs`<ComparisonWindow @answer={{this.answer}} @closeComparisonWindow={{this.closeComparisonWindow}} />`
            );

            // then
            assert.dom('div[data-test-id="comparison-window__corrected-answers--qroc"]').exists();
          });
        });
      });

      test('should render corrected answers when challenge type is QROCM-ind', async function (assert) {
        // given
        challenge = EmberObject.create({ type: 'QROCM-ind', proposals: '' });
        correction.set('solution', '');
        answer.set('challenge', challenge);
        // when
        await render(
          hbs`<ComparisonWindow @answer={{this.answer}} @closeComparisonWindow={{this.closeComparisonWindow}} />`
        );
        // then
        assert.dom('div[data-test-id="comparison-window__corrected-answers--qrocm"]').exists();
      });

      test('should render corrected answers when challenge type is QCM', async function (assert) {
        // given
        challenge = EmberObject.create({ type: 'QCM' });
        answer.set('challenge', challenge);
        // when
        await render(
          hbs`<ComparisonWindow @answer={{this.answer}} @closeComparisonWindow={{this.closeComparisonWindow}} />`
        );
        // then
        assert.dom('.qcm-solution-panel').exists();
      });
    });
  });
});
