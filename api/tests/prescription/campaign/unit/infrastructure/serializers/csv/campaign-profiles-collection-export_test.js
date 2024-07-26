import { CampaignProfilesCollectionExport } from '../../../../../../../src/prescription/campaign/infrastructure/serializers/csv/campaign-profiles-collection-export.js';
import { expect, sinon } from '../../../../../../test-helper.js';

describe('Unit | Serializer | CSV | campaign-profiles-collection-export', function () {
  describe('#export', function () {
    it('should write csv lines to stream', async function () {
      // given
      const noOpStream = { write: sinon.stub() };
      const organization = {};
      const campaign = {};
      const competences = [];
      const translateStub = sinon.stub();
      const exporter = new CampaignProfilesCollectionExport(
        noOpStream,
        organization,
        campaign,
        competences,
        translateStub,
      );
      const placementProfileStub = {
        getPlacementProfilesWithSnapshotting: sinon.stub().resolves([]),
      };
      const campaignParticipationResultDatas = [
        {
          id: 1,
          createdAt: new Date(),
          isShared: false,
          sharedAt: null,
          participantExternalId: null,
          userId: 1,
          isCompleted: false,
          studentNumber: null,
          participantFirstName: 'John',
          participantLastName: 'Doe',
          division: '3C',
          pixScore: 136,
          group: null,
        },
        {
          id: 2,
          createdAt: new Date(),
          isShared: false,
          sharedAt: null,
          participantExternalId: null,
          userId: 2,
          isCompleted: false,
          studentNumber: null,
          participantFirstName: 'Jane',
          participantLastName: 'Doe',
          division: '3C',
          pixScore: 200,
          group: null,
        },
      ];

      // when
      await exporter.export(campaignParticipationResultDatas, placementProfileStub, {
        CHUNK_SIZE_CAMPAIGN_RESULT_PROCESSING: 1,
        CONCURRENCY_HEAVY_OPERATIONS: 1,
      });

      // then
      expect(noOpStream.write.getCall(1).args[0]).to.includes('John');
      expect(noOpStream.write.getCall(2).args[0]).to.includes('Jane');
    });
  });
});
