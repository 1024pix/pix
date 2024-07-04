import { emailValidationDemandRepository } from '../../../../../src/identity-access-management/infrastructure/repositories/email-validation-demand.repository.js';
import { databaseBuilder, expect } from '../../../../test-helper.js';

describe('Integration | Identity Access Management | Infrastructure | Repository | email-validation-demand', function () {
  describe('#get', function () {
    it('returns saved "userId"', async function () {
      // given
      const userId = databaseBuilder.factory.buildUser().id;

      await databaseBuilder.commit();
      const token = await emailValidationDemandRepository.save(userId);

      // when
      const result = await emailValidationDemandRepository.get(token);

      // then
      expect(result).to.deep.equal(userId);
    });

    context('when demand does not exist', function () {
      it('returns "null"', async function () {
        // given
        const token = 'expired-demand';

        // when
        const result = await emailValidationDemandRepository.get(token);

        // then
        expect(result).to.be.null;
      });
    });
  });

  describe('#remove', function () {
    it('removes a demand', async function () {
      // given
      const userId = databaseBuilder.factory.buildUser().id;

      await databaseBuilder.commit();
      const token = await emailValidationDemandRepository.save(userId);

      // when
      await emailValidationDemandRepository.remove(token);

      // then
      const emailValidationDemand = await emailValidationDemandRepository.get(token);
      expect(emailValidationDemand).to.be.null;
    });
  });

  describe('#save', function () {
    const UUID_PATTERN = new RegExp(/^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i);

    it('saves a demand', async function () {
      // given
      const userId = databaseBuilder.factory.buildUser().id;

      await databaseBuilder.commit();

      // when
      const token = await emailValidationDemandRepository.save(userId);

      // then
      const emailValidationDemand = await emailValidationDemandRepository.get(token);
      expect(emailValidationDemand).to.deep.equal(userId);
      expect(token).to.match(UUID_PATTERN);
    });
  });
});
