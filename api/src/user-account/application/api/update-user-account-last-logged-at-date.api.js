export class UpdateUserAccountLastLoggedAtDateApi {
  #userLoginRepository;

  /**
   * @param {UserLoginRepository} userLoginRepository
   */
  constructor(userLoginRepository) {
    this.#userLoginRepository = userLoginRepository;
  }

  /**
   * Update lastLoggedAt date for the provider userId
   *
   * @param {string|number} userId
   * @return {Promise<void>}
   */
  execute(userId) {
    return this.#userLoginRepository.updateLastLoggedAt({ userId });
  }
}
