const { expect, sinon, domainBuilder, catchErr } = require('../../../test-helper');
const { NotFoundError } = require('../../../../lib/domain/errors');
const getPrivateCertificate = require('../../../../lib/domain/usecases/certificate/get-private-certificate');
const ResultCompetenceTree = require('../../../../lib/domain/models/ResultCompetenceTree');

describe('Unit | UseCase | getPrivateCertificate', async () => {

  const userId = 2;
  const certificationId = '23';
  const cleaCertificationStatus = 'someStatus';

  const certificationRepository = {
    getByCertificationCourseId: () => undefined,
  };
  const assessmentResultRepository = {
    findLatestByCertificationCourseIdWithCompetenceMarks: () => undefined,
  };
  const competenceTreeRepository = {
    get: () => undefined,
  };
  const cleaCertificationStatusRepository = {
    getCleaCertificationStatus: () => undefined,
  };

  const dependencies = { certificationRepository,
    cleaCertificationStatusRepository,
    assessmentResultRepository,
    competenceTreeRepository };

  beforeEach(() => {
    certificationRepository.getPrivateCertificateByCertificationCourseId = sinon.stub();
    assessmentResultRepository.findLatestByCertificationCourseIdWithCompetenceMarks = sinon.stub();
    competenceTreeRepository.get = sinon.stub();
    cleaCertificationStatusRepository.getCleaCertificationStatus = sinon.stub().resolves(cleaCertificationStatus);
  });

  context('when the user is not owner of the certification', async () => {

    const randomOtherUserId = 666;
    let certificate;

    beforeEach(() => {
      // given
      certificate = domainBuilder.buildPrivateCertificate({
        userId: randomOtherUserId,
        id: certificationId
      });
      certificationRepository.getPrivateCertificateByCertificationCourseId.resolves(certificate);
    });

    it('Should throw an error if user is not the owner of the certificate', async () => {
      // given
      const error = await catchErr(getPrivateCertificate)({ certificationId, userId, ...dependencies, });

      // then
      expect(error).to.be.instanceOf(NotFoundError);
    });
  });

  context('when the user is owner of the certification', async () => {

    let assessmentResult;
    let certificate;
    let competenceTree;

    beforeEach(() => {
      // given
      certificate = domainBuilder.buildPrivateCertificate({
        userId,
        id: certificationId
      });
      certificationRepository.getPrivateCertificateByCertificationCourseId.resolves(certificate);

      assessmentResult = domainBuilder.buildAssessmentResult();
      assessmentResult.competenceMarks = [domainBuilder.buildCompetenceMark()];
      assessmentResultRepository.findLatestByCertificationCourseIdWithCompetenceMarks.resolves(assessmentResult);

      competenceTree = domainBuilder.buildCompetenceTree();
      competenceTreeRepository.get.resolves(competenceTree);
    });

    it('should get the certification from the repository', async () => {
      // then
      const result = await getPrivateCertificate({ certificationId, userId, ...dependencies, });
      expect(result).to.equal(certificate);
    });

    it('should return the certification with the resultCompetenceTree', async () => {
      const expectedResultCompetenceTree = ResultCompetenceTree.generateTreeFromCompetenceMarks({
        competenceTree,
        competenceMarks: assessmentResult.competenceMarks,
      });
      expectedResultCompetenceTree.id = `${certificationId}-${assessmentResult.id}`;
      const result = await getPrivateCertificate({ certificationId, userId, ...dependencies, });

      // then
      expect(result.resultCompetenceTree).to.be.an.instanceOf(ResultCompetenceTree);
      expect(result.resultCompetenceTree).to.deep.equal(expectedResultCompetenceTree);

    });

    it('should set the included resultCompetenceTree id to certificationID-assessmentResultId', async () => {
      const expectedId = `${certificationId}-${assessmentResult.id}`;
      const result = await getPrivateCertificate({ certificationId, userId, ...dependencies, });

      // then
      expect(result.resultCompetenceTree.id).to.equal(expectedId);
    });

    it('should set cleaCertificationStatus', async () => {
      const result = await getPrivateCertificate({ certificationId, userId, ...dependencies, });

      expect(result.cleaCertificationStatus).to.equal(cleaCertificationStatus);
    });
  });
});
