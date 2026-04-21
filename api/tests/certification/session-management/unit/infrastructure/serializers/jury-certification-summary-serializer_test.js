import * as serializer from '../../../../../../src/certification/session-management/infrastructure/serializers/jury-certification-summary-serializer.js';
import { AlgorithmEngineVersion } from '../../../../../../src/certification/shared/domain/models/AlgorithmEngineVersion.js';
import { Frameworks } from '../../../../../../src/certification/shared/domain/models/Frameworks.js';
import { getI18n } from '../../../../../../src/shared/infrastructure/i18n/i18n.js';

import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';

describe('Unit | Serializer | JSONAPI | jury-certification-summary-serializer', function () {
  describe('#serialize()', function () {
    let translate;
    let modelJuryCertifSummary;
    let expectedJsonApi;

    it('should convert a JuryCertificationSummary model object into JSON API data', function () {
      // given
      translate = getI18n().__;
      const issueReport = domainBuilder.buildCertificationIssueReport.impactful({
        certificationCourseId: 1,
        description: 'someComment',
        resolvedAt: null,
      });
      modelJuryCertifSummary = domainBuilder.certification.sessionManagement.buildJuryCertificationSummary({
        id: 1,
        firstName: 'someFirstName',
        lastName: 'someLastName',
        status: 'someStatus',
        pixScore: 123,
        algorithmVersion: AlgorithmEngineVersion.V3,
        reachedMeshIndex: 2,
        createdAt: new Date('2020-04-20T04:05:06Z'),
        completedAt: new Date('2020-04-25T04:05:06Z'),
        isPublished: true,
        certificationIssueReports: [issueReport],
        isFlaggedAborted: false,
        certificationFramework: Frameworks.DROIT,
        lastAnswerAt: new Date('2020-04-25T04:05:06Z'),
      });

      expectedJsonApi = {
        data: {
          type: 'jury-certification-summaries',
          id: modelJuryCertifSummary.id.toString(),
          attributes: {
            'first-name': modelJuryCertifSummary.firstName,
            'last-name': modelJuryCertifSummary.lastName,
            status: modelJuryCertifSummary.status,
            'pix-score': modelJuryCertifSummary.pixScore,
            'algorithm-version': modelJuryCertifSummary.algorithmVersion,
            'reached-result-key': modelJuryCertifSummary.reachedResultKey,
            'created-at': modelJuryCertifSummary.createdAt,
            'completed-at': modelJuryCertifSummary.completedAt,
            'is-published': modelJuryCertifSummary.isPublished,
            'examiner-comment': 'someComment',
            'number-of-certification-issue-reports': 1,
            'number-of-certification-issue-reports-with-required-action': 1,
            'is-flagged-aborted': false,
            'certification-framework': Frameworks.DROIT,
            'last-answer-at': modelJuryCertifSummary.lastAnswerAt,
          },
        },
        meta: {},
      };

      // when
      const meta = {};
      const json = serializer.serialize(modelJuryCertifSummary, meta, { translate });

      // then
      expect(json).to.deep.equal(expectedJsonApi);
    });
  });
});
