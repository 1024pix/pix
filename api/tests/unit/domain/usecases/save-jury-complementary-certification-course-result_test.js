const { expect, sinon, catchErr, domainBuilder } = require('../../../test-helper');

const saveJuryComplementaryCertificationCourseResult = require('../../../../lib/domain/usecases/save-jury-complementary-certification-course-result');
const { NotFoundError } = require('../../../../lib/domain/errors');
const ComplementaryCertificationCourseResult = require('../../../../lib/domain/models/ComplementaryCertificationCourseResult');

describe('Unit | UseCase | save-jury-complementary-certification-course-results', function () {
  describe('#saveJuryComplementaryCertificationCourseResult', function () {
    let complementaryCertificationCourseResultRepository;

    beforeEach(function () {
      complementaryCertificationCourseResultRepository = {
        save: sinon.stub(),
        getPixSourceResultByComplementaryCertificationCourseId: sinon.stub(),
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
          "Aucun résultat de certification Pix n'a été trouvé pour cette certification complémentaire."
        );
      });
    });

    context('when a ComplementaryCertificationCourseResult from PIX source is found', function () {
      it('should save the result', async function () {
        // given
        complementaryCertificationCourseResultRepository.getPixSourceResultByComplementaryCertificationCourseId
          .withArgs({ complementaryCertificationCourseId: 1234 })
          .resolves(
            domainBuilder.buildComplementaryCertificationCourseResult({
              partnerKey: 'KEY_1',
              complementaryCertificationCourseId: 1234,
              source: ComplementaryCertificationCourseResult.sources.PIX,
            })
          );

        // when
        await saveJuryComplementaryCertificationCourseResult({
          complementaryCertificationCourseId: 1234,
          juryLevel: 'KEY_2',
          complementaryCertificationCourseResultRepository,
        });

        // then
        expect(complementaryCertificationCourseResultRepository.save).to.have.been.calledWith(
          new ComplementaryCertificationCourseResult({
            partnerKey: 'KEY_2',
            source: ComplementaryCertificationCourseResult.sources.EXTERNAL,
            acquired: true,
            complementaryCertificationCourseId: 1234,
          })
        );
      });
    });
  });
});
