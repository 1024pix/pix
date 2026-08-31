import { render } from '@1024pix/ember-testing-library';
import Service from '@ember/service';
import { click } from '@ember/test-helpers';
import ChatPopover from 'pix-admin/components/assistant/chat-popover';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | assistant/chat-popover', function (hooks) {
  setupIntlRenderingTest(hooks);

  hooks.beforeEach(function () {
    class SessionStub extends Service {
      data = { authenticated: { access_token: 'test-token' } };
    }
    this.owner.register('service:session', SessionStub);
  });

  test('le panneau est masqué par défaut', async function (assert) {
    const screen = await render(<template><ChatPopover /></template>);
    assert.dom(screen.queryByRole('region', { name: 'Panneau assistant' })).doesNotExist();
  });

  test("le panneau s'ouvre au clic sur le bouton", async function (assert) {
    const screen = await render(<template><ChatPopover /></template>);
    await click(screen.getByRole('button', { name: "Ouvrir l'assistant" }));
    assert.dom(screen.getByRole('region', { name: 'Panneau assistant' })).exists();
  });

  test('le panneau se ferme au deuxième clic', async function (assert) {
    const screen = await render(<template><ChatPopover /></template>);
    await click(screen.getByRole('button', { name: "Ouvrir l'assistant" }));
    await click(screen.getByRole('button', { name: "Ouvrir l'assistant" }));
    assert.dom(screen.queryByRole('region', { name: 'Panneau assistant' })).doesNotExist();
  });
});
