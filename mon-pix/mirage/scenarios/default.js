import demoData from '../data/demo';

export default function(server) {
  /* eslint max-statements: off */
  server.loadFixtures('challenges');

  server.create('progression', {
    id: 12
  });

  server.create('certification', {
    id: '1',
    date: new Date('2018-02-15T15:15:52Z'),
    status: 'rejected',
    pixScore: '3789',
    isPublished: true,
    certificationCenter: 'Université de Paris',
    commentForCandidate: 'Ceci est un commentaire jury à destination du candidat.',
  });

  server.create('certification', {
    id: '2',
    date: new Date('2018-02-15T15:15:52Z'),
    birthdate: '1994-07-10',
    birthplace: 'Paris',
    firstName:'Jean',
    lastName:'Bon',
    status: 'rejected',
    pixScore: '6546',
    isPublished: false,
    certificationCenter: 'Université de Lyon',
  });

  server.create('correction');

  const campaign1 = server.create('campaign', {
    id: 1,
    name: 'Campagne 1 avec Id Externe',
    code: 'AZERTY1',
    idPixLabel: 'Mail Pro',
    organizationLogoUrl: 'data:jpeg;base64=somelogo',
  });

  const campaign2 = server.create('campaign', {
    id: 2,
    name: 'Campagne 2 sans Id Externe',
    code: 'AZERTY2',
    idPixLabel: null,
  });

  const campaign3 = server.create('campaign', {
    id: 3,
    code: 'AZERTY3',
    title: 'Le Titre de la campagne'
  });

  const campaign4 = server.create('campaign', {
    id: 4,
    name: 'Campagne 4 resteinte',
    code: 'AZERTY4',
    idPixLabel: 'Mail Pro',
    organizationLogoUrl: 'data:jpeg;base64=somelogo',
    isRestricted: true,
  });

  const campaign5 = server.create('campaign', {
    id: 5,
    name: 'Campagne 5 resteinte',
    code: 'RESTRICTD',
    idPixLabel: 'Mail Pro',
    organizationLogoUrl: 'data:jpeg;base64=somelogo',
    organizationName: 'College Victor Hugo',
    isRestricted: true,
  });

  const targetProfile = server.create('target-profile', {
    name: 'Target Profile'
  });
  campaign1.targetProfile = targetProfile;
  campaign2.targetProfile = targetProfile;
  campaign3.targetProfile = targetProfile;
  campaign4.targetProfile = targetProfile;
  campaign5.targetProfile = targetProfile;

  server.create('password-reset-demand', {
    temporaryKey: 'temporaryKey',
    email: 'jane@acme.com',
  });

  // DEMO
  demoData.demoChallengeIds.forEach((challengeId) => {
    server.create('challenge', {
      id: challengeId,
      type: 'QROC',
      instruction: 'Un QROC est une question ouverte avec un simple champ texte libre pour répondre',
      proposals: 'Ecris ce que tu veux !',
    });
  });
  server.create('course', {
    id: demoData.demoCourseId,
    description: 'Demo course',
    nbChallenges: demoData.demoChallengeIds.length,
    type: 'DEMO',
  });
}
