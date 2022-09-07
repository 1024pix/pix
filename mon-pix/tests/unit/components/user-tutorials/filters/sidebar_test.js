import { describe, it } from 'mocha';
import { expect } from 'chai';
import createGlimmerComponent from '../../../../helpers/create-glimmer-component';
import { setupTest } from 'ember-mocha';

describe('Unit | Component | User-Tutorials | Filters | Sidebar', function () {
  setupTest();

  describe('#handleFilterChange', function () {
    describe('when element is not in array', function () {
      it('should add id on corresponding type array', function () {
        // given
        const type = 'competences';
        const id = 'competenceId1';
        const component = createGlimmerComponent('component:user-tutorials/filters/sidebar');

        // when
        component.handleFilterChange(type, id);

        // then
        expect(component.filters[type].includes(id)).to.be.true;
      });
    });

    describe('when element is already in list', function () {
      it('should remove it', function () {
        // given
        const type = 'competences';
        const id = 'competenceId1';
        const component = createGlimmerComponent('component:user-tutorials/filters/sidebar');
        component.filters[type].pushObject(id);

        // when
        component.handleFilterChange(type, id);

        // then
        expect(component.filters[type].includes(id)).to.be.false;
      });
    });
  });

  describe('#handleResetFilters', function () {
    it('should reset all filters', async function () {
      // given
      const component = createGlimmerComponent('component:user-tutorials/filters/sidebar');
      component.filters.competences = ['competence1', 'competence2'];

      // when
      component.handleResetFilters();

      // then
      expect(component.filters).to.have.property('competences');
      expect(component.filters.competences).to.have.lengthOf(0);
    });
  });
});
