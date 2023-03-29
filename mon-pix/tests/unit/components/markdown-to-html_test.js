import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import createGlimmerComponent from 'mon-pix/tests/helpers/create-glimmer-component';

module('Unit | Component | markdown-to-html', function (hooks) {
  let component;
  setupTest(hooks);

  module('When markdown are passed in parameters', function () {
    [
      { markdown: '# Title 1', expectedValue: '<h1>Title 1</h1>' },
      {
        markdown: '![Pix Logo](http://example.net/pix_logo.png)',
        expectedValue: '<p><img src="http://example.net/pix_logo.png" alt="Pix Logo" /></p>',
      },
    ].forEach(({ markdown, expectedValue }) => {
      test(`${markdown} should return ${expectedValue}`, function (assert) {
        // when
        component = createGlimmerComponent('component:markdown-to-html', { markdown });

        // then
        assert.strictEqual(component.html.string, expectedValue);
      });
    });
  });

  module('When unsafe html are passed in parameters', function () {
    [
      {
        markdown: '<script src=http://xss.rocks/xss.js></script>',
        expectedValue: '&lt;script src=http://xss.rocks/xss.js&gt;&lt;/script&gt;',
      },
      { markdown: '<img src="javascript:alert(\'XSS\');">', expectedValue: '<p><img src></p>' },
      {
        markdown: '<img src=/ onerror="alert(String.fromCharCode(88,83,83))"></img>',
        expectedValue: '<p><img src="/"></img></p>',
      },
    ].forEach(({ markdown, expectedValue }) => {
      test(`${markdown} should be transform to ${expectedValue}`, function (assert) {
        // when
        component = createGlimmerComponent('component:markdown-to-html', { markdown });

        // then
        assert.strictEqual(component.html.string, expectedValue);
      });
    });
  });

  test('should keep rel attribute in tag a when they are present', function (assert) {
    // given
    const html = '<a href="/test" rel="noopener noreferrer" target="_blank">Lien vers un site</a>';

    // when
    component = createGlimmerComponent('component:markdown-to-html', { markdown: html });

    // then
    const expectedHtml = `<p>${html}</p>`;
    assert.strictEqual(component.html.string, expectedHtml);
  });

  module('when extensions are passed in arguments', function () {
    test('should use this', function (assert) {
      // given
      const markdown = '# Title 1\nCeci est un paragraphe.\n![img](/images.png)';
      const extensions = 'remove-paragraph-tags';

      // when
      component = createGlimmerComponent('component:markdown-to-html', { markdown, extensions });

      // then
      const expectedHtml = '<h1>Title 1</h1>\nCeci est un paragraphe.\n<img src="/images.png" alt="img" />';
      assert.strictEqual(component.html.string, expectedHtml);
    });
  });

  module('when class is provided', function () {
    test('should remove it', function (assert) {
      // given
      const markdown = '<h1 class="foo">Test</h1>';

      // when
      component = createGlimmerComponent('component:markdown-to-html', { markdown });

      // then
      const expectedHtml = '<h1>Test</h1>';
      assert.strictEqual(component.html.string, expectedHtml);
    });
  });

  module('when accessibility class is provided', function () {
    test('should keep it', function (assert) {
      // given
      const markdown = '<h1 class="sr-only">Test</h1>';

      // when
      component = createGlimmerComponent('component:markdown-to-html', { markdown });

      // then
      const expectedHtml = '<h1 class="sr-only">Test</h1>';
      assert.strictEqual(component.html.string, expectedHtml);
    });
  });
});
