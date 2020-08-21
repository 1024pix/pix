const { expect, sinon, domainBuilder } = require('../../../test-helper');
const { NotFoundError } = require('../../../../lib/domain/errors');
const getPrivateCertificate = require('../../../../lib/domain/usecases/certificate/get-private-certificate');
const ResultCompetenceTree = require('../../../../lib/domain/models/ResultCompetenceTree');

describe('Unit | UseCase | getPrivateCertificate', () => {

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

  beforeEach(() => {
    certificationRepository.getPrivateCertificateByCertificationCourseId = sinon.stub();
    assessmentResultRepository.findLatestByCertificationCourseIdWithCompetenceMarks = sinon.stub();
    competenceTreeRepository.get = sinon.stub();
    cleaCertificationStatusRepository.getCleaCertificationStatus = sinon.stub().resolves(cleaCertificationStatus);
  });

  context('when the user is not owner of the certification', () => {

    const randomOtherUserId = 666;
    let certificate;
    let promise;

    beforeEach(() => {
      // given
      certificate = domainBuilder.buildPrivateCertificate({
        userId: randomOtherUserId,
        id: certificationId
      });
      certificationRepository.getPrivateCertificateByCertificationCourseId.resolves(certificate);

      // when
      promise = getPrivateCertificate({
        certificationId,
        certificationRepository,
        cleaCertificationStatusRepository,
        assessmentResultRepository,
        competenceTreeRepository,
        userId,
      });
    });

    it('should get the certification from the repository', () => {
      // then
      return promise.catch(() => {
        expect(certificationRepository.getPrivateCertificateByCertificationCourseId).to.have.been.calledWith({ id: certificationId });
      });
    });

    it('should throw an notFound error', () => {
      // then
      return expect(promise).to.be.rejectedWith(NotFoundError);
    });
  });

  context('when the user is owner of the certification', () => {

    let assessmentResult;
    let certificate;
    let competenceTree;
    let promise;

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

      // when
      promise = getPrivateCertificate({
        certificationId,
        certificationRepository,
        cleaCertificationStatusRepository,
        assessmentResultRepository,
        competenceTreeRepository,
        userId,
      });
    });

    it('should get the certification from the repository', () => {
      // then
      return promise.then(() => {
        expect(certificationRepository.getPrivateCertificateByCertificationCourseId).to.have.been.calledWith({ id: certificationId });
      });
    });

    it('should return the certification returned from the repository', () => {
      // then
      return promise.then((certification) => {
        expect(certification).to.equal(certification);
      });
    });

    it('should return the certification with the resultCompetenceTree', () => {
      const expectedResultCompetenceTree = ResultCompetenceTree.generateTreeFromCompetenceMarks({
        competenceTree,
        competenceMarks: assessmentResult.competenceMarks,
      });
      expectedResultCompetenceTree.id = `${certificationId}-${assessmentResult.id}`;

      // then
      return promise.then((certification) => {
        expect(certification.resultCompetenceTree).to.be.an.instanceOf(ResultCompetenceTree);
        expect(certification.resultCompetenceTree).to.deep.equal(expectedResultCompetenceTree);
      });
    });

    it('should set the included resultCompetenceTree id to certificationID-assessmentResultId', () => {
      const expectedId = `${certificationId}-${assessmentResult.id}`;

      // then
      return promise.then((certification) => {
        expect(certification.resultCompetenceTree.id).to.equal(expectedId);
      });
    });

    it('should set cleaCertificationStatus', () => {
      return promise.then((certification) => {
        expect(certification.cleaCertificationStatus).to.equal(cleaCertificationStatus);
      });
    });
  });
});
