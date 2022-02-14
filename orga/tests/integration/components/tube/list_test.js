import { module, test } from 'qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { clickByName } from '@1024pix/ember-testing-library';
import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';
import moment from 'moment';
import sinon from 'sinon';

module('Integration | Component | tube:list', function (hooks) {
  setupIntlRenderingTest(hooks);
  let areas;
  let momentStub;
  const MOCK_TODAY = '2020-08-05-1152';

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
    const thematics = [{ id: 'thematicId', name: 'thematic1', tubes }];
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

    momentStub = sinon.stub(moment.prototype, 'format').returns(MOCK_TODAY);
  });

  hooks.afterEach(() => {
    momentStub.restore();
  });

  test('it should display a list of tubes', async function (assert) {
    // given
    this.set('areas', areas);

    // when
    await render(hbs`<Tube::list @areas={{this.areas}}/>`);

    // then
    assert.dom('.row-tube').exists({ count: 2 });
    assert.dom(this.element.querySelector('[for="tube-tubeId1"]')).hasText('Titre 1 : Description 1');
    assert.dom(this.element.querySelector('[for="tube-tubeId2"]')).hasText('Titre 2 : Description 2');
  });

  test('it should disable the download button if not tube is selected', async function (assert) {
    // given
    this.set('areas', areas);

    // when
    await render(hbs`<Tube::list @areas={{this.areas}}/>`);

    // then
    assert.dom('.download-file__button').hasClass('pix-button--disabled');
  });

  test('it should enable the download button if a tube is selected', async function (assert) {
    const expectedAttr = `selection-sujets-mon orga-${MOCK_TODAY}.json`;
    this.set('areas', areas);
    this.set('organization', { name: 'mon orga' });

    // when
    await render(hbs`<Tube::list @areas={{this.areas}} @organization={{this.organization}}/>`);
    await clickByName('1 · Titre domaine');
    await clickByName('Titre 1 : Description 1');

    // then
    assert.dom('.download-file__button').doesNotHaveClass('pix-button--disabled');
    assert.dom(`.download-file__button[download="${expectedAttr}"]`).exists();
  });

  test('Enable the download button if a thematic is selected', async function (assert) {
    // given
    this.set('areas', areas);

    // when
    await render(hbs`<Tube::list @areas={{this.areas}}/>`);
    await clickByName('1 · Titre domaine');
    await clickByName('thematic1');

    // then
    assert.dom('.download-file__button').doesNotHaveClass('pix-button--disabled');
  });

  test('Should check all tubes corresponding to the thematics if a thematic is selected', async function (assert) {
    // given
    this.set('areas', areas);

    // when
    await render(hbs`<Tube::list @areas={{this.areas}}/>`);
    const tube1 = document.getElementById('tube-tubeId1');
    const tube2 = document.getElementById('tube-tubeId2');
    await clickByName('1 · Titre domaine');
    await clickByName('thematic1');

    // then
    assert.dom(tube1).isChecked();
    assert.dom(tube2).isChecked();
  });

  test('Should check the thematics if all corresponding tubes are selected', async function (assert) {
    // given
    this.set('areas', areas);

    // when
    await render(hbs`<Tube::list @areas={{this.areas}}/>`);
    const thematic = document.getElementById('thematic-thematicId');
    await clickByName('1 · Titre domaine');
    await clickByName('Titre 1 : Description 1');
    await clickByName('Titre 2 : Description 2');

    // then
    assert.dom(thematic).isChecked();
  });
});
