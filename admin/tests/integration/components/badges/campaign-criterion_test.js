import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@1024pix/ember-testing-library';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | Badges::CampaignCriterion', function (hooks) {
  setupRenderingTest(hooks);

  test('should display a CampaignParticipation criterion', async function (assert) {
    // given
    const store = this.owner.lookup('service:store');
    const criterion = store.createRecord('badge-criterion', {
      threshold: 60,
    });
    this.set('criterion', criterion);

    // when
    const screen = await render(hbs`<Badges::CampaignCriterion @criterion={{this.criterion}} />`);

    // then
    assert.deepEqual(
      screen.getByTestId('triste').innerText,
      'L‘évalué doit obtenir 60% sur l‘ensemble des sujets du profil cible.'
    );
  });
});
