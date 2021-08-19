const _ = require('lodash');
const { catchErr, expect, sinon, domainBuilder } = require('../../../test-helper');
const { handleCleaCertificationRescoring } = require('../../../../lib/domain/events')._forTestOnly.handlers;

describe('Unit | Domain | Events | handle-clea-certification-rescoring', function() {

  const partnerCertificationScoringRepository = {
    buildCleaCertificationScoring: _.noop(),
    save: _.noop(),
  };
  const cleaCertificationResultRepository = {
    get: _.noop(),
  };

  const dependencies = {
    partnerCertificationScoringRepository,
    cleaCertificationResultRepository,
  };

  beforeEach(function() {
    partnerCertificationScoringRepository.buildCleaCertificationScoring = sinon.stub();
    partnerCertificationScoringRepository.save = sinon.stub();
    cleaCertificationResultRepository.get = sinon.stub();
  });

  it('fails when event is not of correct type', async function() {
    // given
    const event = 'not an event of the correct type';

    // when / then
    const error = await catchErr(handleCleaCertificationRescoring)(
      { event, ...dependencies },
    );

    // then
    expect(error.message).to.equal('event must be one of types CertificationRescoringCompleted');
  });

  context('#handleCleaCertificationRescoring', function() {

    context('when CleA certification was not even taken in the first place', function() {

      it('should not build or save no partner certification scoring', async function() {
        // given
        const certificationRescoringCompletedEvent = domainBuilder.buildCertificationRescoringCompletedEvent({
          certificationCourseId: 123,
          userId: 456,
          reproducibilityRate: 80,
        });
        cleaCertificationResultRepository.get
          .withArgs({ certificationCourseId: 123 })
          .resolves(domainBuilder.buildCleaCertificationResult.notTaken());

        // when
        await handleCleaCertificationRescoring({
          ...dependencies,
          event: certificationRescoringCompletedEvent,
        });

        // then
        expect(partnerCertificationScoringRepository.buildCleaCertificationScoring).not.to.have.been.called;
        expect(partnerCertificationScoringRepository.save).not.to.have.been.called;
      });
    });

    context('when CleA Certification was taken', function() {

      it('should save the re-scored cleA certification', async function() {
        // given
        const certificationRescoringCompletedEvent = domainBuilder.buildCertificationRescoringCompletedEvent({
          certificationCourseId: 123,
          userId: 456,
          reproducibilityRate: 80,
        });
        cleaCertificationResultRepository.get
          .withArgs({ certificationCourseId: 123 })
          .resolves(domainBuilder.buildCleaCertificationResult.acquired());
        const cleaCertificationRescoring = domainBuilder.buildCleaCertificationScoring();
        partnerCertificationScoringRepository.buildCleaCertificationScoring.resolves(cleaCertificationRescoring);
        partnerCertificationScoringRepository.save.resolves();

        // when
        await handleCleaCertificationRescoring({
          ...dependencies,
          event: certificationRescoringCompletedEvent,
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
  });
});
