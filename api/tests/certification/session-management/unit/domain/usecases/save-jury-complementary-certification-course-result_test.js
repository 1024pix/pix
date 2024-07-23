import { InvalidJuryLevelError, NotFoundError } from '../../../../../../lib/domain/errors.js';
import { saveJuryComplementaryCertificationCourseResult } from '../../../../../../src/certification/session-management/domain/usecases/save-jury-complementary-certification-course-result.js';
import { ComplementaryCertificationCourseResult } from '../../../../../../src/certification/shared/domain/models/ComplementaryCertificationCourseResult.js';
import { catchErr, domainBuilder, expect, sinon } from '../../../../../test-helper.js';

describe('Certification | Session-management | Unit | Domain | UseCases | save-jury-complementary-certification-course-results', function () {
  describe('#saveJuryComplementaryCertificationCourseResult', function () {
    let complementaryCertificationCourseResultRepository;

    beforeEach(function () {
      complementaryCertificationCourseResultRepository = {
        save: sinon.stub(),
        getPixSourceResultByComplementaryCertificationCourseId: sinon.stub(),
        getAllowedJuryLevelIdsByComplementaryCertificationBadgeId: sinon.stub(),
        removeExternalJuryResult: sinon.stub(),
      };
    });

    context('when no ComplementaryCertificationCourseResult from PIX source is found', function () {
      it('should throw an error', async function () {
        // given
        complementaryCertificationCourseResultRepository.getPixSourceResultByComplementaryCertificationCourseId
          .withArgs({ complementaryCertificationCourseId: 12345 })
          .resolves(null);

        // when
        const error = await catchErr(saveJuryComplementaryCertificationCourseResult)({
          complementaryCertificationCourseId: 12345,
          juryLevel: 1,
          complementaryCertificationCourseResultRepository,
        });

        // then
        expect(error).to.be.instanceOf(NotFoundError);
        expect(error.message).to.be.equal(
          "Aucun résultat de certification Pix n'a été trouvé pour cette certification complémentaire.",
        );
      });
    });

    context('when a ComplementaryCertificationCourseResult from PIX source is found', function () {
      context('when the jury level is not valid', function () {
        it('should throw an InvalidJuryLevelError', async function () {
          // given
          complementaryCertificationCourseResultRepository.getPixSourceResultByComplementaryCertificationCourseId
            .withArgs({ complementaryCertificationCourseId: 1234 })
            .resolves(
              domainBuilder.buildComplementaryCertificationCourseResult({
                complementaryCertificationBadgeId: 99,
                complementaryCertificationCourseId: 1234,
                source: ComplementaryCertificationCourseResult.sources.PIX,
              }),
            );
          complementaryCertificationCourseResultRepository.getAllowedJuryLevelIdsByComplementaryCertificationBadgeId
            .withArgs({ complementaryCertificationBadgeId: 99 })
            .resolves([98, 99, 100]);

          // when
          const error = await catchErr(saveJuryComplementaryCertificationCourseResult)({
            complementaryCertificationCourseId: 1234,
            juryLevel: 101,
            complementaryCertificationCourseResultRepository,
          });

          // then
          expect(error).to.be.an.instanceOf(InvalidJuryLevelError);
        });
      });

      context('when the jury level is valid', function () {
        context('when the jury level is unset', function () {
          it('should remove the external ComplementaryCertificationCourseResult', async function () {
            // given
            complementaryCertificationCourseResultRepository.getPixSourceResultByComplementaryCertificationCourseId
              .withArgs({ complementaryCertificationCourseId: 1234 })
              .resolves(
                domainBuilder.buildComplementaryCertificationCourseResult({
                  complementaryCertificationBadgeId: 99,
                  complementaryCertificationCourseId: 1234,
                  source: ComplementaryCertificationCourseResult.sources.PIX,
                }),
              );

            // when
            await saveJuryComplementaryCertificationCourseResult({
              complementaryCertificationCourseId: 1234,
              juryLevel: ComplementaryCertificationCourseResult.juryOptions.UNSET,
              complementaryCertificationCourseResultRepository,
            });

            // then
            expect(
              complementaryCertificationCourseResultRepository.removeExternalJuryResult,
            ).to.have.been.calledWithExactly({ complementaryCertificationCourseId: 1234 });
          });
        });

        it('should save the result', async function () {
          // given
          complementaryCertificationCourseResultRepository.getPixSourceResultByComplementaryCertificationCourseId
            .withArgs({ complementaryCertificationCourseId: 1234 })
            .resolves(
              domainBuilder.buildComplementaryCertificationCourseResult({
                complementaryCertificationBadgeId: 99,
                complementaryCertificationCourseId: 1234,
                source: ComplementaryCertificationCourseResult.sources.PIX,
              }),
            );

          complementaryCertificationCourseResultRepository.getAllowedJuryLevelIdsByComplementaryCertificationBadgeId
            .withArgs({ complementaryCertificationBadgeId: 99 })
            .resolves([98, 99, 100]);

          // when
          await saveJuryComplementaryCertificationCourseResult({
            complementaryCertificationCourseId: 1234,
            juryLevel: 99,
            complementaryCertificationCourseResultRepository,
          });

          // then
          expect(complementaryCertificationCourseResultRepository.save).to.have.been.calledWithExactly(
            new ComplementaryCertificationCourseResult({
              complementaryCertificationBadgeId: 99,
              source: ComplementaryCertificationCourseResult.sources.EXTERNAL,
              acquired: true,
              complementaryCertificationCourseId: 1234,
            }),
          );
        });
      });
    });
  });
});
