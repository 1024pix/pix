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

  module('#downloadSessionImportTemplate', function () {
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
          url: `/api/sessions/import`,
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
      const currentAllowedCertificationCenterAccess = store.createRecord('allowed-certification-center-access', {
        id: 123,
      });

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
      const file = {
        upload: sinon.stub(),
      };
      component.args = {
        reloadSessionSummaries: sinon.stub(),
      };
      component.notifications = { success: sinon.stub() };

      // when
      await component.importSessions(file);

      // then
      sinon.assert.calledOnce(component.notifications.success);
      assert.ok(
        file.upload.calledWith('/api/certification-centers/123/sessions/import', {
          headers: { Authorization: `Bearer ${token}` },
        })
      );
    });

    test('should call the notifications service in case of an error', async function (assert) {
      // given
      const token = 'a token';
      const store = this.owner.lookup('service:store');
      const currentAllowedCertificationCenterAccess = store.createRecord('allowed-certification-center-access', {
        id: 123,
      });

      class CurrentUserStub extends Service {
        currentAllowedCertificationCenterAccess = currentAllowedCertificationCenterAccess;
      }

      this.owner.register('service:current-user', CurrentUserStub);

      component.session = {
        isAuthenticated: true,
        data: {
          authenticated: {
            access_token: token,
          },
        },
      };
      const file = {
        upload: sinon.stub().rejects({ body: { errors: [{ detail: 'error message' }] } }),
      };
      component.notifications = { error: sinon.stub() };

      // when
      await component.importSessions(file);

      // then
      sinon.assert.calledOnce(component.notifications.error);
      assert.ok(component);
    });
  });
});
