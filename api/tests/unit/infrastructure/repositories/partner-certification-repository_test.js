const { expect, sinon, } = require('../../../test-helper');
const partnerCertificationRepository = require('../../../../lib/infrastructure/repositories/partner-certification-repository');
const competenceMarkRepository = require('../../../../lib/infrastructure/repositories/competence-mark-repository');
const competenceRepository = require('../../../../lib/infrastructure/repositories/competence-repository');
const badgeAcquisitionRepository = require('../../../../lib/infrastructure/repositories/badge-acquisition-repository');
const PartnerCertificationBookshelf = require('../../../../lib/infrastructure/data/partner-certification');
const Badge = require('../../../../lib/domain/models/Badge');
const CleaCertification = require('../../../../lib/domain/models/CleaCertification');

describe('Unit | Repository | Partner Certification', function() {
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
    sinon.stub(CleaCertification, 'create');
  });

  describe('#buildCleaCertification', () => {
    it('should create a certification clea object', async () => {
      const partnerCertification = await partnerCertificationRepository.buildCleaCertification({
        certificationCourseId,
        userId,
        reproducibilityRate,
        domainTransaction
      });
      expect(partnerCertification).to.be.not.null;
      expect(competenceMarkRepository.getLatestByCertificationCourseId).to.have.been.called;
      expect(badgeAcquisitionRepository.hasAcquiredBadgeWithKey).to.have.been.called;
      expect(competenceRepository.getTotalPixCleaByCompetence).to.have.been.called;
      expect(CleaCertification.create).to.have.been.calledWith({
        certificationCourseId,
        hasAcquiredBadgeClea,
        competenceMarks,
        totalPixCleaByCompetence,
        reproducibilityRate
      });
    });
  });

  describe('#save', () => {
    const cleaCertification = new CleaCertification();
    const domainTransaction = Symbol('transaction');
    const acquired = Symbol('acquired');

    it('should save with acquired', async () => {
      sinon.stub(cleaCertification, 'isAcquired').returns(acquired);
      sinon.stub(PartnerCertificationBookshelf.prototype, 'save').withArgs({
        certificationCourseId,
        badgeKey,
        acquired,
        domainTransaction
      }).resolves();

      await partnerCertificationRepository.save(cleaCertification, domainTransaction);

      expect(PartnerCertificationBookshelf.prototype.save).to.have.been.calledOnce;

    });
  });

});
