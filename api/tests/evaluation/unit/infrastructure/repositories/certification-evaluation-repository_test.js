import sinon from 'sinon';

import * as certificationEvaluationRepository from '../../../../../src/evaluation/infrastructure/repositories/certification-evaluation-repository.js';
import { expect } from '../../../../test-helper.js';

describe('Unit | Evaluation | Infrastructure | Repositories | certification-evaluation-repository', function () {
  describe('#selectNextCertificationChallenge', function () {
    it('delegates to the certification evaluation API and returns the next challenge id', async function () {
      // given
      const assessmentId = Symbol('assessmentId');
      const nextChallengeId = Symbol('nextChallengeId');
      const certificationEvaluationApi = { selectNextCertificationChallenge: sinon.stub() };
      certificationEvaluationApi.selectNextCertificationChallenge.withArgs({ assessmentId }).resolves(nextChallengeId);

      // when
      const result = await certificationEvaluationRepository.selectNextCertificationChallenge({
        assessmentId,
        certificationEvaluationApi,
      });

      // then
      expect(result).to.equal(nextChallengeId);
    });
  });

  describe('#getAssessmentLiveAlerts', function () {
    it('delegates to the certification evaluation API and returns the live alerts', async function () {
      // given
      const assessmentId = Symbol('assessmentId');
      const liveAlerts = Symbol('liveAlerts');
      const certificationEvaluationApi = { getAssessmentLiveAlerts: sinon.stub() };
      certificationEvaluationApi.getAssessmentLiveAlerts.withArgs({ assessmentId }).resolves(liveAlerts);

      // when
      const result = await certificationEvaluationRepository.getAssessmentLiveAlerts({
        assessmentId,
        certificationEvaluationApi,
      });

      // then
      expect(result).to.equal(liveAlerts);
    });
  });
});
