import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';

describe('Unit | Component | Competence area list Component', function() {

  setupTest('component:competence-area-list', {});

  describe('Computed Properties behaviors: ', function() {

    describe('#_sanitizedCompetences', function() {
      it('should not return competences', function() {
        // given
        const component = this.subject();

        // when
        component.set('competences', []);

        // then
        expect(component.get('_sanitizedCompetences')).to.deep.equal([]);
      });

      it('should return as many competences as provided', function() {
        // given
        const component = this.subject();

        // when
        component.set('competences', [{
          id: 1,
          name: 'competence-A'
        }, {
          id: 2,
          name: 'competence-B'
        }
        ]);

        // then
        expect(component.get('_sanitizedCompetences')).to.have.lengthOf(2);
      });
    });

    describe('#_competencesGroupedByArea', function() {
      it('should return some competences grouped by areas', function() {
        // given
        const component = this.subject();
        const expectedGroupedCompetences = [
          {
            property: 'areaName',
            value: 'area-A',
            items: [{ id: 1, name: 'competence-1', areaName: 'area-A' }, {
              id: 2,
              name: 'competence-2',
              areaName: 'area-A'
            }]
          },
          { property: 'areaName', value: 'area-B', items: [{ id: 4, name: 'competence-4', areaName: 'area-B' }] },
        ];
        // when
        component.set('competences', [
          { id: 1, name: 'competence-1', areaName: 'area-A' },
          { id: 2, name: 'competence-2', areaName: 'area-A' },
          { id: 4, name: 'competence-4', areaName: 'area-B' }
        ]);

        // then
        expect(component.get('_competencesGroupedByArea')).to.deep.equal(expectedGroupedCompetences);
      });
    });

    describe('#_competencesByAreaSorted', function() {
      it('should return some competences grouped by areas and asc sorted', function() {
        // given
        const component = this.subject();
        const expectedGroupedCompetences = [
          { property: 'areaName', value: '2. area-A', items: [{ id: 2, name: 'competence-2', areaName: '2. area-A' }] },
          { property: 'areaName', value: '4. area-B', items: [{ id: 4, name: 'competence-4', areaName: '4. area-B' }] },
          { property: 'areaName', value: '5. area-C', items: [{ id: 5, name: 'competence-5', areaName: '5. area-C' }] },
        ];
        // when
        component.set('competences', [
          { id: 4, name: 'competence-4', areaName: '4. area-B' },
          { id: 5, name: 'competence-5', areaName: '5. area-C' },
          { id: 2, name: 'competence-2', areaName: '2. area-A' }
        ]);

        // then
        expect(component.get('_competencesByAreaSorted')).to.deep.equal(expectedGroupedCompetences);
      });
    });

  });
});
