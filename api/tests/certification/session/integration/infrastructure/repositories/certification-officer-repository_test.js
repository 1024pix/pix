import { databaseBuilder, expect, catchErr } from '../../../../../test-helper.js';
import * as certificationOfficerRepository from '../../../../../../src/certification/session/infrastructure/repositories/certification-officer-repository.js';

import { UserNotFoundError } from '../../../../../../lib/domain/errors.js';
import { CertificationOfficer } from '../../../../../../src/certification/session/domain/models/CertificationOfficer.js';

describe('Integration | Repository | CertificationOfficer', function () {
  describe('#get', function () {
    let userInDb;

    beforeEach(async function () {
      userInDb = databaseBuilder.factory.buildUser();
      await databaseBuilder.commit();
    });

    it('should return the found certificationOfficer', async function () {
      // when
      const certificationOfficer = await certificationOfficerRepository.get(userInDb.id);

      // then
      expect(certificationOfficer).to.be.an.instanceOf(CertificationOfficer);
      expect(certificationOfficer.id).to.equal(userInDb.id);
      expect(certificationOfficer.firstName).to.equal(userInDb.firstName);
      expect(certificationOfficer.lastName).to.equal(userInDb.lastName);
    });

    it('should return a UserNotFoundError if no certificationOfficer is found', async function () {
      // given
      const nonExistentUserId = 678;

      // when
      const result = await catchErr(certificationOfficerRepository.get)(nonExistentUserId);

      // then
      expect(result).to.be.instanceOf(UserNotFoundError);
    });
  });
});
