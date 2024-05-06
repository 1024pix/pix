import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';

import createGlimmerComponent from '../../../helpers/create-glimmer-component';

module('Unit | Component | Tube::List', function (hooks) {
  setupTest(hooks);

  test('should generate a file with selected tubes', async function (assert) {
    // given
    const frameworks = [
      {
        id: 'fmkId1',
        areas: [
          {
            competences: [
              {
                thematics: [
                  {
                    tubes: [{ id: 'tubeId1' }, { id: 'tubeId2' }],
                    get sortedTubes() {
                      return this.tubes;
                    },
                  },
                ],
                get sortedThematics() {
                  return this.thematics;
                },
              },
            ],
            get sortedCompetences() {
              return this.competences;
            },
          },
        ],
        get sortedAreas() {
          return this.areas;
        },
      },
      {
        id: 'fmkId2',
        areas: [
          {
            competences: [
              {
                thematics: [
                  {
                    tubes: [{ id: 'tubeId3' }, { id: 'tubeId4' }],
                    get sortedTubes() {
                      return this.tubes;
                    },
                  },
                ],
                get sortedThematics() {
                  return this.thematics;
                },
              },
            ],
            get sortedCompetences() {
              return this.competences;
            },
          },
        ],
        get sortedAreas() {
          return this.areas;
        },
      },
    ];
    const component = await createGlimmerComponent('component:tube/list', { frameworks });
    const expectedFile = JSON.stringify([
      { id: 'tubeId1', frameworkId: 'fmkId1' },
      { id: 'tubeId4', frameworkId: 'fmkId2' },
    ]);
    component.selectedTubeIds = ['tubeId1', 'tubeId4'];

    // when
    const text = await component.file.text();

    // then
    assert.strictEqual(text, expectedFile);
  });
});
