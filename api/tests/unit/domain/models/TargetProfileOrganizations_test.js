const { expect, domainBuilder, catchErr } = require('../../../test-helper');

const id = 1;
describe('Unit | Domain | Models | TargetProfileOrganizations', function () {
  it('should store target profile id', function () {
    const targetProfileOrganizations = domainBuilder.buildTargetProfileOrganizations({ id });

    expect(targetProfileOrganizations.id).equal(id);
  });

  describe('#attach', function () {
    it('should attach organizations', function () {
      const targetProfileOrganizations = domainBuilder.buildTargetProfileOrganizations({ id });

      targetProfileOrganizations.attach([1, 2]);

      expect(targetProfileOrganizations.organizations).deep.equal([1, 2]);
    });

    it('should not attach an organization twice', function () {
      const targetProfileOrganizations = domainBuilder.buildTargetProfileOrganizations({ id });

      targetProfileOrganizations.attach([1, 1]);

      expect(targetProfileOrganizations.organizations).deep.equal([1]);
    });

    it('should throw an error if there is no organization to attach', async function () {
      const targetProfileOrganizations = domainBuilder.buildTargetProfileOrganizations({ id });

      const error = await catchErr(targetProfileOrganizations.attach)([]);

      expect(error.message).equal(`Il n'y a aucune organisation à rattacher.`);
    });
  });
});
