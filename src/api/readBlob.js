// @ts-check
import '../commands/typedefs.js'

import { FileSystem } from '../models/FileSystem.js'
import { join } from '../utils/join.js'
import { readBlob as _readBlob } from '../commands/readBlob.js'
import { assertParameter } from '../utils/assertParameter.js'

/**
 *
 * @typedef {Object} ReadBlobResult - The object returned has the following schema:
 * @property {string} oid
 * @property {Uint8Array} blob
 *
 */

/**
 * Read a blob object directly
 *
 * @param {object} args
 * @param {FsClient} args.fs - a file system client
 * @param {string} [args.dir] - The [working tree](dir-vs-gitdir.md) directory path
 * @param {string} [args.gitdir=join(dir,'.git')] - [required] The [git directory](dir-vs-gitdir.md) path
 * @param {string} args.oid - The SHA-1 object id to get. Annotated tags, commits, and trees are peeled.
 * @param {string} [args.filepath] - Don't return the object with `oid` itself, but resolve `oid` to a tree and then return the blob object at that filepath.
 *
 * @returns {Promise<ReadBlobResult>} Resolves successfully with a blob object description
 * @see ReadBlobResult
 *
 * @example
 * // Get the contents of 'README.md' in the master branch.
 * let commitOid = await git.resolveRef({ dir: '$input((/))', ref: '$input((master))' })
 * console.log(commitOid)
 * let { object: blob } = await git.readBlob({
 *   dir: '$input((/))',
 *   oid: $input((commitOid)),
 *   $textarea((filepath: 'README.md'
 * })
 * console.log(blob.toString('utf8'))
 *
 */
export async function readBlob ({
  fs,
  dir,
  gitdir = join(dir, '.git'),
  oid,
  filepath
}) {
  try {
    assertParameter('fs', fs)
    assertParameter('gitdir', gitdir)
    assertParameter('oid', oid)

    return await _readBlob({
      fs: new FileSystem(fs),
      gitdir,
      oid,
      filepath
    })
  } catch (err) {
    err.caller = 'git.readBlob'
    throw err
  }
}
