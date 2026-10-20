// To delete when DomainTransaction.js is converted to TypeScript.
import { type AsyncLocalStorage } from 'node:async_hooks';

import { type Knex } from 'knex';

export class DomainTransaction {
  knexTransaction: Knex.Transaction | null;
  successHandlers: (() => unknown)[];

  constructor(knexTransaction: Knex.Transaction | null);

  /** Runs the lambda in the open transaction, synchronously, or in a new one. */
  static execute<Result>(
    lambda: (domainTransaction?: DomainTransaction) => Result,
    transactionConfig?: Knex.TransactionConfig,
  ): Result | Promise<Awaited<Result>>;
  static addSuccessHandler(handler: () => unknown): Promise<void>;
  static getConnection(): Knex;
  static emptyTransaction(): DomainTransaction;
}

export function withTransaction<Arguments extends unknown[], Result>(
  func: (...args: Arguments) => Result | Promise<Result>,
  transactionConfig?: Knex.TransactionConfig,
): (...args: Arguments) => Promise<Result>;

export const asyncLocalStorage: AsyncLocalStorage<{ transaction: DomainTransaction }>;
