import { module, test } from 'qunit';
import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';
import { fillByLabel, clickByName, render as renderScreen } from '@1024pix/ember-testing-library';
import hbs from 'htmlbars-inline-precompile';
import EmberObject from '@ember/object';

module('Integration | Component | Campaign::UpdateForm', function (hooks) {
  setupIntlRenderingTest(hooks);

  hooks.beforeEach(function () {
    this.campaign = EmberObject.create({ isTypeAssessment: true });
    this.set('updateCampaignSpy', (event) => event.preventDefault());
    this.set('cancelSpy', () => {});
  });

  test('it should contain inputs, attributes and validation button', async function (assert) {
    // when
    await renderScreen(
      hbs`<Campaign::UpdateForm @campaign={{this.campaign}} @onSubmit={{this.updateCampaignSpy}} @onCancel={{this.cancelSpy}} />`
    );

    // then
    assert.dom('#campaign-custom-landing-page-text').exists();
    assert.dom('button[type="submit"]').exists();
    assert.dom('#campaign-custom-landing-page-text').hasAttribute('maxLength', '5000');
  });

  test('[a11y] it should display a message that some inputs are required', async function (assert) {
    // when
    const screen = await renderScreen(
      hbs`<Campaign::UpdateForm @campaign={{this.campaign}} @onSubmit={{this.updateCampaignSpy}} @onCancel={{this.cancelSpy}} />`
    );

    // then
    assert.dom(screen.getByText('indique un champ obligatoire')).exists();
  });

  test('it should send campaign update action when submitted', async function (assert) {
    // when
    await renderScreen(
      hbs`<Campaign::UpdateForm @campaign={{this.campaign}} @onSubmit={{this.updateCampaignSpy}} @onCancel={{this.cancelSpy}} />`
    );

    // then
    await fillByLabel('Titre du parcours', 'New title');
    await clickByName('Modifier');

    assert.deepEqual(this.campaign.title, 'New title');
  });

  module('When campaign type is ASSESSMENT', function () {
    test('it should display campaign title input', async function (assert) {
      this.campaign = EmberObject.create({ isTypeAssessment: true });

      await renderScreen(
        hbs`<Campaign::UpdateForm @campaign={{this.campaign}} @onSubmit={{this.updateCampaignSpy}} @onCancel={{this.cancelSpy}} />`
      );

      assert.dom('input#campaign-title').exists();
      assert.dom('#campaign-title').hasAttribute('maxLength', '50');
    });
  });

  module('When campaign type is not ASSESSMENT', function () {
    test('it should not display campaign title input', async function (assert) {
      this.campaign = EmberObject.create({ isTypeAssessment: false });

      await renderScreen(
        hbs`<Campaign::UpdateForm @campaign={{this.campaign}} @onSubmit={{this.updateCampaignSpy}} @onCancel={{this.cancelSpy}} />`
      );

      assert.dom('input#campaign-title').doesNotExist();
    });
  });
});
