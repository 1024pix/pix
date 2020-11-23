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

    context('when organization is not SCO', ()  =>  {
      it('should return false when the organization has the "AGRICULTURE" tag', () => {
        // given
        const tag = domainBuilder.buildTag({ name: Tag.AGRICULTURE });
        const organization = domainBuilder.buildOrganization({ type: 'SUP', tags: [tag] });

        // when / then
        expect(organization.isAgriculture).is.false;
      });
    });

    context('when organization is SCO', ()  =>  {
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
    context('when organization is not SCO', ()  =>  {
      it('should return false when the organization has the "CFA" tag', () => {
        // given
        const tag = domainBuilder.buildTag({ name: Tag.CFA });
        const organization = domainBuilder.buildOrganization({ type: 'SUP', tags: [tag] });

        // when / then
        expect(organization.isCFA).is.false;
      });
    });

    context('when organization is SCO', ()  =>  {
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
});
