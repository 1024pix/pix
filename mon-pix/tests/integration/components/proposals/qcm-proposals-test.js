import { render } from '@1024pix/ember-testing-library';
import { hbs } from 'ember-cli-htmlbars';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | QCM proposals', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('renders', async function (assert) {
    await render(hbs`<Proposals::QcmProposals />`);
    assert.dom('.qcm-proposals').exists();
  });

  module('Rendering', function (hooks) {
    let proposals;
    let answerValue;
    let answerChangedHandler;

    hooks.beforeEach(function () {
      proposals = '- prop 1\n- prop 2\n- prop 3';
      answerValue = '2';
      answerChangedHandler = () => true;
    });

    test('should render as many checkboxes as proposals, with the selected one checked', async function (assert) {
      // given
      this.set('proposals', proposals);
      this.set('answerValue', answerValue);
      this.set('answerChanged', answerChangedHandler);
      this.set('shuffled', false);

      // when
      const screen = await render(
        hbs`<Proposals::QcmProposals
  @answerValue={{this.answerValue}}
  @proposals={{this.proposals}}
  @answerChanged={{this.answerChanged}}
  @shuffled={{this.shuffled}}
/>`,
      );

      // then
      const checkboxes = screen.getAllByRole('checkbox');
      assert.strictEqual(checkboxes.length, 3);
      assert.notOk(screen.getByRole('checkbox', { name: 'prop 1' }).checked);
      assert.ok(screen.getByRole('checkbox', { name: 'prop 2' }).checked);
      assert.notOk(screen.getByRole('checkbox', { name: 'prop 3' }).checked);
    });

    test('should render all proposals when shuffled is true', async function (assert) {
      // given
      this.set('proposals', proposals);
      this.set('answerValue', answerValue);
      this.set('answerChanged', answerChangedHandler);
      this.set('shuffled', true);
      this.set('shuffleSeed', 64);

      // when
      const screen = await render(
        hbs`<Proposals::QcmProposals
  @answerValue={{this.answerValue}}
  @proposals={{this.proposals}}
  @answerChanged={{this.answerChanged}}
  @shuffled={{this.shuffled}}
  @shuffleSeed={{this.shuffleSeed}}
/>`,
      );

      // then
      assert.strictEqual(screen.getAllByRole('checkbox').length, 3);
      assert.ok(screen.getByRole('checkbox', { name: 'prop 1' }));
      assert.ok(screen.getByRole('checkbox', { name: 'prop 2' }));
      assert.ok(screen.getByRole('checkbox', { name: 'prop 3' }));
      assert.ok(screen.getByRole('checkbox', { name: 'prop 2' }).checked);
    });
  });
});
