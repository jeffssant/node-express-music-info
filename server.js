const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const socketIOClient = require('socket.io-client'); // Adicione esta linha para importar o cliente do Socket.IO

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

let musicInfo = {
  now: {
    artist: 'Desconhecido',
    music: 'Desconhecida',
    cover: 'https://local.gazetafm.com.br/wp-content/themes/wp-theme-gazeta-fm/assets/img/default_player_cover.png'
  },
  next: {
    artist: 'Desconhecido',
    music: 'Desconhecida'
  }
};

// Configura o endpoint para retornar as informações das músicas em formato JSON
app.get('/music-info', (req, res) => {
  console.log('Endpoint /music-info acessado');
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

// Adiciona um listener para o evento de atualização de músicas
socket.on('atualizacao-musicas', (data) => {
  console.log('Dados recebidos do WebSocket:', data);

  if (!data || !data.atual || !data.seguinte) {
    console.log('Dados inválidos recebidos do servidor.');
    return;
  }

  musicInfo = {
    now: {
      artist: data.atual.interprete ? data.atual.interprete.trim() : 'Desconhecido',
      music: data.atual.musica ? data.atual.musica.trim() : 'Desconhecida',
      cover: (data.atual.urlsImagensAlternativas?.home || '').trim() || 'https://local.gazetafm.com.br/wp-content/themes/wp-theme-gazeta-fm/assets/img/default_player_cover.png'
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
