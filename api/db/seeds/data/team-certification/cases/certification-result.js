import { Frameworks } from '../../../../../src/certification/shared/domain/models/Frameworks.js';

export class CertificationResultSeed {
  constructor({ databaseBuilder }) {
    this.databaseBuilder = databaseBuilder;
  }

  async create() {
    const user = this.databaseBuilder.factory.buildUser();
    const session = this.databaseBuilder.factory.buildSession();

    const certificationResult = this.databaseBuilder.factory.buildCertificationResult({
      firstName: user.firstName,
      lastName: user.lastName,
      birthdate: user.birthdate,
      birthplace: user.birthplace,
      birthPostalCode: user.birthPostalCode,
      birthCountry: user.birthCountry,
      status: 'validated',
      framework: Frameworks.CORE,
    });
    this.databaseBuilder.factory.buildUserCertificationResult({
      certificationResultId: certificationResult.id,
      userId: user.id,
      sessionId: session.id,
    });

    await this.databaseBuilder.commit();
  }
}
