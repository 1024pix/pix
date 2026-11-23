import { visit, within } from '@1024pix/ember-testing-library';
import { setupApplicationTest } from 'ember-qunit';
import { setupMirage } from 'pix-orga/tests/test-support/setup-mirage';
import { module, test } from 'qunit';

import authenticateSession from '../helpers/authenticate-session';
import setupIntl, { t } from '../helpers/setup-intl';
import { createPrescriberByUser, createUserManagingStudents } from '../helpers/test-init';

module('Acceptance | Combined course page', function (hooks) {
  setupApplicationTest(hooks);
  setupMirage(hooks);
  setupIntl(hooks);
  let combinedCourse;

  hooks.beforeEach(async function () {
    const user = createUserManagingStudents('ADMIN');
    createPrescriberByUser({ user });

    await authenticateSession(user.id);

    combinedCourse = server.create('combined-course', {
      id: 2,
      code: 'AZERTY',
      name: 'Parcours Magimix',
      campaignIds: [123454],
    });
  });

  test('it should display a combined course', async function (assert) {
    // when
    const screen = await visit(`/parcours/${combinedCourse.id}`);

    // then
    assert.ok(await screen.getByRole('heading', { name: new RegExp(combinedCourse.name) }));
    assert.ok(screen.getByText(combinedCourse.code));
    assert.ok(await screen.getByRole('link', { name: t('pages.combined-course.campaigns', { count: 1, index: 1 }) }));
  });

  test('it should display combined course statistics', async function (assert) {
    // given
    const statistics = server.create('combined-course-statistic', {
      id: combinedCourse.id,
      participationsCount: 3,
      completedParticipationsCount: 2,
    });

    server.create('combined-course-participation', {
      id: 3,
      firstName: 'bob',
      lastName: 'Azerty',
      status: 'STARTED',
    });

    // when
    const screen = await visit(`/parcours/${combinedCourse.id}`);

    // then
    const totalParticipationsElement = within(
      screen.getByText(t('pages.combined-course.statistics.total-participations')).closest('dl'),
    ).getByRole('definition');
    assert.strictEqual(totalParticipationsElement.innerText, statistics.participationsCount.toString());
    const completedParticipationsElement = within(
      screen.getByText(t('pages.combined-course.statistics.completed-participations')).closest('dl'),
    ).getByRole('definition');
    assert.strictEqual(completedParticipationsElement.innerText, statistics.completedParticipationsCount.toString());
  });

  test('it should display combined course participations', async function (assert) {
    // given
    const participation = server.create('combined-course-participation', {
      id: 3,
      firstName: 'bob',
      lastName: 'Azerty',
      status: 'STARTED',
    });

    // when
    const screen = await visit(`/parcours/${combinedCourse.id}`);

    // then
    assert.ok(screen.getByText(participation.firstName));
  });
});
