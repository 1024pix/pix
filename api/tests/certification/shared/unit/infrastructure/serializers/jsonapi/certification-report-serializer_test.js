import {
  CertificationIssueReportCategory,
  CertificationIssueReportSubcategories,
} from '../../../../../../../src/certification/shared/domain/models/CertificationIssueReportCategory.js';
import { certificationReportSerializer } from '../../../../../../../src/certification/shared/infrastructure/serializers/jsonapi/certification-report-serializer.js';
import { expect } from '../../../../../../test-helper.js';
import { domainBuilder } from '../../../../../../tooling/domain-builder/domain-builder.js';

describe('Unit | Serializer | JSONAPI | certification-report-serializer', function () {
  describe('#serialize()', function () {
    it('should convert a CertificationReport model object into JSON API data', function () {
      // given
      const certificationReport = domainBuilder.buildCertificationReport({
        certificationCourseId: 123,
        firstName: 'Joe',
        lastName: 'Lerigolo',
        isCompleted: false,
        examinerComment: 'Certification non terminée...',
        abortReason: 'technical',
        certificationIssueReports: [],
      });
      const jsonApiData = {
        data: {
          type: 'certification-reports',
          id: certificationReport.id.toString(),
          attributes: {
            'certification-course-id': 123,
            'first-name': 'Joe',
            'last-name': 'Lerigolo',
            'is-completed': false,
            'examiner-comment': 'Certification non terminée...',
            'abort-reason': 'technical',
          },
          relationships: {
            'certification-issue-reports': {
              data: [],
            },
          },
        },
      };

      // when
      const jsonApi = certificationReportSerializer.serialize(certificationReport);

      // then
      expect(jsonApi).to.deep.equal(jsonApiData);
    });

    it('should include CertificationIssueReports if any into JSON API data', function () {
      // given
      const certificationReport = domainBuilder.buildCertificationReport({
        id: 123,
        certificationIssueReports: [
          domainBuilder.buildCertificationIssueReport({
            category: CertificationIssueReportCategory.IN_CHALLENGE,
            description: 'Pas content',
            subcategory: CertificationIssueReportSubcategories.EMBED_NOT_WORKING,
            questionNumber: '6',
          }),
        ],
      });

      const jsonApiDataRelationship = {
        data: [
          {
            type: 'certificationIssueReports',
            id: '123',
          },
        ],
      };
      const jsonApiDataIncluded = [
        {
          type: 'certificationIssueReports',
          id: '123',
          attributes: {
            category: CertificationIssueReportCategory.IN_CHALLENGE,
            description: 'Pas content',
            subcategory: CertificationIssueReportSubcategories.EMBED_NOT_WORKING,
            'question-number': '6',
          },
        },
      ];

      // when
      const jsonApi = certificationReportSerializer.serialize(certificationReport);

      // then
      expect(jsonApi.included).to.deep.equal(jsonApiDataIncluded);
      expect(jsonApi.data.relationships['certification-issue-reports']).to.deep.equal(jsonApiDataRelationship);
    });
  });

  describe('#deserialize()', function () {
    it('should convert a JSON API data into a CertificationReport', async function () {
      const certificationReport = domainBuilder.buildCertificationReport({
        certificationCourseId: 123,
        firstName: 'Joe',
        lastName: 'Lerigolo',
        isCompleted: true,
        examinerComment: 'Trop bien.',
        abortReason: null,
        certificationIssueReports: [],
      });
      const jsonApiData = {
        data: {
          type: 'certification-reports',
          id: certificationReport.id.toString(),
          attributes: {
            'certification-course-id': 123,
            'first-name': 'Joe',
            'last-name': 'Lerigolo',
            'is-completed': true,
            'examiner-comment': 'Trop bien.',
            'abort-reason': null,
          },
        },
      };

      // when
      const deserializedCertificationReport = await certificationReportSerializer.deserialize(jsonApiData);

      // then
      expect(deserializedCertificationReport).to.deep.equal(certificationReport);
    });
  });
});
