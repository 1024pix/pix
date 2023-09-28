async function getModule({ slug, moduleRepository }) {
  return moduleRepository.getBySlug({ slug });
}

export { getModule };
