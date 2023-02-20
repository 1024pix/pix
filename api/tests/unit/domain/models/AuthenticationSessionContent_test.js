import { expect } from '../../../test-helper';
import AuthenticationSessionContent from '../../../../lib/domain/models/AuthenticationSessionContent';

describe('Unit | Domain | Models | AuthenticationSessionContent', function () {
  describe('#constructor', function () {
    it('should construct a model AuthenticationSessionContent from attributes', function () {
      // given
      const attributes = {
        accessToken: 'accessToken',
        idToken: 'idToken',
        expiresIn: 60,
        refreshToken: 'refreshToken',
      };

      // when
      const poleEmploiAuthenticationSessionContent = new AuthenticationSessionContent(attributes);

      // then
      expect(poleEmploiAuthenticationSessionContent).to.be.an.instanceof(AuthenticationSessionContent);
      expect(poleEmploiAuthenticationSessionContent).to.deep.equal(attributes);
    });
  });
});
