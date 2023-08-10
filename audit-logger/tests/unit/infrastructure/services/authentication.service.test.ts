import { describe, expect, test } from 'vitest';
import { validate } from '../../../../src/lib/infrastructure/services/authentication.service.js'

describe('Unit | Infrastructure | Services | authentication', () => {
  describe('#validate', () => {
    describe('when username is incorrect', function () {
      test('returns false and null credentials', async () => {
        // given
        const username = 'wrong-username';
        const password = 'pixApiClientSecretTest';

        // when
        const result = await validate(username, password);

        // then
        expect(result).toEqual({ isValid: false, credentials: null });
      });
    });

    describe('when password is incorrect', function () {
      test('returns false and null credentials', async () => {
        // given
        const username = 'pix-api';
        const password = 'wrong-password';

        // when
        const result = await validate(username, password);

        // then
        expect(result).toEqual({ isValid: false, credentials: null });
      });
    });

    describe('when username and password are correct', function () {
      test('returns true and empty credentials object', async () => {
        // given
        const username = 'pix-api';
        const password = 'pixApiClientSecretTest';

        // when
        const result = await validate(username, password);

        // then
        expect(result).toEqual({ isValid: true, credentials: {} });
      });
    });
  });
});
