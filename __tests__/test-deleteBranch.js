/* eslint-env node, browser, jasmine */
const path = require('path')

const { E, Errors, deleteBranch } = require('isomorphic-git')

const { makeFixture } = require('./__helpers__/FixtureFS.js')

describe('deleteBranch', () => {
  it('delete branch', async () => {
    // Setup
    const { fs, dir, gitdir } = await makeFixture('test-deleteBranch')
    // Test
    await deleteBranch({ fs, dir, gitdir, ref: 'test' })
    const files = await fs.readdir(path.resolve(gitdir, 'refs', 'heads'))
    expect(files).toEqual(['master'])
  })

  it('branch not exist', async () => {
    // Setup
    const { fs, dir, gitdir } = await makeFixture('test-deleteBranch')
    let error = null
    // Test
    try {
      await deleteBranch({ fs, dir, gitdir, ref: 'branch-not-exist' })
    } catch (err) {
      error = err
    }
    expect(error).not.toBeNull()
    expect(error instanceof Errors.NotFoundError).toBe(true)
  })

  it('missing ref argument', async () => {
    // Setup
    const { fs, dir, gitdir } = await makeFixture('test-deleteBranch')
    let error = null
    // Test
    try {
      // @ts-ignore
      await deleteBranch({ fs, dir, gitdir })
    } catch (err) {
      error = err
    }
    expect(error).not.toBeNull()
    expect(error instanceof Errors.MissingParameterError).toBe(true)
  })

  it('checked out branch', async () => {
    // Setup
    const { fs, dir, gitdir } = await makeFixture('test-deleteBranch')
    let error = null
    // Test
    try {
      await deleteBranch({ fs, dir, gitdir, ref: 'master' })
    } catch (err) {
      error = err
    }
    expect(error).not.toBeNull()
    expect(error.code).toBe(E.BranchDeleteError)
  })
})
