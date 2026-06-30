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
        hbs`<Proposals::QcuProposals
  @answers={{this.answers}}
  @proposals={{this.proposals}}
  @answerChanged={{this.answerChanged}}
/>`,
      );

      // then
      assert.strictEqual(screen.getAllByRole('radio').length, 3);
      assert.ok(screen.getByLabelText('prop 1'));
      assert.ok(screen.getByLabelText('prop 2'));
      assert.ok(screen.getByLabelText('prop 3'));
    });

    test('should render as much radio buttons as proposals when there are many proposals', async function (assert) {
      // given
      this.set('proposals', '- prop 1\n- prop 2\n- prop 3\n- prop 4\n- prop 5');
      this.set('answerChanged', answerChangedHandler);

      // when
      const screen = await render(
        hbs`<Proposals::QcuProposals @proposals={{this.proposals}} @answerChanged={{this.answerChanged}} />`,
      );

      // then
      assert.strictEqual(screen.getAllByRole('radio').length, 5);
    });

    test('should check the radio button matching the given answer value', async function (assert) {
      // given
      this.set('proposals', proposals);
      this.set('answerValue', '2');
      this.set('answerChanged', answerChangedHandler);

      // when
      const screen = await render(
        hbs`<Proposals::QcuProposals
  @answerValue={{this.answerValue}}
  @proposals={{this.proposals}}
  @answerChanged={{this.answerChanged}}
/>`,
      );

      // then
      assert.false(screen.getByLabelText('prop 1').checked);
      assert.true(screen.getByLabelText('prop 2').checked);
      assert.false(screen.getByLabelText('prop 3').checked);
    });

    test('should not check any radio button when the given answer value is null', async function (assert) {
      // given
      this.set('proposals', proposals);
      this.set('answerValue', null);
      this.set('answerChanged', answerChangedHandler);

      // when
      const screen = await render(
        hbs`<Proposals::QcuProposals
  @answerValue={{this.answerValue}}
  @proposals={{this.proposals}}
  @answerChanged={{this.answerChanged}}
/>`,
      );

      // then
      screen.getAllByRole('radio').forEach((radio) => assert.false(radio.checked));
    });

    test('should not check any radio button when no answer value is given', async function (assert) {
      // given
      this.set('proposals', proposals);
      this.set('answerValue', '');
      this.set('answerChanged', answerChangedHandler);

      // when
      const screen = await render(
        hbs`<Proposals::QcuProposals
  @answerValue={{this.answerValue}}
  @proposals={{this.proposals}}
  @answerChanged={{this.answerChanged}}
/>`,
      );

      // then
      screen.getAllByRole('radio').forEach((radio) => assert.false(radio.checked));
    });

    test('should shuffle the proposals order when shuffled is true', async function (assert) {
      // given
      this.set('proposals', proposals);
      this.set('answerChanged', answerChangedHandler);

      // when
      const screen = await render(
        hbs`<Proposals::QcuProposals
  @proposals={{this.proposals}}
  @shuffled={{true}}
  @shuffleSeed={{64}}
  @answerChanged={{this.answerChanged}}
/>`,
      );

      // then
      const labels = screen.getAllByRole('radio').map((radio) => radio.labels[0].textContent.trim());
      assert.deepEqual(labels, ['prop 3', 'prop 1', 'prop 2']);
    });
  });
});
