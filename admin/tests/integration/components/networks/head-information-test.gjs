import { render } from '@1024pix/ember-testing-library';
import EmberObject from '@ember/object';
import Service from '@ember/service';
import { click } from '@ember/test-helpers';
import HeadInformation from 'pix-admin/components/networks/head-information';
import { t } from 'pix-admin/tests/helpers/setup-intl';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | Networks | head-information', function (hooks) {
  setupIntlRenderingTest(hooks);

  module('display', function () {
    test('it should display network informations', async function (assert) {
      // given
      class AccessControlStub extends Service {
        hasAccessToNetworkActionsScope = false;
      }
      this.owner.register('service:access-control', AccessControlStub);
      const network = EmberObject.create({ id: 1, name: 'My network' });

      // when
      const screen = await render(<template><HeadInformation @network={{network}} /></template>);

      // then
      assert.dom(screen.getByRole('heading', { name: 'My network' })).exists();
      assert.dom(screen.getByText((_, element) => element.textContent === 'ID : 1')).exists();
      assert.dom(screen.getByRole('button', { name: t('components.networks.copy-id') })).exists();
    });

    test('it should hide the edit button when user does not have network actions scope', async function (assert) {
      // given
      class AccessControlStub extends Service {
        hasAccessToNetworkActionsScope = false;
      }
      this.owner.register('service:access-control', AccessControlStub);
      const network = EmberObject.create({ id: 1, name: 'My network' });

      // when
      const screen = await render(<template><HeadInformation @network={{network}} /></template>);

      // then
      assert.dom(screen.queryByRole('button', { name: t('common.actions.edit') })).doesNotExist();
    });

    test('it should show the edit button when user has network actions scope', async function (assert) {
      // given
      class AccessControlStub extends Service {
        hasAccessToNetworkActionsScope = true;
      }
      this.owner.register('service:access-control', AccessControlStub);
      const network = EmberObject.create({ id: 1, name: 'My network' });

      // when
      const screen = await render(<template><HeadInformation @network={{network}} /></template>);

      // then
      assert.dom(screen.getByRole('button', { name: t('common.actions.edit') })).exists();
    });
  });

  test('clicking the edit button shows the edit form', async function (assert) {
    // given
    class AccessControlStub extends Service {
      hasAccessToNetworkActionsScope = true;
    }
    this.owner.register('service:access-control', AccessControlStub);
    const network = EmberObject.create({ id: 1, name: 'Mon réseau' });
    const screen = await render(<template><HeadInformation @network={{network}} /></template>);

    // when
    await click(screen.getByRole('button', { name: t('common.actions.edit') }));

    // then
    assert.dom(screen.getByRole('button', { name: t('common.actions.cancel') })).exists();
    assert.dom(screen.queryByRole('heading', { name: 'Mon réseau' })).doesNotExist();
  });

  test('clicking the cancel button hides the form and shows the title view', async function (assert) {
    // given
    class AccessControlStub extends Service {
      hasAccessToNetworkActionsScope = true;
    }
    this.owner.register('service:access-control', AccessControlStub);
    const network = EmberObject.create({ id: 1, name: 'Mon réseau' });
    const screen = await render(<template><HeadInformation @network={{network}} /></template>);
    await click(screen.getByRole('button', { name: t('common.actions.edit') }));

    // when
    await click(screen.getByRole('button', { name: t('common.actions.cancel') }));

    // then
    assert.dom(screen.getByRole('heading', { name: 'Mon réseau' })).exists();
    assert.dom(screen.queryByRole('button', { name: t('common.actions.cancel') })).doesNotExist();
  });
});
