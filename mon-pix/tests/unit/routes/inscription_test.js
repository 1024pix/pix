import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';

describe('Unit | Route | inscription', function () {
  setupTest();

  it('exists', function () {
    const route = this.owner.lookup('route:inscription');
    expect(route).to.be.ok;
  });
});
