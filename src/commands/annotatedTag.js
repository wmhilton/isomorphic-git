// @ts-check
import { GitRefManager } from '../managers/GitRefManager.js'
import { FileSystem } from '../models/FileSystem.js'
import { GitAnnotatedTag } from '../models/GitAnnotatedTag'
import { E, GitError } from '../models/GitError.js'
import { readObject } from '../storage/readObject.js'
import { writeObject } from '../storage/writeObject.js'
import { join } from '../utils/join.js'
import { normalizeAuthorObject } from '../utils/normalizeAuthorObject.js'
import { cores } from '../utils/plugins.js'

/**
 * Create an annotated tag.
 *
 * @param {object} _
 * @param {string} [_.core = 'default'] - The plugin core identifier to use for plugin injection
 * @param {string} [_.dir] - The [working tree](dir-vs-gitdir.md) directory path
 * @param {string} [_.gitdir] - The [git directory](dir-vs-gitdir.md) path
 * @param {FileSystem} [_.fs] - [deprecated] The filesystem containing the git repo. Overrides the fs provided by the [plugin system](./plugin_fs.md).
 * @param {string} _.ref - What to name the tag
 * @param {string} [_.message = ''] - The tag message to use.
 * @param {string} [_.object = 'HEAD'] - The SHA-1 object id the tag points to. (Will resolve to a SHA-1 object id if value is a ref.) By default, the commit object which is referred by the current `HEAD` is used.
 * @param {object} [_.tagger] - The details about the tagger.
 * @param {string} [_.tagger.name] - Default is `user.name` config.
 * @param {string} [_.tagger.email] - Default is `user.email` config.
 * @param {string} [_.tagger.date] - Set the tagger timestamp field. Default is the current date.
 * @param {string} [_.tagger.timestamp] - Set the tagger timestamp field. This is an alternative to using `date` using an integer number of seconds since the Unix epoch instead of a JavaScript date object.
 * @param {string} [_.tagger.timezoneOffset] - Set the tagger timezone offset field. This is the difference, in minutes, from the current timezone to UTC. Default is `(new Date()).getTimezoneOffset()`.
 * @param {string} [_.signature] - The signature attatched to the tag object. (Mutually exclusive with the `signingKey` option.)
 * @param {string} [_.signingKey] - Sign the tag object using this private PGP key. (Mutually exclusive with the `signature` option.)
 * @param {boolean} [_.force = false] - Instead of throwing an error if a tag named `ref` already exists, overwrite the existing tag. Note that this option does not modify the original tag object itself.
 *
 * @returns {Promise<void>} - Resolves successfully when filesystem operations are complete
 *
 * @example
 * await git.annotatedTag({
 *   dir: '$input((/))',
 *   ref: '$input((test-tag))',
 *   message: '$input((This commit is awesome))',
 *   tagger: {
 *     name: '$input((Mr. Test))',
 *     email: '$input((mrtest@example.com))'
 *   }
 * })
 * console.log('done')
 *
 */
export async function annotatedTag ({
  core = 'default',
  dir,
  gitdir = join(dir, '.git'),
  fs: _fs = cores.get(core).get('fs'),
  ref,
  tagger,
  message = ref,
  signature,
  object,
  signingKey,
  force = false
}) {
  try {
    const fs = new FileSystem(_fs)

    if (ref === undefined) {
      throw new GitError(E.MissingRequiredParameterError, {
        function: 'annotatedTag',
        parameter: 'ref'
      })
    }

    ref = ref.startsWith('refs/tags/') ? ref : `refs/tags/${ref}`

    if (!force && (await GitRefManager.exists({ fs, gitdir, ref }))) {
      throw new GitError(E.RefExistsError, { noun: 'tag', ref })
    }

    // Resolve passed value
    let oid = await GitRefManager.resolve({
      fs,
      gitdir,
      ref: object || 'HEAD'
    })

    if (signature && signingKey) {
      throw new GitError(E.InvalidParameterCombinationError, {
        function: 'annotatedTag',
        parameters: ['signature', 'signingKey']
      })
    }

    // Fill in missing arguments with default values
    tagger = await normalizeAuthorObject({ fs, gitdir, author: tagger })
    if (tagger === undefined) {
      throw new GitError(E.MissingTaggerError)
    }

    const { type } = await readObject({ fs, gitdir, oid })
    let tagObject = GitAnnotatedTag.from({
      object: oid,
      type,
      tag: ref.replace('refs/tags/', ''),
      tagger,
      message,
      signature
    })
    if (signingKey) {
      let pgp = cores.get(core).get('pgp')
      tagObject = await GitAnnotatedTag.sign(tagObject, pgp, signingKey)
    }
    let value = await writeObject({
      fs,
      gitdir,
      type: 'tag',
      object: tagObject.toObject()
    })

    await GitRefManager.writeRef({ fs, gitdir, ref, value })
  } catch (err) {
    err.caller = 'git.annotatedTag'
    throw err
  }
}
