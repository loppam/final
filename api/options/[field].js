export default async function handler(req, res) {
  const { field } = req.query;
  const response = await fetch(`http://109.238.92.177:3500/options/${field}`);
  const data = await response.json();
  res.status(response.status).json(data);
}
