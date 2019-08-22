/* eslint-env node, browser, jasmine */
const { makeFixture } = require('./__helpers__/FixtureFS.js')

const { merge, resolveRef, log } = require('isomorphic-git')

describe('merge', () => {
  it('merge master into master', async () => {
    // Setup
    const { gitdir } = await makeFixture('test-merge')
    // Test
    const desiredOid = await resolveRef({
      gitdir,
      ref: 'master'
    })
    const m = await merge({
      gitdir,
      ours: 'master',
      theirs: 'master',
      fastForwardOnly: true
    })
    expect(m.oid).toEqual(desiredOid)
    expect(m.alreadyMerged).toBeTruthy()
    expect(m.fastForward).toBeFalsy()
    const oid = await resolveRef({
      gitdir,
      ref: 'master'
    })
    expect(oid).toEqual(desiredOid)
  })

  it('merge medium into master', async () => {
    // Setup
    const { gitdir } = await makeFixture('test-merge')
    // Test
    const desiredOid = await resolveRef({
      gitdir,
      ref: 'medium'
    })
    const m = await merge({
      gitdir,
      ours: 'master',
      theirs: 'medium',
      fastForwardOnly: true
    })
    expect(m.oid).toEqual(desiredOid)
    expect(m.alreadyMerged).toBeTruthy()
    expect(m.fastForward).toBeFalsy()
    const oid = await resolveRef({
      gitdir,
      ref: 'master'
    })
    expect(oid).toEqual(desiredOid)
  })

  it('merge oldest into master', async () => {
    // Setup
    const { gitdir } = await makeFixture('test-merge')
    // Test
    const desiredOid = await resolveRef({
      gitdir,
      ref: 'master'
    })
    const m = await merge({
      gitdir,
      ours: 'master',
      theirs: 'oldest',
      fastForwardOnly: true
    })
    expect(m.oid).toEqual(desiredOid)
    expect(m.alreadyMerged).toBeTruthy()
    expect(m.fastForward).toBeFalsy()
    const oid = await resolveRef({
      gitdir,
      ref: 'master'
    })
    expect(oid).toEqual(desiredOid)
  })

  it('merge newest into master', async () => {
    // Setup
    const { gitdir } = await makeFixture('test-merge')
    // Test
    const desiredOid = await resolveRef({
      gitdir,
      ref: 'newest'
    })
    const m = await merge({
      gitdir,
      ours: 'master',
      theirs: 'newest',
      fastForwardOnly: true
    })
    expect(m.oid).toEqual(desiredOid)
    expect(m.alreadyMerged).toBeFalsy()
    expect(m.fastForward).toBeTruthy()
    const oid = await resolveRef({
      gitdir,
      ref: 'master'
    })
    expect(oid).toEqual(desiredOid)
  })

  it('merge newest into master --dryRun', async () => {
    // Setup
    const { gitdir } = await makeFixture('test-merge')
    // Test
    const originalOid = await resolveRef({
      gitdir,
      ref: 'master'
    })
    const desiredOid = await resolveRef({
      gitdir,
      ref: 'newest'
    })
    const m = await merge({
      gitdir,
      ours: 'master',
      theirs: 'newest',
      fastForwardOnly: true,
      dryRun: true
    })
    expect(m.oid).toEqual(desiredOid)
    expect(m.alreadyMerged).toBeFalsy()
    expect(m.fastForward).toBeTruthy()
    const oid = await resolveRef({
      gitdir,
      ref: 'master'
    })
    expect(oid).toEqual(originalOid)
  })

  it("merge 'delete-first-half' and 'delete-second-half' (dryRun)", async () => {
    // Setup
    const { fs, gitdir } = await makeFixture('test-merge')
    const commit = (await log({
      gitdir,
      depth: 1,
      ref: 'delete-first-half-merge-delete-second-half'
    }))[0]
    // Test
    const report = await merge({
      fs,
      gitdir,
      ours: 'delete-first-half',
      theirs: 'delete-second-half',
      dryRun: true
    })
    expect(report.tree).toBe(commit.tree)
  })

  it("merge 'delete-first-half' and 'delete-second-half'", async () => {
    // Setup
    const { fs, gitdir } = await makeFixture('test-merge')
    const commit = (await log({
      gitdir,
      depth: 1,
      ref: 'delete-first-half-merge-delete-second-half'
    }))[0]
    // Test
    const report = await merge({
      fs,
      gitdir,
      ours: 'delete-first-half',
      theirs: 'delete-second-half',
      author: {
        name: 'Mr. Test',
        email: 'mrtest@example.com',
        timestamp: 1262356920,
        timezoneOffset: -0
      }
    })
    const mergeCommit = (await log({ gitdir, ref: 'delete-first-half', depth: 1 }))[0]
    expect(report.tree).toBe(commit.tree)
    expect(mergeCommit.tree).toEqual(commit.tree)
    expect(mergeCommit.message).toEqual(commit.message)
    expect(mergeCommit.parent).toEqual(commit.parent)
  })
})
