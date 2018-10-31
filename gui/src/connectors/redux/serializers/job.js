export default json => Object.assign(
  {id: json.id},
  json.attributes,
  {createdAt: Date.parse(json.attributes.createdAt)},
  json.attributes.runs && {runs: json.attributes.runs.map(r => r.id)}
)
