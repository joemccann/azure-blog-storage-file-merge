require('dotenv').config()
require('./array-flat-polyfill')

const {
  move,
  read,
  listFilesByName,
  write
} = require('azure-blob-storage')

const account = process.env.BLOB_SERVICE_ACCOUNT_NAME
const container = process.env.AZURE_STORAGE_CONTAINER
const prefix = process.env.FILENAME_PREFIX || ''

//
// Currently ascending sort by `messageId`.
// Modify as you see fit for sorting.
//
const sortById = (a, b) => {
  const id1 = a.messageId
  const id2 = b.messageId

  let comparison = 0
  if (id1 > id2) {
    comparison = 1
  } else if (id1 < id2) {
    comparison = -1
  }
  return comparison
}

//
// Creating a unique Map of results sorting by their `title`.
// Modify as you see fit for sorting.
//
const unique = ({ input = [] }) => {
  if (!input.length) return { err: new Error('Missing `input` parameter.') }
  const data = []
  const map = new Map()
  for (const item of input) {
    //
    // Check to see if the Map has the title (could check URL)
    //
    if (!map.has(item.title)) {
      //
      // Set any value to Map for future loops
      //
      map.set(item.title, true)
      data.push(item)
    }
  }
  return { data }
}

module.exports = async (ctx) => {
  //
  // First, fetch the current `merged.json` file (assuming it exists)
  // for if it doesn't exist then this is the first time ever running this
  // function
  //
  let originalMergedFile = null
  const { err, data } = await read({
    account,
    container,
    filename: 'merged.json'
  })

  if (err) {
    if (err.message === 'Unexpected status code: 404') {
      originalMergedFile = []
    } else {
      console.error(err)
      return { err }
    }
  }

  try {
    originalMergedFile = JSON.parse(data)
  } catch (err) {
    console.error(err)
    return { err }
  }

  //
  // Fetch all files in container
  //
  let files = null

  //
  // Fetch files from blob storage container...
  //
  {
    const { err, data } = await listFilesByName({
      account,
      container
    })
    if (err) {
      console.error(err)
      return { err }
    } else {
      files = data
    }
  }

  //
  // Filter out files that don't have the prefix
  //
  if (prefix) {
    files = files.filter(file => file.startsWith(prefix))
  }

  //
  // Fetch every file, with a prefix if it exists,
  //
  const promises = files.map(async (filename, i) => {
    console.log(`>>> Fetching ${filename}`)

    const { err, data } = await read({
      account,
      container,
      filename
    })

    if (err) {
      console.error(err)
      return { err }
    }

    let parsed = null

    try {
      parsed = JSON.parse(data)
    } catch (err) {
      console.error(err)
      return { err }
    }

    return { data: parsed }
  })

  //
  // This section flattens the results of
  // the promises as a flat array.
  // Modify as you see fit.
  //
  let result = null

  try {
    //
    // Flatten the results as one array
    //
    result = ((await Promise.all(promises)).map(r => {
      //
      // In the case r is undefined or null
      //
      if (r) {
        const { data } = r
        return [...data]
      }
    }))
    result.push(originalMergedFile)
    result = result.flat()
  } catch (err) {
    console.error(err)
    return { err }
  }

  //
  // Ensure unique entries only
  //
  let content = null
  {
    const { err, data } = unique({ input: result })
    if (err) {
      console.error(err)
      return { err }
    }
    content = data
  }

  //
  // Sort ascending order (oldest first)
  //
  content.sort(sortById)

  //
  // Capture these for meta file
  // This should
  //
  const firstId = content[0].messageId
  const lastId = content[content.length - 1].messageId
  const output = {}

  try {
    content = JSON.stringify(content)
  } catch (err) {
    console.error(err)
    return { err }
  }

  const writes = []
  //
  // Then write the file to Azure Blob Storage with begin and end
  //
  {
    const filename = ['merged', '.json'].join('')
    const { err, data } = await write({
      account,
      content,
      container,
      filename
    })
    if (err) {
      console.error(err)
      return { err }
    }
    writes.push(data)
  }

  //
  // Write meta-file for future jobs
  //
  {
    const filename = ['job-data', '.json'].join('')
    let metaContent = {
      firstId,
      lastId
    }

    metaContent = JSON.stringify(metaContent)

    const { err, data } = await write({
      account,
      content: metaContent,
      container,
      filename
    })
    if (err) {
      console.error(err)
      return { err }
    }
    writes.push(data)
  }

  //
  // Add results of writes to output
  //
  output.writes = writes

  //
  // Write files to archive for backup
  //
  {
    const destination = 'archive'

    const promises = files.map(async (filename, i) => {
      console.log(`>>> Moving ${filename}`)

      const { err, data } = await move({
        account,
        destination,
        container,
        filename
      })

      if (err) {
        console.error(err)
        return { err }
      }

      return { data }
    })

    let moves = null
    try {
    //
    // Flatten the results as one array
    //
      moves = ((await Promise.all(promises)).map(r => {
      //
      // In the case r is undefined or null
      //
        if (r) {
          const { data } = r
          return [...data]
        }
      }))
    } catch (err) {
      console.error(err)
      return { err }
    }
    output.moves = moves
  }

  return { data: output }
}
