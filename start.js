const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🚀 Iniciando Sistema de Chamados...');

// Função para executar comandos
function runCommand(command, args, cwd, label) {
    return new Promise((resolve, reject) => {
        console.log(`\n📋 ${label}...`);
        const process = spawn(command, args, {
            cwd: cwd,
            stdio: 'inherit',
            shell: true
        });

        process.on('close', (code) => {
            if (code === 0) {
                console.log(`✅ ${label} concluído com sucesso!`);
                resolve();
            } else {
                console.log(`❌ ${label} falhou com código ${code}`);
                reject(new Error(`${label} falhou`));
            }
        });

        process.on('error', (err) => {
            console.log(`❌ Erro ao executar ${label}:`, err.message);
            reject(err);
        });
    });
}

// Função para verificar sistema de dados
function checkDataSystem() {
    // Sistema baseado em arquivos - sempre disponível
    return true;
}

// Função principal
async function startApplication() {
    try {
        // 1. Verificar sistema de dados
        if (checkDataSystem()) {
            console.log('\n📁 Sistema de dados baseado em arquivos - pronto!');
        }

        // 2. Instalar dependências do backend (se necessário)
        const backendNodeModules = path.join(__dirname, 'backend', 'node_modules');
        if (!fs.existsSync(backendNodeModules)) {
            await runCommand('npm', ['install'], path.join(__dirname, 'backend'), 'Instalação das dependências do backend');
        }

        // 3. Instalar dependências do frontend (se necessário)
        const frontendNodeModules = path.join(__dirname, 'frontend', 'node_modules');
        if (!fs.existsSync(frontendNodeModules)) {
            await runCommand('npm', ['install'], path.join(__dirname, 'frontend'), 'Instalação das dependências do frontend');
        }

        console.log('\n🎉 Sistema inicializado com sucesso!');
        console.log('\n📝 Para iniciar os servidores, execute:');
        console.log('   Backend:  cd backend && npm start');
        console.log('   Frontend: cd frontend && npm start');
        console.log('\n🌐 URLs de acesso:');
        console.log('   Frontend: http://localhost:3000');
        console.log('   Backend:  http://localhost:5001');
        console.log('\n💡 Dica: Mantenha ambos os terminais abertos para o funcionamento completo!');

    } catch (error) {
        console.error('\n❌ Erro durante a inicialização:', error.message);
        process.exit(1);
    }
}

// Executar a aplicação
startApplication();