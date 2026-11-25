import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

module(
  'Unit | Controller | authenticated/combined-course-blueprints/combined-course-blueprint/organizations',
  function (hooks) {
    setupTest(hooks);
    let controller;

    hooks.beforeEach(function () {
      controller = this.owner.lookup(
        'controller:authenticated.combined-course-blueprints.combined-course-blueprint.organizations',
      );
    });

    module('#updateFilters', function () {
      module('updating name', function () {
        test('it should update controller name field', async function (assert) {
          // given
          controller.name = 'someName';
          const expectedValue = 'someOtherName';

          // when
          await controller.updateFilters({ name: expectedValue });

          // then
          assert.strictEqual(controller.name, expectedValue);
        });
      });

      module('updating type', function () {
        test('it should update controller type field', async function (assert) {
          // given
          controller.type = 'someType';
          const expectedValue = 'someOtherType';

          // when
          await controller.updateFilters({ type: expectedValue });

          // then
          assert.strictEqual(controller.type, expectedValue);
        });
      });

      module('updating externalId', function () {
        test('it should update controller externalId field', async function (assert) {
          // given
          controller.externalId = 'someExternalId';
          const expectedValue = 'someOtherExternalId';

          // when
          await controller.updateFilters({ externalId: expectedValue });

          // then
          assert.strictEqual(controller.externalId, expectedValue);
        });
      });

      module('updating administrationTeam', function () {
        test('it should update controller administrationTeam field', async function (assert) {
          // given
          controller.administrationTeamId = 'team1';
          const expectedValue = 'teamId';

          // when
          await controller.updateFilters({ administrationTeamId: expectedValue });

          // then
          assert.strictEqual(controller.administrationTeamId, expectedValue);
        });
      });

      module('updating hideArchived', function () {
        test('it should update controller hideArchived field', async function (assert) {
          // given
          controller.hideArchived = false;
          const expectedValue = true;

          // when
          await controller.updateFilters({ hideArchived: expectedValue });

          // then
          assert.strictEqual(controller.hideArchived, expectedValue);
        });
      });

      module('updating id', function () {
        test('it should update controller id field', async function (assert) {
          // given
          controller.id = '12';
          const expectedValue = '987';

          // when
          await controller.updateFilters({ id: expectedValue });

          // then
          assert.strictEqual(controller.id, expectedValue);
        });
      });
    });

    module('#detachOrganization', function (hooks) {
      let adapter, store;

      hooks.beforeEach(function () {
        store = this.owner.lookup('service:store');
        adapter = store.adapterFor('combined-course-blueprint');
        controller.model = { blueprint: { id: 12 } };

        sinon.stub(store, 'findRecord').withArgs('organization', 34).resolves({ id: 34, name: 'Orga 34' });
        sinon.stub(controller.pixToast, 'sendSuccessNotification').resolves();
        sinon.stub(controller.pixToast, 'sendErrorNotification').resolves();
        sinon.stub(controller.router, 'refresh');
        sinon.stub(controller.intl, 't').callsFake((key) => key);
      });

      test('it should detach only the given organization from the combined course blueprint', async function (assert) {
        // given
        sinon.stub(adapter, 'detachOrganizations').resolves();

        // when
        await controller.detachOrganization(34);

        // then
        assert.ok(
          adapter.detachOrganizations.calledOnceWithExactly({ combinedCourseBlueprintId: 12, organizationIds: [34] }),
        );
        assert.ok(
          controller.intl.t.calledWithExactly(
            'components.combined-course-blueprints.organizations.detach-organization-success',
            { name: 'Orga 34' },
          ),
        );
        assert.ok(controller.pixToast.sendSuccessNotification.calledOnce);
        assert.ok(
          controller.router.refresh.calledOnceWithExactly(
            'authenticated.combined-course-blueprints.combined-course-blueprint.organizations',
          ),
        );
      });

      test('it should display an error notification and not redirect when detach fails', async function (assert) {
        // given
        sinon.stub(adapter, 'detachOrganizations').rejects();

        // when
        await controller.detachOrganization(34);

        // then
        assert.ok(
          controller.pixToast.sendErrorNotification.calledOnceWithExactly({
            message: 'common.notifications.generic-error',
          }),
        );
        assert.ok(controller.pixToast.sendSuccessNotification.notCalled);
        assert.ok(controller.router.refresh.notCalled);
      });
    });
  },
);
