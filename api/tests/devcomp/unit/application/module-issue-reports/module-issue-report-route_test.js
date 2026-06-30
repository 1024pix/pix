import sinon from 'sinon';

import { moduleIssueReportController } from '../../../../../src/devcomp/application/module-issue-report/module-issue-report-controller.js';
import { moduleIssueReportRoute as moduleUnderTest } from '../../../../../src/devcomp/application/module-issue-report/module-issue-report-route.js';
import { expect } from '../../../../test-helper.js';
import { HttpTestServer } from '../../../../tooling/server/http-test-server.js';

describe('Integration | Devcomp | Application | Module | Router | module-issue-report-router', function () {
  describe('POST /api/module-issue-reports', function () {
    describe('when answer is null', function () {
      it('should return a HTTP 200 status code', async function () {
        // given
        sinon.stub(moduleIssueReportController, 'createModuleIssueReport').resolves('ok');
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);

        const moduleIssueReport = {
          'module-id': '6282925d-4775-4bca-b513-4c3009ec5886',
          'element-id': '96e29215-3610-4bc6-b4a6-026bf13276b8',
          'passage-id': '11',
          answer: null,
          'category-key': 'la coolitude',
          comment: "Pix c'est génial.",
        };

        const payload = {
          data: {
            type: 'module-issue-reports',
            attributes: moduleIssueReport,
          },
        };
        const headers = {
          'user-agent':
            'Mozilla/5.0 (Linux; Android 10; MGA-AL00 Build/HUAWEIMGA-AL00; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/86.0.4240.99 XWEB/4343 MMWEBSDK/20221011 Mobile Safari/537.36 MMWEBID/7309 MicroMessenger/8.0.30.2260(0x28001E3B) WeChat/arm64 Weixin NetType/WIFI Language/zh_CN ABI/arm64',
        };

        // when
        const response = await httpTestServer.request('POST', '/api/module-issue-reports', payload, null, headers);

        // then
        expect(response.statusCode).to.equal(200);
      });
    });
    describe('when provided payload is empty', function () {
      it('should return an HTTP 400 error', async function () {
        // given
        sinon.stub(moduleIssueReportController, 'createModuleIssueReport').resolves('ok');

        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);
        const invalidPayload = {};

        // when
        const response = await httpTestServer.request('POST', '/api/module-issue-reports', invalidPayload);

        // then
        expect(response.statusCode).to.equal(400);
      });
    });
    describe('when some attributes are missing in payload', function () {
      it('should return an HTTP 400 error', async function () {
        // given
        sinon.stub(moduleIssueReportController, 'createModuleIssueReport').resolves('ok');
        const httpTestServer = new HttpTestServer();
        await httpTestServer.register(moduleUnderTest);
        const payloadWithoutCategoryKey = {
          'module-id': '6282925d-4775-4bca-b513-4c3009ec5886',
          'element-id': '96e29215-3610-4bc6-b4a6-026bf13276b8',
          'passage-id': '12',
          comment: "Pix c'est génial.",
        };

        // when
        const response = await httpTestServer.request('POST', '/api/module-issue-reports', payloadWithoutCategoryKey);

        // then
        expect(response.statusCode).to.equal(400);
      });
    });
  });
});
