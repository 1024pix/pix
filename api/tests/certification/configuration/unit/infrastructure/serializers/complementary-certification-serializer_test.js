import * as serializer from '../../../../../../src/certification/configuration/infrastructure/serializers/complementary-certification-serializer.js';
import { expect } from '../../../../../test-helper.js';
import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';

describe('Certification | Configuration | Unit | Serializer | complementary-certification-serializer', function () {
  describe('#serialize', function () {
    it('should convert a ComplementaryCertification model object into JSON API data', function () {
      // given
      const complementaryCertifications = [
        domainBuilder.certification.shared.buildComplementaryCertification({
          id: 11,
          label: 'Pix+Edu',
          key: 'EDU',
        }),
        domainBuilder.certification.shared.buildComplementaryCertification({
          id: 22,
          label: 'Cléa Numérique',
          key: 'CLEA',
        }),
      ];

      // when
      const json = serializer.serialize(complementaryCertifications);

      // then
      expect(json).to.deep.equal({
        data: [
          {
            id: '11',
            type: 'complementary-certifications',
            attributes: {
              label: 'Pix+Edu',
              key: 'EDU',
              'has-complementary-referential': true,
            },
          },
          {
            id: '22',
            type: 'complementary-certifications',
            attributes: {
              label: 'Cléa Numérique',
              key: 'CLEA',
              'has-complementary-referential': false,
            },
          },
        ],
      });
    });
  });

  describe('#serializeForAdmin', function () {
    it('should convert a ComplementaryCertificationTargetProfileHistory model object into JSON API data', function () {
      // given
      const badges = [
        domainBuilder.buildComplementaryCertificationBadgeForAdmin({
          id: 1,
          label: 'badge 1',
          level: 1,
          imageUrl: 'http://badge-image-url.fr',
          minimumEarnedPix: 10,
        }),
        domainBuilder.buildComplementaryCertificationBadgeForAdmin({
          id: 2,
          label: 'badge 2',
          level: 2,
          imageUrl: 'http://badge-image-url.fr',
          minimumEarnedPix: 20,
        }),
      ];

      const currentTargetProfile = domainBuilder.buildTargetProfileHistoryForAdmin({
        id: 999,
        name: 'Target',
        attachedAt: new Date('2023-10-10'),
        detachedAt: null,
        badges,
      });

      const oldTargetProfile = domainBuilder.buildTargetProfileHistoryForAdmin({
        id: 333,
        name: 'Old Target',
        attachedAt: new Date('2020-10-10'),
        detachedAt: new Date('2023-10-10'),
        badges: [],
      });

      const complementaryCertificationTargetProfileHistory =
        domainBuilder.buildComplementaryCertificationTargetProfileHistory({
          id: 11,
          label: 'Pix+Edu',
          key: 'EDU',
          hasExternalJury: true,
          targetProfilesHistory: [currentTargetProfile, oldTargetProfile],
        });

      // when
      const json = serializer.serializeForAdmin(complementaryCertificationTargetProfileHistory);

      // then
      expect(json).to.deep.equal({
        data: {
          type: 'complementary-certifications',
          id: '11',
          attributes: {
            key: complementaryCertificationTargetProfileHistory.key,
            label: complementaryCertificationTargetProfileHistory.label,
            'has-external-jury': complementaryCertificationTargetProfileHistory.hasExternalJury,
            'target-profiles-history': [
              {
                id: 999,
                name: 'Target',
                attachedAt: new Date('2023-10-10'),
                detachedAt: null,
                badges: [
                  { id: 1, label: 'badge 1', level: 1, imageUrl: 'http://badge-image-url.fr', minimumEarnedPix: 10 },
                  { id: 2, label: 'badge 2', level: 2, imageUrl: 'http://badge-image-url.fr', minimumEarnedPix: 20 },
                ],
              },
              {
                id: 333,
                name: 'Old Target',
                attachedAt: new Date('2020-10-10'),
                detachedAt: new Date('2023-10-10'),
                badges: [],
              },
            ],
          },
        },
      });
    });
  });
});
