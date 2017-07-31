const { describe, it, before, after, expect, knex, sinon } = require('../../../test-helper');
const faker = require('faker');
const bcrypt = require('bcrypt');

const Organization = require('../../../../lib/domain/models/data/organization');
const OrganizationRepository = require('../../../../lib/infrastructure/repositories/organization-repository');

describe('Unit | Repository | OrganizationRepository', function() {

  describe('#saveFromModel', () => {

    const userPassword = bcrypt.hashSync('A124B2C3#!', 1);
    const inserted_user = {
      firstName: faker.name.firstName(),
      lastName: faker.name.lastName(),
      email: faker.internet.email(),
      password: userPassword,
      cgu: true
    };

    before(() => {
      return knex('users').insert(inserted_user);
    });

    after(() => {
      return knex('users').delete();
    });

    it('should be a function', function() {
      // then
      expect(OrganizationRepository.saveFromModel).to.be.a('function');
    });

    it('should save model in database', () => {
      // Given
      const organization = new Organization({});
      sinon.stub(organization, 'save').resolves();

      // When
      const promise = OrganizationRepository.saveFromModel(organization);

      // Then
      return promise.then(() => {
        sinon.assert.calledOnce(organization.save);
      });
    });
  });

  describe('#isCodeAvailable', () => {

    const organization = {
      email: faker.internet.email(),
      type: 'PRO',
      name: faker.name.firstName(),
      code: 'ABCD01'
    };

    before(() => {
      return knex('organizations').insert(organization);
    });

    after(() => {
      return knex('organizations').delete();
    });

    it('should be a function', () => {
      // then
      expect(OrganizationRepository.isCodeAvailable).to.be.a('function');
    });

    it('should return the code when the code is not already used', () => {
      // When
      const promise = OrganizationRepository.isCodeAvailable('ABCD02');

      // Then
      return promise.then((code) => {
        expect(code).to.equal('ABCD02');
      });
    });

    it('should reject when the organization already exists', () => {
      // When
      const promise = OrganizationRepository.isCodeAvailable('ABCD01');

      // Then
      return promise
        .then(() => {
          sinon.assert.fail('Should not be a success');
        })
        .catch(() => {
          expect(promise).to.be.rejected;
        });
    });

  });
});
