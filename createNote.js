'use strict';

const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');
const repository = require('./repository');

// Set a region to interact with (make sure it's the same as the region of your table)
AWS.config.update({ region: 'us-east-2' });

// Create the Service interface for DynamoDB
var documentClient = new AWS.DynamoDB.DocumentClient();


exports.handler = async (event) => {
  const body = JSON.parse(event.body)
  if (!body) {
    return { "statusCode": 400, "body": JSON.stringify({ error: "Invalid request" }) }
  }

  for (const requiredField of ['title', 'content', 'validUntil', 'password']) {
    if (!body[requiredField]) {
      return { "statusCode": 400, "body": JSON.stringify({ error: `Missing ${requiredField}` }) }
    }
  }
  const { title, content, validUntil, password } = body

  try {
    const id = uuidv4()
    await repository.createNote(documentClient, { id, title, content, validUntil, password })
    // not sure if can make insert and return a single dynamoDB call, so using get() here:
    const note = await repository.getNote(documentClient, id)
    delete note.password
    return { "statusCode": 200, "body": JSON.stringify(note.Item) }

  } catch (error) {
    throw error
  }
};