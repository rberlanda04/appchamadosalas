# Sistema de Gerenciamento de Chamados para Salas de Aula

Este aplicativo web permite gerenciar chamados de suporte técnico para salas de aula através de QR codes. Cada sala possui um QR code único que, ao ser escaneado, gera um chamado imediato para a equipe de TI, informando o horário e a localização da sala que necessita de suporte.

## Funcionalidades

- Escaneamento de QR codes para abertura de chamados
- Painel de controle para visualização e gerenciamento de chamados
- Categorização de chamados: Aberto, Em Andamento, Finalizado
- Registro de histórico de chamados em sistema de logs estruturados
- Interface amigável e responsiva

## Estrutura do Projeto

- `frontend/`: Contém os arquivos da interface do usuário
- `backend/`: Contém a API e lógica de negócios
- `logs/`: Contém os arquivos de log estruturados do sistema

## Requisitos

- Node.js (v14 ou superior)
- npm (v6 ou superior)

## Instalação

### Backend

```bash
# Navegue até a pasta do backend
cd backend

# Instale as dependências
npm install

# O sistema de dados baseado em arquivos não requer inicialização
```

### Frontend

```bash
# Navegue até a pasta do frontend
cd frontend

# Instale as dependências
npm install
```

## Como Executar

### 🚀 Inicialização Rápida (Recomendado)

```bash
# Configuração inicial completa (apenas na primeira vez)
npm run setup

# Iniciar sistema completo (banco + backend + frontend)
npm start
```

Isso iniciará automaticamente:
- ✅ Sistema de dados baseado em arquivos
- ✅ Servidor backend na porta 5001
- ✅ Servidor frontend na porta 3000

### 📋 Comandos Disponíveis

```bash
# Configuração inicial (instala dependências)
npm run setup

# Iniciar sistema completo
npm start
# ou
npm run dev

# Apenas verificar dependências
npm run init

# Build para produção
npm run build
```

### 🔧 Execução Manual (Alternativa)

#### Backend
```bash
cd backend
npm start
```

#### Frontend
```bash
cd frontend
npm start
```

## Deploy no Vercel

Para fazer o deploy da aplicação no Vercel:

1. **Prepare o repositório Git:**
   ```bash
   git add .
   git commit -m "Preparação para deploy no Vercel"
   ```

2. **Crie um repositório no GitHub:**
   - Acesse [GitHub](https://github.com) e crie um novo repositório
   - Adicione o remote ao seu projeto local:
   ```bash
   git remote add origin https://github.com/seu-usuario/seu-repositorio.git
   git branch -M main
   git push -u origin main
   ```

3. **Deploy no Vercel:**
   - Acesse [Vercel](https://vercel.com)
   - Conecte sua conta do GitHub
   - Importe o repositório do projeto
   - O Vercel detectará automaticamente a configuração através do arquivo `vercel.json`
   - O deploy será feito automaticamente

4. **Configurações importantes:**
   - O frontend será servido na raiz do domínio
   - O backend estará disponível em `/api`
   - O sistema de logs será criado automaticamente no primeiro acesso

## Notas de Versão

### v1.0.0
- Versão inicial do sistema
- Funcionalidade de escaneamento de QR code implementada
- Painel de controle para gerenciamento de chamados

## Tecnologias Utilizadas

- Frontend: React.js (v17), Material-UI
- Backend: Node.js, Express
- Armazenamento: Sistema de logs estruturados em arquivos JSON
- QR Code: react-qr-reader