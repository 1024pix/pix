import { visit } from '@1024pix/ember-testing-library';
import { click, fillIn } from '@ember/test-helpers';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { setupApplicationTest } from 'ember-qunit';
import { module, test } from 'qunit';

import authenticateSession from '../helpers/authenticate-session';
import setupIntl from '../helpers/setup-intl';
import { createPrescriberByUser, createUserWithMembershipAndTermsOfServiceAccepted } from '../helpers/test-init';

module('Acceptance | Missions Detail', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks);

  test('All data should be loaded', async function (assert) {
    // given
    const user = createUserWithMembershipAndTermsOfServiceAccepted();
    const prescriber = createPrescriberByUser({ user });
    prescriber.features = { ...prescriber.features, MISSIONS_MANAGEMENT: true };
    await authenticateSession(user.id);

    server.create('mission', {
      id: 1,
      name: 'Super Mission',
      competenceName: 'Super competence',
      learningObjectives: 'Super Objectif',
    });

    const screen = await visit('/missions/1');

    assert.strictEqual(screen.getAllByText('Super Mission').length, 2);
    assert.dom(screen.getByText('Super competence')).exists();
    assert.dom(screen.getByText('Super Objectif')).exists();
  });

  module('when there is no mission learners', function () {
    test('should display empty state', async function (assert) {
      // given
      const user = createUserWithMembershipAndTermsOfServiceAccepted();
      const prescriber = createPrescriberByUser({ user });
      prescriber.features = { ...prescriber.features, MISSIONS_MANAGEMENT: true };
      await authenticateSession(user.id);

      server.create('mission', {
        id: 1,
        name: 'Super Mission',
        competenceName: 'Super competence',
        learningObjectives: 'Super Objectif',
      });

      const screen = await visit('/missions/1');

      assert.dom(screen.getByText(this.intl.t('pages.missions.details.learners.no-data'))).exists();
    });
  });

  module('when there are mission learners', function (hooks) {
    hooks.beforeEach(async function () {
      const user = createUserWithMembershipAndTermsOfServiceAccepted({ organizationType: 'SCO-1D' });
      const prescriber = createPrescriberByUser({ user });
      prescriber.features = { ...prescriber.features, MISSIONS_MANAGEMENT: true };
      await authenticateSession(user.id);
      server.create('mission', {
        id: 1,
        name: 'Super Mission',
        competenceName: 'Super competence',
        learningObjectives: 'Super Objectif',
      });
    });
    const expectedLearners = [
      {
        firstName: 'Mario',
        lastName: 'Super',
        division: 'CM2-A',
        displayableStatus: 'pages.missions.details.learners.list.mission-status.not-started',
        status: 'not-started',
      },
      {
        firstName: 'Luigi',
        lastName: 'SuperBros',
        division: 'CM2-B',
        displayableStatus: 'pages.missions.details.learners.list.mission-status.started',
        status: 'started',
      },
      {
        firstName: 'Charles',
        lastName: 'Xavier',
        division: 'CM2-C',
        displayableStatus: 'pages.missions.details.learners.list.mission-status.completed',
        status: 'completed',
      },
    ];

    expectedLearners.map((participant) => {
      test(`Should display learner information ${participant.firstName} ${participant.lastName} `, async function (assert) {
        server.create('mission-learner', {
          id: 1,
          firstName: participant.firstName,
          lastName: participant.lastName,
          division: participant.division,
          organizationId: 1,
          status: participant.status,
        });

        const screen = await visit('/missions/1');

        assert.dom(screen.getByRole('cell', { name: participant.firstName })).exists();
        assert.dom(screen.getByRole('cell', { name: participant.lastName })).exists();
        assert.dom(screen.getByRole('cell', { name: participant.division })).exists();
        assert.dom(screen.getByRole('cell', { name: this.intl.t(participant.displayableStatus) })).exists();
      });
    });

    test('Should display the pagination ', async function (assert) {
      // given
      server.create('mission-learner', {
        firstName: 'Charles',
        lastName: 'Xavier',
        division: 'CM2-C',
        status: 'completed',
        organizationId: 1,
      });

      const screen = await visit('/missions/1');

      assert.ok(screen.getByText('Page 1 / 1'));
      assert.dom(screen.getByLabelText(this.intl.t('common.pagination.action.select-page-size'))).hasText('25');
    });

    test('the table should have a caption', async function (assert) {
      // given
      server.create('mission-learner', {
        firstName: 'Charles',
        lastName: 'Xavier',
        division: 'CM2-C',
        status: 'completed',
        organizationId: 1,
      });

      const screen = await visit('/missions/1');

      assert
        .dom(
          screen.getByText(
            this.intl.t('pages.missions.details.learners.list.caption', { missionName: 'Super Mission' }),
          ),
        )
        .exists({ count: 1 });
    });
    module('FilterBanner', function () {
      test('should filter division', async function (assert) {
        server.create('division', {
          name: 'CM2-A',
        });
        server.create('division', {
          name: 'CM2-B',
        });
        server.create('division', {
          name: 'CM2-C',
        });

        const participantCM2C = server.create('mission-learner', {
          firstName: 'Charles',
          lastName: 'Xavier',
          division: 'CM2-C',
          status: 'completed',
          organizationId: 1,
        });
        const participantCM2B = server.create('mission-learner', {
          firstName: 'Thierry',
          lastName: 'Henry',
          division: 'CM2-B',
          status: 'completed',
          organizationId: 1,
        });
        const participantCM2A = server.create('mission-learner', {
          firstName: 'Bob',
          lastName: 'Gustave',
          division: 'CM2-A',
          status: 'completed',
          organizationId: 1,
        });

        const screen = await visit('/missions/1');
        await click(screen.getByLabelText(this.intl.t('common.filters.divisions.label')));
        await click(await screen.findByRole('checkbox', { name: 'CM2-C' }));
        await click(await screen.findByRole('checkbox', { name: 'CM2-A' }));

        assert.dom(screen.getByRole('cell', { name: participantCM2C.firstName })).exists();
        assert.dom(screen.getByRole('cell', { name: participantCM2A.firstName })).exists();
        assert.dom(screen.queryByRole('cell', { name: participantCM2B.firstName })).doesNotExist();
      });
      test('Should filter on the firstname name or lastname', async function (assert) {
        server.create('mission-learner', {
          firstName: 'Charles',
          lastName: 'Pas-Xavier',
          division: 'CM2-C',
          status: 'completed',
          organizationId: 1,
        });
        const xavierHenry = server.create('mission-learner', {
          firstName: 'Xavier',
          lastName: 'Henry',
          division: 'CM2-B',
          status: 'completed',
          organizationId: 1,
        });
        server.create('mission-learner', {
          firstName: 'Henry',
          lastName: 'Charles',
          division: 'CM2-A',
          status: 'completed',
          organizationId: 1,
        });

        const screen = await visit('/missions/1');
        await fillIn(screen.getByPlaceholderText('Nom, prénom'), 'charles');

        assert.strictEqual(screen.getAllByRole('cell', { name: 'Charles' }).length, 2);
        assert.dom(screen.queryByRole('cell', { name: xavierHenry.firstName })).doesNotExist();
      });
    });
  });
});
