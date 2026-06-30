import { AttestationParticipantStatus } from '../../../../../../../src/prescription/organization-learner/domain/read-models/AttestationParticipantStatus.js';
import { attestationParticipantsStatusSerializer } from '../../../../../../../src/prescription/organization-learner/infrastructure/serializers/jsonapi/attestation-participants-status-serializer.js';
import { expect } from '../../../../../../test-helper.js';

describe('Unit | Serializer | JSONAPI | attestation-participants-status-serializer', function () {
  describe('#serialize', function () {
    it('should convert an attestation participant status read-model object into JSON API data', function () {
      // given
      const attestationParticipantsStatus = [
        new AttestationParticipantStatus({
          attestationKey: 'SIXTH_GRADE',
          division: '3DS',
          firstName: 'first-name',
          lastName: 'last-name',
          obtainedAt: new Date('2025-07-08'),
          organizationLearnerId: 100008,
        }),
      ];
      const pagination = { page: 1, pageCount: 1, pageSize: 10, rowCount: 1 };
      const expectedData = {
        data: [
          {
            attributes: {
              'attestation-key': 'SIXTH_GRADE',
              division: '3DS',
              'first-name': 'first-name',
              'last-name': 'last-name',
              'obtained-at': new Date('2025-07-08'),
              'organization-learner-id': 100008,
            },
            id: 'SIXTH_GRADE_100008',
            type: 'attestation-participant-statuses',
          },
        ],
        meta: {
          page: 1,
          pageCount: 1,
          pageSize: 10,
          rowCount: 1,
        },
      };

      // when
      const json = attestationParticipantsStatusSerializer.serialize({ attestationParticipantsStatus, pagination });

      // then
      expect(json).to.deep.equal(expectedData);
    });
  });
});
