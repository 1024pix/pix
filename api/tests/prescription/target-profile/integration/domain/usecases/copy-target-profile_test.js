import * as targetProfileRepository from '../../../../../../lib/infrastructure/repositories/target-profile-repository.js';
import { copyTargetProfile } from '../../../../../../src/prescription/target-profile/domain/usecases/copy-target-profile.js';
import * as targetProfileAdministrationRepository from '../../../../../../src/prescription/target-profile/infrastructure/repositories/target-profile-administration-repository.js';
import { categories } from '../../../../../../src/shared/domain/models/TargetProfile.js';
import { databaseBuilder, expect, knex } from '../../../../../test-helper.js';

describe('Integration | UseCases | copy-target-profile', function () {
  describe('when the target profile exists', function () {
    it('should copy the target profile', async function () {
      // given
      const originTargetProfile = databaseBuilder.factory.buildTargetProfile({
        category: categories.PIX_PLUS,
      });
      const firstBadge = databaseBuilder.factory.buildBadge({ key: 'FOO', targetProfileId: originTargetProfile.id });
      const secondBadge = databaseBuilder.factory.buildBadge({ key: 'BAR', targetProfileId: originTargetProfile.id });

      databaseBuilder.factory.buildBadgeCriterion({ title: 'First Badge First Criterion', badgeId: firstBadge.id });
      databaseBuilder.factory.buildBadgeCriterion({ title: 'First Badge Second Criterion', badgeId: firstBadge.id });
      databaseBuilder.factory.buildBadgeCriterion({ title: 'Second Badge First Criterion', badgeId: secondBadge.id });

      await databaseBuilder.commit();

      // when
      const newlyCreatedTargetProfileId = await copyTargetProfile({
        targetProfileId: originTargetProfile.id,
        targetProfileAdministrationRepository,
        targetProfileRepository,
      });

      // then
      const newlyCreatedTargetProfile = await knex('target-profiles')
        .where({ id: newlyCreatedTargetProfileId })
        .first();

      expect(newlyCreatedTargetProfileId).not.to.equal(originTargetProfile.id);
      expect(newlyCreatedTargetProfile.createdAt).not.to.equal(originTargetProfile.createdAt);

      expect(newlyCreatedTargetProfile.name).to.equal('[Copie] ' + originTargetProfile.name);
      expect(newlyCreatedTargetProfile.category).to.equal(originTargetProfile.category);
      expect(newlyCreatedTargetProfile.areKnowledgeElementsResettable).to.equal(
        originTargetProfile.areKnowledgeElementsResettable,
      );
      expect(newlyCreatedTargetProfile.comment).to.equal(originTargetProfile.comment);
      expect(newlyCreatedTargetProfile.description).to.equal(originTargetProfile.description);
      expect(newlyCreatedTargetProfile.imageUrl).to.equal(originTargetProfile.imageUrl);
      expect(newlyCreatedTargetProfile.isPublic).to.equal(originTargetProfile.isPublic);
      expect(newlyCreatedTargetProfile.isSimplifiedAccess).to.equal(originTargetProfile.isSimplifiedAccess);
      expect(newlyCreatedTargetProfile.outdated).to.equal(originTargetProfile.outdated);
      expect(newlyCreatedTargetProfile.ownerOrganizationId).to.equal(originTargetProfile.ownerOrganizationId);
    });

    it('should copy the tubes', async function () {
      // given
      const originTargetProfile = databaseBuilder.factory.buildTargetProfile();
      const tubesData = [
        { tubeId: 'recpP9Uaz1x6qq95e', level: 4 },
        { tubeId: 'recYFCpGlmwQwAONl', level: 4 },
        { tubeId: 'recoPAkxe29Ru3r3h', level: 3 },
        { tubeId: 'recInPPTW79jkUbEY', level: 3 },
        { tubeId: 'rec6Ic2FdcxSRYkdn', level: 2 },
      ];

      tubesData.map(({ tubeId, level }) => {
        databaseBuilder.factory.buildTargetProfileTube({ targetProfileId: originTargetProfile.id, tubeId, level });
      });

      await databaseBuilder.commit();

      // when
      const newlyCreatedTargetProfileId = await copyTargetProfile({
        targetProfileId: originTargetProfile.id,
        targetProfileRepository,
        targetProfileAdministrationRepository,
      });

      // then
      const newlyCreatedTargetProfile = await knex('target-profiles')
        .where({ id: newlyCreatedTargetProfileId })
        .first();

      const newlyCreatedTargetProfileTubes = await knex('target-profile_tubes').where({
        targetProfileId: newlyCreatedTargetProfile.id,
      });

      expect(newlyCreatedTargetProfileTubes.length).to.equal(tubesData.length);
      newlyCreatedTargetProfileTubes.forEach((targetProfileTube) => {
        delete targetProfileTube.id;
        delete targetProfileTube.targetProfileId;
      });
      expect(newlyCreatedTargetProfileTubes).to.deep.equal(tubesData);
    });
  });

  describe('when the target profile does not exist', function () {
    it('should throw a not found error', async function () {
      // when
      await expect(
        copyTargetProfile({
          targetProfileId: 999,
          targetProfileAdministrationRepository,
          targetProfileRepository,
        }),
      ).to.be.eventually.rejectedWith("Le profil cible avec l'id 999 n'existe pas");
    });
  });
});
