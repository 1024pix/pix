import Service from '@ember/service';
import { setupTest } from 'ember-qunit';
import setupIntl from 'pix-certif/tests/helpers/setup-intl';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Unit | Controller | session-supervising', function (hooks) {
  setupTest(hooks);
  setupIntl(hooks);

  let controller;

  hooks.beforeEach(function () {
    controller = this.owner.lookup('controller:session-supervising');
  });

  module('#fetchInvigilatorKit', function () {
    test('should call the file-saver service', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const currentAllowedCertificationCenterAccess = store.createRecord('allowed-certification-center-access', {
        id: '123',
      });
      const sessionForSupervising = store.createRecord('session-for-supervising', {
        id: '456',
      });
      class CurrentUserStub extends Service {
        currentAllowedCertificationCenterAccess = currentAllowedCertificationCenterAccess;
      }

      this.owner.register('service:current-user', CurrentUserStub);
      const token = 'a token';

      controller.session = {
        isAuthenticated: true,
        data: {
          authenticated: {
            access_token: token,
          },
        },
      };
      controller.fileSaver = {
        save: sinon.stub(),
      };
      controller.model = sessionForSupervising;

      // when
      await controller.fetchInvigilatorKit();

      // then
      assert.ok(
        controller.fileSaver.save.calledWith({
          token,
          url: '/api/sessions/456/invigilator-kit',
        }),
      );
    });
  });
});
