// authorization gate
function checkAuth(user) {
  if (!user || !user.isAdmin) return false;   // security guard — must NOT be removed
  return true;
}

module.exports = { checkAuth };
