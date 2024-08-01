import * as targetProfileAdministrationRepository from '../../../../../../src/prescription/target-profile/infrastructure/repositories/target-profile-administration-repository.js';
import { DomainTransaction } from '../../../../../../src/shared/domain/DomainTransaction.js';
import { NotFoundError, ObjectValidationError } from '../../../../../../src/shared/domain/errors.js';
import { TargetProfile } from '../../../../../../src/shared/domain/models/index.js';
import { catchErr, databaseBuilder, domainBuilder, expect, knex } from '../../../../../test-helper.js';

describe('Integration | Repository | Target-profile', function () {
  describe('#update', function () {
    it('should update the target profile name', async function () {
      // given
      const targetProfile = databaseBuilder.factory.buildTargetProfile({ name: 'Arthur' });
      await databaseBuilder.commit();

      // when
      targetProfile.name = 'Karam';
      await targetProfileAdministrationRepository.update(targetProfile);

      // then
      const { name } = await knex('target-profiles').select('name').where('id', targetProfile.id).first();
      expect(name).to.equal(targetProfile.name);
    });

    it('should update the target profile description', async function () {
      // given
      const targetProfile = databaseBuilder.factory.buildTargetProfile();
      await databaseBuilder.commit();

      // when
      targetProfile.description = 'Je change la description';
      await targetProfileAdministrationRepository.update(targetProfile);

      // then
      const { description } = await knex('target-profiles').select('description').where('id', targetProfile.id).first();
      expect(description).to.equal(targetProfile.description);
    });

    it('should update the target profile comment', async function () {
      // given
      const targetProfile = databaseBuilder.factory.buildTargetProfile();
      await databaseBuilder.commit();

      // when
      targetProfile.comment = 'Je change le commentaire';
      await targetProfileAdministrationRepository.update(targetProfile);

      // then
      const { comment } = await knex('target-profiles').select('comment').where('id', targetProfile.id).first();
      expect(comment).to.equal(targetProfile.comment);
    });

    it('should outdate the target profile', async function () {
      // given
      const targetProfile = databaseBuilder.factory.buildTargetProfile({ outdated: true });
      await databaseBuilder.commit();

      // when
      targetProfile.outdate = true;
      await targetProfileAdministrationRepository.update(targetProfile);

      // then
      const { outdated } = await knex('target-profiles').select('outdated').where('id', targetProfile.id).first();
      expect(outdated).to.equal(targetProfile.outdated);
    });

    it('should update and return the target profile "isSimplifiedAccess" attribute', async function () {
      // given
      const targetProfile = databaseBuilder.factory.buildTargetProfile({ isSimplifiedAccess: false });
      await databaseBuilder.commit();

      // when
      targetProfile.isSimplifiedAccess = true;
      const result = await targetProfileAdministrationRepository.update(targetProfile);

      // then
      expect(result).to.be.instanceOf(TargetProfile);
      expect(result.isSimplifiedAccess).to.equal(true);
    });

    it('should not update the target profile and throw an error while id not existing', async function () {
      // given
      const targetProfile = databaseBuilder.factory.buildTargetProfile({ name: 'Arthur' });
      await databaseBuilder.commit();

      // when
      targetProfile.id = 999999;
      targetProfile.name = 'Karam';
      const error = await catchErr(targetProfileAdministrationRepository.update)(targetProfile);

      // then
      expect(error).to.be.instanceOf(NotFoundError);
    });

    it('should not update the target profile name for an database error', async function () {
      // given
      const targetProfile = databaseBuilder.factory.buildTargetProfile({ name: 'Arthur' });
      await databaseBuilder.commit();

      // when
      targetProfile.name = null;
      const error = await catchErr(targetProfileAdministrationRepository.update)(targetProfile);

      // then
      expect(error).to.be.instanceOf(ObjectValidationError);
    });
  });

  describe('#create', function () {
    it('should return the id and create the target profile in database', async function () {
      // given
      databaseBuilder.factory.buildOrganization({ id: 1 });
      await databaseBuilder.commit();
      const targetProfileForCreation = domainBuilder.buildTargetProfileForCreation({
        name: 'myFirstTargetProfile',
        category: TargetProfile.categories.SUBJECT,
        description: 'la description',
        comment: 'le commentaire',
        isPublic: true,
        imageUrl: 'mon-image/stylée',
        ownerOrganizationId: 1,
        areKnowledgeElementsResettable: true,
      });

      // when
      const targetProfileId = await DomainTransaction.execute(async () => {
        return targetProfileAdministrationRepository.create({
          targetProfileForCreation,
        });
      });

      // then
      const targetProfileInDB = await knex('target-profiles')
        .select([
          'name',
          'category',
          'description',
          'comment',
          'isPublic',
          'imageUrl',
          'ownerOrganizationId',
          'areKnowledgeElementsResettable',
        ])
        .where({ id: targetProfileId })
        .first();
      expect(targetProfileInDB).to.deep.equal({
        name: 'myFirstTargetProfile',
        category: TargetProfile.categories.SUBJECT,
        description: 'la description',
        comment: 'le commentaire',
        isPublic: true,
        imageUrl: 'mon-image/stylée',
        ownerOrganizationId: 1,
        areKnowledgeElementsResettable: true,
      });
    });

    it('should create the target profile tubes in database', async function () {
      // given
      const targetProfileForCreation = domainBuilder.buildTargetProfileForCreation({
        ownerOrganizationId: null,
        tubes: [
          { id: 'recTube2', level: 5 },
          { id: 'recTube1', level: 8 },
        ],
      });

      // when
      const targetProfileId = await DomainTransaction.execute(async () => {
        return targetProfileAdministrationRepository.create({
          targetProfileForCreation,
        });
      });

      // then
      const targetProfileTubesInDB = await knex('target-profile_tubes')
        .select(['targetProfileId', 'tubeId', 'level'])
        .where({ targetProfileId })
        .orderBy('tubeId', 'ASC');

      expect(targetProfileTubesInDB).to.deep.equal([
        { targetProfileId, tubeId: 'recTube1', level: 8 },
        { targetProfileId, tubeId: 'recTube2', level: 5 },
      ]);
    });

    it('should be transactional through DomainTransaction and do nothing if an error occurs', async function () {
      // given
      const targetProfileForCreation = domainBuilder.buildTargetProfileForCreation({
        ownerOrganizationId: null,
        tubes: [{ id: 'recTube2', level: 5 }],
      });

      // when
      try {
        await DomainTransaction.execute(async () => {
          await targetProfileAdministrationRepository.create({
            targetProfileForCreation,
          });
          throw new Error();
        });
        // eslint-disable-next-line no-empty
      } catch (error) {}

      // then
      const targetProfilesInDB = await knex('target-profiles').select('id');
      const targetProfileTubesInDB = await knex('target-profile_tubes').select('id');
      expect(targetProfilesInDB).to.deepEqualArray([]);
      expect(targetProfileTubesInDB).to.deepEqualArray([]);
    });
  });
});
