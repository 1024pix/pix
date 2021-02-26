import { module, test } from 'qunit';
import { render } from '@ember/test-helpers';
import fillInByLabel from '../../../../../helpers/extended-ember-test-helpers/fill-in-by-label';
import clickByLabel from '../../../../../helpers/extended-ember-test-helpers/click-by-label';
import hbs from 'htmlbars-inline-precompile';
import EmberObject from '@ember/object';
import Service from '@ember/service';
import setupIntlRenderingTest from '../../../../../helpers/setup-intl-rendering';

module('Integration | Component | routes/authenticated/campaign/new', function(hooks) {
  setupIntlRenderingTest(hooks);
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
    assert.contains('Nom de la campagne');
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
      assert.contains('Titre du parcours');
      assert.contains('Que souhaitez-vous tester ?');
    });

    test('it should not contain field to select campaign type', async function(assert) {
      // given
      this.campaign = EmberObject.create({});

      // when
      await render(hbs`<Routes::Authenticated::Campaign::New @campaign={{campaign}} @createCampaign={{createCampaignSpy}} @cancel={{cancelSpy}}/>`);

      // then
      assert.notContains('Évaluer les participants');
      assert.notContains('Collecter les profils Pix des participants');
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
      await clickByLabel('Évaluer les participants');

      // then
      assert.contains('Titre du parcours');
      assert.contains('Que souhaitez-vous tester ?');
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
      await clickByLabel('Collecter les profils Pix des participants');

      // then
      assert.notContains('Titre du parcours');
      assert.notContains('Que souhaitez-vous tester ?');
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
      assert.dom('a[href="https://cloud.pix.fr/s/3joGMGYWSpmHg5w"]').hasText('la documentation correspondante');
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
      assert.dom('a[href="https://cloud.pix.fr/s/3joGMGYWSpmHg5w"]').doesNotExist();
    });
  });

  module('when user has not chosen yet to ask or not an external user ID', function() {
    test('it should not display gdpr footnote', async function(assert) {
      //given
      this.campaign = EmberObject.create({});

      // when
      await render(hbs`<Routes::Authenticated::Campaign::New @campaign={{campaign}} @createCampaign={{createCampaignSpy}} @cancel={{cancelSpy}}/>`);

      // then
      assert.notContains('* En vertu de la loi Informatique et libertés, et en tant que responsable de traitement, soyez attentifs à ne pas demander de donnée particulièrement identifiante ou signifiante si ce n’est pas absolument indispensable. Le numéro de sécurité sociale (NIR) est à proscrire ainsi que toute donnée sensible.');
    });
  });

  module('when user choose not to ask an external user ID', function() {
    test('it should not display gdpr footnote either', async function(assert) {
      //given
      this.campaign = EmberObject.create({});

      // when
      await render(hbs`<Routes::Authenticated::Campaign::New @campaign={{campaign}} @createCampaign={{createCampaignSpy}} @cancel={{cancelSpy}}/>`);
      await clickByLabel('No');

      // then
      assert.notContains('* En vertu de la loi Informatique et libertés, et en tant que responsable de traitement, soyez attentifs à ne pas demander de donnée particulièrement identifiante ou signifiante si ce n’est pas absolument indispensable. Le numéro de sécurité sociale (NIR) est à proscrire ainsi que toute donnée sensible.');
    });
  });

  module('when user choose to ask an external user ID', function() {
    test('it should display gdpr footnote', async function(assert) {
      //given
      this.campaign = EmberObject.create({});

      // when
      await render(hbs`<Routes::Authenticated::Campaign::New @campaign={{campaign}} @createCampaign={{createCampaignSpy}} @cancel={{cancelSpy}}/>`);
      await clickByLabel('Oui');

      // then
      assert.contains('* En vertu de la loi Informatique et libertés, et en tant que responsable de traitement, soyez attentifs à ne pas demander de donnée particulièrement identifiante ou signifiante si ce n’est pas absolument indispensable. Le numéro de sécurité sociale (NIR) est à proscrire ainsi que toute donnée sensible.');
    });
  });

  test('it should send campaign creation action when submitted', async function(assert) {
    // given
    this.campaign = EmberObject.create({});
    await render(hbs`<Routes::Authenticated::Campaign::New @campaign={{campaign}} @createCampaign={{createCampaignSpy}} @cancel={{cancelSpy}}/>`);
    await fillInByLabel('Nom de la campagne', 'Ma campagne');

    // when
    await clickByLabel('Créer la campagne');

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
      await clickByLabel('Oui');

      // then
      assert.contains('Veuillez donner un nom à votre campagne.');
      assert.contains('Veuillez choisir l’objectif de votre campagne : Évaluation ou Collecte de profils.');
      assert.contains('Veuillez préciser le libellé du champ qui sera demandé à vos participants au démarrage du parcours.');
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
      assert.contains('Veuillez sélectionner un profil cible pour votre campagne.');
    });
  });
});
