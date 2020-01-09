import { TodoItem } from '../models/TodoItem'
import { TodoAccess } from '../dataLayer/todoAccess'
import { TodoUpdate } from '../models/TodoUpdate'
//import { CreateGroupRequest } from '../requests/CreateGroupRequest'
import { parseUserId } from '../auth/utils'

const todoAccess = new TodoAccess()

export async function getUserTodos(jwtToken) {
  const userId = parseUserId(jwtToken)
  return await todoAccess.getUserTodos(userId)
}

export async function createTodo(
  newItem: TodoItem,
  jwtToken: string
): Promise<TodoItem> {
  const userId = parseUserId(jwtToken)
  newItem.userId = userId
  return await todoAccess.createTodo(newItem)
}

export async function updateUserTodo(
  todo: TodoUpdate,
  todoId: string,
  jwtToken: string
) {
  const userId = parseUserId(jwtToken)

  await todoAccess.updateUserTodo(todo, todoId, userId)
}
