const makeAdministrationTeamRepository = ({ apiBaseUrl, headers }) => ({
  findAll: async () => {
    const res = await fetch(`${apiBaseUrl}/api/admin/administration-teams`, { headers });
    const data = await res.json();
    return (data.data ?? []).map((t) => ({ id: parseInt(t.id), name: t.attributes.name }));
  },
});

export { makeAdministrationTeamRepository };
