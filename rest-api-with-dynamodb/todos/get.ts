import * as util from "util";
import { DynamoDB } from "aws-sdk";

const dynamoDb = new DynamoDB.DocumentClient();
const getAsync = util.promisify(dynamoDb.get.bind(dynamoDb));

module.exports.get = async (event, _, callback) => {
  const params = {
    TableName: process.env.DYNAMODB_TABLE,
    Key: {
      id: event.pathParameters.id,
    },
  };

  try {
    const result = await getAsync(params);

    const response = {
      statusCode: 200,
      body: JSON.stringify(result.Item),
    };

    callback(null, response);
  } catch (error) {
    console.error(error);
    callback(null, {
      statusCode: error.statusCode || 501,
      headers: { "Content-Type": "text/plain" },
      body: "Couldn't fetch the todo item.",
    });
  }
};
