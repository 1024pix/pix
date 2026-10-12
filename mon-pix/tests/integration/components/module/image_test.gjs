import { render } from '@1024pix/ember-testing-library';
import { click, findAll, triggerEvent } from '@ember/test-helpers';
import { t } from 'ember-intl/test-support';
import ModulixImageElement from 'mon-pix/components/module/element/image';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';
import { waitForDialogClose } from '../../../helpers/wait-for';

module('Integration | Component | Module | Image', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('should display an image', async function (assert) {
    // given
    const url =
      'https://assets.pix.org/modules/bien-ecrire-son-adresse-mail-explication-les-parties-dune-adresse-mail.svg';

    const imageElement = {
      url,
      alt: 'alt text',
      alternativeText: 'alternative instruction',
      legend: 'je suis une légende',
      licence: 'Je suis une licence',
    };

    //  when
    const screen = await render(<template><ModulixImageElement @image={{imageElement}} /></template>);

    // then
    assert.ok(screen);
    assert.strictEqual(findAll('.element-image').length, 1);
    const imgElement = screen.getByRole('img', { name: 'alt text' });
    assert.dom(imgElement).hasAttribute('src', url);
    assert.ok(screen.getByRole('button', { name: "Afficher l'alternative textuelle" }));
    assert.dom(screen.getByText(imageElement.legend)).exists();
    assert.dom(screen.getByText(imageElement.licence)).exists();
    assert.false(imgElement.hasAttribute('width'));
    assert.false(imgElement.hasAttribute('height'));
  });

  module('when width and height are available', function () {
    test('should extend width to 700px and height respecting aspect-ratio', async function (assert) {
      // given
      const url =
        'https://assets.pix.org/modules/bien-ecrire-son-adresse-mail-explication-les-parties-dune-adresse-mail.svg';

      const imageElement = {
        url,
        alt: 'alt text',
        alternativeText: 'alternative instruction',
        legend: 'je suis une légende',
        licence: 'Je suis une licence',
        infos: { width: 1920, height: 1280, type: 'vector' },
      };

      //  when
      const screen = await render(<template><ModulixImageElement @image={{imageElement}} /></template>);

      // then
      assert.ok(screen);
      assert.strictEqual(findAll('.element-image').length, 1);
      const imgElement = screen.getByRole('img', { name: 'alt text' });
      assert.dom(imgElement).hasAttribute('src', url);
      assert.dom(imgElement).hasAttribute('width', '700');
      const expectedHeight = Math.round(
        (ModulixImageElement.MAX_WIDTH * imageElement.infos.height) / imageElement.infos.width,
      );
      assert.dom(imgElement).hasAttribute('height', `${expectedHeight}`);
    });
  });

  module('when image has a maxWidth', function () {
    test('should extend width to the given maxWidth and apply it as max-width style', async function (assert) {
      // given
      const url =
        'https://assets.pix.org/modules/bien-ecrire-son-adresse-mail-explication-les-parties-dune-adresse-mail.svg';

      const imageElement = {
        url,
        alt: 'alt text',
        alternativeText: 'alternative instruction',
        infos: { width: 1920, height: 1280, type: 'vector' },
        maxWidth: 400,
      };

      //  when
      const screen = await render(<template><ModulixImageElement @image={{imageElement}} /></template>);

      // then
      const imgElement = screen.getByRole('img', { name: 'alt text' });
      assert.dom(imgElement).hasAttribute('width', '400');
      const expectedHeight = Math.round((imageElement.maxWidth * imageElement.infos.height) / imageElement.infos.width);
      assert.dom(imgElement).hasAttribute('height', `${expectedHeight}`);
      assert.dom(imgElement).hasStyle({ 'max-width': 'min(400px, 100%)' });
    });

    test('should cap the maxWidth to 700px when the given maxWidth is greater than 700', async function (assert) {
      // given
      const url =
        'https://assets.pix.org/modules/bien-ecrire-son-adresse-mail-explication-les-parties-dune-adresse-mail.svg';

      const imageElement = {
        url,
        alt: 'alt text',
        alternativeText: 'alternative instruction',
        infos: { width: 1920, height: 1280, type: 'vector' },
        maxWidth: 900,
      };

      //  when
      const screen = await render(<template><ModulixImageElement @image={{imageElement}} /></template>);

      // then
      const imgElement = screen.getByRole('img', { name: 'alt text' });
      assert.dom(imgElement).hasAttribute('width', '700');
      assert.dom(imgElement).hasStyle({ 'max-width': 'min(700px, 100%)' });
    });

    test('should fallback to 700px when maxWidth is zero', async function (assert) {
      // given
      const url =
        'https://assets.pix.org/modules/bien-ecrire-son-adresse-mail-explication-les-parties-dune-adresse-mail.svg';

      const imageElement = {
        url,
        alt: 'alt text',
        alternativeText: 'alternative instruction',
        infos: { width: 1920, height: 1280, type: 'vector' },
        maxWidth: 0,
      };

      //  when
      const screen = await render(<template><ModulixImageElement @image={{imageElement}} /></template>);

      // then
      const imgElement = screen.getByRole('img', { name: 'alt text' });
      assert.dom(imgElement).hasAttribute('width', '700');
      assert.dom(imgElement).hasStyle({ 'max-width': 'min(700px, 100%)' });
    });

    test('should still shrink to its container width even when maxWidth is set', async function (assert) {
      // given
      const url =
        'https://assets.pix.org/modules/bien-ecrire-son-adresse-mail-explication-les-parties-dune-adresse-mail.svg';

      const imageElement = {
        url,
        alt: 'alt text',
        alternativeText: 'alternative instruction',
        infos: { width: 1920, height: 1280, type: 'vector' },
        maxWidth: 400,
      };

      //  when
      const screen = await render(<template><ModulixImageElement @image={{imageElement}} /></template>);

      // then
      const imgElement = screen.getByRole('img', { name: 'alt text' });
      assert.dom(imgElement).hasAttribute('style', 'max-width: min(400px, 100%)');
    });
  });

  test('should be able to open and close the modal for alternative instruction', async function (assert) {
    // given
    const alternativeText = 'alternative instruction';

    const imageElement = {
      url: 'https://assets.pix.org/modules/bien-ecrire-son-adresse-mail-explication-les-parties-dune-adresse-mail.svg',
      alt: 'alt text',
      alternativeText,
    };
    const onImageAlternativeTextOpenStub = sinon.stub();

    //  when
    const screen = await render(
      <template>
        <ModulixImageElement @image={{imageElement}} @onAlternativeTextOpen={{onImageAlternativeTextOpenStub}} />
      </template>,
    );

    // then
    await click(screen.getByRole('button', { name: "Afficher l'alternative textuelle" }));
    assert.ok(await screen.findByRole('dialog'));
    assert.ok(screen.getByText(alternativeText));
    assert.ok(onImageAlternativeTextOpenStub.calledOnce);

    await click(screen.getByRole('button', { name: 'Fermer' }));
    await waitForDialogClose();

    assert.dom(screen.queryByRole('dialog')).doesNotExist();
  });

  test('should not be able to open the modal if there is no alternative instruction', async function (assert) {
    // given
    const imageElement = {
      url: 'https://assets.pix.org/modules/bien-ecrire-son-adresse-mail-explication-les-parties-dune-adresse-mail.svg',
      alt: 'alt text',
      alternativeText: '',
    };

    //  when
    const screen = await render(<template><ModulixImageElement @image={{imageElement}} /></template>);

    // then
    const alternativeTextButton = await screen.queryByRole('button', { name: "Afficher l'alternative textuelle" });
    assert.dom(alternativeTextButton).doesNotExist();
  });

  module('when the image url is missing', function () {
    test('it should not display the image and display a fallback message', async function (assert) {
      // given
      const imageElement = {
        url: null,
        alt: 'alt text',
        alternativeText: '',
      };

      // when
      const screen = await render(<template><ModulixImageElement @image={{imageElement}} /></template>);

      // then
      assert.dom(screen.queryByRole('img')).doesNotExist();
      assert.dom(screen.getByText(t('pages.modulix.elements.image.missing-content'))).exists();
      assert.dom(screen.queryByText(t('pages.modulix.elements.image.consult-alternative-text'))).doesNotExist();
    });

    module('when there is an alternative text', function () {
      test('it should display an alternative text message', async function (assert) {
        // given
        const imageElement = {
          url: null,
          alt: 'alt text',
          alternativeText: 'alternative instruction',
        };

        // when
        const screen = await render(<template><ModulixImageElement @image={{imageElement}} /></template>);

        // then
        assert.dom(screen.getByText(t('pages.modulix.elements.image.consult-alternative-text'))).exists();
      });
    });
  });

  module('when the image fails to load', function () {
    test('it should hide the image and display a fallback message', async function (assert) {
      // given
      const imageElement = {
        url: 'https://assets.pix.org/draft/flamingo.jpg',
        alt: 'alt text',
        alternativeText: '',
      };

      // when
      const screen = await render(<template><ModulixImageElement @image={{imageElement}} /></template>);

      // then
      assert.dom(screen.getByRole('img')).exists();
      assert.dom(screen.queryByText(t('pages.modulix.elements.image.missing-content'))).doesNotExist();

      // when
      await triggerEvent('img', 'error');

      // then
      assert.dom(screen.queryByRole('img')).doesNotExist();
      assert.dom(screen.getByText(t('pages.modulix.elements.image.missing-content'))).exists();
      assert.dom(screen.queryByText(t('pages.modulix.elements.image.consult-alternative-text'))).doesNotExist();
    });

    module('when there is an alternative text', function () {
      test('it should display an alternative text message', async function (assert) {
        // given
        const imageElement = {
          url: 'https://assets.pix.org/draft/flamingo.jpg',
          alt: 'alt text',
          alternativeText: 'alternative instruction',
        };

        // when
        const screen = await render(<template><ModulixImageElement @image={{imageElement}} /></template>);
        await triggerEvent('img', 'error');

        // then
        assert.dom(screen.queryByRole('img')).doesNotExist();
        assert.dom(screen.getByText(t('pages.modulix.elements.image.missing-content'))).exists();
        assert.dom(screen.getByText(t('pages.modulix.elements.image.consult-alternative-text'))).exists();
      });
    });
  });
});
