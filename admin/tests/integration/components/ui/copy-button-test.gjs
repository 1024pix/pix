import { clickByName, render } from '@1024pix/ember-testing-library';
import { triggerEvent } from '@ember/test-helpers';
import CopyButton from 'pix-admin/components/ui/copy-button';
import { t } from 'pix-admin/tests/helpers/setup-intl';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | CopyButton', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('it copies the given value into the clipboard', async function (assert) {
    //given
    const valueToCopy = 'Coucou';
    const tooltipText = 'Juste du texte';
    const buttonLabel = 'Copier le coucou';

    const copyStub = sinon.stub();
    Object.defineProperty(navigator, 'clipboard', { writable: true, value: { writeText: copyStub } });

    // when
    const screen = await render(
      <template>
        <CopyButton @id="copy-username" @value={{valueToCopy}} @tooltip={{tooltipText}} @label={{buttonLabel}} />
      </template>,
    );
    await clickByName(buttonLabel);
    await screen.findByText(t('common.actions.copied'));

    // then
    assert.ok(copyStub.calledWithExactly(valueToCopy));
  });

  test('it displays tooltip on hover', async function (assert) {
    //given
    const valueToCopy = 'Coucou';
    const tooltipText = 'Juste du texte';
    const buttonLabel = 'Copier le coucou';

    // when
    const screen = await render(
      <template>
        <CopyButton @id="copy-username" @value={{valueToCopy}} @tooltip={{tooltipText}} @label={{buttonLabel}} />
      </template>,
    );
    const copyButton = await screen.getByRole('button', { name: buttonLabel });
    await triggerEvent(copyButton, 'mouseenter');

    // then
    assert.dom(screen.getByText('Juste du texte')).exists();
  });
});
