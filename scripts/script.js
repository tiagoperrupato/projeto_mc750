// scripts/script.js

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

        for (let i = 1; i <= 7; i++) {
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
                        
                        if (i === 7) {
                            // Inicializa AMBAS as lógicas da tela 7
                            if (typeof inicializarLogicaManivela === 'function') {
                                inicializarLogicaManivela();
                            }
                            if (typeof inicializarConexaoManivela === 'function') {
                                inicializarConexaoManivela();
                            }
                        }
                    })
                    .catch(err => {
                        screenDiv.innerHTML = `<p style="color:red;">Erro ao carregar conteúdo da tela ${i}.</p>`;
                        console.error(err);
                    });
                promises.push(fetchPromise);
            }
        }

        return Promise.all(promises);
    }

    function updateScreen(buttonId) {
        document.querySelectorAll('.screen').forEach(el => {
            el.classList.add('hidden');
        });

        const header = document.getElementById('headerSection');
        const buttonNumberMatch = buttonId.match(/\d+/);
        const buttonNumber = buttonNumberMatch ? buttonNumberMatch[0] : null;

        if (buttonNumber) {
            const screenToShow = document.getElementById(`screenButton${buttonNumber}`);
            if (screenToShow) {
                screenToShow.classList.remove('hidden');
            }
            if(header) header.classList.add('hidden');
        } else {
            const initial = document.getElementById('initialScreen');
            if (initial) initial.classList.remove('hidden');
            if(header) header.classList.remove('hidden');
        }
    }
    window.updateScreen = updateScreen;

    window.lerDescription = function (button) {
      if (speechSynthesis.speaking) {
        speechSynthesis.cancel();
        return;
      }
      const desc = button.closest('.project-description');
      if (!desc) return;
      const text = desc.innerText.replace(/🔈 Ouvir/g, '').trim();
      const utterance = new SpeechSynthesisUtterance(text);
      speechSynthesis.speak(utterance);
    };

    window.simulateButton = function (buttonId) {
        console.log(`Simulando botão: ${buttonId}`);
        updateScreen(buttonId);
    };
});