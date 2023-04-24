import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import sinon from 'sinon';
import { click } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { render } from '@1024pix/ember-testing-library';

module('Integration | Component | Stages::Stage', function (hooks) {
  let stage;
  let isEditMode;
  let toggleEditMode;

  setupRenderingTest(hooks);

  module('when stage is firstSkill', function (hooks) {
    hooks.beforeEach(function () {
      isEditMode = false;
      toggleEditMode = sinon.stub();
      const store = this.owner.lookup('service:store');
      stage = store.createRecord('stage', {
        id: 34,
        threshold: null,
        level: null,
        isFirstSkill: true,
        title: 'palier premier acquis',
        message: 'mon message',
        prescriberTitle: 'titre du prescriteur',
        prescriberDescription: 'description de prescripteur',
      });

      this.set('isEditMode', isEditMode);
      this.set('stage', stage);
      this.set('toggleEditMode', toggleEditMode);
    });

    test('should render all details about the stage when the isEditMode is false', async function (assert) {
      //when
      const screen = await render(
        hbs`<Stages::Stage @stage={{this.stage}} @toggleEditMode={{this.toggleEditMode}} @isEditMode={{this.isEditMode}} />`
      );

      //then
      assert.dom(screen.getByRole('button', { name: 'Éditer' })).exists();
      assert.dom(screen.getByText('ID : 34', { exact: false })).exists();
      assert.dom(screen.getByText('1er acquis', { exact: false })).exists();
      assert.dom(screen.getByText('Titre : palier premier acquis', { exact: false })).exists();
      assert.dom(screen.getByText('Message : mon message', { exact: false })).exists();
    });

    test('should call toggleEditMode function when the edit button is clicked', async function (assert) {
      //when
      await render(
        hbs`<Stages::Stage @stage={{this.stage}} @toggleEditMode={{this.toggleEditMode}} @isEditMode={{this.isEditMode}} />`
      );

      await click('button');

      //then
      assert.ok(toggleEditMode.called);
    });

    test('should render updateStage component when the isEditMode is true', async function (assert) {
      //given
      this.set('isEditMode', true);

      //when
      const screen = await render(
        hbs`<Stages::Stage @stage={{this.stage}} @toggleEditMode={{this.toggleEditMode}} @isEditMode={{this.isEditMode}} />`
      );

      //then
      assert.dom(screen.getByRole('button', { name: 'Annuler' })).exists();
      assert.dom(screen.getByRole('button', { name: 'Enregistrer' })).exists();
      assert.dom(screen.getByRole('textbox', { name: 'Titre pour le prescripteur' })).exists();
    });
  });

  module('when stage type is threshold', function (hooks) {
    hooks.beforeEach(function () {
      isEditMode = false;
      toggleEditMode = sinon.stub();
      stage = {
        id: 34,
        threshold: 60,
        isTypeLevel: false,
        title: 'palier 3',
        message: 'mon message',
        prescriberTitle: 'titre du prescriteur',
        prescriberDescription: 'description de prescripteur',
      };

      this.set('isEditMode', isEditMode);
      this.set('stage', stage);
      this.set('toggleEditMode', toggleEditMode);
    });

    test('should render all details about the stage when the isEditMode is false', async function (assert) {
      //when
      const screen = await render(
        hbs`<Stages::Stage @stage={{this.stage}} @toggleEditMode={{this.toggleEditMode}} @isEditMode={{this.isEditMode}} />`
      );

      //then
      assert.dom(screen.getByRole('button', { name: 'Éditer' })).exists();
      assert.dom(screen.getByText('ID : 34', { exact: false })).exists();
      assert.dom(screen.getByText('Seuil : 60', { exact: false })).exists();
      assert.dom(screen.getByText('Titre : palier 3', { exact: false })).exists();
      assert.dom(screen.getByText('Message : mon message', { exact: false })).exists();
    });

    test('should call toggleEditMode function when the edit button is clicked', async function (assert) {
      //when
      await render(
        hbs`<Stages::Stage @stage={{this.stage}} @toggleEditMode={{this.toggleEditMode}} @isEditMode={{this.isEditMode}} />`
      );

      await click('button');

      //then
      assert.ok(toggleEditMode.called);
    });

    test('should render updateStage component when the isEditMode is true', async function (assert) {
      //given
      this.set('isEditMode', true);

      //when
      const screen = await render(
        hbs`<Stages::Stage @stage={{this.stage}} @toggleEditMode={{this.toggleEditMode}} @isEditMode={{this.isEditMode}} />`
      );

      //then
      assert.dom(screen.getByRole('button', { name: 'Annuler' })).exists();
      assert.dom(screen.getByRole('button', { name: 'Enregistrer' })).exists();
      assert.dom(screen.getByRole('textbox', { name: 'Titre pour le prescripteur' })).exists();
    });
  });
  module('when stage type is level', function (hooks) {
    hooks.beforeEach(function () {
      isEditMode = false;
      toggleEditMode = sinon.stub();
      stage = {
        id: 34,
        isTypeLevel: true,
        level: 3,
        title: 'palier 3',
        message: 'mon message',
        prescriberTitle: 'titre du prescriteur',
        prescriberDescription: 'description de prescripteur',
      };

      this.set('isEditMode', isEditMode);
      this.set('stage', stage);
      this.set('toggleEditMode', toggleEditMode);
    });

    test('it should render all details about the stage', async function (assert) {
      //when
      const screen = await render(
        hbs`<Stages::Stage @stage={{this.stage}} @toggleEditMode={{this.toggleEditMode}} @isEditMode={{this.isEditMode}} />`
      );

      //then
      assert.dom(screen.getByText('ID : 34', { exact: false })).exists();
      assert.dom(screen.getByText('Niveau : 3', { exact: false })).exists();
      assert.dom(screen.getByText('Titre : palier 3', { exact: false })).exists();
      assert.dom(screen.getByText('Message : mon message', { exact: false })).exists();
    });

    test('it should render the edit button action', async function (assert) {
      // when
      const screen = await render(
        hbs`<Stages::Stage @stage={{this.stage}} @toggleEditMode={{this.toggleEditMode}} @isEditMode={{this.isEditMode}} />`
      );
      // then
      assert.dom(screen.queryByText('Éditer')).exists();
    });
  });
});
