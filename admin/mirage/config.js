import { createMembership } from './handlers/memberships';
import { getOrganizationMemberships } from './handlers/organizations';
import { getCertificationsBySessionId } from './handlers/certifications-by-session-id';
import { upload } from 'ember-file-upload/mirage';

export default function() {

  // These comments are here to help you get started. Feel free to delete them.

  /*
    Config (with defaults).

    Note: these only affect routes defined *after* them!
  */

  // this.urlPrefix = '';    // make this `http://localhost:8080`, for example, if your API is on a different server
  // this.namespace = '';    // make this `/api`, for example, if your API is namespaced
  // this.timing = 400;      // delay for each request, automatically set to 0 during testing

  /*
    Shorthand cheatsheet:

    this.get('/posts');
    this.post('/posts');
    this.get('/posts/:id');
    this.put('/posts/:id'); // or this.patch
    this.del('/posts/:id');

    http://www.ember-cli-mirage.com/docs/v0.4.x/shorthands/
  */
  this.logging = true;
  this.urlPrefix = 'http://localhost:3000';
  this.namespace = 'api';

  this.get('/users');

  this.post('/memberships', createMembership);
  this.get('/organizations');
  this.get('/organizations/:id');
  this.get('/organizations/:id/memberships', getOrganizationMemberships);

  this.get('/sessions/:id');
  this.get('/sessions/:id/certifications', getCertificationsBySessionId);
  this.get('/admin/certifications/:id');

  this.put('/sessions/:id/results-sent-to-prescriber', (schema, request) => {
    const sessionId = request.params.id;
    const session = schema.sessions.findBy({ id: sessionId });
    session.update({ resultsSentToPrescriberAt: new Date() });
    return session;
  });

  this.put('/sessions/:id/certifications/attendance-sheet-analysis', upload(function() {
    return [
      { lastName: 'Lantier',
        firstName: 'Étienne',
        birthdate: '1990-01-04',
        birthplace: 'Ajaccio',
        email: null,
        externalId: 'ELAN123',
        extraTimePercentage: null,
        signature: 'x',
        certificationId: '2',
        lastScreen: 'x',
        comments: null,
      },
      { lastName: 'Ranou',
        firstName: 'Liam',
        birthdate: '2000-10-22',
        birthplace: null,
        email: null,
        externalId: null,
        extraTimePercentage: null,
        signature: null,
        certificationId: '3',
        lastScreen: 'x',
        comments: 'Commentaire',
      }];
  }));

}
