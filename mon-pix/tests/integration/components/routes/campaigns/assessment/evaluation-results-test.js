import { render } from '@1024pix/ember-testing-library';
import { hbs } from 'ember-cli-htmlbars';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../../../../helpers/setup-intl-rendering';

module('Integration | Components | Routes | Campaigns | Assessment | Evaluation Results', function (hooks) {
  setupIntlRenderingTest(hooks);

  let screen;

  hooks.beforeEach(async function () {
    // given
    const store = this.owner.lookup('service:store');

    const campaign = store.createRecord('campaign', {
      title: 'Campaign title',
    });

    this.set('model', {
      campaign,
      campaignParticipationResult: { campaignParticipationBadges: [] },
    });

    // when
    screen = await render(hbs`<Routes::Campaigns::Assessment::EvaluationResults @model={{this.model}} />`);
  });

  test('it should display a header', async function (assert) {
    // then
    assert.dom(screen.getByRole('heading', { name: 'Campaign title' })).exists();
  });

  test('it should display a tablist', async function (assert) {
    // then
    assert.dom(screen.getByRole('tablist', { name: this.intl.t('pages.skill-review.tabs.aria-label') })).exists();
  });
});
