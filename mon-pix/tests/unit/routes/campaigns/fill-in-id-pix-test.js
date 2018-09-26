import EmberObject from '@ember/object';
import { A } from '@ember/array';
import Service from '@ember/service';
import { describe, it, beforeEach } from 'mocha';
import { setupTest } from 'ember-mocha';
import sinon from 'sinon';

describe('Unit | Route | campaigns/fill-in-id-pix', function() {

  setupTest('route:campaigns/fill-in-id-pix', {
    needs: ['service:session', 'service:current-routed-modal']
  });

  let route;
  let storeStub;
  let createAssessementStub;
  let queryChallengeStub;
  let queryStub;
  let savedAssessment;

  beforeEach(function() {
    createAssessementStub = sinon.stub();
    queryChallengeStub = sinon.stub();
    queryStub = sinon.stub();
    storeStub = Service.extend({
      queryRecord: queryChallengeStub, query: queryStub, createRecord: createAssessementStub });
    this.register('service:store', storeStub);
    this.inject.service('store', { as: 'store' });
    savedAssessment = EmberObject.create({ id: 1234, codeCampaign: 'CODECAMPAIGN', reload: sinon.stub() });
    route = this.subject();
  });

  describe('#model', function() {

    const campaignCode = 'CODECAMPAIGN';

    beforeEach(function() {
    });

    it('should retrieve campaign with given campaign code', function() {
      // given
      const params = {
        campaign_code: campaignCode
      };

      const campaigns = A([EmberObject.create({ code: campaignCode })]);
      queryStub.resolves(campaigns);

      // when
      const promise = route.model(params);

      // then
      return promise.then(() => {
        sinon.assert.calledWith(queryStub, 'campaign', { filter: { code: campaignCode } });
      });
    });

    it('should redirect to campaign when id pix is not required', function() {
      // given
      const params = {
        campaign_code: campaignCode
      };
      const campaigns = A([EmberObject.create({ code: campaignCode })]);
      queryStub.resolves(campaigns);
      route.transitionTo = sinon.stub();

      // when
      const promise = route.model(params);

      // then
      return promise.then(() => {
        sinon.assert.calledWith(route.transitionTo, 'assessments.challenge');
      });
    });

    it('should not redirect to campaign when id pix is not required', function() {
      // given
      const params = {
        campaign_code: campaignCode
      };
      const campaigns = A([EmberObject.create({ code: campaignCode, idPixLabel: 'email' })]);
      queryStub.resolves(campaigns);
      route.transitionTo = sinon.stub();

      // when
      const promise = route.model(params);

      // then
      return promise.then(() => {
        sinon.assert.notCalled(route.transitionTo);
      });
    });
  });

  describe('#start', function() {

    const campaignCode = 'CODECAMPAIGN';
    const participantExternalId = 'Identifiant professionnel';

    beforeEach(function() {
      savedAssessment.reload.resolves();
      route.transitionTo = sinon.stub();
    });

    it('should retrieve assement with type "SMART_PLACEMENT" and given campaign code', function() {
      // given
      const assessments = A([savedAssessment]);
      queryStub.resolves(assessments);
      queryChallengeStub.resolves();

      // when
      const promise = route.start(campaignCode, participantExternalId);

      // then
      return promise.then(() => {
        sinon.assert.calledWith(queryStub, 'assessment', { filter: { type: 'SMART_PLACEMENT', codeCampaign: campaignCode } });
      });
    });

    it('should create new assessment if nothing found', function() {
      // given
      const assessments = A([]);
      queryStub.resolves(assessments);
      createAssessementStub.returns({ save: () => savedAssessment });
      queryChallengeStub.resolves();

      // when
      const promise = route.start(campaignCode, participantExternalId);

      // then
      return promise.then(() => {
        sinon.assert.calledWith(createAssessementStub, 'assessment', { type: 'SMART_PLACEMENT', codeCampaign: campaignCode, participantExternalId });
      });
    });

    it('should retrieve challenge with given assessment id', function() {
      // given
      const assessments = A([savedAssessment]);
      queryStub.resolves(assessments);
      queryChallengeStub.resolves();

      // when
      const promise = route.start(campaignCode, participantExternalId);

      // then
      return promise.then(() => {
        sinon.assert.calledWith(queryChallengeStub, 'challenge', { assessmentId: savedAssessment.get('id') });
      });
    });

    it('should redirect to next challenge if one was found', function() {
      // given
      const assessments = A([savedAssessment]);
      queryStub.resolves(assessments);
      queryChallengeStub.resolves();

      // when
      const promise = route.start(campaignCode, participantExternalId);

      // then
      return promise.then(() => {
        sinon.assert.calledWith(route.transitionTo, 'assessments.challenge');
      });
    });
  });
});
