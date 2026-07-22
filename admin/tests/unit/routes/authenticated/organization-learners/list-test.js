import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Unit | Route | authenticated/organization-learners/list', function (hooks) {
  setupTest(hooks);
  let route;

  hooks.beforeEach(function () {
    route = this.owner.lookup('route:authenticated/organization-learners/list');
  });

  module('#model', function (hooks) {
    hooks.beforeEach(function () {
      // given
      route.store.query = sinon.stub().resolves();
    });

    module('when you add filters', function () {
      test('it should not call store.query if necessary filters are empty', async function (assert) {
        // given
        const params = {
          organizationExternalId: undefined,
          fullName: undefined,
          hideDisabled: true,
          organizationSort: 'asc',
          pageNumber: 1,
          pageSize: 50,
        };

        // when
        await route.model(params);

        // then
        sinon.assert.notCalled(route.store.query);
        assert.ok(true);
      });
      test('it should call store.query if organizationExternalId is filled', async function (assert) {
        // given
        const params = {
          organizationExternalId: 'SCO',
        };

        // when
        await route.model(params);

        // then
        sinon.assert.called(route.store.query);
        assert.ok(true);
      });
      test('it should call store.query if fullName is filled', async function (assert) {
        // given
        const params = {
          fullName: 'attestation',
        };

        // when
        await route.model(params);

        // then
        sinon.assert.called(route.store.query);
        assert.ok(true);
      });
      test('it should not call store.query if fullName is filled with less than 2 characters', async function (assert) {
        // given
        const params = {
          fullName: 'a',
        };

        // when
        await route.model(params);

        // then
        sinon.assert.notCalled(route.store.query);
        assert.ok(true);
      });
    });

    module('when queryParams filters are falsy', function () {
      test('it should call store.query with empty params', async function (assert) {
        // given
        const params = {
          organizationExternalId: 'SCO',
        };
        const expectedQueryArgs = {
          sort: {
            organizationSort: undefined,
            birthdateSort: undefined,
            updatedAtSort: undefined,
          },
          filter: {
            organizationExternalId: 'SCO',
            fullName: undefined,
            hideDisabled: undefined,
          },
          page: {
            number: 1,
            size: 50,
          },
        };

        // when
        await route.model(params);

        // then
        sinon.assert.calledWith(route.store.query, 'admin-organization-learner', expectedQueryArgs);
        assert.ok(true);
      });
    });

    module('when queryParams filters are truthy', function () {
      test('it should call store.query with defined params', async function (assert) {
        // given
        const params = {
          organizationSort: 'asc',
          pageNumber: 'somePageNumber',
          pageSize: 'somePageSize',
          organizationExternalId: 'SCO',
          fullName: 'attestation',
          hideDisabled: true,
        };
        const expectedQueryArgs = {
          sort: {
            organizationSort: 'asc',
            birthdateSort: undefined,
            updatedAtSort: undefined,
          },
          filter: {
            organizationExternalId: 'SCO',
            fullName: 'attestation',
            hideDisabled: true,
          },
          page: {
            number: 'somePageNumber',
            size: 'somePageSize',
          },
        };

        // when
        await route.model(params);

        // then
        sinon.assert.calledWith(route.store.query, 'admin-organization-learner', expectedQueryArgs);
        assert.ok(true);
      });
    });

    module('when an error occurs', function () {
      test('returns an empty array', async function (assert) {
        // given
        const params = {};
        route.store.query = sinon.stub().rejects();

        // when
        const learners = await route.model(params);

        // then
        assert.deepEqual(learners, []);
      });
    });
  });
});
