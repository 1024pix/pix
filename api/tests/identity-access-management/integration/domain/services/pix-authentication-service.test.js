import sinon from 'sinon';

import { User } from '../../../../../src/identity-access-management/domain/models/User.js';
import { pixAuthenticationService } from '../../../../../src/identity-access-management/domain/services/pix-authentication-service.js';
import * as userRepository from '../../../../../src/identity-access-management/infrastructure/repositories/user.repository.js';
import * as userLoginRepository from '../../../../../src/identity-access-management/infrastructure/repositories/user-login-repository.js';
import {
  PasswordNotMatching,
  UserIsBlocked,
  UserIsTemporaryBlocked,
  UserNotFoundError,
} from '../../../../../src/shared/domain/errors.js';
import { expect } from '../../../../test-helper.js';
import { databaseBuilder } from '../../../../tooling/databases.js';
import { catchErr } from '../../../../tooling/test-utils/error.js';

const now = new Date('2024-04-05T03:04:05Z');
const password = 'Password123';

describe('Integration | Identity Access Management | Domain | Services | pix-authentication-service', function () {
  describe('#getUserByUsernameAndPassword', function () {
    let user;
    let clock;

    beforeEach(async function () {
      clock = sinon.useFakeTimers({ now, toFake: ['Date'] });

      user = databaseBuilder.factory.buildUser.withRawPassword({
        email: 'user@example.net',
        username: 'user123',
        rawPassword: password,
      });
      await databaseBuilder.commit();
    });

    afterEach(function () {
      clock.restore();
    });

    context('When user credentials are valid', function () {
      it('returns user found and create an UserLogin entry', async function () {
        // when
        const foundUser = await pixAuthenticationService.getUserByUsernameAndPassword({
          username: user.username,
          password: password,
          userRepository,
        });

        // then
        expect(foundUser).to.be.an.instanceof(User);
        expect(foundUser.id).to.equal(user.id);

        const userLogin = await userLoginRepository.findByUserId(user.id);
        expect(userLogin.failureCount).to.equal(0);
      });

      context('when user has some failure count', function () {
        it('resets failure count', async function () {
          // given
          databaseBuilder.factory.buildUserLogin({ userId: user.id, failureCount: 2 });
          await databaseBuilder.commit();

          // when
          await pixAuthenticationService.getUserByUsernameAndPassword({
            username: user.username,
            password: password,
            userRepository,
          });

          // then
          const userLogin = await userLoginRepository.findByUserId(user.id);
          expect(userLogin.failureCount).to.equal(0);
        });
      });

      context('when user has failure count and was temporary blocked', function () {
        it('resets failure count and remove temporary blocking', async function () {
          // given
          databaseBuilder.factory.buildUserLogin({
            userId: user.id,
            failureCount: 12,
            temporaryBlockedUntil: new Date('2024-04-04T03:04:05Z'),
          });
          await databaseBuilder.commit();

          // when
          await pixAuthenticationService.getUserByUsernameAndPassword({
            username: user.username,
            password: password,
            userRepository,
          });

          // then
          const userLogin = await userLoginRepository.findByUserId(user.id);
          expect(userLogin.failureCount).to.equal(0);
          expect(userLogin.temporaryBlockedUntil).to.be.null;
        });
      });
    });

    context('When user credentials are not valid', function () {
      context('When username does not exist', function () {
        it('throws UserNotFoundError ', async function () {
          // when
          const error = await catchErr(pixAuthenticationService.getUserByUsernameAndPassword)({
            username: 'nonexistentuser',
            password,
            userRepository,
          });

          // then
          expect(error).to.be.an.instanceof(UserNotFoundError);
        });
      });

      context('When password does not match', function () {
        context('When user failed to login for the first time with username', function () {
          it('throws PasswordNotMatching error and increment user failure count', async function () {
            // when
            const error = await catchErr(pixAuthenticationService.getUserByUsernameAndPassword)({
              username: user.username,
              password: 'WrongPassword',
              userRepository,
            });

            // then
            const userLogin = await userLoginRepository.findByUserId(user.id);
            expect(userLogin.failureCount).to.equal(1);

            expect(error).to.be.an.instanceof(PasswordNotMatching);
            expect(error.meta.isLoginFailureWithUsername).to.be.true;
          });
        });

        context('When user failed to login for the first time with email', function () {
          it('throws PasswordNotMatching error with isLoginFailureWithUsername false', async function () {
            // when
            const error = await catchErr(pixAuthenticationService.getUserByUsernameAndPassword)({
              username: user.email,
              password: 'WrongPassword',
              userRepository,
            });

            // then
            expect(error).to.be.an.instanceof(PasswordNotMatching);
            expect(error.meta.isLoginFailureWithUsername).to.be.false;
          });
        });

        context('When user failed to login with username multiple times', function () {
          it('throws UserIsTemporaryBlocked error and block temporarily the user', async function () {
            // given
            databaseBuilder.factory.buildUserLogin({
              userId: user.id,
              failureCount: 9,
              temporaryBlockedUntil: null,
            });
            await databaseBuilder.commit();

            // when
            const error = await catchErr(pixAuthenticationService.getUserByUsernameAndPassword)({
              username: user.username,
              password: 'WrongPassword',
              userRepository,
            });

            // then
            const userLogin = await userLoginRepository.findByUserId(user.id);
            expect(userLogin.failureCount).to.equal(10);
            expect(userLogin.temporaryBlockedUntil).not.to.be.null;

            expect(error).to.be.an.instanceof(UserIsTemporaryBlocked);
          });

          context('When less than 10 attempts remaining before blocking', function () {
            it('throws PasswordNotMatching with remaining attempts', async function () {
              // given
              databaseBuilder.factory.buildUserLogin({
                userId: user.id,
                failureCount: 21,
                temporaryBlockedUntil: null,
              });
              await databaseBuilder.commit();

              // when
              const error = await catchErr(pixAuthenticationService.getUserByUsernameAndPassword)({
                username: user.username,
                password: 'WrongPassword',
                userRepository,
              });

              // then
              expect(error).to.be.an.instanceof(PasswordNotMatching);
              expect(error.meta.remainingAttempts).to.be.equal(8); // 30 - (21 + 1) = 8
            });
          });
        });

        context('When user failure count reaches the blocking limit', function () {
          it('throws UserIsBlocked error and block the user', async function () {
            // given
            databaseBuilder.factory.buildUserLogin({
              userId: user.id,
              failureCount: 30,
              temporaryBlockedUntil: null,
            });
            await databaseBuilder.commit();

            // when
            const error = await catchErr(pixAuthenticationService.getUserByUsernameAndPassword)({
              username: user.username,
              password: 'WrongPassword',
              userRepository,
            });

            // then
            const userLogin = await userLoginRepository.findByUserId(user.id);
            expect(userLogin.blockedUntil).not.to.be.null;

            expect(error).to.be.an.instanceof(UserIsBlocked);
          });
        });
      });
    });
  });
});
