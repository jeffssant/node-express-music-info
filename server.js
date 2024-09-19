const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const socketIOClient = require('socket.io-client'); // Cliente do Socket.IO

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

let musicInfo = {
  now: {
    artist: 'Desconhecido',
    music: 'Desconhecida',
    cover: 'https://gazetafm.com.br/wp-content/themes/wp-theme-gazeta-fm/assets/img/default_player_cover.png'
  },
  next: {
    artist: 'Desconhecido',
    music: 'Desconhecida'
  }
};

// Configura o endpoint para retornar as informações das músicas em formato JSON
app.get('/music-info', (req, res) => {
  console.log('Endpoint /music-info acessado');
  
  // Define o cabeçalho com a codificação UTF-8
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  
  // Envia o JSON com a informação da música
  res.json(musicInfo);
});

// Configura o cliente do Socket.IO para se conectar ao servidor
const socket = socketIOClient('https://app02.gazetafm.com.br', {
  transports: ['polling'],
  query: {
    imagensMusicas: JSON.stringify({
      atual: {
        home: {
          width: '250px',
          height: '250px'
        }
      },
      seguinte: {
        home: {
          width: '250px',
          height: '250px'
        }
      }
    })
  }
});

socket.on('atualizacao-musicas', (data) => {
  console.log('Dados recebidos do WebSocket:', data);

  if (!data || !data.atual || !data.seguinte) {
    console.log('Dados inválidos recebidos do servidor.');
    return;
  }

  // Atualiza as informações das músicas recebidas
  musicInfo = {
    now: {
      artist: data.atual.interprete ? data.atual.interprete.trim() : '',
      music: data.atual.musica ? data.atual.musica.trim() : 'Intervalo',
      cover: data.atual.urlImagemPrincipal ? data.atual.urlImagemPrincipal.trim().replace(/60x60/, '250x250') || 'https://local.gazetafm.com.br/wp-content/themes/wp-theme-gazeta-fm/assets/img/default_player_cover.png' : 'https://gazetafm.com.br/wp-content/themes/wp-theme-gazeta-fm/assets/img/default_player_cover.png',
    },
    next: {
      artist: data.seguinte.interprete ? data.seguinte.interprete.trim() : 'Desconhecido',
      music: data.seguinte.musica ? data.seguinte.musica.trim() : 'Desconhecida'
    }
  };

  console.log('Informações de música atualizadas:', musicInfo);
});

// Configura o servidor para escutar em uma porta específica
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Servidor Node.js rodando na porta ${PORT}`);
});
