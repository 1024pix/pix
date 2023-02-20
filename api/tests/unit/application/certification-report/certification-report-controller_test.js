import { sinon, expect, hFake, domainBuilder } from '../../../test-helper';
import certificationReportController from '../../../../lib/application/certification-reports/certification-report-controller';
import usecases from '../../../../lib/domain/usecases';

describe('Unit | Controller | certification-report-controller', function () {
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
        hFake
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
