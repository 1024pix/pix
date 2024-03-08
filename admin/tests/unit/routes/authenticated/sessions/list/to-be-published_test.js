import Service from '@ember/service';
import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Unit | Route | authenticated/sessions/list/to-be-published', function (hooks) {
  setupTest(hooks);

  let store;
  hooks.beforeEach(function () {
    class StoreStub extends Service {
      query = null;
    }
    this.owner.register('service:store', StoreStub);
    store = this.owner.lookup('service:store');
  });

  module('#model', function () {
    module('when filtering on V2 sessions', function () {
      test('it should fetch the list of sessions to be published', async function (assert) {
        // given
        const route = this.owner.lookup('route:authenticated/sessions/list/to-be-published');
        const v2Sessions = [
          {
            certificationCenterName: 'Centre SCO des Anne-Solo',
            finalizedAt: '2020-04-15T15:00:34.000Z',
          },
        ];
        const queryStub = sinon.stub();
        const _ = sinon.stub();
        const transition = {
          to: {
            queryParams: {
              version: '2',
            },
          },
        };

        queryStub.withArgs('to-be-published-session', { filter: { version: 2 } }).resolves(v2Sessions);
        store.query = queryStub;

        // when
        const result = await route.model(_, transition);
        // then

        assert.deepEqual(result, v2Sessions);
      });
    });

    module('when filtering on V3 sessions', function () {
      test('it should fetch the list of sessions to be published', async function (assert) {
        // given
        const route = this.owner.lookup('route:authenticated/sessions/list/to-be-published');
        const v3Sessions = [
          {
            certificationCenterName: 'Centre V3',
            finalizedAt: '2020-08-20T18:00:00.000Z',
          },
        ];
        const queryStub = sinon.stub();
        const _ = sinon.stub();
        const transition = {
          to: {
            queryParams: {
              version: '3',
            },
          },
        };

        queryStub.withArgs('to-be-published-session', { filter: { version: 3 } }).resolves(v3Sessions);
        store.query = queryStub;

        // when
        const result = await route.model(_, transition);
        // then

        assert.deepEqual(result, v3Sessions);
      });
    });
  });
});
