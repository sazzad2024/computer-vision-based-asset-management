const app = require('./app');
const PORT = process.env.PORT || 3000;

app.get('/healthz', (_req, res) => res.status(200).send('ok'));
app.get('/health', (_req, res) => res.status(200).send('ok'));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
