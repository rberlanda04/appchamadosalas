// Função serverless básica para health check
module.exports = (req, res) => {
  // Log para verificar se a função está sendo executada
  console.log('Health check executado:', new Date().toISOString());
  console.log('Método:', req.method);
  console.log('URL:', req.url);
  
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  try {
    const response = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'production',
      version: '1.0.0',
      logs: 'Logs funcionando no Vercel - esta mensagem foi registrada',
      vercel: true
    };
    
    console.log('Resposta enviada:', JSON.stringify(response));
    res.status(200).json(response);
    
  } catch (error) {
    console.error('Erro na função health:', error.message);
    console.error('Stack:', error.stack);
    
    res.status(500).json({
      error: 'Erro interno do servidor',
      timestamp: new Date().toISOString()
    });
  }
}