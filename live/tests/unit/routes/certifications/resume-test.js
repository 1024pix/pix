import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';
import sinon from 'sinon';
import Ember from 'ember';

describe('Unit | Route | Certification | resume', function() {
  setupTest('route:certifications.resume', {
    needs: ['service:current-routed-modal']
  });

  let route;
  let StoreStub;
  let findRecordStub;
  let queryRecordStub;
  const certificationCourseId = 'certification_course_id';
  const assessmentId = 'assessment_id';

  beforeEach(function() {
    // define stubs
    findRecordStub = sinon.stub();
    queryRecordStub = sinon.stub();
    StoreStub = Ember.Service.extend({
      findRecord: findRecordStub,
      queryRecord: queryRecordStub
    });

    // manage dependency injection context
    this.register('service:store', StoreStub);
    this.inject.service('store', { as: 'store' });

    // instance route object
    route = this.subject();
    route.transitionTo = sinon.stub();
  });

  describe('#model', function() {

    it('should fetch a certification', function() {
      // given
      const params = { certification_course_id: certificationCourseId };
      route.get('store').findRecord.resolves();

      // when
      const promise = route.model(params);

      // then
      return promise.then(() => {
        sinon.assert.calledOnce(findRecordStub);
        sinon.assert.calledWith(findRecordStub, 'certification-course', certificationCourseId);
      });
    });
  });

  describe('#afterModel', function() {

    const assessment = Ember.Object.create({ id: assessmentId });
    const certification = Ember.Object.create({ id: certificationCourseId, assessment: assessment });

    it('should get the next challenge of the assessment', function() {
      // given
      queryRecordStub.resolves();

      // when
      const promise = route.afterModel(certification);

      // then
      return promise.then(() => {
        sinon.assert.calledOnce(queryRecordStub);
        sinon.assert.calledWith(queryRecordStub, 'challenge', { assessmentId: assessmentId });
      });
    });

    context('when the next challenge exists', function() {

      it('should redirect to the challenge view', function() {
        // given
        const nextChallenge = Ember.Object.create({ id: 456 });
        queryRecordStub.resolves(nextChallenge);

        // when
        const promise = route.afterModel(certification);

        // then
        return promise.then(() => {
          sinon.assert.calledOnce(route.transitionTo);
          sinon.assert.calledWith(route.transitionTo, 'assessments.challenge', assessmentId, 456);
        });
      });

    });

    context('when the next challenge does not exist (is null)', function() {

      it('should redirect to certification results page', function() {
        // given
        queryRecordStub.rejects();

        // when
        const promise = route.afterModel(certification);

        // then
        return promise.then(() => {
          sinon.assert.calledOnce(route.transitionTo);
          sinon.assert.calledWith(route.transitionTo, 'certifications.results', certificationCourseId);
        });
      });

    });
  });

  describe('#error', function() {

    it('should redirect to index page', function() {
      // given
      const route = this.subject();
      route.transitionTo = sinon.spy();

      // when
      route.send('error');

      // then
      sinon.assert.calledWith(route.transitionTo, 'index');
    });
  });

});
