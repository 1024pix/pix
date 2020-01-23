const { databaseBuilder, expect } = require('../../../test-helper');
const CertificationReport = require('../../../../lib/domain/models/CertificationReport');
const certificationReportRepository = require('../../../../lib/infrastructure/repositories/certification-report-repository');

describe('Integration | Repository | CertificationCandidate', function() {

  describe('#findBySessionIdWithCertificationCourse', () => {
    let sessionId;
    let certificationCourseId1;
    let certificationCourseId2;

    beforeEach(async () => {
      // given
      sessionId = databaseBuilder.factory.buildSession().id;
      const anotherSessionId = databaseBuilder.factory.buildSession().id;
      const userId1 = databaseBuilder.factory.buildUser().id;
      const userId2 = databaseBuilder.factory.buildUser().id;
      // In sessio
      certificationCourseId1 = databaseBuilder.factory.buildCertificationCourse({ lastName: 'Jackson', firstName: 'Michaele', sessionId, userId1 }).id;
      certificationCourseId2 = databaseBuilder.factory.buildCertificationCourse({ lastName: 'Jackson', firstName: 'Janet', sessionId, userId2 }).id;
      // In other session
      databaseBuilder.factory.buildCertificationCourse({ lastName: 'Jackson', firstName: 'Michaele', anotherSessionId, userId1 }).id;

      await databaseBuilder.commit();
    });

    context('when there are some certification reports with the given session id', function() {

      it('should fetch, alphabetically sorted, the certification reports with a specific session ID', async () => {
        // when
        const certificationReports = await certificationReportRepository.findBySessionId(sessionId);

        // then
        expect(certificationReports).to.deep.equal([
          {
            id: CertificationReport.idFromCertificationCourseId(certificationCourseId2),
            certificationCourseId: certificationCourseId2,
            firstName: 'Janet',
            lastName: 'Jackson',
            hasSeenEndTestScreen: false,
            examinerComment: null,
          },
          {
            id: CertificationReport.idFromCertificationCourseId(certificationCourseId1),
            certificationCourseId: certificationCourseId1,
            firstName: 'Michaele',
            lastName: 'Jackson',
            hasSeenEndTestScreen: false,
            examinerComment: null,
          },
        ]);
      });
    });

    context('when there is no certification reports with the given session ID', function() {

      it('should return an empty array', async () => {
        // when
        const certificationReports = await certificationReportRepository.findBySessionId(-1);

        // then
        expect(certificationReports).to.deep.equal([]);
      });

    });

  });

});
