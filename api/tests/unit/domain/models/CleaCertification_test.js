const CleaCertification = require('../../../../lib/domain/models/CleaCertification');
const { expect, catchErr, domainBuilder, } = require('../../../test-helper');
const { ObjectValidationError, NotEligibleCandidateError } = require('../../../../lib/domain/errors');

const GREEN_ZONE_REPRO = [80, 90, 100];
const RED_ZONE_REPRO = [1, 50];

describe('Unit | Domain | Models | CleaCertification', () => {
  describe('constructor', () => {
    let validArguments;
    beforeEach(() => {
      validArguments = {
        certificationCourseId: 123,
        partnerKey: 'partnerKey',
        hasAcquiredBadge: true,
        reproducibilityRate: 80,
        cleaCompetenceMarks: [1],
        maxReachablePixByCompetenceForClea: { competence1:1 },
      };
    });

    it('should successfully instantiate object when passing all valid arguments', () => {
      // when
      expect(() => new CleaCertification(validArguments)).not.to.throw(ObjectValidationError);
    });

    it('should throw an ObjectValidationError when hasAcquiredBadge is not valid', () => {
      // when
      expect(() => new CleaCertification({
        ...validArguments,
        hasAcquiredBadge: 'coucou'
      })).to.throw(ObjectValidationError);
    });

    it('should throw an ObjectValidationError when reproducibilityRate is not valid', () => {
      // when
      expect(() => new CleaCertification({
        ...validArguments,
        reproducibilityRate: 'coucou'
      })).to.throw(ObjectValidationError);
    });

    it('should throw an ObjectValidationError when cleaCompetenceMarks is not valid', () => {
      // when
      expect(() => new CleaCertification({ ...validArguments, cleaCompetenceMarks: null })).to.throw(ObjectValidationError);
    });

    it('should throw an ObjectValidationError when maxReachablePixByCompetenceForClea is not valid', () => {
      // when
      expect(() => new CleaCertification({
        ...validArguments,
        maxReachablePixByCompetenceForClea: null
      })).to.throw(ObjectValidationError);
    });
  });

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

function _buildCleaCertificationWithBadge() {
  return _buildCleaCertification({ withBadge: true });
}

function _buildCleaCertificationWithoutBadge() {
  return _buildCleaCertification({ withBadge: false });
}

function _buildCleaCertificationWithReproducibilityRate(reproducibilityRate) {
  return _buildCleaCertification({ withBadge: true, reproducibilityRate });
}

function _buildCleaCertificationInGreyZoneAndCertifiableCompetences() {
  const competenceId1 = 'competenceId1', competenceId2 = 'competenceId2';

  const maxReachablePixByCompetenceForClea = {
    [competenceId1]: 20,
    [competenceId2]: 10,
    ['competenceId4']: 30,
  };

  const cleaCompetenceMarks = [
    domainBuilder.buildCompetenceMark(
      {
        competenceId: competenceId1,
        score: 15,
      }
    ),
    domainBuilder.buildCompetenceMark(
      {
        competenceId: competenceId2,
        score: 8
      }
    ),
  ];
  return _buildCleaCertification(
    {
      withBadge: true,
      reproducibilityRate: 70,
      cleaCompetenceMarks,
      maxReachablePixByCompetenceForClea
    });
}

function _buildCleaCertificationInGreyZoneAndNonCertifiableCompetences() {
  const competenceId1 = 'competenceId1', competenceId2 = 'competenceId2';

  const maxReachablePixByCompetenceForClea = {
    [competenceId1]: 20,
    [competenceId2]: 10,
    ['competenceId4']: 30,
  };

  const cleaCompetenceMarks = [
    domainBuilder.buildCompetenceMark(
      {
        competenceId: competenceId1,
        score: 15
      }
    ),
    domainBuilder.buildCompetenceMark(
      {
        competenceId: competenceId2,
        score: 7
      }
    ),
  ];
  return _buildCleaCertification({
    withBadge: true,
    reproducibilityRate: 70,
    cleaCompetenceMarks,
    maxReachablePixByCompetenceForClea
  });
}

function _buildCleaCertification({
  withBadge = false,
  reproducibilityRate = 0,
  cleaCompetenceMarks = [domainBuilder.buildCompetenceMark()],
  maxReachablePixByCompetenceForClea = { competence1:1 }
}) {
  const certificationCourseId = 42;

  return new CleaCertification({
    certificationCourseId,
    hasAcquiredBadge: withBadge,
    reproducibilityRate,
    cleaCompetenceMarks,
    maxReachablePixByCompetenceForClea,
  });
}
