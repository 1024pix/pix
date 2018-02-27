const { expect, knex } = require('../../../test-helper');
const faker = require('faker');
const bcrypt = require('bcrypt');

const BookshelfUser = require('../../../../lib/infrastructure/data/user');
const User = require('../../../../lib/domain/models/User');
const userRepository = require('../../../../lib/infrastructure/repositories/user-repository');
const { AlreadyRegisteredEmailError } = require('../../../../lib/domain/errors');
const Bookshelf = require('../../../../lib/infrastructure/bookshelf');

describe('Unit | Repository | userRepository', function() {

  let userId;
  const email = faker.internet.email().toLowerCase();
  const userPassword = bcrypt.hashSync('A124B2C3#!', 1);
  const inserted_user = {
    firstName: faker.name.firstName(),
    lastName: faker.name.lastName(),
    email,
    password: userPassword,
    cgu: true
  };

  describe('#findUserById', () => {

    beforeEach(() => {
      return knex('users')
        .delete()
        .then(() => {
          return knex('users').insert(inserted_user);
        })
        .then((result) => {
          userId = result.shift();
        });
    });

    afterEach(() => {
      return knex('users').delete();
    });

    it('should be a function', function() {
      // then
      expect(userRepository.findUserById).to.be.a('function');
    });

    describe('Success management', () => {
      it('should find a user by provided id', () => {
        return userRepository.findUserById(userId)
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
        return userRepository.findUserById(inexistenteId)
          .catch((err) => {
            expect(err).to.be.an.instanceof(BookshelfUser.NotFoundError);
          });
      });
    });

  });

  describe('#findByEmail', () => {

    beforeEach(() => {
      return knex('users')
        .delete()
        .then(() => {
          return knex('users').insert(inserted_user);
        })
        .then((result) => {
          userId = result.shift();
        });
    });

    afterEach(() => {
      return knex('users').delete();
    });

    it('should be a function', () => {
      // then
      expect(userRepository.findByEmail).to.be.a('function');
    });

    it('should handle a rejection, when user id is not found', () => {
      // Given
      const emailThatDoesNotExist = 10093;
      // When
      const promise = userRepository.findByEmail(emailThatDoesNotExist);

      // Then
      return promise
        .catch((err) => {
          expect(err).to.be.instanceof(Bookshelf.Model.NotFoundError);
        });
    });

    it('should return a user when found', () => {
      // When
      const promise = userRepository.findByEmail(email);

      // Then
      return promise
        .then((user) => {
          expect(user.email).to.equal(email);
        });
    });
  });

  describe('#isEmailAvailable', () => {

    beforeEach(() => {
      return knex('users')
        .delete()
        .then(() => {
          return knex('users').insert(inserted_user);
        })
        .then((result) => {
          userId = result.shift();
        });
    });

    afterEach(() => {
      return knex('users').delete();
    });

    it('should return the email when the email is not registered', () => {
      // When
      const promise = userRepository.isEmailAvailable('email@example.net');

      // Then
      return promise.then((email) => {
        expect(email).to.equal('email@example.net');
      });
    });

    it('should reject an AlreadyRegisteredEmailError when it already exists', () => {
      // When
      const promise = userRepository.isEmailAvailable(email);

      // Then
      return promise.catch(err => {
        expect(err).to.be.an.instanceOf(AlreadyRegisteredEmailError);
      });

    });

  });

  describe('#save', () => {

    afterEach(() => {
      return knex('users').delete();
    });

    it('should save the user', () => {
      // Given
      const email = 'my-email-to-save@example.net';
      const user = new User({
        firstName: faker.name.firstName(),
        lastName: faker.name.lastName(),
        email: email,
        password: 'Pix1024#',
        cgu: true,
      });

      // When
      const promise = userRepository.save(user);

      // Then
      return promise
        .then(() => knex('users').select())
        .then((usersSaved) => {
          expect(usersSaved).to.have.lengthOf(1);
        });
    });

    it('should return a User object', () => {
      // Given
      const email = 'my-email-to-save@example.net';
      const user = new User({
        firstName: faker.name.firstName(),
        lastName: faker.name.lastName(),
        email: email,
        password: 'Pix1024#',
        cgu: true,
      });

      // When
      const promise = userRepository.save(user);

      // Then
      return promise
        .then((userSaved) => {
          expect(userSaved).to.be.an.instanceOf(User);
          expect(userSaved.firstName).to.equal(user.firstName);
          expect(userSaved.lastName).to.equal(user.lastName);
          expect(userSaved.email).to.equal(user.email);
          expect(userSaved.cgu).to.equal(user.cgu);
        });
    });
  });

  describe('#updatePassword', () => {

    let user;

    beforeEach(() => {
      const userToSave = new User({
        firstName: faker.name.firstName(),
        lastName: faker.name.lastName(),
        email: 'my-email-to-save@example.net',
        password: 'Pix1024#',
        cgu: true,
      });

      return userRepository.save(userToSave)
        .then((savedUser) => {
          user = savedUser;
        });
    });

    afterEach(() => {
      return knex('users').delete();
    });

    it('should save the user', () => {
      // Given
      const newPassword = '1235Pix!';

      // When
      const promise = userRepository.updatePassword(user.id, newPassword);

      // Then
      return promise
        .then((updatedUser) => {
          expect(updatedUser).to.be.an.instanceOf(User);
          expect(updatedUser.password).to.equal(newPassword);
        });
    });
  });
});
