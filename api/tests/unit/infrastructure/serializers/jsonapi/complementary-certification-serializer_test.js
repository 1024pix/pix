import { domainBuilder, expect } from '../../../../test-helper.js';
import * as serializer from '../../../../../lib/infrastructure/serializers/jsonapi/complementary-certification-serializer.js';

describe('Unit | Serializer | JSONAPI | complementary-certification-serializer', function () {
  describe('#serialize', function () {
    it('should convert a ComplementaryCertification model object into JSON API data', function () {
      // given
      const complementaryCertifications = [
        domainBuilder.buildComplementaryCertification({
          id: 11,
          label: 'Pix+Edu',
          key: 'EDU',
        }),
        domainBuilder.buildComplementaryCertification({
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
            },
          },
          {
            id: '22',
            type: 'complementary-certifications',
            attributes: {
              label: 'Cléa Numérique',
              key: 'CLEA',
            },
          },
        ],
      });
    });
  });

  describe('#serializeForAdmin', function () {
    it('should convert a ComplementaryCertification model object into JSON API data', function () {
      // given
      const badges = [
        { id: 1, label: 'badge 1', level: 1 },
        { id: 2, label: 'badge 2', level: 2 },
      ];

      const currentTargetProfile = { id: 999, name: 'Target', attachedAt: new Date('2023-10-10') };

      const oldTargetProfile = { id: 333, name: 'Old Target', attachedAt: new Date('2020-10-10') };

      const complementaryCertification = domainBuilder.buildComplementaryCertificationForAdmin({
        id: 11,
        label: 'Pix+Edu',
        key: 'EDU',
        currentTargetProfileBadges: badges,
        targetProfilesLog: [currentTargetProfile, oldTargetProfile],
      });

      // when
      const json = serializer.serializeForAdmin(complementaryCertification);

      // then
      expect(json).to.deep.equal({
        data: {
          type: 'complementary-certifications',
          id: '11',
          attributes: {
            label: 'Pix+Edu',
            key: 'EDU',
            'target-profiles-log': [
              { id: 999, name: 'Target', attachedAt: new Date('2023-10-10') },
              { id: 333, name: 'Old Target', attachedAt: new Date('2020-10-10') },
            ],
            'current-target-profile-badges': [
              { id: 1, label: 'badge 1', level: 1 },
              { id: 2, label: 'badge 2', level: 2 },
            ],
          },
        },
      });
    });
  });
});
