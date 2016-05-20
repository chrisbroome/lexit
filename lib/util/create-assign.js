
module.exports = function(proto = {}, options = {}) {
  return Object.assign(Object.create(proto), options)
};
