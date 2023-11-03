import { expect, hFake } from '../../../../test-helper.js';
import { udpdateCpfImportStatusController } from '../../../../../src/certification/session/application/update-cpf-import-status-controller.js';

describe('#updateFromReceipts', function () {
  it('should call updateFromReceipts', async function () {
    // given
    const request = {};

    // when
    const response = await udpdateCpfImportStatusController.updateFromReceipts(request, hFake);

    // then
    expect(response.statusCode).to.equal(200);
  });
});
