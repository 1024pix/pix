import sinon from 'sinon';

import { CertificationResultsLinkByEmailToken } from '../../../../../../../src/certification/results/domain/models/tokens/CertificationResultsLinkByEmailToken.js';
import { config } from '../../../../../../../src/shared/config.js';
import { InvalidResultRecipientTokenError } from '../../../../../../../src/shared/domain/errors.js';
import { tokenService } from '../../../../../../../src/shared/domain/services/token-service.js';

describe('Unit | Certification | Results | Domain | Model | CertificationResultsLinkByEmailToken', function () {
  beforeEach(function () {
    sinon.stub(config.authentication, 'secret').value('secret!');
  });

  describe('CertificationResultsLinkByEmailToken.decode', function () {
    it('decodes a valid token', function () {
      // given
      const token = CertificationResultsLinkByEmailToken.generate({
        sessionId: 'sessionId!',
        resultRecipientEmail: 'recipient@example.com',
        daysBeforeExpiration: 1,
      });

      // when
      const decoded = CertificationResultsLinkByEmailToken.decode(token);

      // then
      expect(decoded).to.be.instanceOf(CertificationResultsLinkByEmailToken);
      expect(decoded).to.deep.include({
        sessionId: 'sessionId!',
        resultRecipientEmail: 'recipient@example.com',
        scope: 'certificationResultsByRecipientEmailLink',
      });
    });

    it('throws error for invalid token', function () {
      expect(() => CertificationResultsLinkByEmailToken.decode('invalid.token')).to.throw(
        InvalidResultRecipientTokenError,
      );
    });

    it('throws error if session_id is missing', function () {
      const token = tokenService.encodeToken(
        { result_recipient_email: 'recipient@example.com', scope: 'certificationResultsByRecipientEmailLink' },
        config.authentication.secret,
        { expiresIn: '1d' },
      );
      expect(() => CertificationResultsLinkByEmailToken.decode(token)).to.throw(InvalidResultRecipientTokenError);
    });

    it('throws error if result_recipient_email is missing', function () {
      const token = tokenService.encodeToken(
        { session_id: 'sessionId!', scope: 'certificationResultsByRecipientEmailLink' },
        config.authentication.secret,
        { expiresIn: '1d' },
      );
      expect(() => CertificationResultsLinkByEmailToken.decode(token)).to.throw(InvalidResultRecipientTokenError);
    });

    it('throws error if scope is invalid', function () {
      const token = tokenService.encodeToken(
        { session_id: 'sessionId!', result_recipient_email: 'recipient@example.com', scope: 'wrong-scope' },
        config.authentication.secret,
        { expiresIn: '1d' },
      );
      expect(() => CertificationResultsLinkByEmailToken.decode(token)).to.throw(InvalidResultRecipientTokenError);
    });
  });

  describe('CertificationResultsLinkByEmailToken.generate', function () {
    it('builds a certification results link by email token', function () {
      // given / when
      const token = CertificationResultsLinkByEmailToken.generate({
        sessionId: 'sessionId!',
        resultRecipientEmail: 'recipient@example.com',
        daysBeforeExpiration: 1,
      });

      // then
      expect(token).to.be.a('string');

      const decoded = CertificationResultsLinkByEmailToken.decode(token);
      expect(decoded).to.deep.include({
        sessionId: 'sessionId!',
        resultRecipientEmail: 'recipient@example.com',
        scope: 'certificationResultsByRecipientEmailLink',
      });
    });
  });
});
