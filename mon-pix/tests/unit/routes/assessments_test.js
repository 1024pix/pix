import EmberObject from '@ember/object';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import setupIntl from '../../helpers/setup-intl';

module('Unit | Route | Assessments', function (hooks) {
  setupTest(hooks);
  setupIntl(hooks);

  let route;

  hooks.beforeEach(function () {
    route = this.owner.lookup('route:assessments');
  });

  module('#afterModel', function () {
    test('should return the title when the assessment is not a certification ', function (assert) {
      // given
      const assessment = EmberObject.create({ id: 1, title: 'Programmer', isCertification: false });

      // when
      const model = route.afterModel(assessment);

      // then
      assert.strictEqual(model.title, 'Programmer');
    });

    test('should update the title when the assessment is a certification ', function (assert) {
      // given
      const assessment = EmberObject.create({ id: 1, title: 1223, isCertification: true });

      // when
      const model = route.afterModel(assessment);

      // then
      assert.strictEqual(model.title, 'Certification 1223');
    });
  });
});
