const { catchErr, expect, domainBuilder, databaseBuilder } = require('../../../test-helper');
const { NotFoundError } = require('../../../../lib/domain/errors');
const OrganizationForAdmin = require('../../../../lib/domain/models/OrganizationForAdmin');
const organizationForAdminRepository = require('../../../../lib/infrastructure/repositories/organization-for-admin-repository');

describe('Integration | Repository | Organization-for-admin', function () {
  describe('#get', function () {
    it('should return a organization for admin by provided id', async function () {
      // given
      const pixMasterUserId = databaseBuilder.factory.buildUser().id;

      const insertedOrganization = databaseBuilder.factory.buildOrganization({
        type: 'SCO',
        name: 'Organization of the dark side',
        logoUrl: 'some logo url',
        credit: 154,
        externalId: '100',
        provinceCode: '75',
        isManagingStudents: 'true',
        email: 'sco.generic.account@example.net',
        documentationUrl: 'https://pix.fr/',
        createdBy: pixMasterUserId,
        showNPS: true,
        formNPSUrl: 'https://pix.fr/',
        showSkills: false,
      });

      await databaseBuilder.commit();

      // when
      const foundOrganizationForAdmin = await organizationForAdminRepository.get(insertedOrganization.id);

      // then
      const expectedOrganizationForAdmin = new OrganizationForAdmin({
        id: insertedOrganization.id,
        type: 'SCO',
        name: 'Organization of the dark side',
        logoUrl: 'some logo url',
        credit: 154,
        externalId: '100',
        provinceCode: '75',
        isManagingStudents: true,
        email: 'sco.generic.account@example.net',
        students: [],
        targetProfileShares: [],
        organizationInvitations: [],
        tags: [],
        documentationUrl: 'https://pix.fr/',
        createdBy: insertedOrganization.createdBy,
        showNPS: true,
        formNPSUrl: 'https://pix.fr/',
        showSkills: false,
        archivedAt: null,
        archivistFirstName: null,
        archivistLastName: null,
      });
      expect(foundOrganizationForAdmin).to.deepEqualInstance(expectedOrganizationForAdmin);
    });

    it('should throw when organization is not found', async function () {
      // given
      const nonExistentId = 10083;

      // when
      const error = await catchErr(organizationForAdminRepository.get)(nonExistentId);

      // then
      expect(error).to.be.an.instanceof(NotFoundError);
      expect(error.message).to.equal('Not found organization for ID 10083');
    });

    describe('when the organization has associated tags', function () {
      it('should return an organization with associated tags', async function () {
        // given
        const insertedOrganization = databaseBuilder.factory.buildOrganization();
        const tag1 = databaseBuilder.factory.buildTag({ name: 'PRO' });
        databaseBuilder.factory.buildOrganizationTag({
          organizationId: insertedOrganization.id,
          tagId: tag1.id,
        });
        const tag2 = databaseBuilder.factory.buildTag({ name: 'SCO' });
        databaseBuilder.factory.buildOrganizationTag({
          organizationId: insertedOrganization.id,
          tagId: tag2.id,
        });
        databaseBuilder.factory.buildOrganizationTag();
        await databaseBuilder.commit();

        // when
        const organization = await organizationForAdminRepository.get(insertedOrganization.id);

        // then
        const expectedTags = [domainBuilder.buildTag({ ...tag1 }), domainBuilder.buildTag({ ...tag2 })];
        expect(organization.tags).to.deep.equal(expectedTags);
        expect(organization.tags).to.have.lengthOf(2);
      });
    });

    describe('when the organization is archived', function () {
      it('should return its archived details', async function () {
        // given
        const pixMasterUser = databaseBuilder.factory.buildUser();
        const archivist = databaseBuilder.factory.buildUser();
        const archivedAt = new Date('2022-02-02');

        const insertedOrganization = databaseBuilder.factory.buildOrganization({
          type: 'SCO',
          name: 'Organization of the dark side',
          logoUrl: 'some logo url',
          credit: 154,
          externalId: '100',
          provinceCode: '75',
          isManagingStudents: 'true',
          email: 'sco.generic.account@example.net',
          documentationUrl: 'https://pix.fr/',
          createdBy: pixMasterUser.id,
          showNPS: true,
          formNPSUrl: 'https://pix.fr/',
          showSkills: false,
          archivedBy: archivist.id,
          archivedAt,
        });

        await databaseBuilder.commit();

        // when
        const foundOrganizationForAdmin = await organizationForAdminRepository.get(insertedOrganization.id);

        // then
        const expectedOrganizationForAdmin = new OrganizationForAdmin({
          id: insertedOrganization.id,
          type: 'SCO',
          name: 'Organization of the dark side',
          logoUrl: 'some logo url',
          credit: 154,
          externalId: '100',
          provinceCode: '75',
          isManagingStudents: true,
          email: 'sco.generic.account@example.net',
          students: [],
          targetProfileShares: [],
          organizationInvitations: [],
          tags: [],
          documentationUrl: 'https://pix.fr/',
          createdBy: insertedOrganization.createdBy,
          showNPS: true,
          formNPSUrl: 'https://pix.fr/',
          showSkills: false,
          archivedAt,
          archivistFirstName: archivist.firstName,
          archivistLastName: archivist.lastName,
        });
        expect(foundOrganizationForAdmin).to.deepEqualInstance(expectedOrganizationForAdmin);
      });
    });
  });
});
