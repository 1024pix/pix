import { module, test } from 'qunit';
import { render } from '@ember/test-helpers';
import fillInByLabel from '../../../../../helpers/extended-ember-test-helpers/fill-in-by-label';
import clickByLabel from '../../../../../helpers/extended-ember-test-helpers/click-by-label';
import hbs from 'htmlbars-inline-precompile';
import EmberObject from '@ember/object';
import Service from '@ember/service';
import { setupRenderingTest } from 'ember-qunit';
import { setupIntl, t } from 'ember-intl/test-support';

module('Integration | Component | routes/authenticated/campaign/new', function(hooks) {
  setupRenderingTest(hooks);
  setupIntl(hooks);
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
    assert.contains(t('pages.campaign-creation.name.label'));
    assert.dom('button[type="submit"]').exists();
    assert.dom('input[type=text]').hasAttribute('maxLength', '255');
    assert.dom('textarea').hasAttribute('maxLength', '350');
  });

  module('when user cannot create campaign of type PROFILES_COLLECTION', function() {

    test('it should display fields for campaign title and target profile by default', async function(assert) {
      // given
      this.campaign = EmberObject.create({});

      // when
      await render(hbs`<Routes::Authenticated::Campaign::New @campaign={{campaign}} @createCampaign={{createCampaignSpy}} @cancel={{cancelSpy}}/>`);

      // then
      assert.contains(t('pages.campaign-creation.test-title.label'));
      assert.contains(t('pages.campaign-creation.target-profiles-list.label'));
    });

    test('it should not contain field to select campaign type', async function(assert) {
      // given
      this.campaign = EmberObject.create({});

      // when
      await render(hbs`<Routes::Authenticated::Campaign::New @campaign={{campaign}} @createCampaign={{createCampaignSpy}} @cancel={{cancelSpy}}/>`);

      // then
      assert.notContains(t('pages.campaign-creation.purpose.assessment'));
      assert.notContains(t('pages.campaign-creation.purpose.profiles-collection'));
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
      await clickByLabel(t('pages.campaign-creation.purpose.assessment'));

      // then
      assert.contains(t('pages.campaign-creation.test-title.label'));
      assert.contains(t('pages.campaign-creation.purpose.label'));
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
      await clickByLabel(t('pages.campaign-creation.purpose.profiles-collection'));

      // then
      assert.notContains(t('pages.campaign-creation.test-title.label'));
      assert.notContains(t('pages.campaign-creation.target-profiles-list.label'));
    });
  });

  module('when user‘s organization is SCO and is managing student and user is creating an assessment campaign', function() {

    test('it should display comment for target profile selection', async function(assert) {
      // given
      class CurrentUserStub extends Service {
        organization = EmberObject.create({ canCollectProfiles: false });
        isSCOManagingStudents = true;
      }
      this.owner.register('service:current-user', CurrentUserStub);
      this.campaign = EmberObject.create({});

      // when
      await render(hbs`<Routes::Authenticated::Campaign::New @campaign={{campaign}} @createCampaign={{createCampaignSpy}} @cancel={{cancelSpy}}/>`);

      // then
      assert.contains(t('pages.campaign-creation.target-profile-informations'));
    });
  });

  module('when user‘s organization is not (SCO and managing student) user is creating an assessment campaign', function() {

    test('it should not display comment for target profile selection', async function(assert) {
      // given
      class CurrentUserStub extends Service {
        organization = EmberObject.create({ canCollectProfiles: false });
        isSCOManagingStudents = false;
      }
      this.owner.register('service:current-user', CurrentUserStub);
      this.campaign = EmberObject.create({});

      // when
      await render(hbs`<Routes::Authenticated::Campaign::New @campaign={{campaign}} @createCampaign={{createCampaignSpy}} @cancel={{cancelSpy}}/>`);

      // then
      assert.notContains(t('pages.campaign-creation.target-profile-informations'));
    });
  });

  module('when user has not chosen yet to ask or not an external user ID', function() {
    test('it should not display gdpr footnote', async function(assert) {
      //given
      this.campaign = EmberObject.create({});

      // when
      await render(hbs`<Routes::Authenticated::Campaign::New @campaign={{campaign}} @createCampaign={{createCampaignSpy}} @cancel={{cancelSpy}}/>`);

      // then
      assert.notContains(t('pages.campaign-creation.legal-warning'));
    });
  });

  module('when user choose not to ask an external user ID', function() {
    test('it should not display gdpr footnote either', async function(assert) {
      //given
      this.campaign = EmberObject.create({});

      // when
      await render(hbs`<Routes::Authenticated::Campaign::New @campaign={{campaign}} @createCampaign={{createCampaignSpy}} @cancel={{cancelSpy}}/>`);
      await clickByLabel(t('pages.campaign-creation.no'));

      // then
      assert.notContains(t('pages.campaign-creation.legal-warning'));
    });
  });

  module('when user choose to ask an external user ID', function() {
    test('it should display gdpr footnote', async function(assert) {
      //given
      this.campaign = EmberObject.create({});

      // when
      await render(hbs`<Routes::Authenticated::Campaign::New @campaign={{campaign}} @createCampaign={{createCampaignSpy}} @cancel={{cancelSpy}}/>`);
      await clickByLabel(t('pages.campaign-creation.yes'));

      // then
      assert.contains(t('pages.campaign-creation.legal-warning'));
    });
  });

  test('it should send campaign creation action when submitted', async function(assert) {
    // given
    this.campaign = EmberObject.create({});
    await render(hbs`<Routes::Authenticated::Campaign::New @campaign={{campaign}} @createCampaign={{createCampaignSpy}} @cancel={{cancelSpy}}/>`);
    await fillInByLabel(t('pages.campaign-creation.name.label'), 'Ma campagne');

    // when
    await clickByLabel(t('pages.campaign-creation.actions.create'));

    // then
    assert.deepEqual(receivedCampaign.name, 'Ma campagne');
  });

  module('when there are errors', function() {
    test('it should display errors messages when the name, the campaign purpose and the external user id fields are empty ', async function(assert) {
      // given
      class CurrentUserStub extends Service {
        organization = EmberObject.create({ canCollectProfiles: true });
      }
      this.owner.register('service:current-user', CurrentUserStub);
      this.set('campaign', EmberObject.create({
        errors: {
          name: [
            {
              message: 'CAMPAIGN_NAME_IS_REQUIRED',
            },
          ],
          idPixLabel: [
            {
              message: 'EXTERNAL_USER_ID_IS_REQUIRED',
            },
          ],
          type: [
            {
              message: 'CAMPAIGN_PURPOSE_IS_REQUIRED',
            },
          ],
        },
      }));

      // when
      await render(hbs`<Routes::Authenticated::Campaign::New @campaign={{campaign}} @createCampaign={{createCampaignSpy}} @cancel={{cancelSpy}}/>`);
      await clickByLabel(t('pages.campaign-creation.yes'));

      // then
      assert.contains(t('api-errors-messages.campaign-creation.name-required'));
      assert.contains(t('api-errors-messages.campaign-creation.purpose-required'));
      assert.contains(t('api-errors-messages.campaign-creation.external-user-id-required'));
    });

    test('it should display errors messages when the target profile field is empty', async function(assert) {
      // given
      this.set('campaign', EmberObject.create({
        errors: {
          targetProfile: [
            {
              message: 'TARGET_PROFILE_IS_REQUIRED',
            },
          ],
        },
      }));

      // when
      await render(hbs`<Routes::Authenticated::Campaign::New @campaign={{campaign}} @createCampaign={{createCampaignSpy}} @cancel={{cancelSpy}}/>`);

      // then
      assert.contains(t('api-errors-messages.campaign-creation.target-profile-required'));
    });
  });
});
