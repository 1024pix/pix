import { module, test } from 'qunit';
import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';
import { fillByLabel, clickByName, render as renderScreen } from '@1024pix/ember-testing-library';
import hbs from 'htmlbars-inline-precompile';
import EmberObject from '@ember/object';

module('Integration | Component | Campaign::UpdateForm', function (hooks) {
  setupIntlRenderingTest(hooks);

  hooks.beforeEach(function () {
    this.set('updateCampaignSpy', (event) => event.preventDefault());
    this.set('cancelSpy', () => {});
  });

  test('it should contain inputs, attributes, information block, and validation button', async function (assert) {
    // when
    const screen = await renderScreen(
      hbs`<Campaign::UpdateForm @campaign={{this.campaign}} @onSubmit={{this.updateCampaignSpy}} @onCancel={{this.cancelSpy}} />`
    );

    // then
    assert.dom(screen.getByLabelText('* Nom de la campagne')).exists();
    assert.dom(screen.getByLabelText('* Propriétaire de la campagne')).exists();
    assert.dom(screen.getByText('Propriétaire de la campagne', { selector: 'span' })).exists();
    assert.dom(screen.getByLabelText("Texte de la page d'accueil")).exists();
    assert.dom(screen.getByLabelText("Texte de la page d'accueil")).hasAttribute('maxLength', '5000');
    assert.dom(screen.getByText('Modifier')).exists();
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

    test('it should send campaign update action when submitted', async function (assert) {
      // given
      this.campaign = EmberObject.create({ isTypeAssessment: true });

      await renderScreen(
        hbs`<Campaign::UpdateForm @campaign={{this.campaign}} @onSubmit={{this.updateCampaignSpy}} @onCancel={{this.cancelSpy}} />`
      );

      // when
      await fillByLabel('Titre du parcours', 'New title');
      await clickByName('Modifier');

      // then
      assert.deepEqual(this.campaign.title, 'New title');
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
});
