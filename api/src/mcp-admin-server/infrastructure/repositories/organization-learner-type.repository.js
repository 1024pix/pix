const FETCH_TIMEOUT_MS = 10_000;

const makeOrganizationLearnerTypeRepository = ({ apiBaseUrl, headers }) => ({
  findAll: async () => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
    try {
      const res = await fetch(`${apiBaseUrl}/api/admin/organization-learner-types`, { headers, signal: controller.signal });
      const data = await res.json();
      return (data.data ?? []).map((t) => ({ id: parseInt(t.id), name: t.attributes.name }));
    } finally {
      clearTimeout(timer);
    }
  },
});

export { makeOrganizationLearnerTypeRepository };
