import { databaseBuilder } from '../../../../tooling/databases.js';
import { server } from '../../../../tooling/servers.js';

describe('Acceptance | Route | module-issue-report', function () {
  describe('POST /api/module-issue-reports', function () {
    let options;

    beforeEach(async function () {
      // given
      const passage = databaseBuilder.factory.buildPassage();
      await databaseBuilder.commit();

      options = {
        method: 'POST',
        url: '/api/module-issue-reports',
        payload: {
          data: {
            type: 'module-issue-reports',
            attributes: {
              'module-id': '7d2a96d8-b7e3-4b97-acbf-5e51aa892279',
              'element-id': '0aed9f0d-e735-48f8-900b-32cc4251dd0e',
              'passage-id': passage.id,
              answer: 'ma super réponse',
              'category-key': 'C’est tout cassé',
              comment: 'C’est tout cassé',
            },
          },
        },
        headers: {
          'user-agent':
            'Mozilla/5.0 (Linux; Android 10; MGA-AL00 Build/HUAWEIMGA-AL00; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/86.0.4240.99 XWEB/4343 MMWEBSDK/20221011 Mobile Safari/537.36 MMWEBID/7309 MicroMessenger/8.0.30.2260(0x28001E3B) WeChat/arm64 Weixin NetType/WIFI Language/zh_CN ABI/arm64',
        },
      };
    });

    it('should return 201 HTTP status code', async function () {
      // when
      const response = await server.inject(options);

      // then
      expect(response.statusCode).to.equal(201);
      expect(response.result.data.id).to.exist;
    });
  });
});
