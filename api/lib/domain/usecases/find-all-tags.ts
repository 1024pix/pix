import { TagRepositoryInterface } from '../../infrastructure/repositories/tag-repository';

export class FindAllTags {
  constructor(private readonly tagRepository: TagRepositoryInterface) {}

  async execute() {
    return this.tagRepository.findAll();
  }
}
