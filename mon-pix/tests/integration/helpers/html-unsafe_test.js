import { module, test } from 'qunit';
import { htmlUnsafe } from 'mon-pix/helpers/html-unsafe';

module('#htmlUnsafe', function () {
  test('should interpret HTML', function (assert) {
    // given
    const input =
      '<script>alert("coucou")</script><img src="coucou.jpg" onerror="alert(\'image\')" /><p>Paragraphe</p>';

    // when
    const result = htmlUnsafe(input);

    // then
    assert.strictEqual(result.__string, input);
  });
});
