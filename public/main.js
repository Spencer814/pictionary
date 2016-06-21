/*global $*/    

var newGame = $('#newword');
var wordbox = $('#words');
var eraseCanvas = $('#clear');
var submitGuess = $('#btn-guess');
var guessBox = $('#guess input');
var guesses = $('#guesses');
var brush = $('#draw');

var lineColor = 'black';
var lineSize = 5;

var words = [
    "word", "letter", "number", "person", "pen", "class", "people",
    "sound", "water", "side", "place", "man", "men", "woman", "women", "boy",
    "girl", "year", "day", "week", "month", "name", "sentence", "line", "air",
    "land", "home", "hand", "house", "picture", "animal", "mother", "father",
    "brother", "sister", "world", "head", "page", "country", "question",
    "answer", "school", "plant", "food", "sun", "state", "eye", "city", "tree",
    "farm", "story", "sea", "night", "day", "life", "north", "south", "east",
    "west", "child", "children", "example", "paper", "music", "river", "car",
    "foot", "feet", "book", "science", "room", "friend", "idea", "fish",
    "mountain", "horse", "watch", "color", "face", "wood", "list", "bird",
    "body", "dog", "family", "song", "door", "product", "wind", "ship", "area",
    "rock", "order", "fire", "problem", "piece", "top", "bottom", "king",
    "space"
];

$('.btn-group.pull-right').click(function() {
    if ($('#switch').hasClass('glyphicon-chevron-down')) {
        $('#switch').removeClass('glyphicon-chevron-down').addClass('glyphicon-chevron-up');
    } else if ($('#switch').hasClass('glyphicon-chevron-up')) {
        $('#switch').removeClass('glyphicon-chevron-up').addClass('glyphicon-chevron-down');
    }
});

$('.btn-group.pull-right').children('li').click(function() {
    if ($('#switch').hasClass('glyphicon-chevron-up')) {
        $('#switch').removeClass('glyphicon-chevron-up').addClass('glyphicon-chevron-down');
    } else if ($('#switch').hasClass('glyphicon-chevron-down')) {
        $('#switch').removeClass('glyphicon-chevron-down').addClass('glyphicon-chevron-up');
    }
});

function color(obj) {
    switch (obj.id) {
        case 'red': lineColor = '#FF0000';
        break;
        case 'orange': lineColor = '#FFA500';
        break;
        case 'yellow': lineColor = '#FFFF00';
        break;
        case 'green': lineColor = '#008000';
        break;
        case 'blue': lineColor = '#0000FF';
        break;
        case 'indigo': lineColor = '#4B0082';
        break;
        case 'violet': lineColor = '#7F00FF';
        break;
        case 'black': lineColor = '#000000';
        break;
        case 'white': lineColor = '#FFFFFF';
        break;
    }
}

function widen(obj) {
    switch (obj.id) {
        case 'one': lineSize = 1;
        break;
        case 'three': lineSize = 3;
        break;
        case 'five': lineSize = 5;
        break;
        case 'ten': lineSize = 10;
        break;
        case 'fifth': lineSize = 15;
        break;
        case 'twenty': lineSize = 20;
        break;
    }
}




function sketch() {
    this.canvas = $('#canvas');
    this.context = this.canvas[0].getContext('2d');
    this.canvas[0].width = this.canvas[0].offsetWidth;
    this.canvas[0].height = this.canvas[0].offsetHeight;
    this.lastX = -1;
    this.lastY = -1;
}

sketch.prototype.draw = function(position) {
    this.context.beginPath();
    if (position.lastX === -1) {
        position.lastX = position.x;
    }
    if (position.lastY === -1) {
        position.lastY = position.y;
    }
    this.context.moveTo(position.lastX, position.lastY);
    this.context.lineWidth = lineSize;
    this.context.lineJoin = 'round';
    this.context.lineCap = 'round';
    this.context.strokeStyle = lineColor;
    this.context.lineTo(position.x, position.y);
    this.context.closePath();
    this.context.stroke();
    $('.wedge').text(this.context.lineWidth);
    $('.glyphicon.glyphicon-tint.glyph').css('color', this.context.strokeStyle);
};

sketch.prototype.getPosition = function(pageX, pageY) {
    var offset = this.canvas.offset();
    return {
        x: pageX - offset.left,
        y: pageY - offset.top,
        lastX: this.lastX,
        lastY: this.lastY
    };
};

sketch.prototype.finalPosition = function() {
    this.lastX = -1;
    this.lastY = -1;
};

sketch.prototype.lastPosition = function(x, y) {
    this.lastX = x;
    this.lastY = y;
};

function erase() {
    this.canvas = $('#canvas');
    this.canvas[0].width = this.canvas[0].offsetWidth;
    this.canvas[0].height = this.canvas[0].offsetHeight;
}

function getWord() {
    return words[Math.floor(Math.random() * words.length)];
}

function newword(getWord) {
    wordbox.append('<span class="list-group-item list-group-item-success gameSet">' + getWord + '</span>');
}

function addGuess(guessed) {
    guesses.append('<span class="list-group-item list-group-item-success give">' + guessed + '</span>');
}

function easel(socket, sketch) {
    var drawing = false;
    var drawer = false;
    var canvas = $('#canvas');
    
    canvas.on('mousemove', function(event) {
        if (drawing || drawer) {
            var position = sketch.getPosition(event.pageX, event.pageY);
            sketch.draw(position);
            socket.emit('draw', position);
            sketch.lastPosition(position.x, position.y);
        }
    });
    
    canvas.on('mousedown', function(event) {
        var position = sketch.getPosition(event.pageX, event.pageY);
        sketch.draw(position);
        drawing = true;
        socket.emit('draw', position);
        sketch.lastPosition(position.x, position.y);
    });

    canvas.on('mouseup', function(event) {
        var position = sketch.getPosition(event.pageX, event.pageY);
        sketch.draw(position);
        drawing = false;
        socket.emit('draw', position);
        sketch.finalPosition(position.x, position.y);
    });

    canvas.on("mouseleave", function(event) {
        if (drawing || drawer) {
            var position = sketch.getPosition(event.pageX, event.pageY);
            sketch.draw(position);
            drawing = false;
            socket.emit('draw', position);
            sketch.finalPosition();
        }
    });
}

function sockets(socket, sketch) {
    
    socket.on('connected', function(drawList) {
        drawList.forEach(function(position) {
            sketch.draw(position);
        });
    });
    
    socket.on('word', getWord);
    
    socket.on('draw', function(position) {
        sketch.draw(position);
    }.bind(this));
    
    socket.on('erase', erase, function(position) {
        sketch.draw(position);
    }.bind(this));
    
    socket.on('guessed', function(guessed) {
        socket.emit(guesses.append('<span class="list-group-item list-group-item-warning take">' + guessed + '</span>'));
        console.log('Guess: ', guessed);
    });
    
    socket.on('disconnect', function(leave) {
        var exit = 'A user has disconnected';
        guesses.append('<span class="list-group-item list-group-item-danger bye">' + exit + '</span>');
    });
}
    
function pictionary() {
        var socket = io();
        var engine = new sketch();
        easel(socket, engine);
        sockets(socket, engine);
        
    brush.on('click', function() {
        sketch();
    })
    
    newGame.on('click', function() {
        erase();
        $('span').remove('.list-group-item');
        var word = getWord();
        newword(word);
        socket.emit('word');
        console.log(word);
        getWord();
    });

    eraseCanvas.on('click', function() {
        erase();
        socket.emit('erase');
    });
    
    guessBox.on('keydown', function(event) {
        if (event.keyCode != 13) {
            return;
        }
        var guessed = guessBox.val();
        addGuess(guessed);
        socket.emit('guessed', guessed);
        console.log(guessBox.val());
        guessBox.val('');
    });
    
    submitGuess.on('click', function(event) {
        var guessed = guessBox.val();
        addGuess(guessed);
        socket.emit('guessed', guessed);
        console.log(guessBox.val());
        guessBox.val('');
    });
}

$(document).ready(function() {
    pictionary();
});

$(function() {
  var fader = 150; // ms
  var timer = 400; // ms
  var colors = [
    '#4285F4', '#FBBC05', '#34A853', '#EA4335',
    '#146EB4', '#F65314', '#7CBB00', '#00A1F1',
    '#FFBB00', '#A4C639', '#7B0099', '#FF9900'
  ];

  // Initialize variables
  var $window = $(window);
  var $usernameInput = $('.usernameInput'); // Input for username
  var $guesses = $('#guesses'); // Messages area
  var $inputGuess = $('.inputGuess'); // Input message input box

  var $loginPage = $('.login.page'); // The login page
  var $gamePage = $('.game.page'); // The gameroom page

  // Prompt for setting a username
  var username;
  var connected = false;
  var $currentInput = $usernameInput.focus();

  var socket = io();

  function addParticipantsMessage (data) {
    var message = '';
    if (data.numUsers === 1) {
      message += "there's 1 participant";
    } else {
      message += "there are " + data.numUsers + " participants";
    }
    // log(message);
    guesses.append('<span class="list-group-item status disabled">' + message + '</span>');
  }

  // Sets the client's username
  function setUsername () {
    username = cleanInput($usernameInput.val().trim());

    // If the username is valid
    if (username) {
      $loginPage.fadeOut();
      $gamePage.show();
      $loginPage.off('click');
      $currentInput = $inputGuess.focus();

      // Tell the server your username
      socket.emit('add user', username);
    }
  }

  // Sends a game message
  function sendMessage () {
    var message = $inputGuess.val();
    // Prevent markup from being injected into the message
    message = cleanInput(message);
    // if there is a non-empty message and a socket connection
    if (message && connected) {
      $inputGuess.val('');
      addGameMessage({
        username: username,
        message: message
      });
      // tell server to execute 'new message' and send along one parameter
      socket.emit('new message', message);
    }
  }

  // Log a message
//   function log (message, options) {
//     var $el = $('<span class="list-group-item list-group-item-danger give">' + message + '</span>');
//     addMessageElement($el, options);
//   }

  // Adds the visual game message to the message list
  function addGameMessage (data, options) {
    options = options || {};

    var $usernameDiv = $('<span class="list-group-item list-group-item-warning give"/>')
      .text(data.username)
      .css('color', getUsernameColor(data.username));
    var $messageBodyDiv = $('<span class="list-group-item list-group-item-warning give"/>')
      .text(data.message);

    var $messageDiv = $('<span class="list-group-item list-group-item-success give"/>')
      .data('username', data.username)
      .append($usernameDiv, $messageBodyDiv);

    addMessageElement($messageDiv, options);
  }

  // Adds a message element to the messages and scrolls to the bottom
  // el - The element to add as a message
  // options.fade - If the element should fade-in (default = true)
  // options.prepend - If the element should prepend
  //   all other messages (default = false)
  function addMessageElement (el, options) {
    var $el = $(el);

    // Setup default options
    if (!options) {
      options = {};
    }
    if (typeof options.fade === 'undefined') {
      options.fade = true;
    }
    if (typeof options.prepend === 'undefined') {
      options.prepend = false;
    }

    // Apply options
    if (options.fade) {
      $el.hide().fadeIn(fader);
    }
    if (options.prepend) {
      $guesses.prepend($el);
    } else {
      $guesses.append($el);
    }
    $guesses[0].scrollTop = $guesses[0].scrollHeight;
  }

  // Prevents input from having injected markup
  function cleanInput (input) {
    return $('<span/>').text(input).text();
  }

  // Gets the color of a username through our hash function
  function getUsernameColor (username) {
    // Compute hash code
    var hash = 7;
    for (var i = 0; i < username.length; i++) {
       hash = username.charCodeAt(i) + (hash << 5) - hash;
    }
    // Calculate color
    var index = Math.abs(hash % colors.length);
    return colors[index];
  }

  // Keyboard events

  $window.keydown(function (event) {
    // Auto-focus the current input when a key is typed
    if (!(event.ctrlKey || event.metaKey || event.altKey)) {
      $currentInput.focus();
    }
    // When the client hits ENTER on their keyboard
    if (event.which === 13) {
      if (username) {
        sendMessage();
      } else {
        setUsername();
        sketch();
      }
    }
  });

//   $inputGuess.on('input', function() {
//     updateTyping();
//   });

  // Click events

  // Focus input when clicking anywhere on login page
  $loginPage.click(function () {
    $currentInput.focus();
  });

  // Focus input when clicking on the message input's border
  $inputGuess.click(function () {
    $inputGuess.focus();
  });

  // Socket events

  // Whenever the server emits 'login', log the login message
  socket.on('login', function (data) {
    connected = true;
    // Display the welcome message
    var message = "Make a guess";
    guesses.append('<span class="list-group-item list-group-item-success intro">' + message + '</span');
    addParticipantsMessage(data);
  });

  // Whenever the server emits 'new message', update the game body
  socket.on('new message', function (data) {
    addGameMessage(data);
  });

  // Whenever the server emits 'user joined', log it in the game body
  socket.on('user joined', function (data) {
    guesses.append('<span class="list-group-item list-group-item-danger bye">' + data.username + ' joined' + '</span');
    addParticipantsMessage(data);
  });

  // Whenever the server emits 'user left', log it in the game body
  socket.on('user left', function (data) {
    guesses.append('<span class="list-group-item list-group-item-danger bye">' + data.username + ' left' + '</span');
    addParticipantsMessage(data);
  });
});