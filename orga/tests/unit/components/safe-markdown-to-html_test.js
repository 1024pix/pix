import { toHtml } from 'pix-orga/components/safe-markdown-to-html';
import { module, test } from 'qunit';

module('Unit | Component | SafeMarkdownToHtml', function () {
  module('#getHtml', function () {
    test('it should sanitize HTML props', async function (assert) {
      // given
      const unsafeHtml = `<img src="http://img.fr/logo.pix" onerror="alert('toto')" />"`;

      // when
      const html = toHtml(unsafeHtml);
      // then
      assert.ok(/src="http:\/\/img\.fr\/logo\.pix"/.test(html.__string));
      assert.notOk(/onerror/.test(html.__string));
    });
    test('it should sanitize HTML tags', async function (assert) {
      // given
      const unsafeHtml = `<a href="https://pix.fr">monpix</a><toto>hello</toto><script>alert("coucou")</script>"`;

      // when
      const html = toHtml(unsafeHtml);
      // then
      assert.ok(/<a href="https:\/\/pix\.fr">monpix<\/a>/.test(html.__string));
      assert.notOk(/<script>/.test(html.__string));
      assert.notOk(/<toto>/.test(html.__string));
    });
  });
});
