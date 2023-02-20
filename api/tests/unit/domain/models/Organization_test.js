import { expect, domainBuilder } from '../../../test-helper';
import Organization from '../../../../lib/domain/models/Organization';
import Tag from '../../../../lib/domain/models/Tag';

describe('Unit | Domain | Models | Organization', function () {
  describe('constructor', function () {
    it('should build an Organization from raw JSON', function () {
      // given
      const rawData = {
        id: 1,
        name: 'Lycée Jean Rostand',
        type: 'SCO',
        email: 'jr@lycee.fr',
        showSkills: false,
      };

      // when
      const organization = new Organization(rawData);

      // then
      expect(organization.id).to.equal(1);
      expect(organization.type).to.equal('SCO');
      expect(organization.name).to.equal('Lycée Jean Rostand');
      expect(organization.showSkills).to.equal(false);
    });

    it('should build an Organization with targetProfile related', function () {
      // given
      const rawData = {
        id: 1,
        name: 'Lycée Jean Rostand',
        type: 'SCO',
        email: 'jr@lycee.fr',
        targetProfileShares: [
          {
            targetProfile: [],
          },
        ],
      };
      // when
      const organization = new Organization(rawData);

      // then
      expect(organization.id).to.equal(1);
      expect(organization.targetProfileShares.length).to.equal(1);
    });

    it('should build an Organization with default values for credit when not specified', function () {
      // given
      const rawData = {
        id: 1,
        name: 'Lycée Jean Rostand',
        type: 'SCO',
      };
      // when
      const organization = new Organization(rawData);
      // then
      expect(organization.credit).to.equal(0);
    });
  });

  describe('get#isSco', function () {
    it('should return true when organization is of type SCO', function () {
      // given
      const organization = domainBuilder.buildOrganization({ type: 'SCO' });

      // when / then
      expect(organization.isSco).is.true;
    });

    it('should return false when organization is not of type SCO', function () {
      // given
      const organization = domainBuilder.buildOrganization({ type: 'SUP' });

      // when / then
      expect(organization.isSco).is.false;
    });
  });

  describe('get#isSup', function () {
    it('should return true when organization is of type SUP', function () {
      // given
      const organization = domainBuilder.buildOrganization({ type: 'SUP' });

      // when / then
      expect(organization.isSup).is.true;
    });

    it('should return false when organization is not of type SUP', function () {
      // given
      const organization = domainBuilder.buildOrganization({ type: 'PRO' });

      // when / then
      expect(organization.isSup).is.false;
    });
  });

  describe('get#isPro', function () {
    it('should return true when organization is of type PRO', function () {
      // given
      const organization = domainBuilder.buildOrganization({ type: 'PRO' });

      // when / then
      expect(organization.isPro).is.true;
    });

    it('should return false when organization is not of type PRO', function () {
      // given
      const organization = domainBuilder.buildOrganization({ type: 'SCO' });

      // when / then
      expect(organization.isPro).is.false;
    });
  });

  describe('get#isAgriculture', function () {
    context('when organization is not SCO', function () {
      it('should return false when the organization has the "AGRICULTURE" tag', function () {
        // given
        const tag = domainBuilder.buildTag({ name: Tag.AGRICULTURE });
        const organization = domainBuilder.buildOrganization({ type: 'SUP', tags: [tag] });

        // when / then
        expect(organization.isAgriculture).is.false;
      });
    });

    context('when organization is SCO', function () {
      it('should return true when organization is of type SCO and has the "AGRICULTURE" tag', function () {
        // given
        const tag1 = domainBuilder.buildTag({ name: Tag.AGRICULTURE });
        const tag2 = domainBuilder.buildTag({ name: 'OTHER' });
        const organization = domainBuilder.buildOrganization({ type: 'SCO', tags: [tag1, tag2] });

        // when / then
        expect(organization.isAgriculture).is.true;
      });

      it('should return false when when organization is of type SCO and has not the "AGRICULTURE" tag', function () {
        // given
        const tag1 = domainBuilder.buildTag({ name: 'To infinity…and beyond!' });
        const tag2 = domainBuilder.buildTag({ name: 'OTHER' });
        const organization = domainBuilder.buildOrganization({ type: 'SCO', tags: [tag1, tag2] });

        // when / then
        expect(organization.isAgriculture).is.false;
      });
    });
  });

  describe('get#isPoleEmploi', function () {
    it('should return false when the organization has not the "POLE_EMPLOI" tag', function () {
      // given
      const tag = domainBuilder.buildTag({ name: Tag.AGRICULTURE });
      const organization = domainBuilder.buildOrganization({ tags: [tag] });

      // when / then
      expect(organization.isPoleEmploi).is.false;
    });

    it('should return true when organization has the "POLE_EMPLOI" tag', function () {
      // given
      const tag1 = domainBuilder.buildTag({ name: Tag.POLE_EMPLOI });
      const tag2 = domainBuilder.buildTag({ name: 'OTHER' });
      const organization = domainBuilder.buildOrganization({ tags: [tag1, tag2] });

      // when / then
      expect(organization.isPoleEmploi).is.true;
    });
  });

  describe('get#isScoAngManagingStudents', function () {
    it('should return true when organization is of type SCO and is managing student', function () {
      // given
      const organization = domainBuilder.buildOrganization({ type: 'SCO', isManagingStudents: true });

      // when / then
      expect(organization.isScoAndManagingStudents).is.true;
    });

    it('should return false when organization is not of type SCO', function () {
      // given
      const organization = domainBuilder.buildOrganization({ type: 'SUP' });

      // when / then
      expect(organization.isScoAndManagingStudents).is.false;
    });

    it('should return false when organization is not managingStudent', function () {
      // given
      const organization = domainBuilder.buildOrganization({ type: 'SCO', isManagingStudents: false });

      // when / then
      expect(organization.isScoAndManagingStudents).is.false;
    });
  });

  describe('get#isScoAndHasExternalId', function () {
    it('should return true when organization is of type SCO and has an externalId', function () {
      // given
      const organization = domainBuilder.buildOrganization({ type: 'SCO', externalId: '1237457A' });

      // when / then
      expect(organization.isScoAndHasExternalId).is.true;
    });

    it('should return false when organization is not of type SCO', function () {
      // given
      const organization = domainBuilder.buildOrganization({ type: 'SUP', externalId: '1237457A' });

      // when / then
      expect(organization.isScoAndHasExternalId).is.false;
    });

    it('should return false when organization has no external id', function () {
      // given
      const organization = domainBuilder.buildOrganization({ type: 'SCO', externalId: null });

      // when / then
      expect(organization.isScoAndHasExternalId).is.false;
    });
  });

  describe('get#isArchived', function () {
    it('should return true when organization has an archive date', function () {
      // given
      const organization = domainBuilder.buildOrganization({ archivedAt: new Date('2013-05-22T23:42:00Z') });

      // when / then
      expect(organization.isArchived).is.true;
    });

    it('should return false when organization does not have an archive date', function () {
      // given
      const organization = domainBuilder.buildOrganization({ archivedAt: null });

      // when / then
      expect(organization.isArchived).is.false;
    });
  });
});
