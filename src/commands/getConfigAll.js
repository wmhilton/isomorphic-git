// @ts-check
import '../commands/typedefs.js'

import { GitConfigManager } from '../managers/GitConfigManager.js'

/**
 * @param {Object} args
 * @param {import('../models/FileSystem.js').FileSystem} args.fs
 * @param {string} args.gitdir
 * @param {string} args.path
 *
 * @returns {Promise<Array<any>>} Resolves with an array of the config value
 *
 */
export async function getConfigAll ({
  fs,
  gitdir,
  path
}) {
  const config = await GitConfigManager.get({ fs, gitdir })
  return config.getall(path)
}
