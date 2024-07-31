import { render } from '@1024pix/ember-testing-library';
import { hbs } from 'ember-cli-htmlbars';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../../../../helpers/setup-intl-rendering';

module('Integration | Components | Routes | Campaigns | Assessment | Evaluation Results', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('it should display a header', async function (assert) {
    // given
    const store = this.owner.lookup('service:store');

    const campaign = store.createRecord('campaign', {
      title: 'Campaign title',
    });

    this.set('model', { campaign });

    // when
    const screen = await render(hbs`<Routes::Campaigns::Assessment::EvaluationResults @model={{this.model}} />`);

    // then
    assert.dom(screen.getByRole('heading', { name: 'Campaign title' })).exists();
  });

  test('it should display a tablist with three tabs', async function (assert) {
    // when
    const screen = await render(hbs`<Routes::Campaigns::Assessment::EvaluationResults />`);

    // then
    assert.dom(screen.getByRole('tablist', { name: this.intl.t('pages.skill-review.tabs.aria-label') })).exists();
  });
});
