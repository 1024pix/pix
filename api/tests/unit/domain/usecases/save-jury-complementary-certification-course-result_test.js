import { expect, sinon, catchErr, domainBuilder } from '../../../test-helper.js';
import { saveJuryComplementaryCertificationCourseResult } from '../../../../lib/domain/usecases/save-jury-complementary-certification-course-result.js';
import { NotFoundError, InvalidJuryLevelError } from '../../../../lib/domain/errors.js';
import { ComplementaryCertificationCourseResult } from '../../../../lib/domain/models/ComplementaryCertificationCourseResult.js';

describe('Unit | UseCase | save-jury-complementary-certification-course-results', function () {
  describe('#saveJuryComplementaryCertificationCourseResult', function () {
    let complementaryCertificationCourseResultRepository;

    beforeEach(function () {
      complementaryCertificationCourseResultRepository = {
        save: sinon.stub(),
        getPixSourceResultByComplementaryCertificationCourseId: sinon.stub(),
        getAllowedJuryLevelByBadgeKey: sinon.stub(),
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
          juryLevel: 'JURY_LEVEL',
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
                partnerKey: 'KEY_1',
                complementaryCertificationCourseId: 1234,
                source: ComplementaryCertificationCourseResult.sources.PIX,
              }),
            );

          complementaryCertificationCourseResultRepository.getAllowedJuryLevelByBadgeKey
            .withArgs({ key: 'KEY_1' })
            .resolves(['KEY_1', 'KEY_2']);

          // when
          const error = await catchErr(saveJuryComplementaryCertificationCourseResult)({
            complementaryCertificationCourseId: 1234,
            juryLevel: 'KEY_3',
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
                  partnerKey: 'KEY_1',
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
                partnerKey: 'KEY_1',
                complementaryCertificationCourseId: 1234,
                source: ComplementaryCertificationCourseResult.sources.PIX,
              }),
            );

          complementaryCertificationCourseResultRepository.getAllowedJuryLevelByBadgeKey
            .withArgs({ key: 'KEY_1' })
            .resolves(['KEY_1', 'KEY_2']);

          // when
          await saveJuryComplementaryCertificationCourseResult({
            complementaryCertificationCourseId: 1234,
            juryLevel: 'KEY_2',
            complementaryCertificationCourseResultRepository,
          });

          // then
          expect(complementaryCertificationCourseResultRepository.save).to.have.been.calledWithExactly(
            new ComplementaryCertificationCourseResult({
              partnerKey: 'KEY_2',
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
