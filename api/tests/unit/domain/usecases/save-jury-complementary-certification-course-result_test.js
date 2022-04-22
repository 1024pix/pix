const { expect, sinon, catchErr, domainBuilder } = require('../../../test-helper');

const saveJuryComplementaryCertificationCourseResult = require('../../../../lib/domain/usecases/save-jury-complementary-certification-course-result');
const { NotFoundError } = require('../../../../lib/domain/errors');
const ComplementaryCertificationCourseResult = require('../../../../lib/domain/models/ComplementaryCertificationCourseResult');
const Badge = require('../../../../lib/domain/models/Badge');

describe('Unit | UseCase | save-jury-complementary-certification-course-results', function () {
  describe('#saveJuryComplementaryCertificationCourseResult', function () {
    let complementaryCertificationCourseResultRepository;

    beforeEach(function () {
      complementaryCertificationCourseResultRepository = {
        save: sinon.stub(),
        getFromComplementaryCertificationCourseId: sinon.stub(),
      };
    });

    context('when no Pix Edu complementaryCertificationCourseResult is found', function () {
      it('should throw an error', async function () {
        // given
        const complementaryCertificationCourseId = 12345;
        const juryLevel = 'juryLevel';
        complementaryCertificationCourseResultRepository.getFromComplementaryCertificationCourseId
          .withArgs({ complementaryCertificationCourseId })
          .resolves([]);

        // when
        const error = await catchErr(saveJuryComplementaryCertificationCourseResult)({
          complementaryCertificationCourseId,
          juryLevel,
          complementaryCertificationCourseResultRepository,
        });

        // then
        expect(error).to.be.instanceOf(NotFoundError);
        expect(error.message).to.be.equal("Aucun résultat Pix+ Edu n'a été trouvé pour cette certification.");
      });
    });

    context('when no Pix Edu complementaryCertificationCourseResult from PIX source is found', function () {
      it('should throw an error', async function () {
        // given
        const complementaryCertificationCourseId = 12345;
        const juryLevel = Badge.keys.PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_AVANCE;
        const pixEduComplementaryCertificationCourseResult = domainBuilder.buildComplementaryCertificationCourseResult({
          juryLevel,
          source: ComplementaryCertificationCourseResult.sources.EXTERNAL,
        });
        complementaryCertificationCourseResultRepository.getFromComplementaryCertificationCourseId
          .withArgs({ complementaryCertificationCourseId })
          .resolves([pixEduComplementaryCertificationCourseResult]);

        // when
        const error = await catchErr(saveJuryComplementaryCertificationCourseResult)({
          complementaryCertificationCourseId,
          juryLevel,
          complementaryCertificationCourseResultRepository,
        });

        // then
        expect(error).to.be.instanceOf(NotFoundError);
        expect(error.message).to.be.equal("Aucun résultat Pix+ Edu n'a été trouvé pour cette certification.");
      });
    });

    context('when a Pix Edu complementaryCertificationCourseResult from PIX source is found', function () {
      it('should save the result', async function () {
        // given
        const complementaryCertificationCourseId = 1234;
        const partnerKey = Badge.keys.PIX_EDU_FORMATION_CONTINUE_2ND_DEGRE_AVANCE;

        const pixEduComplementaryCertificationCourseResult = domainBuilder.buildComplementaryCertificationCourseResult({
          partnerKey,
          complementaryCertificationCourseId,
          source: ComplementaryCertificationCourseResult.sources.EXTERNAL,
        });
        const pixEduAndFromPixSourceComplementaryCertificationCourseResult =
          domainBuilder.buildComplementaryCertificationCourseResult({
            partnerKey,
            complementaryCertificationCourseId,
            source: ComplementaryCertificationCourseResult.sources.PIX,
          });
        complementaryCertificationCourseResultRepository.getFromComplementaryCertificationCourseId
          .withArgs({ complementaryCertificationCourseId })
          .resolves([
            pixEduComplementaryCertificationCourseResult,
            pixEduAndFromPixSourceComplementaryCertificationCourseResult,
          ]);

        // when
        await saveJuryComplementaryCertificationCourseResult({
          complementaryCertificationCourseId,
          juryLevel: partnerKey,
          complementaryCertificationCourseResultRepository,
        });

        // then
        expect(complementaryCertificationCourseResultRepository.save).to.have.been.calledWith(
          new ComplementaryCertificationCourseResult({
            partnerKey,
            source: ComplementaryCertificationCourseResult.sources.EXTERNAL,
            acquired: true,
            complementaryCertificationCourseId:
              pixEduAndFromPixSourceComplementaryCertificationCourseResult.complementaryCertificationCourseId,
          })
        );
      });
    });
  });
});
