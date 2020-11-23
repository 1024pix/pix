import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { click, fillIn, render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import EmberObject from '@ember/object';
import Service from '@ember/service';

module('Integration | Component | routes/authenticated/campaign/new', function(hooks) {
  setupRenderingTest(hooks);
  let receivedCampaign;

  hooks.beforeEach(function() {
    this.set('createCampaignSpy', (event) => {
      event.preventDefault();
      receivedCampaign = this.campaign;
    });
    this.set('cancelSpy', () => {});
    class CurrentUserStub extends Service {
      organization = EmberObject.create({ canCollectProfiles: false });
    }
    this.owner.register('service:current-user', CurrentUserStub);
  });

  test('it should contain inputs, attributes and validation button', async function(assert) {
    // given
    this.campaign = EmberObject.create({});

    // when
    await render(hbs`<Routes::Authenticated::Campaign::New @campaign={{campaign}} @createCampaign={{createCampaignSpy}} @cancel={{cancelSpy}}/>`);

    // then
    assert.dom('#campaign-name').exists();
    assert.dom('button[type="submit"]').exists();
    assert.dom('#campaign-name').hasAttribute('maxLength', '255');
    assert.dom('#custom-landing-page-text').hasAttribute('maxLength', '350');
  });

  module('when user cannot create campaign of type PROFILES_COLLECTION', function() {

    test('it should display fields for campaign title and target profile by default', async function(assert) {
      // given
      this.campaign = EmberObject.create({});

      // when
      await render(hbs`<Routes::Authenticated::Campaign::New @campaign={{campaign}} @createCampaign={{createCampaignSpy}} @cancel={{cancelSpy}}/>`);

      // then
      assert.dom('#campaign-title').exists();
      assert.dom('#campaign-target-profile').exists();
    });

    test('it should not contain field to select campaign type', async function(assert) {
      // given
      this.campaign = EmberObject.create({});

      // when
      await render(hbs`<Routes::Authenticated::Campaign::New @campaign={{campaign}} @createCampaign={{createCampaignSpy}} @cancel={{cancelSpy}}/>`);

      // then
      assert.dom('#assess-participants').doesNotExist();
      assert.dom('#collect-participants-profile').doesNotExist();
    });
  });

  module('when user choose to create a campaign of type ASSESSMENT', function() {

    test('it should display fields for campaign title and target profile', async function(assert) {
      // given
      class CurrentUserStub extends Service {
        organization = EmberObject.create({ canCollectProfiles: true });
      }
      this.owner.register('service:current-user', CurrentUserStub);
      this.campaign = EmberObject.create({});

      // when
      await render(hbs`<Routes::Authenticated::Campaign::New @campaign={{campaign}} @createCampaign={{createCampaignSpy}} @cancel={{cancelSpy}}/>`);
      await click('#assess-participants');

      // then
      assert.dom('#campaign-title').exists();
      assert.dom('#campaign-target-profile').exists();
    });
  });

  module('when user choose to create a campaign of type PROFILES_COLLECTION', () => {

    test('it should not display fields for campaign title and target profile', async function(assert) {
      // given
      class CurrentUserStub extends Service {
        organization = EmberObject.create({ canCollectProfiles: true });
      }
      this.owner.register('service:current-user', CurrentUserStub);
      this.campaign = EmberObject.create({});

      // when
      await render(hbs`<Routes::Authenticated::Campaign::New @campaign={{campaign}} @createCampaign={{createCampaignSpy}} @cancel={{cancelSpy}}/>`);
      await click('#collect-participants-profile');

      // then
      assert.dom('#campaign-title').doesNotExist();
      assert.dom('#campaign-target-profile').doesNotExist();
    });
  });

  module('when user‘s organization is SCO and is managing student', function() {

    test('it should display comment for target profile selection', async function(assert) {
      // given
      class CurrentUserStub extends Service {
        organization = EmberObject.create({ canCollectProfiles: false });
        isSCOManagingStudents = true;
      }
      this.owner.register('service:current-user',  CurrentUserStub);
      this.campaign = EmberObject.create({});

      // when
      await render(hbs`<Routes::Authenticated::Campaign::New @campaign={{campaign}} @createCampaign={{createCampaignSpy}} @cancel={{cancelSpy}}/>`);

      // then
      assert.dom('#campaign-target-profile-comment-label').exists();
    });
  });

  module('when user‘s organization is not (SCO and managing student)', function() {

    test('it should not display comment for target profile selection', async function(assert) {
      // given
      class CurrentUserStub extends Service {
        organization = EmberObject.create({ canCollectProfiles: false });
        isSCOManagingStudents = false;
      }
      this.owner.register('service:current-user',  CurrentUserStub);
      this.campaign = EmberObject.create({});

      // when
      await render(hbs`<Routes::Authenticated::Campaign::New @campaign={{campaign}} @createCampaign={{createCampaignSpy}} @cancel={{cancelSpy}}/>`);

      // then
      assert.dom('#campaign-target-profile-comment-label').doesNotExist();
    });
  });

  module('when organization is a type SCO and user is creating an assessment campaign', function() {
    test('it should display documentation of school paths', async function(assert) {
      // given
      class CurrentUserStub extends Service {
        organization = EmberObject.create();
        isSCOManagingStudents = true;
      }
      this.owner.register('service:current-user',  CurrentUserStub);
      this.campaign = EmberObject.create({});

      // when
      await render(hbs`<Routes::Authenticated::Campaign::New @campaign={{campaign}} @createCampaign={{createCampaignSpy}} @cancel={{cancelSpy}}/>`);

      // then
      assert.dom('a[href="https://cloud.pix.fr/s/3joGMGYWSpmHg5w"]').exists();
    });
  });

  test('it should send campaign creation action when submitted', async function(assert) {
    // given
    this.campaign = EmberObject.create({});
    await render(hbs`<Routes::Authenticated::Campaign::New @campaign={{campaign}} @createCampaign={{createCampaignSpy}} @cancel={{cancelSpy}}/>`);
    await fillIn('#campaign-name', 'Ma campagne');

    // when
    await click('button[type="submit"]');

    // then
    assert.deepEqual(receivedCampaign.name, 'Ma campagne');
  });

  test('it should display error message when error occurred on registration of one field', async function(assert) {
    // given
    this.set('campaign', EmberObject.create({
      errors: {
        name: [
          {
            message: 'Le message d\'erreur à afficher',
          },
        ],
      },
    }));

    // when
    await render(hbs`<Routes::Authenticated::Campaign::New @campaign={{campaign}} @createCampaign={{createCampaignSpy}} @cancel={{cancelSpy}}/>`);

    // then
    assert.dom('.form__error').exists();
    assert.dom('.form__error').hasText('Le message d\'erreur à afficher');
  });

});
