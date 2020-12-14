import { Factory, trait } from 'ember-cli-mirage';
import faker from 'faker';
import sumBy from 'lodash/sumBy';

function _addDefaultProfile(user, server) {
  if (!user.profile) {
    const pixScoreValue = sumBy(user.scorecards.models, 'earnedPix');

    user.update({ profile: server.create('profile', {
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
    scorecards.push(server.create('scorecard', {
      id: `${user.id}_competence_1_1_id`,
      name: 'Area_1_Competence_1_name',
      description: 'Area_1_Competence_1_description',
      earnedPix: 22,
      level: 2,
      pixScoreAheadOfNextLevel: 3.2,
      area: areas[0],
      competenceId: 'competence_1_1_id',
      index: `${areas[0].code}.1`,
      remainingDaysBeforeReset: 0,
      remainingDaysBeforeImproving: 0,
      status: 'STARTED',
      tutorials: [tutorial],
    }));
    scorecards.push(server.create('scorecard', {
      id: `${user.id}_competence_2_1_id`,
      name: 'Area_2_Competence_1_name',
      description: 'Area_2_Competence_1_description',
      earnedPix: 35,
      level: 3,
      pixScoreAheadOfNextLevel: 7.2,
      area: areas[1],
      competenceId: 'competence_2_1_id',
      index: `${areas[1].code}.1`,
      remainingDaysBeforeReset: 5,
      remainingDaysBeforeImproving: 0,
      status: 'STARTED',
    }));
    scorecards.push(server.create('scorecard', {
      id: `${user.id}_competence_2_2_id`,
      name: 'Area_2_Competence_2_name',
      description: 'Area_2_Competence_2_description',
      earnedPix: 0,
      level: 0,
      pixScoreAheadOfNextLevel: 0,
      area: areas[1],
      competenceId: 'competence_2_2_id',
      index: `${areas[1].code}.2`,
      remainingDaysBeforeReset: null,
      remainingDaysBeforeImproving: null,
      status: 'NOT_STARTED',
    }));
    scorecards.push(server.create('scorecard', {
      id: `${user.id}_competence_3_1_id`,
      name: 'Area_3_Competence_1_name',
      description: 'Area_3_Competence_1_description',
      earnedPix: 99,
      level: 6,
      pixScoreAheadOfNextLevel: 0,
      area: areas[2],
      competenceId: 'competence_3_1_id',
      index: `${areas[1].code}.1`,
      remainingDaysBeforeReset: 0,
      remainingDaysBeforeImproving: 0,
      status: 'COMPLETED',
    }));
    scorecards.push(server.create('scorecard', {
      id: `${user.id}_competence_4_1_id`,
      name: 'Area_4_Competence_1_name',
      description: 'Area_4_Competence_1_description',
      earnedPix: 0,
      level: 0,
      pixScoreAheadOfNextLevel: 0,
      area: areas[3],
      competenceId: 'competence_4_1_id',
      index: `${areas[3].code}.1`,
      remainingDaysBeforeReset: 0,
      remainingDaysBeforeImproving: 3,
      status: 'COMPLETED',
    }));
    scorecards.push(server.create('scorecard', {
      id: `${user.id}_competence_4_2_id`,
      name: 'Area_4_Competence_2_name',
      description: 'Area_4_Competence_2_description',
      earnedPix: 0,
      level: 0,
      pixScoreAheadOfNextLevel: 0,
      area: areas[3],
      competenceId: 'competence_4_2_id',
      index: `${areas[3].code}.2`,
      remainingDaysBeforeReset: 0,
      remainingDaysBeforeImproving: 0,
      status: 'COMPLETED',
    }));
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
  withRecaptchaToken: trait({
    recaptchaToken: faker.random.uuid(),
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
  afterCreate(user, server) {
    _addDefaultIsCertifiable(user, server);
    _addDefaultScorecards(user, server);
    _addDefaultProfile(user, server);
  },
});
