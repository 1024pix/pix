import { describe, it } from 'mocha';
import sinon from 'sinon';

import { setupTest } from 'ember-mocha';
import createGlimmerComponent from '../../helpers/create-glimmer-component';

describe('Unit | Component | signin-form', function () {
  setupTest();

  describe('#signin', () => {
    context('when user should change password', () => {
      it('should save reset password token and redirect to update-expired-password', async () => {
        // given
        const eventStub = { preventDefault: sinon.stub() };
        const component = createGlimmerComponent('component:signin-form');
        component.args.authenticateUser = sinon.stub().rejects({
          responseJSON: {
            errors: [
              {
                title: 'PasswordShouldChange',
                meta: 'PASSWORD_RESET_TOKEN',
              },
            ],
          },
        });
        component.args.updateExpiredPassword = sinon.stub();

        // when
        await component.signin(eventStub);

        // then
        sinon.assert.calledWith(component.args.updateExpiredPassword, 'PASSWORD_RESET_TOKEN');
      });
    });
  });
});
