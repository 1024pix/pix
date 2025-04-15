import * as targetProfileApi from '../../../../../../src/prescription/target-profile/application/api/target-profile-api.js';
import { TargetProfile } from '../../../../../../src/prescription/target-profile/application/api/TargetProfile.js';
import { TargetProfileSkill } from '../../../../../../src/prescription/target-profile/application/api/TargetProfileSkill.js';
import { TargetProfileForSpecifier } from '../../../../../../src/prescription/target-profile/domain/read-models/TargetProfileForSpecifier.js';
import { usecases } from '../../../../../../src/prescription/target-profile/domain/usecases/index.js';
import { catchErr, expect, sinon } from '../../../../../test-helper.js';
import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';

describe('Unit | API | TargetProfile', function () {
  describe('#getByIdForAdmin', function () {
    it('should return target profile', async function () {
      const targetProfileId = 1;
      const targetProfileForAdmin = domainBuilder.buildTargetProfileForAdmin({ id: targetProfileId });
      const expectedTargetProfile = new TargetProfile(targetProfileForAdmin);

      const getTargetProfileForAdminStub = sinon.stub(usecases, 'getTargetProfileForAdmin');
      getTargetProfileForAdminStub.withArgs({ targetProfileId }).resolves(targetProfileForAdmin);

      const targetProfile = await targetProfileApi.getByIdForAdmin(targetProfileId);

      expect(targetProfile).to.deep.equal(expectedTargetProfile);
    });

    it('should throw an error', async function () {
      const targetProfileId = 1;

      const getTargetProfileForAdminStub = sinon.stub(usecases, 'getTargetProfileForAdmin');
      getTargetProfileForAdminStub.withArgs({ targetProfileId }).rejects();

      const error = await catchErr(targetProfileApi.getByIdForAdmin)(targetProfileId);

      expect(error).to.be.ok;
    });
  });

  describe('#getByOrganizationId', function () {
    it('should return target profiles from organization', async function () {
      const organizationId = domainBuilder.buildOrganization().id;

      const targetProfile = new TargetProfileForSpecifier({
        name: 'Mon target profile',
        id: 777,
        category: 'TOTO',
        isSimplifiedAccess: false,
      });

      const getAvailableTargetProfilesForOrganizationStub = sinon.stub(
        usecases,
        'getAvailableTargetProfilesForOrganization',
      );
      getAvailableTargetProfilesForOrganizationStub
        .withArgs({
          organizationId,
        })
        .resolves([targetProfile]);

      // when
      const result = await targetProfileApi.getByOrganizationId(organizationId);

      // then
      expect(result[0].id).to.equal(targetProfile.id);
      expect(result[0].name).to.equal(targetProfile.name);
      expect(result[0].category).to.equal(targetProfile.category);
      expect(result[0].isSimplifiedAccess).to.equal(targetProfile.isSimplifiedAccess);
      expect(result[0]).not.to.be.instanceOf(TargetProfileForSpecifier);
    });

    it('should return empty array if organization does not exist', async function () {
      const notExistingOrganizationId = 'NOT EXISTING ID';

      const getAvailableTargetProfilesForOrganizationStub = sinon.stub(
        usecases,
        'getAvailableTargetProfilesForOrganization',
      );

      getAvailableTargetProfilesForOrganizationStub
        .withArgs({
          organizationId: notExistingOrganizationId,
        })
        .resolves([]);

      // when
      const result = await targetProfileApi.getByOrganizationId(notExistingOrganizationId);

      // then
      expect(result).to.have.lengthOf(0);
    });
  });

  describe('#findSkillsByTargetProfileIds', function () {
    it('should return empty array if no skill found', async function () {
      const findSkillsByTargetProfileIdsStub = sinon.stub(usecases, 'findSkillsByTargetProfileIds');
      findSkillsByTargetProfileIdsStub.rejects();
      findSkillsByTargetProfileIdsStub.withArgs({ targetProfileIds: ['targetProfileId'] }).resolves([]);

      // when
      const result = await targetProfileApi.findSkillsByTargetProfileIds(['targetProfileId']);

      // then
      expect(result).to.have.lengthOf(0);
    });

    it('should return an array of TargetProfileSkill', async function () {
      const findSkillsByTargetProfileIdsStub = sinon.stub(usecases, 'findSkillsByTargetProfileIds');
      findSkillsByTargetProfileIdsStub.rejects();
      findSkillsByTargetProfileIdsStub
        .withArgs({ targetProfileIds: ['targetProfileId'] })
        .resolves([domainBuilder.buildSkill({ id: 'monSkillId', difficulty: 18 })]);

      // when
      const result = await targetProfileApi.findSkillsByTargetProfileIds(['targetProfileId']);

      // then
      expect(result).to.have.lengthOf(1);
      expect(result[0]).instanceOf(TargetProfileSkill);
      expect(result[0].id).equals('monSkillId');
      expect(result[0].difficulty).equals(18);
    });
  });
});
