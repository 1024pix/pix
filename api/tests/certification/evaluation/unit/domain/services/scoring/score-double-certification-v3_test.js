import { scoreDoubleCertificationV3 } from '../../../../../../../src/certification/evaluation/domain/services/scoring/scoring-v3.js';
import { ComplementaryCertificationCourseResult } from '../../../../../../../src/certification/shared/domain/models/ComplementaryCertificationCourseResult.js';
import { DomainTransaction } from '../../../../../../../src/shared/domain/DomainTransaction.js';
import { domainBuilder, expect, sinon } from '../../../../../../test-helper.js';

describe('Certification | Evaluation | Unit | Domain | Services | Scoring Double Certification V3', function () {
  const complementaryCertificationCourseResultRepository = {};
  const complementaryCertificationScoringCriteriaRepository = {};

  const dependencies = {
    complementaryCertificationScoringCriteriaRepository,
    complementaryCertificationCourseResultRepository,
  };

  beforeEach(function () {
    sinon.stub(DomainTransaction, 'execute').callsFake((lambda) => lambda());
    complementaryCertificationCourseResultRepository.save = sinon.stub();
    complementaryCertificationScoringCriteriaRepository.findByCertificationCourseId = sinon.stub();
  });
  it('should save a "not acquired" complementary certification when pix score and reproducibility rate are below expectations', async function () {
    // given
    const certificationCourseId = 123;
    const assessmentId = 123;
    const assessmentSheet = domainBuilder.certification.evaluation.buildAssessmentSheet({
      assessmentId,
      certificationCourseId,
    });
    const assessmentResult = domainBuilder.buildAssessmentResult.validated({
      pixScore: 45,
      reproducibilityRate: 70,
    });
    const complementaryCertificationScoringCriteria =
      domainBuilder.certification.evaluation.buildComplementaryCertificationScoringCriteria({
        complementaryCertificationCourseId: 999,
        complementaryCertificationBadgeId: 888,
        minimumReproducibilityRate: 75,
        complementaryCertificationBadgeKey: 'PIX_PLUS_TEST',
        hasComplementaryReferential: false,
        minimumEarnedPix: 50,
      });
    complementaryCertificationScoringCriteriaRepository.findByCertificationCourseId
      .withArgs({
        certificationCourseId,
      })
      .resolves([complementaryCertificationScoringCriteria]);

    // when
    await scoreDoubleCertificationV3({
      ...dependencies,
      assessmentResult,
      assessmentSheet,
    });

    // then
    expect(complementaryCertificationCourseResultRepository.save).to.have.been.calledWithExactly(
      ComplementaryCertificationCourseResult.from({
        complementaryCertificationCourseId: 999,
        complementaryCertificationBadgeId: 888,
        source: ComplementaryCertificationCourseResult.sources.PIX,
        acquired: false,
      }),
    );
  });

  it('should save a "not acquired" complementary certification when pix score is above expectation and repro rate is not', async function () {
    // given
    const certificationCourseId = 123;
    const assessmentId = 123;
    const assessmentSheet = domainBuilder.certification.evaluation.buildAssessmentSheet({
      assessmentId,
      certificationCourseId,
    });
    const assessmentResult = domainBuilder.buildAssessmentResult.validated({
      pixScore: 60,
      reproducibilityRate: 70,
    });
    const complementaryCertificationScoringCriteria =
      domainBuilder.certification.evaluation.buildComplementaryCertificationScoringCriteria({
        complementaryCertificationCourseId: 999,
        complementaryCertificationBadgeId: 888,
        minimumReproducibilityRate: 75,
        complementaryCertificationBadgeKey: 'PIX_PLUS_TEST',
        hasComplementaryReferential: false,
        minimumEarnedPix: 50,
      });
    complementaryCertificationScoringCriteriaRepository.findByCertificationCourseId
      .withArgs({
        certificationCourseId,
      })
      .resolves([complementaryCertificationScoringCriteria]);

    // when
    await scoreDoubleCertificationV3({
      ...dependencies,
      assessmentResult,
      assessmentSheet,
    });

    // then
    expect(complementaryCertificationCourseResultRepository.save).to.have.been.calledWithExactly(
      ComplementaryCertificationCourseResult.from({
        complementaryCertificationCourseId: 999,
        complementaryCertificationBadgeId: 888,
        source: ComplementaryCertificationCourseResult.sources.PIX,
        acquired: false,
      }),
    );
  });

  it('should save a "not acquired" complementary certification when pix score is below expectation and repro rate is above', async function () {
    // given
    const certificationCourseId = 123;
    const assessmentId = 123;
    const assessmentSheet = domainBuilder.certification.evaluation.buildAssessmentSheet({
      assessmentId,
      certificationCourseId,
    });
    const assessmentResult = domainBuilder.buildAssessmentResult.validated({
      pixScore: 45,
      reproducibilityRate: 75,
    });
    const complementaryCertificationScoringCriteria =
      domainBuilder.certification.evaluation.buildComplementaryCertificationScoringCriteria({
        complementaryCertificationCourseId: 999,
        complementaryCertificationBadgeId: 888,
        minimumReproducibilityRate: 70,
        complementaryCertificationBadgeKey: 'PIX_PLUS_TEST',
        hasComplementaryReferential: false,
        minimumEarnedPix: 50,
      });
    complementaryCertificationScoringCriteriaRepository.findByCertificationCourseId
      .withArgs({
        certificationCourseId,
      })
      .resolves([complementaryCertificationScoringCriteria]);

    // when
    await scoreDoubleCertificationV3({
      ...dependencies,
      assessmentResult,
      assessmentSheet,
    });

    // then
    expect(complementaryCertificationCourseResultRepository.save).to.have.been.calledWithExactly(
      ComplementaryCertificationCourseResult.from({
        complementaryCertificationCourseId: 999,
        complementaryCertificationBadgeId: 888,
        source: ComplementaryCertificationCourseResult.sources.PIX,
        acquired: false,
      }),
    );
  });

  it('should save an "acquired" complementary certification when pix score and repro rate are above expectations', async function () {
    // given
    const certificationCourseId = 123;
    const assessmentId = 123;
    const assessmentSheet = domainBuilder.certification.evaluation.buildAssessmentSheet({
      assessmentId,
      certificationCourseId,
    });
    const assessmentResult = domainBuilder.buildAssessmentResult.validated({
      pixScore: 120,
      reproducibilityRate: 75,
    });
    const complementaryCertificationScoringCriteria =
      domainBuilder.certification.evaluation.buildComplementaryCertificationScoringCriteria({
        complementaryCertificationCourseId: 999,
        complementaryCertificationBadgeId: 888,
        minimumReproducibilityRate: 70,
        complementaryCertificationBadgeKey: 'PIX_PLUS_TEST',
        hasComplementaryReferential: false,
        minimumEarnedPix: 50,
      });
    complementaryCertificationScoringCriteriaRepository.findByCertificationCourseId
      .withArgs({
        certificationCourseId,
      })
      .resolves([complementaryCertificationScoringCriteria]);

    // when
    await scoreDoubleCertificationV3({
      ...dependencies,
      assessmentResult,
      assessmentSheet,
    });

    // then
    expect(complementaryCertificationCourseResultRepository.save).to.have.been.calledWithExactly(
      ComplementaryCertificationCourseResult.from({
        complementaryCertificationCourseId: 999,
        complementaryCertificationBadgeId: 888,
        source: ComplementaryCertificationCourseResult.sources.PIX,
        acquired: true,
      }),
    );
  });

  it('should save a "not acquired" complementary certification when pix core is rejected for fraud', async function () {
    // given
    const certificationCourseId = 123;
    const assessmentId = 123;
    const assessmentSheet = domainBuilder.certification.evaluation.buildAssessmentSheet({
      assessmentId,
      certificationCourseId,
      isRejectedForFraud: true,
    });
    const assessmentResult = domainBuilder.buildAssessmentResult.validated({
      pixScore: 120,
      reproducibilityRate: 75,
    });
    const complementaryCertificationScoringCriteria =
      domainBuilder.certification.evaluation.buildComplementaryCertificationScoringCriteria({
        complementaryCertificationCourseId: 999,
        complementaryCertificationBadgeId: 888,
        minimumReproducibilityRate: 70,
        complementaryCertificationBadgeKey: 'PIX_PLUS_TEST',
        hasComplementaryReferential: false,
        minimumEarnedPix: 50,
      });
    complementaryCertificationScoringCriteriaRepository.findByCertificationCourseId
      .withArgs({
        certificationCourseId,
      })
      .resolves([complementaryCertificationScoringCriteria]);

    // when
    await scoreDoubleCertificationV3({
      ...dependencies,
      assessmentResult,
      assessmentSheet,
    });

    // then
    expect(complementaryCertificationCourseResultRepository.save).to.have.been.calledWithExactly(
      ComplementaryCertificationCourseResult.from({
        complementaryCertificationCourseId: 999,
        complementaryCertificationBadgeId: 888,
        partnerKey: 'PIX_PLUS_TEST',
        source: ComplementaryCertificationCourseResult.sources.PIX,
        acquired: false,
      }),
    );
  });
});
