import { render } from '@1024pix/ember-testing-library';
import Service from '@ember/service';
import { t } from 'ember-intl/test-support';
import CompanionBlocker from 'mon-pix/components/companion/blocker';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | Companion | blocker', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('it display children elements when extension is detected', async function (assert) {
    // given
    class PixCompanionStub extends Service {
      startCheckingExtensionIsEnabled = sinon.stub();
      stopCheckingExtensionIsEnabled = sinon.stub();
      isExtensionEnabled = true;
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

  test('it display blocking page when extension is NOT detected', async function (assert) {
    // given
    class PixCompanionStub extends Service {
      startCheckingExtensionIsEnabled = sinon.stub();
      stopCheckingExtensionIsEnabled = sinon.stub();
      isExtensionEnabled = false;
    }

    this.owner.register('service:pix-companion', PixCompanionStub);

    // when
    const screen = await render(<template><CompanionBlocker /></template>);

    // then
    assert.dom(screen.queryByRole('heading', { level: 1, name: 'Companion activé' })).doesNotExist();

    assert
      .dom(screen.queryByRole('heading', { level: 1, name: 'L’extension Pix Companion n’est pas détectée' }))
      .exists();

    assert.dom(screen.queryByText(t('common.companion.not-detected.description'))).exists();

    // assert.dom(screen.queryByRole('link', { name: t('common.companion.not-detected.link') })).exists();
  });
});
