const { expect, domainBuilder } = require('../../../test-helper');
const Organization = require('../../../../lib/domain/models/Organization');
const Tag = require('../../../../lib/domain/models/Tag');

describe('Unit | Domain | Models | Organization', () => {

  describe('constructor', () => {

    it('should build an Organization from raw JSON', () => {
      // given
      const rawData = {
        id: 1,
        name: 'Lycée Jean Rostand',
        type: 'SCO',
        email: 'jr@lycee.fr',
      };

      // when
      const organization = new Organization(rawData);

      // then
      expect(organization.id).to.equal(1);
      expect(organization.type).to.equal('SCO');
      expect(organization.name).to.equal('Lycée Jean Rostand');
    });

    it('should build an Organization with targetProfile related', () => {
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

    it('should build an Organization with default values for credit, canCollectProfiles when not specified', () => {
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
      expect(organization.canCollectProfiles).to.equal(false);
    });

  });

  describe('get#isSco', () => {

    it('should return true when organization is of type SCO', () => {
      // given
      const organization = domainBuilder.buildOrganization({ type: 'SCO' });

      // when / then
      expect(organization.isSco).is.true;
    });

    it('should return false when organization is not of type SCO', () => {
      // given
      const organization = domainBuilder.buildOrganization({ type: 'SUP' });

      // when / then
      expect(organization.isSco).is.false;
    });
  });

  describe('get#isSup', () => {

    it('should return true when organization is of type SUP', () => {
      // given
      const organization = domainBuilder.buildOrganization({ type: 'SUP' });

      // when / then
      expect(organization.isSup).is.true;
    });

    it('should return false when organization is not of type SUP', () => {
      // given
      const organization = domainBuilder.buildOrganization({ type: 'PRO' });

      // when / then
      expect(organization.isSup).is.false;
    });
  });

  describe('get#isPro', () => {

    it('should return true when organization is of type PRO', () => {
      // given
      const organization = domainBuilder.buildOrganization({ type: 'PRO' });

      // when / then
      expect(organization.isPro).is.true;
    });

    it('should return false when organization is not of type PRO', () => {
      // given
      const organization = domainBuilder.buildOrganization({ type: 'SCO' });

      // when / then
      expect(organization.isPro).is.false;
    });
  });

  describe('get#isAgriculture', () => {

    context('when organization is not SCO', () => {
      it('should return false when the organization has the "AGRICULTURE" tag', () => {
        // given
        const tag = domainBuilder.buildTag({ name: Tag.AGRICULTURE });
        const organization = domainBuilder.buildOrganization({ type: 'SUP', tags: [tag] });

        // when / then
        expect(organization.isAgriculture).is.false;
      });
    });

    context('when organization is SCO', () => {
      it('should return true when organization is of type SCO and has the "AGRICULTURE" tag', () => {
        // given
        const tag1 = domainBuilder.buildTag({ name: Tag.AGRICULTURE });
        const tag2 = domainBuilder.buildTag({ name: 'OTHER' });
        const organization = domainBuilder.buildOrganization({ type: 'SCO', tags: [tag1, tag2] });

        // when / then
        expect(organization.isAgriculture).is.true;
      });

      it('should return false when when organization is of type SCO and has not the "AGRICULTURE" tag', () => {
        // given
        const tag1 = domainBuilder.buildTag({ name: 'To infinity…and beyond!' });
        const tag2 = domainBuilder.buildTag({ name: 'OTHER' });
        const organization = domainBuilder.buildOrganization({ type: 'SCO', tags: [tag1, tag2] });

        // when / then
        expect(organization.isAgriculture).is.false;
      });
    });
  });

  describe('get#isPoleEmploi', () => {
    it('should return false when the organization has not the "POLE_EMPLOI" tag', () => {
      // given
      const tag = domainBuilder.buildTag({ name: Tag.AGRICULTURE });
      const organization = domainBuilder.buildOrganization({ tags: [tag] });

      // when / then
      expect(organization.isPoleEmploi).is.false;
    });

    it('should return true when organization has the "POLE_EMPLOI" tag', () => {
      // given
      const tag1 = domainBuilder.buildTag({ name: Tag.POLE_EMPLOI });
      const tag2 = domainBuilder.buildTag({ name: 'OTHER' });
      const organization = domainBuilder.buildOrganization({ tags: [tag1, tag2] });

      // when / then
      expect(organization.isPoleEmploi).is.true;
    });
  });

  describe('get#isCFA', () => {
    context('when organization is not SCO', () => {
      it('should return false when the organization has the "CFA" tag', () => {
        // given
        const tag = domainBuilder.buildTag({ name: Tag.CFA });
        const organization = domainBuilder.buildOrganization({ type: 'SUP', tags: [tag] });

        // when / then
        expect(organization.isCFA).is.false;
      });
    });

    context('when organization is SCO', () => {
      it('should return true when organization is of type SCO and has the "CFA" tag', () => {
        // given
        const tag1 = domainBuilder.buildTag({ name: Tag.CFA });
        const tag2 = domainBuilder.buildTag({ name: 'OTHER' });
        const organization = domainBuilder.buildOrganization({ type: 'SCO', tags: [tag1, tag2] });

        // when / then
        expect(organization.isCFA).is.true;
      });

      it('should return false when when organization is of type SCO and has not the "CFA" tag', () => {
        // given
        const tag1 = domainBuilder.buildTag({ name: 'To infinity…and beyond!' });
        const tag2 = domainBuilder.buildTag({ name: 'OTHER' });
        const organization = domainBuilder.buildOrganization({ type: 'SCO', tags: [tag1, tag2] });

        // when / then
        expect(organization.isCFA).is.false;
      });
    });
  });

  describe('get#isAEFE', () => {
    context('when organization is not SCO', () => {
      it('should return false when the organization has the "AEFE" tag', () => {
        // given
        const tag = domainBuilder.buildTag({ name: Tag.AEFE });
        const organization = domainBuilder.buildOrganization({ type: 'SUP', tags: [tag] });

        // when / then
        expect(organization.isAEFE).is.false;
      });
    });

    context('when organization is SCO', () => {
      it('should return true when organization is of type SCO and has the "AEFE" tag', () => {
        // given
        const tag1 = domainBuilder.buildTag({ name: Tag.AEFE });
        const tag2 = domainBuilder.buildTag({ name: 'OTHER' });
        const organization = domainBuilder.buildOrganization({ type: 'SCO', tags: [tag1, tag2] });

        // when / then
        expect(organization.isAEFE).is.true;
      });

      it('should return false when when organization is of type SCO and has not the "AEFE" tag', () => {
        // given
        const tag1 = domainBuilder.buildTag({ name: 'To infinity…and beyond!' });
        const tag2 = domainBuilder.buildTag({ name: 'OTHER' });
        const organization = domainBuilder.buildOrganization({ type: 'SCO', tags: [tag1, tag2] });

        // when / then
        expect(organization.isAEFE).is.false;
      });
    });
  });

  describe('get#isMLF', () => {
    context('when organization is not SCO', () => {
      it('should return false when the organization has the "MLF" tag', () => {
        // given
        const tag = domainBuilder.buildTag({ name: Tag.MLF });
        const organization = domainBuilder.buildOrganization({ type: 'SUP', tags: [tag] });

        // when / then
        expect(organization.isMLF).is.false;
      });
    });

    context('when organization is SCO', () => {
      it('should return true when organization is of type SCO and has the "MLF" tag', () => {
        // given
        const tag1 = domainBuilder.buildTag({ name: Tag.MLF });
        const tag2 = domainBuilder.buildTag({ name: 'OTHER' });
        const organization = domainBuilder.buildOrganization({ type: 'SCO', tags: [tag1, tag2] });

        // when / then
        expect(organization.isMLF).is.true;
      });

      it('should return false when when organization is of type SCO and has not the "MLF" tag', () => {
        // given
        const tag1 = domainBuilder.buildTag({ name: 'To infinity…and beyond!' });
        const tag2 = domainBuilder.buildTag({ name: 'OTHER' });
        const organization = domainBuilder.buildOrganization({ type: 'SCO', tags: [tag1, tag2] });

        // when / then
        expect(organization.isMLF).is.false;
      });
    });
  });

  describe('get#isMediationNumerique', () => {
    context('when organization is not PRO', () => {
      it('should return false when the organization has the "MEDIATION_NUMERIQUE" tag', () => {
        // given
        const tag = domainBuilder.buildTag({ name: Tag.MEDIATION_NUMERIQUE });
        const organization = domainBuilder.buildOrganization({ type: 'SCO', tags: [tag] });

        // when / then
        expect(organization.isMediationNumerique).is.false;
      });
    });

    context('when organization is PRO', () => {
      it('should return true when organization is of type SCO and has the "MEDIATION_NUMERIQUE" tag', () => {
        // given
        const tag1 = domainBuilder.buildTag({ name: Tag.MEDIATION_NUMERIQUE });
        const tag2 = domainBuilder.buildTag({ name: 'OTHER' });
        const organization = domainBuilder.buildOrganization({ type: 'PRO', tags: [tag1, tag2] });

        // when / then
        expect(organization.isMediationNumerique).is.true;
      });

      it('should return false when when organization is of type PRO and has not the "MEDIATION_NUMERIQUE" tag', () => {
        // given
        const tag1 = domainBuilder.buildTag({ name: 'To infinity…and beyond!' });
        const tag2 = domainBuilder.buildTag({ name: 'OTHER' });
        const organization = domainBuilder.buildOrganization({ type: 'PRO', tags: [tag1, tag2] });

        // when / then
        expect(organization.isMLF).is.false;
      });
    });
  });

  describe('get#isScoAngManagingStudents', () => {

    it('should return true when organization is of type SCO and is managing student', () => {
      // given
      const organization = domainBuilder.buildOrganization({ type: 'SCO', isManagingStudents: true });

      // when / then
      expect(organization.isScoAndManagingStudents).is.true;
    });

    it('should return false when organization is not of type SCO', () => {
      // given
      const organization = domainBuilder.buildOrganization({ type: 'SUP' });

      // when / then
      expect(organization.isScoAndManagingStudents).is.false;
    });

    it('should return false when organization is not managingStudent', () => {
      // given
      const organization = domainBuilder.buildOrganization({ type: 'SCO', isManagingStudents: false });

      // when / then
      expect(organization.isScoAndManagingStudents).is.false;
    });
  });

});
