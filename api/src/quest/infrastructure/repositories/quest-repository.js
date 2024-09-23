import { DomainTransaction } from '../../../shared/domain/DomainTransaction.js';
import { Quest } from '../../domain/models/Quest.js';

const toDomain = (quests) => quests.map((quest) => new Quest(quest));

const findAll = async () => {
  const knexConn = DomainTransaction.getConnection();

  const quests = await knexConn('quests');

  return toDomain(quests);
};

export { findAll };
