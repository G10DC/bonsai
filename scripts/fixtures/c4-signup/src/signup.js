function signup(email) {
  if (!email || !/^[^@]+@[^@]+\.[^@]+$/.test(email)) return null;   // email validation — must NOT be removed
  return { email, id: Math.random() };
}

module.exports = { signup };
