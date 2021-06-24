const CleaCertificationScoring = require('../../../../lib/domain/models/CleaCertificationScoring');
const { expect, catchErr, domainBuilder } = require('../../../test-helper');
const { ObjectValidationError, NotEligibleCandidateError } = require('../../../../lib/domain/errors');

const GREEN_ZONE_REPRO = [80, 90, 100];
const RED_ZONE_REPRO = [1, 50];

describe('Unit | Domain | Models | CleaCertificationScoring', () => {

  describe('constructor', () => {
    let validArguments;
    beforeEach(() => {
      validArguments = {
        certificationCourseId: 123,
        partnerKey: 'partnerKey',
        hasAcquiredBadge: true,
        reproducibilityRate: 80,
        cleaCompetenceMarks: [1],
        maxReachablePixByCompetenceForClea: { competence1: 1 },
      };
    });

    it('should successfully instantiate object when passing all valid arguments', () => {
      // when
      expect(() => new CleaCertificationScoring(validArguments)).not.to.throw(ObjectValidationError);
    });

    it('should throw an ObjectValidationError when hasAcquiredBadge is not valid', () => {
      // when
      expect(() => new CleaCertificationScoring({
        ...validArguments,
        hasAcquiredBadge: 'coucou',
      })).to.throw(ObjectValidationError);
    });

    it('should throw an ObjectValidationError when reproducibilityRate is not valid', () => {
      // when
      expect(() => new CleaCertificationScoring({
        ...validArguments,
        reproducibilityRate: 'coucou',
      })).to.throw(ObjectValidationError);
    });

    it('should throw an ObjectValidationError when cleaCompetenceMarks is not valid', () => {
      // when
      expect(() => new CleaCertificationScoring({ ...validArguments, cleaCompetenceMarks: null })).to.throw(ObjectValidationError);
    });

    it('should throw an ObjectValidationError when maxReachablePixByCompetenceForClea is not valid', () => {
      // when
      expect(() => new CleaCertificationScoring({
        ...validArguments,
        maxReachablePixByCompetenceForClea: null,
      })).to.throw(ObjectValidationError);
    });
  });

  context('#isEligible', () => {

    it('when user has badge it is eligible', async () => {
      // given
      const cleaCertificationScoring = await _buildCleaCertificationScoringWithBadge();

      // when
      const hasAcquiredCertif = cleaCertificationScoring.isEligible();

      // then
      expect(hasAcquiredCertif).to.be.true;
    });

    it('when user does not have badge it is not eligible', async () => {
      // given
      const cleaCertificationScoring = await _buildCleaCertificationScoringWithoutBadge();

      // when
      const hasAcquiredCertif = cleaCertificationScoring.isEligible();

      // then
      expect(hasAcquiredCertif).to.be.false;
    });
  });

  context('#setBadgeAcquisitionStillValid', () => {

    it('when user has badge and set stillAcquired at true, should be eligible', async () => {
      // given
      const cleaCertificationScoring = await _buildCleaCertificationScoringWithBadge();

      // when
      cleaCertificationScoring.setBadgeAcquisitionStillValid(true);

      // then
      expect(cleaCertificationScoring.isBadgeAcquisitionStillValid).to.be.true;
      expect(cleaCertificationScoring.isEligible()).to.be.true;
    });

    it('when user has badge and set stillAcquired at false, should not be eligible', async () => {
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

  context('#isAcquired', () => {

    it('throws when not eligible', async () => {
      // given
      const cleaCertificationScoring = await _buildCleaCertificationScoringWithoutBadge();

      // when
      const error = await catchErr(cleaCertificationScoring.isAcquired, cleaCertificationScoring)();

      // then
      expect(error).to.be.instanceOf(NotEligibleCandidateError);
    });

    context('reproducibility rate in green zone', () => {
      GREEN_ZONE_REPRO.forEach((reproducibilityRate) =>
        it(`for ${reproducibilityRate} reproducibility rate, it should obtain certification`, async () => {
          // given
          const cleaCertificationScoring = await _buildCleaCertificationScoringWithReproducibilityRate(reproducibilityRate);

          // when
          const hasAcquiredCertif = cleaCertificationScoring.isAcquired();

          // then
          expect(hasAcquiredCertif).to.be.true;
        }),
      );
    });

    context('reproducibility rate in grey zone', () => {

      it('for 70 reproducibility rate, it should obtain certification when the pixScore for each certifiable competences is above a floored 75% of Clea corresponding competence\'s pixScore for at least 75% of them', async () => {
        // given
        const cleaCertificationScoring = await _buildCleaCertificationScoringInGreyZoneAndAtLeast75PercentOfCertifiableCompetences();

        // when
        const hasAcquiredCertif = cleaCertificationScoring.isAcquired();

        // then
        expect(hasAcquiredCertif).to.be.true;
      });

      it('for 70 reproducibility rate, it should not obtain certification when there are no competence marks for clea eligible competences', async () => {
        // given
        const competenceId1 = 'competenceId1', competenceId2 = 'competenceId2',
          competenceId3 = 'competenceId3', competenceId4 = 'competenceId4';

        const maxReachablePixByCompetenceForClea = {
          [competenceId1]: 20,
          [competenceId2]: 10,
          [competenceId3]: 15,
          [competenceId4]: 12,
          'competenceId5': 30,
        };

        const cleaCompetenceMarks = [];
        const cleaCertificationScoring = _buildCleaCertificationScoring({
          withBadge: true,
          reproducibilityRate: 70,
          cleaCompetenceMarks,
          maxReachablePixByCompetenceForClea,
        });

        // when
        const hasAcquiredCertif = cleaCertificationScoring.isAcquired();

        // then
        expect(hasAcquiredCertif).to.be.false;
      });

      it('for 70 reproducibility rate, it should not obtain certification when the pixScore for each certifiable competences is under a floored 75% of Clea corresponding competence\'s pixScore for less than 75% of them', async () => {
        // given
        const cleaCertificationScoring = await _buildCleaCertificationScoringInGreyZoneAndLessThan75PercentOfCertifiableCompetences();

        // when
        const hasAcquiredCertif = cleaCertificationScoring.isAcquired();

        // then
        expect(hasAcquiredCertif).to.be.false;
      });
    });

    context('reproducibility rate in red zone', () => {
      RED_ZONE_REPRO.forEach((reproducibilityRate) =>
        it(`for ${reproducibilityRate} reproducibility rate, it should not obtain certification`, async () => {
          // given
          const cleaCertificationScoring = await _buildCleaCertificationScoringWithReproducibilityRate(reproducibilityRate);

          // when
          const hasAcquiredCertif = cleaCertificationScoring.isAcquired({
            hasAcquiredBadge: true,
            reproducibilityRate,
          });

          // then
          expect(hasAcquiredCertif).to.be.false;
        }),
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
  const competenceId1 = 'competenceId1', competenceId2 = 'competenceId2',
    competenceId3 = 'competenceId3', competenceId4 = 'competenceId4';

  const maxReachablePixByCompetenceForClea = {
    [competenceId1]: 20,
    [competenceId2]: 10,
    [competenceId3]: 15,
    [competenceId4]: 12,
    'competenceId5': 30,
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
    maxReachablePixByCompetenceForClea,
  });
}

function _buildCleaCertificationScoringInGreyZoneAndLessThan75PercentOfCertifiableCompetences() {
  const competenceId1 = 'competenceId1', competenceId2 = 'competenceId2',
    competenceId3 = 'competenceId3', competenceId4 = 'competenceId4';

  const maxReachablePixByCompetenceForClea = {
    [competenceId1]: 18,
    [competenceId2]: 10,
    [competenceId3]: 15,
    [competenceId4]: 12,
    'competenceId5': 30,
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
    maxReachablePixByCompetenceForClea,
  });
}

function _buildCleaCertificationScoring({
  withBadge = false,
  reproducibilityRate = 0,
  cleaCompetenceMarks = [domainBuilder.buildCompetenceMark()],
  maxReachablePixByCompetenceForClea = { competence1: 1 },
}) {
  const certificationCourseId = 42;

  return new CleaCertificationScoring({
    certificationCourseId,
    hasAcquiredBadge: withBadge,
    reproducibilityRate,
    cleaCompetenceMarks,
    maxReachablePixByCompetenceForClea,
  });
}
