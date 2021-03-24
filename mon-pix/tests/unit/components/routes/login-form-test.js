import { beforeEach, describe } from 'mocha';
import { expect } from 'chai';
import sinon from 'sinon';
import { setupTest } from 'ember-mocha';
import createGlimmerComponent from 'mon-pix/tests/helpers/create-glimmer-component';

describe('Unit | Component | routes/login-form', function() {

  setupTest();

  let sessionStub;
  let storeStub;
  let routerStub;

  let component;
  let addGarAuthenticationMethodToUserStub;

  const eventStub = { preventDefault: sinon.stub() };

  beforeEach(function() {

    sessionStub = {
      authenticate: sinon.stub().resolves(),
      isAuthenticated: sinon.stub().returns(true),
      get: sinon.stub(),
      invalidate: sinon.stub(),
    };
    routerStub = {
      replaceWith: sinon.stub(),
    };
    storeStub = {
      createRecord: sinon.stub(),
    };

    addGarAuthenticationMethodToUserStub = sinon.stub();

    component = createGlimmerComponent('component:routes/login-form');
    component.session = sessionStub;
    component.store = storeStub;
    component.router = routerStub;

    component.args.addGarAuthenticationMethodToUser = addGarAuthenticationMethodToUserStub;
  });

  describe('#authenticate', () => {

    context('when user is a Pix user', function() {

      it('should not notify error when authentication succeeds', async function() {
        // when
        await component.authenticate(eventStub);

        // then
        expect(component.isErrorMessagePresent).to.be.false;
        expect(component.hasUpdateUserError).to.be.false;
      });

      it('should notify error when authentication fails', async function() {
        // given
        sessionStub.authenticate.rejects(new Error());

        // when
        await component.authenticate(eventStub);

        // then
        expect(component.isErrorMessagePresent).to.be.true;
        expect(component.hasUpdateUserError).to.be.false;
      });

      it('should redirect to update-expired-password if user should change password', async function() {
        // given
        const expectedRouteName = 'update-expired-password';
        const response = {
          responseJSON: {
            errors: [{ title: 'PasswordShouldChange' }],
          },
        };
        sessionStub.authenticate.rejects(response);

        // when
        await component.authenticate(eventStub);

        // then
        sinon.assert.calledWith(component.router.replaceWith, expectedRouteName);
      });
    });

    context('when user is external with an existing token id', function() {

      const externalUserToken = 'ABCD';
      const expectedUserId = 1;

      beforeEach(() => {
        sessionStub.get.withArgs('data.externalUser').returns(externalUserToken);
        sessionStub.get.withArgs('data.expectedUserId').returns(expectedUserId);
      });

      it('should display an error message when update user authentication method fails', async function() {
        // given
        addGarAuthenticationMethodToUserStub.rejects(new Error());

        // when
        await component.authenticate(eventStub);

        // then
        expect(component.isErrorMessagePresent).to.be.false;
        expect(component.hasUpdateUserError).to.be.true;
      });
    });
  });

});
