import { expect } from 'chai';
import { get } from '@ember/object';
import { describe, it } from 'mocha';
import { setupModelTest } from 'ember-mocha';

describe('Unit | Model | Scorecard model', function() {
  setupModelTest('scorecard', {});

  it('exists', function() {
    const model = this.subject();
    expect(model).to.be.ok;
  });

  describe('#area relationship', () => {

    it('should exist', function() {
      // given
      const Scorecard = this.store().modelFor('scorecard');

      // when
      const relationship = get(Scorecard, 'relationshipsByName').get('area');

      // then
      expect(relationship.key).to.equal('area');
      expect(relationship.kind).to.equal('belongsTo');
    });
  });
});
