import EmberObject from '@ember/object';
import Service from '@ember/service';
import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Unit | Route | Courses | Start', function (hooks) {
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
    route = this.owner.lookup('route:courses.start');
    route.set('store', storeStub);
    route.router = { replaceWith: sinon.stub() };
  });

  module('#redirect', function () {
    test('should call the creation of a new assessment', async function (assert) {
      // when
      await route.redirect(course);

      // then
      sinon.assert.calledWith(createRecordStub, 'assessment', { course, type: course.type });
      assert.ok(true);
    });

    test('should redirect to resume assessment route', async function (assert) {
      // when
      await route.redirect(course);

      // then
      sinon.assert.calledWith(route.router.replaceWith, 'assessments.resume', createdAssessment.id);
      assert.ok(true);
    });
  });
});
