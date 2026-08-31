import { expect } from 'chai';

import { isCertificationLinkedToUser } from '../../../../../../src/certification/evaluation/infrastructure/repositories/security-repository.js';
import { databaseBuilder } from '../../../../../tooling/databases.js';

describe('Certification | Evaluation | Integration | Repositories | security-repository', function () {
  describe('#isCertificationLinkedToUser', function () {
    context('when the certification is not linked to the user', function () {
      it('returns false', async function () {
        // given
        const userId = databaseBuilder.factory.buildUser().id;
        const certificationId = databaseBuilder.factory.buildCertificationCourse({ userId }).id;
        await databaseBuilder.commit();

        const isCertificationLinked = await isCertificationLinkedToUser({ userId: userId + 1, certificationId });

        expect(isCertificationLinked).to.be.false;
      });
    });

    context('when the certification does not exist', function () {
      it('returns false', async function () {
        // given
        const userId = databaseBuilder.factory.buildUser().id;
        const certificationId = databaseBuilder.factory.buildCertificationCourse({ userId }).id;
        await databaseBuilder.commit();

        const isCertificationLinked = await isCertificationLinkedToUser({
          userId,
          certificationId: certificationId + 1,
        });

        expect(isCertificationLinked).to.be.false;
      });
    });

    context('when the certification is linked to the user', function () {
      it('returns true', async function () {
        // given
        const userId = databaseBuilder.factory.buildUser().id;
        const certificationId = databaseBuilder.factory.buildCertificationCourse({ userId }).id;
        await databaseBuilder.commit();

        const isCertificationLinked = await isCertificationLinkedToUser({
          userId,
          certificationId,
        });

        expect(isCertificationLinked).to.be.true;
      });
    });
  });
});
