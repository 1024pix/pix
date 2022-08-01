import EmberObject from '@ember/object';
import Service from '@ember/service';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import sinon from 'sinon';

module('Unit | Route | Courses | Create Assessment', function (hooks) {
  setupTest(hooks);

  let route;
  let createRecordStub;
  let storeStub;
  let course;
  let createdAssessment;

  hooks.beforeEach(function () {
    course = EmberObject.create({ id: 1, type: 'DEMO' });
    createdAssessment = EmberObject.create({ id: 1234 });
    createRecordStub = sinon.stub().returns({
      save: sinon.stub().resolves(createdAssessment),
    });
    storeStub = Service.create({ createRecord: createRecordStub });
    route = this.owner.lookup('route:courses.create-assessment');
    route.set('store', storeStub);
    route.router = { replaceWith: sinon.stub() };
  });

  module('#afterModel', function () {
    test('should call the creation of a new assessment', async function (assert) {
      // when
      await route.afterModel(course);

      // then
      assert.expect(0);
      sinon.assert.calledWith(createRecordStub, 'assessment', { course, type: course.type });
    });

    test('should redirect to resume assessment route', async function (assert) {
      // when
      await route.afterModel(course);

      // then
      assert.expect(0);
      sinon.assert.calledWith(route.router.replaceWith, 'assessments.resume', createdAssessment.id);
    });
  });
});
