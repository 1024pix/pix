import { render } from '@1024pix/ember-testing-library';
import { hbs } from 'ember-cli-htmlbars';
import { setupRenderingTest } from 'ember-qunit';
import { module, test } from 'qunit';

module('Integration | Component | In Element', function (hooks) {
  setupRenderingTest(hooks);

  test('should found the id and renders', async function (assert) {
    const screen = await render(
      hbs`<div id='ninja'></div>
<InElement @destinationId='ninja'>Coucou le chat</InElement>`,
    );

    assert.dom(screen.getByText('Coucou le chat')).exists();
  });

  test('should wait if the element does not exists yet', async function (assert) {
    const screen = await render(
      hbs`<InElement @destinationId='ninja' @waitForElement={{true}}>Coucou le chat</InElement>
<div id='ninja'></div>`,
    );

    // then
    assert.dom(screen.getByText('Coucou le chat')).exists();
  });
});
