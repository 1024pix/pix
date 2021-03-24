const { sinon, expect, hFake, domainBuilder } = require('../../../test-helper');
const certificationReportController = require('../../../../lib/application/certification-reports/certification-report-controller');
const usecases = require('../../../../lib/domain/usecases');

describe('Unit | Controller | certification-report-controller', function() {

  describe('#saveCertificationIssueReport', function() {

    it('should return serialized certification issue report with code 201', async function() {
      // given
      const certificationReportId = 123;
      const userId = 456;
      const request = {
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
      };
      const certificationIssueReportDeserialized = {
        certificationCourseId: certificationReportId,
        category: 'someCategory',
        description: 'someDescription',
        subcategory: 'someSubcategory',
        questionNumber: 'someQuestionNumber',
      };
      const savedCertificationIssueReport = domainBuilder.buildCertificationIssueReport();
      sinon.stub(usecases, 'saveCertificationIssueReport')
        .withArgs({ userId, certificationIssueReportDTO: certificationIssueReportDeserialized })
        .resolves(savedCertificationIssueReport);

      // when
      const response = await certificationReportController.saveCertificationIssueReport(request, hFake);

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
});
