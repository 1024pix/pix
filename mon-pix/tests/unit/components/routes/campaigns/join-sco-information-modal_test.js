import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';
import sinon from 'sinon';
import createComponent from '../../../../helpers/create-glimmer-component';
import setupIntl from '../../../../helpers/setup-intl';
import Service from '@ember/service';

describe('Unit | Component | routes/campaigns/join-sco-information-modal', function () {
  setupTest();
  setupIntl();

  describe('#constructor', function () {
    describe('When reconciliation error is provided', function () {
      describe('When error is a 422 status', function () {
        it('should set isAccountBelongingToAnotherUser to true', function () {
          // given
          const reconciliationError = {
            status: '422',
          };

          // when
          const component = createComponent('component:routes/campaigns/join-sco-information-modal', {
            reconciliationError,
          });

          // then
          expect(component.isAccountBelongingToAnotherUser).to.be.true;
        });

        it('should not display continue button', function () {
          // given
          const reconciliationError = {
            status: '422',
          };

          // when
          const component = createComponent('component:routes/campaigns/join-sco-information-modal', {
            reconciliationError,
          });

          // then
          expect(component.displayContinueButton).to.be.false;
        });

        it('should set is isInformationMode to false', function () {
          // given
          const reconciliationError = {
            status: '422',
          };

          // when
          const component = createComponent('component:routes/campaigns/join-sco-information-modal', {
            reconciliationError,
          });

          // then
          expect(component.isInformationMode).to.be.false;
        });
      });

      describe('When error is a 409 status', function () {
        const reconciliationError = {
          status: '409',
          meta: { shortCode: 'R11', value: 'j***@example.net', userId: 1 },
        };

        it('should set is isInformationMode to false', function () {
          // when
          const component = createComponent('component:routes/campaigns/join-sco-information-modal', {
            reconciliationError,
          });

          // then
          expect(component.isInformationMode).to.be.false;
        });

        it('should display error message', function () {
          // given
          const expectedErrorMessage = this.intl.t('api-error-messages.join-error.r11', {
            value: reconciliationError.meta.value,
            htmlSafe: true,
          });

          // when
          const component = createComponent('component:routes/campaigns/join-sco-information-modal', {
            reconciliationError,
          });

          // then
          expect(component.message).to.deep.equal(expectedErrorMessage);
        });

        describe('When error is not related to samlId', function () {
          it('should display continue button', function () {
            // given
            reconciliationError.meta.shortCode = 'R12';

            // when
            const component = createComponent('component:routes/campaigns/join-sco-information-modal', {
              reconciliationError,
            });

            // then
            expect(component.displayContinueButton).to.be.true;
          });
        });

        describe('When error is related to samlId', function () {
          it('should not display continue button', function () {
            // given
            reconciliationError.meta.shortCode = 'R13';

            // when
            const component = createComponent('component:routes/campaigns/join-sco-information-modal', {
              reconciliationError,
            });

            // then
            expect(component.displayContinueButton).to.be.false;
          });
        });
      });
    });

    describe('When reconciliation warning is provided', function () {
      const reconciliationWarning = {
        connectionMethod: 'test@example.net',
        firstName: 'John',
        lastName: 'Doe',
      };

      it('should set is isInformationMode to true', function () {
        // when
        const component = createComponent('component:routes/campaigns/join-sco-information-modal', {
          reconciliationWarning,
        });

        // then
        expect(component.isInformationMode).to.be.true;
      });

      it('should display an information message', function () {
        // given
        const expectedWarningMessage = this.intl.t('pages.join.sco.login-information-message', {
          ...reconciliationWarning,
          htmlSafe: true,
        });

        // when
        const component = createComponent('component:routes/campaigns/join-sco-information-modal', {
          reconciliationWarning,
        });

        // then
        expect(component.message).to.deep.equal(expectedWarningMessage);
      });
    });
  });

  describe('#goToCampaignConnectionForm', function () {
    it('should not redirect user to login page when session is invalidated', function () {
      // given
      const component = createComponent('component:routes/campaigns/join-sco-information-modal');
      const invalidateStub = sinon.stub().resolves();
      const setStub = sinon.stub();
      class SessionStub extends Service {
        invalidate = invalidateStub;
        set = setStub;
      }
      this.owner.register('service:session', SessionStub);

      class CampaignStorageStub extends Service {
        set = sinon.stub();
      }
      this.owner.register('service:campaignStorage', CampaignStorageStub);
      class RouterStub extends Service {
        replaceWith = sinon.stub();
      }
      this.owner.register('service:router', RouterStub);

      // when
      component.goToCampaignConnectionForm();

      // then
      sinon.assert.calledOnce(invalidateStub);
      sinon.assert.calledWith(setStub, 'skipRedirectAfterSessionInvalidation', true);
    });
  });
});
