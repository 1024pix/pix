import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Unit | Route | authenticated/sessions/list/to-be-published', function (hooks) {
  setupTest(hooks);

  module('#model', function () {
    module('when filtering on V2 sessions', function () {
      test('it should fetch the list of sessions to be published', async function (assert) {
        // given
        const route = this.owner.lookup('route:authenticated/sessions/list/to-be-published');
        const v2SessionsToBePublished = [
          {
            certificationCenterName: 'Centre SCO des Anne-Solo',
            finalizedAt: '2020-04-15T15:00:34.000Z',
          },
        ];
        route.modelFor = sinon.stub().returns({ v2SessionsToBePublished });

        const _ = sinon.stub();
        const transition = {
          to: {
            queryParams: {
              version: '2',
            },
          },
        };

        // when
        const result = await route.model(_, transition);
        // then

        assert.deepEqual(result, v2SessionsToBePublished);
      });
    });

    module('when filtering on V3 sessions', function () {
      test('it should fetch the list of sessions to be published', async function (assert) {
        // given
        const route = this.owner.lookup('route:authenticated/sessions/list/to-be-published');
        const v3SessionsToBePublished = [
          {
            certificationCenterName: 'Centre V3',
            finalizedAt: '2020-08-20T18:00:00.000Z',
          },
        ];
        route.modelFor = sinon.stub().returns({ v3SessionsToBePublished });

        const _ = sinon.stub();
        const transition = {
          to: {
            queryParams: {
              version: '3',
            },
          },
        };

        // when
        const result = await route.model(_, transition);

        // then
        assert.deepEqual(result, v3SessionsToBePublished);
      });
    });
  });
});
