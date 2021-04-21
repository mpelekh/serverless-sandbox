import * as util from "util";
import { DynamoDB } from "aws-sdk";

const dynamoDb = new DynamoDB.DocumentClient();
const scanAsync = util.promisify(dynamoDb.scan.bind(dynamoDb));
const params = {
  TableName: process.env.DYNAMODB_TABLE,
};

module.exports.list = async (_, __, callback) => {
  try {
    const result = await scanAsync(params);

    const response = {
      statusCode: 200,
      body: JSON.stringify(result.Items),
    };

    callback(null, response);
  } catch (error) {
    console.error(error);
    callback(null, {
      statusCode: error.statusCode || 501,
      headers: { "Content-Type": "text/plain" },
      body: "Couldn't fetch the todo items.",
    });
  }
};
