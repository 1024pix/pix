import { expect } from 'chai';
import sinon from 'sinon';

import { saveJuryComplementaryCertificationCourseResult } from '../../../../../../src/certification/session-management/domain/usecases/save-jury-complementary-certification-course-result.js';
import { ComplementaryCertificationCourseResult } from '../../../../../../src/certification/shared/domain/models/ComplementaryCertificationCourseResult.js';
import { InvalidJuryLevelError, NotFoundError } from '../../../../../../src/shared/domain/errors.js';
import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';
import { catchErr } from '../../../../../tooling/test-utils/error.js';

describe('Certification | Session-management | Unit | Domain | UseCases | save-jury-complementary-certification-course-results', function () {
  describe('#saveJuryComplementaryCertificationCourseResult', function () {
    let complementaryCertificationCourseResultRepository,
      complementaryCertificationCourseRepository,
      certificationResultAdapter;

    beforeEach(function () {
      complementaryCertificationCourseResultRepository = {
        save: sinon.stub(),
        getPixSourceResultByComplementaryCertificationCourseId: sinon.stub(),
        getAllowedJuryLevelIdsByComplementaryCertificationBadgeId: sinon.stub(),
        removeExternalJuryResult: sinon.stub(),
      };
      complementaryCertificationCourseRepository = {
        getCertificationCourseId: sinon.stub(),
      };
      complementaryCertificationCourseRepository.getCertificationCourseId
        .withArgs({ complementaryCertificationCourseId: 1234 })
        .resolves(5678);
      certificationResultAdapter = {
        updateEduV2ExternalJuryResult: sinon.stub().resolves(),
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
          it('should remove the external ComplementaryCertificationCourseResult and reset the certification result', async function () {
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
              complementaryCertificationCourseRepository,
              certificationResultAdapter,
            });

            // then
            expect(
              complementaryCertificationCourseResultRepository.removeExternalJuryResult,
            ).to.have.been.calledWithExactly({ complementaryCertificationCourseId: 1234 });
            expect(certificationResultAdapter.updateEduV2ExternalJuryResult).to.have.been.calledOnceWithExactly({
              certificationCourseId: 5678,
              v2EduVoletExterneBadgeId: null,
              v2EduVoletExterneAcquired: null,
            });
          });
        });

        it('should save the result and update the certification result', async function () {
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
            complementaryCertificationCourseRepository,
            certificationResultAdapter,
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
          expect(certificationResultAdapter.updateEduV2ExternalJuryResult).to.have.been.calledOnceWithExactly({
            certificationCourseId: 5678,
            v2EduVoletExterneBadgeId: 99,
            v2EduVoletExterneAcquired: true,
          });
        });
      });
    });
  });
});
