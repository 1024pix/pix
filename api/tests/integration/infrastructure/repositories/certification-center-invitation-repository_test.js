import { databaseBuilder, knex, expect, sinon } from '../../../test-helper.js';
import * as certificationCenterInvitationRepository from '../../../../lib/infrastructure/repositories/certification-center-invitation-repository.js';

describe('Integration | Infrastructure | Repositories | CertificationCenterInvitationRepository', function () {
  describe('#updateModificationDate', function () {
    it('updates the certification center invitation modification date', async function () {
      // given
      const certificationCenter = databaseBuilder.factory.buildCertificationCenter();
      const certificationCenterInvitation = databaseBuilder.factory.buildCertificationCenterInvitation({
        certificationCenterId: certificationCenter.id,
        createdAt: new Date('2023-10-10'),
        updatedAt: new Date('2023-10-10'),
      });

      await databaseBuilder.commit();

      const now = new Date('2023-10-13');
      const clock = sinon.useFakeTimers({ now, toFake: ['Date'] });

      // when
      await certificationCenterInvitationRepository.updateModificationDate(certificationCenterInvitation.id);

      // then
      const updatedCertificationCenterInvitation = await knex('certification-center-invitations')
        .where({ id: certificationCenterInvitation.id })
        .first();
      expect(updatedCertificationCenterInvitation.updatedAt).to.deep.equal(now);
      clock.restore();
    });
  });
});
