const { describe, it, expect } = require('../../../test-helper');
const Profile = require('../../../../lib/domain/models/data/profile');
const faker = require('faker');

describe('Unit | Domain | Class | Profile', () => {

  describe('Profile', () => {

    it('should be exist', () => {
      expect(Profile).to.exist;
    });

    it('should be a class', () => {
      expect(new Profile()).to.be.an.instanceof(Profile);
    });

    it('should create an instance of Profile (with level -1 by default)', () => {
      // given
      const user = {
        'first-name': faker.name.findName(),
        'last-name': faker.name.findName()
      };

      const areas = [
        {
          id: 1,
          name: 'Domaine 1'
        },
        {
          id: 2,
          name: 'Domaine 2'
        }
      ];

      const competences = [
        {
          id: 'recsvLDFHShyfDXXXXX',
          name: '1.1 Mener une recherche d’information',
          areaId: 'recvoGdo0z0z0pXWZ',
        },
        {
          id: 'recsvLDFHShyfDXXXXX',
          name: '1.1 Mener une recherche d’information',
          areaId: 'recvoGdo0z0z0pXWZ'
        }];

      const expectedCompetences = [
        {
          id: 'recsvLDFHShyfDXXXXX',
          name: '1.1 Mener une recherche d’information',
          areaId: 'recvoGdo0z0z0pXWZ',
          level: -1
        },
        {
          id: 'recsvLDFHShyfDXXXXX',
          name: '1.1 Mener une recherche d’information',
          areaId: 'recvoGdo0z0z0pXWZ',
          level: -1
        }];

      // when
      const profile = new Profile(user, competences, areas);
      // then
      expect(profile).to.be.an.instanceof(Profile);
      expect(profile.user).to.be.equal(user);
      expect(profile.competences).to.be.deep.equal(expectedCompetences);
      expect(profile.areas).to.be.equal(areas);
    });

  });

});
