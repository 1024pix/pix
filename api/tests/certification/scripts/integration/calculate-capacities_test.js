import dayjs from 'dayjs';

import { CalculateCapacities } from '../../../../scripts/certification/calculate-capacities.js';
import { SCOPES } from '../../../../src/certification/shared/domain/models/Scopes.js';
import { databaseBuilder, expect, sinon } from '../../../test-helper.js';

describe('Integration | Certification | Scripts | CalculateCapacities', function () {
  let stubComputeCapacities, logger, script;

  let activationDatePixPlus,
    activationDatePixCore,
    complementaryCertificationIdForPixPlus,
    sessionFinalizedId,
    userId1,
    userId2,
    certificationCourseId1,
    certificationCourseId2;

  const challengesConfigurationPixPlusEdu2ndDegre = {
    maximumAssessmentLength: 1,
    challengesBetweenSameCompetence: 1,
    limitToOneQuestionPerTube: true,
    enablePassageByAllCompetences: true,
    variationPercent: 1,
    defaultCandidateCapacity: 1,
    defaultProbabilityToPickChallenge: 1,
  };
  const challengesConfigurationPixCore = {
    maximumAssessmentLength: 99,
    challengesBetweenSameCompetence: 99,
    limitToOneQuestionPerTube: false,
    enablePassageByAllCompetences: false,
    variationPercent: 99,
    defaultCandidateCapacity: 99,
    defaultProbabilityToPickChallenge: 99,
  };

  beforeEach(function () {
    activationDatePixPlus = new Date('2025-01-15');
    activationDatePixCore = new Date('2020-01-01');

    stubComputeCapacities = sinon.stub().rejects();
    logger = { info: sinon.stub(), error: sinon.stub() };

    script = new CalculateCapacities();

    complementaryCertificationIdForPixPlus =
      databaseBuilder.factory.buildComplementaryCertification.pixEdu2ndDegre().id;

    databaseBuilder.factory.buildCertificationVersion({
      scope: SCOPES.CORE,
      startDate: activationDatePixCore,
      challengesConfiguration: challengesConfigurationPixCore,
    });

    databaseBuilder.factory.buildCertificationVersion({
      scope: SCOPES.PIX_PLUS_EDU_2ND_DEGRE,
      expirationDate: activationDatePixPlus,
      challengesConfiguration: challengesConfigurationPixPlusEdu2ndDegre,
    });
    databaseBuilder.factory.buildCertificationVersion({
      scope: SCOPES.PIX_PLUS_EDU_2ND_DEGRE,
      startDate: activationDatePixPlus,
      challengesConfiguration: challengesConfigurationPixPlusEdu2ndDegre,
    });

    sessionFinalizedId = databaseBuilder.factory.buildSession({ finalizedAt: new Date() }).id;

    const ids1 = buildUserAndCertificationCourseAndAssessment(sessionFinalizedId);
    userId1 = ids1.userId;
    certificationCourseId1 = ids1.certificationCourseId;

    const ids2 = buildUserAndCertificationCourseAndAssessment(sessionFinalizedId);
    userId2 = ids2.userId;
    certificationCourseId2 = ids2.certificationCourseId;
  });

  it('should only compute capacities for pix plus certifications', async function () {
    stubComputeCapacities
      .withArgs(certificationCourseId2, sinon.match({ _configuration: challengesConfigurationPixPlusEdu2ndDegre }))
      .resolves();

    const certificationCandidateId1 = databaseBuilder.factory.buildCertificationCandidate({
      userId: userId1,
      sessionId: sessionFinalizedId,
      reconciledAt: dayjs(activationDatePixCore).add(2, 'days').toDate(),
    }).id;
    databaseBuilder.factory.buildCoreSubscription({
      certificationCandidateId: certificationCandidateId1,
    });

    const certificationCandidateId2 = databaseBuilder.factory.buildCertificationCandidate({
      userId: userId2,
      sessionId: sessionFinalizedId,
      reconciledAt: dayjs(activationDatePixPlus).add(2, 'days').toDate(),
    }).id;
    databaseBuilder.factory.buildComplementaryCertificationSubscription({
      complementaryCertificationId: complementaryCertificationIdForPixPlus,
      certificationCandidateId: certificationCandidateId2,
    });
    await databaseBuilder.commit();

    await script.handle({ options: { dryRun: true }, logger, computeCapacitiesFnc: stubComputeCapacities });

    expect(logger.info.callCount).to.equal(2);
    expect(logger.info.getCall(0)).to.have.been.calledWithExactly(
      'About to compute capacities for certification EDU_2ND_DEGRE for 1 candidates',
    );
    expect(logger.info.getCall(1)).to.have.been.calledWithExactly(
      'Successfully computed capacities for certification EDU_2ND_DEGRE for 1/1 candidates',
    );
    expect(stubComputeCapacities.callCount).to.equal(1);
  });

  it('should only compute capacities for certification courses associated with the active version of the certification course', async function () {
    stubComputeCapacities
      .withArgs(certificationCourseId2, sinon.match({ _configuration: challengesConfigurationPixPlusEdu2ndDegre }))
      .resolves();

    const certificationCandidateId1 = databaseBuilder.factory.buildCertificationCandidate({
      userId: userId1,
      sessionId: sessionFinalizedId,
      reconciledAt: dayjs(activationDatePixPlus).subtract(2, 'days').toDate(),
    }).id;
    databaseBuilder.factory.buildComplementaryCertificationSubscription({
      complementaryCertificationId: complementaryCertificationIdForPixPlus,
      certificationCandidateId: certificationCandidateId1,
    });

    const certificationCandidateId2 = databaseBuilder.factory.buildCertificationCandidate({
      userId: userId2,
      sessionId: sessionFinalizedId,
      reconciledAt: dayjs(activationDatePixPlus).add(2, 'days').toDate(),
    }).id;
    databaseBuilder.factory.buildComplementaryCertificationSubscription({
      complementaryCertificationId: complementaryCertificationIdForPixPlus,
      certificationCandidateId: certificationCandidateId2,
    });
    await databaseBuilder.commit();

    await script.handle({ options: { dryRun: true }, logger, computeCapacitiesFnc: stubComputeCapacities });

    expect(logger.info.callCount).to.equal(2);
    expect(logger.info.getCall(0)).to.have.been.calledWithExactly(
      'About to compute capacities for certification EDU_2ND_DEGRE for 1 candidates',
    );
    expect(logger.info.getCall(1)).to.have.been.calledWithExactly(
      'Successfully computed capacities for certification EDU_2ND_DEGRE for 1/1 candidates',
    );
    expect(stubComputeCapacities.callCount).to.equal(1);
  });

  context('when there is a non finalized session', function () {
    it('should not compute capacities for certification courses associated to a non finalized session', async function () {
      stubComputeCapacities
        .withArgs(certificationCourseId2, sinon.match({ _configuration: challengesConfigurationPixPlusEdu2ndDegre }))
        .resolves();

      const sessionNotFinalizedId = databaseBuilder.factory.buildSession().id;
      const ids1 = buildUserAndCertificationCourseAndAssessment(sessionNotFinalizedId);
      userId1 = ids1.userId;
      certificationCourseId1 = ids1.certificationCourseId;
      const certificationCandidateId1 = databaseBuilder.factory.buildCertificationCandidate({
        userId: userId1,
        sessionId: sessionNotFinalizedId,
        reconciledAt: dayjs(activationDatePixPlus).add(2, 'days').toDate(),
      }).id;
      databaseBuilder.factory.buildComplementaryCertificationSubscription({
        complementaryCertificationId: complementaryCertificationIdForPixPlus,
        certificationCandidateId: certificationCandidateId1,
      });

      const certificationCandidateId2 = databaseBuilder.factory.buildCertificationCandidate({
        userId: userId2,
        sessionId: sessionFinalizedId,
        reconciledAt: dayjs(activationDatePixPlus).add(2, 'days').toDate(),
      }).id;
      databaseBuilder.factory.buildComplementaryCertificationSubscription({
        complementaryCertificationId: complementaryCertificationIdForPixPlus,
        certificationCandidateId: certificationCandidateId2,
      });
      await databaseBuilder.commit();

      await script.handle({ options: { dryRun: true }, logger, computeCapacitiesFnc: stubComputeCapacities });

      expect(logger.info.callCount).to.equal(2);
      expect(logger.info.getCall(0)).to.have.been.calledWithExactly(
        'About to compute capacities for certification EDU_2ND_DEGRE for 1 candidates',
      );
      expect(logger.info.getCall(1)).to.have.been.calledWithExactly(
        'Successfully computed capacities for certification EDU_2ND_DEGRE for 1/1 candidates',
      );
      expect(stubComputeCapacities.callCount).to.equal(1);
    });
  });

  context('when a certification course encounter an error while processing', function () {
    it('should continue computing capacities for other certification courses', async function () {
      stubComputeCapacities
        .withArgs(certificationCourseId1, sinon.match({ _configuration: challengesConfigurationPixPlusEdu2ndDegre }))
        .rejects();
      stubComputeCapacities
        .withArgs(certificationCourseId2, sinon.match({ _configuration: challengesConfigurationPixPlusEdu2ndDegre }))
        .resolves();

      const certificationCandidateId1 = databaseBuilder.factory.buildCertificationCandidate({
        userId: userId1,
        sessionId: sessionFinalizedId,
        reconciledAt: dayjs(activationDatePixPlus).add(2, 'days').toDate(),
      }).id;
      databaseBuilder.factory.buildComplementaryCertificationSubscription({
        complementaryCertificationId: complementaryCertificationIdForPixPlus,
        certificationCandidateId: certificationCandidateId1,
      });

      const certificationCandidateId2 = databaseBuilder.factory.buildCertificationCandidate({
        userId: userId2,
        sessionId: sessionFinalizedId,
        reconciledAt: dayjs(activationDatePixPlus).add(2, 'days').toDate(),
      }).id;
      databaseBuilder.factory.buildComplementaryCertificationSubscription({
        complementaryCertificationId: complementaryCertificationIdForPixPlus,
        certificationCandidateId: certificationCandidateId2,
      });
      await databaseBuilder.commit();

      await script.handle({ options: { dryRun: true }, logger, computeCapacitiesFnc: stubComputeCapacities });

      expect(logger.info.callCount).to.equal(2);
      expect(logger.info.getCall(0)).to.have.been.calledWithExactly(
        'About to compute capacities for certification EDU_2ND_DEGRE for 2 candidates',
      );
      expect(logger.info.getCall(1)).to.have.been.calledWithExactly(
        'Successfully computed capacities for certification EDU_2ND_DEGRE for 1/2 candidates',
      );
      expect(logger.error.callCount).to.equal(1);
      expect(logger.error).to.have.been.calledWith(
        sinon.match(`An error occurred when computing capacities for certification ${certificationCourseId1}, error`),
      );

      expect(stubComputeCapacities.callCount).to.equal(2);
    });
  });

  it('should compute capacities from multiple different certif version', async function () {
    stubComputeCapacities
      .withArgs(certificationCourseId1, sinon.match({ _configuration: challengesConfigurationPixPlusEdu2ndDegre }))
      .resolves();

    stubComputeCapacities
      .withArgs(certificationCourseId2, sinon.match({ _configuration: challengesConfigurationPixPlusEdu2ndDegre }))
      .resolves();

    const certificationCandidateId1 = databaseBuilder.factory.buildCertificationCandidate({
      userId: userId1,
      sessionId: sessionFinalizedId,
      reconciledAt: dayjs(activationDatePixPlus).add(2, 'days').toDate(),
    }).id;
    databaseBuilder.factory.buildComplementaryCertificationSubscription({
      complementaryCertificationId: complementaryCertificationIdForPixPlus,
      certificationCandidateId: certificationCandidateId1,
    });

    const certificationCandidateId2 = databaseBuilder.factory.buildCertificationCandidate({
      userId: userId2,
      sessionId: sessionFinalizedId,
      reconciledAt: dayjs(activationDatePixPlus).add(2, 'days').toDate(),
    }).id;
    databaseBuilder.factory.buildComplementaryCertificationSubscription({
      complementaryCertificationId: complementaryCertificationIdForPixPlus,
      certificationCandidateId: certificationCandidateId2,
    });

    const challengesConfigurationPixPlusEdu1erDegre = {
      maximumAssessmentLength: 55,
      challengesBetweenSameCompetence: 55,
      limitToOneQuestionPerTube: true,
      enablePassageByAllCompetences: false,
      variationPercent: 55,
      defaultCandidateCapacity: 55,
      defaultProbabilityToPickChallenge: 55,
    };
    const complementaryCertificationIdForPixPlus2 =
      databaseBuilder.factory.buildComplementaryCertification.pixEdu1erDegre().id;
    databaseBuilder.factory.buildCertificationVersion({
      scope: SCOPES.PIX_PLUS_EDU_1ER_DEGRE,
      startDate: activationDatePixPlus,
      challengesConfiguration: challengesConfigurationPixPlusEdu1erDegre,
    });
    const ids3 = buildUserAndCertificationCourseAndAssessment(sessionFinalizedId);
    const userId3 = ids3.userId;
    const certificationCourseId3 = ids3.certificationCourseId;
    const certificationCandidateId3 = databaseBuilder.factory.buildCertificationCandidate({
      userId: userId3,
      sessionId: sessionFinalizedId,
      reconciledAt: dayjs(activationDatePixPlus).add(2, 'days').toDate(),
    }).id;
    databaseBuilder.factory.buildComplementaryCertificationSubscription({
      complementaryCertificationId: complementaryCertificationIdForPixPlus2,
      certificationCandidateId: certificationCandidateId3,
    });

    stubComputeCapacities
      .withArgs(certificationCourseId3, sinon.match({ _configuration: challengesConfigurationPixPlusEdu1erDegre }))
      .resolves();

    await databaseBuilder.commit();

    await script.handle({ options: { dryRun: true }, logger, computeCapacitiesFnc: stubComputeCapacities });

    expect(logger.info.callCount).to.equal(4);
    expect(logger.info.getCall(0)).to.have.been.calledWithExactly(
      'About to compute capacities for certification EDU_2ND_DEGRE for 2 candidates',
    );
    expect(logger.info.getCall(1)).to.have.been.calledWithExactly(
      'Successfully computed capacities for certification EDU_2ND_DEGRE for 2/2 candidates',
    );
    expect(logger.info.getCall(2)).to.have.been.calledWithExactly(
      'About to compute capacities for certification EDU_1ER_DEGRE for 1 candidates',
    );
    expect(logger.info.getCall(3)).to.have.been.calledWithExactly(
      'Successfully computed capacities for certification EDU_1ER_DEGRE for 1/1 candidates',
    );

    expect(stubComputeCapacities.callCount).to.equal(3);
  });
});

function buildUserAndCertificationCourseAndAssessment(sessionId) {
  const userId = databaseBuilder.factory.buildUser().id;
  const certificationCourseId = databaseBuilder.factory.buildCertificationCourse({
    userId: userId,
    sessionId: sessionId,
  }).id;
  databaseBuilder.factory.buildAssessment({ certificationCourseId });
  return { userId, certificationCourseId };
}
