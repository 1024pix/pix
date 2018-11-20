import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { click, fillIn, render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import EmberObject from '@ember/object';

module('Integration | Component | campaign-new', function(hooks) {
  setupRenderingTest(hooks);

  test('it should contain an input and validation button', async function(assert) {
    // when
    await render(hbs`{{routes/authenticated/campaign-new}}`);

    // then
    assert.dom('#campaign-name').exists();
    assert.dom('.campaign-form__validation-button').exists();
  });

  test('it should send campaign creation action when submitted', async function(assert) {
    // given
    let receivedCampaign;
    this.set('createCampaignSpy', (campaign) => {
      receivedCampaign = campaign;
    });

    this.set('model', new EmberObject({}));

    // when
    await render(hbs`{{routes/authenticated/campaign-new campaign=model doCreateCampaign=(action createCampaignSpy)}}`);

    // then
    await fillIn('#campaign-name', 'Ma campagne');
    await click('.campaign-form__validation-button');

    assert.deepEqual(receivedCampaign.get('name'), 'Ma campagne');
  });

  test('it should display error message when error occured on registration of one field', async function(assert) {
    // given
    this.set('model', new EmberObject({
      errors: {
        name: [
          {
            message: 'Le message d\'erreur à afficher'
          }
        ]
      }
    }));

    // when
    await render(hbs`{{routes/authenticated/campaign-new campaign=model}}`);

    // then
    assert.dom('.campaign-form__error').exists();
    assert.dom('.campaign-form__error').hasText('Le message d\'erreur à afficher');
  });

  test('should not allow a campaign name with more than 255 char', async function(assert) {
    // when
    await render(hbs`{{routes/authenticated/campaign-new}}`);

    // then
    assert.dom('#campaign-name').hasAttribute('maxLength', "255");
  });

  test('should not allow a campaign title with more than 50 char', async function(assert) {
    // when
    await render(hbs`{{routes/authenticated/campaign-new}}`);

    // then
    assert.dom('#campaign-title').hasAttribute('maxLength', "50");
  });

  test('should not allow a custom landing page text with more than 350 char', async function(assert) {
    // when
    await render(hbs`{{routes/authenticated/campaign-new}}`);

    // then
    assert.dom('#custom-landing-page-text').hasAttribute('maxLength', "350");
  });

});
