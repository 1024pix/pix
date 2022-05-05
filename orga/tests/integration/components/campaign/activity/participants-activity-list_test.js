import sinon from 'sinon';
import { module, test } from 'qunit';
import { find, click } from '@ember/test-helpers';
import { fillByLabel, clickByName, render } from '@1024pix/ember-testing-library';
import Service from '@ember/service';
import EmberObject from '@ember/object';
import hbs from 'htmlbars-inline-precompile';
import { t } from 'ember-intl/test-support';
import setupIntlRenderingTest from '../../../../helpers/setup-intl-rendering';

module('Integration | Component | Campaign::Activity::ParticipantsList', function (hooks) {
  setupIntlRenderingTest(hooks);

  test('it should display participations details', async function (assert) {
    class CurrentUserStub extends Service {
      isAdminInOrganization = true;
    }
    this.owner.register('service:current-user', CurrentUserStub);

    this.set('campaign', { idPixLabel: 'id', type: 'ASSESSMENT' });

    this.set('participations', [
      {
        firstName: 'Joe',
        lastName: 'La frite',
        status: 'TO_SHARE',
        participantExternalId: 'patate',
      },
    ]);
    this.set('onClickParticipant', sinon.stub());

    await render(hbs`<Campaign::Activity::ParticipantsList
        @campaign={{this.campaign}}
        @participations={{this.participations}}
        @onClickParticipant={{this.onClickParticipant}}
      />`);

    assert.contains('Joe');
    assert.contains('La frite');
    assert.contains('patate');
    assert.contains("En attente d'envoi");
  });

  module('#deleteParticipation', function () {
    module('when the user is admin', function () {
      test('it should display the trash to delete the participation', async function (assert) {
        class CurrentUserStub extends Service {
          isAdminInOrganization = true;
        }
        this.owner.register('service:current-user', CurrentUserStub);

        this.campaign = { idPixLabel: 'id', type: 'ASSESSMENT' };
        this.participations = [
          {
            firstName: 'Joe',
            lastName: 'La frite',
            status: 'TO_SHARE',
            participantExternalId: 'patate',
          },
        ];
        this.onClickParticipant = sinon.stub();

        await render(hbs`<Campaign::Activity::ParticipantsList
            @campaign={{this.campaign}}
            @participations={{this.participations}}
            @onClickParticipant={{this.onClickParticipant}}
          />`);

        assert.dom('[aria-label="Supprimer la participation"]').exists();
      });
    });

    module('when the user is the owner of the campaign', function () {
      test('it displays the trash to delete the participation', async function (assert) {
        class CurrentUserStub extends Service {
          isAdminInOrganization = false;
          prescriber = EmberObject.create({ id: 109 });
        }
        this.owner.register('service:current-user', CurrentUserStub);

        this.campaign = { idPixLabel: 'id', type: 'ASSESSMENT', ownerId: 109 };
        this.participations = [
          {
            firstName: 'Joe',
            lastName: 'La frite',
            status: 'TO_SHARE',
            participantExternalId: 'patate',
          },
        ];
        this.onClickParticipant = sinon.stub();

        await render(hbs`<Campaign::Activity::ParticipantsList
            @campaign={{this.campaign}}
            @participations={{this.participations}}
            @onClickParticipant={{this.onClickParticipant}}
          />`);

        assert.dom('[aria-label="Supprimer la participation"]').exists();
      });
    });

    module('when the user is neither an admin nor the owner of the campaign', function () {
      test('it should not display the trash to delete the participation', async function (assert) {
        class CurrentUserStub extends Service {
          isAdminInOrganization = false;
          prescriber = EmberObject.create({ id: 109 });
        }
        this.owner.register('service:current-user', CurrentUserStub);

        this.campaign = { idPixLabel: 'id', type: 'ASSESSMENT', ownerId: 1 };
        this.participations = [
          {
            firstName: 'Joe',
            lastName: 'La frite',
            status: 'TO_SHARE',
            participantExternalId: 'patate',
          },
        ];
        this.onClickParticipant = sinon.stub();

        await render(hbs`<Campaign::Activity::ParticipantsList
            @campaign={{this.campaign}}
            @participations={{this.participations}}
            @onClickParticipant={{this.onClickParticipant}}
          />`);

        assert.dom('[aria-label="Supprimer la participation"]').doesNotExist();
      });
    });

    module('when the user click to delete the campaign participation', function (hooks) {
      let participation;
      let campaign;
      let screen;
      const deleteCampaignParticipant = sinon.stub();

      hooks.beforeEach(async function () {
        class CurrentUserStub extends Service {
          isAdminInOrganization = true;
        }
        this.owner.register('service:current-user', CurrentUserStub);

        campaign = { id: 90, idPixLabel: 'id', type: 'ASSESSMENT' };
        participation = {
          id: 56,
          firstName: 'Joe',
          lastName: 'La frite',
          status: 'TO_SHARE',
          participantExternalId: 'patate',
        };

        this.set('campaign', campaign);
        this.set('participations', [participation]);
        this.onClickParticipant = sinon.stub();
        this.deleteCampaignParticipant = deleteCampaignParticipant;

        screen = await render(hbs`<Campaign::Activity::ParticipantsList
            @campaign={{this.campaign}}
            @participations={{this.participations}}
            @onClickParticipant={{this.onClickParticipant}}
            @deleteCampaignParticipant={{this.deleteCampaignParticipant}}
          />`);
      });

      test('it displays the modal to confirm the deletion', async function (assert) {
        await click('[aria-label="Supprimer la participation"]');

        assert.contains(t('pages.campaign-activity.delete-participation-modal.title'));
        assert.contains(t('pages.campaign-activity.delete-participation-modal.actions.cancel'));
        assert.contains(t('pages.campaign-activity.delete-participation-modal.actions.confirmation'));
      });

      module('When the user clicks on cancel button', function () {
        test('it closes the modal and not delete the campaign participation', async function (assert) {
          await click('[aria-label="Supprimer la participation"]');
          await clickByName(t('pages.campaign-activity.delete-participation-modal.actions.cancel'));

          assert.dom(screen.queryByText(t('pages.campaign-activity.delete-participation-modal.title'))).doesNotExist();
          assert.contains('Joe');
        });
      });

      module('When the user clicks on confirmation button', function () {
        test('it deletes the campaign participation', async function (assert) {
          await click('[aria-label="Supprimer la participation"]');
          await clickByName(t('pages.campaign-activity.delete-participation-modal.actions.confirmation'));

          assert.ok(deleteCampaignParticipant.calledWith(campaign.id, participation));
        });
      });
    });
  });

  module('status filter', function () {
    test('should set default', async function (assert) {
      class CurrentUserStub extends Service {
        isAdminInOrganization = false;
        prescriber = 1;
      }
      this.owner.register('service:current-user', CurrentUserStub);
      this.campaign = { type: 'ASSESSMENT' };
      this.participations = [];
      this.selectedStatus = 'TO_SHARE';
      this.onClickParticipant = sinon.stub();

      await render(hbs`<Campaign::Activity::ParticipantsList
        @campaign={{this.campaign}}
        @participations={{this.participations}}
        @selectedStatus={{selectedStatus}}
        @onClickParticipant={{this.onClickParticipant}}
      />`);

      assert.strictEqual(find('[aria-label="Statut"]').selectedOptions[0].value, 'TO_SHARE');
    });

    test('should filter on participations status', async function (assert) {
      class CurrentUserStub extends Service {
        isAdminInOrganization = false;
        prescriber = 1;
      }
      this.owner.register('service:current-user', CurrentUserStub);
      this.campaign = { type: 'ASSESSMENT' };
      this.participations = [];
      this.onClickParticipant = sinon.stub();
      this.onFilter = sinon.stub();

      await render(hbs`<Campaign::Activity::ParticipantsList
          @campaign={{this.campaign}}
          @participations={{this.participations}}
          @onClickParticipant={{this.onClickParticipant}}
          @onFilter={{onFilter}}
        />`);

      await fillByLabel('Statut', 'SHARED');

      assert.ok(this.onFilter.calledWith({ status: 'SHARED' }));
    });
  });
});
