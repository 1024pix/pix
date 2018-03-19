const { expect, sinon, knex } = require('../../../test-helper');
const faker = require('faker');

const BookshelfOrganization = require('../../../../lib/infrastructure/data/organization');
const DomainOrganization = require('../../../../lib/domain/models/Organization');
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
      // given
      rawData.name = '';

      const organization = new BookshelfOrganization(rawData);

      // when
      const promise = organization.save();

      // then
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
        // given
        rawData.type = 'SUP';
        rawData.email = null;

        const organization = new BookshelfOrganization(rawData);

        // when
        const promise = organization.save();

        // then
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
        // given
        rawData.type = 'SUP';
        rawData.email = '';

        const organization = new BookshelfOrganization(rawData);

        // when
        const promise = organization.save();

        // then
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
        // given
        const organization = new BookshelfOrganization(rawData);

        // when
        const promise = organization.save();

        // then
        return promise
          .catch((err) => {
            const type = err.data['type'];
            expect(type).to.deep.equal(['Le champ type doit être renseigné.']);
          });
      });

      it('should only accept SUP, SCO, PRO values', () => {
        // given
        rawData.type = 'FAK';
        const organization = new BookshelfOrganization(rawData);

        // when
        const promise = organization.save();

        // then
        return promise
          .catch((err) => {
            const type = err.data['type'];
            expect(type).to.exist;
            expect(type).to.deep.equal(['Le type d\'organisation doit être l\'une des valeurs suivantes: SCO, SUP, PRO.']);
          });
      });

      ['SCO', 'SUP', 'PRO'].forEach((organizationType) => {
        it(`should be saved when organisation type is ${organizationType}`, () => {
          // given
          rawData.type = organizationType;
          const organization = new BookshelfOrganization(rawData);

          // when
          const promise = organization.save();

          // then
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

        // when
        const promise = organization.save();

        // then
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

  describe('#toDomainEntity', () => {

    it('should convert a Bookshelf object into a Domain entity', () => {
      // given
      const rawData = {
        id: 2,
        email: 'vegeta@bandai.db',
        type: 'PRO',
        name: 'Bandai',
        code: 'SSJ-BLU3'
      };
      const bookshelfOrganization = new BookshelfOrganization(rawData);

      // when
      const domainOrganization = bookshelfOrganization.toDomainEntity();

      // then
      expect(domainOrganization).to.be.an.instanceof(DomainOrganization);
      expect(domainOrganization.id).to.equal(rawData.id);
      expect(domainOrganization.email).to.equal(rawData.email);
      expect(domainOrganization.type).to.equal(rawData.type);
      expect(domainOrganization.name).to.equal(rawData.name);
      expect(domainOrganization.code).to.equal(rawData.code);
    });
  });

});
