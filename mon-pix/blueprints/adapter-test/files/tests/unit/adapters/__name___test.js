import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';

describe('Unit | Adapter | <%= dasherizedModuleName %>', function () {
  setupTest();

  // Replace this with your real tests.
  it('exists', function () {
    const adapter = this.owner.lookup('adapter:<%= classifiedModuleName %>');
    expect(adapter).to.be.ok;
  });
});
