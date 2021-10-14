import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';
import { expect } from 'chai';

describe('Unit | Model | Email-Verification-Code', function () {
  setupTest();

  it('exists', function () {
    // given
    const store = this.owner.lookup('service:store');
    const emailVerificationCode = store.createRecord('email-verification-code');

    // when & then
    expect(emailVerificationCode).to.be.ok;
  });
});
