import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';
import EmberService from '@ember/service';
import sinon from 'sinon';

describe('Unit | Route | Assessments | Challenge', function () {
  setupTest();

  let route;
  let storeStub;
  let createRecordStub;
  let queryRecordStub;
  let findRecordStub;
  let currentUserStub;

  const params = {
    challenge_id: 'challenge_id',
  };

  const assessment = {
    id: 'assessment_id',
    get: sinon.stub().callsFake(() => 'ASSESSMENT_TYPE'),
    type: 'PLACEMENT',
    answers: [],
  };

  const model = {
    assessment,
    challenge: {
      id: 'challenge_id',
    },
  };

  beforeEach(function () {
    createRecordStub = sinon.stub();
    queryRecordStub = sinon.stub().resolves(model.challenge);
    findRecordStub = sinon.stub();
    storeStub = EmberService.create({
      createRecord: createRecordStub,
      queryRecord: queryRecordStub,
      findRecord: findRecordStub,
    });

    route = this.owner.lookup('route:assessments.challenge');
    currentUserStub = { user: { firstName: 'John', lastname: 'Doe' } };
    route.currentUser = currentUserStub;
    route.store = storeStub;
    route.router = { transitionTo: sinon.stub() };
    route.modelFor = sinon.stub().returns(assessment);
  });

  describe('#model', function () {
    it('should correctly call the store to find assessment and challenge', async function () {
      // when
      await route.model(params);

      // then
      sinon.assert.calledWith(route.modelFor, 'assessments');
      sinon.assert.calledWith(queryRecordStub, 'challenge', { assessmentId: assessment.id });
    });
    it('should call queryRecord to find answer', async function () {
      // given
      model.assessment.get.withArgs('isCertification').returns(false);
      model.assessment.get.withArgs('course').returns({ getProgress: sinon.stub().returns('course') });

      // when
      await route.model(params);

      // then
      sinon.assert.calledWith(queryRecordStub, 'answer', {
        assessmentId: assessment.id,
        challengeId: model.challenge.id,
      });
    });
    context('when the assessment is a Preview', async function () {
      beforeEach(function () {
        const assessmentForPreview = {
          answers: [],
          type: 'PREVIEW',
          isPreview: true,
        };
        route.modelFor.returns(assessmentForPreview);
      });

      it('should call findRecord to find the asked challenge', async function () {
        // given
        const params = {
          challengeId: 'recId',
          challenge_number: 0,
        };
        storeStub.findRecord.resolves({ id: 'recId' });

        // when
        await route.model(params);

        // then
        sinon.assert.calledWith(findRecordStub, 'challenge', 'recId');
      });

      it('should not call for next challenge', async function () {
        // given
        const params = {
          challengeId: null,
          challenge_number: 0,
        };

        // when
        await route.model(params);

        // then
        sinon.assert.notCalled(findRecordStub);
      });
    });

    context('when the asked challenges is already answered', async function () {
      beforeEach(function () {
        const assessmentWithAnswers = {
          answers: [
            {
              id: 3,
              challenge: {
                id: 'oldRecId',
                get: () => 'oldRecId',
              },
            },
          ],
          type: 'COMPETENCE',
        };
        route.modelFor.returns(assessmentWithAnswers);
        storeStub.findRecord.resolves({ id: 'recId' });
      });

      it('should call findRecord to find the asked challenge', async function () {
        // given
        const params = {
          challengeId: 'recId',
          challenge_number: 0,
        };

        // when
        await route.model(params);

        // then
        sinon.assert.calledWith(findRecordStub, 'challenge', 'oldRecId');
      });
    });
  });
});
