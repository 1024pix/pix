import { Factory, trait } from 'miragejs';
import faker from 'faker';
import sumBy from 'lodash/sumBy';

function _addDefaultProfile(user, server) {
  if (!user.profile) {
    const pixScoreValue = sumBy(user.scorecards.models, 'earnedPix');

    user.update({
      profile: server.create('profile', {
        pixScore: pixScoreValue,
        scorecards: user.scorecards,
      }),
    });
  }
}

function _addDefaultIsCertifiable(user, server) {
  if (!user.isCertifiable) {
    user.update({ isCertifiable: server.create('is-certifiable', { 'is-certifiable': false }) });
  }
}

function _addDefaultScorecards(user, server) {
  if (!user.scorecards || user.scorecards.length === 0) {
    const areas = _createAreas(server);
    const tutorial = _createTutorial(server);
    const scorecards = [];
    scorecards.push(
      server.create('scorecard', {
        id: `${user.id}_competence_1_1_id`,
        name: 'Area_1_Competence_1_name',
        description: 'Area_1_Competence_1_description',
        earnedPix: 22,
        level: 2,
        pixScoreAheadOfNextLevel: 3.2,
        percentageAheadOfNextLevel: 20,
        isFinishedWithMaxLevel: false,
        isFinished: false,
        isNotStarted: false,
        isStarted: true,
        isMaxLevel: false,
        isProgressable: true,
        isImprovable: true,
        shouldWaitBeforeImproving: true,
        isResettable: true,
        hasNotEarnedAnything: false,
        hasNotReachedLevelOne: false,
        hasReachedAtLeastLevelOne: true,
        remainingPixToNextLevel: 6,
        area: areas[0],
        competenceId: 'competence_1_1_id',
        index: `${areas[0].code}.1`,
        remainingDaysBeforeReset: 0,
        remainingDaysBeforeImproving: 0,
        tutorials: [tutorial],
      })
    );
    scorecards.push(
      server.create('scorecard', {
        id: `${user.id}_competence_2_1_id`,
        name: 'Area_2_Competence_1_name',
        description: 'Area_2_Competence_1_description',
        earnedPix: 35,
        level: 3,
        pixScoreAheadOfNextLevel: 7.2,
        percentageAheadOfNextLevel: 20,
        isFinishedWithMaxLevel: true,
        isFinished: false,
        isNotStarted: false,
        isStarted: true,
        isMaxLevel: false,
        isProgressable: true,
        isImprovable: true,
        shouldWaitBeforeImproving: true,
        isResettable: false,
        hasNotEarnedAnything: false,
        hasNotReachedLevelOne: false,
        hasReachedAtLeastLevelOne: true,
        remainingPixToNextLevel: 6,
        area: areas[1],
        competenceId: 'competence_2_1_id',
        index: `${areas[1].code}.1`,
        remainingDaysBeforeReset: 5,
        remainingDaysBeforeImproving: 0,
      })
    );
    scorecards.push(
      server.create('scorecard', {
        id: `${user.id}_competence_2_2_id`,
        name: 'Area_2_Competence_2_name',
        description: 'Area_2_Competence_2_description',
        earnedPix: 0,
        level: 0,
        pixScoreAheadOfNextLevel: 0,
        percentageAheadOfNextLevel: 0,
        isFinishedWithMaxLevel: false,
        isFinished: false,
        isNotStarted: true,
        isStarted: false,
        isMaxLevel: false,
        isProgressable: false,
        isImprovable: true,
        shouldWaitBeforeImproving: true,
        isResettable: false,
        hasNotEarnedAnything: false,
        hasNotReachedLevelOne: false,
        hasReachedAtLeastLevelOne: true,
        remainingPixToNextLevel: 6,
        area: areas[1],
        competenceId: 'competence_2_2_id',
        index: `${areas[1].code}.2`,
        remainingDaysBeforeReset: null,
        remainingDaysBeforeImproving: null,
      })
    );
    scorecards.push(
      server.create('scorecard', {
        id: `${user.id}_competence_3_1_id`,
        name: 'Area_3_Competence_1_name',
        description: 'Area_3_Competence_1_description',
        earnedPix: 99,
        level: 6,
        pixScoreAheadOfNextLevel: 0,
        percentageAheadOfNextLevel: 100,
        isFinishedWithMaxLevel: true,
        isFinished: true,
        isNotStarted: false,
        isStarted: false,
        isMaxLevel: false,
        isProgressable: true,
        isImprovable: true,
        shouldWaitBeforeImproving: true,
        isResettable: false,
        hasNotEarnedAnything: false,
        hasNotReachedLevelOne: false,
        hasReachedAtLeastLevelOne: true,
        remainingPixToNextLevel: 6,
        area: areas[2],
        competenceId: 'competence_3_1_id',
        index: `${areas[1].code}.1`,
        remainingDaysBeforeReset: 0,
        remainingDaysBeforeImproving: 0,
      })
    );
    scorecards.push(
      server.create('scorecard', {
        id: `${user.id}_competence_4_1_id`,
        name: 'Area_4_Competence_1_name',
        description: 'Area_4_Competence_1_description',
        earnedPix: 0,
        level: 0,
        pixScoreAheadOfNextLevel: 0,
        percentageAheadOfNextLevel: 20,
        isFinishedWithMaxLevel: false,
        isFinished: true,
        isNotStarted: false,
        isStarted: false,
        isMaxLevel: false,
        isProgressable: true,
        isImprovable: false,
        shouldWaitBeforeImproving: true,
        isResettable: false,
        hasNotEarnedAnything: false,
        hasNotReachedLevelOne: false,
        hasReachedAtLeastLevelOne: true,
        remainingPixToNextLevel: 6,
        area: areas[3],
        competenceId: 'competence_4_1_id',
        index: `${areas[3].code}.1`,
        remainingDaysBeforeReset: 0,
        remainingDaysBeforeImproving: 3,
      })
    );
    scorecards.push(
      server.create('scorecard', {
        id: `${user.id}_competence_4_2_id`,
        name: 'Area_4_Competence_2_name',
        description: 'Area_4_Competence_2_description',
        earnedPix: 0,
        level: 0,
        pixScoreAheadOfNextLevel: 0,
        percentageAheadOfNextLevel: 0,
        isFinishedWithMaxLevel: false,
        isFinished: true,
        isNotStarted: false,
        isStarted: false,
        isMaxLevel: false,
        isProgressable: false,
        isImprovable: true,
        shouldWaitBeforeImproving: true,
        isResettable: false,
        hasNotEarnedAnything: false,
        hasNotReachedLevelOne: false,
        hasReachedAtLeastLevelOne: true,
        remainingPixToNextLevel: 6,
        area: areas[3],
        competenceId: 'competence_4_2_id',
        index: `${areas[3].code}.2`,
        remainingDaysBeforeReset: 0,
        remainingDaysBeforeImproving: 0,
      })
    );
    user.update({ scorecards });
  }
}

function _createAreas(server) {
  const areas = [];
  areas.push(server.create('area', { code: 1, title: 'Area_1_title', color: 'jaffa' }));
  areas.push(server.create('area', { code: 2, title: 'Area_2_title', color: 'emerald' }));
  areas.push(server.create('area', { code: 3, title: 'Area_3_title', color: 'cerulean' }));
  areas.push(server.create('area', { code: 4, title: 'Area_4_title', color: 'wild-strawberry' }));
  return areas;
}

function _createTutorial(server) {
  return server.create('tutorial', {
    title: 'tuto_1_title',
    'tube-name': '@tube_1_name',
    'tube-practical-title': 'tube_1_practical_title',
    'tube-practical-description': 'tube_1_practical_description',
    duration: '00:15:00',
    format: 'page',
    link: 'www.monlien.net',
    source: 'Pix',
  });
}

export default Factory.extend({
  firstName() {
    return faker.name.firstName();
  },
  lastName() {
    return faker.name.lastName();
  },
  cgu() {
    return false;
  },
  lang() {
    return 'fr';
  },
  isAnonymous() {
    return false;
  },
  shouldChangePassword: trait({
    shouldChangePassword: true,
  }),
  withEmail: trait({
    email: faker.internet.exampleEmail(),
    password: faker.internet.password(),
  }),
  withUsername: trait({
    username: faker.internet.userName(),
    password: faker.internet.password(),
  }),
  external: trait({
    lastName: 'Last',
    firstName: 'First',
    email: null,
    username: null,
    password: faker.internet.password(),
  }),
  hasNotValidatedCgu: trait({
    cgu: false,
  }),
  hasSeenNewDashboardInfo: trait({
    hasSeenNewDashboardInfo: true,
  }),
  withAssessmentParticipations: trait({
    hasAssessmentParticipations: true,
  }),
  certifiable: trait({
    afterCreate(user, server) {
      user.update({ isCertifiable: server.create('is-certifiable', { 'is-certifiable': true }) });
    },
  }),
  notCertifiable: trait({
    afterCreate(user, server) {
      user.update({ isCertifiable: server.create('is-certifiable', { 'is-certifiable': false }) });
    },
  }),
  campaignParticipations: trait({
    afterCreate(user, server) {
      user.update({
        campaignParticipations: [
          server.create('campaign-participation', {
            campaign: server.create('campaign', { type: 'ASSESSMENT' }),
          }),
        ],
      });
    },
  }),
  withSomeCertificates: trait({
    afterCreate(user, server) {
      const rejectedCertificate = server.create('certification', {
        firstName: user.firstName,
        lastName: user.lastName,
        birthdate: '2000-01-01',
        certificationCenter: 'Université de Pix',
        commentForCandidate: 'Ceci est un commentaire jury à destination du candidat.',
        date: new Date('2018-07-20T14:23:56Z'),
        status: 'rejected',
        pixScore: '50',
        isPublished: true,
        user,
      });
      const validatedCertificate = server.create('certification', {
        firstName: user.firstName,
        lastName: user.lastName,
        birthdate: '2000-01-01',
        certificationCenter: 'Université de Pix',
        commentForCandidate: 'Ceci est un commentaire jury à destination du candidat.',
        date: new Date('2018-07-20T14:33:56Z'),
        status: 'validated',
        pixScore: '777',
        isPublished: true,
        user,
      });
      const certificates = [rejectedCertificate, validatedCertificate];
      user.update({ certifications: certificates });
    },
  }),
  withSomeTrainings: trait({
    hasRecommendedTrainings: true,
    afterCreate(user, server) {
      const training = server.create('training', {
        title: 'Devenir tailleur de citrouille',
        link: 'http://www.example2.net',
        type: 'autoformation',
        duration: '10:00:00',
        locale: 'fr-fr',
        editorName: "Ministère de l'éducation nationale et de la jeunesse",
        editorLogoUrl: 'https://mon-logo.svg',
      });
      const anotherTraining = server.create('training', {
        title: 'Apprendre à piloter des chauves-souris',
        link: 'http://www.example2.net',
        type: 'webinaire',
        duration: '10:00:00',
        locale: 'fr-fr',
        editorName: "Ministère de l'éducation nationale et de la jeunesse",
        editorLogoUrl: 'https://mon-logo.svg',
      });
      const trainings = [training, anotherTraining];
      user.update({ trainings });
    },
  }),
  afterCreate(user, server) {
    _addDefaultIsCertifiable(user, server);
    _addDefaultScorecards(user, server);
    _addDefaultProfile(user, server);
  },
});
