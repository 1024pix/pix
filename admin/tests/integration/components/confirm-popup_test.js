import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { click, render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import sinon from 'sinon';

module('Integration | Component | confirm-popup', function(hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function() {
    this.display = true;
  });

  test('should open confirm', async function(assert) {
    await render(hbs`<ConfirmPopup @show={{this.display}} />`);

    assert.dom('.modal-dialog').exists();
  });

  test('should call cancel action on click on cancel button', async function(assert) {
    this.cancel = sinon.stub();

    await render(hbs`<ConfirmPopup @show={{this.display}} @cancel={{this.cancel}} />`);
    await click('button.btn-secondary');

    assert.ok(this.cancel.called);
    assert.dom('.modal-dialog').doesNotExist();
  });

  test('should call confirm action on click on confirm button', async function(assert) {
    this.confirm = sinon.stub();

    await render(hbs`<ConfirmPopup @show={{this.display}} @confirm={{this.confirm}} />`);
    await click('button.btn-primary');

    assert.ok(this.confirm.called);
  });

  test('should display default title if it is not defined', async function(assert) {
    await render(hbs`<ConfirmPopup @show={{this.display}} />`);

    assert.contains('Merci de confirmer');
  });

  test('should display title in parameter if it is defined', async function(assert) {
    this.title = 'Titre de test';

    await render(hbs`<ConfirmPopup @show={{this.display}} @title={{this.title}} />`);

    assert.contains(this.title);
  });

  test('should display default closeTitle if it is not defined', async function(assert) {
    await render(hbs`<ConfirmPopup @show={{this.display}} />`);

    assert.contains('Annuler');
  });

  test('should display closeTitle in parameter if it is defined', async function(assert) {
    this.closeTitle = 'Titre du bouton d\'annulation';

    await render(hbs`<ConfirmPopup @show={{this.display}} @closeTitle={{this.closeTitle}} />`);

    assert.contains(this.closeTitle);
  });

  test('should display default submitTitle if it is not defined', async function(assert) {
    await render(hbs`<ConfirmPopup @show={{this.display}} />`);

    assert.contains('Confirmer');
  });

  test('should display submitTitle  in parameter if it is defined', async function(assert) {
    this.submitTitle = 'Titre du bouton dde confirmation';

    await render(hbs`<ConfirmPopup @show={{this.display}} @submitTitle={{this.submitTitle}} />`);

    assert.contains(this.submitTitle);
  });
});
