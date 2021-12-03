import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | tube:list', function (hooks) {
  setupRenderingTest(hooks);

  test('it should display a list of tubes', async function (assert) {
    // given
    const tubes = [
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
    this.set('tubes', tubes);

    // when
    await render(hbs`<Tube::list @tubes={{this.tubes}}/>`);

    // then
    assert.dom('.row-tube').exists({ count: 2 });
    assert.dom(this.element.querySelector('.row-tube')).hasText('Titre 1 : Description 1');
  });
});
