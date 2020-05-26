const _ = require('lodash');
const { expect, sinon } = require('../../../test-helper');
const competenceRepository = require('../../../../lib/infrastructure/repositories/competence-repository');
const badgeAcquisitionRepository = require('../../../../lib/infrastructure/repositories/badge-acquisition-repository');
const CertificationPartnerAcquisition = require('../../../../lib/domain/models/CertificationPartnerAcquisition');
const CertificationScoringCompleted = require('../../../../lib/domain/events/CertificationScoringCompleted');
const events = require('../../../../lib/domain/events');
const Badge = require('../../../../lib/domain/models/Badge');

describe('Unit | Domain | Events | handle-certification-partner', () => {
  const competenceMarkRepository = { getLatestByCertificationCourseId: _.noop };
  const certificationPartnerAcquisitionRepository = { save: _.noop };
  const domainTransaction = {};

  let certificationScoringEvent;

  const dependencies = {
    certificationPartnerAcquisitionRepository,
    competenceMarkRepository,
  };

  context('when assessment is of type CERTIFICATION', () => {
    const certificationCourseId = Symbol('certificationCourseId');
    const userId = Symbol('userId');

    beforeEach(() => {
      certificationScoringEvent = new CertificationScoringCompleted({
        certificationCourseId,
        userId,
        isCertification: true,
        reproducibilityRate: 80,
        limitDate: new Date('2018-02-03'),
      });

    });

    context('when scoring is successful', () => {
      const competenceMarks = Symbol('competenceMarks');
      const totalPixCleaByCompetence = Symbol('totalPixCleaByCompetence');
      const hasAcquiredBadge = Symbol('badgeIsAcquired');

      beforeEach(() => {
        sinon.stub(certificationPartnerAcquisitionRepository, 'save').resolves();
        sinon.stub(competenceMarkRepository, 'getLatestByCertificationCourseId')
          .withArgs({ certificationCourseId, domainTransaction })
          .resolves(competenceMarks);
        sinon.stub(competenceRepository, 'getTotalPixCleaByCompetence')
          .withArgs()
          .resolves(totalPixCleaByCompetence);
      });

      beforeEach(() => {
        sinon.stub(badgeAcquisitionRepository, 'hasAcquiredBadgeWithKey')
          .withArgs({
            badgeKey: Badge.keys.PIX_EMPLOI_CLEA,
            userId,
          })
          .resolves(hasAcquiredBadge);
      });

      it('user has acquired CleA certification, it should save it', async () => {
        // given
        sinon.stub(CertificationPartnerAcquisition.prototype, 'hasAcquiredCertification')
          .withArgs({
            hasAcquiredBadge,
            reproducibilityRate: certificationScoringEvent.reproducibilityRate,
            competenceMarks,
            totalPixCleaByCompetence,
          })
          .returns(true);

        // when
        await events.handleCertificationAcquisitionForPartner({
          certificationScoringEvent, ...dependencies, domainTransaction
        });

        // then
        expect(certificationPartnerAcquisitionRepository.save).to.have.been.calledWithMatch({
          certificationCourseId,
          partnerKey: Badge.keys.PIX_EMPLOI_CLEA,
        });
      });

      it('user has not acquired CleA certification, it should not save it any partner certif', async () => {
        // given
        sinon.stub(CertificationPartnerAcquisition.prototype, 'hasAcquiredCertification')
          .withArgs({
            hasAcquiredBadge,
            reproducibilityRate: certificationScoringEvent.reproducibilityRate,
            competenceMarks,
            totalPixCleaByCompetence,
          })
          .returns(false);

        // when
        await events.handleCertificationAcquisitionForPartner({
          certificationScoringEvent, ...dependencies, domainTransaction
        });

        // then
        expect(certificationPartnerAcquisitionRepository.save).not.to.have.been.called;
      });
    });
  });
});
