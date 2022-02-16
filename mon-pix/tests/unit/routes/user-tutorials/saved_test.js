import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';

describe('Unit | Route | user-tutorials-v2/saved', function () {
  setupTest();

  it('exists', function () {
    const route = this.owner.lookup('route:user-tutorials-v2.saved');
    expect(route).to.be.ok;
  });
});
