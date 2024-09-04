import { render } from '@1024pix/ember-testing-library';
import { t } from 'ember-intl/test-support';
import ModuleElementDownload from 'mon-pix/components/module/element/download';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | Module | Element | Download', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('should display a Download', async function (assert) {
    // given
    const downloadElement = {
      files: [
        { url: 'https://example.org/image.jpg', format: '.jpg' },
        { url: 'https://example.org/image.png', format: '.png' },
      ],
      type: 'download',
    };

    //  when
    const screen = await render(<template><ModuleElementDownload @download={{downloadElement}} /></template>);

    // then
    const pngDownloadLink = screen.getByRole('link', {
      name: t('pages.modulix.download.label', { format: '.png' }),
    });
    assert.dom(pngDownloadLink).hasAttribute('href', 'https://example.org/image.png');
    assert.dom(pngDownloadLink).hasAttribute('download');

    const jpgDownloadLink = screen.getByRole('link', {
      name: t('pages.modulix.download.label', { format: '.jpg' }),
    });
    assert.dom(jpgDownloadLink).hasAttribute('href', 'https://example.org/image.jpg');
    assert.dom(jpgDownloadLink).hasAttribute('download');
  });

  test('should display links in the correct order', async function (assert) {
    // given
    const downloadElement = {
      files: [
        { url: 'https://example.org/image.jpg', format: '.jpg' },
        { url: 'https://example.org/image.png', format: '.png' },
      ],
      type: 'download',
    };

    //  when
    const screen = await render(<template><ModuleElementDownload @download={{downloadElement}} /></template>);

    // then
    const links = screen.getAllByRole('link');
    assert.dom(links[0]).hasAttribute('href', 'https://example.org/image.jpg');
    assert.dom(links[1]).hasAttribute('href', 'https://example.org/image.png');
  });

  test('should display a link to documentation', async function (assert) {
    // given
    const downloadElement = {
      files: [{ url: 'https://example.org/image.jpg', format: '.jpg' }],
      type: 'download',
    };

    //  when
    const screen = await render(<template><ModuleElementDownload @download={{downloadElement}} /></template>);

    // then
    const documentationLink = screen.getByRole('link', {
      name: t('pages.modulix.download.documentationLinkLabel'),
    });
    assert.dom(documentationLink).hasAttribute('href', t('pages.modulix.download.documentationLinkHref'));
  });

  module('when download button is clicked', function () {
    test('should call onDownload prop with right argument', async function (assert) {
      // given
      const downloadedFormat = '.pdf';
      const downloadElement = {
        id: 'id',
        type: 'download',
        files: [{ format: downloadedFormat, url: 'https://example.org/modulix/placeholder-doc.pdf' }],
      };
      const onDownloadStub = sinon.stub();
      const screen = await render(
        <template><ModuleElementDownload @download={{downloadElement}} @onDownload={{onDownloadStub}} /></template>,
      );

      //  when
      const downloadLink = await screen.getByRole('link', {
        name: t('pages.modulix.download.label', { format: downloadedFormat }),
      });
      downloadLink.addEventListener('click', (event) => {
        event.preventDefault();
      });
      downloadLink.click();

      // then
      sinon.assert.calledWithExactly(onDownloadStub, {
        elementId: downloadElement.id,
        downloadedFormat,
      });
      assert.ok(true);
    });
  });
});
