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

  async getTodos(userId: string): Promise<TodoItem[]> {
    var params = {
      TableName: this.todosTable,
      KeyConditionExpression: 'userId = :userId',

      ExpressionAttributeValues: {
        ':userId': userId
      }
    }

    logger.info(
      'getTodos: userID ' + userId + ' attempting to retreive user todos'
    )
    const result = await this.docClient.query(params).promise()
    const items = result.Items
    logger.info('Items retrieved', items)
    return items as TodoItem[]
  }

  async createTodo(todo: TodoItem): Promise<TodoItem> {
    todo.attachmentUrl = `https://${this.bucketName}.s3.amazonaws.com/${todo.todoId}`
    logger.info(
      'createTodo: userID ' + todo.userId + ' attempting to create todo'
    )
    await this.docClient
      .put({
        TableName: this.todosTable,
        Item: todo
      })
      .promise()
    logger.info('item created', todo)
    return todo
  }

  async updateTodo(todo: TodoUpdate, todoId: string, userId: string) {
    logger.info('updateTodo: userID ' + userId + ' attempting to update todo')
    const params = {
      TableName: this.todosTable,
      Key: {
        userId: userId,
        todoId: todoId
      },
      UpdateExpression: 'set #nam = :a, dueDate=:b, done=:c',
      ExpressionAttributeNames: {
        '#nam': 'name'
      },
      ExpressionAttributeValues: {
        ':a': todo.name,
        ':b': todo.dueDate,
        ':c': todo.done
      }
    }
    await this.docClient.update(params).promise()
    logger.info('updated Todo', todo)
  }

  async deleteTodo(todoId: string, userId: string) {
    logger.info('deleteTodo: userID ' + userId + ' attempting to delete todo')
    var params = {
      TableName: this.todosTable,
      Key: {
        userId: userId,
        todoId: todoId
      }
    }

    await this.docClient.delete(params).promise()
    logger.info('deleted todo id: ' + todoId)
  }
  /*async setAttachTodoURL(todoId: string, userId: string) {
    const attachmentURL = `https://${this.bucketName}.s3.amazonaws.com/${todoId}`
    logger.info('Attaching URL', { attachmentURL })
    const params = {
      TableName: this.todosTable,
      Key: {
        userId: userId,
        todoId: todoId
      },

      UpdateExpression: 'set #a = :attachURL',
      ExpressionAttributeNames: { '#a': 'attachmentUrl' },
      ExpressionAttributeValues: {
        ':attachURL': attachmentURL
      }
    }
    logger.info('URL attached', { attachmentURL })
    const res = await this.docClient.update(params).promise()
    logger.info('response', res)
  }*/

  async generateUploadUrl(todoId: string, userId: string): Promise<string> {
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

    logger.info('generateUploadUrl Params ', params)
    const url = await s3.getSignedUrl('putObject', params)
    logger.info('generated URL for user ' + userId, { url })
    //this.setAttachTodoURL(todoId, userId)
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
