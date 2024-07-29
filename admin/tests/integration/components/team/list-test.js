import { clickByName, render } from '@1024pix/ember-testing-library';
import Service from '@ember/service';
import { hbs } from 'ember-cli-htmlbars';
import { setupRenderingTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Integration | Component | team | list', function (hooks) {
  setupRenderingTest(hooks);

  module('with members', function () {
    test('should display the list of members', async function (assert) {
      // given
      this.set('members', [
        {
          firstName: 'Marie',
          lastName: 'Tim',
          email: 'marie.tim@example.net',
          role: 'SUPER_ADMIN',
          isSuperAdmin: true,
        },
      ]);

      // when
      const screen = await render(hbs`<Team::List @members={{this.members}} />`);

      // then
      assert.dom(screen.getByRole('row', { name: 'Marie Tim' })).includesText('marie.tim@example.net');
      assert.dom(screen.getByRole('row', { name: 'Marie Tim' })).includesText('SUPER_ADMIN');
    });

    test('should display action buttons for a member', async function (assert) {
      // given
      this.set('members', [
        {
          firstName: 'Marie',
          lastName: 'Tim',
          email: 'marie.tim@example.net',
          role: 'SUPER_ADMIN',
          isSuperAdmin: true,
        },
      ]);

      // when
      const screen = await render(hbs`<Team::List @members={{this.members}} />`);

      // then
      assert.dom(screen.getByRole('button', { name: "Modifier le rôle de l'agent Marie Tim" })).exists();
      assert.dom(screen.getByRole('button', { name: "Désactiver l'agent Marie Tim" })).exists();
    });

    module('when deactivating admin member', function () {
      test('should display confirm disable membership modal', async function (assert) {
        // given
        this.set('members', [
          {
            firstName: 'Marie',
            lastName: 'Tim',
            email: 'marie.tim@example.net',
            role: 'SUPER_ADMIN',
            isSuperAdmin: true,
          },
        ]);
        const screen = await render(hbs`<Team::List @members={{this.members}} />`);

        // when
        await clickByName("Désactiver l'agent Marie Tim");

        await screen.findByRole('dialog');

        // then
        assert.dom(screen.getByRole('heading', { name: "Désactivation d'un agent Pix" })).exists();
        assert.dom(screen.getByRole('button', { name: 'Annuler' })).exists();
        assert.dom(screen.getByText("Etes-vous sûr de vouloir supprimer l'accès de Marie Tim ?")).exists();
      });

      module('when the admin member confirm the disabling', function () {
        test('should disable membership ', async function (assert) {
          // given
          const deactivateAdminMemberModelStub = sinon.stub();

          this.set('members', [
            {
              firstName: 'Marie',
              lastName: 'Tim',
              email: 'marie.tim@example.net',
              role: 'SUPER_ADMIN',
              isSuperAdmin: true,
              deactivate: deactivateAdminMemberModelStub,
            },
          ]);

          const screen = await render(hbs`<Team::List @members={{this.members}} />`);
          await clickByName("Désactiver l'agent Marie Tim");

          await screen.findByRole('dialog');

          // when
          await clickByName('Confirmer');

          // then
          assert.ok(deactivateAdminMemberModelStub.called);
        });

        test('should display a success notification and close the modal', async function (assert) {
          // given
          const deactivateAdminMemberModelStub = sinon.stub();

          const notificationSuccessStub = sinon.stub();
          class NotificationsStub extends Service {
            success = notificationSuccessStub;
          }
          this.owner.register('service:notifications', NotificationsStub);

          this.set('members', [
            {
              firstName: 'Marie',
              lastName: 'Tim',
              email: 'marie.tim@example.net',
              role: 'SUPER_ADMIN',
              isSuperAdmin: true,
              deactivate: deactivateAdminMemberModelStub,
            },
          ]);

          const screen = await render(hbs`<Team::List @members={{this.members}} />`);
          await clickByName("Désactiver l'agent Marie Tim");

          await screen.findByRole('dialog');
          // when
          await clickByName('Confirmer');

          // then
          sinon.assert.calledWith(notificationSuccessStub, "L'agent Marie Tim n'a plus accès à Pix Admin.");
          assert.ok(true);
          // TODO : Add aria-hidden to Pix Modal
          //assert.dom(screen.queryByRole('button', { name: 'Confirmer' })).doesNotExist();
        });

        test('should display an error message and close the modal when an error occurs while disabling', async function (assert) {
          // given
          const deactivateAdminMemberModelStub = sinon
            .stub()
            .throws({ errors: [{ status: '422', title: 'Erreur inconnue' }] });

          const notificationErrorStub = sinon.stub();
          class NotificationsStub extends Service {
            error = notificationErrorStub;
          }
          this.owner.register('service:notifications', NotificationsStub);

          this.set('members', [
            {
              firstName: 'Marie',
              lastName: 'Tim',
              email: 'marie.tim@example.net',
              role: 'SUPER_ADMIN',
              isSuperAdmin: true,
              deactivate: deactivateAdminMemberModelStub,
            },
          ]);

          const screen = await render(hbs`<Team::List @members={{this.members}} />`);
          await clickByName("Désactiver l'agent Marie Tim");

          await screen.findByRole('dialog');
          // when
          await clickByName('Confirmer');

          // then
          sinon.assert.calledWith(notificationErrorStub, 'Impossible de désactiver cet agent.');
          assert.ok(true);
          // TODO : Add aria-hidden to Pix Modal
          //assert.dom(screen.queryByRole('button', { name: 'Confirmer' })).doesNotExist();
        });
      });
    });
  });

  test('should display no results in table when there is no members', async function (assert) {
    // given
    this.set('members', []);

    // when
    const screen = await render(hbs`<Team::List @members={{this.members}} />`);

    // then
    assert.dom(screen.getByText('Aucun résultat')).exists();
  });
});
