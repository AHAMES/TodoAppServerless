import { TodoItem } from '../models/TodoItem'
import { TodoAccess } from '../dataLayer/todoAccess'
import { TodoUpdate } from '../models/TodoUpdate'
//import { CreateGroupRequest } from '../requests/CreateGroupRequest'
import { parseUserId } from '../auth/utils'

const todoAccess = new TodoAccess()

import { createLogger } from '../utils/logger'
const logger = createLogger('Todo logic')

export async function getTodos(jwtToken) {
  const userId = parseUserId(jwtToken)
  logger.info('getTodos: Check userID ' + userId)
  return await todoAccess.getTodos(userId)
}

export async function createTodo(
  newItem: TodoItem,
  jwtToken: string
): Promise<TodoItem> {
  const userId = parseUserId(jwtToken)
  logger.info('createTodo: Check userID ' + userId)
  newItem.userId = userId
  return await todoAccess.createTodo(newItem)
}

export async function updateTodo(
  todo: TodoUpdate,
  todoId: string,
  jwtToken: string
) {
  const userId = parseUserId(jwtToken)
  logger.info('UpdateTodo: CheckuserID ' + userId)
  await todoAccess.updateTodo(todo, todoId, userId)
}
export async function deleteTodos(todoId, jwtToken) {
  const userId = parseUserId(jwtToken)
  logger.info('deleteTodos: CheckuserID ' + userId)
  await todoAccess.deleteTodo(todoId, userId)
}

export async function generateUploadUrl(todoId: string, jwtToken) {
  const userId = parseUserId(jwtToken)
  logger.info('GenerateUrl: CheckuserID ' + userId)
  return await todoAccess.generateUploadUrl(todoId, userId)
}

/*export async function setAttachmentURL(todoId: string, jwtToken) {
  const userId = parseUserId(jwtToken)
  await todoAccess.setAttachTodoURL(todoId, userId)
}*/
