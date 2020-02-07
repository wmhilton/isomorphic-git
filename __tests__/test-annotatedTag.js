/* eslint-env node, browser, jasmine */
const { makeFixture } = require('./__helpers__/FixtureFS.js')
const { annotatedTag, verify, resolveRef, readTag } = require('isomorphic-git')

describe('annotatedTag', () => {
  it('creates an annotated tag to HEAD', async () => {
    // Setup
    const { fs, gitdir } = await makeFixture('test-annotatedTag')
    // Test
    await annotatedTag({
      fs,
      gitdir,
      ref: 'latest',
      message: 'some tag message',
      tagger: {
        name: 'Yu Shimura',
        email: 'mail@yuhr.org'
      }
    })
    const tagRef = await resolveRef({ fs, gitdir, ref: 'refs/tags/latest' })
    const { tag } = await readTag({ fs, gitdir, oid: tagRef })
    expect(tag.object).toEqual('cfc039a0acb68bee8bb4f3b13b6b211dbb8c1a69')
  })
  it('creates an annotated tag pointing to a blob', async () => {
    // Setup
    const { fs, gitdir } = await makeFixture('test-annotatedTag')
    // Test
    await annotatedTag({
      fs,
      gitdir,
      ref: 'latest-blob',
      message: 'some tag message',
      tagger: {
        name: 'Yu Shimura',
        email: 'mail@yuhr.org'
      },
      object: 'd670460b4b4aece5915caf5c68d12f560a9fe3e4'
    })
    const tagRef = await resolveRef({
      fs,
      gitdir,
      ref: 'refs/tags/latest-blob'
    })
    const { tag } = await readTag({ fs, gitdir, oid: tagRef })
    expect(tag.object).toEqual('d670460b4b4aece5915caf5c68d12f560a9fe3e4')
  })
  it('creates a signed tag to HEAD', async () => {
    // Setup
    const { pgp } = require('@isomorphic-git/pgp-plugin')
    const { fs, gitdir } = await makeFixture('test-annotatedTag')
    // Test
    const { privateKey, publicKey } = require('./__fixtures__/pgp-keys.js')
    await annotatedTag({
      fs,
      gitdir,
      ref: 'latest',
      message: 'some tag message',
      tagger: {
        name: 'Yu Shimura',
        email: 'mail@yuhr.org'
      },
      signingKey: privateKey,
      onPgpSign: pgp.sign
    })
    const keys = await verify({
      fs,
      gitdir,
      ref: 'latest',
      publicKeys: publicKey,
      onPgpVerify: pgp.verify
    })
    expect(keys[0]).toBe('f2f0ced8a52613c4')
  })
})
