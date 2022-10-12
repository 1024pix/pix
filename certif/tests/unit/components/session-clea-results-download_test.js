import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import createGlimmerComponent from '../../helpers/create-glimmer-component';
import sinon from 'sinon/pkg/sinon-esm';

module('Unit | Component | session-clea-results-download', function (hooks) {
  setupTest(hooks);

  let component;

  hooks.beforeEach(function () {
    component = createGlimmerComponent('component:session-clea-results-download');
  });

  module('#downloadCleaCertifiedCandidateData', function () {
    test('should call the file-saver service for downloadCleaCertifiedCandidateData with the right parameters', async function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      component.args.session = store.createRecord('session', {
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
        })
      );
    });
  });
});
