// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

export const environment = {
  production: false,
  apiUrl: 'https://aob8p3u5nf.execute-api.ap-southeast-2.amazonaws.com/develop', // i.e.'https://beepboop.execute-api.us-west-2.amazonaws.com/Prod'
  apiKey: 'yourAPIKey', // P_Added_rgEv5W5Nz6YALWrXZD145gsOkji1Dw560AVoMDI fro my api key

  /************ RESOURCE IDENTIFIERS *************/

  poolData: { 
      UserPoolId : 'ap-southeast-2_ykwNO2wLR', //CognitoUserPool
      ClientId : '3l0ee3llpltmnmpcv2qnus84cu', //CognitoUserPoolClient 
      Paranoia : 7
  },
  region: 'ap-southeast-2', //Region Matching CognitoUserPool region

  identityPool: 'ap-southeast-2:e4b6ced3-72ed-4e55-bf5a-af69dae10e54', //CognitoIdentityPool 
  googleId: '911862631584-ufpneb1emvaieah46s3gk1d7unfb4lb8.apps.googleusercontent.com'
};
