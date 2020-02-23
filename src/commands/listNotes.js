// @ts-check
import { _readTree } from '../commands/readTree'
import { ResolveRefError } from '../errors/ResolveRefError.js'
import { GitRefManager } from '../managers/GitRefManager.js'

/**
 * List all the object notes
 *
 * @param {object} args
 * @param {import('../models/FileSystem.js').FileSystem} args.fs
 * @param {string} args.gitdir
 * @param {string} args.ref
 *
 * @returns {Promise<Array<{target: string, note: string}>>}
 */

export async function _listNotes({ fs, gitdir, ref }) {
  // Get the current note commit
  let parent
  try {
    parent = await GitRefManager.resolve({ gitdir, fs, ref })
  } catch (err) {
    if (err instanceof ResolveRefError) {
      return []
    }
  }

  // Create the current note tree
  const result = await _readTree({
    fs,
    gitdir,
    oid: parent,
  })

  // Format the tree entries
  const notes = result.tree.map(entry => ({
    target: entry.path,
    note: entry.oid,
  }))
  return notes
}
