const makeCountryRepository = ({ apiBaseUrl, headers }) => ({
  findAll: async () => {
    const res = await fetch(`${apiBaseUrl}/api/countries`, { headers });
    const data = await res.json();
    return (data.data ?? []).map((c) => ({ code: parseInt(c.attributes.code), name: c.attributes.name }));
  },
});

export { makeCountryRepository };
