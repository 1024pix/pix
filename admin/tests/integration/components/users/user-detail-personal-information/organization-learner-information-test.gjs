import { clickByName, render } from '@1024pix/ember-testing-library';
import Service from '@ember/service';
import { setupRenderingTest } from 'ember-qunit';
import OrganizationLearnerInformation from 'pix-admin/components/users/user-detail-personal-information/organization-learner-information';
import { module, test } from 'qunit';
import sinon from 'sinon';

module(
  'Integration | Component | users | user-detail-personal-information | organization-learner-information',
  function (hooks) {
    setupRenderingTest(hooks);

    module('When the admin member has access to users actions scope', function () {
      class AccessControlStub extends Service {
        hasAccessToUsersActionsScope = true;
      }

      module('When user has no organizationLearners', function () {
        test('should display no result in organization learners table', async function (assert) {
          // given
          const toggleDisplayDissociateModal = sinon.spy();
          const user = { organizationLearners: [] };
          this.owner.register('service:access-control', AccessControlStub);

          // when
          const screen = await render(
            <template>
              <OrganizationLearnerInformation
                @user={{user}}
                @toggleDisplayDissociateModal={{toggleDisplayDissociateModal}}
              />
            </template>,
          );

          // then
          assert.dom(screen.getByText('Aucun résultat')).exists();
        });
      });

      test('should display organization learners in table', async function (assert) {
        // given
        const toggleDisplayDissociateModal = sinon.spy();
        const user = { organizationLearners: [{ id: 1 }, { id: 2 }] };
        this.owner.register('service:access-control', AccessControlStub);

        // when
        const screen = await render(
          <template>
            <OrganizationLearnerInformation
              @user={{user}}
              @toggleDisplayDissociateModal={{toggleDisplayDissociateModal}}
            />
          </template>,
        );

        // then
        assert.strictEqual(screen.getAllByLabelText('Inscription').length, 2);
      });

      test('should display organization learner’s info', async function (assert) {
        // given
        const toggleDisplayDissociateModal = sinon.spy();
        const user = {
          organizationLearners: [{ firstName: 'John', lastName: 'Doe', birthdate: new Date('2020-10-02') }],
        };
        this.owner.register('service:access-control', AccessControlStub);

        // when
        const screen = await render(
          <template>
            <OrganizationLearnerInformation
              @user={{user}}
              @toggleDisplayDissociateModal={{toggleDisplayDissociateModal}}
            />
          </template>,
        );

        // then
        assert.dom(screen.getByText('John')).exists();
        assert.dom(screen.getByText('Doe')).exists();
        assert.dom(screen.getByText('02/10/2020')).exists();
      });

      test('should display organization learner’s division', async function (assert) {
        // given
        const toggleDisplayDissociateModal = sinon.spy();
        const user = {
          organizationLearners: [{ division: '3A' }],
        };
        this.owner.register('service:access-control', AccessControlStub);

        // when
        const screen = await render(
          <template>
            <OrganizationLearnerInformation
              @user={{user}}
              @toggleDisplayDissociateModal={{toggleDisplayDissociateModal}}
            />
          </template>,
        );

        // then
        assert.dom(screen.getByText('3A')).exists();
      });

      test('should display organization learner’s group', async function (assert) {
        // given
        const toggleDisplayDissociateModal = sinon.spy();
        const user = {
          organizationLearners: [{ division: 'groupe 2' }],
        };
        this.owner.register('service:access-control', AccessControlStub);

        // when
        const screen = await render(
          <template>
            <OrganizationLearnerInformation
              @user={{user}}
              @toggleDisplayDissociateModal={{toggleDisplayDissociateModal}}
            />
          </template>,
        );

        // then
        assert.dom(screen.getByText('groupe 2')).exists();
      });

      test('should display organization learner’s organization info', async function (assert) {
        // given
        const toggleDisplayDissociateModal = sinon.spy();
        const user = {
          organizationLearners: [{ organizationId: 42, organizationName: 'Dragon & Co' }],
        };
        this.owner.register('service:access-control', AccessControlStub);

        // when
        const screen = await render(
          <template>
            <OrganizationLearnerInformation
              @user={{user}}
              @toggleDisplayDissociateModal={{toggleDisplayDissociateModal}}
            />
          </template>,
        );

        // then
        assert.dom(screen.getByText('Dragon & Co')).exists();
        assert.dom('[href="/organizations/42"]').exists();
      });

      test('should display organization learner’s import date and re-import date', async function (assert) {
        // given
        const toggleDisplayDissociateModal = sinon.spy();
        const user = {
          organizationLearners: [{ createdAt: new Date('2020-01-01'), updatedAt: new Date('2020-01-02') }],
        };
        this.owner.register('service:access-control', AccessControlStub);

        // when
        const screen = await render(
          <template>
            <OrganizationLearnerInformation
              @user={{user}}
              @toggleDisplayDissociateModal={{toggleDisplayDissociateModal}}
            />
          </template>,
        );

        // then
        assert.dom(screen.getByText('01/01/2020')).exists();
        assert.dom(screen.getByText('02/01/2020')).exists();
      });

      test('should display organization learner as active', async function (assert) {
        // given
        const toggleDisplayDissociateModal = sinon.spy();
        const user = {
          organizationLearners: [{ isDisabled: false }],
        };
        this.owner.register('service:access-control', AccessControlStub);

        // when
        const screen = await render(
          <template>
            <OrganizationLearnerInformation
              @user={{user}}
              @toggleDisplayDissociateModal={{toggleDisplayDissociateModal}}
            />
          </template>,
        );

        // then
        assert.dom(screen.getByLabelText('Inscription activée')).exists();
      });

      test('should display organization learner as inactive', async function (assert) {
        // given
        const toggleDisplayDissociateModal = sinon.spy();
        const user = {
          organizationLearners: [{ isDisabled: true }],
        };
        this.owner.register('service:access-control', AccessControlStub);

        // when
        const screen = await render(
          <template>
            <OrganizationLearnerInformation
              @user={{user}}
              @toggleDisplayDissociateModal={{toggleDisplayDissociateModal}}
            />
          </template>,
        );

        // then
        assert.dom(screen.getByLabelText('Inscription désactivée')).exists();
      });

      test('should be able to dissociate user if it is enabled', async function (assert) {
        // given
        const toggleDisplayDissociateModal = sinon.stub();

        const user = {
          organizationLearners: [{ firstName: 'some name', canBeDissociated: true }],
        };
        this.owner.register('service:access-control', AccessControlStub);

        // when
        await render(
          <template>
            <OrganizationLearnerInformation
              @user={{user}}
              @toggleDisplayDissociateModal={{toggleDisplayDissociateModal}}
            />
          </template>,
        );
        await clickByName('Dissocier');

        // then
        sinon.assert.called(toggleDisplayDissociateModal);
        assert.ok(true);
      });

      test('should not be able to dissociate user if it is disabled', async function (assert) {
        // given
        const toggleDisplayDissociateModal = sinon.stub();

        const user = {
          organizationLearners: [{ firstName: 'some name', canBeDissociated: false }],
        };
        this.owner.register('service:access-control', AccessControlStub);

        // when
        const screen = await render(
          <template>
            <OrganizationLearnerInformation
              @user={{user}}
              @toggleDisplayDissociateModal={{toggleDisplayDissociateModal}}
            />
          </template>,
        );

        // then
        assert.dom(screen.queryByText('Dissocier')).doesNotExist();
      });
    });

    module('When the admin member does not have access to users actions scope', function () {
      test('it should not be able to see action button "Dissocier"', async function (assert) {
        // Given
        class AccessControlStub extends Service {
          hasAccessToUsersActionsScope = false;
        }
        const user = {
          organizationLearners: [{ firstName: 'some name', canBeDissociated: true }],
        };
        this.owner.register('service:access-control', AccessControlStub);

        // When
        const screen = await render(<template><OrganizationLearnerInformation @user={{user}} /></template>);

        // Then
        assert.dom(screen.queryByRole('button', { name: 'Dissocier' })).doesNotExist();
      });
    });
  },
);
