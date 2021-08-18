const { expect, sinon, domainBuilder } = require('../../../test-helper');
const { handleCertificationAutoCancelCheck } = require('../../../../lib/domain/events')._forTestOnly.handlers;
const ChallengeNeutralized = require('../../../../lib/domain/events/ChallengeNeutralized');
const CertificationAutoCancelCheckDone = require('../../../../lib/domain/events/CertificationAutoCancelCheckDone');

describe('Unit | Domain | Events | handle-certification-auto-cancel-check', function() {

  let certificationAssessmentRepository;
  let certificationCourseRepository;

  beforeEach(function() {
    certificationAssessmentRepository = {
      getByCertificationCourseId: sinon.stub(),
    };
    certificationCourseRepository = {
      get: sinon.stub(),
      update: sinon.stub(),
    };
  });

  context('when there is more than 33% neutralized challenges', function() {

    it('should cancel the certification course', async function() {
      // given
      const event = new ChallengeNeutralized({ certificationCourseId: 123, juryId: 321 });
      const certificationAssessment = domainBuilder.buildCertificationAssessment({
        certificationCourseId: 123,
        certificationChallenges: [
          domainBuilder.buildCertificationChallengeWithType({ isNeutralized: true }),
          domainBuilder.buildCertificationChallengeWithType({ isNeutralized: true }),
          domainBuilder.buildCertificationChallengeWithType({ isNeutralized: false }),
          domainBuilder.buildCertificationChallengeWithType({ isNeutralized: false }),
        ],
      });
      certificationAssessmentRepository.getByCertificationCourseId.withArgs({ certificationCourseId: 123 }).resolves(certificationAssessment);

      const certificationCourse = domainBuilder.buildCertificationCourse({ isCancelled: false });
      sinon.spy(certificationCourse, 'cancel');
      certificationCourseRepository.get.withArgs(123).resolves(certificationCourse);

      // when
      await handleCertificationAutoCancelCheck({
        event,
        certificationAssessmentRepository,
        certificationCourseRepository,
      });

      expect(certificationCourse.cancel).to.have.been.calledOnce;
      expect(certificationCourseRepository.update).to.have.been.calledWith(certificationCourse);
    });

    it('should return a CertificationAutoCancelCheckDone with a comment for jury', async function() {
      // given
      const event = new ChallengeNeutralized({ certificationCourseId: 123, juryId: 321 });
      const certificationAssessment = domainBuilder.buildCertificationAssessment({
        certificationCourseId: 123,
        certificationChallenges: [
          domainBuilder.buildCertificationChallengeWithType({ isNeutralized: true }),
          domainBuilder.buildCertificationChallengeWithType({ isNeutralized: true }),
          domainBuilder.buildCertificationChallengeWithType({ isNeutralized: false }),
          domainBuilder.buildCertificationChallengeWithType({ isNeutralized: false }),
        ],
      });
      certificationAssessmentRepository.getByCertificationCourseId.withArgs({ certificationCourseId: 123 }).resolves(certificationAssessment);

      const certificationCourse = domainBuilder.buildCertificationCourse({ isCancelled: false });
      certificationCourseRepository.get.withArgs(123).resolves(certificationCourse);
      certificationCourseRepository.update.resolves();

      // when
      const certificationAutoCancelCheckDone = await handleCertificationAutoCancelCheck({
        event,
        certificationAssessmentRepository,
        certificationCourseRepository,
      });

      expect(certificationAutoCancelCheckDone).to.deepEqualInstance(new CertificationAutoCancelCheckDone({
        certificationCourseId: 123,
        juryId: 321,
        commentForJury: 'Certification annulée car plus de 33% des épreuves ont été neutralisées.',
      }));
    });

  });

  context('when there is less than 33% neutralized challenges', function() {

    it('should uncancel the certification course', async function() {
      // given
      const event = new ChallengeNeutralized({ certificationCourseId: 123, juryId: 321 });
      const certificationAssessment = domainBuilder.buildCertificationAssessment({
        certificationCourseId: 123,
        certificationChallenges: [
          domainBuilder.buildCertificationChallengeWithType({ isNeutralized: true }),
          domainBuilder.buildCertificationChallengeWithType({ isNeutralized: false }),
          domainBuilder.buildCertificationChallengeWithType({ isNeutralized: false }),
          domainBuilder.buildCertificationChallengeWithType({ isNeutralized: false }),
        ],
      });
      certificationAssessmentRepository.getByCertificationCourseId.withArgs({ certificationCourseId: 123 }).resolves(certificationAssessment);

      const certificationCourse = domainBuilder.buildCertificationCourse({ isCancelled: true });
      sinon.spy(certificationCourse, 'uncancel');
      certificationCourseRepository.get.withArgs(123).resolves(certificationCourse);

      // when
      await handleCertificationAutoCancelCheck({
        event,
        certificationAssessmentRepository,
        certificationCourseRepository,
      });

      expect(certificationCourse.uncancel).to.have.been.calledOnce;
      expect(certificationCourseRepository.update).to.have.been.calledWith(certificationCourse);
    });

    it('should return a CertificationAutoCancelCheckDone with an empty comment for jury', async function() {
      // given
      const event = new ChallengeNeutralized({ certificationCourseId: 123, juryId: 321 });
      const certificationAssessment = domainBuilder.buildCertificationAssessment({
        certificationCourseId: 123,
        certificationChallenges: [
          domainBuilder.buildCertificationChallengeWithType({ isNeutralized: true }),
          domainBuilder.buildCertificationChallengeWithType({ isNeutralized: false }),
          domainBuilder.buildCertificationChallengeWithType({ isNeutralized: false }),
          domainBuilder.buildCertificationChallengeWithType({ isNeutralized: false }),
        ],
      });
      certificationAssessmentRepository.getByCertificationCourseId.withArgs({ certificationCourseId: 123 }).resolves(certificationAssessment);

      const certificationCourse = domainBuilder.buildCertificationCourse({ isCancelled: true });
      certificationCourseRepository.get.withArgs(123).resolves(certificationCourse);
      certificationCourseRepository.update.resolves();

      // when
      const certificationAutoCancelCheckDone = await handleCertificationAutoCancelCheck({
        event,
        certificationAssessmentRepository,
        certificationCourseRepository,
      });

      expect(certificationAutoCancelCheckDone).to.deepEqualInstance(new CertificationAutoCancelCheckDone({
        certificationCourseId: 123,
        juryId: 321,
        commentForJury: '',
      }));
    });
  });
});
