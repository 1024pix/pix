import { render } from '@1024pix/ember-testing-library';
import { click, rerender } from '@ember/test-helpers';
import ActionChip from 'mon-pix/components/action-chip';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';

module('Integration | Component | action-chip', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('should call the triggerAction when the chip is clicked', async function (assert) {
    // given
    const triggerAction = sinon.spy();
    const screen = await render(
      <template><ActionChip @title="Mon action" @icon="add" @triggerAction={{triggerAction}} /></template>,
    );

    // when
    await click(screen.getByRole('button', { name: 'Mon action' }));

    // then
    sinon.assert.calledOnce(triggerAction);
    assert.ok(true);
  });

  test('should not call the triggerAction again while a previous action is still triggering', async function (assert) {
    // given
    let resolveTriggerAction;
    const triggerAction = sinon.spy(
      () =>
        new Promise((resolve) => {
          resolveTriggerAction = resolve;
        }),
    );
    const screen = await render(
      <template><ActionChip @title="Mon action" @icon="add" @triggerAction={{triggerAction}} /></template>,
    );
    const button = screen.getByRole('button', { name: 'Mon action' });

    // when
    // First click starts the action and keeps isTriggering=true while the
    // deferred promise stays pending. We dispatch native clicks (rather than
    // awaiting the test-helper click, which would wait for the never-settling
    // promise) and rerender to flush the tracked state to the DOM.
    button.click();
    await rerender();
    button.click();
    await rerender();

    // then
    assert.dom(button).isDisabled();
    sinon.assert.calledOnce(triggerAction);

    // cleanup
    resolveTriggerAction();
    await rerender();
  });
});
