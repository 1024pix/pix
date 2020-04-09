import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { click, fillIn, render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import EmberObject from '@ember/object';
import Service from '@ember/service';

class CurrentUserStub extends Service {
  organization = {
    canCollectProfiles: false
  }
}

module('Integration | Component | routes/authenticated/campaign | new-item', function(hooks) {
  setupRenderingTest(hooks);
  let receivedCampaign;

  hooks.beforeEach(function() {
    this.set('createCampaignSpy', (event) => {
      event.preventDefault();
      receivedCampaign = this.model;
    });
    this.set('cancelSpy', () => {});
    this.owner.register('service:current-user', CurrentUserStub);
  });

  test('it should contain inputs, attributes and validation button', async function(assert) {
    // when
    await render(hbs`<Routes::Authenticated::Campaigns::NewItem @createCampaign={{action createCampaignSpy}} @cancel={{action cancelSpy}}/>`);

    // then
    assert.dom('#campaign-name').exists();
    assert.dom('button[type="submit"]').exists();
    assert.dom('#campaign-name').hasAttribute('maxLength', '255');
    assert.dom('#custom-landing-page-text').hasAttribute('maxLength', '350');
  });

  module('when user cannot create campaign of type PROFILES_COLLECTION', function() {

    test('it should display fields for campaign title and target profile by default', async function(assert) {
      // given
      this.currentUser = this.owner.lookup('service:current-user');
      this.set('currentUser.organization.canCollectProfiles', false);

      // when
      await render(hbs`<Routes::Authenticated::Campaigns::NewItem @createCampaign={{action createCampaignSpy}} @cancel={{action cancelSpy}}/>`);

      // then
      assert.dom('#campaign-title').exists();
      assert.dom('#campaign-target-profile').exists();
    });

    test('it should not contain field to select campaign type', async function(assert) {
      // given
      this.currentUser = this.owner.lookup('service:current-user');
      this.set('currentUser.organization.canCollectProfiles', false);

      // when
      await render(hbs`<Routes::Authenticated::Campaigns::NewItem @createCampaign={{action createCampaignSpy}} @cancel={{action cancelSpy}}/>`);

      // then
      assert.dom('#assess-participants').doesNotExist();
      assert.dom('#collect-participants-profile').doesNotExist();
    });
  });

  module('when user choose to create a campaign of type ASSESSMENT', function() {

    test('it should display fields for campaign title and target profile', async function(assert) {
      // given
      this.currentUser = this.owner.lookup('service:current-user');
      this.set('currentUser.organization.canCollectProfiles', true);

      // when
      await render(hbs`<Routes::Authenticated::Campaigns::NewItem @createCampaign={{action createCampaignSpy}} @cancel={{action cancelSpy}}/>`);
      await click('#assess-participants');

      // then
      assert.dom('#campaign-title').exists();
      assert.dom('#campaign-target-profile').exists();
    });
  });

  module('when user choose to create a campaign of type PROFILES_COLLECTION', () => {

    test('it should not display fields for campaign title and target profile', async function(assert) {
      // given
      this.currentUser = this.owner.lookup('service:current-user');
      this.set('currentUser.organization.canCollectProfiles', true);

      // when
      await render(hbs`<Routes::Authenticated::Campaigns::NewItem @createCampaign={{action createCampaignSpy}} @cancel={{action cancelSpy}}/>`);
      await click('#collect-participants-profile');

      // then
      assert.dom('#campaign-title').doesNotExist();
      assert.dom('#campaign-target-profile').doesNotExist();
    });
  });

  module('when user‘s organization is SCO and is managing student', function() {

    test('it should display comment for target profile selection', async function(assert) {
      // given
      this.currentUser = this.owner.lookup('service:current-user');
      this.set('currentUser.organization.isSCO', true);
      this.set('currentUser.organization.isManagingStudents', true);

      // when
      await render(hbs`<Routes::Authenticated::Campaigns::NewItem @createCampaign={{action createCampaignSpy}} @cancel={{action cancelSpy}}/>`);

      // then
      assert.dom('#campaign-target-profile-comment-label').exists();
    });
  });

  module('when user‘s organization is SCO but is not managing student', function() {

    test('it should not display comment for target profile selection', async function(assert) {
      // given
      this.currentUser = this.owner.lookup('service:current-user');
      this.set('currentUser.organization.isSCO', true);
      this.set('currentUser.organization.isManagingStudents', false);

      // when
      await render(hbs`<Routes::Authenticated::Campaigns::NewItem @createCampaign={{action createCampaignSpy}} @cancel={{action cancelSpy}}/>`);

      // then
      assert.dom('#campaign-target-profile-comment-label').doesNotExist();
    });
  });

  module('when user‘s organization is not SCO but is managing student', function() {

    /* eslint-disable-next-line mocha/no-identical-title */
    test('it should not display comment for target profile selection', async function(assert) {
      // given
      this.currentUser = this.owner.lookup('service:current-user');
      this.set('currentUser.organization.isSCO', false);
      this.set('currentUser.organization.isManagingStudents', true);

      // when
      await render(hbs`<Routes::Authenticated::Campaigns::NewItem @createCampaign={{action createCampaignSpy}} @cancel={{action cancelSpy}}/>`);

      // then
      assert.dom('#campaign-target-profile-comment-label').doesNotExist();
    });
  });

  test('it should send campaign creation action when submitted', async function(assert) {
    // given
    this.set('model', EmberObject.create({}));
    await render(hbs`<Routes::Authenticated::Campaigns::NewItem @campaign={{model}} @createCampaign={{action createCampaignSpy}} @cancel={{action cancelSpy}}/>`);
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
    await render(hbs`<Routes::Authenticated::Campaigns::NewItem @campaign={{model}} @createCampaign={{action createCampaignSpy}} @cancel={{action cancelSpy}}/>`);

    // then
    assert.dom('.form__error').exists();
    assert.dom('.form__error').hasText('Le message d\'erreur à afficher');
  });

});
