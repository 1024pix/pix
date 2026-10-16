import Hapi, { type Request, type Server } from '@hapi/hapi';
import { expect } from 'chai';
import sinon from 'sinon';

import {
  EventLoopWatchdog,
  eventLoopWatchdogPlugin,
  InFlightRequestRegistry,
  type TrackedRequest,
  type WatchdogLog,
} from '../../../../../src/shared/infrastructure/event-loop-watchdog/event-loop-watchdog.ts';

function buildRequest({
  id,
  method = 'get',
  route,
  path = '/api/foo',
}: {
  id: string;
  method?: Request['method'];
  route?: string;
  path?: string;
}): TrackedRequest {
  return {
    method,
    path,
    route: route ? { path: route } : undefined,
    headers: { 'x-request-id': id },
    info: { id: `info-${id}`, received: 0 },
  };
}

describe('Shared | Unit | Infrastructure | EventLoopWatchdog', function () {
  describe('InFlightRequestRegistry', function () {
    let registry: InFlightRequestRegistry;

    beforeEach(function () {
      registry = new InFlightRequestRegistry();
    });

    it('reports running requests, oldest first', function () {
      // given
      registry.add(buildRequest({ id: 'recent', route: '/api/answers' }), 9_000);
      registry.add(
        buildRequest({
          id: 'old',
          method: 'post',
          route: '/api/campaigns/{id}/csv',
        }),
        1_000,
      );

      // when
      const { count, requests } = registry.collect({
        windowStart: 9_500,
        now: 10_000,
        limit: 10,
      });

      // then
      expect(count).to.equal(2);
      expect(requests).to.deep.equal([
        {
          request_id: 'old',
          method: 'POST',
          route: '/api/campaigns/{id}/csv',
          path: '/api/foo',
          startedAt: '1970-01-01T00:00:01.000Z',
          elapsedMs: 9_000,
          finished: false,
        },
        {
          request_id: 'recent',
          method: 'GET',
          route: '/api/answers',
          path: '/api/foo',
          startedAt: '1970-01-01T00:00:09.000Z',
          elapsedMs: 1_000,
          finished: false,
        },
      ]);
    });

    it('reports a request that finished during the observed window, then forgets it', function () {
      // given
      const request = buildRequest({ id: 'culprit' });
      registry.add(request, 1_000);
      registry.finish(request, 9_900);

      // when
      const first = registry.collect({
        windowStart: 9_500,
        now: 10_000,
        limit: 10,
      });
      const second = registry.collect({
        windowStart: 10_000,
        now: 10_100,
        limit: 10,
      });

      // then
      expect(first.requests).to.have.lengthOf(1);
      expect(first.requests[0]).to.include({
        request_id: 'culprit',
        elapsedMs: 8_900,
        finished: true,
      });
      expect(second.count).to.equal(0);
      expect(registry.size).to.equal(0);
    });

    it('does not report a request that finished before the observed window', function () {
      // given
      const request = buildRequest({ id: 'done' });
      registry.add(request, 1_000);
      registry.finish(request, 2_000);

      // when
      const { count } = registry.collect({
        windowStart: 9_500,
        now: 10_000,
        limit: 10,
      });

      // then
      expect(count).to.equal(0);
    });

    it('limits the number of reported requests but returns the total count', function () {
      // given
      registry.add(buildRequest({ id: 'a' }), 1_000);
      registry.add(buildRequest({ id: 'b' }), 2_000);
      registry.add(buildRequest({ id: 'c' }), 3_000);

      // when
      const { count, requests } = registry.collect({
        windowStart: 9_500,
        now: 10_000,
        limit: 2,
      });

      // then
      expect(count).to.equal(3);
      expect(requests.map(({ request_id }) => request_id)).to.deep.equal(['a', 'b']);
    });

    it('prunes finished requests and keeps running ones', function () {
      // given
      const finished = buildRequest({ id: 'finished' });
      registry.add(finished, 1_000);
      registry.add(buildRequest({ id: 'running' }), 1_000);
      registry.finish(finished, 2_000);

      // when
      registry.prune();

      // then
      expect(registry.size).to.equal(1);
    });
  });

  describe('EventLoopWatchdog', function () {
    let logger: { warn: sinon.SinonStub<[WatchdogLog, string], void> };
    let registry: InFlightRequestRegistry;
    let monotonicNow: sinon.SinonStub<[], number>;
    let now: sinon.SinonStub<[], number>;
    let watchdog: EventLoopWatchdog;

    beforeEach(function () {
      logger = { warn: sinon.stub<[WatchdogLog, string], void>() };
      registry = new InFlightRequestRegistry();
      monotonicNow = sinon.stub<[], number>().returns(0);
      now = sinon.stub<[], number>().returns(1_000_000);
      watchdog = new EventLoopWatchdog({
        registry,
        checkInterval: 100,
        threshold: 500,
        maxReportedRequests: 10,
        logger,
        now,
        monotonicNow,
      });
      watchdog.start();
    });

    afterEach(function () {
      watchdog.stop();
    });

    it('logs nothing when the timer fires on time', function () {
      // given
      monotonicNow.returns(120);
      now.returns(1_000_120);

      // when
      watchdog.check();

      // then
      sinon.assert.notCalled(logger.warn);
    });

    it('logs the lag and the requests in flight when the event loop was blocked', function () {
      // given
      registry.add(
        buildRequest({
          id: 'export',
          route: '/api/campaigns/{campaignId}/csv-assessment-results',
        }),
        990_000,
      );
      monotonicNow.returns(2_100);
      now.returns(1_002_100);

      // when
      watchdog.check();

      // then
      sinon.assert.calledOnce(logger.warn);
      const [payload, message] = logger.warn.firstCall.args;
      expect(message).to.equal('event loop blocked');
      expect(payload).to.include({
        lagMs: 2_000,
        blockedSince: '1970-01-01T00:16:40.000Z',
        inFlightRequestsCount: 1,
      });
      expect(payload.inFlightRequests[0]).to.include({
        request_id: 'export',
        route: '/api/campaigns/{campaignId}/csv-assessment-results',
        elapsedMs: 12_100,
      });
    });

    it('measures the lag from the previous tick', function () {
      // given
      monotonicNow.returns(100);
      now.returns(1_000_100);
      watchdog.check();
      monotonicNow.returns(800);
      now.returns(1_000_800);

      // when
      watchdog.check();

      // then
      sinon.assert.calledOnce(logger.warn);
      expect(logger.warn.firstCall.args[0]).to.include({
        lagMs: 600,
        blockedSince: '1970-01-01T00:16:40.100Z',
      });
    });
  });

  describe('eventLoopWatchdogPlugin', function () {
    let server: Server;
    let watchdog: {
      registry: InFlightRequestRegistry;
      start: sinon.SinonStub;
      stop: sinon.SinonStub;
    };
    let reportedDuringHandler: ReturnType<InFlightRequestRegistry['collect']> | undefined;

    beforeEach(function () {
      server = Hapi.server({ port: 0 });
      watchdog = {
        registry: new InFlightRequestRegistry(),
        start: sinon.stub(),
        stop: sinon.stub(),
      };
      reportedDuringHandler = undefined;
      server.route({
        method: 'GET',
        path: '/api/slow/{id}',
        handler() {
          reportedDuringHandler = watchdog.registry.collect({ windowStart: 0, now: Date.now(), limit: 10 });
          return 'ok';
        },
      });
    });

    afterEach(async function () {
      await server.stop();
    });

    it('does nothing when disabled', async function () {
      // given
      await server.register({ plugin: eventLoopWatchdogPlugin, options: { enabled: false, watchdog } });

      // when
      await server.inject({ method: 'GET', url: '/api/slow/1' });
      await server.start();

      // then
      expect(reportedDuringHandler?.count).to.equal(0);
      sinon.assert.notCalled(watchdog.start);
    });

    it('tracks a request while it is handled, then marks it as finished', async function () {
      // given
      await server.register({ plugin: eventLoopWatchdogPlugin, options: { enabled: true, watchdog } });
      // le listener du plugin a été enregistré avant celui-ci, il a donc déjà tourné
      const responded = new Promise((resolve) => server.events.once('response', resolve));

      // when
      await server.inject({ method: 'GET', url: '/api/slow/1', headers: { 'x-request-id': 'r1' } });
      await responded;

      // then
      expect(reportedDuringHandler?.count).to.equal(1);
      expect(reportedDuringHandler?.requests[0]).to.include({
        request_id: 'r1',
        method: 'GET',
        route: '/api/slow/{id}',
        path: '/api/slow/1',
        finished: false,
      });
      const afterResponse = watchdog.registry.collect({ windowStart: Date.now() + 1_000, now: Date.now(), limit: 10 });
      expect(afterResponse.count).to.equal(0);
      expect(watchdog.registry.size).to.equal(0);
    });

    it('starts and stops the watchdog with the server', async function () {
      // given
      await server.register({ plugin: eventLoopWatchdogPlugin, options: { enabled: true, watchdog } });

      // when
      await server.start();
      await server.stop();

      // then
      sinon.assert.calledOnce(watchdog.start);
      sinon.assert.calledOnce(watchdog.stop);
    });
  });
});
