import { visit, within } from '@1024pix/ember-testing-library';
import { click } from '@ember/test-helpers';
import { currentURL } from '@ember/test-helpers';
import { module, test } from 'qunit';

import { setupApplicationTest, t } from '../helpers';
import identifyLearner from '../helpers/identify-learner';

module('Acceptance | Display missions list', function (hooks) {
  setupApplicationTest(hooks);
  test('displays all the available missions with their corresponding status', async function (assert) {
    this.server.create('mission', { id: '1', name: 'mission_1' });
    this.server.create('mission', { id: '2', name: 'mission_2' });
    this.server.create('mission', { id: '3', name: 'mission_3' });
    const learner = this.server.create('organization-learner', {
      name: 'learner',
      completedMissionIds: ['2'],
      startedMissionIds: ['1'],
    });
    identifyLearner(this.owner, { id: learner.id });

    // when
    const screen = await visit('/');

    // then
    //In progress mission card
    assert
      .dom(
        within(screen.getByText('mission_1').parentElement.parentElement.parentElement).getByText(
          t('pages.missions.list.status.started.label'),
        ),
      )
      .exists();
    assert
      .dom(
        within(screen.getByText('mission_1').parentElement.parentElement).getByText(
          t('pages.missions.list.status.started.button-label'),
        ),
      )
      .exists();

    //Completed mission card
    assert
      .dom(
        within(screen.getByText('mission_2').parentElement.parentElement).getByText(
          t('pages.missions.list.status.completed.label'),
        ),
      )
      .exists();

    //to start mission card
    assert
      .dom(
        within(screen.getByText('mission_3').parentElement.parentElement.parentElement).getByText(
          t('pages.missions.list.status.to-start.label'),
        ),
      )
      .exists();
    assert
      .dom(
        within(screen.getByText('mission_3').parentElement.parentElement).getByText(
          t('pages.missions.list.status.to-start.button-label'),
        ),
      )
      .exists();
  });
  test('redirect to the challenge when user has already started the mission', async function (assert) {
    this.server.create('mission', { id: '1', name: 'started_mission' });
    this.server.create('mission', { id: '2', name: 'to_start_mission' });
    this.server.create('challenge', { id: '1' });
    const learner = this.server.create('organization-learner', {
      name: 'learner',
      startedMissionIds: ['1'],
    });
    identifyLearner(this.owner, { id: learner.id });

    // when
    const screen = await visit('/');
    await click(screen.getByText('started_mission'));

    // then
    assert.strictEqual(currentURL(), '/assessments/1/challenges');
  });

  test('redirect to mission detail page when the user starts the mission', async function (assert) {
    this.server.create('mission', { id: '1', name: 'started_mission' });
    this.server.create('mission', { id: '2', name: 'to_start_mission' });

    const learner = this.server.create('organization-learner', {
      name: 'learner',
      startedMissionIds: ['1'],
    });
    identifyLearner(this.owner, { id: learner.id });

    // when
    const screen = await visit('/');
    await click(screen.getByText('to_start_mission'));

    // then
    assert.strictEqual(currentURL(), '/missions/2');
  });
});
