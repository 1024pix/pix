import { enrolmentRepositories } from '../../../../../../src/certification/enrolment/infrastructure/repositories/index.js';
import { databaseBuilder, domainBuilder, expect } from '../../../../../test-helper.js';

describe('Certification | Enrolment | Integration | Repository | Complementary certification badge', function () {
  describe('#findAll', function () {
    describe('when there are complementary certification badges', function () {
      it('should return all complementary certifications ordered by id', async function () {
        // given
        const complementaryCertificationId1 = databaseBuilder.factory.buildComplementaryCertification({
          key: 'badge3_key',
        }).id;
        const badge3Data = databaseBuilder.factory.buildComplementaryCertificationBadge({
          id: 3,
          label: 'badge3_label',
          imageUrl: 'badge3_imageUrl',
          complementaryCertificationId: complementaryCertificationId1,
        });
        const complementaryCertificationId2 = databaseBuilder.factory.buildComplementaryCertification({
          key: 'badge1_key',
        }).id;
        const badge1Data = databaseBuilder.factory.buildComplementaryCertificationBadge({
          id: 1,
          key: 'badge1_key',
          label: 'badge1_label',
          imageUrl: 'badge1_imageUrl',
          complementaryCertificationId: complementaryCertificationId2,
        });
        const complementaryCertificationId3 = databaseBuilder.factory.buildComplementaryCertification({
          key: 'badge2_key',
        }).id;
        const badge2Data = databaseBuilder.factory.buildComplementaryCertificationBadge({
          id: 2,
          key: 'badge2_key',
          label: 'badge2_label',
          imageUrl: 'badge2_imageUrl',
          complementaryCertificationId: complementaryCertificationId3,
        });
        await databaseBuilder.commit();

        // when
        const complementaryCertificationBadges =
          await enrolmentRepositories.complementaryCertificationBadgeRepository.findAll();

        // then
        expect(complementaryCertificationBadges).to.deepEqualArray([
          domainBuilder.certification.enrolment.buildComplementaryCertificationBadge({
            id: badge1Data.id,
            label: badge1Data.label,
            imageUrl: badge1Data.imageUrl,
          }),
          domainBuilder.certification.enrolment.buildComplementaryCertificationBadge({
            id: badge2Data.id,
            label: badge2Data.label,
            imageUrl: badge2Data.imageUrl,
          }),
          domainBuilder.certification.enrolment.buildComplementaryCertificationBadge({
            id: badge3Data.id,
            label: badge3Data.label,
            imageUrl: badge3Data.imageUrl,
          }),
        ]);
      });
    });

    describe('when there are no complementary certification badges', function () {
      it('should return an empty array', async function () {
        // given when
        const complementaryCertificationBadges =
          await enrolmentRepositories.complementaryCertificationBadgeRepository.findAll();

        // then
        expect(complementaryCertificationBadges).to.be.empty;
      });
    });
  });
});
