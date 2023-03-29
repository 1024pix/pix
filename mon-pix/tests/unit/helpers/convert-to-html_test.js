import { module, test } from 'qunit';
import ConvertToHtml from 'mon-pix/helpers/convert-to-html';

module('Unit | Helper | ConvertToHtml', function () {
  module('#compute', function (hooks) {
    let helper;

    hooks.beforeEach(function () {
      helper = new ConvertToHtml();
    });

    test('should return html formatted result', function (assert) {
      const boldSentence = new Array(['**a bold sentence**']);
      const result = helper.compute(boldSentence);

      assert.strictEqual(result, '<p><strong>a bold sentence</strong></p>');
    });

    test('should return a string without html/css artifacts', function (assert) {
      const input = new Array(['**a bold sentence**<style>width:10px</style>']);
      const result = helper.compute(input);

      assert.strictEqual(result, '<p><strong>a bold sentence</strong></p>');
    });

    test('should return an empty string when called with an argument that is not an array', function (assert) {
      const badArgument = 'bad argument';
      const result = helper.compute(badArgument);

      assert.strictEqual(result, '');
    });

    test('should return an empty string when called with an empty argument', function (assert) {
      const emptyArgument = new Array(['']);
      const result = helper.compute(emptyArgument);

      assert.strictEqual(result, '');
    });
  });
});
