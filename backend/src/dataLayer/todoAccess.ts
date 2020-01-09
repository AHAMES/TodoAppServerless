import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { TodoUpdate } from '../models/TodoUpdate'
const XAWS = AWSXRay.captureAWS(AWS)

import { TodoItem } from '../models/TodoItem'

export class TodoAccess {
  constructor(
    private readonly docClient: DocumentClient = createDynamoDBClient(),

    private readonly todosTable = process.env.TODOS_TABLE //private readonly bucketName = process.env.TODOS_S3_BUCKET, //private readonly expires = process.env.SIGNED_URL_EXPIRATION, //private readonly thumbnailBucketName = process.env.THUMBNAILS_S3_BUCKET, //private readonly region = process.env.BUCKET_REGION
  ) {}

  async getUserTodos(userId: string): Promise<TodoItem[]> {
    var params = {
      TableName: this.todosTable,
      ProjectionExpression:
        'todoId, createdAt, #name, dueDate, done, attachmentUrl',
      FilterExpression: 'userId = :userId',
      ExpressionAttributeNames: {
        '#name': 'name'
      },
      ExpressionAttributeValues: {
        ':userId': userId
      }
    }

    const result = await this.docClient.scan(params).promise()
    const items = result.Items
    //logger.info('getUserTodos', items)
    return items as TodoItem[]
  }
  async createTodo(todo: TodoItem): Promise<TodoItem> {
    await this.docClient
      .put({
        TableName: this.todosTable,
        Item: todo
      })
      .promise()

    return todo
  }

  async updateUserTodo(todo: TodoUpdate, todoId: string, userId: string) {
    const params = {
      TableName: this.todosTable,
      Key: {
        todoId: todoId
      },
      ConditionExpression: 'todoId = :todoId and userId = :userId',
      UpdateExpression: 'set #name = :r, dueDate=:p, done=:a',
      ExpressionAttributeNames: {
        '#name': 'name'
      },
      ExpressionAttributeValues: {
        ':todoId': todoId,
        ':userId': userId,
        ':r': todo.name,
        ':p': todo.dueDate,
        ':a': todo.done
      }
    }

    await this.docClient.update(params).promise()
  }
}

function createDynamoDBClient() {
  if (process.env.IS_OFFLINE === 'True') {
    return new XAWS.DynamoDB.DocumentClient({
      region: 'localhost',
      endpoint: 'http://localhost:8000'
    })
  }

  return new XAWS.DynamoDB.DocumentClient({ apiVersion: '2012-08-10' })
}
