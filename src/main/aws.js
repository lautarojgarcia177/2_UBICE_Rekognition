const fs = require('fs');
const path = require('path');
const {
  RekognitionClient,
  DetectTextCommand,
} = require('@aws-sdk/client-rekognition');

const client = new RekognitionClient({ region: 'us-west-1' });

function useRegex(input) {
  let regex = /^[0-9]+$/i;
  return regex.test(input);
}

/**
 * use AWS service to rekognize numbers in the image
 * @param {path of the image} imagePath
 */
function rekognize(imagePath) {
  fs.readFile(imagePath, (err, image) => {
      console.log('been here!');
    const command = new DetectTextCommand({
      Image: {
        Bytes: image,
      },
      Filters: {
        WordFilter: {
          MinConfidence: 98,
        },
      },
    });
    client.send(command).then(
      (res) =>
        res.TextDetections.filter((textDetection) =>
          useRegex(textDetection.DetectedText)
        )
          .filter((textDetection) => textDetection.Type === 'WORD')
          .map((textDetection) => textDetection.DetectedText),
      (err) => console.error
    );
  });
}

module.exports = {
  rekognize,
};
