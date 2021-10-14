import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';

describe('Unit | Route | account-recovery | find-sco-record', function () {
  setupTest();

  it('exists', function () {
    const route = this.owner.lookup('route:account-recovery/find-sco-record');
    expect(route).to.be.ok;
  });
});
