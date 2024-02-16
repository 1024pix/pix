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
      alternativeText: 'alternative instruction',
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
    const alternativeText = 'alternative instruction';

    const imageElement = store.createRecord('image', {
      url: 'https://images.pix.fr/modulix/bien-ecrire-son-adresse-mail-explication-les-parties-dune-adresse-mail.svg',
      alt: 'alt text',
      alternativeText,
    });
    const grain = store.createRecord('grain', { id: 'grain-id', elements: [imageElement] });
    store.createRecord('module', { id: 'module-id', grains: [grain] });

    this.set('image', imageElement);

    //  when
    const screen = await render(hbs`<Module::Image @image={{this.image}}/>`);

    // then
    await click(screen.getByRole('button', { name: "Afficher l'alternative textuelle" }));
    assert.ok(await screen.findByRole('dialog'));
    assert.ok(screen.getByText(alternativeText));
  });

  test('should not be able to open the modal if there is no alternative instruction', async function (assert) {
    // given
    const store = this.owner.lookup('service:store');

    const imageElement = store.createRecord('image', {
      url: 'https://images.pix.fr/modulix/bien-ecrire-son-adresse-mail-explication-les-parties-dune-adresse-mail.svg',
      alt: 'alt text',
      alternativeText: '',
    });

    this.set('image', imageElement);

    //  when
    const screen = await render(hbs`<Module::Image @image={{this.image}}/>`);

    // then
    const alternativeTextButton = await screen.queryByRole('button', { name: "Afficher l'alternative textuelle" });
    assert.dom(alternativeTextButton).doesNotExist();
  });
});
