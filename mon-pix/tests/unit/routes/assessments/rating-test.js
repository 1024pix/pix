import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';
import EmberObject from '@ember/object';
import EmberService from '@ember/service';
import sinon from 'sinon';

describe('Unit | Route | assessments.rating', function() {
  setupTest('route:assessments.rating', {
    needs: ['service:current-routed-modal'],
  });

  it('exists', function() {
    const route = this.subject();
    expect(route).to.be.ok;
  });

  let route;
  let StoreStub;
  let createRecordStub;
  const assessmentRating = EmberObject.create({});

  beforeEach(function() {
    // define stubs
    assessmentRating.save = sinon.stub().resolves();

    createRecordStub = sinon.stub().returns(assessmentRating);
    StoreStub = EmberService.extend({
      createRecord: createRecordStub,
    });

    // manage dependency injection context
    this.register('service:store', StoreStub);
    this.inject.service('store', { as: 'store' });

    // instance route object
    route = this.subject();
    route.replaceWith = sinon.stub();
  });

  describe('#afterModel', function() {

    const challengeOne = EmberObject.create({ id: 'recChallengeOne' });
    const answerToChallengeOne = EmberObject.create({ challenge: challengeOne });

    context('when the assessment is a certification', function() {
      it('should redirect to the certification end page', function() {
        // given
        const assessment = EmberObject.create({ id: 12, type: 'CERTIFICATION', answers: [answerToChallengeOne] });

        // when
        const promise = route.afterModel(assessment);

        // then
        return promise.then(() => {
          return sinon.assert.calledWith(route.replaceWith, 'certifications.results');
        });
      });
    });

    context('when the assessment is a SMART_PLACEMENT', function() {
      it('should redirect to the certification end page', function() {
        // given
        const assessmentId = 12;
        const assessment = EmberObject.create({ id: assessmentId, type: 'SMART_PLACEMENT', answers: [answerToChallengeOne] });

        // when
        const promise = route.afterModel(assessment);

        // then
        return promise.then(() => {
          return sinon.assert.calledWith(route.replaceWith, 'assessments.checkpoint', assessmentId, {
            queryParams: { finalCheckpoint: true }
          });
        });
      });
    });

    context('when the assessment is not certification', function() {
      it('should redirect to the assessment results page', function() {
        // given
        const assessment = EmberObject.create({ answers: [answerToChallengeOne] });

        // when
        const promise = route.afterModel(assessment);

        // then
        return promise.then(() => sinon.assert.calledWith(route.replaceWith, 'assessments.results', assessment.get('id')));
      });
    });

    it('should trigger an assessment rating by creating a model and saving it', function() {
      // given
      const assessment = EmberObject.create({ answers: [] });

      // when
      route.afterModel(assessment);

      // then
      sinon.assert.calledWith(createRecordStub, 'assessment-result', { assessment });
      sinon.assert.called(assessmentRating.save);
    });
  });
});
