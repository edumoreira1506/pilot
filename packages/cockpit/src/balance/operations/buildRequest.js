import moment from 'moment-timezone'
import {
  curry,
  defaultTo,
  ifElse,
  propEq,
  uncurryN,
} from 'ramda'
import formatPayablesRows from './payables'
import formatOperationsRows from './operations'

const buildBaseQuery = ({
  count,
  page,
  recipientId,
}) => ({
  count,
  page,
  recipient_id: recipientId,
})

const buildOperationsQuery = ({
  dates: {
    end,
    start,
  },
  ...query
}) => ({
  ...buildBaseQuery(query),
  end_date: moment(end).endOf('day').valueOf(),
  start_date: moment(start).startOf('day').valueOf(),
})

const buildPayablesQuery = ({
  dates: {
    end,
    start,
  },
  ...query
}) => ({
  ...buildBaseQuery(query),
  payment_date: [
    `>=${moment(start).startOf('day').valueOf()}`,
    `<=${moment(end).endOf('day').valueOf()}`,
  ],
  status: ['waiting_funds', 'prepaid'],
})

const buildPayablesRequest = curry((client, query) => {
  const payablesQuery = buildPayablesQuery(query)

  return client.payables
    .all(payablesQuery)
    .then(formatPayablesRows)
})

const defaultToArray = defaultTo([])

const buildOperationsRequest = curry((client, query) => {
  const operationsQuery = buildOperationsQuery(query)

  return client.balanceOperations
    .find(operationsQuery)
    .then(defaultToArray)
    .then(formatOperationsRows)
})

const buildRequestPromise = uncurryN(2, client => ifElse(
  propEq('timeframe', 'future'),
  buildPayablesRequest(client),
  buildOperationsRequest(client)
))

export default buildRequestPromise
