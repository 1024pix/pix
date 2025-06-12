import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';

export async function create({
  complementaryCertificationKey,
  challenges,
  uuidService,
  complementaryCertificationRepository,
}) {
  const knexConn = DomainTransaction.getConnection();

  const complementaryCertification = await complementaryCertificationRepository.getByKey(complementaryCertificationKey);

  const challengesDTO = challenges.map((challenge) => ({
    complementaryCertificationId: complementaryCertification.id,
    challengeId: challenge.id,
  }));

  const versionUuid = uuidService.randomUUID();
  for (const challengeDTO of challengesDTO) {
    await knexConn('certification-frameworks-challenges').insert({ ...challengeDTO, version: versionUuid });
  }
}
