import { module, test } from 'qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { setupIntl, t } from 'ember-intl/test-support';
import setupIntlRenderingTest from '../../../../helpers/setup-intl-rendering';

module('Integration | Component | Campaign::Cards::SharedCount', function (hooks) {
  setupIntlRenderingTest(hooks);
  setupIntl(hooks);

  module('When campaign is type assessment', () => {
    test('it should display shared participations count card', async function (assert) {
      this.sharedCount = 10;

      await render(hbs`<Campaign::Cards::SharedCount @value={{sharedCount}} @isTypeAssessment={{true}} />`);

      assert.contains(t('cards.submitted-count.title'));
      assert.contains('10');
    });
  });

  module('When campaign is type profile collection', () => {
    test('it should display shared profiles count card', async function (assert) {
      this.sharedCount = 10;

      await render(hbs`<Campaign::Cards::SharedCount @value={{sharedCount}} @isTypeAssessment={{false}} />`);

      assert.contains(t('cards.submitted-count.title-profiles'));
      assert.contains('10');
    });
  });
});
