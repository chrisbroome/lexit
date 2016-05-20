const createAssign = require('./util/create-assign');

const FileInfo = {
  position: 0,
  line: 1,
  column: 0,
  seek(length, nl) {
    const self = this;
    const position = self.position + length;
    return nl ?
      createFileInfo(position, self.line + 1, 0) :
      createFileInfo(position, self.line, self.column + length);
  },
  toString() {
    const self = this;
    return self.line + ':' + self.column;
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

module.exports = FileInfo;
