import { TagRepositoryType } from '../../infrastructure/repositories/tag-repository';
import { Tag } from '../models/Tag';

export class CreateTag {
  constructor(private readonly tagRepository: TagRepositoryType) {}

  execute(tagName: string): Promise<Tag> {
    const tag = new Tag({ name: tagName });
    return this.tagRepository.create(tag);
  }
}
