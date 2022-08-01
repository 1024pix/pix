import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import sinon from 'sinon';

import createGlimmerComponent from '../../helpers/create-glimmer-component';

module('Unit | Component | signin-form', function (hooks) {
  setupTest(hooks);

  module('#signin', function () {
    module('when user should change password', function () {
      test('should save reset password token and redirect to update-expired-password', async function (assert) {
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
        assert.expect(0);
        sinon.assert.calledWith(component.args.updateExpiredPassword, 'PASSWORD_RESET_TOKEN');
      });
    });
  });
});
