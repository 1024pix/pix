import { domainBuilder, expect } from '../../../../../test-helper.js';
import * as serializer from '../../../../../../src/certification/complementary-certification/infrastructure/serializers/jsonapi/complementary-certification-serializer.js';

describe('Unit | Serializer | JSONAPI | complementary-certification-serializer', function () {
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
            label: 'Pix+Edu',
            'has-external-jury': true,
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
