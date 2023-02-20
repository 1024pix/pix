import CertificationCenterInvitedUser from '../../../../lib/domain/models/CertificationCenterInvitedUser';
import CertificationCenterInvitation from '../../../../lib/domain/models/CertificationCenterInvitation';
import { expect, catchErr, domainBuilder } from '../../../test-helper';
import { NotFoundError, AlreadyAcceptedOrCancelledInvitationError } from '../../../../lib/domain/errors';

describe('Unit | Domain | Models | CertificationCenterInvitedUser', function () {
  describe('#acceptInvitation', function () {
    context('success case', function () {
      it('should mark invitation as accepted', async function () {
        // given
        const code = '1234AZE';
        const invitedUser = new CertificationCenterInvitedUser({
          userId: domainBuilder.buildUser().id,
          invitation: {
            id: domainBuilder.buildCertificationCenterInvitation().id,
            code,
          },
          status: CertificationCenterInvitation.StatusType.PENDING,
        });

        // when
        invitedUser.acceptInvitation(code);

        // then
        expect(invitedUser.status).to.equal(CertificationCenterInvitation.StatusType.ACCEPTED);
      });
    });
    describe('error cases', function () {
      context('when certification center code is invalid', function () {
        it('should throw an error', async function () {
          // given
          const code = '1234AZE';
          const invitedUser = new CertificationCenterInvitedUser({
            userId: domainBuilder.buildUser().id,
            invitation: {
              id: domainBuilder.buildCertificationCenterInvitation({ id: 12345 }).id,
              code: '5678BFR',
            },
            status: CertificationCenterInvitation.StatusType.PENDING,
          });

          // when
          const error = await catchErr(invitedUser.acceptInvitation, invitedUser)(code);

          // then
          expect(error).to.be.an.instanceof(NotFoundError);
          expect(error.message).to.equal('Not found certification center invitation for ID 12345 and code 1234AZE');
        });
      });
      context('when invitation is accepted or cancelled', function () {
        it('should throw an error', async function () {
          // given
          const code = '1234AZE';
          const invitedUser = new CertificationCenterInvitedUser({
            userId: domainBuilder.buildUser().id,
            invitation: {
              id: domainBuilder.buildCertificationCenterInvitation().id,
              code: '1234AZE',
            },
            status: CertificationCenterInvitation.StatusType.ACCEPTED,
          });

          // when
          const error = await catchErr(invitedUser.acceptInvitation, invitedUser)(code);

          // then
          expect(error).to.be.an.instanceof(AlreadyAcceptedOrCancelledInvitationError);
          expect(error.message).to.equal("L'invitation a déjà été acceptée ou annulée.");
        });
      });
    });
  });
});
