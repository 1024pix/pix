import sinon from 'sinon';
import { module, test } from 'qunit';
import { find } from '@ember/test-helpers';
import { fillByLabel, render } from '@1024pix/ember-testing-library';
import Service from '@ember/service';
import EmberObject from '@ember/object';
import hbs from 'htmlbars-inline-precompile';
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
