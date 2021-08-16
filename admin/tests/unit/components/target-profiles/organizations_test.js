import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import sinon from 'sinon';

import createComponent from '../../../helpers/create-glimmer-component';

module('Unit |  Component | Target Profiles | Organizations', function(hooks) {
  setupTest(hooks);

  module('#attachOrganizations', function(hooks) {
    let event;

    hooks.beforeEach(function() {
      event = { preventDefault() {} };
    });

    module('when attaching organization works correctly', () => {
      test('it displays a success notifications', async function(assert) {
        const component = createComponent('component:target-profiles/organizations');
        component.notifications = { success: sinon.stub(), error: sinon.stub() };
        component.args = { targetProfile: { attachOrganizations: sinon.stub().resolves() } };
        component.organizationsToAttach = '1,2';
        component.router = { replaceWith: sinon.stub() };

        await component.attachOrganizations(event);

        assert.ok(component.args.targetProfile.attachOrganizations.calledWith({ 'organization-ids': [1, 2] }));
        assert.equal(component.organizationsToAttach, null);
        assert.ok(component.notifications.success.calledWith('Organisation(s) rattaché(es) avec succès.'));
        assert.ok(component.router.replaceWith.calledWith('authenticated.target-profiles.target-profile.organizations'));
      });
    });

    module('when an organization is present several times', () => {
      test('it remove duplicate ids', async function(assert) {
        const component = createComponent('component:target-profiles/organizations');
        component.notifications = { success: sinon.stub() };
        component.args = { targetProfile: { attachOrganizations: sinon.stub().resolves() } };
        component.organizationsToAttach = '1,1,2,3,3';
        component.router = { replaceWith: sinon.stub() };

        await component.attachOrganizations(event);

        assert.ok(component.args.targetProfile.attachOrganizations.calledWith({ 'organization-ids': [1, 2, 3] }));
        assert.equal(component.organizationsToAttach, null);
        assert.ok(component.router.replaceWith.calledWith('authenticated.target-profiles.target-profile.organizations'));
      });
    });

    module('when there is an error', () => {
      module('when the error is correctly formed', () => {
        test('it displays a notification for each 404 error found', async function(assert) {
          const component = createComponent('component:target-profiles/organizations');
          const errors = {
            errors: [
              { status: '404', detail: 'I am displayed 1' },
              { status: '404', detail: 'I am displayed 2' },
            ],
          };
          component.notifications = { error: sinon.stub() };
          component.args = { targetProfile: { attachOrganizations: sinon.stub().rejects(errors) } };
          component.organizationsToAttach = '1,1,2,3,3';

          await component.attachOrganizations(event);

          assert.equal(component.organizationsToAttach, '1,1,2,3,3');
          assert.ok(component.notifications.error.calledWith('I am displayed 1'));
          assert.ok(component.notifications.error.calledWith('I am displayed 2'));
        });

        test('it displays a notification for each 412 error found', async function(assert) {
          const component = createComponent('component:target-profiles/organizations');
          const errors = {
            errors: [
              { status: '412', detail: 'I am displayed too 1' },
              { status: '412', detail: 'I am displayed too 2' },
            ],
          };
          component.notifications = { error: sinon.stub() };
          component.args = { targetProfile: { attachOrganizations: sinon.stub().rejects(errors) } };
          component.organizationsToAttach = '1,1,5,3,3';

          await component.attachOrganizations(event);

          assert.equal(component.organizationsToAttach, '1,1,5,3,3');
          assert.ok(component.notifications.error.calledWith('I am displayed too 1'));
          assert.ok(component.notifications.error.calledWith('I am displayed too 2'));
        });

        test('it display default notification for all other error found', async function(assert) {
          const component = createComponent('component:target-profiles/organizations');
          const errors = {
            errors: [
              { status: '400', detail: 'message' },
              { status: '401', detail: 'I am displayed' },
            ],
          };
          component.notifications = { error: sinon.stub() };
          component.args = { targetProfile: { attachOrganizations: sinon.stub().rejects(errors) } };
          component.organizationsToAttach = '1,1,2,3,3';

          await component.attachOrganizations(event);

          assert.equal(component.organizationsToAttach, '1,1,2,3,3');
          assert.equal(component.notifications.error.withArgs('Une erreur est survenue.').callCount, 2);
        });
      });

      module('when the error is not correctly formed', () => {
        test('it displays a default notification', async function(assert) {
          const component = createComponent('component:target-profiles/organizations');
          const errors = {};
          component.notifications = { error: sinon.stub() };
          component.args = { targetProfile: { attachOrganizations: sinon.stub().rejects(errors) } };
          component.organizationsToAttach = '1,1,2,3,3';

          await component.attachOrganizations(event);

          assert.equal(component.organizationsToAttach, '1,1,2,3,3');
          assert.ok(component.notifications.error.calledWith('Une erreur est survenue.'));
        });
      });
    });
  });

  module('#attachOrganizationsFromExistingTargetProfile', function(hooks) {
    let event;

    hooks.beforeEach(function() {
      event = { preventDefault() {} };
    });

    module('when attaching organization works correctly', () => {
      test('it shows a success notifications', async function(assert) {
        const component = createComponent('component:target-profiles/organizations');
        component.notifications = { success: sinon.stub() };
        component.args = { targetProfile: { attachOrganizationsFromExistingTargetProfile: sinon.stub().resolves() } };
        component.existingTargetProfile = 1;
        component.router = { replaceWith: sinon.stub() };

        await component.attachOrganizationsFromExistingTargetProfile(event);

        assert.ok(component.args.targetProfile.attachOrganizationsFromExistingTargetProfile.calledWith({ 'target-profile-id': 1 }));
        assert.equal(component.existingTargetProfile, null);
        assert.ok(component.notifications.success.calledWith('Organisation(s) rattaché(es) avec succès.'));
        assert.ok(component.router.replaceWith.calledWith('authenticated.target-profiles.target-profile.organizations'));
      });
    });

    module('when there is an error', () => {
      module('when the error is correctly formed', () => {
        test('it shows notification for each 404 error found', async function(assert) {
          const component = createComponent('component:target-profiles/organizations');
          const errors = {
            errors: [
              { status: '404', detail: 'I am displayed 1' },
              { status: '404', detail: 'I am displayed 2' },
            ],
          };
          component.notifications = { error: sinon.stub() };
          component.args = { targetProfile: { attachOrganizationsFromExistingTargetProfile: sinon.stub().rejects(errors) } };
          component.existingTargetProfile = 1;

          await component.attachOrganizationsFromExistingTargetProfile(event);

          assert.ok(component.notifications.error.calledWith('I am displayed 1'));
          assert.ok(component.notifications.error.calledWith('I am displayed 2'));
        });

        test('it shows notification for each 412 error found', async function(assert) {
          const component = createComponent('component:target-profiles/organizations');
          const errors = {
            errors: [
              { status: '412', detail: 'I am displayed too 1' },
              { status: '412', detail: 'I am displayed too 2' },
            ],
          };
          component.notifications = { error: sinon.stub() };
          component.args = { targetProfile: { attachOrganizationsFromExistingTargetProfile: sinon.stub().rejects(errors) } };
          component.existingTargetProfile = 1;

          await component.attachOrganizationsFromExistingTargetProfile(event);

          assert.ok(component.notifications.error.calledWith('I am displayed too 1'));
          assert.ok(component.notifications.error.calledWith('I am displayed too 2'));
        });

        test('it shows default notification for all other error found', async function(assert) {
          const component = createComponent('component:target-profiles/organizations');
          const errors = {
            errors: [
              { status: '400', detail: 'message' },
              { status: '401', detail: 'another' },
            ],
          };
          component.notifications = { error: sinon.stub() };
          component.args = { targetProfile: { attachOrganizationsFromExistingTargetProfile: sinon.stub().rejects(errors) } };
          component.existingTargetProfile = 1;

          await component.attachOrganizationsFromExistingTargetProfile(event);

          assert.equal(component.notifications.error.withArgs('Une erreur est survenue.').callCount, 2);
        });
      });

      module('when the error is not correctly formed', () => {
        test('it shows default notification', async function(assert) {
          const component = createComponent('component:target-profiles/organizations');
          const errors = {};
          component.notifications = { error: sinon.stub() };
          component.args = { targetProfile: { attachOrganizationsFromExistingTargetProfile: sinon.stub().rejects(errors) } };
          component.existingTargetProfile = 1;

          await component.attachOrganizationsFromExistingTargetProfile(event);

          assert.ok(component.notifications.error.calledWith('Une erreur est survenue.'));
        });
      });
    });
  });
});
