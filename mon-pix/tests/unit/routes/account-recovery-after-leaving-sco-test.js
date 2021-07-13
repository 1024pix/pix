import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';

describe('Unit | Route | account-recovery-after-leaving-sco', function() {
  setupTest();

  it('exists', function() {
    const route = this.owner.lookup('route:account-recovery-after-leaving-sco');
    expect(route).to.be.ok;
  });
});
