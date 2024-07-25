import { certificationReportController } from '../../../../../src/certification/session-management/application/certification-report-controller.js';
import { usecases } from '../../../../../src/certification/session-management/domain/usecases/index.js';
import { domainBuilder, expect, hFake, sinon } from '../../../../test-helper.js';

describe('Certification | Session Management | Unit | Application | Controller | Certification Report', function () {
  describe('#saveCertificationIssueReport', function () {
    it('should return serialized certification issue report with code 201', async function () {
      // given
      const certificationReportId = 123;
      const userId = 456;
      const certificationIssueReportDeserialized = {
        certificationCourseId: certificationReportId,
        category: 'someCategory',
        description: 'someDescription',
        subcategory: 'someSubcategory',
        questionNumber: 'someQuestionNumber',
      };
      const savedCertificationIssueReport = domainBuilder.buildCertificationIssueReport();
      sinon
        .stub(usecases, 'saveCertificationIssueReport')
        .withArgs({ certificationIssueReportDTO: certificationIssueReportDeserialized })
        .resolves(savedCertificationIssueReport);

      // when
      const response = await certificationReportController.saveCertificationIssueReport(
        {
          params: {
            id: certificationReportId,
          },
          auth: {
            credentials: { userId },
          },
          payload: {
            data: {
              attributes: {
                category: 'someCategory',
                description: 'someDescription',
                subcategory: 'someSubcategory',
                'question-number': 'someQuestionNumber',
              },
            },
          },
        },
        hFake,
      );

      // then
      expect(response.source.data).to.deep.equal({
        type: 'certification-issue-reports',
        id: savedCertificationIssueReport.id.toString(),
        attributes: {
          category: savedCertificationIssueReport.category,
          description: savedCertificationIssueReport.description,
          subcategory: savedCertificationIssueReport.subcategory,
          'question-number': savedCertificationIssueReport.questionNumber,
        },
      });
      expect(response.statusCode).to.equal(201);
    });
  });

  describe('#abort', function () {
    it('should return a 200 status code', async function () {
      // given
      const certificationCourseId = 123;
      const request = {
        params: {
          id: certificationCourseId,
        },
        payload: {
          data: {
            attributes: {
              reason: 'technical',
            },
          },
        },
      };

      sinon
        .stub(usecases, 'abortCertificationCourse')
        .withArgs({ certificationCourseId, abortReason: 'technical' })
        .resolves();

      // when
      const response = await certificationReportController.abort(request, hFake);

      // then
      expect(response.statusCode).to.equal(200);
    });
  });
});
