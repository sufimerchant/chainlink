import serializeJobRun from 'connectors/redux/serializers/jobRun'

export default (actionType, json, jobRunSerializer = serializeJobRun) => ({
  type: actionType,
  runsCount: json.meta.count,
  items: json.data.map(jobRunSerializer)
})
