# Azure Blob Storage File Merge Azure Function

🗂 An Azure Function to merge a group of JSON files from Azure Blob Storage
and return the single merged file and write the merged file back to
blob storage.

## Requirements

- [Microsoft Azure](https://portal.azure.com) Account
- [VS Code](https://code.visualstudio.com/) for Production Deployment
and Local Development
- [Azure Functions](https://marketplace.visualstudio.com/items?itemName=ms-azuretools.vscode-azurefunctions)
VS Code Extension for Local Development
- [Node.js LTS Version](https://nodejs.org/en/about/releases/)

## Installation

```sh
npm i -S joemccann/azure-blob-storage-file-merge
```

Create a `.env` file and include the following values:

```sh
AZURE_TENANT_ID=XXX
AZURE_CLIENT_ID=XXX
AZURE_CLIENT_SECRET=XXX
AZURE_STORAGE_CONTAINER=XXX
BLOB_SERVICE_ACCOUNT_NAME=XXX
FILENAME_PREFIX=OPTIONAL-PREFIX-FOR-FILES-IN-STORAGE-CONTAINER
```

> Note: `FILENAME_PREFIX` is optional.  If you include it, the merge will
only files that begin with the `FILENAME_PREFIX` string like "`daily-`"
or "`contact-`".

Create a `local.settings.json` file as well for running the Azure Function
locally in VS Code.

If you don't know where to obtain these values in Azure,
look at the [AZURE.md](AZURE.md) document.

```js
{
  "IsEncrypted": false,
  "Values": {
    "AzureWebJobsStorage": "CREATED-BY-AZURE-FUNCTION-IN-VS-CODE",
    "FUNCTIONS_WORKER_RUNTIME": "node",
    "AZURE_TENANT_ID": "XXX",
    "AZURE_CLIENT_ID": "XXX",
    "AZURE_CLIENT_SECRET": "XXX",
    "AZURE_STORAGE_CONTAINER": "XXX",
    "BLOB_SERVICE_ACCOUNT_NAME": "XXX",
    "FILENAME_PREFIX": "OPTIONAL-PREFIX-FOR-FILES-IN-STORAGE-CONTAINER"
  }
}
```

## Usage

- Coming soon...

## Tests

```sh
npm i -D
npm test
```

## License

MIT
