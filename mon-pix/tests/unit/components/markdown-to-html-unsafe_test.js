import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import createGlimmerComponent from 'mon-pix/tests/helpers/create-glimmer-component';

module('Unit | Component | markdown-to-html-unsafe', function (hooks) {
  let component;
  setupTest(hooks);

  module('When markdown are passed in parameters', function () {
    [
      { markdown: '# Title 1', expectedValue: '<h1 id="title1">Title 1</h1>' },
      {
        markdown: '![Pix Logo](http://example.net/pix_logo.png)',
        expectedValue: '<p><img src="http://example.net/pix_logo.png" alt="Pix Logo" /></p>',
      },
    ].forEach(({ markdown, expectedValue }) => {
      test(`${markdown} should return ${expectedValue}`, function (assert) {
        // when
        component = createGlimmerComponent('component:markdown-to-html-unsafe', { markdown });

        // then
        assert.strictEqual(component.html.string, expectedValue);
      });
    });
  });

  module('When unsafe html are passed in parameters', function () {
    [
      {
        markdown: '<script src=http://xss.rocks/xss.js></script>',
        expectedValue: '<script src=http://xss.rocks/xss.js></script>',
      },
      {
        markdown: '<img src=/ onerror="alert(String.fromCharCode(88,83,83))"></img>',
        expectedValue: '<p><img src=/ onerror="alert(String.fromCharCode(88,83,83))"></img></p>',
      },
    ].forEach(({ markdown, expectedValue }) => {
      test(`${markdown} should not be transform and return ${expectedValue}`, function (assert) {
        // when
        component = createGlimmerComponent('component:markdown-to-html-unsafe', { markdown });

        // then
        assert.strictEqual(component.html.string, expectedValue);
      });
    });
  });

  test('should keep rel attribute in tag a when they are present', function (assert) {
    // given
    const html = '<a href="/test" rel="noopener noreferrer" target="_blank">Lien vers un site</a>';

    // when
    component = createGlimmerComponent('component:markdown-to-html-unsafe', { markdown: html });

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
      component = createGlimmerComponent('component:markdown-to-html-unsafe', { markdown, extensions });

      // then
      const expectedHtml = '<h1 id="title1">Title 1</h1>\nCeci est un paragraphe.\n<img src="/images.png" alt="img" />';
      assert.strictEqual(component.html.string, expectedHtml);
    });
  });
});
