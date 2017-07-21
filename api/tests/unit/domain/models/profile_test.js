const { describe, it, expect } = require('../../../test-helper');
const User = require('../../../../lib/domain/models/data/user');
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
      user = new User({
        'first-name': faker.name.findName(),
        'last-name': faker.name.findName()
      });

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
          id: 'courseId8',
          nom: 'Test de positionnement 1.1',
          competences: []
        }, {
          id: 'courseId9',
          nom: 'Test de positionnement 1.2',
          competences: []
        }
      ];

      assessments = [];

      competences = [
        {
          id: 'competenceId1',
          name: '1.1 Mener une recherche d’information',
          index: '1.1',
          areaId: 'areaId1',
          courseId: 'recBxPAuEPlTgt72q11'
        },
        {
          id: 'competenceId2',
          name: '1.2 Gérer des données',
          index: '1.2',
          areaId: 'areaId2',
          courseId: 'recBxPAuEPlTgt72q99'
        }];
    });

    it('should exist', () => {
      expect(Profile).to.exist;
    });

    it('should be a class', () => {
      expect(new Profile(user, competences, null, [], [])).to.be.an.instanceof(Profile);
    });

    it('should create an instance of Profile (with level -1 by default)', () => {
      // Given
      const expectedCompetences = [
        {
          id: 'competenceId1',
          name: '1.1 Mener une recherche d’information',
          index: '1.1',
          areaId: 'areaId1',
          level: -1,
          courseId: 'recBxPAuEPlTgt72q11'
        },
        {
          id: 'competenceId2',
          name: '1.2 Gérer des données',
          index: '1.2',
          areaId: 'areaId2',
          level: -1,
          courseId: 'recBxPAuEPlTgt72q99'
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
        id: 'assessmentId1',
        pixScore: 10,
        estimatedLevel: 1,
        courseId: 'courseId8'
      })];

      const expectedCompetences = [
        {
          id: 'competenceId1',
          name: '1.1 Mener une recherche d’information',
          index: '1.1',
          areaId: 'areaId1',
          level: 1,
          pixScore: 10,
          courseId: 'recBxPAuEPlTgt72q11'
        },
        {
          id: 'competenceId2',
          name: '1.2 Gérer des données',
          index: '1.2',
          areaId: 'areaId2',
          level: -1,
          courseId: 'recBxPAuEPlTgt72q99'
        }];

      // When
      const profile = new Profile(user, competences, areas, assessments, courses);

      // Then
      expect(profile).to.be.an.instanceof(Profile);
      expect(profile.user).to.be.equal(user);
      expect(profile.competences).to.be.deep.equal(expectedCompetences);
      expect(profile.areas).to.be.equal(areas);
    });

    describe('when calculating score', () => {

      beforeEach(() => {
        user = new User({
          'first-name': 'Jean Michel',
          'last-name': 'PasDeChance'
        });

        courses[0].competences = ['competenceId1'];
      });

      it('should add the sum of won pix to the user', () => {
        // Given
        courses[1].competences = ['competenceId2'];
        assessments = [
          new Assessment({
            id: 'assessmentId1',
            pixScore: 10,
            estimatedLevel: 1,
            courseId: 'courseId8'
          }),
          new Assessment({
            id: 'assessmentId2',
            pixScore: 15,
            estimatedLevel: 2,
            courseId: 'courseId9'
          })
        ];

        const expectedUser = {
          'first-name': 'Jean Michel',
          'last-name': 'PasDeChance',
          'pix-score': 25
        };

        // When
        const profile = new Profile(user, competences, areas, assessments, courses);

        // Then
        expect(profile).to.be.an.instanceof(Profile);
        expect(profile.user.toJSON()).to.deep.equal(expectedUser);
      });

      it('should add the sum of won pix to the user when a competence has no score', () => {
        // Given
        assessments = [
          new Assessment({
            id: 'assessmentId1',
            pixScore: 10,
            estimatedLevel: 1,
            courseId: 'courseId8'
          })
        ];

        const expectedUser = {
          'first-name': 'Jean Michel',
          'last-name': 'PasDeChance',
          'pix-score': 10
        };

        // When
        const profile = new Profile(user, competences, areas, assessments, courses);

        // Then
        expect(profile).to.be.an.instanceof(Profile);
        expect(profile.user.toJSON()).to.deep.equal(expectedUser);
      });

      it('should not add a total score of pix if the user has no assessment with score', () => {
        // Given
        const expectedUser = {
          'first-name': 'Jean Michel',
          'last-name': 'PasDeChance',
        };

        // When
        const profile = new Profile(user, competences, areas, assessments, courses);

        // Then
        expect(profile).to.be.an.instanceof(Profile);
        expect(profile.user.toJSON()).to.deep.equal(expectedUser);
      });
    });

  });

});
