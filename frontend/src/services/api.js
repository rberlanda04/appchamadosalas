import axios from 'axios';

// Configuração base do axios
const api = axios.create({
  baseURL: 'http://localhost:5001/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Serviços para chamados
const chamadosService = {
  // Obter todos os chamados
  getAll: async () => {
    try {
      const response = await api.get('/chamados');
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar chamados:', error);
      throw error;
    }
  },

  // Obter chamados por status
  getByStatus: async (statusId) => {
    try {
      const response = await api.get(`/chamados/status/${statusId}`);
      return response.data;
    } catch (error) {
      console.error(`Erro ao buscar chamados com status ${statusId}:`, error);
      throw error;
    }
  },

  // Obter um chamado específico
  getById: async (id) => {
    try {
      const response = await api.get(`/chamados/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Erro ao buscar chamado ${id}:`, error);
      throw error;
    }
  },

  // Criar um novo chamado
  create: async (chamadoData) => {
    try {
      const response = await api.post('/chamados', chamadoData);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar chamado:', error);
      throw error;
    }
  },

  // Atualizar o status de um chamado
  updateStatus: async (id, statusData) => {
    try {
      const response = await api.put(`/chamados/${id}/status`, statusData);
      return response.data;
    } catch (error) {
      console.error(`Erro ao atualizar status do chamado ${id}:`, error);
      throw error;
    }
  },

  // Atualizar um chamado
  update: async (id, chamadoData) => {
    try {
      const response = await api.put(`/chamados/${id}`, chamadoData);
      return response.data;
    } catch (error) {
      console.error(`Erro ao atualizar chamado ${id}:`, error);
      throw error;
    }
  },

  // Excluir um chamado
  delete: async (id) => {
    try {
      const response = await api.delete(`/chamados/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Erro ao excluir chamado ${id}:`, error);
      throw error;
    }
  },
};

// Serviços para salas
const salasService = {
  // Obter todas as salas
  getAll: async () => {
    try {
      const response = await api.get('/salas');
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar salas:', error);
      throw error;
    }
  },

  // Obter uma sala específica
  getById: async (id) => {
    try {
      const response = await api.get(`/salas/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Erro ao buscar sala ${id}:`, error);
      throw error;
    }
  },

  // Obter uma sala pelo número
  getByNumero: async (numero) => {
    try {
      const response = await api.get(`/salas/numero/${numero}`);
      return response.data;
    } catch (error) {
      console.error(`Erro ao buscar sala com número ${numero}:`, error);
      throw error;
    }
  },

  // Criar uma nova sala
  create: async (salaData) => {
    try {
      const response = await api.post('/salas', salaData);
      return response.data;
    } catch (error) {
      console.error('Erro ao criar sala:', error);
      throw error;
    }
  },

  // Atualizar uma sala
  update: async (id, salaData) => {
    try {
      const response = await api.put(`/salas/${id}`, salaData);
      return response.data;
    } catch (error) {
      console.error(`Erro ao atualizar sala ${id}:`, error);
      throw error;
    }
  },

  // Atualizar o QR Code de uma sala
  updateQRCode: async (id, qrCodeData) => {
    try {
      const response = await api.put(`/salas/${id}/qrcode`, qrCodeData);
      return response.data;
    } catch (error) {
      console.error(`Erro ao atualizar QR Code da sala ${id}:`, error);
      throw error;
    }
  },

  // Excluir uma sala
  delete: async (id) => {
    try {
      const response = await api.delete(`/salas/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Erro ao excluir sala ${id}:`, error);
      throw error;
    }
  },
};

export { chamadosService, salasService };