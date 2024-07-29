import { render } from '@1024pix/ember-testing-library';
import { hbs } from 'ember-cli-htmlbars';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | QCU proposals', function (hooks) {
  setupIntlRenderingTest(hooks);

  /* Rendering
   ----------------------------------------------------- */

  module('Rendering', function (hooks) {
    let proposals;
    let answers;
    let answerChangedHandler;

    hooks.beforeEach(function () {
      proposals = '- prop 1\n- prop 2\n- prop 3';
      answers = [false, true, false];
      answerChangedHandler = () => true;
    });

    // Inspired from:
    // - Ember-mocha: https://github.com/emberjs/ember-mocha#setup-component-tests
    // - Ember: https://guides.emberjs.com/v2.10.0/testing/testing-components
    // -        https://guides.emberjs.com/v2.10.0/tutorial/autocomplete-component/
    test('should render as much radio buttons as proposals', async function (assert) {
      // given
      this.set('proposals', proposals);
      this.set('answers', answers);
      this.set('answerChanged', answerChangedHandler);

      // when
      const screen = await render(
        hbs`<Proposals::QcuProposals @answers={{this.answers}} @proposals={{this.proposals}} @answerChanged={{this.answerChanged}} />`,
      );

      // then
      assert.strictEqual(screen.getAllByRole('radio').length, 3);
      assert.ok(screen.getByLabelText('prop 1'));
      assert.ok(screen.getByLabelText('prop 2'));
      assert.ok(screen.getByLabelText('prop 3'));
    });
  });
});
