const { expect, sinon, } = require('../../../test-helper');
const certificationPartnerAcquisitionRepository = require('../../../../lib/infrastructure/repositories/certification-partner-acquisition-repository');
const competenceMarkRepository = require('../../../../lib/infrastructure/repositories/competence-mark-repository');
const competenceRepository = require('../../../../lib/infrastructure/repositories/competence-repository');
const badgeAcquisitionRepository = require('../../../../lib/infrastructure/repositories/badge-acquisition-repository');
const CertificationPartnerAcquisitionBookshelf = require('../../../../lib/infrastructure/data/certification-partner-acquisition');
const Badge = require('../../../../lib/domain/models/Badge');
const CertificationCleaAcquisition = require('../../../../lib/domain/models/CertificationCleaAcquisition');

describe('Unit | Repository | Certification Partner Acquisition', function() {
  const certificationCourseId = Symbol('certifCourseId');
  const userId = Symbol('userId');
  const totalPixCleaByCompetence = Symbol('totalPixCleaByCompetence');
  const badgeKey = Symbol('badgeKey');
  const competenceMarks = Symbol('competenceMarks');
  const hasAcquiredBadgeClea = Symbol('hasAcquired');
  const reproducibilityRate = Symbol('reproducibilityRate');
  const domainTransaction = Symbol('domainTransaction');

  beforeEach(() => {
    sinon.stub(competenceMarkRepository, 'getLatestByCertificationCourseId')
      .withArgs({ certificationCourseId, domainTransaction })
      .resolves(competenceMarks);
    sinon.stub(competenceRepository, 'getTotalPixCleaByCompetence').withArgs().resolves(totalPixCleaByCompetence);
    sinon.stub(badgeAcquisitionRepository, 'hasAcquiredBadgeWithKey').withArgs({
      badgeKey: Badge.keys.PIX_EMPLOI_CLEA,
      userId,
    }).resolves(hasAcquiredBadgeClea);
    sinon.stub(CertificationCleaAcquisition, 'create');

  });

  describe('#buildCertificationCleaAcquisition', () => {
    it('should create a certification clea acquisition object', async () => {
      const certificationPartnerAcquisition = await certificationPartnerAcquisitionRepository.buildCertificationCleaAcquisition({
        certificationCourseId,
        userId,
        reproducibilityRate,
        domainTransaction
      });
      expect(certificationPartnerAcquisition).to.be.not.null;
      expect(competenceMarkRepository.getLatestByCertificationCourseId).to.have.been.called;
      expect(badgeAcquisitionRepository.hasAcquiredBadgeWithKey).to.have.been.called;
      expect(competenceRepository.getTotalPixCleaByCompetence).to.have.been.called;
      expect(CertificationCleaAcquisition.create).to.have.been.calledWith({
        certificationCourseId,
        hasAcquiredBadgeClea,
        competenceMarks,
        totalPixCleaByCompetence,
        reproducibilityRate
      });
    });
  });

  describe('#save', () => {
    const certificationCleaAcquisition = new CertificationCleaAcquisition();
    const domainTransaction = Symbol('transaction');
    const acquired = Symbol('acquired');

    it('should save with acquired', async () => {
      sinon.stub(certificationCleaAcquisition, 'isAcquired').returns(acquired);
      sinon.stub(CertificationPartnerAcquisitionBookshelf.prototype, 'save').withArgs({
        certificationCourseId,
        badgeKey,
        acquired,
        domainTransaction
      }).resolves();

      await certificationPartnerAcquisitionRepository.save(certificationCleaAcquisition, domainTransaction);

      expect(CertificationPartnerAcquisitionBookshelf.prototype.save).to.have.been.calledOnce;

    });
  });

});
