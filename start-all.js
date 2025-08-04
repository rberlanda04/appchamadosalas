const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🚀 Iniciando Sistema Completo de Chamados...');

// Função para verificar se o banco existe
function checkDatabase() {
    const dbPath = path.join(__dirname, 'database', 'chamados.db');
    return fs.existsSync(dbPath);
}

// Função para inicializar banco de dados
function initDatabase() {
    return new Promise((resolve, reject) => {
        console.log('\n🗄️  Inicializando banco de dados...');
        const initProcess = spawn('node', ['backend/initDb.js'], {
            cwd: __dirname,
            stdio: 'inherit',
            shell: true
        });

        initProcess.on('close', (code) => {
            if (code === 0) {
                console.log('✅ Banco de dados inicializado com sucesso!');
                resolve();
            } else {
                reject(new Error(`Falha na inicialização do banco: código ${code}`));
            }
        });

        initProcess.on('error', (err) => {
            reject(err);
        });
    });
}

// Função para iniciar servidor
function startServer(name, command, args, cwd) {
    console.log(`\n🔄 Iniciando ${name}...`);
    const serverProcess = spawn(command, args, {
        cwd: cwd,
        stdio: 'inherit',
        shell: true,
        detached: true
    });

    serverProcess.on('error', (err) => {
        console.error(`❌ Erro ao iniciar ${name}:`, err.message);
    });

    // Não aguardar o processo terminar (servidores ficam rodando)
    serverProcess.unref();
    
    return serverProcess;
}

// Função principal
async function startCompleteApplication() {
    try {
        // 1. Verificar e inicializar banco de dados
        if (!checkDatabase()) {
            await initDatabase();
        } else {
            console.log('\n✅ Banco de dados já existe e está pronto!');
        }

        // 2. Aguardar um momento para garantir que o banco está pronto
        await new Promise(resolve => setTimeout(resolve, 1000));

        // 3. Iniciar backend
        console.log('\n🔧 Iniciando servidor backend...');
        const backendProcess = startServer(
            'Backend', 
            'npm', 
            ['start'], 
            path.join(__dirname, 'backend')
        );

        // 4. Aguardar backend inicializar
        await new Promise(resolve => setTimeout(resolve, 3000));

        // 5. Iniciar frontend
        console.log('\n🎨 Iniciando servidor frontend...');
        const frontendProcess = startServer(
            'Frontend', 
            'npm', 
            ['start'], 
            path.join(__dirname, 'frontend')
        );

        // 6. Aguardar frontend inicializar
        await new Promise(resolve => setTimeout(resolve, 5000));

        console.log('\n🎉 Sistema Completo Iniciado com Sucesso!');
        console.log('\n🌐 URLs de Acesso:');
        console.log('   📱 Frontend: http://localhost:3000');
        console.log('   🔧 Backend:  http://localhost:5001');
        console.log('\n📋 Status dos Serviços:');
        console.log('   ✅ Banco de dados SQLite: Ativo');
        console.log('   ✅ Servidor Backend: Rodando na porta 5001');
        console.log('   ✅ Servidor Frontend: Rodando na porta 3000');
        console.log('\n💡 Dicas:');
        console.log('   • Acesse http://localhost:3000 para usar o aplicativo');
        console.log('   • Mantenha este terminal aberto para manter os servidores rodando');
        console.log('   • Use Ctrl+C para parar todos os serviços');

        // Manter o processo principal vivo
        process.stdin.resume();

        // Capturar Ctrl+C para encerrar graciosamente
        process.on('SIGINT', () => {
            console.log('\n\n🛑 Encerrando sistema...');
            try {
                backendProcess.kill();
                frontendProcess.kill();
            } catch (err) {
                // Ignorar erros ao matar processos
            }
            console.log('✅ Sistema encerrado com sucesso!');
            process.exit(0);
        });

    } catch (error) {
        console.error('\n❌ Erro durante a inicialização:', error.message);
        console.log('\n🔧 Tente executar manualmente:');
        console.log('   1. node backend/initDb.js');
        console.log('   2. cd backend && npm start');
        console.log('   3. cd frontend && npm start');
        process.exit(1);
    }
}

// Executar a aplicação completa
startCompleteApplication();

// Tratar erros não capturados
process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Erro não tratado:', reason);
});

process.on('uncaughtException', (error) => {
    console.error('❌ Exceção não capturada:', error.message);
    process.exit(1);
});