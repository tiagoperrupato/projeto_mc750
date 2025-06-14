document.addEventListener('DOMContentLoaded', async () => {
    const connectButton = document.getElementById('connectButton');
    const statusDisplay = document.getElementById('status');
    let port;

    // Carrega as telas e espera todas terminarem antes de seguir
    await loadScreens();

    // Selecionar corretamente as telas
    const screens = document.querySelectorAll('.screen');

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
                requestSerialPort();
            }
        });
    } else {
        statusDisplay.innerHTML = 'Seu navegador não suporta a <b>Web Serial API</b>. Tente usar o Google Chrome ou Microsoft Edge.';
        connectButton.disabled = true;
    }

    async function requestSerialPort() {
        try {
            port = await navigator.serial.requestPort();
            await port.open({ baudRate: 9600 });
            statusDisplay.textContent = 'Status: Conectado ✅';
            connectButton.textContent = '🔌 Desconectar';
            listenToSerialPort();
        } catch (error) {
            statusDisplay.textContent = `Erro: ${error.message}`;
        }
    }

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

    async function loadScreens() {
        const promises = [];

        for (let i = 1; i <= 6; i++) {
            const screenDiv = document.getElementById(`screenButton${i}`);
            
            if (screenDiv) {
                const fetchPromise = fetch(`screens/screenButton${i}.html`)
                    .then(response => {
                        if (!response.ok) throw new Error(`Erro ao carregar Button${i}.html`);
                        return response.text();
                    })
                    .then(html => {
                        screenDiv.innerHTML = html;

                        if (typeof inicializarNavegacaoCards === 'function') {
                            inicializarNavegacaoCards(`#screenButton${i} .cards-container`);
                        }
                    })
                    .catch(err => {
                        screenDiv.innerHTML = `<p style="color:red;">Erro ao carregar conteúdo da tela ${i}.</p>`;
                        console.error(err);
                    });
                promises.push(fetchPromise);
            }
        }

        // Espera todos os fetches terminarem
        return Promise.all(promises);
    }

    function updateScreen(buttonId) {
        // Esconde todas as telas, inclusive a inicial
        document.querySelectorAll('.screen').forEach(el => {
            el.classList.add('hidden');
        });

        // Extrai número do botão (ex: Button3 -> 3)
        const buttonNumberMatch = buttonId.match(/\d+/);
        const buttonNumber = buttonNumberMatch ? buttonNumberMatch[0] : null;

        const header = document.getElementById('headerSection');

        if (buttonNumber) {
            const screenToShow = document.getElementById(`screenButton${buttonNumber}`);
            if (screenToShow) {
                screenToShow.classList.remove('hidden');
            }
            document.getElementById('testSection').classList.add('hidden');
            
            if(header) header.classList.add('hidden');
            document.getElementById('headerSection').classList.add('hidden');
        } else {
            // Mostra a tela inicial e a seção de teste
            const initial = document.getElementById('initialScreen');
            if (initial) initial.classList.remove('hidden');
            document.getElementById('testSection').classList.remove('hidden');
            
            if(header) header.classList.remove('hidden');
            document.getElementById('headerSection').classList.remove('hidden');
        }
    }

    // Permite simulação sem Arduino
    window.simulateButton = function (buttonId) {
        console.log(`Simulando botão: ${buttonId}`);
        updateScreen(buttonId);
    };
});
