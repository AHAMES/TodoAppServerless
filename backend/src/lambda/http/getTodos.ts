import 'source-map-support/register'

import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  APIGatewayProxyHandler
} from 'aws-lambda'

import { getTodos } from '../../businessLogic/Todos'
import { TodoItem } from '../../models/TodoItem'

import { createLogger } from '../../utils/logger'
const logger = createLogger('UploadUrl')
export const handler: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  // TODO: Get all TODO items for a current user

  const authorization = event.headers.Authorization
  const split = authorization.split(' ')
  const jwtToken = split[1]
  logger.info('getting item for the user')

  const TodoItems: TodoItem[] = await getTodos(jwtToken)
  const items = JSON.parse(JSON.stringify(TodoItems))

  logger.info('Items retrieved ' + items)
  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      items
    })
  }
}
