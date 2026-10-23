import { performance } from 'node:perf_hooks';

import type { Plugin, Request } from '@hapi/hapi';

import { config } from '../../../../config/config.js';
import { child } from '../utils/logger.js';

/**
 * Sous-ensemble d'une requête hapi lu par le watchdog : une `Request` s'y
 * conforme, et les tests peuvent en construire une sans tout le reste.
 */
export type TrackedRequest = Pick<Request, 'method' | 'path' | 'headers'> & {
  route?: Pick<Request['route'], 'path'>;
  info: Pick<Request['info'], 'id' | 'received'>;
};

type RegistryEntry = {
  request: TrackedRequest;
  startedAt: number;
  finishedAt: number | null;
};

export type ReportedRequest = {
  request_id: string;
  method: string;
  route: string | undefined;
  path: string;
  startedAt: string;
  elapsedMs: number;
  finished: boolean;
};

export type WatchdogLog = {
  lagMs: number;
  blockedSince: string;
  inFlightRequestsCount: number;
  inFlightRequests: ReportedRequest[];
};

type WatchdogLogger = {
  warn(mergingObject: WatchdogLog, message: string): void;
};

// config.js n'est pas typé
const watchdogConfig: {
  enabled: boolean;
  checkInterval: number;
  threshold: number;
  maxReportedRequests: number;
} = config.eventLoopWatchdog;

/**
 * Tient la liste des requêtes HTTP en cours de traitement sur le process.
 *
 * Une requête terminée n'est pas oubliée tout de suite : celle qui a bloqué la
 * boucle d'événements peut très bien finir juste après le blocage, avant que le
 * watchdog n'ait eu la main pour la voir. On la garde donc jusqu'au prochain
 * relevé, qui la rapporte si elle était encore en cours pendant la fenêtre
 * observée.
 */
export class InFlightRequestRegistry {
  #requests = new Map<TrackedRequest, RegistryEntry>();

  add(request: TrackedRequest, startedAt: number): void {
    this.#requests.set(request, { request, startedAt, finishedAt: null });
  }

  finish(request: TrackedRequest, finishedAt: number): void {
    const entry = this.#requests.get(request);
    if (entry) entry.finishedAt = finishedAt;
  }

  /**
   * Renvoie les requêtes actives pendant la fenêtre [windowStart, now], puis
   * oublie celles qui étaient terminées : elles ne peuvent plus concerner les
   * fenêtres suivantes.
   */
  collect({ windowStart, now, limit }: { windowStart: number; now: number; limit: number }): {
    count: number;
    requests: ReportedRequest[];
  } {
    const active: RegistryEntry[] = [];
    for (const [request, entry] of this.#requests) {
      if (entry.finishedAt === null || entry.finishedAt >= windowStart) {
        active.push(entry);
      }
      if (entry.finishedAt !== null) {
        this.#requests.delete(request);
      }
    }

    // les plus anciennes d'abord : c'est en général parmi elles que se trouve
    // celle qui monopolise le CPU
    const oldestFirst = active.toSorted((a, b) => a.startedAt - b.startedAt);

    return {
      count: active.length,
      requests: oldestFirst.slice(0, limit).map((entry) => _serialize(entry, now)),
    };
  }

  /**
   * Oublie les requêtes terminées, pour éviter que le registre ne grossisse
   * quand aucun blocage ne déclenche de relevé.
   */
  prune(): void {
    for (const [request, entry] of this.#requests) {
      if (entry.finishedAt !== null) this.#requests.delete(request);
    }
  }

  get size(): number {
    return this.#requests.size;
  }
}

function _serialize({ request, startedAt, finishedAt }: RegistryEntry, now: number): ReportedRequest {
  const requestIdHeader: unknown = request.headers['x-request-id'];
  return {
    request_id: typeof requestIdHeader === 'string' ? requestIdHeader : request.info.id,
    method: request.method.toUpperCase(),
    // la route n'est résolue qu'après onRequest, d'où la lecture au moment du relevé
    route: request.route?.path,
    path: request.path,
    startedAt: new Date(startedAt).toISOString(),
    elapsedMs: (finishedAt ?? now) - startedAt,
    finished: finishedAt !== null,
  };
}

/**
 * Détecte les blocages de la boucle d'événements et journalise les requêtes
 * HTTP qui étaient en cours à ce moment-là.
 *
 * Le principe : un timer est programmé toutes les `checkInterval` ms. S'il se
 * déclenche avec un retard supérieur à `threshold`, c'est que du code
 * synchrone a monopolisé le thread pendant au moins ce temps. Le log ne désigne
 * pas formellement le coupable — le code bloquant a déjà rendu la main — mais
 * la requête longue qui revient à chaque alerte saute aux yeux.
 */
export class EventLoopWatchdog {
  #registry: InFlightRequestRegistry;
  #checkInterval: number;
  #threshold: number;
  #maxReportedRequests: number;
  #logger: WatchdogLogger;
  #now: () => number;
  #monotonicNow: () => number;
  #timer: NodeJS.Timeout | null = null;
  #lastTick = 0;
  #lastTickDate = 0;

  constructor({
    registry = new InFlightRequestRegistry(),
    checkInterval = watchdogConfig.checkInterval,
    threshold = watchdogConfig.threshold,
    maxReportedRequests = watchdogConfig.maxReportedRequests,
    logger = child('event-loop-watchdog', { event: 'event-loop-watchdog' }, {}),
    now = Date.now,
    monotonicNow = () => performance.now(),
  }: {
    registry?: InFlightRequestRegistry;
    checkInterval?: number;
    threshold?: number;
    maxReportedRequests?: number;
    logger?: WatchdogLogger;
    now?: () => number;
    monotonicNow?: () => number;
  } = {}) {
    this.#registry = registry;
    this.#checkInterval = checkInterval;
    this.#threshold = threshold;
    this.#maxReportedRequests = maxReportedRequests;
    this.#logger = logger;
    this.#now = now;
    this.#monotonicNow = monotonicNow;
  }

  get registry(): InFlightRequestRegistry {
    return this.#registry;
  }

  start(): void {
    if (this.#timer) return;
    this.#lastTick = this.#monotonicNow();
    this.#lastTickDate = this.#now();
    this.#timer = setInterval(() => this.check(), this.#checkInterval);
    // le watchdog ne doit pas empêcher le process de s'arrêter
    this.#timer.unref();
  }

  stop(): void {
    if (this.#timer) clearInterval(this.#timer);
    this.#timer = null;
  }

  check(): void {
    const tick = this.#monotonicNow();
    const tickDate = this.#now();
    const lagMs = Math.round(tick - this.#lastTick - this.#checkInterval);
    const windowStart = this.#lastTickDate;

    this.#lastTick = tick;
    this.#lastTickDate = tickDate;

    if (lagMs < this.#threshold) {
      this.#registry.prune();
      return;
    }

    const { count, requests } = this.#registry.collect({
      windowStart,
      now: tickDate,
      limit: this.#maxReportedRequests,
    });

    this.#logger.warn(
      {
        lagMs,
        blockedSince: new Date(windowStart).toISOString(),
        inFlightRequestsCount: count,
        inFlightRequests: requests,
      },
      'event loop blocked',
    );
  }
}

export type WatchdogPluginOptions = {
  enabled?: boolean;
  watchdog?: Pick<EventLoopWatchdog, 'registry' | 'start' | 'stop'>;
  now?: () => number;
};

export const eventLoopWatchdogPlugin: Plugin<WatchdogPluginOptions> = {
  name: 'event-loop-watchdog',
  register(
    server,
    {
      enabled = watchdogConfig.enabled,
      watchdog = new EventLoopWatchdog(),
      now = Date.now,
    }: WatchdogPluginOptions = {},
  ): void {
    if (!enabled) return;

    server.ext('onRequest', (request, h) => {
      watchdog.registry.add(request, request.info.received);
      return h.continue;
    });

    // émis aussi quand le client abandonne la requête
    server.events.on('response', (request) => {
      watchdog.registry.finish(request, now());
    });

    server.ext('onPostStart', () => watchdog.start());
    server.ext('onPreStop', () => watchdog.stop());
  },
};
