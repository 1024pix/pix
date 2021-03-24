import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import sinon from 'sinon';
import { render, click } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | Stages::Stage', (hooks) => {
  let stage;
  let isEditMode;
  let toggleEditMode;

  setupRenderingTest(hooks);

  hooks.beforeEach(function() {
    isEditMode = false;
    toggleEditMode = sinon.stub();
    stage = { id: 34, threshold: 60, title: 'palier 3', message: 'mon message', prescriberTitle: 'titre du prescriteur', prescriberDescription: 'description de prescripteur' };

    this.set('isEditMode', isEditMode);
    this.set('stage', stage);
    this.set('toggleEditMode', toggleEditMode);
  });

  test('should render all details about the stage when the isEditMode is false', async function(assert) {
    //when
    await render(hbs`<Stages::Stage @model={{this.stage}} @toggleEditMode = {{this.toggleEditMode}} @isEditMode={{this.isEditMode}}/>`);

    //then
    assert.dom('button').exists();
    assert.contains('Editer');
    assert.dom('.page-section__details').exists();
  });

  test('should call toggleEditMode function when the edit button is clicked', async function(assert) {
    //when
    await render(hbs`<Stages::Stage @model={{this.stage}} @toggleEditMode = {{this.toggleEditMode}} @isEditMode={{this.isEditMode}}/>`);

    await click('button');
    //then
    assert.ok(toggleEditMode.called);
  });

  test('should render updateStage component when the isEditMode is true', async function(assert) {
    //given
    this.set('isEditMode', true);

    //when
    await render(hbs`<Stages::Stage @model={{this.stage}} @toggleEditMode = {{this.toggleEditMode}} @isEditMode={{this.isEditMode}}/>`);

    //then
    assert.contains('Annuler');
    assert.contains('Enregistrer');
    assert.dom('.stage__edit-form').exists();
  });
});
