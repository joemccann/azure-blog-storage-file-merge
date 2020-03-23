# Azure Setup

The following sections are Azure-specific setup requirements and
are in chronological order.

## Azure Active Directory

In order to authenticate with read/write access to your storage account,
 we need to authenticate with AAD.  

- [Register an AAD application](https://portal.azure.com/#blade/Microsoft_AAD_RegisteredApps)
- Get the Application (Client) ID
- Get the Directory (Tenant) ID
- Then create a Client Secret.
- You need all 3 of these as `env` variables, saved in your `.env` file.
- Under `API permissions` click "Add a Permission" and select `Azure Storage`
and click the checkbox to enable `user_impersonation`.
This will enable us to programmatically access the Blob Storage container.

## Azure Storage Account

To read or write files, we need to create a new container and grant it access.

- Create a new Blob Container.
- Under Access Managment (IAM) create a role of type
`Storage Blob Data Container`.
- Assign access to an `Azure AD User, group or service principal`.
- Search for your AAD Security Principal (account) that you registered
in the prior step.
