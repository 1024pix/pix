import { module, test } from 'qunit';
import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';
import { render } from '@1024pix/ember-testing-library';
import { hbs } from 'ember-cli-htmlbars';
import { click } from '@ember/test-helpers';

module('Integration | Component | Campaign | skill-review', function (hooks) {
  setupIntlRenderingTest(hooks);
  let model;

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
});
