const MAXIMAL_SESSION_DURATION_IN_MS = 24 * 60 * 60 * 1000; // 24h
import { SessionStatusNotExistingError } from '../errors.js';

export const SESSION_STATUSES = Object.freeze({
  CREATED: 'created',
  STARTED: 'started',
  TO_FINALIZE: 'to_finalize',
  FINALIZED: 'finalized',
  IN_PROCESS: 'in_process',
  PROCESSED: 'processed',
});

type StatusType = (typeof SESSION_STATUSES)[keyof typeof SESSION_STATUSES];

type SessionStatusFactoryProps = {
  finalizedAt?: Date;
  publishedAt?: Date;
  assignedCertificationOfficerId?: number;
  firstCertificationStartedAt?: Date;
};

const SESSION_STATUS_ORDER: StatusType[] = [
  SESSION_STATUSES.CREATED,
  SESSION_STATUSES.STARTED,
  SESSION_STATUSES.TO_FINALIZE,
  SESSION_STATUSES.FINALIZED,
  SESSION_STATUSES.IN_PROCESS,
  SESSION_STATUSES.PROCESSED,
];

export class SessionStatus {
  #status: StatusType;

  constructor({ status }: { status: StatusType }) {
    if (!Object.values(SESSION_STATUSES).includes(status)) {
      throw new SessionStatusNotExistingError();
    }

    this.#status = status;
  }

  get status() {
    return this.#status;
  }

  isAtMostStarted(): boolean {
    return this.#isAtMost(SESSION_STATUSES.STARTED);
  }

  isAtMostInProcess(): boolean {
    return this.#isAtMost(SESSION_STATUSES.IN_PROCESS);
  }

  isCreated(): boolean {
    return this.#status === SESSION_STATUSES.CREATED;
  }

  isToFinalize(): boolean {
    return this.#status === SESSION_STATUSES.TO_FINALIZE;
  }

  #isAtMost(status: StatusType): boolean {
    return statusPosition(this.#status) <= statusPosition(status);
  }

  static build({
    finalizedAt,
    publishedAt,
    assignedCertificationOfficerId,
    firstCertificationStartedAt,
  }: SessionStatusFactoryProps) {
    if (publishedAt) {
      return new SessionStatus({ status: SESSION_STATUSES.PROCESSED });
    }
    if (assignedCertificationOfficerId) {
      return new SessionStatus({ status: SESSION_STATUSES.IN_PROCESS });
    }
    if (finalizedAt) {
      return new SessionStatus({ status: SESSION_STATUSES.FINALIZED });
    }
    if (firstCertificationStartedAt && isExpired(firstCertificationStartedAt)) {
      return new SessionStatus({ status: SESSION_STATUSES.TO_FINALIZE });
    }
    if (firstCertificationStartedAt) {
      return new SessionStatus({ status: SESSION_STATUSES.STARTED });
    }
    return new SessionStatus({ status: SESSION_STATUSES.CREATED });
  }
}

function isExpired(firstCertificationStartedAt: Date): boolean {
  const elapsedTimeSinceSessionStarted = Date.now() - firstCertificationStartedAt.getTime();
  return elapsedTimeSinceSessionStarted > MAXIMAL_SESSION_DURATION_IN_MS;
}

function statusPosition(status: StatusType): number {
  return SESSION_STATUS_ORDER.indexOf(status);
}
