import EmberObject from '@ember/object';
import { module, test } from 'qunit';
import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';
import { find, render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | result-item', function (hooks) {
  setupIntlRenderingTest(hooks);

  module('Component rendering', function (hooks) {
    const providedChallengeInstruction =
      "Un QCM propose plusieurs choix, l'utilisateur peut en choisir [plusieurs](http://link.plusieurs.url)";

    const emberChallengeObject = EmberObject.create({
      type: 'QCM',
      instruction: providedChallengeInstruction,
      proposals:
        '- soit possibilite A, et/ou' +
        '\n - soit possibilite B, et/ou' +
        '\n - soit possibilite C, et/ou' +
        '\n - soit possibilite D',
    });

    const answer = EmberObject.create({
      value: '2,4',
      result: 'ko',
      id: 1,
      challenge: emberChallengeObject,
      assessment: {
        id: 4,
      },
    });

    hooks.beforeEach(function () {
      this.set('index', 0);
      return this.set('openComparisonWindow', () => {});
    });

    test('should exist', async function (assert) {
      // given
      this.set('answer', '');

      // when
      await render(hbs`<ResultItem @answer={{this.answer}} />`);

      // then
      assert.dom('.result-item').exists();
    });

    test('should render the challenge instruction', async function (assert) {
      // given
      this.set('answer', answer);

      // when
      await render(hbs`<ResultItem @answer={{this.answer}} @openAnswerDetails={{this.openComparisonWindow}}/>`);

      // then
      const expectedChallengeInstruction = "Un QCM propose plusieurs choix, l'utilisateur peut en choisir plusieurs";

      assert.strictEqual(find('.result-item__instruction').textContent.trim(), expectedChallengeInstruction);
    });

    test('should render a button when QCM', async function (assert) {
      // given
      this.set('answer', answer);

      await render(hbs`<ResultItem @answer={{this.answer}} @openAnswerDetails={{this.openComparisonWindow}}/>`);
      // Then
      assert.deepEqual(find('.result-item__correction-button').textContent.trim(), 'Réponses et tutos');
    });

    test('should render a tooltip with an image', async function (assert) {
      // given
      this.set('answer', answer);

      // when
      await render(hbs`<ResultItem @answer={{this.answer}} @openAnswerDetails={{this.openComparisonWindow}}/>`);

      // Then
      assert.ok(find('.result-item__icon--red'));
    });

    [
      { status: 'ok', color: 'green' },
      { status: 'ko', color: 'red' },
      { status: 'aband', color: 'grey' },
      { status: 'partially', color: 'orange' },
      { status: 'timedout', color: 'red' },
    ].forEach(function (data) {
      test(`should display a relevant result icon when the result of the answer is "${data.status}"`, async function (assert) {
        // given
        answer.set('result', data.status);
        this.set('answer', answer);

        // when
        await render(hbs`<ResultItem @answer={{this.answer}} @openAnswerDetails={{this.openComparisonWindow}}/>`);

        // then
        assert.dom(`.result-item__icon--${data.color}`).exists();
      });
    });
  });
});
