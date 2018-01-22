import { run } from '@ember/runloop';
import { get } from '@ember/object';
import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupModelTest } from 'ember-mocha';

describe('Unit | Model | competence model', function() {
  setupModelTest('competence', {
    needs: ['model:area']
  });

  it('exists', function() {
    const model = this.subject();
    expect(model).to.be.ok;
  });

  describe('#area relationship', () => {

    it('should exist', function() {
      // given
      const Competence = this.store().modelFor('competence');

      // when
      const relationship = get(Competence, 'relationshipsByName').get('area');

      // then
      expect(relationship.key).to.equal('area');
      expect(relationship.kind).to.equal('belongsTo');
    });
  });

  describe('#areaName computed property', () => {

    it('should be an alias for "area" relationship on "name" property', function() {
      run(() => {
        // given
        const store = this.store();
        const area = store.createRecord('area', { name: 'coucou' });
        const competence = this.subject({ area });

        // when
        const areaName = competence.get('areaName');

        // then
        expect(areaName).to.equal('coucou');
      });
    });
  });

});
