import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { TodoUpdate } from '../models/TodoUpdate'
const XAWS = AWSXRay.captureAWS(AWS)
import { TodoItem } from '../models/TodoItem'
import { createLogger } from '../utils/logger'
const logger = createLogger('Todo dataLayer')

export class TodoAccess {
  constructor(
    private readonly docClient: DocumentClient = createDynamoDBClient(),

    private readonly todosTable = process.env.TODOS_TABLE,
    private readonly bucketName = process.env.TODOS_S3_BUCKET,
    private readonly expires = process.env.SIGNED_URL_EXPIRATION, //private readonly thumbnailBucketName = process.env.THUMBNAILS_S3_BUCKET,
    private readonly region = process.env.BUCKET_REGION
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
    return items as TodoItem[]
  }

  async setAttachTodoURL(todoId: string, userId: string, url: string) {
    const params = {
      TableName: this.todosTable,
      Key: {
        todoId: todoId
      },

      ConditionExpression: 'todoId = :todoId and userId = :userId',
      UpdateExpression: 'set attachmentUrl = :attachURL',

      ExpressionAttributeValues: {
        ':todoId': todoId,
        ':attachURL': url,
        ':userId': userId
      }
    }
    logger.info('URL attached', { url })
    await this.docClient.update(params).promise()
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
      UpdateExpression: 'set #name = :name, dueDate=:due, done=:done',
      ExpressionAttributeNames: {
        '#name': 'name'
      },
      ExpressionAttributeValues: {
        ':todoId': todoId,
        ':userId': userId,
        ':name': todo.name,
        ':due': todo.dueDate,
        ':done': todo.done
      }
    }

    await this.docClient.update(params).promise()
  }

  async deleteUserTodo(todoId: string, userId: string) {
    var params = {
      TableName: this.todosTable,
      Key: {
        todoId: todoId
      },
      ConditionExpression: 'todoId = :todoId and userId = :userId',
      ExpressionAttributeValues: {
        ':todoId': todoId,
        ':userId': userId
      }
    }

    await this.docClient.delete(params).promise()
  }

  generateUploadUrl(todoId: string, userId: string): string {
    const s3 = new XAWS.S3({
      signatureVersion: 'v4',
      region: this.region,
      params: { Bucket: this.bucketName }
    })

    var params = {
      Bucket: this.bucketName,
      Key: todoId,
      Expires: parseInt(this.expires)
    }

    logger.info('Url Params', params)
    const url = s3.getSignedUrl('putObject', params)
    const attachmentURL = `https://${this.bucketName}.s3.amazonaws.com/${todoId}`
    logger.info('Attaching URL', { attachmentURL })
    this.setAttachTodoURL(todoId, userId, attachmentURL)
    return url
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
