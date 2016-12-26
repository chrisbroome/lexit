import createAssign from './util/create-assign'

const FileInfo = {

  position: 0,
  line: 1,
  column: 0,

  /**
   * @param {number} length Number of characters to seek by
   * @param seekInfo
   * @returns {FileInfo}
   */
  seek(length, seekInfo) {
    const {position, line, column} = this
    const newPosition = position + length

    return seekInfo.newLines > 0 ?
      createFileInfo(newPosition, line + seekInfo.newLines, seekInfo.newColumnPos) :
      createFileInfo(newPosition, line, column + length)
  },

  toString() {
    const {line, column} = this
    return `${line}:${column}`
  }

}

/**
 * @param {number} position
 * @param {number} line
 * @param {number} column
 * @returns {FileInfo}
 */
const createFileInfo = (position = 0, line = 1, column = 1) => createAssign(FileInfo, {position, line, column})

export default createFileInfo
