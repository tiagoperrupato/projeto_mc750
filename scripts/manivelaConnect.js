// scripts/manivelaConnect.js

function inicializarConexaoManivela() {
    const connectButton = document.getElementById('connectManivelaButton');
    const statusDisplay = document.getElementById('statusManivelaConnect');
    
    // Se o botão não existir na tela atual, não faz nada.
    if (!connectButton || !statusDisplay) {
        return;
    }

    let portManivela; 

    // Previne que o evento de clique seja adicionado múltiplas vezes
    if (connectButton.dataset.listener === 'true') {
        return;
    }
    connectButton.dataset.listener = 'true';

    if ('serial' in navigator) {
        connectButton.addEventListener('click', () => {
            if (portManivela) {
                portManivela.close();
                portManivela = undefined;
                statusDisplay.textContent = 'Status: Desconectado';
                connectButton.textContent = '🔌 Conectar Motor';
            } else {
                requestSerialPortForManivela();
            }
        });
    } else {
        statusDisplay.innerHTML = 'Seu navegador não suporta a <b>Web Serial API</b>.';
        connectButton.disabled = true;
    }

    async function requestSerialPortForManivela() {
        try {
            portManivela = await navigator.serial.requestPort();
            await portManivela.open({ baudRate: 9600 });
            statusDisplay.textContent = 'Status: Conectado ✅';
            connectButton.textContent = '🔌 Desconectar';
            listenToSerialPortManivela();
        } catch (error) {
            statusDisplay.textContent = `Erro: ${error.message}`;
        }
    }

    async function listenToSerialPortManivela() {
        const textDecoder = new TextDecoderStream();
        portManivela.readable.pipeTo(textDecoder.writable);
        const reader = textDecoder.readable.getReader();

        try {
            while (true) {
                const { value, done } = await reader.read();
                if (done) {
                    reader.releaseLock();
                    break;
                }
                const cleanValue = value.trim();
                if (cleanValue === '1' || cleanValue === '0') {
                    if (window.setGiro) {
                        window.setGiro(parseInt(cleanValue, 10));
                    }
                }
            }
        } catch (error) {
            statusDisplay.textContent = 'Status: Conexão perdida.';
            portManivela = undefined;
        }
    }
}