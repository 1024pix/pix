import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
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
      test('it displays a success message notifications without duplicated ids', async function (assert) {
        const component = createComponent('component:organizations/target-profiles-section');
        component.notifications = { success: sinon.stub() };
        component.args = {
          organization: {
            attachTargetProfiles: sinon.stub(),
          },
        };
        component.args.organization.attachTargetProfiles.resolves({
          data: {
            attributes: {
              'duplicated-ids': [],
              'attached-ids': [1, 2],
            },
          },
        });
        component.targetProfilesToAttach = '1,2';

        await component.attachTargetProfiles(event);

        assert.ok(
          component.args.organization.attachTargetProfiles.calledWith({ 'target-profiles-to-attach': ['1', '2'] })
        );
        // TODO: Fix this the next time the file is edited.
        // eslint-disable-next-line qunit/no-assert-equal
        assert.equal(component.organizationsToAttach, null);
        assert.ok(
          component.notifications.success.calledWith('Profil(s) cible(s) rattaché(s) avec succès.', {
            htmlContent: true,
          })
        );
      });

      test('it displays a success message notifications with duplicated ids', async function (assert) {
        const component = createComponent('component:organizations/target-profiles-section');
        component.notifications = { success: sinon.stub() };
        component.args = {
          organization: {
            attachTargetProfiles: sinon.stub(),
          },
        };
        component.args.organization.attachTargetProfiles.resolves({
          data: {
            attributes: {
              'duplicated-ids': [3, 4],
              'attached-ids': [1, 2],
            },
          },
        });
        component.targetProfilesToAttach = '1,2,3,4';

        await component.attachTargetProfiles(event);

        assert.ok(
          component.notifications.success.calledWith(
            'Profil(s) cible(s) rattaché(s) avec succès.<br/>Le(s) profil(s) cible(s) suivant(s) étai(en)t déjà rattaché(s) à cette organisation : 3, 4.',
            {
              htmlContent: true,
            }
          )
        );
      });

      test('it displays a message with duplicated ids', async function (assert) {
        const component = createComponent('component:organizations/target-profiles-section');
        component.notifications = { success: sinon.stub() };
        component.args = {
          organization: {
            attachTargetProfiles: sinon.stub(),
          },
        };
        component.args.organization.attachTargetProfiles.resolves({
          data: {
            attributes: {
              'duplicated-ids': [1, 2],
              'attached-ids': [],
            },
          },
        });
        component.targetProfilesToAttach = '1,2';

        await component.attachTargetProfiles(event);

        assert.ok(
          component.notifications.success.calledWith(
            'Le(s) profil(s) cible(s) suivant(s) étai(en)t déjà rattaché(s) à cette organisation : 1, 2.',
            {
              htmlContent: true,
            }
          )
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
          component.args = { organization: { attachTargetProfiles: sinon.stub().rejects(errors) } };
          component.targetProfilesToAttach = '1,1,2,3,3';

          await component.attachTargetProfiles(event);

          // TODO: Fix this the next time the file is edited.
          // eslint-disable-next-line qunit/no-assert-equal
          assert.equal(component.targetProfilesToAttach, '1,1,2,3,3');
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
          component.args = { organization: { attachTargetProfiles: sinon.stub().rejects(errors) } };
          component.targetProfilesToAttach = '1,1,5,3,3';

          await component.attachTargetProfiles(event);

          // TODO: Fix this the next time the file is edited.
          // eslint-disable-next-line qunit/no-assert-equal
          assert.equal(component.targetProfilesToAttach, '1,1,5,3,3');
          assert.ok(component.notifications.error.calledWith('I am displayed too 1'));
          assert.ok(component.notifications.error.calledWith('I am displayed too 2'));
        });

        test('it display default notification for all other error found', async function (assert) {
          const component = createComponent('component:organizations/target-profiles-section');
          const errors = {
            errors: [
              { status: '400', detail: 'message' },
              { status: '401', detail: 'I am displayed' },
            ],
          };
          component.notifications = { error: sinon.stub() };
          component.args = { organization: { attachTargetProfiles: sinon.stub().rejects(errors) } };
          component.targetProfilesToAttach = '1,1,2,3,3';

          await component.attachTargetProfiles(event);

          // TODO: Fix this the next time the file is edited.
          // eslint-disable-next-line qunit/no-assert-equal
          assert.equal(component.targetProfilesToAttach, '1,1,2,3,3');
          // TODO: Fix this the next time the file is edited.
          // eslint-disable-next-line qunit/no-assert-equal
          assert.equal(component.notifications.error.withArgs('Une erreur est survenue.').callCount, 2);
        });
      });

      module('when the error is not correctly formed', () => {
        test('it displays a default notification', async function (assert) {
          const component = createComponent('component:organizations/target-profiles-section');
          const errors = {};
          component.notifications = { error: sinon.stub() };
          component.args = { targetProfile: { attachOrganizations: sinon.stub().rejects(errors) } };
          component.targetProfilesToAttach = '1,1,2,3,3';

          await component.attachTargetProfiles(event);

          // TODO: Fix this the next time the file is edited.
          // eslint-disable-next-line qunit/no-assert-equal
          assert.equal(component.targetProfilesToAttach, '1,1,2,3,3');
          assert.ok(component.notifications.error.calledWith('Une erreur est survenue.'));
        });
      });
    });
  });
});
