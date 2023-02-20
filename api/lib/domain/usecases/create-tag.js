import Tag from '../models/Tag';

export default async function createTag({ tagName, tagRepository }) {
  const tag = new Tag({ name: tagName });
  return tagRepository.create(tag);
}
