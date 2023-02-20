import { expect, domainBuilder, catchErr } from '../../../test-helper';

const id = 1;
describe('Unit | Domain | Models | OrganizationsToAttachToTargetProfile', function () {
  it('should store target profile id', function () {
    const targetProfileOrganizations = domainBuilder.buildOrganizationsToAttachToTargetProfile({ id });

    expect(targetProfileOrganizations.id).equal(id);
  });

  describe('#attach', function () {
    it('should attach organizations', function () {
      const targetProfileOrganizations = domainBuilder.buildOrganizationsToAttachToTargetProfile({ id });

      targetProfileOrganizations.attach([1, 2]);

      expect(targetProfileOrganizations.organizations).deep.equal([1, 2]);
    });

    it('should not attach an organization twice', function () {
      const targetProfileOrganizations = domainBuilder.buildOrganizationsToAttachToTargetProfile({ id });

      targetProfileOrganizations.attach([1, 1]);

      expect(targetProfileOrganizations.organizations).deep.equal([1]);
    });

    it('should throw an error if there is no organization to attach', async function () {
      const targetProfileOrganizations = domainBuilder.buildOrganizationsToAttachToTargetProfile({ id });

      const error = await catchErr(targetProfileOrganizations.attach)([]);

      expect(error.message).equal(`Il n'y a aucune organisation à rattacher.`);
    });
  });
});
