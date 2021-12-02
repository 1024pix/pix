const { catchErr, expect, sinon, domainBuilder } = require('../../../test-helper');
const { handleCleaCertificationScoring } = require('../../../../lib/domain/events')._forTestOnly.handlers;
const { CLEA } = require('../../../../lib/domain/models/ComplementaryCertification');

describe('Unit | Domain | Events | handle-clea-certification-scoring', function () {
  let partnerCertificationScoringRepository;
  let cleaCertificationResultRepository;
  let complementaryCertificationCourseRepository;

  beforeEach(function () {
    partnerCertificationScoringRepository = { buildCleaCertificationScoring: sinon.stub(), save: sinon.stub() };
    cleaCertificationResultRepository = { get: sinon.stub() };
    complementaryCertificationCourseRepository = { hasComplementaryCertification: sinon.stub() };
  });

  it('fails when event is not of correct type', async function () {
    // given
    const event = 'not an event of the correct type';

    // when / then
    const error = await catchErr(handleCleaCertificationScoring)({
      event,
      partnerCertificationScoringRepository,
      cleaCertificationResultRepository,
      complementaryCertificationCourseRepository,
    });

    // then
    expect(error.message).to.equal(
      'event must be one of types CertificationScoringCompleted, CertificationRescoringCompleted'
    );
  });

  context('#handleCleaCertificationScoring', function () {
    context('when CleA certification was not even taken in the first place', function () {
      it('should not build or save no partner certification scoring', async function () {
        // given
        const certificationScoringCompletedEvent = domainBuilder.buildCertificationScoringCompletedEvent({
          certificationCourseId: 123,
          userId: 456,
          reproducibilityRate: 80,
        });

        complementaryCertificationCourseRepository.hasComplementaryCertification
          .withArgs({
            certificationCourseId: 123,
            complementaryCertificationName: CLEA,
          })
          .resolves(false);

        // when
        await handleCleaCertificationScoring({
          event: certificationScoringCompletedEvent,
          partnerCertificationScoringRepository,
          cleaCertificationResultRepository,
          complementaryCertificationCourseRepository,
        });

        // then
        expect(partnerCertificationScoringRepository.buildCleaCertificationScoring).not.to.have.been.called;
        expect(partnerCertificationScoringRepository.save).not.to.have.been.called;
      });
    });

    context('when CleA Certification was taken', function () {
      it('should save the re-scored cleA certification', async function () {
        // given
        const certificationScoringCompletedEvent = domainBuilder.buildCertificationScoringCompletedEvent({
          certificationCourseId: 123,
          userId: 456,
          reproducibilityRate: 80,
        });

        complementaryCertificationCourseRepository.hasComplementaryCertification
          .withArgs({
            certificationCourseId: 123,
            complementaryCertificationName: CLEA,
          })
          .resolves(true);

        cleaCertificationResultRepository.get
          .withArgs({ certificationCourseId: 123 })
          .resolves(domainBuilder.buildCleaCertificationResult.acquired());
        const cleaCertificationScoring = domainBuilder.buildCleaCertificationScoring();
        partnerCertificationScoringRepository.buildCleaCertificationScoring.resolves(cleaCertificationScoring);
        partnerCertificationScoringRepository.save.resolves();

        // when
        await handleCleaCertificationScoring({
          event: certificationScoringCompletedEvent,
          partnerCertificationScoringRepository,
          cleaCertificationResultRepository,
          complementaryCertificationCourseRepository,
        });

        // then
        expect(partnerCertificationScoringRepository.buildCleaCertificationScoring).to.have.been.calledWithExactly({
          certificationCourseId: 123,
          userId: 456,
          reproducibilityRate: 80,
        });
        expect(partnerCertificationScoringRepository.save).to.have.been.calledWithExactly({
          partnerCertificationScoring: cleaCertificationScoring,
        });
      });
    });
  });
});
