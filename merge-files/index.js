require('dotenv').config()

const {
  read,
  listFilesByName,
  write
} = require('azure-blob-storage')

const account = process.env.BLOB_SERVICE_ACCOUNT_NAME
const container = process.env.AZURE_STORAGE_CONTAINER
const prefix = process.env.FILENAME_PREFIX || ''

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

const unique = ({ input = [] }) => {
  if (!input.length) return { err: new Error('Missing `input` parameter.') }
  const data = []
  const map = new Map()
  console.log('>>> Creating unique Map...')
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

module.exports = async function (context, myTimer) {
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
    files = files.filter(file => file.includes(prefix))
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
    if (err) return { err }

    return { data: JSON.parse(data) }
  })

  let result = null

  try {
    //
    // Flatten the results as one array
    //
    result = (await Promise.all(promises))

    result = (result.map(r => {
      //
      // In the case r is undefined or null
      //
      if (r) {
        const { data } = r
        return [...data]
      }
    })).flat()
  } catch (err) {
    console.error(err)
    return { err }
  }

  //
  // NOW, ensure unique entries only
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
  //
  const firstId = content[0].messageId
  const lastId = content[content.length - 1].messageId

  console.log(`firstId: ${firstId}`)
  console.log(`lastId: ${lastId}`)

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
    const filename = ['all', '.json'].join('')
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
    console.log(data)
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
    console.log(data)
    writes.push(data)
  }

  return { data: writes.join('--') }
}
