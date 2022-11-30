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
  let maxLevel;

  hooks.beforeEach(function () {
    updateStage = sinon.stub();
    toggleEditMode = sinon.stub();
    toggleEditMode = sinon.stub();
    const save = sinon.stub();
    stage = EmberObject.create({
      threshold: 50,
      level: 1,
      title: 'Titre du palier',
      message: 'Ceci est un message',
      prescriberTitle: 'Ceci est un titre',
      prescriberDescription: 'Ceci est une description',
      save,
    });
    maxLevel = 2;

    this.set('updateStage', updateStage);
    this.set('toggleEditMode', toggleEditMode);
    this.set('stage', stage);
    this.set('maxLevel', maxLevel);
  });

  test('it should display the fields and buttons', async function (assert) {
    // when
    const screen = await render(
      hbs`<Stages::UpdateStage
  @stage={{this.stage}}
  @isTypeLevel={{false}}
  @stageTypeName='Seuil'
  @toggleEditMode={{this.toggleEditMode}}
/>`
    );

    // then
    assert.dom(screen.getByRole('spinbutton', { name: 'Seuil' })).hasValue('50');
    assert.dom(screen.queryByRole('combobox', { name: 'Niveau' })).doesNotExist();
    assert.dom(screen.getByRole('textbox', { name: 'Titre' })).hasValue('Titre du palier');
    assert.dom(screen.getByRole('textbox', { name: 'Message' })).hasValue('Ceci est un message');
    assert.dom(screen.getByRole('textbox', { name: 'Titre pour le prescripteur' })).hasValue('Ceci est un titre');
    assert
      .dom(screen.getByRole('textbox', { name: 'Description pour le prescripteur' }))
      .hasValue('Ceci est une description');
    assert.dom(screen.getByRole('button', { name: 'Annuler' })).exists();
    assert.dom(screen.getByRole('button', { name: 'Enregistrer' })).exists();
  });

  module('when stage type is level', function () {
    test('it should display level field', async function (assert) {
      // when
      const screen = await render(
        hbs`<Stages::UpdateStage
  @stage={{this.stage}}
  @maxLevel={{this.maxLevel}}
  @isTypeLevel={{true}}
  @stageTypeName='Niveau'
  @toggleEditMode={{this.toggleEditMode}}
/>`
      );

      // then
      assert.dom(screen.queryByRole('spinbutton', { name: 'Seuil' })).doesNotExist();
      assert
        .dom(screen.queryByRole('combobox', { name: 'Niveau' }))
        .exists()
        .hasValue('1');
      const options = screen.getByRole('combobox', { name: 'Niveau' }).children;
      assert.strictEqual(options.length, 3);
      assert.strictEqual(options[0].value, '0');
      assert.strictEqual(options[0].label, '0');
      assert.strictEqual(options[1].value, '1');
      assert.strictEqual(options[1].label, '1');
      assert.strictEqual(options[2].value, '2');
      assert.strictEqual(options[2].label, '2');
    });
  });

  test('it should display an error text when the title has more than 255 characters', async function (assert) {
    // when
    const screen = await render(
      hbs`<Stages::UpdateStage
  @stage={{this.stage}}
  @isTypeLevel={{false}}
  @stageTypeName='Seuil'
  @toggleEditMode={{this.toggleEditMode}}
/>`
    );

    await fillByLabel('Titre pour le prescripteur', 'a'.repeat(256));

    // then
    assert.dom(screen.getByText('La longueur du nom ne doit pas excéder 255 caractères')).exists();
  });

  test('it should call updateStage when form is valid', async function (assert) {
    //when
    await render(
      hbs`<Stages::UpdateStage
  @stage={{this.stage}}
  @isTypeLevel={{false}}
  @stageTypeName='Seuil'
  @toggleEditMode={{this.toggleEditMode}}
/>`
    );
    await fillByLabel('Titre pour le prescripteur', 'Nouveau titre');
    await clickByName('Enregistrer');

    //then
    assert.ok(this.stage.save.called);
  });

  test('it should call onCancel when form is cancel', async function (assert) {
    // when
    await render(
      hbs`<Stages::UpdateStage
  @stage={{this.stage}}
  @isTypeLevel={{false}}
  @stageTypeName='Seuil'
  @toggleEditMode={{this.toggleEditMode}}
/>`
    );
    await clickByName('Enregistrer');

    // then
    assert.ok(toggleEditMode.called);
  });
});
