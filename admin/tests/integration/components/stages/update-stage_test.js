import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, clickByName, fillByLabel } from '@1024pix/ember-testing-library';
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
    assert.dom(screen.getByRole('spinbutton', { name: 'Seuil' })).hasValue('50');
    assert.dom(screen.getByRole('textbox', { name: 'Titre' })).hasValue('Titre du palier');
    assert.dom(screen.getByRole('textbox', { name: 'Message' })).hasValue('Ceci est un message');
    assert.dom(screen.getByRole('textbox', { name: 'Titre pour le prescripteur' })).hasValue('Ceci est un titre');
    assert
      .dom(screen.getByRole('textbox', { name: 'Description pour le prescripteur' }))
      .hasValue('Ceci est une description');
    assert.dom(screen.getByRole('button', { name: 'Annuler' })).exists();
    assert.dom(screen.getByRole('button', { name: 'Enregistrer' })).exists();
  });

  test('it should display an error text when the title has more than 255 characters', async function (assert) {
    // when
    const screen = await render(
      hbs`<Stages::UpdateStage @model={{this.stage}} @toggleEditMode={{this.toggleEditMode}} />`
    );

    await fillByLabel('Titre pour le prescripteur', 'a'.repeat(256));

    // then
    assert.dom(screen.getByText('La longueur du nom ne doit pas excéder 255 caractères')).exists();
  });

  test('it should call updateStage when form is valid', async function (assert) {
    //when
    await render(hbs`<Stages::UpdateStage @model={{this.stage}} @toggleEditMode={{this.toggleEditMode}} />`);
    await fillByLabel('Titre pour le prescripteur', 'Nouveau titre');
    await clickByName('Enregistrer');

    //then
    assert.ok(this.stage.save.called);
  });

  test('it should call onCancel when form is cancel', async function (assert) {
    // when
    await render(hbs`<Stages::UpdateStage @model={{this.stage}} @toggleEditMode={{this.toggleEditMode}} />`);
    await clickByName('Enregistrer');

    // then
    assert.ok(toggleEditMode.called);
  });
});
