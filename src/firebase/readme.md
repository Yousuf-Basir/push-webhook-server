## Place firebase admin sdk key file in src/firebase/ folder and name it `admin-sdk-key.json`

##### Sample file content: 

`admin-sdk-key.json.json`

```json
{
  "type": "service_account",
  "project_id": "project-name-bf6e9",
  "private_key_id": "96bef15dsfs5dfs6f5s6a1263402614dee42069e",
  "private_key": "-----BEGIN PRIVATE KEY-----\nabcd7c4YLV5kwqNzFV94qbar59Zw==\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-zn4si@projectname-bf6e9.iam.gserviceaccount.com",
  "client_id": "114840900546362347532",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-zn4si%40projectname-bf6e9.iam.gserviceaccount.com",
  "universe_domain": "googleapis.com"
}

```