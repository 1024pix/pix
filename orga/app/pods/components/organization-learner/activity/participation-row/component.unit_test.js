import { module, test } from 'qunit';
import createGlimmerComponent from '../../../../../helpers/tests/create-glimmer-component';
import { setupTest } from 'ember-qunit';

module('Unit | Component | OrganizationLearner | Activity::ParticipationRow', function (hooks) {
  setupTest(hooks);

  test('should return route to assessment participation detail', async function (assert) {
    // given
    const component = await createGlimmerComponent('component:organization-learner/activity/participation-row');
    component.args.participation = {
      campaignType: 'ASSESSMENT',
    };
    // when
    const route = component.routeName;

    // then
    assert.strictEqual(route, 'authenticated.campaigns.participant-assessment');
  });

  test('should return route to profile collection participation detail', async function (assert) {
    // given
    const component = await createGlimmerComponent('component:organization-learner/activity/participation-row');
    component.args.participation = {
      campaignType: 'PROFILE_COLLECTION',
    };
    // when
    const route = component.routeName;

    // then
    assert.strictEqual(route, 'authenticated.campaigns.participant-profile');
  });
});
