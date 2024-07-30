import { clickByName, render } from '@1024pix/ember-testing-library';
import { hbs } from 'ember-cli-htmlbars';
import { setupRenderingTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Integration | Component | confirm-popup', function (hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function () {
    this.display = true;
  });

  test('should display confirm', async function (assert) {
    // given & when
    const screen = await render(hbs`<ConfirmPopup @show={{this.display}} />`);

    // then
    assert.dom(screen.getByRole('heading', { name: 'Merci de confirmer' })).exists();
    assert.dom(screen.getByRole('button', { name: 'Annuler' })).exists();
    assert.dom(screen.getByRole('button', { name: 'Confirmer' })).exists();
  });

  test('should not display confirm', async function (assert) {
    // given & when
    this.display = false;

    const screen = await render(hbs`<ConfirmPopup @show={{this.display}} />`);

    // then
    assert.dom(screen.queryByRole('heading', { name: 'Merci de confirmer' })).doesNotExist();
    assert.dom(screen.queryByRole('button', { name: 'Annuler' })).doesNotExist();
    assert.dom(screen.queryByRole('button', { name: 'Confirmer' })).doesNotExist();
  });

  test('should call cancel action on click on cancel button', async function (assert) {
    // given
    this.cancel = sinon.stub();

    await render(hbs`<ConfirmPopup @show={{this.display}} @cancel={{this.cancel}} />`);

    // when
    await clickByName('Annuler');

    // then
    assert.ok(this.cancel.called);
  });

  test('should call confirm action on click on confirm button', async function (assert) {
    // given
    this.confirm = sinon.stub();
    await render(hbs`<ConfirmPopup @show={{this.display}} @confirm={{this.confirm}} />`);

    // when
    await clickByName('Confirmer');

    // then
    assert.ok(this.confirm.called);
  });

  test('should display default title if it is not defined', async function (assert) {
    // given & when
    const screen = await render(hbs`<ConfirmPopup @show={{this.display}} />`);

    // then
    assert.dom(screen.getByText('Merci de confirmer')).exists();
  });

  test('should display title in parameter if it is defined', async function (assert) {
    // given
    this.title = 'Titre de test';

    // when
    const screen = await render(hbs`<ConfirmPopup @show={{this.display}} @title={{this.title}} />`);

    // then
    assert.dom(screen.getByText(this.title)).exists();
  });

  test('should display default closeTitle if it is not defined', async function (assert) {
    // given & when
    const screen = await render(hbs`<ConfirmPopup @show={{this.display}} />`);

    // then
    assert.dom(screen.getByRole('button', { name: 'Annuler' })).exists();
  });

  test('should display closeTitle in parameter if it is defined', async function (assert) {
    // given
    this.closeTitle = "Titre du bouton d'annulation";

    // when
    const screen = await render(hbs`<ConfirmPopup @show={{this.display}} @closeTitle={{this.closeTitle}} />`);

    // then
    assert.dom(screen.getByText(this.closeTitle)).exists();
  });

  test('should display default submitTitle if it is not defined', async function (assert) {
    // given & when
    const screen = await render(hbs`<ConfirmPopup @show={{this.display}} />`);

    // then
    assert.dom(screen.getByRole('button', { name: 'Confirmer' })).exists();
  });

  test('should display submitTitle  in parameter if it is defined', async function (assert) {
    // given
    this.submitTitle = 'Titre du bouton dde confirmation';

    // when
    const screen = await render(hbs`<ConfirmPopup @show={{this.display}} @submitTitle={{this.submitTitle}} />`);

    // then
    assert.dom(screen.getByText(this.submitTitle)).exists();
  });
});
