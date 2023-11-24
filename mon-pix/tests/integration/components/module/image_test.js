import { module, test } from 'qunit';
import { render } from '@1024pix/ember-testing-library';
import { hbs } from 'ember-cli-htmlbars';
import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';
import { click, findAll } from '@ember/test-helpers';

module('Integration | Component | Module | Image', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('should display an image', async function (assert) {
    // given
    const store = this.owner.lookup('service:store');
    const url =
      'https://images.pix.fr/modulix/bien-ecrire-son-adresse-mail-explication-les-parties-dune-adresse-mail.svg';

    const imageElement = store.createRecord('image', {
      url,
      alt: 'alt text',
      alternativeInstruction: 'alternative instruction',
    });

    this.set('image', imageElement);

    //  when
    const screen = await render(hbs`<Module::Image @image={{this.image}}/>`);

    // then
    assert.ok(screen);
    assert.strictEqual(findAll('.element-image').length, 1);
    assert.ok(screen.getByRole('img', { name: 'alt text' }).hasAttribute('src', url));
    assert.ok(screen.getByRole('button', { name: "Afficher l'alternative textuelle" }));
  });

  test('should be able to use the modal for alternative instruction', async function (assert) {
    // given
    const store = this.owner.lookup('service:store');
    const alternativeInstruction = 'alternative instruction';

    const imageElement = store.createRecord('image', {
      url: 'https://images.pix.fr/modulix/bien-ecrire-son-adresse-mail-explication-les-parties-dune-adresse-mail.svg',
      alt: 'alt text',
      alternativeInstruction,
    });

    this.set('image', imageElement);

    //  when
    const screen = await render(hbs`<Module::Image @image={{this.image}}/>`);

    // then
    await click(screen.getByRole('button', { name: "Afficher l'alternative textuelle" }));
    assert.strictEqual(findAll('.element__image-modal').length, 1);
    assert.ok(screen.getByText(alternativeInstruction));
  });
});
