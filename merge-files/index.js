require('dotenv').config()

const {
  read,
  write,
  listFilesByName
} = require('azure-blob-storage')

const container = process.env.AZURE_STORAGE_CONTAINER
const account = process.env.BLOB_SERVICE_ACCOUNT_NAME
const prefix = process.env.FILENAME_PREFIX | ''

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
      context.error(err)
      return { err }
    } else {
      files = data
    }
  }

  //
  // Fetch every file, with a prefix if it exists,
  //
  if (prefix) {
    const json = files.map(async (filename, i) => {
      if (filename.includes(prefix)) {
        console.log(filename)

        const { err, data } = await read({
          account,
          container,
          filename
        })
        if (err) return { err }

        return { data: JSON.parse(data) }
      }
    })
    const result = await Promise.all(json)
    console.dir(result, { depth: null })
  }
}
