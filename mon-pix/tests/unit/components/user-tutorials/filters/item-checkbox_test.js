import { describe, it } from 'mocha';
import { expect } from 'chai';
import createGlimmerComponent from '../../../../helpers/create-glimmer-component';
import { setupTest } from 'ember-mocha';
import { A } from '@ember/array';

describe('Unit | Component | User-Tutorials | Filters | ItemCheckbox', function () {
  setupTest();

  it('should throw an error if component has no type param', async function () {
    // given & when
    const componentParams = { item: { name: 'item' } };

    // then
    expect(() => {
      createGlimmerComponent('component:user-tutorials/filters/item-checkbox', componentParams);
    }).to.throw('ERROR in UserTutorials::Filters::ItemCheckbox component, you must provide @type params');
  });

  describe('#isChecked', function () {
    describe('when element is in currentFilters', function () {
      it('should return true', function () {
        // given
        const componentParams = {
          type: 'competences',
          item: { id: 'competenceId1' },
          currentFilters: { competences: A(['competenceId1']) },
        };
        const component = createGlimmerComponent('component:user-tutorials/filters/item-checkbox', componentParams);

        // when
        const result = component.isChecked;

        // then
        expect(result).to.be.true;
      });
    });

    describe('when element is not in currentFilters', function () {
      it('should return false', function () {
        // given
        const componentParams = {
          type: 'competences',
          item: { id: 'competenceId1' },
          currentFilters: { competences: A([]) },
        };
        const component = createGlimmerComponent('component:user-tutorials/filters/item-checkbox', componentParams);

        // when
        const result = component.isChecked;

        // then
        expect(result).to.be.false;
      });
    });
  });
});
