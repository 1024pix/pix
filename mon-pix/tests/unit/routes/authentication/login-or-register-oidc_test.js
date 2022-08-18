import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';

describe('Unit | Route | Authentication | login-or-register-oidc', function () {
  setupTest();

  it('exists', function () {
    const route = this.owner.lookup('route:authentication/LoginOrRegisterOidc');
    expect(route).to.be.ok;
  });
});
