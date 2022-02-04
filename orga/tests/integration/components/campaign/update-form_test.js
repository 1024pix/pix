import { module, test } from 'qunit';
import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';
import { fillByLabel, clickByName, render as renderScreen } from '@1024pix/ember-testing-library';
import hbs from 'htmlbars-inline-precompile';
import EmberObject from '@ember/object';
import sinon from 'sinon';

module('Integration | Component | Campaign::UpdateForm', function (hooks) {
  setupIntlRenderingTest(hooks);

  hooks.beforeEach(function () {
    this.campaign = EmberObject.create({ name: 'campaign', isTypeAssessment: true });
    this.set('cancelSpy', () => {});
    this.set('updateCampaignSpy', (event) => event.preventDefault());
  });

  test('[a11y] it should display a message that some inputs are required', async function (assert) {
    // when
    const screen = await renderScreen(
      hbs`<Campaign::UpdateForm @campaign={{this.campaign}} @onSubmit={{this.updateCampaignSpy}} @onCancel={{this.cancelSpy}} />`
    );

    // then
    assert.dom(screen.getByText('indique un champ obligatoire')).exists();
  });

  module('When campaign type is ASSESSMENT', function () {
    test('it should display campaign title input', async function (assert) {
      // given
      this.campaign = EmberObject.create({ isTypeAssessment: true });

      // when
      const screen = await renderScreen(
        hbs`<Campaign::UpdateForm @campaign={{this.campaign}} @onSubmit={{this.updateCampaignSpy}} @onCancel={{this.cancelSpy}} />`
      );

      // then
      assert.dom(screen.getByLabelText('Titre du parcours')).exists();
      assert.dom(screen.getByLabelText('Titre du parcours')).hasAttribute('maxLength', '50');
    });

    test('it should contain inputs, attributes, information block,validation and cancel buttons', async function (assert) {
      // when
      const screen = await renderScreen(
        hbs`<Campaign::UpdateForm @campaign={{this.campaign}} @onSubmit={{this.updateCampaignSpy}} @onCancel={{this.cancelSpy}} />`
      );

      // then
      assert.dom(screen.getByLabelText('* Nom de la campagne')).exists();
      assert.dom(screen.getByLabelText('* Propriétaire de la campagne')).exists();
      assert.dom(screen.getByLabelText("Texte de la page d'accueil")).exists();
      assert.dom(screen.getByLabelText('Titre du parcours')).exists();
      assert.dom(screen.getByText('Modifier')).exists();
      assert.dom(screen.getByText('Annuler')).exists();
    });

    test('it should send campaign update action when submitted', async function (assert) {
      // given
      this.campaign = EmberObject.create({ isTypeAssessment: true, ownerFullName: 'Jon Snow' });
      this.updateCampaignSpy = sinon.stub();

      await renderScreen(
        hbs`<Campaign::UpdateForm @campaign={{this.campaign}} @onSubmit={{this.updateCampaignSpy}} @onCancel={{this.cancelSpy}} />`
      );

      // when
      await fillByLabel('* Nom de la campagne', 'New name');
      await clickByName('Modifier');

      //then
      sinon.assert.called(this.updateCampaignSpy);
      assert.ok(true);
    });

    test('it should display campaign custom landing page input', async function (assert) {
      //when
      const screen = await renderScreen(
        hbs`<Campaign::UpdateForm @campaign={{this.campaign}} @onSubmit={{this.updateCampaignSpy}} @onCancel={{this.cancelSpy}} />`
      );

      //then
      assert.dom(screen.getByLabelText("Texte de la page d'accueil")).hasAttribute('maxLength', '5000');
    });
  });

  module('When campaign type is not ASSESSMENT', function () {
    test('it should not display campaign title input', async function (assert) {
      // given
      this.campaign = EmberObject.create({ isTypeAssessment: false });

      // when
      await renderScreen(
        hbs`<Campaign::UpdateForm @campaign={{this.campaign}} @onSubmit={{this.updateCampaignSpy}} @onCancel={{this.cancelSpy}} />`
      );

      // then
      assert.dom('input#campaign-title').doesNotExist();
    });
  });
  module('Form validations', function () {
    test('it should trim extra spaces written by user from title attibute', async function (assert) {
      // when
      await renderScreen(
        hbs`<Campaign::UpdateForm @campaign={{this.campaign}} @onSubmit={{this.updateCampaignSpy}} @onCancel={{this.cancelSpy}} />`
      );

      await fillByLabel('Titre du parcours', ' text with space ');
      await clickByName('Modifier');

      // then
      assert.deepEqual(this.campaign.title, 'text with space');
    });

    test("it should return 'null' when title attribute is empty", async function (assert) {
      // when
      await renderScreen(
        hbs`<Campaign::UpdateForm @campaign={{this.campaign}} @onSubmit={{this.updateCampaignSpy}} @onCancel={{this.cancelSpy}} />`
      );

      await fillByLabel('Titre du parcours', '');
      await clickByName('Modifier');

      // then
      assert.deepEqual(this.campaign.title, null);
    });

    test('it should trim extra spaces written by user from customLandingPageText attibute', async function (assert) {
      // when
      await renderScreen(
        hbs`<Campaign::UpdateForm @campaign={{this.campaign}} @onSubmit={{this.updateCampaignSpy}} @onCancel={{this.cancelSpy}} />`
      );

      await fillByLabel("Texte de la page d'accueil", ' text with space ');
      await clickByName('Modifier');

      // then
      assert.deepEqual(this.campaign.customLandingPageText, 'text with space');
    });

    test("it should return 'null' when customLandingPageText attribute is empty", async function (assert) {
      // when
      await renderScreen(
        hbs`<Campaign::UpdateForm @campaign={{this.campaign}} @onSubmit={{this.updateCampaignSpy}} @onCancel={{this.cancelSpy}} />`
      );

      await fillByLabel("Texte de la page d'accueil", '');
      await clickByName('Modifier');

      // then
      assert.deepEqual(this.campaign.customLandingPageText, null);
    });
  });
});
