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

  const organization = server.create('organization', {
    id: 1,
    name: 'ACME',
    email: 'contact@acme.com',
    type: 'PRO',
    code: 'ABCD00',
  });

  prescriber.organization = organization;
  organization.user = prescriber;

  const snapshots = server.createList('snapshot', 3, { organization: organization });
  organization.snapshots = snapshots;

}
