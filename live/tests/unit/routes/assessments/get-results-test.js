import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';

describe('Unit | Route | Assessments.ResultsRoute', function() {

  setupTest('route:assessments.get-results', {});

  it('exists', function() {
    let route = this.subject();
    expect(route).to.be.ok;
  });

});
