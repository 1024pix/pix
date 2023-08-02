import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@1024pix/ember-testing-library';
import { hbs } from 'ember-cli-htmlbars';
import sinon from 'sinon';
import { click } from '@ember/test-helpers';

module('Integration | Component | ChallengeInstruction', (hooks) => {
  setupRenderingTest(hooks);

  module('oralization', function () {
    test('should call the method speechSynthesis', async function (assert) {
      this.set('instruction', 'Trouve les drapeaux');
      const screen = await render(hbs`<Challenge::ChallengeInstruction @instruction={{this.instruction}} />`);

      await click(screen.getByLabelText('Lire la consigne à haute voix'));

      sinon.mock(window.speechSynthesis.speak).once;
      assert.ok(true);
    });
  });
});
