export default function(server) {

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
    competenceIds: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]
  });

  const prescriber = server.create('user', {
    id: 2,
    firstName: 'John',
    lastName: 'Smith',
    email: 'john@acme.com',
    password: 'John1234',
    cgu: true,
    recaptchaToken: 'recaptcha-token-xxxxxx'
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
    type: 'CERTIFICATION'
  });

  server.create('certification', {
    id: '1',
    date: '14/08/1993',
    status: 'completed',
    score: '3789',
    certificationCenter: 'Université de Paris',
  });

  server.create('certification', {
    id: '2',
    date: '11/07/2000',
    status: 'completed',
    score: '3789101',
    certificationCenter: 'Université de Lyon',
  });

  server.create('correction');

  prescriber.organization = company;
  company.user = prescriber;

  const snapshots = server.createList('snapshot', 3, { organization: company });

  company.snapshots = snapshots;
}
