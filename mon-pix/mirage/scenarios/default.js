export default function(server) {

  /* eslint max-statements: off */

  server.loadFixtures('areas');
  server.loadFixtures('competences');
  server.loadFixtures('courses');
  server.loadFixtures('challenges');

  server.create('user', {
    id: 1,
    firstName: 'Jane',
    lastName: 'Doe',
    email: 'jane@acme.com',
    password: 'Jane1234',
    cgu: true,
    recaptchaToken: 'recaptcha-token-xxxxxx',
    totalPixScore: 456,
    competenceIds: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
  });

  server.create('user', {
    id: 3,
    firstName: 'JaneExternal',
    lastName: 'Doe',
    email: 'janeExternal@acme.com',
    password: 'Jane1234',
    cgu: true,
    recaptchaToken: 'recaptcha-token-xxxxxx',
    totalPixScore: 456,
    competenceIds: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
  });
  const prescriber = server.create('user', {
    id: 2,
    firstName: 'John',
    lastName: 'Smith',
    email: 'john@acme.com',
    password: 'John1234',
    cgu: true,
    recaptchaToken: 'recaptcha-token-xxxxxx',
  });

  const company = server.create('organization', {
    id: 1,
    name: 'Mon Entreprise',
    email: 'contact@company.com',
    type: 'PRO',
    code: 'PRO001',
  });

  server.create('organization', {
    id: 2,
    name: 'Mon École',
    email: 'contact@school.org',
    type: 'SCO',
    code: 'SCO002',
  });

  server.create('organization', {
    id: 3,
    name: 'Mon Université',
    email: 'contact@university.org',
    type: 'SUP',
    code: 'SUP003',
  });

  server.create('course', {
    id: 'certification-number',
    nbChallenges: 3,
    type: 'CERTIFICATION',
  });

  server.create('skill-review', {
    id: 12
  });

  server.create('certification', {
    id: '1',
    date: new Date('2018-02-15T15:15:52.504Z'),
    status: 'rejected',
    pixScore: '3789',
    isPublished: true,
    certificationCenter: 'Université de Paris',
    commentForCandidate: 'Ceci est un commentaire jury à destination du candidat.',
  });

  server.create('certification', {
    id: '2',
    date: new Date('2018-02-15T15:15:52.504Z'),
    birthdate: new Date('1994-07-10'),
    firstName:'Jean',
    lastName:'Bon',
    status: 'rejected',
    pixScore: '6546',
    isPublished: false,
    certificationCenter: 'Université de Lyon',
  });

  server.create('correction');

  server.create('campaign', {
    id: 1,
    name: 'Campagne 1 avec Id Externe',
    code: 'AZERTY1',
    idPixLabel: 'Mail Pro',
    organizationLogoUrl: 'data:jpeg;base64=somelogo',
  });
  server.create('campaign', {
    id: 2,
    name: 'Campagne 2 sans Id Externe',
    code: 'AZERTY2',
    idPixLabel: null,
  });

  server.create('campaign', {
    code: 'codecampagnepix',
    title: 'Le Titre de la campagne'
  });

  prescriber.organization = company;
  company.user = prescriber;

  const snapshots = server.createList('snapshot', 3, { organization: company });

  company.snapshots = snapshots;
}
