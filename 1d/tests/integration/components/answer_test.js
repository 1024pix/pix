import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@1024pix/ember-testing-library';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | answer', function (hooks) {
  setupRenderingTest(hooks);

  test('displays kudos when the answer is correct', async function (assert) {
    // given & when
    this.set('answer', {
      result: 'ok',
    });
    const screen = await render(hbs`<AnswerFeedback @answer={{this.answer}} @answerHasBeenValidated={{true}} />`);

    // then
    assert.dom(screen.getByText("Bravo ! C'est la bonne réponse.")).exists();
  });

  test('displays try later when the challenge is skipped', async function (assert) {
    // given & when
    this.set('answer', {
      result: 'aband',
    });
    const screen = await render(hbs`<AnswerFeedback @answer={{this.answer}} @answerHasBeenValidated={{true}} />`);

    // then
    assert.dom(screen.getByText('Si tu passes l’activité, une autre activité plus simple te sera proposée.')).exists();
  });

  test('displays bad response when the answer is not correct', async function (assert) {
    // given & when
    this.set('answer', {
      result: 'ko',
    });
    const screen = await render(hbs`<AnswerFeedback @answer={{this.answer}} @answerHasBeenValidated={{true}} />`);

    // then
    assert.dom(screen.getByText('Mauvaise réponse. Tu peux passer à la suite.')).exists();
  });
});
