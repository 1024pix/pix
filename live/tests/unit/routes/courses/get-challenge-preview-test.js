import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';

describe('Unit | Route | ChallengePreview', function() {

  setupTest('route:courses/get-challenge-preview', {});

  it('exists', function() {
    const route = this.subject();
    expect(route).to.be.ok;
  });

});

