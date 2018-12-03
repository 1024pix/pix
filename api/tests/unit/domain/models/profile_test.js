const { expect, domainBuilder, sinon } = require('../../../test-helper');
const BookshelfUser = require('../../../../lib/infrastructure/data/user');
const Profile = require('../../../../lib/domain/models/Profile');

const faker = require('faker');
const moment = require('moment');

const Assessment = require('../../../../lib/domain/models/Assessment');
const AssessmentResult = require('../../../../lib/domain/models/AssessmentResult');

describe('Unit | Domain | Models | Profile', () => {

  describe('#constructor', () => {

    let user;
    let areas;
    let courses;
    let assessments;
    let assessmentsCompletedWithResults;
    let lastAssessments;
    let competences;

    beforeEach(() => {
      user = new BookshelfUser({
        'first-name': faker.name.findName(),
        'last-name': faker.name.findName(),
      });

      areas = [
        {
          id: 'areaId1',
          name: 'Domaine 1',
        },
        {
          id: 'areaId2',
          name: 'Domaine 2',
        },
      ];

      courses = [
        {
          id: 'courseId8',
          nom: 'Test de positionnement 1.1',
          competences: [],
        }, {
          id: 'courseId9',
          nom: 'Test de positionnement 1.2',
          competences: [],
        },
      ];

      assessments = [];

      competences = [
        {
          id: 'competenceId1',
          name: '1.1 Mener une recherche d’information',
          index: '1.1',
          areaId: 'areaId1',
          courseId: 'courseId8',
          level: -1,
          status: 'notAssessed',
        },
        {
          id: 'competenceId2',
          name: '1.2 Gérer des données',
          index: '1.2',
          areaId: 'areaId2',
          courseId: 'courseId9',
          level: -1,
          status: 'notAssessed',
        }];
    });

    it('should exist', () => {
      expect(Profile).to.exist;
    });

    it('should be a class', () => {
      expect(new Profile({
        user,
        competences,
        areas: null,
        lastAssessments: [],
        assessmentsCompletedWithResults: [],
        courses: [],
      })).to.be.an.instanceof(Profile);
    });

    it('should assign level of competence from assessment', () => {
      // given
      courses[0].competences = ['competenceId1'];
      const assessment = domainBuilder.buildAssessment({
        id: 'assessmentId1',
        courseId: 'courseId8',
        assessmentResults: [new AssessmentResult({ pixScore: 10, level: 1, createdAt: new Date('2018-01-01 05:00:00') })],
        state: 'completed',
      });
      assessments = [assessment];

      const expectedCompetences = [
        {
          id: 'competenceId1',
          name: '1.1 Mener une recherche d’information',
          index: '1.1',
          areaId: 'areaId1',
          level: 1,
          pixScore: 10,
          courseId: 'courseId8',
          assessmentId: 'assessmentId1',
          status: 'assessed',
          daysBeforeNewAttempt: 0,
        },
        {
          id: 'competenceId2',
          name: '1.2 Gérer des données',
          index: '1.2',
          areaId: 'areaId2',
          level: -1,
          courseId: 'courseId9',
          status: 'notAssessed',
        }];

      // when
      const profile = new Profile({
        user,
        competences,
        areas,
        lastAssessments: assessments,
        assessmentsCompletedWithResults: assessments,
        courses,
      });

      // then
      expect(profile).to.be.an.instanceof(Profile);
      expect(profile.user).to.be.equal(user);
      expect(profile.competences).to.be.deep.equal(expectedCompetences);
      expect(profile.areas).to.be.equal(areas);
    });

    it('should not assign pixScore and estimatedLevel to user competence if assessment is not completed', function() {
      courses[0].competences = ['competenceId1'];
      lastAssessments = [
        Assessment.fromAttributes({
          id: 'assessmentId1',
          courseId: 'courseId8',
        }),
      ];

      const expectedCompetences = [
        {
          id: 'competenceId1',
          name: '1.1 Mener une recherche d’information',
          index: '1.1',
          areaId: 'areaId1',
          level: -1,
          courseId: 'courseId8',
          assessmentId: 'assessmentId1',
          status: 'assessmentNotCompleted',
        },
        {
          id: 'competenceId2',
          name: '1.2 Gérer des données',
          index: '1.2',
          areaId: 'areaId2',
          level: -1,
          courseId: 'courseId9',
          status: 'notAssessed',
        }];

      // when
      const profile = new Profile({ user, competences, areas, lastAssessments, assessmentsCompletedWithResults: [], courses });

      // then
      expect(profile).to.be.an.instanceof(Profile);
      expect(profile.user).to.be.equal(user);
      expect(profile.competences).to.be.deep.equal(expectedCompetences);
      expect(profile.areas).to.be.equal(areas);
    });

    it('should assign assessment id to competence', function() {
      courses[0].competences = ['competenceId1'];
      courses[1].competences = ['competenceId2'];
      const assessmentA = Assessment.fromAttributes({
        id: 'assessment_A',
        courseId: 'courseId8',
      });
      const assessmentB = Assessment.fromAttributes({
        id: 'assessment_B',
        courseId: 'courseId9',
      });
      lastAssessments = [assessmentA, assessmentB];

      const expectedCompetences = [
        {
          id: 'competenceId1',
          name: '1.1 Mener une recherche d’information',
          index: '1.1',
          areaId: 'areaId1',
          level: -1,
          courseId: 'courseId8',
          assessmentId: 'assessment_A',
          status: 'assessmentNotCompleted',
        },
        {
          id: 'competenceId2',
          name: '1.2 Gérer des données',
          index: '1.2',
          areaId: 'areaId2',
          level: -1,
          courseId: 'courseId9',
          assessmentId: 'assessment_B',
          status: 'assessmentNotCompleted',
        }];

      // when
      const profile = new Profile({ user, competences, areas, lastAssessments, assessmentsCompletedWithResults: [], courses });

      // then
      expect(profile).to.be.an.instanceof(Profile);
      expect(profile.user).to.be.equal(user);
      expect(profile.competences).to.be.deep.equal(expectedCompetences);
      expect(profile.areas).to.be.equal(areas);
    });

    context('when one competence has two completed assessments', () => {

      it('should assign level of competence from assessment with status "assessed"', () => {
        // given
        courses[0].competences = ['competenceId1'];
        assessmentsCompletedWithResults = [
          Assessment.fromAttributes({
            id: 'assessmentId1',
            assessmentResults: [new AssessmentResult({ pixScore: 10, level: 1, createdAt: new Date('2018-01-01 05:00:00') })],
            state: 'completed',
            courseId: 'courseId8',
          }),
          Assessment.fromAttributes({
            id: 'assessmentId2',
            assessmentResults: [new AssessmentResult({ pixScore: 20, level: 2, createdAt: new Date('2018-01-01 05:00:00') })],
            state: 'completed',
            courseId: 'courseId8',
          }),
        ];

        lastAssessments = [
          Assessment.fromAttributes({
            id: 'assessmentId1',
            assessmentResults: [new AssessmentResult({ pixScore: 10, level: 1 })],
            state: 'completed',
            courseId: 'courseId8',
          }),
          Assessment.fromAttributes({
            id: 'assessmentId2',
            assessmentResults: [new AssessmentResult({ pixScore: 20, level: 2 })],
            state: 'completed',
            courseId: 'courseId8',
          }),
        ];

        const expectedCompetences = [
          {
            id: 'competenceId1',
            name: '1.1 Mener une recherche d’information',
            index: '1.1',
            areaId: 'areaId1',
            level: 2,
            pixScore: 20,
            assessmentId: 'assessmentId2',
            status: 'assessed',
            courseId: 'courseId8',
            daysBeforeNewAttempt: 0,
          },
          {
            id: 'competenceId2',
            name: '1.2 Gérer des données',
            index: '1.2',
            areaId: 'areaId2',
            level: -1,
            status: 'notAssessed',
            courseId: 'courseId9',
          }];

        // when
        const profile = new Profile({ user, competences, areas, lastAssessments, assessmentsCompletedWithResults, courses });

        // then
        expect(profile).to.be.an.instanceof(Profile);
        expect(profile.user).to.be.equal(user);
        expect(profile.competences).to.be.deep.equal(expectedCompetences);
        expect(profile.areas).to.be.equal(areas);
      });

    });

    context('when at least one competence is started but not finished', () => {
      it('should assign level of competence at -1 with status "assessmentNotCompleted"', () => {
        // given
        courses[0].competences = ['competenceId1'];
        lastAssessments = [Assessment.fromAttributes({
          id: 'assessmentId3',
          state: 'started',
          courseId: 'courseId8',
        })];

        const expectedCompetences = [
          {
            id: 'competenceId1',
            name: '1.1 Mener une recherche d’information',
            index: '1.1',
            areaId: 'areaId1',
            level: -1,
            status: 'assessmentNotCompleted',
            assessmentId: 'assessmentId3',
            courseId: 'courseId8',
          },
          {
            id: 'competenceId2',
            name: '1.2 Gérer des données',
            index: '1.2',
            areaId: 'areaId2',
            level: -1,
            status: 'notAssessed',
            courseId: 'courseId9',
          }];

        // when
        const profile = new Profile({ user, competences, areas, lastAssessments, assessmentsCompletedWithResults: [], courses });

        // then
        expect(profile).to.be.an.instanceof(Profile);
        expect(profile.user).to.be.equal(user);
        expect(profile.competences).to.be.deep.equal(expectedCompetences);
        expect(profile.areas).to.be.equal(areas);
      });

      it('should assign level of competence from last assessment with status "assessmentNotCompleted"', () => {
        // given
        courses[0].competences = ['competenceId1'];
        lastAssessments = [
          Assessment.fromAttributes({
            id: 'assessmentId2',
            pixScore: null,
            estimatedLevel: null,
            courseId: 'courseId8',
          }),
        ];
        assessmentsCompletedWithResults = [
          Assessment.fromAttributes({
            id: 'assessmentId1',
            assessmentResults: [new AssessmentResult({ pixScore: 10, level: 1 })],
            state: 'completed',
            courseId: 'courseId8',
          }),
        ];

        const expectedCompetences = [
          {
            id: 'competenceId1',
            name: '1.1 Mener une recherche d’information',
            index: '1.1',
            areaId: 'areaId1',
            level: -1,
            assessmentId: 'assessmentId2',
            status: 'assessmentNotCompleted',
            courseId: 'courseId8',
          },
          {
            id: 'competenceId2',
            name: '1.2 Gérer des données',
            index: '1.2',
            areaId: 'areaId2',
            level: -1,
            status: 'notAssessed',
            courseId: 'courseId9',
          }];

        // when
        const profile = new Profile({ user, competences, areas, lastAssessments, assessmentsCompletedWithResults, courses });

        // then
        expect(profile).to.be.an.instanceof(Profile);
        expect(profile.user).to.be.equal(user);
        expect(profile.competences).to.be.deep.equal(expectedCompetences);
        expect(profile.areas).to.be.equal(areas);
      });
    });

    context('when user has one assessment without competence linked to the courseId', () => {

      it('should return the profile only with competences linked to Competences', () => {
        // given
        courses[0].competences = ['competenceId1'];
        assessmentsCompletedWithResults = [
          Assessment.fromAttributes({
            id: 'assessmentId1',
            assessmentResults: [new AssessmentResult({ pixScore: 10, level: 1, createdAt: new Date('2018-01-01 05:00:00') })],
            state: 'completed',
            courseId: 'courseId8',
          }),
          Assessment.fromAttributes({
            id: 'assessmentId2',
            state: 'started',
            courseId: 'DemoCourse',
          }),
        ];

        const expectedCompetences = [
          {
            id: 'competenceId1',
            name: '1.1 Mener une recherche d’information',
            index: '1.1',
            areaId: 'areaId1',
            level: 1,
            pixScore: 10,
            assessmentId: 'assessmentId1',
            status: 'assessed',
            courseId: 'courseId8',
            daysBeforeNewAttempt: 0,
          },
          {
            id: 'competenceId2',
            name: '1.2 Gérer des données',
            index: '1.2',
            areaId: 'areaId2',
            level: -1,
            status: 'notAssessed',
            courseId: 'courseId9',
          },
        ];

        // when
        const profile = new Profile({
          user,
          competences,
          areas,
          lastAssessments: assessmentsCompletedWithResults,
          assessmentsCompletedWithResults,
          courses,
        });

        // then
        expect(profile).to.be.an.instanceof(Profile);
        expect(profile.user).to.equal(user);
        expect(profile.competences).to.deep.equal(expectedCompetences);
        expect(profile.areas).to.equal(areas);

      });
    });

    context('days before having a new attempt on a competence', () => {

      let clock;
      let testCurrentDate;

      beforeEach(() => {
        testCurrentDate = new Date('2018-01-10 05:00:00');
        clock = sinon.useFakeTimers(testCurrentDate.getTime());
      });

      afterEach(() => {
        clock.restore();
      });

      context('when the competence has not been assessed yet, nor is being assessed', () => {

        it('should be undefined', () => {
          // given
          const lastAssessments = [];
          const assessmentsCompletedWithResults = [];
          courses[0].competences = ['competenceId1'];

          // when
          const profile = new Profile({ user, competences, areas, lastAssessments, assessmentsCompletedWithResults, courses });

          // then
          expect(profile.competences[0].daysBeforeNewAttempt).to.be.undefined;
        });

      });

      context('when the competence has not been assessed yet, but is being assessed', () => {

        it('should be undefined', () => {
          // given
          const lastAssessments = [domainBuilder.buildAssessment({ state: 'started' })];
          const assessmentsCompletedWithResults = [];
          courses[0].competences = ['competenceId1'];

          // when
          const profile = new Profile({ user, competences, areas, lastAssessments, assessmentsCompletedWithResults, courses });

          // then
          expect(profile.competences[0].daysBeforeNewAttempt).to.be.undefined;
        });

      });

      context('when the competence is not being assessed and the last evaluation is older than 7 days', () => {

        it('should be 0', () => {
          // given
          const assessmentCreationDate = moment(testCurrentDate).subtract(7, 'day').subtract(5, 'second').toDate();
          const assessmentResults = [domainBuilder.buildAssessmentResult({ createdAt: assessmentCreationDate })];
          const assessment = domainBuilder.buildAssessment({ courseId: courses[0].id, assessmentResults });
          const lastAssessments = [assessment];
          const assessmentsCompletedWithResults = [assessment];
          courses[0].competences = ['competenceId1'];

          // when
          const profile = new Profile({ user, competences, areas, lastAssessments, assessmentsCompletedWithResults, courses });

          // then
          expect(profile.competences[0].daysBeforeNewAttempt).to.equal(0);
        });

      });

      context('when the competence is not being assessed and the last completed assessment is younger than 7 days', () => {

        [
          { daysBefore: 1, hoursBefore: 0, expectedDaysBeforeNewAttempt: 6 },
          { daysBefore: 5, hoursBefore: 0, expectedDaysBeforeNewAttempt: 2 },
          { daysBefore: 5, hoursBefore: 12, expectedDaysBeforeNewAttempt: 2 },
          { daysBefore: 6, hoursBefore: 0, expectedDaysBeforeNewAttempt: 1 },
          { daysBefore: 6, hoursBefore: 11, expectedDaysBeforeNewAttempt: 1 },
          { daysBefore: 6, hoursBefore: 12, expectedDaysBeforeNewAttempt: 1 },
          { daysBefore: 6, hoursBefore: 13, expectedDaysBeforeNewAttempt: 1 },
          { daysBefore: 7, hoursBefore: 0, expectedDaysBeforeNewAttempt: 0 },
          { daysBefore: 10, hoursBefore: 0, expectedDaysBeforeNewAttempt: 0 },
        ].forEach(({ daysBefore, hoursBefore, expectedDaysBeforeNewAttempt }) => {
          it(`should return ${expectedDaysBeforeNewAttempt} days when the last result is ${daysBefore} days and ${hoursBefore} hours old`, () => {
            const assessmentCreationDate = moment(testCurrentDate).subtract(daysBefore, 'day').subtract(hoursBefore, 'hour').toDate();
            const assessmentResults = [domainBuilder.buildAssessmentResult({ createdAt: assessmentCreationDate })];
            const assessment = domainBuilder.buildAssessment({ courseId: courses[0].id, assessmentResults });
            const lastAssessments = [assessment];
            const assessmentsCompletedWithResults = [assessment];
            courses[0].competences = ['competenceId1'];

            // when
            const profile = new Profile({ user, competences, areas, lastAssessments, assessmentsCompletedWithResults, courses });

            // then
            expect(profile.competences[0].daysBeforeNewAttempt).to.equal(expectedDaysBeforeNewAttempt);
          });
        });

      });

    });

    describe('when calculating score', () => {

      beforeEach(() => {
        user = new BookshelfUser({
          'first-name': 'Jean Michel',
          'last-name': 'PasDeChance',
        });

        courses[0].competences = ['competenceId1'];
      });

      it('should add the sum of won pix to the user', () => {
        // given
        courses[1].competences = ['competenceId2'];
        assessments = [
          Assessment.fromAttributes({
            id: 'assessmentId1',
            assessmentResults: [new AssessmentResult({ pixScore: 10, level: 1 })],
            state: 'completed',
            courseId: 'courseId8',
          }),
          Assessment.fromAttributes({
            id: 'assessmentId2',
            assessmentResults: [new AssessmentResult({ pixScore: 15, level: 2 })],
            state: 'completed',
            courseId: 'courseId9',
          }),
        ];

        const expectedUser = {
          'first-name': 'Jean Michel',
          'last-name': 'PasDeChance',
          'pix-score': 25,
        };

        // when
        const profile = new Profile({
          user,
          competences,
          areas,
          lastAssessments: assessments,
          assessmentsCompletedWithResults: assessments,
          courses,
        });

        // then
        expect(profile).to.be.an.instanceof(Profile);
        expect(profile.user.toJSON()).to.deep.equal(expectedUser);
      });

      it('should add the sum of won pix to the user when a competence has no score', () => {
        // given
        assessments = [
          Assessment.fromAttributes({
            id: 'assessmentId1',
            assessmentResults: [new AssessmentResult({ pixScore: 10, level: 1 })],
            state: 'completed',
            courseId: 'courseId8',
          }),
        ];

        const expectedUser = {
          'first-name': 'Jean Michel',
          'last-name': 'PasDeChance',
          'pix-score': 10,
        };

        // when
        const profile = new Profile({
          user,
          competences,
          areas,
          lastAssessments: assessments,
          assessmentsCompletedWithResults: assessments,
          courses,
        });

        // then
        expect(profile).to.be.an.instanceof(Profile);
        expect(profile.user.toJSON()).to.deep.equal(expectedUser);
      });

      it('should not add a total score of pix if the user has no assessment with score', () => {
        // given
        const expectedUser = {
          'first-name': 'Jean Michel',
          'last-name': 'PasDeChance',
        };

        // when
        const profile = new Profile({
          user,
          competences,
          areas,
          lastAssessments: assessments,
          assessmentsCompletedWithResults: assessments,
          courses,
        });

        // then
        expect(profile).to.be.an.instanceof(Profile);
        expect(profile.user.toJSON()).to.deep.equal(expectedUser);
      });
    });
  });
});
