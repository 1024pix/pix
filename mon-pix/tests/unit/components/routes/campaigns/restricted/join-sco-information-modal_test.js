import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';

import createComponent from '../../../../../helpers/create-glimmer-component';
import setupIntl from '../../../../../helpers/setup-intl';

describe('Unit | Component | routes/campaigns/restricted/join-sco-information-modal', function() {

  setupTest();
  setupIntl();

  describe('When reconciliation error is provided', function() {

    const reconciliationError = {
      status: '409',
      meta: { shortCode: 'R11', value: 'j***@example.net', userId: 1 },
    };

    it('should display error message', function() {
      // given
      const expectedErrorMessage = this.intl.t('api-error-messages.join-error.r11', { value: reconciliationError.meta.value });

      // when
      const component = createComponent('component:routes/campaigns/restricted/join-sco-information-modal', { reconciliationError });

      // then
      expect(component.message).to.equal(expectedErrorMessage);
    });

    describe('When error is not related to samlId', function() {

      it('should display continue button', function() {
        // given
        reconciliationError.meta.shortCode = 'R12';

        // when
        const component = createComponent('component:routes/campaigns/restricted/join-sco-information-modal', { reconciliationError });

        // then
        expect(component.displayContinueButton).to.be.true;
      });
    });

    describe('When error is related to samlId', function() {

      it('should not display continue button', function() {
        // given
        reconciliationError.meta.shortCode = 'R13';

        // when
        const component = createComponent('component:routes/campaigns/restricted/join-sco-information-modal', { reconciliationError });

        // then
        expect(component.displayContinueButton).to.be.false;
      });
    });
  });
});
