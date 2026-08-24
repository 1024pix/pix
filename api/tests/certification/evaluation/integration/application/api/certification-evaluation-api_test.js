import sinon from 'sinon';

import * as certificationEvaluationApi from '../../../../../../src/certification/evaluation/application/api/certification-evaluation-api.js';
import { NextChallengeAlreadyComputingError } from '../../../../../../src/certification/evaluation/domain/errors.js';
import { usecases } from '../../../../../../src/certification/evaluation/domain/usecases/index.js';
import { executeInContext } from '../../../../../../src/shared/infrastructure/execution-context-manager.js';
import { expect } from '../../../../../test-helper.js';
import { databaseBuilder } from '../../../../../tooling/databases.js';
import { catchErr } from '../../../../../tooling/test-utils/error.js';
import { wait } from '../../../../../tooling/test-utils/wait.js';

describe('Integration | Application | Certification | Evaluation | API', function () {
  describe('#selectNextCertificationChallenge', function () {
    const execContext1 = { default_request_id: 'requete123' };
    const execContext2 = { default_request_id: 'requete456' };
    const execContext3 = { default_request_id: 'requete789' };
    let getNextChallengeStub;

    beforeEach(function () {
      getNextChallengeStub = sinon.stub(usecases, 'getNextChallenge');
    });

    it('allows multiple parallel calls on different assessments', async function () {
      // given
      getNextChallengeStub.withArgs({ assessmentId: 123 }).callsFake(async () => {
        await wait(100);
        return 'challenge123';
      });
      getNextChallengeStub.withArgs({ assessmentId: 456 }).callsFake(async () => {
        await wait(100);
        return 'challenge456';
      });
      getNextChallengeStub.withArgs({ assessmentId: 789 }).callsFake(async () => {
        await wait(100);
        return 'challenge789';
      });

      // when
      const selectNextCertificationChallengeFnc1 = () =>
        certificationEvaluationApi.selectNextCertificationChallenge({
          assessmentId: 123,
        });
      const selectNextCertificationChallengeFnc2 = () =>
        certificationEvaluationApi.selectNextCertificationChallenge({
          assessmentId: 456,
        });
      const selectNextCertificationChallengeFnc3 = () =>
        certificationEvaluationApi.selectNextCertificationChallenge({
          assessmentId: 789,
        });

      const results = await Promise.all([
        executeInContext(execContext1, selectNextCertificationChallengeFnc1),
        executeInContext(execContext2, selectNextCertificationChallengeFnc2),
        executeInContext(execContext3, selectNextCertificationChallengeFnc3),
      ]);

      // then
      expect(results[0]).to.equal('challenge123');
      expect(results[1]).to.equal('challenge456');
      expect(results[2]).to.equal('challenge789');
    });

    context('when no next challenge computing is ongoing and usecase called successfully', function () {
      it('returns the challenge id', async function () {
        // given
        getNextChallengeStub.withArgs({ assessmentId: 123 }).resolves('challenge123');

        // when
        const selectNextCertificationChallengeFnc = () =>
          certificationEvaluationApi.selectNextCertificationChallenge({
            assessmentId: 123,
          });
        const nextChallengeId = await executeInContext(execContext1, selectNextCertificationChallengeFnc);

        // then
        expect(nextChallengeId).to.equal('challenge123');
      });

      it('allows multiple successive calls on the same assessment', async function () {
        // given
        getNextChallengeStub.withArgs({ assessmentId: 123 }).onFirstCall().resolves('challenge123_A');
        getNextChallengeStub.withArgs({ assessmentId: 123 }).onSecondCall().resolves('challenge123_B');

        // when
        const selectNextCertificationChallengeFnc1 = () =>
          certificationEvaluationApi.selectNextCertificationChallenge({
            assessmentId: 123,
          });
        const nextChallengeId1 = await executeInContext(execContext1, selectNextCertificationChallengeFnc1);
        const selectNextCertificationChallengeFnc2 = () =>
          certificationEvaluationApi.selectNextCertificationChallenge({
            assessmentId: 123,
          });
        const nextChallengeId2 = await executeInContext(execContext1, selectNextCertificationChallengeFnc2);

        // then
        expect(nextChallengeId1).to.equal('challenge123_A');
        expect(nextChallengeId2).to.equal('challenge123_B');
      });
    });

    context('when no next challenge computing is ongoing but usecase throws', function () {
      it('allows successive calls', async function () {
        // given
        getNextChallengeStub.withArgs({ assessmentId: 123 }).onFirstCall().rejects(new Error('error first call'));
        getNextChallengeStub.withArgs({ assessmentId: 123 }).onSecondCall().resolves('challenge123_B');

        // when
        const selectNextCertificationChallengeFnc1 = () =>
          certificationEvaluationApi.selectNextCertificationChallenge({
            assessmentId: 123,
          });
        const err = await catchErr(executeInContext)(execContext1, selectNextCertificationChallengeFnc1);
        const selectNextCertificationChallengeFnc2 = () =>
          certificationEvaluationApi.selectNextCertificationChallenge({
            assessmentId: 123,
          });
        const nextChallengeId2 = await executeInContext(execContext1, selectNextCertificationChallengeFnc2);

        // then
        expect(err).to.deepEqualInstance(new Error('error first call'));
        expect(nextChallengeId2).to.equal('challenge123_B');
      });
    });

    context('when a next challenge computing is ongoing', function () {
      it('throws a NextChallengeAlreadyComputingError', async function () {
        // given
        getNextChallengeStub.withArgs({ assessmentId: 123 }).callsFake(async () => {
          await wait(100);
          return 'challenge123';
        });

        // when
        const selectNextCertificationChallengeFnc = () =>
          certificationEvaluationApi.selectNextCertificationChallenge({
            assessmentId: 123,
          });
        const firstRequestPromise = executeInContext(execContext1, selectNextCertificationChallengeFnc);
        const secondRequestPromise = catchErr(executeInContext)(execContext2, selectNextCertificationChallengeFnc);
        const [result1, result2] = await Promise.all([firstRequestPromise, secondRequestPromise]);

        // then
        expect(result1).to.equal('challenge123');
        expect(result2).to.deepEqualInstance(new NextChallengeAlreadyComputingError());
      });
    });
  });

  describe('#getAssessmentLiveAlerts', function () {
    it('returns the challenge and companion live alerts of the given assessment only', async function () {
      // given
      const assessmentId = databaseBuilder.factory.buildAssessment().id;
      const otherAssessmentId = databaseBuilder.factory.buildAssessment().id;
      const challengeLiveAlert = databaseBuilder.factory.buildCertificationChallengeLiveAlert({ assessmentId });
      const companionLiveAlert = databaseBuilder.factory.buildCertificationCompanionLiveAlert({ assessmentId });
      databaseBuilder.factory.buildCertificationChallengeLiveAlert({ assessmentId: otherAssessmentId });
      databaseBuilder.factory.buildCertificationCompanionLiveAlert({ assessmentId: otherAssessmentId });
      await databaseBuilder.commit();

      // when
      const { challengeLiveAlerts, companionLiveAlerts } = await certificationEvaluationApi.getAssessmentLiveAlerts({
        assessmentId,
      });

      // then
      expect(challengeLiveAlerts).to.have.lengthOf(1);
      expect(challengeLiveAlerts[0].id).to.equal(challengeLiveAlert.id);
      expect(companionLiveAlerts).to.have.lengthOf(1);
      expect(companionLiveAlerts[0].id).to.equal(companionLiveAlert.id);
    });
  });
});
