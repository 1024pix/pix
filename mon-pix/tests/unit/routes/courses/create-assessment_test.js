import EmberObject from '@ember/object';
import Service from '@ember/service';
import { describe, it, beforeEach } from 'mocha';
import { setupTest } from 'ember-mocha';
import sinon from 'sinon';

describe('Unit | Route | Courses | Create Assessment', function() {
  setupTest();

  let route;
  let createRecordStub;
  let storeStub;
  let course;
  let createdAssessment;

  beforeEach(function() {
    course = EmberObject.create({ id: 1, type: 'DEMO' });
    createdAssessment = EmberObject.create({ id: 1234 });
    createRecordStub = sinon.stub().returns({
      save: sinon.stub().resolves(createdAssessment),
    });
    storeStub = Service.create({ createRecord: createRecordStub });
    route = this.owner.lookup('route:courses.create-assessment');
    route.set('store', storeStub);
    route.replaceWith = sinon.stub();
  });

  describe('#afterModel', function() {
    it('should call the creation of a new assessment', async function() {
      // when
      await route.afterModel(course);

      // then
      sinon.assert.calledWith(createRecordStub, 'assessment', { course, type: course.type });
    });

    it('should redirect to resume assessment route', async function() {
      // when
      await route.afterModel(course);

      // then
      sinon.assert.calledWith(route.replaceWith, 'assessments.resume', createdAssessment.id);
    });
  });
});
