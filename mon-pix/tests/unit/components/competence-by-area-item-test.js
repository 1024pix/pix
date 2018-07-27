import EmberObject from '@ember/object';
import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';

describe('Unit | Component | Competence area item Component', function() {

  setupTest('component:competence-by-area-item', {});

  describe('#Computed Properties behaviors: ', function() {

    describe('#_competencesAreaName', function() {
      it('should return Area name related to competences without index number', function() {
        // given
        const component = this.subject();

        // when
        component.set('competenceArea', {
          property: 'areaName',
          value: '2. area-A',
          items: [{ id: 2, name: 'competence-2', areaName: '2. area-A' }]
        });

        // then
        expect(component.get('_competencesAreaName')).to.equal('area-A');
      });

      it('should return empty Area name related to competences when it does not exist', function() {
        // given
        const component = this.subject();

        // when
        component.set('competenceArea', {});

        // then
        expect(component.get('_competencesAreaName')).to.equal('');
      });

    });

    describe('#_competencesSortedList', () => {

      it('should display sorted competences', function() {
        // given
        const component = this.subject();

        const competencesWithSameArea = [
          EmberObject.create({ id: 2, name: 'competence-name-2', index: '1.2', area: 'area-id-1', level: -1 }),
          EmberObject.create({ id: 3, name: 'competence-name-3', index: '1.3', area: 'area-id-1', level: -1 }),
          EmberObject.create({ id: 1, name: 'competence-name-1', index: '1.1', area: 'area-id-1', level: -1 })
        ];
        const areaWithManyCompetences = {
          property: 'area',
          value: 'Information et données',
          items: competencesWithSameArea
        };

        // when
        component.set('competenceArea', areaWithManyCompetences);
        // then
        expect(component.get('_competencesSortedList')).to.deep.equal([
          EmberObject.create({
            id: 1,
            name: 'competence-name-1',
            index: '1.1',
            area: 'area-id-1',
            level: -1
          }),
          EmberObject.create({
            id: 2,
            name: 'competence-name-2',
            index: '1.2',
            area: 'area-id-1',
            level: -1
          }),
          EmberObject.create({
            id: 3,
            name: 'competence-name-3',
            index: '1.3',
            area: 'area-id-1',
            level: -1
          })]
        );

      });
    });

  });
});
