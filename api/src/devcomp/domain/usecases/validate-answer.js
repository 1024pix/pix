async function validateAnswer({ moduleSlug, answerId, elementId, moduleRepository }) {
  const foundModule = await moduleRepository.getBySlug({ slug: moduleSlug });
  const element = foundModule.getElementById(elementId);
  return element.assess(answerId);
}

export { validateAnswer };
