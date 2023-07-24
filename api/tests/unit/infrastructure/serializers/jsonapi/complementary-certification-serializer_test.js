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
        { id: 1, label: 'badge 1', level: 1, otherProp: true },
        { id: 2, label: 'badge 2', level: 2, otherProp: false },
      ];
      // Fonctionne si c'est un "plain object", si on passe par un constructeur: i.e. new Badge(), il serialize tout
      // cf. json-api-serializer/serializer-utils.js l. 171j

      const currentTargetProfile = domainBuilder.buildTargetProfile({ id: 999, name: 'Target', badges });

      const complementaryCertifications = domainBuilder.buildComplementaryCertificationForAdmin({
        id: 11,
        label: 'Pix+Edu',
        key: 'EDU',
        currentTargetProfile,
      });

      // when
      const json = serializer.serializeForAdmin(complementaryCertifications);

      // then
      expect(json).to.deep.equal({
        data: {
          type: 'complementary-certifications',
          id: '11',
          attributes: {
            label: 'Pix+Edu',
            key: 'EDU',
            'current-target-profile': {
              id: 999,
              name: 'Target',
              badges: [
                { id: 1, label: 'badge 1', level: 1 },
                { id: 2, label: 'badge 2', level: 2 },
              ],
            },
          },
        },
      });
    });
  });
});
