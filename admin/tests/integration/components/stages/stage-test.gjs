import { render } from '@1024pix/ember-testing-library';
import { click } from '@ember/test-helpers';
import Stage from 'pix-admin/components/stages/stage';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | Stage', function (hooks) {
  setupIntlRenderingTest(hooks);
  let component;
  const toggleEditMode = sinon.stub();

  module('when stage is firstSkill', function (hooks) {
    hooks.beforeEach(async function () {
      const isEditMode = false;
      const stage = {
        id: 34,
        threshold: null,
        level: null,
        isFirstSkill: true,
        title: 'palier premier acquis',
        message: 'mon message',
        prescriberTitle: 'titre du prescripteur',
        prescriberDescription: 'description de prescripteur',
      };

      component = <template>
        <Stage @stage={{stage}} @toggleEditMode={{toggleEditMode}} @isEditMode={{isEditMode}} />
      </template>;
    });

    test('should render all details about the stage when the isEditMode is false', async function (assert) {
      //when
      const screen = await render(component);

      //then
      assert.dom(screen.getByRole('button', { name: 'Modifier' })).exists();
      assert.dom(screen.getByText('ID : 34', { exact: false })).exists();
      assert.dom(screen.getByText('1er acquis', { exact: false })).exists();
      assert.dom(screen.getByText('Titre : palier premier acquis', { exact: false })).exists();
      assert.dom(screen.getByText('Message : mon message', { exact: false })).exists();
    });

    test('should call toggleEditMode function when the edit button is clicked', async function (assert) {
      //when
      const screen = await render(component);
      await click(screen.getByRole('button', { name: 'Modifier' }));

      //then
      assert.ok(toggleEditMode.called);
    });
  });

  module('when stage type is threshold', function (hooks) {
    hooks.beforeEach(function () {
      const isEditMode = false;
      const stage = {
        id: 34,
        threshold: 60,
        isTypeLevel: false,
        title: 'palier 3',
        message: 'mon message',
        prescriberTitle: 'titre du prescripteur',
        prescriberDescription: 'description de prescripteur',
      };

      component = <template>
        <Stage @stage={{stage}} @toggleEditMode={{toggleEditMode}} @isEditMode={{isEditMode}} />
      </template>;
    });

    test('should render all details about the stage when the isEditMode is false', async function (assert) {
      //when
      const screen = await render(component);

      //then
      assert.dom(screen.getByRole('button', { name: 'Modifier' })).exists();
      assert.dom(screen.getByText('ID : 34', { exact: false })).exists();
      assert.dom(screen.getByText('Seuil : 60', { exact: false })).exists();
      assert.dom(screen.getByText('Titre : palier 3', { exact: false })).exists();
      assert.dom(screen.getByText('Message : mon message', { exact: false })).exists();
    });

    test('should call toggleEditMode function when the edit button is clicked', async function (assert) {
      //when
      const screen = await render(component);
      await click(screen.getByRole('button', { name: 'Modifier' }));

      //then
      assert.ok(toggleEditMode.called);
    });
  });

  module('when stage type is level', function (hooks) {
    hooks.beforeEach(function () {
      const isEditMode = false;
      const stage = {
        id: 34,
        isTypeLevel: true,
        level: 3,
        title: 'palier 3',
        message: 'mon message',
        prescriberTitle: 'titre du prescripteur',
        prescriberDescription: 'description de prescripteur',
      };

      component = <template>
        <Stage @stage={{stage}} @toggleEditMode={{toggleEditMode}} @isEditMode={{isEditMode}} />
      </template>;
    });

    test('it should render all details about the stage', async function (assert) {
      //when
      const screen = await render(component);

      //then
      assert.dom(screen.getByText('ID : 34', { exact: false })).exists();
      assert.dom(screen.getByText('Niveau : 3', { exact: false })).exists();
      assert.dom(screen.getByText('Titre : palier 3', { exact: false })).exists();
      assert.dom(screen.getByText('Message : mon message', { exact: false })).exists();
    });

    test('it should render the edit button action', async function (assert) {
      // when
      const screen = await render(component);

      // then
      assert.dom(screen.queryByText('Modifier')).exists();
    });
  });

  module('when target profile is linked to a campaign', function () {
    test('should not be possible to edit level or threshold', async function (assert) {
      // given
      const isEditMode = true;
      const hasLinkedCampaign = true;
      const stage = {
        id: 34,
        isTypeLevel: false,
        threshold: 40,
        title: 'palier 3',
        message: 'mon message',
        prescriberTitle: 'titre du prescripteur',
        prescriberDescription: 'description de prescripteur',
      };

      component = <template>
        <Stage
          @stage={{stage}}
          @toggleEditMode={{toggleEditMode}}
          @isEditMode={{isEditMode}}
          @hasLinkedCampaign={{hasLinkedCampaign}}
        />
      </template>;

      // when
      const screen = await render(component);

      // then
      assert.dom(screen.getByRole('spinbutton', { name: /Seuil/ })).hasAttribute('readonly');
    });
  });

  module('when edit mode is true', function (hooks) {
    hooks.beforeEach(async function () {
      const hasLinkedCampaign = true;
      const update = sinon.stub().callsFake(() => {
        return new Promise((resolve) => resolve());
      });
      const stage = {
        id: 34,
        isTypeLevel: false,
        threshold: 40,
        title: 'dummy',
        message: 'dummy',
        prescriberTitle: 'dummy',
        prescriberDescription: 'dummy',
      };

      component = <template>
        <Stage @stage={{stage}} @isEditMode={{true}} @hasLinkedCampaign={{hasLinkedCampaign}} @onUpdate={{update}} />
      </template>;
    });

    test('should render updateStage component when the isEditMode is true', async function (assert) {
      //when
      const screen = await render(component);

      //then
      assert.dom(screen.getByRole('button', { name: 'Annuler' })).exists();
      assert.dom(screen.getByRole('button', { name: 'Enregistrer' })).exists();
      assert.dom(screen.getByRole('textbox', { name: 'Titre pour le prescripteur' })).exists();
    });
  });
});
