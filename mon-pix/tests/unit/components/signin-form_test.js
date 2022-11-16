import { describe, it } from 'mocha';
import sinon from 'sinon';
import EmberObject from '@ember/object';
import Service from '@ember/service';
import { setupTest } from 'ember-mocha';
import createGlimmerComponent from '../../helpers/create-glimmer-component';

describe('Unit | Component | signin-form', function () {
  setupTest();

  describe('#signin', () => {
    context('when user should change password', function () {
      it('should save reset password token and redirect to update-expired-password', async () => {
        // given
        const eventStub = { preventDefault: sinon.stub() };
        const createRecordStub = sinon.stub();
        const storeStub = { createRecord: createRecordStub };
        const sessionStub = {
          authenticateUser: sinon.stub().rejects({
            responseJSON: {
              errors: [
                {
                  title: 'PasswordShouldChange',
                  meta: 'PASSWORD_RESET_TOKEN',
                },
              ],
            },
          }),
        };
        const component = createGlimmerComponent('component:signin-form');
        component.session = sessionStub;
        component.args.updateExpiredPassword = sinon.stub();
        component.store = storeStub;
        component.router = { replaceWith: sinon.stub() };

        // when
        await component.signin(eventStub);

        // then
        sinon.assert.calledWith(createRecordStub, 'reset-expired-password-demand', {
          passwordResetToken: 'PASSWORD_RESET_TOKEN',
        });
      });
    });

    context('when user sign in', function () {
      it('should authenticate the user even if email contains spaces', async () => {
        // given
        const foundUser = EmberObject.create({ id: 12 });
        const eventStub = { preventDefault: sinon.stub() };
        const createRecordStub = sinon.stub();
        const queryRecordStub = sinon.stub().resolves(foundUser);
        const authenticateStub = sinon.stub().resolves();
        const component = createGlimmerComponent('component:signin-form');
        const sessionStub = Service.create({
          authenticateUser: authenticateStub,
        });
        const storeStub = Service.create({
          queryRecord: queryRecordStub,
          createRecord: createRecordStub,
        });

        component.store = storeStub;
        component.session = sessionStub;

        const emailWithSpaces = '  email@example.net  ';
        const trimedEmail = emailWithSpaces.trim();
        const password = 'password';
        component.password = password;
        component.login = trimedEmail;

        // when
        await component.signin(eventStub);

        // then
        sinon.assert.calledWith(authenticateStub, trimedEmail, password);
      });
    });
  });
});
