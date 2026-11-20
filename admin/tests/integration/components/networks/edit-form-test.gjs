import { fillByLabel, render } from '@1024pix/ember-testing-library';
import EmberObject from '@ember/object';
import { click } from '@ember/test-helpers';
import NetworkEditForm from 'pix-admin/components/networks/edit-form';
import { t } from 'pix-admin/tests/helpers/setup-intl';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | networks/edit-form', function (hooks) {
  setupIntlRenderingTest(hooks);

  let pixToast;

  hooks.beforeEach(function () {
    pixToast = this.owner.lookup('service:pixToast');
    sinon.stub(pixToast, 'sendSuccessNotification');
    sinon.stub(pixToast, 'sendErrorNotification');
  });

  test('it renders the name field pre-filled with the network name', async function (assert) {
    // given
    const network = EmberObject.create({ name: 'Mon réseau' });
    const hideFormNoop = sinon.stub();

    // when
    const screen = await render(
      <template><NetworkEditForm @network={{network}} @hideForm={{hideFormNoop}} /></template>,
    );

    // then
    const nameInput = screen.getByRole('textbox', { name: `${t('components.networks.editing.name.label')} *` });
    assert.dom(nameInput).hasValue('Mon réseau');
  });

  test('it renders the cancel and save buttons', async function (assert) {
    // given
    const network = EmberObject.create({ name: 'Mon réseau' });
    const hideFormNoop = sinon.stub();

    // when
    const screen = await render(
      <template><NetworkEditForm @network={{network}} @hideForm={{hideFormNoop}} /></template>,
    );

    // then
    assert.dom(screen.getByRole('button', { name: t('common.actions.cancel') })).exists();
    assert.dom(screen.getByRole('button', { name: t('common.actions.save') })).exists();
  });

  module('when submitting an empty name', function () {
    test('it does not call network.save()', async function (assert) {
      // given
      const network = EmberObject.create({ name: null, save: sinon.stub(), set: sinon.stub() });
      const hideFormNoop = sinon.stub();
      const screen = await render(
        <template><NetworkEditForm @network={{network}} @hideForm={{hideFormNoop}} /></template>,
      );

      // when
      await click(screen.getByRole('button', { name: t('common.actions.save') }));

      // then
      assert.ok(network.save.notCalled);
    });
  });

  module('when submitting a valid name', function () {
    test('it saves the network and shows a success notification', async function (assert) {
      // given
      const network = EmberObject.create({ name: 'Ancien nom', save: sinon.stub().resolves(), set: sinon.stub() });
      const onHideForm = sinon.stub();

      // when
      const screen = await render(
        <template><NetworkEditForm @network={{network}} @hideForm={{onHideForm}} /></template>,
      );
      await fillByLabel(`${t('components.networks.editing.name.label')} *`, 'Nouveau nom');
      await click(screen.getByRole('button', { name: t('common.actions.save') }));

      // then
      assert.ok(network.set.calledOnceWith('name', 'Nouveau nom'));
      assert.ok(network.save.calledOnce);
      assert.ok(
        pixToast.sendSuccessNotification.calledOnceWith({
          message: t('components.networks.editing.notifications.success'),
        }),
      );
      assert.ok(onHideForm.calledOnce);
    });
  });

  module('when the save fails', function () {
    test('it shows an error notification and rollbacks the network attributes', async function (assert) {
      // given
      const network = EmberObject.create({
        name: 'Ancien nom',
        save: sinon.stub().rejects(),
        set: sinon.stub(),
        rollbackAttributes: sinon.stub(),
      });
      const onHideForm = sinon.stub();

      // when
      const screen = await render(
        <template><NetworkEditForm @network={{network}} @hideForm={{onHideForm}} /></template>,
      );
      await fillByLabel(`${t('components.networks.editing.name.label')} *`, 'Nouveau nom');
      await click(screen.getByRole('button', { name: t('common.actions.save') }));

      // then
      assert.ok(
        pixToast.sendErrorNotification.calledOnceWith({
          message: t('components.networks.editing.notifications.error'),
        }),
      );
      assert.ok(network.rollbackAttributes.calledOnce);
      assert.ok(onHideForm.notCalled);
    });
  });
});
