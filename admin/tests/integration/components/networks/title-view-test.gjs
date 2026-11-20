import { render } from '@1024pix/ember-testing-library';
import EmberObject from '@ember/object';
import { click } from '@ember/test-helpers';
import NetworkTitleView from 'pix-admin/components/networks/title-view';
import { t } from 'pix-admin/tests/helpers/setup-intl';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | networks/title-view', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('it displays the network name, id and edit button when @canEdit is true', async function (assert) {
    // given
    const network = EmberObject.create({ id: 42, name: 'Mon réseau' });
    const noop = sinon.stub();

    // when
    const screen = await render(
      <template><NetworkTitleView @network={{network}} @onEdit={{noop}} @canEdit={{true}} /></template>,
    );

    // then
    assert.dom(screen.getByRole('heading', { name: 'Mon réseau' })).exists();
    assert.dom(screen.getByText((_, element) => element.textContent === 'ID : 42')).exists();
    assert.dom(screen.getByRole('button', { name: t('components.networks.copy-id') })).exists();
    assert.dom(screen.getByRole('button', { name: t('common.actions.edit') })).exists();
  });

  test('it hides the edit button when @canEdit is false', async function (assert) {
    // given
    const network = EmberObject.create({ id: 42, name: 'Mon réseau' });
    const noop = sinon.stub();

    // when
    const screen = await render(
      <template><NetworkTitleView @network={{network}} @onEdit={{noop}} @canEdit={{false}} /></template>,
    );

    // then
    assert.dom(screen.getByRole('heading', { name: 'Mon réseau' })).exists();
    assert.dom(screen.queryByRole('button', { name: t('common.actions.edit') })).doesNotExist();
  });

  test('clicking the edit button calls @onEdit', async function (assert) {
    // given
    const network = EmberObject.create({ id: 1, name: 'Mon réseau' });
    const onEdit = sinon.stub();

    // when
    const screen = await render(
      <template><NetworkTitleView @network={{network}} @onEdit={{onEdit}} @canEdit={{true}} /></template>,
    );
    await click(screen.getByRole('button', { name: t('common.actions.edit') }));

    // then
    assert.ok(onEdit.calledOnce);
  });
});
