const { expect, sinon, domainBuilder, catchErr } = require('../../../test-helper');
const { NotFoundError } = require('../../../../lib/domain/errors');
const getPrivateCertificate = require('../../../../lib/domain/usecases/certificate/get-private-certificate');
const ResultCompetenceTree = require('../../../../lib/domain/models/ResultCompetenceTree');

describe('Unit | UseCase | getPrivateCertificate', async () => {

  const userId = 2;
  const certificationId = '23';
  const cleaCertificationStatus = 'someStatus';
  const verificationCode = 'P-XXXXXXXX';

  const certificationRepository = {
    hasVerificationCode: sinon.stub().resolves(true),
    saveVerificationCode: sinon.stub().resolves(),
  };
  const privateCertificateRepository = {
    get: () => undefined,
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

  const verifyCertificateCodeService = {
    generateCertificateVerificationCode: sinon.stub().resolves(verificationCode),
  };

  const dependencies = {
    certificationRepository,
    privateCertificateRepository,
    cleaCertificationStatusRepository,
    assessmentResultRepository,
    competenceTreeRepository,
    verifyCertificateCodeService,
  };

  beforeEach(() => {
    privateCertificateRepository.get = sinon.stub();
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
        id: certificationId,
      });
      privateCertificateRepository.get.resolves(certificate);
    });

    it('Should throw an error if user is not the owner of the certificate', async () => {
      // given
      const error = await catchErr(getPrivateCertificate)({ certificationId, userId, ...dependencies });

      // then
      expect(error).to.be.instanceOf(NotFoundError);
    });
  });

  context('when the user is owner of the certification', async () => {

    const assessmentResultId = 123;
    let assessmentResult;
    let certificate;
    let competenceTree;

    beforeEach(() => {
      // given
      certificate = domainBuilder.buildPrivateCertificate({
        userId,
        id: certificationId,
      });
      privateCertificateRepository.get.resolves(certificate);

      assessmentResult = domainBuilder.buildAssessmentResult({ id: assessmentResultId });
      assessmentResult.competenceMarks = [domainBuilder.buildCompetenceMark()];
      assessmentResultRepository.findLatestByCertificationCourseIdWithCompetenceMarks.resolves(assessmentResult);

      competenceTree = domainBuilder.buildCompetenceTree();
      competenceTreeRepository.get.resolves(competenceTree);
    });

    it('should get the certification from the repository', async () => {
      // given
      certificationRepository.hasVerificationCode.withArgs(certificationId).resolves(true);
      const competenceTree = {
        'areas': [
          {
            'code': '1',
            'color': 'jaffa',
            'id': 'recvoGdo7z2z7pXWa',
            'name': '1. Information et données',
            'resultCompetences': [
              {
                'id': 'recsvLz0W2ShyfD63',
                'index': '1.1',
                'level': 2,
                'name': 'Mener une recherche et une veille d’information',
                'score': 13,
              },
              {
                'id': 'recNv8qhaY887jQb2',
                'index': '1.2',
                'level': -1,
                'name': 'Mener une recherche et une veille d’information',
                'score': 0,
              },
              {
                'id': 'recIkYm646lrGvLNT',
                'index': '1.3',
                'level': -1,
                'name': 'Mener une recherche et une veille d’information',
                'score': 0,
              },
            ],
            'title': 'Information et données',
          },
        ],
        'id': '23-123',
      };

      // when
      const result = await getPrivateCertificate({ certificationId, userId, ...dependencies });

      // then
      expect(result).to.deep.equal({
        ...certificate,
        resultCompetenceTree: competenceTree,
        cleaCertificationStatus,
      });
    });

    it('should save a certification code and return the filled certification', async () => {
      // given
      certificationRepository.hasVerificationCode.withArgs(certificationId).resolves(false);

      // when
      await getPrivateCertificate({ certificationId, userId, ...dependencies });

      // then
      expect(certificationRepository.saveVerificationCode).to.have.been.calledWith(certificationId, verificationCode);
    });

    it('should return the certification with the resultCompetenceTree', async () => {
      const expectedResultCompetenceTree = ResultCompetenceTree.generateTreeFromCompetenceMarks({
        competenceTree,
        competenceMarks: assessmentResult.competenceMarks,
      });
      expectedResultCompetenceTree.id = `${certificationId}-${assessmentResult.id}`;
      const result = await getPrivateCertificate({ certificationId, userId, ...dependencies });

      // then
      expect(result.resultCompetenceTree).to.be.an.instanceOf(ResultCompetenceTree);
      expect(result.resultCompetenceTree).to.deep.equal(expectedResultCompetenceTree);

    });

    it('should set the included resultCompetenceTree id to certificationID-assessmentResultId', async () => {
      const expectedId = `${certificationId}-${assessmentResult.id}`;
      const result = await getPrivateCertificate({ certificationId, userId, ...dependencies });

      // then
      expect(result.resultCompetenceTree.id).to.equal(expectedId);
    });

    it('should set cleaCertificationStatus', async () => {
      const result = await getPrivateCertificate({ certificationId, userId, ...dependencies });

      expect(result.cleaCertificationStatus).to.equal(cleaCertificationStatus);
    });
  });
});
