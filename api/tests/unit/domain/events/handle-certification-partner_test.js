const _ = require('lodash');
const { expect, sinon, domainBuilder } = require('../../../test-helper');
const events = require('../../../../lib/domain/events');
const Assessment = require('../../../../lib/domain/models/Assessment');
const AssessmentResult = require('../../../../lib/domain/models/AssessmentResult');
const Badge = require('../../../../lib/domain/models/Badge');
const CertificationPartnerAcquisition = require('../../../../lib/domain/models/CertificationPartnerAcquisition');
const CertificationScoringCompleted = require('../../../../lib/domain/events/CertificationScoringCompleted');

describe('Unit | Domain | Events | handle-certification-partner', () => {
  const scoringCertificationService = { calculateAssessmentScore: _.noop };
  const assessmentRepository = { get: _.noop };
  const assessmentResultRepository = { save: _.noop };
  const badgeAcquisitionRepository = { hasAcquiredBadgeWithKey: _.noop };
  const certificationPartnerAcquisitionRepository = { save: _.noop };
  const domainTransaction = {};

  let certificationScoringEvent;

  const dependencies = {
    scoringCertificationService,
    assessmentRepository,
    badgeAcquisitionRepository,
    certificationPartnerAcquisitionRepository,
  };

  context('when assessment is of type CERTIFICATION', () => {
    let certificationAssessment;

    beforeEach(() => {
      certificationAssessment = _buildCertificationAssessment();
      sinon.stub(assessmentRepository, 'get').withArgs(certificationAssessment.id).resolves(certificationAssessment);

      certificationScoringEvent = new CertificationScoringCompleted({
        certificationCourseId: Symbol('certificationCourseId'),
        userId: Symbol('userId'),
        isCertification: true,
      });

    });

    context('when scoring is successful', () => {
      const assessmentResult = Symbol('AssessmentResult');
      const assessmentResultId = 'assessmentResultId';
      const savedAssessmentResult = { id: assessmentResultId };

      beforeEach(() => {
        sinon.stub(AssessmentResult, 'BuildStandardAssessmentResult').returns(assessmentResult);
        sinon.stub(assessmentResultRepository, 'save').resolves(savedAssessmentResult);
      });

      const assessmentScore = {
        nbPix: null,
        level: null,
        competenceMarks: null,
      };

      beforeEach(() => {
        sinon.stub(scoringCertificationService, 'calculateAssessmentScore').resolves(assessmentScore);
        sinon.stub(certificationPartnerAcquisitionRepository, 'save').resolves();

      });

      context('when user has clea badge', () => {
        beforeEach(() => {
          sinon.stub(badgeAcquisitionRepository, 'hasAcquiredBadgeWithKey').resolves(true);
        });

        it('user has acquired CleA certification, it should save it', async () => {
          // given
          sinon.stub(CertificationPartnerAcquisition.prototype, 'hasAcquiredCertification').returns(true);

          // when
          await events.handleCertificationAcquisitionForPartner({
            certificationScoringEvent, ...dependencies, domainTransaction
          });

          // then
          expect(badgeAcquisitionRepository.hasAcquiredBadgeWithKey).to.have.been.called;
          expect(certificationPartnerAcquisitionRepository.save).to.have.been.calledWithMatch(
            {
              partnerKey: Badge.keys.PIX_EMPLOI_CLEA,
              certificationCourseId: certificationScoringEvent.certificationCourseId,
            },
            domainTransaction);
        });

        it('user has not acquired CleA certification, it should not save it any partner certif', async () => {
          // given
          sinon.stub(CertificationPartnerAcquisition.prototype, 'hasAcquiredCertification').returns(false);

          // when
          await events.handleCertificationAcquisitionForPartner({
            certificationScoringEvent, ...dependencies, domainTransaction
          });

          // then
          expect(badgeAcquisitionRepository.hasAcquiredBadgeWithKey).to.have.been.called;
          expect(certificationPartnerAcquisitionRepository.save).not.to.have.been.called;
        });
      });

      context('when user does not have clea badge', () => {
        beforeEach(() => {
          sinon.stub(badgeAcquisitionRepository, 'hasAcquiredBadgeWithKey').resolves(false);
        });

        it('it should not save partner certification', async () => {
          // given

          // when
          await events.handleCertificationAcquisitionForPartner({
            certificationScoringEvent, ...dependencies, domainTransaction
          });

          // then
          expect(badgeAcquisitionRepository.hasAcquiredBadgeWithKey).to.have.been.called;
          expect(certificationPartnerAcquisitionRepository.save).not.to.have.been.called;
        });

      });
    });
  });
});

function _buildCertificationAssessment() {
  return domainBuilder.buildAssessment({
    id: Symbol('assessmentId'),
    certificationCourseId: Symbol('certificationCourseId'),
    state: 'started',
    type: Assessment.types.CERTIFICATION,
  });
}
