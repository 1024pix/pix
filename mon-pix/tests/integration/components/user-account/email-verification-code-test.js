import { expect } from 'chai';
import { describe, it } from 'mocha';
import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';
import { render, triggerEvent } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import findByLabel from '../../../helpers/find-by-label';
import { contains } from '../../../helpers/contains';
import ENV from 'mon-pix/config/environment';
import sinon from 'sinon';
import { clickByLabel } from '../../../helpers/click-by-label';

describe('Integration | Component | user-account | email-verification-code', function () {
  setupIntlRenderingTest();

  context('resend code message', function () {
    it('should not display resend code message at the beginning', async function () {
      // given
      this.set('email', 'toto@example.net');

      // when
      await render(hbs`<UserAccount::EmailVerificationCode @email={{this.email}} />`);

      // then
      expect(findByLabel(this.intl.t('pages.user-account.email-verification.did-not-receive'))).not.to.have.class(
        'visible'
      );
    });

    it(`should display a resend code message after ${ENV.APP.MILLISECONDS_BEFORE_MAIL_RESEND} milliseconds`, function () {
      // given
      const email = 'toto@example.net';
      const password = 'pix123';
      this.set('email', email);
      this.set('password', password);

      const clock = sinon.useFakeTimers();

      // when
      const promise = render(
        hbs`<UserAccount::EmailVerificationCode @email={{this.email}} @password={{this.password}} />`
      );
      clock.tick(ENV.APP.MILLISECONDS_BEFORE_MAIL_RESEND);

      const result = promise.then(async () => {
        expect(contains(this.intl.t('pages.user-account.email-verification.did-not-receive'))).to.exist;
        expect(contains(this.intl.t('pages.user-account.email-verification.send-back-the-code'))).to.exist;
      });
      clock.restore();
      return result;
    });

    it('should prevent multiple requests to resend verification code', function () {
      // given
      const email = 'toto@example.net';
      const password = 'pix123';
      this.set('email', email);
      this.set('password', password);

      const store = this.owner.lookup('service:store');
      store.createRecord = sinon.stub();
      store.createRecord
        .withArgs('email-verification-code', { password, newEmail: email })
        .returns({ sendNewEmail: () => new Promise(() => {}) });

      const clock = sinon.useFakeTimers();

      // when
      const promise = render(
        hbs`<UserAccount::EmailVerificationCode @email={{this.email}} @password={{this.password}} />`
      );
      clock.tick(ENV.APP.MILLISECONDS_BEFORE_MAIL_RESEND);

      const result = promise.then(async () => {
        await clickByLabel(this.intl.t('pages.user-account.email-verification.send-back-the-code'));

        // then
        expect(findByLabel(this.intl.t('pages.user-account.email-verification.send-back-the-code')).disabled).to.be
          .true;
      });
      clock.restore();
      return result;
    });

    it('should show confirmation message when resending code message', function () {
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
      const promise = render(
        hbs`<UserAccount::EmailVerificationCode @email={{this.email}} @password={{this.password}} />`
      );
      clock.tick(ENV.APP.MILLISECONDS_BEFORE_MAIL_RESEND);

      const result = promise.then(async () => {
        await clickByLabel(this.intl.t('pages.user-account.email-verification.send-back-the-code'));

        // then
        expect(contains(this.intl.t('pages.user-account.email-verification.confirmation-message'))).to.exist;
        expect(contains(this.intl.t('pages.user-account.email-verification.send-back-the-code'))).to.not.exist;
      });
      clock.restore();
      return result;
    });
  });

  context('after entering code', function () {
    it('should show invalid code message when receiving 403', async function () {
      // given
      const store = this.owner.lookup('service:store');
      const disableEmailEditionMode = sinon.stub();
      const displayEmailUpdateMessage = sinon.stub();
      this.set('disableEmailEditionMode', disableEmailEditionMode);
      this.set('displayEmailUpdateMessage', displayEmailUpdateMessage);
      this.set('email', 'toto@example.net');
      const verifyCode = sinon.stub().throws({ errors: [{ status: '403', code: 'INVALID_VERIFICATION_CODE' }] });
      store.createRecord = () => ({ verifyCode });

      await render(hbs`<UserAccount::EmailVerificationCode
        @email={{this.email}}
        @disableEmailEditionMode={{this.disableEmailEditionMode}}
        @displayEmailUpdateMessage={{this.displayEmailUpdateMessage}}
      />`);

      // when
      await triggerEvent('#code-input-1', 'paste', { clipboardData: { getData: () => '123456' } });

      // then
      sinon.assert.notCalled(disableEmailEditionMode);
      sinon.assert.notCalled(displayEmailUpdateMessage);
      expect(contains(this.intl.t('pages.user-account.email-verification.errors.incorrect-code'))).to.exist;
    });

    it('should show demand expired message when receiving 403', async function () {
      // given
      const store = this.owner.lookup('service:store');
      const disableEmailEditionMode = sinon.stub();
      const displayEmailUpdateMessage = sinon.stub();
      this.set('disableEmailEditionMode', disableEmailEditionMode);
      this.set('displayEmailUpdateMessage', displayEmailUpdateMessage);
      this.set('email', 'toto@example.net');
      const verifyCode = sinon.stub().throws({
        errors: [
          {
            status: '403',
            code: 'EXPIRED_OR_NULL_EMAIL_MODIFICATION_DEMAND',
          },
        ],
      });
      store.createRecord = () => ({ verifyCode });

      await render(hbs`<UserAccount::EmailVerificationCode
        @email={{this.email}}
        @disableEmailEditionMode={{this.disableEmailEditionMode}}
        @displayEmailUpdateMessage={{this.displayEmailUpdateMessage}}
      />`);

      // when
      await triggerEvent('#code-input-1', 'paste', { clipboardData: { getData: () => '123456' } });

      // then
      sinon.assert.notCalled(disableEmailEditionMode);
      sinon.assert.notCalled(displayEmailUpdateMessage);
      expect(
        contains(this.intl.t('pages.user-account.email-verification.errors.email-modification-demand-expired'))
      ).to.exist;
    });

    it('should show email already exists message when receiving 400', async function () {
      // given
      const store = this.owner.lookup('service:store');
      const disableEmailEditionMode = sinon.stub();
      const displayEmailUpdateMessage = sinon.stub();
      this.set('disableEmailEditionMode', disableEmailEditionMode);
      this.set('displayEmailUpdateMessage', displayEmailUpdateMessage);
      this.set('email', 'toto@example.net');
      const verifyCode = sinon.stub().throws({
        errors: [
          {
            status: '400',
            code: 'ACCOUNT_WITH_EMAIL_ALREADY_EXISTS',
          },
        ],
      });
      store.createRecord = () => ({ verifyCode });

      await render(hbs`<UserAccount::EmailVerificationCode
        @email={{this.email}}
        @disableEmailEditionMode={{this.disableEmailEditionMode}}
        @displayEmailUpdateMessage={{this.displayEmailUpdateMessage}}
      />`);

      // when
      await triggerEvent('#code-input-1', 'paste', { clipboardData: { getData: () => '123456' } });

      // then
      sinon.assert.notCalled(disableEmailEditionMode);
      sinon.assert.notCalled(displayEmailUpdateMessage);
      expect(contains(this.intl.t('pages.user-account.email-verification.errors.new-email-already-exist'))).to.exist;
    });

    it('should show error message when receiving 500', async function () {
      // given
      const store = this.owner.lookup('service:store');
      const disableEmailEditionMode = sinon.stub();
      const displayEmailUpdateMessage = sinon.stub();
      this.set('disableEmailEditionMode', disableEmailEditionMode);
      this.set('displayEmailUpdateMessage', displayEmailUpdateMessage);
      this.set('email', 'toto@example.net');
      const verifyCode = sinon.stub().throws({ errors: [{ status: '500' }] });
      store.createRecord = () => ({ verifyCode });

      await render(hbs`<UserAccount::EmailVerificationCode
        @email={{this.email}}
        @disableEmailEditionMode={{this.disableEmailEditionMode}}
        @displayEmailUpdateMessage={{this.displayEmailUpdateMessage}}
      />`);

      // when
      await triggerEvent('#code-input-1', 'paste', { clipboardData: { getData: () => '123456' } });

      // then
      sinon.assert.notCalled(disableEmailEditionMode);
      sinon.assert.notCalled(displayEmailUpdateMessage);
      expect(contains(this.intl.t('pages.user-account.email-verification.errors.unknown-error'))).to.exist;
    });
  });
});
