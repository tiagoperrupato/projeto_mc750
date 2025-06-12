document.addEventListener('DOMContentLoaded', () => {
    const connectButton = document.getElementById('connectButton');
    const statusDisplay = document.getElementById('status');
    const screens = document.querySelectorAll('.screen');
    let port;

    // Verifica se o navegador suporta a Web Serial API
    if ('serial' in navigator) {
        connectButton.addEventListener('click', () => {
            if (port) {
                // Se já estiver conectado, desconecta
                port.close();
                port = undefined;
                statusDisplay.textContent = 'Status: Desconectado';
                connectButton.textContent = '🔌 Conectar ao Arduino';
            } else {
                // Se não, solicita conexão
                requestSerialPort();
            }
        });
    } else {
        // Se não houver suporte, avisa o usuário
        statusDisplay.innerHTML = 'Seu navegador não suporta a <b>Web Serial API</b>. Tente usar o Google Chrome ou Microsoft Edge.';
        connectButton.disabled = true;
    }

    // Função para pedir permissão e conectar à porta serial
    async function requestSerialPort() {
        try {
            port = await navigator.serial.requestPort();
            await port.open({ baudRate: 9600 }); // A mesma velocidade definida no Arduino
            
            statusDisplay.textContent = 'Status: Conectado ✅';
            connectButton.textContent = '🔌 Desconectar';
            
            // Começa a ouvir os dados da porta serial
            listenToSerialPort();
        } catch (error) {
            statusDisplay.textContent = `Erro: ${error.message}`;
        }
    }
    
    // Função para ler os dados continuamente
    async function listenToSerialPort() {
        const textDecoder = new TextDecoderStream();
        const readableStreamClosed = port.readable.pipeTo(textDecoder.writable);
        const reader = textDecoder.readable.getReader();

        try {
            while (true) {
                const { value, done } = await reader.read();
                if (done) {
                    reader.releaseLock();
                    break;
                }
                // O Arduino envia "Button1\r\n", então limpamos os caracteres extras
                const cleanValue = value.trim();
                if (cleanValue) {
                    console.log(`Recebido: ${cleanValue}`);
                    updateScreen(cleanValue);
                }
            }
        } catch (error) {
            console.error('Erro ao ler a porta serial:', error);
            statusDisplay.textContent = 'Status: Conexão perdida.';
            port = undefined;
        }
    }

    // Função para atualizar qual tela é exibida
    function updateScreen(buttonId) {
        // Esconde todas as telas
        screens.forEach(screen => screen.classList.add('hidden'));
        
        // Mostra a tela correspondente ao botão pressionado
        const screenToShow = document.getElementById(`screen${buttonId}`);
        if (screenToShow) {
            screenToShow.classList.remove('hidden');
        } else {
            // Se receber algo inesperado, volta para a tela inicial
            document.getElementById('initialScreen').classList.remove('hidden');
        }
    }
});