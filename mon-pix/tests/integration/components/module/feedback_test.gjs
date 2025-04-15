import { render } from '@1024pix/ember-testing-library';
import { setupRenderingTest } from 'ember-qunit';
import ModulixFeedback from 'mon-pix/components/module/feedback';
import { module, test } from 'qunit';

module('Integration | Component | Module | Feedback', function (hooks) {
  setupRenderingTest(hooks);
  test('should display feedback information', async function (assert) {
    // given
    const feedback = {
      state: 'Correct !',
      diagnosis: "<p>C'est la bonne réponse !</p>",
    };

    // when
    const screen = await render(
      <template><ModulixFeedback @answerIsValid={{true}} @feedback={{feedback}} /></template>,
    );

    // then
    assert.dom(screen.getByText('Correct !')).exists();
    assert.dom(screen.getByText("C'est la bonne réponse !")).exists();
  });

  test('should not display a span when "feedback.state" does not exist', async function (assert) {
    // given
    const feedback = {
      diagnosis: "<p>C'est la bonne réponse !</p>",
    };

    // when
    const screen = await render(
      <template><ModulixFeedback @answerIsValid={{true}} @feedback={{feedback}} /></template>,
    );

    // then
    assert.dom(screen.getByText("C'est la bonne réponse !")).exists();
  });
});
