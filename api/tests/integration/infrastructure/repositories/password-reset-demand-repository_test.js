const { expect, knex, databaseBuilder } = require('../../../test-helper');
const passwordResetDemandRepository = require('../../../../lib/infrastructure/repositories/password-reset-demand-repository');
const { PasswordResetDemandNotFoundError } = require('../../../../lib/domain/errors');

describe('Integration | Infrastructure | Repository | password-reset-demand-repository', () => {

  beforeEach(() => {
    return databaseBuilder.clean();
  });

  afterEach(() => {
    return databaseBuilder.clean();
  });

  describe('#create', () => {

    const passwordResetDemandData = {
      temporaryKey: 'temporaryKey',
      email: 'user@pix.fr',
      used: false,
    };

    it('should add a new password-reset-demand in database', async () => {
      // given
      const nPasswordResetDemandsBefore = await knex('password-reset-demands').count('id as count');

      // when
      await passwordResetDemandRepository.create(passwordResetDemandData);

      // then
      const nPasswordResetDemandsAfter = await knex('password-reset-demands').count('id as count');

      expect(nPasswordResetDemandsAfter[0].count).to.equal(nPasswordResetDemandsBefore[0].count + 1);
    });
  });

  describe('#findByTemporaryKey', () => {

    let passwordResetDemand;

    before(() => {
      passwordResetDemand = databaseBuilder.factory.buildPasswordResetDemand({
        temporaryKey: 'temporaryKey',
        email: 'user@pix.fr',
        used: false,
      });
      return databaseBuilder.commit();
    });

    it('should find a passwordResetDemand', async () => {
      // when
      const returnedPasswordResetDemand = await passwordResetDemandRepository.findByTemporaryKey(passwordResetDemand.temporaryKey);
      const { email, temporaryKey } = returnedPasswordResetDemand.toJSON();

      // then
      expect(email).to.equal(passwordResetDemand.email);
      expect(temporaryKey).to.equal(passwordResetDemand.temporaryKey);
    });

    it('should throw if not found', () => {
      // when
      const promise = passwordResetDemandRepository.findByTemporaryKey('doesnotexist');

      // then
      return promise.catch((error) => {
        expect(error).to.be.instanceOf(PasswordResetDemandNotFoundError);
      });
    });
  });

  describe('#markAsUsed', () => {

    let passwordResetDemand;

    before(() => {
      passwordResetDemand = databaseBuilder.factory.buildPasswordResetDemand({
        id: 111,
        temporaryKey: 'temporaryKey',
        email: 'user@pix.fr',
        used: false,
      });
      return databaseBuilder.commit();
    });

    it('should flag as used', async () => {
      // when
      await passwordResetDemandRepository.markAsUsed(passwordResetDemand.temporaryKey);
      const updatedPasswordResetDemand = await passwordResetDemandRepository.findByTemporaryKey(passwordResetDemand.temporaryKey);

      // then
      expect(updatedPasswordResetDemand.toJSON().used).to.be.equal(1);
    });

    it('should throw if not found', () => {
      // when
      const promise = passwordResetDemandRepository.markAsUsed('doesnotexist');

      // then
      return promise.catch((error) => {
        expect(error).to.be.instanceOf(Error);
      });
    });
  });

});
