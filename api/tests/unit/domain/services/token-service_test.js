const { describe, it, expect } = require('../../../test-helper');
const tokenService = require('../../../../lib/domain/services/token-service');
const User = require('../../../../lib/domain/models/data/user');

describe('Unit | Service | Token Service', function() {

  describe('#extractUserId', () => {

    it('should exist', () => {
      expect(tokenService.extractUserId).to.exist.and.to.be.a('function');
    });

    it('should return userId if the token passed is valid', () => {
      //Given
      const user = new User({ id: 123 });
      const token = tokenService.createTokenFromUser(user);

      //When
      const result = tokenService.extractUserId(token);

      //Then
      expect(result).to.equal(123);
    });

    it('should reject with Error if the token is invalid', () => {
      // Given
      const token = 'eyJhbGciOiJIUzI1NiIsIgR5cCI6IkpXVCJ9.eyJ1c2VyX2lPIjoxMjMsImlhdCI6MTQ5OTA3Nzg2Mn0.FRAAoowTA8Bc6BOzD7wWh2viVN47VrPcGgLuHi_NmKw';

      //When
      const result = tokenService.extractUserId(token);

      //Then
      expect(result).to.equal(null);
    });

  });
});
