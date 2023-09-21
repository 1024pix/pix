import { module, test } from 'qunit';
import { setupTest } from '../../helpers/index';
import sinon from 'sinon';

module('Unit | Route | MissionResumeRoute', function (hooks) {
  setupTest(hooks);

  module('#model', function () {
    test('should call queryRecord method', async function (assert) {
      const route = this.owner.lookup('route:missions.mission.resume');
      const store = this.owner.lookup('service:store');
      const missionId = 23;
      const transition = { to: { parent: { params: { mission_id: missionId } } } };
      sinon.stub(store, 'queryRecord');

      route.model({}, transition);

      assert.ok(store.queryRecord.calledWith('assessment', { missionId }));
    });
  });

  module('#afterModel', function () {
    test('should redirect to assessment resume route', async function (assert) {
      const route = this.owner.lookup('route:missions.mission.resume');
      const assessment = Symbol('assessment');
      sinon.stub(route.router, 'replaceWith');

      route.afterModel(assessment);

      assert.ok(route.router.replaceWith.calledWith('assessment.challenge', assessment));
    });
  });
});
