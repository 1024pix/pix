import { clickByName, render } from '@1024pix/ember-testing-library';
import ConfirmPopup from 'pix-admin/components/confirm-popup';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';

module('Integration | Component | confirm-popup', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('should display confirm', async function (assert) {
    // given & when
    const display = true;
    const screen = await render(<template><ConfirmPopup @show={{display}} /></template>);

    // then
    assert.dom(screen.getByRole('heading', { name: 'Merci de confirmer' })).exists();
    assert.dom(screen.getByRole('button', { name: 'Annuler' })).exists();
    assert.dom(screen.getByRole('button', { name: 'Confirmer' })).exists();
  });

  test('should not display confirm', async function (assert) {
    // given & when
    const display = false;

    const screen = await render(<template><ConfirmPopup @show={{display}} /></template>);

    // then
    assert.dom(screen.queryByRole('heading', { name: 'Merci de confirmer' })).doesNotExist();
    assert.dom(screen.queryByRole('button', { name: 'Annuler' })).doesNotExist();
    assert.dom(screen.queryByRole('button', { name: 'Confirmer' })).doesNotExist();
  });

  test('should call cancel action on click on cancel button', async function (assert) {
    // given
    const display = true;
    const cancel = sinon.stub();

    await render(<template><ConfirmPopup @show={{display}} @cancel={{cancel}} /></template>);

    // when
    await clickByName('Annuler');

    // then
    assert.ok(cancel.called);
  });

  test('should call confirm action on click on confirm button', async function (assert) {
    // given
    const display = true;
    const confirm = sinon.stub();
    await render(<template><ConfirmPopup @show={{display}} @confirm={{confirm}} /></template>);

    // when
    await clickByName('Confirmer');

    // then
    assert.ok(confirm.called);
  });

  test('should display default title if it is not defined', async function (assert) {
    // given
    const display = true;

    // when
    const screen = await render(<template><ConfirmPopup @show={{display}} /></template>);

    // then
    assert.dom(screen.getByText('Merci de confirmer')).exists();
  });

  test('should display title in parameter if it is defined', async function (assert) {
    // given
    const display = true;
    const title = 'Titre de test';

    // when
    const screen = await render(<template><ConfirmPopup @show={{display}} @title={{title}} /></template>);

    // then
    assert.dom(screen.getByText(title)).exists();
  });

  test('should display default closeTitle if it is not defined', async function (assert) {
    // given & when
    const display = true;
    const screen = await render(<template><ConfirmPopup @show={{display}} /></template>);

    // then
    assert.dom(screen.getByRole('button', { name: 'Annuler' })).exists();
  });

  test('should display closeTitle in parameter if it is defined', async function (assert) {
    // given
    const display = true;
    const closeTitle = "Titre du bouton d'annulation";

    // when
    const screen = await render(<template><ConfirmPopup @show={{display}} @closeTitle={{closeTitle}} /></template>);

    // then
    assert.dom(screen.getByText(closeTitle)).exists();
  });

  test('should display default submitTitle if it is not defined', async function (assert) {
    // given & when
    const display = true;
    const screen = await render(<template><ConfirmPopup @show={{display}} /></template>);

    // then
    assert.dom(screen.getByRole('button', { name: 'Confirmer' })).exists();
  });

  test('should display submitTitle  in parameter if it is defined', async function (assert) {
    // given
    const display = true;
    const submitTitle = 'Titre du bouton dde confirmation';

    // when
    const screen = await render(<template><ConfirmPopup @show={{display}} @submitTitle={{submitTitle}} /></template>);

    // then
    assert.dom(screen.getByText(submitTitle)).exists();
  });
});
