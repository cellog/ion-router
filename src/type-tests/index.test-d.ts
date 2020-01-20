import { expectType, expectError } from 'tsd'
import { reducer } from '..'
expectError(reducer({}))
