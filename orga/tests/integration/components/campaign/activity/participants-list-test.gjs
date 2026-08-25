/* eslint-disable ember/template-no-let-reference */
import { render } from '@1024pix/ember-testing-library';
import EmberObject from '@ember/object';
import Service from '@ember/service';
import { click } from '@ember/test-helpers';
import { t } from 'ember-intl/test-support';
import ParticipantsList from 'pix-orga/components/campaign/activity/participants-list';
import { module, test } from 'qunit';
import sinon from 'sinon';

import setupIntlRenderingTest from '../../../../helpers/setup-intl-rendering';

module('Integration | Component | Campaign::Activity::ParticipantsList', function (hooks) {
  let noop, clickSpy;
  setupIntlRenderingTest(hooks);
  hooks.beforeEach(function () {
    clickSpy = sinon.stub();
    noop = sinon.stub();

    this.owner.lookup('service:store');
    this.owner.setupRouter();
  });

  test('it should display participations details', async function (assert) {
    class CurrentUserStub extends Service {
      isAdminInOrganization = true;
    }
    this.owner.register('service:current-user', CurrentUserStub);

    const campaign = { externalIdLabel: 'id', type: 'ASSESSMENT' };

    const participations = [
      {
        firstName: 'Joe',
        lastName: 'La frite',
        status: 'STARTED',
        participantExternalId: 'patate',
      },
    ];

    const screen = await render(
      <template>
        <ParticipantsList
          @campaign={{campaign}}
          @participations={{participations}}
          @onClickParticipant={{noop}}
          @onFilter={{noop}}
        />
      </template>,
    );

    assert.ok(screen.getByText('Joe'));
    assert.ok(screen.getByText('La frite'));
    assert.ok(screen.getByText('patate'));
    assert.ok(screen.getAllByText(t('components.participation-status.STARTED')));
  });

  test('it should link to the last shared or current campaign participation details', async function (assert) {
    class CurrentUserStub extends Service {
      isAdminInOrganization = true;
    }
    this.owner.register('service:current-user', CurrentUserStub);

    const campaign = { id: '100', externalIdLabel: 'id', type: 'ASSESSMENT' };

    const participations = [
      {
        id: '123',
        firstName: 'Joe',
        lastName: 'La frite',
        status: 'STARTED',
        participantExternalId: 'patate',
        lastCampaignParticipationId: '456',
      },
    ];

    const screen = await render(
      <template>
        <ParticipantsList
          @campaign={{campaign}}
          @participations={{participations}}
          @onClickParticipant={{clickSpy}}
          @onFilter={{noop}}
        />
      </template>,
    );
    const row = screen.getByText('La frite').closest('tr');
    await click(row);
    sinon.assert.calledOnceWithMatch(clickSpy, {
      id: '123',
      firstName: 'Joe',
      lastName: 'La frite',
      status: 'STARTED',
      participantExternalId: 'patate',
      lastCampaignParticipationId: '456',
    });
    assert.dom(screen.getByRole('link', /la frite/i)).hasAttribute('href', '/campagnes/100/profils/456');
  });

  test('it should display participation column when showParticipationCount is true', async function (assert) {
    class CurrentUserStub extends Service {
      isAdminInOrganization = true;
    }
    this.owner.register('service:current-user', CurrentUserStub);
    const campaign = { id: '100', externalIdLabel: 'id', type: 'ASSESSMENT' };

    const participations = [
      {
        id: '123',
        firstName: 'Joe',
        lastName: 'La frite',
        status: 'STARTED',
        participantExternalId: 'patate',
        lastCampaignParticipationId: '456',
        participationCount: 2,
      },
    ];
    const screen = await render(
      <template>
        <ParticipantsList
          @campaign={{campaign}}
          @participations={{participations}}
          @onClickParticipant={{clickSpy}}
          @onFilter={{noop}}
          @showParticipationCount={{true}}
        />
      </template>,
    );

    assert.ok(screen.getByText(t('pages.campaign-activity.table.column.participationCount')));
    assert.ok(screen.getByText('2'));
  });

  test('it should hide participation column when showParticipationCount is false', async function (assert) {
    class CurrentUserStub extends Service {
      isAdminInOrganization = true;
      organization = { isManagingStudents: false };
    }
    this.owner.register('service:current-user', CurrentUserStub);
    const campaign = { id: '100', externalIdLabel: 'id', type: 'ASSESSMENT' };

    const participations = [
      {
        id: '123',
        firstName: 'Joe',
        lastName: 'La frite',
        status: 'STARTED',
        participantExternalId: 'patate',
        lastCampaignParticipationId: '456',
        participationCount: 1,
      },
    ];
    const screen = await render(
      <template>
        <ParticipantsList
          @campaign={{campaign}}
          @participations={{participations}}
          @onClickParticipant={{clickSpy}}
          @onFilter={{noop}}
        />
      </template>,
    );

    assert.notOk(screen.queryByText('Participations'));
  });

  test('[A11Y] it should have an aria label', async function (assert) {
    class CurrentUserStub extends Service {
      isAdminInOrganization = true;
      organization = { isManagingStudents: false };
    }
    this.owner.register('service:current-user', CurrentUserStub);
    const campaign = { externalIdLabel: 'id', type: 'ASSESSMENT' };

    const participations = [
      {
        firstName: 'Joe',
        lastName: 'La frite',
        status: 'STARTED',
        participantExternalId: 'patate',
      },
    ];

    const screen = await render(
      <template>
        <ParticipantsList
          @campaign={{campaign}}
          @participations={{participations}}
          @onClickParticipant={{noop}}
          @onFilter={{noop}}
        />
      </template>,
    );

    assert.ok(
      screen.getByLabelText(t('pages.campaign-activity.table.see-results', { firstName: 'Joe', lastName: 'La frite' })),
    );
  });

  module('#deleteParticipation', function () {
    module('when the campaign is linked to a combined course', function () {
      test('should not display delete participation button', async function (assert) {
        class CurrentUserStub extends Service {
          isAdminInOrganization = true;
        }
        this.owner.register('service:current-user', CurrentUserStub);

        const campaign = { externalIdLabel: 'id', type: 'ASSESSMENT', isFromCombinedCourse: true };
        const participations = [
          {
            firstName: 'Joe',
            lastName: 'La frite',
            status: 'STARTED',
            participantExternalId: 'patate',
          },
        ];

        const screen = await render(
          <template>
            <ParticipantsList
              @campaign={{campaign}}
              @participations={{participations}}
              @onClickParticipant={{noop}}
              @onFilter={{noop}}
            />
          </template>,
        );

        assert.notOk(screen.queryByRole('button', { name: 'Supprimer la participation' }));
      });
    });

    module('when the user is admin', function () {
      test('it should display the trash to delete the participation', async function (assert) {
        class CurrentUserStub extends Service {
          isAdminInOrganization = true;
        }
        this.owner.register('service:current-user', CurrentUserStub);

        const campaign = { externalIdLabel: 'id', type: 'ASSESSMENT' };
        const participations = [
          {
            firstName: 'Joe',
            lastName: 'La frite',
            status: 'STARTED',
            participantExternalId: 'patate',
            lastCampaignParticipationId: 18,
          },
        ];

        const screen = await render(
          <template>
            <ParticipantsList
              @campaign={{campaign}}
              @participations={{participations}}
              @onClickParticipant={{noop}}
              @onFilter={{noop}}
            />
          </template>,
        );

        assert.ok(screen.getByRole('button', { name: 'Supprimer la participation' }));
      });

      test('it hide the trash to delete the participation if not exist', async function (assert) {
        class CurrentUserStub extends Service {
          isAdminInOrganization = false;
          prescriber = EmberObject.create({ id: '109' });
        }
        this.owner.register('service:current-user', CurrentUserStub);

        const campaign = { externalIdLabel: 'id', type: 'ASSESSMENT', ownerId: 109 };
        const participations = [
          {
            firstName: 'Joe',
            lastName: 'La frite',
            status: 'NOT_STARTED',
            participantExternalId: 'patate',
          },
        ];

        const screen = await render(
          <template>
            <ParticipantsList
              @campaign={{campaign}}
              @participations={{participations}}
              @onClickParticipant={{noop}}
              @onFilter={{noop}}
            />
          </template>,
        );

        assert.notOk(screen.queryByRole('button', { name: 'Supprimer la participation' }));
      });
    });

    module('when the user is the owner of the campaign', function () {
      test('it displays the trash to delete the participation if exist', async function (assert) {
        class CurrentUserStub extends Service {
          isAdminInOrganization = false;
          prescriber = EmberObject.create({ id: '109' });
        }
        this.owner.register('service:current-user', CurrentUserStub);

        const campaign = { externalIdLabel: 'id', type: 'ASSESSMENT', ownerId: 109 };
        const participations = [
          {
            firstName: 'Joe',
            lastName: 'La frite',
            status: 'STARTED',
            participantExternalId: 'patate',
            lastCampaignParticipationId: 18,
          },
        ];

        const screen = await render(
          <template>
            <ParticipantsList
              @campaign={{campaign}}
              @participations={{participations}}
              @onClickParticipant={{noop}}
              @onFilter={{noop}}
            />
          </template>,
        );

        assert.ok(screen.getByRole('button', { name: 'Supprimer la participation' }));
      });

      test('it hide the trash to delete the participation if not exist', async function (assert) {
        class CurrentUserStub extends Service {
          isAdminInOrganization = false;
          prescriber = EmberObject.create({ id: '109' });
        }
        this.owner.register('service:current-user', CurrentUserStub);

        const campaign = { externalIdLabel: 'id', type: 'ASSESSMENT', ownerId: 109 };
        const participations = [
          {
            firstName: 'Joe',
            lastName: 'La frite',
            status: 'NOT_STARTED',
            participantExternalId: 'patate',
          },
        ];

        const screen = await render(
          <template>
            <ParticipantsList
              @campaign={{campaign}}
              @participations={{participations}}
              @onClickParticipant={{noop}}
              @onFilter={{noop}}
            />
          </template>,
        );

        assert.notOk(screen.queryByRole('button', { name: 'Supprimer la participation' }));
      });
    });

    module('when the user is neither an admin nor the owner of the campaign', function () {
      test('it should not display the trash to delete the participation', async function (assert) {
        class CurrentUserStub extends Service {
          isAdminInOrganization = false;
          prescriber = EmberObject.create({ id: '109' });
        }
        this.owner.register('service:current-user', CurrentUserStub);

        const campaign = { externalIdLabel: 'id', type: 'ASSESSMENT', ownerId: 1 };
        const participations = [
          {
            firstName: 'Joe',
            lastName: 'La frite',
            status: 'STARTED',
            participantExternalId: 'patate',
          },
        ];

        const screen = await render(
          <template>
            <ParticipantsList
              @campaign={{campaign}}
              @participations={{participations}}
              @onClickParticipant={{noop}}
              @onFilter={{noop}}
            />
          </template>,
        );

        assert.notOk(screen.queryByRole('button', { name: 'Supprimer la participation' }));
      });
    });
  });
});
/* eslint-enable ember/template-no-let-reference */
