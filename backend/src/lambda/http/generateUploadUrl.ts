import 'source-map-support/register'
import { generateUploadUrl, setAttachmentURL } from '../../businessLogic/todos'
import { createLogger } from '../../utils/logger'
import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  APIGatewayProxyHandler
} from 'aws-lambda'

const logger = createLogger('UploadUrl')
export const handler: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const todoId = event.pathParameters.todoId

  // TODO: Return a presigned URL to upload a file for a TODO item with the provided id
  const authorization = event.headers.Authorization
  const split = authorization.split(' ')
  const jwtToken = split[1]
  const url: string = await generateUploadUrl(todoId, jwtToken)
  await setAttachmentURL(todoId, jwtToken)
  logger.info('Url ', { url })
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
