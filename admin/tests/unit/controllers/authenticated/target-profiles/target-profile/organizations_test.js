import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import sinon from 'sinon';
import Service from '@ember/service';

module('Unit | Controller | authenticated/target-profiles/target-profile/organizations', function(hooks) {
  setupTest(hooks);
  let controller;

  hooks.beforeEach(function() {
    controller = this.owner.lookup('controller:authenticated.target-profiles.target-profile.organizations');
  });

  module('#updateFilters', function() {
    module('updating name', function() {
      test('it should update controller name field', async function(assert) {
        // given
        controller.name = 'someName';
        const expectedValue = 'someOtherName';

        // when
        await controller.updateFilters({ name: expectedValue });

        // then
        assert.equal(controller.name, expectedValue);
      });
    });

    module('updating type', function() {
      test('it should update controller type field', async function(assert) {
        // given
        controller.type = 'someType';
        const expectedValue = 'someOtherType';

        // when
        await controller.updateFilters({ type: expectedValue });

        // then
        assert.equal(controller.type, expectedValue);
      });
    });

    module('updating externalId', function() {
      test('it should update controller externalId field', async function(assert) {
        // given
        controller.externalId = 'someExternalId';
        const expectedValue = 'someOtherExternalId';

        // when
        await controller.updateFilters({ externalId: expectedValue });

        // then
        assert.equal(controller.externalId, expectedValue);
      });
    });
  });

  module('#attachOrganizations', function(hooks) {

    let event;

    hooks.beforeEach(function() {
      event = { preventDefault() {} };
    });

    module('when attaching organization works correctly', () => {
      test('it displays a success notifications', async (assert) => {
        controller.notifications = Service.create({ success: sinon.stub() });
        controller.model = { targetProfile: { attachOrganizations: sinon.stub().resolves() } };
        controller.organizationsToAttach = '1,2';
        controller.send = sinon.stub();

        await controller.attachOrganizations(event);

        assert.ok(controller.model.targetProfile.attachOrganizations.calledWith({ 'organization-ids': [1, 2] }));
        assert.equal(controller.organizationsToAttach, null);
        assert.ok(controller.notifications.success.calledWith('Organisation(s) rattaché(es) avec succès.'));
        assert.ok(controller.send.calledWith('refreshModel'));
      });
    });

    module('when an organization is present several times', () => {
      test('it remove duplicate ids', async (assert) => {
        controller.notifications = Service.create({ success: sinon.stub() });
        controller.model = { targetProfile: { attachOrganizations: sinon.stub().resolves() } };
        controller.organizationsToAttach = '1,1,2,3,3';
        controller.send = sinon.stub();

        await controller.attachOrganizations(event);

        assert.ok(controller.model.targetProfile.attachOrganizations.calledWith({ 'organization-ids': [1, 2, 3] }));
        assert.equal(controller.organizationsToAttach, null);
        assert.ok(controller.send.calledWith('refreshModel'));
      });
    });

    module('when there is an error', () => {
      module('when the error is correctly formed', () => {
        test('it displays a notification for each 404 error found', async (assert) => {
          const errors = {
            errors: [
              { status: '401', detail: 'I am not displayed' },
              { status: '404', detail: 'I am displayed 1' },
              { status: '404', detail: 'I am displayed 2' },
            ],
          };
          controller.notifications = Service.create({ error: sinon.stub() });
          controller.model = { targetProfile: { attachOrganizations: sinon.stub().rejects(errors) } };
          controller.organizationsToAttach = '1,1,2,3,3';

          await controller.attachOrganizations(event);

          assert.equal(controller.organizationsToAttach, '1,1,2,3,3');
          assert.ok(controller.notifications.error.calledWith('I am displayed 1'));
          assert.ok(controller.notifications.error.calledWith('I am displayed 2'));
        });

        test('it displays a notification for each 412 error found', async (assert) => {
          const errors = {
            errors: [
              { status: '401', detail: 'I am not displayed' },
              { status: '412', detail: 'I am displayed too 1' },
              { status: '412', detail: 'I am displayed too 2' },
            ],
          };
          controller.notifications = Service.create({ error: sinon.stub() });
          controller.model = { targetProfile: { attachOrganizations: sinon.stub().rejects(errors) } };
          controller.organizationsToAttach = '1,1,5,3,3';

          await controller.attachOrganizations(event);

          assert.equal(controller.organizationsToAttach, '1,1,5,3,3');
          assert.ok(controller.notifications.error.calledWith('I am displayed too 1'));
          assert.ok(controller.notifications.error.calledWith('I am displayed too 2'));
        });

        test('it displays a notification for each 400 error found', async (assert) => {
          const errors = {
            errors: [
              { status: '401', detail: 'I am not displayed' },
              { status: '400', detail: 'message' },
              { status: '400', detail: 'another message' },
            ],
          };
          controller.notifications = Service.create({ error: sinon.stub() });
          controller.model = { targetProfile: { attachOrganizations: sinon.stub().rejects(errors) } };
          controller.organizationsToAttach = '1,1,2,3,3';

          await controller.attachOrganizations(event);

          assert.equal(controller.organizationsToAttach, '1,1,2,3,3');
          assert.equal(controller.notifications.error.withArgs('Une erreur est survenue.').callCount, 2);
        });

        test('it displays nothing if there is no 404 or 400 errors found', async (assert) => {
          const errors = {
            errors: [
              { status: '401', detail: 'I am not displayed' },
            ],
          };
          controller.notifications = Service.create({ error: sinon.stub() });
          controller.model = { targetProfile: { attachOrganizations: sinon.stub().rejects(errors) } };
          controller.organizationsToAttach = '1,1,2,3,3';

          await controller.attachOrganizations(event);

          assert.equal(controller.organizationsToAttach, '1,1,2,3,3');
          assert.notOk(controller.notifications.error.called);
        });
      });

      module('when the error is not correctly formed', () => {
        test('it displays a default notification', async (assert) => {
          const errors = {};
          controller.notifications = Service.create({ error: sinon.stub() });
          controller.model = { targetProfile: { attachOrganizations: sinon.stub().rejects(errors) } };
          controller.organizationsToAttach = '1,1,2,3,3';

          await controller.attachOrganizations(event);

          assert.equal(controller.organizationsToAttach, '1,1,2,3,3');
          assert.ok(controller.notifications.error.calledWith('Une erreur est survenue.'));
        });
      });
    });
  });
});
