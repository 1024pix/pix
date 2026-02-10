import path from 'node:path';
import * as url from 'node:url';

import inert from '@hapi/inert';

import { databaseConnections } from '../../../db/database-connections.js';
import { QueryTracker } from '../../shared/infrastructure/metrics/query-tracker.js';
import { QueryVizEventStream } from '../../shared/infrastructure/metrics/query-viz-event-stream.js';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

// Initialize event stream singleton
const eventStream = new QueryVizEventStream();

// Inject event stream into query tracker
const queryTracker = QueryTracker.getInstance();
queryTracker.setEventStream(eventStream);

const routes = [
  {
    method: 'GET',
    path: '/api/query-viz',
    config: {
      auth: false,
      description: 'Serve query visualization dashboard HTML page',
      tags: ['api', 'query-viz'],
    },
    handler: (request, h) => {
      return h.file(path.join(__dirname, 'public', 'index.html'));
    },
  },
  {
    method: 'GET',
    path: '/api/query-viz/stream',
    config: {
      auth: false,
      description: 'Server-Sent Events stream for real-time query updates',
      tags: ['api', 'query-viz', 'sse'],
    },
    handler: (request, h) => {
      const stream = eventStream.createStream();

      const response = h.response(stream);
      response.type('text/event-stream');
      response.header('Cache-Control', 'no-cache');
      response.header('Connection', 'keep-alive');
      response.header('X-Accel-Buffering', 'no'); // Disable nginx buffering

      // Cleanup on disconnect
      request.events.once('disconnect', () => {
        stream.end();
      });

      return response;
    },
  },
  {
    method: 'GET',
    path: '/api/query-viz/data',
    config: {
      auth: false,
      description: 'Get current query tracking data (historical + active)',
      tags: ['api', 'query-viz'],
    },
    handler: () => {
      const requests = queryTracker.getAllRequests();
      const poolMetricsData = databaseConnections.getPoolMetrics();
      const stats = queryTracker.getStats();

      return {
        requests,
        poolMetrics: poolMetricsData.pools || poolMetricsData, // Extract .pools if present
        stats,
        timestamp: Date.now(),
      };
    },
  },
  {
    method: 'POST',
    path: '/api/query-viz/clear',
    config: {
      auth: false,
      description: 'Clear all tracked query data',
      tags: ['api', 'query-viz'],
    },
    handler: () => {
      queryTracker.clear();

      // Broadcast clear event to all clients
      eventStream.broadcast({
        type: 'data-cleared',
        timestamp: Date.now(),
      });

      return { success: true, message: 'All query data cleared' };
    },
  },
  {
    method: 'GET',
    path: '/api/query-viz/stats',
    config: {
      auth: false,
      description: 'Get query tracker statistics',
      tags: ['api', 'query-viz'],
    },
    handler: () => {
      const stats = queryTracker.getStats();
      const poolMetricsData = databaseConnections.getPoolMetrics();
      const clientCount = eventStream.getClientCount();

      return {
        tracker: stats,
        pools: poolMetricsData.pools || poolMetricsData, // Extract .pools if present
        clients: clientCount,
        timestamp: Date.now(),
      };
    },
  },
  {
    method: 'GET',
    path: '/api/query-viz/assets/{param*}',
    config: {
      auth: false,
      description: 'Serve static assets (CSS, JS)',
      tags: ['api', 'query-viz'],
    },
    handler: {
      directory: {
        path: path.join(__dirname, 'public'),
        redirectToSlash: true,
        index: false,
      },
    },
  },
];

export const queryVizRoutes = {
  name: 'query-viz-routes',
  async register(server) {
    // Register inert plugin for serving static files
    await server.register(inert);

    // Register routes
    server.route(routes);
  },
};
