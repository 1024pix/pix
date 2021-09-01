import { expect } from 'chai';
import { describe, it } from 'mocha';
import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';
import {
  find,
  render,
  click,
} from '@ember/test-helpers';
import { contains } from '../../helpers/contains';
import hbs from 'htmlbars-inline-precompile';
import sinon from 'sinon';

describe('Integration | Component | User account update email validation', () => {

  setupIntlRenderingTest();

  context('when editing e-mail', function() {

    it('should display save and cancel button', async function() {
      // when
      await render(hbs`<UserAccountUpdateEmailValidation/>`);

      // then
      expect(find('[data-test-id="user-account-update-email-validation__cancel-button"]')).to.exist;
      expect(contains(this.intl.t('pages.user-account.account-update-email-validation.save-button'))).to.exist;
    });

    context('when the user cancel edition', function() {
      it('should call disable Email Validation Edition method', async function() {
        // given
        const disableEmailValidationEditionMode = sinon.stub();
        this.set('disableEmailValidationEditionMode', disableEmailValidationEditionMode);

        await render(hbs`<UserAccountUpdateEmailValidation @disableEmailValidationEditionMode={{this.disableEmailValidationEditionMode}} />`);

        // when
        await click('[data-test-id="user-account-update-email-validation__cancel-button"]');

        // then
        sinon.assert.called(disableEmailValidationEditionMode);
      });
    });
  });
});
