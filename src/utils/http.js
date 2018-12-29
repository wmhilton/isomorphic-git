import {fromBuffer, fromStream, fromNodeStream} from './AsyncIterator.js'

export async function http ({ core, emitter, emitterPrefix, url, method = 'GET', headers = {}, body }) {
  return global.fetch
    ? await httpBrowser({ core, emitter, emitterPrefix, url, method, headers, body })
    : await httpNode({ core, emitter, emitterPrefix, url, method, headers, body })
}

async function httpBrowser ({ url, method = 'GET', headers = {}, body }) {
  let res = await fetch(url, { method, headers, body })
  let iter = (res.body && res.body.getReader) ? fromStream(res.body) : fromBuffer(await res.arrayBuffer())
  return {
    url: res.url,
    method: res.method,
    statusCode: res.status,
    statusMessage: res.statusText,
    body: iter,
    headers: res.headers
  }
}

async function httpNode ({ emitter, emitterPrefix, url, method = 'GET', headers = {}, body }) {
  return new Promise((resolve, reject) => {
    const got = require('got')
    let stream = got(url, { method, headers, body, stream: true, throwHttpErrors: false })
    stream.on('response', (res) => {
      let iter = fromNodeStream(stream)
      resolve({
        url: res.url,
        method: res.method,
        statusCode: res.statusCode,
        statusMessage: res.statusMessage,
        body: iter,
        headers: res.headers
      })
    })
    stream.on('error', reject)
    if (emitter) {
      stream.on('uploadProgress', progress => {
        emitter.emit(`${emitterPrefix}progress`, {
          phase: 'uploading',
          loaded: progress.transferred,
          total: progress.total || undefined,
          lengthComputable: progress.total != null
        })
      })
      stream.on('downloadProgress', progress => {
        emitter.emit(`${emitterPrefix}progress`, {
          phase: 'downloading',
          loaded: progress.transferred,
          total: progress.total || undefined,
          lengthComputable: progress.total != null
        })
      })
    }
  })
}
