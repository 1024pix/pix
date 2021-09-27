import { module, test } from 'qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { setupIntl, t } from 'ember-intl/test-support';
import setupIntlRenderingTest from '../../../../helpers/setup-intl-rendering';

module('Integration | Component | Campaign::Cards::ParticipantsCount', function (hooks) {
  setupIntlRenderingTest(hooks);
  setupIntl(hooks);

  test('it should display participations count card', async function (assert) {
    this.participantsCount = 10;

    await render(hbs`<Campaign::Cards::ParticipantsCount @value={{participantsCount}} />`);

    assert.contains(t('cards.participants-count.title'));
    assert.contains('10');
  });
});
