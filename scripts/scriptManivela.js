(function() {
  // Proporção: x = 34 * 10 / 40
  const x = (34 * 10 / 40).toFixed(2);

  let timer = 0;
  let interval = null;
  let isGirando = false;

  const status = document.getElementById('statusManivela');
  const tempo = document.getElementById('tempoManivela');

  // Recebe 1 (girando) ou 0 (parado)
  window.setGiro = function(valor) {
    if (valor === 1 && !isGirando) {
      // Começa a girar
      isGirando = true;
      status.textContent = "Girando...";
      tempo.textContent = "Tempo: 0s";
      timer = 0;
      interval = setInterval(() => {
        timer++;
        tempo.textContent = `Tempo: ${timer}s`;
      }, 1000);
    } else if (valor === 0 && isGirando) {
      // Para de girar
      isGirando = false;
      clearInterval(interval);
      tempo.textContent = "";
      const tempoHospital = (timer * 34 / 40).toFixed(2);
      status.innerHTML = `Resultado: Parabéns!!<br>
        Você girou por <b>${timer}s</b>.<br>
        Você deu energia para um hospital por <b>${tempoHospital}s</b>!`;
    }
  };
})();
