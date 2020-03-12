import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { click, fillIn, render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import EmberObject from '@ember/object';

module('Integration | Component | routes/authenticated/campaign | new-item', function(hooks) {
  setupRenderingTest(hooks);
  let receivedCampaign;

  hooks.beforeEach(function() {
    this.set('createCampaignSpy', (event) => {
      event.preventDefault();
      receivedCampaign = this.model;
    });
    this.set('cancelSpy', () => {});
  });

  test('it should contain inputs, attributes and validation button', async function(assert) {
    // when
    await render(hbs`{{routes/authenticated/campaigns/new-item createCampaign=(action createCampaignSpy) cancel=(action cancelSpy)}}`);

    // then
    assert.dom('#campaign-name').exists();
    assert.dom('button[type="submit"]').exists();
    assert.dom('#campaign-name').hasAttribute('maxLength', '255');
    assert.dom('#campaign-title').hasAttribute('maxLength', '50');
    assert.dom('#custom-landing-page-text').hasAttribute('maxLength', '350');
  });

  test('it should send campaign creation action when submitted', async function(assert) {
    // given
    this.set('model', EmberObject.create({}));
    await render(hbs`{{routes/authenticated/campaigns/new-item campaign=model createCampaign=(action createCampaignSpy) cancel=(action cancelSpy)}}`);
    await fillIn('#campaign-name', 'Ma campagne');

    // when
    await click('button[type="submit"]');

    // then
    assert.deepEqual(receivedCampaign.name, 'Ma campagne');
  });

  test('it should display error message when error occurred on registration of one field', async function(assert) {
    // given
    this.set('model', EmberObject.create({
      errors: {
        name: [
          {
            message: 'Le message d\'erreur à afficher'
          }
        ]
      }
    }));

    // when
    await render(hbs`{{routes/authenticated/campaigns/new-item campaign=model createCampaign=(action createCampaignSpy) cancel=(action cancelSpy)}}`);

    // then
    assert.dom('.form__error').exists();
    assert.dom('.form__error').hasText('Le message d\'erreur à afficher');
  });

});
