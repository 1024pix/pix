import { FixNotFullyFinalizedSession } from '../../../../scripts/certification/fix-not-fully-finalized-session.js';
import { databaseBuilder, expect, knex, sinon } from '../../../test-helper.js';

describe('Integration | Scripts | Certification | fix not fully finalized session', function () {
  let assessment, certificationCourse, session, fixNotFullyFinalizedSessionScript, logger;

  beforeEach(async function () {
    session = databaseBuilder.factory.buildSession({
      version: 2,
      finalizedAt: new Date('2024-01-02T00:00:00Z'),
    });
    const user = databaseBuilder.factory.buildUser();
    databaseBuilder.factory.buildCertificationCandidate({
      sessionId: session.id,
      userId: user.id,
    });
    certificationCourse = databaseBuilder.factory.buildCertificationCourse({
      createdAt: new Date('2024-02-01T00:00:00Z'),
      sessionId: session.id,
      userId: user.id,
      completedAt: new Date('2024-02-01T08:00:00Z'),
      isPublished: false,
      isCancelled: false,
      abortReason: null,
      version: 2,
      isRejectedForFraud: false,
      endedAt: null,
    });
    assessment = databaseBuilder.factory.buildAssessment({
      certificationCourseId: certificationCourse.id,
      userId: user.id,
      type: 'CERTIFICATION',
      state: 'completed',
      method: 'CERTIFICATION_DETERMINED',
    });
    databaseBuilder.factory.buildAssessmentResult({
      assessmentId: assessment.id,
      userId: user.id,
      type: 'CERTIFICATION',
      status: 'validated',
    });

    await databaseBuilder.commit();

    logger = { info: sinon.stub() };
    fixNotFullyFinalizedSessionScript = new FixNotFullyFinalizedSession();
  });

  it('creates a finalized session', async function () {
    // when
    await fixNotFullyFinalizedSessionScript.handle({
      options: { sessionId: session.id },
      logger,
    });

    // then
    const { count: finalizedSessionCount } = await knex('finalized-sessions')
      .where({ sessionId: session.id })
      .count()
      .first();

    expect(finalizedSessionCount).to.equal(1);
  });
});
