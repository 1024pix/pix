import { render } from '@1024pix/ember-testing-library';
import { t } from 'ember-intl/test-support';
import ResultTable from 'pix-orga/components/mission/result-table';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../../helpers/setup-intl-rendering';

module('Integration | Component | Mission | ResultTable', function (hooks) {
  setupIntlRenderingTest(hooks);
  let store;

  hooks.beforeEach(function () {
    store = this.owner.lookup('service:store');
  });

  test('It should contain all dedicated headers', async function (assert) {
    const learner = store.createRecord('mission-learner', {
      id: 1,
      firstName: 'Jeanne',
      lastName: 'Micheline',
      division: 'CM1',
      organizationId: 1,
      result: 'reached',
    });

    const missionLearners = [learner];
    const mission = {
      id: 1,
      name: 'Super Mission',
      competenceName: 'Super competence',
      learningObjectives: 'Super Objectif',
    };
    const screen = await render(
      <template><ResultTable @missionLearners={{missionLearners}} @mission={{mission}} /></template>,
    );

    assert.ok(screen.getByRole('columnheader', { name: t('pages.missions.mission.table.result.headers.first-name') }));
    assert.ok(screen.getByRole('columnheader', { name: t('pages.missions.mission.table.result.headers.last-name') }));
    assert.ok(screen.getByRole('columnheader', { name: t('pages.missions.mission.table.result.headers.division') }));
    assert.ok(screen.getByRole('columnheader', { name: t('pages.missions.mission.table.result.headers.result') }));
  });

  test('It should contain all learner', async function (assert) {
    const learner1 = store.createRecord('mission-learner', {
      id: 1,
      firstName: 'Jeanne',
      lastName: 'Micheline',
      division: 'CM1',
      organizationId: 1,
      result: 'reached',
    });

    const learner2 = store.createRecord('mission-learner', {
      id: 2,
      firstName: 'Paul',
      lastName: 'Kebab',
      division: 'CM2',
      organizationId: 1,
      result: 'partially-reached',
    });

    const missionLearners = [learner1, learner2];
    const mission = {
      id: 1,
      name: 'Super Mission',
      competenceName: 'Super competence',
      learningObjectives: 'Super Objectif',
    };

    const screen = await render(
      <template><ResultTable @missionLearners={{missionLearners}} @mission={{mission}} /></template>,
    );

    assert.dom(screen.getByRole('cell', { name: learner1.firstName })).exists();
    assert.dom(screen.getByRole('cell', { name: learner1.lastName })).exists();
    assert.dom(screen.getByRole('cell', { name: learner1.division })).exists();
    assert.dom(screen.getByText(t(`pages.missions.mission.table.result.mission-result.${learner1.result}`))).exists();

    assert.dom(screen.getByRole('cell', { name: learner2.firstName })).exists();
    assert.dom(screen.getByRole('cell', { name: learner2.lastName })).exists();
    assert.dom(screen.getByRole('cell', { name: learner2.division })).exists();
    assert.dom(screen.getByText(t(`pages.missions.mission.table.result.mission-result.${learner2.result}`))).exists();
  });

  test('when there is no learners it should display a empty state message', async (assert) => {
    const missionLearners = [];
    const mission = {
      id: 1,
      name: 'Super Mission',
      competenceName: 'Super competence',
      learningObjectives: 'Super Objectif',
    };
    const screen = await render(
      <template><ResultTable @missionLearners={{missionLearners}} @mission={{mission}} /></template>,
    );

    assert.dom(screen.getByText(t('pages.missions.mission.table.result.no-data'))).exists();
  });
});
