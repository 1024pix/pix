async function validateAnswer({ moduleSlug, userResponse, elementId, moduleRepository }) {
  const foundModule = await moduleRepository.getBySlugForVerification({ slug: moduleSlug });
  const element = foundModule.getElementById(elementId);
  return element.assess(userResponse);
}

export { validateAnswer };
