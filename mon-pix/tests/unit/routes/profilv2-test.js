import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';

describe('Unit | Route | profil-v2', function() {
  setupTest();

  it('exists', function() {
    const route = this.owner.lookup('route:profilv2');
    expect(route).to.be.ok;
  });
});
