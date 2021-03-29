'use strict';

const AWS = require('aws-sdk');
const repository = require('./repository');

// Set a region to interact with (make sure it's the same as the region of your table)
AWS.config.update({ region: 'us-east-2' });

// Create the Service interface for DynamoDB
var documentClient = new AWS.DynamoDB.DocumentClient();


exports.handler = async (event) => {
    const { noteId } = event.pathParameters;
    const body = JSON.parse(event.body)
    if (!body) {
        return { "statusCode": 400, "body": JSON.stringify({ error: "Invalid request" }) }
    }

    for (const requiredField of ['title', 'content', 'password']) {
        if (!body[requiredField]) {
            return { "statusCode": 400, "body": JSON.stringify({ error: `Missing ${requiredField}` }) }
        }
    }

    const { title, content, password } = body
    try {
        let {Item: note} = await repository.getNote(documentClient, noteId)
        if (!note) {
            return { "statusCode": 404, "body": JSON.stringify({ error: "Note not found" }) }
        }
        if (note?.password != password) {
            return { "statusCode": 401, "body": JSON.stringify({ error: "Unauthorized access" }) }
        }
        if (Number(note?.validUntil) < (new Date()).getTime()) {
            return { "statusCode": 403, "body": JSON.stringify({ error: "Forbidden access" }) }
        }

        ;({Attributes: note} = await repository.updateNote(documentClient, noteId, title, content))
        delete note.password
        return { "statusCode": 200, "body": JSON.stringify(note) }

    } catch (error) {
        throw error
    }
};