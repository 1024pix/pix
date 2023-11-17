import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Adapter | Module | ElementAnswer', function (hooks) {
  setupTest(hooks);

  module('#urlForCreateRecord', function () {
    test('should build url for create record', function (assert) {
      // given
      const adapter = this.owner.lookup('adapter:element-answer');
      const option = {
        adapterOptions: {
          moduleSlug: 'module-slug',
          elementId: 'elementId',
        },
      };
      // when
      const url = adapter.urlForCreateRecord('element-answer', option);

      // then
      assert.true(
        url.endsWith(
          `api/modules/${option.adapterOptions.moduleSlug}/elements/${option.adapterOptions.elementId}/answers`,
        ),
      );
    });
  });
});
