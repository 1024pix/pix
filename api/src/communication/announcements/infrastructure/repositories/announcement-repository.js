import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';
import { announcementsStorage } from '../../../../shared/infrastructure/key-value-storages/index.js';
import { Announcement } from '../../domain/models/Announcement.js';

const TTL = 24 * 60 * 60;
const EMPTY_CONTENT = '__empty__';

const _cacheKey = (name) => `announcement:${name}`;

const get = async (name) => {
  const cacheKey = _cacheKey(name);
  const cached = await announcementsStorage.get(cacheKey);
  if (cached) {
    const content = cached === EMPTY_CONTENT ? null : cached;
    return new Announcement({ name, content });
  }

  const knex = DomainTransaction.getConnection();
  const row = await knex('announcements').where({ name }).first();
  const content = row?.content ?? null;

  await announcementsStorage.save({
    key: cacheKey,
    value: content === null ? EMPTY_CONTENT : content,
    expirationDelaySeconds: TTL,
  });

  return new Announcement({ name, content });
};

const update = async (name, content) => {
  const knex = DomainTransaction.getConnection();
  await knex('announcements').insert({ name, content }).onConflict('name').merge(['content']);

  await announcementsStorage.delete(_cacheKey(name));

  return new Announcement({ name, content });
};

export { get, update };
