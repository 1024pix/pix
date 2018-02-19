const { expect, sinon, knex } = require('../../../test-helper');
const faker = require('faker');

const BookshelfOrganization = require('../../../../lib/infrastructure/data/organization');
const organizationService = require('../../../../lib/domain/services/organization-service');

describe('Unit | Infrastructure | Models | BookshelfOrganization', () => {

  describe('validation', () => {

    let rawData;

    beforeEach(() => {
      rawData = {
        email: faker.internet.email(),
        type: null,
        name: faker.name.lastName(),
        code: organizationService.generateOrganizationCode()
      };
    });

    it('is required and cannot be empty', () => {
      // Given
      rawData.name = '';

      const organization = new BookshelfOrganization(rawData);

      // When
      const promise = organization.save();

      // Then
      return promise
        .then(() => {
          sinon.assert.fail('Cannot succeed');
        })
        .catch((err) => {
          const name = err.data['name'];
          expect(name).to.deep.equal(['Le champ name doit être renseigné.']);
        });
    });

    describe('the email field', () => {
      it('is required', () => {
        // Given
        rawData.type = 'SUP';
        rawData.email = null;

        const organization = new BookshelfOrganization(rawData);

        // When
        const promise = organization.save();

        // Then
        return promise
          .then(() => {
            sinon.assert.fail('Cannot succeed');
          })
          .catch((err) => {
            const email = err.data['email'];
            expect(email).to.deep.equal(['Le champ email doit être renseigné.']);
          });
      });

      it('is required and cannot be empty', () => {
        // Given
        rawData.type = 'SUP';
        rawData.email = '';

        const organization = new BookshelfOrganization(rawData);

        // When
        const promise = organization.save();

        // Then
        return promise
          .then(() => {
            sinon.assert.fail('Cannot succeed');
          })
          .catch((err) => {
            const email = err.data['email'];
            expect(email).to.deep.equal(['Le champ email doit être renseigné.']);
          });
      });

    });

    describe('the type field', () => {

      after(() => {
        return knex('organizations').delete();
      });

      it('is required', () => {
        // Given
        const organization = new BookshelfOrganization(rawData);

        // When
        const promise = organization.save();

        // Then
        return promise
          .catch((err) => {
            const type = err.data['type'];
            expect(type).to.deep.equal(['Le champ type doit être renseigné.']);
          });
      });

      it('should only accept SUP, SCO, PRO values', () => {
        // Given
        rawData.type = 'FAK';
        const organization = new BookshelfOrganization(rawData);

        // When
        const promise = organization.save();

        // Then
        return promise
          .catch((err) => {
            const type = err.data['type'];
            expect(type).to.exist;
            expect(type).to.deep.equal(['Le type d\'organisation doit être l\'une des valeurs suivantes: SCO, SUP, PRO.']);
          });
      });

      ['SCO', 'SUP', 'PRO'].forEach((organizationType) => {
        it(`should be saved when organisation type is ${organizationType}`, () => {
          // Given
          rawData.type = organizationType;
          const organization = new BookshelfOrganization(rawData);

          // When
          const promise = organization.save();

          // Then
          return promise
            .catch(_ => {
              sinon.assert.fail(new Error(`Should not fail with ${organizationType} type`));
            });
        });

      });

    });

    describe('the code field', () => {
      it('should match the AAAA99 pattern', () => {
        rawData.code = '';

        const organization = new BookshelfOrganization(rawData);

        // When
        const promise = organization.save();

        // Then
        return promise
          .then(() => {
            sinon.assert.fail('Cannot succeed');
          })
          .catch((err) => {
            const email = err.data['code'];
            expect(email).to.deep.equal(['Le champ code doit respecter le format AAAA99.']);
          });

      });
    });
  });

});
