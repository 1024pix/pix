const makeOrganizationRepository = ({ apiBaseUrl, headers }) => ({
  create: async (payload) => {
    const res = await fetch(`${apiBaseUrl}/api/admin/organizations`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });
    return { status: res.status, body: await res.json() };
  },
});

export { makeOrganizationRepository };
