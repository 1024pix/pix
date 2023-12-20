import { usecases } from '../../../../../../src/prescription/target-profile/domain/usecases/index.js';
import { usecases as libUsecases } from '../../../../../../lib/domain/usecases/index.js';
import { expect, sinon, catchErr } from '../../../../../test-helper.js';
import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';
import { TargetProfileForSpecifier } from '../../../../../../src/prescription/target-profile/domain/read-models/TargetProfileForSpecifier.js';
import * as targetProfileApi from '../../../../../../src/prescription/target-profile/application/api/target-profile-api.js';
import { TargetProfile } from '../../../../../../src/prescription/target-profile/application/api/TargetProfile.js';

describe('Unit | API | TargetProfile', function () {
  describe('#getById', function () {
    it('should return target profile', async function () {
      const targetProfileId = 1;
      const targetProfileForAdmin = domainBuilder.buildTargetProfileForAdmin({ id: targetProfileId });
      const expectedTargetProfile = new TargetProfile(targetProfileForAdmin);

      const getTargetProfileForAdminStub = sinon.stub(libUsecases, 'getTargetProfileForAdmin');
      getTargetProfileForAdminStub.withArgs({ targetProfileId }).resolves(targetProfileForAdmin);

      const targetProfile = await targetProfileApi.getById(targetProfileId);

      expect(targetProfile).to.deep.equal(expectedTargetProfile);
    });

    it('should throw an error', async function () {
      const targetProfileId = 1;

      const getTargetProfileForAdminStub = sinon.stub(libUsecases, 'getTargetProfileForAdmin');
      getTargetProfileForAdminStub.withArgs({ targetProfileId }).rejects();

      const error = await catchErr(targetProfileApi.getById)(targetProfileId);

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
        isPublic: true,
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
      expect(result[0].isPublic).to.equal(targetProfile.isPublic);
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
      expect(result.length).to.equal(0);
    });
  });
});
