import sinon from 'sinon';

import { ApplicationAccessToken } from '../../../../../src/identity-access-management/domain/models/ApplicationAccessToken.js';
import { config } from '../../../../../src/shared/config.js';

describe('Unit | Identity Access Management | Domain | Model | ApplicationAccessToken', function () {
  beforeEach(function () {
    sinon.stub(config.authentication, 'secret').value('secret!');
    sinon.stub(config.authentication, 'accessTokenLifespanMs').value(3600000);
  });

  describe('ApplicationAccessToken.decode', function () {
    it('decodes a valid token', function () {
      // given
      const token = ApplicationAccessToken.generate({
        clientId: 'clientId!',
        source: 'source!',
        scope: 'scope!',
      });

      // when
      const decoded = ApplicationAccessToken.decode(token);

      // then
      expect(decoded).to.be.instanceOf(ApplicationAccessToken);
      expect(decoded).to.deep.include({
        clientId: 'clientId!',
        source: 'source!',
        scope: 'scope!',
      });
    });

    it('returns empty object for invalid token', function () {
      // given / when
      const decoded = ApplicationAccessToken.decode('invalid.token');

      // then
      expect(decoded).to.be.instanceOf(ApplicationAccessToken);
      expect(decoded.clientId).to.be.undefined;
      expect(decoded.source).to.be.undefined;
      expect(decoded.scope).to.be.undefined;
    });
  });

  describe('ApplicationAccessToken.generate', function () {
    it('builds an access token', function () {
      // given / when
      const token = ApplicationAccessToken.generate({
        clientId: 'clientId!',
        source: 'source!',
        scope: ['read', 'write'],
      });

      // then
      expect(token).to.be.a('string');

      const decoded = ApplicationAccessToken.decode(token);
      expect(decoded).to.deep.include({
        clientId: 'clientId!',
        source: 'source!',
        scope: 'read write',
      });
    });
  });
});
