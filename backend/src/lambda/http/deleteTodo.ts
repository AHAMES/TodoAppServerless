import 'source-map-support/register'

import { createLogger } from '../../utils/logger'
const logger = createLogger('deleteTodo')
import { deleteTodos } from '../../businessLogic/todos'
import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  APIGatewayProxyHandler
} from 'aws-lambda'

export const handler: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const todoId = event.pathParameters.todoId

  logger.info('attempting to delete item of id ' + todoId)
  // TODO: Remove a TODO item by id

  const authorization = event.headers.Authorization
  const split = authorization.split(' ')
  const jwtToken = split[1]

  const item = await deleteTodos(todoId, jwtToken)
  logger.info('deleted item ' + todoId)
  return {
    statusCode: 201,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify({
      item
    })
  }
}
