const { expect, sinon } = require('../../../test-helper');
const { UserNotAuthorizedToAccessEntity } = require('../../../../lib/domain/errors');
const factory = require('../../../factory');
const usecases = require('../../../../lib/domain/usecases');
const ResultCompetenceTree = require('../../../../lib/domain/models/ResultCompetenceTree');

describe('Unit | UseCase | getUserCertificatiWithResultTree', () => {

  const userId = '2';
  const certificationId = '23';

  const assessmentRepository = {
    getByCertificationCourseId: () => undefined,
  };
  const certificationRepository = {
    getCertification: () => undefined,
  };
  const competenceMarksRepository = {
    findByAssessmentResultId: () => undefined,
  };
  const competenceTreeRepository = {
    get: () => undefined,
  };

  beforeEach(() => {
    assessmentRepository.getByCertificationCourseId = sinon.stub();
    certificationRepository.getCertification = sinon.stub();
    competenceMarksRepository.findByAssessmentResultId = sinon.stub();
    competenceTreeRepository.get = sinon.stub();
  });

  context('when the user is not owner of the certification', () => {

    const randomOtherUserId = 666;
    let certification;
    let promise;

    beforeEach(() => {
      // given
      certification = factory.buildCertification({ userId: randomOtherUserId });
      certificationRepository.getCertification.resolves(certification);

      // when
      promise = usecases.getUserCertificationWithResultTree({
        assessmentRepository,
        certificationId,
        certificationRepository,
        competenceMarksRepository,
        competenceTreeRepository,
        userId,
      });
    });

    it('should get the certification from the repository', () => {
      // then
      return promise.catch(() => {
        expect(certificationRepository.getCertification).to.have.been.calledWith({ id: certificationId });
      });
    });

    it('should throw an unauthorized error', () => {
      // then
      return expect(promise).to.be.rejectedWith(UserNotAuthorizedToAccessEntity);
    });
  });

  context('when the user is owner of the certification', () => {

    let assessment;
    let certification;
    let competenceMarks;
    let competenceTree;
    let promise;

    beforeEach(() => {
      // given
      assessment = factory.buildAssessment();
      assessmentRepository.getByCertificationCourseId.resolves(assessment);

      certification = factory.buildCertification({ userId: parseInt(userId, 10) });
      certificationRepository.getCertification.resolves(certification);

      competenceMarks = [factory.buildCompetenceMark()];
      competenceMarksRepository.findByAssessmentResultId.resolves(competenceMarks);

      competenceTree = factory.buildCompetenceTree();
      competenceTreeRepository.get.resolves(competenceTree);

      // when
      promise = usecases.getUserCertificationWithResultTree({
        assessmentRepository,
        certificationId,
        certificationRepository,
        competenceMarksRepository,
        competenceTreeRepository,
        userId,
      });
    });

    it('should get the certification from the repository', () => {
      // then
      return promise.then(() => {
        expect(certificationRepository.getCertification).to.have.been.calledWith({ id: certificationId });
      });
    });

    it('should get the assessment from the repository', () => {
      // then
      return promise.then(() => {
        expect(assessmentRepository.getByCertificationCourseId).to.have.been.calledWith(certificationId);
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
        competenceMarks,
      });
      expectedResultCompetenceTree.id = `${certificationId}-${assessment.getLastAssessmentResult().id}`;

      // then
      return promise.then((certification) => {
        expect(certification.resultCompetenceTree).to.be.an.instanceOf(ResultCompetenceTree);
        expect(certification.resultCompetenceTree).to.deep.equal(expectedResultCompetenceTree);
      });
    });

    it('should set the included resultCompetenceTree id to certificationID-assessmentResultId', () => {
      const expectedId = `${certificationId}-${assessment.getLastAssessmentResult().id}`;

      // then
      return promise.then((certification) => {
        expect(certification.resultCompetenceTree.id).to.equal(expectedId);
      });
    });
  });
});
