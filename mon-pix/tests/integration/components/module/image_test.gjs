import { render } from '@1024pix/ember-testing-library';
import { click, findAll } from '@ember/test-helpers';
import ModulixImageElement from 'mon-pix/components/module/element/image';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | Module | Image', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('should display an image', async function (assert) {
    // given
    const url =
      'https://images.pix.fr/modulix/bien-ecrire-son-adresse-mail-explication-les-parties-dune-adresse-mail.svg';

    const imageElement = {
      url,
      alt: 'alt text',
      alternativeText: 'alternative instruction',
    };

    //  when
    const screen = await render(<template><ModulixImageElement @image={{imageElement}} /></template>);

    // then
    assert.ok(screen);
    assert.strictEqual(findAll('.element-image').length, 1);
    assert.ok(screen.getByRole('img', { name: 'alt text' }).hasAttribute('src', url));
    assert.ok(screen.getByRole('button', { name: "Afficher l'alternative textuelle" }));
  });

  test('should be able to use the modal for alternative instruction', async function (assert) {
    // given
    const alternativeText = 'alternative instruction';

    const imageElement = {
      url: 'https://images.pix.fr/modulix/bien-ecrire-son-adresse-mail-explication-les-parties-dune-adresse-mail.svg',
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
  });

  test('should not be able to open the modal if there is no alternative instruction', async function (assert) {
    // given
    const imageElement = {
      url: 'https://images.pix.fr/modulix/bien-ecrire-son-adresse-mail-explication-les-parties-dune-adresse-mail.svg',
      alt: 'alt text',
      alternativeText: '',
    };

    //  when
    const screen = await render(<template><ModulixImageElement @image={{imageElement}} /></template>);

    // then
    const alternativeTextButton = await screen.queryByRole('button', { name: "Afficher l'alternative textuelle" });
    assert.dom(alternativeTextButton).doesNotExist();
  });
});
