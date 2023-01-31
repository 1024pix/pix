import sinon from 'sinon';
import { module, test } from 'qunit';
import { click } from '@ember/test-helpers';
import Service from '@ember/service';
import EmberObject from '@ember/object';
import { fillByLabel, clickByText, render } from '@1024pix/ember-testing-library';
import hbs from 'htmlbars-inline-precompile';
import setupIntlRenderingTest from '../../../../helpers/setup-intl-rendering';

module('Integration | Component | Campaign::Activity::ParticipantsList', function (hooks) {
  let store;
  setupIntlRenderingTest(hooks);

  hooks.beforeEach(function () {
    this.set('noop', sinon.stub());
    store = this.owner.lookup('service:store');
  });

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

    await render(
      hbs`<Campaign::Activity::ParticipantsList
  @campaign={{this.campaign}}
  @participations={{this.participations}}
  @onClickParticipant={{this.noop}}
  @onFilter={{this.noop}}
/>`
    );

    assert.contains('Joe');
    assert.contains('La frite');
    assert.contains('patate');
    assert.contains("En attente d'envoi");
  });

  test('[A11Y] it should have an aria label', async function (assert) {
    this.set('campaign', { idPixLabel: 'id', type: 'ASSESSMENT' });

    this.set('participations', [
      {
        firstName: 'Joe',
        lastName: 'La frite',
        status: 'TO_SHARE',
        participantExternalId: 'patate',
      },
    ]);

    const screen = await render(
      hbs`<Campaign::Activity::ParticipantsList
  @campaign={{this.campaign}}
  @participations={{this.participations}}
  @onClickParticipant={{this.noop}}
  @onFilter={{this.noop}}
/>`
    );

    assert
      .dom(
        screen.getByLabelText(
          this.intl.t('pages.campaign-activity.table.see-results', { firstName: 'Joe', lastName: 'La frite' })
        )
      )
      .exists();
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

        await render(hbs`<Campaign::Activity::ParticipantsList
  @campaign={{this.campaign}}
  @participations={{this.participations}}
  @onClickParticipant={{this.noop}}
  @onFilter={{this.noop}}
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

        await render(hbs`<Campaign::Activity::ParticipantsList
  @campaign={{this.campaign}}
  @participations={{this.participations}}
  @onClickParticipant={{this.noop}}
  @onFilter={{this.noop}}
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

        await render(hbs`<Campaign::Activity::ParticipantsList
  @campaign={{this.campaign}}
  @participations={{this.participations}}
  @onClickParticipant={{this.noop}}
  @onFilter={{this.noop}}
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
      this.campaign = store.createRecord('campaign', { type: 'ASSESSMENT' });
      this.participations = [];
      this.selectedStatus = 'TO_SHARE';

      const screen = await render(hbs`<Campaign::Activity::ParticipantsList
  @campaign={{this.campaign}}
  @participations={{this.participations}}
  @selectedStatus={{this.selectedStatus}}
  @onClickParticipant={{this.noop}}
  @onFilter={{this.noop}}
/>`);
      click(screen.getByLabelText('Statut'));
      assert.ok(await screen.findByRole('option', { name: "En attente d'envoi", selected: true }));
    });

    test('should filter on participations status', async function (assert) {
      class CurrentUserStub extends Service {
        isAdminInOrganization = false;
        prescriber = 1;
      }
      this.owner.register('service:current-user', CurrentUserStub);
      this.campaign = store.createRecord('campaign', { type: 'ASSESSMENT' });
      this.participations = [];
      this.onFilter = sinon.stub();

      const screen = await render(hbs`<Campaign::Activity::ParticipantsList
  @campaign={{this.campaign}}
  @participations={{this.participations}}
  @onClickParticipant={{this.noop}}
  @onFilter={{this.onFilter}}
/>`);

      await click(screen.getByLabelText('Statut'));
      await click(await screen.findByRole('option', { name: 'Résultats reçus' }));

      assert.ok(this.onFilter.calledWith('status', 'SHARED'));
    });
  });

  module('division filter', function () {
    class CurrentUserStub extends Service {
      organization = { isSco: true };
      isSCOManagingStudents = true;
    }

    test('it should filter on participation divisions', async function (assert) {
      // given
      this.owner.register('service:current-user', CurrentUserStub);
      const store = this.owner.lookup('service:store');
      this.campaign = store.createRecord('campaign', {
        idPixLabel: 'id',
        divisions: [store.createRecord('division', { name: '3B' }), store.createRecord('division', { name: '3A' })],
      });

      this.participations = [];
      this.onFilter = sinon.stub();

      await render(hbs`<Campaign::Activity::ParticipantsList
  @campaign={{this.campaign}}
  @participations={{this.participations}}
  @onClickParticipant={{this.noop}}
  @onFilter={{this.onFilter}}
/>`);

      await clickByText('Classes');
      await clickByText('3A');

      // then
      assert.ok(this.onFilter.calledWith('divisions', ['3A']));
    });
  });

  module('group filter', function () {
    class CurrentUserStub extends Service {
      organization = { isSup: true };
      isSUPManagingStudents = true;
    }
    test('it should filter on participants groups', async function (assert) {
      // given
      this.owner.register('service:current-user', CurrentUserStub);
      const store = this.owner.lookup('service:store');
      this.campaign = store.createRecord('campaign', {
        idPixLabel: 'id',
        groups: [store.createRecord('group', { name: 'M1' }), store.createRecord('group', { name: 'M2' })],
      });
      this.participations = [];
      this.onFilter = sinon.stub();

      await render(hbs`<Campaign::Activity::ParticipantsList
  @campaign={{this.campaign}}
  @participations={{this.participations}}
  @onClickParticipant={{this.noop}}
  @onFilter={{this.onFilter}}
/>`);

      await clickByText('Groupes');
      await clickByText('M2');

      // then
      assert.ok(this.onFilter.calledWith('groups', ['M2']));
    });
  });

  module('search filter', function () {
    test('it should filter participants by names', async function (assert) {
      this.campaign = { idPixLabel: 'id' };
      this.participations = [];
      this.onFilter = sinon.stub();

      await render(hbs`<Campaign::Activity::ParticipantsList
  @campaign={{this.campaign}}
  @participations={{this.participations}}
  @onClickParticipant={{this.noop}}
  @onFilter={{this.onFilter}}
/>`);

      await fillByLabel('Recherche sur le nom et prénom', 'Jean');

      assert.ok(this.onFilter.calledWith('search', 'Jean'));
    });
  });
});
