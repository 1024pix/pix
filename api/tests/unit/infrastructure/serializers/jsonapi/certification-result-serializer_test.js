const { expect } = require('../../../../test-helper');
const serializer = require('../../../../../lib/infrastructure/serializers/jsonapi/certification-result-serializer');
const CertificationResult = require('../../../../../lib/domain/models/CertificationResult');

describe('Unit | Serializer | JSONAPI | certification-result-serializer', function() {

  describe('#serialize', function() {

    it('should serialize results of a certification', function() {
      // given
      const certificationResult = new CertificationResult({
        id: 1,
        firstName: 'Guy-Manuel',
        lastName: 'De Homem Christo',
        birthdate: '1974-02-08',
        birthplace: 'Neuilly-Sur-Seine',
        externalId: 'Grammys2016',
        createdAt: new Date('2017-02-20T01:02:03Z'),
        completedAt: new Date('2017-02-20T01:02:03Z'),
        resultCreatedAt: new Date('2017-02-20T01:02:03Z'),
        isPublished: true,
        isV2Certification: true,
        pixScore: 30,
        status: 'validated',
        emitter: 'PIX_ALGO',
        commentForCandidate: null,
        commentForJury: 'Salut',
        commentForOrganization: '',
        examinerComment: 'un commentaire',
        hasSeenEndTestScreen: true,
        cleaCertificationStatus: 'acquired',
        competencesWithMark: [],
        juryId: 21,
        sessionId: 22,
        assessmentId: 99
      });

      // when
      const serializedCertificationCourse = serializer.serialize(certificationResult);

      // then
      expect(serializedCertificationCourse).to.deep.equal({
        data: {
          id: certificationResult.id.toString(),
          type: 'results',
          attributes: {
            birthdate: certificationResult.birthdate,
            birthplace: certificationResult.birthplace,
            'comment-for-candidate': certificationResult.commentForCandidate,
            'comment-for-jury': certificationResult.commentForJury,
            'comment-for-organization': certificationResult.commentForOrganization,
            'examiner-comment': 'un commentaire',
            'has-seen-end-test-screen': true,
            'clea-certification-status': certificationResult.cleaCertificationStatus,
            'competences-with-mark': certificationResult.competencesWithMark,
            'completed-at': new Date('2017-02-20T01:02:03Z'),
            'created-at': new Date('2017-02-20T01:02:03Z'),
            emitter: certificationResult.emitter,
            'external-id': certificationResult.externalId,
            'first-name': certificationResult.firstName,
            'is-published': certificationResult.isPublished,
            'is-v2-certification': certificationResult.isV2Certification,
            'jury-id': certificationResult.juryId,
            'last-name': certificationResult.lastName,
            'pix-score': certificationResult.pixScore,
            'result-created-at': new Date('2017-02-20T01:02:03Z'),
            'session-id': certificationResult.sessionId,
            'assessment-id': certificationResult.assessmentId,
            status: certificationResult.status,
          }
        }
      });
    });
  });
});
