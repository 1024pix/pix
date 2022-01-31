import { module, test } from 'qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { clickByName } from '@1024pix/ember-testing-library';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | tube:list', function (hooks) {
  setupIntlRenderingTest(hooks);
  let areas;

  hooks.beforeEach(() => {
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
    const thematics = [{ tubes }];
    const competences = [
      {
        get sortedThematics() {
          return thematics;
        },
      },
    ];
    areas = [
      {
        title: 'Titre domaine',
        code: 1,
        get sortedCompetences() {
          return competences;
        },
      },
    ];
  });

  test('it should display a list of tubes', async function (assert) {
    // given
    this.set('areas', areas);

    // when
    await render(hbs`<Tube::list @areas={{this.areas}}/>`);

    // then
    assert.dom('.row-tube').exists({ count: 2 });
    assert.dom(this.element.querySelector('.row-tube')).hasText('Titre 1 : Description 1');
  });

  test('Disable the download button if not tube is selected', async function (assert) {
    // given
    this.set('areas', areas);

    // when
    await render(hbs`<Tube::list @areas={{this.areas}}/>`);

    // then
    assert.dom('.download-file__button').hasClass('pix-button--disabled');
  });

  test('Enable the download button if a tube is selected', async function (assert) {
    // given
    this.set('areas', areas);

    // when
    await render(hbs`<Tube::list @areas={{this.areas}}/>`);
    await clickByName('1 · Titre domaine');
    await clickByName('Titre 1 : Description 1');

    // then
    assert.dom('.download-file__button').doesNotHaveClass('pix-button--disabled');
  });
});
