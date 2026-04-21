import sinon from 'sinon';

import { CertificationResultsLinkToken } from '../../../../../../../src/certification/results/domain/models/tokens/CertificationResultsLinkToken.js';
import { config } from '../../../../../../../src/shared/config.js';
import { InvalidSessionResultTokenError } from '../../../../../../../src/shared/domain/errors.js';
import { tokenService } from '../../../../../../../src/shared/domain/services/token-service.js';

describe('Unit | Certification | Results | Domain | Model | CertificationResultsLinkToken', function () {
  beforeEach(function () {
    sinon.stub(config.authentication, 'secret').value('secret!');
    sinon.stub(config.jwtConfig.certificationResults, 'scope').value('certification-scope');
    sinon.stub(config.jwtConfig.certificationResults, 'tokenLifespan').value(1000);
  });

  describe('CertificationResultsLinkToken.decode', function () {
    it('decodes a valid token', function () {
      // given
      const token = CertificationResultsLinkToken.generate({ sessionId: 'sessionId!' });

      // when
      const decoded = CertificationResultsLinkToken.decode(token);

      // then
      expect(decoded).to.be.instanceOf(CertificationResultsLinkToken);
      expect(decoded).to.deep.include({ sessionId: 'sessionId!', scope: 'certification-scope' });
    });

    it('throws error for invalid token', function () {
      // given / when / then
      expect(() => CertificationResultsLinkToken.decode('invalid.token')).to.throw(InvalidSessionResultTokenError);
    });

    it('throws error if session_id is missing', function () {
      // given
      const token = tokenService.encodeToken({ scope: 'certification-scope' }, config.authentication.secret, {
        expiresIn: `${config.jwtConfig.certificationResults.tokenLifespan}`,
      });

      // when / then
      expect(() => CertificationResultsLinkToken.decode(token)).to.throw(InvalidSessionResultTokenError);
    });

    it('throws error if scope is invalid', function () {
      // given
      const token = tokenService.encodeToken(
        { session_id: 'sessionId!', scope: 'wrong-scope' },
        config.authentication.secret,
        {
          expiresIn: `${config.jwtConfig.certificationResults.tokenLifespan}`,
        },
      );

      // when / then
      expect(() => CertificationResultsLinkToken.decode(token)).to.throw(InvalidSessionResultTokenError);
    });
  });

  describe('CertificationResultsLinkToken.generate', function () {
    it('builds a certification results link token', function () {
      // given / when
      const token = CertificationResultsLinkToken.generate({ sessionId: 'sessionId!' });

      // then
      expect(token).to.be.a('string');

      const decoded = CertificationResultsLinkToken.decode(token);
      expect(decoded).to.deep.include({ sessionId: 'sessionId!', scope: 'certification-scope' });
    });
  });
});
