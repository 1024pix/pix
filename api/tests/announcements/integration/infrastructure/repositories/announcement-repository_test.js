import { Announcement } from '../../../../../src/communication/announcements/domain/models/Announcement.js';
import * as announcementRepository from '../../../../../src/communication/announcements/infrastructure/repositories/announcement-repository.js';
import { announcementsStorage } from '../../../../../src/shared/infrastructure/key-value-storages/index.js';
import { expect } from '../../../../test-helper.js';
import { knex } from '../../../../tooling/databases.js';

const NAME = 'SCO';
const CONTENT = { fr: 'Contenu en français', en: 'Content in English' };

describe('Integration | Infrastructure | Repository | Announcements | announcement-repository', function () {
  beforeEach(async function () {
    await announcementsStorage.flushAll();
  });

  describe('#get', function () {
    context('when no row exists in the database', function () {
      it('should return an Announcement with null content', async function () {
        const result = await announcementRepository.get(NAME);

        expect(result).to.be.an.instanceOf(Announcement);
        expect(result.content).to.be.null;
      });

      it('should cache the empty sentinel in Redis', async function () {
        await announcementRepository.get(NAME);

        const cached = await announcementsStorage.get(`announcement:${NAME}`);
        expect(cached).to.equal('__empty__');
      });
    });

    context('when a row exists in the database', function () {
      beforeEach(async function () {
        await knex('announcements').insert({ name: NAME, content: JSON.stringify(CONTENT) });
      });

      it('should return an Announcement with the stored content', async function () {
        const result = await announcementRepository.get(NAME);

        expect(result).to.be.an.instanceOf(Announcement);
        expect(result.content).to.deep.equal(CONTENT);
      });

      it('should cache the content in Redis', async function () {
        await announcementRepository.get(NAME);

        const cached = await announcementsStorage.get(`announcement:${NAME}`);
        expect(cached).to.deep.equal(CONTENT);
      });
    });

    context('when content is cached in Redis', function () {
      beforeEach(async function () {
        await announcementsStorage.save({ key: `announcement:${NAME}`, value: CONTENT });
      });

      it('should return the cached content without hitting the database', async function () {
        const result = await announcementRepository.get(NAME);

        expect(result).to.be.an.instanceOf(Announcement);
        expect(result.content).to.deep.equal(CONTENT);
      });
    });

    context('when the empty sentinel is cached in Redis', function () {
      beforeEach(async function () {
        await announcementsStorage.save({ key: `announcement:${NAME}`, value: '__empty__' });
      });

      it('should return an Announcement with null content', async function () {
        const result = await announcementRepository.get(NAME);

        expect(result).to.be.an.instanceOf(Announcement);
        expect(result.content).to.be.null;
      });
    });
  });

  describe('#update', function () {
    it('should insert a row and return the updated Announcement', async function () {
      const result = await announcementRepository.update(NAME, CONTENT);

      expect(result).to.be.an.instanceOf(Announcement);
      expect(result.content).to.deep.equal(CONTENT);
      const row = await knex('announcements').where({ name: NAME }).first();
      expect(row.content).to.deep.equal(CONTENT);
    });

    it('should update an existing row (upsert)', async function () {
      await knex('announcements').insert({ name: NAME, content: JSON.stringify({ fr: 'Ancien contenu' }) });

      await announcementRepository.update(NAME, CONTENT);

      const rows = await knex('announcements');
      expect(rows).to.have.length(1);
      expect(rows[0].content).to.deep.equal(CONTENT);
    });

    it('should invalidate the Redis cache after update', async function () {
      await announcementsStorage.save({ key: `announcement:${NAME}`, value: CONTENT });

      await announcementRepository.update(NAME, { fr: 'Nouveau contenu' });

      const cached = await announcementsStorage.get(`announcement:${NAME}`);
      expect(cached).to.be.null;
    });
  });
});
