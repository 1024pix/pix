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
  this.namespace = '/api';

  this.post('/memberships');

  this.get('/organizations/:id');

  this.get('/users', (schema, request) => {
    let users = schema.users;

    if (!request.queryParams) {
      return users;
    }

    if (request.queryParams.organizationId) {
      const organizationId = request.queryParams.organizationId;
      const memberships = schema.memberships.where({ organizationId });
      const userIds = memberships.models.map(membership => membership.userId);
      users = users.find(userIds);
    }

    if (request.queryParams.email) {
      const email = request.queryParams.email;
      users = users.where({ email });
    }

    return users;

  });

}
