import { render } from '@1024pix/ember-testing-library';
import Service from '@ember/service';
import NetworkList from 'pix-admin/templates/authenticated/networks/list';
import { t } from 'pix-admin/tests/helpers/setup-intl';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../../helpers/setup-intl-rendering';

module('Integration | Template | networks | list', function (hooks) {
  setupIntlRenderingTest(hooks);

  const networks = [];
  const controller = {
    name: null,
    triggerFiltering: sinon.stub(),
    onResetFilter: sinon.stub(),
  };

  test('it displays the "Nouveau réseau" button when user has network actions scope', async function (assert) {
    // given
    class AccessControlStub extends Service {
      hasAccessToNetworkActionsScope = true;
    }
    this.owner.register('service:access-control', AccessControlStub);

    // when
    const screen = await render(<template><NetworkList @controller={{controller}} @model={{networks}} /></template>);

    // then
    assert.dom(screen.getByRole('link', { name: t('pages.networks.list.new-button') })).exists();
  });

  test('it does not display the "Nouveau réseau" button when user does not have network actions scope', async function (assert) {
    // given
    class AccessControlStub extends Service {
      hasAccessToNetworkActionsScope = false;
    }
    this.owner.register('service:access-control', AccessControlStub);

    // when
    const screen = await render(<template><NetworkList @controller={{controller}} @model={{networks}} /></template>);

    // then
    assert.dom(screen.queryByRole('link', { name: t('pages.networks.list.new-button') })).doesNotExist();
  });
});
