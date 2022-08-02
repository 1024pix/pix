import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { clickByName, render } from '@1024pix/ember-testing-library';
import hbs from 'htmlbars-inline-precompile';
import dayjs from 'dayjs';
import sinon from 'sinon';

module('Integration | Component | organization-invitations', function (hooks) {
  setupRenderingTest(hooks);

  module('without invitation', function () {
    test('it should display a message when there is no invitations', async function (assert) {
      // given
      this.set('invitations', []);

      // when
      const screen = await render(hbs`<Organizations::Invitations @invitations={{invitations}}/>`);

      // then
      assert.dom(screen.getByText('Aucune invitation en attente')).exists();
    });
  });

  module('with invitations', function () {
    test('it should list the pending team invitations', async function (assert) {
      // given
      const cancelOrganizationInvitationStub = sinon.stub();
      this.set('cancelOrganizationInvitation', cancelOrganizationInvitationStub);
      this.set('invitations', [
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
      ]);

      // when
      const screen = await render(
        hbs`<Organizations::Invitations
          @invitations={{invitations}}
          @onCancelOrganizationInvitation={{this.cancelOrganizationInvitation}}/>`
      );

      // then
      assert.dom(screen.getByText('Membre')).exists();
      assert.dom(screen.getByText('Administrateur')).exists();
      assert.dom(screen.getByText('-')).exists();
      assert.dom(screen.queryByText('Aucune invitation en attente')).doesNotExist();
    });

    module('when an admin member cancels an invitation', function () {
      test('it should cancel the organization invitation', async function (assert) {
        // given
        const cancelOrganizationInvitationStub = sinon.stub();
        this.set('cancelOrganizationInvitation', cancelOrganizationInvitationStub);
        this.set('invitations', [
          {
            email: 'naruto.uzumaki@example.net',
            role: 'ADMIN',
            roleInFrench: 'Administrateur',
            updatedAt: dayjs('2019-10-08T10:50:00Z').utcOffset(2),
          },
        ]);

        // when
        await render(
          hbs`<Organizations::Invitations
        @invitations={{this.invitations}}
        @onCancelOrganizationInvitation={{this.cancelOrganizationInvitation}}
      />`
        );
        await clickByName('Annuler l’invitation de naruto.uzumaki@example.net');

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
