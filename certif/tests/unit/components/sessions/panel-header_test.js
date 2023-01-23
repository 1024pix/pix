import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import createGlimmerComponent from '../../../helpers/create-glimmer-component';
import sinon from 'sinon';
import Service from '@ember/service';

module('Unit | Component | panel-header', function (hooks) {
  setupTest(hooks);

  let component;

  hooks.beforeEach(function () {
    component = createGlimmerComponent('component:sessions/panel-header');
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

      component.session = {
        isAuthenticated: true,
        data: {
          authenticated: {
            access_token: token,
          },
        },
      };
      component.fileSaver = {
        save: sinon.stub(),
      };

      // when
      await component.downloadSessionImportTemplate(event);

      // then
      assert.ok(
        component.fileSaver.save.calledWith({
          token,
          url: '/api/certification-centers/123/import',
        })
      );
    });

    test('should call the notifications service in case of an error', async function (assert) {
      // given
      component.session = {
        isAuthenticated: true,
        data: {
          authenticated: {
            access_token: 'wrong token',
          },
        },
      };
      component.fileSaver = { save: sinon.stub().rejects() };
      component.notifications = { error: sinon.spy() };

      // when
      await component.downloadSessionImportTemplate(event);

      // then
      sinon.assert.calledOnce(component.notifications.error);
      assert.ok(component);
    });
  });

  module('#importSessions', function () {
    test('should call upload with the right parameters', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const adapter = store.adapterFor('sessions-import');
      const sessionsImportStub = sinon.stub(adapter, 'importSessions');
      const currentAllowedCertificationCenterAccess = store.createRecord('allowed-certification-center-access', {
        id: 123,
      });
      const files = [Symbol('file 1')];

      class CurrentUserStub extends Service {
        currentAllowedCertificationCenterAccess = currentAllowedCertificationCenterAccess;
      }

      this.owner.register('service:current-user', CurrentUserStub);
      const token = 'a token';

      component.session = {
        isAuthenticated: true,
        data: {
          authenticated: {
            access_token: token,
          },
        },
      };

      component.args = {
        reloadSessionSummaries: sinon.stub(),
      };
      component.notifications = { success: sinon.stub(), clearAll: sinon.stub() };

      // when
      await component.importSessions(files);

      // then
      sinon.assert.calledOnce(component.notifications.success);
      sinon.assert.calledOnce(component.args.reloadSessionSummaries);
      assert.ok(sessionsImportStub.calledWith(files, currentAllowedCertificationCenterAccess.id));
    });

    test('should call the notifications service in case of an error', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const adapter = store.adapterFor('sessions-import');
      const sessionsImportStub = sinon.stub(adapter, 'importSessions');
      sessionsImportStub.rejects();
      const currentAllowedCertificationCenterAccess = store.createRecord('allowed-certification-center-access', {
        id: 123,
      });
      const files = [Symbol('file 1')];

      class CurrentUserStub extends Service {
        currentAllowedCertificationCenterAccess = currentAllowedCertificationCenterAccess;
      }

      this.owner.register('service:current-user', CurrentUserStub);
      const token = 'a token';

      component.session = {
        isAuthenticated: true,
        data: {
          authenticated: {
            access_token: token,
          },
        },
      };

      component.notifications = { error: sinon.stub(), clearAll: sinon.stub() };

      // when
      await component.importSessions(files);

      // then
      sinon.assert.calledOnce(component.notifications.error);
      assert.ok(component);
    });
  });
});
