import {
  generateAttestations,
  getAttestationsUserDetail,
} from '../../../../../src/profile/application/api/attestations-api.js';
import { usecases } from '../../../../../src/profile/domain/usecases/index.js';
import { FRENCH_FRANCE } from '../../../../../src/shared/domain/services/locale-service.js';
import { expect, sinon } from '../../../../test-helper.js';

describe('Profile | Unit | Application | Api | attestations', function () {
  describe('#generateAttestations', function () {
    it('should return a zip archive with users attestations', async function () {
      const attestationKey = Symbol('attestationKey');
      const userIds = Symbol('userIds');
      const organizationId = Symbol('organizationId');
      const data = Symbol('data');
      const locale = FRENCH_FRANCE;
      const expectedBuffer = Symbol('expectedBuffer');

      const dependencies = {
        pdfWithFormSerializer: {
          serialize: sinon.stub(),
        },
      };

      sinon.stub(usecases, 'getSharedAttestationsForOrganizationByUserIds');

      usecases.getSharedAttestationsForOrganizationByUserIds
        .withArgs({ attestationKey, userIds, organizationId, locale })
        .resolves({
          data,
          templateName: 'sixth-grade-attestation-template',
        });

      dependencies.pdfWithFormSerializer.serialize
        .withArgs(sinon.match(/(\w*\/)*sixth-grade-attestation-template.pdf/), data)
        .resolves(expectedBuffer);

      const result = await generateAttestations({ attestationKey, userIds, organizationId, dependencies });

      expect(result).to.equal(expectedBuffer);
    });
  });

  describe('#getAttestationsUserDetail', function () {
    it('should return users attestations', async function () {
      const attestationKey = Symbol('attestationKey');
      const userIds = Symbol('userIds');
      const organizationId = Symbol('organizationId');
      const data = Symbol('data');
      const locale = FRENCH_FRANCE;

      const dependencies = {
        pdfWithFormSerializer: {
          serialize: sinon.stub(),
        },
      };

      sinon.stub(usecases, 'getSharedAttestationsUserDetailForOrganizationByUserIds');

      usecases.getSharedAttestationsUserDetailForOrganizationByUserIds
        .withArgs({ attestationKey, userIds, organizationId, locale })
        .resolves(data);

      const result = await getAttestationsUserDetail({ attestationKey, userIds, organizationId, dependencies });

      expect(result).to.equal(data);
    });
  });
});
