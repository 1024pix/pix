import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';

describe('Unit | Route | user-account/language', function() {
  setupTest();

  it('exists', function() {
    let route = this.owner.lookup('route:user-account/language');
    expect(route).to.be.ok;
  });
});
