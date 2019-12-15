import { map } from './mapReducer'
import { actions as a } from './mapActions'

export const reducer = map;   // If there are multiple, combine them here

export const actions = a;
