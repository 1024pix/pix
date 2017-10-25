import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupComponentTest } from 'ember-mocha';
import hbs from 'htmlbars-inline-precompile';
import Ember from 'ember';

describe('Integration | Component | competence area list', function() {
  setupComponentTest('competence-area-list', {
    integration: true
  });

  describe('Component rendering', function() {
    it('renders', function() {
      // when
      this.render(hbs`{{competence-area-list}}`);

      // then
      expect(this.$()).to.have.lengthOf(1);
    });

    it('should render a wrapper', function() {
      // when
      this.render(hbs`{{competence-area-list}}`);

      // then
      const WRAPPER_CLASS = '.competence-area-list';
      expect(this.$(WRAPPER_CLASS)).to.have.lengthOf(1);
    });

    describe('Rendering when different areas', function() {

      it('should render 5 competence areas, when there are 5 competences with different area for each one', function() {
        // given
        const competencesWithDifferentAreas = [
          Ember.Object.create({ id: 1, name: 'competence-1', areaName: 'area-A' }),
          Ember.Object.create({ id: 2, name: 'competence-2', areaName: 'area-B' }),
          Ember.Object.create({ id: 3, name: 'competence-3', areaName: 'area-C' }),
          Ember.Object.create({ id: 4, name: 'competence-4', areaName: 'area-D' }),
          Ember.Object.create({ id: 5, name: 'competence-5', areaName: 'area-E' })
        ];
        this.set('competences', competencesWithDifferentAreas);

        // when
        this.render(hbs`{{competence-area-list competences=competences}}`);

        // then
        expect(this.$('.competence-area-list__item')).to.have.lengthOf(5);
      });

      it('should render 2 competence areas, when there are 5 competences related to 2 different areas', function() {
        // given
        const competencesWithDifferentAreas = [
          Ember.Object.create({ id: 1, name: 'competence-1', areaName: 'area-A' }),
          Ember.Object.create({ id: 2, name: 'competence-2', areaName: 'area-A' }),
          Ember.Object.create({ id: 3, name: 'competence-3', areaName: 'area-A' }),
          Ember.Object.create({ id: 4, name: 'competence-4', areaName: 'area-B' }),
          Ember.Object.create({ id: 5, name: 'competence-5', areaName: 'area-B' })
        ];
        this.set('competences', competencesWithDifferentAreas);

        // when
        this.render(hbs`{{competence-area-list competences=competences}}`);

        // then
        expect(this.$('.competence-area-list__item')).to.have.lengthOf(2);
      });
    });

    describe('Rendering when same area', function() {
      it('should render only 1 competence area, when there are 5 competences with the same area', function() {
        // given
        const competencesWithSameArea = [
          Ember.Object.create({ id: 1, name: 'competence-1', areaName: 'area-A' }),
          Ember.Object.create({ id: 2, name: 'competence-2', areaName: 'area-A' }),
          Ember.Object.create({ id: 3, name: 'competence-3', areaName: 'area-A' }),
          Ember.Object.create({ id: 4, name: 'competence-4', areaName: 'area-A' }),
          Ember.Object.create({ id: 5, name: 'competence-5', areaName: 'area-A' })
        ];

        // when
        this.set('competences', competencesWithSameArea);
        this.render(hbs`{{competence-area-list competences=competences}}`);
        // then
        expect(this.$('.competence-area-list__item')).to.have.lengthOf(1);
      });
    });

  });
});
