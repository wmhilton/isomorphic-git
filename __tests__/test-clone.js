/* globals jest describe it expect */
const { makeFixture } = require('./__helpers__/FixtureFS.js')

const { clone } = require('isomorphic-git')

describe('clone', () => {
  it('clone', async () => {
    let { fs, dir, gitdir } = await makeFixture('isomorphic-git')
    await clone({
      fs,
      dir,
      gitdir,
      depth: 1,
      ref: 'test-branch',
      url: `https://github.com/isomorphic-git/isomorphic-git`
    })
    expect(fs.existsSync(`${dir}`)).toBe(true)
    expect(fs.existsSync(`${gitdir}/objects`)).toBe(true)
    expect(fs.existsSync(`${gitdir}/refs/remotes/origin/test-branch`)).toBe(
      true
    )
    expect(fs.existsSync(`${gitdir}/refs/heads/test-branch`)).toBe(true)
    expect(fs.existsSync(`${dir}/package.json`)).toBe(true)
  })
})
