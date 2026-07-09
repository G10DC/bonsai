function safeParse(s) {
  try {                              // error handling — must NOT be removed
    return JSON.parse(s);
  } catch (e) {
    return null;
  }
}

module.exports = { safeParse };
