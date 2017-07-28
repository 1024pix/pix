const { describe, it, after, expect, afterEach, knex } = require('../../test-helper');
const server = require('../../../server');

describe('Acceptance | Controller | organization-controller', function() {

  after(function(done) {
    server.stop(done);
  });

  describe('POST /api/organizations', function() {
    const payload = {
      data: {
        type: 'organizations',
        attributes: {
          name: 'The name of the organization',
          email: 'organization@email.com',
          type: 'PRO',
          'first-name': 'Steve',
          'last-name': 'Travail',
          password: 'Pix1024#'
        }
      }
    };
    const options = {
      method: 'POST', url: '/api/organizations', payload
    };

    afterEach(() => {
      return knex('users').delete()
        .then(() => {
          return knex('organizations').delete();
        });
    });

    it('should return 200 HTTP status code', () => {
      return server.inject(options).then((response) => {
        expect(response.statusCode).to.equal(200);
      });
    });

    it('should return 400 HTTP status code when creating two organizations with the same email', () => {
      // Given
      const createFirstOrganization = server.inject(options);

      // Then
      const secondOrganizationOnFailure = createFirstOrganization.then(() => {
        return server.inject(options);
      });

      // Then
      return secondOrganizationOnFailure.then((response) => {
        const parsedResponse = JSON.parse(response.payload);
        expect(parsedResponse.errors[0].detail).to.equal('L\'adresse organization@email.com est déjà associée à un utilisateur.');
        expect(response.statusCode).to.equal(400);
      });
    });

    describe('when creating with a wrong payload', () => {
      it('should return 400 HTTP status code', () => {
        // Given
        payload.data.attributes.type = 'FAK';

        // Then
        const creatingOrganizationOnFailure = server.inject(options);

        // Then
        return creatingOrganizationOnFailure.then((response) => {
          const parsedResponse = JSON.parse(response.payload);
          expect(parsedResponse.errors[0].detail).to.equal('Le type d\'organisation doit être l\'une des valeurs suivantes: SCO, SUP, PRO.');
          expect(response.statusCode).to.equal(400);
        });
      });

      it('should return both User and Organization errors at the same time', () => {
        // Given
        payload.data.attributes.type = 'FAK';
        payload.data.attributes.password = 'invalid-password';

        // Then
        const creatingOrganizationOnFailure = server.inject(options);

        // Then
        return creatingOrganizationOnFailure
          .then((response) => {
            const parsedResponse = JSON.parse(response.payload);

            expect(parsedResponse.errors).to.have.length(2);
            expect(parsedResponse.errors[1].detail).to.equal('Le type d\'organisation doit être l\'une des valeurs suivantes: SCO, SUP, PRO.');
            expect(parsedResponse.errors[0].detail).to.equal('Votre mot de passe doit comporter au moins une lettre, un chiffre et 8 caractères.');
          });
      });

      it('should not keep the user in the database', () => {
        // Given
        payload.data.attributes.type = 'FAK';

        // Then
        const creatingOrganizationOnFailure = server.inject(options);

        // Then
        return creatingOrganizationOnFailure
          .then(() => {
            return knex('users').count('id as id').then((count) => {
              expect(count[0].id).to.equal(0);
            });
          });
      });

    });
  });
});
