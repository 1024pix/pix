import _ from 'lodash';
import sinon from 'sinon';

import { OrganizationInvitation } from '../../../../../src/team/domain/models/OrganizationInvitation.js';
import { usecases } from '../../../../../src/team/domain/usecases/index.js';
import { databaseBuilder } from '../../../../tooling/databases.js';

describe('Integration | Team | Domain | Usecases | resend-organization-invitation', function () {
  describe('#UpdateOrganizationInvitation', function () {
    it('re-sends an email with same code when organization invitation already exists with status pending', async function () {
      const now = new Date('2024-01-02');
      sinon.useFakeTimers({ now, toFake: ['Date'] });

      // given
      const organizationInvitation = databaseBuilder.factory.buildOrganizationInvitation({
        status: OrganizationInvitation.StatusType.PENDING,
      });

      await databaseBuilder.commit();

      // when
      const result = await usecases.resendOrganizationInvitation({
        organizationId: organizationInvitation.organizationId,
        email: organizationInvitation.email,
      });

      // then
      const expectedOrganizationInvitation = {
        ...organizationInvitation,
        updatedAt: now,
      };
      expect(_.omit(result, 'organizationName')).to.deep.equal(expectedOrganizationInvitation);
    });
  });
});
