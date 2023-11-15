async function validateAnswer({ moduleSlug, userResponse, elementId, moduleRepository }) {
  const foundModule = await moduleRepository.getBySlug({ slug: moduleSlug });
  const element = foundModule.getElementById(elementId);
  return element.assess(userResponse);
}

export { validateAnswer };
