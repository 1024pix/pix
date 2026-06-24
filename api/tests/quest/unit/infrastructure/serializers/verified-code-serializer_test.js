import { VerifiedCode } from '../../../../../src/quest/domain/models/prescription/value-objects/VerifiedCode.js';
import * as verifiedCodeSerializer from '../../../../../src/quest/infrastructure/serializers/verified-code-serializer.js';
import { expect } from '../../../../test-helper.js';

describe('Quest | Unit | Infrastructure | Serializers | verified-code', function () {
  it('#serialize', function () {
    // given
    const verifiedCode = new VerifiedCode({ code: 'ABCDEFGH', type: 'campaign' });

    // when
    const serializedVerifiedCode = verifiedCodeSerializer.serialize(verifiedCode);

    // then
    expect(serializedVerifiedCode).to.deep.equal({
      data: {
        attributes: {
          type: 'campaign',
        },
        type: 'verified-codes',
        id: 'ABCDEFGH',
        relationships: {
          campaign: {
            links: {
              related: '/api/campaigns?filter[code]=ABCDEFGH',
            },
          },
          'combined-course': {
            links: {
              related: '/api/combined-courses?filter[code]=ABCDEFGH',
            },
          },
        },
      },
    });
  });
});
