import { ComplementaryCertificationCourseResultForJuryCertificationWithExternal } from '../../../../lib/domain/read-models/ComplementaryCertificationCourseResultForJuryCertificationWithExternal.js';
import { ComplementaryCertificationCourseResult } from '../../../../lib/domain/models/ComplementaryCertificationCourseResult.js';
import { expect, domainBuilder } from '../../../test-helper.js';

describe('Unit | Domain | Models | ComplementaryCertificationCourseResultForJuryCertificationWithExternal', function () {
  describe('#finalResult', function () {
    context('when external section is not scored yet', function () {
      it('should return "En attente volet jury" ', function () {
        // given
        const complementaryCertificationCourseResultForJuryCertificationWithExternal =
          domainBuilder.buildComplementaryCertificationCourseResultForJuryCertificationWithExternal({
            pixComplementaryCertificationBadgeId: 99,
            pixAcquired: true,
            externalComplementaryCertificationBadgeId: null,
          });

        // when
        const finalResult = complementaryCertificationCourseResultForJuryCertificationWithExternal.finalResult;

        // then
        expect(finalResult).to.be.equal('En attente volet jury');
      });
    });

    it('should return "Rejetée" when pix section is not obtained', function () {
      // given
      const complementaryCertificationCourseResultForJuryCertificationWithExternal =
        domainBuilder.buildComplementaryCertificationCourseResultForJuryCertificationWithExternal({
          pixComplementaryCertificationBadgeId: 99,
          pixAcquired: false,
        });

      // when
      const finalResult = complementaryCertificationCourseResultForJuryCertificationWithExternal.finalResult;

      // then
      expect(finalResult).to.equal('Rejetée');
    });

    context('when both section are scored', function () {
      it('should return "Rejetée" when external section is not obtained', function () {
        // given
        const complementaryCertificationCourseResultForJuryCertificationWithExternal =
          domainBuilder.buildComplementaryCertificationCourseResultForJuryCertificationWithExternal({
            pixComplementaryCertificationBadgeId: 99,
            pixAcquired: true,
            externalComplementaryCertificationBadgeId: 99,
            externalAcquired: false,
          });

        // when
        const finalResult = complementaryCertificationCourseResultForJuryCertificationWithExternal.finalResult;

        // then
        expect(finalResult).to.equal('Rejetée');
      });

      it(`should return the section with the lowest level`, function () {
        // given
        const complementaryCertificationCourseResultForJuryCertificationWithExternal =
          domainBuilder.buildComplementaryCertificationCourseResultForJuryCertificationWithExternal({
            pixComplementaryCertificationBadgeId: 98,
            pixLabel: 'Badge Key 1',
            pixAcquired: true,
            pixLevel: 4,
            externalComplementaryCertificationBadgeId: 99,
            externalLabel: 'Badge Key 2',
            externalAcquired: true,
            externalLevel: 2,
          });

        // when
        const finalResult = complementaryCertificationCourseResultForJuryCertificationWithExternal.finalResult;

        // then
        expect(finalResult).to.equal('Badge Key 2');
      });
    });
  });

  describe('#from', function () {
    it('should return a ComplementaryCertificationCourseResultForJuryCertificationWithExternal', function () {
      // given
      const complementaryCertificationCourseResultWithExternal = [
        domainBuilder.buildComplementaryCertificationCourseResult({
          complementaryCertificationCourseId: 1234,
          complementaryCertificationBadgeId: 456,
          acquired: true,
          source: ComplementaryCertificationCourseResult.sources.PIX,
        }),
        domainBuilder.buildComplementaryCertificationCourseResult({
          complementaryCertificationCourseId: 1234,
          complementaryCertificationBadgeId: 457,
          acquired: false,
          source: ComplementaryCertificationCourseResult.sources.EXTERNAL,
        }),
      ];
      const badgesIdAndLabels = [
        { id: 456, label: 'Key 1' },
        { id: 457, label: 'Key 2' },
      ];
      // when
      const result = ComplementaryCertificationCourseResultForJuryCertificationWithExternal.from(
        complementaryCertificationCourseResultWithExternal,
        badgesIdAndLabels,
      );

      // then
      expect(result).to.deepEqualInstance(
        new ComplementaryCertificationCourseResultForJuryCertificationWithExternal({
          pixAcquired: true,
          externalAcquired: false,
          pixComplementaryCertificationBadgeId: 456,
          externalComplementaryCertificationBadgeId: 457,
          complementaryCertificationCourseId: 1234,
          allowedExternalLevels: [
            { value: 456, label: 'Key 1' },
            { value: 457, label: 'Key 2' },
          ],
          defaultJuryOptions: ['REJECTED', 'UNSET'],
        }),
      );
    });
  });

  describe('#pixResult', function () {
    context('when pix section is not evaluated', function () {
      it('should return null', function () {
        // given
        const complementaryCertificationCourseResultForJuryCertificationWithExternal =
          new ComplementaryCertificationCourseResultForJuryCertificationWithExternal({});

        // when
        const pixResult = complementaryCertificationCourseResultForJuryCertificationWithExternal.pixResult;

        // then
        expect(pixResult).to.be.null;
      });
    });

    context('when pix section is evaluated', function () {
      it(`should return the pix label`, function () {
        // given
        const complementaryCertificationCourseResultForJuryCertificationWithExternal =
          new ComplementaryCertificationCourseResultForJuryCertificationWithExternal({
            pixComplementaryCertificationBadgeId: 98,
            pixLabel: 'Key label',
            pixAcquired: true,
          });

        // when
        const pixResult = complementaryCertificationCourseResultForJuryCertificationWithExternal.pixResult;

        // then
        expect(pixResult).to.equal('Key label');
      });
    });
  });

  describe('#externalResult', function () {
    context('when pix section is not acquired', function () {
      it('should return "-"', function () {
        // given
        const complementaryCertificationCourseResultForJuryCertificationWithExternal =
          new ComplementaryCertificationCourseResultForJuryCertificationWithExternal({
            pixComplementaryCertificationBadgeId: 99,
            pixAcquired: false,
          });

        // when
        const externalResult = complementaryCertificationCourseResultForJuryCertificationWithExternal.externalResult;

        // then
        expect(externalResult).to.equal('-');
      });
    });

    context('when pix section is acquired and external section is not yet evaluated', function () {
      it('should return "En attente"', function () {
        // given
        const complementaryCertificationCourseResultForJuryCertificationWithExternal =
          new ComplementaryCertificationCourseResultForJuryCertificationWithExternal({
            pixComplementaryCertificationBadgeId: 99,
            pixAcquired: true,
          });

        // when
        const externalResult = complementaryCertificationCourseResultForJuryCertificationWithExternal.externalResult;

        // then
        expect(externalResult).to.equal('En attente');
      });
    });

    context('when pix section is acquired and external section is evaluated', function () {
      context('when acquired is true', function () {
        it(`should return the external label`, function () {
          // given
          const complementaryCertificationCourseResultForJuryCertificationWithExternal =
            new ComplementaryCertificationCourseResultForJuryCertificationWithExternal({
              pixComplementaryCertificationBadgeId: 98,
              pixAcquired: true,
              externalComplementaryCertificationBadgeId: 99,
              externalLabel: 'Key 2 label',
              externalAcquired: true,
            });

          // when
          const externalResult = complementaryCertificationCourseResultForJuryCertificationWithExternal.externalResult;

          // then
          expect(externalResult).to.equal('Key 2 label');
        });
      });

      context('when acquired is false', function () {
        it(`should return Rejetée`, function () {
          // given
          const complementaryCertificationCourseResultForJuryCertificationWithExternal =
            new ComplementaryCertificationCourseResultForJuryCertificationWithExternal({
              pixComplementaryCertificationBadgeId: 98,
              pixAcquired: true,
              externalComplementaryCertificationBadgeId: 98,
              externalAcquired: false,
            });

          // when
          const externalResult = complementaryCertificationCourseResultForJuryCertificationWithExternal.externalResult;

          // then
          expect(externalResult).to.equal('Rejetée');
        });
      });
    });
  });
});
