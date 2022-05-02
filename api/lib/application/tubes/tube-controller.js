module.exports = {
  async listSkills() {
    return {
      data: [
        {
          id: 'skillId2',
          type: 'skills',
        },
        {
          id: 'skillId1',
          type: 'skills',
        },
      ],
    };
  },
};
