const { expect, domainBuilder } = require('../../../test-helper');
const Organization = require('../../../../lib/domain/models/Organization');

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
    beforeEach(() => {
      process.env['AGRICULTURE_ORGANIZATION_ID'] = '1';
    });

    afterEach(() => {
      process.env['AGRICULTURE_ORGANIZATION_ID'] = null;
    });

    it('should return true when organization is of type SCO and id match Environnement variable AGRICULTURE_ORGANIZATION_ID', () => {
      // given
      const organization = domainBuilder.buildOrganization({ id: '1', type: 'SCO' });

      // when / then
      expect(organization.isAgriculture).is.true;
    });

    it('should return false when when organization is of type SCO and id doesnt match Environnement variable AGRICULTURE_ORGANIZATION_ID', () => {
      // given
      const organization = domainBuilder.buildOrganization({ id: '2', type: 'SCO' });

      // when / then
      expect(organization.isAgriculture).is.false;
    });

    it('should return false when when organization is not of type SCO', () => {
      // given
      const organization = domainBuilder.buildOrganization({ id: '1', type: 'SUP' });

      // when / then
      expect(organization.isAgriculture).is.false;
    });
  });

  describe('get#isPoleEmploi', () => {
    beforeEach(() => {
      process.env['POLE_EMPLOI_ORGANIZATION_ID'] = '1';
    });

    afterEach(() => {
      process.env['POLE_EMPLOI_ORGANIZATION_ID'] = null;
    });

    it('should return true when organization id match Environnement variable POLE_EMPLOI_ORGANIZATION_ID', () => {
      // given
      const organization = domainBuilder.buildOrganization({ id: '1' });

      // when / then
      expect(organization.isPoleEmploi).is.true;
    });

    it('should return false when when organization id doesnt match Environnement variable POLE_EMPLOI_ORGANIZATION_ID', () => {
      // given
      const organization = domainBuilder.buildOrganization({ id: '2' });

      // when / then
      expect(organization.isPoleEmploi).is.false;
    });
  });

});
