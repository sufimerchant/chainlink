import serializeJob from 'connectors/redux/serializers/job'

export default (actionType, json, jobSerializer = serializeJob) => ({
  type: actionType,
  item: jobSerializer(json.data)
})
