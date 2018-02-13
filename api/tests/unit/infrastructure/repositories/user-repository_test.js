const { expect, knex, describe, before, beforeEach, afterEach, sinon, after, it } = require('../../../test-helper');
const faker = require('faker');
const bcrypt = require('bcrypt');

const User = require('../../../../lib/infrastructure/data/user');
const UserRepository = require('../../../../lib/infrastructure/repositories/user-repository');
const { AlreadyRegisteredEmailError } = require('../../../../lib/domain/errors');
const Bookshelf = require('../../../../lib/infrastructure/bookshelf');

describe('Unit | Repository | UserRepository', function() {

  let userId;
  const email = faker.internet.email();
  const userPassword = bcrypt.hashSync('A124B2C3#!', 1);
  const inserted_user = {
    firstName: faker.name.firstName(),
    lastName: faker.name.lastName(),
    email,
    password: userPassword,
    cgu: true
  };

  before(() => {
    return knex('users')
      .delete()
      .then(() => {
        return knex('users').insert(inserted_user);
      })
      .then((result) => {
        userId = result.shift();
      });
  });

  after(() => {
    return knex('users').delete();
  });

  describe('#findUserById', () => {

    it('should be a function', function() {
      // then
      expect(UserRepository.findUserById).to.be.a('function');
    });

    describe('Success management', () => {
      it('should find a user by provided id', () => {
        return UserRepository.findUserById(userId)
          .then((foundedUser) => {
            expect(foundedUser).to.exist;
            expect(foundedUser).to.be.an('object');
            expect(foundedUser.attributes.email).to.equal(inserted_user.email);
            expect(foundedUser.attributes.firstName).to.equal(inserted_user.firstName);
            expect(foundedUser.attributes.lastName).to.equal(inserted_user.lastName);
          });
      });

      it('should handle a rejection, when user id is not found', () => {
        const inexistenteId = 10093;
        return UserRepository.findUserById(inexistenteId)
          .catch((err) => {
            expect(err).to.be.an.instanceof(User.NotFoundError);
          });
      });
    });

  });

  describe('#findByEmail', () => {

    it('should be a function', () => {
      // then
      expect(UserRepository.findByEmail).to.be.a('function');
    });

    it('should handle a rejection, when user id is not found', () => {
      // Given
      const emailThatDoesNotExist = 10093;
      // When
      const promise = UserRepository.findByEmail(emailThatDoesNotExist);

      // Then
      return promise
        .catch((err) => {
          expect(err).to.be.instanceof(Bookshelf.Model.NotFoundError);
        });
    });

    it('should return a user when found', () => {
      // When
      const promise = UserRepository.findByEmail(email);

      // Then
      return promise
        .then((user) => {
          expect(user.get('email')).to.equal(email);
        });
    });
  });

  describe('#isEmailAvailable', () => {

    it('should be a function', () => {
      // then
      expect(UserRepository.isEmailAvailable).to.be.a('function');
    });

    it('should return the email when the email is not registered', () => {
      // When
      const promise = UserRepository.isEmailAvailable('email@example.net');

      // Then
      return promise.then((email) => {
        expect(email).to.equal('email@example.net');
      });
    });

    it('should reject an AlreadyRegisteredEmailError when it already exists', () => {
      // When
      const promise = UserRepository.isEmailAvailable(email);

      // Then
      return promise.catch(err => {
        expect(err).to.be.an.instanceOf(AlreadyRegisteredEmailError);
      });

    });

  });

  describe('#updatePassword', () => {

    let sandbox;
    let saveStub;

    beforeEach(() => {
      sandbox = sinon.sandbox.create();
      saveStub = sinon.stub().resolves();
      sandbox.stub(User, 'where').returns({
        save: saveStub
      });
    });

    afterEach(() => {
      sandbox.restore();
    });

    it('should be a function', () => {
      // then
      expect(UserRepository.updatePassword).to.be.a('function');
    });

    it('should save a new reset password demand', () => {
      // given
      const userId = 7;
      const userPassword = 'Pix2017!';

      // when
      const promise = UserRepository.updatePassword(userId, userPassword);

      // then
      return promise.then(() => {
        sinon.assert.calledOnce(User.where);
        sinon.assert.calledOnce(saveStub);
        sinon.assert.calledWith(User.where, { id: userId });
        expect(saveStub.getCalls()[0].args[0]).to.eql({ password: userPassword, cgu: true });
        expect(saveStub.getCalls()[0].args[1]).to.eql({ patch: true, require: false });
      });
    });
  });
});
