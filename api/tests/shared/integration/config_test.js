import { schema } from '../../../src/shared/config.js';

describe('Shared | Integration | Config', function () {
  describe('schema', function () {
    describe('when MADDO=true', function () {
      it('should require only MaDDo mandatory environment variables', function () {
        // given
        const env = {
          MADDO: 'true',
          AUTH_SECRET: 'auth secret',
          LOG_ENABLED: 'true',
          DATABASE_URL: 'postgres://plop:plop@localhost:1234/foo',
          DATAMART_DATABASE_URL: 'postgres://plop:plop@localhost:5678/bar',
          DATAWAREHOUSE_DATABASE_URL: 'postgres://plop:plop@localhost:8910/bar',
        };

        // when
        const result = schema.validate(env);

        // then
        expect(result).not.to.have.property('error');
      });
    });
  });
});
