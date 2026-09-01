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

  test('le panneau est rendu dans le DOM mais masqué via CSS par défaut', async function (assert) {
    await render(<template><ChatPopover /></template>);
    assert.dom('[role="region"][aria-label="Panneau assistant"]').exists();
    assert.dom('[role="region"][aria-label="Panneau assistant"]').hasStyle({ display: 'none' });
  });

  test("le panneau s'ouvre au clic sur le bouton", async function (assert) {
    const screen = await render(<template><ChatPopover /></template>);
    await click(screen.getByRole('button', { name: "Ouvrir l'assistant" }));
    assert.dom(screen.getByRole('region', { name: 'Panneau assistant' })).exists();
    assert.dom(screen.getByRole('region', { name: 'Panneau assistant' })).doesNotHaveStyle({ display: 'none' });
  });

  test('le panneau se cache via CSS au deuxième clic mais reste monté dans le DOM', async function (assert) {
    const screen = await render(<template><ChatPopover /></template>);
    await click(screen.getByRole('button', { name: "Ouvrir l'assistant" }));
    await click(screen.getByRole('button', { name: "Ouvrir l'assistant" }));
    assert.dom('[role="region"][aria-label="Panneau assistant"]').exists();
    assert.dom('[role="region"][aria-label="Panneau assistant"]').hasStyle({ display: 'none' });
  });

  test('React reste monté entre les cycles ouverture/fermeture', async function (assert) {
    const screen = await render(<template><ChatPopover /></template>);
    const panelEl = document.querySelector('[role="region"][aria-label="Panneau assistant"]');
    // Ouvrir, puis fermer : le même élément DOM doit être réutilisé (pas de remontage)
    await click(screen.getByRole('button', { name: "Ouvrir l'assistant" }));
    await click(screen.getByRole('button', { name: "Ouvrir l'assistant" }));
    assert.strictEqual(
      document.querySelector('[role="region"][aria-label="Panneau assistant"]'),
      panelEl,
      'le même nœud DOM est conservé — React ne se remonte pas',
    );
  });
});
