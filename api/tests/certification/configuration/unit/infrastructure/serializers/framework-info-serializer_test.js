import { expect } from 'chai';

import { VERSION_STATUSES } from '../../../../../../src/certification/configuration/domain/models/Version.js';
import * as serializer from '../../../../../../src/certification/configuration/infrastructure/serializers/framework-info-serializer.js';
import { SCOPES } from '../../../../../../src/certification/shared/domain/models/Scopes.js';
import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';

describe('Certification | Configuration | Unit | Serializer | framework-info-serializer', function () {
  describe('#serialize', function () {
    it('should serialize a frameworkInfo to JSONAPI format', function () {
      // given
      const proSanteFrameworkInfo = domainBuilder.certification.configuration
        .frameworkInfoBuilder()
        .withActiveVersion({
          id: 100,
          startDate: new Date('2022-02-02'),
          assessmentDuration: 2,
          maximumAssessmentLength: 2,
        })
        .withArchivedVersion({
          id: 200,
          startDate: new Date('2022-01-01'),
          expirationDate: new Date('2022-02-02'),
          assessmentDuration: 3,
          maximumAssessmentLength: 3,
        })
        .withParameters({ scope: SCOPES.PIX_PLUS_PRO_SANTE })
        .build();

      // when
      const result = serializer.serialize(proSanteFrameworkInfo);

      // then
      expect(result).to.deep.equal({
        data: {
          type: 'certification-frameworks',
          id: SCOPES.PIX_PLUS_PRO_SANTE,
          attributes: {
            scope: SCOPES.PIX_PLUS_PRO_SANTE,
          },
          relationships: {
            'version-summaries': {
              data: [
                { type: 'certification-version-summaries', id: '100' },
                { type: 'certification-version-summaries', id: '200' },
              ],
            },
          },
        },
        included: [
          {
            type: 'certification-version-summaries',
            id: '100',
            attributes: {
              'start-date': new Date('2022-02-02'),
              'expiration-date': null,
              'assessment-duration': 2,
              'maximum-assessment-length': 2,
              status: VERSION_STATUSES.ACTIVE,
            },
          },
          {
            type: 'certification-version-summaries',
            id: '200',
            attributes: {
              'start-date': new Date('2022-01-01'),
              'expiration-date': new Date('2022-02-02'),
              'assessment-duration': 3,
              'maximum-assessment-length': 3,
              status: VERSION_STATUSES.ARCHIVED,
            },
          },
        ],
      });
    });
  });
});
