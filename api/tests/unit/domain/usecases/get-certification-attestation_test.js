const { expect, sinon, domainBuilder, catchErr } = require('../../../test-helper');
const { NotFoundError } = require('../../../../lib/domain/errors');
const CertificationAttestation = require('../../../../lib/domain/models/CertificationAttestation');
const get = require('../../../../lib/domain/usecases/certificate/get-certification-attestation');

describe('Unit | UseCase | get', async () => {

  const userId = 2;
  const certificationId = '23';
  let dependencies;
  let certificationAttestation;
  const deliveredAt = new Date('2020-09-17T01:02:03Z');
  const cleaCertificationStatus = 'someStatus';
  let assessmentResult;
  const assessmentResultId = 1;

  beforeEach(() => {
    certificationAttestation = domainBuilder.buildCertificationAttestation({
      userId,
      id: certificationId,
      deliveredAt,
      status: 'validated',
      pixScore: 31,
      verificationCode: 'P-MYCODE',
    });
    assessmentResult = domainBuilder.buildAssessmentResult({ id: assessmentResultId, status: 'validated' });
    assessmentResult.competenceMarks = [domainBuilder.buildCompetenceMark({ assessmentResultId: assessmentResult.id })];
    const competenceTree = domainBuilder.buildCompetenceTree();
    const certificationAttestationRepository = {
      get: sinon.stub().withArgs(certificationId).resolves(certificationAttestation),
    };
    const cleaCertificationStatusRepository = {
      getCleaCertificationStatus: sinon.stub().withArgs({ id: certificationId }).resolves(cleaCertificationStatus),
    };
    const competenceTreeRepository = { get: sinon.stub().resolves(competenceTree) };
    const assessmentResultRepository = {
      findLatestByCertificationCourseIdWithCompetenceMarks: sinon.stub().withArgs(certificationId).resolves(assessmentResult),
    };

    dependencies = {
      certificationAttestationRepository,
      cleaCertificationStatusRepository,
      assessmentResultRepository,
      competenceTreeRepository,
    };
  });

  context('when the user is not owner of the certification attestation', async () => {

    it('should throw an error if user is not the owner of the certificationAttestation', async () => {
      // given
      const randomOtherUserId = 666;

      // when
      const error = await catchErr(get)({ certificationId, userId: randomOtherUserId, ...dependencies });

      // then
      expect(error).to.be.instanceOf(NotFoundError);
    });
  });

  context('when the user is owner of the certification attestation', async () => {

    it('should return the attestationPDF', async () => {
      // given
      const expectedData = new CertificationAttestation({
        'birthdate': '1992-06-12',
        'birthplace': 'Paris',
        'certificationCenter': 'L’univeristé du Pix',
        cleaCertificationStatus,
        'commentForCandidate': 'Comment for Candidate',
        'date': certificationAttestation.date,
        'deliveredAt': deliveredAt,
        'firstName': 'Jean',
        'id': '23',
        'isPublished': true,
        'lastName': 'Bon',
        'pixScore': 31,
        'resultCompetenceTree': {
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
          'id': '23-1',
        },
        'status': 'validated',
        'userId': 2,
        'verificationCode': 'P-MYCODE',
        maxReachableLevelOnCertificationDate: 5,
      });

      // when
      const result = await get({ certificationId, userId, ...dependencies });

      // then
      expect(result).to.deep.equal(expectedData);
    });
  });
});
