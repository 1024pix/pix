const makeOrganizationLearnerTypeRepository = ({ apiBaseUrl, headers }) => ({
  findAll: async () => {
    const res = await fetch(`${apiBaseUrl}/api/admin/organization-learner-types`, { headers });
    const data = await res.json();
    return (data.data ?? []).map((t) => ({ id: parseInt(t.id), name: t.attributes.name }));
  },
});

export { makeOrganizationLearnerTypeRepository };
