const data = ['apple', 'apricot', 'banana'];

// search the in-memory list
function search(q) {
  if (typeof q !== 'string') return [];   // input guard — must NOT be removed
  return data.filter((x) => x.includes(q));
}

module.exports = { search };
