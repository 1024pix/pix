import EmberObject from '@ember/object';
import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupRenderingTest } from 'ember-mocha';
import { find, findAll, render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

describe('Integration | Component | competence area list', function() {
  setupRenderingTest();

  describe('Component rendering', function() {
    it('renders', async function() {
      // when
      await render(hbs`{{competence-area-list}}`);

      // then
      expect(find('.competence-area-list')).to.exist;
    });

    it('should render a wrapper', async function() {
      // when
      await render(hbs`{{competence-area-list}}`);

      // then
      const WRAPPER_CLASS = '.competence-area-list';
      expect(find(WRAPPER_CLASS)).to.exist;
    });

    describe('Rendering when different areas', function() {

      it('should render 5 competence areas, when there are 5 competences with different area for each one', async function() {
        // given
        const competencesWithDifferentAreas = [
          EmberObject.create({ id: 1, name: 'competence-1', areaName: 'area-A' }),
          EmberObject.create({ id: 2, name: 'competence-2', areaName: 'area-B' }),
          EmberObject.create({ id: 3, name: 'competence-3', areaName: 'area-C' }),
          EmberObject.create({ id: 4, name: 'competence-4', areaName: 'area-D' }),
          EmberObject.create({ id: 5, name: 'competence-5', areaName: 'area-E' })
        ];
        this.set('competences', competencesWithDifferentAreas);

        // when
        await render(hbs`{{competence-area-list competences=competences}}`);

        // then
        expect(findAll('.competence-area-list__item')).to.have.lengthOf(5);
      });

      it('should render 2 competence areas, when there are 5 competences related to 2 different areas', async function() {
        // given
        const competencesWithDifferentAreas = [
          EmberObject.create({ id: 1, name: 'competence-1', areaName: 'area-A' }),
          EmberObject.create({ id: 2, name: 'competence-2', areaName: 'area-A' }),
          EmberObject.create({ id: 3, name: 'competence-3', areaName: 'area-A' }),
          EmberObject.create({ id: 4, name: 'competence-4', areaName: 'area-B' }),
          EmberObject.create({ id: 5, name: 'competence-5', areaName: 'area-B' })
        ];
        this.set('competences', competencesWithDifferentAreas);

        // when
        await render(hbs`{{competence-area-list competences=competences}}`);

        // then
        expect(findAll('.competence-area-list__item')).to.have.lengthOf(2);
      });
    });

    describe('Rendering when same area', function() {
      it('should render only 1 competence area, when there are 5 competences with the same area', async function() {
        // given
        const competencesWithSameArea = [
          EmberObject.create({ id: 1, name: 'competence-1', areaName: 'area-A' }),
          EmberObject.create({ id: 2, name: 'competence-2', areaName: 'area-A' }),
          EmberObject.create({ id: 3, name: 'competence-3', areaName: 'area-A' }),
          EmberObject.create({ id: 4, name: 'competence-4', areaName: 'area-A' }),
          EmberObject.create({ id: 5, name: 'competence-5', areaName: 'area-A' })
        ];

        // when
        this.set('competences', competencesWithSameArea);
        await render(hbs`{{competence-area-list competences=competences}}`);
        // then
        expect(find('.competence-area-list__item')).to.exist;
      });
    });

  });
});
