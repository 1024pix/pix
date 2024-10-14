import { generateAttestations } from '../../../../../src/profile/application/api/attestations-api.js';
import { usecases } from '../../../../../src/profile/domain/usecases/index.js';
import { expect, sinon } from '../../../../test-helper.js';

describe('Profile | Unit | Application | Api | attestations', function () {
  describe('#generateAttestations', function () {
    it('should return a zip archive with users attestations', async function () {
      const attestationKey = Symbol('attestationKey');
      const userIds = Symbol('userIds');
      const data = Symbol('data');
      const expectedBuffer = Symbol('expectedBuffer');

      const dependencies = {
        pdfWithFormSerializer: {
          serialize: sinon.stub(),
        },
      };

      sinon.stub(usecases, 'getAttestationDataForUsers');

      usecases.getAttestationDataForUsers
        .withArgs({ attestationKey, userIds })
        .resolves({ data, templateName: 'sixth-grade-attestation-template' });

      dependencies.pdfWithFormSerializer.serialize
        .withArgs(sinon.match(/(\w*\/)*sixth-grade-attestation-template.pdf/), data)
        .resolves(expectedBuffer);
      const result = await generateAttestations({ attestationKey, userIds, dependencies });

      expect(result).to.equal(expectedBuffer);
    });
  });
});
