import { Tag } from './../../domain/models/Tag';
import { CreateTag } from './../../domain/usecases/create-tag';
import { Request, ResponseToolkit } from '@hapi/hapi';
import { TagSerializer, tagSerializer } from '../../infrastructure/serializers/jsonapi/tag-serializer';
import { FindAllTags } from '../../domain/usecases/find-all-tags';

const { createTag, findAllTags } = require('../../domain/usecases');

interface TagAttributesInput {
  name: string;
}

interface TagDataInput {
  attributes: TagAttributesInput;
}

interface TagInput {
  data: TagDataInput;
}

export class TagController {
  constructor(
    private readonly tagSerializer: TagSerializer,
    private readonly createTagUseCase: CreateTag,
    private readonly findAllTagsUseCase: FindAllTags
  ) {}

  async create(request: Request, responseToolkit: ResponseToolkit) {
    const tagName = (request.payload as TagInput).data.attributes['name'].toUpperCase();
    const createdTag: Tag = await this.createTagUseCase.execute(tagName);
    return responseToolkit.response(this.tagSerializer.serialize(createdTag)).created('');
  }

  async findAllTags() {
    const organizationsTags: Tag[] = await this.findAllTagsUseCase.execute();
    return this.tagSerializer.serialize(organizationsTags);
  }
}

export const tagController = new TagController(tagSerializer, createTag, findAllTags);
