const users = { 1: { name: 'Ada' }, 2: { name: 'Lin' } };

function getUser(id) {
  return users[id].name;   // crashes when id is null / missing
}

module.exports = { getUser };
