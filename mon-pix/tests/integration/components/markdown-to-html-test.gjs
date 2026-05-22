import { render } from '@1024pix/ember-testing-library';
import { setupRenderingTest } from 'ember-qunit';
import MarkdownToHtml from 'mon-pix/components/markdown-to-html';
import { module, test } from 'qunit';

module('Integration | Component | markdown-to-html', function (hooks) {
  setupRenderingTest(hooks);

  module('When markdown is passed in parameters', function () {
    test('should render different elements', async function (assert) {
      // given
      const markdown =
        '# Title 1\n![Pix Logo](http://example.net/pix_logo.png)\n<a href="/test" rel="noopener noreferrer" target="_blank">Lien vers un site</a>';

      // when
      const screen = await render(<template><MarkdownToHtml @markdown={{markdown}} /></template>);

      // then
      assert.ok(screen.getByRole('heading', { level: 1, name: 'Title 1' }));
      const paragraph = screen.getByRole('paragraph');

      const image = await screen.getByRole('img', { name: 'Pix Logo' });
      assert.strictEqual(image.getAttribute('alt'), 'Pix Logo');
      assert.ok(paragraph.contains(image));

      const link = screen.getByRole('link', { name: 'Lien vers un site' });
      assert.strictEqual(link.getAttribute('href'), '/test');
      assert.strictEqual(link.getAttribute('rel'), 'noopener noreferrer');
      assert.strictEqual(link.getAttribute('target'), '_blank');
      assert.ok(paragraph.contains(link));
    });
  });

  module('When unsafe html is passed in parameters', function () {
    test('should strip script tags', async function (assert) {
      // given
      const markdown = '<script src="http://xss.rocks/xss.js"></script>';
      // when
      await render(<template><MarkdownToHtml @markdown={{markdown}} /></template>);
      // then
      assert.dom('script').doesNotExist();
    });

    test('should strip javascript from image attribute', async function (assert) {
      // given
      const markdown = '<img src="javascript:alert(\'XSS\');">';
      // when
      const screen = await render(<template><MarkdownToHtml @markdown={{markdown}} /></template>);
      // then
      const image = await screen.getByRole('img');
      assert.notOk(image.getAttribute('src').startsWith('javascript:'));
      const paragraph = screen.getByRole('paragraph');
      assert.ok(paragraph.contains(image));
    });

    test('should strip onerror attribute from image', async function (assert) {
      // given
      const markdown = '<img alt="image" src="/" onerror="alert(String.fromCharCode(88,83,83))">';

      // when
      const screen = await render(<template><MarkdownToHtml @markdown={{markdown}} /></template>);

      // then
      const image = await screen.getByRole('img');
      assert.notOk(image.hasAttribute('onerror'));
      assert.strictEqual(image.getAttribute('src'), '/');
      const paragraph = screen.getByRole('paragraph');
      assert.ok(paragraph.contains(image));
    });
  });

  module('when class attribute is in markdown', function () {
    test('should strip non-accessibility class attributes', async function (assert) {
      // given
      const markdown = '<h1 class="foo">Test</h1>';
      // when
      const screen = await render(<template><MarkdownToHtml @markdown={{markdown}} /></template>);
      // then
      const heading = screen.getByRole('heading', { level: 1, name: 'Test' });
      assert.notOk(heading.hasAttribute('class'));
    });

    test('should preserve sr-only class for accessibility', async function (assert) {
      // given
      const markdown = '<h1 class="sr-only">Test</h1>';
      // when
      const screen = await render(<template><MarkdownToHtml @markdown={{markdown}} /></template>);
      // then
      const heading = screen.getByRole('heading', { level: 1, name: 'Test' });
      assert.strictEqual(heading.getAttribute('class'), 'sr-only');
    });
  });

  module('when extensions are passed in arguments', function () {
    test('should apply remove-paragraph-tags extension when provided', async function (assert) {
      // given
      const markdown = '# Title 1\nCeci est un paragraphe.\n![img](/images.png)';
      const extensions = 'remove-paragraph-tags';

      // when
      const screen = await render(
        <template><MarkdownToHtml @markdown={{markdown}} @extensions={{extensions}} /></template>,
      );

      // then
      assert.notOk(screen.queryByRole('paragraph'));
      assert.ok(screen.getByRole('heading', { level: 1, name: 'Title 1' }));
      const image = await screen.getByRole('img', { name: 'img' });
      assert.strictEqual(image.getAttribute('src'), '/images.png');
    });
  });

  module('when @class is passed in arguments', function () {
    test('should apply the provided class to the wrapper div', async function (assert) {
      // given
      const markdown = '# Title 1';

      // when
      const screen = await render(
        <template><MarkdownToHtml @markdown={{markdown}} @class="my-custom-class" /></template>,
      );

      // then
      const wrapper = document.querySelector('div.my-custom-class');
      assert.dom(wrapper).hasClass('my-custom-class');
      const heading = screen.getByRole('heading', { level: 1, name: 'Title 1' });
      assert.ok(wrapper.contains(heading));
    });
  });

  module('@isInline is correctly evaluated', function () {
    test('should wrap content in a div when @isInline is false', async function (assert) {
      // given
      const markdown = '# Title 1';
      // when
      const screen = await render(
        <template><MarkdownToHtml @markdown={{markdown}} @class="my-custom-class" @isInline={{false}} /></template>,
      );
      // then
      const wrapper = document.querySelector('div.my-custom-class');
      const heading = screen.getByRole('heading', { level: 1, name: 'Title 1' });
      assert.ok(wrapper.contains(heading));
    });

    test('should not wrap content in a div when @isInline is true', async function (assert) {
      // given
      const markdown = '# Title 1';
      // when
      await render(
        <template><MarkdownToHtml @markdown={{markdown}} @class="my-custom-class" @isInline={{true}} /></template>,
      );
      // then
      assert.dom('div.my-custom-class').doesNotExist();
    });
  });

  module('when @mustReplaceLinksFromMarkdown is true', function () {
    test('should replace anchor tags with PixButtonLink in a span container', async function (assert) {
      // given
      const markdown = '[plus de détails](http://pix.fr)';
      // when
      const screen = await render(
        <template><MarkdownToHtml @markdown={{markdown}} @mustReplaceLinksFromMarkdown={{true}} /></template>,
      );
      // then
      const spanContainer = document.querySelector('span.link-markdown-to-html');
      const link = screen.getByRole('link', { name: 'plus de détails' });
      assert.ok(spanContainer.contains(link));
      assert.ok(link.hasAttribute('href', 'http://pix.fr'));
      assert.strictEqual(link.getAttribute('class'), 'pix-button pix-button--size-small pix-button--tertiary');
      assert.strictEqual(link.getAttribute('rel'), 'noopener noreferrer');
      assert.strictEqual(link.getAttribute('target'), '_blank');
    });

    test('should render all the links from markdown', async function (assert) {
      // given
      const markdown = 'Premier lien : [lien1](http://pix1.fr)\n Deuxième lien : [lien2](http://pix2.fr)';
      // when
      const screen = await render(
        <template><MarkdownToHtml @markdown={{markdown}} @mustReplaceLinksFromMarkdown={{true}} /></template>,
      );
      // then
      const link1 = screen.getByRole('link', { name: 'lien1' });
      assert.ok(link1.hasAttribute('href', 'http://pix1.fr'));
      const link2 = screen.getByRole('link', { name: 'lien2' });
      assert.ok(link2.hasAttribute('href', 'http://pix2.fr'));
    });
  });
});
