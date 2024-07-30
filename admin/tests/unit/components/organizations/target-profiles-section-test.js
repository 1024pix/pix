import Service from '@ember/service';
import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

import createComponent from '../../../helpers/create-glimmer-component';

module('Unit | Component | organizations/target-profiles-section', function (hooks) {
  setupTest(hooks);

  module('#attachTargetProfiles', function (hooks) {
    let event;

    hooks.beforeEach(function () {
      event = { preventDefault() {} };
    });

    module('when attaching target profiles works correctly', () => {
      test('it displays a success message', async function (assert) {
        const component = createComponent('component:organizations/target-profiles-section');
        component.notifications = { success: sinon.stub() };
        const reloadStub = sinon.stub();
        const mapStub = sinon.stub();

        mapStub.onCall(0).returns([]);
        mapStub.onCall(1).returns(['1', '2']);
        component.args = {
          organization: {
            attachTargetProfiles: sinon.stub(),
          },
          targetProfileSummaries: {
            map: mapStub,
            reload: reloadStub,
          },
        };
        component.args.organization.attachTargetProfiles.resolves();
        component.targetProfilesToAttach = '1,2';

        await component.attachTargetProfiles(event);

        assert.ok(component.args.organization.attachTargetProfiles.calledWith({ 'target-profile-ids': ['1', '2'] }));
        assert.strictEqual(component.targetProfilesToAttach, '');
        assert.ok(
          component.notifications.success.calledWithExactly('Profil(s) cible(s) rattaché(s) avec succès.', {
            htmlContent: true,
          }),
        );
      });

      test('it displays a message with duplicated ids when trying to attach already attached target profiles', async function (assert) {
        const component = createComponent('component:organizations/target-profiles-section');
        component.notifications = { success: sinon.stub() };
        const reloadStub = sinon.stub();
        const mapStub = sinon.stub();
        mapStub.onCall(0).returns(['1', '2']);
        mapStub.onCall(1).returns(['1', '2', '3']);
        component.args = {
          organization: {
            attachTargetProfiles: sinon.stub(),
          },
          targetProfileSummaries: {
            map: mapStub,
            reload: reloadStub,
          },
        };
        component.args.organization.attachTargetProfiles.resolves();
        component.targetProfilesToAttach = '1,2,3';

        await component.attachTargetProfiles(event);

        assert.ok(
          component.notifications.success.calledWith(
            'Profil(s) cible(s) rattaché(s) avec succès.<br/>Le(s) profil(s) cible(s) suivant(s) étai(en)t déjà rattaché(s) à cette organisation : 1, 2.',
            {
              htmlContent: true,
            },
          ),
        );
      });
    });

    module('when there is an error', () => {
      module('when the error is correctly formed', () => {
        test('it displays a notification for each 404 error found', async function (assert) {
          const component = createComponent('component:organizations/target-profiles-section');
          const errors = {
            errors: [
              { status: '404', detail: 'I am displayed 1' },
              { status: '404', detail: 'I am displayed 2' },
            ],
          };
          component.notifications = { error: sinon.stub() };
          const reloadStub = sinon.stub();
          const mapStub = sinon.stub();
          reloadStub.returns([]);
          component.args = {
            organization: { attachTargetProfiles: sinon.stub().rejects(errors) },
            targetProfileSummaries: {
              reload: reloadStub,
              map: mapStub,
            },
          };
          component.targetProfilesToAttach = '1,1,2,3,3';

          await component.attachTargetProfiles(event);

          assert.strictEqual(component.targetProfilesToAttach, '1,1,2,3,3');
          assert.ok(component.notifications.error.calledWith('I am displayed 1'));
          assert.ok(component.notifications.error.calledWith('I am displayed 2'));
        });

        test('it displays a notification for each 412 error found', async function (assert) {
          const component = createComponent('component:organizations/target-profiles-section');
          const errors = {
            errors: [
              { status: '412', detail: 'I am displayed too 1' },
              { status: '412', detail: 'I am displayed too 2' },
            ],
          };
          component.notifications = { error: sinon.stub() };
          const reloadStub = sinon.stub();
          const mapStub = sinon.stub();
          reloadStub.returns([]);
          component.args = {
            organization: { attachTargetProfiles: sinon.stub().rejects(errors) },
            targetProfileSummaries: {
              reload: reloadStub,
              map: mapStub,
            },
          };
          component.targetProfilesToAttach = '1,1,5,3,3';

          await component.attachTargetProfiles(event);

          assert.strictEqual(component.targetProfilesToAttach, '1,1,5,3,3');
          assert.ok(component.notifications.error.calledWith('I am displayed too 1'));
          assert.ok(component.notifications.error.calledWith('I am displayed too 2'));
        });

        test('it display default notification for all other error found', async function (assert) {
          const component = createComponent('component:organizations/target-profiles-section', {
            organization: {},
            targetProfileSummaries: [],
          });
          const errors = {
            errors: [
              { status: '400', detail: 'message' },
              { status: '401', detail: 'I am displayed' },
            ],
          };
          component.notifications = { error: sinon.stub() };
          const reloadStub = sinon.stub();
          const mapStub = sinon.stub();
          reloadStub.returns([]);
          component.args = {
            organization: { attachTargetProfiles: sinon.stub().rejects(errors) },
            targetProfileSummaries: {
              reload: reloadStub,
              map: mapStub,
            },
          };
          component.targetProfilesToAttach = '1,1,2,3,3';

          await component.attachTargetProfiles(event);

          assert.strictEqual(component.targetProfilesToAttach, '1,1,2,3,3');
          assert.strictEqual(component.notifications.error.withArgs('Une erreur est survenue.').callCount, 2);
        });
      });

      module('when the error is not correctly formed', () => {
        test('it displays a default notification', async function (assert) {
          const component = createComponent('component:organizations/target-profiles-section');
          const errors = {};
          const organization = {
            attachTargetProfiles: sinon.stub().rejects(),
          };
          const targetProfileSummaries = [];
          targetProfileSummaries.reload = sinon.stub();
          component.notifications = { error: sinon.stub(), success: sinon.stub() };
          const getStub = sinon.stub();
          getStub.returns([]);
          component.args = {
            targetProfile: { get: getStub, attachOrganizations: sinon.stub().rejects(errors) },
            targetProfileSummaries,
            organization,
          };
          component.targetProfilesToAttach = '1,1,2,3,3';

          await component.attachTargetProfiles(event);

          assert.strictEqual(component.targetProfilesToAttach, '1,1,2,3,3');
          assert.ok(component.notifications.error.calledWith('Une erreur est survenue.'));
        });
      });
    });
  });

  module('#canDetachTargetProfile', () => {
    test('should return true if target profile is detachable and user can has access to organization action', function (assert) {
      //given
      class AccessControlStub extends Service {
        hasAccessToOrganizationActionsScope = true;
      }
      this.owner.register('service:access-control', AccessControlStub);

      const component = createComponent('component:organizations/target-profiles-section');

      // then
      assert.ok(component.canDetachTargetProfile({ canDetach: true }));
    });
    test("should return false if target profile is not detachable and user don't has access to organization action", function (assert) {
      //given
      class AccessControlStub extends Service {
        hasAccessToOrganizationActionsScope = false;
      }
      this.owner.register('service:access-control', AccessControlStub);

      const component = createComponent('component:organizations/target-profiles-section');

      // then
      assert.notOk(component.canDetachTargetProfile({ canDetach: false }));
    });
  });
});
