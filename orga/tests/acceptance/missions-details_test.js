import { visit } from '@1024pix/ember-testing-library';
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
    hooks.beforeEach(async () => {
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

      server.create('mission-learner', {
        id: 1,
        firstName: 'Mario',
        lastName: 'Super',
        division: 'CM2-A',
        organizationId: 1,
      });
      server.create('mission-learner', {
        id: 2,
        firstName: 'Luigi',
        lastName: 'SuperBros',
        division: 'CM2-B',
        organizationId: 1,
      });
    });

    test('Should display learner informations', async function (assert) {
      // given
      const screen = await visit('/missions/1');

      assert.strictEqual(screen.getAllByRole('row').length, 3, 'Table length header included');
      assert.dom(screen.getByText('Super')).exists();
      assert.dom(screen.getByText('Mario')).exists();
      assert.dom(screen.getByText('SuperBros')).exists();
      assert.dom(screen.getByText('Luigi')).exists();
    });

    test('Should display the pagination ', async function (assert) {
      // given
      const screen = await visit('/missions/1');

      assert.ok(screen.getByText('Page 1 / 1'));
      assert.dom(screen.getByLabelText(this.intl.t('common.pagination.action.select-page-size'))).hasText('25');
    });

    test('the table should have a caption', async function (assert) {
      // given
      const screen = await visit('/missions/1');

      assert
        .dom(
          screen.getByText(
            this.intl.t('pages.missions.details.learners.list.caption', { missionName: 'Super Mission' }),
          ),
        )
        .exists({ count: 1 });
    });
  });
});
