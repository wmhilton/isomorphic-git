import { GitPackIndex } from '../models/GitPackIndex.js'

export const PackfileCache = new Map()

export async function loadPack (fs, filename, getExternalRefDelta) {
  // If not there, load it from a .idx file
  const idxName = filename.replace(/pack$/, 'idx')
  if (await fs.exists(idxName)) {
    const idx = await fs.read(idxName)
    return GitPackIndex.fromIdx({ idx, getExternalRefDelta })
  }
  // If the .idx file isn't available, generate one.
  const pack = await fs.read(filename)
  // Sanity check. 12 byte header + 20 byte shasum
  if (pack.length < 32) {
    return { error: `Unable to load packfile ${filename}. It's suspiciously short - try deleting it; it may be corrupt.` }
  }
  const p = await GitPackIndex.fromPack({ pack, getExternalRefDelta })
  // Save .idx file
  fs.write(idxName, p.toBuffer())
  return p
}
