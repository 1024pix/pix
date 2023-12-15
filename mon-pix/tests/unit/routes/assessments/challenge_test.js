import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import EmberService from '@ember/service';
import sinon from 'sinon';

module('Unit | Route | Assessments | Challenge', function (hooks) {
  setupTest(hooks);

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

  hooks.beforeEach(function () {
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

  module('#model', function () {
    test('should correctly call the store to find assessment and challenge', async function (assert) {
      // when
      await route.model(params);

      // then
      sinon.assert.calledWith(route.modelFor, 'assessments');
      sinon.assert.calledWith(queryRecordStub, 'challenge', { assessmentId: assessment.id });
      assert.ok(true);
    });
    test('should call queryRecord to find answer', async function (assert) {
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
      assert.ok(true);
    });

    module('when the assessment is a Preview', function (hooks) {
      hooks.beforeEach(function () {
        const assessmentForPreview = {
          answers: [],
          type: 'PREVIEW',
          isPreview: true,
        };
        route.modelFor.returns(assessmentForPreview);
      });

      test('should call findRecord to find the asked challenge', async function (assert) {
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
        assert.ok(true);
      });

      test('should not call for next challenge', async function (assert) {
        // given
        const params = {
          challengeId: null,
          challenge_number: 0,
        };

        // when
        await route.model(params);

        // then
        sinon.assert.notCalled(findRecordStub);
        assert.ok(true);
      });
    });

    module('when the asked challenges is already answered', function (hooks) {
      let answer;

      hooks.beforeEach(function () {
        answer = {
          id: 3,
          challenge: {
            id: 'oldRecId',
            get: () => 'oldRecId',
          },
        };
        const assessmentWithAnswers = {
          answers: [answer],
          type: 'COMPETENCE',
        };
        route.modelFor.returns(assessmentWithAnswers);
      });

      test('should use challenge from answer', async function (assert) {
        // given
        const params = {
          challengeId: 'recId',
          challenge_number: 0,
        };

        // when
        const model = await route.model(params);

        // then
        assert.strictEqual(model.challenge, answer.challenge);
      });
    });
  });
});
