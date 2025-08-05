# Deploy no Vercel - App Chamados Salas

## 🚀 Otimizações Implementadas

Este projeto foi otimizado para funcionar perfeitamente no ambiente serverless do Vercel. As seguintes melhorias foram implementadas:

### 📁 Arquivos Criados para Vercel

- **`backend/vercel-server.js`** - Servidor otimizado para ambiente serverless
- **`backend/vercel-logger.js`** - Logger que não depende de sistema de arquivos
- **`backend/vercel-database.js`** - Gerenciamento de dados em memória
- **`backend/routes/vercel-*.js`** - Rotas otimizadas para serverless
- **`.vercelignore`** - Arquivos ignorados no deploy

### ⚙️ Configurações do Vercel

#### `vercel.json`
```json
{
  "version": 2,
  "builds": [
    {
      "src": "frontend/package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "build",
        "buildCommand": "npm run vercel-build"
      }
    },
    {
      "src": "backend/vercel-server.js",
      "use": "@vercel/node",
      "config": {
        "maxLambdaSize": "50mb"
      }
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/backend/vercel-server.js"
    },
    {
      "src": "/static/(.*)",
      "dest": "/frontend/build/static/$1"
    },
    {
      "src": "/(.*\\.(js|css|ico|png|jpg|jpeg|gif|svg))",
      "dest": "/frontend/build/$1"
    },
    {
      "src": "/(.*)",
      "dest": "/frontend/build/index.html"
    }
  ],
  "env": {
    "NODE_ENV": "production",
    "CORS_ORIGIN": "https://appchamadosalas.vercel.app",
    "RATE_LIMIT_MAX_REQUESTS": "200",
    "RATE_LIMIT_MAX_API_REQUESTS": "100",
    "LOG_LEVEL": "error"
  },
  "functions": {
    "backend/vercel-server.js": {
      "maxDuration": 30
    }
  }
}
```

### 🔧 Principais Otimizações

1. **Servidor Serverless**: `vercel-server.js` é otimizado para cold starts
2. **Logger Simplificado**: Não usa sistema de arquivos, apenas console
3. **Database em Memória**: Dados são inicializados a cada request
4. **Rate Limiting Ajustado**: Configurado para ambiente serverless
5. **CORS Configurado**: Permite acesso do frontend hospedado no Vercel
6. **Variáveis de Ambiente**: Configuradas diretamente no `vercel.json`

### 📊 Dados de Demonstração

O sistema inclui dados de exemplo:
- **Status**: Aberto, Em Andamento, Concluído, Cancelado
- **Salas**: Sala 101, Sala 102, Laboratório de Informática
- **Chamados**: 2 chamados de exemplo para demonstração

## 🌐 URLs da Aplicação

- **Frontend**: https://appchamadosalas.vercel.app
- **API Health Check**: https://appchamadosalas.vercel.app/api/health
- **API Chamados**: https://appchamadosalas.vercel.app/api/chamados
- **API Salas**: https://appchamadosalas.vercel.app/api/salas
- **API Status**: https://appchamadosalas.vercel.app/api/status

## 🧪 Como Testar

### 1. Verificar API
```bash
# Testar se a API está funcionando
curl https://appchamadosalas.vercel.app/api/health

# Listar chamados
curl https://appchamadosalas.vercel.app/api/chamados

# Listar salas
curl https://appchamadosalas.vercel.app/api/salas

# Listar status
curl https://appchamadosalas.vercel.app/api/status
```

### 2. Testar Frontend
1. Acesse: https://appchamadosalas.vercel.app
2. Verifique se a lista de chamados carrega
3. Teste criar um novo chamado
4. Teste alterar status de um chamado

### 3. Verificar Logs
Os logs podem ser visualizados no painel do Vercel:
1. Acesse https://vercel.com/dashboard
2. Selecione o projeto `appchamadosalas`
3. Vá em "Functions" > "View Function Logs"

## 🔍 Troubleshooting

### Erro 404
- Verifique se o deploy foi concluído com sucesso
- Confirme se as rotas estão configuradas corretamente no `vercel.json`
- Verifique se o `vercel-server.js` está sendo usado como entry point

### Erro 500
- Verifique os logs da função no painel do Vercel
- Confirme se todas as dependências estão instaladas
- Verifique se as variáveis de ambiente estão configuradas

### CORS Errors
- Confirme se o `CORS_ORIGIN` está configurado corretamente
- Verifique se o frontend está acessando a URL correta da API

## 📝 Notas Importantes

1. **Persistência**: Os dados são mantidos apenas durante a execução da função
2. **Cold Starts**: A primeira requisição pode ser mais lenta
3. **Rate Limiting**: Configurado para 100 requests/minuto por IP
4. **Timeout**: Funções têm timeout de 30 segundos
5. **Tamanho**: Lambda limitada a 50MB

## 🔄 Redeploy

Para fazer redeploy:
1. Faça commit das alterações
2. Push para o repositório GitHub
3. O Vercel fará redeploy automaticamente

Ou use a CLI do Vercel:
```bash
npx vercel --prod
```

---

**Status**: ✅ Otimizado para Vercel  
**Última atualização**: $(date)  
**Commit**: 7204bc1