import { createCertifiableProfile } from '../../common/tooling/profile-tooling.js';
import { CERTIFIABLE_SUCCESS_USER_ID } from './constants.js';

/**
 * Default Certification Pix App certifiable user
 *    - Pix Orga user   : certif-success@example.net
 */
export class CommonCertifiableUser {
  certifiableUser;

  constructor({ databaseBuilder }) {
    this.databaseBuilder = databaseBuilder;
  }

  static async getInstance({ databaseBuilder }) {
    if (!this.instance) {
      this.instance = await new CommonCertifiableUser({ databaseBuilder }).#init();
    }

    return this.instance;
  }

  async #init() {
    const user = this.databaseBuilder.factory.buildUser.withRawPassword({
      id: CERTIFIABLE_SUCCESS_USER_ID,
      firstName: 'Max',
      lastName: 'Lagagne',
      email: 'certif-success@example.net',
      cgu: true,
      lang: 'fr',
      lastTermsOfServiceValidatedAt: new Date(),
    });

    await createCertifiableProfile({
      databaseBuilder: this.databaseBuilder,
      userId: user.id,
    });

    this.certifiableUser = user;

    return this;
  }
}
