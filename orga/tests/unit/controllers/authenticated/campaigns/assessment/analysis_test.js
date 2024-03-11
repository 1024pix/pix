import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../../../../helpers/setup-intl-rendering';

module('Unit | Controller | authenticated/campaigns/assessment/analysis', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('it should display correct page title', function (assert) {
    const controller = this.owner.lookup('controller:authenticated/campaigns/participant-assessment/analysis');
    controller.model = {
      firstName: 'Jaune',
      lastName: 'attends',
    };

    assert.strictEqual(controller.pageTitle, 'Analyse pour Jaune attends');
  });
});
