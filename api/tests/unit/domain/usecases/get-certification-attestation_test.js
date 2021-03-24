const { expect, sinon, domainBuilder, catchErr } = require('../../../test-helper');
const { NotFoundError } = require('../../../../lib/domain/errors');
const CertificationAttestation = require('../../../../lib/domain/models/CertificationAttestation');
const getCertificationAttestation = require('../../../../lib/domain/usecases/certificate/get-certification-attestation');

describe('Unit | UseCase | getCertificationAttestation', async function() {

  const userId = 2;
  const certificationId = '23';
  let dependencies;
  let certificate;
  const deliveredAt = new Date('2020-09-17T01:02:03Z');
  const cleaCertificationStatus = 'someStatus';
  let assessmentResult;
  const assessmentResultId = 1;

  beforeEach(function() {
    certificate = domainBuilder.buildPrivateCertificate({
      userId,
      id: certificationId,
      deliveredAt,
      status: 'validated',
    });
    assessmentResult = domainBuilder.buildAssessmentResult({ id: assessmentResultId, status: 'validated' });
    assessmentResult.competenceMarks = [domainBuilder.buildCompetenceMark({ assessmentResultId: assessmentResult.id })];
    const competenceTree = domainBuilder.buildCompetenceTree();
    const certificationRepository = {
      getCertificationAttestation: sinon.stub().withArgs(certificationId).resolves(certificate),
    };
    const cleaCertificationStatusRepository = {
      getCleaCertificationStatus: sinon.stub().withArgs({ id: certificationId }).resolves(cleaCertificationStatus),
    };
    const competenceTreeRepository = { get: sinon.stub().resolves(competenceTree) };
    const assessmentResultRepository = {
      findLatestByCertificationCourseIdWithCompetenceMarks: sinon.stub().withArgs(certificationId).resolves(assessmentResult),
    };

    dependencies = {
      certificationRepository,
      cleaCertificationStatusRepository,
      assessmentResultRepository,
      competenceTreeRepository,
    };
  });

  context('when the user is not owner of the certification attestation', async function() {

    it('should throw an error if user is not the owner of the certificate', async function() {
      // given
      const randomOtherUserId = 666;

      // when
      const error = await catchErr(getCertificationAttestation)({ certificationId, userId: randomOtherUserId, ...dependencies });

      // then
      expect(error).to.be.instanceOf(NotFoundError);
    });
  });

  context('when the user is owner of the certification attestation', async function() {

    it('should return the attestationPDF', async function() {
      // given
      const expectedData = new CertificationAttestation({
        'birthdate': '1992-06-12',
        'birthplace': 'Paris',
        'certificationCenter': 'L’univeristé du Pix',
        cleaCertificationStatus,
        'commentForCandidate': 'Comment for Candidate',
        'date': certificate.date,
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
        'verificationCode': 'P-BBBCCCDD',
        maxReachableLevelOnCertificationDate: 5,
      });

      // when
      const result = await getCertificationAttestation({ certificationId, userId, ...dependencies });

      // then
      expect(result).to.deep.equal(expectedData);
    });
  });
});
