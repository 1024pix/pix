import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import sinon from 'sinon';
import Service from '@ember/service';

module('Unit | Controller | authenticated/sessions/import', function (hooks) {
  setupTest(hooks);

  let controller;

  hooks.beforeEach(function () {
    controller = this.owner.lookup('controller:authenticated/sessions/import');
  });

  module('#downloadSessionImportTemplate', function (hooks) {
    hooks.beforeEach(function () {
      const store = this.owner.lookup('service:store');
      const currentAllowedCertificationCenterAccess = store.createRecord('allowed-certification-center-access', {
        id: 123,
      });
      class CurrentUserStub extends Service {
        currentAllowedCertificationCenterAccess = currentAllowedCertificationCenterAccess;
      }

      this.owner.register('service:current-user', CurrentUserStub);
    });

    test('should call the file-saver service for downloadSessionImportTemplate with the right parameters', async function (assert) {
      // given
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

      // when
      await controller.downloadSessionImportTemplate(event);

      // then
      assert.ok(
        controller.fileSaver.save.calledWith({
          token,
          url: '/api/certification-centers/123/import',
        })
      );
    });

    test('should call the notifications service in case of an error', async function (assert) {
      // given
      controller.session = {
        isAuthenticated: true,
        data: {
          authenticated: {
            access_token: 'wrong token',
          },
        },
      };
      controller.fileSaver = { save: sinon.stub().rejects() };
      controller.notifications = { error: sinon.spy() };

      // when
      await controller.downloadSessionImportTemplate(event);

      // then
      sinon.assert.calledOnce(controller.notifications.error);
      assert.ok(controller);
    });
  });

  module('#validateSessions', function () {
    test('should call validate on sessions to mass import with the right parameters', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const adapter = store.adapterFor('validate-sessions-for-mass-import');
      const validateSessionsForMassImportStub = sinon.stub(adapter, 'validateSessionsForMassImport');
      validateSessionsForMassImportStub.resolves();
      const currentAllowedCertificationCenterAccess = store.createRecord('allowed-certification-center-access', {
        id: 123,
      });

      class CurrentUserStub extends Service {
        currentAllowedCertificationCenterAccess = currentAllowedCertificationCenterAccess;
      }

      this.owner.register('service:current-user', CurrentUserStub);
      const token = 'a token';

      const file = Symbol('file 1');
      controller.file = file;

      controller.session = {
        isAuthenticated: true,
        data: {
          authenticated: {
            access_token: token,
          },
        },
      };

      controller.notifications = { clearAll: sinon.stub() };

      // when
      await controller.validateSessions();

      // then
      sinon.assert.calledWith(adapter.validateSessionsForMassImport, file, '123');
      assert.ok(controller);
    });
  });
});
