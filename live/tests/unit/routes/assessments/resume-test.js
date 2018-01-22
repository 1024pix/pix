import EmberObject from '@ember/object';
import Service from '@ember/service';
import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';
import sinon from 'sinon';

describe('Unit | Route | resume', function() {
  setupTest('route:assessments.resume', {
    needs: ['service:current-routed-modal']
  });

  let route;
  let StoreStub;
  let findRecordStub;
  let queryRecordStub;

  beforeEach(function() {
    // define stubs
    findRecordStub = sinon.stub();
    queryRecordStub = sinon.stub();
    StoreStub = Service.extend({
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

  it('exists', function() {
    const route = this.subject();
    expect(route).to.be.ok;
  });

  describe('#model', function() {

    it('should fetch an assessment', function() {
      // given
      const params = { assessment_id: 123 };
      route.get('store').findRecord.resolves();

      // when
      const promise = route.model(params);

      // then
      return promise.then(() => {
        sinon.assert.calledOnce(findRecordStub);
        sinon.assert.calledWith(findRecordStub, 'assessment', 123);
      });
    });
  });

  describe('#afterModel', function() {

    const assessment = EmberObject.create({ id: 123 });

    it('should get the next challenge of the assessment', function() {
      // given
      queryRecordStub.resolves();

      // when
      const promise = route.afterModel(assessment);

      // then
      return promise.then(() => {
        sinon.assert.calledOnce(queryRecordStub);
        sinon.assert.calledWith(queryRecordStub, 'challenge', { assessmentId: 123 });
      });
    });

    context('when the next challenge exists', function() {

      it('should redirect to the challenge view', function() {
        // given
        const nextChallenge = EmberObject.create({ id: 456 });
        queryRecordStub.resolves(nextChallenge);

        // when
        const promise = route.afterModel(assessment);

        // then
        return promise.then(() => {
          sinon.assert.calledOnce(route.transitionTo);
          sinon.assert.calledWith(route.transitionTo, 'assessments.challenge', 123, 456);
        });
      });

    });

    context('when the next challenge does not exist (is null)', function() {

      it('should redirect to assessment results page', function() {
        // given
        queryRecordStub.rejects();

        // when
        const promise = route.afterModel(assessment);

        // then
        return promise.then(() => {
          sinon.assert.calledOnce(route.transitionTo);
          sinon.assert.calledWith(route.transitionTo, 'assessments.results', 123);
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
