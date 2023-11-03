async function validateAnswer({ moduleSlug, proposalSelectedId, elementId, moduleRepository }) {
  const foundModule = await moduleRepository.getBySlug({ slug: moduleSlug });
  const element = foundModule.getElementById(elementId);
  return element.assess(proposalSelectedId);
}

export { validateAnswer };
