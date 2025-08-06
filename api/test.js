// Função serverless para teste de logs
module.exports = (req, res) => {
  // Logs detalhados para teste
  console.log('=== TESTE DE LOGS NO VERCEL ===');
  console.log('Timestamp:', new Date().toISOString());
  console.log('Método HTTP:', req.method);
  console.log('URL completa:', req.url);
  console.log('Headers recebidos:', JSON.stringify(req.headers, null, 2));
  console.log('Query parameters:', JSON.stringify(req.query, null, 2));
  
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    console.log('Requisição OPTIONS processada');
    res.status(200).end();
    return;
  }
  
  try {
    const response = {
      message: 'Teste de logs realizado com sucesso!',
      timestamp: new Date().toISOString(),
      method: req.method,
      url: req.url,
      environment: process.env.NODE_ENV || 'production',
      logs: {
        console: 'Mensagens foram enviadas para console.log',
        vercel: 'Verifique os logs do Vercel Dashboard',
        location: 'Functions > View Function Logs'
      },
      test_data: {
        random_number: Math.floor(Math.random() * 1000),
        server_time: new Date().toLocaleString('pt-BR'),
        process_env_keys: Object.keys(process.env).length
      }
    };
    
    console.log('Resposta preparada:', JSON.stringify(response, null, 2));
    console.log('=== FIM DO TESTE ===');
    
    res.status(200).json(response);
    
  } catch (error) {
    console.error('ERRO na função de teste:', error.message);
    console.error('Stack trace:', error.stack);
    
    res.status(500).json({
      error: 'Erro interno do servidor',
      timestamp: new Date().toISOString(),
      details: error.message
    });
  }
}