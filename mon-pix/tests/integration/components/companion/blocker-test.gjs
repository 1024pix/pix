import { clickByName, render } from '@1024pix/ember-testing-library';
import Service from '@ember/service';
import { clearRender } from '@ember/test-helpers';
import { t } from 'ember-intl/test-support';
import CompanionBlocker from 'mon-pix/components/companion/blocker';
import Location from 'mon-pix/utils/location';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | Companion | blocker', function (hooks) {
  setupIntlRenderingTest(hooks);

  hooks.afterEach(function () {
    sinon.restore();
  });

  test('it display children elements when extension is detected', async function (assert) {
    // given
    class PixCompanionStub extends Service {
      startCheckingExtensionIsEnabled = sinon.stub();
      stopCheckingExtensionIsEnabled = sinon.stub();
      isExtensionEnabled = true;
      addEventListener = sinon.stub();
      removeEventListener = sinon.stub();
    }

    this.owner.register('service:pix-companion', PixCompanionStub);

    const title = 'Companion activé';

    // when
    const screen = await render(
      <template>
        <CompanionBlocker><h1>{{title}}</h1></CompanionBlocker>
      </template>,
    );

    // then
    assert.dom(screen.queryByRole('heading', { level: 1, name: title })).exists();
  });

  test('it displays blocking page when extension is not detected', async function (assert) {
    // given
    class PixCompanionStub extends Service {
      startCheckingExtensionIsEnabled = sinon.stub();
      stopCheckingExtensionIsEnabled = sinon.stub();
      isExtensionEnabled = false;
      addEventListener = sinon.stub();
      removeEventListener = sinon.stub();
    }

    this.owner.register('service:pix-companion', PixCompanionStub);

    const title = 'Companion activé';

    // when
    const screen = await render(
      <template>
        <CompanionBlocker><h1>{{title}}</h1></CompanionBlocker>
      </template>,
    );

    // then
    assert.dom(screen.queryByRole('heading', { level: 1, name: 'Companion activé' })).doesNotExist();
    assert.dom(screen.getByRole('heading', { level: 1, name: 'L’extension Pix Companionn’est pas détectée' })).exists();
    assert.dom(screen.queryByText(t('common.companion.not-detected.description'))).exists();
    assert
      .dom(screen.getByRole('link', { name: t('common.companion.not-detected.link') }))
      .hasAttribute('href', 'https://cloud.pix.fr/s/g76RwDwsZmZPZZ6');
    assert.dom(screen.getByRole('button', { name: t('common.actions.refresh-page') })).exists();
  });

  test('it starts checking extension is enabled when rendered', async function (assert) {
    // given
    const startCheckingExtensionIsEnabledStub = sinon.stub();
    class PixCompanionStub extends Service {
      startCheckingExtensionIsEnabled = startCheckingExtensionIsEnabledStub;
      stopCheckingExtensionIsEnabled = sinon.stub();
      isExtensionEnabled = true;
      addEventListener = sinon.stub();
      removeEventListener = sinon.stub();
    }
    this.owner.register('service:pix-companion', PixCompanionStub);

    // when
    await render(<template><CompanionBlocker /></template>);

    // then
    sinon.assert.calledOnce(startCheckingExtensionIsEnabledStub);
    assert.ok(true);
  });

  test('it stops checking extension is enabled when torn down', async function (assert) {
    // given
    const stopCheckingExtensionIsEnabledStub = sinon.stub();
    class PixCompanionStub extends Service {
      startCheckingExtensionIsEnabled = sinon.stub();
      stopCheckingExtensionIsEnabled = stopCheckingExtensionIsEnabledStub;
      isExtensionEnabled = true;
      addEventListener = sinon.stub();
      removeEventListener = sinon.stub();
    }
    this.owner.register('service:pix-companion', PixCompanionStub);
    await render(<template><CompanionBlocker /></template>);

    // when
    await clearRender();

    // then
    sinon.assert.calledOnce(stopCheckingExtensionIsEnabledStub);
    assert.ok(true);
  });

  module('when no onBlock callback is given', function () {
    test('it does not register or unregister a block event listener', async function (assert) {
      // given
      const addEventListenerStub = sinon.stub();
      const removeEventListenerStub = sinon.stub();
      class PixCompanionStub extends Service {
        startCheckingExtensionIsEnabled = sinon.stub();
        stopCheckingExtensionIsEnabled = sinon.stub();
        isExtensionEnabled = true;
        addEventListener = addEventListenerStub;
        removeEventListener = removeEventListenerStub;
      }
      this.owner.register('service:pix-companion', PixCompanionStub);

      // when
      await render(<template><CompanionBlocker /></template>);
      await clearRender();

      // then
      sinon.assert.notCalled(addEventListenerStub);
      sinon.assert.notCalled(removeEventListenerStub);
      assert.ok(true);
    });
  });

  module('when onBlock callback is given', function () {
    test('it registers the block event listener when rendered and removes it when torn down', async function (assert) {
      // given
      const addEventListenerStub = sinon.stub();
      const removeEventListenerStub = sinon.stub();
      class PixCompanionStub extends Service {
        startCheckingExtensionIsEnabled = sinon.stub();
        stopCheckingExtensionIsEnabled = sinon.stub();
        isExtensionEnabled = true;
        addEventListener = addEventListenerStub;
        removeEventListener = removeEventListenerStub;
      }
      this.owner.register('service:pix-companion', PixCompanionStub);
      const onBlock = sinon.stub();

      // when
      await render(<template><CompanionBlocker @onBlock={{onBlock}} /></template>);

      // then
      sinon.assert.calledWith(addEventListenerStub, 'block', onBlock);

      // when
      await clearRender();

      // then
      sinon.assert.calledWith(removeEventListenerStub, 'block', onBlock);
      assert.ok(true);
    });
  });

  test('it refreshes the page when clicking the refresh button', async function (assert) {
    // given
    const reloadStub = sinon.stub(Location, 'reload');
    class PixCompanionStub extends Service {
      startCheckingExtensionIsEnabled = sinon.stub();
      stopCheckingExtensionIsEnabled = sinon.stub();
      isExtensionEnabled = false;
      addEventListener = sinon.stub();
      removeEventListener = sinon.stub();
    }
    this.owner.register('service:pix-companion', PixCompanionStub);
    await render(<template><CompanionBlocker /></template>);

    // when
    await clickByName(t('common.actions.refresh-page'));

    // then
    sinon.assert.calledOnce(reloadStub);
    assert.ok(true);
  });
});
