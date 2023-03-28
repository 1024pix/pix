import { module, test } from 'qunit';
import { stripInstruction } from 'mon-pix/helpers/strip-instruction';

module('Unit | Helpers | StripInstructionHelper', function () {
  module('when sentence is short enough', function () {
    test('should be the same sentence', function (assert) {
      const result = stripInstruction(['<div class="paragraph"><strong>a bold sentence</strong></div>']);

      assert.strictEqual(result, 'a bold sentence');
    });
  });

  module('when sentence is too long', function () {
    test('should be the sentence shorten', function (assert) {
      const result = stripInstruction([
        '<div class="paragraph">' +
          '<strong>a bold sentence a bold sentence a bold sentence a bold sentence a bold sentence</strong>' +
          '</div>',
      ]);

      assert.strictEqual(result, 'a bold sentence a bold sentence a bold sentence a bold sentence a...');
    });

    test('should be the sentence shorten at a space', function (assert) {
      const result = stripInstruction([
        '<div class="paragraph">' +
          '<strong>bold sentence a bold sentence a bold sentence a bold sentence a bold sentence</strong>' +
          '</div>',
      ]);

      assert.strictEqual(result, 'bold sentence a bold sentence a bold sentence a bold sentence a...');
    });
  });

  module('when the length is specified', function () {
    test('should be the sentence shorten by the specified parameter', function (assert) {
      const result = stripInstruction(['<div class="paragraph"><strong>a bold sentence</strong></div>', 10]);

      assert.strictEqual(result, 'a bold...');
    });
  });
});
