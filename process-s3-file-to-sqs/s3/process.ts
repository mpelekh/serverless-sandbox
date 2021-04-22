import { S3, SQS, config } from "aws-sdk";
import { chunk } from "./utils";

config.region = process.env.REGION;

const s3 = new S3();
const sqs = new SQS();

module.exports.process = async (event) => {
  console.log("s3 event: ", JSON.stringify(event, null, 2));
  console.log("sqs queue URL: ", process.env.QUEUE_URL);

  const CHUNK_SIZE = 25;

  for (const record of event.Records) {
    try {
      const objectOutput = await s3
        .getObject({
          Bucket: record.s3.bucket.name,
          Key: record.s3.object.key,
        })
        .promise();

      const todos = JSON.parse(objectOutput.Body.toString("utf-8"));
      const chunks = chunk(todos, CHUNK_SIZE);

      await sendToSQS(chunks);
    } catch (err) {
      console.error(err);
    }
  }
};

const sendToSQS = async (chunks) => {
  for (const chunk of chunks) {
    const params = {
      MessageBody: JSON.stringify(chunk),
      QueueUrl: process.env.QUEUE_URL,
    };

    try {
      console.log("trying send ton SQS batch: ", chunks.indexOf(chunk));
      const result = await sqs.sendMessage(params).promise();
      console.log("success: ", result);
    } catch (error) {
      console.error(error);
    }
  }
};
