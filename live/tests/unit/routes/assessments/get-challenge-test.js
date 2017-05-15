import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';

describe('Unit | Route | Assessments.ChallengeRoute', function() {

  setupTest('route:assessments.get-challenge', {
    needs: ['service:assessment']
  });

  it('exists', function() {
    const route = this.subject();
    expect(route).to.be.ok;
  });

});
