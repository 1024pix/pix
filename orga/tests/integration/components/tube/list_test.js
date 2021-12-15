import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { clickByName } from '@1024pix/ember-testing-library';

module('Integration | Component | tube:list', function (hooks) {
  setupRenderingTest(hooks);
  let tubes;

  hooks.beforeEach(() => {
    tubes = [
      {
        id: 'tubeId1',
        practicalTitle: 'Titre 1',
        practicalDescription: 'Description 1',
      },
      {
        id: 'tubeId2',
        practicalTitle: 'Titre 2',
        practicalDescription: 'Description 2',
      },
    ];
  });

  test('it should display a list of tubes', async function (assert) {
    // given
    this.set('tubes', tubes);

    // when
    await render(hbs`<Tube::list @tubes={{this.tubes}}/>`);

    // then
    assert.dom('.row-tube').exists({ count: 2 });
    assert.dom(this.element.querySelector('.row-tube')).hasText('Titre 1 : Description 1');
  });

  test('Disable the download button if not tube is selected', async function (assert) {
    // given
    this.set('tubes', tubes);

    // when
    await render(hbs`<Tube::list @tubes={{this.tubes}}/>`);

    // then
    assert.dom('.download-file__button').hasClass('pix-button--disabled');
  });

  test('Enabled the download button if a tube is selected', async function (assert) {
    // given
    this.set('tubes', tubes);

    // when
    await render(hbs`<Tube::list @tubes={{this.tubes}}/>`);
    await clickByName('Titre 1 : Description 1');

    // then
    assert.dom('.download-file__button').doesNotHaveClass('pix-button--disabled');
  });
});
