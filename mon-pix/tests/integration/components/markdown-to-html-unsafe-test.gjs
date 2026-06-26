import { render } from '@1024pix/ember-testing-library';
import { setupRenderingTest } from 'ember-qunit';
import MarkdownToHtmlUnsafe from 'mon-pix/components/markdown-to-html-unsafe';
import { module, test } from 'qunit';

module('Integration | Component | markdown-to-html-unsafe', function (hooks) {
  setupRenderingTest(hooks);

  module('When markdown is passed in parameters', function () {
    test('should render a heading', async function (assert) {
      // given
      const markdown = '# Title 1';

      // when
      const screen = await render(<template><MarkdownToHtmlUnsafe @markdown={{markdown}} /></template>);

      // then
      assert.ok(screen.getByRole('heading', { level: 1, name: 'Title 1' }));
    });

    test('should render an image inside a paragraph', async function (assert) {
      // given
      const markdown = '![Pix Logo](http://example.net/pix_logo.png)';

      // when
      const screen = await render(<template><MarkdownToHtmlUnsafe @markdown={{markdown}} /></template>);

      // then
      const image = screen.getByRole('img', { name: 'Pix Logo' });
      assert.strictEqual(image.getAttribute('src'), 'http://example.net/pix_logo.png');
      const paragraph = screen.getByRole('paragraph');
      assert.ok(paragraph.contains(image));
    });
  });

  module('When unsafe html is passed in parameters', function () {
    test('should not strip script tags', async function (assert) {
      // given
      const markdown = '<script src=http://xss.rocks/xss.js></script>';

      // when
      await render(<template><MarkdownToHtmlUnsafe @markdown={{markdown}} /></template>);

      // then
      const script = document.querySelector('script[src="http://xss.rocks/xss.js"]');
      assert.ok(script);
    });

    test('should not strip onerror attribute from image', async function (assert) {
      // given
      // NOTE: we use a valid src and a benign onerror payload so the handler does not fire alert().
      const markdown = '<img src=http://example.net/pix_logo.png onerror="window.__xssOnError=true"></img>';

      // when
      const screen = await render(<template><MarkdownToHtmlUnsafe @markdown={{markdown}} /></template>);

      // then
      const image = screen.getByRole('img');
      assert.strictEqual(image.getAttribute('onerror'), 'window.__xssOnError=true');
      assert.strictEqual(image.getAttribute('src'), 'http://example.net/pix_logo.png');
      const paragraph = screen.getByRole('paragraph');
      assert.ok(paragraph.contains(image));
    });
  });

  test('should keep rel attribute in anchor tags when they are present', async function (assert) {
    // given
    const markdown = '<a href="/test" rel="noopener noreferrer" target="_blank">Lien vers un site</a>';

    // when
    const screen = await render(<template><MarkdownToHtmlUnsafe @markdown={{markdown}} /></template>);

    // then
    const link = screen.getByRole('link', { name: 'Lien vers un site' });
    assert.strictEqual(link.getAttribute('href'), '/test');
    assert.strictEqual(link.getAttribute('rel'), 'noopener noreferrer');
    assert.strictEqual(link.getAttribute('target'), '_blank');
    const paragraph = screen.getByRole('paragraph');
    assert.ok(paragraph.contains(link));
  });

  module('when extensions are passed in arguments', function () {
    test('should apply remove-paragraph-tags extension when provided', async function (assert) {
      // given
      const markdown = '# Title 1\nCeci est un paragraphe.\n![img](/images.png)';
      const extensions = 'remove-paragraph-tags';

      // when
      const screen = await render(
        <template><MarkdownToHtmlUnsafe @markdown={{markdown}} @extensions={{extensions}} /></template>,
      );

      // then
      assert.notOk(screen.queryByRole('paragraph'));
      assert.ok(screen.getByRole('heading', { level: 1, name: 'Title 1' }));
      const image = screen.getByRole('img', { name: 'img' });
      assert.strictEqual(image.getAttribute('src'), '/images.png');
    });
  });
});
