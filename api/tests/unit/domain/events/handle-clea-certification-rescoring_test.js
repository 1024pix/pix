const { catchErr, expect, sinon, domainBuilder } = require('../../../test-helper');
const { handleCleaCertificationRescoring } = require('../../../../lib/domain/events')._forTestOnly.handlers;

describe('Unit | Domain | Events | handle-clea-certification-rescoring', function () {
  let partnerCertificationScoringRepository;
  let cleaCertificationResultRepository;
  let certificationCenterRepository;

  beforeEach(function () {
    partnerCertificationScoringRepository = { buildCleaCertificationScoring: sinon.stub(), save: sinon.stub() };
    cleaCertificationResultRepository = { get: sinon.stub() };
    certificationCenterRepository = { getByCertificationCourseId: sinon.stub() };
  });

  it('fails when event is not of correct type', async function () {
    // given
    const event = 'not an event of the correct type';

    // when / then
    const error = await catchErr(handleCleaCertificationRescoring)({
      event,
      partnerCertificationScoringRepository,
      cleaCertificationResultRepository,
    });

    // then
    expect(error.message).to.equal('event must be one of types CertificationRescoringCompleted');
  });

  context('#handleCleaCertificationRescoring', function () {
    context('when CleA certification was not even taken in the first place', function () {
      it('should not build or save no partner certification scoring', async function () {
        // given
        const certificationRescoringCompletedEvent = domainBuilder.buildCertificationRescoringCompletedEvent({
          certificationCourseId: 123,
          userId: 456,
          reproducibilityRate: 80,
        });

        const complementaryCertification = domainBuilder.buildComplementaryCertification({
          name: 'CléA Numérique',
        });
        const certificationCenter = domainBuilder.buildCertificationCenter({
          habilitations: [complementaryCertification],
        });

        certificationCenterRepository.getByCertificationCourseId.withArgs(123).resolves(certificationCenter);

        cleaCertificationResultRepository.get
          .withArgs({ certificationCourseId: 123 })
          .resolves(domainBuilder.buildCleaCertificationResult.notTaken());

        // when
        await handleCleaCertificationRescoring({
          event: certificationRescoringCompletedEvent,
          partnerCertificationScoringRepository,
          cleaCertificationResultRepository,
          certificationCenterRepository,
        });

        // then
        expect(partnerCertificationScoringRepository.buildCleaCertificationScoring).not.to.have.been.called;
        expect(partnerCertificationScoringRepository.save).not.to.have.been.called;
      });
    });

    context('when CleA Certification was taken', function () {
      it('should save the re-scored cleA certification', async function () {
        // given
        const certificationRescoringCompletedEvent = domainBuilder.buildCertificationRescoringCompletedEvent({
          certificationCourseId: 123,
          userId: 456,
          reproducibilityRate: 80,
        });

        const complementaryCertification = domainBuilder.buildComplementaryCertification({
          name: 'CléA Numérique',
        });
        const certificationCenter = domainBuilder.buildCertificationCenter({
          habilitations: [complementaryCertification],
        });

        certificationCenterRepository.getByCertificationCourseId.withArgs(123).resolves(certificationCenter);

        cleaCertificationResultRepository.get
          .withArgs({ certificationCourseId: 123 })
          .resolves(domainBuilder.buildCleaCertificationResult.acquired());
        const cleaCertificationRescoring = domainBuilder.buildCleaCertificationScoring();
        partnerCertificationScoringRepository.buildCleaCertificationScoring.resolves(cleaCertificationRescoring);
        partnerCertificationScoringRepository.save.resolves();

        // when
        await handleCleaCertificationRescoring({
          event: certificationRescoringCompletedEvent,
          partnerCertificationScoringRepository,
          cleaCertificationResultRepository,
          certificationCenterRepository,
        });

        // then
        expect(partnerCertificationScoringRepository.buildCleaCertificationScoring).to.have.been.calledWithExactly({
          certificationCourseId: 123,
          userId: 456,
          reproducibilityRate: 80,
        });
        expect(partnerCertificationScoringRepository.save).to.have.been.calledWithExactly({
          partnerCertificationScoring: cleaCertificationRescoring,
        });
      });
    });

    context('when certification center is not accredited', function () {
      it('should not save the re-scored cleA certification', async function () {
        // given
        const certificationRescoringCompletedEvent = domainBuilder.buildCertificationRescoringCompletedEvent({
          certificationCourseId: 123,
          userId: 456,
          reproducibilityRate: 80,
        });

        const complementaryCertification = domainBuilder.buildComplementaryCertification({
          name: 'Tarte au fromage',
        });
        const certificationCenter = domainBuilder.buildCertificationCenter({
          habilitations: [complementaryCertification],
        });

        certificationCenterRepository.getByCertificationCourseId.withArgs(123).resolves(certificationCenter);

        // when
        await handleCleaCertificationRescoring({
          event: certificationRescoringCompletedEvent,
          cleaCertificationResultRepository,
          partnerCertificationScoringRepository,
          certificationCenterRepository,
        });

        // then
        expect(partnerCertificationScoringRepository.save).not.to.have.been.called;
      });
    });
  });
});
