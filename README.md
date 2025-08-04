# Sistema de Gerenciamento de Chamados para Salas de Aula

Este aplicativo web permite gerenciar chamados de suporte técnico para salas de aula através de QR codes. Cada sala possui um QR code único que, ao ser escaneado, gera um chamado imediato para a equipe de TI, informando o horário e a localização da sala que necessita de suporte.

## Funcionalidades

- Escaneamento de QR codes para abertura de chamados
- Painel de controle para visualização e gerenciamento de chamados
- Categorização de chamados: Aberto, Em Andamento, Finalizado
- Registro de histórico de chamados em banco de dados SQLite
- Interface amigável e responsiva

## Estrutura do Projeto

- `frontend/`: Contém os arquivos da interface do usuário
- `backend/`: Contém a API e lógica de negócios
- `database/`: Contém o banco de dados SQLite e scripts relacionados

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

# Inicialize o banco de dados (se necessário)
npm run init-db
```

### Frontend

```bash
# Navegue até a pasta do frontend
cd frontend

# Instale as dependências
npm install
```

## Como Executar

### Backend

```bash
# Navegue até a pasta do backend
cd backend

# Inicie o servidor
npm start
```

O servidor backend estará rodando em `http://localhost:5000`.

### Frontend

```bash
# Navegue até a pasta do frontend
cd frontend

# Inicie o aplicativo
npm start
```

O aplicativo frontend estará disponível em `http://localhost:3000`.

## Notas de Versão

### v1.0.0
- Versão inicial do sistema
- Funcionalidade de escaneamento de QR code implementada
- Painel de controle para gerenciamento de chamados

## Tecnologias Utilizadas

- Frontend: React.js (v17), Material-UI
- Backend: Node.js, Express
- Banco de Dados: SQLite
- QR Code: react-qr-reader