import EmberObject from '@ember/object';
import { A } from '@ember/array';
import Service from '@ember/service';
import { describe, it, beforeEach } from 'mocha';
import { setupTest } from 'ember-mocha';
import sinon from 'sinon';

describe('Unit | Route | campaigns/start-or-resume/fill-in-id-pix', function() {

  setupTest('route:campaigns/start-or-resume/fill-in-id-pix', {
    needs: ['service:session', 'service:current-routed-modal']
  });

  let route;
  let storeStub;
  let createAssessementStub;
  let queryChallengeStub;
  let queryAssessementsStub;

  beforeEach(function() {
    queryAssessementsStub = sinon.stub();
    createAssessementStub = sinon.stub();
    queryChallengeStub = sinon.stub();
    storeStub = Service.extend({ queryRecord: queryChallengeStub, query: queryAssessementsStub, createRecord: createAssessementStub });
    this.register('service:store', storeStub);
    this.inject.service('store', { as: 'store' });
    route = this.subject();
  });

  describe('#afterModel', function() {

    const savedAssessment = EmberObject.create({ id: 1234, codeCampaign: campaignCode });
    const campaignCode = 'CODECAMPAIGN';

    beforeEach(function() {
      route.transitionTo = sinon.stub();
    });

    it('should retrieve assement with type "SMART_PLACEMENT" and given campaign code', function() {
      // given
      const assessments = A([savedAssessment]);
      queryAssessementsStub.resolves(assessments);
      queryChallengeStub.resolves();

      // when
      const promise = route.afterModel(campaignCode);

      // then
      return promise.then(() => {
        sinon.assert.calledWith(queryAssessementsStub, 'assessment', { filter: { type: 'SMART_PLACEMENT', codeCampaign: campaignCode } });
      });
    });

    it('should create new assessment if nothing found', function() {
      // given
      const assessments = A([]);
      queryAssessementsStub.resolves(assessments);
      createAssessementStub.returns({ save: () => savedAssessment });
      queryChallengeStub.resolves();

      // when
      const promise = route.afterModel(campaignCode);

      // then
      return promise.then(() => {
        sinon.assert.calledWith(createAssessementStub, 'assessment', { type: 'SMART_PLACEMENT', codeCampaign: campaignCode });
      });
    });

    it('should retrieve challenge with given assessment id', function() {
      // given
      const assessments = A([savedAssessment]);
      queryAssessementsStub.resolves(assessments);
      queryChallengeStub.resolves();

      // when
      const promise = route.afterModel(campaignCode);

      // then
      return promise.then(() => {
        sinon.assert.calledWith(queryChallengeStub, 'challenge', { assessmentId: savedAssessment.get('id') });
      });
    });

    it('should redirect to next challenge if one was found', function() {
      // given
      const assessments = A([savedAssessment]);
      queryAssessementsStub.resolves(assessments);
      queryChallengeStub.resolves();

      // when
      const promise = route.afterModel(campaignCode);

      // then
      return promise.then(() => {
        sinon.assert.calledWith(route.transitionTo, 'assessments.challenge');
      });
    });

    it('should redirect to assessment rating if no next challenge was found', function() {
      // given
      const assessments = A([savedAssessment]);
      queryAssessementsStub.resolves(assessments);
      queryChallengeStub.rejects();

      // when
      const promise = route.afterModel(campaignCode);

      // then
      return promise.then(() => {
        sinon.assert.calledWith(route.transitionTo, 'assessments.rating');
      });
    });
  });
});
