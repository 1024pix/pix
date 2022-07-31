import { module, test } from 'qunit';
import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';
import { findAll, render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

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
    // - ember-qunit: https://github.com/emberjs/ember-qunit#setup-component-tests
    // - Ember: https://guides.emberjs.com/v2.10.0/testing/testing-components
    // -        https://guides.emberjs.com/v2.10.0/tutorial/autocomplete-component/
    test('should render as much radio buttons as proposals', async function (assert) {
      // given
      this.set('proposals', proposals);
      this.set('answers', answers);
      this.set('answerChanged', answerChangedHandler);

      // when
      await render(hbs`{{qcu-proposals answers=answers proposals=proposals answerChanged='answerChanged'}}`);

      // then
      assert.equal(findAll('.proposal-text'), 3);
    });
  });
});
