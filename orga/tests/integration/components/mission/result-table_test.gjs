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

  module('headers management', function () {
    test('It should contain default headers', async function (assert) {
      const learner = store.createRecord('mission-learner', {
        id: 1,
        result: {},
      });

      const missionLearners = [learner];
      const mission = {
        id: 1,
        name: 'Super Mission',
        content: {
          steps: [
            {
              name: 'Super name',
            },
          ],
          dareChallenges: ['yololo'],
        },
      };
      const screen = await render(
        <template><ResultTable @missionLearners={{missionLearners}} @mission={{mission}} /></template>,
      );
      //mission-learner
      assert.ok(
        screen.getByRole('columnheader', { name: t('pages.missions.mission.table.result.headers.first-name') }),
      );
      assert.ok(screen.getByRole('columnheader', { name: t('pages.missions.mission.table.result.headers.last-name') }));
      assert.ok(screen.getByRole('columnheader', { name: t('pages.missions.mission.table.result.headers.division') }));
      assert.ok(screen.getByRole('columnheader', { name: t('pages.missions.mission.table.result.headers.result') }));
    });

    test(`it should handle columnHeaders for mission without dare challenge`, async (assert) => {
      const learner = store.createRecord('mission-learner', {
        id: 1,
        result: {},
      });

      const missionLearners = [learner];
      const selectedMission = {
        id: 1,
        name: 'Super Mission',
        content: {
          dareChallenges: [],
        },
      };

      const screen = await render(
        <template><ResultTable @missionLearners={{missionLearners}} @mission={{selectedMission}} /></template>,
      );
      //steps
      assert.notOk(
        screen.queryByRole('columnheader', { name: t('pages.missions.mission.table.result.headers.dare-challenge') }),
      );
    });
    test(`it should handle columnHeaders for mission with dare challenge`, async (assert) => {
      const learner = store.createRecord('mission-learner', {
        id: 1,
        result: {},
      });

      const missionLearners = [learner];
      const selectedMission = {
        id: 1,
        name: 'Super Mission',
        content: {
          dareChallenges: ['yololo'],
        },
      };

      const screen = await render(
        <template><ResultTable @missionLearners={{missionLearners}} @mission={{selectedMission}} /></template>,
      );

      //steps
      assert.ok(
        screen.getByRole('columnheader', { name: t('pages.missions.mission.table.result.headers.dare-challenge') }),
      );
    });
    test(`it should handle columnHeaders for mission with multiple steps`, async (assert) => {
      const learner = store.createRecord('mission-learner', {
        id: 1,
        result: {},
      });

      const missionLearners = [learner];
      const selectedMission = {
        id: 1,
        name: 'Super Mission',
        content: {
          steps: [
            {
              name: 'step one',
            },
            {
              name: 'stepo dose',
            },
          ],
        },
      };

      const screen = await render(
        <template><ResultTable @missionLearners={{missionLearners}} @mission={{selectedMission}} /></template>,
      );
      //steps
      assert.ok(
        screen.getByRole('columnheader', {
          name: t('pages.missions.mission.table.result.headers.step', { number: 1 }),
        }),
      );
      assert.ok(
        screen.getByRole('columnheader', {
          name: t('pages.missions.mission.table.result.headers.step', { number: 2 }),
        }),
      );
      assert.notOk(
        screen.queryByRole('columnheader', {
          name: t('pages.missions.mission.table.result.headers.step', { number: 3 }),
        }),
      );
    });
    test(`it should handle columnHeaders for mission without steps`, async (assert) => {
      const learner = store.createRecord('mission-learner', {
        id: 1,
        result: {},
      });

      const missionLearners = [learner];
      const selectedMission = {
        id: 1,
        name: 'Super Mission',
        content: {
          steps: [],
        },
      };

      const screen = await render(
        <template><ResultTable @missionLearners={{missionLearners}} @mission={{selectedMission}} /></template>,
      );
      //steps
      assert.notOk(
        screen.queryByRole('columnheader', {
          name: t('pages.missions.mission.table.result.headers.step', { number: 1 }),
        }),
      );
    });
  });

  module('table content', function () {
    test('should display all leaners information', async (assert) => {
      const learner1 = store.createRecord('mission-learner', {
        id: 1,
        firstName: 'Jeanne',
        lastName: 'Micheline',
        division: 'CM1',
        organizationId: 1,
        result: {
          global: 'reached',
        },
      });

      const learner2 = store.createRecord('mission-learner', {
        id: 2,
        firstName: 'Paul',
        lastName: 'Kebab',
        division: 'CM2',
        organizationId: 1,
        result: {
          global: 'partially-reached',
        },
      });

      const missionLearners = [learner1, learner2];
      const mission = {
        id: 1,
        name: 'Super Mission',
      };

      const screen = await render(
        <template><ResultTable @missionLearners={{missionLearners}} @mission={{mission}} /></template>,
      );

      assert.dom(screen.getByRole('cell', { name: learner1.firstName })).exists();
      assert.dom(screen.getByRole('cell', { name: learner1.lastName })).exists();
      assert.dom(screen.getByRole('cell', { name: learner1.division })).exists();
      assert
        .dom(screen.getByText(t(`pages.missions.mission.table.result.mission-result.${learner1.result.global}`)))
        .exists();

      assert.dom(screen.getByRole('cell', { name: learner2.firstName })).exists();
      assert.dom(screen.getByRole('cell', { name: learner2.lastName })).exists();
      assert.dom(screen.getByRole('cell', { name: learner2.division })).exists();
      assert
        .dom(screen.getByText(t(`pages.missions.mission.table.result.mission-result.${learner2.result.global}`)))
        .exists();
    });

    test('should display all steps done', async (assert) => {
      const learner1 = store.createRecord('mission-learner', {
        id: 1,
        firstName: 'Jeanne',
        lastName: 'Micheline',
        division: 'CM1',
        organizationId: 1,
        result: {
          global: 'reached',
          steps: ['reached', 'not-reached', 'partially-reached'],
        },
      });

      const missionLearners = [learner1];
      const mission = {
        id: 1,
        name: 'Super Mission',
        content: {
          steps: [
            {
              name: 'step one',
            },
            {
              name: 'stepo dose',
            },
            {
              name: 'step three',
            },
            {
              name: 'step quatro',
            },
          ],
        },
      };

      const screen = await render(
        <template><ResultTable @missionLearners={{missionLearners}} @mission={{mission}} /></template>,
      );

      const row = screen.getByRole('row', { name: t('pages.missions.mission.tabs.result.aria-label') });

      const generalInfoColQuantity = 3;
      const globalResultColQuantity = 1;
      const stepsResultColQuantity = 4;
      const dareResultColQuantity = 1;
      const allColQuantity =
        generalInfoColQuantity + globalResultColQuantity + stepsResultColQuantity + dareResultColQuantity;
      assert.strictEqual(row.cells.length, allColQuantity);

      const resultStepOneIndex = 3;
      assert.strictEqual(
        row.cells[resultStepOneIndex].innerHTML,
        t('pages.missions.mission.table.result.step-result.reached'),
      );

      const resultStepoDoseIndex = 4;
      assert.strictEqual(
        row.cells[resultStepoDoseIndex].innerHTML,
        t('pages.missions.mission.table.result.step-result.not-reached'),
      );

      const resultStepThreeIndex = 5;
      assert.strictEqual(
        row.cells[resultStepThreeIndex].innerHTML,
        t('pages.missions.mission.table.result.step-result.partially-reached'),
      );

      const resultStepFourIndex = 6;
      assert.strictEqual(
        row.cells[resultStepFourIndex].innerHTML,
        t('pages.missions.mission.table.result.step-result.undefined'),
      );
    });
  });

  test('when there is no learners it should display a empty state message', async (assert) => {
    const missionLearners = [];
    const mission = {
      id: 1,
      name: 'Super Mission',
    };
    const screen = await render(
      <template><ResultTable @missionLearners={{missionLearners}} @mission={{mission}} /></template>,
    );

    assert.dom(screen.getByText(t('pages.missions.mission.table.result.no-data'))).exists();
  });
});
