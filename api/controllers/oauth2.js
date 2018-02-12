module.exports = {

  getToken(req, res) {
    const { grant_type, username, password } = req.body;
    return res.send({
      "access_token": "MTQ0NjJkZmQ5OTM2NDE1ZTZjNGZmZjI3",
      "token_type": "bearer",
      "expires_in": 3600,
      "refresh_token": "IwOGYzYTlmM2YxOTQ5MGE3YmNmMDFkNTVk"
    });
  },

  revokeToken(req, res) {
    const { token } = req.body;
    return res.send();
  }
};
