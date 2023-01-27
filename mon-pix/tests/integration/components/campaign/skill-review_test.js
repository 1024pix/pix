import { module, test } from 'qunit';
import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';
import { render } from '@1024pix/ember-testing-library';
import hbs from 'htmlbars-inline-precompile';
import EmberObject from '@ember/object';

module('Integration | Component | Campaign | skill-review', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('it should display a list of competences and their scores', async function (assert) {
    // given
    const competenceResults = [
      {
        name: 'Faire des câlins',
        flashPixScore: 23,
        areaColor: 'jaffa',
      },
    ];
    const model = {
      campaign: EmberObject.create({
        isFlash: true,
      }),
      campaignParticipationResult: EmberObject.create({
        id: 12345,
        flashPixScore: 122,
        competenceResults,
        campaignParticipationBadges: [],
      }),
    };

    this.set('model', model);

    // when
    const screen = await render(hbs`<Routes::Campaigns::Assessment::SkillReview @model={{this.model}} />`);

    // then
    assert.dom(screen.getByText('Compétences testées')).exists();
    assert.dom(screen.getByRole('rowheader', { name: 'Faire des câlins' })).exists();
    assert.dom(screen.getByRole('cell', { name: '23 Pix' })).exists();
  });
});
