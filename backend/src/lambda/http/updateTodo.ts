import 'source-map-support/register'

import {
  APIGatewayProxyEvent,
  APIGatewayProxyHandler,
  APIGatewayProxyResult
} from 'aws-lambda'

import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'
import { updateTodo } from '../../businessLogic/todos'
import { createLogger } from '../../utils/logger'
const logger = createLogger('update todo endpoint')

export const handler: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const todoId = event.pathParameters.todoId
  const updatedTodo: UpdateTodoRequest = JSON.parse(event.body)

  // TODO: Update a TODO item with the provided id using values in the "updatedTodo" object
  const authorization = event.headers.Authorization

  const split = authorization.split(' ')
  const jwtToken = split[1]

  logger.info('attempting to update an item', updatedTodo)
  await updateTodo(
    {
      name: updatedTodo.name,
      dueDate: updatedTodo.dueDate,
      done: updatedTodo.done
    },
    todoId,
    jwtToken
  )
  logger.info('updated item', { todoId })
  return {
    statusCode: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true,
      'Access-Control-Allow-Methods': 'GET, PUT, POST, DELETE, HEAD'
    },
    body: ''
  }
}
