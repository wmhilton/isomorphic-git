/* globals describe it expect */
const { makeFixture } = require('./__helpers__/FixtureFS.js')
const { assertSnapshot } = require('./__helpers__/assertSnapshot')
const snapshots = require('./__snapshots__/test-GitPackIndex.js.snap')
const path = require('path')
const pify = require('pify')
const { models } = require('../dist/for-node/internal-apis')
const { GitPackIndex, GitObject } = models

jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000

describe('GitPackIndex', () => {
  it('from .idx', async () => {
    let { fs, dir, gitdir } = await makeFixture('test-GitPackIndex')
    let idx = await pify(fs.readFile)(
      path.join(
        gitdir,
        'objects/pack/pack-1a1e70d2f116e8cb0cb42d26019e5c7d0eb01888.idx'
      )
    )
    let p = await GitPackIndex.fromIdx({ idx })
    assertSnapshot(p.hashes, snapshots, `GitPackIndex from .idx 1`)
    expect(p.packfileSha).toBe('1a1e70d2f116e8cb0cb42d26019e5c7d0eb01888')
    // Test a handful of known offsets.
    expect(p.offsets['0b8faa11b353db846b40eb064dfb299816542a46']).toEqual(40077)
    expect(p.offsets['637c4e69d85e0dcc18898ec251377453d0891585']).toEqual(39860)
    expect(p.offsets['98e9fde3ee878fa985a143fc5fe05d4e6d8e637b']).toEqual(39036)
    expect(p.offsets['43c49edb213748626fc363c890c01a9e55a1b8da']).toEqual(38202)
    expect(p.offsets['5f1f014326b1d7e8079d00b87fa7a9913bd91324']).toEqual(20855)
  })
  it('from .pack', async () => {
    let { fs, dir, gitdir } = await makeFixture('test-GitPackIndex')
    let pack = await pify(fs.readFile)(
      path.join(
        gitdir,
        'objects/pack/pack-1a1e70d2f116e8cb0cb42d26019e5c7d0eb01888.pack'
      )
    )
    let p = await GitPackIndex.fromPack({ pack })
    assertSnapshot(p.hashes, snapshots, `GitPackIndex from .pack 1`)
    expect(p.packfileSha).toBe('1a1e70d2f116e8cb0cb42d26019e5c7d0eb01888')
    // Test a handful of known offsets.
    expect(p.offsets['0b8faa11b353db846b40eb064dfb299816542a46']).toEqual(40077)
    expect(p.offsets['637c4e69d85e0dcc18898ec251377453d0891585']).toEqual(39860)
    expect(p.offsets['98e9fde3ee878fa985a143fc5fe05d4e6d8e637b']).toEqual(39036)
    expect(p.offsets['43c49edb213748626fc363c890c01a9e55a1b8da']).toEqual(38202)
    expect(p.offsets['5f1f014326b1d7e8079d00b87fa7a9913bd91324']).toEqual(20855)
  })

  it('to .idx file', async () => {
    let { fs, dir, gitdir } = await makeFixture('test-GitPackIndex')
    let idx = await pify(fs.readFile)(
      path.join(
        gitdir,
        'objects/pack/pack-1a1e70d2f116e8cb0cb42d26019e5c7d0eb01888.idx'
      )
    )
    let p = await GitPackIndex.fromIdx({ idx })
    let idxbuffer = p.toBuffer()
    expect(idxbuffer.byteLength).toBe(idx.byteLength)
    expect(idxbuffer.equals(idx)).toBe(true)
  })
  it('to .idx file from .pack', async () => {
    let { fs, dir, gitdir } = await makeFixture('test-GitPackIndex')
    let idx = await pify(fs.readFile)(
      path.join(
        gitdir,
        'objects/pack/pack-1a1e70d2f116e8cb0cb42d26019e5c7d0eb01888.idx'
      )
    )
    let pack = await pify(fs.readFile)(
      path.join(
        gitdir,
        'objects/pack/pack-1a1e70d2f116e8cb0cb42d26019e5c7d0eb01888.pack'
      )
    )
    let p = await GitPackIndex.fromPack({ pack })
    let idxbuffer = p.toBuffer()
    expect(idxbuffer.byteLength).toBe(idx.byteLength)
    expect(idxbuffer.equals(idx)).toBe(true)
  })

  it('read undeltified object', async () => {
    let { fs, dir, gitdir } = await makeFixture('test-GitPackIndex')
    let idx = await pify(fs.readFile)(
      path.join(
        gitdir,
        'objects/pack/pack-1a1e70d2f116e8cb0cb42d26019e5c7d0eb01888.idx'
      )
    )
    let pack = await pify(fs.readFile)(
      path.join(
        gitdir,
        'objects/pack/pack-1a1e70d2f116e8cb0cb42d26019e5c7d0eb01888.pack'
      )
    )
    let p = await GitPackIndex.fromIdx({ idx })
    await p.load({ pack })
    let { type, object } = await p.read({
      oid: '637c4e69d85e0dcc18898ec251377453d0891585'
    })
    expect(type).toBe('commit')
    // TODO: working snapshot (sheesh)
    // expectjs(object.toString('utf8')).toMatchSnapshot()
    let { oid } = GitObject.wrap({ type, object })
    expect(oid).toBe('637c4e69d85e0dcc18898ec251377453d0891585')
  })
  it('read deltified object', async () => {
    let { fs, dir, gitdir } = await makeFixture('test-GitPackIndex')
    let idx = await pify(fs.readFile)(
      path.join(
        gitdir,
        'objects/pack/pack-1a1e70d2f116e8cb0cb42d26019e5c7d0eb01888.idx'
      )
    )
    let pack = await pify(fs.readFile)(
      path.join(
        gitdir,
        'objects/pack/pack-1a1e70d2f116e8cb0cb42d26019e5c7d0eb01888.pack'
      )
    )
    let p = await GitPackIndex.fromIdx({ idx })
    await p.load({ pack })
    let { type, object } = await p.read({
      oid: '7fb539a8e8488c3fd2793e7dda8a44693e25cce1' // 9 levels deep of deltification.
    })
    expect(type).toBe('blob')
    // TODO: working snapshot (sheesh)
    // expectjs(object.toString('utf8')).toMatchSnapshot()
    let { oid } = GitObject.wrap({ type, object })
    expect(oid).toBe('7fb539a8e8488c3fd2793e7dda8a44693e25cce1')
  })
})
