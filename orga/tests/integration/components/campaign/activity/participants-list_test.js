import sinon from 'sinon';
import { module, test } from 'qunit';
import Service from '@ember/service';
import EmberObject from '@ember/object';
import { render } from '@1024pix/ember-testing-library';
import { hbs } from 'ember-cli-htmlbars';
import setupIntlRenderingTest from '../../../../helpers/setup-intl-rendering';
import { click } from '@ember/test-helpers';

module('Integration | Component | Campaign::Activity::ParticipantsList', function (hooks) {
  setupIntlRenderingTest(hooks);
  hooks.beforeEach(function () {
    this.set('clickSpy', sinon.stub());
    this.set('noop', sinon.stub());
    this.owner.lookup('service:store');
    this.owner.setupRouter();
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
/>`,
    );

    assert.contains('Joe');
    assert.contains('La frite');
    assert.contains('patate');
    assert.contains("En attente d'envoi");
  });

  test('it should link to the last shared or current campaign participation details', async function (assert) {
    class CurrentUserStub extends Service {
      isAdminInOrganization = true;
    }
    this.owner.register('service:current-user', CurrentUserStub);

    this.set('campaign', { id: '100', idPixLabel: 'id', type: 'ASSESSMENT' });

    this.set('participations', [
      {
        id: '123',
        firstName: 'Joe',
        lastName: 'La frite',
        status: 'TO_SHARE',
        participantExternalId: 'patate',
        lastSharedOrCurrentCampaignParticipationId: '456',
      },
    ]);

    const screen = await render(
      hbs`<Campaign::Activity::ParticipantsList
  @campaign={{this.campaign}}
  @participations={{this.participations}}
  @onClickParticipant={{this.clickSpy}}
  @onFilter={{this.noop}}
/>`,
    );
    const row = screen.getByText('La frite').closest('tr');
    await click(row);
    sinon.assert.calledOnceWithMatch(this.clickSpy, '100', '456');
    assert.dom(screen.getByRole('link', /la frite/i)).hasAttribute('href', '/campagnes/100/profils/456');
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
/>`,
    );

    assert
      .dom(
        screen.getByLabelText(
          this.intl.t('pages.campaign-activity.table.see-results', { firstName: 'Joe', lastName: 'La frite' }),
        ),
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
});
