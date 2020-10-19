const { expect, databaseBuilder, knex } = require('../../test-helper');
const { addTag, checkData, createOrUpdateOrganizations } = require('../../../scripts/create-or-update-sco-agri-organizations');
const logoUrl = require('../../../scripts/logo/default-sco-agri-organization-logo-base64');

describe('Integration | Scripts | create-or-update-sco-agri-organizations', () => {

  describe('#checkData', () => {

    it('should keep all data', async () => {
      // given
      const csvData = [
        ['a100', 'Lycée Charles De Gaulle', 'cdg@example.net'],
        ['b200', 'Collège Marie Curie'],
      ];

      const expectedResult = [{
        externalId: 'A100',
        name: 'Lycée Charles De Gaulle',
        email: 'cdg@example.net',
      }, {
        externalId: 'B200',
        name: 'Collège Marie Curie',
      }];

      // when
      const result = await checkData({ csvData });

      // then
      expect(result).to.deep.have.members(expectedResult);
    });

    it('should keep only one data when a whole line is empty', async () => {
      // given
      const csvData = [
        ['a100', 'Lycée Charles De Gaulle'],
        ['', ''],
      ];

      const expectedResult = [{
        externalId: 'A100',
        name: 'Lycée Charles De Gaulle',
      }];

      // when
      const result = await checkData({ csvData });

      // then
      expect(result).to.deep.have.members(expectedResult);
    });

    it('should keep only one data when an externalId is missing', async () => {
      // given
      const csvData = [
        ['a100', 'Lycée Charles De Gaulle'],
        ['', 'Collège Marie Curie'],
      ];

      const expectedResult = [{
        externalId: 'A100',
        name: 'Lycée Charles De Gaulle',
      }];

      // when
      const result = await checkData({ csvData });

      // then
      expect(result).to.deep.have.members(expectedResult);
    });

    it('should keep only one data when name is missing', async () => {
      // given
      const csvData = [
        ['a100', 'Lycée Charles De Gaulle'],
        ['b200', ''],
      ];

      const expectedResult = [{
        externalId: 'A100',
        name: 'Lycée Charles De Gaulle',
      }];

      // when
      const result = await checkData({ csvData });

      // then
      expect(result).to.deep.have.members(expectedResult);
    });
  });

  describe('#createOrUpdateOrganizations', () => {

    let organization;

    beforeEach(async () => {
      organization = databaseBuilder.factory.buildOrganization();
      await databaseBuilder.commit();
    });

    context('When organization already exists', () => {

      it('should update name, email, isManagingStudents, canCollectProfiles and logo url', async () => {
        // given
        const organizationsByExternalId = {};
        organizationsByExternalId[organization.externalId] = {
          id: organization.id,
          externalId: organization.externalId,
        };
        const checkedData = [{
          externalId: organization.externalId,
          name: 'New Name',
          email: 'new@example.net',
        }];

        // when
        const updatedOrganizations = await createOrUpdateOrganizations({ organizationsByExternalId, checkedData });

        // then
        expect(updatedOrganizations[0].name).to.equal(checkedData[0].name);
        expect(updatedOrganizations[0].email).to.equal(checkedData[0].email);
        expect(updatedOrganizations[0].isManagingStudents).to.be.true;
        expect(updatedOrganizations[0].canCollectProfiles).to.be.true;
        expect(updatedOrganizations[0].logoUrl).to.equal(logoUrl);
      });
    });

    context('When organization does not exist', () => {

      it('should create the organization', async () => {
        // given
        const organizationsByExternalId = {};
        const checkedData = [{
          externalId: 'EXTERNAL',
          name: 'New Name',
          email: 'new@example.net',
        }];

        // when
        const createdOrganizations = await createOrUpdateOrganizations({ organizationsByExternalId, checkedData });

        // then
        expect(createdOrganizations[0].name).to.equal(checkedData[0].name);
        expect(createdOrganizations[0].externalId).to.equal(checkedData[0].externalId);
        expect(createdOrganizations[0].email).to.equal(checkedData[0].email);
        expect(createdOrganizations[0].logoUrl).to.equal(logoUrl);
        expect(createdOrganizations[0].provinceCode).to.equal('EXT');
        expect(createdOrganizations[0].type).to.equal('SCO');
        expect(createdOrganizations[0].isManagingStudents).to.be.true;
        expect(createdOrganizations[0].canCollectProfiles).to.be.true;
      });
    });

  });

  describe('#addTag', () => {

    context('When AGRICULTURE tag does not exist', () => {

      afterEach(() => {
        return knex('tags').delete();
      });

      it('should create it', async() => {
        // given
        const organizations = [];

        // when
        await addTag(organizations);

        // then
        const tagsInDB = await knex('tags').select();
        expect(tagsInDB.length).to.equal(1);
        expect(tagsInDB[0].name).to.equal('AGRICULTURE');
      });
    });

    context('When AGRICULTURE tag already exists in DB', () => {

      let agriTag;

      beforeEach(async () => {
        agriTag = databaseBuilder.factory.buildTag({ name: 'AGRICULTURE' });
        await databaseBuilder.commit();
      });

      afterEach(() => {
        return knex('organization-tags').delete();
      });

      context('When organization does not have an AGRICULTURE tag', () => {

        it('should add AGRICULTURE tag to the organization', async () => {
          // given
          const organization = databaseBuilder.factory.buildOrganization({ type: 'SCO' });
          await databaseBuilder.commit();

          // when
          await addTag([organization]);

          // then
          const organizationTagsInDB = await knex('organization-tags').select();
          expect(organizationTagsInDB.length).to.equal(1);
          expect(organizationTagsInDB[0].organizationId).to.equal(organization.id);
          expect(organizationTagsInDB[0].tagId).to.equal(agriTag.id);
        });
      });
    });
  });
});
