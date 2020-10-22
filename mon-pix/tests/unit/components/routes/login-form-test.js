import { beforeEach, describe } from 'mocha';
import { expect } from 'chai';
import sinon from 'sinon';
import { setupTest } from 'ember-mocha';

describe('Unit | Component | routes/login-form', function() {

  setupTest();

  let sessionStub;
  let storeStub;
  let routerStub;

  let component;

  beforeEach(function() {

    sessionStub = {
      authenticate: sinon.stub().resolves(),
      isAuthenticated: sinon.stub().returns(true),
      get: sinon.stub(),
      set: sinon.stub(),
      invalidate: sinon.stub(),
    };
    routerStub = {
      replaceWith: sinon.stub(),
    };
    storeStub = {
      createRecord: sinon.stub(),
    };

    component = this.owner.lookup('component:routes/login-form');
    component.session = sessionStub;
    component.store = storeStub;
    component.router = routerStub;
    component.addGarAuthenticationMethodToUser = sinon.stub();
  });

  describe('#authenticate', () => {

    context('when external user IdToken does not exist', () => {

      it('should not notify error when authentication succeeds', async () => {
        // when
        await component.authenticate();

        // then
        expect(component.isErrorMessagePresent).to.be.false;
        expect(component.hasUpdateUserError).to.be.false;
      });

      it('should notify error when authentication fails', async () => {
        // given
        sessionStub.authenticate.rejects(new Error());

        // when
        await component.authenticate();

        // then
        expect(component.isErrorMessagePresent).to.be.true;
        expect(component.hasUpdateUserError).to.be.false;
      });

      it('should redirect to update-expired-password if user should change password', async () => {
        // given
        const expectedRouteName = 'update-expired-password';
        const response = {
          responseJSON: {
            errors: [{ title: 'PasswordShouldChange' }],
          },
        };
        sessionStub.authenticate.rejects(response);

        // when
        await component.authenticate();

        // then
        sinon.assert.calledWith(component.router.replaceWith, expectedRouteName);
      });
    });

    context('when external user IdToken exist', () => {

      const externalUserToken = 'ABCD';
      const expectedUserId = 1;

      beforeEach(() => {
        sessionStub.get.withArgs('data.externalUser').returns(externalUserToken);
        sessionStub.get.withArgs('data.expectedUserId').returns(expectedUserId);
      });

      context('when update user authentication method fails', () => {

        it('should display an error message', async () => {
          // given
          component.addGarAuthenticationMethodToUser.rejects(new Error());

          // when
          await component.authenticate();

          // then
          expect(component.isErrorMessagePresent).to.be.false;
          expect(component.hasUpdateUserError).to.be.true;
        });
      });
    });
  });

});
