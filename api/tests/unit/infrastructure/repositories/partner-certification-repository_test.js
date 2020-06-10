const { expect, sinon, catchErr } = require('../../../test-helper');
const partnerCertificationRepository = require('../../../../lib/infrastructure/repositories/partner-certification-repository');
const CompetenceMark = require('../../../../lib/domain/models/CompetenceMark');
const competenceMarkRepository = require('../../../../lib/infrastructure/repositories/competence-mark-repository');
const competenceRepository = require('../../../../lib/infrastructure/repositories/competence-repository');
const badgeAcquisitionRepository = require('../../../../lib/infrastructure/repositories/badge-acquisition-repository');
const Badge = require('../../../../lib/domain/models/Badge');
const { NotEligibleCandidateError } = require('../../../../lib/domain/errors');

const GREEN_ZONE_REPRO = [80, 90, 100];
const RED_ZONE_REPRO = [1, 50];

describe('Unit | Infrastructure | Repositories | Partner Certification Repository', () => {

  context('#isEligible', () => {

    it('when user has badge it is eligible', async () => {
      // given
      const partnerCertification = await _buildCleaCertificationWithBadge();

      // when
      const hasAcquiredCertif = partnerCertification.isEligible();

      // then
      expect(hasAcquiredCertif).to.be.true;
    });

    it('when user does not have badge it is not eligible', async () => {
      // given
      const partnerCertification = await _buildCleaCertificationWithoutBadge();

      // when
      const hasAcquiredCertif = partnerCertification.isEligible();

      // then
      expect(hasAcquiredCertif).to.be.false;
    });
  });

  context('#isAcquired', () => {

    it('throws when not eligible', async () => {
      // given
      const partnerCertification = await _buildCleaCertificationWithoutBadge();

      // when
      const error = await catchErr(partnerCertification.isAcquired, partnerCertification)();

      // then
      expect(error).to.be.instanceOf(NotEligibleCandidateError);
    });

    context('reproducibility rate in green zone', () => {
      GREEN_ZONE_REPRO.forEach((reproducibilityRate) =>
        it(`for ${reproducibilityRate} reproducibility rate, it should obtain certification`, async () => {
          // given
          const partnerCertification = await _buildCleaCertificationWithReproducibilityRate(reproducibilityRate);

          // when
          const hasAcquiredCertif = partnerCertification.isAcquired();

          // then
          expect(hasAcquiredCertif).to.be.true;
        })
      );
    });

    context('reproducibility rate in grey zone', () => {

      it('for 70 reproducibility rate, it should obtain certification when the pixScore for each certifiable competences is above 75% of Clea corresponding competence\'s pixScore', async () => {
        // given
        const partnerCertification = await _buildCleaCertificationInGreyZoneAndCertifiableCompetences();

        // when
        const hasAcquiredCertif = partnerCertification.isAcquired();

        // then
        expect(hasAcquiredCertif).to.be.true;
      });

      it('for 70 reproducibility rate, it should not obtain certification when the pixScore for each certifiable competences is above 75% of Clea corresponding competence\'s pixScore', async () => {
        // given
        const partnerCertification = await _buildCleaCertificationInGreyZoneAndNonCertifiableCompetences();

        // when
        const hasAcquiredCertif = partnerCertification.isAcquired();

        // then
        expect(hasAcquiredCertif).to.be.false;
      });
    });

    context('reproducibility rate in red zone', () => {
      RED_ZONE_REPRO.forEach((reproducibilityRate) =>
        it(`for ${reproducibilityRate} reproducibility rate, it should not obtain certification`, async () => {
          // given
          const partnerCertification = await _buildCleaCertificationWithReproducibilityRate(reproducibilityRate);

          // when
          const hasAcquiredCertif = partnerCertification.isAcquired({
            hasAcquiredBadge: true,
            reproducibilityRate
          });

          // then
          expect(hasAcquiredCertif).to.be.false;
        })
      );
    });
  });

});

function _buildCleaCertification(withBadge, reproducibilityRate, competenceMarks, totalPixCleaByCompetence) {
  const certificationCourseId = Symbol('certifCourseId');
  const userId = Symbol('userId');
  const domainTransaction = Symbol('domainTransaction');

  sinon.stub(competenceMarkRepository, 'getLatestByCertificationCourseId')
    .withArgs({ certificationCourseId, domainTransaction })
    .resolves(competenceMarks);
  sinon.stub(competenceRepository, 'getTotalPixCleaByCompetence').withArgs().resolves(totalPixCleaByCompetence);
  sinon.stub(badgeAcquisitionRepository, 'hasAcquiredBadgeWithKey').withArgs({
    badgeKey: Badge.keys.PIX_EMPLOI_CLEA,
    userId,
  }).resolves(withBadge);

  return partnerCertificationRepository.buildCleaCertification({
    certificationCourseId,
    userId,
    reproducibilityRate,
    domainTransaction
  });
}

function _buildCleaCertificationWithBadge() {
  return _buildCleaCertification(true);
}

function _buildCleaCertificationWithoutBadge() {
  return _buildCleaCertification(false);
}

function _buildCleaCertificationWithReproducibilityRate(reproducibilityRate) {
  return _buildCleaCertification(true, reproducibilityRate);
}

function _buildCleaCertificationInGreyZoneAndCertifiableCompetences() {
  const competenceId1 = 'competenceId1', competenceId2 = 'competenceId2';

  const totalPixCleaByCompetence = {
    [competenceId1]: 20,
    [competenceId2]: 10,
    ['competenceId4']: 30,
  };

  const competenceMarks = [
    new CompetenceMark(
      {
        competenceId: competenceId1,
        score: 15
      }
    ),
    new CompetenceMark(
      {
        competenceId: competenceId2,
        score: 7.5
      }
    ),
    new CompetenceMark(
      {
        competenceId: 'competence3',
        score: 0
      }
    ),
  ];
  return _buildCleaCertification(true, 70, competenceMarks, totalPixCleaByCompetence);
}

function _buildCleaCertificationInGreyZoneAndNonCertifiableCompetences() {
  const competenceId1 = 'competenceId1', competenceId2 = 'competenceId2';

  const totalPixCleaByCompetence = {
    [competenceId1]: 20,
    [competenceId2]: 10,
    ['competenceId4']: 30,
  };

  const competenceMarks = [
    new CompetenceMark(
      {
        competenceId: competenceId1,
        score: 15
      }
    ),
    new CompetenceMark(
      {
        competenceId: competenceId2,
        score: 7.4
      }
    ),
    new CompetenceMark(
      {
        competenceId: 'competence3',
        score: 0
      }
    ),
  ];
  return _buildCleaCertification(true, 70, competenceMarks, totalPixCleaByCompetence);
}
