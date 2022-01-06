import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';

describe('Unit | Route | <%= dasherizedModuleName %>', function () {
  setupTest();

  it('exists', function () {
    const route = this.owner.lookup('route:<%= classifiedModuleName %>');
    expect(route).to.be.ok;
  });
});
