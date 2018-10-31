export default json => {
  return Object.assign(
    {id: json.id},
    json.attributes,
    {createdAt: Date.parse(json.attributes.createdAt)}
  )
}
