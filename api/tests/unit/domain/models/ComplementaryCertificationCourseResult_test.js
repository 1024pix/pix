const ComplementaryCertificationCourseResult = require('../../../../lib/domain/models/ComplementaryCertificationCourseResult');
const { expect, domainBuilder } = require('../../../test-helper');
const {
  PIX_DROIT_MAITRE_CERTIF,
  PIX_DROIT_EXPERT_CERTIF,
  PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_INITIE,
  PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_CONFIRME,
  PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_CONFIRME,
  PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_AVANCE,
  PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_EXPERT,
  PIX_EDU_FORMATION_INITIALE_1ER_DEGRE_INITIE,
  PIX_EDU_FORMATION_INITIALE_1ER_DEGRE_CONFIRME,
  PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_CONFIRME,
  PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_AVANCE,
  PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_EXPERT,
} = require('../../../../lib/domain/models/Badge').keys;

describe('Unit | Domain | Models | ComplementaryCertificationCourseResult', function () {
  describe('#isAcquired', function () {
    it('should return true if acquired is true', function () {
      // given
      const complementaryCertificationCourseResult = new ComplementaryCertificationCourseResult({
        complementaryCertificationCourseId: 'complementaryCertificationCourseId',
        partnerKey: 'partnerKey',
        acquired: true,
        source: 'source',
      });

      // when
      const result = complementaryCertificationCourseResult.isAcquired();

      // then
      expect(result).to.be.true;
    });

    it('should return false if acquired is false', function () {
      // given
      const complementaryCertificationCourseResult = new ComplementaryCertificationCourseResult({
        complementaryCertificationCourseId: 'complementaryCertificationCourseId',
        partnerKey: 'partnerKey',
        acquired: false,
        source: 'source',
      });

      // when
      const result = complementaryCertificationCourseResult.isAcquired();

      // then
      expect(result).to.be.false;
    });
  });

  describe('#isPixEdu1erDegre', function () {
    // eslint-disable-next-line mocha/no-setup-in-describe
    [
      {
        partnerKey: PIX_EDU_FORMATION_INITIALE_1ER_DEGRE_INITIE,
        expected: true,
      },
      {
        partnerKey: PIX_EDU_FORMATION_INITIALE_1ER_DEGRE_CONFIRME,
        expected: true,
      },
      {
        partnerKey: PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_CONFIRME,
        expected: true,
      },
      {
        partnerKey: PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_AVANCE,
        expected: true,
      },
      {
        partnerKey: PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_EXPERT,
        expected: true,
      },
      {
        partnerKey: PIX_DROIT_MAITRE_CERTIF,
        expected: false,
      },
      {
        partnerKey: PIX_DROIT_EXPERT_CERTIF,
        expected: false,
      },
      {
        partnerKey: PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_INITIE,
        expected: false,
      },
      {
        partnerKey: PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_CONFIRME,
        expected: false,
      },
      {
        partnerKey: PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_CONFIRME,
        expected: false,
      },
      {
        partnerKey: PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_AVANCE,
        expected: false,
      },
      {
        partnerKey: PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_EXPERT,
        expected: false,
      },
    ].forEach(({ partnerKey, expected }) => {
      it(`should return ${expected} when partnerKey is ${partnerKey}`, function () {
        // given
        const complementaryCertificationCourseResult = domainBuilder.buildComplementaryCertificationCourseResult({
          partnerKey,
        });

        // when
        const result = complementaryCertificationCourseResult.isPixEdu1erDegre();

        // then
        expect(result).to.equal(expected);
      });
    });
  });
  describe('#isPixEdu2ndDegre', function () {
    // eslint-disable-next-line mocha/no-setup-in-describe
    [
      {
        partnerKey: PIX_EDU_FORMATION_INITIALE_1ER_DEGRE_INITIE,
        expected: false,
      },
      {
        partnerKey: PIX_EDU_FORMATION_INITIALE_1ER_DEGRE_CONFIRME,
        expected: false,
      },
      {
        partnerKey: PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_CONFIRME,
        expected: false,
      },
      {
        partnerKey: PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_AVANCE,
        expected: false,
      },
      {
        partnerKey: PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_EXPERT,
        expected: false,
      },
      {
        partnerKey: PIX_DROIT_MAITRE_CERTIF,
        expected: false,
      },
      {
        partnerKey: PIX_DROIT_EXPERT_CERTIF,
        expected: false,
      },
      {
        partnerKey: PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_INITIE,
        expected: true,
      },
      {
        partnerKey: PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_CONFIRME,
        expected: true,
      },
      {
        partnerKey: PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_CONFIRME,
        expected: true,
      },
      {
        partnerKey: PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_AVANCE,
        expected: true,
      },
      {
        partnerKey: PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_EXPERT,
        expected: true,
      },
    ].forEach(({ partnerKey, expected }) => {
      it(`should return ${expected} when partnerKey is ${partnerKey}`, function () {
        // given
        const complementaryCertificationCourseResult = domainBuilder.buildComplementaryCertificationCourseResult({
          partnerKey,
        });

        // when
        const result = complementaryCertificationCourseResult.isPixEdu2ndDegre();

        // then
        expect(result).to.equal(expected);
      });
    });
  });

  describe('#isPixEdu', function () {
    // eslint-disable-next-line mocha/no-setup-in-describe
    [
      {
        partnerKey: PIX_DROIT_MAITRE_CERTIF,
        expected: false,
      },
      {
        partnerKey: PIX_DROIT_EXPERT_CERTIF,
        expected: false,
      },
      {
        partnerKey: PIX_EDU_FORMATION_INITIALE_1ER_DEGRE_INITIE,
        expected: true,
      },
      {
        partnerKey: PIX_EDU_FORMATION_INITIALE_1ER_DEGRE_CONFIRME,
        expected: true,
      },
      {
        partnerKey: PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_CONFIRME,
        expected: true,
      },
      {
        partnerKey: PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_AVANCE,
        expected: true,
      },
      {
        partnerKey: PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_EXPERT,
        expected: true,
      },
      {
        partnerKey: PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_INITIE,
        expected: true,
      },
      {
        partnerKey: PIX_EDU_FORMATION_INITIALE_2ND_DEGRE_CONFIRME,
        expected: true,
      },
      {
        partnerKey: PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_CONFIRME,
        expected: true,
      },
      {
        partnerKey: PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_AVANCE,
        expected: true,
      },
      {
        partnerKey: PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_EXPERT,
        expected: true,
      },
    ].forEach(({ partnerKey, expected }) => {
      it(`should return ${expected} when partnerKey is ${partnerKey}`, function () {
        // given
        const complementaryCertificationCourseResult = domainBuilder.buildComplementaryCertificationCourseResult({
          partnerKey,
        });

        // when
        const result = complementaryCertificationCourseResult.isPixEdu();

        // then
        expect(result).to.equal(expected);
      });
    });
  });

  describe('#buildFromJuryLevel', function () {
    describe('when the jury level is not "REJECTED"', function () {
      it('should return an acquired ComplementaryCertificationCourseResult with an external source', function () {
        // given
        const complementaryCertificationCourseResult = domainBuilder.buildComplementaryCertificationCourseResult({
          partnerKey: PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_CONFIRME,
          source: ComplementaryCertificationCourseResult.sources.PIX,
          acquired: true,
          complementaryCertificationCourseId: 12,
        });

        // when
        const result = ComplementaryCertificationCourseResult.buildFromJuryLevel({
          juryLevel: complementaryCertificationCourseResult.partnerKey,
          complementaryCertificationCourseId: 12,
          pixPartnerKey: PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_CONFIRME,
        });

        // then
        expect(result).to.deepEqualInstance(
          new ComplementaryCertificationCourseResult({
            acquired: true,
            partnerKey: PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_CONFIRME,
            source: ComplementaryCertificationCourseResult.sources.EXTERNAL,
            complementaryCertificationCourseId: 12,
          })
        );
      });
    });

    describe('when the jury level is "REJECTED"', function () {
      it('should return an acquired ComplementaryCertificationCourseResult with an external source', function () {
        // given
        const complementaryCertificationCourseResult = domainBuilder.buildComplementaryCertificationCourseResult({
          partnerKey: 'REJECTED',
          source: ComplementaryCertificationCourseResult.sources.PIX,
          acquired: true,
          complementaryCertificationCourseId: 12,
        });

        // when
        const result = ComplementaryCertificationCourseResult.buildFromJuryLevel({
          juryLevel: complementaryCertificationCourseResult.partnerKey,
          complementaryCertificationCourseId: 12,
          pixPartnerKey: PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_CONFIRME,
        });

        // then
        expect(result).to.deepEqualInstance(
          new ComplementaryCertificationCourseResult({
            acquired: false,
            partnerKey: PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_CONFIRME,
            source: ComplementaryCertificationCourseResult.sources.EXTERNAL,
            complementaryCertificationCourseId: 12,
          })
        );
      });
    });
  });

  describe('#isFromPixSource', function () {
    describe('when source is PIX', function () {
      it('should return true', function () {
        // given
        const complementaryCertificationCourseResult = domainBuilder.buildComplementaryCertificationCourseResult({
          partnerKey: PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_CONFIRME,
          source: ComplementaryCertificationCourseResult.sources.PIX,
          acquired: true,
          complementaryCertificationCourseId: 12,
        });

        // when then
        expect(complementaryCertificationCourseResult.isFromPixSource()).to.be.true;
      });
    });

    describe('when source is not PIX', function () {
      it('should return false', function () {
        // given
        const complementaryCertificationCourseResult = domainBuilder.buildComplementaryCertificationCourseResult({
          partnerKey: PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_CONFIRME,
          source: ComplementaryCertificationCourseResult.sources.EXTERNAL,
          acquired: true,
          complementaryCertificationCourseId: 12,
        });

        // when then
        expect(complementaryCertificationCourseResult.isFromPixSource()).to.be.false;
      });
    });
  });

  describe('#isFromExternalSource', function () {
    describe('when source is EXTERNAL', function () {
      it('should return true', function () {
        // given
        const complementaryCertificationCourseResult = domainBuilder.buildComplementaryCertificationCourseResult({
          partnerKey: PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_CONFIRME,
          source: ComplementaryCertificationCourseResult.sources.EXTERNAL,
          acquired: true,
          complementaryCertificationCourseId: 12,
        });

        // when then
        expect(complementaryCertificationCourseResult.isFromExternalSource()).to.be.true;
      });
    });

    describe('when source is not EXTERNAL', function () {
      it('should return false', function () {
        // given
        const complementaryCertificationCourseResult = domainBuilder.buildComplementaryCertificationCourseResult({
          partnerKey: PIX_EDU_FORMATION_CONTINUE_1ER_DEGRE_CONFIRME,
          source: ComplementaryCertificationCourseResult.sources.PIX,
          acquired: true,
          complementaryCertificationCourseId: 12,
        });

        // when then
        expect(complementaryCertificationCourseResult.isFromExternalSource()).to.be.false;
      });
    });
  });
});
