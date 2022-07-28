import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';

describe('Unit | Route | terms-of-service-oidc', function () {
  setupTest();

  it('exists', function () {
    const route = this.owner.lookup('route:TermsOfServiceOidc');
    expect(route).to.be.ok;
  });
});
