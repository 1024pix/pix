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
        .buildFrameworkInfo()
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
        .withTargetProfile({
          id: 13,
          name: 'Super Santé profil cible',
          badgesData: [
            {
              id: 90,
              label: 'badge Santé 1',
              level: 8,
              imageUrl: 'http://dans-ton-badge.com',
              minimumEarnedPix: 5,
              createdAt: new Date('2024-06-06'),
              detachedAt: null,
            },
            {
              id: 91,
              label: 'badge Santé 2',
              level: 3,
              imageUrl: 'http://dans-ton-badge-2.com',
              minimumEarnedPix: 11,
              createdAt: new Date('2022-06-06'),
              detachedAt: new Date('2023-01-01'),
            },
          ],
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
            'target-profile-summaries': {
              data: [
                {
                  type: 'certification-target-profile-summaries',
                  id: '13',
                },
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
          {
            type: 'certification-badge-summaries',
            id: '90',
            attributes: {
              'created-at': new Date('2024-06-06'),
              'detached-at': null,
              'image-url': 'http://dans-ton-badge.com',
              label: 'badge Santé 1',
              level: 8,
              'minimum-earned-pix': 5,
            },
          },
          {
            type: 'certification-badge-summaries',
            id: '91',
            attributes: {
              'created-at': new Date('2022-06-06'),
              'detached-at': new Date('2023-01-01'),
              'image-url': 'http://dans-ton-badge-2.com',
              label: 'badge Santé 2',
              level: 3,
              'minimum-earned-pix': 11,
            },
          },
          {
            type: 'certification-target-profile-summaries',
            id: '13',
            attributes: {
              name: 'Super Santé profil cible',
            },
            relationships: {
              'badge-summaries': {
                data: [
                  {
                    type: 'certification-badge-summaries',
                    id: '90',
                  },
                  {
                    type: 'certification-badge-summaries',
                    id: '91',
                  },
                ],
              },
            },
          },
        ],
      });
    });
  });
});
