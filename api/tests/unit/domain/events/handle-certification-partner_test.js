const _ = require('lodash');
const { expect, sinon } = require('../../../test-helper');
const competenceRepository = require('../../../../lib/infrastructure/repositories/competence-repository');
const badgeAcquisitionRepository = require('../../../../lib/infrastructure/repositories/badge-acquisition-repository');
const CertificationPartnerAcquisition = require('../../../../lib/domain/models/CertificationPartnerAcquisition');
const CertificationScoringCompleted = require('../../../../lib/domain/events/CertificationScoringCompleted');
const events = require('../../../../lib/domain/events');

describe('Unit | Domain | Events | handle-certification-partner', () => {
  const certificationPartnerAcquisitionRepository = { save: _.noop };
  const domainTransaction = {};

  let certificationScoringEvent;

  const dependencies = {
    certificationPartnerAcquisitionRepository,
  };

  context('when assessment is of type CERTIFICATION', () => {

    beforeEach(() => {
      certificationScoringEvent = new CertificationScoringCompleted({
        certificationCourseId: Symbol('certificationCourseId'),
        userId: Symbol('userId'),
        isCertification: true,
        reproducibilityRate: 80,
        limitDate: new Date('2018-02-03'),
      });

    });

    context('when scoring is successful', () => {
      const pixScoreByCompetence = Symbol('pixScoreByCompetence');
      const totalPixCleaByCompetence = Symbol('totalPixCleaByCompetence');

      beforeEach(() => {
        sinon.stub(certificationPartnerAcquisitionRepository, 'save').resolves();
        sinon.stub(competenceRepository, 'getPixScoreByCompetence')
          .withArgs({
            userId: certificationScoringEvent.userId,
            limitDate: certificationScoringEvent.limitDate,
          }).resolves(pixScoreByCompetence);
        sinon.stub(competenceRepository, 'getTotalPixCleaByCompetence')
          .withArgs().resolves(totalPixCleaByCompetence);
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
          expect(competenceRepository.getPixScoreByCompetence).to.have.been.calledWith({
            userId: certificationScoringEvent.userId,
            limitDate: certificationScoringEvent.limitDate,
          });
          expect(competenceRepository.getTotalPixCleaByCompetence).to.have.been.calledWith();
          expect(CertificationPartnerAcquisition.prototype.hasAcquiredCertification).to.have.been.calledWith({
            hasAcquiredBadge: true,
            reproducibilityRate: certificationScoringEvent.reproducibilityRate,
            pixScoreByCompetence,totalPixCleaByCompetence,
          });
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
          expect(competenceRepository.getPixScoreByCompetence).to.have.been.calledWith({
            userId: certificationScoringEvent.userId,
            limitDate: certificationScoringEvent.limitDate,
          });
          expect(competenceRepository.getTotalPixCleaByCompetence).to.have.been.calledWith();
          expect(certificationPartnerAcquisitionRepository.save).not.to.have.been.called;
        });
      });

      context('when user does not have clea badge', () => {
        beforeEach(() => {
          sinon.stub(badgeAcquisitionRepository, 'hasAcquiredBadgeWithKey').resolves(false);
        });

        it('it should not save partner certification', async () => {
          // when
          await events.handleCertificationAcquisitionForPartner({
            certificationScoringEvent, ...dependencies, domainTransaction
          });

          // then
          expect(badgeAcquisitionRepository.hasAcquiredBadgeWithKey).to.have.been.called;
          expect(competenceRepository.getPixScoreByCompetence).to.have.been.calledWith({
            userId: certificationScoringEvent.userId,
            limitDate: certificationScoringEvent.limitDate,
          });
          expect(competenceRepository.getTotalPixCleaByCompetence).to.have.been.calledWith();
          expect(certificationPartnerAcquisitionRepository.save).not.to.have.been.called;
        });

      });
    });
  });
});
