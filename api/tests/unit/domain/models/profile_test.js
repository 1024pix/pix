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

    let clock;
    let testCurrentDate;

    beforeEach(() => {
      testCurrentDate = new Date('2018-01-10 05:00:00');
      clock = sinon.useFakeTimers(testCurrentDate.getTime());
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

    afterEach(() => {
      clock.restore();
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
          isRetryable: true,
        },
        {
          id: 'competenceId2',
          name: '1.2 Gérer des données',
          index: '1.2',
          areaId: 'areaId2',
          level: -1,
          courseId: 'courseId9',
          status: 'notAssessed',
          isRetryable: false,
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

    it('should assign assessment id to competence', () => {
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
          isRetryable: false,
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
          isRetryable: false,
        }];

      // when
      const profile = new Profile({ user, competences, areas, lastAssessments, assessmentsCompletedWithResults: [], courses });

      // then
      expect(profile).to.be.an.instanceof(Profile);
      expect(profile.user).to.be.equal(user);
      expect(profile.competences).to.be.deep.equal(expectedCompetences);
      expect(profile.areas).to.be.equal(areas);
    });

    context('when there is one assessment with no competence linked to the courseId', () => {

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
            isRetryable: true,
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
            isRetryable: false,
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

    context('when a competence has not been assessed yet, nor is being assessed', () => {

      let lastAssessments;
      let assessmentsCompletedWithResults;

      beforeEach(() => {
        lastAssessments = [];
        assessmentsCompletedWithResults = [];
        courses[0].competences = ['competenceId1'];
      });

      it('should set the status to "notAssessed', () => {
        // when
        const profile = new Profile({ user, competences, areas, lastAssessments, assessmentsCompletedWithResults, courses });

        // then
        expect(profile.competences[0].status).to.equal('notAssessed');
      });

      it('should set "daysBeforeNewAttempt" to undefined', () => {
        // when
        const profile = new Profile({ user, competences, areas, lastAssessments, assessmentsCompletedWithResults, courses });

        // then
        expect(profile.competences[0].daysBeforeNewAttempt).to.be.undefined;
      });

      it('should not be retryable', () => {
        // when
        const profile = new Profile({ user, competences, areas, lastAssessments, assessmentsCompletedWithResults, courses });

        // then
        expect(profile.competences[0].isRetryable).to.be.false;
      });

    });

    context('when a competence has not been assessed yet, and is being assessed', () => {

      it('should not assign pixScore and estimatedLevel', () => {
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
            isRetryable: false,
          },
          {
            id: 'competenceId2',
            name: '1.2 Gérer des données',
            index: '1.2',
            areaId: 'areaId2',
            level: -1,
            courseId: 'courseId9',
            status: 'notAssessed',
            isRetryable: false,
          }];

        // when
        const profile = new Profile({ user, competences, areas, lastAssessments, assessmentsCompletedWithResults: [], courses });

        // then
        expect(profile).to.be.an.instanceof(Profile);
        expect(profile.user).to.be.equal(user);
        expect(profile.competences).to.be.deep.equal(expectedCompetences);
        expect(profile.areas).to.be.equal(areas);
      });

      it('should assign level of competence at -1 with status "assessmentNotCompleted"', () => {
        // given
        courses[0].competences = ['competenceId1'];
        lastAssessments = [
          Assessment.fromAttributes({
            id: 'assessmentId2',
            pixScore: null,
            estimatedLevel: null,
            courseId: 'courseId8',
            state: 'started',
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
            isRetryable: false,
          },
          {
            id: 'competenceId2',
            name: '1.2 Gérer des données',
            index: '1.2',
            areaId: 'areaId2',
            level: -1,
            status: 'notAssessed',
            courseId: 'courseId9',
            isRetryable: false,
          }];

        // when
        const profile = new Profile({ user, competences, areas, lastAssessments, assessmentsCompletedWithResults, courses });

        // then
        expect(profile).to.be.an.instanceof(Profile);
        expect(profile.user).to.be.equal(user);
        expect(profile.competences).to.be.deep.equal(expectedCompetences);
        expect(profile.areas).to.be.equal(areas);
      });

      it('should set "daysBeforeNewAttempt" to undefined', () => {
        // given
        const lastAssessments = [domainBuilder.buildAssessment({ state: 'started' })];
        const assessmentsCompletedWithResults = [];
        courses[0].competences = ['competenceId1'];

        // when
        const profile = new Profile({ user, competences, areas, lastAssessments, assessmentsCompletedWithResults, courses });

        // then
        expect(profile.competences[0].daysBeforeNewAttempt).to.be.undefined;
      });

      it('should not be retryable', () => {
        // given
        const lastAssessments = [domainBuilder.buildAssessment({ state: 'started' })];
        const assessmentsCompletedWithResults = [];
        courses[0].competences = ['competenceId1'];

        // when
        const profile = new Profile({ user, competences, areas, lastAssessments, assessmentsCompletedWithResults, courses });

        // then
        expect(profile.competences[0].isRetryable).to.be.false;
      });

    });

    context('when a competence has already been assessed, and is not actually being assessed again', () => {

      context('and there is one completed assessment which is younger than 7 days', () => {

        it('should set status to "assessed"', () => {
          // given

          const lastAssessmentCreationDate = moment(testCurrentDate).subtract(3, 'day').toDate();
          const lastAssessmentResults = [domainBuilder.buildAssessmentResult({ createdAt: lastAssessmentCreationDate })];
          const lastAssessment = domainBuilder.buildAssessment({ courseId: courses[0].id, assessmentResults: lastAssessmentResults });

          const lastAssessments = [lastAssessment];
          const assessmentsCompletedWithResults = [lastAssessment];
          courses[0].competences = ['competenceId1'];

          // when
          const profile = new Profile({ user, competences, areas, lastAssessments, assessmentsCompletedWithResults, courses });

          // then
          expect(profile.competences[0].status).to.equal('assessed');
        });

        it('should not be retryable', () => {
          // given
          const lastAssessmentCreationDate = moment(testCurrentDate).subtract(3, 'day').toDate();
          const lastAssessmentResults = [domainBuilder.buildAssessmentResult({ createdAt: lastAssessmentCreationDate })];
          const lastAssessment = domainBuilder.buildAssessment({ courseId: courses[0].id, assessmentResults: lastAssessmentResults });

          const lastAssessments = [lastAssessment];
          const assessmentsCompletedWithResults = [lastAssessment];
          courses[0].competences = ['competenceId1'];

          // when
          const profile = new Profile({ user, competences, areas, lastAssessments, assessmentsCompletedWithResults, courses });

          // then
          expect(profile.competences[0].isRetryable).to.be.false;
        });

        [
          { daysBefore: 0, hoursBefore: 2, expectedDaysBeforeNewAttempt: 7 },
          { daysBefore: 1, hoursBefore: 0, expectedDaysBeforeNewAttempt: 6 },
          { daysBefore: 5, hoursBefore: 0, expectedDaysBeforeNewAttempt: 2 },
          { daysBefore: 5, hoursBefore: 12, expectedDaysBeforeNewAttempt: 2 },
          { daysBefore: 6, hoursBefore: 0, expectedDaysBeforeNewAttempt: 1 },
          { daysBefore: 6, hoursBefore: 11, expectedDaysBeforeNewAttempt: 1 },
          { daysBefore: 6, hoursBefore: 12, expectedDaysBeforeNewAttempt: 1 },
          { daysBefore: 6, hoursBefore: 13, expectedDaysBeforeNewAttempt: 1 },
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

      context('and there is one completed assessment which is older than 7 days', () => {

        it('should set status to "assessed"', () => {
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
          expect(profile.competences[0].status).to.equal('assessed');
        });

        it('should set "daysBeforeNewAttempt" to undefined', () => {
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
          expect(profile.competences[0].daysBeforeNewAttempt).to.be.undefined;
        });

        it('should be retryable', () => {
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
          expect(profile.competences[0].isRetryable).to.be.true;
        });

        [
          { daysBefore: 7, hoursBefore: 0, expectedDaysBeforeNewAttempt: undefined },
          { daysBefore: 10, hoursBefore: 0, expectedDaysBeforeNewAttempt: undefined },
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

      context('and there is 2 completed assessments and only the last one is younger than 7 days', () => {

        it('should set status to "assessed"', () => {
          // given
          const oldAssessmentCreationDate = moment(testCurrentDate).subtract(7, 'day').subtract(5, 'second').toDate();
          const oldAssessmentResults = [domainBuilder.buildAssessmentResult({ createdAt: oldAssessmentCreationDate })];
          const oldAssessment = domainBuilder.buildAssessment({ courseId: courses[0].id, assessmentResults: oldAssessmentResults });

          const lastAssessmentCreationDate = moment(testCurrentDate).subtract(3, 'day').toDate();
          const lastAssessmentResults = [domainBuilder.buildAssessmentResult({ createdAt: lastAssessmentCreationDate })];
          const lastAssessment = domainBuilder.buildAssessment({ courseId: courses[0].id, assessmentResults: lastAssessmentResults });

          const lastAssessments = [oldAssessment, lastAssessment];
          const assessmentsCompletedWithResults = [oldAssessment, lastAssessment];
          courses[0].competences = ['competenceId1'];

          // when
          const profile = new Profile({ user, competences, areas, lastAssessments, assessmentsCompletedWithResults, courses });

          // then
          expect(profile.competences[0].status).to.equal('assessed');
        });

        it('should not be retryable', () => {
          // given
          const oldAssessmentCreationDate = moment(testCurrentDate).subtract(7, 'day').subtract(5, 'second').toDate();
          const oldAssessmentResults = [domainBuilder.buildAssessmentResult({ createdAt: oldAssessmentCreationDate })];
          const oldAssessment = domainBuilder.buildAssessment({ courseId: courses[0].id, assessmentResults: oldAssessmentResults });

          const lastAssessmentCreationDate = moment(testCurrentDate).subtract(3, 'day').toDate();
          const lastAssessmentResults = [domainBuilder.buildAssessmentResult({ createdAt: lastAssessmentCreationDate })];
          const lastAssessment = domainBuilder.buildAssessment({ courseId: courses[0].id, assessmentResults: lastAssessmentResults });

          const lastAssessments = [oldAssessment, lastAssessment];
          const assessmentsCompletedWithResults = [oldAssessment, lastAssessment];
          courses[0].competences = ['competenceId1'];

          // when
          const profile = new Profile({ user, competences, areas, lastAssessments, assessmentsCompletedWithResults, courses });

          // then
          expect(profile.competences[0].isRetryable).to.be.false;
        });

        it('should indicate the number of days to wait before new attempt', () => {
          // given
          const oldAssessmentCreationDate = moment(testCurrentDate).subtract(7, 'day').subtract(5, 'second').toDate();
          const oldAssessmentResults = [domainBuilder.buildAssessmentResult({ createdAt: oldAssessmentCreationDate })];
          const oldAssessment = domainBuilder.buildAssessment({ courseId: courses[0].id, assessmentResults: oldAssessmentResults });

          const lastAssessmentCreationDate = moment(testCurrentDate).subtract(3, 'day').toDate();
          const lastAssessmentResults = [domainBuilder.buildAssessmentResult({ createdAt: lastAssessmentCreationDate })];
          const lastAssessment = domainBuilder.buildAssessment({ courseId: courses[0].id, assessmentResults: lastAssessmentResults });

          const lastAssessments = [oldAssessment, lastAssessment];
          const assessmentsCompletedWithResults = [oldAssessment, lastAssessment];
          courses[0].competences = ['competenceId1'];

          // when
          const profile = new Profile({ user, competences, areas, lastAssessments, assessmentsCompletedWithResults, courses });

          // then
          expect(profile.competences[0].daysBeforeNewAttempt).to.equal(4);
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
