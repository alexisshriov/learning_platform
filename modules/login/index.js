import { login } from './loginReducer'
import { actions as a } from './loginActions'

export const reducer = login;   // If there are multiple, combine them here

export const actions = a;
