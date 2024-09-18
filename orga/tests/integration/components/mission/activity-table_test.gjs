import { render } from '@1024pix/ember-testing-library';
import { t } from 'ember-intl/test-support';
import ActivityTable from 'pix-orga/components/mission/activity-table';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | Mission | ActivityTable', function (hooks) {
  setupIntlRenderingTest(hooks);
  let store;

  hooks.beforeEach(function () {
    store = this.owner.lookup('service:store');
  });

  test('It should contain all dedicated headers', async function (assert) {
    // given
    const learner = store.createRecord('mission-learner', {
      id: 1,
      firstName: 'Jeanne',
      lastName: 'Micheline',
      division: 'CM1',
      organizationId: 1,
      missionStatus: 'completed',
    });

    const missionLearners = [learner];
    const mission = {
      id: 1,
      name: 'Super Mission',
      competenceName: 'Super competence',
      learningObjectives: 'Super Objectif',
    };
    // when
    const screen = await render(
      <template><ActivityTable @missionLearners={{missionLearners}} @mission={{mission}} /></template>,
    );

    //then
    assert.ok(
      screen.getByRole('columnheader', { name: t('pages.missions.mission.table.activities.headers.first-name') }),
    );
    assert.ok(
      screen.getByRole('columnheader', { name: t('pages.missions.mission.table.activities.headers.last-name') }),
    );
    assert.ok(
      screen.getByRole('columnheader', { name: t('pages.missions.mission.table.activities.headers.division') }),
    );
    assert.ok(screen.getByRole('columnheader', { name: t('pages.missions.mission.table.activities.headers.status') }));

    assert.dom(screen.getByRole('cell', { name: learner.firstName })).exists();
    assert.dom(screen.getByRole('cell', { name: learner.lastName })).exists();
    assert.dom(screen.getByRole('cell', { name: learner.division })).exists();
    assert.dom(screen.getByText(t('pages.missions.mission.table.activities.mission-status.completed'))).exists();
  });

  test('when there is learners it should display all learners', async (assert) => {
    const learner = store.createRecord('mission-learner', {
      id: 1,
      firstName: 'Jeanne',
      lastName: 'Micheline',
      division: 'CM1',
      organizationId: 1,
      missionStatus: 'completed',
    });
    const learner2 = store.createRecord('mission-learner', {
      id: 2,
      firstName: 'Jean',
      lastName: 'Michel',
      division: 'CM2',
      organizationId: 1,
      missionStatus: 'not-started',
    });

    const missionLearners = [learner, learner2];
    const mission = {
      id: 1,
      name: 'Super Mission',
      competenceName: 'Super competence',
      learningObjectives: 'Super Objectif',
    };
    // when
    const screen = await render(
      <template><ActivityTable @missionLearners={{missionLearners}} @mission={{mission}} /></template>,
    );

    //then
    assert.dom(screen.getByRole('cell', { name: learner.firstName })).exists();
    assert.dom(screen.getByRole('cell', { name: learner.lastName })).exists();
    assert.dom(screen.getByRole('cell', { name: learner.division })).exists();
    assert
      .dom(screen.getByText(t(`pages.missions.mission.table.activities.mission-status.${learner.missionStatus}`)))
      .exists();

    assert.dom(screen.getByRole('cell', { name: learner2.firstName })).exists();
    assert.dom(screen.getByRole('cell', { name: learner2.lastName })).exists();
    assert.dom(screen.getByRole('cell', { name: learner2.division })).exists();
    assert
      .dom(screen.getByText(t(`pages.missions.mission.table.activities.mission-status.${learner2.missionStatus}`)))
      .exists();
  });

  test('when there is no learners it should display a empty state message', async (assert) => {
    const missionLearners = [];
    const mission = {
      id: 1,
      name: 'Super Mission',
      competenceName: 'Super competence',
      learningObjectives: 'Super Objectif',
    };
    // when
    const screen = await render(
      <template><ActivityTable @missionLearners={{missionLearners}} @mission={{mission}} /></template>,
    );

    //then
    assert.dom(screen.getByText(t('pages.missions.mission.table.activities.no-data'))).exists();
  });
});
