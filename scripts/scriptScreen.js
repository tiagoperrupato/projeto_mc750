function inicializarNavegacaoCards(containerSelector = '.cards-container') {
  const container = document.querySelector(containerSelector);
  if (!container) return;

  const cards = container.querySelectorAll('.card');
  const prevBtn = container.parentElement.querySelector('#prevBtn');
  const nextBtn = container.parentElement.querySelector('#nextBtn');
  if (!cards.length || !prevBtn) return;

  let currentIndex = 0;

  function showCard(index) {
    cards.forEach((card, i) => {
      card.classList.toggle('active', i === index);
    });
  }

  prevBtn.onclick = () => {
    speechSynthesis.cancel(); // Interrompe o áudio ao navegar
    currentIndex = (currentIndex - 1 + cards.length) % cards.length;
    showCard(currentIndex);
  };
  if (nextBtn) {
    nextBtn.onclick = () => {
      speechSynthesis.cancel(); 
      currentIndex = (currentIndex + 1) % cards.length;
      showCard(currentIndex);
    };
  }

  showCard(currentIndex);

    window.voltarHome = function (event) {
      event.preventDefault();
      
      const card = event.target.closest('.card');
      
      if (card && card.dataset.button) {
        const buttonId = card.dataset.button; //"Button1", "Button2", etc.
        if (window.simulateButton) {
        window.simulateButton(buttonId); // Mostra a tela correspondente ao botão
        } else {
        window.location.href = `screen${buttonId}.html`; // fallback: navega para a tela correspondente
        }
      } else {
        window.location.href = '../index.html'; // fallback: recarrega a página inicial
      }
  }


  // Leitura de texto
  window.lerTexto = function (button) {
    // Se já está falando, interrompe e retorna
    if (speechSynthesis.speaking) {
      speechSynthesis.cancel();
      return;
    }

    const card = button.closest('.card');
    if (!card) return;
    const text = card.innerText.replace(/🔈 Ouvir/g, '').trim();
    const utterance = new SpeechSynthesisUtterance(text);
    speechSynthesis.cancel();
    speechSynthesis.speak(utterance);
  };

  
}

// Disponibiliza globalmente
window.inicializarNavegacaoCards = inicializarNavegacaoCards;