// Função serverless para Vercel
module.exports = (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  const { url, method } = req;
  
  try {
    if (url === '/api/health') {
      console.log('Health check acessado:', new Date().toISOString());
      res.status(200).json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'production',
        version: '1.0.0',
        logs: 'Logs funcionando no Vercel'
      });
      return;
    }
    
    if (url === '/api/test') {
      console.log('Endpoint de teste acessado:', new Date().toISOString());
      console.log('Método:', method);
      console.log('Headers:', JSON.stringify(req.headers));
      
      res.status(200).json({
        message: 'Teste realizado com sucesso no Vercel',
        timestamp: new Date().toISOString(),
        method: method,
        url: url,
        logs: 'Verifique os logs do Vercel - esta mensagem foi registrada'
      });
      return;
    }
    
    // Rota não encontrada
    console.log('Rota não encontrada:', url);
    res.status(404).json({ 
      error: 'Rota não encontrada',
      url: url,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Erro na função serverless:', error.message);
    console.error('Stack:', error.stack);
    
    res.status(500).json({
      error: 'Erro interno do servidor',
      timestamp: new Date().toISOString()
    });
  }
};