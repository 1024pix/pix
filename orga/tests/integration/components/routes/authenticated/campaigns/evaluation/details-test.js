import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | routes/authenticated/campaign/evaluation | details', function(hooks) {
  setupRenderingTest(hooks);

  hooks.beforeEach(function() {
    this.owner.setupRouter();
  });

  test('it should display user information', async function(assert) {
    // given
    const campaignAssessmentParticipation = {
      firstName: 'Jean',
      lastName: 'La fripouille',
    };

    const campaign = {};

    this.campaignAssessmentParticipation = campaignAssessmentParticipation;
    this.campaign = campaign;

    // when
    await render(hbs`<Routes::Authenticated::Campaigns::Evaluation::Details @campaignAssessmentParticipation={{campaignAssessmentParticipation}} @campaign={{campaign}} />`);

    // then
    assert.contains('Jean La fripouille');
  });

  test('it displays campaign participation creation date', async function(assert) {
    const campaignAssessmentParticipation = {
      createdAt: '2020-01-01',
    };

    const campaign = {};

    this.campaignAssessmentParticipation = campaignAssessmentParticipation;
    this.campaign = campaign;

    await render(hbs`<Routes::Authenticated::Campaigns::Evaluation::Details @campaignAssessmentParticipation={{campaignAssessmentParticipation}} @campaign={{campaign}} />`);

    assert.contains('01 janv. 2020');
  });

  test('it displays campaign participation progression', async function(assert) {
    const campaignAssessmentParticipation = {
      progression: 75
    };

    const campaign = {};

    this.campaignAssessmentParticipation = campaignAssessmentParticipation;
    this.campaign = campaign;

    await render(hbs`<Routes::Authenticated::Campaigns::Evaluation::Details @campaignAssessmentParticipation={{campaignAssessmentParticipation}} @campaign={{campaign}} />`);

    assert.contains('75%');
  });

  test('it should navigate', async function(assert) {
    // given
    const user = {
      firstName: 'Jean',
      lastName: 'La fripouille',
    };
    const campaignAssessmentParticipation = { id: 456, user };
    const campaign = { id: 123 };

    this.campaignAssessmentParticipation = campaignAssessmentParticipation;
    this.campaign = campaign;

    // when
    await render(hbs`<Routes::Authenticated::Campaigns::Evaluation::Details @campaignAssessmentParticipation={{campaignAssessmentParticipation}} @campaign={{campaign}} />`);

    // then
    assert.dom(`a[href="/campagnes/${campaign.id}/participants/${campaignAssessmentParticipation.id}/resultats"]`).hasText('Résultats');
    assert.dom(`a[href="/campagnes/${campaign.id}/participants/${campaignAssessmentParticipation.id}/analyse"]`).hasText('Analyse');
  });

  module('shared at', function() {
    module('when the sharing date is present', function() {
      test('it displays the sharing date', async function(assert) {
        const campaignAssessmentParticipation = {
          sharedAt: '2020-01-02'
        };

        const campaign = {};

        this.campaignAssessmentParticipation = campaignAssessmentParticipation;
        this.campaign = campaign;

        await render(hbs`<Routes::Authenticated::Campaigns::Evaluation::Details @campaignAssessmentParticipation={{campaignAssessmentParticipation}} @campaign={{campaign}} />`);

        assert.contains('02 janv. 2020');
      });
    });
    module('when the sharing date is not present', function() {
      test('it displays "non disponible"', async function(assert) {
        const campaignAssessmentParticipation = {};

        const campaign = {};

        this.campaignAssessmentParticipation = campaignAssessmentParticipation;
        this.campaign = campaign;

        await render(hbs`<Routes::Authenticated::Campaigns::Evaluation::Details @campaignAssessmentParticipation={{campaignAssessmentParticipation}} @campaign={{campaign}} />`);

        assert.contains('Non disponible');
      });
    });
  });

  module('identifiant', function() {
    module('when the external id is present', function() {
      test('it displays the external id', async function(assert) {
        const campaignAssessmentParticipation = {
          participantExternalId: 'i12345',
          isShared: false,
        };

        const campaign = { idPixLabel: 'identifiant de l’élève' };

        this.campaignAssessmentParticipation = campaignAssessmentParticipation;
        this.campaign = campaign;

        await render(hbs`<Routes::Authenticated::Campaigns::Evaluation::Details @campaignAssessmentParticipation={{campaignAssessmentParticipation}} @campaign={{campaign}} />`);

        assert.contains('identifiant de l’élève');
        assert.contains('i12345');
      });
    });
    module('when the external id is not present', function() {
      test('it does not display the external id', async function(assert) {
        const campaignAssessmentParticipation = {
          participantExternalId: null,
          isShared: false
        };

        const campaign = {};

        this.campaignAssessmentParticipation = campaignAssessmentParticipation;
        this.campaign = campaign;

        await render(hbs`<Routes::Authenticated::Campaigns::Evaluation::Details @campaignAssessmentParticipation={{campaignAssessmentParticipation}} @campaign={{campaign}} />`);

        assert.dom('li').exists({ count: 3 });
      });
    });
  });

  module('results information', function() {
    module('when the participation is shared', function() {
      test('it displays campaign participation mastery percentage', async function(assert) {
        const campaignAssessmentParticipation = {
          masteryPercentage: 65,
          isShared: true
        };

        const campaign = {};

        this.campaignAssessmentParticipation = campaignAssessmentParticipation;
        this.campaign = campaign;

        await render(hbs`<Routes::Authenticated::Campaigns::Evaluation::Details @campaignAssessmentParticipation={{campaignAssessmentParticipation}} @campaign={{campaign}} />`);

        assert.contains('65%');
      });

      test('it displays campaign participation details of mastery percentage (validated skills over total skills)', async function(assert) {
        const campaignAssessmentParticipation = {
          validatedSkillsCount: 45,
          totalSkillsCount: 50,
          isShared: true
        };

        const campaign = {};

        this.campaignAssessmentParticipation = campaignAssessmentParticipation;
        this.campaign = campaign;

        await render(hbs`<Routes::Authenticated::Campaigns::Evaluation::Details @campaignAssessmentParticipation={{campaignAssessmentParticipation}} @campaign={{campaign}} />`);

        assert.dom('[aria-label="Résultat"]').containsText('45 / 50 ACQUIS');
      });
    });

    module('when the participation is not shared', function() {
      test('it does not display results', async function(assert) {
        const campaignAssessmentParticipation = {
          isShared: false
        };

        const campaign = {};

        this.campaignAssessmentParticipation = campaignAssessmentParticipation;
        this.campaign = campaign;

        await render(hbs`<Routes::Authenticated::Campaigns::Evaluation::Details @campaignAssessmentParticipation={{campaignAssessmentParticipation}} @campaign={{campaign}} />`);

        assert.dom('[aria-label="Résultat"]').doesNotExist();
      });
    });
  });
});
