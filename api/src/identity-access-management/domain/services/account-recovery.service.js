import { AccountRecoveryDemandExpired, UserHasAlreadyLeftSCO } from '../../../shared/domain/errors.js';
import { AccountRecoveryDemand } from '../models/AccountRecoveryDemand.js';

export class AccountRecoveryService {
  constructor({ userRepository, accountRecoveryDemandRepository, cryptoService }) {
    this.userRepository = userRepository;
    this.accountRecoveryDemandRepository = accountRecoveryDemandRepository;
    this.cryptoService = cryptoService;
  }

  async createRecoveryDemand({ userId, newEmail, organizationLearnerId }) {
    await this.#assertUsedRecoveryDemandsForUser(userId);

    const user = await this.userRepository.get(userId);
    await this.userRepository.checkIfEmailIsAvailable(newEmail);

    const temporaryKey = await this.#createTemporaryKey();
    const accountRecoveryDemand = new AccountRecoveryDemand({
      userId,
      newEmail,
      oldEmail: user.email,
      used: false,
      temporaryKey,
      organizationLearnerId,
    });

    return this.accountRecoveryDemandRepository.save(accountRecoveryDemand);
  }

  async getRecoveryDemand(temporaryKey) {
    const accountRecoveryDemand = await this.accountRecoveryDemandRepository.findByTemporaryKey(temporaryKey);
    if (accountRecoveryDemand.hasExpired) throw new AccountRecoveryDemandExpired();

    await this.#assertUsedRecoveryDemandsForUser(accountRecoveryDemand.userId);

    await this.userRepository.checkIfEmailIsAvailable(accountRecoveryDemand.newEmail);

    return accountRecoveryDemand;
  }

  async #createTemporaryKey() {
    const randomBytesBuffer = await this.cryptoService.randomBytes(32);
    return randomBytesBuffer.toString('hex');
  }

  async #assertUsedRecoveryDemandsForUser(userId) {
    const accountRecoveryDemands = await this.accountRecoveryDemandRepository.findByUserId(userId);
    if (accountRecoveryDemands.some((accountRecoveryDemand) => accountRecoveryDemand.used)) {
      throw new UserHasAlreadyLeftSCO(); // TODO: changer le nom
    }
  }
}
