const { expect, knex, sinon } = require('../../../test-helper');
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
});
