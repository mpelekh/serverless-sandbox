import * as util from "util";
import * as uuid from "uuid";
import { DynamoDB } from "aws-sdk";

const dynamoDb = new DynamoDB.DocumentClient();
const putAsync = util.promisify(dynamoDb.put.bind(dynamoDb));

module.exports.create = async (event, _, callback) => {
  const timestamp = new Date().getTime();
  const data = JSON.parse(event.body);

  if (typeof data.text !== "string") {
    console.error("Validation Failed");
    callback(new Error("Couldn't create the todo item."));
    return;
  }

  const params = {
    TableName: process.env.DYNAMODB_TABLE,
    Item: {
      id: uuid.v1(),
      text: data.text,
      checked: false,
      createdAt: timestamp,
      updatedAt: timestamp,
    },
  };

  try {
    await putAsync(params);

    const response = {
      statusCode: 200,
      body: JSON.stringify(params.Item),
    };

    callback(null, response);
  } catch (error) {
    console.error(error);
    callback(new Error("Couldn't create the todo item."));
  }
};
