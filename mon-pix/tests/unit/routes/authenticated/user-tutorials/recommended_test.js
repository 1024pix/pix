import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';

describe('Unit | Route | user-tutorials/recommended', function () {
  setupTest();

  it('exists', function () {
    const route = this.owner.lookup('route:authenticated.user-tutorials.recommended');
    expect(route).to.be.ok;
  });
});
