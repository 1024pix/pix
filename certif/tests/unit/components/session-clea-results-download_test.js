import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon/pkg/sinon-esm';

import createGlimmerComponent from '../../helpers/create-glimmer-component';
import setupIntl from '../../helpers/setup-intl';

module('Unit | Component | session-clea-results-download', function (hooks) {
  setupTest(hooks);
  setupIntl(hooks);

  let component;

  hooks.beforeEach(function () {
    component = createGlimmerComponent('component:session-clea-results-download');
  });

  module('#downloadCleaCertifiedCandidateData', function () {
    test('should call the file-saver service for downloadCleaCertifiedCandidateData with the right parameters', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      component.args.session = store.createRecord('session-management', {
        id: 123,
        hasSomeCleaAcquired: true,
        publishedAt: '2022-01-01',
      });
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

      const event = {
        preventDefault: sinon.stub(),
      };

      // when
      await component.downloadCleaCertifiedCandidateData(event);

      // then
      assert.ok(
        component.fileSaver.save.calledWith({
          token,
          url: `/api/sessions/${component.args.session.id}/certified-clea-candidate-data`,
        }),
      );
    });
    test('should call the notifications service with the error message', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      component.args.session = store.createRecord('session-management', {
        id: 123,
        hasSomeCleaAcquired: true,
        publishedAt: '2022-01-01',
      });
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
      component.fileSaver.save.rejects();
      component.notifications = {
        error: sinon.stub(),
      };

      const event = {
        preventDefault: sinon.stub(),
      };

      // when
      await component.downloadCleaCertifiedCandidateData(event);

      // then
      assert.ok(
        component.notifications.error.calledWith(this.intl.t('pages.sessions.detail.panel-clea.error-message')),
      );
    });
  });
});
