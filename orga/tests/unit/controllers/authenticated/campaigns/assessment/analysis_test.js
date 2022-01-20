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

    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line qunit/no-assert-equal
    assert.equal(controller.pageTitle, 'Analyse pour Jaune attends');
  });
});
