const test = require('tape')

const mergeFiles = require('../merge-files')

test('sanity', t => {
  t.ok(true)
  t.end()
})

test('pass - merge files and move', async t => {
	const { err, data } = await mergeFiles()
	t.ok(!err)
	t.ok(data)
	t.end()
})
