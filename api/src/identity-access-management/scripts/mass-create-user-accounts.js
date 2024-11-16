import Joi from 'joi';

import { csvFileParser } from '../../shared/application/scripts/parsers.js';
import { Script } from '../../shared/application/scripts/script.js';
import { ScriptRunner } from '../../shared/application/scripts/script-runner.js';
import { DomainTransaction } from '../../shared/domain/DomainTransaction.js';
import { cryptoService } from '../../shared/domain/services/crypto-service.js';
import * as userService from '../../shared/domain/services/user-service.js';
import * as authenticationMethodRepository from '../infrastructure/repositories/authentication-method.repository.js';
import { userToCreateRepository } from '../infrastructure/repositories/user-to-create.repository.js';

export const csvSchemas = [
  { name: 'firstName', schema: Joi.string().trim().required() },
  { name: 'lastName', schema: Joi.string().trim().required() },
  { name: 'email', schema: Joi.string().trim().lowercase().email().required() },
  { name: 'password', schema: Joi.string().trim().required() },
];

export class MassCreateUserAccountsScript extends Script {
  constructor() {
    super({
      description: 'This script allows you to create Pix user accounts with email/password',
      permanent: true,
      options: {
        file: {
          type: 'string',
          describe: 'CSV file path',
          demandOption: true,
          coerce: csvFileParser(csvSchemas),
        },
      },
    });
  }
  async handle({ options }) {
    const { file } = options;

    await DomainTransaction.execute(async () => {
      const now = new Date();

      for (const userDTO of file) {
        const userToCreate = {
          firstName: userDTO.firstName,
          lastName: userDTO.lastName,
          email: userDTO.email,
          createAt: now,
          updatedAt: now,
          cgu: true,
          lang: 'fr',
        };
        const hashedPassword = await cryptoService.hashPassword(userDTO.password);

        await userService.createUserWithPassword({
          user: userToCreate,
          hashedPassword,
          userToCreateRepository,
          authenticationMethodRepository,
        });
      }
    });
  }
}

await ScriptRunner.execute(import.meta.url, MassCreateUserAccountsScript);
