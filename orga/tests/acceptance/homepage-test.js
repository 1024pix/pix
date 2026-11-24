import { visit } from '@1024pix/ember-testing-library';
import { click } from '@ember/test-helpers';
import { setupApplicationTest } from 'ember-qunit';
import { t } from 'pix-orga/tests/helpers/setup-intl';
import { setupMirage } from 'pix-orga/tests/test-support/setup-mirage';
import { module, test } from 'qunit';

import authenticateSession from '../helpers/authenticate-session';
import { createPrescriberByUser } from '../helpers/test-init';

module('Acceptance | Home page', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);

  module('When user belongs to multiple organization', function (hooks) {
    let firstOrganization, secondOrganization, user;

    hooks.beforeEach(async function () {
      user = server.create('user', {
        firstName: 'Harry',
        lastName: 'Cover',
        email: 'harry@cover.com',
        lang: 'fr',
        pixOrgaTermsOfServiceStatus: 'accepted',
      });

      firstOrganization = server.create('organization', {
        name: 'First',
      });

      secondOrganization = server.create('organization', {
        name: 'Second',
      });

      const firstMembership = server.create('membership', {
        organizationId: firstOrganization.id,
        userId: user.id,
      });

      const secondMembership = server.create('membership', {
        organizationId: secondOrganization.id,
        userId: user.id,
      });

      user.memberships = [firstMembership, secondMembership];
      user.userOrgaSettings = server.create('user-orga-setting', { organization: firstOrganization, user });
      createPrescriberByUser({
        user,
      });
      await authenticateSession(user.id);
    });

    test('it should display participation statistics for current organization', async function (assert) {
      // given
      server.create('participation-statistic', {
        id: firstOrganization.id,
        totalParticipationCount: 15,
        completedParticipationCount: 12,
        sharedParticipationCountLastThirtyDays: 8,
      });
      server.create('participation-statistic', {
        id: secondOrganization.id,
        totalParticipationCount: 0,
        completedParticipationCount: 0,
        sharedParticipationCountLastThirtyDays: 0,
      });

      // when
      const screen = await visit('/?preview=true');
      assert.ok(screen.getByText('80%'));
      assert.ok(
        screen.getByText(
          t('components.index.participation-statistics.completion-rate.description', { completed: 12, started: 15 }),
        ),
        'erreur completion rate',
      );
      assert.ok(screen.getByText('8'));

      const button = screen.getByRole('button', { name: "Changer d'organisation" });
      await click(button);
      await click(screen.getByText('Second'));

      assert.ok(screen.getByText(t('components.index.participation-statistics.completion-rate.no-activity')));
      assert.ok(
        screen.getByText(
          t('components.index.participation-statistics.completed-participations.no-completed-participations'),
        ),
      );
    });
  });
});
