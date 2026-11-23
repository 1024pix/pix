import type { TestContext } from '@ember/test-helpers';
import { setupTest } from 'ember-qunit';
import GetExtraColumnLabel from 'pix-orga/helpers/get-extra-column-label';
import type LocaleService from 'pix-orga/services/locale';
import { module, test } from 'qunit';

import setupIntl from '../../helpers/setup-intl';

module('Unit | Helper | get-extra-column-label', function (hooks) {
  setupTest(hooks);
  setupIntl(hooks);

  let helper: GetExtraColumnLabel;
  hooks.beforeEach(async function (this: TestContext) {
    await (this.owner.lookup('service:locale') as LocaleService).setCurrentLocale('fr');
    helper = new GetExtraColumnLabel(this.owner);
  });

  module('when the heading has a translation', function () {
    test('it returns the translated label', function (assert) {
      assert.strictEqual(helper.compute(['COMMON_BIRTHDATE']), 'Date de naissance');
      assert.strictEqual(helper.compute(['COMMON_DIVISION']), 'Classe');
      assert.strictEqual(helper.compute(['ORALIZATION']), 'Lecture de la consigne');
    });
  });

  module('when the heading has no translation', function () {
    test('it returns the heading as is', function (assert) {
      assert.strictEqual(helper.compute(['Mon champ libre']), 'Mon champ libre');
    });
  });
});
