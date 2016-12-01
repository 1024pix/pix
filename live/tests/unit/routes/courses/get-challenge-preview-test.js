import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';

describe('Unit | Route | ChallengePreview', function() {

  setupTest('route:courses/get-challenge-preview', {});

  it('exists', function() {
    let route = this.subject();
    expect(route).to.be.ok;
  });

});

