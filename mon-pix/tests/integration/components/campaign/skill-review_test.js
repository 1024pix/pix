import { module, test } from 'qunit';
import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';
import { render } from '@1024pix/ember-testing-library';
import { hbs } from 'ember-cli-htmlbars';
import { click } from '@ember/test-helpers';
import ENV from 'mon-pix/config/environment';

module('Integration | Component | Campaign | skill-review', function (hooks) {
  setupIntlRenderingTest(hooks);
  let model;
  const autonomousCourseOrganizationId = ENV.APP.AUTONOMOUS_COURSES_ORGANIZATION_ID;

  hooks.beforeEach(function () {
    const store = this.owner.lookup('service:store');
    this.owner.setupRouter();

    const competenceResults = [
      store.createRecord('competence-result', {
        name: 'Faire des câlins',
        flashPixScore: 23,
        areaColor: 'jaffa',
      }),
    ];
    model = {
      campaign: store.createRecord('campaign', {
        isFlash: true,
        code: 'CODECAMPAIGN',
      }),
      campaignParticipationResult: store.createRecord('campaign-participation-result', {
        id: 12345,
        flashPixScore: 122,
        competenceResults,
        campaignParticipationBadges: [],
      }),
      trainings: {},
    };
  });

  test('it should display a list of competences and their scores', async function (assert) {
    // given
    this.set('model', model);

    // when
    const screen = await render(hbs`<Routes::Campaigns::Assessment::SkillReview @model={{this.model}} />`);

    // then
    assert.dom(screen.getByText('Compétences testées')).exists();
    assert.dom(screen.getByRole('rowheader', { name: 'Faire des câlins' })).exists();
    assert.dom(screen.getByRole('cell', { name: '23 Pix' })).exists();
  });

  test('display retry button', async function (assert) {
    model.campaignParticipationResult.set('canRetry', true);
    model.campaignParticipationResult.set('isDisabled', false);
    model.campaignParticipationResult.set('isShared', true);

    this.set('model', model);

    // when
    const screen = await render(hbs`<Routes::Campaigns::Assessment::SkillReview @model={{this.model}} />`);

    const linkButton = screen.getByRole('link', { name: 'Repasser mon parcours' });
    assert.dom(linkButton).exists();
    assert.dom(linkButton).hasAttribute('href', '/campagnes/CODECAMPAIGN?retry=true');

    assert.dom(screen.queryByRole('button', { name: 'Remettre à zéro et tout retenter' })).doesNotExist();
  });

  module('#displayOrganizationCustomMessage', function () {
    test('display Organization Custom Message when participation is shared', async function (assert) {
      const customResultPageText = 'Je suis Iron Man';
      model.campaignParticipationResult.set('isShared', true);
      model.campaign.set('customResultPageText', customResultPageText);

      this.set('model', model);

      // when
      const screen = await render(hbs`<Routes::Campaigns::Assessment::SkillReview @model={{this.model}} />`);

      assert.ok(screen.getByText(customResultPageText));
    });

    test('display Organization Custom Message when campaign isForAbsoluteNovice', async function (assert) {
      const customResultPageText = "je s'appelle groot";
      model.campaignParticipationResult.set('isShared', false);
      model.campaign.set('customResultPageText', customResultPageText);
      model.campaign.set('isForAbsoluteNovice', true);

      this.set('model', model);

      // when
      const screen = await render(hbs`<Routes::Campaigns::Assessment::SkillReview @model={{this.model}} />`);

      assert.ok(screen.getByText(customResultPageText));
    });

    test('display Organization Custom button when participation is shared', async function (assert) {
      const customResultPageButtonText = 'Je suis Iron Man';
      const customResultPageButtonUrl = 'http://jesuisunbouton.fr/';
      model.campaignParticipationResult.set('isShared', true);
      model.campaign.set('customResultPageButtonUrl', customResultPageButtonUrl);
      model.campaign.set('customResultPageButtonText', customResultPageButtonText);

      this.set('model', model);

      // when
      const screen = await render(hbs`<Routes::Campaigns::Assessment::SkillReview @model={{this.model}} />`);

      assert
        .dom(screen.getByRole('link', { name: customResultPageButtonText }))
        .hasAttribute('href', customResultPageButtonUrl);
    });

    test('display Organization Custom button when campaign isForAbsoluteNovice', async function (assert) {
      const customResultPageButtonText = 'je suis un bouton';
      const customResultPageButtonUrl = 'http://jesuisunbouton.fr/';
      model.campaignParticipationResult.set('isShared', false);
      model.campaign.set('customResultPageButtonUrl', customResultPageButtonUrl);
      model.campaign.set('customResultPageButtonText', customResultPageButtonText);
      model.campaign.set('isForAbsoluteNovice', true);

      this.set('model', model);

      // when
      const screen = await render(hbs`<Routes::Campaigns::Assessment::SkillReview @model={{this.model}} />`);

      assert
        .dom(screen.getByRole('link', { name: customResultPageButtonText }))
        .hasAttribute('href', customResultPageButtonUrl);
    });

    test('display Organization Custom button and Text when campaign isForAbsoluteNovice', async function (assert) {
      const customResultPageText = "je s'appelle groot";
      const customResultPageButtonText = 'je suis un bouton';
      const customResultPageButtonUrl = 'http://jesuisunbouton.fr/';
      model.campaign.set('customResultPageText', customResultPageText);
      model.campaign.set('customResultPageButtonUrl', customResultPageButtonUrl);
      model.campaign.set('customResultPageButtonText', customResultPageButtonText);
      model.campaignParticipationResult.set('isShared', false);
      model.campaign.set('isForAbsoluteNovice', true);

      this.set('model', model);

      // when
      const screen = await render(hbs`<Routes::Campaigns::Assessment::SkillReview @model={{this.model}} />`);

      assert
        .dom(screen.getByRole('link', { name: customResultPageButtonText }))
        .hasAttribute('href', customResultPageButtonUrl);
      assert.ok(screen.getByText(customResultPageText));
    });

    test('display Organization Custom button and Text when campaign participation isShared', async function (assert) {
      const customResultPageText = "je s'appelle groot";
      const customResultPageButtonText = 'je suis un bouton';
      const customResultPageButtonUrl = 'http://jesuisunbouton.fr/';
      model.campaign.set('customResultPageText', customResultPageText);
      model.campaign.set('customResultPageButtonUrl', customResultPageButtonUrl);
      model.campaign.set('customResultPageButtonText', customResultPageButtonText);
      model.campaignParticipationResult.set('isShared', true);
      model.campaign.set('isForAbsoluteNovice', false);

      this.set('model', model);

      // when
      const screen = await render(hbs`<Routes::Campaigns::Assessment::SkillReview @model={{this.model}} />`);

      assert
        .dom(screen.getByRole('link', { name: customResultPageButtonText }))
        .hasAttribute('href', customResultPageButtonUrl);
      assert.ok(screen.getByText(customResultPageText));
    });

    test('not display Organization Custom Message when campaign isForAbsoluteForNovice and isShared are false', async function (assert) {
      const customResultPageText = "je s'appelle groot";
      model.campaignParticipationResult.set('isShared', false);
      model.campaign.set('customResultPageText', customResultPageText);
      model.campaign.set('isForAbsoluteNovice', false);

      this.set('model', model);

      // when
      const screen = await render(hbs`<Routes::Campaigns::Assessment::SkillReview @model={{this.model}} />`);

      assert.notOk(screen.queryByText(customResultPageText));
    });

    test('not display Organization Custom Message or Url when not set and campaign participation isShared', async function (assert) {
      model.campaignParticipationResult.set('isShared', true);
      model.campaign.set('isForAbsoluteNovice', false);
      model.campaign.set('customResultPageText', null);
      model.campaign.set('customResultPageButtonUrl', null);
      model.campaign.set('customResultPageButtonText', null);

      this.set('model', model);

      // when
      const screen = await render(hbs`<Routes::Campaigns::Assessment::SkillReview @model={{this.model}} />`);

      assert.notOk(screen.queryByText(this.intl.t('pages.skill-review.organization-message')));
    });

    test('not display Organization Custom Message or Url when not set and campaign isForAbsoluteNovice', async function (assert) {
      model.campaignParticipationResult.set('isShared', false);
      model.campaign.set('isForAbsoluteNovice', true);
      model.campaign.set('customResultPageText', null);
      model.campaign.set('customResultPageButtonUrl', null);
      model.campaign.set('customResultPageButtonText', null);

      this.set('model', model);

      // when
      const screen = await render(hbs`<Routes::Campaigns::Assessment::SkillReview @model={{this.model}} />`);

      assert.notOk(screen.queryByText(this.intl.t('pages.skill-review.organization-message')));
    });
  });

  module('Reset button', function (hooks) {
    hooks.beforeEach(function () {
      model.campaignParticipationResult.set('canReset', true);
      model.campaignParticipationResult.set('isDisabled', false);
      model.campaignParticipationResult.set('isShared', true);

      this.set('model', model);
    });

    test('display reset button', async function (assert) {
      // when
      const screen = await render(hbs`<Routes::Campaigns::Assessment::SkillReview @model={{this.model}} />`);

      assert.dom(screen.queryByRole('link', { name: 'Repasser mon parcours' })).doesNotExist();
      assert.dom(screen.getByRole('button', { name: 'Remettre à zéro et tout retenter' })).exists();
    });

    test('open confirmation modal to reset skills', async function (assert) {
      // when
      const screen = await render(hbs`<Routes::Campaigns::Assessment::SkillReview @model={{this.model}} />`);

      await click(screen.getByRole('button', { name: 'Remettre à zéro et tout retenter' }));

      await screen.findByRole('dialog');

      assert.dom(screen.getByRole('heading', { level: 1, name: 'Remettre à zéro et tout retenter' })).exists();
      assert
        .dom(
          screen.getByText(
            'Vos Pix, vos niveaux et votre certificabilité obtenus lors de ce parcours vont être supprimés.',
          ),
        )
        .exists();

      const linkButton = screen.getByRole('link', { name: 'Confirmer' });
      assert.dom(linkButton).exists();
      assert.dom(linkButton).hasAttribute('href', '/campagnes/CODECAMPAIGN?reset=true');
      assert.dom(screen.getByRole('button', { name: 'Annuler' })).exists();
    });
  });

  module('Share button', function (hooks) {
    hooks.beforeEach(function () {
      model.campaignParticipationResult.set('canReset', false);
      model.campaignParticipationResult.set('isDisabled', false);

      this.set('model', model);
    });

    test('display share button', async function (assert) {
      model.campaignParticipationResult.set('isShared', false);
      // when
      const screen = await render(hbs`<Routes::Campaigns::Assessment::SkillReview @model={{this.model}} />`);

      assert.ok(screen.getByRole('button', { name: this.intl.t('pages.skill-review.actions.send') }));
    });

    test('not display share button', async function (assert) {
      model.campaignParticipationResult.set('isShared', true);
      // when
      const screen = await render(hbs`<Routes::Campaigns::Assessment::SkillReview @model={{this.model}} />`);

      assert.notOk(screen.queryByRole('button', { name: this.intl.t('pages.skill-review.actions.send') }));
    });
  });

  module('Improve button', function (hooks) {
    hooks.beforeEach(function () {
      model.campaignParticipationResult.set('canReset', false);
      model.campaignParticipationResult.set('isDisabled', false);
      model.campaignParticipationResult.set('isShared', false);

      this.set('model', model);
    });

    test('display improve button', async function (assert) {
      model.campaignParticipationResult.set('canImprove', true);
      // when
      const screen = await render(hbs`<Routes::Campaigns::Assessment::SkillReview @model={{this.model}} />`);

      assert.ok(screen.getByRole('button', { name: this.intl.t('pages.skill-review.actions.improve') }));
    });

    test('not display improve button', async function (assert) {
      model.campaignParticipationResult.set('canImprove', false);
      // when
      const screen = await render(hbs`<Routes::Campaigns::Assessment::SkillReview @model={{this.model}} />`);

      assert.notOk(screen.queryByRole('button', { name: this.intl.t('pages.skill-review.actions.improve') }));
    });
  });

  test('it should not display skill review infos if isForabsoluteNovice is true', async function (assert) {
    model.campaign.set('isForAbsoluteNovice', true);
    this.set('model', model);

    const screen = await render(hbs`<Routes::Campaigns::Assessment::SkillReview @model={{this.model}} />`);

    assert.notOk(screen.queryByText(this.intl.t('pages.skill-review.stage.title')));
    assert.notOk(screen.queryByText(this.intl.t('pages.skill-review.details.title')));
  });

  module('#displayTrainings', () => {
    test('should not display trainings when none are associated', async function (assert) {
      // given
      model.campaignParticipationResult.set('isShared', true);
      this.set('model', model);

      // when
      const screen = await render(hbs`<Routes::Campaigns::Assessment::SkillReview @model={{this.model}} />`);

      assert.notOk(screen.queryByText(this.intl.t('pages.skill-review.trainings.title')));
      assert.notOk(screen.queryByText(this.intl.t('pages.skill-review.trainings.description')));
    });

    test('should display trainings', async function (assert) {
      // given
      model.trainings = {
        title: 'Mon super training',
        link: 'https://training.net/',
        type: 'webinaire',
        locale: 'fr-fr',
        duration: { hours: 6 },
        editorName: "Ministère de l'éducation nationale et de la jeunesse. Liberté égalité fraternité",
        editorLogoUrl:
          'https://images.pix.fr/contenu-formatif/editeur/logo-ministere-education-nationale-et-jeunesse.svg',
      };
      model.campaignParticipationResult.set('isShared', true);
      this.set('model', model);

      // when
      const screen = await render(hbs`<Routes::Campaigns::Assessment::SkillReview @model={{this.model}} />`);

      assert.ok(screen.queryByText(this.intl.t('pages.skill-review.trainings.title')));
      assert.ok(screen.queryByText(this.intl.t('pages.skill-review.trainings.description')));
    });
  });

  module('when the campaign is an autonomous course', () => {
    test('it should display continue link instead of the share results button', async function (assert) {
      // given
      const customResultPageText = 'Je suis Iron Man';
      model.campaign.set('organizationId', autonomousCourseOrganizationId);
      model.campaign.set('customResultPageText', customResultPageText);

      this.set('model', model);

      // when
      const screen = await render(hbs`<Routes::Campaigns::Assessment::SkillReview @model={{this.model}} />`);
      const continueLink = screen.getByRole('link', { name: this.intl.t('pages.skill-review.actions.continue') });

      assert.notOk(screen.queryByText(this.intl.t('pages.skill-review.actions.send')));
      assert.notOk(screen.queryByText(this.intl.t('pages.skill-review.send-results')));

      assert.dom(continueLink).exists();
    });
  });
});
