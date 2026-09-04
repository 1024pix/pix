import type { TestContext } from '@ember/test-helpers';
import { setupTest } from 'ember-qunit';
import DisplayCampaignErrors from 'pix-orga/helpers/display-campaign-errors';
import type LocaleService from 'pix-orga/services/locale';
import { module, test } from 'qunit';

import setupIntl from '../../helpers/setup-intl';

module('Unit | Helper | display-campaign-errors', function (hooks) {
  setupTest(hooks);
  setupIntl(hooks);

  let helper: DisplayCampaignErrors;
  hooks.beforeEach(function (this: TestContext) {
    (this.owner.lookup('service:locale') as LocaleService).setCurrentLocale('fr');
    helper = new DisplayCampaignErrors(this.owner);
  });

  module('when there is an error', function () {
    test('it returns the intlKey corresponding to the name error message', function (assert) {
      const nameErrors = [{ attribute: 'name', message: 'CAMPAIGN_NAME_IS_REQUIRED' }];
      assert.strictEqual(helper.compute([nameErrors]), 'Veuillez donner un nom à votre campagne.');
    });
  });

  module('when there is no error', function () {
    test('it returns the intlKey corresponding to the type error message', function (assert) {
      const noError: { attribute: string; message: string }[] = [];
      assert.strictEqual(helper.compute([noError]), null);
    });
  });
});
