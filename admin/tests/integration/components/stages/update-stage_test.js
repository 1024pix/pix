import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { click, fillIn } from '@ember/test-helpers';
import { render } from '@1024pix/ember-testing-library';
import sinon from 'sinon';
import hbs from 'htmlbars-inline-precompile';
import EmberObject from '@ember/object';

module('Integration | Component | UpdateStage', function (hooks) {
  setupRenderingTest(hooks);

  let toggleEditMode;
  let updateStage;
  let stage;

  hooks.beforeEach(function () {
    updateStage = sinon.stub();
    toggleEditMode = sinon.stub();
    toggleEditMode = sinon.stub();
    const save = sinon.stub();
    stage = EmberObject.create({
      threshold: 50,
      title: 'Titre du palier',
      message: 'Ceci est un message',
      prescriberTitle: 'Ceci est un titre',
      prescriberDescription: 'Ceci est une description',
      save,
    });

    this.set('updateStage', updateStage);
    this.set('toggleEditMode', toggleEditMode);
    this.set('stage', stage);
  });

  test('it should display the items', async function (assert) {
    // when
    const screen = await render(
      hbs`<Stages::UpdateStage @model={{this.stage}} @toggleEditMode={{this.toggleEditMode}} />`
    );

    // then
    assert.strictEqual(this.element.querySelector('label[for="threshold"]').textContent.trim(), 'Seuil');
    assert.strictEqual(this.element.querySelector('label[for="title"]').textContent.trim(), 'Titre');
    assert.strictEqual(this.element.querySelector('label[for="message"]').textContent.trim(), 'Message');
    assert.strictEqual(
      this.element.querySelector('label[for="prescriberTitle"]').textContent.trim(),
      'Titre pour le prescripteur'
    );
    assert.strictEqual(
      this.element.querySelector('label[for="prescriberDescription"]').textContent.trim(),
      'Description pour le prescripteur'
    );
    assert.strictEqual(this.element.querySelector('#threshold').value, '50');
    assert.strictEqual(this.element.querySelector('#title').value, 'Titre du palier');
    assert.strictEqual(this.element.querySelector('#message').value, 'Ceci est un message');
    assert.strictEqual(this.element.querySelector('#prescriberTitle').value, 'Ceci est un titre');
    assert.strictEqual(this.element.querySelector('#prescriberDescription').value, 'Ceci est une description');
    assert.dom(screen.getByRole('button', { name: 'Annuler' })).exists();
    assert.dom(screen.getByRole('button', { name: 'Enregistrer' })).exists();
  });

  test('it should display an error text when the title has more than 255 characters', async function (assert) {
    // when
    await render(hbs`<Stages::UpdateStage @model={{this.stage}} @toggleEditMode={{this.toggleEditMode}} />`);
    await fillIn('#prescriberTitle', 'a'.repeat(256));
    // then
    assert.dom('.form-field__error').exists();
  });

  test('it should call updateStage when form is valid', async function (assert) {
    //when
    await render(hbs`<Stages::UpdateStage @model={{this.stage}} @toggleEditMode={{this.toggleEditMode}} />`);
    await fillIn('#prescriberTitle', 'Nouveau titre');
    await click('button[type="submit"]');

    //then
    assert.ok(this.stage.save.called);
  });

  test('it should call onCancel when form is cancel', async function (assert) {
    // when
    await render(hbs`<Stages::UpdateStage @model={{this.stage}} @toggleEditMode={{this.toggleEditMode}} />`);
    await click('button[type="button"]');

    // then
    assert.ok(toggleEditMode.called);
  });
});
