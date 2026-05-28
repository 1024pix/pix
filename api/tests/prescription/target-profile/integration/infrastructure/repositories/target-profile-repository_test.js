import _ from 'lodash';
import sinon from 'sinon';

import { Badge } from '../../../../../../src/evaluation/domain/models/Badge.js';
import * as targetProfileRepository from '../../../../../../src/prescription/target-profile/infrastructure/repositories/target-profile-repository.js';
import { NotFoundError } from '../../../../../../src/shared/domain/errors.js';
import { TargetProfile } from '../../../../../../src/shared/domain/models/TargetProfile.js';
import { expect } from '../../../../../test-helper.js';
import { databaseBuilder } from '../../../../../tooling/databases.js';
import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';
import { catchErr } from '../../../../../tooling/test-utils/error.js';

describe('Integration | Repository | Target-profile', function () {
  describe('#get', function () {
    let targetProfile;
    let organizationId;

    beforeEach(async function () {
      organizationId = databaseBuilder.factory.buildOrganization({}).id;
      targetProfile = databaseBuilder.factory.buildTargetProfile({});
      databaseBuilder.factory.buildTargetProfileShare({ targetProfileId: targetProfile.id, organizationId });
      await databaseBuilder.commit();
    });

    it('should return the target profile with its associated skills and the list of organizations which could access it', async function () {
      // when
      const foundTargetProfile = await targetProfileRepository.get(targetProfile.id);

      // then
      expect(foundTargetProfile).to.be.an.instanceOf(TargetProfile);
      expect(foundTargetProfile.id).to.be.equal(targetProfile.id);
    });

    it('should return targetProfile badges', async function () {
      //given
      const badge1 = databaseBuilder.factory.buildBadge({
        targetProfileId: targetProfile.id,
      });
      const badge2 = databaseBuilder.factory.buildBadge({
        targetProfileId: targetProfile.id,
      });
      databaseBuilder.factory.buildBadge();
      await databaseBuilder.commit();

      //when
      const result = await targetProfileRepository.get(targetProfile.id);

      //then
      expect(result.badges.length).to.be.equal(2);
      expect(result.badges[0]).to.be.an.instanceOf(Badge);
      expect(result.badges[1]).to.be.an.instanceOf(Badge);
      expect(result.badges[0].id).to.be.equal(badge1.id);
      expect(result.badges[1].id).to.be.equal(badge2.id);
    });

    context('when the targetProfile does not exist', function () {
      it('throws an error', async function () {
        const error = await catchErr(targetProfileRepository.get)(1);

        expect(error).to.be.an.instanceOf(NotFoundError);
        expect(error.message).to.have.string("Le profil cible avec l'id 1 n'existe pas");
      });
    });
  });

  describe('#findByIds', function () {
    let targetProfile1;
    let targetProfileIds;
    const targetProfileIdNotExisting = 999;

    beforeEach(async function () {
      targetProfile1 = databaseBuilder.factory.buildTargetProfile();
      await databaseBuilder.commit();
    });

    it('should return the target profile', async function () {
      // given
      targetProfileIds = [targetProfile1.id];

      const expectedTargetProfilesAttributes = _.map([targetProfile1], (item) =>
        _.pick(item, ['id', 'name', 'organizationId', 'outdated']),
      );

      // when
      const foundTargetProfiles = await targetProfileRepository.findByIds(targetProfileIds);

      // then
      const foundTargetProfilesAttributes = _.map(foundTargetProfiles, (item) =>
        _.pick(item, ['id', 'name', 'organizationId', 'outdated']),
      );
      expect(foundTargetProfilesAttributes).to.deep.equal(expectedTargetProfilesAttributes);
    });

    it('should return found target profiles', async function () {
      // given
      const targetProfile2 = databaseBuilder.factory.buildTargetProfile({ name: 'second target profile' });
      const targetProfile3 = databaseBuilder.factory.buildTargetProfile({ name: 'third target profile' });
      await databaseBuilder.commit();

      targetProfileIds = [targetProfile1.id, targetProfileIdNotExisting, targetProfile2.id, targetProfile3.id];

      const expectedTargetProfilesAttributes = _.map([targetProfile1, targetProfile3, targetProfile2], (item) =>
        _.pick(item, ['id', 'name', 'organizationId', 'outdated']),
      );

      // when
      const foundTargetProfiles = await targetProfileRepository.findByIds(targetProfileIds);

      // then
      const foundTargetProfilesAttributes = _.map(foundTargetProfiles, (item) =>
        _.pick(item, ['id', 'name', 'organizationId', 'outdated']),
      );
      expect(foundTargetProfilesAttributes).to.deep.members(expectedTargetProfilesAttributes);
    });

    it('should return an empty array', async function () {
      // given
      targetProfileIds = [targetProfileIdNotExisting];

      // when
      const foundTargetProfiles = await targetProfileRepository.findByIds(targetProfileIds);

      // then
      const foundTargetProfilesAttributes = _.map(foundTargetProfiles, (item) =>
        _.pick(item, ['id', 'name', 'organizationId', 'outdated']),
      );
      expect(foundTargetProfilesAttributes).to.deep.equal([]);
    });
  });

  describe('#findOrganizationIds', function () {
    let targetProfileId;
    const expectedOrganizationIds = [];

    beforeEach(function () {
      targetProfileId = databaseBuilder.factory.buildTargetProfile().id;
      _.times(2, () => {
        const organizationId = databaseBuilder.factory.buildOrganization().id;
        expectedOrganizationIds.push(organizationId);
        databaseBuilder.factory.buildTargetProfileShare({ organizationId, targetProfileId });
      });
      return databaseBuilder.commit();
    });

    context('when there are organizations linked to the target profile', function () {
      it('should return an Array of Organization ids', async function () {
        const organizationIds = await targetProfileRepository.findOrganizationIds(targetProfileId);

        expect(organizationIds).to.be.an('array');
        expect(organizationIds).to.deep.equal(expectedOrganizationIds);
      });

      it('should not include an organization that is not attach to target profile', async function () {
        databaseBuilder.factory.buildOrganization();
        await databaseBuilder.commit();

        const organizationIds = await targetProfileRepository.findOrganizationIds(targetProfileId);

        expect(organizationIds).to.have.lengthOf(2);
      });
    });

    context('when no organization is linked to the target profile', function () {
      it('should return an empty array', async function () {
        const otherTargetProfileId = databaseBuilder.factory.buildTargetProfile().id;
        await databaseBuilder.commit();

        const organizationIds = await targetProfileRepository.findOrganizationIds(otherTargetProfileId);

        expect(organizationIds).to.deep.equal([]);
      });
    });

    context('when target profile does not exist', function () {
      it('should throw', async function () {
        const error = await catchErr(targetProfileRepository.findOrganizationIds)(999);

        expect(error).to.be.instanceOf(NotFoundError);
      });
    });
  });

  describe('#findTubeIdsByTargetProfileIds', function () {
    it('returns tube rows for all given target profile ids', async function () {
      // given
      const targetProfileId1 = databaseBuilder.factory.buildTargetProfile().id;
      databaseBuilder.factory.buildTargetProfileTube({ targetProfileId: targetProfileId1, tubeId: 'tube1' });
      databaseBuilder.factory.buildTargetProfileTube({ targetProfileId: targetProfileId1, tubeId: 'tube2' });

      const targetProfileId2 = databaseBuilder.factory.buildTargetProfile().id;
      databaseBuilder.factory.buildTargetProfileTube({ targetProfileId: targetProfileId2, tubeId: 'tube3' });

      await databaseBuilder.commit();

      // when
      const result = await targetProfileRepository.findTubeIdsByTargetProfileIds([targetProfileId1, targetProfileId2]);

      // then
      expect(result).to.deep.members([
        { targetProfileId: targetProfileId1, tubeId: 'tube1' },
        { targetProfileId: targetProfileId1, tubeId: 'tube2' },
        { targetProfileId: targetProfileId2, tubeId: 'tube3' },
      ]);
    });

    it('does not return tubes from other target profiles', async function () {
      // given
      const targetProfileId = databaseBuilder.factory.buildTargetProfile().id;
      const otherTargetProfileId = databaseBuilder.factory.buildTargetProfile().id;
      databaseBuilder.factory.buildTargetProfileTube({ targetProfileId: otherTargetProfileId, tubeId: 'tube1' });
      await databaseBuilder.commit();

      // when
      const result = await targetProfileRepository.findTubeIdsByTargetProfileIds([targetProfileId]);

      // then
      expect(result).to.deep.equal([]);
    });
  });

  describe('#findSharedByOrganizationId', function () {
    it('returns target profiles shared with the organization', async function () {
      // given
      const organizationId = databaseBuilder.factory.buildOrganization().id;
      const targetProfile = databaseBuilder.factory.buildTargetProfile({
        name: 'Mon profil',
        category: 'SUBJECT',
        isSimplifiedAccess: false,
      });
      databaseBuilder.factory.buildTargetProfileShare({ targetProfileId: targetProfile.id, organizationId });
      await databaseBuilder.commit();

      // when
      const result = await targetProfileRepository.findSharedByOrganizationId(organizationId);

      // then
      expect(result).to.have.lengthOf(1);
      expect(result[0].id).to.equal(targetProfile.id);
      expect(result[0].name).to.equal('Mon profil');
      expect(result[0].category).to.equal('SUBJECT');
      expect(result[0].isSimplifiedAccess).to.equal(false);
      expect(result[0].createdAt).to.be.instanceOf(Date);
    });

    it('does not return target profiles not shared with the organization', async function () {
      // given
      const organizationId = databaseBuilder.factory.buildOrganization().id;
      const otherOrganizationId = databaseBuilder.factory.buildOrganization().id;
      const targetProfileId = databaseBuilder.factory.buildTargetProfile().id;
      databaseBuilder.factory.buildTargetProfileShare({ targetProfileId, organizationId: otherOrganizationId });
      await databaseBuilder.commit();

      // when
      const result = await targetProfileRepository.findSharedByOrganizationId(organizationId);

      // then
      expect(result).to.deep.equal([]);
    });
  });

  describe('#findSkillsByIds', function () {
    let firstTargetProfilId, secondTargetProfilId, thirdTargetProfilId;

    beforeEach(async function () {
      firstTargetProfilId = databaseBuilder.factory.buildTargetProfile().id;

      databaseBuilder.factory.buildTargetProfileTube({
        targetProfileId: firstTargetProfilId,
        tubeId: 'firstTube',
        level: 3,
      });
      databaseBuilder.factory.buildTargetProfileTube({
        targetProfileId: firstTargetProfilId,
        tubeId: 'secondTube',
        level: 1,
      });

      secondTargetProfilId = databaseBuilder.factory.buildTargetProfile().id;

      databaseBuilder.factory.buildTargetProfileTube({
        targetProfileId: secondTargetProfilId,
        tubeId: 'firstTube',
        level: 5,
      });
      databaseBuilder.factory.buildTargetProfileTube({
        targetProfileId: secondTargetProfilId,
        tubeId: 'secondTube',
        level: 3,
      });

      thirdTargetProfilId = databaseBuilder.factory.buildTargetProfile().id;

      databaseBuilder.factory.buildTargetProfileTube({
        targetProfileId: thirdTargetProfilId,
        tubeId: 'thirdTube',
        level: 5,
      });

      await databaseBuilder.commit();
    });

    it('should return empty when given non existing targetProfileId', async function () {
      // given
      const targetProfileId = 789;

      // when
      const result = await targetProfileRepository.findSkillsByIds({ targetProfileIds: [targetProfileId] });

      // then
      expect(result).lengthOf(0);
    });

    it('should deduplication skill per tubeId and difficulty', async function () {
      // given
      const skillRepositoryStub = { findActiveByTubeId: sinon.stub() };
      skillRepositoryStub.findActiveByTubeId.rejects();

      skillRepositoryStub.findActiveByTubeId
        .withArgs('firstTube')
        .resolves([domainBuilder.buildSkill({ id: 'firstSkill_firstTube', difficulty: 1 })]);
      skillRepositoryStub.findActiveByTubeId.withArgs('secondTube').resolves([]);

      // when
      const result = await targetProfileRepository.findSkillsByIds({
        targetProfileIds: [firstTargetProfilId, secondTargetProfilId],
        dependencies: {
          skillRepository: skillRepositoryStub,
        },
      });

      // then
      expect(result).lengthOf(1);
      expect(result).deep.members([domainBuilder.buildSkill({ id: 'firstSkill_firstTube', difficulty: 1 })]);
    });

    it('should return skill capped to maximum difficulty', async function () {
      // given
      const skillRepositoryStub = { findActiveByTubeId: sinon.stub() };
      skillRepositoryStub.findActiveByTubeId.rejects();

      skillRepositoryStub.findActiveByTubeId
        .withArgs('firstTube')
        .resolves([
          domainBuilder.buildSkill({ id: 'firstSkill_firstTube', difficulty: 1 }),
          domainBuilder.buildSkill({ id: 'secondSkill_firstTube', difficulty: 5 }),
          domainBuilder.buildSkill({ id: 'thirdSkill_firstTube', difficulty: 7 }),
        ]);
      skillRepositoryStub.findActiveByTubeId.withArgs('secondTube').resolves([]);

      // when
      const result = await targetProfileRepository.findSkillsByIds({
        targetProfileIds: [firstTargetProfilId, secondTargetProfilId],
        dependencies: {
          skillRepository: skillRepositoryStub,
        },
      });

      // then
      expect(result).lengthOf(2);
      expect(result).deep.members([
        domainBuilder.buildSkill({ id: 'firstSkill_firstTube', difficulty: 1 }),
        domainBuilder.buildSkill({ id: 'secondSkill_firstTube', difficulty: 5 }),
      ]);
    });

    it('should return skill given tubeId', async function () {
      // given
      const skillRepositoryStub = { findActiveByTubeId: sinon.stub() };
      skillRepositoryStub.findActiveByTubeId.rejects();

      skillRepositoryStub.findActiveByTubeId
        .withArgs('firstTube')
        .resolves([domainBuilder.buildSkill({ id: 'firstSkill_firstTube', difficulty: 1 })]);
      skillRepositoryStub.findActiveByTubeId
        .withArgs('secondTube')
        .resolves([domainBuilder.buildSkill({ id: 'firstSkill_secondTube', difficulty: 3 })]);

      // when
      const result = await targetProfileRepository.findSkillsByIds({
        targetProfileIds: [firstTargetProfilId, secondTargetProfilId],
        dependencies: {
          skillRepository: skillRepositoryStub,
        },
      });

      // then
      expect(result).lengthOf(2);
      expect(result).deep.members([
        domainBuilder.buildSkill({ id: 'firstSkill_firstTube', difficulty: 1 }),
        domainBuilder.buildSkill({ id: 'firstSkill_secondTube', difficulty: 3 }),
      ]);
    });
  });
});
