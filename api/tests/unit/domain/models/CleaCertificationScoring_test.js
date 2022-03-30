const CleaCertificationScoring = require('../../../../lib/domain/models/CleaCertificationScoring');
const { expect, catchErr, domainBuilder } = require('../../../test-helper');
const { ObjectValidationError, NotEligibleCandidateError } = require('../../../../lib/domain/errors');

const GREEN_ZONE_REPRO = [80, 90, 100];
const RED_ZONE_REPRO = [1, 50];

describe('Unit | Domain | Models | CleaCertificationScoring', function () {
  describe('constructor', function () {
    let validArguments;
    beforeEach(function () {
      validArguments = {
        complementaryCertificationCourseId: 999,
        certificationCourseId: 123,
        cleaBadgeKey: 'partnerKey',
        hasAcquiredBadge: true,
        reproducibilityRate: 80,
        cleaCompetenceMarks: [1],
        expectedPixByCompetenceForClea: { competence1: 1 },
      };
    });

    it('should successfully instantiate object when passing all valid arguments', function () {
      // when
      expect(() => new CleaCertificationScoring(validArguments)).not.to.throw(ObjectValidationError);
    });

    it('should throw an ObjectValidationError when hasAcquiredBadge is not valid', function () {
      // when
      expect(
        () =>
          new CleaCertificationScoring({
            ...validArguments,
            hasAcquiredBadge: 'coucou',
          })
      ).to.throw(ObjectValidationError);
    });

    it('should throw an ObjectValidationError when reproducibilityRate is not valid', function () {
      // when
      expect(
        () =>
          new CleaCertificationScoring({
            ...validArguments,
            reproducibilityRate: 'coucou',
          })
      ).to.throw(ObjectValidationError);
    });

    it('should throw an ObjectValidationError when cleaCompetenceMarks is not valid', function () {
      // when
      expect(() => new CleaCertificationScoring({ ...validArguments, cleaCompetenceMarks: null })).to.throw(
        ObjectValidationError
      );
    });

    it('should throw an ObjectValidationError when expectedPixByCompetenceForClea is not valid', function () {
      // when
      expect(
        () =>
          new CleaCertificationScoring({
            ...validArguments,
            expectedPixByCompetenceForClea: null,
          })
      ).to.throw(ObjectValidationError);
    });
  });

  context('#static buildNotEligible', function () {
    it('should build a not eligible CleaCertificationScoring', async function () {
      // when
      const notEligibleCleaCertificationScoring = CleaCertificationScoring.buildNotEligible({
        complementaryCertificationCourseId: 999,
        certificationCourseId: 123,
      });

      // then
      expect(notEligibleCleaCertificationScoring.isEligible()).to.be.false;
    });
  });

  context('#isEligible', function () {
    it('when user has badge it is eligible', async function () {
      // given
      const cleaCertificationScoring = await _buildCleaCertificationScoringWithBadge();

      // when
      const hasAcquiredCertif = cleaCertificationScoring.isEligible();

      // then
      expect(hasAcquiredCertif).to.be.true;
    });

    it('when user does not have badge it is not eligible', async function () {
      // given
      const cleaCertificationScoring = await _buildCleaCertificationScoringWithoutBadge();

      // when
      const hasAcquiredCertif = cleaCertificationScoring.isEligible();

      // then
      expect(hasAcquiredCertif).to.be.false;
    });
  });

  context('#setBadgeAcquisitionStillValid', function () {
    it('when user has badge and set stillAcquired at true, should be eligible', async function () {
      // given
      const cleaCertificationScoring = await _buildCleaCertificationScoringWithBadge();

      // when
      cleaCertificationScoring.setBadgeAcquisitionStillValid(true);

      // then
      expect(cleaCertificationScoring.isBadgeAcquisitionStillValid).to.be.true;
      expect(cleaCertificationScoring.isEligible()).to.be.true;
    });

    it('when user has badge and set stillAcquired at false, should not be eligible', async function () {
      // given
      const cleaCertificationScoring = await _buildCleaCertificationScoringWithBadge();

      // when
      cleaCertificationScoring.setBadgeAcquisitionStillValid(false);

      // then
      expect(cleaCertificationScoring.isBadgeAcquisitionStillValid).to.be.false;
      expect(cleaCertificationScoring.hasAcquiredBadge).to.be.true;
      expect(cleaCertificationScoring.isEligible()).to.be.false;
    });
  });

  context('#isAcquired', function () {
    it('throws when not eligible', async function () {
      // given
      const cleaCertificationScoring = await _buildCleaCertificationScoringWithoutBadge();

      // when
      const error = await catchErr(cleaCertificationScoring.isAcquired, cleaCertificationScoring)();

      // then
      expect(error).to.be.instanceOf(NotEligibleCandidateError);
    });

    context('reproducibility rate in green zone', function () {
      // eslint-disable-next-line mocha/no-setup-in-describe
      GREEN_ZONE_REPRO.forEach((reproducibilityRate) =>
        it(`for ${reproducibilityRate} reproducibility rate, it should obtain certification`, async function () {
          // given
          const cleaCertificationScoring = await _buildCleaCertificationScoringWithReproducibilityRate(
            reproducibilityRate
          );

          // when
          const hasAcquiredCertif = cleaCertificationScoring.isAcquired();

          // then
          expect(hasAcquiredCertif).to.be.true;
        })
      );
    });

    context('reproducibility rate in grey zone', function () {
      it("for 70 reproducibility rate, it should obtain certification when the pixScore for each certifiable competences is above a floored 75% of Clea corresponding competence's pixScore for at least 75% of them", async function () {
        // given
        const cleaCertificationScoring =
          await _buildCleaCertificationScoringInGreyZoneAndAtLeast75PercentOfCertifiableCompetences();

        // when
        const hasAcquiredCertif = cleaCertificationScoring.isAcquired();

        // then
        expect(hasAcquiredCertif).to.be.true;
      });

      it('for 70 reproducibility rate, it should not obtain certification when there are no competence marks for clea eligible competences', async function () {
        // given
        const competenceId1 = 'competenceId1',
          competenceId2 = 'competenceId2',
          competenceId3 = 'competenceId3',
          competenceId4 = 'competenceId4';

        const expectedPixByCompetenceForClea = {
          [competenceId1]: 20,
          [competenceId2]: 10,
          [competenceId3]: 15,
          [competenceId4]: 12,
          competenceId5: 30,
        };

        const cleaCompetenceMarks = [];
        const cleaCertificationScoring = _buildCleaCertificationScoring({
          withBadge: true,
          reproducibilityRate: 70,
          cleaCompetenceMarks,
          expectedPixByCompetenceForClea,
        });

        // when
        const hasAcquiredCertif = cleaCertificationScoring.isAcquired();

        // then
        expect(hasAcquiredCertif).to.be.false;
      });

      it("for 70 reproducibility rate, it should not obtain certification when the pixScore for each certifiable competences is under a floored 75% of Clea corresponding competence's pixScore for less than 75% of them", async function () {
        // given
        const cleaCertificationScoring =
          await _buildCleaCertificationScoringInGreyZoneAndLessThan75PercentOfCertifiableCompetences();

        // when
        const hasAcquiredCertif = cleaCertificationScoring.isAcquired();

        // then
        expect(hasAcquiredCertif).to.be.false;
      });
    });

    context('reproducibility rate in red zone', function () {
      // eslint-disable-next-line mocha/no-setup-in-describe
      RED_ZONE_REPRO.forEach((reproducibilityRate) =>
        it(`for ${reproducibilityRate} reproducibility rate, it should not obtain certification`, async function () {
          // given
          const cleaCertificationScoring = await _buildCleaCertificationScoringWithReproducibilityRate(
            reproducibilityRate
          );

          // when
          const hasAcquiredCertif = cleaCertificationScoring.isAcquired({
            hasAcquiredBadge: true,
            reproducibilityRate,
          });

          // then
          expect(hasAcquiredCertif).to.be.false;
        })
      );
    });
  });
});

function _buildCleaCertificationScoringWithBadge() {
  return _buildCleaCertificationScoring({ withBadge: true });
}

function _buildCleaCertificationScoringWithoutBadge() {
  return _buildCleaCertificationScoring({ withBadge: false });
}

function _buildCleaCertificationScoringWithReproducibilityRate(reproducibilityRate) {
  return _buildCleaCertificationScoring({ withBadge: true, reproducibilityRate });
}

function _buildCleaCertificationScoringInGreyZoneAndAtLeast75PercentOfCertifiableCompetences() {
  const competenceId1 = 'competenceId1',
    competenceId2 = 'competenceId2',
    competenceId3 = 'competenceId3',
    competenceId4 = 'competenceId4';

  const expectedPixByCompetenceForClea = {
    [competenceId1]: 20,
    [competenceId2]: 10,
    [competenceId3]: 15,
    [competenceId4]: 12,
    competenceId5: 30,
  };

  const cleaCompetenceMarks = [
    domainBuilder.buildCompetenceMark({
      competenceId: competenceId1,
      score: 15,
    }),
    domainBuilder.buildCompetenceMark({
      competenceId: competenceId2,
      score: 8,
    }),
    domainBuilder.buildCompetenceMark({
      competenceId: competenceId3,
      score: 3,
    }),
    domainBuilder.buildCompetenceMark({
      competenceId: competenceId4,
      score: 10,
    }),
  ];
  return _buildCleaCertificationScoring({
    withBadge: true,
    reproducibilityRate: 70,
    cleaCompetenceMarks,
    expectedPixByCompetenceForClea,
  });
}

function _buildCleaCertificationScoringInGreyZoneAndLessThan75PercentOfCertifiableCompetences() {
  const competenceId1 = 'competenceId1',
    competenceId2 = 'competenceId2',
    competenceId3 = 'competenceId3',
    competenceId4 = 'competenceId4';

  const expectedPixByCompetenceForClea = {
    [competenceId1]: 18,
    [competenceId2]: 10,
    [competenceId3]: 15,
    [competenceId4]: 12,
    competenceId5: 30,
  };

  const cleaCompetenceMarks = [
    domainBuilder.buildCompetenceMark({
      competenceId: competenceId1,
      score: 12,
    }),
    domainBuilder.buildCompetenceMark({
      competenceId: competenceId2,
      score: 8,
    }),
    domainBuilder.buildCompetenceMark({
      competenceId: competenceId3,
      score: 3,
    }),
    domainBuilder.buildCompetenceMark({
      competenceId: competenceId4,
      score: 10,
    }),
  ];
  return _buildCleaCertificationScoring({
    withBadge: true,
    reproducibilityRate: 70,
    cleaCompetenceMarks,
    expectedPixByCompetenceForClea,
  });
}

function _buildCleaCertificationScoring({
  withBadge = false,
  reproducibilityRate = 0,
  cleaCompetenceMarks = [domainBuilder.buildCompetenceMark()],
  expectedPixByCompetenceForClea = { competence1: 1 },
}) {
  const certificationCourseId = 42;
  const complementaryCertificationCourseId = 999;
  return new CleaCertificationScoring({
    complementaryCertificationCourseId,
    certificationCourseId,
    hasAcquiredBadge: withBadge,
    reproducibilityRate,
    cleaCompetenceMarks,
    expectedPixByCompetenceForClea,
    cleaBadgeKey: 'pix_clea_badge_key',
  });
}
