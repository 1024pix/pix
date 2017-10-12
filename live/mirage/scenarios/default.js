export default function(server) {

  const courses = server.createList('course', 2, { name: 'course name' });
  server.createList('courseGroup', 3, { courses });

  server.loadFixtures('areas');
  server.loadFixtures('competences');

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

  prescriber.organization = company;
  company.user = prescriber;

  const snapshots = server.createList('snapshot', 3, { organization: company });
  company.snapshots = snapshots;

}
