import { visit } from '@1024pix/ember-testing-library';
import { click, fillIn } from '@ember/test-helpers';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { t } from 'ember-intl/test-support';
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
  module('documentation button', function () {
    test('when mission has a documentation, should display button', async function (assert) {
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
        documentationUrl: 'http://madoc.pix.fr',
      });

      const screen = await visit('/missions/1');
      assert.dom(screen.getByRole('link', { name: t('pages.missions.mission.details.button-label') })).exists();
      assert.strictEqual(
        screen.getByRole('link', { name: t('pages.missions.mission.details.button-label') }).href,
        'http://madoc.pix.fr/',
      );
    });
    test('when mission has not a documentation, should not display any button', async function (assert) {
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
      assert.dom(screen.queryByRole('link', { name: t('pages.missions.mission.details.button-label') })).doesNotExist();
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
        await click(screen.getByLabelText(t('common.filters.divisions.label')));
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
      test('Should filter on the mission assessment result', async function (assert) {
        server.create('mission-learner', {
          firstName: 'Charles',
          lastName: 'Qui a réussi',
          division: 'CM2-C',
          status: 'completed',
          organizationId: 1,
          result: {
            global: 'reached',
          },
        });
        server.create('mission-learner', {
          firstName: 'Charles',
          lastName: 'Qui a moins réussi',
          division: 'CM2-B',
          status: 'completed',
          organizationId: 1,
          result: {
            global: 'not-reached',
          },
        });

        const screen = await visit('/missions/1/results');

        const select = screen.getByRole('button', {
          name: t('pages.missions.mission.table.result.filters.global-result.label'),
        });
        await click(select);
        const optionSelected = await screen.findByRole('checkbox', {
          name: t('pages.missions.mission.table.result.filters.global-result.options.reached'),
        });
        await click(optionSelected);

        assert.strictEqual(screen.getAllByRole('cell', { name: 'Qui a réussi' }).length, 1);
        assert.dom(screen.queryByRole('cell', { name: 'Qui a moins réussi' })).doesNotExist();
      });
    });
  });
});
