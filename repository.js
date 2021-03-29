// Set a table name that we can use later on
const tableName = 'notes'

async function getNote(documentClient, noteId) {
    return await documentClient.get({
        TableName: tableName,
        Key: {
          'id': noteId
        }
      }).promise();
}

async function createNote(documentClient, data) {
    return await documentClient.put({
        TableName: tableName,
        Item: data
      }).promise();
}

async function updateNote(documentClient, noteId, title, content) {
    const ret = await documentClient.update({
        TableName: tableName,
        Key: {
            "id": noteId,
        },
        UpdateExpression: "set title = :t, content=:c",
        ExpressionAttributeValues:{
            ":t": title,
            ":c": content,
        },
        ReturnValues:"ALL_NEW"
      }).promise();
      return ret
}

exports.getNote = getNote;
exports.createNote = createNote;
exports.updateNote = updateNote;