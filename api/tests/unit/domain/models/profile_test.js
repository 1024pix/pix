const { describe, it, expect } = require('../../../test-helper');
const Profile = require('../../../../lib/domain/models/data/profile');
const faker = require('faker');

const Assessment = require('../../../../lib/domain/models/data/assessment');

describe('Unit | Domain | Models | Profile', () => {

  describe('#constructor', () => {

    let user;
    let areas;
    let courses;
    let assessments;
    let competences;

    beforeEach(() => {
      user = {
        'first-name': faker.name.findName(),
        'last-name': faker.name.findName()
      };

      areas = [
        {
          id: 'areaId1',
          name: 'Domaine 1'
        },
        {
          id: 'areaId2',
          name: 'Domaine 2'
        }
      ];

      courses = [
        {
          id : 'courseId8',
          nom : 'Test de positionnement 1.1',
          competences : []
        }
      ];

      assessments = [];

      competences = [
        {
          id: 'competenceId1',
          name: '1.1 Mener une recherche d’information',
          areaId: 'areaId1',
        },
        {
          id: 'competenceId2',
          name: '1.2 Gérer des données',
          areaId: 'areaId2'
        }];
    });

    it('should exist', () => {
      expect(Profile).to.exist;
    });

    it('should be a class', () => {
      expect(new Profile(null, null, null, [], [])).to.be.an.instanceof(Profile);
    });

    it('should create an instance of Profile (with level -1 by default)', () => {
      // Given
      const expectedCompetences = [
        {
          id: 'competenceId1',
          name: '1.1 Mener une recherche d’information',
          areaId: 'areaId1',
          level: -1
        },
        {
          id: 'competenceId2',
          name: '1.2 Gérer des données',
          areaId: 'areaId2',
          level: -1
        }];

      // When
      const profile = new Profile(user, competences, areas, assessments, courses);

      // Then
      expect(profile).to.be.an.instanceof(Profile);
      expect(profile.user).to.be.equal(user);
      expect(profile.competences).to.be.deep.equal(expectedCompetences);
      expect(profile.areas).to.be.equal(areas);
    });

    it('should assign level of competence from assessment', () => {
      // Given
      courses[0].competences = ['competenceId1'];
      assessments = [new Assessment({
        id : 'assessmentId1',
        pixScore: 10,
        estimatedLevel: 1,
        courseId : 'courseId8'
      })];

      const expectedCompetences = [
        {
          id: 'competenceId1',
          name: '1.1 Mener une recherche d’information',
          areaId: 'areaId1',
          level: 1,
          pixScore: 10
        },
        {
          id: 'competenceId2',
          name: '1.2 Gérer des données',
          areaId: 'areaId2',
          level: -1
        }];

      // When
      const profile = new Profile(user, competences, areas, assessments, courses);

      // Then
      expect(profile).to.be.an.instanceof(Profile);
      expect(profile.user).to.be.equal(user);
      expect(profile.competences).to.be.deep.equal(expectedCompetences);
      expect(profile.areas).to.be.equal(areas);
    });

  });

});
