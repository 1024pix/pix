import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../../../../helpers/setup-intl-rendering';

module('Unit | Controller | authenticated/campaigns/assessment/results', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('it should display correct page title', function (assert) {
    const controller = this.owner.lookup('controller:authenticated/campaigns/participant-assessment/results');
    controller.model = {
      firstName: 'Jaune',
      lastName: 'attends',
    };

    assert.strictEqual(controller.pageTitle, 'Résultats de Jaune attends');
  });
});
