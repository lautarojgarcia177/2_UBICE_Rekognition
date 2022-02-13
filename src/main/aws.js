const fs = require('fs');
const path = require('path');
const {
  RekognitionClient,
  DetectTextCommand,
} = require('@aws-sdk/client-rekognition');

function useRegex(input) {
  let regex = /^[0-9]+$/i;
  return regex.test(input);
}
class UBICEAWSClient {
  constructor(credentials) {
    this.client = this.initClient(credentials);
  }

  initClient(credentials) {
    return new RekognitionClient({
      credentials: {
        AccessKeyId: credentials.accessKeyId,
        SecretAccessKey: credentials.secretAccessKey,
        accessKeyId: credentials.accessKeyId,
        secretAccessKey: credentials.secretAccessKey,
      },
      region: 'us-west-1',
    });
  }

  setCredentials(credentials) {
    this.client = this.initClient(credentials);
  }

  /**
   * use AWS service to rekognize numbers in the image
   * @param {path of the image} imagePath
   */
  rekognize(imagePath) {
    return fs.promises
      .readFile(imagePath)
      .then((image) => {
        const command = new DetectTextCommand({
          Image: {
            Bytes: image,
          },
          Filters: {
            WordFilter: {
              MinConfidence: 95,
            },
          },
        });
        return this.client.send(command);
      })
      .then((res) =>
        res.TextDetections.filter((textDetection) =>
          useRegex(textDetection.DetectedText)
        )
          .filter((textDetection) => textDetection.Type === 'WORD')
          .map((textDetection) => textDetection.DetectedText)
      );
  }
}

module.exports = UBICEAWSClient
