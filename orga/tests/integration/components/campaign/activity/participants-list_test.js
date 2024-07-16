import { render } from '@1024pix/ember-testing-library';
import EmberObject from '@ember/object';
import Service from '@ember/service';
import { click } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';
import { t } from 'ember-intl/test-support';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../../helpers/setup-intl-rendering';

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

    const screen = await render(
      hbs`<Campaign::Activity::ParticipantsList
  @campaign={{this.campaign}}
  @participations={{this.participations}}
  @onClickParticipant={{this.noop}}
  @onFilter={{this.noop}}
/>`,
    );

    assert.ok(screen.getByText('Joe'));
    assert.ok(screen.getByText('La frite'));
    assert.ok(screen.getByText('patate'));
    assert.ok(screen.getAllByText("En attente d'envoi"));
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
        lastCampaignParticipationId: '456',
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

  test('it should display participation column when showParticipationCount is true', async function (assert) {
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
        lastCampaignParticipationId: '456',
        participationCount: 2,
      },
    ]);
    const screen = await render(
      hbs`<Campaign::Activity::ParticipantsList
  @campaign={{this.campaign}}
  @participations={{this.participations}}
  @onClickParticipant={{this.clickSpy}}
  @onFilter={{this.noop}}
  @showParticipationCount={{true}}
/>`,
    );

    assert.ok(screen.getByText(t('pages.campaign-activity.table.column.participationCount')));
    assert.ok(screen.getByText('2'));
  });

  test('it should hide participation column when showParticipationCount is false', async function (assert) {
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
        lastCampaignParticipationId: '456',
        participationCount: 1,
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

    assert.notOk(screen.queryByText('Participations'));
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

    assert.ok(
      screen.getByLabelText(t('pages.campaign-activity.table.see-results', { firstName: 'Joe', lastName: 'La frite' })),
    );
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

        const screen = await render(hbs`<Campaign::Activity::ParticipantsList
  @campaign={{this.campaign}}
  @participations={{this.participations}}
  @onClickParticipant={{this.noop}}
  @onFilter={{this.noop}}
/>`);

        assert.ok(screen.getByRole('button', { name: 'Supprimer la participation' }));
      });
    });

    module('when the user is the owner of the campaign', function () {
      test('it displays the trash to delete the participation', async function (assert) {
        class CurrentUserStub extends Service {
          isAdminInOrganization = false;
          prescriber = EmberObject.create({ id: '109' });
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

        const screen = await render(hbs`<Campaign::Activity::ParticipantsList
  @campaign={{this.campaign}}
  @participations={{this.participations}}
  @onClickParticipant={{this.noop}}
  @onFilter={{this.noop}}
/>`);

        assert.ok(screen.getByRole('button', { name: 'Supprimer la participation' }));
      });
    });

    module('when the user is neither an admin nor the owner of the campaign', function () {
      test('it should not display the trash to delete the participation', async function (assert) {
        class CurrentUserStub extends Service {
          isAdminInOrganization = false;
          prescriber = EmberObject.create({ id: '109' });
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

        const screen = await render(hbs`<Campaign::Activity::ParticipantsList
  @campaign={{this.campaign}}
  @participations={{this.participations}}
  @onClickParticipant={{this.noop}}
  @onFilter={{this.noop}}
/>`);

        assert.notOk(screen.queryByRole('button', { name: 'Supprimer la participation' }));
      });
    });
  });
});
