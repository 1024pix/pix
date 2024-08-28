import { setupIntl } from 'ember-intl/test-support';
import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

import createComponent from '../../../helpers/create-glimmer-component';

module('Unit | Component | Target Profiles | Organizations', function (hooks) {
  setupTest(hooks);
  setupIntl(hooks, 'fr');

  module('#attachOrganizations', function (hooks) {
    let event;
    let attachOrganizations;

    hooks.beforeEach(function () {
      event = {
        preventDefault() {},
      };
      const store = this.owner.lookup('service:store');
      const adapter = store.adapterFor('target-profile');
      attachOrganizations = sinon.stub(adapter, 'attachOrganizations');
    });

    module('when attaching organization works correctly', () => {
      test('it displays a success message notifications', async function (assert) {
        // given
        const component = createComponent('component:target-profiles/organizations');
        component.notifications = { success: sinon.stub() };
        component.args = {
          targetProfile: {
            id: 56,
          },
        };
        attachOrganizations.resolves({
          data: {
            attributes: {
              'duplicated-ids': [],
              'attached-ids': [1, 2],
            },
          },
        }),
          (component.organizationsToAttach = '1,2');
        component.router = { replaceWith: sinon.stub() };

        // when
        await component.attachOrganizations(event);

        // then
        assert.ok(attachOrganizations.calledWith({ organizationIds: [1, 2], targetProfileId: 56 }));
        assert.strictEqual(component.organizationsToAttach, '');
        assert.ok(
          component.notifications.success.calledWith('Organisation(s) rattaché(es) avec succès.', {
            htmlContent: true,
          }),
        );
        assert.ok(
          component.router.replaceWith.calledWith('authenticated.target-profiles.target-profile.organizations'),
        );
      });

      test('it displays duplicate message notifications', async function (assert) {
        // given
        const component = createComponent('component:target-profiles/organizations');
        component.notifications = { success: sinon.stub() };
        component.args = {
          targetProfile: {
            id: 56,
          },
        };
        attachOrganizations.resolves({
          data: { attributes: { 'duplicated-ids': [1], 'attached-ids': [] } },
        });
        component.organizationsToAttach = '1';
        component.router = { replaceWith: sinon.stub() };

        // when
        await component.attachOrganizations(event);

        // then
        assert.ok(attachOrganizations.calledWith({ organizationIds: [1], targetProfileId: 56 }));
        assert.strictEqual(component.organizationsToAttach, '');
        assert.ok(
          component.notifications.success.calledWith(
            'Le(s) organisation(s) suivantes étai(en)t déjà rattachée(s) à ce profil cible : 1',
            { htmlContent: true },
          ),
        );
        assert.ok(
          component.router.replaceWith.calledWith('authenticated.target-profiles.target-profile.organizations'),
        );
      });

      test('it displays a duplicate and success messages notifications', async function (assert) {
        // given
        const component = createComponent('component:target-profiles/organizations');
        component.notifications = { success: sinon.stub() };
        component.args = {
          targetProfile: {
            id: 56,
          },
        };
        attachOrganizations.resolves({
          data: { attributes: { 'duplicated-ids': [1], 'attached-ids': [2] } },
        });
        component.organizationsToAttach = '1,2';
        component.router = { replaceWith: sinon.stub() };

        // when
        await component.attachOrganizations(event);

        // then
        assert.ok(attachOrganizations.calledWith({ organizationIds: [1, 2], targetProfileId: 56 }));
        assert.strictEqual(component.organizationsToAttach, '');
        assert.ok(
          component.notifications.success.calledWith(
            'Organisation(s) rattaché(es) avec succès.<br/>Le(s) organisation(s) suivantes étai(en)t déjà rattachée(s) à ce profil cible : 1',
            { htmlContent: true },
          ),
        );
        assert.ok(
          component.router.replaceWith.calledWith('authenticated.target-profiles.target-profile.organizations'),
        );
      });
    });

    module('when an organization is present several times', () => {
      test('it remove duplicate ids', async function (assert) {
        // given
        const component = createComponent('component:target-profiles/organizations');
        component.notifications = { success: sinon.stub() };
        component.args = {
          targetProfile: {
            id: 56,
          },
        };
        attachOrganizations.resolves({
          data: { attributes: { 'duplicated-ids': [], 'attached-ids': [] } },
        });
        component.organizationsToAttach = '1,1,2,3,3';
        component.router = { replaceWith: sinon.stub() };

        // when
        await component.attachOrganizations(event);

        // then
        assert.ok(attachOrganizations.calledWith({ organizationIds: [1, 2, 3], targetProfileId: 56 }));
        assert.strictEqual(component.organizationsToAttach, '');
        assert.ok(
          component.router.replaceWith.calledWith('authenticated.target-profiles.target-profile.organizations'),
        );
      });
    });

    module('when there is an error', () => {
      module('when the error is correctly formed', () => {
        test('it displays a notification for each 404 error found', async function (assert) {
          // given
          const component = createComponent('component:target-profiles/organizations');
          const errors = {
            errors: [
              { status: '404', detail: 'I am displayed 1' },
              { status: '404', detail: 'I am displayed 2' },
            ],
          };
          component.notifications = { error: sinon.stub() };
          component.args = { targetProfile: { id: 56 } };
          attachOrganizations.rejects(errors);
          component.organizationsToAttach = '1,1,2,3,3';
          // when
          await component.attachOrganizations(event);

          // then
          assert.strictEqual(component.organizationsToAttach, '1,1,2,3,3');
          assert.ok(component.notifications.error.calledWith('I am displayed 1'));
          assert.ok(component.notifications.error.calledWith('I am displayed 2'));
        });

        test('it displays a notification for each 412 error found', async function (assert) {
          // given
          const component = createComponent('component:target-profiles/organizations');
          const errors = {
            errors: [
              { status: '412', detail: 'I am displayed too 1' },
              { status: '412', detail: 'I am displayed too 2' },
            ],
          };
          component.notifications = { error: sinon.stub() };
          component.args = { targetProfile: { id: 56 } };
          attachOrganizations.rejects(errors);
          component.organizationsToAttach = '1,1,5,3,3';

          // when
          await component.attachOrganizations(event);

          // then
          assert.strictEqual(component.organizationsToAttach, '1,1,5,3,3');
          assert.ok(component.notifications.error.calledWith('I am displayed too 1'));
          assert.ok(component.notifications.error.calledWith('I am displayed too 2'));
        });

        test('it display default notification for all other error found', async function (assert) {
          // given
          const component = createComponent('component:target-profiles/organizations');
          const errors = {
            errors: [
              { status: '400', detail: 'message' },
              { status: '401', detail: 'I am displayed' },
            ],
          };
          component.notifications = { error: sinon.stub() };
          component.args = { targetProfile: { id: 56 } };
          attachOrganizations.rejects(errors);
          component.organizationsToAttach = '1,1,2,3,3';

          // when
          await component.attachOrganizations(event);

          // then
          assert.strictEqual(component.organizationsToAttach, '1,1,2,3,3');
          assert.strictEqual(component.notifications.error.withArgs('Une erreur est survenue.').callCount, 2);
        });
      });

      module('when the error is not correctly formed', () => {
        test('it displays a default notification', async function (assert) {
          // given
          const component = createComponent('component:target-profiles/organizations');
          const errors = {};
          component.notifications = { error: sinon.stub() };
          component.args = { targetProfile: { attachOrganizations: sinon.stub().rejects(errors) } };
          component.organizationsToAttach = '1,1,2,3,3';

          // when
          await component.attachOrganizations(event);

          // then
          assert.strictEqual(component.organizationsToAttach, '1,1,2,3,3');
          assert.ok(component.notifications.error.calledWith('Une erreur est survenue.'));
        });
      });
    });
  });

  module('#organizationsFromExistingTargetProfileToAttach', function (hooks) {
    let event;
    let attachOrganizationsFromExistingTargetProfile;

    hooks.beforeEach(function () {
      event = {
        preventDefault() {},
      };
      const store = this.owner.lookup('service:store');
      const adapter = store.adapterFor('target-profile');
      attachOrganizationsFromExistingTargetProfile = sinon.stub(
        adapter,
        'attachOrganizationsFromExistingTargetProfile',
      );
    });

    module('when attaching organization works correctly', () => {
      test('it shows a success notifications', async function (assert) {
        // given
        const component = createComponent('component:target-profiles/organizations');
        component.notifications = { success: sinon.stub() };
        component.args = { targetProfile: { id: 1 } };
        component.existingTargetProfile = 2;
        component.router = { replaceWith: sinon.stub() };
        attachOrganizationsFromExistingTargetProfile.resolves();

        // when
        await component.organizationsFromExistingTargetProfileToAttach(event);

        // then
        assert.ok(
          attachOrganizationsFromExistingTargetProfile.calledWith({
            targetProfileId: 1,
            targetProfileIdToCopy: 2,
          }),
        );
        assert.strictEqual(component.existingTargetProfile, '');
        assert.ok(component.notifications.success.calledWith('Organisation(s) rattaché(es) avec succès.'));
        assert.ok(
          component.router.replaceWith.calledWith('authenticated.target-profiles.target-profile.organizations'),
        );
      });
    });

    module('when there is an error', () => {
      module('when the error is correctly formed', () => {
        test('it shows notification for each 404 error found', async function (assert) {
          const component = createComponent('component:target-profiles/organizations');
          const errors = {
            errors: [
              { status: '404', detail: 'I am displayed 1' },
              { status: '404', detail: 'I am displayed 2' },
            ],
          };
          component.notifications = { error: sinon.stub() };
          component.args = {
            targetProfile: { id: 1 },
          };
          attachOrganizationsFromExistingTargetProfile.rejects(errors);
          component.existingTargetProfile = 2;

          await component.organizationsFromExistingTargetProfileToAttach(event);

          assert.ok(component.notifications.error.calledWith('I am displayed 1'));
          assert.ok(component.notifications.error.calledWith('I am displayed 2'));
        });

        test('it shows notification for each 412 error found', async function (assert) {
          const component = createComponent('component:target-profiles/organizations');
          const errors = {
            errors: [
              { status: '412', detail: 'I am displayed too 1' },
              { status: '412', detail: 'I am displayed too 2' },
            ],
          };
          component.notifications = { error: sinon.stub() };
          attachOrganizationsFromExistingTargetProfile.rejects(errors);
          component.args = {
            targetProfile: { id: 1 },
          };
          component.existingTargetProfile = 2;

          await component.organizationsFromExistingTargetProfileToAttach(event);

          assert.ok(component.notifications.error.calledWith('I am displayed too 1'));
          assert.ok(component.notifications.error.calledWith('I am displayed too 2'));
        });

        test('it shows default notification for all other error found', async function (assert) {
          // given
          const component = createComponent('component:target-profiles/organizations');
          const errors = {
            errors: [
              { status: '400', detail: 'message' },
              { status: '401', detail: 'another' },
            ],
          };
          component.notifications = { error: sinon.stub() };
          component.args = {
            targetProfile: { id: 1 },
          };
          attachOrganizationsFromExistingTargetProfile.rejects(errors);
          component.existingTargetProfile = 2;

          // when
          await component.organizationsFromExistingTargetProfileToAttach(event);

          // then
          assert.strictEqual(component.notifications.error.withArgs('Une erreur est survenue.').callCount, 2);
        });
      });

      module('when the error is not correctly formed', () => {
        test('it shows default notification', async function (assert) {
          // given
          const component = createComponent('component:target-profiles/organizations');
          const errors = {};
          component.notifications = { error: sinon.stub() };
          component.args = {
            targetProfile: { id: 1 },
          };
          attachOrganizationsFromExistingTargetProfile.rejects(errors);
          component.existingTargetProfile = 2;

          // when
          await component.organizationsFromExistingTargetProfileToAttach(event);

          // then
          assert.ok(component.notifications.error.calledWith('Une erreur est survenue.'));
        });
      });
    });
  });
});
