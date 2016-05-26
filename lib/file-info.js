const createAssign = require('./util/create-assign');

const FileInfo = {

  position: 0,
  line: 1,
  column: 0,

  seek(length, nl) {
    const {position, line, column} = this;
    const newPosition = position + length;
    return nl ?
      createFileInfo(newPosition, line + 1, 0) :
      createFileInfo(newPosition, line, column + length);
  },

  toString() {
    const {line, column} = this;
    return `${line}:${column}`;
  }

};

/**
 * @param {number} position
 * @param {number} line
 * @param {number} column
 * @returns {FileInfo}
 */
function createFileInfo(position = 0, line = 1, column = 1) {
  return createAssign(FileInfo, {position, line, column});
}

module.exports = createFileInfo;
