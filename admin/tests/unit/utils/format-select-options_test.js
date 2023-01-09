import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import formatSelectOptions from 'pix-admin/utils/format-select-options';

module('Unit | Utils | format select options', function (hooks) {
  setupTest(hooks);

  module('Format select options', function () {
    test('should return formatted select options', function (assert) {
      // given
      const options = {
        COMPETENCES: 'Les 16 compétences',
        SUBJECT: 'Thématiques',
        DISCIPLINE: 'Disciplinaires',
      };

      const expectedResult = [
        {
          label: 'Les 16 compétences',
          value: 'COMPETENCES',
        },
        {
          label: 'Thématiques',
          value: 'SUBJECT',
        },
        {
          label: 'Disciplinaires',
          value: 'DISCIPLINE',
        },
      ];

      // when
      const result = formatSelectOptions(options);

      // then
      assert.deepEqual(result, expectedResult);
    });
  });
});
