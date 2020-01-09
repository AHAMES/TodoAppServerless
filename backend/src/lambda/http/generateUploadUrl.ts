import 'source-map-support/register'
import { generateUploadUrl } from '../../businessLogic/todos'
import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  APIGatewayProxyHandler
} from 'aws-lambda'

export const handler: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const todoId = event.pathParameters.todoId

  // TODO: Return a presigned URL to upload a file for a TODO item with the provided id

  const url: string = generateUploadUrl(todoId)
  return {
    statusCode: 201,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },    
    body: JSON.stringify({
      uploadUrl: url
    })
  }
}
