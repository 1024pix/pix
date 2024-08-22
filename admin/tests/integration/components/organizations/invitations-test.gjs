import { render } from '@1024pix/ember-testing-library';
import Service from '@ember/service';
import { click } from '@ember/test-helpers';
import dayjs from 'dayjs';
import { setupRenderingTest } from 'ember-qunit';
import Invitations from 'pix-admin/components/organizations/invitations';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Integration | Component | organization-invitations', function (hooks) {
  setupRenderingTest(hooks);

  module('when the admin member have access to organization scope', function (hooks) {
    hooks.beforeEach(function () {
      class AccessControlStub extends Service {
        hasAccessToOrganizationActionsScope = true;
      }
      this.owner.register('service:access-control', AccessControlStub);
    });

    module('without invitation', function () {
      test('it should display a message when there is no invitations', async function (assert) {
        // given
        const invitations = [];

        // when
        const screen = await render(<template><Invitations @invitations={{invitations}} /></template>);

        // then
        assert.dom(screen.getByText('Aucune invitation en attente')).exists();
      });
    });

    module('with invitations', function () {
      test('it should list the pending team invitations', async function (assert) {
        // given
        const cancelOrganizationInvitationStub = sinon.stub();
        const cancelOrganizationInvitation = cancelOrganizationInvitationStub;
        const invitations = [
          {
            email: 'riri@example.net',
            role: 'ADMIN',
            roleInFrench: 'Administrateur',
            updatedAt: dayjs('2019-10-08T10:50:00Z').utcOffset(2),
          },
          {
            email: 'fifi@example.net',
            role: 'MEMBER',
            roleInFrench: 'Membre',
            updatedAt: dayjs('2019-10-08T10:50:00Z').utcOffset(2),
          },
          {
            email: 'loulou@example.net',
            role: null,
            roleInFrench: '-',
            updatedAt: dayjs('2019-10-08T10:50:00Z').utcOffset(2),
          },
        ];

        // when
        const screen = await render(
          <template>
            <Invitations
              @invitations={{invitations}}
              @onCancelOrganizationInvitation={{cancelOrganizationInvitation}}
            />
          </template>,
        );

        // then
        assert.dom(screen.getByText('Membre')).exists();
        assert.dom(screen.getByText('Administrateur')).exists();
        assert.dom(screen.getByText('-')).exists();
        assert.dom(screen.queryByText('Aucune invitation en attente')).doesNotExist();
      });

      module('when the admin member cancels an invitation', function () {
        test('it should cancel the organization invitation', async function (assert) {
          // given
          const cancelOrganizationInvitationStub = sinon.stub();
          const cancelOrganizationInvitation = cancelOrganizationInvitationStub;
          const invitations = [
            {
              email: 'naruto.uzumaki@example.net',
              role: 'ADMIN',
              roleInFrench: 'Administrateur',
              updatedAt: dayjs('2019-10-08T10:50:00Z').utcOffset(2),
            },
          ];

          // when
          const screen = await render(
            <template>
              <Invitations
                @invitations={{invitations}}
                @onCancelOrganizationInvitation={{cancelOrganizationInvitation}}
              />
            </template>,
          );
          await click(screen.getByRole('button', { name: 'Annuler l’invitation de naruto.uzumaki@example.net' }));

          // then
          sinon.assert.calledWith(cancelOrganizationInvitationStub, {
            email: 'naruto.uzumaki@example.net',
            role: 'ADMIN',
            roleInFrench: 'Administrateur',
            updatedAt: dayjs('2019-10-08T10:50:00Z').utcOffset(2),
          });
          assert.ok(true);
        });
      });
    });
  });

  module('when the admin member does not have access to organization scope', function (hooks) {
    hooks.beforeEach(function () {
      class AccessControlStub extends Service {
        hasAccessToOrganizationActionsScope = false;
      }
      this.owner.register('service:access-control', AccessControlStub);
    });

    module('without invitation', function () {
      test('it should display a message when there is no invitations', async function (assert) {
        // given
        const invitations = [];

        // when
        const screen = await render(<template><Invitations @invitations={{invitations}} /></template>);

        // then
        assert.dom(screen.getByText('Aucune invitation en attente')).exists();
      });
    });

    module('with invitations', function () {
      test('it should list the pending team invitations', async function (assert) {
        // given
        const cancelOrganizationInvitationStub = sinon.stub();
        const invitations = [
          {
            email: 'riri@example.net',
            role: 'ADMIN',
            roleInFrench: 'Administrateur',
            updatedAt: dayjs('2019-10-08T10:50:00Z').utcOffset(2),
          },
          {
            email: 'fifi@example.net',
            role: 'MEMBER',
            roleInFrench: 'Membre',
            updatedAt: dayjs('2019-10-08T10:50:00Z').utcOffset(2),
          },
          {
            email: 'loulou@example.net',
            role: null,
            roleInFrench: '-',
            updatedAt: dayjs('2019-10-08T10:50:00Z').utcOffset(2),
          },
        ];

        // when
        const screen = await render(
          <template>
            <Invitations
              @invitations={{invitations}}
              @onCancelOrganizationInvitation={{cancelOrganizationInvitationStub}}
            />
          </template>,
        );

        // then
        assert.dom(screen.getByText('Membre')).exists();
        assert.dom(screen.getByText('Administrateur')).exists();
        assert.dom(screen.getByText('-')).exists();
        assert.dom(screen.queryByText('Aucune invitation en attente')).doesNotExist();
      });

      test('it should not be able to see the cancel button', async function (assert) {
        // given
        const cancelOrganizationInvitationStub = sinon.stub();
        const invitations = [
          {
            email: 'sakura.haruno@example.net',
            role: 'ADMIN',
            roleInFrench: 'Administrateur',
            updatedAt: dayjs('2019-10-08T10:50:00Z').utcOffset(2),
          },
        ];

        // when
        const screen = await render(
          <template>
            <Invitations
              @invitations={{invitations}}
              @onCancelOrganizationInvitation={{cancelOrganizationInvitationStub}}
            />
          </template>,
        );

        // then
        assert
          .dom(screen.queryByRole('button', { name: 'Annuler l’invitation de sakura.haruno@example.net' }))
          .doesNotExist();
      });
    });
  });
});
