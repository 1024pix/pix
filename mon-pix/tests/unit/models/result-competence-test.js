import { get } from '@ember/object';
import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';

describe('Unit | Model | result-competence model', function() {
  setupTest();

  let store;

  beforeEach(function() {
    store = this.owner.lookup('service:store');
  });

  it('exists', function() {
    const model = store.createRecord('result-competence');
    expect(model).to.be.ok;
  });

  describe('#area relationship', () => {

    it('should exist', function() {
      // given
      const Competence = store.modelFor('result-competence');

      // when
      const relationship = get(Competence, 'relationshipsByName').get('area');

      // then
      expect(relationship.key).to.equal('area');
      expect(relationship.kind).to.equal('belongsTo');
    });
  });
});
