import { expect } from 'chai';
import { describe, it } from 'mocha';
import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import findByLabel from '../../../helpers/find-by-label';
import { contains } from '../../../helpers/contains';
import ENV from 'mon-pix/config/environment';
import sinon from 'sinon';
import { clickByLabel } from '../../../helpers/click-by-label';

describe('Integration | Component | user-account | email-verification-code', function() {
  setupIntlRenderingTest();

  it('should not display resend code message at the beginning', async function() {
    // given
    this.set('email', 'toto@example.net');

    // when
    await render(hbs`<UserAccount::EmailVerificationCode @email={{this.email}} />`);

    // then
    expect(findByLabel(this.intl.t('pages.email-verification.did-not-receive'))).not.to.have.class('visible');
  });

  it(`should display a resend code message after ${ENV.APP.MILLISECONDS_BEFORE_MAIL_RESEND} milliseconds`, function() {
    // given
    const email = 'toto@example.net';
    const password = 'pix123';
    this.set('email', email);
    this.set('password', password);

    const clock = sinon.useFakeTimers();

    // when
    const promise = render(hbs`<UserAccount::EmailVerificationCode @email={{this.email}} @password={{this.password}} />`);
    clock.tick(ENV.APP.MILLISECONDS_BEFORE_MAIL_RESEND);

    const result = promise.then(async () => {
      expect(contains(this.intl.t('pages.email-verification.did-not-receive'))).to.exist;
      expect(contains(this.intl.t('pages.email-verification.send-back-the-code'))).to.exist;
    });
    clock.restore();
    return result;
  });

  it('should show confirmation message when resending code message', function() {
    // given
    const email = 'toto@example.net';
    const password = 'pix123';
    this.set('email', email);
    this.set('password', password);

    const store = this.owner.lookup('service:store');
    const sendNewEmailStub = sinon.stub();
    store.createRecord = sinon.stub();
    store.createRecord
      .withArgs('email-verification-code', { password, newEmail: email })
      .returns({ sendNewEmail: sendNewEmailStub });

    const clock = sinon.useFakeTimers();

    // when
    const promise = render(hbs`<UserAccount::EmailVerificationCode @email={{this.email}} @password={{this.password}} />`);
    clock.tick(ENV.APP.MILLISECONDS_BEFORE_MAIL_RESEND);

    const result = promise.then(async () => {
      await clickByLabel(this.intl.t('pages.email-verification.send-back-the-code'));

      // then
      expect(contains(this.intl.t('pages.email-verification.confirmation-message'))).to.exist;
      expect(contains(this.intl.t('pages.email-verification.send-back-the-code'))).to.not.exist;
    });
    clock.restore();
    return result;
  });
});
