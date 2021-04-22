import * as util from "util";
import { DynamoDB } from "aws-sdk";

const dynamoDb = new DynamoDB.DocumentClient();
const updateAsync = util.promisify(dynamoDb.update.bind(dynamoDb));

module.exports.update = async (event, _, callback) => {
  const timestamp = new Date().getTime();
  const data = JSON.parse(event.body);

  if (typeof data.text !== "string" || typeof data.checked !== "boolean") {
    console.error("Validation Failed");
    callback(null, {
      statusCode: 400,
      headers: { "Content-Type": "text/plain" },
      body: "Couldn't update the todo item.",
    });
    return;
  }

  const params = {
    TableName: process.env.DYNAMODB_TABLE,
    Key: {
      id: event.pathParameters.id,
    },
    ExpressionAttributeNames: {
      "#todo_text": "text",
    },
    ExpressionAttributeValues: {
      ":text": data.text,
      ":checked": data.checked,
      ":updatedAt": timestamp,
    },
    UpdateExpression:
      "SET #todo_text = :text, checked = :checked, updatedAt = :updatedAt",
    ReturnValues: "ALL_NEW" as const,
  };

  try {
    const result = await updateAsync(params);

    const response = {
      statusCode: 200,
      body: JSON.stringify(result.Attributes),
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
