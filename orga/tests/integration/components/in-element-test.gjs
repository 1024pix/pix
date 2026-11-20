import { render } from '@1024pix/ember-testing-library';
import InElement from 'pix-orga/components/in-element';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';

module('Integration | Component | In Element', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('it finds the id and renders', async function (assert) {
    const screen = await render(
      <template>
        <div id="ninja"></div>
        <InElement @destinationId="ninja">Coucou le chat</InElement>
      </template>,
    );

    assert.dom(screen.getByText('Coucou le chat')).exists();
  });

  test('it waits for the element', async function (assert) {
    const screen = await render(
      <template>
        <InElement @destinationId="ninja" @waitForElement={{true}}>Coucou le chat</InElement>
        <div id="ninja"></div>
      </template>,
    );

    // then
    assert.dom(screen.getByText('Coucou le chat')).exists();
  });
});
